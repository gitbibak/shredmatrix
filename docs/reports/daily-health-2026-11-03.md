Destek: açık talep yok

# Günlük ve haftalık büyüme denetimi — 3 Kasım 2026

ISO **2026-W45 haftalık bölüm tamamlandı**. Bu haftada yeniden çalıştırılmayacak. Supabase ilk bağlantı/onay hatalarından sonra tek tekrarda okundu; kişisel veri/e-posta çıkartılmadı. Açık/reviewing ve son 24 saat destek sonucu boş. Yanıt/kapatma yok. Kullanıcı public/llms.txt değişikliği ve ilgisiz dosyalar korundu.

## Kayıt, plan ve 500 hedefi

Europe/Istanbul tamamlanmış günler, admin profilleri hariç. Toplam stok **387 üye, %77,4 hedef ilerlemesi**; 113 üye kaldı. Toplam stok devam eden gün kayıtlarını içerebilir, dönem tabloları içermez.

| Dönem | Kayıt | Şu anda planı olan yeni üye | EN | ES | TR |
|---|---:|---:|---:|---:|---:|
| 2 Kasım | 4 | 4 | 2 | 0 | 2 |
| 31 Ekim–2 Kasım | 15 | 15 | 9 | 0 | 6 |
| 27 Ekim–2 Kasım | 34 | 32 | 23 | 0 | 11 |
| 4 Ekim–2 Kasım | 122 | 114 | 90 | 3 | 29 |

Son 2 gün 7 kayıt/7 planlı, ortalama 3,5; 3 gün ortalama 5. Haftalık kayıt hızı 4,86/gün, 30 günlük 4,07/gün. Haftalık EN+ES %67,6, 30 günlük %76,2. Dil mevcut arayüz dili, ülke veya ilk giriş dilinin kesin kanıtı değil. Haftalık plan stoku %94,1, 30 günlük %93,4; aynı gün plan üretme/ilk antrenman aktivasyonu değildir. Kayıt ve yabancı dil eşikleri hedefte; yalnızca tarih geldi diye değişiklik yapılmadı.

## Haftalık geri dönüş ve kaynaklar

Geri dönüş: kayıt tarihinden sonraki tam yerel D1/D7 gününde en az bir kimliği bağlı growth_event. Tamamlanmış takip günü olan kohortlar paydada; adminler hariç.

| Kayıt kohortu | D1 | D7 |
|---|---:|---:|
| 27 Ekim–2 Kasım | 6/30 = %20 | Olgun kohort yok |
| 4 Ekim–2 Kasım | 17/118 = %14,4 | 1/88 = %1,1 |

34/34 haftalık ve 122/122 aylık yeni üyenin rapor penceresinde kimliği bağlı olayları var. Bu, tüm anonim ziyaretçilerin veya tüm gerçek geri dönüşlerin ölçüldüğü anlamına gelmez. D7 zayıf kalıyor; önceki haftadaki aynı düzeyden yeni bir kötüleşme kanıtı çıkarılmadı. En önemli huni sorunu plan edinmekten sonra düzenli antrenman/geri dönüş.

Profilde kayıtlı kaynaklara göre yeni üye / mevcut plan:

| Kaynak | 7 gün | 30 gün |
|---|---:|---:|
| chatgpt.com | 26/24 | 77/70 |
| direct | 4/4 | 30/29 |
| google | 4/4 | 15/15 |

Bunlar birinci taraf kayıtlı atıf alanlarıdır; GA4 oturum kaynaklarıyla birebir eşleştirilemez ve bağımsız referrer doğrulaması değildir. Kayıt/ziyaretçi dönüşüm oranı çıkarılmadı.

İlk açılış sayfasına göre 7 gün: /en 16/14, / 12/12, /en/photo-calorie-counter 3/3; /auth, /evde-dambil-antrenman-programi, /30-gunluk-evde-spor-programi her biri 1/1. 30 gün: /en 43/38, /en/photo-calorie-counter 33/30, / 28/28, diğer sayfalar 18/18. Sayfa bazında örneklem küçük; ham sayılardan üstün dönüşüm iddiası yok.

## Arama: 7 ve 30 gün

GSC bugün de son tamamlanmış günü 31 Ekim olarak gösterdi. 1–2 Kasım eksik verisi sıfır veya tam gün sayılmadı.

| GSC Web dönemi | Tıklama | Gösterim | CTR | Konum |
|---|---:|---:|---:|---:|
| 25–31 Ekim | 35 | 1.059 | %3,3 | 12,0 |
| 2–31 Ekim, 30 gün | 141 | 3.945 | %3,6 | 16,7 |

Hafta 5 tık/gün, ay 4,7 tık/gün; haftalık gösterim/gün 151,3 ve aylık 131,5. Biri diğerinin içinde olduğu ve sorgu karışımı değiştiği için bağımsız dönem artışı diye yorumlanmıyor. Haftalık görünür sorgu full balance 2/98, evde dambıl ile spor programı 1/15. Son haftanın sayfa sonuçları aynı sabit pencere için 2 Kasım raporunda: dambıl 10/294, tek dambıl blogu 5/58, /en 3/105.

Bugün okunan 30 günlük sayfalar: dambıl 49/1.058 (%4,6; 7,2), /en 32/483 (%6,6; 3,5), ana sayfa 8/85, 40 yaş üstü 7/141, kadınlar için evde spor 5/120, tek dambıl blogu 5/97 (%5,2; 7,2), ES direnç bandı 5/89, ES dambıl 5/27. Tıklama/gösterim gösteriliyor. Sorgu toplamı gizlilik nedeniyle tüm tıklamaları açıklamayabilir.

