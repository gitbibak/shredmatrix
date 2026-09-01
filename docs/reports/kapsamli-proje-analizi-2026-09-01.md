# Full Balance Kapsamlı Proje Analizi

**Tarih:** 1 Eylül 2026
**Amaç:** Projeyi her boyutta ölçülebilir kontrollerden geçirmek, arama terimi araştırmasını uzun kuyruk ve soru düzeyinde tamamlamak, öncelik sırasını veriyle belirlemek.
**Yöntem:** Lighthouse mobil ölçümü (yerel build), test/lint/build, çeviri anahtar eşleştirmesi, bağımlılık kontrolü, iki ayrı web araştırması (rakip SERP, uzun kuyruk ve sorular). Supabase güvenlik/performans danışmanı raporuna bu ortamdan erişim yoktu; kurucunun Supabase panelinden çekmesi gerekiyor.

## 1. Skor kartı

| Alan | Ölçüm | Durum |
|---|---|---|
| Test | 183/183, 39 dosya | İyi |
| Lint | 0 hata | İyi |
| Statik SEO sayfaları | 63 sayfa, 67 sitemap URL | İyi |
| Çeviri anahtar eşleşmesi | tr/en/es 1.235 anahtar, eksik 0 | İyi |
| Bileşen içi dil ternary'si | 83 adet `lang === 'tr' ? … : …` (İspanyolca İngilizceye düşüyor) | Borç |
| Lighthouse mobil, ana sayfa | Perf 82, LCP 4,1 s, FCP 2,7 s (önce 70 / LCP 10,3 s) | Orta |
| Lighthouse mobil, ev programı sayfası | Perf 89, LCP 3,5 s, FCP 2,3 s (önce 69 / 4,7 s) | İyi |
| Erişilebilirlik | 93-95 | İyi |
| SEO / best practices | 100 / 100 | İyi |
| Bağımlılıklar | 14 paket güncel değil; framer-motion 12→13 majör | Bakım |
| Supabase advisors | Erişim yok | Kontrol edilmeli |
| Marka aranabilirliği | "fullbalance.app" bu oturumun arama motorunda sonuç yok | Kritik |

## 2. Bu oturumda uygulanan performans düzeltmeleri

- Tüm `public/images` ve `public/og` görsellerine WebP + 960 px varyant üretildi (`npm run images:optimize`, sharp). Ana sayfa toplam ağırlığı 2,8 MB → 870 KB.
- Ana sayfa görselleri `<picture>` ile WebP ve `sizes` kullanıyor ([OptimizedImage.jsx](../../src/components/OptimizedImage.jsx)).
- Google Fonts ağırlıkları 13'ten 10'a indirildi (Inter 300 ve 900 kaldırıldı).
- Plan motoru (220 KB) uygulama kabuğundan ayrıldı; yalnızca plan üretilirken dinamik yükleniyor ([App.jsx](../../src/App.jsx)). Sürüm karşılaştırması için küçük `planVersion.js` modülü eklendi.
- Rolldown çeviri ve veri erişim modüllerini plan verisiyle aynı pakete katlıyordu; bu yüzden açılış sayfası da 220 KB'lık veri paketini indiriyordu. `app-core` ve `app-meta` grupları eklendi; veri paketini artık yalnızca plan kullanan beş panel yüklüyor ([vite.config.js](../../vite.config.js)).
- Google Fonts artık ilk boyamayı bloklamıyor (`media="print"` + `/load-fonts.js` geçişi). FCP ana sayfada 4,4 s → 2,7 s.

Kalan LCP sorunu: ana sayfa hâlâ Supabase istemcisi ve Framer Motion'ı açılışta yüklüyor (toplam ~90 KB gzip). Statik sayfa içeriği JavaScript başlar başlamaz kaldırılıp React yeniden çiziyor; bu LCP'yi hidrasyona bağlıyor. Çözüm: açılış sayfasında hero'yu statik HTML'de bırakıp React'in yalnızca etkileşimli bölümleri devralması, Supabase oturum kontrolünü `requestIdleCallback` ile geciktirmek. Tahmini kazanım: LCP 5,7 s → 2,5-3 s.

