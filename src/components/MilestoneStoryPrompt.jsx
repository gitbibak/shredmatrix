import { useEffect, useState } from 'react';
import { MessageSquareText, Star, X } from 'lucide-react';
import { hasSubmittedTestimonial } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import { accountAge, canAsk, recordAsk, recordRating } from '../lib/engagementAsks';
import UserStoryForm from './UserStoryForm';

// One-tap star rating on the Today tab for members who come back on a later
// day. Workouts are not required: most members open the app without logging
// one, and the workout-milestone prompt alone reached almost nobody.
// 4-5 stars open the public review form, 1-3 open private "what should we
// improve?" feedback. Shares the monthly limit with the workout rating moment.
const COPY = {
  tr: { title: 'Full Balance\'ı nasıl buluyorsun?', desc: 'Tek dokunuş yeter; dürüst puanın bize yol gösteriyor.', later: 'Şimdi değil', never: 'Tekrar sorma', close: 'Kapat' },
  en: { title: 'How do you like Full Balance?', desc: 'One tap is enough; your honest score guides what we build.', later: 'Not now', never: 'Do not ask again', close: 'Close' },
  es: { title: '¿Qué te parece Full Balance?', desc: 'Basta un toque; tu puntuación sincera guía lo que construimos.', later: 'Ahora no', never: 'No volver a preguntar', close: 'Cerrar' },
};
const MONTH = 30 * 86400000;

export default function MilestoneStoryPrompt({ lang = 'en', userId }) {
  const c = COPY[lang] || COPY.en;
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const key = 'fb_review_prompt:' + userId;

  useEffect(() => {
    let active = true;
    if (!userId) return undefined;
    let preference;
    try { preference = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* Storage is optional. */ }
    if (preference?.never || preference?.submitted || Date.now() - (preference?.dismissedAt || 0) < MONTH) return undefined;
    const age = accountAge({ userId });
    if (age === null || age < 1) return undefined;
    hasSubmittedTestimonial().then((submitted) => {
      if (!active || submitted || !canAsk('review', { userId })) return;
      recordAsk('review', { userId });
      setVisible(true);
      trackEvent('review_prompt_view', { surface: 'today' });
    }).catch(() => {});
    return () => { active = false; };
  }, [key, userId]);

  const remember = (preference) => {
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch { /* Still dismiss in this session. */ }
  };
  const dismiss = (never = false) => {
    remember({ dismissedAt: Date.now(), never });
    setVisible(false);
  };
  const rate = (value) => {
    setRating(value);
    recordRating(value, { userId });
    trackEvent('review_prompt_rated', { surface: 'today', rating: value });
  };

  if (!visible) return null;
  return (
    <section aria-label={c.title} className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4 sm:p-5">
      {rating === 0 ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <MessageSquareText size={19} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="font-outfit text-sm font-bold text-white">{c.title}</h2>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">{c.desc}</p>
              </div>
            </div>
            <button type="button" onClick={() => dismiss()} aria-label={c.close} className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center text-slate-500 hover:text-slate-300"><X size={18} /></button>
          </div>
          <div className="mt-2 flex items-center gap-1" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => rate(value)} aria-label={`${value}/5`} className="grid h-12 w-12 place-items-center">
                <Star size={30} className="text-slate-500 transition-colors hover:fill-amber-400 hover:text-amber-400" />
              </button>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            <button type="button" onClick={() => dismiss()} className="min-h-11 px-2 text-xs text-slate-300">{c.later}</button>
            <button type="button" onClick={() => dismiss(true)} className="min-h-11 px-2 text-xs text-slate-500">{c.never}</button>
          </div>
        </>
      ) : (
        <UserStoryForm
          lang={lang}
          embedded
          mode={rating >= 4 ? 'review' : 'improve'}
          initialRating={rating}
          onSubmitted={() => remember({ submitted: true })}
        />
      )}
    </section>
  );
}
