import { describe, expect, it, vi } from 'vitest';
import worker from './index';

describe('meal analysis worker', () => {
  it('waits for the complete model answer before normalizing it', async () => {
    const run = vi.fn().mockResolvedValue({
      result: {
        answer: JSON.stringify({
          is_food: true,
          confidence: 0.8,
          items: [{ name: 'Apple', estimated_grams: 150, calories: 78 }],
        }),
      },
      usage: {},
    });
    const request = new Request('https://fullbalance.app/api/analyze-meal', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://fullbalance.app' },
      body: JSON.stringify({ image: 'data:image/jpeg;base64,YQ==', language: 'en' }),
    });

    const response = await worker.fetch(request, { AI: { run } });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.isFood).toBe(true);
    expect(run).toHaveBeenCalledWith(
      '@cf/moondream/moondream3.1-9B-A2B',
      expect.objectContaining({ stream: false }),
    );
    expect(run).toHaveBeenCalledTimes(1);
  });
});
