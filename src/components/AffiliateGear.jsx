import { ChevronDown, ExternalLink, ShoppingBag } from 'lucide-react';
import { AFFILIATE_COPY, AMAZON_DISCLOSURE, getAffiliateProducts, isAmazonUrl } from '../data/affiliateProducts';
import { trackEvent } from '../lib/analytics';

// Ortaklık ürün kutusu. Linki girilmiş ürün yoksa hiçbir şey render etmez.
// `compact` uygulama içinde katlanmış küçük sürümdür.
export default function AffiliateGear({ placement, set, lang, compact = false }) {
  const products = getAffiliateProducts(set, lang);
  if (products.length === 0) return null;
  const copy = AFFILIATE_COPY[lang] || AFFILIATE_COPY.en;

  const list = (
    <ul className="grid gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <li key={product.id} className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <span className="font-outfit text-sm font-bold text-white">{product.label}</span>
          <span className="mt-1 flex-1 text-xs leading-relaxed text-slate-400">{product.reason}</span>
          <a
            href={product.url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => trackEvent('affiliate_link_click', {
              placement,
              productId: product.id,
              language: lang,
              ...(product.store ? { store: product.store } : {}),
            })}
            className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-orange-500/40 px-3 py-2 text-xs font-bold text-orange-300 hover:bg-orange-500/10"
          >
            {copy.cta}{product.store ? ` · ${product.store}` : ''}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );

  const hasAmazon = products.some((product) => isAmazonUrl(product.url));
  const disclosure = (
    <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
      {copy.disclosure}
      {hasAmazon && <span className="mt-1 block">{AMAZON_DISCLOSURE}</span>}
    </p>
  );

  if (compact) {
    return (
      <details className="group rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-300">
          <ShoppingBag size={15} className="shrink-0 text-orange-400" aria-hidden="true" />
          <span className="flex-1">{copy.appTitle}</span>
          <span className="text-[10px] font-medium text-slate-500">{copy.eyebrow}</span>
          <ChevronDown size={14} className="shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3">{list}{disclosure}</div>
      </details>
    );
  }

  return (
    <section className="border-b border-slate-800/60 px-4 py-14" aria-labelledby={`affiliate-${placement}`}>
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{copy.eyebrow}</p>
        <h2 id={`affiliate-${placement}`} className="mt-2 font-outfit text-2xl font-extrabold text-white">{copy.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{copy.intro}</p>
        <div className="mt-6">{list}</div>
        {disclosure}
      </div>
    </section>
  );
}
