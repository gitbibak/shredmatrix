import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadAnalytics() {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');
  vi.resetModules();
  return import('./analytics');
}

describe('privacy-safe analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.querySelectorAll('script[data-fullbalance-ga]').forEach((script) => script.remove());
    delete window.gtag;
    delete window.dataLayer;
    vi.unstubAllEnvs();
  });

  it('does not send events before analytics consent', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackEvent('complete_workout', { module: 'muscle' });

    expect(window.dataLayer).toHaveLength(1);
    expect(document.head.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it('loads GA after consent and removes sensitive event parameters', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    analytics.trackEvent('wellbeing_checkin_saved', {
      module: 'yoga',
      weight: 75,
      health_condition: 'private',
      user_id: 'private-id',
    });

    const event = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'wellbeing_checkin_saved');
    expect(event[2]).toEqual({ module: 'yoga' });
    expect(document.head.querySelector('script[data-fullbalance-ga="G-TEST123"]')).not.toBeNull();
  });

  it('removes query strings and hashes from SPA page views', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    analytics.trackPageView('Rehber', '/blog/test?email=private#section');

    const pageViews = window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view');
    expect(pageViews.at(-1)[2]).toMatchObject({
      page_title: 'Rehber',
      page_path: '/blog/test',
    });
    expect(pageViews.at(-1)[2].page_location).not.toContain('private');
  });
});
