import { useEffect, useRef, useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { getWorkoutLogs, getWellbeingCheckins, hasSubmittedTestimonial } from '../lib/dataService';
import UserStoryForm from './UserStoryForm';

const COPY = {
  tr: { title: 'Full Balance deneyimin nasıl?', desc: 'İşine yarayanları ve geliştirmemiz gerekenleri paylaşır mısın?', action: 'Kısa yorum yaz', later: 'Şimdi değil', never: 'Tekrar sorma', close: 'Kapat' },
  en: { title: 'How is Full Balance working for you?', desc: 'What helps you, and what could we improve?', action: 'Write a short review', later: 'Not now', never: 'Do not ask again', close: 'Close' },
  es: { title: '¿Cómo te va con Full Balance?', desc: '¿Qué te ayuda y qué podemos mejorar?', action: 'Escribir una reseña', later: 'Ahora no', never: 'No volver a preguntar', close: 'Cerrar' },
};
const MONTH = 30 * 86400000;

export default function MilestoneStoryPrompt({ lang = 'en', userId }) {
  const c = COPY[lang] || COPY.en;
  const [visible, setVisible] = useState(false);
  const dialog = useRef(null);
  const submitted = useRef(false);
  const key = 'fb_review_prompt:' + userId;
  useEffect(() => {
    let active = true;
    if (!userId) return;
    const load = async () => {
      let preference;
      try { preference = JSON.parse(localStorage.getItem(key) || 'null'); } catch { /* Storage is optional. */ }
      if (preference?.never || preference?.submitted || Date.now() - (preference?.dismissedAt || 0) < MONTH) return;
      const [logs, checkins, submitted] = await Promise.all([getWorkoutLogs(30), getWellbeingCheckins(30), hasSubmittedTestimonial()]);
      const days = new Set(checkins.map((entry) => entry.date).filter(Boolean));
      if (active && !submitted && (logs.length >= 3 || days.size >= 3)) setVisible(true);
    };
    load().catch(() => {});
    return () => { active = false; };
  }, [key, userId]);
  const remember = (preference) => {
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch { /* Still dismiss in this session. */ }
  };
  const dismiss = (never = false) => {
    remember({ dismissedAt: Date.now(), never });
    setVisible(false);
  };
  if (!visible) return null;
  return <section className="my-4 border-y border-emerald-500/20 py-4">
    <div className="flex items-start gap-3">
      <MessageSquareText size={20} className="mt-1 shrink-0 text-emerald-300" />
      <div className="min-w-0 flex-1">
        <h2 className="font-outfit text-sm font-bold text-white">{c.title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">{c.desc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => dialog.current?.showModal()} className="min-h-11 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white">{c.action}</button>
          <button type="button" onClick={() => dismiss()} className="min-h-11 px-3 text-xs text-slate-300">{c.later}</button>
          <button type="button" onClick={() => dismiss(true)} className="min-h-11 px-3 text-xs text-slate-400">{c.never}</button>
        </div>
      </div>
    </div>
    <dialog ref={dialog} aria-label={c.title} onClose={() => { if (submitted.current) setVisible(false); else dismiss(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-4 text-white backdrop:bg-black/70">
      <div className="mb-2 flex justify-end"><button type="button" aria-label={c.close} onClick={() => dialog.current?.close()} className="grid h-11 w-11 place-items-center rounded-lg border border-slate-700"><X size={20} /></button></div>
      <UserStoryForm lang={lang} embedded onSubmitted={() => { submitted.current = true; remember({ submitted: true }); }} />
    </dialog>
  </section>;
}
