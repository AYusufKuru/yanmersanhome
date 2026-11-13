"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/urunler", label: "Ürünler" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6"
      aria-label="Yönetim"
    >
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm ${
              active ? "bg-coffee text-background" : "text-espresso"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
