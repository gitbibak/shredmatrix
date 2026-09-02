import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogArticles } from '../src/data/blogArticles.js';
import { BASE_URL } from './seo-routes.mjs';
import { seoLandingPages } from './seo-static-pages.mjs';
import { SEO_LAST_REVIEWED, formatReviewedDate, internationalSeoPages, getAlternatesForTurkishPath, getInternationalRelatedPages } from '../src/data/internationalSeoPages.js';

import { formatSampleExercise, getFourWeekPlan, getSampleWeek } from '../src/data/sampleWeekMap.js';

function sampleWeekHtml(path, lang) {
  const sample = getSampleWeek(path, lang);
  if (!sample) return '';
  const { days, copy } = sample;
  const rows = days.map((day) => `<tr><th scope="row">${escapeHtml(day.day)}</th><td>${escapeHtml(day.rest ? copy.restDay : day.focus)}</td><td><ul>${day.exercises.map((exercise) => `<li>${escapeHtml(formatSampleExercise(exercise, copy))}</li>`).join('')}</ul></td></tr>`).join('');
  const fourWeek = getFourWeekPlan(path, lang);
  const fourWeekHtml = fourWeek
    ? `<h3>${escapeHtml(fourWeek.title)}</h3><p>${escapeHtml(fourWeek.intro)}</p><table><thead><tr>${fourWeek.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${fourWeek.rows.map((row) => `<tr><th scope="row">${escapeHtml(row[0])}</th>${row.slice(1).map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : '';
  return `<section><h2>${escapeHtml(copy.title)}</h2><p>${escapeHtml(copy.intro)}</p><table><thead><tr><th scope="col">${escapeHtml(copy.day)}</th><th scope="col">${escapeHtml(copy.focus)}</th><th scope="col">${escapeHtml(copy.exercises)}</th></tr></thead><tbody>${rows}</tbody></table><p>${escapeHtml(copy.progression)}</p>${fourWeekHtml}</section>`;
}

const REVIEW_LABEL = { tr: 'Son güncelleme', en: 'Last reviewed', es: 'Última revisión' };
const SHORT_ANSWER_LABEL = { tr: 'Kısa cevap', en: 'Short answer', es: 'Respuesta breve' };
const OG_LOCALES = { tr: 'tr_TR', en: 'en_US', es: 'es_ES' };

function leadAnswerBlock(faqs, lang) {
  const first = Array.isArray(faqs) ? faqs[0] : null;
  if (!first) return '';
  return `<section><p>${escapeHtml(SHORT_ANSWER_LABEL[lang] || SHORT_ANSWER_LABEL.en)}</p><h2>${escapeHtml(first[0])}</h2><p>${escapeHtml(first[1])}</p><p>${escapeHtml(REVIEW_LABEL[lang] || REVIEW_LABEL.en)}: <time datetime="${SEO_LAST_REVIEWED}">${escapeHtml(formatReviewedDate(lang))}</time></p></section>`;
}

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, 'dist');
const template = await readFile(join(distDir, 'index.html'), 'utf8');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`(<meta[^>]+${attribute}="${key}"[^>]+content=")[^"]*("[^>]*>)`, 'i');
  return pattern.test(html)
    ? html.replace(pattern, `$1${escapeHtml(content)}$2`)
    : html.replace('</head>', `    <meta ${attribute}="${key}" content="${escapeHtml(content)}" />\n  </head>`);
}

