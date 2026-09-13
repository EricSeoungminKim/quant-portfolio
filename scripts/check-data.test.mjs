import assert from "node:assert/strict";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const published = JSON.parse(readFileSync(path.join(ROOT, "public/data/performance.json"), "utf8"));

function checkPayload(data) {
  const root = mkdtempSync(path.join(tmpdir(), "portfolio-gate-"));
  try {
    mkdirSync(path.join(root, "scripts"));
    mkdirSync(path.join(root, "public/data"), { recursive: true });
    copyFileSync(path.join(ROOT, "scripts/check-data.mjs"), path.join(root, "scripts/check-data.mjs"));
    writeFileSync(path.join(root, "public/data/performance.json"), JSON.stringify(data));
    return spawnSync(process.execPath, [path.join(root, "scripts/check-data.mjs")], { encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withCurve(points) {
  const data = structuredClone(published);
  data.paper_epoch.strategies = [{
    id: "rounding_fixture", start_capital: { KRW: 10000000 },
    curve: { asia: points, us: [] },
  }];
  return data;
}

function point(day, daily, cumulative) {
  return { date: `2026-08-${String(day).padStart(2, "0")}`, day_native: daily, cum_native: cumulative, trips: 1 };
}

test("published payload passes without changing its values", () => {
  const result = checkPayload(published);
  assert.equal(result.status, 0, result.stderr);
});

test("one-cent rounding boundary survives binary floating-point error in both signs", () => {
  for (const [first, daily, cumulative] of [[0.03, 0.29, 0.31], [-20.1, -31.2, -51.31], [-552274.39, 0, -552274.38]]) {
    const result = checkPayload(withCurve([point(1, first, first), point(2, daily, cumulative)]));
    assert.equal(result.status, 0, result.stderr);
  }
});

test("independently rounded daily and raw cumulative values do not accumulate rounding drift", () => {
  // Generator contract: daily raw P&L = 0.334; day and raw cumulative are each rounded to 2 places.
  const points = Array.from({ length: 20 }, (_, i) => point(i + 1, 0.33, Math.round((i + 1) * 0.334 * 100) / 100));
  const result = checkPayload(withCurve(points));
  assert.equal(result.status, 0, result.stderr);
});

test("differences beyond one cent remain errors, including a sub-cent amount above the boundary", () => {
  for (const delta of [0.0101, -0.0101, 0.02, -0.02, 1]) {
    const result = checkPayload(withCurve([point(1, 0.03, 0.03), point(2, 0.29, 0.32 + delta)]));
    assert.equal(result.status, 1, `delta=${delta}\n${result.stdout}`);
    assert.match(result.stderr, /curve\.asia\[1\]\.cum_native/);
  }
});

test("a dropped nonzero day and a duplicated day remain errors", () => {
  const points = [point(1, 10, 10), point(2, 20, 30), point(3, -5, 25)];
  for (const corrupted of [[points[0], points[2]], [points[0], points[1], points[1], points[2]]]) {
    const result = checkPayload(withCurve(corrupted));
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stderr, /곡선 연속성|cum_native/);
  }
});
