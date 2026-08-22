import assert from "node:assert/strict";
import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import {
  DualRespondentCorpusConfigurationError,
  buildDualRespondentCorpusConfig,
  compareDualRespondents,
  createDualRespondentComparator,
  dualPrecedenceOrder,
  dualQualityConfig,
} from "../src/flow/dualRespondentComparison.js";
import { readFileSync } from "node:fs";
import { deriveObservationScopeCausalDisposition } from "../src/flow/layeredEvidenceScoring.js";
import {
  ObservationScopeCorpusConfigurationError,
  buildObservationScopeCorpusConfig,
  createObservationScopeResolver,
  resolveObservationScope,
} from "../src/flow/observationScopeResolver.js";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const QUALITY = dualQualityConfig();

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

function scope(overrides) {
  return resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: SENIOR,
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
    ...overrides,
  });
}

const results = [];
function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

check(1, "senior AEM Q1 → PRIMARY", () => {
  const result = scope({});
  assert.equal(result.useClass, "PRIMARY");
  assert.equal(result.questionRef, "Q1");
});

check(2, "line-level AEM Q1 → CONTEXTUAL", () => {
  assert.equal(scope({ respondent: LINE }).useClass, "CONTEXTUAL");
});

check(3, "line-level AEM Q2 → INELIGIBLE", () => {
  assert.equal(scope({ workbookQuestionId: "Q2", canonicalQuestionId: "ACQUIRERENVIRONMENT-Q2", respondent: LINE }).useClass, "INELIGIBLE");
});

check(4, "external → UNRESOLVED", () => {
  const result = scope({ respondent: EXTERNAL });
  assert.equal(result.useClass, "UNRESOLVED");
  assert.equal(result.routing, "practitioner_access_review");
});

check(5, "unspecified → UNRESOLVED + stop", () => {
  const result = scope({ respondent: { roleCode: "unspecified", seniorityLevel: "c_suite" } });
  assert.equal(result.useClass, "UNRESOLVED");
  assert.equal(result.routing, "practitioner_access_review");
});

check(6, "Q11 E → SUBSTANTIVE_SIGNAL", () => {
  const result = scope({
    workbookQuestionId: "Q11",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q11",
    selectedOption: "E",
  });
  assert.equal(result.semanticClass, "SUBSTANTIVE_SIGNAL");
  assert.equal(result.comparisonAvailability, "available");
});

check(7, "Q10 E → AMBIGUOUS_COLLAPSE unavailable", () => {
  const result = scope({
    workbookQuestionId: "Q10",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q10",
    selectedOption: "E",
  });
  assert.equal(result.semanticClass, "AMBIGUOUS_COLLAPSE");
  assert.equal(result.comparisonAvailability, "unavailable");
  assert.equal(result.comparisonEligible, false);
});

check(8, "directObservationGate=no + substantive → CONTEXTUAL ceiling", () => {
  assert.equal(scope({ directObservationGate: "no" }).useClass, "CONTEXTUAL");
});

check(9, "hypothetical → CONTEXTUAL ceiling", () => {
  assert.equal(scope({ evidenceType: "hypothetical" }).useClass, "CONTEXTUAL");
});

check(10, "unknown → comparison unavailable", () => {
  const result = scope({ evidenceType: "unknown" });
  assert.equal(result.comparisonAvailability, "unavailable");
});

check(11, "inference alone leaves UseClass unchanged", () => {
  const baseline = scope({});
  const inferred = scope({ evidenceType: "inference" });
  assert.equal(baseline.useClass, "PRIMARY");
  assert.equal(inferred.useClass, "PRIMARY");
  assert.equal(inferred.useClass, baseline.useClass);
});

check(12, "same-cause speaks_for_group_without_access no duplicate penalty / no forced inference", () => {
  const accessScope = scope({ respondent: LINE });
  assert.equal(accessScope.useClass, "CONTEXTUAL");
  const disposition = deriveObservationScopeCausalDisposition({
    reliabilityFlags: ["speaks_for_group_without_access"],
    observationScopeAdjudicatedAccess: true,
  });
  assert.equal(disposition.forcedInference, false);
  assert.equal(disposition.reliabilityEffects.evidenceTypeCap, null);
  assert.deepEqual(disposition.suppressedScoringFlags, ["speaks_for_group_without_access"]);
  assert.equal(disposition.reliabilityEffects.numericMultiplier, 1);

  const withFlag = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill(),
    answers2: fill({ reliabilityFlags: ["speaks_for_group_without_access"] }),
  });
  const withoutFlag = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill(),
    answers2: fill(),
  });
  const q1With = withFlag.audit.pairRows.find((row) => row.questionRef === "Q1").quality;
  const q1Without = withoutFlag.audit.pairRows.find((row) => row.questionRef === "Q1").quality;
  assert.equal(q1With, q1Without);
});

check(13, "independent overgeneralized retains existing numeric effect", () => {
  const disposition = deriveObservationScopeCausalDisposition({
    reliabilityFlags: ["overgeneralized"],
    observationScopeAdjudicatedAccess: false,
  });
  assert.equal(disposition.reliabilityEffects.numericMultiplier, 0.5);
  assert.deepEqual(disposition.effectiveScoringFlags, ["overgeneralized"]);
  const compared = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill({ reliabilityFlags: ["overgeneralized"] }),
  });
  const q1 = compared.audit.pairRows.find((row) => row.questionRef === "Q1");
  assert.ok(q1.quality < 1);
  assert.equal(q1.quality, Number((1 * 1 * 1 * QUALITY.reliabilityPerFlag).toFixed(6)));
});

check(14, "EDv2 Q1 cannot resolve as Dual Q1", () => {
  const result = resolveObservationScope({
    moduleId: "environmentLevel1",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ENVIRONMENTLEVEL1-Q1",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(result.useClass, "UNRESOLVED");
  assert.notEqual(result.moduleId, "acquirerEnvironment");
});

check(15, "AEM Q1 and TSAM Q1 resolve only with explicit module identity", () => {
  const aem = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: SENIOR,
    selectedOption: "A",
  });
  const tsam = resolveObservationScope({
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "TARGETSELFASSESSMENT-Q1",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(aem.useClass, "PRIMARY");
  assert.equal(tsam.useClass, "PRIMARY");
  assert.equal(aem.moduleId, "acquirerEnvironment");
  assert.equal(tsam.moduleId, "targetSelfAssessment");
  assert.notEqual(aem.canonicalQuestionId, tsam.canonicalQuestionId);
});

check(16, "missing candidate pair → 0a", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "0a");
});

check(17, "unsupported candidate pair → 0b", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/NT vs STJ/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "0b");
});

check(18, "UNRESOLVED required input → 0c", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
});

check(19, "≥8 insufficient comparisons → coverage insufficient", () => {
  const gap = { selectedOption: "E" };
  const answers2 = fill({}, {
    Q1: gap, Q2: gap, Q3: gap, Q4: gap, Q5: gap, Q7: gap, Q8: gap, Q9: gap,
  });
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2,
  });
  assert.equal(result.priority, "1");
});

check(20, "one-HIGH Q11 divergence → 3a, NOT ④-A", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  });
  assert.equal(result.priority, "3a");
  assert.notEqual(result.state, "④-A IRRESOLVABLE — within-pair divergence");
  assert.equal(result.contradictionCandidates.length, 0);
});

check(21, "ordinary multi-HIGH full divergence → ④-A", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q4: { selectedOption: "B" }, Q7: { selectedOption: "B" } }),
  });
  assert.equal(result.priority, "3");
  assert.equal(result.state, "④-A IRRESOLVABLE — within-pair divergence");
});

check(22, "state③ role split exact case", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q1: { selectedOption: "B" } }),
  });
  assert.equal(result.priority, "4");
  assert.equal(result.state, "③ ROLE-LEVEL SPLIT");
});

check(23, "state① valid ≥7 case", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }),
  });
  assert.equal(result.priority, "5A");
  assert.equal(result.state, "① CONVERGENT");
});

check(24, "state② valid 5–6 case", () => {
  const result = compareDualRespondents({
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
  });
  assert.equal(result.priority, "5B");
  assert.equal(result.state, "② PARTIAL CONVERGENCE");
});

check(25, "one-HIGH agreement with only 4 total agreements does NOT reach ②", () => {
  const result = compareDualRespondents({
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
  });
  assert.notEqual(result.priority, "5B");
  assert.notEqual(result.state, "② PARTIAL CONVERGENCE");
});

