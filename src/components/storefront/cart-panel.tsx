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
import type { CartView, CartViewLine } from "@/lib/cart-view";
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
    <div className="inline-flex items-center rounded-full bg-background">
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity - 1} />
        <button
          type="submit"
          className="grid h-10 w-10 place-items-center rounded-full text-lg text-espresso"
          aria-label="Adedi azalt"
        >
          −
        </button>
      </form>
      <span className="min-w-5 text-center text-sm text-espresso">
        {quantity}
      </span>
      <form action={updateCartQuantity}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity + 1} />
        <button
          type="submit"
          disabled={quantity >= stock}
          className="grid h-10 w-10 place-items-center rounded-full text-lg text-espresso disabled:opacity-40"
          aria-label="Adedi artır"
        >
          +
        </button>
      </form>
    </div>
  );
}

function LineItem({ line }: { line: CartViewLine }) {
  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/urun/${line.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream"
      >
        {line.image ? (
          <Image
            src={line.image}
            alt={line.imageAlt}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/urun/${line.slug}`}
            className="font-display text-xl leading-snug text-espresso"
          >
            {line.name}
          </Link>
          <p className="shrink-0 text-sm text-espresso">
            {formatPrice(line.lineTotal)}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">{formatPrice(line.unitPrice)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <QuantityForm
            productId={line.productId}
            quantity={line.quantity}
            stock={line.stock}
          />
          <form action={removeFromCart}>
            <input type="hidden" name="productId" value={line.productId} />
            <button
              type="submit"
              className="h-10 text-sm text-muted hover:text-espresso"
            >
              Kaldır
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

function Summary({
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
  const canCheckout = cart.lines.some((line) => line.available);

  return (
    <div className="rounded-3xl bg-card p-5 sm:p-6">
      <p className="font-display text-2xl text-espresso">Özet</p>
      <form action={couponAction} className="mt-5">
        <label htmlFor={`${idPrefix}-kupon`} className="text-sm text-espresso">
          Kupon kodu
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id={`${idPrefix}-kupon`}
            name="code"
            defaultValue={cart.couponCode ?? ""}
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-full bg-background px-4 text-sm text-espresso uppercase outline-none placeholder:text-muted"
            placeholder="Kod"
          />
          <button
            type="submit"
            disabled={couponPending}
            className="h-11 shrink-0 rounded-full bg-espresso px-4 text-sm text-background disabled:opacity-60"
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
          <button type="submit" className="h-10 text-sm text-muted">
            Kuponu kaldır ({cart.couponCode})
          </button>
        </form>
      ) : null}

      <dl className="mt-6 space-y-3 text-sm">
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
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <dt className="text-espresso">Toplam</dt>
          <dd className="font-display text-3xl text-espresso">
            {formatPrice(cart.total)}
          </dd>
        </div>
      </dl>
      {canCheckout ? (
        <Link
          href="/odeme"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-coffee text-sm text-background"
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

export function CartPanel({
  cart,
  idPrefix,
  variant = "page",
}: {
  cart: CartView;
  idPrefix: string;
  variant?: "page" | "drawer";
}) {
  const available = cart.lines.filter((line) => line.available);
  const unavailable = cart.lines.filter((line) => !line.available);
  const Heading = variant === "page" ? "h1" : "h2";

  if (cart.lines.length === 0) {
    return (
      <div className={variant === "page" ? "mx-auto max-w-lg py-16 text-center" : "py-4"}>
        <p className="text-[11px] tracking-[0.18em] text-coffee uppercase">
          Sepet
        </p>
        <Heading className="font-display mt-3 text-4xl text-espresso">
          Sepetiniz boş
        </Heading>
        <p className="mt-3 text-base leading-7 text-muted">
          Beğendiğiniz parçalar burada toplanır.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
        >
          Vitrine dön
        </Link>
      </div>
    );
  }

  const lines = (
    <div className="rounded-3xl bg-card px-4 sm:px-6">
      <ul className="divide-y divide-line">
        {available.map((line) => (
          <LineItem key={line.productId} line={line} />
        ))}
      </ul>
      {unavailable.length > 0 ? (
        <ul className="border-t border-line">
          {unavailable.map((line) => (
            <li key={line.productId} className="py-5">
              <p className="font-display text-lg text-espresso">{line.name}</p>
              <p className="mt-1 text-sm text-muted">
                Bu parça artık yayında değil veya stokta yok.
              </p>
              <form action={removeFromCart}>
                <input type="hidden" name="productId" value={line.productId} />
                <button
                  type="submit"
                  className="mt-2 h-10 text-sm text-muted hover:text-espresso"
                >
                  Kaldır
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  const heading = (
    <div className={variant === "drawer" ? "pr-12" : undefined}>
      <p className="text-[11px] tracking-[0.18em] text-coffee uppercase">
        {cart.count} parça
      </p>
      <Heading className="font-display mt-2 text-4xl text-espresso">
        Sepet
      </Heading>
    </div>
  );

  if (variant === "drawer") {
    return (
      <div>
        {heading}
        <div className="mt-5">{lines}</div>
        <div className="mt-5">
          <Summary cart={cart} idPrefix={idPrefix} />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
      <div>
        {heading}
        <div className="mt-8">{lines}</div>
      </div>
      <aside className="mt-8 lg:sticky lg:top-28 lg:mt-0">
        <Summary cart={cart} idPrefix={idPrefix} />
      </aside>
    </div>
  );
}
