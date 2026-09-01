const MAX_ITEMS = 12;
const MAX_VOCABULARY = 320;
const MAX_KCAL_PER_GRAM = 9;

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function extractJsonObject(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string') throw new Error('invalid_model_response');

  const cleaned = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('invalid_model_response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function cleanText(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/**
 * Validates the optional canonical food vocabulary sent by the client.
 * The vocabulary lets the model answer with names that map 1:1 onto the
 * nutrition database, which is far more reliable than free-text guesses.
 */
export function sanitizeVocabulary(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const output = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const name = cleanText(entry, 40).replace(/[^\p{L}\p{N} ()'&/-]/gu, '');
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    output.push(name);
    if (output.length >= MAX_VOCABULARY) break;
  }
  return output;
}

export function normalizeMealAnalysis(raw) {
  const parsed = extractJsonObject(raw);
  const isFood = parsed.is_food !== false && parsed.is_food !== 'false';
  const sourceItems = Array.isArray(parsed.items) ? parsed.items : [];

  const items = sourceItems.slice(0, MAX_ITEMS).map((item, index) => {
    const nutrition = item.nutrition && typeof item.nutrition === 'object' ? item.nutrition : {};
    const grams = Math.round(clamp(
      item.estimated_grams ?? item.estimated_weight_g ?? item.weight_g ?? item.grams ?? item.weight,
      1,
      2000,
    ));
    // Nothing edible exceeds pure fat density; cap runaway calorie guesses.
    const calories = Math.round(clamp(item.calories ?? nutrition.calories, 0, Math.min(4000, grams * MAX_KCAL_PER_GRAM)));
    const canonical = cleanText(item.canonical_name ?? item.canonical ?? item.name_en ?? '', 80);
    return {
      id: `ai-${index + 1}`,
      name: cleanText(item.display_name ?? item.name ?? canonical, 80),
      canonical,
      portion: cleanText(item.portion_description ?? item.portion ?? '', 100),
      grams,
      calories,
      protein: Math.round(clamp(item.protein_g ?? item.protein ?? nutrition.protein_g ?? nutrition.protein, 0, 500) * 10) / 10,
      carbs: Math.round(clamp(item.carbs_g ?? item.carbs ?? nutrition.carbs_g ?? nutrition.carbs, 0, 800) * 10) / 10,
      fat: Math.round(clamp(item.fat_g ?? item.fat ?? nutrition.fat_g ?? nutrition.fat, 0, 500) * 10) / 10,
      confidence: Math.round(clamp(item.confidence, 0, 1) * 100) / 100,
    };
  }).filter((item) => item.name && item.calories >= 0);

  if (!isFood || items.length === 0) {
    return { isFood: false, items: [], confidence: 0, hiddenIngredients: [] };
  }

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const confidence = Math.round(clamp(parsed.confidence, 0.2, 0.95) * 100) / 100;
  const hiddenIngredients = (Array.isArray(parsed.hidden_ingredients) ? parsed.hidden_ingredients : [])
    .map((entry) => cleanText(entry?.name || entry?.ingredient || entry || '', 80))
    .filter(Boolean)
    .slice(0, 5);
  const uncertainty = hiddenIngredients.length > 0 || confidence < 0.7 ? 0.32 : 0.24;

  return {
    isFood: true,
    mealName: cleanText(parsed.meal_name ?? '', 100),
    items,
    confidence,
    hiddenIngredients,
    calorieRange: {
      low: Math.max(0, Math.round(totalCalories * (1 - uncertainty))),
      high: Math.round(totalCalories * (1 + uncertainty)),
    },
  };
}

const OUTPUT_LANGUAGE = { tr: 'Turkish', en: 'English', es: 'Spanish' };

export const MEAL_JSON_SCHEMA = {
  type: 'object',
  properties: {
    is_food: { type: 'boolean' },
    meal_name: { type: 'string' },
    confidence: { type: 'number' },
    hidden_ingredients: { type: 'array', items: { type: 'string' } },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          canonical_name: { type: 'string' },
          display_name: { type: 'string' },
          portion_description: { type: 'string' },
          estimated_grams: { type: 'number' },
          calories: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
          confidence: { type: 'number' },
        },
        required: ['canonical_name', 'display_name', 'estimated_grams', 'calories'],
      },
    },
  },
  required: ['is_food', 'items'],
};

export function buildMealPrompt(language = 'en', vocabulary = []) {
  const outputLanguage = OUTPUT_LANGUAGE[language] || 'English';
  const vocabularyLine = vocabulary.length > 0
    ? ` For canonical_name, use exactly one of these names whenever the food matches (this is the nutrition database): ${vocabulary.join('; ')}. If nothing matches, write a short generic English food name.`
    : ' For canonical_name, write a short generic English food name.';

  return `You are a careful dietitian estimating a meal from one photo. Inspect the whole plate, every bowl, glass and side dish. List each distinct visible edible food or caloric drink exactly once, including bread, rice, sauces, dressings, oil, sugar and toppings. Never list plates, cutlery, napkins, plain water, or ingredients that are not visibly supported. Separate mixed dishes into their main components when the components are visible (for example rice, chicken and salad on one plate), but keep a single composite dish (pizza, burger, lasagna, soup) as one item.${vocabularyLine} display_name must be the natural ${outputLanguage} name. estimated_grams is the realistic cooked edible weight in grams for what is visible, never a piece count. Use the plate as scale (a dinner plate is about 26 cm) and standard portions: cooked meat or fish 100-200 g, cooked rice/pasta/bulgur 120-220 g, one slice of bread 30 g, one egg 50 g, cheese 15-50 g, salad vegetables 30-150 g, one tablespoon of oil 14 g, one glass of juice or soda 250 g. Calories and macros must match estimated_grams using typical nutrition values. Put only plausible invisible cooking oil, butter, sugar or sauce in hidden_ingredients (max 3). confidence is 0-1 and should be lower when portions are hidden, stacked or partially out of frame. If there is no food or drink, return is_food false with an empty items list. Return ONLY valid JSON with this shape: {"is_food":true,"meal_name":"","confidence":0.0,"hidden_ingredients":[""],"items":[{"canonical_name":"","display_name":"","portion_description":"","estimated_grams":0,"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"confidence":0.0}]}`;
}
