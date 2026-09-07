import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ ready: true, responses: [], calls: [] }));
vi.mock('./acquisition', () => ({ getAcquisitionContext: () => ({}) }));
vi.mock('./supabase', () => ({
  isSupabaseReady: () => mock.ready,
  supabase: {
    auth: { signUp: async () => ({ data: { session: { user: { id: 'test-user' } } } }) },
    from: (table) => {
      const query = { then: (resolve, reject) => Promise.resolve(mock.responses.shift()).then(resolve, reject) };
      for (const method of ['select', 'eq', 'order', 'insert', 'update', 'delete']) {
        query[method] = (...args) => { mock.calls.push([table, method, ...args]); return query; };
      }
      return query;
    },
  },
}));

let service;
beforeEach(async () => {
  vi.resetModules();
  mock.ready = true;
  mock.responses = [];
  mock.calls = [];
  localStorage.clear();
  service = await import('./dataService');
  await service.signUp('test@example.com', 'unused', 'Test');
});

describe('progress persistence', () => {
  it('propagates rejected saves without pretending local storage is synced', async () => {
    mock.responses.push({ data: [], error: null }, { error: new Error('offline') });
    await expect(service.saveProgress({ date: '2026-09-07', weight: 75 })).rejects.toThrow('offline');
    expect(localStorage.getItem('shredmatrix_progress')).toBeNull();
  });

  it('updates existing dates with ownership filters instead of inserting duplicates', async () => {
    mock.responses.push({ data: [{ id: 'entry' }] }, { data: [{ id: 'entry' }] });
    await service.saveProgress({ date: '2026-09-07', weight: 74, bodyFat: 18 });
    expect(mock.calls).toContainEqual(['progress_entries', 'update', { weight: 74, body_fat: 18 }]);
    expect(mock.calls.filter(call => call[1] === 'eq' && call[2] === 'user_id')).toHaveLength(2);
    expect(mock.calls.some(call => call[1] === 'insert')).toBe(false);
  });

  it('rejects writes silently filtered out by permissions', async () => {
    mock.responses.push({ data: [{ id: 'entry' }] }, { data: [] });
    await expect(service.saveProgress({ date: '2026-09-07', weight: 75 })).rejects.toThrow('not saved');
  });

  it('does not insert when the existence check fails', async () => {
    mock.responses.push({ error: new Error('unavailable') });
    await expect(service.saveProgress({ date: '2026-09-07', weight: 75 })).rejects.toThrow('unavailable');
    expect(mock.calls.some(call => call[1] === 'insert')).toBe(false);
  });

  it('propagates delete failures', async () => {
    mock.responses.push({ error: new Error('denied') });
    await expect(service.deleteProgress('2026-09-07')).rejects.toThrow('denied');
  });

  it('preserves body fat on reload', async () => {
    mock.responses.push({ data: [{ date: '2026-09-07', weight: 75, body_fat: 18 }] });
    expect(await service.getProgress()).toEqual([expect.objectContaining({ bodyFat: 18 })]);
  });

  it('replaces a local date and sorts entries', async () => {
    mock.ready = false;
    await service.saveProgress({ date: '2026-09-07', weight: 75 });
    await service.saveProgress({ date: '2026-09-06', weight: 76 });
    await service.saveProgress({ date: '2026-09-07', weight: 74 });
    expect((await service.getProgress()).map(entry => entry.weight)).toEqual([76, 74]);
  });
});
