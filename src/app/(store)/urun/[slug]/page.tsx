import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { JsonLd } from "@/components/storefront/json-ld";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ViewContent } from "@/components/storefront/track-events";
import { getActiveProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getActiveProduct(slug);
  if (!page) {
    return { title: "Ürün" };
  }
  const title = page.product.seoTitle || page.product.name;
  const description =
    page.product.seoDescription || page.product.summary || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/urun/${slug}` },
    openGraph: {
      title,
      description,
      url: `/urun/${slug}`,
      images: page.product.image
        ? [{ url: page.product.image, alt: page.product.imageAlt }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const page = await getActiveProduct(slug);
  if (!page) {
    notFound();
  }

  const { product, related } = page;
  const compare =
    product.compareAtPrice !== null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;
  const text = product.description || product.summary;
  const pageUrl = absoluteUrl(`/urun/${product.slug}`);
  const description = product.summary || product.description || product.name;

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12 lg:pb-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description,
          sku: product.sku,
          image: product.images.map((image) => absoluteUrl(image.url)),
          brand: { "@type": "Brand", name: "Yanmersanhome" },
          offers: {
            "@type": "Offer",
            priceCurrency: "TRY",
            price: product.price.toFixed(2),
            availability:
              product.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: pageUrl,
          },
        }}
      />
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
              name: product.categoryName,
              item: absoluteUrl(`/kategori/${product.categorySlug}`),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: pageUrl,
            },
          ],
        }}
      />
      <ViewContent
        slug={product.slug}
        name={product.name}
        value={product.price}
      />
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="grid gap-3">
          {product.images.length > 0 ? (
            product.images.map((image, index) => (
              <div
                key={image.url}
                className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-cream"
              >
                <Image
                  src={image.url}
                  alt={image.alt || product.name}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="aspect-[4/5] rounded-3xl bg-cream" />
          )}
        </div>
        <div className="lg:pt-6">
          <nav aria-label="Konum" className="text-sm text-muted">
            <Link href="/" className="hover:text-coffee">
              Ana sayfa
            </Link>
            <span aria-hidden="true"> / </span>
            <Link
              href={`/kategori/${product.categorySlug}`}
              className="hover:text-coffee"
            >
              {product.categoryName}
            </Link>
          </nav>
          <h1 className="font-display mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-lg text-espresso">
            <span>{formatPrice(product.price)}</span>
            {compare ? (
              <span className="text-base text-muted line-through">
                {formatPrice(compare)}
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-sm text-muted">
            {product.stock > 0 ? "Stokta" : "Şu an stokta yok"}
          </p>
          {text ? (
            <p className="mt-6 max-w-md text-base leading-7 whitespace-pre-line text-muted">
              {text}
            </p>
          ) : null}
          <AddToCart
            slug={product.slug}
            stock={product.stock}
            price={product.price}
          />
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
