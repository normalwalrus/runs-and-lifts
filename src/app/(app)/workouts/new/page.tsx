import { asc } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import WorkoutForm from "@/components/WorkoutForm";

export const dynamic = "force-dynamic";

export default async function NewWorkoutPage() {
  const exerciseOptions = await db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Next station</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">
          Log workout
        </h1>
      </div>
      <WorkoutForm
        sessionId={null}
        exerciseOptions={exerciseOptions}
        submitLabel="Save workout"
      />
    </div>
  );
}
