import Link from "next/link";
import { PaymentMarks } from "@/components/storefront/payment-marks";
import { seller } from "@/lib/seller";

const legalLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/teslimat-iade", label: "Teslimat ve iade" },
  { href: "/gizlilik", label: "Gizlilik sözleşmesi" },
  { href: "/mesafeli-satis", label: "Mesafeli satış sözleşmesi" },
];

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
          <a
            href={`mailto:${seller.email}`}
            className="mt-4 inline-block text-sm text-cream"
          >
            {seller.email}
          </a>
          <ul className="mt-4 space-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PaymentMarks tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
