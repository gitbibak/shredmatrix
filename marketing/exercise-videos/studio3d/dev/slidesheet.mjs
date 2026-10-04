// node dev/slidesheet.mjs out.png  -> for every id flagged in out/sweep.json: 4 frames across its worst slide, cropped around the joint
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const outDir = process.argv[2] || 'out/slidecheck';
fs.mkdirSync(outDir, { recursive: true });
const r = JSON.parse(fs.readFileSync('out/sweep.json'));
const items = [];
for (const [id, v] of Object.entries(r)) {
  let best = null;
  for (const i of v.issues) { const m = /slide (\w+) (\d+)cm @([\d.]+)-([\d.]+)/.exec(i); if (m && (!best || +m[2] > best.cm)) best = { j: m[1], cm: +m[2], t0: +m[3], t1: +m[4] }; }
  if (best) items.push({ id, ...best });
}
items.sort((a, b) => b.cm - a.cm);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const rows = [];
for (const it of items) {
  await p.goto(S.base + `player.html?ex=${it.id}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
  const files = [];
  const span = Math.max(0.3, it.t1 - it.t0);
  for (let k = 0; k < 4; k++) {
    const t = it.t0 - 0.15 + (span + 0.3) * k / 3;
    const c = await p.evaluate(([t, j]) => { FB.render(t); const tl = FB.getTL(); const s = tl.solveP(tl.poseAt(t)); const cam = FB.camera(tl.camAt(t)); return [cam.p(s.J[j]), cam.p(s.J.pelvis)]; }, [t, it.j]);
    const cx = (c[0][0] + c[1][0]) / 2, cy = (c[0][1] + c[1][1]) / 2, h = 330;
    const f = `${outDir}/${it.id}_${k}.png`;
    await p.screenshot({ path: f, clip: { x: Math.max(0, Math.min(1080 - 2 * h, cx - h)), y: Math.max(0, Math.min(1920 - 2 * h, cy - h)), width: 2 * h, height: 2 * h } });
    files.push(f);
  }
  const row = `${outDir}/${it.id}.png`;
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', files.map((_, i) => `[${i}]scale=300:300[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + 'hstack=inputs=4', row]);
  files.forEach((f) => fs.rmSync(f));
  rows.push(row); console.log(it.id, it.j, it.cm, it.t0, it.t1);
}
await b.close(); S.srv.close();
// pages of 6 rows
for (let i = 0; i < rows.length; i += 6) {
  const part = rows.slice(i, i + 6);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...part.flatMap((f) => ['-i', f]), '-filter_complex', part.length > 1 ? part.map((_, k) => `[${k}]`).join('') + `vstack=inputs=${part.length}` : 'null', `${outDir}/page${i / 6 + 1}.png`]);
}
