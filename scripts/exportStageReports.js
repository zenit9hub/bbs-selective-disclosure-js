import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stageRoadmap } from "../tests/support/learningArtifacts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportDir = path.resolve(__dirname, "..", "reports");
const reportPath = path.join(reportDir, "stage-report.json");

const mochaArgs = ["mocha", "tests/**/*.test.js", "--reporter", "json"];

const env = {
  ...process.env,
  STAGE_LOG_MODE: "silent",
};

const result = spawnSync("npx", mochaArgs, {
  encoding: "utf-8",
  env,
  stdio: ["inherit", "pipe", "inherit"],
});

if (result.status !== 0) {
  console.error("❌ Failed to execute tests for export.");
  process.exit(result.status ?? 1);
}

let jsonReport;
try {
  jsonReport = JSON.parse(result.stdout);
} catch (err) {
  console.error("❌ Unable to parse Mocha JSON output.");
  if (result.stdout) {
    console.error(result.stdout);
  }
  console.error(err);
  process.exit(1);
}

const stageMetaMap = new Map(
  stageRoadmap.map((stage) => [stage.id, stage])
);

const stageSummaries = new Map();

const tests = jsonReport.tests ?? [];
const passSet = new Set(
  (jsonReport.passes ?? []).map((test) => test.fullTitle)
);
const failMap = new Map(
  (jsonReport.failures ?? []).map((test) => [
    test.fullTitle,
    test.err?.message ?? null,
  ])
);

tests.forEach((test) => {
  if (!test.fullTitle || !test.title) return;
  if (!test.fullTitle.startsWith("Stage")) return;

  const stageTitle = test.fullTitle.slice(
    0,
    test.fullTitle.length - test.title.length - 1
  );
  const stageId = stageTitle.split(" – ")[0];

  if (!stageSummaries.has(stageId)) {
    stageSummaries.set(stageId, {
      id: stageId,
      title: stageTitle,
      totalTests: 0,
      passes: 0,
      failures: 0,
      duration: 0,
      tests: [],
    });
  }

  const summary = stageSummaries.get(stageId);
  let state = "unknown";
  if (passSet.has(test.fullTitle)) state = "passed";
  else if (failMap.has(test.fullTitle)) state = "failed";
  else if (test.state) state = test.state;

  summary.totalTests += 1;
  if (state === "passed") {
    summary.passes += 1;
  } else if (state === "failed") {
    summary.failures += 1;
  }
  summary.duration += test.duration ?? 0;
  summary.tests.push({
    title: test.title,
    fullTitle: test.fullTitle,
    duration: test.duration ?? 0,
    state,
    error: failMap.get(test.fullTitle) ?? null,
  });
});

mkdirSync(reportDir, { recursive: true });

const stageOrder = new Map(
  stageRoadmap.map((stage, index) => [stage.id, index])
);

const stages = Array.from(stageSummaries.values())
  .map((summary) => {
    const meta = stageMetaMap.get(summary.id);
    return {
      ...summary,
      goal: meta?.goal ?? null,
      keyChecks: meta?.keyChecks ?? [],
    };
  })
  .sort(
    (a, b) =>
      (stageOrder.get(a.id) ?? Number.POSITIVE_INFINITY) -
      (stageOrder.get(b.id) ?? Number.POSITIVE_INFINITY)
  );

const aggregate = {
  generatedAt: new Date().toISOString(),
  totals: {
    stages: stages.length,
    tests: stages.reduce((acc, stage) => acc + stage.totalTests, 0),
    passes: stages.reduce((acc, stage) => acc + stage.passes, 0),
    failures: stages.reduce((acc, stage) => acc + stage.failures, 0),
    duration: stages.reduce((acc, stage) => acc + stage.duration, 0),
  },
  stages,
};

writeFileSync(reportPath, JSON.stringify(aggregate, null, 2), "utf-8");

console.log(`✅ Stage report written to ${path.relative(process.cwd(), reportPath)}`);
