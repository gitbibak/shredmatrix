import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, BatteryLow, BatteryMedium, BatteryFull,
  Brain, Check, Dumbbell, Footprints, HeartPulse, Leaf, Moon,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getSleep, getWellbeingCheckins, getWorkoutLogs, saveWellbeingCheckin } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { calculateLongevityBalance } from '../utils/longevityScore';
import { useToast } from './ToastProvider';

const PILLARS = [
  { key: 'movement', icon: Footprints, color: 'bg-cyan-400', text: 'text-cyan-300' },
  { key: 'strength', icon: Dumbbell, color: 'bg-orange-400', text: 'text-orange-300' },
  { key: 'mobility', icon: Activity, color: 'bg-emerald-400', text: 'text-emerald-300' },
  { key: 'recovery', icon: Moon, color: 'bg-violet-400', text: 'text-violet-300' },
  { key: 'nutrition', icon: Leaf, color: 'bg-lime-400', text: 'text-lime-300' },
];

const ENERGY_OPTIONS = [
  { value: 1, icon: BatteryLow, key: 'low' },
  { value: 2, icon: BatteryMedium, key: 'normal' },
  { value: 3, icon: BatteryFull, key: 'good' },
];

function todayISO() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function useLongevityData(plan) {
  const [data, setData] = useState({ workouts: [], sleep: [], checkins: [] });
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const [workouts, sleep, checkins] = await Promise.all([
        getWorkoutLogs(),
        getSleep(30),
        getWellbeingCheckins(30),
      ]);
      setData({ workouts: workouts || [], sleep: sleep || [], checkins: checkins || [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const balance = useMemo(() => calculateLongevityBalance({
    workoutLogs: data.workouts,
    sleepEntries: data.sleep,
    checkins: data.checkins,
    plan,
  }), [data, plan]);

  return { ...data, balance, loading, reload };
}

export function LongevityTodayCard({ plan, onNavigate }) {
  const { t } = useTranslation();
  const { balance, loading } = useLongevityData(plan);
  if (loading) return null;

  const action = balance.recommendation;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        trackEvent('longevity_action_opened', { action_type: action.key });
        onNavigate?.(action.target);
      }}
      className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-left transition-colors hover:bg-emerald-500/12"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-300">
        <HeartPulse size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase text-emerald-400">{t('longevity.todayEyebrow')}</span>
        <span className="mt-0.5 block text-sm font-bold text-white">{t(`longevity.actions.${action.key}.title`)}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">{t(`longevity.actions.${action.key}.desc`)}</span>
      </span>
      {balance.score != null && <span className="text-sm font-extrabold text-emerald-300">{balance.score}</span>}
      <ArrowRight size={16} className="shrink-0 text-slate-500" />
    </motion.button>
  );
}

export default function LongevityPanel({ plan }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { balance, checkins, loading, reload } = useLongevityData(plan);
  const todayEntry = checkins.find((entry) => entry.date === todayISO());
  const [energy, setEnergy] = useState(todayEntry?.energy || null);
  const [nutritionAligned, setNutritionAligned] = useState(Boolean(todayEntry?.nutrition_aligned));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnergy(todayEntry?.energy || null);
    setNutritionAligned(Boolean(todayEntry?.nutrition_aligned));
  }, [todayEntry?.date, todayEntry?.energy, todayEntry?.nutrition_aligned]);

  const handleSave = async () => {
    if (!energy || saving) return;
    setSaving(true);
    try {
      await saveWellbeingCheckin({ date: todayISO(), energy, nutritionAligned });
      await reload();
      trackEvent('wellbeing_checkin_saved');
      toast.success(t('longevity.checkin.saved'));
    } catch {
      toast.error(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"
      aria-labelledby="longevity-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-300">
            <HeartPulse size={21} />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-400">{t('longevity.eyebrow')}</p>
            <h2 id="longevity-title" className="mt-0.5 text-lg font-extrabold text-white font-outfit">{t('longevity.title')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{t('longevity.subtitle')}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          {balance.score == null ? (
            <span className="text-xs font-bold text-slate-400">{t('longevity.collecting')}</span>
          ) : (
            <><span className="text-3xl font-extrabold text-emerald-300 font-outfit">{balance.score}</span><span className="text-xs text-slate-500">/100</span></>
          )}
          <p className="mt-0.5 text-[9px] text-slate-600">{t('longevity.notMedical')}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {PILLARS.map(({ key, icon: Icon, color, text }) => {
          const available = balance.available[key];
          const value = balance.scores[key];
          return (
            <div key={key} className="grid grid-cols-[22px_88px_1fr_34px] items-center gap-2">
              <Icon size={15} className={text} />
              <span className="text-xs font-semibold text-slate-300">{t(`longevity.pillars.${key}`)}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <span className={`block h-full rounded-full ${color}`} style={{ width: `${available ? value : 0}%` }} />
              </span>
              <span className="text-right text-[10px] font-bold text-slate-400">{available ? value : '–'}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-blue-300" />
          <h3 className="text-sm font-bold text-white">{t('longevity.checkin.title')}</h3>
        </div>
        <p className="mt-1 text-xs text-slate-500">{t('longevity.checkin.desc')}</p>

        <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={t('longevity.checkin.energy')}>
          {ENERGY_OPTIONS.map(({ value, icon: Icon, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => setEnergy(value)}
              aria-pressed={energy === value}
              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-bold transition-colors ${energy === value ? 'border-blue-400/50 bg-blue-500/15 text-blue-200' : 'border-slate-800 bg-slate-950/50 text-slate-500'}`}
            >
              <Icon size={15} /> {t(`longevity.checkin.energyOptions.${key}`)}
            </button>
          ))}
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
          <input
            type="checkbox"
            checked={nutritionAligned}
            onChange={(event) => setNutritionAligned(event.target.checked)}
            className="sr-only"
          />
          <span className={`flex h-5 w-5 items-center justify-center rounded border ${nutritionAligned ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-600'}`}>
            {nutritionAligned && <Check size={14} strokeWidth={3} />}
          </span>
          <span className="text-xs font-semibold text-slate-300">{t('longevity.checkin.nutrition')}</span>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={!energy || saving}
          className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? t('longevity.checkin.saving') : todayEntry ? t('longevity.checkin.update') : t('longevity.checkin.save')}
        </button>
      </div>
    </motion.section>
  );
}
