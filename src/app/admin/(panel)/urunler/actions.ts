"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { emptyToNull, firstIssue, productSchema } from "@/lib/admin/schema";
import {
  isLocalImagePath,
  removeStoredImages,
  saveUpload,
} from "@/lib/admin/images";
import { isUniqueConflict } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type FormState = { error?: string };

const imageLimit = 8;

function readProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    sku: formData.get("sku"),
    stock: formData.get("stock"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    categoryId: formData.get("categoryId"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    imageAlt: formData.get("imageAlt"),
    imagePath: formData.get("imagePath"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (!slug) {
    return { error: "Kısa adres üretilemedi." };
  }
  if (parsed.data.imagePath && !isLocalImagePath(parsed.data.imagePath)) {
    return { error: "Görsel yolu /catalog veya /uploads ile başlamalı." };
  }

  return { data: { ...parsed.data, slug } };
}

async function newImages(
  formData: FormData,
  alt: string,
): Promise<{ error: string } | { images: { url: string; alt: string }[] }> {
  const images: { url: string; alt: string }[] = [];
  const imagePath = String(formData.get("imagePath") ?? "").trim();
  if (imagePath) {
    images.push({ url: imagePath, alt: alt || "Ürün görseli" });
  }

  for (const value of formData.getAll("uploadedUrl")) {
    const url = String(value).trim();
    if (url && isLocalImagePath(url)) {
      images.push({ url, alt: alt || "Ürün görseli" });
    }
  }

  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);

  for (const file of files) {
    const saved = await saveUpload(file);
    if ("error" in saved) {
      await removeStoredImages(images.map((image) => image.url));
      return saved;
    }
    images.push({ url: saved.url, alt: alt || "Ürün görseli" });
  }

  return { images };
}

export async function storeAdminImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Görsel seçilmedi." };
  }
  const saved = await saveUpload(file);
  if ("error" in saved) {
    return saved;
  }
  return { url: saved.url };
}

export async function discardAdminImages(urls: string[]) {
  await requireAdmin();
  await removeStoredImages(urls.filter((url) => url.startsWith("/uploads/")));
}

export async function createProduct(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = readProduct(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { error: "Kategori bulunamadı." };
  }

  const uploaded = await newImages(formData, parsed.data.imageAlt);
  if ("error" in uploaded) {
    return uploaded;
  }
  if (uploaded.images.length > imageLimit) {
    await removeStoredImages(uploaded.images.map((image) => image.url));
    return { error: "En fazla 8 görsel eklenebilir." };
  }

  try {
    await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        summary: parsed.data.summary,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice,
        sku: parsed.data.sku,
        stock: parsed.data.stock,
        status: parsed.data.status,
        featured: parsed.data.featured,
        categoryId: parsed.data.categoryId,
        seoTitle: emptyToNull(parsed.data.seoTitle),
        seoDescription: emptyToNull(parsed.data.seoDescription),
        images: {
          create: uploaded.images.map((image, index) => ({
            ...image,
            sortOrder: index,
          })),
        },
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    await removeStoredImages(uploaded.images.map((image) => image.url));
    if (isUniqueConflict(error)) {
      return { error: "Bu kısa adres veya stok kodu kullanılıyor." };
    }
    console.error("Ürün kaydedilemedi.");
    return { error: "Ürün kaydedilemedi." };
  }

  revalidatePath("/admin/urunler");
  revalidatePath("/", "layout");
  redirect(`/admin/urunler?bildirim=eklendi&iz=${crypto.randomUUID()}`);
}

export async function updateProduct(
  id: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = readProduct(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const current = await prisma.product.findUnique({
    where: { id },
    select: { id: true, images: { select: { id: true, url: true } } },
  });
  if (!current) {
    return { error: "Ürün bulunamadı." };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { error: "Kategori bulunamadı." };
  }

  const removeIds = new Set(formData.getAll("removeImage").map(String));
  const kept = current.images.filter((image) => !removeIds.has(image.id));
  const uploaded = await newImages(formData, parsed.data.imageAlt);
  if ("error" in uploaded) {
    return uploaded;
  }
  if (kept.length + uploaded.images.length > imageLimit) {
    await removeStoredImages(uploaded.images.map((image) => image.url));
    return { error: "En fazla 8 görsel eklenebilir." };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        summary: parsed.data.summary,
        description: parsed.data.description,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice,
        sku: parsed.data.sku,
        stock: parsed.data.stock,
        status: parsed.data.status,
        featured: parsed.data.featured,
        categoryId: parsed.data.categoryId,
        seoTitle: emptyToNull(parsed.data.seoTitle),
        seoDescription: emptyToNull(parsed.data.seoDescription),
        images: {
          deleteMany: { id: { in: [...removeIds] } },
          create: uploaded.images.map((image, index) => ({
            ...image,
            sortOrder: kept.length + index,
          })),
        },
      },
    });
    await removeStoredImages(
      current.images
        .filter((image) => removeIds.has(image.id))
        .map((image) => image.url),
    );
  } catch (error) {
    unstable_rethrow(error);
    await removeStoredImages(uploaded.images.map((image) => image.url));
    if (isUniqueConflict(error)) {
      return { error: "Bu kısa adres veya stok kodu kullanılıyor." };
    }
    console.error("Ürün güncellenemedi.");
    return { error: "Ürün güncellenemedi." };
  }

  revalidatePath("/admin/urunler");
  revalidatePath("/", "layout");
  redirect(
    `/admin/urunler/${id}?bildirim=guncellendi&iz=${crypto.randomUUID()}`,
  );
}

export async function deleteProduct(id: string): Promise<FormState> {
  await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id },
    select: { images: { select: { url: true } } },
  });
  if (!product) {
    return { error: "Ürün bulunamadı." };
  }

  try {
    await prisma.product.delete({ where: { id } });
    await removeStoredImages(product.images.map((image) => image.url));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Ürün silinemedi.");
    return { error: "Ürün silinemedi." };
  }

  revalidatePath("/admin/urunler");
  revalidatePath("/", "layout");
  redirect(`/admin/urunler?bildirim=silindi&iz=${crypto.randomUUID()}`);
}
