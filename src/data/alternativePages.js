// "Free alternative to X" pages. People ask search engines and AI assistants
// for free alternatives to paid fitness apps; these pages answer honestly:
// what the other app is for, what it costs on the App Store (storePrices.js),
// what Full Balance does for free and where the other app is still better.
// Every Full Balance claim must stay true in the product. Competitor claims
// stay limited to what their App Store page shows; no disparagement.
import { STORE_PRICES_CHECKED_AT, storePrices } from './storePrices.js';

export const ALTERNATIVES_REVIEWED = STORE_PRICES_CHECKED_AT;

const priceRow = (lang, app) => storePrices[lang].rows.find((row) => row[0] === app);

const copy = {
  tr: {
    locale: 'tr-TR', home: 'Full Balance', cta: 'Ücretsiz planımı oluştur', tool: 'Fotoğrafla kaloriyi şimdi dene',
    tableHead: ['', 'Full Balance'], priceLabel: 'App Store\'da listelenen abonelik', ours: '0 TL, abonelik yok',
    betterTitle: 'Hangi durumda diğer uygulama daha iyi?', pickTitle: 'Kısaca hangisini seçmeli?', faqTitle: 'Sık sorulanlar',
    note: (date) => `Fiyat bilgisi ${date} tarihinde App Store Türkiye sayfasından okunmuştur ve değişebilir; güncel fiyatı uygulamanın kendi sayfasından kontrol et. Markalar sahiplerine aittir; Full Balance bu şirketlerle bağlantılı değildir.`,
    others: 'Diğer karşılaştırmalar', pricing: 'Fiyatlandırma: neden ücretsiz?', reviewed: 'Son kontrol',
  },
  en: {
    locale: 'en-US', home: 'Full Balance', cta: 'Create my free plan', tool: 'Try the photo calorie counter now',
    tableHead: ['', 'Full Balance'], priceLabel: 'Subscription listed on the App Store', ours: '$0, no subscription',
    betterTitle: 'When is the other app the better choice?', pickTitle: 'Which one should you pick?', faqTitle: 'Frequently asked questions',
    note: (date) => `Prices were read from the US App Store on ${date} and can change; check the app's own page for the current price. Trademarks belong to their owners; Full Balance is not affiliated with these companies.`,
    others: 'Other comparisons', pricing: 'Pricing: why it is free', reviewed: 'Last checked',
  },
  es: {
    locale: 'es-ES', home: 'Full Balance', cta: 'Crear mi plan gratis', tool: 'Prueba ahora las calorías con foto',
    tableHead: ['', 'Full Balance'], priceLabel: 'Suscripción listada en la App Store', ours: '0 €, sin suscripción',
    betterTitle: '¿Cuándo es mejor la otra app?', pickTitle: '¿Cuál elegir?', faqTitle: 'Preguntas frecuentes',
    note: (date) => `Los precios se leyeron en la App Store de España el ${date} y pueden cambiar; consulta el precio actual en la página de la app. Las marcas pertenecen a sus dueños; Full Balance no está afiliada a estas empresas.`,
    others: 'Otras comparaciones', pricing: 'Precios: por qué es gratis', reviewed: 'Última revisión',
  },
};

