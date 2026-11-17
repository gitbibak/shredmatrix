Destek: açık talep yok

# Günlük ve haftalık denetim — 17 Kasım 2026, W47

Open/reviewing ve son 24 saat sorgusu boş. Yanıt/kapama yapılmadı. Çalışma ağacı kontrol edildi; public/llms.txt ve ilgisiz kullanıcı dosyaları korundu. Dün kesilen Supabase sorguları bugün başarıyla döndü. Haftalık bölüm bu ana görevde çalıştırıldı; erişilemeyen dış ölçümler aşağıda açıkça işaretlendi.

## Günlük kayıt ve hedef

Europe/Istanbul tamamlanmış dönemler, admin profilleri hariç. Toplam **437 üye — %87,4**, kalan63. Stok devam eden günü içerebilir.

| Dönem | Kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 16 Kasım | 2 | 2 | 1 |
| 14–16 Kasım | 7 | 7 | 5 |
| 10–16 Kasım | 23 | 23 | 19 |

Son2gün5kayıt/ortalama **2,5**;son3gün7/ortalama **2,33**: iyileştirme eşiği altında. Haftalık EN+ES **%82,6**. Mevcut plan stoku aynı gün aktivasyonu değildir; dil ülke veya ilk giriş dilinin kesin kanıtı değildir.

## Haftalık 7/30 gün

7gün10–16Kasım,30gün18Ekim–16Kasım. Pencereler örtüşür; eşit uzunlukta bağımsız önce/sonra karşılaştırması değildir.

| Ölçüm | 7 gün | 30 gün |
|---|---:|---:|
| Yeni kayıt | 23 | 121 |
| Günlük ortalama | 3,29 | 4,03 |
| 16 Kasım sonuna kadar planı olan yeni üye | 23 | 115 |
| EN / ES / TR | 18 / 1 / 4 | 84 / 5 / 32 |
| EN+ES payı | %82,6 | %73,6 |
| Tam ertesi gün olayda dönüş | 1/21 (%4,8) | 17/119 (%14,3) |
| Tam 7. gün olayda dönüş | Henüz uygun kohort yok | 1/98 (%1,0) |

D1/D7: kayıt İstanbul takvim tarihinden tam1/7gün sonra herhangi bir growth_events.user_id olayı; ilgili dönüş günü16Kasım sonuna kadar tamamlanmış payda. Admin hariç. Bu, kimliğe bağlı olayların kapsadığı geri dönüş sinyalidir; anlamlı kullanımın kesin ölçümü veya izin/kimlik dışında kullanım yokluğu değildir. HaftalıkD7 henüz olgunlaşmadığından0başarı sayılmadı.

Kaynak ve ilk açılış atfı weekly sorgusunda first_source/first_landing_page, yoksa acquisition_source/landing_path önceliğiyle:7gün chatgpt.com18/18plan,google4/4,direct1/1;30gün83/78,20/20,18/17. İlk landing7gün /en9,root6,ENfotoğrafaracı4,ES1,ENreviews1,ENekipmansız1,TR30günlükspor1.30gün /en45/41plan,root38/37,ENfotoğrafaracı19/18,dambıl5/5,diğer14kayıt. Ziyaretçi paydası olmadan açılış sayfası dönüşümü hesaplanmadı. Günlük landing_path-only sorgusunda root5 ve /auth1 ayrımı vardı;ilk-landing fallback yöntemleri birleştirilip tutarsız büyüme sonucu çıkarılmadı.

Güçlü aşama plan oluşması; zayıf sinyal kayıt sonrası geri dönüş. D1 tek olaya ve küçük haftalık kohorta duyarlı; ülke tahmini yapılmadı.

## Tamamlanan Google kayıt penceresi

Auth provider'ın auth.users.raw_app_meta_data.provider alanından yalnız toplu sayım: **9–15Kasım24kayıt:Google16(%66,7),email8**; karşılaştırma1–7Kasım25kayıt:Google4(%16),email21. Google kayıtlarının tümünde pencere sonuna kadar plan var. Google grubunda olgunlaşmışD1 son pencerede0/16,tabanda1/4;çok küçük ve olay kapsamlı kohorttan nedensel zarar/başarı hükmü çıkarılmaz.

Bu provider sayımları signup_completed niyet olaylarından farklı yöntemdir; önceki6günlük21olay veya5günlük19olayla birbirine karıştırılmadı. Aynı dönemde EN/ES restorasyonu ve farklı kaynak karması vardı. Google seçeneğini üste taşımanın tek başına kayıt artışına neden olduğu kanıtlanmadı. Arayüz tekrar değiştirilmedi;takipte kayıt sonrası geri dönüş öncelikli.

## Güncel deney olayları

