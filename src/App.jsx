import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import OnboardingTour from './components/OnboardingTour';
import { useTranslation } from './i18n/LanguageContext';
import { generatePlan } from './data/planGenerator';

const VIEWS = {
  LANDING: 'landing',
  AUTH: 'auth',
  ONBOARDING: 'onboarding',
  LOADING: 'loading',
  DASHBOARD: 'dashboard',
};

// ── Loading Screen ───────────────────────────────────────
function LoadingScreen() {
  const { t } = useTranslation();
  const steps = t('loading.steps') || [];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex flex-col items-center justify-center px-4">
      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-tighter bg-gradient-to-r from-orange-500 via-amber-400 to-blue-500 bg-clip-text text-transparent">
          SHRED MATRIX
        </h1>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-6">
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-slate-400 font-outfit"
        >
          {steps[currentStep]}
        </motion.p>
      </AnimatePresence>

      {/* Spinning dots */}
      <div className="flex items-center gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-500"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LANDING);
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [showTour, setShowTour] = useState(false);

  // Restore session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('shredmatrix_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email) {
          setUser(parsed);
          const savedPlan = localStorage.getItem(`shredmatrix_plan_${parsed.email}`);
          if (savedPlan) {
            setPlan(JSON.parse(savedPlan));
            setCurrentView(VIEWS.DASHBOARD);
          } else {
            setCurrentView(VIEWS.ONBOARDING);
          }
        }
      }
    } catch {
      localStorage.removeItem('shredmatrix_session');
    }
  }, []);

  // Handle loading → dashboard transition
  useEffect(() => {
    if (currentView === VIEWS.LOADING && pendingFormData) {
      const timer = setTimeout(() => {
        const generatedPlan = generatePlan(pendingFormData);
        setPlan(generatedPlan);

        // Save plan creation date
        localStorage.setItem('shredmatrix_plan_created', new Date().toISOString());

        if (user?.email) {
          try {
            localStorage.setItem(`shredmatrix_plan_${user.email}`, JSON.stringify(generatedPlan));
          } catch { /* quota */ }
        }

        setPendingFormData(null);
        setCurrentView(VIEWS.DASHBOARD);

        // Show tour for first-time users
        const tourKey = `shredmatrix_tour_seen_${user?.email || 'guest'}`;
        if (!localStorage.getItem(tourKey)) {
          setShowTour(true);
          localStorage.setItem(tourKey, '1');
        }
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [currentView, pendingFormData, user]);

  const handleAuth = (userData) => {
    setUser(userData);
    const savedPlan = localStorage.getItem(`shredmatrix_plan_${userData.email}`);
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
        setCurrentView(VIEWS.DASHBOARD);
      } catch {
        setCurrentView(VIEWS.ONBOARDING);
      }
    } else {
      setCurrentView(VIEWS.ONBOARDING);
    }
  };

  const handleSubmit = (formData) => {
    setPendingFormData(formData);
    setCurrentView(VIEWS.LOADING);
  };

  const handleBack = () => {
    setCurrentView(VIEWS.ONBOARDING);
    setPlan(null);
    if (user?.email) {
      localStorage.removeItem(`shredmatrix_plan_${user.email}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shredmatrix_session');
    setUser(null);
    setPlan(null);
    setCurrentView(VIEWS.LANDING);
  };

  const handlePlanUpdate = (newPlan) => {
    setPlan(newPlan);
    if (user?.email) {
      try {
        localStorage.setItem(`shredmatrix_plan_${user.email}`, JSON.stringify(newPlan));
      } catch { /* quota */ }
    }
  };

  const pageTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

  return (
    <>
      <AnimatePresence mode="wait">
        {currentView === VIEWS.LANDING && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition}>
            <LandingPage onStart={() => setCurrentView(VIEWS.AUTH)} />
          </motion.div>
        )}

        {currentView === VIEWS.AUTH && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition}>
            <AuthScreen onAuth={handleAuth} />
          </motion.div>
        )}

        {currentView === VIEWS.ONBOARDING && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition}>
            <Onboarding onSubmit={handleSubmit} />
          </motion.div>
        )}

        {currentView === VIEWS.LOADING && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={pageTransition}>
            <LoadingScreen />
          </motion.div>
        )}

        {currentView === VIEWS.DASHBOARD && plan && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition}>
            <Dashboard plan={plan} user={user} onBack={handleBack} onLogout={handleLogout} onPlanUpdate={handlePlanUpdate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Tour Overlay */}
      <AnimatePresence>
        {showTour && (
          <OnboardingTour onClose={() => setShowTour(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
