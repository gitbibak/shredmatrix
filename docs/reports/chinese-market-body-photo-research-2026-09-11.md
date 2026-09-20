# Full Balance: Çince Pazar Açılımı ve Fotoğraflı Vücut Analizi

## Yönetici kararı

**Çince dil desteği için kontrollü pilot mantıklı; Çin ana karasına tam giriş şu aşamada öncelikli değil. Fotoğraflı gelişim takibi mantıklı; sıradan bir görsel modelle kesin yağ oranı, kas miktarı veya sağlık teşhisi sunmak uygun değil.**

Bu değerlendirme 11 Eylül 2026 itibarıyla erişilebilen resmî kaynaklara, araştırma yayınlarına ve projenin ilgili koduna dayanır. Sıfır reklam bütçesi, sınırlı geliştirme kapasitesi ve mevcut kullanıcı deneyimini koruma hedefi esas alınmıştır. Öneriler uygulama kararıdır; trafik, tıbbi doğruluk veya hukuki uygunluk garantisi değildir.

Çin açılımını ve hassas vücut analizi özelliğini aynı sürümde başlatmamalıyız. İkisi ayrı ayrı altyapı, içerik, mahremiyet ve kullanıcı desteği gerektirir. Eş zamanlı açılış, hangi değişikliğin işe yaradığını ölçmeyi de zorlaştırır.

## 1. Pazar büyük, fakat erişilebilir kitle aynı büyüklükte değil

CNNIC'nin Şubat 2026 açıklamasına göre Aralık 2025'te Çin'de 1,125 milyar internet kullanıcısı ve %80,1 internet penetrasyonu bulunuyordu. Bu toplam pazar göstergesidir; Full Balance'ın ulaşabileceği fitness müşterisi sayısı değildir.[^cnnic]

Çince konuşan kullanıcı ile Çin ana karasında yaşayan kullanıcı aynı segment değildir. Ana kara, Tayvan, Hong Kong, Singapur ve başka ülkelerdeki Çince konuşan topluluklar farklı erişim koşullarına, hukuk sistemlerine ve kullanım alışkanlıklarına sahiptir. Dil veya saat diliminden vatandaşlık çıkarmamalıyız.

| Seçenek | Olası fayda | Temel maliyet/risk | Öneri |
|---|---|---|---|
| Mevcut uygulamaya Çince eklemek | Yeni kullanıcıların anlamasını kolaylaştırır | Eksik çeviri, bakım, destek | Küçük pilot |
| Ana kara dışındaki Çince konuşanlara ulaşmak | Mevcut dağıtım altyapısını değerlendirme imkânı | Yerel içerik ve gerçek talep doğrulaması | İlk pazar testi |
| Ana karaya tam giriş | Büyük potansiyel pazar | Ağ erişimi, dağıtım, kayıt ve veri yükümlülükleri | Şimdilik ertele |
| Çince + vücut analizi birlikte | Dikkat çekici lansman ihtimali | İki büyük belirsizliğin birleşmesi | Önerilmez |

**Avantajlarımız:** ücretsiz temel deneyim, evde ekipmanlı/ekipmansız programlar, antrenman ve günlük alışkanlıkların bir arada olması. Bunların yerel kullanıcı açısından değerli olup olmadığı henüz kanıtlanmış değil.

**Dezavantajlarımız:** yerel marka güveni, ana dilde içerik üretimi ve destek kapasitesi eksikliği; mevcut EN/ES büyümesinden kaynak ayırma maliyeti. Ayrıca pazar boş değil: Keep'in resmî sitesi fitness, koşu, yoga ve topluluk konumlandırmasını zaten sunuyor.[^keep] “Bizde çok modül var” tek başına ayırt edici teklif olmayacaktır.

Önerilen tek başlangıç kitlesi: **evde kısa ve anlaşılır antrenman yapmak isteyen Çince konuşan başlangıç kullanıcıları.** Pilates veya meditasyon, bu ilk kitlede talep görülürse ayrı içerik deneyi olabilir; aynı anda her kategoriye açılmayalım.

## 2. Sadece çeviri yeterli olmayacak

Mevcut `src/i18n/LanguageContext.jsx` yalnızca `tr`, `en`, `es` kabul ediyor. Tarayıcı dilini ilk iki karaktere indiriyor; bu yaklaşım ileride basitleştirilmiş ve geleneksel Çince ayrımını tek başına taşımaz. Eksik çeviri Türkçeye düşüyor. Çince eklenirken karışık dilli ekranları önleyen kapsam testleri gerekir.

