import Image from "next/image";
import Link from "next/link";
import { categoryLabel, type StoreProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: StoreProduct }) {
  const compare =
    product.compareAtPrice !== null && product.compareAtPrice > product.price
      ? product.compareAtPrice
      : null;

  return (
    <article>
      <Link href={`/urun/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <p className="mt-3 text-[11px] tracking-[0.16em] text-coffee uppercase">
          {categoryLabel(product.categoryName)}
        </p>
        <h3 className="font-display mt-1 text-lg leading-snug text-espresso">
          {product.name}
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
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
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
