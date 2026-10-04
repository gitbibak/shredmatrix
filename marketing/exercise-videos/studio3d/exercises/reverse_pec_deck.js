/* Reverse pec deck (machine rear-delt fly). Seated facing the chest pad (pecDeck prop: the pad follows the thorax),
 * FK arms at shoulder height (sh 90) sweep from in front (shAbd 15) to in line with the shoulders (shAbd 95).
 * Spec note: start horizontal abduction 0 would put the upper arms through the 0.32 m wide chest pad, so the start is 15°.
 * View: the spec asks for a front view, but the machine column and chest pad hide the torso and the near arm from the
 * front, so the main view is from behind (yaw 160): both arms sweep symmetrically and the rear delts/blades are visible.
 * Elbow bend direction bendR/L = forward + medial keeps the soft elbow natural at both ends (no flip through sh 90). */
{
const SEAT = { ground: [['pelvis', 0.43]], trunk: 3, hip: 92, knee: 90, abd: 8, hrot: 6, neck: 0, sh: 90, el: 15, bendR: [1, 0, -1], bendL: [1, 0, 1] };

window.EXERCISE = {
  id: 'reverse_pec_deck',
  name: { tr: 'Reverse Pec Deck', en: 'Reverse Pec Deck (Machine Rear Delt Fly)', es: 'Contractora inversa (peck deck inverso)' },
  category: { tr: 'Omuz · Sırt', en: 'Shoulders · Back', es: 'Hombros · Espalda' },
  equipmentLabel: { tr: 'Pec deck makinesi', en: 'Pec deck machine', es: 'Máquina contractora' },
  muscles: ['delts', 'upperback'],
  tempo: '1-0.5-2',
  view: { yaw: 160, pitch: 12 },
  alt: { yaw: 88, pitch: 6, title: { tr: 'Yandan bak', en: 'Side view', es: 'Vista lateral' },
    text: { tr: 'Göğüs pedde, kollar omuz hizasında', en: 'Chest on the pad, arms at shoulder height', es: 'Pecho en el respaldo, brazos a la altura del hombro' } },
  setupView: { yaw: 55, pitch: 12 },
  props: [['pecDeck', { at: [0, 0, 0], seatH: 0.43, pivot: [0.5, 1.75, 0] }]],
  ctx: { anchorX: ['pelvis'], anchorAt: [0, 0], plant: ['ankleL', 'ankleR'] },
  contacts: ['pelvis', 'chest', 'ballL', 'ballR'],
  poses: {
    // chest on the pad, arms long in front at shoulder height, soft elbows
    front: { ...SEAT, shAbd: 15, protract: 0.02 },
    // arms swept back in line with the shoulders, elbows leading, blades squeezed
    open: { ...SEAT, shAbd: 95, protract: -0.03 },
  },
  rest: 'front',
  rep: [
    { to: 'open', dur: 1.3, phase: 0 },
    { to: 'open', dur: 0.5, phase: 1 },
    { to: 'front', dur: 2.0, phase: 2 },
  ],
  setup: { tr: 'Yüzün pede dönük otur, göğüs pede yaslı. Koltuğu tutamaklar omuz hizasında olacak şekilde ayarla.',
    en: 'Sit facing the pad, chest against it. Set the seat so the handles are at shoulder height.',
    es: 'Siéntate de cara al respaldo, pecho apoyado. Ajusta el asiento: agarres a la altura del hombro.' },
  phases: [
    { name: { tr: 'Geriye aç', en: 'Sweep back', es: 'Abre atrás' }, breath: 'out',
      text: { tr: 'Kolları geniş bir yayla geriye aç, dirsekler önde gitsin.', en: 'Sweep the arms back in a wide arc, elbows leading.', es: 'Abre los brazos atrás en un arco amplio, codos primero.' } },
    { name: { tr: 'Sık', en: 'Squeeze', es: 'Aprieta' }, breath: 'hold', line: ['handL', 'shoulderL', 'shoulderR', 'handR'],
      text: { tr: 'Kollar omuzlarla aynı hizada. Kürekleri sık, omuzlar aşağıda.', en: 'Arms in line with the shoulders. Squeeze the blades, shoulders down.', es: 'Brazos alineados con los hombros. Junta las escápulas, hombros abajo.' } },
    { name: { tr: 'Kontrollü dön', en: 'Return slowly', es: 'Vuelve despacio' }, breath: 'in',
      text: { tr: 'İki saniyede öne dön, ağırlık yığına değmesin.', en: 'Two seconds back to the front; don’t let the stack touch.', es: 'Dos segundos al frente; que las placas no toquen.' } },
  ],
  tempoText: { tr: '1 sn aç · 0,5 sn sık · 2 sn dön', en: '1 s open · 0.5 s squeeze · 2 s return', es: '1 s abre · 0,5 s aprieta · 2 s vuelve' },
  mistakes: [
    { title: { tr: 'Dirsekleri büküp çekmek', en: 'Rowing with bent elbows', es: 'Remar con codos doblados' },
      fix: { tr: 'Dirsek açısı sabit', en: 'Fixed, soft elbow bend', es: 'Codo suave y fijo' },
      fixText: { tr: 'Kollar geniş yay çizer, eller kaburgaya çekilmez', en: 'Arms sweep wide; hands are not pulled to the ribs', es: 'Brazos en arco amplio; no lleves las manos a las costillas' },
      at: 'open', pose: { sh: 55, shAbd: 75, el: 95 }, marks: ['elbowL', 'elbowR'], parts: ['upper', 'fore'] },
    { title: { tr: 'Omuzlar kulağa kalkıyor', en: 'Shrugging', es: 'Encoger los hombros' },
      fix: { tr: 'Omuzları aşağı indir', en: 'Shoulders down', es: 'Hombros abajo' },
      fixText: { tr: 'Boyun uzun, iş arka omuzda', en: 'Long neck; let the rear delts work', es: 'Cuello largo; que trabajen los deltoides posteriores' },
      at: 'open', pose: { shrug: 0.06, neck: -6, sh: 98 }, marks: ['shoulderL', 'shoulderR'], parts: ['upper', 'neck'] },
  ],
  cues: [{ tr: 'Göğüs pedde', en: 'Chest on the pad', es: 'Pecho en el respaldo' },
    { tr: 'Dirsekler önde', en: 'Lead with the elbows', es: 'Codos primero' },
    { tr: 'Dönüşü kontrol et', en: 'Control the return', es: 'Controla la vuelta' }],
};
}
