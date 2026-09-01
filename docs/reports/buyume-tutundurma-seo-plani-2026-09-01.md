# Full Balance Büyüme, Tutundurma ve SEO/GEO Planı

**Tarih:** 1 Eylül 2026
**Canlı durum:** 87 kayıtlı kullanıcı (kurucu bildirimi)
**Kaynak:** Bu tarihte yapılan web araştırması; birincil kaynaklar Google Search Central, OpenAI/Perplexity bot dokümanları, Ahrefs ve Otterly 2026 atıf çalışmaları, Airship 2025 push raporu, HabitWalk mikro-randomize çalışması.

## 1. Bu sürümde yapılanlar

### Fotoğrafla kalori tahmini
- Model artık beslenme veritabanındaki İngilizce yiyecek adlarını sözlük olarak alıyor ve eşleşen yiyecekleri bu adlarla döndürüyor. Eşleşen yiyeceklerin kalori ve makroları modelden değil veritabanından geliyor.
- Yanlış eşleşmeler engellendi: "domates sosu" artık çiğ domatesle, "portakal suyu" portakalla, "yumurta beyazı" yumurtayla karışmıyor.
- Modelin abartılı kalori tahminleri sınırlandı: gram başına en fazla 9 kcal (worker), bilinmeyen yiyecekler için 100 g başına en fazla 600 kcal (istemci).
- Görünmeyen içerik önerileri (yağ, tereyağı, şeker, sos) tek dokunuşla eklenebilen çipler olarak geri geldi. Daha önce model bu bilgiyi üretiyor ama arayüz gösteremiyordu.
- Her yiyeceğin gramı artı/eksi düğmeleriyle düzenlenebiliyor; kalori aralığı model güveni ve eklenmemiş gizli içeriklere göre genişliyor.
- Fotoğraftan sonra "Eksik yiyecek ekle" ile manuel arama tekrar açılıyor.
- Uç nokta IP başına dakikada 12 istekle sınırlandı. Model `wrangler.toml` içindeki `MEAL_MODEL` değişkeniyle değiştirilebilir; `@cf/meta/llama-3.2-11b-vision-instruct` için JSON modu hazır.
- Analitiğe eşleşen yiyecek oranı, gizli içerik sayısı ve güven puanı eklendi; doğruluk fotoğraf saklamadan izlenebilir.

### Arkadaş davet döngüsü
- Her profil sunucuda kalıcı bir davet kodu alıyor (`FB` + 6 karakter). Mevcut kullanıcılar migration ile kod alıyor.
- Davet linkiyle kaydolan kullanıcı, davet edene bağlanıyor; plan oluşturduğunda davet "aktif" sayılıyor.
- Davet kartı üç yerde: Bugün sekmesi (kompakt), Profil sayfası, antrenman geri bildirimi kaydedildikten sonra açılan pencere.
- Paylaşım metni kişisel: isim, seri günü veya kaçıncı antrenman olduğuna göre değişiyor. WhatsApp, cihaz paylaşımı ve kopyalama seçenekleri var.
- İki yeni rozet: Takım Kurucu (1 davet), Topluluk Lideri (3 davet).
- Davet sayıları yalnızca toplam olarak gösteriliyor; davet edilen kişilerin kimliği açığa çıkmıyor.

### SEO/GEO
- robots.txt: Claude-SearchBot, Bingbot ve Applebot açıkça izinli.

## 2. Araştırma bulguları: neyin işe yaradığı, neyin yaramadığı

### Doğru bilinen yanlışlar
- **llms.txt hiçbir arama motoru tarafından kullanılmıyor.** Google resmi olarak gereksiz diyor; Ahrefs'in 137 bin alan adı taramasında dosyaların %97'si hiç istek almamış. Dosya zararsız, ama yatırım yapılmamalı.
- **FAQPage zengin sonucu 7 Mayıs 2026'da herkes için kaldırıldı.** SSS içeriği yapay zeka çıkarımı için değerli, işaretleme ise sonuç üretmiyor.
- **HowTo** işaretlemesi 2023'te kaldırıldı.
- Google'ın resmi görüşü: "GEO = SEO". Özel yapay zeka şeması, 50 kelimelik parçalama veya yapay zeka için yeniden yazma gerekmiyor.

### İşe yarayanlar
- **Çıkarılabilir cevap blokları.** H2 soru, ardından 40-80 kelimelik doğrudan cevap, sonra ayrıntı. Mart 2026'da Google AI Overview atıflarının yalnızca %38'i ilk 10 sonuçtan geldi; sıralama artık tek belirleyici değil.
- **Tazelik.** Perplexity ve ChatGPT güncel içeriği belirgin şekilde daha çok alıntılıyor. Hesaplayıcı ve rehber sayfalarında görünür "son güncelleme" tarihi ve gerçek güncellemeler gerekiyor.
- **Adlandırılmış istatistik ve kaynak.** Princeton GEO çalışmasında istatistik eklemek görünürlüğü %41, alıntı/kaynak eklemek %28 artırdı. Çalışma 2023 tarihli ve küçük ölçekli; yönlendirici kabul edilmeli.
- **Varlık tutarlılığı.** Aynı ad, açıklama, logo ve kurucu bilgisi; site, LinkedIn, Product Hunt, GitHub ve dizinlerde aynı URL ile.
- **Forumlar.** Perplexity atıflarının %16,9'u Reddit ve forumlardan geliyor. r/fitness, r/loseit, Türkçe ve İspanyolca forumlarda gerçek sorulara cevap vermek, link bırakmaktan daha etkili.
- **YMYL/E-E-A-T.** Sağlık içeriğinde adlandırılmış yazar, gerçek uzman incelemesi ve yöntem/sınır açıklaması gerekiyor. Sahte "uzman onayı" gösterilmemeli.
- **Search Console "Generative AI" raporu** (Haziran 2026, beta) yapay zeka görünürlüğünü ölçmek için açılmalı.

