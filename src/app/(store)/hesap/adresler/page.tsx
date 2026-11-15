import { redirect } from "next/navigation";

export const instant = false;

export default function AddressesPage() {
  redirect("/hesap?bolum=adresler");
}
