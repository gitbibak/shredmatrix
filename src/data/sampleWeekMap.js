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
  '/direnc-bandi-antrenman-programi': 'muscle_basic',
  '/en/resistance-band-workout-plan': 'muscle_basic',
  '/es/rutina-con-bandas-elasticas': 'muscle_basic',
  '/30-gunluk-evde-spor-programi': 'fat_loss_bodyweight',
  '/en/4-week-home-workout-plan': 'fat_loss_bodyweight',
  '/es/rutina-4-semanas-en-casa': 'fat_loss_bodyweight',
  '/kadinlar-icin-evde-spor-programi': 'fat_loss_bodyweight',
  '/en/home-workout-plan-for-women': 'fat_loss_bodyweight',
  '/es/rutina-en-casa-mujeres': 'fat_loss_bodyweight',
  '/40-yas-ustu-evde-spor-programi': 'fat_loss_bodyweight',
  '/en/beginner-workout-plan-over-40': 'fat_loss_bodyweight',
  '/es/rutina-en-casa-mayores-40': 'fat_loss_bodyweight',
  '/baslangic-pilates-programi': 'pilates_mat',
  '/en/pilates-workout-at-home': 'pilates_mat',
  '/es/pilates-en-casa-principiantes': 'pilates_mat',
  '/pilates-programi': 'pilates_mat',
  '/en/free-pilates-workout-plan': 'pilates_mat',
  '/es/plan-pilates-gratis': 'pilates_mat',
};

// Pages that present the sample as a 30-day / 4-week program get the
// week-by-week progression table as well.
const FOUR_WEEK_PATHS = new Set([
  '/30-gunluk-evde-spor-programi', '/en/4-week-home-workout-plan', '/es/rutina-4-semanas-en-casa',
  '/direnc-bandi-antrenman-programi', '/en/resistance-band-workout-plan', '/es/rutina-con-bandas-elasticas',
  '/kadinlar-icin-evde-spor-programi', '/en/home-workout-plan-for-women', '/es/rutina-en-casa-mujeres',
  '/40-yas-ustu-evde-spor-programi', '/en/beginner-workout-plan-over-40', '/es/rutina-en-casa-mayores-40',
  '/evde-dambil-antrenman-programi', '/en/home-dumbbell-workout-plan', '/es/entrenamiento-en-casa-con-mancuernas',
]);

// Mat pilates progresses through control, breath and complexity rather than
// load, so its 30-day pages get their own table.
const PILATES_PATHS = new Set([
  '/baslangic-pilates-programi', '/en/pilates-workout-at-home', '/es/pilates-en-casa-principiantes',
  '/pilates-programi', '/en/free-pilates-workout-plan', '/es/plan-pilates-gratis',
]);

export const PILATES_FOUR_WEEK_PLAN = {
  tr: {
    title: '30 günlük evde pilates: 4 haftalık ilerleme',
    intro: 'Hareketler örnek haftadaki gibi kalır; her hafta kontrol, süre ve zorluk biraz artar. Haftada 3-4 mat seansı ve bir esneme günü yeterlidir.',
    columns: ['Hafta', 'Odak', 'Seans', 'Not'],
    rows: [
      ['1', 'Nefes ve nötr pelvis', '3 seans × 15-20 dk', 'Hareketleri yavaş öğren; tekrar sayısının alt ucunda kal.'],
      ['2', 'Core kontrolü', '3 seans × 20-25 dk', 'Tekrarı hedefin üst ucuna çıkar; bel mattan kalkmasın.'],
      ['3', 'Akış ve denge', '4 seans × 20-25 dk', 'Hareketler arası mola kısalır; tek bacak ve yan yatış serileri eklenir.'],
      ['4', 'Dayanıklılık ve hafif bitiriş', '4 seans × 25-30 dk, son seans hafif', 'Ay sonunda uygulama bir sonraki fazı açar.'],
    ],
  },
  en: {
    title: '30-day home pilates: 4-week progression',
    intro: 'The movements stay as in the sample week; each week adds a little control, time and difficulty. Three to four mat sessions plus one stretch day is enough.',
    columns: ['Week', 'Focus', 'Sessions', 'Note'],
    rows: [
      ['1', 'Breath and neutral pelvis', '3 sessions × 15-20 min', 'Learn the movements slowly; stay at the low end of the reps.'],
      ['2', 'Core control', '3 sessions × 20-25 min', 'Move to the top of the rep target; keep the lower back on the mat.'],
      ['3', 'Flow and balance', '4 sessions × 20-25 min', 'Shorter breaks between movements; single-leg and side-lying series added.'],
      ['4', 'Endurance and light finish', '4 sessions × 25-30 min, last one light', 'The app unlocks the next phase at the end of the month.'],
    ],
  },
  es: {
    title: 'Pilates en casa 30 días: progresión de 4 semanas',
    intro: 'Los movimientos son los de la semana de ejemplo; cada semana suma un poco de control, tiempo y dificultad. Bastan 3-4 sesiones en esterilla y un día de estiramientos.',
    columns: ['Semana', 'Enfoque', 'Sesiones', 'Nota'],
    rows: [
      ['1', 'Respiración y pelvis neutra', '3 sesiones × 15-20 min', 'Aprende los movimientos despacio; quédate en el mínimo de repeticiones.'],
      ['2', 'Control del core', '3 sesiones × 20-25 min', 'Sube al máximo de repeticiones; la zona lumbar no se despega de la esterilla.'],
      ['3', 'Fluidez y equilibrio', '4 sesiones × 20-25 min', 'Pausas más cortas; se añaden series a una pierna y de lado.'],
      ['4', 'Resistencia y cierre suave', '4 sesiones × 25-30 min, la última suave', 'Al final del mes la app abre la siguiente fase.'],
    ],
  },
};

