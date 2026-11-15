import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import { JsonLd } from "@/components/storefront/json-ld";
import { categoryLabel, getStoreCategory } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStoreCategory(slug);
  if (!page) {
    return { title: "Bölüm" };
  }
  const title = page.category.seoTitle || page.category.name;
  const description =
    page.category.seoDescription || page.category.description || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/kategori/${slug}` },
    openGraph: { title, description, url: `/kategori/${slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const page = await getStoreCategory(slug);
  if (!page) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Ana sayfa",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: page.category.name,
              item: absoluteUrl(`/kategori/${page.category.slug}`),
            },
          ],
        }}
      />
      <div className="surface-panel rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <nav aria-label="Konum" className="text-sm text-espresso/70">
          <Link href="/" className="hover:text-espresso">
            Ana sayfa
          </Link>
        </nav>
        <p className="mt-5 text-sm tracking-[0.18em] text-coffee uppercase">
          {categoryLabel(page.category.name)}
        </p>
        <h1 className="font-display mt-3 text-4xl text-espresso sm:text-5xl">
          {page.category.name}
        </h1>
        {page.category.description ? (
          <p className="mt-4 max-w-lg text-lg leading-8 text-espresso/80">
            {page.category.description}
          </p>
        ) : null}
        {page.products.length > 0 ? (
          <div className="mt-12">
            <ProductGrid products={page.products} />
          </div>
        ) : (
          <p className="mt-12 text-lg text-espresso/80">
            Bu bölümde henüz yayındaki ürün yok.
          </p>
        )}
      </div>
    </section>
  );
}
