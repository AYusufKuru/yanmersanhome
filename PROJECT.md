# Profesyonel E-Ticaret Projesi – Ana Geliştirme Dokümanı

## 1. Projenin Amacı

Türkiye pazarında faaliyet gösterecek, yalnızca kendi ürünlerimizi satacağımız profesyonel bir e-ticaret sitesi geliştirilecek.

Bu proje Trendyol veya Hepsiburada gibi çok satıcılı bir pazaryeri değildir.

Sistem tek bir işletmenin ürünlerini müşterilere satmasını sağlayacaktır.

Temel hedefler:

- Modern, güvenilir ve profesyonel bir alışveriş deneyimi.
- Mobil cihazlarda kusursuz çalışma.
- Yüksek performans ve SEO uyumluluğu.
- Kolay kullanılabilen yönetim paneli.
- Güvenli online ödeme.
- Sipariş ve stok yönetimi.
- Reklam dönüşümlerini ölçebilme.
- İleride büyütülebilecek sağlam bir mimari.

**Önemli:** Bu projede önceliğimiz gösterişli bir tasarım yapmak değil, gerçek müşterilerin alışveriş yapabileceği, sipariş oluşturabileceği ve ödeme gerçekleştirebileceği çalışan bir sistem oluşturmaktır.

## 1.1 Kilit İşletme Kararları

Bu kararlar geliştirme başlamadan netleşmiştir. Değişirse ilgili aşama yeniden ele alınır.

- **Marka adı:** Yanmersanhome.
- **Logo:** Henüz yok. İlk sürümde logo, marka adından üretilmiş bir wordmark olur. Gerçek logo dosyası sonra site ayarlarından değiştirilir.
- **Vitrin bölümleri:** Sitede üç ana bölüm vardır.
  - Mermer ürünler
  - Ahşap ürünler
  - Kişisel ürünler
- Bu üçü kök kategoridir. Alt kategoriler admin panelinden eklenir.
- Ürün varyantı zorunlu değildir. Ölçü, renk veya yüzey farkı olan ürünlerde kullanılır. Giyim bedeni varsayılmaz.
- **Para birimi ve dil:** Türk Lirası, Türkçe arayüz.
- **Ödeme:** İlk çalışan sürümde açıkça etiketlenmiş test/mock ödeme vardır. iyzico ve PayTR adapter iskeleti durur; canlı çekim, API anahtarı ve imza doğrulaması olmadan açılmaz.
- **Kargo:** Sabit kargo ücreti ve ücretsiz kargo alt limiti. Tutarlar kodun içine gömülmez; site ayarlarından girilir. İlk kurulumda tutarlar boş/yer tutucu olabilir.
- **Yasal kimlik:** Ünvan, adres, vergi numarası, telefon ve e-posta henüz yok. Footer, sözleşme ve KVKK alanları uydurma şirket bilgisi taşımaz. Metinler “işletme bilgisi eklenecek” yer tutucusuyla durur ve admin ayarından doldurulur.

---

## 2. Teknoloji Tercihleri

Aşağıdaki teknolojileri kullan.

### Frontend ve Backend

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- shadcn/ui

Next.js hem frontend hem backend ihtiyaçlarını karşılayacak. API Route Handlers ve server-side işlemler kullanılacak.

Başlangıçta ayrı bir backend projesi oluşturma.

### Veritabanı

- PostgreSQL
- Prisma ORM

Veritabanı modelleri ilişkisel ve ölçeklenebilir tasarlanmalı.

### Kimlik Doğrulama

- Güvenli admin oturum yönetimi.
- Müşteri hesapları.
- Misafir olarak sipariş verebilme.
- Rol bazlı yetkilendirme.

### Ödeme

Türkiye'de kullanılabilecek ödeme sağlayıcıları:

- iyzico
- PayTR

Ödeme sistemi sağlayıcıdan bağımsız bir adapter mimarisiyle geliştirilmeli.

İlk aşamada sağlayıcının API belgeleri incelenmeli. Gerçek API bilgileri olmadan başarılı ödeme taklidi yapılmamalı.

