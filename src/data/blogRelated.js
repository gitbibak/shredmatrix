import { blogArticles } from './blogArticles.js';
import { getArticleLanguage } from './blogLocale.js';

// A guide is relevant only when its own curated links point to this exact page.
export function getLandingBlogArticles(path, language = 'tr') {
  if (/^\/(?:en\/|es\/)?blog(?:\/|$)/.test(path)) return [];
  return blogArticles.filter((article) =>
    getArticleLanguage(article) === language
    && article.internalLinks?.some(([href]) => href === path));
}
