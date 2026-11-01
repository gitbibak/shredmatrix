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
    window.history.replaceState({}, '', '/');
    vi.unstubAllEnvs();
  });

  it('does not send events before analytics consent', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackEvent('workout_completed', { module: 'muscle' });

    expect(window.dataLayer).toHaveLength(1);
    expect(document.head.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it('does not load GA or send events when a saved consent choice is denied', async () => {
    localStorage.setItem('fullbalance_analytics_consent', 'denied');
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackPageView('Full Balance', '/en');

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer[0][2].analytics_storage).toBe('denied');
    expect(document.head.querySelector('script[data-fullbalance-ga]')).toBeNull();
  });

  it('restores saved analytics consent before GA configuration without adding a page view', async () => {
    localStorage.setItem('fullbalance_analytics_consent', 'granted');
    const analytics = await loadAnalytics();
    analytics.initAnalytics();

    const commands = window.dataLayer.map((entry) => Array.from(entry));
    const updateIndex = commands.findIndex(([command, action]) => command === 'consent' && action === 'update');
    const configIndex = commands.findIndex(([command]) => command === 'config');
    expect(updateIndex).toBeGreaterThan(0);
    expect(configIndex).toBeGreaterThan(updateIndex);
    expect(commands[updateIndex][2]).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    expect(commands[configIndex][2].send_page_view).toBe(false);
    expect(commands.filter(([command, event]) => command === 'event' && event === 'page_view')).toHaveLength(0);
    expect(document.head.querySelectorAll('script[data-fullbalance-ga="G-TEST123"]')).toHaveLength(1);

    analytics.trackPageView('Full Balance', '/en');
    expect(window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view')).toHaveLength(1);
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
    expect(event[2]).toEqual({ module: 'yoga', page_location: window.location.origin + '/' });
    expect(document.head.querySelector('script[data-fullbalance-ga="G-TEST123"]')).not.toBeNull();
  });

  it('rejects incomplete structured growth events without throwing', async () => {
    const analytics = await loadAnalytics();
    expect(() => analytics.trackEvent('challenge_joined', { source: 'dashboard' })).not.toThrow();

    const summary = analytics.getAnalyticsSummary(1);
    const today = new Date().toISOString().split('T')[0];
    expect(summary[today]?.challenge_joined).toBeUndefined();
  });

  it('allows only coarse guided session exit and save failure values', async () => {
    const analytics = await loadAnalytics();
    analytics.trackEvent('workout_session_abandoned', {
      progressBucket: '25_49', exitMethod: 'escape', exerciseName: 'Private Row', reps: 12,
    });
    analytics.trackEvent('workout_session_save_failed', {
      progressBucket: 'all_sets', reason: 'save', error: 'private database detail',
    });
    analytics.trackEvent('workout_session_abandoned', { progressBucket: 'Private Row', exitMethod: 'button' });
    analytics.trackEvent('workout_session_save_failed', { progressBucket: 'none', reason: 'private database detail' });

    const events = JSON.parse(localStorage.getItem('fb_growth_event_queue') || '[]')
      .filter((event) => event.event_name.startsWith('workout_session_'));
    expect(events.map(({ event_name, properties }) => [event_name, properties])).toEqual([
      ['workout_session_abandoned', { progressBucket: '25_49', exitMethod: 'escape' }],
      ['workout_session_save_failed', { progressBucket: 'all_sets', reason: 'save' }],
    ]);
  });

  it('accepts only published article CTA identities and their curated destinations', async () => {
    const analytics = await loadAnalytics();
    const valid = { articleSlug: 'how-accurate-photo-calorie-counter', language: 'en', destination: '/en/photo-calorie-counter' };
    analytics.trackEvent('article_cta_click', { ...valid, email: 'private@example.com' });
    analytics.trackEvent('article_cta_click', { ...valid, destination: '/auth?email=private@example.com' });
    analytics.trackEvent('article_cta_click', { ...valid, language: 'tr' });
    analytics.trackEvent('article_cta_click', { ...valid, articleSlug: 'not-published' });

    const events = JSON.parse(localStorage.getItem('fb_growth_event_queue') || '[]')
      .filter((event) => event.event_name === 'article_cta_click');
    expect(events).toHaveLength(1);
    expect(events[0].properties).toEqual(valid);
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

  it('keeps internal interaction sources out of GA traffic-source parameters while retaining first-party data', async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    analytics.trackEvent('workout_started', { module: 'muscle', source: 'today_focus' });

    const googleEvent = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'workout_started');
    expect(googleEvent[2]).toMatchObject({ module: 'muscle', interaction_source: 'today_focus' });
    expect(googleEvent[2]).not.toHaveProperty('source');
    expect(googleEvent[2]).not.toHaveProperty('campaign_source');
    const queuedEvent = JSON.parse(localStorage.getItem('fb_growth_event_queue'))
      .find((event) => event.event_name === 'workout_started');
    expect(queuedEvent.properties).toEqual({ module: 'muscle', source: 'today_focus' });
  });

  it('passes sanitized campaign fields on the first GA event and page view without forwarding arbitrary query data', async () => {
    window.history.replaceState({}, '', '/en?utm_source=pinterest&utm_medium=organic_social&utm_campaign=free_plan&utm_content=pin_1&utm_term=home+workout&utm_id=fall26&email=private%40example.com&access_token=secret#private');
    localStorage.setItem('fullbalance_analytics_consent', 'granted');
    const analytics = await loadAnalytics();
    analytics.initAnalytics('en');
    analytics.trackPageView('Home', '/en');

    const campaign = {
      campaign_source: 'pinterest', campaign_medium: 'organic_social', campaign_name: 'free_plan',
      campaign_content: 'pin_1', campaign_term: 'home workout', campaign_id: 'fall26',
      page_location: window.location.origin + '/en',
    };
    const events = window.dataLayer.filter((entry) => entry[0] === 'event');
    expect(events[0][1]).toBe('visitor_started');
    expect(events[0][2]).toMatchObject(campaign);
    expect(events[0][2]).not.toHaveProperty('source');
    expect(events.at(-1)[2]).toMatchObject(campaign);
    const config = window.dataLayer.find((entry) => entry[0] === 'config')[2];
    expect(config.page_location).toBe(window.location.origin + '/en');
    expect(JSON.stringify(window.dataLayer)).not.toMatch(/private|secret|access_token|utm_/);
  });

  it('retains a tagged landing until consent after navigation without replaying it on subsequent pages', async () => {
    window.history.replaceState({}, '', '/en?utm_source=newsletter&utm_medium=email&utm_campaign=welcome');
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    expect(window.dataLayer.filter((entry) => entry[0] === 'event')).toHaveLength(0);
    window.history.replaceState({}, '', '/auth?mode=register&email=private%40example.com');
    analytics.setAnalyticsConsent('granted');
    const firstPageView = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'page_view');
    expect(firstPageView[2]).toMatchObject({ campaign_source: 'newsletter', campaign_medium: 'email', campaign_name: 'welcome' });

    analytics.trackPageView('Register', '/auth');
    const laterPageView = window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view').at(-1);
    expect(laterPageView[2]).not.toHaveProperty('campaign_source');
    expect(JSON.stringify(window.dataLayer)).not.toContain('private');
  });

  it('rejects malformed UTM labels and does not invent a missing campaign medium', async () => {
    const search = new URLSearchParams({
      utm_source: 'pinterest', utm_campaign: 'private@example.com', utm_content: 'https://private.example',
      utm_term: 'bad\nlabel', utm_id: 'x'.repeat(101),
    });
    window.history.replaceState({}, '', `/en?${search}`);
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    const pageView = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'page_view');
    expect(pageView[2].campaign_source).toBe('pinterest');
    for (const field of ['campaign_medium', 'campaign_name', 'campaign_content', 'campaign_term', 'campaign_id']) {
      expect(pageView[2]).not.toHaveProperty(field);
    }
  });

  it('does not reuse stored conversion attribution for a new untagged GA visit', async () => {
    localStorage.setItem('fb_acquisition', JSON.stringify({ acquisition_source: 'pinterest', acquisition_medium: 'social', acquisition_content: 'seo_hero' }));
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.setAnalyticsConsent('granted');
    const pageView = window.dataLayer.find((entry) => entry[0] === 'event' && entry[1] === 'page_view');
    expect(pageView[2]).not.toHaveProperty('campaign_source');
    expect(pageView[2]).not.toHaveProperty('campaign_content');
  });

  it('does not bypass UTM validation through visitor or signup attribution aliases', async () => {
    window.history.replaceState({}, '', '/en?utm_source=private%40example.com&utm_campaign=private%40example.com');
    localStorage.setItem('fullbalance_analytics_consent', 'granted');
    const analytics = await loadAnalytics();
    analytics.initAnalytics();
    analytics.trackSignUp('email');

    expect(JSON.stringify(window.dataLayer)).not.toContain('private');
    const events = window.dataLayer.filter((entry) => entry[0] === 'event');
    for (const [, , properties] of events) {
      expect(properties).not.toHaveProperty('acquisitionSource');
      expect(properties).not.toHaveProperty('campaign');
      expect(properties).not.toHaveProperty('source');
      expect(properties).not.toHaveProperty('interaction_source');
    }
    const signup = JSON.parse(localStorage.getItem('fb_growth_event_queue'))
      .find((event) => event.event_name === 'signup_completed');
    expect(signup.properties).toMatchObject({ acquisitionSource: 'private@example.com', campaign: 'private@example.com' });
  });
});
