import { sampleHomeWeeks } from './sampleHomeWeeks.js';

// Which generated beginner week each public landing page shows. The data is
// produced from the real plan engine (scripts/generate-sample-weeks.mjs), so
// visitors see an actual program instead of marketing copy.
const SAMPLE_WEEK_BY_PATH = {
  '/evde-spor-programi': 'fat_loss_bodyweight',
  '/en/home-workout-no-equipment': 'fat_loss_bodyweight',
  '/es/entrenamiento-en-casa-sin-equipo': 'fat_loss_bodyweight',
  '/evde-dambil-antrenman-programi': 'muscle_basic',
  '/en/home-dumbbell-workout-plan': 'muscle_basic',
  '/es/entrenamiento-en-casa-con-mancuernas': 'muscle_basic',
  '/evde-kas-gelistirme-hareketleri': 'muscle_bodyweight',
  '/en/home-muscle-building-workout': 'muscle_bodyweight',
  '/es/ejercicios-en-casa-ganar-musculo': 'muscle_bodyweight',
};

export const SAMPLE_WEEK_COPY = {
  tr: {
    eyebrow: 'Gerçek örnek',
    title: 'Başlangıç seviyesi için örnek hafta',
    intro: 'Bu tablo uygulamanın plan motorunun başlangıç seviyesi için ürettiği gerçek bir haftadır. Kayıt olduğunda seviye, hedef, gün sayısı ve sağlık durumuna göre kişiselleşir.',
    day: 'Gün',
    focus: 'Odak',
    exercises: 'Egzersizler',
    sets: 'set',
    setSingular: 'set',
    restBetween: 'dinlenme',
    restDay: 'Dinlenme günü',
    progression: 'Nasıl ilerler? İlk 2 haftada verilen tekrar aralığının üst sınırına kontrollü ulaşınca sonraki fazda set sayısı, tempo veya hareket zorluğu artar. Ağrı varsa hareket kolay versiyonla değiştirilir.',
    cta: 'Kendi planını ücretsiz oluştur',
  },
  en: {
    eyebrow: 'Real example',
    title: 'Sample beginner week',
    intro: 'This table is a real week produced by the app\'s plan engine for a beginner. After sign-up it adapts to your level, goal, available days and health notes.',
    day: 'Day',
    focus: 'Focus',
    exercises: 'Exercises',
    sets: 'sets',
    setSingular: 'set',
    restBetween: 'rest',
    restDay: 'Rest day',
    progression: 'How it progresses: once you reach the top of the rep range with control for two weeks, the next phase adds sets, slows the tempo or moves to a harder variation. Pain swaps the movement for an easier version.',
    cta: 'Build your free plan',
  },
  es: {
    eyebrow: 'Ejemplo real',
    title: 'Semana de ejemplo para principiantes',
    intro: 'Esta tabla es una semana real generada por el motor de planes de la app para un principiante. Tras registrarte se adapta a tu nivel, objetivo, días disponibles y notas de salud.',
    day: 'Día',
    focus: 'Enfoque',
    exercises: 'Ejercicios',
    sets: 'series',
    setSingular: 'serie',
    restBetween: 'descanso',
    restDay: 'Día de descanso',
    progression: 'Cómo progresa: cuando alcanzas con control el tope del rango de repeticiones durante dos semanas, la siguiente fase añade series, ralentiza el tempo o pasa a una variante más difícil. Si hay dolor, el movimiento se cambia por una versión más fácil.',
    cta: 'Crea tu plan gratis',
  },
};

export function getSampleWeek(path, lang = 'tr') {
  const variant = SAMPLE_WEEK_BY_PATH[path];
  const days = variant ? sampleHomeWeeks[variant]?.[lang] : null;
  if (!Array.isArray(days) || days.length === 0) return null;
  return { variant, days, copy: SAMPLE_WEEK_COPY[lang] || SAMPLE_WEEK_COPY.en };
}

export function formatSampleExercise(exercise, copy) {
  const rest = exercise.rest && exercise.rest !== '-' && exercise.rest !== '0s' ? `, ${exercise.rest} ${copy.restBetween}` : '';
  const sets = Number(exercise.sets) || 0;
  const setsLabel = sets === 1 ? (copy.setSingular || copy.sets) : copy.sets;
  return `${exercise.name}: ${sets} ${setsLabel} × ${exercise.reps}${rest}`;
}
