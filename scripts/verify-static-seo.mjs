import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogArticles } from '../src/data/blogArticles.js';
import { BASE_URL, publicPages } from './seo-routes.mjs';
import { seoLandingPages } from './seo-static-pages.mjs';
import { internationalSeoPages, getAlternatesForTurkishPath } from '../src/data/internationalSeoPages.js';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, 'dist');

function assert(condition, message) {
  if (!condition) throw new Error(`SEO verification failed: ${message}`);
}

function occurrences(content, needle) {
  return content.split(needle).length - 1;
}

function assertSingleLocalizedH1(html, route, lang = 'tr') {
  assert(occurrences(html, '<h1') === 1, `${route} must contain exactly one H1`);
  if (lang !== 'tr') {
    assert(!html.includes('Tamamen ücretsiz kişisel fitness'), `${route} contains the Turkish fallback copy`);
  }
}

for (const article of blogArticles) {
  const file = join(distDir, 'blog', article.slug, 'index.html');
  const html = await readFile(file, 'utf8');
  const canonical = `${BASE_URL}/blog/${article.slug}`;

  assert(html.includes(`<title>${article.title} | Full Balance</title>`), `${article.slug} title is missing`);
  assert(html.includes(`rel="canonical" href="${canonical}"`), `${article.slug} canonical is missing`);
  assert(html.includes(`content="${article.description.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`), `${article.slug} description is missing`);
  assert(html.includes(`<h1>${article.title}</h1>`), `${article.slug} visible H1 is missing`);
  assertSingleLocalizedH1(html, `blog/${article.slug}`);
  assert(html.includes('"@type":"BlogPosting"'), `${article.slug} BlogPosting schema is missing`);
  assert(html.includes(`${BASE_URL}${article.image}`), `${article.slug} image metadata is missing`);
  assert(html.includes('id="seo-static"'), `${article.slug} static article content is missing`);
  assert(!html.includes('rel="alternate"'), `${article.slug} has an incorrect language alternate`);
  assert(occurrences(html, 'type="application/ld+json"') === 1, `${article.slug} has conflicting structured data blocks`);
  await access(join(rootDir, 'public', article.image));
}

for (const page of seoLandingPages) {
  const html = await readFile(join(distDir, page.slug, 'index.html'), 'utf8');
  assert(html.includes(`<h1>${page.title}</h1>`), `${page.slug} visible H1 is missing`);
  assertSingleLocalizedH1(html, page.slug);
  assert(html.includes(`rel="canonical" href="${BASE_URL}/${page.slug}"`), `${page.slug} canonical is missing`);
  assert(html.includes('id="seo-static"'), `${page.slug} static content is missing`);
  assert(html.includes('/auth?mode=register'), `${page.slug} registration CTA is missing`);
  assert(occurrences(html, 'type="application/ld+json"') === 1, `${page.slug} has conflicting structured data blocks`);
  const alternates = getAlternatesForTurkishPath(`/${page.slug}`);
  if (alternates) {
    assert(html.includes(`hreflang="en" href="${BASE_URL}${alternates.en}"`), `${page.slug} reciprocal English alternate is missing`);
    assert(html.includes(`hreflang="es" href="${BASE_URL}${alternates.es}"`), `${page.slug} reciprocal Spanish alternate is missing`);
  }
}

const blogHtml = await readFile(join(distDir, 'blog', 'index.html'), 'utf8');
assert(blogHtml.includes('<h1>Sağlıklı yaşamı karmaşıklaştırmadan anlayın</h1>'), 'blog index H1 is missing');
assertSingleLocalizedH1(blogHtml, 'blog');
assert(blogHtml.includes('"@type":"Blog"'), 'blog index schema is missing');

const editorialHtml = await readFile(join(distDir, 'editorial-policy', 'index.html'), 'utf8');
assert(editorialHtml.includes('<h1>Yayın ilkelerimiz</h1>'), 'editorial policy H1 is missing');
assertSingleLocalizedH1(editorialHtml, 'editorial-policy');
assert(editorialHtml.includes(`${BASE_URL}/editorial-policy`), 'editorial policy canonical is missing');
assert(editorialHtml.includes('/kurucu-tolga-deveci'), 'editorial policy founder link is missing');

