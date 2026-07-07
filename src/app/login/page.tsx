"use client";

import { useActionState } from "react";
import { login } from "./actions";
import Barbell from "@/components/Barbell";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="eyebrow text-gold">Race control · Athlete 001</div>
          <h1 className="display mt-2 text-6xl uppercase italic leading-[0.9]">
            Hybrid
            <br />
            <span className="text-gold">Rockstar</span>
          </h1>
          <div className="chevrons mt-5 w-44" aria-hidden />
          <Barbell className="mt-5" />
          <p className="mt-4 text-sm text-ink-muted">
            One athlete. Two disciplines. Zero excuses.
          </p>
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
          className="cta h-12 w-full rounded-md disabled:opacity-50"
        >
          {pending ? "Opening the gates…" : "Enter the arena"}
        </button>
      </form>
    </main>
  );
}
