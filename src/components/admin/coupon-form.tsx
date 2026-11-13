"use client";

import { useActionState } from "react";
import { createCoupon } from "@/app/admin/(panel)/kuponlar/actions";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

export function CouponForm() {
  const [state, action, pending] = useActionState(createCoupon, {});

  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <label className="text-sm text-espresso">
        Kod
        <input name="code" required className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        Tür
        <select name="type" defaultValue="PERCENT" className={inputClass}>
          <option value="PERCENT">Yüzde</option>
          <option value="FIXED">Sabit tutar</option>
        </select>
      </label>
      <label className="text-sm text-espresso">
        İndirim
        <input
          name="amount"
          required
          inputMode="decimal"
          placeholder="10 veya 150,00"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Minimum sepet tutarı
        <input name="minSubtotal" inputMode="decimal" className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        Başlangıç
        <input name="startsAt" type="datetime-local" className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        Bitiş
        <input name="endsAt" type="datetime-local" className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        Kullanım limiti
        <input name="usageLimit" inputMode="numeric" className={inputClass} />
      </label>
      <label className="text-sm text-espresso">
        Müşteri başına limit
        <input name="perUserLimit" inputMode="numeric" className={inputClass} />
      </label>
      <label className="flex h-12 items-center gap-3 text-sm text-espresso">
        <input name="active" type="checkbox" defaultChecked />
        Aktif
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Kaydediliyor" : "Kuponu kaydet"}
      </button>
    </form>
  );
}
