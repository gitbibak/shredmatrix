export default function PricingComparison({ headings, rows }) {
  return <div data-pricing-comparison className="mt-5 min-w-0 max-w-full border border-slate-800 [overflow-wrap:anywhere]">
    <div className="divide-y divide-slate-800 sm:hidden">
      {rows.map(([feature, ours, theirs]) => <section key={feature} className="min-w-0 p-4">
        <h3 className="text-sm font-semibold text-slate-200">{feature}</h3>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div className="min-w-0"><dt className="text-xs text-slate-400">{headings[1]}</dt><dd className="mt-1 font-semibold text-emerald-300">{ours}</dd></div>
          <div className="min-w-0"><dt className="text-xs text-slate-400">{headings[2]}</dt><dd className="mt-1 text-slate-300">{theirs}</dd></div>
        </dl>
      </section>)}
    </div>
    <table className="hidden w-full table-fixed text-left text-sm sm:table">
      <thead className="bg-slate-900 text-xs text-slate-400"><tr>{headings.map(head => <th scope="col" key={head} className="px-3 py-3 font-semibold">{head}</th>)}</tr></thead>
      <tbody>{rows.map(([feature, ours, theirs]) => <tr key={feature} className="border-t border-slate-800">
        <th scope="row" className="px-3 py-3 font-normal text-slate-300">{feature}</th>
        <td className="px-3 py-3 font-semibold text-emerald-300">{ours}</td>
        <td className="px-3 py-3 text-slate-300">{theirs}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
