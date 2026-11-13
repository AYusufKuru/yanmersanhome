import type { ReactNode } from "react";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="font-display text-xl text-espresso">
            Yönetim
          </Link>
          <p className="ml-auto truncate text-sm text-muted">{admin.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-full border border-line px-4 text-sm text-espresso"
            >
              Çıkış
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      {children}
    </>
  );
}
