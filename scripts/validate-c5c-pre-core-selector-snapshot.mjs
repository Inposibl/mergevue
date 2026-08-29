import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import {
  BRANCH_CODES,
  PRE_CORE_OUTCOME_CODES,
  PRIORITY_TO_BRANCH_CODE,
  PROVIDER_CANDIDATE_SCHEMA_VERSION,
  PROVIDER_PROMPT_VERSION,
  SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES,
  UNCERTAINTY_DOMAINS,
} from "../src/agent/agentContractConstants.js";
import {
  AgentBoundaryAssemblyError,
  assembleEngineSnapshot,
  computeEngineSnapshotDigest,
  engineSnapshotDigestCoveredContent,
  normalizeCandidatePair,
} from "../src/agent/engineSnapshot.js";
import { assemblePreCoreSelectorSnapshot } from "../src/agent/preCoreSelectorSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import { evaluateDeterministicChecks } from "../src/agent/semanticLocalEvaluator.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import {
  buildC5CPreCoreSelectorProvenance,
  buildC5CSelectedSelectorProvenance,
} from "./fixtures/c5c-selected-session.mjs";

const ROOT = new URL("../", import.meta.url);
const results = [];
const EXPECTED_BRANCHES = Object.freeze([
  "P_0A", "P_0B", "P_0C", "P_1", "P_1B", "P_2", "P_3A",
  "P_3", "P_4", "P_5X", "P_5A", "P_5B", "UNMATCHED",
]);
const EXPECTED_COMPATIBLE = Object.freeze([
  "P_5A", "P_5B", "P_4", "P_3", "P_2", "P_5X", "P_1", "P_0C", "UNMATCHED",
]);
const EXPECTED_PRE_CODES = Object.freeze([
  "S_ADMISSIBILITY_UNRESOLVED",
  "S_NO_LAWFUL_PAIR",
  "S_PAIR_SELECTION_AMBIGUOUS",
]);
const EXPECTED_PRE_STATUS = Object.freeze([
  "ADMISSIBILITY_UNRESOLVED",
  "NO_LAWFUL_PAIR",
  "PAIR_SELECTION_AMBIGUOUS",
]);
const EXPECTED_SELECTOR_KEYS = Object.freeze([
  "selectorId", "selectorVersion", "observationScopePolicy", "sourceModule",
  "sourceInstrument", "sessionId", "respondentSlot", "respondentVantage",
  "semanticBindings", "status", "decisionCode", "candidatePair",
  "candidatePairNormalized",
]);
const EXPECTED_SELECTOR_UNRESOLVED_KEYS = Object.freeze([
  ...EXPECTED_SELECTOR_KEYS,
  "routing",
  "unresolvedReason",
]);
const EXPECTED_PRE_OUTCOME_KEYS = Object.freeze([
  "engineOutcomeCode", "outcomeClass", "classificationOutcome", "state",
  "deterministicStateEstablished", "provisionalState", "engineRoutingMetadata",
  "engineOutput", "contradictionCandidates", "genericContradictionEngineInvoked",
  "suppression", "finality",
]);
const EXPECTED_UNCERTAINTY_DOMAINS = Object.freeze([
  "ELIGIBILITY", "ACCESS", "COVERAGE", "EVIDENCE_QUALITY", "CONTRADICTION",
  "ROLE_TIER", "PAIR_SCOPE", "COHERENCE", "PROVISIONALITY",
]);
const EXPECTED_PRECEDENCE = Object.freeze(["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"]);
const SELECTOR_HASH = "9aa93625d3a3f19b9fbc002504b97d0acf284d084a9c91f3f0dc119ad3404d43";
const DUAL_HASH = "5b730d53df647ddf12f58a0f4e8bf1bcb294e852b4f080ed5a038103b79ba2e3";

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function assertExactKeys(value, keys) {
  assert.deepEqual(sortedKeys(value), [...keys].sort());
}

function sha256File(relativePath) {
  return createHash("sha256").update(readFileSync(new URL(relativePath, ROOT))).digest("hex");
}

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
  return Object.fromEntries(Array.from({ length: 11 }, (_, index) => {
    const q = `Q${index + 1}`;
    return [q, answer({ ...template, ...(except[q] ?? {}) })];
  }));
}

