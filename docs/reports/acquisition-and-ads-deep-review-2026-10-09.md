# Full Balance arama ve reklam incelemesi — 9 Ekim 2026

## Sonuç ve yapılan düzeltme

Organik Google görünürlüğü büyüyor; kayıt hızındaki son düşüş, Google'ın genel
olarak kötüleştiğini göstermiyor. En güçlü marka dışı Google girişimiz TR dambıl
sayfası. Kayıt kaynaklarında en büyük grup ChatGPT, özellikle EN ana sayfa ve
foto-kalori girişi. Ücretli reklamın kazananı henüz bilinmiyor.

Reklam hazırlığında ölçüm adı, karakter sınırı, niyet eşleşmesi ve eksik EN/foto
grupları düzeltildi. Canlı Google Ads kampanyası değiştirilmedi. Açık Google
hesabında Ads hesap seçicisi “Google Ads hesabınız yok” diyor; başka bir hesabın
kampanyaları olmadığı sonucuna varılamaz. Yeni hesap veya harcama oluşturulmadı.

Kodda iki ölçüm hatası düzeltildi: Google OAuth dönüşü artık yeni Google
edinimi sayılmıyor; saklanan analitik onayı GA yapılandırmasından önce geri
yükleniyor. Reklam depolama, reklam kullanıcı verisi ve kişiselleştirme izinleri
denied kalıyor. Eski profiller yeniden etiketlenmedi.

## Güncel organik Google karşılaştırması

Kaynak: canlı Search Console Web raporu, 9 Eylül–6 Ekim 2026; son güncelleme
29,5 saat önce. Uygulama içi tarayıcıyla okundu. Önceki 28 gün karşılaştırması
raporda seçildi. Karşılaştırma grafiğinin tarih metni hatalı olduğundan önceki
kesin tarih sınırları ayrıca doğrulanmadı; “önceki 28 gün” olarak sunuluyor.

| Metrik | Önceki 28 gün | Son 28 gün |
| --- | ---: | ---: |
| Tıklama | 29 | 101 |
| Gösterim | 807 | 2.149 |
| CTR | %3,6 | %4,7 |
| Ortalama konum | 34 | 15,5 |

Tıklama yaklaşık %248, gösterim %166 arttı. Bu değişim tek bir başlık veya
önceki düzenlemenin nedensel etkisi değildir. Son günler gecikmeli ve bu pencere
Supabase kayıt penceresiyle aynı değildir.

232 görünür sorgunun tamamı okundu. Bunların tıklama toplamı 38; rapor toplamı
101. Görünmeyen 63 tıklama marka dışı diye sınıflanamaz. Gizlenen/dahil edilmeyen
sorgular nedeniyle arama ifadelerinin tümü bilinmiyor.

| Görünür sorgu | Tıklama | Gösterim | Konum |
| --- | ---: | ---: | ---: |
| full balance | 28 | 401 | 5,0 |
| fullbalance | 3 | 29 | 6,3 |
| evde dumbell ile vücut geliştirme programı | 2 | 29 | 8,8 |
| evde dambıl ile spor programı | 1 | 32 | 9,1 |
| evde dumbell programı | 1 | 16 | 11,9 |
| 2 dambıl ile evde vücut geliştirme programı | 1 | 7 | 6,3 |
| evde dambıl çalışma programı | 1 | 7 | 9,3 |
| direnç bandı antrenman programı | 1 | 3 | 10,0 |

Dambıl sayfası ayrıca filtrelendi: 23 görünür sorgu; yukarıdaki 5 dambıl
sorgusu bu URL'ye geliyor. Bu URL'nin toplamı 18 tıklama/430 gösterim; görünür
sorgu tıklamaları 6. Arama sorgusu ile tekil kayıt birbirine eşlenmedi.

Sıfır tıklamalı fırsat adayları: evde pilates programı ücretsiz 47 gösterim,
konum 8,1; 30 günlük dambıl programı 27/7,7; dambıl çalışma programı 20/9,7;
30 günlük evde spor programı 18/9,7. Küçük örneklem ve konum etkisi nedeniyle
başlıkların kötü olduğu kesin değildir. 30 Eylül başlık deneyi tekrar yazılmadı.

