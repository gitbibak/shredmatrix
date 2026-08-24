import { useEffect, useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { getWorkoutLogs, hasSubmittedTestimonial } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';

const COPY = {
  tr: { title: '3 antrenmanı tamamladın', desc: 'Deneyimini paylaşman Full Balance’ı geliştirmemize ve yeni kullanıcılara güven vermemize yardımcı olur.', action: 'Kısa yorum yaz', close: 'Şimdi değil' },
  en: { title: 'You completed 3 workouts', desc: 'Sharing your experience helps us improve Full Balance and gives new users trustworthy context.', action: 'Write a short review', close: 'Not now' },
  es: { title: 'Completaste 3 entrenamientos', desc: 'Compartir tu experiencia nos ayuda a mejorar Full Balance y da confianza a nuevos usuarios.', action: 'Escribir una reseña', close: 'Ahora no' },
};

const DISMISS_KEY = 'fb_story_prompt_dismissed';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function MilestoneStoryPrompt({ lang = 'en', onOpenProfile }) {
  const c = COPY[lang] || COPY.en;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (dismissedAt && Date.now() - dismissedAt < THIRTY_DAYS) return;
      const [logs, submitted] = await Promise.all([getWorkoutLogs(), hasSubmittedTestimonial()]);
      if (!active || submitted || logs.length < 3) return;
      setVisible(true);
      trackEvent('testimonial_prompt_view', { language: lang, workout_count: logs.length });
    };
    load().catch(() => {});
    return () => { active = false; };
  }, [lang]);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    trackEvent('testimonial_prompt_dismiss', { language: lang });
  };

  return (
    <section className="relative flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
        <MessageSquareText size={18} />
      </span>
      <div className="min-w-0 flex-1 pr-7">
        <h2 className="font-outfit text-sm font-bold text-white">{c.title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{c.desc}</p>
        <button
          type="button"
          onClick={() => { trackEvent('testimonial_prompt_open', { language: lang }); onOpenProfile?.(); }}
          className="mt-3 min-h-10 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white"
        >
          {c.action}
        </button>
      </div>
      <button type="button" onClick={dismiss} aria-label={c.close} className="absolute right-3 top-3 p-2 text-slate-500">
        <X size={16} />
      </button>
    </section>
  );
}