const SENIOR = Object.freeze({ roleCode: "c_suite", seniorityLevel: "c_suite" });
const DUAL_INPUT = Object.freeze({
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill(),
  answers2: fill(),
  outOfPairEvidence: false,
  coherenceAmbiguous: false,
});
const SELECTED = buildC5CSelectedSelectorProvenance();

function identityFor(input = DUAL_INPUT, overrides = {}) {
  return {
    diagnosticId: "diag-c5c-validator",
    projectId: null,
    moduleId: input.moduleId,
    candidatePair: input.candidatePair,
    candidatePairNormalized: normalizeCandidatePair(input.candidatePair),
    ...overrides,
  };
}

function assembleDual(input = DUAL_INPUT, selectorProvenance = SELECTED, identityOverrides = {}) {
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input, identityOverrides),
    coreInput: input,
    selectorProvenance,
  });
  return { coreOutput, snapshot };
}

function assemblePre(status) {
  const selectorProvenance = buildC5CPreCoreSelectorProvenance(status);
  const snapshot = assemblePreCoreSelectorSnapshot({
    identityContext: {
      diagnosticId: `diag-c5c-${status.toLowerCase()}`,
      projectId: null,
      moduleId: "acquirerEnvironment",
      candidatePair: null,
      candidatePairNormalized: null,
    },
    selectorProvenance,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
  });
  const request = buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    interpretationContextPack: pack,
  });
  const projection = projectProviderProjection(request);
  return { status, selectorProvenance, snapshot, uncertainty, pack, request, projection };
}

const PRE = Object.freeze(Object.fromEntries(EXPECTED_PRE_STATUS.map((status) => [status, assemblePre(status)])));

function abstentionOutcome(fixture) {
  const disclosures = fixture.uncertainty.items
    .filter((item) => item.disclosureRequired === true)
    .map((item) => ({ uncertaintyId: item.uncertaintyId }));
  const dSet = evaluateDeterministicChecks(fixture.request, {
    interpretationStatus: "ABSTAINED_INSUFFICIENT_EVIDENCE",
    uncertainty: { disclosures },
  });
  return dSet.find((row) => row.dCheckId === "V-17-ABSTENTION-PRECONDITIONS")?.outcome;
}

function expectAssemblyFailure(fn, pattern) {
  assert.throws(fn, (error) => {
    assert.equal(error instanceof AgentBoundaryAssemblyError, true);
    if (pattern) assert.match(error.message, pattern);
    return true;
  });
}

function incompatibleInput(branchCode) {
  const fixtures = {
    P_0A: { ...DUAL_INPUT, candidatePair: "" },
    P_0B: { ...DUAL_INPUT, candidatePair: "NF/NT vs STJ/STP" },
    P_1B: {
      ...DUAL_INPUT,
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
      answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
    },
    P_3A: {
      ...DUAL_INPUT,
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
      answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
    },
  };
  return fixtures[branchCode];
}

function assertIncompatibleBranchRejected(branchCode) {
  const input = incompatibleInput(branchCode);
  const coreOutput = compareDualRespondents(input);
  assert.equal(`P_${String(coreOutput.priority).toUpperCase()}`, branchCode);
  expectAssemblyFailure(() => assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input),
    coreInput: input,
    selectorProvenance: SELECTED,
  }), new RegExp(`${branchCode} is not selector-compatible`));
}

check("C5C-01", "DUAL_CORE preserves exact Core recomputation", () => {
  const { coreOutput, snapshot } = assembleDual();
  assert.equal(snapshot.engine.outcome.priority, coreOutput.priority);
  const tampered = structuredClone(coreOutput);
  tampered.output = `${tampered.output} tampered`;
  expectAssemblyFailure(() => assembleEngineSnapshot({
    coreOutput: tampered,
    identityContext: identityFor(),
    coreInput: DUAL_INPUT,
    selectorProvenance: SELECTED,
  }), /coreOutput does not match compareDualRespondents/);
});

