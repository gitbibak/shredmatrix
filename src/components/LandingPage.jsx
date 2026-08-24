import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, BarChart3, BookOpen, Brain, Check,
  ChevronRight, CircleDot, Cog, CreditCard, Dumbbell, Flame,
  HeartPulse, Languages, Leaf, Lock, Salad, ShieldCheck,
  Sparkles, Sun, Target, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { trackLandingCta, trackShare } from '../lib/analytics';
import { MODULE_IMAGES } from '../data/moduleAssets';
import { buildTrackedShareUrl } from '../lib/shareLinks';
import { getApprovedTestimonials } from '../lib/dataService';
import { recordAcquisitionContent } from '../lib/acquisition';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: delay * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const copy = {
  tr: {
    navCta: 'Ücretsiz başla',
    freeBadge: 'Tamamen ücretsiz · Kredi kartı gerekmez',
    heroTitle: 'Ücretsiz kişisel fitness ve wellness uygulaması',
    heroDesc: 'Kas gelişimi, yağ yakımı, yoga, meditasyon, reformer ve pilates için kişisel planlar; beslenme, ilerleme ve longevity dengesiyle tek yerde.',
    primaryCta: 'Ücretsiz hesabını oluştur',
    share: 'Arkadaşına gönder',
    copied: 'Bağlantı kopyalandı',
    freeNote: 'Abonelik yok · premium duvarı yok · gizli ücret yok',
    previewEyebrow: 'Tek sakin akış',
    previewTitle: 'Planını uygula, alışkanlıklarını gör, ilerlemeni takip et.',
    previewDesc: 'Full Balance farklı araçlara dağılmadan antrenman, öğün, su, uyku ve vücut gelişimini aynı kişisel panelde birleştirir.',
    goalsEyebrow: '6 kişisel hedef',
    goalsTitle: 'Sana uygun başlangıç noktasını seç',
    goalsDesc: 'Her hedef başlangıç, orta, ileri ve usta seviyelerine göre farklı planlanır. Hedefini daha sonra değiştirebilirsin.',
    includedEyebrow: 'Programdan fazlası',
    includedTitle: 'Beslenme, ilerleme ve longevity birlikte çalışır',
    includedDesc: 'Yeni formlar doldurmak yerine mevcut günlük kayıtların anlamlı bir görünümde birleşir.',
    nutritionTitle: 'Kişisel beslenme',
    nutritionDesc: 'Kalori ve makro hedefleri, 7 günlük menü, bütçe seçenekleri, sağlık ve alerji bilgilerine göre uyarlama.',
    progressTitle: 'Anlaşılır ilerleme',
    progressDesc: 'Kilo, ölçü, fotoğraf, antrenman, su ve uyku eğilimleri; Excel ve rapor çıktısı dahil.',
    longevityTitle: 'Longevity dengesi',
    longevityDesc: 'Hareket, kuvvet, mobilite, toparlanma ve beslenme alışkanlıklarını beş şeffaf başlıkta izle.',
    longevityNote: 'Biyolojik yaş veya yaşam süresi tahmini yapmaz; yalnızca kaydettiğin alışkanlıkları anlamlandırır.',
    freeTitle: 'Gerçekten ücretsiz ne demek?',
    freeDesc: 'Temel özellikleri göstermek için ödeme istemiyoruz. Full Balance’ın kişisel planları ve takip araçları ücretsiz kullanılabilir.',
    freeItems: ['Kredi kartı istenmez', 'Abonelik ve deneme süresi yok', '6 hedefin tamamı açık', 'Beslenme ve longevity dahil', 'Verilerini dışa aktarabilirsin', 'Türkçe, İngilizce ve İspanyolca'],
    stepsEyebrow: 'Basit başlangıç',
    stepsTitle: 'Üç adımda kişisel planın hazır',
    steps: [
      ['Hedefini seç', 'Altı hedeften birini ve deneyim seviyeni seç.'],
      ['Temel bilgilerini gir', 'Plan için gereken kısa bilgileri, sağlık ve alerji tercihlerini tamamla.'],
      ['Bugünden başla', 'Antrenmanını ve beslenmeni gör; ilerledikçe önerilerin güncellensin.'],
    ],
    guidesEyebrow: 'Kaynaklı rehberler',
    guidesTitle: 'Neyi neden yaptığını da öğren',
    guidesDesc: 'Longevity, kuvvet, uyku ve mobilite konularını sade, uygulanabilir ve kaynaklı içeriklerle açıklıyoruz.',
    readGuide: 'Rehberi oku',
    allGuides: 'Tüm rehberler',
    stats: ['hedef', 'program', 'ücretsiz'],
    guideTitles: ['Longevity Nedir? Sağlıklı Yaşamı Destekleyen 5 Temel Alışkanlık', 'Kuvvet Antrenmanı ve Sağlıklı Yaş Alma', 'Uyku, Toparlanma ve Longevity'],
    finalTitle: 'Sağlıklı rutinini bugün ücretsiz kur',
    finalDesc: 'Tek hedef seç, kısa bilgilerini gir ve kişisel planını kullanmaya başla.',
    footerMedical: 'Full Balance tıbbi tanı veya tedavi aracı değildir. Sağlık durumuna uygun kararlar için sağlık uzmanına danış.',
  },
  en: {
    navCta: 'Start free', freeBadge: 'Completely free · No credit card', heroTitle: 'Your free personal fitness and wellness app',
    heroDesc: 'Personal plans for muscle growth, fat loss, yoga, meditation, reformer and pilates, combined with nutrition, progress and longevity balance.',
    primaryCta: 'Create your free account', share: 'Share with a friend', copied: 'Link copied', freeNote: 'No subscription · no paywall · no hidden fees',
    previewEyebrow: 'One calm flow', previewTitle: 'Follow your plan, understand your habits and track progress.', previewDesc: 'Full Balance brings workouts, meals, water, sleep and body progress into one personal dashboard.',
    goalsEyebrow: '6 personal goals', goalsTitle: 'Choose the right place to begin', goalsDesc: 'Each goal has foundation, intermediate, advanced and master plans. You can change your goal later.',
    includedEyebrow: 'More than a program', includedTitle: 'Nutrition, progress and longevity work together', includedDesc: 'Your existing daily records become one meaningful view without extra forms.',
    nutritionTitle: 'Personal nutrition', nutritionDesc: 'Calories, macros, weekly menus, budget options and adjustments for health and allergy information.',
    progressTitle: 'Clear progress', progressDesc: 'Weight, measurements, photos, workouts, water and sleep trends, including Excel and report export.',
    longevityTitle: 'Longevity balance', longevityDesc: 'Track movement, strength, mobility, recovery and nutrition across five transparent pillars.', longevityNote: 'It does not predict biological age or lifespan; it only helps you understand recorded habits.',
    freeTitle: 'What does truly free mean?', freeDesc: 'We do not ask for payment to reveal essential features. Personal plans and tracking tools are free to use.',
    freeItems: ['No credit card', 'No subscription or trial', 'All 6 goals unlocked', 'Nutrition and longevity included', 'Export your data', 'Turkish, English and Spanish'],
    stepsEyebrow: 'Simple start', stepsTitle: 'Your personal plan in three steps', steps: [['Choose your goal', 'Select one of six goals and your experience level.'], ['Add the essentials', 'Complete the short profile, health and allergy preferences.'], ['Start today', 'See your workout and nutrition plan; recommendations adapt as you progress.']],
    guidesEyebrow: 'Sourced guides', guidesTitle: 'Understand why each habit matters', guidesDesc: 'Clear, practical and sourced guides on longevity, strength, sleep and mobility.', readGuide: 'Read guide',
    allGuides: 'All guides', stats: ['goals', 'programs', 'free'],
    guideTitles: ['What Is Longevity? 5 Habits That Support Healthy Living', 'Strength Training for Healthy Aging', 'Sleep, Recovery and Longevity'],
    finalTitle: 'Build your healthy routine for free today', finalDesc: 'Choose one goal, add the essentials and start using your personal plan.', footerMedical: 'Full Balance is not a medical diagnosis or treatment tool. Consult a health professional for decisions related to your condition.',
  },
  es: {
    navCta: 'Empieza gratis', freeBadge: 'Totalmente gratis · Sin tarjeta', heroTitle: 'Tu aplicación personal gratuita de fitness y bienestar',
    heroDesc: 'Planes para ganar músculo, perder grasa, yoga, meditación, reformer y pilates, junto con nutrición, progreso y equilibrio de longevidad.',
    primaryCta: 'Crea tu cuenta gratis', share: 'Compartir', copied: 'Enlace copiado', freeNote: 'Sin suscripción · sin muro de pago · sin costes ocultos',
    previewEyebrow: 'Un flujo sencillo', previewTitle: 'Sigue tu plan, comprende tus hábitos y controla tu progreso.', previewDesc: 'Full Balance reúne entrenamiento, comidas, agua, sueño y progreso corporal en un panel personal.',
    goalsEyebrow: '6 objetivos personales', goalsTitle: 'Elige el punto de partida adecuado', goalsDesc: 'Cada objetivo incluye niveles inicial, intermedio, avanzado y maestro. Puedes cambiarlo después.',
    includedEyebrow: 'Más que un programa', includedTitle: 'Nutrición, progreso y longevidad unidos', includedDesc: 'Tus registros diarios forman una vista útil sin formularios adicionales.',
    nutritionTitle: 'Nutrición personal', nutritionDesc: 'Calorías, macros, menú semanal, presupuesto y ajustes según salud y alergias.',
    progressTitle: 'Progreso claro', progressDesc: 'Peso, medidas, fotos, entrenamientos, agua y sueño, con exportación Excel e informes.',
    longevityTitle: 'Equilibrio de longevidad', longevityDesc: 'Observa movimiento, fuerza, movilidad, recuperación y nutrición en cinco pilares transparentes.', longevityNote: 'No predice edad biológica ni longevidad; solo interpreta los hábitos registrados.',
    freeTitle: '¿Qué significa realmente gratis?', freeDesc: 'No pedimos pagos para mostrar funciones esenciales. Los planes y herramientas de seguimiento son gratuitos.',
    freeItems: ['Sin tarjeta', 'Sin suscripción ni prueba', 'Los 6 objetivos abiertos', 'Nutrición y longevidad incluidas', 'Exporta tus datos', 'Turco, inglés y español'],
    stepsEyebrow: 'Inicio sencillo', stepsTitle: 'Tu plan personal en tres pasos', steps: [['Elige tu objetivo', 'Selecciona uno de seis objetivos y tu nivel.'], ['Añade lo esencial', 'Completa el perfil breve y tus preferencias de salud y alergias.'], ['Empieza hoy', 'Consulta entrenamiento y nutrición; las recomendaciones se adaptan a tu progreso.']],
    guidesEyebrow: 'Guías con fuentes', guidesTitle: 'Comprende por qué importa cada hábito', guidesDesc: 'Guías claras y prácticas sobre longevidad, fuerza, sueño y movilidad.', readGuide: 'Leer guía',
    allGuides: 'Todas las guías', stats: ['objetivos', 'programas', 'gratis'],
    guideTitles: ['¿Qué es la longevidad? 5 hábitos para una vida saludable', 'Entrenamiento de fuerza para un envejecimiento saludable', 'Sueño, recuperación y longevidad'],
    finalTitle: 'Crea hoy tu rutina saludable gratis', finalDesc: 'Elige un objetivo, añade lo esencial y empieza tu plan personal.', footerMedical: 'Full Balance no es una herramienta de diagnóstico ni tratamiento. Consulta a un profesional de salud.',
  },
};

