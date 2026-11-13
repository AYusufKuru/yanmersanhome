import type { Metadata } from "next";
import { AccountMenu } from "@/components/storefront/account-menu";
import {
  PasswordForm,
  ProfileForm,
} from "@/components/storefront/account-forms";
import { requireCustomer } from "@/lib/account";

export const metadata: Metadata = { title: "Profil" };
export const instant = false;

export default async function ProfilePage() {
  const customer = await requireCustomer();

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Profil</h1>
      <AccountMenu current="/hesap/profil" />
      <p className="mt-8 text-sm text-muted">{customer.email}</p>
      <div className="mt-4">
        <ProfileForm name={customer.name} phone={customer.phone ?? ""} />
      </div>
      <h2 className="font-display mt-12 text-2xl text-espresso">Şifre</h2>
      <div className="mt-4">
        <PasswordForm />
      </div>
    </section>
  );
}
