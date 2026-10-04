// visual fixture for the legExtension prop
window.EXERCISE = { id: '_legExtension', name: { tr: 'legExtension (test)' }, category: { tr: 'Makine' }, muscles: ['quads'],
  view: { yaw: 90, pitch: 8 }, props: [['legExtension', { at: [0, 0, 0], seatH: 0.5 }]], ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: { a: { hip: 90, knee: 90, flat: false, ankle: 5, sh: 10, el: 10, ground: [['pelvis', 0.5]] }, b: { hip: 90, knee: 5, flat: false, ankle: 5, sh: 10, el: 10, ground: [['pelvis', 0.5]] } }, rest: 'a', rep: [{ to: 'b', dur: 1.5, phase: 0 }, { to: 'a', dur: 1.5, phase: 1 }],
  phases: [{ name: { tr: 'A' }, breath: 'out' }, { name: { tr: 'B' }, breath: 'in' }], setup: { tr: 'test' }, cues: [] };
