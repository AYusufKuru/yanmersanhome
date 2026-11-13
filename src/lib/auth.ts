import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sessionCookieName, sessionMaxAgeSeconds } from "@/lib/session-cookie";

const lockWindowMs = 15 * 60 * 1000;
const maxFailures = 5;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }
  return secret;
}

function hashToken(token: string) {
  return createHash("sha256").update(`${authSecret()}.${token}`).digest("hex");
}

export async function countRecentFailures(email: string) {
  const since = new Date(Date.now() - lockWindowMs);
  return prisma.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: since } },
  });
}

export function isLoginLocked(failures: number) {
  return failures >= maxFailures;
}

export const loginLockMessage =
  "Çok fazla başarısız deneme. 15 dakika sonra yeniden deneyin.";

export const loginErrorMessage = "E-posta veya şifre hatalı.";

export async function recordLoginAttempt(email: string, success: boolean) {
  await prisma.loginAttempt.create({ data: { email, success } });
}

export async function clearFailedAttempts(email: string) {
  await prisma.loginAttempt.deleteMany({
    where: { email, success: false },
  });
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  const jar = await cookies();
  jar.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(sessionCookieName);
}

export async function getAdmin(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(sessionCookieName)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  if (session.user.role !== "ADMIN") {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/giris");
  }
  return admin;
}
