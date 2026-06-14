import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
  PUBLIC_ANALYTICAL_FIELD_PATHS,
  authorityPhrases,
  buildMergevuePublicReportModel,
  publicCompatibilityBand,
} from "../src/reporting/mergevuePublicReportModel.js";
import {
  buildMergevueForecastBriefDesignModel,
  forecastBriefDesignClassContract,
  forecastBriefScoreBand,
  renderMergevueForecastBriefHtml,
} from "../src/reporting/mergevueForecastBriefDesignRenderer.js";
import { buildPairDeliverable } from "../src/flow/finalDeliverableFlow.js";
import { FINAL_DELIVERABLE_DATA } from "../src/data/finalDeliverableData.js";

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const EXPECTED_LAYOUT_PAGE_COUNT = 7;
const FRICTION_PUBLIC_COPY_FIELDS = Object.freeze([
  "fp1",
  "fp2",
  "fp3",
  "earlyWarningSignal",
  "primaryConflictedResources",
]);

const FORBIDDEN_FRICTION_VERDICT_STRINGS = Object.freeze([
  "will be reframing",
  "the response will be",
  "incompatibility is confirmed",
  "the structural incompatibility is confirmed",
  "typically respond by building internal opposition",
  "These are structurally incompatible",
  "Both mechanisms are internally coherent; they are structurally incompatible",
  "These are structurally incompatible:",
]);

function verticalShredRuns(text) {
  const runs = [];
  let current = [];
  for (const rawLine of String(text ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line && line.length <= 2) {
      current.push(line);
      continue;
    }
    if (current.length >= 3) runs.push([...current]);
    current = [];
  }
  if (current.length >= 3) runs.push(current);
  return runs;
}

const REQUIRED_PDF_STRINGS = Object.freeze([
  "Mergevue",
  "Post-Deal Friction Preview",
  "Structural Read",
  "Forecast Brief",
  "report@mergevue.com",
  "Watch & Control Timeline",
  "Structural Watchpoints",
  "Display-only structural preview",
  "WATCHPOINT 01",
  "WATCHPOINT 02",
  "WATCHPOINT 03",
  "Review window",
  "Suggested control action",
  "designated trust owner",
  "17-resource",
  "selected exposed resources",
  "ECS is a compatibility score",
  "Resource scores are contestation-intensity scores",
  "ARTIFACT-REVIEWED ENVIRONMENT CODING",
  "paid workflow is designed to",
  "where inputs are sufficient",
  "track record strengthens as sealed predictions mature",
  "Next step: scope a single-deal pilot to decompose ECS drivers, review the operating-environment coding against available artifacts, and convert watchpoints into role-level integration controls.",
  "Economic exposure",
  "USD 500 million",
  "Directional triage only. Not a valuation or loss estimate.",
  "Quantified modelling requires deal-room economics, role-level evidence, integration milestones, and analyst review.",
  "before Day 30",
  "Day 60",
  "Days 30-60",
  "high",
  "Baseline",
  "Low",
  "Medium",
  "High",
  "moderate",
  "Competitive consolidation",
  "standalone integration-priority view",
  "not yet reconciled against a single canonical source",
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
  "depends on the current environment-pair result",
  "Economic exposure: qualitative only",
  "FORECAST BRIEF | POST-DEAL BEHAVIOR FORECAST",
  "Tier Public Forecast Brief",
  "Display-only forecast preview",
  "Forecast Preview & Action Timeline",
  "not an average of the displayed resources",
  "reflects compatibility across the full 17-resource model",
  "FORECAST PREVIEW",
  "PREDICTION 01",
  "PREDICTION 02",
  "PREDICTION 03",
  "VERIFY BY",
  "MODEL-RECOMMENDED ACTION",
  "ref: forecast-pr",
  "ref: forecast-prev",
  "named leaders",
  "named critical roles",
  "Name the knowledge holders",
  "names who carries the risk",
  "named trust owner",
  "AUDIT-GRADE CONFIRMATION",
  "removes the guesswork",
  "validated 28/28",
  "validated without deviation",
  "proven hit-rate",
  "5 RESOURCES SCANNED",
  "ref: forecast-pr",
  "ref: forecast-prev",
  "Force providing enforcement for sacred narrative",
]);