İlk çalışan sürümde açıkça belirtilen test/mock modu kullanılır. Müşteriye gerçek tahsilat yapılıyormuş gibi gösterilmez. iyzico veya PayTR, API anahtarı ve imza doğrulaması hazır olduğunda aynı adapter üzerinden bağlanır.

### Dosya ve Görsel Yönetimi

- Ürün görselleri için uygun bir nesne depolama servisi.
- Görsel optimizasyonu.
- Next.js Image.
- Görsel boyutu ve format kontrolü.

### Kod Kalitesi

- ESLint.
- Prettier.
- TypeScript strict mode.
- Zod ile veri doğrulama.
- Otomatik testler.

---

## 3. Proje Mimarisi

Kod yapısı modüler ve anlaşılır olmalı.

Önerilen yapı:

```text
src/
  app/
    (store)/
      page.tsx
      products/
      categories/
      cart/
      checkout/
      account/
      orders/
    admin/
      dashboard/
      products/
      categories/
      orders/
      customers/
      coupons/
      settings/
    api/
      auth/
      products/
      orders/
      payments/
      webhooks/

  components/
    ui/
    storefront/
    admin/
    product/
    cart/

  features/
    products/
    orders/
    payments/
    customers/
    inventory/
    coupons/

  lib/
    auth/
    db/
    payments/
    validation/
    security/
    utils/

  types/

prisma/
  schema.prisma

public/
```

Bu yapı gerektiğinde geliştirilebilir. Gereksiz klasörler ve soyutlamalar oluşturma.

---

# 4. Müşteri Tarafı – E-Ticaret Sitesi

## 4.1 Ana Sayfa

Ana sayfa modern, profesyonel ve satış odaklı olmalı.

İçermesi gereken bölümler:

- Logo ve navigasyon.
- Ürün arama.
- Kategori menüsü.
- Sepet.
- Kullanıcı hesabı.
- Ana kampanya banner alanı.
- Öne çıkan ürünler.
- Yeni ürünler.
- Çok satan ürünler.
- Kampanyalı ürünler.
- Avantajlarımız (güvenli ödeme, hızlı kargo vb.).
- Müşteri yorumları.
- Footer ve yasal bağlantılar.

Ana sayfa yönetim panelinden düzenlenebilir olmalı. Banner ve öne çıkan ürünler admin tarafından seçilebilmeli.

## 4.2 Ürün Listeleme

Özellikler:

- Kategoriye göre filtreleme.
- Fiyata göre sıralama.
- Popülerliğe göre sıralama.
- Ürün arama.
- Stokta olan ürünleri filtreleme.
- Sayfalama.
- Ürün kartlarında fiyat, indirim ve stok durumu.

Filtreler URL üzerinden paylaşılabilir olmalı.

## 4.3 Ürün Detay Sayfası

Her ürünün kendine ait SEO uyumlu sayfası olmalı.

İçerik:

- Ürün görselleri.
- Ürün adı.
- Fiyat.
- İndirimli fiyat.
- Açıklama.
- Ürün özellikleri.
- Varyantlar (beden, renk vb. gerekiyorsa).
- Stok durumu.
- Adet seçimi.
- Sepete ekle butonu.
- Ürün yorumları.
- Benzer ürünler.

Stok ve fiyat bilgileri sunucu tarafından doğrulanmalı.

## 4.4 Sepet

- Ürün ekleme.
- Ürün silme.
- Adet değiştirme.
- Ara toplam.
- İndirim.
- Kargo ücreti.
- Genel toplam.
- Kupon kodu.

Sepet işlemleri kullanıcı deneyimi açısından hızlı olmalı.

Ancak fiyat hesaplaması hiçbir zaman sadece frontend'e güvenilerek yapılmamalı.

## 4.5 Checkout – Sipariş Oluşturma

Müşteriden alınacak bilgiler:

- Ad soyad.
- Telefon.
- E-posta.
- Şehir.
- İlçe.
- Açık adres.
- Fatura bilgileri.
- Bireysel/kurumsal fatura tercihi.
- Sipariş notu.

Ödeme seçenekleri:

- Online kredi/banka kartı.
- İleride eklenebilecek diğer yöntemler.

