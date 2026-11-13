import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/storefront/account-forms";
import { getCustomer } from "@/lib/account";

export const metadata: Metadata = { title: "Hesap aç" };
export const instant = false;

export default async function RegisterPage() {
  if (await getCustomer()) {
    redirect("/hesap");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Hesap aç</h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Şifre en az 8 karakter olmalı, bir harf ve bir rakam içermeli.
      </p>
      <RegisterForm />
      <Link
        href="/hesap/giris"
        className="mt-6 inline-block text-sm text-coffee"
      >
        Hesabınız varsa giriş yapın
      </Link>
    </section>
  );
}
