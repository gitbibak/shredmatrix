import { describe, expect, it } from 'vitest';
import { getAlternatesForTurkishPath, internationalSeoPages } from './internationalSeoPages';

describe('international SEO pages', () => {
  it('provides one English and Spanish page for every international topic', () => {
    const topics = new Set(internationalSeoPages.map((page) => page.topic));
    for (const topic of topics) {
      const pages = internationalSeoPages.filter((page) => page.topic === topic);
      expect(pages.map((page) => page.lang).sort()).toEqual(['en', 'es']);
    }
  });

  it('uses unique localized paths and complete reciprocal alternates', () => {
    const paths = internationalSeoPages.map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const page of internationalSeoPages) {
      expect(page.path.startsWith(`/${page.lang}`)).toBe(true);
      expect(page.alternates).toMatchObject({ tr: expect.any(String), en: expect.any(String), es: expect.any(String) });
    }
  });

  it('finds localized counterparts from a Turkish path', () => {
    expect(getAlternatesForTurkishPath('/kalori-makro-takibi')).toEqual({
      tr: '/kalori-makro-takibi',
      en: '/en/calorie-macro-calculator',
      es: '/es/calculadora-calorias-macros',
    });
  });
});
