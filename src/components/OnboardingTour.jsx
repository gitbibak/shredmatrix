import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  Shuffle,
  Dumbbell,
  TrendingUp,
  Award,
} from "lucide-react";
import { useTranslation } from '../i18n/LanguageContext';

const stepIcons = [UtensilsCrossed, Shuffle, Dumbbell, TrendingUp, Award];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    scale: 0.95,
  }),
};

export default function OnboardingTour({ onClose }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const tourSteps = t('tour.steps') || [];
  const isLastStep = currentStep === tourSteps.length - 1;
  const step = tourSteps[currentStep];

  if (!step) return null;

  const IconComponent = stepIcons[currentStep] || Award;

  const handleNext = () => {
    if (isLastStep) {
      onClose?.();
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onClose?.();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex w-full max-w-sm flex-col items-center px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-8"
          >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-500">
                <IconComponent className="h-10 w-10 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center font-outfit text-xl font-bold text-white">
              {step.title}
            </h2>

            {/* Description */}
            <p className="mb-8 text-center font-inter text-sm text-slate-400">
              {step.desc}
            </p>

            {/* Step indicator dots */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-6 bg-orange-500"
                      : "w-2 bg-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Next / Başla button */}
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 py-3 font-outfit text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
            >
              {isLastStep ? t('tour.start') : t('tour.next')}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Skip link */}
        {!isLastStep && (
          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 cursor-pointer font-inter text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            {t('tour.skip')}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
