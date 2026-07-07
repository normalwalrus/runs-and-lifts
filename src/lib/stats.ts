import type { Run, Store, Workout } from "./store";

export function getFastestRun(runs: Run[]): Run | undefined {
  return runs
    .filter((r) => r.distanceKm > 0)
    .reduce<Run | undefined>(
      (best, r) =>
        !best || r.durationSec / r.distanceKm < best.durationSec / best.distanceKm
          ? r
          : best,
      undefined
    );
}

export function getLongestRun(runs: Run[]): Run | undefined {
  return runs.reduce<Run | undefined>(
    (best, r) => (!best || r.distanceKm > best.distanceKm ? r : best),
    undefined
  );
}

export type ExercisePR = {
  exerciseId: number;
  exerciseName: string;
  maxWeightKg: number;
};

/** Heaviest weight ever lifted per exercise, heaviest first. */
export function getExercisePRs(store: Store): ExercisePR[] {
  const max = new Map<number, number>();
  for (const w of store.workouts)
    for (const ex of w.exercises)
      for (const s of ex.sets) {
        const cur = max.get(ex.exerciseId);
        if (cur === undefined || s.weightKg > cur) max.set(ex.exerciseId, s.weightKg);
      }
  return [...max.entries()]
    .map(([exerciseId, maxWeightKg]) => ({
      exerciseId,
      exerciseName:
        store.exercises.find((e) => e.id === exerciseId)?.name ?? "Unknown",
      maxWeightKg,
    }))
    .sort((a, b) => b.maxWeightKg - a.maxWeightKg);
}

export function workoutVolume(w: Workout): number {
  return w.exercises
    .flatMap((ex) => ex.sets)
    .reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

export type PeriodTotals = {
  runCount: number;
  runDistanceKm: number;
  runDurationSec: number;
  workoutCount: number;
  volumeKg: number;
};

/** ISO week key like '2026-W28' for a 'YYYY-MM-DD' date. */
function isoWeekKey(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const day = dt.getUTCDay() || 7; // Mon=1..Sun=7
  dt.setUTCDate(dt.getUTCDate() + 4 - day); // nearest Thursday
  const isoYear = dt.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

function todayISO(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function totalsFor(store: Store, match: (date: string) => boolean): PeriodTotals {
  const t: PeriodTotals = {
    runCount: 0,
    runDistanceKm: 0,
    runDurationSec: 0,
    workoutCount: 0,
    volumeKg: 0,
  };
  for (const r of store.runs)
    if (match(r.date)) {
      t.runCount += 1;
      t.runDistanceKm += r.distanceKm;
      t.runDurationSec += r.durationSec;
    }
  for (const w of store.workouts)
    if (match(w.date)) {
      t.workoutCount += 1;
      t.volumeKg += workoutVolume(w);
    }
  return t;
}

export function getCurrentWeekTotals(store: Store): PeriodTotals {
  const key = isoWeekKey(todayISO());
  return totalsFor(store, (d) => isoWeekKey(d) === key);
}

export function getCurrentMonthTotals(store: Store): PeriodTotals {
  const key = monthKey(todayISO());
  return totalsFor(store, (d) => monthKey(d) === key);
}

export type RunTrendPoint = { date: string; paceSecPerKm: number; distanceKm: number };

export function getRunTrend(runs: Run[]): RunTrendPoint[] {
  return [...runs]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .map((r) => ({
      date: r.date,
      paceSecPerKm: r.durationSec / r.distanceKm,
      distanceKm: r.distanceKm,
    }));
}

export type ExerciseProgressPoint = { date: string; topWeightKg: number };

/** Heaviest set per workout date for one exercise, oldest first. */
export function getExerciseProgress(
  store: Store,
  exerciseId: number
): ExerciseProgressPoint[] {
  const byDate = new Map<string, number>();
  for (const w of store.workouts)
    for (const ex of w.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const s of ex.sets) {
        const cur = byDate.get(w.date);
        if (cur === undefined || s.weightKg > cur) byDate.set(w.date, s.weightKg);
      }
    }
  return [...byDate.entries()]
    .map(([date, topWeightKg]) => ({ date, topWeightKg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
