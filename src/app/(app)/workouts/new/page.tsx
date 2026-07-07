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
      <h1 className="text-2xl font-bold">Log workout</h1>
      <WorkoutForm
        workoutId={null}
        exerciseOptions={exerciseOptions}
        submitLabel="Save workout"
      />
    </div>
  );
}
