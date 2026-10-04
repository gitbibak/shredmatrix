import { EXERCISE_VIDEO_MAP } from './exerciseVideoMap';

// Exercise technique videos hosted on Cloudflare R2 (bucket fullbalance-media, custom domain media.fullbalance.app).
// Files: <base>/<version>/<lang>/<id>.mp4 and .jpg (poster). Add a language here once its videos are uploaded.
export const EXERCISE_VIDEO_BASE = 'https://media.fullbalance.app';
export const EXERCISE_VIDEO_VERSION = 'v1';
export const EXERCISE_VIDEO_LANGS = ['tr'];

// Must match norm() in marketing/exercise-videos/studio3d/pipeline/build_video_map.py
export function normalizeExerciseName(name) {
  return String(name || '')
    .normalize('NFC')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripDecorations(key) {
  return key
    .replace(/^(→\s*ardından|devre[^-]*-|emom[^-]*-|süperset:|superset:|finisher:)\s*/, '')
    .split(' + ')[0]
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s*(x\d+|\d+\s*(sn|s|dk|tekrar))$/, '')
    .trim();
}

export function getExerciseVideoId(name) {
  const key = normalizeExerciseName(name);
  if (!key) return null;
  return EXERCISE_VIDEO_MAP[key] || EXERCISE_VIDEO_MAP[stripDecorations(key)] || null;
}

export function hasExerciseVideos(lang) {
  return EXERCISE_VIDEO_LANGS.includes(lang);
}

/** Returns { id, src, poster } for the exercise in this UI language, or null when no video exists (yet). */
export function getExerciseVideo(name, lang) {
  if (!hasExerciseVideos(lang)) return null;
  const id = getExerciseVideoId(name);
  if (!id) return null;
  const base = `${EXERCISE_VIDEO_BASE}/${EXERCISE_VIDEO_VERSION}/${lang}/${id}`;
  return { id, src: `${base}.mp4`, poster: `${base}.jpg` };
}
