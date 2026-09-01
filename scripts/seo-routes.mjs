import { blogArticles } from '../src/data/blogArticles.js';
import { internationalSeoPages } from '../src/data/internationalSeoPages.js';
import { turkishSeoPages } from '../src/data/turkishSeoPages.js';

// Last meaningful content change per Turkish page; new pages default to today.
const turkishPageLastmod = {
  'ucretsiz-fitness-uygulamasi': '2026-09-01', 'kalori-makro-takibi': '2026-09-02', 'antrenman-programi': '2026-09-01',
  'ilerleme-takibi': '2026-09-01', 'su-uyku-kilo-takibi': '2026-09-01', 'yoga-pilates-reformer': '2026-09-01',
  'excel-rapor-disari-aktarma': '2026-09-01', 'kas-gelisimi-programi': '2026-09-01', 'yag-yakimi-programi': '2026-09-01',
  'ucretsiz-beslenme-programi': '2026-09-01', 'protein-ihtiyaci-hesaplama': '2026-09-01', 'bmi-hesaplama': '2026-09-01',
  'alerjiye-gore-beslenme-programi': '2026-09-01', 'yoga-uygulamasi': '2026-09-01', 'pilates-programi': '2026-09-01',
  'reformer-pilates-programi': '2026-09-01', 'meditasyon-uygulamasi': '2026-09-01', 'evde-spor-programi': '2026-09-01',
  'evde-dambil-antrenman-programi': '2026-09-01', 'evde-kas-gelistirme-hareketleri': '2026-09-01', 'baslangic-pilates-programi': '2026-09-01',
};

export const BASE_URL = 'https://fullbalance.app';

export const publicPages = [
  ['/', '2026-08-14'],
  ['/privacy', '2026-08-10'],
  ['/terms', '2026-08-04'],
  ['/contact', '2026-08-10'],
  ['/editorial-policy', '2026-08-10'],
  ['/kurucu-tolga-deveci', '2026-08-24'],
  ['/en/founder-tolga-deveci', '2026-08-24'],
  ['/es/fundador-tolga-deveci', '2026-08-24'],
  ...Object.keys(turkishSeoPages).map((slug) => [`/${slug}`, turkishPageLastmod[slug] || '2026-09-02']),
  ...blogArticles.map((article) => [`/blog/${article.slug}`, article.updatedAt]),
  ...internationalSeoPages.map((page) => [
    page.path,
    ['photoCalories', 'calories', 'resistanceBand', 'fourWeekHome', 'womenHome', 'over40'].includes(page.topic)
      ? '2026-09-02'
      : page.topic === 'reformer'
      ? '2026-08-28'
      : (['homeWorkout', 'homeDumbbell', 'homeMuscle', 'beginnerPilates'].includes(page.topic) ? '2026-08-24' : '2026-08-14'),
  ]),
];
