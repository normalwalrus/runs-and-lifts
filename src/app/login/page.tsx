"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="eyebrow">Training log</div>
          <h1 className="mt-1 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
            Runs
            <span className="plate bg-run" aria-hidden />
            <span className="text-ink-muted">&amp;</span>
            Lifts
            <span className="plate bg-lift" aria-hidden />
          </h1>
          <p className="mt-2 text-sm text-ink-muted">Enter your password to continue</p>
        </div>
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          className="h-12 w-full rounded-lg border border-hairline px-4 focus:border-foreground focus:outline-none"
        />
        {state?.error && <p className="text-sm text-lift">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-lg bg-foreground font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
