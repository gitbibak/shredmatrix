# Full Balance günlük denetim — 11 Ekim 2026

Europe/Istanbul tamamlanmış günler: 10 Ekim; 8–10 Ekim; 4–10 Ekim. Admin dışı anonim toplu ölçüm.

| Dönem | Yeni kayıt | Bu kayıtların mevcut planı | EN / TR / ES |
|---|---:|---:|---|
| 10 Ekim | 2 | 2 | 2 / 0 / 0 |
| 8–10 Ekim | 8 | 7 | 7 / 1 / 0 |
| 4–10 Ekim | 27 | 25 | 23 / 4 / 0 |

Toplam 291 kullanıcı, 500 hedefinin %58,2'si; 263 mevcut plan. Son iki gün ortalama 1,5; üç gün 2,67. EN+ES payı %85,2. Plan sayıları mevcut durumdur, aynı gün aktivasyon oranı değildir.

Growth events: 1/3/7 gün aktif kullanıcı 3/15/42; gözlenen geri dönen 1/7/14; signup_completed 2/7/26; plan_generated 2/10/33; meal_photo_analyzed 1/1/6. Son üç günde auth error yok; yedi günde dört signup_error ve bir login_error, hepsi auth_rejected. Bu neden tek başına servis arızasını kanıtlamaz. Geri dönüş gözlemleri D1/D7 kohortu değildir. Growth ölçümü kimlik belirlenene kadar sınırlı yerel kuyruk kullanır, tüm ziyaretçi sayısını vermez.

Son yedi gün kayıt kaynak sinyalleri: chatgpt.com 19, direct 4, google 4. Açılış: /en 12, /en/photo-calorie-counter 6, / 4, diğer beş URL birer kayıt. first_source/first_landing_page, yoksa acquisition_source/landing_path kullanıldı; geçmiş OAuth kaynak hatası eski kayıtları etkileyebilir.

Search Console en son tamamlanmış veri 2–8 Ekim: 819 gösterim, 41 tıklama, %5 CTR, konum 14,6; son güncelleme 61 saat gecikmeli. Önde /en 11/141, /evde-dambil-antrenmani 10/211; sorgu fullbalance 5/97, evde dumbell ile vücut geliştirme programı 2/21. Bu dönem 10 Ekim gibi yorumlanmadı.

GA4 4–10 Ekim: 22 görüntüleme, 13 aktif kullanıcı, 142 olay, 0 önemli faaliyet. İzinli örneklem; özellik saat dilimi doğrulanmadı, Supabase ile birebir dönüşüm oranı çıkarılmadı. GA önemli faaliyet 0 değeri sıfır gerçek kayıt anlamına gelmez.

Canlı /, /en, /es, register formu, /dashboard giriş yönlendirmesi, sitemap ve robots kontrol edildi. Yeni hesap açılmadı, oturumlu uygulama içi işlem yapılmadı. Kamu sayfalarında beyaz ekran veya genel indeksleme engeli bulunmadı.

Hunide öncelik yeni kullanıcı kazanımıdır; mevcut kayıtların plan bulunma oranı yüksek. Doğrulanmış teknik kusur: ana sayfanın EN/ES rehber kartları çevrilmiş başlıklarla TR makaleye yönlendiriyordu. Tek dar düzeltme: gerçek dilde makale kartları, yerel blog dizini ve yerel yardımcı rehber bağlantıları. Yeni altı makalenin yayını birkaç saatlik olduğu için yeni içerik/başlık deneyi yapılmadı. Bu değişiklik yeni hipotez yerine mevcut dil yolculuğundaki hatayı giderir. Başarı ölçümü: EN/ES kök ana sayfa rehber linklerinde TR hedef sıfır; ardından en az üç tamamlanmış gün kayıt ve kaynak karşılaştırması.

Doğrulama: 66 test dosyası / 418 test geçti; ilgili ESLint ve diff-check temiz; üretim derlemesi geçti, 90 statik SEO sayfası ve 100 sitemap URL doğrulandı. Genel lint 591 önceden mevcut hata nedeniyle başarısız. Kullanıcı public/llms.txt değişikliği korunarak SEO üretildi; dağıtıma üretilmiş llms çıktısı kondu. Haftalık ISO 2026-W41 denetimi hafızada tamamlanmış olduğundan tekrarlanmadı. IndexNow aynı URL için tekrar gönderilmedi.
