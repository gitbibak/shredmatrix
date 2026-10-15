// Ortaklık (affiliate) ekipman önerileri.
//
// Varsayılan: Amazon global. AMAZON_ASSOCIATE_TAG girilince her ürün için
// amazon.com linki otomatik üretilir ve tüm sayfa/dillerde gösterilir.
// OneLink açıksa yurt dışı ziyaretçi kendi ülkesinin Amazon'una yönlenir.
//
// İsteğe bağlı yerel geçersiz kılma: bir dilin ürününe `url` (+ `store`)
// girilirse o dilde Amazon yerine bu link gösterilir (ör. TR için Hepsiburada).
// Adım adım rehber: docs/ortaklik-linkleri.md
//
// Ne etiket ne de yerel link varsa ürün gösterilmez; gösterilecek ürün
// kalmazsa kutu hiç render edilmez.
//
// Takviye ürünleri bilinçli olarak yok; sağlık içeriğinde güveni ve arama
// görünürlüğünü riske atar.

const item = (label, reason) => ({ label, reason, store: '', url: '' });

export const AFFILIATE_CATALOG = {
  tr: {
    'adjustable-dumbbell': item('Ayarlanabilir dambıl seti', 'Program ilerledikçe ağırlığı artırmak için tek set yeter.'),
    'dumbbell-pair-light': item('Sabit dambıl çifti (2–5 kg)', 'Omuz, kol ve ısınma hareketleri için hafif çift.'),
    'resistance-band-set': item('Farklı sertlikte direnç bandı seti', 'Kademeli direnç; dambılı tamamlar, sırt ve kalça hareketlerinde işe yarar.'),
    'tube-band-door-anchor': item('Kapı ankrajlı tüp bant', 'Kapıya sabitlenir; çekiş ve itiş hareketlerini evde mümkün kılar.'),
    'mini-band': item('Mini band (kalça bandı)', 'Kalça ve diz stabilitesi hareketleri için.'),
    'exercise-mat': item('Egzersiz matı', 'Yer hareketleri ve core çalışması için kaymayan zemin.'),
  },
  en: {
    'adjustable-dumbbell': item('Adjustable dumbbell set', 'One set covers the weight increases as the plan progresses.'),
    'dumbbell-pair-light': item('Fixed dumbbell pair (2–5 kg)', 'A light pair for shoulder, arm and warm-up work.'),
    'resistance-band-set': item('Resistance band set (mixed strength)', 'Progressive resistance that complements dumbbells for back and glute work.'),
    'tube-band-door-anchor': item('Tube band with door anchor', 'Anchors to a door so you can do rows and presses at home.'),
    'mini-band': item('Mini band (hip band)', 'For hip and knee stability exercises.'),
    'exercise-mat': item('Exercise mat', 'A non-slip surface for floor and core work.'),
  },
  es: {
    'adjustable-dumbbell': item('Set de mancuernas ajustables', 'Un solo set cubre los aumentos de peso a medida que avanza el plan.'),
    'dumbbell-pair-light': item('Par de mancuernas fijas (2–5 kg)', 'Un par ligero para hombros, brazos y calentamiento.'),
    'resistance-band-set': item('Set de bandas elásticas de distinta resistencia', 'Resistencia progresiva para espalda y glúteos.'),
    'tube-band-door-anchor': item('Banda tubular con anclaje de puerta', 'Se fija a una puerta para hacer remos y empujes en casa.'),
    'mini-band': item('Mini banda (banda de cadera)', 'Para ejercicios de estabilidad de cadera y rodilla.'),
    'exercise-mat': item('Esterilla de ejercicio', 'Superficie antideslizante para suelo y core.'),
  },
};

export const AFFILIATE_SETS = {
  dumbbell: ['adjustable-dumbbell', 'dumbbell-pair-light', 'resistance-band-set', 'exercise-mat'],
  band: ['resistance-band-set', 'tube-band-door-anchor', 'mini-band', 'exercise-mat'],
};

// Yerleşim kimliği analitikte de kullanılır; hangi sayfanın tıklama getirdiği buradan okunur.
export const AFFILIATE_PLACEMENTS = {
  seo_tr_dumbbell: { lang: 'tr', set: 'dumbbell' },
  seo_tr_band: { lang: 'tr', set: 'band' },
  seo_es_band: { lang: 'es', set: 'band' },
  app_home_basic: { set: 'dumbbell' }, // dil arayüzden gelir
};

// Google'dan ürün niyetiyle en çok tıklanan sayfalar (Search Console, Ekim 2026).
export const AFFILIATE_PAGE_PLACEMENTS = {
  '/evde-dambil-antrenman-programi': 'seo_tr_dumbbell',
  '/direnc-bandi-antrenman-programi': 'seo_tr_band',
  '/es/rutina-con-bandas-elasticas': 'seo_es_band',
};

