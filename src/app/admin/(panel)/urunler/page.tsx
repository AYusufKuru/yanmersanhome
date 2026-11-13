import type { Metadata } from "next";
import Link from "next/link";
import { productStatusLabel } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Ürünler" };
export const instant = false;

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
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-4xl text-espresso">Ürünler</h1>
        <Link
          href="/admin/urunler/yeni"
          className="ml-auto inline-flex h-12 items-center rounded-full bg-coffee px-5 text-sm text-background"
        >
          Yeni ürün
        </Link>
      </div>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Yayındaki ürünler vitrinde görünür. Taslak ve arşiv müşteriye açılmaz.
      </p>
      {products.length === 0 ? (
        <p className="mt-8 text-base text-muted">Henüz ürün yok.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/admin/urunler/${product.id}`}
                className="flex min-h-16 flex-col justify-center rounded-2xl border border-line bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="text-base text-espresso">{product.name}</span>
                <span className="text-sm text-muted sm:ml-auto">
                  {product.category.name}
                </span>
                <span className="text-sm text-espresso">
                  {Number(product.price).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </span>
                <span className="text-sm text-muted">
                  {productStatusLabel[product.status]} · stok {product.stock} ·{" "}
                  {product.sku}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
