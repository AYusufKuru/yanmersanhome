import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";
import { seller } from "@/lib/seller";

export const metadata: Metadata = { title: "Teslimat ve iade" };

export default function DeliveryPage() {
  return (
    <LegalPage title="Teslimat ve iade şartları">
      <p>
        Sipariş, ödemenin onayından sonra hazırlanır. Türkiye içi teslimat, kargo
        firmasına teslimden sonra genellikle 3 ile 10 iş günü sürer. Süre, adres
        ve kargo yoğunluğuna göre değişebilir.
      </p>
      <p>
        Kargo bedeli sipariş özetinde ayrıca yazılır. Ücretsiz kargo sınırı
        varsa aynı ekranda görünür. Teslim edilemeyen ve satıcıya dönen
        gönderinin yeniden gönderim bedeli alıcıya aittir.
      </p>
      <p>
        Ürün hasarlı veya eksik gelirse teslimattan itibaren 2 gün içinde{" "}
        {seller.email} adresine yazın. Fotoğrafla birlikte bildirilen ayıplı
        üründe onarım, yenisiyle değişim veya bedel iadesi yapılır.
      </p>
      <p>
        Cayma hakkı, teslimattan itibaren 14 gündür. Ürün kullanılmamış, yeniden
        satılabilir durumda ve varsa ambalajıyla birlikte geri gönderilmelidir.
        Kişiye özel hazırlanan ürünlerde, ambalajı açılmış hijyen ürünlerinde ve
        yasada sayılan diğer istisnalarda cayma hakkı kullanılamaz.
      </p>
      <p>
        İade kargo kodu ve adres, talebin onayından sonra e-posta ile iletilir.
        Bedel, ürün satıcıya ulaşıp kontrol edildikten sonra ödemenin yapıldığı
        karta iade edilir. Bankanın iadeyi hesaba yansıtması birkaç iş günü
        sürebilir.
      </p>
    </LegalPage>
  );
}
