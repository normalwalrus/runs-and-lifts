import { asc } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { getExerciseProgress, getExercisePRs, getRunTrend } from "@/lib/stats";
import TrendChart from "@/components/charts/TrendChart";
import ExercisePicker from "@/components/ExercisePicker";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise } = await searchParams;

  const runTrend = await getRunTrend();
  const exerciseOptions = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));

  // Default to an exercise that actually has logged sets, not the first alphabetically.
  const trained = await getExercisePRs();
  const selectedId = exercise
    ? Number(exercise)
    : trained[0]?.exerciseId ?? exerciseOptions[0]?.id ?? null;
  const selected = exerciseOptions.find((e) => e.id === selectedId) ?? null;
  const progression = selectedId ? await getExerciseProgress(selectedId) : [];

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-gold">Leaderboard of one</div>
        <h1 className="display mt-1 text-5xl uppercase italic leading-none">
          Progress
        </h1>
        <div className="chevrons mt-3 w-24" aria-hidden />
      </div>

      <section className="space-y-2">
        <h2 className="display text-lg">Run pace (min/km — lower is faster)</h2>
        <TrendChart
          metric="pace"
          data={runTrend.map((p) => ({ date: p.date, value: p.paceSecPerKm }))}
        />
      </section>

      <section className="space-y-2">
        <h2 className="display text-lg">Run distance (km)</h2>
        <TrendChart
          metric="distance"
          data={runTrend.map((p) => ({ date: p.date, value: p.distanceKm }))}
        />
      </section>

      <section className="space-y-2">
        <h2 className="display text-lg">
          Lifting progression{selected ? ` — ${selected.name}` : ""} (top set kg)
        </h2>
        <ExercisePicker options={exerciseOptions} selectedId={selectedId} />
        <TrendChart
          metric="weight"
          data={progression.map((p) => ({ date: p.date, value: p.topWeightKg }))}
        />
      </section>
    </div>
  );
}
