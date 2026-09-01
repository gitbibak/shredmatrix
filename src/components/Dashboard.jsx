import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n/LanguageContext';
import { preloadProfilePhoto, recordProductStep } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';

// ── Lazy-loaded Dashboard sub-components ──
const NutritionPanel = lazy(() => import('./NutritionPanel'));
const WorkoutPanel = lazy(() => import('./WorkoutPanel'));
const ProgressTracker = lazy(() => import('./ProgressTracker'));
const loadProfilePage = () => import('./ProfilePage');
const ProfilePage = lazy(loadProfilePage);
const WaterTracker = lazy(() => import('./WaterTracker'));
const WorkoutTimer = lazy(() => import('./WorkoutTimer'));
const WeeklyReport = lazy(() => import('./WeeklyReport'));
const MonthlyReport = lazy(() => import('./MonthlyReport'));
const Achievements = lazy(() => import('./Achievements'));
const RecoveryGuide = lazy(() => import('./RecoveryGuide'));
const ShareCard = lazy(() => import('./ShareCard'));
const BodyMeasurements = lazy(() => import('./BodyMeasurements'));
const SleepTracker = lazy(() => import('./SleepTracker'));
const CalorieCalc = lazy(() => import('./CalorieCalc'));
const DataExport = lazy(() => import('./DataExport'));
const ProgramAdvisor = lazy(() => import('./ProgramAdvisor'));
const TodayFocusPanel = lazy(() => import('./TodayFocusPanel'));
const MuscleRecovery = lazy(() => import('./MuscleRecovery'));
const StreakCalendar = lazy(() => import('./StreakCalendar'));
const LongevityPanel = lazy(() => import('./LongevityPanel'));
const PushPermission = lazy(() => import('./PushPermission'));
const MilestoneStoryPrompt = lazy(() => import('./MilestoneStoryPrompt'));
const InviteFriendsCard = lazy(() => import('./InviteFriendsCard'));

const DailyChallenge = lazy(() => import('./DailyChallenge'));
const Leaderboard = lazy(() => import('./Leaderboard'));
const StravaConnectCard = lazy(() => import('./StravaPanel').then(m => ({ default: m.StravaConnectCard })));
const StravaActivitiesPanel = lazy(() => import('./StravaPanel').then(m => ({ default: m.StravaActivitiesPanel })));

