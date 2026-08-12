const DAY_MS = 86_400_000;

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Monday of the week containing `date`, as YYYY-MM-DD. */
export function weekStartISO(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  return new Date(Date.parse(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

export function weeksUntil(iso: string): number {
  return Math.ceil((Date.parse(iso) - Date.now()) / (7 * DAY_MS));
}

export function daysUntil(iso: string): number {
  return Math.ceil((Date.parse(iso) - Date.now()) / DAY_MS);
}

/** ISO-8601 week number for a YYYY-MM-DD date. */
export function isoWeekNumber(iso: string): number {
  const d = new Date(iso + "T00:00:00Z");
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday decides the week's year
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
}

/** "2026-08-10" -> "Aug 10" */
export function formatDay(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "2026-08-10" -> "Aug 10, 2026" */
export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "2026-08" -> "Aug 2026" */
export function formatMonth(isoMonth: string): string {
  return new Date(isoMonth + "-01T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function currentMonthISO(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Inclusive list of YYYY-MM strings from `start` for `count` months. */
export function monthRange(start: string, count: number): string[] {
  const [y, m] = start.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 + i, 1));
    return d.toISOString().slice(0, 7);
  });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
