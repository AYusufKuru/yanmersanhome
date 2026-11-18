import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/account";

export const instant = false;

export default async function RegisterPage() {
  if (await getCustomer()) {
    redirect("/hesap");
  }
  redirect("/hesap?bolum=kayit");
}
