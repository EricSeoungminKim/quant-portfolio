// Pure formatting helpers — safe to import from client components.
// Data loading (fs) lives in ./data.ts, which must stay server-only.

import type { Locale } from "./i18n";

// Accepts either a plain date ("2026-08-10") or a full ISO timestamp
// ("2026-08-10T03:28:45+09:00") — only the date portion is used, so
// upstream data can carry either shape without breaking display.
export function formatDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${Number(m)}/${Number(d)}`;
}

// Locale-aware short date for chart axis labels: "9/2" (ko) vs "Sep 2" (en).
export function formatDateLocale(iso: string, locale: Locale): string {
  if (locale === "ko") return formatDate(iso);
  const datePart = iso.slice(0, 10);
  const d = new Date(`${datePart}T00:00:00`);
  if (Number.isNaN(d.getTime())) return datePart;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Full YYYY-MM-DD, regardless of whether the input carries a time component.
export function formatDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function formatPct(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatBp(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}bp`;
}

export function formatKrw(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

// Compact hold-duration label for the strategy table's avg-hold column:
// minutes under an hour, hours under a day, days beyond that.
export function formatHoldMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

// Generic currency-amount formatter for the per-book equity seed footnote
// (KRW for the Asia book, USD for the US book) — locale controls digit
// grouping only, not which currency symbol is used (the book's own
// currency is a data fact, not a locale preference).
export function formatMoney(value: number, currency: "KRW" | "USD", locale: Locale): string {
  const localeTag = locale === "ko" ? "ko-KR" : "en-US";
  if (currency === "KRW") {
    return `${Math.round(value).toLocaleString(localeTag)}${locale === "ko" ? "원" : " KRW"}`;
  }
  return `$${value.toLocaleString(localeTag, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
