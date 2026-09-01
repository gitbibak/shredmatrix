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

export async function analyzeMealPhoto(image, language, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetchImpl('/api/analyze-meal', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image, language }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'analysis_unavailable');
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

const FOOD_ALIASES = {
  'bulgur wheat': 'bulgur',
  'feta cheese': 'white cheese',
  feta: 'white cheese',
  'mixed greens': 'lettuce',
  'red pepper': 'green pepper',
  'red onion': 'onion',
  tomatoes: 'tomato',
  lentils: 'lentil',
};

function normalizeFoodName(value) {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(grilled|roasted|boiled|cooked|steamed|fresh|raw|izgara|pisirilmis|haslanmis)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return FOOD_ALIASES[normalized] || normalized;
}

function findKnownFood(name, foods) {
  const target = normalizeFoodName(name);
  if (!target || !Array.isArray(foods)) return null;
  const candidates = foods.flatMap((food) => Object.values(food.name || {}).map((label) => ({
    food,
    key: normalizeFoodName(label),
  })));
  return candidates.find(({ key }) => key === target)?.food
    || candidates
      .filter(({ key }) => key.includes(target) || target.includes(key))
      .sort((a, b) => b.key.length - a.key.length)[0]?.food
    || null;
}

function normalizeEstimatedGrams(value, category, name) {
  const grams = Math.max(1, Number(value) || 1);
  if (/\b(lemon|lime|limon).*\b(juice|suyu)\b/i.test(String(name || '')) && grams < 8) return 15;
  const minimums = { meat: 80, grain: 80, veggie: 25, fruit: 50, dairy: 20, sauce: 8, drink: 100 };
  const defaults = { meat: 150, grain: 150, veggie: 50, fruit: 100, dairy: 30, sauce: 14, drink: 250 };
  return grams < (minimums[category] || 1) ? (defaults[category] || grams) : grams;
}

export function analysisItemsToMealItems(items, language, foods = []) {
  const candidates = items.map((item) => {
    const knownFood = findKnownFood(item.name, foods);
    const grams = normalizeEstimatedGrams(item.grams, knownFood?.cat, item.name);
    const multiplier = grams / 100;
    const modelEnergy = (Number(item.protein) * 4) + (Number(item.carbs) * 4) + (Number(item.fat) * 9);
    const modelCalories = Number(item.calories) || 0;
    const modelMacrosPlausible = modelCalories > 0 && modelEnergy >= modelCalories * 0.55 && modelEnergy <= modelCalories * 1.8;
    const names = knownFood?.name || { tr: item.name, en: item.name, es: item.name, [language]: item.name };
    const per100 = knownFood || {
      cal: modelCalories / multiplier,
      p: modelMacrosPlausible ? Number(item.protein) / multiplier : 0,
      c: modelMacrosPlausible ? Number(item.carbs) / multiplier : 0,
      f: modelMacrosPlausible ? Number(item.fat) / multiplier : 0,
      cat: 'photo',
    };
    return {
      dedupeKey: knownFood
        ? `known:${normalizeFoodName(knownFood.name?.en || item.name)}`
        : `model:${normalizeFoodName(item.name)}`,
      source: 'photo',
      confidence: Number(item.confidence) || 0,
      portion: item.portion || '',
      food: {
        name: names,
        cat: per100.cat || 'photo',
        cal: Number(per100.cal) || 0,
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
