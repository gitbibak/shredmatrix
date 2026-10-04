// node dev/hipsheet.mjs <ex> t1,t2,... out.png  -> crops around the pelvis (projected) for each time
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [ex, ts, out, size = '520'] = process.argv.slice(2);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto(S.base + `player.html?ex=${ex}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
const dir = fs.mkdtempSync('/tmp/hip-'); const files = [];
const sz = +size;
for (const t of ts.split(',').map(Number)) {
  const c = await p.evaluate((t) => { FB.render(t); const tl = FB.getTL(); const s = tl.solveP(tl.poseAt(t)); const cam = FB.camera(tl.camAt(t)); return cam.p(s.J.pelvis); }, t);
  const x = Math.max(0, Math.min(1080 - sz, c[0] - sz / 2)), y = Math.max(0, Math.min(1920 - sz, c[1] - sz / 2));
  const f = `${dir}/${files.length}.png`; await p.screenshot({ path: f, clip: { x, y, width: sz, height: sz } }); files.push(f);
}
await b.close(); S.srv.close();
const cols = Math.min(5, files.length);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex', files.map((_, i) => `[${i}]scale=360:360[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` + files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 360}`).join('|'), out]);
console.log('ok');