| Sayfa | Tıklama / gösterim | Konum | Değerlendirme |
| --- | ---: | ---: | --- |
| /en | 33 / 484 | 4,8 | En güçlü Google girişimiz; önceki dönemde 6/169 |
| /evde-dambil-antrenman-programi | 18 / 430 | 8,5 | En açık marka dışı niyet; önceki dönemde 0/0 |
| /es | 8 / 102 | 5,4 | Önceki 8/76; tıklama yatay, gösterim artıyor |
| /direnc-bandi-antrenman-programi | 6 / 70 | 7,0 | İkinci TR ekipman niyeti; ürün kapsamıyla uyumlu |
| /40-yas-ustu-evde-spor-programi | 4 / 108 | 7,0 | Ölçülü örneklem; sağlık sonucu vaat etme |
| /es/rutina-con-bandas-elasticas | 2 / 66 | 6,6 | ES genel başarısız değil; dar niyet var |
| /es/contar-calorias-con-foto | 2 / 33 | 12,3 | Küçük organik başlangıç |
| /en/photo-calorie-counter | 0 / 7 | 4,7 | Google talebi/ücretli getirisi doğrulanmış değil |
| /evde-kas-gelistirme-hareketleri | 1 / 94 | 27,3 | Konum zayıf; CTR'ı yalnız metne yükleme |
| /es/calculadora-calorias-macros | 0 / 150 | 51,1 | Öncelikle sıralama/niyet sorunu adayı |
| /gunluk-kalori-ihtiyaci-hesaplama | 0 / 121 | 43,9 | Google ilk sayfa dışında; reklam sonucu kanıtı yok |

82 URL satırında EN yolları 39, ES 15, öneksiz yollar 47 tıklama getiriyor.
Bu URL dili sınıflamasıdır; kullanıcı dili veya ülke değildir. Sayfa gösterim
toplamları aynı aramada birden fazla URL nedeniyle özellik toplamından büyük
olabilir; tekil arama/ziyaret diye sunulmadı.

82 ülke satırının tamamı okundu: Türkiye 41 tıklama/1.054 gösterim, konum15,3;
İspanya7/260, konum32,5; ABD5/114, konum24,1; İngiltere3/21, konum4,1;
Hindistan3/36, konum9,8; Meksika2/35; Şili2/20. EN otomatik ABD, ES otomatik
İspanya hedefi anlamına gelmez. İspanya ortalama konumu zayıf; İngiltere küçük
örneklemle güçlü görünüyor, pazar kazananı ilan edilemez.

## Kayıtların kaynakları ve girişleri

Supabase: admin hariç, tamamlanmış İstanbul günleri 11 Eylül–8 Ekim. Toplam149
kayıt; EN116 (%77,9), TR24, ES9. Kaynak etiketleri ChatGPT99 (%66,4), Google36,
direct8, ig/instagram4, diğer2. Kampanya/medium kırılımında cpc etiketi görülmedi;
bu, etiketlenmemiş ücretli ziyaretin hiç olmadığı kanıtı değildir.

149 profilden140'ında sorgu anında mevcut plan var. Bu aynı gün aktivasyon
veya ziyaretçi dönüşüm oranı değildir. İlk14gün86, son14gün63 kayıt (-%26,7);
EN69→47, TR13→11, ES4→5. Son hız düşmüş; organik artışla birlikte değerlendirmek
gerekir. Mevcut örneklem hangi kampanyanın bunu düzelteceğini kanıtlamaz.

Girişler: /en64, ENfoto22, /22, /auth11, ENekipmansız9, /es4, TRdambıl4,
ENdambıl3, ESbant2; diğer8yol birer kayıt. ENfoto22 kaydın21'i EN dili,1'i ES
dili kullanmış. Son tamamlanmış haftada ENfoto6 kaydın tamamı ChatGPT etiketli.

Google etiketli36 kaydın girişleri: /en16, TRdambıl4, /es4, /auth3, ESbant2,
kurucu/pilates/TR30gün/ENdambıl/TR40üstü/EN4hafta/ESfoto yollarında birer.
OAuth kaynak hatası nedeniyle bu36 kaydın tamamı organik Google kazanımı diye
sunulamaz. Kaçının yanlış etiketlendiği eski ham referrer bulunmadan bilinmiyor.

## GA4: ölçüm eksikleri

Full Balance mülkü canlı okundu. Trafik raporu11Eylül–8Ekim:69oturum,
57etkileşimli oturum,794olay,0önemli etkinlik. Mülk saat dilimi ve dahili trafik
filtresi doğrulanmadı. Consent/engelleyici etkileri var; bu tüm ziyaretlerin
paydası değildir. Supabase149/GA69 gibi sistemler arası dönüşüm oranı hesaplanamaz.

Oturum kaynakları: direct26, accounts.google.com/referral19,
google/organic9, chatgpt.com/ai-assistant8, l.instagram.com/referral3,
not set/facebook/strava/today birer. Google giriş domaininin19oturumla kaynak
görünmesi edinim raporunun OAuth akışından etkilendiğini destekliyor.

Önemli etkinlik listesi close_convert_lead, purchase, qualify_lead; üçünde de
akış verisi algılanmadı. Son33etkinlik arasında plan_generated var;
signup_completed görünmedi. Sıfır önemli etkinlik sıfır kayıt demek değildir.
Kod signup_completed gönderiyor, fakat GA'ya ulaştığı ve tekil sayıldığı canlı
kayıtla doğrulanmadan dönüşüm optimize edilmemeli. Yeni test hesabı açılmadı.

