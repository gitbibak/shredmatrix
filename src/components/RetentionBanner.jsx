import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Flame, Zap, PartyPopper, TrendingUp, Trophy } from 'lucide-react';

// ── Localised retention messages ────────────────────────────
const MESSAGES = {
  tr: {
    0: {
      emoji: '🚀',
      icon: Rocket,
      title: 'Full Balance\'a Hoş Geldin!',
      subtitle: 'Hedefine ulaşmak için her şey hazır. Beslenme planını incele ve ilk adımını at!',
      cta: { label: 'Beslenme Planını Gör', tab: 'nutrition' },
    },
    1: {
      emoji: '🔥',
      icon: Flame,
      title: 'Gün 2! Devam et!',
      subtitle: 'Tutarlılık başarının anahtarı. İlk antrenmanını kaydetmeye ne dersin?',
      cta: { label: 'Antrenmanı Başlat', tab: 'workout' },
    },
    3: {
      emoji: '⚡',
      icon: Zap,
      title: '3 gün oldu! Artık bir alışkanlık oluşuyor',
      subtitle: 'Harika gidiyorsun! İlerleme sekmesinden durumunu kontrol et.',
      cta: { label: 'İlerlemeyi Kontrol Et', tab: 'progress' },
    },
    7: {
      emoji: '🎉',
      icon: PartyPopper,
      title: '1 hafta tamamlandı!',
      subtitle: 'Müthiş! İlk haftayı geride bıraktın. Başarını arkadaşlarınla paylaş!',
      cta: { label: 'Başarıları Gör', tab: 'achievements' },
    },
    14: {
      emoji: '📈',
      icon: TrendingUp,
      title: '2 hafta! Gelişimini görmek ister misin?',
      subtitle: 'İki haftadır düzenli devam ediyorsun. İlerleme grafiklerine göz at!',
      cta: { label: 'İlerlemeye Bak', tab: 'progress' },
    },
    30: {
      emoji: '🏆',
      icon: Trophy,
      title: '1 ay! Sen bir efsanesin',
      subtitle: '30 gün boyunca kararlılığını korudun. Bu inanılmaz bir başarı!',
      cta: { label: 'Başarı Rozetlerini Gör', tab: 'achievements' },
    },
  },
  en: {
    0: {
      emoji: '🚀',
      icon: Rocket,
      title: 'Welcome to Full Balance!',
      subtitle: 'Everything is set to reach your goal. Check your nutrition plan and take your first step!',
      cta: { label: 'View Nutrition Plan', tab: 'nutrition' },
    },
    1: {
      emoji: '🔥',
      icon: Flame,
      title: 'Day 2! Keep going!',
      subtitle: 'Consistency is the key to success. How about logging your first workout?',
      cta: { label: 'Start Workout', tab: 'workout' },
    },
    3: {
      emoji: '⚡',
      icon: Zap,
      title: '3 days in! A habit is forming',
      subtitle: 'You\'re doing great! Check your progress in the progress tab.',
      cta: { label: 'Check Progress', tab: 'progress' },
    },
    7: {
      emoji: '🎉',
      icon: PartyPopper,
      title: '1 week completed!',
      subtitle: 'Amazing! You\'ve crushed your first week. Share your achievement with friends!',
      cta: { label: 'View Achievements', tab: 'achievements' },
    },
    14: {
      emoji: '📈',
      icon: TrendingUp,
      title: '2 weeks! Want to see your progress?',
      subtitle: 'You\'ve been consistent for two weeks. Check out your progress charts!',
      cta: { label: 'View Progress', tab: 'progress' },
    },
    30: {
      emoji: '🏆',
      icon: Trophy,
      title: '1 month! You\'re a legend',
      subtitle: 'You stayed committed for 30 days. That\'s an incredible achievement!',
      cta: { label: 'View Achievement Badges', tab: 'achievements' },
    },
  },
  es: {
    0: {
      emoji: '🚀',
      icon: Rocket,
      title: '¡Bienvenido a Full Balance!',
      subtitle: 'Todo está listo para alcanzar tu objetivo. ¡Revisa tu plan de nutrición y da el primer paso!',
      cta: { label: 'Ver Plan Nutricional', tab: 'nutrition' },
    },
    1: {
      emoji: '🔥',
      icon: Flame,
      title: '¡Día 2! ¡Sigue adelante!',
      subtitle: 'La constancia es la clave del éxito. ¿Qué tal registrar tu primer entrenamiento?',
      cta: { label: 'Iniciar Entrenamiento', tab: 'workout' },
    },
    3: {
      emoji: '⚡',
      icon: Zap,
      title: '¡3 días! Se está formando un hábito',
      subtitle: '¡Lo estás haciendo genial! Revisa tu progreso en la pestaña de progreso.',
      cta: { label: 'Ver Progreso', tab: 'progress' },
    },
    7: {
      emoji: '🎉',
      icon: PartyPopper,
      title: '¡1 semana completada!',
      subtitle: '¡Increíble! Has superado tu primera semana. ¡Comparte tu logro con amigos!',
      cta: { label: 'Ver Logros', tab: 'achievements' },
    },
    14: {
      emoji: '📈',
      icon: TrendingUp,
      title: '¡2 semanas! ¿Quieres ver tu progreso?',
      subtitle: 'Has sido constante durante dos semanas. ¡Revisa tus gráficos de progreso!',
      cta: { label: 'Ver Progreso', tab: 'progress' },
    },
    30: {
      emoji: '🏆',
      icon: Trophy,
      title: '¡1 mes! Eres una leyenda',
      subtitle: 'Te mantuviste comprometido durante 30 días. ¡Es un logro increíble!',
      cta: { label: 'Ver Insignias de Logros', tab: 'achievements' },
    },
  },
};

