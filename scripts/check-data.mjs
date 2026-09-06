#!/usr/bin/env node
// Build-time data gate — asserts public/data/performance.json isn't obviously
// broken before `next build` reads it (src/lib/data.ts loads it with
// fs.readFileSync at build time, no runtime fetch, so a bad file would bake
// wrong numbers straight into the static export).
//
// Wired as an npm "prebuild" hook (package.json) so `npm run build` — which is
// what Vercel runs — refuses to build on bad data.
//
// This is a lightweight, dependency-free mirror of a subset of the checks in
// the trading repo's `quant.control.performance_contract.validate_payload`
// (the source of truth for the full contract). It can only assert what this
// repo has on hand: types, no NaN/Infinity/null-where-number-required, ISO
// dates, and internal consistency of `enabled`/name fields on strategies that
// are present. It has no access to config/settings.yaml (that lives in the
// other repo), so it cannot check `enabled_count` against the live strategy
// roster or catch a strategy that's enabled but missing entirely — that
// cross-repo check is the trading repo's job.
//
// Exit code 1 on any failure (npm then fails the "prebuild" step, which
// aborts "build" before it starts).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = path.join(ROOT, "public/data/performance.json");
// Tracks the `generated_at` of the last payload that passed this gate, so a
// build can notice its own data going *backwards* in time (a republish that
// silently served a stale/rolled-back file), not just a payload that's
// internally malformed. Committed to git (2026-09-06, Phase 5) so a fresh
// checkout still has a baseline — but note the real limit of this: Vercel's
// build is a fresh `git clone` every time and never commits anything back, so
// this file only advances when a human (or a script with write access to this
// repo) commits it, which won't happen automatically per publish. The
// unconditional freshness check below (`checkGeneratedAtFreshness`, against
// the payload's own latest data date) is what actually runs on every build
// regardless of who last touched this tracker.
const LAST_GOOD_PATH = path.join(ROOT, "scripts/.last-good-data.json");

const errors = [];

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function checkNumber(where, v, { allowNull = false, min = null, max = null } = {}) {
  if (v === null || v === undefined) {
    if (!allowNull) fail(where, "null/undefined이면 안 되는 자리에 숫자가 없음");
    return;
  }
  if (!isFiniteNumber(v)) {
    fail(where, `유한한 숫자가 아님(NaN/Infinity/타입 오류 포함): ${JSON.stringify(v)}`);
    return;
  }
  if (min !== null && v < min) fail(where, `${v} < 허용 최소값 ${min}`);
  if (max !== null && v > max) fail(where, `${v} > 허용 최대값 ${max}`);
}

function checkString(where, v, { allowNull = false, allowEmpty = true } = {}) {
  if (v === null || v === undefined) {
    if (!allowNull) fail(where, "null/undefined이면 안 되는 자리에 문자열이 없음");
    return;
  }
  if (typeof v !== "string") {
    fail(where, `문자열이어야 하는데 ${typeof v}`);
    return;
  }
  if (!allowEmpty && v.trim() === "") fail(where, "빈 문자열");
}

function checkIsoDate(where, v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    fail(where, `ISO 날짜(YYYY-MM-DD) 아님: ${JSON.stringify(v)}`);
  }
}

function checkIsoTimestamp(where, v) {
  if (typeof v !== "string" || Number.isNaN(Date.parse(v))) {
    fail(where, `ISO 타임스탬프 아님: ${JSON.stringify(v)}`);
  }
}

