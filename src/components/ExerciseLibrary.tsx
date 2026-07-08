"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useStore,
  addExercise,
  renameExercise,
  deleteExercise,
  exerciseUsageCount,
  type Exercise,
  type Store,
} from "@/lib/store";

const inputCls =
  "h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none";

function ExerciseRow({ exercise, store }: { exercise: Exercise; store: Store }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(exercise.name);
  const [error, setError] = useState<string | null>(null);
  const usage = exerciseUsageCount(store, exercise.id);

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const result = renameExercise(exercise.id, draft);
    if (result?.error) setError(result.error);
    else {
      setError(null);
      setEditing(false);
    }
  }

  return (
    <li className="rounded-xl border border-hairline bg-card p-3">
      {editing ? (
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            required
            autoFocus
            className={inputCls}
          />
          <button type="submit" className="cta rounded-md px-3 py-2 text-sm">
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            className="rounded-lg px-3 py-2 text-sm text-ink-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div>
            <Link
              href={`/exercises/view?id=${exercise.id}`}
              className="font-medium hover:underline"
            >
              {exercise.name}
            </Link>
            <div className="text-xs text-ink-muted">
              {usage === 0
                ? "Not used yet"
                : `Used in ${usage} workout${usage === 1 ? "" : "s"}`}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => {
                setDraft(exercise.name);
                setEditing(true);
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-hairline"
            >
              Rename
            </button>
            <button
              onClick={() => {
                if (
                  !window.confirm(
                    `Delete "${exercise.name}"? It will be retired from the course.`
                  )
                )
                  return;
                const result = deleteExercise(exercise.id);
                setError(result?.error ?? null);
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-lift hover:bg-lift/10"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-lift">{error}</p>}
    </li>
  );
}

export default function ExerciseLibrary() {
  const store = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const items = [...store.exercises].sort((a, b) => a.name.localeCompare(b.name));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const result = addExercise(name);
    if (result?.error) setError(result.error);
    else {
      setError(null);
      setName("");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Add to the arsenal…"
          className={inputCls}
        />
        <button
          type="submit"
          className="cta shrink-0 rounded-md px-4 py-2"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-lift">{error}</p>}

      <ul className="space-y-2">
        {items.map((e) => (
          <ExerciseRow key={e.id} exercise={e} store={store} />
        ))}
      </ul>
    </div>
  );
}
