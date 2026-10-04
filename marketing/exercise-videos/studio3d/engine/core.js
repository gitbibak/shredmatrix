/* Full Balance anim engine: 3D skeleton (metres, y up, x = character forward, z = character right)
 * driven by joint angles, with planting (feet/hands stay put) and 2-bone IK.
 * Rendering is flat 2D (see draw.js); the 3D skeleton only gives correct proportions from any camera. */
(function (G) {
  const D2R = Math.PI / 180;
  const V = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: (a) => Math.hypot(a[0], a[1], a[2]),
    norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
    // rotate v about unit axis k by angle a (rad), Rodrigues
    rot: (v, k, a) => {
      const c = Math.cos(a), s = Math.sin(a), d = V.dot(k, v), x = V.cross(k, v);
      return [v[0] * c + x[0] * s + k[0] * d * (1 - c), v[1] * c + x[1] * s + k[1] * d * (1 - c), v[2] * c + x[2] * s + k[2] * d * (1 - c)];
    },
  };

  // 3x3 matrices as arrays of column vectors [X, Y, Z]
  const M = {
    I: () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    apply: (m, v) => [m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2], m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2], m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2]],
    mul: (a, b) => [M.apply(a, b[0]), M.apply(a, b[1]), M.apply(a, b[2])],
    rx: (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [[1, 0, 0], [0, c, s], [0, -s, c]]; },
    ry: (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [[c, 0, -s], [0, 1, 0], [s, 0, c]]; },
    rz: (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [[c, s, 0], [-s, c, 0], [0, 0, 1]]; },
  };

  // Female athletic proportions (m). Standing hip-joint height ~0.88, total ~1.68.
  const BODY = {
    hipHalf: 0.085, thigh: 0.42, shin: 0.41, ankleH: 0.075, heel: 0.055, toe: 0.165,
    lumbar: 0.21, thorax: 0.25, neck: 0.075, headR: 0.108,
    shoulderHalf: 0.17, shoulderDrop: 0.035, upper: 0.285, fore: 0.245, hand: 0.085,
  };

  /* Pose parameters (degrees). Unspecified -> 0. Side-specific keys end in L/R, plain key sets both.
   * trunk: pelvis+trunk lean forward from vertical (90 = prone-horizontal, -90 = supine)
   * roll: lateral body tilt (+ = tips toward the character's LEFT, -z), yaw: whole-body turn (+ = turn to the left)
   * lumbar, thoracic: spine flexion (+ round, - arch); side: lateral bend (+ to right); twist: rotation (+ chest to left)
   * neck: flexion (+ chin down); headTurn
   * hip: flexion (+ thigh forward), abd: abduction, hrot: external rotation (turnout), knee: flexion, ankle: dorsiflexion
   * sh: shoulder flexion (+ forward/up), shAbd: abduction, shRot: bend-plane twist, el: elbow flexion, shrug, protract (m)
   * pos: [x,y,z] root (hip centre) offset added after anchoring
   * ik: { handL:[x,y,z], ... } world-space targets; pole: { handL:[x,y,z] } direction hints */
  const SIDES = ['L', 'R'];
  const get = (p, k, s) => (p[k + s] !== undefined ? p[k + s] : p[k] !== undefined ? p[k] : 0);

  function fk(p) {
    const B = BODY, J = {}, F = {};
    const yaw = p.yaw || 0, roll = p.roll || 0, trunk = p.trunk || 0;
    const Rb = M.mul(M.ry(yaw), M.mul(M.rx(-roll), M.rz(-trunk)));
    const root = [0, 0, 0];
    J.pelvis = root; F.pelvis = Rb;
    const side = p.side || 0, twist = p.twist || 0;
    const Rl = M.mul(Rb, M.mul(M.rz(-(p.lumbar || 0)), M.mul(M.rx(-side / 2), M.ry(twist / 2))));
    J.waist = V.add(root, M.apply(Rl, [0, B.lumbar, 0]));
    const Rt = M.mul(Rl, M.mul(M.rz(-(p.thoracic || 0)), M.mul(M.rx(-side / 2), M.ry(twist / 2))));
    F.thorax = Rt; F.lumbar = Rl;
    J.neck = V.add(J.waist, M.apply(Rt, [0, B.thorax, 0]));
    const Rh = M.mul(Rt, M.mul(M.rz(-(p.neck || 0)), M.ry(p.headTurn || 0)));
    F.head = Rh;
    J.head = V.add(J.neck, M.apply(Rh, [B.headFwd ?? 0.012, B.headUp ?? (B.neck + B.headR * 0.78), 0]));
    J.chest = V.add(J.waist, M.apply(Rt, [0, B.thorax * 0.5, 0]));

    for (const s of SIDES) {
      const sg = s === 'R' ? 1 : -1;
      // ---- leg
      const hipJ = V.add(root, M.apply(Rb, [0, 0, sg * B.hipHalf]));
      const Rthigh = M.mul(Rb, M.mul(M.rz(get(p, 'hip', s)), M.mul(M.rx(-sg * get(p, 'abd', s)), M.ry(-sg * get(p, 'hrot', s)))));
      const knee = V.add(hipJ, M.apply(Rthigh, [0, -B.thigh, 0]));
      const Rshin = M.mul(Rthigh, M.rz(-get(p, 'knee', s)));
      const ankle = V.add(knee, M.apply(Rshin, [0, -B.shin, 0]));
      const Rfoot = M.mul(Rshin, M.mul(M.rz(get(p, 'ankle', s)), M.ry(-sg * get(p, 'footOut', s))));
      J['hip' + s] = hipJ; J['knee' + s] = knee; J['ankle' + s] = ankle;
      F['thigh' + s] = Rthigh; F['shin' + s] = Rshin; F['foot' + s] = Rfoot;
      J['heel' + s] = V.add(ankle, M.apply(Rfoot, [-B.heel, -B.ankleH, 0]));
      J['toe' + s] = V.add(ankle, M.apply(Rfoot, [B.toe, -B.ankleH, 0]));
      J['ball' + s] = V.add(ankle, M.apply(Rfoot, [B.toe * 0.72, -B.ankleH, 0]));
      // ---- arm
      const sh = V.add(J.neck, M.apply(Rt, [(B.shoulderFwd ?? -0.01) + (get(p, 'protract', s) || 0), -B.shoulderDrop + (get(p, 'shrug', s) || 0), sg * B.shoulderHalf]));
      const Rup = M.mul(Rt, M.mul(M.rz(get(p, 'sh', s)), M.rx(-sg * get(p, 'shAbd', s))));
      const u = M.apply(Rup, [0, -1, 0]);
      const elbow = V.add(sh, V.mul(u, B.upper));
      // forearm bends toward the thorax-forward direction projected off the upper arm, twisted by shRot
      let f = M.apply(Rt, p['bend' + s] || p.bend || [1, 0, 0]);
      let b = V.sub(f, V.mul(u, V.dot(f, u)));
      // when the upper arm nearly lines up with the bend reference, blend smoothly toward thorax-up (no sudden flip)
      const lb = V.len(b);
      if (lb < 0.3) {
        const f2 = M.apply(Rt, [0, 1, 0]); let b2 = V.sub(f2, V.mul(u, V.dot(f2, u)));
        if (V.len(b2) > 1e-4) { b2 = V.norm(b2); const w = clamp((lb - 0.12) / 0.18); b = V.add(V.mul(lb > 1e-4 ? V.norm(b) : b2, w), V.mul(b2, 1 - w)); }
      }
      b = V.norm(b);
      b = V.rot(b, u, -sg * get(p, 'shRot', s) * D2R);
      const e = get(p, 'el', s) * D2R;
      const fd = V.add(V.mul(u, Math.cos(e)), V.mul(b, Math.sin(e)));
      const wrist = V.add(elbow, V.mul(fd, B.fore));
      J['shoulder' + s] = sh; J['elbow' + s] = elbow; J['wrist' + s] = wrist;
      J['hand' + s] = V.add(wrist, V.mul(fd, B.hand * 0.55));
      F['arm' + s] = { u, fd, b };
    }
    return { J, F };
  }

  // two-bone IK: returns middle joint; keeps lengths, bends toward pole
  function ik2(a, t, l1, l2, pole) {
    let d = V.sub(t, a); let L = V.len(d);
    // soft reach: approach full extension asymptotically instead of snapping straight at the limit
    const maxL = (l1 + l2) * 0.99995, soft = 0.0004, s0 = maxL - soft;   // 0.4 mm: smooth at the limit, still allows ~4° from straight
    if (L > s0) { const L2 = s0 + soft * (1 - Math.exp(-(L - s0) / soft)); d = V.mul(V.norm(d), L2); L = L2; }
    const minL = Math.abs(l1 - l2) + 1e-4; if (L < minL) { d = V.mul(V.norm(d), minL); L = minL; }
    const dn = V.norm(d);
    let pn = V.sub(pole, V.mul(dn, V.dot(pole, dn)));
    if (V.len(pn) < 1e-6) pn = [0, 1, 0];
    pn = V.norm(pn);
    const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    return { mid: V.add(a, V.add(V.mul(dn, x), V.mul(pn, h))), end: V.add(a, d) };
  }

  // height of the joint centre above the surface when that body part rests on it
  const CLEAR = { heel: 0, toe: 0, ball: 0, ankle: 0.075, hand: 0.03, wrist: 0.03, elbow: 0.04, knee: 0.05, shoulder: 0.07,
    pelvis: 0.1, waist: 0.1, chest: 0.11, neck: 0.07, head: 0.11, hip: 0.1 };
  const clearOf = (name) => { const b = name.replace(/[LR]$/, ''); return CLEAR[b] ?? 0.05; };
  const CONTACT_PTS = ['heelL', 'toeL', 'ballL', 'heelR', 'toeR', 'ballR', 'handL', 'handR', 'kneeL', 'kneeR', 'pelvis', 'shoulderL', 'shoulderR', 'head', 'elbowL', 'elbowR', 'chest'];

  function rotAll(J, F, R, pivot) {
    for (const k in J) J[k] = V.add(pivot, M.apply(R, V.sub(J[k], pivot)));
    for (const k in F) {
      if (Array.isArray(F[k])) F[k] = M.mul(R, F[k]);
      else F[k] = { u: M.apply(R, F[k].u), fd: M.apply(R, F[k].fd), b: M.apply(R, F[k].b) };
    }
  }
  function moveAll(J, d) { for (const k in J) J[k] = V.add(J[k], d); }

  function flatten(J, F, sides) {
    const B = BODY;
    for (const s of SIDES) {
      if (!sides[s]) continue;
      let fw = M.apply(F['foot' + s], [1, 0, 0]); fw = [fw[0], 0, fw[2]];
      if (V.len(fw) < 0.2) { const f2 = M.apply(F['thigh' + s], [1, 0, 0]); fw = [f2[0], 0, f2[2]]; }
      fw = V.norm(fw);
      const up = [0, 1, 0];
      F['foot' + s] = [fw, up, V.cross(fw, up)];
      const ank = J['ankle' + s], Rf = F['foot' + s];
      J['heel' + s] = V.add(ank, M.apply(Rf, [-B.heel, -B.ankleH, 0]));
      J['toe' + s] = V.add(ank, M.apply(Rf, [B.toe, -B.ankleH, 0]));
      J['ball' + s] = V.add(ank, M.apply(Rf, [B.toe * 0.72, -B.ankleH, 0]));
    }
  }

  /* solve(pose, ctx) -> { J, F } joints in world space.
   * pose.ground: [[joint, surfaceY], ...] up to 2 contacts; with 2, the body rotates rigidly (sagittal) so both rest on their surfaces
   *              default: lowest of the CONTACT_PTS rests on y = 0
   * pose.flat:   feet forced flat (default true when standing on feet)
   * ctx.anchorX: joint names whose mean x/z is pinned to ctx.anchorAt ([x, z])
   * ctx.plant:   { ankleL:{at, foot}, handR:{at}, ... } IK-locked effectors (captured from a reference pose) */
  function solve(p, ctx = {}) {
    const B = BODY;
    const yaw = p.yaw || 0;
    const { J, F } = fk(Object.assign({}, p, { yaw: 0 }));
    const flatSides = {};
    for (const s of SIDES) { const shinDir = V.norm(V.sub(J['knee' + s], J['ankle' + s])); flatSides[s] = p['flat' + s] ?? p.flat ?? (shinDir[1] > 0.5); }
    flatten(J, F, flatSides);
    // ground contacts
    // a hand on a support is weight-bearing and flat: the wrist (not the FK finger direction) sets the body height
    const g = (p.ground || ctx.ground || []).map((c) => (typeof c === 'string' ? [c, 0] : c))
      .map(([n, y]) => (/^hand[LR]$/.test(n) && (p['handFlat' + n.slice(-1)] ?? p.handFlat) !== false ? ['wrist' + n.slice(-1), y + 0.042 - CLEAR.wrist] : [n, y]));
    if (g.length >= 2) {
      const [na, ya] = g[0], [nb, yb] = g[1];
      const ca = ya + clearOf(na), cb = yb + clearOf(nb);
      for (let it = 0; it < 4; it++) {
        const A = J[na], Bp = J[nb];
        const w = [Bp[0] - A[0], Bp[1] - A[1]]; const L = Math.hypot(w[0], w[1]);
        const cur = Math.atan2(w[1], w[0]);
        const want = Math.atan2(cb - ca, Math.sign(w[0] || 1) * Math.sqrt(Math.max(1e-6, L * L - (cb - ca) * (cb - ca))));
        rotAll(J, F, M.rz((want - cur) / D2R), A);
        flatten(J, F, flatSides);
      }
      moveAll(J, [0, ca - J[na][1], 0]);
    } else if (g.length === 1) {
      const [na, ya] = g[0]; moveAll(J, [0, ya + clearOf(na) - J[na][1], 0]);
    } else {
      let lo = Infinity, best = null;
      for (const k of CONTACT_PTS) { const h = J[k][1] - clearOf(k); if (h < lo) { lo = h; best = k; } }
      moveAll(J, [0, -lo, 0]);
    }
    if (ctx.floor) moveAll(J, [0, ctx.floor, 0]);
    // horizontal anchor
    const ax = p.anchorX || ctx.anchorX;
    if (ax) {
      let m = [0, 0, 0]; for (const k of ax) m = V.add(m, J[k]); m = V.mul(m, 1 / ax.length);
      const at = ctx.anchorAt || [0, 0];
      moveAll(J, [at[0] - m[0], 0, at[1] - m[2]]);
    }
    if (p.pos) moveAll(J, p.pos);
    // yaw about the anchor
    if (yaw) {
      const piv = ax ? [(ctx.anchorAt || [0, 0])[0], 0, (ctx.anchorAt || [0, 0])[1]] : [J.pelvis[0], 0, J.pelvis[2]];
      rotAll(J, F, M.ry(yaw), piv);
    }
    // planted effectors (world space, already include yaw)
    const plant = Object.assign({}, ctx.plant || {}, p.ik || {});
    // body-relative hand targets: holdL/holdR = [fwd, up, side] from the chest in thorax frame (side mirrored: + = outward)
    for (const s of SIDES) {
      const h = p['hold' + s];
      if (h) { const sg = s === 'R' ? 1 : -1; plant['hand' + s] = { at: V.add(J.chest, M.apply(F.thorax, [h[0], h[1], h[2] * sg])) }; }
    }
    if (p.unplant) for (const k of p.unplant) delete plant[k];
    for (const s of SIDES) {
      const pf = plant['ankle' + s];
      if (pf) {
        const at = pf.at || pf;
        const kneeDir = V.sub(J['knee' + s], V.lerp(J['hip' + s], J['ankle' + s], 0.5));
        const kr = p['kneePole' + s] || p.kneePole, sgk = s === 'R' ? 1 : -1;
        // pole: the FK knee direction once the knee is bent; the thigh's forward axis when (nearly) straight; smooth blend in between
        const kflex = get(p, 'knee', s), wk = clamp((kflex - 4) / 20);
        const kd = V.len(kneeDir) > 1e-4 ? V.norm(kneeDir) : M.apply(F['thigh' + s], [1, 0, 0]);
        const autoPole = V.add(V.mul(kd, wk), V.mul(M.apply(F['thigh' + s], [1, 0, 0]), 1 - wk));
        const pole = kr ? M.apply(F.pelvis, [kr[0], kr[1], kr[2] * sgk]) : ((p.pole && p.pole['knee' + s]) || autoPole);
        const r = ik2(J['hip' + s], at, B.thigh, B.shin, pole);
        J['knee' + s] = r.mid; J['ankle' + s] = r.end;
        const Rf = pf.foot || F['foot' + s];
        F['foot' + s] = Rf;
        J['heel' + s] = V.add(r.end, M.apply(Rf, [-B.heel, -B.ankleH, 0]));
        J['toe' + s] = V.add(r.end, M.apply(Rf, [B.toe, -B.ankleH, 0]));
        J['ball' + s] = V.add(r.end, M.apply(Rf, [B.toe * 0.72, -B.ankleH, 0]));
        const kf0 = V.sub(J['knee' + s], V.lerp(J['hip' + s], J['ankle' + s], 0.5));
        const kf = V.len(kf0) > 0.01 ? kf0 : M.apply(F['thigh' + s], [1, 0, 0]);
        F['shin' + s] = frameFrom(V.sub(J['knee' + s], J['ankle' + s]), kf);
        F['thigh' + s] = frameFrom(V.sub(J['hip' + s], J['knee' + s]), kf);
      }
      const ph = plant['hand' + s];
      if (ph) {
        const at = ph.at || ph;
        const sg = s === 'R' ? 1 : -1;
        const er = p['elbowPole' + s] || p.elbowPole;
        // auto pole: FK bend direction once the elbow is bent; a fixed thorax direction (elbow points back/out) when nearly straight
        const ef = clamp((get(p, 'el', s) - 4) / 20);
        // straight-arm default: elbow points back/out; lying supine, 'back' is the floor, so point it out to the side
        const straightPole = F.thorax[0][1] > 0.3 ? [0.15, -0.2, 1 * sg] : [-1, -0.25, 0.35 * sg];
        const autoE = V.add(V.mul(F['arm' + s].b, -ef), V.mul(M.apply(F.thorax, straightPole), 1 - ef));
        const pole = er ? M.apply(F.thorax, [er[0], er[1], er[2] * sg]) : ((p.pole && p.pole['elbow' + s]) || ph.pole || autoE);
        const usePole = V.len(pole) > 0.02 ? pole : M.apply(F.thorax, [-1, -0.3, sg * 0.6]);
        // weight-bearing hand (on the floor / a bench / a bar it presses on): wrist extended ~90°, palm flat, fingers toward
        // the head side; the arm IK targets the wrist, which sits behind and above the palm centre
        const gc = (p.ground || ctx.ground || []).map((g) => (typeof g === 'string' ? [g, 0] : g)).find((g) => g[0] === 'hand' + s);
        const flatHand = p['handFlat' + s] ?? p.handFlat ?? (!!gc || at[1] < 0.075);
        let r, fd;
        if (flatHand) {
          let hf;
          // supine (chest facing up) and not an explicit contact: a resting hand, fingers continue the reach; otherwise weight-bearing, fingers toward the head
          const resting = !gc && !(p['handFlat' + s] || p.handFlat) && F.thorax[0][1] > 0.3;
          if (!resting) { hf = F.thorax[1]; hf = [hf[0], 0, hf[2]]; if (V.len(hf) < 0.3) { const x = F.thorax[0]; hf = [x[0], 0, x[2]]; } }
          else { const d = V.sub(at, J['shoulder' + s]); hf = [d[0], 0, d[2]]; if (V.len(hf) < 0.05) { const x = F.thorax[0]; hf = [x[0], 0, x[2]]; } }
          hf = V.norm(hf);
          const supY = p['handSurface' + s] ?? p.handSurface ?? (gc ? gc[1] : (at[1] < 0.075 ? 0 : at[1] - CLEAR.hand));
          const palm = [at[0], supY + (supY < 0.02 ? 0.03 : 0.022), at[2]];   // palm centre resting on the support (floor: clears a 1.2 cm mat)
          const wristT = V.add(palm, V.add(V.mul(hf, -B.hand * 0.6), [0, 0.02, 0]));
          r = ik2(J['shoulder' + s], wristT, B.upper, B.fore, usePole);
          fd = V.norm(V.sub(r.end, r.mid));
          J['elbow' + s] = r.mid; J['wrist' + s] = r.end;
          // out of reach (arm too short): the palm follows the wrist instead of detaching from it
          const over = V.len(V.sub(wristT, J['shoulder' + s])) > B.upper + B.fore - 0.003;
          J['hand' + s] = over ? V.add(palm, V.sub(r.end, wristT)) : palm;
        } else {
          r = ik2(J['shoulder' + s], at, B.upper, B.fore + B.hand * 0.4, usePole);
          J['elbow' + s] = r.mid;
          fd = V.norm(V.sub(r.end, r.mid));
          J['wrist' + s] = V.sub(r.end, V.mul(fd, B.hand * 0.4));
          J['hand' + s] = r.end;
        }
        F['handFlat' + s] = flatHand;
        const u = V.norm(V.sub(r.mid, J['shoulder' + s]));
        let b = V.sub(fd, V.mul(u, V.dot(fd, u))); b = V.len(b) > 1e-4 ? V.norm(b) : F['arm' + s].b;
        F['arm' + s] = { u, fd, b };
      }
    }
    // arms resting on the floor beside a lying body are left alone (avoidance would flip between solutions)
    const lyingBody = Math.abs(F.thorax[1][1]) < 0.5;
    for (const s of SIDES) if (p.noAvoid !== true && !(lyingBody && J['hand' + s][1] < 0.08)) avoidTorso(J, F, s);
    return { J, F };
  }

  /* Keep the arm outside the torso: torso = elliptic cylinder around the waist->neck axis (thorax frame).
   * If the upper arm or forearm penetrates it, swivel the elbow about the shoulder->hand axis (hand stays put),
   * preferring the outward direction, by the smallest angle that clears it. */
  const TORSO = { fwd: 0.0, aChest: 0.105, aWaist: 0.09, bChest: 0.138, bWaist: 0.118, rUpper: 0.042, rFore: 0.034 };
  function penetration(J, F, s, elbow) {
    const T = F.thorax, w = J.waist, B = BODY;
    let pen = 0;
    const segs = [[J['shoulder' + s], elbow, TORSO.rUpper, 0.25], [elbow, J['wrist' + s], TORSO.rFore, 0]];
    for (const [a, b, r, t0] of segs) for (let i = 0; i <= 6; i++) {
      const t = t0 + (1 - t0) * i / 6;
      const P = V.lerp(a, b, t), q = V.sub(P, w);
      const x = V.dot(q, T[0]) - TORSO.fwd, y = V.dot(q, T[1]), z = V.dot(q, T[2]);
      if (y < -0.12 || y > B.thorax - 0.02) continue;
      const k = clamp(y / (B.thorax * 0.55));
      const A = TORSO.aWaist + (TORSO.aChest - TORSO.aWaist) * k + r, Bz = TORSO.bWaist + (TORSO.bChest - TORSO.bWaist) * k + r;
      const e = Math.sqrt((x / A) * (x / A) + (z / Bz) * (z / Bz));
      if (e < 1) pen += 1 - e;
    }
    return pen;
  }
  function avoidTorso(J, F, s) {
    const sh = J['shoulder' + s], hd = J['wrist' + s], el = J['elbow' + s];
    if (penetration(J, F, s, el) <= 0) return;
    const ax = V.norm(V.sub(hd, sh));
    const base = V.sub(el, sh);
    const sg = s === 'R' ? 1 : -1;
    const out = V.mul(F.thorax[2], sg);
    const at = (deg) => V.add(sh, V.rot(base, ax, deg * D2R));
    const search = (dir) => { let prevPen = penetration(J, F, s, el); for (let d = 1; d <= 140; d++) { const pen = penetration(J, F, s, at(dir * d)); if (pen <= 0) { const f = prevPen / Math.max(1e-6, prevPen - pen); return { d: dir * (d - 1 + Math.min(1, f)), ok: true }; } prevPen = pen; } return { d: dir * 140, ok: false }; };
    // outward = the swivel sign that increases the lateral distance first
    const outSign = V.dot(V.sub(at(5), el), out) >= 0 ? 1 : -1;
    const r1 = search(outSign), r2 = search(-outSign);
    // smallest swivel wins; the outward direction gets a 20 deg bias so the choice does not flicker
    // both clear: keep the elbow low (gravity); 4 cm hysteresis toward the outward side
    // upright: the lower elbow wins (gravity). Lying: the smaller swivel wins (continuity), never an elbow below the floor
    const lying = Math.abs(F.thorax[1][1]) < 0.5;
    const below = (r) => at(r.d)[1] < 0.035;
    let r = !r1.ok ? r2 : !r2.ok ? r1
      : below(r1) !== below(r2) ? (below(r1) ? r2 : r1)
      : lying ? (Math.abs(r1.d) <= Math.abs(r2.d) + 10 ? r1 : r2)
      : (at(r1.d)[1] <= at(r2.d)[1] + 0.04 ? r1 : r2);
    const ne = at(r.d);
    J['elbow' + s] = ne;
    const u = V.norm(V.sub(ne, sh)), fd = V.norm(V.sub(hd, ne));
    let b = V.sub(fd, V.mul(u, V.dot(fd, u))); b = V.len(b) > 1e-4 ? V.norm(b) : F['arm' + s].b;
    F['arm' + s] = { u, fd, b };
  }

  // capture plants from a solved reference pose
  function capturePlant(sol, which) {
    const out = {};
    for (const k of which) {
      if (k.startsWith('ankle')) out[k] = { at: sol.J[k].slice(), foot: sol.F['foot' + k.slice(-1)].map((c) => c.slice()) };
      else out[k] = { at: sol.J[k].slice() };
    }
    return out;
  }

  function frameFrom(up, fwd) {
    const y = V.norm(up); let x = V.sub(fwd, V.mul(y, V.dot(fwd, y)));
    x = V.len(x) < 1e-5 ? [1, 0, 0] : V.norm(x);
    const z = V.cross(x, y);
    return [x, y, z];
  }

  // ---------- pose interpolation ----------
  function lerpPose(a, b, t) {
    const out = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const va = a[k], vb = b[k];
      if (typeof va === 'number' || typeof vb === 'number') {
        const x = typeof va === 'number' ? va : (typeof vb === 'number' ? baseVal(a, k) : 0);
        const y = typeof vb === 'number' ? vb : baseVal(b, k);
        out[k] = x + (y - x) * t;
      } else if (Array.isArray(va) || Array.isArray(vb)) {
        const x = va || vb, y = vb || va;
        out[k] = lerpArr(x, y, t);
      } else if (va && vb && typeof va === 'object' && typeof vb === 'object') {
        out[k] = lerpPose(va, vb, t);
      } else out[k] = t < 0.5 ? (va !== undefined ? va : vb) : (vb !== undefined ? vb : va);
    }
    return out;
  }
  // arrays (also nested, e.g. foot frames) blend element-wise into NEW arrays (never shares or mutates pose data)
  function lerpArr(x, y, t) {
    return x.map((v, i) => {
      const w = y ? y[i] : v;
      if (typeof v === 'number') return v + ((typeof w === 'number' ? w : v) - v) * t;
      if (Array.isArray(v)) return lerpArr(v, Array.isArray(w) ? w : v, t);
      if (v && typeof v === 'object') return lerpPose(v, w && typeof w === 'object' ? w : v, t);
      return t < 0.5 ? v : w;
    });
  }
  // value of side-specific key falls back to the plain key
  function baseVal(p, k) {
    const m = /^(.*)([LR])$/.exec(k);
    if (m && typeof p[m[1]] === 'number') return p[m[1]];
    return 0;
  }
  // expand plain keys into L/R so interpolation between "hip" and "hipL" works
  const SIDED = ['hip', 'abd', 'hrot', 'knee', 'ankle', 'footOut', 'sh', 'shAbd', 'shRot', 'el', 'shrug', 'protract'];
  function expand(p) {
    const o = Object.assign({}, p);
    for (const k of SIDED) if (typeof o[k] === 'number') { for (const s of SIDES) if (o[k + s] === undefined) o[k + s] = o[k]; delete o[k]; }
    return o;
  }

  const EASE = {
    linear: (t) => t,
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outBack: (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  G.FB = Object.assign(G.FB || {}, { V, M, BODY, fk, solve, capturePlant, CLEAR, ik2, lerpPose, expand, EASE, clamp, D2R, frameFrom });
})(typeof window !== 'undefined' ? window : globalThis);