check("C5C-02", "DUAL_CORE exact envelope includes selector and comparison", () => {
  const { snapshot } = assembleDual();
  assertExactKeys(snapshot, ["snapshotSchemaVersion", "engineSnapshotDigest", "outcomeSource", "identity", "selector", "engine"]);
  assertExactKeys(snapshot.engine, ["outcome", "observations", "comparison"]);
  assert.equal(snapshot.outcomeSource, "DUAL_CORE");
});

check("C5C-03", "PRE_CORE carries no priority", () => {
  for (const fixture of Object.values(PRE)) assert.equal(Object.hasOwn(fixture.snapshot.engine.outcome, "priority"), false);
});

check("C5C-04", "PRE_CORE carries no branchCode", () => {
  for (const fixture of Object.values(PRE)) assert.equal(Object.hasOwn(fixture.snapshot.engine.outcome, "branchCode"), false);
});

check("C5C-05", "PRE_CORE carries no engineAuditRaw", () => {
  for (const fixture of Object.values(PRE)) assert.equal(Object.hasOwn(fixture.snapshot.engine.outcome, "engineAuditRaw"), false);
});

check("C5C-06", "PRE_CORE engine carries no comparison", () => {
  for (const fixture of Object.values(PRE)) assertExactKeys(fixture.snapshot.engine, ["outcome", "observations"]);
});

check("C5C-07", "PRE_CORE snapshots contain neither coreInput nor coreOutput nodes", () => {
  for (const fixture of Object.values(PRE)) {
    assert.equal(Object.hasOwn(fixture.snapshot, "coreInput"), false);
    assert.equal(Object.hasOwn(fixture.snapshot, "coreOutput"), false);
  }
});

check("C5C-08", "S_ADMISSIBILITY_UNRESOLVED exact semantic shape", () => {
  const { snapshot, uncertainty } = PRE.ADMISSIBILITY_UNRESOLVED;
  assert.deepEqual(snapshot.engine.outcome, {
    engineOutcomeCode: "S_ADMISSIBILITY_UNRESOLVED",
    outcomeClass: "routing_outcome",
    classificationOutcome: "Practitioner access review",
    state: null,
    deterministicStateEstablished: false,
    provisionalState: null,
    engineRoutingMetadata: "practitioner_access_review",
    engineOutput: "No five-state classification; no Contradiction record from this comparator",
    contradictionCandidates: [],
    genericContradictionEngineInvoked: false,
    suppression: {
      comparatorOutputSuppressed: false,
      pairEvaluationSuppressed: false,
      prohibitedFallbackActive: false,
      determinationImpossible: null,
      comparatorDidNotRun: true,
    },
    finality: "NON_FINAL_ROUTED",
  });
  assert.equal(uncertainty.items[0].uncertaintyDomain, "ELIGIBILITY");
  assert.deepEqual(uncertainty.items[0].affectedClaims, ["CLAIM_ENGINE_STATE_IDENTITY", "CLAIM_OBSERVATION_ELIGIBILITY"]);
});

check("C5C-09", "S_NO_LAWFUL_PAIR exact semantic shape", () => {
  const { snapshot, uncertainty } = PRE.NO_LAWFUL_PAIR;
  assertExactKeys(snapshot.engine.outcome, EXPECTED_PRE_OUTCOME_KEYS);
  assert.equal(snapshot.engine.outcome.engineOutcomeCode, "S_NO_LAWFUL_PAIR");
  assert.equal(snapshot.engine.outcome.classificationOutcome, "CANDIDATE PAIR NOT ESTABLISHED — no lawful candidate pair");
  assert.equal(snapshot.engine.outcome.engineOutput, "No comparator output; no Contradiction record");
  assert.equal(snapshot.engine.outcome.finality, "NON_FINAL_ROUTED");
  assert.equal(uncertainty.items[0].reasonCode, "SELECTOR_NO_LAWFUL_CANDIDATE_PAIR");
});

