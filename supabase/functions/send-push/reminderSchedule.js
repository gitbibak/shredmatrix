export const isReminderTime = (value) =>
  typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

export function normalizeReminders(value, legacyHour = 9) {
  const source = value && typeof value === 'object' ? value : {};
  const days = (input) =>
    [
      ...new Set(
        (Array.isArray(input) ? input : [0, 1, 2, 3, 4, 5, 6]).filter(
          (d) => Number.isInteger(d) && d >= 0 && d <= 6,
        ),
      ),
    ].sort();
  const hour =
    Number.isInteger(legacyHour) && legacyHour >= 0 && legacyHour <= 23
      ? legacyHour
      : 9;
  return {
    workout: {
      enabled: source.workout?.enabled !== false,
      time: isReminderTime(source.workout?.time)
        ? source.workout.time
        : `${String(hour).padStart(2, '0')}:00`,
      days: days(source.workout?.days),
    },
    water: {
      enabled: source.water?.enabled === true,
      times: [
        ...new Set(
          (Array.isArray(source.water?.times)
            ? source.water.times
            : ['10:00', '14:00', '18:00']
          ).filter(isReminderTime),
        ),
      ]
        .sort()
        .slice(0, 8),
      days: days(source.water?.days),
    },
  };
}

export function localReminderClock(timezone, now = new Date()) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
  } catch {
    return localReminderClock('UTC', now);
  }
  const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  return {
    date,
    day: new Date(`${date}T12:00:00Z`).getUTCDay(),
    minute: Number(values.hour) * 60 + Number(values.minute),
  };
}

export function dueReminders(subscription, now = new Date()) {
  const clock = localReminderClock(subscription.timezone, now);
  const settings = normalizeReminders(
    subscription.reminder_settings,
    subscription.notification_hour,
  );
  const candidates = [];
  for (const kind of ['workout', 'water']) {
    const config = settings[kind];
    if (!config.enabled || !config.days.includes(clock.day)) continue;
    if (
      !subscription.reminder_settings &&
      kind === 'workout' &&
      subscription.last_notified_on === clock.date
    )
      continue;
    for (const time of kind === 'workout' ? [config.time] : config.times) {
      const [h, m] = time.split(':').map(Number);
      const delay = clock.minute - h * 60 - m;
      // Five-minute cron plus one retry; never replay old reminders in a burst.
      if (delay >= 0 && delay < 10)
        candidates.push({ kind, time, date: clock.date });
    }
  }
  return candidates;
}

export function scheduledMessage(language, reminder) {
  const copy = {
    tr: {
      workout: ['Antrenman zamanın', 'Hazırsan bugünkü antrenmanını aç.'],
      water: ['Su molası', 'Biraz su içmek için kısa bir mola ver.'],
    },
    en: {
      workout: [
        'Time for your workout',
        'Open your workout when you are ready.',
      ],
      water: ['Water break', 'Take a short break for some water.'],
    },
    es: {
      workout: [
        'Hora de entrenar',
        'Abre tu entrenamiento cuando estés listo.',
      ],
      water: [
        'Pausa para beber agua',
        'Haz una pequeña pausa para beber agua.',
      ],
    },
  }[language] || {
    workout: ['Time for your workout', 'Open your workout when you are ready.'],
    water: ['Water break', 'Take a short break for some water.'],
  };
  const [title, body] = copy[reminder.kind];
  return {
    title,
    body,
    tag: `fb-${reminder.kind}-${reminder.date}-${reminder.time}`,
    url: `/dashboard?entry=push&message=${reminder.kind}`,
  };
}
