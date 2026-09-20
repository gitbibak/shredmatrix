// Regional recipe catalog for the ingredient-based nutrition engine.
// Every part is [alternatives, defaultGrams, minGrams, maxGrams]; the first
// alternative that passes the member's dietary restrictions is used. Food ids
// are the English names in foodDatabase.js. Titles read like a real dish from
// the member's food culture instead of a generic protein + grain combination.

export const MEAL_IMAGES = {
  breakfast: '/images/meals/breakfast.png',
  snack: '/images/meals/snack.png',
  afternoonSnack: '/images/meals/snack.png',
  lunch: '/images/meals/lunch.png',
  preWorkout: '/images/meals/postworkout.png',
  dinner: '/images/meals/dinner.png',
};

// Typical meal clocks per food culture. Turkish templates keep their own times;
// Spain eats lunch and dinner late, the US/UK eat earlier.
export const LOCALE_MEAL_TIMES = {
  en: { breakfast: '07:30', snack: '10:30', lunch: '12:30', afternoonSnack: '15:30', preWorkout: '17:30', dinner: '19:00' },
  es: { breakfast: '08:30', snack: '11:30', lunch: '14:00', afternoonSnack: '17:30', preWorkout: '18:30', dinner: '21:30' },
};

const P = (alternatives, grams, min, max) => [Array.isArray(alternatives) ? alternatives : [alternatives], grams, min, max];
const protein = (names, grams = 150) => P(names, grams, Math.round(grams * 0.6), Math.round(grams * 2));
const grain = (names, grams = 180) => P(names, grams, Math.round(grams * 0.5), Math.round(grams * 2));
const veg = (names, grams = 120) => P(names, grams, Math.round(grams * 0.6), Math.round(grams * 1.5));
const fruit = (names, grams = 120) => P(names, grams, Math.round(grams * 0.6), Math.round(grams * 1.5));
const oil = (grams = 10) => P(['Olive Oil'], grams, 3, 15);
const nuts = (names, grams = 15) => P(names, grams, 5, 35);
const dairy = (names, grams = 180) => P(names, grams, Math.round(grams * 0.5), Math.round(grams * 1.5));

const VEG_PROTEIN = ['Lentils (Cooked)', 'Chickpeas (Cooked)', 'White Beans (Cooked)'];

