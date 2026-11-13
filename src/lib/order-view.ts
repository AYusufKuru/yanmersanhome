import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";

type Money = { toString(): string };

type PresentableOrder = {
  number: string;
  status: keyof typeof orderStatusLabel;
  createdAt: Date;
  subtotal: Money;
  discount: Money;
  shippingFee: Money;
  total: Money;
  couponCode: string | null;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string | null;
  note: string | null;
  invoiceType: "INDIVIDUAL" | "COMPANY";
  companyName: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    lineTotal: Money;
  }[];
  events: {
    id: string;
    status: keyof typeof orderStatusLabel;
    note: string | null;
    createdAt: Date;
  }[];
  shipment: {
    carrier: string | null;
    trackingNumber: string | null;
  } | null;
};

function money(value: Money) {
  return formatPrice(Number(value.toString()));
}

export function orderLead(
  status: PresentableOrder["status"],
  paymentFailed: boolean,
) {
  if (status === "PAID") {
    return "Test ödemesi kaydedildi. Gerçek tahsilat yapılmadı.";
  }
  if (status === "PREPARING") {
    return "Sipariş hazırlanıyor.";
  }
  if (status === "SHIPPED") {
    return "Sipariş kargoya verildi.";
  }
  if (status === "DELIVERED") {
    return "Sipariş teslim edildi.";
  }
  if (status === "CANCELLED") {
    return "Sipariş iptal edildi. Stok geri alındı.";
  }
  if (status === "REFUNDED") {
    return "İade kaydı oluşturuldu. Test ödemesinde para iadesi yapılmaz.";
  }
  if (paymentFailed) {
    return "Test ödemesi başarısız. Sipariş ödenmedi. Stok bu kayıtla ayrıldı.";
  }
  return "Sipariş kaydedildi. Test ödemesi sonraki ekranda. Kart istenmez, para çekilmez.";
}

export function presentOrder(order: PresentableOrder) {
  const shipment = [order.shipment?.carrier, order.shipment?.trackingNumber]
    .filter((part) => part && part.trim())
    .join(" · ");

  return {
    number: order.number,
    statusLabel: orderStatusLabel[order.status],
    createdLabel: formatDate(order.createdAt),
    lines: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,
      total: money(item.lineTotal),
    })),
    subtotal: money(order.subtotal),
    discount: money(order.discount),
    shipping: money(order.shippingFee),
    total: money(order.total),
    couponCode: order.couponCode,
    fullName: order.fullName,
    phone: order.phone,
    email: order.email,
    address: `${order.addressLine}, ${order.district} / ${order.city}${
      order.postalCode ? ` ${order.postalCode}` : ""
    }`,
    invoice:
      order.invoiceType === "COMPANY"
        ? `${order.companyName} · ${order.taxNumber} · ${order.taxOffice}`
        : "Bireysel fatura",
    note: order.note,
    events: order.events.map((event) => ({
      id: event.id,
      label: orderStatusLabel[event.status],
      when: formatDate(event.createdAt),
      note: event.note,
    })),
    shipment: shipment || null,
  };
}

export const orderReceiptSelect = {
  number: true,
  status: true,
  createdAt: true,
  subtotal: true,
  discount: true,
  shippingFee: true,
  total: true,
  couponCode: true,
  fullName: true,
  phone: true,
  email: true,
  city: true,
  district: true,
  addressLine: true,
  postalCode: true,
  note: true,
  invoiceType: true,
  companyName: true,
  taxNumber: true,
  taxOffice: true,
  items: {
    select: {
      id: true,
      productName: true,
      quantity: true,
      lineTotal: true,
    },
  },
  events: {
    orderBy: { createdAt: "asc" as const },
    select: { id: true, status: true, note: true, createdAt: true },
  },
  shipment: { select: { carrier: true, trackingNumber: true } },
  lookupToken: true,
  payment: { select: { status: true, provider: true } },
};
