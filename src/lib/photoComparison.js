export function photoDay(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export function measurementForPhoto(photo, entries) {
  const day = photoDay(photo.date);
  return [...entries].reverse().find((entry) => entry.date === day) || null;
}

export async function comparisonFile(photos, locale) {
  const images = await Promise.all(
    photos.map(
      (photo) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          const timer = setTimeout(() => { img.onload = null; img.onerror = null; img.src = ''; reject(new Error('photo-timeout')); }, 15000);
          img.crossOrigin = 'anonymous';
          img.onload = () => { clearTimeout(timer); resolve(img); };
          img.onerror = () => { clearTimeout(timer); reject(new Error('photo-load-failed')); };
          img.src = photo.src;
        }),
    ),
  );
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-unavailable');
  ctx.fillStyle = '#080c18';
  ctx.fillRect(0, 0, 1200, 900);
  images.forEach((img, index) => {
    const scale = Math.min(560 / img.naturalWidth, 790 / img.naturalHeight);
    const w = img.naturalWidth * scale,
      h = img.naturalHeight * scale;
    ctx.drawImage(img, index * 600 + (600 - w) / 2, 20 + (790 - h) / 2, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      new Date(photos[index].date).toLocaleDateString(locale),
      index * 600 + 300,
      860,
    );
  });
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) throw new Error('export-failed');
  return new File([blob], 'full-balance-progress.png', { type: 'image/png' });
}
