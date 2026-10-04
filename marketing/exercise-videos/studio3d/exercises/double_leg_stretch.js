/* Double Leg Stretch (Pilates mat, supine curl-up). the_hundred base: pelvis + waist contacts, thoracic 30 + neck 40
 * unchanged in every pose (head and shoulder blades stay up, lower back on the mat).
 * - ball: both knees hugged in (thigh ~130° from the mat, knees ~145°), hands on the outside of the ankles / low shins.
 * - reach: legs long at ~45°, arms on a high diagonal by the ears (shoulder ~150° to the trunk).
 * - wide: arms circle out to the sides while the knees bend back in (the exhale is split into wide + ball so the hands
 *   travel around the outside instead of straight through the face).
 * Arms are FK in every pose; for the ball the arm angles are fitted (lazily) so the hands hold the outside of the ankles. */
{
const MAT = 0.008;
const G = (w = -0.016) => [['pelvis', MAT], ['waist', MAT + w]];
const BASE = { trunk: -90, abd: 2, hrot: 6, lumbar: 6, thoracic: 30, neck: 40, flat: false, ground: G(), bendR: [1, 0.5, -0.8], bendL: [1, 0.5, 0.8] };
const RAW = {
  ball: { ...BASE, hip: 118, knee: 146, ankle: -25, sh: 40, shAbd: 22, el: 60, protract: 0.04, palm: 'in', curl: 0.45, _shin: 1 },
  reach: { ...BASE, hip: 33, knee: 0, ankle: -32, sh: 162, shAbd: 12, el: 2, protract: 0.02, palm: 'in', curl: 0.1 },
  wide: { ...BASE, hip: 70, knee: 75, ankle: -30, sh: 95, shAbd: 62, el: 10, protract: 0.02, palm: 'forward', curl: 0.15 },
};
const CTX = { anchorX: ['pelvis'], anchorAt: [0, 0] };

function fit(poses, extra) {
  const { V, solve, expand } = FB;
  const S = (p) => solve(expand(Object.assign({}, p, { ik: undefined })), CTX).J;
  // ball: FK arm angles (sh, shAbd, el) fitted so the hands land on the outside of the ankles / low shins. FK (not IK)
  // in every pose, so the hands travel on joint-space arcs (over the face to the overhead reach, around the sides back).
  const fitArms = (p) => {
    const J0 = S(p);
    const tgt = (s) => V.add(V.lerp(J0['ankle' + s], J0['knee' + s], 0.12), [0, 0, (s === 'R' ? 1 : -1) * 0.07]);
    const err = (q) => { const J = S({ ...p, sh: q[0], shAbd: q[1], el: q[2] }); return V.len(V.sub(J.handR, tgt('R'))) + V.len(V.sub(J.handL, tgt('L'))); };
    let best = [p.sh, p.shAbd, p.el], be = err(best);
    for (const st of [8, 4, 2, 1, 0.5]) {
      let imp = true;
      while (imp) { imp = false;
        for (let i = 0; i < 3; i++) for (const d of [-st, st]) { const q = best.slice(); q[i] += d; if (q[2] < 0) continue; const e = err(q); if (e < be - 1e-5) { be = e; best = q; imp = true; } } }
    }
    p.sh = +best[0].toFixed(1); p.shAbd = +best[1].toFixed(1); p.el = +best[2].toFixed(1); p._err = be;
  };
  fitArms(poses.ball);
  return poses;
}

window.EXERCISE = {
  id: 'double_leg_stretch',
  name: { tr: 'Çift Bacak Esnetme (Double Leg Stretch)', en: 'Double Leg Stretch', es: 'Estiramiento de ambas piernas (double leg stretch)' },
  category: { tr: 'Pilates · Karın', en: 'Pilates · Core', es: 'Pilates · Core' },
  equipmentLabel: { tr: 'Mat', en: 'Mat', es: 'Esterilla' },
  muscles: ['core', 'obliques', 'delts'],
  tempo: '2-2',
  view: { yaw: 90, pitch: 6, zoom: 1.05 },
  alt: { yaw: 22, pitch: 22, title: { tr: 'Önden bak', en: 'Front view', es: 'Vista frontal' },
    text: { tr: 'Kollar yanlardan geniş bir daire çizer', en: 'Arms sweep a wide circle out to the sides', es: 'Los brazos trazan un círculo amplio' } },
  setupView: { yaw: 45, pitch: 20 },
  contacts: ['pelvis', 'waist'],
  props: [['mat', { at: [0.05, 0.006, 0], length: 2.0 }]],
  ctx: CTX,
  get poses() { return this._poses || (this._poses = fit(RAW)); },
  rest: 'reach',
  // rest = the long reach (not the ball) so the mistake transitions stay short; one rep = circle + hug, then reach again
  rep: [
    { to: 'wide', dur: 1.0, phase: 0 },
    { to: 'ball', dur: 1.2, phase: 1 },
    { to: 'reach', dur: 1.8, phase: 2 },
  ],
  setup: { tr: 'Baş ve kürek kemiklerini kaldır, bel minderde. Kollar kulak hizasında, bacaklar 45°de uzun ve bitişik.',
    en: 'Curl head and shoulder blades up, lower back down. Arms by the ears, legs long and together at 45°.',
    es: 'Eleva cabeza y escápulas, lumbar abajo. Brazos junto a las orejas, piernas largas y juntas a 45°.' },
  phases: [
    { name: { tr: 'Kollar daire çizer', en: 'Circle the arms', es: 'Círculo con los brazos' }, breath: 'out',
      text: { tr: 'Nefes ver; kollar yanlardan geniş bir daireyle aşağı iner.', en: 'Exhale; the arms circle wide out to the sides and down.', es: 'Exhala; los brazos bajan por los lados en un círculo amplio.' } },
    { name: { tr: 'Dizleri sar', en: 'Hug the knees', es: 'Abraza las rodillas' }, breath: 'out',
      text: { tr: 'Dizler göğse gelir, eller bileklere. Sıkı bir top ol.', en: 'Knees come in, hands to the ankles. Make a tight ball.', es: 'Rodillas al pecho, manos a los tobillos. Hazte una bola.' } },
    { name: { tr: 'Nefes al, uzan', en: 'Inhale and reach', es: 'Inhala y alarga' }, breath: 'in', line: ['pelvis', 'waist'],
      text: { tr: 'Kollar kulak hizasında yukarı, bacaklar 45°ye uzar. Gövde kıpırdamaz.', en: 'Arms reach up by the ears, legs extend to 45°. The trunk stays still.', es: 'Brazos junto a las orejas, piernas a 45°. El tronco no se mueve.' } },
  ],
  tempoText: { tr: '2 sn daire ve topla · 2 sn uzan', en: '2 s circle and hug · 2 s reach', es: '2 s círculo y abrazo · 2 s alarga' },
  mistakes: [
    { title: { tr: 'Bel minderden kalkıyor', en: 'Lower back arches', es: 'La lumbar se arquea' },
      fix: { tr: 'Bacakları yükselt', en: 'Raise the legs', es: 'Sube las piernas' },
      fixText: { tr: 'Bel düz kalmıyorsa bacaklar 60-70°de', en: 'If the back lifts, reach the legs to 60-70°', es: 'Si la lumbar se despega, piernas a 60-70°' },
      at: 'reach', pose: { lumbar: -10, thoracic: 22, ground: G(0.03), hip: 46 }, marks: ['waist'], parts: ['waist', 'pelvis'] },
    { title: { tr: 'Baş geriye düşüyor', en: 'Head drops back', es: 'La cabeza cae atrás' },
      fix: { tr: 'Kolları kulak hizasında tut', en: 'Keep the arms by the ears', es: 'Brazos a la altura de las orejas' },
      fixText: { tr: 'Çene hafif içeride, baş havada kalır', en: 'Chin nodded, head stays lifted', es: 'Barbilla recogida, cabeza arriba' },
      at: 'reach', pose: { thoracic: 8, neck: 8, sh: 172 }, marks: ['head'], parts: ['neck', 'chest'] },
  ],
  cues: [{ tr: 'Uzan, sonra sıkı top', en: 'Reach long, then a tight ball', es: 'Alarga y luego bola' },
    { tr: 'Karın içe, bel düz', en: 'Belly in, back flat', es: 'Abdomen adentro, lumbar plana' },
    { tr: 'Çene içeride, baş havada', en: 'Chin nodded, head up', es: 'Barbilla recogida, cabeza arriba' }],
};
}
