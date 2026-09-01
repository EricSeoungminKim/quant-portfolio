import fs from "node:fs";
import path from "node:path";
import type { PerformanceData } from "@/types/performance";

// Read once at build time (this module only runs during static
// generation) — no runtime fetch, no exposed endpoints. The data
// pipeline that owns this repo overwrites public/data/performance.json;
// this module only trusts the contract in src/types/performance.ts.
const raw = fs.readFileSync(
  path.join(process.cwd(), "public/data/performance.json"),
  "utf-8"
);

export const performance: PerformanceData = JSON.parse(raw) as PerformanceData;
