import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  TrendingUp,
  User,
  Ruler,
  HeartPulse,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
  Brain,
  Flower2,
  Circle,
  Wrench,
  Sparkles,
  House,
  Building2,
  PackageOpen,
  Target,
  CalendarDays,
} from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { normalizeTrainingEnvironment } from '../data/planGenerator';
import { FOCUS_AREA_KEYS, MAX_FOCUS_AREAS, TRAINING_DAY_OPTIONS, normalizeFocusAreas, normalizeTrainingDays } from '../data/focusAreas';

// ── Step Configuration ───────────────────────────────────
const STEP_IDS = ['goal', 'basics', 'focus', 'safety'];
const STEP_ICONS = [TrendingUp, User, Target, HeartPulse];
const STEP_LABEL_KEYS = {
  goal: 'onboarding.step4.title',
  basics: 'onboarding.step2.title',
  focus: 'onboarding.stepFocus.title',
  safety: 'onboarding.step5.title',
};
const FOCUS_AREA_EMOJI = { glutes_legs: '🍑', core: '🎯', back_posture: '🧍', chest_arms: '💪', shoulders: '🏋️' };
const FOCUS_AREA_LABEL_KEYS = { glutes_legs: 'glutesLegs', core: 'coreArea', back_posture: 'backPosture', chest_arms: 'chestArms', shoulders: 'shouldersArea' };

// ── Animation Variants ───────────────────────────────────
const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 15 : -15, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 15 : -15, opacity: 0 }),
};