// Deliberately catches leaked sign algebra with or without parentheses.
const RAW_RESOURCE_NOTATION = /[+~\-\u2212][^()]{1,100}\s+vs\s+[+~\-\u2212][^()]{1,100}/iu;
const SECOND_PERSON = /\b(?:you|your|yours|yourself|yourselves)\b/iu;
const DUPLICATE_ADJACENT_LABEL = /\b(Posture rule|Core mismatch|Rationale|Deal value context|Preview judgement)\b[:\s]*\b\1\b/iu;
const DUPLICATE_ID_PREFIX = /\bmergevue-mergevue-/iu;
const INTERNAL_ENVIRONMENT_CODE = /\b(?:NF\/NT|NF\/SFJ|NF\/SFP|NT\/STJ|NT\/STP|SFJ\/SFP|SFP\/SFJ|STJ\/STP|STP\/STJ)\b/u;
const INTERNAL_LAYER_A_TERM = /\b(?:extraction mechanisms?|protection premium|complicity)\b/iu;
const APPROVED_AUTHORITY_PHRASES = Object.freeze({
  "NT/STJ": "authority earned through measurable results and symmetric accountability",
  "NT/STP": "authority belonging to whoever can demonstrably make the thing work",
  "NF/NT": "authority granted to the strongest argument, regardless of title or tenure",
  "NF/SFJ": "authority held through proximity to the founding mission and collective purpose",
  "NF/SFP": "authority carried by the most genuine creative voice, with little weight on credentials",
  "SFJ/SFP": "authority accumulated through seniority, tenure, and standing within the community",
  "STJ/STP": "authority held by those able to take and defend a position of strength",
  "STP/STJ": "authority derived from a sanctioned position in the hierarchy, accountable upward and contingent on delivery",
  "SFP/SFJ": "authority embedded in the standardised system itself, with compliance secured through engineered incentives",
});
const EXPECTED_PAIR_CORE_MISMATCH = "The core mismatch is between authority earned through measurable results and symmetric accountability, and authority held through proximity to the founding mission and collective purpose. The sharpest contested resource is Energy: amplified on the acquirer side, suppressed on the target side.";
const EXPECTED_PAIR_FP2_RATIONALE = "Treat Energy as a protected integration resource during Days 30–60: it is amplified on the acquirer side and suppressed on the target side, which makes it the most likely early contestation zone. Separating preservation from simplification gives the integration team time to identify which Mission Field-linked routines protect cohesion, where Performance Arena accountability should apply, and which changes should wait until the Day 60 review.";

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