## 3. Arama terimi araştırması: uzun kuyruk ve sorular

Hacim kaynağı yok (Ahrefs/Similarweb bağlantıları yetkisiz); talep kanıtı forum ve soru sitelerinden. Tam tablo ajan raporunda; burada karar verilebilir özet.

### Hemen hedeflenebilecek Türkçe uzun kuyruk
| Terim | Rakip | Sayfa |
|---|---|---|
| direnç bandı ile antrenman programı | Türkçe yerli sayfa yok; Technopat/DonanımHaber soruları var | YENİ `/direnc-bandi-antrenman-programi` |
| evde 30 günlük / 4 haftalık spor programı | firsat.me, MACFit | YENİ `/30-gunluk-evde-spor-programi` |
| kadınlar için evde spor programı, kilo verme | Korayspor, Play uygulamaları | YENİ `/kadinlar-icin-evde-spor-programi` |
| günlük kalori ihtiyacı / bazal metabolizma hesaplama | MACFit, Memorial (zayıf hesaplayıcılar) | YENİ `/gunluk-kalori-ihtiyaci-hesaplama` |
| fotoğrafla kalori hesaplama uygulaması ücretsiz | App Store, mikro girişimler | YENİ `/fotografla-kalori-hesaplama` |
| evde spor için dambıl yeterli mi, kaç kg dambıl almalıyım | Forum soruları | Dambıl sayfasına SSS |
| evde kas yapmak mümkün mü | Technopat, Ekşi | Kas geliştirme sayfasına kısa cevap |
| pilates mi yoga mı, reformer kilo verdirir mi | Stüdyo blogları | YENİ karşılaştırma + reformer SSS |
| uyku meditasyonu nasıl yapılır | YouTube, Ekşi | Meditasyon sayfasına uyku bölümü |

### İspanyolca
- İspanya "rutina, sin material, adelgazar, mancuernas"; Latin Amerika "ejercicios en casa, sin equipo, bajar de peso, pesas". Sayfalarda her iki söylem H2'lerde yer almalı.
- Açık alanlar: `calculadora de déficit calórico`, `calculadora TMB`, `rutina en casa mujeres principiantes`, `contar calorías con foto app gratis`, `rutina 4 semanas en casa`.

### İngilizce (küçük sitenin kazanabildiği)
- `beginner workout plan over 40 at home` (küçük bağımsız siteler sıralanıyor), `no equipment workout plan pdf free`, `3 day home workout plan printable`, `photo calorie counter free web` (tarayıcıda çalışan ücretsiz araç yok), `resistance band workout for beginners 4 week`.

### Sıralı yeni sayfa listesi
1. Fotoğrafla kalori (TR/ES/EN) — özellik hazır, rakip zayıf.
2. Günlük kalori ihtiyacı + bazal metabolizma (TR) ve déficit calórico + TMB (ES).
3. Direnç bandı programı (TR).
4. 30 günlük / 4 haftalık ev programı (TR); yazdırılabilir takvim.
5. Kadınlar için ev programı (TR/ES).
6. 40 yaş üstü başlangıç (EN).
7. Pilates mi yoga mı + uyku meditasyonu (TR).

### Mevsimsellik
- Türkiye: Ocak zirvesi (spor salonu aramaları +%20), Ağustos-Eylül ikinci zirve (ev egzersizi sorguları +%90-110). Mayıs-Haziran küçük üçüncü dalga.
- İspanya: 2-20 Ocak yıllık ortalamanın %65 üstü; Eylül ortası-Ekim ortası +%30-40.
- Takvim: hesaplayıcı ve 30 günlük program sayfaları Aralık başına kadar yayında olmalı; Ağustos sonunda yenilenmeli.

## 4. Ürün ve teknik borç listesi