const goalAssets = {
  muscle: MODULE_IMAGES.muscle,
  fatburn: MODULE_IMAGES.fat_loss,
  yoga: MODULE_IMAGES.yoga,
  meditation: MODULE_IMAGES.meditation,
  reformer: MODULE_IMAGES.reformer,
  pilates: MODULE_IMAGES.pilates,
};

function Eyebrow({ children }) {
  return <p className="mb-3 text-xs font-bold uppercase text-emerald-400">{children}</p>;
}

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="mb-9 max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-outfit text-3xl font-extrabold leading-tight text-white sm:text-4xl">{title}</h2>
      {desc && <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">{desc}</p>}
    </div>
  );
}

export default function LandingPage({ onStart }) {
  const { t, lang, setLang, langFlags, SUPPORTED } = useTranslation();
  const [shareCopied, setShareCopied] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const c = copy[lang] || copy.tr;

  useEffect(() => {
    getApprovedTestimonials(6).then(setTestimonials).catch(() => setTestimonials([]));
  }, []);

  const goals = [
    { key: 'muscle', icon: Dumbbell, color: '#f97316', fallback: 'Kas Gelişimi' },
    { key: 'fatburn', icon: Flame, color: '#ef4444', fallback: 'Yağ Yakımı' },
    { key: 'yoga', icon: Sun, color: '#eab308', fallback: 'Yoga' },
    { key: 'meditation', icon: Brain, color: '#a855f7', fallback: 'Meditasyon' },
    { key: 'reformer', icon: Cog, color: '#22c55e', fallback: 'Reformer' },
    { key: 'pilates', icon: CircleDot, color: '#06b6d4', fallback: 'Pilates' },
  ];

  const guides = [
    { slug: 'longevity-nedir-saglikli-yasam-aliskanliklari', image: '/images/blog/longevity-habits.jpg', title: c.guideTitles[0] },
    { slug: 'kuvvet-antrenmani-ve-saglikli-yaslanma', image: '/images/blog/strength-healthy-aging.jpg', title: c.guideTitles[1] },
    { slug: 'uyku-toparlanma-ve-longevity', image: '/images/blog/sleep-recovery.jpg', title: c.guideTitles[2] },
  ];

  const handleShare = async () => {
    const shareData = {
      title: 'Full Balance',
      text: c.heroDesc,
      url: buildTrackedShareUrl({
        language: lang,
        source: 'website_share',
        medium: 'organic',
        campaign: `landing_share_${lang}`,
      }),
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        trackShare('native_landing');
        return;
      }
      await navigator.clipboard?.writeText(shareData.url);
      setShareCopied(true);
      trackShare('copy_landing');
      setTimeout(() => setShareCopied(false), 2200);
    } catch (error) {
      console.warn('[LandingPage]', error?.message || error);
    }
  };

  const startRegistration = (placement) => {
    recordAcquisitionContent(`landing_${lang}_${placement}`);
    trackLandingCta(placement);
    onStart();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl safe-area-top">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-1.5" aria-label="Full Balance ana sayfa">
            <Sparkles size={18} className="text-orange-500" />
            <span className="whitespace-nowrap font-outfit text-xs font-extrabold text-white sm:text-base">FULL <span className="text-cyan-400">BALANCE</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center" aria-label="Language">
              {SUPPORTED.map((code) => (
                <button key={code} onClick={() => setLang(code)} className={`h-8 w-7 text-xs sm:w-8 sm:text-sm ${lang === code ? 'opacity-100' : 'opacity-40 hover:opacity-75'}`} title={code.toUpperCase()}>{langFlags[code]}</button>
              ))}
            </div>
            <button onClick={() => startRegistration('navigation')} className="min-h-10 bg-orange-500 px-3 font-outfit text-xs font-bold text-white hover:bg-orange-400 sm:px-4">{c.navCta}</button>
          </div>
        </div>
      </nav>

      <header className="relative flex min-h-[760px] items-end overflow-hidden border-b border-white/10 pt-24 sm:min-h-[820px]">
        <img src="/images/blog/longevity-habits.jpg" alt="Full Balance ile hareket, beslenme ve sağlıklı yaşam alışkanlıkları" className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/20" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 sm:px-6 sm:pb-24">
          <motion.div initial="hidden" animate="visible" className="max-w-4xl">
            <motion.p custom={0} variants={fadeUp} className="mb-5 inline-flex items-center gap-2 border border-emerald-400/40 bg-emerald-950/75 px-3 py-2 text-xs font-bold text-emerald-300">
              <CreditCard size={15} /> {c.freeBadge}
            </motion.p>
            <motion.h1 custom={1} variants={fadeUp} className="max-w-4xl break-words font-outfit text-4xl font-black leading-[1.06] text-white sm:text-6xl lg:text-7xl">{c.heroTitle}</motion.h1>
            <motion.p custom={2} variants={fadeUp} className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-xl">{c.heroDesc}</motion.p>
            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button onClick={() => startRegistration('hero')} className="inline-flex min-h-14 w-full items-center justify-center gap-2 bg-orange-500 px-7 font-outfit text-sm font-bold text-white hover:bg-orange-400 sm:w-auto">{c.primaryCta}<ChevronRight size={18} /></button>
              <button onClick={handleShare} className="inline-flex min-h-14 w-full items-center justify-center gap-2 border border-white/25 bg-slate-950/55 px-6 font-outfit text-sm font-bold text-white hover:border-cyan-400/60 sm:w-auto"><ArrowRight size={17} />{shareCopied ? c.copied : c.share}</button>
            </motion.div>
            <motion.p custom={4} variants={fadeUp} className="mt-4 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck size={15} className="text-emerald-400" /> {c.freeNote}</motion.p>
          </motion.div>
        </div>
      </header>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Eyebrow>{c.previewEyebrow}</Eyebrow>
            <h2 className="font-outfit text-3xl font-extrabold leading-tight sm:text-4xl">{c.previewTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{c.previewDesc}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-800 pt-5 text-center">
              <div><strong className="block text-xl text-white">6</strong><span className="text-xs text-slate-500">{c.stats[0]}</span></div>
              <div><strong className="block text-xl text-white">24</strong><span className="text-xs text-slate-500">{c.stats[1]}</span></div>
              <div><strong className="block text-xl text-emerald-400">%100</strong><span className="text-xs text-slate-500">{c.stats[2]}</span></div>
            </div>
          </div>
          <img src={lang === 'tr' ? '/og/full-balance-og-tr.png' : '/og/full-balance-og-en.png'} alt="Full Balance beslenme, kalori, su ve ilerleme paneli" width="1200" height="630" className="w-full border border-slate-800 object-cover" />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionTitle eyebrow={c.goalsEyebrow} title={c.goalsTitle} desc={c.goalsDesc} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {goals.map((goal, index) => {
              const Icon = goal.icon;
              const translated = t(`landing.goals.${goal.key}.title`);
              const title = translated && translated !== `landing.goals.${goal.key}.title` ? translated : goal.fallback;
              return (
                <motion.article key={goal.key} custom={index} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group overflow-hidden border border-slate-800 bg-slate-900/55">
                  <img src={goalAssets[goal.key]} alt={title} width="1600" height="900" loading="lazy" className="aspect-[4/3] w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
                  <div className="p-4">
                    <Icon size={19} style={{ color: goal.color }} />
                    <h3 className="mt-3 break-words font-outfit text-sm font-bold text-white">{title}</h3>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/35 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionTitle eyebrow={c.includedEyebrow} title={c.includedTitle} desc={c.includedDesc} />
          <div className="grid gap-px overflow-hidden border border-slate-800 bg-slate-800 md:grid-cols-3">
            {[
              { icon: Salad, color: 'text-emerald-400', title: c.nutritionTitle, desc: c.nutritionDesc },
              { icon: TrendingUp, color: 'text-cyan-400', title: c.progressTitle, desc: c.progressDesc },
              { icon: HeartPulse, color: 'text-rose-400', title: c.longevityTitle, desc: c.longevityDesc },
            ].map((item) => (
              <article key={item.title} className="bg-slate-950 p-6 sm:p-8">
                <item.icon size={26} className={item.color} />
                <h3 className="mt-5 font-outfit text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.desc}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 border-l-2 border-emerald-500 bg-emerald-500/5 p-4 text-sm leading-6 text-slate-400">
            <Activity size={19} className="mt-0.5 shrink-0 text-emerald-400" />
            <p>{c.longevityNote} <Link to="/blog/longevity-nedir-saglikli-yasam-aliskanliklari" className="font-semibold text-emerald-400 underline underline-offset-4">{c.readGuide}</Link></p>
          </div>
        </div>
      </section>

      {testimonials.some((item) => item.language === lang) && (
        <section className="border-b border-slate-800 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <SectionTitle eyebrow={lang === 'tr' ? 'Gerçek deneyimler' : lang === 'es' ? 'Experiencias reales' : 'Real experiences'} title={lang === 'tr' ? 'Full Balance kullananlardan' : lang === 'es' ? 'De quienes usan Full Balance' : 'From people using Full Balance'} />
            <div className="grid gap-3 md:grid-cols-3">
              {testimonials.filter((item) => item.language === lang).slice(0, 3).map((item) => (
                <article key={item.id} className="border border-slate-800 bg-slate-900/55 p-5">
                  <div className="text-sm text-amber-400" aria-label={`${item.rating}/5`}>{'★'.repeat(item.rating)}</div>
                  {item.result_summary && <p className="mt-3 text-xs font-bold text-cyan-300">{item.result_summary}</p>}
                  <p className="mt-3 text-sm leading-6 text-slate-300">“{item.body}”</p>
                  <p className="mt-4 text-[10px] uppercase text-slate-600">{lang === 'tr' ? 'Doğrulanmış kullanıcı · anonim' : 'Verified user · anonymous'}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow>{lang === 'tr' ? '%100 ücretsiz' : lang === 'es' ? '100% gratis' : '100% free'}</Eyebrow>
            <h2 className="font-outfit text-3xl font-extrabold leading-tight sm:text-4xl">{c.freeTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{c.freeDesc}</p>
            <button onClick={() => startRegistration('free_section')} className="mt-7 inline-flex min-h-12 items-center gap-2 bg-emerald-500 px-6 font-outfit text-sm font-bold text-slate-950 hover:bg-emerald-400">{c.primaryCta}<ArrowRight size={17} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {c.freeItems.map((item) => <div key={item} className="flex min-h-16 items-center gap-3 border border-slate-800 bg-slate-900/45 px-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-500/10"><Check size={17} className="text-emerald-400" /></span><span className="text-sm text-slate-300">{item}</span></div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/35 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionTitle eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
          <div className="grid gap-4 md:grid-cols-3">
            {c.steps.map(([title, desc], index) => (
              <article key={title} className="border-t-2 border-orange-500 bg-slate-950 p-6">
                <span className="text-xs font-black text-orange-400">0{index + 1}</span>
                <h3 className="mt-5 font-outfit text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionTitle eyebrow={c.guidesEyebrow} title={c.guidesTitle} desc={c.guidesDesc} />
            <Link to="/blog" className="mb-9 inline-flex items-center gap-2 text-sm font-bold text-emerald-400">{c.allGuides}<ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.slug} to={`/blog/${guide.slug}`} className="group overflow-hidden border border-slate-800 bg-slate-900/50">
                <img src={guide.image} alt="" width="1600" height="900" loading="lazy" className="aspect-video w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
                <div className="p-5"><BookOpen size={18} className="text-emerald-400" /><h3 className="mt-3 font-outfit text-lg font-bold leading-snug text-white">{guide.title}</h3><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-emerald-400">{c.readGuide}<ArrowRight size={14} /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/35 px-5 py-16 text-center sm:py-24">
        <Leaf size={30} className="mx-auto text-emerald-400" />
        <h2 className="mx-auto mt-5 max-w-3xl font-outfit text-3xl font-extrabold leading-tight sm:text-5xl">{c.finalTitle}</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">{c.finalDesc}</p>
        <button onClick={() => startRegistration('final')} className="mt-8 inline-flex min-h-14 items-center gap-2 bg-orange-500 px-8 font-outfit text-sm font-bold text-white hover:bg-orange-400">{c.primaryCta}<ChevronRight size={18} /></button>
        <p className="mt-4 text-xs text-emerald-400">{c.freeNote}</p>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><Sparkles size={16} className="text-orange-500" /><span className="font-outfit text-sm font-bold">FULL BALANCE</span></div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-white">{t('auth.privacyLink') || 'Gizlilik'}</Link>
              <Link to="/terms" className="hover:text-white">{t('auth.termsLink') || 'Koşullar'}</Link>
              <Link to="/contact" className="hover:text-white">{t('contact.link') || 'İletişim'}</Link>
              <Link to="/editorial-policy" className="hover:text-white">{lang === 'tr' ? 'Yayın ilkeleri' : 'Editorial policy'}</Link>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-600"><Lock size={13} className="mt-0.5 shrink-0" /><p>{c.footerMedical}</p></div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-700"><Languages size={13} /> TR · EN · ES</div>
        </div>
      </footer>
    </div>
  );
}
