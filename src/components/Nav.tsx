"use client";

import ThemeToggle from "./ThemeToggle";
import LocaleToggle from "./LocaleToggle";
import { useT } from "@/lib/i18n";

export default function Nav() {
  const t = useT();
  const LINKS = [
    { href: "#equity", label: t.nav.equity },
    { href: "#strategies", label: t.nav.strategies },
    { href: "#how", label: t.nav.how },
    { href: "#cost", label: t.nav.cost },
    { href: "#safety", label: t.nav.safety },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
          {t.nav.brand}
        </a>
        <nav className="hidden gap-6 text-sm text-[var(--muted)] md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
