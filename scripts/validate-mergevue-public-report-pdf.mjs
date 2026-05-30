import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
  buildMergevuePublicReportModel,
  buildMergevuePublicReportPdfTextModel,
} from "../src/reporting/mergevuePublicReportModel.js";

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const REQUIRED_PDF_STRINGS = Object.freeze([
  "Mergevue",
  "Post-Deal Behavior Forecast",
  "Forecast Brief",
  "report@mergevue.com",
  "Sealed Prediction Preview",
  "Display-only preview; not ledger-recorded.",
  "Enterprise value band: $50M–$500M EV",
  "Illustrative posture, not a valuation.",
  "Absolute risk figures require the engagement-tier economic model.",
  "The main risk is not direct resource conflict. It is overwrite risk: the acquirer may simplify or underuse the target’s more structured operating system, causing institutional knowledge and planning discipline to decay after close.",
  "before Day 30",
  "Days 30–60",
  "Day 60",
  "Absorb / neutralize a competitor",
]);

const FORBIDDEN_PDF_STRINGS = Object.freeze([
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
  "structural-typology-final-deliverables-report",
]);

function score(primaryEnvironmentCode, overrides = {}) {
  return Object.freeze({
    valid: true,
    primaryEnvironmentCode,
    topEnvironmentCode: primaryEnvironmentCode,
    signalStrength: overrides.signalStrength ?? "confirmed",
    confidence: overrides.confidence ?? "high",
    missingQuestionIds: Object.freeze([]),
    effectiveAnswerCount: overrides.effectiveAnswerCount ?? 12,
    totalEvidenceWeight: overrides.totalEvidenceWeight ?? 12,
    evidenceQuality: Object.freeze({
      confidence: overrides.confidence ?? "high",
      directObservationCount: overrides.directObservationCount ?? 8,
      documentSupportedCount: overrides.documentSupportedCount ?? 3,
      evidenceSupportedShare: overrides.evidenceSupportedShare ?? 0.9,
      reliabilityFlagCount: overrides.reliabilityFlagCount ?? 0,
      reliabilityFlagRate: overrides.reliabilityFlagRate ?? 0,
    }),
    questionResponses: Object.freeze([]),
  });
}

const demoSession = Object.freeze({
  sessionId: "mergevue-public-report-pdf-smoke",
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
      enterpriseValue: 500000000,
      enterpriseValueCurrency: "USD",
      enterpriseValueStatus: "estimated",
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
    score: score("NT/STJ", { confidence: "medium" }),
  }),
  targetSelfDirect: Object.freeze({
    completed: true,
  }),
  targetObservation: Object.freeze({
    completed: true,
    score: score("NT/STJ", { directObservationCount: 6 }),
  }),
});

const model = buildMergevuePublicReportModel(demoSession, {
  generatedAt: "2026-05-30T00:00:00.000Z",
});
const pdfTextModel = buildMergevuePublicReportPdfTextModel(model);

assert.equal(pdfTextModel.fileName, MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME);
assert.equal(pdfTextModel.fileName, "mergevue-forecast-brief.pdf");
assert.equal(pdfTextModel.fileName.includes("structural-typology-final-deliverables-report"), false);
assert.deepEqual(pdfTextModel.sections.map((section) => section.title), MERGEVUE_PUBLIC_REPORT_BLOCKS);

const pdfText = [
  pdfTextModel.fileName,
  ...pdfTextModel.cover,
  ...pdfTextModel.sections.flatMap((section) => [section.title, ...section.lines]),
].join("\n");

for (const required of REQUIRED_PDF_STRINGS) {
  assert.ok(pdfText.includes(required), `Required PDF output missing: ${required}`);
}

for (const forbidden of FORBIDDEN_PDF_STRINGS) {
  assert.equal(pdfText.includes(forbidden), false, `Forbidden PDF output string found: ${forbidden}`);
}

assert.ok(pdfText.includes("McDonald's"), "PDF output should normalize McDonalds to McDonald's");

assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportModel(session, { deliverable })"),
  "PDF path must build the Mergevue adapter model from the current session and deliverable",
);
assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportPdfTextModel(report)"),
  "PDF path must use the Mergevue adapter PDF text model",
);
assert.ok(
  APP_SOURCE.includes("MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME"),
  "App.jsx must import the Mergevue-safe PDF filename constant",
);
assert.ok(
  APP_SOURCE.includes("MERGEVUE_FORECAST_BRIEF_PDF_FILE_NAME"),
  "PDF download and attachment paths must use the Mergevue Forecast Brief filename alias",
);
assert.equal(
  APP_SOURCE.includes('const FINAL_DELIVERABLE_PDF_FILE_NAME = "structural-typology-final-deliverables-report.pdf"'),
  false,
  "App.jsx must not define the old Structural Typology PDF filename",
);

const alignedValues = Object.freeze([
  model.brand.name,
  model.brand.product,
  model.brand.reportType,
  model.brand.contactEmail,
  model.compatibilityScoreAndDealScenario.dealType,
  model.sealedPredictions.statusTitle,
  model.sealedPredictions.statusDescription,
  model.economicRiskTranslation.enterpriseValueBand,
  model.economicRiskTranslation.valuationDisclaimer,
  model.economicRiskTranslation.engagementTierRequirement,
  model.timelineOfExpectedFriction.timingLogic.signalSetup,
  model.timelineOfExpectedFriction.timingLogic.observationWindow,
  model.timelineOfExpectedFriction.timingLogic.verificationDeadline,
  model.auditFooter.reportId,
  model.auditFooter.reportVersion,
]);

for (const value of alignedValues) {
  assert.ok(pdfText.includes(String(value)), `PDF output missing adapter-aligned value: ${value}`);
}

console.log("Mergevue public report PDF validation passed");
