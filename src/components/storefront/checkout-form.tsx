"use client";

import { useActionState, useState } from "react";
import { submitOrder } from "@/app/(store)/odeme/actions";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

export type CheckoutDefaults = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
};

export type CheckoutAddressOption = CheckoutDefaults & {
  id: string;
  label: string;
};

export function CheckoutForm({
  accountEmail,
  defaults,
  addresses = [],
}: {
  accountEmail?: string;
  defaults?: CheckoutDefaults;
  addresses?: CheckoutAddressOption[];
}) {
  const [state, action, pending] = useActionState(submitOrder, {});
  const [company, setCompany] = useState(false);
  const [pick, setPick] = useState(0);
  const chosen = addresses[pick];
  const values = chosen ?? defaults;

  return (
    <form action={action} className="grid gap-4">
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {addresses.length > 0 ? (
        <label className="text-sm text-espresso">
          Kayıtlı adres
          <select
            className={inputClass}
            value={String(pick)}
            onChange={(event) => setPick(Number(event.target.value))}
          >
            {addresses.map((address, index) => (
              <option key={address.id} value={index}>
                {address.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div key={chosen?.id ?? "yeni"} className="grid gap-4">
        <label className="text-sm text-espresso">
          Ad soyad
          <input
            name="fullName"
            required
            autoComplete="name"
            defaultValue={values?.fullName ?? ""}
            className={inputClass}
          />
        </label>
        <label className="text-sm text-espresso">
          Telefon
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="05xx"
            defaultValue={values?.phone ?? ""}
            className={inputClass}
          />
        </label>
        <label className="text-sm text-espresso">
          E-posta
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            readOnly={Boolean(accountEmail)}
            defaultValue={accountEmail ?? values?.email ?? ""}
            className={inputClass}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-espresso">
            Şehir
            <input
              name="city"
              required
              autoComplete="address-level1"
              defaultValue={values?.city ?? ""}
              className={inputClass}
            />
          </label>
          <label className="text-sm text-espresso">
            İlçe
            <input
              name="district"
              required
              autoComplete="address-level2"
              defaultValue={values?.district ?? ""}
              className={inputClass}
            />
          </label>
        </div>
        <label className="text-sm text-espresso">
          Açık adres
          <textarea
            name="addressLine"
            required
            autoComplete="street-address"
            defaultValue={values?.addressLine ?? ""}
            className="mt-2 min-h-28 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
          />
        </label>
        <label className="text-sm text-espresso">
          Posta kodu
          <input
            name="postalCode"
            inputMode="numeric"
            autoComplete="postal-code"
            defaultValue={values?.postalCode ?? ""}
            className={inputClass}
          />
        </label>
      </div>
      <label className="text-sm text-espresso">
        Fatura
        <select
          name="invoiceType"
          defaultValue="INDIVIDUAL"
          className={inputClass}
          onChange={(event) => setCompany(event.target.value === "COMPANY")}
        >
          <option value="INDIVIDUAL">Bireysel</option>
          <option value="COMPANY">Kurumsal</option>
        </select>
      </label>
      {company ? (
        <>
          <label className="text-sm text-espresso">
            Ünvan
            <input name="companyName" required className={inputClass} />
          </label>
          <label className="text-sm text-espresso">
            Vergi numarası
            <input
              name="taxNumber"
              required
              inputMode="numeric"
              className={inputClass}
            />
          </label>
          <label className="text-sm text-espresso">
            Vergi dairesi
            <input name="taxOffice" required className={inputClass} />
          </label>
        </>
      ) : (
        <>
          <input type="hidden" name="companyName" value="" />
          <input type="hidden" name="taxNumber" value="" />
          <input type="hidden" name="taxOffice" value="" />
        </>
      )}
      <label className="text-sm text-espresso">
        Sipariş notu
        <textarea
          name="note"
          className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      {accountEmail ? (
        <label className="flex items-center gap-3 text-sm text-espresso">
          <input name="saveAddress" type="checkbox" className="h-4 w-4" />
          Adresi hesabıma kaydet
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Kaydediliyor" : "Siparişi kaydet"}
      </button>
      <p className="text-sm leading-6 text-muted">
        Kart bilgisi istenmez. Sonraki ekran test ödemesidir, para çekilmez.
        Sipariş kaydı stoğu düşürür.
      </p>
    </form>
  );
}
