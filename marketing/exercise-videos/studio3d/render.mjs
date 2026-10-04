// node render.mjs <exId[,exId2...]|all> [--lang tr,en,es] [--fps 30] [--jobs 3]
// Output: out/<lang>/<exId>.mp4 (1080x1920, H.264)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { serve } from './dev/serve.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
let ids = (args[0] || 'goblet_squat').split(',');
if (ids[0] === 'all') ids = fs.readdirSync('exercises').filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.slice(0, -3)).sort();
const langs = opt('--lang', 'tr').split(',');
const fps = Number(opt('--fps', 30));
const jobs = Number(opt('--jobs', 3));
const skipExisting = args.includes('--skip-existing');

const queue = [];
for (const lang of langs) for (const id of ids) {
  const out = `out/${lang}/${id}.mp4`;
  if (skipExisting && fs.existsSync(out)) continue;
  queue.push({ id, lang, out });
}
globalThis.__srv = await serve();
const browser = await chromium.launch(Object.assign({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] }, { args: ['--disable-gpu-vsync'] }, { args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] }));

async function renderOne({ id, lang, out }) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  let err = null;
  page.on('pageerror', (e) => { err = e.message; });
  await page.goto(globalThis.__srv.base + `player.html?ex=${id}&lang=${lang}`);
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const duration = await page.evaluate(() => window.DURATION);
  const tmp = out + '.part.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duration * fps);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.render(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  await page.close();
  if (err) { console.error(`✗ ${lang}/${id}: ${err}`); fs.rmSync(tmp, { force: true }); return; }
  fs.renameSync(tmp, out);
  console.log(`✓ ${lang}/${id}  ${duration.toFixed(1)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

const workers = Array.from({ length: Math.min(jobs, queue.length) }, async () => { while (queue.length) await renderOne(queue.shift()); });
await Promise.all(workers);
await browser.close(); globalThis.__srv.srv.close();
