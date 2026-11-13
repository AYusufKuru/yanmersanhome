import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = { title: "Siparişler" };
export const instant = false;

const filters = [
  { id: "", label: "Tümü" },
  { id: "PENDING", label: "Ödeme bekleyen" },
  { id: "PAID", label: "Ödenen" },
  { id: "SHIPPED", label: "Kargodakiler" },
  { id: "CANCELLED", label: "İptal" },
] as const;

type OrdersPageProps = {
  searchParams: Promise<{ durum?: string }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAdmin();
  const { durum } = await searchParams;
  const status = filters.some((filter) => filter.id === durum)
    ? (durum as OrderStatus | "")
    : "";
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      number: true,
      fullName: true,
      total: true,
      status: true,
      createdAt: true,
      payment: { select: { status: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl text-espresso">Siparişler</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Kargo firması ve takip numarası siparişin içinden yazılır. Test
        ödemesinde para hareketi yoktur.
      </p>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <Link
            key={filter.id || "all"}
            href={
              filter.id
                ? `/admin/siparisler?durum=${filter.id}`
                : "/admin/siparisler"
            }
            aria-current={status === filter.id ? "page" : undefined}
            className={`inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm ${
              status === filter.id
                ? "bg-espresso text-background"
                : "border border-line bg-card text-espresso"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <p className="mt-8 text-base text-muted">Bu süzgeçte sipariş yok.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/siparisler/${order.id}`}
                className="block rounded-2xl border border-line bg-card px-4 py-3"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-espresso">{order.number}</span>
                  <span className="text-sm text-espresso">
                    {formatPrice(Number(order.total.toString()))}
                  </span>
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {order.fullName} · {formatDate(order.createdAt)}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {orderStatusLabel[order.status]}
                  {order.payment
                    ? ` · ${paymentStatusLabel[order.payment.status]}`
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
