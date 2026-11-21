import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetForm } from "@/components/storefront/account-forms";
import { findPasswordReset } from "@/lib/password-reset";

export const metadata: Metadata = { title: "Yeni şifre" };
export const instant = false;

type ResetPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PasswordResetPage({ params }: ResetPageProps) {
  const { token } = await params;
  const reset = await findPasswordReset(token);

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="surface-panel rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-sm tracking-[0.18em] text-coffee uppercase">Hesap</p>
        <h1 className="font-display mt-3 text-2xl text-espresso">Yeni şifre</h1>
        {reset ? (
          <>
            <p className="mt-2 max-w-md text-base leading-6 text-espresso/80">
              Şifre en az 8 karakter olmalı, bir harf ve bir rakam içermeli.
            </p>
            <PasswordResetForm token={token} />
          </>
        ) : (
          <p className="mt-3 text-base leading-6 text-espresso/80">
            Bu bağlantının süresi dolmuş.
          </p>
        )}
        <Link
          href="/hesap/sifre"
          className="mt-4 inline-block text-sm text-coffee"
        >
          Yeni bağlantı iste
        </Link>
      </div>
    </section>
  );
}
