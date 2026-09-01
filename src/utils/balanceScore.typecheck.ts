import { calculateBalanceScore, type BalanceCategory } from './balanceScore.js';

const result = calculateBalanceScore({
  referenceDate: '2026-09-02T08:00:00Z',
  timeZone: 'Europe/Istanbul',
  workoutLogs: [{ date: '2026-09-01' }],
  checkins: [{ date: '2026-09-01', nutrition_aligned: true }],
});

const category: BalanceCategory = result.strengths[0]?.category ?? 'activity';
void category;
