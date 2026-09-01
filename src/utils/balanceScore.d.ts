export type BalanceCategory =
  | 'activity'
  | 'nutrition'
  | 'recovery'
  | 'consistency'
  | 'hydration'
  | 'mindfulness';

export interface BalanceScoreInput {
  workoutLogs?: Array<Record<string, unknown>>;
  waterHistory?: Array<Record<string, unknown>>;
  sleepEntries?: Array<Record<string, unknown>>;
  checkins?: Array<Record<string, unknown>>;
  weeklyTarget?: number;
  targetGlasses?: number;
  goalType?: string;
  referenceDate?: Date | string;
  timeZone?: string;
}

export interface BalanceInsight {
  category: BalanceCategory;
  score: number;
}

export interface BalanceScoreResult {
  overallScore: number | null;
  categoryScores: Record<BalanceCategory, number | null>;
  strengths: BalanceInsight[];
  improvementAreas: BalanceInsight[];
  dataCompleteness: {
    percentage: number;
    availableCategories: BalanceCategory[];
    missingCategories: BalanceCategory[];
    signalCount: number;
    sufficient: boolean;
  };
  period: { start: string | null; end: string | null };
  score: number | null;
  breakdown: Record<BalanceCategory, number | null>;
  level: { min: number; max: number; key: string; color: string; bg: string; border: string };
  trend: 'stable';
}

export function calculateBalanceScore(input?: BalanceScoreInput): BalanceScoreResult;
export function getLevel(score: number): BalanceScoreResult['level'];
export function getMoodIntensity(moodId: string): number;
export function saveMood(moodId: string): void;
export function getTodayMood(): string | null;
export function getMoodHistory(days?: number): Array<Record<string, unknown>>;
