import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  invoke: vi.fn(),
  ready: vi.fn(() => true),
}));

function profileQuery(result) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return query;
}

vi.mock('./supabase', () => ({
  supabase: {
    auth: { getUser: mocks.getUser },
    from: mocks.from,
    functions: { invoke: mocks.invoke },
  },
  isSupabaseReady: mocks.ready,
}));

import {
  getAdminStats, getUserPlanDetails, updateContentReview, deleteUser, getActivityStats, getPlanDistribution, getRecentUsers, getRegistrationTrend,
  getSupportStats, getWorkoutTrend, isAdmin, verifyAdminAccess,
} from './adminService';

describe('adminService security boundaries', () => {
  beforeEach(() => {
    mocks.getUser.mockReset();
    mocks.from.mockReset();
    mocks.invoke.mockReset();
  });

  it('uses database role claims instead of a hard-coded email list', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
    expect(isAdmin({ app_metadata: { role: 'admin' } })).toBe(true);
    expect(isAdmin({ email: 'admin@example.com' })).toBe(false);
  });

  it('verifies admin access from the signed-in user profile', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null });
    mocks.from.mockReturnValue(profileQuery({ data: { role: 'admin' }, error: null }));

    await expect(verifyAdminAccess()).resolves.toBe(true);
    expect(mocks.from).toHaveBeenCalledWith('profiles');
  });

  it('denies access when session verification fails', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('denied') });

    await expect(verifyAdminAccess()).resolves.toBe(false);
  });

  it('deletes users only through the protected Edge Function', async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: true }, error: null });

    await expect(deleteUser('11111111-1111-4111-8111-111111111111')).resolves.toEqual({ ok: true });
    expect(mocks.invoke).toHaveBeenCalledWith('admin-delete-user', {
      body: { userId: '11111111-1111-4111-8111-111111111111' },
    });
  });

  it('surfaces server-side deletion failures', async () => {
    mocks.invoke.mockResolvedValue({ data: { ok: false, error: 'Forbidden' }, error: null });

    await expect(deleteUser('11111111-1111-4111-8111-111111111111')).rejects.toThrow('Forbidden');
  });
});

function dataQuery(result) {
  const query = {};
  for (const method of ['select', 'eq', 'gte', 'order', 'limit', 'range', 'neq', 'maybeSingle']) query[method] = vi.fn(() => query);
  query.then = (resolve, reject) => Promise.resolve({ count: result.data?.length ?? 0, ...result }).then(resolve, reject);
  return query;
}

describe('admin dashboard data reliability', () => {
  const strictReaders = [getPlanDistribution, getRegistrationTrend, getRecentUsers, getWorkoutTrend, getSupportStats];

  beforeEach(() => {
    mocks.ready.mockReturnValue(true);
    mocks.from.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    mocks.ready.mockReturnValue(true);
  });

  it.each(strictReaders)('%s distinguishes a failed request from empty data in strict mode', async (reader) => {
    const failure = new Error('Connection unavailable');
    mocks.from.mockImplementation(() => dataQuery({ data: null, error: failure }));
    await expect(reader({ strict: true })).rejects.toBe(failure);
    await expect(reader()).resolves.toBeDefined();

    mocks.from.mockImplementation(() => dataQuery({ data: [], count: 0, error: null }));
    await expect(reader({ strict: true })).resolves.toBeDefined();
  });

  it.each(strictReaders)('%s surfaces an unavailable connection only when strict mode is requested', async (reader) => {
    mocks.ready.mockReturnValue(false);
    await expect(reader({ strict: true })).rejects.toThrow('Supabase bağlantısı hazır değil.');
    await expect(reader()).resolves.toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('excludes administrator profiles and plans without treating unknown ages as teenagers', async () => {
    const createdAt = new Date().toISOString();
    mocks.from.mockImplementation((table) => dataQuery({
      error: null,
      data: table === 'profiles' ? [
        { id: 'admin', role: 'admin', app_language: 'en', created_at: createdAt },
        { id: 'member', role: 'user', app_language: 'es', created_at: createdAt },
      ] : [
        { id: 'plan-admin', user_id: 'admin', plan_data: { goal: 'yoga', userAge: 18 } },
        { id: 'plan-member', user_id: 'member', plan_data: { goal: 'pilates', userAge: '25' } },
        ...[undefined, '', 'unknown', '20 years', 0, -1, 15, 121].map((userAge, index) => ({
          id: `plan-${index}`, user_id: `unknown-age-${index}`, plan_data: { goal: 'pilates', userAge },
        })),
      ],
    }));
    const result = await getPlanDistribution({ strict: true });
    expect(result.ages).toEqual([{ name: '21-25', value: 1 }]);
    expect(result.goals).toEqual([{ name: 'Pilates', value: 9 }]);
    expect(result.languages).toEqual([{ name: 'Español', value: 1 }]);
    expect(result.international).toMatchObject({ registrations: 1, activated: 1, english: 0, spanish: 1 });
  });

  it('counts today workouts using the Istanbul date across the UTC midnight boundary', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T22:30:00.000Z'));
    const queries = [];
    mocks.from.mockImplementation(() => {
      const query = dataQuery({ data: [], count: 0, error: null });
      queries.push(query);
      return query;
    });
    await getActivityStats();
    expect(queries[1].gte).toHaveBeenCalledWith('date', '2026-10-15');
  });
});

describe('complete admin reads', () => {
  beforeEach(() => { mocks.ready.mockReturnValue(true); mocks.from.mockReset(); });
  afterEach(() => vi.restoreAllMocks());
  it('reads beyond the API row cap and counts every member once', async () => {
    const profiles = Array.from({ length: 1201 }, (_, i) => ({ id: String(i).padStart(5, '0'), role: 'user', created_at: '2026-10-10T10:00:00Z' }));
    const ranges = [];
    mocks.from.mockImplementation((table) => {
      const rows = table === 'profiles' ? profiles : [];
      const q = dataQuery({ data: [], count: 0, error: null });
      q.neq = () => q;
      q.range = (start, end) => { ranges.push([start, end]); return Promise.resolve({ data: rows.slice(start, end + 1), count: rows.length, error: null }); };
      return q;
    });
    expect((await getAdminStats()).totalUsers).toBe(1201);
    expect(ranges).toContainEqual([1000, 1499]);
  });
  it('does not publish partial totals when a page fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.from.mockImplementation(() => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = () => Promise.resolve({ error: new Error('offline') });
      return q;
    });
    expect(await getAdminStats()).toBeNull();
  });
  it('distinguishes a missing plan from a failed detail request', async () => {
    mocks.from.mockImplementation(() => dataQuery({ data: null, error: null }));
    expect(await getUserPlanDetails('member', { strict: true })).toBeNull();
    mocks.from.mockImplementation(() => dataQuery({ data: null, error: new Error('offline') }));
    await expect(getUserPlanDetails('member', { strict: true })).rejects.toThrow('offline');
  });
  it.each(['https://', 'https://?', 'javascript:alert(1)', 'https://user:pass@example.com'])('rejects malformed or credential-bearing review proof %s', async (evidence_url) => {
    await expect(updateContentReview('review', { review_status: 'approved', reviewer_name: 'Reviewer', reviewer_credential: 'Credential', evidence_url })).rejects.toThrow('HTTPS');
  });
});
