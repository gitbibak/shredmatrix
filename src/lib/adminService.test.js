import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  invoke: vi.fn(),
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
  isSupabaseReady: () => true,
}));

import { deleteUser, isAdmin, verifyAdminAccess } from './adminService';

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