function buildDocument({ title, description, canonical, image, type = 'website', schema, body, lang = 'tr', alternates = null }) {
  let html = template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace(/\s*<link rel="alternate"[^>]*>/gi, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/i, '')
    // Static pages already contain a complete localized body. Remove every
    // template fallback so crawlers do not see Turkish copy on EN/ES pages.
    .replace(/<noscript>[\s\S]*?<\/noscript>/gi, '')
    // The static block sits beside #root, not inside it, so React's first
    // commit cannot wipe it; the app removes it once the real page has mounted.
    .replace(/<div id="seo-static"[\s\S]*?<\/div>\s*<div id="root"><\/div>/, '<div id="root"></div>')
    .replace('<div id="root"></div>', `<div id="seo-static">${body}</div><div id="root"></div>`);

  html = html.replace(/<html lang="[^"]*">/i, `<html lang="${escapeHtml(lang)}">`);
  if (alternates) {
    const alternateTags = Object.entries(alternates)
      .map(([alternateLang, path]) => `<link rel="alternate" hreflang="${escapeHtml(alternateLang)}" href="${BASE_URL}${escapeHtml(path)}" />`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}${escapeHtml(alternates.en)}" />`)
      .join('\n    ');
    html = html.replace('</head>', `    ${alternateTags}\n  </head>`);
  }

  html = replaceMeta(html, 'name', 'description', description);
  html = replaceMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1');
  html = replaceMeta(html, 'property', 'og:type', type);
  html = replaceMeta(html, 'property', 'og:title', title);
  html = replaceMeta(html, 'property', 'og:description', description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:image', image);
  html = replaceMeta(html, 'property', 'og:image:secure_url', image);
  html = replaceMeta(html, 'property', 'og:image:type', 'image/jpeg');
  html = html.replace(/\s*<meta property="og:locale(?::alternate)?"[^>]*>/gi, '');
  const ogLocale = OG_LOCALES[lang] || OG_LOCALES.en;
  const ogLocaleTags = [
    `<meta property="og:locale" content="${ogLocale}" />`,
    ...Object.entries(OG_LOCALES)
      .filter(([alternateLang]) => alternateLang !== lang)
      .map(([, locale]) => `<meta property="og:locale:alternate" content="${locale}" />`),
  ].join('\n    ');
  html = html.replace('</head>', `    ${ogLocaleTags}\n  </head>`);
  html = replaceMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = replaceMeta(html, 'name', 'twitter:title', title);
  html = replaceMeta(html, 'name', 'twitter:description', description);
  html = replaceMeta(html, 'name', 'twitter:image', image);

  const staticStyles = `<style id="static-seo-styles">
    .static-seo{max-width:960px;margin:0 auto;padding:40px 20px 72px;color:#e2e8f0;background:#020617;font-family:Inter,system-ui,sans-serif;line-height:1.75}.static-seo h1{font-size:clamp(2rem,6vw,4rem);line-height:1.08;color:#fff}.static-seo h2{margin-top:2rem;font-size:1.5rem;line-height:1.3;color:#fff}.static-seo p{margin-top:1rem}.static-seo a{color:#34d399}.static-seo img{display:block;width:100%;height:auto;margin:2rem 0}.static-seo nav,.static-seo footer{margin-top:2rem;padding-top:1.25rem;border-top:1px solid #1e293b}.static-seo ul{padding-left:1.25rem}
  </style>`;
  return html.replace('</head>', `    ${staticStyles}\n    <script type="application/ld+json" data-static-seo="true">${safeJson(schema)}</script>\n  </head>`);
}

function articleBody(article) {
  const sections = article.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('');
  const sources = article.sources.map(([label, href]) => `<li><a href="${escapeHtml(href)}" rel="noreferrer">${escapeHtml(label)}</a></li>`).join('');
  const internalLinks = article.internalLinks?.length ? `<nav aria-label="İlgili Full Balance araçları"><h2>İlgili araçlar ve programlar</h2><ul>${article.internalLinks.map(([href, label]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('')}</ul></nav>` : '';
  const related = blogArticles.filter((item) => item.slug !== article.slug).slice(0, 3).map((item) => `<li><a href="/blog/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></li>`).join('');
  return `<main class="static-seo"><a href="/blog">Tüm rehberler</a><article><header><p>${escapeHtml(article.category)} · ${escapeHtml(article.readTime)}</p><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.intro)}</p><p>Yayın: <time datetime="${article.publishedAt}">${escapeHtml(article.publishedAt)}</time> · Güncelleme: <time datetime="${article.updatedAt}">${escapeHtml(article.updatedAt)}</time> · <a href="/editorial-policy">Full Balance Editör Ekibi</a></p></header><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" width="1600" height="900">${sections}${internalLinks}<aside><p>Bu içerik genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir.</p><a href="/editorial-policy">Yayın ilkelerimizi incele</a></aside><section><h2>Kaynaklar</h2><ul>${sources}</ul></section></article><nav aria-label="İlgili rehberler"><h2>İlgili rehberler</h2><ul>${related}</ul></nav><footer><a href="/auth?mode=register">Full Balance'a ücretsiz başla</a></footer></main>`;
}

function articleSchema(article) {
  const url = `${BASE_URL}/blog/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        image: [`${BASE_URL}${article.image}`],
        datePublished: `${article.publishedAt}T09:00:00+03:00`,
        dateModified: `${article.updatedAt}T09:00:00+03:00`,
        mainEntityOfPage: url,
        inLanguage: 'tr-TR',
        author: { '@type': 'Organization', name: 'Full Balance Editör Ekibi', url: `${BASE_URL}/editorial-policy` },
        publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL, logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` } },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Rehber', item: `${BASE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}

