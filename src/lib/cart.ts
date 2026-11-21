import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { cartCookieName, cartMaxAgeSeconds } from "@/lib/cart-cookie";
import { emptyCart, type CartView, type CartViewLine } from "@/lib/cart-view";
import { lira, quoteCart, type QuoteCoupon } from "@/lib/quote";

const maxQuantity = 99;

type LoadedItem = {
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: { toString(): string };
    stock: number;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    images: { url: string; alt: string }[];
  };
};

type LoadedCart = {
  id: string;
  userId: string | null;
  items: LoadedItem[];
  coupon: {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    amount: { toString(): string };
    minSubtotal: { toString(): string } | null;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    perUserLimit: number | null;
    active: boolean;
    _count: { usages: number };
  } | null;
};

function toKurus(value: { toString(): string } | number) {
  const [whole, frac = ""] = value.toString().split(".");
  const negative = whole.startsWith("-");
  const digits = whole.replace("-", "");
  const kurus = Number(digits) * 100 + Number((frac + "00").slice(0, 2));
  return negative ? -kurus : kurus;
}

function parseQuantity(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > maxQuantity) {
    return null;
  }
  return value;
}

const cartInclude = {
  items: {
    orderBy: { id: "asc" as const },
    select: {
      quantity: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          stock: true,
          status: true,
          images: {
            orderBy: { sortOrder: "asc" as const },
            take: 1,
            select: { url: true, alt: true },
          },
        },
      },
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
      _count: { select: { usages: true } },
    },
  },
};

async function shippingSettings() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "default" },
    select: { shippingFee: true, freeShippingLimit: true },
  });
  return {
    shippingFeeKurus: settings ? toKurus(settings.shippingFee) : 0,
    freeShippingLimitKurus: settings?.freeShippingLimit
      ? toKurus(settings.freeShippingLimit)
      : null,
  };
}

async function couponForQuote(cart: LoadedCart): Promise<QuoteCoupon | null> {
  const coupon = cart.coupon;
  if (!coupon) {
    return null;
  }
  let perUserCount: number | null = null;
  if (coupon.perUserLimit !== null && cart.userId) {
    perUserCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: cart.userId },
    });
  }
  return {
    type: coupon.type,
    amount:
      coupon.type === "PERCENT"
        ? Number(coupon.amount.toString())
        : toKurus(coupon.amount),
    minSubtotalKurus: coupon.minSubtotal ? toKurus(coupon.minSubtotal) : null,
    active: coupon.active,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
    usageCount: coupon._count.usages,
    usageLimit: coupon.usageLimit,
    perUserCount,
    perUserLimit: cart.userId ? coupon.perUserLimit : null,
  };
}

async function requestNow() {
  await connection();
  return new Date();
}

async function toView(cart: LoadedCart | null): Promise<CartView> {
  if (!cart || cart.items.length === 0) {
    return { ...emptyCart, couponCode: cart?.coupon?.code ?? null };
  }

  const [shipping, coupon] = await Promise.all([
    shippingSettings(),
    couponForQuote(cart),
  ]);
  const quoted = quoteCart({
    lines: cart.items.map((item) => ({
      unitKurus: toKurus(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
      active: item.product.status === "ACTIVE",
    })),
    coupon,
    shippingFeeKurus: shipping.shippingFeeKurus,
    freeShippingLimitKurus: shipping.freeShippingLimitKurus,
    now: await requestNow(),
  });

  const lines: CartViewLine[] = cart.items.map((item, index) => {
    const priced = quoted.lines[index];
    const image = item.product.images[0];
    return {
      productId: item.product.id,
      slug: item.product.slug,
      name: item.product.name,
      image: image?.url ?? null,
      imageAlt: image?.alt || item.product.name,
      unitPrice: lira(toKurus(item.product.price)),
      quantity: priced?.quantity ?? 0,
      lineTotal: lira(priced?.lineKurus ?? 0),
      stock: item.product.stock,
      available: priced?.available ?? false,
    };
  });

  return {
    lines,
    subtotal: lira(quoted.subtotalKurus),
    discount: lira(quoted.discountKurus),
    shippingFee: lira(quoted.shippingKurus),
    total: lira(quoted.totalKurus),
    count: lines.reduce(
      (sum, line) => sum + (line.available ? line.quantity : 0),
      0,
    ),
    couponCode: cart.coupon?.code ?? null,
    couponMessage: cart.coupon ? quoted.couponMessage : null,
  };
}

async function loadCart(token: string | null) {
  if (!token) {
    return null;
  }
  return prisma.cart.findUnique({
    where: { token },
    select: { id: true, userId: true, ...cartInclude },
  });
}

export async function getCartView() {
  const jar = await cookies();
  const cart = await loadCart(jar.get(cartCookieName)?.value ?? null);
  return toView(cart);
}

async function writeCartCookie(token: string) {
  const jar = await cookies();
  jar.set(cartCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cartMaxAgeSeconds,
  });
}

