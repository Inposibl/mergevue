import fs from "node:fs";
import assert from "node:assert/strict";
import {
  PUBLIC_CONFLICT_DIRECTION_COPY,
  PUBLIC_ANALYTICAL_FIELD_PATHS,
  authorityPhrases,
  buildMergevuePublicReportModel,
  publicCompatibilityBand,
} from "../src/reporting/mergevuePublicReportModel.js";
import {
  FINAL_ENVIRONMENT_CODES,
  buildFinalDeliverable,
  buildPairDeliverable,
} from "../src/flow/finalDeliverableFlow.js";
import { FINAL_DELIVERABLE_DATA } from "../src/data/finalDeliverableData.js";

const TOP_LEVEL_KEYS = Object.freeze([
  "brand",
  "metadata",
  "executiveDecisionSummary",
  "sealedPredictions",
  "compatibilityScoreAndDealScenario",
  "theTwoEnvironments",
  "collisionThesis",
  "resourceConflictMap",
  "timelineOfExpectedFriction",
  "economicRiskTranslation",
  "recommendedActions",
  "evidenceBasisAndLimits",
  "whatTheFullEngagementAdds",
  "auditFooter",
]);

const REQUIRED_FIELDS = Object.freeze({
  brand: ["name", "product", "reportType", "contactEmail"],
  metadata: ["reportId", "generatedAt", "reportVersion", "scenarioId", "source"],
  executiveDecisionSummary: ["headline", "oneParagraphSummary", "decisionImplication", "mainRisk", "recommendedAction"],
  sealedPredictions: ["statusTitle", "statusDescription", "predictions"],
  compatibilityScoreAndDealScenario: ["acquirerName", "targetName", "dealType", "enterpriseValueBand", "dataQuality", "compatibilityScore", "compatibilityBand", "compatibilityExplanation"],
  theTwoEnvironments: ["acquirerEnvironmentName", "targetEnvironmentName", "acquirerEnvironmentCode", "targetEnvironmentCode", "acquirerEnvironmentDescription", "targetEnvironmentDescription", "acquirerBehaviorPattern", "targetBehaviorPattern"],
  collisionThesis: ["collisionHeadline", "collisionSummary", "primaryTension", "whyItMatters", "postCloseFailureMode"],
  resourceConflictMap: ["overwriteRiskExplanation", "resources"],
  timelineOfExpectedFriction: ["timingLogic", "phases"],
  economicRiskTranslation: ["enterpriseValueBand", "valuationDisclaimer", "economicRiskPosture", "engagementTierRequirement"],
  evidenceBasisAndLimits: ["dataQualityLevel", "inputCompleteness", "knownLimits", "methodLimitations", "whatThisReportCanSay", "whatThisReportCannotSay"],
  whatTheFullEngagementAdds: ["benefits", "cta", "contactEmail"],
  auditFooter: ["reportId", "generatedAt", "reportVersion", "scenarioId", "brand", "contactEmail", "publicUrlPattern", "trackRecordUrl"],
});

const FORBIDDEN_OUTPUT_STRINGS = Object.freeze([
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
  "Total Risk Envelope",
  "Indicative Total Risk Envelope",
  "hard risk envelope",
  "absolute loss range",
  "Kill a Competitor",
  "McDonalds",
  "current environment-pair result",
  "placeholder",
  "TODO",
  "Posture rule Posture rule",
  "Deal value context Deal value context",
  "Preview judgement Preview judgement",
  "Core thesis Core thesis",
  "Enterprise value band: Enterprise value band:",
  "Economic exposure: qualitative only",
  "Post-Deal Behavior Forecast",
  "Tier Public Forecast Brief",
  "Display-only forecast preview",
  "Forecast Preview & Action Timeline",
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
  "Force providing enforcement for sacred narrative",
]);

const HOMOGENEOUS_FORBIDDEN_STRINGS = Object.freeze([
  "translation failure",
  "premature translation",
  "translates the target operating system",
  "acquirer's management language",
  "different behaviours",
  "target operating logic is compressed too quickly",
  "impose its standard integration logic",
  "two different operating environments",
]);

