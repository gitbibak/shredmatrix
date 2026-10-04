// node dev/zoom.mjs <ex> <t> <joint> <halfSizePx> out.png [scale]  -> crop centred on a projected joint, upscaled
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const [ex, t, joint, half, out] = process.argv.slice(2);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto(S.base + `player.html?ex=${ex}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
const c = await p.evaluate(([t, j]) => { FB.render(t); const tl = FB.getTL(); const s = tl.solveP(tl.poseAt(t)); return FB.camera(tl.camAt(t)).p(s.J[j]); }, [+t, joint]);
const h = +half;
await p.screenshot({ path: out, clip: { x: Math.max(0, c[0] - h), y: Math.max(0, c[1] - h), width: 2 * h, height: 2 * h } });
await b.close(); S.srv.close();
