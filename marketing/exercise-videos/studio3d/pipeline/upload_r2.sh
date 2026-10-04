#!/bin/bash
# Upload delivery files to R2. usage: pipeline/upload_r2.sh <lang> [version]   (needs `npx wrangler login`)
cd "$(dirname "$0")/.."
LANG_CODE=${1:-tr}; VER=${2:-v1}; DIR=out/delivery/$VER/$LANG_CODE; BUCKET=fullbalance-media
LOG=out/upload_${VER}_${LANG_CODE}.done; touch "$LOG"
up() {
  f="$1"; key="$VER/$LANG_CODE/$(basename "$f")"
  grep -qxF "$key" "$LOG" && return 0
  case "$f" in *.mp4) ct=video/mp4;; *.jpg) ct=image/jpeg;; esac
  for i in 1 2 3; do
    if npx -y wrangler@4.147.0 r2 object put "$BUCKET/$key" --file "$f" --content-type "$ct" --cache-control "public, max-age=31536000, immutable" --remote >/dev/null 2>&1; then echo "$key" >> "$LOG"; echo "ok $key"; return 0; fi
    sleep 2
  done
  echo "FAIL $key"
}
export -f up; export VER LANG_CODE BUCKET LOG
find "$DIR" -type f \( -name '*.mp4' -o -name '*.jpg' \) -print0 | xargs -0 -P 6 -n 1 -I{} bash -c 'up "$@"' _ {}
echo "uploaded: $(wc -l < "$LOG")"