## GA4: 7 ve 30 gün

| GA dönemi | Oturum | Etkileşimli | Etkileşim oranı | Olay | Önemli etkinlik |
|---|---:|---:|---:|---:|---:|
| 27 Ekim–2 Kasım | 50 | 38 | %76 | 944 | 0 |
| 4 Ekim–2 Kasım | 225 | 175 | %77,78 | 3.389 | 0 |

7 gün kanal: Unassigned 30, AI Assistant 8, Direct 8, Organic Search 4, Referral 1. Kanal satırları 51, genel toplam 50; arayüz farkı olduğu gibi korunuyor. 30 gün: Organic Search 85, Unassigned 81, Direct 31, Referral 15, AI Assistant 13, Organic Social 1; satırlar 226, toplam 225. GA mülk saat dilimi ayrıca doğrulanmadı; GSC ve Supabase ile bölünerek dönüşüm oranı çıkarılmadı.

Organik olarak sınıflanan oturumların haftalık hızı aylıktan düşük; fakat genel Unassigned payı haftada %60 ve 1 Kasım ölçüm düzeltmesi henüz üç tam gün yaşamadı. Gerçek organik trafik çöküşü veya düzeltme başarısı ilan edilmedi. 2 Kasım'da önemli etkinlik tanımlanan signup_completed için ilk izinli gerçek olay doğrulaması bekleniyor; rapordaki 0 gerçek kayıt yok anlamına gelmez. Bugün ayar tekrar değiştirilmedi.

## Deney 1 — 30 günlük içerik

20–31 Ekim 12 gün / önceki 22 Eylül–19 Ekim 28 gün karşılaştırması; farklı sürelerin toplamları artış yüzdesi değildir. Son veri dünküyle aynı tarih aralığıdır, yeni gün sonucu değil.

| Sorgu | Önce: tık/gösterim; CTR; konum | Sonra: tık/gösterim; CTR; konum |
|---|---|---|
| 30 günlük dambıl programı | 2/80; %2,5; 6,1 | 0/45; %0; 5,7 |
| dambıl çalışma programı | 0/31; %0; 9,3 | 0/7; %0; 14,1 |
| dambıl antrenman programı | 0/22; %0; 8,0 | 0/5; %0; 7,4 |
| evde dambıl ile spor programı | 2/37; %5,4; 8,2 | 1/23; %4,3; 8,2 |
| evde dumbell ile vücut geliştirme programı | 2/55; %3,6; 8,9 | 1/9; %11,1; 8,4 |
| evde pilates programı ücretsiz | 0/70; %0; 8,3 | 0/32; %0; 7,4 |
| 30 günlük pilates programı | 0/43; %0; 8,7 | 0/145; %0; 8,6 |

Pilates gösterim artışı tıklamaya dönüşmüyor; ilerideki dar CTR deneyi için aday. 3 Kasım sınırının dolması tek başına değişiklik gerekçesi değil. Kayıt hedefi karşılandığı ve daha yeni tam veri olmadığı için içerik değişmedi. İki blog güncel pencere arama performansında mevcut; üçüncü `/blog/evde-kas-yapilir-mi` bugün URL denetiminde **URL Google'da mevcut / Sayfa dizine eklendi** olarak doğrulandı. Yeniden indeksleme isteği gönderilmedi.

## Deney 2 — antrenman ve 1 Kasım açıklaması

27 Ekim–2 Kasım: 33 started olay/18 üye; kaynak today_focus 19/15 üye, workout_panel 14/6 üye. Kaynak kullanıcıları çakışabilir; toplam benzersiz 18. Guided completed 7 olay/5 üye, quick 0. Dönem kullanıcı oranı %27,8 ve olay oranı %21,2; kesin oturum eşleştirmesi değil. workout_completed source workout_session 7/5 üye, workout_panel 0. workout_logs.date 7 kayıt/5 üye. İlk referans 13–19 Ekim 1, önceki 30 gün 37 workout_completed olayıdır.

1 Kasım ilk set açıklaması için yalnızca iki tamamlanmış takvim günü var; yayın öncesi 1 Kasım saatleri de aynı güne dahil. En az üç tam gün/ anlamlı örneklem oluşmadan tekrar UI değişikliği yok. Önceki none kapatma sinyali ilk set öncesi sürtünmeyi aday yapıyor; nedensellik ve kalıcı terk kanıtı değil. Kayıt hedefleri karşılandığından bugün ek büyüme deneyi uygulanmadı.

## Canlı durum, test ve karar

Ana sayfa, /en, /es, EN kayıt formu, oturumsuz /dashboard, sitemap.xml, robots.txt tarayıcıda açıldı. Görünür beyaz ekran/kayıt engeli gözlenmedi; dashboard girişe döndü. Özel oturumlu uygulama ve gerçek kayıt gönderimi test edilmedi; tarama izinleri kamu sayfalarına açık. Haftalık odağımız edinme büyürken düşük D7 geri dönüş ve eksik GA kayıt sinyalini izlemek.

Bugün kod/SEO değişikliği, yeni build/test/yayın yok. 514 test ve başarılı üretim derlemesi 1 Kasım yayınına ait; genel lintteki 593 mevcut hata çözülmüş gibi sunulmuyor. Yalnızca bu rapor ve W45 otomasyon hafızası güncellendi.
