import { cookies } from "next/headers";
import { CookieConsent } from "@/components/storefront/cookie-consent";
import { Footer } from "@/components/storefront/footer";
import { Header } from "@/components/storefront/header";
import { getCustomer } from "@/lib/account";
import { consentCookieName, parseConsent } from "@/lib/analytics";
import { getCartView } from "@/lib/cart";
import { listRootCategories } from "@/lib/catalog";

export const instant = false;

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [categories, cart, customer, jar] = await Promise.all([
    listRootCategories(),
    getCartView(),
    getCustomer(),
    cookies(),
  ]);
  const consent = parseConsent(jar.get(consentCookieName)?.value);

  return (
    <div className="store-surface flex min-h-full flex-1 flex-col">
      <Header
        categories={categories}
        cart={cart}
        accountName={customer?.name ?? null}
      />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <CookieConsent initial={consent} />
    </div>
  );
}