Önerilen ilk yazı sistemi, hedef pilot kitlesi uygunsa `zh-Hans` (basitleştirilmiş Çince). Tayvan/Hong Kong hedefinde `zh-Hant` ayrıca değerlendirilmeli. Geleneksel karaktere otomatik dönüştürme, bölgesel kelime ve içerik uyarlamasının yerine geçmez.

Yerelleştirme kapsamı:

- Ana sayfa, kayıt, şifre sıfırlama, ilk plan ve hata mesajları.
- Egzersiz isimleri, hareket açıklamaları, süre ve ekipman ifadeleri.
- Bildirimler, kullanıcı tercihleri ve gizlilik/onay metinleri.
- Beslenmede yerel yiyecek isimleri; çiğ/pişmiş ağırlık, porsiyon ve karışık yemek ayrımı.
- Çin karakterleri için okunabilir sistem fontları, satır kırılması ve mobil buton testleri.
- Dil URL'leri, canonical, hreflang, sitemap ve arama motorunun okuyabildiği sayfa metni.
- Analytics ve veri modelindeki dil listelerinin yeni değerle uyumluluğu.

Çince ana dili olan bir kişi temel akışı incelemeden “yerelleştirme tamamlandı” dememeliyiz. Makine çevirisi başlangıç taslağıdır; egzersiz güvenliği ve beslenme açıklamalarında son kontrol değildir.

## 3. Ana kara erişimi: önce test, sonra söz

Cloudflare'ın Çin ağı mevcut küresel ücretsiz hizmetten ayrı bir üründür. Resmî doküman Enterprise planı, ayrı abonelik, ICP kaydı/lisansı ve alan adı/içerik incelemesi gerektiriyor.[^cloudflare] Bu nedenle ücretsiz Cloudflare kullanmamız, ana karada yerel hız ve kesintisiz hizmet sağladığımız anlamına gelmez.

Bu bulgu **“yurt dışında barındırılan her siteye Çin'den erişmek için ICP gerekir”** anlamına gelmez. Ana kara barındırması/CDN hizmeti ile yabancı sunucuya erişim farklı konulardır. Full Balance'ın ana karada engelli olduğunu da bu araştırma doğrulamış değildir.

Kodda `index.html` Google Fonts çağrıları ve `src/lib/dataService.js` OAuth girişi bulunuyor. Gerçek pilotta haricî font, kimlik doğrulama, e-posta, veritabanı ve yapay zekâ servislerinin her biri ayrı sınanmalı. Ana sayfanın açılması, kayıt ve plan oluşturmanın çalıştığını kanıtlamaz.

**Gerçek cihaz kabul testi:** VPN kullanmadan China Mobile, China Unicom ve China Telecom bağlantıları; iOS/Android; normal tarayıcı ve WeChat içi tarayıcı. İlk açılış, e-posta teslimi, kayıt, oturum yenileme, plan oluşturma ve kayıtlı veriyi tekrar okuma ölçülmeli. Bu testler henüz yapılmadı.

Google ile giriş tek yol olmamalı. Yeni bir WeChat entegrasyonu eklemeden önce mevcut alternatif girişin pilotta çalışması doğrulanmalı. Ağ sorunlarını aşmak için mevcut bütün uygulamayı yeniden yazmak bu aşamada orantısız olur.

## 4. Nerede görünür olabiliriz?

ABD Ticaret Bakanlığı'nın Çin dijital pazarı rehberi WeChat, Douyin ve Xiaohongshu'yu başlıca sosyal kanallar arasında gösteriyor; WeChat mini uygulama ekosistemini de vurguluyor.[^channels] Tencent ayrıca Weixin'i ana kara, WeChat'i diğer bölgelerdeki kullanıcılar için ayırıyor.[^wechat]

Aşağıdaki sıralama Full Balance için **test önerisidir**, kanıtlanmış dönüşüm sıralaması değildir:

