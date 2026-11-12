import { useEffect, useState } from 'react';
import { CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { getProfile, getUserId, submitTestimonial } from '../lib/dataService';
import { canAsk, recordAsk, recordRating } from '../lib/engagementAsks';
import SupportCard from './SupportCard';
import { supportText } from '../data/support';

const COPY = {
  tr: {
    title: 'Deneyimini paylaş', desc: 'Yorumun, Full Balance\'ı deneyip denememeye karar veren insanlara yol gösterir. Adınla yayınlanabilir.',
    improveTitle: 'Neyi geliştirelim?', improveDesc: 'Seni zorlayan veya eksik bulduğun şeyi yaz; bu mesaj yalnızca ekibe gider, yayınlanmaz.',
    result: 'Sonucun (isteğe bağlı)', story: 'Full Balance deneyimin', improveStory: 'Neyi değiştirmeliyiz?',
    consent: 'Bu yorumu sitede yayınlamamıza izin veriyorum.', consentHint: 'İşaretlemezsen yorumun yalnızca ekibe gizli geri bildirim olarak ulaşır.',
    showName: 'Adımla göster', showNameHint: 'İsimli yorumlar daha güvenilir görünür. Kapatırsan anonim yayınlanır.', namePlaceholder: 'Örn. Ayşe K.',
    send: 'Gönder', sent: 'Teşekkürler. Yorumun incelendikten sonra yayınlanabilir.', sentPrivate: 'Teşekkürler. Geri bildirimin ekibe ulaştı; yayınlanmayacak.',
    min: 'En az 30 karakter', error: 'Gönderilemedi. Yorumun bu ekranda duruyor; tekrar deneyebilirsin.',
  },
  en: {
    title: 'Share your experience', desc: 'Your review helps people decide whether to try Full Balance. It can be published with your name.',
    improveTitle: 'What should we improve?', improveDesc: 'Tell us what felt hard or missing. This goes only to the team and is never published.',
    result: 'Your result (optional)', story: 'Your Full Balance experience', improveStory: 'What should we change?',
    consent: 'I allow this review to be published on the website.', consentHint: 'Leave it unchecked and your words reach the team as private feedback only.',
    showName: 'Show my name', showNameHint: 'Reviews with a name feel more trustworthy. Turn it off to stay anonymous.', namePlaceholder: 'E.g. Sarah K.',
    send: 'Send', sent: 'Thank you. Your review may be published after moderation.', sentPrivate: 'Thank you. Your feedback reached the team and will not be published.',
    min: 'At least 30 characters', error: 'Could not send. Your draft is still here; please try again.',
  },
  es: {
    title: 'Comparte tu experiencia', desc: 'Tu reseña ayuda a otras personas a decidir si probar Full Balance. Puede publicarse con tu nombre.',
    improveTitle: '¿Qué deberíamos mejorar?', improveDesc: 'Cuéntanos qué te resultó difícil o qué falta. Solo lo verá el equipo; nunca se publica.',
    result: 'Tu resultado (opcional)', story: 'Tu experiencia con Full Balance', improveStory: '¿Qué deberíamos cambiar?',
    consent: 'Permito que esta reseña se publique en la web.', consentHint: 'Si no lo marcas, tu mensaje llega al equipo solo como comentario privado.',
    showName: 'Mostrar mi nombre', showNameHint: 'Las reseñas con nombre generan más confianza. Desactívalo para publicarla de forma anónima.', namePlaceholder: 'Ej. Laura G.',
    send: 'Enviar', sent: 'Gracias. Tu reseña podrá publicarse después de revisarla.', sentPrivate: 'Gracias. Tu comentario llegó al equipo y no se publicará.',
    min: 'Al menos 30 caracteres', error: 'No se pudo enviar. Tu borrador sigue aquí; vuelve a intentarlo.',
  },
};

// "Ayşe Kaya Demir" -> "Ayşe D.": first name and last initial, never the full name.
export function shortName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length || /^user$/i.test(parts[0]) || parts[0].includes('@')) return '';
  const first = parts[0].slice(0, 24);
  const last = parts.length > 1 ? ` ${parts[parts.length - 1][0].toLocaleUpperCase()}.` : '';
  return first + last;
}

