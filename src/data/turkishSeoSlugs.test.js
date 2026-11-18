import { describe, expect, it } from 'vitest';
import { turkishSeoPages } from './turkishSeoPages';
import { TURKISH_SEO_SLUGS } from './turkishSeoSlugs';

describe('Turkish SEO route list', () => {
  it('lists exactly the pages that have content', () => {
    expect([...TURKISH_SEO_SLUGS].sort()).toEqual(Object.keys(turkishSeoPages).sort());
  });
});
