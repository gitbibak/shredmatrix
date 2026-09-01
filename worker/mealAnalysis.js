const MAX_ITEMS = 12;

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
    return {
      id: `ai-${index + 1}`,
      name: String(item.name || '').trim().slice(0, 80),
      portion: String(item.portion_description || item.portion || '').trim().slice(0, 100),
      grams,
      calories: Math.round(clamp(item.calories ?? nutrition.calories, 0, 4000)),
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
    .map((entry) => String(entry?.name || entry?.ingredient || entry || '').trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 5);
  const uncertainty = hiddenIngredients.length > 0 || confidence < 0.7 ? 0.32 : 0.24;

  return {
    isFood: true,
    mealName: String(parsed.meal_name || '').trim().slice(0, 100),
    items,
    confidence,
    hiddenIngredients,
    calorieRange: {
      low: Math.max(0, Math.round(totalCalories * (1 - uncertainty))),
      high: Math.round(totalCalories * (1 + uncertainty)),
    },
  };
}

export function buildMealPrompt(language = 'en') {
  const outputLanguage = language === 'tr' ? 'Turkish' : language === 'es' ? 'Spanish' : 'English';
  return `Analyze this meal photo conservatively. List each visible food and drink once. estimated_grams must be the realistic total edible weight in grams, never an item count (1 cup cooked grain is about 180 g; 1 tbsp oil is about 14 g). Include visible oil, sauce, dressing and sugar separately. Put only plausible unseen oil or sauce in hidden_ingredients. If this is not food or drink, return is_food false. Use ${outputLanguage} names. Return ONLY valid JSON: {"is_food":true,"meal_name":"","confidence":0.0,"hidden_ingredients":[""],"items":[{"name":"","portion_description":"","estimated_grams":0,"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"confidence":0.0}]}.`;
}
