import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { orderLead } from "./order-view";

describe("sipariş metni", () => {
  it("ödenmiş siparişte tahsilat yapılmadığını söyler", () => {
    assert.match(orderLead("PAID", false), /Gerçek tahsilat yapılmadı/);
  });

  it("kargoyu ve iptali durumuna göre ayırır", () => {
    assert.equal(orderLead("SHIPPED", false), "Sipariş kargoya verildi.");
    assert.match(orderLead("CANCELLED", false), /Stok geri alındı/);
    assert.match(orderLead("REFUNDED", false), /para iadesi yapılmaz/);
  });

  it("başarısız testi ödenmemiş sipariş olarak bırakır", () => {
    assert.match(orderLead("PENDING", true), /Sipariş ödenmedi/);
    assert.match(orderLead("PENDING", false), /para çekilmez/i);
  });
});
