#!/bin/bash
# encode_one.sh <master.mp4> <dst_dir>  -> <dst_dir>/<id>.mp4 (720p60) + <id>.jpg poster
f="$1"; d="$2"; id=$(basename "$f" .mp4); o="$d/$id"
[ -f "$o.mp4" ] && [ "$o.mp4" -nt "$f" ] && [ -f "$o.jpg" ] && exit 0
ffmpeg -loglevel error -y -i "$f" -vf scale=720:1280 -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart -an "$o.mp4"
ffmpeg -loglevel error -y -ss 1.5 -i "$f" -frames:v 1 -vf scale=720:1280 -q:v 4 "$o.jpg"
echo "$id"
