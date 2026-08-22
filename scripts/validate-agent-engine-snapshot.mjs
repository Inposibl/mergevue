import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import {
  BRANCH_CODES,
  FINALITY,
  FINALITY_BY_BRANCH,
  FREE_INTERPRETATION_MODE,
  FREE_INTERPRETATION_MODE_BY_BRANCH,
  P0C_EXTERNAL_FREE_INTERPRETATION_MODE,
  P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON,
  SNAPSHOT_SCHEMA_VERSION,
  SUPPRESSION_BY_BRANCH,
  UNRESOLVED_REASON,
} from "../src/agent/agentContractConstants.js";
import {
  CanonicalSerializeError,
  canonicalSerialize,
  sha256PrefixedDigest,
} from "../src/agent/canonicalDigest.js";
import {
  AgentBoundaryAssemblyError,
  assembleEngineSnapshot,
  computeEngineSnapshotDigest,
  deriveFreeInterpretationMode,
  engineSnapshotDigestCoveredContent,
  normalizeCandidatePair,
} from "../src/agent/engineSnapshot.js";
import {
  buildDualRespondentCorpusConfig,
  compareDualRespondents,
  dualQualityConfig,
} from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule, resolveObservationScope } from "../src/flow/observationScopeResolver.js";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const QUALITY = dualQualityConfig();
const CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);

function answer(overrides = {}) {
  return {
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    knowledgeLevel: "first_hand",
    confidence: "high",
    reliabilityFlags: [],
    ...overrides,
  };
}

function fill(template = {}, except = {}) {
  const out = {};
  for (const question of QUESTIONS) {
    out[question] = answer({ ...template, ...(except[question] ?? {}) });
  }
  return out;
}

const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
const LINE = { roleCode: "ic", seniorityLevel: "manager" };
const EXTERNAL = { roleCode: "key_customer", seniorityLevel: "external" };

const results = [];
function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput, overrides = {}) {
  return {
    diagnosticId: "diag-a1",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    ...overrides,
  };
}

function assembleFrom(coreInput, identityOverrides = {}) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input, identityOverrides),
    coreInput: input,
  });
  return { coreOutput, snapshot, coreInput: input };
}

function reversePair(value) {
  const parts = String(value).split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return value;
  return `${parts[1]} vs ${parts[0]}`;
}

function pairRow(coreOutput, questionRef) {
  return coreOutput.audit.pairRows.find((row) => row.questionRef === questionRef);
}

function observationOf(snapshot, questionRef, slot) {
  return snapshot.engine.observations.find((row) => row.questionRef === questionRef && row.respondentSlot === slot);
}

function coreHighDivergeRefs(coreOutput) {
  const highs = coreOutput.audit.highResolvers ?? [];
  return (coreOutput.audit.pairRows ?? [])
    .filter((row) => (
      highs.includes(row.questionRef)
      && row.diverge === true
      && row.left?.scope?.useClass === "PRIMARY"
      && row.right?.scope?.useClass === "PRIMARY"
      && row.quality >= QUALITY.thresholdMedium
    ))
    .map((row) => row.questionRef);
}

function assertRoutingPreserved(snapshot, coreOutput) {
  assert.equal(snapshot.engine.outcome.engineRoutingMetadata, coreOutput.routing);
  assert.equal(snapshot.engine.outcome.engineOutput, coreOutput.output);
  assert.equal(snapshot.engine.outcome.classificationOutcome, coreOutput.classificationOutcome);
  assert.equal(snapshot.engine.outcome.outcomeClass, coreOutput.outcomeClass);
  assert.equal(snapshot.engine.outcome.priority, coreOutput.priority);
  assert.equal(snapshot.engine.outcome.state, coreOutput.state ?? null);
  assert.equal(snapshot.engine.outcome.genericContradictionEngineInvoked, coreOutput.genericContradictionEngineInvoked);
  assert.deepEqual(snapshot.engine.outcome.contradictionCandidates, [...coreOutput.contradictionCandidates]);
}

function assertSuppression(snapshot, branchCode) {
  assert.deepEqual(snapshot.engine.outcome.suppression, { ...SUPPRESSION_BY_BRANCH[branchCode] });
}

function assertFinality(snapshot, branchCode) {
  assert.equal(snapshot.engine.outcome.finality, FINALITY_BY_BRANCH[branchCode]);
}

function transportedUnresolvedReason(coreOutput) {
  return Object.hasOwn(coreOutput.audit ?? {}, "unresolvedReason") ? coreOutput.audit.unresolvedReason : undefined;
}

