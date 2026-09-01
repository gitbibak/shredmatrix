# Full Balance Reklam ve Arama Görünürlüğü Planı

**Tarih:** 1 Eylül 2026
**Kapsam:** Mevcut pazarlama materyalinin denetimi, hedef aramalarda rakip analizi, ücretli ve ücretsiz kanal maliyetleri, 90 günlük bütçe senaryoları ve bu oturumda uygulanan sayfa iyileştirmeleri.
**Kaynak notu:** Arama sonuçları ABD konumlu motorla toplandı; Türkiye ve İspanya'daki gerçek sıralama küçük farklar gösterebilir. Hacim ve maliyet rakamları tedarikçi kaynaklıdır, yönlendirici kabul edilmelidir.

## 1. Şu anki durum: dürüst teşhis

1. **Marka aramasında görünmüyoruz.** "fullbalance.app" ve "Full Balance fitness app" sorguları bu oturumda kullanılan arama motorunda hiç sonuç vermedi; "fullbalance" adı Tokyo'daki bir Shopify ajansı ve onlarca "Balance" uygulamasıyla çakışıyor. Google Search Console'da "Sayfa dizine eklendi mi" raporu ilk kontrol edilecek şey olmalı. Marka çakışması, dizine girdikten sonra bile marka aramasını gürültülü tutacak.
2. **Sayfalar ince kalıyordu.** Hedef aramalarda 1. sayfaya çıkan içeriklerin ortak özellikleri: 4 haftalık/30 günlük tablo, hareket başına görsel veya GIF, yazar unvanı, SSS, indirilebilir PDF ve hesaplayıcı çapraz bağlantıları. Bizim sayfalarımızda üç kısa bölüm ve üç SSS vardı.
3. **Uluslararası kullanıcılar Türkçe egzersiz adı görüyordu.** Ev programlarının egzersiz ve gün adları İngilizce/İspanyolca planlarda çevrilmiyordu. Bu, İngilizce edinim çabasını baştan zayıflatan bir üründü hatası; bu oturumda düzeltildi.
4. **Mevcut pazarlama kiti** (`marketing/` klasörü): 30 günlük içerik takvimi, 30 rehber briefi, Pinterest pano planı, hazır video ve pin görselleri, UTM disiplini. Eksik olan: aramaya göre önceliklendirme, ücretli kanal testi, forum varlığı ve dizin kayıtları. Takvim "her modüle eşit ağırlık" veriyor; oysa aramanın açık olduğu yer ev antrenmanı.

## 2. Bu oturumda yapılanlar

- Ev antrenmanı sayfalarına (TR/EN/ES, 9 sayfa) uygulamanın plan motorundan üretilen **gerçek başlangıç haftası tablosu** eklendi: gün, odak, egzersiz, set, tekrar, dinlenme ve ilerleme kuralı. Statik HTML'de de var, yani arama motoru ve yapay zeka botları JavaScript çalıştırmadan görüyor. Üretim komutu: `npm run seo:samples`.
- Ev programı egzersiz adları, gün odakları ve tekrar birimleri İngilizce ve İspanyolcaya çevrildi; test bu metinlerde Türkçe kalmasını engelliyor.
- Reklam metin kiti hazırlandı: `marketing/ads-creative-kit-2026-09.md` (Google Ads başlık/açıklama TR-ES-EN, Meta Reels kancaları, organik video konuları, uyumluluk listesi).

## 3. Hangi aramalar kazanılabilir

| Sorgu | Rakipler | Karar |
|---|---|---|
| kalori hesaplama (TR, ~74 bin/ay) | Memorial, MACFit, diyetkolik | Şimdilik kazanılamaz; uzun kuyruk: "fotoğrafla kalori hesaplama", "bazal metabolizma hesaplama" |
| bmi hesaplama (TR) | Çok sayıda küçük diyetisyen sitesi | Uzun kuyruk açık: "bmi hesaplama kadın", "ideal kilo ve bmi" |
| evde dambıl antrenman programı (TR) | Forum, makine çevirisi, supplement blogu | **3-6 ayda kazanılabilir**, en zayıf SERP |
| evde ekipmansız antrenman (TR) | Küçük PT siteleri | **Kazanılabilir** |
| başlangıç pilates programı (TR) | Stüdyo blogları | Kazanılabilir |
| evde spor programı (TR) | LCW, MACFit, Decathlon, Tamindir | Zor; "evde spor programı pdf", "30 günlük ekipmansız program" ile gir |
| ücretsiz fitness uygulaması (TR) | Red Bull, Tamindir, App Store | Zor; Tamindir/Webtekno listelerine dahil olmak daha etkili |
| rutina en casa sin equipo (ES) | entrenoapp, kruxfit gibi küçük app siteleri 1. sayfada | **Kazanılabilir**; küçük siteler kazanabiliyor |
| app de entrenamiento gratis (ES) | Xataka, workoutgen.app | Kazanılabilir |
| home workout no equipment (EN) | Play Store, Healthline, Darebee | Şimdilik kazanılamaz; "3 day beginner home workout plan no equipment pdf" gibi varyantlar |
| free calorie calculator photo (EN) | Yeni yapay zeka araçları, otorite yok | **Açık alan**; fotoğraf aracımız buraya uygun |

