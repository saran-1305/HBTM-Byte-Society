// Local calendar-day formatter (not toISOString/UTC) so the streak lines up
// with the user's actual "today," not UTC's.
export const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// A streak stays "alive" through the end of today even if today hasn't been
// logged yet: it only breaks once a full day is skipped.
export const getReflectionStreak = (dates: string[]): number => {
  const logged = new Set(dates);
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!logged.has(toLocalDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!logged.has(toLocalDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (logged.has(toLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
