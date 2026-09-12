# Full Balance: 12 Eylül 2026 Denetimi ve Kullanıcı Deneyimi Güncellemesi

## Doğrulanmış toplu veriler

Pencereler Europe/Istanbul saat diliminde 12 Eylül 00:00'da biter. Devam eden gün hesaplara dahil edilmedi.

| Pencere | Yeni profil | Planı bulunan profil | Aktif görülen | Sonraki gün geri dönen |
|---|---:|---:|---:|---:|
| 11 Eylül | 1 | 1 | 6 | 5 |
| 9–11 Eylül | 15 | 15 | 19 | 6 |
| 5–11 Eylül | 44 | 41 | 51 | 14 |

- Toplam mevcut profil: 142/500 (%28,4). Bu sayı bağımsız doğrulanmış insan sayısı değildir.
- Son iki gün: 9 kayıt, günlük ortalama 4,5. Son üç gün: günlük ortalama 5.
- Son yedi gün dilleri: EN 28, ES 5, TR 11. EN+ES: 33/44 (%75). Dil, ülke/vatandaşlık değildir.
- Son yedi gün kaynakları: ChatGPT 31, Google 6, doğrudan 5, Instagram 1, Perplexity 1. Bunlar kayda bağlanan acquisition sinyalleridir; trafik paydası veya Search Console tıklaması değildir.
- En çok kayıt getiren ilk giriş: /en, 23 kayıt; /, 11 kayıt; /auth, 5 kayıt. Diğer girişler birer kayıt.
- Plan sayısı, kayıt kohortunun denetim anındaki durumudur; o gün gerçekleşmiş plan oluşturma olay sayısı değildir. Geri dönüş sütunu gözlenen kullanım dönüşüdür, D1/D7 kohort oranı değildir.
- Growth event akışı mevcut: 1925 olay; son sunucu alımı 12 Eylül 10:23:25 UTC. Sunucu zamanı kontrol edildi; beş dakikadan ileri istemci olay zamanı yok.

## Karar

11 Eylül tek başına düşük, ancak iki ve üç günlük eşikler ile EN+ES payı hedefte. Yeni büyüme deneyi uygulanmadı; mevcut kazanım sayfaları rastgele değiştirilmedi. Trafik paydası ve sorgu verileri olmadan tek günlük azalmanın nedenini Google sıralama kaybı olarak sunmak doğru olmaz.

Search Console/GA gösterim, tıklama, CTR ve sorgu-sayfa verileri bu koşuda doğrulanamadı. Etkileşimli tarayıcı aracı çalışma alanındaki sembolik bağlantı sandbox hatası nedeniyle açılmadı; mevcut özel sorgu erişimi de yok. Eksik veri sıfır sayılmadı. W37 haftalık metrik bölümü 8 Eylül'de tamamlandığından tekrar çalıştırılmadı; Search Console bölümü tamamlanmış kabul edilmedi.

## Tamamlanan Kullanıcı Talebi

### Gelişim fotoğrafları

- Profilde mevcut galeri kullanılarak iki fotoğrafın yan yana, tarihli karşılaştırması.
- Sabit oranlı, kırpmadan görüntüleme ve isteğe bağlı kadraj çizgileri; benzer ışık/mesafe/duruş için kısa çekim rehberi.
- Fotoğrafın eklendiği güne ait, kullanıcının kaydettiği kilo/yağ oranı ve çevre ölçüleri. Başka güne ait değer fotoğrafın ölçümü gibi sunulmaz.
- Fotoğraf çiftine özel paylaşım/indirme onayı. Fotoğraflar veya sağlık değerleri analytics'e gönderilmez. Çift değiştiğinde yeniden onay gerekir.
- Silme isteği başarısız olduğunda fotoğrafı silinmiş gibi gizleme davranışı kaldırıldı. Yerel fotoğraflar kimlikleriyle silinebilir.
- Fotoğraftan vücut yağı, hastalık veya kalori ihtiyacı çıkarımı eklenmedi; programlar değiştirilmez.

### Antrenman ve su hatırlatıcıları

