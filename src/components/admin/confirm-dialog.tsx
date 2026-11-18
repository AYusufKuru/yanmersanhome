"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  tone,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  confirmLabel: string;
  tone: "danger" | "coffee";
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, pending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/45 px-4"
      onClick={() => {
        if (!pending) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-[0_24px_60px_-28px_rgba(74,52,38,0.9)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-3xl text-espresso">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-espresso/80">{text}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-espresso disabled:opacity-60"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`inline-flex h-11 items-center rounded-full px-5 text-sm text-background disabled:opacity-60 ${
              tone === "danger" ? "bg-danger" : "bg-coffee"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
