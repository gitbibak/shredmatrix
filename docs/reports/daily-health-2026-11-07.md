ACİL: 1 açık destek talebi

# Günlük denetim — 7 Kasım 2026

**7 Kasım 00:21 Europe/Istanbul**, kategori **Fikir (idea)**, konu “Fikir: Şuan herşey inanılmaz iyi eksik birşey yok”. Mesaj özeti: Kullanıcı uygulamadan memnun olduğunu ve eksik görmediğini belirtiyor. Hata bildirimi değil. Talep açık bırakıldı; kullanıcıya yanıt yazılmadı, talep kapatılmadı. Open/reviewing ve son 24 saat sorgusunda başka talep yok. Kişisel veri/e-posta raporlanmadı.

Çalışma ağacı kontrol edildi; public/llms.txt ve ilgisiz kullanıcı dosyaları korundu. W45 haftalık bölüm 3 Kasım'da tamamlandığından tekrar çalıştırılmadı.

## Kayıt, aktivasyon ve hedef

Europe/Istanbul tamamlanmış günler, admin profilleri hariç. Toplam stok **403 üye, hedefin %80,6'sı**. Stok devam eden günü içerebilir; dönemler içermez.

| Dönem | Yeni kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 6 Kasım | 1 | 1 | 1 |
| 4–6 Kasım | 12 | 12 | 10 |
| 31 Ekim–6 Kasım | 31 | 31 | 22 |

Son 2 gün 7 kayıt/7 planlı, ortalama 3,5; 3 gün ortalama 4. Haftalık EN+ES %71. Bir günlük 1 kayıt tek başına zorunlu deney eşiği değil; 2/3 günlük hedefler karşılanıyor. Mevcut plan stoku aynı gün aktivasyon değil; arayüz dili ülke veya ilk giriş dilinin kesin kanıtı değil.

## Canlı sağlık ve trafik

Ana sayfa, /en, /es, EN kayıt formu, oturumsuz /dashboard, sitemap.xml ve robots.txt tarayıcıda açıldı. Dashboard girişe döndü. Görünür beyaz ekran/kayıt engeli yok. Gerçek hesap/kayıt isteği oluşturulmadı; özel oturumlu uygulama uçtan uca test edilmedi.

GA4 **31 Ekim–6 Kasım: 93 oturum, 71 etkileşimli, %76,34 etkileşim**. Olaylar okuma sırasında 1.565'ten 1.570'e güncellendi; son okunan değer 1.570. Veri işleme/güncellik nedeniyle sabitlenmiş nihai sayı iddiası yok. Mülk saat dilimi ayrıca doğrulanmadı. Genel trafik admin/inceleme kullanımını içerebilir; Supabase admin hariç kapsamıyla bölünerek dönüşüm çıkarılmadı.

Önemli etkinlik filtresi özellikle **signup_completed** seçilerek **4 olay** görüldü: Direct 1, AI Assistant 3. Bunlar tüm gerçek kayıtların veya benzersiz yeni kişilerin sayısı değildir. Kaynak/izin kapsamı hâlâ sınırlı; genel kaynak sınıflandırmasının tamamı düzelmiş sayılmıyor. İlk okunan kanallar Unassigned 53, Direct 23, AI Assistant 11, Referral 8, Organic Search 4 idi; sonraki okumada Direct 25 oldu. Satır toplamları rapor genel toplamına zorla eşitlenmedi.

## Search Console sınırı

6 Kasım'da ayrıntılı sorgu tablosu açma adımı otomatik güvenlik incelemesinde reddedilmişti. Değişmeyen erişim hatası bugün tekrar zorlanmadı, başka araç/yüzeyle aşılmadı. **Bugün yeni GSC verisi alınmadı**; eksik veri sıfır trafik değildir.

Son doğrulanmış 6 Kasım okuması: **28 Ekim–3 Kasım, Web (metin), 36 tıklama / 1.083 gösterim / %3,3 CTR / konum 12,1**. Full balance 3/109, evde dambıl ile spor programı 1/10. Sayfalar dambıl 6/224, /en 6/142, tek dambıl blogu 6/55, Pilates 1/130. Bunlar tarihli referans, bugünkü yeni sonuç değil.

## Deney 1 — 20 Ekim içerikleri

Son tam yedi sorgu karşılaştırması 5 Kasım raporunda: 20 Ekim–2 Kasım 14 gün / 22 Eylül–19 Ekim 28 gün. Öne çıkan tarihli değerler 30 günlük Pilates 0/161 (%0, 8,6), 30 günlük dambıl 0/50 (%0, 5,8), evde Pilates ücretsiz 0/43 (%0, 7,5). Farklı sürelerin toplamları büyüme yüzdesi değil; bugün sorgu/konum güncellenmiş gibi sunulmadı. İki blogun arama performansı son doğrulanmış raporlarda mevcut; evde-kas-yapilir-mi son ayrı URL denetimi 3 Kasım'da indeksli. Bugün tekrar indeks isteği yok.

