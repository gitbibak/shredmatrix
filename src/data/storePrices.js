// Competitor subscription prices as listed on each country's App Store page.
// Read from apps.apple.com on CHECKED_AT; the store lists several price points
// per plan (promos, regions, legacy plans), so ranges are shown, not one price.
// Re-check before changing: never round, guess or copy third-party sites.
// Cal AI lists only "Unlimited" plans without a period, so the period is not stated.
export const STORE_PRICES_CHECKED_AT = '2026-11-04';

const url = (country, slug, id) => `https://apps.apple.com/${country}/app/${slug}/id${id}`;

export const storePrices = {
  tr: {
    store: 'App Store Türkiye',
    title: 'App Store\'daki gerçek fiyatlar',
    intro: 'Benzer uygulamaların App Store Türkiye sayfasında listelenen abonelik fiyatları. Mağaza aynı plan için birden çok fiyat gösterebildiği için aralık veriyoruz.',
    head: ['Uygulama', 'Ne için', 'App Store\'da listelenen abonelik', 'Full Balance'],
    note: 'Fiyatlar 4 Kasım 2026\'da App Store Türkiye sayfalarından okunmuştur; mağaza, bölge ve kampanyaya göre değişebilir. Markalar ilgili sahiplerine aittir; Full Balance bu şirketlerle bağlantılı değildir.',
    source: 'Kaynak',
    rows: [
      ['Fitbod', 'Antrenman planı', 'Yıllık ₺899,99–₺3.999,99 · aylık ₺142,99–₺699,99', '0 TL', url('tr', 'fitbod-workout-gym-planner', '1041517543')],
      ['MyFitnessPal', 'Kalori ve beslenme', 'Yıllık ₺129,99–₺2.499,99 · aylık ₺26,99–₺134,99', '0 TL', url('tr', 'myfitnesspal-calorie-counter', '341232718')],
      ['Cal AI', 'Fotoğrafla kalori', '"Unlimited" planlar ₺62,99–₺2.499,99 (dönem belirtilmemiş)', '0 TL', url('tr', 'cal-ai-calorie-tracker', '6480417616')],
      ['Yazio', 'Kalori ve oruç', '12 aylık ₺299,99–₺959,99', '0 TL', url('tr', 'ai-calorie-counter-by-yazio', '946099227')],
    ],
  },
  en: {
    store: 'US App Store',
    title: 'What similar apps charge on the App Store',
    intro: 'Subscription prices listed on the US App Store pages of similar apps. The store can show several prices for the same plan, so we show ranges.',
    head: ['App', 'For', 'Subscription listed on the App Store', 'Full Balance'],
    note: 'Prices were read from US App Store pages on 4 November 2026 and can vary by store, region and promotion. Trademarks belong to their owners; Full Balance is not affiliated with these companies.',
    source: 'Source',
    rows: [
      ['Fitbod', 'Workout plans', 'Yearly $79.99–$95.99 · monthly $12.99–$15.99', '$0', url('us', 'fitbod-gym-fitness-planner', '1041517543')],
      ['MyFitnessPal', 'Calories and nutrition', 'Yearly $49.99–$79.99 · monthly $9.99–$19.99', '$0', url('us', 'myfitnesspal-calorie-counter', '341232718')],
      ['Cal AI', 'Photo calorie tracking', '"Unlimited" plans $2.99–$29.99 (period not stated)', '$0', url('us', 'cal-ai-calorie-tracker', '6480417616')],
      ['Yazio', 'Calories and fasting', '12 months $23.90–$47.90', '$0', url('us', 'ai-calorie-tracker-by-yazio', '946099227')],
    ],
  },
  es: {
    store: 'App Store España',
    title: 'Lo que cobran apps similares en la App Store',
    intro: 'Precios de suscripción que aparecen en las páginas de la App Store de España de apps similares. La tienda puede mostrar varios precios para el mismo plan, por eso damos rangos.',
    head: ['App', 'Para', 'Suscripción en la App Store', 'Full Balance'],
    note: 'Precios leídos de las páginas de la App Store de España el 4 de noviembre de 2026; pueden variar según tienda, región y promoción. Las marcas pertenecen a sus propietarios; Full Balance no está afiliada a estas empresas.',
    source: 'Fuente',
    rows: [
      ['Fitbod', 'Planes de entreno', 'Anual 69,99–81,99 € · mensual 10,99–14,99 €', '0 €', 'https://apps.apple.com/es/app/id1041517543'],
      ['MyFitnessPal', 'Calorías y nutrición', 'Anual 49,99–87,99 € · mensual 9,99–21,99 €', '0 €', url('es', 'myfitnesspal-cuenta-calor%C3%ADas', '341232718')],
      ['Cal AI', 'Calorías con foto', 'Planes "Unlimited" 2,99–34,99 € (periodo no indicado)', '0 €', url('es', 'cal-ai-ai-calorie-tracker', '6480417616')],
      ['Yazio', 'Calorías y ayuno', '12 meses 14,99–47,90 €', '0 €', url('es', 'yazio-contador-de-calorias', '946099227')],
    ],
  },
};
