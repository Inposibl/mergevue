import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const BLOCK_LABELS = MERGEVUE_PUBLIC_REPORT_BLOCKS;

const REQUIRED_OUTPUT_STRINGS = Object.freeze([
  "Mergevue",
  "Post-Deal Behavior Forecast",
  "report@mergevue.com",
  "Sealed Prediction Preview",
  "Display-only preview; not ledger-recorded.",
  "Enterprise value band: $50M–$500M EV",
  "The main risk is not direct resource conflict. It is overwrite risk: the acquirer may simplify or underuse the target’s more structured operating system, causing institutional knowledge and planning discipline to decay after close.",
  "before Day 30",
  "Days 30–60",
  "Day 60",
  "Absorb / neutralize a competitor",
]);

const FORBIDDEN_SCREEN_STRINGS = Object.freeze([
  "Structural Typology",
  "Academy of Structural Typology",
  "structural-typology.com",
  "structural-typology.academy",
  "info@structural-typology.academy",
  "Forward-verifiable · on record",
  "lodged against public ledger",
  "timestamped against public ledger",
  "USD 50.0B",
  "USD 350M to USD 2.2B",
  "Total Risk Envelope",
  "Indicative Total Risk Envelope",
  "hard risk envelope",
  "absolute loss range",
  "Kill a Competitor",
  "McDonalds",
]);

function score(primaryEnvironmentCode) {
  return Object.freeze({
    valid: true,
    primaryEnvironmentCode,
    topEnvironmentCode: primaryEnvironmentCode,
    signalStrength: "confirmed",
    confidence: "high",
    missingQuestionIds: Object.freeze([]),
    effectiveAnswerCount: 10,
    totalEvidenceWeight: 10,
    questionResponses: Object.freeze([]),
  });
}

function demoSession() {
  return Object.freeze({
    sessionId: "mergevue-screen-smoke",
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze({
        acquirerName: "McDonalds Ventures",
        targetName: "Target Operating Co",
        dealType: "competitor_absorption",
        respondentSide: "acquirer",
        respondentRole: "integration_lead",
        respondentSeniority: "executive",
        respondentFunction: "Integration",
        respondentAccessLevel: "diligence_and_integration",
      }),
    }),
    acquirer2A: Object.freeze({
      completed: true,
      score: score("NF/NT"),
    }),
    target2B: Object.freeze({
      completed: true,
      finalScore: score("NT/STJ"),
    }),
    targetSelfAssessment: Object.freeze({
      completed: true,
      score: score("NT/STJ"),
    }),
    targetSelfDirect: Object.freeze({
      completed: true,
    }),
    targetObservation: Object.freeze({
      completed: true,
      score: score("NT/STJ"),
    }),
  });
}

function screenTextForModel(model) {
  const parts = [
    model.brand.name,
    model.brand.product,
    model.brand.reportType,
    model.brand.contactEmail,
  ];

  const pushObject = (value) => {
    if (Array.isArray(value)) {
      value.forEach(pushObject);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(pushObject);
      return;
    }
    if (value !== null && value !== undefined) parts.push(String(value));
  };

  for (const label of BLOCK_LABELS) parts.push(label);
  pushObject(model.executiveDecisionSummary);
  pushObject(model.sealedPredictions);
  pushObject(model.compatibilityScoreAndDealScenario);
  pushObject(model.theTwoEnvironments);
  pushObject(model.collisionThesis);
  pushObject(model.resourceConflictMap);
  pushObject(model.timelineOfExpectedFriction);
  pushObject(model.economicRiskTranslation);
  pushObject(model.recommendedActions);
  pushObject(model.evidenceBasisAndLimits);
  pushObject(model.whatTheFullEngagementAdds);
  pushObject(model.auditFooter);

  return parts.join("\n");
}

function functionSource(name, nextName) {
  const start = APP_SOURCE.indexOf(`function ${name}`);
  assert.ok(start >= 0, `Missing function ${name}`);
  const end = nextName ? APP_SOURCE.indexOf(`function ${nextName}`, start + 1) : APP_SOURCE.length;
  assert.ok(end > start, `Missing end marker for ${name}`);
  return APP_SOURCE.slice(start, end);
}

assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportModel")
    && APP_SOURCE.includes('"./reporting/mergevuePublicReportModel.js"'),
  "App.jsx must import the Mergevue public report model builder",
);
assert.ok(
  (APP_SOURCE.match(/buildMergevuePublicReportModel\(session, \{ deliverable \}\)/g) ?? []).length >= 2,
  "Both reveal screens must build the visible report from the Mergevue adapter",
);
assert.equal(
  APP_SOURCE.includes("<TalkToUsParagraphs text={deliverable.cta} />"),
  false,
  "Visible report CTA must not render legacy deliverable CTA text",
);

const screenSource = [
  functionSource("ForecastLedPublicReport", "HeterogeneousRevealScreen"),
  functionSource("HeterogeneousRevealScreen", "HomogeneousRevealScreen"),
  functionSource("HomogeneousRevealScreen", null).split("const MERGEVUE_FORECAST_BRIEF_PDF_FILE_NAME")[0],
].join("\n");

for (const label of BLOCK_LABELS) {
  assert.ok(
    APP_SOURCE.includes(label) || screenSource.includes("MERGEVUE_PUBLIC_REPORT_BLOCKS"),
    `Block label missing from screen source path: ${label}`,
  );
}

for (const forbidden of FORBIDDEN_SCREEN_STRINGS) {
  assert.equal(screenSource.includes(forbidden), false, `Forbidden string found in on-screen report source: ${forbidden}`);
}

const model = buildMergevuePublicReportModel(demoSession(), {
  generatedAt: "2026-05-30T00:00:00.000Z",
});
const screenText = screenTextForModel(model);

let previousIndex = -1;
for (const label of BLOCK_LABELS) {
  const index = screenText.indexOf(label);
  assert.ok(index > previousIndex, `Rendered block label missing or out of order: ${label}`);
  previousIndex = index;
}

for (const required of REQUIRED_OUTPUT_STRINGS) {
  assert.ok(screenText.includes(required), `Required screen output missing: ${required}`);
}

for (const forbidden of FORBIDDEN_SCREEN_STRINGS) {
  assert.equal(screenText.includes(forbidden), false, `Forbidden string found in rendered screen text: ${forbidden}`);
}

assert.ok(screenText.includes("McDonald's"), "Company name should normalize to McDonald's");

console.log("Mergevue public report screen validation passed");
