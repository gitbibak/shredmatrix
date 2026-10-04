/* Equipment as 3D primitives, rendered by body3d.js.
 * Each prop: (sol, opts) -> [{ t:'cyl', a, b, r, m } | { t:'box', c, s:[x,y,z], m, R? } | { t:'sph', c, r, m } | { t:'tube', pts, r, m }]
 * m = material key: iron chrome pad frame wood mat matEdge band rubber */
(function (G) {
  const { V, M } = G.FB;

  const handAxis = (sol, s, mode) => {
    const fd = sol.F['arm' + s].fd;
    let ref = mode === 'neutral' ? M.apply(sol.F.thorax, [1, 0, 0]) : M.apply(sol.F.thorax, [0, 0, 1]);
    if (mode === 'neutral' && Math.abs(V.dot(ref, fd)) > 0.8) ref = M.apply(sol.F.thorax, [0, 1, 0]);
    return V.norm(V.sub(ref, V.mul(fd, V.dot(ref, fd))));
  };

  function dumbbellAt(c, ax, len = 0.3, headR = 0.052) {
    const h = len / 2, hw = 0.07;
    return [
      { t: 'cyl', a: V.add(c, V.mul(ax, -h + hw)), b: V.add(c, V.mul(ax, h - hw)), r: 0.015, m: 'chrome' },
      { t: 'cyl', a: V.add(c, V.mul(ax, -h)), b: V.add(c, V.mul(ax, -h + hw)), r: headR, m: 'iron', seg: 6 },
      { t: 'cyl', a: V.add(c, V.mul(ax, h - hw)), b: V.add(c, V.mul(ax, h)), r: headR, m: 'iron', seg: 6 },
    ];
  }

  const P = {
    dumbbell(sol, o = {}) {
      const out = [];
      for (const s of o.sides || ['L', 'R']) {
        const ax = handAxis(sol, s, o.grip || 'neutral');
        out.push(...dumbbellAt(sol.J['hand' + s], ax, o.len || 0.3, o.headR || 0.052));
        sol.grip = sol.grip || {}; sol.grip[s] = ax; sol.gripKind = o.grip === 'lateral' || o.grip === 'supinated' ? 'supinated' : o.grip === 'pronated' ? 'pronated' : 'neutral';
      }
      return out;
    },
    goblet(sol, o = {}) {
      const c = V.lerp(sol.J.handL, sol.J.handR, 0.5);
      const fwd = M.apply(sol.F.thorax, [1, 0, 0]);
      const top = V.add(c, V.add([0, 0.03, 0], V.mul(fwd, 0.02)));
      sol.grip = { L: [0, 1, 0], R: [0, 1, 0], cup: true }; sol.gripKind = 'cup';
      return dumbbellAt(V.add(top, [0, -0.11, 0]), [0, 1, 0], 0.3, 0.058);
    },
    kettlebell(sol, o = {}) {
      const c = o.both ? V.lerp(sol.J.handL, sol.J.handR, 0.5) : sol.J['hand' + (o.side || 'R')];
      const bell = V.add(c, [0, -0.15, 0]);
      sol.grip = o.both ? { L: [0, 0, 1], R: [0, 0, 1] } : { [o.side || 'R']: [0, 0, 1] }; sol.gripKind = 'pronated';
      return [{ t: 'sph', c: bell, r: 0.1, m: 'iron' }, { t: 'tube', pts: [V.add(c, [0, -0.07, -0.06]), V.add(c, [0, 0.01, -0.05]), V.add(c, [0, 0.025, 0]), V.add(c, [0, 0.01, 0.05]), V.add(c, [0, -0.07, 0.06])], r: 0.013, m: 'iron' }];
    },
    barbell(sol, o = {}) {
      const c = V.lerp(sol.J.handL, sol.J.handR, 0.5);
      const half = 0.95, sleeve = 0.72, pr = o.plateR || 0.225;
      const out = [{ t: 'cyl', a: V.add(c, [0, 0, -half]), b: V.add(c, [0, 0, half]), r: 0.014, m: 'chrome' }];
      for (const sg of [-1, 1]) {
        out.push({ t: 'cyl', a: V.add(c, [0, 0, sg * sleeve]), b: V.add(c, [0, 0, sg * (sleeve + 0.05)]), r: pr, m: 'plate' });
        out.push({ t: 'cyl', a: V.add(c, [0, 0, sg * (sleeve - 0.025)]), b: V.add(c, [0, 0, sg * sleeve]), r: 0.03, m: 'chrome' });
      }
      sol.grip = { L: [0, 0, 1], R: [0, 0, 1] }; sol.gripKind = o.grip || 'pronated';
      return out;
    },
    mat(sol, o = {}) {
      const L = o.length || 1.85, W = o.width || 0.62, c = o.at || [0, 0, 0];
      return [{ t: 'box', c: [c[0], 0.006, c[2]], s: [L, 0.012, W], m: 'mat', round: 0.006 }];
    },
    bench(sol, o = {}) {
      const c = o.at || [0, 0, 0], L = o.length || 1.2, W = o.width || 0.3, H = o.height || 0.45;
      const out = [{ t: 'box', c: V.add(c, [0, H - 0.045, 0]), s: [L, 0.09, W], m: 'pad', round: 0.02 }];
      for (const dx of [-L / 2 + 0.14, L / 2 - 0.14]) {
        out.push({ t: 'box', c: V.add(c, [dx, (H - 0.09) / 2, 0]), s: [0.06, H - 0.09, 0.06], m: 'frame' });
        out.push({ t: 'box', c: V.add(c, [dx, 0.02, 0]), s: [0.08, 0.04, W + 0.12], m: 'frame' });
      }
      return out;
    },
    box(sol, o = {}) {
      const c = o.at || [0.5, 0, 0], s = o.size || [0.5, 0.5, 0.5];
      return [{ t: 'box', c: V.add(c, [0, s[1] / 2, 0]), s, m: o.mat || 'wood', round: 0.015 }];
    },
    wall(sol, o = {}) {
      const x = o.x ?? -0.4;
      return [{ t: 'box', c: [x - 0.05, 1.3, 0], s: [0.1, 2.6, 2.6], m: 'wall' }];
    },
    pullupBar(sol, o = {}) {
      const y = o.y ?? 2.25, x = o.x ?? 0;
      return [{ t: 'cyl', a: [x, y, -0.75], b: [x, y, 0.75], r: 0.018, m: 'chrome' },
        { t: 'box', c: [x - 0.04, y / 2, -0.75], s: [0.07, y, 0.07], m: 'frame' }, { t: 'box', c: [x - 0.04, y / 2, 0.75], s: [0.07, y, 0.07], m: 'frame' }];
    },
    band(sol, o = {}) {
      const out = [];
      for (const s of o.sides || ['R']) {
        const a = o.from ? (typeof o.from === 'function' ? o.from(sol, s) : o.from) : sol.J['ball' + s];
        out.push({ t: 'tube', pts: [a, sol.J['hand' + s]], r: 0.007, m: 'band' });
      }
      return out;
    },
    cable(sol, o = {}) {
      const x = o.x ?? 0.9, y = o.y ?? 0.2;
      const h = o.both ? V.lerp(sol.J.handL, sol.J.handR, 0.5) : sol.J['hand' + (o.side || 'R')];
      return [{ t: 'box', c: [x + 0.14, 1.1, 0], s: [0.18, 2.2, 0.5], m: 'frame' }, { t: 'sph', c: [x, y, 0], r: 0.035, m: 'iron' }, { t: 'tube', pts: [[x, y, 0], h], r: 0.004, m: 'chrome' }];
    },
  };

  // ---------- studio / yoga / pilates props ----------
  const at = (o, d) => (typeof o.at === 'function' ? o.at : null) || (() => o.at || d);
  P.block = (sol, o = {}) => { const c = at(o, [0.4, 0, 0])(sol); return [{ t: 'box', c: V.add(c, [0, 0.04, 0]), s: o.size || [0.23, 0.08, 0.15], m: 'foam', round: 0.01 }]; };
  P.bolster = (sol, o = {}) => { const c = at(o, [0, 0.11, 0])(sol); const h = (o.length || 0.62) / 2; const ax = o.axis || [0, 0, 1];
    return [{ t: 'cyl', a: V.add(c, V.mul(ax, -h)), b: V.add(c, V.mul(ax, h)), r: o.r || 0.11, m: 'bolster' }]; };
  P.blanket = (sol, o = {}) => { const c = at(o, [0, 0, 0])(sol); return [{ t: 'box', c: V.add(c, [0, 0.03, 0]), s: o.size || [0.5, 0.06, 0.36], m: 'blanket', round: 0.02 }]; };
  P.foamRoller = (sol, o = {}) => { const c = at(o, [0, 0.075, 0])(sol); const h = (o.length || 0.9) / 2; const ax = o.axis || [0, 0, 1];
    return [{ t: 'cyl', a: V.add(c, V.mul(ax, -h)), b: V.add(c, V.mul(ax, h)), r: 0.075, m: 'foam' }]; };
  P.ball = (sol, o = {}) => { const c = at(o, [0, 0.11, 0])(sol); return [{ t: 'sph', c, r: o.r || 0.11, m: o.mat || 'ballSoft' }]; };
  // pilates ring held between two joints (hands, knees or ankles)
  P.ring = (sol, o = {}) => { const [ja, jb] = o.between || ['handL', 'handR']; return [{ t: 'torus', a: sol.J[ja], b: sol.J[jb], r: 0.019, m: 'ring' }]; };
  // yoga strap: open tube through the listed points (joints or world points)
  P.strap = (sol, o = {}) => [{ t: 'tube', pts: (o.through || ['handL', 'ballL']).map((q) => (typeof q === 'string' ? sol.J[q] : q)), r: 0.012, m: 'strapMat' }];
  P.pole = (sol, o = {}) => { const c = at(o, [0.4, 0, 0])(sol); return [{ t: 'cyl', a: c, b: V.add(c, [0, o.height || 1.4, 0]), r: 0.014, m: 'wood' }]; };
  P.step = (sol, o = {}) => { const c = at(o, [0.4, 0, 0])(sol); const s = o.size || [0.4, 0.2, 0.7]; return [{ t: 'box', c: V.add(c, [0, s[1] / 2, 0]), s, m: 'pad', round: 0.02 }]; };
  P.rack = (sol, o = {}) => { const x = o.x ?? -0.15, y = o.hook ?? 1.35, w = 0.62;
    const out = [];
    for (const z of [-w, w]) { out.push({ t: 'box', c: [x, 1.1, z], s: [0.07, 2.2, 0.07], m: 'frame' }); out.push({ t: 'box', c: [x + 0.06, y, z], s: [0.12, 0.04, 0.06], m: 'iron' }); out.push({ t: 'box', c: [x, 0.02, z], s: [0.6, 0.04, 0.09], m: 'frame' }); }
    return out; };
  // bench with a tilting back pad (incline/decline): o.incline deg, pad pivots at o.at
  P.inclineBench = (sol, o = {}) => { const c = o.at || [0, 0, 0], H = o.height || 0.45, a = (o.incline ?? 30) * Math.PI / 180, L = o.length || 0.9;
    const R = [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
    const mid = V.add(c, [-Math.cos(a) * L / 2, H + Math.sin(a) * L / 2, 0]);
    return [{ t: 'box', c: mid, s: [L, 0.08, 0.3], m: 'pad', R, round: 0.02 }, { t: 'box', c: V.add(c, [0.25, H - 0.04, 0]), s: [0.5, 0.08, 0.3], m: 'pad', round: 0.02 },
      { t: 'box', c: V.add(c, [-0.1, H / 2 - 0.04, 0]), s: [0.08, H - 0.08, 0.08], m: 'frame' }, { t: 'box', c: V.add(c, [-0.2, 0.02, 0]), s: [1.0, 0.04, 0.4], m: 'frame' }];
  };
  /* Reformer. Frame along +x (front = footbar end). o.carriage(sol) -> carriage centre x (default follows the pelvis),
   * o.footbar (bool, default true), o.straps: ['handL','handR'] or ['ankleL',...] ropes to the rear risers, o.springs (count),
   * o.box: 'short' | 'long' sitting on the carriage. Carriage top height = FB.REFORMER.top (use it in pose.ground). */
  const REF = { x0: -1.25, x1: 1.15, top: 0.38, w: 0.66, footbarX: 1.0, footbarH: 0.36 };
  P.reformer = (sol, o = {}) => {
    const out = [], z = REF.w / 2;
    const cx = o.carriage ? o.carriage(sol) : sol.J.pelvis[0] + (o.offset || 0);
    for (const sz of [-z, z]) out.push({ t: 'box', c: [(REF.x0 + REF.x1) / 2, REF.top - 0.13, sz], s: [REF.x1 - REF.x0, 0.07, 0.06], m: 'woodDark', round: 0.01 });
    for (const x of [REF.x0 + 0.05, REF.x1 - 0.05]) for (const sz of [-z, z]) out.push({ t: 'box', c: [x, (REF.top - 0.16) / 2, sz], s: [0.06, REF.top - 0.16, 0.06], m: 'woodDark' });
    out.push({ t: 'box', c: [REF.x1 - 0.03, REF.top - 0.13, 0], s: [0.06, 0.07, REF.w], m: 'woodDark' });
    out.push({ t: 'box', c: [REF.x0 + 0.03, REF.top - 0.13, 0], s: [0.06, 0.07, REF.w], m: 'woodDark' });
    // carriage + headrest + shoulder blocks
    out.push({ t: 'box', c: [cx, REF.top - 0.04, 0], s: [0.78, 0.08, REF.w - 0.08], m: 'pad', round: 0.025 });
    out.push({ t: 'box', c: [cx - 0.52, REF.top - 0.02, 0], s: [0.25, 0.07, 0.28], m: 'pad', round: 0.025 });   // headrest
    for (const sz of [-0.13, 0.13]) out.push({ t: 'box', c: [cx - 0.33, REF.top + 0.06, sz], s: [0.08, 0.13, 0.08], m: 'pad', round: 0.02 });
    // springs from carriage front to the footbar end
    const ns = o.springs ?? 3;
    for (let i = 0; i < ns; i++) { const sz = -0.12 + (0.24 * i) / Math.max(1, ns - 1); out.push({ t: 'cyl', a: [cx + 0.39, REF.top - 0.1, sz], b: [REF.x1 - 0.06, REF.top - 0.1, sz], r: 0.008, m: i % 2 ? 'springB' : 'springA' }); }
    if (o.footbar !== false) { const fx = o.footbarX ?? REF.footbarX, fh = REF.top + (o.footbarH ?? REF.footbarH);
      out.push({ t: 'cyl', a: [fx, fh, -z], b: [fx, fh, z], r: 0.022, m: 'pad' });
      for (const sz of [-z, z]) out.push({ t: 'cyl', a: [fx, fh, sz], b: [REF.x1 - 0.06, REF.top - 0.13, sz], r: 0.016, m: 'chrome' }); }
    // rear risers + ropes/straps
    const rx = REF.x0 + 0.02, rh = REF.top + 0.42;
    for (const sz of [-z, z]) out.push({ t: 'cyl', a: [rx, REF.top - 0.13, sz], b: [rx, rh, sz], r: 0.018, m: 'chrome' });
    for (const j of (o.straps || [])) { const side = sol.J[j][2] < 0 ? -z : z; out.push({ t: 'tube', pts: [[rx, rh, side], sol.J[j]], r: 0.005, m: 'rope' }); }
    // jump board: vertical padded board at the foot end (replaces the footbar for jumping work)
    if (o.jumpBoard) { const jx = o.jumpBoardX ?? (REF.x1 - 0.03);
      out.push({ t: 'box', c: [jx, REF.top + 0.3, 0], s: [0.05, 0.62, REF.w + 0.06], m: 'pad', round: 0.02 });
      for (const sz of [-z, z]) out.push({ t: 'box', c: [jx + 0.04, REF.top + 0.05, sz], s: [0.06, 0.2, 0.05], m: 'frame' }); }
    // standing platform at the foot end (for standing work: scooter, side splits, standing lunge)
    if (o.platform) out.push({ t: 'box', c: [REF.x1 - 0.2, REF.top - 0.035, 0], s: [0.36, 0.07, REF.w], m: 'pad', round: 0.02 });
    if (o.box) { const L = o.box === 'long' ? 0.85 : 0.6; out.push({ t: 'box', c: [cx + (o.boxOffset || 0), REF.top + 0.17, 0], s: [L, 0.3, 0.42], m: 'woodLight', round: 0.02 }); }
    return out;
  };
  /* Wunda chair: seat box at o.at, pedal hinged at the front bottom; pedal end follows o.follow joint (foot/hand) or o.pedal deg */
  P.wundaChair = (sol, o = {}) => {
    const c = o.at || [0.45, 0, 0], H = 0.62, D = 0.6, W = 0.6;
    const out = [{ t: 'box', c: V.add(c, [0, H / 2, 0]), s: [D, H, W], m: 'woodLight', round: 0.02 }, { t: 'box', c: V.add(c, [0, H + 0.03, 0]), s: [D, 0.06, W], m: 'pad', round: 0.02 }];
    const hinge = V.add(c, [-D / 2 - 0.02, 0.08, 0]);
    let a = (o.pedal ?? 35) * Math.PI / 180;
    if (o.follow) { const q = sol.J[o.follow]; a = Math.atan2(Math.max(0.02, q[1] - hinge[1]), Math.max(0.05, hinge[0] - q[0])); }
    const end = V.add(hinge, [-Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0]);
    out.push({ t: 'cyl', a: V.add(hinge, [0, 0, -W / 2 + 0.05]), b: V.add(hinge, [0, 0, W / 2 - 0.05]), r: 0.02, m: 'chrome' });
    out.push({ t: 'cyl', a: V.add(end, [0, 0, -W / 2 + 0.05]), b: V.add(end, [0, 0, W / 2 - 0.05]), r: 0.03, m: 'pad' });
    for (const sz of [-W / 2 + 0.05, W / 2 - 0.05]) out.push({ t: 'cyl', a: V.add(hinge, [0, 0, sz]), b: V.add(end, [0, 0, sz]), r: 0.014, m: 'chrome' });
    return out;
  };
  P.REFORMER = REF;

  // ---------- gym machines (fixed frame at o.at = seat/pad reference; moving part follows the body) ----------
  const D2R = Math.PI / 180;
  const rotZ = (deg) => { const a = deg * D2R; return [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]]; };
  const mid = (sol, a, b) => V.lerp(sol.J[a], sol.J[b], 0.5);
  const stack = (x, z = 0, h = 1.9) => [
    { t: 'box', c: [x, h / 2, z], s: [0.3, h, 0.42], m: 'frameDark', round: 0.01 },
    { t: 'box', c: [x + 0.16, 0.45, z], s: [0.03, 0.7, 0.32], m: 'plate' },
    { t: 'cyl', a: [x + 0.16, 0.12, z - 0.1], b: [x + 0.16, h - 0.1, z - 0.1], r: 0.012, m: 'chrome' },
    { t: 'cyl', a: [x + 0.16, 0.12, z + 0.1], b: [x + 0.16, h - 0.1, z + 0.1], r: 0.012, m: 'chrome' }];
  const seat = (c, H = 0.45, L = 0.42, W = 0.38) => [
    { t: 'box', c: V.add(c, [0, H - 0.04, 0]), s: [L, 0.08, W], m: 'pad', round: 0.02 },
    { t: 'box', c: V.add(c, [0, (H - 0.08) / 2, 0]), s: [0.08, H - 0.08, 0.08], m: 'frame' },
    { t: 'box', c: V.add(c, [0, 0.02, 0]), s: [0.6, 0.04, 0.5], m: 'frame' }];
  const back = (c, H, deg, len = 0.65) => { const R = rotZ(-deg); const up = M.apply(R, [0, 1, 0]);
    return [{ t: 'box', c: V.add(V.add(c, [-0.24, H, 0]), V.mul(up, len / 2)), s: [0.08, len, 0.36], m: 'pad', R, round: 0.02 }]; };
  // sled leg press: seat at o.at, back reclined o.back deg, rails at o.rail deg; the platform follows the feet
  P.legPress = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], th = (o.rail ?? 45) * D2R, u = [Math.cos(th), Math.sin(th), 0];
    const f = mid(sol, 'ballL', 'ballR');
    const out = [...seat(c, o.seatH ?? 0.42, 0.45, 0.42), ...back(c, o.seatH ?? 0.42, o.back ?? 50, 0.7)];
    const base = V.add(c, [0.35, 0.25, 0]);
    for (const z of [-0.33, 0.33]) out.push({ t: 'cyl', a: V.add(base, [0, 0, z]), b: V.add(base, [u[0] * 1.6, u[1] * 1.6, z]), r: 0.03, m: 'frame' });
    out.push({ t: 'box', c: V.add(V.add(c, [0.9, 0.12, 0]), [0, 0, 0]), s: [1.4, 0.06, 0.8], m: 'frame' });
    const pc = V.add([f[0], f[1], 0], V.mul(u, 0.05));
    out.push({ t: 'box', c: pc, s: [0.06, 0.62, 0.72], m: 'frameDark', R: rotZ(o.rail ?? 45), round: 0.01 });
    for (const z of [-0.42, 0.42]) out.push({ t: 'cyl', a: V.add(pc, [0.08, 0.05, z * 0.85]), b: V.add(pc, [0.08, 0.05, z * 1.25]), r: 0.16, m: 'plate' });
    return out;
  };
  // hack squat: the back pad and shoulder pads ride with the trunk along fixed rails; angled foot platform at o.at
  P.hackSquat = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], T = sol.F.thorax, th = (o.rail ?? 65) * D2R, u = [-Math.cos(th), Math.sin(th), 0];
    const out = [{ t: 'box', c: V.add(c, [0.05, 0.06, 0]), s: [0.55, 0.06, 0.75], m: 'frameDark', R: rotZ(15), round: 0.01 }];
    const r0 = V.add(c, [-0.15, 0.1, 0]);
    for (const z of [-0.36, 0.36]) out.push({ t: 'cyl', a: V.add(r0, [0, 0, z]), b: V.add(r0, [u[0] * 2.1, u[1] * 2.1, z]), r: 0.035, m: 'frame' });
    const pad = V.add(V.lerp(sol.J.pelvis, sol.J.neck, 0.55), M.apply(T, [-0.15, 0, 0]));
    out.push({ t: 'box', c: pad, s: [0.08, 0.7, 0.4], m: 'pad', R: [T[0], T[1], T[2]], round: 0.02 });
    for (const s of ['L', 'R']) out.push({ t: 'box', c: V.add(sol.J['shoulder' + s], M.apply(T, [-0.02, 0.07, 0])), s: [0.16, 0.07, 0.12], m: 'pad', R: [T[0], T[1], T[2]], round: 0.025 });
    return out;
  };
  // lying leg curl: angled bench under the trunk/hips (o.at = knee end of the pad, o.height), roller pad behind the ankles
  P.legCurl = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.height ?? 0.55, L = o.length ?? 1.25;
    const out = [{ t: 'box', c: V.add(c, [-L / 2, H, 0]), s: [L, 0.09, 0.34], m: 'pad', R: rotZ(o.tilt ?? 6), round: 0.025 },
      { t: 'box', c: V.add(c, [-L / 2, H / 2 - 0.05, 0]), s: [0.08, H - 0.1, 0.08], m: 'frame' }, { t: 'box', c: V.add(c, [-L / 2, 0.02, 0]), s: [L, 0.04, 0.5], m: 'frame' },
      ...stack(c[0] + 0.55, 0, 1.4)];
    const ank = mid(sol, 'ankleL', 'ankleR'), sh = V.norm(V.sub(mid(sol, 'ankleL', 'ankleR'), mid(sol, 'kneeL', 'kneeR')));
    const back = V.norm(V.cross([0, 0, 1], sh)); // perpendicular to the shin in the sagittal plane
    const roll = V.add(ank, V.mul(back[1] > 0 ? back : V.mul(back, -1), 0.075));
    out.push({ t: 'cyl', a: V.add(roll, [0, 0, -0.2]), b: V.add(roll, [0, 0, 0.2]), r: 0.05, m: 'pad' });
    const piv = V.add(mid(sol, 'kneeL', 'kneeR'), [0, 0, 0.26]);
    out.push({ t: 'cyl', a: piv, b: V.add(roll, [0, 0, 0.22]), r: 0.02, m: 'frame' }, { t: 'sph', c: piv, r: 0.04, m: 'frameDark' });
    return out;
  };
  // leg extension: seat + backrest at o.at, roller in front of the ankles on a lever from the knee axis
  P.legExtension = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.seatH ?? 0.5;
    const out = [...seat(c, H, 0.5, 0.42), ...back(c, H, o.back ?? 10, 0.62), ...stack(c[0] - 0.6, 0, 1.5)];
    const ank = mid(sol, 'ankleL', 'ankleR'), sh = V.norm(V.sub(ank, mid(sol, 'kneeL', 'kneeR')));
    let fwd = V.norm(V.cross(sh, [0, 0, 1])); if (fwd[0] < 0) fwd = V.mul(fwd, -1);
    const roll = V.add(ank, V.mul(fwd, 0.07));
    out.push({ t: 'cyl', a: V.add(roll, [0, 0, -0.2]), b: V.add(roll, [0, 0, 0.2]), r: 0.05, m: 'pad' });
    const piv = V.add(mid(sol, 'kneeL', 'kneeR'), [0, 0, 0.27]);
    out.push({ t: 'cyl', a: piv, b: V.add(roll, [0, 0, 0.22]), r: 0.02, m: 'frame' }, { t: 'sph', c: piv, r: 0.045, m: 'frameDark' });
    return out;
  };
  // seated calf raise: seat at o.at, knee pad resting on the thighs just above the knees, foot block under the balls of the feet
  P.seatedCalf = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.seatH ?? 0.45;
    const out = [...seat(c, H, 0.42, 0.42)];
    const k = mid(sol, 'kneeL', 'kneeR'), b = mid(sol, 'ballL', 'ballR');
    out.push({ t: 'box', c: V.add(k, [-0.06, 0.1, 0]), s: [0.14, 0.07, 0.44], m: 'pad', round: 0.025 });
    out.push({ t: 'cyl', a: V.add(k, [-0.06, 0.12, 0.25]), b: [c[0] + 0.55, 0.3, 0.25], r: 0.02, m: 'frame' });
    out.push({ t: 'box', c: [b[0] + 0.02, 0.05, 0], s: [0.22, 0.1, 0.5], m: 'frameDark', round: 0.01 });
    return out;
  };
  // lat pulldown: seat at o.at, thigh pad above the knees, high pulley, cable to a long bar held by both hands
  P.latPulldown = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.seatH ?? 0.48, top = o.top ?? 2.35;
    const out = [...seat(c, H, 0.42, 0.42), ...stack(c[0] - 0.55, 0, top)];
    out.push({ t: 'cyl', a: [c[0] + 0.32, H + 0.2, -0.22], b: [c[0] + 0.32, H + 0.2, 0.22], r: 0.05, m: 'pad' });
    out.push({ t: 'box', c: [c[0] - 0.2, top - 0.02, 0], s: [0.9, 0.06, 0.08], m: 'frame' });
    const pul = [c[0] + 0.12, top - 0.08, 0];
    out.push({ t: 'sph', c: pul, r: 0.05, m: 'frameDark' });
    const h = mid(sol, 'handL', 'handR');
    out.push({ t: 'tube', pts: [pul, h], r: 0.004, m: 'chrome' });
    const ext = Math.max(0.12, (1.2 - Math.abs(sol.J.handR[2] - sol.J.handL[2])) / 2);
    out.push({ t: 'tube', pts: [V.add(sol.J.handL, [0, -0.04, -ext]), V.add(sol.J.handL, [0, 0, 0]), V.add(sol.J.handR, [0, 0, 0]), V.add(sol.J.handR, [0, -0.04, ext])], r: 0.014, m: 'chrome' });
    sol.grip = { L: [0, 0, 1], R: [0, 0, 1] }; sol.gripKind = 'pronated';
    return out;
  };
  // reverse pec deck: seat at o.at, chest pad in front of the trunk, two arms hanging from a pivot above the pad to the handles
  P.pecDeck = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.seatH ?? 0.48;
    const out = [...seat(c, H, 0.4, 0.4)];
    const T = sol.F.thorax;
    out.push({ t: 'box', c: V.add(sol.J.chest, M.apply(T, [0.17, -0.02, 0])), s: [0.08, 0.5, 0.32], m: 'pad', R: [T[0], T[1], T[2]], round: 0.02 });
    const piv = o.pivot || [c[0] + 0.45, 1.65, 0];
    out.push({ t: 'box', c: [piv[0] + 0.12, piv[1] / 2, 0], s: [0.12, piv[1], 0.12], m: 'frame' });
    for (const s of ['L', 'R']) { const hd = sol.J['hand' + s]; out.push({ t: 'tube', pts: [piv, V.add(hd, [0, 0.12, 0])], r: 0.018, m: 'frame' }, { t: 'cyl', a: V.add(hd, [0, -0.08, 0]), b: V.add(hd, [0, 0.12, 0]), r: 0.017, m: 'rubber' }); }
    sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
    return out;
  };
  // chest press machine: seat + upright backrest at o.at, handles on lever arms from a pivot behind the shoulders
  P.chestPress = (sol, o = {}) => {
    const c = o.at || [0, 0, 0], H = o.seatH ?? 0.45;
    const out = [...seat(c, H, 0.42, 0.42), ...back(c, H, o.back ?? 8, 0.75), ...stack(c[0] - 0.65, 0, 1.6)];
    for (const s of ['L', 'R']) {
      const sg = s === 'R' ? 1 : -1, hd = sol.J['hand' + s];
      const piv = o.pivot ? [o.pivot[0], o.pivot[1], o.pivot[2] * sg] : [c[0] - 0.3, H + 0.95, 0.42 * sg];
      out.push({ t: 'tube', pts: [piv, V.add(hd, [-0.05, 0.15, 0.05 * sg]), V.add(hd, [0, 0.1, 0])], r: 0.02, m: 'frame' });
      out.push({ t: 'cyl', a: V.add(hd, [0, -0.08, 0]), b: V.add(hd, [0, 0.1, 0]), r: 0.017, m: 'rubber' });
    }
    sol.grip = { L: [0, 1, 0], R: [0, 1, 0] }; sol.gripKind = 'neutral';
    return out;
  };

  G.FB = Object.assign(G.FB, { PROPS: P, REFORMER: REF });
})(typeof window !== 'undefined' ? window : globalThis);
