import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetim",
};

export const instant = false;

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-espresso">Yönetim</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">
        Sipariş, kargo, ürün ve kupon buradan yönetilir. Yayındaki ürünler
        vitrinde görünür.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/kategoriler"
          className="flex min-h-24 flex-col justify-center rounded-2xl border border-line bg-card px-5"
        >
          <span className="text-lg text-espresso">Kategoriler</span>
          <span className="mt-1 text-sm text-muted">
            Bölümler ve alt bölümler
          </span>
        </Link>
        <Link
          href="/admin/urunler"
          className="flex min-h-24 flex-col justify-center rounded-2xl border border-line bg-card px-5"
        >
          <span className="text-lg text-espresso">Ürünler</span>
          <span className="mt-1 text-sm text-muted">
            Fiyat, stok ve görseller
          </span>
        </Link>
        <Link
          href="/admin/siparisler"
          className="flex min-h-24 flex-col justify-center rounded-2xl border border-line bg-card px-5"
        >
          <span className="text-lg text-espresso">Siparişler</span>
          <span className="mt-1 text-sm text-muted">
            Durum ve kargo bilgisi
          </span>
        </Link>
        <Link
          href="/admin/kuponlar"
          className="flex min-h-24 flex-col justify-center rounded-2xl border border-line bg-card px-5"
        >
          <span className="text-lg text-espresso">Kuponlar</span>
          <span className="mt-1 text-sm text-muted">
            Yüzde ve sabit indirim
          </span>
        </Link>
      </div>
    </section>
  );
}
