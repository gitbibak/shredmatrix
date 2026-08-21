const STRENGTH_GOALS = new Set(['muscle', 'fat_loss']);

function numericSets(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function progressReps(value) {
  const match = String(value || '').match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (!match) return value;
  return `${Number(match[1]) + 1}-${Number(match[2]) + 1}`;
}

export function chooseAdaptation(feedback, recentFeedback = [], goal = 'muscle') {
  if (feedback.painReported) return 'hold';
  if (feedback.perceivedExertion === 3 || feedback.energyAfter === 1) return 'reduce';

  const recentComfortable = recentFeedback
    .filter((entry) => !entry.pain_reported)
    .filter((entry) => Number(entry.perceived_exertion) === 1 && Number(entry.energy_after) === 3)
    .length;

  if (
    STRENGTH_GOALS.has(goal)
    && feedback.perceivedExertion === 1
    && feedback.energyAfter === 3
    && recentComfortable >= 1
  ) return 'progress';

  return 'maintain';
}

export function adaptNextWorkout(plan, completedFocus, action, feedbackId) {
  if (!plan || action === 'maintain') return { plan, changed: false };
  if (plan.adaptationHistory?.some((entry) => entry.feedbackId === feedbackId)) {
    return { plan, changed: false };
  }

  const split = [...(plan.workoutSplit || [])];
  const completedIndex = split.findIndex((day) => day.focus === completedFocus);
  const orderedIndexes = split.map((_, index) => (completedIndex + index + 1) % split.length);
  const nextIndex = orderedIndexes.find((index) => {
    const day = split[index];
    return day && !day.isRest && Array.isArray(day.exercises) && day.exercises.length > 0;
  });
  if (nextIndex === undefined) return { plan, changed: false };

  const nextDay = split[nextIndex];
  let exercises = nextDay.exercises.map((exercise) => ({ ...exercise }));

  if (action === 'reduce') {
    const reducedExerciseCount = exercises.length > 1
      ? Math.max(1, Math.floor(exercises.length * 0.8))
      : 1;
    exercises = exercises
      .slice(0, reducedExerciseCount)
      .map((exercise) => {
        const sets = numericSets(exercise.sets);
        return sets ? { ...exercise, sets: Math.max(1, sets - 1) } : exercise;
      });
  } else if (action === 'progress') {
    exercises = exercises.map((exercise, index) => (
      index < 2 ? { ...exercise, reps: progressReps(exercise.reps) } : exercise
    ));
  }

  split[nextIndex] = {
    ...nextDay,
    exercises,
    adaptationAction: action,
    adaptationSourceFeedbackId: feedbackId || null,
    requiresReview: action === 'hold',
  };

  return {
    changed: true,
    plan: {
      ...plan,
      workoutSplit: split,
      adaptationHistory: [
        ...(plan.adaptationHistory || []).slice(-9),
        { feedbackId: feedbackId || null, action, appliedAt: new Date().toISOString(), nextDayIndex: nextIndex },
      ],
    },
  };
}
