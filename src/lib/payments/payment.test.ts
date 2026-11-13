import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { canonicalAmount } from "./amount";
import { callbackSchema } from "./callback-schema";
import {
  activeProvider,
  iyzicoCharge,
  liveChargeClosed,
  paytrCharge,
} from "./providers";
import { signPayment, verifyPayment, type PaymentPayload } from "./signature";

const secret = "test-secret-at-least-thirty-two-chars";

const payload: PaymentPayload = {
  provider: "mock",
  orderId: "order_1",
  status: "SUCCEEDED",
  amount: "890.00",
  providerRef: "mock_0123456789abcdef",
};

const envKeys = [
  "AUTH_SECRET",
  "PAYMENT_PROVIDER",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "PAYTR_MERCHANT_ID",
  "PAYTR_MERCHANT_KEY",
  "PAYTR_MERCHANT_SALT",
] as const;

const previous = new Map<string, string | undefined>();

function remember() {
  for (const key of envKeys) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }
  process.env.AUTH_SECRET = secret;
}

remember();

afterEach(() => {
  for (const key of envKeys) {
    const value = previous.get(key);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  process.env.AUTH_SECRET = secret;
});

describe("ödeme tutarı ve imza", () => {
  it("tutarı iki kuruş basamağına sabitler", () => {
    assert.equal(canonicalAmount(890), "890.00");
    assert.equal(canonicalAmount("890.5"), "890.50");
    assert.equal(canonicalAmount({ toString: () => "1890.129" }), "1890.12");
    assert.equal(canonicalAmount("-10.2"), "-10.20");
  });

  it("imzayı doğrular ve tutar değişince reddeder", () => {
    const signature = signPayment(payload);
    assert.equal(verifyPayment(payload, signature), true);
    assert.equal(
      verifyPayment({ ...payload, amount: "890.01" }, signature),
      false,
    );
    assert.equal(verifyPayment(payload, "kısa"), false);
  });

  it("canlı sağlayıcı gövdesini kabul etmez", () => {
    const signature = signPayment(payload);
    const accepted = callbackSchema.safeParse({ ...payload, signature });
    assert.equal(accepted.success, true);
    const live = callbackSchema.safeParse({
      ...payload,
      provider: "iyzico",
      signature,
    });
    assert.equal(live.success, false);
    const amount = callbackSchema.safeParse({
      ...payload,
      amount: "890",
      signature,
    });
    assert.equal(amount.success, false);
  });
});

describe("canlı çekim", () => {
  it("anahtar olsa da çekim yapmaz", () => {
    assert.equal(activeProvider(), "mock");
    assert.equal(liveChargeClosed(), null);

    process.env.PAYMENT_PROVIDER = "iyzico";
    process.env.IYZICO_API_KEY = "key";
    process.env.IYZICO_SECRET_KEY = "secret";
    assert.equal(iyzicoCharge().ok, false);
    assert.match(liveChargeClosed() ?? "", /Canlı çekim kapalı/);

    process.env.PAYMENT_PROVIDER = "paytr";
    process.env.PAYTR_MERCHANT_ID = "1";
    process.env.PAYTR_MERCHANT_KEY = "key";
    process.env.PAYTR_MERCHANT_SALT = "salt";
    assert.equal(paytrCharge().ok, false);
    assert.match(liveChargeClosed() ?? "", /Canlı çekim kapalı/);
  });
});
