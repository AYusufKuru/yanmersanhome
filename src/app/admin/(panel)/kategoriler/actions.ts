"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, emptyToNull, firstIssue } from "@/lib/admin/schema";
import {
  isLocalImagePath,
  removeStoredImages,
  saveUpload,
} from "@/lib/admin/images";
import { isUniqueConflict } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

export type FormState = { error?: string };

async function descendantIds(id: string) {
  const ids = new Set<string>();
  const pending = [id];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      break;
    }
    const children = await prisma.category.findMany({
      where: { parentId: current },
      select: { id: true },
    });
    for (const child of children) {
      if (!ids.has(child.id)) {
        ids.add(child.id);
        pending.push(child.id);
      }
    }
  }
  return ids;
}

async function readImage(formData: FormData): Promise<
  { error: string } | { url: string | null; uploaded: string | null }
> {
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    if ("error" in saved) {
      return saved;
    }
    return { url: saved.url, uploaded: saved.url };
  }

  const image = String(formData.get("image") ?? "").trim();
  if (image && !isLocalImagePath(image)) {
    return {
      error: "Görsel yolu /catalog veya /uploads ile başlamalı.",
    };
  }
  return {
    url: image === "" ? null : image,
    uploaded: null as string | null,
  };
}

function readCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    parentId: formData.get("parentId"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    image: formData.get("image"),
  });
  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (!slug) {
    return { error: "Kısa adres üretilemedi." };
  }

  return {
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      sortOrder: parsed.data.sortOrder,
      parentId: emptyToNull(parsed.data.parentId),
      seoTitle: emptyToNull(parsed.data.seoTitle),
      seoDescription: emptyToNull(parsed.data.seoDescription),
    },
  };
}

export async function createCategory(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = readCategory(formData);
  if ("error" in parsed) {
    return parsed;
  }

  let uploaded: string | null = null;
  try {
    const image = await readImage(formData);
    if ("error" in image) {
      return image;
    }
    uploaded = image.uploaded;
    if (parsed.data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parsed.data.parentId },
        select: { id: true },
      });
      if (!parent) {
        if (uploaded) {
          await removeStoredImages([uploaded]);
        }
        return { error: "Üst kategori bulunamadı." };
      }
    }
    await prisma.category.create({
      data: { ...parsed.data, image: image.url },
    });
  } catch (error) {
    unstable_rethrow(error);
    if (uploaded) {
      await removeStoredImages([uploaded]);
    }
    if (isUniqueConflict(error)) {
      return { error: "Bu kısa adres kullanılıyor." };
    }
    console.error("Kategori kaydedilemedi.");
    return { error: "Kategori kaydedilemedi." };
  }

  revalidatePath("/admin/kategoriler");
  redirect("/admin/kategoriler");
}

export async function updateCategory(
  id: string,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = readCategory(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const current = await prisma.category.findUnique({
    where: { id },
    select: { id: true, image: true },
  });
  if (!current) {
    return { error: "Kategori bulunamadı." };
  }

  if (parsed.data.parentId === id) {
    return { error: "Kategori kendi altına alınamaz." };
  }
  if (parsed.data.parentId) {
    const descendants = await descendantIds(id);
    if (descendants.has(parsed.data.parentId)) {
      return { error: "Kategori kendi alt kategorisinin altına alınamaz." };
    }
  }

  let uploaded: string | null = null;
  try {
    const image = await readImage(formData);
    if ("error" in image) {
      return image;
    }
    uploaded = image.uploaded;
    await prisma.category.update({
      where: { id },
      data: { ...parsed.data, image: image.url },
    });
    if (current.image && current.image !== image.url) {
      await removeStoredImages([current.image]);
    }
  } catch (error) {
    unstable_rethrow(error);
    if (uploaded) {
      await removeStoredImages([uploaded]);
    }
    if (isUniqueConflict(error)) {
      return { error: "Bu kısa adres kullanılıyor." };
    }
    console.error("Kategori güncellenemedi.");
    return { error: "Kategori güncellenemedi." };
  }

  revalidatePath("/admin/kategoriler");
  redirect("/admin/kategoriler");
}

export async function deleteCategory(id: string): Promise<FormState> {
  await requireAdmin();
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      image: true,
      _count: { select: { products: true, children: true } },
    },
  });
  if (!category) {
    return { error: "Kategori bulunamadı." };
  }
  if (category._count.products > 0 || category._count.children > 0) {
    return {
      error: "İçinde ürün veya alt kategori varken silinemez.",
    };
  }

  try {
    await prisma.category.delete({ where: { id } });
    if (category.image) {
      await removeStoredImages([category.image]);
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("Kategori silinemedi.");
    return { error: "Kategori silinemedi." };
  }

  revalidatePath("/admin/kategoriler");
  redirect("/admin/kategoriler");
}
