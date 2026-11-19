"use client";

import { useRouter } from "next/navigation";

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3 text-sm text-espresso"
    >
      <span aria-hidden="true">←</span>
      Geri
    </button>
  );
}
