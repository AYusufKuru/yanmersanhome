import { cookies } from "next/headers";
import Link from "next/link";
import { CookieConsent } from "@/components/storefront/cookie-consent";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { getCustomer } from "@/lib/account";
import { consentCookieName, parseConsent } from "@/lib/analytics";
import { getCartView } from "@/lib/cart";
import { emptyCart } from "@/lib/cart-view";
import { listRootCategories } from "@/lib/catalog";

export const instant = false;

export default async function NotFound() {
  let categories: Awaited<ReturnType<typeof listRootCategories>> = [];
  let cart = emptyCart;
  let accountName: string | null = null;
  let consent: ReturnType<typeof parseConsent> = null;
  try {
    const [loadedCategories, loadedCart, customer, jar] = await Promise.all([
      listRootCategories(),
      getCartView(),
      getCustomer(),
      cookies(),
    ]);
    consent = parseConsent(jar.get(consentCookieName)?.value);
    categories = loadedCategories;
    cart = loadedCart;
    accountName = customer?.name ?? null;
  } catch {
    categories = [];
  }

  return (
    <div className="store-surface flex min-h-full flex-1 flex-col">
      <Header categories={categories} cart={cart} accountName={accountName} />
      <main id="icerik" className="flex-1">
        <section className="mx-auto flex max-w-xl flex-col items-start px-5 py-20">
          <h1 className="font-display text-4xl text-espresso">
            Sayfa bulunamadı
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Aradığınız sayfa yok. Vitrinden devam edebilirsiniz.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-coffee px-6 text-sm text-background"
          >
            Ana sayfa
          </Link>
        </section>
      </main>
      <Footer categories={categories} />
      <CookieConsent initial={consent} />
    </div>
  );
}