### Tutundurma kanıtı
- Sağlık ve fitness uygulamalarında iyi düzey: D1 %22-35, D7 %12-16, D30 %8-12.
- İlk oturumda ilk eylemi tamamlatan uygulamalar %40-60 ilk eylem oranına ulaşıyor; 2-4 tamamlanmış seans alışkanlık kırılma noktası.
- HabitWalk çalışması: yalnız hatırlatma etkisiz; hatırlatma + günlük taahhüt sorusu ("bugün ne zaman, nerede?") alışkanlık gücünü artırdı.
- Duolingo: aktif serisi olan kullanıcılar günlük dönüşte yaklaşık 3 kat daha olası; seri dondurma/onarma kayıp korkusundan kaynaklanan terki azaltıyor.
- Push izni oranı iOS %54, Android %85; ilk anlamlı bildirim kurulumdan 12-18 saat sonra gönderildiğinde D1 %15-30 artıyor (tedarikçi verisi).
- Davetle gelen kullanıcılar yaklaşık %37 daha iyi tutunuyor; davet dönüşümü %20-35, sağlıklı paylaşım oranı %5-15 (tedarikçi verileri, yönlendirici).

## 3. Sonraki 30 gün için öncelik sırası

1. **Migration ve worker dağıtımı.** `supabase db push` ve `npx wrangler deploy` çalıştırılmadan davet döngüsü ve yeni fotoğraf akışı canlıya çıkmaz.
2. **Fotoğraf doğruluk protokolü.** 20 gerçek öğün fotoğrafıyla moondream ve Llama 3.2 Vision karşılaştırılmalı; ölçüt eşleşen yiyecek oranı ve kalori sapması. Kazanan `MEAL_MODEL` olarak ayarlanmalı.
3. **Cevap blokları.** Kalori, BMI ve protein sayfalarına "Bu araç nasıl hesaplar?" ve "Fotoğraf neden kesin sayı vermez?" gibi H2 soru + kısa cevap blokları eklenmeli; görünür güncelleme tarihi konmalı.
4. **Günlük taahhüt sorusu.** Bugün ekranına "Bugün antrenmanı ne zaman yapacaksın?" tek dokunuşlu saat seçimi eklenip bildirim o saate bağlanmalı.
5. **Seri koruma.** Haftada bir "seri dondurma" hakkı; kaçırılan günde seri sıfırlanmak yerine dondurulmalı.
6. **Paylaşılabilir haftalık özet kartı.** Mevcut ShareCard antrenman ve seri verisiyle otomatik görsel üretmeli; paylaşım her antrenman sonrası tek dokunuşla sunulmalı.
7. **Forum varlığı.** Haftada 3 gerçek soruya, ürün linki olmadan veya sadece ilgili araç linkiyle cevap.
8. **Ölçüm.** Search Console Generative AI raporu, `invite_prompt_view`, `share` (invite_* yöntemleri), `meal_photo_analyzed` alanları haftalık raporlanmalı. K-faktörü = kişi başı davet × dönüşüm.

## 4. Yapılmaması gerekenler

- Sahte puan veya değerlendirme ile `aggregateRating` eklemek. SoftwareApplication zengin sonucu gerçek değerlendirme gerektirir.
- Aynı şablonla onlarca "X kalorisi" sayfası üretmek; Google'ın ölçekli içerik kötüye kullanımı politikası yöntemden bağımsız uygulanıyor.
- Parasal davet ödülü. Kanıtlar kozmetik rozet, seri koruma ve özellik açma gibi ödüllerin ücretsiz üründe yeterli olduğunu gösteriyor.
- Kullanıcı yorumlarını izin almadan yayımlamak.

## 5. Kaynaklar

- Google, Optimizing for generative AI features: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google, FAQPage structured data (kaldırma notu): https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Google, Software app structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app
- Google, Localized versions (hreflang): https://developers.google.com/search/docs/specialty/international/localized-versions
- Google, Spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- OpenAI bot dokümanı: https://developers.openai.com/api/docs/bots
- Perplexity bot dokümanı: https://docs.perplexity.ai/guides/bots
- Ahrefs, llms.txt çalışması: https://ahrefs.com/blog/llmstxt-study/
- Otterly, AI Citations Report 2026: https://otterly.ai/blog/the-ai-citations-report-2026/
- Search Engine Journal, AI Overview atıf düşüşü: https://www.searchenginejournal.com/google-ai-overview-citations-from-top-ranking-pages-drop-sharply/568637/
- Princeton GEO çalışması: https://arxiv.org/pdf/2311.09735
- HabitWalk mikro-randomize çalışma: https://pmc.ncbi.nlm.nih.gov/articles/PMC11635918/
- Lenny's Newsletter, Duolingo büyüme: https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth
- Airship, Push notification benchmarks 2025: https://www.airship.com/resources/benchmark-report/mobile-app-push-notification-benchmarks-for-2025/
- UXCam, retention benchmarks: https://uxcam.com/blog/mobile-app-retention-benchmarks/
- Web Share API desteği: https://caniuse.com/web-share
