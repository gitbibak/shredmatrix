import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogArticles } from '../src/data/blogArticles.js';
import { BASE_URL } from './seo-routes.mjs';
import { seoLandingPages } from './seo-static-pages.mjs';
import { internationalSeoPages, getAlternatesForTurkishPath, getInternationalRelatedPages } from '../src/data/internationalSeoPages.js';

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
    .replace(/<noscript>[\s\S]*?<\/noscript>/i, '')
    .replace('<div id="root"></div>', `<div id="root"><div id="seo-static">${body}</div></div>`);

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
  const faqBody = page.faqs.length ? `<section><h2>Sık sorulan sorular</h2>${page.faqs.map(([question, answer]) => `<h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p>`).join('')}</section>` : '';
  const body = `<main class="static-seo"><a href="/">Full Balance</a><article><header><p>Tamamen ücretsiz · Kredi kartı gerekmez</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></header><section><h2>Neler sunar?</h2><ul>${page.benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join('')}</ul></section><section><h2>Full Balance ile kişisel plan</h2><p>Hedef, deneyim ve günlük bilgilere göre oluşturulan plan; antrenman, beslenme, su, uyku ve ilerleme takibini aynı mobil deneyimde birleştirir.</p></section>${faqBody}</article><nav aria-label="İlgili programlar"><a href="/evde-spor-programi">Evde spor</a> · <a href="/evde-kas-gelistirme-hareketleri">Evde kas geliştirme</a> · <a href="/baslangic-pilates-programi">Başlangıç pilatesi</a> · <a href="/kalori-makro-takibi">Kalori hesabı</a> · <a href="/yoga-uygulamasi">Yoga</a> · <a href="/meditasyon-uygulamasi">Meditasyon</a></nav><footer><a href="/auth?mode=register">Ücretsiz hesabını oluştur</a></footer></main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: page.title, description: page.description, url: canonical, inLanguage: 'tr-TR' },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: page.title, item: canonical },
      ] },
      ...(page.faqs.length ? [{ '@type': 'FAQPage', mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }] : []),
    ],
  };
  await writeRoute(`/${page.slug}`, buildDocument({ title: `${page.title} | Full Balance`, description: page.description, canonical, image: `${BASE_URL}/og/full-balance-og-tr.png`, schema, body, alternates }));
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
const editorialBody = `<main class="static-seo"><a href="/blog">Rehbere dön</a><h1>Yayın ilkelerimiz</h1><p>Full Balance rehberleri sağlıklı yaşam konularını sade ve uygulanabilir biçimde açıklamak için hazırlanır.</p><section><h2>Kaynak seçimi</h2><p>Önceliğimiz Dünya Sağlık Örgütü, ulusal sağlık kurumları, hakemli araştırmalar ve yetkili meslek kuruluşları gibi birincil ve kurumsal kaynaklardır.</p><h2>Tıbbi sınırlar</h2><p>İçerikler genel bilgilendirme içindir. Tanı, tedavi, kişiye özel tıbbi öneri veya sonuç garantisi verilmez.</p><h2>Hazırlama ve güncelleme</h2><p>Kaynaklar yazı sonunda gösterilir; önemli değişikliklerde içerik yeniden değerlendirilir ve güncelleme tarihi değiştirilir.</p></section><footer><a href="mailto:info@fullbalance.app">Düzeltme bildir</a></footer></main>`;
const editorialSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Yayın İlkeleri ve İçerik Süreci', url: `${BASE_URL}/editorial-policy`, description: editorialDescription, inLanguage: 'tr-TR', publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL } };
await writeRoute('/editorial-policy', buildDocument({ title: 'Yayın İlkeleri ve İçerik Süreci | Full Balance', description: editorialDescription, canonical: `${BASE_URL}/editorial-policy`, image: `${BASE_URL}/images/blog/longevity-habits.jpg`, schema: editorialSchema, body: editorialBody }));

for (const page of internationalSeoPages) {
  const canonical = `${BASE_URL}${page.path}`;
  const related = getInternationalRelatedPages(page).slice(0, 8);
  const relatedLabel = page.lang === 'es' ? 'Explora más objetivos y herramientas' : 'Explore more goals and tools';
  const body = `<main class="static-seo"><header><a href="/${page.lang}">Full Balance</a><p>${escapeHtml(page.freeLabel)}</p><h1>${escapeHtml(page.title)} ${escapeHtml(page.accent)}</h1><p>${escapeHtml(page.hero)}</p></header><article><section><h2>${escapeHtml(page.featuresLabel)}</h2>${page.sections.map(([title, text]) => `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p>`).join('')}</section><section><h2>${escapeHtml(page.faqLabel)}</h2>${page.faqs.map(([question, answer]) => `<h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p>`).join('')}</section><p>${escapeHtml(page.disclaimer)}</p></article><nav aria-label="${escapeHtml(relatedLabel)}"><h2>${escapeHtml(relatedLabel)}</h2><ul>${related.map((item) => `<li><a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a></li>`).join('')}</ul></nav><footer><a href="/auth?mode=register&amp;lang=${page.lang}&amp;source=international-seo">${escapeHtml(page.startLabel)}</a></footer></main>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: page.metaTitle, description: page.description, url: canonical, inLanguage: page.locale, isPartOf: { '@id': `${BASE_URL}/#website` }, about: { '@id': `${BASE_URL}/#app` } },
      { '@type': 'FAQPage', mainEntity: page.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Full Balance', item: `${BASE_URL}/${page.lang}` }, { '@type': 'ListItem', position: 2, name: page.title, item: canonical }] },
      { '@type': ['WebApplication', 'SoftwareApplication'], '@id': `${BASE_URL}/#app`, name: 'Full Balance', url: BASE_URL, applicationCategory: 'HealthApplication', operatingSystem: 'Web, iOS, Android, PWA', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    ],
  };
  await writeRoute(page.path, buildDocument({ title: page.metaTitle, description: page.description, canonical, image: `${BASE_URL}/og/full-balance-og-en.png`, schema, body, lang: page.lang, alternates: page.alternates }));
}

console.log(`Generated ${blogArticles.length + seoLandingPages.length + internationalSeoPages.length + 2} static SEO pages.`);
