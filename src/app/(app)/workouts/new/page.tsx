"use client";

import { useStore } from "@/lib/store";
import WorkoutForm from "@/components/WorkoutForm";

export default function NewWorkoutPage() {
  const store = useStore();
  const exerciseOptions = [...store.exercises].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Next station</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">
          Log workout
        </h1>
      </div>
      <WorkoutForm
        workoutId={null}
        exerciseOptions={exerciseOptions}
        submitLabel="Save workout"
      />
    </div>
  );
}
