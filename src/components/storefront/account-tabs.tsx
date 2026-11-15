"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logoutCustomer } from "@/app/(store)/hesap/actions";

const tabs = [
  { id: "siparisler", label: "Siparişler" },
  { id: "adresler", label: "Adresler" },
  { id: "profil", label: "Profil" },
] as const;

export type AccountTab = (typeof tabs)[number]["id"];

export function AccountTabs({
  tab,
  orders,
  addresses,
  profile,
}: {
  tab: AccountTab;
  orders: ReactNode;
  addresses: ReactNode;
  profile: ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(tab);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setCurrent(tab);
  }, [tab]);

  function open(next: AccountTab) {
    setCurrent(next);
    const href = next === "siparisler" ? "/hesap" : `/hesap?bolum=${next}`;
    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  }

  const panel =
    current === "adresler" ? addresses : current === "profil" ? profile : orders;

  return (
    <>
      <nav
        className="mt-4 flex flex-wrap items-center gap-2"
        aria-label="Hesap"
      >
        {tabs.map((item) => {
          const selected = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
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
        <form action={logoutCustomer}>
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm text-espresso"
          >
            Çıkış
          </button>
        </form>
      </nav>
      <div className="mt-4 border-t border-espresso/10 pt-4">{panel}</div>
    </>
  );
}
