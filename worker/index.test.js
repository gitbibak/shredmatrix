import { describe, expect, it, vi } from 'vitest';
import worker, { DEFAULT_MEAL_MODEL } from './index';

const analysisAnswer = JSON.stringify({
  is_food: true,
  confidence: 0.8,
  items: [{ name: 'Apple', estimated_grams: 150, calories: 78 }],
});

function mealRequest(body = { image: 'data:image/jpeg;base64,YQ==', language: 'en' }, origin = 'https://fullbalance.app') {
  return new Request('https://fullbalance.app/api/analyze-meal', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin, 'cf-connecting-ip': '203.0.113.5' },
    body: JSON.stringify(body),
  });
}

describe('meal analysis worker', () => {
  it.each([null, [], 'meal', 42, true])('rejects a non-object payload: %j', async (body) => {
    const run = vi.fn();
    const response = await worker.fetch(mealRequest(body), { AI: { run } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_request' });
    expect(run).not.toHaveBeenCalled();
  });
  it('waits for the complete model answer before normalizing it', async () => {
    const run = vi.fn().mockResolvedValue({ result: { answer: analysisAnswer }, usage: {} });

    const response = await worker.fetch(mealRequest(), { AI: { run } });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.isFood).toBe(true);
    expect(result.model).toBe(DEFAULT_MEAL_MODEL);
    expect(run).toHaveBeenCalledWith(DEFAULT_MEAL_MODEL, expect.objectContaining({ stream: false, task: 'query' }));
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('forwards the canonical vocabulary to the prompt', async () => {
    const run = vi.fn().mockResolvedValue({ result: { answer: analysisAnswer } });
    await worker.fetch(mealRequest({ image: 'data:image/jpeg;base64,YQ==', language: 'tr', vocabulary: ['Rice (Cooked)'] }), { AI: { run } });
    expect(run.mock.calls[0][1].question).toContain('Rice (Cooked)');
  });

  it('uses the chat format and JSON mode for Llama vision models', async () => {
    const run = vi.fn().mockResolvedValue({ response: analysisAnswer });
    const env = { AI: { run }, MEAL_MODEL: '@cf/meta/llama-3.2-11b-vision-instruct' };
    const response = await worker.fetch(mealRequest(), env);
    expect(response.status).toBe(200);
    const [model, input] = run.mock.calls[0];
    expect(model).toBe('@cf/meta/llama-3.2-11b-vision-instruct');
    expect(input.image).toBe('data:image/jpeg;base64,YQ==');
    expect(input.messages[1].content).toContain('meal');
    expect(input.response_format.type).toBe('json_schema');
  });

  it('rejects requests over the per-client rate limit', async () => {
    const run = vi.fn();
    const limit = vi.fn().mockResolvedValue({ success: false });
    const response = await worker.fetch(mealRequest(), { AI: { run }, MEAL_RATE_LIMIT: { limit } });
    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: '203.0.113.5' });
    expect(run).not.toHaveBeenCalled();
  });

  it('rejects foreign origins and invalid images', async () => {
    const run = vi.fn();
    expect((await worker.fetch(mealRequest(undefined, 'https://evil.example'), { AI: { run } })).status).toBe(403);
    expect((await worker.fetch(mealRequest({ image: 'data:text/plain;base64,YQ==', language: 'en' }), { AI: { run } })).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it('reports a service error when the model fails', async () => {
    const run = vi.fn().mockRejectedValue(new Error('boom'));
    const response = await worker.fetch(mealRequest(), { AI: { run } });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'analysis_unavailable' });
  });
});
