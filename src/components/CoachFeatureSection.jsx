import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, QrCode, Building2 } from 'lucide-react';
import { coachMarketing } from '../data/coachMarketing';
import { trackLandingCta } from '../lib/analytics';
import { recordAcquisitionContent } from '../lib/acquisition';

const icons = [ClipboardList, QrCode, Building2];
export default function CoachFeatureSection({ lang = 'tr' }) {
  const section = useRef(null);
  const c = coachMarketing[lang] || coachMarketing.en;
  useEffect(() => {
    if (window.location.hash !== '#for-trainers') return;
    let cancelled = false;
    let frame;
    // Wait for font layout and the static-to-React handoff before positioning an ad link.
    Promise.resolve(document.fonts?.ready).then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        if (window.location.hash === '#for-trainers') section.current?.scrollIntoView({ behavior: 'instant' });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, []);
  const track = () => {
    const placement = 'coach_home_' + lang;
    recordAcquisitionContent(placement);
    trackLandingCta(placement);
  };
  return <section ref={section} id="for-trainers" aria-labelledby="coach-feature-title" className="scroll-mt-32 border-y border-white/10 bg-zinc-950 px-5 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold text-emerald-400">{c.eyebrow}</p>
      <h2 id="coach-feature-title" className="mt-3 max-w-3xl break-words font-outfit text-2xl font-bold leading-tight text-white sm:text-3xl">{c.title}</h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{c.intro}</p>
      <div className="mt-8 grid gap-7 border-y border-white/10 py-7 md:grid-cols-3">
        {c.items.map(([title, text], index) => {
          const Icon = icons[index];
          return <article key={title} className="min-w-0">
            <Icon size={22} className={index === 1 ? 'text-cyan-300' : 'text-emerald-400'} aria-hidden="true" />
            <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
          </article>;
        })}
      </div>
      <div className="mt-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h3 className="text-sm font-semibold text-emerald-400">{c.offerTitle}</h3>
          <p className="mt-2 text-lg font-semibold leading-7 text-white">{c.offer}</p>
          <p className="mt-3 text-xs leading-6 text-slate-400">{c.note}</p>
        </div>
        <Link to="/coach" onClick={track} className="inline-flex min-h-12 max-w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-center text-sm font-bold text-zinc-950 hover:bg-emerald-300">
          {c.cta}<ArrowRight size={18} className="shrink-0" />
        </Link>
      </div>
    </div>
  </section>;
}
