import PricingComparison from './PricingComparison';
import { useEffect } from 'react';
import { ArrowLeft, BadgeCheck, Check, CircleDollarSign, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { pricingAlternates, pricingPages } from '../data/pricingPages';

const BASE_URL = 'https://fullbalance.app';

function setMeta(selector, attributes, content) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function PricingPage() {
  const { pathname } = useLocation();
  const lang = pathname.startsWith('/en/') ? 'en' : pathname.startsWith('/es/') ? 'es' : 'tr';
  const c = pricingPages.find((page) => page.lang === lang) || pricingPages[0];

  useEffect(() => {
    const previous = {
      title: document.title,
      lang: document.documentElement.lang,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    };
    const canonical = `${BASE_URL}${c.path}`;
    document.title = c.title;
    document.documentElement.lang = lang;
    setMeta('meta[name="description"]', { name: 'description' }, c.description);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, c.title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, c.description);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonical);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.pricingSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'FAQPage', '@id': `${canonical}#faq`, inLanguage: c.locale, mainEntity: c.faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
        { '@type': ['WebApplication', 'SoftwareApplication'], '@id': `${BASE_URL}/#app`, name: 'Full Balance', url: `${BASE_URL}/`, applicationCategory: 'HealthApplication', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: lang === 'tr' ? 'TRY' : lang === 'es' ? 'EUR' : 'USD', availability: 'https://schema.org/InStock' } },
      ],
    });
    document.head.appendChild(schema);
    window.scrollTo(0, 0);
    return () => {
      document.title = previous.title;
      document.documentElement.lang = previous.lang;
      setMeta('meta[name="description"]', { name: 'description' }, previous.description);
      if (previous.canonical) document.querySelector('link[rel="canonical"]')?.setAttribute('href', previous.canonical);
      schema.remove();
    };
  }, [c, lang]);

  const homeHref = lang === 'tr' ? '/' : `/${lang}`;
  const registerHref = `/auth?mode=register&lang=${lang}`;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        <Link to={homeHref} className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />{c.home}</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">{c.eyebrow}</p>
        <h1 className="mt-3 font-outfit text-4xl font-extrabold leading-tight sm:text-5xl">{c.heading}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">{c.intro}</p>

        <section className="mt-10 grid gap-4 sm:grid-cols-[1fr_1.6fr]">
          <div className="border border-emerald-500/30 bg-emerald-500/5 p-6">
            <p className="text-xs uppercase tracking-wider text-slate-400">{c.priceLabel}</p>
            <p className="mt-2 font-outfit text-6xl font-black text-emerald-400">{c.price}</p>
            <p className="mt-3 text-xs leading-5 text-slate-400">{c.priceNote}</p>
            <Link to={registerHref} className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-emerald-500 px-5 font-outfit text-sm font-bold text-slate-950 hover:bg-emerald-400">{c.cta}</Link>
          </div>
          <ul className="grid gap-2 self-start sm:grid-cols-2">
            {c.compareRows.slice(0, 6).map(([feature, ours]) => (
              <li key={feature} className="flex items-start gap-2 border border-slate-800 bg-slate-900/50 p-3 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-emerald-400" /><span><span className="block text-slate-400">{feature}</span><span className="font-semibold text-white">{ours}</span></span></li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="flex items-center gap-2 font-outfit text-2xl font-bold"><CircleDollarSign size={22} className="text-orange-400" />{c.compareTitle}</h2>
          <PricingComparison headings={c.compareHead} rows={c.compareRows} />
        </section>

        <section className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-outfit text-2xl font-bold"><HeartHandshake size={22} className="text-emerald-400" />{c.whyTitle}</h2>
            <ul className="mt-4 space-y-3">{c.why.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />{item}</li>)}</ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2 font-outfit text-2xl font-bold"><ShieldCheck size={22} className="text-orange-400" />{c.honestyTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">{c.honesty}</p>
            <Link to="/privacy" className="mt-4 inline-block text-sm text-orange-300 hover:text-orange-200">{c.privacy}</Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-outfit text-2xl font-bold">{c.faqTitle}</h2>
          <div className="mt-4 divide-y divide-slate-800 border-y border-slate-800">
            {c.faqs.map(([question, answer]) => (
              <details key={question} className="group py-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-white">{question}<span className="text-slate-500 group-open:rotate-45">+</span></summary>
                <p className="pb-2 text-sm leading-6 text-slate-400">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center gap-4 text-sm">
          <Link to={registerHref} className="inline-flex min-h-12 items-center bg-orange-500 px-6 font-outfit font-bold text-white hover:bg-orange-400">{c.cta}</Link>
          <Link to={c.compareHref} className="text-slate-400 hover:text-white">{c.compareLink}</Link>
          <span className="text-xs text-slate-600">{Object.entries(pricingAlternates).filter(([key]) => key !== lang).map(([key, path]) => <Link key={key} to={path} className="mr-3 hover:text-white">{key.toUpperCase()}</Link>)}</span>
        </footer>
      </div>
    </main>
  );
}
