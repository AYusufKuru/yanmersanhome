"use client";

import { useActionState } from "react";
import type { OrderStatus } from "@/generated/prisma/client";
import {
  saveShipment,
  updateOrderStatus,
} from "@/app/admin/(panel)/siparisler/actions";
import { orderStatusLabel } from "@/lib/order-status";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

export function OrderStatusForm({
  id,
  status,
  allowed,
}: {
  id: string;
  status: OrderStatus;
  allowed: OrderStatus[];
}) {
  const [state, action, pending] = useActionState(updateOrderStatus, {});

  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="id" value={id} />
      <label className="text-sm text-espresso">
        Durum
        <select name="status" defaultValue={status} className={inputClass}>
          {allowed.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-espresso">
        Not
        <textarea
          name="note"
          className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Kaydediliyor" : "Durumu kaydet"}
      </button>
    </form>
  );
}

export function ShipmentForm({
  id,
  carrier,
  trackingNumber,
}: {
  id: string;
  carrier: string;
  trackingNumber: string;
}) {
  const [state, action, pending] = useActionState(saveShipment, {});

  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="id" value={id} />
      <label className="text-sm text-espresso">
        Kargo firması
        <input
          name="carrier"
          required
          defaultValue={carrier}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Takip numarası
        <input
          name="trackingNumber"
          required
          defaultValue={trackingNumber}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Kaydediliyor" : "Kargoyu kaydet"}
      </button>
    </form>
  );
}
