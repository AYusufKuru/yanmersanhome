"use client";

import Link from "next/link";
import { useState } from "react";
import type { CartView } from "@/lib/cart-view";
import { CartDrawer } from "./cart-drawer";
import { AccountIcon, MenuIcon, SearchIcon } from "./icons";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:gap-6">
        <Link
          href="/"
          className="font-display shrink-0 text-xl text-espresso sm:text-2xl"
        >
          Yanmersanhome
        </Link>

        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Bölümler"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="text-sm text-espresso transition-colors hover:text-coffee"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <form action="/ara" className="ml-auto hidden min-w-0 lg:block">
          <label htmlFor="arama" className="sr-only">
            Ürün ara
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="arama"
              name="q"
              type="search"
              placeholder="Ara"
              className="h-11 w-44 rounded-full border border-line bg-card pr-4 pl-9 text-sm text-espresso outline-none placeholder:text-muted xl:w-56"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center lg:ml-0">
          <Link
            href="/hesap"
            aria-label={accountName ? `Hesap, ${accountName}` : "Hesap"}
            className="grid h-11 w-11 place-items-center text-espresso"
          >
            <AccountIcon className="h-5 w-5" />
          </Link>
          <CartDrawer cart={cart} />
          <button
            type="button"
            className="grid h-11 w-11 place-items-center text-espresso lg:hidden"
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <MobileMenu
        categories={categories}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </header>
  );
}
