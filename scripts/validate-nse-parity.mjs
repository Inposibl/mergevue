import assert from "node:assert/strict";
import { createHiddenUserAnswersSnapshot as createLegacyHiddenUserAnswersSnapshot } from "./legacy/hiddenAuditSummaryOracle.mjs";
import {
  compileNativeSafetyEnvelopeV1,
  createNativeSafetyEnvelopeArtifact,
} from "../src/reporting/nse/envelope.ts";
import { SemanticKernelV1 } from "../src/reporting/nse/kernel.ts";
import {
  FINAL_ENVIRONMENT_CODES,
  canonicalStructuralEcs,
} from "../src/flow/finalDeliverableFlow.js";

const ENVIRONMENT_CODES = [...FINAL_ENVIRONMENT_CODES];
const MODULE_IDS = ["targetDiagnostic", "targetSelfAssessment", "targetObservation"];
const postClean = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.replace(/\u0000/g, "");
};

function score(primaryEnvironmentCode = "NT/STJ", overrides = {}) {
  const secondaryEnvironmentCode = overrides.secondaryEnvironmentCode ?? "NF/SFP";
  const environmentScores = Object.fromEntries(ENVIRONMENT_CODES.map((code) => [
    code,
    code === primaryEnvironmentCode ? 2 : code === secondaryEnvironmentCode ? 1 : 0,
  ]));
  const weightedEnvironmentScores = Object.fromEntries(ENVIRONMENT_CODES.map((code) => [
    code,
    code === primaryEnvironmentCode ? 1.5 : code === secondaryEnvironmentCode ? 0.5 : 0,
  ]));
  return {
    primaryEnvironmentCode,
    secondaryEnvironmentCode,
    primarySignalScore: 1.5,
    secondarySignalScore: 0.5,
    signalStrength: "HIGH",
    confidence: "HIGH",
    evidenceQuality: { confidence: "FALLBACK" },
    answeredQuestionCount: 2,
    questionCount: 2,
    environmentScores,
    weightedEnvironmentScores,
    questionResponses: [
      {
        questionId: "Q1",
        selectedOption: "A",
        signalCodes: [primaryEnvironmentCode],
        evidenceType: "direct_observation",
        knowledgeLevel: "high",
        confidence: "high",
        weight: 1.5,
        reliabilityFlags: ["confirmed"],
        canonicalQuestionId: "Q1",
        workbookQuestionId: "Q1",
        questionModuleId: "module",
        respondentId: "respondent",
        respondentSlot: "R1",
        respondentIdentityStatus: "verified",
      },
      {
        questionId: "Q2",
        selectedOption: "B",
        signalCodes: [secondaryEnvironmentCode],
        evidenceType: "inference",
        knowledgeLevel: "medium",
        confidence: "medium",
        weight: 0.5,
        reliabilityFlags: [],
      },
    ],
    ...overrides,
  };
}

function baseProjection() {
  return {
    session: {
      sessionId: "asmt-00000000-0000-4000-8000-000000000001",
      preliminaryAssessment: {
        triageReport: {
          effectiveTier: "TIER_2",
          routing: { gate: "GATE_A", label: "Review" },
          triggerCount: 2,
        },
        contradictionReport: {
          findings: [
            {
              severity: "HIGH",
              type: "PAIR",
              leftSource: "Acquirer",
              rightSource: "Target",
              leftSignalCode: "NT/STJ",
              rightSignalCode: "NF/NT",
            },
            {
              severity: "MEDIUM",
              findingType: "EVIDENCE",
              affectedSources: ["Target current diagnostic"],
              evidenceBasis: "Observed divergence",
            },
          ],
        },
      },
      dealContext: {
        data: {
          acquirerName: "Acquirer Co",
          targetName: "Target Co",
          dealType: "Acquisition",
          enterpriseValue: "500",
          enterpriseValueCurrency: "USD",
          enterpriseValueStatus: "provided",
          compensationAssumptions: { averageAnnualCompensation: 250000 },
          averageAnnualCompensationCurrency: "USD",
          averageAnnualCompensationStatus: "provided",
          keyPersonnelAtRisk: 12,
          respondentSide: "acquirer",
          respondentAccessLevel: "direct",
          transactionRole: "advisor",
          integrationTimeline: "12 months",
        },
      },
      acquirer2A: { completed: true, data: { respondentSide: "acquirer" }, score: score("NT/STJ") },
      target2B: { completed: true, data: { respondentSide: "target" }, finalScore: score("NF/NT") },
      targetSelfAssessment: { completed: true, data: { respondentSide: "target" }, score: score("NF/SFJ") },
      targetObservation: { completed: true, respondentSide: "acquirer", score: score("STP/STJ") },
    },
    deliverable: {
      ready: true,
      acquirerEnvironmentCode: "NT/STJ",
      targetEnvironmentCode: "NF/NT",
      compatibilityScore: 50,
      riskBand: "MODERATE",
      targetResolutionSource: {
        label: "Target consensus",
        rule: "fallback rule",
        contributors: ["targetDiagnostic", "targetSelfAssessment"],
      },
    },
  };
}

