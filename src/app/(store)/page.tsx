import type { Metadata } from "next";
import { Assurance } from "@/components/storefront/assurance";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { HideHomeScrollbar } from "@/components/storefront/hide-home-scrollbar";
import { ProductGrid } from "@/components/storefront/product-grid";
import { heroSlides } from "@/data/hero";
import { mixedActiveProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export const instant = false;

export default async function Home() {
  const products = await mixedActiveProducts();

  return (
    <>
      <HideHomeScrollbar />
      <HeroSlider slides={heroSlides} />
      <Assurance />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.18em] text-coffee uppercase">
            Vitrin
          </p>
          <h2 className="font-display mt-3 text-3xl text-espresso sm:text-4xl">
            Seçilmiş parçalar
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Üç bölümden yayındaki parçalar, karışık sırayla.
          </p>
        </div>
        {products.length > 0 ? (
          <div className="mt-10">
            <ProductGrid products={products} />
          </div>
        ) : (
          <p className="mt-10 text-base text-muted">
            Yayındaki ürünler burada görünecek.
          </p>
        )}
      </section>
    </>
  );
}
