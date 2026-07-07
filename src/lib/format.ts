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

/**
 * Total volume → the nearest ridiculous-but-motivating yardstick,
 * e.g. 1390 → "≈ 2 grand pianos". Null below one adult human.
 */
export function volumeQuip(kg: number): string | null {
  const YARDSTICKS: [number, string, string][] = [
    [140000, "blue whale", "blue whales"],
    [6000, "African elephant", "African elephants"],
    [1400, "family car", "family cars"],
    [480, "grand piano", "grand pianos"],
    [300, "vending machine", "vending machines"],
    [160, "silverback gorilla", "silverback gorillas"],
    [75, "adult human", "adult humans"],
  ];
  // Prefer a count of 2+ so consecutive workouts don't all read "≈ 1 family car".
  let single: string | null = null;
  for (const [unit, one, many] of YARDSTICKS) {
    const n = Math.floor(kg / unit);
    if (n >= 2) return `≈ ${n} ${many}`;
    if (n === 1 && single === null) single = `≈ 1 ${one}`;
  }
  return single;
}
