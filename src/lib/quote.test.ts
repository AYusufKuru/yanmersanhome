import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  quoteCart,
  type QuoteCoupon,
  type QuoteInput,
  type QuoteLine,
} from "./quote";

const now = new Date("2026-11-13T12:00:00Z");

function line(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    unitKurus: 189_000,
    quantity: 1,
    stock: 4,
    active: true,
    ...overrides,
  };
}

function coupon(overrides: Partial<QuoteCoupon> = {}): QuoteCoupon {
  return {
    type: "PERCENT",
    amount: 10,
    minSubtotalKurus: null,
    active: true,
    startsAt: null,
    endsAt: null,
    usageCount: 0,
    usageLimit: null,
    perUserCount: null,
    perUserLimit: null,
    ...overrides,
  };
}

function price(overrides: Partial<QuoteInput> = {}) {
  return quoteCart({
    lines: [line()],
    coupon: null,
    shippingFeeKurus: 4_900,
    freeShippingLimitKurus: 150_000,
    now,
    ...overrides,
  });
}

describe("sepet hesabı", () => {
  it("stoktan fazla adedi keser", () => {
    const result = price({ lines: [line({ quantity: 9, stock: 2 })] });
    assert.equal(result.lines[0]?.quantity, 2);
    assert.equal(result.subtotalKurus, 378_000);
  });

  it("yayında olmayan veya stoksuz satırı toplama katmaz", () => {
    const result = price({
      lines: [line({ active: false }), line({ stock: 0, unitKurus: 89_000 })],
    });
    assert.equal(result.subtotalKurus, 0);
    assert.equal(result.shippingKurus, 0);
    assert.equal(result.totalKurus, 0);
  });

  it("yüzde indirimi kuruşa yuvarlar ve ara toplamı aşmaz", () => {
    const result = price({
      lines: [line({ unitKurus: 1_001, stock: 1 })],
      coupon: coupon({ amount: 10 }),
      freeShippingLimitKurus: null,
    });
    assert.equal(result.discountKurus, 100);
    assert.equal(result.totalKurus, 901 + 4_900);
  });

  it("sabit kuponu sepet tutarıyla sınırlar", () => {
    const result = price({
      lines: [line({ unitKurus: 3_000 })],
      coupon: coupon({ type: "FIXED", amount: 5_000 }),
      shippingFeeKurus: 0,
      freeShippingLimitKurus: null,
    });
    assert.equal(result.discountKurus, 3_000);
    assert.equal(result.totalKurus, 0);
  });

  it("süresi dolan kuponu uygulamaz", () => {
    const result = price({
      coupon: coupon({ endsAt: new Date("2026-11-01T00:00:00Z") }),
      shippingFeeKurus: 0,
      freeShippingLimitKurus: null,
    });
    assert.equal(result.discountKurus, 0);
    assert.equal(result.couponMessage, "Bu kuponun süresi doldu.");
    assert.equal(result.totalKurus, 189_000);
  });

  it("indirimden sonraki tutar limite ulaşınca kargoyu sıfırlar", () => {
    const result = price({
      lines: [line({ unitKurus: 100_000 })],
      coupon: coupon({ amount: 10 }),
      shippingFeeKurus: 4_900,
      freeShippingLimitKurus: 90_000,
    });
    assert.equal(result.discountKurus, 10_000);
    assert.equal(result.shippingKurus, 0);
    assert.equal(result.totalKurus, 90_000);
  });

  it("limitin altında kargo ücretini ekler", () => {
    const result = price({
      lines: [line({ unitKurus: 50_000 })],
      shippingFeeKurus: 4_900,
      freeShippingLimitKurus: 90_000,
    });
    assert.equal(result.shippingKurus, 4_900);
    assert.equal(result.totalKurus, 54_900);
  });
});