async function writeRoute(route, html) {
  const file = join(distDir, route.replace(/^\//, ''), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const blogDescription = 'Antrenman, beslenme, uyku, mobilite ve longevity hakkında uygulanabilir, kaynaklı ve ücretsiz Full Balance rehberleri.';
const blogBody = `<main class="static-seo"><header><a href="/">Full Balance</a><h1>Sağlıklı yaşamı karmaşıklaştırmadan anlayın</h1><p>${escapeHtml(blogDescription)}</p></header><section><h2>Tüm rehberler</h2>${blogArticles.map((article) => `<article><h2><a href="/blog/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.description)}</p></article>`).join('')}</section><footer><a href="/auth?mode=register">Full Balance'a ücretsiz başla</a> · <a href="/editorial-policy">Yayın ilkeleri</a></footer></main>`;
const blogSchema = { '@context': 'https://schema.org', '@type': 'Blog', name: 'Full Balance Rehber', url: `${BASE_URL}/blog`, description: blogDescription, publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL }, blogPost: blogArticles.map((article) => ({ '@type': 'BlogPosting', headline: article.title, image: `${BASE_URL}${article.image}`, url: `${BASE_URL}/blog/${article.slug}`, datePublished: article.publishedAt, dateModified: article.updatedAt })) };

for (const page of seoLandingPages) {
  const canonical = `${BASE_URL}/${page.slug}`;
  const alternates = getAlternatesForTurkishPath(`/${page.slug}`);
  const faqBody = page.faqs.length ? `<section><h2>Sık sorulan sorular</h2>${page.faqs.map(([question, answer]) => `<h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p>`).join('')}</section>` : '';
  const body = `<main class="static-seo"><a href="/">Full Balance</a><article><header><p>Tamamen ücretsiz · Kredi kartı gerekmez</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></header>${leadAnswerBlock(page.faqs, 'tr')}${sampleWeekHtml(`/${page.slug}`, 'tr')}<section><h2>Neler sunar?</h2><ul>${page.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join('')}</ul></section><section><h2>Full Balance ile kişisel plan</h2><p>Hedef, deneyim ve günlük bilgilere göre oluşturulan plan; antrenman, beslenme, su, uyku ve ilerleme takibini aynı mobil deneyimde birleştirir.</p></section>${faqBody}</article><nav aria-label="İlgili programlar"><a href="/evde-spor-programi">Ekipmansız evde spor</a> · <a href="/evde-dambil-antrenman-programi">Evde dambıl programı</a> · <a href="/evde-kas-gelistirme-hareketleri">Evde kas geliştirme</a> · <a href="/baslangic-pilates-programi">Başlangıç pilatesi</a> · <a href="/kalori-makro-takibi">Kalori hesabı</a> · <a href="/yoga-uygulamasi">Yoga</a> · <a href="/meditasyon-uygulamasi">Meditasyon</a></nav><footer><a href="/auth?mode=register">Ücretsiz hesabını oluştur</a></footer></main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: page.title, description: page.description, url: canonical, inLanguage: 'tr-TR', dateModified: SEO_LAST_REVIEWED },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: page.title, item: canonical },
      ] },
      ...(page.faqs.length ? [{ '@type': 'FAQPage', mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }] : []),
    ],
  };
  await writeRoute(`/${page.slug}`, buildDocument({ title: page.metaTitle || `${page.title} | Full Balance`, description: page.description, canonical, image: `${BASE_URL}/og/full-balance-og-tr.png`, schema, body, alternates }));
}

await writeRoute('/blog', buildDocument({ title: 'Sağlıklı Yaşam ve Longevity Rehberleri | Full Balance', description: blogDescription, canonical: `${BASE_URL}/blog`, image: `${BASE_URL}/images/blog/longevity-habits.jpg`, schema: blogSchema, body: blogBody }));

for (const article of blogArticles) {
  let document = buildDocument({ title: `${article.title} | Full Balance`, description: article.description, canonical: `${BASE_URL}/blog/${article.slug}`, image: `${BASE_URL}${article.image}`, type: 'article', schema: articleSchema(article), body: articleBody(article) });
  document = replaceMeta(document, 'name', 'author', 'Full Balance Editör Ekibi');
  document = replaceMeta(document, 'property', 'og:image:alt', article.imageAlt);
  document = replaceMeta(document, 'name', 'twitter:image:alt', article.imageAlt);
  document = replaceMeta(document, 'property', 'article:published_time', `${article.publishedAt}T09:00:00+03:00`);
  document = replaceMeta(document, 'property', 'article:modified_time', `${article.updatedAt}T09:00:00+03:00`);
  await writeRoute(`/blog/${article.slug}`, document);
}

const editorialDescription = 'Full Balance sağlık ve wellness rehberlerinin kaynak seçimi, hazırlama, güncelleme ve düzeltme ilkeleri.';
const editorialBody = `<main class="static-seo"><a href="/blog">Rehbere dön</a><h1>Yayın ilkelerimiz</h1><p>Full Balance rehberleri sağlıklı yaşam konularını sade ve uygulanabilir biçimde açıklamak için hazırlanır.</p><section><h2>Kaynak seçimi</h2><p>Önceliğimiz Dünya Sağlık Örgütü, ulusal sağlık kurumları, hakemli araştırmalar ve yetkili meslek kuruluşları gibi birincil ve kurumsal kaynaklardır.</p><h2>Tıbbi sınırlar</h2><p>İçerikler genel bilgilendirme içindir. Tanı, tedavi, kişiye özel tıbbi öneri veya sonuç garantisi verilmez.</p><h2>Hazırlama ve güncelleme</h2><p>Kaynaklar yazı sonunda gösterilir; önemli değişikliklerde içerik yeniden değerlendirilir ve güncelleme tarihi değiştirilir.</p></section><footer><a href="mailto:info@fullbalance.app">Düzeltme bildir</a> · <a href="/kurucu-tolga-deveci">Kurucu ve geliştirici: Tolga Deveci</a></footer></main>`;
const editorialSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Yayın İlkeleri ve İçerik Süreci', url: `${BASE_URL}/editorial-policy`, description: editorialDescription, inLanguage: 'tr-TR', publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL } };
await writeRoute('/editorial-policy', buildDocument({ title: 'Yayın İlkeleri ve İçerik Süreci | Full Balance', description: editorialDescription, canonical: `${BASE_URL}/editorial-policy`, image: `${BASE_URL}/images/blog/longevity-habits.jpg`, schema: editorialSchema, body: editorialBody }));

const founderAlternates = {
  tr: '/kurucu-tolga-deveci',
  en: '/en/founder-tolga-deveci',
  es: '/es/fundador-tolga-deveci',
};

const founderPages = [
  {
    lang: 'tr', locale: 'tr-TR', path: founderAlternates.tr,
    title: 'Tolga Deveci — Full Balance Kurucusu ve Geliştiricisi',
    description: 'Tolga Deveci, tamamen ücretsiz kişisel fitness, beslenme ve wellness uygulaması Full Balance’ın kurucusu ve yazılım geliştiricisidir.',
    heading: 'Tolga Deveci', eyebrow: 'Full Balance kurucusu ve geliştiricisi',
    intro: 'Full Balance, Tolga Deveci tarafından kurulan ve geliştirilen bağımsız, tamamen ücretsiz bir kişisel fitness ve wellness uygulamasıdır.',
    summaryTitle: 'Full Balance’ı kim geliştirdi?',
    summary: 'Full Balance’ın kurucusu ve yazılım geliştiricisi Tolga Deveci’dir. Ürünün planlama, kullanıcı deneyimi, yazılım geliştirme ve sürekli iyileştirme süreçlerini yürütür.',
    roleTitle: 'Tolga Deveci’nin projedeki rolü',
    role: 'Ürün fikrinin uygulamaya dönüşmesi, mobil ve web deneyimi, kişiselleştirme altyapısı, veri güvenliği, performans ve kullanıcı geri bildirimlerine göre yapılan iyileştirmeler ürün geliştirme sorumluluğunun parçalarıdır.',
    productTitle: 'Full Balance ne sunuyor?',
    product: 'Full Balance; kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates için hedef odaklı planları beslenme, su, uyku, ilerleme ve longevity alışkanlık takibiyle birleştirir. Evde ekipmansız, temel ekipmanlı veya salonda kullanılabilir.',
    identityTitle: 'Hangi Full Balance?',
    identity: 'Bu profil, fullbalance.app adresindeki Full Balance Fitness & Wellness uygulamasına aittir. Aynı veya benzer adı kullanan tabanlık, finans, e-ticaret ya da diğer kuruluşlarla bağlantısı yoktur.',
    socialProfile: 'Tolga Deveci’nin X profili',
    boundaryTitle: 'Ürün ve sağlık uzmanlığı ayrımı',
    boundary: 'Tolga Deveci ürünün kurucusu ve yazılım geliştiricisidir; sağlık uzmanı olarak tanıtılmaz. Full Balance tıbbi tanı veya tedavi aracı değildir. Sağlık içerikleri kaynaklı genel bilgilendirme olarak sunulur.',
    contact: 'Full Balance, ürün geliştirme veya basın konularında info@fullbalance.app adresinden iletişime geçebilirsiniz.',
    cta: 'Full Balance’ı ücretsiz kullan', policy: 'Yayın ilkeleri', home: 'Ana sayfa',
  },
  {
    lang: 'en', locale: 'en-US', path: founderAlternates.en,
    title: 'Tolga Deveci — Founder and Developer of Full Balance',
    description: 'Tolga Deveci is the founder and software developer of Full Balance, a completely free personal fitness, nutrition and wellness application.',
    heading: 'Tolga Deveci', eyebrow: 'Founder and developer of Full Balance',
    intro: 'Full Balance is an independent, completely free personal fitness and wellness application founded and developed by Tolga Deveci.',
    summaryTitle: 'Who developed Full Balance?',
    summary: 'Tolga Deveci is the founder and software developer of Full Balance. He leads product planning, user experience, software development and continuous improvement.',
    roleTitle: 'Tolga Deveci’s role in the project',
    role: 'His product responsibilities include turning the idea into a working application, developing the mobile and web experience, personalization infrastructure, data security, performance and improvements based on user feedback.',
    productTitle: 'What does Full Balance provide?',
    product: 'Full Balance combines goal-based plans for muscle growth, fat loss, yoga, meditation, reformer and Pilates with nutrition, water, sleep, progress and longevity habit tracking. It supports no-equipment home, basic-equipment home and gym environments.',
    identityTitle: 'Which Full Balance?',
    identity: 'This profile is about the Full Balance Fitness & Wellness application at fullbalance.app. It is not affiliated with the e-commerce, financial coaching, orthopedic insole or other organizations that use the same or a similar name.',
    socialProfile: 'Tolga Deveci on X',
    boundaryTitle: 'Product and health expertise',
    boundary: 'Tolga Deveci is presented as the product founder and software developer, not as a healthcare professional. Full Balance is not a medical diagnosis or treatment tool. Health content is general, sourced information.',
    contact: 'For questions about Full Balance, product development or press, contact info@fullbalance.app.',
    cta: 'Use Full Balance for free', policy: 'Editorial policy', home: 'Home',
  },
  {
    lang: 'es', locale: 'es-ES', path: founderAlternates.es,
    title: 'Tolga Deveci — Fundador y Desarrollador de Full Balance',
    description: 'Tolga Deveci es el fundador y desarrollador de Full Balance, una aplicación gratuita de fitness, nutrición y bienestar personal.',
    heading: 'Tolga Deveci', eyebrow: 'Fundador y desarrollador de Full Balance',
    intro: 'Full Balance es una aplicación personal e independiente de fitness y bienestar, completamente gratuita, fundada y desarrollada por Tolga Deveci.',
    summaryTitle: '¿Quién desarrolló Full Balance?',
    summary: 'Tolga Deveci es el fundador y desarrollador de software de Full Balance. Dirige la planificación del producto, la experiencia de usuario, el desarrollo y la mejora continua.',
    roleTitle: 'Función de Tolga Deveci en el proyecto',
    role: 'Sus responsabilidades incluyen convertir la idea en una aplicación funcional, desarrollar la experiencia móvil y web, la personalización, la seguridad de datos, el rendimiento y las mejoras basadas en comentarios de usuarios.',
    productTitle: '¿Qué ofrece Full Balance?',
    product: 'Full Balance combina planes para desarrollo muscular, pérdida de grasa, yoga, meditación, reformer y pilates con nutrición, agua, sueño, progreso y hábitos de longevidad. Admite entrenamiento en casa sin equipo, con equipo básico y en gimnasio.',
    identityTitle: '¿Qué Full Balance?',
    identity: 'Este perfil corresponde a la aplicación Full Balance Fitness & Wellness de fullbalance.app. No está afiliada con empresas de plantillas ortopédicas, asesoría financiera, comercio electrónico u otras organizaciones con un nombre igual o similar.',
    socialProfile: 'Tolga Deveci en X',
    boundaryTitle: 'Producto y experiencia sanitaria',
    boundary: 'Tolga Deveci se presenta como fundador y desarrollador del producto, no como profesional sanitario. Full Balance no diagnostica ni trata enfermedades. El contenido de salud es información general con fuentes.',
    contact: 'Para consultas sobre Full Balance, desarrollo de producto o prensa, escribe a info@fullbalance.app.',
    cta: 'Usar Full Balance gratis', policy: 'Política editorial', home: 'Inicio',
  },
];

for (const page of founderPages) {
  const canonical = `${BASE_URL}${page.path}`;
  const body = `<main class="static-seo"><header><a href="/${page.lang === 'tr' ? '' : page.lang}">${escapeHtml(page.home)}</a><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.intro)}</p></header><article><section><h2>${escapeHtml(page.summaryTitle)}</h2><p>${escapeHtml(page.summary)}</p></section><section><h2>${escapeHtml(page.roleTitle)}</h2><p>${escapeHtml(page.role)}</p></section><section><h2>${escapeHtml(page.productTitle)}</h2><p>${escapeHtml(page.product)}</p></section><section><h2>${escapeHtml(page.identityTitle)}</h2><p>${escapeHtml(page.identity)}</p><a href="https://x.com/TolgaDeveci" rel="me">${escapeHtml(page.socialProfile)}</a></section><section><h2>${escapeHtml(page.boundaryTitle)}</h2><p>${escapeHtml(page.boundary)}</p><a href="/editorial-policy">${escapeHtml(page.policy)}</a></section><section><h2>Contact</h2><p>${escapeHtml(page.contact)}</p></section></article><footer><a href="/auth?mode=register&amp;lang=${page.lang}">${escapeHtml(page.cta)}</a></footer></main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'ProfilePage', '@id': `${canonical}#profile`, url: canonical, name: page.title, description: page.description, inLanguage: page.locale, mainEntity: { '@id': `${BASE_URL}/#tolga-deveci` } },
      { '@type': 'Person', '@id': `${BASE_URL}/#tolga-deveci`, name: 'Tolga Deveci', jobTitle: page.lang === 'tr' ? 'Full Balance Kurucusu ve Yazılım Geliştiricisi' : page.lang === 'es' ? 'Fundador y Desarrollador de Software de Full Balance' : 'Founder and Software Developer of Full Balance', url: `${BASE_URL}${founderAlternates.tr}`, identifier: 'tolga-deveci-full-balance-app', sameAs: ['https://x.com/TolgaDeveci'], worksFor: { '@id': `${BASE_URL}/#organization` }, knowsAbout: ['Software development', 'Product development', 'User experience', 'Fitness application development'] },
      { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'Full Balance', alternateName: ['Full Balance App', 'Full Balance Fitness & Wellness App'], identifier: 'fullbalance.app', description: 'The independent Full Balance Fitness & Wellness application published at fullbalance.app.', url: `${BASE_URL}/`, logo: `${BASE_URL}/icon-512.png`, founder: { '@id': `${BASE_URL}/#tolga-deveci` } },
      { '@type': ['WebApplication', 'SoftwareApplication'], '@id': `${BASE_URL}/#app`, name: 'Full Balance', alternateName: ['Full Balance App', 'Full Balance Fitness & Wellness App'], identifier: 'fullbalance.app', url: `${BASE_URL}/`, creator: { '@id': `${BASE_URL}/#tolga-deveci` }, publisher: { '@id': `${BASE_URL}/#organization` }, applicationCategory: 'HealthApplication', isAccessibleForFree: true },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Full Balance', item: `${BASE_URL}/` }, { '@type': 'ListItem', position: 2, name: 'Tolga Deveci', item: canonical }] },
    ],
  };
  await writeRoute(page.path, buildDocument({ title: page.title, description: page.description, canonical, image: `${BASE_URL}/og/full-balance-og-${page.lang === 'es' ? 'en' : page.lang}.png`, schema, body, lang: page.lang, alternates: founderAlternates }));
}

