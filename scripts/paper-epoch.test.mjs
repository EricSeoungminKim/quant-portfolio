import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Exercise the production adapters directly without a browser or TS runner dependency.
async function loadTypeScript(relativePath) {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { currentPerformance, statsForMarket, activityForMarket } = await loadTypeScript("../src/lib/paperEpoch.ts");
const { translateVerdict } = await loadTypeScript("../src/lib/i18nData.ts");
const published = JSON.parse(readFileSync(new URL("../public/data/performance.json", import.meta.url), "utf8"));

function stats(trips, expectancy = -5, verdict = "유의(음)") {
  return { trips, wins: 0, win_rate: trips ? 0 : null, ci_low: trips ? 0 : null,
    ci_high: trips ? 0.2 : null, expectancy_bp: trips ? expectancy : null,
    verdict: trips ? verdict : "표본 부족", sample_warning: trips < 30 };
}

function fixture() {
  const data = structuredClone(published);
  const account = {
    id: "current", name_ko: "현재", name_en: "Current", enabled: true,
    start_capital: { KRW: 10000000, USD: 10000 },
    total: { ...stats(4, 10, "판단 보류"), markets: ["KR", "US"] },
    by_market: { asia: stats(3, 20, "유의(양)"), us: stats(1, -20, "유의(음)") },
    activity: { total: { trades_per_day: 2, avg_hold_minutes: 30 }, by_market: {
      asia: { trades_per_day: 1.5, avg_hold_minutes: 35 },
      us: { trades_per_day: 0.5, avg_hold_minutes: 15 },
    } },
    curve: {
      asia: [{ date: "2026-09-08", day_native: 20000, cum_native: 20000, trips: 3, cum_pct: 0.2 }],
      us: [{ date: "2026-09-09", day_native: -20, cum_native: -20, trips: 1, cum_pct: -0.2 }],
    },
  };
  const dormant = { ...structuredClone(account), id: "no_trades", name_ko: "미거래", start_capital: { KRW: 10000000 },
    total: { ...stats(0), markets: ["KR"] }, by_market: { asia: stats(0), us: null }, curve: { asia: [], us: [] } };
  data.strategies = [
    { ...structuredClone(account), total: { ...stats(900), markets: ["KR", "US"] }, curve: { asia: [{ date: "2026-08-01", cum_net: -999, day_net: -999, cum_trips: 900 }], us: [] } },
    { ...structuredClone(account), id: "retired", total: { ...stats(400), markets: ["KR"] } },
  ];
  data.paper_epoch = {
    ...data.paper_epoch,
    epoch: "2026-09-07T00:00:00+09:00",
    period: { start: "2026-09-07", end: "2026-09-09", sessions: 2, total_fills: 8 },
    equity_asia: { ...data.equity_asia, seed: 20000000, rows: [{ date: "2026-09-09", cum_pct: 0.1, day_pct: 0.1, fills: 6, phase: "paper_epoch" }] },
    equity_us: { ...data.equity_us, seed: 10000, rows: [{ date: "2026-09-09", cum_pct: -0.2, day_pct: -0.2, fills: 2, phase: "paper_epoch" }] },
    costs: { ...data.costs, fee_drag_pct_of_gross: 12.34 },
    strategies: [account, dormant],
  };
  return data;
}

test("headlines, books, cost evidence and sample share the epoch; original history is preserved", () => {
  const data = fixture();
  const before = structuredClone(data);
  const current = currentPerformance(data);
  assert.deepEqual(data, before);
  assert.equal(current.period, data.paper_epoch.period);
  assert.equal(current.equity_asia, data.paper_epoch.equity_asia);
  assert.equal(current.equity_us, data.paper_epoch.equity_us);
  assert.equal(current.costs.fee_drag_pct_of_gross, 12.34);
  assert.equal(current.strategies.reduce((sum, strategy) => sum + strategy.total.trips, 0), 4);
  assert.match(current.strategies_note_en, /4 round trips/);
  assert.deepEqual(current.phases, []);
  assert.deepEqual(current.prior_paper, {});
});

test("old-only strategies and lifetime points cannot leak into epoch curves or statistics", () => {
  const current = currentPerformance(fixture());
  assert.deepEqual(current.strategies.map((s) => s.id), ["current", "no_trades"]);
  for (const strategy of current.strategies) {
    for (const points of Object.values(strategy.curve)) {
      assert.ok(points.every((point) => point.date >= "2026-09-07"));
    }
  }
  assert.equal(current.strategies[0].curve.asia.at(-1).cum_trips, 3);
});

test("assigned accounts absent from lifetime results remain visible with zero closes and unknown rates", () => {
  const account = currentPerformance(fixture()).strategies.find((s) => s.id === "no_trades");
  assert.equal(account.total.trips, 0);
  assert.equal(account.total.win_rate, null);
  assert.equal(account.total.expectancy_bp, null);
  assert.deepEqual(account.curve.asia, ["2026-09-07", "2026-09-09"].map((date) => ({ date, day_net: 0, cum_net: 0, cum_trips: 0, cum_pct: 0 })));
  assert.deepEqual(account.curve.us, []);
});

test("market filters select their own sample, evidence and activity with no aggregate fallback", () => {
  const strategy = currentPerformance(fixture()).strategies[0];
  assert.equal(statsForMarket(strategy, "KR").trips, 3);
  assert.equal(statsForMarket(strategy, "US").verdict, "유의(음)");
  assert.equal(activityForMarket(strategy, "US").avg_hold_minutes, 15);
  assert.equal(activityForMarket({ ...strategy, activity: undefined }, "US"), null);
  assert.equal(statsForMarket(strategy, "ALL").trips, 4);
});

test("an incomplete epoch snapshot fails closed instead of displaying lifetime data as current", () => {
  for (const field of ["period", "equity_asia", "equity_us", "costs"]) {
    const data = fixture();
    delete data.paper_epoch[field];
    assert.throws(() => currentPerformance(data), /refusing mixed-period/);
  }
  const data = fixture();
  delete data.paper_epoch.strategies[0].total;
  assert.throws(() => currentPerformance(data), /refusing lifetime fallback/);
});

test("legacy snapshots retain their explicit legacy shape when no epoch exists", () => {
  const data = fixture();
  data.paper_epoch = {};
  assert.equal(currentPerformance(data), data);
});

test("statistical verdict labels describe win-rate evidence, never profitability", () => {
  assert.equal(translateVerdict("유의(음)", "en"), "Win-rate CI below 50%");
  assert.equal(translateVerdict("유의(양)", "ko"), "승률 CI > 50%");
  assert.equal(translateVerdict("판단 불가", "en"), "Win-rate CI includes 50%");
  assert.equal(translateVerdict("판단 보류", "en"), "Win-rate CI includes 50%");
  assert.equal(translateVerdict("표본 부족", "en"), "Insufficient sample");
});
