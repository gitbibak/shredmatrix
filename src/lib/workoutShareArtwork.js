function loadArtwork(source) {
  // Only our bundled artwork may enter an export canvas; never fetch user URLs.
  if (!/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp)$/.test(source || '')) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => finish(null), 5000);
    function finish(value) { clearTimeout(timer); img.onload = null; img.onerror = null; resolve(value); }
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    img.src = source;
  });
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
}

export async function drawWorkoutArtwork(ctx, canvas, card) {
  const story = card.format === 'story';
  const height = story ? 1920 : 1080;
  canvas.height = height;
  const photoBottom = story ? 1110 : 570;
  const image = await loadArtwork(card.imageSource);
  ctx.fillStyle = '#101114';
  ctx.fillRect(0, 0, 1080, height);
  if (image) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 1080, photoBottom); ctx.clip();
    const ratio = Math.max(1080 / image.naturalWidth, photoBottom / image.naturalHeight);
    const w = image.naturalWidth * ratio;
    const h = image.naturalHeight * ratio;
    ctx.drawImage(image, (1080 - w) / 2, (photoBottom - h) / 2, w, h);
    ctx.restore();
  } else {
    ctx.fillStyle = '#20282d'; ctx.fillRect(0, 0, 1080, photoBottom);
    ctx.strokeStyle = '#37464e'; ctx.lineWidth = 2;
    for (let x = -800; x < 1800; x += 120) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 800, photoBottom); ctx.stroke();
    }
  }
  const shade = ctx.createLinearGradient(0, 0, 0, photoBottom);
  shade.addColorStop(0, 'rgba(0,0,0,0.65)');
  shade.addColorStop(0.38, 'rgba(0,0,0,0.03)');
  shade.addColorStop(0.7, 'rgba(16,17,20,0.35)');
  shade.addColorStop(1, '#101114');
  ctx.fillStyle = shade; ctx.fillRect(0, 0, 1080, photoBottom);
  const header = story ? 225 : 80;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff781e'; ctx.fillRect(70, header - 30, 6, 34);
  text(ctx, 'FULL BALANCE', 94, header, 630, 34, '#ffffff');
  if (card.dateLabel) {
    ctx.textAlign = 'right';
    text(ctx, card.dateLabel, 1010, header, 270, 25, '#e0e5e7', 500);
    ctx.textAlign = 'left';
  }
  const achievement = story ? 875 : 385;
  ctx.fillStyle = '#ccfa73';
  ctx.beginPath(); ctx.arc(87, achievement - 57, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#16200c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(79, achievement - 57); ctx.lineTo(85, achievement - 51); ctx.lineTo(96, achievement - 63); ctx.stroke();
  text(ctx, card.eyebrow, 119, achievement - 47, 885, 28, '#ccfa73');
  text(ctx, card.headline, 70, achievement + 65, 940, 112, '#ffffff', 800);
  text(ctx, card.subline, 73, achievement + 130, 934, 39, '#ff9149', 600);
  const statsTop = story ? 1170 : 635;
  const stats = card.stats.slice(0, 2);
  stats.forEach((stat, i) => {
    const x = 70 + i * 480;
    ctx.fillStyle = '#24282d'; ctx.fillRect(x, statsTop, 450, 4);
    ctx.fillStyle = i === 0 ? '#ff781e' : '#ccfa73'; ctx.fillRect(x, statsTop, 64, 4);
    text(ctx, stat.value, x, statsTop + 116, 440, 112, '#ffffff', 800);
    text(ctx, stat.label, x + 2, statsTop + 163, 435, 30, '#c5ccd3', 500);
  });
  const secondary = card.stats.slice(2).filter(stat => Number(stat.value) >= 2);
  const secondaryTop = story ? 1460 : 885;
  if (secondary.length) {
    ctx.fillStyle = '#1b2420'; ctx.fillRect(70, secondaryTop - 33, 940, 64);
    text(ctx, secondary.map(stat => `${stat.label}: ${stat.value}`).join('   /   '), 92, secondaryTop + 9, 900, 28, '#ccfa73', 600);
  }
  ctx.fillStyle = '#ff781e'; ctx.fillRect(70, height - (story ? 290 : 92), 50, 3);
  text(ctx, card.footer, 70, height - (story ? 240 : 46), 800, 28, '#e5e8eb', 600);
}

export function sharePreviewDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Share preview could not be read'));
    reader.readAsDataURL(blob);
  });
}