Checkout mümkün olduğunca sade olmalı.

Müşteri hesap oluşturmadan da sipariş verebilmeli.

Sipariş tamamlanmadan önce müşteriye ürünler, adetler, kargo ve toplam tutar gösterilmeli.

## 4.6 Müşteri Hesabı

- Kayıt ve giriş.
- Şifre sıfırlama.
- Profil bilgileri.
- Adres yönetimi.
- Sipariş geçmişi.
- Sipariş detayları.
- Sipariş durumunu görüntüleme.

Misafir siparişleri de güvenli bir şekilde takip edilebilmeli.

## 4.7 Sipariş Takibi

Sipariş durumları:

- Ödeme bekleniyor.
- Ödeme alındı.
- Hazırlanıyor.
- Kargoya verildi.
- Teslim edildi.
- İptal edildi.
- İade sürecinde.
- İade tamamlandı.

Kargo takip numarası ve kargo firması admin tarafından girilebilmeli.

---

# 5. Yönetim Paneli

Yönetim paneli projenin en önemli parçalarından biridir.

Sadece tasarım olarak değil, bütün işlemleri gerçekten gerçekleştirebilen bir panel olmalı.

## 5.1 Dashboard

Gösterilecek bilgiler:

- Toplam satış.
- Günlük satış.
- Aylık satış.
- Toplam sipariş.
- Bekleyen siparişler.
- Tamamlanan siparişler.
- İptal edilen siparişler.
- Toplam müşteri.
- Azalan stoklar.
- En çok satan ürünler.
- Son siparişler.

Grafikler gerçek veritabanı verilerinden oluşturulmalı.

## 5.2 Ürün Yönetimi

Admin şunları yapabilmeli:

- Ürün ekleme.
- Ürün düzenleme.
- Ürün silme veya arşivleme.
- Birden fazla görsel yükleme.
- Fiyat belirleme.
- İndirimli fiyat belirleme.
- Stok belirleme.
- SKU oluşturma.
- Ürün varyantı ekleme.
- Kategori belirleme.
- Ürün açıklaması düzenleme.
- SEO başlığı ve açıklaması belirleme.
- Ürünü aktif/pasif yapma.
- Öne çıkan ürün olarak işaretleme.

## 5.3 Kategori Yönetimi

- Kategori oluşturma.
- Kategori düzenleme.
- Kategori silme.
- Alt kategori oluşturma.
- Kategori görseli.
- SEO bilgileri.
- Sıralama.

## 5.4 Sipariş Yönetimi

Admin:

- Bütün siparişleri görebilmeli.
- Sipariş detayını açabilmeli.
- Müşteri bilgilerini görebilmeli.
- Ödeme durumunu görebilmeli.
- Sipariş durumunu güncelleyebilmeli.
- Kargo firması ekleyebilmeli.
- Kargo takip numarası girebilmeli.
- Sipariş notu ekleyebilmeli.
- İptal ve iade süreçlerini yönetebilmeli.

Sipariş geçmişi ve durum değişiklikleri kayıt altına alınmalı.

Ödeme iadesi sağlayıcı üzerinden güvenli biçimde gerçekleştirilmelidir.

## 5.5 Müşteri Yönetimi

- Müşteri listesi.
- Müşteri detayları.
- Sipariş geçmişi.
- Toplam harcama.
- İletişim bilgileri.
- Müşteri notları.

Yetkisiz çalışanlar hassas müşteri verilerine erişememeli.

## 5.6 Kupon ve İndirim Yönetimi

- İndirim kodu oluşturma.
- Yüzdelik indirim.
- Sabit tutarlı indirim.
- Minimum sepet tutarı.
- Başlangıç ve bitiş tarihi.
- Kullanım limiti.
- Müşteri başına kullanım limiti.
- Aktif/pasif durumu.

Kupon kontrolleri backend tarafında yapılmalı.

## 5.7 Site Ayarları

Admin aşağıdaki bilgileri değiştirebilmeli:

- Site adı.
- Logo.
- İletişim bilgileri.
- Telefon.
- E-posta.
- Sosyal medya bağlantıları.
- Kargo ücretleri.
- Ücretsiz kargo limiti.
- Minimum sipariş tutarı.
- Footer içerikleri.
- Sosyal medya hesapları.

