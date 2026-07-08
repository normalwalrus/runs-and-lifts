"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import RunForm from "@/components/RunForm";

function EditRun() {
  const params = useSearchParams();
  const store = useStore();
  const id = Number(params.get("id"));
  const run = store.runs.find((r) => r.id === id);

  if (!run) {
    return <p className="text-ink-muted">Run not found — it may have been deleted.</p>;
  }
  return (
    <RunForm
      runId={run.id}
      initial={{
        date: run.date,
        distanceKm: run.distanceKm,
        durationSec: run.durationSec,
        notes: run.notes,
      }}
      submitLabel="Save changes"
    />
  );
}

export default function EditRunPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="eyebrow text-gold">Stewards&apos; inquiry</div>
        <h1 className="display mt-1 text-4xl uppercase italic leading-none">Edit run</h1>
      </div>
      <Suspense>
        <EditRun />
      </Suspense>
    </div>
  );
}
