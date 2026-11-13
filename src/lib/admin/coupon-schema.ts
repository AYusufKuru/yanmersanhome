import { z } from "zod";

const money = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s/g, "").replace(",", "."))
  .refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), {
    error: "Tutar geçersiz.",
  });

const whole = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), {
    error: "Sayı geçersiz.",
  });

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, { error: "Kod en az 3 karakter olmalı." })
      .max(32)
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z0-9-]+$/.test(value), {
        error: "Kod yalnızca harf, rakam ve tire içerebilir.",
      }),
    type: z.enum(["PERCENT", "FIXED"], { error: "İndirim türü seçin." }),
    amount: money,
    minSubtotal: money,
    startsAt: z.string().trim(),
    endsAt: z.string().trim(),
    usageLimit: whole,
    perUserLimit: whole,
    active: z.boolean(),
  })
  .superRefine((value, context) => {
    const amount = Number(value.amount);
    if (!value.amount || amount <= 0) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "İndirim tutarı geçersiz.",
      });
    }
    if (value.type === "PERCENT" && amount > 100) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Yüzde 100’den büyük olamaz.",
      });
    }
    if (value.startsAt && value.endsAt && value.startsAt > value.endsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "Bitiş, başlangıçtan önce olamaz.",
      });
    }
  });

export function couponIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Kupon kaydedilemedi.";
}

export function optionalMoney(value: string) {
  return value ? value : null;
}

export function optionalInt(value: string) {
  return value ? Number(value) : null;
}

export function optionalDate(value: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
