import { beforeEach, describe, expect, it, vi } from 'vitest';

function createSupabaseMock(insertError = null) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const profileQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({
      data: {
        first_source: null,
        first_medium: null,
        first_campaign: null,
        first_referral_code: null,
        first_creator_code: null,
        first_landing_page: null,
      },
      error: null,
    }),
    update: vi.fn(),
  };
  profileQuery.select.mockReturnValue(profileQuery);
  profileQuery.eq.mockReturnValue(profileQuery);
  profileQuery.update.mockReturnValue(profileQuery);
  const client = {
    from: vi.fn((table) => (table === 'growth_events' ? { insert } : profileQuery)),
  };
  return { client, insert };
}

async function loadWithSupabase(client) {
  vi.resetModules();
  vi.doMock('./supabase', () => ({ supabase: client }));
  return import('./analytics');
}

describe('growth analytics transport isolation', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('links queued anonymous attribution after authentication', async () => {
    const { client, insert } = createSupabaseMock();
    const analytics = await loadWithSupabase(client);
    analytics.trackEvent('visitor_started', { source: 'google', language: 'en' });
    const anonymousId = analytics.getAnonymousId();
    analytics.identifyUser('11111111-1111-4111-8111-111111111111', 'en');

    expect(await analytics.flushAnalyticsQueue()).toBe(true);
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: '11111111-1111-4111-8111-111111111111',
        anonymous_id: anonymousId,
        event_name: 'visitor_started',
      }),
    ]);
  });

  it('keeps the product flow alive and retains the queue when persistence fails', async () => {
    const { client } = createSupabaseMock({ message: 'offline' });
    const analytics = await loadWithSupabase(client);
    let productActionCompleted = false;

    expect(() => {
      analytics.trackEvent('workout_completed', { module: 'pilates' });
      productActionCompleted = true;
    }).not.toThrow();
    analytics.identifyUser('22222222-2222-4222-8222-222222222222', 'tr');

    expect(await analytics.flushAnalyticsQueue()).toBe(false);
    expect(productActionCompleted).toBe(true);
    expect(JSON.parse(localStorage.getItem('fb_growth_event_queue'))).toHaveLength(1);
  });
});

