import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
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
    rpc: mocks.rpc,
    functions: { invoke: mocks.invoke },
  },
  isSupabaseReady: mocks.ready,
}));

import {
  ADMIN_EVENT_NAMES, deleteUser, getAdminSnapshot, getSupportStats, isAdmin, updateContentReview, verifyAdminAccess,
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
  for (const method of ['select', 'eq', 'gte', 'order', 'limit', 'range', 'neq', 'in', 'maybeSingle']) query[method] = vi.fn(() => query);
  query.then = (resolve, reject) => Promise.resolve({ count: result.data?.length ?? 0, ...result }).then(resolve, reject);
  return query;
}

describe('admin snapshot reads', () => {
  const rpcCalls = [];
  const rpcRows = {};
  beforeEach(() => {
    mocks.ready.mockReturnValue(true);
    mocks.from.mockReset();
    rpcCalls.length = 0;
    Object.keys(rpcRows).forEach((key) => delete rpcRows[key]);
    mocks.rpc.mockReset();
    mocks.rpc.mockImplementation((fn, args) => {
      rpcCalls.push([fn, args]);
      const rows = rpcRows[fn] || [];
      const q = { order: vi.fn(() => q), range: (start, end) => Promise.resolve({ data: rows.slice(start, end + 1), count: rows.length, error: null }) };
      return q;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('reads beyond the API row cap and returns every member once', async () => {
    const profiles = Array.from({ length: 1201 }, (_, i) => ({ id: String(i).padStart(5, '0'), role: 'user', created_at: '2026-10-10T10:00:00Z' }));
    const ranges = [];
    mocks.from.mockImplementation((table) => {
      const rows = table === 'profiles' ? profiles : [];
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = (start, end) => { if (table === 'profiles') ranges.push([start, end]); return Promise.resolve({ data: rows.slice(start, end + 1), count: rows.length, error: null }); };
      return q;
    });
    const snapshot = await getAdminSnapshot(new Date('2026-10-18T09:00:00Z'));
    expect(snapshot.profiles).toHaveLength(1201);
    expect(ranges).toContainEqual([1000, 1499]);
  });

  it('does not publish a partial snapshot when any page fails', async () => {
    mocks.from.mockImplementation((table) => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = () => Promise.resolve(table === 'growth_events' ? { error: new Error('offline') } : { data: [], count: 0, error: null });
      return q;
    });
    await expect(getAdminSnapshot()).rejects.toThrow('offline');
  });

  it('reads only the plan fields it needs instead of whole plan documents', async () => {
    const selects = {};
    const filters = {};
    mocks.from.mockImplementation((table) => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.select = vi.fn((columns) => { selects[table] = columns; return q; });
      q.in = vi.fn((column, values) => { filters[table] = [column, values]; return q; });
      q.gte = vi.fn((column, value) => { filters[`${table}:gte`] = [column, value]; return q; });
      q.range = () => Promise.resolve({ data: [], count: 0, error: null });
      return q;
    });
    await getAdminSnapshot(new Date('2026-10-18T09:00:00Z'));
    expect(selects.plans).toContain('goal:plan_data->>goal');
    expect(selects.plans).not.toMatch(/(^|, )plan_data(,|$)/);
    expect(filters.growth_events).toEqual(['event_name', ADMIN_EVENT_NAMES]);
    expect(rpcCalls).toEqual(expect.arrayContaining([
      ['admin_member_activity', { p_since: '2026-09-18' }],
      ['admin_workout_days', { p_since: '2026-09-16' }],
    ]));
    expect(selects.workout_logs).toBeUndefined();
  });

  it('reads member activity through the admin functions', async () => {
    rpcRows.admin_member_activity = [{ user_id: 'a', total_workouts: 4, recent_workouts: 2 }];
    rpcRows.admin_workout_days = [{ user_id: 'a', date: '2026-10-17' }];
    mocks.from.mockImplementation(() => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = () => Promise.resolve({ data: [], count: 0, error: null });
      return q;
    });
    const snapshot = await getAdminSnapshot(new Date('2026-10-18T09:00:00Z'));
    expect(snapshot.insightsAvailable).toBe(true);
    expect(snapshot.memberActivity).toEqual(rpcRows.admin_member_activity);
    expect(snapshot.workouts).toEqual(rpcRows.admin_workout_days);
  });

  it('still loads members when member activity fails to read', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.rpc.mockImplementation(() => {
      const q = { order: vi.fn(() => q), range: () => Promise.resolve({ error: new Error('timeout') }) };
      return q;
    });
    mocks.from.mockImplementation((table) => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = () => Promise.resolve(table === 'profiles' ? { data: [{ id: 'a' }], count: 1, error: null } : { data: [], count: 0, error: null });
      return q;
    });
    const snapshot = await getAdminSnapshot(new Date('2026-10-18T09:00:00Z'));
    expect(snapshot.profiles).toHaveLength(1);
    expect(snapshot.insightsAvailable).toBe(false);
  });

  it('marks member activity unavailable instead of zero before the functions exist', async () => {
    mocks.rpc.mockImplementation(() => {
      const q = { order: vi.fn(() => q), range: () => Promise.resolve({ error: { code: 'PGRST202', message: 'Could not find the function' } }) };
      return q;
    });
    mocks.from.mockImplementation(() => {
      const q = dataQuery({ data: [], count: 0, error: null });
      q.range = () => Promise.resolve({ data: [], count: 0, error: null });
      return q;
    });
    const snapshot = await getAdminSnapshot(new Date('2026-10-18T09:00:00Z'));
    expect(snapshot.insightsAvailable).toBe(false);
    expect(snapshot.workouts).toEqual([]);
  });

  it('refuses to read without a ready connection', async () => {
    mocks.ready.mockReturnValue(false);
    await expect(getAdminSnapshot()).rejects.toThrow('Supabase bağlantısı hazır değil.');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('distinguishes failed support counts from empty ones in strict mode', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('Connection unavailable');
    mocks.from.mockImplementation(() => dataQuery({ data: null, error: failure }));
    await expect(getSupportStats({ strict: true })).rejects.toBe(failure);
    await expect(getSupportStats()).resolves.toEqual({ open: 0, reviewing: 0, resolved: 0, total: 0 });
  });

  it.each(['https://', 'https://?', 'javascript:alert(1)', 'https://user:pass@example.com'])('rejects malformed or credential-bearing review proof %s', async (evidence_url) => {
    await expect(updateContentReview('review', { review_status: 'approved', reviewer_name: 'Reviewer', reviewer_credential: 'Credential', evidence_url })).rejects.toThrow('HTTPS');
  });
});