- Bugün ve Profil ekranlarında ortak Hatırlatıcılar bölümü.
- Antrenman: saat/dakika ve haftanın günleri seçilebilir; eski dört sabit saat seçicisi kaldırıldı.
- Su: ayrı aç/kapat, gün seçimi ve en fazla sekiz farklı saat. Varsayılan kapalı.
- Mevcut aboneliklerin eski günlük saati korunur. Yeni ayarlar, mevcut kullanıcıya ait abonelik satırına kaydedilir.
- Cron beş dakikada bir kontrol eder; kısa gönderim penceresi, on dakikalık push TTL ve sunucuda benzersiz gönderim kaydı vardır. Eski hatırlatmalar gecikince toplu biçimde yeniden gönderilmez.
- Başarısız abonelik kaydı artık başarılı sayılmaz. iPhone paylaşımı için görsel onaydan sonra, paylaş düğmesine basılmadan önce hazırlanır.

## Doğrulama ve Yayın

- 51 test dosyası, 249 test geçti. Eski WorkoutPanel testinde çıkış animasyonu sırasında iki aynı metinli düğüm bulunması, hedef dialogu açıkça seçerek düzeltildi; antrenman davranışı değiştirilmedi.
- Lint ve projedeki typecheck komutu geçti. Typecheck kapsamı mevcut tsconfig.analytics.json kapsamıdır; tüm JSX için tam statik tip doğrulaması anlamına gelmez.
- Üretim derlemesi başarılı; 82 statik SEO sayfası ve 85 sitemap URL'si doğrulandı.
- Playwright/Chrome: 320, 390 ve 1280 pikselde taşma ve JS hatası yok. Test verileriyle saat kaydı, su opt-in, ayrı fotoğraf onayı ve görsel indirme çalıştı. Görsel dosyaları output/photo-comparison-* ve output/reminder-photo-* altında.
- Canlı ana sayfa, /en, /es, /auth, sitemap, robots ve kritik kamu sayfaları 200. Yetkisiz /dashboard, /auth'a yönlendi. Gerçek yeni hesap oluşturulmadı.
- Migration: 20260911165320_flexible_reminder_schedule.sql canlıya uygulandı. Eski alanlar/veriler korunur; reminder_settings ve sunucuya özel push_deliveries eklendi.
- RLS açık; anon okuma ve authenticated yazma yetkisi yok. Geçici tablo/rollback testi benzersiz anahtarın aynı gönderimi iki kere eklemeyi engellediğini doğruladı.
- send-push Edge Function sürüm 12 ACTIVE. Yetkisiz POST 401 döndürüyor. Cron işinin HTTP kuyruğuna çağrı oluşturması başarılı görüldü; bu tek başına telefon teslim kanıtı değildir.
- Cloudflare sürümü: 2f79b5aa-1995-4ab1-8595-ad9a227363f0. Canlı HTML yeni paket kimliğini içeriyor; ProfilePage, ReminderSettings ve TodayFocusPanel dosyaları 200.

## Sınırlar ve Riskler

Gerçek iPhone'a zamanlanmış su bildirimi teslimi veya iOS yerel paylaşım paneli fiziksel cihazda doğrulanmadı. İşletim sistemi izni, ana ekrana kurulum ve bağlantı teslimi etkiler. Push sistemi tam zamanında veya mutlak tek teslim garantisi vermez; sağlayıcı kabulü ile cihazın gösterimi farklıdır.

Yeni push_deliveries tablosunda istemci policy'si olmaması bilinçli kapalı erişim tasarımıdır; yalnızca service_role kullanır. [Supabase RLS bilgi bildirimi](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Denetimde mevcut üç güvenlik uyarısı değişmeden kaldı: pg_net public şemada, authenticated çağrılabilen get_referral_summary SECURITY DEFINER fonksiyonu ve kapalı sızmış parola kontrolü. Bu sürüm bunları oluşturmadı; sıfır risk iddiası yok. [Uzantı uyarısı](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [fonksiyon yetkisi incelemesi](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [parola koruması](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Geri dönüş: önce eski Edge Function ve saatlik cron geri alınabilir. Additive sütun ve tabloyu bırakmak mevcut kullanıcı tercihlerini silmeden uygulama kodunu geri alma imkânı verir.
