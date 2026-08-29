import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  AGENT_CONTRACT_VERSION,
  BASELINE_CONSTRAINT_IDS,
  BLOCKED_CLAIM_IDS_BY_CONSTRAINT,
  BRANCH_CODES,
  CONSTRAINTS_BY_BRANCH,
  CONSTRAINT_SCOPE_BRANCH,
  CONSTRAINT_SCOPE_REQUEST_WIDE,
  FREE_INTERPRETATION_MODE,
  PRE_CORE_FREE_INTERPRETATION_MODE_BY_OUTCOME_CODE,
  PRE_CORE_OUTCOME_CODES,
  SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "../src/agent/agentContractConstants.js";
import { canonicalSerialize, sha256PrefixedDigest } from "../src/agent/canonicalDigest.js";
import {
  assembleEngineSnapshot,
  deriveFreeInterpretationMode,
  normalizeCandidatePair,
} from "../src/agent/engineSnapshot.js";
import { assemblePreCoreSelectorSnapshot } from "../src/agent/preCoreSelectorSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import {
  buildInterpretationContextPack,
  computePackScopeVerdict,
} from "../src/agent/interpretationContextPack.js";
import {
  AgentInterpretationRequestAssemblyError,
  buildAgentInterpretationRequest,
  validateAgentInterpretationRequestIntegrity,
} from "../src/agent/agentInterpretationRequest.js";
import {
  ProviderProjectionError,
  projectProviderProjection,
} from "../src/agent/providerProjection.js";
import { precedenceRawCondition } from "../src/agent/contextAuthorityRegistry.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import {
  buildC5CPreCoreSelectorProvenance,
  buildC5CSelectedSelectorProvenance,
} from "./fixtures/c5c-selected-session.mjs";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const ROOT_KEYS = Object.freeze([
  "requestSchemaVersion",
  "agentContractVersion",
  "interpretationId",
  "engineSnapshot",
  "structuredUncertainty",
  "interpretationContextPack",
  "permittedOutputScope",
  "permittedInterpretationDomains",
  "freeInterpretationMode",
  "humanReviewOccurred",
  "activeConstraints",
  "outputSchemaVersion",
]);
const CONSTRAINT_ROW_KEYS = Object.freeze([
  "constraintId",
  "scope",
  "blockedClaimIds",
  "originBranch",
]);
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const EXPECTED_BASELINE = Object.freeze([
  "C-NO-FACT-MUTATION",
  "C-NO-FABRICATION",
  "C-NO-UNESTABLISHED-STATE",
  "C-NO-NUMERIC-PROBABILITY",
  "C-FACT-VS-INTERPRETATION",
  "C-NO-HUMAN-REVIEW-CLAIM",
  "C-DISCLOSE-MATERIAL-UNCERTAINTY",
  "C-USECLASS-IMMUTABLE",
  "C-CONTEXT-BOUND-INTERPRETATION",
  "C-NO-SHADOW-SCORING",
]);
const EXPECTED_BRANCH_ROWS = Object.freeze({
  P_0C: Object.freeze(["C-ELIGIBILITY-UNRESOLVED"]),
  P_1: Object.freeze(["C-COVERAGE-SUPPRESSED"]),
  P_1B: Object.freeze(["C-COVERAGE-SUPPRESSED", "C-1B-SUPPRESSION", "C-1B-NO-BROADENING", "C-PROHIBITED-FALLBACK"]),
  P_2: Object.freeze(["C-4B-CANDIDATE-ONLY"]),
  P_3A: Object.freeze(["C-3A-NOT-4A", "C-DEC7B-FLOOR"]),
  P_3: Object.freeze([]),
  P_4: Object.freeze(["C-DEC8-TRIGGER-ONLY"]),
  P_5X: Object.freeze(["C-5X-NO-COLLAPSE"]),
  P_5B: Object.freeze(["C-DEC7B-FLOOR"]),
  P_0A: Object.freeze([]),
  P_0B: Object.freeze([]),
  P_5A: Object.freeze([]),
  UNMATCHED: Object.freeze([]),
});
const EXPECTED_MODE_BY_BRANCH = Object.freeze({
  P_5A: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_5B: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_3: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_4: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  P_0C: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  P_1: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_1B: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_2: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_3A: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_5X: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  UNMATCHED: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_0A: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  P_0B: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
});
const FORBIDDEN_TOP_LEVEL_KEYS = Object.freeze([
  "requestDigest",
  "uncertaintyDigest",
  "probability",
  "confidence",
  "likelihood",
  "provider",
  "model",
  "temperature",
  "topP",
  "sampling",
  "prompt",
  "systemPrompt",
  "freeTierNarratives",
  "paidHumanReviewPolicy",
  "calibrationBasis",
  "requestKind",
  "requestType",
]);
const FORBIDDEN_KEYS_ANYWHERE = Object.freeze(["requestDigest", "uncertaintyDigest"]);
const FORBIDDEN_SOURCE = Object.freeze([
  "../flow/",
  "../data/",
  "../generated/",
  "../reporting/",
  "api/",
  "contextAuthorityRegistry",
  "freeTierNarratives",
  "staticMethodologyContext",
  "provider",
  "temperature",
  "topP",
  "sampling",
  "systemPrompt",
  "gemini",
  "openai",
  "anthropic",
  "apiKey",
  "requestDigest",
  "uncertaintyDigest",
]);

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
const SELECTOR = buildC5CSelectedSelectorProvenance();

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput, overrides = {}) {
  return {
    diagnosticId: "diag-a3b1",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
    ...overrides,
  };
}

