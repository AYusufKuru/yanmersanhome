import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { BackButton } from "@/components/storefront/back-button";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { JsonLd } from "@/components/storefront/json-ld";
import { ProductFeedback } from "@/components/storefront/product-feedback";
import { ProductGrid } from "@/components/storefront/product-grid";
import { RatingSummary } from "@/components/storefront/rating-summary";
import { ViewContent } from "@/components/storefront/track-events";
import { getCustomer } from "@/lib/account";
import { getAdmin } from "@/lib/auth";
import { categoryLabel, getActiveProduct } from "@/lib/catalog";
import { getProductConversation } from "@/lib/feedback";
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
  const [page, customer, admin] = await Promise.all([
    getActiveProduct(slug),
    getCustomer(),
    getAdmin(),
  ]);
  if (!page) {
    notFound();
  }

  const { product, related } = page;
  const conversation = await getProductConversation(
    product.id,
    customer?.id ?? null,
  );
  const compare =
    product.compareAtPrice !== null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;
  const facts = [
    ...product.details
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const colon = line.indexOf(":");
        if (colon === -1) {
          return { label: "Not", value: line };
        }
        return {
          label: line.slice(0, colon).trim(),
          value: line.slice(colon + 1).trim(),
        };
      })
      .filter((fact) => fact.label && fact.value),
    { label: "Bölüm", value: categoryLabel(product.categoryName) },
    { label: "Stok kodu", value: product.sku },
  ];
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
          ...(product.reviewCount > 0 && product.ratingAverage !== null
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.ratingAverage.toFixed(1),
                  reviewCount: product.reviewCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
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
      <div className="rounded-[2rem] bg-card/62 p-6 sm:p-8 lg:p-10">
        <BackButton fallback={`/kategori/${product.categorySlug}`} />
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />
          <div>
            <h1 className="font-display text-4xl leading-tight text-espresso sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <RatingSummary
                ratingAverage={product.ratingAverage}
                reviewCount={product.reviewCount}
                questionCount={product.questionCount}
                linked
                size="md"
              />
            </div>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-3">
              {product.stock > 0 ? (
                <span className="font-display text-4xl font-medium text-espresso">
                  {formatPrice(product.price)}
                </span>
              ) : (
                <span className="font-display text-4xl text-espresso/40">
                  Stokta yok
                </span>
              )}
              {compare && product.stock > 0 ? (
                <span className="text-base text-espresso/50 line-through">
                  {formatPrice(compare)}
                </span>
              ) : null}
            </p>
            {product.summary ? (
              <p className="mt-6 max-w-md text-lg leading-8 text-espresso/80">
                {product.summary}
              </p>
            ) : null}
            <AddToCart
              slug={product.slug}
              stock={product.stock}
              price={product.price}
            />
          </div>
        </div>
      </div>
      <ProductFeedback
        slug={product.slug}
        description={product.description}
        facts={facts}
        signedIn={customer !== null}
        isAdmin={admin !== null}
        ownReview={conversation.ownReview}
        reviews={conversation.reviews}
        questions={conversation.questions}
        reviewCount={product.reviewCount}
        questionCount={product.questionCount}
      />
      {related.length > 0 ? (
        <section className="surface-panel mt-8 rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="font-display text-3xl text-espresso">Aynı bölümden</h2>
          <div className="mt-10">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
