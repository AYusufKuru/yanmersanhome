"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import {
  removeCoupon,
  removeFromCart,
  submitCoupon,
  updateCartQuantity,
} from "@/app/(store)/sepet/actions";
import type { CartView } from "@/lib/cart-view";
import { formatPrice } from "@/lib/format";

function QuantityForm({
  productId,
  quantity,
  stock,
}: {
  productId: string;
  quantity: number;
  stock: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity - 1} />
        <button
          type="submit"
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-lg text-espresso"
          aria-label="Adedi azalt"
        >
          −
        </button>
      </form>
      <span className="min-w-6 text-center text-sm text-espresso">
        {quantity}
      </span>
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity + 1} />
        <button
          type="submit"
          disabled={quantity >= stock}
          className="grid h-11 w-11 place-items-center rounded-full border border-line text-lg text-espresso disabled:opacity-40"
          aria-label="Adedi artır"
        >
          +
        </button>
      </form>
    </div>
  );
}

export function CartPanel({
  cart,
  idPrefix,
}: {
  cart: CartView;
  idPrefix: string;
}) {
  const [couponState, couponAction, couponPending] = useActionState(
    submitCoupon,
    {},
  );
  const available = cart.lines.filter((line) => line.available);
  const unavailable = cart.lines.filter((line) => !line.available);

  if (cart.lines.length === 0) {
    return (
      <div>
        <h2 className="font-display text-3xl text-espresso">Sepetiniz boş</h2>
        <p className="mt-3 text-base leading-7 text-muted">
          Beğendiğiniz parçalar burada toplanır.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
        >
          Vitrine dön
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-3xl text-espresso">Sepet</h2>
      <ul className="mt-6 flex flex-col gap-4">
        {available.map((line) => (
          <li
            key={line.productId}
            className="flex gap-3 rounded-2xl border border-line bg-background p-3"
          >
            <Link
              href={`/urun/${line.slug}`}
              className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream"
            >
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.imageAlt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/urun/${line.slug}`}
                className="font-display text-lg leading-snug text-espresso"
              >
                {line.name}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {formatPrice(line.unitPrice)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <QuantityForm
                  productId={line.productId}
                  quantity={line.quantity}
                  stock={line.stock}
                />
                <p className="text-sm text-espresso">
                  {formatPrice(line.lineTotal)}
                </p>
              </div>
              <form action={removeFromCart} className="mt-2">
                <input type="hidden" name="productId" value={line.productId} />
                <button type="submit" className="h-11 text-sm text-muted">
                  Kaldır
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {unavailable.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {unavailable.map((line) => (
            <li
              key={line.productId}
              className="rounded-2xl border border-line px-4 py-3"
            >
              <p className="text-sm text-espresso">{line.name}</p>
              <p className="mt-1 text-sm text-muted">
                Bu parça artık yayında değil veya stokta yok.
              </p>
              <form action={removeFromCart}>
                <input type="hidden" name="productId" value={line.productId} />
                <button type="submit" className="mt-1 h-11 text-sm text-muted">
                  Kaldır
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}

      <form action={couponAction} className="mt-8">
        <label htmlFor={`${idPrefix}-kupon`} className="text-sm text-espresso">
          Kupon kodu
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id={`${idPrefix}-kupon`}
            name="code"
            defaultValue={cart.couponCode ?? ""}
            autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-card px-4 text-base text-espresso uppercase outline-none"
          />
          <button
            type="submit"
            disabled={couponPending}
            className="h-12 shrink-0 rounded-full bg-coffee px-4 text-sm text-background disabled:opacity-60"
          >
            Uygula
          </button>
        </div>
        {couponState.error ? (
          <p role="alert" className="mt-2 text-sm text-danger">
            {couponState.error}
          </p>
        ) : null}
        {cart.couponMessage ? (
          <p role="alert" className="mt-2 text-sm text-danger">
            {cart.couponMessage}
          </p>
        ) : null}
      </form>
      {cart.couponCode ? (
        <form action={removeCoupon} className="mt-2">
          <button type="submit" className="h-11 text-sm text-muted">
            Kuponu kaldır ({cart.couponCode})
          </button>
        </form>
      ) : null}

      <dl className="mt-6 space-y-2 text-sm">
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
        <div className="flex justify-between gap-4 pt-2 text-base">
          <dt className="text-espresso">Toplam</dt>
          <dd className="text-espresso">{formatPrice(cart.total)}</dd>
        </div>
      </dl>
      {available.length > 0 ? (
        <Link
          href="/odeme"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-coffee px-5 text-sm text-background"
        >
          Siparişi tamamla
        </Link>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-muted">
        Tutarlar sunucuda, güncel ürün fiyatından hesaplanır.
      </p>
    </div>
  );
}
