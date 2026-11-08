import PricingComparison from './PricingComparison';
import { coachMarketing } from '../data/coachMarketing';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, BookOpen, Brain, Camera, Check,
  ChevronDown, ChevronRight, CircleDot, Cog, CreditCard, Dumbbell, Flame,
  House, Languages, Leaf, Lock, MapPin, PackageOpen, ShieldCheck,
  Sun,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';
import { trackLandingCta, trackShare } from '../lib/analytics';
import { MODULE_IMAGES } from '../data/moduleAssets';
import { pricingAlternates, pricingPages } from '../data/pricingPages';
import { blogArticles } from '../data/blogArticles';
import { getArticleLanguage, getArticlePath, getBlogPath } from '../data/blogLocale';
import OptimizedImage from './OptimizedImage';
import { buildTrackedShareUrl } from '../lib/shareLinks';
import ApprovedTestimonials from './ApprovedTestimonials';
import { recordAcquisitionContent } from '../lib/acquisition';
import SupportCard from './SupportCard';
import { storePriceHeadline } from '../data/storePrices';
import { CHALLENGE_PATHS } from '../i18n/challengeCopy';
import BrandMark from './BrandMark';

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
    metaTitle: 'Full Balance - Ücretsiz Fitness, Beslenme ve Longevity Uygulaması',
    metaDescription: 'Evde ekipmansız, temel ekipmanla veya salonda; 6 hedef modu, kişisel beslenme, su, uyku ve ilerleme takibi tamamen ücretsiz.',
    navCta: 'Ücretsiz başla',
    freeBadge: 'Tamamen ücretsiz · Kredi kartı gerekmez',
    heroTitle: 'Kişisel antrenman ve beslenme planın. Tamamen ücretsiz.',
    heroDesc: 'Hedefine, seviyene ve evindeki ekipmana göre hazırlanır. Antrenmanda setlerini işaretle, dinlenmeyi uygulama saysın; öğününün fotoğrafını çek, kalorisini gör.',
    primaryCta: 'Ücretsiz hesabını oluştur',
    share: 'Arkadaşına gönder',
    copied: 'Bağlantı kopyalandı',
    freeNote: 'Abonelik yok · premium duvarı yok · gizli ücret yok',
    homeEyebrow: 'Ortamına gerçekten uygun',
    homeTitle: 'Evde ne varsa, programında yalnızca o var.',
    homeDesc: 'Kayıt sırasında nerede çalışacağını seç. Full Balance egzersizlerini hedefin, seviyen, sağlık tercihlerin ve seçtiğin ortamla uyumlu hazırlar.',
    noEquipmentTitle: 'Evde · Ekipmansız',
    noEquipmentDesc: 'Vücut ağırlığı ve güvenli ev desteğiyle uygulanabilen hareketler. Salon makinesi veya sahip olmadığın ekipman verilmez.',
    equipmentTitle: 'Evde · Temel ekipman',
    equipmentDesc: 'Dambıl, direnç bandı ve mat gibi temel ekipmana göre hazırlanmış egzersizler ve uygun alternatifler.',
    homeVenueNote: 'Salonu seçersen program makine ve serbest ağırlıklara göre hazırlanır. Reformer gibi cihaz gerektiren hedeflerde yalnızca uygun ortam seçenekleri gösterilir.',
    homeCta: 'Ortamına uygun ücretsiz planı oluştur',
    goalsEyebrow: '6 kişisel hedef',
    goalsTitle: 'Sana uygun başlangıç noktasını seç',
    goalsDesc: 'Her hedef başlangıç, orta, ileri ve usta seviyelerine göre farklı planlanır. Hedefini daha sonra değiştirebilirsin.',
    longevityNote: 'Biyolojik yaş veya yaşam süresi tahmini yapmaz; yalnızca kaydettiğin alışkanlıkları anlamlandırır.',
    photoMealCta: 'Fotoğrafla ücretsiz dene',
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
    guidesDesc: 'Antrenman, beslenme ve sağlıklı yaşam konularını sade, uygulanabilir ve kaynaklı içeriklerle açıklıyoruz.',
    readGuide: 'Rehberi oku',
    allGuides: 'Tüm rehberler',
    finalTitle: 'Sağlıklı rutinini bugün ücretsiz kur',
    finalDesc: 'Tek hedef seç, kısa bilgilerini gir ve kişisel planını kullanmaya başla.',
    footerMedical: 'Full Balance tıbbi tanı veya tedavi aracı değildir. Sağlık durumuna uygun kararlar için sağlık uzmanına danış.',
    founderLink: 'Kurucu ve geliştirici', founderCredit: 'Full Balance, Tolga Deveci tarafından kurulan ve geliştirilen bağımsız bir projedir.',
  },
  en: {
    metaTitle: 'Full Balance - Free Fitness, Nutrition and Longevity App',
    metaDescription: 'Free personal plans for home workouts with or without equipment and gym training, plus nutrition, water, sleep and progress tracking.',
    navCta: 'Start free', freeBadge: 'Completely free · No credit card', heroTitle: 'Your personal workout and nutrition plan. Completely free.',
    heroDesc: 'Built for your goal, your level and the equipment you have at home. Tick off your sets while the app counts your rest; snap a meal and see its calories.',
    primaryCta: 'Create your free account', share: 'Share with a friend', copied: 'Link copied', freeNote: 'No subscription · no paywall · no hidden fees',
    homeEyebrow: 'Built for your actual setup', homeTitle: 'Your plan only uses what you have at home.', homeDesc: 'Choose where you train during signup. Full Balance adapts exercises to your goal, level, health preferences and selected environment.',
    noEquipmentTitle: 'Home · No equipment', noEquipmentDesc: 'Bodyweight movements and safe household support. No gym machine or equipment you do not own.',
    equipmentTitle: 'Home · Basic equipment', equipmentDesc: 'Exercises and practical alternatives for dumbbells, resistance bands and a mat.',
    homeVenueNote: 'Choose the gym for machine and free-weight programming. Equipment-specific goals such as reformer only show compatible environments.', homeCta: 'Create my free setup-based plan',
    goalsEyebrow: '6 personal goals', goalsTitle: 'Choose the right place to begin', goalsDesc: 'Each goal has foundation, intermediate, advanced and master plans. You can change your goal later.', longevityNote: 'It does not predict biological age or lifespan; it only helps you understand recorded habits.',
    photoMealCta: 'Try it free with a photo',
    freeTitle: 'What does truly free mean?', freeDesc: 'We do not ask for payment to reveal essential features. Personal plans and tracking tools are free to use.',
    freeItems: ['No credit card', 'No subscription or trial', 'All 6 goals unlocked', 'Nutrition and longevity included', 'Export your data', 'Turkish, English and Spanish'],
    stepsEyebrow: 'Simple start', stepsTitle: 'Your personal plan in three steps', steps: [['Choose your goal', 'Select one of six goals and your experience level.'], ['Add the essentials', 'Complete the short profile, health and allergy preferences.'], ['Start today', 'See your workout and nutrition plan; recommendations adapt as you progress.']],
    guidesEyebrow: 'Sourced guides', guidesTitle: 'Understand why each habit matters', guidesDesc: 'Clear, practical and sourced guides on training and nutrition.', readGuide: 'Read guide',
    allGuides: 'All guides',
    finalTitle: 'Build your healthy routine for free today', finalDesc: 'Choose one goal, add the essentials and start using your personal plan.', footerMedical: 'Full Balance is not a medical diagnosis or treatment tool. Consult a health professional for decisions related to your condition.',
    founderLink: 'Founder & developer', founderCredit: 'Full Balance is an independent product founded and developed by Tolga Deveci.',
  },
  es: {
    metaTitle: 'Full Balance - App Gratuita de Fitness, Nutrición y Longevidad',
    metaDescription: 'Planes personales gratis para entrenar en casa con o sin equipo o en el gimnasio, con nutrición, agua, sueño y seguimiento del progreso.',
    navCta: 'Empieza gratis', freeBadge: 'Totalmente gratis · Sin tarjeta', heroTitle: 'Tu plan personal de entrenamiento y nutrición. Totalmente gratis.',
    heroDesc: 'Se adapta a tu objetivo, tu nivel y el material que tienes en casa. Marca tus series mientras la app cuenta el descanso; fotografía tu comida y ve sus calorías.',
    primaryCta: 'Crea tu cuenta gratis', share: 'Compartir', copied: 'Enlace copiado', freeNote: 'Sin suscripción · sin muro de pago · sin costes ocultos',
    homeEyebrow: 'Creado para tu espacio real', homeTitle: 'Tu plan solo utiliza lo que tienes en casa.', homeDesc: 'Elige dónde entrenas durante el registro. Full Balance adapta los ejercicios a tu objetivo, nivel, preferencias de salud y entorno.',
    noEquipmentTitle: 'Casa · Sin equipo', noEquipmentDesc: 'Movimientos con peso corporal y apoyo doméstico seguro. Sin máquinas ni material que no tengas.',
    equipmentTitle: 'Casa · Equipo básico', equipmentDesc: 'Ejercicios y alternativas para mancuernas, bandas de resistencia y esterilla.',
    homeVenueNote: 'Elige gimnasio para usar máquinas y peso libre. Objetivos específicos como reformer solo muestran entornos compatibles.', homeCta: 'Crear mi plan gratuito según mi espacio',
    goalsEyebrow: '6 objetivos personales', goalsTitle: 'Elige el punto de partida adecuado', goalsDesc: 'Cada objetivo incluye niveles inicial, intermedio, avanzado y maestro. Puedes cambiarlo después.', longevityNote: 'No predice edad biológica ni longevidad; solo interpreta los hábitos registrados.',
    photoMealCta: 'Probar gratis con una foto',
    freeTitle: '¿Qué significa realmente gratis?', freeDesc: 'No pedimos pagos para mostrar funciones esenciales. Los planes y herramientas de seguimiento son gratuitos.',
    freeItems: ['Sin tarjeta', 'Sin suscripción ni prueba', 'Los 6 objetivos abiertos', 'Nutrición y longevidad incluidas', 'Exporta tus datos', 'Turco, inglés y español'],
    stepsEyebrow: 'Inicio sencillo', stepsTitle: 'Tu plan personal en tres pasos', steps: [['Elige tu objetivo', 'Selecciona uno de seis objetivos y tu nivel.'], ['Añade lo esencial', 'Completa el perfil breve y tus preferencias de salud y alergias.'], ['Empieza hoy', 'Consulta entrenamiento y nutrición; las recomendaciones se adaptan a tu progreso.']],
    guidesEyebrow: 'Guías con fuentes', guidesTitle: 'Comprende por qué importa cada hábito', guidesDesc: 'Guías claras y prácticas sobre nutrición y hábitos saludables.', readGuide: 'Leer guía',
    allGuides: 'Todas las guías',
    finalTitle: 'Crea hoy tu rutina saludable gratis', finalDesc: 'Elige un objetivo, añade lo esencial y empieza tu plan personal.', footerMedical: 'Full Balance no es una herramienta de diagnóstico ni tratamiento. Consulta a un profesional de salud.',
    founderLink: 'Fundador y desarrollador', founderCredit: 'Full Balance es un producto independiente fundado y desarrollado por Tolga Deveci.',
  },
};

