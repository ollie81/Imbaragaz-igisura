export type OpeningInterval = {
  /** ISO day of week: 1 = Monday … 7 = Sunday */
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

/** "06:00:00" → "06:00" (machine format, e.g. for <time dateTime> and JSON-LD). */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Human-readable time for a language: 12-hour where that is customary
 * ("6:00 AM" in English), otherwise 24-hour ("06:00"). The 24-hour clock is
 * used for Kinyarwanda because it is unambiguous on signs and printed cards.
 */
export function formatTimeForLocale(time: string, locale: string, hour12: boolean): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale, {
    hour: hour12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12,
    timeZone: "UTC",
  }).format(Date.UTC(1970, 0, 1, h, m));
}

/**
 * When all seven days share one identical interval, returns it so the UI can
 * say "Every day, 06:00 – 22:00" instead of listing each day.
 */
export function getUniformDailyHours(hours: OpeningInterval[]) {
  const open = hours.filter((h) => !h.isClosed && h.opensAt && h.closesAt);
  const days = new Set(open.map((h) => h.dayOfWeek));
  if (open.length !== 7 || days.size !== 7) return null;

  const [first] = open;
  const same = open.every((h) => h.opensAt === first.opensAt && h.closesAt === first.closesAt);
  return same ? { opensAt: first.opensAt!, closesAt: first.closesAt! } : null;
}