const MODEL_VALUE_FORBIDDEN_LABEL_PREFIXES = Object.freeze([
  "Posture rule:",
  "Deal value context:",
  "Preview judgement:",
  "Core thesis:",
  "Why it matters:",
  "What you can do:",
  "Enterprise value band:",
  "Economic posture:",
]);

// Deliberately catches leaked sign algebra with or without parentheses.
const RAW_RESOURCE_NOTATION = /[+~\-\u2212][^()]{1,100}\s+vs\s+[+~\-\u2212][^()]{1,100}/iu;
const SECOND_PERSON = /\b(?:you|your|yours|yourself|yourselves)\b/iu;
const DUPLICATE_ADJACENT_LABEL = /\b(Posture rule|Core mismatch|Rationale|Deal value context|Preview judgement)\b[:\s]*\b\1\b/iu;
const DUPLICATE_ID_PREFIX = /\bmergevue-mergevue-/iu;
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
const APPROVED_CONFLICT_DIRECTIONS = Object.freeze({
  "+|-": Object.freeze({ class: "direct", acquirer: "amplified on the acquirer side", target: "suppressed on the target side", connector: "and" }),
  "-|+": Object.freeze({ class: "direct", acquirer: "suppressed on the acquirer side", target: "amplified on the target side", connector: "and" }),
  "~|-": Object.freeze({ class: "partial", acquirer: "treated as background on the acquirer side", target: "actively suppressed on the target side", connector: "while" }),
  "+|~": Object.freeze({ class: "partial", acquirer: "actively amplified on the acquirer side", target: "treated as background on the target side", connector: "while" }),
  "-|~": Object.freeze({ class: "partial", acquirer: "actively suppressed on the acquirer side", target: "treated as background on the target side", connector: "while" }),
  "~|+": Object.freeze({ class: "partial", acquirer: "treated as background on the acquirer side", target: "actively amplified on the target side", connector: "while" }),
  "+|+": Object.freeze({ class: "convergent", acquirer: "actively amplified on both sides", target: "", connector: "" }),
  "~|~": Object.freeze({ class: "convergent", acquirer: "treated as background on both sides", target: "", connector: "" }),
  "-|-": Object.freeze({ class: "convergent", acquirer: "suppressed on both sides", target: "", connector: "" }),
});
const EXPECTED_PAIR_CORE_MISMATCH = "The core mismatch is between authority earned through measurable results and symmetric accountability, and authority held through proximity to the founding mission and collective purpose. The sharpest contested resource is Energy: amplified on the acquirer side, suppressed on the target side.";
const EXPECTED_PAIR_FP2_RATIONALE = "Treat Energy as a protected integration resource during Days 30–60: it is amplified on the acquirer side and suppressed on the target side, which makes it the most likely early contestation zone. Separating preservation from simplification gives the integration team time to identify which Mission Field-linked routines protect cohesion, where Performance Arena accountability should apply, and which changes should wait until the Day 60 review.";



function collectStringValues(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStringValues(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStringValues(item, out));
  return out;
}

function registeredModelValues(report) {
  const sources = {
    executiveDecisionSummary: [report.executiveDecisionSummary],
    sealedPrediction: report.sealedPredictions?.predictions ?? [],
    compatibilityScoreAndDealScenario: [report.compatibilityScoreAndDealScenario],
    collisionThesis: [report.collisionThesis],
    resourceConflictMap: [report.resourceConflictMap],
    timelinePhase: report.timelineOfExpectedFriction?.phases ?? [],
    recommendedAction: report.recommendedActions ?? [],
  };
  return Object.entries(PUBLIC_ANALYTICAL_FIELD_PATHS.model).flatMap(([group, fields]) => (
    (sources[group] ?? []).flatMap((item) => fields.map((field) => ({
      path: `${group}.${field}`,
      value: item?.[field],
    })))
  )).filter(({ value }) => typeof value === "string" && value.trim());
}

function roundOne(value) {
  return Math.round(Number(value) * 10) / 10;
}

function isCanonicalEcsScore(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return false;
  const score = roundOne(value);
  return Array.from({ length: 35 }, (_unused, conflictSum) => (
    roundOne(100 * (1 - conflictSum / 34))
  )).includes(score);
}

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
  sessionId: "mergevue-public-report-model-smoke",
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

