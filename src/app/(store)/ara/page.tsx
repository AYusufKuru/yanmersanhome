import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "./search-results";

export const metadata: Metadata = {
  title: "Arama",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-7xl px-4 py-16 text-muted sm:px-6">
          Aranıyor…
        </p>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
