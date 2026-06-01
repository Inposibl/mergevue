import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";
import {
  buildMergevueForecastBriefDesignModel,
  forecastBriefDesignClassContract,
  forecastBriefScoreBand,
  renderMergevueForecastBriefHtml,
} from "../src/reporting/mergevueForecastBriefDesignRenderer.js";

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
  "$50M–$500M EV",
  "high",
  "moderate",
  "aligned",
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
const pdfModel = buildMergevueForecastBriefDesignModel(model);
const pdfHtml = renderMergevueForecastBriefHtml(pdfModel);

assert.equal(pdfModel.fileName, MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME);
assert.equal(pdfModel.fileName, "mergevue-forecast-brief.pdf");
assert.equal(pdfModel.fileName.includes("structural-typology-final-deliverables-report"), false);
assert.deepEqual(pdfModel.sections.map((section) => section.title), MERGEVUE_PUBLIC_REPORT_BLOCKS);

const pdfText = [
  pdfModel.fileName,
  pdfHtml,
  ...pdfModel.renderedTextBlocks.map((block) => block.text),
].join("\n");

const FORBIDDEN_RENDERED_DUMP_MARKERS = Object.freeze([
  "ECS 91.2 0-100 scale marker",
  "Lock ID Verify by Window",
  "Zone Category Bar Direction Explanation",
  "Timing Action Owner Reason Expected effect",
  "Phase Body Watch for",
  "Post-Deal Behavior Forecast Forecast Brief",
  "Days 30-60",
  " - ",
]);

for (const required of REQUIRED_PDF_STRINGS) {
  assert.ok(pdfText.includes(required), `Required PDF output missing: ${required}`);
}

for (const forbidden of FORBIDDEN_PDF_STRINGS) {
  assert.equal(pdfText.includes(forbidden), false, `Forbidden PDF output string found: ${forbidden}`);
}

for (const forbidden of FORBIDDEN_RENDERED_DUMP_MARKERS) {
  assert.equal(pdfHtml.includes(forbidden), false, `Printable HTML must not contain table/text dump marker: ${forbidden}`);
}

assert.ok(pdfText.includes("McDonald's"), "PDF output should normalize McDonalds to McDonald's");