// ── Slider Component (FIXED) ─────────────────────────────
function SliderInput({ label, value, onChange, min, max, unit, step = 1 }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-slate-400 font-outfit">{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg shadow-orange-500/20"
        >
          {value} {unit}
        </motion.span>
      </div>

      {/* Single native range input — styled via CSS */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input w-full"
        style={{ '--fill': `${percentage}%` }}
      />

      <div className="flex justify-between text-[10px] text-slate-600 mt-1.5">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

// ── Card Selector ────────────────────────────────────────
function SelectCard({ selected, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={[
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer',
        selected
          ? 'bg-slate-900 border-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.15)]'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700',
        className,
      ].join(' ')}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <BadgeCheck size={16} className="text-orange-400" />
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

function toggleMultiValue(values, value, noneValue = 'none') {
  if (value === noneValue) return [noneValue];
  const next = values.filter((item) => item !== noneValue);
  if (next.includes(value)) {
    const filtered = next.filter((item) => item !== value);
    return filtered.length ? filtered : [noneValue];
  }
  return [...next, value];
}

// ═════════════════════════════════════════════════════════
// Onboarding Component
// ═════════════════════════════════════════════════════════
export default function Onboarding({ onSubmit, initialData = null, resetDraftKey = 0, defaultName = '' }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    trackEvent('onboarding_started', { source: initialData ? 'edit_plan' : 'signup' });
  }, []);

  // Translated data arrays (need t() from hook)
  const STEPS = STEP_IDS.map((id, i) => ({
    id,
    label: t(STEP_LABEL_KEYS[id]),
    icon: STEP_ICONS[i],
  }));

  const genderOptions = [
    { value: 'male', label: t('onboarding.fields.male'), emoji: '♂️', color: '#00b0ff' },
    { value: 'female', label: t('onboarding.fields.female'), emoji: '♀️', color: '#f472b6' },
  ];

  const experienceLevels = [
    { value: 'beginner', label: t('onboarding.fields.beginner'), desc: t('onboarding.fields.expBeginner'), emoji: '🌱' },
    { value: 'intermediate', label: t('onboarding.fields.intermediate'), desc: t('onboarding.fields.expIntermediate'), emoji: '💪' },
    { value: 'advanced', label: t('onboarding.fields.advanced'), desc: t('onboarding.fields.expAdvanced'), emoji: '🔥' },
    { value: 'expert', label: t('onboarding.fields.expert'), desc: t('onboarding.fields.expExpert'), emoji: '🏆' },
  ];

  const goals = [
    { value: 'muscle', icon: TrendingUp, label: t('onboarding.fields.muscle'), desc: '', color: '#ff6d00' },
    { value: 'fat_loss', icon: Flame, label: t('onboarding.fields.fatLoss'), desc: '', color: '#00b0ff' },
    { value: 'yoga', icon: Flower2, label: t('onboarding.fields.yoga'), desc: t('onboarding.fields.yogaDesc'), color: '#a855f7' },
    { value: 'pilates', icon: Circle, label: t('onboarding.fields.pilates'), desc: t('onboarding.fields.pilatesDesc'), color: '#ec4899' },
    { value: 'reformer', icon: Wrench, label: t('onboarding.fields.reformer'), desc: t('onboarding.fields.reformerDesc'), color: '#14b8a6' },
    { value: 'meditation', icon: Brain, label: t('onboarding.fields.meditation'), desc: t('onboarding.fields.meditationDesc'), color: '#8b5cf6' },
  ];

  const healthOptions = [
    { value: 'none', label: t('onboarding.fields.noHealthIssue'), emoji: '✅' },
    { value: 'back_pain', label: t('onboarding.fields.back_pain'), emoji: '🦴' },
    { value: 'knee_issue', label: t('onboarding.fields.knee_issue'), emoji: '🦵' },
    { value: 'shoulder_injury', label: t('onboarding.fields.shoulder_injury'), emoji: '💪' },
    { value: 'wrist_issue', label: t('onboarding.fields.wrist_issue'), emoji: '✋' },
    { value: 'heart_condition', label: t('onboarding.fields.heart_condition'), emoji: '❤️' },
  ];

  const allergyOptions = [
    { value: 'none', label: t('onboarding.fields.noAllergy'), emoji: '✅' },
    { value: 'lactose', label: t('onboarding.fields.lactose'), emoji: '🥛' },
    { value: 'gluten', label: t('onboarding.fields.gluten'), emoji: '🌾' },
    { value: 'egg', label: t('onboarding.fields.egg'), emoji: '🥚' },
    { value: 'nuts', label: t('onboarding.fields.nuts'), emoji: '🥜' },
    { value: 'seafood', label: t('onboarding.fields.seafood'), emoji: '🐟' },
    { value: 'soy', label: t('onboarding.fields.soy'), emoji: '🫘' },
    { value: 'sesame', label: t('onboarding.fields.sesame'), emoji: '🌾' },
    { value: 'vegan', label: t('onboarding.fields.vegan'), emoji: '🌱' },
    { value: 'vegetarian', label: t('onboarding.fields.vegetarian'), emoji: '🥬' },
  ];

  // Form state
  const [name, setName] = useState(defaultName);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [experience, setExperience] = useState('beginner');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [primaryGoal, setPrimaryGoal] = useState('muscle');
  const [trainingEnvironment, setTrainingEnvironment] = useState('gym');
  const [healthConditions, setHealthConditions] = useState(['none']);
  const [allergies, setAllergies] = useState(['none']);
  const [focusAreas, setFocusAreas] = useState([]);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(null);

  const asksForTrainingEnvironment = ['muscle', 'fat_loss', 'reformer'].includes(primaryGoal);
  const trainingEnvironmentOptions = primaryGoal === 'reformer'
    ? [
      { value: 'studio', icon: Building2, label: t('onboarding.fields.reformerStudio'), desc: t('onboarding.fields.reformerStudioDesc') },
      { value: 'home_reformer', icon: House, label: t('onboarding.fields.homeReformer'), desc: t('onboarding.fields.homeReformerDesc') },
    ]
    : [
      { value: 'home_bodyweight', icon: House, label: t('onboarding.fields.homeBodyweight'), desc: t('onboarding.fields.homeBodyweightDesc') },
      { value: 'home_basic', icon: PackageOpen, label: t('onboarding.fields.homeBasic'), desc: t('onboarding.fields.homeBasicDesc') },
      { value: 'gym', icon: Building2, label: t('onboarding.fields.gym'), desc: t('onboarding.fields.gymDesc') },
    ];

  // ── Persist & restore onboarding data ───────────────────
  const STORAGE_KEY = 'fb_onboarding_draft';
  const DRAFT_VERSION = 5;

  // Restore on mount
  useEffect(() => {
    if (initialData) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setName(initialData.name || '');
      setAge(initialData.age || 25);
      setGender(initialData.gender || 'male');
      setHeight(initialData.height || 175);
      setWeight(initialData.weight || 75);
      setExperience(initialData.experience || 'beginner');
      setActivityLevel(initialData.activityLevel || 'moderate');
      setPrimaryGoal(initialData.primaryGoal || 'muscle');
      setTrainingEnvironment(normalizeTrainingEnvironment(initialData.primaryGoal, initialData.trainingEnvironment));
      setHealthConditions(Array.isArray(initialData.healthConditions) && initialData.healthConditions.length ? initialData.healthConditions : ['none']);
      setAllergies(Array.isArray(initialData.allergies) && initialData.allergies.length ? initialData.allergies : ['none']);
      setStep(0);
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        if (saved.draftVersion !== DRAFT_VERSION) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        if (saved.name) setName(saved.name);
        if (saved.age) setAge(saved.age);
        if (saved.gender) setGender(saved.gender);
        if (saved.height) setHeight(saved.height);
        if (saved.weight) setWeight(saved.weight);
        if (saved.experience) setExperience(saved.experience);
        if (saved.activityLevel) setActivityLevel(saved.activityLevel);
        if (saved.primaryGoal) setPrimaryGoal(saved.primaryGoal);
        if (saved.trainingEnvironment) {
          setTrainingEnvironment(normalizeTrainingEnvironment(saved.primaryGoal || 'muscle', saved.trainingEnvironment));
        }
        if (Array.isArray(saved.healthConditions)) setHealthConditions(saved.healthConditions.length ? saved.healthConditions : ['none']);
        if (Array.isArray(saved.allergies)) setAllergies(saved.allergies.length ? saved.allergies : ['none']);
        if (Array.isArray(saved.focusAreas)) setFocusAreas(normalizeFocusAreas(saved.focusAreas));
        if (saved.trainingDaysPerWeek) setTrainingDaysPerWeek(normalizeTrainingDays(saved.trainingDaysPerWeek));
        if (typeof saved.step === 'number') setStep(Math.min(saved.step, STEP_IDS.length - 1));
      } else if (defaultName) {
        setName(defaultName);
      }
    } catch (err) { console.warn('[Onboarding] restore:', err); }
  }, [initialData, resetDraftKey, defaultName]);

  // Save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        draftVersion: DRAFT_VERSION,
        name, age, gender, height, weight,
        experience, activityLevel, primaryGoal, trainingEnvironment, healthConditions, allergies, step,
        focusAreas, trainingDaysPerWeek,
      }));
    } catch (err) { console.warn('[Onboarding] save:', err); }
  }, [name, age, gender, height, weight, experience, activityLevel, primaryGoal, trainingEnvironment, healthConditions, allergies, step, focusAreas, trainingDaysPerWeek]);

  const selectGoal = (goal) => {
    setPrimaryGoal(goal);
    if (goal === 'reformer') setTrainingEnvironment('studio');
    else if (['yoga', 'pilates', 'meditation'].includes(goal)) setTrainingEnvironment('home_bodyweight');
    else setTrainingEnvironment('gym');
  };

  const canNext = () => {
    switch (step) {
      case 0: return primaryGoal;
      case 1: return name.trim().length > 0 && gender && weight > 0 && height > 0;
      case 2: return true;
      case 3: return healthConditions.length > 0 && allergies.length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1 && canNext()) {
      trackEvent('onboarding_step_completed', {
        stepName: STEP_IDS[step],
        stepNumber: step + 1,
        goalType: primaryGoal || undefined,
      });
      setDirection(1);
      setStep(step + 1);
    }
  };

  const submitOnboarding = () => {
    if (STEP_IDS[step] !== 'safety' || !canNext()) return;
    trackEvent('onboarding_step_completed', {
      stepName: 'safety',
      stepNumber: STEP_IDS.length,
      goalType: primaryGoal || undefined,
    });
    trackEvent('onboarding_completed', {
      goalType: primaryGoal || undefined,
      environment: normalizeTrainingEnvironment(primaryGoal, trainingEnvironment),
    });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    onSubmit({
      name, age, gender, height, weight,
      // Do not invent a body-fat value. The plan generator uses Mifflin-St Jeor
      // until the user records an actual measurement.
      bodyFatPercentage: null,
      experience,
      activityLevel,
      primaryGoal,
      trainingEnvironment: normalizeTrainingEnvironment(primaryGoal, trainingEnvironment),
      workSchedule: ['flexible'],
      budget: 'moderate',
      healthConditions,
      allergies,
      focusAreas: ['muscle', 'fat_loss'].includes(primaryGoal) ? normalizeFocusAreas(focusAreas) : [],
      trainingDaysPerWeek: primaryGoal === 'meditation' ? null : normalizeTrainingDays(trainingDaysPerWeek),
    });
  };

  const toggleFocusArea = (area) => {
    setFocusAreas((prev) => {
      if (prev.includes(area)) return prev.filter((key) => key !== area);
      if (prev.length >= MAX_FOCUS_AREAS) return [...prev.slice(1), area];
      return [...prev, area];
    });
  };
  const showsFocusAreas = ['muscle', 'fat_loss'].includes(primaryGoal);
  const showsTrainingDays = primaryGoal !== 'meditation';

  const advanceOrSubmit = () => {
    if (!canNext()) return;
    if (STEP_IDS[step] !== 'safety') {
      nextStep();
      return;
    }
    submitOnboarding();
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const goToStep = (idx) => {
    // Only allow going to completed or current steps
    if (idx <= step) {
      setDirection(idx > step ? 1 : -1);
      setStep(idx);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    advanceOrSubmit();
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const bmi = weight > 0 && height > 0 ? (weight / ((height / 100) ** 2)).toFixed(1) : '—';
  const bmiCategory = (() => {
    const val = parseFloat(bmi);
    if (isNaN(val)) return '';
    if (val < 18.5) return t('onboarding.fields.bmiUnderweight');
    if (val < 25) return t('onboarding.fields.bmiNormal');
    if (val < 30) return t('onboarding.fields.bmiOverweight');
    return t('onboarding.fields.bmiObese');
  })();

  return (
    <div className="min-h-screen bg-slate-950 bg-grid text-white flex flex-col items-center justify-center px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold font-outfit tracking-tighter bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500 bg-clip-text text-transparent mb-2">
            FULL BALANCE
          </h1>
          <p className="text-slate-500 text-sm font-outfit">
            {t('onboarding.step1.subtitle')}
          </p>
        </motion.div>

        {/* ── Progress Bar ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => goToStep(i)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    i <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                    isActive
                      ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                      : isDone
                        ? 'bg-slate-800 border border-slate-700 text-emerald-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-600',
                  ].join(' ')}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 min-h-[440px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              {/* ─── STEP 0: Hedef ────────────────────── */}
              {step === 0 && (
                <div className="space-y-6 flex-1">
                  <div>
                    <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.step4.title')}</h2>
                    <p className="text-sm text-slate-500">
                      {t('onboarding.step4.subtitle') || 'Önce hedefini seç. Planı hemen oluşturacağız; ayrıntıları sonra ekleyebilirsin.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {goals.map((goal) => {
                      const Icon = goal.icon;
                      const sel = primaryGoal === goal.value;
                      return (
                        <motion.button
                          type="button"
                          key={goal.value}
                          onClick={() => selectGoal(goal.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={[
                            'relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer',
                            sel
                              ? 'bg-slate-900 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700',
                          ].join(' ')}
                        >
                          {sel && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                              <BadgeCheck size={18} className="text-orange-400" />
                            </motion.div>
                          )}
                          <div className={`p-3 rounded-2xl ${sel ? 'bg-orange-500/10' : 'bg-slate-800'}`}>
                            <Icon size={28} style={{ color: sel ? goal.color : '#64748b' }} />
                          </div>
                          <div>
                            <span className={`block text-sm font-bold font-outfit ${sel ? 'text-white' : 'text-slate-300'}`}>
                              {goal.label}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 block">{goal.desc}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 font-outfit">{t('onboarding.fields.experience')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {experienceLevels.map((lvl) => {
                        const selected = experience === lvl.value;
                        return (
                          <SelectCard key={lvl.value} selected={selected} onClick={() => setExperience(lvl.value)} className="min-h-[84px] p-3">
                            <span className="text-xl">{lvl.emoji}</span>
                            <span className={`text-xs font-semibold font-outfit ${selected ? 'text-white' : 'text-slate-400'}`}>{lvl.label}</span>
                          </SelectCard>
                        );
                      })}
                    </div>
                  </div>

                  {asksForTrainingEnvironment && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-3 font-outfit">{t('onboarding.fields.trainingEnvironment')}</label>
                      <div className={`grid gap-2 ${trainingEnvironmentOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {trainingEnvironmentOptions.map((option) => {
                          const Icon = option.icon;
                          const selected = trainingEnvironment === option.value;
                          return (
                            <SelectCard key={option.value} selected={selected} onClick={() => setTrainingEnvironment(option.value)} className="min-h-[88px] p-3">
                              <Icon size={20} className={selected ? 'text-orange-400' : 'text-slate-500'} />
                              <span className={`text-xs font-semibold font-outfit ${selected ? 'text-white' : 'text-slate-400'}`}>{option.label}</span>
                            </SelectCard>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <Sparkles size={18} className="text-emerald-400 shrink-0" />
                    <p className="text-xs text-slate-400">
                      Sağlık ve alerji bilgilerin alınarak antrenman ve beslenme planın daha güvenli hazırlanır.
                    </p>
                  </div>
                </div>
              )}

              {/* ─── STEP 1: Kişisel ───────────────────── */}
              {step === 1 && (
                <div className="space-y-6 flex-1">
                  <div>
                    <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.step1.title')}</h2>
                    <p className="text-sm text-slate-500">{t('onboarding.step1.subtitle')}</p>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name-input" className="block text-sm font-medium text-slate-400 mb-2 font-outfit">{t('onboarding.fields.name')}</label>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('onboarding.fields.namePlaceholder')}
                      autoComplete="name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-colors font-outfit"
                    />
                  </div>

                  {/* Age */}
                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                    <SliderInput label={t('onboarding.fields.age')} value={age} onChange={setAge} min={16} max={65} unit="" />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3 font-outfit">{t('onboarding.fields.gender')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {genderOptions.map((g) => {
                        const sel = gender === g.value;
                        return (
                          <SelectCard key={g.value} selected={sel} onClick={() => setGender(g.value)}>
                            <span className="text-3xl">{g.emoji}</span>
                            <span className={`text-sm font-semibold font-outfit ${sel ? 'text-white' : 'text-slate-400'}`}>
                              {g.label}
                            </span>
                          </SelectCard>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                      <SliderInput label={t('onboarding.fields.height')} value={height} onChange={setHeight} min={140} max={220} unit="cm" />
                    </div>
                    <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
                      <SliderInput label={t('onboarding.fields.weight')} value={weight} onChange={setWeight} min={40} max={200} unit="kg" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800/50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                      <Ruler size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('onboarding.fields.bmiLabel')}</p>
                      <p className="text-lg font-bold font-outfit text-white">
                        {bmi}
                        {bmiCategory && (
                          <span className="ml-2 text-xs font-normal text-slate-500">{bmiCategory}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 2: Odak bölge ve gün sayısı ── */}
              {step === 2 && (
                <div className="space-y-6 flex-1">
                  {showsTrainingDays && (
                    <>
                      <div>
                        <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.fields.daysTitle')}</h2>
                        <p className="text-sm text-slate-500">{t('onboarding.fields.daysSubtitle')}</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <SelectCard selected={trainingDaysPerWeek === null} onClick={() => setTrainingDaysPerWeek(null)} className="min-h-[72px] p-3">
                          <CalendarDays size={18} className={trainingDaysPerWeek === null ? 'text-orange-300' : 'text-slate-500'} />
                          <span className={`text-xs font-semibold font-outfit ${trainingDaysPerWeek === null ? 'text-white' : 'text-slate-400'}`}>{t('onboarding.fields.daysAuto')}</span>
                        </SelectCard>
                        {TRAINING_DAY_OPTIONS.map((days) => {
                          const selected = trainingDaysPerWeek === days;
                          return (
                            <SelectCard key={days} selected={selected} onClick={() => setTrainingDaysPerWeek(days)} className="min-h-[72px] p-3">
                              <span className={`text-2xl font-extrabold font-outfit ${selected ? 'text-white' : 'text-slate-300'}`}>{days}</span>
                              <span className={`text-[10px] font-semibold ${selected ? 'text-orange-200' : 'text-slate-500'}`}>{t('onboarding.fields.daysUnit')}</span>
                            </SelectCard>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {showsFocusAreas && (
                    <>
                      <div className={showsTrainingDays ? 'border-t border-slate-800 pt-5' : ''}>
                        <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.fields.focusTitle')}</h2>
                        <p className="text-sm text-slate-500">{t('onboarding.fields.focusSubtitle')}</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FOCUS_AREA_KEYS.map((area) => {
                          const selected = focusAreas.includes(area);
                          return (
                            <SelectCard key={area} selected={selected} onClick={() => toggleFocusArea(area)} className="min-h-[88px] p-3">
                              <span className="text-2xl">{FOCUS_AREA_EMOJI[area]}</span>
                              <span className={`text-xs font-semibold font-outfit ${selected ? 'text-white' : 'text-slate-400'}`}>
                                {t(`onboarding.fields.${FOCUS_AREA_LABEL_KEYS[area]}`)}
                              </span>
                            </SelectCard>
                          );
                        })}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">{t('onboarding.fields.focusHonesty')}</p>
                    </>
                  )}

                  {!showsFocusAreas && !showsTrainingDays && (
                    <p className="text-sm text-slate-500">{t('onboarding.fields.focusNotNeeded')}</p>
                  )}
                </div>
              )}

              {/* ─── STEP 3: Güvenlik ─────────────────── */}
              {step === 3 && (
                <div className="space-y-6 flex-1">
                  <div>
                    <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.fields.healthTitle')}</h2>
                    <p className="text-sm text-slate-500">{t('onboarding.fields.healthSubtitle')}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {healthOptions.map((option) => {
                      const selected = healthConditions.includes(option.value);
                      return (
                        <SelectCard
                          key={option.value}
                          selected={selected}
                          onClick={() => setHealthConditions((prev) => toggleMultiValue(prev, option.value))}
                          className="min-h-[88px] p-3"
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className={`text-xs font-semibold font-outfit ${selected ? 'text-white' : 'text-slate-400'}`}>
                            {option.label}
                          </span>
                        </SelectCard>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 pt-5">
                    <h2 className="text-xl font-bold font-outfit text-white mb-1">{t('onboarding.fields.allergyTitle')}</h2>
                    <p className="text-sm text-slate-500">{t('onboarding.fields.allergySubtitle')}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {allergyOptions.map((option) => {
                      const selected = allergies.includes(option.value);
                      return (
                        <SelectCard
                          key={option.value}
                          selected={selected}
                          onClick={() => setAllergies((prev) => toggleMultiValue(prev, option.value))}
                          className="min-h-[88px] p-3"
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className={`text-xs font-semibold font-outfit ${selected ? 'text-white' : 'text-slate-400'}`}>
                            {option.label}
                          </span>
                        </SelectCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                step === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700',
              ].join(' ')}
            >
              <ChevronLeft size={16} />
              {t('onboarding.prev')}
            </motion.button>

            <span className="text-xs text-slate-600 font-outfit hidden sm:inline">
              {step + 1} / {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <motion.button
                type="button"
                onClick={advanceOrSubmit}
                disabled={!canNext()}
                whileHover={canNext() ? { scale: 1.03 } : {}}
                whileTap={canNext() ? { scale: 0.97 } : {}}
                className={[
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                  canNext()
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed',
                ].join(' ')}
              >
                {t('onboarding.next')}
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={advanceOrSubmit}
                disabled={!canNext()}
                whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(249,115,22,0.35)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-sm font-bold font-outfit tracking-wide cursor-pointer shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
              >
                {t('onboarding.generate')}
                <Sparkles size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
