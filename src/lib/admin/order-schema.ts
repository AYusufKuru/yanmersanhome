import { z } from "zod";

export const orderStatuses = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(orderStatuses, { error: "Durum seçin." }),
  note: z.string().trim().max(500, { error: "Not en fazla 500 karakter." }),
});

export const shipmentSchema = z.object({
  id: z.string().min(1),
  carrier: z.string().trim().min(2, { error: "Kargo firması yazın." }).max(80),
  trackingNumber: z
    .string()
    .trim()
    .min(3, { error: "Takip numarası yazın." })
    .max(40),
});

export function orderIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Bilgiler geçersiz.";
}
