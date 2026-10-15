# Full Balance — 15 Ekim 2026 günlük denetim ve onaylı yayın

Ölçüm: Europe/Istanbul tamamlanmış günleri; yönetici hariç anonim toplu Supabase verisi. Devam eden 15 Ekim hariçtir. W42 haftalık değerlendirme 13 Ekim’de tamamlandığı için tekrarlanmadı.

| Dönem | Yeni kayıt | Bu kayıtların mevcut planı | plan_generated olayları | Gözlenen eski kullanıcı dönüşü |
|---|---:|---:|---:|---:|
| 14 Ekim | 5 | 5 | 5 | 5 |
| 12–14 Ekim | 16 | 16 | 17 | 6 |
| 8–14 Ekim | 27 | 26 | 30 | 11 |

Toplam 309 kullanıcı, 500 hedefinin %61,8’i; toplam mevcut plan 281. Son iki gün 11 kayıt (5,5/gün), son üç gün 5,33/gün: zorunlu büyüme eşiği aşılmış durumda. Son yedi gün EN 22 / ES 1 / TR 4; EN+ES %85,2. Dil, ülke değildir. Mevcut plan sayısı aynı gün aktivasyon veya kohort dönüşüm oranı değildir; olay sayıları yeniden plan üretimini içerebilir. Dönüşler D1/D7 kohort oranı değildir.

Son 1/3/7 günde kimliği belirli aktif kullanıcı 10/22/38, fotoğraf analizi 1/7/8, antrenman tamamlama 0/0/11. Son yedi günde kayıt hatası 1, giriş hatası 0; son olay 14 Ekim 19:18 UTC. Eksik izinli ölçüm sıfır gerçek kullanım olarak yorumlanmadı.

İlk kaynak sinyali: doğrudan 15, ChatGPT 10, Google 2 kayıt. Açılış: EN fotoğraf kalori 11, EN ana sayfa 7, kök 4, EN ekipmansız 2, TR başlangıç pilates 2, coach 1. Ziyaret paydası olmadığından kaynak dönüşüm oranı hesaplanamaz.

## Arama ve izinli analiz

Search Console 7–13 Ekim: 863 gösterim, 36 tıklama, %4,2 CTR, ortalama konum 19,3. EN ana sayfa 14/103, TR dambıl 7/200, kök 5/40, ES bant 3/29 (tıklama/gösterim). “full balance” 10/105; “evde pilates programı ücretsiz” 0/16; “30 günlük dambıl programı” 0/30. Pilates sorgusunda gösterimden tıklamaya geçiş zayıf; 16 gösterim küçük örnektir.

GA 8–14 Ekim: 374 görüntüleme, 24 aktif kullanıcı, 1.264 olay. /admin 188 görüntüleme ve 577 olay içeriyor; bu yüzden toplamı gerçek müşteri trafiği veya edinim dönüşümü saymadık. /dashboard 82 görüntüleme, 24 aktif kullanıcı; EN fotoğraf doğruluğu makalesi 2 görüntüleme/1 aktif kullanıcı/7 olay. GA izinli örneklemdir, Supabase kayıt toplamıyla eşit olması beklenmez. Temel açık kayıt sonrası sürekli kullanım ve makaleden ürüne geçişin ölçülebilirliğidir; kesin nedensellik çıkarılamaz.

## Önceden onaylanan sadeleştirme paketi

Yeni günlük deney eklenmedi; kullanıcının açıkça onayladığı mevcut paket tamamlanıp yayınlandı:
- TR/EN/ES ana girişlerde büyük PT tanıtımı kaldırıldı; mevcut erişim alt bağlantıda korundu.
- Plan sonrası otomatik tur kaldırıldı, profil içinden isteğe bağlı kılavuz açılır.
- Bugün eylemi doğru antrenman gününü doğrudan açar; yerel tarih ve hafta sonu sonraki hafta geçişi düzeltildi. Gün açmak antrenmanı tamamlamaz.
- Başlangıç pilates başlığı ve açıklaması ücretsiz evde pilates arama niyetiyle eşleştirildi.
- Makale CTA tıklaması izinli anonim olayla ölçülür; ilk kaynak bilgisi ezilmez, rıza öncesi GA gönderilmez.

427 test / 66 dosya, tip kontrolü ve değişen dosyalarda lint başarılı. Tam lint çalıştırıldı: önceden var olan 591 hata sürüyor. Üretim derlemesi başarılı; 94 statik sayfa üretildi, 90 SEO sayfası ve 100 sitemap URL doğrulandı. Bağımsız incelemenin hafta geçişi bulgusu düzeltildi ve regresyon testi geçti. Kullanıcının public/llms.txt değişikliği korunup commit/yayın kapsamı dışında tutuldu.

Kod commit: 1955b9e, gitbibak/main dalına push edildi. Cloudflare canlı sürüm: 43c2ac68-7205-497f-94a9-2ab4cca0205b.

Yayın sonrası tarayıcıda TR/EN/ES girişleri, yeni Pilates H1/başlık, kayıt formu, oturumsuz dashboard→auth yönlendirmesi, sitemap ve robots doğrulandı. Pilates URL Search Console’da dizine ekli; tekrar indeks isteği gönderilmedi. Tam gerçek hesap oluşturma veya oturumlu antrenman kaydetme yapılmadı; bunlar test paketiyle kontrol edildi. Shell HTTP kontrolü 403 aldı; tarayıcı aynı canlı sayfaları açtı, erişim kısıtı site kesintisi olarak yorumlanmadı.

Kanıt: output/simplification-release-2026-10-15.png. Ürün etkisi için 16–18 Ekim tamamlanmış günleri beklenmeli; SEO etkisi yeniden tarama ve daha geniş 14–28 günlük örnekle değerlendirilmelidir. Şimdiki kayıtlar yeni yayının sonucu değildir.
