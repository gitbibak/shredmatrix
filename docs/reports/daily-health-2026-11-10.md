Destek: açık talep yok

# Günlük ve haftalık denetim — 10 Kasım 2026, W46

Open/reviewing ve son 24 saatte gelen destek sorgusu boş. Yanıt/kapama yapılmadı. Çalışma ağacındaki public/llms.txt ve ilgisiz kullanıcı dosyaları korundu. Bu haftanın haftalık bölümü bu ana görevde tamamlandı; W46 tekrar çalıştırılmayacak. Erişilemeyen ölçümler aşağıda ayrıca işaretlendi.

## Kayıt ve 500 hedefi

Europe/Istanbul, admin hariç, tamamlanmış günler. Toplam **416 üye: %83,2**, hedefe 84 üye kaldı. Stok devam eden günü içerebilir; dönemler içermez.

| Dönem | Kayıt | Şu anda planı olan yeni üye | EN+ES |
|---|---:|---:|---:|
| 9 Kasım | 3 | 3 | 2 |
| 7–9 Kasım | 12 | 11 | 9 |
| 3–9 Kasım | 28 | 27 | 22 |

Son 2 gün 10 kayıt, ortalama 5; son 3 gün ortalama 4. Haftalık EN+ES **%78,6**. Plan mevcudiyeti aynı gün aktivasyonu değildir; dil ülke veya ilk giriş dilinin kesin kanıtı değildir. Eşikler karşılandığı için yeni büyüme değişikliği zorunlu değil.

## Haftalık 7/30 gün karşılaştırması

7 gün: 3–9 Kasım; 30 gün: 11 Ekim–9 Kasım. Pencereler örtüşür; eşit uzunlukta bağımsız dönemler veya önceki ay karşılaştırması değildir.

| Ölçüm | 7 gün | 30 gün |
|---|---:|---:|
| Yeni kayıt | 28 | 123 |
| Günlük kayıt ortalaması | 4,00 | 4,10 |
| Mevcut planı olan yeni üye | 27 (%96,4) | 116 (%94,3) |
| EN / ES / TR | 20 / 2 / 6 | 87 / 5 / 31 |
| EN+ES payı | %78,6 | %74,8 |
| D1 olayda gözlenen dönüş | 4/25 (%16,0) | 17/120 (%14,2) |
| D7 olayda gözlenen dönüş | Uygun kohort yok | 1/95 (%1,1) |

D1/D7: kayıt tarihinden tam 1/7 İstanbul takvim günü sonra kimliğe bağlı herhangi bir growth_event olan üye. Payda, ilgili dönüş günü 9 Kasım sonuna kadar tamamlanmış kohort; admin hariç. 7 günlük yeni kohortta D7 henüz olgunlaşmadı, sıfır dönüş sayılmadı. Bu olay kapsamındaki ölçümdür; izin/kimlik bağlantısı dışında kullanım yokluğu çıkarılamaz. Dönemlerde yeni üyelerin 28/28 ve 123/123'ünde en az bir kimliğe bağlı olay vardı; bu anonim ziyaretçi kapsamı veya gelecekte tüm kullanımın ölçüldüğü anlamına gelmez.

Profil kaynak atfı, kayıt/mevcut plan: 7 gün chatgpt.com17/17, google7/7, direct4/3; 30 gün chatgpt.com75/69, google18/18, direct30/29. İlk landing: 7 gün / 11/10, /en 8/8, /en/photo-calorie-counter 3/3, altı diğer yol 1/1'er; 30 gün /en39/35, /35/34, EN fotoğraf aracı30/28, diğerleri19/19. Bunlar kayıt kohortlarıdır; tüm ziyaretçi paydasıyla açılış sayfası dönüşümü değildir. Kaynak atfı kesin nedensellik sayılmaz. Güçlü aşama plan mevcudiyeti; zayıf sinyal ölçülen uzun vadeli geri dönüş ve ilk antrenmana geçiş.

## Canlı sağlık ve Analytics

Canlı /en, /es, ana sayfa, EN kayıt formu ve oturumsuz /dashboard→/auth yönlendirmesi kontrol edildi. Google seçeneği kayıt alanlarından önce. Sitemap XML ve robots.txt açıldı; kamu sayfaları taramaya açık, özel yollar engelli. /en/pricing içeriği açıldı. Beyaz ekran veya görünür kayıt engeli bulunmadı. Gerçek hesap/OAuth isteği oluşturulmadı; oturumlu özel uygulama uçtan uca test edilmedi.

GA4 rapor tarihleri açıkça doğrulandı:

| Ölçüm | 3–9 Kasım | 11 Ekim–9 Kasım |
|---|---:|---:|
| Oturum | 125 | 336 |
| Etkileşimli oturum | 100 | 264 |
| Etkileşim | %80 | %78,57 |
| Olay | 1.981 | 5.224 |
| Tüm önemli faaliyetler | 10 | 10 |