function assertVerbatimComparison(snapshot, coreOutput) {
  const audit = coreOutput.audit ?? {};
  if (!Array.isArray(audit.pairRows)) {
    assert.equal(snapshot.engine.comparison.available, false);
    assert.equal(snapshot.engine.observations.length, 0);
    assert.equal(snapshot.engine.comparison.coverage.insufficientCount, null);
    assert.equal(snapshot.engine.comparison.agreement.effectiveAgreeCount, null);
    return;
  }

  assert.equal(snapshot.engine.comparison.available, true);
  assert.equal(snapshot.engine.observations.length, 22);
  assert.equal(snapshot.engine.comparison.coverage.insufficientCount, audit.insufficientCount);
  assert.equal(snapshot.engine.comparison.agreement.rawAgreeCount, audit.rawAgreeCount);
  assert.equal(snapshot.engine.comparison.agreement.effectiveAgreeCount, audit.agreeCount);
  assert.deepEqual(snapshot.engine.comparison.highResolvers.definedForPair, [...audit.highResolvers]);
  assert.deepEqual(snapshot.engine.comparison.highResolvers.divergeRefs, coreHighDivergeRefs(coreOutput));
  assert.equal(snapshot.engine.comparison.highResolvers.allBothLackComparablePrimary, audit.highAllBothLackComparablePrimary);
  assert.equal(snapshot.engine.comparison.highResolvers.anyNotPrimaryBoth, audit.highNotPrimaryBoth);
  assert.equal("pairRows" in snapshot.engine.outcome.engineAuditRaw, false);
  assert.equal(snapshot.engine.outcome.engineAuditRaw.insufficientCount, audit.insufficientCount);
  assert.deepEqual(snapshot.engine.outcome.engineAuditRaw.precedenceOrder, audit.precedenceOrder);

  for (const questionRef of QUESTIONS) {
    const row = pairRow(coreOutput, questionRef);
    const left = observationOf(snapshot, questionRef, "R1");
    const right = observationOf(snapshot, questionRef, "R2");
    assert.equal(left.questionRef, questionRef);
    assert.equal(left.selectedOption, row.left.selectedOption);
    assert.equal(right.selectedOption, row.right.selectedOption);
    assert.equal(left.useClass, row.left.scope.useClass);
    assert.equal(right.useClass, row.right.scope.useClass);
    assert.equal(left.semanticClass, row.left.scope.semanticClass);
    assert.deepEqual(left.semanticClassEffect, row.left.scope.semanticClassEffect ?? null);
    assert.deepEqual(right.semanticClassEffect, row.right.scope.semanticClassEffect ?? null);
    assert.equal(left.comparisonEligible, row.left.scope.comparisonEligible);
    assert.equal(left.comparisonAvailability, row.left.scope.comparisonAvailability);
    assert.equal(left.seniorityTier, row.left.scope.seniorityTier);
    assert.equal(left.expectedVantage, row.left.scope.expectedVantage);
    assert.equal(left.respondentSide, null);
    assert.equal(right.respondentSide, null);
    assert.equal(row.left.scope.causalDisposition, null);
    assert.deepEqual(left.causalDisposition, row.left.causalDisposition);
    assert.deepEqual(right.causalDisposition, row.right.causalDisposition);
    const qualityRow = snapshot.engine.comparison.perQuestionQuality.find((item) => item.questionRef === questionRef);
    assert.equal(qualityRow.fourFactorProduct, row.quality);
    assert.equal(qualityRow.comparable, row.comparable);
    assert.equal(qualityRow.agree, row.agree);
    assert.equal(qualityRow.diverge, row.diverge);
  }
}

function assertQualityThresholds(snapshot) {
  assert.equal(snapshot.engine.comparison.qualityConfig.thresholdHigh, QUALITY.thresholdHigh);
  assert.equal(snapshot.engine.comparison.qualityConfig.thresholdMedium, QUALITY.thresholdMedium);
  assert.equal(snapshot.engine.comparison.qualityConfig.thresholdLow, QUALITY.thresholdLow);
  assert.equal(snapshot.engine.comparison.qualityConfig.thresholdExclude, QUALITY.thresholdExclude);
  assert.equal(snapshot.engine.comparison.qualityConfig.productNote, QUALITY.productNote);
  assert.equal(snapshot.engine.comparison.agreement.agreementExclusionKnowledgeLevel, QUALITY.agreementCountExcludeKnowledgeLevel);
  assert.equal(snapshot.engine.comparison.coverage.coverageInsufficientMin, CORPUS_CONFIG.classification.coverageInsufficientMin);
}

function assertSnapshotEnvelope(snapshot, coreInput, branchCode) {
  assert.equal(snapshot.snapshotSchemaVersion, SNAPSHOT_SCHEMA_VERSION);
  assert.match(snapshot.engineSnapshotDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(snapshot.engine.outcome.branchCode, branchCode);
  assert.equal(snapshot.identity.candidatePair, coreInput.candidatePair ?? "");
  assert.equal(snapshot.identity.candidatePairNormalized, normalizeCandidatePair(coreInput.candidatePair ?? ""));
  assert.equal(snapshot.identity.instrumentSourceWorkbook, scoringAndTriage.dualRespondentComparison.sourceWorkbook);
  assert.equal(snapshot.identity.runtime.layeredEvidenceScoringVersion, null);
  assert.deepEqual(snapshot.identity.questionUniverse, QUESTIONS);
  assertQualityThresholds(snapshot);
}

const BRANCH_INPUTS = {
  P_0A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_0B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/NT vs STJ/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_0C: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_1: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill({}, {
      Q1: { selectedOption: "E" },
      Q2: { selectedOption: "E" },
      Q3: { selectedOption: "E" },
      Q4: { selectedOption: "E" },
      Q5: { selectedOption: "E" },
      Q7: { selectedOption: "E" },
      Q8: { selectedOption: "E" },
      Q9: { selectedOption: "E" },
    }),
  },
  P_1B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
  },
  P_2: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    outOfPairEvidence: true,
    answers1: fill(),
    answers2: fill(),
  },
  P_3A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  },
  P_3: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q4: { selectedOption: "B" }, Q7: { selectedOption: "B" } }),
  },
  P_4: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q1: { selectedOption: "B" } }),
  },
  P_5X: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    coherenceAmbiguous: true,
    answers1: fill(),
    answers2: fill(),
  },
  P_5A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_5B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q5: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q8: { selectedOption: "B" },
    }),
  },
  UNMATCHED: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "B" }, {
      Q1: { selectedOption: "A" },
      Q2: { selectedOption: "A" },
      Q3: { selectedOption: "A" },
      Q11: { selectedOption: "C" },
    }),
  },
};

