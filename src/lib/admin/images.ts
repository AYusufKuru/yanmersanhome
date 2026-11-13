import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

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
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  return { url: `/uploads/${filename}` };
}

export async function removeStoredImages(urls: string[]) {
  await Promise.all(
    urls.map(async (url) => {
      if (!url.startsWith("/uploads/")) {
        return;
      }
      const name = url.slice("/uploads/".length);
      if (!/^[\w.-]+$/.test(name)) {
        return;
      }
      await unlink(path.join(process.cwd(), "public", "uploads", name)).catch(
        () => undefined,
      );
    }),
  );
}
