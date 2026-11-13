"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/(panel)/kategoriler/actions";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  parentId: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
};

type ParentOption = { id: string; name: string };

export function CategoryForm({
  action,
  values,
  parents,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  values: CategoryFormValues;
  parents: ParentOption[];
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
        Açıklama
        <textarea
          name="description"
          defaultValue={values.description}
          className="mt-2 min-h-28 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      <label className="text-sm text-espresso">
        Sıra
        <input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={values.sortOrder}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Üst kategori
        <select
          name="parentId"
          defaultValue={values.parentId}
          className={inputClass}
        >
          <option value="">Kök kategori</option>
          {parents.map((parent) => (
            <option key={parent.id} value={parent.id}>
              {parent.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-espresso">
        Görsel yolu
        <input
          name="image"
          defaultValue={values.image}
          placeholder="/catalog/ornek.jpg"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Görsel yükle
        <input
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-2 block w-full text-sm text-muted"
        />
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
