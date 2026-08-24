# Full Balance Ürün ve Startup Durum Raporu

**Tarih:** 24 Ağustos 2026  
**Aşama:** Çalışan beta, ölçümlü büyüme ve güven kanıtı oluşturma dönemi

## Yönetici Özeti

Full Balance teknik olarak çalışan, çok dilli, altı hedef modunu beslenme ve günlük sağlık alışkanlıklarıyla birleştiren güçlü bir beta üründür. En belirgin avantajı ücretsiz oluşu ve farklı hedefleri tek uygulamada kişiselleştirmesidir. En büyük risk artık yazılımın açılması veya plan üretmesi değil; kullanıcının ilk haftada geri dönmesi, içeriğe güvenmesi ve gerçek sonuç gördüğünü kanıtlamasıdır.

Bu sürümde bildirim izni ilk açılıştan kaldırıldı; yalnızca kullanıcı değer gördükten sonra, açık açıklamayla isteniyor. Bildirimler TR/EN/ES dilinde, yerel saate göre ve günde en fazla bir kez gönderilecek şekilde düzenlendi. Üç antrenmanı tamamlayan kullanıcıdan doğal zamanda yorum isteniyor. Açık yayın izni bulunmayan yorumun yönetici tarafından yanlışlıkla yayımlanması da engellendi.

## Güncel Puanlama

| Alan | Puan | Değerlendirme |
|---|---:|---|
| Teknik güvenilirlik | 9.3/10 | 118 test, kalite kontrolü ve üretim derlemesi başarılı |
| Ürün sadeliği | 8.7/10 | “Bugün” merkezi, ilk plan üç adım, izinler bağlama göre gösteriliyor |
| Kişiselleştirme | 8.6/10 | Altı modül, ortam/ekipman, sağlık-alerji ve antrenman geri bildirimi kullanılıyor |
| Güvenlik ve gizlilik | 8.5/10 | RLS, açık izin, güvenli zamanlanmış çağrı ve hassas olmayan bildirim içeriği |
| Uluslararası hazırlık | 8.4/10 | TR/EN/ES arayüz ve yerelleştirilmiş edinim akışı; İngilizce derinlik artırılmalı |
| Organik edinim | 6.2/10 | Teknik SEO güçlü, fakat tarihsel kaynak bilgisinin çoğu “bilinmiyor” |
| Kullanıcı tutma kanıtı | 5.5/10 | D1/D7 ölçümü yeni; geri dönüş henüz yeterince kanıtlanmış değil |
| Uzman ve sosyal kanıt | 4.5/10 | Sistem hazır; yalnızca 1 onaylı yorum ve 0 tamamlanmış uzman onayı var |

**Genel seviye: 7.6/10.** Ürün beta kullanıcılarına hazırdır; mağaza ölçeği ve kurumsal satış anlatısı için tutunma, uzman onayı ve gerçek kullanıcı sonuçları henüz tamamlanmalıdır.

## Canlı Durum

- 71 kayıtlı kullanıcı bulunuyor.
- Son 7 günde 10, son 30 günde 50 yeni kayıt oluştu.
- 61 kullanıcı plan oluşturdu; kayıt-plan aktivasyonu %85,9.
- Son 7 günde 9 aktif kullanıcı var.
- Bilinen dil dağılımı: 45 Türkçe, 15 İngilizce, 1 İspanyolca.
- 8 kullanıcı antrenman, 57 kullanıcı su, 8 kullanıcı uyku kaydı oluşturdu.
- 1 yayımlanabilir kullanıcı yorumu var; uzman onayı henüz yok.

Plan oluşturma oranı güçlüdür. Darboğaz, plan sonrasında düzenli kullanım ve antrenman aktivasyonudur. Bu nedenle yeni özellik sayısını artırmak yerine “Bugün → antrenman → geri bildirim → uyarlanmış sonraki gün” döngüsü güçlendirilmelidir.

## Bu Sürümde Tamamlananlar

1. Bildirim izni, en az iki gün kullanımdan veya ilk antrenmandan önce gösterilmiyor.
2. “Şimdi değil” seçimi 14 gün boyunca korunuyor.
3. TR/EN/ES bildirim metinleri ve kullanıcının yerel saat dilimine göre teslim eklendi.
4. Aynı kullanıcıya aynı yerel günde birden fazla rutin bildirim engellendi.
5. Bildirimlerde sağlık, alerji ve hesap ayrıntısı kullanılmıyor.
6. Üç antrenmandan sonra gösterilen, 30 gün ertelenebilen doğal yorum isteme akışı eklendi.
7. Açık yayın izni ve yeterli açıklaması olmayan kullanıcı yorumu yayımlanamıyor.
8. İspanyolca giriş sayfasındaki karışık İngilizce/Türkçe etiketler düzeltildi.
9. Canlı veritabanı güncellendi ve bildirim servisi başarıyla doğrulandı.

