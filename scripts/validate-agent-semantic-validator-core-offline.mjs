import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { assembleEngineSnapshot } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { assembleAgentInterpretationResult } from "../src/agent/agentInterpretationResult.js";
import { GEMINI_MODEL_ID, PROVIDER_ID_GEMINI } from "../src/agent/providerExecutionConstants.js";
import { canonicalSerialize } from "../src/agent/canonicalDigest.js";

import {
  AUTHORITY_KINDS,
  JUDGE_INCAPACITY_REASON_CODES,
  JUDGE_REASON_CODES,
  JUDGE_VERDICTS,
  LOCAL_OUTCOMES,
  SEMANTIC_JUDGE_PACKET_VERSION,
  SEMANTIC_JUDGE_PROMPT_VERSION,
  SEMANTIC_TARGET_FAMILIES,
  SEMANTIC_VALIDATOR_VERSION,
  SEMANTIC_VIOLATION_CODES,
} from "../src/agent/semanticValidatorConstants.js";
import {
  SEMANTIC_APPLICABILITY_MATRIX,
  getSemanticSubrule,
  resolveSemanticApplicabilityContext,
} from "../src/agent/semanticApplicability.js";
import {
  evaluateDeterministicChecks,
  locallyEvaluateSemanticSubrule,
} from "../src/agent/semanticLocalEvaluator.js";
import {
  buildSemanticCheckSet,
  computeAuthoritySetDigest,
  computeSemanticCheckId,
  enumerateSemanticTargets,
  linkedObservationQrefs,
  partitionChecks,
} from "../src/agent/semanticCheckEnumerator.js";
import { buildSemanticJudgePackets } from "../src/agent/semanticJudgePacket.js";
import { buildSemanticJudgeVerdictSchema } from "../src/agent/semanticJudgeVerdictSchema.js";
import {
  proveSemanticCompleteness,
  proveSemanticProtocolIntegrity,
} from "../src/agent/semanticCompleteness.js";
import { createMockSemanticJudge, invokeSemanticJudge } from "../src/agent/semanticJudge.js";
import { validateAgentInterpretationSemantics } from "../src/agent/semanticValidator.js";
import {
  SemanticEvaluatorIncapacityError,
  SemanticProtocolError,
  SemanticValidationError,
  SemanticViolationError,
} from "../src/agent/semanticValidationError.js";

// ---------------------------------------------------------------------------
// Canonical upstream fixtures (same construction as the upstream validators)
// ---------------------------------------------------------------------------

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);

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

function requestFor(coreInput) {
  const input = {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: {
      diagnosticId: "diag-j1",
      projectId: null,
      moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
      candidatePair: coreInput.candidatePair ?? "",
    },
    coreInput: input,
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
  return { request, snapshot, uncertainty, pack };
}

const P5A_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill(),
  answers2: fill(),
};

const P1B_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NF/SFP vs NF/SFJ",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
  answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
};

const P3A_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NF/SFP vs NF/SFJ",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
  answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
};

const P4_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: LINE,
  answers1: fill({ selectedOption: "A" }),
  answers2: fill({ selectedOption: "A" }, { Q1: { selectedOption: "B" } }),
};

const P5X_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  coherenceAmbiguous: true,
  answers1: fill(),
  answers2: fill(),
};

const P2_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  outOfPairEvidence: true,
  answers1: fill(),
  answers2: fill(),
};

const P0A_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill(),
  answers2: fill(),
};

// ---------------------------------------------------------------------------
// Lawful result fixtures (offline: hand-built trusted execution metadata)
// ---------------------------------------------------------------------------

function projectionRefs(fixture) {
  const { request } = fixture;
  return {
    qrefA: request.structuredUncertainty.survivingEvidenceRefs[0] ?? null,
    qrefB: request.structuredUncertainty.survivingEvidenceRefs[1] ?? null,
    factref: request.structuredUncertainty.known[0]?.factRef ?? null,
    mref: request.interpretationContextPack.selectedContextItems[0]?.contextRef ?? null,
    uncertaintyId: request.structuredUncertainty.items[0]?.uncertaintyId ?? null,
  };
}

const PLAIN_EVIDENCE_BASIS = Object.freeze({
  supportBasis: "PRIMARY_COMPARABLE",
  conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE",
  materialUnknownsPresent: false,
});

function hypothesisItem(id, statement, refs, mref, extra = {}) {
  return {
    hypothesisId: id,
    statement,
    evidenceBasis: PLAIN_EVIDENCE_BASIS,
    decisiveEvidenceRefs: [refs.qrefA],
    conflictingEvidenceRefs: [],
    contextRefs: mref === null ? [] : [mref],
    requiresEngineFactNotEstablished: [],
    ...extra,
  };
}

function lawfulCandidate(fixture, overrides = {}) {
  const { request } = fixture;
  const refs = projectionRefs(fixture);
  const caseB = request.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  const branch = request.engineSnapshot.engine.outcome.branchCode;
  const candidate = {
    interpretationStatus: branch === "P_1B" || branch === "P_5X"
      ? "INTERPRETATION_CONSTRAINED"
      : "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          hypothesisItem("H1", "One bounded reading of the supplied evidence.", refs, hypothesisMref),
          hypothesisItem("H2", "An alternative reading of the supplied evidence.", refs, hypothesisMref, {
            decisiveEvidenceRefs: refs.qrefB && refs.qrefB !== refs.qrefA ? [refs.qrefB] : [refs.qrefA],
          }),
        ],
      },
      decisiveEvidence: [{ statement: "A decisive observation.", evidenceRefs: [refs.qrefA] }],
      conflictingEvidence: [],
      missingEvidence: refs.uncertaintyId
        ? [{ statement: "An open uncertainty.", uncertaintyIds: [refs.uncertaintyId] }]
        : [],
      changeConditions: refs.uncertaintyId
        ? [{ statement: "What would change the reading.", uncertaintyIds: [refs.uncertaintyId], wouldChange: "STATE_IDENTITY" }]
        : [],
      affectedResources: caseB
        ? [{ label: "Decision authority", contextRefs: [refs.mref] }]
        : [],
      watchpoints: caseB
        ? [{ statement: "A watchpoint.", horizon: "6m", contextRefs: [refs.mref], evidenceRefs: [refs.qrefA] }]
        : [],
    },
    uncertainty: {
      disclosures: refs.uncertaintyId
        ? [{
            uncertaintyId: refs.uncertaintyId,
            affects: "STATE_IDENTITY",
            clientStatement: "The engine did not establish a deterministic state identity.",
            unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
          }]
        : [],
    },
    claims: [
      {
        claimId: "CL-001",
        claimType: "DETERMINISTIC_FACT",
        text: "The engine established the recorded branch outcome.",
        refs: [refs.factref],
        contextRefs: [],
      },
      {
        claimId: "CL-002",
        claimType: "DIRECT_EVIDENCE",
        text: "A respondent supplied a directly observed answer.",
        refs: [refs.qrefA],
        contextRefs: [],
      },
      {
        claimId: "CL-003",
        claimType: "BOUNDED_INTERPRETATION",
        text: "A bounded organizational reading of the supplied evidence.",
        refs: [refs.qrefA],
        contextRefs: boundedContextRefs,
      },
      ...(refs.uncertaintyId
        ? [{
            claimId: "CL-004",
            claimType: "UNCERTAINTY_DISCLOSURE",
            text: "A material uncertainty remains open.",
            refs: [`uref://${refs.uncertaintyId}`],
            contextRefs: [],
          }]
        : []),
      ...(caseB
        ? [{
            claimId: "CL-005",
            claimType: "WATCHPOINT",
            text: "A friction-related watchpoint.",
            refs: [refs.qrefA],
            contextRefs: [refs.mref],
          }]
        : []),
      {
        claimId: "CL-006",
        claimType: "SCOPE_LIMITATION_DISCLOSURE",
        text: "A MergeVue-specific reading was not offered where the methodology domain was absent.",
        refs: [],
        contextRefs: [],
      },
    ],
    clientNarrative: {
      language: "en",
      sections: [
        {
          sectionId: "S-001",
          text: "The assessment established the recorded outcome; a bounded reading follows.",
          derivedFromClaimIds: ["CL-001", "CL-003"],
        },
      ],
    },
  };
  return deepMerge(candidate, overrides);
}

function deepMerge(base, overrides) {
  if (overrides === undefined || overrides === null) return base;
  if (Array.isArray(overrides) || typeof overrides !== "object") return overrides;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    if (value === null || Array.isArray(value) || typeof value !== "object"
      || base?.[key] === null || base?.[key] === undefined
      || Array.isArray(base?.[key]) || typeof base?.[key] !== "object") {
      out[key] = value;
    } else {
      out[key] = deepMerge(base[key], value);
    }
  }
  return out;
}

function deepFreezeValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreezeValue(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreezeValue(child);
  return value;
}

function assembledFixture(coreInput, candidateOverrides = {}) {
  const fixture = requestFor(coreInput);
  const candidate = lawfulCandidate(fixture, candidateOverrides);
  const output = deepFreezeValue({
    candidate: deepFreezeValue(structuredClone(candidate)),
    executionMetadata: deepFreezeValue({
      provider: PROVIDER_ID_GEMINI,
      model: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
    }),
  });
  const result = assembleAgentInterpretationResult({
    agentInterpretationRequest: fixture.request,
    providerExecutionOutput: output,
  });
  return { ...fixture, candidate, result };
}

// Synthetic registry-walk fixture: one instance of every target family with
// recognizable array order, for T-set enumeration only (J1 assumes a
// successful canonical Result; this fixture exercises the walk itself).
function syntheticRichResult(fixture) {
  const refs = projectionRefs(fixture);
  return deepFreezeValue({
    resultSchemaVersion: fixture.request.outputSchemaVersion,
    agentContractVersion: fixture.request.agentContractVersion,
    interpretationId: fixture.request.interpretationId,
    engineFactsRef: {
      diagnosticId: fixture.request.engineSnapshot.identity.diagnosticId,
      engineSnapshotDigest: fixture.request.engineSnapshot.engineSnapshotDigest,
      branchCode: fixture.request.engineSnapshot.engine.outcome.branchCode,
      stateAsserted: fixture.request.engineSnapshot.engine.outcome.state,
    },
    interpretationStatus: "INTERPRETATION_QUALIFIED",
    abstentionReason: null,
    interpretation: {
      transitionPattern: {
        label: "A transition pattern reading.",
        evidenceBasis: PLAIN_EVIDENCE_BASIS,
        evidenceRefs: [refs.qrefA],
        factRefs: [refs.factref],
        contextRefs: [refs.mref],
      },
      frictionMechanism: {
        label: "A friction mechanism reading.",
        evidenceBasis: PLAIN_EVIDENCE_BASIS,
        evidenceRefs: [refs.qrefA],
        contextRefs: [refs.mref],
      },
      hypotheses: {
        ordering: "RANKED",
        items: [
          {
            hypothesisId: "H1",
            rank: 1,
            statement: "First ranked reading.",
            evidenceBasis: PLAIN_EVIDENCE_BASIS,
            decisiveEvidenceRefs: [refs.qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: [refs.mref],
            requiresEngineFactNotEstablished: [],
          },
          {
            hypothesisId: "H2",
            rank: 2,
            statement: "Second ranked reading.",
            evidenceBasis: PLAIN_EVIDENCE_BASIS,
            decisiveEvidenceRefs: [refs.qrefB ?? refs.qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: [refs.mref],
            requiresEngineFactNotEstablished: [],
          },
        ],
      },
      scenarioInterpretation: {
        statement: "A scenario reading.",
        boundToEngineState: null,
        evidenceBasis: PLAIN_EVIDENCE_BASIS,
      },
      decisiveEvidence: [
        { statement: "First decisive row.", evidenceRefs: [refs.qrefA] },
        { statement: "Second decisive row.", evidenceRefs: [refs.qrefB ?? refs.qrefA] },
      ],
      conflictingEvidence: [{ statement: "A conflicting row.", evidenceRefs: [refs.qrefA] }],
      missingEvidence: [{ statement: "A missing-evidence row.", uncertaintyIds: [refs.uncertaintyId] }],
      changeConditions: [{ statement: "A change-condition row.", uncertaintyIds: [refs.uncertaintyId], wouldChange: "STATE_IDENTITY" }],
      affectedResources: [{ label: "First resource.", contextRefs: [refs.mref] }, { label: "Second resource.", contextRefs: [refs.mref] }],
      watchpoints: [{ statement: "First watchpoint.", horizon: "30d", contextRefs: [refs.mref], evidenceRefs: [refs.qrefA] }],
    },
    uncertainty: {
      materialUncertaintyPresent: fixture.request.structuredUncertainty.materialUncertaintyPresent,
      disclosures: [
        {
          uncertaintyId: refs.uncertaintyId,
          affects: "STATE_IDENTITY",
          clientStatement: "First disclosure row.",
          unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
        },
        {
          uncertaintyId: refs.uncertaintyId,
          affects: "DETAIL",
          clientStatement: "Second disclosure row.",
          unresolvedEngineFacts: [],
        },
      ],
      suppressedDeterministicOutputs: fixture.request.structuredUncertainty.withheldOutputs
        .map((row) => ({ withheldItem: row.withheldItem, withheldBy: row.withheldBy })),
    },
    claims: [
      { claimId: "RC-001", claimType: "DETERMINISTIC_FACT", text: "First claim row.", refs: [refs.factref], contextRefs: [] },
      { claimId: "RC-002", claimType: "DIRECT_EVIDENCE", text: "Second claim row.", refs: [refs.qrefA], contextRefs: [] },
    ],
    clientNarrative: {
      language: "en",
      sections: [
        { sectionId: "RS-001", text: "First section row.", derivedFromClaimIds: ["RC-001"] },
        { sectionId: "RS-002", text: "Second section row.", derivedFromClaimIds: ["RC-002"] },
      ],
    },
    provenance: {
      providerIdentity: PROVIDER_ID_GEMINI,
      modelIdentity: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
      contextRefsUsed: [],
    },
  });
}

// Synthetic Case A representation (canonical packs always select context, so
// Case A is representable only synthetically — same precedent as the upstream
// result validator).
function syntheticCaseAFixture(baseFixture) {
  const request = deepFreezeValue((() => {
    const clone = structuredClone(baseFixture.request);
    clone.permittedOutputScope = "FACTUAL_EXPLANATION_ONLY";
    clone.permittedInterpretationDomains = [];
    return clone;
  })());
  const refs = projectionRefs(baseFixture);
  const result = deepFreezeValue({
    resultSchemaVersion: request.outputSchemaVersion,
    agentContractVersion: request.agentContractVersion,
    interpretationId: request.interpretationId,
    engineFactsRef: {
      diagnosticId: request.engineSnapshot.identity.diagnosticId,
      engineSnapshotDigest: request.engineSnapshot.engineSnapshotDigest,
      branchCode: request.engineSnapshot.engine.outcome.branchCode,
      stateAsserted: request.engineSnapshot.engine.outcome.state,
    },
    interpretationStatus: "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          {
            hypothesisId: "H1",
            statement: "One factual reading.",
            evidenceBasis: PLAIN_EVIDENCE_BASIS,
            decisiveEvidenceRefs: [refs.qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: [],
            requiresEngineFactNotEstablished: [],
          },
        ],
      },
      decisiveEvidence: [{ statement: "A decisive observation.", evidenceRefs: [refs.qrefA] }],
      conflictingEvidence: [],
      missingEvidence: [],
      changeConditions: [],
      affectedResources: [],
      watchpoints: [],
    },
    uncertainty: {
      materialUncertaintyPresent: request.structuredUncertainty.materialUncertaintyPresent,
      disclosures: [],
      suppressedDeterministicOutputs: [],
    },
    claims: [
      { claimId: "AC-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
      { claimId: "AC-002", claimType: "DIRECT_EVIDENCE", text: "A respondent supplied a directly observed answer.", refs: [refs.qrefA], contextRefs: [] },
    ],
    clientNarrative: { language: "en", sections: [] },
    provenance: {
      providerIdentity: PROVIDER_ID_GEMINI,
      modelIdentity: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
      contextRefsUsed: [],
    },
  });
  return { request, result };
}

