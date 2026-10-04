// visual fixture for the reformer prop (not a production exercise)
window.EXERCISE = {
  id: '_reformer_test', name: { tr: 'Reformer Footwork (test)' }, category: { tr: 'Reformer' }, muscles: ['quads', 'glutes'],
  view: { yaw: 90, pitch: 10 }, alt: { yaw: 40, pitch: 16 },
  props: [['reformer', { springs: 3, straps: [] }], ['ring', { between: ['handL', 'handR'] }]],
  ctx: { anchorX: ['ballL', 'ballR'], anchorAt: [1.0, 0] },
  poses: {
    start: { trunk: -90, hip: 72, knee: 105, ankle: 15, flat: false, sh: 70, el: 20, ground: [['shoulderR', 0.38], ['pelvis', 0.38]] },
    press: { trunk: -90, hip: 14, knee: 8, ankle: 15, flat: false, sh: 70, el: 20, ground: [['shoulderR', 0.38], ['pelvis', 0.38]] },
  },
  rest: 'start', rep: [{ to: 'press', dur: 1.5, phase: 0 }, { to: 'start', dur: 1.5, phase: 1 }],
  phases: [{ name: { tr: 'İt' }, breath: 'out' }, { name: { tr: 'Dön' }, breath: 'in' }], setup: { tr: 'test' }, cues: [],
};
