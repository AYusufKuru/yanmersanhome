import { Assurance } from "@/components/storefront/assurance";
import { HeroSlider } from "@/components/storefront/hero-slider";
import { HideHomeScrollbar } from "@/components/storefront/hide-home-scrollbar";
import { ProductGrid } from "@/components/storefront/product-grid";
import { heroSlides, mixedProducts } from "@/data/sample-catalog";

export default function Home() {
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
            Mermer, ahşap ve kişisel ürünlerden üçer parça, karışık sırayla.
          </p>
        </div>
        <div className="mt-10">
          <ProductGrid products={mixedProducts()} />
        </div>
      </section>
    </>
  );
}