check(26, "EDv2 answers cannot enter comparator", () => {
  const result = compareDualRespondents({
    moduleId: "environmentLevel1",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "0c");
});

check(27, "DEC-8 trigger score does NOT count toward priority-1 coverage", () => {
  const gap = { selectedOption: "E" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q1: { selectedOption: "B", evidenceType: "inference", knowledgeLevel: "speculative", confidence: "low" },
      Q3: gap,
      Q4: gap,
      Q6: gap,
      Q7: gap,
      Q8: gap,
      Q9: gap,
    }),
  });
  assert.notEqual(result.priority, "1");
  assert.ok(result.audit.insufficientCount < 8);
});

check(28, "same-side comparator output does not invoke generic cross-side contradiction engine", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.genericContradictionEngineInvoked, false);
});

const SPEC = { knowledgeLevel: "speculative" };

function pairRow(result, questionRef) {
  return result.audit.pairRows.find((row) => row.questionRef === questionRef);
}

check("A", "raw 7 AGREE / 2 BOTH-speculative excluded → effective 5 → State②", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q9: SPEC, Q10: SPEC }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q8: { selectedOption: "B" },
      Q9: SPEC,
      Q10: SPEC,
    }),
  });
  assert.equal(result.audit.rawAgreeCount, 7);
  assert.equal(result.audit.agreeCount, 5);
  assert.equal(pairRow(result, "Q9").agree, true);
  assert.equal(pairRow(result, "Q9").countableAgree, false);
  assert.equal(pairRow(result, "Q9").excludedFromAgreementCount, true);
  assert.equal(pairRow(result, "Q10").agree, true);
  assert.equal(pairRow(result, "Q10").countableAgree, false);
  assert.equal(result.priority, "5B");
  assert.equal(result.state, "② PARTIAL CONVERGENCE");
});

check("B", "raw 8 AGREE / 2 BOTH-speculative excluded → effective 6 → State②", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q9: SPEC, Q10: SPEC }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q9: SPEC,
      Q10: SPEC,
    }),
  });
  assert.equal(result.audit.rawAgreeCount, 8);
  assert.equal(result.audit.agreeCount, 6);
  assert.equal(result.priority, "5B");
  assert.equal(result.state, "② PARTIAL CONVERGENCE");
});

check("C", "raw 9 AGREE / 2 BOTH-speculative excluded → effective 7 → State①", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q9: SPEC, Q10: SPEC }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q9: SPEC,
      Q10: SPEC,
    }),
  });
  assert.equal(result.audit.rawAgreeCount, 9);
  assert.equal(result.audit.agreeCount, 7);
  assert.equal(result.priority, "5A");
  assert.equal(result.state, "① CONVERGENT");
});

check("D", "BOTH-speculative DIVERGE is not reinterpreted as AGREE", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q2: SPEC }),
    answers2: fill({ selectedOption: "A" }, { Q2: { selectedOption: "B", ...SPEC } }),
  });
  const q2 = pairRow(result, "Q2");
  assert.equal(q2.agree, false);
  assert.equal(q2.countableAgree, false);
  assert.equal(q2.diverge, true);
  assert.equal(q2.excludedFromAgreementCount, true);
  assert.notEqual(q2.agree, true);
});

check("E", "single-side speculative AGREE is not excluded from countable agreement", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q8: { selectedOption: "B" },
      Q9: SPEC,
    }),
  });
  const q9 = pairRow(result, "Q9");
  assert.equal(q9.agree, true);
  assert.equal(q9.excludedFromAgreementCount, false);
  assert.equal(q9.countableAgree, true);
  assert.equal(result.audit.rawAgreeCount, 7);
  assert.equal(result.audit.agreeCount, 7);
  assert.notEqual(result.priority, "5B");
  assert.notEqual(result.state, "② PARTIAL CONVERGENCE");
});

check("F", "all HIGH both-E unavailable → priority 1", () => {
  const gap = { selectedOption: "E" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q4: gap, Q7: gap }),
    answers2: fill({}, { Q4: gap, Q7: gap }),
  });
  assert.equal(result.priority, "1");
  assert.equal(result.audit.highAllBothLackComparablePrimary, true);
  assert.ok(result.audit.insufficientCount < 8);
});

check("G", "all HIGH PRIMARY but unknown → priority 1", () => {
  const unknown = { selectedOption: "A", evidenceType: "unknown" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q4: unknown, Q7: unknown }),
    answers2: fill({}, { Q4: unknown, Q7: unknown }),
  });
  const q4 = pairRow(result, "Q4");
  assert.equal(q4.left.scope.useClass, "PRIMARY");
  assert.equal(q4.right.scope.useClass, "PRIMARY");
  assert.equal(q4.left.scope.comparisonAvailability, "unavailable");
  assert.equal(q4.right.scope.comparisonAvailability, "unavailable");
  assert.equal(q4.left.selectedOption, "A");
  assert.equal(result.priority, "1");
  assert.equal(result.audit.highAllBothLackComparablePrimary, true);
});

check("H", "mixed unavailable causes across all HIGH → priority 1", () => {
  const gap = { selectedOption: "E" };
  const unknown = { selectedOption: "A", evidenceType: "unknown" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q4: gap, Q7: unknown }),
    answers2: fill({}, { Q4: gap, Q7: unknown }),
  });
  assert.equal(pairRow(result, "Q4").left.scope.semanticClass, "OBSERVATION_GAP");
  assert.equal(pairRow(result, "Q7").left.scope.comparisonAvailability, "unavailable");
  assert.equal(result.priority, "1");
  assert.equal(result.audit.highAllBothLackComparablePrimary, true);
});

check("I", "one HIGH remains comparable PRIMARY×PRIMARY → priority-1 branch (ii) does not fire", () => {
  const unknown = { selectedOption: "A", evidenceType: "unknown" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q7: unknown }),
    answers2: fill({}, { Q7: unknown }),
  });
  const q4 = pairRow(result, "Q4");
  assert.equal(q4.comparable, true);
  assert.equal(q4.left.scope.useClass, "PRIMARY");
  assert.equal(q4.right.scope.useClass, "PRIMARY");
  assert.equal(result.audit.highAllBothLackComparablePrimary, false);
  assert.notEqual(result.priority, "1");
});

check("J", "Q11-E SUBSTANTIVE_SIGNAL is not unavailable merely because option is E", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "E" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "E" } }),
  });
  const q11 = pairRow(result, "Q11");
  assert.equal(q11.left.scope.semanticClass, "SUBSTANTIVE_SIGNAL");
  assert.equal(q11.right.scope.semanticClass, "SUBSTANTIVE_SIGNAL");
  assert.equal(q11.left.scope.comparisonAvailability, "available");
  assert.equal(q11.comparable, true);
  assert.equal(q11.agree, true);
  assert.notEqual(result.priority, "1");
  assert.equal(result.audit.highAllBothLackComparablePrimary, false);
});

function cloneDual() {
  return structuredClone(scoringAndTriage.dualRespondentComparison);
}

function qualityRow(dual, sourceRow) {
  return dual.evidenceQualityLayer.find((row) => row.sourceRow === sourceRow);
}

