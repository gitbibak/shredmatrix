const common = ['Kişisel hedef ve deneyim seviyesine göre plan', 'Beslenme, su, uyku ve ilerleme takibi', 'Kredi kartı ve abonelik olmadan ücretsiz kullanım'];

const intentDetails = {
  'kalori-makro-takibi': {
    benefits: ['Öğün fotoğrafını yalnızca cihazda referans olarak kullanma', 'Görünen yiyecek, porsiyon, yağ, sos ve içecekleri doğrulama', 'Kesinmiş gibi tek sonuç yerine gerçekçi kalori aralığı ve makrolar'],
    faqs: [['Fotoğraftan kalori kesin hesaplanabilir mi?', 'Hayır. Tek fotoğraf porsiyon hacmini ve gizli malzemeleri kesin göstermez; araç doğrulama ve tahmin aralığı kullanır.'], ['Fotoğraf yüklenir veya saklanır mı?', 'Hayır. Fotoğraf yalnızca cihazında önizlenir; sunucuya veya hesabına kaydedilmez.']],
  },
  'evde-spor-programi': {
    benefits: ['Makine veya spor salonu ekipmanı istemeyen vücut ağırlığı hareketleri', 'Zorluk seviyesine göre kolay alternatifler ve kontrollü progresyon', 'Egzersiz sırası, set, tekrar, dinlenme ve haftalık toparlanma planı'],
    faqs: [['Evde spor için ekipman gerekir mi?', 'Hayır. Bu plan vücut ağırlığıyla ve gerçek ev ortamında uygulanabilecek hareketlerle hazırlanır.'], ['Yeni başlayanlar kullanabilir mi?', 'Evet. Hareket zorluğu ve haftalık hacim deneyim seviyesine göre ayarlanır.']],
  },
  'evde-dambil-antrenman-programi': {
    benefits: ['Dambıl veya direnç bandına uygun, salon makinesi içermeyen hareketler', 'Seviyeye göre egzersiz sırası, set, tekrar, dinlenme ve kontrollü progresyon', 'Hedefe uygun kalori, makro, alerji ve beslenme tercihi uyarlaması'],
    faqs: [['Hangi ekipman gerekir?', 'Bir çift dambıl veya direnç bandı yeterlidir; salon makinesi gerekmez.'], ['Yeni başlayanlar kullanabilir mi?', 'Evet. Hareket seçimi ve haftalık hacim deneyim seviyesine göre ayarlanır.']],
  },
  'evde-kas-gelistirme-hareketleri': {
    benefits: ['İtiş, squat, kalça, tek bacak ve core örüntülerini dengeli planlama', 'Tekrar, tempo, hareket açıklığı ve varyasyonla ölçülebilir ilerleme', 'Protein, kalori, uyku ve dinlenmeyi antrenmanla birlikte takip etme'],
    faqs: [['Ekipmansız kas gelişir mi?', 'Yeterli zorluk, düzenli progresyon ve toparlanmayla vücut ağırlığı antrenmanı kas gelişimini destekleyebilir.'], ['Programda salon hareketi var mı?', 'Hayır. Bu plan ev ortamına uygun ekipmansız hareketlere özeldir.']],
  },
  'baslangic-pilates-programi': {
    benefits: ['Nefes, nötr hizalanma ve kontrollü hareket açıklığıyla başlangıç', 'Core stabilitesi, pelvis kontrolü, koordinasyon ve postür odağı', 'Kısa mat seanslarından kademeli süre ve zorluk artışına geçiş'],
    faqs: [['Reformer gerekir mi?', 'Hayır. Bu program evde mat üzerinde uygulanacak başlangıç pilates planıdır.'], ['Daha önce pilates yapmadım, uygun mu?', 'Evet. Kısa seanslar ve erişilebilir hareketlerle başlar.']],
  },
  'fotografla-kalori-hesaplama': {
    benefits: ['Yapay zeka ile yiyecek ve porsiyon tanıma', 'Kalori ve makrolar 200+ yiyecekli veritabanından', 'Gizli yağ ve sos önerileri, düzenlenebilir porsiyon, güvenli aralık'],
    faqs: [['Fotoğraftan kalori kesin hesaplanabilir mi?', 'Hayır. Tek bir fotoğraf porsiyon hacmini, pişirme yağını ve gizli malzemeleri kesin gösteremez. Araç yiyecekleri tanır, gramları tahmin eder ve tek sayı yerine güvenli bir aralık verir; porsiyonu düzeltebilirsin.'], ['Fotoğrafım saklanıyor mu?', 'Hayır. Fotoğraf cihazında küçültülür ve yalnızca analiz için geçici işlenir; hesabına veya sunucuya kaydedilmez.'], ['Üyelik gerekir mi?', 'Hayır. Araç ücretsizdir ve üyelik gerektirmez; hesap yalnızca kişisel plan ve ilerleme takibi için gerekir.']],
  },
  'gunluk-kalori-ihtiyaci-hesaplama': {
    benefits: ['Bazal metabolizma, koruma kalorisi ve hedef kalori tek ekranda', 'Protein, karbonhidrat ve yağ gramlarına bölünmüş sonuç', 'Sonucu ücretsiz kişisel plana kaydetme'],
    faqs: [['Kilo vermek için günde kaç kalori almalıyım?', 'Koruma kalorinin yaklaşık %15 altı, çoğu yetişkin için günde 300-500 kcal açık, sürdürülebilir bir başlangıçtır. Bazal metabolizmanın altına inmek önerilmez.'], ['Kalori açığı nasıl hesaplanır?', 'Bazal metabolizma × aktivite çarpanı koruma kalorisini verir; hedefe göre bu sayıdan bir yüzde düşülür. Hesaplayıcı yağ yakımı için %15 açık uygular.'], ['Sonuç ne kadar güvenilir?', 'Formül nüfus ortalamasına dayanır; kişisel sapma ±%10 civarındadır. 2-3 hafta kilo trendini izleyip hedefi 100-150 kcal ayarlamak en iyi yöntemdir.']],
  },
  'bazal-metabolizma-hesaplama': {
    benefits: ['Mifflin-St Jeor formülüyle bazal metabolizma', 'Aktivite çarpanıyla koruma kalorisi', 'Hedefe göre günlük kalori ve makrolar'],
    faqs: [['Bazal metabolizma nedir?', 'Tamamen dinlenme halinde, yalnızca yaşamsal işlevler için harcanan günlük enerjidir; kilo, boy, yaş, cinsiyet ve kas kütlesine bağlıdır.'], ['BMR nasıl hesaplanır?', 'En yaygın pratik yöntem Mifflin-St Jeor formülüdür: erkek için 10×kilo + 6,25×boy − 5×yaş + 5; kadın için aynı formül −161.'], ['BMR kadar kalori alırsam kilo verir miyim?', 'Kısa vadede evet, ancak sürdürülebilir değildir ve kas kaybı riski taşır. Koruma kalorisinden %10-20 açık vermek önerilir.']],
  },
};

