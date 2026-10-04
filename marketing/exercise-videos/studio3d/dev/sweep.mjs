// node dev/sweep.mjs [ids|all]  -> automatic defect sweep over whole timelines (writes out/sweep.json, prints flagged ids)
// flags: contact sliding (foot/hand/knee moving > 4 cm while on the floor), limb pops (> 6 cm/frame at 60 fps),
//        body below the floor (> 2 cm), page errors
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const which = process.argv[2] || 'all';
const ids = which === 'all' ? fs.readdirSync('exercises').filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.slice(0, -3)).sort() : which.split(',');
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const report = {}; const jobs = ids.slice();
await Promise.all([0, 1, 2, 3].map(async () => {
  while (jobs.length) {
    const id = jobs.shift(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    try {
      await p.goto(S.base + `player.html?ex=${id}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
      report[id] = await p.evaluate(() => {
        const tl = FB.getTL(), V = FB.V, CL = FB.CLEAR;
        const CON = { heelR: 0.03, toeR: 0.03, ballR: 0.03, heelL: 0.03, toeL: 0.03, ballL: 0.03, handR: 0.06, handL: 0.06, kneeR: 0.08, kneeL: 0.08 };
        const LIMB = ['handL', 'handR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'head', 'pelvis'];
        const LYING = { chest: 0.06, waist: 0.06, pelvis: 0.07, neck: 0.05, shoulder: 0.05, head: 0.09 };
        const issues = []; const seg = {}; let prev = null;
        for (let t = 0; t < tl.DURATION; t += 1 / 60) {
          const J = tl.solveP(tl.poseAt(t)).J;
          for (const k in J) { const base = k.replace(/[LR]$/, ''); const c = Math.min(CL[base] ?? 0.03, LYING[base] ?? 1); if (c - J[k][1] > 0.02) { issues.push(`floor ${k} ${Math.round((c - J[k][1]) * 100)}cm @${t.toFixed(1)}`); break; } }
          if (prev) {
            for (const k of LIMB) { const d = V.len(V.sub(J[k], prev[k])); if (d > 0.06) issues.push(`pop ${k} ${Math.round(d * 100)}cm @${t.toFixed(2)}`); }
            for (const k in CON) if (J[k][1] < CON[k] && prev[k][1] < CON[k]) {
              const d = Math.hypot(J[k][0] - prev[k][0], J[k][2] - prev[k][2]);
              const s = seg[k] = seg[k] || []; const last = s[s.length - 1];
              if (d > 0.002) { if (last && t - last.t1 < 0.06) { last.t1 = t; last.d += d; } else s.push({ t0: t, t1: t, d }); }
            }
          }
          prev = J;
        }
        for (const k in seg) for (const s of seg[k]) if (s.d > 0.04) issues.push(`slide ${k} ${Math.round(s.d * 100)}cm @${s.t0.toFixed(1)}-${s.t1.toFixed(1)}`);
        // collapse repeats
        const uniq = []; for (const i of issues) { const key = i.split(' ').slice(0, 2).join(' '); if (!uniq.some((u) => u.startsWith(key))) uniq.push(i); }
        return { D: +tl.DURATION.toFixed(1), issues: uniq.slice(0, 12), n: issues.length };
      });
    } catch (e) { report[id] = { issues: ['load ' + e.message.split('\n')[0]] }; }
    if (errs.length) report[id].issues.unshift('pageerror ' + errs[0]);
    await p.close();
  }
}));
await b.close(); S.srv.close();
fs.writeFileSync('out/sweep.json', JSON.stringify(report, null, 1));
const bad = Object.entries(report).filter(([, r]) => r.issues.length);
for (const [id, r] of bad.sort()) console.log(id.padEnd(30), r.issues.join(' | '));
console.log(`${bad.length} flagged of ${ids.length}`);
