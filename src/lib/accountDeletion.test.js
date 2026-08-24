import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  getSession: vi.fn(),
  update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
  select: vi.fn(() => ({
    eq: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })),
  })),
}));

vi.mock('./supabase', () => ({
  isSupabaseReady: () => true,
  supabase: {
    auth: { getSession: mocks.getSession },
    functions: { invoke: mocks.invoke },
    from: vi.fn(() => ({ select: mocks.select, update: mocks.update })),
  },
}));

describe('account deletion', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-1', email: 'user@example.com', user_metadata: {} },
        },
      },
    });
  });

  it('keeps local data when the server cannot delete the account', async () => {
    const { getSession, deleteAllUserData } = await import('./dataService');
    localStorage.setItem('shredmatrix_progress', JSON.stringify([{ weight: 75 }]));
    mocks.invoke.mockResolvedValue({ data: null, error: { message: 'Service unavailable' } });

    await getSession();

    await expect(deleteAllUserData('user@example.com')).rejects.toThrow('Service unavailable');
    expect(localStorage.getItem('shredmatrix_progress')).not.toBeNull();
  });

  it('clears local data only after confirmed server deletion', async () => {
    const { getSession, deleteAllUserData } = await import('./dataService');
    localStorage.setItem('shredmatrix_progress', JSON.stringify([{ weight: 75 }]));
    mocks.invoke.mockResolvedValue({ data: { ok: true }, error: null });

    await getSession();
    await deleteAllUserData('user@example.com');

    expect(mocks.invoke).toHaveBeenCalledWith('delete-account');
    expect(localStorage.getItem('shredmatrix_progress')).toBeNull();
  });
});
