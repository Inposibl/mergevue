import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
  buildMergevuePublicReportEmailCopy,
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const API_SOURCE = readFileSync(new URL("../api/final-report.ts", import.meta.url), "utf8");

const REQUIRED_EMAIL_STRINGS = Object.freeze([
  "Mergevue",
  "Post-Deal Behavior Forecast",
  "Forecast Brief",
  "report@mergevue.com",
  "Sealed Prediction Preview",
  "Display-only preview; not ledger-recorded.",
  "Enterprise value band: $50M\u2013$500M EV",
  "Illustrative posture, not a valuation.",
  "Absolute risk figures require the engagement-tier economic model.",
  "Absorb / neutralize a competitor",
  "McDonald's",
]);

const FORBIDDEN_EMAIL_STRINGS = Object.freeze([
  "Structural Typology",
  "Academy of Structural Typology",
  "structural-typology.com",
  "structural-typology.academy",
  "info@structural-typology.academy",
  "Forward-verifiable \u00b7 on record",
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
  sessionId: "mergevue-public-report-email-smoke",
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
const emailCopy = buildMergevuePublicReportEmailCopy(model);
const visibleEmailText = [
  emailCopy.subject,
  emailCopy.attachmentFileName,
  emailCopy.previewText,
  ...emailCopy.textLines,
].join("\n");
const hiddenCopyText = [
  `${emailCopy.subject} Copy`,
  "A Mergevue Forecast Brief PDF was saved from the public diagnostic.",
  ...emailCopy.textLines,
].join("\n");

assert.equal(emailCopy.subject, "Mergevue Forecast Brief: Post-Deal Behavior Forecast");
assert.equal(emailCopy.attachmentFileName, MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME);
assert.equal(emailCopy.attachmentFileName, "mergevue-forecast-brief.pdf");

for (const required of REQUIRED_EMAIL_STRINGS) {
  assert.ok(visibleEmailText.includes(required), `Required email output missing: ${required}`);
  assert.ok(hiddenCopyText.includes(required), `Required hidden-copy output missing: ${required}`);
}

for (const forbidden of FORBIDDEN_EMAIL_STRINGS) {
  assert.equal(visibleEmailText.includes(forbidden), false, `Forbidden email output string found: ${forbidden}`);
  assert.equal(hiddenCopyText.includes(forbidden), false, `Forbidden hidden-copy output string found: ${forbidden}`);
}

assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportModel(session, { deliverable })"),
  "Email path must build the Mergevue adapter model from the current session and deliverable",
);
assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportEmailCopy(report)"),
  "Email path must create adapter-derived report copy",
);
assert.ok(
  (APP_SOURCE.match(/reportEmailCopy/g) ?? []).length >= 3,
  "App must send adapter-derived reportEmailCopy to visible and hidden delivery endpoints",
);
assert.ok(
  API_SOURCE.includes("body?.reportEmailCopy"),
  "API delivery path must consume reportEmailCopy payload fields",
);
assert.ok(
  API_SOURCE.includes("buildFinalReportEmailMessage"),
  "API must build visible report email copy through a Mergevue-safe message helper",
);
assert.ok(
  API_SOURCE.includes("buildHiddenFinalReportCopyMessage"),
  "API must build hidden-copy email copy through a Mergevue-safe message helper",
);
assert.ok(
  API_SOURCE.includes("MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME"),
  "API must use the Mergevue-safe PDF filename fallback",
);
assert.equal(
  API_SOURCE.includes("subject: \"Structural Typology Final Report"),
  false,
  "API must not use the old Structural Typology final report subject",
);
assert.equal(
  API_SOURCE.includes("structural-typology-final-deliverables-report.pdf"),
  false,
  "API must not expose the old Structural Typology PDF filename fallback",
);
assert.equal(
  visibleEmailText.includes("RESEND_API_KEY")
    || visibleEmailText.includes("REPORT_COPY_FROM")
    || hiddenCopyText.includes("RESEND_API_KEY")
    || hiddenCopyText.includes("REPORT_COPY_FROM"),
  false,
  "Generated report copy must not print or embed secret/config variable names",
);

console.log("Mergevue public report email validation passed");
