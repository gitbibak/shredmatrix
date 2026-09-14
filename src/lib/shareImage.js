// Generates 1080x1080 share cards (Instagram Story/WhatsApp friendly) for
// emotional peaks: a completed workout, a streak milestone, a weekly summary.
// Everything is drawn on a canvas in the browser; nothing is uploaded.

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fitText(ctx, text, maxWidth, startSize, weight = 'bold') {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 24);
  return size;
}

/**
 * @param {object} card
 * @param {string} card.eyebrow   small label above the headline
 * @param {string} card.headline  main achievement text
 * @param {string} [card.subline] supporting line (name, module, date)
 * @param {{label: string, value: string}[]} card.stats up to four stats
 * @param {string} [card.footer]  small line at the bottom
 * @param {string} [card.accent]  hex color for highlights
 * @returns {Promise<Blob|null>}
 */
export async function renderShareCard({ eyebrow = 'FULL BALANCE', headline = '', subline = '', stats = [], footer = 'fullbalance.app', accent = '#ff6d00', variant, format = 'square' }) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (variant === 'workout') {
    const height = format === 'story' ? 1920 : 1080;
    canvas.height = height;
    ctx.fillStyle = '#080b10';
    ctx.fillRect(0, 0, 1080, height);
    const top = format === 'story' ? 270 : 80;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('FULL BALANCE', 80, top);
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(964, top - 10, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#080b10';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(952, top - 10); ctx.lineTo(961, top - 1); ctx.lineTo(977, top - 19); ctx.stroke();
    ctx.fillStyle = '#34d399';
    fitText(ctx, String(eyebrow).toUpperCase(), 920, 28);
    ctx.fillText(String(eyebrow).toUpperCase(), 80, top + 140);
    ctx.fillStyle = '#ffffff';
    fitText(ctx, headline, 920, 100);
    ctx.fillText(headline, 80, top + 270);
    ctx.fillStyle = accent;
    fitText(ctx, subline, 920, 38, '600');
    ctx.fillText(subline, 80, top + 350);
    const mainStats = stats.slice(0, 2);
    mainStats.forEach((stat, index) => {
      const x = 80 + index * 480;
      ctx.fillStyle = '#30363e'; ctx.fillRect(x, top + 435, 440, 2);
      ctx.fillStyle = '#ffffff';
      fitText(ctx, String(stat.value), 430, 112);
      ctx.fillText(String(stat.value), x, top + 575);
      ctx.fillStyle = '#a8b3bf';
      fitText(ctx, String(stat.label), 430, 30, '600');
      ctx.fillText(String(stat.label), x, top + 635);
    });
    ctx.fillStyle = '#34d399';
    const secondary = stats.slice(2).filter(stat => Number(stat.value) >= 2)
      .map(stat => `${stat.value} ${stat.label}`).join('  /  ');
    fitText(ctx, secondary, 920, 28, '600');
    ctx.fillText(secondary, 80, top + 735);
    ctx.fillStyle = '#a8b3bf';
    ctx.font = '26px sans-serif';
    ctx.fillText(footer, 80, height - (format === 'story' ? 240 : 90));
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }

  const background = ctx.createLinearGradient(0, 0, 0, 1080);
  background.addColorStop(0, '#020617');
  background.addColorStop(0.6, '#0f172a');
  background.addColorStop(1, '#020617');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1080);

  const glow = ctx.createRadialGradient(540, 360, 0, 540, 360, 520);
  glow.addColorStop(0, `${accent}33`);
  glow.addColorStop(1, `${accent}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(String(eyebrow).toUpperCase(), 540, 140);

  const accentLine = ctx.createLinearGradient(240, 0, 840, 0);
  accentLine.addColorStop(0, accent);
  accentLine.addColorStop(1, '#00b0ff');
  ctx.fillStyle = accentLine;
  ctx.fillRect(240, 170, 600, 4);

  ctx.fillStyle = '#ffffff';
  const headlineSize = fitText(ctx, headline, 920, 92);
  ctx.font = `bold ${headlineSize}px sans-serif`;
  ctx.fillText(headline, 540, 330);

  if (subline) {
    ctx.fillStyle = accent;
    fitText(ctx, subline, 900, 40, '600');
    ctx.fillText(subline, 540, 400);
  }

  const visibleStats = stats.slice(0, 4);
  if (visibleStats.length > 0) {
    const boxWidth = visibleStats.length <= 2 ? 380 : 220;
    const gap = 24;
    const totalWidth = visibleStats.length * boxWidth + (visibleStats.length - 1) * gap;
    let x = (1080 - totalWidth) / 2;
    visibleStats.forEach((stat) => {
      ctx.fillStyle = '#111c33';
      roundRect(ctx, x, 500, boxWidth, 190, 26);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      roundRect(ctx, x, 500, boxWidth, 190, 26);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      const valueSize = fitText(ctx, String(stat.value), boxWidth - 40, 64);
      ctx.font = `bold ${valueSize}px sans-serif`;
      ctx.fillText(String(stat.value), x + boxWidth / 2, 590);

      ctx.fillStyle = '#94a3b8';
      fitText(ctx, String(stat.label), boxWidth - 40, 26, '600');
      ctx.fillText(String(stat.label), x + boxWidth / 2, 650);
      x += boxWidth + gap;
    });
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('FULL BALANCE', 540, 860);
  ctx.fillStyle = '#64748b';
  ctx.font = '28px sans-serif';
  ctx.fillText(footer, 540, 910);

  return new Promise((resolve) => {
    if (typeof canvas.toBlob === 'function') canvas.toBlob(resolve, 'image/png');
    else resolve(null);
  });
}

/**
 * Shares the card with the native sheet when possible, otherwise downloads it.
 * @returns {Promise<'shared'|'downloaded'|'failed'>}
 */
export async function shareCardImage({ blob, text = '', url = '', title = 'Full Balance', filename = 'fullbalance-card.png' }) {
  if (!blob) return 'failed';
  const file = typeof File === 'function' ? new File([blob], filename, { type: 'image/png' }) : null;

  if (file && navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ title, text: url ? `${text}\n${url}` : text, files: [file] });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'failed';
    }
  }

  try {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
