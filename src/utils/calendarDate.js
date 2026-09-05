export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function recentCalendarEntries(entries, days = 7, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - days + 1);
  const from = localDateKey(start);
  const to = localDateKey(now);
  return entries.filter(entry => entry.date >= from && entry.date <= to);
}
