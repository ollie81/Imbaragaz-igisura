export type OpeningInterval = {
  /** ISO day of week: 1 = Monday … 7 = Sunday */
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

/** "06:00:00" → "06:00" */
export function formatTime(time: string): string {
  return time.slice(0, 5);
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
