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
import {
  hashPassword,
  dummyPasswordHash,
  verifyPassword,
} from "@/lib/password";
import { requireCustomer } from "@/lib/account";

export type AccountState = { error?: string; saved?: boolean; email?: string };

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
