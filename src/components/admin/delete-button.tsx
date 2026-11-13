"use client";

import { useActionState } from "react";

type FormState = { error?: string };

export function DeleteButton({
  action,
  label,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-10">
      {state.error ? (
        <p role="alert" className="mb-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center rounded-full border border-danger px-5 text-sm text-danger disabled:opacity-60"
      >
        {pending ? "Siliniyor" : label}
      </button>
    </form>
  );
}
