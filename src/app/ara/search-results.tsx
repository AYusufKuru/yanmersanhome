"use client";

import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/storefront/product-grid";
import { mixedProducts, searchProducts } from "@/data/sample-catalog";

export function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const results = query ? searchProducts(query) : mixedProducts();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Arama</h1>
      <p className="mt-3 text-base leading-7 text-muted">
        {query
          ? results.length > 0
            ? `“${query}” için ${results.length} parça.`
            : `“${query}” ile eşleşen parça yok.`
          : "Bir ürün veya malzeme adı yazın."}
      </p>
      <form action="/ara" className="mt-6">
        <label htmlFor="sayfa-arama" className="sr-only">
          Ürün ara
        </label>
        <input
          id="sayfa-arama"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Mermer, ceviz, keten…"
          className="h-12 w-full max-w-md rounded-full border border-line bg-card px-5 text-base text-espresso outline-none placeholder:text-muted"
        />
      </form>
      {results.length > 0 ? (
        <div className="mt-10">
          <ProductGrid products={results} />
        </div>
      ) : null}
    </section>
  );
}
