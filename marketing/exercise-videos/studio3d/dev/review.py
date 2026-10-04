"""python3 dev/review.py out.png id1 id2 ... -> tiles out/qa/tr/<id>.png contact sheets (2 columns) for a quick human review"""
import sys, subprocess
out, ids = sys.argv[1], sys.argv[2:]
n = len(ids)
inputs = sum((['-i', f'out/qa/tr/{i}.png'] for i in ids), [])
fc = ''.join(f'[{k}]scale=1080:-1[v{k}];' for k in range(n)) + ''.join(f'[v{k}]' for k in range(n))
layout = '|'.join(f'{(k % 2) * 1080}_{(k // 2) * 640}' for k in range(n))
fc += f'xstack=inputs={n}:layout={layout}:fill=black' if n > 1 else 'null'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', fc, out], check=True)
