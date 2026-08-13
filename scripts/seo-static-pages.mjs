const common = ['Kişisel hedef ve deneyim seviyesine göre plan', 'Beslenme, su, uyku ve ilerleme takibi', 'Kredi kartı ve abonelik olmadan ücretsiz kullanım'];

export const seoLandingPages = [
  ['ucretsiz-fitness-uygulamasi', 'Ücretsiz Fitness ve Wellness Uygulaması', 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates planlarını beslenme ve ilerleme takibiyle birleştiren ücretsiz uygulama.'],
  ['kalori-makro-takibi', 'Kalori ve Makro Takip Uygulaması', 'Birden fazla besinle öğün kalorisi hesapla; kişisel protein, karbonhidrat ve yağ hedeflerini ücretsiz takip et.'],
  ['antrenman-programi', 'Kişisel Antrenman Programı', 'Hedef ve seviyeye göre set, tekrar, dinlenme ve haftalık plan sunan ücretsiz kişisel antrenman uygulaması.'],
  ['ilerleme-takibi', 'İlerleme ve Gelişim Takibi', 'Kilo, ölçüm, antrenman, su ve uyku eğilimlerini tek ücretsiz panelde takip et ve raporla.'],
  ['su-uyku-kilo-takibi', 'Su, Uyku ve Kilo Takibi', 'Günlük su, uyku ve kilo kayıtlarını sade bir akışta tut; haftalık eğilimlerini ücretsiz gör.'],
  ['yoga-pilates-reformer', 'Yoga, Pilates ve Reformer Planları', 'Yoga, pilates, reformer ve meditasyon hedefleri için seviyeye uygun ücretsiz wellness planları.'],
  ['excel-rapor-disari-aktarma', 'Excel ve Gelişim Raporu Dışa Aktarma', 'Kilo, ölçüm, su, uyku ve antrenman kayıtlarını Excel ve gelişim raporu olarak ücretsiz dışa aktar.'],
  ['kas-gelisimi-programi', 'Ücretsiz Kas Gelişimi Programı', 'Kas gelişimi için hipertrofi antrenmanı, protein, kalori ve progresif yüklenme takibini tek kişisel planda birleştir.'],
  ['yag-yakimi-programi', 'Ücretsiz Yağ Yakımı Programı', 'Yağ yakımı için kişisel kalori açığı, direnç antrenmanı, su, uyku ve kilo trendi takibi.'],
  ['ucretsiz-beslenme-programi', 'Ücretsiz Kişisel Beslenme Programı', 'Hedef, günlük enerji ihtiyacı, bütçe, sağlık ve alerji bilgilerine göre uyarlanan 7 günlük beslenme planı.'],
  ['protein-ihtiyaci-hesaplama', 'Günlük Protein İhtiyacı Hesaplama', 'Kilo, aktivite ve hedefe göre günlük protein hedefini hesapla ve beslenme planında ücretsiz takip et.'],
  ['bmi-hesaplama', 'BMI Hesaplama ve Kilo Takibi', 'BMI değerini hesapla; kilo, vücut ölçüsü ve ilerleme eğilimleriyle birlikte ücretsiz takip et.'],
  ['alerjiye-gore-beslenme-programi', 'Alerjiye Göre Beslenme Programı', 'Laktoz, gluten, yumurta, kuruyemiş ve deniz ürünü tercihlerini dikkate alan kişisel beslenme planı.'],
  ['yoga-uygulamasi', 'Ücretsiz Yoga Uygulaması', 'Başlangıçtan ileri seviyeye esneklik, mobilite, nefes ve düzenli pratik takibi sunan kişisel yoga planı.'],
  ['pilates-programi', 'Ücretsiz Pilates Programı', 'Core, postür, denge ve kontrollü hareket odağıyla seviyeye göre kişisel pilates programı.'],
  ['reformer-pilates-programi', 'Ücretsiz Reformer Pilates Programı', 'Direnç, core, postür ve kontrollü progresyon odağıyla kişisel reformer pilates planı.'],
  ['meditasyon-uygulamasi', 'Ücretsiz Meditasyon Uygulaması', 'Nefes, farkındalık, uyku ve günlük devamlılık takibiyle kişisel meditasyon planı.'],
].map(([slug, title, description]) => ({ slug, title, description, benefits: common }));
