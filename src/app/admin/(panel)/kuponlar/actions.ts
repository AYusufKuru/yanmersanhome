"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  couponIssue,
  couponSchema,
  optionalDate,
  optionalInt,
  optionalMoney,
} from "@/lib/admin/coupon-schema";
import { isUniqueConflict } from "@/lib/admin/labels";
import { prisma } from "@/lib/db";

export type CouponFormState = { error?: string };

export async function createCoupon(
  _state: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    minSubtotal: formData.get("minSubtotal"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    usageLimit: formData.get("usageLimit"),
    perUserLimit: formData.get("perUserLimit"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: couponIssue(parsed.error) };
  }

  const data = parsed.data;
  try {
    await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        amount: Number(data.amount).toFixed(2),
        minSubtotal: optionalMoney(data.minSubtotal)
          ? Number(data.minSubtotal).toFixed(2)
          : null,
        startsAt: optionalDate(data.startsAt),
        endsAt: optionalDate(data.endsAt),
        usageLimit: optionalInt(data.usageLimit),
        perUserLimit: optionalInt(data.perUserLimit),
        active: data.active,
      },
    });
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { error: "Bu kupon kodu kullanılıyor." };
    }
    throw error;
  }

  redirect("/admin/kuponlar");
}

export async function setCouponActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await prisma.coupon.update({ where: { id }, data: { active } });
  redirect("/admin/kuponlar");
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: { _count: { select: { usages: true } } },
  });
  if (!coupon) {
    redirect("/admin/kuponlar");
  }
  if (coupon._count.usages > 0) {
    redirect("/admin/kuponlar?hata=kullanilmis");
  }
  await prisma.coupon.delete({ where: { id } });
  redirect("/admin/kuponlar");
}
