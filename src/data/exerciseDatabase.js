/**
 * Exercise metadata database — form tips, muscle targets, difficulty
 * Used by WorkoutPanel to show helpful info for each exercise
 */

const exerciseDB = {
  // ── GÖĞÜS (Chest) ──────────────────────────────────────
  'bench press': { muscles: ['Göğüs', 'Triceps'], tip: 'Sırtını bankta sabit tut, dirseğini 45° aç', difficulty: 2, emoji: '🏋️', formSteps: ['Sırt düz, göğüs dışarı, kürek kemikleri sıkı', 'Barı göğsün alt kısmına doğru kontrollü indir', 'Dirsekleri 45° açıyla tut, omuzları aşırı açma', 'Nefes vererek barı patlayıcı şekilde yukarı it'], mistakes: ['Kalçayı banktan kaldırmak', 'Barı boyuna indirmek'] },
  'göğüs press': { muscles: ['Göğüs', 'Triceps'], tip: 'Sırtını bankta sabit tut, dirseğini 45° aç', difficulty: 2, emoji: '🏋️', formSteps: ['Sırt düz, göğüs dışarı, kürek kemikleri sıkı', 'Barı göğsün alt kısmına doğru kontrollü indir', 'Dirsekleri 45° açıyla tut, omuzları aşırı açma', 'Nefes vererek barı patlayıcı şekilde yukarı it'] },
  'dumbbell press': { muscles: ['Göğüs', 'Omuz'], tip: 'Ağırlığı kontrollü indir, göğüs hizasında dur', difficulty: 2, emoji: '🏋️' },
  'dumbbell fly': { muscles: ['Göğüs'], tip: 'Kolları hafif bükük tut, gerimi hisset', difficulty: 2, emoji: '🦋', formSteps: ['Sırta yat, dumbbell\'ları göğüs üstünde tut', 'Kolları hafif bükük tutarak yanlara doğru aç', 'Göğüste gerilmeyi hissettiğinde dur', 'Kolları kucaklarcasına birleştirerek kaldır'], mistakes: ['Kolları tamamen düz tutmak', 'Çok ağır başlamak'] },
  'incline press': { muscles: ['Üst Göğüs', 'Omuz'], tip: 'Bankı 30-45° ayarla', difficulty: 2, emoji: '🏋️' },
  'incline dumbbell press': { muscles: ['Üst Göğüs'], tip: 'Bankı 30° ayarla, üst göğse odaklan', difficulty: 2, emoji: '🏋️' },
  'decline press': { muscles: ['Alt Göğüs'], tip: 'Bankı -15° ayarla', difficulty: 2, emoji: '🏋️' },
  'cable crossover': { muscles: ['Göğüs'], tip: 'Kolları çapraz getir, sıkışmayı hisset', difficulty: 2, emoji: '🔗', formSteps: ['Makaraları göğüs hizasına ayarla', 'Bir adım öne çık, hafif öne eğil', 'Kolları yay çizerek aşağı ve içe doğru çek', 'Elleri ortada birleştir, göğsü sık, kontrollü geri aç'], mistakes: ['Gövdeyi çok ileri eğmek', 'Momentum kullanmak'] },
  'chest dip': { muscles: ['Alt Göğüs', 'Triceps'], tip: 'Öne eğil, dirsekleri dışa aç', difficulty: 3, emoji: '💪' },
  'şınav': { muscles: ['Göğüs', 'Triceps'], tip: 'Gövdeni düz tut, göğsü yere yaklaştır', difficulty: 1, emoji: '💪' },
  'push-up': { muscles: ['Göğüs', 'Triceps'], tip: 'Gövdeni düz tut, göğsü yere yaklaştır', difficulty: 1, emoji: '💪' },
  'pec deck': { muscles: ['Göğüs'], tip: 'Kolları yavaşça birleştir, sıkışmayı hisset', difficulty: 1, emoji: '🦋' },

  // ── SIRT (Back) ─────────────────────────────────────────
  'barbell row': { muscles: ['Sırt', 'Biceps'], tip: 'Sırtını düz tut, barı göbeğe çek', difficulty: 2, emoji: '🏋️', formSteps: ['Kalçadan eğil, sırt düz, dizler hafif bükük', 'Barı omuz genişliğinde kavra', 'Dirsekleri geri çekerek barı göbeğe doğru çek', 'Kürek kemiklerini sıkıştır, kontrollü indir'], mistakes: ['Sırtı yuvarlamak', 'Momentum ile çekmek'] },
  'sırt çekişi': { muscles: ['Sırt', 'Biceps'], tip: 'Sırtını düz tut, dirsekleri geri çek', difficulty: 2, emoji: '🏋️' },
  'lat pulldown': { muscles: ['Sırt'], tip: 'Göğse doğru çek, kürek kemiklerini sık', difficulty: 1, emoji: '⬇️', formSteps: ['Barı omuz genişliğinden geniş kavra', 'Göğsünü yukarı kaldır, hafif arkaya yaslan', 'Barı göğsün üst kısmına doğru çek', 'Kürek kemiklerini sıkıştır, yavaşça bırak'], mistakes: ['Barı enseden çekmek', 'Gövdeyi çok geriye atmak'] },
  'lat çekiş': { muscles: ['Sırt'], tip: 'Göğse doğru çek, kürek kemiklerini sık', difficulty: 1, emoji: '⬇️' },
  'pull-up': { muscles: ['Sırt', 'Biceps'], tip: 'Çeneyi barın üstüne getir, kontrollü in', difficulty: 3, emoji: '💪', formSteps: ['Barı omuz genişliğinde kavra, kollar tam açık', 'Kürek kemiklerini sık, göğsü bara doğru çek', 'Çeneni barın üstüne geçir', 'Kontrollü bir şekilde aşağı in, tam açıl'], mistakes: ['Bacaklarla sallanarak çekmek', 'Yarım tekrar yapmak'] },
  'barfiks': { muscles: ['Sırt', 'Biceps'], tip: 'Çeneyi barın üstüne getir, kontrollü in', difficulty: 3, emoji: '💪' },
  'seated row': { muscles: ['Sırt'], tip: 'Kürek kemiklerini sıkıştır, sırt düz', difficulty: 1, emoji: '🏋️' },
  'oturarak çekiş': { muscles: ['Sırt'], tip: 'Kürek kemiklerini sıkıştır, sırt düz', difficulty: 1, emoji: '🏋️' },
  'dumbbell row': { muscles: ['Sırt'], tip: 'Dirseği tavana doğru çek, gövde sabit', difficulty: 2, emoji: '🏋️' },
  'deadlift': { muscles: ['Sırt', 'Bacak'], tip: 'Sırt düz! Kalçadan kaldır, dizlerden değil', difficulty: 3, emoji: '🔥', formSteps: ['Ayaklar omuz genişliğinde, bar orta ayağın üstünde', 'Kalçadan eğil, barı kavra, sırt dümdüz', 'Göğsü aç, nefes al, core sıkı, kalçadan kaldır', 'Tam dik dur, kalçayı sık, kontrollü indir'], mistakes: ['Sırtı yuvarlamak', 'Barı vücuttan uzak tutmak', 'Dizlerden başlatmak'] },
  'deadlift (ölü çekiş)': { muscles: ['Sırt', 'Bacak'], tip: 'Sırt düz! Kalçadan kaldır', difficulty: 3, emoji: '🔥' },
  't-bar row': { muscles: ['Sırt'], tip: 'Göğsü pede daya, sırta odaklan', difficulty: 2, emoji: '🏋️' },
  'face pull': { muscles: ['Arka Omuz', 'Sırt'], tip: 'Halatı yüze doğru çek, dirsekler yukarı', difficulty: 1, emoji: '🔗', formSteps: ['Makarayı göz hizasına ayarla, halat tak', 'Halatı üst tutuşla kavra, bir adım geri çekil', 'Dirsekleri yukarı açarak halatı yüzüne çek', 'Arka omuzları sık, 1sn tut, kontrollü bırak'], mistakes: ['Ağırlığı çok ağır tutmak', 'Dirsekleri aşağıda tutmak'] },
  'hyperextension': { muscles: ['Alt Sırt'], tip: 'Kontrollü in ve kalk, ani hareket yapma', difficulty: 1, emoji: '🔄' },

  // ── OMUZ (Shoulders) ────────────────────────────────────
  'overhead press': { muscles: ['Omuz', 'Triceps'], tip: 'Çekirdek kaslarını sık, barı başın üstüne itin', difficulty: 2, emoji: '⬆️', formSteps: ['Barı omuz hizasında kavra, dirsekler önde', 'Core kaslarını sık, beli aşırı eğme', 'Barı başın üstüne doğru patlayıcı şekilde it', 'Kolları tamamen aç, barı başın üstünde kilitle'], mistakes: ['Beli aşırı eğmek', 'Bacaklardan destek almak'] },
  'omuz press': { muscles: ['Omuz', 'Triceps'], tip: 'Sırtını dik tut, barı başın üstüne itin', difficulty: 2, emoji: '⬆️' },
  'lateral raise': { muscles: ['Yan Omuz'], tip: 'Kolları omuz hizasına kadar kaldır, yavaş indir', difficulty: 1, emoji: '🦅', formSteps: ['Dumbbell\'ları yanlarda tut, dirsekler hafif bükük', 'Kolları yanlara doğru omuz hizasına kaldır', 'En üstte 1sn tut, yan omuzu sık', 'Yavaş ve kontrollü şekilde indir'], mistakes: ['Trapezi kullanmak', 'Momentum ile sallamak'] },
  'yan raise': { muscles: ['Yan Omuz'], tip: 'Kolları omuz hizasına kadar kaldır', difficulty: 1, emoji: '🦅' },
  'front raise': { muscles: ['Ön Omuz'], tip: 'Kolları göz hizasına kadar kaldır', difficulty: 1, emoji: '⬆️' },
  'ön raise': { muscles: ['Ön Omuz'], tip: 'Kolları göz hizasına kadar kaldır', difficulty: 1, emoji: '⬆️' },
  'reverse fly': { muscles: ['Arka Omuz'], tip: 'Öne eğil, kolları yana aç', difficulty: 1, emoji: '🦋' },
  'arnold press': { muscles: ['Omuz'], tip: 'Avuçları döndürerek yukarı it', difficulty: 2, emoji: '💪' },
  'shrug': { muscles: ['Trapez'], tip: 'Omuzları kulaklara doğru kaldır, 2sn tut', difficulty: 1, emoji: '🤷' },
  'omuz silkme': { muscles: ['Trapez'], tip: 'Omuzları kulaklara doğru kaldır', difficulty: 1, emoji: '🤷' },

  // ── BACAK (Legs) ────────────────────────────────────────
  'squat': { muscles: ['Quadriceps', 'Kalça'], tip: 'Dizleri ayak uçlarının önüne geçirme, derin çömel', difficulty: 2, emoji: '🦵', formSteps: ['Ayaklar omuz genişliğinde, parmaklar hafif dışa', 'Nefes al, core sık, kalçayı geri iterek çömel', 'Dizlerin ayak uçlarıyla aynı yönde olsun', 'Topuklardan iterek dik poz a kalk, kalçayı sık'], mistakes: ['Dizleri içe çökertmek', 'Topukları yerden kaldırmak'] },
  'squat (çömelme)': { muscles: ['Quadriceps', 'Kalça'], tip: 'Dizleri ayak uçlarının önüne geçirme', difficulty: 2, emoji: '🦵' },
  'leg press': { muscles: ['Quadriceps'], tip: 'Sırtını yastığa daya, dizleri 90°ye kadar bük', difficulty: 1, emoji: '🦵', formSteps: ['Sırtını yastığa tam daya, bel boşluk bırakma', 'Ayakları omuz genişliğinde platforma koy', 'Dizleri 90° olana kadar kontrollü indir', 'Topuklardan iterek kaldır, dizleri kilitleme'], mistakes: ['Beli yastıktan kaldırmak', 'Dizleri tamamen kilitlemek'] },
  'bacak press': { muscles: ['Quadriceps'], tip: 'Sırtını yastığa daya, dizleri kilitleme', difficulty: 1, emoji: '🦵' },
  'leg extension': { muscles: ['Quadriceps'], tip: 'Bacağı tamamen düzleştir, 1sn tut', difficulty: 1, emoji: '🦵' },
  'bacak extension': { muscles: ['Quadriceps'], tip: 'Bacağı tamamen düzleştir, 1sn tut', difficulty: 1, emoji: '🦵' },
  'leg curl': { muscles: ['Hamstring'], tip: 'Topukları kalçana doğru çek', difficulty: 1, emoji: '🦵' },
  'bacak curl': { muscles: ['Hamstring'], tip: 'Topukları kalçana doğru çek', difficulty: 1, emoji: '🦵' },
  'lunge': { muscles: ['Quadriceps', 'Kalça'], tip: 'Dik dur, ön diz 90° olsun, arka diz yere yakın', difficulty: 2, emoji: '🚶', formSteps: ['Dik dur, ayaklar kalça genişliğinde', 'Bir adım öne at, gövde dik kalsın', 'Ön bacak 90°, arka diz yere yaklaşsın', 'Ön topuktan iterek başlangıç pozisyonuna dön'], mistakes: ['Gövdeyi öne eğmek', 'Dizi ayak ucunun önüne geçirmek'] },
  'lunge (hamle)': { muscles: ['Quadriceps', 'Kalça'], tip: 'Dik dur, ön diz 90° olsun', difficulty: 2, emoji: '🚶' },
  'bulgarian split squat': { muscles: ['Quadriceps', 'Kalça'], tip: 'Arka ayağı bankta tut, ön bacağa yüklen', difficulty: 3, emoji: '🔥' },
  'calf raise': { muscles: ['Baldır'], tip: 'Ayak parmaklarının ucunda yüksel, 2sn tut', difficulty: 1, emoji: '🦶' },
  'baldır kaldırma': { muscles: ['Baldır'], tip: 'Parmak ucunda yüksel, yavaş in', difficulty: 1, emoji: '🦶' },
  'hip thrust': { muscles: ['Kalça'], tip: 'Kalçayı sık, üst pozisyonda 2sn tut', difficulty: 2, emoji: '🍑', formSteps: ['Sırtını banka daya, omuz altı bank kenarında', 'Barı kalça kıvrımına yerleştir, ayaklar yere', 'Kalçayı yukarı kaldır, gövde düz çizgi olsun', 'Üstte kalçayı maksimum sık, 2sn tut, indir'], mistakes: ['Beli aşırı eğmek', 'Ayakları çok uzağa koymak'] },
  'romanian deadlift': { muscles: ['Hamstring', 'Kalça'], tip: 'Bacaklar hafif bükük, kalçadan eğil', difficulty: 2, emoji: '🏋️', formSteps: ['Barı omuz genişliğinde kavra, dik dur', 'Dizler hafif bükük, kalçadan öne eğil', 'Barı bacakların önünden aşağı kaydır', 'Hamstring gerildiğinde dur, kalçadan kalkarak dön'], mistakes: ['Dizleri çok bükmek', 'Sırtı yuvarlamak'] },
  'hack squat': { muscles: ['Quadriceps'], tip: 'Sırtını makineye daya, derin çömel', difficulty: 2, emoji: '🦵' },

  // ── KOL (Arms) ──────────────────────────────────────────
  'bicep curl': { muscles: ['Biceps'], tip: 'Dirseğini sabit tut, sadece ön kolu hareket ettir', difficulty: 1, emoji: '💪', formSteps: ['Dik dur, dumbbell\'ları yanlarda tut', 'Dirsekleri gövdeye yapıştır, sabit tut', 'Ön kolu yukarı bük, bicepsi sık', 'Yavaş ve kontrollü şekilde indir'], mistakes: ['Gövdeyi sallamak', 'Dirsekleri hareket ettirmek'] },
  'biceps curl': { muscles: ['Biceps'], tip: 'Dirseğini sabit tut, sadece ön kolu hareket ettir', difficulty: 1, emoji: '💪' },
  'hammer curl': { muscles: ['Biceps', 'Ön Kol'], tip: 'Avuçlar karşı karşıya, dirsek sabit', difficulty: 1, emoji: '🔨' },
  'triceps pushdown': { muscles: ['Triceps'], tip: 'Dirseği sabit tut, aşağı it', difficulty: 1, emoji: '⬇️', formSteps: ['Makara kablosuna bar veya halat tak', 'Dirsekleri gövde yanında sabitle', 'Barı aşağıya doğru it, kolları tam aç', 'Tricepsi sık, kontrollü yukarı bırak'], mistakes: ['Dirsekleri açmak', 'Gövdeyle momentum almak'] },
  'tricep dip': { muscles: ['Triceps'], tip: 'Dirsekleri arkaya bük, gövde dik', difficulty: 2, emoji: '💪' },
  'skull crusher': { muscles: ['Triceps'], tip: 'Barı alna doğru indir, dirsek sabit', difficulty: 2, emoji: '💀' },
  'overhead tricep extension': { muscles: ['Triceps'], tip: 'Dumbbell\'ı başın arkasına indir', difficulty: 1, emoji: '⬆️' },
  'concentration curl': { muscles: ['Biceps'], tip: 'Dirseği dizine daya, yavaş kaldır', difficulty: 1, emoji: '🎯' },
  'preacher curl': { muscles: ['Biceps'], tip: 'Kolu pede daya, tam açılım sağla', difficulty: 1, emoji: '💪' },
  'wrist curl': { muscles: ['Ön Kol'], tip: 'Bileği yukarı bük, yavaş indir', difficulty: 1, emoji: '✊' },

  // ── KARINN (Core/Abs) ───────────────────────────────────
  'plank': { muscles: ['Core'], tip: 'Gövde düz, kalça düşmesin, nefes al', difficulty: 1, emoji: '🧱', formSteps: ['Dirsekler omuz altında, ön kollar yerde', 'Vücut baştan topuğa düz bir çizgi olsun', 'Core ve kalça kaslarını sık', 'Nefes almayı unutma, pozisyonu koru'], mistakes: ['Kalçayı yukarı kaldırmak', 'Beli çukurlaştırmak'] },
  'crunch': { muscles: ['Karın'], tip: 'Omuzları yerden kaldır, boynu zorlamadan', difficulty: 1, emoji: '🔥', formSteps: ['Sırta yat, dizler bükük, ayaklar yerde', 'Ellerini göğsünde çaprazla veya başın yanına koy', 'Nefes vererek omuzları yerden kaldır', 'Karın kaslarını sık, yavaşça geri in'], mistakes: ['Boynu çekmek', 'Momentum kullanmak'] },
  'russian twist': { muscles: ['Yan Karın'], tip: 'Ayakları yerden kaldır, sağa sola dön', difficulty: 2, emoji: '🔄' },
  'leg raise': { muscles: ['Alt Karın'], tip: 'Bacakları dik kaldır, yavaş indir', difficulty: 2, emoji: '🦵', formSteps: ['Sırta yat, kollar yanlarda, avuçlar yerde', 'Bacakları düz tutarak yukarı kaldır', '90° açıya gelince dur', 'Yavaş ve kontrollü şekilde indir, yere değme'], mistakes: ['Beli yerden kaldırmak', 'Bacakları bırakırcasına indirmek'] },
  'mountain climber': { muscles: ['Core', 'Cardio'], tip: 'Kalça aşağıda, dizleri hızlı çek', difficulty: 2, emoji: '⛰️' },
  'bicycle crunch': { muscles: ['Karın', 'Yan Karın'], tip: 'Karşı dirsek-diz buluşsun', difficulty: 2, emoji: '🚲' },
  'dead bug': { muscles: ['Core'], tip: 'Sırtını yere bastır, karşılıklı uzat', difficulty: 1, emoji: '🪲' },
  'hanging leg raise': { muscles: ['Alt Karın'], tip: 'Bardan asıl, bacakları kaldır, sallanma', difficulty: 3, emoji: '🦵' },
  'ab wheel': { muscles: ['Core'], tip: 'Yavaşça ileri git, core sıkı, geri gel', difficulty: 3, emoji: '🎡' },

  // ── YOGA / PİLATES ──────────────────────────────────────
  'downward dog': { muscles: ['Hamstring', 'Omuz'], tip: 'Kalçayı yukarı it, topukları yere bas', difficulty: 1, emoji: '🧘' },
  'warrior pose': { muscles: ['Bacak', 'Core'], tip: 'Ön diz 90°, kollar yana açık', difficulty: 1, emoji: '⚔️' },
  'tree pose': { muscles: ['Denge', 'Core'], tip: 'Ayağını dizine veya uyluğuna koy, dik dur', difficulty: 1, emoji: '🌳' },
  'cobra stretch': { muscles: ['Sırt', 'Karın'], tip: 'Kollarla it, göğsü aç, kalça yerde', difficulty: 1, emoji: '🐍' },
  'child pose': { muscles: ['Sırt'], tip: 'Kalçayı topuklara daya, kolları uzat, rahatla', difficulty: 1, emoji: '🧒' },
  'bridge': { muscles: ['Kalça', 'Core'], tip: 'Kalçayı kaldır, üstte sık, yavaş indir', difficulty: 1, emoji: '🌉' },
  'cat-cow': { muscles: ['Sırt'], tip: 'Nefesle sırtı yuvarlat/çukurlaştır', difficulty: 1, emoji: '🐱' },
};

/**
 * Find exercise metadata by name (fuzzy match)
 */
export function getExerciseInfo(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();

  // Exact match
  if (exerciseDB[lower]) return exerciseDB[lower];

  // Partial match — find first key that's included in the name
  for (const [key, val] of Object.entries(exerciseDB)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }

  // No match — return generic
  return null;
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(level) {
  switch (level) {
    case 1: return { text: 'Kolay', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 2: return { text: 'Orta', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 3: return { text: 'Zor', color: 'text-red-400', bg: 'bg-red-500/10' };
    default: return { text: '—', color: 'text-slate-500', bg: 'bg-slate-800' };
  }
}