export const seoLandingPages = [
  ['ucretsiz-fitness-uygulamasi', 'Ücretsiz Fitness ve Wellness Uygulaması', 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates planlarını beslenme ve ilerleme takibiyle birleştiren ücretsiz uygulama.'],
  ['kalori-makro-takibi', 'Fotoğrafla Yemek Kalori Hesaplama ve Makro Takibi', 'Yemek fotoğrafını referans al, görünen besinleri ve porsiyonları doğrula; öğün kalorisi ile makroları ücretsiz ve gerçekçi bir aralıkta hesapla.'],
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
  ['evde-dambil-antrenman-programi', 'Evde Dambıl Antrenman Programı', 'Hedef ve seviyene göre evde dambıl veya direnç bandıyla uygulanabilen, salon makinesi içermeyen ücretsiz kişisel antrenman ve beslenme planı oluştur.'],
  ['evde-kas-gelistirme-hareketleri', 'Evde Kas Geliştirme Hareketleri | Ücretsiz', 'Evde kas geliştirme hareketlerini seviyene göre uygula. Ekipmansız ücretsiz programda set, tekrar, progresyon, dinlenme, protein ve kalori hedeflerini gör.'],
  ['baslangic-pilates-programi', 'Başlangıç Pilates Programı', 'Evde başlangıç pilates programı ile nefes, core stabilitesi, postür, mobilite ve kontrollü ilerlemeyi kısa mat seanslarında ücretsiz takip et.'],
  ['fotografla-kalori-hesaplama', 'Fotoğrafla Kalori Hesaplama | Ücretsiz Yapay Zeka Öğün Tahmini', 'Öğün fotoğrafını yükle; yapay zeka yiyecekleri ve porsiyonları tanısın, kalori ve makroları gerçekçi bir aralıkla hesaplasın. Ücretsiz, üyeliksiz, fotoğraf saklanmaz.'],
  ['gunluk-kalori-ihtiyaci-hesaplama', 'Günlük Kalori İhtiyacı Hesaplama | BMR, Koruma ve Kalori Açığı', 'Yaş, boy, kilo, cinsiyet ve aktiviteye göre günlük kalori ihtiyacını hesapla; bazal metabolizma, koruma kalorisi ve hedef kaloriyi ücretsiz gör.'],
  ['bazal-metabolizma-hesaplama', 'Bazal Metabolizma Hızı (BMR) Hesaplama', 'Bazal metabolizma hızını Mifflin-St Jeor formülüyle hesapla; koruma kalorisi ve hedef kaloriyi ücretsiz gör.'],
].map(([slug, title, description]) => ({
  slug,
  title,
  description,
  benefits: intentDetails[slug]?.benefits || common,
  faqs: intentDetails[slug]?.faqs || [],
}));
