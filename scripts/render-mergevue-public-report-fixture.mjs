import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";
import {
  buildMergevueForecastBriefDesignModel,
  renderMergevueForecastBriefHtml,
} from "../src/reporting/mergevueForecastBriefDesignRenderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function readArg(name, fallback) {
  const prefix = `${name}=`;
  const value = process.argv.find((argument) => argument.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

function boolArg(name) {
  return process.argv.includes(name);
}

const inputPath = path.resolve(
  repoRoot,
  readArg(
    "--input",
    "fixtures/mergevue-public-report/mergevue-hidden-user-answers.json",
  ),
);

const outputDir = path.resolve(
  repoRoot,
  readArg(
    "--out",
    "tmp/mergevue-public-report-fixture",
  ),
);

const generatedAt = readArg("--generated-at", "2026-06-13T00:00:00.000Z");
const writeDebug = !boolArg("--no-debug-json");

const fixture = JSON.parse(readFileSync(inputPath, "utf8"));

assert.ok(fixture && typeof fixture === "object", "Fixture must be a JSON object.");
assert.ok(fixture.session && typeof fixture.session === "object", "Fixture must contain a session object.");
assert.ok(fixture.deliverable && typeof fixture.deliverable === "object", "Fixture must contain a deliverable object.");
assert.ok(fixture.session.dealContext?.data, "Fixture session must contain dealContext.data.");
assert.ok(fixture.deliverable.acquirerEnvironmentCode, "Fixture deliverable must contain acquirerEnvironmentCode.");
assert.ok(fixture.deliverable.targetEnvironmentCode, "Fixture deliverable must contain targetEnvironmentCode.");

const reportModel = buildMergevuePublicReportModel(fixture.session, {
  deliverable: fixture.deliverable,
  generatedAt,
});

const designModel = buildMergevueForecastBriefDesignModel(reportModel);
const html = renderMergevueForecastBriefHtml(designModel);

mkdirSync(outputDir, { recursive: true });

const htmlPath = path.join(outputDir, "report.html");
const modelPath = path.join(outputDir, "model.json");
const designModelPath = path.join(outputDir, "design-model.json");
const summaryPath = path.join(outputDir, "summary.json");

writeFileSync(htmlPath, html, "utf8");

if (writeDebug) {
  writeFileSync(modelPath, JSON.stringify(reportModel, null, 2), "utf8");
  writeFileSync(designModelPath, JSON.stringify(designModel, null, 2), "utf8");
}

const pageCount = (html.match(/<div class="page\b/g) ?? []).length;
const predictionSection = designModel.sections.find((section) => section.id === "predictions");
const summary = {
  generatedAt,
  inputPath,
  outputDir,
  htmlPath,
  modelPath: writeDebug ? modelPath : null,
  designModelPath: writeDebug ? designModelPath : null,
  pageCount,
  fileName: designModel.fileName,
  deal: {
    acquirerName: reportModel.compatibilityScoreAndDealScenario?.acquirerName ?? null,
    targetName: reportModel.compatibilityScoreAndDealScenario?.targetName ?? null,
    dealType: reportModel.compatibilityScoreAndDealScenario?.dealType ?? null,
    enterpriseValue: fixture.session.dealContext?.data?.enterpriseValue ?? null,
    enterpriseValueCurrency: fixture.session.dealContext?.data?.enterpriseValueCurrency ?? null,
  },
  pair: {
    acquirerEnvironmentCode: fixture.deliverable.acquirerEnvironmentCode,
    targetEnvironmentCode: fixture.deliverable.targetEnvironmentCode,
    compatibilityScore: fixture.deliverable.compatibilityScore,
    riskBand: fixture.deliverable.riskBand,
    screen: fixture.deliverable.screen,
  },
  predictions: Array.isArray(predictionSection?.predictions)
    ? predictionSection.predictions.map((prediction) => ({
        id: prediction.id,
        windowLabel: prediction.windowLabel,
        title: prediction.title,
        actionTitle: prediction.actionTitle,
      }))
    : [],
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");

const plainText = html
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ")
  .trim();

assert.equal(pageCount, 7, `Expected 7 rendered pages, received ${pageCount}.`);
assert.ok(plainText.includes("Watch & Control Timeline"), "Rendered HTML must include Watch & Control Timeline.");
assert.ok(plainText.includes("WATCHPOINT 01"), "Rendered HTML must include WATCHPOINT 01.");
assert.ok(plainText.includes("WATCHPOINT 02"), "Rendered HTML must include WATCHPOINT 02.");
assert.ok(plainText.includes("WATCHPOINT 03"), "Rendered HTML must include WATCHPOINT 03.");

console.log("Mergevue public report fixture rendered.");
console.log(`Input: ${inputPath}`);
console.log(`Output: ${outputDir}`);
console.log(`HTML: ${htmlPath}`);
console.log(`Summary: ${summaryPath}`);
console.log(`Pages: ${pageCount}`);
console.log(`Pair: ${summary.pair.acquirerEnvironmentCode} -> ${summary.pair.targetEnvironmentCode}`);
console.log(`ECS: ${summary.pair.compatibilityScore}`);
console.log(`Risk band: ${summary.pair.riskBand}`);
