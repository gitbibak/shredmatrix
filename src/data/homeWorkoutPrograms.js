const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const exercise = (name, sets, reps, rest, muscles, equipment = 'none', difficulty = 1) => ({
  name,
  sets,
  reps,
  rest,
  muscles,
  equipment,
  difficulty,
});

const restDay = (day) => ({
  day,
  focus: 'Dinlenme / Rahat Yürüyüş',
  emoji: '😴',
  exercises: [{ name: '20-30 dk rahat yürüyüş (opsiyonel)', sets: 1, reps: '20-30 dk', rest: '-', muscles: ['Toparlanma'], equipment: 'none', difficulty: 1 }],
});

const BODYWEIGHT = {
  fullA: {
    focus: 'Tam Vücut A — Temel Kuvvet', emoji: '💪',
    exercises: [
      exercise('Kontrollü Vücut Ağırlığı Squat', 3, '8-12', '75s', ['Ön Bacak', 'Kalça']),
      exercise('Eğimli Şınav', 3, '6-12', '75s', ['Göğüs', 'Triceps'], 'stable_surface'),
      exercise('Yüzüstü Lat Çekiş', 3, '10-15', '60s', ['Sırt', 'Arka Omuz']),
      exercise('Glute Bridge', 3, '10-15', '60s', ['Kalça', 'Arka Bacak']),
      exercise('Dead Bug', 3, '6-10/taraf', '45s', ['Core']),
    ],
  },
  fullB: {
    focus: 'Tam Vücut B — Tek Taraflı Kontrol', emoji: '⚖️',
    exercises: [
      exercise('Destekli Geri Lunge', 3, '6-10/taraf', '75s', ['Ön Bacak', 'Kalça'], 'stable_surface'),
      exercise('Diz Üstü veya Standart Şınav', 3, '6-12', '75s', ['Göğüs', 'Triceps']),
      exercise('Prone Y-T-W', 3, '6/tip', '60s', ['Üst Sırt', 'Arka Omuz']),
      exercise('Tek Bacak Glute Bridge', 3, '8-12/taraf', '60s', ['Kalça', 'Arka Bacak']),
      exercise('Bird Dog', 3, '8/taraf', '45s', ['Core', 'Kalça']),
    ],
  },
  fullC: {
    focus: 'Tam Vücut C — Tempo ve Denge', emoji: '🎯',
    exercises: [
      exercise('Split Squat', 3, '8-12/taraf', '75s', ['Ön Bacak', 'Kalça']),
      exercise('Pike Şınav', 3, '6-10', '75s', ['Omuz', 'Triceps']),
      exercise('Reverse Snow Angel', 3, '10-15', '60s', ['Sırt', 'Arka Omuz']),
      exercise('Tek Bacak Calf Raise', 3, '12-20/taraf', '45s', ['Baldır'], 'stable_surface'),
      exercise('Side Plank', 3, '15-30 sn/taraf', '45s', ['Core']),
    ],
  },
  upperA: {
    focus: 'Üst Vücut A — İtiş ve Sırt Kontrolü', emoji: '💪',
    exercises: [
      exercise('Standart Şınav', 4, '6-15', '90s', ['Göğüs', 'Triceps']),
      exercise('Pike Şınav', 3, '6-12', '90s', ['Omuz', 'Triceps']),
      exercise('Yüzüstü Lat Çekiş', 4, '10-15', '60s', ['Sırt', 'Arka Omuz']),
      exercise('Prone Y-T-W', 3, '6/tip', '60s', ['Üst Sırt', 'Arka Omuz']),
      exercise('Dar Tutuş Diz Üstü Şınav', 3, '8-15', '60s', ['Triceps', 'Göğüs']),
    ],
  },
  upperB: {
    focus: 'Üst Vücut B — Tempo ve Postür', emoji: '🎯',
    exercises: [
      exercise('Tempo Şınav (3 sn iniş)', 4, '6-12', '90s', ['Göğüs', 'Triceps']),
      exercise('Ayakları Yükseltilmiş Pike Şınav', 3, '6-10', '90s', ['Omuz', 'Triceps'], 'stable_surface', 2),
      exercise('Reverse Snow Angel', 4, '10-15', '60s', ['Sırt', 'Arka Omuz']),
      exercise('Yüzüstü W İzometrik', 3, '20-30 sn', '60s', ['Üst Sırt', 'Arka Omuz']),
      exercise('Self-Resisted Biceps Curl', 3, '20-30 sn/taraf', '45s', ['Biceps']),
    ],
  },
  lowerA: {
    focus: 'Alt Vücut A — Squat ve Kalça', emoji: '🦵',
    exercises: [
      exercise('Tempo Squat (3 sn iniş)', 4, '10-15', '90s', ['Ön Bacak', 'Kalça']),
      exercise('Geri Lunge', 3, '8-12/taraf', '75s', ['Ön Bacak', 'Kalça']),
      exercise('Tek Bacak Glute Bridge', 4, '10-15/taraf', '75s', ['Kalça', 'Arka Bacak']),
      exercise('Hamstring Walkout', 3, '6-10', '75s', ['Arka Bacak', 'Kalça']),
      exercise('Tek Bacak Calf Raise', 4, '12-20/taraf', '45s', ['Baldır'], 'stable_surface'),
    ],
  },
  lowerB: {
    focus: 'Alt Vücut B — Tek Taraflı Kuvvet', emoji: '🦵',
    exercises: [
      exercise('Split Squat', 4, '8-15/taraf', '90s', ['Ön Bacak', 'Kalça']),
      exercise('Destekli Tek Bacak Squat', 3, '6-10/taraf', '90s', ['Ön Bacak', 'Kalça'], 'stable_surface', 2),
      exercise('Tek Bacak Hip Hinge', 3, '8-12/taraf', '75s', ['Arka Bacak', 'Kalça']),
      exercise('Glute Bridge March', 3, '10-16 toplam', '60s', ['Kalça', 'Core']),
      exercise('Bent-Knee Calf Raise', 4, '15-25', '45s', ['Baldır']),
    ],
  },
};

