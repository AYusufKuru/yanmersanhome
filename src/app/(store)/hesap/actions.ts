"use server";

import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addressSchema,
  accountIssue,
  customerLoginSchema,
  guestLookupSchema,
  passwordChangeSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  profileSchema,
  registerSchema,
} from "@/lib/account-schema";
import { rememberAddress } from "@/lib/account";
import {
  clearFailedAttempts,
  countRecentFailures,
  createAccountSession,
  destroyAccountSession,
  isLoginLocked,
  loginErrorMessage,
  loginLockMessage,
  recordLoginAttempt,
} from "@/lib/auth";
import { isUniqueConflict } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { mailConfigured, sendMail } from "@/lib/mail";
import {
  createPasswordReset,
  findPasswordReset,
  hashResetToken,
} from "@/lib/password-reset";
import { absoluteUrl } from "@/lib/site";
import {
  hashPassword,
  dummyPasswordHash,
  verifyPassword,
} from "@/lib/password";
import { requireCustomer } from "@/lib/account";

export type AccountState = {
  error?: string;
  saved?: boolean;
  sent?: boolean;
  email?: string;
};

export async function registerCustomer(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return { error: "Bu e-posta ile hesap var. Giriş yapın.", email };
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        passwordHash: await hashPassword(password),
        role: "CUSTOMER",
      },
      select: { id: true },
    });
    await createAccountSession(user.id);
  } catch (error) {
    unstable_rethrow(error);
    if (isUniqueConflict(error)) {
      return { error: "Bu e-posta ile hesap var. Giriş yapın.", email };
    }
    console.error("Müşteri kaydı tamamlanamadı.");
    return { error: "Hesap şu an açılamadı.", email };
  }

  redirect("/hesap");
}

export async function loginCustomer(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const { email, password } = parsed.data;

  try {
    const failures = await countRecentFailures(email);
    if (isLoginLocked(failures)) {
      return { error: loginLockMessage, email };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, role: true },
    });
    const passwordOk = await verifyPassword(
      password,
      user?.passwordHash ?? (await dummyPasswordHash()),
    );

    if (user?.role === "ADMIN" && passwordOk) {
      return { error: loginErrorMessage, email };
    }

    const allowed = Boolean(user && user.role === "CUSTOMER" && passwordOk);
    await recordLoginAttempt(email, allowed);
    if (!allowed || !user) {
      return { error: loginErrorMessage, email };
    }

    await clearFailedAttempts(email);
    await createAccountSession(user.id);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Müşteri girişi tamamlanamadı.");
    return { error: "Giriş şu an tamamlanamadı.", email };
  }

  redirect("/hesap");
}

export async function logoutCustomer() {
  await destroyAccountSession();
  redirect("/hesap");
}

export async function updateProfile(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const customer = await requireCustomer();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  await prisma.user.update({
    where: { id: customer.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    },
  });
  revalidatePath("/hesap", "layout");
  return { saved: true };
}

export async function requestPasswordReset(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const { email } = parsed.data;
  if (!mailConfigured()) {
    return { error: "Şifre sıfırlama şu an kullanılamıyor.", email };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      return { sent: true, email };
    }

    const token = await createPasswordReset(user.id);
    if (!token) {
      return { sent: true, email };
    }

    const link = absoluteUrl(`/hesap/sifre/${token}`);
    const sent = await sendMail({
      to: email,
      subject: "Yanmersanhome şifre yenileme",
      text: [
        "Şifrenizi yenilemek için bu bağlantıyı açın. Bağlantı 1 saat geçerlidir.",
        "",
        link,
        "",
        "Bu isteği siz yapmadıysanız mektubu yok sayın.",
      ].join("\n"),
    });
    if (!sent.sent) {
      await prisma.passwordReset.deleteMany({
        where: { tokenHash: hashResetToken(token) },
      });
      return { error: "E-posta şu an gönderilemedi.", email };
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("Şifre sıfırlama mektubu gönderilemedi.");
    return { error: "E-posta şu an gönderilemedi.", email };
  }

  return { sent: true, email };
}

export async function resetPassword(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = passwordResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  try {
    const reset = await findPasswordReset(parsed.data.token);
    if (!reset) {
      return { error: "Bağlantının süresi dolmuş. Yeni bağlantı isteyin." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await hashPassword(parsed.data.password) },
      }),
      prisma.passwordReset.deleteMany({ where: { userId: reset.userId } }),
      prisma.session.deleteMany({ where: { userId: reset.userId } }),
    ]);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Şifre sıfırlanamadı.");
    return { error: "Şifre şu an yenilenemedi." };
  }

  redirect("/hesap?bolum=giris");
}

export async function changePassword(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const customer = await requireCustomer();
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    nextPassword: formData.get("nextPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { id: customer.id },
    select: { passwordHash: true },
  });
  const passwordOk = await verifyPassword(
    parsed.data.currentPassword,
    user?.passwordHash ?? (await dummyPasswordHash()),
  );
  if (!passwordOk) {
    return { error: "Mevcut şifre hatalı." };
  }

  await prisma.user.update({
    where: { id: customer.id },
    data: { passwordHash: await hashPassword(parsed.data.nextPassword) },
  });
  return { saved: true };
}

export async function createAddress(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const customer = await requireCustomer();
  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    district: formData.get("district"),
    line: formData.get("line"),
    postalCode: formData.get("postalCode"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const count = await prisma.address.count({ where: { userId: customer.id } });
  if (count >= 10) {
    return { error: "En fazla 10 adres kaydedebilirsiniz." };
  }

  await rememberAddress(customer.id, parsed.data);
  revalidatePath("/hesap");
  revalidatePath("/odeme");
  return { saved: true };
}

export async function deleteAddress(formData: FormData) {
  const customer = await requireCustomer();
  const id = formData.get("id");
  if (typeof id === "string" && id) {
    await prisma.address.deleteMany({
      where: { id, userId: customer.id },
    });
  }
  revalidatePath("/hesap");
  revalidatePath("/odeme");
}

export async function lookupGuestOrder(
  _state: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const parsed = guestLookupSchema.safeParse({
    number: formData.get("number"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: accountIssue(parsed.error) };
  }

  const order = await prisma.order.findFirst({
    where: { number: parsed.data.number, email: parsed.data.email },
    select: { lookupToken: true },
  });
  if (!order) {
    return { error: "Bu numara ve e-posta ile sipariş yok." };
  }

  redirect(`/siparis/${order.lookupToken}`);
}
