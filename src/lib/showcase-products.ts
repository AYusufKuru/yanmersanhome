import { prisma } from "@/lib/db";

const showcase = [
  {
    slug: "mermer-orta-sehpa",
    name: "Mermer orta sehpa",
    category: "mermer",
    price: "18400.00",
    sku: "MERMER-ORTA-SEHPA",
    image: "/catalog/mermer-1.jpg",
    imageAlt: "Pirinç ayaklı beyaz mermer orta sehpa",
    summary:
      "İnce pirinç ayak üzerinde yuvarlak mermer tabla. Oturma odasının ortasında sade durur.",
  },
  {
    slug: "mermer-mutfak-tezgahi",
    name: "Mermer mutfak tezgahı",
    category: "mermer",
    price: "32600.00",
    sku: "MERMER-MUTFAK-TEZGAHI",
    image: "/catalog/ahsap-2.jpg",
    imageAlt: "Beyaz mermer mutfak tezgahı ve ahşap raflar",
    summary:
      "Açık damarlı mermer tezgah. Gün ışığında yüzeyi sakin, temiz ve dayanıklı kalır.",
  },
  {
    slug: "gri-tas-duvar",
    name: "Gri taş duvar",
    category: "mermer",
    price: "14200.00",
    sku: "GRI-TAS-DUVAR",
    image: "/catalog/mermer-4.jpg",
    imageAlt: "Oturma odasında gri doğal taş duvar ve ahşap kaplama",
    summary:
      "Tek duvarda kullanılan doğal taş kaplama. Ahşapla yan yana durunca oda toplanır.",
  },
  {
    slug: "disbudak-tabure",
    name: "Dişbudak tabure",
    category: "ahsap",
    price: "2450.00",
    sku: "DISBUDAK-TABURE",
    image: "/catalog/wood-chair.jpg",
    imageAlt: "Açık renk dişbudak ahşap tabure",
    summary:
      "Hafif dişbudak oturak. Mutfak adasının yanına veya konsolun altına konur.",
  },
  {
    slug: "ceviz-sunum",
    name: "Ceviz sunum tahtası",
    category: "ahsap",
    price: "1890.00",
    sku: "CEVIZ-SUNUM",
    image: "/catalog/probe-2.jpg",
    imageAlt: "Koyu damarlı ceviz sunum tahtasının yakın planı",
    summary:
      "Kalın ceviz kütük. Damarın kendi çizgisi, parçanın süslemesi olur.",
  },
  {
    slug: "mese-yan-sehpa",
    name: "Meşe yan sehpa",
    category: "ahsap",
    price: "6400.00",
    sku: "MESE-YAN-SEHPA",
    image: "/catalog/kisisel-3.jpg",
    imageAlt: "Açık meşe ayaklı yan sehpa, üzerinde kase ve kitap",
    summary:
      "İnce meşe ayaklar, düz tabla. Koltuk yanında kitap ve bir kase için yeter.",
  },
  {
    slug: "bakim-yagi",
    name: "Bakım yağı",
    category: "kisisel",
    price: "890.00",
    sku: "BAKIM-YAGI",
    image: "/catalog/kisisel-1.jpg",
    imageAlt: "Ahşap kaide üzerinde amber cam damlalıklı bakım yağı",
    summary:
      "Amber cam şişede günlük bakım yağı. Banyoda ve komodinin üstünde durur.",
  },
  {
    slug: "keten-ortu",
    name: "Keten örtü seti",
    category: "kisisel",
    price: "1240.00",
    sku: "KETEN-ORTU",
    image: "/catalog/probe-4.jpg",
    imageAlt: "Katlanmış doğal renklerde keten örtüler",
    summary:
      "Üç doğal tonda keten. Yıprandıkça yumuşar, sofrada ve banyoda kullanılır.",
  },
  {
    slug: "seramik-surahi",
    name: "Seramik sürahi seti",
    category: "kisisel",
    price: "1680.00",
    sku: "SERAMIK-SURAHI",
    image: "/catalog/probe-3.jpg",
    imageAlt: "Benekli mat seramik sürahi, kase ve tabak",
    summary:
      "Elde biçimlenmiş mat seramik. Sürahi, kase ve tabak birlikte durur.",
  },
] as const;

/** Var olan ürünün fiyatına, adına ve görsellerine dokunmaz. */
export async function ensureShowcaseProducts() {
  const categories = await prisma.category.findMany({
    where: { slug: { in: ["mermer", "ahsap", "kisisel"] } },
    select: { id: true, slug: true },
  });
  const categoryId = new Map(
    categories.map((category) => [category.slug, category.id]),
  );

  for (const product of showcase) {
    const id = categoryId.get(product.category);
    if (!id) {
      continue;
    }
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        name: product.name,
        summary: product.summary,
        description: product.summary,
        price: product.price,
        sku: product.sku,
        stock: 4,
        status: "ACTIVE",
        categoryId: id,
        images: {
          create: [{ url: product.image, alt: product.imageAlt, sortOrder: 0 }],
        },
      },
    });
  }
}
