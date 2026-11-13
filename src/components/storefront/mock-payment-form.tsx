"use client";

import { useActionState } from "react";
import { completeMockPayment } from "@/app/(store)/siparis/[token]/odeme/actions";

function OutcomeButton({
  token,
  outcome,
  label,
  primary,
}: {
  token: string;
  outcome: "SUCCEEDED" | "FAILED";
  label: string;
  primary?: boolean;
}) {
  const [state, action, pending] = useActionState(completeMockPayment, {});

  return (
    <form action={action}>
      {state.error ? (
        <p role="alert" className="mb-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="outcome" value={outcome} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm disabled:opacity-60 ${
          primary
            ? "bg-coffee text-background"
            : "border border-line bg-card text-espresso"
        }`}
      >
        {pending ? "Kaydediliyor" : label}
      </button>
    </form>
  );
}

export function MockPaymentForm({ token }: { token: string }) {
  return (
    <div className="mt-8 grid gap-3">
      <OutcomeButton
        token={token}
        outcome="SUCCEEDED"
        label="Test ödemesini başarılı say"
        primary
      />
      <OutcomeButton
        token={token}
        outcome="FAILED"
        label="Test ödemesini başarısız say"
      />
    </div>
  );
}