// Synthetic lawful abstention on P_0A: empty target surface, §5.A.1 satisfied
// through the comparator-did-not-run precondition. The disclosureRequired
// uncertainty item still carries its mandatory disclosure identity (V-05).
function syntheticAbstainedEmptyResult(fixture) {
  const disclosureItem = fixture.request.structuredUncertainty.items
    .find((item) => item.disclosureRequired === true);
  return deepFreezeValue({
    resultSchemaVersion: fixture.request.outputSchemaVersion,
    agentContractVersion: fixture.request.agentContractVersion,
    interpretationId: fixture.request.interpretationId,
    engineFactsRef: {
      diagnosticId: fixture.request.engineSnapshot.identity.diagnosticId,
      engineSnapshotDigest: fixture.request.engineSnapshot.engineSnapshotDigest,
      branchCode: "P_0A",
      stateAsserted: null,
    },
    interpretationStatus: "ABSTAINED_INSUFFICIENT_EVIDENCE",
    abstentionReason: "COMPARATOR_DID_NOT_RUN",
    interpretation: {
      hypotheses: { ordering: "CO_EQUAL", items: [] },
      decisiveEvidence: [],
      conflictingEvidence: [],
      missingEvidence: [],
      changeConditions: [],
      affectedResources: [],
      watchpoints: [],
    },
    uncertainty: {
      materialUncertaintyPresent: fixture.request.structuredUncertainty.materialUncertaintyPresent,
      disclosures: disclosureItem === undefined ? [] : [{
        uncertaintyId: disclosureItem.uncertaintyId,
        affects: "STATE_IDENTITY",
        clientStatement: "The comparator did not run, so no engine content exists to interpret.",
        unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
      }],
      suppressedDeterministicOutputs: fixture.request.structuredUncertainty.withheldOutputs
        .map((row) => ({ withheldItem: row.withheldItem, withheldBy: row.withheldBy })),
    },
    claims: [],
    clientNarrative: { language: "en", sections: [] },
    provenance: {
      providerIdentity: PROVIDER_ID_GEMINI,
      modelIdentity: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
      contextRefsUsed: [],
    },
  });
}

