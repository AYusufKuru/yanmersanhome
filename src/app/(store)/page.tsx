import type { Metadata } from "next";
import Link from "next/link";
import { Assurance } from "@/components/storefront/assurance";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { ProductCard } from "@/components/storefront/product-grid";
import { heroSlides } from "@/data/hero";
import { homeCategoryRows } from "@/lib/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export const instant = false;

export default async function Home() {
  const rows = await homeCategoryRows();

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <Assurance />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
        <section className="surface-panel rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-xl">
            <p className="text-sm tracking-[0.18em] text-coffee uppercase">
              Vitrin
            </p>
            <h2 className="font-display mt-3 text-4xl text-espresso sm:text-5xl">
              Öne çıkan ürünler
            </h2>
          </div>
          {rows.length > 0 ? (
            <div className="mt-12 space-y-14">
              {rows.map((row) => (
                <div key={row.slug}>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-2xl text-espresso">
                      {row.name}
                    </h3>
                    <Link
                      href={`/kategori/${row.slug}`}
                      className="shrink-0 rounded-full border border-coffee bg-transparent px-4 py-1.5 text-sm tracking-[0.14em] whitespace-nowrap text-coffee uppercase transition-colors duration-300 hover:bg-coffee hover:text-card focus-visible:bg-coffee focus-visible:text-card motion-reduce:transition-none"
                    >
                      Daha fazlası
                      <span aria-hidden="true" className="ml-1.5 tracking-normal">
                        →
                      </span>
                    </Link>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
                    {row.products.map((product) => (
                      <ProductCard
                        key={product.slug}
                        product={product}
                        showCategory={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-lg text-espresso/80">
              Yayındaki ürünler burada görünecek.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
