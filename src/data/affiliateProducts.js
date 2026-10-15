// Ortaklık (affiliate) ekipman önerileri.
//
// Linkler kurucu tarafından ortaklık panellerinden (Hepsiburada Link Gelir,
// Trendyol Affiliate, Amazon.es Afiliados) üretilip ilgili ürünün `url`
// alanına yapıştırılır; `store` alanına mağaza adı yazılır. Adım adım rehber:
// docs/ortaklik-linkleri.md
//
// `url` boş veya https değilse ürün gösterilmez. Bir yerleşimde gösterilecek
// ürün kalmazsa kutu hiç render edilmez: link girilene kadar sitede görünür
// bir değişiklik olmaz.
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

/** Gösterilmeye hazır (https linki girilmiş) ürünler; hiçbiri yoksa boş dizi. */
export function getAffiliateProducts(set, lang, catalog = AFFILIATE_CATALOG) {
  const items = catalog[lang] || {};
  return (AFFILIATE_SETS[set] || [])
    .filter((id) => items[id] && isValidAffiliateUrl(items[id].url))
    .map((id) => ({ id, ...items[id] }));
}
