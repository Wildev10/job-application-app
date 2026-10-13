const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Whole calendar days from today to the given date (negative = past).
 */
export function daysFromToday(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
}

/**
 * Human label for a past date: "Aujourd'hui", "Hier", "Il y a 3 j", then a short date.
 */
export function formatPastDate(value) {
  const diff = daysFromToday(value);
  if (diff === null) return '';
  if (diff >= 0) return "Aujourd'hui";
  if (diff === -1) return 'Hier';
  if (diff > -7) return `Il y a ${-diff} j`;
  return formatShortDate(value);
}

export function formatShortDate(value, withYear = false) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(withYear || !sameYear ? { year: 'numeric' } : {}),
  }).format(date);
}

/**
 * Compact interview slot, e.g. "16 oct. · 14:00".
 */
export function formatInterviewDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
  return `${formatShortDate(value)} · ${time}`;
}
