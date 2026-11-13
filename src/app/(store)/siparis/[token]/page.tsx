import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderReceipt } from "@/components/storefront/order-receipt";
import { PurchaseEvent } from "@/components/storefront/track-events";
import { prisma } from "@/lib/db";
import { orderLead, orderReceiptSelect, presentOrder } from "@/lib/order-view";

export const metadata: Metadata = {
  title: "Sipariş kaydı",
  robots: { index: false, follow: false },
};
export const instant = false;

type OrderPageProps = {
  params: Promise<{ token: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { lookupToken: token },
    select: orderReceiptSelect,
  });
  if (!order) {
    notFound();
  }

  const receipt = presentOrder(order);
  const lead = orderLead(
    order.status,
    order.payment?.status === "FAILED" && order.status === "PENDING",
  );

  return (
    <>
      <PurchaseEvent
        orderNumber={order.number}
        status={order.status}
        value={Number(order.total.toString())}
      />
      <OrderReceipt order={receipt} lead={lead} />
      <div className="mx-auto -mt-6 flex max-w-xl flex-wrap gap-4 px-4 pb-12 sm:px-6">
        {order.status === "PENDING" ? (
          <Link
            href={`/siparis/${token}/odeme`}
            className="inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
          >
            Test ödemesine geç
          </Link>
        ) : (
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
          >
            Vitrine dön
          </Link>
        )}
        <Link
          href="/hesap"
          className="inline-flex h-12 items-center rounded-full border border-line bg-card px-6 text-sm text-espresso"
        >
          Hesaptan izle
        </Link>
      </div>
    </>
  );
}