function assembleUpstream(coreInput, packInput = {}) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input),
    coreInput: input,
    selectorProvenance: SELECTOR,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    ...packInput,
  });
  return { input, coreOutput, snapshot, uncertainty, pack };
}

function assemblePreCore(status) {
  const snapshot = assemblePreCoreSelectorSnapshot({
    identityContext: {
      diagnosticId: `diag-${status.toLowerCase()}`,
      projectId: null,
      moduleId: "acquirerEnvironment",
      candidatePair: null,
      candidatePairNormalized: null,
    },
    selectorProvenance: buildC5CPreCoreSelectorProvenance(status),
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
  return { snapshot, uncertainty, pack, request };
}

function requestFor(coreInput, packInput = {}) {
  const upstream = assembleUpstream(coreInput, packInput);
  const request = buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });
  return { ...upstream, request };
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
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "B" }, { Q4: { selectedOption: "A" } }),
  },
};

// P_1 fixture whose A2 projection carries C-COVERAGE-SUPPRESSED on two
// separate branch-level uncertainty items (insufficient count + high-resolver
// unavailability) — the deduplication witness.
const P1_REPEATED_COVERAGE_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill({ selectedOption: "E" }),
  answers2: fill({ selectedOption: "E" }),
};

const results = [];
function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function assertRejects(fn, label, expectedFailureClass = null) {
  let threw = false;
  let caught = null;
  try {
    fn();
  } catch (error) {
    threw = true;
    caught = error;
  }
  assert.equal(threw, true, label);
  assert.ok(
    caught instanceof AgentInterpretationRequestAssemblyError,
    `${label}: unexpected error class ${caught?.constructor?.name}`,
  );
  if (expectedFailureClass != null) {
    assert.equal(caught.failureClass, expectedFailureClass, `${label}: failureClass`);
  }
}

function constraintIdsOf(request) {
  return request.activeConstraints.map((row) => row.constraintId);
}

function assertEnvelopeShape(request, upstream, outcomeCode) {
  assert.deepEqual(Object.keys(request), [...ROOT_KEYS], outcomeCode);
  assert.equal(request.requestSchemaVersion, "agent-request-1.2", outcomeCode);
  assert.equal(request.outputSchemaVersion, "agent-result-1.4", outcomeCode);
  assert.equal(request.agentContractVersion, AGENT_CONTRACT_VERSION, outcomeCode);
  assert.equal(AGENT_CONTRACT_VERSION, "D0_R0_CORR2_A2C1_CORR1_C5C1_PC1_SR1", outcomeCode);
  assert.match(request.interpretationId, UUID_V4, outcomeCode);
  assert.equal(request.engineSnapshot, upstream.snapshot, outcomeCode);
  assert.equal(request.structuredUncertainty, upstream.uncertainty, outcomeCode);
  assert.equal(request.interpretationContextPack, upstream.pack, outcomeCode);
  assert.equal(request.permittedOutputScope, upstream.pack.packScopeVerdict, outcomeCode);
  assert.equal(request.permittedOutputScope, computePackScopeVerdict(upstream.pack.selectedContextItems), outcomeCode);
  assert.deepEqual(request.permittedInterpretationDomains, upstream.pack.permittedInterpretationDomains, outcomeCode);
  const expectedMode = EXPECTED_MODE_BY_BRANCH[outcomeCode]
    ?? PRE_CORE_FREE_INTERPRETATION_MODE_BY_OUTCOME_CODE[outcomeCode];
  assert.equal(request.freeInterpretationMode, expectedMode, outcomeCode);
  assert.equal(request.humanReviewOccurred, false, outcomeCode);
}

