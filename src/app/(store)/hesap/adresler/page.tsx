import type { Metadata } from "next";
import { AccountMenu } from "@/components/storefront/account-menu";
import { AddressForm } from "@/components/storefront/account-forms";
import { deleteAddress } from "@/app/(store)/hesap/actions";
import { listAddresses, requireCustomer } from "@/lib/account";

export const metadata: Metadata = { title: "Adresler" };
export const instant = false;

export default async function AddressesPage() {
  const customer = await requireCustomer();
  const addresses = await listAddresses(customer.id);

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Adresler</h1>
      <AccountMenu current="/hesap/adresler" />
      {addresses.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-2xl border border-line bg-card px-4 py-3 text-sm leading-6"
            >
              <p className="text-espresso">{address.fullName}</p>
              <p className="text-muted">{address.phone}</p>
              <p className="text-muted">
                {address.line}, {address.district} / {address.city}
                {address.postalCode ? ` ${address.postalCode}` : ""}
              </p>
              <form action={deleteAddress} className="mt-2">
                <input type="hidden" name="id" value={address.id} />
                <button type="submit" className="text-sm text-danger">
                  Sil
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm leading-6 text-muted">Kayıtlı adres yok.</p>
      )}
      {addresses.length < 10 ? (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-espresso">Yeni adres</h2>
          <div className="mt-4">
            <AddressForm />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">En fazla 10 adres kaydedilir.</p>
      )}
    </section>
  );
}