// Synthetic empty target surface on P_5A (no disclosureRequired items exist
// there): a mechanically shaped Result with no provider-authored targets at
// all, used to exercise the zero-check C-set path. Canonical branch reality
// always exposes at least one target on an admitted Result, so this fixture is
// necessarily synthetic — it tests J1's own mechanics, not assembly admission.
function syntheticEmptySurfaceResult(fixture) {
  return deepFreezeValue({
    resultSchemaVersion: fixture.request.outputSchemaVersion,
    agentContractVersion: fixture.request.agentContractVersion,
    interpretationId: fixture.request.interpretationId,
    engineFactsRef: {
      diagnosticId: fixture.request.engineSnapshot.identity.diagnosticId,
      engineSnapshotDigest: fixture.request.engineSnapshot.engineSnapshotDigest,
      branchCode: "P_5A",
      stateAsserted: "① CONVERGENT",
    },
    interpretationStatus: "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: { ordering: "CO_EQUAL", items: [] },
      decisiveEvidence: [],
      conflictingEvidence: [],
      missingEvidence: [],
      changeConditions: [],
      affectedResources: [],
      watchpoints: [],
    },
    uncertainty: {
      materialUncertaintyPresent: false,
      disclosures: [],
      suppressedDeterministicOutputs: [],
    },
    claims: [],
    clientNarrative: { language: "en", sections: [] },
    provenance: {
      providerIdentity: PROVIDER_ID_GEMINI,
      modelIdentity: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
      contextRefsUsed: [],
    },
  });
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const results = [];
async function check(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

async function captureRejection(fn) {
  try {
    await fn();
  } catch (error) {
    return error;
  }
  return null;
}

async function assertRejects(fn, expectedClass, label) {
  const caught = await captureRejection(fn);
  assert.ok(
    caught instanceof expectedClass,
    `${label}: expected ${expectedClass.name}, got ${caught?.constructor?.name ?? "no error"}: ${caught?.message ?? ""}`,
  );
  return caught;
}

const ALL_PASS_MOCK = () => createMockSemanticJudge(() => ({ verdict: "PASS" }), { recordCalls: true });

function subruleIds(cSet) {
  return new Set(cSet.map((row) => row.semanticSubruleId));
}

// ---------------------------------------------------------------------------
// Independent expected applicability matrix (audit remediation Finding 4A).
// Declared entirely in this validator — NOT generated from
// semanticApplicability.js or the matrix object under test — for all 22
// accepted semantic subrules: exact target families, exact applicability
// condition, exact canonical failure class. SV14 fails if production drifts
// by even one family, one condition, or one failure class in either
// direction.
// ---------------------------------------------------------------------------

const INDEPENDENT_ALL_FAMILIES = Object.freeze([
  "CLAIM_TEXT",
  "NARRATIVE_SECTION_TEXT",
  "HYPOTHESIS_STATEMENT",
  "TRANSITION_PATTERN_LABEL",
  "FRICTION_MECHANISM_LABEL",
  "SCENARIO_INTERPRETATION_STATEMENT",
  "DECISIVE_EVIDENCE_STATEMENT",
  "CONFLICTING_EVIDENCE_STATEMENT",
  "MISSING_EVIDENCE_STATEMENT",
  "CHANGE_CONDITION_STATEMENT",
  "AFFECTED_RESOURCE_LABEL",
  "WATCHPOINT_STATEMENT",
  "DISCLOSURE_CLIENT_STATEMENT",
]);

const EXPECTED_SEMANTIC_APPLICABILITY = Object.freeze({
  "V-02-SEM-STATE-IN-PROSE": { ruleId: "V-02", condition: ["ALWAYS"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "ENGINE_FACT_MUTATION_DETECTED" },
  "V-04-SEM-GROUNDING": {
    ruleId: "V-04",
    condition: ["ALWAYS"],
    families: Object.freeze([
      "CLAIM_TEXT", "HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL", "FRICTION_MECHANISM_LABEL",
      "SCENARIO_INTERPRETATION_STATEMENT", "DECISIVE_EVIDENCE_STATEMENT", "CONFLICTING_EVIDENCE_STATEMENT",
      "MISSING_EVIDENCE_STATEMENT", "CHANGE_CONDITION_STATEMENT", "AFFECTED_RESOURCE_LABEL",
      "WATCHPOINT_STATEMENT", "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "GROUNDING_VALIDATION_FAILURE",
  },
  "V-04-SEM-CAUSAL-OVERREACH": {
    ruleId: "V-04",
    condition: ["ALWAYS"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL",
      "FRICTION_MECHANISM_LABEL", "SCENARIO_INTERPRETATION_STATEMENT", "DECISIVE_EVIDENCE_STATEMENT",
      "CONFLICTING_EVIDENCE_STATEMENT", "WATCHPOINT_STATEMENT",
    ]),
    failureClass: "GROUNDING_VALIDATION_FAILURE",
  },
  "V-04-SEM-CLAIMTYPE-ALIGNMENT": { ruleId: "V-04", condition: ["ALWAYS"], families: Object.freeze(["CLAIM_TEXT"]), failureClass: "OUTPUT_SCHEMA_VIOLATION" },
  "V-06-SEM-DETERMINATION": { ruleId: "V-06", condition: ["BRANCH_IS:P_1B"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-07-SEM-FALLBACK": { ruleId: "V-07", condition: ["BRANCH_IS:P_1B"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-08-SEM-4A": { ruleId: "V-08", condition: ["BRANCH_IS:P_3A"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-09-SEM-FINAL-4B": { ruleId: "V-09", condition: ["BRANCH_IS:P_2"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-10-SEM-STATE-12": { ruleId: "V-10", condition: ["BRANCH_IS:P_5X"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-12-SEM-HUMAN-REVIEW": { ruleId: "V-12", condition: ["ALWAYS"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-13-SEM-PROBABILITY": { ruleId: "V-13", condition: ["ALWAYS"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-18-SEM-DEC8": {
    ruleId: "V-18",
    condition: ["BRANCH_IS:P_4"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "DECISIVE_EVIDENCE_STATEMENT",
      "CONFLICTING_EVIDENCE_STATEMENT", "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "PROHIBITED_CLAIM_VIOLATION",
  },
  "V-19-SEM-DEC7B": {
    ruleId: "V-19",
    condition: ["CONSTRAINT_ACTIVE:C-DEC7B-FLOOR"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "SCENARIO_INTERPRETATION_STATEMENT",
      "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "PROHIBITED_CLAIM_VIOLATION",
  },
  "V-20-SEM-BROADENING": { ruleId: "V-20", condition: ["BRANCH_IS:P_1B"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-21-SEM-USECLASS": {
    ruleId: "V-21",
    // J1 CORR2: V-21 is applicable only when the target carries at least one
    // deterministically linked Engine observation whose UseClass can be
    // supplied as authority. SV14 fails if V-21 ever becomes unconditional
    // again (no-empty-authority law).
    condition: ["HAS_LINKED_OBSERVATION_USECLASS"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "DECISIVE_EVIDENCE_STATEMENT",
      "CONFLICTING_EVIDENCE_STATEMENT", "MISSING_EVIDENCE_STATEMENT", "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "ENGINE_FACT_MUTATION_DETECTED",
  },
  "V-22-SEM-NARRATIVE-SCOPE": { ruleId: "V-22", condition: ["ALWAYS"], families: Object.freeze(["NARRATIVE_SECTION_TEXT"]), failureClass: "GROUNDING_VALIDATION_FAILURE" },
  "V-23-SEM-CONTEXT-BOUND": {
    ruleId: "V-23",
    condition: ["ALWAYS"],
    conditionsByFamily: Object.freeze({
      CLAIM_TEXT: Object.freeze([
        "SCOPE_IS:MERGEVUE_INTERPRETATION_PERMITTED",
        "CLAIM_TYPE_IN:ALTERNATIVE_HYPOTHESIS|BOUNDED_INTERPRETATION|WATCHPOINT",
      ]),
      NARRATIVE_SECTION_TEXT: Object.freeze(["SCOPE_IS:MERGEVUE_INTERPRETATION_PERMITTED"]),
      HYPOTHESIS_STATEMENT: Object.freeze(["SCOPE_IS:MERGEVUE_INTERPRETATION_PERMITTED"]),
    }),
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL",
      "FRICTION_MECHANISM_LABEL", "AFFECTED_RESOURCE_LABEL", "WATCHPOINT_STATEMENT",
    ]),
    failureClass: "GROUNDING_VALIDATION_FAILURE",
  },
  "V-24-SEM-CASE-A-LEAKAGE": { ruleId: "V-24", condition: ["SCOPE_IS:FACTUAL_EXPLANATION_ONLY"], families: INDEPENDENT_ALL_FAMILIES, failureClass: "PROHIBITED_CLAIM_VIOLATION" },
  "V-28-SEM-SHADOW-SCORING": {
    ruleId: "V-28",
    condition: ["ALWAYS"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL",
      "FRICTION_MECHANISM_LABEL", "SCENARIO_INTERPRETATION_STATEMENT", "DECISIVE_EVIDENCE_STATEMENT",
      "CONFLICTING_EVIDENCE_STATEMENT", "WATCHPOINT_STATEMENT", "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "PROHIBITED_CLAIM_VIOLATION",
  },
  "V-29-SEM-RANK-PROBABILITY": {
    ruleId: "V-29",
    condition: ["HYPOTHESES_PRESENT"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "SCENARIO_INTERPRETATION_STATEMENT",
      "WATCHPOINT_STATEMENT", "DISCLOSURE_CLIENT_STATEMENT",
    ]),
    failureClass: "PROHIBITED_CLAIM_VIOLATION",
  },
  "V-30-SEM-COEQUAL-PREFERENCE": {
    ruleId: "V-30",
    condition: ["ORDERING_IS:CO_EQUAL"],
    families: Object.freeze(["CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT"]),
    failureClass: "OUTPUT_SCHEMA_VIOLATION",
  },
  "V-32-SEM-EXTRAPOLATION": {
    ruleId: "V-32",
    condition: ["MARKER_PRESENT"],
    families: Object.freeze([
      "CLAIM_TEXT", "NARRATIVE_SECTION_TEXT", "HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL",
      "FRICTION_MECHANISM_LABEL", "SCENARIO_INTERPRETATION_STATEMENT", "AFFECTED_RESOURCE_LABEL",
      "WATCHPOINT_STATEMENT",
    ]),
    failureClass: "PROHIBITED_CLAIM_VIOLATION",
  },
});

function conditionDescriptor(condition) {
  switch (condition.type) {
    case "CLAIM_TYPE_IN": return `CLAIM_TYPE_IN:${[...condition.value].sort().join("|")}`;
    case "BRANCH_IS": return `BRANCH_IS:${condition.value}`;
    case "CONSTRAINT_ACTIVE": return `CONSTRAINT_ACTIVE:${condition.value}`;
    case "SCOPE_IS": return `SCOPE_IS:${condition.value}`;
    case "ORDERING_IS": return `ORDERING_IS:${condition.value}`;
    case "HYPOTHESES_PRESENT": return "HYPOTHESES_PRESENT";
    case "MARKER_PRESENT": return "MARKER_PRESENT";
    case "HAS_LINKED_OBSERVATION_USECLASS": return "HAS_LINKED_OBSERVATION_USECLASS";
    default: return `UNKNOWN_CONDITION:${condition.type}`;
  }
}

// ---------------------------------------------------------------------------
// Independent expected C-sets (audit remediation Finding 4B). Explicit
// semanticSubruleId|targetFamily|targetLocator tuples stated in this
// validator for representative physical Results; SV15 detects both missing
// expected checks and unexpected extra checks against production expansion.
// ---------------------------------------------------------------------------

const EXPECTED_C_SETS = Object.freeze({
  // ordinary Case B (P_5A, CO_EQUAL hypotheses) — 100 checks
  "caseB": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text",
    "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text", "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // ordinary Case A — 39 checks
  "caseA": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.AC-001.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.AC-002.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.AC-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.AC-002.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.AC-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.AC-002.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.AC-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.AC-002.text",
    "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.AC-001.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.AC-002.text", "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.AC-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.AC-002.text", "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.AC-002.text",
    "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-24-SEM-CASE-A-LEAKAGE|CLAIM_TEXT|claims.AC-001.text",
    "V-24-SEM-CASE-A-LEAKAGE|CLAIM_TEXT|claims.AC-002.text", "V-24-SEM-CASE-A-LEAKAGE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-24-SEM-CASE-A-LEAKAGE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.AC-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.AC-002.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.AC-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.AC-002.text",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.AC-001.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.AC-002.text",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
  ]),
  // P_1B — 170 checks
  "p1b": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-004.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-004.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement",
    "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-06-SEM-DETERMINATION|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-06-SEM-DETERMINATION|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-001.text", "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-002.text", "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-003.text",
    "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-004.text", "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-005.text", "V-06-SEM-DETERMINATION|CLAIM_TEXT|claims.CL-006.text",
    "V-06-SEM-DETERMINATION|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-06-SEM-DETERMINATION|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-06-SEM-DETERMINATION|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-06-SEM-DETERMINATION|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-06-SEM-DETERMINATION|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-06-SEM-DETERMINATION|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-06-SEM-DETERMINATION|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-07-SEM-FALLBACK|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-07-SEM-FALLBACK|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-001.text", "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-002.text", "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-003.text",
    "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-004.text", "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-005.text", "V-07-SEM-FALLBACK|CLAIM_TEXT|claims.CL-006.text",
    "V-07-SEM-FALLBACK|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-07-SEM-FALLBACK|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-07-SEM-FALLBACK|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-07-SEM-FALLBACK|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-07-SEM-FALLBACK|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-07-SEM-FALLBACK|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-07-SEM-FALLBACK|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-004.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-12-SEM-HUMAN-REVIEW|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-13-SEM-PROBABILITY|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-13-SEM-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-20-SEM-BROADENING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-20-SEM-BROADENING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-001.text", "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-002.text", "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-003.text",
    "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-004.text", "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-005.text", "V-20-SEM-BROADENING|CLAIM_TEXT|claims.CL-006.text",
    "V-20-SEM-BROADENING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-20-SEM-BROADENING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-20-SEM-BROADENING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-20-SEM-BROADENING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-20-SEM-BROADENING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-20-SEM-BROADENING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-20-SEM-BROADENING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-21-SEM-USECLASS|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-21-SEM-USECLASS|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-004.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text",
    "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-28-SEM-SHADOW-SCORING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-004.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // P_3A (active C-DEC7B-FLOOR) — 150 checks
  "p3a": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-004.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-004.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement",
    "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-08-SEM-4A|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-08-SEM-4A|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-08-SEM-4A|CLAIM_TEXT|claims.CL-001.text", "V-08-SEM-4A|CLAIM_TEXT|claims.CL-002.text", "V-08-SEM-4A|CLAIM_TEXT|claims.CL-003.text",
    "V-08-SEM-4A|CLAIM_TEXT|claims.CL-004.text", "V-08-SEM-4A|CLAIM_TEXT|claims.CL-005.text", "V-08-SEM-4A|CLAIM_TEXT|claims.CL-006.text",
    "V-08-SEM-4A|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-08-SEM-4A|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-08-SEM-4A|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-08-SEM-4A|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-08-SEM-4A|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-08-SEM-4A|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-08-SEM-4A|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-004.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-12-SEM-HUMAN-REVIEW|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-13-SEM-PROBABILITY|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-13-SEM-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-001.text", "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-002.text",
    "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-003.text", "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-004.text", "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-005.text",
    "V-19-SEM-DEC7B|CLAIM_TEXT|claims.CL-006.text", "V-19-SEM-DEC7B|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-19-SEM-DEC7B|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-19-SEM-DEC7B|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-19-SEM-DEC7B|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text",
    "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-21-SEM-USECLASS|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-004.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-28-SEM-SHADOW-SCORING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text", "V-29-SEM-RANK-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-004.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // P_2 — 138 checks
  "p2": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-004.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-004.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement",
    "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-09-SEM-FINAL-4B|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-09-SEM-FINAL-4B|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-001.text", "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-002.text", "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-003.text",
    "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-004.text", "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-005.text", "V-09-SEM-FINAL-4B|CLAIM_TEXT|claims.CL-006.text",
    "V-09-SEM-FINAL-4B|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-09-SEM-FINAL-4B|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-09-SEM-FINAL-4B|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-09-SEM-FINAL-4B|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-09-SEM-FINAL-4B|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-09-SEM-FINAL-4B|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-09-SEM-FINAL-4B|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-004.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-12-SEM-HUMAN-REVIEW|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-13-SEM-PROBABILITY|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-13-SEM-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-004.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text",
    "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-28-SEM-SHADOW-SCORING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-004.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // P_4 — 136 checks
  "p4": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-004.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-004.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement",
    "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-004.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-12-SEM-HUMAN-REVIEW|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-13-SEM-PROBABILITY|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-13-SEM-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-001.text", "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-002.text",
    "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-003.text", "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-004.text", "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-005.text",
    "V-18-SEM-DEC8|CLAIM_TEXT|claims.CL-006.text", "V-18-SEM-DEC8|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-18-SEM-DEC8|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-18-SEM-DEC8|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-18-SEM-DEC8|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-18-SEM-DEC8|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text",
    "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-21-SEM-USECLASS|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-004.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-28-SEM-SHADOW-SCORING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-004.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text", "V-29-SEM-RANK-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-004.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // P_5X (active no-collapse path) — 138 checks
  "p5x": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-004.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text", "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-02-SEM-STATE-IN-PROSE|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text",
    "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-004.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-004.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-GROUNDING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement",
    "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-10-SEM-STATE-12|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-10-SEM-STATE-12|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-001.text", "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-002.text", "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-003.text",
    "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-004.text", "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-005.text", "V-10-SEM-STATE-12|CLAIM_TEXT|claims.CL-006.text",
    "V-10-SEM-STATE-12|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-10-SEM-STATE-12|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-10-SEM-STATE-12|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-10-SEM-STATE-12|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-10-SEM-STATE-12|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-10-SEM-STATE-12|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-10-SEM-STATE-12|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-004.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-12-SEM-HUMAN-REVIEW|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-13-SEM-PROBABILITY|CHANGE_CONDITION_STATEMENT|interpretation.changeConditions[0].statement",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-13-SEM-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|MISSING_EVIDENCE_STATEMENT|interpretation.missingEvidence[0].statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-004.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text",
    "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-28-SEM-SHADOW-SCORING|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-004.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|DISCLOSURE_CLIENT_STATEMENT|uncertainty.disclosures[0].clientStatement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-004.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
  ]),
  // RANKED hypotheses — 92 checks
  "ranked": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text",
    "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text", "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
  ]),
  // V-32 marker-present — 110 checks
  "marker": Object.freeze([
    "V-02-SEM-STATE-IN-PROSE|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-001.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-002.text",
    "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-003.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-005.text", "V-02-SEM-STATE-IN-PROSE|CLAIM_TEXT|claims.CL-006.text",
    "V-02-SEM-STATE-IN-PROSE|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-02-SEM-STATE-IN-PROSE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-02-SEM-STATE-IN-PROSE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-02-SEM-STATE-IN-PROSE|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-001.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-003.text", "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-005.text",
    "V-04-SEM-CAUSAL-OVERREACH|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-CAUSAL-OVERREACH|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-04-SEM-CAUSAL-OVERREACH|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-CAUSAL-OVERREACH|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-04-SEM-CAUSAL-OVERREACH|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-CLAIMTYPE-ALIGNMENT|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-001.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-002.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-003.text",
    "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-005.text", "V-04-SEM-GROUNDING|CLAIM_TEXT|claims.CL-006.text", "V-04-SEM-GROUNDING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-04-SEM-GROUNDING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-04-SEM-GROUNDING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-12-SEM-HUMAN-REVIEW|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-001.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-002.text",
    "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-003.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-005.text", "V-12-SEM-HUMAN-REVIEW|CLAIM_TEXT|claims.CL-006.text",
    "V-12-SEM-HUMAN-REVIEW|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-12-SEM-HUMAN-REVIEW|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement",
    "V-12-SEM-HUMAN-REVIEW|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-12-SEM-HUMAN-REVIEW|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-13-SEM-PROBABILITY|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-002.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-003.text",
    "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-13-SEM-PROBABILITY|CLAIM_TEXT|claims.CL-006.text", "V-13-SEM-PROBABILITY|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-13-SEM-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-13-SEM-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-13-SEM-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-002.text",
    "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-003.text", "V-21-SEM-USECLASS|CLAIM_TEXT|claims.CL-005.text", "V-21-SEM-USECLASS|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-21-SEM-USECLASS|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-21-SEM-USECLASS|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-22-SEM-NARRATIVE-SCOPE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label",
    "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-003.text", "V-23-SEM-CONTEXT-BOUND|CLAIM_TEXT|claims.CL-005.text", "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement",
    "V-23-SEM-CONTEXT-BOUND|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-23-SEM-CONTEXT-BOUND|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text", "V-23-SEM-CONTEXT-BOUND|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-001.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-002.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-003.text",
    "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-005.text", "V-28-SEM-SHADOW-SCORING|CLAIM_TEXT|claims.CL-006.text", "V-28-SEM-SHADOW-SCORING|DECISIVE_EVIDENCE_STATEMENT|interpretation.decisiveEvidence[0].statement",
    "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-28-SEM-SHADOW-SCORING|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-28-SEM-SHADOW-SCORING|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-28-SEM-SHADOW-SCORING|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-001.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-002.text",
    "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-003.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-005.text", "V-29-SEM-RANK-PROBABILITY|CLAIM_TEXT|claims.CL-006.text",
    "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-29-SEM-RANK-PROBABILITY|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-29-SEM-RANK-PROBABILITY|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-29-SEM-RANK-PROBABILITY|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-001.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-002.text",
    "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-003.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-005.text", "V-30-SEM-COEQUAL-PREFERENCE|CLAIM_TEXT|claims.CL-006.text",
    "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-30-SEM-COEQUAL-PREFERENCE|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-30-SEM-COEQUAL-PREFERENCE|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-32-SEM-EXTRAPOLATION|AFFECTED_RESOURCE_LABEL|interpretation.affectedResources[0].label", "V-32-SEM-EXTRAPOLATION|CLAIM_TEXT|claims.CL-001.text", "V-32-SEM-EXTRAPOLATION|CLAIM_TEXT|claims.CL-002.text",
    "V-32-SEM-EXTRAPOLATION|CLAIM_TEXT|claims.CL-003.text", "V-32-SEM-EXTRAPOLATION|CLAIM_TEXT|claims.CL-005.text", "V-32-SEM-EXTRAPOLATION|CLAIM_TEXT|claims.CL-006.text",
    "V-32-SEM-EXTRAPOLATION|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H1.statement", "V-32-SEM-EXTRAPOLATION|HYPOTHESIS_STATEMENT|interpretation.hypotheses.items.H2.statement", "V-32-SEM-EXTRAPOLATION|NARRATIVE_SECTION_TEXT|clientNarrative.sections[0].text",
    "V-32-SEM-EXTRAPOLATION|WATCHPOINT_STATEMENT|interpretation.watchpoints[0].statement",
  ]),
});

function assertExactCheckSet(label, request, result, expectedTuples) {
  const { cSet } = buildSemanticCheckSet(request, result);
  const actual = cSet.map((row) => `${row.semanticSubruleId}|${row.targetFamily}|${row.targetLocator}`);
  const expected = [...expectedTuples];
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  assert.equal(expected.length, expectedSet.size, `${label}: independently declared tuples must be unique`);
  assert.equal(actual.length, expected.length, `${label}: total check count`);
  assert.deepEqual(
    actual.filter((tuple) => !expectedSet.has(tuple)),
    [],
    `${label}: unexpected extra checks`,
  );
  assert.deepEqual(
    expected.filter((tuple) => !actualSet.has(tuple)),
    [],
    `${label}: missing expected checks`,
  );
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function main() {
  const p5a = assembledFixture(P5A_INPUT);
  const p1b = assembledFixture(P1B_INPUT);
  const p3a = assembledFixture(P3A_INPUT);
  const p4 = assembledFixture(P4_INPUT);
  const p5x = assembledFixture(P5X_INPUT);
  const p2 = assembledFixture(P2_INPUT);
  const p0a = requestFor(P0A_INPUT);

  // Shared derived fixtures: RANKED-hypotheses variant of P_5A and a
  // marker-present clone of the P_5A request (used by SV2 and SV15).
  const ranked = assembledFixture(P5A_INPUT, {
    interpretation: {
      hypotheses: {
        ordering: "RANKED",
        items: [
          {
            hypothesisId: "H1",
            rank: 1,
            statement: "First ranked reading of the supplied evidence.",
            evidenceBasis: PLAIN_EVIDENCE_BASIS,
            decisiveEvidenceRefs: [projectionRefs(p5a).qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: [projectionRefs(p5a).mref],
            requiresEngineFactNotEstablished: [],
          },
          {
            hypothesisId: "H2",
            rank: 2,
            statement: "Second ranked reading of the supplied evidence.",
            evidenceBasis: PLAIN_EVIDENCE_BASIS,
            decisiveEvidenceRefs: [projectionRefs(p5a).qrefB],
            conflictingEvidenceRefs: [],
            contextRefs: [projectionRefs(p5a).mref],
            requiresEngineFactNotEstablished: [],
          },
        ],
      },
    },
  });
  const markerP5a = deepFreezeValue((() => {
    const clone = structuredClone(p5a.request);
    clone.interpretationContextPack.prohibitedExtrapolationMarkers = [
      { markerId: "DIRECT_FRICTION_CONTEXT_UNAVAILABLE", text: "marker one" },
    ];
    return clone;
  })());

  assert.equal(p5a.request.engineSnapshot.engine.outcome.branchCode, "P_5A");
  assert.equal(p1b.request.engineSnapshot.engine.outcome.branchCode, "P_1B");
  assert.equal(p3a.request.engineSnapshot.engine.outcome.branchCode, "P_3A");
  assert.equal(p4.request.engineSnapshot.engine.outcome.branchCode, "P_4");
  assert.equal(p5x.request.engineSnapshot.engine.outcome.branchCode, "P_5X");
  assert.equal(p2.request.engineSnapshot.engine.outcome.branchCode, "P_2");
  assert.equal(p0a.request.engineSnapshot.engine.outcome.branchCode, "P_0A");
  for (const fixture of [p5a, p1b, p3a, p4, p5x, p2]) {
    assert.equal(fixture.request.permittedOutputScope, "MERGEVUE_INTERPRETATION_PERMITTED");
  }

  // --- SV0: constants and matrix closure -----------------------------------

  await check("SV0", "exact J1 version identities and closed frozen vocabularies", () => {
    assert.equal(SEMANTIC_VALIDATOR_VERSION, "semantic-validator-1.0");
    assert.equal(SEMANTIC_JUDGE_PROMPT_VERSION, "semantic-judge-prompt-1.0");
    assert.equal(SEMANTIC_JUDGE_PACKET_VERSION, "semantic-judge-packet-1.0");
    assert.deepEqual([...LOCAL_OUTCOMES], ["PASS", "FAIL", "REQUIRES_SEMANTIC_JUDGMENT"]);
    assert.deepEqual([...JUDGE_VERDICTS], ["PASS", "FAIL", "UNABLE_TO_EVALUATE"]);
    assert.deepEqual([...JUDGE_REASON_CODES], [
      "RULE_SATISFIED",
      "RULE_VIOLATED",
      "AUTHORITY_ABSENT",
      "TARGET_AMBIGUOUS",
      "PACKET_INSUFFICIENT",
      "JUDGE_REFUSAL",
    ]);
    assert.deepEqual([...JUDGE_INCAPACITY_REASON_CODES], [
      "AUTHORITY_ABSENT",
      "TARGET_AMBIGUOUS",
      "PACKET_INSUFFICIENT",
      "JUDGE_REFUSAL",
    ]);
    assert.deepEqual([...SEMANTIC_VIOLATION_CODES], [
      "OUTPUT_SCHEMA_VIOLATION",
      "GROUNDING_VALIDATION_FAILURE",
      "PROHIBITED_CLAIM_VIOLATION",
      "ENGINE_FACT_MUTATION_DETECTED",
    ]);
    assert.deepEqual([...SEMANTIC_TARGET_FAMILIES], [
      "CLAIM_TEXT",
      "NARRATIVE_SECTION_TEXT",
      "HYPOTHESIS_STATEMENT",
      "TRANSITION_PATTERN_LABEL",
      "FRICTION_MECHANISM_LABEL",
      "SCENARIO_INTERPRETATION_STATEMENT",
      "DECISIVE_EVIDENCE_STATEMENT",
      "CONFLICTING_EVIDENCE_STATEMENT",
      "MISSING_EVIDENCE_STATEMENT",
      "CHANGE_CONDITION_STATEMENT",
      "AFFECTED_RESOURCE_LABEL",
      "WATCHPOINT_STATEMENT",
      "DISCLOSURE_CLIENT_STATEMENT",
    ]);
    assert.deepEqual([...AUTHORITY_KINDS], [
      "ENGINE_FACT",
      "UNCERTAINTY_ITEM",
      "CONTEXT_ITEM",
      "SUPPRESSION_FACT",
      "BLOCKED_CLAIM",
      "CONSTRAINT",
      "PACK_SCOPE",
      "BRANCH",
      "INTERPRETATION_STATUS",
      "HYPOTHESIS_ORDERING",
      "CLAIM_TYPE",
      "EVIDENCE_BASIS",
      "HORIZON",
      "WOULD_CHANGE",
      "AFFECTS",
      "EXTRAPOLATION_MARKER",
    ]);

    // Matrix is frozen, version-bound, and carries exactly the 22 accepted
    // semantic sub-rules in canonical order.
    assert.equal(SEMANTIC_APPLICABILITY_MATRIX.semanticValidatorVersion, SEMANTIC_VALIDATOR_VERSION);
    assert.equal(Object.isFrozen(SEMANTIC_APPLICABILITY_MATRIX), true);
    assert.equal(Object.isFrozen(SEMANTIC_APPLICABILITY_MATRIX.rows), true);
    const subruleIdsInOrder = SEMANTIC_APPLICABILITY_MATRIX.rows.map((row) => row.semanticSubruleId);
    assert.deepEqual(subruleIdsInOrder, [
      "V-02-SEM-STATE-IN-PROSE",
      "V-04-SEM-GROUNDING",
      "V-04-SEM-CAUSAL-OVERREACH",
      "V-04-SEM-CLAIMTYPE-ALIGNMENT",
      "V-06-SEM-DETERMINATION",
      "V-07-SEM-FALLBACK",
      "V-08-SEM-4A",
      "V-09-SEM-FINAL-4B",
      "V-10-SEM-STATE-12",
      "V-12-SEM-HUMAN-REVIEW",
      "V-13-SEM-PROBABILITY",
      "V-18-SEM-DEC8",
      "V-19-SEM-DEC7B",
      "V-20-SEM-BROADENING",
      "V-21-SEM-USECLASS",
      "V-22-SEM-NARRATIVE-SCOPE",
      "V-23-SEM-CONTEXT-BOUND",
      "V-24-SEM-CASE-A-LEAKAGE",
      "V-28-SEM-SHADOW-SCORING",
      "V-29-SEM-RANK-PROBABILITY",
      "V-30-SEM-COEQUAL-PREFERENCE",
      "V-32-SEM-EXTRAPOLATION",
    ]);
    SEMANTIC_APPLICABILITY_MATRIX.rows.forEach((row, index) => {
      assert.equal(row.ordinal, index + 1);
      assert.equal(Object.isFrozen(row), true);
      assert.equal(Object.isFrozen(row.targetFamilies), true);
      assert.equal(Object.isFrozen(row.expectedInvariant), true);
      assert.ok(row.expectedInvariant.length > 0);
      assert.ok(row.allowedSemanticInterpretations.length > 0);
      assert.ok(row.forbiddenSemanticImplications.length > 0);
      assert.ok(SEMANTIC_VIOLATION_CODES.includes(row.failureViolationCode));
      for (const family of row.targetFamilies) {
        assert.ok(SEMANTIC_TARGET_FAMILIES.includes(family), `${row.semanticSubruleId}: ${family}`);
      }
    });
    // Every row's family list preserves canonical family order.
    const familyRank = new Map(SEMANTIC_TARGET_FAMILIES.map((name, index) => [name, index]));
    for (const row of SEMANTIC_APPLICABILITY_MATRIX.rows) {
      const ranks = row.targetFamilies.map((name) => familyRank.get(name));
      const sorted = [...ranks].sort((left, right) => left - right);
      assert.deepEqual(ranks, sorted, `${row.semanticSubruleId} family order`);
    }
  });

  // --- SV1: target registry --------------------------------------------------

  await check("SV1", "13-family target registry walks completely, in family and array order", () => {
    const rich = syntheticRichResult(p1b);
    const tSet = enumerateSemanticTargets(p1b.request, rich);
    assert.deepEqual(tSet.map((target) => [target.targetFamily, target.targetLocator]), [
      ["CLAIM_TEXT", "claims.RC-001.text"],
      ["CLAIM_TEXT", "claims.RC-002.text"],
      ["NARRATIVE_SECTION_TEXT", "clientNarrative.sections[0].text"],
      ["NARRATIVE_SECTION_TEXT", "clientNarrative.sections[1].text"],
      ["HYPOTHESIS_STATEMENT", "interpretation.hypotheses.items.H1.statement"],
      ["HYPOTHESIS_STATEMENT", "interpretation.hypotheses.items.H2.statement"],
      ["TRANSITION_PATTERN_LABEL", "interpretation.transitionPattern.label"],
      ["FRICTION_MECHANISM_LABEL", "interpretation.frictionMechanism.label"],
      ["SCENARIO_INTERPRETATION_STATEMENT", "interpretation.scenarioInterpretation.statement"],
      ["DECISIVE_EVIDENCE_STATEMENT", "interpretation.decisiveEvidence[0].statement"],
      ["DECISIVE_EVIDENCE_STATEMENT", "interpretation.decisiveEvidence[1].statement"],
      ["CONFLICTING_EVIDENCE_STATEMENT", "interpretation.conflictingEvidence[0].statement"],
      ["MISSING_EVIDENCE_STATEMENT", "interpretation.missingEvidence[0].statement"],
      ["CHANGE_CONDITION_STATEMENT", "interpretation.changeConditions[0].statement"],
      ["AFFECTED_RESOURCE_LABEL", "interpretation.affectedResources[0].label"],
      ["AFFECTED_RESOURCE_LABEL", "interpretation.affectedResources[1].label"],
      ["WATCHPOINT_STATEMENT", "interpretation.watchpoints[0].statement"],
      ["DISCLOSURE_CLIENT_STATEMENT", "uncertainty.disclosures[0].clientStatement"],
      ["DISCLOSURE_CLIENT_STATEMENT", "uncertainty.disclosures[1].clientStatement"],
    ]);
    assert.deepEqual(tSet.map((target) => target.text), [
      "First claim row.",
      "Second claim row.",
      "First section row.",
      "Second section row.",
      "First ranked reading.",
      "Second ranked reading.",
      "A transition pattern reading.",
      "A friction mechanism reading.",
      "A scenario reading.",
      "First decisive row.",
      "Second decisive row.",
      "A conflicting row.",
      "A missing-evidence row.",
      "A change-condition row.",
      "First resource.",
      "Second resource.",
      "First watchpoint.",
      "First disclosure row.",
      "Second disclosure row.",
    ]);
    // Target digests hash the exact text.
    const firstClaim = tSet[0];
    assert.equal(firstClaim.targetDigest, computeSemanticCheckId(firstClaim.text));
    // Metadata is family-specific.
    assert.deepEqual(tSet[0].metadata, {
      claimId: "RC-001",
      claimType: "DETERMINISTIC_FACT",
      refs: [projectionRefs(p1b).factref],
      contextRefs: [],
    });
    assert.deepEqual(tSet[2].metadata, { sectionId: "RS-001", derivedFromClaimIds: ["RC-001"] });
    assert.equal(tSet[4].metadata.ordering, "RANKED");
    assert.equal(tSet[4].metadata.rank, 1);
    assert.deepEqual(tSet[12].metadata.uncertaintyIds, [projectionRefs(p1b).uncertaintyId]);
    assert.deepEqual(tSet[13].metadata.wouldChange, "STATE_IDENTITY");
    assert.equal(tSet[16].metadata.horizon, "30d");
    assert.deepEqual(tSet[17].metadata.unresolvedEngineFacts, ["CLAIM_ENGINE_STATE_IDENTITY"]);

    // Absent optional singletons do not enumerate; assembly-admitted P_5A
    // result carries no transition/friction/scenario sections.
    const tSet5a = enumerateSemanticTargets(p5a.request, p5a.result);
    const families5a = new Set(tSet5a.map((target) => target.targetFamily));
    for (const absent of ["TRANSITION_PATTERN_LABEL", "FRICTION_MECHANISM_LABEL", "SCENARIO_INTERPRETATION_STATEMENT"]) {
      assert.equal(families5a.has(absent), false, absent);
    }
    // Array order stays stable: claims enumerate in frozen claims[] order
    // (P_5A carries no uncertainty items, so no UNCERTAINTY_DISCLOSURE claim).
    assert.deepEqual(
      tSet5a.filter((target) => target.targetFamily === "CLAIM_TEXT").map((target) => target.metadata.claimId),
      ["CL-001", "CL-002", "CL-003", "CL-005", "CL-006"],
    );
  });

  // --- SV2: applicability matrix ----------------------------------------------

  await check("SV2", "applicability switches on branch, scope, ordering, constraints, markers", () => {
    const expand = (fixture, result = fixture.result) => subruleIds(buildSemanticCheckSet(fixture.request, result).cSet);

    const present5a = expand(p5a);
    for (const unconditional of [
      "V-02-SEM-STATE-IN-PROSE",
      "V-04-SEM-GROUNDING",
      "V-04-SEM-CAUSAL-OVERREACH",
      "V-04-SEM-CLAIMTYPE-ALIGNMENT",
      "V-12-SEM-HUMAN-REVIEW",
      "V-13-SEM-PROBABILITY",
      "V-21-SEM-USECLASS",
      "V-22-SEM-NARRATIVE-SCOPE",
      "V-23-SEM-CONTEXT-BOUND",
      "V-28-SEM-SHADOW-SCORING",
      "V-29-SEM-RANK-PROBABILITY",
      "V-30-SEM-COEQUAL-PREFERENCE",
    ]) {
      assert.equal(present5a.has(unconditional), true, `P_5A: ${unconditional}`);
    }
    for (const inactive of [
      "V-06-SEM-DETERMINATION",
      "V-07-SEM-FALLBACK",
      "V-08-SEM-4A",
      "V-09-SEM-FINAL-4B",
      "V-10-SEM-STATE-12",
      "V-18-SEM-DEC8",
      "V-19-SEM-DEC7B",
      "V-20-SEM-BROADENING",
      "V-24-SEM-CASE-A-LEAKAGE",
      "V-32-SEM-EXTRAPOLATION",
    ]) {
      assert.equal(present5a.has(inactive), false, `P_5A: ${inactive}`);
    }

    // Branch-dependent rows appear only on their branch.
    assert.equal(expand(p1b).has("V-06-SEM-DETERMINATION"), true);
    assert.equal(expand(p1b).has("V-07-SEM-FALLBACK"), true);
    assert.equal(expand(p1b).has("V-20-SEM-BROADENING"), true);
    assert.equal(expand(p1b).has("V-08-SEM-4A"), false);
    assert.equal(expand(p3a).has("V-08-SEM-4A"), true);
    assert.equal(expand(p3a).has("V-19-SEM-DEC7B"), true, "C-DEC7B-FLOOR is active on P_3A");
    assert.equal(expand(p4).has("V-18-SEM-DEC8"), true);
    assert.equal(expand(p5x).has("V-10-SEM-STATE-12"), true);
    assert.equal(expand(p2).has("V-09-SEM-FINAL-4B"), true);
    assert.equal(expand(p5a).has("V-19-SEM-DEC7B"), false, "P_5A does not activate C-DEC7B-FLOOR");
    assert.equal(expand(p1b).has("V-18-SEM-DEC8"), false);

    // Case A / Case B switching.
    const caseA = syntheticCaseAFixture(p5a);
    const presentCaseA = subruleIds(buildSemanticCheckSet(caseA.request, caseA.result).cSet);
    assert.equal(presentCaseA.has("V-24-SEM-CASE-A-LEAKAGE"), true);
    assert.equal(presentCaseA.has("V-23-SEM-CONTEXT-BOUND"), false, "no V-23 families qualify under Case A here");

    // V-23 CLAIM_TEXT applies only to Case B claimTypes under Case B scope.
    const v23ClaimLocators = buildSemanticCheckSet(p5a.request, p5a.result).cSet
      .filter((row) => row.semanticSubruleId === "V-23-SEM-CONTEXT-BOUND" && row.targetFamily === "CLAIM_TEXT")
      .map((row) => row.targetLocator);
    assert.deepEqual(v23ClaimLocators.sort(), [
      "claims.CL-003.text",
      "claims.CL-005.text",
    ]);

    // Hypothesis-ordering row: CO_EQUAL activates V-30; RANKED does not.
    assert.equal(subruleIds(buildSemanticCheckSet(ranked.request, ranked.result).cSet).has("V-30-SEM-COEQUAL-PREFERENCE"), false);
    assert.equal(subruleIds(buildSemanticCheckSet(p5a.request, p5a.result).cSet).has("V-30-SEM-COEQUAL-PREFERENCE"), true);

    // V-29 requires at least one hypothesis: the abstained surface carries a
    // disclosure target but no hypotheses, so V-29 stays inactive while
    // unconditional rows (V-02) do apply to that target.
    const abstained = syntheticAbstainedEmptyResult(p0a);
    const abstainedIds = subruleIds(buildSemanticCheckSet(p0a.request, abstained).cSet);
    assert.equal(abstainedIds.has("V-29-SEM-RANK-PROBABILITY"), false);
    assert.equal(abstainedIds.has("V-02-SEM-STATE-IN-PROSE"), true);
    const emptySurface = syntheticEmptySurfaceResult(p5a);
    assert.equal(buildSemanticCheckSet(p5a.request, emptySurface).cSet.length, 0);

    // An inactive semantic rule never creates a check (V-32 needs a marker).
    const withMarker = buildSemanticCheckSet(markerP5a, p5a.result);
    assert.equal(subruleIds(withMarker.cSet).has("V-32-SEM-EXTRAPOLATION"), true);
    const markerCheck = withMarker.cSet.find((row) => row.semanticSubruleId === "V-32-SEM-EXTRAPOLATION");
    assert.deepEqual(markerCheck.authorityIds, ["EXTRAPOLATION_MARKER:DIRECT_FRICTION_CONTEXT_UNAVAILABLE"]);

    // Applicability context resolves sorted active constraints per branch and
    // requires the injected shared V-21 linked-observation resolver (J1 CORR2).
    const context1b = resolveSemanticApplicabilityContext(
      p1b.request,
      p1b.result,
      (target) => linkedObservationQrefs(p1b.request, p1b.result, target),
    );
    assert.deepEqual([...context1b.activeConstraintIds], [...context1b.activeConstraintIds].sort());
    assert.equal(context1b.activeConstraintIds.includes("C-1B-SUPPRESSION"), true);
    assert.equal(context1b.activeConstraintIds.includes("C-NO-NUMERIC-PROBABILITY"), true);
  });

  // --- SV3: local three-way law ------------------------------------------------

  await check("SV3", "deterministic PASS/FAIL only for conclusive rules; clean prose always requires judgment", () => {
    // Deterministic PASS on complete structured invariants.
    const d5a = evaluateDeterministicChecks(p5a.request, p5a.result);
    assert.deepEqual(d5a.map((row) => [row.dCheckId, row.outcome]), [
      ["V-05-DISCLOSURE-IDENTITY", "PASS"],
      ["V-17-ABSTENTION-PRECONDITIONS", "PASS"],
    ]);
    const d0a = evaluateDeterministicChecks(p0a.request, syntheticAbstainedEmptyResult(p0a));
    assert.deepEqual(d0a.map((row) => row.outcome), ["PASS", "PASS"]);

    // Deterministic FAIL: a disclosureRequired item loses its disclosure.
    const missingDisclosure = deepFreezeValue((() => {
      const clone = structuredClone(p1b.result);
      clone.uncertainty.disclosures = [];
      return clone;
    })());
    const dMissing = evaluateDeterministicChecks(p1b.request, missingDisclosure);
    assert.equal(dMissing[0].outcome, "FAIL");
    assert.equal(dMissing[0].violationCode, "OUTPUT_SCHEMA_VIOLATION");

    // Deterministic FAIL: abstention without any §5.A.1 precondition.
    const unlawfulAbstention = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.interpretationStatus = "ABSTAINED_INSUFFICIENT_EVIDENCE";
      clone.abstentionReason = "NO_SURVIVING_ADMISSIBLE_EVIDENCE";
      return clone;
    })());
    const dAbstain = evaluateDeterministicChecks(p5a.request, unlawfulAbstention);
    assert.equal(dAbstain[1].outcome, "FAIL");
    assert.equal(dAbstain[1].violationCode, "OUTPUT_SCHEMA_VIOLATION");

    // V-13/V-29 probability wording is judge-only: never local FAIL or PASS.
    const numericTarget = { text: "This pattern has a 72% probability of recurring." };
    const numericRow = getSemanticSubrule("V-13-SEM-PROBABILITY");
    const numericLocal = locallyEvaluateSemanticSubrule(numericRow, numericTarget);
    assert.equal(numericLocal.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    assert.equal(numericLocal.violationCode, null);
    const numericRow29 = getSemanticSubrule("V-29-SEM-RANK-PROBABILITY");
    const numericLocal29 = locallyEvaluateSemanticSubrule(numericRow29, numericTarget);
    assert.equal(numericLocal29.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    assert.equal(numericLocal29.violationCode, null);

    // Clean-looking prose never produces a local PASS: every applicable
    // semantic row on lawful fixtures routes to the judge.
    for (const fixture of [p5a, p1b, p3a, p4, p5x, p2]) {
      const { cSet, localFails } = buildSemanticCheckSet(fixture.request, fixture.result);
      assert.equal(localFails.length, 0);
      assert.ok(cSet.length > 0);
      for (const row of SEMANTIC_APPLICABILITY_MATRIX.rows) {
        const sample = cSet.find((check) => check.semanticSubruleId === row.semanticSubruleId);
        if (sample === undefined) continue;
        const again = locallyEvaluateSemanticSubrule(row, sample.target);
        assert.equal(again.outcome, "REQUIRES_SEMANTIC_JUDGMENT", row.semanticSubruleId);
      }
    }
  });

  await check("SV3b", "V-13/V-29 are judge-only: local judgment, mocked FAIL still enforces, PASS and UNABLE remain lawful", async () => {
    const v13 = getSemanticSubrule("V-13-SEM-PROBABILITY");
    const v29 = getSemanticSubrule("V-29-SEM-RANK-PROBABILITY");
    const localOf = (row, text) => locallyEvaluateSemanticSubrule(row, { text });
    const assertLocalJudgment = (row, text, label) => {
      const local = localOf(row, text);
      assert.equal(local.outcome, "REQUIRES_SEMANTIC_JUDGMENT", `${label}: ${text}`);
      assert.equal(local.violationCode, null, `${label} violationCode: ${text}`);
      assert.notEqual(local.outcome, "PASS", `${label} never PASS: ${text}`);
      assert.notEqual(local.outcome, "FAIL", `${label} never FAIL: ${text}`);
    };

    const judgeOnlyTexts = [
      "72% probability",
      "81% confidence",
      "0.73 likelihood",
      "50% chance",
      "3:1 odds",
      "Rank 1 carries 72% probability",
      "rank 1 means most likely",
      "60% of respondents provided direct observations",
      "81% confidence ratings were recorded",
      "3 confidence ratings were recorded",
      "72% probability fields were populated",
      "0.73 likelihood fields were present in the schema",
      "The source field contained \"81% confidence\"",
      "Completion reached 82%",
      "By Day 60, review the integration checkpoint",
    ];
    for (const text of judgeOnlyTexts) {
      assertLocalJudgment(v13, text, "V-13");
      assertLocalJudgment(v29, text, "V-29");
    }

    // V-13 end-to-end: prohibited prose routes locally to judgment, enters
    // the C-set, and an identity-valid mocked FAIL remains a semantic violation.
    const v13Result = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[0].text = "72% probability";
      return clone;
    })());
    const v13Expansion = buildSemanticCheckSet(p5a.request, v13Result);
    assert.equal(v13Expansion.localFails.length, 0, "V-13 prohibited prose is not a local FAIL");
    const v13Check = v13Expansion.cSet.find((row) => (
      row.semanticSubruleId === "V-13-SEM-PROBABILITY"
      && row.targetLocator === "claims.CL-001.text"
    ));
    assert.ok(v13Check !== undefined, "V-13 check remains in the C-set");
    assert.equal(v13Check.target.text, "72% probability");
    assert.equal(locallyEvaluateSemanticSubrule(v13, v13Check.target).outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    const v13Submitted = [];
    const v13FailJudge = createMockSemanticJudge((check) => {
      v13Submitted.push(`${check.semanticSubruleId}|${check.targetLocator}`);
      if (check.semanticSubruleId === "V-13-SEM-PROBABILITY" && check.targetLocator === "claims.CL-001.text") {
        return { verdict: "FAIL" };
      }
      return { verdict: "PASS" };
    });
    const v13Violation = await assertRejects(
      () => validateAgentInterpretationSemantics({
        agentInterpretationRequest: p5a.request,
        agentInterpretationResult: v13Result,
        semanticJudge: v13FailJudge,
        maxChecksPerBatch: 100,
      }),
      SemanticViolationError,
      "V-13 identity-valid mocked FAIL",
    );
    assert.equal(v13Violation.violationCode, "PROHIBITED_CLAIM_VIOLATION");
    assert.ok(v13Submitted.includes("V-13-SEM-PROBABILITY|claims.CL-001.text"), "judge received the V-13 check");
    assert.ok(v13Violation.findings.some((finding) => (
      finding.semanticSubruleId === "V-13-SEM-PROBABILITY"
      && finding.targetLocator === "claims.CL-001.text"
    )));

    // V-29 end-to-end: ranked hypothesis probability framing is judge-enforced.
    const v29Result = deepFreezeValue((() => {
      const clone = structuredClone(ranked.result);
      clone.interpretation.hypotheses.items[0].statement = "Rank 1 carries 72% probability";
      return clone;
    })());
    const v29Expansion = buildSemanticCheckSet(ranked.request, v29Result);
    assert.equal(v29Expansion.localFails.length, 0, "V-29 prohibited prose is not a local FAIL");
    const v29Check = v29Expansion.cSet.find((row) => (
      row.semanticSubruleId === "V-29-SEM-RANK-PROBABILITY"
      && row.targetLocator === "interpretation.hypotheses.items.H1.statement"
    ));
    assert.ok(v29Check !== undefined, "V-29 check remains in the C-set");
    assert.equal(locallyEvaluateSemanticSubrule(v29, v29Check.target).outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    const v29Submitted = [];
    const v29FailJudge = createMockSemanticJudge((check) => {
      v29Submitted.push(`${check.semanticSubruleId}|${check.targetLocator}`);
      if (check.semanticSubruleId === "V-29-SEM-RANK-PROBABILITY" && check.targetLocator === "interpretation.hypotheses.items.H1.statement") {
        return { verdict: "FAIL" };
      }
      return { verdict: "PASS" };
    });
    const v29Violation = await assertRejects(
      () => validateAgentInterpretationSemantics({
        agentInterpretationRequest: ranked.request,
        agentInterpretationResult: v29Result,
        semanticJudge: v29FailJudge,
        maxChecksPerBatch: 100,
      }),
      SemanticViolationError,
      "V-29 identity-valid mocked FAIL",
    );
    assert.equal(v29Violation.violationCode, "PROHIBITED_CLAIM_VIOLATION");
    assert.ok(v29Submitted.includes("V-29-SEM-RANK-PROBABILITY|interpretation.hypotheses.items.H1.statement"), "judge received the V-29 check");
    assert.ok(v29Violation.findings.some((finding) => (
      finding.semanticSubruleId === "V-29-SEM-RANK-PROBABILITY"
      && finding.targetLocator === "interpretation.hypotheses.items.H1.statement"
    )));

    // Lawful/ambiguous V-13 target: local judgment + mock PASS returns the same Result.
    const lawfulResult = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[0].text = "60% of respondents provided direct observations";
      return clone;
    })());
    const lawfulExpansion = buildSemanticCheckSet(p5a.request, lawfulResult);
    assert.equal(lawfulExpansion.localFails.length, 0);
    const lawfulV13 = lawfulExpansion.cSet.find((row) => (
      row.semanticSubruleId === "V-13-SEM-PROBABILITY"
      && row.targetLocator === "claims.CL-001.text"
    ));
    assert.ok(lawfulV13 !== undefined);
    assert.equal(locallyEvaluateSemanticSubrule(v13, lawfulV13.target).outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    const lawfulReturned = await validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: lawfulResult,
      semanticJudge: ALL_PASS_MOCK(),
      maxChecksPerBatch: 100,
    });
    assert.equal(Object.is(lawfulReturned, lawfulResult), true);

    // Judge UNABLE on a V-13 check is evaluator incapacity, not a semantic FAIL.
    const unableJudge = createMockSemanticJudge((check) => (
      check.semanticSubruleId === "V-13-SEM-PROBABILITY" && check.targetLocator === "claims.CL-001.text"
        ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }
        : { verdict: "PASS" }
    ));
    const incapacity = await assertRejects(
      () => validateAgentInterpretationSemantics({
        agentInterpretationRequest: p5a.request,
        agentInterpretationResult: v13Result,
        semanticJudge: unableJudge,
        maxChecksPerBatch: 100,
      }),
      SemanticEvaluatorIncapacityError,
      "V-13 judge UNABLE",
    );
    assert.equal(incapacity instanceof SemanticViolationError, false);
    assert.ok(incapacity.findings.some((finding) => finding.semanticSubruleId === "V-13-SEM-PROBABILITY"));
    assert.ok(incapacity.findings.every((finding) => JUDGE_INCAPACITY_REASON_CODES.includes(finding.reasonCode)));
  });

  // --- SV4: check identity ------------------------------------------------------

  await check("SV4", "check identity is content-sensitive and transport-blind", () => {
    const base = buildSemanticCheckSet(p5a.request, p5a.result);
    const rebuilt = buildSemanticCheckSet(p5a.request, p5a.result);
    assert.deepEqual(base.cSet.map((row) => row.checkId), rebuilt.cSet.map((row) => row.checkId));

    // Target text change moves exactly that target's checks.
    const textMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[0].text = "A different deterministic statement.";
      return clone;
    })());
    const afterText = buildSemanticCheckSet(p5a.request, textMutated).cSet;
    const byLocator = (rows, locator) => rows.filter((row) => row.targetLocator === locator).map((row) => row.checkId).sort();
    assert.notDeepEqual(byLocator(afterText, "claims.CL-001.text"), byLocator(base.cSet, "claims.CL-001.text"));
    assert.deepEqual(byLocator(afterText, "claims.CL-002.text"), byLocator(base.cSet, "claims.CL-002.text"));

    // Active constraint set change moves every check identity.
    const constraintClone = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      clone.activeConstraints = [...clone.activeConstraints, {
        constraintId: "C-SYNTHETIC-TEST",
        scope: "BRANCH",
        blockedClaimIds: [],
        originBranch: "P_5A",
      }];
      return clone;
    })());
    const afterConstraints = buildSemanticCheckSet(constraintClone, p5a.result).cSet;
    assert.equal(afterConstraints.every((row, index) => row.checkId !== base.cSet[index].checkId), true);

    // Minimum-authority law: a known fact cited by a specific target moves
    // only that target's V-13/V-28 checks; an uncited known fact moves none,
    // because the global structuredUncertainty.known pool is never attached.
    const subruleIdsAfter = (rows, subrule) => rows.filter((row) => row.semanticSubruleId === subrule).map((row) => row.checkId).sort();
    const citedFactClone = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      clone.structuredUncertainty.known[0].value = "P_5A-MUTATED";
      return clone;
    })());
    const afterCitedFact = buildSemanticCheckSet(citedFactClone, p5a.result).cSet;
    assert.notDeepEqual(
      subruleIdsAfter(afterCitedFact, "V-13-SEM-PROBABILITY"),
      subruleIdsAfter(base.cSet, "V-13-SEM-PROBABILITY"),
      "a known fact cited through CL-001.refs moves CL-001's V-13 checks",
    );
    assert.notDeepEqual(
      subruleIdsAfter(afterCitedFact, "V-28-SEM-SHADOW-SCORING"),
      subruleIdsAfter(base.cSet, "V-28-SEM-SHADOW-SCORING"),
      "a known fact cited through CL-001.refs moves CL-001's V-28 checks",
    );
    assert.deepEqual(
      subruleIdsAfter(afterCitedFact, "V-02-SEM-STATE-IN-PROSE"),
      subruleIdsAfter(base.cSet, "V-02-SEM-STATE-IN-PROSE"),
      "V-02 does not attach the known-fact pool",
    );
    const uncitedFactClone = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      clone.structuredUncertainty.known[1].value = "② PARTIAL CONVERGENCE";
      return clone;
    })());
    const afterUncitedFact = buildSemanticCheckSet(uncitedFactClone, p5a.result).cSet;
    assert.deepEqual(
      subruleIdsAfter(afterUncitedFact, "V-13-SEM-PROBABILITY"),
      subruleIdsAfter(base.cSet, "V-13-SEM-PROBABILITY"),
      "an uncited known fact is never attached to V-13 checks",
    );
    assert.deepEqual(
      subruleIdsAfter(afterUncitedFact, "V-28-SEM-SHADOW-SCORING"),
      subruleIdsAfter(base.cSet, "V-28-SEM-SHADOW-SCORING"),
      "an uncited known fact is never attached to V-28 checks",
    );

    // Specification-field sensitivity on the identity function itself.
    const spec = {
      semanticValidatorVersion: SEMANTIC_VALIDATOR_VERSION,
      semanticJudgePromptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
      semanticJudgePacketVersion: SEMANTIC_JUDGE_PACKET_VERSION,
      ruleId: "V-12",
      semanticSubruleId: "V-12-SEM-HUMAN-REVIEW",
      activeConstraintIds: ["C-A", "C-B"],
      targetFamily: "CLAIM_TEXT",
      targetLocator: "claims.CL-001.text",
      targetDigest: "sha256:aaaa",
      authoritySetDigest: "sha256:bbbb",
      expectedInvariant: "invariant",
      allowedSemanticInterpretations: ["allowed one"],
      forbiddenSemanticImplications: ["forbidden one"],
    };
    const identity = computeSemanticCheckId(spec);
    assert.equal(identity, computeSemanticCheckId(structuredClone(spec)));
    for (const mutate of [
      (s) => { s.semanticValidatorVersion = "semantic-validator-2.0"; },
      (s) => { s.semanticJudgePromptVersion = "semantic-judge-prompt-2.0"; },
      (s) => { s.semanticJudgePacketVersion = "semantic-judge-packet-2.0"; },
      (s) => { s.ruleId = "V-13"; },
      (s) => { s.semanticSubruleId = "V-13-SEM-PROBABILITY"; },
      (s) => { s.activeConstraintIds = ["C-B", "C-A"]; },
      (s) => { s.targetFamily = "WATCHPOINT_STATEMENT"; },
      (s) => { s.targetLocator = "claims.CL-002.text"; },
      (s) => { s.targetDigest = "sha256:cccc"; },
      (s) => { s.authoritySetDigest = "sha256:dddd"; },
      (s) => { s.expectedInvariant = "another invariant"; },
      (s) => { s.allowedSemanticInterpretations = ["allowed one", "allowed two"]; },
      (s) => { s.forbiddenSemanticImplications = ["another forbidden one"]; },
    ]) {
      const mutated = structuredClone(spec);
      mutate(mutated);
      assert.notEqual(computeSemanticCheckId(mutated), identity);
    }

    // Transport-only changes never move check identity: identical checkIds
    // across batch sizes, only batch geometry differs.
    const cSet = base.cSet;
    for (const size of [1, 2, cSet.length]) {
      const { partitions, packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: size });
      assert.deepEqual(
        partitions.flat().map((row) => row.checkId),
        cSet.map((row) => row.checkId),
      );
      assert.equal(packets[0].batchCount, partitions.length);
      assert.equal(packets[0].batchIndex, 0);
      if (packets.length > 1) assert.equal(packets[1].batchIndex, 1);
    }
    const single = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 1 });
    const whole = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: cSet.length });
    assert.deepEqual(
      single.packets.flatMap((packet) => packet.checks.map((row) => row.checkId)),
      whole.packets.flatMap((packet) => packet.checks.map((row) => row.checkId)),
    );
  });

  // --- SV5: authority digest ------------------------------------------------------

  await check("SV5", "authority digests are canonical, value-sensitive, and order-normalized", () => {
    const a = { kind: "ENGINE_FACT", id: "qref://x/R1", value: { useClass: "PRIMARY" } };
    const b = { kind: "ENGINE_FACT", id: "qref://y/R1", value: { useClass: "CONTEXTUAL" } };
    const c = { kind: "UNCERTAINTY_ITEM", id: "U-001", value: { reasonCode: "PAIR_ABSENT" } };
    assert.equal(computeAuthoritySetDigest([a, b, c]), computeAuthoritySetDigest([a, b, c]));
    assert.equal(computeAuthoritySetDigest([a, b, c]), computeAuthoritySetDigest([c, b, a]), "input order is canonicalized");
    const aMutated = { ...a, value: { useClass: "CONTEXTUAL" } };
    assert.notEqual(computeAuthoritySetDigest([aMutated, b, c]), computeAuthoritySetDigest([a, b, c]), "ids alone are not the digest source");
    const aAsUncertainty = { kind: "UNCERTAINTY_ITEM", id: a.id, value: a.value };
    assert.notEqual(computeAuthoritySetDigest([aAsUncertainty, b]), computeAuthoritySetDigest([a, b]), "kind participates in the canonical order");

    // Authority attachment follows the matrix plan per check.
    const cSet1b = buildSemanticCheckSet(p1b.request, p1b.result).cSet;
    const v06 = cSet1b.find((row) => row.semanticSubruleId === "V-06-SEM-DETERMINATION");
    assert.ok(v06.authorityIds.some((id) => id.startsWith("BLOCKED_CLAIM:CLAIM_NF_SFP_DETERMINATION")));
    assert.ok(v06.authorityIds.some((id) => id.startsWith("SUPPRESSION_FACT:engine.outcome.suppression")));
    // V-21 resolves the canonical uncertainty chain: the missing-evidence and
    // disclosure targets resolve their uncertainty identity's evidenceRefs to
    // exactly the Engine observations whose recorded UseClass is the authority.
    const v21Missing = cSet1b.find((row) => row.semanticSubruleId === "V-21-SEM-USECLASS" && row.targetFamily === "MISSING_EVIDENCE_STATEMENT");
    const v21Disclosure = cSet1b.find((row) => row.semanticSubruleId === "V-21-SEM-USECLASS" && row.targetFamily === "DISCLOSURE_CLIENT_STATEMENT");
    for (const check of [v21Missing, v21Disclosure]) {
      assert.ok(check !== undefined, "V-21 missing-evidence/disclosure check exists on P_1B");
      assert.ok(check.authorityIds.length > 0, "V-21 never exists with an empty UseClass authority set");
      const linkedItem = p1b.request.structuredUncertainty.items
        .find((item) => item.uncertaintyId === (check.targetFamily === "MISSING_EVIDENCE_STATEMENT"
          ? p1b.result.interpretation.missingEvidence[0].uncertaintyIds[0]
          : p1b.result.uncertainty.disclosures[0].uncertaintyId));
      assert.deepEqual(
        check.authorityIds,
        linkedItem.evidenceRefs.map((qref) => `ENGINE_FACT:${qref}`).sort(),
      );
      for (const authority of check.authorities) {
        assert.equal(authority.kind, "ENGINE_FACT");
        const observation = p1b.request.engineSnapshot.engine.observations
          .find((row) => row.observationRef === authority.id);
        assert.equal(authority.value, observation.useClass);
      }
    }
    // Authorities are ordered by kind rank then id inside each check.
    const kindRank = new Map(AUTHORITY_KINDS.map((kind, index) => [kind, index]));
    for (const check of cSet1b) {
      const ranks = check.authorities.map((authority) => kindRank.get(authority.kind));
      let monotone = true;
      for (let index = 1; index < ranks.length; index += 1) {
        if (ranks[index - 1] > ranks[index]) monotone = false;
        if (ranks[index - 1] === ranks[index]
          && check.authorities[index - 1].id > check.authorities[index].id) monotone = false;
      }
      assert.equal(monotone, true, check.semanticSubruleId);
    }
  });

  // --- SV6: partitioning -----------------------------------------------------------

  await check("SV6", "partitioning is order-preserving, disjoint, tail-complete", () => {
    const { cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    assert.ok(cSet.length > 2);
    for (const size of [1, 2, cSet.length]) {
      const partitions = partitionChecks(cSet, size);
      assert.ok(partitions.every((partition) => partition.length >= 1 && partition.length <= size));
      assert.equal(partitions.flat().length, cSet.length);
      assert.deepEqual(
        partitions.flat().map((row) => row.checkId),
        cSet.map((row) => row.checkId),
      );
      const seen = new Set();
      for (const partition of partitions) {
        for (const row of partition) {
          assert.equal(seen.has(row.checkId), false);
          seen.add(row.checkId);
        }
      }
      if (size < cSet.length) {
        assert.equal(partitions[partitions.length - 1].length, cSet.length % size === 0 ? size : cSet.length % size, "no dropped tail");
      }
    }
    for (const invalid of [0, -1, 1.5, "2", null, undefined]) {
      try {
        partitionChecks(cSet, invalid);
        assert.fail(`partitionChecks accepted ${JSON.stringify(invalid)}`);
      } catch (error) {
        assert.ok(error instanceof SemanticValidationError);
        assert.equal(error.errorKind, "INPUT_PRECONDITION_FAILURE");
      }
    }
  });

  // --- SV7: verdict schema ------------------------------------------------------------

  await check("SV7", "verdict schema enforces exact cardinality, shape, and enums", () => {
    const { cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    const { packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 4 });
    const packet = packets[0];
    const schema = buildSemanticJudgeVerdictSchema(packet.checks);
    assert.equal(schema.minItems, packet.checks.length);
    assert.equal(schema.maxItems, packet.checks.length);
    assert.equal(schema.items.additionalProperties, false);
    assert.deepEqual([...schema.items.required], [
      "checkId",
      "ruleId",
      "targetLocator",
      "verdict",
      "violationCode",
      "reasonCode",
      "supportingAuthorityIds",
    ]);

    const pass = createMockSemanticJudge(() => ({ verdict: "PASS" }));
    assert.equal(typeof pass, "function");
  });

  await check("SV7b", "verdict admission accepts exact-cardinality responses and rejects each protocol failure", async () => {
    const { cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    const { packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 4 });
    const packet = packets[0];

    const good = createMockSemanticJudge(() => ({ verdict: "PASS" }));
    const verdicts = await invokeSemanticJudge(good, packet);
    assert.equal(verdicts.length, packet.checks.length);
    verdicts.forEach((verdict, index) => {
      assert.equal(verdict.checkId, packet.checks[index].checkId);
      assert.equal(verdict.verdict, "PASS");
      assert.equal(verdict.violationCode, null);
      assert.equal(verdict.reasonCode, "RULE_SATISFIED");
      assert.equal(Object.isFrozen(verdict), true);
    });

    const cases = [
      [{ dropItems: 1 }, "missing item"],
      [{ extraItem: true }, "extra item"],
      [{ duplicateItem: true }, "duplicate checkId"],
      [{ corruptVerdictEnum: true }, "malformed enum"],
      [{ echoMismatch: true }, "echo mismatch"],
      [{ foreignAuthorityId: true }, "unexpected authority id"],
      [{ unknownCheckId: true }, "unknown checkId"],
    ];
    for (const [options, label] of cases) {
      const judge = createMockSemanticJudge(() => ({ verdict: "PASS" }), options);
      await assertRejects(() => invokeSemanticJudge(judge, packet), SemanticProtocolError, label);
    }

    await assertRejects(
      () => invokeSemanticJudge(createMockSemanticJudge(() => ({ verdict: "PASS", reasonCode: "RULE_VIOLATED" })), packet),
      SemanticProtocolError,
      "cross-field PASS/RULE_VIOLATED",
    );
    await assertRejects(
      () => invokeSemanticJudge(createMockSemanticJudge(() => ({ verdict: "FAIL", violationCode: null })), packet),
      SemanticProtocolError,
      "cross-field FAIL/null violationCode",
    );
    await assertRejects(
      () => invokeSemanticJudge(null, packet),
      SemanticValidationError,
      "non-function judge",
    );
  });

  // --- SV8: completeness proof -----------------------------------------------------------

  await check("SV8", "completeness proof rejects every loss and accepts exact all-PASS", async () => {
    const { tSet, cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    const dSet = evaluateDeterministicChecks(p5a.request, p5a.result);
    const { partitions, packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 7 });

    const baseProof = () => ({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: p5a.result,
      dSet,
      tSet,
      cSet,
      partitions,
    });

    const runAllPass = async () => {
      const judge = ALL_PASS_MOCK();
      const processedPartitions = [];
      for (const packet of packets) {
        processedPartitions.push(Object.freeze({
          packet,
          verdicts: await invokeSemanticJudge(judge, packet),
        }));
      }
      return processedPartitions;
    };

    const processed = await runAllPass();
    assert.doesNotThrow(() => proveSemanticProtocolIntegrity({ ...baseProof(), processedPartitions: processed }));
    assert.doesNotThrow(() => proveSemanticCompleteness({ ...baseProof(), processedPartitions: processed }));

    // Skipped partition.
    await assertRejects(
      () => Promise.resolve().then(() => proveSemanticProtocolIntegrity({
        ...baseProof(),
        processedPartitions: processed.slice(0, -1),
      })),
      SemanticProtocolError,
      "skipped partition",
    );

    // Missing semantic check: a truncated C-set no longer equals the expansion.
    await assertRejects(
      () => Promise.resolve().then(() => proveSemanticProtocolIntegrity({
        ...baseProof(),
        cSet: cSet.slice(0, -1),
        partitions: partitionChecks(cSet.slice(0, -1), 7),
        processedPartitions: processed.slice(0, -1),
      })),
      SemanticProtocolError,
      "missing semantic check",
    );

    // Tampered T-set no longer equals the physical walk.
    const tamperedT = [...tSet, deepFreezeValue({
      targetFamily: "CLAIM_TEXT",
      targetLocator: "claims.GHOST.text",
      text: "ghost",
      targetDigest: "sha256:ghost",
      metadata: {},
    })];
    await assertRejects(
      () => Promise.resolve().then(() => proveSemanticProtocolIntegrity({
        ...baseProof(),
        tSet: tamperedT,
      })),
      SemanticProtocolError,
      "tampered T-set",
    );

    // D-set failure inside the proof.
    const dFailed = [{ ...dSet[0], outcome: "FAIL" }];
    await assertRejects(
      () => Promise.resolve().then(() => proveSemanticProtocolIntegrity({
        ...baseProof(),
        dSet: dFailed,
      })),
      SemanticProtocolError,
      "failed deterministic check",
    );

    // FAIL verdict on the completeness (PASS) path.
    const failJudge = createMockSemanticJudge((check) => ({
      verdict: check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW" ? "FAIL" : "PASS",
    }));
    const failProcessed = [];
    for (const packet of packets) {
      failProcessed.push(Object.freeze({ packet, verdicts: await invokeSemanticJudge(failJudge, packet) }));
    }
    await assertRejects(
      () => Promise.resolve().then(() => proveSemanticCompleteness({ ...baseProof(), processedPartitions: failProcessed })),
      SemanticProtocolError,
      "FAIL verdict on PASS path",
    );
  });

  // --- SV9: terminal outcomes ------------------------------------------------------------

  await check("SV9", "typed terminal outcomes with canonical, non-hash ordering", async () => {
    const run = async (judge) => validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: p5a.result,
      semanticJudge: judge,
      maxChecksPerBatch: 5,
    });

    // Full PASS end-to-end returns the exact same Result identity.
    const passJudge = ALL_PASS_MOCK();
    const returned = await run(passJudge);
    assert.equal(Object.is(returned, p5a.result), true);
    assert.equal(passJudge.calls.length, Math.ceil(buildSemanticCheckSet(p5a.request, p5a.result).cSet.length / 5));

    // Semantic FAIL produces a typed semantic violation with the row's code.
    const failJudge = createMockSemanticJudge((check) => ({
      verdict: check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW" ? "FAIL" : "PASS",
    }));
    const violation = await assertRejects(() => run(failJudge), SemanticViolationError, "judge FAIL");
    assert.equal(violation.violationCode, "PROHIBITED_CLAIM_VIOLATION");
    assert.ok(violation.findings.length >= 1);
    for (const finding of violation.findings) {
      assert.equal(finding.ruleId, "V-12");
      assert.equal(finding.reasonCode, "RULE_VIOLATED");
    }

    // UNABLE produces a typed evaluator incapacity.
    const unableJudge = createMockSemanticJudge((check) => ({
      verdict: check.semanticSubruleId === "V-21-SEM-USECLASS" ? "UNABLE_TO_EVALUATE" : "PASS",
    }), {});
    const incapable = createMockSemanticJudge((check) => ({
      verdict: "UNABLE_TO_EVALUATE",
      reasonCode: "PACKET_INSUFFICIENT",
      supportingAuthorityIds: [],
    }));
    const incapacity = await assertRejects(() => run(incapable), SemanticEvaluatorIncapacityError, "judge UNABLE");
    assert.ok(incapacity.findings.length > 0);
    assert.ok(incapacity.findings.every((finding) => JUDGE_INCAPACITY_REASON_CODES.includes(finding.reasonCode)));
    void unableJudge;

    // Protocol failure wins even when verdicts would also carry FAILs.
    const protocolJudge = createMockSemanticJudge(() => ({ verdict: "FAIL" }), { unknownCheckId: true });
    await assertRejects(() => run(protocolJudge), SemanticProtocolError, "protocol precedence over FAIL");

    // V-13/V-29 numeric probability wording is not a local FAIL; it reaches
    // the judge. A mock PASS admits the Result without fabricating a violation.
    const numericResult = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[0].text = "The pattern carries a 72% probability.";
      return clone;
    })());
    let judgeCalls = 0;
    const countingJudge = createMockSemanticJudge(() => {
      judgeCalls += 1;
      return { verdict: "PASS" };
    });
    const numericReturned = await validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: numericResult,
      semanticJudge: countingJudge,
      maxChecksPerBatch: 100,
    });
    assert.equal(Object.is(numericReturned, numericResult), true);
    assert.ok(judgeCalls > 0, "numeric probability wording reaches the judge");

    // Canonical ordering is not checkId lexical ordering.
    const { cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    const canonical = cSet.map((row) => row.checkId);
    const lexical = [...canonical].sort();
    assert.notDeepEqual(canonical, lexical, "canonical order differs from checkId lexical order");
    const allFailJudge = createMockSemanticJudge(() => ({ verdict: "FAIL" }));
    const allFail = await assertRejects(() => run(allFailJudge), SemanticViolationError, "all-FAIL ordering");
    assert.equal(allFail.findings.length, cSet.length);
    const cIndexByLocator = new Map(cSet.map((row) => [`${row.semanticSubruleId}|${row.targetLocator}`, row]));
    let previous = -1;
    for (const finding of allFail.findings) {
      const check = cIndexByLocator.get(`${finding.semanticSubruleId}|${finding.targetLocator}`);
      const cIndex = cSet.indexOf(check);
      assert.ok(cIndex > previous, "findings follow canonical evaluation order");
      previous = cIndex;
    }
  });

  // --- SV10: zero-check case ---------------------------------------------------------------

  await check("SV10", "zero-check case: no judge invocation, same Result identity", async () => {
    const empty = syntheticEmptySurfaceResult(p5a);
    const { cSet, tSet } = buildSemanticCheckSet(p5a.request, empty);
    assert.equal(tSet.length, 0);
    assert.equal(cSet.length, 0);
    const dEmpty = evaluateDeterministicChecks(p5a.request, empty);
    assert.deepEqual(dEmpty.map((row) => row.outcome), ["PASS", "PASS"]);

    const failFastJudge = () => {
      throw new Error("the judge must not be invoked when the C-set is empty");
    };
    const returned = await validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: empty,
      semanticJudge: failFastJudge,
      maxChecksPerBatch: 1,
    });
    assert.equal(Object.is(returned, empty), true);

    // The abstention fixture on P_0A still exposes its mandatory disclosure
    // target, so its C-set is non-empty and the judge is invoked.
    const abstained = syntheticAbstainedEmptyResult(p0a);
    const abstainedExpansion = buildSemanticCheckSet(p0a.request, abstained);
    assert.equal(abstainedExpansion.tSet.length, 1);
    assert.equal(abstainedExpansion.tSet[0].targetFamily, "DISCLOSURE_CLIENT_STATEMENT");
    assert.ok(abstainedExpansion.cSet.length > 0);
    const recording = ALL_PASS_MOCK();
    const abstainedReturned = await validateAgentInterpretationSemantics({
      agentInterpretationRequest: p0a.request,
      agentInterpretationResult: abstained,
      semanticJudge: recording,
      maxChecksPerBatch: 3,
    });
    assert.equal(Object.is(abstainedReturned, abstained), true);
    assert.ok(recording.calls.length > 0);
  });

  // --- SV11: immutability ---------------------------------------------------------------------

  await check("SV11", "inputs unchanged after PASS and FAIL; PASS returns the same identity", async () => {
    const requestBytes = canonicalSerialize(p5a.request);
    const resultBytes = canonicalSerialize(p5a.result);

    const pass = await validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: p5a.result,
      semanticJudge: ALL_PASS_MOCK(),
      maxChecksPerBatch: 6,
    });
    assert.equal(Object.is(pass, p5a.result), true);
    assert.equal(canonicalSerialize(p5a.request), requestBytes);
    assert.equal(canonicalSerialize(p5a.result), resultBytes);

    const failJudge = createMockSemanticJudge((check) => ({
      verdict: check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? "FAIL" : "PASS",
    }));
    await assertRejects(
      () => validateAgentInterpretationSemantics({
        agentInterpretationRequest: p5a.request,
        agentInterpretationResult: p5a.result,
        semanticJudge: failJudge,
        maxChecksPerBatch: 6,
      }),
      SemanticViolationError,
      "immutability on FAIL",
    );
    assert.equal(canonicalSerialize(p5a.request), requestBytes);
    assert.equal(canonicalSerialize(p5a.result), resultBytes);

    const dFailResult = deepFreezeValue((() => {
      const clone = structuredClone(p1b.result);
      clone.uncertainty.disclosures = [];
      return clone;
    })());
    const p1bBytes = canonicalSerialize(p1b.request);
    const dFailBytes = canonicalSerialize(dFailResult);
    await assertRejects(
      () => validateAgentInterpretationSemantics({
        agentInterpretationRequest: p1b.request,
        agentInterpretationResult: dFailResult,
        semanticJudge: ALL_PASS_MOCK(),
        maxChecksPerBatch: 6,
      }),
      SemanticViolationError,
      "V-05 deterministic FAIL",
    );
    assert.equal(canonicalSerialize(p1b.request), p1bBytes);
    assert.equal(canonicalSerialize(dFailResult), dFailBytes);
    assert.equal(dFailResult.uncertainty.disclosures.length, 0, "no repaired clone was built");
  });

  // --- SV12: provider neutrality ------------------------------------------------------------------

  await check("SV12", "J1 production files carry no provider transport, credential, or SDK surface", () => {
    const productionFiles = [
      "../src/agent/semanticValidatorConstants.js",
      "../src/agent/semanticValidationError.js",
      "../src/agent/semanticApplicability.js",
      "../src/agent/semanticLocalEvaluator.js",
      "../src/agent/semanticCheckEnumerator.js",
      "../src/agent/semanticJudgePacket.js",
      "../src/agent/semanticJudgeVerdictSchema.js",
      "../src/agent/semanticCompleteness.js",
      "../src/agent/semanticJudge.js",
      "../src/agent/semanticValidator.js",
    ];
    const allowedImports = new Set([
      "./semanticValidatorConstants.js",
      "./semanticValidationError.js",
      "./semanticApplicability.js",
      "./semanticLocalEvaluator.js",
      "./semanticCheckEnumerator.js",
      "./semanticJudgePacket.js",
      "./semanticJudgeVerdictSchema.js",
      "./semanticCompleteness.js",
      "./semanticJudge.js",
      "./semanticValidator.js",
      "./canonicalDigest.js",
      "./agentContractConstants.js",
    ]);
    for (const path of productionFiles) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      const lower = source.toLowerCase();
      for (const fragment of [
        "x.ai",
        "grok",
        "xai_api_key",
        "generativelanguage",
        "googleapis",
        "@google",
        "gemini",
        "providerexecution",
        "providerprojection",
        "providerprompt",
      ]) {
        assert.equal(lower.includes(fragment), false, `${path}: ${fragment}`);
      }
      for (const fragment of [
        "fet" + "ch(",
        "process" + ".env",
        "XML" + "HttpRequest",
        "node:ht" + "tp",
        "node:ht" + "tps",
        "node:n" + "et",
        "child_" + "process",
        "setTim" + "eout",
        "AbortCon" + "troller",
        "api_KE" + "Y",
        "api k" + "ey",
      ]) {
        assert.equal(source.includes(fragment), false, `${path}: ${fragment}`);
      }
      for (const importPath of source.matchAll(/from\s+"([^"]+)"/g)) {
        assert.ok(allowedImports.has(importPath[1]), `${path}: unexpected import ${importPath[1]}`);
      }
      assert.equal(/[0-9]+\s*as\s+a\s+(provider|schema)\s+capacity/.test(lower), false, path);
    }

    // No J1 production module mints identities or reads a clock.
    for (const path of ["../src/agent/semanticCheckEnumerator.js", "../src/agent/semanticValidator.js"]) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      assert.equal(source.includes("randomUUID"), false, path);
      assert.equal(source.includes("new Date("), false, path);
    }

    // This validator performs no network access of its own.
    const self = readFileSync(new URL(import.meta.url), "utf8");
    for (const fragment of ["fet" + "ch(", "process" + ".env", "XML" + "HttpRequest", "node:ht" + "tp"]) {
      assert.equal(self.includes(fragment), false, fragment);
    }
  });

  // --- SV13: authority-resolution adversarial fixtures (audit remediation) ---

  await check("SV13", "V-02 priority/suppression authority exact; V-21 uncertainty chains exact; V-13/V-28 minimum authority", () => {
    const cSet5a = buildSemanticCheckSet(p5a.request, p5a.result).cSet;
    const cSet1b = buildSemanticCheckSet(p1b.request, p1b.result).cSet;

    // (7) V-02: canonical Engine outcome priority and suppression authority
    // are physically present and exact on every V-02 check.
    for (const [label, cSet, fixture] of [["P_5A", cSet5a, p5a], ["P_1B", cSet1b, p1b]]) {
      const v02Checks = cSet.filter((row) => row.semanticSubruleId === "V-02-SEM-STATE-IN-PROSE");
      assert.ok(v02Checks.length > 0, label);
      for (const check of v02Checks) {
        const valueByAuthorityId = new Map(check.authorities.map((authority) => [`${authority.kind}:${authority.id}`, authority.value]));
        const outcome = fixture.request.engineSnapshot.engine.outcome;
        assert.deepEqual(valueByAuthorityId.get("ENGINE_FACT:engine.outcome.priority"), outcome.priority, `${label} ${check.targetLocator} priority`);
        assert.deepEqual(valueByAuthorityId.get("SUPPRESSION_FACT:engine.outcome.suppression"), outcome.suppression, `${label} ${check.targetLocator} suppression`);
        assert.deepEqual(valueByAuthorityId.get("ENGINE_FACT:engine.outcome.state"), outcome.state, `${label} ${check.targetLocator} state`);
        assert.deepEqual(valueByAuthorityId.get("ENGINE_FACT:engine.outcome.deterministicStateEstablished"), outcome.deterministicStateEstablished, `${label} ${check.targetLocator} deterministicStateEstablished`);
        assert.equal(valueByAuthorityId.get("BRANCH:engine.outcome.branchCode"), outcome.branchCode, `${label} ${check.targetLocator} branchCode`);
        for (const withheld of fixture.request.structuredUncertainty.withheldOutputs) {
          assert.ok(
            valueByAuthorityId.has(`SUPPRESSION_FACT:withheldOutputs:${withheld.withheldItem}`),
            `${label} ${check.targetLocator} withheld ${withheld.withheldItem}`,
          );
        }
      }
    }

    // (8) V-21 missing-evidence fixture and (9) V-21 disclosure fixture: the
    // exact related observation UseClass authority is attached through the
    // canonical target → uncertaintyId → evidenceRefs → observation chain.
    const v21ByFamily = (cSet, family) => cSet.find((row) => row.semanticSubruleId === "V-21-SEM-USECLASS" && row.targetFamily === family);
    const v21Missing = v21ByFamily(cSet1b, "MISSING_EVIDENCE_STATEMENT");
    const v21Disclosure = v21ByFamily(cSet1b, "DISCLOSURE_CLIENT_STATEMENT");
    const missingEvidenceItemId = p1b.result.interpretation.missingEvidence[0].uncertaintyIds[0];
    const disclosureItemId = p1b.result.uncertainty.disclosures[0].uncertaintyId;
    const observationByRef = new Map(p1b.request.engineSnapshot.engine.observations.map((row) => [row.observationRef, row]));
    for (const [check, itemId] of [[v21Missing, missingEvidenceItemId], [v21Disclosure, disclosureItemId]]) {
      assert.ok(check !== undefined, "V-21 check exists");
      const linkedItem = p1b.request.structuredUncertainty.items.find((item) => item.uncertaintyId === itemId);
      assert.deepEqual(
        check.authorityIds,
        linkedItem.evidenceRefs.map((qref) => `ENGINE_FACT:${qref}`).sort(),
        `${check.targetLocator} attaches exactly the deterministically linked observations`,
      );
      for (const authority of check.authorities) {
        assert.equal(authority.kind, "ENGINE_FACT");
        assert.equal(authority.value, observationByRef.get(authority.id).useClass, `${check.targetLocator} ${authority.id} useClass`);
      }
    }
    // A target with no deterministically linked observation qref emits no
    // V-21 check at all (J1 CORR2 no-empty-authority law): the factref-only
    // claim carries no observation whose UseClass could be compared.
    const v21ClaimFactonly = cSet1b.find((row) => row.semanticSubruleId === "V-21-SEM-USECLASS" && row.targetLocator === "claims.CL-001.text");
    assert.equal(v21ClaimFactonly, undefined, "no observation link means no V-21 check, not an empty-authority check");

    // (10) V-13/V-28: unrelated structuredUncertainty.known facts are NOT
    // attached to any check (minimum-authority law).
    const uncitedFactId = "ENGINE_FACT:factref://engineSnapshot/engine/outcome/state";
    for (const check of cSet1b.filter((row) => row.semanticSubruleId === "V-13-SEM-PROBABILITY" || row.semanticSubruleId === "V-28-SEM-SHADOW-SCORING")) {
      assert.equal(check.authorityIds.includes(uncitedFactId), false, `${check.semanticSubruleId} ${check.targetLocator}`);
    }

    // (11) a genuinely target-linked Engine number IS attached when
    // structurally referenced — and only to the targets that cite it.
    const numericFactRef = "factref://engineSnapshot/engine/comparison/agreement/effectiveAgreeCount";
    const numericRequest = deepFreezeValue((() => {
      const clone = structuredClone(p1b.request);
      clone.structuredUncertainty.known.push({
        factRef: numericFactRef,
        statement: "engine/comparison/agreement/effectiveAgreeCount is 6.",
        value: 6,
      });
      return clone;
    })());
    const numericResult = deepFreezeValue((() => {
      const clone = structuredClone(p1b.result);
      clone.claims[0].refs = [numericFactRef];
      return clone;
    })());
    const numericCSet = buildSemanticCheckSet(numericRequest, numericResult).cSet;
    const v13Linked = numericCSet.find((row) => row.semanticSubruleId === "V-13-SEM-PROBABILITY" && row.targetLocator === "claims.CL-001.text");
    const v13Unlinked = numericCSet.find((row) => row.semanticSubruleId === "V-13-SEM-PROBABILITY" && row.targetLocator === "claims.CL-002.text");
    const v28Linked = numericCSet.find((row) => row.semanticSubruleId === "V-28-SEM-SHADOW-SCORING" && row.targetLocator === "claims.CL-001.text");
    const linkedAuthority = v13Linked.authorities.find((authority) => `${authority.kind}:${authority.id}` === `ENGINE_FACT:${numericFactRef}`);
    assert.equal(linkedAuthority.value.factRef, numericFactRef, "target-linked Engine number is attached with its exact canonical factRef");
    assert.equal(linkedAuthority.value.value, 6, "target-linked Engine number is attached with its exact canonical value");
    assert.equal(v13Unlinked.authorityIds.includes(`ENGINE_FACT:${numericFactRef}`), false, "number is not attached to a target that does not cite it");
    assert.equal(v28Linked.authorityIds.includes(`ENGINE_FACT:${numericFactRef}`), true, "V-28 attaches the same target-linked number");
  });

  // --- SV14: independent applicability matrix (audit remediation 4A) --------

  await check("SV14", "production applicability matrix equals the independently declared 22-subrule matrix", () => {
    assert.deepEqual(
      Object.keys(EXPECTED_SEMANTIC_APPLICABILITY).sort(),
      SEMANTIC_APPLICABILITY_MATRIX.rows.map((row) => row.semanticSubruleId).sort(),
      "exactly the 22 expected subrules exist, no more, no fewer",
    );
    for (const row of SEMANTIC_APPLICABILITY_MATRIX.rows) {
      const expected = EXPECTED_SEMANTIC_APPLICABILITY[row.semanticSubruleId];
      assert.ok(expected !== undefined, row.semanticSubruleId);
      assert.equal(row.ruleId, expected.ruleId, `${row.semanticSubruleId} ruleId`);
      assert.deepEqual(
        [...row.targetFamilies],
        [...expected.families],
        `${row.semanticSubruleId} exact target families (no missing, no extra, canonical order)`,
      );
      const producedCondition = row.conditions.length === 0
        ? ["ALWAYS"]
        : [...row.conditions].map(conditionDescriptor).sort();
      assert.deepEqual(
        producedCondition,
        [...expected.condition].sort(),
        `${row.semanticSubruleId} exact applicability condition`,
      );
      const producedByFamily = row.conditionsByFamily === undefined
        ? undefined
        : Object.fromEntries(Object.entries(row.conditionsByFamily).map(([family, conditions]) => [family, [...conditions].map(conditionDescriptor).sort()]));
      const expectedByFamily = expected.conditionsByFamily === undefined ? undefined : Object.fromEntries(
        Object.entries(expected.conditionsByFamily).map(([family, descriptors]) => [family, [...descriptors].sort()]),
      );
      assert.deepEqual(
        producedByFamily === undefined ? "NONE" : Object.keys(producedByFamily).sort(),
        expectedByFamily === undefined ? "NONE" : Object.keys(expectedByFamily).sort(),
        `${row.semanticSubruleId} per-family condition families`,
      );
      if (producedByFamily !== undefined && expectedByFamily !== undefined) {
        for (const family of Object.keys(expectedByFamily)) {
          assert.deepEqual(producedByFamily[family], expectedByFamily[family], `${row.semanticSubruleId} ${family} per-family conditions`);
        }
      }
      assert.equal(row.failureViolationCode, expected.failureClass, `${row.semanticSubruleId} canonical failure class`);
    }
  });

  // --- SV15: independent C-set expectations (audit remediation 4B) ----------

  await check("SV15", "C-set expansion equals independently declared explicit check tuples for representative Results", () => {
    const caseA = syntheticCaseAFixture(p5a);
    assertExactCheckSet("ordinary Case B (P_5A, CO_EQUAL hypotheses)", p5a.request, p5a.result, EXPECTED_C_SETS.caseB);
    assertExactCheckSet("ordinary Case A", caseA.request, caseA.result, EXPECTED_C_SETS.caseA);
    assertExactCheckSet("P_1B", p1b.request, p1b.result, EXPECTED_C_SETS.p1b);
    assertExactCheckSet("P_3A (active C-DEC7B-FLOOR)", p3a.request, p3a.result, EXPECTED_C_SETS.p3a);
    assertExactCheckSet("P_2", p2.request, p2.result, EXPECTED_C_SETS.p2);
    assertExactCheckSet("P_4", p4.request, p4.result, EXPECTED_C_SETS.p4);
    assertExactCheckSet("P_5X (active no-collapse path)", p5x.request, p5x.result, EXPECTED_C_SETS.p5x);
    assertExactCheckSet("RANKED hypotheses", ranked.request, ranked.result, EXPECTED_C_SETS.ranked);
    assertExactCheckSet("V-32 marker-present", markerP5a, p5a.result, EXPECTED_C_SETS.marker);
  });

  // --- SV16: adversarial terminal / verdict-admission law (audit 4C) --------

  await check("SV16", "UNABLE outranks FAIL; illegal verdict combinations are typed protocol failures at admission", async () => {
    const run = (judge) => validateAgentInterpretationSemantics({
      agentInterpretationRequest: p5a.request,
      agentInterpretationResult: p5a.result,
      semanticJudge: judge,
      maxChecksPerBatch: 5,
    });

    // (1) identity-valid batch with one FAIL and one UNABLE_TO_EVALUATE:
    // terminal classification is evaluator incapacity, not semantic violation.
    const mixed = await assertRejects(
      () => run(createMockSemanticJudge((check) => (
        check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW"
          ? { verdict: "FAIL" }
          : check.semanticSubruleId === "V-13-SEM-PROBABILITY"
            ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }
            : { verdict: "PASS" }
      ))),
      SemanticEvaluatorIncapacityError,
      "UNABLE outranks FAIL in a mixed identity-valid batch",
    );
    assert.equal(mixed instanceof SemanticViolationError, false);
    assert.ok(mixed.findings.length > 0);
    assert.ok(mixed.findings.every((finding) => JUDGE_INCAPACITY_REASON_CODES.includes(finding.reasonCode)));

    // (2)–(5): every illegal verdict/reason/violationCode combination is
    // rejected at the verdict admission boundary as a typed protocol error.
    const { cSet } = buildSemanticCheckSet(p5a.request, p5a.result);
    const packet = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 4 }).packets[0];
    const firstCheck = packet.checks[0];
    const targeted = (verdictOverride) => createMockSemanticJudge((check) => (
      check.checkId === firstCheck.checkId ? verdictOverride : { verdict: "PASS" }
    ));
    const canonicalClass = getSemanticSubrule(firstCheck.semanticSubruleId).failureViolationCode;
    const wrongClass = SEMANTIC_VIOLATION_CODES.find((code) => code !== canonicalClass);
    await assertRejects(
      () => invokeSemanticJudge(targeted({ verdict: "FAIL", violationCode: wrongClass }), packet),
      SemanticProtocolError,
      "(2) FAIL with wrong-but-non-null violationCode",
    );
    await assertRejects(
      () => invokeSemanticJudge(targeted({ verdict: "UNABLE_TO_EVALUATE", reasonCode: "RULE_SATISFIED", supportingAuthorityIds: [] }), packet),
      SemanticProtocolError,
      "(3) UNABLE_TO_EVALUATE + RULE_SATISFIED",
    );
    await assertRejects(
      () => invokeSemanticJudge(targeted({ verdict: "UNABLE_TO_EVALUATE", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }), packet),
      SemanticProtocolError,
      "(4) UNABLE_TO_EVALUATE + RULE_VIOLATED",
    );
    await assertRejects(
      () => invokeSemanticJudge(targeted({ verdict: "UNABLE_TO_EVALUATE", violationCode: canonicalClass, supportingAuthorityIds: [] }), packet),
      SemanticProtocolError,
      "(5) UNABLE_TO_EVALUATE + non-null violationCode",
    );

    // (6) valid UNABLE with each allowed incapacity reason → typed evaluator
    // incapacity end-to-end.
    for (const reasonCode of JUDGE_INCAPACITY_REASON_CODES) {
      const error = await assertRejects(
        () => run(createMockSemanticJudge((check) => (
          check.semanticSubruleId === "V-13-SEM-PROBABILITY"
            ? { verdict: "UNABLE_TO_EVALUATE", reasonCode, supportingAuthorityIds: [] }
            : { verdict: "PASS" }
        ))),
        SemanticEvaluatorIncapacityError,
        `(6) valid UNABLE with ${reasonCode}`,
      );
      assert.ok(error.findings.length > 0);
      assert.ok(error.findings.every((finding) => finding.reasonCode === reasonCode));
    }
  });

  // --- SV17: V-21 linked-observation applicability (J1 CORR2) --------------

  await check("SV17", "V-21 emits iff the target deterministically identifies observation UseClass; empty-ref UseClass prose remains V-04 grounding", async () => {
    const v21Families = new Set(EXPECTED_SEMANTIC_APPLICABILITY["V-21-SEM-USECLASS"].families);
    const v21Of = (cSet, family, locator) => cSet.find((row) => (
      row.semanticSubruleId === "V-21-SEM-USECLASS"
      && (family === undefined || row.targetFamily === family)
      && (locator === undefined || row.targetLocator === locator)
    ));
    const groundingOf = (cSet, family, locator) => cSet.find((row) => (
      row.semanticSubruleId === "V-04-SEM-GROUNDING"
      && row.targetFamily === family
      && (locator === undefined || row.targetLocator === locator)
    ));
    const observationByRef = (request) => new Map(
      request.engineSnapshot.engine.observations.map((row) => [row.observationRef, row]),
    );
    const assertExactUseClassAuthorities = (check, qrefs, request, label) => {
      assert.ok(check !== undefined, `${label}: V-21 emitted`);
      const expectedIds = [...new Set(qrefs)].map((qref) => `ENGINE_FACT:${qref}`).sort();
      assert.deepEqual([...check.authorityIds].sort(), expectedIds, `${label}: exact linked UseClass authorities`);
      const catalog = observationByRef(request);
      for (const authority of check.authorities) {
        assert.equal(authority.kind, "ENGINE_FACT", `${label}: authority kind`);
        assert.equal(authority.value, catalog.get(authority.id).useClass, `${label}: ${authority.id} useClass`);
      }
      for (const observation of request.engineSnapshot.engine.observations) {
        if (!qrefs.includes(observation.observationRef)) {
          assert.equal(
            check.authorityIds.includes(`ENGINE_FACT:${observation.observationRef}`),
            false,
            `${label}: unrelated observation ${observation.observationRef} must not attach`,
          );
        }
      }
    };

    // (1) DIRECT CLAIM QREF: CL-002 carries exactly one qref.
    const qrefA = projectionRefs(p5a).qrefA;
    assert.equal(typeof qrefA, "string");
    assert.equal(qrefA.startsWith("qref://"), true);
    assert.deepEqual(p5a.result.claims.find((claim) => claim.claimId === "CL-002").refs, [qrefA]);
    const cSet5a = buildSemanticCheckSet(p5a.request, p5a.result).cSet;
    assertExactUseClassAuthorities(
      v21Of(cSet5a, "CLAIM_TEXT", "claims.CL-002.text"),
      [qrefA],
      p5a.request,
      "direct claim qref CL-002",
    );

    // (2) UNCERTAINTY WITH NON-EMPTY evidenceRefs: missing-evidence and
    // disclosure on P_1B / P_3A / P_4 resolve only that item's qrefs.
    for (const [label, fixture] of [["P_1B", p1b], ["P_3A", p3a], ["P_4", p4]]) {
      const cSet = buildSemanticCheckSet(fixture.request, fixture.result).cSet;
      const missingId = fixture.result.interpretation.missingEvidence[0].uncertaintyIds[0];
      const disclosureId = fixture.result.uncertainty.disclosures[0].uncertaintyId;
      const missingItem = fixture.request.structuredUncertainty.items.find((item) => item.uncertaintyId === missingId);
      const disclosureItem = fixture.request.structuredUncertainty.items.find((item) => item.uncertaintyId === disclosureId);
      assert.ok(missingItem.evidenceRefs.some((ref) => ref.startsWith("qref://")), `${label} missing-evidence item has qrefs`);
      assert.ok(disclosureItem.evidenceRefs.some((ref) => ref.startsWith("qref://")), `${label} disclosure item has qrefs`);
      assertExactUseClassAuthorities(
        v21Of(cSet, "MISSING_EVIDENCE_STATEMENT", "interpretation.missingEvidence[0].statement"),
        missingItem.evidenceRefs.filter((ref) => ref.startsWith("qref://")),
        fixture.request,
        `${label} missing-evidence non-empty evidenceRefs`,
      );
      assertExactUseClassAuthorities(
        v21Of(cSet, "DISCLOSURE_CLIENT_STATEMENT", "uncertainty.disclosures[0].clientStatement"),
        disclosureItem.evidenceRefs.filter((ref) => ref.startsWith("qref://")),
        fixture.request,
        `${label} disclosure non-empty evidenceRefs`,
      );
    }

    // (3)/(4) MISSING EVIDENCE and DISCLOSURE with evidenceRefs=[]: no V-21.
    // Canonical P_2 and P_5X items carry empty evidenceRefs.
    for (const [label, fixture] of [["P_2", p2], ["P_5X", p5x]]) {
      const itemId = fixture.result.uncertainty.disclosures[0].uncertaintyId;
      const item = fixture.request.structuredUncertainty.items.find((row) => row.uncertaintyId === itemId);
      assert.deepEqual(item.evidenceRefs, [], `${label} canonical uncertainty evidenceRefs are empty`);
      assert.deepEqual(fixture.result.interpretation.missingEvidence[0].uncertaintyIds, [itemId]);
      const cSet = buildSemanticCheckSet(fixture.request, fixture.result).cSet;
      assert.equal(v21Of(cSet, "MISSING_EVIDENCE_STATEMENT"), undefined, `${label}: no V-21 on empty-ref missing evidence`);
      assert.equal(v21Of(cSet, "DISCLOSURE_CLIENT_STATEMENT"), undefined, `${label}: no V-21 on empty-ref disclosure`);
      assert.ok(groundingOf(cSet, "MISSING_EVIDENCE_STATEMENT"), `${label}: V-04-SEM-GROUNDING retained on missing evidence`);
      assert.ok(groundingOf(cSet, "DISCLOSURE_CLIENT_STATEMENT"), `${label}: V-04-SEM-GROUNDING retained on disclosure`);
    }

    // (8) CLAIM WITHOUT QREF: factref/uref only. V-21 absent; V-04 grounding remains.
    assert.equal(p5a.result.claims.find((claim) => claim.claimId === "CL-001").refs.every((ref) => !ref.startsWith("qref://")), true);
    assert.equal(v21Of(cSet5a, "CLAIM_TEXT", "claims.CL-001.text"), undefined, "factref-only CL-001 has no V-21");
    assert.ok(groundingOf(cSet5a, "CLAIM_TEXT", "claims.CL-001.text"), "V-04 grounding remains on factref-only claim");
    const cSet1b = buildSemanticCheckSet(p1b.request, p1b.result).cSet;
    const cl004 = p1b.result.claims.find((claim) => claim.claimId === "CL-004");
    assert.ok(cl004.refs.every((ref) => ref.startsWith("uref://")));
    assert.equal(v21Of(cSet1b, "CLAIM_TEXT", "claims.CL-004.text"), undefined, "uref-only CL-004 has no V-21");
    assert.ok(groundingOf(cSet1b, "CLAIM_TEXT", "claims.CL-004.text"), "V-04 grounding remains on uref-only claim");

    // (6) UNRELATED OBSERVATION NEGATIVE CONTROL: empty-ref target plus extra
    // Engine observation must not create a V-21 check (no all-observations fallback).
    assert.ok(p5x.request.engineSnapshot.engine.observations.length > 1, "P_5X already exposes unrelated observations");
    const extraObservationRequest = deepFreezeValue((() => {
      const clone = structuredClone(p5x.request);
      clone.engineSnapshot.engine.observations = [
        ...clone.engineSnapshot.engine.observations,
        { observationRef: "qref://unrelated/extra-observation", useClass: "CONTEXTUAL" },
      ];
      return clone;
    })());
    const extraCSet = buildSemanticCheckSet(extraObservationRequest, p5x.result).cSet;
    assert.equal(v21Of(extraCSet, "MISSING_EVIDENCE_STATEMENT"), undefined, "extra unrelated observation does not make empty-ref missing-evidence V-21-applicable");
    assert.equal(v21Of(extraCSet, "DISCLOSURE_CLIENT_STATEMENT"), undefined, "extra unrelated observation does not make empty-ref disclosure V-21-applicable");
    assert.equal(
      extraCSet.some((row) => row.authorityIds.includes("ENGINE_FACT:qref://unrelated/extra-observation") && row.semanticSubruleId === "V-21-SEM-USECLASS"),
      false,
      "unrelated extra observation is never a V-21 authority",
    );

    // (7) SURVIVING / UNAVAILABLE NEGATIVE CONTROL: package-level collections
    // do not supply V-21 observation links.
    assert.ok(p5x.request.structuredUncertainty.survivingEvidenceRefs.length > 0);
    const unavailableRequest = deepFreezeValue((() => {
      const clone = structuredClone(p5x.request);
      clone.structuredUncertainty.unavailableEvidenceRefs = [qrefA, projectionRefs(p5x).qrefB].filter(Boolean);
      return clone;
    })());
    assert.ok(unavailableRequest.structuredUncertainty.unavailableEvidenceRefs.length > 0);
    const unavailableCSet = buildSemanticCheckSet(unavailableRequest, p5x.result).cSet;
    assert.equal(v21Of(unavailableCSet, "MISSING_EVIDENCE_STATEMENT"), undefined, "unavailableEvidenceRefs do not make empty-ref missing-evidence V-21-applicable");
    assert.equal(v21Of(unavailableCSet, "DISCLOSURE_CLIENT_STATEMENT"), undefined, "unavailableEvidenceRefs do not make empty-ref disclosure V-21-applicable");
    const survivingCSet = buildSemanticCheckSet(p2.request, p2.result).cSet;
    assert.ok(p2.request.structuredUncertainty.survivingEvidenceRefs.length > 0);
    assert.equal(v21Of(survivingCSet, "MISSING_EVIDENCE_STATEMENT"), undefined, "survivingEvidenceRefs do not make empty-ref missing-evidence V-21-applicable");
    assert.equal(v21Of(survivingCSet, "DISCLOSURE_CLIENT_STATEMENT"), undefined, "survivingEvidenceRefs do not make empty-ref disclosure V-21-applicable");

    // (9) DIGEST CONTROL: linked observation UseClass moves V-21 identity;
    // an unrelated observation does not.
    const linkedV21 = v21Of(cSet5a, "CLAIM_TEXT", "claims.CL-002.text");
    const linkedUseClassMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      const observation = clone.engineSnapshot.engine.observations.find((row) => row.observationRef === qrefA);
      observation.useClass = observation.useClass === "PRIMARY" ? "CONTEXTUAL" : "PRIMARY";
      return clone;
    })());
    const afterLinked = v21Of(buildSemanticCheckSet(linkedUseClassMutated, p5a.result).cSet, "CLAIM_TEXT", "claims.CL-002.text");
    assert.notEqual(afterLinked.authoritySetDigest, linkedV21.authoritySetDigest, "linked UseClass change moves authoritySetDigest");
    assert.notEqual(afterLinked.checkId, linkedV21.checkId, "linked UseClass change moves checkId");
    const unrelatedObservation = p5a.request.engineSnapshot.engine.observations.find((row) => row.observationRef !== qrefA);
    assert.ok(unrelatedObservation);
    const unrelatedUseClassMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      const observation = clone.engineSnapshot.engine.observations.find((row) => row.observationRef === unrelatedObservation.observationRef);
      observation.useClass = observation.useClass === "PRIMARY" ? "CONTEXTUAL" : "PRIMARY";
      return clone;
    })());
    const afterUnrelated = v21Of(buildSemanticCheckSet(unrelatedUseClassMutated, p5a.result).cSet, "CLAIM_TEXT", "claims.CL-002.text");
    assert.equal(afterUnrelated.authoritySetDigest, linkedV21.authoritySetDigest, "unrelated observation UseClass does not move V-21 digest");
    assert.equal(afterUnrelated.checkId, linkedV21.checkId, "unrelated observation UseClass does not move V-21 checkId");

    // (10) SHARED-RESOLVER CONTROL: applicability and authority consume the
    // same linked qref set. Detects applicable=true with empty UseClass
    // authorities, and silent skip of a resolved non-empty link.
    for (const [label, fixture] of [["P_5A", p5a], ["P_1B", p1b], ["P_3A", p3a], ["P_4", p4], ["P_5X", p5x], ["P_2", p2]]) {
      const { cSet, tSet } = buildSemanticCheckSet(fixture.request, fixture.result);
      for (const target of tSet) {
        const linked = linkedObservationQrefs(fixture.request, fixture.result, target);
        const check = v21Of(cSet, target.targetFamily, target.targetLocator);
        if (!v21Families.has(target.targetFamily) || linked.length === 0) {
          assert.equal(check, undefined, `${label} ${target.targetLocator}: no link means no V-21`);
          continue;
        }
        assert.ok(check !== undefined, `${label} ${target.targetLocator}: linked qrefs must emit V-21, not skip`);
        assert.ok(check.authorities.length > 0, `${label} ${target.targetLocator}: V-21 never exists with an empty UseClass authority set`);
        assertExactUseClassAuthorities(check, linked, fixture.request, `${label} ${target.targetLocator} shared resolver`);
      }
    }

    // Narrative may use qrefs only from its own derivedFromClaimIds. A qref on
    // an unrelated claim does not make the narrative V-21-applicable.
    const borrowedNarrative = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.clientNarrative.sections[0].derivedFromClaimIds = ["CL-001"];
      return clone;
    })());
    assert.equal(borrowedNarrative.claims.find((claim) => claim.claimId === "CL-001").refs.some((ref) => ref.startsWith("qref://")), false);
    assert.equal(borrowedNarrative.claims.find((claim) => claim.claimId === "CL-002").refs.some((ref) => ref.startsWith("qref://")), true);
    const borrowedCSet = buildSemanticCheckSet(p5a.request, borrowedNarrative).cSet;
    assert.equal(v21Of(borrowedCSet, "NARRATIVE_SECTION_TEXT"), undefined, "narrative does not borrow an unrelated claim qref");
    assert.ok(v21Of(borrowedCSet, "CLAIM_TEXT", "claims.CL-002.text"), "unrelated claim keeps its own V-21");

    // CONFLICTING_EVIDENCE_STATEMENT: own evidenceRefs qrefs only.
    const conflictingResult = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.interpretation.conflictingEvidence = [
        { statement: "A conflicting observation.", evidenceRefs: [qrefA] },
        { statement: "A conflicting row with no observation link.", evidenceRefs: [] },
      ];
      return clone;
    })());
    const conflictingCSet = buildSemanticCheckSet(p5a.request, conflictingResult).cSet;
    assertExactUseClassAuthorities(
      v21Of(conflictingCSet, "CONFLICTING_EVIDENCE_STATEMENT", "interpretation.conflictingEvidence[0].statement"),
      [qrefA],
      p5a.request,
      "conflicting-evidence linked qref",
    );
    assert.equal(
      v21Of(conflictingCSet, "CONFLICTING_EVIDENCE_STATEMENT", "interpretation.conflictingEvidence[1].statement"),
      undefined,
      "empty conflicting evidenceRefs do not emit V-21",
    );

    // A structurally admitted qref that cannot resolve is input-integrity
    // failure, not V-21 inapplicability.
    const unresolvedQrefResult = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[1].refs = ["qref://does-not-resolve/Q99/R1"];
      return clone;
    })());
    try {
      buildSemanticCheckSet(p5a.request, unresolvedQrefResult);
      assert.fail("unresolved linked qref must not degrade into V-21 inapplicability");
    } catch (error) {
      assert.ok(error instanceof SemanticValidationError);
      assert.equal(error.errorKind, "INPUT_PRECONDITION_FAILURE");
    }

    // (5) EMPTY REF + UNSUPPORTED USECLASS TEXT: V-21 absent, V-04 present,
    // mock FAIL on V-04 maps to GROUNDING_VALIDATION_FAILURE.
    const missingUseClassProse = deepFreezeValue((() => {
      const clone = structuredClone(p5x.result);
      clone.interpretation.missingEvidence[0].statement = "The missing evidence is CONTEXTUAL.";
      return clone;
    })());
    const disclosureUseClassProse = deepFreezeValue((() => {
      const clone = structuredClone(p5x.result);
      clone.uncertainty.disclosures[0].clientStatement = "This uncertainty concerns a PRIMARY observation.";
      return clone;
    })());
    for (const [label, result, family, locator] of [
      ["missing-evidence UseClass prose", missingUseClassProse, "MISSING_EVIDENCE_STATEMENT", "interpretation.missingEvidence[0].statement"],
      ["disclosure UseClass prose", disclosureUseClassProse, "DISCLOSURE_CLIENT_STATEMENT", "uncertainty.disclosures[0].clientStatement"],
    ]) {
      const { cSet } = buildSemanticCheckSet(p5x.request, result);
      assert.equal(v21Of(cSet, family, locator), undefined, `${label}: V-21 absent`);
      assert.ok(groundingOf(cSet, family, locator), `${label}: V-04-SEM-GROUNDING present`);
      const failGrounding = createMockSemanticJudge((check) => (
        check.semanticSubruleId === "V-04-SEM-GROUNDING" && check.targetLocator === locator
          ? { verdict: "FAIL" }
          : { verdict: "PASS" }
      ));
      const violation = await assertRejects(
        () => validateAgentInterpretationSemantics({
          agentInterpretationRequest: p5x.request,
          agentInterpretationResult: result,
          semanticJudge: failGrounding,
          maxChecksPerBatch: 20,
        }),
        SemanticViolationError,
        `${label}: mock V-04 FAIL`,
      );
      assert.equal(violation.violationCode, "GROUNDING_VALIDATION_FAILURE", `${label}: canonical semantic violation class`);
    }
  });
}

await main();

console.log("Agent Semantic Validator Core Offline cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
