// visual fixture for the legPress prop
window.EXERCISE = { id: '_legPress', name: { tr: 'legPress (test)' }, category: { tr: 'Makine' }, muscles: ['quads'],
  view: { yaw: 90, pitch: 8 }, props: [['legPress', { at: [-0.1, 0, 0], seatH: 0.42, back: 50 }]], ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: { a: { trunk: -50, hip: 120, knee: 100, flat: false, ankle: 0, sh: 20, el: 30, ground: [['pelvis', 0.45]] }, b: { trunk: -50, hip: 60, knee: 10, flat: false, ankle: 0, sh: 20, el: 30, ground: [['pelvis', 0.45]] } }, rest: 'a', rep: [{ to: 'b', dur: 1.5, phase: 0 }, { to: 'a', dur: 1.5, phase: 1 }],
  phases: [{ name: { tr: 'A' }, breath: 'out' }, { name: { tr: 'B' }, breath: 'in' }], setup: { tr: 'test' }, cues: [] };
