import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogArticles } from '../data/blogArticles';

const BASE_URL = 'https://fullbalance.app';

function setMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function BlogIndex() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Sağlıklı Yaşam ve Longevity Rehberleri | Full Balance';
    setMeta('description', 'Antrenman, beslenme, uyku, mobilite ve longevity hakkında uygulanabilir, kaynaklı ve ücretsiz Full Balance rehberleri.');
    setMeta('robots', 'index, follow, max-image-preview:large');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}/blog`;

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.blogSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Full Balance Rehber',
      url: `${BASE_URL}/blog`,
      description: 'Sağlıklı yaşam, antrenman, beslenme, uyku, mobilite ve longevity rehberleri.',
      publisher: { '@type': 'Organization', name: 'Full Balance', url: BASE_URL },
      blogPost: blogArticles.map((article) => ({
        '@type': 'BlogPosting',
        headline: article.title,
        url: `${BASE_URL}/blog/${article.slug}`,
        datePublished: article.publishedAt,
      })),
    });
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      schema.remove();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white">
            <ArrowLeft size={18} /> Full Balance
          </Link>
          <span className="flex items-center gap-2 font-outfit text-sm font-bold text-emerald-400">
            <BookOpen size={18} /> Rehber
          </span>
        </div>
      </header>

      <section className="border-b border-slate-800/50 px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
            <Sparkles size={15} /> Kaynaklı ve uygulanabilir içerikler
          </div>
          <h1 className="max-w-3xl font-outfit text-4xl font-black leading-tight sm:text-6xl">
            Sağlıklı yaşamı karmaşıklaştırmadan anlayın.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Antrenman, beslenme, uyku, mobilite ve longevity hakkında sade rehberler. Tıbbi vaatler değil, sürdürülebilir alışkanlıklar.
          </p>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {blogArticles.map((article) => (
            <article key={article.slug} className="flex min-h-[280px] flex-col border border-slate-800 bg-slate-900/55 p-6">
              <div className="mb-5 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold" style={{ color: article.accent }}>{article.category}</span>
                <span className="flex items-center gap-1.5 text-slate-500"><Clock size={14} /> {article.readTime}</span>
              </div>
              <h2 className="font-outfit text-2xl font-bold leading-snug text-white">{article.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">{article.description}</p>
              <Link to={`/blog/${article.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-emerald-400">
                Rehberi oku <ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800/60 px-5 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-outfit text-2xl font-bold">Takibi uygulamada sadeleştirin</h2>
            <p className="mt-2 text-sm text-slate-400">Altı kişisel modül, beslenme ve longevity takibi tamamen ücretsiz.</p>
          </div>
          <Link to="/auth" className="inline-flex min-h-12 items-center gap-2 bg-orange-500 px-6 py-3 font-outfit text-sm font-bold text-white transition-colors hover:bg-orange-400">
            Ücretsiz başla <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
