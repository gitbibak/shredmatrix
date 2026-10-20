# Evde antrenman: arama, içerik, reklam yol haritası ve antrenman modu — 20 Ekim 2026

Durum: **plan**, canlıda hiçbir şey değişmedi. Veri kaynakları: Search Console dökümü
(`docs/reports/search-data-2026-10-09.json`, 9 Eyl–6 Eki 28 gün), günlük denetim
20 Ekim (W43), GA4 özetleri, Google'da rakip sonuç taraması (20 Ekim). Google Ads
hesabı hâlâ yok; tıklama maliyeti (CPC) tahmini yapılmadı, ölçülecek.

---

## 1. Veri ne diyor

### 1.1 Türkçede en güçlü varlık: evde dambıl sayfası

| Sayfa | 30 gün tık / gösterim | Konum | Yorum |
|---|---:|---:|---|
| /evde-dambil-antrenman-programi | **31 / 751** | ~8,5 | TR organik trafiğin ana kapısı; 1. sayfanın altında |
| /direnc-bandi-antrenman-programi | 6 / 70 | 7,0 | CTR %8,6, iyi |
| /kadinlar-icin-evde-spor-programi | 5 / 26 | 7,5 | CTR %19, küçük ama çok ilgili |
| /40-yas-ustu-evde-spor-programi | 4 / 108 | 7,0 | gösterim var, tık düşük |
| /30-gunluk-evde-spor-programi | 2 / 40 | 7,8 | |
| /baslangic-pilates-programi | **0 / 64** | 9,4 | talep var, tık yok |
| /evde-kas-gelistirme-hareketleri | 1 / 94 | **27** | 3. sayfa; içerik zayıf |

Haftalık (11–17 Eki): dambıl sayfası 8 tık / 237 gösterim; trend yukarı (28 günde 18 → 30 günde 31).

### 1.2 Tıklanmayan ama gösterilen sorgular (en büyük fırsat)

Konum 7–10'da ama **0 tık** alan sorgular: Google bizi 1. sayfanın altında gösteriyor, kullanıcı tıklamıyor.

| Sorgu | Gösterim | Tık | Konum | Hedef sayfa |
|---|---:|---:|---:|---|
| evde pilates programı ücretsiz | 47–58 | 0 | 8,1 | başlangıç pilates |
| 30 günlük dambıl programı | 27–45 | 0–1 | 7,7 | dambıl |
| evde dambıl ile spor programı | 32 | 1 | 9,1 | dambıl |
| evde dumbell ile vücut geliştirme programı | 29 | 2 | 8,8 | dambıl |
| dambıl çalışma programı | 20 | 0 | 9,7 | dambıl |
| 30 günlük evde spor programı | 18 | 0 | 9,7 | 30 günlük |
| dambıl antrenman programı | 13 | 0 | 8,3 | dambıl |
| 30 günlük pilates programı (ücretsiz) | 5–18 | 0 | 9,0 | başlangıç pilates |
| evde dambıl ile full body programı | 8 | 0 | 9,6 | dambıl |
| direnç bandı mı dambıl mı | 3 | 0 | 9,3 | **sayfa yok** |
| tek dambıl / 2 dambıl ile program | 1–7 | 0–1 | 6–9 | **sayfa yok** |
| "evde kas …" kümesi (~20 varyant) | 2–10 her biri | 0 | 24–37 | kas hareketleri (zayıf) |

**Örüntü:** İnsanlar *hazır gün gün program* arıyor: "30 günlük", "çalışma programı", "full body", "2 dambıl ile".
Sayfamız "kişisel plan oluştur" diyor ama arama yapan önce **programın kendisini görmek** istiyor.

### 1.3 Rakipler (Google TR, 20 Ekim)

