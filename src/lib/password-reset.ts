import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { connection } from "next/server";
import { prisma } from "@/lib/db";

const lifetimeMs = 60 * 60 * 1000;
const windowMs = 15 * 60 * 1000;
const requestCap = 3;

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }
  return secret;
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(`${authSecret()}.${token}`).digest("hex");
}

export async function createPasswordReset(userId: string) {
  const now = new Date();
  await prisma.passwordReset.deleteMany({
    where: { userId, expiresAt: { lt: now } },
  });
  const recent = await prisma.passwordReset.count({
    where: { userId, createdAt: { gte: new Date(now.getTime() - windowMs) } },
  });
  if (recent >= requestCap) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  await prisma.passwordReset.create({
    data: {
      userId,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(now.getTime() + lifetimeMs),
    },
  });
  return token;
}

export async function findPasswordReset(token: string) {
  if (!token || token.length > 200) {
    return null;
  }
  const row = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { id: true, userId: true, expiresAt: true },
  });
  await connection();
  if (!row || row.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  return row;
}
