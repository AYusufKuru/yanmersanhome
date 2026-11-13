"use server";

import { redirect } from "next/navigation";
import {
  addProduct,
  applyCoupon,
  clearCoupon,
  removeProduct,
  setProductQuantity,
} from "@/lib/cart";

export type CartFormState = { error?: string };

export async function addToCart(
  _state: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const slug = String(formData.get("slug") ?? "");
  const quantity = Number(formData.get("quantity"));
  const result = await addProduct(slug, quantity);
  if (result.error) {
    return { error: result.error };
  }
  redirect("/sepet");
}

export async function updateCartQuantity(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  await setProductQuantity(productId, quantity);
}

export async function removeFromCart(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  await removeProduct(productId);
}

export async function submitCoupon(
  _state: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const result = await applyCoupon(String(formData.get("code") ?? ""));
  return result.error ? { error: result.error } : {};
}

export async function removeCoupon() {
  await clearCoupon();
}
