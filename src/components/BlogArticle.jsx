import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { blogArticles, getBlogArticle } from '../data/blogArticles';
import { BLOG_LANGUAGES, getArticleLanguage, getArticlePath, getBlogCopy, getBlogLanguage, getBlogPath } from '../data/blogLocale';
import { useTranslation } from '../i18n/LanguageContext';

const BASE_URL = 'https://fullbalance.app';

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function BlogArticle() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const language = getBlogLanguage(pathname);
  const { setLang } = useTranslation();
  const copy = getBlogCopy(language);
  const article = getBlogArticle(slug);
  const validArticle = article && getArticleLanguage(article) === language ? article : null;
  const translations = useMemo(() => validArticle?.translationKey
    ? blogArticles.filter((item) => item.translationKey === validArticle.translationKey)
    : [], [validArticle]);

  useEffect(() => { setLang(language); }, [language, setLang]);

  useEffect(() => {
    if (!validArticle) return undefined;

    document.head.querySelectorAll('link[rel="alternate"][hreflang], script[data-static-seo="true"], meta[property="og:locale:alternate"]').forEach((element) => element.remove());
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;
    const url = `${BASE_URL}${getArticlePath(validArticle)}`;
    const imageUrl = `${BASE_URL}${article.image}`;
    document.title = `${article.title} | Full Balance`;
    upsertMeta('name', 'description', article.description);
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('name', 'author', copy.author);
    upsertMeta('property', 'og:type', 'article');
    upsertMeta('property', 'og:locale', copy.locale.replace('-', '_'));
    upsertMeta('property', 'og:title', article.title);
    upsertMeta('property', 'og:description', article.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:image:alt', article.imageAlt);
    upsertMeta('property', 'article:published_time', `${article.publishedAt}T09:00:00+03:00`);
    upsertMeta('property', 'article:modified_time', `${article.updatedAt}T09:00:00+03:00`);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', article.title);
    upsertMeta('name', 'twitter:description', article.description);
    upsertMeta('name', 'twitter:image', imageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const alternateArticles = translations.length > 1
      ? [...translations.map((item) => ({ article: item, hreflang: getArticleLanguage(item) })), { article: translations.find((item) => getArticleLanguage(item) === 'en') || translations[0], hreflang: 'x-default' }]
      : translations.map((item) => ({ article: item, hreflang: getArticleLanguage(item) }));
    const alternates = alternateArticles.map(({ article: translation, hreflang }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = `${BASE_URL}${getArticlePath(translation)}`;
      link.dataset.blogAlternate = 'true';
      document.head.appendChild(link);
      return link;
    });

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.articleSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline: article.title,
          description: article.description,
          image: [imageUrl],
          datePublished: `${article.publishedAt}T09:00:00+03:00`,
          dateModified: `${article.updatedAt}T09:00:00+03:00`,
          mainEntityOfPage: url,
          inLanguage: copy.locale,
          author: { '@type': 'Organization', name: copy.author, url: `${BASE_URL}/editorial-policy` },
          publisher: {
            '@type': 'Organization',
            name: 'Full Balance',
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon-512.png` },
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: copy.home, item: `${BASE_URL}${language === 'tr' ? '/' : `/${language}`}` },
            { '@type': 'ListItem', position: 2, name: copy.guide, item: `${BASE_URL}${getBlogPath(language)}` },
            { '@type': 'ListItem', position: 3, name: article.title, item: url },
          ],
        },
      ],
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      alternates.forEach((link) => link.remove());
      schema.remove();
    };
  }, [validArticle, language, copy]);

  if (!validArticle) return <Navigate to={getBlogPath(language)} replace />;

  const related = blogArticles.filter((item) => getArticleLanguage(item) === language && item.slug !== article.slug).slice(0, 2);
  const publishedLabel = new Intl.DateTimeFormat(copy.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${article.publishedAt}T12:00:00`));
  const updatedLabel = new Intl.DateTimeFormat(copy.locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${article.updatedAt}T12:00:00`));
  const cta = article.cta || { href: `/auth?mode=register${language === 'tr' ? '' : `&lang=${language}`}`, label: copy.ctaLabel, title: copy.ctaTitle, description: copy.ctaDescription };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70 bg-slate-950/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link to={getBlogPath(language)} className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
            <ArrowLeft size={18} /> {copy.allGuides}
          </Link>
          <Link to={language === 'tr' ? '/' : `/${language}`} className="font-outfit text-sm font-bold text-emerald-400">Full Balance</Link>
        </div>
      </header>

      <article>
        <header className="border-b border-slate-800/50 px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <nav aria-label="Blog languages" className="mb-5 flex flex-wrap gap-4 text-sm">
              {BLOG_LANGUAGES.map((lang) => {
                const translation = translations.find((item) => getArticleLanguage(item) === lang) || (language === lang ? article : null);
                const current = language === lang;
                return <Link key={lang} to={translation ? getArticlePath(translation) : getBlogPath(lang)} lang={lang} aria-current={current ? 'page' : undefined} className={current ? 'font-bold text-emerald-400' : 'text-slate-400 underline underline-offset-4 hover:text-white'}>{getBlogCopy(lang).languageName}</Link>;
              })}
            </nav>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span style={{ color: article.accent }}>{article.category}</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-slate-500"><Clock size={14} /> {article.readTime}</span>
            </div>
            <h1 className="mt-5 max-w-3xl font-outfit text-4xl font-black leading-tight sm:text-6xl">{article.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">{article.intro}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <time dateTime={article.publishedAt}>{copy.published}: {publishedLabel}</time>
              {article.updatedAt !== article.publishedAt && <><span aria-hidden="true">·</span><time dateTime={article.updatedAt}>{copy.updated}: {updatedLabel}</time></>}
              <span aria-hidden="true">·</span>
              <Link to="/editorial-policy" className="font-semibold text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-emerald-400">
                {copy.author}
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 pt-8">
          <img
            src={article.image}
            alt={article.imageAlt}
            width="1600"
            height="900"
            fetchPriority="high"
            className="aspect-video w-full object-cover"
          />
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0">
            {article.sections.map((section) => (
              <section key={section.heading} className="mb-10">
                <h2 className="font-outfit text-2xl font-bold leading-snug text-white sm:text-3xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-slate-300">{paragraph}</p>
                ))}
              </section>
            ))}

            {article.internalLinks?.length > 0 && (
              <nav aria-label={copy.relatedToolsAria} className="mt-12 border border-slate-800 bg-slate-900/45 p-5">
                <h2 className="font-outfit text-xl font-bold">{copy.relatedTools}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {article.internalLinks.map(([href, label]) => (
                    <li key={href}><Link to={href} className="text-sm font-semibold text-emerald-400 underline underline-offset-4">{label}</Link></li>
                  ))}
                </ul>
              </nav>
            )}

            <aside className="mt-12 border-l-2 border-amber-500 bg-slate-900/60 p-5 text-sm leading-6 text-slate-400">
              {copy.disclaimer}
            </aside>

            <aside className="mt-6 flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/5 p-5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">{copy.editorialHeading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {copy.editorialBody}
                </p>
                <Link to="/editorial-policy" className="mt-2 inline-block text-sm font-semibold text-emerald-400 underline underline-offset-4">
                  {copy.editorialLink}
                </Link>
              </div>
            </aside>

            <section className="mt-12 border-t border-slate-800 pt-8">
              <h2 className="flex items-center gap-2 font-outfit text-xl font-bold"><BookOpen size={20} className="text-emerald-400" /> {copy.sources}</h2>
              <ul className="mt-4 space-y-3">
                {article.sources.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 text-sm leading-6 text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-emerald-400">
                      {label} <ExternalLink size={14} className="mt-1 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="h-fit border border-slate-800 bg-slate-900/50 p-5 lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase text-orange-400">Full Balance</p>
            <h2 className="mt-2 font-outfit text-xl font-bold">{cta.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{cta.description}</p>
            {/^https?:\/\//.test(cta.href) ? <a href={cta.href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-400">{cta.label} <ArrowRight size={16} /></a> : <Link to={cta.href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-400">{cta.label} <ArrowRight size={16} /></Link>}
          </aside>
        </div>
      </article>

      <section className="border-t border-slate-800/60 px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-outfit text-2xl font-bold">{copy.related}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <Link key={item.slug} to={getArticlePath(item)} className="border border-slate-800 bg-slate-900/45 p-5 transition-colors hover:border-emerald-500/50">
                <span className="text-xs font-bold" style={{ color: item.accent }}>{item.category}</span>
                <h3 className="mt-2 font-outfit text-lg font-bold leading-snug">{item.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
