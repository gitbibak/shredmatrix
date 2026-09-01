import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, Brain, CheckCircle2, ChevronRight, Dumbbell, Globe2, Sparkles, Target, UtensilsCrossed } from 'lucide-react';
import { SEO_LAST_REVIEWED, findInternationalSeoPage, formatReviewedDate, getInternationalRelatedPages } from '../data/internationalSeoPages';

const REVIEW_LABEL = { en: 'Last reviewed', es: 'Última revisión' };
const SHORT_ANSWER_LABEL = { en: 'Short answer', es: 'Respuesta breve' };
import PublicHealthCalculator from './PublicHealthCalculator';
import { trackLandingCta } from '../lib/analytics';
import { recordAcquisitionContent } from '../lib/acquisition';

const CalorieCalc = lazy(() => import('./CalorieCalc'));
const SampleHomeWeek = lazy(() => import('./SampleHomeWeek'));

const BASE_URL = 'https://fullbalance.app';
const icons = { app: Sparkles, workout: Dumbbell, nutrition: UtensilsCrossed, progress: Activity, wellness: Brain };

function setMeta(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement('meta'); Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value)); document.head.appendChild(element); }
  element.setAttribute('content', content);
}

function setLink(rel, href, hreflang) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement('link'); element.rel = rel; if (hreflang) element.hreflang = hreflang; document.head.appendChild(element); }
  element.href = href;
}

function useInternationalSeo(page) {
  useEffect(() => {
    if (!page) return undefined;
    const url = `${BASE_URL}${page.path}`;
    document.documentElement.lang = page.lang;
    document.title = page.metaTitle;
    setLink('canonical', url);
    Object.entries(page.alternates).forEach(([lang, path]) => setLink('alternate', `${BASE_URL}${path}`, lang));
    setLink('alternate', `${BASE_URL}${page.alternates.en}`, 'x-default');
    setMeta('meta[name="description"]', { name: 'description' }, page.description);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, page.metaTitle);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, page.description);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, url);
    setMeta('meta[property="og:locale"]', { property: 'og:locale' }, page.lang === 'es' ? 'es_ES' : 'en_US');
    setMeta('meta[property="og:image"]', { property: 'og:image' }, `${BASE_URL}/og/full-balance-og-en.png`);
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.metaTitle);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
    try { localStorage.setItem('shredmatrix_lang', page.lang); } catch {}
    return undefined;
  }, [page]);
}