check("C5C-10", "S_PAIR_SELECTION_AMBIGUOUS exact semantic shape", () => {
  const { snapshot, uncertainty } = PRE.PAIR_SELECTION_AMBIGUOUS;
  assertExactKeys(snapshot.engine.outcome, EXPECTED_PRE_OUTCOME_KEYS);
  assert.equal(snapshot.engine.outcome.engineOutcomeCode, "S_PAIR_SELECTION_AMBIGUOUS");
  assert.equal(snapshot.engine.outcome.classificationOutcome, "CANDIDATE PAIR NOT ESTABLISHED — more than one lawful candidate pair");
  assert.equal(snapshot.engine.outcome.engineOutput, "No comparator output; no Contradiction record");
  assert.equal(snapshot.engine.outcome.finality, "NON_FINAL_ROUTED");
  assert.equal(uncertainty.items[0].reasonCode, "SELECTOR_CANDIDATE_PAIR_AMBIGUOUS");
});

check("C5C-11", "ambiguous and zero-pair causes stay distinct", () => {
  const noPair = PRE.NO_LAWFUL_PAIR;
  const ambiguous = PRE.PAIR_SELECTION_AMBIGUOUS;
  assert.notEqual(noPair.snapshot.engine.outcome.classificationOutcome, ambiguous.snapshot.engine.outcome.classificationOutcome);
  assert.notEqual(noPair.uncertainty.items[0].reasonCode, ambiguous.uncertainty.items[0].reasonCode);
});

check("C5C-12", "comparatorDidNotRun is true for all PRE_CORE outcomes", () => {
  for (const fixture of Object.values(PRE)) assert.equal(fixture.snapshot.engine.outcome.suppression.comparatorDidNotRun, true);
});

check("C5C-13", "PRE_CORE never fabricates a candidate pair", () => {
  for (const fixture of Object.values(PRE)) {
    assert.equal(fixture.snapshot.identity.candidatePair, null);
    assert.equal(fixture.snapshot.identity.candidatePairNormalized, null);
    assert.equal(fixture.snapshot.selector.candidatePair, null);
    assert.equal(fixture.snapshot.selector.candidatePairNormalized, null);
  }
});

check("C5C-14", "SELECTED selector provenance has the exact minimal 13-key shape", () => {
  assertExactKeys(SELECTED, EXPECTED_SELECTOR_KEYS);
});

check("C5C-15", "PRE selector provenance uses the exact conditional key shapes", () => {
  assertExactKeys(PRE.ADMISSIBILITY_UNRESOLVED.snapshot.selector, EXPECTED_SELECTOR_UNRESOLVED_KEYS);
  assertExactKeys(PRE.NO_LAWFUL_PAIR.snapshot.selector, EXPECTED_SELECTOR_KEYS);
  assertExactKeys(PRE.PAIR_SELECTION_AMBIGUOUS.snapshot.selector, EXPECTED_SELECTOR_KEYS);
});

check("C5C-16", "selector audit fields are absent in both variants", () => {
  for (const selector of [assembleDual().snapshot.selector, ...Object.values(PRE).map((row) => row.snapshot.selector)]) {
    for (const key of ["audit", "matchedPairs", "positiveEnvironmentSet", "contributions", "selectedAt", "timestamp"]) {
      assert.equal(Object.hasOwn(selector, key), false, key);
    }
  }
});

check("C5C-17", "every present DUAL selector field is digest-covered", () => {
  const { snapshot } = assembleDual();
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  for (const key of Object.keys(snapshot.selector)) {
    const mutated = structuredClone(covered);
    mutated.selector[key] = typeof mutated.selector[key] === "string"
      ? `${mutated.selector[key]}-mutated`
      : { mutated: true };
    assert.notEqual(computeEngineSnapshotDigest(mutated), snapshot.engineSnapshotDigest, key);
  }
});

check("C5C-18", "every present unresolved selector field is digest-covered", () => {
  const { snapshot } = PRE.ADMISSIBILITY_UNRESOLVED;
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  for (const key of Object.keys(snapshot.selector)) {
    const mutated = structuredClone(covered);
    mutated.selector[key] = typeof mutated.selector[key] === "string"
      ? `${mutated.selector[key]}-mutated`
      : { mutated: true };
    assert.notEqual(computeEngineSnapshotDigest(mutated), snapshot.engineSnapshotDigest, key);
  }
});