import {
  Sparkles, UtensilsCrossed, Dumbbell, TrendingUp, User,
  LogOut, Target, CalendarCheck, Share2, ChevronDown,
  Calculator, SlidersHorizontal, HeartPulse, Trophy,
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

function warmProfileAssets() {
  loadProfilePage().catch(() => {});
  preloadProfilePhoto().catch(() => {});
}

function DisclosureSection({ title, description, icon: Icon, open, onToggle, children, highlight = false }) {
  return (
    <section className={`overflow-hidden rounded-2xl border ${highlight ? 'border-cyan-500/35 bg-cyan-500/[0.06] shadow-lg shadow-cyan-950/20' : 'border-slate-800 bg-slate-900'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-800/30 sm:px-5"
      >
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${highlight ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 bg-slate-950/60 text-slate-300'}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-outfit text-sm font-bold text-white">{title}</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
        </span>
        <ChevronDown size={17} className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-slate-800 p-4 sm:p-5">{children}</div>}
    </section>
  );
}

// ═════════════════════════════════════════════════════════
export default function Dashboard({ plan, user, onBack, onLogout, onPlanUpdate }) {
  const { t, lang, setLang, langFlags, SUPPORTED } = useTranslation();
  const [activeTab, setActiveTab] = useState('today');
  const [showShare, setShowShare] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [showNutritionTools, setShowNutritionTools] = useState(false);
  const [showWorkoutTools, setShowWorkoutTools] = useState(false);
  const [showLongevity, setShowLongevity] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
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

  // Record the first login for achievement calculations.
  useEffect(() => {
    if (!plan) return;
    if (!localStorage.getItem('shredmatrix_first_login')) {
      localStorage.setItem('shredmatrix_first_login', new Date().toISOString());
    }
  }, [plan]);

  useEffect(() => {
    trackEvent('dashboard_tab_view', { tab: activeTab, module: plan?.primaryGoal || plan?.goalKey || 'unknown' });
    if (activeTab === 'today') {
      recordProductStep('today_viewed').catch((error) => console.warn('[Activation]', error?.message || error));
    }
  }, [activeTab, plan?.primaryGoal, plan?.goalKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('entry') !== 'push') return;

    const message = params.get('message') || 'unknown';
    trackEvent('push_notification_open', { message });
    params.delete('entry');
    params.delete('message');
    const query = params.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return undefined;
    const initialHeight = window.visualViewport.height;
    const updateKeyboardState = () => {
      const viewport = window.visualViewport;
      const heightLoss = window.innerHeight - viewport.height;
      const activeElement = document.activeElement;
      const editing = activeElement?.matches?.('input, textarea, select, [contenteditable="true"]');
      setKeyboardOpen(Boolean(editing && (heightLoss > 140 || viewport.height < initialHeight - 140)));
    };
    const updateAfterFocusChange = () => window.requestAnimationFrame(updateKeyboardState);

    window.visualViewport.addEventListener('resize', updateKeyboardState);
    window.visualViewport.addEventListener('scroll', updateKeyboardState);
    document.addEventListener('focusin', updateAfterFocusChange);
    document.addEventListener('focusout', updateAfterFocusChange);
    return () => {
      window.visualViewport.removeEventListener('resize', updateKeyboardState);
      window.visualViewport.removeEventListener('scroll', updateKeyboardState);
      document.removeEventListener('focusin', updateAfterFocusChange);
      document.removeEventListener('focusout', updateAfterFocusChange);
    };
  }, []);

  if (!plan) return null;

  return (
    <>
    <div className="mobile-app-shell min-h-screen w-full overflow-x-clip bg-grid lg:pb-0">
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
                  onPointerEnter={tab.id === 'profile' ? warmProfileAssets : undefined}
                  onFocus={tab.id === 'profile' ? warmProfileAssets : undefined}
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
              className="flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-2 text-blue-400 transition-colors hover:bg-blue-500/20 cursor-pointer"
              title={t('dashboard.share')}
              aria-label={t('dashboard.share')}
            >
              <Share2 size={16} />
              <span className="text-[10px] font-medium hidden sm:inline">{t('dashboard.share')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-red-400 transition-colors hover:bg-red-500/20 cursor-pointer"
              title={t('dashboard.logout')}
              aria-label={t('dashboard.logout')}
            >
              <LogOut size={16} />
              <span className="text-[10px] font-medium hidden sm:inline">{t('dashboard.logout')}</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="mx-auto max-w-7xl overflow-x-clip px-4 py-6 sm:px-6 lg:px-8">
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
                  <div className="grid grid-cols-2 gap-3">
                    <WaterTracker compact />
                    <SleepTracker compact />
                  </div>
                  <DisclosureSection
                    title={t('dashboard.simple.challengeTitle')}
                    description={t('dashboard.simple.challengeDesc')}
                    icon={Trophy}
                    open={showChallenge}
                    onToggle={() => setShowChallenge((value) => !value)}
                  >
                    <DailyChallenge />
                  </DisclosureSection>
                  <PushPermission daysSinceJoin={daysSinceJoin} />
                  <InviteFriendsCard surface="today" compact userName={plan?.userName || user?.name} />
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
                <div className="mx-auto max-w-5xl space-y-5">
                  <motion.div variants={columnVariants}>
                    <DisclosureSection
                      title={t('dashboard.simple.calculatorTitle')}
                      description={t('dashboard.simple.calculatorDesc')}
                      icon={Calculator}
                      open={showNutritionTools}
                      onToggle={() => setShowNutritionTools((value) => !value)}
                      highlight
                    >
                      <CalorieCalc embedded />
                    </DisclosureSection>
                  </motion.div>
                  <motion.div variants={columnVariants}>
                    <NutritionPanel plan={plan} />
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
                <div className="mx-auto max-w-5xl space-y-5">
                  <motion.div variants={columnVariants}>
                    <WorkoutPanel plan={plan} onPlanUpdate={onPlanUpdate} />
                  </motion.div>
                  <motion.div variants={columnVariants}>
                    <DisclosureSection
                      title={t('dashboard.simple.workoutToolsTitle')}
                      description={t('dashboard.simple.workoutToolsDesc')}
                      icon={SlidersHorizontal}
                      open={showWorkoutTools}
                      onToggle={() => setShowWorkoutTools((value) => !value)}
                    >
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <WorkoutTimer />
                        <MuscleRecovery plan={plan} />
                        <ProgramAdvisor plan={plan} onPlanUpdate={onPlanUpdate} />
                        <RecoveryGuide />
                      </div>
                    </DisclosureSection>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div variants={columnVariants} className="lg:col-span-2">
                    <ProgressTracker userName={plan.userName} />
                  </motion.div>
                  <motion.div variants={columnVariants} className="space-y-6">
                    <StreakCalendar plan={plan} />
                  </motion.div>
                </div>
                <div className="mt-6">
                  <DisclosureSection
                    title={t('dashboard.simple.longevityTitle')}
                    description={t('dashboard.simple.longevityDesc')}
                    icon={HeartPulse}
                    open={showLongevity}
                    onToggle={() => setShowLongevity((value) => !value)}
                  >
                    <LongevityPanel plan={plan} />
                  </DisclosureSection>
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
                        <WaterTracker />
                        <SleepTracker />
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
                <MilestoneStoryPrompt lang={lang} onOpenProfile={() => setActiveTab('profile')} />
                <StravaConnectCard />
                <DataExport />
              </div>
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medical Disclaimer */}
        <div className="mt-8 mb-4 text-center">
          <p className="text-[11px] leading-relaxed text-slate-500">
            ⚕️ {t('disclaimer.short')} · {t('disclaimer.dataPrivacy')}
          </p>
        </div>
      </main>

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

      {/* Keep fixed navigation outside scroll and animation containers for iOS. */}
      <nav
        className={[
          'mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50 transition-transform duration-200',
          keyboardOpen ? 'translate-y-full pointer-events-none' : 'translate-y-0',
        ].join(' ')}
      >
        <div role="tablist" className="flex h-16 w-full max-w-lg items-stretch mx-auto px-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onPointerDown={tab.id === 'profile' ? warmProfileAssets : undefined}
                onFocus={tab.id === 'profile' ? warmProfileAssets : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex min-h-14 min-w-0 flex-1 touch-manipulation select-none flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-all cursor-pointer',
                  active ? 'text-orange-400' : 'text-slate-600',
                ].join(' ')}
              >
                <Icon size={18} />
                <span className="max-w-full truncate text-[10px] leading-3 font-medium">{tab.label}</span>
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