export default function InternationalLandingPage({ pathname }) {
  const page = findInternationalSeoPage(pathname);
  useInternationalSeo(page);
  if (!page) return <Navigate to="/" replace />;
  const Icon = icons[page.category] || Globe2;
  const related = getInternationalRelatedPages(page).slice(0, 8);
  const registerUrl = `/auth?mode=register&lang=${page.lang}`;
  const startRegistration = (placement) => {
    const content = `seo_${page.lang}_${page.topic}_${placement}`;
    recordAcquisitionContent(content);
    trackLandingCta(content);
  };
  return <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
    <section className="relative w-full overflow-hidden px-4 pb-14 pt-10 sm:pb-20 sm:pt-16"><div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,#0e749055,transparent_65%)]" /><div className="relative mx-auto w-full min-w-0 max-w-6xl">
      <nav className="mb-12 flex min-w-0 flex-col gap-3"><div className="flex min-w-0 items-center justify-between gap-2"><Link to={`/${page.lang}`} className="flex min-w-0 items-center gap-2 font-outfit text-sm font-extrabold"><Sparkles size={19} className="shrink-0 text-orange-400" /><span className="truncate">FULL BALANCE</span></Link><div className="flex shrink-0 items-center"><Link to={page.alternates.tr} className="px-2 py-2 text-xs font-bold text-slate-400">TR</Link><Link to={page.alternates.en} className={`px-2 py-2 text-xs font-bold ${page.lang === 'en' ? 'text-cyan-300' : 'text-slate-400'}`}>EN</Link><Link to={page.alternates.es} className={`px-2 py-2 text-xs font-bold ${page.lang === 'es' ? 'text-cyan-300' : 'text-slate-400'}`}>ES</Link></div></div><Link to={registerUrl} onClick={() => startRegistration('nav')} className="w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-xs font-extrabold text-white sm:ml-auto sm:w-auto">{page.startLabel}</Link></nav>
      <div className="grid w-full min-w-0 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center"><div className="w-full min-w-0"><span className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300"><CheckCircle2 size={14} className="shrink-0" />{page.freeLabel}</span><h1 className="mt-6 max-w-full break-words font-outfit text-3xl font-extrabold leading-tight [overflow-wrap:anywhere] sm:text-5xl md:text-6xl">{page.title} <span className="text-cyan-300">{page.accent}</span></h1><p className="mt-6 max-w-full break-words text-base leading-relaxed text-slate-300 [overflow-wrap:anywhere] sm:max-w-2xl sm:text-lg">{page.hero}</p><div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row"><Link to={registerUrl} onClick={() => startRegistration('hero')} className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-cyan-500 px-6 py-4 text-center text-sm font-extrabold">{page.startLabel}<ChevronRight size={17} className="shrink-0" /></Link><Link to={`/${page.lang}`} className="inline-flex min-w-0 items-center justify-center rounded-xl border border-slate-700 px-6 py-4 text-center text-sm font-bold text-slate-300">{page.homeLabel}</Link></div></div><div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">{page.commonBenefits.map((benefit) => <div key={benefit} className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/75 p-4"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" /><span className="min-w-0 break-words text-sm font-semibold leading-relaxed text-slate-200 [overflow-wrap:anywhere]">{benefit}</span></div>)}</div></div>
    </div></section>
    {page.faqs?.[0] && <section className="px-4 pb-4"><div className="mx-auto max-w-6xl"><div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">{SHORT_ANSWER_LABEL[page.lang] || SHORT_ANSWER_LABEL.en}</p><h2 className="mt-2 font-outfit text-lg font-bold text-white">{page.faqs[0][0]}</h2><p className="mt-2 text-sm leading-relaxed text-slate-300">{page.faqs[0][1]}</p><p className="mt-3 text-[11px] text-slate-500">{REVIEW_LABEL[page.lang] || REVIEW_LABEL.en}: <time dateTime={SEO_LAST_REVIEWED}>{formatReviewedDate(page.lang)}</time></p></div></div></section>}
    {page.calculator && <PublicHealthCalculator type={page.calculator} lang={page.lang} />}
    {page.mealTool && <section className="border-b border-slate-800 bg-slate-950 px-4 py-14"><div className="mx-auto max-w-4xl"><div className="mb-7 text-center"><p className="text-xs font-bold uppercase text-cyan-300">{page.lang === 'es' ? 'Herramienta gratuita para comidas' : 'Free meal tool'}</p><h2 className="mt-3 font-outfit text-3xl font-extrabold">{page.lang === 'es' ? 'Estima las calorías de una comida con una foto' : 'Estimate meal calories with a photo'}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{page.lang === 'es' ? 'Añade los alimentos visibles, confirma las porciones y no olvides aceites, salsas ni bebidas. Recibirás un rango útil, no una cifra falsamente exacta.' : 'Add the visible foods, confirm portions and include oils, sauces and drinks. You get a practical range instead of a falsely exact number.'}</p></div><Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-900" />}><CalorieCalc language={page.lang} /></Suspense></div></section>}
    <section className="border-y border-slate-800 bg-slate-900/35 px-4 py-14"><div className="mx-auto max-w-6xl"><h2 className="mb-7 font-outfit text-3xl font-extrabold">{page.featuresLabel}</h2><div className="grid gap-4 md:grid-cols-3">{page.sections.map(([title, body]) => <article key={title} className="rounded-xl border border-slate-800 bg-slate-950/65 p-6"><Icon size={22} className="mb-4 text-cyan-300" /><h3 className="font-outfit text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p></article>)}</div></div></section>
    <Suspense fallback={null}><SampleHomeWeek path={page.path} lang={page.lang} registerUrl={registerUrl} ctaId={`seo_${page.lang}_${page.topic}_sample_week`} /></Suspense>
    <section className="border-b border-slate-800 bg-orange-500 px-4 py-10 text-slate-950"><div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div className="max-w-2xl"><h2 className="font-outfit text-2xl font-extrabold sm:text-3xl">{page.conversionTitle}</h2><p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900/80 sm:text-base">{page.conversionText}</p></div><Link to={registerUrl} onClick={() => startRegistration('mid')} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-extrabold text-white">{page.startLabel}<ChevronRight size={17} /></Link></div></section>
    <section className="px-4 py-14"><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase text-orange-400">{page.relatedEyebrow}</p><h2 className="mt-2 font-outfit text-3xl font-extrabold">{page.relatedTitle}</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <Link key={item.path} to={item.path} className="rounded-xl border border-slate-800 bg-slate-900/55 p-4 text-sm font-bold text-slate-200 hover:border-cyan-500/40"><span>{item.title}</span><ChevronRight size={15} className="mt-3 text-cyan-300" /></Link>)}</div></div></section>
    <section className="px-4 pb-20 pt-8"><div className="mx-auto max-w-4xl"><h2 className="text-center font-outfit text-3xl font-extrabold">{page.faqLabel}</h2><div className="mt-8 space-y-3">{page.faqs.map(([question, answer]) => <article key={question} className="rounded-xl border border-slate-800 bg-slate-900/65 p-5"><h2 className="font-outfit text-base font-extrabold">{question}</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">{answer}</p></article>)}</div><p className="mt-8 rounded-xl border border-orange-500/20 bg-orange-500/10 p-5 text-xs leading-relaxed text-orange-100">{page.disclaimer}</p></div></section>
  </main>;
}