const calibrationDeliverable = buildPairDeliverable({
  acquirerEnvironmentCode: "NT/STJ",
  targetEnvironmentCode: "NF/SFJ",
  targetSecondaryEnvironmentCode: "SFJ/SFP",
  targetSignalStrength: "weak",
  targetCoPresence: true,
});
const calibrationSession = Object.freeze({
  ...approvedPairSession,
  preliminaryAssessment: Object.freeze({
    triageReport: Object.freeze({
      completed: true,
      effectiveTier: "HIGH",
      routing: Object.freeze({
        route: "senior_analyst_review",
        label: "Senior analyst review required",
        gate: "paid_output_conditional",
        gateLabel: "Paid output requires senior review",
        confidenceCap: "low",
        action: "Route to analyst workspace with senior review; do not treat raw answers as final evidence.",
      }),
      triggerCount: 2,
      reliabilitySummary: Object.freeze({ flagCount: 4 }),
      contradictionSummary: Object.freeze({ contradictionCount: 4, highSeverityCount: 0, criticalSeverityCount: 0 }),
      sourceSummaries: Object.freeze([
        Object.freeze({ id: "acquirer", label: "Acquirer self-observation", signalStrength: "strong", confidence: "high" }),
        Object.freeze({ id: "targetDiagnostic", label: "Target current diagnostic", signalStrength: "weak", confidence: "low" }),
        Object.freeze({ id: "targetSelfAssessment", label: "Formal target self-description", signalStrength: "weak", confidence: "low" }),
        Object.freeze({ id: "targetObservation", label: "Target observed by acquirer", signalStrength: "weak", confidence: "low" }),
      ]),
    }),
    contradictionReport: Object.freeze({
      completed: true,
      summary: Object.freeze({
        findingCount: 11,
        highSeverityCount: 4,
        mediumSeverityCount: 7,
        contradictionCount: 4,
        reliabilityRiskCount: 7,
        missingEvidenceCount: 0,
        analystReviewRequired: true,
      }),
      findings: Object.freeze([
        Object.freeze({
          severity: "medium",
          type: "target_diagnostic_self_divergence",
          leftSource: "Target current diagnostic",
          rightSource: "Formal target self-description",
          leftSignalCode: "SFJ/SFP",
          rightSignalCode: "NF/SFJ",
        }),
      ]),
    }),
  }),
});
const calibrationModel = buildMergevuePublicReportModel(calibrationSession, {
  deliverable: calibrationDeliverable,
  generatedAt: "2026-06-14T00:00:00.000Z",
});
assert.equal(calibrationModel.compatibilityScoreAndDealScenario.compatibilityScore, 14.7);
assert.equal(calibrationModel.compatibilityScoreAndDealScenario.compatibilityBand, "HIGH RISK");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.triggered, true, "Target-partial / paid-output-conditional runs must expose a public calibration object.");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.routing?.label, "Senior analyst review required");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.routing?.confidenceCap, "low");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.contradictionSummary?.contradictionCount, 4);
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.reliabilitySummary?.flagCount, 4);
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.currentRange?.targetEnvironmentCode, "NF/SFJ");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.currentRange?.score, 14.7);
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.alternativeRanges?.[0]?.targetEnvironmentCode, "SFJ/SFP");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.alternativeRanges?.[0]?.score, 58.8);
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.alternativeRanges?.[0]?.range, "54–64");
assert.equal(calibrationModel.evidenceBasisAndLimits.calibration?.alternativeRanges?.[0]?.riskBand, "MODERATE");
assert.ok(calibrationModel.evidenceBasisAndLimits.dataQualityLevel.includes("signal agreement unresolved (4 contradictions, 4 reliability flags)"));
assert.ok(calibrationModel.evidenceBasisAndLimits.inputCompleteness.includes("target-side confidence limited across 3 weak/low-confidence target sources"));
assert.ok(calibrationModel.evidenceBasisAndLimits.whatThisReportCanSay.includes("ECS is provisional: The Mission Field 14.7 (10–20, HIGH RISK)."));
assert.ok(calibrationModel.evidenceBasisAndLimits.whatThisReportCanSay.includes("Senior analyst review required before treating as settled."));
assert.ok(calibrationModel.evidenceBasisAndLimits.whatThisReportCanSay.includes("Alternative read: The Hometown Network 58.8 (54–64, MODERATE)."));

