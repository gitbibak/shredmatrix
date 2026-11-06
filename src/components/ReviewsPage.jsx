import { useEffect } from 'react';
import ApprovedTestimonials from './ApprovedTestimonials';
import { reviewPages } from '../data/reviewPages';

const WRITE = { tr: 'Sen de yorum yaz', en: 'Write your own review', es: 'Escribe tu reseña' };

export default function ReviewsPage({ language = 'tr' }) {
  const page = reviewPages.find((entry) => entry.lang === language) || reviewPages[0];
  useEffect(() => {
    const previous = document.title;
    document.title = page.title + ' | Full Balance';
    return () => { document.title = previous; };
  }, [page]);
  return <main className="min-h-screen bg-slate-950 py-8 text-white">
    <header className="mx-auto max-w-6xl px-5">
      <a href={page.lang === 'tr' ? '/' : '/' + page.lang} className="inline-flex min-h-11 items-center text-sm text-cyan-300">Full Balance · {page.home}</a>
      <h1 className="mt-6 font-outfit text-3xl font-bold">{page.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{page.description}</p>
      <a href="/dashboard?tab=profile&review=1" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-cyan-600 px-4 text-sm font-bold text-white hover:bg-cyan-500">{WRITE[page.lang] || WRITE.en}</a>
    </header>
    <ApprovedTestimonials key={page.lang} language={page.lang} all />
  </main>;
}
