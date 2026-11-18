import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Yönetim",
};

export const instant = false;

const cardClass =
  "group flex min-h-40 flex-col justify-between rounded-3xl border border-line bg-card p-5 shadow-[0_16px_40px_-30px_rgba(74,52,38,0.85)] transition hover:-translate-y-0.5 hover:border-coffee/40";

export default async function AdminHomePage() {
  await requireAdmin();
  const [categories, products, orders, pendingOrders, coupons] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.coupon.count({ where: { active: true } }),
    ]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs tracking-[0.18em] text-coffee uppercase">
        Genel bakış
      </p>
      <h1 className="font-display mt-2 text-4xl text-espresso">Yönetim</h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-espresso/80">
        Vitrin, sipariş ve indirimler.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <PanelCard
          href="/admin/kategoriler"
          title="Kategoriler"
          detail="Bölümler ve alt bölümler"
          stat={categories === 0 ? "Henüz yok" : `${categories} bölüm`}
          icon={<GridIcon />}
        />
        <PanelCard
          href="/admin/urunler"
          title="Ürünler"
          detail="Fiyat, stok ve görseller"
          stat={products === 0 ? "Henüz yok" : `${products} ürün`}
          icon={<TagIcon />}
        />
        <PanelCard
          href="/admin/siparisler"
          title="Siparişler"
          detail="Durum ve kargo bilgisi"
          stat={
            orders === 0
              ? "Henüz yok"
              : pendingOrders > 0
                ? `${pendingOrders} bekliyor`
                : `${orders} sipariş`
          }
          icon={<ReceiptIcon />}
        />
        <PanelCard
          href="/admin/kuponlar"
          title="Kuponlar"
          detail="Yüzde ve sabit indirim"
          stat={coupons === 0 ? "Aktif kupon yok" : `${coupons} aktif`}
          icon={<TicketIcon />}
        />
      </div>
    </section>
  );
}

function PanelCard({
  href,
  title,
  detail,
  stat,
  icon,
}: {
  href: string;
  title: string;
  detail: string;
  stat: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className={cardClass}>
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-coffee">
          {icon}
        </span>
        <span className="text-sm text-coffee">{stat}</span>
      </span>
      <span className="mt-8 block">
        <span className="font-display text-2xl text-espresso">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-espresso/80">
          {detail}
        </span>
      </span>
    </Link>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4.5 4.5h6.2v6.2H4.5zM13.3 4.5h6.2v6.2h-6.2zM4.5 13.3h6.2v6.2H4.5zM13.3 13.3h6.2v6.2h-6.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4.5 12.2 12 4.7h7.3V12l-7.5 7.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="15.2" cy="8.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M7 4.5h10v15l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9h5M9.5 12.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4.5 8.5a2 2 0 0 0 2-2h11a2 2 0 0 0 2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0-2 2h-11a2 2 0 0 0-2-2v-2a2 2 0 0 1 0-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="1.4 2.2"
      />
    </svg>
  );
}
