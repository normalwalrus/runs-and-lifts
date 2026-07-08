"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveWorkout, type Exercise, type Workout, type WorkoutPayload } from "@/lib/store";
import { todayISO } from "@/lib/format";

type SetDraft = { key: string; weightKg: string; reps: string };
type ExerciseDraft = { key: string; exerciseId: string; sets: SetDraft[] };

const inputCls =
  "h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none";

function newSet(prev?: SetDraft): SetDraft {
  return {
    key: crypto.randomUUID(),
    weightKg: prev?.weightKg ?? "",
    reps: prev?.reps ?? "",
  };
}

function newExercise(): ExerciseDraft {
  return { key: crypto.randomUUID(), exerciseId: "", sets: [newSet()] };
}

export default function WorkoutForm({
  workoutId,
  exerciseOptions,
  initial,
  submitLabel,
}: {
  workoutId: number | null;
  exerciseOptions: Exercise[];
  initial?: Omit<Workout, "id">;
  submitLabel: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [name, setName] = useState(initial?.name ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [blocks, setBlocks] = useState<ExerciseDraft[]>(() =>
    initial
      ? initial.exercises.map((ex) => ({
          key: crypto.randomUUID(),
          exerciseId: String(ex.exerciseId),
          sets: ex.sets.map((s) => ({
            key: crypto.randomUUID(),
            weightKg: String(s.weightKg),
            reps: String(s.reps),
          })),
        }))
      : [newExercise()]
  );
  const [error, setError] = useState<string | null>(null);

  const updateBlock = (key: string, fn: (b: ExerciseDraft) => ExerciseDraft) =>
    setBlocks((bs) => bs.map((b) => (b.key === key ? fn(b) : b)));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: WorkoutPayload = {
      date,
      name,
      notes,
      exercises: blocks.map((b) => ({
        exerciseId: Number(b.exerciseId),
        sets: b.sets.map((s) => ({
          weightKg: Number(s.weightKg),
          reps: Number(s.reps),
        })),
      })),
    };
    const result = saveWorkout(workoutId, payload);
    if (result?.error) setError(result.error);
    else router.push("/workouts");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Name (optional)</label>
          <input
            placeholder="Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {blocks.map((block, blockIdx) => (
        <div
          key={block.key}
          className="space-y-3 rounded-xl border border-hairline bg-card p-3"
        >
          <div className="flex items-center gap-2">
            <select
              required
              value={block.exerciseId}
              onChange={(e) =>
                updateBlock(block.key, (b) => ({ ...b, exerciseId: e.target.value }))
              }
              className={inputCls}
            >
              <option value="" disabled>
                Choose exercise…
              </option>
              {exerciseOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={`Remove exercise ${blockIdx + 1}`}
              onClick={() => setBlocks((bs) => bs.filter((b) => b.key !== block.key))}
              className="h-12 shrink-0 rounded-lg px-3 text-sm font-medium text-lift hover:bg-lift/10"
            >
              Remove
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 text-xs font-medium text-ink-muted">
              <span>Set</span>
              <span>Weight (kg)</span>
              <span>Reps</span>
              <span />
            </div>
            {block.sets.map((set, setIdx) => (
              <div
                key={set.key}
                className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2"
              >
                <span className="num text-sm text-ink-muted">{setIdx + 1}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  required
                  placeholder="kg"
                  value={set.weightKg}
                  onChange={(e) =>
                    updateBlock(block.key, (b) => ({
                      ...b,
                      sets: b.sets.map((s) =>
                        s.key === set.key ? { ...s, weightKg: e.target.value } : s
                      ),
                    }))
                  }
                  className={inputCls}
                  aria-label={`Set ${setIdx + 1} weight`}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  required
                  placeholder="reps"
                  value={set.reps}
                  onChange={(e) =>
                    updateBlock(block.key, (b) => ({
                      ...b,
                      sets: b.sets.map((s) =>
                        s.key === set.key ? { ...s, reps: e.target.value } : s
                      ),
                    }))
                  }
                  className={inputCls}
                  aria-label={`Set ${setIdx + 1} reps`}
                />
                <button
                  type="button"
                  aria-label={`Remove set ${setIdx + 1}`}
                  onClick={() =>
                    updateBlock(block.key, (b) => ({
                      ...b,
                      sets: b.sets.filter((s) => s.key !== set.key),
                    }))
                  }
                  className="h-12 rounded-lg text-lift hover:bg-lift/10"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                updateBlock(block.key, (b) => ({
                  ...b,
                  // Copy the previous set's numbers — most sets repeat.
                  sets: [...b.sets, newSet(b.sets[b.sets.length - 1])],
                }))
              }
              className="w-full rounded-lg border border-dashed border-hairline py-2 text-sm font-medium text-ink-muted hover:border-foreground hover:text-foreground"
            >
              + Add set
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setBlocks((bs) => [...bs, newExercise()])}
        className="w-full rounded-xl border border-dashed border-hairline py-3 font-medium text-ink-muted hover:border-foreground hover:text-foreground"
      >
        + Add exercise
      </button>

      <div>
        <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="felt strong · blamed the pre-workout"
          className="w-full rounded-lg border border-hairline p-3 focus:border-foreground focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-lift">{error}</p>}

      <button
        type="submit"
        className="cta h-12 w-full rounded-md"
      >
        {submitLabel}
      </button>
    </form>
  );
}
