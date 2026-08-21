import { useState } from 'react';
import { CheckCircle2, MessageSquare, Star } from 'lucide-react';
import { submitTestimonial } from '../lib/dataService';

const COPY = {
  tr: { title: 'Deneyimini paylaş', desc: 'Kısa geri bildirimin ürünü geliştirmemize yardımcı olur.', result: 'Sonucun (isteğe bağlı)', story: 'Full Balance deneyimin', consent: 'Bu yorumu anonim olarak ana sayfada yayınlamamıza izin veriyorum.', send: 'Gönder', sent: 'Teşekkürler. Yorumun incelendikten sonra yayınlanabilir.', error: 'Gönderilemedi. En az 30 karakter yazıp paylaşım iznini onayla.' },
  en: { title: 'Share your experience', desc: 'A short review helps us improve Full Balance.', result: 'Your result (optional)', story: 'Your Full Balance experience', consent: 'I allow this review to be published anonymously on the website.', send: 'Send', sent: 'Thank you. Your review may be published after moderation.', error: 'Could not send. Write at least 30 characters and confirm permission.' },
  es: { title: 'Comparte tu experiencia', desc: 'Una opinión breve nos ayuda a mejorar Full Balance.', result: 'Tu resultado (opcional)', story: 'Tu experiencia con Full Balance', consent: 'Permito que esta reseña se publique de forma anónima.', send: 'Enviar', sent: 'Gracias. Tu reseña podrá publicarse después de revisarla.', error: 'No se pudo enviar. Escribe al menos 30 caracteres y confirma el permiso.' },
};

export default function UserStoryForm({ lang = 'en' }) {
  const c = COPY[lang] || COPY.en;
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState('idle');

  const submit = async (event) => {
    event.preventDefault();
    setState('sending');
    try {
      await submitTestimonial({ rating, body, resultSummary: result, language: lang, consentPublic: consent });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
      <p className="text-xs leading-5 text-slate-300">{c.sent}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex gap-3">
        <MessageSquare size={17} className="mt-0.5 text-cyan-400" />
        <div><h3 className="text-sm font-bold text-white">{c.title}</h3><p className="mt-1 text-[10px] text-slate-500">{c.desc}</p></div>
      </div>
      <div className="mt-4 flex gap-1" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value}/5`} className="p-1"><Star size={20} className={value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} /></button>)}
      </div>
      <input value={result} onChange={(event) => setResult(event.target.value)} maxLength={180} placeholder={c.result} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500" />
      <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={30} maxLength={600} required rows={3} placeholder={c.story} className="mt-2 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-5 text-white outline-none focus:border-cyan-500" />
      <label className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-slate-400"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required className="mt-0.5" />{c.consent}</label>
      {state === 'error' && <p className="mt-2 text-[10px] text-red-400">{c.error}</p>}
      <button type="submit" disabled={state === 'sending'} className="mt-3 min-h-10 w-full rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white disabled:opacity-50">{c.send}</button>
    </form>
  );
}
