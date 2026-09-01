// Pure formatting helpers — safe to import from client components.
// Data loading (fs) lives in ./data.ts, which must stay server-only.

export function formatDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
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