- **Antrenman10–16Kasım:** started18olay/10üye;today_focus11/9,workout_panel7/3. Guided completed4olay/3üye,quick1/1;birleşik5olay/3benzersizüye. Dönem kullanıcı oranı%30,eşleşmişseans dönüşümü değil. workout_completed source workout_session4/3,workout_panel1/1;workout_logs.date3üye.16Kasım1başlatma/1üye,1guidedtamamlama/1üye. Çıkışnone5olay/4üye,25_49bir,50_74bir;save_failedyok. İlk set öncesi çıkış kalıcı terk/kanıtlanmışneden değildir.
- **14Kasımstarter/reminder:**15–16Kasım iki tam günde starter=true1başlatma/1üye,1guidedtamamlama/1üye. Örneklem çok küçük;üçüncü tam gün17Kasım henüz bitmedi. Aynı ilk değer hipotezi bugün tekrar düzenlenmedi.
- **start28:** kesin challengeId filtresi10–16Kasım todayviewed61olay/27üye,joined4/4.16Kasımviewed5/5,katılım0. challenge_landing viewed ve start28completed/shared0. Diğerchallenge'lara ait walk_30/workout_intense completed olayları start28 sayılmadı. Üçlandingkayıt0. **18Kasım öncesi sayfalar korunuyor**.
- **BlogCTA15Kasım:**16Kasım ilk tam gün;blog_*_index_hero/footer için kimliğe bağlı landing_cta_click yok. Anonim kuyruğun yalnız kimlik bağlantısından sonra yüklenmesi nedeniyle bu, hiç tıklama/ziyaret olmadığı anlamına gelmez. Üç tam gün16–18Kasım,7gün16–22Kasım henüz dolmadı;yeniden değiştirme yok. Canlı render doğrulaması aşağıdaki erişim sınırı nedeniyle hâlâ eksik.
- **Fiyat:** üçpricingilklandingkayıt0;güncelGAziyaret eksik,sıfırsayılmadı. storePrices4Kasım tarihli; **4Aralık'ta ve ayda bir resmiAppStore doğrulaması** gerekli. Fiyat tahmini yok.

## Canlı, GA/GSC ve içerik sınırlamaları

Bu oturumda tarayıcı denetim aracı hâlâ yok;15Kasım kamuHTTP403Cloudflare erişim hatasının değiştiğine dair kanıt yok. Değişmeyen başarısız yol tekrar denenmedi/aşılmadı;403sitekesintisi kanıtı değil. Ana sayfa,EN/ES,kayıt/giriş,oturumlu uygulama,sitemap/robots bugün doğrulanmış sayılmadı. Son başarılı tarayıcı kontrolü14Kasım;son kendiCloudflareyayını15Kasım3f5b5d46-2ac6-406a-89c4-c035c8204804, kontrol düzlemi başarılı ama rendereksik.

YeniGA4/GSCverisi yok;eksik ölçüm sıfırtrafik değil. SonGA14Kasım okuması7–13Kasım131oturum/103etkileşimli/1853olay/8tümönemlifaaliyet;güncel7/30veri değil. GSC6Kasım önceki ayrıntı reddi zorlanmadı;son28Ekim–3Kasım36tık/1083gösterim/%3,3CTR/12,1konum,fullbalance3/109,evdedambılilespor1/10;dambılsayfası6/224,/en6/142,tekdambılblogu6/55,Pilates1/130 tarihli. HaftalıkGSC7/30sorgu-sayfa dönüşüm analizi erişim nedeniyle eksik.

20Ekim yedi sorgu için son5Kasımraporu20Ekim–2Kasım14gün/22Eylül–19Ekim28gün;farklı süre toplamları büyüme yüzdesi değildir. Tarihli30günlükPilates0/161konum8,6;30günlükdambıl0/50konum5,8;evdePilatesücretsiz0/43konum7,5. İki blogun önceki performansı ve evde-kas-yapilir-mi3Kasım indeksli doğrulaması son referans. Bugün yeni indeks kontrolü/isteği yok. Pilates4Kasım başlık için tamönceki28gün ve yeniCTR/konum eksik;153gösterim/0tık/8,6referansı tam28gün değildir.18Kasımkorumasısürüyor.

## Karar ve doğrulama

Kayıt ortalaması eşik altında;15Kasım blog görünürlüğü müdahalesi bunun için yayında ve yalnız bir tam gün gördü. Aynı dönemde starter deneyi iki tam gün gördü. Asgari3tamgün kuralını bozarak veya ölçülmemiş bir kök neden uydurarak ikinci düzenleme yapılmadı. **Bugün ek büyüme müdahalesi uygulanmadı;eşik sorunu kapanmış sayılmadı.** En erken blog3gün penceresi18Kasım sonunda değerlendirilecek;yarın koruma süresi dolan sayfalarda da yalnız yeni kanıt varsa karar verilecek.

Uygulama ölçümü bozuk olduğuna dair kanıt yok;dünkü araç bağlantısı bugün toparlandı. Mevcut erişim eksikleri nedeniyle canlı/GA/GSC'nin tam sağlığı onaylanamadı. Test/build/yayın bugün yok.15Kasım586test/84dosya ve buildbaşarısı,genellint594mevcut hata tarihli referans. Yalnız bu günlük+haftalık rapor ve W47tamamlanma hafızası kaydedildi;haftalık dış ölçüm eksikleri açık kaldı.
