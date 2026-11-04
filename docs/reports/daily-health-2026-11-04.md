Destek: açık talep yok

# Günlük denetim ve kayıt ölçümü düzeltmesi — 4 Kasım 2026

Çalışma ağacı kontrol edildi; kullanıcı public/llms.txt değişikliği ve ilgisiz dosyalar korundu. Open/reviewing ve son 24 saat destek sorgusu boş; yanıt/kapatma yok. W45 haftalık denetimi 3 Kasım'da tamamlandı ve otomasyon hafızasında kayıtlı; tekrar çalıştırılmadı.

## Hedef ve aktivasyon

Europe/Istanbul tamamlanmış günler, adminler hariç. Toplam stok **391 üye, 500 hedefinin %78,2'si**. Stok devam eden gün üyelerini içerebilir; aşağıdaki pencereler içermez.

| Dönem | Yeni kayıt | Şu anda planı olan yeni üye | EN+ES | plan_generated olay | Kimliği bağlı aktif üye |
|---|---:|---:|---:|---:|---:|
| 3 Kasım | 4 | 4 | 3 | 4 | 5 |
| 1–3 Kasım | 11 | 11 | 7 | 12 | 18 |
| 28 Ekim–3 Kasım | 32 | 31 | 22 | 34 | 39 |

Son 2 gün 8 kayıt/8 planlı, ortalama 4; 3 gün ortalama 3,67. Haftalık EN+ES %68,75. Kayıt ve dil hedefleri karşılanıyor. Planı bulunma mevcut stok, aynı gün aktivasyon değil; olay ve aktif üye kayıt kohortuyla aynı kapsam değil. Arayüz dili ülke veya ilk geliş dilinin kesin kanıtı değil.

## Canlı sağlık ve trafik

Ana sayfa, /en, /es, EN kayıt formu, oturumsuz /dashboard, sitemap.xml ve robots.txt tarayıcıda açıldı. Dashboard girişe dönüyor, görünür beyaz ekran/kayıt engeli saptanmadı. Gerçek hesap oluşturulmadı, oturumlu özel uygulama uçtan uca test edilmedi. Kamu sayfalarının robot izinleri açık.

GSC en son tamamlanmış pencere **26 Ekim–1 Kasım: 34 tıklama / 1.026 gösterim / %3,3 CTR / konum 10,7**. Devam eden ve gecikmeli günler tam sayılmadı. Bu pencere önceki 25–31 Ekim ile örtüşür; bağımsız hafta düşüşü çıkarılmadı. Sorgular full balance 2/109, evde dambıl ile spor programı 1/14. Sayfalar: dambıl 8/257, /en 4/107, tek dambıl blogu 4/52, kadınlar için evde spor 3/80, 30 günlük evde spor 2/37, Pilates 1/123, direnç bandı–dambıl blogu 1/63. Değerler tıklama/gösterim.

GA4 **28 Ekim–3 Kasım: 56 oturum, 43 etkileşimli, 966 olay, %76,79 etkileşim**. Unassigned 35 (%62,5), AI Assistant 9, Direct 8, Organic Search 3, Referral 1. Önemli faaliyet 0 gerçek kayıt yok demek değil. Mülk saat dilimi ayrıca doğrulanmadı; GSC/Supabase ile bölünüp dönüşüm oranı çıkarılmadı. 2 Kasım signup_completed önemli etkinlik tanımı mevcut, fakat gerçek izinli kayıt sinyali hâlâ doğrulanmamıştı.

## Ölçüm kopmasının doğrulanan nedeni ve dar düzeltme

Kod incelemesinde App.jsx yalnızca kullanıcı + plan + dashboard + tur kapalı iken AnalyticsConsent açıyor; mevcut bileşen ayrıca 12 saniye bekliyordu. Bu, ilk ziyaretçinin kayıt tamamlanmadan izin seçememesi anlamına geliyor. GA göndericisi izin öncesi olayları doğru şekilde düşürüyor ve geriye dönük göndermiyor. Dolayısıyla ilk ziyaret kaydı, kullanıcı daha sonra izin verse bile GA'da ölçülemiyordu. Bu, gözlenen sıfırın tek olası nedeni değildir; somut bir sıralama hatasıdır.

Mevcut isteğe bağlı izin seçimi AuthScreen'de kayıt formundan önce **sayfa akışı içinde** sunuldu. AnalyticsConsent'e inline yerleşim eklendi; dashboard geri dönüşü ve public landing davranışı korundu. Varsayılan ret/kararsız durumda GA kapalı; kayıt butonu izin seçimine bağlı değil, iki seçim de erişilebilir. Önceki olaylar yeniden gönderilmiyor. Sağlık/hesap verisi ve ölçüm kapsamı genişletilmedi; auth, şema, RLS veya hesap oluşturma davranışı değiştirilmedi. Bu bir ölçüm hatası düzeltmesidir; yeni büyüme deneyi değildir.

Ayrı sınırlama: mevcut Google OAuth tamamlama olayının kayıt/giriş sınıflaması gerçek yeni hesap kontrolünden ziyade seçilen UI moduna dayanıyor. Bugün bu akış değiştirilmedi; GA'nın kanonik üye sayısı olmadığı açık tutuluyor. Gerçek üyelik sayısı anonim Supabase toplu sorgudan gelir. İlk gerçek izinli olay/DebugView doğrulaması hâlâ gerekir; yapılandırma veya mock test canlı teslim kanıtı değildir.