check("B1", "branch totality: every accepted branch is produced by a lawful Core invocation", () => {
  const seen = [];
  for (const branchCode of BRANCH_CODES) {
    const coreInput = BRANCH_INPUTS[branchCode];
    assert.ok(coreInput, `missing Core fixture for ${branchCode}`);
    const { coreOutput, snapshot } = assembleFrom(coreInput);
    assert.equal(snapshot.engine.outcome.branchCode, branchCode);
    assertSnapshotEnvelope(snapshot, withFlags(coreInput), branchCode);
    assertRoutingPreserved(snapshot, coreOutput);
    assertFinality(snapshot, branchCode);
    assertSuppression(snapshot, branchCode);
    assertVerbatimComparison(snapshot, coreOutput);
    seen.push(branchCode);
  }
  assert.deepEqual(seen, [...BRANCH_CODES]);
});

check("B2", "finality mapping is exactly the accepted table", () => {
  assert.equal(FINALITY_BY_BRANCH.P_5A, FINALITY.FINAL_STATE);
  assert.equal(FINALITY_BY_BRANCH.P_5B, FINALITY.FINAL_STATE);
  assert.equal(FINALITY_BY_BRANCH.P_3, FINALITY.FINAL_STATE);
  assert.equal(FINALITY_BY_BRANCH.P_4, FINALITY.FINAL_STATE);
  assert.equal(FINALITY_BY_BRANCH.P_1, FINALITY.SUPPRESSED);
  assert.equal(FINALITY_BY_BRANCH.P_1B, FINALITY.SUPPRESSED);
  assert.equal(FINALITY_BY_BRANCH.P_0A, FINALITY.PRECONDITION_FAILED);
  assert.equal(FINALITY_BY_BRANCH.P_0B, FINALITY.PRECONDITION_FAILED);
  assert.equal(FINALITY_BY_BRANCH.P_0C, FINALITY.NON_FINAL_ROUTED);
  assert.deepEqual(Object.keys(FINALITY_BY_BRANCH).sort(), [...BRANCH_CODES].sort());
});

check("B3", "suppression mapping is exact and P_1B remains narrow", () => {
  for (const branchCode of BRANCH_CODES) {
    const suppression = SUPPRESSION_BY_BRANCH[branchCode];
    assert.equal(suppression.comparatorOutputSuppressed, branchCode === "P_1" || branchCode === "P_1B");
    assert.equal(suppression.pairEvaluationSuppressed, branchCode === "P_1B");
    assert.equal(suppression.prohibitedFallbackActive, branchCode === "P_1B");
    assert.equal(suppression.determinationImpossible, branchCode === "P_1B" ? "NF/SFP" : null);
    assert.equal(suppression.comparatorDidNotRun, branchCode === "P_0A" || branchCode === "P_0B");
  }
  const unknown = { selectedOption: "A", evidenceType: "unknown" };
  const genericOneHigh = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: unknown }),
    answers2: fill({ selectedOption: "A" }, { Q11: unknown }),
  });
  assert.equal(genericOneHigh.snapshot.engine.outcome.branchCode, "P_1");
  assert.equal(genericOneHigh.coreOutput.audit.exact1bSpecialCondition, false);
  assert.equal(genericOneHigh.snapshot.engine.outcome.suppression.pairEvaluationSuppressed, false);
});

check("B4", "FREE interpretation mode keys on branchCode, not routing nullability", () => {
  assert.equal(deriveFreeInterpretationMode("P_5A"), FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode("P_5B"), FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode("P_3"), FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode("P_4"), FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode("P_1"), FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode("P_0A"), FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE);
  const fiveA = assembleFrom(BRANCH_INPUTS.P_5A);
  const oneB = assembleFrom(BRANCH_INPUTS.P_1B);
  const threeA = assembleFrom(BRANCH_INPUTS.P_3A);
  assert.equal(fiveA.coreOutput.routing, "① CONVERGENT");
  assert.equal(deriveFreeInterpretationMode(fiveA.snapshot.engine.outcome.branchCode), FREE_INTERPRETATION_MODE_BY_BRANCH.P_5A);
  assert.equal(oneB.coreOutput.routing, threeA.coreOutput.routing);
  assert.equal(deriveFreeInterpretationMode(oneB.snapshot.engine.outcome.branchCode), FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION);
  assert.equal(deriveFreeInterpretationMode(threeA.snapshot.engine.outcome.branchCode), FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION);
});

check("B5", "P_5A/P_5B routing tokens are preserved byte-for-byte", () => {
  const fiveA = assembleFrom(BRANCH_INPUTS.P_5A);
  assert.equal(fiveA.snapshot.engine.outcome.engineRoutingMetadata, "① CONVERGENT");
  assert.equal(fiveA.snapshot.engine.outcome.state, "① CONVERGENT");
  const fiveB = assembleFrom(BRANCH_INPUTS.P_5B);
  assert.equal(fiveB.snapshot.engine.outcome.engineRoutingMetadata, "② PARTIAL CONVERGENCE");
});

