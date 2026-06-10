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
  "Sealed Predictions & Action Timeline",
  "Sealed Prediction Preview",
  "Display-only preview; not ledger-recorded.",
  "Economic exposure",
  "USD 500 million",
  "Illustrative posture, not a valuation.",
  "Absolute risk figures require the engagement-tier economic model.",
  "before Day 30",
  "Day 60",
  "Days 30-60",
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
  "Forward-verifiable | on record",
  "lodged against public ledger",
  "timestamped against public ledger",
  "USD 50.0B",
  "USD 350M to USD 2.2B",
  "$50M-$500M EV",
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
const expectedDesignSectionTitles = MERGEVUE_PUBLIC_REPORT_BLOCKS.map((title, index) => (
  index === 1 ? "Sealed Predictions & Action Timeline" : title
));
assert.deepEqual(pdfModel.sections.map((section) => section.title), expectedDesignSectionTitles);

const pdfText = [
  pdfModel.fileName,
  pdfHtml,
  ...pdfModel.renderedTextBlocks.map((block) => block.text),
].join("\n");
const renderedPlainText = pdfHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const FORBIDDEN_RENDERED_DUMP_MARKERS = Object.freeze([
  "ECS 91.2 0-100 scale marker",
  "Lock ID Verify by Window",
  "Zone Category Bar Direction Explanation",
  "Timing Action Owner Reason Expected effect",
  "Phase Body Watch for",
  "Post-Deal Behavior Forecast Forecast Brief",  " - ",
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
assert.ok(renderedPlainText.includes("03 Collision Thesis"), "PDF output must renumber Collision Thesis as section 03.");
assert.equal(renderedPlainText.includes("03 Timeline of Proposed Actions"), false, "PDF output must not render the old standalone timeline section.");

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
  APP_SOURCE.includes("downloadFinalDeliverablesReportPdf(deliverable, offer, session"),
  "Public PDF button must call the direct Forecast Brief PDF download path",
);
assert.ok(
  APP_SOURCE.includes("async function createForecastBriefVisualPdfBlob"),
  "Public PDF path must generate the visual Forecast Brief PDF through the HTML-to-PDF service",
);
assert.ok(
  APP_SOURCE.includes("contentType.toLowerCase().includes(\"application/pdf\")"),
  "Public PDF path must validate that the PDF render service returns application/pdf",
);
assert.ok(
  APP_SOURCE.includes("const blob = await response.blob()"),
  "Public PDF save path must read an application/pdf Blob from the render service response",
);
assert.ok(
  APP_SOURCE.includes("URL.createObjectURL(blob)"),
  "Public PDF save path must create a Blob URL for the generated PDF",
);
assert.ok(
  APP_SOURCE.includes("link.download = MERGEVUE_FORECAST_BRIEF_PDF_FILE_NAME"),
  "Public PDF save path must set the Mergevue Forecast Brief download filename",
);
assert.ok(
  APP_SOURCE.includes("link.click()"),
  "Public PDF save path must trigger a browser download without opening the print dialog",
);
assert.ok(
  APP_SOURCE.includes("URL.revokeObjectURL(url)"),
  "Public PDF save path must revoke the generated PDF Blob URL",
);
assert.equal(
  pdfHtml.includes(["window", "print"].join(".") + "()"),
  false,
  "Forecast Brief export HTML must not auto-trigger the browser print dialog",
);
assert.equal(
  APP_SOURCE.includes(`setDownloadState("${["Opening", "printable", "Forecast Brief."].join(" ")}")`),
  false,
  "Public PDF button must not describe the old print-dialog path",
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

const valuationRiskBandDisplay = String(model.economicRiskTranslation.enterpriseValueBand).replace(/^Enterprise value band:\s*/i, "");

const alignedValues = Object.freeze([
  model.brand.name,
  model.brand.product,
  model.brand.reportType,
  model.brand.contactEmail,
  model.compatibilityScoreAndDealScenario.dealType,
  model.sealedPredictions.statusTitle,
  model.sealedPredictions.statusDescription,
  valuationRiskBandDisplay,
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
  "prediction-banner",
  'class="env env-rich"',
  'class="zone"',
  'class="prediction-bottom"',
  'class="action-block"',
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
assert.ok(pdfHtml.includes("0-100 scale"), "PDF renderer must include 0-100 scale marker.");
assert.ok(pdfHtml.includes("pips"), "PDF renderer must include confidence pips.");
assert.ok(pdfHtml.includes("deal-grid"), "PDF renderer must include a deal grid.");
assert.ok(pdfHtml.includes("sealed-preview-1"), "PDF renderer must include sealed prediction lock id.");
assert.ok(pdfHtml.includes("Verify by"), "PDF renderer must include sealed prediction verification labels.");
assert.ok(pdfHtml.includes("Evidence required"), "PDF renderer must include sealed prediction evidence labels.");
assert.equal(pdfHtml.includes("Falsification condition"), false, "PDF renderer must not include the old falsification condition label.");
assert.equal(pdfHtml.includes("Window Days"), false, "PDF renderer must not include the old window-days label.");
assert.equal(pdfHtml.includes("Window |"), false, "PDF renderer must not include visible prediction window labels.");
assert.ok(pdfHtml.includes("Legend"), "PDF renderer must include resource-map legend.");
assert.ok(pdfHtml.includes("Model-recommended action") && pdfHtml.includes("Decision focus"), "PDF renderer must combine prediction action and decision-focus content.");
assert.ok(pdfHtml.includes("Decision Gap") && pdfHtml.includes("What this preview cannot decide for you"), "PDF renderer must include the decision-gap evidence panel.");
assert.ok(pdfHtml.includes("qr"), "PDF renderer must include audit QR treatment.");

for (const archiveClass of ["exec-score", "pred-top", "prediction-bottom", "zone", "rbar", "action-block", "env-total", "act-meta", "audit-grid"]) {
  assert.ok(pdfHtml.includes(archiveClass), `Archive-aligned renderer missing class: ${archiveClass}`);
}

assert.equal(pdfText.includes("Enterprise value band: Enterprise value band:"), false, "Enterprise value band label must not be duplicated.");

const firstPrediction = pdfModel.sections[1].predictions[0];
assert.notEqual(firstPrediction.statement, firstPrediction.evidenceRequired, "Prediction statement and evidence required must remain distinct.");
assert.ok(firstPrediction.evidenceRequired, "Prediction evidence required must be preserved when available.");

assert.equal(firstPrediction.windowLabel, "FP1 | Evidence challenge test", "Prediction card must expose the FP/window label.");
assert.ok(firstPrediction.actionMeta.includes("expected effect:"), "Prediction card must expose action meta.");
assert.ok(firstPrediction.rationale, "Prediction card must expose rationale.");
assert.ok(firstPrediction.decisionFocus, "Prediction card must expose decision focus.");

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
  "before Day 30",  "Day 60",
  "Days 30-60",
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
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.actionTitle),
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.actionMeta),
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.rationale),
  ...pdfModel.sections[1].predictions.map((prediction) => prediction.decisionFocus),
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

for (const prediction of pdfModel.sections[1].predictions) {
  assert.ok(pdfText.includes(prediction.windowLabel), "PDF output must preserve combined prediction FP/window label.");
  assert.ok(pdfText.includes(prediction.actionTitle), "PDF output must preserve combined prediction action title.");
  assert.ok(pdfText.includes(prediction.actionMeta), "PDF output must preserve combined prediction action meta.");
  assert.ok(pdfText.includes(prediction.rationale), "PDF output must preserve combined prediction rationale.");
  assert.ok(pdfText.includes(prediction.decisionFocus), "PDF output must preserve combined prediction decision focus.");
}

console.log("Mergevue public report PDF validation passed");








