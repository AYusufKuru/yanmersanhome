import {
  GuaranteeIcon,
  PackageIcon,
  ShieldIcon,
  ShippingIcon,
} from "@/components/storefront/icons";

const points = [
  { title: "Güvenli ödeme", Icon: ShieldIcon },
  { title: "Ücretsiz kargo", Icon: ShippingIcon },
  { title: "Ömür boyu garanti", Icon: GuaranteeIcon },
  { title: "Özenli paket", Icon: PackageIcon },
];

export function Assurance() {
  return (
    <section className="border-y border-line bg-card" aria-label="Güvence">
      <ul className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-1 px-2 py-2.5 sm:gap-6 sm:px-6 sm:py-3">
        {points.map((point) => (
          <li
            key={point.title}
            className="flex min-w-0 items-center gap-1 text-espresso sm:gap-2"
          >
            <point.Icon className="h-3.5 w-3.5 shrink-0 text-coffee sm:h-5 sm:w-5" />
            <span className="text-[clamp(0.5rem,2.15vw,0.75rem)] tracking-[0.02em] whitespace-nowrap uppercase sm:text-xs sm:tracking-[0.14em]">
              {point.title}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
