"use client";

import { useActionState } from "react";
import {
  changePassword,
  createAddress,
  loginCustomer,
  lookupGuestOrder,
  registerCustomer,
  updateProfile,
  type AccountState,
} from "@/app/(store)/hesap/actions";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

const buttonClass =
  "inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60";

function Alert({ state }: { state: AccountState }) {
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.saved) {
    return <p className="text-sm text-success">Kaydedildi.</p>;
  }
  return null;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerCustomer, {});

  return (
    <form action={action} className="mt-8 grid gap-4">
      <Alert state={state} />
      <label className="text-sm text-espresso">
        Ad soyad
        <input
          name="name"
          required
          autoComplete="name"
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
          defaultValue={state.email ?? ""}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Telefon
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="İsteğe bağlı"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Şifre
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Açılıyor" : "Hesap aç"}
      </button>
    </form>
  );
}

export function CustomerLoginForm() {
  const [state, action, pending] = useActionState(loginCustomer, {});

  return (
    <form action={action} className="mt-8 grid gap-4">
      <Alert state={state} />
      <label className="text-sm text-espresso">
        E-posta
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email ?? ""}
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Şifre
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Giriliyor" : "Giriş yap"}
      </button>
    </form>
  );
}

export function GuestLookupForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(lookupGuestOrder, {});
  const fieldClass = compact
    ? "mt-1.5 h-10 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none"
    : inputClass;

  return (
    <form
      action={action}
      className={
        compact ? "mt-3 grid gap-3 sm:grid-cols-2" : "mt-4 grid gap-4"
      }
    >
      <Alert state={state} />
      <label className="text-sm text-espresso">
        Sipariş numarası
        <input
          name="number"
          required
          autoComplete="off"
          placeholder="YM-00000000"
          className={fieldClass}
        />
      </label>
      <label className="text-sm text-espresso">
        E-posta
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className={compact ? `${buttonClass} sm:col-span-2 sm:w-fit` : buttonClass}
      >
        {pending ? "Aranıyor" : "Siparişi aç"}
      </button>
    </form>
  );
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});

  return (
    <form action={action} className="grid gap-4">
      <Alert state={state} />
      <label className="text-sm text-espresso">
        Ad soyad
        <input
          name="name"
          required
          defaultValue={name}
          autoComplete="name"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Telefon
        <input
          name="phone"
          type="tel"
          defaultValue={phone}
          autoComplete="tel"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Kaydediliyor" : "Profili kaydet"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});

  return (
    <form action={action} className="grid gap-4">
      <Alert state={state} />
      <label className="text-sm text-espresso">
        Mevcut şifre
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Yeni şifre
        <input
          name="nextPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="text-sm text-espresso">
        Yeni şifre, yeniden
        <input
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Kaydediliyor" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}

export function AddressForm() {
  const [state, action, pending] = useActionState(createAddress, {});

  return (
    <form action={action} className="grid gap-4">
      <Alert state={state} />
      <label className="text-sm text-espresso">
        Ad soyad
        <input
          name="fullName"
          required
          autoComplete="name"
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
          className={inputClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-espresso">
          Şehir
          <input name="city" required className={inputClass} />
        </label>
        <label className="text-sm text-espresso">
          İlçe
          <input name="district" required className={inputClass} />
        </label>
      </div>
      <label className="text-sm text-espresso">
        Açık adres
        <textarea
          name="line"
          required
          className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-espresso outline-none"
        />
      </label>
      <label className="text-sm text-espresso">
        Posta kodu
        <input name="postalCode" inputMode="numeric" className={inputClass} />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Kaydediliyor" : "Adresi kaydet"}
      </button>
    </form>
  );
}
