import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
  buildMergevuePublicReportEmailCopy,
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";
import { buildFinalDeliverable } from "../src/flow/finalDeliverableFlow.js";
import { createHiddenUserAnswersSnapshot } from "../src/reporting/hiddenUserAnswersSnapshot.js";

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const API_SOURCE = readFileSync(new URL("../api/final-report.ts", import.meta.url), "utf8");
const PDF_VALIDATOR_SOURCE = readFileSync(new URL("./validate-mergevue-public-report-pdf.mjs", import.meta.url), "utf8");
const MODEL_VALIDATOR_SOURCE = readFileSync(new URL("./validate-mergevue-public-report-model.mjs", import.meta.url), "utf8");

const ENVIRONMENT_CODES = Object.freeze([
  "NT/STJ", "NT/STP", "NF/NT", "NF/SFJ", "NF/SFP", "SFJ/SFP", "STJ/STP", "STP/STJ", "SFP/SFJ",
]);

const REQUIRED_EMAIL_STRINGS = Object.freeze([
  "Mergevue",
  "Post-Deal Behavior Forecast",
  "Forecast Brief",
  "report@mergevue.com",
  "Forecast Preview",
  "Display-only preview; not ledger-recorded.",
  "Not a valuation or loss estimate",
  "Directional triage only. Not a valuation or loss estimate.",
  "Quantified modelling requires deal-room economics, role-level evidence, integration milestones, and analyst review.",
  "Competitive consolidation",
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
  const secondaryEnvironmentCode = overrides.secondaryEnvironmentCode ?? "NF/SFP";
  const environmentScores = Object.freeze(Object.fromEntries(
    ENVIRONMENT_CODES.map((code) => [code, code === primaryEnvironmentCode ? 2 : code === secondaryEnvironmentCode ? 1 : 0]),
  ));
  const weightedEnvironmentScores = Object.freeze(Object.fromEntries(
    ENVIRONMENT_CODES.map((code) => [code, code === primaryEnvironmentCode ? 1.5 : code === secondaryEnvironmentCode ? 0.5 : 0]),
  ));
  const questionResponses = Object.freeze(overrides.questionResponses ?? [
    Object.freeze({
      questionId: "Q1",
      selectedOption: "A",
      signalCodes: Object.freeze([primaryEnvironmentCode, secondaryEnvironmentCode]),
      evidenceType: "direct_observation",
      knowledgeLevel: "first_hand",
      confidence: overrides.confidence ?? "high",
      weight: 0.85,
      reliabilityFlags: Object.freeze([]),
      missing: false,
      excludedFromPrimaryScoring: false,
    }),
    Object.freeze({
      questionId: "Q2",
      selectedOption: null,
      signalCodes: Object.freeze([]),
      weight: 0,
      reliabilityFlags: Object.freeze([]),
      missing: true,
      excludedFromPrimaryScoring: true,
    }),
  ]);
  return Object.freeze({
    valid: true,
    primaryEnvironmentCode,
    topEnvironmentCode: primaryEnvironmentCode,
    signalStrength: overrides.signalStrength ?? "confirmed",
    confidence: overrides.confidence ?? "high",
    secondaryEnvironmentCode,
    primarySignalScore: 1.5,
    secondarySignalScore: 0.5,
    environmentScores,
    weightedEnvironmentScores,
    rawRankedEnvironments: Object.freeze(ENVIRONMENT_CODES.map((code) => Object.freeze({ code, score: environmentScores[code] }))),
    rankedEnvironments: Object.freeze(ENVIRONMENT_CODES.map((code) => Object.freeze({ code, score: weightedEnvironmentScores[code] }))),
    missingQuestionIds: Object.freeze(["Q2"]),
    answeredQuestionCount: 1,
    questionCount: 2,
    effectiveAnswerCount: overrides.effectiveAnswerCount ?? 1,
    totalEvidenceWeight: overrides.totalEvidenceWeight ?? 0.85,
    evidenceQuality: Object.freeze({
      confidence: overrides.confidence ?? "high",
      directObservationCount: overrides.directObservationCount ?? 8,
      documentSupportedCount: overrides.documentSupportedCount ?? 3,
      evidenceSupportedShare: overrides.evidenceSupportedShare ?? 0.9,
      reliabilityFlagCount: overrides.reliabilityFlagCount ?? 0,
      reliabilityFlagRate: overrides.reliabilityFlagRate ?? 0,
    }),
    questionResponses,
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
  preliminaryAssessment: Object.freeze({
    triageReport: Object.freeze({
      effectiveTier: "FEW",
      routing: Object.freeze({ gate: "analyst_review_required", label: "Standard analyst review" }),
      triggerCount: 1,
    }),
    contradictionReport: Object.freeze({
      findings: Object.freeze([
        Object.freeze({
          severity: "medium",
          type: "target_observed_self_divergence",
          leftSource: "Target observed by acquirer",
          leftSignalCode: "NT/STJ",
          rightSource: "Formal target self-description",
          rightSignalCode: "NF/SFP",
        }),
      ]),
    }),
  }),
});

const model = buildMergevuePublicReportModel(demoSession, {
  generatedAt: "2026-05-30T00:00:00.000Z",
});
const emailCopy = buildMergevuePublicReportEmailCopy(model);
const auditSession = Object.freeze({
  ...demoSession,
  sessionId: "apple-n-video-hidden-audit-smoke",
  dealContext: Object.freeze({
    ...demoSession.dealContext,
    data: Object.freeze({
      ...demoSession.dealContext.data,
      acquirerName: "Apple",
      targetName: "N-Video",
    }),
  }),
});
const deliverable = buildFinalDeliverable(auditSession);
const hiddenAudit = createHiddenUserAnswersSnapshot(auditSession, deliverable);
const hiddenAuditEnvelope = JSON.parse(hiddenAudit.json);
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
assert.ok(APP_SOURCE.includes("createHiddenUserAnswersSnapshot"), "App must build both hidden audit artifacts from one envelope");
assert.ok(APP_SOURCE.includes("hiddenAuditJson: hiddenAudit.json"), "App must send the canonical JSON artifact to hidden delivery");
assert.ok(APP_SOURCE.includes("hiddenAuditSummary: hiddenAudit.summary"), "App must send the human audit summary to hidden delivery");
assert.equal(APP_SOURCE.includes("createHiddenUserAnswersTablesText"), false, "Lossy flattened snapshot generator must be retired");
assert.equal(APP_SOURCE.includes("userAnswersTablesText"), false, "Legacy flattened snapshot payload must be retired");
assert.ok(API_SOURCE.includes("body?.hiddenAuditJson"), "API hidden-copy endpoint must consume hiddenAuditJson");
assert.ok(API_SOURCE.includes("body?.hiddenAuditSummary"), "API hidden-copy endpoint must consume hiddenAuditSummary");
assert.ok(API_SOURCE.includes("mergevue-hidden-user-answers.json"), "Hidden-copy email must attach canonical JSON");
assert.ok(API_SOURCE.includes("mergevue-hidden-user-answers.txt"), "Hidden-copy email must attach the human summary");
assert.equal(API_SOURCE.includes("HIDDEN_USER_ANSWERS_MAX_CHARS"), false, "Hidden audit artifacts must not be silently truncated");
assert.ok(API_SOURCE.includes("INTERNAL USER-ANSWERS AUDIT SUMMARY"), "Hidden-copy email must identify the internal summary");

assert.equal(deliverable.ready, true, "Apple x N-Video audit fixture must produce a ready deliverable");
assert.ok(deliverable.targetResolutionSource?.rule, "Resolver must record the target resolution rule");
assert.ok(Array.isArray(deliverable.targetResolutionSource?.contributors), "Resolver must record target evidence contributors");
assert.deepEqual(hiddenAuditEnvelope.session, JSON.parse(JSON.stringify(auditSession)), "Layer 1 must preserve the complete session tree");
assert.deepEqual(hiddenAuditEnvelope.deliverable, JSON.parse(JSON.stringify(deliverable)), "Layer 1 must preserve the complete deliverable tree");
assert.equal(hiddenAudit.json.includes("[TRUNCATED"), false, "Layer 1 must never silently truncate");
assert.equal(hiddenAudit.summary.includes("[TRUNCATED"), false, "Layer 2 must never silently truncate");

const triage = hiddenAuditEnvelope.session.preliminaryAssessment.triageReport;
assert.ok(hiddenAudit.summary.includes(`TRIAGE: ${triage.effectiveTier} | gate: ${triage.routing.gate} | route: ${triage.routing.label} | triggers: ${triage.triggerCount}`));
assert.ok(hiddenAudit.summary.includes(`Acquirer self-observation | ${hiddenAuditEnvelope.session.acquirer2A.score.primaryEnvironmentCode} | ${hiddenAuditEnvelope.session.acquirer2A.score.signalStrength} | ${hiddenAuditEnvelope.session.acquirer2A.score.confidence}`));
assert.ok(hiddenAudit.summary.includes(`PAIR: ${hiddenAuditEnvelope.deliverable.acquirerEnvironmentCode} -> ${hiddenAuditEnvelope.deliverable.targetEnvironmentCode}`));
assert.ok(hiddenAudit.summary.includes(`ECS: ${hiddenAuditEnvelope.deliverable.compatibilityScore} | band: ${hiddenAuditEnvelope.deliverable.riskBand}`));

for (const [label, scoreValue] of [
  ["Acquirer self-observation", auditSession.acquirer2A.score],
  ["Target current diagnostic", auditSession.target2B.finalScore],
  ["Target self-description", auditSession.targetSelfAssessment.score],
  ["Target observed by acquirer", auditSession.targetObservation.score],
]) {
  assert.ok(hiddenAudit.summary.includes(`MODULE: ${label} |`), `Block 6 must render ${label}`);
  for (const response of scoreValue.questionResponses) {
    const selected = response.missing ? "\u2014" : response.selectedOption;
    assert.ok(hiddenAudit.summary.includes(`${response.questionId} | ${selected}`), `Block 6 option mismatch for ${label} ${response.questionId}`);
  }
  assert.equal(scoreValue.questionResponses.length, scoreValue.answeredQuestionCount + scoreValue.missingQuestionIds.length);
}

for (const code of ENVIRONMENT_CODES) {
  const raw = auditSession.acquirer2A.score.environmentScores[code];
  const weighted = auditSession.acquirer2A.score.weightedEnvironmentScores[code];
  assert.ok(hiddenAudit.summary.includes(`${code} | ${raw} | ${weighted} |`), `Block 7 must read recorded tally for ${code}`);
}
assert.ok(hiddenAudit.summary.includes(`Acquirer resolved: ${deliverable.acquirerEnvironmentCode} from acquirer2A`));
assert.ok(hiddenAudit.summary.includes(`Target resolved: ${deliverable.targetEnvironmentCode}`));
assert.ok(hiddenAudit.summary.includes(`ECS lookup: ${deliverable.acquirerEnvironmentCode} x ${deliverable.targetEnvironmentCode} -> ${deliverable.compatibilityScore}`));

const missingModuleSession = Object.freeze({ ...auditSession, targetSelfAssessment: null, targetSelfDirect: null });
const missingModuleAudit = createHiddenUserAnswersSnapshot(missingModuleSession, deliverable);
assert.ok(missingModuleAudit.summary.includes("Target self-description | \u2014 | \u2014 | \u2014"));
assert.ok(missingModuleAudit.summary.includes("MODULE: Target self-description \u2014 not completed"));

const blockingSession = Object.freeze({
  ...auditSession,
  preliminaryAssessment: Object.freeze({
    ...auditSession.preliminaryAssessment,
    triageReport: Object.freeze({
      ...auditSession.preliminaryAssessment.triageReport,
      effectiveTier: "BLOCKING",
    }),
  }),
});
assert.ok(createHiddenUserAnswersSnapshot(blockingSession, deliverable).summary.includes("TRIAGE: BLOCKING"));

const circularSession = { sessionId: "circular-fixture" };
circularSession.self = circularSession;
assert.ok(createHiddenUserAnswersSnapshot(circularSession, deliverable).json.includes('"[circular]"'));

assert.equal(PDF_VALIDATOR_SOURCE.includes("hiddenUserAnswersSnapshot"), false, "Layer A PDF validation must exclude internal audit artifacts");
assert.equal(MODEL_VALIDATOR_SOURCE.includes("hiddenUserAnswersSnapshot"), false, "Layer A model validation must exclude internal audit artifacts");
const visibleDeliverySource = API_SOURCE.slice(API_SOURCE.indexOf("async function sendFinalReport("), API_SOURCE.indexOf("async function sendFinalReportHiddenCopy"));
assert.ok(visibleDeliverySource.startsWith("async function sendFinalReport("), "Visible delivery guard must inspect the real endpoint body");
assert.equal(visibleDeliverySource.includes("hiddenAuditJson"), false, "Canonical audit JSON must never reach buyer-facing delivery");
assert.equal(visibleDeliverySource.includes("hiddenAuditSummary"), false, "Audit summary must never reach buyer-facing delivery");
assert.ok(
  API_SOURCE.includes("n.petyaev@gmail.com"),
  "Hidden-copy default recipient must remain n.petyaev@gmail.com",
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
