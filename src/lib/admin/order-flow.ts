import type { OrderStatus } from "@/generated/prisma/client";

const forward: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
];

export function canSetStatus(from: OrderStatus, to: OrderStatus) {
  if (from === to) {
    return true;
  }
  if (from === "CANCELLED" || from === "REFUNDED") {
    return false;
  }
  if (to === "CANCELLED") {
    return from === "PENDING" || from === "PAID" || from === "PREPARING";
  }
  if (to === "REFUNDED") {
    return from !== "PENDING";
  }
  return forward.indexOf(to) > forward.indexOf(from);
}

export function restoresStock(to: OrderStatus) {
  return to === "CANCELLED" || to === "REFUNDED";
}
