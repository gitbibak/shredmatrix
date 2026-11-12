import { describe, expect, it } from 'vitest';
import { alternativePages } from './alternativePages';
import { storePrices } from './storePrices';

describe('free alternative pages', () => {
  it('has every topic in all three languages with reciprocal paths', () => {
    expect(alternativePages).toHaveLength(9);
    for (const page of alternativePages) {
      expect(page.alternates[page.lang]).toBe(page.path);
      expect(alternativePages.filter((other) => other.topic === page.topic)).toHaveLength(3);
    }
  });

  it('uses only the sourced App Store price for the other app', () => {
    for (const page of alternativePages) {
      const row = storePrices[page.lang].rows.find((item) => item[0] === page.app);
      expect(page.appPrice).toBe(row[2]);
      expect(page.appStoreUrl).toMatch(/^https:\/\/apps\.apple\.com\//);
    }
  });

  it('is honest about where the other app is better and keeps answers complete', () => {
    for (const page of alternativePages) {
      expect(page.better.length).toBeGreaterThan(0);
      expect(page.faqs.length).toBeGreaterThanOrEqual(3);
      expect(page.description.length).toBeLessThanOrEqual(170);
      expect(page.title.length).toBeLessThanOrEqual(75);
    }
  });
});