check("C5C-19", "identity candidatePair mutation changes digest", () => {
  const { snapshot } = assembleDual();
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  covered.identity.candidatePair = "STJ/STP vs NT/STJ";
  assert.notEqual(computeEngineSnapshotDigest(covered), snapshot.engineSnapshotDigest);
});

check("C5C-20", "identity candidatePairNormalized mutation changes digest", () => {
  const { snapshot } = assembleDual();
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  covered.identity.candidatePairNormalized = "STJ/STP vs NT/STJ";
  assert.notEqual(computeEngineSnapshotDigest(covered), snapshot.engineSnapshotDigest);
});

check("C5C-21", "outcomeSource mutation changes digest", () => {
  const { snapshot } = assembleDual();
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  covered.outcomeSource = "PRE_CORE_SELECTOR";
  assert.notEqual(computeEngineSnapshotDigest(covered), snapshot.engineSnapshotDigest);
});

check("C5C-22", "schema version mutation changes digest", () => {
  const { snapshot } = assembleDual();
  const covered = engineSnapshotDigestCoveredContent(snapshot);
  covered.snapshotSchemaVersion = "engine-snapshot-mutated";
  assert.notEqual(computeEngineSnapshotDigest(covered), snapshot.engineSnapshotDigest);
});

check("C5C-23", "timestamps and selector audit cannot influence a builder digest because they are absent", () => {
  for (const fixture of [assembleDual(), ...Object.values(PRE)]) {
    const covered = engineSnapshotDigestCoveredContent(fixture.snapshot);
    assert.equal(Object.hasOwn(covered.selector, "selectedAt"), false);
    assert.equal(Object.hasOwn(covered.selector, "timestamp"), false);
    assert.equal(Object.hasOwn(covered.selector, "audit"), false);
  }
});

check("C5C-24", "Agent provider projection has no selector node", () => {
  for (const fixture of Object.values(PRE)) assert.equal(Object.hasOwn(fixture.projection.engineSnapshot, "selector"), false);
});

check("C5C-25", "engineRoutingMetadata remains non-projected", () => {
  for (const fixture of Object.values(PRE)) {
    assert.equal(Object.hasOwn(fixture.projection.engineSnapshot.engine.outcome, "engineRoutingMetadata"), false);
  }
});

check("C5C-26", "INPUT_INVALID cannot create a snapshot", () => {
  expectAssemblyFailure(() => assemblePreCoreSelectorSnapshot({
    identityContext: { diagnosticId: "x", projectId: null, moduleId: "acquirerEnvironment" },
    selectorProvenance: { ...SELECTED, status: "INPUT_INVALID", decisionCode: "INPUT_INVALID", candidatePair: null, candidatePairNormalized: null },
  }), /status is not snapshot-eligible/);
});

check("C5C-27", "CONFIG_INVALID cannot create a snapshot", () => {
  expectAssemblyFailure(() => assemblePreCoreSelectorSnapshot({
    identityContext: { diagnosticId: "x", projectId: null, moduleId: "acquirerEnvironment" },
    selectorProvenance: { ...SELECTED, status: "CONFIG_INVALID", decisionCode: "CONFIG_INVALID", candidatePair: null, candidatePairNormalized: null },
  }), /status is not snapshot-eligible/);
});

check("C5C-28", "all S_* outcomes reject semantic abstention", () => {
  for (const fixture of Object.values(PRE)) assert.equal(abstentionOutcome(fixture), "FAIL");
});

check("C5C-29", "unknown_seniority remains a production-generated unresolved cause", () => {
  const fixture = PRE.ADMISSIBILITY_UNRESOLVED;
  assert.equal(fixture.selectorProvenance.status, "ADMISSIBILITY_UNRESOLVED");
  assert.equal(fixture.selectorProvenance.unresolvedReason, "unknown_seniority");
  assert.equal(fixture.uncertainty.items[0].reasonCode, "ELIGIBILITY_UNRESOLVED_RESPONDENT_VANTAGE_NOT_ESTABLISHED");
  assert.equal(abstentionOutcome(fixture), "FAIL");
});