function corpusThresholdMatch(dual) {
  return String(qualityRow(dual, 11)?.lowQualityCondition ?? "").match(
    /Thresholds\s+([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)/i,
  );
}

function assertConfigFailure(dual, label) {
  let leakedConfig = null;
  let leakedResult = null;
  try {
    leakedConfig = buildDualRespondentCorpusConfig(dual);
    const compare = createDualRespondentComparator(dual);
    leakedResult = compare({
      moduleId: "acquirerEnvironment",
      candidatePair: "NT/STJ vs NT/STP",
      respondent1: SENIOR,
      respondent2: SENIOR,
      answers1: fill(),
      answers2: fill(),
    });
  } catch (error) {
    assert.equal(error.name, "DualRespondentCorpusConfigurationError", label);
    assert.ok(error instanceof DualRespondentCorpusConfigurationError, label);
    assert.equal(leakedConfig, null, `${label} must not yield a config object`);
    assert.equal(leakedResult, null, `${label} must not classify`);
    if (leakedResult) {
      assert.notEqual(leakedResult.state, "① CONVERGENT", label);
      assert.notEqual(leakedResult.state, "② PARTIAL CONVERGENCE", label);
      assert.notEqual(leakedResult.state, "③ ROLE-LEVEL SPLIT", label);
      assert.notEqual(leakedResult.priority, "1");
      assert.notEqual(leakedResult.priority, "2");
      assert.notEqual(leakedResult.routing, "candidate_4b_practitioner_confirmation_required");
    }
    return error;
  }
  assert.fail(`${label} did not fail closed`);
}

check("K1", "baseline derivation binds live corpus cells, not numeric literals", () => {
  const dual = scoringAndTriage.dualRespondentComparison;
  const cfg = buildDualRespondentCorpusConfig(dual);
  const thresholdMatch = corpusThresholdMatch(dual);
  assert.ok(thresholdMatch, "live corpus must expose labeled Thresholds set");
  assert.equal(cfg.quality.thresholdHigh, Number(thresholdMatch[1]));
  assert.equal(cfg.quality.thresholdMedium, Number(thresholdMatch[2]));
  assert.equal(cfg.quality.thresholdLow, Number(thresholdMatch[3]));
  assert.equal(cfg.quality.thresholdExclude, Number(thresholdMatch[4]));
  assert.equal(dualQualityConfig().thresholdHigh, Number(thresholdMatch[1]));

  const dim1 = qualityRow(dual, 6);
  const dim2 = qualityRow(dual, 7);
  const dim3 = qualityRow(dual, 8);
  const dim4 = qualityRow(dual, 9);
  const dim4Distinct = [...new Set([...String(dim4.action).matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1])))];
  const dim2Token = String(dim2.action).match(/excluded from agreement count if both (\w+)/i);
  assert.ok(dim2Token);
  assert.equal(cfg.quality.evidenceLow, Number(String(dim1.action).match(/(\d+(?:\.\d+)?)/)[1]));
  assert.equal(cfg.quality.knowledgeLow, Number(String(dim2.action).match(/(\d+(?:\.\d+)?)/)[1]));
  assert.equal(cfg.quality.confidenceLow, Number(String(dim3.action).match(/(\d+(?:\.\d+)?)/)[1]));
  assert.equal(cfg.quality.reliabilityPerFlag, dim4Distinct[0]);
  assert.equal(cfg.quality.reliabilityFloor, dim4Distinct[1]);
  assert.equal(cfg.quality.agreementCountExcludeKnowledgeLevel, dim2Token[1].toLowerCase());

  const state3 = dual.divergenceClassification.find((row) => String(row.state).includes("③"));
  const gov = [...new Set([...String(state3.triggerCondition).matchAll(/\bQ(?:[1-9]|1[01])\b/g)].map((match) => match[0]))];
  assert.deepEqual([...cfg.governanceQuestions], gov);
  assert.deepEqual(dualPrecedenceOrder(), dual.classificationPrecedence.map((row) => row.priority));

  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "5A");
  assert.equal(result.state, "① CONVERGENT");
});

check("K2", "changed corpus values are followed; historical constants are inactive", () => {
  const dual = cloneDual();
  const liveMatch = corpusThresholdMatch(scoringAndTriage.dualRespondentComparison);
  assert.ok(liveMatch);
  const product = qualityRow(dual, 11);
  product.lowQualityCondition = String(product.lowQualityCondition).replace(
    liveMatch[0],
    "Thresholds 0.75 / 0.55 / 0.45 / 0.25",
  );
  const dim4 = qualityRow(dual, 9);
  const liveFloor = [...new Set([...String(qualityRow(scoringAndTriage.dualRespondentComparison, 9).action).matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1])))][1];
  dim4.action = String(dim4.action).replace(String(liveFloor), "0.25");
  const followed = buildDualRespondentCorpusConfig(dual);
  assert.equal(followed.quality.thresholdHigh, 0.75);
  assert.equal(followed.quality.thresholdMedium, 0.55);
  assert.equal(followed.quality.thresholdLow, 0.45);
  assert.equal(followed.quality.thresholdExclude, 0.25);
  assert.equal(followed.quality.reliabilityFloor, 0.25);
  assert.notEqual(followed.quality.thresholdHigh, Number(liveMatch[1]));
  assert.notEqual(followed.quality.reliabilityFloor, liveFloor);

  product.lowQualityCondition = String(qualityRow(scoringAndTriage.dualRespondentComparison, 11).lowQualityCondition).replace(
    liveMatch[0],
    "Thresholds 1.1 / 0.55 / 0.45 / 0.25",
  );
  const compare = createDualRespondentComparator(dual);
  const result = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(compare.corpusConfig.quality.thresholdHigh, 1.1);
  assert.notEqual(result.priority, "5A");
  assert.notEqual(result.state, "① CONVERGENT");
});

check("K3", "missing evidenceQualityLayer fails closed", () => {
  const dual = cloneDual();
  dual.evidenceQualityLayer = [];
  const error = assertConfigFailure(dual, "K3");
  assert.equal(error.section, "evidenceQualityLayer");
});

check("K4", "malformed threshold row fails closed", () => {
  const dual = cloneDual();
  qualityRow(dual, 11).lowQualityCondition = "thresholds unavailable";
  const error = assertConfigFailure(dual, "K4");
  assert.equal(error.section, "evidenceQualityLayer.product.thresholds");
});

check("K5", "missing dim4 floor fails closed", () => {
  const dual = cloneDual();
  qualityRow(dual, 9).action = "Apply 0.6 multiplier per flag (max 0.6 reduction)";
  const error = assertConfigFailure(dual, "K5");
  assert.equal(error.section, "dim4.floor");
});

check("K6", "missing governance question refs fails closed without Q1/Q5 fallback", () => {
  const dual = cloneDual();
  const state3 = dual.divergenceClassification.find((row) => String(row.state).includes("③"));
  const row4 = dual.classificationPrecedence.find((row) => row.priority === "4");
  state3.triggerCondition = String(state3.triggerCondition).replace(/\bQ(?:[1-9]|1[01])\b/g, "AXIS");
  row4.condition = String(row4.condition).replace(/\bQ(?:[1-9]|1[01])\b/g, "AXIS");
  const error = assertConfigFailure(dual, "K6");
  assert.equal(error.section, "governanceTriggerQuestions");
  assert.doesNotMatch(String(error.detail ?? ""), /Q1|Q5/);
});

check("K7", "missing BOTH-speculative exclusion rule fails closed without speculative fallback", () => {
  const dual = cloneDual();
  qualityRow(dual, 7).action = "Apply 0.3 multiplier; record in audit trail";
  const error = assertConfigFailure(dual, "K7");
  assert.equal(error.section, "evidenceQualityLayer.dim2.agreementCountExclusion");
  let leakedToken = null;
  try {
    leakedToken = buildDualRespondentCorpusConfig(dual).quality.agreementCountExcludeKnowledgeLevel;
  } catch {
    leakedToken = null;
  }
  assert.equal(leakedToken, null);
  assert.notEqual(leakedToken, "speculative");
});

check("K8", "configuration failure does not emit a Dual classification", () => {
  const dual = cloneDual();
  dual.evidenceQualityLayer = null;
  const error = assertConfigFailure(dual, "K8");
  assert.ok(error instanceof DualRespondentCorpusConfigurationError);
  assert.notEqual(error.section, null);
});

check("K9", "malformed corpus cannot reintroduce historical fallback constants", () => {
  const liveMatch = corpusThresholdMatch(scoringAndTriage.dualRespondentComparison);
  assert.ok(liveMatch);
  const dual = cloneDual();
  qualityRow(dual, 11).lowQualityCondition = "not a threshold set";
  let leaked = null;
  try {
    leaked = buildDualRespondentCorpusConfig(dual);
  } catch (error) {
    assert.ok(error instanceof DualRespondentCorpusConfigurationError);
    leaked = null;
  }
  assert.equal(leaked, null);
  if (leaked) {
    assert.notEqual(leaked.quality.thresholdHigh, Number(liveMatch[1]));
    assert.notEqual(leaked.quality.thresholdMedium, Number(liveMatch[2]));
    assert.notEqual(leaked.quality.thresholdLow, Number(liveMatch[3]));
    assert.notEqual(leaked.quality.thresholdExclude, Number(liveMatch[4]));
  }
});

function precedenceRowOf(dual, priority) {
  return dual.classificationPrecedence.find((row) => row.priority === priority);
}

function stateRowOf(dual, mark) {
  return dual.divergenceClassification.find((row) => String(row.state).includes(mark));
}

function setCoverageMin(dual, n) {
  precedenceRowOf(dual, "1").condition = precedenceRowOf(dual, "1").condition.replace(/≥\s*\d+\s+of/, `≥ ${n} of`);
  const edge = dual.edgeCases.find((row) => row.sourceRow === 14);
  edge.trigger = edge.trigger.replace(/≥\s*\d+\s+of/, `≥ ${n} of`);
}

function setState1Min(dual, n) {
  precedenceRowOf(dual, "5A").condition = precedenceRowOf(dual, "5A").condition.replace(
    /Effective AGREE\s*≥\s*\d+/,
    `Effective AGREE ≥ ${n}`,
  );
  stateRowOf(dual, "①").triggerCondition = stateRowOf(dual, "①").triggerCondition.replace(
    /Effective AGREE\s*≥\s*\d+/,
    `Effective AGREE ≥ ${n}`,
  );
}

function setState2Window(dual, min, max) {
  const next = `Effective AGREE ${min}–${max}`;
  precedenceRowOf(dual, "5B").condition = precedenceRowOf(dual, "5B").condition.replace(
    /Effective AGREE\s*\d+\s*[–-]\s*\d+/,
    next,
  );
  stateRowOf(dual, "②").triggerCondition = stateRowOf(dual, "②").triggerCondition.replace(
    /Effective AGREE\s*\d+\s*[–-]\s*\d+/,
    next,
  );
}

