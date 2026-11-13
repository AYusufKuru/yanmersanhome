"use client";

import { useEffect, useRef } from "react";
import { analyticsReady, track } from "@/lib/analytics";

export function ViewContent({
  slug,
  name,
  value,
}: {
  slug: string;
  name: string;
  value: number;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) {
      return;
    }
    sent.current = true;
    track("ViewContent", {
      content_ids: [slug],
      content_name: name,
      value,
      currency: "TRY",
    });
  }, [slug, name, value]);
  return null;
}

export function CheckoutEvent({ value }: { value: number }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) {
      return;
    }
    sent.current = true;
    track("InitiateCheckout", { value, currency: "TRY" });
  }, [value]);
  return null;
}

const paidStatuses = new Set(["PAID", "PREPARING", "SHIPPED", "DELIVERED"]);

export function PurchaseEvent({
  orderNumber,
  status,
  value,
}: {
  orderNumber: string;
  status: string;
  value: number;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !paidStatuses.has(status)) {
      return;
    }
    if (!analyticsReady()) {
      return;
    }
    const key = `yanmersan_purchase_${orderNumber}`;
    if (sessionStorage.getItem(key)) {
      return;
    }
    sent.current = true;
    sessionStorage.setItem(key, "1");
    track("Purchase", {
      transaction_id: orderNumber,
      value,
      currency: "TRY",
    });
  }, [orderNumber, status, value]);
  return null;
}
