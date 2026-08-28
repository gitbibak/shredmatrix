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

  it('keeps reformer pages machine-specific and localized', () => {
    const english = findInternationalSeoPage('/en/free-reformer-pilates-plan');
    const spanish = findInternationalSeoPage('/es/plan-reformer-pilates-gratis');

    expect(english?.alternates.tr).toBe('/reformer-pilates-programi');
    expect(english?.description).toMatch(/studio or home reformer/i);
    expect(english?.faqs.flat().join(' ')).toMatch(/reformer machine/i);
    expect(spanish?.description).toMatch(/reformer en casa/i);
    expect(spanish?.faqs.flat().join(' ')).toMatch(/m[aá]quina reformer/i);
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
    const spanishBmi = findInternationalSeoPage('/es/calculadora-imc');
    expect(spanishBmi.metaTitle).toContain('Calculadora de IMC Gratis');
    expect(spanishBmi.description).toContain('libras, pies y pulgadas');
    expect(findInternationalSeoPage('/en/bmi-calculator').metaTitle).toContain('Imperial BMI Calculator');
    expect(findInternationalSeoPage('/en/personal-workout-plan').metaTitle).toContain('Home or Gym');
    const spanishWorkout = findInternationalSeoPage('/es/plan-entrenamiento-personalizado');
    expect(spanishWorkout.metaTitle).toContain('Casa con Mancuernas');
    expect(spanishWorkout.description).toContain('tonificación');
    expect(spanishWorkout.faqs.some(([question]) => question.includes('tonificación'))).toBe(true);
    expect(findInternationalSeoPage('/en/protein-calculator').hero).toContain('without an account');
  });

  it('answers the observed home dumbbell search intent in English and Spanish', () => {
    const english = findInternationalSeoPage('/en/home-dumbbell-workout-plan');
    const spanish = findInternationalSeoPage('/es/entrenamiento-en-casa-con-mancuernas');

    expect(english.metaTitle).toContain('Home Dumbbell Workout Plan');
    expect(english.hero).toContain('dumbbells or resistance bands');
    expect(spanish.metaTitle).toContain('Casa con Mancuernas');
    expect(spanish.hero).toContain('mancuernas o bandas');
    expect(spanish.alternates.tr).toBe('/evde-dambil-antrenman-programi');
  });
});