function registeredDesignValues(designModel) {
  const sources = {
    executive: [designModel.sections[0]?.hero],
    prediction: designModel.sections[1]?.predictions ?? [],
    environment: [designModel.sections[3]],
    collisionThesis: [designModel.sections[4]],
    timelinePhase: designModel.sections[6]?.phases ?? [],
  };
  return Object.entries(PUBLIC_ANALYTICAL_FIELD_PATHS.design).flatMap(([group, fields]) => (
    (sources[group] ?? []).flatMap((item) => fields.map((field) => ({
      path: `${group}.${field}`,
      value: item?.[field],
    })))
  )).filter(({ value }) => typeof value === "string" && value.trim());
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

const approvedPairSession = Object.freeze({
  ...demoSession,
  sessionId: "mergevue-approved-public-copy-package",
  dealContext: Object.freeze({
    ...demoSession.dealContext,
    data: Object.freeze({
      ...demoSession.dealContext.data,
      acquirerName: "Apple",
      targetName: "N-Video",
    }),
  }),
  acquirer2A: Object.freeze({ completed: true, score: score("NT/STJ") }),
  target2B: Object.freeze({ completed: true, finalScore: score("NF/SFJ") }),
  targetSelfAssessment: Object.freeze({ completed: true, score: score("NF/SFJ", { confidence: "medium" }) }),
  targetObservation: Object.freeze({ completed: true, score: score("NF/SFJ", { directObservationCount: 6 }) }),
});
const approvedPairModel = buildMergevuePublicReportModel(approvedPairSession, {
  generatedAt: "2026-06-12T00:00:00.000Z",
});
const approvedPairDesignModel = buildMergevueForecastBriefDesignModel(approvedPairModel);
const approvedPairHtml = renderMergevueForecastBriefHtml(approvedPairDesignModel);
const approvedPairPredictions = approvedPairDesignModel.sections[1].predictions;
const approvedPairAnalyticalValues = registeredDesignValues(approvedPairDesignModel);

assert.deepEqual(authorityPhrases, APPROVED_AUTHORITY_PHRASES, "Authority phrases must match the owner-approved dictionary verbatim.");
assert.equal(approvedPairModel.collisionThesis.coreMismatch, EXPECTED_PAIR_CORE_MISMATCH);
assert.equal(approvedPairPredictions[1].rationale, EXPECTED_PAIR_FP2_RATIONALE);
assert.ok(approvedPairPredictions[1].rationale.length >= 160);
assert.ok(approvedPairPredictions[1].rationale.trim().split(/\s+/).length >= 25);
assert.ok(approvedPairPredictions[1].rationale.includes("Performance Arena"));
assert.ok(approvedPairPredictions[1].rationale.includes("Mission Field"));
assert.notEqual(approvedPairPredictions[1].rationale, approvedPairPredictions[1].statement);
assert.ok(approvedPairPredictions[1].rationale.split(/[.!?]+/).filter((sentence) => sentence.trim()).length >= 2);
for (const { value } of approvedPairAnalyticalValues) {
  assert.equal(RAW_RESOURCE_NOTATION.test(value), false, `Raw resource notation found in analytical copy: ${value}`);
}
const approvedPairSecondPersonFields = approvedPairAnalyticalValues
  .filter(({ value }) => SECOND_PERSON.test(value))
  .map(({ path }) => path);
console.log(`Second-person design/PDF fields pending owner review: ${[...new Set(approvedPairSecondPersonFields)].join(", ") || "none"}`);
assert.equal(RAW_RESOURCE_NOTATION.test(approvedPairHtml), false, "Approved pair printable HTML must not expose raw resource notation.");
assert.equal(DUPLICATE_ADJACENT_LABEL.test(approvedPairHtml.replace(/<[^>]*>/g, " ")), false, "Approved pair printable HTML must not contain adjacent duplicate labels.");
assert.equal(DUPLICATE_ID_PREFIX.test(approvedPairHtml.replace(/<[^>]*>/g, " ")), false, "Approved pair printable HTML must not duplicate the Mergevue ID prefix.");
assert.ok(approvedPairHtml.includes(EXPECTED_PAIR_CORE_MISMATCH));
assert.ok(approvedPairHtml.includes(EXPECTED_PAIR_FP2_RATIONALE));

const allPairSecondPersonReview = new Set();
const allPairPredictionVoiceViolations = [];
const frictionLayerSecondPersonViolations = [];
for (const friction of FINAL_DELIVERABLE_DATA.frictionPoints) {
  const pairKey = `${friction.acquirerEnvironmentCode}->${friction.targetEnvironmentCode}`;
  for (const field of FRICTION_PUBLIC_COPY_FIELDS) {
    const value = String(friction[field] ?? "").trim();
    if (value && SECOND_PERSON.test(value)) {
      frictionLayerSecondPersonViolations.push(`${pairKey} friction.${field}: ${value}`);
    }
  }
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: friction.acquirerEnvironmentCode,
    targetEnvironmentCode: friction.targetEnvironmentCode,
  });
  const pairModel = buildMergevuePublicReportModel(demoSession, {
    deliverable,
    generatedAt: "2026-06-12T00:00:00.000Z",
  });
  const pairDesignModel = buildMergevueForecastBriefDesignModel(pairModel);
  const pairValues = registeredDesignValues(pairDesignModel);
  for (const { path, value } of pairValues) {
    assert.equal(RAW_RESOURCE_NOTATION.test(value), false, `Raw resource notation found in design field ${path} for ${pairKey}.`);
    if (path.startsWith("prediction.")) {
      const violations = [
        SECOND_PERSON.test(value) ? "second person" : "",
        INTERNAL_ENVIRONMENT_CODE.test(value) ? "internal environment code" : "",
        INTERNAL_LAYER_A_TERM.test(value) ? "internal Layer A term" : "",
      ].filter(Boolean);
      if (violations.length) {
        allPairPredictionVoiceViolations.push(`${pairKey} ${path} [${violations.join(", ")}]: ${value}`);
      }
    } else if (SECOND_PERSON.test(value)) {
      allPairSecondPersonReview.add(path);
    }
  }
}
console.log(`Friction-layer second-person fields pending owner review:\n${frictionLayerSecondPersonViolations.join("\n") || "none"}`);
console.log(`All-pairs non-prediction second-person fields pending owner review: ${[...allPairSecondPersonReview].join(", ") || "none"}`);

