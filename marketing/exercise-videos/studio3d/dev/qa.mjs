// node dev/qa.mjs <id,id2,...|all> [--lang tr] [--sheet]
// Automatic checks per exercise; writes out/qa/<lang>/<id>.json (+ contact sheet png with --sheet). Exit code 1 on failures.
//  - page errors, missing translations (tr/en/es) for every text field
//  - body below the floor (any joint centre lower than its contact clearance - 2 cm), planted hands/feet not reaching their target (> 1.5 cm)
//  - card text overflow (card taller than 380 px), duration outside 30-60 s
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
let ids = (args[0] || '').split(',');
if (ids[0] === 'all') ids = fs.readdirSync('exercises').filter((f) => f.endsWith('.js') && !f.startsWith('_')).map((f) => f.slice(0, -3)).sort();
const lang = opt('--lang', 'tr'), sheet = args.includes('--sheet');
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
let failed = 0;
fs.mkdirSync(`out/qa/${lang}`, { recursive: true });
for (const id of ids) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  try {
    await p.goto(S.base + `player.html?ex=${id}&lang=${lang}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
  } catch (e) { errors.push('load: ' + e.message); }
  const rep = errors.length ? { errors } : await p.evaluate(() => {
    const tl = FB.getTL(), ex = window.EXERCISE, issues = [];
    // translations
    const walk = (o, path) => {
      if (!o || typeof o !== 'object') return;
      if ('tr' in o || 'en' in o || 'es' in o) { for (const l of ['tr', 'en', 'es']) if (!o[l]) issues.push(`missing ${l} at ${path}`); return; }
      for (const k in o) if (k !== 'poses' && k !== 'ctx' && k !== 'props' && k !== 'rep') walk(o[k], path + '.' + k);
    };
    walk(ex, 'EXERCISE');
    // body/floor + plants over the timeline
    const CL = FB.CLEAR, plant = tl.ctx.plant || {};
    let worstFloor = 0, worstPlant = 0, tFloor = 0, tPlant = 0;
    for (let t = 0; t < tl.DURATION; t += 0.25) {
      const s = tl.solveP(tl.poseAt(t));
      for (const k in s.J) { const base = k.replace(/[LR]$/, ''); const c = Math.min(CL[base] ?? 0.03, { chest: 0.06, waist: 0.06, pelvis: 0.07, neck: 0.05, shoulder: 0.05, head: 0.09 }[base] ?? 1); const pen = c - s.J[k][1]; if (pen > worstFloor) { worstFloor = pen; tFloor = t; } }
      for (const k in plant) {
        let d;
        if (k.startsWith('hand') && s.F['handFlat' + k.slice(-1)]) {       // flat palm: on target horizontally, wrist low enough (arm reaches)
          const a = s.J[k], b = plant[k].at;
          d = Math.max(Math.hypot(a[0] - b[0], a[2] - b[2]), Math.max(0, s.J['wrist' + k.slice(-1)][1] - a[1] - 0.045));
        } else d = FB.V.len(FB.V.sub(s.J[k], plant[k].at));
        if (d > worstPlant) { worstPlant = d; tPlant = t; }
      }
    }
    // limb flips / pops: knees and elbows must not jump (sampled at 30 fps)
    let worstJump = 0, tJump = 0, jn = '', prevS = null;
    for (let t = 0; t < tl.DURATION; t += 1 / 30) {
      const s = tl.solveP(tl.poseAt(t));
      if (prevS) for (const k of ['kneeL', 'kneeR', 'elbowL', 'elbowR', 'handL', 'handR', 'ankleL', 'ankleR']) {
        const d = FB.V.len(FB.V.sub(s.J[k], prevS[k])); if (d > worstJump) { worstJump = d; tJump = t; jn = k; } }
      prevS = s.J;
    }
    if (worstJump > (ex.qaMaxJump || 0.06)) issues.push(`${jn} jumps ${Math.round(worstJump * 100)} cm in one frame at t=${tJump.toFixed(2)} (IK flip / pole change?)`);
    if (worstFloor > 0.02) issues.push(`body ${Math.round(worstFloor * 100)} cm below the floor at t=${tFloor.toFixed(2)}`);
    if (worstPlant > 0.015) issues.push(`planted effector off target by ${Math.round(worstPlant * 100)} cm at t=${tPlant.toFixed(2)} (pose out of reach)`);
    // cards
    let maxCard = 0, tCard = 0;
    for (const c of tl.cards) { const t = (c.t0 + c.t1) / 2; FB.render(t); const el = document.querySelector('#card .card'); if (el && el.offsetHeight > maxCard) { maxCard = el.offsetHeight; tCard = t; } }
    if (maxCard > 380) issues.push(`card too tall (${maxCard}px) at t=${tCard.toFixed(1)}: shorten the text`);
    const maxD = ex.maxDuration || 60; if (tl.DURATION < 30 || tl.DURATION > maxD) issues.push(`duration ${tl.DURATION.toFixed(1)} s outside 30-${maxD} s`);
    return { duration: +tl.DURATION.toFixed(1), worstJumpCm: 0, worstFloorCm: Math.round(worstFloor * 100), worstPlantCm: Math.round(worstPlant * 100), maxCardPx: maxCard, issues };
  });
  rep.errors = errors;
  const ok = !errors.length && !(rep.issues || []).length;
  if (!ok) failed++;
  fs.writeFileSync(`out/qa/${lang}/${id}.json`, JSON.stringify(rep, null, 1));
  console.log(`${ok ? '✓' : '✗'} ${id}  ${ok ? '' : JSON.stringify([...errors, ...(rep.issues || [])])}`);
  if (sheet && !errors.length) {
    const D = rep.duration, files = [];
    for (let i = 0; i < 12; i++) { const t = 0.5 + i * (D - 1) / 11; await p.evaluate((t) => window.render(t), t); const f = `out/qa/${lang}/${id}-${i}.png`; await p.screenshot({ path: f }); files.push(f); }
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
      files.map((_, i) => `[${i}]scale=360:-1[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=12:layout=` + files.map((_, i) => `${(i % 6) * 360}_${Math.floor(i / 6) * 640}`).join('|'), `out/qa/${lang}/${id}.png`]);
    files.forEach((f) => fs.rmSync(f));
  }
  await p.close();
}
await b.close(); S.srv.close();
process.exit(failed ? 1 : 0);
