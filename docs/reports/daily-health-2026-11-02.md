Destek: açık talep yok

# Günlük denetim — 2 Kasım 2026

Çalışma ağacında kullanıcıya ait public/llms.txt ve ilgisiz dosyalar korundu. Open/reviewing ve son 24 saat destek sorgusu ilk onay zaman aşımından sonra izin verilen tek tekrarda boş döndü. Yanıt veya kapatma yok.

## Üye ve aktivasyon

Europe/Istanbul tamamlanmış günler, yöneticiler hariç. Toplam **382 üye, 500 hedefinin %76,4'ü**.

| Dönem | Yeni kayıt | Şu anda planı olan yeni üye | EN+ES | plan_generated olay | Kimliği bağlı aktif üye |
|---|---:|---:|---:|---:|---:|
| 1 Kasım | 3 | 3 | 2 | 3 | 8 |
| 30 Ekim–1 Kasım | 16 | 16 | 11 | 18 | 21 |
| 26 Ekim–1 Kasım | 32 | 30 | 22 | 35 | 35 |

Son 2 gün 11 kayıt, ortalama 5,5; 3 gün ortalama 5,33. Haftalık EN+ES %68,75. Hedef eşikleri karşılanıyor. Plan stok ölçümü aynı gün aktivasyon değildir; olaylar yeni kayıt veya benzersiz plan sayısı değildir. Mevcut arayüz dili ülke/ilk giriş dilinin kesin kanıtı değildir. Aktif üye ölçümü kimliği bağlı anonim olaylardan gelir; izin ve kimlik eksikleri kapsama etki eder. Bugün Pazartesi, bu ISO haftasının Salı denetimi henüz gelmedi; haftalık 7/30 bölüm tekrarlanmadı.

## Canlı sağlık

Tarayıcıdan ana sayfa, /en, /es, EN kayıt formu, oturumsuz /dashboard, /contact, sitemap.xml ve robots.txt açıldı. Beyaz ekran gözlenmedi; oturumsuz dashboard giriş formuna dönüyor. Kayıt alanları ve Google giriş düğmesi görünür; gerçek hesap oluşturulmadı, oturumlu uygulama/ödeme/sağlık verisi değiştirilmedi. Sitemap XML ve arama botlarına kamu sayfası izni görüldü. Önceki HTTP istemcisi 403 sonucunu bugün kullanıcı akışı arızası olarak yorumlamıyoruz. Bütün olası kullanıcı akışları uçtan uca test edilmiş değildir.

## Arama ve trafik

GSC son tamamlanmış pencere **25–31 Ekim: 35 tıklama / 1.059 gösterim / %3,3 CTR / konum 12**. Bu, 31 Ekim'de okunan 22–28 Ekim penceresiyle örtüşür; bağımsız hafta büyüme oranı diye sunulmuyor. Sorgular full balance 2/98, evde dambıl ile spor programı 1/15. Sayfalar: dambıl 10/294, tek dambıl blog 5/58, /en 3/105, kadınlar için ev programı 2/70, Pilates 1/117, direnç bandı–dambıl blog 1/63. Bunlar tıklama/gösterimdir.

GA4 **26 Ekim–1 Kasım: 46 oturum, 35 etkileşimli, 841 olay, %76,09 etkileşim**. Kanallar Unassigned 26, Direct 9, AI Assistant 8, Organic Search 3, Referral 1. Satır oturum toplamı 47, genel toplam 46; raporda görünen fark korunuyor, toplam elle yeniden hesaplanmıyor. Önemli faaliyet 0 gerçek kayıt yok demek değildir. Mülk saat dilimi ayrıca doğrulanmadı. 1 Kasım kod düzeltmesinin en az 3 tam günü henüz oluşmadığından Unassigned düşüşüne başarı atfedilmiyor.

## Tamamlanan ölçüm ayarı

