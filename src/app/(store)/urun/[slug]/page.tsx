import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  getCategory,
  getProduct,
  productsInCategory,
  sampleProducts,
} from "@/data/sample-catalog";
import { formatPrice } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export function generateStaticParams() {
  return sampleProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    return { title: "Ürün" };
  }
  return {
    title: product.name,
    description: product.summary,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) {
    notFound();
  }

  const category = getCategory(product.category);
  const related = productsInCategory(product.category).filter(
    (item) => item.slug !== product.slug,
  );

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="lg:pt-6">
          {category ? (
            <Link
              href={`/kategori/${category.slug}`}
              className="text-xs tracking-[0.18em] text-coffee uppercase"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="font-display mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-espresso">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            {product.summary}
          </p>
          <p className="mt-8 max-w-md text-sm leading-6 text-muted">
            Sepete ekleme, sipariş adımı açıldığında burada olacak.
          </p>
        </div>
      </div>
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-espresso">Aynı bölümden</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
