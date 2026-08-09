import { blogArticles } from '../src/data/blogArticles.js';

export const BASE_URL = 'https://fullbalance.app';

export const publicPages = [
  ['/', '2026-08-10'],
  ['/privacy', '2026-08-10'],
  ['/terms', '2026-08-04'],
  ['/contact', '2026-08-10'],
  ['/editorial-policy', '2026-08-10'],
  ['/ucretsiz-fitness-uygulamasi', '2026-08-04'],
  ['/kalori-makro-takibi', '2026-08-04'],
  ['/antrenman-programi', '2026-08-04'],
  ['/ilerleme-takibi', '2026-08-04'],
  ['/su-uyku-kilo-takibi', '2026-08-04'],
  ['/yoga-pilates-reformer', '2026-08-04'],
  ['/excel-rapor-disari-aktarma', '2026-08-04'],
  ['/kas-gelisimi-programi', '2026-08-04'],
  ['/yag-yakimi-programi', '2026-08-04'],
  ['/ucretsiz-beslenme-programi', '2026-08-04'],
  ['/protein-ihtiyaci-hesaplama', '2026-08-04'],
  ['/bmi-hesaplama', '2026-08-04'],
  ['/alerjiye-gore-beslenme-programi', '2026-08-04'],
  ['/yoga-uygulamasi', '2026-08-04'],
  ['/pilates-programi', '2026-08-04'],
  ['/reformer-pilates-programi', '2026-08-04'],
  ['/meditasyon-uygulamasi', '2026-08-04'],
  ['/blog', '2026-08-10'],
  ...blogArticles.map((article) => [`/blog/${article.slug}`, article.updatedAt]),
];
