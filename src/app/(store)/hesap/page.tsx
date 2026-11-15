import type { Metadata } from "next";
import Link from "next/link";
import {
  AddressForm,
  GuestLookupForm,
  PasswordForm,
  ProfileForm,
} from "@/components/storefront/account-forms";
import { AccountTabs, type AccountTab } from "@/components/storefront/account-tabs";
import { deleteAddress } from "@/app/(store)/hesap/actions";
import { getCustomer, listAddresses } from "@/lib/account";
import { prisma } from "@/lib/db";
import { formatDate, formatPersonName, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = { title: "Hesap" };
export const instant = false;

type AccountPageProps = {
  searchParams: Promise<{ bolum?: string | string[] }>;
};

function accountTab(value: string | string[] | undefined): AccountTab {
  const tab = Array.isArray(value) ? value[0] : value;
  if (tab === "adresler" || tab === "profil") {
    return tab;
  }
  return "siparisler";
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { bolum } = await searchParams;
  const customer = await getCustomer();
  const orders = customer
    ? await prisma.order.findMany({
        where: { userId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          createdAt: true,
        },
      })
    : [];
  const addresses = customer ? await listAddresses(customer.id) : [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="surface-panel rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
        <p className="text-sm tracking-[0.18em] text-coffee uppercase">Hesap</p>
        {customer ? (
          <>
            <h1 className="font-display mt-3 text-2xl text-espresso sm:text-3xl">
              Merhaba,{" "}
              <span className="text-coffee">
                {formatPersonName(customer.name)}
              </span>
            </h1>
            <AccountTabs
              tab={accountTab(bolum)}
              orders={
                <>
                  <h2 className="font-display text-xl text-espresso">
                    Siparişler
                  </h2>
                  {orders.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {orders.map((order) => (
                        <li key={order.id}>
                          <Link
                            href={`/hesap/siparisler/${order.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl bg-card px-5 py-3 text-sm"
                          >
                            <span className="text-espresso">
                              {order.number}
                              <span className="mt-0.5 block text-xs text-espresso/70">
                                {formatDate(order.createdAt)}
                              </span>
                            </span>
                            <span className="text-espresso/80">
                              {orderStatusLabel[order.status]} ·{" "}
                              {formatPrice(Number(order.total.toString()))}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-base leading-6 text-espresso/80">
                      Hesabınıza bağlı sipariş yok.
                    </p>
                  )}
                </>
              }
              addresses={
                <>
                  <h2 className="font-display text-xl text-espresso">
                    Adresler
                  </h2>
                  {addresses.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {addresses.map((address) => (
                        <li
                          key={address.id}
                          className="rounded-2xl bg-card px-5 py-3 text-sm leading-6"
                        >
                          <p className="text-espresso">{address.fullName}</p>
                          <p className="text-espresso/75">{address.phone}</p>
                          <p className="text-espresso/75">
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
                    <p className="mt-3 text-base leading-6 text-espresso/80">
                      Kayıtlı adres yok.
                    </p>
                  )}
                  {addresses.length < 10 ? (
                    <div className="mt-6">
                      <h3 className="font-display text-lg text-espresso">
                        Yeni adres
                      </h3>
                      <div className="mt-3">
                        <AddressForm />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-espresso/75">
                      En fazla 10 adres kaydedilir.
                    </p>
                  )}
                </>
              }
              profile={
                <>
                  <h2 className="font-display text-xl text-espresso">Profil</h2>
                  <p className="mt-3 text-sm text-espresso/75">
                    {customer.email}
                  </p>
                  <div className="mt-4">
                    <ProfileForm
                      name={customer.name}
                      phone={customer.phone ?? ""}
                    />
                  </div>
                  <h3 className="font-display mt-8 text-lg text-espresso">
                    Şifre
                  </h3>
                  <div className="mt-3">
                    <PasswordForm />
                  </div>
                </>
              }
            />
          </>
        ) : (
          <>
            <h1 className="font-display mt-3 text-3xl text-espresso">
              Siparişini izle
            </h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-espresso/80">
              Üye olmadan da sipariş izlenir. Üye siparişleri girişten sonra
              listelenir.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/hesap/giris"
                className="inline-flex h-12 items-center rounded-full bg-coffee px-5 text-sm text-background"
              >
                Giriş yap
              </Link>
              <Link
                href="/hesap/kayit"
                className="inline-flex h-12 items-center rounded-full border border-espresso/20 px-5 text-sm text-espresso"
              >
                Hesap aç
              </Link>
            </div>
            <div className="mt-4 rounded-[1.5rem] bg-white/45 px-5 py-3 sm:px-6">
              <h2 className="font-display text-xl text-espresso">
                Misafir siparişi
              </h2>
              <p className="mt-2 text-base leading-6 text-espresso/80">
                Sipariş numarası ve siparişte yazılan e-posta birlikte gerekir.
              </p>
              <GuestLookupForm compact />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
