import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { OrderStatusForm, ShipmentForm } from "@/components/admin/order-forms";
import { canSetStatus } from "@/lib/admin/order-flow";
import { orderStatuses } from "@/lib/admin/order-schema";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";

export const metadata: Metadata = { title: "Sipariş" };
export const instant = false;

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
};

function money(value: { toString(): string }) {
  return formatPrice(Number(value.toString()));
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      number: true,
      status: true,
      email: true,
      fullName: true,
      phone: true,
      city: true,
      district: true,
      addressLine: true,
      postalCode: true,
      note: true,
      invoiceType: true,
      companyName: true,
      taxNumber: true,
      taxOffice: true,
      subtotal: true,
      discount: true,
      shippingFee: true,
      total: true,
      couponCode: true,
      createdAt: true,
      payment: { select: { status: true, provider: true } },
      shipment: { select: { carrier: true, trackingNumber: true } },
      items: {
        select: {
          id: true,
          productName: true,
          sku: true,
          quantity: true,
          lineTotal: true,
        },
      },
      events: {
        orderBy: { createdAt: "asc" },
        select: { id: true, status: true, note: true, createdAt: true },
      },
    },
  });
  if (!order) {
    notFound();
  }

  const allowed = orderStatuses.filter((status) =>
    canSetStatus(order.status, status as OrderStatus),
  );
  const closed = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <p className="text-xs tracking-[0.18em] text-coffee uppercase">
          {orderStatusLabel[order.status]}
        </p>
        <h1 className="font-display mt-3 text-4xl text-espresso">
          {order.number}
        </h1>
        <p className="mt-2 text-sm text-muted">{formatDate(order.createdAt)}</p>
        <p className="mt-4 text-sm text-espresso">
          {order.payment
            ? paymentStatusLabel[order.payment.status]
            : "Ödeme kaydı yok"}
          {order.payment?.provider === "mock" ? " · test" : ""}
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="text-espresso">
                {item.productName} · {item.quantity}
                <span className="mt-1 block text-muted">{item.sku}</span>
              </span>
              <span className="text-espresso">{money(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Ara toplam</dt>
            <dd>{money(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">İndirim</dt>
            <dd>{money(order.discount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Kargo ücreti</dt>
            <dd>{money(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-base text-espresso">
            <dt>Toplam</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
        {order.couponCode ? (
          <p className="mt-3 text-sm text-muted">Kupon: {order.couponCode}</p>
        ) : null}
        <div className="mt-8 text-sm leading-6 text-muted">
          <p className="text-espresso">{order.fullName}</p>
          <p>{order.phone}</p>
          <p>{order.email}</p>
          <p>
            {order.addressLine}, {order.district} / {order.city}
            {order.postalCode ? ` ${order.postalCode}` : ""}
          </p>
          {order.invoiceType === "COMPANY" ? (
            <p>
              {order.companyName} · {order.taxNumber} · {order.taxOffice}
            </p>
          ) : (
            <p>Bireysel fatura</p>
          )}
          {order.note ? <p>Müşteri notu: {order.note}</p> : null}
        </div>
        <ol className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
          {order.events.map((event) => (
            <li key={event.id}>
              <p className="text-espresso">{orderStatusLabel[event.status]}</p>
              <p className="text-muted">
                {formatDate(event.createdAt)}
                {event.note ? ` · ${event.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
        <Link
          href="/admin/siparisler"
          className="mt-8 inline-block text-sm text-coffee"
        >
          Siparişlere dön
        </Link>
      </div>
      <aside className="space-y-8">
        <div>
          <h2 className="font-display text-2xl text-espresso">Durum</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            İptal ve iade stoğu geri alır. Test ödemesinde para iadesi yapılmaz.
          </p>
          <div className="mt-4">
            <OrderStatusForm
              id={order.id}
              status={order.status}
              allowed={allowed}
            />
          </div>
        </div>
        {closed || order.status === "PENDING" ? (
          <p className="text-sm leading-6 text-muted">
            {order.status === "PENDING"
              ? "Ödeme bekleyen siparişe kargo yazılmaz."
              : "Kapanmış siparişe kargo yazılmaz."}
          </p>
        ) : (
          <div>
            <h2 className="font-display text-2xl text-espresso">Kargo</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Takip numarası, hazırlanan siparişi kargoya verilmiş sayar.
            </p>
            <div className="mt-4">
              <ShipmentForm
                id={order.id}
                carrier={order.shipment?.carrier ?? ""}
                trackingNumber={order.shipment?.trackingNumber ?? ""}
              />
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
