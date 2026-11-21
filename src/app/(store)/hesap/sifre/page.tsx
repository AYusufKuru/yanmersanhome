import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/storefront/account-forms";

export const metadata: Metadata = { title: "Şifre yenileme" };
export const instant = false;

export default function PasswordResetRequestPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="surface-panel rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-sm tracking-[0.18em] text-coffee uppercase">Hesap</p>
        <h1 className="font-display mt-3 text-2xl text-espresso">
          Şifremi unuttum
        </h1>
        <p className="mt-2 max-w-md text-base leading-6 text-espresso/80">
          Üye e-postanı yaz. Kayıtlıysa 1 saat geçerli bir bağlantı gönderilir.
        </p>
        <PasswordResetRequestForm />
        <Link
          href="/hesap?bolum=giris"
          className="mt-4 inline-block text-sm text-coffee"
        >
          Girişe dön
        </Link>
      </div>
    </section>
  );
}
