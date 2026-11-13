const points = [
  {
    title: "Seçilmiş malzeme",
    text: "Taş, ahşap ve keten. Gösteriş için değil, elde kalması için.",
  },
  {
    title: "Özenli paket",
    text: "Kırılgan parçalar ayrı sarılır, evinize dağılmadan ulaşır.",
  },
  {
    title: "Türkiye’ye gönderim",
    text: "Parçalar özenle paketlenir ve Türkiye içine yola çıkar.",
  },
];

export function Assurance() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-3 md:py-12">
        {points.map((point) => (
          <div key={point.title}>
            <h2 className="font-display text-xl text-espresso">
              {point.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{point.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