assert.deepEqual(authorityPhrases, APPROVED_AUTHORITY_PHRASES, "Authority phrases must match the owner-approved dictionary verbatim.");
assert.deepEqual(PUBLIC_CONFLICT_DIRECTION_COPY, APPROVED_CONFLICT_DIRECTIONS, "Conflict direction copy must match the owner-approved 3x3 dictionary verbatim.");
assert.equal(isCanonicalEcsScore(88.2), true, "Canonical ECS 88.2 must be on the equal-weight lattice.");
assert.equal(isCanonicalEcsScore(88.1), false, "Synthetic off-lattice ECS must fail provenance validation.");
assert.equal(approvedPairModel.collisionThesis.coreMismatch, EXPECTED_PAIR_CORE_MISMATCH);
assert.equal(approvedPairModel.recommendedActions[2].actionReason, EXPECTED_PAIR_FP2_RATIONALE);
assert.ok(approvedPairModel.recommendedActions[2].actionReason.length >= 160);
assert.ok(approvedPairModel.recommendedActions[2].actionReason.trim().split(/\s+/).length >= 25);
assert.ok(approvedPairModel.recommendedActions[2].actionReason.includes("Performance Arena"));
assert.ok(approvedPairModel.recommendedActions[2].actionReason.includes("Mission Field"));
assert.ok(approvedPairModel.recommendedActions[2].actionReason.split(/[.!?]+/).filter((sentence) => sentence.trim()).length >= 2);
assert.equal(RAW_RESOURCE_NOTATION.test(JSON.stringify(approvedPairModel)), false, "Approved pair public model must not expose raw resource notation.");
assert.equal(DUPLICATE_ADJACENT_LABEL.test(JSON.stringify(approvedPairModel)), false, "Approved pair public model must not contain adjacent duplicate labels.");
assert.equal(DUPLICATE_ID_PREFIX.test(JSON.stringify(approvedPairModel)), false, "Approved pair public model must not duplicate the Mergevue ID prefix.");
assert.equal(approvedPairModel.economicRiskTranslation.economicTriageRule.startsWith("Posture rule:"), false);
const approvedPairModelAnalyticalValues = registeredModelValues(approvedPairModel);
for (const { value } of approvedPairModelAnalyticalValues) {
  assert.equal(RAW_RESOURCE_NOTATION.test(value), false, `Raw resource notation found in analytical copy: ${value}`);
}
const approvedPairSecondPersonFields = approvedPairModelAnalyticalValues
  .filter(({ value }) => SECOND_PERSON.test(value))
  .map(({ path }) => path);
console.log(`Second-person narrative-layer fields pending owner review: ${[...new Set(approvedPairSecondPersonFields)].join(", ") || "none"}`);

for (const friction of FINAL_DELIVERABLE_DATA.frictionPoints) {
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: friction.acquirerEnvironmentCode,
    targetEnvironmentCode: friction.targetEnvironmentCode,
  });
  const pairModel = buildMergevuePublicReportModel(demoSession, { deliverable, generatedAt: "2026-06-12T00:00:00.000Z" });
  const pairKey = `${friction.acquirerEnvironmentCode}->${friction.targetEnvironmentCode}`;
  assert.equal(isCanonicalEcsScore(friction.ecs), true, `Off-lattice ECS provenance failure for ${pairKey}: ${friction.ecs}`);
  assert.equal(RAW_RESOURCE_NOTATION.test(JSON.stringify(pairModel)), false, `Raw resource notation found in public model for ${pairKey}.`);
  assert.equal(DUPLICATE_ADJACENT_LABEL.test(JSON.stringify(pairModel)), false, `Duplicate analytical label found for ${pairKey}.`);
  assert.equal(DUPLICATE_ID_PREFIX.test(JSON.stringify(pairModel)), false, `Duplicate Mergevue ID prefix found for ${pairKey}.`);
  assert.equal(pairModel.collisionThesis.coreMismatch.includes("depends on the current environment-pair result"), false, `Placeholder mismatch copy found for ${pairKey}.`);
}