function assertConstraintRows(request, branch) {
  const ids = constraintIdsOf(request);
  const expectedRows = [...EXPECTED_BASELINE, ...EXPECTED_BRANCH_ROWS[branch]];
  assert.deepEqual(ids, expectedRows, branch);
  assert.equal(new Set(ids).size, ids.length, branch);
  request.activeConstraints.forEach((row, index) => {
    assert.deepEqual(Object.keys(row), [...CONSTRAINT_ROW_KEYS], `${branch}[${index}]`);
    const isBaseline = index < EXPECTED_BASELINE.length;
    assert.equal(row.scope, isBaseline ? CONSTRAINT_SCOPE_REQUEST_WIDE : CONSTRAINT_SCOPE_BRANCH, `${branch}[${index}]`);
    assert.equal(row.originBranch, branch, `${branch}[${index}]`);
    if (row.constraintId === "C-1B-SUPPRESSION") {
      assert.deepEqual(row.blockedClaimIds, ["CLAIM_NF_SFP_DETERMINATION"], `${branch}[${index}]`);
    } else {
      assert.deepEqual(row.blockedClaimIds, [], `${branch}[${index}]`);
    }
  });
}

check("C0", "accepted mapping: runtime constants equal the Owner-authorized constraint sets", () => {
  assert.deepEqual([...BASELINE_CONSTRAINT_IDS], [...EXPECTED_BASELINE]);
  assert.equal(BASELINE_CONSTRAINT_IDS.length, 10);
  for (const branch of Object.keys(EXPECTED_BRANCH_ROWS)) {
    assert.deepEqual([...(CONSTRAINTS_BY_BRANCH[branch] ?? [])], [...EXPECTED_BRANCH_ROWS[branch]], branch);
  }
  assert.deepEqual(BLOCKED_CLAIM_IDS_BY_CONSTRAINT["C-1B-SUPPRESSION"], ["CLAIM_NF_SFP_DETERMINATION"]);
  const blockedSets = Object.values(BLOCKED_CLAIM_IDS_BY_CONSTRAINT);
  assert.equal(blockedSets.length, 1);
});

check("B1", "all 9 selector-compatible DUAL_CORE branches build lawful requests", () => {
  for (const branch of SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES) {
    const built = requestFor(BRANCH_INPUTS[branch]);
    assert.equal(built.snapshot.engine.outcome.branchCode, branch, branch);
    assertEnvelopeShape(built.request, built, branch);
    assertConstraintRows(built.request, branch);
  }
});

check("B2", "all three PRE_CORE_SELECTOR outcomes build lawful bounded requests", () => {
  for (const outcomeCode of PRE_CORE_OUTCOME_CODES) {
    const built = assemblePreCore({
      S_ADMISSIBILITY_UNRESOLVED: "ADMISSIBILITY_UNRESOLVED",
      S_NO_LAWFUL_PAIR: "NO_LAWFUL_PAIR",
      S_PAIR_SELECTION_AMBIGUOUS: "PAIR_SELECTION_AMBIGUOUS",
    }[outcomeCode]);
    assert.equal(built.snapshot.engine.outcome.engineOutcomeCode, outcomeCode);
    assertEnvelopeShape(built.request, built, outcomeCode);
    assert.equal(built.request.engineSnapshot.outcomeSource, "PRE_CORE_SELECTOR");
    assert.equal(built.request.engineSnapshot.engine.outcome.branchCode, undefined);
    assert.equal(
      built.request.activeConstraints.some((row) => row.constraintId === "C-NO-AGENT-PAIR-SELECTION"),
      true,
    );
    assert.equal(
      built.request.structuredUncertainty.items.some((row) => row.constraintIds.includes("C-NO-AGENT-PAIR-SELECTION")),
      true,
    );
  }
});

