import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { blogArticles } from '../data/blogArticles';
import { BLOG_LANGUAGES, getArticleLanguage, getArticlePath, getBlogCopy, getBlogLanguage, getBlogPath } from '../data/blogLocale';
import { useTranslation } from '../i18n/LanguageContext';

const BASE_URL = 'https://fullbalance.app';

function setMeta(attribute, name, content) {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function BlogIndex() {
  const { pathname } = useLocation();
  const language = getBlogLanguage(pathname);
  const { setLang } = useTranslation();
  const copy = getBlogCopy(language);
  const articles = useMemo(() => blogArticles.filter((article) => getArticleLanguage(article) === language), [language]);

  useEffect(() => { setLang(language); }, [language, setLang]);

  useEffect(() => {
    document.head.querySelectorAll('link[rel="alternate"][hreflang], script[data-static-seo="true"], meta[property="og:locale:alternate"]').forEach((element) => element.remove());
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;
    document.title = copy.indexTitle;
    const description = copy.indexDescription;
    const url = `${BASE_URL}${getBlogPath(language)}`;
    const image = `${BASE_URL}/images/blog/longevity-habits.jpg`;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:locale', copy.locale.replace('-', '_'));
    setMeta('property', 'og:title', copy.indexTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', copy.indexTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const alternates = [...BLOG_LANGUAGES, 'x-default'].map((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${BASE_URL}${getBlogPath(lang === 'x-default' ? 'en' : lang)}`;
      link.dataset.blogAlternate = 'true';
      document.head.appendChild(link);
      return link;
    });

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.blogSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: copy.schemaName,
      url,
      inLanguage: copy.locale,
      description,
      publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL },
      blogPost: articles.map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        url: `${BASE_URL}${getArticlePath(article)}`,
        inLanguage: copy.locale,
        datePublished: article.publishedAt,
      })),
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      alternates.forEach((link) => link.remove());
      schema.remove();
    };
  }, [articles, copy, language]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to={language === 'tr' ? '/' : `/${language}`} className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
            <ArrowLeft size={18} /> Full Balance
          </Link>
          <span className="flex items-center gap-2 font-outfit text-sm font-bold text-emerald-400">
            <BookOpen size={18} /> {copy.guide}
          </span>
        </div>
      </header>

      <section className="border-b border-slate-800/50 px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
            <Sparkles size={15} /> {copy.eyebrow}
          </div>
          <h1 className="max-w-3xl font-outfit text-4xl font-black leading-tight sm:text-6xl">
            {copy.heading}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {copy.lead}
          </p>
          <nav aria-label="Blog languages" className="mt-6 flex flex-wrap gap-4 text-sm">
            {BLOG_LANGUAGES.map((lang) => <Link key={lang} to={getBlogPath(lang)} lang={lang} aria-current={language === lang ? 'page' : undefined} className={language === lang ? 'font-bold text-emerald-400' : 'text-slate-400 underline underline-offset-4 hover:text-white'}>{getBlogCopy(lang).languageName}</Link>)}
          </nav>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {articles.map((article) => (
            <article key={article.slug} className="overflow-hidden border border-slate-800 bg-slate-900/55">
              <Link to={getArticlePath(article)} aria-label={`${copy.readAria} ${article.title}`}>
                <img src={article.image} alt={article.imageAlt} width="1600" height="900" loading="lazy" className="aspect-video w-full object-cover" />
              </Link>
              <div className="flex min-h-[260px] flex-col p-6">
              <div className="mb-5 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold" style={{ color: article.accent }}>{article.category}</span>
                <span className="flex items-center gap-1.5 text-slate-500"><Clock size={14} /> {article.readTime}</span>
              </div>
              <h2 className="font-outfit text-2xl font-bold leading-snug text-white">{article.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">{article.description}</p>
              <Link to={getArticlePath(article)} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-emerald-400">
                {copy.read} <ArrowRight size={17} />
              </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800/60 px-5 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-outfit text-2xl font-bold">{copy.indexCtaTitle}</h2>
            <p className="mt-2 text-sm text-slate-400">{copy.indexCtaDescription}</p>
          </div>
          <Link to={`/auth?mode=register${language === 'tr' ? '' : `&lang=${language}`}`} className="inline-flex min-h-12 items-center gap-2 bg-orange-500 px-6 py-3 font-outfit text-sm font-bold text-white transition-colors hover:bg-orange-400">
            {copy.ctaLabel} <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mx-auto mt-8 max-w-4xl border-t border-slate-800/60 pt-5 text-sm text-slate-500">
          <Link to="/editorial-policy" className="underline decoration-slate-700 underline-offset-4 transition-colors hover:text-emerald-400">
            {copy.editorialFooter}
          </Link>
        </div>
      </section>
    </main>
  );
}
