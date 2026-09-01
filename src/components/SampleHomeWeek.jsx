import { Link } from 'react-router-dom';
import { ChevronRight, Moon } from 'lucide-react';
import { formatSampleExercise, getSampleWeek } from '../data/sampleWeekMap';
import { trackLandingCta } from '../lib/analytics';

/**
 * Real beginner week from the plan engine, shown on home-workout landing pages
 * so search visitors can judge the program before registering.
 */
export default function SampleHomeWeek({ path, lang = 'tr', registerUrl = '/auth?mode=register', ctaId = 'sample_week' }) {
  const sample = getSampleWeek(path, lang);
  if (!sample) return null;
  const { days, copy } = sample;

  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">{copy.eyebrow}</p>
          <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">{copy.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{copy.intro}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800/70 bg-slate-900/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-4 py-3 font-semibold">{copy.day}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.focus}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{copy.exercises}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.day} className="border-b border-slate-800/60 align-top last:border-b-0">
                  <th scope="row" className="whitespace-nowrap px-4 py-3 font-bold text-white">{day.day}</th>
                  <td className="px-4 py-3 text-slate-300">
                    {day.rest ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-500"><Moon size={13} /> {copy.restDay}</span>
                    ) : day.focus}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <ul className="space-y-1">
                      {day.exercises.map((exercise) => (
                        <li key={`${day.day}-${exercise.name}`}>{formatSampleExercise(exercise, copy)}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400">{copy.progression}</p>
        <Link
          to={registerUrl}
          onClick={() => trackLandingCta(ctaId)}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 px-6 py-3 font-outfit text-sm font-bold text-white shadow-lg shadow-orange-500/20"
        >
          {copy.cta}
          <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}
