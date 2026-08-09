import { useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_URL = 'https://fullbalance.app';

export default function EditorialPolicy() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Yayın İlkeleri ve İçerik Süreci | Full Balance';
    const description = 'Full Balance sağlık ve wellness rehberlerinin kaynak seçimi, hazırlama, güncelleme ve düzeltme ilkeleri.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${BASE_URL}/editorial-policy`);
    return () => { document.title = previousTitle; };
  }, []);

  const principles = [
    {
      icon: BookOpen,
      title: 'Kaynak seçimi',
      body: 'Önceliğimiz Dünya Sağlık Örgütü, ulusal sağlık kurumları, hakemli araştırmalar ve alanında yetkili meslek kuruluşları gibi birincil ve kurumsal kaynaklardır.',
    },
    {
      icon: ShieldCheck,
      title: 'Tıbbi sınırlar',
      body: 'İçerikler genel bilgilendirme içindir. Tanı, tedavi, kişiye özel tıbbi öneri veya sonuç garantisi verilmez. Uzman incelemesi yapılmışsa içerikte ayrıca belirtilir.',
    },
    {
      icon: CheckCircle2,
      title: 'Hazırlama süreci',
      body: 'Her rehber belirli bir kullanıcı sorusunu yanıtlamak için hazırlanır, kullanılan kaynaklar yazının sonunda gösterilir ve uygulamanın gerçek özellikleriyle tutarlı olması kontrol edilir.',
    },
    {
      icon: RefreshCw,
      title: 'Güncelleme ve düzeltme',
      body: 'Kaynaklarda veya uygulama özelliklerinde önemli bir değişiklik olduğunda içerik yeniden değerlendirilir. Maddi bir hata düzeltilirse güncelleme tarihi değiştirilir.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link to="/blog" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft size={18} /> Rehbere dön
          </Link>
          <span className="font-outfit text-sm font-bold text-emerald-400">Full Balance</span>
        </div>
      </header>

      <section className="border-b border-slate-800/60 px-5 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase text-emerald-400">Şeffaflık ve güven</p>
          <h1 className="mt-4 max-w-3xl font-outfit text-4xl font-black leading-tight sm:text-6xl">Yayın ilkelerimiz</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
            Full Balance rehberleri sağlıklı yaşam konularını sade ve uygulanabilir biçimde açıklamak için hazırlanır. Güvenilir kaynak, açık sınırlar ve düzeltilebilir içerik temel yaklaşımımızdır.
          </p>
        </div>
      </section>

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, body }) => (
            <article key={title} className="border border-slate-800 bg-slate-900/55 p-6">
              <Icon size={22} className="text-emerald-400" />
              <h2 className="mt-4 font-outfit text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800/60 px-5 py-10">
        <div className="mx-auto flex max-w-4xl items-start gap-3">
          <Mail size={20} className="mt-1 shrink-0 text-orange-400" />
          <div>
            <h2 className="font-outfit text-lg font-bold">Bir hata mı gördünüz?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Kaynak, doğruluk veya anlatımla ilgili geri bildiriminizi <a className="font-semibold text-white underline underline-offset-4" href="mailto:info@fullbalance.app">info@fullbalance.app</a> adresine iletebilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
