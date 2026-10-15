# Ortaklık (affiliate) linkleri — kurulum rehberi

**Durum (15 Ekim 2026):** Altyapı hazır ve test edildi; **linkler boş**. Link girilene kadar sitede hiçbir şey görünmez.

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

## Senin yapacakların

### 1. Programlara katıl (hesap açma ve ödeme bilgisi senin işin)
1. **Hepsiburada Link Gelir:** TR sayfaları için, en kolay başlangıç.
2. **Trendyol Affiliate:** TR sayfaları için. Sosyal medya hesabı şartı olabilir.
3. **Amazon.es Afiliados:** ES bant sayfası için.
4. (İsteğe bağlı) **Amazon.com Associates:** uygulama içindeki İngilizce kullanıcılar için.

### 2. Her ürün için linkini üret
Panelde ürünü seç ve "link oluştur" ile kendi ortaklık linkini al. Ürün seçerken:
- Yorum sayısı ve puanı yüksek, iade koşulları net ürünleri seç.
- Aynı ürünü iki sette (ör. egzersiz matı) kullanabilirsin; link bir kez girilir, iki sayfada da görünür.

### 3. Linki dosyaya yapıştır
Dosya: `src/data/affiliateProducts.js` → `AFFILIATE_CATALOG`

Önce:
```js
'exercise-mat': item('Egzersiz matı', 'Yer hareketleri ve core çalışması için kaymayan zemin.'),
```
Sonra (sadece sonuna `store` ve `url` eklenir):
```js
'exercise-mat': { ...item('Egzersiz matı', 'Yer hareketleri ve core çalışması için kaymayan zemin.'), store: 'Trendyol', url: 'https://...senin-linkin...' },
```
- `tr` bölümüne TR linkleri, `es` bölümüne Amazon.es linkleri, `en` bölümüne Amazon.com linkleri girilir.
- Link **https** ile başlamalı, yoksa gösterilmez.
- Linki girilmemiş ürün gizli kalır; tek ürün girmen bile kutuyu açar.

İstersen linkleri bana gönder, ben girip test ederim.

### 4. Canlıya al
```bash
cd /Users/tolgadeveci/Projects/full-stack && npm test && npm run build && npx wrangler deploy
```
> Not: `npm run build`, `public/llms.txt` dosyasını yeniden üretir. Bu dosyada commit edilmemiş kendi değişikliğin varsa build'den önce yedeğini al.

## Otomatik olanlar
- Kutuda 3 dilde açık bildirim: "Bunlar ortaklık bağlantılarıdır… fiyat senin için değişmez. Uygulama ücretsiz kalır."
- Linkler `rel="sponsored nofollow noopener noreferrer"` ile yeni sekmede açılır. Google ücretli linklerde bunu istiyor.
- Her tıklama anonim `affiliate_link_click` olayı olarak kaydedilir (yerleşim, ürün kimliği, dil, mağaza). Kişisel veri gönderilmez.

## Kazancı ölçmek
- Hangi sayfa/ürün tıklanıyor: Supabase `growth_events` tablosunda `event_name = 'affiliate_link_click'`
- Kaç satış oldu, ne kazandın: her programın kendi paneli (satış verisi bize gelmez)

## Teknik dosyalar
`src/data/affiliateProducts.js` (katalog, yerleşimler, metinler) · `src/components/AffiliateGear.jsx` (kutu) · `src/lib/analyticsEventSchema.js` (olay) · testler: `src/data/affiliateProducts.test.js`, `src/components/AffiliateGear.test.jsx`
