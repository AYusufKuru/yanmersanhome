import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Ad en az 2 karakter olmalı." })
    .max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .refine((value) => value === "" || slugPattern.test(value), {
      error: "Kısa adres yalnızca küçük harf, rakam ve tire içerebilir.",
    }),
  description: z.string().trim().max(2000),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { error: "Sıra 0 veya daha büyük olmalı." })
    .max(9999),
  parentId: z.string().trim(),
  seoTitle: z.string().trim().max(160),
  seoDescription: z.string().trim().max(300),
  image: z.string().trim(),
});

const money = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s/g, "").replace(",", "."))
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    error: "Fiyat geçersiz.",
  })
  .transform((value) => Number(value).toFixed(2))
  .refine((value) => Number(value) > 0 && Number(value) <= 99_999_999.99, {
    error: "Fiyat geçersiz.",
  });

const optionalMoney = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s/g, "").replace(",", "."))
  .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), {
    error: "İndirimsiz fiyat geçersiz.",
  })
  .transform((value) => (value === "" ? null : Number(value).toFixed(2)));

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Ad en az 2 karakter olmalı." })
      .max(160),
    slug: z
      .string()
      .trim()
      .max(80)
      .refine((value) => value === "" || slugPattern.test(value), {
        error: "Kısa adres yalnızca küçük harf, rakam ve tire içerebilir.",
      }),
    summary: z.string().trim().max(300),
    description: z.string().trim().max(8000),
    details: z.string().trim().max(4000),
    price: money,
    compareAtPrice: optionalMoney,
    sku: z
      .string()
      .trim()
      .min(2, { error: "Stok kodu gerekli." })
      .max(64)
      .regex(/^[A-Za-z0-9-]+$/, {
        error: "Stok kodu harf, rakam ve tire içerebilir.",
      }),
    stock: z.coerce
      .number()
      .int()
      .min(0, { error: "Stok negatif olamaz." })
      .max(1_000_000),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    featured: z.boolean(),
    categoryId: z.string().trim().min(1, { error: "Kategori seçin." }),
    seoTitle: z.string().trim().max(160),
    seoDescription: z.string().trim().max(300),
    imageAlt: z.string().trim().max(200),
    imagePath: z.string().trim(),
  })
  .refine(
    (value) =>
      value.compareAtPrice === null ||
      Number(value.compareAtPrice) > Number(value.price),
    { error: "İndirimsiz fiyat, satış fiyatından yüksek olmalı." },
  );

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Bilgiler geçersiz.";
}

export function emptyToNull(value: string) {
  return value === "" ? null : value;
}