"evde dambıl ile antrenman programı 30 günlük" aramasında üst sonuçlar forum konuları
([technopat](https://www.technopat.net/sosyal/konu/antrenman-programi-iyi-mi.2942042/latest),
[donanımhaber](https://forum.donanimhaber.com/dambil-ile-antrenman-programi-onerisi--162401565)) ve
haber sitesi yazıları ([habergazetesi](https://www.habergazetesi.com.tr/dambil-seti-ile-evde-guc-antrenmani)).
Pilatesde ise yabancı ücretli programlar ([Pilatesology](https://pilatesology.com/tr/programs/basic-30-day-mat-challenge/))
ve reklamlı uygulamalar var. **Türkçe, ücretsiz, gün gün yazılmış, uzman onaylı bir program sayfası yok.**
Rakip zayıf: doğru içerikle ilk 3'e çıkmak gerçekçi.

### 1.4 Tıklamadan sonra ne oluyor (asıl sorun)

- 30 günde 135 kayıt, %95'i plan oluşturuyor. Kayıt kapısı çalışıyor.
- `workout_completed` 30 günde 37 olay, **son 7 günde 1**. D1 %15, D7 %0,9.
- Uygulamada antrenman bitince tek tuşla "günü tamamla" var; setler `weight: 0` ile
  otomatik "tamamlandı" yazılıyor (`src/components/WorkoutPanel.jsx:540`). Kullanıcının
  salonda/evde telefonla takip edebileceği bir **seans ekranı yok**.

**Sonuç:** Reklam veya içerikle daha fazla tık getirmek, şu an çoğunu "plan oluşturdu → geri gelmedi"
kovasına döker. Sıralama: **(1) antrenman modu, (2) organik içerik, (3) küçük ölçülü reklam testi.**

---

## 2. İçerik planı (ilgi çekme)

### 2.1 Hızlı kazanımlar — var olan sayfalar (1. hafta)

1. **Dambıl sayfasına gün gün 30 günlük program tablosu.**
   4 hafta × 3–4 gün, her gün hareket / set / tekrar / dinlenme; 4. hafta hafif (deload).
   Başlangıç ve orta seviye için iki sekme. Yazdırılabilir / ekran görüntüsü alınabilir.
   Altında: "Bu programı kilonla ve seviyene göre uyarlanmış hâliyle telefonda takip et → Ücretsiz başla".
   - metaTitle: `30 Günlük Evde Dambıl Programı (Gün Gün, Ücretsiz) | Full Balance`
   - description içinde "2 dambılla", "full body", "başlangıç" geçsin.
   - SSS bölümü (FAQPage şema): "Kaç kilo dambılla başlamalıyım?", "Tek dambılla olur mu?",
     "Haftada kaç gün?", "Dambıl mı direnç bandı mı?", "Evde kas yapılır mı?".
2. **Başlangıç pilates sayfası** aynı model: "30 Günlük Evde Pilates Programı — Ücretsiz, Gün Gün".
   Günlük 15–25 dk mat seansları; 1. hafta nefes/hizalanma, 2. hafta core kontrolü, 3–4. hafta akış.
   metaTitle: `Evde Ücretsiz Pilates Programı: 30 Gün, Yeni Başlayanlar | Full Balance`.
3. **30 günlük evde spor (ekipmansız)** sayfasına da aynı tablo (vücut ağırlığı versiyonu).
4. Sayfalar arası iç link: dambıl ↔ bant ↔ 30 günlük ↔ kadınlar ↔ 40 yaş üstü.

Başarı ölçütü (4 hafta sonra GSC): dambıl kümesinde konum 8,5 → ≤5, CTR %4 → %8+;
pilates sorgusunda ilk tıklamalar.

### 2.2 Yeni makaleler ve sayfalar (2–6. hafta), öncelik sırasıyla

| # | Başlık (TR) | Hedef sorgu kümesi | Tür | Neden |
|---|---|---|---|---|
| 1 | Evde 2 Dambılla Tüm Vücut Programı (Haftada 3 Gün) | 2 dambıl, full body, tüm vücut | Program sayfası | Gösterim var, sayfa yok |
| 2 | Tek Dambılla Evde Antrenman Programı | tek dambıl ile çalışma | Program sayfası | Sayfa yok, rakip forum |
| 3 | Direnç Bandı mı Dambıl mı? Evde Hangisi Daha İyi | direnç bandı mı dambıl mı | Blog | Karşılaştırma; affiliate'e doğal geçiş |
| 4 | Evde Kas Yapılır mı? 8 Haftada Ne Beklemeli | evde kas geliştirilir mi, evde kas yapma | Blog | "evde kas" kümesi 3. sayfada, ~20 varyant |
| 5 | Evde Kas Geliştirme Hareketleri sayfasını yeniden yaz | evde kas hareketleri/egzersizleri | Sayfa yenileme | 94 gösterim, konum 27 |
| 6 | Kadınlar İçin 4 Haftalık Evde Dambıl Programı | kadınlar için evde spor | Program sayfası | CTR %19, en ilgili kitle |
| 7 | 40 Yaş Üstü Evde Güç Programı (Eklem Dostu) | 40/45 yaş üstü spor programı | Sayfa derinleştirme | 108 gösterim, CTR %3,7 |
| 8 | Evde Dambıl Ağırlığı Seçimi (mevcut blog) güncelle | kaç kilo dambıl | Blog güncelleme | Affiliate ürün kutusuna bağlanır |

Her sayfada ortak blok: örnek hafta tablosu → hareket videoları (varsa) → "kişisel plan + antrenman modu" CTA →
affiliate ekipman kutusu (Amazon tag gelince görünür).

**İngilizce/İspanyolca:** /en zaten en çok tıklanan sayfa (41/520) ve kayıtların %78'i EN. Aynı
"30-day dumbbell plan, day by day" formatı `/en/home-dumbbell-workout-plan` (konum 6,3, 4 gösterim) ve
`/es/entrenamiento-en-casa-con-mancuernas` (CTR %37) için kopyalanmalı; ancak TR'de 4 hafta test edip
kazanan formatı taşımak daha ucuz.

### 2.3 Dağıtım (bütçesiz)

- 30 günlük tabloların **paylaşılabilir görseli** (Pinterest + Instagram kaydet formatı), link sayfaya.
- Forum cevapları (technopat/donanımhaber'de "dambıl programı" soruları): `marketing/forum-cevap-sablonlari.md`
  kullanılarak, reklam kokmayan, programı yazıp sonunda link veren cevaplar. Kullanıcı kendi hesabıyla yazar.
- ChatGPT tarafı (30 günde 98 kayıt kaynağı): tablolar `public/llms.txt` içindeki sayfa listesine eklenir
  (yerel llms.txt değişikliği kullanıcıda; build ile ayrıca ele alınmalı).

---

## 3. Reklam yol haritası (tıklama verisine göre)

Google Ads hesabı yok; hesabı ve ödeme yöntemini **kullanıcı** açar. Hazır duraklatılmış taslak:
`marketing/google-ads-editor-import.csv` (TR dambıl, TR ekipmansız, ES, EN, foto-kalori grupları).

### Kapı 0 — reklama başlamadan önce (zorunlu)

- Antrenman modu canlı ve `workout_session_completed` olayı ölçülüyor (bölüm 4).
- GA4'te `sign_up` ve `first_workout_completed` **önemli etkinlik** olarak işaretli; Ads'e içe aktarılacak.
- Dambıl sayfası 30 günlük tabloyla yenilenmiş (reklam açılış sayfası da o).
- Sebep: D7 %0,9 iken ücretli trafik büyük ölçüde boşa gider.

### Faz 1 — tek kampanya, kanıt toplama (2 hafta)

| Ayar | Değer |
|---|---|
| Kampanya | `FB TR Evde Antrenman` → yalnız **Dambıl ev programı** grubu açık |
| Anahtar kelimeler | Bölüm 1.2'deki gerçek sorgular, **exact + phrase**: "30 günlük dambıl programı", "evde dambıl programı", "dambıl çalışma programı", "evde dumbell ile vücut geliştirme programı", "2 dambıl ile evde program", "evde dambıl ile full body" |
| Negatifler | mevcutlar + "satılık", "fiyat", "kaç tl", "ikinci el", "hepsiburada", "trendyol", "pdf indir" (ekipman satın alma niyeti) |
| Konum / dil | Türkiye, Türkçe |
| Bütçe | Küçük test bütçesi; tutarı kullanıcı belirler. Karar kuralı tıklama sayısına bağlı, tutara değil |
| Teklif | Manuel CPC veya "tıklamaları artır" + maks. CPC tavanı; ilk 2 hafta dönüşüm teklifi yok (veri yok) |
| Açılış | `/evde-dambil-antrenman-programi?utm_...` (taslakta hazır) |
| Reklam metni | Taslaktaki RSA + yeni başlıklar: "30 Günlük Dambıl Programı", "Gün Gün, Ücretsiz", "Telefonda Set Takibi" |

**Karar kuralı (Faz 1 sonu, en az 100 tıklama):**
- Tık → kayıt ≥ %10 **ve** kayıt → ilk antrenman ≥ %30 → Faz 2.
- Tık → kayıt < %5 → reklamı durdur, açılış sayfasını düzelt.
- Kayıt iyi, antrenman düşük → reklamı durdur, ürün (antrenman modu) tarafına dön.
- Arama terimleri raporu her 3 günde bir: alakasız terimler negatife.

### Faz 2 — genişletme (3–6. hafta), yalnızca Faz 1 geçerse

1. Pilates grubu (yeni sayfa hazırsa): "evde pilates programı ücretsiz", "30 günlük pilates programı".
2. Direnç bandı grubu ("direnç bandı antrenman programı" CTR %33).
3. Teklif: 30+ `first_workout_completed` dönüşümünden sonra "dönüşümleri artır" (hedef EBM'siz başla).
4. ES/EN: kayıtların çoğu EN ama ChatGPT ve /en organikten geliyor; EN reklam rekabeti TR'den çok daha
   pahalı olur. EN'yi **en son**, yalnız TR'deki kazanan formatla ve ayrı küçük bütçeyle test et.

### Faz 3 — yeniden etkileşim (2. ay)

- Kayıt olup antrenman yapmayanlara e-posta/push hatırlatma (ürün içi, ücretsiz): "Bugünkü 25 dakikalık
  dambıl antrenmanın hazır".
- Ücretli remarketing yalnızca çerez izni ve politika uygunluğu netleşince; önce ücretsiz kanal.

### Ölçüm tablosu (admin "Büyüme" bölümüne eklenecek)

| Metrik | Kaynak |
|---|---|
| Reklam tıklaması, maliyet | Google Ads |
| Açılış → kayıt | `utm_campaign=home_tr_dumbbell` profil edinme sinyali |
| Kayıt → plan | `plan_generated` |
| Plan → ilk antrenman (7 gün) | `workout_session_completed` |
| Haftada ≥1 antrenman kaydeden üye | `workout_logs` |
| İlk antrenman başına maliyet | Ads maliyeti / ilk antrenman sayısı ← **asıl reklam KPI'ı** |

---

## 4. Antrenman modu (AM-1..AM-3 yapıldı, 20 Ekim)

### 4.1 Amaç ve başarı ölçütü

Planı olan üyeyi **ilk antrenmanı bitirmeye** ve haftaya dönmeye getirmek.
Kuzey yıldızı: *haftada en az 1 antrenman kaydeden üye sayısı.* Hedef 8 hafta içinde 5/hafta → 30/hafta.
İkincil: kayıt → 7 gün içinde ilk antrenman oranı; D7.

### 4.2 Akış

1. **Panel girişinde "Bugünün antrenmanı" kartı** (Dashboard en üstü): odak, süre tahmini, hareket sayısı,
   büyük **Başla** butonu. Dinlenme günündeyse "Yarın: …" ve opsiyonel 10 dk mobilite.
2. **Seans ekranı** (tam ekran, telefon önce):
   - Üstte ilerleme çubuğu (hareket 3/7), geçen süre.
   - Hareket kartı: ad, video/görsel (yoksa açıklama), hedef set × tekrar, önceki seanstaki kilo/tekrar.
   - Her set bir satır: tekrar (önceden dolu) + kilo (önceki değerle dolu, ±2,5 kg düğmeleri) + ✓.
   - ✓ basınca **dinlenme sayacı** planın `rest` değeriyle otomatik başlar (`WorkoutTimer` mantığı yeniden kullanılır),
     bitince titreşim + bip; "Atla" ve "+30 sn".
   - "Bu hareketi değiştir" → aynı kas/ekipman alternatifleri (mevcut alternatif verisi).
   - Ekipman/ağrı: "Ağrı yaptı" işareti → sonraki plan güvenlik kuralına bilgi.
3. **Bitiş ekranı**: toplam süre, set, hacim (kilo × tekrar), rekor ise rozet; mevcut efor/ağrı/enerji geri bildirimi
   buraya taşınır; "Sonraki antrenman: Perşembe — Alt Vücut".
4. **Yarım kalan seans**: her set `localStorage`'a + ✓ başına arka planda kaydedilir; uygulama kapanırsa
   "Kaldığın yerden devam et" (24 saat geçerli).

### 4.3 Veri

- Mevcut `workout_logs` yapısı korunur; `weight: 0, completed: true` sahte değerleri yerine gerçek set değerleri yazılır.
  Eski tek tuşla tamamlama "Hızlı kaydet" olarak kalır (antrenmanı başka yerde yapanlar için) ama `mode: 'quick'` ile işaretlenir.
- Yeni alanlar (JSON içinde, migration gerekmez): `mode: 'guided' | 'quick'`, `durationSec`, `startedAt`,
  set başına `rpe` (opsiyonel), `swappedFrom`.
- Son kilo/tekrar okuma: hareket adına göre son 3 log (mevcut ilerleme takibiyle ortak fonksiyon).
- Kuvvet planı PR-1/PR-4 (`docs/antrenman-kuvvet-makine-pro-plani-2026-10-04.md`) ile bağlantı: o plandaki
  yük takibi ve "W8 test" haftası bu ekranın kilo verisini kullanır. Antrenman modu **önce** yapılırsa
  kuvvet planının ilerleme önerileri gerçek veriye dayanır.

### 4.4 Olaylar (`src/lib/analyticsEventSchema.js`)

`workout_session_started`, `workout_set_completed` (yalnız sayaç, isim yok), `workout_exercise_swapped`,
`workout_session_resumed`, `workout_session_completed` (`mode`, `duration_bucket`, `sets`),
`workout_session_abandoned` (son hareket indeksi). Mevcut `workout_completed` geriye uyum için birlikte gönderilir.

### 4.5 Hatırlatma

- PWA push (izin verilmişse) veya e-posta: planlanan antrenman gününde kullanıcının seçtiği saatte tek bildirim.
- İlk hafta: kayıttan 24 saat sonra antrenman yapılmadıysa tek hatırlatma. Fazlası yok.

### 4.6 PR sırası

| PR | İçerik | Test |
|---|---|---|
| AM-1 | "Bugünün antrenmanı" kartı + seans ekranı iskeleti + set ✓ + otomatik dinlenme | Birim + mobil 390 px görsel |
| AM-2 | Kilo/tekrar girişi, önceki değer, yarım seans kurtarma, gerçek log yazma | Log yapısı testleri |
| AM-3 | Bitiş ekranı, rekor, geri bildirimi taşıma, olaylar, admin'de "haftalık antrenman yapan" metriği | Olay şeması testleri |
| AM-4 | Hareket değiştirme, hatırlatma | |

Sonra kuvvet/makine planı PR-1..PR-4.

---

## 5. Takvim

| Hafta | İş | Kim |
|---|---|---|
| 1 | Dambıl + pilates + 30 günlük sayfalarına gün gün tablo, başlık/SSS | Claude (onayla) |
| 1 | Antrenman modu AM-1..AM-3 (yapıldı) | Claude |
| 2–4 | Yeni sayfalar 1–4 (2 dambıl, tek dambıl, bant vs dambıl, evde kas) | Claude |
| 3 | Google Ads hesabı + GA4 dönüşümleri + Amazon tag | Kullanıcı |
| 4 | Kapı 0 kontrolü → Faz 1 reklam (2 hafta) | Kullanıcı açar, Claude raporlar |
| 6 | Faz 1 kararı; GSC'de içerik etkisi; EN/ES'ye taşıma kararı | Birlikte |

Günlük/haftalık bulut denetimleri bu tablodaki metrikleri (dambıl kümesi konum/CTR, ilk antrenman oranı,
reklam maliyeti) rapora ekleyecek şekilde güncellenebilir.
