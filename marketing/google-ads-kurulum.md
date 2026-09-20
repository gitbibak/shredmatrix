# Google Ads kurulum: 20 dakikalık yol

Hesap ve bütçe kurucuya ait; bu dosya kampanyayı elle yazma işini kaldırır.

1. Google Ads hesabı aç (ads.google.com), **Uzman moduna** geç; "Akıllı kampanya" sihirbazını atla.
2. Dönüşümler: Araçlar → Dönüşümler → "GA4 olaylarını içe aktar": `sign_up` (birincil), `plan_created` (ikincil). GA4 zaten çerez onayından sonra çalışıyor.
3. Google Ads Editor'ü indir (ads.google.com/editor), hesabı ekle.
4. Editor'de Hesap → İçe aktar → Dosyadan → `marketing/google-ads-editor-import.csv`. Sütunlar Editor'ün beklediği başlıklarla eşleşir; eşleştirme ekranında "Kampanya, Reklam grubu, Anahtar kelime, Kriter türü, Son URL, Başlık, Açıklama" alanlarını onayla.
5. İçe aktarımı gözden geçir: her RSA için "Reklam gücü" en az "İyi" olmalı. Sonra "Gönder".
6. Kampanyalar **Duraklatılmış** gelir. Önce TR kampanyasını aç (150 TL/gün). ES'i TR'de 100 tıklama dolduktan sonra aç (6 €/gün).
7. Konum: Türkiye; dil: Türkçe. "Arama ağı ortakları" ve "Görüntülü Reklam Ağı" kapalı. Reklam programı: her gün 07:00–23:00.
8. Sağlık kategorisi kuralı: yeniden pazarlama ve benzer kitle listesi oluşturma; yalnızca anahtar kelime hedefleme.
9. 7. günde bak: tıklama başına maliyet, `sign_up` başına maliyet, arama terimleri raporundan yeni negatifler (film, oyun, pdf gibi).
10. 100 tıklamadan önce hiçbir başlığı silme; sonra CTR'ı en düşük iki başlığı değiştir.

Bütçe eşiği: `sign_up` başına maliyet 40 TL üstüne çıkarsa kampanyayı durdur ve arama terimlerini temizle.