Sağlık sorgularının yaklaşık %80'inde yapay zeka özeti çıkıyor ve organik tıklama %60 düşüyor. Bu yüzden hedef yalnızca sıralama değil, özet içinde alıntılanmak: sayfadaki "Kısa cevap" blokları ve örnek hafta tabloları bunun için var.

## 4. Ücretsiz kanallar: nerede olunmalı

1. **Google Play (TWA).** "home workout no equipment", "evde dambıl" ve "rutina en casa" sorgularında 1. sayfayı mağaza listeleri kaplıyor. PWA'yı Bubblewrap/PWABuilder ile Play'e koymak 25 dolar ve yaklaşık bir hafta iş; sağlık uygulaması beyanı, gizlilik politikası ve "tıbbi cihaz değildir" notu gerekiyor. Kişisel geliştirici hesabı için 12 test kullanıcısıyla 14 gün kapalı test şartı var. Apple tarafı web sarmalayıcıyı reddediyor; ertelenmeli.
2. **Türk forumları.** Ekşi "evde spor yapmak" (145+ sayfa), "fitness uygulaması"; DonanımHaber ve Technopat "evde antrenman programı" başlıkları dambıl aramasında 1. sayfada. Gerçek cevap ver, örnek hafta tablosunu paylaş, link yalnızca ilgili sayfaya.
3. **Kızlar Soruyor.** "Evde spor için YouTube kanalı önerir misiniz" tarzı sorular; cevap + kanal önerisi + araç linki.
4. **TikTok/Reels/Shorts.** Türkiye'de 45 milyon yetişkin TikTok kullanıcısı, fitness görüntülenmesi yıllık +%146. Haftada 4 kısa video, aynı gün üç platforma; konu havuzu reklam kitinde. Kızlar Soruyor'daki kanal talebi, Shorts'ta "evde 10 dakika" serisinin karşılık bulacağını gösteriyor.
5. **Reddit.** r/bodyweightfitness (3M+), r/homegym (1M+); %90 yardım, %10 ürün kuralı ve açık beyan.
6. **Pinterest.** Yazdırılabilir haftalık plan görselleri; trafik 3-6 ayda gelir. Mevcut pin planı sürdürülmeli, ancak ev antrenmanı pinleri öne alınmalı.
7. **AlternativeTo.** Ücretsiz, 1-2 günde onay; "Nike Training Club, Fitify alternatifi" olarak kayıt. Product Hunt düşük öncelik (ilk 10 dışında 500'den az ziyaret).
8. **Türkçe uygulama listeleri.** Tamindir, Webtekno, Technotoday "evde spor uygulamaları" listelerine e-posta ile başvuru; "ücretsiz fitness uygulaması" aramasını bu listeler kazanıyor.

## 5. Ücretli kanallar: maliyet ve karar

| Kanal | Maliyet (tedarikçi verisi) | Karar |
|---|---|---|
| Google Ads Arama TR | Ortalama CPC ~0,65 $; fitness için 5-15 TL beklenir | **Başla.** Yeni hesap kredisi: 8.000 TL harcamaya +8.000 TL |
| Google Ads Arama ES | Güncel İspanya fitness CPC verisi yok; Keyword Planner ile ölç | Başla, düşük bütçe |
| Google Ads Arama US/UK | Sağlık-fitness CPC ~6 $, CPL ~67 $ | D7 ≥ %15 olmadan başlama |
| Performance Max | Ayda 30+ dönüşüm ve 3.000 $+ ister | Kullanma |
| Meta Reels TR/ES | TR CPM 2-3,5 $, ES CPM ~5,8 $; ABD 23 $ | 2. aydan itibaren küçük test; Advantage+ kapalı |
| TikTok Spark | CPM 4-8 $, günlük 50 $ taban | 1.000 $ senaryosunda, en iyi organik videoya |
| Pinterest | CPC 0,5-1,5 $ | Organik yeterli |
| Nano influencer TR | Story 500-2.000 TL, Reels 2.000-5.000 TL | Ayda 2-3 kişi, ürünü gerçekten kullananlardan |
| Nano influencer ES | 85-150 € / gönderi | Ayda 2 kişi |

Uyumluluk: kilo kaybı hassas kategori; Google'da yeniden pazarlama ve benzer kitle yasak, Meta'da öncesi/sonrası ve "senin gibi" iması yasak, 18+ hedefleme zorunlu. Sağlık alanı olduğu için Meta piksel "Core Setup" kısıtına giriyor; kilo, BMI, hedef parametresi asla gönderilmemeli; piksel yalnızca çerez onayından sonra çalışmalı (KVKK ve GDPR; İsveç'te onaysız Meta pikseline 15 milyon € ceza kesildi).

## 6. 90 günlük plan: üç bütçe senaryosu

### 0 TL
- Hafta 1: Search Console dizin kontrolü, AlternativeTo kaydı, Tamindir/Webtekno başvurusu, Ekşi ve DonanımHaber'de 3 gerçek cevap.
- Hafta 2-4: Haftada 4 kısa video (TR ağırlıklı, 1 ES), Pinterest'te örnek hafta görselleri, Reddit'te haftada 2 cevap.
- Hafta 5-8: Google Play TWA yayını, kapalı test için 12 kullanıcıyı davet sistemiyle topla.
- Hafta 9-12: "evde dambıl 4 haftalık program" ve "rutina en casa sin equipo 4 semanas" için iki derin rehber; PDF indirme.
- Ölçüm: haftalık kayıt, plan, ilk antrenman, D7; Search Console'da 3 hedef sorgu için gösterim ve konum.

### 300 $/ay
- Yukarıdakiler + Google Ads TR arama (150 TL/gün) ve ES arama (6 €/gün). Yeni hesap kredisi ilk ay öne çekilir.
- Beklenen kayıt maliyeti: TR/ES 0,5-2 $. 100 tıklama dolmadan karar yok.

### 1.000 $/ay
- %45 Google Arama (TR/ES, D7 kanıtı sonrası US), %30 Meta Reels manuel (TR/ES), %15 TikTok Spark (ayda ~10 gün), %10 nano influencer.
- Beklenen kayıt maliyeti: TR/ES 0,75-3 $, US/UK 4-12 $.

Kanal kapatma kuralı: plan oluşturma oranı organik tabanın yarısının altındaysa kanal durdurulur.

## 7. Sıradaki ürün işleri (arama için)
1. Örnek hafta tablosuna "PDF indir / yazdır" düğmesi; PDF sorguları için SERP'te rakip yok.
2. Hareket başına küçük görsel veya GIF; Healthline ve MACFit formatı.
3. Statik üreticideki Türkçe SSS listesini 21 sayfaya tamamlamak (`scripts/seo-static-pages.mjs`).
4. "Fotoğrafla kalori hesaplama" için ayrı İngilizce sayfa; açık alan.
5. Marka: "Full Balance" yerine arama metinlerinde her zaman "Full Balance fitness app" ve "fullbalance.app" birlikte; Organization şemasında `sameAs` ile sosyal profiller.

## 8. Kaynaklar
- SERP ve içerik biçimi: https://www.macfit.com/blog/fitness/evde-kas-yapmak, https://www.healthline.com/health/fitness-exercise/at-home-workouts, https://www.nourishmovelove.com/beginner-workout-plans/, https://www.garagegymreviews.com/best-free-workout-apps, https://entrenoapp.com/guia-completa-fitness-casa-2025.html
- Hacimler: https://www.semrush.com/website/diyetkolik.com/overview/, https://www.semrush.com/website/macfit.com/overview/, https://www.seopital.co/blog/fitness-seo-keywords
- Yapay zeka özeti etkisi: https://searchengineland.com/google-zero-click-searches-2026-study-479717
- Forumlar: https://eksisozluk.com/evde-spor-yapmak--1971039, https://forum.donanimhaber.com/evde-antrenman-programi--150608492, https://www.technopat.net/sosyal/konu/evde-ekipmansiz-spor-programi-oenerisi.2121964/
- Google Play TWA: https://developers.google.com/chromeos/app-development/publish/pwa-in-play, https://support.google.com/googleplay/android-developer/answer/16679511
- Google Ads maliyet ve kredi: https://www.theedigital.com/blog/google-ads-benchmarks, https://212medya.com.tr/turkiyede-google-ads-tiklama-maliyetleri-2026-sektore-gore-cpc-analizi, https://support.google.com/google-ads/answer/6388096?hl=tr
- Meta maliyet ve politika: https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026, https://www.facebook.com/business/help/2489235377779939, https://searchengineland.com/meta-ads-restrictions-health-wellness-campaigns-453094
- TikTok: https://influee.co/blog/tiktok-ads-cost, https://www.webtonic.io/blog/fitness-social-media-marketing-statistics
- Influencer: https://fujor.com/blog/instagram-2025-influencer-fiyatlari, https://thekingofcontent.agency/blog/cuanto-cuesta-campana-influencers-espana-2026
- Uyumluluk: https://support.google.com/adspolicy/answer/16701855, https://termly.io/resources/articles/biggest-gdpr-fines/
