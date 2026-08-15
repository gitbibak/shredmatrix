import { describe, expect, it, vi } from 'vitest';
import { createIndexNowPayload, INDEXNOW_KEY, submitIndexNow } from '../scripts/submit-indexnow.mjs';

describe('IndexNow submission', () => {
  it('publishes every canonical route with a hosted verification key', () => {
    const payload = createIndexNowPayload();

    expect(payload.host).toBe('fullbalance.app');
    expect(payload.key).toBe(INDEXNOW_KEY);
    expect(payload.keyLocation).toBe(`https://fullbalance.app/${INDEXNOW_KEY}.txt`);
    expect(payload.urlList).toContain('https://fullbalance.app/en');
    expect(payload.urlList).toContain('https://fullbalance.app/es');
    expect(new Set(payload.urlList).size).toBe(payload.urlList.length);
  });

  it('accepts successful IndexNow responses', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 202, text: vi.fn() });

    const result = await submitIndexNow(fetcher);

    expect(result.submitted).toBeGreaterThan(40);
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