| Kanal | Denenecek içerik | Nasıl değerlendirilir? |
|---|---|---|
| Xiaohongshu / Rednote | Başlangıç seviyesi ev rutini, gerçek uygulama ekranı | Nitelikli ziyaret, kayıt ve ilk antrenman |
| WeChat toplulukları | Yönetici izniyle küçük pilot ve haftalık takip | Davet edilenlerden aktivasyon ve geri dönüş |
| Douyin | Kısa hareket açıklaması ve uygulanabilir rutin | İzlenme değil, izin verilen akıştan ürün kullanımı |
| Baidu | Dar bir ihtiyaca cevap veren Çince sayfa | İndekslenme, sorgu gösterimi, tıklama, kayıt |
| Mevcut uluslararası kanallar | Çince açıklamalı gerçek ürün tanıtımı | Ana kara dışı Çince dil kohortu |

Platformların hesap doğrulaması, dış bağlantı, QR kod ve sağlık içerik kuralları paylaşım öncesi ayrıca doğrulanmalı. Buradaki liste hesap açma veya paylaşma yetkisi/uygunluğu anlamına gelmez. Yeni hesap veya ücretli reklam başlatılmadı.

Araştırılacak sorgu taslakları: `居家健身计划` (evde antrenman planı), `新手徒手训练` (başlangıç ekipmansız antrenman), `居家普拉提` (evde pilates), `每日冥想` (günlük meditasyon). Bunlar **doğrulanmış yüksek hacimli anahtar kelimeler değil**. Baidu sorgu verisi veya pilot gözlemi olmadan hacim ve sıralama iddiası kurmamalıyız.

Google/ChatGPT üzerinden çalışan büyüme modelinin ana karada aynı şekilde çalışacağını varsayamayız. Yeni dil eklemek kendiliğinden trafik oluşturmaz; kullanıcıya ulaşan ana dilde içerik ve güven gerekir. Ücretsiz kanal, içerik üretimi ve destek açısından sıfır maliyetli değildir.

## 5. Hukuk ve veri: özellikle fotoğrafla birlikte önem kazanıyor

Çin PIPL düzenlemesi sağlık ve biyometrik bilgileri hassas kişisel bilgi kategorisinde ele alıyor; belirli amaç, gereklilik, güçlü koruma ve ayrı onay şartları getiriyor.[^pipl] Her sıradan fotoğrafın otomatik olarak aynı hukukî kategoriye girdiği söylenemez; fakat sağlık çıkarımı yapan vücut analizi hassasiyet seviyesini artırır.

CAC'nin sınır ötesi veri açıklaması, hassas bilgiler için farklı koşullar öngörüyor. Kullanıcı sayısının az olması tek başına bütün yükümlülüklerden muafiyet sağlamaz.[^cac] Veritabanı, fotoğraf depolama ve AI sağlayıcısının ülke/alt işleyen/retention akışı açıkça haritalanmalıdır. Uygulanacak istisna ve aktarım mekanizması uzman değerlendirmesi gerektirir; buradan genel bir hukukî izin sonucu çıkarılamaz.

MIIT'nin uygulama kayıt bildirimi mini uygulama dağıtımını da kapsıyor.[^miit] Web/PWA pilotu ile Çin mağazalarında veya mini uygulama platformunda lansmanı aynı işlem saymayalım. Sağlık iddiası taşıyan AI özelliklerinin ek yükümlülükleri de lansmandan önce ayrıca incelenmeli.

## 6. Vücut fotoğrafından doğru analiz mümkün mü?

**Bazı özel modellerle belirli ölçümler tahmin edilebilir. Tek fotoğraftan kişinin yağ oranını ve kasını kesin biçimde öğrenmek mümkünmüş gibi ürün sunamayız.**

2022 tarihli, DXA karşılaştırmalı bir çalışmada 134 yetişkin için özel iki-fotoğraflı modelin yağ yüzdesi ortalama mutlak hatası 2,16 yüzde puandı; uyum sınırları yaklaşık −5,5 ile +4,7 yüzde puandı. Bu “%98 doğruluk” değildir. Örneklemin yalnızca %6,7'si Asyalıydı; Çinli kullanıcılar için aynı performans varsayılamaz.[^body2022]

Google Research'ün 17 Ağustos 2026 PhotoScan açıklaması da umut verici: 677 kişilik fotoğraf kohortunda 2,15 yüzde puan ortalama mutlak hata bildiriyor. Fakat yöntem özel eğitim, DXA referansı, fotoğraf pozları ve boy/kilo gibi ek değişkenler kullanıyor; araştırma prototipi olarak tanımlanıyor.[^googlebody] Bu, hazır bir ücretsiz ürün API'si veya mevcut genel görsel modelimizin doğruluk kanıtı değildir.

