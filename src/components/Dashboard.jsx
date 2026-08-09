import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n/LanguageContext';

// ── Lazy-loaded Dashboard sub-components ──
const NutritionPanel = lazy(() => import('./NutritionPanel'));
const WorkoutPanel = lazy(() => import('./WorkoutPanel'));
const ProgressTracker = lazy(() => import('./ProgressTracker'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const WaterTracker = lazy(() => import('./WaterTracker'));
const WorkoutTimer = lazy(() => import('./WorkoutTimer'));
const WeeklyReport = lazy(() => import('./WeeklyReport'));
const MonthlyReport = lazy(() => import('./MonthlyReport'));
const Achievements = lazy(() => import('./Achievements'));
const SupplementGuide = lazy(() => import('./SupplementGuide'));
const ShareCard = lazy(() => import('./ShareCard'));
const BodyMeasurements = lazy(() => import('./BodyMeasurements'));
const SleepTracker = lazy(() => import('./SleepTracker'));
const CalorieCalc = lazy(() => import('./CalorieCalc'));
const DataExport = lazy(() => import('./DataExport'));
const ProgramAdvisor = lazy(() => import('./ProgramAdvisor'));
const NudgeCards = lazy(() => import('./NudgeCards'));
const TodayFocusPanel = lazy(() => import('./TodayFocusPanel'));
const MuscleRecovery = lazy(() => import('./MuscleRecovery'));
const StreakCalendar = lazy(() => import('./StreakCalendar'));
const LongevityPanel = lazy(() => import('./LongevityPanel'));
const LongevityTodayCard = lazy(() => import('./LongevityPanel').then((module) => ({ default: module.LongevityTodayCard })));

const DailyChallenge = lazy(() => import('./DailyChallenge'));
const Leaderboard = lazy(() => import('./Leaderboard'));
const StravaConnectCard = lazy(() => import('./StravaPanel').then(m => ({ default: m.StravaConnectCard })));
const StravaActivitiesPanel = lazy(() => import('./StravaPanel').then(m => ({ default: m.StravaActivitiesPanel })));

import {
  Sparkles, UtensilsCrossed, Dumbbell, TrendingUp, User,
  LogOut, Target, CalendarCheck, Share2, ChevronDown, ArrowRight,
} from 'lucide-react';



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Welcome Modal ────────────────────────────────────────
function WelcomeOverlay({ name, onClose, t }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl mb-3"
        >
          ⚡
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-white mb-1">
          {t('dashboard.welcome.hi')} <span className="gradient-text">{name}</span>!
        </h1>
        <p className="text-slate-400 text-xs font-outfit">
          {t('dashboard.welcome.subtitle')}
        </p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'linear' }}
          className="h-0.5 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full mt-4 mx-auto max-w-[200px]"
        />
      </motion.div>
    </motion.div>
  );
}

function TodayActionCard({ icon: Icon, title, desc, accent, onClick }) {
  const accentClass = {
    orange: 'border-orange-500/25 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15',
    emerald: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15',
    blue: 'border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15',
    violet: 'border-violet-500/25 bg-violet-500/10 text-violet-300 hover:bg-violet-500/15',
  }[accent] || 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-[96px] rounded-2xl border p-4 text-left transition-colors ${accentClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon size={20} className="shrink-0" />
        <ArrowRight size={16} className="shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 text-sm font-outfit font-bold text-white">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-slate-400">{desc}</p>
    </button>
  );
}

