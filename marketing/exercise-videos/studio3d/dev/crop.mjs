// node dev/crop.mjs <ex> <t> <x,y,w,h> out.png  -> full-res crop of one frame
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const [ex, t, box, out] = process.argv.slice(2);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto(S.base + `player.html?ex=${ex}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
await p.evaluate(t => window.render(t), +t);
const [x, y, w, h] = box.split(',').map(Number);
await p.screenshot({ path: out, clip: { x, y, width: w, height: h } });
await b.close(); S.srv.close();
