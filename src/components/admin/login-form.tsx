"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-sm text-espresso">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          key={state.email ?? ""}
          defaultValue={state.email ?? ""}
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm text-espresso">
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-espresso outline-none"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-coffee px-6 text-sm text-background disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor" : "Giriş yap"}
      </button>
    </form>
  );
}