function setState3Floor(dual, n) {
  precedenceRowOf(dual, "4").condition = precedenceRowOf(dual, "4").condition.replace(
    /≥\s*\d+\s+non-governance/,
    `≥ ${n} non-governance`,
  );
  stateRowOf(dual, "③").triggerCondition = stateRowOf(dual, "③").triggerCondition.replace(
    /≥\s*\d+\s+non-governance/,
    `≥ ${n} non-governance`,
  );
}

function setOneHigh(dual, pair, questionRef) {
  const row3a = precedenceRowOf(dual, "3a");
  row3a.condition = row3a.condition
    .replace(/Active pair\s*=\s*[A-Z]{2,3}\/[A-Z]{2,3}\s+vs\s+[A-Z]{2,3}\/[A-Z]{2,3}/, `Active pair = ${pair}`)
    .replace(/sole HIGH\s*=\s*Q(?:1[01]|[1-9])\b/, `sole HIGH = ${questionRef}`);
  const row1b = precedenceRowOf(dual, "1b");
  row1b.condition = row1b.condition
    .replace(/[A-Z]{2,3}\/[A-Z]{2,3}\s+vs\s+[A-Z]{2,3}\/[A-Z]{2,3}/, pair)
    .replace(/Both respondents Q(?:1[01]|[1-9])\b/, `Both respondents ${questionRef}`);
}

const eightInsufficient = () => fill({ selectedOption: "A" }, {
  Q1: { selectedOption: "E" },
  Q2: { selectedOption: "E" },
  Q3: { selectedOption: "E" },
  Q4: { selectedOption: "E" },
  Q5: { selectedOption: "E" },
  Q7: { selectedOption: "E" },
  Q8: { selectedOption: "E" },
  Q9: { selectedOption: "E" },
});

check("L1", "priority-1 coverage threshold follows corpus", () => {
  const dual = cloneDual();
  setCoverageMin(dual, 10);
  const cfg = buildDualRespondentCorpusConfig(dual);
  assert.equal(cfg.classification.coverageInsufficientMin, 10);
  const compare = createDualRespondentComparator(dual);
  const result = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: eightInsufficient(),
  });
  assert.notEqual(result.priority, "1");
  const live = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: eightInsufficient(),
  });
  assert.equal(live.priority, "1");
});

check("L2", "State① agreement floor follows corpus", () => {
  const dual = cloneDual();
  setState1Min(dual, 8);
  const compare = createDualRespondentComparator(dual);
  const result = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q9: SPEC, Q10: SPEC }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q9: SPEC,
      Q10: SPEC,
    }),
  });
  assert.equal(compare.corpusConfig.classification.state1AgreeMin, 8);
  assert.equal(result.audit.agreeCount, 7);
  assert.notEqual(result.priority, "5A");
  assert.notEqual(result.state, "① CONVERGENT");
});

check("L3", "State② agreement window lower and upper bounds follow corpus", () => {
  const dual = cloneDual();
  setState2Window(dual, 4, 5);
  const compare = createDualRespondentComparator(dual);
  assert.equal(compare.corpusConfig.classification.state2AgreeMin, 4);
  assert.equal(compare.corpusConfig.classification.state2AgreeMax, 5);
  const sixAgrees = compare({
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
  });
  assert.equal(sixAgrees.audit.agreeCount, 6);
  assert.notEqual(sixAgrees.priority, "5B");
  assert.notEqual(sixAgrees.state, "② PARTIAL CONVERGENCE");
  const fourAgrees = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "B" }, {
      Q1: { selectedOption: "A" },
      Q4: { selectedOption: "A" },
      Q7: { selectedOption: "A" },
      Q11: { selectedOption: "A" },
    }),
  });
  assert.equal(fourAgrees.audit.agreeCount, 4);
  assert.equal(fourAgrees.priority, "5B");
  assert.equal(fourAgrees.state, "② PARTIAL CONVERGENCE");
});

check("L4", "State③ non-governance agreement floor follows corpus", () => {
  const dual = cloneDual();
  setState3Floor(dual, 6);
  const compare = createDualRespondentComparator(dual);
  assert.equal(compare.corpusConfig.classification.state3NonGovernanceAgreeMin, 6);
  const result = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q1: { selectedOption: "B" },
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q10: { selectedOption: "B" },
      Q11: { selectedOption: "B" },
    }),
  });
  const nonGov = result.audit.pairRows.filter((row) => (
    !["Q1", "Q5"].includes(row.questionRef) && row.countableAgree
  )).length;
  assert.equal(nonGov, 5);
  assert.notEqual(result.priority, "4");
  assert.notEqual(result.state, "③ ROLE-LEVEL SPLIT");
});

check("L5", "5X uses ①/② agreement-count composition, not a reused hard-coded 5", () => {
  const dual = cloneDual();
  setState1Min(dual, 8);
  const compareHigh = createDualRespondentComparator(dual);
  const sevenAmbiguous = compareHigh({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    coherenceAmbiguous: true,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q8: { selectedOption: "B" },
    }),
  });
  assert.equal(sevenAmbiguous.audit.agreeCount, 7);
  assert.notEqual(sevenAmbiguous.priority, "5X");

  const dualLow = cloneDual();
  setState2Window(dualLow, 4, 6);
  const compareLow = createDualRespondentComparator(dualLow);
  const fourAmbiguous = compareLow({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    coherenceAmbiguous: true,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "B" }, {
      Q1: { selectedOption: "A" },
      Q4: { selectedOption: "A" },
      Q7: { selectedOption: "A" },
      Q11: { selectedOption: "A" },
    }),
  });
  assert.equal(fourAmbiguous.audit.agreeCount, 4);
  assert.equal(fourAmbiguous.priority, "5X");
});

check("L6", "one-HIGH special pair follows corpus identity", () => {
  const dual = cloneDual();
  setOneHigh(dual, "NT/STJ vs NT/STP", "Q4");
  const compare = createDualRespondentComparator(dual);
  assert.equal(compare.corpusConfig.oneHighPair, "NT/STJ vs NT/STP");
  assert.equal(compare.corpusConfig.oneHighDiscriminatorQuestion, "Q4");
  const oldPair = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  });
  assert.notEqual(oldPair.priority, "3a");
  const newPair = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q4: { selectedOption: "B" } }),
  });
  assert.equal(newPair.priority, "3a");
});

check("L7", "governance duplicate locations agree on the live corpus", () => {
  const dual = scoringAndTriage.dualRespondentComparison;
  const cfg = buildDualRespondentCorpusConfig(dual);
  const state3 = stateRowOf(dual, "③");
  const row4 = precedenceRowOf(dual, "4");
  const fromState = [...new Set([...String(state3.triggerCondition).matchAll(/\bQ(?:[1-9]|1[01])\b/g)].map((match) => match[0]))];
  const fromPriority = [...new Set([...String(row4.condition).matchAll(/\bQ(?:[1-9]|1[01])\b/g)].map((match) => match[0]))];
  assert.deepEqual(fromState.sort(), fromPriority.sort());
  assert.deepEqual([...cfg.governanceQuestions].sort(), fromState.sort());
});

check("L8", "governance duplicate locations conflict fails closed", () => {
  const dual = cloneDual();
  const state3 = stateRowOf(dual, "③");
  state3.triggerCondition = String(state3.triggerCondition).replace(/\bQ5\b/g, "Q6");
  const error = assertConfigFailure(dual, "L8");
  assert.equal(error.section, "governanceTriggerQuestions");
});

check("L9", "missing residual methodology values fail closed before classification", () => {
  const corruptions = [
    ["coverageInsufficientMin", (dual) => {
      precedenceRowOf(dual, "1").condition = "Branch (i): coverage rule absent";
      dual.edgeCases.find((row) => row.sourceRow === 14).trigger = "coverage rule absent";
    }],
    ["state1AgreeMin", (dual) => {
      precedenceRowOf(dual, "5A").condition = "PRIMARY × PRIMARY without a count";
      stateRowOf(dual, "①").triggerCondition = "PRIMARY × PRIMARY without a count";
    }],
    ["state2AgreeWindow", (dual) => {
      precedenceRowOf(dual, "5B").condition = "Effective AGREE unspecified PRIMARY × PRIMARY";
      stateRowOf(dual, "②").triggerCondition = "Effective AGREE unspecified PRIMARY × PRIMARY";
    }],
    ["state3NonGovernanceAgreeMin", (dual) => {
      precedenceRowOf(dual, "4").condition = "role split without a non-governance floor";
      stateRowOf(dual, "③").triggerCondition = "role split without a non-governance floor";
    }],
    ["oneHighSpecialPair", (dual) => {
      precedenceRowOf(dual, "3a").condition = "Q11 DIVERGE without an Active pair identity";
    }],
  ];
  for (const [section, mutate] of corruptions) {
    const dual = cloneDual();
    mutate(dual);
    const error = assertConfigFailure(dual, `L9 ${section}`);
    assert.equal(error.section, section, `L9 ${section}`);
  }
});

