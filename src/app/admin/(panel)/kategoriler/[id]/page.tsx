import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteCategory,
  updateCategory,
} from "@/app/admin/(panel)/kategoriler/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Kategoriyi düzenle" };
export const instant = false;

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true },
    }),
  ]);
  if (!category) {
    notFound();
  }

  const blocked = new Set<string>([category.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const item of categories) {
      if (
        item.parentId &&
        blocked.has(item.parentId) &&
        !blocked.has(item.id)
      ) {
        blocked.add(item.id);
        grew = true;
      }
    }
  }

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
        {category.name}
      </h1>
      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        submitLabel="Değişiklikleri kaydet"
        parents={categories
          .filter((item) => !blocked.has(item.id))
          .map((item) => ({ id: item.id, name: item.name }))}
        values={{
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          parentId: category.parentId ?? "",
          seoTitle: category.seoTitle ?? "",
          seoDescription: category.seoDescription ?? "",
          image: category.image ?? "",
        }}
      />
      <DeleteButton
        action={deleteCategory.bind(null, category.id)}
        label="Kategoriyi sil"
      />
    </section>
  );
}
