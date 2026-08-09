import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { blogArticles, getBlogArticle } from '../data/blogArticles';

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
  const article = getBlogArticle(slug);

  useEffect(() => {
    if (!article) return undefined;

    const previousTitle = document.title;
    const url = `${BASE_URL}/blog/${article.slug}`;
    const imageUrl = `${BASE_URL}${article.image}`;
    document.title = `${article.title} | Full Balance`;
    upsertMeta('name', 'description', article.description);
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large');
    upsertMeta('name', 'author', 'Full Balance Editör Ekibi');
    upsertMeta('property', 'og:type', 'article');
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
          inLanguage: 'tr-TR',
          author: { '@type': 'Organization', name: 'Full Balance Editör Ekibi', url: `${BASE_URL}/editorial-policy` },
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
            { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Rehber', item: `${BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: url },
          ],
        },
      ],
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      schema.remove();
    };
  }, [article]);

  if (!article) return <Navigate to="/blog" replace />;

  const related = blogArticles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70 bg-slate-950/95">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link to="/blog" className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
            <ArrowLeft size={18} /> Tüm rehberler
          </Link>
          <Link to="/" className="font-outfit text-sm font-bold text-emerald-400">Full Balance</Link>
        </div>
      </header>

      <article>
        <header className="border-b border-slate-800/50 px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 text-xs font-bold">
              <span style={{ color: article.accent }}>{article.category}</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-slate-500"><Clock size={14} /> {article.readTime}</span>
            </div>
            <h1 className="mt-5 max-w-3xl font-outfit text-4xl font-black leading-tight sm:text-6xl">{article.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">{article.intro}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <time dateTime={article.publishedAt}>10 Ağustos 2026</time>
              <span aria-hidden="true">·</span>
              <Link to="/editorial-policy" className="font-semibold text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-emerald-400">
                Full Balance Editör Ekibi
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

            <aside className="mt-12 border-l-2 border-amber-500 bg-slate-900/60 p-5 text-sm leading-6 text-slate-400">
              Bu içerik genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir. Sağlık durumunuza uygun kararlar için doktorunuza danışın.
            </aside>

            <aside className="mt-6 flex items-start gap-3 border border-emerald-500/20 bg-emerald-500/5 p-5">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-white">Bu rehber nasıl hazırlandı?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  İçerik birincil ve kurumsal sağlık kaynakları temel alınarak hazırlanır; tıbbi vaat içermez ve önemli güncellemelerde yeniden değerlendirilir.
                </p>
                <Link to="/editorial-policy" className="mt-2 inline-block text-sm font-semibold text-emerald-400 underline underline-offset-4">
                  Yayın ilkelerimizi incele
                </Link>
              </div>
            </aside>

            <section className="mt-12 border-t border-slate-800 pt-8">
              <h2 className="flex items-center gap-2 font-outfit text-xl font-bold"><BookOpen size={20} className="text-emerald-400" /> Kaynaklar</h2>
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
            <h2 className="mt-2 font-outfit text-xl font-bold">Alışkanlıklarını tek yerde takip et</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Antrenman, uyku, beslenme, mobilite ve kişisel longevity görünümü ücretsiz.</p>
            <Link to="/auth" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-400">
              Ücretsiz başla <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </article>

      <section className="border-t border-slate-800/60 px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-outfit text-2xl font-bold">İlgili rehberler</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((item) => (
              <Link key={item.slug} to={`/blog/${item.slug}`} className="border border-slate-800 bg-slate-900/45 p-5 transition-colors hover:border-emerald-500/50">
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