1. **İspanyolca metin borcu.** 83 satır iki dilli ternary (ProfilePage, NutritionPanel, LandingPage, AuthScreen, DataExport, FounderPage). İspanyolca kullanıcı bu yerlerde İngilizce görüyor. Çözüm: bu metinleri translations.js'e taşımak; yaklaşık yarım günlük iş.
2. **Statik üreticide TR SSS eksikliği.** `scripts/seo-static-pages.mjs` yalnızca 5 sayfada SSS tanımlıyor; React sayfaları 21'inde var. Statik HTML'de "Kısa cevap" bloğu bu yüzden 16 sayfada yok.
3. **Ana sayfa LCP.** Yukarıdaki hidrasyon sorunu.
4. **Supabase advisors.** Bu ortamdan çekilemedi; önceki raporlarda `pg_net` public şema ve sızmış parola koruması uyarıları vardı, hâlâ geçerli kabul edilmeli.
5. **Bağımlılık güncellemeleri.** Küçük sürümler güvenle güncellenebilir; framer-motion 13 majör, ayrı test gerektirir.
6. **Bugün ekranının görsel doğrulaması.** Seri dondurma, saat seçimi ve davet kartı testlerle kapsandı ama giriş gerektirdiği için tarayıcıda doğrulanmadı.
7. **Google Play TWA yok.** Hedef aramalarda 1. sayfayı mağaza listeleri kaplıyor.

## 5. Önerilen sıra (sonraki 4 hafta)

1. Deploy (`npx wrangler deploy`) ve Search Console'da dizin/kapsam kontrolü; marka için "Full Balance fitness app" ifadesinin tüm dış profillerde kullanımı.
2. Fotoğrafla kalori sayfaları (3 dil) ve TR kalori/BMR hesaplayıcı sayfaları.
3. Ana sayfa hidrasyon düzeltmesi (LCP hedefi 2,5 s).
4. İspanyolca metin borcunun kapatılması.
5. Direnç bandı ve 30 günlük program sayfaları; yazdırılabilir PDF.
6. Google Play TWA; kapalı test için 12 kullanıcıyı davet sistemiyle toplamak.
7. Forum varlığı: Ekşi, DonanımHaber, Technopat, Forocoches'te haftada 3 gerçek cevap.

## 6. Kaynaklar (araştırma)
- Technopat: https://www.technopat.net/sosyal/konu/evde-spor-icin-dambil-yeterli-midir.4055355/ , https://www.technopat.net/sosyal/konu/direnc-bandi-evde-kas-kazanmak-icin-gerekli-mi.2789739/
- DonanımHaber: https://forum.donanimhaber.com/direnc-bandi-ile-evde-calisan-var-mi--142430974
- Ekşi: https://eksisozluk.com/fitnessa-gitmek-yerine-evde-ekipmansiz-calismak--6383638 , https://eksisozluk.com/evde-vucut-gelistirmek-isteyenlere-tavsiyeler--5369575
- Kızlar Soruyor: https://www.kizlarsoruyor.com/spor/q4425264-evde-spor-yaparak-kilo-vermek-mumkun-mu
- MACFit 4 haftalık program: https://www.macfit.com/blog/fitness/yeni-baslayanlar-icin-4-haftalik-fitness-programi
- Forocoches: https://forocoches.com/foro/showthread.php?t=8922363
- CalMind foto kalori: https://www.calmind.online/es/calorias-por-foto/mejor-app/
- Mevsimsellik TR: https://egirisim.com/2026/01/26/turkiyede-aralik-2025-ve-ocak-2026nin-ilk-10-gununde-kullanicilar-ne-aradi/ , https://www.marketingturkiye.com.tr/haberler/google-verilerine-gore-turkiye-sonbaharda-spora-donuyor/
- Mevsimsellik ES: https://ighenatt.es/recursos/seo-sectorial/seo-para-gimnasios-fitness/
- EN hacim listesi: https://www.seopital.co/blog/fitness-seo-keywords
