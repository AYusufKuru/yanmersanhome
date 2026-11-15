import { randomBytes } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const maxBytes = 4 * 1024 * 1024;

const kinds = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export function isLocalImagePath(value: string) {
  return (
    /^\/(?:catalog|uploads)\/[A-Za-z0-9._/-]+$/.test(value) &&
    !value.includes("..")
  );
}

function sniff(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg" as const;
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png" as const;
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp" as const;
  }
  return null;
}

let tableReady: Promise<void> | null = null;

function ensureStoredImages() {
  tableReady ??= (async () => {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "StoredImage" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "contentType" TEXT NOT NULL,
      "bytes" BYTEA NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "StoredImage_pkey" PRIMARY KEY ("id")
    )`);
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "StoredImage_name_key" ON "StoredImage"("name")`,
    );
  })().catch((error: unknown) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

function uploadName(url: string) {
  if (!url.startsWith("/uploads/")) {
    return null;
  }
  const name = url.slice("/uploads/".length);
  if (!/^[\w.-]+$/.test(name)) {
    return null;
  }
  return name;
}

export async function saveUpload(
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (file.size > maxBytes) {
    return { error: "Görsel 4 MB'dan küçük olmalı." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind || file.type !== kinds[kind]) {
    return { error: "Görsel JPEG, PNG veya WebP olmalı." };
  }

  const filename = `${randomBytes(16).toString("hex")}.${kind}`;
  try {
    await ensureStoredImages();
    await prisma.storedImage.create({
      data: {
        name: filename,
        contentType: kinds[kind],
        bytes,
      },
    });
  } catch {
    return { error: "Görsel kaydedilemedi. Biraz küçültüp yeniden deneyin." };
  }
  return { url: `/uploads/${filename}` };
}

export async function removeStoredImages(urls: string[]) {
  const names = urls.flatMap((url) => {
    const name = uploadName(url);
    return name ? [name] : [];
  });
  if (names.length === 0) {
    return;
  }

  await prisma.storedImage
    .deleteMany({ where: { name: { in: names } } })
    .catch(() => undefined);
  await Promise.all(
    names.map((name) =>
      unlink(path.join(process.cwd(), "public", "uploads", name)).catch(
        () => undefined,
      ),
    ),
  );
}
