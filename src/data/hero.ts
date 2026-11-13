export type HeroSlide = {
  category: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    category: "mermer",
    eyebrow: "Mermer",
    title: "Sakin yüzeyler",
    text: "Tezgah ve sehpalarda doğal taşın kendi damarı durur.",
    image: "/catalog/ahsap-2.jpg",
    imageAlt: "Mermer tezgahlı, ahşap raflı aydınlık bir mutfak",
  },
  {
    category: "ahsap",
    eyebrow: "Ahşap",
    title: "Sıcak doku",
    text: "Ceviz, dişbudak ve meşe. Evin içinde uzun yıllar kalan parçalar.",
    image: "/catalog/marble-bath-2.jpg",
    imageAlt: "Ahşap kaplamalı modern bir ev cephesi",
  },
  {
    category: "kisisel",
    eyebrow: "Kişisel",
    title: "Güne kalan ritüel",
    text: "Bakım, keten ve elde tutulan küçük objeler.",
    image: "/catalog/hero-kisisel.jpg",
    imageAlt:
      "Havlu, bakım şişesi, mum ve lalelerden oluşan durgun bir kompozisyon",
  },
];
