import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  categories,
  getCategory,
  productsInCategory,
} from "@/data/sample-catalog";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return { title: "Bölüm" };
  }
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    notFound();
  }

  const products = productsInCategory(category.slug);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.18em] text-coffee uppercase">
        {category.eyebrow}
      </p>
      <h1 className="font-display mt-3 text-4xl text-espresso sm:text-5xl">
        {category.name}
      </h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-muted">
        {category.description}
      </p>
      <div className="mt-10">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
