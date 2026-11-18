import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/account";

export const instant = false;

export default async function CustomerLoginPage() {
  if (await getCustomer()) {
    redirect("/hesap");
  }
  redirect("/hesap?bolum=giris");
}
