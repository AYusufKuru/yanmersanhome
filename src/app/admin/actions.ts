"use server";

import { unstable_rethrow } from "next/navigation";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/auth-schema";
import {
  clearFailedAttempts,
  countRecentFailures,
  createSession,
  destroySession,
  isLoginLocked,
  loginErrorMessage,
  loginLockMessage,
  recordLoginAttempt,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dummyPasswordHash, verifyPassword } from "@/lib/password";

export type LoginState = {
  error?: string;
  email?: string;
};

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "E-posta ve şifre gerekli." };
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
    const allowed = Boolean(user && user.role === "ADMIN" && passwordOk);

    await recordLoginAttempt(email, allowed);

    if (!allowed || !user) {
      return { error: loginErrorMessage, email };
    }

    await clearFailedAttempts(email);
    await createSession(user.id);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Admin girişi tamamlanamadı.");
    return { error: "Giriş şu an tamamlanamadı.", email };
  }

  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/giris");
}