---

# 6. Ödeme Sistemi

Ödeme işlemleri güvenlik açısından kritik olduğundan özel önem verilmeli.

Ödeme sağlayıcısı olarak iyzico veya PayTR kullanılabilecek.

Sistem aşağıdaki prensiplere göre geliştirilmeli:

1. Sipariş oluşturulmadan önce ürün ve stok bilgileri backend üzerinden doğrulanmalı.
2. Fiyatlar veritabanından tekrar okunmalı.
3. Ödeme sağlayıcısına gönderilecek tutar backend tarafından hesaplanmalı.
4. Ödeme başlatılırken sipariş beklemede olmalı.
5. Kullanıcının ödeme sayfasından geri dönmesi tek başına ödeme başarılı anlamına gelmemeli.
6. Sağlayıcının callback/webhook bildirimi doğrulanmalı.
7. Ödeme imzası ve güvenlik doğrulaması yapılmalı.
8. Ödeme başarılıysa sipariş durumu güncellenmeli.
9. Başarısız ödeme siparişi başarılı olarak işaretlenmemeli.
10. Aynı webhook birden fazla geldiğinde sipariş iki kez işlenmemeli.

Kart numarası, CVV ve hassas kart bilgileri veritabanına kaydedilmemeli.

Ödeme işlemleri idempotent tasarlanmalı.

Gerçek ödeme sağlayıcısı entegrasyonu yapılmadan canlı ödeme varmış gibi gösterilmemeli.

---

# 7. Reklam ve Analitik

İşletme reklam vererek müşteri kazanmayı hedeflediğinden bu bölüm önemlidir.

Entegrasyon için altyapı hazır olmalı:

## Meta

- Meta Pixel.
- ViewContent.
- AddToCart.
- InitiateCheckout.
- Purchase.

## Google

- Google Analytics 4.
- Google Ads dönüşüm takibi.
- Google Merchant Center için ürün feed altyapısı.

Önemli:

- Purchase eventi yalnızca doğrulanmış başarılı ödeme sonrasında tetiklenmeli.
- Aynı sipariş için satın alma olayı iki kez gönderilmemeli.
- Müşteri onayı gereken çerez ve reklam teknolojileri uygun izin mekanizmasıyla çalışmalı.
- Pixel ve analitik ID'leri admin ayarlarından veya güvenli environment değişkenlerinden yönetilebilmeli.

---

# 8. SEO ve Performans

Google'da ürünlerin bulunabilmesi için:

- SEO uyumlu URL yapısı.
- Her ürün için özel meta title.
- Meta description.
- Sitemap.xml.
- Robots.txt.
- Canonical URL.
- Open Graph.
- Ürün yapılandırılmış verisi (Product Schema).
- Breadcrumb Schema.
- Görsel alt metinleri.
- Server-side rendering.
- Görsel optimizasyonu.

Mobil performans özellikle önemli.

Core Web Vitals değerleri dikkate alınmalı.

Gereksiz JavaScript yüklenmemeli.

Ürün listeleme ve detay sayfalarında uygun cache stratejisi kullanılmalı.

---

# 9. Güvenlik

Gerçek ticari bir sistem geliştirildiği için güvenlik sonradan eklenecek bir özellik değildir.

Zorunlu gereksinimler:

- Admin panelinde güvenli kimlik doğrulama.
- Rol bazlı yetkilendirme.
- Şifrelerin güvenli hash algoritmasıyla saklanması.
- Güvenli session/cookie yönetimi.
- CSRF koruması gereken işlemlerde uygun önlemler.
- XSS koruması.
- SQL injection koruması.
- Rate limiting.
- Brute-force giriş koruması.
- Zod ile sunucu tarafı doğrulama.
- Dosya yükleme kontrolleri.
- Güvenli environment değişkenleri.
- Hassas bilgilerin loglanmaması.
- Admin işlemlerinin audit log kayıtları.
- Ödeme webhook doğrulaması.
- HTTPS.
- Güvenli hata yönetimi.

