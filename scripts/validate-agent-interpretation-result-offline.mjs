import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BRANCH_CODES,
  FAILURE_SCHEMA_VERSION,
  OUTPUT_SCHEMA_VERSION,
  PROVIDER_CANDIDATE_SCHEMA_VERSION,
  SYSTEM_FAILURE_CLASSES,
  SYSTEM_FAILURE_CLIENT_DISCLOSURE,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "../src/agent/agentContractConstants.js";
import { canonicalSerialize } from "../src/agent/canonicalDigest.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import { buildProviderPrompt } from "../src/agent/providerPrompt.js";
import { providerSemanticCandidateSchema } from "../src/agent/providerSemanticCandidateSchema.js";
import { executeGeminiProvider } from "../src/agent/providerExecution.js";
import { ProviderExecutionError } from "../src/agent/providerExecutionError.js";
import {
  AgentInterpretationResultValidationError,
  agentInterpretationResultSchema,
  resolveContextRefsUsed,
  systemFailureSchema,
  validateAgentInterpretationResultStructure,
  validateSystemFailureStructure,
} from "../src/agent/agentInterpretationResultSchema.js";
import {
  ResultAssemblyError,
  assembleAgentInterpretationResult,
  mapProviderExecutionErrorToSystemFailure,
  mapResultAssemblyErrorToSystemFailure,
} from "../src/agent/agentInterpretationResult.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { assemblePreCoreSelectorSnapshot } from "../src/agent/preCoreSelectorSnapshot.js";
import {
  buildC5CPreCoreSelectorProvenance,
  buildC5CSelectedSelectorProvenance,
} from "./fixtures/c5c-selected-session.mjs";

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
const SELECTOR = buildC5CSelectedSelectorProvenance();

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput) {
  return {
    diagnosticId: "diag-a3b1",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
  };
}

function requestFor(coreInput) {
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
  });
  const request = buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    interpretationContextPack: pack,
  });
  return { input, coreOutput, snapshot, uncertainty, pack, request };
}

