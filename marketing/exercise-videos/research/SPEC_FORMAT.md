# Exercise motion spec format

Each research batch writes `specs/<batch>.json`: a JSON array of movement specs. One spec per **canonical movement**.
These specs drive procedural 3D animation (a jointed human mannequin with IK), so numbers matter more than prose.

## Canonicalization rules
- Merge naming variants of the same movement into one spec and list every app name in `app_names`
  (e.g. "Lateral Raise", "Dumbbell Lateral Raise", "Lateral Raise (21s Method)" -> one spec `lateral_raise`).
- Keep genuinely different movements separate (e.g. Romanian Deadlift vs Deadlift; Bench Press vs Close Grip Bench Press may share a spec only if the visual difference is just grip width -> then put the difference in `variants`).
- Load/tempo/method suffixes ("(hafif)", "(RPE 9)", "Tempo ... (3 sn iniş)", "x5", "(Dropset)") are variants, not new specs.
- Items that are a flow, a full class, a sequence of many moves or not a movement at all (e.g. "Full Classical Repertoire", "Serbest Vinyasa Flow", "Joseph Pilates Orijinal 34 Hareket", "Mat Koreografi") -> do NOT invent a spec; add them to the batch's `non_demo` list with a one-line reason and, if useful, the list of component movements.

## Angle conventions (degrees)
- `trunk_from_vertical`: 0 = upright, 90 = horizontal, positive = leaning forward, negative = leaning back. For lying positions give orientation instead (see `body_orientation`).
- `hip_flexion`: angle between trunk line and thigh; 0 = straight line (standing), 90 = thigh perpendicular to trunk, >90 deeper. Negative = hip extension.
- `knee_flexion`: 0 = straight leg, 90 = right angle, ~140 = full squat.
- `ankle_dorsiflexion`: shin forward tilt from vertical when foot flat (0 = vertical shin); negative = plantar flexion (on toes).
- `shoulder_flexion`: arm raised forward from hanging at side (0) to overhead (180). `shoulder_abduction`: same, sideways. `shoulder_horizontal_abduction`: for pressing/flys, 0 = arm pointing straight forward, 90 = arm out to the side in the frontal plane.
- `shoulder_extension`: arm behind the body. `shoulder_external_rotation` where relevant.
- `elbow_flexion`: 0 = straight arm.
- `spine_flexion` / `spine_extension` / `spine_lateral_flexion` / `spine_rotation`: whole-spine approximation, split into `lumbar` and `thoracic` when it matters (Pilates, yoga).
- `neck`: neutral unless stated.
- Stance/grip widths as multiples of shoulder width (e.g. `stance_width: 1.1`) and foot turn-out in degrees.
- For one-sided moves state which side is working and what the other limb does.

## Spec object
```json
{
  "id": "goblet_squat",
  "app_names": ["Goblet Squat", "Goblet Squat / Chair Squat"],
  "names": { "tr": "Goblet Squat", "en": "Goblet Squat", "es": "Sentadilla goblet" },
  "category": "strength_legs | strength_pull | strength_push | core | conditioning | yoga | pilates_mat | reformer",
  "equipment": ["dumbbell"],
  "equipment_setup": "Dumbbell held vertically against the sternum by the top bell, elbows under the weight",
  "body_orientation": "standing | supine | prone | side_lying | quadruped | seated | kneeling | half_kneeling | hanging | inverted",
  "primary_muscles": ["quadriceps", "gluteus maximus"],
  "secondary_muscles": ["adductors", "core", "upper back"],
  "camera": { "primary_view": "side | front | front_3q | back_3q | top", "secondary_view": "front", "why": "side shows hip-knee-ankle angles and torso lean; front shows knee tracking" },
  "start_pose": { "description": "...", "angles": { "hip_flexion": 0, "knee_flexion": 0, "...": 0 }, "contacts": ["both feet flat on floor"], "implement": "dumbbell at sternum height, 5 cm in front of chest" },
  "phases": [
    {
      "name": "descent",
      "description": "Push hips back and down, knees travel forward over toes, chest stays tall",
      "duration_s": 2.5,
      "breathing": "inhale and brace before descending",
      "end_angles": { "trunk_from_vertical": 30, "hip_flexion": 110, "knee_flexion": 115, "ankle_dorsiflexion": 30 },
      "contacts": ["both feet flat, heels down"],
      "implement_path": "dumbbell stays over mid-foot, elbows inside knees at bottom",
      "notes": "knees track over 2nd-3rd toe"
    }
  ],
  "rep_loop": "descent -> bottom_pause -> ascent (repeat)",
  "tempo_default": "3-1-1",
  "cues": ["Chest tall", "Knees out over toes", "Drive through the whole foot"],
  "mistakes": [
    { "mistake": "Knees cave inward (valgus)", "visual": "both knees collapse toward midline during ascent", "fix": "push knees out over toes" }
  ],
  "safety": "...",
  "regression": "...",
  "progression": "...",
  "variants": [{ "app_name": "Goblet Squat / Chair Squat", "difference": "sit to a chair to control depth" }],
  "sources": ["https://...", "https://..."],
  "confidence": "high | medium | low"
}
```

## Batch file shape
```json
{ "batch": "strength_pull", "specs": [ ... ], "non_demo": [ { "app_name": "...", "reason": "...", "components": ["..."] } ], "unmapped": [] }
```
Every input app name must appear exactly once: in some spec's `app_names`, in `non_demo`, or in `unmapped` (with a reason).