check("C5C-30", "DUAL_CORE rejects missing selectorProvenance", () => {
  const coreOutput = compareDualRespondents(DUAL_INPUT);
  expectAssemblyFailure(() => assembleEngineSnapshot({ coreOutput, identityContext: identityFor(), coreInput: DUAL_INPUT }), /selectorProvenance/);
});

check("C5C-31", "DUAL_CORE rejects null selectorProvenance", () => {
  const coreOutput = compareDualRespondents(DUAL_INPUT);
  expectAssemblyFailure(() => assembleEngineSnapshot({ coreOutput, identityContext: identityFor(), coreInput: DUAL_INPUT, selectorProvenance: null }), /selectorProvenance/);
});

check("C5C-32", "DUAL_CORE rejects non-SELECTED selector status", () => {
  const coreOutput = compareDualRespondents(DUAL_INPUT);
  expectAssemblyFailure(() => assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(),
    coreInput: DUAL_INPUT,
    selectorProvenance: PRE.NO_LAWFUL_PAIR.selectorProvenance,
  }), /requires selectorProvenance.status SELECTED/);
});

check("C5C-33", "DUAL_CORE rejects selector candidatePair mismatch", () => {
  const coreOutput = compareDualRespondents(DUAL_INPUT);
  const selector = { ...SELECTED, candidatePair: "STJ/STP vs NT/STJ" };
  expectAssemblyFailure(() => assembleEngineSnapshot({ coreOutput, identityContext: identityFor(), coreInput: DUAL_INPUT, selectorProvenance: selector }), /candidatePair must match/);
});

check("C5C-34", "DUAL_CORE rejects selector normalized-pair mismatch", () => {
  const coreOutput = compareDualRespondents(DUAL_INPUT);
  const selector = { ...SELECTED, candidatePairNormalized: "STJ/STP vs NT/STJ" };
  expectAssemblyFailure(() => assembleEngineSnapshot({ coreOutput, identityContext: identityFor(), coreInput: DUAL_INPUT, selectorProvenance: selector }), /candidatePairNormalized must match/);
});

check("C5C-35", "S_* namespace is disjoint from BRANCH_CODES", () => {
  assert.deepEqual(PRE_CORE_OUTCOME_CODES, EXPECTED_PRE_CODES);
  assert.deepEqual(PRE_CORE_OUTCOME_CODES.filter((code) => BRANCH_CODES.includes(code)), []);
});

check("C5C-36", "S_* namespace is absent from priority maps", () => {
  const priorityDomain = [...Object.keys(PRIORITY_TO_BRANCH_CODE), ...Object.values(PRIORITY_TO_BRANCH_CODE)];
  assert.deepEqual(PRE_CORE_OUTCOME_CODES.filter((code) => priorityDomain.includes(code)), []);
});

check("C5C-37", "Core precedence remains the exact accepted sequence", () => {
  assert.deepEqual(scoringAndTriage.dualRespondentComparison.classificationPrecedence.map((row) => row.priority), EXPECTED_PRECEDENCE);
});

check("C5C-38", "Core branch domain remains exactly 13", () => {
  assert.deepEqual(BRANCH_CODES, EXPECTED_BRANCHES);
  assert.equal(BRANCH_CODES.length, 13);
});

check("C5C-39", "selector-compatible Dual branch domain is exactly 9", () => {
  assert.deepEqual(SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES, EXPECTED_COMPATIBLE);
  assert.equal(SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES.length, 9);
});

check("C5C-40", "source declares compatibility without a production-reachability fiction", () => {
  const constantsSource = readFileSync(new URL("src/agent/agentContractConstants.js", ROOT), "utf8");
  assert.equal(constantsSource.includes("CURRENT_FREE_COMPOSITION_REACHABLE_BRANCH_CODES"), false);
  assert.equal(constantsSource.includes("PRODUCTION_REACHABLE_BRANCH_CODES"), false);
});

