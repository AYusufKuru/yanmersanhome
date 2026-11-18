import type { Metadata } from "next";
import Link from "next/link";
import { productStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Ürünler" };
export const instant = false;

const statusTone = {
  ACTIVE: "bg-cream text-espresso",
  DRAFT: "bg-background text-muted",
  ARCHIVED: "bg-background text-muted",
} as const;

export default async function ProductsPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      status: true,
      price: true,
      category: { select: { name: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-coffee uppercase">
            Vitrin
          </p>
          <h1 className="font-display mt-2 text-4xl text-espresso">Ürünler</h1>
        </div>
        <Link
          href="/admin/urunler/yeni"
          className="inline-flex h-11 items-center rounded-full bg-coffee px-5 text-sm text-background"
        >
          Yeni ürün
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="mt-8 text-base text-espresso/80">Henüz ürün yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-card shadow-[0_16px_40px_-30px_rgba(74,52,38,0.85)]">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-[0.14em] text-muted uppercase">
                <th className="px-5 py-3 font-normal">Ürün</th>
                <th className="px-4 py-3 font-normal">Kategori</th>
                <th className="px-4 py-3 text-right font-normal">Fiyat</th>
                <th className="px-4 py-3 text-right font-normal">Stok</th>
                <th className="px-4 py-3 font-normal">Durum</th>
                <th className="px-5 py-3 font-normal">Stok kodu</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="relative border-b border-line last:border-b-0 hover:bg-cream/50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/urunler/${product.id}`}
                      className="text-base text-espresso before:absolute before:inset-0 before:content-['']"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3.5 text-right text-espresso tabular-nums">
                    {Number(product.price).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="px-4 py-3.5 text-right text-espresso tabular-nums">
                    {product.stock}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs ${statusTone[product.status]}`}
                    >
                      {productStatusLabel[product.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{product.sku}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