check("B6", "P_2 carries provisionalState candidate_4B and explicit invocation flag", () => {
  const result = assembleFrom(BRANCH_INPUTS.P_2);
  assert.equal(result.snapshot.engine.outcome.state, null);
  assert.equal(result.snapshot.engine.outcome.provisionalState, "candidate_4B");
  assert.equal(result.snapshot.engine.comparison.outOfPairEvidenceInput, true);
});

check("B7", "UNMATCHED preserves priority null, unmatched audit, and routing token", () => {
  const result = assembleFrom(BRANCH_INPUTS.UNMATCHED);
  assert.equal(result.coreOutput.priority, null);
  assert.equal(result.coreOutput.audit.unmatched, true);
  assert.equal(result.snapshot.engine.outcome.priority, null);
  assert.equal(result.snapshot.engine.outcome.engineAuditRaw.unmatched, true);
  assert.equal(result.snapshot.engine.outcome.engineRoutingMetadata, "analyst_practitioner_review");
});

check("C3", "respondentSide remains null and causalDisposition is read from pairRows left/right", () => {
  const result = assembleFrom(BRANCH_INPUTS.P_4);
  const left = observationOf(result.snapshot, "Q1", "R1");
  const right = observationOf(result.snapshot, "Q1", "R2");
  assert.equal(left.respondentSide, null);
  assert.equal(right.respondentSide, null);
  assert.equal(pairRow(result.coreOutput, "Q1").left.scope.causalDisposition, null);
  assert.deepEqual(left.causalDisposition, pairRow(result.coreOutput, "Q1").left.causalDisposition);
  assert.equal(left.seniorityTier, "senior");
  assert.equal(right.seniorityTier, "line_level");
});

check("D1", "repeated assembly is identical and independent digest recomputation matches", () => {
  const first = assembleFrom(BRANCH_INPUTS.P_5A);
  const second = assembleFrom(BRANCH_INPUTS.P_5A);
  assert.equal(first.snapshot.engineSnapshotDigest, second.snapshot.engineSnapshotDigest);
  assert.equal(
    first.snapshot.engineSnapshotDigest,
    sha256PrefixedDigest(canonicalSerialize(engineSnapshotDigestCoveredContent(first.snapshot))),
  );
  assert.equal(
    first.snapshot.engineSnapshotDigest,
    computeEngineSnapshotDigest(first.snapshot.engine, first.snapshot.identity.corpus),
  );
});

check("D2", "digest-covered mutation changes the digest; identity fields outside engine+corpus do not", () => {
  const { snapshot } = assembleFrom(BRANCH_INPUTS.P_5A);
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  const mutatedEngine = JSON.parse(JSON.stringify(covered.engine));
  mutatedEngine.outcome.priority = "1";
  const mutatedDigest = computeEngineSnapshotDigest(mutatedEngine, covered.corpus);
  assert.notEqual(mutatedDigest, snapshot.engineSnapshotDigest);

  const renamed = assembleFrom(BRANCH_INPUTS.P_5A, { diagnosticId: "diag-other" });
  assert.notEqual(renamed.snapshot.engineSnapshotDigest, snapshot.engineSnapshotDigest);

  const projectRelabeled = assembleFrom(BRANCH_INPUTS.P_5A, { projectId: "session-1" });
  assert.equal(projectRelabeled.snapshot.engineSnapshotDigest, snapshot.engineSnapshotDigest);
});

check("D3", "canonical serialization is key-order stable and rejects unsupported values", () => {
  assert.equal(canonicalSerialize({ b: 2, a: 1 }), canonicalSerialize({ a: 1, b: 2 }));
  assert.notEqual(canonicalSerialize([1, 2]), canonicalSerialize([2, 1]));
  assert.throws(() => canonicalSerialize({ x: undefined }), CanonicalSerializeError);
  assert.throws(() => canonicalSerialize(Number.NaN), CanonicalSerializeError);
});

check("D4", "sealed snapshot is immutable", () => {
  const { snapshot } = assembleFrom(BRANCH_INPUTS.P_1B);
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.engine.outcome.suppression));
  assert.throws(() => {
    snapshot.engine.outcome.priority = "1";
  });
  assert.equal(snapshot.engine.outcome.priority, "1b");
});

check("P1", "candidatePairNormalized matches Core production-pair normalization in both directions", () => {
  const rawPairs = scoringAndTriage.dualRespondentComparison.pairSpecificWeights.map((row) => row.candidatePair);
  const boundaryUnique = [...new Set(rawPairs.map((pair) => normalizeCandidatePair(pair)))];
  assert.deepEqual(boundaryUnique, [...CORPUS_CONFIG.productionPairs]);
  for (const productionPair of CORPUS_CONFIG.productionPairs) {
    for (const candidatePair of [productionPair, reversePair(productionPair)]) {
      const { coreOutput, snapshot } = assembleFrom({
        moduleId: "acquirerEnvironment",
        candidatePair,
        respondent1: SENIOR,
        respondent2: SENIOR,
        answers1: fill(),
        answers2: fill(),
      });
      assert.notEqual(coreOutput.priority, "0b");
      assert.equal(snapshot.identity.candidatePair, candidatePair);
      assert.equal(snapshot.identity.candidatePairNormalized, productionPair);
    }
  }
});

