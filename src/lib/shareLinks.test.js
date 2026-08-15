import { describe, expect, it } from 'vitest';
import { buildTrackedShareUrl } from './shareLinks';

describe('tracked share links', () => {
  it('builds a localized member referral URL', () => {
    const url = new URL(buildTrackedShareUrl({
      language: 'es',
      source: 'member_referral',
      medium: 'referral',
      campaign: 'invite_es',
      referralCode: 'fb12ab',
    }));

    expect(url.pathname).toBe('/es');
    expect(url.searchParams.get('utm_source')).toBe('member_referral');
    expect(url.searchParams.get('utm_medium')).toBe('referral');
    expect(url.searchParams.get('utm_campaign')).toBe('invite_es');
    expect(url.searchParams.get('ref')).toBe('FB12AB');
  });

  it('rejects an invalid referral code and defaults unsupported languages to English', () => {
    const url = new URL(buildTrackedShareUrl({ language: 'de', referralCode: 'bad code' }));

    expect(url.pathname).toBe('/en');
    expect(url.searchParams.has('ref')).toBe(false);
  });
});
