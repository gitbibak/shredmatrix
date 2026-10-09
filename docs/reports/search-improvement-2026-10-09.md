# Full Balance arama ve giriş sayfası incelemesi — 9 Ekim 2026

## Doğrulanan kayıt karşılaştırması

Supabase salt okunur toplu sorgularıyla admin profilleri hariç tutuldu. Tam
İstanbul günleri karşılaştırıldı: 25 Eylül–1 Ekim ve 2–8 Ekim. Bunlar kayıt
dağılımlarıdır; ziyaret paydası, dönüşüm oranı veya doğrulanmış tekil kişi değildir.

| Kayıt metriği | 25 Eylül–1 Ekim | 2–8 Ekim |
| --- | ---: | ---: |
| Toplam | 33 | 30 |
| EN / ES / TR | 22 / 4 / 7 | 25 / 1 / 4 |
| Google etiketli | 11 | 7 |
| Google EN / ES / TR | 3 / 4 / 4 | 5 / 1 / 1 |
| ChatGPT | 18 | 21 |
| Direct | 2 | 2 |
| Diğer | 2 | 0 |

| Landing | Önceki hafta | Son hafta |
| --- | ---: | ---: |
| /en | 13 | 12 |
| /en/photo-calorie-counter | 5 | 6 |
| / | 3 | 2 |
| /auth | 2 | 2 |
| /evde-dambil-antrenman-programi | 2 | 1 |
| /en/home-workout-no-equipment | 2 | 1 |
| /es/rutina-con-bandas-elasticas | 2 | 0 |
| /es | 2 | 0 |
| /es/contar-calorias-con-foto | 0 | 1 |
| Diğer yollar | 2 | 5 |

Son haftanın Google kayıtları: /en 2; /kurucu-tolga-deveci,
/en/4-week-home-workout-plan, /pilates-programi,
/es/contar-calorias-con-foto ve /evde-dambil-antrenman-programi birer kayıt.
EN foto-kalori sayfasındaki 6 kaydın tamamı ChatGPT etiketli. Dil, ülke değildir;
EN dili kullanan kayıt TR sayfasından da gelebilir. Sorgular kayıtlarla eşlenemedi.

## Organik arama ve ücretli reklam sınırı

Chrome erişimi işletim sistemi Computer Use izni yüzünden engellendi. Yeni GSC
sorgu/sayfa/ülke kırılımları alınamadı. Önceki rapordaki 29 Eylül–5 Ekim
37 tıklama / 765 gösterim / %4,8 CTR / konum 12,9 bu oturumda yeniden
doğrulanmadı; yeni veya aynı Supabase penceresi verisi olarak kullanılmadı.
İlk 10/119 sorgu bütün dağılım değildir. Önceki başlık değişikliklerinin etkisi
kanıtlanamadığı için başlıklar ve meta açıklamalar yeniden değiştirilmedi.

Ads/GA maliyet, hacim ve ziyaret paydaları alınmadı. Google kaynak etiketi
organik/CPC ayrımı, ROAS veya reklam başarısı kanıtı değildir. Ücretli kampanya,
harcama, hesap, sır değişikliği ve kullanıcı adına paylaşım yapılmadı.

## Seçilen dar iyileştirme

Mevcut TR/EN/ES foto-kalori sayfalarına temsili kullanım örneği eklendi:
pilav/tavuk/salata fotoğrafında yiyecekleri ve gramları kontrol et, görünmeyen
yağ/sosu ekle, istersen kişisel beslenme planına geç. Örnek gerçek kullanıcı veya
model çıktısı olarak sunulmuyor; uydurma kalori sonucu yok. Yeni URL yok.

Seçim gerekçesi: EN foto girişinin iki haftada 5 ve 6 kayıt getirmesi, ES foto
girişinde de 1 kayıt görülmesi. Bu bir kullanım açıklığı hipotezidir; CTR sorunu
kanıtı veya kayıt artışı garantisi değildir. Mevcut plan bağlantıları korunur.

Hipotez: örnek, porsiyon düzeltmesini ve gizli içerik kontrolünü anlaşılır kılar.
Yayın tarihi sonrasında iki eşit 14 günlük pencerede aynı üç landing için
meal_photo_started, meal_photo_analyzed, meal_hidden_ingredient_added ve
nutrition_logged (public_tool) sayıları ile dil/kaynak kayıt dağılımları izlenebilir.
Admin kullanıcıları ve admin anonymous_id değerleri olaylardan çıkarılmalıdır.
Olaylar tekrarlanabileceği için ham olay oranı kişi dönüşümü diye sunulmamalı;
uygun ziyaret/oturum paydası olmadan dönüşüm oranı hesaplanmamalı. GSC için
aynı URL ve sorgu gruplarında tamamlanmış eşit 28 gün karşılaştırması gerekir.
Kaynak karması ve konum değişimi nedensel sonuçları sınırlar.

## Doğrulama ve yayın durumu

- 64 test dosyası / 404 test geçti; typecheck geçti.
- Değiştirilen iki veri dosyasının lint'i ve diff kontrolü temiz.
- Genel lint 591 mevcut marketing/exercise-videos hatasıyla başarısız.
- Build geçti: 88 statik sayfa üretildi, 82 SEO sayfası ve 91 sitemap URL doğrulandı.
- Yerel üretim önizlemesinde üç dil 390×844 ve 1280×900 boyutlarında kontrol
  edildi; yeni metin mevcut ve yatay taşma yok. TR bölümünün ekran görüntüsü
  output/photo-workflow-review-tr.png dosyasında.
- public/llms.txt içeriği build öncesi belleğe alınarak sonrasında aynen geri
  yazıldı; dağıtım çıktısında HEAD sürümü kullanıldı. Kullanıcı değişikliği yayına
  dahil edilmedi. Önceki raporlar ve görseller korundu.
- Uzak gitbibak/main başlangıcı yerel HEAD 2889cfe ile aynı doğrulandı.
- Üretim deploy girişimi otomatik onay incelemesince reddedildi: mevcut
  konuşmada bu tam yayın için doğrudan kullanıcı onayı yeterli bulunmadı.
  Yayın ve push yapılmadı; canlı değişiklik ve canlı sonrası test iddiası yok.
  Sonraki adım bu somut içerik değişikliğinin main'e gönderilip fullbalance.app
  üzerinde yayınlanması için kullanıcı onayıdır.
