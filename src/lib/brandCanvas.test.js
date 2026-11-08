import { describe, it, expect, vi, afterEach } from 'vitest';

function fakeCtx() {
  return { font: '', fillStyle: '', textAlign: '', fillText: vi.fn(), drawImage: vi.fn(), measureText: () => ({ width: 300 }) };
}

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

function stubImage(ok) {
  vi.stubGlobal('Image', class { set src(_) { setTimeout(() => (ok ? this.onload() : this.onerror()), 0); } });
}

describe('drawBrandLockup', () => {
  it('draws the symbol beside the wordmark', async () => {
    stubImage(true);
    const { drawBrandLockup } = await import('./brandCanvas');
    const ctx = fakeCtx();
    expect(await drawBrandLockup(ctx, { cx: 540, y: 130, fontSize: 60 })).toBe(true);
    expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('FULL BALANCE', expect.any(Number), 130);
  });

  it('falls back to the centered wordmark when the symbol cannot load', async () => {
    stubImage(false);
    const { drawBrandLockup } = await import('./brandCanvas');
    const ctx = fakeCtx();
    expect(await drawBrandLockup(ctx, { cx: 540, y: 130, fontSize: 60 })).toBe(false);
    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('FULL BALANCE', 540, 130);
  });
});
