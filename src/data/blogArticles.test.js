import { describe, expect, it } from 'vitest';
import { blogArticles, getBlogArticle } from './blogArticles';

describe('blog article catalogue', () => {
  it('keeps unique, indexable article slugs', () => {
    const slugs = blogArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug))).toBe(true);
  });

  it('provides substantial content and official sources for each article', () => {
    blogArticles.forEach((article) => {
      expect(article.title.length).toBeGreaterThan(30);
      expect(article.description.length).toBeGreaterThan(80);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.sources.length).toBeGreaterThanOrEqual(2);
      expect(article.sources.every(([, url]) => url.startsWith('https://'))).toBe(true);
      expect(article.imageAlt.length).toBeGreaterThan(30);
      expect(article.updatedAt >= article.publishedAt).toBe(true);
    });
  });

  it('connects the nutrition guide to relevant Full Balance pages', () => {
    const article = getBlogArticle('antrenman-oncesi-sonrasi-ne-yenir');
    expect(article?.internalLinks).toEqual(expect.arrayContaining([
      ['/protein-ihtiyaci-hesaplama', 'Protein ihtiyacı hesaplama'],
      ['/kas-gelisimi-programi', 'Kas gelişimi programı'],
      ['/yag-yakimi-programi', 'Yağ yakımı programı'],
    ]));
  });

  it('finds an article by slug', () => {
    expect(getBlogArticle('uyku-toparlanma-ve-longevity')?.category).toBe('Toparlanma');
    expect(getBlogArticle('missing')).toBeUndefined();
  });
});
