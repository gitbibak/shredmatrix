/* Happy Baby (Ananda Balasana): supine, knees hugged -> knees open toward the armpits, shins vertical, soles up, hands hold the
 * outer feet -> hold -> back to the hug.
 * - Every pose rests on the same two ground contacts [shoulderR, pelvis] (sacrum and upper back on the mat).
 * - fitBaby() (lazy, after the rig sets FB.BODY): knee flexion bisected so the shins are vertical, neck bisected so the back of
 *   the head rests on the mat, then world hand targets (hug: on the shins below the knees; baby: outer edges of the feet).
 *   Every pose has hand targets so `ik` interpolates. Mistakes get their own targets/neck the same way.
 * - measure.mjs hip_flexion uses the pelvis->neck chord. */
{
const MAT = 0.012;
const G = (sh = 0, pel = 0) => [['shoulderR', MAT + 0.03 + sh], ['pelvis', MAT + pel]];
const BASE = { trunk: -90, ground: G(), flat: false, handFlat: false, curl: 0.8, palm: 'in', thoracic: 0, lumbar: 0, elbowPole: [-0.2, -0.6, 1] };
const RAW = {
  hug: { ...BASE, hip: 122, knee: 130, abd: 6, hrot: 0, ankle: -20, sh: 60, shAbd: 10, el: 60 },
  baby: { ...BASE, hip: 160, knee: 100, abd: 42, hrot: 10, ankle: 4, sh: 80, shAbd: 25, el: 80 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0.2, 0] };

function fitBaby(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  const bis = (p, key, f, lo, hi) => { const up = f(hi) > f(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; } p[key] = +((lo + hi) / 2).toFixed(2); };
  const head = (p, lift = 0) => bis(p, 'neck', (v) => S({ ...p, neck: v }).head[1] - (MAT + 0.1 + lift), -30, 50);
  // shins vertical: 2x2 Newton on (knee, hrot) so the ankle sits straight above the knee
  const shinsUp = (p) => {
    const r = (q) => { const J = S(q); return [J.ankleR[0] - J.kneeR[0], J.ankleR[2] - J.kneeR[2]]; };
    for (let it = 0; it < 40; it++) {
      const r0 = r(p), e = 0.5, rk = r({ ...p, knee: p.knee + e }), rh = r({ ...p, hrot: p.hrot + e });
      const a = (rk[0] - r0[0]) / e, b = (rh[0] - r0[0]) / e, c = (rk[1] - r0[1]) / e, d = (rh[1] - r0[1]) / e, det = a * d - b * c;
      if (Math.abs(det) < 1e-9) break;
      const cl = (x) => Math.max(-4, Math.min(4, x));
      p.knee -= cl((d * r0[0] - b * r0[1]) / det); p.hrot -= cl((-c * r0[0] + a * r0[1]) / det);
    }
    p.knee = +p.knee.toFixed(2); p.hrot = +p.hrot.toFixed(2);
  };
  const onFeet = (p) => { const J = S(p), t = (s) => V.add(V.lerp(J['heel' + s], J['toe' + s], 0.55), [0, 0.01, (s === 'R' ? 1 : -1) * 0.045]);
    p.ik = { handL: { at: t('L') }, handR: { at: t('R') } }; };
  const onShins = (p) => { const J = S(p), t = (s) => V.add(V.lerp(J['knee' + s], J['ankle' + s], 0.3), [0.05, 0.02, (s === 'R' ? 1 : -1) * 0.02]);
    p.ik = { handL: { at: t('L') }, handR: { at: t('R') } }; };
  shinsUp(poses.baby); head(poses.baby); onFeet(poses.baby);
  head(poses.hug); onShins(poses.hug);
  for (const [at, pose] of extra) {
    const m = Object.assign({}, poses[at], pose);
    if (pose.headLift !== undefined) head(m, pose.headLift); else head(m);
    onFeet(m); pose.neck = m.neck; pose.ik = m.ik;
  }
  return poses;
}

window.EXERCISE = {
  id: 'happy_baby',
  name: { tr: 'Mutlu Bebek Pozu', en: 'Happy Baby Pose', es: 'Postura del bebé feliz' },
  category: { tr: 'Yoga · Kalça', en: 'Yoga · Hips', es: 'Yoga · Cadera' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['adductors', 'hamstrings', 'glutes'],
  tempo: '4-8-3',
  hold: true, holdDur: 3,
  view: { yaw: 14, pitch: 48 },
  alt: { yaw: 90, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Sakrum yerde, kaval kemikleri dik', en: 'Sacrum down, shins vertical', es: 'Sacro abajo, espinillas verticales' } },
  setupView: { yaw: 50, pitch: 22 },
  contacts: ['pelvis', 'shoulderR', 'shoulderL'],
  props: [['mat', { at: [-0.25, 0, 0], length: 1.6, width: 0.7 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fitBaby(RAW, this.mistakes.map((m) => [m.at, m.pose]))); },
  rest: 'hug',
  rep: [
    { to: 'baby', dur: 3.5, phase: 0 },
    { to: 'baby', dur: 1.0, phase: 1 },
    { to: 'hug', dur: 3.0, phase: 2 },
  ],
  setup: { tr: 'Sırtüstü yat, dizleri göğsüne çek, elleri kaval kemiklerine koy.',
    en: 'Lie on your back, draw the knees to the chest, hands on the shins.',
    es: 'Boca arriba, lleva las rodillas al pecho, manos en las espinillas.' },
  phases: [
    { name: { tr: 'Dizleri aç', en: 'Open the knees', es: 'Abre las rodillas' }, breath: 'in', slow: 1.0,
      text: { tr: 'Dizleri koltuk altlarına doğru aç, ayak tabanları tavana. Ayakların dışını tut.', en: 'Open the knees toward the armpits, soles up. Hold the outer feet.', es: 'Abre las rodillas hacia las axilas, plantas arriba. Toma el borde de los pies.' } },
    { name: { tr: 'Pozda kal', en: 'Hold', es: 'Mantén' }, breath: 'easy', line: ['kneeR', 'ankleR'],
      text: { tr: 'Ayakları ellere it, dizleri yere doğru çek. Sakrum yerde.', en: 'Press the feet into the hands, draw the knees down. Sacrum heavy.', es: 'Empuja los pies contra las manos, rodillas abajo. Sacro pesado.' } },
    { name: { tr: 'Bırak', en: 'Release', es: 'Suelta' }, breath: 'out',
      text: { tr: 'Ayakları bırak, dizleri göğse topla.', en: 'Let go of the feet and hug the knees in.', es: 'Suelta los pies y abraza las rodillas.' } },
  ],
  tempoText: { tr: '4 sn aç · 5-8 nefes kal · 3 sn topla', en: '4 s open · 5-8 breaths · 3 s hug', es: '4 s abre · 5-8 respiraciones · 3 s abraza' },
  mistakes: [
    { title: { tr: 'Kuyruk sokumu kalkıyor', en: 'Tailbone lifts', es: 'El coxis se eleva' },
      text: { tr: 'Ayaklar fazla çekilir, leğen yerden kalkar.', en: 'Pulling too hard lifts the pelvis off the mat.', es: 'Tirar demasiado despega la pelvis.' },
      fix: { tr: 'Dizlerin arkasından ya da kemerle tut', en: 'Hold behind the knees or use a strap', es: 'Sujeta tras las rodillas o usa una correa' },
      fixText: { tr: 'Sakrum yerde kalacak kadar çek', en: 'Pull only as far as the sacrum stays down', es: 'Tira solo hasta donde el sacro siga abajo' },
      at: 'baby', pose: { hip: 146, knee: 92, lumbar: 18, ground: G(0, 0.06) }, view: { yaw: 90, pitch: 6 }, marks: ['pelvis'], parts: ['pelvis', 'waist'] },
    { title: { tr: 'Baş ve omuzlar kalkıyor', en: 'Head and shoulders lift', es: 'Cabeza y hombros se elevan' },
      text: { tr: 'Ayaklara uzanırken boyun zorlanır.', en: 'Reaching for the feet strains the neck.', es: 'Al buscar los pies se tensa el cuello.' },
      fix: { tr: 'Başı yere bırak', en: 'Rest the head down', es: 'Apoya la cabeza' },
      fixText: { tr: 'Uzanamıyorsan dizlerin arkasını tut', en: "Can't reach? Hold behind the knees", es: '¿No llegas? Sujeta tras las rodillas' },
      at: 'baby', pose: { thoracic: 20, shrug: 0.03, headLift: 0.09, ground: G(0.05, 0) }, view: { yaw: 60, pitch: 12 }, marks: ['head', 'shoulderR'], parts: ['neck', 'upper'] },
  ],
  cues: [{ tr: 'Ayakları ellere it', en: 'Press feet into hands', es: 'Pies contra las manos' },
    { tr: 'Sakrum yerde', en: 'Sacrum heavy', es: 'Sacro pesado' },
    { tr: 'Dizler geniş', en: 'Knees wide', es: 'Rodillas abiertas' }],
};
}
