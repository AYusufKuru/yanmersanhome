import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hesap",
};

export default function AccountPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-start px-5 py-20">
      <h1 className="font-display text-4xl text-espresso">Hesap</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Üyelik ve sipariş takibi, sipariş adımıyla birlikte açılacak.
      </p>
      <Link href="/" className="mt-8 text-sm text-coffee">
        Vitrine dön
      </Link>
    </section>
  );
}
