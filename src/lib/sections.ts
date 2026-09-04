// The page's read sequence, numbered once.
//
// Section indices are not decoration — the page IS a sequence (the record,
// the per-strategy curves that decompose it, the per-strategy statistics, the
// cost that explains their sign, the mechanism, the method, the safeguards),
// and the same numbers key the sticky rail in Nav. Keeping the list here (a
// plain module, importable from both the server page and the client nav)
// means the rail and the headings can never disagree.
//
// The strategy-curves section drops out entirely when the snapshot carries no
// curves — an older generator — and the numbering closes up behind it rather
// than leaving a hole in the sequence and a dead anchor in the rail.

const ALL_SECTIONS = [
  { id: "equity", key: "equity" },
  { id: "strategy-curves", key: "curves" },
  { id: "strategies", key: "strategies" },
  { id: "cost", key: "cost" },
  { id: "how", key: "how" },
  { id: "methodology", key: "methodology" },
  { id: "safety", key: "safety" },
] as const;

export interface SectionEntry {
  id: string;
  key: string;
  index: string;
}

export function buildSections(hasCurves: boolean): SectionEntry[] {
  return ALL_SECTIONS.filter((s) => s.id !== "strategy-curves" || hasCurves).map((s, i) => ({
    id: s.id,
    key: s.key,
    index: String(i + 1).padStart(2, "0"),
  }));
}
