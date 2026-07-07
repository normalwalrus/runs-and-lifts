import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises, sessionExercises } from "@/db/schema";
import ExerciseLibrary from "@/components/ExerciseLibrary";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const items = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      usageCount: count(sessionExercises.id),
    })
    .from(exercises)
    .leftJoin(sessionExercises, eq(sessionExercises.exerciseId, exercises.id))
    .groupBy(exercises.id)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Exercise library</h1>
      <ExerciseLibrary items={items} />
    </div>
  );
}
