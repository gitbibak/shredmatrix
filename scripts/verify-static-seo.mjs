import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogArticles } from '../src/data/blogArticles.js';
import { BASE_URL, publicPages } from './seo-routes.mjs';
import { seoLandingPages } from './seo-static-pages.mjs';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(rootDir, 'dist');

function assert(condition, message) {
  if (!condition) throw new Error(`SEO verification failed: ${message}`);
}

function occurrences(content, needle) {
  return content.split(needle).length - 1;
}

for (const article of blogArticles) {
  const file = join(distDir, 'blog', article.slug, 'index.html');
  const html = await readFile(file, 'utf8');
  const canonical = `${BASE_URL}/blog/${article.slug}`;

  assert(html.includes(`<title>${article.title} | Full Balance</title>`), `${article.slug} title is missing`);
  assert(html.includes(`rel="canonical" href="${canonical}"`), `${article.slug} canonical is missing`);
  assert(html.includes(`content="${article.description.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`), `${article.slug} description is missing`);
  assert(html.includes(`<h1>${article.title}</h1>`), `${article.slug} visible H1 is missing`);
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
  assert(html.includes(`rel="canonical" href="${BASE_URL}/${page.slug}"`), `${page.slug} canonical is missing`);
  assert(html.includes('id="seo-static"'), `${page.slug} static content is missing`);
  assert(html.includes('/auth?mode=register'), `${page.slug} registration CTA is missing`);
  assert(occurrences(html, 'type="application/ld+json"') === 1, `${page.slug} has conflicting structured data blocks`);
}

const blogHtml = await readFile(join(distDir, 'blog', 'index.html'), 'utf8');
assert(blogHtml.includes('<h1>Sağlıklı yaşamı karmaşıklaştırmadan anlayın</h1>'), 'blog index H1 is missing');
assert(blogHtml.includes('"@type":"Blog"'), 'blog index schema is missing');

const editorialHtml = await readFile(join(distDir, 'editorial-policy', 'index.html'), 'utf8');
assert(editorialHtml.includes('<h1>Yayın ilkelerimiz</h1>'), 'editorial policy H1 is missing');
assert(editorialHtml.includes(`${BASE_URL}/editorial-policy`), 'editorial policy canonical is missing');

const sitemap = await readFile(join(rootDir, 'public', 'sitemap.xml'), 'utf8');
for (const [path] of publicPages) {
  assert(sitemap.includes(`<loc>${BASE_URL}${path}</loc>`), `${path} is missing from sitemap.xml`);
}

console.log(`Verified ${blogArticles.length + seoLandingPages.length + 2} static SEO pages and ${publicPages.length} sitemap URLs.`);
