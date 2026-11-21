import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/storefront/checkout-form";
import { PaymentMarks } from "@/components/storefront/payment-marks";
import { CheckoutEvent } from "@/components/storefront/track-events";
import { getCustomer, listAddresses } from "@/lib/account";
import { getCartView } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sipariş",
  robots: { index: false, follow: false },
};
export const instant = false;

export default async function CheckoutPage() {
  const [cart, customer] = await Promise.all([getCartView(), getCustomer()]);
  const saved = customer ? await listAddresses(customer.id) : [];
  const ready = cart.lines.some((line) => line.available);
  const addresses = saved.map((address) => ({
    id: address.id,
    label: `${address.district} / ${address.city}`,
    fullName: address.fullName,
    phone: address.phone,
    email: customer?.email ?? "",
    city: address.city,
    district: address.district,
    addressLine: address.line,
    postalCode: address.postalCode ?? "",
  }));
  const defaults = customer
    ? {
        fullName: addresses[0]?.fullName || customer.name,
        phone: addresses[0]?.phone || customer.phone || "",
        email: customer.email,
        city: addresses[0]?.city || "",
        district: addresses[0]?.district || "",
        addressLine: addresses[0]?.addressLine || "",
        postalCode: addresses[0]?.postalCode || "",
      }
    : undefined;

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <div>
        <h1 className="font-display text-4xl text-espresso">Sipariş</h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-muted">
          {customer
            ? "Bu sipariş hesabınıza yazılır. Sonraki ekran test ödemesidir, para çekilmez."
            : "Hesap açmadan sipariş kaydı oluşur. Sonraki ekran test ödemesidir, para çekilmez."}
        </p>
        {ready ? (
          <div className="mt-8">
            <CheckoutEvent value={cart.total} />
            <CheckoutForm
              accountEmail={customer?.email}
              defaults={defaults}
              addresses={addresses}
            />
          </div>
        ) : (
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
          >
            Vitrine dön
          </Link>
        )}
      </div>
      <aside className="rounded-3xl border border-line bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl text-espresso">Özet</h2>
        {ready ? (
          <ul className="mt-4 space-y-3 text-sm">
            {cart.lines
              .filter((line) => line.available)
              .map((line) => (
                <li key={line.productId} className="flex justify-between gap-3">
                  <span className="text-espresso">
                    {line.name} · {line.quantity}
                  </span>
                  <span className="shrink-0 text-espresso">
                    {formatPrice(line.lineTotal)}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Sepet boş.</p>
        )}
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Ara toplam</dt>
            <dd className="text-espresso">{formatPrice(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">İndirim</dt>
            <dd className="text-espresso">{formatPrice(cart.discount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Kargo</dt>
            <dd className="text-espresso">{formatPrice(cart.shippingFee)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-base">
            <dt className="text-espresso">Toplam</dt>
            <dd className="text-espresso">{formatPrice(cart.total)}</dd>
          </div>
        </dl>
        <Link
          href="/sepet"
          className="mt-4 inline-flex h-11 items-center text-sm text-coffee"
        >
          Sepete dön
        </Link>
        <p className="mt-6 text-sm leading-6 text-muted">
          Ödeme sayfası SSL sertifikası ile korunur. Kart bilgisi bu sitede
          saklanmaz.
        </p>
        <div className="mt-4">
          <PaymentMarks />
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          <Link href="/mesafeli-satis" className="text-coffee underline">
            Mesafeli satış sözleşmesi
          </Link>
          {" · "}
          <Link href="/teslimat-iade" className="text-coffee underline">
            Teslimat ve iade
          </Link>
        </p>
      </aside>
    </section>
  );
}