check("L10", "changed corpus value cannot be masked by historical literals", () => {
  const dual = cloneDual();
  setState1Min(dual, 9);
  const compare = createDualRespondentComparator(dual);
  assert.equal(compare.corpusConfig.classification.state1AgreeMin, 9);
  const result = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.audit.agreeCount, 11);
  assert.equal(result.priority, "5A");
  setState1Min(dual, 12);
  const compareHigh = createDualRespondentComparator(dual);
  const blocked = compareHigh({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(compareHigh.corpusConfig.classification.state1AgreeMin, 12);
  assert.notEqual(blocked.priority, "5A");
  assert.notEqual(blocked.state, "① CONVERGENT");
});

check("M1", "State① duplicate canonical Effective AGREE ≥ N fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "5A").condition += " Effective AGREE ≥ 9";
  const error = assertConfigFailure(dual, "M1");
  assert.equal(error.section, "state1AgreeMin");
  assert.match(String(error.detail), /2 canonical occurrences/);
});

check("M2", "coverage duplicate canonical ≥ N of M fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "1").condition += " ≥ 6 of 11";
  const error = assertConfigFailure(dual, "M2");
  assert.equal(error.section, "coverageInsufficientMin");
});

check("M3", "State② duplicate canonical window fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "5B").condition += " Effective AGREE 4–5";
  const error = assertConfigFailure(dual, "M3");
  assert.equal(error.section, "state2AgreeWindow");
});

check("M4", "State③ duplicate canonical non-governance floor fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "4").condition += " ≥ 7 non-governance PRIMARY × PRIMARY AGREE";
  const error = assertConfigFailure(dual, "M4");
  assert.equal(error.section, "state3NonGovernanceAgreeMin");
});

check("M5", "special pair duplicate Active pair = fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "3a").condition += " Active pair = NT/STJ vs NT/STP";
  const error = assertConfigFailure(dual, "M5");
  assert.equal(error.section, "oneHighSpecialPair");
});

check("M6", "special question duplicate sole HIGH = fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "3a").condition += " sole HIGH = Q9";
  const error = assertConfigFailure(dual, "M6");
  assert.equal(error.section, "oneHighDiscriminatorQuestion");
});

check("M7", "coverage second location missing fails closed", () => {
  const dual = cloneDual();
  dual.edgeCases.find((row) => row.sourceRow === 14).trigger = "coverage restatement omitted";
  const error = assertConfigFailure(dual, "M7");
  assert.equal(error.section, "coverageInsufficientMin");
});

check("M8", "coverage first location missing fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "1").condition = "Branch (i): coverage assertion omitted";
  const error = assertConfigFailure(dual, "M8");
  assert.equal(error.section, "coverageInsufficientMin");
});

check("M9", "State① either restatement location missing fails closed", () => {
  const missing5A = cloneDual();
  precedenceRowOf(missing5A, "5A").condition = "PRIMARY × PRIMARY without Effective AGREE floor";
  assert.equal(assertConfigFailure(missing5A, "M9 5A").section, "state1AgreeMin");
  const missingState = cloneDual();
  stateRowOf(missingState, "①").triggerCondition = "PRIMARY × PRIMARY without Effective AGREE floor";
  assert.equal(assertConfigFailure(missingState, "M9 ①").section, "state1AgreeMin");
});

check("M10", "State② either restatement location missing fails closed", () => {
  const missing5B = cloneDual();
  precedenceRowOf(missing5B, "5B").condition = "PRIMARY × PRIMARY without agreement window";
  assert.equal(assertConfigFailure(missing5B, "M10 5B").section, "state2AgreeWindow");
  const missingState = cloneDual();
  stateRowOf(missingState, "②").triggerCondition = "PRIMARY × PRIMARY without agreement window";
  assert.equal(assertConfigFailure(missingState, "M10 ②").section, "state2AgreeWindow");
});

check("M11", "State③ floor either restatement location missing fails closed", () => {
  const missing4 = cloneDual();
  precedenceRowOf(missing4, "4").condition = precedenceRowOf(missing4, "4").condition.replace(
    /≥\s*\d+\s+non-governance PRIMARY × PRIMARY AGREE/g,
    "non-governance agreement omitted",
  );
  assert.equal(assertConfigFailure(missing4, "M11 4").section, "state3NonGovernanceAgreeMin");
  const missingState = cloneDual();
  stateRowOf(missingState, "③").triggerCondition = stateRowOf(missingState, "③").triggerCondition.replace(
    /≥\s*\d+\s+non-governance PRIMARY × PRIMARY AGREE/g,
    "non-governance agreement omitted",
  );
  assert.equal(assertConfigFailure(missingState, "M11 ③").section, "state3NonGovernanceAgreeMin");
});

check("M12", "governance either restatement location missing fails closed", () => {
  const missingState = cloneDual();
  stateRowOf(missingState, "③").triggerCondition = String(stateRowOf(missingState, "③").triggerCondition)
    .replace(/\bQ(?:1[01]|[1-9])\b/g, "AXIS");
  assert.equal(assertConfigFailure(missingState, "M12 state3").section, "governanceTriggerQuestions");
  const missing4 = cloneDual();
  precedenceRowOf(missing4, "4").condition = String(precedenceRowOf(missing4, "4").condition)
    .replace(/\bQ(?:1[01]|[1-9])\b/g, "AXIS");
  assert.equal(assertConfigFailure(missing4, "M12 4").section, "governanceTriggerQuestions");
});

check("M13", "duplicate identical canonical anchor fails closed", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "5A").condition += " Effective AGREE ≥ 7";
  const error = assertConfigFailure(dual, "M13");
  assert.equal(error.section, "state1AgreeMin");
  assert.match(String(error.detail), /2 canonical occurrences/);
});

