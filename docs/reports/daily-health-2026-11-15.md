Destek: açık talep yok

# Günlük denetim — 15 Kasım 2026

Open/reviewing ve son24saat sorgusu boş; yanıt/kapama yapılmadı. public/llms.txt kullanıcı değişikliği ve ilgisiz dosyalar korundu. W46 haftalık bölüm10Kasım'da tamamlandı; tekrarlanmadı. Çalışma23:35İstanbul civarında tetiklendi; devam eden15Kasım tamamlanmış gün sayılmadı.

## Kayıt ve karar

Admin hariç,Europe/Istanbul. Toplam **434 üye,%86,8**,kalan66; stok devam eden günü içerebilir.

| Dönem | Kayıt | Mevcut planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 14 Kasım | 2 | 2 | 2 |
| 12–14 Kasım | 8 | 8 | 6 |
| 8–14 Kasım | 28 | 28 | 24 |

Son2gün6kayıt/ortalama3,son3gün8/ortalama **2,67**:iyileştirme zorunluluğu tetiklendi. HaftalıkEN23/ES1/TR4,EN+ES **%85,7**. Mevcut plan stoku aynı gün aktivasyonu değil; dil ülke veya kesin ilk giriş dili değil. Profil kaynak atfı chatgpt.com20,google6,direct2; kesin nedensellik/ziyaretçi dönüşümü çıkarılmadı. İlk landing /en14,root5,ENfotoğrafaracı4,diğer5;blog yollarından atfedilen kayıt yok. Blog ziyaretçi paydası bilinmediğinden dönüşüm oranı hesaplanmadı.

## Tek iyileştirme — blog listesindeki kayıt bağlantısının görünürlüğü

BlogIndex'te ücretsiz kayıt bağlantısı zaten bütün makalelerden sonra footer'daydı. Aynı yerelleştirilmiş bağlantı makalelerden önce hero içine de eklendi. Bu, eksik kayıt yolunu onarma değil, mevcut yolun keşfedilmesini kolaylaştıran dar bir hipotezdir. Düşüşün kanıtlanmış nedeni olduğu veya yüksek hacimli fırsat olduğu iddia edilmedi; güncelGSC ve ziyaretçi paydası yok.

TR/EN/ES dil ve kayıt niyeti korunuyor. Mevcut footer kaldı. Üst/alt bağlantılar mevcut landing_cta_click ve acquisition_content ile blog_{lang}_index_hero/footer olarak ayrılıyor. Önceki ilk kaynak/içerik atfı silinmiyor. Yeni özellik,makale içeriği,auth davranışı veya korunanchallenge/Pilates değişikliği yok.

14Kasım starter antrenman/hatırlatma ve diğer kullanıcı commitleri incelendi; aynı hipotezi3tamgün dolmadan tekrar değiştirmemek için korundu. Google kayıt deneyi de9–15Kasım haftalık penceresi tamamlanmadan değiştirilmedi. Blog CTA için ilk3tamgün16–18Kasım,ilk7tamgün16–22Kasım:anonim izinli CTA tıklamaları,blog landing/acquisition_content kayıtları ve plan guardrail'i izlenecek. Kimlik sonrası yüklenen olay kuyruğu tam anonim ziyaretçi hunisi değildir; eski ölçülmemiş tıklamalar0 tabanı sayılmaz.

## Canlı, GA ve erişim sınırları

Bu oturumun araçlarında önceki tarayıcı denetim yüzeyi yok. Kamu HTTP denemeleri root,EN,ES,kayıt,dashboard,sitemap,robots için hata döndürdü; tek tanısal kontrol **403 Cloudflare** sonucunu belirledi. Bu sonuç site kesintisi veya kullanıcıya görünen beyaz ekran kanıtı değildir. Engeli farklıkimlik/UA/yüzeyle aşma denemesi yapılmadı. CanlıUI/render ve kayıt akışı bugün tamamlanmış doğrulama gibi sunulmadı. Son başarılı tarayıcı kontrolü14Kasım.

YeniGA4 verisi alınamadı;eksik veri sıfırtrafik değil. Son tarihli14Kasım okuması7–13Kasım:131oturum/103etkileşimli/1853olay/8tümönemlifaaliyet. Bunlar bugünün yeni verisi veya kesin signup_completed değil. GenelGA admin/izin kapsamı nedeniyle adminhariçSupabase'ye bölünmez. SonENpricing1/1ziyaret referansı eski pencereye ait;bugünkü sayfa ziyareti bilinmiyor.

