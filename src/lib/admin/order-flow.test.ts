import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canSetStatus, restoresStock } from "./order-flow";

describe("sipariş durumu", () => {
  it("yalnızca ileri gider", () => {
    assert.equal(canSetStatus("PENDING", "PAID"), true);
    assert.equal(canSetStatus("PAID", "PREPARING"), true);
    assert.equal(canSetStatus("PREPARING", "SHIPPED"), true);
    assert.equal(canSetStatus("SHIPPED", "DELIVERED"), true);
    assert.equal(canSetStatus("PAID", "PENDING"), false);
    assert.equal(canSetStatus("DELIVERED", "SHIPPED"), false);
  });

  it("iptal ve iadeden çıkışa izin vermez", () => {
    assert.equal(canSetStatus("CANCELLED", "PENDING"), false);
    assert.equal(canSetStatus("REFUNDED", "PAID"), false);
    assert.equal(canSetStatus("CANCELLED", "CANCELLED"), true);
  });

  it("iptali yalnızca ödeme öncesi hazırlıkta açar", () => {
    assert.equal(canSetStatus("PENDING", "CANCELLED"), true);
    assert.equal(canSetStatus("PAID", "CANCELLED"), true);
    assert.equal(canSetStatus("PREPARING", "CANCELLED"), true);
    assert.equal(canSetStatus("SHIPPED", "CANCELLED"), false);
    assert.equal(canSetStatus("DELIVERED", "CANCELLED"), false);
  });

  it("iade kaydını bekleyen siparişe yazmaz", () => {
    assert.equal(canSetStatus("PENDING", "REFUNDED"), false);
    assert.equal(canSetStatus("PAID", "REFUNDED"), true);
    assert.equal(canSetStatus("DELIVERED", "REFUNDED"), true);
  });

  it("iptal ve iade stoku geri alır", () => {
    assert.equal(restoresStock("CANCELLED"), true);
    assert.equal(restoresStock("REFUNDED"), true);
    assert.equal(restoresStock("SHIPPED"), false);
  });
});