assert.ok(
  APP_SOURCE.includes("buildMergevuePublicReportModel(session, { deliverable })"),
  "PDF path must build the Mergevue adapter model from the current session and deliverable",
);
assert.ok(
  APP_SOURCE.includes("buildMergevueForecastBriefDesignModel(report)"),
  "PDF path must use the designed Forecast Brief model built from the Mergevue adapter",
);
assert.ok(
  APP_SOURCE.includes("renderMergevueForecastBriefHtml(designModel)"),
  "PDF path must exercise the shared designed HTML/print renderer contract",
);
assert.ok(
  APP_SOURCE.includes("openForecastBriefPrintView(deliverable, session)"),
  "Public PDF button must open the printable Forecast Brief HTML path",
);
assert.equal(
  APP_SOURCE.includes("const pdf = createFinalDeliverablesReportPdf(deliverable, session);"),
  false,
  "Public PDF save path must not create the simple line/table PDF",
);
assert.equal(
  APP_SOURCE.includes("downloadFinalDeliverablesReportPdf(deliverable, offer, session, pdf)"),
  false,
  "Public PDF save path must not download the simple line/table PDF",
);
assert.equal(
  APP_SOURCE.includes("buildMergevuePublicReportPdfTextModel(report)"),
  false,
  "PDF path must not use the flat adapter PDF text model",
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

for (const className of forecastBriefDesignClassContract()) {
  assert.ok(pdfHtml.includes(className), `Designed print renderer missing class contract: ${className}`);
}

for (const layoutMarker of [
  'class="sheet"',
  'class="mast"',
  'class="exec"',
  'class="exec-score"',
  'class="score-num',
  'class="score-scale"',
  'class="pips"',
  'class="pred"',
  'class="tracker"',
  'class="env"',
  'class="zone"',
  'class="tl-col"',
  'class="cat"',
  'class="panel"',
]) {
  assert.ok(pdfHtml.includes(layoutMarker), `Printable HTML missing required layout marker: ${layoutMarker}`);
}

for (const cssNeedle of ["@media print", "break-inside: avoid", "print-color-adjust"]) {
  assert.ok(pdfHtml.includes(cssNeedle), `Designed print renderer missing print CSS: ${cssNeedle}`);
}

assert.ok(pdfHtml.includes("masthead"), "PDF renderer must include masthead layout.");
assert.ok(pdfHtml.includes("exec"), "PDF renderer must include executive hero layout.");
assert.ok(pdfHtml.includes("ECS"), "PDF renderer must include ECS number.");
assert.ok(pdfHtml.includes("0–100 scale"), "PDF renderer must include 0-100 scale marker.");
assert.ok(pdfHtml.includes("pips"), "PDF renderer must include confidence pips.");
assert.ok(pdfHtml.includes("deal-grid"), "PDF renderer must include a deal grid.");
assert.ok(pdfHtml.includes("sealed-preview-1"), "PDF renderer must include sealed prediction lock id.");
assert.ok(pdfHtml.includes("Watch for:"), "PDF renderer must include evidence-required timeline watch labels.");
assert.ok(pdfHtml.includes("Falsification condition"), "PDF renderer must include falsification condition.");
assert.ok(pdfHtml.includes("Legend"), "PDF renderer must include resource-map legend.");
assert.ok(pdfHtml.includes("Before close") && pdfHtml.includes("After close"), "PDF renderer must split recommended actions before/after close.");
assert.ok(pdfHtml.includes("Evidence basis") && pdfHtml.includes("Limits"), "PDF renderer must split evidence and limits panels.");
assert.ok(pdfHtml.includes("qr"), "PDF renderer must include audit QR treatment.");

for (const archiveClass of ["exec-score", "pred-top", "pred-meta", "zone", "rbar", "tl-col", "env-total", "act-meta", "audit-grid"]) {
  assert.ok(pdfHtml.includes(archiveClass), `Archive-aligned renderer missing class: ${archiveClass}`);
}

assert.equal(pdfText.includes("Enterprise value band: Enterprise value band:"), false, "Enterprise value band label must not be duplicated.");

const firstPrediction = pdfModel.sections[1].predictions[0];
assert.notEqual(firstPrediction.statement, firstPrediction.evidenceRequired, "Prediction statement and evidence required must remain distinct.");
assert.ok(firstPrediction.evidenceRequired, "Prediction evidence required must be preserved when available.");

const firstPhase = pdfModel.sections[6].phases[0];
assert.equal(firstPhase.heading, firstPrediction.oneLine.replace(/\.$/, ""), "Timeline heading must come from the prediction one-liner.");
assert.notEqual(firstPhase.body, firstPhase.heading, "Timeline body must not copy the heading.");
assert.equal(firstPhase.watchFor, firstPrediction.evidenceRequired, "Timeline watch-for must come from evidenceRequired.");

const environmentSection = pdfModel.sections[3];
assert.equal(environmentSection.acquirer.environment.includes(environmentSection.acquirer.environment + " / "), false);
assert.equal(environmentSection.target.environment.includes(environmentSection.target.environment + " / "), false);

const executiveHeadline = pdfModel.sections[0].hero.headline;
const headlineOccurrences = pdfModel.renderedTextBlocks.filter((block) => block.text === executiveHeadline).length;
assert.equal(headlineOccurrences, 1, "Executive headline must render once and must not be backfilled into other slots.");

const seen = new Map();
const allowedDuplicates = new Set([
  "Mergevue",
  "Forecast Brief",
  "report@mergevue.com",
  "before Day 30",
  "Days 30–60",
  "Day 60",
  "$50M–$500M EV",
  "high",
  "moderate",
  "aligned",
  model.compatibilityScoreAndDealScenario.dataQuality,
  model.evidenceBasisAndLimits.inputCompleteness,
  model.auditFooter.publicUrlPattern,
  model.auditFooter.trackRecordUrl,
  model.compatibilityScoreAndDealScenario.acquirerName,
  model.compatibilityScoreAndDealScenario.targetName,
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.oneLine),
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.statement),
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.evidenceRequired),
]);
for (const block of pdfModel.renderedTextBlocks) {
  if (allowedDuplicates.has(block.text)) continue;
  const existingSection = seen.get(block.text);
  assert.ok(
    !existingSection || existingSection === block.sectionId,
    `Duplicate text block found across sections ${existingSection} and ${block.sectionId}: ${block.text}`,
  );
  seen.set(block.text, block.sectionId);
}

assert.equal(forecastBriefScoreBand(38.2), "mod", "Score 38.2 should map to canonical mod band.");
assert.equal(pdfText.includes("MODERATE-LOW"), false, "PDF output must not use old MODERATE-LOW band copy.");
assert.equal(pdfText.includes(" - "), false, "PDF text must use em dash semantics instead of ASCII dash separators.");
assert.ok(pdfModel.humanSignOffNote.includes("human sign-off"), "Section appendix toggles must carry human sign-off note.");

const firstResource = pdfModel.sections[5].zones[0];
assert.ok(pdfText.includes(firstResource.name), "PDF output must preserve resource name.");
assert.ok(pdfText.includes(firstResource.category), "PDF output must preserve resource category.");
assert.ok(pdfText.includes(firstResource.direction), "PDF output must preserve resource direction.");
assert.ok(pdfText.includes(String(firstResource.intensity)), "PDF output must preserve conflict intensity.");
assert.ok(pdfText.includes(firstResource.band), "PDF output must preserve conflict band.");
assert.ok(pdfText.includes(firstResource.explanation), "PDF output must preserve resource explanation.");

const firstAction = pdfModel.sections[8].beforeClose[0] ?? pdfModel.sections[8].afterClose[0];
assert.ok(pdfText.includes(firstAction.actionTitle), "PDF output must preserve recommended action title.");
assert.ok(pdfText.includes(firstAction.actionTiming), "PDF output must preserve recommended action timing.");
assert.ok(pdfText.includes(firstAction.actionOwner), "PDF output must preserve recommended action owner.");
assert.ok(pdfText.includes(firstAction.actionReason), "PDF output must preserve recommended action reason.");
assert.ok(pdfText.includes(firstAction.actionExpectedEffect), "PDF output must preserve recommended action expected effect.");

console.log("Mergevue public report PDF validation passed");
