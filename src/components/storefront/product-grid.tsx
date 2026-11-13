import Image from "next/image";
import Link from "next/link";
import { getCategory, type SampleProduct } from "@/data/sample-catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: SampleProduct }) {
  const category = getCategory(product.category);

  return (
    <article>
      <Link href={`/urun/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <p className="mt-3 text-[11px] tracking-[0.16em] text-coffee uppercase">
          {category?.eyebrow}
        </p>
        <h3 className="font-display mt-1 text-lg leading-snug text-espresso">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted">{formatPrice(product.price)}</p>
      </Link>
    </article>
  );
}

export function ProductGrid({ products }: { products: SampleProduct[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
