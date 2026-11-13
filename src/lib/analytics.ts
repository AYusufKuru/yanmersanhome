export const consentCookieName = "yanmersan_consent";

export type ConsentChoice = "necessary" | "all";

const gaPattern = /^G-[A-Z0-9]+$/;
const adsPattern = /^AW-\d+$/;
const pixelPattern = /^\d{5,20}$/;

export function analyticsIds() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "";
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  return {
    gaId: gaPattern.test(gaId) ? gaId : "",
    adsId: adsPattern.test(adsId) ? adsId : "",
    pixelId: pixelPattern.test(pixelId) ? pixelId : "",
  };
}

export function parseConsent(value: string | undefined): ConsentChoice | null {
  return value === "all" || value === "necessary" ? value : null;
}

export function analyticsConfigured() {
  const ids = analyticsIds();
  return Boolean(ids.gaId || ids.adsId || ids.pixelId);
}

type TrackName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type TrackParams = {
  content_ids?: string[];
  content_name?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
};

function consentAllows() {
  return document.cookie
    .split("; ")
    .some((part) => part === `${consentCookieName}=all`);
}

export function analyticsReady() {
  return analyticsConfigured() && consentAllows();
}

export function track(name: TrackName, params: TrackParams) {
  if (!analyticsReady()) {
    return;
  }

  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };
  win.dataLayer = win.dataLayer ?? [];
  const currency = params.currency ?? "TRY";
  const value = params.value;

  if (typeof win.gtag === "function") {
    const googleName =
      name === "ViewContent"
        ? "view_item"
        : name === "AddToCart"
          ? "add_to_cart"
          : name === "InitiateCheckout"
            ? "begin_checkout"
            : "purchase";
    win.gtag("event", googleName, {
      currency,
      value,
      transaction_id: params.transaction_id,
      items: params.content_ids?.map((id) => ({ item_id: id })),
    });
  }

  if (typeof win.fbq === "function") {
    win.fbq("track", name, {
      content_ids: params.content_ids,
      content_name: params.content_name,
      value,
      currency,
    });
  }
}
