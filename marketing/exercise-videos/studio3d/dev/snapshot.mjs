// node dev/snapshot.mjs save|diff [ids|all]  -> joint positions of every exercise at 40 times (out/snapshots/*.json); diff reports moves > 1.5 cm
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
const [mode, which = 'all'] = process.argv.slice(2);
if (mode !== 'save' && mode !== 'diff') { console.log('usage: node dev/snapshot.mjs diff [ids] | save [ids]   (save only after an approved engine change)'); process.exit(1); }
let ids = which === 'all' ? fs.readdirSync('exercises').filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.slice(0, -3)).sort() : which.split(',');
fs.mkdirSync('out/snapshots', { recursive: true });
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const KEYS = ['pelvis', 'neck', 'head', 'elbowL', 'elbowR', 'handL', 'handR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'toeL', 'toeR'];
let changed = 0;
const jobs = ids.slice();
await Promise.all([0, 1, 2, 3].map(async () => {
  while (jobs.length) {
    const id = jobs.shift();
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    try {
      await p.goto(S.base + `player.html?ex=${id}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
      const snap = await p.evaluate((KEYS) => { const tl = FB.getTL(); const o = { D: tl.DURATION, f: [] };
        for (let i = 0; i < 40; i++) { const t = (i + 0.5) * tl.DURATION / 40; const s = tl.solveP(tl.poseAt(t)); o.f.push(KEYS.map((k) => s.J[k].map((x) => +x.toFixed(4)))); } return o; }, KEYS);
      const f = `out/snapshots/${id}.json`;
      if (mode === 'save') fs.writeFileSync(f, JSON.stringify(snap));
      else if (fs.existsSync(f)) {
        const old = JSON.parse(fs.readFileSync(f)); let worst = 0, at = '';
        if (Math.abs(old.D - snap.D) > 0.05) { console.log(`~ ${id} duration ${old.D.toFixed(1)} -> ${snap.D.toFixed(1)}`); changed++; }
        else { old.f.forEach((fr, i) => fr.forEach((q, k) => { const d = Math.hypot(...q.map((v, j) => v - snap.f[i][k][j])); if (d > worst) { worst = d; at = `${KEYS[k]}@${i}`; } }));
          if (worst > 0.015) { console.log(`~ ${id} ${Math.round(worst * 100)} cm (${at})`); changed++; } }
      }
    } catch (e) { console.log('! ' + id + ' ' + e.message.split('\n')[0]); }
    await p.close();
  }
}));
await b.close(); S.srv.close();
console.log(mode === 'save' ? `saved ${ids.length}` : `${changed} changed of ${ids.length}`);
