import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SEO_LAST_REVIEWED, formatReviewedDate, getAlternatesForTurkishPath } from '../data/internationalSeoPages';
import { trackLandingCta } from '../lib/analytics';
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  FileDown,
  Flame,
  Leaf,
  Moon,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';

const CalorieCalc = lazy(() => import('./CalorieCalc'));
const SampleHomeWeek = lazy(() => import('./SampleHomeWeek'));
const PublicHealthCalculator = lazy(() => import('./PublicHealthCalculator'));

const BASE_URL = 'https://fullbalance.app';
const OG_IMAGE = `${BASE_URL}/og/full-balance-og-tr.png`;

import { turkishSeoPages } from '../data/turkishSeoPages';

const PAGE_ICONS = { Activity, Brain, Dumbbell, FileDown, Flame, Leaf, Scale, Shield, Sparkles, Target, TrendingUp, UtensilsCrossed, Waves };
const pages = Object.fromEntries(Object.entries(turkishSeoPages).map(([slug, page]) => [slug, { ...page, icon: PAGE_ICONS[page.icon] || Sparkles }]));

const supportCards = [
  { icon: Shield, text: 'Kredi kartı yok' },
  { icon: Award, text: 'Premium duvarı yok' },
  { icon: BarChart3, text: 'Takip ve rapor dahil' },
  { icon: Scale, text: 'Kişisel metrikler' },
  { icon: Moon, text: 'Uyku ve toparlanma' },
  { icon: Flame, text: 'Hedef odaklı plan' },
];

const relatedLinks = [
  ['evde-spor-programi', 'Ekipmansız evde spor'],
  ['30-gunluk-evde-spor-programi', '30 günlük ev programı'],
  ['evde-dambil-antrenman-programi', 'Evde dambıl programı'],
  ['direnc-bandi-antrenman-programi', 'Direnç bandı programı'],
  ['kadinlar-icin-evde-spor-programi', 'Kadınlar için ev programı'],
  ['40-yas-ustu-evde-spor-programi', '40 yaş üstü program'],
  ['evde-kas-gelistirme-hareketleri', 'Evde kas geliştirme'],
  ['gunluk-kalori-ihtiyaci-hesaplama', 'Günlük kalori ihtiyacı'],
  ['fotografla-kalori-hesaplama', 'Fotoğrafla kalori'],
  ['pilates-mi-yoga-mi', 'Pilates mi yoga mı?'],
  ['uyku-meditasyonu', 'Uyku meditasyonu'],
  ['baslangic-pilates-programi', 'Başlangıç pilatesi'],
  ['kas-gelisimi-programi', 'Kas gelişimi'],
  ['yag-yakimi-programi', 'Yağ yakımı'],
  ['ucretsiz-beslenme-programi', 'Beslenme programı'],
  ['protein-ihtiyaci-hesaplama', 'Protein hesabı'],
  ['bmi-hesaplama', 'BMI hesabı'],
  ['yoga-uygulamasi', 'Yoga'],
  ['pilates-programi', 'Pilates'],
  ['reformer-pilates-programi', 'Reformer'],
  ['meditasyon-uygulamasi', 'Meditasyon'],
  ['ilerleme-takibi', 'İlerleme takibi'],
  ['excel-rapor-disari-aktarma', 'Rapor dışa aktar'],
];

function upsertMeta(selector, createAttrs, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function upsertAlternate(language, path) {
  let element = document.head.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'alternate');
    element.setAttribute('hreflang', language);
    document.head.appendChild(element);
  }
  element.setAttribute('href', `${BASE_URL}${path}`);
}

function useSeo(page, slug) {
  useEffect(() => {
    const url = `${BASE_URL}/${slug}`;
    const alternates = getAlternatesForTurkishPath(`/${slug}`);
    document.documentElement.lang = 'tr';
    document.title = page.metaTitle;
    upsertCanonical(url);
    if (alternates) {
      Object.entries(alternates).forEach(([language, path]) => upsertAlternate(language, path));
      upsertAlternate('x-default', alternates.en);
    }
    upsertMeta('meta[name="description"]', { name: 'description' }, page.description);
    upsertMeta('meta[name="keywords"]', { name: 'keywords' }, page.keywords);
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, page.metaTitle);
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, page.description);
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url);
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, page.metaTitle);
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, page.description);
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, OG_IMAGE);

    const scriptId = 'seo-page-json-ld';
    document.getElementById(scriptId)?.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.metaTitle,
          description: page.description,
          inLanguage: 'tr',
          dateModified: SEO_LAST_REVIEWED,
          isPartOf: { '@id': `${BASE_URL}/#website` },
          about: { '@id': `${BASE_URL}/#app` },
        },
        {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: page.faqs.map(([question, answer]) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: answer,
            },
          })),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Full Balance',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: page.metaTitle,
              item: url,
            },
          ],
        },
        {
          '@type': ['WebApplication', 'SoftwareApplication'],
          '@id': `${BASE_URL}/#app`,
          name: 'Full Balance',
          url: BASE_URL,
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Web, iOS, Android, PWA',
          isAccessibleForFree: true,
          description: 'Full Balance is a free fitness, wellness, nutrition and progress tracking app for muscle growth, fat loss, yoga, pilates, reformer and meditation.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
    });
    document.head.appendChild(script);
    return () => document.getElementById(scriptId)?.remove();
  }, [page, slug]);
}

