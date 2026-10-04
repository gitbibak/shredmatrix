import { describe, expect, it } from 'vitest';
import { getExerciseVideo, getExerciseVideoId, normalizeExerciseName } from './exerciseVideos';

describe('exercise videos', () => {
  it('maps app exercise names (and their variants) to video ids', () => {
    expect(getExerciseVideoId('Goblet Squat')).toBe('goblet_squat');
    expect(getExerciseVideoId('Şınav')).toBe('push_up');
    expect(getExerciseVideoId('Tempo Şınav (3 sn iniş)')).toBe('push_up');
    expect(getExerciseVideoId('Lat Pulldown')).toBe('lat_pulldown');
  });

  it('resolves circuit, superset and EMOM prefixes', () => {
    expect(getExerciseVideoId('Devre — Dumbbell Row')).toBe('dumbbell_row');
    expect(getExerciseVideoId('Süperset: Skull Crushers + Rope Pushdown')).toBe('skull_crusher');
    expect(getExerciseVideoId('EMOM — Burpee x8')).toBe('burpee');
    expect(getExerciseVideoId('→ ardından Kettlebell Swing')).toBe('kettlebell_swing');
  });

  it('has no video for rest, cardio and meditation items', () => {
    for (const n of ['Tam Dinlenme', 'Tempolu Yürüyüş', 'Nefes Farkındalığı', 'Serbest Vinyasa Flow', '']) expect(getExerciseVideoId(n)).toBeNull();
  });

  it('normalizes Turkish casing and dashes', () => {
    expect(normalizeExerciseName('  İLERİ   Hamle — X ')).toBe('ileri hamle - x');
  });

  it('builds media URLs only for languages with uploaded videos', () => {
    expect(getExerciseVideo('Goblet Squat', 'tr')).toEqual({
      id: 'goblet_squat',
      src: 'https://media.fullbalance.app/v1/tr/goblet_squat.mp4',
      poster: 'https://media.fullbalance.app/v1/tr/goblet_squat.jpg',
    });
    expect(getExerciseVideo('Goblet Squat', 'en')).toBeNull();
    expect(getExerciseVideo('Goblet Squat', 'es')).toBeNull();
  });
});
