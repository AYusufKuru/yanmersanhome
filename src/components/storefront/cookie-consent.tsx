"use client";

import { useState } from "react";
import { AnalyticsScripts } from "@/components/storefront/analytics-scripts";
import {
  analyticsConfigured,
  consentCookieName,
  type ConsentChoice,
} from "@/lib/analytics";

const year = 60 * 60 * 24 * 180;

function writeConsent(choice: ConsentChoice) {
  document.cookie = `${consentCookieName}=${choice}; Path=/; Max-Age=${year}; SameSite=Lax`;
}

export function CookieConsent({ initial }: { initial: ConsentChoice | null }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(initial);
  const configured = analyticsConfigured();

  function choose(next: ConsentChoice) {
    writeConsent(next);
    setChoice(next);
  }

  return (
    <>
      <AnalyticsScripts enabled={choice === "all"} />
      {choice ? null : (
        <div
          role="dialog"
          aria-label="Çerez izni"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card px-4 py-4 shadow-lg"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end">
            <p className="text-sm leading-6 text-muted">
              Zorunlu çerezler sepet ve oturum içindir. Analitik ve reklam
              çerezleri yalnızca izin verirseniz açılır.
              {configured
                ? ""
                : " Ölçüm kimliği bağlı değil; izin verseniz de dış istek gitmez."}
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => choose("necessary")}
                className="inline-flex h-11 items-center justify-center rounded-full border border-line px-4 text-sm text-espresso"
              >
                Yalnızca zorunlu
              </button>
              <button
                type="button"
                onClick={() => choose("all")}
                className="inline-flex h-11 items-center justify-center rounded-full bg-coffee px-4 text-sm text-background"
              >
                Analitik ve reklam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