// Which exact days trigger a banner
const RETENTION_DAYS = [0, 1, 3, 7, 14, 30];

function getLang() {
  try {
    const saved = localStorage.getItem('shredmatrix_lang');
    if (saved && ['tr', 'en', 'es'].includes(saved)) return saved;
  } catch (err) { console.warn('[RetentionBanner]', err?.message || err); }
  return 'tr';
}

function getDaysSinceJoin() {
  try {
    const d = localStorage.getItem('shredmatrix_first_login');
    return d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;
  } catch (err) { console.warn('[RetentionBanner]', err?.message || err);
    return 0;
  }
}

function getDismissedKey(day) {
  return `fb_retention_dismissed_d${day}`;
}

// ═══════════════════════════════════════════════════════════
export default function RetentionBanner({ onNavigate }) {
  const daysSinceJoin = useMemo(getDaysSinceJoin, []);
  const lang = useMemo(getLang, []);

  // Find the matching retention day (exact match only)
  const matchingDay = RETENTION_DAYS.find((d) => d === daysSinceJoin);

  const [dismissed, setDismissed] = useState(() => {
    if (matchingDay === undefined) return true;
    try {
      return localStorage.getItem(getDismissedKey(matchingDay)) === '1';
    } catch (err) { console.warn('[RetentionBanner]', err?.message || err);
      return false;
    }
  });

  // No banner to show
  if (matchingDay === undefined || dismissed) return null;

  const msg = MESSAGES[lang]?.[matchingDay] || MESSAGES.tr[matchingDay];
  if (!msg) return null;

  const Icon = msg.icon;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(getDismissedKey(matchingDay), '1');
    } catch (err) { console.warn('[RetentionBanner]', err?.message || err); }
  };

  const handleCta = () => {
    if (msg.cta?.tab && onNavigate) {
      onNavigate(msg.cta.tab);
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4 mb-4 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer z-10"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
              <Icon size={18} className="text-orange-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg leading-none">{msg.emoji}</span>
                <h3 className="text-sm font-bold font-outfit text-white leading-snug">
                  {msg.title}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-outfit leading-relaxed mb-3">
                {msg.subtitle}
              </p>

              {/* CTA Button */}
              {msg.cta && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCta}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold font-outfit hover:border-orange-500/50 transition-colors cursor-pointer"
                >
                  <Icon size={12} />
                  {msg.cta.label}
                </motion.button>
              )}
            </div>
          </div>

          {/* Day 30 achievement badge decoration */}
          {matchingDay === 30 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -bottom-2 -right-2 text-4xl opacity-20 pointer-events-none select-none"
            >
              🏆
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