Admin yetkileri yalnızca arayüzde buton gizleyerek korunmamalı. Her işlem backend tarafında yetkilendirilmelidir.

---

# 10. Türkiye İçin Ticari Gereksinimler

Sistem Türkiye'de kullanılacağı için aşağıdaki alanlar planlanmalı:

- Türk Lirası (TRY).
- Türkçe arayüz.
- Türkiye adres yapısı.
- Telefon numarası doğrulaması.
- Vergi ve fatura bilgileri.
- Mesafeli satış sözleşmesi.
- Ön bilgilendirme formu.
- İade ve iptal politikası.
- KVKK aydınlatma metni.
- Gizlilik ve çerez politikası.
- ETBİS ve ilgili ticari yükümlülüklerin değerlendirilmesi.

Yasal metinleri otomatik olarak uydurma. İşletmenin gerçek bilgileri ve hukuki gereksinimleri doğrulanarak tamamlanmalı.

Vergi hesaplamaları, fatura süreçleri ve ödeme kayıtları doğru şekilde modellenmeli.

---

# 11. Veritabanı Modelleri

İlk aşamada aşağıdaki modelleri değerlendir:

- User
- Role
- Address
- Product
- ProductImage
- Category
- ProductVariant
- Inventory
- Cart
- CartItem
- Order
- OrderItem
- Payment
- Coupon
- CouponUsage
- Review
- Shipment
- SiteSetting
- AuditLog

İhtiyaç duyulmayan modelleri gereksiz yere oluşturma.

Veritabanında:

- Foreign key ilişkileri.
- Unique alanlar.
- Indexler.
- Uygun veri tipleri.
- Decimal fiyat alanları.
- Transaction kullanımı.

dikkatle tasarlanmalı.

Sipariş oluşturulduğunda ürün adı, fiyatı, varyantı ve diğer önemli bilgiler OrderItem içerisinde sipariş anındaki haliyle saklanmalı.

Ürün sonradan değiştirildiğinde eski siparişlerin bilgileri değişmemeli.

Stok işlemleri eşzamanlı siparişlerde güvenli olmalı.

---

# 12. Tasarım Standartları

Tasarım modern, sade, premium ve güven veren bir e-ticaret deneyimi sunmalı.

Hazır admin template görünümünden kaçınılmalı.

Tasarım kararları:

- Tutarlı spacing sistemi.
- Modern tipografi.
- Sade renk paleti.
- Net görsel hiyerarşi.
- Güçlü ürün görselleri.
- Kullanıcı dostu alışveriş akışı.
- Mobile-first responsive tasarım.
- Erişilebilirlik.
- Loading, empty ve error durumları.
- Toast bildirimleri.
- Skeleton ekranları.

## 12.1 Renk Teması — Krem ve Süt Kahvesi

Müşteri tarafı sıcak, sade ve premium durmalıdır. Tema krem zemin üzerine süt kahvesi ve espresso kahverengisi tonlarıyla kurulur. Soğuk gri, saf siyah ve neon vurgu kullanılmaz.

Renk tokenları:

| Rol | Hex | Kullanım |
| --- | --- | --- |
| Krem zemin | `#FBF6EF` | Sayfa arka planı |
| Sıcak kart | `#FFFCF8` | Kart, form, dropdown |
| Krem koyu | `#F3E6D6` | İkincil yüzey, şerit, iskelet |
| Süt kahvesi | `#C4A484` | İkincil buton, ikon, ayırıcı vurgu |
| Kahve | `#8C6239` | Ana buton, link, aktif durum |
| Espresso | `#4A3426` | Başlık, ana metin, footer zemin |
| Yumuşak metin | `#7A6456` | İkincil metin, etiket |
| Çizgi | `#E7D7C6` | Border, ayırıcı |
| Başarı | `#3E6B4F` | Stokta, başarılı işlem |
| Uyarı | `#A15C2F` | Az stok, uyarı |
| Hata | `#8E3B32` | Hata, stok yok, iptal |

Kurallar:

