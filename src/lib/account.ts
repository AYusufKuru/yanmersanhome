import "server-only";

import { redirect } from "next/navigation";
import { accountCookieName } from "@/lib/account-cookie";
import { getSessionUser, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type Customer = Omit<SessionUser, "role">;

const addressCap = 10;

export type SavedAddressInput = {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  line: string;
  postalCode: string;
};

export async function getCustomer(): Promise<Customer | null> {
  const user = await getSessionUser(accountCookieName);
  if (!user || user.role !== "CUSTOMER") {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
  };
}

export async function requireCustomer() {
  const customer = await getCustomer();
  if (!customer) {
    redirect("/hesap/giris");
  }
  return customer;
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: addressCap,
  });
}

export async function rememberAddress(
  userId: string,
  input: SavedAddressInput,
) {
  const existing = await prisma.address.findFirst({
    where: {
      userId,
      line: input.line,
      city: input.city,
      district: input.district,
    },
    select: { id: true },
  });
  if (existing) {
    return;
  }

  const count = await prisma.address.count({ where: { userId } });
  if (count >= addressCap) {
    return;
  }

  await prisma.address.create({
    data: {
      userId,
      fullName: input.fullName,
      phone: input.phone,
      city: input.city,
      district: input.district,
      line: input.line,
      postalCode: input.postalCode || null,
    },
  });
}