// Sections added in the Nov 2026 landing refresh: real app screens, price
// strip, challenge banner and FAQ.
const more = {
  tr: {
    shotCaption: 'Gerçek uygulama ekranı · örnek verilerle',
    priceEyebrow: 'Ücret karşılaştırması',
    priceOthers: 'Benzer uygulamalarda yıllık abonelik',
    priceUpTo: 'en fazla',
    priceOurs: 'Full Balance\'ta her şey',
    priceNote: (h) => `Fiyatlar ${h.date} tarihinde ${h.store} sayfalarından okundu; bölge ve kampanyaya göre değişebilir.`,
    priceLink: 'Karşılaştırmayı gör',
    showEyebrow: 'Uygulamanın içi',
    showTitle: 'Kayıt olunca seni bunlar karşılıyor',
    showDesc: 'Aşağıdakiler gerçek uygulama ekranları. Tarayıcıda çalışır; telefonunda ana ekrana ekleyip uygulama gibi kullanırsın.',
    shots: [
      ['session', 'Antrenmanda ne yapacağını düşünme', ['Her hareket için animasyonlu anlatım ve teknik videosu', 'Kilonu ve tekrarını işaretle, önceki kilon hazır gelsin', 'Dinlenme sayacı kendiliğinden başlar', 'Yeni rekorların kutlanır']],
      ['today', 'Her gün tek, net bir odak', ['Bugünün antrenmanı tek dokunuşla başlar', 'Haftalık hedefin bir bakışta', 'Son 7 günün denge puanı: aktivite, toparlanma, tutarlılık', 'İstersen hatırlatıcı kur']],
      ['nutrition', 'Beslenmen antrenman gününe göre değişir', ['Her güne özel kalori ve makro hedefi', '7 günlük menü; bütçe, sağlık ve alerji seçenekleri', 'Öğününün fotoğrafını çek, kalori aralığını gör']],
      ['progress', 'Gelişimini sayılarla gör', ['Kilo, ölçü ve yağ oranı grafikleri', 'Raporlar ve Excel çıktısı', 'Antrenman, su ve uyku alışkanlıkların tek yerde']],
    ],
    challengeEyebrow: '28 günlük challenge',
    challengeTitle: '28 günde 12 antrenman. Ücretsiz katıl.',
    challengeDesc: 'Haftada 3 antrenman, 4 hafta. İlerlemen antrenmanlarını işaretledikçe kendiliğinden dolar; istersen yazdırılabilir takvimi buzdolabına as.',
    challengeCta: 'Challenge\'ı incele',
    faqEyebrow: 'Sık sorulanlar',
    faqTitle: 'Aklındaki sorular',
    faqs: [
      ['Gerçekten tamamen ücretsiz mi?', 'Evet. Kişisel plan, antrenman modu, beslenme planı, fotoğrafla kalori ve ilerleme takibi ücretsiz. Kredi kartı istenmez, deneme süresi yoktur, premium duvarı yoktur.'],
      ['Nasıl ücretsiz kalıyor?', 'Verilerin satılmaz ve reklam amacıyla paylaşılmaz. Full Balance, isteyen kullanıcıların küçük ve tamamen isteğe bağlı destekleriyle ayakta kalıyor.'],
      ['Uygulama indirmem gerekiyor mu?', 'Hayır. Full Balance tarayıcıda çalışır; telefonunda ana ekrana ekleyerek uygulama gibi açabilirsin. Aynı hesapla telefon ve bilgisayarda kullanırsın.'],
      ['Ekipmanım yok, yeni başlıyorum. Bana uygun mu?', 'Evet. Kayıtta evde ekipmansız, evde temel ekipman veya salon seçersin. Başlangıç seviyesinde hareketler daha basittir ve her birinin anlatımı vardır.'],
      ['Verilerim ne oluyor?', 'Verilerin hesabında tutulur; dışa aktarabilir ve Profil bölümünden hesabını kalıcı olarak silebilirsin. Öğün fotoğrafları yalnızca analiz için işlenir, saklanmaz.'],
      ['Hangi dillerde kullanabilirim?', 'Türkçe, İngilizce ve İspanyolca. Dili istediğin zaman değiştirebilirsin.'],
    ],
  },
  en: {
    shotCaption: 'Real app screen · sample data',
    priceEyebrow: 'Price check',
    priceOthers: 'Yearly subscription in similar apps',
    priceUpTo: 'up to',
    priceOurs: 'Everything in Full Balance',
    priceNote: (h) => `Prices read from ${h.store} pages on ${h.date}; they can vary by region and promotion.`,
    priceLink: 'See the comparison',
    showEyebrow: 'Inside the app',
    showTitle: 'What you get as soon as you sign up',
    showDesc: 'These are real app screens. It runs in your browser; add it to your home screen and it works like an app.',
    shots: [
      ['session', 'Never wonder what to do next', ['Animated how-to and technique video for every exercise', 'Log weight and reps; your last weights are pre-filled', 'The rest timer starts on its own', 'New personal records get celebrated']],
      ['today', 'One clear focus every day', ['Start today\'s workout with one tap', 'Your weekly goal at a glance', '7-day balance score: activity, recovery, consistency', 'Optional reminders']],
      ['nutrition', 'Nutrition that follows your training day', ['Calorie and macro targets for each day', '7-day menu with budget, health and allergy options', 'Snap a meal, see its calorie range']],
      ['progress', 'See your progress in numbers', ['Weight, measurements and body fat charts', 'Reports and Excel export', 'Workouts, water and sleep habits in one place']],
    ],
    challengeEyebrow: '28-day challenge',
    challengeTitle: '12 workouts in 28 days. Join free.',
    challengeDesc: '3 workouts a week for 4 weeks. Your progress fills in as you check off workouts, and there is a printable calendar for your fridge.',
    challengeCta: 'See the challenge',
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions you might have',
    faqs: [
      ['Is it really completely free?', 'Yes. Your personal plan, workout mode, nutrition plan, photo calories and progress tracking are free. No credit card, no trial, no paywall.'],
      ['How does it stay free?', 'Your data is never sold or shared for advertising. Full Balance is kept running by small, completely optional support from people who use it.'],
      ['Do I need to download an app?', 'No. Full Balance runs in your browser; add it to your phone\'s home screen to open it like an app. Use the same account on your phone and computer.'],
      ['I have no equipment and I am a beginner. Is it for me?', 'Yes. At signup you choose home with no equipment, home with basic equipment or the gym. Beginner exercises are simpler and each one comes with instructions.'],
      ['What happens to my data?', 'Your data stays in your account; you can export it and permanently delete your account from your profile. Meal photos are processed only for the analysis and never stored.'],
      ['Which languages are available?', 'English, Spanish and Turkish. You can switch at any time.'],
    ],
  },
  es: {
    shotCaption: 'Pantalla real de la app · datos de ejemplo',
    priceEyebrow: 'Comparación de precios',
    priceOthers: 'Suscripción anual en apps similares',
    priceUpTo: 'hasta',
    priceOurs: 'Todo en Full Balance',
    priceNote: (h) => `Precios leídos en ${h.store} el ${h.date}; pueden variar según región y promoción.`,
    priceLink: 'Ver la comparación',
    showEyebrow: 'Dentro de la app',
    showTitle: 'Lo que encuentras al registrarte',
    showDesc: 'Estas son pantallas reales de la app. Funciona en el navegador; añádela a la pantalla de inicio y se usa como una app.',
    shots: [
      ['session', 'No pienses qué toca ahora', ['Explicación animada y vídeo de técnica en cada ejercicio', 'Marca peso y repeticiones; tu último peso aparece listo', 'El temporizador de descanso arranca solo', 'Celebras cada nuevo récord']],
      ['today', 'Un foco claro cada día', ['Empieza el entreno de hoy con un toque', 'Tu objetivo semanal de un vistazo', 'Puntuación de equilibrio de 7 días: actividad, recuperación, constancia', 'Recordatorios si los quieres']],
      ['nutrition', 'Tu nutrición sigue a tu día de entreno', ['Calorías y macros para cada día', 'Menú de 7 días con opciones de presupuesto, salud y alergias', 'Fotografía tu comida y ve su rango de calorías']],
      ['progress', 'Tu progreso en números', ['Gráficos de peso, medidas y grasa corporal', 'Informes y exportación a Excel', 'Entrenos, agua y sueño en un solo lugar']],
    ],
    challengeEyebrow: 'Reto de 28 días',
    challengeTitle: '12 entrenos en 28 días. Únete gratis.',
    challengeDesc: '3 entrenos por semana durante 4 semanas. Tu progreso se completa al marcar los entrenos, y hay un calendario imprimible para la nevera.',
    challengeCta: 'Ver el reto',
    faqEyebrow: 'Preguntas frecuentes',
    faqTitle: 'Dudas habituales',
    faqs: [
      ['¿Es totalmente gratis de verdad?', 'Sí. Tu plan personal, el modo entrenamiento, el plan de nutrición, las calorías con foto y el seguimiento del progreso son gratis. Sin tarjeta, sin prueba y sin muro de pago.'],
      ['¿Cómo sigue siendo gratis?', 'Tus datos no se venden ni se comparten con fines publicitarios. Full Balance se mantiene gracias al apoyo pequeño y totalmente voluntario de quienes la usan.'],
      ['¿Tengo que descargar una app?', 'No. Full Balance funciona en el navegador; añádela a la pantalla de inicio del móvil para abrirla como una app. Usas la misma cuenta en el móvil y en el ordenador.'],
      ['No tengo material y soy principiante. ¿Es para mí?', 'Sí. Al registrarte eliges casa sin equipo, casa con equipo básico o gimnasio. Los ejercicios de nivel inicial son más sencillos y cada uno tiene su explicación.'],
      ['¿Qué pasa con mis datos?', 'Tus datos se guardan en tu cuenta; puedes exportarlos y eliminar tu cuenta de forma permanente desde tu perfil. Las fotos de comida solo se procesan para el análisis y no se guardan.'],
      ['¿En qué idiomas está?', 'Español, inglés y turco. Puedes cambiar de idioma cuando quieras.'],
    ],
  },
};

