import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteProduct,
  updateProduct,
} from "@/app/admin/(panel)/urunler/actions";
import { ProductForm } from "@/components/admin/product-form";
import { moneyInput } from "@/lib/admin/labels";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Ürünü düzenle" };
export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/urunler"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm text-espresso"
      >
        <span aria-hidden="true">←</span>
        Ürünlere dön
      </Link>
      <h1 className="font-display mt-5 text-4xl text-espresso">
        {product.name}
      </h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        submitLabel="Değişiklikleri kaydet"
        purpose="edit"
        deleteAction={deleteProduct.bind(null, product.id)}
        values={{
          name: product.name,
          slug: product.slug,
          summary: product.summary,
          description: product.description,
          price: moneyInput(product.price),
          compareAtPrice: product.compareAtPrice
            ? moneyInput(product.compareAtPrice)
            : "",
          sku: product.sku,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          categoryId: product.categoryId,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          images: product.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
          })),
        }}
      />
    </section>
  );
}
