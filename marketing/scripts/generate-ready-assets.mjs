import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'marketing/ready-to-post');
const assetDir = path.join(outDir, 'assets');
const videoDir = path.join(outDir, 'videos');
const screenshotsDir = path.join(root, 'output/marketing-kit/source-screenshots');

fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(videoDir, { recursive: true });

const brand = {
  orange: '#ff7a00',
  orange2: '#ff4d00',
  cyan: '#12d8ff',
  green: '#18e0a3',
  violet: '#8b5cf6',
  dark: '#050816',
  card: '#111a2d',
  border: '#263654',
  muted: '#9aa8bf',
  white: '#f8fbff',
};

function imageData(name) {
  const file = path.join(screenshotsDir, name);
  const data = fs.readFileSync(file).toString('base64');
  return `data:image/png;base64,${data}`;
}

function esc(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(text, x, y, size, weight, color, maxChars, lineHeight = 1.12) {
  return wrapText(text, maxChars)
    .map((line, index) => `<text x="${x}" y="${y + index * size * lineHeight}" fill="${color}" font-size="${size}" font-weight="${weight}">${esc(line)}</text>`)
    .join('\n');
}

function chips(chipsList, x, y, maxWidth, size) {
  let cx = x;
  let cy = y;
  const parts = [];
  for (const chip of chipsList) {
    const w = Math.max(120, chip.length * size * 0.58 + 42);
    if (cx + w > x + maxWidth) {
      cx = x;
      cy += size + 34;
    }
    parts.push(`<rect x="${cx}" y="${cy}" width="${w}" height="${size + 26}" rx="${(size + 26) / 2}" fill="rgba(17,26,45,.86)" stroke="rgba(255,255,255,.16)" />
<text x="${cx + 22}" y="${cy + size + 4}" fill="#d5e7f5" font-size="${size}" font-weight="800">${esc(chip)}</text>`);
    cx += w + 14;
  }
  return parts.join('\n');
}

function cardSvg(card) {
  const titleSize = card.width === 1080 ? 82 : 64;
  const subtitleSize = card.width === 1080 ? 36 : 29;
  const top = card.width === 1080 ? 76 : 54;
  const side = card.width === 1080 ? 64 : 52;
  const phoneW = card.width === 1080 ? 520 : 410;
  const phoneH = card.width === 1080 ? 890 : 670;
  const phoneX = (card.width - phoneW) / 2;
  const phoneY = card.width === 1080 ? 680 : 500;
  const chipY = card.width === 1080 ? card.height - 292 : card.height - 222;
  const ctaH = card.width === 1080 ? 108 : 84;
  const ctaY = card.height - ctaH - (card.width === 1080 ? 74 : 52);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${card.width}" height="${card.height}" viewBox="0 0 ${card.width} ${card.height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#050816"/><stop offset="1" stop-color="#081022"/></linearGradient>
    <radialGradient id="glowA" cx="15%" cy="18%" r="48%"><stop stop-color="${brand.orange}" stop-opacity=".32"/><stop offset="1" stop-color="${brand.orange}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowB" cx="92%" cy="25%" r="48%"><stop stop-color="${brand.cyan}" stop-opacity=".2"/><stop offset="1" stop-color="${brand.cyan}" stop-opacity="0"/></radialGradient>
    <linearGradient id="cta" x1="0" x2="1" y1="0" y2="0"><stop stop-color="${brand.orange}"/><stop offset="1" stop-color="${brand.orange2}"/></linearGradient>
    <clipPath id="phoneClip"><rect x="${phoneX + 14}" y="${phoneY + 14}" width="${phoneW - 28}" height="${phoneH - 28}" rx="44"/></clipPath>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="34" stdDeviation="38" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glowA)"/>
  <rect width="100%" height="100%" fill="url(#glowB)"/>
  <g font-family="Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" letter-spacing="0">
    <text x="${side}" y="${top + 48}" fill="${brand.orange}" font-size="${card.width === 1080 ? 42 : 34}" font-weight="950">FULL</text>
    <text x="${side + (card.width === 1080 ? 118 : 96)}" y="${top + 48}" fill="#9fc4d9" font-size="${card.width === 1080 ? 42 : 34}" font-weight="950">BALANCE</text>
    <rect x="${card.width - side - 250}" y="${top + 4}" width="250" height="${card.width === 1080 ? 62 : 52}" rx="999" fill="rgba(255,122,0,.12)" stroke="rgba(255,122,0,.5)" stroke-width="2"/>
    <text x="${card.width - side - 225}" y="${top + (card.width === 1080 ? 45 : 38)}" fill="#ffd4a3" font-size="${card.width === 1080 ? 24 : 20}" font-weight="900">${esc(card.badge)}</text>
    ${textLines(card.title, side, card.width === 1080 ? 250 : 198, titleSize, 950, brand.white, card.width === 1080 ? 21 : 20, 1.02)}
    ${textLines(card.subtitle, side, card.width === 1080 ? 420 : 330, subtitleSize, 750, brand.muted, card.width === 1080 ? 34 : 32, 1.28)}
    <g filter="url(#shadow)">
      <rect x="${phoneX}" y="${phoneY}" width="${phoneW}" height="${phoneH}" rx="58" fill="#05070d" stroke="rgba(255,255,255,.15)" stroke-width="4"/>
      <image href="${card.image}" x="${phoneX + 14}" y="${phoneY + 14}" width="${phoneW - 28}" height="${phoneH - 28}" preserveAspectRatio="xMidYMin slice" clip-path="url(#phoneClip)"/>
    </g>
    ${chips(card.chips, side, chipY, card.width - side * 2, card.width === 1080 ? 28 : 23)}
    <rect x="${side}" y="${ctaY}" width="${card.width - side * 2}" height="${ctaH}" rx="${card.width === 1080 ? 30 : 24}" fill="url(#cta)"/>
    <text x="${card.width / 2}" y="${ctaY + ctaH / 2 + (card.width === 1080 ? 13 : 10)}" text-anchor="middle" fill="#fff" font-size="${card.width === 1080 ? 36 : 29}" font-weight="950">${esc(card.cta)}</text>
  </g>
</svg>`;
}

function videoSvg(spec) {
  const duration = 15;
  const slideDur = 5;
  const slides = spec.slides.map((slide, i) => {
    const begin = i * slideDur;
    return `<g opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.88;1" begin="${begin}s" dur="${slideDur}s" fill="remove"/>
      <rect width="1080" height="1920" fill="#050816"/>
      <circle cx="170" cy="270" r="620" fill="${slide.accent}" opacity=".22"/>
      <text x="72" y="122" fill="${brand.orange}" font-size="46" font-weight="950">FULL</text>
      <text x="200" y="122" fill="#9fc4d9" font-size="46" font-weight="950">BALANCE</text>
      ${textLines(slide.title, 72, 250, 78, 950, brand.white, 20, 1.04)}
      ${textLines(slide.subtitle, 72, 420, 38, 760, brand.muted, 34, 1.28)}
      <rect x="115" y="505" width="850" height="1010" rx="62" fill="${brand.card}" stroke="${brand.border}" stroke-width="3"/>
      <rect x="255" y="585" width="570" height="840" rx="58" fill="#05070d"/>
      <clipPath id="phoneClip${i}"><rect x="269" y="599" width="542" height="812" rx="44"/></clipPath>
      <image href="${slide.image}" x="269" y="599" width="542" height="812" preserveAspectRatio="xMidYMin slice" clip-path="url(#phoneClip${i})"/>
      <rect x="72" y="1628" width="936" height="112" rx="32" fill="${brand.orange}"/>
      <text x="540" y="1698" text-anchor="middle" fill="#fff" font-size="38" font-weight="950">Ücretsiz başla</text>
    </g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="${brand.dark}"/>
  <g font-family="Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif">
    ${slides}
    <rect x="132" y="1792" width="816" height="12" rx="8" fill="#1b2940"/>
    <rect x="132" y="1792" width="0" height="12" rx="8" fill="${brand.orange}">
      <animate attributeName="width" from="0" to="816" dur="${duration}s" fill="freeze"/>
    </rect>
  </g>
</svg>`;
}

const data = {
  cards: [
    {
      file: 'reels-cover-01-6-modul-tr.svg',
      width: 1080,
      height: 1920,
      title: '6 modül tek uygulama',
      subtitle: 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates.',
      badge: 'ÜCRETSİZ',
      image: imageData('landing-mobile.png'),
      chips: ['Kas gelişimi', 'Yağ yakımı', 'Yoga', 'Meditasyon', 'Reformer', 'Pilates'],
      cta: 'Full Balance ile başla',
    },
    {
      file: 'reels-cover-02-kas-gelisimi-tr.svg',
      width: 1080,
      height: 1920,
      title: 'Kas gelişimi için plan + takip',
      subtitle: 'Antrenman, protein, su, uyku ve ilerleme aynı yerde.',
      badge: 'KART YOK',
      image: imageData('dashboard-workout-mobile.png'),
      chips: ['Haftalık split', 'Protein hedefi', 'İlerleme raporu'],
      cta: 'Programını oluştur',
    },
    {
      file: 'reels-cover-03-wellness-tr.svg',
      width: 1080,
      height: 1920,
      title: 'Yoga, pilates ve meditasyon',
      subtitle: 'Sadece fitness değil; denge, uyku ve rutin takibi de var.',
      badge: '6 MODÜL',
      image: imageData('dashboard-progress-mobile.png'),
      chips: ['Yoga', 'Pilates', 'Reformer', 'Meditasyon'],
      cta: 'Ücretsiz dene',
    },
    {
      file: 'pin-01-6-modul-tr.svg',
      width: 1000,
      height: 1500,
      title: 'Ücretsiz 6 modüllü uygulama',
      subtitle: 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates tek yerde.',
      badge: 'FULL BALANCE',
      image: imageData('landing-mobile.png'),
      chips: ['Ücretsiz', 'Kredi kartı yok', 'Kişisel plan'],
      cta: 'fullbalance.app',
    },
    {
      file: 'pin-02-kas-gelisimi-tr.svg',
      width: 1000,
      height: 1500,
      title: 'Kas gelişimi programı',
      subtitle: 'Antrenman planını, protein hedefini ve ilerlemeni birlikte takip et.',
      badge: 'ÜCRETSİZ',
      image: imageData('dashboard-workout-mobile.png'),
      chips: ['Split', 'Set', 'Tekrar', 'Rapor'],
      cta: 'fullbalance.app',
    },
    {
      file: 'pin-03-yag-yakimi-tr.svg',
      width: 1000,
      height: 1500,
      title: 'Yağ yakımı sadece tartı değil',
      subtitle: 'Kalori, su, uyku, antrenman ve kilo trendini tek ekranda takip et.',
      badge: 'ÜCRETSİZ',
      image: imageData('dashboard-nutrition-mobile.png'),
      chips: ['Kalori', 'Su', 'Uyku', 'Trend'],
      cta: 'fullbalance.app',
    },
  ],
  videos: [
    {
      file: 'video-01-6-modul-tr.svg',
      slides: [
        { title: '6 modül tek uygulama', subtitle: 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates.', image: imageData('landing-mobile.png'), accent: brand.orange },
        { title: 'Hedefini seç', subtitle: 'Program, hedef ve seviyene göre sadeleşir.', image: imageData('onboarding-mobile.png'), accent: brand.cyan },
        { title: 'Ücretsiz başla', subtitle: 'Kredi kartı yok. Full Balance her zaman ücretsiz.', image: imageData('dashboard-nutrition-mobile.png'), accent: brand.green },
      ],
    },
    {
      file: 'video-02-kas-gelisimi-tr.svg',
      slides: [
        { title: 'Kas gelişimi için', subtitle: 'Sadece liste değil; plan, takip ve rapor.', image: imageData('dashboard-workout-mobile.png'), accent: brand.orange },
        { title: 'Protein + antrenman', subtitle: 'Hedeflerini aynı akışta gör.', image: imageData('dashboard-nutrition-mobile.png'), accent: brand.cyan },
        { title: 'İlerlemeni kaybetme', subtitle: 'Kilo, ölçü ve haftalık rapor yanında.', image: imageData('dashboard-progress-mobile.png'), accent: brand.green },
      ],
    },
    {
      file: 'video-03-wellness-tr.svg',
      slides: [
        { title: 'Sadece fitness değil', subtitle: 'Yoga, pilates, reformer ve meditasyon da var.', image: imageData('landing-mobile.png'), accent: brand.violet },
        { title: 'Kısa rutinler', subtitle: 'Gününe göre takip edilebilir akış.', image: imageData('dashboard-achievements-desktop.png'), accent: brand.cyan },
        { title: 'Dengeni takip et', subtitle: 'Su, uyku, antrenman ve ilerleme tek yerde.', image: imageData('dashboard-progress-mobile.png'), accent: brand.orange },
      ],
    },
  ],
};

for (const card of data.cards) {
  fs.writeFileSync(path.join(assetDir, card.file), `${cardSvg(card)}\n`);
}

for (const video of data.videos) {
  fs.writeFileSync(path.join(videoDir, video.file), `${videoSvg(video)}\n`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  staticAssets: data.cards.map((card) => `assets/${card.file}`),
  pngExports: data.cards.map((card) => `png/${card.file.replace(/\.svg$/, '.png')}`),
  animatedVideos: data.videos.map((video) => `videos/${video.file}`),
  note: 'SVG video files are 15-second animated vertical creatives. Open in a browser, screen-record, or import into a design/video tool for MP4 export.',
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Ready-to-post SVG kit generated in ${outDir}`);
