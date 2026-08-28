import { blogArticles } from '../src/data/blogArticles.js';
import { internationalSeoPages } from '../src/data/internationalSeoPages.js';

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
  ['/ucretsiz-fitness-uygulamasi', '2026-08-14'],
  ['/kalori-makro-takibi', '2026-08-16'],
  ['/antrenman-programi', '2026-08-14'],
  ['/ilerleme-takibi', '2026-08-14'],
  ['/su-uyku-kilo-takibi', '2026-08-14'],
  ['/yoga-pilates-reformer', '2026-08-14'],
  ['/excel-rapor-disari-aktarma', '2026-08-14'],
  ['/kas-gelisimi-programi', '2026-08-14'],
  ['/yag-yakimi-programi', '2026-08-14'],
  ['/ucretsiz-beslenme-programi', '2026-08-14'],
  ['/protein-ihtiyaci-hesaplama', '2026-08-14'],
  ['/bmi-hesaplama', '2026-08-14'],
  ['/alerjiye-gore-beslenme-programi', '2026-08-14'],
  ['/yoga-uygulamasi', '2026-08-14'],
  ['/pilates-programi', '2026-08-14'],
  ['/reformer-pilates-programi', '2026-08-14'],
  ['/meditasyon-uygulamasi', '2026-08-14'],
  ['/evde-spor-programi', '2026-08-16'],
  ['/evde-dambil-antrenman-programi', '2026-08-24'],
  ['/evde-kas-gelistirme-hareketleri', '2026-08-16'],
  ['/baslangic-pilates-programi', '2026-08-16'],
  ['/blog', '2026-08-10'],
  ...blogArticles.map((article) => [`/blog/${article.slug}`, article.updatedAt]),
  ...internationalSeoPages.map((page) => [
    page.path,
    page.topic === 'reformer'
      ? '2026-08-28'
      : (['homeWorkout', 'homeDumbbell', 'homeMuscle', 'beginnerPilates'].includes(page.topic) ? '2026-08-24' : '2026-08-14'),
  ]),
];