check("C5C-41", "P_0A is not constructible as selector-authoritative DUAL_CORE", () => assertIncompatibleBranchRejected("P_0A"));
check("C5C-42", "P_0B is not constructible as selector-authoritative DUAL_CORE", () => assertIncompatibleBranchRejected("P_0B"));
check("C5C-43", "pair #5 P_1B is not constructible as selector-authoritative DUAL_CORE", () => assertIncompatibleBranchRejected("P_1B"));
check("C5C-44", "pair #5 P_3A is not constructible as selector-authoritative DUAL_CORE", () => assertIncompatibleBranchRejected("P_3A"));

check("C5C-45", "P_2 and P_5X are compatibility entries, not reachability claims", () => {
  assert.equal(SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES.includes("P_2"), true);
  assert.equal(SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES.includes("P_5X"), true);
  const constantsSource = readFileSync(new URL("src/agent/agentContractConstants.js", ROOT), "utf8");
  assert.equal(/P_2[^\n]*production.reachable/i.test(constantsSource), false);
  assert.equal(/P_5X[^\n]*production.reachable/i.test(constantsSource), false);
});

check("C5C-46", "NO_LAWFUL routing token is exact", () => {
  assert.equal(PRE.NO_LAWFUL_PAIR.snapshot.engine.outcome.engineRoutingMetadata, "selector_no_lawful_candidate_pair");
});

check("C5C-47", "AMBIGUOUS routing token is exact", () => {
  assert.equal(PRE.PAIR_SELECTION_AMBIGUOUS.snapshot.engine.outcome.engineRoutingMetadata, "selector_candidate_pair_ambiguous");
});

check("C5C-48", "selector routing tokens do not enter Agent projection", () => {
  for (const fixture of [PRE.NO_LAWFUL_PAIR, PRE.PAIR_SELECTION_AMBIGUOUS]) {
    const serialized = JSON.stringify(fixture.projection);
    assert.equal(serialized.includes(fixture.snapshot.engine.outcome.engineRoutingMetadata), false);
  }
});

check("C5C-49", "PRE_CORE snapshot has no humanGate", () => {
  for (const fixture of Object.values(PRE)) assert.equal(Object.hasOwn(fixture.snapshot, "humanGate"), false);
});

check("C5C-50", "NO_LAWFUL and AMBIGUOUS use automated uncertainty interpretation", () => {
  assert.equal(PRE.NO_LAWFUL_PAIR.request.freeInterpretationMode, "AUTOMATED_UNCERTAINTY_INTERPRETATION");
  assert.equal(PRE.PAIR_SELECTION_AMBIGUOUS.request.freeInterpretationMode, "AUTOMATED_UNCERTAINTY_INTERPRETATION");
});

check("C5C-51", "new selector reason codes are distinct", () => {
  assert.notEqual(PRE.NO_LAWFUL_PAIR.uncertainty.items[0].reasonCode, PRE.PAIR_SELECTION_AMBIGUOUS.uncertainty.items[0].reasonCode);
});

check("C5C-52", "both selector pair reasons map to PAIR_SCOPE", () => {
  assert.equal(PRE.NO_LAWFUL_PAIR.uncertainty.items[0].uncertaintyDomain, "PAIR_SCOPE");
  assert.equal(PRE.PAIR_SELECTION_AMBIGUOUS.uncertainty.items[0].uncertaintyDomain, "PAIR_SCOPE");
});

check("C5C-53", "C5-C adds no uncertainty domain", () => {
  assert.deepEqual(UNCERTAINTY_DOMAINS, EXPECTED_UNCERTAINTY_DOMAINS);
});

check("C5C-54", "C-NO-AGENT-PAIR-SELECTION is active for both pair-selection failures", () => {
  for (const fixture of [PRE.NO_LAWFUL_PAIR, PRE.PAIR_SELECTION_AMBIGUOUS]) {
    assert.equal(fixture.uncertainty.items[0].constraintIds.includes("C-NO-AGENT-PAIR-SELECTION"), true);
    assert.equal(fixture.request.activeConstraints.some((row) => row.constraintId === "C-NO-AGENT-PAIR-SELECTION"), true);
  }
});

