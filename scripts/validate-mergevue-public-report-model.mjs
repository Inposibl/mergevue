import fs from "node:fs";
import assert from "node:assert/strict";
import { buildMergevuePublicReportModel } from "../src/reporting/mergevuePublicReportModel.js";
import { buildFinalDeliverable } from "../src/flow/finalDeliverableFlow.js";
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

const FINAL_DELIVERABLE_COMPATIBILITY_SOURCES = Object.freeze([
  "ST_Free_Tier_Output_Narratives_updated.xlsx",
  "ST_Friction_Point_Lookup_updated.xlsx",
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
  demoFrictionSource.riskBand,
  "Public compatibility band must be bound to final-deliverable source-row riskBand.",
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
assert.equal(model.brand.product, "Post-Deal Behavior Forecast");
assert.equal(model.brand.reportType, "Forecast Brief");
assert.equal(model.brand.contactEmail, "report@mergevue.com");
assert.equal(model.auditFooter.brand, "Mergevue");
assert.equal(model.auditFooter.contactEmail, "report@mergevue.com");

assert.equal(model.sealedPredictions.statusTitle, "Forecast Preview");
assert.equal(model.sealedPredictions.statusDescription, "Display-only preview; not ledger-recorded.");
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

const serialized = JSON.stringify(model);
for (const forbidden of FORBIDDEN_OUTPUT_STRINGS) {
  assert.equal(serialized.includes(forbidden), false, `Forbidden public output string found: ${forbidden}`);
}

assert.equal(serialized.includes("McDonald's"), true);
assert.equal(JSON.parse(serialized).brand.name, "Mergevue");

const CANONICAL_ECONOMIC_POSTURE_RULE = "Posture rule: Posture equals the highest assessed channel severity. When no channel is High but two or more channels are Medium, posture is raised one band.";
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
    testFirst: "Map named critical roles, retention exposure, and the first 90-day decision points that depend on them.",
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
    testFirst: "Name the knowledge holders, handover routines, and early warning signs of information blockage.",
  },
]);

assert.deepEqual(
  model.economicRiskTranslation.economicTriageChannels,
  EXPECTED_ECONOMIC_TRIAGE_CHANNELS,
  "Economic exposure channel glosses and Test first lines are a static authored baseline and must not drift without sign-off."
);

const sourceNarratives = FINAL_DELIVERABLE_DATA.narratives || [];
const narrativesMissingCoreMismatch = sourceNarratives.filter((narrative) => !String(narrative.coreMismatch || "").trim());
assert.equal(sourceNarratives.length, 72, "Final deliverable source must export 72 narratives.");
assert.deepEqual(
  narrativesMissingCoreMismatch.map((narrative) => `${narrative.acquirerEnvironmentCode || "?"}->${narrative.targetEnvironmentCode || "?"}`),
  [],
  "Every final-deliverable narrative must export a non-empty coreMismatch field."
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
console.log("Mergevue public report model validation passed");
