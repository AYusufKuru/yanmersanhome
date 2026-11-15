"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CartPanel } from "@/components/storefront/cart-panel";
import { CartIcon, CloseIcon } from "@/components/storefront/icons";
import type { CartView } from "@/lib/cart-view";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CartDrawer({ cart }: { cart: CartView }) {
  const pathname = usePathname();
  const hasItems = cart.count > 0;
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const style = document.createElement("style");
    style.textContent = `
      .cart-drawer-scroll {
        scrollbar-width: none;
      }
      .cart-drawer-scroll::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (hasItems) {
      setRendered(true);
      if (prefersReducedMotion()) {
        setVisible(true);
        return;
      }
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    setVisible(false);
    if (prefersReducedMotion()) {
      setRendered(false);
      return;
    }
    const timer = window.setTimeout(() => setRendered(false), 320);
    return () => window.clearTimeout(timer);
  }, [hasItems]);

  useEffect(() => {
    const update = () => {
      const banner = document.querySelector('[aria-label="Çerez izni"]');
      if (!banner) {
        setLifted(false);
        return;
      }
      const rect = banner.getBoundingClientRect();
      const coversCorner =
        rect.top < window.innerHeight - 8 &&
        rect.bottom > window.innerHeight - 140;
      setLifted(coversCorner);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setPresent(true);
      if (prefersReducedMotion()) {
        setEntered(true);
        return;
      }
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    setEntered(false);
    if (prefersReducedMotion()) {
      setPresent(false);
      return;
    }
    const timer = window.setTimeout(() => setPresent(false), 520);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!present) {
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
  }, [present]);

  const onProduct = pathname.startsWith("/urun/");
  const onCartPage = pathname === "/sepet";
  const place = lifted
    ? "bottom-48 sm:bottom-28"
    : onProduct
      ? "bottom-24 lg:bottom-6"
      : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] lg:bottom-6";
  const shown = visible && !open && !onCartPage;

  return (
    <>
      {rendered && mounted
        ? createPortal(
            <button
              type="button"
              className={`fixed right-4 z-40 grid h-14 w-14 origin-bottom-right place-items-center rounded-full bg-espresso text-background shadow-[0_14px_34px_-10px_rgb(28_16_10/0.7)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:right-6 ${place} ${
                shown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-4 scale-90 opacity-0"
              }`}
              aria-label={`Sepet, ${cart.count} ürün`}
              aria-expanded={open}
              aria-hidden={!shown}
              onClick={() => setOpen(true)}
            >
              <CartIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 grid h-6 min-w-6 place-items-center rounded-full bg-coffee px-1.5 text-xs text-background">
                {cart.count > 9 ? "9+" : cart.count}
              </span>
            </button>,
            document.body,
          )
        : null}
      {present && mounted
        ? createPortal(
            <div
              className={`fixed inset-0 z-50 ${entered ? "" : "pointer-events-none"}`}
            >
              <button
                type="button"
                className={`absolute inset-0 bg-espresso/40 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
                  entered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Sepeti kapat"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-hidden={!entered}
                aria-label="Sepet"
                className={`cart-drawer-scroll absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-background px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-500 ease-out motion-reduce:transition-none sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[32rem] sm:rounded-none sm:rounded-l-3xl sm:px-6 sm:pt-6 ${
                  entered
                    ? "translate-y-0 sm:translate-x-0"
                    : "translate-y-full sm:translate-x-full sm:translate-y-0"
                }`}
              >
                <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" />
                <button
                  type="button"
                  className="absolute top-3 right-3 z-10 grid h-11 w-11 place-items-center rounded-full text-espresso hover:bg-cream sm:top-5 sm:right-5"
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
                <CartPanel cart={cart} idPrefix="panel" variant="drawer" />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