export const AFFILIATE_COPY = {
  tr: {
    eyebrow: 'Ortaklık bağlantısı',
    title: 'Bu program için ekipman',
    intro: 'Programdaki hareketler için yeterli olan temel ekipman. Hepsi zorunlu değil; elindekiyle başlayabilirsin.',
    appTitle: 'Ekipmanın eksik mi?',
    cta: 'Ürünü incele',
    disclosure: 'Bunlar ortaklık bağlantılarıdır. Bağlantı üzerinden satın alırsan Full Balance küçük bir komisyon kazanır; fiyat senin için değişmez. Uygulama ücretsiz kalır.',
  },
  en: {
    eyebrow: 'Affiliate link',
    title: 'Equipment for this plan',
    intro: 'Basic equipment that covers the exercises in the plan. None of it is required; you can start with what you have.',
    appTitle: 'Missing equipment?',
    cta: 'View product',
    disclosure: 'These are affiliate links. If you buy through them, Full Balance earns a small commission at no extra cost to you. The app stays free.',
  },
  es: {
    eyebrow: 'Enlace de afiliado',
    title: 'Equipamiento para este plan',
    intro: 'Equipamiento básico suficiente para los ejercicios del plan. Nada es obligatorio; puedes empezar con lo que tienes.',
    appTitle: '¿Te falta equipamiento?',
    cta: 'Ver producto',
    disclosure: 'Son enlaces de afiliado. Si compras a través de ellos, Full Balance recibe una pequeña comisión sin coste adicional para ti. La app sigue siendo gratuita.',
  },
};

export function isValidAffiliateUrl(url) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Amazon global ──────────────────────────────────────────────
// Amazon.com (ABD) ortaklık etiketi, ör. 'fullbalance-20'. Boşken Amazon linki üretilmez.
// OneLink yalnızca ABD hesabında çalışır: Associates Central'da diğer ülke
// hesaplarını bağlayınca amazon.com linki ziyaretçinin ülkesindeki mağazaya gider.
// Linkler doğrudan amazon.com'a verilir; kendi sunucumuzdan yönlendirmek Amazon
// kurallarına aykırıdır.
export const AMAZON_ASSOCIATE_TAG = '';

// `asin` (10 karakter) girilirse ürün sayfasına, girilmezse amazon.com aramasına gider.
export const AMAZON_GLOBAL_PRODUCTS = {
  'adjustable-dumbbell': { asin: '', query: 'adjustable dumbbell set' },
  'dumbbell-pair-light': { asin: '', query: 'neoprene dumbbells pair' },
  'resistance-band-set': { asin: '', query: 'resistance bands set' },
  'tube-band-door-anchor': { asin: '', query: 'resistance tube bands with door anchor' },
  'mini-band': { asin: '', query: 'mini loop resistance bands' },
  'exercise-mat': { asin: '', query: 'non slip exercise mat' },
};

// Amazon Associates Operating Agreement'ın istediği cümle; birebir korunmalı.
export const AMAZON_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;

export function isValidAmazonTag(tag) {
  return /^[A-Za-z0-9-]{2,64}$/.test(tag || '');
}

const AMAZON_DOMAINS = [
  'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.es', 'amazon.fr', 'amazon.it', 'amazon.nl',
  'amazon.pl', 'amazon.se', 'amazon.ca', 'amazon.com.mx', 'amazon.com.br', 'amazon.co.jp',
  'amazon.com.au', 'amazon.sg', 'amazon.sa', 'amazon.ae', 'amazon.in', 'amazon.com.tr',
  'amazon.com.be', 'amazon.eg', 'amzn.to',
];

export function isAmazonUrl(url) {
  try {
    const host = new URL(url).hostname;
    return AMAZON_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function buildAmazonUrl(productId, tag = AMAZON_ASSOCIATE_TAG, products = AMAZON_GLOBAL_PRODUCTS) {
  const product = products[productId];
  if (!product || !isValidAmazonTag(tag)) return '';
  const encodedTag = encodeURIComponent(tag);
  if (ASIN_PATTERN.test(product.asin || '')) return `https://www.amazon.com/dp/${product.asin}?tag=${encodedTag}`;
  return `https://www.amazon.com/s?k=${encodeURIComponent(product.query)}&tag=${encodedTag}`;
}

/**
 * Gösterilmeye hazır ürünler: önce dilin yerel linki, yoksa Amazon global linki.
 * İkisi de yoksa ürün atlanır; hiçbiri yoksa boş dizi.
 */
export function getAffiliateProducts(set, lang, catalog = AFFILIATE_CATALOG, amazon = {}) {
  const tag = amazon.tag ?? AMAZON_ASSOCIATE_TAG;
  const amazonProducts = amazon.products ?? AMAZON_GLOBAL_PRODUCTS;
  const items = catalog[lang] || {};
  return (AFFILIATE_SETS[set] || []).flatMap((id) => {
    const product = items[id];
    if (!product) return [];
    if (isValidAffiliateUrl(product.url)) return [{ id, ...product }];
    const amazonUrl = buildAmazonUrl(id, tag, amazonProducts);
    return amazonUrl ? [{ id, ...product, store: 'Amazon', url: amazonUrl }] : [];
  });
}
