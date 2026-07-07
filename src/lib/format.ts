/** Pace in min/km formatted as "m:ss /km". */
export function formatPace(durationSec: number, distanceKm: number): string {
  if (distanceKm <= 0 || durationSec <= 0) return "–";
  const paceSec = durationSec / distanceKm;
  const m = Math.floor(paceSec / 60);
  const s = Math.round(paceSec % 60);
  return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")} /km`;
}

/** Speed in km/h with one decimal. */
export function formatSpeed(durationSec: number, distanceKm: number): string {
  if (distanceKm <= 0 || durationSec <= 0) return "–";
  return `${(distanceKm / (durationSec / 3600)).toFixed(1)} km/h`;
}

/** Duration as "h:mm:ss" or "mm:ss". */
export function formatDuration(durationSec: number): string {
  const h = Math.floor(durationSec / 3600);
  const m = Math.floor((durationSec % 3600) / 60);
  const s = durationSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

/** 'YYYY-MM-DD' → "Mon, 7 Jul 2026" (parsed as local date, not UTC). */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Today as 'YYYY-MM-DD' in local time. */
export function todayISO(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Weight without trailing ".0", e.g. 82.5 → "82.5", 100 → "100". */
export function formatWeight(kg: number): string {
  return `${Number(kg.toFixed(2))} kg`;
}
