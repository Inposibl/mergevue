import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveRoutePath } from "../src/routes/routeModel.js";

/**
 * UI-FROG-03 deal-entry validator — evolved in UI-FROG-04A.
 *
 * SUPERSEDED (intentionally removed because UI-FROG-04A authorized real
 * SEC-backed entity resolution on this surface):
 * - prototype capability-note pin
 *   ("public company resolution and public-source analysis are not yet connected")
 * - absence of resolution UI ("Resolved", "ticker")
 *
 * PRESERVED UI-FROG-03 invariants:
 * - same route identity for /start-diagnostic/deal-context
 * - /analyze remains inactive
 * - Acquirer + Target remain the first inputs
 * - no respondent/dealType/motive/economics/questionnaire gate
 * - no direct legacy-flow navigation
 * - downstream diagnostic helpers remain physically preserved
 * - scoped CSS
 * - no fake research/result ("Researching", "Result ready")
 * - Analyze this deal remains unavailable as an action
 */

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");

const appSource = await read("src/App.jsx");
const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
const cssSource = await read("src/styles/public-deal-entry.css");
const flowSource = await read("src/flow/acquirerTrackFlow.js");
const routeModelSource = await read("src/routes/routeModel.js");

const FORBIDDEN_GLOBAL_SELECTORS = [
  /^\s*body\b/m,
  /^\s*h1\b/m,
  /^\s*h2\b/m,
  /^\s*p\b/m,
  /^\s*input\b/m,
  /^\s*button\b/m,
  /^\s*a\b/m,
  /^\s*\.screen\b/m,
  /^\s*\.card\b/m,
];

const dealContext = resolveRoutePath("/start-diagnostic/deal-context");
assert.equal(dealContext.id, "deal-context-acquisition-motive");
assert.equal(dealContext.route, "/start-diagnostic/deal-context");
assert.equal(dealContext.rendererId, "AcquisitionMotiveScreen");
assert.equal(resolveRoutePath("/analyze").isFallback, true, "/analyze must remain inactive");
assert.doesNotMatch(entrySource, /href=["']\/analyze/);
assert.doesNotMatch(routeModelSource, /["']\/analyze["']\s*,\s*\{[^}]*id:\s*["']analyze/);

assert.match(appSource, /function AcquisitionMotiveScreen\(\) \{\s*return <DealEntryScreen \/>;\s*\}/);
assert.match(appSource, /AcquisitionMotiveScreen,/);
assert.match(appSource, /export function attachDealContext|attachDealContext\(/);
assert.match(appSource, /function RefineEvidenceQualityScreen/);
assert.match(appSource, /function TransactionDetailsScreen/);
assert.match(flowSource, /export function attachDealContext/);
assert.match(flowSource, /export function nextRouteForDealStart/);
assert.match(flowSource, /export function attachAcquisitionMotive/);

assert.match(entrySource, />Acquirer</);
assert.match(entrySource, />Target</);
assert.match(entrySource, /placeholder="Company name"/);
assert.match(entrySource, /Confirm companies/);
assert.match(entrySource, /role="status"/);
assert.match(entrySource, /Analyze this deal is not available yet/);
assert.doesNotMatch(entrySource, /Company 1/);
assert.doesNotMatch(entrySource, /Company 2/);
assert.doesNotMatch(entrySource, /respondentSide/);
assert.doesNotMatch(entrySource, /dealType/);
assert.doesNotMatch(entrySource, /acquisitionMotive/);
assert.doesNotMatch(entrySource, /enterpriseValue/);
assert.doesNotMatch(entrySource, /42Q/);
assert.doesNotMatch(entrySource, /attachAcquisitionMotive/);
assert.doesNotMatch(entrySource, /attachDealContext/);
assert.doesNotMatch(entrySource, /navigate\(/);
assert.doesNotMatch(entrySource, /\/analyze/);
assert.match(entrySource, /Swap acquirer and target/);
assert.match(entrySource, /type="button"/);
assert.match(entrySource, /Acquirer and target must be different companies\./);
assert.match(entrySource, /Analyze this deal/);
assert.match(entrySource, /disabled/);
assert.doesNotMatch(entrySource, /Researching/);
assert.doesNotMatch(entrySource, /Result ready/);
assert.doesNotMatch(entrySource, /headquarters/);
assert.doesNotMatch(entrySource, /Public-source research would begin here/);

assert.match(cssSource, /\.mv-deal-entry-/);
for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
  assert.doesNotMatch(cssSource, pattern, `public-deal-entry.css must not restyle ${pattern}`);
}

console.log("UI-FROG-03 deal-entry validation: preserved front-door invariants; prototype resolution-absent pins superseded by UI-FROG-04A");
