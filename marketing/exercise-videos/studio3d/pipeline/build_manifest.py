"""Build exercises/_manifest.json from ../research/specs/*.json (re-runnable; keeps existing status/notes).
python3 pipeline/build_manifest.py"""
import json, glob, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
SPECS = os.path.join(ROOT, '..', 'research', 'specs')
OUT = os.path.join(ROOT, 'exercises', '_manifest.json')

PROP_RULES = [  # (regex on equipment text, engine prop)
    (r'reformer|footbar|jump board|footstrap|pulley risers|long box|short box', 'reformer'),
    (r'wunda', 'wundaChair'), (r'magic.?circle|ring', 'ring'), (r'foam.?roller', 'foamRoller'), (r'small.?ball', 'ball'),
    (r'kettlebell', 'kettlebell'), (r'dumbbell', 'dumbbell'), (r'barbell|ez-bar|plates', 'barbell'), (r'rack', 'rack'),
    (r'incline bench', 'inclineBench'), (r'bench', 'bench'), (r'^mat|none \(mat\)', 'mat'), (r'block', 'block'),
    (r'bolster', 'bolster'), (r'blanket|cushion', 'blanket'), (r'^strap', 'strap'), (r'wall', 'wall'), (r'pole', 'pole'),
    (r'cable|rope attachment|straight bar', 'cable'), (r'pull-up bar', 'pullupBar'), (r'resistance.?band', 'band'),
    (r'step|platform|box/bench|stable surface', 'step'),
    (r'hack squat|leg press|leg curl|leg extension|sled|machine', 'MACHINE'),
]
MACHINES = { 'hack_squat': 'hackSquat', 'leg_press': 'legPress', 'lying_leg_curl': 'legCurl', 'leg_extension': 'legExtension',
             'seated_calf_raise': 'seatedCalf', 'lat_pulldown': 'latPulldown', 'reverse_pec_deck': 'pecDeck', 'machine_chest_press': 'chestPress' }
old = {}
if os.path.exists(OUT):
    for e in json.load(open(OUT))['exercises']: old[e['id']] = e
items, non_demo = [], []
for f in sorted(glob.glob(os.path.join(SPECS, '*.json'))):
    d = json.load(open(f)); batch = os.path.basename(f)[:-5]
    specs = d['specs'] if isinstance(d, dict) else d
    if isinstance(d, dict): non_demo += [dict(x, batch=batch) for x in d.get('non_demo', [])]
    for s in specs:
        props = []
        for eq in s.get('equipment', []):
            t = eq.lower().split(' (')[0].strip()
            if batch == 'reformer' and re.match(r'^straps?$', t):      # reformer straps, not a yoga strap
                if 'reformer' not in props: props.append('reformer')
                continue
            for rx, pr in PROP_RULES:
                if re.search(rx, t):
                    if pr not in props: props.append(pr)
                    break
        if s['id'] in MACHINES: props = [MACHINES[s['id']]] + [p for p in props if p != 'MACHINE']
        props = [p for p in props if p != 'MACHINE']
        prev = old.get(s['id'], {})
        exists = os.path.exists(os.path.join(ROOT, 'exercises', s['id'] + '.js'))
        items.append({
            'id': s['id'], 'batch': batch, 'names': s.get('names', {}), 'app_names': s.get('app_names', []),
            'category': s.get('category'), 'orientation': s.get('body_orientation'),
            'view': s.get('camera', {}).get('primary_view'), 'alt_view': s.get('camera', {}).get('secondary_view'),
            'equipment': s.get('equipment', []), 'props': props, 'confidence': s.get('confidence'),
            'status': prev.get('status') or ('authored' if exists else 'todo'), 'notes': prev.get('notes', ''),
        })
json.dump({ 'generated_from': 'research/specs', 'count': len(items),
            'status_values': ['todo', 'authored', 'qa_passed', 'approved', 'rendered'],
            'exercises': items, 'non_demo': non_demo }, open(OUT, 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(items), 'exercises;', Counter(i['batch'] for i in items))
print('props:', Counter(p for i in items for p in i['props']))
print('machines:', {i['id']: i['props'] for i in items if i['id'] in MACHINES})
print('status:', Counter(i['status'] for i in items))
