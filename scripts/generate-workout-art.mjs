// Generates figure-free artwork for workout day cards and module headers.
// Pure SVG (gradients, rings, equipment glyphs) rasterised with sharp, so the
// app never shows stock photos of people. Run: node scripts/generate-workout-art.mjs
// then npm run images:optimize for the WebP variants.
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(rootDir, 'public/images/workout-art');
const W = 1200;
const H = 480;

const PALETTES = {
  orange: { a: '#ff6d00', b: '#ffb347', glow: 'rgba(255,109,0,0.55)', spark: '#ccfa73' },
  red: { a: '#ef4444', b: '#fb923c', glow: 'rgba(239,68,68,0.5)', spark: '#fde68a' },
  indigo: { a: '#6366f1', b: '#a78bfa', glow: 'rgba(99,102,241,0.5)', spark: '#c4b5fd' },
  teal: { a: '#14b8a6', b: '#4ade80', glow: 'rgba(20,184,166,0.5)', spark: '#bbf7d0' },
  pink: { a: '#ec4899', b: '#f472b6', glow: 'rgba(236,72,153,0.5)', spark: '#fbcfe8' },
  cyan: { a: '#06b6d4', b: '#60a5fa', glow: 'rgba(6,182,212,0.5)', spark: '#bae6fd' },
  amber: { a: '#f59e0b', b: '#fde047', glow: 'rgba(245,158,11,0.5)', spark: '#fef3c7' },
  lime: { a: '#84cc16', b: '#ccfa73', glow: 'rgba(132,204,22,0.5)', spark: '#ecfccb' },
};

