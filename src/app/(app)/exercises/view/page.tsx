"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { getExerciseProgress } from "@/lib/stats";
import { formatDate, formatWeight } from "@/lib/format";
import StatCard from "@/components/StatCard";
import TrendChart from "@/components/charts/TrendChart";

function ExerciseDetail() {
  const params = useSearchParams();
  const store = useStore();
  const id = Number(params.get("id"));
  const exercise = store.exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <p className="text-ink-muted">Exercise not found — it may have been deleted.</p>
    );
  }

  const progression = getExerciseProgress(store, exercise.id);

  const history = store.workouts
    .flatMap((w) =>
      w.exercises
        .filter((ex) => ex.exerciseId === exercise.id)
        .flatMap((ex) =>
          ex.sets.map((s, i) => ({
            workoutId: w.id,
            date: w.date,
            position: i,
            weightKg: s.weightKg,
            reps: s.reps,
          }))
        )
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.workoutId - a.workoutId)
    .slice(0, 30);

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
                accent="gold"
                value={`${formatWeight(heaviest.weightKg)} × ${heaviest.reps}`}
                detail={formatDate(heaviest.date)}
              />
            )}
            {bestVolumeSet && (
              <StatCard
                label="Biggest set (kg × reps)"
                accent="gold"
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
                  {history.map((s, i) => (
                    <tr key={i} className="num border-t border-hairline">
                      <td className="p-3">
                        <Link
                          href={`/workouts/view?id=${s.workoutId}`}
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

export default function ExerciseDetailPage() {
  return (
    <Suspense>
      <ExerciseDetail />
    </Suspense>
  );
}