- Ana eylem butonu kahve zemin, krem yazı olur.
- Footer espresso zemin, krem yazı olur.
- İndirim fiyatı kahve tonunda, eski fiyat üstü çizili yumuşak metin olur.
- Admin paneli aynı paleti kullanır; yoğun tablolarda zemin krem, satır ayrımı çizgi rengiyle kalır.
- Kontrast, gövde metninde en az WCAG AA olmalıdır. Yumuşak metin küçük puntoda tek başına kullanılmaz.

Tipografi:

- Başlıklar: `Fraunces` (serif, sıcak ve premium).
- Arayüz ve gövde: `DM Sans`.
- Fiyatlar rakam olarak net okunur; başlık fontu fiyat alanında kullanılmaz.

## 12.2 Mobil ve Responsive

Tasarım önce telefondan kurulur, sonra tablete ve masaüstüne genişler. Mobil, sonradan sıkıştırılmış bir masaüstü yerleşim değildir.

Kırılım noktaları:

- Telefon: 0–639px. Tek kolon, alt boşluklu yapışkan eylemler.
- Büyük telefon / küçük tablet: 640–767px.
- Tablet: 768–1023px. İki kolonlu ürün ızgarası.
- Masaüstü: 1024px ve üzeri. Tam navigasyon, filtreler sayfanın yanında.

Mobil kurallar:

- Yatay kaydırma olmaz. Taşan metin kırılır, fiyatlar ve butonlar ekran dışına çıkmaz.
- Dokunma hedefleri en az 44px yüksekliktedir.
- Üst menü hamburger ile açılır. Arama, hesap ve sepet ikonları başlıkta kalır.
- Kategori ve filtreler mobilde tam ekran panel (sheet) olarak açılır.
- Ürün detayında fiyat ve sepete ekle altta yapışkan bir çubukta durur. Çubuk, telefonun alt güvenli alanını (safe area) hesaba katar.
- Sepet mobilde sağdan veya alttan açılan paneldir. Satırda görsel, ad, adet ve satır toplamı alt alta bozulmadan durur.
- Ürün kartı ızgarası telefonda 2 kolon, tablette 3, masaüstünde 4 kolondur. Kart içi fiyat ve stok rozeti taşmaz.
- Formlar tek kolondur. Şehir ve ilçe alanları mobilde alt alta, masaüstünde yan yanadır.
- Checkout adımları mobilde kısa başlıklarla ilerler. Sipariş özeti, ödeme butonunun üstünde görünür.
- Görseller sabit en-boy oranındadır. Yüklenene kadar krem iskelet gösterilir.
- Tablo gereken admin ekranlarında mobilde yatay tablo yerine kart listesi kullanılır.
- Toast bildirimleri telefonun üstünde, başlığın altında kalır ve içeriği kapatmaz.

Admin paneli ile müşteri tarafı aynı tasarım diliyle ama farklı kullanım ihtiyaçlarına göre tasarlanmalı.

Önemli:

Müşteri tarafında satış ve güven hissi önceliklidir.

Admin tarafında hız, okunabilirlik ve işlem kolaylığı önceliklidir.

Gerçek ürün görselleri sağlanana kadar kaliteli placeholder görseller kullanılabilir.

---

# 13. Geliştirme Aşamaları

Projeyi aşağıdaki aşamalara göre geliştir.

Her aşama tamamlanmadan diğer aşamaya geçme.

## Aşama 1 – Proje Temeli

- Next.js projesini oluştur.
- TypeScript ve Tailwind ayarlarını yap.
- shadcn/ui kurulumunu gerçekleştir.
- PostgreSQL bağlantısını kur.
- Prisma yapılandırmasını yap.
- Environment dosyalarını hazırla.
- Temel proje klasörlerini oluştur.
- ESLint ve Prettier yapılandır.
- Projenin çalıştığını doğrula.

## Aşama 2 – Veritabanı ve Kimlik Doğrulama

- Prisma modellerini oluştur.
- Migration işlemlerini yap.
- Admin giriş sistemini kur.
- Güvenli oturum yönetimini oluştur.
- Rol ve yetkilendirme sistemini kur.
- Admin seed işlemini güvenli şekilde hazırla.

## Aşama 3 – Yönetim Paneli

