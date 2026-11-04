import { describe, expect, it } from 'vitest';
import { STORE_PRICES_CHECKED_AT, storePrices } from './storePrices';

describe('store price comparison', () => {
  it('lists the same apps with App Store sources and a dated note in every language', () => {
    expect(STORE_PRICES_CHECKED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const apps = storePrices.tr.rows.map(([app]) => app);
    for (const lang of ['tr', 'en', 'es']) {
      const c = storePrices[lang];
      expect(c.rows.map(([app]) => app)).toEqual(apps);
      expect(c.rows.every(([, , price, , source]) => price && source.startsWith('https://apps.apple.com/'))).toBe(true);
      expect(c.note).toMatch(/2026/);
      expect(c.head).toHaveLength(4);
    }
  });
});
