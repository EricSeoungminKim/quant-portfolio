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

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA_PATH = path.join(ROOT, "public/data/performance.json");

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
  });
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

  if (errors.length > 0) {
    console.error(`[check-data] ${DATA_PATH} 검증 실패 — ${errors.length}건:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`[check-data] OK — ${DATA_PATH} (전략 ${data.strategies?.length ?? 0}개)`);
}

main();
