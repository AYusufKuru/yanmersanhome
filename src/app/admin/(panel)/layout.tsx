import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminToastProvider } from "@/components/admin/admin-toast";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AdminToastProvider>
      <header className="sticky top-0 z-30 border-b border-line bg-background">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6 lg:h-16 lg:flex-row lg:items-center lg:gap-6 lg:py-0">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-baseline gap-2">
              <span className="font-display text-lg text-espresso">
                Yanmersanhome
              </span>
              <span className="text-[0.7rem] tracking-[0.16em] text-coffee uppercase">
                Yönetim
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <p className="max-w-36 truncate text-sm text-muted">
                {admin.email}
              </p>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full border border-line bg-card px-3 text-sm text-espresso"
                >
                  Çıkış
                </button>
              </form>
            </div>
          </div>
          <AdminNav />
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <p className="max-w-52 truncate text-sm text-muted">{admin.email}</p>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-full border border-line bg-card px-3.5 text-sm text-espresso"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </AdminToastProvider>
  );
}
