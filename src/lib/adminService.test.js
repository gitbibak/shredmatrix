import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  invoke: vi.fn(),
}));

vi.mock('./supabase', () => ({
  supabase: {
    rpc: mocks.rpc,
    functions: { invoke: mocks.invoke },
  },
  isSupabaseReady: () => true,
}));

import { deleteUser, isAdmin, verifyAdminAccess } from './adminService';

describe('adminService security boundaries', () => {
  beforeEach(() => {
    mocks.rpc.mockReset();
    mocks.invoke.mockReset();
  });

  it('uses database role claims instead of a hard-coded email list', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
    expect(isAdmin({ app_metadata: { role: 'admin' } })).toBe(true);
    expect(isAdmin({ email: 'admin@example.com' })).toBe(false);
  });

  it('verifies admin access through the protected database function', async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null });

    await expect(verifyAdminAccess()).resolves.toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith('is_admin');
  });

  it('denies access when database verification fails', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: new Error('denied') });

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
