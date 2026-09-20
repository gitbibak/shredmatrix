import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getApprovedTestimonials } from '../lib/dataService';

export default function ApprovedTestimonials({ language = 'en', all = false }) {
  return <ReviewList key={language + ':' + all} language={language} all={all} />;
}

function ReviewList({ language, all }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const errorCopy = { tr: 'Yorumlar yüklenemedi. Tekrar dene.', en: 'Could not load reviews. Retry.', es: 'No se pudieron cargar las reseñas. Reintentar.' };
  const batch = all ? 12 : 3;
  useEffect(() => {
    let active = true;
    getApprovedTestimonials(batch, language).then((rows) => { if (active) { setItems(rows); setOffset(rows.length); setHasMore(rows.length === batch); setFailed(false); setLoading(false); } }).catch(() => { if (active) { setFailed(true); setLoading(false); } });
    return () => { active = false; };
  }, [language, batch, attempt]);
  const more = async () => {
    setLoading(true);
    setFailed(false);
    try { const rows = await getApprovedTestimonials(batch, language, offset); setItems((old) => [...old, ...rows.filter((row) => !old.some((item) => item.id === row.id))]); setOffset((old) => old + rows.length); setHasMore(rows.length === batch); }
    catch { setFailed(true); }
    finally { setLoading(false); }
  };
  const visible = items.filter((item) => item.language === language && Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5);
  if (!visible.length && failed) return all ? <button type="button" onClick={() => { setLoading(true); setFailed(false); setAttempt((value) => value + 1); }} className="mx-5 my-8 min-h-11 text-sm text-cyan-300">{errorCopy[language]}</button> : null;
  if (!visible.length) return all ? <p role="status" className="px-5 py-12 text-slate-400">{loading ? '…' : ({ tr: 'Henüz yayınlanan yorum yok.', en: 'No published reviews yet.', es: 'Todavía no hay reseñas publicadas.' }[language])}</p> : null;
  const title = { tr: 'Full Balance kullananlardan', en: 'From people using Full Balance', es: 'De quienes usan Full Balance' };
  const label = { tr: 'Kullanıcı yorumu · anonim', en: 'User review · anonymous', es: 'Opinión de usuario · anónima' };
  return <section className="border-b border-slate-800 py-12">
    <div className="mx-auto max-w-6xl px-5 sm:px-6">
      <h2 className="mb-6 font-outfit text-2xl font-bold text-white">{title[language] || title.en}</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {visible.map((item) => <article key={item.id} className="min-w-0 rounded-lg border border-slate-800 bg-slate-900/55 p-5">
          <div className="flex gap-1 text-amber-400" aria-label={item.rating + '/5'}>{Array.from({ length: item.rating }, (_, i) => <Star key={i} size={14} fill="currentColor" aria-hidden="true" />)}</div>
          {item.result_summary && <p className="mt-3 break-words text-xs font-bold text-cyan-300">{item.result_summary}</p>}
          <blockquote className="mt-3 break-words text-sm leading-6 text-slate-300">{item.body}</blockquote>
          <p className="mt-4 text-xs text-slate-400">{label[language] || label.en}</p>
          {item.created_at && !Number.isNaN(Date.parse(item.created_at)) && <time dateTime={item.created_at} className="mt-1 block text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString(language)}</time>}
        </article>)}
      </div>
      {!all && <a href={{ tr: '/reviews', en: '/en/reviews', es: '/es/opiniones' }[language]} className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-cyan-300 underline">{({ tr: 'Tüm yorumlar', en: 'All reviews', es: 'Todas las reseñas' })[language]}</a>}
      {failed && <p role="alert" className="mt-3 text-sm text-amber-300">{errorCopy[language]}</p>}
      {all && hasMore && <button type="button" disabled={loading} onClick={more} className="mt-5 min-h-11 px-4 text-sm font-bold text-cyan-300">{loading ? '…' : ({ tr: 'Daha fazla yorum', en: 'More reviews', es: 'Más reseñas' })[language]}</button>}
    </div>
  </section>;
}