check("M1", "targetSelfAssessment identity is bound to the Core invocation module", () => {
  const result = assembleFrom({
    moduleId: "targetSelfAssessment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.snapshot.identity.moduleId, "targetSelfAssessment");
  assert.equal(result.coreInput.moduleId, "targetSelfAssessment");
  assert.equal(result.snapshot.engine.outcome.branchCode, "P_5A");
  assert.equal(observationOf(result.snapshot, "Q1", "R1").observationRef, "qref://diag-a1/targetSelfAssessment/Q1/R1");
});

check("N1", "identity mismatch with a valid Core output fails closed", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const coreOutput = compareDualRespondents(coreInput);
  assert.throws(
    () => assembleEngineSnapshot({
      coreOutput,
      identityContext: identityFor(coreInput, { moduleId: "targetSelfAssessment" }),
      coreInput,
    }),
    AgentBoundaryAssemblyError,
  );
  assert.throws(
    () => assembleEngineSnapshot({
      coreOutput,
      identityContext: identityFor(coreInput, { candidatePair: "NF/SFJ vs NF/SFP" }),
      coreInput,
    }),
    AgentBoundaryAssemblyError,
  );
});

check("N2", "mutating only priority on a valid Core output fails closed", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const coreOutput = compareDualRespondents(coreInput);
  const mutated = { ...coreOutput, priority: "1" };
  assert.equal(mutated.state, "① CONVERGENT");
  assert.equal(mutated.output, coreOutput.output);
  assert.throws(
    () => assembleEngineSnapshot({
      coreOutput: mutated,
      identityContext: identityFor(coreInput),
      coreInput,
    }),
    AgentBoundaryAssemblyError,
  );
});

check("N3", "null, duplicate, missing, or unsupported questionRef fails closed and emits no qref", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const live = compareDualRespondents(coreInput);

  const nullRef = {
    ...live,
    audit: {
      ...live.audit,
      pairRows: live.audit.pairRows.map((row, index) => (index === 0 ? { ...row, questionRef: null } : row)),
    },
  };
  assert.throws(
    () => assembleEngineSnapshot({ coreOutput: nullRef, identityContext: identityFor(coreInput), coreInput }),
    AgentBoundaryAssemblyError,
  );

  const duplicate = {
    ...live,
    audit: {
      ...live.audit,
      pairRows: live.audit.pairRows.map((row, index) => (index === 1 ? { ...row, questionRef: "Q1" } : row)),
    },
  };
  assert.throws(
    () => assembleEngineSnapshot({ coreOutput: duplicate, identityContext: identityFor(coreInput), coreInput }),
    AgentBoundaryAssemblyError,
  );

  const missing = {
    ...live,
    audit: { ...live.audit, pairRows: live.audit.pairRows.slice(1) },
  };
  assert.throws(
    () => assembleEngineSnapshot({ coreOutput: missing, identityContext: identityFor(coreInput), coreInput }),
    AgentBoundaryAssemblyError,
  );

  const unsupported = {
    ...live,
    audit: {
      ...live.audit,
      pairRows: live.audit.pairRows.map((row, index) => (index === 0 ? { ...row, questionRef: "Q12" } : row)),
    },
  };
  assert.throws(
    () => assembleEngineSnapshot({ coreOutput: unsupported, identityContext: identityFor(coreInput), coreInput }),
    AgentBoundaryAssemblyError,
  );
});

check("N4", "P_2 and P_5X without explicit invocation flags fail closed and do not default false", () => {
  const two = BRANCH_INPUTS.P_2;
  const twoOutput = compareDualRespondents(two);
  assert.equal(twoOutput.priority, "2");
  const twoWithoutFlag = {
    moduleId: two.moduleId,
    candidatePair: two.candidatePair,
    respondent1: two.respondent1,
    respondent2: two.respondent2,
    answers1: two.answers1,
    answers2: two.answers2,
    coherenceAmbiguous: false,
  };
  assert.equal(Object.hasOwn(twoWithoutFlag, "outOfPairEvidence"), false);
  assert.throws(
    () => assembleEngineSnapshot({
      coreOutput: twoOutput,
      identityContext: identityFor(twoWithoutFlag),
      coreInput: twoWithoutFlag,
    }),
    AgentBoundaryAssemblyError,
  );

  const fiveX = BRANCH_INPUTS.P_5X;
  const fiveXOutput = compareDualRespondents(fiveX);
  assert.equal(fiveXOutput.priority, "5X");
  const fiveXWithoutFlag = {
    moduleId: fiveX.moduleId,
    candidatePair: fiveX.candidatePair,
    respondent1: fiveX.respondent1,
    respondent2: fiveX.respondent2,
    answers1: fiveX.answers1,
    answers2: fiveX.answers2,
    outOfPairEvidence: false,
  };
  assert.equal(Object.hasOwn(fiveXWithoutFlag, "coherenceAmbiguous"), false);
  assert.throws(
    () => assembleEngineSnapshot({
      coreOutput: fiveXOutput,
      identityContext: identityFor(fiveXWithoutFlag),
      coreInput: fiveXWithoutFlag,
    }),
    AgentBoundaryAssemblyError,
  );
});

