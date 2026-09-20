// Fully generated workout share card. No photos and no human figures: the
// design is built from gradients, rings and typography so every card looks
// consistent and nothing is downloaded at export time.

const GOAL_PALETTES = {
  muscle: { a: '#ff6d00', b: '#ffb347', glow: 'rgba(255,109,0,0.55)', spark: '#ccfa73' },
  fat_loss: { a: '#ef4444', b: '#fb923c', glow: 'rgba(239,68,68,0.5)', spark: '#fde68a' },
  meditation: { a: '#6366f1', b: '#a78bfa', glow: 'rgba(99,102,241,0.5)', spark: '#c4b5fd' },
  yoga: { a: '#14b8a6', b: '#4ade80', glow: 'rgba(20,184,166,0.5)', spark: '#bbf7d0' },
  pilates: { a: '#ec4899', b: '#f472b6', glow: 'rgba(236,72,153,0.5)', spark: '#fbcfe8' },
  reformer: { a: '#06b6d4', b: '#60a5fa', glow: 'rgba(6,182,212,0.5)', spark: '#bae6fd' },
};

function palette(theme) {
  return GOAL_PALETTES[theme] || GOAL_PALETTES.muscle;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function text(ctx, value, x, y, width, size, color, weight = 700) {
  ctx.fillStyle = color;
  let fontSize = size;
  while (fontSize > 16) {
    ctx.font = `${weight} ${fontSize}px "Outfit", sans-serif`;
    if (ctx.measureText(String(value)).width <= width) break;
    fontSize -= 2;
  }
  ctx.fillText(String(value), x, y, width);
  return fontSize;
}

function drawBackdrop(ctx, width, height, colors, story) {
  ctx.fillStyle = '#0b0d11';
  ctx.fillRect(0, 0, width, height);

  // Soft colour mesh for depth.
  const glows = [
    [width * 0.92, height * 0.08, width * 0.75, colors.glow],
    [width * 0.05, height * 0.98, width * 0.65, 'rgba(204,250,115,0.16)'],
    [width * 0.5, height * 0.55, width * 0.9, 'rgba(56,63,80,0.35)'],
  ];
  glows.forEach(([x, y, r, color]) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(11,13,17,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  });

  // Fine dot grid for texture.
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let y = 40; y < height; y += 48) {
    for (let x = 40; x < width; x += 48) {
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Diagonal energy band running off the top-right corner.
  ctx.save();
  ctx.translate(width * (story ? 0.82 : 0.9), height * (story ? 0.16 : 0.1));
  ctx.rotate(-Math.PI / 5);
  const band = ctx.createLinearGradient(-700, 0, 700, 0);
  band.addColorStop(0, colors.a);
  band.addColorStop(1, colors.b);
  ctx.fillStyle = band;
  roundRect(ctx, -820, -150, 1640, 300, 150);
  ctx.fill();
  ctx.fillStyle = 'rgba(11,13,17,0.28)';
  roundRect(ctx, -820, 60, 1640, 90, 45);
  ctx.fill();
  ctx.restore();

  // Concentric rings echo the momentum motif.
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  [180, 300, 420, 540].forEach((r) => {
    ctx.beginPath(); ctx.arc(width * 0.92, height * (story ? 0.08 : 0.04), r, 0, Math.PI * 2); ctx.stroke();
  });

  // Dark veil so the text block always sits on a calm background.
  const veilTop = story ? 700 : 300;
  const veil = ctx.createLinearGradient(0, veilTop, 0, veilTop + 180);
  veil.addColorStop(0, 'rgba(11,13,17,0)');
  veil.addColorStop(1, 'rgba(11,13,17,0.94)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, veilTop, width, height - veilTop);
}

function drawProgressRing(ctx, cx, cy, radius, ratio, colors, label, value) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 22;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
  const clamped = Math.max(0.04, Math.min(1, ratio));
  const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  grad.addColorStop(0, colors.a);
  grad.addColorStop(1, colors.spark);
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamped);
  ctx.stroke();
  ctx.textAlign = 'center';
  text(ctx, value, cx, cy + 22, radius * 1.5, 72, '#ffffff', 800);
  text(ctx, label, cx, cy + 62, radius * 1.6, 24, '#c5ccd3', 500);
  ctx.textAlign = 'left';
}

function drawBarbell(ctx, x, y, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y + 9, 64, 6, 3); ctx.fill();
  [[x + 6, 24], [x + 14, 34], [x + 44, 34], [x + 52, 24]].forEach(([px, h]) => {
    roundRect(ctx, px, y + 12 - h / 2, 8, h, 3); ctx.fill();
  });
}