## Deney 1 — 30 günlük içerik

Önceki 22 Eylül–19 Ekim 28 gün / sonraki 20 Ekim–1 Kasım 13 gün. Farklı sürelerin ham toplamları büyüme oranı değildir. 9 Eylül–6 Ekim başlangıç referansı ayrı dönem olarak korunuyor.

| Sorgu | Önce tık/gösterim; CTR; konum | Sonra tık/gösterim; CTR; konum |
|---|---|---|
| 30 günlük dambıl programı | 2/80; %2,5; 6,1 | 0/46; %0; 5,7 |
| dambıl çalışma programı | 0/31; %0; 9,3 | 0/7; %0; 14,1 |
| dambıl antrenman programı | 0/22; %0; 8,0 | 0/5; %0; 7,4 |
| evde dambıl ile spor programı | 2/37; %5,4; 8,2 | 1/23; %4,3; 8,2 |
| evde dumbell ile vücut geliştirme programı | 2/55; %3,6; 8,9 | 1/9; %11,1; 8,4 |
| evde pilates programı ücretsiz | 0/70; %0; 8,3 | 0/38; %0; 7,5 |
| 30 günlük pilates programı | 0/43; %0; 8,7 | 0/153; %0; 8,6 |

Pilates sorgusunun tıklama verimi zayıf; gelecekte dar CTR deneyi adayı. Bugün kayıt hedefleri karşılandığı ve ölçüm düzeltmesi öncelikli olduğu için içerik değiştirilmedi. İki yeni blog güncel arama gösterim/tıklamalarında mevcut. Üçüncü evde-kas-yapilir-mi için 3 Kasım ayrı URL denetimi indeksli; bugün gereksiz tekrar istek yapılmadı.

## Deney 2 — antrenman

Son 7 gün 33 started olay/17 üye; kaynak today_focus 17/14 üye, workout_panel 16/7 üye (üyeler çakışabilir). Guided completed 7/6 üye, quick 1/1. Guided dönem kullanıcı oranı 6/17=%35,3, olay oranı 7/33=%21,2; kesin eşleştirilmiş seans oranı değildir. workout_completed kaynak workout_session 7/6 üye, workout_panel 1/1; workout_logs.date kaydı olan 6 üye. 3 günde started 13/7 üye, guided completed 1/1; son gün 4/2, guided 1/1. Olay ve kullanıcı paydaları ayrıdır.

Açık kapatma none 7/5 üye, 50_74 1/1; save_failed olayı yok. Kapatma kalıcı terk değildir. 1 Kasım ilk set açıklamasının yayınından sonra yalnızca 2 ve 3 Kasım tam günleri var; 1 Kasım yayın öncesi saatler de içeriyor. Bu nedenle henüz üç tam gün olmadan açıklama yeniden değiştirilmedi. Oranın yükselişi açıklamanın neden olduğu bir başarı olarak sunulmuyor. Başlangıç 13–19 Ekim 1 workout_completed, önceki 30 gün 37 olay referansı korunuyor.

## Test, yayın ve canlı doğrulama

- Yeni altı entegrasyon vakası: izin kayıt isteğinden önce erişilebilir; kararsız/ret halinde kayıt başarılı ve GA gönderimi yok; önceki karar tekrar sorulmuyor; önceden izin verilirse başarılı e-posta kaydı bir kez GA kuyruğuna yazılıyor.
- İlgili 26 test, tür denetimi, değişen dosya lint'i ve diff kontrolü geçti. **Tüm paket 73 dosya / 525 test geçti.** Genel lint mevcut 593 hatayla başarısız; bunlar çözülmüş veya yeni değişiklikten doğmuş gibi sunulmuyor.
- Üretim derlemesi geçti: 97 statik sayfa üretildi, 93 SEO sayfası ve 103 sitemap URL doğrulandı. Kullanıcı public/llms.txt dosyası korundu; yayın paketinde ilgisiz yerel değişiklik yerine HEAD dosyası kullanıldı.
- 390px yerel mobil kontrolde seçim formun üstüne binmiyor; reddettikten sonra kayıt alanları/CTA açık. Kanıt output/auth-consent-mobile-2026-11-04.png. Yerel geliştirme taraması ilgisiz marketing/three bağımlılıkları için uyarı verdi; uygulama önizlemesi ve üretim derlemesi çalıştı, yeni paket kurulmadı.
- Cloudflare **eda49124-f503-4f2e-96b1-374d3d1ea6aa**, fullbalance.app/* yayını başarılı. Canlı /auth yeni `/assets/index-CYF0SaEi.js` ve `/assets/index-Dc3prv3T.css` dosyalarıyla açıldı; bunlar derlenen paketle eşleşiyor. Mevcut tarayıcıdaki daha önce verilmiş karar tekrar sorulmadı; canlı form alanları göründü. Kanıt output/auth-live-2026-11-04.png. Üretimde yeni hesap açma ve gerçek Analytics teslimi test edilmedi.

Yeni SEO deneyi/sayfa, ücretli reklam, hesap, paylaşım veya indeksleme isteği yok. Yalnızca izin zamanlaması ölçüm düzeltmesi yayınlandı.