const precedenceDeliverable = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STP",
});
const precedenceModel = buildMergevuePublicReportModel(demoSession, {
  deliverable: precedenceDeliverable,
  generatedAt: "2026-06-12T00:00:00.000Z",
});
assert.equal(precedenceModel.compatibilityScoreAndDealScenario.compatibilityScore, 88.2);
assert.equal(precedenceModel.metadata.doctrineClass, "concealed_conflict");
assert.equal(precedenceModel.metadata.doctrineCopyReview.required, true);
assert.deepEqual(precedenceModel.metadata.sourceBinding.consistencyLog[0], {
  pair: "NF/NT->NT/STP",
  resource: "Organisation / system",
  frictionReading: "~|~",
  profileReading: "-|~",
  frictionSource: "NewLogic 03.05.2026/ST_Friction_Point_Lookup_updated.xlsx",
  profileSource: "src/data/environments.js resource impact matrices",
  resolution: "friction row takes precedence for pair-level public copy",
});
assert.ok(precedenceModel.recommendedActions[2].actionReason.includes("neither organisation actively manages it"));

const recoveredStpDeliverable = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "STP/STJ",
});
const recoveredStpModel = buildMergevuePublicReportModel(demoSession, {
  deliverable: recoveredStpDeliverable,
  generatedAt: "2026-06-12T00:00:00.000Z",
});
assert.equal(recoveredStpModel.compatibilityScoreAndDealScenario.compatibilityScore, 64.7);
assert.equal(recoveredStpModel.metadata.frictionContentStatus.available, true);
assert.deepEqual(recoveredStpModel.metadata.frictionContentStatus.degradedSurfaces, []);
assert.equal(/pending analysis/i.test(JSON.stringify(recoveredStpModel)), false, "PENDING friction content must not enter the public model.");

const FINAL_DELIVERABLE_COMPATIBILITY_SOURCES = Object.freeze([
  "ST_Free_Tier_Output_Narratives_updated.xlsx",
  "ST_Friction_Point_Lookup_updated.xlsx",
  "ST_ECS_v1_canonical.xlsx",
]);

for (const sourceName of FINAL_DELIVERABLE_COMPATIBILITY_SOURCES) {
  assert.ok(
    FINAL_DELIVERABLE_DATA.sources.includes(sourceName),
    `Final deliverable compatibility source missing: ${sourceName}`,
  );
}

assert.equal(
  FINAL_DELIVERABLE_DATA.sources.includes("ST_ECS_to_Valuation_Bridge_v1_1.xlsx"),
  false,
  "ECS-to-Valuation bridge workbook must not be treated as the final-deliverable compatibility ECS source.",
);

function sourcePair(rows, acquirerEnvironmentCode, targetEnvironmentCode) {
  return rows.find((row) => row.acquirerEnvironmentCode === acquirerEnvironmentCode && row.targetEnvironmentCode === targetEnvironmentCode);
}

const demoAcquirerEnvironmentCode = "NF/NT";
const demoTargetEnvironmentCode = "NT/STJ";
const demoNarrativeSource = sourcePair(FINAL_DELIVERABLE_DATA.narratives, demoAcquirerEnvironmentCode, demoTargetEnvironmentCode);
const demoFrictionSource = sourcePair(FINAL_DELIVERABLE_DATA.frictionPoints, demoAcquirerEnvironmentCode, demoTargetEnvironmentCode);

assert.ok(demoNarrativeSource, "Demo pair must exist in final-deliverable narrative source rows.");
assert.ok(demoFrictionSource, "Demo pair must exist in final-deliverable friction source rows.");
assert.equal(demoNarrativeSource.ecs, demoFrictionSource.ecs, "Narrative and friction ECS values must agree for the public report demo pair.");
assert.equal(
  model.compatibilityScoreAndDealScenario.compatibilityScore,
  demoFrictionSource.ecs,
  "Public compatibility score must be bound to final-deliverable source-row ECS, not recalculated from the valuation bridge.",
);
assert.equal(
  model.compatibilityScoreAndDealScenario.compatibilityBand,
  publicCompatibilityBand(demoFrictionSource.ecs),
  "Public compatibility band must use the locked universal thresholds for the final-deliverable ECS.",
);