async function getOrCreateCart() {
  const jar = await cookies();
  const existing = await loadCart(jar.get(cartCookieName)?.value ?? null);
  if (existing) {
    return existing;
  }

  const token = randomBytes(32).toString("base64url");
  const cart = await prisma.cart.create({
    data: { token },
    select: { id: true, userId: true, ...cartInclude },
  });
  await writeCartCookie(token);
  return cart;
}

function refreshCart() {
  revalidatePath("/", "layout");
}

export async function addProduct(slug: string, quantity: number) {
  const parsed = parseQuantity(quantity);
  if (!parsed) {
    return { error: "Adet geçersiz." };
  }

  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, stock: true },
  });
  if (!product || product.stock < 1) {
    return { error: "Bu ürün şu an sepete eklenemiyor." };
  }

  const cart = await getOrCreateCart();
  const current = cart.items.find((item) => item.product.id === product.id);
  const next = Math.min(product.stock, (current?.quantity ?? 0) + parsed);
  if (current && current.quantity >= product.stock) {
    return { error: "Stok kadar ekleyebilirsiniz." };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: product.id } },
    create: { cartId: cart.id, productId: product.id, quantity: next },
    update: { quantity: next },
  });
  refreshCart();
  return {};
}

export async function setProductQuantity(productId: string, quantity: number) {
  const jar = await cookies();
  const cart = await loadCart(jar.get(cartCookieName)?.value ?? null);
  if (!cart) {
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    const item = cart.items.find((entry) => entry.product.id === productId);
    if (!item) {
      return;
    }
    const next = Math.min(
      maxQuantity,
      quantity,
      Math.max(item.product.stock, 0),
    );
    if (next < 1 || item.product.status !== "ACTIVE") {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: next },
      });
    }
  }
  refreshCart();
}

export async function removeProduct(productId: string) {
  await setProductQuantity(productId, 0);
}

export async function applyCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,32}$/.test(normalized)) {
    return { error: "Kupon kodu geçersiz." };
  }

  const jar = await cookies();
  const cart = await loadCart(jar.get(cartCookieName)?.value ?? null);
  if (!cart || cart.items.length === 0) {
    return { error: "Kupon için sepette ürün olmalı." };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
    select: cartInclude.coupon.select,
  });
  if (!coupon) {
    return { error: "Kupon kodu geçersiz." };
  }

  const preview = await toView({ ...cart, coupon });
  if (preview.couponMessage) {
    return { error: preview.couponMessage };
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: coupon.id },
  });
  refreshCart();
  return {};
}

export async function clearCoupon() {
  const jar = await cookies();
  const token = jar.get(cartCookieName)?.value;
  if (!token) {
    return;
  }
  await prisma.cart.updateMany({
    where: { token },
    data: { couponId: null },
  });
  refreshCart();
}
