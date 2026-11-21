import type { Metadata } from "next";
import { LegalPage } from "@/components/storefront/legal-page";
import { seller } from "@/lib/seller";

export const metadata: Metadata = { title: "Gizlilik sözleşmesi" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Gizlilik sözleşmesi">
      <p>
        {seller.name}, sipariş ve hesap işlemleri için ad, e-posta, telefon ve
        teslimat adresini alır. Bu bilgiler siparişi hazırlamak, kargoya vermek,
        ödeme kaydını tutmak ve gerektiğinde sizinle yazışmak için kullanılır.
      </p>
      <p>
        Ödeme, iyzico altyapısı üzerinden alınır. Kart numarası ve güvenlik kodu
        sitede saklanmaz. Ödeme kuruluşu, işlemi gerçekleştirmek için gerekli
        kart ve tutar bilgisini kendi sistemi içinde işler.
      </p>
      <p>
        Site, sepeti ve oturumu hatırlamak için çerez kullanır. Ziyaret
        ölçümü, çerez tercihiniz açıkken çalışır. Tarayıcıdan çerezleri
        silebilirsiniz; bu durumda sepet ve oturum sıfırlanabilir.
      </p>
      <p>
        Bilgiler, yasal zorunluluk ve sipariş kaydının saklanması dışında üçüncü
        kişilere satılmaz. Kargo firması yalnızca teslimat için gerekli ad ve
        telefonu görür.
      </p>
      <p>
        Bilgilerinize erişmek, düzeltilmesini veya silinmesini istemek için{" "}
        {seller.email} adresine yazabilirsiniz. Yasal saklama süresi dolmadan
        sipariş kaydı silinemez.
      </p>
    </LegalPage>
  );
}