Supabase growth_events, yalnız kimlik tanımlandıktan sonra cihaz kuyruğundan
yükleniyor; kayıt olmadan ayrılan ziyaretçileri kapsamıyor. Bu olayların
page_view sayısı da tüm trafik paydası değildir. Kuyruk100olayla sınırlı ve
geç yüklenebilir. first_* alanları ilk dolu değer bazındadır; boş kampanya alanı
sonradan dolabilir, tek değişmez ilk ziyaret kaydı varsayılmamalı.

## Reklam dosyalarında düzeltilenler

- Yanlış dönüşüm isimleri sign_up/plan_created yerine kodun gerçek adları.
- Altı CSV açıklaması90karakteri aşıyordu; tamamı sınır içinde.
- Ölçülmemiş2dakika ve ağrıya otomatik çözüm vaatleri kaldırıldı.
- TRdambıl reklamından ekipman belirtmeyen kas sorguları çıkarıldı.
- Geniş pdf/indir/descargar/salon negatifleri kaldırıldı: PDF/yazdırma, uygulama
  ve salonsuz kullanım niyetlerini yanlış engelleyebilirler.
- ENfoto/ENekipmansız/TRfoto/ESfoto ayrı taslakları eklendi.8RSA,6kampanya,
  8reklam grubu duraklatılmıştır; bütçe/CPC/konum boş ve karar bekler.
- utm_content sabit reklam varyantı, utm_term={keyword}. Bu parametre gerçek
  kullanıcı sorgusu değil eşleşen hesap anahtar kelimesidir.
- Kanıtsız150TL/6EUR bütçe,40TLmaliyet eşiği,100tıklama kuralı, D7kapısı ve
  Meta CTA maliyet/Advantage+ iddiaları çıkarıldı.

Organik içerik ve bütçesiz tanıtım için sıra: ENfoto aracı ve ENana girişin
somut kullanımını anlat; TRdambıl sayfasını gözlenen aramalarla eşleştir; ESfoto
ve bant niyetini küçük test olarak koru. PT/salon takibini tüketici antrenman ve
kalori aramalarından ayrı tut. Hazır metinleri kullanıcı adına paylaşma.

## Doğrulama ve kalan adımlar

411test/64dosya geçti; typecheck, değişen kodun lint'i, build ve statikSEO
doğrulaması geçti. Genel lint mevcut591marketing/exercise-videos hatasına
takılıyor. CSV65satır/37sütun,8RSA; karakter, URL, UTM ve duraklatılmış durum
kontrolleri geçti. Google Editor içe aktarımı yapılmadı; boş bütçe/ülke alanları
nedeniyle dosya tamamlanmış aktif kampanya değildir.

Kullanıcının llms.txt değişikliği ve eski rapor/görseller korundu. Üretim
yayını önceki otomatik incelemede doğrudan onay eksikliği nedeniyle reddedilmişti;
bu oturumda tekrar denenmedi. Kod/dosya değişiklikleri yereldir, canlıya alınmadı.

Yayın sonrası: kullanıcı onayı olan gerçek kayıt akışında GA DebugView ile
signup_completed tek olay, kaydedilmiş analitik onayı yeniden yükleme ve
accounts.google.com dönüşünde kaynak korunması doğrulanmalı. GA tag ayarlarında
yalnız accounts.google.com unwanted referral düzeltmesi ayrı uygulanmalı;
GA hesap ayarı bu oturumda değiştirilmedi. Kayıt olayı doğrulanıp önemli etkinlik
işaretlenmeli; plan_generated gözlem olarak tutulmalı. Geçmiş veri düzelmiş sayılmaz.

Yayın sonrası14tam gün ve önceki14gün kayıt dili/kaynak/landing; GSC aynıURL
ve sorgu gruplarında28tam gün; kayıt kohortunda plan varlığı ve gözlenen geri
dönüş izlenmeli. Maliyet/arama terimleri olmayan dönemde CPC/ROAS tahmin edilmez.

## Kaynaklar

- Güncel GSC tüm tabloları: search-data-2026-10-09.json (232sorgu,82sayfa,
  82ülke,87sayfa/298sorgu karşılaştırması,23dambıl sorgusu).
- [Google RSA karakter sınırları](https://support.google.com/google-ads/answer/7684791?hl=en)
- [Negatif anahtar kelimeler](https://support.google.com/google-ads/answer/2453972?hl=en)
- [Arama terimleri raporu](https://support.google.com/google-ads/answer/2472708?hl=en)
- [ValueTrack](https://support.google.com/google-ads/answer/6305348?hl=en)
- [Önemli etkinlik ve Ads dönüşümü](https://support.google.com/analytics/answer/13965727?hl=en)
- [İstenmeyen yönlendirmeler](https://support.google.com/analytics/answer/10327750?hl=en)
- [Analitik onayını uygulama](https://developers.google.com/tag-platform/security/guides/consent)
- [Calsy tarayıcı aracı](https://www.calsy-app.com/food-calorie-scanner): rakip
  de tarayıcıda foto analizini anlatıyor; Full Balance'ın uygulamasız kullanımı
  tek/benzersiz diye sunulmadı. Rakibin doğruluk/hız iddiası test edilmedi.
