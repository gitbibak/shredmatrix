import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

let selectedLanguage = 'tr';

vi.mock('../i18n/LanguageContext', () => ({
  useTranslation: () => ({ lang: selectedLanguage, t: (key) => key }),
}));
vi.mock('./CoachFeatureSection', () => ({ default: () => null }));
vi.mock('./ApprovedTestimonials', () => ({ default: () => null }));
vi.mock('./OptimizedImage', () => ({ default: () => null }));

vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

function renderLanding(language) {
  selectedLanguage = language;
  render(<MemoryRouter><LandingPage onStart={() => {}} /></MemoryRouter>);
}

describe('homepage guide links', () => {
  it.each([
    ['en', 'Understand why each habit matters', '/en/blog', [
      '/en/blog/how-accurate-photo-calorie-counter',
      '/en/blog/estimate-mixed-meal-rice-chicken-sauce',
      '/en/blog/home-workout-progress-without-new-equipment',
    ]],
    ['es', 'Comprende por qué importa cada hábito', '/es/blog', [
      '/es/blog/precision-calorias-foto-porciones-aceite',
    ]],
  ])('keeps %s visitors in their language for every guide link', (language, heading, indexPath, articlePaths) => {
    renderLanding(language);

    const guideSection = screen.getByRole('heading', { name: heading }).closest('section');
    const guideLinks = within(guideSection).getAllByRole('link');
    expect(guideLinks.map((link) => new URL(link.href).pathname)).toEqual([indexPath, ...articlePaths]);
    expect(guideLinks.some((link) => new URL(link.href).pathname.startsWith('/blog/'))).toBe(false);

    const longevityNote = screen.getByText(language === 'en'
      ? /It does not predict biological age or lifespan/
      : /No predice edad biológica ni longevidad/);
    const relatedLink = longevityNote.closest('p').querySelector('a');
    expect(new URL(relatedLink.href).pathname).toBe(indexPath);
    expect(relatedLink).toHaveTextContent(language === 'en' ? 'All guides' : 'Todas las guías');
  });

  it('keeps the Turkish longevity note linked to its article', () => {
    renderLanding('tr');
    const longevityNote = screen.getByText(/Biyolojik yaş veya yaşam süresi tahmini yapmaz/);
    expect(new URL(longevityNote.closest('p').querySelector('a').href).pathname)
      .toBe('/blog/longevity-nedir-saglikli-yasam-aliskanliklari');
  });
});
