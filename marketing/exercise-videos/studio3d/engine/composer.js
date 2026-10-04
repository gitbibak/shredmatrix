/* Composer: turns an exercise definition into a deterministic timeline and renders frame t (seconds).
 * Chapters: intro -> setup -> step-by-step (slow, annotated) -> tempo reps (+ alt view) -> mistakes -> cues -> outro. */
(function (G) {
  const FB = G.FB;
  const { V, M, solve, expand, lerpPose, EASE, clamp, camera, renderBody, floorShadow, DEFS, PROPS, capturePlant, PAL } = FB;

  // ---------------- i18n ----------------
  const UI = {
    tr: { chapters: ['Kurulum', 'Adım adım', 'Tempo', 'Hatalar', 'İpuçları'], setup: 'Başlangıç', step: 'Adım', rep: 'TEKRAR', tempo: 'Tempo',
      inhale: 'Nefes al', exhale: 'Nefes ver', hold: 'Nefesi tut', breathe: 'Sakin nefes', wrong: 'YANLIŞ', right: 'DOĞRU', cuesTitle: 'Akılda tut',
      interSteps: 'ADIM ADIM', interTempo: 'TEMPODA', interMistakes: 'SIK HATALAR', interCues: 'ÖZET', altView: 'Önden bak', sideView: 'Yandan bak', holdFor: 'Pozisyonu koru', target: 'hedef' },
    en: { chapters: ['Setup', 'Step by step', 'Tempo', 'Mistakes', 'Cues'], setup: 'Setup', step: 'Step', rep: 'REP', tempo: 'Tempo',
      inhale: 'Inhale', exhale: 'Exhale', hold: 'Hold breath', breathe: 'Breathe easy', wrong: 'WRONG', right: 'RIGHT', cuesTitle: 'Remember',
      interSteps: 'STEP BY STEP', interTempo: 'AT TEMPO', interMistakes: 'COMMON MISTAKES', interCues: 'RECAP', altView: 'Front view', sideView: 'Side view', holdFor: 'Hold the position', target: 'target' },
    es: { chapters: ['Posición', 'Paso a paso', 'Ritmo', 'Errores', 'Claves'], setup: 'Posición inicial', step: 'Paso', rep: 'REP', tempo: 'Ritmo',
      inhale: 'Inhala', exhale: 'Exhala', hold: 'Retén el aire', breathe: 'Respira tranquila', wrong: 'MAL', right: 'BIEN', cuesTitle: 'Recuerda',
      interSteps: 'PASO A PASO', interTempo: 'A RITMO', interMistakes: 'ERRORES COMUNES', interCues: 'RESUMEN', altView: 'Vista frontal', sideView: 'Vista lateral', holdFor: 'Mantén la posición', target: 'objetivo' },
  };
  const MUSCLE = {
    quads: { tr: 'Ön bacak', en: 'Quads', es: 'Cuádriceps' }, glutes: { tr: 'Kalça', en: 'Glutes', es: 'Glúteos' },
    hamstrings: { tr: 'Arka bacak', en: 'Hamstrings', es: 'Isquios' }, calves: { tr: 'Baldır', en: 'Calves', es: 'Gemelos' },
    core: { tr: 'Karın', en: 'Core', es: 'Core' }, obliques: { tr: 'Yan karın', en: 'Obliques', es: 'Oblicuos' },
    lowerback: { tr: 'Bel', en: 'Lower back', es: 'Lumbar' }, chest: { tr: 'Göğüs', en: 'Chest', es: 'Pecho' },
    lats: { tr: 'Sırt (kanat)', en: 'Lats', es: 'Dorsales' }, upperback: { tr: 'Üst sırt', en: 'Upper back', es: 'Espalda alta' },
    delts: { tr: 'Omuz', en: 'Shoulders', es: 'Hombros' }, biceps: { tr: 'Biceps', en: 'Biceps', es: 'Bíceps' },
    triceps: { tr: 'Triceps', en: 'Triceps', es: 'Tríceps' }, forearms: { tr: 'Ön kol', en: 'Forearms', es: 'Antebrazos' },
    adductors: { tr: 'İç bacak', en: 'Adductors', es: 'Aductores' }, tibialis: { tr: 'Kaval', en: 'Shins', es: 'Tibiales' },
  };
  const L = (o, lang) => (o == null ? '' : typeof o === 'string' ? o : o[lang] ?? o.tr ?? o.en ?? '');

  // ---------------- layout ----------------
  const W = 1080, H = 1920;
  const STAGE = { x0: 60, x1: 1020, y0: 450, y1: 1410 };

  // ---------------- tracks ----------------
  function track(keys) {
    // keys: [{t, v, ease}] ; value lerp fn supplied
    return keys.sort((a, b) => a.t - b.t);
  }
  function sampleTrack(keys, t, lerp) {
    if (t <= keys[0].t) return keys[0].v;
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (t <= k.t) {
        const a = keys[i - 1];
        const u = k.t - a.t < 1e-6 ? 1 : (t - a.t) / (k.t - a.t);
        return lerp(a.v, k.v, (EASE[k.ease || 'inOut'] || EASE.inOut)(clamp(u)));
      }
    }
    return keys[keys.length - 1].v;
  }
  const lerpCam = (a, b, u) => ({ yaw: a.yaw + (b.yaw - a.yaw) * u, pitch: a.pitch + (b.pitch - a.pitch) * u, scale: a.scale + (b.scale - a.scale) * u,
    target: V.lerp(a.target, b.target, u), cx: a.cx + (b.cx - a.cx) * u, cy: a.cy + (b.cy - a.cy) * u });

  /* Monotone cubic (Fritsch-Carlson) spline over keyframes: continuous velocity, no overshoot, zero velocity at holds/extrema. */
  function numPaths(o, pre, out) {
    if (typeof o === 'number') { out.push([pre, o]); return out; }
    if (Array.isArray(o)) { o.forEach((v, i) => numPaths(v, pre + '.' + i, out)); return out; }
    if (o && typeof o === 'object') for (const k in o) { if (k[0] === '_') continue; numPaths(o[k], pre ? pre + '.' + k : k, out); }
    return out;
  }
  function setPath(o, path, v) {
    const ks = path.split('.'); let c = o;
    for (let i = 0; i < ks.length - 1; i++) { c = c[ks[i]]; if (c == null || typeof c !== 'object') return; }
    const last = ks[ks.length - 1]; if (typeof c[last] === 'number' || c[last] === undefined && !Array.isArray(c)) c[last] = v; else if (Array.isArray(c) && typeof c[last] === 'number') c[last] = v;
  }
  function splineTrack(keys, lerp) {
    const n = keys.length;
    const maps = keys.map((k) => new Map(numPaths(k.v, '', [])));
    const paths = new Set(); maps.forEach((m) => m.forEach((_, p) => paths.add(p)));
    const tracks = [];
    for (const p of paths) {
      const top = !p.includes('.');
      const y = new Array(n);
      for (let i = 0; i < n; i++) if (maps[i].has(p)) y[i] = maps[i].get(p);
      for (let i = 0; i < n; i++) if (y[i] === undefined && top) { const m = /^(.*)([LR])$/.exec(p); y[i] = m && typeof keys[i].v[m[1]] === 'number' ? keys[i].v[m[1]] : 0; }
      // nested values missing in a key: carry the nearest defined value
      for (let i = 0; i < n; i++) if (y[i] === undefined) { let j = 1; while (true) { if (i - j >= 0 && y[i - j] !== undefined && maps[i - j].has(p)) { y[i] = y[i - j]; break; } if (i + j < n && maps[i + j].has(p)) { y[i] = maps[i + j].get(p); break; } if (i - j < 0 && i + j >= n) { y[i] = 0; break; } j++; } }
      const h = [], d = [];
      for (let i = 0; i < n - 1; i++) { h[i] = Math.max(1e-4, keys[i + 1].t - keys[i].t); d[i] = (y[i + 1] - y[i]) / h[i]; }
      const m = new Array(n).fill(0);
      for (let i = 1; i < n - 1; i++) {
        if (d[i - 1] * d[i] <= 0 || h[i - 1] < 0.02 || h[i] < 0.02) { m[i] = 0; continue; }
        const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
        m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
      }
      tracks.push({ p, y, m });
    }
    return (t) => {
      if (t <= keys[0].t) return keys[0].v;
      if (t >= keys[n - 1].t) return keys[n - 1].v;
      let i = 0; while (i < n - 2 && t > keys[i + 1].t) i++;
      const hh = Math.max(1e-4, keys[i + 1].t - keys[i].t), u = clamp((t - keys[i].t) / hh);
      const base = lerp(keys[i].v, keys[i + 1].v, u);
      const u2 = u * u, u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
      for (const tr of tracks) setPath(base, tr.p, h00 * tr.y[i] + h10 * hh * tr.m[i] + h01 * tr.y[i + 1] + h11 * hh * tr.m[i + 1]);
      // contact sets that change between keys: blend the two solutions (see solveBlend)
      const ga = keys[i].v.ground, gb = keys[i + 1].v.ground;
      if (JSON.stringify((ga || []).map((g) => (typeof g === 'string' ? g : g[0]))) !== JSON.stringify((gb || []).map((g) => (typeof g === 'string' ? g : g[0])))) {
        base.ground = ga; base._gAlt = gb || null; base._gw = h01;
      }
      return base;
    };
  }

  // deep merge (for mistake overrides)
  function merge(a, b) { const o = Object.assign({}, a); for (const k in b) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' ? merge(a[k], b[k]) : b[k]; return o; }

  // ---------------- build ----------------
  function build(ex, lang) {
    const T = UI[lang] || UI.tr;
    const poses = {};
    for (const k in ex.poses) poses[k] = expand(ex.poses[k]);
    const restName = ex.rest || 'start';
    const ctxBase = Object.assign({ anchorX: ['ankleL', 'ankleR'] }, ex.ctx || {});
    const plantList = ctxBase.plant || [];
    delete ctxBase.plant;
    const refSol = solve(poses[restName], ctxBase);
    const ctx = Object.assign({}, ctxBase, { plant: capturePlant(refSol, plantList) });
    const solveP = (p) => {
      if (p._gAlt === undefined) return solve(p, ctx);
      const a = solve(p, ctx), b = solve(Object.assign({}, p, { ground: p._gAlt }), ctx), w = p._gw;
      for (const k in a.J) a.J[k] = V.lerp(a.J[k], b.J[k], w);
      if (w > 0.5) a.F = b.F;
      return a;
    };

    // ----- camera framing (fit the union bbox of all poses in a view)
    const viewFit = (view) => {
      const c0 = camera({ yaw: view.yaw ?? 90, pitch: view.pitch ?? 6, scale: 1, cx: 0, cy: 0, target: [0, 0, 0] });
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      const names = Object.keys(poses);
      for (const n of names) {
        const sol = solveP(poses[n]);
        for (const k in sol.J) { const q = c0.p(sol.J[k]); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        // every prop primitive of this pose counts for framing (bench, reformer, bars...)
        for (const [name, o] of (ex.props || [])) {
          const fn = PROPS[name]; if (!fn) continue;
          const pts = [];
          for (const d of fn(sol, o || {})) {
            if (d.t === 'box') { for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) pts.push(V.add(d.c, [sx * d.s[0] / 2, sy * d.s[1] / 2, sz * d.s[2] / 2])); }
            else if (d.t === 'cyl' || d.t === 'torus') { for (const e of [d.a, d.b]) for (const k of [-1, 1]) pts.push(V.add(e, [0, k * (d.r || 0), 0])); }
            else if (d.t === 'sph') { for (const k of [-1, 1]) { pts.push(V.add(d.c, [k * d.r, 0, 0])); pts.push(V.add(d.c, [0, k * d.r, 0])); } }
            else if (d.t === 'tube') pts.push(...d.pts);
          }
          for (const P of pts) { const q = c0.p(P); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
        }
      }
      const pad = 0.16; // head radius/limb thickness
      x0 -= pad; x1 += pad; y0 -= pad + 0.02; y1 += 0.04;
      const sw = STAGE.x1 - STAGE.x0, sh = STAGE.y1 - STAGE.y0;
      const s = Math.min(sw / (x1 - x0), sh / (y1 - y0), view.maxScale || 560) * (view.zoom || 1);
      // place bbox centre horizontally in stage centre, feet at stage bottom
      const bx = (x0 + x1) / 2, by1 = y1;
      const cx = (STAGE.x0 + STAGE.x1) / 2 - bx * s;
      const cy = STAGE.y1 - 20 - by1 * s;
      return { yaw: view.yaw ?? 90, pitch: view.pitch ?? 6, scale: s, target: [0, 0, 0], cx: cx + (view.dx || 0), cy: cy + (view.dy || 0) };
    };
    const camMain = viewFit(ex.view || {});
    const camAlt = ex.alt ? viewFit(ex.alt) : null;

    // ----- timeline
    const poseKeys = [], camKeys = [], cards = [], overlays = [], chapters = [], inter = [], counters = [];
    let t = 0;
    const key = (p, dt, ease = 'inOut') => { t += dt; poseKeys.push({ t, v: p, ease }); };
    const camKey = (c, at, ease = 'inOut') => camKeys.push({ t: at, v: c, ease });
    const rest = poses[restName];
    const moves = ex.rep.map((m) => Object.assign({ ease: 'inOut' }, m));
    const repDur = moves.reduce((a, m) => a + m.dur, 0);

    // intro
    const introDur = 2.6;
    poseKeys.push({ t: 0, v: rest });
    camKey(Object.assign({}, camMain, { yaw: camMain.yaw - 38, scale: camMain.scale * 0.9, cy: camMain.cy + 30 }), 0);
    key(rest, introDur);
    camKey(camMain, introDur, 'inOut');

    // setup
    const camSetup = ex.setupView ? viewFit(ex.setupView) : null;
    const setupDur = camSetup ? 4.6 : 3.6;
    if (camSetup) { camKey(camMain, t + 0.1); camKey(camSetup, t + 1.1); camKey(camSetup, t + setupDur - 1.0); camKey(camMain, t + setupDur); }
    chapters.push({ t0: t, i: 0 });
    cards.push({ t0: t, t1: t + setupDur, kind: 'info', num: '', title: T.setup, text: L(ex.setup, lang) });
    overlays.push({ t0: t, t1: t + setupDur, type: 'contacts', joints: ex.contacts || plantList.map((k) => k.replace('ankle', 'ball')).concat((ex.ctx?.ground || []).map((g) => (typeof g === 'string' ? g : g[0]))) });
    for (const a of (ex.setupMarks || [])) overlays.push(Object.assign({ t0: t + (camSetup ? 1.0 : 0.4), t1: t + setupDur - (camSetup ? 0.9 : 0) }, a, { label: L(a.label, lang) }));
    key(rest, setupDur);

    // step by step
    inter.push({ t0: t - 0.1, text: T.interSteps });
    chapters.push({ t0: t, i: 1 });
    let prev = rest;
    moves.forEach((m, i) => {
      const ph = (ex.phases || [])[m.phase ?? i] || {};
      const target = poses[m.to];
      // in-between pose (e.g. airborne moment of a jump): no card of its own, played at real speed inside the previous card
      if (m.card === false) { key(target, m.dur, m.ease); prev = target; return; }
      const isHold = prev === target;
      const mv = isHold ? 0 : Math.max(1.3, m.dur * (ph.slow || 1.5));
      const readT = 1.0 + (L(ph.name, lang).length + L(ph.text, lang).length) / 21;   // time to read the card
      const total = Math.max(isHold ? 2.2 : 2.9, mv + 0.9, ph.hold || 0, readT);
      const t0 = t;
      cards.push({ t0, t1: t0 + total, kind: 'step', num: String((m.phase ?? i) + 1), title: L(ph.name, lang), text: L(ph.text, lang), breath: ph.breath });
      if (!isHold) overlays.push({ t0, t1: t0 + mv + 0.3, type: 'ghost', pose: target });
      if (ph.arc) overlays.push({ t0, t1: t0 + total, type: 'arc', joints: ph.arc, label: ph.arcLabel });
      if (ph.trace && !isHold) overlays.push({ t0, t1: t0 + total, type: 'trace', joint: ph.trace, from: prev, to: target, mv, start: t0 });
      if (ph.line) overlays.push({ t0, t1: t0 + total, type: 'line', joints: ph.line, color: PAL.good });
      for (const a of (ph.marks || [])) overlays.push(Object.assign({ t0, t1: t0 + total }, a));
      if (!isHold) key(target, mv, m.ease);
      key(target, total - mv);
      prev = target;
    });
    if (prev !== rest) key(rest, 1.0);

    // tempo reps
    inter.push({ t0: t - 0.1, text: T.interTempo });
    chapters.push({ t0: t, i: 2 });
    const tempoStart = t;
    let reps = ex.hold ? 1 : clamp(Math.round(9 / repDur), 2, 4);
    if (ex.tempoReps) reps = ex.tempoReps;
    const holdExtra = ex.hold ? (ex.holdDur || 6) : 0;
    const tempoBreath = [];
    for (let r = 0; r < reps; r++) {
      prev = rest;
      counters.push({ t, n: r + 1 });
      moves.forEach((m, mi) => {
        const tp = poses[m.to], b0 = t;
        if (tp === prev) { key(tp, m.dur + (ex.hold ? holdExtra : 0)); } else key(tp, m.dur, m.ease);
        const ph = (ex.phases || [])[m.phase ?? mi] || {};
        tempoBreath.push({ t0: b0, t1: t, breath: ph.breath });
        prev = tp;
      });
      // a rep that does not end at the rest pose returns smoothly (never snaps)
      if (prev !== rest) key(rest, Math.max(0.8, moves[0].dur));
      if (r < reps - 1 && ex.repGap) key(rest, ex.repGap);
    }
    key(rest, 0.5);
    const tempoEnd = t;
    overlays.push({ t0: tempoStart, t1: tempoEnd, type: 'muscle' });
    cards.push({ t0: tempoStart, t1: tempoEnd, kind: 'tempo', title: ex.hold ? T.holdFor : `${T.tempo} ${ex.tempo || ''}`.trim(), text: L(ex.tempoText, lang), reps, breathAuto: true });
    // camera: primary, then alt view for the middle part
    camKey(camMain, tempoStart);
    if (camAlt) {
      const a0 = tempoStart + (tempoEnd - tempoStart) * 0.42, a1 = tempoEnd - 0.2;
      camKey(camMain, a0); camKey(camAlt, a0 + 1.1, 'inOut'); camKey(camAlt, a1);
      cards.push({ t0: a0 + 0.3, t1: a1, kind: 'view', title: L(ex.alt.title, lang) || T.altView, text: L(ex.alt.text, lang), over: true });
    } else camKey(camMain, tempoEnd);

    // mistakes
    const mistakes = (ex.mistakes || []).slice(0, ex.maxMistakes || 2);
    if (mistakes.length) {
      inter.push({ t0: t - 0.1, text: T.interMistakes });
      chapters.push({ t0: t, i: 3 });
      if (camAlt) camKey(camMain, t + 0.8);
      mistakes.forEach((mk, i) => {
        const at = mk.at || moves.reduce((best, m) => best || (poses[m.to] !== rest ? m.to : null), null);
        const goodP = poses[at];
        const badP = expand(merge(ex.poses[at], mk.pose || {}));
        const view = mk.view ? viewFit(mk.view) : camMain;
        const t0 = t;
        camKey(t0 > 0 ? sampleTrack(camKeys, t0, lerpCam) : camMain, t0);
        camKey(view, t0 + 0.8);
        // bad
        const disp = (pa, pb) => { const a = solveP(pa).J, b2 = solveP(pb).J; let m = 0; for (const k of ['handL', 'handR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'head']) m = Math.max(m, V.len(V.sub(a[k], b2[k]))); return m; };
        const dBad = Math.max(1.2, disp(goodP, badP) / 1.1), dRest = Math.max(0.9, disp(goodP, rest) / 1.1);
        key(badP, dBad, 'inOut'); key(badP, 1.6);
        cards.push({ t0, t1: t0 + 2.8, kind: 'bad', title: L(mk.title, lang), text: L(mk.text, lang) });
        overlays.push({ t0: t0 + 0.9, t1: t0 + 2.8, type: 'bad', parts: mk.parts, marks: mk.marks || [], line: mk.line, arrow: mk.arrow });
        // good
        const t1 = t;
        key(goodP, Math.max(1.0, dBad - 0.2), 'inOut'); key(goodP, 1.7);
        cards.push({ t0: t1, t1: t1 + 3.55, kind: 'good', title: L(mk.fix, lang), text: L(mk.fixText, lang) });
        overlays.push({ t0: t1 + 0.8, t1: t1 + 2.7, type: 'good', marks: mk.marks || [], line: mk.goodLine || mk.line });
        key(rest, dRest);
        camKey(view, t - dRest); camKey(camMain, t);
      });
    }

    // cues recap (keep moving: one rep at tempo)
    inter.push({ t0: t - 0.1, text: T.interCues });
    chapters.push({ t0: t, i: 4 });
    const cuesStart = t;
    camKey(camMain, t);
    const cueList = (ex.cues || []).slice(0, 3).map((c) => L(c, lang));
    const cuesDur = ex.cuesReplay === false ? 4.6 : Math.max(4.2, repDur + 1.2);
    prev = rest;
    key(rest, 0.4);
    if (ex.cuesReplay === false) key(rest, cuesDur - 0.6);   // long flows: hold the start pose under the cues instead of replaying the rep
    else moves.forEach((m) => { const tp = poses[m.to]; key(tp, m.dur * (ex.hold ? 1 : 1.0), tp === prev ? 'linear' : m.ease); prev = tp; });
    key(rest, Math.max(0.3, cuesStart + cuesDur - t - 0.01 - 0.6));
    key(rest, 0.6);
    cards.push({ t0: cuesStart, t1: t, kind: 'cues', title: T.cuesTitle, list: cueList });
    const outroStart = t;
    const DURATION = outroStart + 1.8;
    key(rest, 1.8);
    camKey(camMain, outroStart); camKey(Object.assign({}, camMain, { scale: camMain.scale * 0.94, yaw: camMain.yaw + 10 }), DURATION, 'inOut');

    track(poseKeys); track(camKeys);
    const poseSpline = splineTrack(poseKeys, lerpPose);
    const camSpline = splineTrack(camKeys, lerpCam);
    const poseAt = (tt) => poseSpline(tt);
    const camAt = (tt) => camSpline(tt);
    // in-pose oscillation (e.g. Hundred arm pumps): ex.pump = { key, amp, hz } adds amp*(1-cos)/2 to key (both sides)
    // during the step cards, the tempo breath windows and the cues chapter; a whole number of beats per window, zero at the edges
    let poseAtOut = poseAt;
    if (ex.pump) {
      const segsP = [];
      for (const c of cards) if (c.kind === 'step') segsP.push([c.t0, c.t1]);
      for (const b of tempoBreath) segsP.push([b.t0, b.t1]);
      const cq = cards.find((c) => c.kind === 'cues'); if (cq) segsP.push([cq.t0 + 0.4, cq.t1 - 0.6]);
      poseAtOut = (tt) => {
        const p = poseAt(tt), sg = segsP.find(([a, b]) => tt > a && tt < b);
        if (!sg) return p;
        const n = Math.max(1, Math.floor((sg[1] - sg[0]) * ex.pump.hz + 0.01)), u = (tt - sg[0]) / (sg[1] - sg[0]);
        const d = ex.pump.amp * (1 - Math.cos(2 * Math.PI * n * u)) / 2, o = Object.assign({}, p);
        for (const sd of ['L', 'R']) o[ex.pump.key + sd] = (p[ex.pump.key + sd] ?? p[ex.pump.key] ?? 0) + d;
        return o;
      };
    }
    return { ex, lang, T, poses, ctx, solveP, poseAt: poseAtOut, camAt, cards, overlays, chapters, inter, counters, tempoBreath, DURATION, outroStart, tempoStart, tempoEnd, camMain, reps, moves };
  }

  // ---------------- overlays drawing ----------------
  const f1 = (x) => x.toFixed(1);
  function arcSvg(cam, sol, joints, color, label) {
    const [a, b, c] = joints.map((j) => cam.p(sol.J[j]));
    const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
    const a1 = Math.atan2(v1[1], v1[0]), a2 = Math.atan2(v2[1], v2[0]);
    let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    const r = 58;
    const p1 = [b[0] + r * Math.cos(a1), b[1] + r * Math.sin(a1)], p2 = [b[0] + r * Math.cos(a1 + da), b[1] + r * Math.sin(a1 + da)];
    // true 3D angle
    const A = sol.J[joints[0]], Bj = sol.J[joints[1]], C = sol.J[joints[2]];
    const ang = Math.round(Math.acos(clamp(V.dot(V.norm(V.sub(A, Bj)), V.norm(V.sub(C, Bj))), -1, 1)) * 180 / Math.PI / 5) * 5;
    const mid = a1 + da / 2;
    const lp = [b[0] + (r + 52) * Math.cos(mid), b[1] + (r + 52) * Math.sin(mid)];
    return `<path d="M${f1(b[0])},${f1(b[1])} L${f1(p1[0])},${f1(p1[1])} A${r},${r} 0 0 ${da > 0 ? 1 : 0} ${f1(p2[0])},${f1(p2[1])} Z" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-width="4"/>
      <circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="7" fill="#fff"/>
      <g transform="translate(${f1(lp[0])},${f1(lp[1])})"><rect x="-50" y="-27" width="100" height="54" rx="27" fill="#0b1224" fill-opacity="0.9" stroke="${color}" stroke-width="3"/><text y="12" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="34" fill="#fff">${label || ang + '°'}</text></g>`;
  }
  function lineSvg(cam, sol, joints, color, dash = true) {
    const pts = joints.map((j) => cam.p(Array.isArray(j) ? j : sol.J[j]));
    // extend a little beyond ends
    const a = pts[0], b = pts[pts.length - 1];
    const d = [b[0] - a[0], b[1] - a[1]]; const l = Math.hypot(d[0], d[1]) || 1; const e = 40 / l;
    const A = [a[0] - d[0] * e, a[1] - d[1] * e], B = [b[0] + d[0] * e, b[1] + d[1] * e];
    let s = `<path d="M${f1(A[0])},${f1(A[1])} L${f1(B[0])},${f1(B[1])}" stroke="${color}" stroke-width="5" stroke-linecap="round" ${dash ? 'stroke-dasharray="4 14"' : ''} />`;
    for (const p of pts) s += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="9" fill="${color}" stroke="#0b1224" stroke-width="3"/>`;
    return s;
  }
  function ringSvg(cam, sol, j, color, phase) {
    const p = cam.p(sol.J[j]);
    const r = 34 + 10 * Math.sin(phase * 6);
    return `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${f1(r)}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="5"/>`;
  }
  function arrowSvg(cam, sol, spec, color) {
    // spec: { from: joint, dir: [x,y,z] (m), } straight arrow in world
    const a = cam.p(sol.J[spec.from]);
    const bW = V.add(sol.J[spec.from], spec.dir);
    const b = cam.p(bW);
    const d = [b[0] - a[0], b[1] - a[1]]; const l = Math.hypot(d[0], d[1]) || 1; const u = [d[0] / l, d[1] / l];
    const h = 26; const n = [-u[1], u[0]];
    const tip = b, l1 = [b[0] - u[0] * h + n[0] * h * 0.7, b[1] - u[1] * h + n[1] * h * 0.7], l2 = [b[0] - u[0] * h - n[0] * h * 0.7, b[1] - u[1] * h - n[1] * h * 0.7];
    const start = [a[0] + u[0] * 30, a[1] + u[1] * 30];
    return `<path d="M${f1(start[0])},${f1(start[1])} L${f1(b[0] - u[0] * 10)},${f1(b[1] - u[1] * 10)}" stroke="${color}" stroke-width="9" stroke-linecap="round"/><path d="M${f1(tip[0])},${f1(tip[1])} L${f1(l1[0])},${f1(l1[1])} L${f1(l2[0])},${f1(l2[1])} Z" fill="${color}"/>`;
  }

  // ---------------- frame render ----------------
  let TL = null, els = null, traceCache = new Map();
  function setup(ex, lang) {
    TL = build(ex, lang);
    els = {
      under: document.getElementById('under'), over: document.getElementById('over'),
      cat: document.getElementById('cat'), title: document.getElementById('title'), chips: document.getElementById('chips'),
      card: document.getElementById('card'), chapters: document.getElementById('chapters'), inter: document.getElementById('inter'),
      counter: document.getElementById('counter'), outro: document.getElementById('outro'), viewTag: document.getElementById('viewTag'),
    };
    const T = TL.T;
    els.cat.textContent = L(ex.category, lang);
    els.title.textContent = L(ex.name, lang);
    els.chips.innerHTML = (ex.muscles || []).map((m) => `<span class="chip m">${L(MUSCLE[m] || m, lang)}</span>`).join('') +
      (ex.equipmentLabel ? `<span class="chip e">${L(ex.equipmentLabel, lang)}</span>` : '');
    els.chapters.innerHTML = T.chapters.map((c, i) => `<div class="ch" data-i="${i}"><div class="bar"><i></i></div><span>${c}</span></div>`).join('');
    document.documentElement.lang = lang;
    return TL;
  }

  function cardHtml(c, T) {
    const breath = c.breath ? `<div class="breath ${c.breath}">${{ in: '↓ ' + T.inhale, out: '↑ ' + T.exhale, hold: '■ ' + T.hold, easy: '~ ' + T.breathe }[c.breath] || ''}</div>` : '';
    if (c.kind === 'cues') return `<div class="card cues"><div class="ct">${c.title}</div>${c.list.map((x, i) => `<div class="cue" style="--d:${i}"><b>✓</b><span>${x}</span></div>`).join('')}</div>`;
    const badge = c.kind === 'step' ? `<div class="num">${c.num}</div>` : c.kind === 'bad' ? `<div class="num bad">✕</div>` : c.kind === 'good' ? `<div class="num good">✓</div>` : c.kind === 'info' ? `<div class="num info">●</div>` : c.kind === 'tempo' ? `<div class="num tempo">↻</div>` : `<div class="num info">◐</div>`;
    const label = c.kind === 'bad' ? `<div class="lbl bad">${T.wrong}</div>` : c.kind === 'good' ? `<div class="lbl good">${T.right}</div>` : c.kind === 'step' ? `<div class="lbl">${T.step} ${c.num}</div>` : '';
    const tb = c.breathAuto ? `<div class="breath" data-auto="1"></div>` : '';
    return `<div class="card ${c.kind}">${badge}<div class="body">${label}<div class="ct">${c.title}</div>${c.text ? `<div class="cx">${c.text}</div>` : ''}${breath}${tb}</div></div>`;
  }

  let lastCardKey = '';
  function render(t) {
    const tl = TL, ex = tl.ex, T = tl.T;
    FB.resetClip();
    // ---- pose & camera
    let pose = tl.poseAt(t);
    // idle breathing
    pose = Object.assign({}, pose, { thoracic: (pose.thoracic || 0) + Math.sin(t * 2.2) * 0.8 });
    const sol = tl.solveP(pose);
    let hv = [0, 0, 0];
    for (const [dt, w] of [[0.06, 0.4], [0.14, 0.35], [0.24, 0.25]]) {
      const sp = tl.solveP(tl.poseAt(Math.max(0, t - dt)));
      hv = V.add(hv, V.mul(V.sub(sol.J.head, sp.J.head), w / dt));
    }
    const sway = V.mul(hv, -0.7);
    const c = tl.camAt(t);
    const cam = camera(c);

    // ---- overlays active
    const act = tl.overlays.filter((o) => t >= o.t0 && t <= o.t1);
    const fade = (o, a = 0.35) => clamp(Math.min((t - o.t0) / a, (o.t1 - t) / a));
    let highlight = {}, tint = null, under = '', over = '', ghost3 = null;
    for (const o of act) {
      const k = fade(o);
      if (o.type === 'muscle') {
        const pulse = 0.55 + 0.35 * Math.sin((t - o.t0) * 4);
        for (const m of (ex.muscles || [])) highlight[m] = k * pulse;
      } else if (o.type === 'ghost') {
        const prog = clamp((t - o.t0) / (o.t1 - o.t0));
        ghost3 = { sol: tl.solveP(o.pose), pose: o.pose, amount: Math.sin(Math.PI * Math.min(1, prog * 1.15)) };
      } else if (o.type === 'arc') {
        over += `<g opacity="${k.toFixed(3)}">${arcSvg(cam, sol, o.joints, '#00b0ff', o.label)}</g>`;
      } else if (o.type === 'line') {
        over += `<g opacity="${k.toFixed(3)}">${lineSvg(cam, sol, o.joints, o.color || PAL.good)}</g>`;
      } else if (o.type === 'trace') {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
          const kk = o.joint + i + JSON.stringify(c.yaw.toFixed(1)) + o.t0;
          const u = EASE.inOut(i / 24);
          const s2 = tl.solveP(lerpPose(o.from, o.to, u));
          pts.push(cam.p(s2.J[o.joint]));
        }
        const prog = clamp((t - o.start) / Math.max(0.3, o.mv));
        const n = Math.max(2, Math.round(prog * 24) + 1);
        const d = 'M' + pts.slice(0, n).map((p) => f1(p[0]) + ',' + f1(p[1])).join('L');
        const full = 'M' + pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join('L');
        const e = pts[pts.length - 1], e0 = pts[pts.length - 3];
        const u = V.norm([e[0] - e0[0], e[1] - e0[1], 0]);
        const nrm = [-u[1], u[0]];
        const hd = `<path d="M${f1(e[0] + u[0] * 18)},${f1(e[1] + u[1] * 18)} L${f1(e[0] - u[0] * 10 + nrm[0] * 16)},${f1(e[1] - u[1] * 10 + nrm[1] * 16)} L${f1(e[0] - u[0] * 10 - nrm[0] * 16)},${f1(e[1] - u[1] * 10 - nrm[1] * 16)}Z" fill="#ffab40"/>`;
        under += `<g opacity="${(k * 0.95).toFixed(3)}"><path d="${full}" fill="none" stroke="#ffab40" stroke-opacity="0.25" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffab40" stroke-width="7" stroke-linecap="round"/>${hd}</g>`;
      } else if (o.type === 'contacts') {
        for (const j of o.joints) {
          if (!sol.J[j]) continue;
          const P0 = sol.J[j]; const q = cam.p([P0[0], Math.max(0, P0[1] - FB.CLEAR[j.replace(/[LR]$/, '')] || 0), P0[2]]);
          const ph = ((t - o.t0) * 1.2) % 1;
          under += `<g opacity="${k.toFixed(3)}"><ellipse cx="${f1(q[0])}" cy="${f1(q[1])}" rx="${f1(18 + ph * 40)}" ry="${f1((18 + ph * 40) * 0.32)}" fill="none" stroke="#00b0ff" stroke-width="4" opacity="${(1 - ph).toFixed(2)}"/><ellipse cx="${f1(q[0])}" cy="${f1(q[1])}" rx="16" ry="6" fill="#00b0ff"/></g>`;
        }
      } else if (o.type === 'bad' || o.type === 'good') {
        const col = o.type === 'bad' ? PAL.bad : PAL.good;
        if (o.type === 'bad') tint = { color: PAL.bad, amount: k * (0.75 + 0.25 * Math.sin(t * 8)), parts: o.parts };
        for (const j of (o.marks || [])) over += `<g opacity="${k.toFixed(3)}">${ringSvg(cam, sol, j, col, t)}</g>`;
        if (o.line) over += `<g opacity="${k.toFixed(3)}">${lineSvg(cam, sol, o.line, col)}</g>`;
        if (o.arrow && o.type === 'good') over += `<g opacity="${k.toFixed(3)}">${arrowSvg(cam, sol, o.arrow, col)}</g>`;
      } else if (o.type === 'arrow') {
        over += `<g opacity="${k.toFixed(3)}">${arrowSvg(cam, sol, o, o.color || '#ffab40')}</g>`;
      } else if (o.type === 'mark') {
        over += `<g opacity="${k.toFixed(3)}">${ringSvg(cam, sol, o.joint, o.color || '#00b0ff', t)}</g>`;
      } else if (o.type === 'span') {
        const A = sol.J[o.joints[0]], Bj = sol.J[o.joints[1]];
        const a = cam.p([A[0], 0.002, A[2]]), b = cam.p([Bj[0], 0.002, Bj[2]]);
        const d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1, nn = [-d[1] / l, d[0] / l];
        const off = 46, pa = [a[0] + nn[0] * off, a[1] + nn[1] * off], pb = [b[0] + nn[0] * off, b[1] + nn[1] * off];
        const grow = clamp((t - o.t0) / 0.6);
        const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
        const qa = [mid[0] + (pa[0] - mid[0]) * grow, mid[1] + (pa[1] - mid[1]) * grow], qb = [mid[0] + (pb[0] - mid[0]) * grow, mid[1] + (pb[1] - mid[1]) * grow];
        const col = o.color || '#00b0ff';
        const tick = (p) => `<path d="M${f1(p[0] - nn[0] * 16)},${f1(p[1] - nn[1] * 16)} L${f1(p[0] + nn[0] * 16)},${f1(p[1] + nn[1] * 16)}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`;
        const lw = Math.max(150, (o.label || '').length * 17 + 40);
        over += `<g opacity="${k.toFixed(3)}"><path d="M${f1(qa[0])},${f1(qa[1])} L${f1(qb[0])},${f1(qb[1])}" stroke="${col}" stroke-width="5" stroke-linecap="round"/>${tick(qa)}${tick(qb)}` +
          (o.label ? `<g transform="translate(${f1(mid[0] + nn[0] * 44)},${f1(mid[1] + nn[1] * 44)})"><rect x="${-lw / 2}" y="-25" width="${lw}" height="50" rx="25" fill="#0b1224" fill-opacity="0.92" stroke="${col}" stroke-width="3"/><text y="10" text-anchor="middle" font-family="Inter" font-weight="700" font-size="28" fill="#fff">${o.label}</text></g>` : '') + `</g>`;
      } else if (o.type === 'aline') {
        over += `<g opacity="${k.toFixed(3)}">${lineSvg(cam, sol, o.joints, o.color || '#00b0ff')}</g>`;
      }
    }

    // ---- props + body
    const prims = [];
    for (const [name, opt] of (ex.props || [])) { const fn = PROPS[name]; if (fn) prims.push(...fn(sol, opt || {})); }
    els.under.innerHTML = DEFS + floorSvg(cam, ex) + `<g opacity="0.55">${floorShadow(sol, cam)}</g>` + under;
    els.over.innerHTML = DEFS + over;
    G.FB3.render(sol, cam, { highlight, tint, sway, pose, ghost: ghost3, side: ex.side }, prims, { grip: sol.grip, gripKind: sol.gripKind });

    // ---- UI
    // chapters
    let chI = -1; for (const ch of tl.chapters) if (t >= ch.t0) chI = ch.i;
    const nextT = (i) => { const n = tl.chapters.find((c2) => c2.i === i + 1); return n ? n.t0 : tl.outroStart; };
    els.chapters.querySelectorAll('.ch').forEach((el) => {
      const i = +el.dataset.i; const ch = tl.chapters.find((c2) => c2.i === i);
      let p = 0; if (ch) { p = clamp((t - ch.t0) / (nextT(i) - ch.t0)); }
      el.classList.toggle('on', i === chI);
      el.classList.toggle('done', ch && t >= nextT(i));
      el.style.display = ch ? '' : 'none';
      el.querySelector('i').style.transform = `scaleX(${p.toFixed(3)})`;
    });
    // header intro animation
    const hk = EASE.out(clamp(t / 0.9));
    document.getElementById('header').style.transform = `translateY(${(1 - hk) * -40}px)`;
    document.getElementById('header').style.opacity = clamp(t / 0.6).toFixed(3);
    els.chips.querySelectorAll('.chip').forEach((el, i) => { const k = EASE.outBack(clamp((t - 0.5 - i * 0.12) / 0.45)); el.style.transform = `scale(${k.toFixed(3)})`; el.style.opacity = clamp((t - 0.5 - i * 0.12) / 0.2).toFixed(2); });
    // card
    const main = tl.cards.filter((cd) => !cd.over && t >= cd.t0 && t < cd.t1)[0];
    const key = main ? main.t0 + main.kind : '';
    if (key !== lastCardKey) { els.card.innerHTML = main ? cardHtml(main, T) : ''; lastCardKey = key; }
    if (main) {
      const k = EASE.out(clamp((t - main.t0) / 0.45)), ko = clamp((main.t1 - t) / 0.25);
      const cel = els.card.firstElementChild;
      cel.style.transform = `translateY(${((1 - k) * 60).toFixed(1)}px)`;
      cel.style.opacity = Math.min(k, ko).toFixed(3);
      cel.querySelectorAll('.cue').forEach((q, i) => { const kk = EASE.outBack(clamp((t - main.t0 - 0.3 - i * 0.35) / 0.5)); q.style.opacity = clamp((t - main.t0 - 0.3 - i * 0.35) / 0.25).toFixed(2); q.style.transform = `translateX(${((1 - kk) * -40).toFixed(1)}px)`; });
      if (main.breathAuto) {
        const el = cel.querySelector('.breath[data-auto]');
        const b = tl.tempoBreath.find((x) => t >= x.t0 && t < x.t1);
        const kind = b && b.breath ? b.breath : '';
        if (el && el.dataset.k !== kind) {
          el.dataset.k = kind; el.className = 'breath ' + kind;
          el.textContent = { in: '↓ ' + T.inhale, out: '↑ ' + T.exhale, hold: '■ ' + T.hold, easy: '~ ' + T.breathe }[kind] || '';
          el.style.visibility = kind ? 'visible' : 'hidden';
        }
      }
    }
    // view tag (alt view caption)
    const vt = tl.cards.filter((cd) => cd.over && t >= cd.t0 && t < cd.t1)[0];
    if (vt) {
      els.viewTag.style.opacity = Math.min(clamp((t - vt.t0) / 0.3), clamp((vt.t1 - t) / 0.3)).toFixed(2);
      const html = `<b>${vt.title}</b>${vt.text ? `<span>${vt.text}</span>` : ''}`;
      if (els.viewTag.innerHTML !== html) els.viewTag.innerHTML = html;
      const ch = els.card.firstElementChild ? els.card.firstElementChild.offsetHeight : 0;
      els.viewTag.style.top = 'auto'; els.viewTag.style.bottom = (118 + ch + 22) + 'px';
    }
    else els.viewTag.style.opacity = 0;
    // rep counter
    if (t >= tl.tempoStart - 0.2 && t < tl.tempoEnd + 0.4 && !ex.hold) {
      let n = 0; for (const cn of tl.counters) if (t >= cn.t) n = cn.n;
      const last = tl.counters.find((cn) => cn.n === n); if (!n) n = 1;
      const pop = last ? EASE.outBack(clamp((t - last.t) / 0.35)) : 1;
      els.counter.style.opacity = Math.min(clamp((t - tl.tempoStart + 0.2) / 0.3), clamp((tl.tempoEnd + 0.4 - t) / 0.3)).toFixed(2);
      els.counter.innerHTML = `<small>${L(ex.repLabel, tl.lang) || T.rep}</small><b style="transform:scale(${(0.7 + 0.3 * pop).toFixed(3)})">${n}</b><em>/${tl.reps}</em>`;
    } else els.counter.style.opacity = 0;
    // interstitial
    const it = tl.inter.find((x) => t >= x.t0 && t < x.t0 + 1.1);
    if (it) {
      const u = (t - it.t0) / 1.1;
      els.inter.style.opacity = Math.min(clamp(u / 0.15), clamp((1 - u) / 0.25)).toFixed(3);
      els.inter.innerHTML = `<span style="transform:translateX(${((1 - EASE.out(clamp(u / 0.3))) * -80).toFixed(1)}px)">${it.text}</span>`;
      const chI2 = els.card.firstElementChild ? els.card.firstElementChild.offsetHeight : 230;
      els.inter.style.bottom = (118 + chI2 + 22) + 'px';
    } else els.inter.style.opacity = 0;
    // outro
    const ok = clamp((t - tl.outroStart) / 0.5);
    els.outro.style.opacity = ok.toFixed(3);
    els.outro.style.transform = `scale(${(0.96 + 0.04 * EASE.out(ok)).toFixed(3)})`;
  }

  function floorSvg(cam, ex) {
    const c = ex.floorAt || [0, 0, 0];
    const pts = [];
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push(cam.p([c[0] + Math.cos(a) * 1.25, 0, c[2] + Math.sin(a) * 1.25])); }
    const pts2 = [];
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts2.push(cam.p([c[0] + Math.cos(a) * 1.25, 0, c[2] + Math.sin(a) * 1.25])); }
    return `<path d="${FB.pathOf(pts)}" fill="url(#floorG)"/><path d="${FB.pathOf(pts2)}" fill="none" stroke="#00b0ff" stroke-opacity="0.18" stroke-width="2"/>`;
  }

  G.FB = Object.assign(G.FB, { build, setup, render, UI, MUSCLE, getTL: () => TL });
})(typeof window !== 'undefined' ? window : globalThis);
