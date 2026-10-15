import { describe, expect, it } from 'vitest';
import {
  AFFILIATE_CATALOG,
  AFFILIATE_COPY,
  AFFILIATE_PAGE_PLACEMENTS,
  AFFILIATE_PLACEMENTS,
  AFFILIATE_SETS,
  getAffiliateProducts,
  isValidAffiliateUrl,
} from './affiliateProducts';
import { turkishSeoPages } from './turkishSeoPages';
import { validateGrowthEvent } from '../lib/analyticsEventSchema';

const LANGS = ['tr', 'en', 'es'];

describe('affiliate catalog', () => {
  it('defines every set product in every language with copy', () => {
    for (const lang of LANGS) {
      for (const ids of Object.values(AFFILIATE_SETS)) {
        for (const id of ids) {
          const product = AFFILIATE_CATALOG[lang][id];
          expect(product, `${lang}/${id}`).toBeTruthy();
          expect(product.label.length).toBeGreaterThan(3);
          expect(product.reason.length).toBeGreaterThan(10);
        }
      }
      const copy = AFFILIATE_COPY[lang];
      for (const key of ['eyebrow', 'title', 'intro', 'appTitle', 'cta', 'disclosure']) expect(copy[key]).toBeTruthy();
    }
  });

  it('only accepts empty or https links', () => {
    for (const lang of LANGS) {
      for (const [id, product] of Object.entries(AFFILIATE_CATALOG[lang])) {
        expect(product.url === '' || isValidAffiliateUrl(product.url), `${lang}/${id}`).toBe(true);
      }
    }
    expect(isValidAffiliateUrl('http://example.com')).toBe(false);
    expect(isValidAffiliateUrl('javascript:alert(1)')).toBe(false);
    expect(isValidAffiliateUrl('')).toBe(false);
  });

  it('never recommends supplements', () => {
    const text = JSON.stringify(AFFILIATE_CATALOG).toLowerCase();
    for (const word of ['protein', 'takviye', 'supplement', 'suplemento', 'creatine', 'kreatin', 'yağ yakıcı', 'fat burner']) {
      expect(text).not.toContain(word);
    }
  });

  it('maps high-intent pages to valid placements and sets', () => {
    for (const [path, placement] of Object.entries(AFFILIATE_PAGE_PLACEMENTS)) {
      expect(AFFILIATE_PLACEMENTS[placement], path).toBeTruthy();
      expect(AFFILIATE_SETS[AFFILIATE_PLACEMENTS[placement].set]).toBeTruthy();
    }
    expect(turkishSeoPages['evde-dambil-antrenman-programi']).toBeTruthy();
    expect(turkishSeoPages['direnc-bandi-antrenman-programi']).toBeTruthy();
  });

  it('returns only products with a usable link', () => {
    const catalog = {
      tr: {
        'adjustable-dumbbell': { label: 'A', reason: 'r', store: 'Hepsiburada', url: 'https://www.hepsiburada.com/x' },
        'dumbbell-pair-light': { label: 'B', reason: 'r', store: '', url: '' },
        'resistance-band-set': { label: 'C', reason: 'r', store: '', url: 'http://insecure.example' },
      },
    };
    expect(getAffiliateProducts('dumbbell', 'tr', catalog).map((p) => p.id)).toEqual(['adjustable-dumbbell']);
    expect(getAffiliateProducts('dumbbell', 'es', catalog)).toEqual([]);
    expect(getAffiliateProducts('unknown', 'tr', catalog)).toEqual([]);
  });

  it('accepts the click event and rejects it without required fields', () => {
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'seo_tr_dumbbell', productId: 'exercise-mat', language: 'tr', store: 'Trendyol' }).valid).toBe(true);
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'seo_tr_dumbbell' }).valid).toBe(false);
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'x', productId: 'y', email: 'a@b.c' }).properties).not.toHaveProperty('email');
  });
});
