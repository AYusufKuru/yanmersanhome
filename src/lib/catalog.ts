import { connection } from "next/server";
import { prisma } from "@/lib/db";
import {
  emptyFeedback,
  feedbackStats,
  type ProductFeedback,
} from "@/lib/feedback";

export type StoreCategory = {
  slug: string;
  name: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  details: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string;
  image: string | null;
  imageAlt: string;
  images: { url: string; alt: string }[];
  categorySlug: string;
  categoryName: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ratingAverage: number | null;
  reviewCount: number;
  questionCount: number;
};

const perCategory = 3;

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  details: string;
  price: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  stock: number;
  sku: string;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
  category: { slug: string; name: string };
  images: { url: string; alt: string }[];
};

const productSelect = {
  id: true,
  slug: true,
  name: true,
  summary: true,
  description: true,
  details: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  sku: true,
  seoTitle: true,
  seoDescription: true,
  categoryId: true,
  category: { select: { slug: true, name: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { url: true, alt: true },
  },
};

function money(value: { toString(): string } | null) {
  if (!value) {
    return null;
  }
  const amount = Number(value.toString());
  return Number.isFinite(amount) ? amount : null;
}

function toProduct(row: ProductRow, feedback: ProductFeedback): StoreProduct {
  const images = row.images.filter((image) => image.url);
  const first = images[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    details: row.details,
    price: money(row.price) ?? 0,
    compareAtPrice: money(row.compareAtPrice),
    stock: row.stock,
    sku: row.sku,
    image: first?.url ?? null,
    imageAlt: first?.alt || row.name,
    images,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ratingAverage: feedback.ratingAverage,
    reviewCount: feedback.reviewCount,
    questionCount: feedback.questionCount,
  };
}

async function present(rows: ProductRow[]) {
  const stats = await feedbackStats(rows.map((row) => row.id));
  return rows.map((row) => toProduct(row, stats.get(row.id) ?? emptyFeedback));
}

export function categoryLabel(name: string) {
  return name.replace(/\s+ürünler$/iu, "");
}

export async function listRootCategories(): Promise<StoreCategory[]> {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}

function pickRandom<T>(items: T[], count: number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy.slice(0, count);
}

async function productsByRoot() {
  const [roots, rows, nodes] = await Promise.all([
    listRootCategories(),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
      select: productSelect,
    }),
    prisma.category.findMany({
      select: { id: true, parentId: true, slug: true },
    }),
  ]);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const categoryOf = new Map(rows.map((row) => [row.slug, row.categoryId]));

  function rootSlug(categoryId: string) {
    let current = byId.get(categoryId);
    const seen = new Set<string>();
    while (current?.parentId && !seen.has(current.id)) {
      seen.add(current.id);
      const parent = byId.get(current.parentId);
      if (!parent) {
        break;
      }
      current = parent;
    }
    return current?.slug ?? "";
  }

  const groups = new Map(
    roots.map((root) => [root.slug, [] as StoreProduct[]]),
  );
  for (const product of await present(rows)) {
    const categoryId = categoryOf.get(product.slug);
    if (!categoryId) {
      continue;
    }
    groups.get(rootSlug(categoryId))?.push(product);
  }

  return { roots, groups };
}

export async function mixedActiveProducts() {
  const { roots, groups } = await productsByRoot();
  const mixed: StoreProduct[] = [];
  for (let index = 0; index < perCategory; index += 1) {
    for (const root of roots) {
      const product = groups.get(root.slug)?.[index];
      if (product) {
        mixed.push(product);
      }
    }
  }
  return mixed;
}

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  href: string;
};

export async function heroSlides() {
  await connection();
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      featured: true,
      images: { some: {} },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      slug: true,
      name: true,
      summary: true,
      category: { select: { name: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
    },
  });

  return products.flatMap((product) => {
    const image = product.images[0];
    if (!image) {
      return [];
    }
    return [
      {
        id: product.id,
        eyebrow: product.category.name,
        title: product.name,
        text: product.summary,
        image: image.url,
        imageAlt: image.alt || product.name,
        href: `/urun/${product.slug}`,
      },
    ];
  });
}

export async function homeCategoryRows() {
  await connection();
  const { roots, groups } = await productsByRoot();
  return roots.flatMap((root) => {
    const products = pickRandom(groups.get(root.slug) ?? [], perCategory);
    if (products.length === 0) {
      return [];
    }
    return [{ slug: root.slug, name: root.name, products }];
  });
}

export async function getStoreCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
  if (!category) {
    return null;
  }

  const nodes = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });
  const ids = [category.id];
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of nodes) {
      if (
        node.parentId &&
        ids.includes(node.parentId) &&
        !ids.includes(node.id)
      ) {
        ids.push(node.id);
        grew = true;
      }
    }
  }

  const rows = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: { in: ids } },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    select: productSelect,
  });

  return {
    category: {
      slug: category.slug,
      name: category.name,
      description: category.description,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
    },
    products: await present(rows),
  };
}

export async function getActiveProduct(slug: string) {
  const row = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: productSelect,
  });
  if (!row) {
    return null;
  }

  const relatedRows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: row.categoryId,
      slug: { not: row.slug },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: 3,
    select: productSelect,
  });

  const listed = await present([row, ...relatedRows]);
  const product = listed[0];
  if (!product) {
    return null;
  }

  return {
    product,
    related: listed.slice(1),
  };
}

export async function searchActiveProducts(query: string) {
  const needle = query.trim().slice(0, 80);
  if (!needle) {
    return mixedActiveProducts();
  }

  const rows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: needle, mode: "insensitive" } },
        { summary: { contains: needle, mode: "insensitive" } },
        { description: { contains: needle, mode: "insensitive" } },
        { sku: { contains: needle, mode: "insensitive" } },
        { category: { name: { contains: needle, mode: "insensitive" } } },
      ],
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    take: 24,
    select: productSelect,
  });
  return present(rows);
}