export default function SeoLandingPage({ slug }) {
  const pageExists = Boolean(pages[slug]);
  const page = pages[slug] || pages['ucretsiz-fitness-uygulamasi'];
  const canonicalSlug = pageExists ? slug : 'ucretsiz-fitness-uygulamasi';

  useSeo(page, canonicalSlug);
  if (!pageExists) return <Navigate to="/" replace />;
  const Icon = page.icon;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
        <div className="absolute left-1/2 top-0 h-[520px] w-[min(900px,100vw)] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <nav className="mb-14 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 font-outfit text-sm font-bold text-white">
              <Sparkles size={18} className="text-orange-400" />
              FULL BALANCE
            </Link>
            <Link
              to="/auth?mode=register"
              onClick={() => trackLandingCta(`seo_${canonicalSlug}_nav`)}
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/20"
            >
              Ücretsiz Başla
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: `${page.accent}55`, color: page.accent, backgroundColor: `${page.accent}12` }}
              >
                <Icon size={14} />
                Tamamen ücretsiz
              </div>
              <h1 className="font-outfit text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                {page.title}{' '}
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  {page.titleAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                {page.heroCopy}
              </p>
              {page.faqs?.[0] && (
                <div className="mt-6 max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Kısa cevap</p>
                  <h2 className="mt-2 font-outfit text-lg font-bold text-white">{page.faqs[0][0]}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{page.faqs[0][1]}</p>
                  <p className="mt-3 text-[11px] text-slate-500">
                    Son güncelleme: <time dateTime={SEO_LAST_REVIEWED}>{formatReviewedDate('tr')}</time>
                  </p>
                </div>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth?mode=register"
                  onClick={() => trackLandingCta(`seo_${canonicalSlug}_hero`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-blue-500 px-6 py-4 font-outfit text-sm font-bold text-white shadow-xl shadow-orange-500/20"
                >
                  Ücretsiz Hesap Oluştur
                  <ChevronRight size={16} />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 px-6 py-4 font-outfit text-sm font-bold text-slate-300"
                >
                  Ana Sayfayı Gör
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-2xl shadow-black/20">
              <div className="grid grid-cols-2 gap-3">
                {supportCards.map((card) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={card.text} className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                      <CardIcon size={20} className="mb-3 text-orange-400" />
                      <p className="font-outfit text-sm font-bold text-white">{card.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {page.calculator && (
        <Suspense fallback={<div className="mx-auto my-10 h-72 max-w-4xl animate-pulse rounded-2xl bg-slate-900" />}>
          <PublicHealthCalculator type={page.calculator} lang="tr" />
        </Suspense>
      )}

      {(canonicalSlug === 'kalori-makro-takibi' || page.mealTool) && (
        <section className="border-b border-slate-800/60 bg-slate-950 px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <div className="mb-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Ücretsiz öğün aracı</p>
              <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Fotoğrafla öğün kalori tahmini</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Fotoğraftaki yiyecekleri ekle, porsiyonları doğrula ve yağ, sos ile içecekleri unutma. Araç kesinmiş gibi tek sayı vermek yerine gerçekçi bir tahmin aralığı gösterir.</p>
            </div>
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-900" />}>
              <CalorieCalc language="tr" />
            </Suspense>
          </div>
        </section>
      )}

      <section className="border-y border-slate-800/60 bg-slate-900/35 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/55 p-6">
              <CheckCircle2 size={22} className="mb-4" style={{ color: page.accent }} />
              <h2 className="font-outfit text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <Suspense fallback={null}>
        <SampleHomeWeek path={`/${canonicalSlug}`} lang="tr" ctaId={`seo_${canonicalSlug}_sample_week`} />
      </Suspense>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Daha Fazla Arama</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Hedefine Göre Devam Et</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
              Full Balance sadece tek bir fitness aracı değil; beslenme, antrenman, wellness ve ilerleme takibini aynı ücretsiz deneyimde birleştirir.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedLinks
              .filter(([linkSlug]) => linkSlug !== canonicalSlug)
              .slice(0, 8)
              .map(([linkSlug, label]) => (
                <Link
                  key={linkSlug}
                  to={`/${linkSlug}`}
                  className="group rounded-2xl border border-slate-800/70 bg-slate-900/45 p-4 transition-colors hover:border-orange-500/45 hover:bg-slate-900"
                >
                  <span className="font-outfit text-sm font-bold text-white group-hover:text-orange-300">{label}</span>
                  <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-blue-300">
                    Sayfayı aç <ChevronRight size={13} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">SSS</p>
            <h2 className="mt-3 font-outfit text-3xl font-extrabold text-white">Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-4">
            {page.faqs.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5">
                <h2 className="font-outfit text-base font-bold text-white">{question}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-6 text-center">
            <p className="text-sm leading-relaxed text-orange-100">
              Full Balance tıbbi tavsiye sunmaz. Egzersiz veya beslenme programına başlamadan önce sağlık uzmanına danışılması önerilir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export const SEO_PAGE_SLUGS = Object.keys(pages);
