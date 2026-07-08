"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Barbell from "@/components/Barbell";

const LINKS = [
  { href: "/", label: "Home", num: "01" },
  { href: "/runs", label: "Runs", num: "02" },
  { href: "/workouts", label: "Workouts", num: "03" },
  { href: "/exercises", label: "Exercises", num: "04" },
  { href: "/progress", label: "Progress", num: "05" },
];

export default function NavBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed top-1.5 bottom-0 left-0 hidden w-56 flex-col border-r border-hairline bg-card p-4 md:flex">
        <div className="mb-8 px-3">
          <div className="eyebrow text-gold">Race control</div>
          <div className="display mt-1 text-3xl uppercase italic leading-[0.9]">
            Hybrid
            <br />
            <span className="text-gold">Rockstar</span>
          </div>
          <div className="chevrons mt-3 w-20" aria-hidden />
          <Barbell className="mt-3" />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-baseline gap-2 rounded-lg border-l-2 px-3 py-2 text-sm ${
                isActive(l.href)
                  ? "border-gold bg-hairline/50 font-semibold text-foreground"
                  : "border-transparent font-medium text-ink-muted hover:bg-hairline/50 hover:text-foreground"
              }`}
            >
              <span
                className={`num text-[10px] ${
                  isActive(l.href) ? "text-gold" : "text-ink-muted"
                }`}
              >
                {l.num}
              </span>
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
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-widest ${
              isActive(l.href)
                ? "font-semibold text-foreground"
                : "font-medium text-ink-muted"
            }`}
          >
            <span
              className={`h-0.5 w-6 rounded-full ${
                isActive(l.href) ? "bg-gold" : "bg-transparent"
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
