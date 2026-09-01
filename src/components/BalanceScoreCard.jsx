import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Brain, CheckCircle2, Droplets, Leaf, Moon, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getSleep, getWaterHistory, getWellbeingCheckins, getWorkoutLogs } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { calculateBalanceScore } from '../utils/balanceScore';

const CATEGORY_ICONS = {
  activity: Activity,
  nutrition: Leaf,
  recovery: Moon,
  consistency: Target,
  hydration: Droplets,
  mindfulness: Brain,
};

function isRestDay(day) {
  if (day?.isRest) return true;
  return /dinlenme|rest|descanso|serbest gün/i.test(String(day?.focus || ''));
}

function getWeeklyTarget(plan) {
  if (!Array.isArray(plan?.workoutSplit)) return 4;
  const activeDays = plan.workoutSplit.filter((day) => !isRestDay(day)).length;
  return activeDays || 4;
}

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function LoadingCard({ t }) {
  return (
    <section aria-label={t('balanceScoreCard.title')} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div className="flex animate-pulse items-center gap-4">
        <div className="h-20 w-20 shrink-0 rounded-full bg-slate-800" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="h-5 w-44 max-w-full rounded bg-slate-800" />
          <div className="h-3 w-full rounded bg-slate-800" />
        </div>
      </div>
    </section>
  );
}

export default function BalanceScoreCard({ plan }) {
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, error: false, result: null });
  const trackedScore = useRef(null);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const [workoutLogs, waterHistory, sleepEntries, checkins] = await Promise.all([
        getWorkoutLogs(30),
        getWaterHistory(14),
        getSleep(14),
        getWellbeingCheckins(14),
      ]);
      const result = calculateBalanceScore({
        workoutLogs,
        waterHistory,
        sleepEntries,
        checkins,
        weeklyTarget: getWeeklyTarget(plan),
        goalType: plan?.primaryGoal || plan?.goalKey || 'unknown',
        referenceDate: new Date(),
        timeZone: getTimeZone(),
      });
      setState({ loading: false, error: false, result });
    } catch (error) {
      console.warn('[BalanceScore]', error?.message || error);
      setState({ loading: false, error: true, result: null });
    }
  }, [plan]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const score = state.result?.overallScore;
    if (score == null || trackedScore.current === score) return;
    trackedScore.current = score;
    trackEvent('balance_score_viewed', { source: 'today_dashboard' });
  }, [state.result?.overallScore]);

  const visibleCategories = useMemo(() => {
    const scores = state.result?.categoryScores || {};
    return Object.entries(scores).filter(([, score]) => score != null);
  }, [state.result]);

  if (state.loading) return <LoadingCard t={t} />;

  if (state.error) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5" aria-labelledby="balance-score-title">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400"><Sparkles size={19} /></span>
          <div className="min-w-0 flex-1">
            <h2 id="balance-score-title" className="font-outfit text-base font-bold text-white">{t('balanceScoreCard.title')}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{t('balanceScoreCard.error')}</p>
          </div>
          <button type="button" onClick={load} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300" aria-label={t('balanceScoreCard.retry')} title={t('balanceScoreCard.retry')}>
            <RefreshCw size={17} />
          </button>
        </div>
      </section>
    );
  }

  const result = state.result;
  const score = result?.overallScore;
  if (score == null) {
    return (
      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 sm:p-5" aria-labelledby="balance-score-title">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"><Sparkles size={20} /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-cyan-400">{t('balanceScoreCard.eyebrow')}</p>
            <h2 id="balance-score-title" className="mt-0.5 font-outfit text-lg font-extrabold text-white">{t('balanceScoreCard.title')}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{t('balanceScoreCard.empty')}</p>
            <p className="mt-2 text-[10px] text-slate-600">{t('balanceScoreCard.completeness', { percentage: result?.dataCompleteness?.percentage || 0 })}</p>
          </div>
        </div>
      </section>
    );
  }

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - ((score / 100) * circumference);
  const firstStrength = result.strengths[0];
  const firstImprovement = result.improvementAreas[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900 p-4 shadow-lg shadow-cyan-950/10 sm:p-5" aria-labelledby="balance-score-title">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0" role="progressbar" aria-label={t('balanceScoreCard.title')} aria-valuemin="0" aria-valuemax="100" aria-valuenow={score}>
          <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
            <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-800" />
            <circle cx="44" cy="44" r="36" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="text-cyan-400 transition-all duration-700" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-outfit text-2xl font-extrabold text-white">{score}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase text-cyan-400">{t('balanceScoreCard.eyebrow')}</p>
          <h2 id="balance-score-title" className="mt-0.5 font-outfit text-xl font-extrabold text-white">{t('balanceScoreCard.yourBalance', { score })}</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('balanceScoreCard.subtitle')}</p>
          <p className="mt-2 text-[10px] text-slate-600">{t('balanceScoreCard.completeness', { percentage: result.dataCompleteness.percentage })}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-800 pt-4">
        {visibleCategories.map(([category, value]) => {
          const Icon = CATEGORY_ICONS[category] || Activity;
          return (
            <div key={category} className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px]">
                <span className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-slate-300"><Icon size={12} className="shrink-0 text-cyan-400" />{t(`balanceScoreCard.categories.${category}`)}</span>
                <span className="font-bold text-slate-400">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${value}%` }} /></div>
            </div>
          );
        })}
      </div>

      {(firstStrength || firstImprovement) && (
        <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
          {firstStrength && (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-300"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" /><span>{t('balanceScoreCard.strength', { category: t(`balanceScoreCard.categories.${firstStrength.category}`) })}</span></p>
          )}
          {firstImprovement && (
            <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-300"><Sparkles size={15} className="mt-0.5 shrink-0 text-orange-400" /><span>{t('balanceScoreCard.improvement', { category: t(`balanceScoreCard.categories.${firstImprovement.category}`) })}</span></p>
          )}
        </div>
      )}
      <p className="mt-3 text-[9px] leading-relaxed text-slate-600">{t('balanceScoreCard.disclaimer')}</p>
    </section>
  );
}
