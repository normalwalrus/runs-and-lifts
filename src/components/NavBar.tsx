"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/runs", label: "Runs" },
  { href: "/workouts", label: "Workouts" },
  { href: "/exercises", label: "Exercises" },
  { href: "/progress", label: "Progress" },
];

export default function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-hairline bg-card p-4 md:flex">
        <div className="mb-8 px-3">
          <div className="eyebrow">Training log</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-lg font-bold tracking-tight">
            Runs
            <span className="plate bg-run" aria-hidden />
            <span className="text-ink-muted">&amp;</span>
            Lifts
            <span className="plate bg-lift" aria-hidden />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg border-l-2 px-3 py-2 text-sm ${
                isActive(l.href)
                  ? "border-foreground bg-hairline/50 font-semibold text-foreground"
                  : "border-transparent font-medium text-ink-muted hover:bg-hairline/50 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="px-3 text-xs text-ink-muted">
          Data is stored in this browser.
        </p>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hairline bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-1 text-xs ${
              isActive(l.href)
                ? "font-semibold text-foreground"
                : "font-medium text-ink-muted"
            }`}
          >
            <span
              className={`h-0.5 w-6 rounded-full ${
                isActive(l.href) ? "bg-foreground" : "bg-transparent"
              }`}
              aria-hidden
            />
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
