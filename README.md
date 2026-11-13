# Yanmersanhome

Mermer, ahşap ve kişisel ürünler için tek mağazalı e-ticaret sitesi.

## Geliştirme

```bash
npm install
npx prisma dev
npm run dev
```

`npx prisma dev` yerel PostgreSQL sürecini açar. Çıktıdaki `DATABASE_URL` ve `SHADOW_DATABASE_URL` değerlerini `.env` dosyasına yazın, ardından `npm run db:migrate` ile tabloları oluşturun. Yönetici hesabı `ADMIN_EMAIL` ve `ADMIN_PASSWORD` ile `npm run db:seed` komutundan gelir; giriş adresi `/admin/giris`. Aynı komut üç kök kategoriyi oluşturur ve eksikse örnek vitrin ürünlerini ekler; panelden değiştirilmiş ürünlerin üzerine yazmaz. Ürünler `/admin/urunler` altından yönetilir. Yayındaki ürünler `http://localhost:3000` vitrininde görünür. Ortam değişkenlerinin listesi `.env.example` dosyasındadır.