check("N5", "highResolvers.divergeRefs preserve Core quality >= thresholdMedium", () => {
  const degraded = {
    selectedOption: "B",
    evidenceType: "direct_observation",
    knowledgeLevel: "speculative",
    confidence: "low",
    reliabilityFlags: ["overgeneralized", "socially_desirable"],
  };
  const below = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q4: { ...degraded, selectedOption: "A" } }),
    answers2: fill({ selectedOption: "A" }, { Q4: degraded }),
  });
  const q4 = pairRow(below.coreOutput, "Q4");
  assert.equal(q4.diverge, true);
  assert.ok(q4.quality < QUALITY.thresholdMedium);
  assert.equal(below.snapshot.engine.comparison.highResolvers.divergeRefs.includes("Q4"), false);
  assert.deepEqual(below.snapshot.engine.comparison.highResolvers.divergeRefs, coreHighDivergeRefs(below.coreOutput));

  const above = assembleFrom(BRANCH_INPUTS.P_3);
  assert.deepEqual(above.snapshot.engine.comparison.highResolvers.divergeRefs, ["Q4", "Q7"]);
  assert.deepEqual(above.snapshot.engine.comparison.highResolvers.divergeRefs, coreHighDivergeRefs(above.coreOutput));
  assert.ok(pairRow(above.coreOutput, "Q4").quality >= QUALITY.thresholdMedium);
});

check("N6", "P_0C FREE modes consume transported unresolvedReason without re-inference", () => {
  const missing = assembleFrom({
    moduleId: "",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(missing.snapshot.engine.outcome.branchCode, "P_0C");
  assert.equal(transportedUnresolvedReason(missing.coreOutput), UNRESOLVED_REASON.MISSING_MODULE);
  assert.equal(missing.snapshot.engine.outcome.engineAuditRaw.unresolvedReason, UNRESOLVED_REASON.MISSING_MODULE);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: missing.coreOutput.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  );

  const unsupported = assembleFrom({
    moduleId: "environmentLevel1",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(transportedUnresolvedReason(unsupported.coreOutput), UNRESOLVED_REASON.UNSUPPORTED_MODULE);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: unsupported.coreOutput.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  );

  const unspecified = assembleFrom(BRANCH_INPUTS.P_0C);
  assert.equal(transportedUnresolvedReason(unspecified.coreOutput), UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: unspecified.coreOutput.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  );

  const unknown = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "c_suite", seniorityLevel: "not_a_mapped_tier" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(transportedUnresolvedReason(unknown.coreOutput), UNRESOLVED_REASON.UNKNOWN_SENIORITY);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: unknown.coreOutput.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  );

  const questionIdentity = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "QX",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(questionIdentity.audit.unresolvedReason, UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: questionIdentity.audit.unresolvedReason }),
    P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON[UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION],
  );
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: questionIdentity.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  );
});

check("N7", "external-vantage P_0C keeps unresolvedReason null and uses AUTOMATED_UNCERTAINTY_INTERPRETATION", () => {
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: EXTERNAL,
    selectedOption: "A",
  });
  const result = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: EXTERNAL,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(scope.seniorityTier, "external");
  assert.equal(Object.hasOwn(scope.audit, "unresolvedReason"), false);
  assert.equal(result.snapshot.engine.outcome.branchCode, "P_0C");
  assert.equal(result.coreOutput.audit.unresolvedReason, null);
  assert.equal(result.snapshot.engine.outcome.engineAuditRaw.unresolvedReason, null);
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: result.coreOutput.audit.unresolvedReason }),
    P0C_EXTERNAL_FREE_INTERPRETATION_MODE,
  );
  assert.equal(
    deriveFreeInterpretationMode("P_0C", { unresolvedReason: result.coreOutput.audit.unresolvedReason }),
    FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  );
  assert.notEqual(result.coreOutput.audit.unresolvedReason, "unknown_seniority");
  assert.notEqual(result.coreOutput.audit.unresolvedReason, "roleCode_unspecified");
});

check("N8", "semanticClassEffect is projected from repaired Core scope, not reconstructed in A1", () => {
  const result = assembleFrom(BRANCH_INPUTS.P_1B);
  const q11 = pairRow(result.coreOutput, "Q11");
  const left = observationOf(result.snapshot, "Q11", "R1");
  const right = observationOf(result.snapshot, "Q11", "R2");
  assert.equal(q11.left.scope.semanticClass, "OBSERVATION_GAP");
  assert.ok(q11.left.scope.semanticClassEffect);
  assert.deepEqual(left.semanticClassEffect, q11.left.scope.semanticClassEffect);
  assert.deepEqual(right.semanticClassEffect, q11.right.scope.semanticClassEffect);
  const corpusRow = scoringAndTriage.dualRespondentComparison.semanticClassEffects.find((row) => row.semanticclass === "OBSERVATION_GAP");
  assert.equal(q11.left.scope.semanticClassEffect.signalEffect, corpusRow.signaleffect);
  assert.equal(q11.left.scope.semanticClassEffect.useClassEffect, corpusRow.useclasseffect);

  const substantive = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "E" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "E" } }),
  });
  const q11e = pairRow(substantive.coreOutput, "Q11");
  assert.equal(q11e.left.scope.semanticClass, "SUBSTANTIVE_SIGNAL");
  assert.deepEqual(
    observationOf(substantive.snapshot, "Q11", "R1").semanticClassEffect,
    q11e.left.scope.semanticClassEffect,
  );
});

