import { writeFile } from 'node:fs/promises';
import { BASE_URL, publicPages } from './seo-routes.mjs';

function xmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const entries = publicPages.map(([path, lastmod]) => `  <url>
    <loc>${xmlEscape(`${BASE_URL}${path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap);
