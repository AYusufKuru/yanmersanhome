"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/admin/(panel)/kategoriler/actions";
import { useAdminToast } from "@/components/admin/admin-toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { shrinkFormFiles } from "@/components/admin/shrink-image";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-line bg-background px-4 text-base text-espresso outline-none";

const areaClass =
  "mt-2 min-h-24 w-full rounded-2xl border border-line bg-background px-4 py-3 text-base text-espresso outline-none";

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

type CategoryAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

async function unusedDelete(): Promise<FormState> {
  return {};
}

export function CategoryForm({
  action,
  values,
  parents,
  submitLabel,
  purpose,
  deleteAction,
}: {
  action: CategoryAction;
  values: CategoryFormValues;
  parents: ParentOption[];
  submitLabel: string;
  purpose: "create" | "edit";
  deleteAction?: CategoryAction;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction ?? unusedDelete,
    {},
  );
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [previewOk, setPreviewOk] = useState(Boolean(values.image));
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const pickedRef = useRef<string | null>(null);
  const [confirm, setConfirm] = useState<"save" | "delete" | null>(null);
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
      if (pickedRef.current) {
        URL.revokeObjectURL(pickedRef.current);
      }
    };
  }, []);

  function showPickedImage(file: File | undefined) {
    if (pickedRef.current) {
      URL.revokeObjectURL(pickedRef.current);
    }
    const url = file ? URL.createObjectURL(file) : null;
    pickedRef.current = url;
    setPickedPreview(url);
  }

  function beginSave() {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const formData = new FormData(form);
    setConfirm(null);
    setPrepareError(null);
    setPreparing(true);
    void shrinkFormFiles(formData, "imageFile").then((total) => {
      setPreparing(false);
      if (total > 3_500_000) {
        setPrepareError("Görsel çok büyük. Daha küçük bir dosya deneyin.");
        return;
      }
      startTransition(() => {
        formAction(formData);
      });
    });
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
          title: "Kategori eklensin mi?",
          text: "Onaylarsan kategori kaydı tamamlanır.",
          confirmLabel: "Ekle",
        }
      : {
          title: "Değişiklikler kaydedilsin mi?",
          text: "Onaylarsan bu kategorideki değişiklikler kaydedilir.",
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
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
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
          </div>
          <label className="text-sm text-espresso">
            Açıklama
            <textarea
              name="description"
              defaultValue={values.description}
              className={areaClass}
            />
          </label>
        </div>
        <div className="flex flex-col gap-5 lg:border-l lg:border-line lg:pl-6">
          <div className="flex flex-col gap-4">
            <p className="text-xs tracking-[0.16em] text-coffee uppercase">
              Görsel
            </p>
            {pickedPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pickedPreview}
                alt=""
                className="h-24 w-24 rounded-2xl object-cover"
              />
            ) : values.image && previewOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.image}
                alt=""
                onError={() => setPreviewOk(false)}
                className="h-24 w-24 rounded-2xl object-cover"
              />
            ) : null}
            <label className="text-sm text-espresso">
              Görsel yükle
              <span className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-coffee/40 bg-background px-4 py-5 text-center">
                <span className="text-sm text-espresso">Dosya seç</span>
                <span className="text-sm text-muted">JPEG, PNG veya WebP</span>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) =>
                    showPickedImage(event.target.files?.[0])
                  }
                />
              </span>
            </label>
            <label className="text-sm text-espresso">
              Görsel yolu
              <input
                name="image"
                defaultValue={values.image}
                placeholder="/uploads/ornek.jpg"
                className={inputClass}
              />
            </label>
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
            {deletePending ? "Siliniyor" : "Kategoriyi sil"}
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
          title="Kategori silinsin mi?"
          text="Bu kategori panelden kaldırılır."
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
