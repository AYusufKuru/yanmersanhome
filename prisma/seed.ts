import "dotenv/config";
import { prisma } from "../src/lib/db";
import { adminSeedSchema } from "../src/lib/auth-schema";
import { hashPassword } from "../src/lib/password";
import { ensureRootCategories } from "../src/lib/root-categories";
import { ensureShowcaseProducts } from "../src/lib/showcase-products";

async function main() {
  const parsed = adminSeedSchema.safeParse({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || "Yönetici",
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(" ");
    throw new Error(message);
  }

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, passwordHash, name, role: "ADMIN" },
    select: { id: true, email: true },
  });

  await prisma.session.deleteMany({ where: { userId: admin.id } });
  await ensureRootCategories();
  await ensureShowcaseProducts();
  console.log(`Yönetici hazır: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed başarısız.";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
