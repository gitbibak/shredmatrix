#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
GUMROAD_BIN="${GUMROAD_BIN:-}"
if [[ -z "$GUMROAD_BIN" ]]; then
  if [[ -x "$ROOT_DIR/output/marketing-kit/tools/gumroad-cli/gumroad" ]]; then
    GUMROAD_BIN="$ROOT_DIR/output/marketing-kit/tools/gumroad-cli/gumroad"
  elif command -v gumroad >/dev/null 2>&1; then
    GUMROAD_BIN="$(command -v gumroad)"
  else
    echo "Gumroad CLI not found. Install it or set GUMROAD_BIN=/path/to/gumroad." >&2
    exit 1
  fi
fi

TITLE="Full Balance - Free Fitness & Wellness Planner"
SUMMARY="Free forever mobile-first dashboard for workouts, meals, water, sleep, measurements and achievements."
DESCRIPTION_FILE="$ROOT_DIR/output/marketing-kit/gumroad/product-description.html"
ACCESS_FILE="$ROOT_DIR/output/marketing-kit/gumroad/full-balance-access.html"
COVER_EN="$ROOT_DIR/output/marketing-kit/assets/gumroad/gumroad-cover-1280x720-en.png"
THUMB_EN="$ROOT_DIR/output/marketing-kit/assets/gumroad/gumroad-thumbnail-600-en.png"

MODE="dry-run"
if [[ "${1:-}" == "--execute" ]]; then
  MODE="execute"
fi

if [[ ! -x "$GUMROAD_BIN" ]]; then
  echo "Gumroad CLI not found at: $GUMROAD_BIN" >&2
  exit 1
fi

if [[ "$MODE" == "execute" ]]; then
  if ! "$GUMROAD_BIN" auth status >/dev/null 2>&1 && [[ -z "${GUMROAD_ACCESS_TOKEN:-}" ]]; then
    echo "Not authenticated. Run one of these first:" >&2
    echo "  export GUMROAD_ACCESS_TOKEN='...'" >&2
    echo "  printf '%s' 'YOUR_TOKEN' | $GUMROAD_BIN auth login --with-token" >&2
    exit 1
  fi
  DRY_RUN_FLAGS=""
else
  DRY_RUN_FLAGS="--dry-run"
fi

CMD=("$GUMROAD_BIN" products create)
if [[ -n "$DRY_RUN_FLAGS" ]]; then
  CMD+=("$DRY_RUN_FLAGS")
fi

"${CMD[@]}" \
  --non-interactive \
  --no-input \
  --yes \
  --json \
  --name "$TITLE" \
  --custom-summary "$SUMMARY" \
  --custom-receipt "Full Balance is completely free and will stay free. No card required. No subscription. No premium wall. Open the app: https://fullbalance.app" \
  --description "$(cat "$DESCRIPTION_FILE")" \
  --price 0 \
  --currency usd \
  --type digital \
  --custom-permalink "full-balance-free" \
  --cover-image "$COVER_EN" \
  --thumbnail "$THUMB_EN" \
  --file "$ACCESS_FILE" \
  --file-name "Full Balance Free Access.html" \
  --file-description "Open Full Balance at fullbalance.app. The app is free forever." \
  --tag fitness \
  --tag wellness \
  --tag free \
  --tag pwa \
  --tag planner