Ortalama hata, her birey için garanti edilmiş hata aralığı değildir. Örneğin sonuç %20 çıktığında kişiye güvenle “gerçek değer %18–22 arasındadır” diyebilmek için ayrıca kalibre edilmiş belirsizlik modeli gerekir. İyi korelasyon da tek kişinin küçük haftalık değişimini güvenilir ölçmek anlamına gelmez.

Sonucu etkileyen faktörler: ışık, lens, kamera mesafesi, poz, kasları sıkma, giysi, bedenin kadrajda kalması ve modelin eğitim kitlesi. Bunlar değişince model gerçek gelişim olmadan değişim raporlayabilir.

### Ne sunabiliriz, ne sunmamalıyız?

| Özellik | Karar |
|---|---|
| Tarihli ve özel gelişim fotoğrafları | Mantıklı; mevcut altyapı kullanılabilir |
| Yan yana karşılaştırma, aynı kadraj yardımı | İlk tercih |
| Görüntü bulanıklığı ve kadraj kontrolü | Teknik doğrulamayla yararlı |
| Kullanıcının ölçtüğü kilo/bel ile trend | Ölçüm kaynağı açıkça belirtilerek |
| Fotoğraftan yağ yüzdesi tahmini | Bağımsız doğrulama sonrası ayrı araştırma aşaması |
| Fotoğraftan kesin kas kilogramı/visseral yağ | Mevcut ürün için sunma |
| İnsülin direnci, hastalık veya postür teşhisi | Genel görsel modelle sunma |
| “Vücudun 6/10”, çekicilik veya utandırıcı değerlendirme | Sunma |
| Fotoğraf yüzünden otomatik kalori/program değişikliği | Sunma |

Bilimsel araştırmada bir sağlık riski tahmini yapılabilmesi, Full Balance'ın bunu ticarî üründe güvenle sunabileceğini göstermiyor. “Tıbbi tavsiye değildir” yazısı kötü modeli doğru hale getirmez.

## 7. Mevcut projede en güvenli uygulama yönü

`src/lib/dataService.js` içinde `getProgressPhotos()` ve `deleteProgressPhoto()` zaten var. Fotoğraflar `user-photos` depolamasındaki kullanıcı/progress yolundan listeleniyor ve bir saatlik imzalı URL oluşturuluyor. Oturumsuz/bağlantısız durumda yerel saklama yolu bulunuyor. Yeni bir paralel galeri kurmak yerine mevcut özellik değerlendirilmeli.

Bu kod incelemesi canlı bucket erişim kurallarının tam güvenlik denetimi değildir. AI eklenmeden önce kullanıcılar arası erişim, silme, yedeklerin saklama süresi, oturum değişimi ve hata durumları sınanmalı. İmzalı URL de geçerlilik süresinde hassas bir erişim bağlantısıdır; analytics veya loglara gitmemeli.

Önerilen ilk deney: isteğe bağlı, yetişkin kullanıcılar için, özel gelişim fotoğrafı karşılaştırması. Yüzü kadraj dışında bırakma/kırpma ve EXIF temizleme; tutarlı fotoğraf koşulları; silme kontrolü; ayrı paylaşım izni. Yüzü kırpmak tek başına fotoğrafı anonim hale getirmez. Çıplak fotoğraf istenmemeli.

Gelecekte AI işleme yapılırsa yüklemeden önce işleyen sağlayıcı, amaç, saklama süresi ve veri aktarımı anlatılmalı. Sağlayıcı fotoğrafları eğitim için kullanmıyor iddiası sözleşme/ayar doğrulaması olmadan yazılmamalı. Fotoğraf, analiz sonucu veya imzalı bağlantı growth eventlerine gönderilmemeli.

## 8. Ölçülebilir aşamalı plan

### Çince pilot

1. Ana dili Çince olan 5–10 gönüllüyle problemi ve mevcut deneyimi değerlendir. Talep yoksa çeviriye geniş yatırım yapma.
2. Hedef yazı sisteminde kayıt → plan → ilk antrenman → geri dönüş akışını eksiksiz yerelleştir. Mevcut TR/EN/ES regresyon testlerini koru.
3. Ana kara hedefleniyorsa gerçek ağ testlerini ve hukukî/veri uygunluğu kontrolünü tamamla. Başarısızsa bunu “Çin lansmanı” olarak sunma.
4. Tek kanal ve tek hedef kitleyle 2–4 haftalık, 20–30 gerçek katılımcılı pilot yap. Bu sayılar işletim hedefidir; istatistiksel anlamlılık garantisi değildir.
5. Kayıt, ilk plan, ilk antrenman, D1/D7 geri dönüş ve destek ihtiyacını mevcut dil kohortlarıyla aynı tanımlar altında karşılaştır. D7 için henüz yedi günü dolmayan kullanıcıları paydaya katma.

