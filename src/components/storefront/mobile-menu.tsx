"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

type MobileMenuProps = {
  categories: { slug: string; name: string }[];
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ categories, open, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-background lg:hidden">
      <div className="flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl text-espresso">Yanmersanhome</p>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center text-espresso"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <form action="/ara" className="mt-8">
          <label htmlFor="mobil-arama" className="sr-only">
            Ürün ara
          </label>
          <input
            id="mobil-arama"
            name="q"
            type="search"
            placeholder="Ürün veya malzeme ara"
            className="h-12 w-full rounded-full bg-cream px-5 text-base text-espresso outline-none placeholder:text-muted"
          />
        </form>

        <nav className="mt-8 flex flex-col gap-2" aria-label="Bölümler">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              onClick={onClose}
              className="font-display py-2 text-4xl leading-tight text-espresso"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex gap-6 text-sm text-muted">
          <Link href="/hesap" onClick={onClose} className="py-3">
            Hesap
          </Link>
          <Link href="/sepet" onClick={onClose} className="py-3">
            Sepet
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