const observerWinsSession = Object.freeze({
  ...demoSession,
  acquirer2A: Object.freeze({
    completed: true,
    score: score("NT/STJ"),
  }),
  targetObservation: Object.freeze({
    completed: true,
    score: score("NT/STP", { totalEvidenceWeight: 23, effectiveAnswerCount: 23 }),
  }),
  target2B: Object.freeze({
    completed: true,
    finalScore: score("NT/STP", { totalEvidenceWeight: 22, effectiveAnswerCount: 22 }),
  }),
  targetSelfAssessment: Object.freeze({
    completed: true,
    score: score("NF/SFJ", { totalEvidenceWeight: 11, effectiveAnswerCount: 11, confidence: "medium" }),
  }),
});

const observerWinsDeliverable = buildFinalDeliverable(observerWinsSession);
assert.equal(
  observerWinsDeliverable.targetEnvironmentCode,
  "NT/STP",
  "Final deliverable target environment must use canonical target merge; target self-assessment must not override observer-side evidence.",
);

assert.deepEqual(Object.keys(model), TOP_LEVEL_KEYS);

for (const [section, fields] of Object.entries(REQUIRED_FIELDS)) {
  assert.ok(model[section], `Missing section: ${section}`);
  for (const field of fields) {
    assert.ok(Object.hasOwn(model[section], field), `Missing field: ${section}.${field}`);
  }
}

assert.equal(model.brand.name, "Mergevue");
assert.equal(model.brand.product, "Post-Deal Friction Preview");
assert.equal(model.brand.reportType, "Structural Read");
assert.equal(model.brand.contactEmail, "report@mergevue.com");
assert.equal(model.auditFooter.brand, "Mergevue");
assert.equal(model.auditFooter.contactEmail, "report@mergevue.com");

assert.equal(model.sealedPredictions.statusTitle, "Structural Watchpoints");
assert.equal(model.sealedPredictions.statusDescription, "This public preview is not a scored forecast ledger.");
assert.equal(publicCompatibilityBand(38), "MODERATE-LOW");
assert.equal(publicCompatibilityBand(64), "MODERATE");
assert.equal(publicCompatibilityBand(79), "MODERATE-HIGH");
assert.equal(publicCompatibilityBand(80), "HIGH");
assert.ok(Array.isArray(model.sealedPredictions.predictions));
assert.ok(model.sealedPredictions.predictions.length >= 1);

for (const prediction of model.sealedPredictions.predictions) {
  for (const field of ["predictionTitle", "predictionWindow", "predictionClaim", "observableSignal", "verificationMethod"]) {
    assert.ok(Object.hasOwn(prediction, field), `Missing prediction field: ${field}`);
    assert.equal(typeof prediction[field], "string");
    assert.ok(prediction[field].length > 0);
  }
}

assert.equal(model.compatibilityScoreAndDealScenario.dealType, "Competitive consolidation");
assert.equal(model.compatibilityScoreAndDealScenario.enterpriseValueBand, "Enterprise value / deal value provided: USD 500 million (estimated).");
assert.equal(model.economicRiskTranslation.enterpriseValueBand, "Enterprise value / deal value provided: USD 500 million (estimated).");
assert.equal(model.economicRiskTranslation.valuationDisclaimer, "Directional triage only. Not a valuation or loss estimate.");
assert.equal(model.economicRiskTranslation.engagementTierRequirement, "Quantified modelling requires deal-room economics, role-level evidence, integration milestones, and analyst review.");

assert.equal(
  model.resourceConflictMap.overwriteRiskExplanation,
  "The main risk is translation failure: the acquirer may impose its standard integration logic before it understands which target routines preserve loyalty, trust, knowledge flow, execution quality, or deal-critical continuity after close.",
);
assert.ok(Array.isArray(model.resourceConflictMap.resources));
assert.ok(model.resourceConflictMap.resources.length > 0);

