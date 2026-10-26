Destek: açık talep yok

# Günlük denetim — 25 Ekim 2026

public.support_tickets tablosunda open/reviewing ve son24saatteki tüm talepler sorgulandı; sonuç boş. Yanıt veya durum değişikliği yapılmadı.

Dönemler Europe/Istanbul: 24 Ekim,22–24 Ekim,18–24 Ekim; devam eden gün hariç. Toplam345üye,500hedefinin%69’u.

| Dönem | Yeni kayıt | Şu anda planı bulunan yeni kayıt | EN+ES |
|---|---:|---:|---:|
| 1gün | 2 | 2 | 1 |
| 3gün | 10 | 9 | 6 |
| 7gün | 30 | 27 | 21 |

Son2gün5kayıt,ortalama2,5: zorunlu iyileştirme eşiği altında. Son3günortalama3,33; haftalık EN+ES%70. Planı bulunma aynı gün plan olayı veya geri dönüş değildir. Kimliği bağlı aktif kullanıcı1/3/7gün2/12/36; plan_generated2/11/30. Olaylar admin ve admin bağlantılı anonim kimlikler hariç izinli ölçüm kapsamındadır; eksik ölçüm sıfır kullanım sayılmadı.

GSC17–23Ekim960gösterim31tıklama%3,2CTR; konum19. Öne çıkan sorgular full balance3/80,30günlükdambılprogramı2/30. GA18–24Ekim35oturum28etkileşimli660olay; Organic Search2oturum. GAkanal/izin/mülksaatdilimi ve GSCgecikmesi nedeniyle sayılar doğrudan karşılaştırılmadı. GAönemlifaaliyet0 gerçek kayıt0değildir.

## Deney1: içerik

Kritik hata yoksa3Kasım’a kadar içeriklere müdahale yok. 22Eylül–19Ekim28gün tabanı ile20–23Ekim4gün karşılaştırması; tıklama/gösterim/CTR/konum:

| Sorgu | Önce28gün | Sonra4gün |
|---|---|---|
| 30 günlük dambıl programı | 2/80/%2,5/6,1 | 0/14/%0/5,9 |
| dambıl çalışma programı | 0/31/%0/9,3 | 0/4/%0/11,8 |
| dambıl antrenman programı | 0/22/%0/8,0 | 0/2/%0/7,5 |
| evde dambıl ile spor programı | 2/37/%5,4/8,2 | 0/6/%0/7,7 |
| evde dumbell ile vücut geliştirme programı | 2/55/%3,6/8,9 | 1/8/%12,5/8,1 |
| evde pilates programı ücretsiz | 0/70/%0/8,3 | 0/13/%0/6,9 |
| 30 günlük pilates programı | 0/43/%0/8,7 | 0/55/%0/8,5 |

Tüm86sorgu500satırseçilerek okundu. Farklı sürelerin ham toplamları büyüme oranına dönüştürülmedi;4gün/küçük örneklemden başarı veya başarısızlık ilan edilmedi. Üçblog21EkimGSCdenetimindeindeksliydi; bugün tekrar istek gönderilmedi veya yeni doğrulama diye sunulmadı. Kullanıcının9Eylül–6Ekim referansı bu28günle karıştırılmadı.

## Deney2: antrenman

Son7gün started16olay/10üye; guidedcompleted2olay/2üye; quick0/0. Üyebazlıbitirme%20; olaybazlı%12,5. Son3gün4başlatma/4üye,0bitirme; son1gün0başlatma,oranhesaplanamaz. workout_completed kaynakları son7gün workout_session2,workout_panel0. workout_logs.date18–24Ekim kaydı olan3üye. Başlangıç13–19Ekim1tamamlamaolayı/30gün37 referansı korundu. Tekrar başlatmalar paydada bulunduğundan olay ve üye oranı ayrıldı.

## Bugünkü tek iyileştirme: seans çıkışını ve kaydetme başarısızlığını ölçme

İki günlük kayıt ortalaması eşik altında, seans tamamlaması%20 ve mevcut ölçüm hangi aşamada çıkıldığını ayıramıyor. Arama içerikleri3Kasım’a kadar beklemede. Bu nedenle kanıtsız yeni içerik/arayüz değişimi yerine daha önce saptanan ölçüm boşluğu giderildi.

- workout_session_abandoned: yalnızca kullanıcı kapat düğmesi veya Escape ile çıktığında, tamamlanan set oranının kaba aralığı ve çıkış yöntemi. Bu, devam edilebilen taslağın kapatılmasıdır; kalıcı kullanıcı kaybı demek değildir. Sekme kapanışı/arka plana geçiş kapsam dışıdır.
- workout_session_save_failed: yalnızca kaydetme hazırlığı veya gerçek günlük yazma reddi için güvenli neden kategorisi. Başarılı yazma sonrası kutlama hatası kaydetme hatası sayılmaz.
- Aynı kapatmanın iki kez sayılması ve devam eden başarılı bitişin çıkış sayılması engellendi. Eşzamanlı bitirme ve senkron callback hata durumları test edildi.
- İzinli mevcut analytics altyapısı, sıkı olay/özellik değer listeleri kullanıldı. Ham hata, egzersiz adı, set/tekrar/kilo, fotoğraf veya kişisel veri eklenmedi. Yeni tablo, yetki, RLS veya kimlik doğrulama değişikliği yok. Canlı growth_events kısıtları salt okunur kontrol edildi; yeni adlar mevcut biçim kısıtına uyuyor.
- Admin olay okumasına iki olay dahil edildi. Kullanıcıya yeni ekran/alan eklenmedi. Bu değişikliğin kayıt veya bitirme oranını artırdığı iddia edilmiyor; sonraki düzeltmenin kanıtını üretmek amaçlanıyor.25Ekimkısmi gün,26–28Ekimilk3tamamlanmışgün;29Ekim’den itibaren yeterli olay varsa çıkış aralıkları ve kaydetme hatası ayrımı değerlendirilir.

Canlı kontrol: ana/,EN,ES,kayıt formu,girişe dönen oturumsuzdashboard,sitemapXMLve robotsokundu; robotsta kamu sayfaları açık. Gerçek hesap/kayıt açılmadı, özel oturumlu gerçek kullanıcı seansı çalıştırılmadı. Önceki gün yarım kalan kamu yönlendirmeleri bu tur doğrulandı. Kullanıcıya ait public/llms.txt ve ilgisiz .ad-capture/ dahil dosyalara dokunulmadı.

W43haftalık bölüm20Ekimtamamlandığındantekrarlanmadı.

## Doğrulama

71 dosyada 505 test başarılı. İlk çalışmada işçi başlatma ve uzun zaman aşımı hataları oluştu; tek işçiyle tüm paket yeniden çalıştırılıp geçti. Değişen dosyaların lint kontrolü, analytics tip kontrolü ve diff kontrolü başarılı. Tam lint mevcut kod tabanında 593 hata veriyor. Üretim derlemesi geçti; 97 statik sayfa üretildi, 93 SEO sayfası ve 103 sitemap URL doğrulandı. SEO/sitemap üretimi güncellendi; içerik tarihleri deney için değiştirilmedi.
