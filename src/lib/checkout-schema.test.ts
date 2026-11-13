import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shipmentSchema } from "./admin/order-schema";
import { checkoutIssue, checkoutSchema } from "./checkout-schema";

const guest = {
  fullName: "Ayşe Deneme",
  phone: "0555 123 45 67",
  email: "Misafir@Yanmersanhome.local",
  city: "İzmir",
  district: "Karşıyaka",
  addressLine: "Deneme sokak no 4",
  postalCode: "35550",
  note: "",
  invoiceType: "INDIVIDUAL",
  companyName: "",
  taxNumber: "",
  taxOffice: "",
};

describe("sipariş formu", () => {
  it("misafir adresini kabul eder ve telefonu sadeleştirir", () => {
    const parsed = checkoutSchema.parse(guest);
    assert.equal(parsed.phone, "05551234567");
    assert.equal(parsed.email, "misafir@yanmersanhome.local");
  });

  it("kurumsal faturada vergi numarasını ister", () => {
    const parsed = checkoutSchema.safeParse({
      ...guest,
      invoiceType: "COMPANY",
      companyName: "A",
      taxNumber: "123",
      taxOffice: "",
    });
    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.match(checkoutIssue(parsed.error), /ünvan|Vergi|vergi/i);
    }
  });

  it("kısa takip numarasını reddeder", () => {
    const parsed = shipmentSchema.safeParse({
      id: "order_1",
      carrier: "Yurtiçi Kargo",
      trackingNumber: "12",
    });
    assert.equal(parsed.success, false);
  });
});
