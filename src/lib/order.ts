import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { InvoiceType } from "@/generated/prisma/client";
import { isUniqueConflict } from "@/lib/admin/labels";
import { cartCookieName } from "@/lib/cart-cookie";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { lira, quoteCart, type QuoteCoupon } from "@/lib/quote";

export type CheckoutDetails = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
  note: string;
  invoiceType: InvoiceType;
  companyName: string;
  taxNumber: string;
  taxOffice: string;
};

class OrderError extends Error {}

function toKurus(value: { toString(): string } | number) {
  const [whole, frac = ""] = value.toString().split(".");
  const negative = whole.startsWith("-");
  const digits = whole.replace("-", "");
  const kurus = Number(digits) * 100 + Number((frac + "00").slice(0, 2));
  return negative ? -kurus : kurus;
}

function money(kurus: number) {
  return (kurus / 100).toFixed(2);
}

function orderNumber() {
  return `YM-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function placeOrder(
  details: CheckoutDetails,
  userId: string | null = null,
) {
  const token = (await cookies()).get(cartCookieName)?.value;
  if (!token) {
    return { error: "Sepet boş." };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const lookupToken = await createOrder(token, details, userId);
      revalidatePath("/", "layout");
      return { token: lookupToken };
    } catch (error) {
      if (error instanceof OrderError) {
        return { error: error.message };
      }
      if (isUniqueConflict(error) && attempt < 2) {
        continue;
      }
      throw error;
    }
  }

  return { error: "Sipariş kaydedilemedi. Yeniden deneyin." };
}

async function createOrder(
  cartToken: string,
  details: CheckoutDetails,
  userId: string | null,
) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { token: cartToken },
      select: {
        id: true,
        items: {
          select: {
            quantity: true,
            productId: true,
          },
        },
        coupon: {
          select: {
            id: true,
            code: true,
            type: true,
            amount: true,
            minSubtotal: true,
            startsAt: true,
            endsAt: true,
            usageLimit: true,
            perUserLimit: true,
            active: true,
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) {
      throw new OrderError("Sepet boş.");
    }

    const products = await tx.product.findMany({
      where: { id: { in: cart.items.map((item) => item.productId) } },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        status: true,
      },
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    for (const item of cart.items) {
      const product = byId.get(item.productId);
      if (
        !product ||
        product.status !== "ACTIVE" ||
        product.stock < item.quantity
      ) {
        throw new OrderError(
          "Sepetteki bir parçanın stoğu yetmiyor. Sepeti güncelleyin.",
        );
      }
    }

    const settings = await tx.siteSetting.findUnique({
      where: { id: "default" },
      select: {
        shippingFee: true,
        freeShippingLimit: true,
        minOrderAmount: true,
      },
    });

    let coupon: QuoteCoupon | null = null;
    if (cart.coupon) {
      const [usageCount, perUserCount] = await Promise.all([
        tx.couponUsage.count({ where: { couponId: cart.coupon.id } }),
        cart.coupon.perUserLimit === null
          ? Promise.resolve(null)
          : tx.couponUsage.count({
              where: { couponId: cart.coupon.id, email: details.email },
            }),
      ]);
      coupon = {
        type: cart.coupon.type,
        amount:
          cart.coupon.type === "PERCENT"
            ? Number(cart.coupon.amount.toString())
            : toKurus(cart.coupon.amount),
        minSubtotalKurus: cart.coupon.minSubtotal
          ? toKurus(cart.coupon.minSubtotal)
          : null,
        active: cart.coupon.active,
        startsAt: cart.coupon.startsAt,
        endsAt: cart.coupon.endsAt,
        usageCount,
        usageLimit: cart.coupon.usageLimit,
        perUserCount,
        perUserLimit: cart.coupon.perUserLimit,
      };
    }

    const quoted = quoteCart({
      lines: cart.items.map((item) => {
        const product = byId.get(item.productId)!;
        return {
          unitKurus: toKurus(product.price),
          quantity: item.quantity,
          stock: product.stock,
          active: true,
        };
      }),
      coupon,
      shippingFeeKurus: settings ? toKurus(settings.shippingFee) : 0,
      freeShippingLimitKurus: settings?.freeShippingLimit
        ? toKurus(settings.freeShippingLimit)
        : null,
      now: new Date(),
    });

    if (quoted.couponMessage) {
      throw new OrderError(quoted.couponMessage);
    }
    if (quoted.subtotalKurus <= 0) {
      throw new OrderError("Sepet boş.");
    }
    if (
      settings?.minOrderAmount &&
      quoted.subtotalKurus < toKurus(settings.minOrderAmount)
    ) {
      throw new OrderError(
        `Minimum sipariş tutarı ${formatPrice(lira(toKurus(settings.minOrderAmount)))}.`,
      );
    }

    for (const item of cart.items) {
      const moved = await tx.product.updateMany({
        where: {
          id: item.productId,
          status: "ACTIVE",
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (moved.count !== 1) {
        throw new OrderError(
          "Sepetteki bir parçanın stoğu yetmiyor. Sepeti güncelleyin.",
        );
      }
    }

    const lookupToken = randomBytes(32).toString("base64url");
    const order = await tx.order.create({
      data: {
        number: orderNumber(),
        lookupToken,
        userId,
        email: details.email,
        fullName: details.fullName,
        phone: details.phone,
        city: details.city,
        district: details.district,
        addressLine: details.addressLine,
        postalCode: details.postalCode || null,
        note: details.note || null,
        invoiceType: details.invoiceType,
        companyName:
          details.invoiceType === "COMPANY" ? details.companyName : null,
        taxNumber: details.invoiceType === "COMPANY" ? details.taxNumber : null,
        taxOffice: details.invoiceType === "COMPANY" ? details.taxOffice : null,
        status: "PENDING",
        subtotal: money(quoted.subtotalKurus),
        discount: money(quoted.discountKurus),
        shippingFee: money(quoted.shippingKurus),
        total: money(quoted.totalKurus),
        couponCode:
          cart.coupon && quoted.discountKurus > 0 ? cart.coupon.code : null,
        items: {
          create: cart.items.map((item, index) => {
            const product = byId.get(item.productId)!;
            const priced = quoted.lines[index];
            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              unitPrice: money(toKurus(product.price)),
              quantity: priced?.quantity ?? item.quantity,
              lineTotal: money(priced?.lineKurus ?? 0),
            };
          }),
        },
        events: {
          create: { status: "PENDING", note: "Sipariş kaydedildi." },
        },
        payment: {
          create: {
            status: "PENDING",
            amount: money(quoted.totalKurus),
            provider: "mock",
          },
        },
        ...(cart.coupon && quoted.discountKurus > 0
          ? {
              couponUsage: {
                create: {
                  couponId: cart.coupon.id,
                  email: details.email,
                },
              },
            }
          : {}),
      },
      select: { lookupToken: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    return order.lookupToken;
  });
}