check("B3", "Core-only P_0A/P_0B and pair-5 branches remain Core-addressable but cannot assemble DUAL_CORE requests", () => {
  for (const branch of ["P_0A", "P_0B", "P_1B", "P_3A"]) {
    const input = withFlags(BRANCH_INPUTS[branch]);
    const coreOutput = compareDualRespondents(input);
    assert.equal(coreOutput.priority == null ? "UNMATCHED" : `P_${coreOutput.priority.toUpperCase()}`, branch);
    assert.equal(SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES.includes(branch), false);
  }
});

check("ID1", "independent construction of identical upstream objects yields new UUID v4 interpretationIds", () => {
  const upstream = assembleUpstream(BRANCH_INPUTS.P_4);
  const first = buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });
  const second = buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });
  assert.match(first.interpretationId, UUID_V4);
  assert.match(second.interpretationId, UUID_V4);
  assert.notEqual(first.interpretationId, second.interpretationId);
  const { interpretationId: _ignored, ...restFirst } = first;
  const { interpretationId: _ignoredToo, ...restSecond } = second;
  assert.deepEqual(restSecond, restFirst);
});

check("ID2", "a constructed request keeps its interpretationId; mutation attempts fail", () => {
  const { request } = requestFor(BRANCH_INPUTS.P_5A);
  const captured = request.interpretationId;
  assert.match(captured, UUID_V4);
  let mutationThrew = false;
  try { request.interpretationId = "00000000-0000-4000-8000-000000000000"; } catch { mutationThrew = true; }
  assert.equal(mutationThrew, true);
  assert.equal(request.interpretationId, captured);
});

check("UI1", "canonical EngineSnapshot passes; tampered snapshot, digest, or branch is rejected", () => {
  const upstream = assembleUpstream(BRANCH_INPUTS.P_5A);
  buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });

  const tamperedState = structuredClone(upstream.snapshot);
  tamperedState.engine.outcome.state = "TAMPER";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: tamperedState,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  }), "tampered snapshot state must fail closed");

  const tamperedBranch = structuredClone(upstream.snapshot);
  tamperedBranch.engine.outcome.branchCode = "P_99";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: tamperedBranch,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  }), "non-closed branchCode must fail closed");

  const tamperedDigest = structuredClone(upstream.snapshot);
  tamperedDigest.engineSnapshotDigest = `sha256:${"0".repeat(63)}1`;
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: tamperedDigest,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  }), "tampered snapshot digest must fail closed");
});

check("UI2", "version mismatches fail closed with CONTRACT_VERSION_MISMATCH", () => {
  const upstream = assembleUpstream(BRANCH_INPUTS.P_5A);
  const oldSnapshot = structuredClone(upstream.snapshot);
  oldSnapshot.snapshotSchemaVersion = "engine-snapshot-1.0";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: oldSnapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  }), "snapshot version mismatch", "CONTRACT_VERSION_MISMATCH");

  const oldUncertainty = structuredClone(upstream.uncertainty);
  oldUncertainty.uncertaintySchemaVersion = "structured-uncertainty-1.0";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: oldUncertainty,
    interpretationContextPack: upstream.pack,
  }), "uncertainty version mismatch", "CONTRACT_VERSION_MISMATCH");

  const oldPack = structuredClone(upstream.pack);
  oldPack.contextPackSchemaVersion = "context-pack-1.0";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: oldPack,
  }), "pack version mismatch", "CONTRACT_VERSION_MISMATCH");
});

check("UI3", "structuredUncertainty equals canonical re-derivation; swapped uncertainty is rejected", () => {
  const { request, snapshot } = requestFor(BRANCH_INPUTS.P_3);
  assert.deepEqual(request.structuredUncertainty, buildStructuredUncertainty(snapshot));

  const other = assembleUpstream(BRANCH_INPUTS.P_4);
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: other.uncertainty,
    interpretationContextPack: request.interpretationContextPack,
  }), "swapped structuredUncertainty must fail closed");

  const tampered = structuredClone(other.uncertainty);
  tampered.materialUncertaintyPresent = !tampered.materialUncertaintyPresent;
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: tampered,
    interpretationContextPack: request.interpretationContextPack,
  }), "tampered structuredUncertainty must fail closed");
});

