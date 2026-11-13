import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Yönetici girişi",
};

export const instant = false;

export default async function LoginPage() {
  const admin = await getAdmin();
  if (admin) {
    redirect("/admin");
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <p className="text-xs tracking-[0.18em] text-coffee uppercase">
        Yanmersanhome
      </p>
      <h1 className="font-display mt-3 text-4xl text-espresso">
        Yönetici girişi
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Ürün ve ayarlar bu oturumun arkasında durur.
      </p>
      <LoginForm />
    </section>
  );
}
