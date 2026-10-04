// node dev/stills.mjs <ex> <lang> t1,t2,... out.png  -> contact sheet of frames
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from './serve.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [ex, lang, ts, out] = process.argv.slice(2);
globalThis.__srv = await serve();
const b = await chromium.launch(Object.assign({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] }, {}, { args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] }));
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('ERR', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') console.log('log', m.text()); });
await p.goto(globalThis.__srv.base + `player.html?ex=${ex}&lang=${lang}`);
await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
const D = await p.evaluate(() => window.DURATION);
console.log('duration', D.toFixed(2));
const times = ts === 'auto' ? Array.from({ length: 12 }, (_, i) => +(0.5 + i * (D - 1) / 11).toFixed(2)) : ts.split(',').map(Number);
const dir = fs.mkdtempSync('/tmp/st-');
const files = [];
for (const t of times) { await p.evaluate(t => window.render(t), t); const f = `${dir}/${String(files.length).padStart(2, '0')}.png`; await p.screenshot({ path: f }); files.push(f); }
await b.close(); globalThis.__srv.srv.close();
const cols = Math.min(6, files.length);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap(f => ['-i', f]), '-filter_complex',
  files.map((_, i) => `[${i}]scale=360:-1[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` + files.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|'), out]);
console.log('wrote', out, times.join(' '));