check("M14", "unrelated integers remain legal beside one canonical anchor", () => {
  const live = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
  const dual = cloneDual();
  precedenceRowOf(dual, "5A").condition += " leftover 12 99 0.15";
  const cfg = buildDualRespondentCorpusConfig(dual);
  assert.equal(cfg.classification.state1AgreeMin, live.classification.state1AgreeMin);
  const result = createDualRespondentComparator(dual)({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "5A");
});

check("M15", "unrelated Q-refs remain legal beside one sole HIGH anchor", () => {
  const live = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
  const dual = cloneDual();
  precedenceRowOf(dual, "3a").condition += " Q2 Q3 Q4 DIVERGE";
  const cfg = buildDualRespondentCorpusConfig(dual);
  assert.equal(cfg.oneHighDiscriminatorQuestion, live.oneHighDiscriminatorQuestion);
  const result = createDualRespondentComparator(dual)({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  });
  assert.equal(result.priority, "3a");
});

check("M16", "configuration failure does not classify Dual states", () => {
  const ambiguous = cloneDual();
  precedenceRowOf(ambiguous, "5A").condition += " Effective AGREE ≥ 9";
  const missing = cloneDual();
  missing.edgeCases.find((row) => row.sourceRow === 14).trigger = "";
  for (const [label, dual] of [["M16 ambiguous", ambiguous], ["M16 missing", missing]]) {
    const error = assertConfigFailure(dual, label);
    assert.equal(error.name, "DualRespondentCorpusConfigurationError");
  }
});

function assertResolverConfigFailure(dual, label) {
  let leakedConfig = null;
  let leakedResult = null;
  try {
    leakedConfig = buildObservationScopeCorpusConfig(dual);
    const resolve = createObservationScopeResolver(dual);
    leakedResult = resolve({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: "Q1",
      canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
      respondent: SENIOR,
      selectedOption: "A",
    });
  } catch (error) {
    assert.equal(error.name, "ObservationScopeCorpusConfigurationError", label);
    assert.ok(error instanceof ObservationScopeCorpusConfigurationError, label);
    assert.equal(leakedConfig, null, `${label} must not yield a config object`);
    assert.equal(leakedResult, null, `${label} must not resolve a UseClass`);
    return error;
  }
  assert.fail(`${label} did not fail closed`);
}

check("O1", "baseline Observation Scope configuration loads from live corpus", () => {
  const cfg = buildObservationScopeCorpusConfig(scoringAndTriage.dualRespondentComparison);
  assert.equal(cfg.vantageByKey.size, 33);
  assert.equal(cfg.seniority.tiers.length, 3);
  const result = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(result.useClass, "PRIMARY");
  assert.equal(result.questionRef, "Q1");
});

check("O2", "questionTierVantage structure missing fails closed", () => {
  const dual = cloneDual();
  delete dual.questionTierVantage;
  const error = assertResolverConfigFailure(dual, "O2");
  assert.equal(error.section, "questionTierVantage");
});

check("O3", "questionTierVantage empty fails closed and does not become UNRESOLVED/0c", () => {
  const dual = cloneDual();
  dual.questionTierVantage = [];
  const error = assertResolverConfigFailure(dual, "O3");
  assert.equal(error.section, "questionTierVantage");
  assert.notEqual(error.section, "UNRESOLVED");
});

check("O4", "required question/tier vantage missing fails closed", () => {
  const dual = cloneDual();
  dual.questionTierVantage = dual.questionTierVantage.filter((row) => !(
    row.questionref === "Q1" && row.senioritytier === "senior"
  ));
  const error = assertResolverConfigFailure(dual, "O4");
  assert.equal(error.section, "questionTierVantage");
  assert.match(String(error.detail), /Q1\|senior/);
});

check("O5", "malformed expected-vantage token fails closed", () => {
  const dual = cloneDual();
  const row = dual.questionTierVantage.find((item) => item.questionref === "Q1" && item.senioritytier === "senior");
  row.expectedvantage = "INVALID_VANTAGE_TOKEN";
  const error = assertResolverConfigFailure(dual, "O5");
  assert.equal(error.section, "questionTierVantage");
});

check("O6", "seniorityTierMapping missing fails closed", () => {
  const dual = cloneDual();
  delete dual.seniorityTierMapping;
  const error = assertResolverConfigFailure(dual, "O6");
  assert.equal(error.section, "seniorityTierMapping");
});

check("O7", "seniorityTierMapping empty fails closed", () => {
  const dual = cloneDual();
  dual.seniorityTierMapping = [];
  const error = assertResolverConfigFailure(dual, "O7");
  assert.equal(error.section, "seniorityTierMapping");
});

check("O8", "required seniority tier entry missing fails closed", () => {
  const dual = cloneDual();
  dual.seniorityTierMapping = dual.seniorityTierMapping.filter((row) => row.seniorityTier !== "line_level");
  const error = assertResolverConfigFailure(dual, "O8");
  assert.equal(error.section, "questionTierVantage");
});

check("O9", "malformed seniority tier mapping fails closed", () => {
  const dual = cloneDual();
  dual.seniorityTierMapping[0].seniorityTier = "";
  const error = assertResolverConfigFailure(dual, "O9");
  assert.equal(error.section, "seniorityTierMapping");
});

check("O10", "duplicate conflicting vantage mapping fails closed", () => {
  const dual = cloneDual();
  const original = dual.questionTierVantage.find((row) => row.questionref === "Q1" && row.senioritytier === "senior");
  dual.questionTierVantage.push({
    ...original,
    defaultuseclass: "CONTEXTUAL",
    expectedvantage: original.expectedvantage,
  });
  const error = assertResolverConfigFailure(dual, "O10");
  assert.equal(error.section, "questionTierVantage");
  assert.match(String(error.detail), /duplicate Q1\|senior/);
});

check("O11", "cross-module local Q1 does not silently borrow another module mapping", () => {
  const edv2 = resolveObservationScope({
    moduleId: "environmentLevel1",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ENVIRONMENTLEVEL1-Q1",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(edv2.useClass, "UNRESOLVED");
  assert.notEqual(edv2.moduleId, "acquirerEnvironment");
  const dual = cloneDual();
  dual.questionTierVantage = dual.questionTierVantage.filter((row) => row.questionref !== "Q1");
  const error = assertResolverConfigFailure(dual, "O11 missing Dual Q1 vantage");
  assert.equal(error.section, "questionTierVantage");
});

check("O12", "resolver config failure does not return a UseClass", () => {
  const dual = cloneDual();
  dual.questionTierVantage = [];
  const error = assertResolverConfigFailure(dual, "O12");
  assert.ok(error instanceof ObservationScopeCorpusConfigurationError);
});

check("O13", "resolver config failure cannot become Dual 0c", () => {
  const caller = readFileSync(new URL("../src/flow/dualRespondentComparison.js", import.meta.url), "utf8");
  assert.match(caller, /resolveObservationScope\(/);
  assert.doesNotMatch(caller, /\bcatch\s*\(/);
  const dual = cloneDual();
  dual.seniorityTierMapping = [];
  const error = assertResolverConfigFailure(dual, "O13");
  assert.equal(error.name, "ObservationScopeCorpusConfigurationError");
  const live = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.notEqual(live.priority, "0c");
  assert.equal(live.priority, "5A");
});

check("O14", "legitimate UNRESOLVED still works under valid configuration", () => {
  const external = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: EXTERNAL,
    selectedOption: "A",
  });
  assert.equal(external.useClass, "UNRESOLVED");
  const unspecified = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    selectedOption: "A",
  });
  assert.equal(unspecified.useClass, "UNRESOLVED");
  assert.equal(unspecified.routing, "practitioner_access_review");
});

check("O15", "PRIMARY / CONTEXTUAL / INELIGIBLE remain available under valid configuration", () => {
  assert.equal(scope({}).useClass, "PRIMARY");
  assert.equal(scope({ respondent: LINE }).useClass, "CONTEXTUAL");
  assert.equal(scope({
    workbookQuestionId: "Q2",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q2",
    respondent: LINE,
  }).useClass, "INELIGIBLE");
});

check("O16", "inference and same-cause flag preservation under validated resolver", () => {
  const baseline = scope({});
  const inferred = scope({ evidenceType: "inference" });
  assert.equal(baseline.useClass, "PRIMARY");
  assert.equal(inferred.useClass, "PRIMARY");
  const accessScope = scope({ respondent: LINE });
  assert.equal(accessScope.useClass, "CONTEXTUAL");
  const disposition = deriveObservationScopeCausalDisposition({
    reliabilityFlags: ["speaks_for_group_without_access"],
    observationScopeAdjudicatedAccess: true,
  });
  assert.equal(disposition.forcedInference, false);
});

check("P1", "questionOptionSemantics missing fails closed", () => {
  const dual = cloneDual();
  delete dual.questionOptionSemantics;
  assert.equal(assertResolverConfigFailure(dual, "P1").section, "questionOptionSemantics");
});

check("P2", "questionOptionSemantics empty fails closed", () => {
  const dual = cloneDual();
  dual.questionOptionSemantics = [];
  assert.equal(assertResolverConfigFailure(dual, "P2").section, "questionOptionSemantics");
});

check("P3", "required option-semantics entry missing identity fails closed", () => {
  const dual = cloneDual();
  dual.questionOptionSemantics[0].questionref = "";
  const error = assertResolverConfigFailure(dual, "P3");
  assert.equal(error.section, "questionOptionSemantics");
});

check("P4", "changed option semantic class follows corpus", () => {
  const dual = cloneDual();
  const row = dual.questionOptionSemantics.find((item) => item.questionref === "Q11" && item.optioncode === "E");
  row.semanticclass = "OBSERVATION_GAP";
  const resolve = createObservationScopeResolver(dual);
  const result = resolve({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q11",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q11",
    respondent: SENIOR,
    selectedOption: "E",
  });
  assert.equal(result.semanticClass, "OBSERVATION_GAP");
  assert.equal(result.comparisonAvailability, "unavailable");
});

check("P5", "semanticClassEffects missing fails closed", () => {
  const dual = cloneDual();
  delete dual.semanticClassEffects;
  assert.equal(assertResolverConfigFailure(dual, "P5").section, "semanticClassEffects");
});

check("P6", "option semantic class without effects row fails closed", () => {
  const dual = cloneDual();
  const row = dual.questionOptionSemantics.find((item) => item.questionref === "Q11" && item.optioncode === "E");
  row.semanticclass = "NOT_A_CORPUS_CLASS";
  const error = assertResolverConfigFailure(dual, "P6");
  assert.equal(error.section, "semanticClassEffects");
});

check("P7", "actualAccessCeiling missing fails closed", () => {
  const dual = cloneDual();
  delete dual.actualAccessCeiling;
  assert.equal(assertResolverConfigFailure(dual, "P7").section, "actualAccessCeiling");
});

check("P8", "actualAccessCeiling empty fails closed", () => {
  const dual = cloneDual();
  dual.actualAccessCeiling = [];
  assert.equal(assertResolverConfigFailure(dual, "P8").section, "actualAccessCeiling");
});

check("P9", "changed access-ceiling value follows corpus", () => {
  const dual = cloneDual();
  const rule = dual.actualAccessCeiling.find((row) => row.signal === "evidenceType" && row.value === "hypothetical");
  rule.useclassceiling = "INELIGIBLE";
  const resolve = createObservationScopeResolver(dual);
  const result = resolve({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: SENIOR,
    selectedOption: "A",
    evidenceType: "hypothetical",
  });
  assert.equal(result.useClass, "INELIGIBLE");
});

function bothF11(except = {}) {
  return fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" }, ...except });
}

check("R1", "live 1b minimal witness: special pair both discriminator OBSERVATION_GAP", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11(),
    answers2: bothF11(),
  });
  assert.equal(result.priority, "1b");
  assert.equal(result.outcomeClass, "coverage_outcome");
  assert.equal(result.classificationOutcome, "NF/SFP determination impossible");
  assert.equal(result.routing, "practitioner_review");
  assert.match(result.output, /no automatic EDv2 fallback/i);
  assert.equal(result.state, null);
  const q11 = pairRow(result, "Q11");
  assert.equal(q11.left.scope.semanticClass, "OBSERVATION_GAP");
  assert.equal(q11.right.scope.semanticClass, "OBSERVATION_GAP");
});

