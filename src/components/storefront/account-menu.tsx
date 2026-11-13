import Link from "next/link";
import { logoutCustomer } from "@/app/(store)/hesap/actions";

const links = [
  { href: "/hesap/siparisler", label: "Siparişler" },
  { href: "/hesap/adresler", label: "Adresler" },
  { href: "/hesap/profil", label: "Profil" },
];

export function AccountMenu({ current }: { current?: string }) {
  return (
    <nav className="mt-6 flex flex-wrap items-center gap-2" aria-label="Hesap">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={current === link.href ? "page" : undefined}
          className={`inline-flex h-11 items-center rounded-full px-4 text-sm ${
            current === link.href
              ? "bg-espresso text-background"
              : "border border-line bg-card text-espresso"
          }`}
        >
          {link.label}
        </Link>
      ))}
      <form action={logoutCustomer}>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-espresso"
        >
          Çıkış
        </button>
      </form>
    </nav>
  );
}
