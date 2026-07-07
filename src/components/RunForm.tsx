"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { formatPace, formatSpeed, todayISO } from "@/lib/format";
import type { RunFormState } from "@/app/(app)/runs/actions";

type RunFormAction = (prev: RunFormState, formData: FormData) => Promise<RunFormState>;

export type RunFormInitial = {
  date: string;
  distanceKm: number;
  durationSec: number;
  notes: string | null;
};

const inputCls =
  "h-12 w-full rounded-lg border border-hairline px-3 focus:border-foreground focus:outline-none";

export default function RunForm({
  action,
  initial,
  submitLabel,
}: {
  action: RunFormAction;
  initial?: RunFormInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  // `pending` flips asynchronously, so a fast double-click can fire the action
  // twice; this ref blocks the second submit synchronously.
  const submittedRef = useRef(false);
  useEffect(() => {
    submittedRef.current = false;
  }, [state]);

  const [distance, setDistance] = useState(initial ? String(initial.distanceKm) : "");
  const [hours, setHours] = useState(
    initial ? String(Math.floor(initial.durationSec / 3600)) : "0"
  );
  const [minutes, setMinutes] = useState(
    initial ? String(Math.floor((initial.durationSec % 3600) / 60)) : ""
  );
  const [seconds, setSeconds] = useState(initial ? String(initial.durationSec % 60) : "");

  const preview = useMemo(() => {
    const km = Number(distance);
    const sec = Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0);
    if (!km || km <= 0 || !sec || sec <= 0) return null;
    return { pace: formatPace(sec, km), speed: formatSpeed(sec, km) };
  }, [distance, hours, minutes, seconds]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (submittedRef.current) e.preventDefault();
        else submittedRef.current = true;
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <input
          type="date"
          name="date"
          required
          defaultValue={initial?.date ?? todayISO()}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Distance (km)</label>
        <input
          type="number"
          name="distanceKm"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="5.0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input
              type="number"
              name="hours"
              inputMode="numeric"
              min="0"
              placeholder="h"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={inputCls}
              aria-label="Hours"
            />
          </div>
          <div>
            <input
              type="number"
              name="minutes"
              inputMode="numeric"
              min="0"
              max="59"
              placeholder="min"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={inputCls}
              aria-label="Minutes"
            />
          </div>
          <div>
            <input
              type="number"
              name="seconds"
              inputMode="numeric"
              min="0"
              max="59"
              placeholder="sec"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
              className={inputCls}
              aria-label="Seconds"
            />
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg border border-dashed p-3 text-sm ${
          preview
            ? "border-run/40 text-run"
            : "border-hairline text-ink-muted"
        }`}
      >
        {preview ? (
          <span>
            Pace <strong className="num">{preview.pace}</strong> · Speed{" "}
            <strong className="num">{preview.speed}</strong>
          </span>
        ) : (
          "Pace and speed will be calculated automatically"
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes ?? ""}
          className="w-full rounded-lg border border-hairline p-3 focus:border-foreground focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-lift">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-run font-semibold text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
