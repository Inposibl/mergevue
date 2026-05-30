import assert from "node:assert/strict";
import { buildMergevuePublicReportModel } from "../src/reporting/mergevuePublicReportModel.js";

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

assert.equal(model.sealedPredictions.statusTitle, "Sealed Prediction Preview");
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

assert.equal(model.compatibilityScoreAndDealScenario.dealType, "Absorb / neutralize a competitor");
assert.equal(model.compatibilityScoreAndDealScenario.enterpriseValueBand, "Enterprise value band: $50M–$500M EV");
assert.equal(model.economicRiskTranslation.enterpriseValueBand, "Enterprise value band: $50M–$500M EV");
assert.equal(model.economicRiskTranslation.valuationDisclaimer, "Illustrative posture, not a valuation.");
assert.equal(model.economicRiskTranslation.engagementTierRequirement, "Absolute risk figures require the engagement-tier economic model.");

assert.equal(
  model.resourceConflictMap.overwriteRiskExplanation,
  "The main risk is not direct resource conflict. It is overwrite risk: the acquirer may simplify or underuse the target’s more structured operating system, causing institutional knowledge and planning discipline to decay after close.",
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
  observationWindow: "Days 30–60",
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

console.log("Mergevue public report model validation passed");