const BINDING_MISMATCH_DETAIL = "coreOutput does not match compareDualRespondents(coreInput)";

function cloneCoreOutput(coreOutput) {
  return structuredClone(coreOutput);
}

function assertBindingTamperRejected(coreInput, lawfulOutput, mutate) {
  const tampered = cloneCoreOutput(lawfulOutput);
  mutate(tampered);
  let snapshot = null;
  let thrown = null;
  try {
    snapshot = assembleEngineSnapshot({
      coreOutput: tampered,
      identityContext: identityFor(coreInput),
      coreInput,
    });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown instanceof AgentBoundaryAssemblyError, "tampered coreOutput was accepted");
  assert.equal(thrown.detail, BINDING_MISMATCH_DETAIL);
  assert.equal(snapshot, null, "an EngineSnapshot was returned for a tampered coreOutput");
}

check("T1", "audit-level deterministic fields are bound to the recomputed Core output", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  assert.equal(lawful.audit.genericPriority1, false);
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.genericPriority1 = true;
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.precedenceOrder = ["tamper", ...out.audit.precedenceOrder];
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.qualitySource = "tampered qualitySource";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.fourFactorProduct = "tampered fourFactorProduct";
  });
});

check("T2", "pairRow declared evidence fields are bound to the recomputed Core output", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  assert.equal(lawful.audit.pairRows[0].left.evidenceType, "direct_observation");
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.evidenceType = "tampered";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.knowledgeLevel = "tampered";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.reliabilityFlags = ["tampered"];
  });
});

check("T3", "causalDisposition deterministic fields and triage flags are bound to the recomputed Core output", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  const disposition = lawful.audit.pairRows[0].left.causalDisposition;
  assert.equal(disposition.forcedInference, false);
  assert.deepEqual(disposition.effectiveTriageFlags, []);
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.causalDisposition.forcedInference = true;
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.causalDisposition.effectiveTriageFlags = ["evasive"];
  });
});

check("T4", "pairRow scope fields are bound to the recomputed Core output", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  assert.equal(lawful.audit.pairRows[0].left.scope.comparisonAvailability, "available");
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.rootCauseFamily = "tampered rootCauseFamily";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.comparisonAvailability = "unavailable";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.comparisonEligible = false;
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.expectedVantage = "tampered expectedVantage";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.canonicalQuestionId = "tampered";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.routing = "tampered routing";
  });

  const oneB = withFlags(BRANCH_INPUTS.P_1B);
  const lawfulOneB = compareDualRespondents(oneB);
  const oneBRootCause = lawfulOneB.audit.pairRows.find((row) => row.questionRef === "Q11").left.scope.rootCauseFamily;
  assert.ok(oneBRootCause != null);
  assertBindingTamperRejected(oneB, lawfulOneB, (out) => {
    const row = out.audit.pairRows.find((item) => item.questionRef === "Q11");
    row.left.scope.rootCauseFamily = "tampered rootCauseFamily";
  });
});

check("T5", "pairRow scope.audit access fields are bound to the recomputed Core output", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  assert.equal(lawful.audit.pairRows[0].left.scope.audit.directObservationGate, "yes");
  assert.equal(lawful.audit.pairRows[0].left.scope.audit.accessAdjudicated, false);
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.audit.directObservationGate = "no";
  });
  assertBindingTamperRejected(coreInput, lawful, (out) => {
    out.audit.pairRows[0].left.scope.audit.accessAdjudicated = true;
  });
});

check("T6", "contract-impossible scope combination fails closed before snapshot sealing", () => {
  const coreInput = withFlags(BRANCH_INPUTS.P_5A);
  const lawful = compareDualRespondents(coreInput);
  const tampered = cloneCoreOutput(lawful);
  const scope = tampered.audit.pairRows[0].left.scope;
  scope.comparisonAvailability = "unavailable";
  scope.comparisonEligible = true;
  assert.equal(scope.comparisonAvailability, "unavailable");
  assert.equal(scope.comparisonEligible, true);
  let snapshot = null;
  let thrown = null;
  try {
    snapshot = assembleEngineSnapshot({
      coreOutput: tampered,
      identityContext: identityFor(coreInput),
      coreInput,
    });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown instanceof AgentBoundaryAssemblyError, "impossible combination was accepted");
  assert.equal(thrown.detail, BINDING_MISMATCH_DETAIL);
  assert.equal(snapshot, null, "an EngineSnapshot was sealed for an impossible combination");
});

check("T7", "positive control: untouched cloned real Core output assembles to the identical snapshot", () => {
  for (const fixture of [BRANCH_INPUTS.P_5A, BRANCH_INPUTS.P_1B, BRANCH_INPUTS.P_0C]) {
    const coreInput = withFlags(fixture);
    const coreOutput = compareDualRespondents(coreInput);
    const direct = assembleEngineSnapshot({ coreOutput, identityContext: identityFor(coreInput), coreInput });
    const fromClone = assembleEngineSnapshot({
      coreOutput: cloneCoreOutput(coreOutput),
      identityContext: identityFor(coreInput),
      coreInput,
    });
    assert.equal(fromClone.snapshotSchemaVersion, direct.snapshotSchemaVersion);
    assert.equal(fromClone.engineSnapshotDigest, direct.engineSnapshotDigest);
    assert.equal(canonicalSerialize(fromClone), canonicalSerialize(direct));
    assert.ok(Object.isFrozen(fromClone));
  }
});

