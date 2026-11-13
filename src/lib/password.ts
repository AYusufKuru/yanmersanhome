import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, saltText, hashText] = stored.split("$");
  if (scheme !== "scrypt" || !saltText || !hashText) {
    return false;
  }

  const expected = Buffer.from(hashText, "base64url");
  const actual = (await scryptAsync(
    password,
    Buffer.from(saltText, "base64url"),
    expected.length,
  )) as Buffer;

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

let dummyHash: string | null = null;

export async function dummyPasswordHash() {
  dummyHash ??= await hashPassword("not-a-real-password");
  return dummyHash;
}