const founderRoutes = [
  ['kurucu-tolga-deveci', 'tr', 'Tolga Deveci — Full Balance Kurucusu ve Geliştiricisi'],
  ['en/founder-tolga-deveci', 'en', 'Tolga Deveci — Founder and Developer of Full Balance'],
  ['es/fundador-tolga-deveci', 'es', 'Tolga Deveci — Fundador y Desarrollador de Full Balance'],
];

for (const [route, lang, title] of founderRoutes) {
  const html = await readFile(join(distDir, route, 'index.html'), 'utf8');
  assert(html.includes(`<html lang="${lang}">`), `${route} document language is missing`);
  assert(html.includes(`<title>${title}</title>`), `${route} title is missing`);
  assert(html.includes('<h1>Tolga Deveci</h1>'), `${route} visible founder H1 is missing`);
  assertSingleLocalizedH1(html, route, lang);
  assert(html.includes('"@type":"ProfilePage"'), `${route} ProfilePage schema is missing`);
  assert(html.includes('"@type":"Person"'), `${route} Person schema is missing`);
  assert(html.includes('"founder":{"@id":"https://fullbalance.app/#tolga-deveci"}'), `${route} organization founder relationship is missing`);
  assert(html.includes('"creator":{"@id":"https://fullbalance.app/#tolga-deveci"}'), `${route} application creator relationship is missing`);
  assert(html.includes(`hreflang="tr" href="${BASE_URL}/kurucu-tolga-deveci"`), `${route} Turkish alternate is missing`);
  assert(html.includes(`hreflang="en" href="${BASE_URL}/en/founder-tolga-deveci"`), `${route} English alternate is missing`);
  assert(html.includes(`hreflang="es" href="${BASE_URL}/es/fundador-tolga-deveci"`), `${route} Spanish alternate is missing`);
  assert(occurrences(html, 'type="application/ld+json"') === 1, `${route} has conflicting structured data blocks`);
}

for (const page of internationalSeoPages) {
  const html = await readFile(join(distDir, page.path.replace(/^\//, ''), 'index.html'), 'utf8');
  assert(html.includes(`<html lang="${page.lang}">`), `${page.path} document language is missing`);
  assert(html.includes(`<h1>${page.title} ${page.accent}</h1>`), `${page.path} visible H1 is missing`);
  assertSingleLocalizedH1(html, page.path, page.lang);
  assert(html.includes(`property="og:locale" content="${page.lang === 'es' ? 'es_ES' : 'en_US'}"`), `${page.path} Open Graph locale is incorrect`);
  assert(html.includes(`rel="canonical" href="${BASE_URL}${page.path}"`), `${page.path} canonical is missing`);
  assert(html.includes(`hreflang="en" href="${BASE_URL}${page.alternates.en}"`), `${page.path} English alternate is missing`);
  assert(html.includes(`hreflang="es" href="${BASE_URL}${page.alternates.es}"`), `${page.path} Spanish alternate is missing`);
  assert(html.includes(`hreflang="tr" href="${BASE_URL}${page.alternates.tr}"`), `${page.path} Turkish alternate is missing`);
  assert(html.includes('id="seo-static"'), `${page.path} static content is missing`);
  assert(html.includes(`lang=${page.lang}`), `${page.path} localized registration CTA is missing`);
  assert(occurrences(html, 'type="application/ld+json"') === 1, `${page.path} has conflicting structured data blocks`);
}

const sitemap = await readFile(join(rootDir, 'public', 'sitemap.xml'), 'utf8');
for (const [path] of publicPages) {
  assert(sitemap.includes(`<loc>${BASE_URL}${path}</loc>`), `${path} is missing from sitemap.xml`);
}

console.log(`Verified ${blogArticles.length + seoLandingPages.length + internationalSeoPages.length + founderRoutes.length + 2} static SEO pages and ${publicPages.length} sitemap URLs.`);
