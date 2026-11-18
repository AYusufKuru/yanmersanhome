import type { Metadata } from "next";
import Link from "next/link";
import { createCategory } from "@/app/admin/(panel)/kategoriler/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Yeni kategori" };
export const instant = false;

export default async function NewCategoryPage() {
  await requireAdmin();
  const parents = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/kategoriler"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm text-espresso"
      >
        <span aria-hidden="true">←</span>
        Kategorilere dön
      </Link>
      <h1 className="font-display mt-5 text-4xl text-espresso">
        Yeni kategori
      </h1>
      <CategoryForm
        action={createCategory}
        parents={parents}
        submitLabel="Kategoriyi kaydet"
        values={{
          name: "",
          slug: "",
          description: "",
          sortOrder: parents.length + 1,
          parentId: "",
          seoTitle: "",
          seoDescription: "",
          image: "",
        }}
      />
    </section>
  );
}