GSC6Kasım önceki otomatik inceleme reddi değişmedi;tekrarlanmadı/aşılmadı. Son doğrulanmış28Ekim–3Kasım Web(metin):36tıklama/1083gösterim/%3,3CTR/12,1konum. Full balance3/109,evdedambılilesporprogramı1/10;dambılsayfası6/224,/en6/142,tekdambılblogu6/55,Pilates1/130. Bu eski pencere güncel düşüş değildir.

## Deney takibi

1. **20Ekim içerik:** yedi sorgu için yeni karşılaştırma/indeks verisi yok. Son5Kasım raporu20Ekim–2Kasım14gün/22Eylül–19Ekim28gün;farklı süre toplamları büyüme yüzdesi değil. Tarihli30günlükPilates0/161konum8,6;30günlükdambıl0/50konum5,8;evdePilatesücretsiz0/43konum7,5. İki blogun önceki performansı ve evde-kas-yapilir-mi3Kasım indeksli doğrulaması son referans;gereksiz yeni indeks isteği yok.
2. **Antrenman8–14Kasım:** kimliğe bağlı,adminhariç started27olay/13üye (today_focus14/11,workout_panel13/4);guided completed5/3,quick1/1,birleşik6olay/3üye;workout_completed source workout_session5/3,workout_panel1/1;logs3üye. Dönem kullanıcı oranı%23,1,eşleşmiş seans dönüşümü değil.14Kasım başlatma/tamamlama0. Çıkışnone10olay/7üye,under25bir,25_49iki/birüye,50_74bir;save_failed yok. Açık kapatma kalıcı terk/kanıtlanmışneden değil. Yeni starter değişikliği14Kasım yayınlandığı için üç tam gün verisi yok; tekrar düzenleme yapılmadı.
3. **start28:** challengeId kesin filtresiyle7gün today viewed89olay/30üye,joined3/3;14Kasım viewed5/1,katılım0. challenge_landing viewed/completed/shared0. Tüm challenge_completed sorgusunda başka challenge'a ait1dashboard olayı var;start28 tamamlandı diye sayılmadı. Üçchallenge landing_path7gün kayıt0;günlük de0. YeniGA/GSC ziyaret yok;18Kasım koruması sürüyor.
4. **Pilates4Kasım başlık:** yeniCTR/konum ve tamönceki28gün tabanı eksik;153gösterim/0tık/8,6referansı tam28gün değil.18Kasım'a kadar tekrar değişiklik yok.
5. **Fiyat karşılaştırması:** üçpricing landing_path7gün kayıt0,günlük0. GüncelGAziyaret bilinmiyor;sıfır sayılmadı. storePrices4Kasım tarihli;4Aralık'ta ve ayda bir resmiAppStore doğrulaması gerekli;fiyat tahmini yok.
6. **Google8Kasım:** ilk6tamgün9–14Kasım signup_completed email7/7üye,google14/14üye,toplam21olay;started email7/7,google17olay/16üye. Kimliğe bağlı olaylar tam anonim/eşleşmiş huni değil;nedensellik yok. Devam eden15Kasım hariç tutuldu;9–15Kasım haftası bitince değerlendirilecek.

## Test, yayın ve sınırlama

İlgili8test ve değişen iki dosyanınESLint'i geçti. Tüm paket **84dosya/586test geçti**. Genel lint **594mevcut hata** nedeniyle başarısız;temizmiş gibi sunulmadı. Üretim derlemesi geçti:127statik sayfa üretildi,123SEO sayfası/134sitemapURL doğrulandı. Üretilen sitemap içerik farkı yok. public/llms.txt byte düzeyinde korundu;yayın paketineHEADsürümü kondu.

Cloudflarefullbalance.app/* yayını başarılı, sürüm **3f5b5d46-2ac6-406a-89c4-c035c8204804**. Kontrol düzlemi yayın doğrulaması mevcut;canlı tarayıcı/render doğrulaması erişim nedeniyle eksik. Yeni hesap,ücretli reklam/araç,satınalma veya sosyal paylaşım yok. Sadece blog CTA deneyi,testi ve bu rapor commit edilir.
