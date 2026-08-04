import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'marketing/ready-to-post');
const assetDir = path.join(outDir, 'assets');
const pngDir = path.join(outDir, 'png');
const videoDir = path.join(outDir, 'videos');
const screenshotsDir = path.join(root, 'output/marketing-kit/source-screenshots');

for (const dir of [assetDir, pngDir, videoDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const colors = {
  bg: '#050816',
  panel: '#10192b',
  panel2: '#0b1224',
  border: '#253551',
  white: '#f8fbff',
  muted: '#9aa8bf',
  orange: '#ff7a00',
  orange2: '#ff4d00',
  cyan: '#12d8ff',
  green: '#18e0a3',
  violet: '#8b5cf6',
  rose: '#fb4d73',
};

const modules = [
  ['Kas gelişimi', '↗', colors.orange],
  ['Yağ yakımı', '🔥', colors.rose],
  ['Yoga', '◯', colors.green],
  ['Meditasyon', '☾', colors.violet],
  ['Reformer', '▱', colors.cyan],
  ['Pilates', '◆', '#ffd166'],
];

function imageData(name) {
  return `data:image/png;base64,${fs.readFileSync(path.join(screenshotsDir, name)).toString('base64')}`;
}

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrap(text, chars) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > chars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(text, x, y, size, weight, fill, chars, gap = 1.12) {
  return wrap(text, chars)
    .map((line, index) => `<text x="${x}" y="${y + index * size * gap}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`)
    .join('\n');
}

function brand(x, y, size = 42) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="950" fill="${colors.orange}">FULL</text>
<text x="${x + size * 2.75}" y="${y}" font-size="${size}" font-weight="950" fill="#9fc4d9">BALANCE</text>`;
}

function badge(text, x, y, w = 220, h = 58) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="rgba(255,122,0,.12)" stroke="rgba(255,122,0,.55)" stroke-width="2"/>
<text x="${x + w / 2}" y="${y + h / 2 + 10}" text-anchor="middle" font-size="22" font-weight="900" fill="#ffd4a3">${esc(text)}</text>`;
}

function cta(text, x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="url(#cta)"/>
<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" font-size="34" font-weight="950" fill="#fff">${esc(text)}</text>`;
}

function defs(w, h) {
  return `<defs>
  <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#050816"/><stop offset="1" stop-color="#081022"/></linearGradient>
  <radialGradient id="orangeGlow" cx="12%" cy="18%" r="55%"><stop stop-color="${colors.orange}" stop-opacity=".26"/><stop offset="1" stop-color="${colors.orange}" stop-opacity="0"/></radialGradient>
  <radialGradient id="cyanGlow" cx="88%" cy="20%" r="52%"><stop stop-color="${colors.cyan}" stop-opacity=".16"/><stop offset="1" stop-color="${colors.cyan}" stop-opacity="0"/></radialGradient>
  <linearGradient id="cta" x1="0" x2="1" y1="0" y2="0"><stop stop-color="${colors.orange}"/><stop offset="1" stop-color="${colors.orange2}"/></linearGradient>
  <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#000" flood-opacity=".5"/></filter>
  <clipPath id="phoneClip"><rect x="${w / 2 - 188}" y="${h > 1600 ? 710 : 520}" width="376" height="${h > 1600 ? 710 : 520}" rx="34"/></clipPath>
</defs>`;
}

function baseOpen(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${defs(w, h)}
<rect width="100%" height="100%" fill="url(#bg)"/>
<rect width="100%" height="100%" fill="url(#orangeGlow)"/>
<rect width="100%" height="100%" fill="url(#cyanGlow)"/>
<g font-family="Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif" letter-spacing="0">`;
}

function baseClose() {
  return '</g>\n</svg>\n';
}

function moduleGrid(x, y, cardW, cardH, gap, fontSize = 28) {
  return modules.map(([label, icon, color], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cx = x + col * (cardW + gap);
    const cy = y + row * (cardH + gap);
    return `<rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}" rx="26" fill="rgba(17,26,45,.9)" stroke="${color}" stroke-opacity=".45" stroke-width="2"/>
<text x="${cx + 30}" y="${cy + 58}" font-size="42" font-weight="900" fill="${color}">${esc(icon)}</text>
<text x="${cx + 30}" y="${cy + cardH - 34}" font-size="${fontSize}" font-weight="900" fill="${colors.white}">${esc(label)}</text>`;
  }).join('\n');
}

function screenshotPhone(src, x, y, w, h, label) {
  return `<g filter="url(#shadow)">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44" fill="#05070d" stroke="rgba(255,255,255,.15)" stroke-width="4"/>
  <clipPath id="clip${Math.round(x)}${Math.round(y)}"><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="34"/></clipPath>
  <image href="${src}" x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" preserveAspectRatio="xMidYMin slice" clip-path="url(#clip${Math.round(x)}${Math.round(y)})"/>
</g>
<rect x="${x}" y="${y + h + 18}" width="${w}" height="54" rx="27" fill="rgba(17,26,45,.86)" stroke="rgba(255,255,255,.12)"/>
<text x="${x + w / 2}" y="${y + h + 53}" text-anchor="middle" font-size="22" font-weight="900" fill="#d5e7f5">${esc(label)}</text>`;
}

function sixModuleCard({ w, h, file }) {
  const isStory = h > 1600;
  let svg = baseOpen(w, h);
  svg += brand(64, 124, isStory ? 42 : 36);
  svg += badge('ÜCRETSİZ', w - 64 - 230, 80, 230, 60);
  svg += textBlock('Full Balance sadece fitness değil', 64, isStory ? 245 : 205, isStory ? 74 : 58, 950, colors.white, isStory ? 25 : 24, 1.04);
  svg += textBlock('6 hedef modülü tek uygulamada: spor, wellness, takip ve rapor.', 64, isStory ? 410 : 330, isStory ? 34 : 28, 760, colors.muted, isStory ? 38 : 34, 1.32);
  svg += moduleGrid(64, isStory ? 560 : 460, (w - 152) / 2, isStory ? 142 : 112, 24, isStory ? 28 : 22);
  const shotY = isStory ? 1080 : 875;
  const shotW = isStory ? 250 : 210;
  const shotH = isStory ? 395 : 320;
  const startX = (w - (shotW * 3 + 26 * 2)) / 2;
  svg += screenshotPhone(imageData('dashboard-nutrition-mobile.png'), startX, shotY, shotW, shotH, 'Beslenme');
  svg += screenshotPhone(imageData('dashboard-workout-mobile.png'), startX + shotW + 26, shotY, shotW, shotH, 'Antrenman');
  svg += screenshotPhone(imageData('dashboard-progress-mobile.png'), startX + (shotW + 26) * 2, shotY, shotW, shotH, 'İlerleme');
  svg += cta('Kredi kartı yok · Ücretsiz başla', 64, h - (isStory ? 176 : 132), w - 128, isStory ? 104 : 82);
  svg += baseClose();
  fs.writeFileSync(path.join(assetDir, file), svg);
}

function screenshotCard({ w, h, file, title, subtitle, badgeText, screenshot, label, chips }) {
  const isStory = h > 1600;
  let svg = baseOpen(w, h);
  svg += brand(64, 124, isStory ? 42 : 36);
  svg += badge(badgeText, w - 64 - 230, 80, 230, 60);
  svg += textBlock(title, 64, isStory ? 250 : 205, isStory ? 74 : 58, 950, colors.white, isStory ? 22 : 20, 1.04);
  svg += textBlock(subtitle, 64, isStory ? 420 : 330, isStory ? 34 : 28, 760, colors.muted, isStory ? 38 : 34, 1.32);
  const phoneW = isStory ? 520 : 430;
  const phoneH = isStory ? 845 : 640;
  const phoneX = (w - phoneW) / 2;
  const phoneY = isStory ? 645 : 510;
  svg += screenshotPhone(imageData(screenshot), phoneX, phoneY, phoneW, phoneH, label);
  svg += chips.map((chip, i) => {
    const chipW = Math.max(isStory ? 150 : 125, chip.length * (isStory ? 17 : 14) + 54);
    const x = 64 + i * (chipW + 18);
    const y = h - (isStory ? 310 : 245);
    return `<rect x="${x}" y="${y}" width="${chipW}" height="${isStory ? 58 : 48}" rx="999" fill="rgba(17,26,45,.86)" stroke="rgba(255,255,255,.14)"/>
<text x="${x + chipW / 2}" y="${y + (isStory ? 38 : 31)}" text-anchor="middle" font-size="${isStory ? 24 : 20}" font-weight="900" fill="#d5e7f5">${esc(chip)}</text>`;
  }).join('\n');
  svg += cta('Full Balance ücretsiz', 64, h - (isStory ? 176 : 132), w - 128, isStory ? 104 : 82);
  svg += baseClose();
  fs.writeFileSync(path.join(assetDir, file), svg);
}

const assets = [
  { type: 'modules', file: 'reels-cover-01-6-modul-tr.svg', w: 1080, h: 1920 },
  {
    type: 'screenshot',
    file: 'reels-cover-02-antrenman-tr.svg',
    w: 1080,
    h: 1920,
    title: 'Antrenman planını takip et',
    subtitle: 'Günün egzersizleri, set, tekrar ve dinlenme tek ekranda.',
    badgeText: 'ANTRENMAN',
    screenshot: 'dashboard-workout-mobile.png',
    label: 'Gerçek antrenman ekranı',
    chips: ['Set', 'Tekrar', 'Dinlenme'],
  },
  {
    type: 'screenshot',
    file: 'reels-cover-03-beslenme-tr.svg',
    w: 1080,
    h: 1920,
    title: 'Beslenme ve hedef takibi',
    subtitle: 'Kalori, makro, su ve uyku bilgilerini aynı akışta gör.',
    badgeText: 'BESLENME',
    screenshot: 'dashboard-nutrition-mobile.png',
    label: 'Gerçek beslenme ekranı',
    chips: ['Kalori', 'Makro', 'Su'],
  },
  { type: 'modules', file: 'pin-01-6-modul-tr.svg', w: 1000, h: 1500 },
  {
    type: 'screenshot',
    file: 'pin-02-antrenman-tr.svg',
    w: 1000,
    h: 1500,
    title: 'Antrenman programı daha net',
    subtitle: 'Günün egzersizlerini ve dinlenme sürelerini karıştırmadan takip et.',
    badgeText: 'ÜCRETSİZ',
    screenshot: 'dashboard-workout-mobile.png',
    label: 'Antrenman ekranı',
    chips: ['Egzersiz', 'Set', 'Rutin'],
  },
  {
    type: 'screenshot',
    file: 'pin-03-beslenme-tr.svg',
    w: 1000,
    h: 1500,
    title: 'Beslenme takibi sade olsun',
    subtitle: 'Kalori hedefini, makroları ve günlük alışkanlıkları tek yerde gör.',
    badgeText: 'ÜCRETSİZ',
    screenshot: 'dashboard-nutrition-mobile.png',
    label: 'Beslenme ekranı',
    chips: ['Kalori', 'Protein', 'Su'],
  },
];

for (const asset of assets) {
  if (asset.type === 'modules') sixModuleCard(asset);
  if (asset.type === 'screenshot') screenshotCard(asset);
}

function slide(title, subtitle, body) {
  return `<section>
  <h1>${esc(title)}</h1>
  <p>${esc(subtitle)}</p>
  ${body}
</section>`;
}

function videoHtml(file, slides) {
  const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <style>
    body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: ${colors.bg}; color: ${colors.white}; font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Arial, sans-serif; }
    .stage { position: relative; width: 1080px; height: 1920px; background: radial-gradient(circle at 14% 15%, rgba(255,122,0,.24), transparent 34%), radial-gradient(circle at 86% 18%, rgba(18,216,255,.16), transparent 34%), linear-gradient(180deg, #050816, #081022); }
    .brand { position: absolute; left: 64px; top: 92px; font-size: 42px; font-weight: 950; }
    .brand b { color: ${colors.orange}; } .brand span { color: #9fc4d9; }
    section { position: absolute; inset: 0; padding: 210px 64px 0; opacity: 0; animation: show 15s linear infinite; }
    section:nth-of-type(1) { animation-delay: 0s; }
    section:nth-of-type(2) { animation-delay: 5s; }
    section:nth-of-type(3) { animation-delay: 10s; }
    @keyframes show { 0%{opacity:0;transform:translateY(30px)} 5%,30%{opacity:1;transform:translateY(0)} 33.2%,100%{opacity:0;transform:translateY(-20px)} }
    h1 { margin: 0 0 24px; font-size: 78px; line-height: 1.02; letter-spacing: 0; }
    p { margin: 0; max-width: 870px; font-size: 38px; line-height: 1.28; color: ${colors.muted}; font-weight: 760; }
    .modules { margin-top: 120px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .module { height: 155px; border: 2px solid rgba(255,255,255,.12); background: rgba(17,26,45,.88); border-radius: 28px; padding: 28px; font-size: 30px; font-weight: 900; display: flex; align-items: center; gap: 18px; }
    .module i { font-style: normal; font-size: 46px; color: ${colors.orange}; }
    .phone { position: absolute; left: 280px; top: 650px; width: 520px; height: 900px; border-radius: 56px; border: 14px solid #05070d; overflow: hidden; box-shadow: 0 36px 90px rgba(0,0,0,.52); background: #05070d; }
    .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .cta { position: absolute; left: 64px; right: 64px; bottom: 76px; height: 108px; border-radius: 30px; background: linear-gradient(90deg, ${colors.orange}, ${colors.orange2}); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 950; }
    .bar { position: absolute; left: 132px; bottom: 210px; width: 816px; height: 12px; border-radius: 999px; background: #1b2940; }
    .bar::after { content: ""; display: block; width: 0; height: 12px; border-radius: 999px; background: ${colors.orange}; animation: progress 15s linear infinite; }
    @keyframes progress { to { width: 816px; } }
  </style>
</head>
<body>
  <main class="stage">
    <div class="brand"><b>FULL</b> <span>BALANCE</span></div>
    ${slides.join('\n')}
    <div class="bar"></div>
    <div class="cta">Ücretsiz başla</div>
  </main>
</body>
</html>`;
  fs.writeFileSync(path.join(videoDir, file), html);
}

const moduleMarkup = `<div class="modules">${modules.map(([label, icon]) => `<div class="module"><i>${esc(icon)}</i>${esc(label)}</div>`).join('')}</div>`;
const workoutMarkup = `<div class="phone"><img src="${imageData('dashboard-workout-mobile.png')}" alt="" /></div>`;
const nutritionMarkup = `<div class="phone"><img src="${imageData('dashboard-nutrition-mobile.png')}" alt="" /></div>`;
const progressMarkup = `<div class="phone"><img src="${imageData('dashboard-progress-mobile.png')}" alt="" /></div>`;

videoHtml('video-01-6-modul-tr.html', [
  slide('Full Balance sadece fitness değil', 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates tek uygulamada.', moduleMarkup),
  slide('Program hedefe göre sadeleşir', 'Spor, beslenme, su, uyku ve ilerleme aynı akışta görünür.', nutritionMarkup),
  slide('Tamamen ücretsiz', 'Kredi kartı yok. Uygulamayı aç, hedefini seç ve başla.', progressMarkup),
]);

videoHtml('video-02-antrenman-tr.html', [
  slide('Antrenman planı karışmasın', 'Günün egzersizleri, set, tekrar ve dinlenme aynı ekranda.', workoutMarkup),
  slide('Her gün ne yapacağını gör', 'Programı aç, antrenmanı tamamla, ilerlemeyi kaybetme.', workoutMarkup),
  slide('Full Balance ücretsiz', 'Kas gelişimi hedefini daha düzenli takip et.', progressMarkup),
]);

videoHtml('video-03-beslenme-tr.html', [
  slide('Beslenme takibi sade olsun', 'Kalori, makro, su ve uyku bilgilerini tek yerde gör.', nutritionMarkup),
  slide('Hedefe göre takip', 'Kas gelişimi veya yağ yakımı hedefine göre günlük akışı izle.', nutritionMarkup),
  slide('Raporla ilerle', 'Kilo, ölçü ve haftalık gelişimi aynı uygulamada tut.', progressMarkup),
]);

const manifest = {
  generatedAt: new Date().toISOString(),
  pngExports: assets.map((asset) => `png/${asset.file.replace('.svg', '.png')}`),
  sourceSvgs: assets.map((asset) => `assets/${asset.file}`),
  videoHtml: [
    'videos/video-01-6-modul-tr.html',
    'videos/video-02-antrenman-tr.html',
    'videos/video-03-beslenme-tr.html',
  ],
  mp4Exports: [
    'mp4/video-01-6-modul-tr.mp4',
    'mp4/video-02-antrenman-tr.mp4',
    'mp4/video-03-beslenme-tr.mp4',
  ],
  note: 'Use png/ for static posts and mp4/ for TikTok, Instagram Reels and Pinterest video pins. The videos/ HTML files are editable motion sources.',
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Ready assets generated in ${outDir}`);
