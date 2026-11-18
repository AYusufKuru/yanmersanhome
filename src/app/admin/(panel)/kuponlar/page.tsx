import type { Metadata } from "next";
import { CouponForm } from "@/components/admin/coupon-form";
import { deleteCoupon, setCouponActive } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Kuponlar" };
export const instant = false;

function money(value: { toString(): string }) {
  return Number(value.toString()).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
  });
}

type CouponsPageProps = {
  searchParams: Promise<{ hata?: string }>;
};

export default async function CouponsPage({ searchParams }: CouponsPageProps) {
  await requireAdmin();
  const { hata } = await searchParams;
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      amount: true,
      minSubtotal: true,
      active: true,
      usageLimit: true,
      _count: { select: { usages: true } },
    },
  });

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl text-espresso">Kuponlar</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          İndirim sepet tutarı üzerinden sunucuda hesaplanır.
        </p>
        {hata === "kullanilmis" ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            Kullanılmış kupon silinemez. Pasifleştirin.
          </p>
        ) : null}
        {coupons.length === 0 ? (
          <p className="mt-8 text-base text-muted">Henüz kupon yok.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {coupons.map((coupon) => (
              <li
                key={coupon.id}
                className="rounded-2xl border border-line bg-card px-4 py-3 shadow-[0_12px_30px_-26px_rgba(74,52,38,0.9)]"
              >
                <p className="text-base text-espresso">{coupon.code}</p>
                <p className="mt-1 text-sm text-muted">
                  {coupon.type === "PERCENT"
                    ? `%${Number(coupon.amount.toString())}`
                    : money(coupon.amount)}
                  {coupon.minSubtotal
                    ? ` · en az ${money(coupon.minSubtotal)}`
                    : ""}
                  {coupon.usageLimit !== null
                    ? ` · ${coupon._count.usages}/${coupon.usageLimit}`
                    : ""}
                  {coupon.active ? "" : " · pasif"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={setCouponActive}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={coupon.active ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm text-espresso"
                    >
                      {coupon.active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </form>
                  <form action={deleteCoupon}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center rounded-full border border-danger px-4 text-sm text-danger"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="font-display text-2xl text-espresso">Yeni kupon</h2>
        <div className="mt-6">
          <CouponForm />
        </div>
      </div>
    </section>
  );
}
