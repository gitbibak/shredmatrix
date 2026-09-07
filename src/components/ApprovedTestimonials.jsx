import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { getApprovedTestimonials } from '../lib/dataService';

export default function ApprovedTestimonials({ language = 'en' }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let active = true;
    getApprovedTestimonials(3, language).then((rows) => { if (active) setItems(rows); }).catch(() => { if (active) setItems([]); });
    return () => { active = false; };
  }, [language]);
  const visible = items.filter((item) => item.language === language && Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5);
  if (!visible.length) return null;
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
        </article>)}
      </div>
    </div>
  </section>;
}
