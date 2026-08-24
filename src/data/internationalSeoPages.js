export const INTERNATIONAL_LOCALES = ['en', 'es'];

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
      title: 'Plan de Entrenamiento Personalizado', accent: 'Casa o Gimnasio', metaTitle: 'Plan de Entrenamiento Personalizado en Casa Gratis | Full Balance',
      description: 'Crea gratis un plan de entrenamiento personalizado en casa con peso corporal o mancuernas, o en gimnasio, según tu objetivo, nivel y días disponibles.',
      hero: 'Elige casa sin material, casa con mancuernas o gimnasio. Obtén una semana clara para tu objetivo, nivel y días disponibles y registra el progreso desde el móvil.',
      sections: [['Primero tu objetivo y nivel', 'El plan considera tu objetivo, experiencia, días disponibles, entorno de entrenamiento y limitaciones de salud relevantes.'], ['Cada sesión es clara', 'Consulta el orden, las series, repeticiones, descanso y consejos prácticos de técnica.'], ['Progreso por fases', 'Los planes avanzan por fases estructuradas en lugar de cambiar sin sentido cada semana.']],
      faqs: [['¿Sirve para principiantes?', 'Sí. Los planes iniciales utilizan ejercicios, volumen y progresión manejables.'], ['¿Puedo elegir casa o gimnasio?', 'Sí. Elige el entorno antes de crear el plan. La opción de casa utiliza movimientos de peso corporal sin máquinas de gimnasio.'], ['¿Incluye yoga y pilates?', 'Sí. Full Balance también crea planes de yoga, pilates, reformer y meditación.']],
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
    paths: { tr: '/kalori-makro-takibi', en: '/en/calorie-macro-calculator', es: '/es/calculadora-calorias-macros' },
    category: 'nutrition', calculator: 'calories',
    en: {
      title: 'Free Calorie and Macro Calculator', accent: 'Instant Results', metaTitle: 'Free Calorie and Macro Calculator | Full Balance',
      description: 'Estimate BMR, TDEE, target calories, protein, carbs and fat in metric or imperial units. Free instant results with no signup required.',
      hero: 'Calculate your estimated daily energy and macros first. Create a free account only when you want to save the result and turn it into a personal plan.',
      sections: [['Evidence-based estimate', 'The calculator uses the Mifflin-St Jeor equation and an activity multiplier to estimate daily energy needs.'], ['Goal-aware target', 'Choose maintenance, muscle gain or fat loss to see a practical starting target.'], ['From number to routine', 'Save your estimate and use it alongside meals, workouts, water, sleep and weekly progress.']],
      faqs: [['What is TDEE?', 'TDEE is an estimate of the total energy you use in a day, including activity.'], ['Are the results exact?', 'No calculator can measure your exact needs. Use the estimate as a starting point and adjust using real progress.'], ['Do I need an account?', 'No. The calculation is available without an account; registration is only needed to save and use a personal plan.']],
    },
    es: {
      title: 'Calculadora Gratis de Calorías y Macros', accent: 'Resultado Inmediato', metaTitle: 'Calculadora Gratis de Calorías y Macros | Full Balance',
      description: 'Estima BMR, TDEE, calorías objetivo, proteína, carbohidratos y grasa en sistema métrico o imperial. Resultado gratis sin registro.',
      hero: 'Calcula primero tu energía y macros diarios estimados. Crea una cuenta gratis solo cuando quieras guardar el resultado y convertirlo en un plan.',
      sections: [['Estimación con una fórmula reconocida', 'La calculadora utiliza Mifflin-St Jeor y un multiplicador de actividad para estimar las necesidades diarias.'], ['Objetivo ajustado', 'Elige mantenimiento, ganar músculo o perder grasa para obtener un punto de partida práctico.'], ['Del número a la rutina', 'Guarda la estimación y úsala junto a comidas, entrenamientos, agua, sueño y progreso semanal.']],
      faqs: [['¿Qué es el TDEE?', 'Es una estimación de toda la energía que utilizas en un día, incluida la actividad.'], ['¿El resultado es exacto?', 'Ninguna calculadora mide tus necesidades exactas. Úsalo como punto inicial y ajusta según tu progreso real.'], ['¿Necesito una cuenta?', 'No para calcular. Solo necesitas registrarte si quieres guardar el resultado y usar un plan personal.']],
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
      title: 'Imperial BMI Calculator', accent: 'Pounds, Feet or Metric', metaTitle: 'Imperial BMI Calculator: Pounds, Feet & Inches | Full Balance',
      description: 'Calculate BMI in pounds, feet and inches or kilograms and centimeters. Get a free instant adult result with no signup required.',
      hero: 'Enter height and weight in imperial or metric units and see your BMI instantly. No account is needed to use the calculator.',
      sections: [['Imperial and metric units', 'Use pounds, feet and inches or switch to kilograms and centimeters.'], ['Clear adult context', 'BMI is a population-level screening measure and does not directly measure body fat or fitness.'], ['Track more than weight', 'Full Balance can combine weight with measurements, workouts, sleep, water and weekly trends.']],
      faqs: [['How do I calculate BMI with pounds and inches?', 'Choose imperial units, enter weight in pounds and height in feet and inches; the calculator applies the imperial conversion automatically.'], ['Does BMI measure body fat?', 'No. BMI uses height and weight and does not directly measure body composition.'], ['Is BMI a diagnosis?', 'No. It is a screening measure and should not be used as a diagnosis.']],
    },
    es: {
      title: 'Calculadora IMC Gratis', accent: 'Peso y Altura', metaTitle: 'Calculadora IMC Gratis: Peso y Altura | Full Balance',
      description: 'Calcula tu IMC gratis con peso y altura: kilos y centímetros o libras, pies y pulgadas. Resultado inmediato, categoría orientativa y sin registro.',
      hero: 'Introduce tu peso y altura en sistema métrico o imperial y consulta tu IMC al instante. No necesitas una cuenta para calcularlo.',
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
    bmi: ['calories', 'protein', 'nutrition', 'fatLoss', 'workout', 'home'],
    workout: ['homeWorkout', 'homeDumbbell', 'homeMuscle', 'muscle', 'fatLoss', 'beginnerPilates', 'nutrition', 'bmi'],
    homeWorkout: ['homeDumbbell', 'workout', 'homeMuscle', 'beginnerPilates', 'fatLoss', 'nutrition', 'bmi'],
    homeDumbbell: ['homeWorkout', 'homeMuscle', 'workout', 'muscle', 'fatLoss', 'nutrition', 'protein'],
    homeMuscle: ['homeDumbbell', 'homeWorkout', 'muscle', 'workout', 'protein', 'calories', 'nutrition', 'bmi'],
    beginnerPilates: ['pilates', 'homeWorkout', 'yoga', 'workout', 'bmi', 'home'],
    pilates: ['beginnerPilates', 'homeWorkout', 'yoga', 'workout', 'bmi', 'home'],
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
