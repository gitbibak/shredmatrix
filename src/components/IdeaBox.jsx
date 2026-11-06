import { useState } from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { submitSupportTicket } from '../lib/supportService';
import { trackEvent } from '../lib/analytics';

// One-line idea box. Ideas land in support_tickets with category 'idea', so
// they show up in Admin → Destek and in the daily support agent's report.
export const ideaCopy = {
  tr: { title: 'Fikrin var mı? 💡', desc: 'Eksik bulduğun bir şey, istediğin bir özellik… Tek cümle yeter, hepsini okuyorum.', placeholder: 'Örn. Antrenmana müzik eklensin', send: 'Gönder', sent: 'Teşekkürler! Fikrin bana ulaştı.', error: 'Gönderilemedi, tekrar dener misin?', subject: 'Fikir' },
  en: { title: 'Got an idea? 💡', desc: 'Something missing, a feature you want… One sentence is enough, I read every one.', placeholder: 'E.g. Add music to workouts', send: 'Send', sent: 'Thanks! Your idea reached me.', error: 'Could not send, please try again.', subject: 'Idea' },
  es: { title: '¿Tienes una idea? 💡', desc: 'Algo que falta, una función que quieres… Basta una frase, las leo todas.', placeholder: 'Ej. Añadir música a los entrenos', send: 'Enviar', sent: '¡Gracias! Tu idea me llegó.', error: 'No se pudo enviar, inténtalo de nuevo.', subject: 'Idea' },
};

export default function IdeaBox({ lang = 'tr', placement = 'profile', compact = false, onSent }) {
  const c = ideaCopy[lang] || ideaCopy.en;
  const [text, setText] = useState('');
  const [state, setState] = useState('idle');
  const ready = text.trim().length >= 5;

  const send = async (event) => {
    event.preventDefault();
    if (!ready || state === 'sending') return;
    setState('sending');
    try {
      const message = text.trim();
      await submitSupportTicket({ category: 'idea', subject: `${c.subject}: ${message.slice(0, 80)}`, message });
      trackEvent('idea_submitted', { placement, language: lang });
      setState('sent');
      onSent?.();
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3 text-sm font-semibold text-emerald-200">
        <CheckCircle2 size={16} aria-hidden="true" /> {c.sent}
      </p>
    );
  }

  return (
    <form onSubmit={send} className={compact ? '' : 'rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5'}>
      {!compact && (
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="font-outfit text-sm font-bold text-white">{c.title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">{c.desc}</p>
          </div>
        </div>
      )}
      <div className={`${compact ? '' : 'mt-3'} flex gap-2`}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={500}
          aria-label={c.title}
          placeholder={c.placeholder}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 text-base text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60"
        />
        <button type="submit" disabled={!ready || state === 'sending'} className="min-h-11 shrink-0 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 disabled:opacity-40">
          {state === 'sending' ? '…' : c.send}
        </button>
      </div>
      {state === 'error' && <p role="alert" className="mt-2 text-xs text-amber-300">{c.error}</p>}
    </form>
  );
}
