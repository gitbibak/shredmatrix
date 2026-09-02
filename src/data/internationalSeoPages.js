export const INTERNATIONAL_LOCALES = ['en', 'es'];

// Visible "last reviewed" date for every public landing page. Update it when
// the copy, tools or FAQ answers change; AI search engines weigh freshness.
export const SEO_LAST_REVIEWED = '2026-09-02';

export function formatReviewedDate(lang = 'en', value = SEO_LAST_REVIEWED) {
  const locale = { tr: 'tr-TR', en: 'en-US', es: 'es-ES' }[lang] || 'en-US';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

const shared = {
  en: {
    locale: 'en-US',
    languageName: 'English',
    freeLabel: '100% free - no credit card',
    startLabel: 'Create my free plan',
    homeLabel: 'Full Balance home',
    featuresLabel: 'What you get',
    relatedEyebrow: 'Explore more',
    relatedTitle: 'Build your complete routine',
    conversionTitle: 'Build your personal plan now',
    conversionText: 'Choose your goal and essentials. Your first workout and nutrition plan is ready in a few simple steps.',
    faqLabel: 'Frequently asked questions',
    disclaimer: 'Full Balance provides general fitness and wellness information, not medical advice. Consult a qualified professional before changing your exercise or nutrition routine if you have a medical condition.',
    commonBenefits: ['Personal plans based on your goal and experience', 'Workout, nutrition, water, sleep and progress in one place', 'Free access with no subscription or credit card'],
  },
  es: {
    locale: 'es-ES',
    languageName: 'Español',
    freeLabel: '100% gratis - sin tarjeta',
    startLabel: 'Crear mi plan gratis',
    homeLabel: 'Inicio de Full Balance',
    featuresLabel: 'Qué incluye',
    relatedEyebrow: 'Explora más',
    relatedTitle: 'Construye tu rutina completa',
    conversionTitle: 'Crea ahora tu plan personal',
    conversionText: 'Elige tu objetivo y lo esencial. Tu primer plan de entrenamiento y nutrición estará listo en pocos pasos.',
    faqLabel: 'Preguntas frecuentes',
    disclaimer: 'Full Balance ofrece información general de fitness y bienestar, no asesoramiento médico. Consulta a un profesional cualificado antes de cambiar tu rutina de ejercicio o nutrición si tienes una condición médica.',
    commonBenefits: ['Planes personales según tu objetivo y experiencia', 'Entrenamiento, nutrición, agua, sueño y progreso en un solo lugar', 'Acceso gratis sin suscripción ni tarjeta'],
  },
};

const pageDefinitions = {
  home: {
    paths: { tr: '/', en: '/en', es: '/es' },
    category: 'app',
    en: {
      title: 'Free Personal Fitness and Wellness App',
      accent: 'Full Balance',
      metaTitle: 'Free Personal Fitness and Wellness App | Full Balance',
      description: 'Get personalized workout and nutrition plans for muscle gain, fat loss, yoga, meditation, reformer and Pilates. Full Balance is completely free with no credit card.',
      hero: 'Six personal goals, nutrition, progress, water, sleep and healthy habit tracking in one simple app. Start free and keep every core feature free.',
      sections: [['Six personal paths', 'Choose muscle gain, fat loss, yoga, meditation, reformer or Pilates and receive a plan suited to your experience.'], ['Nutrition that fits the plan', 'See calorie and macro targets, meal ideas and an allergy-aware shopping list alongside your training.'], ['Progress without the clutter', 'Track the essentials: workouts, weight, measurements, water, sleep, streaks and weekly trends.']],
      faqs: [['Is Full Balance really free?', 'Yes. There is no subscription, credit card requirement or premium paywall for the core experience.'], ['Which goals are supported?', 'Muscle gain, fat loss, yoga, meditation, reformer and Pilates are supported.'], ['Can I use it on my phone?', 'Yes. Full Balance is mobile-first and can be installed as a web app on supported devices.']],
    },
    es: {
      title: 'Aplicación Gratis de Fitness y Bienestar Personal',
      accent: 'Full Balance',
      metaTitle: 'Aplicación Gratis de Fitness y Bienestar | Full Balance',
      description: 'Planes personalizados de entrenamiento y nutrición para ganar músculo, perder grasa, yoga, meditación, reformer y pilates. Gratis y sin tarjeta.',
      hero: 'Seis objetivos personales, nutrición, progreso, agua, sueño y hábitos saludables en una aplicación sencilla. Empieza gratis y conserva todas las funciones esenciales gratis.',
      sections: [['Seis caminos personales', 'Elige ganar músculo, perder grasa, yoga, meditación, reformer o pilates y recibe un plan adaptado a tu experiencia.'], ['Nutrición que acompaña tu plan', 'Consulta calorías, macros, ideas de comidas y una lista de compra que considera tus alergias.'], ['Progreso sin complicaciones', 'Registra lo esencial: entrenamientos, peso, medidas, agua, sueño, rachas y tendencias semanales.']],
      faqs: [['¿Full Balance es realmente gratis?', 'Sí. No hay suscripción, tarjeta obligatoria ni muro premium para la experiencia principal.'], ['¿Qué objetivos incluye?', 'Ganar músculo, perder grasa, yoga, meditación, reformer y pilates.'], ['¿Puedo usarla en el móvil?', 'Sí. Full Balance está diseñada primero para móvil y puede instalarse como aplicación web en dispositivos compatibles.']],
    },
  },
  workout: {
    paths: { tr: '/antrenman-programi', en: '/en/personal-workout-plan', es: '/es/plan-entrenamiento-personalizado' },
    category: 'workout',
    en: {
      title: 'Free Personalized Workout Plan', accent: 'Home or Gym', metaTitle: 'Free Personalized Workout Plan for Home or Gym | Full Balance',
      description: 'Create a free workout plan for home or gym based on your goal, level and available days, with exercise order, sets, reps, rest and progression.',
      hero: 'Choose home or gym, your goal, experience and weekly schedule. Get a clear plan you can follow and track from your phone without a subscription.',
      sections: [['Choose home or gym', 'Home plans use bodyweight movements without gym machines; gym plans use the appropriate training environment.'], ['Every session is clear', 'See exercise order, sets, rep ranges, rest time and practical form guidance before you start.'], ['Four structured phases', 'Difficulty and training demand progress by level instead of changing randomly every week.']],
      faqs: [['Is it suitable for beginners?', 'Yes. Beginner plans use manageable exercise selection, volume and progression.'], ['Can I choose home or gym?', 'Yes. Select your training environment before the plan is created. Home plans avoid gym-only machines.'], ['Which goals are available?', 'Muscle gain, fat loss, yoga, Pilates, reformer and meditation are supported.']],
    },
    es: {
      title: 'Plan de Entrenamiento Personalizado', accent: 'en Casa con Mancuernas', metaTitle: 'Plan Personalizado en Casa con Mancuernas Gratis | Full Balance',
      description: 'Crea gratis un plan personalizado de tonificación en casa con mancuernas o peso corporal, adaptado a tu objetivo, nivel y días disponibles.',
      hero: 'Elige casa con mancuernas, casa sin material o gimnasio. Recibe una semana de entrenamiento personalizada con ejercicios, series, repeticiones, descanso y progresión.',
      sections: [['Casa con mancuernas o sin material', 'El plan respeta el entorno elegido: utiliza mancuernas y bandas si las tienes, o movimientos de peso corporal sin máquinas si entrenas sin equipo.'], ['Cada sesión es clara', 'Consulta el orden, las series, repeticiones, descanso y consejos prácticos de técnica.'], ['Progreso por fases', 'Los planes avanzan por fases estructuradas según tu nivel y objetivo, en lugar de cambiar sin sentido cada semana.']],
      faqs: [['¿Sirve para tonificación en casa?', 'Sí. Elige tu objetivo, nivel y material disponible para recibir una rutina personal con una progresión clara.'], ['¿Necesito mancuernas?', 'No. Puedes elegir casa con mancuernas o casa sin material; el plan excluye el equipo que no tengas.'], ['¿Puedo elegir casa o gimnasio?', 'Sí. Elige el entorno antes de crear el plan y los ejercicios se adaptarán a esa selección.'], ['¿Incluye yoga y pilates?', 'Sí. Full Balance también crea planes de yoga, pilates, reformer y meditación.']],
    },
  },
  homeWorkout: {
    paths: { tr: '/evde-spor-programi', en: '/en/home-workout-no-equipment', es: '/es/entrenamiento-en-casa-sin-equipo' },
    category: 'workout',
    en: {
      title: 'Free Home Workout Plan', accent: 'No Equipment Needed', metaTitle: 'Free Home Workout Plan Without Equipment | Full Balance',
      description: 'Follow a free home workout plan without gym equipment, adapted to your level, weekly schedule and goal with clear sets, reps and progression.',
      hero: 'Train at home with bodyweight movements that match your level. Every session includes a clear order, sets, reps, rest and easier alternatives.',
      sections: [['Built for a real home', 'The plan uses bodyweight movements and ordinary household space instead of cable machines or gym-only equipment.'], ['Progress without random workouts', 'Repetitions, tempo, range of motion and exercise variations progress through structured phases.'], ['Clear weekly structure', 'See training days, recovery days and session duration before you begin.']],
      faqs: [['Do I need dumbbells?', 'No. This plan is designed around bodyweight training without gym equipment.'], ['Can beginners follow it?', 'Yes. Exercise difficulty and weekly volume are adjusted to experience.'], ['How do I make it harder?', 'The plan progresses through repetitions, slower tempo, range of motion and more challenging variations.']],
    },
    es: {
      title: 'Plan Gratis para Entrenar en Casa', accent: 'Sin Material', metaTitle: 'Plan Gratis de Entrenamiento en Casa sin Material | Full Balance',
      description: 'Sigue un plan gratis para entrenar en casa sin material, adaptado a tu nivel, semana y objetivo con series, repeticiones y progresión claras.',
      hero: 'Entrena en casa con movimientos de peso corporal adecuados a tu nivel. Cada sesión muestra orden, series, repeticiones, descanso y alternativas fáciles.',
      sections: [['Pensado para una casa real', 'El plan utiliza peso corporal y espacio doméstico, no poleas ni máquinas exclusivas del gimnasio.'], ['Progreso sin rutinas aleatorias', 'Las repeticiones, el tempo, el rango y las variantes avanzan mediante fases estructuradas.'], ['Semana clara', 'Consulta días de entrenamiento, recuperación y duración antes de empezar.']],
      faqs: [['¿Necesito mancuernas?', 'No. El plan está diseñado con peso corporal y sin material de gimnasio.'], ['¿Sirve para principiantes?', 'Sí. La dificultad y el volumen semanal se adaptan a la experiencia.'], ['¿Cómo aumento la dificultad?', 'El plan progresa con repeticiones, tempo más lento, rango y variantes más exigentes.']],
    },
  },
  homeDumbbell: {
    paths: { tr: '/evde-dambil-antrenman-programi', en: '/en/home-dumbbell-workout-plan', es: '/es/entrenamiento-en-casa-con-mancuernas' },
    category: 'workout',
    en: {
      title: 'Free Personalized Home Dumbbell', accent: 'Workout Plan', metaTitle: 'Free Personalized Home Dumbbell Workout Plan | Full Balance',
      description: 'Create a free personalized home dumbbell workout plan for your goal and level, with sets, reps, rest, progression and an allergy-aware nutrition plan.',
      hero: 'Train at home with dumbbells or resistance bands and no gym machines. Get a structured weekly plan matched to your level, goal and recovery.',
      sections: [['Uses the equipment you selected', 'Home-equipment plans use dumbbells and resistance bands while excluding cable stations, barbells and gym-only machines.'], ['Clear progression', 'Each session provides exercise order, sets, rep ranges and rest, while later phases increase training demand in a controlled way.'], ['Nutrition alongside training', 'Calorie and macro targets, meal ideas and a shopping list support the same goal and account for selected allergies and dietary preferences.']],
      faqs: [['What equipment do I need?', 'A pair of dumbbells or a resistance band is enough for this option. The plan does not require gym machines.'], ['Can beginners use the plan?', 'Yes. Exercise selection and weekly volume are adapted to experience.'], ['Is the nutrition plan included?', 'Yes. Training and an allergy-aware nutrition plan are included for free.']],
    },
    es: {
      title: 'Plan Gratis en Casa', accent: 'con Mancuernas', metaTitle: 'Plan Gratis en Casa con Mancuernas | Full Balance',
      description: 'Crea gratis un plan personalizado para entrenar en casa con mancuernas según tu objetivo y nivel, con series, repeticiones, descanso, progresión y nutrición.',
      hero: 'Entrena en casa con mancuernas o bandas y sin máquinas de gimnasio. Recibe una semana estructurada según tu nivel, objetivo y recuperación.',
      sections: [['Respeta el material elegido', 'Los planes de casa con material utilizan mancuernas y bandas, y excluyen poleas, barras y máquinas exclusivas del gimnasio.'], ['Progresión clara', 'Cada sesión muestra orden, series, repeticiones y descanso; las fases siguientes aumentan la carga de forma controlada.'], ['Nutrición junto al entrenamiento', 'Calorías, macros, ideas de comidas y lista de compra siguen el mismo objetivo y consideran alergias y preferencias alimentarias.']],
      faqs: [['¿Qué material necesito?', 'Un par de mancuernas o una banda de resistencia es suficiente. No necesitas máquinas de gimnasio.'], ['¿Sirve para principiantes?', 'Sí. Los ejercicios y el volumen semanal se adaptan a la experiencia.'], ['¿Incluye nutrición?', 'Sí. El entrenamiento y el plan nutricional adaptado a alergias están incluidos gratis.']],
    },
  },
  homeMuscle: {
    paths: { tr: '/evde-kas-gelistirme-hareketleri', en: '/en/home-muscle-building-workout', es: '/es/ejercicios-en-casa-ganar-musculo' },
    category: 'workout',
    en: {
      title: 'Home Muscle Building Workout', accent: 'Bodyweight Progression', metaTitle: 'Free Home Muscle Building Workout Plan | Full Balance',
      description: 'Build a free home muscle workout with bodyweight progressions, weekly volume, rest guidance and nutrition targets without gym-only exercises.',
      hero: 'Use practical bodyweight progressions at home and connect training volume with recovery, calories and protein.',
      sections: [['Movement patterns first', 'Push, squat, hinge, single-leg, core and safe pulling alternatives create a balanced base.'], ['Progression that makes sense', 'Increase repetitions, range, tempo or variation only when the current level is controlled.'], ['Recovery supports growth', 'Protein, energy intake, sleep and rest days sit alongside the workout plan.']],
      faqs: [['Can bodyweight training build muscle?', 'It can support muscle growth when exercises are challenging, progression is consistent and recovery is adequate.'], ['Does the plan include gym exercises?', 'No. This page is specifically for home-friendly bodyweight training.'], ['What if an exercise is too hard?', 'Use the listed easier variation and progress after you can perform it with control.']],
    },
    es: {
      title: 'Ejercicios en Casa para Ganar Músculo', accent: 'Progresión con Peso Corporal', metaTitle: 'Plan Gratis para Ganar Músculo en Casa | Full Balance',
      description: 'Crea un plan gratis para ganar músculo en casa con progresiones de peso corporal, volumen semanal, descanso y objetivos de nutrición.',
      hero: 'Utiliza progresiones prácticas en casa y conecta el volumen de entrenamiento con recuperación, calorías y proteína.',
      sections: [['Primero los patrones básicos', 'Empuje, sentadilla, bisagra, trabajo unilateral, core y alternativas de tirón forman una base equilibrada.'], ['Progresión con sentido', 'Aumenta repeticiones, rango, tempo o variante solo cuando controles el nivel actual.'], ['La recuperación ayuda a crecer', 'Proteína, energía, sueño y descanso acompañan al plan.']],
      faqs: [['¿El peso corporal puede desarrollar músculo?', 'Puede favorecerlo si los ejercicios son exigentes, existe progresión y la recuperación es suficiente.'], ['¿Incluye ejercicios de gimnasio?', 'No. Esta página está dedicada a entrenamiento doméstico con peso corporal.'], ['¿Qué hago si un ejercicio es difícil?', 'Utiliza la variante más fácil y progresa cuando puedas ejecutarla con control.']],
    },
  },
  beginnerPilates: {
    paths: { tr: '/baslangic-pilates-programi', en: '/en/pilates-workout-at-home', es: '/es/pilates-en-casa-principiantes' },
    category: 'wellness',
    en: {
      title: 'Beginner Pilates Workout at Home', accent: 'Free Mat Plan', metaTitle: 'Free Beginner Pilates Workout at Home | Full Balance',
      description: 'Start a free beginner mat Pilates plan at home with controlled sessions for breathing, core stability, posture, mobility and gradual progression.',
      hero: 'Begin with short mat sessions that explain breathing, alignment and control before adding complexity.',
      sections: [['A calm starting point', 'Early sessions prioritize breathing, neutral alignment and controlled range instead of speed.'], ['Core beyond crunches', 'Stability, pelvic control and coordinated movement build a practical foundation.'], ['Gradual progression', 'Session length and movement complexity increase only after the basics feel controlled.']],
      faqs: [['Do I need a reformer?', 'No. This is a mat Pilates plan for home practice.'], ['Is it suitable for complete beginners?', 'Yes. It begins with accessible movements and short sessions.'], ['How often should I practise?', 'The plan places manageable sessions and recovery across your available week.']],
    },
    es: {
      title: 'Pilates en Casa para Principiantes', accent: 'Plan Gratis en Esterilla', metaTitle: 'Pilates Gratis en Casa para Principiantes | Full Balance',
      description: 'Empieza un plan gratis de pilates en esterilla con sesiones controladas para respiración, core, postura, movilidad y progresión gradual.',
      hero: 'Comienza con sesiones breves que explican respiración, alineación y control antes de añadir complejidad.',
      sections: [['Un inicio tranquilo', 'Las primeras sesiones priorizan respiración, alineación neutra y rango controlado, no velocidad.'], ['Core más allá de abdominales', 'La estabilidad, el control pélvico y el movimiento coordinado crean una base útil.'], ['Progresión gradual', 'La duración y complejidad aumentan solo cuando dominas las bases.']],
      faqs: [['¿Necesito reformer?', 'No. Es un plan de pilates en esterilla para casa.'], ['¿Sirve si nunca hice pilates?', 'Sí. Empieza con movimientos accesibles y sesiones cortas.'], ['¿Cuántas veces por semana?', 'El plan distribuye sesiones manejables y recuperación según tus días disponibles.']],
    },
  },
  calories: {
    paths: { tr: '/gunluk-kalori-ihtiyaci-hesaplama', en: '/en/calorie-macro-calculator', es: '/es/calculadora-calorias-macros' },
    category: 'nutrition', calculator: 'calories',
    en: {
      title: 'Free Daily Calorie Calculator', accent: 'BMR, Maintenance and Deficit', metaTitle: 'Daily Calorie Calculator: BMR, Maintenance and Deficit | Full Balance',
      description: 'Calculate your basal metabolic rate, maintenance calories and a target for fat loss or muscle gain from age, height, weight, sex and activity. Free, no signup, with macros.',
      hero: 'Get three numbers in seconds: BMR (what you burn at rest), maintenance (with your activity) and a daily target for your goal, split into protein, carbs and fat.',
      sections: [['Mifflin-St Jeor, the formula that holds up', 'BMR = 10 × kg + 6.25 × cm − 5 × age + 5 for men, −161 for women; the most consistent practical equation in validation studies.'], ['A deficit that you can keep', 'Fat loss uses a 15% deficit from maintenance, about 300-500 kcal for most adults, never below your BMR. Muscle gain adds 10%.'], ['Macros and a plan, not just a number', 'Protein is set from body weight, carbs and fat fill the rest. Save the result and the free plan builds seven days of meals and workouts around it.']],
      faqs: [['How many calories should I eat to lose weight?', 'About 15% below your maintenance calories, which is 300-500 kcal per day for most adults. Going below your BMR is not recommended; the calculator shows that floor.'], ['How is a calorie deficit calculated?', 'Maintenance = BMR × activity factor. A percentage is then removed depending on the goal; this calculator applies a 15% deficit for fat loss.'], ['What is the difference between BMR and maintenance calories?', 'BMR is the energy you burn at complete rest. Maintenance adds daily movement and training, typically 20-90% more depending on activity.'], ['How accurate is this?', 'The formula is based on population averages; individual error is around ±10%. Track your weight trend for two to three weeks and adjust by 100-150 kcal; the app suggests this automatically.']],
    },
    es: {
      title: 'Calculadora de Calorías Diarias', accent: 'TMB, Mantenimiento y Déficit', metaTitle: 'Calculadora de Calorías Diarias: TMB, Mantenimiento y Déficit | Full Balance',
      description: 'Calcula tu tasa metabólica basal, tus calorías de mantenimiento y un objetivo para adelgazar o ganar músculo según edad, altura, peso, sexo y actividad. Gratis, sin registro y con macros.',
      hero: 'Tres cifras en segundos: TMB (lo que gastas en reposo), mantenimiento (con tu actividad) y un objetivo diario para tu meta, repartido en proteína, carbohidratos y grasa.',
      sections: [['Mifflin-St Jeor, la fórmula que mejor funciona', 'TMB = 10 × kg + 6,25 × cm − 5 × edad + 5 en hombres, −161 en mujeres; la ecuación práctica más consistente en estudios de validación.'], ['Un déficit que puedes mantener', 'Para perder grasa o bajar de peso se aplica un 15% por debajo del mantenimiento, unas 300-500 kcal para la mayoría de adultos, nunca por debajo de la TMB. Para ganar músculo se suma un 10%.'], ['Macros y un plan, no solo un número', 'La proteína se fija según el peso corporal; carbohidratos y grasa completan el resto. Guarda el resultado y el plan gratis crea siete días de comidas y entrenamientos.']],
      faqs: [['¿Cuántas calorías debo comer para adelgazar o bajar de peso?', 'Alrededor de un 15% por debajo de tu mantenimiento, es decir 300-500 kcal diarias para la mayoría de adultos. No conviene bajar de la TMB; la calculadora muestra ese límite.'], ['¿Cómo se calcula el déficit calórico?', 'Mantenimiento = TMB × factor de actividad. Luego se resta un porcentaje según el objetivo; esta calculadora aplica un 15% para perder grasa.'], ['¿Qué diferencia hay entre TMB y calorías de mantenimiento?', 'La TMB es la energía que gastas en reposo absoluto. El mantenimiento añade el movimiento diario y el entrenamiento, normalmente un 20-90% más según la actividad.'], ['¿Qué tan precisa es?', 'La fórmula se basa en promedios poblacionales; el error individual ronda el ±10%. Sigue tu tendencia de peso dos o tres semanas y ajusta 100-150 kcal; la app lo sugiere automáticamente.']],
    },
  },
  resistanceBand: {
    paths: { tr: '/direnc-bandi-antrenman-programi', en: '/en/resistance-band-workout-plan', es: '/es/rutina-con-bandas-elasticas' },
    category: 'workout',
    en: {
      title: 'Resistance Band Workout Plan', accent: 'Full Body at Home, Free', metaTitle: 'Resistance Band Workout Plan for Beginners: 4 Weeks at Home | Full Balance',
      description: 'A free full-body resistance band workout plan for home: exercise order, sets, reps, rest and weekly progression by level, plus which band strength to buy and whether bands build muscle.',
      hero: 'One pair of bands and a door are enough. The plan sequences pull, push, hip and core movements around band resistance and progresses through band thickness, reps and tempo.',
      sections: [['Which band, what resistance?', 'A medium 10-20 kg band covers most movements for a beginner; a heavier 20-35 kg band makes pulls and squats easier to load. The plan asks you to reach the top of the rep range before buying a heavier band.'], ['Do bands build muscle?', 'Yes, with enough effort and weekly volume. Band tension peaks at the end of the movement, so the plan uses slow lowering, pauses and single-side variations to extend time under tension.'], ['Bands plus dumbbells', 'If you also own dumbbells, the plan uses them for pushes and legs and bands for pulls and shoulders. Bands only? The whole plan is built around them.']],
      faqs: [['Can you build muscle with resistance bands?', 'Yes. Muscle growth depends on effort and weekly sets, not on whether the tool is a dumbbell or a band. Bands give most resistance at the hardest point; the plan exploits that with slow lowering and pauses.'], ['What resistance band should a beginner buy?', 'A medium band (10-20 kg) for most movements and a heavier one (20-35 kg) for rows and squats. Start with one and add the next when you reach the top of the rep range.'], ['Do I need a door anchor?', 'It helps for rows and back work but is not required; without one the plan uses seated rows with the band under your feet.'], ['How many days a week?', 'Three full-body days with rest in between to start, up to four later. Rest days never break your streak.']],
    },
    es: {
      title: 'Rutina con Bandas Elásticas', accent: 'Cuerpo Completo en Casa, Gratis', metaTitle: 'Rutina con Bandas Elásticas para Principiantes: 4 Semanas en Casa | Full Balance',
      description: 'Rutina gratis de cuerpo completo con bandas elásticas en casa: orden de ejercicios, series, repeticiones, descanso y progresión semanal por nivel, qué banda comprar y si sirven para ganar músculo.',
      hero: 'Un par de bandas y una puerta bastan. La rutina ordena tracciones, empujes, cadera y core según la resistencia de la banda y progresa con el grosor, las repeticiones y el tempo.',
      sections: [['¿Qué banda y qué resistencia?', 'Una banda media de 10-20 kg cubre casi todo para un principiante; una de 20-35 kg facilita remos y sentadillas. La rutina te pide llegar al tope del rango de repeticiones antes de comprar una banda más dura.'], ['¿Las bandas sirven para ganar músculo?', 'Sí, con suficiente esfuerzo y volumen semanal. La tensión de la banda es máxima al final del movimiento, por eso la rutina usa bajadas lentas, pausas y variantes unilaterales.'], ['Bandas y mancuernas', 'Si también tienes mancuernas, la rutina las usa en empujes y piernas y las bandas en tracciones y hombros. ¿Solo bandas? Toda la rutina se construye con ellas.']],
      faqs: [['¿Se puede ganar músculo con bandas elásticas?', 'Sí. Ganar músculo depende del esfuerzo y de las series semanales, no de si usas mancuerna o banda. La banda da más resistencia en el punto más difícil; la rutina lo aprovecha con bajadas lentas y pausas.'], ['¿Qué banda debe comprar un principiante?', 'Una media (10-20 kg) para casi todo y una dura (20-35 kg) para remos y sentadillas. Empieza con una y añade la siguiente cuando llegues al tope del rango.'], ['¿Necesito anclaje de puerta?', 'Ayuda para remos y espalda pero no es obligatorio; sin él la rutina usa remos sentado con la banda bajo los pies.'], ['¿Cuántos días por semana?', 'Tres días de cuerpo completo con descanso entre ellos al principio, hasta cuatro después. Los días de descanso no rompen tu racha.']],
    },
  },
  fourWeekHome: {
    paths: { tr: '/30-gunluk-evde-spor-programi', en: '/en/4-week-home-workout-plan', es: '/es/rutina-4-semanas-en-casa' },
    category: 'workout',
    en: {
      title: '4-Week Home Workout Plan', accent: 'No Equipment, Printable', metaTitle: '4-Week Home Workout Plan for Beginners: No Equipment, Printable | Full Balance',
      description: 'A free 4-week (30-day) home workout plan without equipment: sets, reps, rest and a week-by-week progression you can print or track in the app.',
      hero: 'Instead of random videos, a plan that grows week by week: week 1 learn the movements, week 2 more reps, week 3 harder variations, week 4 volume and a light finish. A real sample week and the 4-week progression table are below.',
      sections: [['How the weeks progress', 'The exercises stay the same; sets, rep ranges and tempo change. That lets you learn form and measure progress. After 30 days the plan moves you to the next phase.'], ['Rest days are part of it', '30 days does not mean 30 workouts. Three training days and two easy walking days per week; rest days never break your streak.'], ['Print it or track it', 'Print the sample week for the fridge, or follow it in the app where completed days, streaks and pain feedback adapt the next session automatically.']],
      faqs: [['How much progress in 30 days?', 'A beginner gains noticeable strength, endurance, better form and the habit itself. Visible body change takes 8-12 weeks together with nutrition and sleep, which is why the plan moves to a next phase after 30 days.'], ['Do I need to train every day?', 'No. Three workouts and two easy movement days per week recover better and stick longer. Pain feedback makes the next session easier.'], ['Can I download it as a PDF?', 'Yes. Use Print on the sample week to save it as a PDF. Your full personal plan exports from the app as a report.'], ['Is it enough to lose weight?', 'Only together with a calorie deficit. This plan targets fat loss; set your target with the daily calorie calculator and pair it with the nutrition plan in the app.']],
    },
    es: {
      title: 'Rutina de 4 Semanas en Casa', accent: 'Sin Material, Imprimible', metaTitle: 'Rutina de 4 Semanas en Casa para Principiantes: Sin Material, Imprimible | Full Balance',
      description: 'Rutina gratis de 4 semanas (30 días) en casa sin material: series, repeticiones, descanso y progresión semana a semana que puedes imprimir o seguir en la app.',
      hero: 'En lugar de vídeos sueltos, una rutina que crece cada semana: semana 1 aprender los movimientos, semana 2 más repeticiones, semana 3 variantes más difíciles, semana 4 volumen y cierre ligero. Abajo tienes una semana real de ejemplo y la tabla de progresión.',
      sections: [['Cómo progresan las semanas', 'Los ejercicios se mantienen; cambian series, rango de repeticiones y tempo. Así aprendes la técnica y mides el progreso. Tras 30 días la rutina pasa a la siguiente fase.'], ['Los descansos forman parte', '30 días no son 30 entrenamientos. Tres días de entrenamiento y dos de caminata suave por semana; los descansos no rompen tu racha.'], ['Imprímela o síguela en la app', 'Imprime la semana de ejemplo para la nevera, o síguela en la app, donde los días completados, la racha y el dolor reportado adaptan la siguiente sesión.']],
      faqs: [['¿Cuánto se progresa en 30 días?', 'Un principiante gana fuerza y resistencia notables, mejor técnica y el hábito. El cambio visible tarda 8-12 semanas junto con nutrición y sueño; por eso la rutina pasa a una nueva fase tras 30 días.'], ['¿Hay que entrenar todos los días?', 'No. Tres entrenamientos y dos días de movimiento suave por semana recuperan mejor y se mantienen más. Si reportas dolor, la siguiente sesión se hace más fácil.'], ['¿Puedo descargarla en PDF?', 'Sí. Usa Imprimir en la semana de ejemplo para guardarla como PDF. Tu plan personal completo se exporta desde la app como informe.'], ['¿Basta para adelgazar o bajar de peso?', 'Solo junto con un déficit calórico. Esta rutina está pensada para perder grasa; fija tu objetivo con la calculadora de calorías y combínala con el plan de nutrición de la app.']],
    },
  },
  womenHome: {
    paths: { tr: '/kadinlar-icin-evde-spor-programi', en: '/en/home-workout-plan-for-women', es: '/es/rutina-en-casa-mujeres' },
    category: 'workout',
    en: {
      title: 'Home Workout Plan for Women', accent: 'Beginner, Free', metaTitle: 'Home Workout Plan for Women Beginners: Glutes, Core and Full Body | Full Balance',
      description: 'A free home workout plan for women: balanced weekly plan for glutes, legs, core and upper body, with or without dumbbells, and calories set for fat loss or toning.',
      hero: 'Glute, leg and core focus without neglecting the upper body. Start with no equipment and keep the same plan with dumbbells later; calories and protein follow your fat-loss or toning goal.',
      sections: [['Glutes and legs, in balance', 'Squats, hip bridges, lunges and single-leg work twice a week, with pushes and pulls so posture and upper body improve too.'], ['If the goal is fat loss', 'Strength training and enough protein protect muscle while you keep a calorie deficit. Waist measurements and weekly trends matter more than the scale.'], ['Energy and cycle', 'On low-energy days the plan offers easier variations and pain feedback pauses progression. Pregnancy and postpartum training need medical clearance first.']],
      faqs: [['Will weights make women bulky?', 'Large muscle gain needs high volume, years and hormonal conditions; three home sessions a week produce toning, strength and better posture. That is why the plan is built on strength movements.'], ['Can I lose weight without equipment?', 'Yes, together with a calorie deficit. Bodyweight training protects muscle; set your calories with the daily calorie calculator and pair it with the nutrition plan.'], ['What dumbbells should I buy?', 'A pair of 3-5 kg for upper body and a single 8-12 kg for hips and legs are enough to start; move up when you reach the top of the rep range.'], ['How many days and minutes?', 'Three 30-40 minute sessions plus two easy walks per week. Rest days never break your streak.']],
    },
    es: {
      title: 'Rutina en Casa para Mujeres', accent: 'Principiantes, Gratis', metaTitle: 'Rutina en Casa para Mujeres Principiantes: Glúteos, Core y Cuerpo Completo | Full Balance',
      description: 'Rutina gratis en casa para mujeres: semana equilibrada de glúteos, piernas, core y tren superior, con o sin mancuernas, y calorías ajustadas para perder grasa o tonificar.',
      hero: 'Enfoque en glúteos, piernas y core sin olvidar el tren superior. Empieza sin material y mantén la misma rutina con mancuernas más adelante; calorías y proteína siguen tu objetivo de perder grasa o tonificar.',
      sections: [['Glúteos y piernas, con equilibrio', 'Sentadillas, puentes de cadera, zancadas y trabajo unilateral dos veces por semana, con empujes y tracciones para mejorar postura y tren superior.'], ['Si el objetivo es perder grasa', 'La fuerza y la proteína suficiente protegen el músculo mientras mantienes el déficit calórico. La cintura y la tendencia semanal importan más que la báscula.'], ['Energía y ciclo', 'En días de baja energía la rutina ofrece variantes más fáciles y el dolor reportado pausa la progresión. Embarazo y posparto requieren autorización médica antes de empezar.']],
      faqs: [['¿Las pesas hacen que las mujeres se pongan voluminosas?', 'Un gran aumento muscular requiere mucho volumen, años y condiciones hormonales; tres sesiones semanales en casa dan tonificación, fuerza y mejor postura. Por eso la rutina se basa en fuerza.'], ['¿Puedo bajar de peso sin material?', 'Sí, junto con un déficit calórico. El peso corporal protege el músculo; fija las calorías con la calculadora y combínalas con el plan de nutrición.'], ['¿Qué mancuernas comprar?', 'Un par de 3-5 kg para el tren superior y una de 8-12 kg para cadera y piernas bastan para empezar; sube cuando llegues al tope del rango.'], ['¿Cuántos días y minutos?', 'Tres sesiones de 30-40 minutos más dos caminatas suaves por semana. Los descansos no rompen tu racha.']],
    },
  },
  over40: {
    paths: { tr: '/40-yas-ustu-evde-spor-programi', en: '/en/beginner-workout-plan-over-40', es: '/es/rutina-en-casa-mayores-40' },
    category: 'workout',
    en: {
      title: 'Beginner Workout Plan Over 40', accent: 'Joint-Friendly, at Home', metaTitle: 'Beginner Workout Plan Over 40 at Home: Joint-Friendly Strength and Balance | Full Balance',
      description: 'A free beginner home workout plan for people over 40 and 50: joint-friendly strength, balance and mobility with longer rest and controlled progression, adapted to health notes.',
      hero: 'Muscle and bone density need protecting after 40. The plan combines strength, balance and mobility and swaps movements based on knee, back or shoulder notes.',
      sections: [['Strength comes first', 'Two or three strength days a week are the foundation of muscle and bone health. Movements start supported: squats to a chair, push-ups against a wall or table.'], ['Balance and mobility', 'Single-leg stands and hip and shoulder mobility flows are in every session; they do the most for fall risk and morning stiffness.'], ['Longer rest, slower increases', 'Rest between sets is longer and weekly increases are small. Pain feedback makes a movement easier; heart, blood pressure or joint conditions need medical clearance first.']],
      faqs: [['Is it too late to start after 40?', 'No. Muscle and bone respond to training at any age; the difference is a more controlled start and longer recovery.'], ['How often should you work out over 40?', 'Two or three strength sessions plus a short daily walk is a solid start. The plan schedules rest days and they never break your streak.'], ['What if my knees or back hurt?', 'Mark it during signup and the plan replaces deep squats, jumps and floor lifts with supported variations. New or sharp pain needs a doctor.'], ['Do I need equipment?', 'No. A chair, a wall and a mat are enough; dumbbells or bands are used if you have them.']],
    },
    es: {
      title: 'Rutina en Casa para Mayores de 40', accent: 'Cuidando las Articulaciones', metaTitle: 'Rutina en Casa para Mayores de 40 Principiantes: Fuerza y Equilibrio sin Dañar Articulaciones | Full Balance',
      description: 'Rutina gratis para principiantes mayores de 40 y 50 en casa: fuerza, equilibrio y movilidad respetando las articulaciones, con más descanso y progresión controlada según tus notas de salud.',
      hero: 'Músculo y densidad ósea necesitan protección después de los 40. La rutina combina fuerza, equilibrio y movilidad y cambia los movimientos según tus notas de rodilla, espalda u hombro.',
      sections: [['La fuerza va primero', 'Dos o tres días de fuerza por semana son la base de la salud muscular y ósea. Los movimientos empiezan con apoyo: sentadilla a una silla, flexiones contra la pared o una mesa.'], ['Equilibrio y movilidad', 'Apoyos a una pierna y flujos de movilidad de cadera y hombro en cada sesión; es lo que más reduce el riesgo de caídas y la rigidez matinal.'], ['Más descanso, aumentos más lentos', 'El descanso entre series es mayor y los aumentos semanales son pequeños. Si reportas dolor, el movimiento se facilita; problemas cardíacos, de tensión o articulares requieren autorización médica.']],
      faqs: [['¿Es tarde para empezar después de los 40?', 'No. Músculo y hueso responden al entrenamiento a cualquier edad; la diferencia es un inicio más controlado y una recuperación más larga.'], ['¿Cuántas veces por semana?', 'Dos o tres sesiones de fuerza más una caminata corta diaria es un buen comienzo. La rutina programa los descansos y no rompen tu racha.'], ['¿Y si me duelen las rodillas o la espalda?', 'Márcalo al registrarte y la rutina cambia sentadillas profundas, saltos y levantamientos del suelo por variantes con apoyo. Un dolor nuevo o agudo requiere médico.'], ['¿Necesito material?', 'No. Una silla, una pared y una esterilla bastan; si tienes mancuernas o bandas, se usan.']],
    },
  },
  photoCalories: {
    paths: { tr: '/fotografla-kalori-hesaplama', en: '/en/photo-calorie-counter', es: '/es/contar-calorias-con-foto' },
    category: 'nutrition', mealTool: true,
    en: {
      title: 'Free Photo Calorie Counter', accent: 'AI Meal Estimate in Your Browser', metaTitle: 'Free Photo Calorie Counter: AI Meal Estimate, No App Needed | Full Balance',
      description: 'Upload a meal photo and let AI recognise the foods and portions, then get calories and macros in a realistic range. Free, no signup, no subscription, photo never stored.',
      hero: 'Works in your browser with no app download, no sign-up and no scan limit. Snap your plate; foods, estimated grams, calories and macros come back automatically from a 200+ food database. Add suspected oil or sauce with one tap and fix any portion.',
      sections: [['How it works', 'A vision model lists every visible food and estimates grams; calories and macros come from a 200+ food nutrition database, not from numbers the model makes up.'], ['Why a range instead of one number', 'One photo cannot reveal portion depth, absorbed cooking oil or sauce. The tool shows a low-high range based on model confidence and asks you to confirm hidden ingredients.'], ['Your photo is not stored', 'The image is downsized on your device and processed only for the analysis. It is never saved to an account or server, and no signup is required.']],
      faqs: [['Is it really free with no sign-up and no scan limit?', 'Yes. It runs in the browser; there is no app to download, no account, no credit card and no daily scan cap. The only limit is 12 analyses per minute to prevent abuse.'], ['Can AI calculate exact calories from a photo?', 'No. A single image cannot reliably show portion volume, cooking oil or hidden ingredients. The tool recognises foods, estimates grams and shows a safe range that you can correct.'], ['Is my meal photo uploaded or kept?', 'It is downsized on your device and processed only for the analysis. It is not saved to your account, gallery or server.'], ['Do I need an app or an account?', 'No. It runs in the browser, is free and needs no signup. An account is only for a personal plan and progress tracking.'], ['When does the AI get it wrong?', 'Stacked foods, mixed dishes like soups and stews, items outside the frame and absorbed oil are the usual causes. In those cases confidence drops, hidden ingredients are suggested and editing the grams improves the result.']],
    },
    es: {
      title: 'Contar Calorías con Foto', accent: 'Gratis con IA, sin App', metaTitle: 'Contar Calorías con Foto Gratis: Estimación con IA sin App | Full Balance',
      description: 'Sube la foto de tu comida y deja que la IA reconozca alimentos y porciones; recibe calorías y macros en un rango realista. Gratis, sin registro, sin suscripción y sin guardar la foto.',
      hero: 'Funciona en el navegador sin descargar app, sin registro y sin límite de escaneos. Fotografía tu plato; alimentos, gramos estimados, calorías y macros llegan automáticamente desde una base de más de 200 alimentos. Añade aceite o salsa sospechosa con un toque y corrige cualquier porción.',
      sections: [['Cómo funciona', 'Un modelo de visión lista cada alimento visible y estima los gramos; calorías y macros salen de una base de datos de más de 200 alimentos, no de cifras inventadas por el modelo.'], ['Por qué un rango y no una cifra', 'Una foto no revela el volumen, el aceite absorbido ni la salsa. La herramienta muestra un rango según la confianza del modelo y pide confirmar los ingredientes ocultos.'], ['Tu foto no se guarda', 'La imagen se reduce en tu dispositivo y se procesa solo para el análisis. Nunca se guarda en una cuenta ni en un servidor, y no hace falta registrarse.']],
      faqs: [['¿Es gratis de verdad, sin registro y sin límite de escaneos?', 'Sí. Funciona en el navegador; no hay app que descargar, ni cuenta, ni tarjeta, ni tope diario de escaneos. El único límite es de 12 análisis por minuto para evitar abusos.'], ['¿La IA calcula calorías exactas con una foto?', 'No. Una sola imagen no muestra con fiabilidad el volumen, el aceite ni los ingredientes ocultos. La herramienta reconoce alimentos, estima gramos y muestra un rango seguro que puedes corregir.'], ['¿Se sube o se guarda mi foto?', 'Se reduce en tu dispositivo y se procesa solo para el análisis. No se guarda en tu cuenta, galería ni servidor.'], ['¿Necesito una app o una cuenta?', 'No. Funciona en el navegador, es gratis y no requiere registro. La cuenta solo sirve para un plan personal y el seguimiento.'], ['¿Cuándo falla la IA?', 'Alimentos apilados, platos mixtos como sopas y guisos, partes fuera del encuadre y aceite absorbido son las causas habituales. En esos casos baja la confianza, se sugieren ingredientes ocultos y editar los gramos mejora el resultado.']],
    },
  },
  protein: {
    paths: { tr: '/protein-ihtiyaci-hesaplama', en: '/en/protein-calculator', es: '/es/calculadora-proteina' },
    category: 'nutrition', calculator: 'protein',
    en: {
      title: 'Free Protein Calculator', accent: 'Grams per Day', metaTitle: 'Free Protein Calculator by Weight and Goal | Full Balance',
      description: 'Calculate a daily protein range in grams from your body weight, activity and goal. Use kilograms or pounds and get a free result without signup.',
      hero: 'Enter your weight, activity and goal to estimate a practical daily protein range in grams. The calculator is free and works without an account.',
      sections: [['Calculated from your weight', 'Use kilograms or pounds and receive a daily lower and upper target instead of one falsely precise number.'], ['Adjusted by activity and goal', 'Maintenance, muscle gain and fat loss contexts influence the estimated range.'], ['Turn grams into meals', 'Save the range only if you want meal ideas and a nutrition plan that distribute it across the day.']],
      faqs: [['How many grams of protein do I need per day?', 'The result depends on body weight, activity and goal, so the calculator provides a practical range rather than one universal number.'], ['Can I calculate with pounds?', 'Yes. Choose imperial units and enter your weight in pounds.'], ['Do I need an account?', 'No. The protein calculation works without registration.']],
    },
    es: {
      title: 'Calculadora Gratis de Proteína Diaria', accent: 'Según tu Objetivo', metaTitle: 'Calculadora de Proteína por Peso y Objetivo | Full Balance',
      description: 'Estima un rango práctico de proteína diaria según peso, actividad y objetivo. Calculadora métrica e imperial gratis y sin registro.',
      hero: 'Obtén un rango práctico en lugar de una cifra rígida y conviértelo después en comidas adaptadas a tu objetivo.',
      sections: [['Un rango útil', 'Las necesidades varían, por eso el resultado incluye un objetivo diario mínimo y máximo.'], ['Estimación según tu objetivo', 'La actividad y tu objetivo de mantener, ganar músculo o perder grasa influyen en el rango.'], ['Distribución entre comidas', 'Un plan guardado en Full Balance ayuda a repartir el objetivo durante un día realista.']],
      faqs: [['¿Por qué es un rango?', 'Las necesidades cambian según entrenamiento, energía y contexto individual; un rango evita una precisión falsa.'], ['¿Puedo usar libras?', 'Sí. Elige el sistema imperial e introduce tu peso en libras.'], ['¿Más proteína siempre es mejor?', 'No. Una cantidad mayor no siempre es mejor y la calidad total de la dieta sigue importando.']],
    },
  },
  bmi: {
    paths: { tr: '/bmi-hesaplama', en: '/en/bmi-calculator', es: '/es/calculadora-imc' },
    category: 'progress', calculator: 'bmi',
    en: {
      title: 'Free Imperial BMI Calculator', accent: 'Pounds, Feet or Metric', metaTitle: 'Free Imperial BMI Calculator (lb, ft & in) | Full Balance',
      description: 'Calculate adult BMI with pounds, feet and inches or metric units. Get a free instant result with no signup, subscription or credit card.',
      hero: 'Enter height and weight in imperial or metric units and see your BMI instantly. No account is needed to use the calculator.',
      sections: [['Imperial and metric units', 'Use pounds, feet and inches or switch to kilograms and centimeters.'], ['Clear adult context', 'BMI is a population-level screening measure and does not directly measure body fat or fitness.'], ['Track more than weight', 'Full Balance can combine weight with measurements, workouts, sleep, water and weekly trends.']],
      faqs: [['How do I calculate BMI with pounds and inches?', 'Choose imperial units, enter weight in pounds and height in feet and inches; the calculator applies the imperial conversion automatically.'], ['Does BMI measure body fat?', 'No. BMI uses height and weight and does not directly measure body composition.'], ['Is BMI a diagnosis?', 'No. It is a screening measure and should not be used as a diagnosis.']],
    },
    es: {
      title: 'Calculadora de IMC Gratis', accent: 'Métrica e Imperial', metaTitle: 'Calculadora de IMC Gratis (Métrica e Imperial) | Full Balance',
      description: 'Calcula tu IMC gratis con kilos y centímetros o con libras, pies y pulgadas. Resultado inmediato para adultos, categoría orientativa y sin registro.',
      hero: 'Introduce tu peso y altura en sistema métrico o imperial para calcular el IMC al instante. La calculadora es gratis y no requiere una cuenta.',
      sections: [['Peso y altura en dos sistemas', 'Utiliza kilos y centímetros o cambia a libras, pies y pulgadas.'], ['Resultado y categoría al instante', 'Consulta el valor calculado junto con el rango orientativo estándar para adultos.'], ['Más que el peso', 'Full Balance combina peso con medidas, entrenamiento, sueño, agua y tendencias semanales.']],
      faqs: [['¿Cómo calcular mi IMC?', 'Introduce tu peso y altura, elige el sistema métrico o imperial y la calculadora hará la operación automáticamente.'], ['¿El IMC mide la grasa corporal?', 'No. Utiliza altura y peso y no mide directamente la composición corporal.'], ['¿Es un diagnóstico?', 'No. Es una medida orientativa y no debe utilizarse como diagnóstico.']],
    },
  },
  muscle: {
    paths: { tr: '/kas-gelisimi-programi', en: '/en/muscle-gain-workout-plan', es: '/es/plan-ganar-masa-muscular' }, category: 'workout',
    en: { title: 'Free Muscle Gain Plan', accent: 'Workout and Nutrition', metaTitle: 'Free Muscle Gain Workout and Nutrition Plan | Full Balance', description: 'Build a free muscle gain plan for home or gym with level-based workouts, progressive overload, calorie and protein targets and progress tracking.', hero: 'Choose home or gym and connect your weekly strength plan with protein, calories, recovery and measurable progression.', sections: [['A split matched to your level', 'Weekly frequency, exercise selection, sets, rep ranges and rest reflect your experience and available days.'], ['Home and gym stay separate', 'Home plans use bodyweight progressions; gym plans can use the appropriate resistance equipment.'], ['Training and nutrition connect', 'Calorie and protein targets sit beside workout completion, recovery and measurement trends.']], faqs: [['Can beginners use the plan?', 'Yes. Beginner phases use manageable volume and exercise complexity.'], ['Can I build a home plan?', 'Yes. Select home before plan creation to receive bodyweight movements without gym-only machines.'], ['Does it include nutrition?', 'Yes. Calorie, macro and meal guidance supports the training plan.']] },
    es: { title: 'Plan Gratis para Ganar Masa Muscular', accent: 'Entrena con Propósito', metaTitle: 'Plan Gratis para Ganar Masa Muscular | Full Balance', description: 'Crea un plan gratis con entrenamiento según nivel, sobrecarga progresiva, calorías, proteína y seguimiento del progreso.', hero: 'Une entrenamiento, proteína, calorías y progresión en una rutina clara adaptada a tu nivel.', sections: [['Hipertrofia estructurada', 'Utiliza una semana adecuada a tu nivel con series, rangos de repeticiones y recuperación claros.'], ['Calorías y proteína juntas', 'Estima un superávit y un rango de proteína razonables sin separar entrenamiento y alimentación.'], ['Progresión, no azar', 'Registra sesiones y medidas para saber cuándo corresponde progresar.']], faqs: [['¿Sirve para principiantes?', 'Sí. El volumen y la complejidad se ajustan a las fases iniciales.'], ['¿Incluye nutrición?', 'Sí. Las calorías, macros e ideas de comidas apoyan el entrenamiento.'], ['¿Es gratis?', 'Sí. El plan para ganar músculo y el seguimiento esencial son gratis.']] },
  },
  fatLoss: {
    paths: { tr: '/yag-yakimi-programi', en: '/en/fat-loss-workout-plan', es: '/es/plan-perder-grasa' }, category: 'workout',
    en: { title: 'Free Fat Loss Workout Plan', accent: 'Sustainable Progress', metaTitle: 'Free Fat Loss Workout and Nutrition Plan | Full Balance', description: 'Create a sustainable fat loss plan with a calorie target, strength training, activity, protein and weekly trend tracking.', hero: 'Use a manageable calorie target, strength training and real weekly trends instead of extreme restriction.', sections: [['A manageable target', 'Start with an estimated calorie target that can be adjusted using real progress.'], ['Keep strength in the plan', 'Resistance training and adequate protein support performance while losing weight.'], ['Read the weekly trend', 'Review weight alongside activity, sleep, water and consistency rather than reacting to one day.']], faqs: [['Do I need cardio every day?', 'No. Daily movement, resistance training and nutrition consistency are all relevant.'], ['How large should the deficit be?', 'A moderate starting target is generally more manageable than aggressive restriction.'], ['Is the plan free?', 'Yes. The fat loss plan and core tracking tools are free.']] },
    es: { title: 'Plan Gratis para Perder Grasa', accent: 'Progreso Sostenible', metaTitle: 'Plan Gratis para Perder Grasa | Full Balance', description: 'Crea un plan sostenible con calorías objetivo, fuerza, actividad, proteína y seguimiento de tendencias semanales.', hero: 'Utiliza calorías manejables, entrenamiento de fuerza y tendencias reales en lugar de restricciones extremas.', sections: [['Un objetivo manejable', 'Empieza con una estimación de calorías que podrás ajustar según el progreso real.'], ['Mantén la fuerza', 'El entrenamiento de resistencia y una proteína adecuada ayudan a conservar el rendimiento.'], ['Observa la tendencia semanal', 'Revisa el peso junto con actividad, sueño, agua y constancia, sin reaccionar a un solo día.']], faqs: [['¿Necesito cardio diario?', 'No. El movimiento diario, la fuerza y la constancia nutricional son importantes.'], ['¿Qué déficit debo usar?', 'Un punto inicial moderado suele ser más manejable que una restricción agresiva.'], ['¿El plan es gratis?', 'Sí. El plan para perder grasa y el seguimiento esencial son gratis.']] },
  },
  nutrition: {
    paths: { tr: '/ucretsiz-beslenme-programi', en: '/en/free-personal-nutrition-plan', es: '/es/plan-nutricion-personalizado-gratis' }, category: 'nutrition',
    en: { title: 'Free Personal Nutrition Plan', accent: 'Practical Meals', metaTitle: 'Free Personal Nutrition Plan and Shopping List | Full Balance', description: 'Get a free seven-day nutrition plan based on your goal, calorie target, budget, preferences, health information and declared allergies.', hero: 'Turn calorie and macro targets into practical meals and an organized shopping list without a subscription.', sections: [['Built around your context', 'Goal, energy needs, budget, preferences and declared allergies shape the plan.'], ['Seven practical days', 'Meals are organized into a usable weekly structure instead of disconnected suggestions.'], ['Shopping list included', 'Ingredients are grouped into a practical list to reduce planning friction.']], faqs: [['Does it consider allergies?', 'Declared allergies are used to exclude matching foods, but users must still verify labels and medical suitability.'], ['Is this medical nutrition therapy?', 'No. It is general wellness planning and does not replace a registered dietitian or physician.'], ['Is it free?', 'Yes. The personal nutrition plan is free.']] },
    es: { title: 'Plan de Nutrición Personal Gratis', accent: 'Comidas Prácticas', metaTitle: 'Plan de Nutrición y Lista de Compra Gratis | Full Balance', description: 'Obtén siete días de nutrición según objetivo, calorías, presupuesto, preferencias, salud y alergias declaradas.', hero: 'Convierte calorías y macros en comidas prácticas y una lista de compra organizada sin suscripción.', sections: [['Adaptado a tu contexto', 'El objetivo, energía, presupuesto, preferencias y alergias declaradas orientan el plan.'], ['Siete días prácticos', 'Las comidas forman una semana utilizable en lugar de sugerencias aisladas.'], ['Lista de compra incluida', 'Los ingredientes se agrupan en una lista para facilitar la planificación.']], faqs: [['¿Considera alergias?', 'Las alergias declaradas excluyen alimentos relacionados, pero siempre debes comprobar etiquetas e idoneidad médica.'], ['¿Es terapia nutricional?', 'No. Es planificación general de bienestar y no sustituye a un dietista o médico.'], ['¿Es gratis?', 'Sí. El plan de nutrición personal es gratis.']] },
  },
  yoga: {
    paths: { tr: '/yoga-uygulamasi', en: '/en/free-yoga-app', es: '/es/aplicacion-yoga-gratis' }, category: 'wellness',
    en: { title: 'Free Personal Yoga App', accent: 'Practice with Structure', metaTitle: 'Free Personal Yoga and Mobility App | Full Balance', description: 'Create a free yoga plan for flexibility, mobility, breathing and consistency, adapted to your experience and weekly schedule.', hero: 'Turn occasional yoga videos into a clear practice with sessions, progression, recovery and consistency tracking.', sections: [['Level-appropriate practice', 'Sessions reflect your experience instead of using the same flow for everyone.'], ['Mobility and breathing', 'Movement quality, range of motion and controlled breathing are built into the routine.'], ['Consistency you can see', 'Track completed sessions and weekly consistency without a crowded interface.']], faqs: [['Can beginners use it?', 'Yes. Beginner phases use accessible positions and manageable sessions.'], ['Is it only for flexibility?', 'No. Plans can also emphasize mobility, breathing, balance and recovery.'], ['Is it free?', 'Yes. The yoga plan and tracking are free.']] },
    es: { title: 'Aplicación Personal de Yoga Gratis', accent: 'Practica con Estructura', metaTitle: 'Aplicación Gratis de Yoga y Movilidad | Full Balance', description: 'Crea un plan gratis de yoga para flexibilidad, movilidad, respiración y constancia según experiencia y semana disponible.', hero: 'Convierte vídeos aislados en una práctica clara con sesiones, progresión, recuperación y constancia.', sections: [['Práctica según tu nivel', 'Las sesiones reflejan tu experiencia en lugar de usar el mismo flujo para todos.'], ['Movilidad y respiración', 'La calidad de movimiento, amplitud y respiración controlada forman parte de la rutina.'], ['Constancia visible', 'Registra sesiones completadas y continuidad semanal sin una interfaz recargada.']], faqs: [['¿Sirve para principiantes?', 'Sí. Las fases iniciales utilizan posiciones accesibles y sesiones manejables.'], ['¿Solo mejora flexibilidad?', 'No. También puede trabajar movilidad, respiración, equilibrio y recuperación.'], ['¿Es gratis?', 'Sí. El plan y seguimiento de yoga son gratis.']] },
  },
  pilates: {
    paths: { tr: '/pilates-programi', en: '/en/free-pilates-workout-plan', es: '/es/plan-pilates-gratis' }, category: 'wellness',
    en: { title: 'Free Personal Pilates Plan', accent: 'Core and Control', metaTitle: 'Free Personal Pilates Workout Plan | Full Balance', description: 'Create a free Pilates plan for core strength, posture, balance and controlled progression based on your level.', hero: 'Follow a level-appropriate Pilates routine and track your practice, recovery and progress in one place.', sections: [['Core with control', 'Sessions prioritize controlled movement, stability and useful core strength.'], ['Progress by level', 'Exercise complexity and session demand increase through clear phases.'], ['Part of a complete routine', 'Pilates can sit alongside sleep, water, nutrition and recovery tracking.']], faqs: [['Is this mat Pilates?', 'The personal Pilates path supports mat-based practice.'], ['Can beginners use it?', 'Yes. The first phase is designed for accessible, controlled practice.'], ['Is it free?', 'Yes. The Pilates plan and core tracking are free.']] },
    es: { title: 'Plan Personal de Pilates Gratis', accent: 'Core y Control', metaTitle: 'Plan Personal de Pilates Gratis | Full Balance', description: 'Crea un plan gratis de pilates para core, postura, equilibrio y progresión controlada según tu nivel.', hero: 'Sigue una rutina adecuada a tu nivel y registra práctica, recuperación y progreso en un solo lugar.', sections: [['Core con control', 'Las sesiones priorizan movimiento controlado, estabilidad y fuerza útil del centro.'], ['Progreso por nivel', 'La complejidad y la exigencia aumentan mediante fases claras.'], ['Parte de una rutina completa', 'Pilates se integra con sueño, agua, nutrición y recuperación.']], faqs: [['¿Es pilates en esterilla?', 'El camino personal de pilates admite práctica en esterilla.'], ['¿Sirve para principiantes?', 'Sí. La primera fase propone una práctica accesible y controlada.'], ['¿Es gratis?', 'Sí. El plan y seguimiento esencial son gratis.']] },
  },
  reformer: {
    paths: { tr: '/reformer-pilates-programi', en: '/en/free-reformer-pilates-plan', es: '/es/plan-reformer-pilates-gratis' }, category: 'wellness',
    en: { title: 'Free Personal Reformer Pilates Plan', accent: 'Machine-Based Progression', metaTitle: 'Free Reformer Pilates Workout Plan | Full Balance', description: 'Create a free reformer Pilates plan for a studio or home reformer, adapted to your experience, available days and machine access.', hero: 'Turn reformer sessions into a clear weekly routine with machine-compatible exercises, controlled progression, recovery and practice tracking.', sections: [['Built for a reformer machine', 'Choose a studio or home reformer environment. The plan does not present mat Pilates as reformer training.'], ['Progress matched to experience', 'Session structure and movement complexity develop through level-appropriate phases instead of changing at random.'], ['Practice and recovery together', 'Track completed sessions alongside sleep, water and recovery habits in the same free app.']], faqs: [['Do I need a reformer machine?', 'Yes. This path is specifically for users with access to a studio or home reformer machine. For mat-based practice, choose the Pilates plan instead.'], ['Can beginners use it?', 'Yes. Beginner phases prioritize stable, controlled reformer foundations and manageable sessions.'], ['Is it free?', 'Yes. The reformer plan and essential tracking are free with no credit card.']] },
    es: { title: 'Plan Personal de Reformer Pilates Gratis', accent: 'Progresión con Máquina', metaTitle: 'Plan de Reformer Pilates Gratis | Full Balance', description: 'Crea gratis un plan de reformer pilates para estudio o reformer en casa, adaptado a experiencia, días disponibles y acceso a máquina.', hero: 'Convierte sesiones aisladas en una rutina semanal clara con ejercicios compatibles con reformer, progresión controlada, recuperación y seguimiento.', sections: [['Diseñado para máquina reformer', 'Elige estudio o reformer en casa. El plan no presenta pilates en esterilla como entrenamiento de reformer.'], ['Progreso según experiencia', 'La estructura y complejidad avanzan mediante fases adecuadas al nivel, sin cambios aleatorios.'], ['Práctica y recuperación juntas', 'Registra sesiones junto con sueño, agua y hábitos de recuperación en la misma aplicación gratuita.']], faqs: [['¿Necesito una máquina reformer?', 'Sí. Este camino es para personas con acceso a reformer de estudio o de casa. Para práctica en esterilla, elige el plan de pilates.'], ['¿Sirve para principiantes?', 'Sí. Las fases iniciales priorizan fundamentos estables, controlados y sesiones manejables.'], ['¿Es gratis?', 'Sí. El plan de reformer y el seguimiento esencial son gratis y no requieren tarjeta.']] },
  },
  meditation: {
    paths: { tr: '/meditasyon-uygulamasi', en: '/en/free-meditation-app', es: '/es/aplicacion-meditacion-gratis' }, category: 'wellness',
    en: { title: 'Free Personal Meditation App', accent: 'Simple Daily Practice', metaTitle: 'Free Personal Meditation and Breathing App | Full Balance', description: 'Build a free meditation routine for breathing, focus, sleep preparation and daily consistency with sessions matched to your experience.', hero: 'Start with short, clear practices and build consistency without turning meditation into another complicated task.', sections: [['Short guided structure', 'Use manageable breathing, focus and awareness sessions that fit your day.'], ['A routine that progresses', 'Duration and practice complexity can develop as consistency improves.'], ['Recovery in context', 'View meditation alongside sleep, movement and other recovery habits.']], faqs: [['How long are the sessions?', 'The plan can begin with short sessions and progress with experience.'], ['Can it support sleep preparation?', 'Yes. The meditation path includes calming breathing and wind-down practices.'], ['Is it free?', 'Yes. The meditation plan and tracking are free.']] },
    es: { title: 'Aplicación Personal de Meditación Gratis', accent: 'Práctica Diaria Simple', metaTitle: 'Aplicación Gratis de Meditación y Respiración | Full Balance', description: 'Crea una rutina gratis de meditación para respiración, enfoque, preparación del sueño y constancia según tu experiencia.', hero: 'Empieza con prácticas breves y claras y construye constancia sin convertir la meditación en otra tarea complicada.', sections: [['Estructura guiada y breve', 'Utiliza sesiones manejables de respiración, enfoque y atención que encajan en tu día.'], ['Una rutina que progresa', 'La duración y complejidad pueden aumentar cuando mejora la constancia.'], ['Recuperación con contexto', 'Observa la meditación junto al sueño, movimiento y otros hábitos de recuperación.']], faqs: [['¿Cuánto duran las sesiones?', 'El plan puede comenzar con sesiones breves y progresar con la experiencia.'], ['¿Ayuda a prepararse para dormir?', 'Sí. Incluye respiración calmante y prácticas de desconexión.'], ['¿Es gratis?', 'Sí. El plan y seguimiento de meditación son gratis.']] },
  },
};

export const internationalSeoPages = Object.entries(pageDefinitions).flatMap(([topic, definition]) =>
  INTERNATIONAL_LOCALES.map((lang) => ({
    topic,
    lang,
    path: definition.paths[lang],
    alternates: definition.paths,
    category: definition.category,
    calculator: definition.calculator || null,
    mealTool: Boolean(definition.mealTool),
    ...shared[lang],
    ...definition[lang],
  })),
);

export function findInternationalSeoPage(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return internationalSeoPages.find((page) => page.path === normalized) || null;
}

export function getInternationalRelatedPages(page) {
  const priorityByTopic = {
    bmi: ['calories', 'protein', 'photoCalories', 'nutrition', 'fatLoss', 'workout', 'home'],
    calories: ['photoCalories', 'protein', 'bmi', 'nutrition', 'fatLoss', 'muscle', 'home'],
    photoCalories: ['calories', 'protein', 'nutrition', 'bmi', 'fatLoss', 'home'],
    workout: ['homeWorkout', 'homeDumbbell', 'homeMuscle', 'muscle', 'fatLoss', 'beginnerPilates', 'nutrition', 'bmi'],
    homeWorkout: ['fourWeekHome', 'homeDumbbell', 'resistanceBand', 'womenHome', 'homeMuscle', 'over40', 'beginnerPilates', 'nutrition'],
    fourWeekHome: ['homeWorkout', 'resistanceBand', 'womenHome', 'over40', 'homeDumbbell', 'fatLoss', 'calories', 'nutrition'],
    resistanceBand: ['homeDumbbell', 'homeWorkout', 'fourWeekHome', 'homeMuscle', 'womenHome', 'muscle', 'protein', 'nutrition'],
    womenHome: ['fourWeekHome', 'homeWorkout', 'resistanceBand', 'fatLoss', 'calories', 'beginnerPilates', 'nutrition', 'bmi'],
    over40: ['homeWorkout', 'fourWeekHome', 'resistanceBand', 'beginnerPilates', 'yoga', 'nutrition', 'calories', 'bmi'],
    homeDumbbell: ['homeWorkout', 'homeMuscle', 'workout', 'muscle', 'fatLoss', 'nutrition', 'protein'],
    homeMuscle: ['homeDumbbell', 'homeWorkout', 'muscle', 'workout', 'protein', 'calories', 'nutrition', 'bmi'],
    beginnerPilates: ['pilates', 'reformer', 'homeWorkout', 'yoga', 'meditation', 'workout', 'bmi', 'home'],
    pilates: ['beginnerPilates', 'reformer', 'homeWorkout', 'yoga', 'meditation', 'workout', 'bmi', 'home'],
    reformer: ['pilates', 'beginnerPilates', 'yoga', 'meditation', 'workout', 'home'],
    yoga: ['pilates', 'reformer', 'meditation', 'beginnerPilates', 'homeWorkout', 'home'],
    meditation: ['yoga', 'pilates', 'reformer', 'home', 'workout', 'nutrition'],
  };
  const priorities = priorityByTopic[page.topic] || ['bmi', 'workout', 'homeWorkout', 'beginnerPilates', 'nutrition', 'home'];
  const priorityIndex = new Map(priorities.map((topic, index) => [topic, index]));

  return internationalSeoPages
    .filter((candidate) => candidate.lang === page.lang && candidate.path !== page.path)
    .sort((a, b) => (priorityIndex.get(a.topic) ?? priorities.length) - (priorityIndex.get(b.topic) ?? priorities.length));
}

export function getAlternatesForTurkishPath(pathname) {
  return internationalSeoPages.find((page) => page.lang === 'en' && page.alternates.tr === pathname)?.alternates || null;
}
