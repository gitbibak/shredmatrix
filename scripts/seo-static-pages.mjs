const common = ['Kişisel hedef ve deneyim seviyesine göre plan', 'Beslenme, su, uyku ve ilerleme takibi', 'Kredi kartı ve abonelik olmadan ücretsiz kullanım'];

const intentDetails = {
  'kalori-makro-takibi': {
    benefits: ['Yaş, boy, kilo, aktivite ve hedefe göre BMR ve TDEE başlangıç tahmini', 'Protein, karbonhidrat ve yağ hedeflerini günlük plana bağlama', 'Sonucu öğün, alışveriş listesi ve ilerleme takibiyle birlikte kullanma'],
    faqs: [['Günlük kaç kalori almam gerekir?', 'İhtiyaç yaş, boy, kilo, cinsiyet, aktivite ve hedefe göre değişir. Hesaplama bir başlangıç tahmini verir.'], ['BMR ve TDEE nedir?', 'BMR dinlenme enerjisini, TDEE ise aktivite dahil tahmini günlük toplam enerji harcamasını ifade eder.']],
  },
  'evde-spor-programi': {
    benefits: ['Makine veya spor salonu ekipmanı istemeyen vücut ağırlığı hareketleri', 'Zorluk seviyesine göre kolay alternatifler ve kontrollü progresyon', 'Egzersiz sırası, set, tekrar, dinlenme ve haftalık toparlanma planı'],
    faqs: [['Evde spor için ekipman gerekir mi?', 'Hayır. Bu plan vücut ağırlığıyla ve gerçek ev ortamında uygulanabilecek hareketlerle hazırlanır.'], ['Yeni başlayanlar kullanabilir mi?', 'Evet. Hareket zorluğu ve haftalık hacim deneyim seviyesine göre ayarlanır.']],
  },
  'evde-kas-gelistirme-hareketleri': {
    benefits: ['İtiş, squat, kalça, tek bacak ve core örüntülerini dengeli planlama', 'Tekrar, tempo, hareket açıklığı ve varyasyonla ölçülebilir ilerleme', 'Protein, kalori, uyku ve dinlenmeyi antrenmanla birlikte takip etme'],
    faqs: [['Ekipmansız kas gelişir mi?', 'Yeterli zorluk, düzenli progresyon ve toparlanmayla vücut ağırlığı antrenmanı kas gelişimini destekleyebilir.'], ['Programda salon hareketi var mı?', 'Hayır. Bu plan ev ortamına uygun ekipmansız hareketlere özeldir.']],
  },
  'baslangic-pilates-programi': {
    benefits: ['Nefes, nötr hizalanma ve kontrollü hareket açıklığıyla başlangıç', 'Core stabilitesi, pelvis kontrolü, koordinasyon ve postür odağı', 'Kısa mat seanslarından kademeli süre ve zorluk artışına geçiş'],
    faqs: [['Reformer gerekir mi?', 'Hayır. Bu program evde mat üzerinde uygulanacak başlangıç pilates planıdır.'], ['Daha önce pilates yapmadım, uygun mu?', 'Evet. Kısa seanslar ve erişilebilir hareketlerle başlar.']],
  },
};

export const seoLandingPages = [
  ['ucretsiz-fitness-uygulamasi', 'Ücretsiz Fitness ve Wellness Uygulaması', 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates planlarını beslenme ve ilerleme takibiyle birleştiren ücretsiz uygulama.'],
  ['kalori-makro-takibi', 'Günlük Kalori İhtiyacı Hesaplama ve Makro Takibi', 'Alman gereken günlük kaloriyi BMR, TDEE, hedef ve aktiviteye göre hesapla; protein, karbonhidrat ve yağ hedeflerini ücretsiz takip et.'],
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
  ['pilates-programi', 'Ücretsiz Pilates Uygulaması ve Programı', 'Evde mat pilates için seviyene göre ücretsiz program oluştur; core, postür, kontrollü hareket, devamlılık ve gelişimini tek uygulamada takip et.'],
  ['reformer-pilates-programi', 'Ücretsiz Reformer Pilates Programı', 'Direnç, core, postür ve kontrollü progresyon odağıyla kişisel reformer pilates planı.'],
  ['meditasyon-uygulamasi', 'Ücretsiz Meditasyon Uygulaması', 'Nefes, farkındalık, uyku ve günlük devamlılık takibiyle kişisel meditasyon planı.'],
  ['evde-spor-programi', 'Ekipmansız Evde Spor Programı', 'Seviye, hedef ve haftalık gün sayısına göre ekipmansız evde spor programı oluştur; set, tekrar, dinlenme ve kolay alternatifleri ücretsiz gör.'],
  ['evde-kas-gelistirme-hareketleri', 'Evde Kas Geliştirme Hareketleri ve Programı', 'Evde kas geliştirmek için ekipmansız hareketler, kontrollü progresyon, dinlenme, protein ve kalori hedeflerini tek ücretsiz planda gör.'],
  ['baslangic-pilates-programi', 'Başlangıç Pilates Programı', 'Evde başlangıç pilates programı ile nefes, core stabilitesi, postür, mobilite ve kontrollü ilerlemeyi kısa mat seanslarında ücretsiz takip et.'],
].map(([slug, title, description]) => ({
  slug,
  title,
  description,
  benefits: intentDetails[slug]?.benefits || common,
  faqs: intentDetails[slug]?.faqs || [],
}));