check("C5C-55", "snapshot digest is deterministic and history-independent", () => {
  for (const status of EXPECTED_PRE_STATUS) {
    const first = assemblePre(status).snapshot;
    const second = assemblePre(status).snapshot;
    assert.equal(first.engineSnapshotDigest, second.engineSnapshotDigest, status);
    assert.deepEqual(first, second, status);
  }
});

check("C5C-56", "PRE_CORE builder has no resource or ECS imports", () => {
  const source = readFileSync(new URL("src/agent/preCoreSelectorSnapshot.js", ROOT), "utf8");
  assert.equal(/from\s+["'][^"']*(resource|ecs)[^"']*["']/i.test(source), false);
});

check("C5C-57", "engineSnapshot does not import or call candidatePairSelector", () => {
  const source = readFileSync(new URL("src/agent/engineSnapshot.js", ROOT), "utf8");
  assert.equal(source.includes("candidatePairSelector"), false);
  assert.equal(source.includes("selectCandidatePair("), false);
});

check("C5C-58", "PRE_CORE builder does not call selectCandidatePair", () => {
  const source = readFileSync(new URL("src/agent/preCoreSelectorSnapshot.js", ROOT), "utf8");
  assert.equal(source.includes("selectCandidatePair("), false);
});

check("C5C-59", "PRE_CORE builder does not call compareDualRespondents or import src/flow", () => {
  const source = readFileSync(new URL("src/agent/preCoreSelectorSnapshot.js", ROOT), "utf8");
  assert.equal(source.includes("compareDualRespondents("), false);
  assert.equal(/from\s+["'][^"']*\/flow\//.test(source), false);
});

check("C5C-60", "candidatePairSelector remains byte-identical", () => {
  assert.equal(sha256File("src/flow/candidatePairSelector.js"), SELECTOR_HASH);
});

check("C5C-61", "dualRespondentComparison remains byte-identical", () => {
  assert.equal(sha256File("src/flow/dualRespondentComparison.js"), DUAL_HASH);
});

check("C5C-62", "provider prompt and candidate-schema versions remain unchanged", () => {
  assert.equal(PROVIDER_PROMPT_VERSION, "provider-prompt-1.2");
  assert.equal(PROVIDER_CANDIDATE_SCHEMA_VERSION, "provider-semantic-candidate-1.2");
});

check("C5C-63", "ADMISSIBILITY owns routing/unresolvedReason while other PRE statuses do not", () => {
  const unresolved = PRE.ADMISSIBILITY_UNRESOLVED.snapshot.selector;
  assert.equal(Object.hasOwn(unresolved, "routing"), true);
  assert.equal(Object.hasOwn(unresolved, "unresolvedReason"), true);
  for (const fixture of [PRE.NO_LAWFUL_PAIR, PRE.PAIR_SELECTION_AMBIGUOUS]) {
    assert.equal(Object.hasOwn(fixture.snapshot.selector, "routing"), false);
    assert.equal(Object.hasOwn(fixture.snapshot.selector, "unresolvedReason"), false);
  }
});

check("C5C-64", "all PRE_CORE observations are exact empty arrays", () => {
  for (const fixture of Object.values(PRE)) assert.deepEqual(fixture.snapshot.engine.observations, []);
});

check("C5C-65", "CLAIM_OBSERVATION_ELIGIBILITY never becomes permitted from zero observations", () => {
  const eligibilityBoundary = PRE.ADMISSIBILITY_UNRESOLVED.uncertainty.claimBoundaries
    .find((row) => row.claimId === "CLAIM_OBSERVATION_ELIGIBILITY");
  assert.equal(eligibilityBoundary?.permitted, false);
  for (const fixture of [PRE.NO_LAWFUL_PAIR, PRE.PAIR_SELECTION_AMBIGUOUS]) {
    assert.equal(
      fixture.uncertainty.claimBoundaries.some((row) => row.claimId === "CLAIM_OBSERVATION_ELIGIBILITY"),
      false,
    );
  }
});

console.log("C5-C PRE_CORE Selector Snapshot cases passed:");
for (const row of results) console.log(`  ${row.id}. ${row.label}: ${row.status}`);
console.log(`PASS ${results.length}/${results.length}`);