// Glyphs are drawn in a 400x400 box centred at (0,0) after translation.
const stroke = (p, width = 18) => `fill="none" stroke="${p}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
const GLYPHS = {
  barbell: (p) => `
    <rect x="-190" y="-12" width="380" height="24" rx="12" fill="${p.spark}"/>
    <rect x="-160" y="-70" width="34" height="140" rx="10" fill="#ffffff"/>
    <rect x="-120" y="-90" width="34" height="180" rx="10" fill="#ffffff" opacity="0.85"/>
    <rect x="86" y="-90" width="34" height="180" rx="10" fill="#ffffff" opacity="0.85"/>
    <rect x="126" y="-70" width="34" height="140" rx="10" fill="#ffffff"/>`,
  dumbbell: (p) => `
    <g transform="rotate(-30)">
      <rect x="-120" y="-12" width="240" height="24" rx="12" fill="${p.spark}"/>
      <rect x="-170" y="-60" width="50" height="120" rx="14" fill="#ffffff"/>
      <rect x="120" y="-60" width="50" height="120" rx="14" fill="#ffffff"/>
      <rect x="-200" y="-40" width="30" height="80" rx="10" fill="#ffffff" opacity="0.8"/>
      <rect x="170" y="-40" width="30" height="80" rx="10" fill="#ffffff" opacity="0.8"/>
    </g>`,
  pullup: (p) => `
    <rect x="-190" y="-150" width="380" height="22" rx="11" fill="#ffffff"/>
    <rect x="-180" y="-150" width="22" height="80" rx="8" fill="#ffffff" opacity="0.7"/>
    <rect x="158" y="-150" width="22" height="80" rx="8" fill="#ffffff" opacity="0.7"/>
    <path d="M-70 -128 V 20 M70 -128 V 20" ${stroke(p.spark)}/>
    <circle cx="-70" cy="70" r="46" ${stroke('#ffffff')}/>
    <circle cx="70" cy="70" r="46" ${stroke('#ffffff')}/>`,
  kettlebell: (p) => `
    <path d="M-80 -60 C -80 -160, 80 -160, 80 -60" ${stroke('#ffffff', 26)}/>
    <circle cx="0" cy="60" r="120" fill="#ffffff"/>
    <circle cx="0" cy="60" r="120" fill="url(#glyphShade)"/>
    <circle cx="-40" cy="20" r="22" fill="${p.spark}" opacity="0.9"/>`,
  pulse: (p) => `
    <path d="M-200 0 H -110 L -70 -110 L -20 120 L 30 -40 L 60 0 H 200" ${stroke('#ffffff', 22)}/>
    <circle cx="-20" cy="120" r="18" fill="${p.spark}"/>
    <circle cx="-70" cy="-110" r="18" fill="${p.spark}"/>`,
  target: (p) => `
    <circle cx="0" cy="0" r="170" ${stroke('#ffffff', 14)}/>
    <circle cx="0" cy="0" r="110" ${stroke('#ffffff', 14)} opacity="0.8"/>
    <circle cx="0" cy="0" r="50" fill="${p.spark}"/>
    <path d="M-40 -140 L 40 -140 M-40 140 L 40 140" ${stroke(p.spark, 14)}/>`,
  hexBars: (p) => `
    <path d="M0 -180 L 156 -90 L 156 90 L 0 180 L -156 90 L -156 -90 Z" ${stroke('#ffffff', 16)}/>
    <rect x="-110" y="-60" width="220" height="20" rx="10" fill="${p.spark}"/>
    <rect x="-110" y="-10" width="220" height="20" rx="10" fill="#ffffff" opacity="0.9"/>
    <rect x="-110" y="40" width="220" height="20" rx="10" fill="${p.spark}" opacity="0.8"/>`,
  flame: (p) => `
    <path d="M0 -180 C 60 -110, 130 -70, 130 30 C 130 110, 70 170, 0 170 C -70 170, -130 110, -130 30 C -130 -40, -80 -70, -60 -120 C -40 -80, -10 -70, 0 -180 Z" fill="#ffffff"/>
    <path d="M0 -40 C 30 0, 60 20, 60 70 C 60 110, 30 140, 0 140 C -30 140, -60 110, -60 70 C -60 30, -30 10, 0 -40 Z" fill="${p.spark}"/>`,
  lotus: (p) => `
    <g fill="#ffffff">
      <ellipse cx="0" cy="-20" rx="48" ry="150" opacity="0.95"/>
      <ellipse cx="0" cy="0" rx="48" ry="150" transform="rotate(35)" opacity="0.8"/>
      <ellipse cx="0" cy="0" rx="48" ry="150" transform="rotate(-35)" opacity="0.8"/>
      <ellipse cx="0" cy="20" rx="48" ry="150" transform="rotate(70)" opacity="0.6"/>
      <ellipse cx="0" cy="20" rx="48" ry="150" transform="rotate(-70)" opacity="0.6"/>
    </g>
    <circle cx="0" cy="60" r="34" fill="${p.spark}"/>`,
  mat: (p) => `
    <rect x="-200" y="20" width="400" height="90" rx="45" fill="#ffffff" transform="skewX(-12)"/>
    <rect x="-200" y="20" width="60" height="90" rx="30" fill="${p.spark}" transform="skewX(-12)"/>
    <circle cx="60" cy="-80" r="90" fill="url(#glyphShade)" stroke="#ffffff" stroke-width="16"/>`,
  reformer: (p) => `
    <rect x="-200" y="-16" width="400" height="20" rx="10" fill="#ffffff"/>
    <rect x="-200" y="44" width="400" height="20" rx="10" fill="#ffffff" opacity="0.85"/>
    <rect x="-60" y="-60" width="170" height="100" rx="22" fill="${p.spark}"/>
    <path d="M-190 24 l 14 -22 14 22 14 -22 14 22 14 -22 14 22 14 -22 14 22" ${stroke('#ffffff', 10)}/>
    <rect x="150" y="-120" width="20" height="200" rx="10" fill="#ffffff" opacity="0.9"/>`,
  breath: (p) => `
    <circle cx="0" cy="0" r="170" ${stroke('#ffffff', 10)} opacity="0.5"/>
    <circle cx="0" cy="0" r="120" ${stroke('#ffffff', 12)} opacity="0.75"/>
    <circle cx="0" cy="0" r="70" fill="url(#glyphShade)" stroke="#ffffff" stroke-width="14"/>
    <path d="M-200 240 C -140 200, -100 280, -40 240 S 60 200, 120 240 S 200 260, 220 240" ${stroke(p.spark, 14)}/>`,
};

const ART = {
  chest: ['orange', 'barbell', -38],
  back: ['orange', 'pullup', -38],
  legs: ['amber', 'kettlebell', -38],
  shoulders: ['orange', 'dumbbell', -38],
  full: ['orange', 'hexBars', -38],
  cardio: ['red', 'pulse', -32],
  core: ['lime', 'target', -38],
  muscle: ['orange', 'barbell', -38],
  'fat-loss': ['red', 'flame', -32],
  yoga: ['teal', 'lotus', -30],
  pilates: ['pink', 'mat', -30],
  reformer: ['cyan', 'reformer', -30],
  meditation: ['indigo', 'breath', -26],
};

function svgFor(paletteKey, glyphKey, angle) {
  const p = PALETTES[paletteKey];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient>
    <radialGradient id="glowA" cx="0.85" cy="0.1" r="0.7"><stop offset="0" stop-color="${p.glow}"/><stop offset="1" stop-color="rgba(11,13,17,0)"/></radialGradient>
    <radialGradient id="glowB" cx="0.05" cy="1" r="0.6"><stop offset="0" stop-color="rgba(204,250,115,0.16)"/><stop offset="1" stop-color="rgba(11,13,17,0)"/></radialGradient>
    <radialGradient id="glyphShade" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(11,13,17,0.35)"/></radialGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(11,13,17,0.85)"/><stop offset="0.55" stop-color="rgba(11,13,17,0.2)"/><stop offset="1" stop-color="rgba(11,13,17,0)"/></linearGradient>
    <pattern id="dots" width="44" height="44" patternUnits="userSpaceOnUse"><circle cx="22" cy="22" r="1.7" fill="rgba(255,255,255,0.07)"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0d11"/>
  <rect width="${W}" height="${H}" fill="url(#glowA)"/>
  <rect width="${W}" height="${H}" fill="url(#glowB)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <g transform="translate(${W * 0.72} ${H * 0.5}) rotate(${angle})">
    <rect x="-900" y="-120" width="1800" height="240" rx="120" fill="url(#band)"/>
    <rect x="-900" y="50" width="1800" height="70" rx="35" fill="rgba(11,13,17,0.28)"/>
  </g>
  <g fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="2">
    <circle cx="${W * 0.9}" cy="${H * 0.1}" r="140"/><circle cx="${W * 0.9}" cy="${H * 0.1}" r="240"/><circle cx="${W * 0.9}" cy="${H * 0.1}" r="340"/><circle cx="${W * 0.9}" cy="${H * 0.1}" r="440"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <g transform="translate(${W * 0.76} ${H * 0.5}) scale(0.8)">
    ${GLYPHS[glyphKey](p)}
  </g>
</svg>`;
}

await mkdir(outDir, { recursive: true });
for (const [name, [paletteKey, glyphKey, angle]] of Object.entries(ART)) {
  const svg = svgFor(paletteKey, glyphKey, angle);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(outDir, `${name}.png`));
}
console.log(`Generated ${Object.keys(ART).length} workout art files in public/images/workout-art`);