check("R2", "generic priority-1 return is suppressed only for exact 1b", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11(),
    answers2: bothF11(),
  });
  assert.equal(result.audit.exact1bSpecialCondition, true);
  assert.equal(result.audit.genericPriority1, true);
  assert.equal(result.audit.highAllBothLackComparablePrimary, true);
  assert.equal(result.priority, "1b");
  assert.notEqual(result.priority, "1");
  assert.notEqual(result.routing, "coverage_insufficient");
});

check("R3", "generic all-HIGH unavailability on another pair still returns 1", () => {
  const gap = { selectedOption: "E" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q4: gap, Q7: gap }),
    answers2: fill({}, { Q4: gap, Q7: gap }),
  });
  assert.equal(result.priority, "1");
  assert.equal(result.audit.exact1bSpecialCondition, false);
  assert.equal(result.routing, "coverage_insufficient");
});

check("R4", "special pair non-1b HIGH unavailability still returns 1", () => {
  const unknown = { selectedOption: "A", evidenceType: "unknown" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: unknown }),
    answers2: fill({ selectedOption: "A" }, { Q11: unknown }),
  });
  const q11 = pairRow(result, "Q11");
  assert.notEqual(q11.left.scope.semanticClass, "OBSERVATION_GAP");
  assert.equal(q11.left.scope.comparisonAvailability, "unavailable");
  assert.equal(result.audit.highAllBothLackComparablePrimary, true);
  assert.equal(result.audit.exact1bSpecialCondition, false);
  assert.equal(result.priority, "1");
});

check("R5", "exact 1b is not consumed by coverage branch (i)", () => {
  const gap = { selectedOption: "E" };
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11({
      Q1: gap, Q2: gap, Q3: gap, Q4: gap, Q5: gap, Q6: gap, Q7: gap, Q8: gap,
    }),
    answers2: bothF11({
      Q1: gap, Q2: gap, Q3: gap, Q4: gap, Q5: gap, Q6: gap, Q7: gap, Q8: gap,
    }),
  });
  assert.ok(result.audit.insufficientCount >= 8);
  assert.equal(result.audit.exact1bSpecialCondition, true);
  assert.equal(result.audit.genericPriority1, true);
  assert.equal(result.priority, "1b");
  assert.notEqual(result.priority, "1");
});

check("R6", "special-pair discriminator divergence still returns 3a", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  });
  assert.equal(result.priority, "3a");
  assert.notEqual(result.priority, "1b");
});

check("R7", "ordinary special-pair agreement still reaches 5A", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "C" } }),
  });
  assert.equal(result.priority, "5A");
  assert.equal(result.state, "① CONVERGENT");
  assert.equal(result.audit.exact1bSpecialCondition, false);
});

check("R8", "1b reachability follows corpus-defined special pair/discriminator", () => {
  const dual = cloneDual();
  setOneHigh(dual, "NT/STJ vs NT/STP", "Q4");
  const compare = createDualRespondentComparator(dual);
  assert.equal(compare.corpusConfig.oneHighPair, "NT/STJ vs NT/STP");
  assert.equal(compare.corpusConfig.oneHighDiscriminatorQuestion, "Q4");
  const oldPair = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11(),
    answers2: bothF11(),
  });
  assert.notEqual(oldPair.priority, "1b");
  assert.equal(oldPair.priority, "1");
  const newPair = compare({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q4: { selectedOption: "E" } }),
    answers2: fill({ selectedOption: "A" }, { Q4: { selectedOption: "E" } }),
  });
  assert.equal(newPair.priority, "1b");
  assert.equal(pairRow(newPair, "Q4").left.scope.semanticClass, "OBSERVATION_GAP");
});

check("R9", "malformed special-pair corpus fields fail closed, not generic 1", () => {
  const dual = cloneDual();
  precedenceRowOf(dual, "3a").condition = "Q11 DIVERGE without an Active pair identity";
  const error = assertConfigFailure(dual, "R9");
  assert.equal(error.name, "DualRespondentCorpusConfigurationError");
  assert.equal(error.section, "oneHighSpecialPair");
});

check("R10", "returned 1b still occurs through canonical precedence order", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11(),
    answers2: bothF11(),
  });
  assert.deepEqual(result.audit.precedenceOrder, dualPrecedenceOrder());
  assert.deepEqual(result.audit.precedenceOrder, ["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"]);
  const one = result.audit.precedenceOrder.indexOf("1");
  const oneB = result.audit.precedenceOrder.indexOf("1b");
  assert.ok(one >= 0 && oneB > one);
  assert.equal(result.priority, "1b");
});

function diagnosticCoreFields(result) {
  return {
    priority: result.priority,
    outcomeClass: result.outcomeClass,
    classificationOutcome: result.classificationOutcome,
    state: result.state,
    routing: result.routing,
    output: result.output,
    contradictionCandidates: result.contradictionCandidates,
    genericContradictionEngineInvoked: result.genericContradictionEngineInvoked,
    insufficientCount: result.audit?.insufficientCount ?? null,
    rawAgreeCount: result.audit?.rawAgreeCount ?? null,
    agreeCount: result.audit?.agreeCount ?? null,
    exact1bSpecialCondition: result.audit?.exact1bSpecialCondition ?? null,
    highAllBothLackComparablePrimary: result.audit?.highAllBothLackComparablePrimary ?? null,
    highNotPrimaryBoth: result.audit?.highNotPrimaryBoth ?? null,
  };
}

function corpusSemanticClassEffect(semanticClass) {
  const row = scoringAndTriage.dualRespondentComparison.semanticClassEffects.find(
    (item) => item.semanticclass === semanticClass,
  );
  assert.ok(row, `missing corpus semanticClassEffects row for ${semanticClass}`);
  return {
    useClassEffect: row.useclasseffect,
    signalEffect: row.signaleffect,
    coverageEffect: row.coverageeffect,
    rootCauseFamily: row.rootcausefamily,
  };
}

check("U1", "P_0C unspecified preserves exact roleCode_unspecified token from the resolver", () => {
  const input = {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  };
  const scope = resolveObservationScope({
    moduleId: input.moduleId,
    workbookQuestionId: "Q1",
    respondent: input.respondent1,
    selectedOption: "A",
  });
  const result = compareDualRespondents(input);
  assert.equal(scope.audit.unresolvedReason, "roleCode_unspecified");
  assert.equal(result.priority, "0c");
  assert.equal(result.state, null);
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.outcomeClass, "routing_outcome");
  assert.equal(result.classificationOutcome, "Practitioner access review");
  assert.equal(result.output, "No five-state classification; no Contradiction record from this comparator");
  assert.equal(result.audit.questionRef, "Q1");
  assert.equal(result.audit.unresolvedReason, "roleCode_unspecified");
  assert.equal(result.audit.unresolvedReason, scope.audit.unresolvedReason);
  assert.notEqual(result.audit.unresolvedReason, result.routing);
  assert.notEqual(result.audit.unresolvedReason, result.audit.questionRef);
});

check("U2", "P_0C unknown seniority preserves exact unknown_seniority token from the resolver", () => {
  const respondent = { roleCode: "c_suite", seniorityLevel: "not_a_mapped_tier" };
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent,
    selectedOption: "A",
  });
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: respondent,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(scope.audit.unresolvedReason, "unknown_seniority");
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.audit.unresolvedReason, "unknown_seniority");
  assert.equal(result.audit.unresolvedReason, scope.audit.unresolvedReason);
  assert.equal(result.audit.questionRef, "Q1");
});

