export const productsPerCategory = 3;

export type CategorySlug = "mermer" | "ahsap" | "kisisel";

export type Category = {
  slug: CategorySlug;
  name: string;
  eyebrow: string;
  description: string;
};

export type SampleProduct = {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  image: string;
  imageAlt: string;
  summary: string;
};

export type HeroSlide = {
  category: CategorySlug;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

export const categories: Category[] = [
  {
    slug: "mermer",
    name: "Mermer ürünler",
    eyebrow: "Mermer",
    description: "Doğal damarlı yüzeyler, sehpa ve tezgahlar.",
  },
  {
    slug: "ahsap",
    name: "Ahşap ürünler",
    eyebrow: "Ahşap",
    description: "Ceviz ve dişbudak. Sade, uzun ömürlü parçalar.",
  },
  {
    slug: "kisisel",
    name: "Kişisel ürünler",
    eyebrow: "Kişisel",
    description: "Bakım, keten ve günlük kullanılan küçük parçalar.",
  },
];

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

/**
 * Örnek vitrin. Yönetim panelinden gerçek ürün gelince bu liste kalkacak.
 * Fotoğraflar Unsplash lisanslı yer tutucudur; mağazanın kendi çekimi değildir.
 */
export const sampleProducts: SampleProduct[] = [
  {
    slug: "mermer-orta-sehpa",
    name: "Mermer orta sehpa",
    category: "mermer",
    price: 18400,
    image: "/catalog/mermer-1.jpg",
    imageAlt: "Pirinç ayaklı beyaz mermer orta sehpa",
    summary:
      "İnce pirinç ayak üzerinde yuvarlak mermer tabla. Oturma odasının ortasında sade durur.",
  },
  {
    slug: "mermer-mutfak-tezgahi",
    name: "Mermer mutfak tezgahı",
    category: "mermer",
    price: 32600,
    image: "/catalog/ahsap-2.jpg",
    imageAlt: "Beyaz mermer mutfak tezgahı ve ahşap raflar",
    summary:
      "Açık damarlı mermer tezgah. Gün ışığında yüzeyi sakin, temiz ve dayanıklı kalır.",
  },
  {
    slug: "gri-tas-duvar",
    name: "Gri taş duvar",
    category: "mermer",
    price: 14200,
    image: "/catalog/mermer-4.jpg",
    imageAlt: "Oturma odasında gri doğal taş duvar ve ahşap kaplama",
    summary:
      "Tek duvarda kullanılan doğal taş kaplama. Ahşapla yan yana durunca oda toplanır.",
  },
  {
    slug: "disbudak-tabure",
    name: "Dişbudak tabure",
    category: "ahsap",
    price: 2450,
    image: "/catalog/wood-chair.jpg",
    imageAlt: "Açık renk dişbudak ahşap tabure",
    summary:
      "Hafif dişbudak oturak. Mutfak adasının yanına veya konsolun altına konur.",
  },
  {
    slug: "ceviz-sunum",
    name: "Ceviz sunum tahtası",
    category: "ahsap",
    price: 1890,
    image: "/catalog/probe-2.jpg",
    imageAlt: "Koyu damarlı ceviz sunum tahtasının yakın planı",
    summary:
      "Kalın ceviz kütük. Damarın kendi çizgisi, parçanın süslemesi olur.",
  },
  {
    slug: "mese-yan-sehpa",
    name: "Meşe yan sehpa",
    category: "ahsap",
    price: 6400,
    image: "/catalog/kisisel-3.jpg",
    imageAlt: "Açık meşe ayaklı yan sehpa, üzerinde kase ve kitap",
    summary:
      "İnce meşe ayaklar, düz tabla. Koltuk yanında kitap ve bir kase için yeter.",
  },
  {
    slug: "bakim-yagi",
    name: "Bakım yağı",
    category: "kisisel",
    price: 890,
    image: "/catalog/kisisel-1.jpg",
    imageAlt: "Ahşap kaide üzerinde amber cam damlalıklı bakım yağı",
    summary:
      "Amber cam şişede günlük bakım yağı. Banyoda ve komodinin üstünde durur.",
  },
  {
    slug: "keten-ortu",
    name: "Keten örtü seti",
    category: "kisisel",
    price: 1240,
    image: "/catalog/probe-4.jpg",
    imageAlt: "Katlanmış doğal renklerde keten örtüler",
    summary:
      "Üç doğal tonda keten. Yıprandıkça yumuşar, sofrada ve banyoda kullanılır.",
  },
  {
    slug: "seramik-surahi",
    name: "Seramik sürahi seti",
    category: "kisisel",
    price: 1680,
    image: "/catalog/probe-3.jpg",
    imageAlt: "Benekli mat seramik sürahi, kase ve tabak",
    summary:
      "Elde biçimlenmiş mat seramik. Sürahi, kase ve tabak birlikte durur.",
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return sampleProducts.find((product) => product.slug === slug);
}

export function productsInCategory(slug: CategorySlug) {
  return sampleProducts.filter((product) => product.category === slug);
}

export function mixedProducts(perCategory = productsPerCategory) {
  const groups = categories.map((category) =>
    productsInCategory(category.slug).slice(0, perCategory),
  );
  const mixed: SampleProduct[] = [];

  for (let index = 0; index < perCategory; index += 1) {
    for (const group of groups) {
      const product = group[index];
      if (product) {
        mixed.push(product);
      }
    }
  }

  return mixed;
}

export function searchProducts(query: string) {
  const needle = query.trim().toLocaleLowerCase("tr-TR");
  if (!needle) {
    return [];
  }

  return sampleProducts.filter((product) => {
    const category = getCategory(product.category);
    const haystack = [product.name, product.summary, category?.name ?? ""]
      .join(" ")
      .toLocaleLowerCase("tr-TR");
    return haystack.includes(needle);
  });
}
