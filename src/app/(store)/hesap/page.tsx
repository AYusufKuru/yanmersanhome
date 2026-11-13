import type { Metadata } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/storefront/account-menu";
import { GuestLookupForm } from "@/components/storefront/account-forms";
import { getCustomer } from "@/lib/account";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = { title: "Hesap" };
export const instant = false;

export default async function AccountPage() {
  const customer = await getCustomer();
  const orders = customer
    ? await prisma.order.findMany({
        where: { userId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Hesap</h1>
      {customer ? (
        <>
          <p className="mt-3 text-base leading-7 text-muted">
            Merhaba, {customer.name}. Üye siparişlerin burada durur.
          </p>
          <AccountMenu />
          <h2 className="font-display mt-10 text-2xl text-espresso">
            Son siparişler
          </h2>
          {orders.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/hesap/siparisler/${order.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm"
                  >
                    <span className="text-espresso">{order.number}</span>
                    <span className="text-muted">
                      {orderStatusLabel[order.status]} ·{" "}
                      {formatPrice(Number(order.total.toString()))}
                    </span>
                  </Link>
                  <p className="mt-1 px-1 text-xs text-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">
              Hesabınıza bağlı sipariş yok. Giriş yaparak verdiğiniz siparişler
              burada görünür.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="mt-3 text-base leading-7 text-muted">
            Üye olmadan da sipariş izlenir. Üye siparişleri girişten sonra
            listelenir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/hesap/giris"
              className="inline-flex h-12 items-center rounded-full bg-coffee px-5 text-sm text-background"
            >
              Giriş yap
            </Link>
            <Link
              href="/hesap/kayit"
              className="inline-flex h-12 items-center rounded-full border border-line bg-card px-5 text-sm text-espresso"
            >
              Hesap aç
            </Link>
          </div>
        </>
      )}
      <h2 className="font-display mt-12 text-2xl text-espresso">
        Misafir siparişi
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Sipariş numarası ve siparişte yazılan e-posta birlikte gerekir.
      </p>
      <GuestLookupForm />
    </section>
  );
}
