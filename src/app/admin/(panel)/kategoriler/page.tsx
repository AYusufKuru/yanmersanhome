import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Kategoriler" };
export const instant = false;

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-4xl text-espresso">Kategoriler</h1>
        <Link
          href="/admin/kategoriler/yeni"
          className="ml-auto inline-flex h-12 items-center rounded-full bg-coffee px-5 text-sm text-background"
        >
          Yeni kategori
        </Link>
      </div>
      {categories.length === 0 ? (
        <p className="mt-8 text-base text-muted">Henüz kategori yok.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/admin/kategoriler/${category.id}`}
                className="flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="text-base text-espresso">{category.name}</span>
                <span className="text-sm text-muted sm:ml-auto">
                  {category.parent ? `${category.parent.name} / ` : ""}
                  {category.slug}
                </span>
                <span className="text-sm text-muted">
                  {category._count.products} ürün
                  {category._count.children > 0
                    ? ` · ${category._count.children} alt`
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
