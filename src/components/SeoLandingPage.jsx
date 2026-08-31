import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getAlternatesForTurkishPath } from '../data/internationalSeoPages';
import { trackLandingCta } from '../lib/analytics';
import {
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  FileDown,
  Flame,
  Leaf,
  Moon,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';

const CalorieCalc = lazy(() => import('./CalorieCalc'));

const BASE_URL = 'https://fullbalance.app';
const OG_IMAGE = `${BASE_URL}/og/full-balance-og-tr.png`;

const pages = {
  'ucretsiz-fitness-uygulamasi': {
    icon: Sparkles,
    accent: '#22c55e',
    title: 'Ücretsiz Fitness Uygulaması',
    titleAccent: 'Full Balance',
    metaTitle: 'Ücretsiz Fitness Uygulaması | Full Balance',
    description: 'Full Balance; antrenman, beslenme, ilerleme, gelişim raporu, Excel dışa aktarma, su, uyku ve kilo takibini tek yerde sunan tamamen ücretsiz fitness uygulamasıdır.',
    keywords: 'ücretsiz fitness uygulaması, ücretsiz antrenman uygulaması, ücretsiz beslenme uygulaması, Full Balance',
    heroCopy: 'Kredi kartı, abonelik ve premium duvarı olmadan hedefe göre antrenman, beslenme ve ilerleme takibi.',
    sections: [
      { title: 'Tamamen ücretsiz başlangıç', body: 'Kullanıcı hesap oluşturur, hedefini seçer ve kişisel planını ücret ödemeden kullanmaya başlar.' },
      { title: 'Tek panelde günlük takip', body: 'Antrenman, kalori, makro, su, uyku, kilo ve vücut ölçümleri aynı deneyimde toplanır.' },
      { title: 'Mobil öncelikli deneyim', body: 'Telefon ekranında hızlı kullanım, bildirimler, PWA kurulumu ve güvenli oturum akışı desteklenir.' },
    ],
    faqs: [
      ['Full Balance ücretsiz mi?', 'Evet. Full Balance ücretsizdir; kredi kartı, abonelik veya premium duvarı gerektirmez.'],
      ['Uygulama hangi hedefleri destekler?', 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon hedeflerini destekler.'],
      ['Telefonda kullanılabilir mi?', 'Evet. Full Balance mobil öncelikli tasarlanmıştır ve PWA olarak telefona eklenebilir.'],
    ],
  },
  'kalori-makro-takibi': {
    icon: UtensilsCrossed,
    accent: '#f97316',
    title: 'Günlük Kalori İhtiyacı ve',
    titleAccent: 'Makro Takibi',
    metaTitle: 'Fotoğrafla Yemek Kalori Hesaplama ve Makro Takibi | Full Balance',
    description: 'Yemek fotoğrafını referans al, görünen besinleri ve porsiyonları doğrula; öğün kalorisi ile makroları ücretsiz ve gerçekçi bir aralıkta hesapla.',
    keywords: 'fotoğraftan kalori hesaplama, yemek fotoğrafı kalori, besin kalori hesaplama, öğün kalori hesaplama, makro takip',
    heroCopy: 'Öğün fotoğrafını referans al; yiyecekleri, porsiyonları, yağları, sosları ve içecekleri doğrulayarak gerçekçi kalori ve makro aralığını gör.',
    sections: [
      { title: 'Fotoğrafla daha hızlı başla', body: 'Öğün fotoğrafını cihazında aç; fotoğrafta görünen yiyecekleri 200’den fazla besin arasından seç.' },
      { title: 'Porsiyonu ve gizli kalorileri doğrula', body: 'Gramı kontrol et; fotoğrafın gösteremediği yağ, sos, şeker ve içecekleri ayrıca ekle.' },
      { title: 'Kesin olmayanı kesinmiş gibi göstermez', body: 'Tarif ve porsiyon belirsizliğini saklamak yerine tek bir sayı ile birlikte gerçekçi bir tahmin aralığı sunar.' },
    ],
    faqs: [
      ['Fotoğraftan kalori kesin hesaplanabilir mi?', 'Hayır. Tek fotoğraf porsiyon hacmini, pişirme yağını ve gizli malzemeleri kesin göstermez. Full Balance bu nedenle kullanıcı doğrulaması ve tahmin aralığı kullanır.'],
      ['Fotoğrafım sunucuya yüklenir mi?', 'Hayır. Fotoğraf yalnızca cihazındaki araçta önizlenir; hesabına kaydedilmez ve sunucuya gönderilmez.'],
      ['Öğün kalori aracı ücretsiz mi?', 'Evet. Fotoğrafla başlayan öğün kalori ve makro aracı kayıt olmadan ücretsiz kullanılabilir.'],
    ],
  },
  'evde-spor-programi': {
    icon: Dumbbell,
    accent: '#22c55e',
    title: 'Ekipmansız Evde',
    titleAccent: 'Spor Programı',
    metaTitle: 'Ekipmansız Evde Spor Programı | Ücretsiz Plan | Full Balance',
    description: 'Seviye, hedef ve haftalık gün sayısına göre ekipmansız evde spor programı oluştur; set, tekrar, dinlenme ve kolay alternatifleri ücretsiz gör.',
    keywords: 'evde spor programı, ekipmansız antrenman, evde spor hareketleri, evde egzersiz programı',
    heroCopy: 'Spor salonu hareketleri olmadan, gerçek ev ortamına uygun vücut ağırlığı egzersizleri ve kontrollü ilerleme planı.',
    sections: [
      { title: 'Gerçekten ekipmansız', body: 'Program kablo, makine veya spor salonu ekipmanı istemeyen vücut ağırlığı hareketlerinden oluşur.' },
      { title: 'Seviyeye uygun alternatifler', body: 'Zor gelen hareketler için daha kolay varyasyon; gelişim oldukça tekrar, tempo ve hareket seviyesi artışı sunulur.' },
      { title: 'Net haftalık akış', body: 'Antrenman ve dinlenme günleri, egzersiz sırası, set, tekrar ve dinlenme süreleri başlamadan önce görülür.' },
    ],
    faqs: [
      ['Evde spor için ekipman gerekir mi?', 'Hayır. Bu plan vücut ağırlığıyla ve evde uygulanabilecek hareketlerle hazırlanır.'],
      ['Yeni başlayanlar kullanabilir mi?', 'Evet. Hareket zorluğu ve haftalık hacim deneyim seviyesine göre ayarlanır.'],
      ['Program nasıl zorlaşır?', 'Kontrol sağlandıkça tekrar, tempo, hareket açıklığı ve daha ileri varyasyonlarla ilerler.'],
    ],
  },
  'evde-dambil-antrenman-programi': {
    icon: Dumbbell,
    accent: '#38bdf8',
    title: 'Evde Dambıl',
    titleAccent: 'Antrenman Programı',
    metaTitle: 'Evde Dambıl Antrenman Programı | Ücretsiz Kişisel Plan',
    description: 'Hedef ve seviyene göre evde dambıl veya direnç bandıyla uygulanabilen, salon makinesi içermeyen ücretsiz kişisel antrenman ve beslenme planı oluştur.',
    keywords: 'evde dambıl antrenman programı, evde ekipmanlı spor, dambıl programı, direnç bandı antrenmanı',
    heroCopy: 'Dambıl veya direnç bandıyla evde çalış; salon makineleri olmadan set, tekrar, dinlenme, progresyon ve beslenme hedeflerini tek planda gör.',
    sections: [
      { title: 'Seçtiğin ekipmana uygun', body: 'Program dambıl ve direnç bandı hareketlerini kullanır; kablo, barbell ve yalnızca salonda bulunan makineleri dışarıda bırakır.' },
      { title: 'Kontrollü ilerleme', body: 'Egzersiz sırası, set, tekrar ve dinlenme açıkça gösterilir; sonraki fazlarda antrenman yükü seviyene göre artırılır.' },
      { title: 'Beslenmeyle aynı hedefte', body: 'Kalori, makro, öğün ve alışveriş listesi aynı hedefi destekler; seçilen alerji ve beslenme tercihleri dikkate alınır.' },
    ],
    faqs: [
      ['Hangi ekipman gerekir?', 'Bir çift dambıl veya direnç bandı yeterlidir; spor salonu makinesi gerekmez.'],
      ['Yeni başlayanlara uygun mu?', 'Evet. Egzersiz seçimi ve haftalık hacim deneyime göre ayarlanır.'],
      ['Beslenme planı dahil mi?', 'Evet. Hedefe ve seçilen alerjilere göre uyarlanan beslenme planı ücretsizdir.'],
    ],
  },
  'evde-kas-gelistirme-hareketleri': {
    icon: TrendingUp,
    accent: '#f97316',
    title: 'Evde Kas Geliştirme',
    titleAccent: 'Hareketleri',
    metaTitle: 'Evde Kas Geliştirme Hareketleri | Ücretsiz | Full Balance',
    description: 'Evde kas geliştirme hareketlerini seviyene göre uygula. Ekipmansız ücretsiz programda set, tekrar, progresyon, dinlenme, protein ve kalori hedeflerini gör.',
    keywords: 'evde kas geliştirme hareketleri, kas geliştirme hareketleri, ekipmansız kas geliştirme, evde kas programı',
    heroCopy: 'İtiş, squat, kalça, tek bacak ve core hareketlerini seviyene göre ilerlet; antrenmanı protein, kalori ve toparlanmayla birleştir.',
    sections: [
      { title: 'Dengeli hareket seçimi', body: 'İtiş, squat, kalça, tek taraflı bacak, core ve güvenli çekiş alternatifleri birlikte planlanır.' },
      { title: 'Ölçülebilir progresyon', body: 'Mevcut hareket kontrollü yapılmadan rastgele zor varyasyona geçilmez; tekrar, tempo ve hareket açıklığı izlenir.' },
      { title: 'Beslenme ve toparlanma', body: 'Protein, günlük enerji, uyku ve dinlenme günleri kas gelişimi planının yanında takip edilir.' },
    ],
    faqs: [
      ['Ekipmansız kas gelişir mi?', 'Yeterli zorluk, düzenli progresyon ve toparlanmayla vücut ağırlığı antrenmanı kas gelişimini destekleyebilir.'],
      ['Bu programda salon hareketi var mı?', 'Hayır. Bu sayfadaki plan ev ortamına ve ekipmansız harekete özeldir.'],
      ['Hareket çok zorsa ne yapmalıyım?', 'Kontrollü yapabildiğin kolay varyasyonu kullanmalı ve hazır olduğunda ilerlemelisin.'],
    ],
  },
  'baslangic-pilates-programi': {
    icon: Waves,
    accent: '#a78bfa',
    title: 'Başlangıç Seviyesi',
    titleAccent: 'Pilates Programı',
    metaTitle: 'Başlangıç Pilates Programı | Evde Ücretsiz Plan | Full Balance',
    description: 'Evde başlangıç pilates programı ile nefes, core stabilitesi, postür, mobilite ve kontrollü ilerlemeyi kısa mat seanslarında ücretsiz takip et.',
    keywords: 'başlangıç pilates programı, evde pilates, yeni başlayanlar için pilates, ücretsiz pilates programı',
    heroCopy: 'Hız yerine nefes, hizalanma ve kontrolü öğreten kısa mat seanslarıyla güvenli bir temel oluştur.',
    sections: [
      { title: 'Sade ve kontrollü başlangıç', body: 'İlk seanslar nefes, nötr hizalanma ve kontrollü hareket açıklığına odaklanır.' },
      { title: 'Sadece mekik değil', body: 'Core stabilitesi, pelvis kontrolü, koordinasyon, postür ve mobilite birlikte geliştirilir.' },
      { title: 'Kademeli ilerleme', body: 'Temel hareketler kontrollü yapılabildiğinde süre ve hareket karmaşıklığı adım adım artar.' },
    ],
    faqs: [
      ['Reformer gerekir mi?', 'Hayır. Bu program evde mat üzerinde uygulanacak başlangıç pilates planıdır.'],
      ['Daha önce pilates yapmadım, uygun mu?', 'Evet. Kısa seanslar ve erişilebilir hareketlerle başlar.'],
      ['Haftada kaç gün yapılır?', 'Plan, ayırabildiğin günlere göre uygulanabilir seansları ve toparlanmayı dengeler.'],
    ],
  },
  'antrenman-programi': {
    icon: Dumbbell,
    accent: '#ef4444',
    title: 'Kişisel Antrenman',
    titleAccent: 'Programı',
    metaTitle: 'Kişisel Antrenman Programı | Full Balance',
    description: 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon için hedefe göre 24 program sunan ücretsiz antrenman planlayıcı.',
    keywords: 'antrenman programı, haftalık fitness programı, kas gelişimi programı, yağ yakımı programı',
    heroCopy: 'Hedef, deneyim ve faz sistemine göre gün gün split, set, tekrar, dinlenme ve form rehberi.',
    sections: [
      { title: '6 hedef, 4 faz', body: 'Kas gelişimi, yağ yakımı, yoga, pilates, reformer ve meditasyon için faz bazlı planlama yapılır.' },
      { title: 'Set, tekrar ve dinlenme', body: 'Her antrenmanda egzersiz detayları, tekrar aralığı ve dinlenme süresi net olarak gösterilir.' },
      { title: 'Form rehberi ve timer', body: 'Egzersiz açıklamaları, ipuçları ve dinlenme zamanlayıcısı antrenman akışını daha düzenli hale getirir.' },
    ],
    faqs: [
      ['Kaç program var?', '6 hedef ve 4 faz yapısıyla 24 temel program bulunur.'],
      ['Yeni başlayanlar kullanabilir mi?', 'Evet. Faz sistemi başlangıç seviyesinden ileri seviyeye ilerler.'],
      ['Yoga ve pilates de var mı?', 'Evet. Yoga, pilates, reformer ve meditasyon hedefleri de desteklenir.'],
    ],
  },
  'ilerleme-takibi': {
    icon: TrendingUp,
    accent: '#3b82f6',
    title: 'İlerleme Takibi ve',
    titleAccent: 'Gelişim Analizi',
    metaTitle: 'İlerleme Takibi ve Gelişim Analizi | Full Balance',
    description: 'Kilo, yağ oranı, vücut ölçüleri, fotoğraf, su, uyku ve antrenman verilerini takip eden ücretsiz gelişim takip uygulaması.',
    keywords: 'ilerleme takip uygulaması, kilo takibi, vücut ölçüsü takip, fitness gelişim takibi',
    heroCopy: 'Gelişimi sadece tartıyla değil; ölçüler, fotoğraflar, uyku, su ve antrenman verileriyle birlikte gör.',
    sections: [
      { title: 'Kilo ve ölçüm geçmişi', body: 'Kilo, yağ oranı ve vücut ölçümleri kayıt altına alınır; değişim daha net görünür.' },
      { title: 'Fotoğrafla gelişim', body: 'İlerleme fotoğrafları kullanıcının görsel dönüşümünü takip etmesine yardımcı olur.' },
      { title: 'Haftalık rapor mantığı', body: 'Antrenman, su, uyku ve kilo verileri haftalık değerlendirmeye dönüşür.' },
    ],
    faqs: [
      ['Sadece kilo mu takip edilir?', 'Hayır. Ölçüler, yağ oranı, fotoğraf, su, uyku ve antrenman verileri de takip edilir.'],
      ['Veriler dışa aktarılır mı?', 'Evet. İlerleme verileri Excel ve rapor çıktısı olarak dışa aktarılabilir.'],
      ['Rapor olarak alınabilir mi?', 'Evet. Gelişim verileri rapor ve Excel çıktısı olarak dışa aktarılabilir.'],
    ],
  },
  'su-uyku-kilo-takibi': {
    icon: Waves,
    accent: '#14b8a6',
    title: 'Su, Uyku ve',
    titleAccent: 'Kilo Takibi',
    metaTitle: 'Su, Uyku ve Kilo Takip Uygulaması | Full Balance',
    description: 'Günlük su hedefi, uyku süresi, kilo trendi ve vücut ölçülerini takip eden ücretsiz sağlık ve fitness takip uygulaması.',
    keywords: 'su takip uygulaması, uyku takip, kilo takip, vücut ölçüsü takip',
    heroCopy: 'Günlük alışkanlıkları basit kayıtlarla görünür hale getir; denge puanını ve hedef ilerlemesini takip et.',
    sections: [
      { title: 'Su hedefi', body: 'Günlük bardak hedefi ve hatırlatma mantığıyla su tüketimi daha düzenli izlenir.' },
      { title: 'Uyku kaydı', body: 'Uyku süresi haftalık değerlendirmeye dahil edilir ve toparlanma takibine destek olur.' },
      { title: 'Kilo trendi', body: 'Tek günlük dalgalanma yerine kayıt geçmişiyle daha anlamlı değişim izlenir.' },
    ],
    faqs: [
      ['Su takibi nasıl çalışır?', 'Günlük hedefe göre bardak kayıtları tutulur ve ilerleme panelde görünür.'],
      ['Uyku verisi rapora girer mi?', 'Evet. Uyku verileri rapor ve denge değerlendirmesine dahil edilir.'],
      ['Kilo trendi rapora dahil olur mu?', 'Evet. Kilo bilgisi gelişim raporuna dahil edilebilir.'],
    ],
  },
  'yoga-pilates-reformer': {
    icon: Target,
    accent: '#a855f7',
    title: 'Yoga, Pilates ve',
    titleAccent: 'Reformer Planları',
    metaTitle: 'Yoga, Pilates ve Reformer Programları | Full Balance',
    description: 'Yoga, pilates, reformer ve meditasyon hedefleri için esneklik, core, postür, nefes ve zihinsel denge odaklı ücretsiz planlar.',
    keywords: 'yoga uygulaması, pilates programı, reformer programı, meditasyon uygulaması',
    heroCopy: 'Fitness dışındaki wellness hedefleri de aynı kişisel plan, takip ve rapor yapısına dahil edilir.',
    sections: [
      { title: 'Yoga ve mobilite', body: 'Esneklik, mobilite, nefes ve poz akışlarıyla daha dengeli bir pratik oluşturulur.' },
      { title: 'Pilates ve core', body: 'Core stabilitesi, postür ve kontrollü hareket düzeni için hedefe uygun planlar sunulur.' },
      { title: 'Reformer ve direnç', body: 'Reformer hedefinde direnç, kontrollü progresyon ve tam vücut çalışma mantığı öne çıkar.' },
    ],
    faqs: [
      ['Full Balance sadece fitness mı?', 'Hayır. Yoga, pilates, reformer ve meditasyon hedefleri de vardır.'],
      ['Pilates programı ücretsiz mi?', 'Evet. Pilates ve reformer planları da ücretsizdir.'],
      ['Meditasyon destekleniyor mu?', 'Evet. Meditasyon hedefinde nefes, odak ve zihinsel denge pratikleri bulunur.'],
    ],
  },
  'excel-rapor-disari-aktarma': {
    icon: FileDown,
    accent: '#0ea5e9',
    title: 'Excel ve Rapor',
    titleAccent: 'Dışa Aktarma',
    metaTitle: 'Excel ve Fitness Raporu Dışa Aktarma | Full Balance',
    description: 'Antrenman, kilo, ölçüm, su, uyku ve ilerleme verilerini Excel ve rapor formatında dışa aktaran ücretsiz fitness takip uygulaması.',
    keywords: 'fitness excel export, antrenman raporu indir, gelişim raporu, fitness verileri dışa aktarma',
    heroCopy: 'Veriler uygulamada kalmak zorunda değil; gelişim kayıtlarını paylaşılabilir rapora ve Excel çıktısına dönüştür.',
    sections: [
      { title: 'Excel çıktısı', body: 'Kilo, ölçüm, su, uyku ve antrenman kayıtları düzenli tablo formatında dışa aktarılabilir.' },
      { title: 'Rapor indir', body: 'Kişisel takip için özetlenmiş gelişim raporu indirilebilir ve paylaşılabilir.' },
      { title: 'Veri sahipliği', body: 'Kullanıcının ilerleme verisini dışa alabilmesi, uygulamaya güveni ve taşınabilirliği artırır.' },
    ],
    faqs: [
      ['Excel dışa aktarma var mı?', 'Evet. İlerleme verileri Excel formatında indirilebilir.'],
      ['PDF/rapor indirilebilir mi?', 'Evet. Gelişim raporu indirilebilir ve paylaşılabilir.'],
      ['Hangi veriler aktarılır?', 'Kilo, ölçümler, su, uyku, antrenman ve ilerleme verileri aktarılabilir.'],
    ],
  },
  'kas-gelisimi-programi': {
    icon: Dumbbell,
    accent: '#f97316',
    title: 'Kas Gelişimi',
    titleAccent: 'Programı',
    metaTitle: 'Kas Gelişimi Programı | Ücretsiz Full Balance',
    description: 'Kas gelişimi için hedefe göre antrenman, kalori fazlası, protein hedefi, progresif yüklenme ve ilerleme takibi sunan ücretsiz uygulama.',
    keywords: 'kas gelişimi programı, hipertrofi programı, kas yapmak için uygulama, protein hedefi, bulk programı',
    heroCopy: 'Kas kazanmak isteyen kullanıcılar için antrenman, beslenme ve ölçüm takibini tek ücretsiz planda birleştir.',
    sections: [
      { title: 'Hedefe göre hipertrofi planı', body: 'Deneyim seviyesine göre set, tekrar, dinlenme ve haftalık split yapısı daha anlaşılır hale gelir.' },
      { title: 'Kalori fazlası ve protein hedefi', body: 'BMR, TDEE ve günlük kalori hesabı üzerinden kas gelişimini destekleyen makro hedefleri oluşturulur.' },
      { title: 'Ölçüm ve güç takibi', body: 'Kilo, vücut ölçüleri ve antrenman kayıtlarıyla gelişim sadece hisse değil veriye bağlanır.' },
    ],
    faqs: [
      ['Kas yapmak için ne takip edilmeli?', 'Antrenman devamlılığı, progresif yüklenme, protein hedefi, kalori fazlası, uyku ve ölçüm değişimi birlikte takip edilmelidir.'],
      ['Yeni başlayanlar kullanabilir mi?', 'Evet. Full Balance başlangıç, orta, ileri ve usta fazlarına göre program mantığı sunar.'],
      ['Kas gelişimi planı ücretsiz mi?', 'Evet. Kas gelişimi hedefi ve takip özellikleri ücretsizdir.'],
    ],
  },
  'yag-yakimi-programi': {
    icon: Flame,
    accent: '#ef4444',
    title: 'Yağ Yakımı',
    titleAccent: 'Programı',
    metaTitle: 'Yağ Yakımı Programı | Ücretsiz Full Balance',
    description: 'Yağ yakımı için kalori açığı, antrenman planı, su, uyku, kilo trendi ve haftalık ilerleme takibi sunan ücretsiz uygulama.',
    keywords: 'yağ yakımı programı, kilo verme uygulaması, kalori açığı, yağ kaybı, ücretsiz diyet takip',
    heroCopy: 'Kilo verme sürecini tek günlük tartı sonucuna değil; kalori, antrenman, uyku, su ve trend verisine göre yönet.',
    sections: [
      { title: 'Kalori açığı mantığı', body: 'Günlük enerji ihtiyacına göre sürdürülebilir hedef oluşturulur; aşırı kısıtlama yerine takip edilebilir düzen kurulur.' },
      { title: 'Direnç + kondisyon dengesi', body: 'Yağ yakımı hedefinde kas kaybını azaltmak için direnç antrenmanı ve kondisyon birlikte düşünülür.' },
      { title: 'Haftalık trend takibi', body: 'Kilo dalgalanmaları yerine haftalık değişim, su, uyku ve antrenman devamlılığı birlikte görünür.' },
    ],
    faqs: [
      ['Yağ yakımı için sadece kardiyo yeterli mi?', 'Genellikle hayır. Direnç antrenmanı, kalori açığı, protein hedefi ve uyku birlikte daha sürdürülebilir sonuç verir.'],
      ['Kalori hedefi kişisel mi?', 'Evet. Boy, kilo, yaş, cinsiyet, aktivite ve hedef bilgilerine göre hesaplanır.'],
      ['Yağ yakımı programı ücretsiz mi?', 'Evet. Full Balance yağ yakımı programını ücretsiz sunar.'],
    ],
  },
  'yoga-uygulamasi': {
    icon: Leaf,
    accent: '#22c55e',
    title: 'Yoga',
    titleAccent: 'Uygulaması',
    metaTitle: 'Ücretsiz Yoga Uygulaması | Full Balance',
    description: 'Yoga, mobilite, esneklik, nefes ve toparlanma odağıyla kişisel wellness planı sunan ücretsiz Full Balance uygulaması.',
    keywords: 'ücretsiz yoga uygulaması, yoga programı, esneklik uygulaması, mobilite programı, nefes egzersizi',
    heroCopy: 'Yoga pratiğini sadece video izlemekten çıkar; hedef, süre, devamlılık ve toparlanma takibiyle düzenli hale getir.',
    sections: [
      { title: 'Esneklik ve mobilite', body: 'Günlük akışlar vücudu hazırlama, hareket açıklığı ve kontrollü nefes odağıyla planlanır.' },
      { title: 'Düzenli pratik takibi', body: 'Haftalık seri ve günlük görevlerle yoga alışkanlığı daha görünür hale gelir.' },
      { title: 'Wellness ile birleşir', body: 'Uyku, su, meditasyon ve toparlanma takibi yoga hedefini destekler.' },
    ],
    faqs: [
      ['Full Balance yoga için uygun mu?', 'Evet. Yoga hedefi; esneklik, mobilite, nefes ve düzenli pratik odağıyla desteklenir.'],
      ['Yoga uygulaması ücretsiz mi?', 'Evet. Yoga hedefi ücretsizdir.'],
      ['Yeni başlayanlar yoga yapabilir mi?', 'Evet. Başlangıç seviyesine uygun akış mantığı desteklenir.'],
    ],
  },
  'pilates-programi': {
    icon: Target,
    accent: '#ec4899',
    title: 'Ücretsiz Pilates',
    titleAccent: 'Uygulaması ve Programı',
    metaTitle: 'Ücretsiz Pilates Uygulaması ve Programı | Full Balance',
    description: 'Evde mat pilates için seviyene göre ücretsiz program oluştur; core, postür, kontrollü hareket, devamlılık ve gelişimini tek uygulamada takip et.',
    keywords: 'pilates programı, ücretsiz pilates uygulaması, mat pilates, core programı, postür egzersizleri',
    heroCopy: 'Evde mat pilates hedefini seviyene uygun seanslar, core, postür ve kontrollü ilerlemeyle takip edilebilir bir programa dönüştür.',
    sections: [
      { title: 'Core ve postür odağı', body: 'Pilates planı merkez bölge, denge, kontrollü hareket ve duruş farkındalığı üzerine kurulur.' },
      { title: 'Başlangıçtan ileri seviyeye', body: 'Faz mantığıyla kullanıcı kapasitesine göre kademeli ilerleme sağlanır.' },
      { title: 'Takip ve motivasyon', body: 'Seri, hedef kartları ve ölçüm takibi pilates alışkanlığını canlı tutar.' },
    ],
    faqs: [
      ['Ücretsiz pilates uygulaması ne sunar?', 'Seviyene uygun mat pilates seanslarını, haftalık devamlılığı ve temel gelişim verilerini tek yerde takip etmeyi sağlar.'],
      ['Mat pilates destekleniyor mu?', 'Evet. Pilates hedefi mat pilates mantığıyla kullanılabilir.'],
      ['Pilates programı ücretsiz mi?', 'Evet. Full Balance pilates programını ücretsiz sunar.'],
    ],
  },
  'reformer-pilates-programi': {
    icon: Target,
    accent: '#06b6d4',
    title: 'Reformer Pilates',
    titleAccent: 'Programı',
    metaTitle: 'Reformer Pilates Programı | Full Balance',
    description: 'Reformer pilates hedefi için direnç, kontrollü progresyon, core, postür ve haftalık takip yapısı sunan ücretsiz uygulama.',
    keywords: 'reformer pilates programı, reformer uygulaması, reformer takip, pilates reformer planı',
    heroCopy: 'Reformer çalışmalarını rastgele seanslardan çıkarıp direnç, devamlılık ve hedef takibiyle daha planlı hale getir.',
    sections: [
      { title: 'Direnç ve kontrol', body: 'Reformer hedefinde hareket kontrolü, core stabilitesi ve direnç progresyonu öne çıkar.' },
      { title: 'Haftalık plan mantığı', body: 'Kullanıcı seanslarını ve toparlanmasını haftalık düzende görebilir.' },
      { title: 'Wellness ile destek', body: 'Uyku, su, ölçüm ve gelişim takibi reformer sürecini tamamlar.' },
    ],
    faqs: [
      ['Reformer hedefi var mı?', 'Evet. Full Balance içinde reformer hedefi bulunur.'],
      ['Reformer programı ücretsiz mi?', 'Evet. Reformer hedefi ücretsizdir.'],
      ['Takip yapılabilir mi?', 'Evet. Antrenman, su, uyku, kilo ve ölçüm takibi yapılabilir.'],
    ],
  },
  'meditasyon-uygulamasi': {
    icon: Brain,
    accent: '#8b5cf6',
    title: 'Meditasyon',
    titleAccent: 'Uygulaması',
    metaTitle: 'Ücretsiz Meditasyon Uygulaması | Full Balance',
    description: 'Meditasyon, nefes, uyku, stres yönetimi ve günlük devamlılık takibini destekleyen ücretsiz wellness uygulaması.',
    keywords: 'ücretsiz meditasyon uygulaması, nefes egzersizi, stres yönetimi, uyku meditasyonu, mindfulness',
    heroCopy: 'Zihinsel denge hedefini nefes, uyku, günlük seri ve wellness alışkanlıklarıyla takip edilebilir hale getir.',
    sections: [
      { title: 'Nefes ve farkındalık', body: 'Meditasyon hedefi nefes, odak ve zihinsel toparlanma alışkanlığı oluşturmayı destekler.' },
      { title: 'Uyku ile bağlantı', body: 'Uyku kaydı ve toparlanma takibi meditasyon pratiğinin etkisini daha görünür hale getirir.' },
      { title: 'Günlük devamlılık', body: 'Challenge, seri ve motivasyon kartları düzenli pratik oluşturmayı kolaylaştırır.' },
    ],
    faqs: [
      ['Meditasyon hedefi fitness uygulamasında neden var?', 'Full Balance sadece kas veya kilo değil; beden, zihin, uyku ve devamlılığı birlikte ele alır.'],
      ['Nefes egzersizleri destekleniyor mu?', 'Evet. Meditasyon hedefi nefes ve farkındalık pratiğiyle desteklenir.'],
      ['Meditasyon uygulaması ücretsiz mi?', 'Evet. Meditasyon hedefi ücretsizdir.'],
    ],
  },
  'bmi-hesaplama': {
    icon: Scale,
    accent: '#0ea5e9',
    title: 'BMI',
    titleAccent: 'Hesaplama',
    metaTitle: 'BMI Hesaplama ve Kilo Takibi | Full Balance',
    description: 'BMI, kilo, vücut ölçüsü, yağ oranı ve hedefe göre ilerleme takibini ücretsiz yapan Full Balance sağlık ve fitness uygulaması.',
    keywords: 'BMI hesaplama, vücut kitle indeksi, kilo takip uygulaması, ideal kilo takibi',
    heroCopy: 'BMI tek başına yeterli değildir; kilo, ölçü, yağ oranı, uyku, su ve antrenman verileriyle daha anlamlı takip yap.',
    sections: [
      { title: 'BMI başlangıç göstergesi', body: 'Boy ve kilo bilgisiyle vücut kitle indeksi hesaplanır; ancak karar tek metrikle verilmez.' },
      { title: 'Kilo ve ölçü birlikte', body: 'Kullanıcı kilo trendini vücut ölçüleri ve yağ oranı ile birlikte takip eder.' },
      { title: 'Hedefe göre yorumlama', body: 'Kas gelişimi, yağ yakımı veya wellness hedefi BMI yorumunu farklılaştırır.' },
    ],
    faqs: [
      ['BMI tek başına yeterli mi?', 'Hayır. BMI genel bir göstergedir; yağ oranı, kas kütlesi, ölçüler ve sağlık durumu birlikte değerlendirilmelidir.'],
      ['Full Balance BMI hesaplar mı?', 'Evet. Profil bilgileriyle BMI, BMR ve TDEE gibi temel değerler hesaplanır.'],
      ['BMI hesaplama ücretsiz mi?', 'Evet. Full Balance ücretsizdir.'],
    ],
  },
  'protein-ihtiyaci-hesaplama': {
    icon: UtensilsCrossed,
    accent: '#22c55e',
    title: 'Protein İhtiyacı',
    titleAccent: 'Hesaplama',
    metaTitle: 'Protein İhtiyacı Hesaplama | Full Balance',
    description: 'Kas gelişimi ve yağ yakımı hedeflerine göre protein, kalori ve makro hedefleri oluşturan ücretsiz beslenme takip uygulaması.',
    keywords: 'protein ihtiyacı hesaplama, günlük protein hedefi, makro hesaplama, kas gelişimi beslenme',
    heroCopy: 'Günlük protein hedefini tahmine bırakma; hedef, kilo ve aktiviteye göre makro planına bağla.',
    sections: [
      { title: 'Hedefe göre protein', body: 'Kas gelişimi ve yağ yakımı hedeflerinde protein ihtiyacı farklı önceliklerle ele alınır.' },
      { title: 'Makro planıyla birlikte', body: 'Protein, karbonhidrat ve yağ hedefleri günlük kalori ihtiyacına göre dengelenir.' },
      { title: 'Beslenme planına dönüşür', body: 'Hesaplanan hedefler 7 günlük menü ve takip mantığına bağlanır.' },
    ],
    faqs: [
      ['Protein hedefi kişisel mi?', 'Evet. Kilo, hedef ve aktivite bilgileri dikkate alınır.'],
      ['Sadece protein mi hesaplanır?', 'Hayır. Kalori, karbonhidrat, yağ, BMR, TDEE ve BMI de desteklenir.'],
      ['Protein hesaplama ücretsiz mi?', 'Evet. Ücretsizdir.'],
    ],
  },
  'ucretsiz-beslenme-programi': {
    icon: UtensilsCrossed,
    accent: '#16a34a',
    title: 'Ücretsiz Beslenme',
    titleAccent: 'Programı',
    metaTitle: 'Ücretsiz Beslenme Programı | Full Balance',
    description: 'Hedefe, bütçeye, alerji ve sağlık bilgilerine göre kişisel beslenme planı oluşturmaya yardımcı ücretsiz Full Balance uygulaması.',
    keywords: 'ücretsiz beslenme programı, diyet programı ücretsiz, makro takip, alerjiye göre beslenme',
    heroCopy: 'Beslenmeyi sadece kalori hesabı olarak değil; hedef, bütçe, alerji, sağlık bilgisi ve sürdürülebilirlik ile planla.',
    sections: [
      { title: 'Bütçeye göre öneriler', body: 'Ekonomik, orta ve premium tercihlere göre daha uygulanabilir yemek seçenekleri sunulur.' },
      { title: 'Alerji ve sağlık bilgisi', body: 'Kullanıcının işaretlediği alerji ve sağlık durumları plan üretiminde dikkate alınır.' },
      { title: 'Makro takibi', body: 'Protein, karbonhidrat ve yağ hedefleri günlük plana bağlanır.' },
    ],
    faqs: [
      ['Beslenme programı ücretsiz mi?', 'Evet. Full Balance ücretsizdir.'],
      ['Alerji bilgisi soruluyor mu?', 'Evet. Onboarding içinde sağlık ve alerji bilgileri alınır.'],
      ['Bütçeye göre plan yapılır mı?', 'Evet. Bütçe tercihi planlamaya dahil edilir.'],
    ],
  },
  'alerjiye-gore-beslenme-programi': {
    icon: Shield,
    accent: '#f59e0b',
    title: 'Alerjiye Göre',
    titleAccent: 'Beslenme Programı',
    metaTitle: 'Alerjiye Göre Beslenme Programı | Full Balance',
    description: 'Alerji ve sağlık bilgilerini dikkate alarak daha güvenli beslenme planı oluşturmaya yardımcı ücretsiz uygulama.',
    keywords: 'alerjiye göre beslenme, laktoz intoleransı beslenme, gluten hassasiyeti, beslenme planı',
    heroCopy: 'Kullanıcının alerji ve sağlık bilgilerini programa dahil ederek daha güvenli ve uygulanabilir öneriler oluştur.',
    sections: [
      { title: 'Alerji seçimi', body: 'Kullanıcı gluten, laktoz, kuruyemiş, deniz ürünü gibi bilgileri işaretleyebilir.' },
      { title: 'Sağlık koşulları', body: 'Bel, diz, omuz, kalp/tansiyon gibi bilgiler egzersiz ve beslenme önerilerini etkiler.' },
      { title: 'Uyarı ve güvenlik', body: 'Full Balance tıbbi tavsiye değildir; ciddi durumlarda uzman görüşü önerilir.' },
    ],
    faqs: [
      ['Alerji bilgisi plana dahil mi?', 'Evet. Kullanıcının seçtiği alerjiler plan üretiminde dikkate alınır.'],
      ['Bu tıbbi tavsiye mi?', 'Hayır. Full Balance tıbbi teşhis veya tedavi aracı değildir.'],
      ['Alerjiye göre beslenme ücretsiz mi?', 'Evet. Ücretsizdir.'],
    ],
  },
};

const supportCards = [
  { icon: Shield, text: 'Kredi kartı yok' },
  { icon: Award, text: 'Premium duvarı yok' },
  { icon: BarChart3, text: 'Takip ve rapor dahil' },
  { icon: Scale, text: 'Kişisel metrikler' },
  { icon: Moon, text: 'Uyku ve toparlanma' },
  { icon: Flame, text: 'Hedef odaklı plan' },
];

const relatedLinks = [
  ['evde-spor-programi', 'Ekipmansız evde spor'],
  ['evde-dambil-antrenman-programi', 'Evde dambıl programı'],
  ['evde-kas-gelistirme-hareketleri', 'Evde kas geliştirme'],
  ['baslangic-pilates-programi', 'Başlangıç pilatesi'],
  ['kas-gelisimi-programi', 'Kas gelişimi'],
  ['yag-yakimi-programi', 'Yağ yakımı'],
  ['ucretsiz-beslenme-programi', 'Beslenme programı'],
  ['protein-ihtiyaci-hesaplama', 'Protein hesabı'],
  ['bmi-hesaplama', 'BMI hesabı'],
  ['yoga-uygulamasi', 'Yoga'],
  ['pilates-programi', 'Pilates'],
  ['reformer-pilates-programi', 'Reformer'],
  ['meditasyon-uygulamasi', 'Meditasyon'],
  ['ilerleme-takibi', 'İlerleme takibi'],
  ['excel-rapor-disari-aktarma', 'Rapor dışa aktar'],
];

function upsertMeta(selector, createAttrs, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function upsertAlternate(language, path) {
  let element = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', language);
    document.head.appendChild(element);
  }
  element.setAttribute('href', `${BASE_URL}${path}`);
}

function useSeo(page, slug) {
  useEffect(() => {
    const url = `${BASE_URL}/${slug}`;
    const alternates = getAlternatesForTurkishPath(`/${slug}`);
    document.documentElement.lang = 'tr';
    document.title = page.metaTitle;
    upsertCanonical(url);
    if (alternates) {
      Object.entries(alternates).forEach(([language, path]) => upsertAlternate(language, path));
      upsertAlternate('x-default', alternates.en);
    }
    upsertMeta('meta[name="description"]', { name: 'description' }, page.description);
    upsertMeta('meta[name="keywords"]', { name: 'keywords' }, page.keywords);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, page.metaTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, page.description);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.metaTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, OG_IMAGE);

    const scriptId = 'seo-page-json-ld';
    document.getElementById(scriptId)?.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.metaTitle,
          description: page.description,
          inLanguage: 'tr',
          isPartOf: { '@id': `${BASE_URL}/#website` },
          about: { '@id': `${BASE_URL}/#app` },
        },
        {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: page.faqs.map(([question, answer]) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: answer,
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Full Balance',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: page.metaTitle,
              item: url,
            },
          ],
        },
        {
          '@type': ['WebApplication', 'SoftwareApplication'],
          '@id': `${BASE_URL}/#app`,
          name: 'Full Balance',
          url: BASE_URL,
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web, iOS, Android, PWA',
          isAccessibleForFree: true,
          description: 'Full Balance is a free fitness, wellness, nutrition and progress tracking app for muscle growth, fat loss, yoga, pilates, reformer and meditation.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
    });
    document.head.appendChild(script);
    return () => document.getElementById(scriptId)?.remove();
  }, [page, slug]);
}

