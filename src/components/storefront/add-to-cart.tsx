"use client";

import { useActionState } from "react";
import { addToCart } from "@/app/(store)/sepet/actions";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";

export function AddToCart({
  slug,
  stock,
  price,
}: {
  slug: string;
  stock: number;
  price: number;
}) {
  const [state, action, pending] = useActionState(addToCart, {});
  const outOfStock = stock < 1;
  const disabled = outOfStock || pending;

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const quantity = Number(
          new FormData(event.currentTarget).get("quantity"),
        );
        track("AddToCart", {
          content_ids: [slug],
          value:
            price * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1),
          currency: "TRY",
        });
      }}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:z-auto lg:mt-8 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0"
    >
      <input type="hidden" name="slug" value={slug} />
      <div className="mx-auto flex max-w-7xl items-center gap-3 lg:mx-0 lg:max-w-md">
        <p
          className={`font-sans text-base lg:hidden ${
            outOfStock ? "text-espresso/40" : "text-espresso"
          }`}
        >
          {outOfStock ? "Stokta yok" : formatPrice(price)}
        </p>
        {outOfStock ? null : (
          <>
            <label className="sr-only" htmlFor={`adet-${slug}`}>
              Adet
            </label>
            <input
              id={`adet-${slug}`}
              name="quantity"
              type="number"
              min={1}
              max={Math.max(stock, 1)}
              defaultValue={1}
              className="h-12 w-16 rounded-full border border-line bg-card text-center text-base text-espresso outline-none"
            />
          </>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60"
        >
          {outOfStock ? "Gelince haber ver" : pending ? "Ekleniyor" : "Sepete ekle"}
        </button>
      </div>
      {state.error ? (
        <p
          role="alert"
          className="mx-auto mt-2 max-w-7xl text-sm text-danger lg:mx-0"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