/**
 * mode 'review': public review with optional publication consent.
 * mode 'improve': private improvement feedback; consent is never shown.
 */
export default function UserStoryForm({ lang = 'en', onSubmitted, embedded = false, mode = 'review', initialRating = 0 }) {
  const c = COPY[lang] || COPY.en;
  const improve = mode === 'improve';
  const [rating, setRating] = useState(initialRating);
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const [consent, setConsent] = useState(false);
  const [showName, setShowName] = useState(true);
  const [name, setName] = useState('');
  const [state, setState] = useState('idle');
  const [askSupport, setAskSupport] = useState(false);
  const consentPublic = improve ? false : consent;
  const displayName = consentPublic && showName ? name.trim() : '';

  useEffect(() => {
    if (improve) return undefined;
    let active = true;
    getProfile().then((profile) => { if (active) setName((old) => old || shortName(profile?.name)); }).catch(() => {});
    return () => { active = false; };
  }, [improve]);

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'sending' || !rating || body.trim().length < 30) return;
    setState('sending');
    try {
      await submitTestimonial({ rating, body, resultSummary: improve ? '' : result, language: lang, consentPublic, displayName });
      const userId = getUserId();
      recordRating(rating, { userId });
      // Thank a happy reviewer with one gentle support line; never after criticism.
      if (!improve && rating >= 4 && canAsk('support', { userId, ignoreAccountAge: true })) {
        recordAsk('support', { userId });
        setAskSupport(true);
      }
      setState('sent');
      onSubmitted?.({ rating, consentPublic });
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') return (
    <div>
      <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
        <p className="text-xs leading-5 text-slate-300">{consentPublic ? c.sent : c.sentPrivate}</p>
      </div>
      {askSupport && <div className="mt-3"><SupportCard lang={lang} placement="after_review" variant="inline" message={supportText(lang).afterReview} /></div>}
    </div>
  );

  return (
    <form onSubmit={submit} className={embedded ? '' : 'rounded-xl border border-slate-800 bg-slate-900 p-4'}>
      <div className="flex gap-3">
        <MessageSquare size={17} className="mt-0.5 text-cyan-400" />
        <div><h3 className="text-base font-bold text-white">{improve ? c.improveTitle : c.title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{improve ? c.improveDesc : c.desc}</p></div>
      </div>
      <div className="mt-4 flex gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-pressed={value === rating} aria-label={`${value}/5`} className="grid h-11 w-11 place-items-center"><Star size={24} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} /></button>)}
      </div>
      {!improve && <input aria-label={c.result} value={result} onChange={(event) => setResult(event.target.value)} maxLength={180} placeholder={c.result} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white outline-none focus:border-cyan-500" />}
      <textarea aria-label={improve ? c.improveStory : c.story} value={body} onChange={(event) => setBody(event.target.value)} minLength={30} maxLength={600} required rows={3} placeholder={improve ? c.improveStory : c.story} className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base leading-6 text-white outline-none focus:border-cyan-500" />
      <p className="mt-1 text-xs text-slate-400">{body.trim().length}/600 · {c.min}</p>
      {!improve && (
        <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{c.consent} <span className="text-slate-500">{c.consentHint}</span></span>
        </label>
      )}
      {!improve && consent && (
        <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <label className="flex items-start gap-2 text-xs leading-5 text-slate-300">
            <input type="checkbox" checked={showName} onChange={(event) => setShowName(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{c.showName} <span className="text-slate-500">{c.showNameHint}</span></span>
          </label>
          {showName && <input aria-label={c.showName} value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder={c.namePlaceholder} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white outline-none focus:border-cyan-500" />}
        </div>
      )}
      {state === 'error' && <p role="alert" className="mt-2 text-xs text-red-400">{c.error}</p>}
      <button type="submit" disabled={state === 'sending' || !rating || body.trim().length < 30} className="mt-3 min-h-11 w-full rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white disabled:opacity-50">{c.send}</button>
    </form>
  );
}
