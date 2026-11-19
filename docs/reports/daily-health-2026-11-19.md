Destek: açık talep yok

# Günlük denetim — 19 Kasım 2026, kısmi dış ölçüm

Open/reviewing ve son24saat destek sorgusu boş;yanıt/kapama yapılmadı. Çalışma ağacındaki public/llms.txt kullanıcı değişikliği korundu. W47 haftalık bölüm17Kasım'da dış ölçüm sınırlarıyla tamamlandı;tekrarlanmadı.

## Kayıt ve 500 hedefi

Europe/Istanbul tamamlanmış dönemler,adminhariç. Toplam **446 üye,%89,2**,kalan54. Stok devam eden günü içerebilir;dönemler içermez.

| Dönem | Kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 18 Kasım | 3 | 3 | 3 |
| 16–18 Kasım | 10 | 10 | 6 |
| 12–18 Kasım | 21 | 21 | 14 |

Son2gün8kayıt/ortalama4;son3gün10/ortalama3,33. HaftalıkEN+ES **%66,7**. Son doğrulanmış eşiğe göre bugün zorunlu yeni iyileştirme tetiklenmiyor. Mevcut plan mevcudiyeti aynı gün aktivasyonu değildir;arayüz dili ülke veya kesin ilk giriş dili değildir. Stok farkından dönem kaydı türetilmedi.

## Antrenman ve challenge

Kimliğe bağlı growth_events,adminhariç,12–18Kasım:

- Workout_session_started19olay/10benzersizüye:today_focus14/9,workout_panel5/3;gruplar çakışabilir.
- Guided completed4olay/4üye;quick completed0raporlananolay. Birleşik4tamamlayan/10başlatan = **%40dönemkullanıcıoranı**;4/19=%21,1olayoranı. Eşleşmişseans dönüşümü değildir;aynı üyenin farklı seans/tarihleri bulunabilir. %30altı kullanıcı oranı eşiği bu pencerede tetiklenmedi;nedensel başarı iddiası yok.
- Workout_completed source workout_session4/4;workout_panel0raporlananolay. Workout_logs.date aralığında5benzersizüye;logs ve olay kapsamları farklı,aralarındaki farktan hata çıkarılmadı.
- Start28 kesin challengeId filtresi:today viewed65olay/26üye,joined10olay/9benzersizüye. Challenge_landing viewed ve start28 completed/shared0raporlananolay. Başka challenge'lardaki walk_30/workout_intense completed olaylarıstart28sayılmadı. Kart bağlamı kamu page_view değildir;9/26ile ziyaretçi dönüşümü hesaplanmadı.

Çıkış/landing_cta_click sorgusu **Transport send error** bağlantı hatasıyla başarısız oldu. Aynı erişim sorunu art arda denenmedi veya başka yolla aşılmadı. Bu nedenle güncel terk noktaları,blogCTAsonucu,kaynak/ilklanding,günlükdetayolaylar ve geri dönüş tam denetimi eksik. Eksik değer0sayılmadı. Bazı sorguların çalışması tüm ölçüm bağlantısının düzeldiğini kanıtlamaz.

## Canlı ve dış ölçümler

Tarayıcı denetim yüzeyi hâlâ yok;15Kasım kamuHTTP403Cloudflare erişim sorununun değiştiğine dair kanıt yok. Değişmeyen başarısız yol tekrar zorlanmadı;403sitekesintisi sayılmadı. Ana sayfa,EN/ES,kayıt/giriş,uygulama,sitemap/robots bugün canlı doğrulanmış gibi sunulmadı. Son başarılı tarayıcı kontrolü14Kasım;canlırender hâlâ eksik. Uygulamada beyaz ekran/kayıt/ölçüm kodu hatası bulunduğu iddia edilmedi.

YeniGA/GSCyok;eksik veri sıfır trafik değildir. SonGA14Kasım okuması7–13Kasım131oturum/103etkileşimli/1853olay/8tümönemlifaaliyet;bugünün yeni verisi veya kesin signup_completed değil. ÖncekiGSC6Kasım ayrıntı reddi tekrar zorlanmadı. Son28Ekim–3Kasım36tık/1083gösterim/%3,3CTR/12,1konum;fullbalance3/109,evdedambılilespor1/10;dambılsayfası6/224,/en6/142,tekdambılblogu6/55,Pilates1/130 tarihli. Güncel sorgu-sayfa analizi ve yeni blog indeks doğrulaması alınamadı;eski sayılardan düşüş/başarı hükmü çıkarılmadı.

## Deney kararları

1. **20Ekim içerikleri:** yedi sorgu karşılaştırmasının son5Kasım raporu20Ekim–2Kasım14gün/22Eylül–19Ekim28gün pencerelerine ait;farklı süre toplamları büyüme yüzdesi değildir. Tarihli30günlükPilates0/161konum8,6;30günlükdambıl0/50konum5,8;evdePilatesücretsiz0/43konum7,5. Evde-kas-yapilir-mi3Kasım indeksli doğrulaması son referans;gereksiz indeks isteği yok.
2. **Starter14Kasım:** ilk15–17Kasım üçtamgün doldu;bugün dönem toplamı ölçüldü fakat starter özel sonucun/terk noktasının eksikliğiyle nedensel değerlendirme yapılmadı. Yalnız güncel%40dönem kullanıcı oranından starter etkisi çıkarılmadı;tekrar düzenleme yok.
3. **Start28/Pilates4Kasım:**18Kasım koruma takvimi doldu;bu otomatik değiştirme talimatı değil. YeniGSCziyaret/CTR/konum ve önceki28güntabanı eksik olduğundan sayfalar korunuyor.153gösterim/0tık/8,6Pilatesreferansı tam28gün gibi sunulmadı. Challengekamuziyareti/ilklandingkayıtları bugün okunamadı,sıfırsayılmadı.
4. **Fiyat karşılaştırması:** üçpricingziyaret/landingkayıt güncellemesi eksik,sıfırsayılmadı. storePrices4Kasım tarihli; **4Aralık'ta ve ayda bir resmiAppStore doğrulaması** gerekli. Fiyat tahmini/değişikliği yok.
5. **BlogCTA15Kasım:**16–18Kasım üçtamgün doldu. Yeni placement tıklama sorgusu erişim hatası verdi;asgari bekleme doldu diye kanıtsız değiştirme yok. İlk7tamgün16–22Kasım sürüyor. Anonim kuyruğun kimlik sonrası aktarımı nedeniyle olay yokluğu tam ziyaretçi davranışı değildir. Canlı render doğrulaması hâlâ eksik.
6. **Google8Kasım:**9–15Kasım7tamgün sonucu17Kasım'da değerlendirildi:providerGoogle16/24=%66,7,email8;taban1–7KasımGoogle4/25=%16. Niyet olaylarıyla karıştırılmadı;aynıdönemEN/ESrestorasyonu nedeniyle nedensellik yok. Bugün yeniGoogle/retentionkohortu ölçülmedi;eskisonuç güncellenmiş sayılmadı.

## Sonuç

Kayıt ve yabancı dil eşikleri bugün doğrulanan pencerede karşılanıyor. Yeni kod/deney/yayın yapılmadı. Güncel eksik ölçümler sıfır sayılmadı;teknik canlı sağlık tam onaylanamadı. Test/build yeniden çalıştırılmadı;15Kasım586test/84dosya,buildbaşarısı ve genellint594mevcuthata tarihli referans. Yalnız bu rapor/hafıza kaydedildi;erişim düzelince önce olgunlaşmış blog/starter pencereleri ve koruması dolmuşPilates/challenge için dış ölçüm tamamlanacak.
