import "server-only";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { canonicalAmount } from "@/lib/payments/amount";
import { verifyPayment, type PaymentPayload } from "@/lib/payments/signature";

export { canonicalAmount };

export class PaymentError extends Error {}

export type MockCallback = PaymentPayload & {
  provider: "mock";
  status: "SUCCEEDED" | "FAILED";
  signature: string;
};

export async function settlePayment(body: MockCallback) {
  if (body.provider !== "mock" || !verifyPayment(body, body.signature)) {
    throw new PaymentError("Ödeme imzası doğrulanamadı.");
  }

  const outcome = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId: body.orderId },
      select: {
        id: true,
        status: true,
        amount: true,
        provider: true,
        order: { select: { id: true, status: true } },
      },
    });
    if (!payment || payment.provider !== "mock") {
      throw new PaymentError("Test ödemesi bulunamadı.");
    }
    if (canonicalAmount(payment.amount) !== body.amount) {
      throw new PaymentError("Tutar siparişle uyuşmuyor.");
    }
    if (payment.status === "SUCCEEDED") {
      return "already" as const;
    }
    if (payment.order.status !== "PENDING") {
      throw new PaymentError("Bu sipariş için ödeme alınamaz.");
    }

    if (body.status === "FAILED") {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", providerRef: body.providerRef },
      });
      await tx.orderEvent.create({
        data: {
          orderId: payment.order.id,
          status: "PENDING",
          note: "Test ödemesi başarısız. Para çekilmedi.",
        },
      });
      return "failed" as const;
    }

    const moved = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "SUCCEEDED" } },
      data: { status: "SUCCEEDED", providerRef: body.providerRef },
    });
    if (moved.count !== 1) {
      return "already" as const;
    }

    const paid = await tx.order.updateMany({
      where: { id: payment.order.id, status: "PENDING" },
      data: { status: "PAID" },
    });
    if (paid.count !== 1) {
      throw new PaymentError("Bu sipariş için ödeme alınamaz.");
    }

    await tx.orderEvent.create({
      data: {
        orderId: payment.order.id,
        status: "PAID",
        note: "Test ödemesi kaydedildi. Para çekilmedi.",
      },
    });
    return "paid" as const;
  });

  revalidatePath("/", "layout");
  return outcome;
}
