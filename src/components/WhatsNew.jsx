import { Sparkle } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';

const COPY = {
  tr: { title: 'Yenilikler', members: 'Kullanıcı fikri', locale: 'tr-TR' },
  en: { title: "What's new", members: 'Member idea', locale: 'en-US' },
  es: { title: 'Novedades', members: 'Idea de usuarios', locale: 'es-ES' },
};

export default function WhatsNew({ lang = 'tr', limit = 6 }) {
  const c = COPY[lang] || COPY.en;
  return (
    <section aria-labelledby="whats-new-title" className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <h3 id="whats-new-title" className="flex items-center gap-2 font-outfit text-sm font-bold text-white"><Sparkle size={15} className="text-orange-400" aria-hidden="true" />{c.title}</h3>
      <ul className="mt-3 space-y-2.5">
        {CHANGELOG.slice(0, limit).map((item) => (
          <li key={item.date + item.en} className="flex items-start gap-3 text-sm">
            <time dateTime={item.date} className="w-14 shrink-0 pt-0.5 text-[11px] tabular-nums text-slate-500">
              {new Date(`${item.date}T12:00:00`).toLocaleDateString(c.locale, { day: 'numeric', month: 'short' })}
            </time>
            <span className="min-w-0 leading-snug text-slate-300">
              {item[lang] || item.en}
              {item.fromMembers && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{c.members}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
