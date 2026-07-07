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
      <div>
        <div className="eyebrow text-gold">Station setup</div>
        <h1 className="display mt-1 text-5xl uppercase italic leading-none">
          Exercises
        </h1>
        <div className="chevrons mt-3 w-24" aria-hidden />
      </div>
      <ExerciseLibrary items={items} />
    </div>
  );
}