- Dashboard.
- Ürün yönetimi.
- Kategori yönetimi.
- Stok yönetimi.
- Sipariş yönetimi.
- Müşteri yönetimi.
- Kupon yönetimi.
- Site ayarları.

Bütün CRUD işlemleri gerçek veritabanıyla çalışmalı.

## Aşama 4 – Müşteri Tarafı

- Ana sayfa.
- Header ve footer.
- Ürün listeleme.
- Kategori sayfaları.
- Ürün detay.
- Arama ve filtreleme.
- Sepet.

Müşteri arayüzünün her parçası yazılırken telefon, tablet ve masaüstü birlikte ele alınır. Mobil uyum ayrı bir son iş olarak bırakılmaz. Tema, bölüm 12.1 ve 12.2 kurallarına uyar.

## Aşama 5 – Sipariş Sistemi

- Misafir siparişi.
- Müşteri hesabı.
- Checkout.
- Adres yönetimi.
- Sipariş oluşturma.
- Stok kontrolü.
- Sipariş geçmişi.

## Aşama 6 – Ödeme Entegrasyonu

- iyzico veya PayTR API entegrasyonu.
- Test ortamı.
- Ödeme başlatma.
- Callback/webhook.
- İmza doğrulaması.
- Başarılı ve başarısız ödeme senaryoları.
- İade altyapısı.

## Aşama 7 – Reklam ve SEO

- Meta Pixel altyapısı.
- GA4.
- Google Ads dönüşüm takibi.
- SEO metadata.
- Sitemap.
- Robots.txt.
- Structured Data.
- Ürün feed altyapısı.

## Aşama 8 – Test ve Yayına Hazırlık

- Unit testler.
- Integration testler.
- E2E testler.
- Güvenlik kontrolleri.
- Mobil testler.
- Ödeme senaryoları.
- Sipariş senaryoları.
- Performans testleri.
- Production yapılandırması.
- Yedekleme ve loglama.

---

# 14. Cursor İçin Çalışma Kuralları

Bu bölüm çok önemlidir.

Sen bu projenin kıdemli yazılım mimarı ve geliştiricisisin.

Projeyi geliştirirken aşağıdaki kurallara kesinlikle uy:

1. Bütün projeyi tek seferde oluşturmaya çalışma.
2. Her geliştirme aşamasını küçük görevlere böl.
3. Bir aşamaya başlamadan önce mevcut dosyaları incele.
4. Var olan çalışan kodları gereksiz yere silme veya değiştirme.
5. Önce mimariyi ve yapılacak işlemleri açıkla, sonra kodla.
6. Her aşamada oluşturulacak ve değiştirilecek dosyaları belirt.
7. Kodları TypeScript ile yaz.
8. Gereksiz `any` kullanımından kaçın.
9. Kod tekrarını azalt.
10. Gereksiz abstraction ve karmaşıklık oluşturma.
11. Her işlemin hata durumunu düşün.
12. Güvenlik kontrollerini en baştan uygula.
13. Veritabanı değişikliklerinde migration kullan.
14. Çalışmayan özellikleri tamamlanmış gibi gösterme.
15. Mock verileri gerçek sistem verilerinden açıkça ayır.
16. Her aşamanın sonunda testleri çalıştır.
17. TypeScript hatalarını ve lint hatalarını çözmeden ilerleme.
18. Environment değişkenlerini `.env.example` içerisinde belgele.
19. API anahtarlarını hiçbir zaman kaynak koda yazma.
20. Gereksiz paket yükleme.

## Çalışma Şekli

Her aşamada şu sırayı takip et:

1. Yapılacak işi açıkla.
2. Mevcut mimariyle ilişkisini değerlendir.
3. Gerekli dosyaları belirle.
4. Geliştirmeyi gerçekleştir.
5. Testleri çalıştır.
6. Hataları düzelt.
7. Tamamlanan özellikleri listele.
8. Sonraki aşamaya geçmeden önce benden onay bekle.

Benim bilgim dışında büyük mimari değişiklikler yapma.

Bir konuda önemli teknik karar gerekiyorsa en iyi çözümü kendin öner ve nedenini açıkla. Bana sürekli birbirine benzeyen alternatifler sunma.

