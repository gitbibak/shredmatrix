/* Standing dumbbell overhead triceps extension, one dumbbell held vertically in both hands (goblet prop = cupped top
 * plate). Hands meet at the midline, so the arms use IK holds from the shoulder joint with `noAvoid` and an elbow pole
 * pointing up (elbows to the ceiling). Upper arms stay ~vertical; the forearms fold behind the head (elbow ~120°). */
{
const { V } = FB;
const ST = { abd: 6, hrot: 6, knee: 3, hip: 0, trunk: 0, neck: 2, noAvoid: true, elbowPole: [0.25, 1, 0.12] };
const SH = () => { const s = FB.solve(FB.expand(ST), {}); const T = s.F.thorax, d = V.sub(s.J.shoulderR, s.J.chest); return [V.dot(d, T[0]), V.dot(d, T[1]), V.dot(d, T[2])]; };
const HOLD = (f, u, inward, extra) => { const s = SH(); return Object.assign({}, ST, { holdL: [s[0] + f, s[1] + u, s[2] - inward], holdR: [s[0] + f, s[1] + u, s[2] - inward] }, extra); };
window.EXERCISE = {
  id: 'dumbbell_overhead_triceps_extension',
  name: { tr: 'Dumbbell Overhead Triceps Extension', en: 'Dumbbell Overhead Triceps Extension', es: 'Extensión de tríceps sobre la cabeza' },
  category: { tr: 'Kol', en: 'Arms', es: 'Brazos' },
  equipmentLabel: { tr: 'Dambıl', en: 'Dumbbell', es: 'Mancuerna' },
  muscles: ['triceps', 'core'],
  tempo: '2-0-1.5',
  view: { yaw: 90, pitch: 6 },
  alt: { yaw: 18, pitch: 6, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dirsekler dar, tavana bakar', en: 'Elbows narrow, pointing up', es: 'Codos cerrados, hacia arriba' } },
  props: [['goblet']],
  ctx: { anchorX: ['ankleL', 'ankleR'], plant: ['ankleL', 'ankleR'] },
  get poses() {
    return this._p || (this._p = {
      top: HOLD(0.02, 0.585, 0.15),
      bottom: HOLD(-0.21, 0.12, 0.15),
    });
  },
  rest: 'top',
  rep: [
    { to: 'bottom', dur: 2.0, phase: 0 },
    { to: 'top', dur: 1.5, phase: 1 },
  ],
  setup: { tr: 'Dik dur, kaburgalar aşağıda. Dambılı iki elle üst plakasından tut, kollar başın üstünde.',
    en: 'Stand tall, ribs down. Hold one dumbbell by its top plate with both hands, arms overhead.',
    es: 'De pie, costillas abajo. Sujeta una mancuerna por el disco superior, brazos arriba.' },
  phases: [
    { name: { tr: 'İndir', en: 'Lower', es: 'Baja' }, breath: 'in', arc: ['shoulderR', 'elbowR', 'wristR'], line: ['shoulderR', 'elbowR'],
      text: { tr: 'Sadece dirsekleri bük, dambılı başın arkasına indir. Dirsekler tavana bakar.', en: 'Bend only the elbows and lower the bell behind your head. Elbows point up.', es: 'Flexiona solo los codos y baja tras la cabeza. Codos hacia arriba.' } },
    { name: { tr: 'Uzat', en: 'Extend', es: 'Extiende' }, breath: 'out', line: ['shoulderR', 'elbowR'],
      text: { tr: 'Dirsekleri düzelt, dambıl yeniden başın üstüne çıkar.', en: 'Straighten the elbows; the bell rises back overhead.', es: 'Estira los codos; la mancuerna vuelve arriba.' } },
  ],
  tempoText: { tr: '2 sn indir · 1,5 sn uzat', en: '2 s down · 1.5 s up', es: '2 s abajo · 1,5 s arriba' },
  get mistakes() {
    return this._m || (this._m = [
      { title: { tr: 'Dirsekler yana açılıyor', en: 'Elbows flare out', es: 'Codos abiertos' },
        fix: { tr: 'Dirsekleri tavana çevir', en: 'Point the elbows up', es: 'Codos hacia arriba' },
        fixText: { tr: 'Dirsekler omuz genişliğinde veya daha dar', en: 'Elbows shoulder-width or narrower', es: 'Codos al ancho de hombros o menos' },
        at: 'bottom', pose: { elbowPole: [0.1, 0.5, 1.2] }, view: { yaw: 18, pitch: 6 }, marks: ['elbowL', 'elbowR'], parts: ['upperR', 'upperL'] },
      { title: { tr: 'Bel kavisleniyor', en: 'Lower back arches', es: 'La zona lumbar se arquea' },
        fix: { tr: 'Karnı sık, kaburgalar aşağı', en: 'Brace, ribs down', es: 'Abdomen firme, costillas abajo' },
        fixText: { tr: 'Gövde dik, kalça sıkı', en: 'Torso upright, glutes tight', es: 'Torso recto, glúteos firmes' },
        at: 'bottom', pose: { lumbar: -15, trunk: -3, hip: -4 }, line: ['ankleR', 'pelvis', 'neck'], parts: ['waist', 'pelvis'] },
    ]);
  },
  cues: [{ tr: 'Dirsekler tavana', en: 'Elbows to the ceiling', es: 'Codos al techo' }, { tr: 'Kaburgalar aşağı', en: 'Ribs down', es: 'Costillas abajo' }, { tr: 'Üst kol sabit', en: 'Upper arms still', es: 'Brazos quietos' }],
};
}
