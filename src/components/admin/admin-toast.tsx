"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastTone = "ok" | "err";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

const notices: Record<string, string> = {
  eklendi: "Ürün eklendi.",
  guncellendi: "Değişiklikler kaydedildi.",
  silindi: "Ürün silindi.",
  "kategori-eklendi": "Kategori eklendi.",
  "kategori-guncellendi": "Değişiklikler kaydedildi.",
  "kategori-silindi": "Kategori silindi.",
};

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(
  () => {},
);

export function useAdminToast() {
  return useContext(ToastContext);
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const notify = useCallback((message: string, tone: ToastTone = "ok") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Suspense fallback={null}>
        <NoticeFromQuery />
      </Suspense>
      {toast ? (
        <p
          key={toast.id}
          role={toast.tone === "err" ? "alert" : "status"}
          className={`fixed right-4 bottom-4 z-[70] max-w-sm rounded-2xl px-4 py-3 text-sm shadow-[0_16px_40px_-24px_rgba(74,52,38,0.9)] ${
            toast.tone === "err"
              ? "bg-danger text-background"
              : "bg-espresso text-background"
          }`}
        >
          {toast.message}
        </p>
      ) : null}
    </ToastContext.Provider>
  );
}

function NoticeFromQuery() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const notify = useAdminToast();
  const seen = useRef("");

  useEffect(() => {
    const key = params.get("bildirim");
    const token = params.get("iz");
    const message = key ? notices[key] : undefined;
    if (!key || !token || !message) {
      return;
    }
    if (seen.current === token) {
      return;
    }
    if (window.sessionStorage.getItem("admin-notice") === token) {
      seen.current = token;
      return;
    }
    seen.current = token;
    window.sessionStorage.setItem("admin-notice", token);
    notify(message, "ok");
    const next = new URLSearchParams(params.toString());
    next.delete("bildirim");
    next.delete("iz");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [notify, params, pathname, router]);

  return null;
}
