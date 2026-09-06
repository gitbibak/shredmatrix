function cleanIngredient(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function buildShoppingList(days, dayIndexes) {
  const selectedDays = dayIndexes.map(index => days?.[index]).filter(Boolean);
  const grouped = new Map();

  selectedDays.forEach(day => {
    day.meals?.forEach(meal => {
      if (Array.isArray(meal.ingredients) && meal.ingredients.length) {
        meal.ingredients.forEach((item) => {
          const id = `${item.foodId}:${item.state}`;
          const current = grouped.get(id);
          const grams = (current?.grams || 0) + item.grams;
          grouped.set(id, { id, grams, label: `${item.label}: ${Math.round(grams * 10) / 10} g`, count: 1 });
        });
        return;
      }
      meal.items?.forEach(rawItem => {
        cleanIngredient(rawItem).split(/\s*\+\s*/).forEach(part => {
          const label = cleanIngredient(part);
          if (!label) return;
          const id = label.toLocaleLowerCase('tr-TR');
          const current = grouped.get(id);
          grouped.set(id, current
            ? { ...current, count: current.count + 1 }
            : { id, label, count: 1 });
        });
      });
    });
  });

  return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label));
}
