import { redirect } from "next/navigation";

export const instant = false;

export default function OrdersPage() {
  redirect("/hesap?bolum=siparisler");
}
