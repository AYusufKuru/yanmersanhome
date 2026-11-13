import Link from "next/link";

export function Footer({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  return (
    <footer className="bg-espresso text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-3 md:py-16">
        <div>
          <p className="font-display text-3xl">Yanmersanhome</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-cream">
            Mermer, ahşap ve kişisel ürünler. Evde uzun süre kalan, sade
            parçalar.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-latte uppercase">
            Bölümler
          </p>
          <ul className="mt-4 space-y-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="text-sm text-cream"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-latte uppercase">
            İletişim
          </p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-cream">
            Ünvan, adres ve telefon işletme bilgisi eklendiğinde burada
            görünecek.
          </p>
        </div>
      </div>
    </footer>
  );
}
