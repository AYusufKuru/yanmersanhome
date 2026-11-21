import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    ...["/hakkimizda", "/teslimat-iade", "/gizlilik", "/mesafeli-satis"].map(
      (path) => ({
        url: absoluteUrl(path),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      }),
    ),
    ...categories.map((category) => ({
      url: absoluteUrl(`/kategori/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/urun/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
