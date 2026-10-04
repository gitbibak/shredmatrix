/* Flat 2D renderer: every body part is the convex hull of projected spheres, painted back-to-front
 * with two-tone cel shading. Props are projected primitives (boxes, cylinders, hulls). Output: SVG markup. */
(function (G) {
  const { V, M, D2R } = G.FB;

  const PAL = {
    skin: '#f2b48e', skinSh: '#d9906b', skinFar: '#c98564', skinFarSh: '#b47355',
    hair: '#33241d', hairSh: '#22170f', hairHi: '#4a352a',
    top: '#ff6d00', topSh: '#d95400', topFar: '#cc5200', topFarSh: '#b04400',
    legs: '#2b3a67', legsSh: '#1f2b52', legsFar: '#1d2747', legsFarSh: '#151d38',
    shoe: '#f8fafc', shoeSh: '#cbd5e1', shoeFar: '#c4ccd8', shoeFarSh: '#a3adbd', sole: '#ff6d00',
    tie: '#00b0ff',
    muscle: '#00d0ff', bad: '#ff3b4e', good: '#22d38a',
  };

  // ---------- camera ----------
  // pinhole camera; scale = px per metre at the target depth, dist = camera distance (m)
  function camera(c) {
    const y = (c.yaw ?? 90) * D2R, p = (c.pitch ?? 6) * D2R;
    const eye = [Math.cos(p) * Math.cos(y), Math.sin(p), Math.cos(p) * Math.sin(y)];
    const d = V.mul(eye, -1);
    const right = V.norm(V.cross(d, [0, 1, 0]));
    const up = V.cross(right, d);
    const tgt = c.target || [0, 0.9, 0];
    const s = c.scale || 600, cx = c.cx ?? 540, cy = c.cy ?? 1000;
    const D = c.dist ?? 7.5, f = s * D;
    const pos = V.add(tgt, V.mul(eye, D));
    return {
      eye, right, up, s, cx, cy, tgt, D, f, pos, dir: d,
      p: (P) => { const q = V.sub(P, pos); const z = V.dot(q, d); return [cx + f * V.dot(q, right) / z, cy - f * V.dot(q, up) / z]; },
      depth: (P) => V.dot(V.sub(P, tgt), eye),
      // projected radius of a sphere at P
      r: (P, r) => f * r / V.dot(V.sub(P, pos), d),
    };
  }

  // ---------- 2D geometry ----------
  function hull(pts) {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function circlesHull(circ, n = 28) {
    const pts = [];
    for (const [x, y, r] of circ) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    return hull(pts);
  }
  const pathOf = (pts) => (pts.length ? 'M' + pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z' : '');

  // ---------- body part recipes ----------
  // sphere spec: [frame, origin, local offset [fwd, up, side], radius]; side offset is mirrored for left limbs
  function bodySpheres(sol) {
    const { J, F } = sol, parts = [];
    const at = (fr, o, off, sg = 1) => V.add(o, M.apply(fr, [off[0], off[1], off[2] * sg]));
    const along = (a, b, t, fr, off, sg) => V.add(V.lerp(a, b, t), M.apply(fr, [off[0], 0, (off[1] || 0) * sg]));
    for (const s of ['L', 'R']) {
      const sg = s === 'R' ? 1 : -1;
      const th = F['thigh' + s], sh = F['shin' + s], ft = F['foot' + s];
      const hip = J['hip' + s], knee = J['knee' + s], ank = J['ankle' + s];
      parts.push({ id: 'thigh' + s, side: s, mat: 'legs', sph: [
        [along(hip, knee, 0.0, th, [0.0, 0.012], sg), 0.092],
        [along(hip, knee, 0.22, th, [0.014, 0.008], sg), 0.083],
        [along(hip, knee, 0.34, th, [-0.022, 0.0], sg), 0.074],
        [along(hip, knee, 0.58, th, [0.01, 0.0], sg), 0.066],
        [along(hip, knee, 0.86, th, [0.0, 0.0], sg), 0.053],
        [along(hip, knee, 1.0, th, [0.006, 0.0], sg), 0.049],
      ], muscles: { quads: [[along(hip, knee, 0.42, th, [0.03, 0], sg), 0.06], [along(hip, knee, 0.75, th, [0.025, 0], sg), 0.045]],
        hamstrings: [[along(hip, knee, 0.45, th, [-0.04, 0], sg), 0.058], [along(hip, knee, 0.78, th, [-0.03, 0], sg), 0.04]],
        adductors: [[along(hip, knee, 0.3, th, [0.0, -0.05], sg), 0.05]] } });
      parts.push({ id: 'shin' + s, side: s, mat: 'legs', sph: [
        [along(knee, ank, 0.0, sh, [0.0, 0], sg), 0.05],
        [along(knee, ank, 0.27, sh, [-0.022, 0], sg), 0.052],
        [along(knee, ank, 0.55, sh, [-0.006, 0], sg), 0.039],
        [along(knee, ank, 0.92, sh, [0.0, 0], sg), 0.031],
      ], muscles: { calves: [[along(knee, ank, 0.3, sh, [-0.03, 0], sg), 0.045]], tibialis: [[along(knee, ank, 0.4, sh, [0.02, 0], sg), 0.03]] } });
      parts.push({ id: 'foot' + s, side: s, mat: 'shoe', sph: [
        [at(ft, ank, [-0.035, -0.035, 0], sg), 0.043],
        [at(ft, ank, [0.0, -0.01, 0], sg), 0.04],
        [at(ft, ank, [0.07, -0.042, 0], sg), 0.04],
        [at(ft, ank, [0.13, -0.05, 0], sg), 0.033],
      ], sole: [
        [at(ft, ank, [-0.04, -0.058, 0], sg), 0.024],
        [at(ft, ank, [0.14, -0.064, 0], sg), 0.02],
      ] });
      const arm = F['arm' + s], shJ = J['shoulder' + s], el = J['elbow' + s], wr = J['wrist' + s], hd = J['hand' + s];
      const afr = G.FB.frameFrom(V.sub(shJ, el), arm.b);
      const ffr = G.FB.frameFrom(V.sub(el, wr), arm.b);
      parts.push({ id: 'upper' + s, side: s, mat: 'skin', sph: [
        [V.add(shJ, M.apply(F.thorax, [0.0, 0.005, 0.012 * sg])), 0.056],
        [along(shJ, el, 0.3, afr, [0.0, 0], sg), 0.047],
        [along(shJ, el, 0.55, afr, [0.006, 0], sg), 0.041],
        [along(shJ, el, 1.0, afr, [0, 0], sg), 0.034],
      ], muscles: { delts: [[V.add(shJ, M.apply(F.thorax, [0.0, 0.0, 0.015 * sg])), 0.052]],
        biceps: [[along(shJ, el, 0.55, afr, [0.02, 0], sg), 0.032]], triceps: [[along(shJ, el, 0.5, afr, [-0.022, 0], sg), 0.033]] } });
      parts.push({ id: 'fore' + s, side: s, mat: 'skin', sph: [
        [along(el, wr, 0.0, ffr, [0, 0], sg), 0.035],
        [along(el, wr, 0.28, ffr, [0.004, 0], sg), 0.037],
        [along(el, wr, 1.0, ffr, [0, 0], sg), 0.024],
      ], muscles: { forearms: [[along(el, wr, 0.3, ffr, [0, 0], sg), 0.034]] } });
      parts.push({ id: 'hand' + s, side: s, mat: 'skin', sph: [
        [wr, 0.026], [hd, 0.036], [V.add(hd, V.mul(arm.fd, 0.025)), 0.028],
      ] });
    }
    const P = F.pelvis, L = F.lumbar, T = F.thorax, H = F.head;
    const pel = J.pelvis, wa = J.waist, nk = J.neck, hc = J.head;
    const kT = (G.FB.BODY.thorax || 0.25) / 0.25, kL = (G.FB.BODY.lumbar || 0.21) / 0.21;
    const lt = (fr, o, off) => V.add(o, M.apply(fr, off));
    const ltT = (fr, o, off) => V.add(o, M.apply(fr, [off[0], off[1] * kT, off[2]]));
    const ltL = (fr, o, off) => V.add(o, M.apply(fr, [off[0], off[1] * kL, off[2]]));
    parts.push({ id: 'pelvis', mat: 'legs', sph: [
      [lt(P, pel, [0.0, 0.02, 0.085]), 0.096], [lt(P, pel, [0.0, 0.02, -0.085]), 0.096],
      [lt(P, pel, [-0.05, -0.01, 0.058]), 0.096], [lt(P, pel, [-0.05, -0.01, -0.058]), 0.096],
      [lt(P, pel, [0.035, 0.07, 0.0]), 0.1], [lt(P, pel, [0.0, 0.1, 0.05]), 0.095], [lt(P, pel, [0.0, 0.1, -0.05]), 0.095],
    ], muscles: { glutes: [[lt(P, pel, [-0.075, -0.0, 0.06]), 0.075], [lt(P, pel, [-0.075, -0.0, -0.06]), 0.075]] } });
    parts.push({ id: 'waist', mat: 'skin', sph: [
      [ltL(L, pel, [0.0, 0.12, 0.05]), 0.088], [ltL(L, pel, [0.0, 0.12, -0.05]), 0.088],
      [ltL(L, pel, [0.01, 0.2, 0]), 0.1],
    ], muscles: { core: [[ltL(L, pel, [0.07, 0.14, 0]), 0.06], [ltL(L, pel, [0.06, 0.21, 0]), 0.055]],
      obliques: [[ltL(L, pel, [0.03, 0.15, 0.08]), 0.05], [ltL(L, pel, [0.03, 0.15, -0.08]), 0.05]],
      lowerback: [[ltL(L, pel, [-0.07, 0.14, 0]), 0.06]] } });
    parts.push({ id: 'chest', mat: 'top', sph: [
      [ltT(T, wa, [0.0, 0.03, 0.055]), 0.097], [ltT(T, wa, [0.0, 0.03, -0.055]), 0.097],
      [ltT(T, wa, [-0.01, 0.15, 0.075]), 0.093], [ltT(T, wa, [-0.01, 0.15, -0.075]), 0.093],
      [ltT(T, wa, [0.055, 0.11, 0.055]), 0.072], [ltT(T, wa, [0.055, 0.11, -0.055]), 0.072],
      [ltT(T, wa, [-0.02, 0.2, 0]), 0.08],
    ], muscles: { chest: [[ltT(T, wa, [0.08, 0.15, 0.06]), 0.06], [ltT(T, wa, [0.08, 0.15, -0.06]), 0.06]],
      lats: [[ltT(T, wa, [-0.04, 0.08, 0.1]), 0.065], [ltT(T, wa, [-0.04, 0.08, -0.1]), 0.065]],
      upperback: [[ltT(T, wa, [-0.08, 0.18, 0.05]), 0.065], [ltT(T, wa, [-0.08, 0.18, -0.05]), 0.065]] } });
    parts.push({ id: 'neck', mat: 'skin', sph: [[lt(T, nk, [0.0, -0.02, 0]), 0.05], [lt(H, nk, [0.01, 0.06, 0]), 0.045]] });
    parts.push({ id: 'hair', mat: 'hair', sph: [[lt(H, hc, [-0.012, 0.012, 0]), 0.114], [lt(H, hc, [-0.045, -0.035, 0]), 0.092]] });
    parts.push({ id: 'face', mat: 'skin', sph: [[lt(H, hc, [0.03, -0.018, 0]), 0.088], [lt(H, hc, [0.04, -0.06, 0]), 0.064], [lt(H, hc, [0.098, -0.03, 0]), 0.014]] });
    parts.push({ id: 'earR', mat: 'skin', small: true, sph: [[lt(H, hc, [-0.005, -0.02, 0.098]), 0.02]] });
    parts.push({ id: 'earL', mat: 'skin', small: true, sph: [[lt(H, hc, [-0.005, -0.02, -0.098]), 0.02]] });
    return parts;
  }

  // ponytail: a chain hanging from the crown; angles supplied by the caller (secondary motion)
  function ponytail(sol, sway = [0, 0, 0]) {
    const { J, F } = sol; const H = F.head;
    const base = V.add(J.head, M.apply(H, [-0.098, 0.05, 0]));
    let dir = V.norm(M.apply(H, [-1, 0.45, 0]));
    if (dir[1] > 0.3) dir = V.norm([dir[0], 0.3, dir[2]]);
    const pts = [base]; let p = base;
    const n = 7;
    for (let i = 1; i <= n; i++) {
      dir = V.norm(V.add(V.add(dir, [0, -0.8, 0]), V.mul(sway, 0.35 * i / n)));
      p = V.add(p, V.mul(dir, 0.04));
      if (p[1] < 0.015) p = [p[0], 0.015, p[2]];
      pts.push(p);
    }
    const sph = pts.map((q, i) => [q, [0.03, 0.036, 0.038, 0.035, 0.031, 0.026, 0.02, 0.014][i]]);
    return { id: 'pony', mat: 'hair', sph, tie: [base, 0.022] };
  }

  // ---------- render ----------
  function shadeKey(mat, far, dark) { return PAL[mat + (far ? 'Far' : '') + (dark ? 'Sh' : '')] || PAL[mat]; }

  let clipId = 0;
  function renderBody(sol, cam, opt = {}, extra = []) {
    const items = bodyItems(sol, cam, opt).concat(extra.filter((e) => !e.layer));
    items.sort((a, b) => a.dep - b.dep);
    const back = extra.filter((e) => e.layer === 'back').map((e) => e.svg).join('');
    const front = extra.filter((e) => e.layer === 'front').map((e) => e.svg).join('');
    return back + items.map((i) => i.svg).join('') + front;
  }
  function bodyItems(sol, cam, opt = {}) {
    const parts = bodySpheres(sol);
    if (opt.pony !== false) parts.push(ponytail(sol, opt.sway || [0, 0, 0]));
    const centre = cam.depth(sol.J.chest);
    const items = [];
    for (const pt of parts) {
      const circ = pt.sph.map(([c, r]) => { const q = cam.p(c); return [q[0], q[1], cam.r(c, r)]; });
      let dep = 0; for (const [c] of pt.sph) dep += cam.depth(c); dep /= pt.sph.length;
      // bias: heads/hands in front of what they overlap at equal depth
      if (pt.id === 'face') dep += 0.01; if (pt.id === 'hair') dep += 0.0;
      if (pt.id === 'pony') dep -= 0.02;
      if (pt.id.startsWith('hand')) dep += 0.03;
      if (pt.id.startsWith('ear')) dep += 0.0;
      if (pt.id === 'neck') dep -= 0.03;
      if (pt.id === 'pelvis') dep -= 0.005;
      let far = false;
      if (pt.side) {
        const leg = pt.id.startsWith('thigh') || pt.id.startsWith('shin') || pt.id.startsWith('foot');
        const lat = M.apply(leg ? sol.F.pelvis : sol.F.thorax, [0, 0, 1]);
        const v = V.dot(lat, cam.eye) * (pt.side === 'R' ? 1 : -1);
        far = v < -0.5;
      }
      items.push({ pt, circ, dep, far });
    }
    const res = [];
    const hl = opt.highlight || {};      // { quads: 0..1, ... }
    const tint = opt.tint || null;        // { color, amount }
    const ghost = opt.ghost;              // render as translucent outline
    const lightDir = [-0.55, -0.85];      // screen-space light (from upper left)
    for (const it of items) {
      let out = '';
      const { pt, circ, far } = it;
      const poly = circlesHull(circ, pt.small ? 16 : 30);
      const d = pathOf(poly);
      if (ghost) { res.push({ dep: it.dep, svg: `<path d="${d}" fill="${ghost.fill || '#fff'}"/>` }); continue; }
      const base = shadeKey(pt.mat, far, false), dark = shadeKey(pt.mat, far, true);
      const id = 'c' + (clipId++);
      const avgR = circ.reduce((a, c) => a + c[2], 0) / circ.length;
      const off = Math.max(2.5, avgR * 0.28);
      out += `<clipPath id="${id}"><path d="${d}"/></clipPath>`;
      out += `<path d="${d}" fill="${dark}"/>`;
      const sh = poly.map((p) => [p[0] + lightDir[0] * off, p[1] + lightDir[1] * off]);
      out += `<g clip-path="url(#${id})"><path d="${pathOf(sh)}" fill="${base}"/>`;
      if (pt.sole) {
        const sc = pt.sole.map(([c, r]) => { const q = cam.p(c); return [q[0], q[1], r * cam.s]; });
        out += `<path d="${pathOf(circlesHull(sc))}" fill="${PAL.sole}" opacity="${far ? 0.75 : 1}"/>`;
      }
      if (pt.muscles) for (const k in pt.muscles) {
        const a = hl[k]; if (!a) continue;
        for (const [c, r] of pt.muscles[k]) {
          const q = cam.p(c);
          out += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(r * cam.s * 1.15).toFixed(1)}" fill="url(#mglow)" opacity="${(a * (far ? 0.6 : 1)).toFixed(3)}"/>`;
        }
      }
      if (tint && tint.amount > 0 && (!tint.parts || tint.parts.some((k) => pt.id.startsWith(k)))) out += `<path d="${d}" fill="${tint.color}" opacity="${(tint.amount * 0.55).toFixed(3)}"/>`;
      out += `</g>`;
      if (pt.tie) { const q = cam.p(pt.tie[0]); out += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(pt.tie[1] * cam.s).toFixed(1)}" fill="${PAL.tie}"/>`; }
      res.push({ dep: it.dep, svg: out, id: pt.id });
    }
    return res;
  }

  // soft contact shadow on the floor (y = 0) under given points
  function floorShadow(sol, cam, extra = []) {
    const pts = [];
    for (const k of ['heelL', 'toeL', 'heelR', 'toeR', 'handL', 'handR', 'pelvis', 'kneeL', 'kneeR', 'chest', 'head', 'elbowL', 'elbowR']) {
      const P = sol.J[k]; if (!P) continue;
      const h = P[1]; if (h > 0.5) continue;
      pts.push([[P[0], 0, P[2]], Math.max(0, 1 - h / 0.5)]);
    }
    for (const e of extra) pts.push(e);
    let out = '';
    for (const [P, w] of pts) {
      const q = cam.p(P);
      const rx = 0.13 * cam.s, ry = rx * Math.max(0.12, Math.abs(cam.up[1] === 1 ? 0.1 : Math.sin(Math.asin(cam.eye[1]))));
      out += `<ellipse cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" rx="${rx.toFixed(1)}" ry="${Math.max(6, ry).toFixed(1)}" fill="#000" opacity="${(0.32 * w).toFixed(3)}"/>`;
    }
    return `<g filter="url(#blur8)">${out}</g>`;
  }

  // ---------- props ----------
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    if (k < 0) { r *= 1 + k; g *= 1 + k; b *= 1 + k; } else { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; }
    return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  }
  // cylinder between a and b, radius r -> {d, dep, cap}
  function cylinder(cam, a, b, r, color, n = 20) {
    const ax = V.norm(V.sub(b, a));
    let u = V.cross(ax, [0, 1, 0]); if (V.len(u) < 0.1) u = V.cross(ax, [1, 0, 0]); u = V.norm(u);
    const w = V.cross(ax, u);
    const ring = (c) => { const pts = []; for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; pts.push(cam.p(V.add(c, V.add(V.mul(u, r * Math.cos(t)), V.mul(w, r * Math.sin(t)))))); } return pts; };
    const ra = ring(a), rb = ring(b);
    const d = pathOf(hull(ra.concat(rb)));
    // visible cap: the end whose normal faces the camera
    const capEnd = V.dot(ax, cam.eye) > 0 ? rb : ra;
    const capVis = Math.abs(V.dot(ax, cam.eye));
    const dep = (cam.depth(a) + cam.depth(b)) / 2;
    let svg = `<path d="${d}" fill="${color}"/>`;
    // side highlight stripe
    if (capVis > 0.08) svg += `<path d="${pathOf(capEnd)}" fill="${shade(color, 0.18)}"/>`;
    return { svg, dep };
  }
  function box(cam, c, size, color, R = M.I()) {
    const [sx, sy, sz] = size.map((v) => v / 2);
    const corner = (i, j, k) => V.add(c, M.apply(R, [i * sx, j * sy, k * sz]));
    const faces = [
      { n: [0, 1, 0], v: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]], k: 0.12 },
      { n: [0, -1, 0], v: [[-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]], k: -0.4 },
      { n: [1, 0, 0], v: [[1, -1, -1], [1, -1, 1], [1, 1, 1], [1, 1, -1]], k: -0.12 },
      { n: [-1, 0, 0], v: [[-1, -1, -1], [-1, 1, -1], [-1, 1, 1], [-1, -1, 1]], k: -0.2 },
      { n: [0, 0, 1], v: [[-1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, 1]], k: -0.05 },
      { n: [0, 0, -1], v: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1]], k: -0.25 },
    ];
    let svg = '';
    for (const f of faces) {
      const n = M.apply(R, f.n);
      if (V.dot(n, cam.eye) <= 0.001) continue;
      const pts = f.v.map(([i, j, k]) => cam.p(corner(i, j, k)));
      svg += `<path d="${pathOf(pts)}" fill="${shade(color, f.k)}"/>`;
    }
    return { svg, dep: cam.depth(c) };
  }
  function blob(cam, sph, color, shadeK = -0.22) {
    const circ = sph.map(([c, r]) => { const q = cam.p(c); return [q[0], q[1], r * cam.s]; });
    const poly = circlesHull(circ, 24);
    const off = 4; const id = 'c' + (clipId++);
    const d = pathOf(poly);
    const sh = poly.map((p) => [p[0] - 0.55 * off, p[1] - 0.85 * off]);
    const dep = sph.reduce((a, [c]) => a + cam.depth(c), 0) / sph.length;
    return { svg: `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${shade(color, shadeK)}"/><g clip-path="url(#${id})"><path d="${pathOf(sh)}" fill="${color}"/></g>`, dep };
  }

  const DEFS = `<defs>
    <radialGradient id="mglow"><stop offset="0" stop-color="${PAL.muscle}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${PAL.muscle}" stop-opacity="0.55"/><stop offset="1" stop-color="${PAL.muscle}" stop-opacity="0"/></radialGradient>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    <radialGradient id="floorG"><stop offset="0" stop-color="#1c2b52" stop-opacity="0.95"/><stop offset="0.7" stop-color="#14203f" stop-opacity="0.6"/><stop offset="1" stop-color="#0d1630" stop-opacity="0"/></radialGradient>
    <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  G.FB = Object.assign(G.FB, { PAL, camera, hull, circlesHull, pathOf, bodySpheres, renderBody, bodyItems, floorShadow, cylinder, box, blob, shade, DEFS, resetClip: () => { clipId = 0; } });
})(typeof window !== 'undefined' ? window : globalThis);
