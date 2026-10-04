/* Bodyweight squat (copy of goblet_squat.js). Arms stay straight out in front at shoulder height as a counterweight (spec
 * equipment_setup option); swinging them up from the sides in the 1 s ascent moved the hands >6 cm per frame.
 * Feet: every pose carries ankle IK targets (ik.ankleL/R) = the standing feet, so the heel-rise mistake can roll the feet
 * onto the toes (heels up ~24°) and blend smoothly back (a plain ctx.plant would flag the lifted heels as a plant miss).
 * Spec bottom: trunk 35, hip 132, knee 125, shin 28. Spec shoulder flexion 85 contradicts "arms level with the shoulders"
 * at 35° trunk lean (85° to the trunk points the arms ~40° down); the arms are held level instead (120° to the trunk). */
{
const CTX = { anchorX: ['ankleL', 'ankleR'] };
const RAW = {
  start: { abd: 8, hrot: 18, sh: 86, shAbd: 6, el: 0, palm: 'down', neck: 0 },
  bottom: { trunk: 39, hip: 128, knee: 127, abd: 14, hrot: 22, sh: 120, shAbd: 6, el: 0, palm: 'down', neck: -14, thoracic: -4 },
};
// standing feet as IK targets for every pose; a mistake with `heelUp: deg` rolls both feet about the toe tip (shoe front stays on the floor)
function feet(poses, rest, mistakes) {
  const { V, solve, expand } = FB;
  const s = solve(expand(poses[rest]), CTX);
  const fr = (F) => ({ 0: F[0].slice(), 1: F[1].slice(), 2: F[2].slice() });
  const target = (deg) => {
    const ik = {};
    for (const S of ['L', 'R']) {
      const F = s.F['foot' + S], A = s.J['ankle' + S], P = s.J['toe' + S], ax = F[2], a = -deg * Math.PI / 180;
      ik['ankle' + S] = { at: V.add(P, V.rot(V.sub(A, P), ax, a)), foot: fr([V.rot(F[0], ax, a), V.rot(F[1], ax, a), F[2]]) };
    }
    return ik;
  };
  for (const k in poses) poses[k].ik = Object.assign({}, poses[k].ik, target(0));
  for (const m of mistakes) m.pose.ik = Object.assign({}, m.pose.ik, target(m.heelUp || 0));
  return poses;
}

window.EXERCISE = {
  id: 'bodyweight_squat',
  name: { tr: 'Vücut Ağırlığı Squat', en: 'Bodyweight Squat', es: 'Sentadilla con peso corporal' },
  category: { tr: 'Bacak · Kalça', en: 'Legs · Glutes', es: 'Piernas · Glúteos' },
  equipmentLabel: { tr: 'Ekipmansız', en: 'No equipment', es: 'Sin material' },
  muscles: ['quads', 'glutes', 'adductors'],
  tempo: '3-0.5-1',
  view: { yaw: 90, pitch: 5 },
  alt: { yaw: 18, pitch: 7, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' }, text: { tr: 'Dizler ayak uçlarıyla aynı yöne bakar', en: 'Knees track over the toes', es: 'Rodillas en línea con los pies' } },
  setupView: { yaw: 28, pitch: 12 },
  setupMarks: [{ type: 'span', joints: ['ankleR', 'ankleL'], label: { tr: 'Omuz genişliği', en: 'Shoulder width', es: 'Ancho de hombros' } }],
  contacts: ['ballL', 'ballR', 'heelL', 'heelR'],
  props: [],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = feet(RAW, 'start', this.mistakes)); },
  rest: 'start',
  rep: [
    { to: 'bottom', dur: 3.0, phase: 0 },
    { to: 'bottom', dur: 0.5, phase: 1 },
    { to: 'start', dur: 1.0, phase: 2 },
  ],
  setup: { tr: 'Ayaklar omuz genişliğinde, parmak uçları hafif dışa. Kolları omuz hizasında öne uzat.',
    en: 'Feet shoulder-width, toes slightly out. Arms straight out in front at shoulder height.',
    es: 'Pies al ancho de hombros, puntas algo fuera. Brazos al frente a la altura de los hombros.' },
  phases: [
    { name: { tr: 'İniş', en: 'Lower', es: 'Baja' }, breath: 'in', slow: 1.2,
      text: { tr: 'Kalçayı geri ve aşağı gönder. Kollar önde, göğüs dik kalır.', en: 'Sit the hips back and down. Arms forward, chest stays tall.', es: 'Cadera atrás y abajo. Brazos al frente, pecho arriba.' } },
    { name: { tr: 'Dipte dur', en: 'Pause', es: 'Pausa' }, breath: 'hold', arc: ['hipR', 'kneeR', 'ankleR'], line: ['heelR', 'ballR'],
      text: { tr: 'Uyluklar yere paralel ya da biraz altında. Topuklar yerde.', en: 'Thighs at or just below parallel. Heels stay down.', es: 'Muslos paralelos o algo más abajo. Talones en el suelo.' } },
    { name: { tr: 'Kalkış', en: 'Drive up', es: 'Sube' }, breath: 'out',
      text: { tr: 'Tüm ayakla yeri it, kalçanı sıkarak tamamen dikleş.', en: 'Push through the whole foot and squeeze your glutes to stand tall.', es: 'Empuja con todo el pie y aprieta glúteos hasta quedar de pie.' } },
  ],
  tempoText: { tr: '3 sn in · 0,5 sn dur · 1 sn kalk', en: '3 s down · 0.5 s pause · 1 s up', es: '3 s abajo · 0,5 s pausa · 1 s arriba' },
  mistakes: [
    { title: { tr: 'Dizler içe çöküyor', en: 'Knees cave in', es: 'Rodillas hacia dentro' },
      fix: { tr: 'Dizleri dışa it', en: 'Push the knees out', es: 'Empuja las rodillas hacia fuera' },
      fixText: { tr: 'Dizler 2. ve 3. parmak hizasında', en: 'Knees over the 2nd–3rd toe', es: 'Rodillas sobre el 2.º y 3.er dedo' },
      at: 'bottom', pose: { abd: 4, hrot: 0 }, view: { yaw: 14, pitch: 7 }, marks: ['kneeL', 'kneeR'], parts: ['thigh', 'shin'] },
    { title: { tr: 'Topuklar yerden kalkıyor', en: 'Heels lift off', es: 'Los talones se levantan' },
      fix: { tr: 'Tüm ayak yerde', en: 'Whole foot down', es: 'Todo el pie en el suelo' },
      fixText: { tr: 'Ağırlık orta ayakta; gerekirse daha az in', en: 'Weight over mid-foot; go less deep if needed', es: 'Peso en el mediopié; baja menos si hace falta' },
      at: 'bottom', heelUp: 24, pose: { trunk: 48, hip: 134, knee: 132 }, marks: ['heelR'], line: ['heelR', 'ballR'], parts: ['shin', 'foot'] },
  ],
  cues: [{ tr: 'Kalça geri ve aşağı', en: 'Hips back and down', es: 'Cadera atrás y abajo' }, { tr: 'Dizler ayak uçları yönünde', en: 'Knees over toes', es: 'Rodillas sobre los pies' }, { tr: 'Topuklar yerde', en: 'Heels down', es: 'Talones abajo' }],
};
}