const definitions = {
  calAi: {
    app: 'Cal AI',
    paths: { tr: '/cal-ai-ucretsiz-alternatif', en: '/en/free-cal-ai-alternative', es: '/es/alternativa-gratis-cal-ai' },
    toolHref: { tr: '/fotografla-kalori-hesaplama', en: '/en/photo-calorie-counter', es: '/es/contar-calorias-con-foto' },
    tr: {
      title: 'Ücretsiz Cal AI Alternatifi: Fotoğrafla Kalori, Abonelik Yok',
      description: 'Cal AI gibi öğün fotoğrafından kalori tahmini isteyen ama abonelik ödemek istemeyenler için Full Balance: tarayıcıda çalışır, üyelik ve kredi kartı gerekmez.',
      heading: 'Ücretsiz Cal AI alternatifi',
      answer: 'Öğün fotoğrafından kalori tahmini için ödeme yapmak istemiyorsan Full Balance\'ı dene. Fotoğrafla kalori aracı tarayıcıda çalışır, üyelik ve kredi kartı istemez, günlük fotoğraf sınırı yoktur. Kayıt olursan aynı hesapta antrenman ve beslenme planı da ücretsizdir.',
      rows: [
        ['Fotoğraftan kalori ve makro tahmini', 'Var; tek sayı yerine gerçekçi bir aralık verir'],
        ['Üyelik olmadan deneme', 'Var, hesap gerekmez'],
        ['Kredi kartı', 'İstenmez'],
        ['Gizli yağ ve sos ekleme, gramı düzeltme', 'Var'],
        ['Fotoğrafın saklanması', 'Saklanmaz; yalnızca analiz için işlenir'],
        ['Antrenman planı', 'Dahil, hedefe ve ekipmana göre'],
        ['Dil', 'Türkçe, İngilizce, İspanyolca'],
      ],
      better: ['Mağazadan indirilen yerel bir uygulama istiyorsan: Full Balance şimdilik tarayıcıdan çalışır ve ana ekrana eklenir; App Store ve Google Play sürümü henüz yok.', 'Barkod okutarak paketli ürün eklemek istiyorsan: Full Balance\'ta barkod okuyucu yok.'],
      pick: 'Sadece fotoğrafla kalori takibi yapacaksan ve ödemeye razıysan Cal AI\'ın mağaza uygulaması rahattır. Ücret ödemeden fotoğrafla kalori tahmini istiyorsan ya da beslenmeyle birlikte antrenman planı da istiyorsan Full Balance daha uygun.',
      faqs: [
        ['Full Balance gerçekten ücretsiz mi?', 'Evet. Abonelik, deneme süresi, premium katman ve reklam yok. Proje isteyen kullanıcıların isteğe bağlı küçük destekleriyle sürüyor.'],
        ['Fotoğraftan kalori ne kadar doğru?', 'Hiçbir fotoğraf aracı kesin gram veremez; porsiyon derinliği, pişirme yağı ve sos görünmez. Full Balance bu yüzden bir aralık gösterir ve yiyecekleri, gramları ve gizli malzemeleri düzeltmene izin verir.'],
        ['Uygulama indirmem gerekir mi?', 'Hayır. Tarayıcıda çalışır; istersen telefonunun ana ekranına uygulama gibi ekleyebilirsin.'],
      ],
    },
    en: {
      title: 'Free Cal AI Alternative: Photo Calorie Counter With No Subscription',
      description: 'Looking for a free Cal AI alternative? Full Balance estimates calories from a meal photo in your browser, with no signup, no credit card and no daily scan limit.',
      heading: 'A free Cal AI alternative',
      answer: 'If you want calorie estimates from meal photos without paying for a subscription, try Full Balance. Its photo calorie counter runs in the browser, needs no account or credit card and has no daily scan limit. With a free account you also get a workout and nutrition plan.',
      rows: [
        ['Calories and macros from a meal photo', 'Yes, shown as a realistic range instead of one number'],
        ['Try it without an account', 'Yes, no signup needed'],
        ['Credit card', 'Never asked'],
        ['Add hidden oil or sauce, fix grams', 'Yes'],
        ['Photo storage', 'Not stored; processed only for the analysis'],
        ['Workout plan', 'Included, built for your goal and equipment'],
        ['Languages', 'English, Spanish, Turkish'],
      ],
      better: ['You want a native app from the App Store: Full Balance runs in the browser and installs to your home screen; there is no App Store or Google Play version yet.', 'You want to scan barcodes of packaged food: Full Balance has no barcode scanner.'],
      pick: 'If you only track food by photo and are happy to pay, Cal AI\'s store app is convenient. If you want photo calorie estimates without paying, or want a workout plan alongside nutrition, Full Balance is the better fit.',
      faqs: [
        ['Is Full Balance really free?', 'Yes. No subscription, no trial, no premium tier and no ads. The project runs on small, optional support from people who use it.'],
        ['How accurate is a photo calorie estimate?', 'No photo tool can give exact grams: portion depth, cooking oil and sauce are not visible. Full Balance therefore shows a range and lets you correct foods, grams and hidden ingredients.'],
        ['Do I need to download an app?', 'No. It runs in the browser, and you can add it to your phone\'s home screen like an app.'],
      ],
    },
    es: {
      title: 'Alternativa Gratis a Cal AI: Calorías con Foto sin Suscripción',
      description: '¿Buscas una alternativa gratis a Cal AI? Full Balance estima calorías desde una foto de tu comida en el navegador, sin registro, sin tarjeta y sin límite diario.',
      heading: 'Una alternativa gratis a Cal AI',
      answer: 'Si quieres estimar calorías con fotos de tus comidas sin pagar una suscripción, prueba Full Balance. Su contador de calorías con foto funciona en el navegador, no pide cuenta ni tarjeta y no tiene límite diario. Con una cuenta gratis también tienes plan de entreno y de nutrición.',
      rows: [
        ['Calorías y macros desde una foto', 'Sí, como un rango realista en vez de una sola cifra'],
        ['Probar sin cuenta', 'Sí, sin registro'],
        ['Tarjeta de crédito', 'Nunca se pide'],
        ['Añadir aceite o salsa ocultos, corregir gramos', 'Sí'],
        ['Almacenamiento de la foto', 'No se guarda; solo se procesa para el análisis'],
        ['Plan de entreno', 'Incluido, según tu objetivo y tu material'],
        ['Idiomas', 'Español, inglés, turco'],
      ],
      better: ['Quieres una app nativa de la App Store: Full Balance funciona en el navegador y se instala en la pantalla de inicio; todavía no hay versión en App Store ni Google Play.', 'Quieres escanear códigos de barras de productos envasados: Full Balance no tiene escáner de códigos.'],
      pick: 'Si solo registras comida con fotos y no te importa pagar, la app de Cal AI es cómoda. Si quieres calorías con foto sin pagar, o un plan de entreno junto a la nutrición, Full Balance encaja mejor.',
      faqs: [
        ['¿Full Balance es gratis de verdad?', 'Sí. Sin suscripción, sin prueba, sin nivel premium y sin anuncios. El proyecto se mantiene con apoyos pequeños y opcionales de quienes lo usan.'],
        ['¿Qué tan precisa es una estimación con foto?', 'Ninguna herramienta puede dar gramos exactos con una foto: la profundidad de la porción, el aceite y la salsa no se ven. Por eso Full Balance muestra un rango y te deja corregir alimentos, gramos e ingredientes ocultos.'],
        ['¿Tengo que descargar una app?', 'No. Funciona en el navegador y puedes añadirla a la pantalla de inicio como una app.'],
      ],
    },
  },
  myFitnessPal: {
    app: 'MyFitnessPal',
    paths: { tr: '/myfitnesspal-ucretsiz-alternatif', en: '/en/free-myfitnesspal-alternative', es: '/es/alternativa-gratis-myfitnesspal' },
    toolHref: { tr: '/gunluk-kalori-ihtiyaci-hesaplama', en: '/en/calorie-macro-calculator', es: '/es/calculadora-calorias-macros' },
    tr: {
      title: 'Ücretsiz MyFitnessPal Alternatifi: Kalori, Makro ve Antrenman Planı',
      description: 'Premium ödemeden kalori ve makro hedefi, haftalık menü ve fotoğrafla kalori isteyenler için Full Balance; antrenman planı da aynı ücretsiz hesapta.',
      heading: 'Ücretsiz MyFitnessPal alternatifi',
      answer: 'Kalori ve makro hedefini, haftalık menünü ve antrenman planını tek yerde ücretsiz istiyorsan Full Balance\'ı dene. Premium katmanı yok; fotoğrafla kalori tahmini dahil bütün araçlar açık. Çok büyük bir markalı ürün veritabanına ve barkod okumaya ihtiyacın varsa MyFitnessPal daha güçlü.',
      rows: [
        ['Günlük kalori ve makro hedefi', 'Var, antrenman gününe göre değişir'],
        ['7 günlük menü', 'Var; bütçe, sağlık ve alerji seçenekleriyle'],
        ['Fotoğrafla kalori tahmini', 'Var, ücretsiz'],
        ['Antrenman planı ve rehberli antrenman', 'Dahil'],
        ['Kilo, ölçü, su ve uyku takibi', 'Var; Excel dışa aktarma dahil'],
        ['Reklam', 'Yok'],
      ],
      better: ['Barkod okutarak ürün eklemek istiyorsan: Full Balance\'ta barkod okuyucu yok.', 'Çok geniş, markalı ürünlerden oluşan bir besin veritabanı istiyorsan: Full Balance\'ın veritabanı daha küçük ve temel yiyeceklere odaklı.', 'Mağazadan yerel uygulama istiyorsan: Full Balance şimdilik tarayıcıdan çalışıyor.'],
      pick: 'Her ürünü gramına kadar kaydetmek ve barkod okutmak istiyorsan MyFitnessPal. Hazır kalori ve makro hedefi, menü ve antrenman planını ücretsiz tek uygulamada istiyorsan Full Balance.',
      faqs: [
        ['Full Balance\'ta premium var mı?', 'Hayır. Tüm özellikler herkes için açık; ödeme ekranı yok.'],
        ['Kalori hedefim nasıl hesaplanıyor?', 'Boy, kilo, yaş, aktivite ve hedefinden bazal metabolizma ve günlük ihtiyaç hesaplanır; antrenman günlerinde hedef değişir. Hesaplayıcı üyeliksiz de kullanılabilir.'],
        ['Verilerimi dışa aktarabilir miyim?', 'Evet. İlerleme verilerini Excel olarak indirebilir, hesabını istediğin zaman silebilirsin.'],
      ],
    },
    en: {
      title: 'Free MyFitnessPal Alternative: Calories, Macros and a Workout Plan',
      description: 'Want calorie and macro targets, a weekly meal plan and photo calorie estimates without Premium? Full Balance is free and adds a workout plan in the same account.',
      heading: 'A free MyFitnessPal alternative',
      answer: 'If you want calorie and macro targets, a weekly meal plan and a workout plan in one place for free, try Full Balance. There is no premium tier; every tool, including photo calorie estimates, is open. If you need a huge branded food database and barcode scanning, MyFitnessPal is stronger.',
      rows: [
        ['Daily calorie and macro targets', 'Yes, adjusted on training days'],
        ['7-day meal plan', 'Yes, with budget, health and allergy options'],
        ['Photo calorie estimate', 'Yes, free'],
        ['Workout plan and guided workouts', 'Included'],
        ['Weight, measurements, water and sleep', 'Yes, with Excel export'],
        ['Ads', 'None'],
      ],
      better: ['You want to scan barcodes: Full Balance has no barcode scanner.', 'You want a very large database of branded products: Full Balance\'s database is smaller and focused on everyday foods.', 'You want a native store app: Full Balance runs in the browser for now.'],
      pick: 'Pick MyFitnessPal if you log every product to the gram and rely on barcode scanning. Pick Full Balance if you want ready calorie and macro targets, a meal plan and a workout plan in one free app.',
      faqs: [
        ['Does Full Balance have a premium tier?', 'No. Every feature is open to everyone; there is no paywall.'],
        ['How is my calorie target calculated?', 'Your BMR and daily needs come from height, weight, age, activity and goal, and the target changes on training days. The calculator also works without an account.'],
        ['Can I export my data?', 'Yes. You can download your progress data as Excel and delete your account at any time.'],
      ],
    },
    es: {
      title: 'Alternativa Gratis a MyFitnessPal: Calorías, Macros y Plan de Entreno',
      description: '¿Quieres objetivos de calorías y macros, menú semanal y calorías con foto sin Premium? Full Balance es gratis y suma un plan de entreno en la misma cuenta.',
      heading: 'Una alternativa gratis a MyFitnessPal',
      answer: 'Si quieres objetivos de calorías y macros, un menú semanal y un plan de entreno en un solo lugar y gratis, prueba Full Balance. No hay nivel premium; todas las herramientas, incluidas las calorías con foto, están abiertas. Si necesitas una base enorme de productos de marca y escanear códigos, MyFitnessPal es más completo.',
      rows: [
        ['Objetivo diario de calorías y macros', 'Sí, ajustado en días de entreno'],
        ['Menú de 7 días', 'Sí, con opciones de presupuesto, salud y alergias'],
        ['Calorías con foto', 'Sí, gratis'],
        ['Plan de entreno y entrenos guiados', 'Incluido'],
        ['Peso, medidas, agua y sueño', 'Sí, con exportación a Excel'],
        ['Anuncios', 'Ninguno'],
      ],
      better: ['Quieres escanear códigos de barras: Full Balance no tiene escáner.', 'Quieres una base muy grande de productos de marca: la de Full Balance es más pequeña y centrada en alimentos cotidianos.', 'Quieres una app nativa de tienda: por ahora Full Balance funciona en el navegador.'],
      pick: 'Elige MyFitnessPal si registras cada producto al gramo y usas el escáner. Elige Full Balance si quieres objetivos de calorías y macros, menú y plan de entreno en una app gratis.',
      faqs: [
        ['¿Full Balance tiene nivel premium?', 'No. Todas las funciones están abiertas para todos; no hay muro de pago.'],
        ['¿Cómo se calcula mi objetivo de calorías?', 'Tu metabolismo basal y tus necesidades diarias salen de altura, peso, edad, actividad y objetivo, y el objetivo cambia en días de entreno. La calculadora también funciona sin cuenta.'],
        ['¿Puedo exportar mis datos?', 'Sí. Puedes descargar tu progreso en Excel y borrar tu cuenta cuando quieras.'],
      ],
    },
  },
  fitbod: {
    app: 'Fitbod',
    paths: { tr: '/fitbod-ucretsiz-alternatif', en: '/en/free-fitbod-alternative', es: '/es/alternativa-gratis-fitbod' },
    toolHref: { tr: '/evde-dambil-antrenman-programi', en: '/en/home-dumbbell-workout-plan', es: '/es/entrenamiento-en-casa-con-mancuernas' },
    tr: {
      title: 'Ücretsiz Fitbod Alternatifi: Kişisel Antrenman Planı, Abonelik Yok',
      description: 'Hedefine, seviyene ve ekipmanına göre kişisel antrenman planı ve set set rehberli antrenman isteyip abonelik ödemek istemeyenler için Full Balance.',
      heading: 'Ücretsiz Fitbod alternatifi',
      answer: 'Hedefine, seviyene ve elindeki ekipmana göre hazırlanan bir antrenman planı ve set set yönlendiren bir antrenman modu istiyorsan ama abonelik ödemek istemiyorsan Full Balance\'ı dene. Plan, rehberli antrenman, beslenme hedefi ve ilerleme takibi ücretsiz.',
      rows: [
        ['Kişisel antrenman planı', 'Var; hedef, seviye, gün sayısı ve ekipmana göre'],
        ['Evde ekipmansız, dambıl veya salon', 'Hepsi destekleniyor'],
        ['Rehberli antrenman', 'Var; set ve kilo kaydı, otomatik dinlenme sayacı, önceki kilolar hazır'],
        ['Hareket anlatımı ve video', 'Var'],
        ['Antrenman sonrası geri bildirime göre ayar', 'Var'],
        ['Beslenme planı', 'Dahil'],
      ],
      better: ['Akıllı saatle derin entegrasyon istiyorsan: Full Balance\'ta yalnızca Strava bağlantısı var.', 'Mağazadan yerel uygulama istiyorsan: Full Balance şimdilik tarayıcıdan çalışıyor.'],
      pick: 'Akıllı saat entegrasyonu ve mağaza uygulaması senin için şartsa Fitbod. Ücretsiz kişisel plan, rehberli antrenman ve aynı yerde beslenme istiyorsan Full Balance.',
      faqs: [
        ['Ekipmanım yoksa plan işe yarar mı?', 'Evet. Kayıtta ekipmanını seçersin; ekipmansız, dambıl, direnç bandı ve salon için farklı hareketler gelir.'],
        ['İlk antrenman zor mu?', 'İlk rehberli antrenman kısa bir sürümdür: üç hareket, ikişer set, yaklaşık 10 dakika. İstersen tek dokunuşla tam antrenmana geçersin.'],
        ['Ücretsiz mi?', 'Evet. Abonelik, deneme süresi ve reklam yok.'],
      ],
    },
    en: {
      title: 'Free Fitbod Alternative: Personal Workout Plan With No Subscription',
      description: 'Want a workout plan built for your goal, level and equipment with set-by-set guided workouts, but no subscription? Try Full Balance for free.',
      heading: 'A free Fitbod alternative',
      answer: 'If you want a workout plan built for your goal, level and the equipment you have, plus a guided mode that walks you through every set, but do not want to pay a subscription, try Full Balance. The plan, guided workouts, nutrition targets and progress tracking are free.',
      rows: [
        ['Personal workout plan', 'Yes, by goal, level, training days and equipment'],
        ['No equipment, dumbbells or gym', 'All supported'],
        ['Guided workout mode', 'Yes: set and weight logging, automatic rest timer, previous weights pre-filled'],
        ['Exercise how-to and video', 'Yes'],
        ['Adjusts from post-workout feedback', 'Yes'],
        ['Nutrition plan', 'Included'],
      ],
      better: ['You want deep smartwatch integration: Full Balance only connects to Strava.', 'You want a native store app: Full Balance runs in the browser for now.'],
      pick: 'Pick Fitbod if smartwatch integration and a store app are musts. Pick Full Balance if you want a free personal plan, guided workouts and nutrition in the same place.',
      faqs: [
        ['Does it work without equipment?', 'Yes. You choose your equipment at signup and get different exercises for bodyweight, dumbbells, resistance bands or the gym.'],
        ['Is the first workout hard?', 'The first guided workout is a short version: three moves, two sets each, about 10 minutes. One tap switches to the full workout.'],
        ['Is it free?', 'Yes. No subscription, no trial and no ads.'],
      ],
    },
    es: {
      title: 'Alternativa Gratis a Fitbod: Plan de Entreno Personal sin Suscripción',
      description: '¿Quieres un plan de entreno según tu objetivo, nivel y material, con entrenos guiados serie a serie, pero sin suscripción? Prueba Full Balance gratis.',
      heading: 'Una alternativa gratis a Fitbod',
      answer: 'Si quieres un plan de entreno según tu objetivo, tu nivel y el material que tienes, y un modo guiado que te lleva serie a serie, pero no quieres pagar una suscripción, prueba Full Balance. El plan, los entrenos guiados, los objetivos de nutrición y el seguimiento son gratis.',
      rows: [
        ['Plan de entreno personal', 'Sí, según objetivo, nivel, días y material'],
        ['Sin material, mancuernas o gimnasio', 'Todo incluido'],
        ['Modo de entreno guiado', 'Sí: registro de series y peso, descanso automático, pesos anteriores precargados'],
        ['Explicación y vídeo de ejercicios', 'Sí'],
        ['Ajuste según tu valoración tras entrenar', 'Sí'],
        ['Plan de nutrición', 'Incluido'],
      ],
      better: ['Quieres integración profunda con reloj inteligente: Full Balance solo conecta con Strava.', 'Quieres una app nativa de tienda: por ahora Full Balance funciona en el navegador.'],
      pick: 'Elige Fitbod si la integración con reloj y una app de tienda son imprescindibles. Elige Full Balance si quieres un plan personal gratis, entrenos guiados y nutrición en el mismo lugar.',
      faqs: [
        ['¿Funciona sin material?', 'Sí. Eliges tu material al registrarte y recibes ejercicios distintos para peso corporal, mancuernas, bandas o gimnasio.'],
        ['¿El primer entreno es difícil?', 'El primer entreno guiado es una versión corta: tres ejercicios, dos series cada uno, unos 10 minutos. Con un toque pasas al entreno completo.'],
        ['¿Es gratis?', 'Sí. Sin suscripción, sin prueba y sin anuncios.'],
      ],
    },
  },
};

export const alternativePages = Object.entries(definitions).flatMap(([topic, definition]) =>
  ['tr', 'en', 'es'].map((lang) => {
    const row = priceRow(lang, definition.app);
    return {
      topic,
      lang,
      app: definition.app,
      path: definition.paths[lang],
      alternates: definition.paths,
      toolHref: definition.toolHref[lang],
      ...copy[lang],
      ...definition[lang],
      appPrice: row ? row[2] : null,
      appStoreUrl: row ? row[4] : null,
    };
  }),
);
