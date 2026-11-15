import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderReceipt } from "@/components/storefront/order-receipt";
import { requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/db";
import { orderLead, orderReceiptSelect, presentOrder } from "@/lib/order-view";

export const metadata: Metadata = { title: "Sipariş" };
export const instant = false;

type MemberOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberOrderPage({
  params,
}: MemberOrderPageProps) {
  const customer = await requireCustomer();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: customer.id },
    select: orderReceiptSelect,
  });
  if (!order) {
    notFound();
  }

  const lead = orderLead(
    order.status,
    order.payment?.status === "FAILED" && order.status === "PENDING",
  );

  return (
    <>
      <OrderReceipt order={presentOrder(order)} lead={lead} />
      <div className="mx-auto -mt-6 flex max-w-xl flex-wrap gap-4 px-4 pb-12 sm:px-6">
        {order.status === "PENDING" ? (
          <Link
            href={`/siparis/${order.lookupToken}/odeme`}
            className="inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
          >
            Test ödemesine geç
          </Link>
        ) : null}
        <Link href="/hesap?bolum=siparisler" className="text-sm text-coffee">
          Siparişlere dön
        </Link>
      </div>
    </>
  );
}
