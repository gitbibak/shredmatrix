const nutritionSources = [
  ['Meal photograph nutrient estimation study (2025)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11858203/'],
  ['Calorie estimation from food pictures: crowdsourcing study (2018)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6246963/'],
];
const trainingSources = [
  ['ACSM resistance training guidance (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/'],
  ['WHO: Physical activity', 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'],
];
const defaults = { publishedAt: '2026-10-10', updatedAt: '2026-10-10', accent: '#10b981' };
const homeStrengthSources = [
  ['ACSM resistance training guidance (2026)', 'https://acsm.org/resistance-training-guidelines-update-2026/'],
  ['Elastic vs conventional resistance training: meta-analysis (2019)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6383082/'],
  ['Low- vs high-load resistance training: meta-analysis (2017)', 'https://pubmed.ncbi.nlm.nih.gov/28834797/'],
];
const homeDefaults = { publishedAt: '2026-10-20', updatedAt: '2026-10-20', accent: '#38bdf8' };

export const growthBlogArticles = [
  {
    ...homeDefaults, language: 'tr', slug: 'tek-dambil-ile-evde-antrenman-programi',
    title: 'Tek Dambılla Evde Antrenman Programı: Haftada 3 Gün Tüm Vücut',
    description: 'Sadece bir dambılın varsa evde tüm vücut programını nasıl uygularsın? Hareket hareket tek dambıl karşılıkları, set ve tekrar düzeni ve ne zaman ağırlık artırılır.',
    category: 'Antrenman', readTime: '6 dk', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Tek dambılla yapılan squat, row ve press hareketlerinin set ve tekrar kayıtlarını gösteren antrenman günlüğü',
    intro: 'Tek bir dambıl, evde tüm vücut antrenmanı için sanıldığından çok daha fazlasını yapar. Goblet squat, tek kol row ve tek kol press zaten tek dambılla yapılan hareketlerdir; iki dambıl isteyen hareketleri ise iki tarafı sırayla çalıştırarak uyarlayabilirsin. Bu rehber, evde dambıl sayfasındaki gerçek başlangıç haftasını tek dambıla çevirir.',
    sections: [
      { heading: 'Örnek haftanın tek dambıllı hâli', paragraphs: [
        'Pazartesi (Tam Vücut A): Goblet squat 2 × 10-14, tek kol dambıl floor press 2 × 10-14/taraf, tek kol dambıl row 2 × 8-12/taraf, dambılı iki elle uyluk önünde dikey tutarak Romanian deadlift 2 × 10-14, dead bug 2 × 8/taraf. Çarşamba (Tam Vücut B): goblet reverse lunge 2 × 8-12/taraf, şınav 2 × 10-17, direnç bandı row 2 × 12-17 (bant yoksa tek kol row), dambıl kalçada glute bridge 2 × 12-17, side plank 2 × 20-35 sn/taraf.',
        'Cuma (Tam Vücut C): goblet split squat 2 × 8-12/taraf, tek kol omuz press 2 × 10-14/taraf, tek bacak Romanian deadlift (dambıl çalışan bacağın karşı elinde) 2 × 8-12/taraf, bant pull-apart 2 × 14-22, suitcase march 2 × 30-45 sn/taraf. Aradaki günler dinlenme veya 20-30 dakika rahat yürüyüştür.',
      ] },
      { heading: 'Tek dambılla neden işe yarar?', paragraphs: [
        'Kasın gelişmesi için tek başına yükün büyüklüğü değil, setlerin yeterince zorlayıcı olması gerekir. Hafif ve ağır yüklerin karşılaştırıldığı bir meta-analizde, setler zorlanmaya yakın bitirildiğinde kas büyümesi benzer bulunmuştur; maksimum kuvvet ise ağır yükle daha fazla artmıştır. Yani tek ve görece hafif bir dambılla da kas gelişimi mümkündür; kuvvet hedefi için zamanla daha ağır yük gerekir.',
        'Tek taraflı hareketlerin bir artısı da var: her taraf ayrı çalıştığı için güçlü taraf zayıf tarafı telafi edemez ve gövde dengeyi korumak için daha çok çalışır. Suitcase march ve tek kol row bu yüzden core için de iyi hareketlerdir.',
      ] },
      { heading: 'Ağırlık sabitken nasıl ilerlenir?', paragraphs: [
        'Önce tekrarı artır: tüm setlerde aralığın üst sınırına kontrollü ulaştıysan bir sonraki haftada bir set ekle. Ardından tempoyu yavaşlat (3 saniyede in, 1 saniye bekle) veya hareketi tek taraflı hâle getir: squat yerine split squat, deadlift yerine tek bacak deadlift. Bu adımlar sabit ağırlıkla haftalarca ilerleme sağlar.',
        'Hepsi kolay gelmeye başladığında daha ağır bir dambıl ya da ayarlanabilir dambıl düşünmenin zamanı gelmiştir. Bacak hareketleri genellikle üst vücuttan daha önce bu noktaya gelir.',
      ] },
      { heading: 'Hangi ağırlıkta tek dambıl almalı?', paragraphs: [
        'Tek dambıl hem bacak hem üst vücut hareketlerinde kullanılacağı için orta bir ağırlık seç: tek kol row ve goblet squat için zorlayıcı, omuz press için hâlâ kontrollü olan yük. Yeni başlayanlar için bu genellikle 6-10 kg aralığıdır; ayarlanabilir dambıl farklı hareketlere farklı yük vermeyi kolaylaştırır. Ağırlık seçimi rehberindeki adımlarla kontrol et.',
      ] },
      { heading: 'Programı telefonda takip et', paragraphs: [
        'Full Balance içinde ekipmanı "evde temel ekipman" seçerek kişisel planını oluşturabilirsin. Antrenman modunda her seti kullandığın kilo ve tekrarla işaretler, dinlenme sayacıyla ilerlersin; bir sonraki seansta önceki kilon hazır gelir. Ağrı veya hareketi kısıtlayan bir durum varsa yükü bir sağlık uzmanıyla değerlendir.',
      ] },
    ], sources: homeStrengthSources,
    internalLinks: [['/evde-dambil-antrenman-programi', '30 günlük evde dambıl programı'], ['/blog/evde-dambil-agirligi-secimi-artirma', 'Dambıl ağırlığı seçimi'], ['/direnc-bandi-antrenman-programi', 'Direnç bandı programı']],
    cta: { href: '/evde-dambil-antrenman-programi', label: 'Örnek haftayı incele', title: 'Tek dambılla başla', description: 'Gerçek başlangıç haftasını ve 30 günlük ilerleme tablosunu gör, ardından ücretsiz planını oluştur.' },
  },
  {
    ...homeDefaults, language: 'tr', slug: 'direnc-bandi-mi-dambil-mi',
    title: 'Direnç Bandı mı Dambıl mı? Evde Hangisi Daha İyi, Nasıl Seçilir',
    description: 'Evde kuvvet ve kas için direnç bandı mı dambıl mı almalısın? Araştırmalar ne diyor, hangi hareketlerde hangisi daha iyi ve ikisi birlikte nasıl kullanılır.',
    category: 'Antrenman', readTime: '6 dk', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Direnç bandı ve dambıl ile yapılan hareketlerin yük ve tekrar kayıtlarını karşılaştıran antrenman günlüğü',
    intro: 'Kısa cevap: kuvvet kazanımı açısından ikisi de işe yarar. Asıl fark, hangi hareketlerde hangisinin daha kullanışlı olduğu, ilerlemenin nasıl ölçüleceği ve evdeki alan. Çoğu kişi için en iyi seçenek bir çift dambıl ve bir direnç bandıdır.',
    sections: [
      { heading: 'Araştırmalar ne diyor?', paragraphs: [
        'Elastik bant ve tüp ile yapılan antrenmanı dambıl ve makinelerle karşılaştıran bir meta-analiz, üst ve alt vücut kuvvet artışında iki yöntem arasında anlamlı bir fark bulmamıştır. Yani doğru seviyede zorlayan bir bant programı, kuvvet için dambıl programına yakın sonuç verebilir.',
        'Fark araçta değil uygulamada ortaya çıkar: setleri yeterince zorlayıcı yapmak ve haftadan haftaya biraz artırmak. Bunu ölçmek dambılla daha kolaydır, çünkü yük bir sayıdır; bantta ise direnç, bandın ne kadar gerildiğine bağlıdır.',
      ] },
      { heading: 'Dambılın üstün olduğu yerler', paragraphs: [
        'Squat, Romanian deadlift, lunge, omuz press ve floor press gibi hareketlerde dambıl hareketin başından sonuna aynı yükü verir ve ilerlemeyi kilo olarak kaydetmeni sağlar. Bacak hareketlerinde bantla yeterli direnç oluşturmak zordur; burada dambıl belirgin şekilde daha pratiktir.',
      ] },
      { heading: 'Bandın üstün olduğu yerler', paragraphs: [
        'Çekiş hareketleri (row, pull-apart, lat çekişi), omzun arka kısmı ve kalça yan kasları için bant çok kullanışlıdır; kapı ankrajıyla evde kablo makinesine yakın hareketler yapılabilir. Bant hafif, ucuz ve yolculukta taşınabilir; ısınma ve rehabilitasyon hareketlerinde de sık kullanılır.',
        'Bantta direnç hareketin sonunda artar. Bu, hareketin en güçlü olduğun kısmında yükü artırdığı için bazı hareketlere uyar, bazılarında ise başlangıcı fazla hafif bırakır.',
      ] },
      { heading: 'Bütçeye göre öneri', paragraphs: [
        'Sadece birini alacaksan ve bacak çalışmak istiyorsan dambıl (tercihen ayarlanabilir) al. Alanın ve bütçen çok kısıtlıysa veya çoğunlukla üst vücut ve postür çalışacaksan farklı dirençte bir bant seti yeterlidir. İkisi birlikte en esnek kombinasyondur: dambıl itiş ve bacak, bant çekiş ve omuz için.',
        'Full Balance ev programları bu mantıkla kuruludur: dambıl temel hareketleri, bant ise row ve pull-apart gibi çekiş hareketlerini taşır.',
      ] },
      { heading: 'İlerlemeyi nasıl takip edersin?', paragraphs: [
        'Dambılda kilo ve tekrarı yaz. Bantta bandın rengini veya direncini, ankraj noktasına uzaklığını ve tekrarı aynı biçimde kaydet; bu üçü değişmezse karşılaştırma yapabilirsin. Antrenman modunda her setin değerini girip bir sonraki seansta önceki değerini görebilirsin.',
      ] },
    ], sources: homeStrengthSources,
    internalLinks: [['/evde-dambil-antrenman-programi', 'Evde dambıl programı'], ['/direnc-bandi-antrenman-programi', 'Direnç bandı programı'], ['/blog/tek-dambil-ile-evde-antrenman-programi', 'Tek dambılla program']],
    cta: { href: '/direnc-bandi-antrenman-programi', label: 'Bant programını incele', title: 'Ekipmanına göre plan', description: 'Dambıl, bant ya da ikisi: seçtiğin ekipmanla ücretsiz kişisel planını oluştur.' },
  },
  {
    ...homeDefaults, language: 'tr', slug: 'evde-kas-yapilir-mi',
    title: 'Evde Kas Yapılır mı? 8 Haftada Ne Beklemeli, Nasıl Yapılır',
    description: 'Evde kas geliştirmek mümkün mü? Kas gelişimi için gereken üç şart, ekipmansız ve dambıllı seçenekler, ilk 8 haftada gerçekçi beklentiler ve sık yapılan hatalar.',
    category: 'Antrenman', readTime: '7 dk', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Evde yapılan şınav, squat ve dambıl hareketlerinin haftalık tekrar ve yük artışını gösteren antrenman günlüğü',
    intro: 'Evet, evde kas yapılır. Kas, yükün nereden geldiğini değil, ne kadar zorlandığını ve bunun haftalar boyunca artıp artmadığını tanır. Evde bunu sağlamak salona göre biraz daha planlama ister; ama yeni başlayanlar için ilk aylarda fark sanıldığından küçüktür.',
    sections: [
      { heading: 'Kas gelişimi için üç şart', paragraphs: [
        'Birincisi yeterli zorluk: setleri, bitirdiğinde birkaç tekrar daha yapabilecek kadar ama çok fazlası değil şekilde bitirmek. İkincisi haftalık hacim: her büyük kas grubuna haftada birkaç gün düzenli set. Üçüncüsü ilerleme: tekrar, set, tempo veya yükün haftadan haftaya biraz artması. Bunlara yeterli protein ve uyku eşlik etmeli.',
        'Hafif ve ağır yükleri karşılaştıran bir meta-analizde, setler zorlanmaya yakın bitirildiğinde kas büyümesi benzer bulunmuştur. Evde ağır yük olmaması bu yüzden kas gelişimini engellemez; asıl risk setleri fazla kolay bitirmektir.',
      ] },
      { heading: 'Ekipmansız mı, dambıllı mı?', paragraphs: [
        'Ekipmansız: şınav varyasyonları, squat ve split squat, kalça köprüsü, masa altı çekiş ve plank ile başlangıç için yeterli zorluk sağlanır. Sınır, bacak ve sırt hareketlerinde zamanla yeterli direnç bulmaktır; tek taraflı varyasyonlar ve yavaş tempo bunu uzatır.',
        'Dambıllı: bir çift dambıl bacak, kalça ve sırt için ilerlemeyi çok kolaylaştırır, çünkü yükü kilo olarak artırabilirsin. Kas hedefin ciddiyse ve yerin varsa ayarlanabilir dambıl en verimli tek ekipmandır.',
      ] },
      { heading: 'İlk 8 haftada ne beklemeli?', paragraphs: [
        'İlk 2-4 hafta: kuvvet hızlı artar, ama bunun çoğu sinir sisteminin hareketi öğrenmesidir. Aynı hareketlerde tekrar sayın belirgin şekilde artar. 4-8. haftalar: düzenli antrenman ve yeterli proteinle kas büyümesi başlar; aynada fark çoğu kişide 8-12 haftada belirginleşir. Değişim kişiden kişiye, beslenmeye ve başlangıç seviyesine göre değişir.',
        'Ölçüm için aynada değil kayıtlarda bak: aynı hareketteki tekrar ve yük artıyorsa doğru yoldasın. Kilo ve bel çevresini haftada bir aynı koşullarda ölç.',
      ] },
      { heading: 'Sık yapılan hatalar', paragraphs: [
        'Her gün aynı bölgeyi çalışmak (toparlanma olmadan gelişim olmaz), her antrenmanda farklı rastgele video izlemek (ilerleme ölçülemez), setleri çok kolay bitirmek ve proteini ihmal etmek en yaygın hatalardır. Düzenli bir program, kayıt tutmak ve haftada 3-4 antrenman bu hataların çoğunu çözer.',
      ] },
      { heading: 'Nereden başlamalı?', paragraphs: [
        'Ekipmanın yoksa evde kas geliştirme hareketleri sayfasındaki 12 hareketle, dambılın varsa 30 günlük evde dambıl programıyla başla. Full Balance kişisel planında seviyene göre set ve tekrar verir, antrenman modunda her seti kaydeder ve protein ile kalori hedefini aynı yerde gösterir.',
      ] },
    ], sources: homeStrengthSources,
    internalLinks: [['/evde-kas-gelistirme-hareketleri', 'Evde kas geliştirme hareketleri'], ['/evde-dambil-antrenman-programi', '30 günlük evde dambıl programı'], ['/blog/direnc-bandi-mi-dambil-mi', 'Direnç bandı mı dambıl mı']],
    cta: { href: '/evde-kas-gelistirme-hareketleri', label: 'Hareketleri incele', title: 'Evde kas programına başla', description: 'Seviyene göre hareket, set ve tekrarları gör; ücretsiz kişisel planını oluştur.' },
  },
  {
    ...defaults, language: 'en', translationKey: 'photo-accuracy', slug: 'how-accurate-photo-calorie-counter',
    title: 'How Accurate Is a Photo Calorie Counter? Portions, Oils and Corrections',
    description: 'Learn why calorie estimates from food photos vary with portions, cooking oil and sauces, and how to review an estimate before using it.',
    category: 'Nutrition', readTime: '5 min', image: '/images/blog/meal-review.svg',
    imageAlt: 'Illustrated plate with separate food, portion and hidden ingredient review steps',
    intro: 'A food photo can help identify a meal, but it cannot reveal every ingredient or reliably measure its weight. Treat the result as an estimate to review: check the foods, correct the portions and add cooking oil, sauces or drinks the image may miss.',
    sections: [
      { heading: 'Why the same plate can produce different estimates', paragraphs: [
        'A photograph shows a surface. A deep bowl may contain more food than a shallow plate with a similar outline. Sauce can hide ingredients, while oil absorbed during cooking may leave little visible evidence. Food identity matters too: cooked rice and dry rice are different entries, as are chicken breast and a mixed chicken dish.',
        'The useful next step is reviewing the assumptions. A precise-looking number is not proof of a precise measurement. Retake an unclear image if necessary, but remember that even a sharper image cannot reveal an unknown recipe.',
      ] },
      { heading: 'Review the estimate in four steps', paragraphs: [
        'First, check the listed foods. Replace an incorrect match and add items outside the frame. Second, check portions: use a known weight when available and keep cooked or dry weights consistent with the entry. Third, add preparation details such as dressing, fillings and cooking oil. For a shared recipe, consider your portion rather than adding the entire pan to one plate.',
        'Finally, retain uncertainty where information is missing. If a restaurant recipe is unknown, changing the result until it looks reassuring does not improve it. A food label, recipe or weighed portion may provide information that the camera cannot.',
      ] },
      { heading: 'An illustrative rice, chicken and salad example', paragraphs: [
        'Imagine a meal containing rice, chicken and salad. Ask: is the rice entry cooked, how was the chicken prepared, and is the salad dressed? Review the estimated amounts, then add oil or sauce you know was used. This is an example workflow, not a measured Full Balance result or an accuracy benchmark; we deliberately do not invent a calorie total.',
        'If you repeat the meal, a recipe note can make later reviews easier. Record enough context to understand the estimate without turning every meal into a complicated research project.',
      ] },
      { heading: 'What research does and does not establish', paragraphs: [
        'Food-photo studies describe limitations in identifying portions and preparation details. Their methods and models differ. A study of another system cannot establish Full Balance’s accuracy; our tool would need its own documented benchmark before we could publish a performance percentage.',
        'Use a photo estimate as a practical starting point. If you need an individual clinical nutrition plan, use guidance from a qualified professional rather than treating a photo result as that plan.',
      ] },
      { heading: 'Try the free tool before creating an account', paragraphs: [
        'Open the photo calorie counter, choose or take a meal photo, then review the foods and portions. It runs in your browser and requires no sign-up. Account creation is a separate, optional step for a personal plan and progress tracking.',
      ] },
    ], sources: nutritionSources,
    internalLinks: [['/en/photo-calorie-counter', 'Free photo calorie counter'], ['/en/calorie-macro-calculator', 'Daily calorie and macro calculator']],
    cta: { href: '/en/photo-calorie-counter', label: 'Try the free photo tool', title: 'Review your meal estimate', description: 'Check foods and portions in your browser. No sign-up needed.' },
  },
  {
    ...defaults, language: 'es', translationKey: 'photo-accuracy', slug: 'precision-calorias-foto-porciones-aceite',
    title: '¿Qué Precisión Tiene Contar Calorías con una Foto? Porciones, Aceite y Correcciones',
    description: 'Aprende por qué una estimación de calorías cambia con las porciones, el aceite y las salsas, y cómo revisar una foto de comida antes de usar el resultado.',
    category: 'Nutrición', readTime: '5 min', image: '/images/blog/meal-review.svg',
    imageAlt: 'Plato ilustrado con pasos separados para revisar alimentos, porciones e ingredientes ocultos',
    intro: 'Una foto puede ayudar a identificar una comida, pero no muestra todos los ingredientes ni mide su peso de forma fiable. Revisa los alimentos y las porciones, y añade el aceite, las salsas o las bebidas que la imagen no permite reconocer.',
    sections: [
      { heading: 'Por qué el mismo plato puede dar estimaciones diferentes', paragraphs: [
        'Una fotografía muestra una superficie. Un recipiente profundo puede contener más comida que un plato poco profundo con un contorno parecido. Una salsa puede ocultar ingredientes y el aceite usado al cocinar puede dejar pocas señales visibles. También importa la selección: el arroz cocido y el arroz seco no son la misma entrada.',
        'El siguiente paso útil es revisar las suposiciones. Una cifra con muchos detalles no demuestra una medición exacta. Si la imagen no es clara, puedes repetirla; una imagen más nítida tampoco revela una receta desconocida.',
      ] },
      { heading: 'Cuatro pasos para revisar el resultado', paragraphs: [
        'Primero, comprueba los alimentos y corrige las coincidencias incorrectas. Segundo, revisa las cantidades y usa un peso conocido cuando lo tengas; mantén coherencia entre peso cocido o seco y la entrada. Tercero, añade preparación, aceite, rellenos y salsas. En una receta compartida, cuenta tu parte y no todo el aceite de la sartén.',
        'Por último, conserva la incertidumbre cuando falta información. Ajustar el número hasta que parezca conveniente no mejora la estimación. La etiqueta, la receta o una porción pesada pueden aportar información que no aparece en la foto.',
      ] },
      { heading: 'Ejemplo ilustrativo: arroz, pollo y ensalada', paragraphs: [
        'Imagina una foto de arroz, pollo y ensalada. ¿La entrada del arroz es cocida? ¿Cómo se preparó el pollo? ¿La ensalada tiene aliño? Revisa las cantidades y añade el aceite o la salsa que conoces. Es un ejemplo de revisión, no un resultado medido de Full Balance ni una prueba de precisión; no inventamos un total de calorías.',
        'Si repites la comida, una nota de la receta puede facilitar revisiones futuras. Guarda el contexto suficiente para comprender el resultado sin convertir cada comida en un proyecto complicado.',
      ] },
      { heading: 'Qué demuestra la investigación y qué no', paragraphs: [
        'Los estudios de fotografías describen limitaciones en las porciones y en los detalles de preparación. Los métodos y modelos son diferentes: un estudio de otro sistema no demuestra la precisión de Full Balance. Haría falta una evaluación documentada de nuestra propia herramienta para publicar un porcentaje.',
        'La estimación es un punto de partida práctico. Para un plan clínico individual de nutrición, consulta a un profesional cualificado en lugar de interpretar el resultado de la foto como ese plan.',
      ] },
      { heading: 'Prueba la herramienta antes de crear una cuenta', paragraphs: [
        'Abre el contador, toma o elige una foto y revisa alimentos y porciones. Funciona gratis en el navegador sin registrarte. La cuenta es un paso separado y opcional para un plan personal y el seguimiento del progreso.',
      ] },
    ], sources: nutritionSources,
    internalLinks: [['/es/contar-calorias-con-foto', 'Contador de calorías con foto gratis'], ['/es/calculadora-calorias-macros', 'Calculadora de calorías y macros']],
    cta: { href: '/es/contar-calorias-con-foto', label: 'Probar la herramienta gratis', title: 'Revisa tu estimación', description: 'Corrige alimentos y porciones en tu navegador, sin registrarte.' },
  },
  {
    ...defaults, language: 'tr', slug: 'evde-dambil-agirligi-secimi-artirma',
    title: 'Evde Dambıl Ağırlığı Nasıl Seçilir, Ne Zaman Artırılır?',
    description: 'Evde dambıl başlangıç yükünü hareketine göre seç, tekrarlarını kaydet ve ağırlığı artırmadan önce teknik ile ilerleme işaretlerini kontrol et.',
    category: 'Antrenman', readTime: '5 dk', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Dambıl ve aynı hareketin yük, tekrar ve dinlenme kayıtlarını temsil eden antrenman günlüğü',
    intro: 'Başlangıç yükünü yalnızca dambılın üzerindeki sayıya göre seçme. Aynı ağırlık bir hareket için hafif, başka bir hareket için ağır olabilir. Programdaki tekrarları kontrollü biçimde tamamlayabildiğin yükten başla; sonraki kararını kayıtlarına göre ver.',
    sections: [
      { heading: 'Bir hareketin yükünü diğerine kopyalama', paragraphs: [
        'Bacak, çekiş ve omuz hareketleri aynı yükü gerektirmez. Hareket yeniyse önce nasıl uygulandığını öğren. Dambılı savurmak, hareket aralığını istemeden daraltmak veya dengeyi kaybetmek yükü yeniden değerlendirmek için işarettir. Keskin ağrıya rağmen tekrar tamamlamaya çalışma.',
        'Programın tekrar aralığını ve hareket talimatını birlikte incele. Bir başkasının kullandığı ağırlık senin başlangıç noktanı belirlemez; ekipman, deneyim ve o günkü durum farklı olabilir.',
      ] },
      { heading: 'Karşılaştırılabilir bir kayıt tut', paragraphs: [
        'Hareket adı, kullanılan yük, set başına tamamlanan tekrar ve yaklaşık dinlenmeyi yaz. Yükü tek dambıl veya toplam yük olarak kaydediyorsan aynı biçimi koru. Hareket varyasyonu değiştiğinde bunu da not et; iki farklı hareketin sayısını doğrudan karşılaştırma.',
        'Örnek günlük alanları: tarih / hareket / tek dambıl yükü / set tekrarları / dinlenme / kısa teknik notu. Bu bir kayıt şablonudur; herkes için aynı artırma eşiğini belirleyen bir reçete değildir.',
      ] },
      { heading: 'Ne zaman artırmayı düşünmelisin?', paragraphs: [
        'Programın tekrar aralığını aynı hareket biçimiyle tekrarlayabildiğinde ve mevcut yük giderek daha kolay geldiğinde küçük bir artışı değerlendirebilirsin. Yeni yükle kontrol bozuluyorsa geri dön. Her antrenmanda artırmak zorunda değilsin; uyku, yorgunluk ve hareketin öğrenilmesi de günü etkiler.',
        'Bir anda hem yükü hem seti hem sıklığı artırmak hangi değişikliğin etkili olduğunu görmeyi zorlaştırır. Tek bir değişikliği izle; toparlanma veya günlük işlev olumsuz etkilenirse planı yeniden değerlendir.',
      ] },
      { heading: 'Dambılların sabitse ne yapabilirsin?', paragraphs: [
        'Önce programın tekrar aralığı, hareket kalitesi ve düzenli uygulamaya odaklan. Uygun bir hareket varyasyonu düşünülebilir; yeni bir varyasyonu sırf daha zor göründüğü için seçme. Sabit ağırlık sonsuza kadar aynı gelişimi garanti etmez; hedefin ve ekipmanın zamanla başka bir plan gerektirebilir.',
        'Bu rehber yeni bir tam antrenman listesi değildir. Mevcut programdaki yük kararını daha anlaşılır hâle getirir; kişisel sağlık değerlendirmesinin yerini almaz.',
      ] },
      { heading: 'Örnek haftadan kendi planına geç', paragraphs: [
        'Evde dambıl sayfasındaki örnek haftada set, tekrar ve dinlenmenin nasıl düzenlendiğini incele. Sonra seviyeni, ekipmanını ve haftalık günlerini seçerek ücretsiz kişisel plan oluştur. Hareketi kısıtlayan yakınma veya klinik durumda yük kararını uygun sağlık uzmanıyla değerlendir.',
      ] },
    ], sources: trainingSources,
    internalLinks: [['/evde-dambil-antrenman-programi', 'Evde dambıl programı ve örnek hafta'], ['/ilerleme-takibi', 'İlerleme takibi']],
    cta: { href: '/evde-dambil-antrenman-programi', label: 'Örnek haftayı incele', title: 'Ekipmanına uygun plan', description: 'Set, tekrar ve dinlenmeyi gör; ardından ücretsiz kişisel planını oluştur.' },
  },
  {
    ...defaults, language: 'tr', slug: 'dambil-antrenman-gunlugu-ilerleme-takibi',
    title: 'Dambıl Antrenman Günlüğü Nasıl Tutulur? İlerlemeyi Karşılaştırma Rehberi',
    description: 'Hareket, yük, tekrar ve dinlenmeyi aynı biçimde kaydet; evde dambıl antrenmanında ilerlemeyi tek seans yerine karşılaştırılabilir kayıtlarla değerlendir.',
    category: 'İlerleme', readTime: '4 dk', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Hareket yükü, set tekrarları ve dinlenme için alanları olan örnek antrenman günlüğü',
    intro: 'İyi bir antrenman günlüğü uzun olmak zorunda değil. Ne yaptığını ve nasıl yaptığını yeniden anlayabilmen yeterli: aynı hareketin yükünü, set tekrarlarını, dinlenmesini ve önemli değişikliklerini tutarlı kaydet.',
    sections: [
      { heading: 'Her seans için beş alan', paragraphs: [
        'Tarih, hareket adı, kullanılan yük, set başına tekrar ve dinlenme ile başla. Yük tek dambıla mı yoksa ikisinin toplamına mı ait, belirt. Hareket varyasyonunu veya kullanılan ekipmanı değiştirirsen ayrı not düş.',
        'Bir set tamamlanmadıysa hedef tekrar yerine gerçek sayıyı yaz. Hedef ve gerçekleşen değer ayrıldığında sonraki seansı planlamak daha anlaşılır olur. Kayıt, kendini iyi gösterme yarışması değildir.',
      ] },
      { heading: 'Örnek kayıt nasıl okunur?', paragraphs: [
        'Varsayımsal örnek: aynı row varyasyonunda bir seansta 10/9/8, başka bir seansta 10/10/9 tekrar. Yük ve dinlenme aynıysa ikinci kayıt daha fazla tamamlanan tekrarı gösterir. Dinlenme veya hareket biçimi değiştiyse bu farkı yalnızca güç artışı diye adlandırma.',
        'Bu sayılar bir antrenman önerisi veya ürün sonuç testi değildir; karşılaştırma mantığını gösterir. Sonuçları başka kullanıcıların yükleriyle değil kendi benzer seanslarınla değerlendir.',
      ] },
      { heading: 'Tek kötü seans bütün eğilim değildir', paragraphs: [
        'Yoğun gün, farklı dinlenme veya kötü uyku bir seansı etkileyebilir. Birkaç karşılaştırılabilir kaydı birlikte incele. Sürekli kötüleşme, belirgin ağrı veya günlük işlev kaybında yalnızca hedef sayıyı kovalamak yerine programı değerlendir.',
        'Kayıtta her ayrıntıyı tutmak seni yoruyorsa temel alanlarla devam et. Sürdürülebilir bir günlük, birkaç gün sonra bırakılan çok ayrıntılı bir dosyadan daha kullanışlı olabilir.',
      ] },
      { heading: 'Günlüğü bir sonraki karara bağla', paragraphs: [
        'Sonraki seans öncesi hareketi, yükü ve önceki tekrarları gör. Programın talimatı içinde kal; yük, set ve sıklığı aynı anda artırma. Ağırlık seçim rehberiyle kontrol et ve gerektiğinde uzman desteği al.',
        'Full Balance ilerleme takibini kullanarak antrenman kayıtlarını bir arada inceleyebilir, evde dambıl planındaki sırayı ve dinlenmeyi takip edebilirsin. Önce örnek haftayı incelemek için hesap açman gerekmez; kişisel plan için ücretsiz kayıt olabilirsin.',
      ] },
    ], sources: trainingSources,
    internalLinks: [['/blog/evde-dambil-agirligi-secimi-artirma', 'Dambıl ağırlığı seçimi'], ['/evde-dambil-antrenman-programi', 'Evde dambıl programı'], ['/ilerleme-takibi', 'İlerleme takibi']],
    cta: { href: '/evde-dambil-antrenman-programi', label: 'Program örneğini gör', title: 'Bir sonraki seansın net olsun', description: 'Ücretsiz örnek haftada hareket, set, tekrar ve dinlenmeyi incele.' },
  },
  {
    ...defaults, language: 'en', slug: 'estimate-mixed-meal-rice-chicken-sauce',
    title: 'How to Review a Mixed Meal Estimate: Rice, Chicken, Sauce and Portions',
    description: 'Review a mixed meal photo without double counting: separate foods, keep cooked weights consistent and account for your share of oil, dressing and sauce.',
    category: 'Meal review', readTime: '4 min', image: '/images/blog/meal-review.svg',
    imageAlt: 'Illustration separating a mixed plate into foods, portion review and added ingredient checks',
    intro: 'For a mixed meal, review the ingredients and amounts separately. Check which food entries were selected, whether weights refer to cooked food, and which oil or sauce belongs to your portion. A photograph alone cannot resolve an unknown recipe.',
    sections: [
      { heading: 'Start with the meal you actually ate', paragraphs: [
        'List the visible components without forcing every dish into a single match. Rice, chicken and salad can be reviewed separately when they are separate foods. For a curry, casserole or soup, identifying every ingredient from the image may not be realistic; use the known recipe where available.',
        'Do not count both a complete dish entry and all of its ingredients unless the entry excludes those ingredients. That creates double counting. An entry for dressed salad may already include dressing; a plain salad entry may not.',
      ] },
      { heading: 'Keep portion units and preparation consistent', paragraphs: [
        'A cooked portion should be matched to a cooked-food entry when using cooked weight. If you know only a dry ingredient weight from a recipe, keep that context rather than applying it to the cooked-food entry. Water absorbed or lost during cooking changes the weight basis.',
        'For a shared batch, establish the recipe and how much of the batch you ate. A photo of one plate does not reveal the amount left in the pot. If the share is unknown, record the uncertainty instead of implying an exact allocation.',
      ] },
      { heading: 'Oil and sauces: add information, not guesses', paragraphs: [
        'Include preparation details you know: oil in a shared recipe, dressing added to your plate or sauce served separately. Avoid counting the whole pan’s oil as your portion, or adding oil twice when the selected dish already includes it.',
        'If the food was prepared elsewhere, ask for details when practical. Without that information, the estimate remains uncertain. A second camera angle can reveal a hidden side dish but cannot expose absorbed oil or a sauce recipe.',
      ] },
      { heading: 'Use the tool as a review workspace', paragraphs: [
        'Try the photo counter, inspect the identified foods and adjust their portions. Keep a short recipe note for meals you repeat. The rice, chicken and salad scenario is illustrative; it is not a measured calorie result or a Full Balance accuracy test.',
        'For the broader limits of photo estimates, read the accuracy guide. No account is needed to try the meal tool; a daily calorie target is a separate calculation and should not be confused with the calories in one meal.',
      ] },
    ], sources: nutritionSources,
    internalLinks: [['/en/photo-calorie-counter', 'Review a meal photo'], ['/en/blog/how-accurate-photo-calorie-counter', 'Photo estimate accuracy guide'], ['/en/calorie-macro-calculator', 'Daily calorie target calculator']],
    cta: { href: '/en/photo-calorie-counter', label: 'Review a meal photo', title: 'Check the ingredients first', description: 'Use the free browser tool, then correct foods and portions. No sign-up required.' },
  },
  {
    ...defaults, language: 'en', slug: 'home-workout-progress-without-new-equipment',
    title: 'How to Track Home Workout Progress Without Buying New Equipment',
    description: 'Make home workout sessions comparable by recording exercise variation, repetitions and rest before deciding whether to change your routine or equipment.',
    category: 'Training', readTime: '4 min', image: '/images/blog/dumbbell-log.svg',
    imageAlt: 'Exercise journal illustration with repetition, rest and session comparison fields',
    intro: 'Before changing your equipment, make your sessions comparable. Record the exercise variation, completed repetitions and rest. Then review what improved and what changed instead of judging progress from one difficult workout.',
    sections: [
      { heading: 'Compare the same exercise under similar conditions', paragraphs: [
        'A wall push-up and a floor push-up are different variations. More repetitions of an easier variation do not automatically show more strength. Record the variation and support used, along with completed sets and rest.',
        'If you changed technique, range of motion or rest, note it. A simple log makes the comparison more honest and helps you choose the next session without relying on memory.',
      ] },
      { heading: 'Change one variable at a time', paragraphs: [
        'Within your program, you may be able to progress repetitions or use an appropriate variation. Introducing a harder variation, extra sets and more training days together makes the effect difficult to interpret. Choose a manageable change and review control and recovery.',
        'Harder does not automatically mean better. A movement that you cannot control is not a useful replacement simply because it looks advanced. Stop a movement that produces sharp pain and seek individual guidance when needed.',
      ] },
      { heading: 'Use a short session record', paragraphs: [
        'Write the date, exercise variation, set repetitions, rest and a short note. A hypothetical entry might compare the same incline push-up across two sessions with the same surface and rest. It is a comparison example, not a prescribed repetition target or a result from our users.',
        'Progress can include more consistent participation or better control, as well as changes in repetitions. These observations are useful, but they are not a clinical assessment or a guaranteed muscle-growth measurement.',
      ] },
      { heading: 'Know when the current setup is limiting', paragraphs: [
        'Bodyweight training does not mean every movement or goal can be progressed indefinitely without equipment. Space, safe support points and exercise options matter. If the existing routine no longer suits your goal, review the plan rather than improvising an unsafe setup.',
        'Explore the free home workout plan, declare the equipment you actually have and choose your available days. Keep the training log simple enough to use consistently; the plan and your records should make your next action clearer.',
      ] },
    ], sources: trainingSources,
    internalLinks: [['/en/home-workout-no-equipment', 'Free home workout plan'], ['/en/home-dumbbell-workout-plan', 'Home dumbbell plan']],
    cta: { href: '/en/home-workout-no-equipment', label: 'Explore the free home plan', title: 'Plan around what you have', description: 'See a home routine and create a personal plan for your experience and available days.' },
  },
];
