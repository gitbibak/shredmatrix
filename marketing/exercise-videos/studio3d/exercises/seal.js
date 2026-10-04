/* Seal (Pilates mat). Built on rolling_like_a_ball.js (approved): constant C-curve (lumbar 40, thoracic 30, neck 45), only
 * `trunk` rolls the ball from the sit-bone balance (~25° behind vertical) to the shoulder blades (~100°).
 * - Seal shape: knees open about shoulder width (abd + external rotation), soles of the feet together, hands dive
 *   between the knees and hold the outside of the ankles from below.
 * - Claps: the heels open and tap back together by hip rotation only (knees stay where they are), three times at the
 *   balance and three times at the back. They are card-less in-between keys; the cards name the clap.
 * - Arms are FK, fitted lazily per foot position (closed / open) so the hands travel with the ankles during a clap.
 * - Contacts: no explicit ground (lowest point rests on the mat, travelling along the spine); the mid key is lifted 3 cm
 *   with `pos` like in rolling_like_a_ball. anchorX = waist. */
{
const BASE = { lumbar: 40, thoracic: 30, neck: 45, hip: 81, knee: 142, ankle: -20, abd: 12, hrot: 16, flat: false,
  palm: 'out', curl: 0.75, protract: 0.06, sh: 30, shAbd: 4, el: 60, bendR: [1, 0.3, -0.6], bendL: [1, 0.3, 0.6] };
const OPEN = { hrot: 6 };
const RAW = {
  ball: { ...BASE, trunk: -94 },
  ballO: { ...BASE, ...OPEN, trunk: -94 },
  mid: { ...BASE, trunk: -146, pos: [0, 0.03, 0] },
  back: { ...BASE, trunk: -164 },
  backO: { ...BASE, ...OPEN, trunk: -164 },
};
const CTX = { anchorX: ['waist'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(p), CTX).J;
  // hands below/outside each ankle, reaching through between the knees
  const arms = (p) => {
    const J0 = S(p);
    const tgt = (s) => V.add(J0['ankle' + s], [-0.01, -0.025, (s === 'R' ? 1 : -1) * 0.035]);
    const err = (q) => { const J = S({ ...p, sh: q[0], shAbd: q[1], el: q[2] }); return V.len(V.sub(J.handR, tgt('R'))) + V.len(V.sub(J.handL, tgt('L'))); };
    let best = [p.sh, p.shAbd, p.el], be = err(best);
    for (const st of [8, 4, 2, 1, 0.5]) { let imp = true; while (imp) { imp = false;
      for (let i = 0; i < 3; i++) for (const d of [-st, st]) { const q = best.slice(); q[i] += d; if (q[2] < 0) continue; const e = err(q); if (e < be - 1e-5) { be = e; best = q; imp = true; } } } }
    return { a: { sh: +best[0].toFixed(1), shAbd: +best[1].toFixed(1), el: +best[2].toFixed(1) }, e: be };
  };
  const c = arms(poses.ball), o = arms(poses.ballO);
  for (const k of ['ball', 'mid', 'back']) Object.assign(poses[k], c.a);
  for (const k of ['ballO', 'backO']) Object.assign(poses[k], o.a);
  for (const [at, pose] of extra) if (pose._arms) { const b = poses[at]; Object.assign(pose, { sh: b.sh + pose._arms[0], shAbd: b.shAbd + pose._arms[1], el: b.el + pose._arms[2] }); }
  poses.ball._err = c.e; poses.ballO._err = o.e;
  return poses;
}

const CL = (to) => ({ to, dur: 0.25, card: false });
window.EXERCISE = {
  id: 'seal',
  name: { tr: 'Fok (Seal)', en: 'Seal', es: 'Foca (seal)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'adductors'],
  tempo: '1.5-1.5-1.5',
  view: { yaw: 50, pitch: 10 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'C-kıvrımı hiç bozulmaz', en: 'The C-curve never changes', es: 'La curva en C no cambia' } },
  contacts: ['pelvis'],
  props: [['mat', { at: [0, 0, 0], length: 1.6 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'ball',
  rep: [
    { to: 'ballO', dur: 0.25, phase: 0 }, CL('ball'), CL('ballO'), CL('ball'), CL('ballO'), CL('ball'),
    { to: 'mid', dur: 0.75, phase: 1, ease: 'in' },
    { to: 'back', dur: 0.75, card: false, ease: 'out' },
    CL('backO'), CL('back'), CL('backO'), CL('back'), CL('backO'), CL('back'),
    { to: 'mid', dur: 0.75, phase: 2, ease: 'in' },
    { to: 'ball', dur: 0.75, card: false, ease: 'out' },
  ],
  setup: { tr: 'Oturma kemiklerinde dengede kal. Dizler açık, eller bacakların içinden ayak bileklerini tutar, tabanlar bitişik.',
    en: 'Balance on your sit bones. Knees open, hands reach inside the legs to the ankles, soles together.',
    es: 'Equilibrio sobre los isquiones. Rodillas abiertas, manos por dentro a los tobillos, plantas juntas.' },
  phases: [
    { name: { tr: 'Ayakları 3 kez çırp', en: 'Clap the feet 3 times', es: 'Aplaude los pies 3 veces' }, breath: 'in',
      text: { tr: 'Topuklar açılıp kapanır; dizler ve sırt sabit.', en: 'Heels open and tap together; knees and back stay still.', es: 'Los talones se abren y chocan; rodillas y espalda quietas.' } },
    { name: { tr: 'Nefes al, geriye yuvarlan', en: 'Inhale, roll back', es: 'Inhala, rueda atrás' }, breath: 'in', line: ['pelvis', 'waist', 'neck'],
      text: { tr: 'Kürek kemiklerine kadar yuvarlan, orada 3 kez çırp.', en: 'Roll to the shoulder blades and clap 3 times there.', es: 'Rueda hasta las escápulas y aplaude 3 veces.' } },
    { name: { tr: 'Nefes ver, öne yuvarlan', en: 'Exhale, roll up', es: 'Exhala, rueda arriba' }, breath: 'out',
      text: { tr: 'Karınla dengeye gel, ayaklar minderi değmez.', en: 'Use the abs to come up to balance, feet off the mat.', es: 'Sube con el abdomen al equilibrio, pies en el aire.' } },
  ],
  tempoText: { tr: '3 çırpma · 1,5 sn geri · 3 çırpma · 1,5 sn ileri', en: '3 claps · 1.5 s back · 3 claps · 1.5 s up', es: '3 palmadas · 1,5 s atrás · 3 palmadas · 1,5 s arriba' },
  mistakes: [
    { title: { tr: 'Boyna kadar yuvarlanmak', en: 'Rolling onto the neck', es: 'Rodar sobre el cuello' },
      fix: { tr: 'Kürek kemiklerinde dur', en: 'Stop at the shoulder blades', es: 'Para en las escápulas' },
      fixText: { tr: 'Baş minderden uzak, çene göğse yakın', en: 'Head off the mat, chin close to the chest', es: 'Cabeza fuera de la esterilla, barbilla al pecho' },
      at: 'back', pose: { trunk: -184, neck: 24 }, marks: ['head'], parts: ['neck', 'face'] },
    { title: { tr: 'Savrularak kalkmak', en: 'Swinging up with momentum', es: 'Subir con impulso' },
      fix: { tr: 'Karınla, yavaş kalk', en: 'Use the abs, go slower', es: 'Usa el abdomen, más lento' },
      fixText: { tr: 'Top şekli korunur, bacaklar ve baş öne atılmaz', en: 'Keep the ball shape; no throwing legs or head forward', es: 'Mantén la bola; sin lanzar piernas ni cabeza' },
      at: 'ball', pose: { lumbar: 10, thoracic: 10, neck: 5, trunk: -76, hip: 58, knee: 70, _arms: [14, 0, -30] }, line: ['pelvis', 'waist', 'neck'], parts: ['waist', 'chest'] },
  ],
  cues: [{ tr: 'Top gibi yuvarlak kal', en: 'Stay round like a ball', es: 'Mantente redonda como una bola' },
    { tr: 'Sıkı C-kıvrımı, çene içeride', en: 'Tight C-curve, chin tucked', es: 'C cerrada, barbilla recogida' },
    { tr: 'Dizler açık, dirsekler içeride', en: 'Knees open, elbows inside', es: 'Rodillas abiertas, codos dentro' }],
};
}
