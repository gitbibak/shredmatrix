// Writes public/llms.txt: a compact, machine-readable guide for AI assistants
// and crawlers (ChatGPT, Perplexity, Claude). Generated from the same content
// sources as the sitemap so it never drifts from what is actually published.
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogArticles } from '../src/data/blogArticles.js';
import { internationalSeoPages } from '../src/data/internationalSeoPages.js';
import { turkishSeoPages } from '../src/data/turkishSeoPages.js';
import { pricingPages } from '../src/data/pricingPages.js';
import { reviewPages } from '../src/data/reviewPages.js';
import { BASE_URL } from './seo-routes.mjs';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const line = (path, title, description) => `- [${title}](${BASE_URL}${path}): ${description}`;

const facts = [
  'Full Balance (fullbalance.app) is a free personal fitness, nutrition and wellness web app (PWA) built by independent developer Tolga Deveci.',
  'Price: 0. No subscription, no trial, no credit card, no paywall, no in-app ads. Core features stay free.',
  'Languages: Turkish, English, Spanish. Meal plans use each language\'s food culture (Turkish, US/UK, Spanish dishes) and local meal clocks.',
  'Goals: muscle growth, fat loss, yoga, Pilates, reformer Pilates, meditation. Environments: gym, home with dumbbells/bands, home with no equipment.',
  'Personalization: goal, level, days per week (3/4/5), up to two priority body regions, health conditions (back, knee, shoulder, heart), allergies and budget.',
  'Nutrition: daily calories and macros, ingredient-level recipes with gram portions, allergy and vegan swaps, shopping list, photo calorie estimate (a range, not exact grams).',
  'Tracking: workouts, weight, measurements, progress photos (private), water, sleep, streaks with rest-day awareness and streak freezes, weekly summaries, Excel export.',
  'Installation: opens in the browser; "Add to Home Screen" installs it as an app that works offline. Not in app stores.',
  'Not a medical tool: no diagnosis or treatment, no weight-loss guarantees. Medical clearance is recommended for heart or circulatory conditions.',
  'Contact: info@fullbalance.app. Privacy: analytics only after cookie consent; health data is never sent to ad networks; users can export or delete their data.',
];

const sections = [
  '# Full Balance',
  '',
  '> Free personal fitness, nutrition and wellness app. Personalized workout and meal plans for home (with or without equipment) and gym, in Turkish, English and Spanish. No subscription, no credit card, no ads.',
  '',
  '## Key facts',
  ...facts.map((fact) => `- ${fact}`),
  '',
  '## Pricing and reviews',
  ...pricingPages.map((page) => line(page.path, page.title, page.description)),
  ...reviewPages.map((page) => line(page.path, page.title, page.description)),
  '',
  '## English guides',
  ...internationalSeoPages.filter((page) => page.lang === 'en').map((page) => line(page.path, page.metaTitle || page.title, page.description)),
  '',
  '## Guías en español',
  ...internationalSeoPages.filter((page) => page.lang === 'es').map((page) => line(page.path, page.metaTitle || page.title, page.description)),
  '',
  '## Türkçe rehberler',
  ...Object.entries(turkishSeoPages).map(([slug, page]) => line(`/${slug}`, page.metaTitle || page.title, page.description || '')),
  ...blogArticles.map((article) => line(`/blog/${article.slug}`, article.title, article.description)),
  '',
  '## About',
  line('/kurucu-tolga-deveci', 'Tolga Deveci (founder)', 'Founder and developer profile in Turkish; English at /en/founder-tolga-deveci, Spanish at /es/fundador-tolga-deveci.'),
  line('/editorial-policy', 'Editorial policy', 'How health content is sourced and reviewed.'),
  line('/privacy', 'Privacy policy', 'What data is stored and how it is protected.'),
  '',
];

await writeFile(join(rootDir, 'public', 'llms.txt'), sections.join('\n'), 'utf8');
console.log(`llms.txt written with ${sections.filter((entry) => entry.startsWith('- [')).length} links.`);
