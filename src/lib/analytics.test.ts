import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  analyticsConfigured,
  analyticsIds,
  parseConsent,
  track,
} from "./analytics";

const keys = [
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
] as const;

const previous = new Map<string, string | undefined>();

for (const key of keys) {
  previous.set(key, process.env[key]);
  delete process.env[key];
}

afterEach(() => {
  for (const key of keys) {
    const value = previous.get(key);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("analitik", () => {
  it("boş veya bozuk kimlikte ölçümü kapalı tutar", () => {
    assert.equal(analyticsConfigured(), false);
    process.env.NEXT_PUBLIC_GA_ID = "UA-123";
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID = "AW-not";
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "abc";
    assert.deepEqual(analyticsIds(), { gaId: "", adsId: "", pixelId: "" });
    assert.doesNotThrow(() =>
      track("Purchase", { value: 890, currency: "TRY" }),
    );
  });

  it("geçerli kimliği tanır ama izinsiz çerezi ölçüme açmaz", () => {
    process.env.NEXT_PUBLIC_GA_ID = "G-TEST123";
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1234567890";
    assert.equal(analyticsConfigured(), true);
    assert.equal(parseConsent(undefined), null);
    assert.equal(parseConsent("necessary"), "necessary");
    assert.equal(parseConsent("all"), "all");
    const calls: unknown[] = [];
    const win = globalThis as { document?: { cookie: string }; gtag?: unknown };
    const previousDocument = win.document;
    win.document = { cookie: "yanmersan_consent=necessary" };
    win.gtag = (...args: unknown[]) => {
      calls.push(args);
    };
    try {
      track("Purchase", { transaction_id: "YM-4673DB42", value: 890 });
    } finally {
      if (previousDocument === undefined) {
        delete win.document;
      } else {
        win.document = previousDocument;
      }
      delete win.gtag;
    }
    assert.deepEqual(calls, []);
  });
});
