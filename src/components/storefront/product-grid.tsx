import Link from "next/link";
import { ProductPhotos } from "@/components/storefront/product-photos";
import { categoryLabel, type StoreProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  showCategory = true,
}: {
  product: StoreProduct;
  showCategory?: boolean;
}) {
  const compare =
    product.compareAtPrice !== null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;

  return (
    <article>
      <Link href={`/urun/${product.slug}`} className="block">
        <ProductPhotos
          images={
            product.images.length > 0
              ? product.images
              : product.image
                ? [{ url: product.image, alt: product.imageAlt }]
                : []
          }
          fallbackAlt={product.name}
        />
        {showCategory ? (
          <p className="mt-4 text-xs tracking-[0.16em] text-coffee uppercase">
            {categoryLabel(product.categoryName)}
          </p>
        ) : null}
        <h3
          className={`font-display text-xl leading-snug text-espresso ${
            showCategory ? "mt-1.5" : "mt-4"
          }`}
        >
          {product.name}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-base">
          <span className="text-espresso">{formatPrice(product.price)}</span>
          {compare ? (
            <span className="text-muted line-through">
              {formatPrice(compare)}
            </span>
          ) : null}
        </p>
        {product.stock <= 0 ? (
          <p className="mt-1 text-xs text-muted">Tükendi</p>
        ) : null}
      </Link>
    </article>
  );
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-14">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