function checkEquityBook(where, book, currency) {
  if (typeof book !== "object" || book === null) {
    fail(where, `object여야 하는데 ${typeof book}`);
    return;
  }
  if (book.currency !== currency) fail(`${where}.currency`, `${currency} 이어야 하는데 ${book.currency}`);
  checkNumber(`${where}.seed`, book.seed, { allowNull: true, min: 0 });
  checkString(`${where}.seed_basis`, book.seed_basis, { allowEmpty: false });
  if (!Array.isArray(book.rows)) {
    fail(`${where}.rows`, `배열이어야 하는데 ${typeof book.rows}`);
  } else {
    let prevDate = null;
    book.rows.forEach((r, i) => {
      const p = `${where}.rows[${i}]`;
      checkIsoDate(`${p}.date`, r.date);
      checkNumber(`${p}.cum_pct`, r.cum_pct, { allowNull: true });
      checkNumber(`${p}.day_pct`, r.day_pct, { allowNull: true });
      checkNumber(`${p}.fills`, r.fills, { min: 0 });
      checkString(`${p}.phase`, r.phase, { allowEmpty: false });
      if (typeof r.date === "string" && prevDate !== null && r.date <= prevDate) {
        fail(`${p}.date`, `날짜가 역순/중복: ${r.date} <= ${prevDate}`);
      }
      if (typeof r.date === "string") prevDate = r.date;
    });
  }
  if (typeof book.chart !== "object" || book.chart === null) {
    fail(`${where}.chart`, "필수 키 없음");
  } else if (typeof book.chart.y_axis !== "object" || book.chart.y_axis === null) {
    fail(`${where}.chart.y_axis`, "필수 키 없음");
  }
}

function checkMarketStats(where, stats) {
  if (stats === null) return; // by_market.{asia,us}는 null 허용
  if (typeof stats !== "object") {
    fail(where, `object여야 하는데 ${typeof stats}`);
    return;
  }
  checkNumber(`${where}.trips`, stats.trips, { min: 0 });
  checkNumber(`${where}.wins`, stats.wins, { min: 0 });
  checkNumber(`${where}.win_rate`, stats.win_rate, { min: 0, max: 1 });
  checkNumber(`${where}.ci_low`, stats.ci_low, { min: 0, max: 1 });
  checkNumber(`${where}.ci_high`, stats.ci_high, { min: 0, max: 1 });
  checkString(`${where}.verdict`, stats.verdict, { allowEmpty: false });
  if (typeof stats.sample_warning !== "boolean") fail(`${where}.sample_warning`, "bool이어야 함");
  if (isFiniteNumber(stats.trips) && isFiniteNumber(stats.wins) && stats.wins > stats.trips) {
    fail(`${where}.wins`, `wins(${stats.wins}) > trips(${stats.trips})`);
  }
}

function checkStrategies(strategies) {
  if (!Array.isArray(strategies)) {
    fail("strategies", `배열이어야 하는데 ${typeof strategies}`);
    return;
  }
  const seenIds = new Set();
  strategies.forEach((s, i) => {
    const where = `strategies[${i}]`;
    if (typeof s !== "object" || s === null) {
      fail(where, "object가 아님");
      return;
    }
    checkString(`${where}.id`, s.id, { allowEmpty: false });
    if (typeof s.id === "string") {
      if (seenIds.has(s.id)) fail(`${where}.id`, `중복 전략 id: ${s.id}`);
      seenIds.add(s.id);
    }
    // "활성 전략 표시" 불변식 — enabled: true인 항목은 반드시 표시 가능해야
    // 한다(빈/누락 이름으로 사이트에 정체불명의 행이 뜨면 안 된다).
    if (s.enabled === true) {
      if (typeof s.name_ko !== "string" || s.name_ko.trim() === "") {
        fail(`${where}.name_ko`, "활성 전략인데 한글 표시명이 없음");
      }
      if (s.name_en !== undefined && (typeof s.name_en !== "string" || s.name_en.trim() === "")) {
        fail(`${where}.name_en`, "활성 전략인데 영문 표시명이 빈 문자열");
      }
    } else {
      checkString(`${where}.name_ko`, s.name_ko, { allowEmpty: false });
    }
    if (typeof s.total !== "object" || s.total === null) {
      fail(`${where}.total`, "필수 키 없음");
    } else {
      checkMarketStats(`${where}.total`, s.total);
      if (!Array.isArray(s.total.markets)) fail(`${where}.total.markets`, "배열이어야 함");
    }
    if (typeof s.by_market !== "object" || s.by_market === null) {
      fail(`${where}.by_market`, "필수 키 없음");
    } else {
      checkMarketStats(`${where}.by_market.asia`, s.by_market.asia);
      checkMarketStats(`${where}.by_market.us`, s.by_market.us);
    }
  });
}

