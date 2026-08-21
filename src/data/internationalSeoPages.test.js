import { describe, expect, it } from 'vitest';
import { findInternationalSeoPage, getAlternatesForTurkishPath, getInternationalRelatedPages, internationalSeoPages } from './internationalSeoPages';

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

  it('prioritizes intent-related links for high-impression calculator pages', () => {
    const page = findInternationalSeoPage('/es/calculadora-imc');
    expect(getInternationalRelatedPages(page).slice(0, 4).map((item) => item.topic)).toEqual([
      'calories',
      'protein',
      'nutrition',
      'fatLoss',
    ]);
  });

  it('keeps search-focused titles aligned with calculator intent', () => {
    expect(findInternationalSeoPage('/es/calculadora-imc').metaTitle).toContain('Calculadora IMC Gratis');
    expect(findInternationalSeoPage('/en/bmi-calculator').metaTitle).toContain('Imperial & Metric');
    expect(findInternationalSeoPage('/en/personal-workout-plan').metaTitle).toContain('Home or Gym');
    expect(findInternationalSeoPage('/en/protein-calculator').hero).toContain('without an account');
  });
});