Apple ve Android, bildirim izninin doğru bağlamda, amacı açıkça anlatılarak istenmesini öneriyor. Yeni akış bu yaklaşıma uyuyor: [Apple bildirim rehberi](https://developer.apple.com/design/human-interface-guidelines/notifications), [Android izin rehberi](https://developer.android.com/develop/ui/compose/notifications/notification-permission).

## Pazar Konumu

Full Balance tek amaçlı antrenman veya kalori uygulamalarından daha geniştir: kas gelişimi, yağ yakımı, yoga, meditasyon, reformer, pilates ve beslenmeyi tek hesapta toplar. Bu genişlik edinim açısından avantaj, güven açısından risktir. Kullanıcı “her şeyi yapıyor” ifadesini ancak her modülün uzman incelemesi ve gerçek sonuçlarla desteklenmesi halinde güçlü bulur.

Araştırmalar, kişiselleştirilmiş geri bildirim, öz izleme, hedefler ve zamanında hatırlatmaların etkileşimi destekleyebildiğini; teknik sorunların ve zor gezinmenin ise düşürdüğünü gösteriyor. Ancak kanıt kalitesi her çalışmada aynı değil ve sonuçlar garanti anlamına gelmiyor: [mHealth sistematik incelemesi](https://pubmed.ncbi.nlm.nih.gov/34807837/), [etkileşim kapsam incelemesi](https://pubmed.ncbi.nlm.nih.gov/34637651/). Uygulama terk oranı araştırması, insan geri bildirimi ve uygulama içi izleme ile daha düşük kayıp arasında ilişki buluyor; çalışma alanı ruh sağlığı olduğu için bunu Full Balance'a doğrudan kanıt değil, destekleyici işaret olarak değerlendirmek gerekir: [meta-analiz](https://pubmed.ncbi.nlm.nih.gov/31969272/).

## Kalan Gerçek Riskler

### 1. Uzman Onayı

Yedi içerik alanı için onay sistemi hazır, fakat gerçek sertifikalı antrenör, diyetisyen, yoga ve pilates uzmanı incelemesi tamamlanmadı. Bu işlem yazılımla üretilemez ve sahte onay gösterilmemelidir.

### 2. Tutunma Verisi

D1 geri dönen kullanıcı 0, D7 geri dönen kullanıcı 1 görünüyor. Ölçüm yakın zamanda kurulduğu için veri henüz olgun değil. En az 2-4 hafta aynı olay tanımlarıyla izlenmelidir.

### 3. Sosyal Kanıt

Yalnızca bir onaylı yorum bulunuyor. Kurumsal güven ve mağaza yayını öncesinde izinli, gerçek ve sonuç odaklı en az 20-30 kullanıcı anlatısı hedeflenmelidir.

### 4. Güvenlik Plan Sınırı

Supabase'in sızmış parola kontrolü ücretli plandadır. Uygulama güçlü parola zorunluluğu uyguluyor, ancak bu kontrol sızmış parola veri tabanıyla karşılaştırmanın tam karşılığı değildir. Ayrıntı: [Supabase parola güvenliği](https://supabase.com/docs/guides/auth/password-security).

## 500 Kullanıcı Senaryosu

Hedefe kalan kullanıcı sayısı 429'dur.

| Ortalama yeni kayıt | Yaklaşık süre |
|---|---:|
| Mevcut hız: haftada 10 | 10 ay |
| Günde 3 | 4,8 ay |
| Günde 5 | 2,9 ay |

Bu süreler doğrusal senaryodur; sıralama veya sosyal paylaşım garantisi değildir. En sağlıklı büyüme hedefi yalnızca kayıt değil, **kayıt + plan + ilk antrenman + D7 dönüş** birleşimidir.

## 30 Günlük Öncelik

### 1. Hafta: Ölçümü Sabitle

- D1, D7, ilk antrenman ve geri bildirim dönüşümünü değiştirmeden izle.
- Bildirim izin oranını ölç; ilk gün izin isteme.
- Destek taleplerine 24 saat içinde cevap ver.

### 2. Hafta: Güveni Üret

- Gerçek uzmanlara yedi içerik alanını incelet ve kanıt yüklet.
- Üç antrenmanı tamamlayan kullanıcılardan açık izinli yorum topla.
- Ağrı bildiren akışları uzmanla ayrıca gözden geçir.

### 3. Hafta: Tek İngilizce Kitle

- “Beginner home workout + simple nutrition plan” kitlesine odaklan.
- İngilizce rehberleri gerçek kullanıcı sorularına göre derinleştir.
- Ana CTA'ları UTM ile ayır ve hangi sayfanın kayıt getirdiğini izle.

### 4. Hafta: Karar Ver

- İç operasyon hedefleri: D1 %20+, D7 %10+, ilk 24 saatte antrenman %25+, İngilizce yeni kayıt payı %50+.
- Bunlar sektör vaadi değil, başlangıç karar eşikleridir.
- Başaramayan ekranı yeniden tasarla; yalnızca görüntülenme getiren ama aktivasyon getirmeyen içeriği çoğaltma.

Google da arama motoru için yazılmış içerikten çok, kullanıcıya birincil değer sunan özgün ve yararlı içeriği öneriyor: [yararlı içerik rehberi](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [SEO başlangıç rehberi](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). Bu nedenle otomatik olarak çok sayıda benzer yazı yayımlamak yerine ölçülen kullanıcı sorularına güçlü yanıt veren rehberler üretilmelidir.

## Sonuç

Full Balance artık “fikir aşamasında” değildir; çalışan ve ölçülen bir beta üründür. Teknik taban mağaza öncesi geliştirmeye uygundur. Bir sonraki seviye yeni ekran sayısıyla değil, gerçek uzman onayı, D1/D7 tutunma, ilk antrenman aktivasyonu ve izinli kullanıcı sonuçlarıyla kazanılacaktır. Bu dört alan kanıtlandığında ürün hem kullanıcı hem yatırımcı hem de olası alıcı açısından belirgin biçimde daha değerli hale gelir.
