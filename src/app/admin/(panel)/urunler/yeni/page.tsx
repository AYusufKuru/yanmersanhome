import type { Metadata } from "next";
import Link from "next/link";
import { createProduct } from "@/app/admin/(panel)/urunler/actions";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Yeni ürün" };
export const instant = false;

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/urunler"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm text-espresso"
      >
        <span aria-hidden="true">←</span>
        Ürünlere dön
      </Link>
      <h1 className="font-display mt-5 text-4xl text-espresso">Yeni ürün</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Ürünü kaydet"
        values={{
          name: "",
          slug: "",
          summary: "",
          description: "",
          price: "",
          compareAtPrice: "",
          sku: "",
          stock: 0,
          status: "DRAFT",
          featured: false,
          categoryId: "",
          seoTitle: "",
          seoDescription: "",
          images: [],
        }}
      />
    </section>
  );
}
