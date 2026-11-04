import { ExternalLink } from 'lucide-react';
import { storePrices } from '../data/storePrices';

/** Competitor subscription prices read from the App Store, with date and source links. */
export default function StorePriceTable({ lang = 'tr' }) {
  const c = storePrices[lang] || storePrices.en;
  return (
    <section className="mt-14" aria-labelledby="store-prices-title">
      <h2 id="store-prices-title" className="font-outfit text-2xl font-bold">{c.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{c.intro}</p>
      <ul className="mt-4 space-y-2 sm:hidden">
        {c.rows.map(([app, purpose, price, ours, source]) => (
          <li key={app} className="border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-white">{app} <span className="text-xs font-normal text-slate-500">· {purpose}</span></p>
              <a href={source} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-slate-500">{c.source}<ExternalLink size={10} aria-hidden="true" /></a>
            </div>
            <p className="mt-1.5 text-sm text-slate-300">{price}</p>
            <p className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-sm">
              <span className="text-slate-400">Full Balance</span>
              <span className="font-outfit text-lg font-black text-emerald-400">{ours}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden overflow-x-auto border border-slate-800 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs text-slate-400">
            <tr>{c.head.map((head) => <th key={head} scope="col" className="px-3 py-2.5 font-medium">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {c.rows.map(([app, purpose, price, ours, source]) => (
              <tr key={app}>
                <th scope="row" className="px-3 py-3 font-semibold text-white">
                  {app}
                  <a href={source} target="_blank" rel="noopener noreferrer nofollow" className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] font-normal text-slate-500 hover:text-slate-300">
                    {c.source}<ExternalLink size={10} aria-hidden="true" />
                  </a>
                </th>
                <td className="px-3 py-3 text-slate-400">{purpose}</td>
                <td className="px-3 py-3 text-slate-200">{price}</td>
                <td className="px-3 py-3 font-outfit text-lg font-black text-emerald-400">{ours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{c.note}</p>
    </section>
  );
}