Önceki erişim engeli bugün kalktı. GA4 admin'de yalnızca purchase, qualify_lead, close_convert_lead önemli etkinlikleri vardı; son 28 günlük 38 etkinlik arasında signup_completed yoktu. Uygulamanın gönderdiği mevcut isim **signup_completed**, kodla gönderilen etkinlik olarak gelecekteki ölçüm için önemli etkinliğe kaydedildi. URL/page_view tetikleyicisiyle sahte kayıt türetilmedi. Varsayılan parasal değer atanmadı; etkinlik başına sayım korundu. Önemli etkinlikler listesinde yıldızlı signup_completed ve “Akış verisi algılanmadı” birlikte doğrulandı.

Bu ayar tek başına gerçek kayıt olayının Analytics'e ulaştığını kanıtlamaz; ilk izinli gerçek kayıt veya DebugView doğrulaması hâlâ gereklidir. Geçmiş kayıtları geriye dönük doldurmaz; reklam dönüşümü/Ads bütçesi değiştirilmedi. Mevcut Supabase kayıtları gerçek üye kaynağı olarak kullanılmaya devam ediyor. Kanıt: output/ga4-signup-key-event-2026-11-02.png.

## Deney 1 — içerik

20–31 Ekim (12 gün) ile 22 Eylül–19 Ekim (28 gün) referansı; farklı sürelerin ham toplamları büyüme oranı değildir. Değerler tıklama/gösterim, CTR, konum:

| Sorgu | Önceki 28 gün | 20–31 Ekim |
|---|---|---|
| 30 günlük dambıl programı | 2/80; %2,5; 6,1 | 0/45; %0; 5,7 |
| dambıl çalışma programı | 0/31; %0; 9,3 | 0/7; %0; 14,1 |
| dambıl antrenman programı | 0/22; %0; 8,0 | 0/5; %0; 7,4 |
| evde dambıl ile spor programı | 2/37; %5,4; 8,2 | 1/23; %4,3; 8,2 |
| evde dumbell ile vücut geliştirme programı | 2/55; %3,6; 8,9 | 1/9; %11,1; 8,4 |
| evde pilates programı ücretsiz | 0/70; %0; 8,3 | 0/32; %0; 7,4 |
| 30 günlük pilates programı | 0/43; %0; 8,7 | 0/145; %0; 8,6 |

Pilates CTR'si hâlâ zayıf; dambıl çalışma programı konumu gerilemiş. Kritik hata yok; içerikler 3 Kasım öncesi değiştirilmedi. İki yeni blogun arama gösterimi/tıklaması bugün yeniden görüldü. Üçüncü blog için son ayrı indeks denetimi 21 Ekim; bugün yeni URL denetimi veya tekrar indeksleme isteği yapılmadı. Eski kontrol güncelmiş gibi sunulmuyor.

## Deney 2 — antrenman

Son 7 gün 28 başlatma / 17 üye; guided bitirme 7 olay / 5 üye, quick 0. Dönem üye oranı %29,4, olay oranı %25; kesin eşleştirilmiş seans oranı değildir. workout_completed source workout_session 7, workout_panel 0. Son 7 günde workout_logs.date kaydı olan 5 üye. 3 gün başlatma 15/11 üye, bitirme 5/5; son gün başlatma 2/2, bitirme 0. Aynı dönem kişileri ve birebir kohortları karıştırmıyoruz.

Açık kapatma none 8 olay/6 üye, under_25 1/1; save_failed olayı yok. 1 Kasım ilk set yönlendirmesinden yalnızca bir tamamlanmış gün var; yeniden UI değiştirilmedi. Başlangıç referansı 13–19 Ekim 1 workout_completed, önceki 30 gün 37 olay. Henüz ilk set açıklamasının etkisi çıkarılamaz.

Kod, SEO içeriği, sitemap ve yayın bugün değiştirilmedi; yeni lint/test/build gerektiren kaynak değişikliği yok. 514 test ve üretim derlemesi 1 Kasım yayınına aittir. Genel lintteki mevcut 593 sorun sürüyor. Bugünkü değişiklik yalnızca GA4 ölçüm ayarı ve bu rapordur; yeni büyüme deneyi yok.
