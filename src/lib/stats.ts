import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { exercises, runs, sessionExercises, sets, workoutSessions } from "@/db/schema";

export async function getFastestRun() {
  const rows = await db
    .select()
    .from(runs)
    .orderBy(asc(sql`${runs.durationSec}::float8 / ${runs.distanceKm}`))
    .limit(1);
  return rows[0];
}

export async function getLongestRun() {
  const rows = await db.select().from(runs).orderBy(desc(runs.distanceKm)).limit(1);
  return rows[0];
}

export type ExercisePR = {
  exerciseId: number;
  exerciseName: string;
  maxWeightKg: number;
};

/** Heaviest weight ever lifted per exercise, heaviest first. */
export async function getExercisePRs(): Promise<ExercisePR[]> {
  return db
    .select({
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      maxWeightKg: sql<number>`max(${sets.weightKg})`,
    })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(exercises, eq(sessionExercises.exerciseId, exercises.id))
    .groupBy(exercises.id)
    .orderBy(desc(sql`max(${sets.weightKg})`));
}

export type PeriodTotals = {
  period: string;
  runCount: number;
  runDistanceKm: number;
  runDurationSec: number;
  workoutCount: number;
  volumeKg: number;
};

/**
 * Totals per period. `format` is a Postgres to_char format:
 * 'IYYY-IW' for ISO weekly, 'YYYY-MM' for monthly.
 */
export async function getPeriodTotals(format: string, limit = 8): Promise<PeriodTotals[]> {
  const runRes = await db.execute<{ period: string; n: number; km: number; sec: number }>(sql`
    SELECT to_char(date, ${format}) AS period,
           count(*)::int AS n,
           sum(distance_km)::float8 AS km,
           sum(duration_sec)::float8 AS sec
    FROM runs GROUP BY period
  `);
  const liftRes = await db.execute<{ period: string; n: number; vol: number }>(sql`
    SELECT to_char(ws.date, ${format}) AS period,
           count(DISTINCT ws.id)::int AS n,
           coalesce(sum(s.weight_kg * s.reps), 0)::float8 AS vol
    FROM workout_sessions ws
    LEFT JOIN session_exercises se ON se.session_id = ws.id
    LEFT JOIN sets s ON s.session_exercise_id = se.id
    GROUP BY period
  `);

  const byPeriod = new Map<string, PeriodTotals>();
  const entry = (period: string): PeriodTotals => {
    let e = byPeriod.get(period);
    if (!e) {
      e = {
        period,
        runCount: 0,
        runDistanceKm: 0,
        runDurationSec: 0,
        workoutCount: 0,
        volumeKg: 0,
      };
      byPeriod.set(period, e);
    }
    return e;
  };
  for (const r of runRes.rows) {
    const e = entry(r.period);
    e.runCount = r.n;
    e.runDistanceKm = r.km;
    e.runDurationSec = r.sec;
  }
  for (const l of liftRes.rows) {
    const e = entry(l.period);
    e.workoutCount = l.n;
    e.volumeKg = l.vol;
  }
  return [...byPeriod.values()]
    .sort((a, b) => b.period.localeCompare(a.period))
    .slice(0, limit);
}

/** Totals for the period containing today (zeros if nothing logged). */
export async function getCurrentPeriodTotals(format: string): Promise<PeriodTotals> {
  const res = await db.execute<{ key: string }>(
    sql`SELECT to_char(now(), ${format}) AS key`
  );
  const key = res.rows[0]?.key ?? "";
  return (
    (await getPeriodTotals(format, 1000)).find((t) => t.period === key) ?? {
      period: key,
      runCount: 0,
      runDistanceKm: 0,
      runDurationSec: 0,
      workoutCount: 0,
      volumeKg: 0,
    }
  );
}

export type RunTrendPoint = { date: string; paceSecPerKm: number; distanceKm: number };

export async function getRunTrend(): Promise<RunTrendPoint[]> {
  return db
    .select({
      date: runs.date,
      paceSecPerKm: sql<number>`${runs.durationSec}::float8 / ${runs.distanceKm}`,
      distanceKm: runs.distanceKm,
    })
    .from(runs)
    .orderBy(asc(runs.date), asc(runs.createdAt));
}

export type ExerciseProgressPoint = { date: string; topWeightKg: number };

/** Heaviest set per session date for one exercise, oldest first. */
export async function getExerciseProgress(
  exerciseId: number
): Promise<ExerciseProgressPoint[]> {
  return db
    .select({
      date: workoutSessions.date,
      topWeightKg: sql<number>`max(${sets.weightKg})`,
    })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(workoutSessions, eq(sessionExercises.sessionId, workoutSessions.id))
    .where(eq(sessionExercises.exerciseId, exerciseId))
    .groupBy(workoutSessions.date)
    .orderBy(asc(workoutSessions.date));
}