function checkPaperEpoch(pe) {
  if (pe === undefined || pe === null) return; // 선택 필드
  if (typeof pe !== "object") {
    fail("paper_epoch", `object여야 하는데 ${typeof pe}`);
    return;
  }
  if (Object.keys(pe).length === 0) return; // {} — 유효한 값(착륙 전/에폭 미도래)
  checkIsoTimestamp("paper_epoch.epoch", pe.epoch);
  if (!Array.isArray(pe.strategies)) {
    fail("paper_epoch.strategies", "배열이어야 함");
    return;
  }
  pe.strategies.forEach((s, i) => {
    const where = `paper_epoch.strategies[${i}]`;
    const sc = s?.start_capital;
    if (typeof sc !== "object" || sc === null || Object.keys(sc).length === 0) {
      fail(`${where}.start_capital`, "paper_epoch가 있으면 전략마다 시작자본이 있어야 함");
      return;
    }
    if ("KRW" in sc) checkNumber(`${where}.start_capital.KRW`, sc.KRW, { min: 0 });
    if ("USD" in sc) checkNumber(`${where}.start_capital.USD`, sc.USD, { min: 0 });

    // Curve continuity since the epoch (2026-09-06, Phase 5 live-readiness) —
    // `checkPaperEpoch` previously stopped at start_capital and never looked
    // at `curve` at all, so a generator bug that dropped or duplicated a
    // day's row here would sail straight into the static export undetected.
    const curve = s?.curve;
    if (curve && typeof curve === "object") {
      for (const book of ["asia", "us"]) {
        checkEpochCurveContinuity(`${where}.curve.${book}`, curve[book]);
      }
    }
  });
}

// A strategy's since-epoch curve (`paper_epoch.strategies[].curve.{asia,us}`)
// is a running total: each row's `cum_native` should be the previous row's
// `cum_native` plus this row's `day_native`. That invariant is what "no gaps,
// no dropped/duplicated days" actually cashes out to for a cumulative
// series — checking date order alone would miss a row whose `day_native` got
// zeroed out or double-counted while the date sequence stayed intact.
const CONTINUITY_EPSILON = 0.01; // native-currency cents; rounding only, not a real break

function checkEpochCurveContinuity(where, points) {
  if (points === undefined) return; // optional key, absence checked elsewhere
  if (!Array.isArray(points)) {
    fail(where, `배열이어야 하는데 ${typeof points}`);
    return;
  }
  let prevDate = null;
  let runningSum = 0;
  points.forEach((p, i) => {
    const ppath = `${where}[${i}]`;
    if (typeof p !== "object" || p === null) {
      fail(ppath, "object가 아님");
      return;
    }
    checkIsoDate(`${ppath}.date`, p.date);
    if (typeof p.date === "string" && prevDate !== null && p.date <= prevDate) {
      fail(`${ppath}.date`, `날짜가 역순/중복 — 곡선 연속성 깨짐: ${p.date} <= ${prevDate}`);
    }
    if (typeof p.date === "string") prevDate = p.date;

    checkNumber(`${ppath}.day_native`, p.day_native);
    checkNumber(`${ppath}.cum_native`, p.cum_native);
    checkNumber(`${ppath}.trips`, p.trips, { min: 0 });

    if (isFiniteNumber(p.day_native) && isFiniteNumber(p.cum_native)) {
      runningSum += p.day_native;
      if (Math.abs(runningSum - p.cum_native) > CONTINUITY_EPSILON) {
        fail(
          `${ppath}.cum_native`,
          `누적값이 day_native 합과 어긋남(끊긴 날짜 의심): 누적합계=${runningSum}, cum_native=${p.cum_native}`
        );
        // Resync so one bad row doesn't cascade into a false positive on
        // every row after it.
        runningSum = p.cum_native;
      }
    }
  });
}

// `generated_at` must not predate the data it is reporting on — the latest
// date appearing anywhere in the payload's own curves. This needs no external
// state (works identically on a fresh Vercel clone, local dev, or CI) and
// catches the concrete failure mode of a stale/rolled-back payload being
// re-served with an unrelated (e.g. cached, or clock-skewed) timestamp.
function latestDataDate(data) {
  const candidates = [
    data?.period?.end,
    lastRowDate(data?.equity_asia?.rows),
    lastRowDate(data?.equity_us?.rows),
    lastRowDate(data?.paper_epoch?.overall?.rows),
  ].filter((d) => typeof d === "string" && d !== "");
  if (candidates.length === 0) return null;
  return candidates.sort().at(-1); // ISO YYYY-MM-DD sorts lexicographically
}

