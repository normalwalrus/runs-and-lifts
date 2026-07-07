import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import WorkoutForm from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function EditWorkoutPage({
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
        with: { sets: { orderBy: (s) => [asc(s.position)] } },
      },
    },
  });
  if (!session) notFound();

  const exerciseOptions = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit workout</h1>
      <WorkoutForm
        sessionId={session.id}
        exerciseOptions={exerciseOptions}
        initial={{
          date: session.date,
          name: session.name,
          notes: session.notes,
          exercises: session.sessionExercises.map((se) => ({
            exerciseId: se.exerciseId,
            sets: se.sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
          })),
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