export async function drawWorkoutArtwork(ctx, canvas, card) {
  const story = card.format === 'story';
  const width = 1080;
  const height = story ? 1920 : 1080;
  canvas.height = height;
  const colors = palette(card.theme);
  drawBackdrop(ctx, width, height, colors, story);

  // Header: brand mark and date.
  const header = story ? 200 : 96;
  ctx.textAlign = 'left';
  drawBarbell(ctx, 70, header - 34, colors.a);
  text(ctx, 'FULL BALANCE', 150, header - 6, 560, 34, '#ffffff', 800);
  if (card.dateLabel) {
    ctx.textAlign = 'right';
    text(ctx, card.dateLabel, 1010, header - 6, 300, 26, '#e0e5e7', 500);
    ctx.textAlign = 'left';
  }

  // Weekly progress ring (only when we know the week target).
  const progress = card.progress && Number(card.progress.total) > 0 ? card.progress : null;
  const ringY = story ? 640 : 400;
  if (progress) {
    drawProgressRing(ctx, 870, ringY, 118, Number(progress.value) / Number(progress.total), colors,
      progress.label || '', `${progress.value}/${progress.total}`);
  }

  // Achievement block.
  const achievement = story ? 1000 : 590;
  ctx.fillStyle = colors.spark;
  ctx.beginPath(); ctx.arc(87, achievement - 187, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#16200c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(79, achievement - 187); ctx.lineTo(85, achievement - 181); ctx.lineTo(96, achievement - 193); ctx.stroke();
  text(ctx, String(card.eyebrow || '').toUpperCase(), 119, achievement - 177, progress ? 600 : 880, 28, colors.spark, 700);
  text(ctx, card.headline, 70, achievement - 60, progress ? 660 : 940, 118, '#ffffff', 800);
  if (card.subline) {
    ctx.font = '600 34px "Outfit", sans-serif';
    const pillWidth = Math.min(940, ctx.measureText(String(card.subline)).width + 64);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, 70, achievement - 12, pillWidth, 64, 32); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2;
    roundRect(ctx, 70, achievement - 12, pillWidth, 64, 32); ctx.stroke();
    text(ctx, card.subline, 102, achievement + 32, pillWidth - 64, 34, colors.b, 600);
  }

  // Primary stats as glass tiles.
  const statsTop = story ? 1180 : 720;
  const stats = (card.stats || []).slice(0, 2);
  stats.forEach((stat, i) => {
    const x = 70 + i * 480;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, x, statsTop, 460, 190, 28); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    roundRect(ctx, x, statsTop, 460, 190, 28); ctx.stroke();
    ctx.fillStyle = i === 0 ? colors.a : colors.spark;
    roundRect(ctx, x + 32, statsTop + 30, 54, 6, 3); ctx.fill();
    text(ctx, stat.value, x + 32, statsTop + 128, 400, 92, '#ffffff', 800);
    text(ctx, stat.label, x + 34, statsTop + 164, 396, 28, '#c5ccd3', 500);
  });

  // Secondary stats as chips; single-day streaks are not worth bragging about.
  const secondary = (card.stats || []).slice(2)
    .filter((stat) => Number(stat.value) >= 2)
    // The ring already shows the weekly count, so skip a duplicate chip.
    .filter((stat) => !(progress && progress.label && stat.label === progress.label));
  let chipX = 70;
  const chipY = story ? 1420 : 928;
  secondary.forEach((stat) => {
    const label = `${stat.label}: ${stat.value}`;
    ctx.font = '600 28px "Outfit", sans-serif';
    const w = ctx.measureText(label).width + 56;
    if (chipX + w > 1010) return;
    ctx.fillStyle = 'rgba(204,250,115,0.12)';
    roundRect(ctx, chipX, chipY, w, 58, 29); ctx.fill();
    text(ctx, label, chipX + 28, chipY + 39, w - 56, 28, colors.spark, 600);
    chipX += w + 16;
  });

  // Footer.
  const footerY = height - (story ? 250 : 36);
  ctx.fillStyle = colors.a;
  roundRect(ctx, 70, footerY - 44, 50, 4, 2); ctx.fill();
  text(ctx, card.footer, 70, footerY, 800, 28, '#e5e8eb', 600);
}

export function sharePreviewDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Share preview could not be read'));
    reader.readAsDataURL(blob);
  });
}
