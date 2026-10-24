import { beforeEach, describe, expect, it } from 'vitest';
import {
  addSet,
  buildPreviousPerformance,
  buildSession,
  completeSet,
  findRecords,
  loadSessionDraft,
  parseRepTarget,
  parseRestSeconds,
  parseSetCount,
  saveSessionDraft,
  sessionToLogEntry,
  summarizeSession,
  updateSet,
} from './workoutSession';

const day = {
  focus: 'Upper A',
  exercises: [
    { name: 'Dumbbell Bench Press', sets: 3, reps: '8-10', rest: '90s', equipment: 'dumbbell' },
    { name: 'Push-up', sets: 2, reps: '10-12', rest: '60s', equipment: 'none' },
  ],
  coreFinisher: [{ name: 'Plank', sets: 2, reps: '40s', rest: '30s' }],
};

describe('parsers', () => {
  it('reads rest, reps and set counts from plan strings', () => {
    expect(parseRestSeconds('90s')).toBe(90);
    expect(parseRestSeconds('2 dk')).toBe(120);
    expect(parseRestSeconds('-')).toBe(0);
    expect(parseRestSeconds('Dinlenme Günü')).toBe(0);
    expect(parseRepTarget('8-10')).toEqual({ timed: false, reps: 8 });
    expect(parseRepTarget('12/taraf')).toEqual({ timed: false, reps: 12 });
    expect(parseRepTarget('40s')).toEqual({ timed: true, reps: null });
    expect(parseRepTarget('5 dk')).toEqual({ timed: true, reps: null });
    expect(parseRepTarget('Akış')).toEqual({ timed: true, reps: null });
    expect(parseSetCount('-')).toBe(1);
    expect(parseSetCount(40)).toBe(10);
  });
});

describe('buildSession', () => {
  it('creates set rows, uses weight only for loaded exercises and adds the core finisher', () => {
    const logs = [
      { date: '2026-10-01', exercises: [{ name: 'Dumbbell Bench Press', sets: [{ weight: 14, reps: 10, completed: true }] }] },
      { date: '2026-10-08', exercises: [{ name: 'dumbbell bench press', sets: [{ weight: 16, reps: 9, completed: true }, { weight: 0, reps: 0, completed: false }] }] },
    ];
    const session = buildSession(day, { logs, now: Date.parse('2026-10-20T08:00:00Z') });
    expect(session.exercises).toHaveLength(3);
    const [bench, pushUp, plank] = session.exercises;
    expect(bench.previous).toEqual({ weight: 16, reps: 9, date: '2026-10-08' });
    expect(bench.sets).toHaveLength(3);
    expect(bench.sets[0]).toEqual({ reps: 8, weight: 16, done: false });
    expect(bench.restSec).toBe(90);
    expect(pushUp.usesWeight).toBe(false);
    expect(plank).toMatchObject({ section: 'core', timed: true, usesWeight: false });
  });

  it('counts band and bodyweight work in reps only', () => {
    const session = buildSession({ focus: 'x', exercises: [
      { name: 'Resistance Band Row', sets: 3, reps: '12', rest: '60s', equipment: 'resistance_band' },
      { name: 'Incline Push-Up', sets: 3, reps: '10', rest: '60s', equipment: 'stable_surface' },
      { name: 'Goblet Squat', sets: 3, reps: '10', rest: '60s', equipment: 'dumbbell' },
    ] });
    expect(session.exercises.map((exercise) => exercise.usesWeight)).toEqual([false, false, true]);
  });

  it('skips load tracking for mobility style modules', () => {
    const session = buildSession(day, { tracksLoad: false });
    expect(session.exercises.every((exercise) => !exercise.usesWeight)).toBe(true);
  });
});

describe('editing and finishing', () => {
  it('carries a checked load forward, caps input and summarizes the work', () => {
    let session = buildSession(day, { now: Date.parse('2026-10-20T08:00:00Z') });
    session = updateSet(session, 0, 0, { weight: '17,5' });
    session = completeSet(session, 0, 0);
    expect(session.exercises[0].sets[1].weight).toBe(17.5);
    session = completeSet(session, 0, 1);
    session = updateSet(session, 0, 2, { weight: 9999 });
    expect(session.exercises[0].sets[2].weight).toBe(500);
    session = addSet(session, 1);
    expect(session.exercises[1].sets).toHaveLength(3);

    const summary = summarizeSession(session, Date.parse('2026-10-20T08:31:00Z'));
    expect(summary).toMatchObject({ setsDone: 2, exercisesDone: 1, volume: 280, minutes: 31 });
  });

  it('writes the existing log shape with only touched exercises and spots records', () => {
    let session = buildSession(day, { logs: [{ date: '2026-10-08', exercises: [{ name: 'Dumbbell Bench Press', sets: [{ weight: 16, reps: 9, completed: true }] }] }] });
    session = updateSet(session, 0, 0, { weight: 18 });
    session = completeSet(session, 0, 0);
    session = completeSet(session, 2, 0);
    const entry = sessionToLogEntry(session, '2026-10-20');
    expect(entry).toMatchObject({ date: '2026-10-20', dayFocus: 'Upper A', day_focus: 'Upper A' });
    expect(entry.exercises.map((exercise) => exercise.name)).toEqual(['Dumbbell Bench Press', 'Plank']);
    expect(entry.exercises[0].weight).toBe(18);
    expect(entry.exercises[1]).toMatchObject({ section: 'core', timed: true });
    expect(findRecords(session, buildPreviousPerformance([{ date: '2026-10-08', exercises: [{ name: 'Dumbbell Bench Press', sets: [{ weight: 16, reps: 9, completed: true }] }] }])))
      .toEqual([{ name: 'Dumbbell Bench Press', weight: 18, previous: 16 }]);
  });
});

describe('drafts', () => {
  beforeEach(() => localStorage.clear());

  it('restores a recent draft and drops an old one', () => {
    const now = Date.parse('2026-10-20T08:00:00Z');
    const session = buildSession(day, { now });
    saveSessionDraft(session);
    expect(loadSessionDraft(now + 60_000)?.dayFocus).toBe('Upper A');
    expect(loadSessionDraft(now + 13 * 60 * 60 * 1000)).toBeNull();
    expect(localStorage.getItem('fullbalance_workout_session')).toBeNull();
  });
});