check("U3", "P_0C missing module preserves missing_module without collapsing into unsupported_module", () => {
  const scope = resolveObservationScope({ moduleId: "" });
  const result = compareDualRespondents({
    moduleId: "",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(scope.audit.unresolvedReason, "missing_module");
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.state, null);
  assert.equal(result.audit.reason, "unsupported_or_missing_module");
  assert.equal(result.audit.unresolvedReason, "missing_module");
  assert.notEqual(result.audit.unresolvedReason, "unsupported_module");
  assert.equal(result.audit.unresolvedReason, scope.audit.unresolvedReason);
});

check("U4", "P_0C unsupported module preserves unsupported_module without collapsing into missing_module", () => {
  const scope = resolveObservationScope({ moduleId: "environmentLevel1" });
  const result = compareDualRespondents({
    moduleId: "environmentLevel1",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(scope.audit.unresolvedReason, "unsupported_module");
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.audit.reason, "unsupported_or_missing_module");
  assert.equal(result.audit.unresolvedReason, "unsupported_module");
  assert.notEqual(result.audit.unresolvedReason, "missing_module");
  assert.equal(result.audit.unresolvedReason, scope.audit.unresolvedReason);
});

check("U5", "resolver unsupported_or_missing_question token is exact and Dual does not infer it from routing", () => {
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "QX",
    respondent: SENIOR,
    selectedOption: "A",
  });
  assert.equal(scope.useClass, "UNRESOLVED");
  assert.equal(scope.audit.unresolvedReason, "unsupported_or_missing_question");
  assert.equal(scope.routing, "practitioner_access_review");
  assert.notEqual(scope.audit.unresolvedReason, scope.routing);
  assert.notEqual(scope.audit.unresolvedReason, scope.questionRef);
});

check("U6", "external vantage UNRESOLVED does not fabricate an unresolvedReason token", () => {
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: EXTERNAL,
    selectedOption: "A",
  });
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: EXTERNAL,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(scope.useClass, "UNRESOLVED");
  assert.equal(Object.hasOwn(scope.audit, "unresolvedReason"), false);
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.audit.questionRef, "Q1");
  assert.equal(result.audit.unresolvedReason, null);
  assert.notEqual(result.audit.unresolvedReason, "unknown_seniority");
  assert.notEqual(result.audit.unresolvedReason, "roleCode_unspecified");
});

check("U7", "P_0C same routing does not force the same unresolvedReason token", () => {
  const unspecified = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const unknown = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "c_suite", seniorityLevel: "not_a_mapped_tier" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const missing = compareDualRespondents({
    moduleId: "",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const unsupported = compareDualRespondents({
    moduleId: "environmentLevel1",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(unspecified.routing, "practitioner_access_review");
  assert.equal(unknown.routing, unspecified.routing);
  assert.equal(missing.routing, unspecified.routing);
  assert.equal(unsupported.routing, unspecified.routing);
  assert.equal(unspecified.audit.unresolvedReason, "roleCode_unspecified");
  assert.equal(unknown.audit.unresolvedReason, "unknown_seniority");
  assert.equal(missing.audit.unresolvedReason, "missing_module");
  assert.equal(unsupported.audit.unresolvedReason, "unsupported_module");
});

check("U8", "P_0C preserves only the first unresolved scalar token, not a derived collection", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: { roleCode: "c_suite", seniorityLevel: "not_a_mapped_tier" },
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "0c");
  assert.equal(result.audit.questionRef, "Q1");
  assert.equal(result.audit.unresolvedReason, "roleCode_unspecified");
  assert.equal(Array.isArray(result.audit.unresolvedReason), false);
});

check("E1", "semanticClassEffect is the accepted Dual corpus effect row for reachable classes", () => {
  const cases = [
    { question: "Q11", option: "E", semanticClass: "SUBSTANTIVE_SIGNAL" },
    { question: "Q11", option: "F", semanticClass: "OBSERVATION_GAP" },
    { question: "Q10", option: "E", semanticClass: "AMBIGUOUS_COLLAPSE" },
  ];
  for (const item of cases) {
    const scope = resolveObservationScope({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: item.question,
      canonicalQuestionId: `ACQUIRERENVIRONMENT-${item.question}`,
      respondent: SENIOR,
      selectedOption: item.option,
      directObservationGate: "yes",
      evidenceType: "direct_observation",
    });
    assert.equal(scope.semanticClass, item.semanticClass);
    assert.deepEqual(scope.semanticClassEffect, corpusSemanticClassEffect(item.semanticClass));
  }
});

check("E2", "identical observation-scope input yields identical semanticClassEffect", () => {
  const input = {
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q11",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q11",
    respondent: SENIOR,
    selectedOption: "F",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
  };
  const first = resolveObservationScope(input);
  const second = resolveObservationScope(input);
  assert.deepEqual(first.semanticClassEffect, second.semanticClassEffect);
  assert.deepEqual(first.semanticClassEffect, corpusSemanticClassEffect("OBSERVATION_GAP"));
});

check("E3", "pairRows left/right expose the same semanticClassEffect as the underlying scope", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
  });
  const q11 = pairRow(result, "Q11");
  const leftScope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q11",
    respondent: SENIOR,
    selectedOption: "F",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
  });
  assert.equal(q11.left.scope.semanticClass, "OBSERVATION_GAP");
  assert.deepEqual(q11.left.scope.semanticClassEffect, leftScope.semanticClassEffect);
  assert.deepEqual(q11.right.scope.semanticClassEffect, leftScope.semanticClassEffect);
  assert.deepEqual(q11.left.scope.semanticClassEffect, corpusSemanticClassEffect("OBSERVATION_GAP"));
});

check("E4", "adding semanticClassEffect does not change eligibility, quality, or branch", () => {
  const result = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(result.priority, "5A");
  assert.equal(result.state, "① CONVERGENT");
  assert.equal(result.routing, "① CONVERGENT");
  assert.equal(result.audit.agreeCount, 11);
  assert.equal(result.audit.insufficientCount, 0);
  const q1 = pairRow(result, "Q1");
  assert.equal(q1.left.scope.useClass, "PRIMARY");
  assert.equal(q1.left.scope.comparisonEligible, true);
  assert.equal(q1.left.scope.comparisonAvailability, "available");
  assert.equal(q1.quality, 1);
  assert.equal(q1.left.scope.semanticClass, null);
  assert.equal(q1.left.scope.semanticClassEffect, null);
});

check("D0", "P_0C/P_1/P_1B/P_3/P_5A diagnostic fields remain pre-repair values except additive audit tokens/effects", () => {
  const fiveA = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.deepEqual(diagnosticCoreFields(fiveA), {
    priority: "5A",
    outcomeClass: "divergence_state",
    classificationOutcome: "① CONVERGENT",
    state: "① CONVERGENT",
    routing: "① CONVERGENT",
    output: "★★★ STRONG signal pattern; 0 Contradiction records",
    contradictionCandidates: [],
    genericContradictionEngineInvoked: false,
    insufficientCount: 0,
    rawAgreeCount: 11,
    agreeCount: 11,
    exact1bSpecialCondition: false,
    highAllBothLackComparablePrimary: false,
    highNotPrimaryBoth: false,
  });

  const oneB = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: bothF11(),
    answers2: bothF11(),
  });
  assert.deepEqual(diagnosticCoreFields(oneB), {
    priority: "1b",
    outcomeClass: "coverage_outcome",
    classificationOutcome: "NF/SFP determination impossible",
    state: null,
    routing: "practitioner_review",
    output: "Pair evaluation suppressed for NF/SFP vs NF/SFJ / Q11 discriminator family; no automatic EDv2 fallback",
    contradictionCandidates: [],
    genericContradictionEngineInvoked: false,
    insufficientCount: 1,
    rawAgreeCount: 10,
    agreeCount: 10,
    exact1bSpecialCondition: true,
    highAllBothLackComparablePrimary: true,
    highNotPrimaryBoth: false,
  });

  const unspecified = compareDualRespondents({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.deepEqual(diagnosticCoreFields(unspecified), {
    priority: "0c",
    outcomeClass: "routing_outcome",
    classificationOutcome: "Practitioner access review",
    state: null,
    routing: "practitioner_access_review",
    output: "No five-state classification; no Contradiction record from this comparator",
    contradictionCandidates: [],
    genericContradictionEngineInvoked: false,
    insufficientCount: null,
    rawAgreeCount: null,
    agreeCount: null,
    exact1bSpecialCondition: null,
    highAllBothLackComparablePrimary: null,
    highNotPrimaryBoth: null,
  });
  assert.equal(unspecified.audit.questionRef, "Q1");
});

const q1 = ACQUIRER_TRACK_DATA.acquirerModule.questions.find((question) => question.workbookQuestionId === "Q1");
assert.equal(q1.id, "Q1");
assert.equal(q1.canonicalQuestionId, "ACQUIRERENVIRONMENT-Q1");
assert.equal(q1.moduleId, "acquirerEnvironment");

console.log("Observation Scope runtime core cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
