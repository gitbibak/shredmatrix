# Search Console analizi: 30 Eylül 2026

Kaynak: Search Console, son 28 gün (31 Ağustos - 27 Eylül). Mülk sahipliği bu oturumda
HTML dosyasıyla ahmet.deveci@astareklam.com.tr hesabına da açıldı (worker `/google43d75fde738355cf.html`
yolunu doğrudan sunar; dosya kaldırılırsa erişim düşer).

## Genel

| Metrik | Değer |
| --- | ---: |
| Tıklama | 65 |
| Gösterim | 1.540 |
| Ortalama TO | %4,2 |
| Ortalama konum | 19,9 |
| Marka tıklaması ("full balance", "fullbalance", "full bal") | 30 (%46) |
| Mobil / masaüstü tıklama | 54 / 10 |
| Dizinde / dizin dışı | 83 / 74 |

Dizin dışı 74 sayfanın 66'sı beklenen durum (52 canonical alternatif, 14 yönlendirme), 3'ü
kasıtlı noindex (`/auth`). Gerçek eksik 4 sayfa: `/bazal-metabolizma-hesaplama`,
`/pilates-mi-yoga-mi`, `/uyku-meditasyonu`, `/en/beginner-workout-plan-over-40`.
Bunlar için dizine ekleme isteği bu oturumda gönderildi; sitemap durumu "Başarılı", 91 URL.
IndexNow 91 URL ile yeniden bildirildi.

Ülkeler: Türkiye 640 gösterim / 18 tıklama (konum 18,5); İspanya 195 / 4 (konum 41,7);
ABD 101 / 5 (konum 33,6). İspanyolca sayfalar gösterim alıyor ama 40+ konumda.

## Sayfa 1'de olup tıklanmayan sorgular (fırsat)

| Sorgu | Gösterim | Konum | Sayfa |
| --- | ---: | ---: | --- |
| evde dambıl ile spor programı | 21 | 9,3 | evde-dambil-antrenman-programi |
| evde pilates programı ücretsiz | 19 | 8,6 | baslangic-pilates-programi |
| where to find free workout plans | 15 | 4,6 | /en |
| plan tonificación ... con mancuernas personalizado | 12 | 2,2 | es/entrenamiento-en-casa-con-mancuernas |
| 30 günlük dambıl programı | 10 | 9,8 | evde-dambil-antrenman-programi |
| 40 yaş üstü spor programı | 9 | 8,8 | 40-yas-ustu-evde-spor-programi |
| öğün kalori hesaplama | 8 | 6,1 | kalori-makro-takibi |
| kalori hesapla | 5 | 5,4 | gunluk-kalori-ihtiyaci-hesaplama |
| almam gereken kalori hesaplama | 5 | 6,2 | gunluk-kalori-ihtiyaci-hesaplama |
| ücretsiz yoga uygulamaları | 5 | 8,6 | yoga-uygulamasi |
| 30 günlük pilates programı ücretsiz | 5 | 9,0 | baslangic-pilates-programi |
| evde dumbell ile vücut geliştirme programı | 5 | 9,0 | evde-dambil-antrenman-programi |
| evde kas geliştirilir mi | 4 | 9,5 | evde-kas-gelistirme-hareketleri |

Konum 5-10 arasında sıfır tıklama, başlığın sorguyla eşleşmemesi demek. Bu oturumda
başlıklar sorgu ifadesine göre yeniden yazıldı (dambıl, pilates, yoga, fotoğrafla kalori,
günlük kalori, evde kas, EN kişisel plan).

## İçerik boşlukları (gösterim var, konum 25+)

- `evde-kas-gelistirme-hareketleri`: 120 gösterim, konum 29,4. Sorgular: "evde kas hareketleri",
  "kas yapmak için evde yapılabilecek hareketler", "evde kas çalışma programı". Sayfaya 12 hareketlik
  liste ve iki SSS eklendi.
- `gunluk-kalori-ihtiyaci-hesaplama`: 101 gösterim, konum 44. "kilo korumak için günlük kalori"
  ailesi (28 gösterim, konum 55-89). Koruma kalorisi SSS'si eklendi.
- `es/calculadora-calorias-macros` (83, konum 58), `es/plan-entrenamiento-personalizado` (61, konum 56),
  `en/personal-workout-plan` (66, konum 58): İspanyolca ve İngilizce hesaplayıcı sayfaları uzun
  kuyrukta görünüyor ama sıralamıyor; bir sonraki adım bu sayfalara gerçek örnek hesap tabloları ve
  SSS bloğu eklemek.

## Google'da doğrudan kontrol (bu oturum, Chrome)

"evde spor programı ücretsiz uygulama", "ekipmansız antrenman programı", "ücretsiz fitness uygulaması",
"evde dambıl antrenman programı", "fotoğrafla kalori hesaplama" sorgularında ilk sayfada değiliz;
sonuçları Google Play/App Store listeleri, Tamindir/Webtekno listeleri ve Ağırsağlam, Supplementler,
MACFit blogları alıyor. "fullbalance.app" marka aramasında site bağlantıları ve fiyatlandırma sayfasını
alıntılayan yapay zeka özeti çıkıyor.

Sonuç: kısa kuyruk (2-3 kelime) sorgularda mağaza listeleri kazanıyor; bizim kazanabildiğimiz alan
uzun kuyruk ("30 günlük dambıl programı", "40 yaş üstü spor programı", "evde kas geliştirilir mi").
Bu yüzden strateji: uzun kuyruk sayfalarını derinleştirmek ve Play Store listesi (bütçe kararı
değişirse) ile kısa kuyruğa girmek.

## Yapılamayanlar

- Bing Webmaster Tools: Chrome'da Microsoft hesabı oturumu yok; hesap açma/oturum açma yapılmadı.
- Supabase sayaçları: execute_sql izni hâlâ kapalı.
