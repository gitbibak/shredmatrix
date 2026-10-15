import { describe, expect, it } from 'vitest';
import {
  AFFILIATE_CATALOG,
  AFFILIATE_COPY,
  AFFILIATE_PAGE_PLACEMENTS,
  AFFILIATE_PLACEMENTS,
  AFFILIATE_SETS,
  AMAZON_ASSOCIATE_TAG,
  AMAZON_DISCLOSURE,
  AMAZON_GLOBAL_PRODUCTS,
  buildAmazonUrl,
  getAffiliateProducts,
  isAmazonUrl,
  isValidAffiliateUrl,
  isValidAmazonTag,
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
    const noAmazon = { tag: '' };
    expect(getAffiliateProducts('dumbbell', 'tr', catalog, noAmazon).map((p) => p.id)).toEqual(['adjustable-dumbbell']);
    expect(getAffiliateProducts('dumbbell', 'es', catalog, noAmazon)).toEqual([]);
    expect(getAffiliateProducts('unknown', 'tr', catalog, noAmazon)).toEqual([]);
  });

  it('defines an Amazon search fallback for every product and a valid or empty tag', () => {
    for (const ids of Object.values(AFFILIATE_SETS)) {
      for (const id of ids) expect(AMAZON_GLOBAL_PRODUCTS[id]?.query, id).toBeTruthy();
    }
    expect(AMAZON_ASSOCIATE_TAG === '' || isValidAmazonTag(AMAZON_ASSOCIATE_TAG)).toBe(true);
    expect(AMAZON_DISCLOSURE).toBe('As an Amazon Associate I earn from qualifying purchases.');
  });

  it('builds direct amazon.com links (search, or product page when an ASIN exists)', () => {
    expect(buildAmazonUrl('exercise-mat', 'fullbalance-20')).toBe('https://www.amazon.com/s?k=non%20slip%20exercise%20mat&tag=fullbalance-20');
    expect(buildAmazonUrl('exercise-mat', 'fullbalance-20', { 'exercise-mat': { asin: 'B01LP0V4JY', query: 'mat' } })).toBe('https://www.amazon.com/dp/B01LP0V4JY?tag=fullbalance-20');
    expect(buildAmazonUrl('exercise-mat', '')).toBe('');
    expect(buildAmazonUrl('exercise-mat', 'bad tag!')).toBe('');
    expect(buildAmazonUrl('unknown', 'fullbalance-20')).toBe('');
    expect(isAmazonUrl(buildAmazonUrl('mini-band', 'fullbalance-20'))).toBe(true);
    expect(isAmazonUrl('https://www.amazon.es/dp/X')).toBe(true);
    expect(isAmazonUrl('https://www.hepsiburada.com/x')).toBe(false);
    expect(isAmazonUrl('https://amazon.evil.com/x')).toBe(false);
  });

  it('uses Amazon globally and lets a local link override it per language', () => {
    const catalog = {
      tr: {
        'resistance-band-set': { label: 'Bant', reason: 'r', store: 'Hepsiburada', url: 'https://www.hepsiburada.com/bant' },
        'tube-band-door-anchor': { label: 'Tüp', reason: 'r', store: '', url: '' },
        'mini-band': { label: 'Mini', reason: 'r', store: '', url: '' },
        'exercise-mat': { label: 'Mat', reason: 'r', store: '', url: '' },
      },
    };
    const products = getAffiliateProducts('band', 'tr', catalog, { tag: 'fullbalance-20' });
    expect(products.map((p) => p.id)).toEqual(['resistance-band-set', 'tube-band-door-anchor', 'mini-band', 'exercise-mat']);
    expect(products[0]).toMatchObject({ store: 'Hepsiburada', url: 'https://www.hepsiburada.com/bant' });
    expect(products[1].store).toBe('Amazon');
    expect(products[1].url).toContain('https://www.amazon.com/s?k=');
    expect(products[1].url).toContain('tag=fullbalance-20');
  });

  it('accepts the click event and rejects it without required fields', () => {
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'seo_tr_dumbbell', productId: 'exercise-mat', language: 'tr', store: 'Trendyol' }).valid).toBe(true);
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'seo_tr_dumbbell' }).valid).toBe(false);
    expect(validateGrowthEvent('affiliate_link_click', { placement: 'x', productId: 'y', email: 'a@b.c' }).properties).not.toHaveProperty('email');
  });
});