function collectMutableLeaves(value, path, leaves) {
  if (value === undefined || value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    if (value.length === 0) {
      leaves.push(path);
      return;
    }
    value.forEach((item, index) => {
      const itemPath = [...path, String(index)];
      if (item === undefined || item === null || typeof item !== "object") leaves.push(itemPath);
      else collectMutableLeaves(item, itemPath, leaves);
    });
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    if (child === undefined || child === null || typeof child !== "object") leaves.push(childPath);
    else collectMutableLeaves(child, childPath, leaves);
  }
}

function tamperedLeafValue(current) {
  if (current === undefined) return "tamper-was-undefined";
  if (current === null) return "tamper-was-null";
  if (typeof current === "string") return `${current}~tamper`;
  if (typeof current === "number") return current + 1;
  if (typeof current === "boolean") return !current;
  if (Array.isArray(current)) return ["tamper"];
  return "tamper-opaque";
}

function applyLeafTamper(root, path) {
  const parent = path.slice(0, -1).reduce((node, key) => node[key], root);
  const leafKey = path[path.length - 1];
  parent[leafKey] = tamperedLeafValue(parent[leafKey]);
}

check("T8", "binding completeness: every mutable leaf of the full recomputed Core output participates in binding", () => {
  const fiveA = withFlags(BRANCH_INPUTS.P_5A);
  const lawfulFiveA = compareDualRespondents(fiveA);
  const leaves = [];
  collectMutableLeaves(lawfulFiveA, [], leaves);
  const paths = new Set(leaves.map((path) => path.join(".")));
  const anchors = [
    "priority",
    "routing",
    "contradictionCandidates",
    "genericContradictionEngineInvoked",
    "audit.genericPriority1",
    "audit.precedenceOrder.0",
    "audit.qualitySource",
    "audit.fourFactorProduct",
    "audit.highResolvers.0",
    "audit.pairRows.0.questionRef",
    "audit.pairRows.0.quality",
    "audit.pairRows.0.left.selectedOption",
    "audit.pairRows.0.left.evidenceType",
    "audit.pairRows.0.left.knowledgeLevel",
    "audit.pairRows.0.left.confidence",
    "audit.pairRows.0.left.reliabilityFlags",
    "audit.pairRows.0.left.causalDisposition.forcedInference",
    "audit.pairRows.0.left.causalDisposition.effectiveTriageFlags",
    "audit.pairRows.0.left.scope.rootCauseFamily",
    "audit.pairRows.0.left.scope.comparisonAvailability",
    "audit.pairRows.0.left.scope.comparisonEligible",
    "audit.pairRows.0.left.scope.expectedVantage",
    "audit.pairRows.0.left.scope.canonicalQuestionId",
    "audit.pairRows.0.left.scope.routing",
    "audit.pairRows.0.left.scope.audit.directObservationGate",
    "audit.pairRows.0.left.scope.audit.accessAdjudicated",
    "audit.pairRows.0.left.scope.audit.optionCode",
  ];
  for (const anchor of anchors) {
    assert.ok(paths.has(anchor), `leaf enumeration did not reach ${anchor}`);
  }
  assert.ok(leaves.length > 900, `suspiciously small leaf enumeration: ${leaves.length}`);
  for (const path of leaves) {
    const tampered = cloneCoreOutput(lawfulFiveA);
    applyLeafTamper(tampered, path);
    assert.throws(
      () => assembleEngineSnapshot({
        coreOutput: tampered,
        identityContext: identityFor(fiveA),
        coreInput: fiveA,
      }),
      AgentBoundaryAssemblyError,
      `mutation at ${path.join(".")} was not rejected`,
    );
  }

  const zeroC = withFlags(BRANCH_INPUTS.P_0C);
  const lawfulZeroC = compareDualRespondents(zeroC);
  const zeroCLeaves = [];
  collectMutableLeaves(lawfulZeroC, [], zeroCLeaves);
  assert.equal(zeroCLeaves.length, 10);
  for (const path of zeroCLeaves) {
    const tampered = cloneCoreOutput(lawfulZeroC);
    applyLeafTamper(tampered, path);
    assert.throws(
      () => assembleEngineSnapshot({
        coreOutput: tampered,
        identityContext: identityFor(zeroC),
        coreInput: zeroC,
      }),
      AgentBoundaryAssemblyError,
      `mutation at ${path.join(".")} was not rejected`,
    );
  }
});

check("F2", "A1 source has no numeric-probability or withdrawn-classifier surface", () => {
  const files = [
    "../src/agent/agentContractConstants.js",
    "../src/agent/canonicalDigest.js",
    "../src/agent/engineSnapshot.js",
  ];
  const forbidden = [
    /\bprobabilityScore\b/,
    /\blikelihoodPercent\b/,
    /\bconfidencePercent\b/,
    /\bsupportScore\b/,
    /\bweightedSupport\b/,
    /\bprobability\s*:/,
    /\bSTRONG\b/,
    /\bMODERATE\b/,
    /\bLIMITED\b/,
    /\bINSUFFICIENT\b/,
  ];
  for (const relative of files) {
    const source = readFileSync(new URL(relative, import.meta.url), "utf8");
    for (const pattern of forbidden) {
      assert.equal(pattern.test(source), false, `${relative} matched ${pattern}`);
    }
  }
});

console.log("Agent EngineSnapshot slice A1 CORR2 cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