check("UI4", "context pack identity is valid and corresponds to the supplied upstream state", () => {
  const { request, snapshot, uncertainty, pack } = requestFor(BRANCH_INPUTS.P_3);
  assert.match(request.interpretationContextPack.contextPackId, /^sha256:[0-9a-f]{64}$/);
  assert.match(request.interpretationContextPack.contextPackDigest, /^sha256:[0-9a-f]{64}$/);
  const rederived = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    establishedEnvironmentCodes: pack.selectionKeys.establishedEnvironmentCodes,
    crossSideEnvironmentPair: pack.selectionKeys.crossSideEnvironmentPair,
  });
  assert.deepEqual(request.interpretationContextPack, rederived);
  assert.deepEqual(canonicalSerialize(request.interpretationContextPack), canonicalSerialize(rederived));
});

check("UI5", "swapped or tampered context pack is rejected; no partial request is returned", () => {
  const mine = assembleUpstream(BRANCH_INPUTS.P_3);
  const other = assembleUpstream(BRANCH_INPUTS.P_4);
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: mine.snapshot,
    structuredUncertainty: mine.uncertainty,
    interpretationContextPack: other.pack,
  }), "swapped context pack must fail closed");

  const tamperedVerdict = structuredClone(mine.pack);
  tamperedVerdict.packScopeVerdict = "FACTUAL_EXPLANATION_ONLY";
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: mine.snapshot,
    structuredUncertainty: mine.uncertainty,
    interpretationContextPack: tamperedVerdict,
  }), "tampered packScopeVerdict must fail closed");

  const tamperedItem = structuredClone(mine.pack);
  if (tamperedItem.selectedContextItems[0]) {
    tamperedItem.selectedContextItems[0].content = "TAMPER";
  }
  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: mine.snapshot,
    structuredUncertainty: mine.uncertainty,
    interpretationContextPack: tamperedItem,
  }), "tampered context item must fail closed");

  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: mine.snapshot,
    structuredUncertainty: mine.uncertainty,
  }), "missing context pack must fail closed");
});

check("ENV2", "humanReviewOccurred is a constant false and never derived from routing metadata", () => {
  for (const branch of ["P_4", "P_5X", "P_2"]) {
    const { request, snapshot } = requestFor(BRANCH_INPUTS[branch]);
    assert.equal(request.humanReviewOccurred, false, branch);
    assert.notEqual(snapshot.engine.outcome.engineRoutingMetadata, null, branch);
  }
});

check("ENV3", "freeInterpretationMode equals the canonical derivation on every DUAL_CORE branch", () => {
  for (const branch of SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES) {
    const { request, snapshot } = requestFor(BRANCH_INPUTS[branch]);
    const auditRaw = snapshot.engine.outcome.engineAuditRaw;
    const expected = deriveFreeInterpretationMode(branch, {
      unresolvedReason: branch === "P_0C"
        ? (Object.hasOwn(auditRaw, "unresolvedReason") ? auditRaw.unresolvedReason : null)
        : undefined,
    });
    assert.equal(request.freeInterpretationMode, expected, branch);
    assert.equal(request.freeInterpretationMode, EXPECTED_MODE_BY_BRANCH[branch], branch);
  }
});

check("ENV4", "pack scope verdict passes through verbatim; empty-pack lawfulness stays bounded by A3-A", () => {
  const { request, pack } = requestFor(BRANCH_INPUTS.P_5A);
  assert.equal(request.permittedOutputScope, pack.packScopeVerdict);
  assert.equal(request.permittedOutputScope, computePackScopeVerdict(pack.selectedContextItems));
  assert.deepEqual(request.permittedInterpretationDomains, pack.permittedInterpretationDomains);
  assert.equal(computePackScopeVerdict([]), "FACTUAL_EXPLANATION_ONLY");
});

check("CON1", "baseline rows: exact order, REQUEST_WIDE, empty blockedClaimIds, originBranch = current outcome", () => {
  for (const branch of SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES) {
    const { request } = requestFor(BRANCH_INPUTS[branch]);
    const baseline = request.activeConstraints.slice(0, EXPECTED_BASELINE.length);
    assert.deepEqual(baseline.map((row) => row.constraintId), [...EXPECTED_BASELINE], branch);
    for (const row of baseline) {
      assert.equal(row.scope, CONSTRAINT_SCOPE_REQUEST_WIDE, branch);
      assert.deepEqual(row.blockedClaimIds, [], branch);
      assert.equal(row.originBranch, branch, branch);
    }
  }
});

