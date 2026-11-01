Destek: açık talep yok

# Günlük denetim ve onaylı ölçüm düzeltmesi — 1 Kasım 2026

Open/reviewing ve son 24 saat talepleri anonim kontrol edildi; sonuç boş. Yanıt veya kapatma yapılmadı.

Europe/Istanbul tamamlanmış günler; adminler hariç, toplam stok **379 üye, 500 hedefinin %75,8'i**.

| Dönem | Kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 31 Ekim | 8 | 8 | 5 |
| 29–31 Ekim | 16 | 16 | 10 |
| 25–31 Ekim | 33 | 31 | 23 |

3 günlük ortalama 5,33; haftalık EN+ES %69,7. Planlı üye sayısı sorgu anındaki stoktur, aynı gün tamamlanan aktivasyon değildir. Dil ülke kanıtı değildir. W44 haftalık çalışma önceki raporda tamamlandığından tekrar çalıştırılmadı.

## Antrenman deneyi ve tek kullanım iyileştirmesi

25–31 Ekim: 27 rehberli başlatma / 17 benzersiz üye; 7 guided bitirme / 5 üye, quick 0. Üye bazlı dönem oranı %29,4; olay oranı %25,9. Bu oran kesin eşleştirilmiş oturum hunisi değildir. workout_completed kaynak workout_session 7 / 5 üye, workout_panel 0. workout_logs.date ile 5 üye kayıtlı. Açık kapatma olayları: ilk set öncesi 8 olay/6 üye, under_25 1 olay/1 üye. Kapatmak kalıcı terk demek değildir. save_failed olayı görülmedi; tüm görünmeyen hataların yokluğu kanıtı değildir.

Önceki açık kullanıcı onayıyla ilk set öncesinde “Setini yaptıktan sonra sağdaki ✓ işaretine dokun” açıklaması TR/EN/ES eklendi. İlk set tamamlanınca kaybolur. Başka yeni akış/özellik yok. Hipotez: ilk seti işaretleme adımı daha anlaşılır olur; gelecek en az 3 tamamlanmış günde ilk-set öncesi kapatma ve guided bitirme izlenecek. Aynı hipotez hemen yeniden değiştirilmeyecek.

## Ölçüm düzeltmesi

GA4'e gönderilen genel `source`, ürün içi etkileşimlerde `interaction_source` olarak ayrıldı; ilk ziyaret/kayıt atıf takma alanları GA yükünden çıkarıldı. Supabase olayları ve mevcut first-party kaynakları korunuyor. Kampanya alanları izinli UTM listesinden doğrulanarak resmi `campaign_*` alanlarına taşınıyor; URL sorgusu/hash gönderilmiyor. Gecikmiş izin sonrasında açılış kampanyası korunuyor. Eksik medium tahmin edilmiyor, başka kampanyadan eski CTA taşınmıyor, bilinmeyen ilk temas değerleri daha sonraki kampanyayla doldurulmuyor. Kimlik doğrulama, şema, RLS ve izin politikası değişmedi.

Bu değişiklik geçmiş GA verisini düzeltmez. GA4 admin'de gerçek `signup_completed` kayıt etkinliğinin önemli faaliyet eşlemesi, otomatik geçmiş page_view çakışması ve auth referral kontrolü hâlâ gerekli. Tarayıcı erişimi önceki denemede kullanım kotası nedeniyle otomatik onay incelemesinde reddedildi; ayarlar değiştirilmedi ve DebugView doğrulaması yapılmadı. Engel başka tarayıcı/yöntemle aşılmadı.

## SEO ve erişim sınırları

Bugün yeni GSC/GA verisi okunamadı. Son doğrulanmış 31 Ekim hesabı: GSC 22–28 Ekim 30 tıklama/1.140 gösterim/%2,63 CTR; önceki 15–21 Ekim 27/894. Dambıl sayfası 18→9 tıklama, gösterim 264→320; içerik deneyine 3 Kasım öncesi dokunulmadı. Yedi deney sorgusunun en son ayrıntısı 30 Ekim günlük raporu ve 31 Ekim kapsamlı denetim raporunda; bugün güncellenmiş gibi sunulmadı. İki yeni blogun 22–28 Ekim gösterim/tıklaması 31 Ekim'de okundu; bugün tekrar indeks isteği yok.

Üretim derlemesi SEO/sitemap üretimini çalıştırdı: 97 statik sayfa üretildi, 93 SEO sayfası ve 103 sitemap URL doğrulandı. Kullanıcının public/llms.txt değişikliği korundu; yayın paketine yalnızca HEAD sürümü kondu, ilgisiz kullanıcı değişikliği yayınlanmadı.

## Doğrulama

31 ilgili ölçüm testi, tür denetimi ve değişen dosyaların lint'i geçti. Tüm paket ilk eşzamanlı build koşusunda iki zamanlama hatası verdi; kaynak değiştirmeden 2 worker ile tekrar çalıştırıldığında **71 dosya / 514 test geçti**. Genel lint mevcut 593 hatayla başarısız; bunlar değişen dosyalarda değil. Üretim derlemesi geçti.

Kamu ana sayfa, EN, ES, auth, dashboard, sitemap ve robots HTTP kontrolleri bu istemciye 403 döndü. Bu nedenle canlı sayfaların çalıştığı veya bozuk olduğu çıkarılmadı. Görsel UI doğrulaması ve gerçek GA isteği doğrulaması tamamlanmış değildir. Cloudflare yayın sonucu ve git commit ayrıca kayıt edilecek.
