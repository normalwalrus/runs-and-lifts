import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { formatDate, formatWeight } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import { deleteWorkout } from "../actions";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await db.query.workoutSessions.findFirst({
    where: (ws, { eq }) => eq(ws.id, Number(id)),
    with: {
      sessionExercises: {
        orderBy: (se) => [asc(se.position)],
        with: { exercise: true, sets: { orderBy: (s) => [asc(s.position)] } },
      },
    },
  });
  if (!session) notFound();

  const volume = session.sessionExercises
    .flatMap((se) => se.sets)
    .reduce((sum, s) => sum + s.weightKg * s.reps, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{session.name ?? "Workout"}</h1>
          <p className="num text-sm text-ink-muted">
            {formatDate(session.date)} · {formatWeight(volume)} total volume
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/workouts/${session.id}/edit`}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-hairline"
          >
            Edit
          </Link>
          <DeleteButton
            action={deleteWorkout.bind(null, session.id)}
            confirmMessage="Delete this workout and all its sets?"
          />
        </div>
      </div>

      {session.notes && (
        <p className="rounded-lg border border-hairline bg-card p-3 text-sm text-ink-muted">
          {session.notes}
        </p>
      )}

      <div className="space-y-3">
        {session.sessionExercises.map((se) => (
          <div
            key={se.id}
            className="rounded-xl border border-hairline bg-card p-4"
          >
            <Link
              href={`/exercises/${se.exerciseId}`}
              className="font-semibold hover:underline"
            >
              {se.exercise.name}
            </Link>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-muted">
                  <th className="py-1 font-medium">Set</th>
                  <th className="py-1 font-medium">Weight</th>
                  <th className="py-1 font-medium">Reps</th>
                </tr>
              </thead>
              <tbody>
                {se.sets.map((s, i) => (
                  <tr key={s.id} className="num border-t border-hairline">
                    <td className="py-1.5 text-ink-muted">{i + 1}</td>
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
