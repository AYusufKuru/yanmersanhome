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
      sortOrder: true,
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-coffee uppercase">
            Vitrin
          </p>
          <h1 className="font-display mt-2 text-4xl text-espresso">
            Kategoriler
          </h1>
        </div>
        <Link
          href="/admin/kategoriler/yeni"
          className="inline-flex h-11 items-center rounded-full bg-coffee px-5 text-sm text-background"
        >
          Yeni kategori
        </Link>
      </div>
      {categories.length === 0 ? (
        <p className="mt-8 text-base text-espresso/80">Henüz kategori yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-card shadow-[0_16px_40px_-30px_rgba(74,52,38,0.85)]">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-[0.14em] text-muted uppercase">
                <th className="px-5 py-3 font-normal">Kategori</th>
                <th className="px-4 py-3 font-normal">Üst</th>
                <th className="px-4 py-3 font-normal">Kısa adres</th>
                <th className="px-4 py-3 text-right font-normal">Ürün</th>
                <th className="px-4 py-3 text-right font-normal">Alt</th>
                <th className="px-5 py-3 text-right font-normal">Sıra</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="relative border-b border-line last:border-b-0 hover:bg-cream/50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/kategoriler/${category.id}`}
                      className="text-base text-espresso before:absolute before:inset-0 before:content-['']"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted">
                    {category.parent?.name ?? "Kök"}
                  </td>
                  <td className="px-4 py-3.5 text-muted">{category.slug}</td>
                  <td className="px-4 py-3.5 text-right text-espresso tabular-nums">
                    {category._count.products}
                  </td>
                  <td className="px-4 py-3.5 text-right text-espresso tabular-nums">
                    {category._count.children}
                  </td>
                  <td className="px-5 py-3.5 text-right text-espresso tabular-nums">
                    {category.sortOrder}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
