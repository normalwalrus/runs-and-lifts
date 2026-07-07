"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { getExerciseProgress, getExercisePRs, getRunTrend } from "@/lib/stats";
import TrendChart from "@/components/charts/TrendChart";
import ExercisePicker from "@/components/ExercisePicker";

function Progress() {
  const params = useSearchParams();
  const store = useStore();
  const exercise = params.get("exercise");

  const runTrend = getRunTrend(store.runs);
  const exerciseOptions = [...store.exercises].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Default to an exercise that actually has logged sets, not the first alphabetically.
  const trained = getExercisePRs(store);
  const selectedId = exercise
    ? Number(exercise)
    : trained[0]?.exerciseId ?? exerciseOptions[0]?.id ?? null;
  const selected = exerciseOptions.find((e) => e.id === selectedId) ?? null;
  const progression = selectedId ? getExerciseProgress(store, selectedId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">Run pace (min/km — lower is faster)</h2>
        <TrendChart
          metric="pace"
          data={runTrend.map((p) => ({ date: p.date, value: p.paceSecPerKm }))}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Run distance (km)</h2>
        <TrendChart
          metric="distance"
          data={runTrend.map((p) => ({ date: p.date, value: p.distanceKm }))}
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">
          Lifting progression{selected ? ` — ${selected.name}` : ""} (top set kg)
        </h2>
        <ExercisePicker options={exerciseOptions} selectedId={selectedId} />
        <TrendChart
          metric="weight"
          data={progression.map((p) => ({ date: p.date, value: p.topWeightKg }))}
        />
      </section>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense>
      <Progress />
    </Suspense>
  );
}
