// visual fixture for the latPulldown prop
window.EXERCISE = { id: '_latPulldown', name: { tr: 'latPulldown (test)' }, category: { tr: 'Makine' }, muscles: ['quads'],
  view: { yaw: 90, pitch: 8 }, props: [['latPulldown', { at: [0, 0, 0], seatH: 0.48 }]], ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: { a: { hip: 90, knee: 90, sh: 170, shAbd: 25, el: 10, ground: [['pelvis', 0.48]] }, b: { trunk: -10, hip: 95, knee: 90, sh: 40, shAbd: 50, el: 110, ground: [['pelvis', 0.48]] } }, rest: 'a', rep: [{ to: 'b', dur: 1.5, phase: 0 }, { to: 'a', dur: 1.5, phase: 1 }],
  phases: [{ name: { tr: 'A' }, breath: 'out' }, { name: { tr: 'B' }, breath: 'in' }], setup: { tr: 'test' }, cues: [] };
