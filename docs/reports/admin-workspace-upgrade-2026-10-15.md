# Admin çalışma alanı — 15 Ekim 2026

Yayınlanan kod: 53d730d. Cloudflare sürümü: b7ba78c1-f6be-471f-9b1f-594e6f755aaf.

- Yeni günlük genel bakış: 500 üye hedefi, plan aktivasyonu, açık destek ve planı olmayan üyeler için mevcut bölümlere hızlı erişim. Tekrarlanan istatistikler azaltıldı.
- Daha okunaklı metinler, kontrast ve dokunma hedefleri; masaüstünde sabit menü, telefonda kapatılabilir menü, klavye odağı ve içerik bağlantısı.
- Bölüm URL’leri korunur; arama/sayfa sonuçlarında eski istekler yeni sonuçları ezmez. Son kullanıcı silinince sayfa aralığı düzeltilir.
- Hata, yüklenme ve gerçek boş sonuç birbirinden ayrıldı. Bir veri kaynağı başarısızsa diğer başarılı kartlar görünür. Son tam yenileme zamanı yalnızca tüm özet istekleri başarılı olduğunda ilerler.
- Destek ve kalite taslakları yenilemede korunur; sayfa kapanırken kaydedilmemiş taslak uyarısı. Aynı anda çakışan yazma işlemleri engellenir. Başarı ve hata geri bildirimi panelde görünür.
- Silme penceresi kalıcı etkiyi açıklar, SİL yazılmadan isteği etkinleştirmez. Gerçek hesap silme yapılmadı.
- Kaynağı belirsiz destek bağlantıları yalnızca HTTP/HTTPS ise gösterilir. İnceleme kanıtı geçerli HTTPS URL olmalıdır.
- Özetlerde API satır sınırını aşan veriler sabit anahtar sırasıyla sayfalanır; eksik/çakışan/değişen sayım hata olarak gösterilir. Destek ve bekleyen yorumlar son 60 kayıtla sınırlanmaz.
- İstanbul bugünün antrenman tarihi ve kayıt grafiği düzeltildi. Dağılımlarda yönetici hesapları ve geçersiz yaşlar dışlandı. EN/ES arayüz dili ülke olarak etiketlenmez. D1/D7 mevcut UTC ölçüm tanımıyla açıkça etiketlendi.

Doğrulama: 457 test / 68 dosya başarılı; değişen dosyalarda lint ve tip kontrolü başarılı; üretim derlemesi başarılı, 94 statik sayfa / 90 SEO sayfası / 100 sitemap URL doğrulandı. Tam lint: önceden var olan 591 hata sürüyor. Kullanıcının public/llms.txt değişikliği korunup yayın kapsamına alınmadı. Önizleme dosyaları üretim paketine dahil değil.

Tarayıcıda örnek verilerle masaüstü ve 390px telefon görünümü, menü, kullanıcı listesi, silme onayı ve destek yanıt ekranı kontrol edildi. Gerçek özel veriler veya gerçek mutasyonlar kullanılmadı. Canlı /admin oturumsuz erişimi giriş ekranına yönlendirdi. İlk eski sürüm önbelleği hatası yenileme sonrası kalktı; yeni dosyalarla giriş ekranı doğrulandı. Oturumlu gerçek admin uçtan uca kontrolü yapılmadı. Sayfalama anahtarları canlı şema üzerinden salt okunur doğrulandı.

Görsel kanıtlar (örnek veriler): output/admin-overview-desktop-2026-10-15.png, output/admin-support-mobile-2026-10-15.png.

Kapsam dışı kalan mevcut güvenlik inceleme notları: admin silme Edge Function hedef profil okuma hatasında daha sıkı durmalı; kullanıcı deneyimi yayın onayında eşzamanlı içerik değişikliğine karşı sürüm koşulu eklenebilir. Bu sürüm Edge Function veya RLS değiştirmedi. Yüksek riskli silme/yayın işlemleri canlı test amacıyla tetiklenmedi. Kritik alt ajan kota sınırına ulaştıktan sonra kalan kontroller ana görevde tamamlandı.
