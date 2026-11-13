import { prisma } from "@/lib/db";

export const rootCategories = [
  {
    slug: "mermer",
    name: "Mermer ürünler",
    description: "Doğal damarlı yüzeyler, sehpa ve tezgahlar.",
    sortOrder: 1,
  },
  {
    slug: "ahsap",
    name: "Ahşap ürünler",
    description: "Ceviz ve dişbudak. Sade, uzun ömürlü parçalar.",
    sortOrder: 2,
  },
  {
    slug: "kisisel",
    name: "Kişisel ürünler",
    description: "Bakım, keten ve günlük kullanılan küçük parçalar.",
    sortOrder: 3,
  },
] as const;

export async function ensureRootCategories() {
  for (const category of rootCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
}
