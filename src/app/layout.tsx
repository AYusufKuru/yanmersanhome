import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { HideScrollbar } from "@/components/hide-scrollbar";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
});

const description =
  "Mermer, ahşap ve kişisel ürünler. Evde uzun süre kalan, sade parçalar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Yanmersanhome",
    template: "%s · Yanmersanhome",
  },
  description,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Yanmersanhome",
    title: "Yanmersanhome",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${dmSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <HideScrollbar />
        {children}
      </body>
    </html>
  );
}