for (const page of internationalSeoPages) {
  const canonical = `${BASE_URL}${page.path}`;
  const related = getInternationalRelatedPages(page).slice(0, 8);
  const relatedLabel = page.lang === 'es' ? 'Explora más objetivos y herramientas' : 'Explore more goals and tools';
  const body = `<main class="static-seo"><header><a href="/${page.lang}">Full Balance</a><p>${escapeHtml(page.freeLabel)}</p><h1>${escapeHtml(page.title)} ${escapeHtml(page.accent)}</h1><p>${escapeHtml(page.hero)}</p></header>${leadAnswerBlock(page.faqs, page.lang)}${sampleWeekHtml(page.path, page.lang)}<article><section><h2>${escapeHtml(page.featuresLabel)}</h2>${page.sections.map(([title, text]) => `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p>`).join('')}</section><section><h2>${escapeHtml(page.faqLabel)}</h2>${page.faqs.map(([question, answer]) => `<h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p>`).join('')}</section><p>${escapeHtml(page.disclaimer)}</p></article><nav aria-label="${escapeHtml(relatedLabel)}"><h2>${escapeHtml(relatedLabel)}</h2><ul>${related.map((item) => `<li><a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></nav><footer><a href="/auth?mode=register&amp;lang=${page.lang}">${escapeHtml(page.startLabel)}</a></footer></main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: page.metaTitle, description: page.description, url: canonical, inLanguage: page.locale, dateModified: SEO_LAST_REVIEWED, isPartOf: { '@id': `${BASE_URL}/#website` }, about: { '@id': `${BASE_URL}/#app` } },
      { '@type': 'FAQPage', mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Full Balance', item: `${BASE_URL}/${page.lang}` }, { '@type': 'ListItem', position: 2, name: page.title, item: canonical }] },
      { '@type': ['WebApplication', 'SoftwareApplication'], '@id': `${BASE_URL}/#app`, name: 'Full Balance', url: BASE_URL, applicationCategory: 'HealthApplication', operatingSystem: 'Web, iOS, Android, PWA', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    ],
  };
  await writeRoute(page.path, buildDocument({ title: page.metaTitle, description: page.description, canonical, image: `${BASE_URL}/og/full-balance-og-en.png`, schema, body, lang: page.lang, alternates: page.alternates }));
}

console.log(`Generated ${blogArticles.length + seoLandingPages.length + internationalSeoPages.length + founderPages.length + 2} static SEO pages.`);