for (const resource of model.resourceConflictMap.resources) {
  for (const field of ["resourceName", "resourceCategory", "conflictIntensity", "conflictBand", "direction", "explanation"]) {
    assert.ok(Object.hasOwn(resource, field), `Missing resource field: ${field}`);
  }
}

assert.deepEqual(model.timelineOfExpectedFriction.timingLogic, {
  signalSetup: "before Day 30",
  observationWindow: "Days 30-60",
  verificationDeadline: "Day 60",
});
assert.ok(Array.isArray(model.timelineOfExpectedFriction.phases));
assert.ok(model.timelineOfExpectedFriction.phases.length >= 3);

for (const phase of model.timelineOfExpectedFriction.phases) {
  for (const field of ["phaseName", "timeWindow", "expectedFriction", "observableSignal", "recommendedCheck"]) {
    assert.ok(Object.hasOwn(phase, field), `Missing timeline phase field: ${field}`);
  }
}

assert.ok(Array.isArray(model.recommendedActions));
assert.ok(model.recommendedActions.length > 0);
for (const action of model.recommendedActions) {
  for (const field of ["actionTitle", "actionTiming", "actionOwner", "actionReason", "actionExpectedEffect"]) {
    assert.ok(Object.hasOwn(action, field), `Missing recommended action field: ${field}`);
  }
}

assert.ok(Array.isArray(model.whatTheFullEngagementAdds.benefits));
assert.ok(model.whatTheFullEngagementAdds.benefits.length >= 3);
assert.equal(model.whatTheFullEngagementAdds.contactEmail, "report@mergevue.com");
assert.equal(
  model.whatTheFullEngagementAdds.cta,
  "Next step: scope a single-deal pilot to decompose ECS drivers, review the operating-environment coding against available artifacts, and convert watchpoints into role-level integration controls.",
);
assert.ok(
  model.whatTheFullEngagementAdds.benefits.some((benefit) => benefit.includes("paid workflow is designed to")),
  "Paid-tier copy must frame the workflow as designed output, not mature validation.",
);
assert.ok(
  model.whatTheFullEngagementAdds.benefits.some((benefit) => benefit.includes("where inputs are sufficient")),
  "Paid-tier copy must qualify outputs by input sufficiency.",
);
assert.ok(
  model.whatTheFullEngagementAdds.benefits.some((benefit) => benefit.includes("track record strengthens as sealed predictions mature")),
  "Paid-tier copy must describe the forecast ledger as maturing over time.",
);
assert.ok(
  model.whatTheFullEngagementAdds.benefits.some((benefit) => benefit.includes("ARTIFACT-REVIEWED ENVIRONMENT CODING")),
  "Paid-tier copy must use artifact-reviewed environment-coding label.",
);

const serialized = JSON.stringify(model);
for (const forbidden of FORBIDDEN_OUTPUT_STRINGS) {
  assert.equal(serialized.includes(forbidden), false, `Forbidden public output string found: ${forbidden}`);
}

assert.equal(serialized.includes("McDonald's"), true);
assert.equal(JSON.parse(serialized).brand.name, "Mergevue");

const CANONICAL_ECONOMIC_POSTURE_RULE = "Posture equals the highest assessed channel severity. When no channel is High but two or more channels are Medium, posture is raised one band.";
const FORBIDDEN_ECONOMIC_POSTURE_RULE = "Read the posture as a prioritisation signal: the strongest exposure channel sets the headline risk, and clustered Medium channels are treated as an attention area before they become value leakage.";
assert(
  serialized.includes(CANONICAL_ECONOMIC_POSTURE_RULE),
  "Economic exposure triage must include the approved auditable posture rule."
);
assert(
  !serialized.includes(FORBIDDEN_ECONOMIC_POSTURE_RULE),
  "Economic exposure triage must not replace the posture rule with the weakened how-to-read narrative."
);

