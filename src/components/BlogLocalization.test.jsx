import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogArticle from './BlogArticle';
import BlogIndex from './BlogIndex';
import { LanguageProvider } from '../i18n/LanguageContext';

afterEach(() => {
  cleanup();
  document.head.querySelectorAll('link[rel="alternate"], link[rel="canonical"], script[type="application/ld+json"]').forEach((node) => node.remove());
});

function open(path) {
  return render(<LanguageProvider><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/en/blog" element={<BlogIndex />} />
    <Route path="/es/blog" element={<BlogIndex />} />
    <Route path="/blog" element={<BlogIndex />} />
    <Route path="/en/blog/:slug" element={<BlogArticle />} />
    <Route path="/es/blog/:slug" element={<BlogArticle />} />
    <Route path="/blog/:slug" element={<BlogArticle />} />
  </Routes></MemoryRouter></LanguageProvider>);
}

describe('localized blog navigation', () => {
  it('keeps the English catalogue in English and links its own article paths', () => {
    open('/en/blog');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('healthy living');
    expect(screen.queryByText('Longevity Nedir? Sağlıklı Yaşamı Destekleyen 5 Temel Alışkanlık')).toBeNull();
    expect(screen.getByRole('link', { name: /How Accurate Is a Photo/ }).getAttribute('href')).toBe('/en/blog/how-accurate-photo-calorie-counter');
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://fullbalance.app/en/blog');
  });

  it('connects Spanish readers to the free tool and actual English translation', () => {
    document.head.insertAdjacentHTML('beforeend', '<link rel="alternate" hreflang="tr" href="https://fullbalance.app/blog"><script type="application/ld+json" data-static-seo="true">{"@type":"Blog","url":"https://fullbalance.app/blog"}</script>');
    open('/es/blog/precision-calorias-foto-porciones-aceite');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Precisión');
    expect(screen.getByRole('link', { name: 'Probar la herramienta gratis' }).getAttribute('href')).toBe('/es/contar-calorias-con-foto');
    expect(document.querySelector('link[hreflang="en"]').href).toBe('https://fullbalance.app/en/blog/how-accurate-photo-calorie-counter');
    expect(document.querySelector('link[hreflang="x-default"]').href).toBe('https://fullbalance.app/en/blog/how-accurate-photo-calorie-counter');
    expect(document.querySelector('link[hreflang="tr"]')).toBeNull();
    expect(document.querySelector('script[data-static-seo]')).toBeNull();
    expect(document.querySelector('meta[property="og:locale"]').content).toBe('es_ES');
    expect(JSON.parse(document.querySelector('script[data-article-schema]').textContent)['@graph'][0].inLanguage).toBe('es-ES');
  });

  it('keeps registration intent and language when entering from the English index', () => {
    localStorage.setItem('shredmatrix_lang', 'tr');
    open('/en/blog');
    expect(screen.getByRole('link', { name: 'Get started free' }).getAttribute('href')).toBe('/auth?mode=register&lang=en');
    expect(localStorage.getItem('shredmatrix_lang')).toBe('en');
    expect(document.querySelector('meta[property="og:locale"]').content).toBe('en_US');
  });

  it('does not render an English article under a Turkish URL', async () => {
    open('/blog/how-accurate-photo-calorie-counter');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Sağlıklı yaşamı'));
    expect(screen.queryByRole('heading', { name: /How Accurate Is a Photo/ })).toBeNull();
  });

  it('records a curated article CTA as assisted intent without replacing first acquisition', () => {
    localStorage.clear();
    localStorage.setItem('fb_acquisition', JSON.stringify({
      first_source: 'google', first_landing_page: '/en', acquisition_content: 'campaign_hero',
    }));
    open('/en/blog/how-accurate-photo-calorie-counter');
    fireEvent.click(screen.getByRole('link', { name: 'Try the free photo tool' }));

    const acquisition = JSON.parse(localStorage.getItem('fb_acquisition'));
    expect(acquisition).toMatchObject({ first_source: 'google', first_landing_page: '/en', acquisition_content: 'campaign_hero' });
    const events = JSON.parse(localStorage.getItem('fb_growth_event_queue') || '[]');
    expect(events.at(-1)).toMatchObject({
      event_name: 'article_cta_click',
      properties: {
        articleSlug: 'how-accurate-photo-calorie-counter', language: 'en', destination: '/en/photo-calorie-counter',
      },
    });
    expect(document.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it('sets first internal content to a published article CTA when it is empty', () => {
    localStorage.clear();
    open('/es/blog/precision-calorias-foto-porciones-aceite');
    fireEvent.click(screen.getByRole('link', { name: 'Probar la herramienta gratis' }));
    expect(JSON.parse(localStorage.getItem('fb_acquisition')).acquisition_content)
      .toBe('blog_es_precision-calorias-foto-porciones-aceite_cta');
  });
});
