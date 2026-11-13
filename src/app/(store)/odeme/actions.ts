"use server";

import { redirect } from "next/navigation";
import { getCustomer, rememberAddress } from "@/lib/account";
import { checkoutIssue, checkoutSchema } from "@/lib/checkout-schema";
import { placeOrder } from "@/lib/order";

export type CheckoutState = { error?: string };

export async function submitOrder(
  _state: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    city: formData.get("city"),
    district: formData.get("district"),
    addressLine: formData.get("addressLine"),
    postalCode: formData.get("postalCode"),
    note: formData.get("note"),
    invoiceType: formData.get("invoiceType"),
    companyName: formData.get("companyName"),
    taxNumber: formData.get("taxNumber"),
    taxOffice: formData.get("taxOffice"),
  });
  if (!parsed.success) {
    return { error: checkoutIssue(parsed.error) };
  }

  const customer = await getCustomer();
  const details = customer
    ? { ...parsed.data, email: customer.email }
    : parsed.data;
  const result = await placeOrder(details, customer?.id ?? null);
  if ("error" in result) {
    return { error: result.error };
  }

  if (customer && formData.get("saveAddress") === "on") {
    try {
      await rememberAddress(customer.id, {
        fullName: details.fullName,
        phone: details.phone,
        city: details.city,
        district: details.district,
        line: details.addressLine,
        postalCode: details.postalCode,
      });
    } catch {
      // Sipariş kaydı oluştu; adres ayrıca kaydedilemedi.
    }
  }

  redirect(`/siparis/${result.token}`);
}