export const REGIONAL_RECIPES = {
  tr: {
    breakfast: [
      { title: 'Serpme kahvaltı tabağı', parts: [protein(['Egg', ...VEG_PROTEIN], 100), dairy(['White Cheese', 'Chickpeas (Cooked)'], 40), grain(['Whole Wheat Bread', 'Rice Cake'], 60), veg('Tomato', 100), P(['Black Olives'], 20, 10, 40)] },
      { title: 'Menemen + tam buğday ekmek', parts: [protein(['Egg', 'Chickpeas (Cooked)'], 150), veg('Tomato', 150), veg('Green Pepper', 50), oil(8), grain(['Whole Wheat Bread', 'Rice Cake'], 50)] },
      { title: 'Yulaf kasesi + yoğurt', parts: [grain(['Oatmeal', 'Rice Cake'], 60), dairy(['Yogurt', 'Chickpeas (Cooked)'], 180), fruit('Banana', 100), nuts(['Walnuts', 'Pumpkin Seeds'], 12)] },
      { title: 'Peynirli omlet + söğüş', parts: [protein(['Egg', 'Lentils (Cooked)'], 150), dairy(['White Cheese', 'Black Olives'], 40), veg('Cucumber', 100), grain(['Rye Bread', 'Rice Cake'], 50)] },
    ],
    lunch: [
      { title: 'Izgara tavuk + bulgur pilavı + çoban salata', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Bulgur Cooked', 'Rice (Cooked)']), veg('Tomato', 100), veg('Cucumber', 80), oil(10)] },
      { title: 'Mercimek yemeği + pirinç pilavı + roka', parts: [protein(['Lentils (Cooked)'], 220), grain(['Rice (Cooked)'], 150), veg('Arugula', 50), oil(8)] },
      { title: 'Izgara köfte + tam buğday makarna + cacık', parts: [protein(['Meatball', 'Chickpeas (Cooked)'], 150), grain(['Pasta (Cooked)', 'Rice (Cooked)'], 180), dairy(['Yogurt', 'Cucumber'], 150), veg('Cucumber', 80)] },
      { title: 'Ton balıklı nohut salatası', parts: [protein(['Tuna', 'Chickpeas (Cooked)'], 120), protein(['Chickpeas (Cooked)'], 150), veg('Tomato', 100), veg('Onion', 30), oil(10)] },
    ],
    dinner: [
      { title: 'Fırında somon + tatlı patates + brokoli', parts: [protein(['Salmon', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Sweet Potato', 'Potato'], 150), veg('Broccoli', 120), oil(8)] },
      { title: 'Fırında hindi + esmer pirinç + ıspanak', parts: [protein(['Turkey Breast', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Brown Rice', 'Rice (Cooked)'], 150), veg('Spinach', 120), oil(10)] },
      { title: 'Izgara levrek + sebzeli bulgur', parts: [protein(['Sea Bass', 'Chicken Breast', ...VEG_PROTEIN], 180), grain(['Bulgur Cooked', 'Rice (Cooked)'], 150), veg('Zucchini', 100), veg('Arugula', 50), oil(10)] },
      { title: 'Tavuk sote + kinoa salatası', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Quinoa', 'Bulgur Cooked', 'Rice (Cooked)'], 150), veg('Green Pepper', 80), veg('Tomato', 80), oil(10)] },
    ],
    snack: [
      { title: 'Yoğurt + ceviz + bal', parts: [dairy(['Yogurt', 'Chickpeas (Cooked)'], 200), nuts(['Walnuts', 'Pumpkin Seeds'], 15), P(['Honey', 'Dates'], 10, 5, 20)] },
      { title: 'Lor peyniri + yeşil elma', parts: [dairy(['Cottage Cheese', 'Chickpeas (Cooked)'], 150), fruit('Apple', 130)] },
      { title: 'Kuru kayısı + fındık + ayran', parts: [P(['Dried Apricots'], 30, 15, 50), nuts(['Hazelnuts', 'Sunflower Seeds'], 20), dairy(['Ayran (Yogurt Drink)', 'Cucumber'], 200)] },
    ],
    preWorkout: [
      { title: 'Muz + pirinç patlağı + whey', parts: [fruit('Banana', 120), grain(['Rice Cake'], 20), protein(['Whey Protein', 'Chickpeas (Cooked)'], 30)] },
      { title: 'Hurma + tam buğday ekmek + lor', parts: [P(['Dates'], 40, 20, 60), grain(['Whole Wheat Bread', 'Rice Cake'], 40), dairy(['Cottage Cheese', 'Chickpeas (Cooked)'], 100)] },
    ],
  },
  en: {
    breakfast: [
      { title: 'Oatmeal with milk, banana and peanut butter', parts: [grain(['Oatmeal', 'Rice Cake'], 60), dairy(['Whole Milk', 'Chickpeas (Cooked)'], 200), fruit('Banana', 100), nuts(['Peanut Butter', 'Pumpkin Seeds'], 15)] },
      { title: 'Scrambled eggs on whole wheat toast with avocado', parts: [protein(['Egg', ...VEG_PROTEIN], 150), grain(['Whole Wheat Bread', 'Rice Cake'], 60), veg('Avocado', 50), veg('Tomato', 80)] },
      { title: 'Greek yogurt parfait with granola and strawberries', parts: [dairy(['Greek Yogurt', 'Chickpeas (Cooked)'], 200), grain(['Granola', 'Rice Cake'], 40), fruit('Strawberry', 100), P(['Honey', 'Dates'], 10, 5, 20)] },
      { title: 'Veggie omelet with rye toast', parts: [protein(['Egg', 'Lentils (Cooked)'], 150), veg('Spinach', 60), veg('Mushroom', 60), grain(['Rye Bread', 'Rice Cake'], 50)] },
    ],
    lunch: [
      { title: 'Grilled chicken, brown rice and broccoli bowl', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Brown Rice', 'Rice (Cooked)']), veg('Broccoli', 120), oil(10)] },
      { title: 'Tuna and avocado wrap', parts: [protein(['Tuna', 'Chickpeas (Cooked)'], 120), grain(['Tortilla Wrap', 'Rice (Cooked)'], 60), veg('Lettuce', 50), veg('Avocado', 50), veg('Tomato', 60)] },
      { title: 'Turkey with roasted sweet potato and spinach', parts: [protein(['Turkey Breast', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Sweet Potato', 'Potato'], 200), veg('Spinach', 80), oil(8)] },
      { title: 'Lentil and quinoa power salad', parts: [protein(['Lentils (Cooked)'], 200), grain(['Quinoa', 'Rice (Cooked)'], 120), veg('Carrot', 80), veg('Cucumber', 80), oil(10)] },
    ],
    dinner: [
      { title: 'Baked salmon with quinoa and peas', parts: [protein(['Salmon', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Quinoa', 'Rice (Cooked)'], 150), veg('Green Peas', 100), oil(8)] },
      { title: 'Lean beef pasta with tomato sauce', parts: [protein(['Ground Beef', 'Lentils (Cooked)'], 150), grain(['Pasta (Cooked)', 'Rice (Cooked)'], 180), veg('Tomato', 120), oil(8)] },
      { title: 'Roast chicken thigh with potatoes and carrots', parts: [protein(['Chicken Thigh', 'Chicken Breast', ...VEG_PROTEIN], 160), grain(['Potato'], 200), veg('Carrot', 100), oil(8)] },
      { title: 'Chicken stir-fry with rice', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Rice (Cooked)'], 180), veg('Green Pepper', 80), veg('Broccoli', 80), oil(10)] },
    ],
    snack: [
      { title: 'Greek yogurt with granola', parts: [dairy(['Greek Yogurt', 'Chickpeas (Cooked)'], 200), grain(['Granola', 'Rice Cake'], 30)] },
      { title: 'Apple slices with peanut butter', parts: [fruit('Apple', 150), nuts(['Peanut Butter', 'Sunflower Seeds'], 20)] },
      { title: 'Cottage cheese with pineapple', parts: [dairy(['Cottage Cheese', 'Chickpeas (Cooked)'], 150), fruit('Pineapple', 100)] },
    ],
    preWorkout: [
      { title: 'Banana, rice cakes and whey shake', parts: [fruit('Banana', 120), grain(['Rice Cake'], 20), protein(['Whey Protein', 'Chickpeas (Cooked)'], 30)] },
      { title: 'Toast with honey and cottage cheese', parts: [grain(['Whole Wheat Bread', 'Rice Cake'], 50), P(['Honey', 'Dates'], 15, 5, 25), dairy(['Cottage Cheese', 'Chickpeas (Cooked)'], 100)] },
    ],
  },
  es: {
    breakfast: [
      { title: 'Tostada con tomate, aceite y jamón + café con leche', parts: [grain(['Whole Wheat Bread', 'Rice Cake'], 60), veg('Tomato', 100), oil(10), protein(['Ham', 'Chickpeas (Cooked)'], 40), dairy(['Semi-Skim Milk', 'Orange'], 200)] },
      { title: 'Tortilla española con cebolla', parts: [protein(['Egg', ...VEG_PROTEIN], 150), grain(['Potato'], 120), veg('Onion', 40), oil(10)] },
      { title: 'Yogur con avena, naranja y nueces', parts: [dairy(['Yogurt', 'Chickpeas (Cooked)'], 200), grain(['Oatmeal', 'Rice Cake'], 50), fruit('Orange', 150), nuts(['Walnuts', 'Pumpkin Seeds'], 12)] },
      { title: 'Revuelto de espinacas con pan integral', parts: [protein(['Egg', 'Lentils (Cooked)'], 150), veg('Spinach', 80), grain(['Whole Wheat Bread', 'Rice Cake'], 50), oil(6)] },
    ],
    lunch: [
      { title: 'Arroz con pollo y pimientos', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Rice (Cooked)']), veg('Green Pepper', 60), veg('Tomato', 80), oil(10)] },
      { title: 'Lentejas estofadas con verduras', parts: [protein(['Lentils (Cooked)'], 220), veg('Carrot', 80), grain(['Potato'], 100), oil(8)] },
      { title: 'Ensalada de alubias con atún', parts: [protein(['Tuna', 'Chickpeas (Cooked)'], 120), protein(['White Beans (Cooked)', 'Chickpeas (Cooked)'], 150), veg('Onion', 40), veg('Tomato', 80), oil(10)] },
      { title: 'Garbanzos con espinacas y pan', parts: [protein(['Chickpeas (Cooked)'], 200), veg('Spinach', 100), grain(['Whole Wheat Bread', 'Rice (Cooked)'], 50), oil(10)] },
    ],
    dinner: [
      { title: 'Lubina al horno con patatas y calabacín', parts: [protein(['Sea Bass', 'Chicken Breast', ...VEG_PROTEIN], 180), grain(['Potato'], 150), veg('Zucchini', 120), oil(10)] },
      { title: 'Arroz con gambas y guisantes', parts: [protein(['Shrimp', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Rice (Cooked)'], 150), veg('Green Peas', 80), oil(8)] },
      { title: 'Pavo a la plancha con cuscús y berenjena', parts: [protein(['Turkey Breast', 'Chicken Breast', ...VEG_PROTEIN]), grain(['Couscous', 'Rice (Cooked)'], 150), veg('Eggplant', 120), oil(10)] },
      { title: 'Pollo al horno con boniato y brócoli', parts: [protein(['Chicken Breast', ...VEG_PROTEIN]), grain(['Sweet Potato', 'Potato'], 150), veg('Broccoli', 120), oil(8)] },
    ],
    snack: [
      { title: 'Yogur con almendras', parts: [dairy(['Yogurt', 'Chickpeas (Cooked)'], 200), nuts(['Almonds', 'Sunflower Seeds'], 20)] },
      { title: 'Pan integral con requesón y tomate', parts: [grain(['Whole Wheat Bread', 'Rice Cake'], 40), dairy(['Cottage Cheese', 'Chickpeas (Cooked)'], 100), veg('Tomato', 60)] },
      { title: 'Manzana con avellanas', parts: [fruit('Apple', 150), nuts(['Hazelnuts', 'Sunflower Seeds'], 20)] },
    ],
    preWorkout: [
      { title: 'Plátano, tortitas de arroz y batido de whey', parts: [fruit('Banana', 120), grain(['Rice Cake'], 20), protein(['Whey Protein', 'Chickpeas (Cooked)'], 30)] },
      { title: 'Dátiles, almendras y leche', parts: [P(['Dates'], 40, 20, 60), nuts(['Almonds', 'Sunflower Seeds'], 20), dairy(['Semi-Skim Milk', 'Orange'], 200)] },
    ],
  },
};

// Economy budget: same dish, cheaper protein and pantry staples.
export const ECONOMY_SWAPS = {
  Salmon: 'Chicken Breast', 'Sea Bass': 'Chicken Breast', Shrimp: 'Egg', Tuna: 'Chickpeas (Cooked)',
  'Beef Tenderloin': 'Ground Beef', 'Ground Beef': 'Lentils (Cooked)', 'Turkey Breast': 'Chicken Breast',
  'Chicken Thigh': 'Chicken Breast', Ham: 'Egg', 'Whey Protein': 'Yogurt', 'Greek Yogurt': 'Yogurt',
  Quinoa: 'Rice (Cooked)', Avocado: 'Cucumber', Granola: 'Oatmeal', Strawberry: 'Apple', Pineapple: 'Apple',
  Walnuts: 'Sunflower Seeds', Almonds: 'Peanuts', Hazelnuts: 'Peanuts', Pistachios: 'Peanuts', 'Peanut Butter': 'Peanuts',
};

export function getRecipeCatalog(lang, mealKey) {
  const table = REGIONAL_RECIPES[lang] || REGIONAL_RECIPES.en;
  const key = mealKey === 'afternoonSnack' ? 'snack' : mealKey;
  return table[key] || table.snack;
}
