// Static (no-JavaScript) view of every Turkish search landing page. Content
// comes from the same data module the React page uses, so the prerendered
// HTML, the FAQ blocks and the app never drift apart.
import { turkishSeoPages } from '../src/data/turkishSeoPages.js';

const common = ['Kişisel hedef ve deneyim seviyesine göre plan', 'Beslenme, su, uyku ve ilerleme takibi', 'Kredi kartı ve abonelik olmadan ücretsiz kullanım'];

// Hand-written benefit bullets for intent pages where the section titles alone
// would read too generically in the static view.
const benefitOverrides = {
  'kalori-makro-takibi': ['Öğün fotoğrafını yapay zeka ile tanıma ve porsiyon tahmini', 'Kalori ve makrolar 200+ yiyecekli veritabanından', 'Gizli yağ ve sos önerileri, düzenlenebilir porsiyon ve güvenli aralık'],
  'fotografla-kalori-hesaplama': ['Yapay zeka ile yiyecek ve porsiyon tanıma', 'Kalori ve makrolar 200+ yiyecekli veritabanından', 'Gizli yağ ve sos önerileri, düzenlenebilir porsiyon, güvenli aralık'],
  'gunluk-kalori-ihtiyaci-hesaplama': ['Bazal metabolizma, koruma kalorisi ve hedef kalori tek ekranda', 'Protein, karbonhidrat ve yağ gramlarına bölünmüş sonuç', 'Sonucu ücretsiz kişisel plana kaydetme'],
  'bazal-metabolizma-hesaplama': ['Mifflin-St Jeor formülüyle bazal metabolizma', 'Aktivite çarpanıyla koruma kalorisi', 'Hedefe göre günlük kalori ve makrolar'],
  'evde-spor-programi': ['Makine veya spor salonu ekipmanı istemeyen vücut ağırlığı hareketleri', 'Zorluk seviyesine göre kolay alternatifler ve kontrollü progresyon', 'Egzersiz sırası, set, tekrar, dinlenme ve haftalık yapı'],
  'evde-dambil-antrenman-programi': ['Dambıl veya direnç bandına uygun, salon makinesi içermeyen hareketler', 'Seviyeye göre egzersiz sırası, set, tekrar, dinlenme ve kontrollü progresyon', 'Hedefe uygun kalori, makro ve öğün planı aynı hesapta'],
  'evde-kas-gelistirme-hareketleri': ['İtiş, squat, kalça, tek bacak ve core örüntülerini dengeli planlama', 'Tekrar, tempo, hareket açıklığı ve varyasyonla ölçülebilir ilerleme', 'Protein, kalori, uyku ve dinlenme günü takibi'],
  'baslangic-pilates-programi': ['Nefes, nötr hizalanma ve kontrollü hareket açıklığıyla başlangıç', 'Core stabilitesi, pelvis kontrolü, koordinasyon ve postür odağı', 'Kısa mat seanslarından kademeli süre ve zorluk artışı'],
};

export const seoLandingPages = Object.entries(turkishSeoPages).map(([slug, page]) => ({
  slug,
  title: `${page.title} ${page.titleAccent}`.trim(),
  metaTitle: page.metaTitle,
  description: page.description,
  benefits: benefitOverrides[slug] || (page.sections?.length ? page.sections.map((section) => section.title) : common),
  faqs: page.faqs || [],
  sections: page.sections || [],
}));
