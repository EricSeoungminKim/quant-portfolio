"use client";

import { useT } from "@/lib/i18n";

// Light is the default look, so an unset data-theme means light — the OS
// scheme is not consulted (2026-09-04 owner direction).
function currentTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// No React state here on purpose: the correct icon is chosen with pure CSS
// (see globals.css .icon-sun/.icon-moon rules keyed off [data-theme] and
// prefers-color-scheme), so there is nothing to hydrate or flash.
export default function ThemeToggle() {
  const t = useT();

  function toggle() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0a0b0d" : "#ffffff");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage may be unavailable (private mode) — theme just won't persist
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.nav.themeToggle}
      className="flex h-8 w-8 shrink-0 items-center justify-center border border-[var(--control)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <svg
        className="icon-sun"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        className="icon-moon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M21 12.4A8.5 8.5 0 1 1 11.6 3a6.7 6.7 0 0 0 9.4 9.4Z" />
      </svg>
    </button>
  );
}
