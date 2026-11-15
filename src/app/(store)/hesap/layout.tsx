import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AccountChrome } from "@/components/storefront/account-chrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div data-account>
      <AccountChrome />
      {children}
    </div>
  );
}
