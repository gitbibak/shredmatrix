# Writing an exercise file (`exercises/<id>.js`)

Each file sets `window.EXERCISE = {...}`. The engine (IK skeleton → skinned 3D character → motion-graphic template) turns it into a ~40-46 s, 1080x1920, 60 fps video in tr/en/es.
**Start by copying the closest approved example:** `goblet_squat.js` (standing, held weight, setup view), `push_up.js` (prone, two-point ground contact, planted hands), `lateral_raise.js` (front view, dumbbells in both hands).
Read `docs/LEARNINGS.md` first.

Source of truth for the movement: the matching spec in `../research/specs/*.json` (angles, phases, tempo, breathing, cues, mistakes). The manifest `exercises/_manifest.json` lists every id, its batch, view, props and status.

## Body model (metres; y up, x = facing direction, z = character's right; floor y = 0)
Dimensions are read from the 3D rig at load (female, ~1.75 m with shoes; hip joint 0.925, thigh 0.416, shin 0.444, upper arm 0.26, forearm 0.237).
Do not hard-code lengths; reason with angles and let IK/ground contacts place the body.

## Pose parameters (degrees unless noted; omitted = 0). Plain key = both sides; suffix `L`/`R` for one side.
| key | meaning |
|---|---|
| `trunk` | whole-body lean from vertical: 0 standing, 45 hinge, 90 prone (face down), -90 supine (face up) |
| `roll` | lateral body tilt; NOTE the sign: + tips toward the character's LEFT (-z). `yaw` turns the whole body (prefer moving the camera) |
| `lumbar`, `thoracic` | spine flexion (+ round, - arch); `side` lateral bend (+ = toward the character's LEFT, same sign rule as roll); `twist` rotation |
| `neck` | + chin down, - head back; `headTurn` |
| `hip` / `abd` / `hrot` | hip flexion (+ thigh forward), abduction, external rotation (turn-out) |
| `knee` | knee flexion (0 straight … 130 deep squat) |
| `ankle` | dorsiflexion (+ toes up); ignored when the foot is flat |
| `sh` / `shAbd` / `shRot` | shoulder flexion (90 forward, 180 overhead, - behind), abduction (90 = T), twist of the elbow-bend plane |
| `el` | elbow flexion |
| `shrug`, `protract` | scapula elevation / protraction in metres (0.03-0.06) |
| `holdL`, `holdR` | hand target relative to the chest in the thorax frame `[fwd, up, outward]` (m), solved with IK. Use it for anything held at the body |
| `elbowPole`, `kneePole` | direction the elbow/knee points for IK, thorax/pelvis frame `[fwd, up, outward]` |
| `ground` | contacts resting on a surface: `[['shoulderR', 0], ['heelR', 0]]`; with 2 contacts the body rotates rigidly so both touch. Second value = surface height (bench 0.45, reformer carriage `FB.REFORMER.top` = 0.38). **Keep the same contact names across poses** where possible |
| `flat`, `flatL/R` | force feet flat (default: when the shin is near vertical); `false` for toes/pointed feet |
| `pos` | extra `[x,y,z]` offset (jumps) |
| `unplant` | release planted effectors in this pose, e.g. `['ankleL']` |
| `ik` | `{ handR: { at: [x,y,z] } }` absolute world target |
| `noAvoid` | disable arm/torso collision avoidance (rarely needed) |
| `handFlat`, `handFlatL/R` | weight-bearing flat palm (wrist extended). Automatic when the hand is a `ground` contact or below 7.5 cm; the WRIST then sets the body height, so straight-arm poses (plank top, tabletop) sit ~4 cm lower than before. `handSurface` = support height if not the floor |
| `palm`, `palmL/R` | free-hand palm direction: `'down' 'up' 'in' 'out' 'forward' 'back'`, or a vector `[fwd, up, outward]` in the thorax frame — vectors BLEND smoothly between poses (use them for rotating palms, e.g. Arnold press) |
| `curl`, `curlL/R` | finger curl 0 (long, reaching) … 1 (fist); grips set 1 automatically |

Contact names: `heel* toe* ball* hand* knee* elbow* shoulder* pelvis chest head` (`*` = L/R).

### Plants, anchor, collisions
- `ctx.plant: ['ankleL','ankleR']` keeps feet exactly where they are in the `rest` pose (squats, lunges, hinges). `['handL','handR']` for push-ups, planks, quadruped.
- `ctx.anchorX` = joints whose mean x/z is pinned to `ctx.anchorAt` ([x, z]). Default is the ankles; use the toes for push-ups, the feet on the footbar for reformer footwork, the pelvis for lying/seated work.
- Arms are automatically kept outside the torso (elbow swivel). If the elbows end up flared, the hands are too close to the shoulders: move the hold target forward/down or set `elbowPole`.

### Props (`props: [[name, opts], ...]`)
Held: `dumbbell {grip:'neutral'|'supinated'|'pronated', sides}`, `goblet`, `kettlebell {side|both}`, `barbell {grip}`, `ring {between:[jointA, jointB]}`, `strap {through:[joints or points]}`.
Floor/studio: `mat {at,length,width}`, `bench {at,length,width,height}`, `inclineBench {at,incline,height}`, `box {at,size}`, `step {at,size}`, `block {at}`, `bolster {at,axis,length}`, `blanket {at,size}`, `foamRoller {at,axis}`, `ball {at,r}`, `wall {x}`, `pole {at,height}`, `rack {x,hook}`, `pullupBar {x,y}`, `band {from,sides}`, `cable {x,y,side|both}`.
Apparatus: `reformer {carriage(sol)→x | offset, springs, footbar, footbarX, footbarH (above the carriage, default 0.36), straps:[joints], box:'short'|'long', boxOffset, jumpBoard:true (vertical board at the foot end, x≈1.12, for jumps), platform:true (standing platform at the foot end)}` (headrest 0.25 m centred at carriage -0.52) (frame along +x, footbar at x = 1.0, carriage top = 0.38, the carriage follows the pelvis by default); `wundaChair {at, follow: joint | pedal: deg}`.
Machines (fixed frame at `o.at` = seat/pad reference; the moving part follows the body): `legPress {at, seatH, back, rail}` (platform follows the balls of the feet), `hackSquat {at, rail}` (back/shoulder pads ride with the trunk), `legCurl {at, height, length, tilt}` (roller behind the ankles), `legExtension {at, seatH, back}` (roller in front of the ankles), `seatedCalf {at, seatH}`, `latPulldown {at, seatH, top}` (cable + long bar between the hands), `pecDeck {at, seatH, pivot}`, `chestPress {at, seatH, back, pivot}`. Visual fixtures: `dev/fixtures/_legExtension.js` etc. (`player.html?ex=_legExtension`).
`at` may be a function `(sol) => [x,y,z]` to follow the body.
Framing is automatic and includes every prop.

## Exercise object
```js
window.EXERCISE = {
  id, name:{tr,en,es}, category:{tr,en,es}, equipmentLabel:{tr,en,es},
  muscles: ['quads','glutes'],          // quads glutes hamstrings calves core obliques lowerback chest lats upperback delts biceps triceps forearms adductors tibialis
  tempo: '2-0.5-1',
  view:  { yaw: 90, pitch: 5 },         // 90 side (faces right), 0 front, 30-60 three-quarter; zoom, dy optional
  alt:   { yaw: 18, pitch: 7, title:{...}, text:{...} },     // second view during tempo reps (caption sits above the card)
  setupView: { yaw: 28, pitch: 12 },    // optional camera for the setup chapter (show stance width / hand placement)
  setupMarks: [{ type:'span', joints:['ankleR','ankleL'], label:{tr,en,es} }, { type:'aline', joints:[...] }],
  props, ctx, poses: { start:{...}, bottom:{...} }, rest: 'start',
  rep: [ { to:'bottom', dur:2.0, phase:0 }, { to:'bottom', dur:0.5, phase:1 }, { to:'start', dur:1.0, phase:2 } ],
  setup: {tr,en,es},
  phases: [ { name, text, breath:'in'|'out'|'hold'|'easy', arc:[a,b,c], line:[...], marks:[...] } ],
  tempoText: {tr,en,es},
  mistakes: [ { title, fix, fixText, at:'bottom', pose:{overrides}, view:{yaw}, marks:[joints], line:[joints], parts:['thigh','shin'] } ],  // max 2 shown
  cues: [ {tr,en,es} x3 ],
  hold: true, holdDur: 6,               // isometric / yoga holds
  pump: { key: 'sh', amp: -9, hz: 2.5 },// in-pose oscillation (Hundred arm beats, pulses): whole beats per breath window
  side: 'R',                            // one-sided exercise: muscle glow only on this side
  repLabel: { tr: 'TUR', en: 'ROUND', es: 'RONDA' },   // rep counter label when one 'rep' is not a repetition
  tempoReps: 3,                         // override the automatic rep count
};
```
Guidance (from user feedback):
- **Arc** only on the phase where the angle is the lesson (bottom/hold), with joints `[proximal, vertex, distal]`. No `trace` paths that run behind the body.
- The ghost of the target pose is automatic on moving phases.
- Step cards stay on screen long enough to read (auto: ~17 characters/s); `phases[i].hold` (s) forces a longer card.
- Barbell/plates in side view: plates between the camera and the body are drawn see-through automatically, so use the true side view the spec asks for.
- Hands holding a bar that does not move with the body: give world IK targets per pose (`ik: { handL:{at}, handR:{at} }`, see barbell_row.js `BAR()`); a mistake that changes the trunk needs its own targets.
- Yoga/quadruped transitions where feet must not slide: copy `pinFeet()` from downward_dog.js (ankle IK targets per pose).
- Feet on a bar (reformer footbar): copy `onBar()` from footwork.js (finds the hip angle that puts the ball of the foot on the bar and pins the ankles).
- Bench work: copy dumbbell_bench_press.js (contacts on the pad height, soft lockout at the top, elbows level with the pad).
- Red tint `parts` accept a side suffix (`'upperR'`, `'foreR'`) and are drawn as tubes along those segments only.
- `elbowPole`/`kneePole`: if one pose has it, give it to ALL poses (and mistake overrides) — a pole that appears only in the target pose flips the limb during the transition. Never use a pole to fake hyperextension.
- Mistakes: clearly visible but believable. Measure them (e.g. valgus 10-12 cm inside the foot line, not 20+).
- Card text: 1-2 short sentences, max ~95 characters, in natural tr (main language), en and es.
- One-sided moves: the right side works (near the camera in side view); say "switch sides" in the setup text.

## Verify (mandatory before marking `qa_passed`)
```bash
node dev/measure.mjs <id>                       # joint angles per pose + mistakes -> compare with the spec angles
node dev/qa.mjs <id> --sheet                    # automatic checks + out/qa/tr/<id>.png contact sheet
node dev/stills.mjs <id> tr 9.5,12 /tmp/x.png   # specific moments
node dev/zoom.mjs <id> <t> <joint> 150 /tmp/z.png   # full-res close-up (hands on the bar? feet on the floor? arms outside the body?)
```
Look at the PNGs yourself. Check: contacts (no floating or sinking), joints bending the right way, knees over the toes, held objects in the hands, arms outside the torso, nothing cut off, mistakes visibly different, text not overflowing. The measured angles must be within ~5-8° of the spec.