export const FOUR_WEEK_PLAN = {
  tr: {
    title: '8 haftalık ilerleme: ilk 30 gün ve sonraki faz',
    intro: 'Egzersizler aynı kalır; her hafta set, tekrar veya tempo değişir. Ağrı bildirirsen o hafta yük artmaz.',
    columns: ['Hafta', 'Odak', 'Set × tekrar', 'Not'],
    rows: [
      ['1', 'Hareketi öğren', '2 × aralığın alt yarısı', 'Form öncelikli; kolay varyasyonu seçmek serbest.'],
      ['2', 'Tekrarı artır', '2 × aralığın üst yarısı', 'Her sette 1-2 tekrar ekle; dinlenme aynı kalsın.'],
      ['3', 'Zorluğu artır', '3 × aralığın alt yarısı', 'Bir üst varyasyon veya 3 saniye iniş temposu.'],
      ['4', 'Hacim ve hafif bitiriş', '3 × aralığın üst yarısı, son gün 2 set', 'Hafta sonunda bir sonraki faz açılır.'],
      ['5', 'İkinci faz: yeni varyasyonlar', '3 × aralığın alt yarısı', 'Uygulama 30 gün sonunda bir üst fazı açar; hareketler zorlaşır, dinlenme aynı.'],
      ['6', 'Tekrarı artır', '3 × aralığın üst yarısı', 'Çift ilerleme kuralı: önce tekrar, tekrar üst sınırdayken zorluk.'],
      ['7', 'Hacim', '4 × aralığın alt yarısı', 'En zor hafta; uyku ve protein takibi önemli.'],
      ['8', 'Deload', '2 × aralığın alt yarısı', 'Toparlanma haftası; ardından 9-12. hafta için üçüncü faz.'],
    ],
  },
  en: {
    title: '8-week progression: the first 30 days and the next phase',
    intro: 'The exercises stay the same; each week changes sets, reps or tempo. If you report pain, that week does not add load.',
    columns: ['Week', 'Focus', 'Sets × reps', 'Note'],
    rows: [
      ['1', 'Learn the movement', '2 × lower half of the range', 'Form first; easier variations are fine.'],
      ['2', 'Add reps', '2 × upper half of the range', 'Add 1-2 reps per set; keep rest the same.'],
      ['3', 'Add difficulty', '3 × lower half of the range', 'Next variation or a 3-second lowering tempo.'],
      ['4', 'Volume and light finish', '3 × upper half, last day 2 sets', 'The next phase unlocks at the end of the week.'],
      ['5', 'Phase two: new variations', '3 × lower half of the range', 'The app unlocks the next phase after 30 days; movements get harder, rest stays the same.'],
      ['6', 'Add reps', '3 × upper half of the range', 'Double progression: reps first, difficulty once you hit the top of the range.'],
      ['7', 'Volume', '4 × lower half of the range', 'Hardest week; sleep and protein tracking matter most here.'],
      ['8', 'Deload', '2 × lower half of the range', 'Recovery week, then phase three for weeks 9-12.'],
    ],
  },
  es: {
    title: 'Progresión de 8 semanas: los primeros 30 días y la siguiente fase',
    intro: 'Los ejercicios se mantienen; cada semana cambian series, repeticiones o tempo. Si reportas dolor, esa semana no sube la carga.',
    columns: ['Semana', 'Enfoque', 'Series × reps', 'Nota'],
    rows: [
      ['1', 'Aprender el movimiento', '2 × mitad baja del rango', 'Técnica primero; vale usar la variante fácil.'],
      ['2', 'Sumar repeticiones', '2 × mitad alta del rango', 'Añade 1-2 repeticiones por serie; mismo descanso.'],
      ['3', 'Sumar dificultad', '3 × mitad baja del rango', 'Siguiente variante o bajada en 3 segundos.'],
      ['4', 'Volumen y cierre ligero', '3 × mitad alta, último día 2 series', 'Al final de la semana se abre la siguiente fase.'],
      ['5', 'Segunda fase: nuevas variantes', '3 × mitad baja del rango', 'La app abre la siguiente fase a los 30 días; los movimientos se endurecen, el descanso se mantiene.'],
      ['6', 'Sumar repeticiones', '3 × mitad alta del rango', 'Doble progresión: primero repeticiones, luego dificultad al llegar al tope.'],
      ['7', 'Volumen', '4 × mitad baja del rango', 'La semana más dura; el sueño y la proteína importan más aquí.'],
      ['8', 'Descarga', '2 × mitad baja del rango', 'Semana de recuperación; después, tercera fase para las semanas 9-12.'],
    ],
  },
};

export function getFourWeekPlan(path, lang = 'tr') {
  if (PILATES_PATHS.has(path)) return PILATES_FOUR_WEEK_PLAN[lang] || PILATES_FOUR_WEEK_PLAN.en;
  if (!FOUR_WEEK_PATHS.has(path)) return null;
  return FOUR_WEEK_PLAN[lang] || FOUR_WEEK_PLAN.en;
}

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
    print: 'Yazdır / PDF olarak kaydet',
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
    print: 'Print / save as PDF',
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
    print: 'Imprimir / guardar como PDF',
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
