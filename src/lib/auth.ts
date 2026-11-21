import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { accountCookieName, accountMaxAgeSeconds } from "@/lib/account-cookie";
import { sessionCookieName, sessionMaxAgeSeconds } from "@/lib/session-cookie";

const lockWindowMs = 15 * 60 * 1000;
const maxFailures = 5;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER";
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

async function writeSessionCookie(
  userId: string,
  cookieName: string,
  maxAge: number,
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    expires: expiresAt,
  });
}

async function clearSessionCookie(cookieName: string) {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(cookieName);
}

export async function createSession(userId: string) {
  await writeSessionCookie(userId, sessionCookieName, sessionMaxAgeSeconds);
}

export async function createAccountSession(userId: string) {
  await writeSessionCookie(userId, accountCookieName, accountMaxAgeSeconds);
}

export async function destroySession() {
  await clearSessionCookie(sessionCookieName);
}

export async function destroyAccountSession() {
  await clearSessionCookie(accountCookieName);
}

export async function getSessionUser(
  cookieName: string,
): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      },
    },
  });

  await connection();
  const now = Date.now();
  if (!session || session.expiresAt.getTime() <= now) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return session.user;
}

export async function getAdmin(): Promise<AdminUser | null> {
  const user = await getSessionUser(sessionCookieName);
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/giris");
  }
  return admin;
}
