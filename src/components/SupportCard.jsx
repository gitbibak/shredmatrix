import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { SUPPORT_URL, isSupportEnabled, supportText } from '../data/support';
import { trackEvent } from '../lib/analytics';

/**
 * Optional support link ("buy me a protein shake"). Renders nothing until
 * SUPPORT_URL is configured. Never a popup: an inline line after a workout,
 * a card on the profile and a footer link.
 */
export default function SupportCard({ lang = 'tr', placement, variant = 'card', url = SUPPORT_URL }) {
  const [open, setOpen] = useState(false);
  if (!isSupportEnabled(url)) return null;
  const c = supportText(lang);
  const onClick = () => trackEvent('support_link_click', { placement, language: lang });
  const link = (className, label) => (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
      {label}
      <ExternalLink size={13} aria-hidden="true" />
    </a>
  );

  if (variant === 'footer') {
    return link('inline-flex items-center gap-1 hover:text-white', c.footer);
  }

  if (variant === 'inline') {
    return (
      <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5 text-left">
        <p className="text-xs leading-relaxed text-amber-100/90">{c.afterWorkout}</p>
        {link('mt-1.5 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200', c.cta)}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-slate-900 p-4 sm:p-5">
      <h3 className="font-outfit text-base font-bold text-white">{c.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.short}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {link('inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-amber-500 px-4 text-sm font-bold text-slate-950 hover:bg-amber-400', c.cta)}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-slate-400 hover:text-white"
        >
          {c.why}
          <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-sm leading-relaxed text-slate-300">
          {c.long.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      )}
    </section>
  );
}
