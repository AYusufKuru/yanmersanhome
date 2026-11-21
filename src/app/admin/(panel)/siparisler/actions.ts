"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@/generated/prisma/client";
import { canSetStatus, restoresStock } from "@/lib/admin/order-flow";
import {
  orderIssue,
  orderStatusSchema,
  shipmentSchema,
} from "@/lib/admin/order-schema";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { orderStatusLabel } from "@/lib/order-status";

export type OrderActionState = { error?: string };

async function restoreStock(
  tx: Pick<typeof prisma, "orderItem" | "product">,
  orderId: string,
) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });
  for (const item of items) {
    if (!item.productId) {
      continue;
    }
    await tx.product.updateMany({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}

async function changeStatus(id: string, status: OrderStatus, note: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, payment: { select: { status: true } } },
  });
  if (!order) {
    return { error: "Sipariş bulunamadı." };
  }
  if (!canSetStatus(order.status, status)) {
    return { error: "Bu durum değişikliği yapılamaz." };
  }
  if (order.status === status && !note) {
    return { error: "Bir durum seçin veya not yazın." };
  }
  if (status === "REFUNDED" && order.payment?.status !== "SUCCEEDED") {
    return { error: "Ödenmemiş sipariş iade edilmez. İptal edin." };
  }

  const eventNote =
    note ||
    (status === "REFUNDED"
      ? "İade kaydı oluşturuldu. Test ödemesinde para iadesi yapılmaz."
      : status === "CANCELLED"
        ? "Sipariş iptal edildi."
        : orderStatusLabel[status]);

  try {
    await prisma.$transaction(async (tx) => {
      const moved = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status },
      });
      if (moved.count !== 1) {
        throw new Error("stale");
      }
      if (order.status !== status && restoresStock(status)) {
        await restoreStock(tx, id);
      }
      await tx.orderEvent.create({
        data: { orderId: id, status, note: eventNote },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "stale") {
      return { error: "Sipariş durumu değişti. Sayfayı yenileyin." };
    }
    throw error;
  }

  revalidatePath("/admin/siparisler");
  revalidatePath("/", "layout");
  return null;
}

export async function updateOrderStatus(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: orderIssue(parsed.error) };
  }

  const failed = await changeStatus(
    parsed.data.id,
    parsed.data.status,
    parsed.data.note,
  );
  if (failed) {
    return failed;
  }
  redirect(`/admin/siparisler/${parsed.data.id}`);
}

export async function saveShipment(
  _state: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  await requireAdmin();
  const parsed = shipmentSchema.safeParse({
    id: formData.get("id"),
    carrier: formData.get("carrier"),
    trackingNumber: formData.get("trackingNumber"),
  });
  if (!parsed.success) {
    return { error: orderIssue(parsed.error) };
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.id },
    select: { status: true, shipment: { select: { shippedAt: true } } },
  });
  if (!order) {
    return { error: "Sipariş bulunamadı." };
  }
  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    return { error: "Kapanmış siparişe kargo yazılmaz." };
  }
  if (order.status === "PENDING") {
    return { error: "Ödeme bekleyen sipariş kargoya verilmez." };
  }

  const shipNow = order.status === "PAID" || order.status === "PREPARING";
  const nextStatus: OrderStatus = shipNow ? "SHIPPED" : order.status;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { orderId: parsed.data.id },
        create: {
          orderId: parsed.data.id,
          carrier: parsed.data.carrier,
          trackingNumber: parsed.data.trackingNumber,
          shippedAt: new Date(),
        },
        update: {
          carrier: parsed.data.carrier,
          trackingNumber: parsed.data.trackingNumber,
          shippedAt: order.shipment?.shippedAt ?? new Date(),
        },
      });
      if (shipNow) {
        const moved = await tx.order.updateMany({
          where: { id: parsed.data.id, status: order.status },
          data: { status: "SHIPPED" },
        });
        if (moved.count !== 1) {
          throw new Error("stale");
        }
      }
      await tx.orderEvent.create({
        data: {
          orderId: parsed.data.id,
          status: nextStatus,
          note: shipNow
            ? `Kargoya verildi. ${parsed.data.carrier} · ${parsed.data.trackingNumber}`
            : `Kargo bilgisi güncellendi. ${parsed.data.carrier} · ${parsed.data.trackingNumber}`,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "stale") {
      return { error: "Sipariş durumu değişti. Sayfayı yenileyin." };
    }
    throw error;
  }

  revalidatePath("/admin/siparisler");
  revalidatePath("/", "layout");
  redirect(`/admin/siparisler/${parsed.data.id}`);
}
