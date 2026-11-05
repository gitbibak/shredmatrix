Destek: açık talep yok

# Günlük denetim — 5 Kasım 2026

Çalışma ağacı ve son commit'ler kontrol edildi. Kullanıcının public/llms.txt, ilgisiz dosyalar ve 4 Kasım challenge/Pilates/fiyat/yeni makale değişiklikleri korundu. Open/reviewing ve son 24 saat talepleri boş; yanıt/kapatma yok. W45 haftalık bölüm 3 Kasım'da tamamlandığından tekrar çalıştırılmadı.

## Hedef ve aktivasyon

Europe/Istanbul tamamlanmış günler, admin profilleri hariç. Toplam stok **398 üye, 500 hedefinin %79,6'sı**. Stok bugün oluşan üyeleri içerebilir; dönemler içermez.

| Dönem | Yeni kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 4 Kasım | 5 | 5 | 3 |
| 2–4 Kasım | 13 | 13 | 8 |
| 29 Ekim–4 Kasım | 32 | 32 | 20 |

Son 2 gün 9 kayıt/9 planlı, ortalama 4,5; 3 gün ortalama 4,33. Haftalık EN+ES %62,5. Hedefler karşılanıyor. Mevcut plan stoku aynı gün aktivasyon değildir; arayüz dili ülke/ilk geliş dilinin kesin kanıtı değildir. Eksik GA sinyali kayıt yok diye yorumlanmadı.

## Canlı sağlık

Ana sayfa, /en, /es, EN kayıt formu, oturumsuz /dashboard ve sitemap.xml tarayıcıda açıldı; dashboard girişe döndü, görünür beyaz ekran/kayıt engeli yok. Yeni /28-gunluk-challenge kamu girişi ve /en/pricing fiyat tablosu açıldı. Gerçek hesap açılmadı, kayıt isteği gönderilmedi, oturumlu özel akış tam test edilmedi. TR challenge sayfasında ortak inceleme tarihi 3 Eylül görünüyor; yeni yayın tarihiyle tutarsız bir şablon kalite konusu, kritik kullanım engeli değil. 18 Kasım deney koruması kapsamında değiştirilmedi.

## Arama ve GA4

GSC en son tamamlanmış dönem **27 Ekim–2 Kasım: 38 tıklama / 1.061 gösterim / %3,6 CTR / konum 10,7**. Gecikmeli 3–4 Kasım veri yokluğu tam gün sıfır sayılmadı. Sorgular full balance 3/114, evde dambıl ile spor programı 1/12. Sayfalar dambıl 7/251, /en 5/135, tek dambıl blogu 5/50, kadınlar için evde spor 4/79, 30 günlük evde spor 2/46, Pilates 1/120, direnç bandı–dambıl blogu 1/64. Değerler tıklama/gösterim; örtüşen önceki pencereyle bağımsız hafta artışı çıkarılmadı.

GA4 **29 Ekim–4 Kasım: 65 oturum, 52 etkileşimli, 1.077 olay, %80 etkileşim**. Kanallar Unassigned 41 (%63,08), AI Assistant 9, Direct 9, Organic Search 4, Referral 4. Satır oturum toplamı 67, genel toplam 65; rapor farkı düzeltilmiş gibi yapılmadı. Mülk saat dilimi ayrıca doğrulanmadı; diğer veri kaynaklarına bölünüp dönüşüm hesabı çıkarılmadı.

**Önemli yeni doğrulama:** trafik edinme önemli etkinlik filtresi özellikle `signup_completed` seçilince toplam **1 olay**, Direct satırında 1 görüldü. Sayfalar raporunda /auth üzerinde 1 önemli etkinlik görüldü. Böylece yalnızca tanımın varlığı değil, gerçek rapora olay teslim sinyali doğrulandı. Bu tek olay tüm gerçek kayıtların kapsandığı, benzersiz yeni insan olduğu veya 4 Kasım düzeltmesinin tek neden olduğu kanıtı değildir. Yayın sonrası olayın tam zamanı/metodu bireysel kullanıcı verisiyle eşleştirilmedi. Geçmiş kayıtlar geriye dönük gönderilmedi, test hesabı açılmadı. Unassigned hâlâ yüksek ve dönem düzeltme öncesi günleri içeriyor; kaynak ölçümü tamamen düzeldi diye sunulmuyor.

## Deney 1 — 30 günlük içerik

20 Ekim–2 Kasım 14 günlük pencere ile 22 Eylül–19 Ekim 28 günlük referans. Farklı sürelerin ham toplamları artış yüzdesi değildir. Bu pencere 4 Kasım yeni Pilates başlığından **önce** biter.

| Sorgu | Önce tık/gösterim; CTR; konum | Sonra tık/gösterim; CTR; konum |
|---|---|---|
| 30 günlük dambıl programı | 2/80; %2,5; 6,1 | 0/50; %0; 5,8 |
| dambıl çalışma programı | 0/31; %0; 9,3 | 0/7; %0; 14,1 |
| dambıl antrenman programı | 0/22; %0; 8,0 | 0/5; %0; 7,4 |
| evde dambıl ile spor programı | 2/37; %5,4; 8,2 | 1/24; %4,2; 8,2 |
| evde dumbell ile vücut geliştirme programı | 2/55; %3,6; 8,9 | 1/9; %11,1; 8,4 |
| evde pilates programı ücretsiz | 0/70; %0; 8,3 | 0/43; %0; 7,5 |
| 30 günlük pilates programı | 0/43; %0; 8,7 | 0/161; %0; 8,6 |

