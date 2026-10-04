// node dev/slide.mjs <id> : foot/hand slide while in contact with the floor (y below thr) over the whole timeline
import { chromium } from '/Users/ahmetdeveci/Downloads/gitbibak/shredmatrix/marketing/exercise-videos/node_modules/playwright/index.mjs';
import { serve } from '/Users/ahmetdeveci/Downloads/gitbibak/shredmatrix/marketing/exercise-videos/studio3d/dev/serve.mjs';

const [id, thrA] = process.argv.slice(2);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.log('pageerror', e.message));
await p.goto(S.base + `player.html?ex=${id}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
const out = await p.evaluate((thr) => {
  const tl = FB.getTL(); const res = {}; const pts = { heelR: 0.025, toeR: 0.025, ballR: 0.025, heelL: 0.025, toeL: 0.025, ballL: 0.025, handR: 0.06, handL: 0.06, kneeR: 0.08, kneeL: 0.08 };
  let prev = null; const segs = {};
  for (let t = 0; t < tl.DURATION; t += 1 / 60) {
    const J = tl.solveP(tl.poseAt(t)).J;
    if (prev) for (const k in pts) {
      const th = pts[k] + (thr || 0);
      if (J[k][1] < th && prev[k][1] < th) { const d = Math.hypot(J[k][0] - prev[k][0], J[k][2] - prev[k][2]); res[k] = res[k] || { tot: 0, max: 0, tMax: 0 }; res[k].tot += d; if (d > res[k].max) { res[k].max = d; res[k].tMax = +t.toFixed(2); }
        if (d > 0.002) { (segs[k] = segs[k] || []); const s = segs[k]; if (s.length && t - s[s.length - 1].t1 < 0.05) { s[s.length - 1].t1 = t; s[s.length - 1].d += d; } else s.push({ t0: t, t1: t, d }); } }
    }
    prev = J;
  }
  for (const k in res) { res[k].tot = +(res[k].tot * 100).toFixed(1); res[k].max = +(res[k].max * 100).toFixed(2); }
  const big = {}; for (const k in segs) big[k] = segs[k].filter((s) => s.d > 0.01).map((s) => `${s.t0.toFixed(2)}-${s.t1.toFixed(2)}:${(s.d * 100).toFixed(1)}cm`);
  return { DURATION: tl.DURATION, res, big };
}, +(thrA || 0));
console.log(JSON.stringify(out, null, 1));
await b.close(); S.srv.close();
