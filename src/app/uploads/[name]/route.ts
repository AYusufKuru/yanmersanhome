import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function imageResponse(bytes: Uint8Array, contentType: string) {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!/^[\w.-]+$/.test(name)) {
    return new Response("Bulunamadı", { status: 404 });
  }

  try {
    const stored = await prisma.storedImage.findUnique({ where: { name } });
    if (stored) {
      return imageResponse(stored.bytes, stored.contentType);
    }
  } catch {
    // Tablo henüz yoksa diskteki eski dosyaya düşülür.
  }

  const contentType = types[name.slice(name.lastIndexOf(".") + 1).toLowerCase()];
  if (!contentType) {
    return new Response("Bulunamadı", { status: 404 });
  }

  try {
    const file = await readFile(
      path.join(process.cwd(), "public", "uploads", name),
    );
    return imageResponse(file, contentType);
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
