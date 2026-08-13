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
      title: 'Free Personal Workout Plan', accent: 'Built Around You', metaTitle: 'Free Personal Workout Plan for Every Level | Full Balance',
      description: 'Create a free personal workout plan for your goal, experience and weekly schedule with exercises, sets, reps, rest and progression guidance.',
      hero: 'Stop guessing what to train. Get a clear weekly plan for your goal and level, then track each session from your phone.',
      sections: [['Goal and level first', 'Your plan starts with your goal, experience, available days and relevant health limitations.'], ['Every session is clear', 'See exercise order, sets, rep ranges, rest time and practical form guidance.'], ['Progress in phases', 'Plans move through structured phases instead of changing randomly every week.']],
      faqs: [['Is it suitable for beginners?', 'Yes. Beginner plans use manageable exercise selection, volume and progression.'], ['Can I train at home?', 'The plan considers your available environment and equipment.'], ['Does it include yoga and Pilates?', 'Yes. Full Balance also creates plans for yoga, Pilates, reformer and meditation.']],
    },
    es: {
      title: 'Plan de Entrenamiento Gratis', accent: 'Hecho para Ti', metaTitle: 'Plan de Entrenamiento Personalizado Gratis | Full Balance',
      description: 'Crea un plan gratis según tu objetivo, experiencia y días disponibles con ejercicios, series, repeticiones, descanso y progresión.',
      hero: 'Deja de adivinar qué entrenar. Obtén una semana clara para tu objetivo y nivel y registra cada sesión desde el móvil.',
      sections: [['Primero tu objetivo y nivel', 'El plan considera tu objetivo, experiencia, días disponibles y limitaciones de salud relevantes.'], ['Cada sesión es clara', 'Consulta el orden, las series, repeticiones, descanso y consejos prácticos de técnica.'], ['Progreso por fases', 'Los planes avanzan por fases estructuradas en lugar de cambiar sin sentido cada semana.']],
      faqs: [['¿Sirve para principiantes?', 'Sí. Los planes iniciales utilizan ejercicios, volumen y progresión manejables.'], ['¿Puedo entrenar en casa?', 'El plan considera el entorno y el material que tienes disponible.'], ['¿Incluye yoga y pilates?', 'Sí. Full Balance también crea planes de yoga, pilates, reformer y meditación.']],
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
      title: 'Free Daily Protein Calculator', accent: 'By Goal', metaTitle: 'Free Daily Protein Calculator by Weight and Goal | Full Balance',
      description: 'Estimate a practical daily protein range based on body weight, activity and goal. Free metric and imperial calculator with no signup.',
      hero: 'Get a practical protein range instead of one rigid number, then turn it into meal ideas that fit your goal.',
      sections: [['A useful range', 'Protein needs vary, so the result provides a lower and upper daily target.'], ['Goal-aware estimate', 'Activity and whether you want to maintain, gain muscle or lose fat influence the range.'], ['Plan it across meals', 'A saved Full Balance plan helps distribute the target across a realistic day of eating.']],
      faqs: [['Why is the result a range?', 'Nutrition needs vary by training, energy intake and individual context; a range is more useful than false precision.'], ['Can I use pounds?', 'Yes. Choose imperial units and enter your weight in pounds.'], ['Is more protein always better?', 'No. More is not automatically better, and total diet quality still matters.']],
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
      title: 'Free BMI Calculator', accent: 'Metric or Imperial', metaTitle: 'Free BMI Calculator in Metric or Imperial Units | Full Balance',
      description: 'Calculate adult BMI instantly with metric or imperial units and read a clear, non-diagnostic explanation. Free and no signup required.',
      hero: 'Calculate BMI in seconds and view it as one screening measure, not a complete judgment of health or progress.',
      sections: [['Instant calculation', 'Use kilograms and centimeters or pounds and feet to calculate adult BMI.'], ['Clear context', 'BMI is a population-level screening measure and does not directly measure body fat or fitness.'], ['Track more than weight', 'Full Balance can combine weight with measurements, workouts, sleep, water and weekly trends.']],
      faqs: [['Does BMI measure body fat?', 'No. BMI uses height and weight and does not directly measure body composition.'], ['Is BMI a diagnosis?', 'No. It is a screening measure and should not be used as a diagnosis.'], ['Who is this calculator for?', 'The standard categories shown here are intended for adults and may not suit pregnancy, children or some athletic populations.']],
    },
    es: {
      title: 'Calculadora Gratis de IMC', accent: 'Métrico o Imperial', metaTitle: 'Calculadora de IMC Gratis | Métrico o Imperial | Full Balance',
      description: 'Calcula el IMC adulto al instante en sistema métrico o imperial y lee una explicación clara y no diagnóstica. Gratis y sin registro.',
      hero: 'Calcula el IMC en segundos y entiéndelo como una medida orientativa, no como una evaluación completa de salud o progreso.',
      sections: [['Cálculo inmediato', 'Usa kilogramos y centímetros o libras y pies para calcular el IMC adulto.'], ['Contexto claro', 'El IMC es una medida poblacional y no mide directamente la grasa corporal ni la condición física.'], ['Más que el peso', 'Full Balance combina peso con medidas, entrenamiento, sueño, agua y tendencias semanales.']],
      faqs: [['¿El IMC mide la grasa corporal?', 'No. Utiliza altura y peso y no mide directamente la composición corporal.'], ['¿Es un diagnóstico?', 'No. Es una medida orientativa y no debe utilizarse como diagnóstico.'], ['¿Para quién sirve?', 'Las categorías estándar se destinan a adultos y pueden no ser adecuadas durante el embarazo, para menores o algunos deportistas.']],
    },
  },
  muscle: {
    paths: { tr: '/kas-gelisimi-programi', en: '/en/muscle-gain-workout-plan', es: '/es/plan-ganar-masa-muscular' }, category: 'workout',
    en: { title: 'Free Muscle Gain Workout Plan', accent: 'Train and Eat with Purpose', metaTitle: 'Free Muscle Gain Workout and Nutrition Plan | Full Balance', description: 'Build a free muscle gain plan with level-appropriate training, progressive overload, calorie and protein targets and progress tracking.', hero: 'Bring training, protein, calories and progression into one clear routine built around your level.', sections: [['Structured hypertrophy', 'Use a level-appropriate weekly split with clear sets, rep ranges and recovery.'], ['Calories and protein together', 'Estimate an appropriate energy surplus and protein range instead of treating training and food separately.'], ['Progressive, not random', 'Track sessions and measurements to decide when progression is earned.']], faqs: [['Can beginners use the plan?', 'Yes. Volume and exercise complexity are adjusted for beginner phases.'], ['Does it include nutrition?', 'Yes. Calorie, macro and meal guidance supports the training plan.'], ['Is it free?', 'Yes. The muscle gain plan and core tracking tools are free.']] },
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
  return internationalSeoPages.filter((candidate) => candidate.lang === page.lang && candidate.path !== page.path);
}

export function getAlternatesForTurkishPath(pathname) {
  return internationalSeoPages.find((page) => page.lang === 'en' && page.alternates.tr === pathname)?.alternates || null;
}