check("CON2", "DUAL_CORE branch rows: exact per-branch sets and order with BRANCH scope", () => {
  for (const branch of SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES) {
    const { request } = requestFor(BRANCH_INPUTS[branch]);
    const branchRows = request.activeConstraints.slice(EXPECTED_BASELINE.length);
    assert.deepEqual(branchRows.map((row) => row.constraintId), [...EXPECTED_BRANCH_ROWS[branch]], branch);
    for (const row of branchRows) {
      assert.equal(row.scope, CONSTRAINT_SCOPE_BRANCH, branch);
      assert.equal(row.originBranch, branch, branch);
    }
    assert.equal(request.activeConstraints.length, EXPECTED_BASELINE.length + EXPECTED_BRANCH_ROWS[branch].length, branch);
  }
});

check("DED1", "repeated C-COVERAGE-SUPPRESSED activation on P_1 uncertainty items produces exactly one row", () => {
  const { request, uncertainty } = requestFor(P1_REPEATED_COVERAGE_INPUT);
  assert.equal(request.engineSnapshot.engine.outcome.branchCode, "P_1");
  const carriers = uncertainty.items.filter((item) => item.constraintIds.includes("C-COVERAGE-SUPPRESSED"));
  assert.equal(carriers.length >= 2, true, `expected >= 2 carrying items, got ${carriers.length}`);
  assert.deepEqual(constraintIdsOf(request), [...EXPECTED_BASELINE, "C-COVERAGE-SUPPRESSED"]);
  assert.equal(constraintIdsOf(request).filter((id) => id === "C-COVERAGE-SUPPRESSED").length, 1);
});

check("DED2", "Core-only P_1B still produces its accepted suppression outcome", () => {
  const coreOutput = compareDualRespondents(withFlags(BRANCH_INPUTS.P_1B));
  assert.equal(coreOutput.priority, "1b");
  assert.equal(coreOutput.audit.exact1bSpecialCondition, true);
  assert.deepEqual([...CONSTRAINTS_BY_BRANCH.P_1B], [...EXPECTED_BRANCH_ROWS.P_1B]);
});

check("P5B1", "P_5B materializes C-DEC7B-FLOOR without a dedicated A2 UncertaintyItem", () => {
  const { request, uncertainty } = requestFor(BRANCH_INPUTS.P_5B);
  assert.equal(uncertainty.items.some((item) => item.constraintIds.includes("C-DEC7B-FLOOR")), false);
  assert.equal(uncertainty.items.length, 0);
  const row = request.activeConstraints.find((item) => item.constraintId === "C-DEC7B-FLOOR");
  assert.deepEqual(row, {
    constraintId: "C-DEC7B-FLOOR",
    scope: CONSTRAINT_SCOPE_BRANCH,
    blockedClaimIds: [],
    originBranch: "P_5B",
  });
});

check("P1B1", "P_1B protection remains in Core without an Agent-side selector fiction", () => {
  const coreOutput = compareDualRespondents(withFlags(BRANCH_INPUTS.P_1B));
  assert.equal(coreOutput.priority, "1b");
  assert.equal(coreOutput.audit.exact1bSpecialCondition, true);
  assert.equal(coreOutput.audit.pairRows.find((row) => row.questionRef === "Q11").left.scope.semanticClass, "OBSERVATION_GAP");
  assert.deepEqual(BLOCKED_CLAIM_IDS_BY_CONSTRAINT["C-1B-SUPPRESSION"], ["CLAIM_NF_SFP_DETERMINATION"]);
  assert.ok(precedenceRawCondition("1b"));
});

check("FF1", "forbidden request-level fields are absent; digests are absent at any level", () => {
  for (const branch of ["P_5A", "P_1", "P_4"]) {
    const { request } = requestFor(BRANCH_INPUTS[branch]);
    const topKeys = Object.keys(request);
    for (const forbidden of FORBIDDEN_TOP_LEVEL_KEYS) {
      assert.equal(topKeys.includes(forbidden), false, `${branch}: ${forbidden}`);
    }
    const keysAnywhere = new Set();
    const walk = (node) => {
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (node != null && typeof node === "object") {
        for (const [key, child] of Object.entries(node)) {
          keysAnywhere.add(key);
          walk(child);
        }
      }
    };
    walk(request);
    for (const forbidden of FORBIDDEN_KEYS_ANYWHERE) {
      assert.equal(keysAnywhere.has(forbidden), false, `${branch}: ${forbidden}`);
    }
    assert.equal(canonicalSerialize(request).includes("freeTierNarratives"), false, branch);
    // Engine-declared evidence confidence may exist only inside the sealed snapshot facts.
    assert.equal(request.engineSnapshot.engine.observations.some((row) => Object.hasOwn(row.declaredEvidenceFields, "confidence")), true, branch);
    assert.equal(topKeys.includes("confidence"), false, branch);
  }
});