const photoToolPaths = { tr: '/fotografla-kalori-hesaplama', en: '/en/photo-calorie-counter', es: '/es/contar-calorias-con-foto' };

function PhoneShot({ src, alt, className = '', eager = false }) {
  return (
    <div className={`rounded-[2.4rem] bg-gradient-to-b from-slate-600 to-slate-800 p-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-10px_rgba(249,115,22,0.25)] ${className}`}>
      <div className="rounded-[2.3rem] bg-black p-2">
        <img src={src} alt={alt} width="900" height="1948" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" className="block h-auto w-full rounded-[1.8rem]" />
      </div>
    </div>
  );
}

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

export default function LandingPage({ onStart, language }) {
  const { t, lang: uiLang, setLang } = useTranslation();
  // /en and /es render this page with their own language whatever the UI language was.
  const lang = language || uiLang;
  useEffect(() => {
    if (language && language !== uiLang) setLang?.(language);
  }, [language, uiLang, setLang]);
  const [shareCopied, setShareCopied] = useState(false);
  const c = copy[lang] || copy.tr;
  const m = more[lang] || more.tr;
  const shotLang = more[lang] ? lang : 'tr';
  const priceHead = storePriceHeadline[shotLang];
  const [openFaq, setOpenFaq] = useState(0);
  const pricing = pricingPages.find((page) => page.lang === lang) || pricingPages[0];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = c.metaTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', c.metaDescription);
  }, [c.metaDescription, c.metaTitle, lang]);


  const goals = [
    { key: 'muscle', icon: Dumbbell, color: '#f97316', fallback: 'Kas Gelişimi' },
    { key: 'fatburn', icon: Flame, color: '#ef4444', fallback: 'Yağ Yakımı' },
    { key: 'yoga', icon: Sun, color: '#eab308', fallback: 'Yoga' },
    { key: 'meditation', icon: Brain, color: '#a855f7', fallback: 'Meditasyon' },
    { key: 'reformer', icon: Cog, color: '#22c55e', fallback: 'Reformer' },
    { key: 'pilates', icon: CircleDot, color: '#06b6d4', fallback: 'Pilates' },
  ];

  const blogLanguage = lang === 'en' || lang === 'es' ? lang : 'tr';
  const guides = blogArticles.filter((article) => getArticleLanguage(article) === blogLanguage).slice(0, 3);
  const longevityGuide = blogArticles.find((article) => article.slug === 'longevity-nedir-saglikli-yasam-aliskanliklari');

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
          <Link to={language ? `/${language}` : '/'} className="flex shrink-0 items-center gap-1.5" aria-label="Full Balance">
            <BrandMark size={22} />
            <span className="whitespace-nowrap font-outfit text-xs font-extrabold text-white sm:text-base">FULL <span className="text-cyan-400">BALANCE</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => startRegistration('navigation')} className="min-h-10 bg-orange-500 px-3 font-outfit text-xs font-bold text-white hover:bg-orange-400 sm:px-4">{c.navCta}</button>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden border-b border-white/10 pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_30%,rgba(249,115,22,0.18),transparent),radial-gradient(50%_45%_at_10%_80%,rgba(34,211,238,0.12),transparent)]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-6 sm:px-6 sm:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-12">
          <motion.div initial="hidden" animate="visible" className="min-w-0">
            <motion.p custom={0} variants={fadeUp} className="mb-5 inline-flex items-center gap-2 border border-emerald-400/40 bg-emerald-950/75 px-3 py-2 text-xs font-bold text-emerald-300">
              <CreditCard size={15} /> {c.freeBadge}
            </motion.p>
            <motion.h1 custom={1} variants={fadeUp} className="break-words font-outfit text-4xl font-black leading-[1.06] text-white sm:text-6xl">{c.heroTitle}</motion.h1>
            <motion.p custom={2} variants={fadeUp} className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{c.heroDesc}</motion.p>
            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <button onClick={() => startRegistration('hero')} className="inline-flex min-h-14 items-center justify-center gap-2 bg-orange-500 px-7 font-outfit text-sm font-bold text-white hover:bg-orange-400">{c.primaryCta}<ChevronRight size={18} /></button>
            </motion.div>
            <motion.p custom={4} variants={fadeUp} className="mt-4 flex items-center gap-2 text-xs text-slate-300"><ShieldCheck size={15} className="shrink-0 text-emerald-400" /> {c.freeNote}</motion.p>
          </motion.div>
          <figure className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[380px]">
            <PhoneShot src={`/images/app/${shotLang}-session.webp`} alt={m.shots[0][1]} eager className="mx-auto w-[86%]" />
            <figcaption className="mt-4 text-center text-[11px] text-slate-500">{m.shotCaption}</figcaption>
          </figure>
        </div>
      </header>

      <section aria-label={m.priceEyebrow} className="border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:px-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">{m.priceOthers}</p>
            <p className="mt-1 font-outfit text-2xl font-extrabold text-slate-300 sm:text-3xl"><span className="text-base font-semibold text-slate-500">{m.priceUpTo} </span><span>{priceHead.max}</span></p>
          </div>
          <ArrowRight size={22} className="hidden text-slate-600 md:block" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase text-emerald-400">{m.priceOurs}</p>
            <p className="mt-1 font-outfit text-4xl font-black text-emerald-400">{priceHead.free}</p>
          </div>
          <p className="text-xs leading-5 text-slate-500 md:col-span-3">{m.priceNote(priceHead)} <Link to={pricing.path} className="font-semibold text-emerald-300 underline underline-offset-4">{m.priceLink}</Link></p>
        </div>
      </section>

      <ApprovedTestimonials language={lang} />

      <section className="border-b border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionTitle eyebrow={m.showEyebrow} title={m.showTitle} desc={m.showDesc} />
          <div className="space-y-16 sm:space-y-24">
            {m.shots.map(([screen, title, points], index) => (
              <motion.article key={screen} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={`mx-auto w-full max-w-[260px] sm:max-w-[300px] ${index % 2 ? 'md:order-2' : ''}`}>
                  <PhoneShot src={`/images/app/${shotLang}-${screen}.webp`} alt={title} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-orange-400">0{index + 1}</span>
                  <h3 className="mt-3 font-outfit text-2xl font-extrabold leading-tight text-white sm:text-3xl">{title}</h3>
                  <ul className="mt-5 space-y-3">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-300 sm:text-base">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-emerald-500/10"><Check size={15} className="text-emerald-400" /></span>{point}
                      </li>
                    ))}
                  </ul>
                  {screen === 'nutrition' && (
                    <Link
                      to={photoToolPaths[shotLang]}
                      onClick={() => { recordAcquisitionContent(`landing_${lang}_photo_meal_tool`); trackLandingCta('photo_meal_tool'); }}
                      className="mt-6 inline-flex min-h-11 items-center gap-2 bg-cyan-400 px-5 font-outfit text-sm font-bold text-slate-950 hover:bg-cyan-300"
                    ><Camera size={17} />{c.photoMealCta}<ChevronRight size={16} /></Link>
                  )}
                  {screen === 'progress' && (
                      <div className="mt-6 flex items-start gap-3 border-l-2 border-emerald-500 bg-emerald-500/5 p-4 text-sm leading-6 text-slate-400">
                        <Activity size={19} className="mt-0.5 shrink-0 text-emerald-400" />
                        <p>{c.longevityNote} <Link to={blogLanguage === 'tr' ? getArticlePath(longevityGuide) : getBlogPath(blogLanguage)} className="font-semibold text-emerald-400 underline underline-offset-4">{blogLanguage === 'tr' ? c.readGuide : c.allGuides}</Link></p>
                      </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <Link
            to={CHALLENGE_PATHS[shotLang]}
            onClick={() => { recordAcquisitionContent(`landing_${lang}_challenge`); trackLandingCta('challenge'); }}
            className="flex flex-col gap-5 border border-orange-400/40 bg-orange-500/[0.07] p-6 transition-colors hover:border-orange-400/80 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-orange-400"><Flame size={15} />{m.challengeEyebrow}</p>
              <h2 className="mt-2 font-outfit text-2xl font-extrabold text-white sm:text-3xl">{m.challengeTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">{m.challengeDesc}</p>
            </div>
            <span className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-orange-500 px-5 font-outfit text-sm font-bold text-white">{m.challengeCta}<ChevronRight size={17} /></span>
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionTitle eyebrow={c.homeEyebrow} title={c.homeTitle} desc={c.homeDesc} />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { image: '/images/home-bodyweight.jpg', icon: House, title: c.noEquipmentTitle, desc: c.noEquipmentDesc, color: 'text-emerald-400' },
              { image: '/images/home-equipment.jpg', icon: PackageOpen, title: c.equipmentTitle, desc: c.equipmentDesc, color: 'text-cyan-400' },
            ].map((item) => (
              <article key={item.title} className="overflow-hidden border border-slate-800 bg-slate-900/55">
                <OptimizedImage src={item.image} alt={item.title} sizes="(min-width: 768px) 50vw, 100vw" width="1536" height="1024" loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <div className="p-5 sm:p-6">
                  <item.icon size={22} className={item.color} />
                  <h3 className="mt-4 font-outfit text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-4 border-l-2 border-orange-500 bg-orange-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-sm leading-6 text-slate-300">
              <MapPin size={19} className="mt-0.5 shrink-0 text-orange-400" />
              <p>{c.homeVenueNote}</p>
            </div>
            <button onClick={() => startRegistration('training_environment')} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-orange-500 px-5 font-outfit text-xs font-bold text-white hover:bg-orange-400">
              {c.homeCta}<ChevronRight size={16} />
            </button>
          </div>
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
                  <OptimizedImage src={goalAssets[goal.key]} alt={title} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" width="1600" height="900" loading="lazy" className="aspect-[4/3] w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
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

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-12 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start [&>div]:min-w-0">
          <div>
            <Eyebrow>{lang === 'tr' ? '%100 ücretsiz' : lang === 'es' ? '100% gratis' : '100% free'}</Eyebrow>
            <h2 className="max-w-full break-words font-outfit text-2xl font-extrabold leading-tight sm:text-4xl">{c.freeTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{c.freeDesc}</p>
            <SupportCard lang={lang} placement="landing_free_section" variant="note" />
            <button onClick={() => startRegistration('free_section')} className="mt-7 inline-flex min-h-12 items-center gap-2 bg-emerald-500 px-6 font-outfit text-sm font-bold text-slate-950 hover:bg-emerald-400">{c.primaryCta}<ArrowRight size={17} /></button>
          </div>
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.freeItems.map((item) => <div key={item} className="flex min-h-16 items-center gap-3 border border-slate-800 bg-slate-900/45 px-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center bg-emerald-500/10"><Check size={17} className="text-emerald-400" /></span><span className="text-sm text-slate-300">{item}</span></div>)}
            </div>
            <PricingComparison headings={pricing.compareHead} rows={pricing.compareRows.slice(0, 7)} />
            <Link to={pricing.path} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-300 hover:text-emerald-200">{pricing.compareTitle} →</Link>
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
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <SectionTitle eyebrow={m.faqEyebrow} title={m.faqTitle} />
          <div className="divide-y divide-slate-800 border-y border-slate-800">
            {m.faqs.map(([question, answer], index) => (
              <div key={question}>
                <h3>
                  <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-outfit text-base font-bold text-white sm:text-lg">
                    {question}<ChevronDown size={19} className={`shrink-0 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                {openFaq === index && <p className="pb-5 text-sm leading-7 text-slate-400 sm:text-base">{answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionTitle eyebrow={c.guidesEyebrow} title={c.guidesTitle} desc={c.guidesDesc} />
            <Link to={getBlogPath(blogLanguage)} className="mb-9 inline-flex items-center gap-2 text-sm font-bold text-emerald-400">{c.allGuides}<ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <Link key={guide.slug} to={getArticlePath(guide)} className="group overflow-hidden border border-slate-800 bg-slate-900/50">
                <OptimizedImage src={guide.image} alt="" sizes="(min-width: 768px) 33vw, 100vw" width="1600" height="900" loading="lazy" className="aspect-video w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
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
        <button onClick={handleShare} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"><ArrowRight size={16} />{shareCopied ? c.copied : c.share}</button>
      </section>

      <footer id="for-trainers" className="border-t border-slate-800 px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><BrandMark size={18} /><span className="font-outfit text-sm font-bold">FULL BALANCE</span></div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-white">{t('auth.privacyLink') || 'Gizlilik'}</Link>
              <Link to="/terms" className="hover:text-white">{t('auth.termsLink') || 'Koşullar'}</Link>
              <Link to="/coach" className="hover:text-white">{coachMarketing[lang].nav}</Link>
              <Link to="/contact" className="hover:text-white">{t('contact.link') || 'İletişim'}</Link>
              <Link to="/editorial-policy" className="hover:text-white">{lang === 'tr' ? 'Yayın ilkeleri' : lang === 'es' ? 'Política editorial' : 'Editorial policy'}</Link>
              <Link to={pricingAlternates[lang] || pricingAlternates.tr} className="hover:text-white">{pricing.eyebrow}</Link>
              <Link to={lang === 'tr' ? '/kurucu-tolga-deveci' : lang === 'es' ? '/es/fundador-tolga-deveci' : '/en/founder-tolga-deveci'} className="hover:text-white">{c.founderLink}</Link>
              <SupportCard lang={lang} placement="landing_footer" variant="footer" />
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-xs leading-5 text-slate-600">{c.founderCredit}</p>
          <div className="mt-6 flex items-start gap-2 border-t border-slate-800 pt-5 text-xs leading-5 text-slate-600"><Lock size={13} className="mt-0.5 shrink-0" /><p>{c.footerMedical}</p></div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-700"><Languages size={13} /> TR · EN · ES</div>
        </div>
      </footer>
    </div>
  );
}