const BASIC = {
  fullA: {
    focus: 'Tam Vücut A — Dumbbell Temeli', emoji: '💪',
    exercises: [
      exercise('Goblet Squat', 3, '8-12', '90s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Floor Press', 3, '8-12', '90s', ['Göğüs', 'Triceps'], 'dumbbell'),
      exercise('Tek Kol Dumbbell Row', 3, '8-12/taraf', '90s', ['Sırt', 'Biceps'], 'dumbbell'),
      exercise('Dumbbell Romanian Deadlift', 3, '8-12', '90s', ['Arka Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dead Bug', 3, '8/taraf', '45s', ['Core']),
    ],
  },
  fullB: {
    focus: 'Tam Vücut B — Denge ve Çekiş', emoji: '⚖️',
    exercises: [
      exercise('Dumbbell Reverse Lunge', 3, '8-12/taraf', '90s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Şınav', 3, '8-15', '75s', ['Göğüs', 'Triceps']),
      exercise('Resistance Band Row', 3, '10-15', '75s', ['Sırt', 'Biceps'], 'resistance_band'),
      exercise('Dumbbell Glute Bridge', 3, '10-15', '75s', ['Kalça', 'Arka Bacak'], 'dumbbell'),
      exercise('Side Plank', 3, '20-35 sn/taraf', '45s', ['Core']),
    ],
  },
  fullC: {
    focus: 'Tam Vücut C — Omuz ve Kalça', emoji: '🎯',
    exercises: [
      exercise('Dumbbell Split Squat', 3, '8-12/taraf', '90s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Shoulder Press', 3, '8-12', '90s', ['Omuz', 'Triceps'], 'dumbbell'),
      exercise('Dumbbell Romanian Deadlift', 3, '10-12', '90s', ['Arka Bacak', 'Kalça'], 'dumbbell'),
      exercise('Resistance Band Pull-Apart', 3, '12-20', '60s', ['Üst Sırt', 'Arka Omuz'], 'resistance_band'),
      exercise('Suitcase March', 3, '30-45 sn/taraf', '60s', ['Core'], 'dumbbell'),
    ],
  },
  upperA: {
    focus: 'Üst Vücut A — Yatay İtiş ve Çekiş', emoji: '💪',
    exercises: [
      exercise('Dumbbell Floor Press', 4, '6-12', '90s', ['Göğüs', 'Triceps'], 'dumbbell'),
      exercise('Tek Kol Dumbbell Row', 4, '8-12/taraf', '90s', ['Sırt', 'Biceps'], 'dumbbell'),
      exercise('Dumbbell Shoulder Press', 3, '8-12', '90s', ['Omuz', 'Triceps'], 'dumbbell'),
      exercise('Resistance Band Pull-Apart', 3, '12-20', '60s', ['Üst Sırt', 'Arka Omuz'], 'resistance_band'),
      exercise('Dumbbell Curl', 3, '10-15', '60s', ['Biceps'], 'dumbbell'),
      exercise('Dar Tutuş Dumbbell Floor Press', 3, '10-15', '60s', ['Triceps', 'Göğüs'], 'dumbbell'),
    ],
  },
  upperB: {
    focus: 'Üst Vücut B — Omuz ve Sırt', emoji: '🎯',
    exercises: [
      exercise('Şınav', 4, '8-15', '90s', ['Göğüs', 'Triceps']),
      exercise('Resistance Band Row', 4, '10-15', '90s', ['Sırt', 'Biceps'], 'resistance_band'),
      exercise('Dumbbell Lateral Raise', 3, '12-20', '60s', ['Yan Omuz'], 'dumbbell'),
      exercise('Dumbbell Reverse Fly', 3, '12-20', '60s', ['Arka Omuz', 'Üst Sırt'], 'dumbbell'),
      exercise('Hammer Curl', 3, '10-15', '60s', ['Biceps'], 'dumbbell'),
      exercise('Dumbbell Overhead Triceps Extension', 3, '10-15', '60s', ['Triceps'], 'dumbbell'),
    ],
  },
  lowerA: {
    focus: 'Alt Vücut A — Squat Odaklı', emoji: '🦵',
    exercises: [
      exercise('Goblet Squat', 4, '8-15', '105s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Reverse Lunge', 3, '8-12/taraf', '90s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Romanian Deadlift', 4, '8-12', '105s', ['Arka Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Glute Bridge', 3, '10-15', '75s', ['Kalça'], 'dumbbell'),
      exercise('Standing Calf Raise', 4, '12-20', '45s', ['Baldır'], 'dumbbell'),
    ],
  },
  lowerB: {
    focus: 'Alt Vücut B — Tek Taraflı ve Kalça', emoji: '🦵',
    exercises: [
      exercise('Dumbbell Split Squat', 4, '8-12/taraf', '105s', ['Ön Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Romanian Deadlift', 4, '8-12', '105s', ['Arka Bacak', 'Kalça'], 'dumbbell'),
      exercise('Dumbbell Step-Up', 3, '8-12/taraf', '90s', ['Ön Bacak', 'Kalça'], 'stable_surface'),
      exercise('Resistance Band Hamstring Curl', 3, '12-20', '60s', ['Arka Bacak'], 'resistance_band'),
      exercise('Suitcase March', 3, '30-45 sn/taraf', '60s', ['Core'], 'dumbbell'),
    ],
  },
};

function buildStrengthWeek(library, phase) {
  const layouts = [
    ['fullA', null, 'fullB', null, 'fullC', null, null],
    ['upperA', 'lowerA', null, 'upperB', null, 'lowerB', null],
    ['upperA', 'lowerA', 'upperB', null, 'lowerB', null, 'fullC'],
    ['upperA', 'lowerA', 'upperB', null, 'lowerB', null, 'fullC'],
  ];
  const progressExercise = (item, exerciseIndex) => {
    if (phase < 2 || item.sets === 1) return { ...item };
    const next = {
      ...item,
      sets: Math.min(5, item.sets + (exerciseIndex < 3 ? 1 : 0)),
      difficulty: Math.min(3, (item.difficulty || 1) + (phase === 3 ? 1 : 0)),
    };
    if (phase === 3 && exerciseIndex < 2) next.tempo = '3 sn kontrollü iniş';
    return next;
  };
  return layouts[phase].map((key, index) => key
    ? {
      day: DAYS[index],
      image: '/images/modules/muscle-growth.jpg',
      ...library[key],
      exercises: library[key].exercises.map(progressExercise),
    }
    : restDay(DAYS[index]));
}

function buildFatLossWeek(library, phase) {
  const strength = buildStrengthWeek(library, phase);
  const activeIndices = phase === 0 ? [1, 5] : [2, 5];
  activeIndices.forEach((index, activeIndex) => {
    strength[index] = {
      day: DAYS[index],
      focus: activeIndex === 0 && phase > 0 ? 'Düşük Etkili Interval Yürüyüş' : 'Tempolu Yürüyüş + Mobilite',
      emoji: '🚶',
      image: '/images/modules/fat-loss.jpg',
      exercises: activeIndex === 0 && phase > 0
        ? [exercise('Düşük Etkili Interval Yürüyüş', 8, '1 dk hızlı / 1 dk rahat', '0s', ['Kardiyo'])]
        : [exercise('Tempolu Yürüyüş', 1, '30-45 dk', '-', ['Kardiyo']), exercise('Tüm Vücut Mobilite Akışı', 1, '8-10 dk', '-', ['Mobilite'])],
    };
  });
  return strength.map((day) => day.focus.includes('Tam Vücut') || day.focus.includes('Üst Vücut') || day.focus.includes('Alt Vücut')
    ? { ...day, image: '/images/modules/fat-loss.jpg', focus: `${day.focus} + Kas Koruma` }
    : day);
}

export const HOME_ALLOWED_EQUIPMENT = {
  home_bodyweight: new Set(['none', 'stable_surface']),
  home_basic: new Set(['none', 'stable_surface', 'dumbbell', 'resistance_band']),
};

export function buildHomeWorkoutProgram(goal, environment, phase) {
  const library = environment === 'home_basic' ? BASIC : BODYWEIGHT;
  return goal === 'fat_loss' ? buildFatLossWeek(library, phase) : buildStrengthWeek(library, phase);
}

export function findHomeEquipmentViolations(workoutSplit, environment) {
  const allowed = HOME_ALLOWED_EQUIPMENT[environment];
  if (!allowed) return [];
  return workoutSplit.flatMap((day) => [
    ...(day.exercises || []),
    ...(day.coreFinisher || []),
  ]
    .filter((item) => !allowed.has(item.equipment || 'none'))
    .map((item) => `${day.day}: ${item.name} (${item.equipment})`));
}
