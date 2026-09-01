const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('image_read_failed'));
    reader.onerror = () => reject(new Error('image_read_failed'));
    reader.readAsDataURL(file);
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image_decode_failed'));
    image.src = url;
  });
}

export async function prepareMealPhoto(file) {
  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('image_decode_failed');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

/** English names of the nutrition database, sent to the model as a canonical vocabulary. */
export function buildFoodVocabulary(foods = []) {
  return foods
    .map((food) => String(food?.name?.en || '').trim())
    .filter((name) => name && !/^(salt|water)$/i.test(name));
}

export async function analyzeMealPhoto(image, language, fetchImpl = fetch, vocabulary = []) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetchImpl('/api/analyze-meal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image, language, vocabulary }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'analysis_unavailable');
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Food name matching ─────────────────────────────────────

const FOOD_ALIASES = {
  'bulgur wheat': 'bulgur',
  'bulgur pilaf': 'bulgur',
  'feta cheese': 'white cheese',
  feta: 'white cheese',
  'mixed greens': 'lettuce',
  'green salad': 'lettuce',
  'salad greens': 'lettuce',
  'red pepper': 'green pepper',
  'bell pepper': 'green pepper',
  'red onion': 'onion',
  tomatoes: 'tomato',
  'cherry tomato': 'tomato',
  'cherry tomatoes': 'tomato',
  lentils: 'lentil',
  eggs: 'egg',
  'omelette': 'egg',
  'omelet': 'egg',
  'chicken': 'chicken breast',
  'chicken kebab': 'chicken breast',
  'beef': 'beef tenderloin',
  'steak': 'beef tenderloin',
  'minced meat': 'ground beef',
  'meatballs': 'meatball',
  'kofte': 'meatball',
  'köfte': 'meatball',
  'white rice': 'rice',
  'rice pilaf': 'rice',
  'spaghetti': 'pasta',
  'noodles': 'pasta',
  'bread': 'white bread',
  'pita': 'white bread',
  'pide': 'white bread',
  'toast': 'white bread',
  'baguette': 'white bread',
  'wholemeal bread': 'whole wheat bread',
  'brown bread': 'whole wheat bread',
  'fries': 'french fries',
  'chips': 'french fries',
  'potato fries': 'french fries',
  'oil': 'olive oil',
  'vegetable oil': 'sunflower oil',
  'cooking oil': 'sunflower oil',
  'dressing': 'olive oil',
  'salad dressing': 'olive oil',
  'yoghurt': 'yogurt',
  'plain yogurt': 'yogurt',
  'cheese': 'white cheese',
  'lemon juice': 'lemon',
  'orange juice': 'orange juice',
  'cola': 'cola',
  'soda': 'cola',
  'coke': 'cola',
};

const SHAPE_WORDS = ['sauce', 'soup', 'juice', 'oil', 'paste', 'bread', 'cake', 'cookie', 'chips', 'fries', 'pie', 'jam', 'smoothie', 'shake', 'milk', 'cheese', 'butter', 'cream', 'salad', 'pilaf', 'white', 'whole', 'sweet', 'egg'];
const PREPARATION_WORDS = /\b(grilled|roasted|boiled|cooked|steamed|fresh|raw|fried|scrambled|poached|baked|sauteed|sliced|chopped|diced|plain|homemade|izgara|pisirilmis|haslanmis|kizartma|a la plancha|cocido|asado|frito)\b/g;

export function normalizeFoodName(value) {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(PREPARATION_WORDS, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return FOOD_ALIASES[normalized] || normalized;
}

function tokens(value) {
  return value.split(' ').filter(Boolean);
}

function scoreCandidate(targetTokens, keyTokens) {
  if (targetTokens.length === 0 || keyTokens.length === 0) return 0;
  const targetSet = new Set(targetTokens);
  const keySet = new Set(keyTokens);
  const overlap = keyTokens.filter((token) => targetSet.has(token)).length;
  if (overlap === 0) return 0;

  // A shape word ("sauce", "juice", "bread") changes what the food is. If either
  // side carries one the other lacks, they are different foods, not variants.
  const shapeMismatch = SHAPE_WORDS.some((word) => targetSet.has(word) !== keySet.has(word));
  if (shapeMismatch) return 0;

  const keyCovered = overlap === keyTokens.length;
  const targetCovered = overlap === targetTokens.length;
  if (keyCovered && targetCovered) return 100;
  if (keyCovered) return 60 + keyTokens.length * 4 - (targetTokens.length - overlap);
  if (targetCovered) return 40 + overlap * 4 - (keyTokens.length - overlap);
  return 0;
}

export function findKnownFood(name, foods, canonical = '') {
  if (!Array.isArray(foods) || foods.length === 0) return null;
  const targets = [normalizeFoodName(canonical), normalizeFoodName(name)].filter(Boolean);
  if (targets.length === 0) return null;

  let best = null;
  foods.forEach((food) => {
    Object.values(food?.name || {}).forEach((label) => {
      const key = normalizeFoodName(label);
      if (!key) return;
      targets.forEach((target, priority) => {
        const score = key === target ? 200 : scoreCandidate(tokens(target), tokens(key));
        const weighted = score > 0 ? score - priority * 5 : 0;
        if (weighted > (best?.score || 0)) best = { food, score: weighted };
      });
    });
  });
  return best?.food || null;
}

// ── Portion and nutrition sanity ──────────────────────────

const CATEGORY_MIN_GRAMS = { meat: 30, grain: 30, veggie: 10, fruit: 30, dairy: 10, sauce: 3, drink: 100, snack: 10, dessert: 20, fastfood: 60 };
const CATEGORY_DEFAULT_GRAMS = { meat: 120, grain: 150, veggie: 60, fruit: 100, dairy: 30, sauce: 14, drink: 250, snack: 30, dessert: 90, fastfood: 200 };
const MAX_KCAL_PER_100G = { drink: 120, veggie: 250, fruit: 350, sauce: 900, snack: 700, default: 600 };

export function normalizeEstimatedGrams(value, category, name) {
  const grams = Math.max(1, Number(value) || 1);
  if (/\b(lemon|lime|limon)\b.*\b(juice|suyu|jugo)\b/i.test(String(name || '')) && grams < 8) return 15;
  const minimum = CATEGORY_MIN_GRAMS[category] || 5;
  // Small numbers are almost always a piece count the model mislabelled as grams.
  return grams < minimum ? (CATEGORY_DEFAULT_GRAMS[category] || Math.max(grams, 30)) : Math.min(grams, 1500);
}

function plausibleEnergy(item, modelCalories) {
  const energy = (Number(item.protein) * 4) + (Number(item.carbs) * 4) + (Number(item.fat) * 9);
  return modelCalories > 0 && energy >= modelCalories * 0.55 && energy <= modelCalories * 1.8;
}

export function analysisItemsToMealItems(items, language, foods = []) {
  const candidates = (Array.isArray(items) ? items : []).map((item) => {
    const knownFood = findKnownFood(item.name, foods, item.canonical);
    const category = knownFood?.cat || 'photo';
    const grams = normalizeEstimatedGrams(item.grams, knownFood?.cat, item.canonical || item.name);
    const multiplier = grams / 100;
    const modelCalories = Number(item.calories) || 0;
    const macrosPlausible = plausibleEnergy(item, modelCalories);
    const modelGrams = Math.max(1, Number(item.grams) || grams);
    const names = knownFood?.name || { tr: item.name, en: item.canonical || item.name, es: item.name, [language]: item.name };

    let per100;
    if (knownFood) {
      per100 = knownFood;
    } else {
      // Unknown food: keep the model's calorie density but cap it to what real food can contain.
      const densityCap = MAX_KCAL_PER_100G.default;
      const cal = Math.min(densityCap, Math.max(0, (modelCalories / modelGrams) * 100));
      per100 = {
        cal,
        p: macrosPlausible ? (Number(item.protein) / modelGrams) * 100 : 0,
        c: macrosPlausible ? (Number(item.carbs) / modelGrams) * 100 : 0,
        f: macrosPlausible ? (Number(item.fat) / modelGrams) * 100 : 0,
        cat: 'photo',
      };
    }

    return {
      dedupeKey: knownFood
        ? `known:${normalizeFoodName(knownFood.name?.en || item.name)}`
        : `model:${normalizeFoodName(item.name)}`,
      source: 'photo',
      matched: Boolean(knownFood),
      confidence: Number(item.confidence) || 0,
      portion: item.portion || '',
      food: {
        name: names,
        cat: category,
        cal: Math.round(Number(per100.cal) || 0),
        p: Number(per100.p) || 0,
        c: Number(per100.c) || 0,
        f: Number(per100.f) || 0,
      },
      grams,
      cal: Math.round((Number(per100.cal) || 0) * multiplier),
      p: (Number(per100.p) || 0) * multiplier,
      c: (Number(per100.c) || 0) * multiplier,
      f: (Number(per100.f) || 0) * multiplier,
    };
  }).filter((item) => item.food.cal > 0 || item.p > 0 || item.c > 0 || item.f > 0);

  const deduplicated = new Map();
  candidates.forEach((item) => {
    const current = deduplicated.get(item.dedupeKey);
    if (!current || item.grams > current.grams) {
      deduplicated.set(item.dedupeKey, item);
    } else if (item.confidence > current.confidence) {
      current.confidence = item.confidence;
    }
  });

  const batchId = Date.now();
  return [...deduplicated.values()].map(({ dedupeKey: _dedupeKey, ...item }, index) => ({
    ...item,
    id: `photo-${batchId}-${index}`,
  }));
}

/** Recalculates a meal item after the user changes its weight. */
export function rescaleMealItem(item, grams) {
  const safeGrams = Math.max(1, Math.min(1500, Math.round(Number(grams) || 1)));
  const multiplier = safeGrams / 100;
  return {
    ...item,
    grams: safeGrams,
    cal: Math.round((Number(item.food?.cal) || 0) * multiplier),
    p: (Number(item.food?.p) || 0) * multiplier,
    c: (Number(item.food?.c) || 0) * multiplier,
    f: (Number(item.food?.f) || 0) * multiplier,
  };
}

const HIDDEN_DEFAULT_GRAMS = { sauce: 12, dairy: 10, snack: 15, drink: 200 };

/**
 * Maps the model's "probably present but invisible" ingredients (oil, butter,
 * sugar, dressing) onto database foods so the user can add them with one tap.
 */
export function suggestHiddenIngredients(hiddenIngredients, foods = []) {
  const seen = new Set();
  return (Array.isArray(hiddenIngredients) ? hiddenIngredients : [])
    .map((name) => {
      const food = findKnownFood(name, foods);
      const key = food ? normalizeFoodName(food.name?.en) : normalizeFoodName(name);
      if (!key || seen.has(key)) return null;
      seen.add(key);
      return { label: String(name || '').trim(), food, grams: food ? (HIDDEN_DEFAULT_GRAMS[food.cat] || 10) : 0 };
    })
    .filter(Boolean)
    .slice(0, 4);
}

/** Wider ranges when the model is unsure or suspects hidden calories. */
export function getPhotoEstimateRange(calories, confidence = 0.6, hiddenCount = 0) {
  const value = Number(calories) || 0;
  if (value <= 0) return { low: 0, high: 0 };
  const safeConfidence = Math.min(1, Math.max(0, Number(confidence) || 0));
  const uncertainty = Math.min(0.45, 0.18 + (1 - safeConfidence) * 0.3 + Math.min(hiddenCount, 3) * 0.03);
  return {
    low: Math.max(0, Math.round(value * (1 - uncertainty))),
    high: Math.round(value * (1 + uncertainty + Math.min(hiddenCount, 3) * 0.05)),
  };
}
