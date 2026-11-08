// Draws the Full Balance symbol on share-card canvases so shared images carry
// the same mark as the app icon. If the symbol cannot load (offline, old
// browser), cards fall back to the plain wordmark.

const MARK_SRC = '/brand/mark.svg';
const MARK_RATIO = 1.031; // height / width of mark.svg
const LOAD_TIMEOUT_MS = 1500;
let markPromise = null;

export function loadBrandMark() {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  if (!markPromise) {
    markPromise = new Promise((resolve) => {
      const img = new Image();
      // Never hold up a share: give up on the symbol after a short wait.
      const timer = setTimeout(() => { markPromise = null; resolve(null); }, LOAD_TIMEOUT_MS);
      img.onload = () => { clearTimeout(timer); resolve(img); };
      img.onerror = () => { clearTimeout(timer); markPromise = null; resolve(null); };
      img.src = MARK_SRC;
    });
  }
  return markPromise;
}

/**
 * Symbol + "FULL BALANCE" centered on cx, text baseline at y.
 * Returns false when the symbol was unavailable and only text was drawn.
 */
export async function drawBrandLockup(ctx, { cx, y, fontSize, color = '#ffffff', font = 'sans-serif', weight = 'bold' }) {
  const mark = await loadBrandMark();
  const label = 'FULL BALANCE';
  ctx.font = `${weight} ${fontSize}px ${font}`;
  ctx.fillStyle = color;
  if (!mark) {
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, y);
    return false;
  }
  const markW = Math.round(fontSize * 1.05);
  const markH = Math.round(markW * MARK_RATIO);
  const gap = Math.round(fontSize * 0.35);
  const textW = ctx.measureText(label).width;
  const left = cx - (markW + gap + textW) / 2;
  ctx.drawImage(mark, left, y - fontSize * 0.86 - (markH - fontSize * 0.86) / 2, markW, markH);
  ctx.textAlign = 'left';
  ctx.fillText(label, left + markW + gap, y);
  ctx.textAlign = 'center';
  return true;
}

/** Symbol only, top-left at (x, y). */
export async function drawBrandMark(ctx, x, y, width) {
  const mark = await loadBrandMark();
  if (!mark) return false;
  ctx.drawImage(mark, x, y, width, Math.round(width * MARK_RATIO));
  return true;
}
