function cleanIngredient(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function buildShoppingList(days, dayIndexes) {
  const selectedDays = dayIndexes.map(index => days?.[index]).filter(Boolean);
  const grouped = new Map();

  selectedDays.forEach(day => {
    day.meals?.forEach(meal => {
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