let parityCases = 0;
function parity(label, projection) {
  const legacy = createLegacyHiddenUserAnswersSnapshot(projection.session, projection.deliverable);
  const native = createNativeSafetyEnvelopeArtifact(projection);
  assert.equal(native.json, postClean(legacy.json), `${label}: post-clean JSON parity`);
  assert.equal(native.summary, postClean(legacy.summary), `${label}: post-clean summary parity`);
  parityCases += 1;
  return native;
}

const baseArtifact = parity("F01 all eight blocks", baseProjection());
assert.ok(baseArtifact.summary.includes("Compensation: \u2014 USD (provided)"), "S-1 compensation value must remain MISSING while currency/status remain live");
assert.ok(baseArtifact.summary.includes("Integration timeline: 12 months"), "S-1 integration timeline must remain live");

{
  const projection = baseProjection();
  projection.session.acquirer2A.completed = false;
  projection.session.target2B.finalScore = undefined;
  projection.session.targetSelfAssessment.score.confidence = undefined;
  projection.session.targetSelfAssessment.score.evidenceQuality.confidence = "FALLBACK-CONFIDENCE";
  parity("F02 complete/incomplete, score absent, confidence fallback", projection);
}

for (const [label, resolution] of [
  ["F03 resolution missing", undefined],
  ["F04 resolution string", "targetDiagnostic"],
  ["F05 resolution empty string", ""],
  ["F06 resolution object label", { label: "", rule: "rule-loses-to-empty", contributors: [] }],
  ["F07 resolution object rule", { label: null, rule: 0, contributors: ["targetObservation"] }],
]) {
  const projection = baseProjection();
  projection.deliverable.targetResolutionSource = resolution;
  parity(label, projection);
}

for (const [label, findings] of [
  ["F08 findings missing", undefined],
  ["F09 findings non-array", { finding: true }],
  ["F10 findings empty", []],
  ["F11 finding pair falsey values", [{ severity: 0, type: "", leftSource: "", rightSource: 0, leftSignalCode: false, rightSignalCode: null }]],
  ["F12 finding non-pair nullish chains", [{ severity: "LOW", type: null, findingType: 0, affectedSources: [""], sourceLabel: "loses", title: "loses", explanation: "", evidenceBasis: "loses" }]],
]) {
  const projection = baseProjection();
  projection.session.preliminaryAssessment.contradictionReport.findings = findings;
  parity(label, projection);
}

{
  const projection = baseProjection();
  const data = projection.session.dealContext.data;
  projection.session.dealContext = {
    acquirerName: "Root Acquirer",
    targetName: "Root Target",
    averageAnnualCompensationPerKeyPerson: "",
    averageAnnualCompensation: 9,
    averageAnnualCompensationCurrency: 0,
    compensationCurrency: "USD",
    averageAnnualCompensationStatus: "",
    compensationStatus: "fallback",
    integrationTimeline: data.integrationTimeline,
  };
  parity("F13 deal root fallback and nullish chains", projection);
}

for (const [label, primaryValue] of [["F14 empty string wins ??", ""], ["F15 zero wins ??", 0]]) {
  const projection = baseProjection();
  projection.session.dealContext.data.averageAnnualCompensationPerKeyPerson = primaryValue;
  projection.session.dealContext.data.averageAnnualCompensation = 123;
  parity(label, projection);
}

for (const [label, presentationValue] of [
  ["null", null],
  ["undefined", undefined],
  ["empty", ""],
  ["space", " "],
  ["false", false],
  ["negative zero", -0],
  ["NaN", Number.NaN],
  ["empty array", []],
  ["multi array", [1, 2]],
]) {
  const projection = baseProjection();
  projection.session.dealContext.data.acquirerName = presentationValue;
  parity(`valueOrMissing ${label}`, projection);
}

for (const [label, numericValue] of [
  ["null", null],
  ["undefined", undefined],
  ["empty", ""],
  ["space", " "],
  ["empty array", []],
  ["multi array", [1, 2]],
  ["numeric string", "2.0"],
]) {
  const projection = baseProjection();
  projection.session.preliminaryAssessment.triageReport.triggerCount = numericValue;
  parity(`numberOrMissing ${label}`, projection);
}

{
  const projection = baseProjection();
  projection.session.acquirer2A.data.respondentSide = "";
  projection.session.acquirer2A.respondentSide = "fallback-must-lose";
  projection.session.acquirer2A.score.confidence = "";
  projection.session.acquirer2A.score.evidenceQuality.confidence = "fallback-must-lose";
  parity("F15B empty string wins respondent/confidence nullish chains", projection);
}

{
  const projection = baseProjection();
  projection.session.acquirer2A.score.questionResponses = [
    { questionId: "Q0", missing: true, selectedOption: "A", signalCodes: ["NT/STJ"] },
    { questionId: "", selectedOption: "", excludedFromPrimaryScoring: true, signalCodes: ["NT/STJ"] },
    { questionId: 0, selectedOption: 0, signalCodes: "NT/STJ" },
    { questionId: "Q3", selectedOption: false, signalCodes: ["NT/STJ", "NF/NT"] },
  ];
  parity("F16 response missing/excluded, question truthiness, signal shapes", projection);
}

