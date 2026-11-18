"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/kategoriler", label: "Kategoriler" },
  { href: "/admin/urunler", label: "Ürünler" },
  { href: "/admin/kuponlar", label: "Kuponlar" },
  { href: "/admin/siparisler", label: "Siparişler" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto lg:flex-1"
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
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm transition ${
              active
                ? "bg-espresso text-background"
                : "text-muted hover:bg-cream hover:text-espresso"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
