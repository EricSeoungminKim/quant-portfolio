import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "#equity", label: "수익 곡선" },
  { href: "#strategies", label: "전략별 성적" },
  { href: "#how", label: "작동 원리" },
  { href: "#cost", label: "비용" },
  { href: "#safety", label: "안전장치" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
          QUANT&nbsp;TRADING
        </a>
        <nav className="hidden gap-6 text-sm text-[var(--muted)] md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--foreground)]">
              {l.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
