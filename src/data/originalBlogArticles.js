// Original, data-backed guides (Nov 2026): home-dish calorie tables computed from
// stated recipe assumptions, a printable 28-day calendar and a sourced myth check.
// Dish values: ingredient energy and protein per 100 g from USDA FoodData Central,
// summed per portion and rounded to 10 kcal / 1 g. Change a recipe, recompute the row.
const usda = ['USDA FoodData Central', 'https://fdc.nal.usda.gov/'];
const whoDiet = ['WHO: Healthy diet', 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet'];
const whoActivity = ['WHO: Physical activity', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'];
const spotSources = [
  ['Vispute et al. The effect of abdominal exercise on abdominal fat. J Strength Cond Res (2011)', 'https://pubmed.ncbi.nlm.nih.gov/21804427/'],
  ['Ramírez-Campillo et al. Regional fat changes induced by localized muscle endurance resistance training. J Strength Cond Res (2013)', 'https://pubmed.ncbi.nlm.nih.gov/23222084/'],
  whoActivity,
];
const defaults = { publishedAt: '2026-11-04', updatedAt: '2026-11-04' };
const food = { ...defaults, accent: '#f59e0b', image: '/images/blog/meal-review.svg' };
const training = { ...defaults, accent: '#f97316', image: '/images/blog/dumbbell-log.svg' };

export const PRINTABLE_CALENDARS = {
  tr: '/printables/28-gunluk-challenge-takvimi',
  en: '/printables/28-day-challenge-calendar',
  es: '/printables/calendario-reto-28-dias',
};

export const originalBlogArticles = [
  {
    ...food, language: 'tr', translationKey: 'turkish-dish-calories', slug: 'turk-yemekleri-kalori-tablosu',
    title: 'Türk Yemeklerinin Kalorisi: 19 Ev Yemeği, Porsiyon ve Yağ Payıyla',
    description: 'Mercimek çorbası, menemen, kuru fasulye, lahmacun, mantı ve daha fazlası: her yemeğin porsiyon varsayımı, yaklaşık kalorisi, proteini ve kalorinin ne kadarının eklenen yağdan geldiği.',
    category: 'Beslenme', readTime: '7 dk',
    imageAlt: 'Ev yemeği tabağı ve porsiyon, kalori ve yağ miktarı notlarını gösteren öğün değerlendirme çizimi',
    intro: 'Çoğu kalori tablosu Türk ev yemeklerini ya hiç bilmez ya da tek bir sayı verip geçer. Oysa aynı tabak, tencereye giren yağa göre 100 kaloriden fazla değişebilir. Bu tabloda her yemeğin hangi tarifle ve hangi porsiyonla hesaplandığını açıkça yazdık; böylece kendi tarifinle karşılaştırabilirsin.',
    sections: [
      { heading: 'Bu tablo nasıl hesaplandı?', paragraphs: [
        'Her yemek için tipik bir ev tarifini tek porsiyona böldük ve malzemelerin 100 gramdaki enerji ve protein değerlerini USDA FoodData Central veri tabanından aldık. Porsiyondaki malzemeler toplanıp kalori 10\'a, protein 1 grama yuvarlandı. Değerler laboratuvar ölçümü değil, açık varsayımlara dayalı tahminlerdir.',
        'Son sütun, kalorinin ne kadarının tencereye eklenen sıvı yağ veya tereyağından geldiğini gösterir. Bir yemeği hafifletmek istiyorsan bakman gereken ilk sayı budur.',
      ] },
      { heading: 'Yemek yemek kalori tablosu', paragraphs: [
        'Kendi tarifin farklıysa en büyük farkı genellikle yağ miktarı ve porsiyon büyüklüğü yaratır. Bir yemek kaşığı yağ (yaklaşık 13,5 g) tek başına yaklaşık 120 kaloridir.',
      ], table: {
        caption: 'Yaklaşık değerler. 1 kase ≈ 250 ml, 1 tabak ≈ 250 g pişmiş yemek. Kaynak: malzeme değerleri USDA FoodData Central.',
        head: ['Yemek', 'Porsiyon ve tarif varsayımı', 'Kalori', 'Protein', 'Eklenen yağın payı'],
        rows: [
          ['Mercimek çorbası', '1 kase: 25 g kırmızı mercimek, 1 çay kaşığı yağ', '≈ 140 kcal', '6 g', '%32'],
          ['Mercimek çorbası, tereyağlı', 'Aynı kase + üstüne 5 g tereyağı', '≈ 170 kcal', '6 g', '%46'],
          ['Menemen', '2 yumurta, 150 g domates, 50 g biber, 10 g yağ', '≈ 270 kcal', '14 g', '%33'],
          ['Kuru fasulye', '1 tabak: 60 g kuru fasulye, 10 g yağ, salça', '≈ 300 kcal', '15 g', '%29'],
          ['Kuru fasulye, etli', 'Aynı tabak + 30 g kıyma', '≈ 380 kcal', '20 g', '%23'],
          ['Nohut yemeği', '1 tabak: 60 g kuru nohut, 10 g yağ', '≈ 330 kcal', '13 g', '%27'],
          ['Pirinç pilavı', '1 porsiyon: 60 g çiğ pirinç, 8 g yağ', '≈ 290 kcal', '4 g', '%24'],
          ['Bulgur pilavı', '1 porsiyon: 60 g bulgur, 8 g yağ, salça', '≈ 290 kcal', '8 g', '%25'],
          ['Kısır', '1 kase: 40 g bulgur, 10 g zeytinyağı, nar ekşisi', '≈ 250 kcal', '5 g', '%35'],
          ['Zeytinyağlı taze fasulye', '1 tabak: 180 g fasulye, 15 g zeytinyağı', '≈ 200 kcal', '4 g', '%66'],
          ['Karnıyarık, kızartılmış patlıcan', '1 patlıcan, 40 g kıyma; patlıcan ≈ 20 g yağ çeker', '≈ 340 kcal', '9 g', '%51'],
          ['Karnıyarık, fırında patlıcan', 'Aynı tarif, 5 g yağla fırında', '≈ 210 kcal', '9 g', '%21'],
          ['Tavuk sote', '150 g tavuk göğsü, 100 g sebze, 10 g yağ', '≈ 290 kcal', '35 g', '%30'],
          ['Lahmacun', '1 adet: 60 g un, 30 g kıyma', '≈ 330 kcal', '12 g', '%8'],
          ['Mantı', '1 porsiyon: 70 g un, 30 g kıyma, 100 g yoğurt, 10 g tereyağı', '≈ 460 kcal', '16 g', '%15'],
          ['Sigara böreği', '1 adet, kızartılmış (≈ 5 g yağ çeker)', '≈ 110 kcal', '3 g', '%39'],
          ['Simit', '1 adet ≈ 90 g', '≈ 340 kcal', '9 g', '—'],
          ['Cacık', '1 kase: 150 g yoğurt, salatalık, 5 g zeytinyağı', '≈ 140 kcal', '6 g', '%31'],
          ['Ayran', '1 bardak: 100 g yoğurt + su', '≈ 60 kcal', '4 g', '—'],
        ],
      } },
      { heading: 'Tablodan çıkan üç ders', paragraphs: [
        'Birincisi: zeytinyağlılar "hafif" sanılır ama zeytinyağlı taze fasulyede kalorinin üçte ikisi yağdandır. Sebze yemeği sağlıklı bir seçimdir; kalori takip ediyorsan tencereye giren yağı ölçmek yeter.',
        'İkincisi: pişirme yöntemi tarifin kendisinden önemlidir. Patlıcanı kızartmak yerine fırınlamak aynı karnıyarığı yaklaşık 130 kalori hafifletir. Üçüncüsü: protein için baklagiller güçlüdür. Bir tabak kuru fasulye veya nohut 13-15 g protein verir; yanına yoğurt veya ayran eklemek bunu artırır.',
      ] },
      { heading: 'Kendi tabağını nasıl hesaplarsın?', paragraphs: [
        'Tencereye koyduğun yağı ve kuru malzemeyi (mercimek, bulgur, pirinç) tartıp kaç porsiyona böldüğünü not etmen yeterli. Bu iki sayı tablodaki farkların büyük kısmını açıklar. Restoranda ise porsiyon ve yağ bilinmediği için değerin tablodakinden yüksek olabileceğini varsay.',
        'Full Balance\'ta öğünün fotoğrafını çekip malzemeleri ve porsiyonu düzeltebilirsin; fotoğraf görünmeyen yağı bilemez, bu yüzden yağ miktarını kendin eklemen sonucu en çok iyileştiren adımdır.',
      ] },
    ], sources: [usda, whoDiet, ['Meal photograph nutrient estimation study (2025)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11858203/']],
    internalLinks: [['/fotografla-kalori-hesaplama', 'Fotoğraftan kalori hesaplama'], ['/protein-ihtiyaci-hesaplama', 'Protein ihtiyacı hesaplama'], ['/yag-yakimi-programi', 'Yağ yakımı programı']],
    cta: { href: '/fotografla-kalori-hesaplama', label: 'Tabağını fotoğrafla kontrol et', title: 'Kendi yemeğini hesapla', description: 'Öğün fotoğrafını yükle, malzemeleri ve yağ miktarını düzelt. Ücretsiz, kayıt gerektirmez.' },
  },
  {
    ...food, language: 'en', translationKey: 'turkish-dish-calories', slug: 'turkish-food-calories',
    title: 'Turkish Food Calories: 19 Home Dishes With Portion and Oil Share',
    description: 'Lentil soup, menemen, white bean stew, lahmacun, manti and more: the portion assumption, approximate calories, protein and how much of each dish comes from added oil.',
    category: 'Nutrition', readTime: '7 min',
    imageAlt: 'Meal review illustration showing a home-cooked plate with portion, calorie and oil notes',
    intro: 'Most calorie databases either skip Turkish home cooking or give one number with no recipe behind it. The same plate can differ by more than 100 calories depending on the oil in the pot, so every row below states the recipe and portion it was calculated from.',
    sections: [
      { heading: 'How the table was calculated', paragraphs: [
        'Each dish is a typical home recipe divided into one portion. Energy and protein per 100 g of each ingredient come from USDA FoodData Central; the portion is summed and rounded to 10 kcal and 1 g of protein. These are estimates from stated assumptions, not laboratory measurements.',
        'The last column shows how much of the energy comes from oil or butter added during cooking. If you want to make a dish lighter, that is the first number to look at.',
      ] },
      { heading: 'Calories in Turkish dishes', paragraphs: [
        'If your recipe differs, oil and portion size usually explain most of the gap. One tablespoon of oil (about 13.5 g) is roughly 120 kcal on its own.',
      ], table: {
        caption: 'Approximate values. 1 bowl ≈ 250 ml, 1 plate ≈ 250 g cooked. Ingredient data: USDA FoodData Central.',
        head: ['Dish', 'Portion and recipe assumption', 'Calories', 'Protein', 'Share from added fat'],
        rows: [
          ['Red lentil soup (mercimek çorbası)', '1 bowl: 25 g red lentils, 1 tsp oil', '≈ 140 kcal', '6 g', '32%'],
          ['Lentil soup with butter', 'Same bowl + 5 g butter on top', '≈ 170 kcal', '6 g', '46%'],
          ['Menemen (eggs with tomato and pepper)', '2 eggs, 150 g tomato, 50 g pepper, 10 g oil', '≈ 270 kcal', '14 g', '33%'],
          ['White bean stew (kuru fasulye)', '1 plate: 60 g dry beans, 10 g oil, tomato paste', '≈ 300 kcal', '15 g', '29%'],
          ['White bean stew with beef', 'Same plate + 30 g minced beef', '≈ 380 kcal', '20 g', '23%'],
          ['Chickpea stew (nohut)', '1 plate: 60 g dry chickpeas, 10 g oil', '≈ 330 kcal', '13 g', '27%'],
          ['Rice pilaf', '1 portion: 60 g raw rice, 8 g oil', '≈ 290 kcal', '4 g', '24%'],
          ['Bulgur pilaf', '1 portion: 60 g bulgur, 8 g oil, tomato paste', '≈ 290 kcal', '8 g', '25%'],
          ['Kısır (bulgur salad)', '1 bowl: 40 g bulgur, 10 g olive oil, pomegranate molasses', '≈ 250 kcal', '5 g', '35%'],
          ['Green beans in olive oil', '1 plate: 180 g beans, 15 g olive oil', '≈ 200 kcal', '4 g', '66%'],
          ['Karnıyarık, fried eggplant', '1 eggplant, 40 g minced beef; eggplant absorbs ≈ 20 g oil', '≈ 340 kcal', '9 g', '51%'],
          ['Karnıyarık, oven-roasted eggplant', 'Same recipe, 5 g oil, roasted', '≈ 210 kcal', '9 g', '21%'],
          ['Chicken sauté (tavuk sote)', '150 g chicken breast, 100 g vegetables, 10 g oil', '≈ 290 kcal', '35 g', '30%'],
          ['Lahmacun', '1 piece: 60 g flour, 30 g minced beef', '≈ 330 kcal', '12 g', '8%'],
          ['Manti', '1 portion: 70 g flour, 30 g beef, 100 g yogurt, 10 g butter', '≈ 460 kcal', '16 g', '15%'],
          ['Sigara böreği (cheese roll)', '1 piece, fried (absorbs ≈ 5 g oil)', '≈ 110 kcal', '3 g', '39%'],
          ['Simit', '1 ring ≈ 90 g', '≈ 340 kcal', '9 g', '—'],
          ['Cacık (yogurt with cucumber)', '1 bowl: 150 g yogurt, cucumber, 5 g olive oil', '≈ 140 kcal', '6 g', '31%'],
          ['Ayran', '1 glass: 100 g yogurt + water', '≈ 60 kcal', '4 g', '—'],
        ],
      } },
      { heading: 'Three lessons from the table', paragraphs: [
        'Olive-oil vegetable dishes look light, but two thirds of the energy in green beans in olive oil comes from the oil. The dish is still a good choice; if you track calories, measuring the oil is enough.',
        'Cooking method matters more than the recipe name: roasting instead of frying the eggplant makes the same karnıyarık about 130 kcal lighter. And legumes are a strong protein source: a plate of bean or chickpea stew gives 13-15 g, more with yogurt or ayran on the side.',
      ] },
      { heading: 'How to estimate your own plate', paragraphs: [
        'Weigh the oil and the dry ingredient (lentils, bulgur, rice) that go into the pot and note how many portions you serve. Those two numbers explain most of the differences in the table. At a restaurant, assume the value may be higher because portion and oil are unknown.',
        'In Full Balance you can photograph a meal and then correct the foods and portion. A photo cannot see the oil, so adding it yourself is the step that improves the estimate most.',
      ] },
    ], sources: [usda, whoDiet, ['Meal photograph nutrient estimation study (2025)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11858203/']],
    internalLinks: [['/en/photo-calorie-counter', 'Free photo calorie counter'], ['/en/blog/how-accurate-photo-calorie-counter', 'How accurate are photo calorie counters?']],
    cta: { href: '/en/photo-calorie-counter', label: 'Check a meal photo', title: 'Estimate your own plate', description: 'Upload a meal photo, then correct foods, portion and oil. Free, no sign-up required.' },
  },
  {
    ...food, language: 'es', translationKey: 'spanish-dish-calories', slug: 'calorias-comida-espanola',
    title: 'Calorías de la Comida Española: 8 Platos Caseros con Ración y Aceite',
    description: 'Tortilla de patatas, lentejas, paella, gazpacho, pisto y croquetas: la receta y la ración de cada plato, sus calorías y proteína aproximadas y cuánto viene del aceite añadido.',
    category: 'Nutrición', readTime: '6 min',
    imageAlt: 'Ilustración de revisión de comida con un plato casero y notas de ración, calorías y aceite',
    intro: 'Una tortilla de patatas puede tener 250 o 450 calorías por ración según cuánto aceite absorba la patata. Por eso, en esta tabla cada plato indica la receta y la ración con la que se calculó: así puedes compararla con la tuya en lugar de fiarte de un número suelto.',
    sections: [
      { heading: 'Cómo se calculó la tabla', paragraphs: [
        'Cada plato es una receta casera típica dividida en una ración. La energía y la proteína por 100 g de cada ingrediente proceden de USDA FoodData Central; se suman por ración y se redondean a 10 kcal y 1 g de proteína. Son estimaciones con supuestos explícitos, no análisis de laboratorio.',
        'La última columna indica qué parte de la energía viene del aceite o la mantequilla añadidos al cocinar. Si quieres aligerar un plato, es el primer número que conviene mirar.',
      ] },
      { heading: 'Tabla de calorías de platos españoles', paragraphs: [
        'Si tu receta es distinta, el aceite y el tamaño de la ración suelen explicar casi toda la diferencia. Una cucharada de aceite de oliva (unos 13,5 g) aporta por sí sola unas 120 kcal.',
      ], table: {
        caption: 'Valores aproximados. Datos de ingredientes: USDA FoodData Central.',
        head: ['Plato', 'Ración y receta supuesta', 'Calorías', 'Proteína', 'Parte del aceite añadido'],
        rows: [
          ['Tortilla de patatas', '1/4 de tortilla: 1,5 huevos, 150 g patata, absorbe ≈ 15 g aceite', '≈ 370 kcal', '13 g', '36 %'],
          ['Lentejas con chorizo', '1 plato: 70 g lentejas secas, 20 g chorizo, 10 g aceite', '≈ 440 kcal', '23 g', '20 %'],
          ['Lentejas sin chorizo', 'El mismo plato sin chorizo', '≈ 350 kcal', '18 g', '25 %'],
          ['Paella de pollo', '1 ración: 80 g arroz, 80 g pollo, verduras, 10 g aceite', '≈ 490 kcal', '24 g', '18 %'],
          ['Gazpacho', '1 tazón de 250 ml: tomate, pepino, pimiento, 15 g pan, 10 g aceite', '≈ 180 kcal', '4 g', '50 %'],
          ['Pisto', '1 plato: 250 g verduras, 15 g aceite', '≈ 200 kcal', '2 g', '68 %'],
          ['Croqueta de jamón', '1 unidad ≈ 30 g, frita', '≈ 90 kcal', '2 g', '52 %'],
          ['Pan con tomate', '1 rebanada de 50 g, tomate, 5 g aceite', '≈ 180 kcal', '5 g', '24 %'],
        ],
      } },
      { heading: 'Lo que enseña la tabla', paragraphs: [
        'Los platos de verdura como el pisto o el gazpacho son buenas elecciones, pero en ambos la mitad o más de la energía viene del aceite. Medir el aceite con una cuchara en lugar de echarlo a ojo es el cambio más sencillo si controlas calorías.',
        'Las legumbres son una fuente de proteína potente y barata: un plato de lentejas aporta 18-23 g. El chorizo suma unas 90 kcal por cada 20 g; puedes mantener el sabor con pimentón y reducir la cantidad.',
      ] },
      { heading: 'Cómo estimar tu propio plato', paragraphs: [
        'Pesa el aceite y el ingrediente seco (lentejas, arroz) que van a la olla y anota cuántas raciones sirves. En un restaurante, asume que el valor puede ser mayor porque la ración y el aceite son desconocidos.',
        'En Full Balance puedes fotografiar la comida y corregir alimentos y ración. La foto no ve el aceite, así que añadirlo tú es lo que más mejora la estimación.',
      ] },
    ], sources: [usda, whoDiet, ['Estudio de estimación de nutrientes a partir de fotos (2025)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11858203/']],
    internalLinks: [['/es/contar-calorias-con-foto', 'Contador de calorías por foto'], ['/es/blog/precision-calorias-foto-porciones-aceite', 'Precisión de las calorías por foto']],
    cta: { href: '/es/contar-calorias-con-foto', label: 'Revisa una foto de tu comida', title: 'Calcula tu propio plato', description: 'Sube una foto de tu comida y corrige alimentos, ración y aceite. Gratis, sin registro.' },
  },
  {
    ...training, language: 'tr', translationKey: 'challenge-calendar', slug: '28-gunluk-challenge-takvimi-yazdir',
    title: '28 Günlük Spor Challenge Takvimi: Yazdır, Buzdolabına As, İşaretle',
    description: 'Ücretsiz yazdırılabilir 28 günlük antrenman takvimi: 4 hafta, haftada 3 antrenman, 12 kutucuk. Neden kâğıt takvim işe yarar ve nasıl kullanılır.',
    category: 'Antrenman', readTime: '4 dk',
    imageAlt: 'Dört haftalık antrenman takvimi ve işaretlenmiş antrenman günlerini gösteren antrenman günlüğü çizimi',
    intro: 'Yeni bir alışkanlığı en çok bozan şey motivasyon eksikliği değil, unutmaktır. Görünür bir yerde duran ve her antrenmandan sonra bir kutucuk işaretlediğin bir takvim bu yüzden basit ama etkilidir. Aşağıdan 28 günlük takvimi ücretsiz yazdırabilirsin.',
    sections: [
      { heading: 'Takvimi indir ve yazdır', paragraphs: [
        'Takvim A4 sayfaya sığar: 4 hafta, her hafta 3 antrenman kutucuğu ve kısa not alanları. Sayfayı açtıktan sonra yazdır düğmesine bas veya tarayıcıdan "PDF olarak kaydet"i seç.',
      ], download: { href: PRINTABLE_CALENDARS.tr, label: 'Takvimi aç ve yazdır' } },
      { heading: 'Kurallar: 28 günde 12 antrenman', paragraphs: [
        'Hedef haftada 3 antrenman, toplam 12. Her antrenman 20-45 dakika sürebilir; önemli olan süre değil, yapılmış olması. Bir günü kaçırırsan haftanın başka bir gününe kaydır. Haftada 3 gün, Dünya Sağlık Örgütü\'nün yetişkinlere önerdiği haftada en az 2 gün kas güçlendirme hedefini de karşılar.',
        'Antrenmanlar arasında en az bir dinlenme günü bırakmak toparlanmayı kolaylaştırır. Pazartesi, çarşamba ve cuma klasik bir düzendir ama hayatına uyan herhangi üç gün olur.',
      ] },
      { heading: 'Takvimi işe yarar kılan üç ayrıntı', paragraphs: [
        'Görünür yere as: buzdolabı, ayna veya masa. Takvim çekmecede kalırsa etkisi kalmaz. Antrenman günlerini baştan yaz: hafta başında üç günü kutucuklara not etmek, kararı her gün yeniden vermekten kolaydır.',
        'İşaretlemeyi hemen yap: antrenman biter bitmez kutucuğu doldur. Zinciri görmek bir sonraki antrenmanı başlatmayı kolaylaştırır; bir kutucuğu kaçırmak ise zinciri bitirmez, sadece haftanın kalanını planlamanı hatırlatır.',
      ] },
      { heading: 'Kâğıt mı, uygulama mı? İkisi birden', paragraphs: [
        'Kâğıt takvim hatırlatır, uygulama ise ne yapacağını söyler. Full Balance içinde 28 günlük challenge\'a katıldığında her gün hangi antrenmanı yapacağın hazırdır; antrenman modunda setleri işaretledikçe challenge ilerlemen kendiliğinden güncellenir. Takvimi buzdolabına as, antrenmanı telefondan aç.',
      ] },
    ], sources: [whoActivity, ['ACSM resistance training guidance (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/']],
    internalLinks: [['/28-gunluk-challenge', '28 günlük challenge'], ['/evde-dambil-antrenman-programi', 'Evde dambıl programı'], ['/blog/evde-kas-yapilir-mi', 'Evde kas yapılır mı?']],
    cta: { href: '/28-gunluk-challenge', label: 'Ücretsiz katıl', title: 'Antrenmanların hazır olsun', description: '28 günde 12 antrenman: planın, set takibin ve ilerleme kartın uygulamada.' },
  },
  {
    ...training, language: 'en', translationKey: 'challenge-calendar', slug: '28-day-workout-challenge-calendar-printable',
    title: 'Printable 28-Day Workout Challenge Calendar: Print, Post, Tick',
    description: 'A free printable 28-day workout calendar: 4 weeks, 3 workouts a week, 12 boxes to tick. Why a paper calendar works and how to use it well.',
    category: 'Training', readTime: '4 min',
    imageAlt: 'Workout journal illustration showing a four-week calendar with ticked workout days',
    intro: 'New habits usually fail because we forget, not because we lack motivation. A calendar in a visible place, with a box you tick after every workout, is simple and surprisingly effective. Print the free 28-day calendar below.',
    sections: [
      { heading: 'Open and print the calendar', paragraphs: [
        'It fits on one A4 or Letter page: 4 weeks, 3 workout boxes per week and short note lines. Open the page and press the print button, or choose "Save as PDF" in your browser.',
      ], download: { href: PRINTABLE_CALENDARS.en, label: 'Open the printable calendar' } },
      { heading: 'The rules: 12 workouts in 28 days', paragraphs: [
        'The goal is 3 workouts a week, 12 in total. A workout can take 20-45 minutes; what counts is that it happened. If you miss a day, move it to another day that week. Three days a week also covers the World Health Organization\'s recommendation of muscle-strengthening activity on at least 2 days a week for adults.',
        'Leaving at least one rest day between workouts makes recovery easier. Monday, Wednesday and Friday is a classic pattern, but any three days that fit your life will do.',
      ] },
      { heading: 'Three details that make it work', paragraphs: [
        'Post it where you look every day: the fridge, a mirror or your desk. Write your three training days in the boxes at the start of each week; deciding once is easier than deciding every day.',
        'Tick the box right after you finish. Seeing the chain grow makes the next session easier to start, and a missed box does not break the challenge; it just reminds you to plan the rest of the week.',
      ] },
      { heading: 'Paper or app? Both', paragraphs: [
        'The paper calendar reminds you; the app tells you what to do. When you join the 28-day challenge in Full Balance, each workout is ready, and your challenge progress updates as you check off sets in workout mode. Keep the calendar on the fridge and open the workout on your phone.',
      ] },
    ], sources: [whoActivity, ['ACSM resistance training guidance (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/']],
    internalLinks: [['/en/28-day-challenge', '28-day challenge'], ['/en/home-dumbbell-workout-plan', 'Home dumbbell plan']],
    cta: { href: '/en/28-day-challenge', label: 'Join the free challenge', title: 'Have every workout ready', description: '12 workouts in 28 days: your plan, set tracking and progress card in the app.' },
  },
  {
    ...training, language: 'es', translationKey: 'challenge-calendar', slug: 'calendario-reto-28-dias-imprimible',
    title: 'Calendario Imprimible del Reto de 28 Días: Imprime, Pega y Marca',
    description: 'Calendario de entrenamiento de 28 días gratis para imprimir: 4 semanas, 3 entrenos por semana, 12 casillas. Por qué funciona un calendario en papel y cómo usarlo.',
    category: 'Entrenamiento', readTime: '4 min',
    imageAlt: 'Ilustración de un diario de entrenamiento con un calendario de cuatro semanas y días marcados',
    intro: 'Los hábitos nuevos suelen fallar porque se olvidan, no por falta de motivación. Un calendario en un lugar visible, con una casilla que marcas después de cada entreno, es sencillo y sorprendentemente eficaz. Imprime gratis el calendario de 28 días.',
    sections: [
      { heading: 'Abre e imprime el calendario', paragraphs: [
        'Cabe en una hoja A4: 4 semanas, 3 casillas de entreno por semana y líneas para notas. Abre la página y pulsa el botón de imprimir o elige "Guardar como PDF" en tu navegador.',
      ], download: { href: PRINTABLE_CALENDARS.es, label: 'Abrir el calendario imprimible' } },
      { heading: 'Las reglas: 12 entrenos en 28 días', paragraphs: [
        'El objetivo es entrenar 3 veces por semana, 12 en total. Cada sesión puede durar 20-45 minutos; lo que cuenta es hacerla. Si fallas un día, muévelo a otro día de esa semana. Tres días por semana cubren además la recomendación de la Organización Mundial de la Salud de fortalecer los músculos al menos 2 días por semana.',
        'Dejar al menos un día de descanso entre entrenos facilita la recuperación. Lunes, miércoles y viernes es la opción clásica, pero sirve cualquier combinación de tres días que encaje en tu vida.',
      ] },
      { heading: 'Tres detalles que lo hacen funcionar', paragraphs: [
        'Pégalo donde mires cada día: la nevera, el espejo o tu mesa. Escribe tus tres días al empezar cada semana; decidir una vez es más fácil que decidir cada día.',
        'Marca la casilla nada más terminar. Ver crecer la cadena hace más fácil empezar la siguiente sesión, y una casilla vacía no rompe el reto: solo te recuerda planificar el resto de la semana.',
      ] },
      { heading: '¿Papel o app? Los dos', paragraphs: [
        'El calendario en papel te lo recuerda; la app te dice qué hacer. Al unirte al reto de 28 días en Full Balance, cada entreno está listo y tu progreso se actualiza al marcar series en el modo entrenamiento.',
      ] },
    ], sources: [whoActivity, ['ACSM resistance training guidance (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/']],
    internalLinks: [['/es/reto-28-dias', 'Reto de 28 días'], ['/es/entrenamiento-en-casa-con-mancuernas', 'Entrenamiento en casa con mancuernas']],
    cta: { href: '/es/reto-28-dias', label: 'Únete gratis al reto', title: 'Ten cada entreno listo', description: '12 entrenos en 28 días: tu plan, el registro de series y tu progreso en la app.' },
  },
  {
    ...training, language: 'tr', translationKey: 'spot-reduction', slug: 'bolgesel-yag-yakimi-mumkun-mu',
    title: 'Bölgesel Yağ Yakımı Mümkün mü? Mekik Göbek Eritir mi, Araştırmalar Ne Diyor',
    description: 'Mekik çekmek göbek yağını, bacak çalışmak bacak yağını eritir mi? İki kontrollü çalışmanın sonuçları, neden böyle olduğu ve gerçekten işe yarayan yaklaşım.',
    category: 'Antrenman', readTime: '5 dk',
    imageAlt: 'Antrenman günlüğü çizimi: tüm vücut hareketleri ve haftalık antrenman kayıtları',
    intro: 'Kısa cevap: hayır, belirli bir bölgeyi çalıştırarak sadece oradaki yağı yakamazsın. Mekik karın kaslarını güçlendirir ama göbek yağını diğer bölgelerden daha hızlı azaltmaz. Bu yazıda bunu test eden iki kontrollü çalışmaya ve bunun yerine ne yapılması gerektiğine bakıyoruz.',
    sections: [
      { heading: 'Mekik çalışması: 6 hafta, karın yağında fark yok', paragraphs: [
        '2011\'de yayımlanan kontrollü bir çalışmada katılımcılar 6 hafta boyunca haftada 5 gün karın egzersizi yaptı; kontrol grubu yapmadı. İki grup da aynı şekilde beslendi. Sonunda karın egzersizi yapan grupta karın kası dayanıklılığı arttı, ancak karın yağı, bel çevresi ve deri altı yağ ölçümleri kontrol grubundan farklı değildi.',
      ] },
      { heading: 'Tek bacak çalışması: yağ diğer bölgeden azaldı', paragraphs: [
        '2013\'teki bir çalışmada katılımcılar 12 hafta boyunca yalnızca tek bacakla, çok tekrarlı leg press yaptı. Çalışılan bacağın yağ oranı anlamlı biçimde değişmedi; azalma kollarda ve gövdede görüldü. Yani yağ, kasın çalıştığı yerden değil, vücudun genelinden kullanıldı.',
      ] },
      { heading: 'Neden böyle?', paragraphs: [
        'Egzersiz sırasında kullanılan enerji, kanla tüm vücuttan taşınan yağ asitlerinden gelir; çalışan kas yalnızca hemen üstündeki yağı kullanmaz. Yağın önce hangi bölgeden azalacağını büyük ölçüde genetik, cinsiyet ve yaş belirler. Bu yüzden bazı insanlarda en son karın, bazılarında en son kalça bölgesi incelir.',
      ] },
      { heading: 'Peki ne işe yarar?', paragraphs: [
        'Toplam yağ oranını düşürmek: hafif bir kalori açığı, yeterli protein ve düzenli hareket. Dünya Sağlık Örgütü yetişkinlere haftada en az 150-300 dakika orta yoğunlukta aerobik aktivite ve haftada en az 2 gün kas güçlendirme öneriyor. Tüm vücut kuvvet antrenmanı, kilo verirken kas kaybını azaltmaya da yardımcı olur.',
        'Karın egzersizleri boşuna değil: gövde gücü, postür ve günlük hareketler için değerlidir. Sadece göbek yağını eritmek için doğru araç değildir. Haftada 3 tüm vücut antrenmanı ve günlük yürüyüş, yüzlerce mekikten daha çok sonuç verir.',
      ] },
    ], sources: spotSources,
    internalLinks: [['/yag-yakimi-programi', 'Yağ yakımı programı'], ['/28-gunluk-challenge', '28 günlük challenge'], ['/blog/turk-yemekleri-kalori-tablosu', 'Türk yemeklerinin kalorisi']],
    cta: { href: '/yag-yakimi-programi', label: 'Yağ yakımı programını gör', title: 'Tüm vücutla çalış', description: 'Hedefine ve ekipmanına göre ücretsiz kişisel antrenman ve beslenme planı.' },
  },
  {
    ...training, language: 'en', translationKey: 'spot-reduction', slug: 'can-you-spot-reduce-fat',
    title: 'Can You Spot-Reduce Fat? What Two Controlled Studies Found',
    description: 'Do crunches burn belly fat, or leg exercises leg fat? The results of two controlled studies, why fat loss is not local, and the approach that actually works.',
    category: 'Training', readTime: '5 min',
    imageAlt: 'Workout journal illustration with full-body exercises and weekly training records',
    intro: 'Short answer: no. Training one area does not burn the fat on that area. Crunches strengthen your abs but do not shrink belly fat faster than fat elsewhere. Here is what two controlled studies found, and what to do instead.',
    sections: [
      { heading: 'Ab training: 6 weeks, no change in belly fat', paragraphs: [
        'In a 2011 controlled trial, participants did abdominal exercises 5 days a week for 6 weeks while a control group did not; both kept the same diet. The exercise group improved abdominal endurance, but abdominal fat, waist circumference and skinfold measurements did not differ from the control group.',
      ] },
      { heading: 'One-leg training: fat dropped elsewhere', paragraphs: [
        'In a 2013 study, participants trained only one leg with high-repetition leg presses for 12 weeks. Fat in the trained leg did not change significantly; the reduction showed up in the arms and trunk. Fat was drawn from the body as a whole, not from the working muscle.',
      ] },
      { heading: 'Why it works this way', paragraphs: [
        'Energy for exercise comes from fatty acids carried in the blood from fat stores all over the body; a working muscle does not just use the fat lying over it. Where you lose fat first is largely set by genetics, sex and age, which is why some people lose belly fat last and others lose it from the hips last.',
      ] },
      { heading: 'What does work', paragraphs: [
        'Lowering overall body fat: a modest calorie deficit, enough protein and regular movement. The WHO recommends 150-300 minutes of moderate aerobic activity a week plus muscle-strengthening on at least 2 days for adults. Full-body strength training also helps limit muscle loss while you lose weight.',
        'Ab exercises are not useless: they build core strength and help posture and daily movement. They are just not the tool for burning belly fat. Three full-body workouts a week and a daily walk will do more than hundreds of crunches.',
      ] },
    ], sources: spotSources,
    internalLinks: [['/en/28-day-challenge', '28-day challenge'], ['/en/home-workout-no-equipment', 'Free home workout plan'], ['/en/blog/turkish-food-calories', 'Turkish food calories']],
    cta: { href: '/en/28-day-challenge', label: 'Start the 28-day challenge', title: 'Train the whole body', description: 'A free personal plan for your goal and equipment, with 12 workouts in 28 days to start.' },
  },
  {
    ...training, language: 'es', translationKey: 'spot-reduction', slug: 'grasa-localizada-se-puede-quemar',
    title: '¿Se Puede Quemar Grasa Localizada? Lo que Dicen Dos Estudios Controlados',
    description: '¿Los abdominales queman la grasa de la barriga? ¿Entrenar piernas adelgaza las piernas? Resultados de dos estudios controlados, por qué la grasa no se pierde por zonas y qué funciona.',
    category: 'Entrenamiento', readTime: '5 min',
    imageAlt: 'Ilustración de un diario de entrenamiento con ejercicios de cuerpo completo y registros semanales',
    intro: 'Respuesta corta: no. Entrenar una zona no quema la grasa de esa zona. Los abdominales fortalecen el core, pero no reducen la grasa abdominal más rápido que la del resto del cuerpo. Veamos qué encontraron dos estudios controlados y qué hacer en su lugar.',
    sections: [
      { heading: 'Abdominales: 6 semanas, sin cambio en la grasa abdominal', paragraphs: [
        'En un ensayo controlado de 2011, un grupo hizo ejercicios abdominales 5 días por semana durante 6 semanas y otro grupo no; ambos mantuvieron la misma dieta. El grupo de ejercicio mejoró la resistencia abdominal, pero la grasa abdominal, el perímetro de cintura y los pliegues cutáneos no fueron distintos de los del grupo control.',
      ] },
      { heading: 'Entrenar una sola pierna: la grasa bajó en otra zona', paragraphs: [
        'En un estudio de 2013, los participantes entrenaron solo una pierna con prensa de muchas repeticiones durante 12 semanas. La grasa de la pierna entrenada no cambió de forma significativa; la reducción apareció en los brazos y el tronco.',
      ] },
      { heading: 'Por qué ocurre', paragraphs: [
        'La energía del ejercicio procede de ácidos grasos que la sangre transporta desde los depósitos de todo el cuerpo; el músculo que trabaja no usa solo la grasa que tiene encima. Dónde se pierde grasa primero depende sobre todo de la genética, el sexo y la edad.',
      ] },
      { heading: 'Lo que sí funciona', paragraphs: [
        'Reducir la grasa total: un déficit calórico moderado, suficiente proteína y movimiento regular. La OMS recomienda a los adultos 150-300 minutos semanales de actividad aeróbica moderada y fortalecimiento muscular al menos 2 días por semana. El entrenamiento de fuerza de cuerpo completo ayuda además a conservar músculo mientras pierdes peso.',
        'Los abdominales no son inútiles: fortalecen el core y ayudan a la postura. Simplemente no son la herramienta para quemar la grasa de la barriga. Tres entrenos de cuerpo completo por semana y una caminata diaria hacen más que cientos de abdominales.',
      ] },
    ], sources: spotSources,
    internalLinks: [['/es/reto-28-dias', 'Reto de 28 días'], ['/es/entrenamiento-en-casa-con-mancuernas', 'Entrenamiento en casa con mancuernas'], ['/es/blog/calorias-comida-espanola', 'Calorías de la comida española']],
    cta: { href: '/es/reto-28-dias', label: 'Empieza el reto de 28 días', title: 'Entrena todo el cuerpo', description: 'Un plan personal gratis según tu objetivo y tu equipo, con 12 entrenos en 28 días para empezar.' },
  },
];
