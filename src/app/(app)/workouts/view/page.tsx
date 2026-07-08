"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, deleteWorkout } from "@/lib/store";
import { workoutVolume } from "@/lib/stats";
import { formatDate, formatWeight, volumeQuip } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";

function WorkoutDetail() {
  const params = useSearchParams();
  const router = useRouter();
  const store = useStore();
  const id = Number(params.get("id"));
  const session = store.workouts.find((w) => w.id === id);

  if (!session) {
    return (
      <p className="text-ink-muted">Workout not found — it may have been deleted.</p>
    );
  }

  const exerciseName = (exerciseId: number) =>
    store.exercises.find((e) => e.id === exerciseId)?.name ?? "Unknown";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="display text-4xl uppercase italic leading-none">
            {session.name ?? "Workout"}
          </h1>
          <p className="num text-sm text-ink-muted">
            {formatDate(session.date)} · {formatWeight(workoutVolume(session))} total
            volume
            {volumeQuip(workoutVolume(session)) && (
              <span className="italic"> ({volumeQuip(workoutVolume(session))})</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/workouts/edit?id=${session.id}`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-hairline"
          >
            Edit
          </Link>
          <DeleteButton
            onDelete={() => {
              deleteWorkout(session.id);
              router.push("/workouts");
            }}
            confirmMessage="Delete this workout and all its sets? The stewards will strike it from the record."
          />
        </div>
      </div>

      {session.notes && (
        <p className="rounded-lg border border-hairline bg-card p-3 text-sm text-ink-muted">
          {session.notes}
        </p>
      )}

      <div className="space-y-3">
        {session.exercises.map((se, i) => (
          <div key={i} className="rounded-xl border border-hairline bg-card p-4">
            <Link
              href={`/exercises/view?id=${se.exerciseId}`}
              className="font-semibold hover:underline"
            >
              {exerciseName(se.exerciseId)}
            </Link>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="eyebrow py-1">Set</th>
                  <th className="eyebrow py-1">Weight</th>
                  <th className="eyebrow py-1">Reps</th>
                </tr>
              </thead>
              <tbody>
                {se.sets.map((s, j) => (
                  <tr key={j} className="num border-t border-hairline">
                    <td className="py-1.5 text-ink-muted">{j + 1}</td>
                    <td className="py-1.5">{formatWeight(s.weightKg)}</td>
                    <td className="py-1.5">{s.reps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkoutDetailPage() {
  return (
    <Suspense>
      <WorkoutDetail />
    </Suspense>
  );
}
