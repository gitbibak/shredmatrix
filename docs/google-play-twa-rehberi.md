# Full Balance için Google Play (TWA) Yayın Rehberi

**Neden:** "home workout no equipment", "evde dambıl antrenman programı" ve "rutina en casa sin equipo" aramalarında 1. sayfayı mağaza listeleri kaplıyor. PWA'yı Trusted Web Activity olarak Play'e koymak, aynı web uygulamasını mağaza sonuçlarına ve Google App kampanyalarına taşır. Kod değişikliği gerektirmez; uygulama fullbalance.app'ten çalışmaya devam eder.

**Kimin yapması gerekiyor:** Google Play geliştirici hesabı, ödeme ve imza anahtarı kurucuya ait olmalı; bu adımlar yazılımla otomatik yapılamaz.

## Ön koşullar (tamamlandı)
- PWA manifesti ve service worker canlıda (`/manifest.json`, `/sw.js`).
- Lighthouse PWA gereksinimleri: HTTPS, ikonlar (192 ve 512), `display: standalone`, `start_url`.
- Mobil performans skoru 80 üstü (Play'in TWA için önerdiği eşik).

## Adımlar

1. **Geliştirici hesabı.** https://play.google.com/console adresinden 25 $ tek seferlik ücretle hesap aç. Kişisel hesapta 13 Kasım 2023 sonrası kural: yayın öncesi **12 test kullanıcısıyla 14 gün kapalı test** zorunlu. Test kullanıcılarını uygulamadaki davet sistemiyle toplayabilirsin (Profil → Davet linki).

2. **Projeyi üret.** Bubblewrap ile (Node gerektirir, bu repoda çalıştırılabilir):
   ```bash
   npx @bubblewrap/cli init --manifest https://fullbalance.app/manifest.json
   ```
   Sorulara önerilen cevaplar: Application ID `app.fullbalance.twa`, ad "Full Balance", başlangıç URL `/`, tema rengi `#ff6d00`, arka plan `#020617`, durum çubuğu koyu. Bubblewrap Android SDK ve JDK'yı kendisi indirir; ilk çalıştırma 10-15 dakika sürer.

3. **İmza anahtarı.** Bubblewrap `android.keystore` oluşturur. Bu dosya ve şifresi yedeklenmeli; kaybolursa güncelleme yayınlanamaz. Anahtarın SHA-256 parmak izini yazdır:
   ```bash
   keytool -list -v -keystore android.keystore -alias android | grep SHA256
   ```

4. **Digital Asset Links.** `public/.well-known/assetlinks.json` dosyasını oluştur (parmak izini yerine koy) ve deploy et:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": { "namespace": "android_app", "package_name": "app.fullbalance.twa",
       "sha256_cert_fingerprints": ["AA:BB:..."] }
   }]
   ```
   Doğrulama: https://fullbalance.app/.well-known/assetlinks.json adresi 200 dönmeli. Bu dosya olmadan uygulama tarayıcı çubuğuyla açılır.

5. **Derle.**
   ```bash
   npx @bubblewrap/cli build
   ```
   Çıktı: `app-release-bundle.aab`. Play Console'da yeni uygulama oluştur, "Kapalı test" kanalına yükle.

6. **Play Console formları.**
   - Uygulama içeriği → **Sağlık uygulamaları beyanı**: "Fitness ve wellness" kategorisi, tıbbi cihaz değil.
   - Gizlilik politikası URL'si: https://fullbalance.app/privacy
   - Veri güvenliği: e-posta, sağlık ve fitness verisi toplanıyor; şifreli aktarım; kullanıcı veri silme isteyebilir (uygulamada hesap silme var).
   - Hedef kitle: 18+ (kilo verme içeriği nedeniyle Meta/Google reklam politikalarıyla uyumlu).
   - Mağaza metni: `marketing/ads-creative-kit-2026-09.md` içindeki başlıklar kullanılabilir; ekran görüntüleri için `output/marketing-kit/assets` klasörü.

7. **Kapalı test.** 12 kullanıcıyı e-posta listesiyle ekle, 14 gün bekle; kullanıcıların uygulamayı gerçekten açması gerekiyor (Google aktif kullanım kontrolü yapıyor). Süre dolunca "Üretime geçiş" başvurusu.

8. **Yayın sonrası.** Search Console'a Play listesini bağlamak gerekmez; ancak Organization şemasındaki `sameAs` listesine Play URL'si eklenmeli (`scripts/generate-static-seo.mjs`, founder ve ana sayfa şemaları). Uygulama içi "Uygulamayı yükle" istemi Android'de Play listesine yönlendirilebilir.

## Apple tarafı
App Store, salt web sarmalayıcı uygulamaları reddediyor (Yönerge 4.2). Capacitor ile yerel push, çevrimdışı ve HealthKit gibi özellikler eklenmeden başvurulmamalı. Şimdilik iOS'ta "Ana ekrana ekle" akışı kullanılıyor.
