"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import {
  discardAdminImages,
  storeAdminImage,
  type FormState,
} from "@/app/admin/(panel)/urunler/actions";
import { useAdminToast } from "@/components/admin/admin-toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { productStatusLabel } from "@/lib/admin/labels";
import { shrinkImage } from "@/components/admin/shrink-image";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-line bg-background px-4 text-base text-espresso outline-none";

const areaClass =
  "mt-2 min-h-24 w-full rounded-2xl border border-line bg-background px-4 py-3 text-base text-espresso outline-none";

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

type ProductAction = (state: FormState, formData: FormData) => Promise<FormState>;

async function unusedDelete(): Promise<FormState> {
  return {};
}

export function ProductForm({
  action,
  values,
  categories,
  submitLabel,
  purpose,
  deleteAction,
}: {
  action: ProductAction;
  values: ProductFormValues;
  categories: CategoryOption[];
  submitLabel: string;
  purpose: "create" | "edit";
  deleteAction?: ProductAction;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction ?? unusedDelete,
    {},
  );
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const previewsRef = useRef<string[]>([]);
  const [confirm, setConfirm] = useState<"save" | "delete" | null>(null);
  const uploaded = useRef<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const toasted = useRef<string | null>(null);
  const notify = useAdminToast();
  const message = prepareError ?? state.error ?? deleteState.error;
  const busy = pending || preparing || deletePending;

  useEffect(() => {
    if (!message || toasted.current === message) {
      return;
    }
    toasted.current = message;
    notify(message, "err");
  }, [message, notify]);

  useEffect(() => {
    return () => {
      for (const url of previewsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  function showPickedImages(files: FileList | null) {
    for (const url of previewsRef.current) {
      URL.revokeObjectURL(url);
    }
    const next = files
      ? [...files].map((file) => URL.createObjectURL(file))
      : [];
    previewsRef.current = next;
    setPreviews(next);
  }

  useEffect(() => {
    if (pending || !state.error || uploaded.current.length === 0) {
      return;
    }
    const urls = uploaded.current;
    uploaded.current = [];
    void discardAdminImages(urls);
  }, [pending, state.error]);

  function beginSave() {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const formData = new FormData(form);
    setConfirm(null);
    setPrepareError(null);
    setPreparing(true);
    void (async () => {
          const files = formData
            .getAll("images")
            .filter((item): item is File => item instanceof File && item.size > 0);
          formData.delete("images");
          const savedUrls: string[] = [];
          for (const file of files) {
            const next = await shrinkImage(file);
            if (next.size > 3_500_000) {
              await discardAdminImages(savedUrls);
              setPrepareError(
                "Bir görsel küçültüldükten sonra hâlâ çok büyük. Onu çıkarıp yeniden deneyin.",
              );
              setPreparing(false);
              return;
            }
            const body = new FormData();
            body.set("file", next);
            const saved = await storeAdminImage(body);
            if (!saved.url) {
              await discardAdminImages(savedUrls);
              setPrepareError(saved.error ?? "Görsel kaydedilemedi.");
              setPreparing(false);
              return;
            }
            savedUrls.push(saved.url);
            formData.append("uploadedUrl", saved.url);
          }
          uploaded.current = savedUrls;
          setPreparing(false);
          startTransition(() => {
            formAction(formData);
          });
        })();
  }

  function beginDelete() {
    setConfirm(null);
    startTransition(() => {
      deleteFormAction(new FormData());
    });
  }

  const saveCopy =
    purpose === "create"
      ? {
          title: "Ürün eklensin mi?",
          text: "Onaylarsan ürün kaydı tamamlanır.",
          confirmLabel: "Ekle",
        }
      : {
          title: "Değişiklikler kaydedilsin mi?",
          text: "Onaylarsan bu üründeki değişiklikler kaydedilir.",
          confirmLabel: "Kaydet",
        };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex flex-col gap-6 rounded-3xl border border-line bg-card p-5 shadow-[0_16px_40px_-30px_rgba(74,52,38,0.85)] sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        setConfirm("save");
      }}
    >
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
            <span className="mt-2 block text-sm text-muted">
              Taslak ve arşiv sitede listelenmez.
            </span>
          </label>
        </div>
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
        <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
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
        <label className="flex w-fit items-center gap-2 text-sm text-espresso">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={values.featured}
            className="h-4 w-4 accent-coffee"
          />
          Öne çıkan (ana sayfa kaydırıcısı)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-espresso">
            Kısa açıklama
            <textarea
              name="summary"
              defaultValue={values.summary}
              className={areaClass}
            />
          </label>
          <label className="text-sm text-espresso">
            Açıklama
            <textarea
              name="description"
              defaultValue={values.description}
              className={areaClass}
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-5 lg:border-l lg:border-line lg:pl-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs tracking-[0.16em] text-coffee uppercase">
            Görseller
          </p>
          {values.images.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {values.images.map((image) => (
                <li key={image.id} className="w-24">
                  <label className="block text-xs text-espresso">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                    <span className="mt-2 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        name="removeImage"
                        value={image.id}
                        className="h-4 w-4 accent-coffee"
                      />
                      Kaldır
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="text-sm text-espresso">
            Görsel yükle
            <span className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-coffee/40 bg-background px-4 py-5 text-center">
              <span className="text-sm text-espresso">Dosya seç</span>
              <span className="text-sm text-muted">
                Birden fazla JPEG, PNG veya WebP
              </span>
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => showPickedImages(event.target.files)}
              />
            </span>
          </label>
          {previews.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {previews.map((url) => (
                <li key={url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-espresso">
              Görsel yolu
              <input
                name="imagePath"
                placeholder="/uploads/ornek.jpg"
                className={inputClass}
              />
            </label>
            <label className="text-sm text-espresso">
              Yeni görselin açıklaması
              <input name="imageAlt" className={inputClass} />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-line pt-5">
          <p className="text-xs tracking-[0.16em] text-coffee uppercase">
            Arama
          </p>
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
              className={`${areaClass} min-h-20`}
            />
          </label>
        </div>
      </div>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      ) : null}
      <div
        className={`flex flex-wrap items-center gap-3 border-t border-line pt-5 ${
          deleteAction ? "justify-between" : "justify-end"
        }`}
      >
        {deleteAction ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm("delete")}
            className="inline-flex h-12 items-center justify-center rounded-full bg-danger px-6 text-sm text-background disabled:opacity-60"
          >
            {deletePending ? "Siliniyor" : "Ürünü sil"}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-6 text-sm text-background disabled:opacity-60"
        >
          {pending || preparing ? "Kaydediliyor" : submitLabel}
        </button>
      </div>
      {confirm === "save" ? (
        <ConfirmDialog
          title={saveCopy.title}
          text={saveCopy.text}
          confirmLabel={saveCopy.confirmLabel}
          tone="coffee"
          pending={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={beginSave}
        />
      ) : null}
      {confirm === "delete" ? (
        <ConfirmDialog
          title="Ürün silinsin mi?"
          text="Bu ürün siteden ve panelden kaldırılır."
          confirmLabel="Sil"
          tone="danger"
          pending={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={beginDelete}
        />
      ) : null}
    </form>
  );
}