Önemli faaliyetler özellikle signup_completed filtresine alınmadı; 10 değeri gerçek yeni üye veya kayıt olayı olarak etiketlenmedi. Kanal satırları 7 gün Direct63, Unassigned50, AI Assistant11, Referral8, Organic Search3; 30 gün Direct88, Unassigned129, AI Assistant22, Referral19, Organic Search88, Organic Social1. Satırlar toplamı rapor toplamıyla zorla eşitlenmedi. Mülk saat dilimi ayrıca doğrulanmadı. Genel Analytics admin/inceleme trafiğini de içerir: 30 gün sayfa raporunda /admin446 görüntüleme/3 aktif kullanıcı. Supabase admin hariç kayıtla bölünerek dönüşüm hesaplanmadı.

Sayfa raporunun ilk 10 satırı 30 günlük pencerede açıldı: /auth153 görüntüleme/30 aktif kullanıcı; /en59/9; /es25/1; EN fotoğraf aracı8/3. Challenge/pricing yolları bu ilk10'da yok; tüm satırları açma seçeneği sonuç vermediğinden güncel sayfa ziyaretleri **eksik**, sıfır sayılmadı. Profil landing_path kayıtları ayrıca aşağıda mevcut. Kamu fiyat sayfasının çalışması trafik ölçümünün tam olduğu anlamına gelmez.

## Search Console ve içerik

6 Kasım ayrıntı erişiminin önceki otomatik inceleme reddi değişmedi; bugün tekrar zorlanmadı veya başka yüzeyle aşılmadı. **Güncel GSC ve haftalık 7/30 sorgu-sayfa karşılaştırması alınamadı**. Son doğrulanmış 28 Ekim–3 Kasım Web(metin):36 tıklama/1.083 gösterim/%3,3 CTR/12,1 konum. Full balance3/109; evde dambıl ile spor programı1/10. Dambıl sayfası6/224, /en6/142, tek-dambıl blogu6/55, Pilates1/130. Bunlar bugünkü yeni trafik veya düşüş ölçümü değildir.

20 Ekim içerik deneyinde son yedi sorgu karşılaştırması 5 Kasım raporundaki 20 Ekim–2 Kasım14gün / 22 Eylül–19 Ekim28gün pencereleri; farklı sürelerin toplamları büyüme yüzdesi değildir. Tarihli 30 günlük Pilates0/161 konum8,6; 30 günlük dambıl0/50 konum5,8; evde Pilates ücretsiz0/43 konum7,5. Önceki iki blog performansı ve evde-kas-yapilir-mi için3Kasım indeksli kontrolü son referans. Bugün yeni indeks doğrulaması/isteği yok.

## İzlenen deneyler

1. **Antrenman:** 3–9 Kasım started26olay/14üye; today_focus11/6, workout_panel15/10. Guided completed4/4, quick1/1, birleşik5olay/4benzersizüye; dönem kullanıcı oranı **%28,6**, olay oranı%19,2; eşleşmiş seans dönüşümü değil. workout_completed source workout_session4/4, workout_panel1/1; workout_logs.date5kayıt/4üye. 9Kasım started5/4, guided1/1, quick0; log1/1. Çıkış12olay: ilk setten önce none/button10olay/8üye, under_25/button1/1,25_49/button1/1; save_failed0. Açık kapatma kalıcı terk demek değil. İlk set öncesi sürtünme adayı sürüyor; nedenini doğrulayan yeni kanıt olmadan 1Kasım açıklaması tekrar değiştirilmedi.
2. **start28:** 9Kasım today viewed20/7, joined0;7gün viewed97/26, joined1/1. challenge_landing viewed,completed,shared0. Üç challenge landing_path son gün/7gün kayıt0. Kart bağlamı kamu page_view değildir. GüncelGAziyaret/GSC eksik; **18Kasım'a kadar sayfalar korunuyor**.
3. **Pilates4Kasım başlık:** yeni CTR/konum ve tam önceki28gün tabanı alınamadı.153gösterim/0tık/8,6 referansı tam28gün tabanı gibi sunulmadı. **18Kasım öncesi tekrar değişiklik yok**.
4. **Fiyat karşılaştırması:** üç pricing landing_path son gün/7gün kayıt0;GAziyaret eksik, sıfır değil. storePrices4Kasım tarihli; **4Aralık ve ayda bir resmiAppStore doğrulaması** gerekli. Tahminle fiyat değişikliği yok.
5. **Google kayıt seçeneği8Kasım:** ilk tam gün9Kasım started/completed email2/2üye,google1/1.7gün completed email18/18,google10/10. Kimliğe bağlı olaylar ziyaretçi hunisi değildir. Bir tam gün ve aynı dönemde kullanıcının EN/ES restorasyonu nedeniyle nedensel sonuç yok. İlk3tamgün9–11Kasım, ilk7tamgün9–15Kasım; kritik hata dışında yeniden düzenleme yok.

## Sonuç ve doğrulama

Kayıt ortalamaları ve yabancı dil payı hedefte. Bugün yeni kod/deney/yayın yok; mevcut deneyler izleniyor. Test/build bugün yeniden çalıştırılmadı; 8Kasım557test ve build başarısı tarihli referans. Genel lint594mevcut hata da 8Kasım ölçümü. Yalnız bu rapor ve W46 haftalık tamamlanma hafızası kaydedildi. Kaynak/açılış sayfası ziyaret dönüşümü ve güncelGSC karşılaştırmasının erişim sınırları nedeniyle eksik kaldığı açıkça korundu.
