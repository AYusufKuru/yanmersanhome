import type { Metadata } from "next";
import Link from "next/link";
import { AccountMenu } from "@/components/storefront/account-menu";
import { requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = { title: "Siparişler" };
export const instant = false;

export default async function OrdersPage() {
  const customer = await requireCustomer();
  const orders = await prisma.order.findMany({
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
  });

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-4xl text-espresso">Siparişler</h1>
      <AccountMenu current="/hesap/siparisler" />
      {orders.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/hesap/siparisler/${order.id}`}
                className="block rounded-2xl border border-line bg-card px-4 py-3"
              >
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-espresso">{order.number}</span>
                  <span className="text-espresso">
                    {formatPrice(Number(order.total.toString()))}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {formatDate(order.createdAt)} ·{" "}
                  {orderStatusLabel[order.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm leading-6 text-muted">
          Hesabınıza bağlı sipariş yok. Misafir siparişini hesap sayfasındaki
          numara ve e-posta ile açabilirsiniz.
        </p>
      )}
      <Link href="/hesap" className="mt-8 inline-block text-sm text-coffee">
        Misafir siparişi ara
      </Link>
    </section>
  );
}
