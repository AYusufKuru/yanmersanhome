import type { Metadata } from "next";
import { CartPanel } from "@/components/storefront/cart-panel";
import { getCartView } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function CartPage() {
  const cart = await getCartView();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <CartPanel cart={cart} idPrefix="sayfa" variant="page" />
      </section>
    </>
  );
}
