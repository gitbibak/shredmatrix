// visual fixture for the legCurl prop
window.EXERCISE = { id: '_legCurl', name: { tr: 'legCurl (test)' }, category: { tr: 'Makine' }, muscles: ['quads'],
  view: { yaw: 90, pitch: 8 }, props: [['legCurl', { at: [0.5, 0, 0], height: 0.55 }]], ctx: { anchorX: ['pelvis'], anchorAt: [0, 0] },
  poses: { a: { trunk: 96, hip: -5, knee: 5, flat: false, ankle: -20, sh: 120, el: 60, ground: [['chest', 0.6], ['kneeR', 0.6]] }, b: { trunk: 96, hip: -5, knee: 115, flat: false, ankle: 0, sh: 120, el: 60, ground: [['chest', 0.6], ['kneeR', 0.6]] } }, rest: 'a', rep: [{ to: 'b', dur: 1.5, phase: 0 }, { to: 'a', dur: 1.5, phase: 1 }],
  phases: [{ name: { tr: 'A' }, breath: 'out' }, { name: { tr: 'B' }, breath: 'in' }], setup: { tr: 'test' }, cues: [] };
