"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CartPanel } from "@/components/storefront/cart-panel";
import { CartIcon } from "@/components/storefront/icons";
import type { CartView } from "@/lib/cart-view";

export function CartDrawer({ cart }: { cart: CartView }) {
  const [open, setOpen] = useState(false);
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
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="relative grid h-11 w-11 place-items-center text-espresso"
        aria-label={cart.count > 0 ? `Sepet, ${cart.count} ürün` : "Sepet"}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <CartIcon className="h-5 w-5" />
        {cart.count > 0 ? (
          <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-coffee px-1 text-[10px] text-background">
            {cart.count > 9 ? "9+" : cart.count}
          </span>
        ) : null}
      </button>
      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                className="absolute inset-0 bg-espresso/40"
                aria-label="Sepeti kapat"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Sepet"
                className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[28rem] sm:rounded-none sm:px-6"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    className="grid h-11 w-11 place-items-center text-espresso"
                    onClick={() => setOpen(false)}
                    aria-label="Kapat"
                  >
                    ×
                  </button>
                </div>
                <CartPanel cart={cart} idPrefix="panel" />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
