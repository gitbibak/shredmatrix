import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderShareCard, shareCardImage } from './shareImage';

afterEach(() => vi.restoreAllMocks());

describe('workout share image', () => {
  it.each([['square', 1080], ['story', 1920]])('renders %s without low streak values', async (format, height) => {
    const texts = [];
    const ctx = new Proxy({
      measureText: text => ({ width: text.length * 10 }),
      fillText: text => texts.push(text),
    }, { get: (target, key) => target[key] || (() => {}) });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    let dimensions;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
      dimensions = [this.width, this.height];
      callback(new Blob(['image'], { type: 'image/png' }));
    });
    const blob = await renderShareCard({ variant: 'workout', format, headline: '16 workouts', stats: [
      { label: 'Exercises', value: 7 }, { label: 'Sets', value: 24 },
      { label: 'Day streak', value: 1 }, { label: 'This week', value: 3 },
    ] });
    expect(blob.type).toBe('image/png');
    expect(dimensions).toEqual([1080, height]);
    expect(texts).toContain('3 This week');
    expect(texts.some(text => text.includes('Day streak'))).toBe(false);
  });
  it('returns failure for a missing image', async () => {
    expect(await shareCardImage({ blob: null })).toBe('failed');
  });
});
