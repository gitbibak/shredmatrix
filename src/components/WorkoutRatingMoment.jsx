import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getUserId, hasSubmittedTestimonial } from '../lib/dataService';
import { trackEvent } from '../lib/analytics';
import UserStoryForm from './UserStoryForm';

// Two-step rating at the emotional peak right after a logged workout.
// Milestone workouts only, never more than once a month, never after a review.
// 4-5 stars → public review invitation; 1-3 stars → private "what should we
// improve?" so honest criticism reaches the team instead of being lost.
export const RATING_MILESTONES = [3, 10, 25, 50, 100];
const MONTH = 30 * 86400000;

const COPY = {
  tr: { title: 'Full Balance bugün kaç yıldız?', desc: 'Tek dokunuş yeter; dürüst puan bizim için en değerlisi.', skip: 'Geç' },
  en: { title: 'How many stars for Full Balance today?', desc: 'One tap is enough; an honest score is what helps us most.', skip: 'Skip' },
  es: { title: '¿Cuántas estrellas para Full Balance hoy?', desc: 'Un toque basta; una puntuación sincera es lo que más nos ayuda.', skip: 'Omitir' },
};

export function storageKey(userId) { return 'fb_review_prompt:' + userId; }

export function shouldAskForRating(workoutCount, preference) {
  if (!RATING_MILESTONES.includes(Number(workoutCount))) return false;
  if (preference?.never || preference?.submitted) return false;
  if (Date.now() - (preference?.dismissedAt || 0) < MONTH) return false;
  return true;
}

export default function WorkoutRatingMoment({ lang = 'en', workoutCount = 0 }) {
  const c = COPY[lang] || COPY.en;
  const userId = getUserId();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const key = storageKey(userId);

  useEffect(() => {
    let active = true;
    if (!userId) return undefined;
    let preference = null;
    try { preference = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* Storage is optional. */ }
    if (!shouldAskForRating(workoutCount, preference)) return undefined;
    hasSubmittedTestimonial().then((submitted) => {
      if (!active || submitted) return;
      setVisible(true);
      trackEvent('review_prompt_view', { surface: 'workout', milestone: workoutCount });
    }).catch(() => {});
    return () => { active = false; };
  }, [key, userId, workoutCount]);

  const remember = (preference) => {
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch { /* Still dismiss in this session. */ }
  };
  const skip = () => { remember({ dismissedAt: Date.now() }); setVisible(false); };
  const rate = (value) => {
    setRating(value);
    trackEvent('review_prompt_rated', { surface: 'workout', rating: value });
  };

  if (!visible) return null;
  return (
    <section className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4" aria-label={c.title}>
      {rating === 0 ? (
        <>
          <h3 className="font-outfit text-sm font-bold text-white">{c.title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">{c.desc}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => rate(value)} aria-label={`${value}/5`} className="grid h-11 w-11 place-items-center">
                  <Star size={26} className="text-slate-500 transition-colors hover:text-amber-400" />
                </button>
              ))}
            </div>
            <button type="button" onClick={skip} className="min-h-11 px-3 text-xs text-slate-400">{c.skip}</button>
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
