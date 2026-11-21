"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  changePassword,
  createAddress,
  loginCustomer,
  lookupGuestOrder,
  registerCustomer,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  type AccountState,
} from "@/app/(store)/hesap/actions";

const inputClass =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none";

const buttonClass =
  "inline-flex h-12 items-center justify-center rounded-full bg-coffee px-5 text-sm text-background disabled:opacity-60";

function EyeOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M2.5 12S6.2 6.8 12 6.8 21.5 12 21.5 12 17.8 17.2 12 17.2 2.5 12 2.5 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3.5 10.2c2.1 2.8 5 4.3 8.5 4.3s6.4-1.5 8.5-4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.2 13.4 6.8 16.2M12 14.6v3M15.8 13.4l1.4 2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
}: {
  label: string;
  name: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const [filled, setFilled] = useState(false);

  return (
    <label className="min-w-0 text-sm text-espresso">
      {label}
      <span className="relative mt-2 block">
        <input
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          onChange={(event) => {
            const hasValue = event.target.value.length > 0;
            setFilled(hasValue);
            if (!hasValue) {
              setVisible(false);
            }
          }}
          className={`h-12 w-full rounded-2xl border border-line bg-card pl-4 text-base text-espresso outline-none ${filled ? "pr-11" : "pr-4"}`}
        />
        {filled ? (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={visible}
            className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-coffee/45"
          >
            {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
        ) : null}
      </span>
    </label>
  );
}

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
    <form action={action} className="mt-4 grid gap-4">
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
      <div className="grid grid-cols-2 gap-3">
        <PasswordField
          label="Şifre"
          name="password"
          autoComplete="new-password"
        />
        <PasswordField
          label="Şifre tekrar"
          name="confirmPassword"
          autoComplete="new-password"
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Açılıyor" : "Hesap aç"}
      </button>
    </form>
  );
}

export function CustomerLoginForm() {
  const [state, action, pending] = useActionState(loginCustomer, {});

  return (
    <form action={action} className="mt-4 grid gap-4">
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
      <PasswordField
        label="Şifre"
        name="password"
        autoComplete="current-password"
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Giriliyor" : "Giriş yap"}
      </button>
      <Link href="/hesap/sifre" className="text-sm text-coffee">
        Şifremi unuttum
      </Link>
    </form>
  );
}

export function PasswordResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  return (
    <form action={action} className="mt-4 grid gap-4">
      {state.sent ? (
        <p className="text-sm text-success">
          Bu adres kayıtlıysa sıfırlama bağlantısı gönderildi.
        </p>
      ) : (
        <Alert state={state} />
      )}
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
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Gönderiliyor" : "Bağlantı gönder"}
      </button>
    </form>
  );
}

export function PasswordResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, {});

  return (
    <form action={action} className="mt-4 grid gap-4">
      <Alert state={state} />
      <input type="hidden" name="token" value={token} />
      <PasswordField
        label="Yeni şifre"
        name="password"
        autoComplete="new-password"
      />
      <PasswordField
        label="Yeni şifre, yeniden"
        name="confirmPassword"
        autoComplete="new-password"
      />
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Kaydediliyor" : "Şifreyi yenile"}
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
        className={compact ? `${buttonClass} col-span-full w-full` : buttonClass}
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
      <PasswordField
        label="Mevcut şifre"
        name="currentPassword"
        autoComplete="current-password"
      />
      <PasswordField
        label="Yeni şifre"
        name="nextPassword"
        autoComplete="new-password"
      />
      <PasswordField
        label="Yeni şifre, yeniden"
        name="confirmPassword"
        autoComplete="new-password"
      />
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