## Deney 2 — antrenman

Supabase admin ve admin olaylarına bağlanan anonim kimlikler hariç, 31 Ekim–6 Kasım:

- Started **32 olay/19 üye**; today_focus 17/12, workout_panel 15/9; kaynak grupları çakışabilir.
- Guided completed **5/5**, quick **1/1**. Birleşik 6 olay/5 benzersiz üye. Guided kullanıcı dönem oranı %26,3, olay oranı %15,6; kesin eşleştirilmiş seans dönüşümü değil.
- workout_completed source workout_session 5/5, workout_panel 1/1; workout_logs.date 6 kayıt/5 üye.
- 6 Kasım: started 2 olay/1 üye, today_focus; guided/quick tamamlanma, workout_completed ve workout_logs 0.

%30 altındaki oran için önceden gözlenen ilk set öncesi kapatma sinyali izleniyor. 1 Kasım açıklaması sonrası daha büyük örneklem/terk noktası kanıtı olmadan ikinci bir arayüz değişikliği yapılmadı. Son gün tek üyeden sebep çıkarılmaz. İlk sette ilerleme sürtünmesi bir adaydır, kanıtlanmış neden değil. Başlangıç 13–19 Ekim 1 / önceki 30 gün 37 workout_completed referansı ayrı tarihlidir.

## Deney 3 — start28 challenge

challengeId=start28: 6 Kasım challenge_viewed source=today **15/5 üye**; 7 gün **42/14**. challenge_landing görüntüleme ve challenge_joined/completed/shared 0. Üç challenge landing_path için son gün/7 gün kayıt 0. Kaynak alanı Challenge28Card içindeki davet bağlamını ayırır; kamu sayfası page_view ile aynı olay değildir.

GA4 tüm 20 sayfa satırı incelendi: /28-gunluk-challenge **3 görüntüleme/2 aktif kullanıcı**; EN/ES challenge yolları satırda yok (raporlanan 0). İzin/güncellik kapsamı gerçek ziyaretlerin tamamını temsil etmez. İlk açılış kayıt atfı sayfaya sonradan uğrayanları kapsamaz. Bugün yayın sonrası GSC ölçümü yok; **18 Kasım öncesi sayfalar değiştirilmiyor**. Katılım 0 küçük erken örneklem; kodda joined olayı ve şema kaydı mevcut, görünmeyen bir kullanım engeli kanıtlanmadı.

## Deney 4 — Pilates başlığı

4 Kasım başlık deneyinin yeni CTR/konumu bugün alınamadı. 7 Ekim–3 Kasım gerçek önceki 28 günlük taban, erişim engeli nedeniyle hâlâ tamamlanmış değil. Başlangıç referansı 153 gösterim/0 tık/8,6 konum bir 28 günlük taban gibi etiketlenmedi. Eski başlık penceresinin gösterimleri yeni başlık etkisi olarak kullanılmadı. **18 Kasım'dan önce yeniden değişiklik yok**.

## Deney 5 — fiyat karşılaştırması

GA4 31 Ekim–6 Kasım: /en/pricing **3 görüntüleme/2 aktif kullanıcı**, /fiyatlandirma **2/1**, /es/precios raporda yok (raporlanan 0). Genel sayfa raporu 20 satırın tamamı açıldı; izinli rapor kapsamındaki sayılar gerçek tüm ziyaretler değildir. Üç pricing landing_path için Supabase son gün/7 gün kayıt 0; ziyaret/kayıt birebir eşleştirilmedi. src/data/storePrices.js 4 Kasım tarihli; **4 Aralık'a kadar ve sonrasında ayda bir resmi App Store kaynaklarıyla yeniden doğrulanmalı**, tahminle fiyat değişikliği yapılmadı.

## Karar ve doğrulama

Hedefler karşılanıyor, yeni teknik hata kanıtı yok. Bugün kod/SEO/deney/yayın değişikliği yok. Yeni test/build çalıştırılmadı; 525 test ve üretim derlemesi 4 Kasım ölçüm düzeltmesine ait. Genel lintteki 593 mevcut hata düzeltilmiş gibi sunulmuyor. Yalnızca rapor/hafıza güncellendi. Bildirim nedeni yeni açık destek talebi; içerik olumlu ve hata bildirmiyor. Yanıtı sahibi admin panelinden verebilir.
