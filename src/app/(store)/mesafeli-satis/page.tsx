import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/storefront/legal-page";
import { seller } from "@/lib/seller";

export const metadata: Metadata = { title: "Mesafeli satış sözleşmesi" };

export default function DistanceSalesPage() {
  return (
    <LegalPage title="Mesafeli satış sözleşmesi">
      <p>
        Bu sözleşme, {seller.site} adresindeki ürünü satın alan alıcı ile satıcı{" "}
        {seller.name} arasında, 6502 sayılı Kanun ve Mesafeli Sözleşmeler
        Yönetmeliği kapsamında kurulur.
      </p>
      <p>
        Satıcıya {seller.email} adresinden ulaşılır. Sözleşmenin konusu, sipariş
        anında seçilen ürünün nitelikleri, satış fiyatı, kargo bedeli ve ödeme
        şeklidir. Bu bilgiler ödeme adımındaki sipariş özetinde yer alır.
      </p>
      <p>
        Ödeme iyzico ile tahsil edilir. Sipariş, ödemenin onayından sonra kesinleşir.
        Teslimat ve cayma koşulları{" "}
        <Link href="/teslimat-iade" className="text-coffee underline">
          teslimat ve iade şartlarında
        </Link>{" "}
        yazılıdır. Alıcı, cayma hakkını teslimattan itibaren 14 gün içinde
        kullanabilir. Kişiye özel ürünler ve yasadaki diğer istisnalar bu hakkın
        dışındadır.
      </p>
      <p>
        Ayıplı üründe alıcı, onarım, değişim veya bedel iadesi isteyebilir.
        Uyuşmazlıklarda tüketici hakem heyetleri ve tüketici mahkemeleri
        yetkilidir.
      </p>
      <p>
        Alıcı, ödeme adımını tamamlayarak bu sözleşmeyi ve{" "}
        <Link href="/gizlilik" className="text-coffee underline">
          gizlilik sözleşmesini
        </Link>{" "}
        okuduğunu kabul eder.
      </p>
    </LegalPage>
  );
}
