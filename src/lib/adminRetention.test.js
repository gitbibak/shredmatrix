import { describe, expect, it } from 'vitest';
import { summarizeActivationFunnel, summarizeAdminStats, summarizeRetention } from './adminService';

describe('summarizeAdminStats', () => {
  it('excludes admins and uses completed Istanbul days for rolling windows', () => {
    const profiles = [
      { id: 'admin', role: 'admin', created_at: '2026-08-28T08:00:00.000Z' },
      { id: 'today', role: 'user', created_at: '2026-08-28T10:00:00.000Z' },
      { id: 'recent', role: 'user', created_at: '2026-08-27T10:00:00.000Z' },
      { id: 'month', role: 'user', created_at: '2026-08-01T10:00:00.000Z' },
      { id: 'previous', role: 'user', created_at: '2026-07-15T10:00:00.000Z' },
    ];

    expect(summarizeAdminStats(
      profiles,
      ['admin', 'today', 'recent', 'recent'],
      2,
      new Date('2026-08-28T20:00:00.000Z'),
    )).toEqual({
      totalUsers: 4,
      completedProfiles: 4,
      todayRegistrations: 1,
      weekRegistrations: 1,
      monthRegistrations: 2,
      previousMonthRegistrations: 1,
      registrationDelta: 1,
      usersWithPlans: 2,
      openSupportTickets: 2,
    });
  });
});

describe('summarizeRetention', () => {
  it('excludes users who are not yet eligible and measures exact return days', () => {
    const profiles = [
      { id: 'd7', created_at: '2026-08-10T09:00:00.000Z' },
      { id: 'd1', created_at: '2026-08-19T09:00:00.000Z' },
      { id: 'new', created_at: '2026-08-20T12:00:00.000Z' },
    ];
    const activity = [
      { user_id: 'd7', activity_date: '2026-08-11' },
      { user_id: 'd7', activity_date: '2026-08-17' },
      { user_id: 'd1', activity_date: '2026-08-20' },
    ];
    const result = summarizeRetention(profiles, activity, ['d7', 'new'], new Date('2026-08-21T16:00:00.000Z'));
    expect(result).toMatchObject({
      registrations: 3,
      activated: 2,
      activationRate: 67,
      d1Eligible: 2,
      d1Returned: 2,
      d1Rate: 100,
      d7Eligible: 1,
      d7Returned: 1,
      d7Rate: 100,
      trackingStartedAt: '2026-08-11',
      lastCompleteDate: '2026-08-20',
      measurementDays: 10,
    });
  });

  it('does not count return dates from before tracking began or the ongoing day', () => {
    const profiles = [
      { id: 'old', created_at: '2026-08-01T09:00:00.000Z' },
      { id: 'eligible', created_at: '2026-08-20T09:00:00.000Z' },
      { id: 'today-target', created_at: '2026-08-21T09:00:00.000Z' },
    ];
    const activity = [
      { user_id: 'eligible', activity_date: '2026-08-21' },
      { user_id: 'today-target', activity_date: '2026-08-22' },
    ];

    expect(summarizeRetention(profiles, activity, [], new Date('2026-08-22T12:00:00.000Z'))).toMatchObject({
      d1Eligible: 1,
      d1Returned: 1,
      d1Rate: 100,
      d7Eligible: 0,
      d7Rate: null,
    });
  });
});

describe('summarizeActivationFunnel', () => {
  it('counts unique users at each step without requiring a saved workout', () => {
    const activity = [
      { user_id: 'passive', today_viewed: true, workout_plan_viewed: false, workout_day_opened: false, workout_completed: false },
      { user_id: 'starter', today_viewed: true, workout_plan_viewed: true, workout_day_opened: true, workout_completed: false },
      { user_id: 'finisher', today_viewed: true, workout_plan_viewed: true, workout_day_opened: true, workout_completed: true },
      { user_id: 'finisher', today_viewed: true, workout_plan_viewed: true, workout_day_opened: true, workout_completed: true },
    ];

    expect(summarizeActivationFunnel(activity)).toEqual({
      activeUsers: 3,
      todayViewed: 3,
      workoutPlanViewed: 2,
      workoutDayOpened: 2,
      workoutCompleted: 1,
    });
  });
});
