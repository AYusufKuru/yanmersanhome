"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CartView } from "@/lib/cart-view";
import { CartDrawer } from "./cart-drawer";
import { AccountIcon, CloseIcon, MenuIcon, SearchIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";

type HeaderCategory = {
  slug: string;
  name: string;
};

export function Header({
  categories,
  cart,
  accountName,
}: {
  categories: HeaderCategory[];
  cart: CartView;
  accountName?: string | null;
}) {
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const iconButton = `grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-500 motion-reduce:transition-none ${
    scrolled ? "text-espresso" : "text-white"
  }`;

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    searchRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function sync() {
      const y = window.scrollY;
      setScrolled((current) => (current ? y > 8 : y > 56));
    }

    sync();
    const frame = requestAnimationFrame(sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sync);
    };
  }, [pathname]);

  return (
    <header>
      <div
        aria-hidden
        className={`header-scrim pointer-events-none absolute inset-x-0 top-0 h-44 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`relative z-10 mx-auto transition-[max-width,padding] duration-500 ease-out motion-reduce:transition-none ${
          scrolled
            ? "max-w-6xl px-3 pt-3 pb-2 sm:px-5 sm:pt-4"
            : "max-w-[100vw] px-3 pt-0 pb-0 sm:px-6"
        }`}
      >
        <div
          className={`@container relative flex items-center border transition-all duration-500 ease-out motion-reduce:transition-none ${
            scrolled
              ? "h-14 rounded-full border-white/80 bg-card/92 px-1.5 shadow-[0_12px_40px_-16px_rgb(74_52_38/0.45)] backdrop-blur-xl sm:h-16 sm:px-2.5"
              : "h-16 rounded-none border-transparent bg-transparent px-1 shadow-none sm:h-[4.75rem] sm:px-2"
          }`}
        >
          <Link
            href="/"
            className={`font-display shrink-0 px-2.5 text-lg tracking-tight transition-colors duration-500 sm:px-3 sm:text-[1.35rem] motion-reduce:transition-none ${
              searchOpen ? "hidden sm:inline" : ""
            } ${scrolled ? "text-espresso" : "text-white"}`}
          >
            Yanmersanhome
          </Link>

          <nav
            className="absolute top-1/2 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex"
            aria-label="Bölümler"
          >
            {categories.map((category) => {
              const href = `/kategori/${category.slug}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={category.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-base tracking-[0.01em] transition-colors duration-500 motion-reduce:transition-none ${
                    scrolled
                      ? active
                        ? "bg-cream text-espresso"
                        : "text-espresso/75 hover:bg-cream/80 hover:text-espresso"
                      : active
                        ? "bg-white/15 text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 ml-auto flex items-center gap-1 sm:gap-2">
            <form
              action="/ara"
              className={`absolute top-1/2 right-full mr-1 -translate-y-1/2 overflow-hidden rounded-full bg-white transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none sm:mr-2 ${
                searchOpen
                  ? "w-48 opacity-100 sm:w-72 lg:w-[min(18rem,calc(50cqw-21rem))]"
                  : "pointer-events-none w-0 opacity-0"
              }`}
              aria-hidden={!searchOpen}
            >
              <label htmlFor="arama" className="sr-only">
                Ürün ara
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-espresso" />
                <input
                  ref={searchRef}
                  id="arama"
                  name="q"
                  type="search"
                  placeholder="Ara"
                  tabIndex={searchOpen ? 0 : -1}
                  className="search-field h-10 w-full appearance-none rounded-full border-0 bg-white pr-4 pl-9 text-sm text-espresso outline-none placeholder:text-muted"
                />
              </div>
            </form>
            <button
              type="button"
              className={iconButton}
              aria-label={searchOpen ? "Aramayı kapat" : "Ara"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              {searchOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <SearchIcon className="h-6 w-6" />
              )}
            </button>
            <Link
              href="/hesap"
              aria-label={accountName ? `Hesap, ${accountName}` : "Hesap"}
              className={iconButton}
            >
              <AccountIcon className="h-6 w-6" />
            </Link>
            <button
              type="button"
              className={`${iconButton} lg:hidden`}
              aria-label="Menüyü aç"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <CartDrawer cart={cart} />
      <MobileMenu
        categories={categories}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}
