import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, X, Check, Camera } from "lucide-react";
import { useTranslation } from '../i18n/LanguageContext';

export default function ShareCard({ plan, onClose }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showScreenshotHint, setShowScreenshotHint] = useState(false);

  if (!plan) return null;

  const {
    userName = t('profile.user'),
    goal = t('common.fatGoal'),
    dailyCalories = 0,
    macros = {},
    bmi = 0,
    userWeight = 0,
  } = plan;

  const protein = macros?.protein ?? 0;
  const carbs = macros?.carbs ?? 0;
  const fat = macros?.fat ?? 0;

  const statsGrid = [
    { label: t('share.calories'), value: `${Math.round(dailyCalories)}`, unit: "kcal" },
    { label: t('nutrition.protein'), value: `${Math.round(protein)}`, unit: "g" },
    { label: t('nutrition.carbs'), value: `${Math.round(carbs)}`, unit: "g" },
    { label: t('nutrition.fat'), value: `${Math.round(fat)}`, unit: "g" },
  ];

  const handleCopy = async () => {
    const textSummary = [
      `🔥 SHREDMATRIX — ${userName}`,
      `🎯 ${t('share.goal')}: ${goal}`,
      `⚡ ${t('share.dailyCalories')}: ${Math.round(dailyCalories)} kcal`,
      `🥩 ${t('nutrition.protein')}: ${Math.round(protein)}g`,
      `🍞 ${t('share.carbs')}: ${Math.round(carbs)}g`,
      `🧈 ${t('nutrition.fat')}: ${Math.round(fat)}g`,
      `📊 BMI: ${Number(bmi).toFixed(1)}`,
      `⚖️ ${t('share.weight')}: ${Number(userWeight).toFixed(1)} kg`,
      ``,
      `💪 ${t('share.tagline')}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silently fail
    }
  };

  const handleSave = () => {
    setShowScreenshotHint(true);
    setTimeout(() => setShowScreenshotHint(false), 3000);
  };

  const getBmiColor = (val) => {
    const v = Number(val);
    if (v < 18.5) return "text-blue-400";
    if (v < 25) return "text-emerald-400";
    if (v < 30) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-xs"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            className="absolute -top-3 -right-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X size={16} />
          </motion.button>

          {/* Card Preview */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-orange-500 via-orange-500/30 to-blue-500">
            <div className="rounded-2xl bg-slate-900 p-6 overflow-hidden relative">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-5">
                {/* Logo */}
                <div className="text-center">
                  <h2 className="font-outfit text-2xl font-bold gradient-text tracking-tight">
                    SHREDMATRIX
                  </h2>
                  <div className="mt-1 h-[1px] w-16 mx-auto bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                </div>

                {/* User + Goal */}
                <div className="text-center space-y-2">
                  <p className="font-outfit text-lg font-semibold text-white truncate">
                    {userName}
                  </p>
                  <span className="inline-block rounded-full bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 px-3 py-1 text-xs font-medium text-orange-400">
                    🎯 {goal}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {statsGrid.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-slate-800/70 border border-slate-700/50 p-3 text-center"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                        {stat.label}
                      </p>
                      <p className="font-outfit text-xl font-bold text-white mt-0.5">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-slate-500">{stat.unit}</p>
                    </div>
                  ))}
                </div>

                {/* BMI + Weight */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      BMI
                    </p>
                    <p
                      className={`font-outfit text-lg font-bold ${getBmiColor(bmi)}`}
                    >
                      {Number(bmi).toFixed(1)}
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                      {t('share.weight')}
                    </p>
                    <p className="font-outfit text-lg font-bold text-white">
                      {Number(userWeight).toFixed(1)}{" "}
                      <span className="text-xs text-slate-500 font-normal">
                        kg
                      </span>
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

                {/* Tagline */}
                <p className="text-center font-outfit text-sm font-medium text-slate-400 italic">
                  "{t('share.tagline')}"
                </p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <motion.button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span className="text-emerald-400">{t('share.copied')}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>{t('share.copy')}</span>
                </>
              )}
            </motion.button>

            <motion.button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
            >
              <Camera size={16} />
              <span>{t('share.save')}</span>
            </motion.button>
          </div>

          {/* Screenshot Hint */}
          <AnimatePresence>
            {showScreenshotHint && (
              <motion.p
                className="mt-3 text-center text-xs text-slate-500"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {t('share.saveHint')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
