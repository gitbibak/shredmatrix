import { getBlogArticle } from './blogArticles';
import { getArticleLanguage } from './blogLocale';
import { setArticleCtaCheck } from '../lib/analyticsEventSchema';

// An article CTA click is recorded only for a published article, in its own
// language, pointing at that article's curated destination. The check lives with
// the blog data so the article bodies are not part of every page's first download;
// the blog article screen registers it by importing this module.
export function isKnownArticleCta({ articleSlug, language, destination }) {
  const article = getBlogArticle(articleSlug);
  if (!article) return false;
  const articleLanguage = getArticleLanguage(article);
  const expected = article.cta?.href || `/auth?mode=register${articleLanguage === 'tr' ? '' : `&lang=${articleLanguage}`}`;
  return article.publishedAt <= new Date().toISOString().slice(0, 10)
    && language === articleLanguage
    && destination === expected;
}

setArticleCtaCheck(isKnownArticleCta);