const EXPECTED_ECONOMIC_TRIAGE_CHANNELS = Object.freeze([
  {
    label: "Talent continuity",
    severity: "High",
    meaning: "Risk that deal-critical people disengage, slow down, or leave before the integration model stabilises.",
    testFirst: "Map critical role categories, role-level dependencies, retention exposure windows, and the first 90-day decision points that depend on them.",
  },
  {
    label: "Earn-out credibility",
    severity: "Medium",
    meaning: "Risk that behavioural friction makes performance milestones harder to deliver, putting contingent value and seller-management incentives under pressure.",
    testFirst: "Compare earn-out milestones with the operating routines and decision rights needed to hit them.",
  },
  {
    label: "Decision delay",
    severity: "Medium",
    meaning: "Risk that approvals, escalation paths, and authority conflicts slow value capture after close.",
    testFirst: "Identify decisions that must not wait for a full integration redesign.",
  },
  {
    label: "Knowledge continuity",
    severity: "Medium",
    meaning: "Risk that informal know-how, customer context, or execution memory stops moving through the combined organisation.",
    testFirst: "Identify critical knowledge-holder categories, handover routines, and early warning signs of information blockage.",
  },
]);

assert.deepEqual(
  model.economicRiskTranslation.economicTriageChannels,
  EXPECTED_ECONOMIC_TRIAGE_CHANNELS,
  "Economic exposure channel glosses and Test first lines are a static authored baseline and must not drift without sign-off."
);

const sourceNarratives = FINAL_DELIVERABLE_DATA.narratives || [];
const narrativesWithCoreMismatch = sourceNarratives.filter((narrative) => String(narrative.coreMismatch || "").trim());
assert.equal(sourceNarratives.length, 72, "Final deliverable source must export 72 narratives.");
assert.deepEqual(
  narrativesWithCoreMismatch.map((narrative) => `${narrative.acquirerEnvironmentCode || "?"}->${narrative.targetEnvironmentCode || "?"}`),
  [],
  "Retired narrative.coreMismatch values must not be exported into final-deliverable data."
);
assert.equal(
  FINAL_DELIVERABLE_DATA.sources.some((sourceName) => sourceName === "ST_ECS_v1.xlsx" || sourceName === "ST_ECS_v1_9x9_canonical_source.xlsx"),
  false,
  "Superseded ECS workbook names must not remain in final-deliverable provenance.",
);

const rendererSource = fs.readFileSync(new URL("../src/reporting/mergevueForecastBriefDesignRenderer.js", import.meta.url), "utf8");
assert(
  !rendererSource.includes("The core mismatch is between evidence-based authority and mission-based legitimacy."),
  "Environment core mismatch must not use the old hardcoded authority/legitimacy placeholder."
);
assert(
  rendererSource.includes("section.coreMismatch"),
  "Environment core mismatch must render the pair-specific section.coreMismatch field."
);

for (const code of FINAL_ENVIRONMENT_CODES) {
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: code,
    targetEnvironmentCode: code,
  });

  assert.equal(deliverable.screen, "screen-10b", `${code} self-pair must route to homogeneous Screen 10b before public adaptation.`);

  const homogeneousModel = buildMergevuePublicReportModel(demoSession, {
    deliverable,
    generatedAt: "2026-05-30T00:00:00.000Z",
  });

  assert.equal(
    homogeneousModel.metadata.pairSourceClass,
    "homogeneous",
    `${code} public report must expose homogeneous pairSourceClass.`
  );

  assert.equal(
    homogeneousModel.metadata.sourceBinding?.finalDeliverableScreen,
    "screen-10b",
    `${code} public report must preserve final deliverable homogeneous screen binding.`
  );

  const homogeneousSerialized = JSON.stringify(homogeneousModel);

  for (const forbidden of HOMOGENEOUS_FORBIDDEN_STRINGS) {
    assert.equal(
      homogeneousSerialized.includes(forbidden),
      false,
      `${code} homogeneous public model leaked cross-pair doctrine: ${forbidden}`
    );
  }

  for (const value of collectStringValues(homogeneousModel)) {
    for (const prefix of MODEL_VALUE_FORBIDDEN_LABEL_PREFIXES) {
      assert.equal(
        value.startsWith(prefix),
        false,
        `${code} model value must not include renderer label prefix: ${prefix}`
      );
    }
  }
}
console.log("Mergevue public report model validation passed");
