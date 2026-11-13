"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/(panel)/urunler/actions";
import { productStatusLabel } from "@/lib/admin/labels";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

export type ProductFormValues = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  images: { id: string; url: string; alt: string }[];
};

type CategoryOption = { id: string; name: string };

export function ProductForm({
  action,
  values,
  categories,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: ProductFormValues;
  categories: CategoryOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <label className="text-sm text-espresso">
        Ad
        <input
          name="name"
          required
          defaultValue={values.name}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Kısa adres
        <input
          name="slug"
          defaultValue={values.slug}
          placeholder="Boşsa addan üretilir"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Kategori
        <select
          name="categoryId"
          required
          defaultValue={values.categoryId}
          className={inputClass}
        >
          <option value="">Seçin</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-espresso">
          Satış fiyatı
          <input
            name="price"
            required
            inputMode="decimal"
            defaultValue={values.price}
            placeholder="1890,00"
            className={inputClass}
          />
        </label>
        <label className="text-sm text-espresso">
          İndirimsiz fiyat
          <input
            name="compareAtPrice"
            inputMode="decimal"
            defaultValue={values.compareAtPrice}
            className={inputClass}
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-espresso">
          Stok kodu
          <input
            name="sku"
            required
            defaultValue={values.sku}
            className={inputClass}
          />
        </label>
        <label className="text-sm text-espresso">
          Stok
          <input
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={values.stock}
            className={inputClass}
          />
        </label>
      </div>
      <label className="text-sm text-espresso">
        Durum
        <select
          name="status"
          defaultValue={values.status}
          className={inputClass}
        >
          {Object.entries(productStatusLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex h-12 items-center gap-3 text-sm text-espresso">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={values.featured}
          className="h-5 w-5"
        />
        Öne çıkan
      </label>
      <label className="text-sm text-espresso">
        Kısa açıklama
        <textarea
          name="summary"
          defaultValue={values.summary}
          className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      <label className="text-sm text-espresso">
        Açıklama
        <textarea
          name="description"
          defaultValue={values.description}
          className="mt-2 min-h-32 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      {values.images.length > 0 ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm text-espresso">Mevcut görseller</legend>
          {values.images.map((image) => (
            <label
              key={image.id}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 text-sm text-espresso"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1 truncate">{image.alt}</span>
              <span className="inline-flex h-11 items-center gap-2">
                <input
                  type="checkbox"
                  name="removeImage"
                  value={image.id}
                  className="h-5 w-5"
                />
                Kaldır
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <label className="text-sm text-espresso">
        Görsel yolu
        <input
          name="imagePath"
          placeholder="/catalog/mermer-1.jpg"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Görsel yükle
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-2 block w-full text-sm text-muted"
        />
      </label>
      <label className="text-sm text-espresso">
        Yeni görselin açıklaması
        <input name="imageAlt" className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        SEO başlığı
        <input
          name="seoTitle"
          defaultValue={values.seoTitle}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        SEO açıklaması
        <textarea
          name="seoDescription"
          defaultValue={values.seoDescription}
          className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-6 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Kaydediliyor" : submitLabel}
      </button>
    </form>
  );
}
