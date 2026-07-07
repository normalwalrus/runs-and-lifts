import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises, sessionExercises, sets, workoutSessions } from "@/db/schema";
import { getExerciseProgress } from "@/lib/stats";
import { formatDate, formatWeight } from "@/lib/format";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/charts/TrendChart";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, Number(id)))
    .limit(1);
  if (!exercise) notFound();

  const progression = await getExerciseProgress(exercise.id);

  const history = await db
    .select({
      setId: sets.id,
      sessionId: workoutSessions.id,
      date: workoutSessions.date,
      weightKg: sets.weightKg,
      reps: sets.reps,
      position: sets.position,
    })
    .from(sets)
    .innerJoin(sessionExercises, eq(sets.sessionExerciseId, sessionExercises.id))
    .innerJoin(workoutSessions, eq(sessionExercises.sessionId, workoutSessions.id))
    .where(eq(sessionExercises.exerciseId, exercise.id))
    .orderBy(desc(workoutSessions.date), desc(sessionExercises.id), sets.position)
    .limit(30);

  const heaviest = history.reduce(
    (best, s) => (best === null || s.weightKg > best.weightKg ? s : best),
    null as (typeof history)[number] | null
  );
  const bestVolumeSet = history.reduce(
    (best, s) =>
      best === null || s.weightKg * s.reps > best.weightKg * best.reps ? s : best,
    null as (typeof history)[number] | null
  );

  return (
    <div className="space-y-6">
      <h1 className="display text-4xl uppercase italic leading-none">
        {exercise.name}
      </h1>

      {history.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline p-8 text-center text-ink-muted">
          No sets logged for this exercise yet — it&apos;s still on the shelf.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {heaviest && (
              <StatCard
                label="Heaviest set"
                value={`${formatWeight(heaviest.weightKg)} × ${heaviest.reps}`}
                detail={formatDate(heaviest.date)}
              />
            )}
            {bestVolumeSet && (
              <StatCard
                label="Biggest set (kg × reps)"
                value={formatWeight(bestVolumeSet.weightKg * bestVolumeSet.reps)}
                detail={`${formatWeight(bestVolumeSet.weightKg)} × ${bestVolumeSet.reps} on ${formatDate(bestVolumeSet.date)}`}
              />
            )}
          </div>

          <section className="space-y-2">
            <h2 className="display text-lg">Progression (top set kg)</h2>
            <TrendChart
              metric="weight"
              data={progression.map((p) => ({ date: p.date, value: p.topWeightKg }))}
            />
          </section>

          <section className="space-y-2">
            <h2 className="display text-lg">Recent sets</h2>
            <div className="overflow-x-auto rounded-xl border border-hairline bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="eyebrow p-3">Date</th>
                    <th className="eyebrow p-3">Set</th>
                    <th className="eyebrow p-3">Weight</th>
                    <th className="eyebrow p-3">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => (
                    <tr
                      key={s.setId}
                      className="num border-t border-hairline"
                    >
                      <td className="p-3">
                        <Link
                          href={`/workouts/${s.sessionId}`}
                          className="hover:underline"
                        >
                          {formatDate(s.date)}
                        </Link>
                      </td>
                      <td className="p-3 text-ink-muted">{s.position + 1}</td>
                      <td className="p-3">{formatWeight(s.weightKg)}</td>
                      <td className="p-3">{s.reps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