function assemblePreCoreRequest(status) {
  const snapshot = assemblePreCoreSelectorSnapshot({
    identityContext: {
      diagnosticId: `diag-result-pre-core-${status}`,
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
  const projection = projectProviderProjection(request);
  return { snapshot, uncertainty, pack, request, projection };
}

function lawfulPreCoreCandidate(projection) {
  const known = projection.structuredUncertainty.known;
  const fact = (suffix) => known.find((row) => row.factRef.endsWith(suffix))?.factRef;
  const stateFact = fact("/engine/outcome/state") ?? known[0].factRef;
  const pairFact = fact("/identity/candidatePair") ?? stateFact;
  const comparatorFact = fact("/engine/outcome/suppression/comparatorDidNotRun") ?? stateFact;
  const uncertaintyId = projection.structuredUncertainty.items[0].uncertaintyId;
  return {
    interpretationStatus: "SELECTOR_BOUNDARY_EXPLANATION",
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
      disclosures: [{
        uncertaintyId,
        affects: "STATE_IDENTITY",
        clientStatement: "The selector did not establish a deterministic Environment pair from the current admissible signals.",
        unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
      }],
    },
    claims: [
      {
        claimId: "CL-PC-001",
        claimType: "DETERMINISTIC_FACT",
        text: "The engine did not establish a deterministic state identity, no candidate pair was established, and the comparator did not run.",
        refs: [stateFact, pairFact, comparatorFact],
        contextRefs: [],
      },
      {
        claimId: "CL-PC-002",
        claimType: "UNCERTAINTY_DISCLOSURE",
        text: "Selector-boundary uncertainty remains because the current signals could not lawfully finalise a pair.",
        refs: [`uref://${uncertaintyId}`],
        contextRefs: [],
      },
      {
        claimId: "CL-PC-003",
        claimType: "SCOPE_LIMITATION_DISCLOSURE",
        text: "This result explains only the current knowledge boundary and does not interpret the organization.",
        refs: [],
        contextRefs: [],
      },
    ],
    clientNarrative: {
      language: "en",
      sections: [{
        sectionId: "S-PC-001",
        text: "The engine did not establish a deterministic state identity, no candidate pair was established, and the comparator did not run. Selector-boundary uncertainty remains because the current signals could not lawfully finalise a pair. This result explains only the current knowledge boundary and does not interpret the organization.",
        derivedFromClaimIds: ["CL-PC-001", "CL-PC-002", "CL-PC-003"],
      }],
    },
  };
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
};

// ---------------------------------------------------------------------------
// Lawful candidate fixture (same construction as the upstream validators)
// ---------------------------------------------------------------------------

function projectionRefs(projection) {
  return {
    qrefA: projection.structuredUncertainty.survivingEvidenceRefs[0] ?? null,
    qrefB: projection.structuredUncertainty.survivingEvidenceRefs[1] ?? null,
    factref: projection.structuredUncertainty.known[0]?.factRef ?? null,
    mref: projection.interpretationContextPack.selectedContextItems[0]?.contextRef ?? null,
    uncertaintyId: projection.structuredUncertainty.items[0]?.uncertaintyId ?? null,
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

function lawfulCandidate(projection, overrides = {}) {
  const refs = projectionRefs(projection);
  const caseB = projection.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  const candidate = {
    interpretationStatus: projection.structuredUncertainty.originBranch === "P_1B"
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
        { sectionId: "headline", text: "A bounded headline rendered from the established claims.", derivedFromClaimIds: ["CL-001"] },
        { sectionId: "situation", text: "A cohesive explanation of the observed operating interaction.", derivedFromClaimIds: ["CL-001", "CL-002"] },
        { sectionId: "implication", text: "Why the supported interaction matters for integration decisions.", derivedFromClaimIds: ["CL-006"] },
      ],
    },
  };
  return deepMerge(candidate, overrides);
}

// ---------------------------------------------------------------------------
// Offline execution helper — mocked transport only
// ---------------------------------------------------------------------------

const TEST_CREDENTIAL = "offline-test-credential";
const OBSERVED_MODEL_VERSION = "models/gemini-3.7-flash-RC";
const OBSERVED_REQUEST_ID = "req-offline-result";

async function offlineExecutionFor(projection, candidate) {
  const prompt = buildProviderPrompt(projection);
  const candidateJson = JSON.stringify(candidate, null, 2);
  const impl = async () => ({
    status: 200,
    headers: {
      get: (name) => (String(name).toLowerCase() === "x-request-id" ? OBSERVED_REQUEST_ID : null),
    },
    json: async () => ({
      candidates: [{
        content: { parts: [{ text: candidateJson }] },
        finishReason: "STOP",
      }],
      modelVersion: OBSERVED_MODEL_VERSION,
    }),
  });
  const output = await executeGeminiProvider(
    { providerProjection: projection, prompt },
    { fetchImpl: impl, credentialReader: () => TEST_CREDENTIAL },
  );
  return output;
}

async function assembledFixture(coreInput, candidateOverrides = {}) {
  const upstream = requestFor(coreInput);
  const projection = projectProviderProjection(upstream.request);
  const candidate = lawfulCandidate(projection, candidateOverrides);
  const output = await offlineExecutionFor(projection, candidate);
  const result = assembleAgentInterpretationResult({
    agentInterpretationRequest: upstream.request,
    providerExecutionOutput: output,
  });
  return { ...upstream, projection, candidate, output, result };
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const results = [];
async function check(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

function captureSyncRejection(fn, expectedErrorClass) {
  let caught = null;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  assert.ok(
    caught instanceof expectedErrorClass,
    `expected ${expectedErrorClass.name}, got ${caught?.constructor?.name ?? "no error"}: ${caught?.message ?? ""}`,
  );
  return caught;
}

async function captureAsyncRejection(fn, expectedErrorClass) {
  let caught = null;
  try {
    await fn();
  } catch (error) {
    caught = error;
  }
  assert.ok(
    caught instanceof expectedErrorClass,
    `expected ${expectedErrorClass.name}, got ${caught?.constructor?.name ?? "no error"}: ${caught?.message ?? ""}`,
  );
  return caught;
}

async function assembleRejected({ request, output }, expectedFailureClass) {
  const caught = await captureAsyncRejection(
    () => assembleAgentInterpretationResult({
      agentInterpretationRequest: request,
      providerExecutionOutput: output,
    }),
    ResultAssemblyError,
  );
  assert.equal(caught.failureClass, expectedFailureClass, caught.message);
  return caught;
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

function allKeysAnywhere(value, into = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) allKeysAnywhere(item, into);
    return into;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      into.add(key);
      allKeysAnywhere(child, into);
    }
  }
  return into;
}

function assertDeepFrozen(value, label) {
  if (value === null || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true, `${label} must be frozen`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDeepFrozen(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${label}.${key}`);
}

function collectObjectGraph(value, into = new Set()) {
  if (value !== null && typeof value === "object") {
    into.add(value);
    for (const child of Object.values(value)) collectObjectGraph(child, into);
  }
  return into;
}

function assertNoSharedIdentity(fresh, sourceGraph, label) {
  if (fresh !== null && typeof fresh === "object") {
    assert.equal(sourceGraph.has(fresh), false, `${label} shares object identity with the source graph`);
    for (const [key, child] of Object.entries(fresh)) {
      assertNoSharedIdentity(child, sourceGraph, `${label}.${key}`);
    }
  }
}

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function main() {
  const p5a = await assembledFixture(P5A_INPUT);
  const p1b = await assembledFixture(P1B_INPUT);

  // --- Schema / constants --------------------------------------------------

  await check("RA0", "exact canonical constants and closed frozen schemas", () => {
    assert.equal(FAILURE_SCHEMA_VERSION, "system-failure-1.0");
    assert.equal(OUTPUT_SCHEMA_VERSION, "agent-result-1.6");
    assert.deepEqual([...SYSTEM_FAILURE_CLASSES], [
      "PROVIDER_UNAVAILABLE",
      "PROVIDER_TIMEOUT",
      "RESPONSE_MALFORMED",
      "OUTPUT_SCHEMA_VIOLATION",
      "UNRESOLVABLE_REFERENCE",
      "GROUNDING_VALIDATION_FAILURE",
      "PROHIBITED_CLAIM_VIOLATION",
      "ENGINE_FACT_MUTATION_DETECTED",
      "CONTRACT_VERSION_MISMATCH",
      "INPUT_ASSEMBLY_FAILURE",
      "CONSTRAINT_ENFORCEMENT_FAILURE",
    ]);
    for (const [failureClass, retryable] of Object.entries(SYSTEM_FAILURE_RETRYABLE_BY_CLASS)) {
      assert.equal(typeof retryable, "boolean", failureClass);
      const expectedTrue = [
        "PROVIDER_UNAVAILABLE",
        "PROVIDER_TIMEOUT",
        "RESPONSE_MALFORMED",
        "OUTPUT_SCHEMA_VIOLATION",
        "UNRESOLVABLE_REFERENCE",
        "GROUNDING_VALIDATION_FAILURE",
        "PROHIBITED_CLAIM_VIOLATION",
      ];
      assert.equal(retryable, expectedTrue.includes(failureClass), failureClass);
    }
    assert.equal(SYSTEM_FAILURE_CLIENT_DISCLOSURE, "SYSTEM_LEVEL_ONLY");

    assert.equal(agentInterpretationResultSchema.$id, "agent-result-1.6");
    assert.equal(systemFailureSchema.$id, "system-failure-1.0");
    assert.equal(Object.isFrozen(agentInterpretationResultSchema), true);
    assert.equal(Object.isFrozen(systemFailureSchema), true);
    assert.equal(agentInterpretationResultSchema.additionalProperties, false);
    assert.equal(systemFailureSchema.additionalProperties, false);
    assert.deepEqual([...agentInterpretationResultSchema.required], [
      "resultSchemaVersion",
      "agentContractVersion",
      "interpretationId",
      "engineFactsRef",
      "interpretationStatus",
      "abstentionReason",
      "interpretation",
      "uncertainty",
      "claims",
      "clientNarrative",
      "provenance",
    ]);
    assert.deepEqual([...systemFailureSchema.required], [
      "failureSchemaVersion",
      "interpretationId",
      "diagnosticId",
      "engineSnapshotDigest",
      "failureClass",
      "retryable",
      "detail",
      "occurredAt",
      "clientDisclosure",
    ]);

    // Recursive structural closure of every fixed object node.
    const walk = (node) => {
      if (node === null || typeof node !== "object") return;
      if (Object.hasOwn(node, "$ref")) {
        walk(agentInterpretationResultSchema.definitions[node.$ref.slice("#/definitions/".length)]);
        return;
      }
      if (node.type === "object") {
        assert.equal(node.additionalProperties, false, JSON.stringify(node.required ?? node));
        for (const child of Object.values(node.properties ?? {})) walk(child);
        return;
      }
      if (node.type === "array") {
        walk(node.items);
        return;
      }
      assert.notEqual(node.type, "number", "no numeric value fields are admitted");
    };
    walk(agentInterpretationResultSchema);
    walk(systemFailureSchema);

    const schemaKeys = allKeysAnywhere(agentInterpretationResultSchema.properties);
    for (const forbidden of [
      "executionAttemptId",
      "attemptNumber",
      "transportStatus",
      "durationMs",
      "promptVersion",
      "providerProjectionVersion",
      "requestId",
      "finishReason",
      "tokenUsage",
      "safetyRatings",
      "contextPackId",
    ]) {
      assert.equal(schemaKeys.has(forbidden), false, forbidden);
    }

    // Provider-authored subtrees are the closed candidate schema nodes
    // themselves — no second copy of the candidate shape exists.
    assert.equal(
      Object.is(agentInterpretationResultSchema.properties.claims, providerSemanticCandidateSchema.properties.claims),
      true,
    );
    assert.equal(
      Object.is(agentInterpretationResultSchema.properties.interpretation, providerSemanticCandidateSchema.properties.interpretation),
      true,
    );
    assert.equal(PROVIDER_CANDIDATE_SCHEMA_VERSION, "provider-semantic-candidate-1.4");
  });

  // --- Success assembly / mirrors -------------------------------------------

  await check("RA1", "exact request→result identity and engine-fact restoration (incl. null state)", () => {
    for (const fixture of [p5a, p1b]) {
      const { request, result } = fixture;
      assert.deepEqual(Object.keys(result).sort(), [
        "abstentionReason",
        "agentContractVersion",
        "claims",
        "clientNarrative",
        "engineFactsRef",
        "interpretation",
        "interpretationId",
        "interpretationStatus",
        "provenance",
        "resultSchemaVersion",
        "uncertainty",
      ]);
      assert.equal(result.resultSchemaVersion, request.outputSchemaVersion);
      assert.equal(result.resultSchemaVersion, "agent-result-1.6");
      assert.equal(result.agentContractVersion, request.agentContractVersion);
      assert.equal(result.interpretationId, request.interpretationId);
      assert.equal(result.engineFactsRef.diagnosticId, request.engineSnapshot.identity.diagnosticId);
      assert.equal(result.engineFactsRef.engineSnapshotDigest, request.engineSnapshot.engineSnapshotDigest);
      assert.equal(result.engineFactsRef.engineOutcomeCode, request.engineSnapshot.engine.outcome.engineOutcomeCode);
      assert.equal(result.engineFactsRef.branchCode, request.engineSnapshot.engine.outcome.branchCode);
      assert.equal(result.engineFactsRef.stateAsserted, request.engineSnapshot.engine.outcome.state);
    }
    assert.equal(p5a.result.engineFactsRef.stateAsserted, "① CONVERGENT");
    assert.equal(p1b.result.engineFactsRef.stateAsserted, null);
    assert.equal(p1b.request.engineSnapshot.engine.outcome.state, null);
    assert.ok(BRANCH_CODES.includes(p1b.result.engineFactsRef.branchCode));
  });

  await check("RA2", "provider candidate owns only semantic fields; engine mirrors are wrapper-owned", async () => {
    for (const fixture of [p5a, p1b]) {
      const { candidate, result, request } = fixture;
      assert.equal(result.interpretationStatus, candidate.interpretationStatus);
      assert.equal(result.abstentionReason, candidate.abstentionReason);
      assert.deepEqual(
        JSON.parse(JSON.stringify(result.interpretation)),
        JSON.parse(JSON.stringify(candidate.interpretation)),
      );
      assert.deepEqual(
        JSON.parse(JSON.stringify(result.uncertainty.disclosures)),
        JSON.parse(JSON.stringify(candidate.uncertainty.disclosures)),
      );
      assert.deepEqual(JSON.parse(JSON.stringify(result.claims)), JSON.parse(JSON.stringify(candidate.claims)));
      assert.deepEqual(
        JSON.parse(JSON.stringify(result.clientNarrative)),
        JSON.parse(JSON.stringify(candidate.clientNarrative)),
      );
      assert.equal(
        result.uncertainty.materialUncertaintyPresent,
        request.structuredUncertainty.materialUncertaintyPresent,
      );
      assert.equal(allKeysAnywhere(candidate).has("materialUncertaintyPresent"), false);
    }

    // A candidate cannot smuggle engine-owned fields into the result.
    const smuggled = structuredClone(p5a.candidate);
    smuggled.engineFactsRef = { diagnosticId: "forged", engineSnapshotDigest: "sha256:x", branchCode: "P_5B", stateAsserted: null };
    await assembleRejected(
      { request: p5a.request, output: { candidate: deepFreezeValue(smuggled), executionMetadata: p5a.output.executionMetadata } },
      "OUTPUT_SCHEMA_VIOLATION",
    );
  });

  await check("RA3", "withheld outputs project 1:1 in order with no reconstruction", () => {
    assert.ok(p1b.request.structuredUncertainty.withheldOutputs.length > 0, "P_1 fixture carries withheld outputs");
    const withheld = p1b.request.structuredUncertainty.withheldOutputs;
    const suppressed = p1b.result.uncertainty.suppressedDeterministicOutputs;
    assert.equal(suppressed.length, withheld.length);
    withheld.forEach((row, index) => {
      assert.equal(suppressed[index].withheldItem, row.withheldItem);
      assert.equal(suppressed[index].withheldBy, row.withheldBy);
      assert.deepEqual(Object.keys(suppressed[index]).sort(), ["withheldBy", "withheldItem"]);
    });
    const resultBytes = canonicalSerialize(p1b.result);
    for (const row of withheld) {
      assert.equal(resultBytes.includes(row.engineOutputText), false, "withheld engine text must not be reconstructed");
    }
    assert.equal(p5a.request.structuredUncertainty.withheldOutputs.length, 0);
    assert.deepEqual(p5a.result.uncertainty.suppressedDeterministicOutputs, []);
  });

  await check("RA4", "provenance: trusted execution identity only; operational metadata excluded", () => {
    const { result, output } = p5a;
    const metadata = output.executionMetadata;
    assert.deepEqual(Object.keys(result.provenance).sort(), [
      "contextRefsUsed",
      "executedAt",
      "modelIdentity",
      "providerIdentity",
    ]);
    assert.equal(result.provenance.providerIdentity, metadata.provider);
    assert.equal(result.provenance.providerIdentity, "gemini");
    assert.equal(result.provenance.modelIdentity, metadata.model);
    assert.equal(result.provenance.modelIdentity, "gemini-3.7-flash");
    assert.equal(result.provenance.executedAt, metadata.executedAt);
    assert.notEqual(metadata.observedProvider.modelVersion, result.provenance.modelIdentity);
    const resultBytes = canonicalSerialize(result);
    assert.equal(resultBytes.includes(OBSERVED_MODEL_VERSION), false, "observed model identity must not enter the result");
    assert.equal(resultBytes.includes(OBSERVED_REQUEST_ID), false, "provider request id must not enter the result");
    assert.equal(resultBytes.includes(metadata.executionAttemptId), false, "executionAttemptId must not enter the result");
    // attemptNumber/transportStatus/durationMs are valueless as substrings
    // (digits appear lawfully in refs); their exclusion is structural — no
    // such key is authorable anywhere in the result schema (asserted in RA0).
    const resultKeyNames = allKeysAnywhere(result);
    for (const forbidden of ["attemptNumber", "transportStatus", "durationMs", "observedProvider"]) {
      assert.equal(resultKeyNames.has(forbidden), false, forbidden);
    }
  });

  // --- contextRefsUsed -------------------------------------------------------

  await check("RA5", "contextRefsUsed: claim-level mref→contextItemId, stable first appearance", async () => {
    const items = p5a.request.interpretationContextPack.selectedContextItems;
    const mrefA = items[0].contextRef;
    const idA = items[0].contextItemId;
    const mrefB = items[1].contextRef;
    const idB = items[1].contextItemId;
    assert.notEqual(mrefA, mrefB);

    // Default lawful candidate: two claims cite the same mref → one id.
    assert.deepEqual(p5a.result.provenance.contextRefsUsed, [idA]);
    for (const id of p5a.result.provenance.contextRefsUsed) {
      assert.equal(id.startsWith("CI-"), true, `ids are sealed contextItemIds, not mrefs: ${id}`);
      assert.equal(id.includes("mref://"), false);
    }

    // Duplicate mrefs across claims collapse to one distinct id.
    assert.deepEqual(
      resolveContextRefsUsed(
        [{ contextRefs: [mrefA] }, { contextRefs: [mrefA] }, { contextRefs: [] }],
        items,
      ),
      [idA],
    );

    // First-appearance order follows claim order, not pack order.
    assert.deepEqual(
      resolveContextRefsUsed([{ contextRefs: [mrefB] }, { contextRefs: [mrefA] }], items),
      [idB, idA],
    );

    // Two different mrefs may resolve to the same contextItemId → still one id.
    assert.deepEqual(
      resolveContextRefsUsed(
        [{ contextRefs: ["mref://synth/a", "mref://synth/b"] }],
        [
          { contextItemId: "CI-001", contextRef: "mref://synth/a" },
          { contextItemId: "CI-001", contextRef: "mref://synth/b" },
        ],
      ),
      ["CI-001"],
    );

    // Only claim-level contextRefs participate: a watchpoint-only mref is not
    // provenance unless a claim also cites it.
    const watchpointOnly = await assembledFixture(P5A_INPUT, {
      interpretation: {
        watchpoints: [{ statement: "A watchpoint.", horizon: "6m", contextRefs: [mrefB], evidenceRefs: [projectionRefs(p5a.projection).qrefA] }],
      },
    });
    assert.deepEqual(watchpointOnly.result.provenance.contextRefsUsed, [idA]);

    // Empty claim-level context usage is lawful.
    const refs = projectionRefs(p5a.projection);
    const noContextClaims = lawfulCandidate(p5a.projection, {
      claims: [
        { claimId: "CL-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
        { claimId: "CL-002", claimType: "DIRECT_EVIDENCE", text: "A respondent supplied a directly observed answer.", refs: [refs.qrefA], contextRefs: [] },
        { claimId: "CL-006", claimType: "SCOPE_LIMITATION_DISCLOSURE", text: "A MergeVue-specific reading was not offered.", refs: [], contextRefs: [] },
      ],
    });
    const noContextOutput = await offlineExecutionFor(p5a.projection, noContextClaims);
    const noContextResult = assembleAgentInterpretationResult({
      agentInterpretationRequest: p5a.request,
      providerExecutionOutput: noContextOutput,
    });
    assert.deepEqual(noContextResult.provenance.contextRefsUsed, []);

    // Unresolved mref fails closed at assembly with its canonical class.
    const unresolvedCandidate = (() => {
      const clone = structuredClone(p5a.candidate);
      clone.claims[2].contextRefs = ["mref://not/in/pack"];
      return deepFreezeValue(clone);
    })();
    await assembleRejected(
      { request: p5a.request, output: { candidate: unresolvedCandidate, executionMetadata: p5a.output.executionMetadata } },
      "UNRESOLVABLE_REFERENCE",
    );

    // Ambiguous exact-contextRef match is unresolvable.
    const ambiguousItems = [
      { contextItemId: "CI-001", contextRef: "mref://synth/x" },
      { contextItemId: "CI-002", contextRef: "mref://synth/x" },
    ];
    const ambiguous = captureSyncRejection(
      () => resolveContextRefsUsed([{ contextRefs: ["mref://synth/x"] }], ambiguousItems),
      AgentInterpretationResultValidationError,
    );
    assert.equal(ambiguous.failureClass, "UNRESOLVABLE_REFERENCE");

    // Wrong reference namespace is a mechanical grounding failure.
    const namespace = captureSyncRejection(
      () => resolveContextRefsUsed([{ contextRefs: ["xref://wrong"] }], items),
      AgentInterpretationResultValidationError,
    );
    assert.equal(namespace.failureClass, "GROUNDING_VALIDATION_FAILURE");

    // Claim order visible in ids through the full assembly chain.
    const reordered = await assembledFixture(P5A_INPUT, {
      claims: [
        { claimId: "CL-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
        {
          claimId: "CL-003",
          claimType: "BOUNDED_INTERPRETATION",
          text: "A bounded organizational reading of the supplied evidence.",
          refs: [refs.qrefA],
          contextRefs: [mrefB],
        },
        {
          claimId: "CL-005",
          claimType: "WATCHPOINT",
          text: "A friction-related watchpoint.",
          refs: [refs.qrefA],
          contextRefs: [mrefA],
        },
      ],
      clientNarrative: {
        language: "en",
        sections: [
          { sectionId: "headline", text: "A headline rendered from the reordered claims.", derivedFromClaimIds: ["CL-001"] },
          { sectionId: "situation", text: "A situation rendered from the reordered claims.", derivedFromClaimIds: ["CL-003"] },
          { sectionId: "implication", text: "An implication rendered from the reordered claims.", derivedFromClaimIds: ["CL-005"] },
        ],
      },
    });
    assert.deepEqual(reordered.result.provenance.contextRefsUsed, [idB, idA]);
  });

  // --- Case A / Case B / P_1B ------------------------------------------------

  await check("RA6", "Case A closure and P_1B mechanical guards", () => {
    // Synthetic Case A representation (canonical packs always select context,
    // so Case A is representable only synthetically — same precedent as the
    // upstream boundary validator). Used with the standalone structural gate.
    const caseARequest = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      clone.permittedOutputScope = "FACTUAL_EXPLANATION_ONLY";
      clone.permittedInterpretationDomains = [];
      return clone;
    })());
    const refs = projectionRefs(p5a.projection);
    const caseABase = () => deepFreezeValue({
      resultSchemaVersion: caseARequest.outputSchemaVersion,
      agentContractVersion: caseARequest.agentContractVersion,
      interpretationId: caseARequest.interpretationId,
      engineFactsRef: {
        diagnosticId: caseARequest.engineSnapshot.identity.diagnosticId,
        engineSnapshotDigest: caseARequest.engineSnapshot.engineSnapshotDigest,
        engineOutcomeCode: caseARequest.engineSnapshot.engine.outcome.engineOutcomeCode,
        branchCode: caseARequest.engineSnapshot.engine.outcome.branchCode,
        stateAsserted: caseARequest.engineSnapshot.engine.outcome.state,
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
        materialUncertaintyPresent: caseARequest.structuredUncertainty.materialUncertaintyPresent,
        disclosures: [],
        suppressedDeterministicOutputs: [],
      },
      claims: [
        { claimId: "CL-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
        { claimId: "CL-002", claimType: "DIRECT_EVIDENCE", text: "A respondent supplied a directly observed answer.", refs: [refs.qrefA], contextRefs: [] },
      ],
      clientNarrative: { language: "en", sections: [] },
      provenance: {
        providerIdentity: "gemini",
        modelIdentity: "gemini-3.7-flash",
        executedAt: p5a.output.executionMetadata.executedAt,
        contextRefsUsed: [],
      },
    });

    assert.doesNotThrow(() => validateAgentInterpretationResultStructure(caseARequest, caseABase()));

    // Case B structured sections may not be manufactured under Case A. The
    // provenance stays internally consistent so the rejection comes from the
    // Case A structural route itself, not from a resolution mismatch.
    const withWatchpointClaim = caseABase();
    const mutable = structuredClone(withWatchpointClaim);
    mutable.claims.push({
      claimId: "CL-005",
      claimType: "WATCHPOINT",
      text: "A manufactured watchpoint.",
      refs: [refs.qrefA],
      contextRefs: [p5a.request.interpretationContextPack.selectedContextItems[0].contextRef],
    });
    mutable.provenance.contextRefsUsed = [
      p5a.request.interpretationContextPack.selectedContextItems[0].contextItemId,
    ];
    const prohibitedClaim = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(caseARequest, deepFreezeValue(mutable)),
      AgentInterpretationResultValidationError,
    );
    assert.equal(prohibitedClaim.failureClass, "PROHIBITED_CLAIM_VIOLATION");

    const withTransition = caseABase();
    const mutableTransition = structuredClone(withTransition);
    mutableTransition.interpretation.transitionPattern = {
      label: "Manufactured transition.",
      evidenceBasis: PLAIN_EVIDENCE_BASIS,
      evidenceRefs: [refs.qrefA],
      factRefs: [refs.factref],
      contextRefs: [],
    };
    const prohibitedSection = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(caseARequest, deepFreezeValue(mutableTransition)),
      AgentInterpretationResultValidationError,
    );
    assert.equal(prohibitedSection.failureClass, "PROHIBITED_CLAIM_VIOLATION");

    // P_1: withheld deterministic text remains unavailable in the Result.
    const p1bResult = p1b.result;
    for (const item of p1bResult.interpretation.hypotheses.items) {
      assert.deepEqual(item.requiresEngineFactNotEstablished, []);
    }
    const p1bBytes = canonicalSerialize(p1bResult);
    for (const row of p1b.request.structuredUncertainty.withheldOutputs) {
      assert.equal(p1bBytes.includes(row.engineOutputText), false);
    }
  });

  // --- Immutability / determinism ---------------------------------------------

  await check("RA7", "inputs unchanged; result frozen; no identity sharing; deterministic success", async () => {
    const requestBefore = canonicalSerialize(p5a.request);
    const outputBefore = canonicalSerialize(p5a.output);
    const candidateBefore = canonicalSerialize(p5a.candidate);

    const second = assembleAgentInterpretationResult({
      agentInterpretationRequest: p5a.request,
      providerExecutionOutput: p5a.output,
    });

    assert.equal(canonicalSerialize(p5a.request), requestBefore);
    assert.equal(canonicalSerialize(p5a.output), outputBefore);
    assert.equal(canonicalSerialize(p5a.candidate), candidateBefore);
    assertDeepFrozen(p5a.request, "request");
    assertDeepFrozen(p5a.output, "output");

    assertDeepFrozen(second, "result");
    assert.notEqual(second, p5a.candidate);
    const candidateGraph = collectObjectGraph(p5a.candidate);
    assertNoSharedIdentity(second, candidateGraph, "result");
    const metadataGraph = collectObjectGraph(p5a.output.executionMetadata);
    assertNoSharedIdentity(second, metadataGraph, "result");

    assert.equal(canonicalSerialize(second), canonicalSerialize(p5a.result));

    const source = readFileSync(new URL("../src/agent/agentInterpretationResult.js", import.meta.url), "utf8");
    assert.equal(source.includes("randomUUID"), false, "success assembly must not mint identities");
    assert.equal((source.match(/new Date\(/g) ?? []).length, 1, "the only clock use is SystemFailure materialization");
  });

  // --- Provider execution failure → SystemFailure ------------------------------

  await check("RA8", "all eight execution classes map canonically with canonical retryability", () => {
    const request = p5a.request;
    const cases = [
      ["PROVIDER_CONFIGURATION_FAILURE", "PROVIDER_UNAVAILABLE"],
      ["PROVIDER_AUTH_FAILURE", "PROVIDER_UNAVAILABLE"],
      ["PROVIDER_RATE_LIMIT", "PROVIDER_UNAVAILABLE"],
      ["PROVIDER_TRANSPORT_FAILURE", "PROVIDER_UNAVAILABLE"],
      ["PROVIDER_HTTP_FAILURE", "PROVIDER_UNAVAILABLE"],
      ["PROVIDER_TIMEOUT", "PROVIDER_TIMEOUT"],
      ["PROVIDER_RESPONSE_PARSE_FAILURE", "RESPONSE_MALFORMED"],
      ["PROVIDER_STRUCTURAL_CANDIDATE_FAILURE", "OUTPUT_SCHEMA_VIOLATION"],
    ];
    for (const [executionClass, canonicalClass] of cases) {
      const error = new ProviderExecutionError({
        failureClass: executionClass,
        detail: `offline ${executionClass}`,
        retryable: false,
        executionAttemptId: "attempt-must-not-travel",
      });
      const failure = mapProviderExecutionErrorToSystemFailure({
        agentInterpretationRequest: request,
        providerExecutionError: error,
      });
      assert.equal(failure.failureClass, canonicalClass, executionClass);
      assert.equal(failure.retryable, true, `${canonicalClass} is canonically retryable`);
      assert.equal(failure.detail, `offline ${executionClass}`);
      assert.equal(failure.interpretationId, request.interpretationId);
      assert.equal(failure.diagnosticId, request.engineSnapshot.identity.diagnosticId);
      assert.equal(failure.engineSnapshotDigest, request.engineSnapshot.engineSnapshotDigest);
      assert.equal(failure.failureSchemaVersion, "system-failure-1.0");
      assert.equal(failure.clientDisclosure, "SYSTEM_LEVEL_ONLY");
      assert.equal(ISO_8601.test(failure.occurredAt), true, "locally generated ISO-8601 occurredAt");
      assert.notEqual(failure.failureClass, "ABSTAINED_INSUFFICIENT_EVIDENCE");
      assert.equal(canonicalSerialize(failure).includes("attempt-must-not-travel"), false);
      assertDeepFrozen(failure, "systemFailure");
      validateSystemFailureStructure(failure);
    }

    // Misleading detail text never selects the class.
    const misleading = mapProviderExecutionErrorToSystemFailure({
      agentInterpretationRequest: request,
      providerExecutionError: new ProviderExecutionError({
        failureClass: "PROVIDER_CONFIGURATION_FAILURE",
        detail: "PROVIDER_TIMEOUT RESPONSE_MALFORMED OUTPUT_SCHEMA_VIOLATION",
      }),
    });
    assert.equal(misleading.failureClass, "PROVIDER_UNAVAILABLE");

    // Non-ProviderExecutionError input fails closed instead of fabricating.
    captureSyncRejection(
      () => mapProviderExecutionErrorToSystemFailure({
        agentInterpretationRequest: request,
        providerExecutionError: new Error("not an execution error"),
      }),
      ResultAssemblyError,
    );

    // Mapping is a pure materialization — repeated mapping never re-invokes
    // anything and only the trusted local clock differs.
    const first = mapProviderExecutionErrorToSystemFailure({
      agentInterpretationRequest: request,
      providerExecutionError: new ProviderExecutionError({ failureClass: "PROVIDER_TIMEOUT", detail: "d" }),
    });
    const second = mapProviderExecutionErrorToSystemFailure({
      agentInterpretationRequest: request,
      providerExecutionError: new ProviderExecutionError({ failureClass: "PROVIDER_TIMEOUT", detail: "d" }),
    });
    assert.equal(second.failureClass, first.failureClass);
    assert.equal(second.occurredAt >= first.occurredAt, true);
  });

  // --- Result assembly mechanical failures --------------------------------------

  await check("RA9", "mechanical assembly failures classify canonically and map to SystemFailure", async () => {
    // Contract version mismatch.
    const versionTampered = deepFreezeValue((() => {
      const clone = structuredClone(p5a.request);
      clone.outputSchemaVersion = "agent-result-1.0";
      return clone;
    })());
    const contract = await assembleRejected(
      { request: versionTampered, output: p5a.output },
      "CONTRACT_VERSION_MISMATCH",
    );
    const contractFailure = mapResultAssemblyErrorToSystemFailure({
      agentInterpretationRequest: p5a.request,
      resultAssemblyError: contract,
    });
    assert.equal(contractFailure.failureClass, "CONTRACT_VERSION_MISMATCH");
    assert.equal(contractFailure.retryable, false);

    // Input assembly failure.
    const inputFailure = await assembleRejected(
      { request: p5a.request, output: { candidate: p5a.candidate } },
      "INPUT_ASSEMBLY_FAILURE",
    );
    assert.equal(
      mapResultAssemblyErrorToSystemFailure({
        agentInterpretationRequest: p5a.request,
        resultAssemblyError: inputFailure,
      }).failureClass,
      "INPUT_ASSEMBLY_FAILURE",
    );

    // Unresolved reference maps canonically.
    const unresolvedCandidate = (() => {
      const clone = structuredClone(p5a.candidate);
      clone.claims[2].contextRefs = ["mref://still/not/in/pack"];
      return deepFreezeValue(clone);
    })();
    const unresolved = await assembleRejected(
      { request: p5a.request, output: { candidate: unresolvedCandidate, executionMetadata: p5a.output.executionMetadata } },
      "UNRESOLVABLE_REFERENCE",
    );
    assert.equal(
      mapResultAssemblyErrorToSystemFailure({
        agentInterpretationRequest: p5a.request,
        resultAssemblyError: unresolved,
      }).retryable,
      true,
    );

    // Mechanical grounding: wrong claim reference namespace — structure only.
    const wrongNamespace = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.claims[0].refs = ["xref://wrong-namespace"];
      return clone;
    })());
    const grounding = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(p5a.request, wrongNamespace),
      AgentInterpretationResultValidationError,
    );
    assert.equal(grounding.failureClass, "GROUNDING_VALIDATION_FAILURE");

    // Engine fact mutation: exact mechanical contradiction.
    const stateMutated = deepFreezeValue((() => {
      const clone = structuredClone(p1b.result);
      clone.engineFactsRef.stateAsserted = "① CONVERGENT";
      return clone;
    })());
    const mutation = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(p1b.request, stateMutated),
      AgentInterpretationResultValidationError,
    );
    assert.equal(mutation.failureClass, "ENGINE_FACT_MUTATION_DETECTED");

    const digestMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.engineFactsRef.engineSnapshotDigest = `sha256:${"0".repeat(64)}`;
      return clone;
    })());
    const digestMutation = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(p5a.request, digestMutated),
      AgentInterpretationResultValidationError,
    );
    assert.equal(digestMutation.failureClass, "ENGINE_FACT_MUTATION_DETECTED");

    // Structural rank law.
    const rankMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.interpretation.hypotheses.items[0].rank = 1;
      return clone;
    })());
    const rankViolation = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(p5a.request, rankMutated),
      AgentInterpretationResultValidationError,
    );
    assert.equal(rankViolation.failureClass, "OUTPUT_SCHEMA_VIOLATION");

    // contextRefsUsed divergence is detected mechanically.
    const provenanceMutated = deepFreezeValue((() => {
      const clone = structuredClone(p5a.result);
      clone.provenance.contextRefsUsed = [p5a.request.interpretationContextPack.selectedContextItems[1].contextItemId];
      return clone;
    })());
    const provenanceViolation = captureSyncRejection(
      () => validateAgentInterpretationResultStructure(p5a.request, provenanceMutated),
      AgentInterpretationResultValidationError,
    );
    assert.equal(provenanceViolation.failureClass, "GROUNDING_VALIDATION_FAILURE");
  });

  // --- Exclusivity ----------------------------------------------------------------

  await check("RA10", "result and SystemFailure stay exclusive; failures never become abstentions", () => {
    const resultKeys = new Set(Object.keys(p5a.result));
    const failureKeys = new Set(Object.keys(systemFailureSchema.required));
    for (const key of failureKeys) {
      assert.equal(resultKeys.has(key), false, `result must not carry ${key}`);
    }
    for (const key of ["interpretation", "claims", "clientNarrative", "interpretationStatus"]) {
      assert.equal(failureKeys.has(key), false, `SystemFailure must not carry ${key}`);
    }
    const resultKeyNames = allKeysAnywhere(p5a.result);
    for (const forbidden of ["systemFailure", "failureClass", "occurredAt", "clientDisclosure"]) {
      assert.equal(resultKeyNames.has(forbidden), false, forbidden);
    }
    assert.equal(resultKeyNames.has("interpretationStatus"), true);
    for (const failureClass of SYSTEM_FAILURE_CLASSES) {
      assert.notEqual(failureClass, "ABSTAINED_INSUFFICIENT_EVIDENCE");
    }
    const anyFailure = mapResultAssemblyErrorToSystemFailure({
      agentInterpretationRequest: p5a.request,
      resultAssemblyError: new ResultAssemblyError({ failureClass: "OUTPUT_SCHEMA_VIOLATION", detail: "x" }),
    });
    assert.equal(Object.hasOwn(anyFailure, "interpretationStatus"), false);
    assert.equal(Object.hasOwn(anyFailure, "abstentionReason"), false);
  });

  // --- Structural / semantic cut protections ---------------------------------------

  await check("RA11", "no authored-text policy, no transport, no UI code in the new boundary", () => {
    const modules = [
      "../src/agent/agentInterpretationResultSchema.js",
      "../src/agent/agentInterpretationResult.js",
    ];
    for (const path of modules) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      const lower = source.toLowerCase();
      for (const fragment of ["probability", "likelihood", "odds", "percent"]) {
        assert.equal(lower.includes(fragment), false, `${path}: ${fragment}`);
      }
      assert.equal(/V-\d/.test(source), false, `${path}: no numbered semantic policy ids`);
      for (const fragment of ["renderer", "workflow", "setTimeout", "backoff"]) {
        assert.equal(lower.includes(fragment), false, `${path}: ${fragment}`);
      }
      for (const fragment of [
        "fet" + "ch(",
        "process" + ".env",
        "node:fs",
        "node:net",
        "node:ht" + "tp",
        "child_" + "process",
        "@goo" + "gle",
      ]) {
        assert.equal(source.includes(fragment), false, `${path}: ${fragment}`);
      }
    }

    const allowedImports = {
      "../src/agent/agentInterpretationResultSchema.js": new Set([
        "./agentContractConstants.js",
        "./providerSemanticCandidateSchema.js",
        "./providerExecutionConstants.js",
      ]),
      "../src/agent/agentInterpretationResult.js": new Set([
        "./agentContractConstants.js",
        "./providerProjection.js",
        "./providerSemanticCandidateSchema.js",
        "./providerExecutionError.js",
        "./providerExecutionConstants.js",
        "./agentInterpretationResultSchema.js",
      ]),
    };
    for (const [path, allowed] of Object.entries(allowedImports)) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      for (const importPath of source.matchAll(/from\s+"([^"]+)"/g)) {
        assert.ok(allowed.has(importPath[1]), `${path}: unexpected import ${importPath[1]}`);
      }
    }
  });

  await check("RA-PC1", "lawful PRE_CORE SELECTOR_BOUNDARY_EXPLANATION candidates assemble on all three outcomes", async () => {
    for (const status of ["ADMISSIBILITY_UNRESOLVED", "NO_LAWFUL_PAIR", "PAIR_SELECTION_AMBIGUOUS"]) {
      const built = assemblePreCoreRequest(status);
      const candidate = lawfulPreCoreCandidate(built.projection);
      const output = await offlineExecutionFor(built.projection, candidate);
      const result = assembleAgentInterpretationResult({
        agentInterpretationRequest: built.request,
        providerExecutionOutput: output,
      });
      assert.equal(result.interpretationStatus, "SELECTOR_BOUNDARY_EXPLANATION", status);
      assert.equal(result.abstentionReason, null, status);
      assert.deepEqual(result.interpretation.hypotheses.items, [], status);
      assert.equal(result.engineFactsRef.branchCode, null, status);
      assert.equal(result.engineFactsRef.stateAsserted, null, status);
    }
  });

  await check("RA-PC2", "PRE_CORE forbidden candidate statuses fail result assembly", async () => {
    const built = assemblePreCoreRequest("NO_LAWFUL_PAIR");
    const candidate = lawfulPreCoreCandidate(built.projection);
    candidate.interpretationStatus = "INTERPRETATION_SUPPORTED";
    const caught = await assembleRejected(
      {
        request: built.request,
        output: {
          candidate,
          executionMetadata: p5a.output.executionMetadata,
        },
      },
      "OUTPUT_SCHEMA_VIOLATION",
    );
    assert.match(String(caught.detail), /SELECTOR_BOUNDARY_EXPLANATION/);
  });

  await check("RA12", "this validator performs no network, environment-secret, or SDK initialization", () => {
    const self = readFileSync(new URL(import.meta.url), "utf8");
    for (const fragment of [
      "fet" + "ch(",
      "XML" + "HttpRequest",
      "node:ht" + "tps",
      "child_" + "process",
      "process" + ".env",
      "@goo" + "gle",
    ]) {
      assert.equal(self.includes(fragment), false, fragment);
    }
  });

  await check("RA13", "typed mechanical errors map canonically; generic internal errors are never canonicalized", async () => {
    // PASS direction — a lawful typed mechanical error maps to its exact
    // canonical SystemFailure class.
    const typed = new ResultAssemblyError({
      failureClass: "UNRESOLVABLE_REFERENCE",
      detail: "typed mechanical failure",
    });
    const systemFailure = mapResultAssemblyErrorToSystemFailure({
      agentInterpretationRequest: p5a.request,
      resultAssemblyError: typed,
    });
    assert.equal(systemFailure.failureClass, "UNRESOLVABLE_REFERENCE");
    assert.equal(systemFailure.retryable, true);
    assertDeepFrozen(systemFailure, "systemFailure");

    // FAIL-CLOSED — a generic error handed to the mapper is rejected without
    // materializing anything canonical.
    let mapperCaught = null;
    try {
      mapResultAssemblyErrorToSystemFailure({
        agentInterpretationRequest: p5a.request,
        resultAssemblyError: new Error("synthetic internal assembler defect"),
      });
    } catch (error) {
      mapperCaught = error;
    }
    assert.ok(mapperCaught !== null, "the mapper must throw on a generic error");
    assert.equal(mapperCaught instanceof ResultAssemblyError, true, "typed fail-closed rejection");
    assert.equal(mapperCaught.failureClass, "INPUT_ASSEMBLY_FAILURE");
    assert.equal(allKeysAnywhere(mapperCaught).has("failureSchemaVersion"), false, "no SystemFailure fabricated");
    assert.notEqual(mapperCaught.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");

    // FAIL-CLOSED — an unexpected internal failure inside assembly rethrows
    // as the original error; no result, no canonical class.
    const poisonedCandidate = { interpretationStatus: "INTERPRETATION_SUPPORTED" };
    Object.defineProperty(poisonedCandidate, "claims", {
      enumerable: true,
      get() {
        throw new TypeError("synthetic internal assembler defect");
      },
    });
    let assemblyCaught = null;
    try {
      assembleAgentInterpretationResult({
        agentInterpretationRequest: p5a.request,
        providerExecutionOutput: {
          candidate: poisonedCandidate,
          executionMetadata: p5a.output.executionMetadata,
        },
      });
    } catch (error) {
      assemblyCaught = error;
    }
    assert.ok(assemblyCaught instanceof TypeError, "the original internal error is rethrown unchanged");
    assert.equal(assemblyCaught.message, "synthetic internal assembler defect");
    assert.equal(assemblyCaught instanceof ResultAssemblyError, false);
    assert.equal(assemblyCaught.failureClass, undefined);
    assert.notEqual(assemblyCaught.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");

    // Negative control — ordinary structural violations keep their specific
    // lawful classes (RA9: rank → OUTPUT_SCHEMA_VIOLATION, version →
    // CONTRACT_VERSION_MISMATCH); no production path manufactures the
    // enforcement class as a fallback.
    const source = readFileSync(new URL("../src/agent/agentInterpretationResult.js", import.meta.url), "utf8");
    assert.equal(
      source.includes('failureClass: "CONSTRAINT_ENFORCEMENT_FAILURE"'),
      false,
      "the enforcement class may never be materialized as a fallback",
    );
    assert.equal(
      source.includes('"CONSTRAINT_ENFORCEMENT_FAILURE"'),
      true,
      "the class stays in the lawful mechanical vocabulary",
    );
  });
}

await main();

console.log("Agent Interpretation Result Offline cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