const boundaryRawScore = 79.4;
assert.equal(Math.ceil(boundaryRawScore) >= 80, true, "Boundary fixture proves upward rounding crosses the doctrine threshold.");
assert.equal(Math.round(boundaryRawScore) >= 80, false, "Nearest-integer display rounding must not cross the doctrine threshold.");
assert.equal(forecastBriefScoreBand(boundaryRawScore), "moderateHigh");
assert.equal(forecastBriefScoreBand(80), "high");
for (const friction of FINAL_DELIVERABLE_DATA.frictionPoints) {
  const raw = Number(friction.ecs);
  if (!Number.isFinite(raw)) continue;
  assert.notEqual(forecastBriefScoreBand(raw), "pending", `Canonical ECS must resolve a public band for ${friction.acquirerEnvironmentCode}->${friction.targetEnvironmentCode}.`);
}

const frictionVerdictViolations = [];
for (const friction of FINAL_DELIVERABLE_DATA.frictionPoints || []) {
  for (const field of FRICTION_PUBLIC_COPY_FIELDS) {
    const value = String(friction[field] || "");
    for (const forbidden of FORBIDDEN_FRICTION_VERDICT_STRINGS) {
      if (value.includes(forbidden)) {
        frictionVerdictViolations.push(`${friction.acquirerEnvironmentCode}->${friction.targetEnvironmentCode} ${field}: ${forbidden}`);
      }
    }
  }
}
assert.deepEqual(frictionVerdictViolations, [], "Public friction copy must not contain owner-retired verdict language.");

assert.equal(pdfModel.fileName, MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME);
assert.equal(pdfModel.fileName, "mergevue-forecast-brief.pdf");
assert.equal(pdfModel.fileName.includes("structural-typology-final-deliverables-report"), false);
const expectedDesignSectionTitles = MERGEVUE_PUBLIC_REPORT_BLOCKS.map((title, index) => (
  index === 1 ? "Watch & Control Timeline" : title
));
assert.deepEqual(pdfModel.sections.map((section) => section.title), expectedDesignSectionTitles);