{
  const projection = baseProjection();
  const weighted = Object.fromEntries(ENVIRONMENT_CODES.map((code) => [code, 0]));
  const raw = Object.fromEntries(ENVIRONMENT_CODES.map((code) => [code, 0]));
  projection.session.acquirer2A.score.weightedEnvironmentScores = weighted;
  projection.session.acquirer2A.score.environmentScores = raw;
  projection.session.acquirer2A.score.primarySignalScore = 0.3;
  projection.session.acquirer2A.score.secondarySignalScore = 0.2;
  parity("F17 weighted ties, all-zero scores, binary64 margin tail", projection);
}

for (let contributorCount = 0; contributorCount <= 3; contributorCount += 1) {
  const projection = baseProjection();
  projection.deliverable.targetResolutionSource.contributors = MODULE_IDS.slice(0, contributorCount);
  parity(`F18 contributors ${contributorCount}`, projection);
}

const reachableValues = new Set();
let onLatticePairs = 0;
let offLatticePairs = 0;
let homogeneousPairs = 0;
for (const acquirerCode of ENVIRONMENT_CODES) {
  for (const targetCode of ENVIRONMENT_CODES) {
    const projection = baseProjection();
    const ecs = canonicalStructuralEcs(acquirerCode, targetCode).ecs;
    projection.deliverable.acquirerEnvironmentCode = acquirerCode;
    projection.deliverable.targetEnvironmentCode = targetCode;
    projection.deliverable.compatibilityScore = ecs;
    projection.deliverable.riskBand = "ORACLE";
    parity(`ECS ${acquirerCode} x ${targetCode}`, projection);
    reachableValues.add(ecs);
    const compiled = compileNativeSafetyEnvelopeV1(projection);
    const semantic = SemanticKernelV1(compiled.capsule);
    if (semantic.latticeState === "ON_LATTICE") onLatticePairs += 1;
    else offLatticePairs += 1;
    if (acquirerCode === targetCode) {
      homogeneousPairs += 1;
      assert.equal(ecs, 100, "homogeneous pair ECS must remain 100");
      assert.equal(semantic.latticeState, "ON_LATTICE");
      assert.equal(semantic.latticeK, 0);
    }
  }
}
assert.equal(reachableValues.size, 21, "real production oracle must expose 21 reachable ECS values");
assert.equal(onLatticePairs, 43, "real production oracle must keep 43 ON-LATTICE pairs");
assert.equal(offLatticePairs, 38, "real production oracle must keep 38 OFF-LATTICE pairs");
assert.equal(homogeneousPairs, 9, "all nine homogeneous pairs must be exercised");
const valueLevelStates = [...reachableValues].map((compatibilityScore) => {
  const projection = baseProjection();
  projection.deliverable.compatibilityScore = compatibilityScore;
  return SemanticKernelV1(compileNativeSafetyEnvelopeV1(projection).capsule).latticeState;
});
assert.equal(valueLevelStates.filter((state) => state === "ON_LATTICE").length, 12);
assert.equal(valueLevelStates.filter((state) => state === "OFF_LATTICE").length, 9);

for (const [label, compatibilityScore] of [
  ["F19 ECS undefined", undefined],
  ["F20 ECS NaN", Number.NaN],
  ["F21 ECS Infinity", Number.POSITIVE_INFINITY],
  ["F22 ECS nonnumeric", "not-a-number"],
]) {
  const projection = baseProjection();
  projection.deliverable.compatibilityScore = compatibilityScore;
  parity(label, projection);
}

{
  const projection = baseProjection();
  delete projection.session.preliminaryAssessment;
  parity("F23 D11 preliminaryAssessment absence", projection);
}

{
  const projection = baseProjection();
  const longValue = "界".repeat(25000);
  projection.session.dealContext.data.acquirerName = `Команда 🧭 e\u0301 ${longValue}`;
  projection.session.dealContext.data.targetName = "\u0000Target\u0000";
  projection.session.targetSelfAssessment.score.questionResponses[0].selectedOption = "emoji 👩🏽‍💻 / combining A\u030A";
  parity("F24 unicode emoji combining NUL long lawful presentation", projection);
}

{
  const projection = baseProjection();
  const repeated = { marker: "repeated-sibling" };
  projection.session.repeatedA = repeated;
  projection.session.repeatedB = repeated;
  projection.session.recordedAt = new Date("2026-08-19T12:34:56.000Z");
  projection.session.circular = projection.session;
  parity("F25 stableJsonValue cycles repeated sibling Date", projection);
}

console.log("NSE parity validation passed");
console.log(`post-clean parity cases: ${parityCases}`);
console.log(`reachable ECS values: ${reachableValues.size}`);
console.log(`pair lattice states: ${onLatticePairs} ON / ${offLatticePairs} OFF`);
