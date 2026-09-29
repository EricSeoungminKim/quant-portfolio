import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/researchFocus.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
const { researchFocus } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

function fixture() {
  return { paper_epoch: { epoch: "2026-09-07T00:00:00+09:00", period: { end: "2026-09-29" }, strategies: [{
    id: "vol_breakout_cat", enabled: true, start_capital: { KRW: 1000, USD: 100 },
    total: { trips: 999 }, by_market: { asia: { trips: 3, expectancy_bp: 12 }, us: { trips: 996, expectancy_bp: -500 } },
    curve: { asia: [
      { date: "2026-09-08", cum_native: -100, day_native: -100, cum_pct: -10, trips: 1 },
      { date: "2026-09-09", cum_native: 200, day_native: 300, cum_pct: 20, trips: 1 },
      { date: "2026-09-10", cum_native: 80, day_native: -120, cum_pct: 8, trips: 1 },
    ], us: [{ date: "2026-09-10", cum_native: -99, cum_pct: -99 }] },
  }] }, strategies: [{ id: "vol_breakout_cat", total: { trips: 3000 } }] };
}

test("focus uses the KR epoch book only, leaves history intact, and never invents a transition baseline", () => {
  const data = fixture();
  const before = structuredClone(data);
  const focus = researchFocus(data);
  assert.equal(focus.stats.trips, 3);
  assert.equal(focus.stats.expectancy_bp, 12);
  assert.equal(focus.netKrw, 80);
  assert.equal(focus.returnPct, 8);
  assert.equal(focus.maxDrawdownPct, 10);
  assert.equal(focus.start, "2026-09-07");
  assert.equal(focus.end, "2026-09-29");
  assert.deepEqual(data, before);
});

test("initial losses count toward MDD and recovering from a peak uses current equity", () => {
  const data = fixture();
  data.paper_epoch.strategies[0].curve.asia[0].cum_native = -150;
  assert.equal(researchFocus(data).maxDrawdownPct, 15);
});

test("missing KR account or epoch never falls back to lifetime or US", () => {
  const data = fixture();
  delete data.paper_epoch.strategies[0].start_capital.KRW;
  assert.equal(researchFocus(data), null);
  delete data.paper_epoch;
  assert.equal(researchFocus(data), null);
});

test("absent curve remains unmeasured when completed trips exist", () => {
  const data = fixture();
  data.paper_epoch.strategies[0].curve.asia = [];
  const focus = researchFocus(data);
  assert.equal(focus.returnPct, null);
  assert.equal(focus.netKrw, null);
  assert.equal(focus.maxDrawdownPct, null);
});
