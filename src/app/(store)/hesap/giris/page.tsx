import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/storefront/account-forms";
import { getCustomer } from "@/lib/account";

export const metadata: Metadata = { title: "Giriş" };
export const instant = false;

export default async function CustomerLoginPage() {
  if (await getCustomer()) {
    redirect("/hesap");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Giriş</h1>
      <p className="mt-3 text-base leading-7 text-muted">
        E-posta ile şifre sıfırlama, posta bağlantısı kurulunca açılacak. Giriş
        yaptıktan sonra şifrenizi profilden değiştirebilirsiniz.
      </p>
      <CustomerLoginForm />
      <Link
        href="/hesap/kayit"
        className="mt-6 inline-block text-sm text-coffee"
      >
        Hesabınız yoksa açın
      </Link>
    </section>
  );
}
