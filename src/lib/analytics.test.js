import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadAnalytics() {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');
  vi.resetModules();
  return import('./analytics');
}

describe('privacy-safe analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.head.querySelectorAll('script[data-fullbalance-ga]').forEach((script) => script.remove());
    delete window.gtag;
    delete window.dataLayer;
    vi.unstubAllEnvs();
  });

  it('does not send events before analytics consent', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackEvent('workout_completed', { module: 'muscle' });

    expect(window.dataLayer).toHaveLength(1);
    expect(document.head.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it('records the registration funnel locally without sensitive values', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackLandingCta('hero');
    analytics.trackAuthView();
    analytics.trackSignUpStart('email');
    analytics.trackSignUp('email');
    analytics.trackGeneratePlan();
    analytics.trackPlanCreated({ language: 'en', goal: 'muscle', environment: 'home' });

    const summary = analytics.getAnalyticsSummary(1);
    const today = new Date().toISOString().split('T')[0];
    expect(summary[today]).toMatchObject({
      visitor_started: 1,
      landing_cta_click: 1,
      auth_view: 1,
      signup_started: 1,
      signup_completed: 1,
      plan_generation_started: 1,
      plan_generated: 1,
    });
  });

  it('loads GA after consent and removes sensitive event parameters', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    analytics.trackEvent('workout_completed', {
      module: 'yoga',
      weight: 75,
      health_condition: 'private',
      user_id: 'private-id',
    });

    const event = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'workout_completed');
    expect(event[2]).toEqual({ module: 'yoga' });
    expect(document.head.querySelector('script[data-fullbalance-ga="G-TEST123"]')).not.toBeNull();
  });

  it('rejects incomplete structured growth events without throwing', async () => {
    const analytics = await loadAnalytics();
    expect(() => analytics.trackEvent('challenge_joined', { source: 'dashboard' })).not.toThrow();

    const summary = analytics.getAnalyticsSummary(1);
    const today = new Date().toISOString().split('T')[0];
    expect(summary[today]?.challenge_joined).toBeUndefined();
  });

  it('completes a pending OAuth signup after the redirect returns', async () => {
    const analytics = await loadAnalytics();
    analytics.trackSignUpStart('google');
    analytics.trackPendingAuthCompletion();

    const summary = analytics.getAnalyticsSummary(1);
    const today = new Date().toISOString().split('T')[0];
    expect(summary[today]).toMatchObject({ signup_started: 1, signup_completed: 1 });
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
