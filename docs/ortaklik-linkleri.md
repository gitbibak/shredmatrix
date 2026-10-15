# Ortaklık (affiliate) linkleri — kurulum rehberi

**Durum (15 Ekim 2026):** Altyapı hazır ve test edildi. Varsayılan ağ **Amazon global**; **etiket boş**. Etiket girilene kadar sitede hiçbir şey görünmez.

## Nerede gösteriliyor

| Yerleşim | Sayfa | Neden bu sayfa | Ürün seti |
|---|---|---|---|
| `seo_tr_dumbbell` | `/evde-dambil-antrenman-programi` | Marka dışı en çok Google tıklaması (30 gün: 23 tık / 531 gösterim) | dambıl |
| `seo_tr_band` | `/direnc-bandi-antrenman-programi` | İkinci TR ekipman niyeti (6 / 76) | bant |
| `seo_es_band` | `/es/rutina-con-bandas-elasticas` | ES ekipman niyeti (2 / 66) | bant |
| `app_home_basic` | Uygulama içi, Antrenman paneli | Yalnızca "dambıl + bant" ev ortamını seçen kullanıcıya, katlanmış kutu | dambıl |

Ürün setleri:
- **dambıl:** ayarlanabilir dambıl seti, sabit dambıl çifti (2–5 kg), direnç bandı seti, egzersiz matı
- **bant:** direnç bandı seti, kapı ankrajlı tüp bant, mini band, egzersiz matı

Takviye ürünleri bilinçli olarak yok; bir test bunları engelliyor.

## Senin yapacakların (Amazon global)

Tek bir Amazon etiketi tüm sayfa ve dillerde çalışır. Etiketi girdiğin an 6 ürünün linki otomatik üretilir; ürün ürün link toplaman gerekmez.

### 1. Amazon.com (ABD) ortaklık programına katıl
- https://affiliate-program.amazon.com → hesap aç (hesap, vergi ve ödeme bilgileri senin işin).
- Site olarak `https://fullbalance.app` ekle.
- Onaydan sonra **takip etiketini** al (ör. `fullbalance-20`).

### 2. OneLink'i aç (yurt dışı ziyaretçi kendi ülkesinin Amazon'una gitsin)
- Associates Central → Tools → **OneLink**.
- İspanya (ES sayfası için), İngiltere ve Almanya (EN trafiğinin büyük kısmı için) programlarına katılıp hesapları bağla. İstersen Fransa, İtalya ve Kanada'yı da ekle.
- OneLink yalnızca ABD hesabıyla çalışır. Bağlanan ülkeler: Kanada, İngiltere, İspanya, Almanya, Fransa, İtalya, Japonya, Singapur, Hollanda, Suudi Arabistan, Polonya, İsveç, Avustralya. Bu ülkelerin komşularından gelenler en yakın mağazaya yönlenir.
- Ürün yerel mağazada yoksa ziyaretçi o mağazanın aramasına düşer ("close match" varsayılanı).

### 3. Etiketi dosyaya yapıştır
Dosya: `src/data/affiliateProducts.js`
```js
export const AMAZON_ASSOCIATE_TAG = 'fullbalance-20'; // kendi etiketin
```
Bu kadar. Üç sayfa ve uygulama içi kutu Amazon linkleriyle açılır.

### 4. (İsteğe bağlı) Belirli ürün seç
Varsayılan olarak her ürün amazon.com aramasına gider (ör. "adjustable dumbbell set"). Belirli bir ürünü önermek istersen amazon.com'da ürün sayfasını aç ve 10 karakterlik **ASIN** kodunu `AMAZON_GLOBAL_PRODUCTS` içine yaz:
```js
'exercise-mat': { asin: 'B0XXXXXXXX', query: 'non slip exercise mat' },
```

### 5. (İsteğe bağlı) Türkiye için yerel mağaza
Amazon.com.tr ortaklık programı **sadece davetle** çalışıyor ve OneLink'te Türkiye yok. Türkiye'den gelen ziyaretçi amazon.com'a ya da en yakın mağazaya gider; kargo ve fiyat yüzünden satın alma ihtimali düşüktür. TR sayfaları için Hepsiburada Link Gelir linki girersen o ürün **TR'de Amazon yerine** bu linkle gösterilir:
```js
// AFFILIATE_CATALOG.tr içinde
'exercise-mat': { ...item('Egzersiz matı', '...'), store: 'Hepsiburada', url: 'https://...' },
```

### Bilmen gereken riskler
- **Yeni hesap satış şartı:** Amazon'un yeni ortaklık hesaplarını ilk 180 günde 3 uygun satış yapmazlarsa kapattığı yaygın olarak bildiriliyor. Bu şart, okuduğum Operating Agreement metninde geçmiyor; başvururken Associates Central'da teyit et. Bugünkü trafikle (dambıl sayfası ayda ~23 Google ziyareti) bu eşik zor. Hesap kapanırsa sonra yeniden başvurulabiliyor.
- **Yönlendirme yasak:** Linkler doğrudan amazon.com'a gider. Kendi alan adımızdan yönlendirmek veya üçüncü taraf kısaltıcı kullanmak hem Amazon kuralına aykırı hem de OneLink'i bozar.
- **Zorunlu cümle:** Amazon linki olan her kutuda "As an Amazon Associate I earn from qualifying purchases." otomatik gösterilir. Bu cümleyi kaldırma.

İstersen etiketini (ve varsa ASIN'leri) bana gönder, ben girip test ederim.

### Canlıya al
```bash
cd /Users/tolgadeveci/Projects/full-stack && npm test && npm run build && npx wrangler deploy
```
> Not: `npm run build`, `public/llms.txt` dosyasını yeniden üretir. Bu dosyada commit edilmemiş kendi değişikliğin varsa build'den önce yedeğini al.

## Otomatik olanlar
- Kutuda 3 dilde açık bildirim: "Bunlar ortaklık bağlantılarıdır… fiyat senin için değişmez. Uygulama ücretsiz kalır." Amazon linki varsa Amazon'un zorunlu İngilizce cümlesi de eklenir.
- Linkler `rel="sponsored nofollow noopener noreferrer"` ile yeni sekmede açılır. Google ücretli linklerde bunu istiyor.
- Her tıklama anonim `affiliate_link_click` olayı olarak kaydedilir (yerleşim, ürün kimliği, dil, mağaza). Kişisel veri gönderilmez.

## Kazancı ölçmek
- Hangi sayfa/ürün tıklanıyor: Supabase `growth_events` tablosunda `event_name = 'affiliate_link_click'`
- Kaç satış oldu, ne kazandın: her programın kendi paneli (satış verisi bize gelmez)

## Teknik dosyalar
`src/data/affiliateProducts.js` (katalog, yerleşimler, metinler) · `src/components/AffiliateGear.jsx` (kutu) · `src/lib/analyticsEventSchema.js` (olay) · testler: `src/data/affiliateProducts.test.js`, `src/components/AffiliateGear.test.jsx`