İki blog güncel arama gösterim/tıklamalarında var; evde-kas-yapilir-mi için son ayrı indeks kontrolü 3 Kasım'da Google'da mevcut idi, bugün tekrar istek yok.

## Deney 2 — antrenman

29 Ekim–4 Kasım, admin ve admin olaylarına bağlanan anonim kimlikler hariç:

- Started 38 olay / 20 üye; today_focus 20/15, workout_panel 18/9. Kaynak üye grupları çakışabilir.
- Guided completed 7/6 üye; quick 1/1. Modlar toplam benzersiz bitiren 6. Guided dönem üye oranı 6/20=%30; olay oranı 7/38=%18,4; kesin eşleştirilmiş seans dönüşümü değil.
- workout_completed: source workout_session 7/6 üye, workout_panel 1/1. workout_logs.date 8 kayıt / 6 üye.
- 4 Kasım: started 7/5 üye, guided completed 1/1, quick 0; logs 1/1. Tek gün küçük örneklem, kesin terk sebebi çıkarılmadı.

1 Kasım ilk set açıklaması korundu; anlamlı etki iddiası yok. Başlangıç referansı 13–19 Ekim 1 workout_completed / önceki 30 gün 37 olay olarak korunuyor. Huninin izlenecek sorunu, plan edinmiş üyeyi tekrarlı antrenman ve geri dönüşe taşımak; D7'nin son haftalık değeri dünkü değil 3 Kasım raporuna aittir.

## Deney 3 — start28 challenge (4 Kasım yayını)

Supabase'de properties.challengeId=start28 için hem son gün hem 7 gün toplamı: challenge_viewed source=today **9 olay/4 üye**, source=challenge_landing **0**; challenge_joined/completed/shared **0**. Bu yalnızca ölçülen olaylar; katılım engeli kanıtı değildir. 28 gün tamamlamanın bir günde oluşması beklenmez.

Profiles landing_path: /28-gunluk-challenge, /en/28-day-challenge, /es/reto-28-dias her biri son gün/7 günde 0 kayıt. Bu ilk açılış atfıdır, bu sayfaya herhangi bir zamanda uğrayıp kaydolanların tamamı değil. GSC'nin son verisi 2 Kasım, yayın ise 4 Kasım; dolayısıyla yayın sonrası gösterim/tıklama henüz **ölçülemiyor**, sıfır başarı/indeksleme hatası diye yazılmadı. Kritik hata yok; **18 Kasım'dan önce sayfalar değişmeyecek**.

## Deney 4 — yeni Pilates başlığı (4 Kasım)

Yeni başlık: “30 Günlük Pilates Programı: Evde, Ücretsiz, Gün Gün”. Son GSC günü 2 Kasım olduğundan yeni başlık sonrası CTR/konum henüz yok. İstenen gerçek önceki 28 gün 7 Ekim–3 Kasım; 3 Kasım henüz tamamlanmış veri olarak bulunmadığından tam taban bugün oluşturulmuş sayılmadı. Kullanıcı referansı 153 gösterim/0 tık/konum 8,6 farklı süreli başlangıç sinyalidir; 28 günlük taban diye etiketlenmedi. **18 Kasım'dan önce yeniden değişiklik yok**.

## Deney 5 — fiyat karşılaştırması (4 Kasım)

GA4 Sayfalar ve ekranlar, 29 Ekim–4 Kasım: tüm 9 sayfa satırı görüldü (217 görüntüleme/20 aktif kullanıcı toplamı); /fiyatlandirma, /en/pricing, /es/precios raporda yok. Bu yollar için **raporlanan görüntüleme 0**; izin/güncellik kapsamı nedeniyle gerçek ziyaret yokluğu kanıtı değil. Supabase growth_events page_view bu sayfaları ölçmez: bu legacy olay GA4'e gider. Supabase'deki 0 page_view satırı ziyaret metriği olarak kullanılmadı. Üç pricing landing_path için son gün/7 gün kayıt 0; sayfaya sonradan uğrayan tüm kullanıcı dönüşümü değildir.

Canlı /en/pricing'de tarihli App Store tablosu görüldü. src/data/storePrices.js CHECKED_AT **2026-11-04**; **en geç 4 Aralık 2026'da ve sonrasında ayda bir resmi App Store sayfalarından yeniden doğrulanmalı**. Bugün yeniden fiyat araştırması/değişikliği yapılmadı, fiyatlar tahmin edilmedi. İlk yayın sonrası yalnızca kısmi bir gün olduğundan sonuç ilan edilmedi.

## Karar ve doğrulama

Bugün yeni kod, deney, SEO üretimi, test/build veya yayın yok. 525 test ve üretim derlemesi 4 Kasım ölçüm düzeltmesine aittir; bugün yeniden çalıştırılmış gibi sunulmuyor. Genel lintteki mevcut 593 hata sürüyor. Yeni değişiklik yalnızca rapor/hafıza; kullanıcı deneyleri korundu. GA4 ilk signup_completed teslimi bugün okunarak doğrulandı; bu anlamlı durum değişikliği olarak bildirilecek.
