// node dev/measure.mjs <exerciseId>
// Joint-angle report for every pose (and every mistake pose) to compare with research/specs/*.json.
// Angles follow research/SPEC_FORMAT.md: trunk_from_vertical, hip_flexion (trunk line vs thigh), knee_flexion,
// shin_tilt (= ankle dorsiflexion with the foot flat), elbow_flexion, shoulder_flexion/abduction (upper arm vs trunk).
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const [ex] = process.argv.slice(2);
const S = await serve();
const b = await chromium.launch({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.log('pageerror', e.message));
await p.goto(S.base + `player.html?ex=${ex}`); await p.waitForFunction(() => window.ready, null, { timeout: 30000 });
const out = await p.evaluate(() => {
  const { V } = FB; const tl = FB.getTL(); const ex = window.EXERCISE; const D = 180 / Math.PI;
  const ang = (a, b, c) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.norm(V.sub(a, b)), V.norm(V.sub(c, b)))))) * D;
  const r = (x) => Math.round(x);
  const m = (pose) => {
    const s = tl.solveP(pose), J = s.J, T = s.F.thorax;
    const up = V.norm(V.sub(J.neck, J.pelvis));
    const res = { trunk_from_vertical: r(Math.acos(Math.max(-1, Math.min(1, up[1]))) * D) };
    for (const S of ['L', 'R']) {
      const thigh = V.norm(V.sub(J['knee' + S], J['hip' + S]));
      res['hip_flexion_' + S] = r(Math.acos(Math.max(-1, Math.min(1, V.dot(V.mul(up, -1), thigh)))) * D);
      res['knee_flexion_' + S] = r(180 - ang(J['hip' + S], J['knee' + S], J['ankle' + S]));
      res['thigh_elev_from_floor_' + S] = r(Math.asin(Math.max(-1, Math.min(1, thigh[1]))) * D);   // + = knee above hip (lying leg height)
      res['arm_elev_from_floor_' + S] = r(Math.asin(Math.max(-1, Math.min(1, V.norm(V.sub(J['hand' + S], J['shoulder' + S]))[1]))) * D);
      res['shin_tilt_' + S] = r(Math.acos(Math.max(-1, Math.min(1, V.norm(V.sub(J['knee' + S], J['ankle' + S]))[1]))) * D);
      res['elbow_flexion_' + S] = r(180 - ang(J['shoulder' + S], J['elbow' + S], J['wrist' + S]));
      const ua = V.norm(V.sub(J['elbow' + S], J['shoulder' + S]));
      const fwd = V.dot(ua, T[0]), dn = -V.dot(ua, T[1]), lat = V.dot(ua, T[2]) * (S === 'R' ? 1 : -1);
      res['shoulder_flexion_' + S] = r(Math.atan2(fwd, dn) * D);
      res['shoulder_abduction_' + S] = r(Math.atan2(lat, dn) * D);
      const f = V.norm([J['toe' + S][0] - J['heel' + S][0], 0, J['toe' + S][2] - J['heel' + S][2]]);
      const k = [J['knee' + S][0] - J['ankle' + S][0], 0, J['knee' + S][2] - J['ankle' + S][2]];
      res['knee_vs_foot_line_cm_' + S] = r((-k[0] * f[2] + k[2] * f[0]) * (S === 'R' ? 100 : -100));
      res['heel_toe_hand_y_' + S] = [J['heel' + S][1], J['toe' + S][1], J['hand' + S][1]].map((x) => +x.toFixed(3));
    }
    res.stance_over_shoulder_width = +(Math.abs(J.ankleL[2] - J.ankleR[2]) / Math.abs(J.shoulderL[2] - J.shoulderR[2])).toFixed(2);
    res.lowest_joint_y = +Math.min(...Object.values(J).map((q) => q[1])).toFixed(3);
    return res;
  };
  const o = {};
  for (const n in tl.poses) o[n] = m(tl.poses[n]);
  (ex.mistakes || []).forEach((mk, i) => { const at = mk.at || Object.keys(tl.poses)[1]; o['mistake' + (i + 1) + '@' + at] = m(FB.expand(Object.assign({}, ex.poses[at], mk.pose || {}))); });
  return o;
});
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(22), JSON.stringify(v));
await b.close(); S.srv.close();