---

# 15. Projenin Başarı Kriterleri

Proje tamamlandığında:

- Müşteri siteye girebilmeli.
- Ürünleri inceleyebilmeli.
- Ürünleri sepete ekleyebilmeli.
- Misafir veya üye olarak sipariş oluşturabilmeli.
- Gerçek ödeme sağlayıcısıyla ödeme yapabilmeli.
- Ödeme başarılı olduğunda sipariş doğru şekilde güncellenmeli.
- Admin siparişleri görebilmeli.
- Admin ürün ve stok yönetebilmeli.
- Kargo bilgileri eklenebilmeli.
- Müşteri sipariş durumunu takip edebilmeli.
- Reklam dönüşümleri ölçülebilmeli.
- Site telefonda, tablette ve masaüstünde krem / süt kahvesi temasıyla, taşmadan ve tek elle kullanılabilecek şekilde çalışmalı.
- SEO altyapısı hazır olmalı.
- Güvenlik kontrolleri uygulanmış olmalı.
- Sistem production ortamına alınabilir durumda olmalı.

---

# 16. Çalışma Dilimleri

Proje tek seferde yazılmaz. Her dilim bitince durulur ve onay beklenir. Onay gelmeden sonraki dilime geçilmez.

Müşteri arayüzü içeren her dilim, bölüm 12.1 paleti ve bölüm 12.2 mobil kurallarıyla birlikte teslim edilir.

| Dilim | İş | Bitti sayılması |
| --- | --- | --- |
| 0 | Doküman: tema, mobil kurallar, işletme kararları | Bu dosyada kayıtlı ve onaylı |
| 1 | Next.js, TypeScript, Tailwind, ESLint, Prettier, tema tokenları, çalışan boş sayfa | `npm run dev` açılır, lint temizdir |
| 2 | shadcn/ui, wordmark, header, footer, mobil menü iskeleti | Telefonda menü açılır, taşma yoktur |
| 3 | Prisma, PostgreSQL, şema ve ilk migration | Veritabanı ayağa kalkar, migration uygulanır |
| 4 | Admin oturumu, rol ve güvenli seed | Admin giriş yapabilir |
| 5 | Kategori ve ürün yönetimi | Üç kök kategori ve ürün CRUD çalışır |
| 6 | Vitrin: ana sayfa, liste, detay | Üç bölüm ve ürünler mobilde düzgün görünür |
| 7 | Sepet ve kupon hesabı | Fiyatlar sunucuda hesaplanır |
| 8 | Checkout, misafir sipariş, stok düşümü | Sipariş kaydı oluşur |
| 9 | Müşteri hesabı, adres, sipariş takibi | Üye ve misafir siparişi izlenir |
| 10 | Mock ödeme akışı | Başarı ve başarısızlık siparişi doğru günceller |
| 11 | Kargo, durum ve admin sipariş ekranı | Admin kargo bilgisi girer |
| 12 | SEO, çerez izni, analitik iskeleti | Metadata ve sitemap vardır |
| 13 | Testler ve yayına hazırlık | Kritik akışlar testten geçer |

Dilim 3, yerel PostgreSQL veya bağlantı dizesi gerektirir. Bağlantı yoksa o dilimde durulup sorulur.

# 17. İlk Görev

Şimdi projeye başla.

Ancak ilk aşamada bütün sistemi kodlamaya çalışma.

Öncelikle:

1. Bu dokümanı analiz et.
2. Proje mimarisini değerlendir.
3. Kullanılacak paketleri ve nedenlerini belirle.
4. Veritabanı mimarisini planla.
5. Proje klasör yapısını oluştur.
6. Geliştirme aşamalarını görev listesine dönüştür.
7. İlk aşamanın geliştirmesini gerçekleştir.

İlk aşama tamamlandığında test sonuçlarını ve oluşturulan dosyaları raporla.

Sonraki aşamaya geçmeden önce onayımı bekle.

**Temel prensip: Gerçekten çalışan, güvenli, hızlı, profesyonel ve satış yapmaya hazır bir e-ticaret sistemi geliştir.**