function lastRowDate(rows) {
  return Array.isArray(rows) && rows.length > 0 ? rows.at(-1)?.date : undefined;
}

function kstDateString(isoTimestamp) {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
}

function checkGeneratedAtFreshness(data) {
  if (typeof data.generated_at !== "string") return; // type error already reported
  const anchor = latestDataDate(data);
  if (!anchor) return; // nothing to compare against
  const generatedDate = kstDateString(data.generated_at);
  if (!generatedDate) return; // invalid timestamp already reported
  if (generatedDate < anchor) {
    fail(
      "generated_at",
      `생성 시각(${generatedDate}, KST)이 데이터의 최신 날짜(${anchor})보다 과거 — 갱신되지 않았거나 되돌아간 파일 의심`
    );
  }
}

// Best-effort cross-build regression check — see the LAST_GOOD_PATH comment
// above for why this only advances when someone commits it, and why
// `checkGeneratedAtFreshness` above (not this) is the check that actually
// runs unconditionally on every build. Missing/corrupt tracker file is a
// first-run/no-op, never a failure.
function checkGeneratedAtNotRegressed(data) {
  let lastGood;
  try {
    lastGood = JSON.parse(readFileSync(LAST_GOOD_PATH, "utf-8"));
  } catch {
    return;
  }
  if (typeof lastGood?.generated_at !== "string") return;
  const prev = Date.parse(lastGood.generated_at);
  const curr = Date.parse(data.generated_at);
  if (Number.isNaN(prev) || Number.isNaN(curr)) return;
  if (curr < prev) {
    fail(
      "generated_at",
      `마지막으로 통과한 빌드(${lastGood.generated_at})보다 과거 — 데이터가 되돌아감(롤백/유실 의심)`
    );
  }
}

function updateLastGood(data) {
  if (typeof data.generated_at !== "string") return;
  try {
    writeFileSync(LAST_GOOD_PATH, JSON.stringify({ generated_at: data.generated_at }, null, 2) + "\n", "utf-8");
  } catch {
    // Best-effort only — a write failure here must never fail the build.
  }
}

function main() {
  let raw;
  try {
    raw = readFileSync(DATA_PATH, "utf-8");
  } catch (e) {
    console.error(`[check-data] 파일을 읽을 수 없음: ${DATA_PATH} (${e.message})`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`[check-data] JSON 파싱 실패: ${e.message}`);
    process.exit(1);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    console.error("[check-data] 최상위가 object가 아님");
    process.exit(1);
  }

  checkString("generated_at", data.generated_at, { allowEmpty: false });
  if (typeof data.generated_at === "string") checkIsoTimestamp("generated_at", data.generated_at);
  checkString("disclaimer", data.disclaimer, { allowEmpty: false });

  if (typeof data.period !== "object" || data.period === null) {
    fail("period", "필수 키 없음");
  } else {
    checkNumber("period.sessions", data.period.sessions, { min: 0 });
    checkNumber("period.total_fills", data.period.total_fills, { min: 0 });
  }

  if (!Array.isArray(data.phases)) fail("phases", "배열이어야 함");

  checkEquityBook("equity_asia", data.equity_asia, "KRW");
  checkEquityBook("equity_us", data.equity_us, "USD");

  checkStrategies(data.strategies);

  if (typeof data.excluded !== "object" || data.excluded === null) fail("excluded", "필수 키 없음");
  if (typeof data.costs !== "object" || data.costs === null) {
    fail("costs", "필수 키 없음");
  } else {
    checkNumber("costs.kr_stock_roundtrip_bp", data.costs.kr_stock_roundtrip_bp, { min: 0 });
    checkNumber("costs.us_roundtrip_bp", data.costs.us_roundtrip_bp, { min: 0 });
  }

  if (data.enabled_count !== undefined) {
    checkNumber("enabled_count", data.enabled_count, { min: 0 });
  }

  checkPaperEpoch(data.paper_epoch);
  checkGeneratedAtFreshness(data);
  checkGeneratedAtNotRegressed(data);

  if (errors.length > 0) {
    console.error(`[check-data] ${DATA_PATH} 검증 실패 — ${errors.length}건:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  updateLastGood(data);
  console.log(`[check-data] OK — ${DATA_PATH} (전략 ${data.strategies?.length ?? 0}개)`);
}

main();
