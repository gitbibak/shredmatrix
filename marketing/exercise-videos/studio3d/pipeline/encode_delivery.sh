#!/bin/bash
# Encode delivery versions from 1080p masters. usage: pipeline/encode_delivery.sh <lang> [version]
set -e
cd "$(dirname "$0")/.."
LANG_CODE=${1:-tr}; VER=${2:-v1}
SRC=out/$LANG_CODE; DST=out/delivery/$VER/$LANG_CODE
mkdir -p "$DST"
find "$SRC" -maxdepth 1 -name '*.mp4' ! -name '*.part.mp4' -print0 | xargs -0 -P 4 -n 1 -I{} pipeline/encode_one.sh {} "$DST"
echo "done: $(find "$DST" -name '*.mp4' | wc -l) videos, $(du -sh "$DST" | cut -f1)"