**Devam koşulu:** kritik erişim/kayıt sorunu yok; yerelleştirme anlaşılır; ilk değer ve geri dönüşte somut olumlu sinyal var; destek kapasitesi yeterli. **Bekletme koşulu:** kullanıcılar kayıt olamıyor, tekrar kullanım yok veya uyum/altyapı maliyeti bütçeyi aşıyor. Sadece sayfa görüntülemesi başarısı yeterli değil.

### Vücut analizi

1. Önce mevcut özel fotoğraf takibini kullanılabilirlik ve güvenlik bakımından düzelt/doğrula.
2. Karşılaştırma deneyiminin kullanıcıya gerçekten yardımcı olup olmadığını ölç. Fotoğraf yüklemeyenleri eksik/başarısız sayma.
3. Sayısal analiz talebi güçlü kalırsa lisansı, çalıştırma maliyeti ve klinik referansı doğrulanmış model araştırmasına geç.
4. Hedef kullanıcı kitlesinde bağımsız DXA karşılaştırması, tekrar ölçüm, farklı cihaz/ışık testleri, alt grup hata analizi ve belirsizlik kalibrasyonu yap. Örneklem ve kabul eşikleri uzmanla, değerlendirmeden önce belirlenmeli.
5. Düşük kaliteli görüntüyü reddet; başarısız analizde sayı uydurma. Doğrulama başarılı olmadan canlıda yağ yüzdesi sunma.

## Sonuç

En iyi kısa vadeli tercih, kanıtlanmamış iki büyük lansman yerine iki küçük ve birbirinden bağımsız araştırma adımıdır: Çince konuşan gerçek kullanıcılarla talep testi ve mevcut özel gelişim fotoğrafı deneyiminin değerlendirilmesi. Ana kara yatırımı ve sayısal vücut analizi daha sonra, erişim/doğruluk/mahremiyet koşulları karşılandığında gündeme gelmeli.

Bu araştırmada uygulama kodu, dil listesi, veritabanı veya canlı sistem değiştirilmedi. Çin içi bağlantı testi, Baidu hacim analizi, uzman hukuk görüşü ve Full Balance modelinin klinik doğrulaması yapılmış değildir.

## Kaynaklar

[^cnnic]: [CNNIC, 57. Çin İnternet Gelişim Raporu açıklaması, Şubat 2026](https://www2.cnnic.cn/n4/2026/0209/c326-11544.html).
[^keep]: [Keep / Calorie Technology resmî sitesi](https://www.calorietech.com/).
[^cloudflare]: [Cloudflare China Network: Get started](https://developers.cloudflare.com/china-network/get-started/).
[^channels]: [U.S. International Trade Administration: China eCommerce, 25 Eylül 2025](https://www.trade.gov/country-commercial-guides/china-ecommerce).
[^wechat]: [Tencent: Weixin & WeChat](https://www.tencent.com/products/weixin-wechat/).
[^pipl]: [NPC: Personal Information Protection Law, maddeler 28–31](https://en.npc.gov.cn.cdurl.cn/2021-12/29/c_694559_2.htm).
[^cac]: [CAC: Sınır ötesi veri akışları düzenlemesi açıklaması, 22 Mart 2024](https://www.cac.gov.cn/2024-03/22/c_1712776611649184.htm).
[^miit]: [MIIT: Mobil internet uygulaması kayıt bildirimi, 2023](https://www.gov.cn/zhengce/zhengceku/202308/content_6897341.htm?type=mobile-internet).
[^body2022]: [Majmudar ve diğerleri: Smartphone camera based assessment of adiposity: a validation study, npj Digital Medicine, 2022](https://www.nature.com/articles/s41746-022-00628-3).
[^googlebody]: [Google Research: Seeing beyond BMI: Estimating cardiometabolic risk with smartphone imagery, 17 Ağustos 2026](https://research.google/blog/seeing-beyond-bmi-estimating-cardiometabolic-risk-with-smartphone-imagery/).
