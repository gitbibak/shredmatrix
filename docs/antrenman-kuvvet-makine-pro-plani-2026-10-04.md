# Antrenman Programı Yükseltme Planı — Kuvvet · Makine · Pro

**Tarih:** 2026-10-04 · **Durum:** PLAN — kararlar kesinleşti (Bölüm 10), uygulama **Ahmet** tarafından yapılacak; hiçbir şey canlıya alınmadı · **Hedef sürüm:** `PLAN_VERSION 21 → 22` (kas) → `23` (yağ yakımı) → `24` (wellness modülleri)
**Kapsam:** Kas gelişimi modülü, **salon (gym) yolu**. Ev yolları (`home_basic`, `home_bodyweight`) ve diğer modüller bu planda değişmez.
**Tetikleyici:** Kullanıcı geri bildirimi — "kuvvet antrenmanları az, makine hareketleri az, profesyoneller için hafif."

---

## 0. Yönetici özeti

Mevcut 4 seviye (Temel/Orta/İleri/Usta) yapısal olarak sağlam (PPL / Upper-Lower, her kas 2×/hafta) ama **üç şeyi hiç yapmıyor**, ve "az geldi" hissinin kökü bunlar:

1. **Haftadan haftaya ilerleme yok.** Her faz 8 haftalık tek bir statik şablon: 1. hafta ile 8. hafta birebir aynı set/tekrar. "4. hafta deload" sadece bir metin notu. Profesyonel bir programın tanımlayıcı özelliği (dalga yükleme, birikim→yoğunlaştırma blokları) tamamen eksik.
2. **Yük reçetesi yok.** Hiçbir yerde %1RM, top set/back-off, RIR hedefi gibi somut yük talimatı yok; sadece tekrar aralığı. Uygulama kaldırılan ağırlığı da kaydetmiyor (`WorkoutPanel` log'a `weight: 0` yazıyor). Pro kullanıcı için "4×6-8" tek başına bir reçete değildir.
3. **Makine envanteri dar ve kuvvet "slot"u yok.** Kullanılan makine çeşidi ~10; pendulum, Smith, makine omuz press, oturarak leg curl, abdüktör/addüktör, makine row, calf press gibi her salonda bulunan hareketler yok. Kuvvet çalışması her günde tek bir ağır bileşik hareketle sınırlı; ayrı "kuvvet günü" veya SBD (squat/bench/deadlift) frekansı tasarlanmamış.

**Önerilen çözüm (3 katman, tamamı bu dokümanda detaylı):**

| Katman | Ne | Kullanıcıya etkisi |
|---|---|---|
| **A. Slot + Dalga motoru** | Her egzersiz bir *slot* alır (`strength_primary`, `hypertrophy_compound`, `isolation`, `pump`…); faz × slot × hafta tablosu set/tekrar/RIR'ı **haftalık** değiştirir | Program artık 8 hafta boyunca gelişir; deload gerçek olur |
| **B. Yeni şablonlar** | 4 seviye yeniden yazılır: Orta'dan itibaren ayrı **kuvvet günleri**, İleri/Usta'da **blok periyodizasyon**, makine-ağırlıklı hipertrofi günleri, Usta'da pro teknikler (FST-7 benzeri finisher, top set/back-off, test haftası) | Kuvvet ve makine oranı 2-3 katına çıkar, Usta gerçekten "usta" olur |
| **C. Yük takibi (opsiyonel, 2. aşama)** | Set bazında ağırlık girişi + tahmini 1RM (Epley) + %1RM reçetesi | Pro için asıl fark bu; şema zaten hazır, UI yok |

**Kritik bağımlılık:** Önereceğim makine hareketlerinin **çoğunun 3D videosu yok** (Bölüm 6'daki matris). Video olmayan hareket üretime girmemeli → ya Ahmet'in `studio3d` hattında video üretilir ya da videosu olan muadile alias'lanır.

---

## 1. Mevcut durum — ölçülmüş teşhis

Kaynak: [`src/data/planGenerator.js`](../src/data/planGenerator.js) `workoutPhases.muscle` (satır ~1349-1664), sayım `intermediate` modifiyesiz şablon üzerinden.

| Seviye | Yapı | Antrenman günü | "Saf kuvvet" seti (≤6 tekrar) | 6-8 tekrar seti | Makine/kablo hareket oranı | Haftalık ilerleme |
|---|---|---:|---:|---:|---:|---|
| Temel | Upper/Lower ×2 | 4 | **0** | 8 | ~43 % (10/23) | yok |
| Orta | PPL + U/L | 5 | **4** (sadece deadlift) | 8 | ~28 % (11/40) | yok |
| İleri | PPL ×2 | 6 | 9 | 12 | ~39 % (16/41) | yok |
| Usta | PPL ×2 (A güç / B hipertrofi) | 6 | 15 | 24 | ~32 % (12/38) | yok (deload = not) |

**Yorum:**
- Temel için 0 saf kuvvet seti doğru (yeni başlayan önce teknik). Sorun Orta ve üstünde.
- Usta'da kuvvet seti aslında var (15 set 3-5 tekrar) — ama **yük reçetesi ve haftalık dalga olmadığı için** "5×3-5" sekiz hafta boyunca aynı kalıyor. "Hafif geldi" dediğin şey tam olarak bu: hacim var, *periyodizasyon* yok.
- Makine oranı en düşük seviye **Orta** (%28). Oysa makineye en çok, salon kullanan ve yorgunlukla form bozmaya başlayan orta seviye ihtiyaç duyar.
- [`docs/training-program-quality-audit.md`](training-program-quality-audit.md) zaten İleri için "top set + back-off", Usta için "blok periyodizasyon: birikim, yoğunlaştırma, deload" istiyor. `QUALITY_PROFILES` metinleri bunu söylüyor; **şablonlar bunu yapmıyor.** Bu plan o denetimi şablon düzeyinde gerçekleştirir.

### Motorun bugün sunduğu ve planın üzerine kuracağı imkânlar
- Fazlar **8 hafta**, `adaptiveEngine.analyzeProgress` zaten `weeksIntoPhase` hesaplıyor → haftalık dalga için zaman kaynağı hazır.
- `workoutAdaptation.chooseAdaptation` zaten `perceivedExertion`/`energyAfter`/`painReported` ile *reduce/hold/progress/maintain* üretiyor → otoregülasyon kancası hazır.
- `applyTrainingDays` kullanıcının 3/4/5 gün seçimine göre şablonu sıkıştırıyor; 3 gün için `buildThreeDayStrengthWeek` özel şablonu var.
- `applyFocusEmphasis` odak bölgeye haftada en fazla 6 set ekliyor (`WEEKLY_SET_CAP 26`).
- Log şeması set bazında `{weight, reps, completed}` tutuyor — **ağırlık alanı var, girişi yok.** Koç akışında öğrenci gerçek ağırlık giriyor (`docs/coach-pilot.md`), yani bileşen mantığı mevcut.
- Sağlık filtreleri (`HEALTH_EXERCISE_FILTERS`), focus→kas doğrulaması (`validateAndFixExercises`), 3 dil lokalizasyonu (`focusMap`, `localizeExerciseEntry`).

---

## 2. Kanıt tabanı → tasarım kuralları

Her kural, bu planı yazarken taranan kaynağa bağlı. Etiketler: **[MA]** meta-analiz/sistematik derleme, **[RCT]** kontrollü çalışma, **[KL]** kılavuz/pozisyon bildirimi, **[UZ]** uzman/pratisyen kaynağı (hakemli değil).

| # | Bulgu | Kural (bu planda) | Kaynak |
|---|---|---|---|
| K1 | Periyodize program periyodize olmayandan üstün; antrenmanlı bireylerde dalgalı (DUP) ≥ lineer; hipertrofi için fark yok | Her faz **haftalık dalga** içerir; İleri/Usta'da blok yapı | [MA] [Grgic ve ark. 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5571788), [PeerJ 2017](https://peerj.com/articles/3695), [PubMed 28848690](https://www.pubmed.ncbi.nlm.nih.gov/28848690/) |
| K2 | Maksimal kuvvet için ≥%80 1RM / ≤8 tekrar belirgin üstün; hipertrofi yükten bağımsız | Kuvvet slotu **3-6 tekrar, RIR 2-4**; hipertrofi slotu 6-15 tekrar, yük serbest | [MA] [Schoenfeld 2017, PubMed 28834797](https://pubmed.ncbi.nlm.nih.gov/28834797/) |
| K3 | Makine vs serbest ağırlık: hipertrofi ve kuvvette fark yok; kuvvet transferi test aracına özgü | Makineler **birincil hipertrofi aracı** olarak serbestçe kullanılır; kuvvet slotu barbell'de kalır (test özgüllüğü) | [MA] [Haugen ve ark. 2023, 13 çalışma/1016 kişi](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10426227/) |
| K4 | Failure'a yakınlık hipertrofiyi artırır, kuvveti etkilemez; 1-2 RIR ≈ failure | Hipertrofi slotu **0-2 RIR**, kuvvet slotu 2-4 RIR, makine izolasyonu 0-1 RIR | [MA] [Robinson/Refalo 2024 ön baskı](https://sportrxiv.org/index.php/server/preprint/download/343/705/647), [PMC8762534](https://pmc.ncbi.nlm.nih.gov/articles/PMC8762534) |
| K5 | Haftalık hacim yer işaretleri (kas başına): göğüs 8-18, sırt 10-20, quad 8-18, hamstring 6-16, yan omuz 8-22, biceps 8-18, triceps 6-14, baldır 8-16 set | Faz hedefleri bu aralıklara çekilir; `applyFocusEmphasis` tavanı (26) korunur | [UZ] [RP volume landmarks](https://rpstrength.com/training-volume-landmarks-muscle-growth/) |
| K6 | Dinlenme: ağır bileşikte 2-5 dk (3 dk > 1 dk, 1RM'de), hipertrofide >60-90 sn yeterli | Kuvvet slotu **180-300 s**, hipertrofi bileşik 90-120 s, izolasyon 60-90 s | [MA] [2024 Bayes meta-analizi, BarBend özeti](https://barbend.com/9-study-meta-analysis-optimal-rest-time-between-sets), [RCT] Schoenfeld 2016 (1 vs 3 dk) |
| K7 | Hacim eşitlenince 2×/hafta ≈ 3×/hafta; SBD için 2-3× uygun | Kas frekansı 2× korunur; **squat/bench/deadlift 2×/hafta** (ağır + varyant) | [MA] [PMC6724585](https://pmc.ncbi.nlm.nih.gov/articles/PMC6724585), [Henselmans 67 çalışma](https://mennohenselmans.com/this-is-how-to-maximize-muscle-according-to-67-studies/) |
| K8 | Deload 5-7 gün, 4-6 haftada bir (orta), 3-4 haftada bir (ileri); hacim −40-50 % | **8 haftalık faz = 3+1+3+1**: W4 ve W8 deload | [KL] [Sports Med Open 2024](https://link.springer.com/article/10.1186/s40798-024-00691-y), [UZ] [arvo.guru 10k antrenman verisi](https://arvo.guru/de/blog/deload-weeks-recovery-data) |
| K9 | Blok: birikim %65-80 yüksek hacim → yoğunlaştırma %82-88 / 3-5 tekrar → realizasyon ~%90 düşük hacim | Usta fazı bu üç bloğu 8 haftaya sığdırır (Bölüm 4.4) | [UZ] [EliteFTS blok periyodizasyon](https://elitefts.com/blogs/powerlifting/block-periodization-in-the-sport-of-powerlifting), [FitnessVolt rehber](https://fitnessvolt.com/powerlifting/guides/training-periodization-guide/) |
| K10 | Powerbuilding şablonları: PHAT = 2 güç + 3 hipertrofi günü; Nippard 4 gün U/L, kanıt-temelli periyodizasyon | Orta/İleri yapısı **"2 kuvvet + 3-4 hipertrofi"** mantığına geçer | [UZ] [StrengthLog PHAT](https://www.strengthlog.com/phat-workout-routine/) |
| K11 | Pro vücut geliştirme: FST-7 sırası = ağır bileşik 3×6-8 → orta 3×8-12 → **7×12-15 kısa dinlenmeli finisher**; Yates = düşük hacim, failure'a kadar | Usta'da seans başına **1 FST-7 finisher (makinede)**; ileri teknik seans başına ≤2 (denetim kuralı) | [UZ] [BarBend FST-7](https://barbend.com/fst7/), [Yates özeti](https://www.setforset.com/blogs/news/dorian-yates-workout) |
| K12 | Pec deck/makine press göğüs aktivasyonunda en üst sırada (ACE EMG); makine stabilitesi failure'a yakın setlerde form bozulmasını azaltır | Failure'a giden izolasyon setleri **makinede** planlanır | [UZ] [ACE göğüs EMG çalışması](https://fit-pro.com/article-3173-Ace-study-tests-common-chest-exercises.html), [Barbell Medicine pec deck](https://www.barbellmedicine.com/blog/pec-deck-machine-fly-hypertrophy/) |
| K13 | Kuvvet seviyeleri: orta erkek ≈ bench 1×, squat 1.5×, deadlift 2× vücut ağırlığı; "ileri" >5 yıl | Usta programı **gerçek ileri lifter**'a göre kalibre (vücut ağırlığı oranı testi önerisi, Bölüm 7) | [UZ] [StrengthLevel standartları](https://strengthlevel.com/powerlifting-standards/kg), [StrengthLog](https://www.strengthlog.com/squat-strength-standards-kg/) |
| K14 | ACSM 2026: tutarlılık ve efor karmaşıklıktan önemli; kuvvet için ~%80 1RM, 2-3 set; hipertrofi ~10 set/kas | Temel ve Orta **basit kalır**; karmaşıklık yalnız İleri/Usta'da | [KL] [ACSM 2026 (PMC12965823)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) — mevcut denetim dokümanından |

> Not: Hack squat'ın barbell'e göre "%20-40 daha fazla yük" alabilmesi ve pendulum'un uzun kas boyunda avantajı **satıcı/blog** kaynaklıdır ([SoleTreadmills](https://www.soletreadmills.com/blogs/news/hack-squat-vs-pendulum-squat-muscles-worked-benefits-compared), [SetGraph](https://setgraph.app/articles/pendulum-squat-guide-benefits-muscles-worked-and-proper-form)); planda "makine seçimi" gerekçesi olarak kullanıldı, hacim/yoğunluk kuralı olarak **kullanılmadı**.

---

## 3. Mimari — Slot + Dalga motoru (Katman A)

Bu katman olmadan şablon değişikliği yine "statik 8 hafta" olur. Bu yüzden **önce** bu gelir.

### 3.1 Egzersiz slot'ları

Her şablon egzersizine `slot` alanı eklenir:

| slot | Tanım | Tekrar | RIR | Dinlenme | Örnek |
|---|---|---|---|---|---|
| `strength_primary` | Günün ana kuvvet hareketi (SBD + OHP) | 3-6 | 2-4 | 180-300 s | Back Squat, Bench Press, Deadlift, OHP |
| `strength_secondary` | Kuvvet varyantı / ikinci bileşik | 4-8 | 2-3 | 150-180 s | Paused Bench, Front Squat, RDL, Pendlay Row |
| `hypertrophy_compound` | Makine/serbest bileşik, hipertrofi | 6-12 | 1-2 | 90-120 s | Hack Squat, Machine Chest Press, Chest-Supported Row |
| `isolation` | Tek eklem, makine/kablo öncelikli | 10-20 | 0-2 | 60-90 s | Leg Extension, Pec Deck, Cable Curl |
| `pump` | Finisher / FST-7 / dropset (Usta) | 12-20 | 0 | 30-45 s | 7×12-15 Pec Deck |
| `prehab` | Arka omuz, core, baldır | 12-25 | 1-3 | 45-60 s | Face Pull, Seated Calf |

Mevcut `sets/reps/rest` **şablonun hafta-1 değeri** olarak kalır (geri uyumluluk); `slot` yoksa motor `hypertrophy_compound` varsayar → eski şablonlar ve ev yolları kırılmaz.

### 3.2 Dalga tablosu (`WAVE_TABLE[phase][slot][week]`)

8 haftalık faz: **W1-3 birikim · W4 deload · W5-7 yoğunlaştırma · W8 deload/test.** Değerler şablon hafta-1 değerine çarpan/offset olarak uygulanır.

Örnek — `strength_primary`, Usta:

| Hafta | Set | Tekrar | Hedef RIR | %1RM (varsa) | Not |
|---|---|---|---|---|---|
| 1 | 4 | 6 | 3 | 72-75 | birikim |
| 2 | 4 | 5 | 3 | 77 | |
| 3 | 5 | 5 | 2 | 80 | |
| 4 | 2 | 5 | 5 | 60 | **deload** |
| 5 | 5 | 4 | 2 | 83 | yoğunlaştırma |
| 6 | 5 | 3 | 2 | 86 | |
| 7 | 4 | 3 | 1 | 88-90 | top set + back-off |
| 8 | 1+2 | AMRAP@85 + 2×5@70 | — | — | **test haftası** → e1RM |

Örnek — `isolation`, Orta: W1 3×12 RIR2 → W3 4×12 RIR1 → W4 2×12 RIR3 → W5-7 4×10-12 RIR1→0 → W8 2×12.

Tam tablo implementasyon aşamasında `src/data/waveTable.js` olarak yazılır; bu dokümandaki 4 seviye şablonları (Bölüm 4) hafta-1 değerlerini verir.

### 3.3 Hafta nereden bilinir, nerede uygulanır

- **Kaydedilmiş plan değişmez** (baz şablon). Haftalık reçete **render anında** hesaplanır: `getWeekPrescription(exercise, phase, weekInPhase)`.
- `weekInPhase` = `adaptiveEngine` içindeki `programAgeWeeks % 8` (zaten var). `planCreatedAt` faz atlayınca sıfırlanıyor (`advancePhase`) → doğru.
- Böylece `PLAN_VERSION` artışı sadece şablon değişince gerekir; haftalık dalga regenerasyon istemez. `WorkoutPanel` günün kartında "Hafta 3/8 · Birikim" rozeti gösterir.
- Log'a `weekInPhase` ve `prescribed` (set/tekrar/RIR) yazılır → ilerleme analizi ve koç akışı için ölçülebilir.

### 3.4 Otoregülasyon kancası

`workoutAdaptation.chooseAdaptation` çıktısı dalgaya bağlanır:
- `reduce` → o haftanın `strength_primary` back-off setleri −1, `pump` slotu atlanır.
- `hold` (ağrı) → hafta ilerlemez (aynı hafta reçetesi tekrar), `strength_primary` RIR +2.
- `progress` → W5-7'de %1RM +2.5 (yük takibi varsa) veya RIR −1.
Bu, denetim dokümanının "readiness checks: sleep, soreness, missed workouts" maddesini somutlar.

---

## 4. Yeni şablonlar — 4 seviye (Katman B)

Genel kurallar: Pazar tam dinlenme; ağır omurga yükü (squat/deadlift `strength_primary`) **arka arkaya günlerde değil**; `applyFocusEmphasis` davranışı aynen; her satır `[video ✓/✗]` ile işaretli (Bölüm 6).

### 4.1 Temel — 4 gün Upper/Lower (yapı korunur, kuvvet temeli + makine regresyonu eklenir)

Değişiklik felsefesi: ACSM 2026 (K14) — basit kalsın. Eklenen: her seansta **1 "kuvvet temeli" slotu (3×5, RIR 3)** ki kullanıcı ağır çalışmayı öğrensin; her serbest ağırlık hareketine **makine regresyonu** (`regressionOption` metin değil, gerçek alternatif).

| Gün | Hafta-1 reçete (slot) |
|---|---|
| Pzt Üst A | Bench Press 3×5 RIR3 (`strength_primary`) [✓] · Lat Pulldown 3×8-10 (`hyp_compound`) [✓] · **Machine Chest Press** 2×10-12 [✓] · Seated Cable Row 3×10-12 [✓] · Triceps Pushdown 3×12-15 (`isolation`) [✓] · Hammer Curl 3×12-15 [✓] |
| Sal Alt A | Squat 3×5 RIR3 (`strength_primary`) [✓] · Leg Press 3×10-12 [✓] · Romanian Deadlift 3×8-10 (`strength_secondary`) [✓] · **Lying Leg Curl (machine)** 3×12-15 [✓] · Leg Extension 2×12-15 [✓] · Seated Calf Raise 3×12-15 [✓] |
| Per Üst B | Barbell Row 3×5 RIR3 (`strength_primary`) [✓] · Incline DB Press 3×8-10 [✓] · **Lat Pulldown (nötr tutuş)** 3×10-12 [✓ alias] · Lateral Raise 3×12-15 [✓] · Barbell Curl 3×10-12 [✓] · Overhead Triceps Ext 3×12-15 [✓] |
| Cum Alt B | **Hack Squat** 3×8-10 (`hyp_compound`) [✓] · Hip Thrust 3×8-10 [✓] · Bulgarian Split Squat 2×10/bacak [✓] · Leg Extension 3×12-15 [✓] · Lying Leg Curl 3×12-15 [✓] · Standing Calf 3×12-15 [✓] |

Beginner modifiyesi (`setMult 0.8`) **kuvvet slotuna uygulanmaz** (3×5 sabit) — aksi halde 2×5 olur ve öğrenme amacı bozulur. `applyExperienceModifiers` slot-duyarlı hale gelir.

### 4.2 Orta — 5 gün: 2 Kuvvet + 3 Hipertrofi (PHAT/PHUL mantığı, K10)

Bugünkü "PPL + Üst + Alt" → **"Kuvvet Üst · Kuvvet Alt · Push · Pull · Bacak(makine)"**. Kuvvet günleri barbell, hipertrofi günleri makine-ağırlıklı (K3, K12).

| Gün | Hafta-1 reçete |
|---|---|
| Pzt **Kuvvet Üst** | Bench Press 4×5 RIR2 (`strength_primary`) [✓] · OHP 3×5 RIR2 (`strength_primary`) [✓] · Pendlay Row 4×5 (`strength_secondary`) [✓] · Weighted/Assisted Pull-Up 3×6-8 [✓/✗ assisted] · Face Pull 3×15 (`prehab`) [✓] |
| Sal **Kuvvet Alt** | Squat 4×5 RIR2 (`strength_primary`) [✓] · Romanian Deadlift 3×6 (`strength_secondary`) [✓] · Leg Press 3×8 [✓] · **Seated Leg Curl** 3×10 [✗ → Lying Leg Curl alias] · Standing Calf 4×10 [✓] |
| Çar Dinlenme | |
| Per **Push (makine)** | **Machine Chest Press** 4×8-10 [✓] · Incline DB Press 3×10 [✓] · **Pec Deck** 3×12-15 [✓] · **Machine Shoulder Press** 3×10 [✗ → DB Shoulder Press alias] · Cable Lateral Raise 4×15 [✗ → Lateral Raise alias] · Rope Pushdown 3×12-15 [✓] · Overhead Cable Ext 3×12-15 [✓] |
| Cum **Pull (makine)** | Lat Pulldown 4×8-10 [✓] · **Chest-Supported Row** 4×10 [✓] · **Seated Cable Row (geniş)** 3×12 [✓ alias] · Straight Arm Pulldown 3×12-15 [✓] · Reverse Pec Deck 3×15 [✓] · **Preacher Curl (machine)** 3×10-12 [✗ → Preacher Curl alias] · Cable Curl 3×12-15 [✓] |
| Cmt **Bacak (makine)** | **Hack Squat** 4×8-10 [✓] · Leg Press 3×12 [✓] · **Lying Leg Curl** 3×12 [✓] · Leg Extension 3×15 [✓] · Hip Thrust 3×10 [✓] · **Hip Abduction** 3×15 [✗] · Seated Calf 4×15 [✓] |

Haftalık hedef (kas başına, K5 içinde): göğüs 13, sırt 18, quad 14, ham 9, delt 13, triceps 9, biceps 9. Saf kuvvet seti: **4 → 18/hafta.** Makine oranı: **%28 → ~%55.**

### 4.3 İleri — 6 gün PPL×2: A = kuvvet, B = makine-hipertrofi, top set + back-off

| Gün | Hafta-1 reçete |
|---|---|
| Pzt Push A (Kuvvet) | Bench Press **top set 1×4 RIR2 + back-off 3×6** [✓] · OHP 4×5 [✓] · Close Grip Bench 3×6 [✓] · Weighted Dips 3×8 [✓] · Lateral Raise 3×15 [✓] |
| Sal Pull A (Kuvvet) | Deadlift top 1×3 RIR2 + back-off 3×5 [✓] · Weighted Pull-Up 4×5 [✓] · Pendlay Row 4×6 [✓] · Barbell Curl 3×8 [✓] · Face Pull 3×20 [✓] |
| Çar Bacak A (Kuvvet) | Squat top 1×4 + back-off 3×6 [✓] · Front Squat 3×6 [✓] · Romanian Deadlift 3×8 [✓] · Standing Calf 4×10 [✓] |
| Per Push B (Makine) | Machine Chest Press 4×10 [✓] · **Incline Smith Press** 3×10 [✗ → Incline Barbell alias] · Pec Deck 3×15 RIR0 [✓] · Machine Shoulder Press 3×12 [✗] · Cable Lateral Raise 4×15 [✗] · Rope Pushdown 3×15 [✓] · Overhead Cable Ext 3×12 [✓] |
| Cum Pull B (Makine) | Lat Pulldown 4×10 [✓] · Chest-Supported Row 4×10 [✓] · **Machine Row (high/low)** 3×12 [✗ → T-Bar Row alias] · Straight Arm Pulldown 3×15 [✓] · Reverse Pec Deck 3×15 [✓] · Preacher Curl 3×12 [✓] · Cable Curl 3×15 [✓] |
| Cmt Bacak B (Makine) | **Pendulum / Hack Squat** 4×10 [pendulum ✗ → Hack ✓] · Leg Press 3×12 [✓] · Seated Leg Curl 3×12 [✗] · Leg Extension 3×15 RIR0 [✓] · Hip Thrust 3×10 [✓] · Hip Abd/Add 3×15 [✗] · Seated Calf 4×15 [✓] |

Dalga: A günleri `strength_primary` tablosu (W1 %75 → W7 %88); B günleri W1-3 set +1/hafta (RP birikim), W4 −50 %, W5-7 RIR 2→0, W8 −50 %. SBD frekansı: her biri ağır 1× + varyant 1× = **2×/hafta** (K7).

### 4.4 Usta / Pro — 6 gün, blok periyodizasyon + pro teknikler

Felsefe: ileri lifter (K13: >5 yıl, bench ≥1.25×, squat ≥1.75×, deadlift ≥2.25× vücut ağırlığı civarı) ve koç kullanıcı. Üç blok 8 haftaya sığar (K9):

| Blok | Haftalar | Kuvvet slotu | Hipertrofi slotu | Pro teknik |
|---|---|---|---|---|
| Birikim | 1-3 | 4×6 → 5×5, %72-80 | makine, set +1/hafta, RIR 2→1 | 1 FST-7 finisher/seans (K11) |
| Deload | 4 | 2×5 %60 | −50 % | yok |
| Yoğunlaştırma | 5-7 | 5×4 → 4×3, %83-90, top set/back-off | hacim −30 %, RIR 1→0 | 1 dropset veya rest-pause/seans, FST-7 kaldırılır |
| Realizasyon/Test | 8 | AMRAP@85 % → e1RM (sonraki faza yük) | −50 % | yok |

Günler (hafta-1):

| Gün | Reçete |
|---|---|
| Pzt Push A (Kuvvet) | Paused Bench Press 4×6 (`strength_primary`) [✓] · **Spoto/Board Press** 3×5 [✗ → Close Grip alias] · OHP 4×5 [✓] · Weighted Dips 3×8 [✓] · Cable Lateral Raise 4×15 [✗] |
| Sal Pull A (Kuvvet) | Deadlift 4×5 [✓] · **Block Pull / Deficit** haftalara göre dönüşümlü [deficit ✓, block ✗] · Weighted Pull-Up 4×5 [✓] · Pendlay Row 4×5 [✓] · Face Pull 3×20 [✓] |
| Çar Bacak A (Kuvvet) | Back Squat 4×6 [✓] · **Pause/Pin Squat** 3×4 [✗ → Front Squat alias] · Romanian Deadlift 3×6 [✓] · **Glute Ham Raise / Nordic** 3×6 [✗ → Lying Leg Curl alias] · Standing Calf 4×10 [✓] |
| Per Push B (Pro makine) | Machine Chest Press 4×8 [✓] · Incline Smith 3×10 [✗] · Machine Shoulder Press 3×10 [✗] · Cable Crossover 3×12 [✓] · Rope Pushdown 3×12 [✓] · **FST-7: Pec Deck 7×12-15, 30 s** (`pump`) [✓] |
| Cum Pull B (Pro makine) | Lat Pulldown 4×8 [✓] · Chest-Supported Row 4×10 [✓] · Meadows Row 3×10 [✓] · Straight Arm Pulldown 3×12 [✓] · Reverse Pec Deck 3×15 [✓] · Preacher Curl 3×10 [✓] · **FST-7: Cable Curl 7×12-15** [✓] |
| Cmt Bacak B (Pro makine) | Hack Squat 4×8 [✓] · Leg Press 4×12 [✓] · Seated Leg Curl 3×12 [✗] · Hip Thrust 3×8 [✓] · Hip Abd/Add 3×15 [✗] · **FST-7: Leg Extension 7×12-15** [✓] · Seated Calf 4×15 [✓] |

Denetim kuralı korunur: ileri teknik (FST-7, dropset, rest-pause) **seans başına en fazla 2**, 7 sert gün yok (Pazar tam dinlenme + W4/W8 deload).

### 4.5 3 gün seçen kullanıcı (`buildThreeDayStrengthWeek`)

Bugün sabit `3×8-12` tam vücut. Yeni: her seansın ilk hareketi `strength_primary` (A: Squat, B: Bench, C: Deadlift) 3×5 RIR2; kalanı makine hipertrofi. Faz bilgisi de kullanılır (bugün faz-bağımsız). Bu, "3 gün = kuvvet yok" sorununu kapatır.

### 4.6 `applyTrainingDays` düzeltmesi (zorunlu)

Mevcut algoritma günleri `getFocusMuscleCategory` çeşitliliğine göre seçiyor. Yeni şablonda "Kuvvet Üst" ve "Push" ikisi de `upper`/`push` kategorisinde → 4 gün seçen kullanıcıda **kuvvet günü düşebilir.** Çözüm: seçim önceliği `slot` içeriğine göre — önce `strength_primary` içeren günler, sonra kategori çeşitliliği. Test: her gün sayısında (3/4/5) en az 1 kuvvet üst + 1 kuvvet alt günü kalır.

---

## 5. Yük reçetesi ve takip (Katman C — 2. aşama, ayrı PR)

Pro için asıl farkı yaratan katman; ama şablon değişikliğinden bağımsız ve daha büyük bir UI işi. **İki aşamalı:**

**C1 — UI gerektirmez (bu planla birlikte gider):**
- Tüm reçeteler **RIR tabanlı** yazılır (K4). "%1RM" sadece e1RM mevcutsa gösterilir.
- Usta W8 **test haftası**: "85 % tahmini ile AMRAP, tekrarı gir" → Epley `e1RM = w × (1 + r/30)`. Test haftası e1RM'yi bootstrap eder.
- `QUALITY_PROFILES.progressionRule` metinleri **double progression** (hipertrofi) ve **dalga** (kuvvet) kurallarıyla güncellenir.

**C2 — UI (ayrı PR):**
- `WorkoutPanel`'de set bazında **ağırlık + tekrar girişi** (koç akışındaki bileşen yeniden kullanılır; `weight: 0` yerine gerçek değer).
- `lib/strengthProgress.js`: hareket bazında e1RM geçmişi, `strength_primary` için otomatik yük önerisi (`%1RM × e1RM`, 2.5 kg'a yuvarla).
- Progress sekmesine "Kuvvet" grafiği (SBD e1RM trendi) — pro kullanıcı ve koç için en görünür kazanım.
- Vücut ağırlığı oranı rozeti (K13): "Squat 1.6× BW — Orta/İleri sınırı".

---

## 6. Egzersiz envanteri ve **video kapsama matrisi** (kritik bağımlılık)

`src/data/exerciseVideoMap.js` (652 anahtar) ve `marketing/exercise-videos/studio3d/exercises` (251 tanım) taranarak çıkarıldı. Kural: **videosu olmayan hareket üretime girmez.** Üç yol: (a) video üret (Ahmet, studio3d), (b) videosu olan muadile **alias** (geçici), (c) şablondan çıkar.

### 6.1 Hemen kullanılabilir (video ✓)
Hack Squat · Leg Press (tek bacak dahil) · Leg Extension · Lying Leg Curl (machine) · Machine Chest Press · Pec Deck · Reverse Pec Deck · Lat Pulldown · Chest-Supported Row · T-Bar Row · Seal Row · Meadows Row · Pendlay Row · Seated Calf Raise · Back Extension · Paused Bench Press · Tempo varyantları · Close Grip Bench · Face Pull · Rope Pushdown · Overhead Cable Ext · Cable Curl · Bayesian Cable Curl · Landmine Press · Farmer Walk · Sled · Deficit Deadlift · Romanian Deadlift · Front Squat · Weighted Dips/Pull-Up · OHP.

### 6.2 Video **yok** — üretim önceliği (TR salon yaygınlığına göre)

| Öncelik | Hareket | Neden | Geçici alias |
|---|---|---|---|
| 1 | Smith Machine Squat / Incline Press | TR salonlarında standart (GTÜ 2025 listesi ✓); hack olmayan salonda "makine squat" muadili | Hack Squat / Incline Barbell |
| 1 | Hip Abduction / Adduction | standart makine (GTÜ ✓), güvenli, kalça-yan | Bulgarian Split Squat |
| 1 | Seated Leg Curl | hamstring makine standardı (GTÜ'de leg curl ✓) | Lying Leg Curl |
| 1 | Cable Lateral Raise | yan omuz, sürekli gerilim; kablo her salonda | Lateral Raise |
| 2 | Machine Shoulder Press | omuz hipertrofi için iyi ama her salonda yok (GTÜ ✗) | DB Shoulder Press |
| 2 | Machine Row (high/low, iso-lateral) | pull B günleri | T-Bar Row |
| 2 | Preacher Curl Machine | biceps izolasyon | Preacher Curl |
| 2 | Assisted Pull-Up / Dip | Orta seviyede gerekli regresyon | Lat Pulldown / Triceps Dip |
| 2 | Calf Press (leg press'te) | baldır makinesi | Seated Calf |
| 2 | Glute Ham Raise / Nordic | Usta hamstring | Lying Leg Curl |
| 3 | Pendulum Squat | az salonda var | Hack Squat |
| 3 | Pause/Pin Squat, Spoto/Board Press, Block/Rack Pull | Usta kuvvet varyantları | Front Squat / Close Grip / Deficit DL |
| 3 | Trap Bar Deadlift, Safety Bar Squat, Belt Squat, Reverse Hyper | niş ekipman | konvansiyonel muadil |
| 3 | Push Press, Upright Row, Shrug, Good Morning, Sumo Deadlift | kullanım sınırlı | — |

**Karar noktası:** Öncelik-1 (5 hareket) videosu üretilmeden Orta/İleri şablonları alias ile çıkabilir; **Usta için en az öncelik-1 + 2 tamamlanmalı**, yoksa "pro" hissi yine zayıf kalır.

### 6.3 Her yeni hareket için zorunlu kayıtlar
1. `EXERCISE_MUSCLE_MAP` (yoksa `validateAndFixExercises` tek-kas günlerinde **eler** — Haziran'daki hata)
2. `FOCUS_ALLOWED_MUSCLES` uyumu; yeni focus adları ("Kuvvet Üst/Alt", "Push (makine)") → `getFocusMuscleCategory` anahtar kelimeleri (**sıralama tuzağı:** çok-kaslı adlar tekil kontrollerden önce)
3. `exerciseDatabase.js` form ipucu + hata listesi (TR; EN/ES metinleri `qualityTextMap` mantığıyla)
4. `exerciseVideoMap` anahtarı (TR + EN ad)
5. `HEALTH_EXERCISE_FILTERS`: bel → Good Morning/Block Pull/Deficit hariç; diz → Pendulum/Hack derinlik notu, Sissy hariç; omuz → Upright Row/Behind-neck hariç, Smith incline açı notu
6. `focusMap` EN/ES + `localizeExerciseEntry` yeni token'ları ("Top set", "Back-off", "AMRAP", "FST-7", "%", "RIR")

---

## 7. Güvenlik ve kalite kuralları (validator'a eklenecek)

Denetim dokümanının "quality validator" maddesi bu planla somutlanır. Üretilen plan şu kurallardan birini ihlal ederse **test başarısız**:
- Faz ≥1 gym planında haftada ≥ 2 `strength_primary` günü; SBD her biri ≥ 1× ağır + ≥ 1× varyant.
- `strength_primary` içeren günler **arka arkaya değil** (squat/deadlift omurga yükü).
- Kas başına haftalık set K5 aralığında (MEV altı / MRV üstü → fail), `applyFocusEmphasis` sonrası dahil.
- Seans başına ileri teknik (`pump`, dropset, rest-pause) ≤ 2; Temel/Orta'da 0.
- W4 ve W8 toplam set ≤ %55 × W3.
- 60+ yaş veya `heart_condition`: `strength_primary` RIR ≥ 3, AMRAP test haftası devre dışı, %1RM tavanı 85.
- Beginner: AMRAP/test yok; 3×5 RIR3 sabit.
- Her gym egzersizi videoya sahip veya **açık alias listesinde** (`exerciseVideos.test.js` genişletilir).
- 3 dilde Türkçe sızıntı yok (Haziran'daki `localizeExerciseEntry` kontrolü test olarak kalıcı hale gelir).

---

## 8. Değişecek dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/data/planGenerator.js` | `workoutPhases.muscle` 4 faz yeniden; `slot` alanı; `buildThreeDayStrengthWeek` faz-duyarlı; `applyTrainingDays` slot-öncelikli; `applyExperienceModifiers` slot-duyarlı; `getFocusMuscleCategory` yeni anahtar kelimeler; `EXERCISE_MUSCLE_MAP`, `FOCUS_ALLOWED_MUSCLES`, `HEALTH_EXERCISE_FILTERS`, `QUALITY_PROFILES`, `focusMap`, `localizeExerciseEntry` |
| **yeni** `src/data/waveTable.js` | `WAVE_TABLE`, `getWeekPrescription()` |
| `src/data/workoutAdaptation.js` | reduce/hold/progress → dalga etkisi |
| `src/data/exerciseDatabase.js` | yeni hareket ipuçları |
| `src/data/exerciseVideoMap.js` | yeni anahtarlar + alias tablosu (Ahmet ile) |
| `src/components/WorkoutPanel.jsx` | hafta rozeti, slot etiketi, reçete render; log'a `weekInPhase`/`prescribed` |
| `src/data/planVersion.js` | `21 → 22` |
| `src/i18n/translations.js` | rozet/slot/teknik metinleri (TR/EN/ES) |
| Testler | `planGenerator.test.js` (Bölüm 7 kuralları), `workoutAdaptation.test.js`, `exerciseVideos.test.js`, `WorkoutPanel.test.jsx`, yeni `waveTable.test.js`, `focusEmphasis.test.js` (tavan korunuyor) |
| C2 (ayrı PR) | `WorkoutPanel` ağırlık girişi, yeni `lib/strengthProgress.js`, `ProgressTracker` kuvvet grafiği, `dataService` (şema zaten uygun) |

---

## 9. Uygulama sırası ve canlıya alma (kademeli, geri alınabilir)

| Adım | İş | Çıkış kriteri |
|---|---|---|
| 0 | Bu planın onayı + Bölüm 10 soruları | Ahmet onayı |
| 1 | Dal: `feat/strength-machine-pro`. Katman A (slot + dalga + render) **şablon değişmeden** | Mevcut şablonlar `slot`suz çalışır; `waveTable.test` yeşil; eski planlar bozulmaz |
| 2 | Katman B şablonları + kayıtlar (Bölüm 6.3) + i18n | Bölüm 7 validator testleri yeşil; 3 dil sızıntı 0; `npm test` tam yeşil |
| 3 | Video: öncelik-1 (5 hareket) studio3d üretimi — **Ahmet** | Alias ihtiyacı Orta/İleri'de 0 |
| 4 | Cihaz QA: 320/390/1280, TR/EN/ES, 3/4/5 gün seçimi, odak bölge, sağlık filtreleri | Ekran görüntüsü seti `output/` |
| 5 | `PLAN_VERSION 22` + PR + review | Ahmet review |
| 6 | Canlı: mevcut kullanıcı planları giriş anında yenilenir (`upgradePlanIfNeeded`). İlk 2 hafta izleme: `perceivedExertion` dağılımı, `painReported` oranı, antrenman tamamlama | 3 = "çok zor" oranı artmıyor; ağrı raporu artmıyor |
| 7 | Geri alma planı: `PLAN_VERSION 23` ile eski şablona dönüş (tek commit) | — |
| 8 | Katman C2 (yük takibi) ayrı PR | — |

**Canlıya alma ön koşulu:** Adım 2 + 3 (öncelik-1 video) + 4 tamam olmadan `PLAN_VERSION` artırılmaz.

---

## 10. Kararlar (kesinleştirildi — 2026-10-04)

Ürün sahibi bu beş kararı araştırmaya dayalı olarak bana bıraktı; gerekçeleriyle kesinleştirildi. Uygulama sırasında yeniden açılmaz; itiraz varsa bu bölüm güncellenir.

| # | Karar | Gerekçe |
|---|---|---|
| 1 | **Usta = hibrit.** A günleri barbell kuvvet (SBD + OHP, blok dalga), B günleri makine-hipertrofi + seans başına 1 FST-7. Ayrı "powerbuilding / bodybuilding track" **v22'de yok.** | Kuvvet ≥%80 1RM ister (K2), hipertrofi makinede failure'a yakın setten kazanır (K3, K4, K12); PHAT/powerbuilding şablonu tam olarak bu ikiliyi kullanır (K10). Track eklemek onboarding'e seçenek ekler — ACSM 2026 gereksiz karmaşıklığa karşı uyarıyor (K14). Mevcut `focusAreas` (max 2 bölge, +6 set) kullanıcıya zaten "ağırlık merkezi" veriyor. |
| 2 | **Yük takibi (C2) spesifikasyonu şimdi kesin, uygulama 2 ayrı PR.** PR-1: Katman A+B (`PLAN_VERSION 22`), **C1 (RIR tabanlı reçete + Usta W8 test haftası) PR-1'e dahil.** PR-2: set bazında ağırlık girişi, Epley e1RM, %1RM reçetesi, kuvvet grafiği. | C2 UI + log şeması + progress sayfasına dokunuyor; ayırmak riski düşürür. C1 sayesinde pro kullanıcı PR-1'den itibaren yük niyetini (RIR) görür. Şema zaten hazır (`weight` alanı), koç akışında giriş bileşeni var → PR-2 küçük. |
| 3 | **Video önceliği TR salon profiline göre kilitlendi** (Bölüm 6.2 güncellendi): Öncelik-1 = Smith Machine (squat + incline press), Hip Abduction, Hip Adduction, Seated Leg Curl, Cable Lateral Raise. Machine Shoulder Press → öncelik-2. Pendulum → öncelik-3. Ayrıca kural: **Hack Squat ↔ Smith Squat** Orta/İleri'de birbirinin alias'ı. | Türkiye'de kurumsal bir salonun 2025 ekipman listesi (GTÜ) [tek örnek]: Smith ✓, leg press/extension/curl ✓, abdüktör/addüktör ✓, preacher ✓, butterfly (pec deck) ✓, lat/row/crossover ✓; **hack, pendulum, makine göğüs/omuz press, calf makinesi, assisted dip ✗.** Sektör bilgisiyle tutarlı. Pilot salonla (koç pilotu) doğrulanacak. |
| 4 | **Ev yolları kapsam dışı.** `home_basic`/`home_bodyweight` şablonlarına dokunulmaz. | Üretilen çıktı denetimi (Bölüm 11.6): ev programları yapısal olarak düzgün ve kademeli (3→4→5 gün, A/B/C varyasyon). Değişiklik yapmak için gerekçe yok; kullanıcı da istemedi. |
| 5 | **Koç programları etkilenmez.** `getWeekPrescription()` export edilir; koç UI'ında kullanım ayrı iş. | Koç kendi haftasını yazıyor ve programlar versiyonlu (`docs/coach-pilot.md`); otomatik dalga uygulamak koçun niyetini ezer. |

---

## 11. Diğer modüller — üretilen çıktı denetimi ve belirlemeler

**Yöntem:** Ham şablonlara bakmak yanıltıcı, çünkü `generatePlan` çalışma anında koruma katmanları uyguluyor (`limitFatLossIntensity`, `applyEvidenceBasedExerciseSafety`, `applyMedicalIntensityGuard`). Bu yüzden 6 modül × 4 seviye (+3 ev yolu) için **gerçek üretilen plan** koruma sonrası ölçüldü: aktif/dinlenme günü, HIIT-benzeri gün ve ardışıklığı, toplam set, inversiyon/nefes tutma varlığı, gün başlıkları.

**Modüller-arası ana bulgu — "gösterişli şablon + filtre → yedek gün" örüntüsü:** Yağ yakımı, yoga, reformer ve meditasyonda ham şablonlar denetim standardına uymayan içerikle yazılmış; koruma katmanı bunları siliyor ve yerine **aynı yedek listeyi** koyuyor. Sonuç: ileri seviyelerde haftada 2-3 gün birebir aynı "yedek" içerik, başlık ile içerik uyumsuzluğu ve seviyeyi yansıtmayan hacim. **Belirleme:** Koruma katmanları kalır (güvenlik ağı), ama şablonlar **doğuştan güvenli ve kademeli** yazılır; bir planda haftada **>1 yedekle değiştirilmiş gün** varsa testler başarısız olur.

### 11.1 Yağ yakımı (gym) — **ciddi: kuvvet günü 1'e düşüyor**

| Seviye | Üretilen hafta | Sorun |
|---|---|---|
| Temel | 3× aynı "Tam Vücut Kuvvet + Kolay Kardiyo" + 1 LISS + aktif toparlanma | Üç kuvvet günü **birebir aynı** (A/B/C yok); ham şablonun 4 günü yüksek etkili olduğu için hepsi yedekle değişmiş |
| Orta | 1 "Üst Vücut HIIT + Güç" + **3× LISS** + 1 "Tam Vücut Kuvvet" | `limitFatLossIntensity` ilk yoğun günü tutup diğerlerini LISS'e çeviriyor → **alt vücut kuvveti sıfır**, kuvvet seansı 2 (hedef 3-4), 45 set/hafta |
| İleri | 1 circuit + 3× LISS + 1 kuvvet | `QUALITY_PROFILES` "4 güç + 2 LISS + max 1 HIIT" diyor; üretilen **1 güç + 3 LISS + 1 circuit** — profil ile çıktı çelişiyor, 36 set/hafta |
| Usta | 1 "Güç + Kardiyo — Üst" + 3× LISS + 1 kuvvet | Aynı; Usta yağ yakımı fiilen yürüyüş programı |

**Kanıt:** Enerji açığında direnç antrenmanı yağsız kütleyi korur; ~500 kcal açık yağsız kütle kazanımını engeller ama **kuvvet korunur** [MA] [Murphy & Koehler meta-regresyon](https://portal.fis.tum.de/en/publications/energy-deficiency-impairs-resistance-training-gains-in-lean-mass-/); direnç + kalori kısıtlaması tek başına kısıtlamadan üstün [MA] [Frontiers Nutrition 2025](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1579024/full); **HIIT ≈ MICT** yağ kaybında (hacim eşitlenince) [MA] [PMC10048683](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10048683/), [Keating 2017](https://pubmed.ncbi.nlm.nih.gov/30765340/). Yani kuvvet **çekirdek**, HIIT **opsiyonel**.

**Belirleme (yeniden yazım, `PLAN_VERSION 23`):**
- Yağ yakımı kas modülünün **slot/dalga motorunu** paylaşır (`strength_primary` 3×5 kuvvet koruma, `hypertrophy_compound` 8-12; `pump` yok).
- Temel: 3 tam vücut kuvvet (**A/B/C farklı**) + 2 LISS (30-40 dk) + 2 dinlenme. HIIT yok.
- Orta: Üst/Alt/Üst/Alt kuvvet (4) + 2 LISS + **1 düşük etkili interval** (bisiklet/kürek, zıplama yok) — Pazar dinlenme.
- İleri: 4 kuvvet (U/L) + 2 LISS + ≤1 HIIT (zemin etkili değil: assault bike/kürek/ski erg).
- Usta: 4 kuvvet (A günleri `strength_primary` dalgası ile kuvvet koruma) + kondisyon **dalgası** (W1-3 artan, W4 deload) + 1 LISS. "Filthy Fifty"/100 push-up finisher'ları **kaldırılır** (yorgunluk kontrolsüz).
- `limitFatLossIntensity` **kalır**; yeni şablonlarda hiç tetiklenmemesi test edilir.
- Validator: faz ≥1'de kuvvet seansı ≥3; alt vücut kuvvet ≥1; ardışık HIIT yok (mevcut test korunur).

### 11.2 Yoga — **İleri/Usta içerik yedeklere çöküyor**

Üretilen: İleri Pazartesi ve Usta'nın **5 gününün 3'ü** aynı "Güvenli Beceri Hazırlığı + Mobilite" (Dolphin Prep, Wall Shoulder Opener, Supported Bridge, Legs Up The Wall). Başlıklar "İleri İnversiyon / İleri Pranayama / Yaratıcı Akış" olarak kalıyor ama içerik 4 hareketlik yedek. "Full Ashtanga 90 dk" → "Kişisel Vinyasa Akışı 45 dk" tek satır.

**Kanıt:** Yoga yaralanmaları çoğunlukla hafif, aşırı hızlı ilerleme ve forma bağlı; gözetimsiz inversiyon/nefes tutma kaçınılmalı (NCCIH, mevcut denetim); haftada 2-3 seans etkili doz, kuvvet değişimi 5-8 haftada [DR] [Frontiers Public Health 2021](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2021.702793/pdf).

**Belirleme (`PLAN_VERSION 24`):** `UNSUPERVISED_YOGA_EXTREME` filtresi **kalır**; İleri/Usta şablonları **izinli envanterden** yeniden yazılır: kol dengeleri (crow varyantları, side crow, eight-angle, firefly — filtrede değil), backbend progresyonu (wheel/camel/bow, regresyon alanı ile), uzun tutuşlar, Ashtanga Primary 60 dk, nefes çalışması **tutmasız** (nadi shodhana, bhramari, ujjayi), yin. Her gün ≥4 farklı hareket; haftada ≤1 yedek gün; her ileri poza `regressionOption` alanı (duvar/blok).

### 11.3 Pilates — küçük düzeltmeler

Üretilen çıktı düzgün (5 gün, Temel/Orta yedek karışımı makul). Bulgular: İleri'de "Hundred → Roll Up → Rollover" ve Jackknife kalıyor (tasarım gereği faz ≥2 serbest) — boyun/bel regresyon notu yok; Usta günleri "45 dk akış / 20 dk seri" **tek satırlık bloklar** (20 set, yapı yok).

**Kanıt:** Pilates core kuvvetini artırır, bel ağrısında 2-3 seans/50 dk/8-12 hafta desteklenir (mevcut denetim); reformer dış yük sayesinde hipertrofi için mat'ten avantajlı, mat'in yağsız kütle etkisi minimal [DR] [Medical News Today derlemesi](https://www.medicalnewstoday.com/articles/reformer-vs-mat-pilates).

**Belirleme:** İleri/Usta tek-satır akışlar 4-5 adlandırılmış bloğa bölünür; Rollover/Jackknife/Neck Pull'a `regressionOption` eklenir; başka değişiklik yok.

### 11.4 Reformer — **Orta seviye 3 gün aynı yedek**

Üretilen: Orta'nın Pazartesi/Cuma/Cumartesi günleri "Kontrollü Reformer Progresyonu" (`reformerMasterOnly` yedeği), çünkü Long Spine, Semi Circle, Russian Split, Snake, Control Balance `REFORMER_REMOTE_EXTREME` listesinde. Usta Salı "Reformer-Only Master" yedeği; Tower/Wunda ekipman seçimi olmadığı için zaten gizleniyor (doğru).

**Belirleme:** Filtre kalır; Orta/İleri/Usta **izinli envanterden** yeniden yazılır (footwork varyantları, feet in straps, stomach massage serisi, short box serisi, long box pulling straps, knee stretch, elephant, mermaid, side splits, chest expansion, arm serisi, jump board faz ≥2, tek bacak işler). Tower/Cadillac/Wunda şablonları `equipment` bayrağıyla ayrılır ve ekipman sorusu gelene kadar üretilmez.

### 11.5 Meditasyon — **başlık ≠ içerik**

Koruma katmanı her günü `MEDITATION_SAFE_PRACTICES`'ten tek pratiğe (8/15/25/35 dk) indiriyor ama **gün başlığını değiştirmiyor**: Orta Salı başlığı "Chakra Dengeleme", içerik "Vücut Taraması"; Usta "Transandantal" → "Açık Farkındalık"; "Kozmik", "Ses & Titreşim", "Wim Hof" başlıkları da içeriksiz. Dinlenme günleri Perşembe+Pazar, 5 pratik/hafta — uygun.

**Kanıt:** Doz-yanıt kanıtı zayıf; yeni başlayanlarda 5-20 dk seanslar en iyi uyum ve ruh hali; tutarlılık süreden önemli [DR] [ClinicalTrials NCT06378450](https://clinicaltrials.gov/study/NCT06378450), [Psychology Today özeti](https://www.psychologytoday.com/gb/blog/find-your-path-thriving-life/202209/how-much-should-i-meditate).

**Belirleme:** Ham şablonlar `MEDITATION_SAFE_PRACTICES` ile **birebir** yeniden yazılır (başlık = pratik adı); kanıtsız/riskli etiketler (chakra, binaural, TM, Wim Hof, 60 dk sessizlik taahhüdü) kaldırılır; süre progresyonu 8→15→25→35 korunur; her seviyede 5 dk "kısa gün" regresyonu eklenir.

### 11.6 Ev yolları — sorun yok (kapsam dışı)

`muscle`/`fat_loss` × `home_basic`/`home_bodyweight` × 4 seviye üretildi: 3→4→5 gün kademeli, A/B/C varyasyonlu, ardışık HIIT yok, "Düşük Etkili Interval" tek gün. Değişiklik önerilmiyor.

### 11.7 Modüller-arası validator kuralları (Bölüm 7'ye ek)

- Haftada **≤1** yedekle değiştirilmiş gün (üretim sırasında işaretlenir: `day.replacedByGuard = true`).
- Gün başlığı içerikle uyumlu: koruma bir günün içeriğini değiştiriyorsa **başlığı da** değiştirmeli (meditasyon hatası).
- Bir haftada iki gün birebir aynı egzersiz listesi olamaz (şablon `repeatOf: 'A'` ile açıkça belirtmedikçe).
- Her aktif günde ≥3 farklı hareket (meditasyon ve `singleSession: true` ile işaretli akış günleri hariç).
- `QUALITY_PROFILES.weeklyTarget` ile üretilen haftanın kuvvet/LISS/HIIT sayıları tutarlı olmalı (yağ yakımı hatası).

---

## 12. Ahmet için uygulama spesifikasyonu

Sıra kullanıcı etkisine göre: önce kas (şikayet), sonra yağ yakımı (en ciddi doğruluk hatası), sonra wellness modülleri, en son yük takibi. Her görevin **kabul kriteri** test olarak yazılır; kriter geçmeden `PLAN_VERSION` artırılmaz.

### PR-1 — Kas modülü: Slot + Dalga motoru ve 4 seviye (`PLAN_VERSION 22`)

| # | Görev | Dosya | Kabul kriteri |
|---|---|---|---|
| 1.1 | `slot` alanı ve `WAVE_TABLE` + `getWeekPrescription(exercise, goal, phase, weekInPhase)` | yeni `src/data/waveTable.js` | Slot'suz egzersiz → `hypertrophy_compound` varsayılır; W4/W8 toplam set ≤ %55 × W3; tablo 4 faz × 6 slot × 8 hafta eksiksiz; `waveTable.test.js` |
| 1.2 | `applyExperienceModifiers` slot-duyarlı (`strength_primary` setMult'tan muaf; beginner 3×5 sabit) | `planGenerator.js` | Beginner planında kuvvet slotu 3 set kalır |
| 1.3 | `applyTrainingDays` slot-öncelikli seçim | `planGenerator.js` | 3/4/5 gün seçiminde ≥1 Kuvvet Üst + ≥1 Kuvvet Alt günü korunur (`planGenerator.test.js`) |
| 1.4 | `buildThreeDayStrengthWeek` faz-duyarlı + `strength_primary` ilk hareket | `planGenerator.js` | 3 gün planında her seansta 1 kuvvet slotu |
| 1.5 | 4 seviye şablonu Bölüm 4'e göre; `getFocusMuscleCategory`'ye "kuvvet üst/alt", "push (makine)" anahtar kelimeleri **tekil-kas kontrollerinden önce** | `planGenerator.js` | Bölüm 7 validator testleri: faz ≥1'de ≥2 kuvvet günü, SBD ≥1 ağır + ≥1 varyant, ardışık omurga yükü yok, kas başına set K5 aralığında (odak sonrası dahil) |
| 1.6 | Yeni hareketler için `EXERCISE_MUSCLE_MAP`, `FOCUS_ALLOWED_MUSCLES`, `HEALTH_EXERCISE_FILTERS` (Bölüm 6.3 #1, #2, #5) | `planGenerator.js` | `validateAndFixExercises` hiçbir şablon egzersizini elemez (test: üretilen = şablon) |
| 1.7 | Alias tablosu: videosu olmayan hareket → videolu muadil (Bölüm 6.2); **Hack ↔ Smith** çift yönlü | `exerciseVideoMap.js`, yeni `exerciseAliases.js` | `exerciseVideos.test.js`: her gym şablon egzersizi video **veya** alias'a sahip |
| 1.8 | `exerciseDatabase.js` form ipuçları (yeni hareketler), `focusMap` EN/ES, `localizeExerciseEntry` token'ları (Top set, Back-off, AMRAP, FST-7, RIR, %) | `exerciseDatabase.js`, `planGenerator.js` | 3 dil Türkçe sızıntı testi 0 (Haziran kontrolü kalıcı test olur) |
| 1.9 | `WorkoutPanel`: "Hafta n/8 · Blok" rozeti, slot etiketi, haftalık reçete render; log'a `weekInPhase` + `prescribed` | `WorkoutPanel.jsx` | `WorkoutPanel.test.jsx`: W1 ve W7 farklı set/tekrar gösterir; log kaydında alanlar var |
| 1.10 | `workoutAdaptation` → dalga etkisi (reduce/hold/progress, Bölüm 3.4) | `workoutAdaptation.js` | `workoutAdaptation.test.js` üç aksiyon |
| 1.11 | `QUALITY_PROFILES.muscle` metinleri: double progression + dalga; C1 RIR reçeteleri; Usta W8 test haftası metni | `planGenerator.js` | Metinler 3 dilde |
| 1.12 | Öncelik-1 video üretimi (Smith squat/incline, hip abd, hip add, seated leg curl, cable lateral raise) | `marketing/exercise-videos/studio3d/exercises` | Orta/İleri şablonunda alias ihtiyacı 0; Usta'da ≤3 |
| 1.13 | Cihaz QA 320/390/1280 × TR/EN/ES × 3/4/5 gün × odak bölge × sağlık filtreleri; `PLAN_VERSION 22` | `planVersion.js`, `output/` | `npm test` yeşil; ekran görüntüsü seti |

### PR-2 — Yağ yakımı yeniden yazımı (`PLAN_VERSION 23`)

| # | Görev | Kabul kriteri |
|---|---|---|
| 2.1 | 4 seviye şablonu Bölüm 11.1'e göre; slot/dalga paylaşımı (`pump` yok) | Faz ≥1'de kuvvet seansı ≥3 ve alt vücut kuvvet ≥1; `limitFatLossIntensity` **hiç tetiklenmez** (test: üretilen = şablon); mevcut "max 1 HIIT" ve "beginner low impact" testleri geçer |
| 2.2 | Temel A/B/C farklı tam vücut; tek satır finisher'lar kaldırıldı | Haftada birebir aynı iki gün yok |
| 2.3 | `QUALITY_PROFILES.fat_loss.weeklyTarget` ile üretilen hafta sayımı tutarlı | Validator 11.7 |

### PR-3 — Wellness modülleri temizliği (`PLAN_VERSION 24`)

| # | Görev | Kabul kriteri |
|---|---|---|
| 3.1 | Yoga İleri/Usta şablonları izinli envanterden (Bölüm 11.2) | Haftada ≤1 yedek gün; her gün ≥4 hareket; `UNSUPERVISED_YOGA_EXTREME` filtresi tetiklenmez |
| 3.2 | Reformer Orta/İleri/Usta izinli envanterden; Tower/Wunda `equipment` bayrağı | Orta'da yedek gün 0; ekipman seçimi yokken tower/chair üretilmez (mevcut test) |
| 3.3 | Meditasyon şablonları `MEDITATION_SAFE_PRACTICES` ile birebir; kanıtsız başlıklar kaldırıldı; 5 dk regresyon | Başlık = pratik adı (test); süre progresyonu 8/15/25/35 |
| 3.4 | Pilates İleri/Usta akışları 4-5 bloğa bölünür; Rollover/Jackknife/Neck Pull regresyon alanı | Usta günlerinde ≥4 hareket |
| 3.5 | Koruma katmanları `day.replacedByGuard` işaretler; validator 11.7 testleri | Tüm modüllerde haftada ≤1 işaretli gün |

### PR-4 — Yük takibi C2

| # | Görev | Kabul kriteri |
|---|---|---|
| 4.1 | `WorkoutPanel` set bazında ağırlık + tekrar girişi (koç bileşeni yeniden kullanılır) | Log'da `weight > 0` yazılabiliyor; boş bırakılırsa eski davranış |
| 4.2 | `lib/strengthProgress.js`: hareket bazında e1RM (Epley), geçmiş, `strength_primary` için yük önerisi (2.5 kg yuvarlama) | Birim testleri; e1RM yoksa RIR reçetesine düşer |
| 4.3 | Usta W8 AMRAP → e1RM bootstrap | Test haftası sonrası sonraki faz %1RM ile başlar |
| 4.4 | Progress sekmesi "Kuvvet" grafiği (SBD e1RM) + vücut ağırlığı oranı rozeti | 3 dil; mobil 320 px taşma yok |

### Canlıya alma kuralı (tekrar)
Her PR kendi `PLAN_VERSION` artışıyla gider; Bölüm 9 adımları (QA, review, 2 hafta `perceivedExertion`/`painReported` izleme, geri alma commit'i) her PR için ayrı uygulanır.

---

## 13. Kaynaklar

**Meta-analiz / derleme**
- Grgic J. ve ark., periyodizasyon ve hipertrofi: https://pmc.ncbi.nlm.nih.gov/articles/PMC5571788 · PeerJ: https://peerj.com/articles/3695 · PubMed 28848690: https://www.pubmed.ncbi.nlm.nih.gov/28848690/
- Schoenfeld ve ark. 2017, yük ve kuvvet/hipertrofi: https://pubmed.ncbi.nlm.nih.gov/28834797/
- Haugen ve ark. 2023, makine vs serbest ağırlık: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10426227/
- Failure'a yakınlık (RIR) 2024 ön baskı: https://sportrxiv.org/index.php/server/preprint/download/343/705/647 · PMC8762534: https://pmc.ncbi.nlm.nih.gov/articles/PMC8762534
- Frekans, hacim eşitlenmiş: https://pmc.ncbi.nlm.nih.gov/articles/PMC6724585 · Henselmans: https://mennohenselmans.com/this-is-how-to-maximize-muscle-according-to-67-studies/
- Dinlenme aralığı 2024 Bayes meta-analizi (özet): https://barbend.com/9-study-meta-analysis-optimal-rest-time-between-sets
- Deload derlemesi, Sports Med Open 2024: https://link.springer.com/article/10.1186/s40798-024-00691-y · Frontiers 2022: https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2022.1073223/epub
- ACSM 2026 pozisyon bildirimi: https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/

**Uzman / pratisyen**
- RP hacim yer işaretleri: https://rpstrength.com/training-volume-landmarks-muscle-growth/
- Blok periyodizasyon: https://elitefts.com/blogs/powerlifting/block-periodization-in-the-sport-of-powerlifting · https://fitnessvolt.com/powerlifting/guides/training-periodization-guide/
- PHAT: https://www.strengthlog.com/phat-workout-routine/ · nSuns/Texas/5-3-1 karşılaştırma: https://fitnessvolt.com/powerlifting/programs/ · https://muscleevo.net/nsuns-program/
- FST-7: https://barbend.com/fst7/ · https://fitnessvolt.com/fst-7-workout-guide/ · Yates: https://www.setforset.com/blogs/news/dorian-yates-workout
- Pec deck / makine EMG: https://fit-pro.com/article-3173-Ace-study-tests-common-chest-exercises.html · https://www.barbellmedicine.com/blog/pec-deck-machine-fly-hypertrophy/ · lat pulldown: https://www.barbellmedicine.com/blog/lat-pulldown-hypertrophy/
- Hack/pendulum (satıcı kaynak, dikkat): https://www.soletreadmills.com/blogs/news/hack-squat-vs-pendulum-squat-muscles-worked-benefits-compared · https://setgraph.app/articles/pendulum-squat-guide-benefits-muscles-worked-and-proper-form
- Kuvvet standartları: https://strengthlevel.com/powerlifting-standards/kg · https://www.strengthlog.com/squat-strength-standards-kg/
- Deload pratik verisi: https://arvo.guru/de/blog/deload-weeks-recovery-data

**Diğer modüller**
- Enerji açığı ve direnç antrenmanı (meta-regresyon): https://portal.fis.tum.de/en/publications/energy-deficiency-impairs-resistance-training-gains-in-lean-mass-/ · RT + kalori kısıtlaması 2025: https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1579024/full
- HIIT vs MICT yağ kaybı: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10048683/ · Keating 2017: https://pubmed.ncbi.nlm.nih.gov/30765340/
- Yoga doz ve güvenlik: https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2021.702793/pdf · yaralanma: https://www.spine-health.com/blog/yoga-poses-may-trigger-injury-and-pain
- Pilates reformer vs mat: https://www.medicalnewstoday.com/articles/reformer-vs-mat-pilates
- Meditasyon doz-yanıt: https://clinicaltrials.gov/study/NCT06378450 · https://www.psychologytoday.com/gb/blog/find-your-path-thriving-life/202209/how-much-should-i-meditate
- TR salon ekipman örneği (GTÜ Tesis Ekipmanları 2025): https://www.gtu.edu.tr/fileman/Files/UserFiles/sks/TES%C4%B0S%20EK%C4%B0PMANLARI%202025.pdf

**Proje içi**
- `docs/training-program-quality-audit.md` (2026-08-14) · `docs/coach-pilot.md` · `src/data/planGenerator.js` · `src/data/focusAreas.js` · `src/data/workoutAdaptation.js` · `src/data/exerciseVideoMap.js`
