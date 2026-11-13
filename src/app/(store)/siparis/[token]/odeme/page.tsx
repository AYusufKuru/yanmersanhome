import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MockPaymentForm } from "@/components/storefront/mock-payment-form";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { liveChargeClosed } from "@/lib/payments/providers";

export const metadata: Metadata = { title: "Test ödeme" };
export const instant = false;

type PaymentPageProps = {
  params: Promise<{ token: string }>;
};

export default async function MockPaymentPage({ params }: PaymentPageProps) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { lookupToken: token },
    select: {
      number: true,
      status: true,
      total: true,
      payment: { select: { status: true, provider: true } },
    },
  });
  if (!order) {
    notFound();
  }

  const mock = order.payment?.provider === "mock";
  const paid = order.payment?.status === "SUCCEEDED" || order.status === "PAID";
  const failed =
    order.payment?.status === "FAILED" && order.status === "PENDING";

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.18em] text-coffee uppercase">
        Test ödeme
      </p>
      <h1 className="font-display mt-3 text-4xl text-espresso">
        {order.number}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Bu ekran test içindir. Kart bilgisi istenmez ve para çekilmez. Sayfaya
        geri dönmek ödemeyi başarılı saymaz.
      </p>
      <p className="mt-6 text-sm text-muted">Tutar</p>
      <p className="font-display text-3xl text-espresso">
        {formatPrice(Number(order.total.toString()))}
      </p>
      {paid ? (
        <p className="mt-6 text-sm leading-6 text-espresso">
          Test ödemesi kaydedildi. Sipariş ödendi olarak işaretlendi. Gerçek
          tahsilat yapılmadı.
        </p>
      ) : null}
      {failed ? (
        <p className="mt-6 text-sm leading-6 text-espresso">
          Son test denemesi başarısız. Sipariş ödenmedi. Yeniden
          deneyebilirsiniz.
        </p>
      ) : null}
      {!mock ? (
        <p role="alert" className="mt-6 text-sm text-danger">
          {liveChargeClosed() ?? "Canlı çekim kapalı."}
        </p>
      ) : null}
      {mock && order.status === "PENDING" ? (
        <MockPaymentForm token={token} />
      ) : null}
      <Link
        href={`/siparis/${token}`}
        className="mt-8 inline-block text-sm text-coffee"
      >
        Sipariş kaydına dön
      </Link>
    </section>
  );
}
