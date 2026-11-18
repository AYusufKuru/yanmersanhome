"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const tabs = [
  { id: "misafir", label: "Misafir girişi" },
  { id: "giris", label: "Giriş yap" },
  { id: "kayit", label: "Hesap aç" },
] as const;

export type GuestTab = (typeof tabs)[number]["id"];

export function GuestGate({
  tab,
  guest,
  login,
  register,
}: {
  tab: GuestTab;
  guest: ReactNode;
  login: ReactNode;
  register: ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(tab);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCurrent(tab);
  }, [tab]);

  function open(next: GuestTab) {
    setCurrent(next);
    const href = next === "misafir" ? "/hesap" : `/hesap?bolum=${next}`;
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  const panel =
    current === "giris" ? login : current === "kayit" ? register : guest;

  return (
    <>
      <div
        className="mt-4 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Hesaba giriş"
      >
        {tabs.map((item) => {
          const selected = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => open(item.id)}
              className={`inline-flex h-11 items-center rounded-full px-4 text-sm ${
                selected
                  ? "bg-espresso text-background"
                  : "border border-line bg-card text-espresso"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 border-t border-espresso/10 pt-4">{panel}</div>
    </>
  );
}