// ═════════════════════════════════════════════════════════
export default function Dashboard({ plan, user, onBack, onLogout, onPlanUpdate }) {
  const { t, lang, setLang, langFlags, SUPPORTED } = useTranslation();
  const [activeTab, setActiveTab] = useState('today');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [daysSinceJoin] = useState(() => {
    try { const d = localStorage.getItem('shredmatrix_first_login'); return d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0; } catch (err) { console.warn('[Dashboard]', err?.message || err); return 0; }
  });

  // ── Tabs ─────────────────────────────────────────────────
  const TABS = [
    { id: 'nutrition', label: t('dashboard.tabs.nutrition'), icon: UtensilsCrossed },
    { id: 'workout', label: t('dashboard.tabs.workout'), icon: Dumbbell },
    { id: 'today', label: t('dashboard.tabs.today'), icon: CalendarCheck },
    { id: 'progress', label: t('dashboard.tabs.progress'), icon: TrendingUp },
    { id: 'profile', label: t('dashboard.tabs.profile'), icon: User },
  ];

  const todayActions = [
    {
      id: 'workout',
      icon: Dumbbell,
      title: t('dashboard.todayActions.workout.title'),
      desc: t('dashboard.todayActions.workout.desc'),
      accent: 'orange',
    },
    {
      id: 'nutrition',
      icon: UtensilsCrossed,
      title: t('dashboard.todayActions.nutrition.title'),
      desc: t('dashboard.todayActions.nutrition.desc'),
      accent: 'emerald',
    },
    {
      id: 'progress',
      icon: TrendingUp,
      title: t('dashboard.todayActions.progress.title'),
      desc: t('dashboard.todayActions.progress.desc'),
      accent: 'blue',
    },
    {
      id: 'profile',
      icon: User,
      title: t('dashboard.todayActions.profile.title'),
      desc: t('dashboard.todayActions.profile.desc'),
      accent: 'violet',
    },
  ];

  // Show welcome on first visit
  useEffect(() => {
    if (!plan) return;
    const key = `shredmatrix_welcomed_${user?.email || 'guest'}`;
    if (!sessionStorage.getItem(key)) {
      setShowWelcome(true);
      sessionStorage.setItem(key, '1');
    }
    // Record first login for achievements
    if (!localStorage.getItem('shredmatrix_first_login')) {
      localStorage.setItem('shredmatrix_first_login', new Date().toISOString());
    }
  }, [plan, user]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return undefined;
    const initialHeight = window.visualViewport.height;
    const updateKeyboardState = () => {
      const viewport = window.visualViewport;
      const heightLoss = window.innerHeight - viewport.height;
      setKeyboardOpen(heightLoss > 140 || viewport.height < initialHeight - 140);
    };

    window.visualViewport.addEventListener('resize', updateKeyboardState);
    window.visualViewport.addEventListener('scroll', updateKeyboardState);
    return () => {
      window.visualViewport.removeEventListener('resize', updateKeyboardState);
      window.visualViewport.removeEventListener('scroll', updateKeyboardState);
    };
  }, []);

  if (!plan) return null;

  return (
    <>
    <div className="min-h-screen bg-grid pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 overflow-x-hidden w-full">
      {/* ── Welcome Overlay ── */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay
            name={plan.userName || t('dashboard.athlete') || 'Athlete'}
            onClose={() => setShowWelcome(false)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* ── Top Nav ──────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50 safe-area-top"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#ff6d00]" size={18} />
            <h1 className="text-base font-outfit font-bold gradient-text tracking-tight">
              FULL BALANCE
            </h1>
          </div>

          {/* Desktop tabs */}
          <div role="tablist" className="hidden lg:flex items-center gap-0.5 bg-slate-900/80 border border-slate-800 rounded-full p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
                    active
                      ? 'bg-gradient-to-r from-orange-500/15 to-blue-500/15 text-orange-400 border border-orange-500/20'
                      : 'text-slate-500 hover:text-slate-300',
                  ].join(' ')}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Quick Stats Button */}
            <div className="relative hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowQuickStats(!showQuickStats)}
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer',
                  showQuickStats
                    ? 'bg-gradient-to-r from-[#ff6d00]/20 to-[#00b0ff]/20 border-[#ff6d00]/40 text-orange-400'
                    : 'bg-gradient-to-r from-[#ff6d00]/10 to-[#00b0ff]/10 border-[#ff6d00]/20 text-white hover:border-[#ff6d00]/40',
                ].join(' ')}
              >
                <Target size={11} className="text-[#ff6d00]" />
                <span className="text-[10px]">{plan.goal}</span>
                <ChevronDown size={10} className={`text-slate-500 transition-transform ${showQuickStats ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* Quick Stats Dropdown */}
              <AnimatePresence>
                {showQuickStats && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowQuickStats(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 z-50 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-black/40"
                    >
                      <h4 className="text-xs font-bold font-outfit text-white mb-3 flex items-center gap-2">
                        <Sparkles size={12} className="text-orange-400" />
                        {t('dashboard.quickStats.title')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">{t('dashboard.quickStats.goal')}</p>
                          <p className="text-xs font-bold text-orange-400 font-outfit">{plan.goal}</p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">{t('dashboard.quickStats.dailyCal')}</p>
                          <p className="text-xs font-bold text-white font-outfit">{plan.dailyCalories} <span className="text-slate-500 text-[9px]">kcal</span></p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">BMR</p>
                          <p className="text-xs font-bold text-emerald-400 font-outfit">{plan.bmr} <span className="text-slate-500 text-[9px]">kcal</span></p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">TDEE</p>
                          <p className="text-xs font-bold text-purple-400 font-outfit">{plan.tdee} <span className="text-slate-500 text-[9px]">kcal</span></p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">{t('dashboard.quickStats.training')}</p>
                          <p className="text-xs font-bold text-blue-400 font-outfit">
                            {plan.workoutSplit?.filter(d => !d.isRest).length || 0} {t('dashboard.quickStats.daysWeek')}
                          </p>
                        </div>
                        <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 mb-0.5">{t('dashboard.quickStats.programAge')}</p>
                          <p className="text-xs font-bold text-amber-400 font-outfit">
                            {daysSinceJoin} {t('dashboard.quickStats.days')}
                          </p>
                        </div>
                      </div>
                      {/* Macros mini bar */}
                      <div className="mt-3 flex items-center gap-1.5 text-[9px]">
                        <span className="text-orange-400 font-semibold">P {plan.macros?.protein || '—'}g</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-blue-400 font-semibold">C {plan.macros?.carbs || '—'}g</span>
                        <span className="text-slate-700">•</span>
                        <span className="text-purple-400 font-semibold">F {plan.macros?.fat || '—'}g</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShare(true)}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
              title={t('dashboard.share')}
              aria-label={t('dashboard.share')}
            >
              <Share2 size={13} />
              <span className="text-[10px] font-medium hidden sm:inline">{t('dashboard.share')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              title={t('dashboard.logout')}
              aria-label={t('dashboard.logout')}
            >
              <LogOut size={13} />
              <span className="text-[10px] font-medium hidden sm:inline">{t('dashboard.logout')}</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* ─── Bugün Tab ─── */}
          {activeTab === 'today' && (
            <motion.div
              key="today"
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={columnVariants} className="max-w-4xl mx-auto space-y-4">
                  <TodayFocusPanel plan={plan} onNavigate={(tab) => setActiveTab(tab)} />
                  <LongevityTodayCard plan={plan} onNavigate={(tab) => setActiveTab(tab)} />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {todayActions.map((action) => (
                      <TodayActionCard
                        key={action.id}
                        icon={action.icon}
                        title={action.title}
                        desc={action.desc}
                        accent={action.accent}
                        onClick={() => setActiveTab(action.id)}
                      />
                    ))}
                  </div>
                  <NudgeCards plan={plan} onNavigate={(tab) => setActiveTab(tab)} />
                  <DailyChallenge />
                </motion.div>
              </motion.div>
              </Suspense>
            </motion.div>
          )}

          {/* ─── Beslenme Tab ─── */}
          {activeTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div variants={columnVariants} className="lg:col-span-2">
                    <NutritionPanel plan={plan} />
                  </motion.div>
                  <motion.div variants={columnVariants} className="space-y-6">
                    <CalorieCalc />
                    <WaterTracker />
                    <SleepTracker />
                  </motion.div>
                </div>
              </motion.div>
              </Suspense>
            </motion.div>
          )}

          {/* ─── Antrenman Tab ─── */}
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div variants={columnVariants} className="lg:col-span-2">
                    <WorkoutPanel plan={plan} />
                  </motion.div>
                  <motion.div variants={columnVariants} className="space-y-6">
                    <WorkoutTimer />
                    <MuscleRecovery plan={plan} />
                    <ProgramAdvisor plan={plan} onPlanUpdate={onPlanUpdate} />
                    <SupplementGuide goal={plan.goal} />
                  </motion.div>
                </div>
              </motion.div>
              </Suspense>
            </motion.div>
          )}

          {/* ─── İlerleme Tab ─── */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <div className="mb-6">
                  <LongevityPanel plan={plan} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div variants={columnVariants} className="lg:col-span-2">
                    <ProgressTracker userName={plan.userName} />
                  </motion.div>
                  <motion.div variants={columnVariants} className="space-y-6">
                    <StreakCalendar />
                  </motion.div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowProgressDetails((value) => !value)}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-left text-sm font-outfit font-bold text-slate-300 hover:border-slate-700 transition-colors"
                  >
                    <span>{showProgressDetails ? t('dashboard.progressDetails.hide') : t('dashboard.progressDetails.show')}</span>
                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${showProgressDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {showProgressDetails && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-6">
                        <WeeklyReport plan={plan} />
                        <MonthlyReport plan={plan} />
                        <Achievements plan={plan} user={user} />
                      </div>
                      <div className="space-y-6">
                        <BodyMeasurements />
                        <StravaActivitiesPanel />
                        <Leaderboard plan={plan} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
              </Suspense>
            </motion.div>
          )}

          {/* ─── Profil Tab ─── */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              role="tabpanel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
              <ProfilePage
                plan={plan}
                user={user}
                onLogout={onLogout}
                onUpdatePlan={onBack}
                onPlanUpdate={onPlanUpdate}
              />
              <div className="mt-6 space-y-6">
                <StravaConnectCard />
                <DataExport />
              </div>
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medical Disclaimer */}
        <div className="mt-8 mb-4 text-center">
          <p className="text-[8px] text-slate-700">
            ⚕️ {t('disclaimer.short')} · {t('disclaimer.dataPrivacy')}
          </p>
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ─────────────────────── */}
      <nav
        className={[
          'lg:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50 transition-transform duration-200',
          keyboardOpen ? 'translate-y-full pointer-events-none' : 'translate-y-0',
        ].join(' ')}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div role="tablist" className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer min-w-0',
                  active ? 'text-orange-400' : 'text-slate-600',
                ].join(' ')}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium truncate">{tab.label}</span>
                {active && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="w-4 h-0.5 rounded-full bg-orange-500 mt-0.5"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Footer (desktop only) ─────────────────────── */}
      <footer className="hidden lg:block border-t border-slate-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-600">
            {t('dashboard.footer')}
          </p>
          {user?.email && (
            <p className="text-[10px] text-slate-700">{user.email}</p>
          )}
        </div>
      </footer>
    </div>

      {/* ── Share Card Modal ── */}
      <AnimatePresence>
        {showShare && (
          <Suspense fallback={<div className="fixed inset-0 z-[90] bg-slate-950/90 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>}>
            <ShareCard plan={plan} onClose={() => setShowShare(false)} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