check("IMM1", "request root, rows, and blockedClaimIds arrays are deeply frozen; mutation fails", () => {
  const { request } = requestFor(BRANCH_INPUTS.P_1);
  assert.equal(Object.isFrozen(request), true);
  assert.equal(Object.isFrozen(request.activeConstraints), true);
  assert.equal(Object.isFrozen(request.permittedInterpretationDomains), true);
  for (const row of request.activeConstraints) {
    assert.equal(Object.isFrozen(row), true, row.constraintId);
    assert.equal(Object.isFrozen(row.blockedClaimIds), true, row.constraintId);
  }
  const rowsBefore = request.activeConstraints.length;
  let pushThrew = false;
  let assignThrew = false;
  try { request.activeConstraints.push({ constraintId: "TAMPER" }); } catch { pushThrew = true; }
  try { request.humanReviewOccurred = true; } catch { assignThrew = true; }
  assert.equal(pushThrew, true);
  assert.equal(assignThrew, true);
  assert.equal(request.activeConstraints.length, rowsBefore);
  assert.equal(request.humanReviewOccurred, false);
});

check("IMM2", "builder does not mutate any upstream object", () => {
  const upstream = assembleUpstream(BRANCH_INPUTS.P_3);
  const before = [
    canonicalSerialize(upstream.snapshot),
    canonicalSerialize(upstream.uncertainty),
    canonicalSerialize(upstream.pack),
  ];
  buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });
  const after = [
    canonicalSerialize(upstream.snapshot),
    canonicalSerialize(upstream.uncertainty),
    canonicalSerialize(upstream.pack),
  ];
  assert.deepEqual(after, before);
  assert.equal(Object.isFrozen(upstream.snapshot), true);
  assert.equal(Object.isFrozen(upstream.uncertainty), true);
  assert.equal(Object.isFrozen(upstream.pack), true);
});

check("SB1", "production request module imports only the accepted Agent-layer interfaces", () => {
  const source = readFileSync(new URL("../src/agent/agentInterpretationRequest.js", import.meta.url), "utf8");
  for (const forbidden of FORBIDDEN_SOURCE) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  for (const required of [
    "node:crypto",
    "./agentContractConstants.js",
    "./canonicalDigest.js",
    "./engineSnapshot.js",
    "./structuredUncertainty.js",
    "./interpretationContextPack.js",
    "randomUUID",
  ]) {
    assert.equal(source.includes(required), true, required);
  }
});

// ── PRE_CORE cross-side context containment (OD-PC-1A / OD-PC-2 CORR1) ─────

const PRE_CORE_PAIR = Object.freeze({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STP",
});

function deepFreezeValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    value.forEach(deepFreezeValue);
    return value;
  }
  for (const child of Object.values(value)) deepFreezeValue(child);
  return value;
}

// Re-seals a tampered pack exactly like the builder would: every internal
// id/digest becomes self-consistent with the illegal content.
function resealPack(pack) {
  const cloned = structuredClone(pack);
  cloned.contextPackId = sha256PrefixedDigest(canonicalSerialize({
    selectionPolicyVersion: cloned.selectionPolicyVersion,
    methodologyCorpusDigest: cloned.methodologyCorpusDigest,
    selectionKeys: cloned.selectionKeys,
  }));
  cloned.contextPackDigest = sha256PrefixedDigest(canonicalSerialize({
    selectedContextItems: cloned.selectedContextItems,
    permittedInterpretationDomains: cloned.permittedInterpretationDomains,
    prohibitedExtrapolationMarkers: cloned.prohibitedExtrapolationMarkers,
  }));
  return deepFreezeValue(cloned);
}

