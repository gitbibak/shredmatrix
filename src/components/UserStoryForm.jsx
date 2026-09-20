import { useState } from 'react';
import { CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { submitTestimonial } from '../lib/dataService';

const COPY = {
  tr: { title: 'Deneyimini paylaş', desc: 'Kısa geri bildirimin ürünü geliştirmemize yardımcı olur.', result: 'Sonucun (isteğe bağlı)', story: 'Full Balance deneyimin', consent: 'Bu yorumu anonim olarak ana sayfada yayınlamamıza izin veriyorum.', send: 'Gönder', sent: 'Teşekkürler. Yorumun incelendikten sonra yayınlanabilir.', error: 'Gönderilemedi. En az 30 karakter yazıp paylaşım iznini onayla.' },
  en: { title: 'Share your experience', desc: 'A short review helps us improve Full Balance.', result: 'Your result (optional)', story: 'Your Full Balance experience', consent: 'I allow this review to be published anonymously on the website.', send: 'Send', sent: 'Thank you. Your review may be published after moderation.', error: 'Could not send. Write at least 30 characters and confirm permission.' },
  es: { title: 'Comparte tu experiencia', desc: 'Una opinión breve nos ayuda a mejorar Full Balance.', result: 'Tu resultado (opcional)', story: 'Tu experiencia con Full Balance', consent: 'Permito que esta reseña se publique de forma anónima.', send: 'Enviar', sent: 'Gracias. Tu reseña podrá publicarse después de revisarla.', error: 'No se pudo enviar. Escribe al menos 30 caracteres y confirma el permiso.' },
};

export default function UserStoryForm({ lang = 'en', onSubmitted, embedded = false }) {
  const c = COPY[lang] || COPY.en;
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'sending' || !rating || body.trim().length < 30 || !consent) return;
    setState('sending');
    try {
      await submitTestimonial({ rating, body, resultSummary: result, language: lang, consentPublic: consent });
      setState('sent');
      onSubmitted?.();
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
      <p className="text-xs leading-5 text-slate-300">{c.sent}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className={embedded ? '' : 'rounded-xl border border-slate-800 bg-slate-900 p-4'}>
      <div className="flex gap-3">
        <MessageSquare size={17} className="mt-0.5 text-cyan-400" />
        <div><h3 className="text-base font-bold text-white">{c.title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{c.desc}</p></div>
      </div>
      <div className="mt-4 flex gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-pressed={value === rating} aria-label={`${value}/5`} className="grid h-11 w-11 place-items-center"><Star size={24} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-500'} /></button>)}
      </div>
      <input aria-label={c.result} value={result} onChange={(event) => setResult(event.target.value)} maxLength={180} placeholder={c.result} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-white outline-none focus:border-cyan-500" />
      <textarea aria-label={c.story} value={body} onChange={(event) => setBody(event.target.value)} minLength={30} maxLength={600} required rows={3} placeholder={c.story} className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base leading-6 text-white outline-none focus:border-cyan-500" />
      <p className="mt-1 text-xs text-slate-400">{body.trim().length}/600 · {({ tr: 'En az 30 karakter', en: 'At least 30 characters', es: 'Al menos 30 caracteres' })[lang] || 'At least 30 characters'}</p>
      <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5 h-5 w-5 shrink-0" />{c.consent}</label>
      {state === 'error' && <p role="alert" className="mt-2 text-xs text-red-400">{({ tr: 'Gönderilemedi. Yorumun bu ekranda duruyor; tekrar deneyebilirsin.', en: 'Could not send. Your draft is still here; please try again.', es: 'No se pudo enviar. Tu borrador sigue aquí; vuelve a intentarlo.' })[lang]}</p>}
      <button type="submit" disabled={state === 'sending' || !rating || !consent || body.trim().length < 30} className="mt-3 min-h-11 w-full rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white disabled:opacity-50">{c.send}</button>
    </form>
  );
}
