import {
  MaterialIcon,
  PackageIcon,
  ShippingIcon,
} from "@/components/storefront/icons";

const points = [
  {
    title: "Seçilmiş malzeme",
    text: "Taş, ahşap ve keten. Gösteriş için değil, elde kalması için.",
    Icon: MaterialIcon,
  },
  {
    title: "Özenli paket",
    text: "Kırılgan parçalar ayrı sarılır, evinize dağılmadan ulaşır.",
    Icon: PackageIcon,
  },
  {
    title: "Türkiye’ye gönderim",
    text: "Parçalar özenle paketlenir ve Türkiye içine yola çıkar.",
    Icon: ShippingIcon,
  },
];

export function Assurance() {
  return (
    <section className="surface-panel rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
      <div className="grid gap-10 md:grid-cols-3 md:gap-12">
        {points.map((point) => (
          <div key={point.title} className="text-center">
            <h2 className="font-display text-2xl text-espresso">
              {point.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-espresso/80">
              {point.text}
            </p>
            <point.Icon className="mx-auto mt-5 h-8 w-8 text-coffee" />
          </div>
        ))}
      </div>
    </section>
  );
}