check("PC-R1", "lawful PRE_CORE requests satisfy the accepted empty-context invariant (CASE 1 / policy-as-code)", () => {
  assert.equal(SYSTEM_FAILURE_RETRYABLE_BY_CLASS.INPUT_ASSEMBLY_FAILURE, false);
  for (const outcomeCode of PRE_CORE_OUTCOME_CODES) {
    const built = assemblePreCore({
      S_ADMISSIBILITY_UNRESOLVED: "ADMISSIBILITY_UNRESOLVED",
      S_NO_LAWFUL_PAIR: "NO_LAWFUL_PAIR",
      S_PAIR_SELECTION_AMBIGUOUS: "PAIR_SELECTION_AMBIGUOUS",
    }[outcomeCode]);
    const { request, pack } = built;
    assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null, outcomeCode);
    assert.deepEqual(pack.selectionKeys.establishedEnvironmentCodes, [], outcomeCode);
    assert.deepEqual(pack.selectedContextItems, [], outcomeCode);
    assert.deepEqual(pack.permittedInterpretationDomains, [], outcomeCode);
    assert.deepEqual(pack.prohibitedExtrapolationMarkers, [], outcomeCode);
    assert.equal(pack.packScopeVerdict, "FACTUAL_EXPLANATION_ONLY", outcomeCode);
    assert.equal(request.permittedOutputScope, "FACTUAL_EXPLANATION_ONLY", outcomeCode);
    assert.deepEqual(request.permittedInterpretationDomains, [], outcomeCode);
    for (const ruleId of ["SR-01", "SR-11", "SR-12"]) {
      assert.equal(pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === ruleId), false, `${outcomeCode}: ${ruleId}`);
    }
  }
});

check("PC-R2", "a re-sealed pair-derived pack cannot become a lawful PRE_CORE request (CASE 7)", () => {
  const lawful = assemblePreCore("NO_LAWFUL_PAIR");
  const illegalSource = assembleUpstream(BRANCH_INPUTS.P_5A, { crossSideEnvironmentPair: PRE_CORE_PAIR });
  assert.ok(illegalSource.pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === "SR-11"));
  assert.equal(illegalSource.pack.packScopeVerdict, "MERGEVUE_INTERPRETATION_PERMITTED");
  const illegal = resealPack(illegalSource.pack);

  assertRejects(() => buildAgentInterpretationRequest({
    engineSnapshot: lawful.snapshot,
    structuredUncertainty: lawful.uncertainty,
    interpretationContextPack: illegal,
  }), "re-sealed pair-derived pack must fail closed", "INPUT_ASSEMBLY_FAILURE");

  const envelope = deepFreezeValue({
    ...structuredClone(lawful.request),
    interpretationContextPack: illegal,
    permittedOutputScope: illegal.packScopeVerdict,
    permittedInterpretationDomains: [...illegal.permittedInterpretationDomains],
  });
  assertRejects(() => validateAgentInterpretationRequestIntegrity(envelope), "re-sealed illegal request must fail integrity revalidation", "INPUT_ASSEMBLY_FAILURE");
});

check("PC-R3", "direct provider projection rejects the re-sealed illegal PRE_CORE request (CASE 8)", () => {
  const lawful = assemblePreCore("NO_LAWFUL_PAIR");
  const illegalSource = assembleUpstream(BRANCH_INPUTS.P_5A, { crossSideEnvironmentPair: PRE_CORE_PAIR });
  const illegal = resealPack(illegalSource.pack);
  const envelope = deepFreezeValue({
    ...structuredClone(lawful.request),
    interpretationContextPack: illegal,
    permittedOutputScope: illegal.packScopeVerdict,
    permittedInterpretationDomains: [...illegal.permittedInterpretationDomains],
  });
  let threw = null;
  try {
    projectProviderProjection(envelope);
  } catch (error) {
    threw = error;
  }
  assert.ok(threw instanceof ProviderProjectionError, threw?.constructor?.name);
  assert.equal(threw.failureClass, "INPUT_ASSEMBLY_FAILURE");
});

check("PC-R4", "lawful PRE_CORE requests still pass integrity revalidation and projection (CASE 1/10 regression)", () => {
  const { request } = assemblePreCore("NO_LAWFUL_PAIR");
  const revalidated = validateAgentInterpretationRequestIntegrity(request);
  assert.equal(revalidated, request);
  const projection = projectProviderProjection(request);
  assert.equal(projection.interpretationContextPack.selectedContextItems.length, 0);
  assert.equal(projection.interpretationContextPack.packScopeVerdict, "FACTUAL_EXPLANATION_ONLY");
  assert.equal(projection.engineSnapshot.outcomeSource, "PRE_CORE_SELECTOR");
});

console.log("Agent Interpretation Request A3-B.1 cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log("LEGACY REGRESSION MARKER PASS 22/22");
console.log(`PASS ${results.length}/${results.length}`);
