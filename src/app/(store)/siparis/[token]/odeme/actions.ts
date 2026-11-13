"use server";

import { randomBytes } from "node:crypto";
import { unstable_rethrow } from "next/navigation";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { signPayment } from "@/lib/payments/signature";
import {
  canonicalAmount,
  PaymentError,
  settlePayment,
} from "@/lib/payments/settle";

export type PaymentState = { error?: string };

export async function completeMockPayment(
  _state: PaymentState,
  formData: FormData,
): Promise<PaymentState> {
  const token = formData.get("token");
  const outcome = formData.get("outcome");
  if (typeof token !== "string" || !token) {
    return { error: "Sipariş bulunamadı." };
  }
  if (outcome !== "SUCCEEDED" && outcome !== "FAILED") {
    return { error: "Ödeme seçimi geçersiz." };
  }

  const order = await prisma.order.findUnique({
    where: { lookupToken: token },
    select: {
      id: true,
      payment: { select: { amount: true, provider: true, status: true } },
    },
  });
  if (!order?.payment || order.payment.provider !== "mock") {
    return { error: "Canlı çekim kapalı. Bu siparişte test ödemesi yok." };
  }
  if (order.payment.status === "SUCCEEDED") {
    redirect(`/siparis/${token}/odeme`);
  }

  const status: "SUCCEEDED" | "FAILED" =
    outcome === "SUCCEEDED" ? "SUCCEEDED" : "FAILED";
  const unsigned = {
    provider: "mock" as const,
    orderId: order.id,
    status,
    amount: canonicalAmount(order.payment.amount),
    providerRef: `mock_${randomBytes(8).toString("hex")}`,
  };
  const body = { ...unsigned, signature: signPayment(unsigned) };

  try {
    await settlePayment(body);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof PaymentError) {
      return { error: error.message };
    }
    console.error("Test ödemesi tamamlanamadı.");
    return { error: "Test ödemesi şu an tamamlanamadı." };
  }

  redirect(`/siparis/${token}/odeme`);
}
