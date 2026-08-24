import { useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Code2, Compass, Layers3, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const BASE_URL = 'https://fullbalance.app';

const pageCopy = {
  tr: {
    locale: 'tr-TR',
    path: '/kurucu-tolga-deveci',
    home: 'Ana sayfaya dön',
    eyebrow: 'Full Balance kurucusu ve geliştiricisi',
    title: 'Tolga Deveci',
    intro: 'Full Balance, Tolga Deveci tarafından kurulan ve geliştirilen bağımsız, tamamen ücretsiz bir kişisel fitness ve wellness uygulamasıdır.',
    summaryTitle: 'Full Balance’ı kim geliştirdi?',
    summary: 'Full Balance’ın kurucusu ve yazılım geliştiricisi Tolga Deveci’dir. Ürünün planlama, kullanıcı deneyimi, yazılım geliştirme ve sürekli iyileştirme süreçlerini yürütür.',
    roleTitle: 'Projede üstlendiği rol',
    roleBody: 'Tolga Deveci; ürün fikrinin uygulamaya dönüşmesi, mobil ve web deneyiminin geliştirilmesi, kişiselleştirme altyapısı, veri güvenliği, performans ve kullanıcı geri bildirimlerine göre yapılan iyileştirmelerden sorumludur.',
    productTitle: 'Geliştirdiği ürün ne sunuyor?',
    productBody: 'Full Balance; kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates için hedef odaklı planları beslenme, su, uyku, ilerleme ve longevity alışkanlık takibiyle birleştirir.',
    items: [
      'Evde ekipmansız, evde temel ekipmanlı ve salon ortamına uygun antrenman planları',
      'Hedef, deneyim, günlük yaşam ve kullanıcı tercihlerine göre kişiselleştirme',
      'Beslenme, kalori, makro, su, uyku ve vücut gelişimi takibi',
      'Türkçe, İngilizce ve İspanyolca kullanım',
      'Kredi kartı, abonelik veya premium duvarı olmadan ücretsiz erişim',
    ],
    purposeTitle: 'Ürün yaklaşımı',
    purposeBody: 'Full Balance’ın amacı, farklı uygulamalara dağılmış günlük sağlık ve fitness araçlarını daha sade bir akışta birleştirmektir. Kullanıcı önce bugünkü ana görevini görür; ayrıntılara yalnızca ihtiyaç duyduğunda ulaşır.',
    boundaryTitle: 'Açık sınırlar',
    boundaryBody: 'Tolga Deveci ürünün kurucusu ve yazılım geliştiricisidir; sağlık uzmanı olarak tanıtılmaz. Full Balance tıbbi tanı veya tedavi aracı değildir. Sağlık içerikleri kaynaklı genel bilgilendirme olarak sunulur ve yayın ilkelerinde belirtilen sınırlar uygulanır.',
    factsTitle: 'Kısa bilgiler',
    facts: [
      ['Kurucu ve geliştirici', 'Tolga Deveci'],
      ['Ürün', 'Full Balance'],
      ['Kategori', 'Fitness, beslenme ve wellness'],
      ['Erişim', 'Tamamen ücretsiz web ve PWA uygulaması'],
      ['Resmî adres', 'fullbalance.app'],
    ],
    contactTitle: 'İletişim',
    contactBody: 'Full Balance, ürün geliştirme veya basın konularındaki sorular için:',
    policy: 'Yayın ilkelerini incele',
    cta: 'Full Balance’ı ücretsiz kullan',
    metaTitle: 'Tolga Deveci — Full Balance Kurucusu ve Geliştiricisi',
    description: 'Tolga Deveci, tamamen ücretsiz kişisel fitness, beslenme ve wellness uygulaması Full Balance’ın kurucusu ve yazılım geliştiricisidir.',
  },
  en: {
    locale: 'en-US',
    path: '/en/founder-tolga-deveci',
    home: 'Back to home',
    eyebrow: 'Founder and developer of Full Balance',
    title: 'Tolga Deveci',
    intro: 'Full Balance is an independent, completely free personal fitness and wellness application founded and developed by Tolga Deveci.',
    summaryTitle: 'Who developed Full Balance?',
    summary: 'Tolga Deveci is the founder and software developer of Full Balance. He leads the product planning, user experience, software development and continuous improvement process.',
    roleTitle: 'His role in the project',
    roleBody: 'Tolga Deveci is responsible for turning the product idea into a working application, developing its mobile and web experience, personalization infrastructure, data security, performance and improvements based on user feedback.',
    productTitle: 'What does the product provide?',
    productBody: 'Full Balance combines goal-based plans for muscle growth, fat loss, yoga, meditation, reformer and Pilates with nutrition, water, sleep, progress and longevity habit tracking.',
    items: [
      'Workout plans for no-equipment home training, basic home equipment and gym environments',
      'Personalization based on goals, experience, daily context and user preferences',
      'Nutrition, calories, macros, water, sleep and body progress tracking',
      'Turkish, English and Spanish interfaces',
      'Free access without a credit card, subscription or premium paywall',
    ],
    purposeTitle: 'Product approach',
    purposeBody: 'Full Balance is designed to bring daily fitness and wellness tools that are usually spread across different apps into one simpler flow. Users see their main task for today first and open additional detail only when needed.',
    boundaryTitle: 'Clear boundaries',
    boundaryBody: 'Tolga Deveci is presented as the product founder and software developer, not as a healthcare professional. Full Balance is not a medical diagnosis or treatment tool. Health content is general, sourced information governed by the published editorial policy.',
    factsTitle: 'Quick facts',
    facts: [
      ['Founder and developer', 'Tolga Deveci'],
      ['Product', 'Full Balance'],
      ['Category', 'Fitness, nutrition and wellness'],
      ['Access', 'Completely free web and PWA application'],
      ['Official website', 'fullbalance.app'],
    ],
    contactTitle: 'Contact',
    contactBody: 'For questions about Full Balance, product development or press:',
    policy: 'Read the editorial policy',
    cta: 'Use Full Balance for free',
    metaTitle: 'Tolga Deveci — Founder and Developer of Full Balance',
    description: 'Tolga Deveci is the founder and software developer of Full Balance, a completely free personal fitness, nutrition and wellness application.',
  },
  es: {
    locale: 'es-ES',
    path: '/es/fundador-tolga-deveci',
    home: 'Volver al inicio',
    eyebrow: 'Fundador y desarrollador de Full Balance',
    title: 'Tolga Deveci',
    intro: 'Full Balance es una aplicación personal e independiente de fitness y bienestar, completamente gratuita, fundada y desarrollada por Tolga Deveci.',
    summaryTitle: '¿Quién desarrolló Full Balance?',
    summary: 'Tolga Deveci es el fundador y desarrollador de software de Full Balance. Dirige la planificación del producto, la experiencia de usuario, el desarrollo y la mejora continua.',
    roleTitle: 'Su función en el proyecto',
    roleBody: 'Tolga Deveci es responsable de convertir la idea en una aplicación funcional, desarrollar la experiencia móvil y web, la infraestructura de personalización, la seguridad de datos, el rendimiento y las mejoras basadas en comentarios de usuarios.',
    productTitle: '¿Qué ofrece el producto?',
    productBody: 'Full Balance combina planes para desarrollo muscular, pérdida de grasa, yoga, meditación, reformer y pilates con nutrición, agua, sueño, progreso y hábitos de longevidad.',
    items: [
      'Planes para entrenar en casa sin equipo, con equipo básico o en el gimnasio',
      'Personalización según objetivos, experiencia, contexto diario y preferencias',
      'Seguimiento de nutrición, calorías, macros, agua, sueño y progreso corporal',
      'Interfaz en turco, inglés y español',
      'Acceso gratuito sin tarjeta, suscripción ni muro premium',
    ],
    purposeTitle: 'Enfoque del producto',
    purposeBody: 'Full Balance reúne en un flujo sencillo herramientas de fitness y bienestar que suelen estar repartidas entre distintas aplicaciones. El usuario ve primero su tarea principal del día y abre más detalles solo cuando los necesita.',
    boundaryTitle: 'Límites claros',
    boundaryBody: 'Tolga Deveci se presenta como fundador y desarrollador del producto, no como profesional sanitario. Full Balance no diagnostica ni trata enfermedades. El contenido de salud es información general con fuentes y sigue la política editorial publicada.',
    factsTitle: 'Datos principales',
    facts: [
      ['Fundador y desarrollador', 'Tolga Deveci'],
      ['Producto', 'Full Balance'],
      ['Categoría', 'Fitness, nutrición y bienestar'],
      ['Acceso', 'Aplicación web y PWA completamente gratuita'],
      ['Sitio oficial', 'fullbalance.app'],
    ],
    contactTitle: 'Contacto',
    contactBody: 'Para consultas sobre Full Balance, desarrollo de producto o prensa:',
    policy: 'Consultar la política editorial',
    cta: 'Usar Full Balance gratis',
    metaTitle: 'Tolga Deveci — Fundador y Desarrollador de Full Balance',
    description: 'Tolga Deveci es el fundador y desarrollador de Full Balance, una aplicación gratuita de fitness, nutrición y bienestar personal.',
  },
};

function setMeta(selector, attributes, content) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function FounderPage() {
  const { pathname } = useLocation();
  const lang = pathname.startsWith('/en/') ? 'en' : pathname.startsWith('/es/') ? 'es' : 'tr';
  const c = pageCopy[lang];

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const previousCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const previousOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
    const previousOgDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
    const previousOgUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
    const canonical = `${BASE_URL}${c.path}`;
    document.title = c.metaTitle;
    document.documentElement.lang = lang;
    setMeta('meta[name="description"]', { name: 'description' }, c.description);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, c.metaTitle);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, c.description);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, canonical);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);

    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.dataset.founderSchema = 'true';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': `${canonical}#profile`,
          url: canonical,
          name: c.metaTitle,
          description: c.description,
          inLanguage: c.locale,
          mainEntity: { '@id': `${BASE_URL}/#tolga-deveci` },
        },
        {
          '@type': 'Person',
          '@id': `${BASE_URL}/#tolga-deveci`,
          name: 'Tolga Deveci',
          jobTitle: lang === 'tr' ? 'Full Balance Kurucusu ve Yazılım Geliştiricisi' : lang === 'es' ? 'Fundador y Desarrollador de Software de Full Balance' : 'Founder and Software Developer of Full Balance',
          url: `${BASE_URL}/kurucu-tolga-deveci`,
          worksFor: { '@id': `${BASE_URL}/#organization` },
          knowsAbout: ['Software development', 'Product development', 'User experience', 'Fitness application development'],
        },
        {
          '@type': 'Organization',
          '@id': `${BASE_URL}/#organization`,
          name: 'Full Balance',
          url: `${BASE_URL}/`,
          logo: `${BASE_URL}/icon-512.png`,
          founder: { '@id': `${BASE_URL}/#tolga-deveci` },
        },
      ],
    });
    const hasStaticSchema = Boolean(document.querySelector('script[data-static-seo="true"]'));
    if (!hasStaticSchema) document.head.appendChild(schema);
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      document.querySelector('meta[name="description"]')?.setAttribute('content', previousDescription);
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', previousCanonical);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', previousOgTitle);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', previousOgDescription);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', previousOgUrl);
      if (!hasStaticSchema) schema.remove();
    };
  }, [c, lang]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link to={lang === 'tr' ? '/' : `/${lang}`} className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
            <ArrowLeft size={18} /> {c.home}
          </Link>
          <Link to="/" className="flex items-center gap-2 font-outfit text-sm font-bold"><Sparkles size={16} className="text-orange-500" /> FULL BALANCE</Link>
        </div>
      </header>

      <section className="border-b border-slate-800/60 px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase text-emerald-400">{c.eyebrow}</p>
          <h1 className="mt-4 font-outfit text-5xl font-black leading-none sm:text-7xl">{c.title}</h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">{c.intro}</p>
        </div>
      </section>

      <section className="px-5 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <article>
            <section>
              <Compass size={24} className="text-orange-400" />
              <h2 className="mt-4 font-outfit text-3xl font-bold">{c.summaryTitle}</h2>
              <p className="mt-4 text-base leading-8 text-slate-300">{c.summary}</p>
            </section>
            <section className="mt-12 border-t border-slate-800 pt-10">
              <Code2 size={24} className="text-cyan-400" />
              <h2 className="mt-4 font-outfit text-2xl font-bold">{c.roleTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">{c.roleBody}</p>
            </section>
            <section className="mt-12 border-t border-slate-800 pt-10">
              <Layers3 size={24} className="text-emerald-400" />
              <h2 className="mt-4 font-outfit text-2xl font-bold">{c.productTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">{c.productBody}</p>
              <ul className="mt-6 space-y-3">
                {c.items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300"><CheckCircle2 size={17} className="mt-1 shrink-0 text-emerald-400" />{item}</li>)}
              </ul>
            </section>
            <section className="mt-12 border-t border-slate-800 pt-10">
              <h2 className="font-outfit text-2xl font-bold">{c.purposeTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">{c.purposeBody}</p>
            </section>
            <section className="mt-12 border-t border-slate-800 pt-10">
              <ShieldCheck size={24} className="text-blue-400" />
              <h2 className="mt-4 font-outfit text-2xl font-bold">{c.boundaryTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">{c.boundaryBody}</p>
              <Link to="/editorial-policy" className="mt-5 inline-flex text-sm font-bold text-emerald-400 hover:text-emerald-300">{c.policy}</Link>
            </section>
          </article>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="border-t-2 border-orange-500 bg-slate-900/60 p-6 sm:p-7">
              <h2 className="font-outfit text-xl font-bold">{c.factsTitle}</h2>
              <dl className="mt-5 divide-y divide-slate-800">
                {c.facts.map(([label, value]) => <div key={label} className="py-4"><dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-200">{value}</dd></div>)}
              </dl>
            </div>
            <div className="mt-4 border border-slate-800 p-6 sm:p-7">
              <Mail size={21} className="text-cyan-400" />
              <h2 className="mt-4 font-outfit text-xl font-bold">{c.contactTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{c.contactBody}</p>
              <a href="mailto:info@fullbalance.app" className="mt-4 block break-all text-sm font-bold text-white underline underline-offset-4">info@fullbalance.app</a>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/35 px-5 py-12 text-center">
        <Link to="/auth?mode=register" className="inline-flex min-h-12 items-center justify-center bg-orange-500 px-7 font-outfit text-sm font-bold text-white hover:bg-orange-400">{c.cta}</Link>
      </section>
    </main>
  );
}
