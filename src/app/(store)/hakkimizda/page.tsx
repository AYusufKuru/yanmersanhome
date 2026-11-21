import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";
import { seller } from "@/lib/seller";

export const metadata: Metadata = { title: "Hakkımızda" };

export default function AboutPage() {
  return (
    <LegalPage title="Hakkımızda">
      <p>
        {seller.name}, evde uzun süre kalan sade parçalar satar. Vitrinde mermer,
        ahşap ve kişisel ürünler yer alır.
      </p>
      <p>
        Siparişler {seller.site} üzerinden alınır. Ürünün fiyatı, stok durumu ve
        kargo bedeli ödeme adımında gösterilir.
      </p>
      <p>
        İletişim:{" "}
        <a className="text-coffee underline" href={`mailto:${seller.email}`}>
          {seller.email}
        </a>
      </p>
    </LegalPage>
  );
}