const pdfText = [
  pdfModel.fileName,
  pdfHtml,
  ...pdfModel.renderedTextBlocks.map((block) => block.text),
].join("\n");
const renderedPlainText = pdfHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const renderedTextForExtraction = renderedPlainText.replace(/&nbsp;/g, " ");
const renderedPageCount = (pdfHtml.match(/<div class="page\b/g) ?? []).length;

const renderedVerdictViolations = [];
for (const forbidden of FORBIDDEN_FRICTION_VERDICT_STRINGS) {
  if (pdfText.includes(forbidden)) {
    renderedVerdictViolations.push(forbidden);
  }
}
assert.deepEqual(renderedVerdictViolations, [], "Rendered buyer-facing PDF/HTML text must not contain owner-retired verdict language.");
assert.equal(renderedPageCount, EXPECTED_LAYOUT_PAGE_COUNT, "Forecast Brief HTML must preserve the approved seven-page layout contract.");
assert.match(renderedTextForExtraction, /\b(?:100|[1-9]?\d)\s+of 100\b/, "ECS text must extract as '{N} of 100' with whitespace.");
assert.equal(pdfHtml.includes("word-break:break-all"), false, "Prediction references must not use character-by-character wrapping.");
assert.equal(/ref:\s*forecast-(?:pr|prev)/i.test(pdfHtml), false, "Public prediction cards must not render internal forecast references.");

const layoutAuditArgument = process.argv.find((argument) => argument.startsWith("--layout-audit="));
const layoutAuditPath = process.env.MERGEVUE_PDF_LAYOUT_AUDIT || layoutAuditArgument?.slice("--layout-audit=".length);
if (layoutAuditPath) {
  const layoutAudit = JSON.parse(readFileSync(layoutAuditPath, "utf8"));
  const extractedPages = Array.isArray(layoutAudit.pages) ? layoutAudit.pages : [];
  assert.equal(extractedPages.length, EXPECTED_LAYOUT_PAGE_COUNT, "Extracted fixture PDF must contain exactly seven pages.");
  const extractedText = extractedPages.map((page) => String(page.text ?? "")).join("\n");
  assert.match(extractedText, /\b(?:100|[1-9]?\d)\s+of 100\b/, "Extracted ECS score must contain whitespace before 'of 100'.");
  for (const page of extractedPages) {
    assert.deepEqual(verticalShredRuns(page.text), [], `Vertical text shredding found on extracted PDF page ${page.page}.`);
  }
}

if (process.argv.includes("--layout-only")) {
  console.log("Mergevue public Forecast Brief PDF layout validation passed.");
  process.exit(0);
}

assert.deepEqual(
  frictionLayerSecondPersonViolations,
  [],
  `Second-person friction-layer copy found:\n${frictionLayerSecondPersonViolations.join("\n")}`,
);
assert.deepEqual(
  allPairPredictionVoiceViolations,
  [],
  `Second-person prediction copy found:\n${allPairPredictionVoiceViolations.join("\n")}`,
);

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
  "Economic Exposure Triage",
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
assert.equal(pdfHtml.includes("forecast-preview-1"), false, "PDF renderer must not expose forecast preview lock ids.");
assert.ok(pdfHtml.includes("Review window"), "PDF renderer must include watchpoint review-window labels.");
assert.ok(pdfHtml.includes("Evidence required"), "PDF renderer must include forecast preview evidence labels.");
assert.equal(pdfHtml.includes("Falsification condition"), false, "PDF renderer must not include the old falsification condition label.");
assert.equal(pdfHtml.includes("Window Days"), false, "PDF renderer must not include the old window-days label.");
assert.equal(pdfHtml.includes("Window |"), false, "PDF renderer must not include visible prediction window labels.");
assert.ok(pdfHtml.includes("Legend"), "PDF renderer must include resource-map legend.");
assert.ok(pdfHtml.includes("Suggested control action") && pdfHtml.includes("Decision focus"), "PDF renderer must combine watchpoint action and decision-focus content.");
assert.ok(pdfHtml.includes("Decision Gap") && pdfHtml.includes("What this preview cannot decide for you"), "PDF renderer must include the decision-gap evidence panel.");
assert.ok(pdfHtml.includes("qr"), "PDF renderer must include audit QR treatment.");

for (const archiveClass of ["exec-score", "pred-top", "prediction-bottom", "zone", "rbar", "action-block", "env-total", "act-meta", "audit-grid"]) {
  assert.ok(pdfHtml.includes(archiveClass), `Archive-aligned renderer missing class: ${archiveClass}`);
}

assert.equal(pdfText.includes("Enterprise value band: Enterprise value band:"), false, "Enterprise value band label must not be duplicated.");

const firstPrediction = pdfModel.sections[1].predictions[0];
assert.notEqual(firstPrediction.statement, firstPrediction.evidenceRequired, "Prediction statement and evidence required must remain distinct.");
assert.ok(firstPrediction.evidenceRequired, "Prediction evidence required must be preserved when available.");

assert.equal(firstPrediction.windowLabel, "FP1 | Early evidence test", "Prediction card must expose the FP/window label.");
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
  "Baseline",
  "Low",
  "Medium",
  "High",
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

assert.equal(forecastBriefScoreBand(38.2), "moderateLow", "Score 38.2 must map to the locked MODERATE-LOW band.");
assert.equal(publicCompatibilityBand(38.2), "MODERATE-LOW", "Public model must render the locked MODERATE-LOW band for moderate-low scores.");
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