export default function SeoLandingPage({ slug }) {
  const pageExists = Boolean(pages[slug]);
  const page = pages[slug] || pages['ucretsiz-fitness-uygulamasi'];
  const canonicalSlug = pageExists ? slug : 'ucretsiz-fitness-uygulamasi';

  useSeo(page, canonicalSlug);
  if (!pageExists) return <Navigate to="/" replace />;
  const Icon = page.icon;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="absolute left-1/2 top-0 h-[520px] w-[min(900px,100vw)] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <nav className="mb-14 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 font-outfit text-sm font-bold text-white">
              <Sparkles size={18} className="text-orange-400" />
              FULL BALANCE
            </Link>
            <Link
              to="/auth?mode=register"
              onClick={() => trackLandingCta(`seo_${canonicalSlug}_nav`)}
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
            >
              Ücretsiz Başla
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${page.accent}55`, color: page.accent, backgroundColor: `${page.accent}12` }}
              >
                <Icon size={14} />
                Tamamen ücretsiz
              </div>
              <h1 className="font-outfit text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {page.title}{' '}
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  {page.titleAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                {page.heroCopy}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth?mode=register"
                  onClick={() => trackLandingCta(`seo_${canonicalSlug}_hero`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 px-6 py-4 font-outfit text-sm font-bold text-white shadow-xl shadow-orange-500/20"
                >
                  Ücretsiz Hesap Oluştur
                  <ChevronRight size={16} />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 px-6 py-4 font-outfit text-sm font-bold text-slate-300"
                >
                  Ana Sayfayı Gör
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="grid grid-cols-2 gap-3">
                {supportCards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={card.text} className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                      <CardIcon size={20} className="mb-3 text-orange-400" />
                      <p className="font-outfit text-sm font-bold text-white">{card.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {canonicalSlug === 'kalori-makro-takibi' && (
        <section className="border-b border-slate-800/60 bg-slate-950 px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Ücretsiz öğün aracı</p>
              <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Fotoğrafla öğün kalori tahmini</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Fotoğraftaki yiyecekleri ekle, porsiyonları doğrula ve yağ, sos ile içecekleri unutma. Araç kesinmiş gibi tek sayı vermek yerine gerçekçi bir tahmin aralığı gösterir.</p>
            </div>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-900" />}>
              <CalorieCalc language="tr" />
            </Suspense>
          </div>
        </section>
      )}

      <section className="border-y border-slate-800/60 bg-slate-900/35 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/55 p-6">
              <CheckCircle2 size={22} className="mb-4" style={{ color: page.accent }} />
              <h2 className="font-outfit text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Daha Fazla Arama</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Hedefine Göre Devam Et</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Full Balance sadece tek bir fitness aracı değil; beslenme, antrenman, wellness ve ilerleme takibini aynı ücretsiz deneyimde birleştirir.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedLinks
              .filter(([linkSlug]) => linkSlug !== canonicalSlug)
              .slice(0, 8)
              .map(([linkSlug, label]) => (
                <Link
                  key={linkSlug}
                  to={`/${linkSlug}`}
                  className="group rounded-2xl border border-slate-800/70 bg-slate-900/45 p-4 transition-colors hover:border-orange-500/45 hover:bg-slate-900"
                >
                  <span className="font-outfit text-sm font-bold text-white group-hover:text-orange-300">{label}</span>
                  <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-blue-300">
                    Sayfayı aç <ChevronRight size={13} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">SSS</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-4">
            {page.faqs.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
                <h3 className="font-outfit text-base font-bold text-white">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-6 text-center">
            <p className="text-sm leading-relaxed text-orange-100">
              Full Balance tıbbi tavsiye sunmaz. Egzersiz veya beslenme programına başlamadan önce sağlık uzmanına danışılması önerilir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export const SEO_PAGE_SLUGS = Object.keys(pages);
