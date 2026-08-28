import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { assembleAgentInterpretationResult } from "../src/agent/agentInterpretationResult.js";
import { GEMINI_MODEL_ID, PROVIDER_ID_GEMINI } from "../src/agent/providerExecutionConstants.js";
import { canonicalSerialize } from "../src/agent/canonicalDigest.js";
import {
  FAILURE_SCHEMA_VERSION,
  SYSTEM_FAILURE_CLIENT_DISCLOSURE,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "../src/agent/agentContractConstants.js";
import { validateSystemFailureStructure } from "../src/agent/agentInterpretationResultSchema.js";
import { createMockSemanticJudge } from "../src/agent/semanticJudge.js";
import { validateAgentInterpretationSemantics } from "../src/agent/semanticValidator.js";
import {
  SemanticEvaluatorIncapacityError,
  SemanticProtocolError,
  SemanticValidationError,
  SemanticViolationError,
} from "../src/agent/semanticValidationError.js";
import {
  JUDGE_AUTH_FAILURE,
  JUDGE_CONFIGURATION_FAILURE,
  JUDGE_HTTP_FAILURE,
  JUDGE_PROTOCOL_FAILURE,
  JUDGE_RATE_LIMIT,
  JUDGE_REFUSAL,
  JUDGE_TIMEOUT,
  JUDGE_TRANSPORT_FAILURE,
  SemanticJudgeTransportError,
} from "../src/agent/semanticJudgeTransportError.js";
import {
  mapSemanticJudgeTransportErrorToSystemFailure,
  mapSemanticValidationErrorToSystemFailure,
  SemanticSystemFailureMappingError,
} from "../src/agent/semanticSystemFailure.js";
import { buildC5CSelectedSelectorProvenance } from "./fixtures/c5c-selected-session.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const FIXED_NOW = "2026-08-23T12:00:00.000Z";
const KEY_SENTINEL = "xai-test-key-SENTINEL-do-not-leak";
const TARGET_SENTINEL = "UNIQUE_TARGET_PROSE_SENTINEL_J3";
const LOCATOR_CLAIM_SENTINEL = "UNIQUE_TARGET_PROSE_SENTINEL_ADVERSARIAL";
const LONG_LOCATOR_SENTINEL = `LOCATOR_LONG_${"Q".repeat(180)}`;
const PACKET_SENTINEL = "UNIQUE_PACKET_PROMPT_SENTINEL_J3";
const MESSAGE_SENTINEL = "UNIQUE_ERROR_MESSAGE_SENTINEL_J3";
const DIGEST = `sha256:${"ab".repeat(32)}`;

const J2_CODES = Object.freeze([
  JUDGE_CONFIGURATION_FAILURE,
  JUDGE_TRANSPORT_FAILURE,
  JUDGE_TIMEOUT,
  JUDGE_AUTH_FAILURE,
  JUDGE_RATE_LIMIT,
  JUDGE_HTTP_FAILURE,
  JUDGE_PROTOCOL_FAILURE,
  JUDGE_REFUSAL,
]);

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
const SELECTOR = buildC5CSelectedSelectorProvenance();
const PLAIN_EVIDENCE_BASIS = Object.freeze({
  supportBasis: "PRIMARY_COMPARABLE",
  conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE",
  materialUnknownsPresent: false,
});

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
      diagnosticId: "diag-j3",
      projectId: null,
      moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
      candidatePair: coreInput.candidatePair ?? "",
      candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
    },
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
  return { request, snapshot, uncertainty, pack };
}

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

function lawfulCandidate(fixture) {
  const { request } = fixture;
  const refs = projectionRefs(fixture);
  const caseB = request.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  return {
    interpretationStatus: "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          hypothesisItem("H1", "One bounded reading of the supplied evidence.", refs, hypothesisMref),
          hypothesisItem("H2", "An alternative reading of the supplied evidence.", refs, hypothesisMref),
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
      affectedResources: caseB ? [{ label: "Decision authority", contextRefs: [refs.mref] }] : [],
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
      sections: [{
        sectionId: "S-001",
        text: "The assessment established the recorded outcome; a bounded reading follows.",
        derivedFromClaimIds: ["CL-001", "CL-003"],
      }],
    },
  };
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

function assembledFixture(coreInput) {
  const fixture = requestFor(coreInput);
  const candidate = lawfulCandidate(fixture);
  const result = assembleAgentInterpretationResult({
    agentInterpretationRequest: fixture.request,
    providerExecutionOutput: deepFreezeValue({
      candidate: deepFreezeValue(structuredClone(candidate)),
      executionMetadata: deepFreezeValue({
        provider: PROVIDER_ID_GEMINI,
        model: GEMINI_MODEL_ID,
        executedAt: "2026-08-23T00:00:00.000Z",
      }),
    }),
  });
  return { ...fixture, result };
}

function identityRequest() {
  return deepFreezeValue({
    interpretationId: "interp-j3-001",
    engineSnapshot: {
      identity: { diagnosticId: "diag-j3-001" },
      engineSnapshotDigest: DIGEST,
    },
  });
}

function finding(overrides = {}) {
  return {
    ruleId: "V-02",
    semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
    targetFamily: "CLAIM_TEXT",
    targetLocator: "claims[0].text",
    violationCode: "ENGINE_FACT_MUTATION_DETECTED",
    reasonCode: "RULE_VIOLATED",
    supportingAuthorityIds: ["ENGINE_FACT:branchCode"],
    ...overrides,
  };
}

function mapSemantic(error, request = identityRequest(), now = () => FIXED_NOW) {
  return mapSemanticValidationErrorToSystemFailure({
    agentInterpretationRequest: request,
    semanticValidationError: error,
    now,
  });
}

function mapTransport(error, request = identityRequest(), now = () => FIXED_NOW) {
  return mapSemanticJudgeTransportErrorToSystemFailure({
    agentInterpretationRequest: request,
    semanticJudgeTransportError: error,
    now,
  });
}

function assertMappingFailure(fn) {
  assert.throws(fn, (error) => error instanceof SemanticSystemFailureMappingError);
}

function assertNoSentinel(systemFailure, sentinel) {
  const dumped = JSON.stringify(systemFailure);
  assert.equal(dumped.includes(sentinel), false, sentinel);
  assert.equal(String(systemFailure.detail ?? "").includes(sentinel), false, sentinel);
}

function countingProxy(target, traps) {
  const counts = {};
  for (const key of Object.keys(traps)) counts[key] = 0;
  const proxy = new Proxy(target, {
    get(object, property, receiver) {
      if (Object.hasOwn(traps, property)) {
        counts[property] += 1;
        const spec = traps[property];
        if (typeof spec === "function") return spec(counts[property]);
        if (Array.isArray(spec)) {
          return spec[Math.min(counts[property] - 1, spec.length - 1)];
        }
      }
      return Reflect.get(object, property, receiver);
    },
  });
  return { proxy, counts };
}

function assertFrozen(value, label) {
  assert.equal(Object.isFrozen(value), true, `${label} must be frozen`);
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFrozen(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertFrozen(child, `${label}.${key}`);
}

function walkFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) walkFiles(full, files);
    else files.push(full);
  }
  return files;
}

const SEMANTIC_SYSTEM_FAILURE_MODULE_PATH = "src/agent/semanticSystemFailure.js";
const AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER = "src/agent/agentInterpretationRun.js";
const AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_SYMBOLS = Object.freeze([
  "mapSemanticJudgeTransportErrorToSystemFailure",
  "mapSemanticValidationErrorToSystemFailure",
]);

function repoRelativePath(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function isSemanticSystemFailureSpecifier(specifier) {
  const trimmed = String(specifier).split("?")[0].split("#")[0].replaceAll("\\", "/");
  return basename(trimmed) === "semanticSystemFailure.js";
}

function extractSemanticSystemFailureNamedImports(source) {
  const names = [];
  const pattern = /(?:import|export)\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
  let match = pattern.exec(source);
  while (match) {
    if (isSemanticSystemFailureSpecifier(match[2])) {
      for (const part of match[1].split(",")) {
        const raw = part.trim();
        if (!raw) continue;
        const imported = raw.split(/\s+as\s+/)[0].trim();
        if (imported) names.push(imported);
      }
    }
    match = pattern.exec(source);
  }
  return names;
}

function hasSemanticSystemFailureProductionDependency(source) {
  const pattern = /(?:import|export)(?:[\s\S]*?)from\s*["']([^"']+)["']/g;
  let match = pattern.exec(source);
  while (match) {
    if (isSemanticSystemFailureSpecifier(match[1])) return true;
    match = pattern.exec(source);
  }
  if (/import\s*\(\s*["']([^"']*semanticSystemFailure\.js)["']/.test(source)) return true;
  if (/import\s*["']([^"']*semanticSystemFailure\.js)["']/.test(source)) return true;
  for (const symbol of AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_SYMBOLS) {
    if (source.includes(symbol)) return true;
  }
  return source.includes("semanticSystemFailure.js");
}

function collectProductionSemanticSystemFailureImporters() {
  const importers = [];
  for (const file of walkFiles(join(ROOT, "src"))) {
    const relativePath = repoRelativePath(file);
    if (relativePath === SEMANTIC_SYSTEM_FAILURE_MODULE_PATH) continue;
    const text = readFileSync(file, "utf8");
    if (hasSemanticSystemFailureProductionDependency(text)) importers.push(relativePath);
  }
  importers.sort();
  return importers;
}

const results = [];
async function check(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

async function main() {
  const request = identityRequest();
  const now = () => FIXED_NOW;

  await check("SF01", "OUTPUT_SCHEMA_VIOLATION maps to exact canonical class", () => {
    const error = new SemanticViolationError({
      violationCode: "OUTPUT_SCHEMA_VIOLATION",
      detail: `misleading GROUNDING ${TARGET_SENTINEL}`,
      findings: [finding({ violationCode: "OUTPUT_SCHEMA_VIOLATION", ruleId: "V-05", semanticSubruleId: "V-05-DISCLOSURE-IDENTITY", targetLocator: "uncertainty.disclosures" })],
    });
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.failureClass, "OUTPUT_SCHEMA_VIOLATION");
    validateSystemFailureStructure(systemFailure);
  });

  await check("SF02", "GROUNDING_VALIDATION_FAILURE maps to exact canonical class", () => {
    const error = new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      findings: [finding({ violationCode: "GROUNDING_VALIDATION_FAILURE", ruleId: "V-04", semanticSubruleId: "V-04-SEM-GROUNDING" })],
    });
    assert.equal(mapSemantic(error).failureClass, "GROUNDING_VALIDATION_FAILURE");
  });

  await check("SF03", "PROHIBITED_CLAIM_VIOLATION maps to exact canonical class", () => {
    const error = new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ violationCode: "PROHIBITED_CLAIM_VIOLATION", ruleId: "V-12", semanticSubruleId: "V-12-SEM-HUMAN-REVIEW" })],
    });
    assert.equal(mapSemantic(error).failureClass, "PROHIBITED_CLAIM_VIOLATION");
  });

  await check("SF04", "ENGINE_FACT_MUTATION_DETECTED maps to exact canonical class", () => {
    const error = new SemanticViolationError({
      violationCode: "ENGINE_FACT_MUTATION_DETECTED",
      findings: [finding()],
    });
    assert.equal(mapSemantic(error).failureClass, "ENGINE_FACT_MUTATION_DETECTED");
  });

  await check("SF05", "SemanticEvaluatorIncapacityError → CONSTRAINT_ENFORCEMENT_FAILURE", () => {
    const error = new SemanticEvaluatorIncapacityError({
      detail: "PACKET_INSUFFICIENT GROUNDING",
      findings: [finding({ reasonCode: "PACKET_INSUFFICIENT", violationCode: null })],
    });
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.retryable, SYSTEM_FAILURE_RETRYABLE_BY_CLASS.CONSTRAINT_ENFORCEMENT_FAILURE === true);
  });

  await check("SF06", "SemanticProtocolError → CONSTRAINT_ENFORCEMENT_FAILURE", () => {
    const error = new SemanticProtocolError({ detail: `checkId mismatch ${PACKET_SENTINEL}` });
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assertNoSentinel(systemFailure, PACKET_SENTINEL);
  });

  await check("SF07", "INPUT_PRECONDITION_FAILURE → CONSTRAINT_ENFORCEMENT_FAILURE", () => {
    const error = new SemanticValidationError({
      errorKind: "INPUT_PRECONDITION_FAILURE",
      detail: "agentInterpretationRequest must be a plain object INPUT_ASSEMBLY_FAILURE GROUNDING_VALIDATION_FAILURE PROVIDER_TIMEOUT",
    });
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.retryable, SYSTEM_FAILURE_RETRYABLE_BY_CLASS.CONSTRAINT_ENFORCEMENT_FAILURE === true);
    assert.equal(systemFailure.detail, "semanticErrorKind=INPUT_PRECONDITION_FAILURE");
    assert.equal(String(systemFailure.detail).includes("INPUT_ASSEMBLY_FAILURE"), false);
    assert.equal(String(systemFailure.detail).includes("plain object"), false);
  });

  await check("SF07b", "INPUT_PRECONDITION misleading message/detail cannot change class", () => {
    const error = new SemanticValidationError({
      errorKind: "INPUT_PRECONDITION_FAILURE",
      detail: "INPUT_ASSEMBLY_FAILURE",
    });
    Object.defineProperty(error, "message", { value: "GROUNDING PROVIDER_TIMEOUT PROHIBITED_CLAIM_VIOLATION" });
    assert.equal(mapSemantic(error).failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
  });

  await check("SF07c", "INPUT_PRECONDITION generic/foreign lookalikes do not become SystemFailure", () => {
    assertMappingFailure(() => mapSemantic(new Error("INPUT_PRECONDITION_FAILURE")));
    assertMappingFailure(() => mapSemantic({ errorKind: "INPUT_PRECONDITION_FAILURE" }));
    assertMappingFailure(() => mapSemantic(new TypeError("INPUT_PRECONDITION_FAILURE")));
  });

  await check("SF08", "all eight J2 transport codes → CONSTRAINT_ENFORCEMENT_FAILURE", () => {
    for (const errorCode of J2_CODES) {
      const error = new SemanticJudgeTransportError({ errorCode, detail: KEY_SENTINEL });
      const systemFailure = mapTransport(error);
      assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE", errorCode);
      assert.equal(systemFailure.detail.includes(errorCode), true);
      assertNoSentinel(systemFailure, KEY_SENTINEL);
    }
  });

  await check("SF09", "interpretationId mirrors the request", () => {
    const error = new SemanticProtocolError({ detail: "protocol" });
    assert.equal(mapSemantic(error).interpretationId, request.interpretationId);
  });

  await check("SF10", "diagnosticId mirrors the request", () => {
    const error = new SemanticProtocolError({ detail: "protocol" });
    assert.equal(mapSemantic(error).diagnosticId, "diag-j3-001");
  });

  await check("SF11", "engineSnapshotDigest mirrors the request", () => {
    const error = new SemanticProtocolError({ detail: "protocol" });
    assert.equal(mapSemantic(error).engineSnapshotDigest, DIGEST);
  });

  await check("SF12", "failureSchemaVersion is system-failure-1.0", () => {
    const error = new SemanticProtocolError({ detail: "protocol" });
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.failureSchemaVersion, "system-failure-1.0");
    assert.equal(systemFailure.failureSchemaVersion, FAILURE_SCHEMA_VERSION);
  });

  await check("SF13", "retryable comes from existing canonical table", () => {
    const pairs = [
      ["OUTPUT_SCHEMA_VIOLATION", true],
      ["GROUNDING_VALIDATION_FAILURE", true],
      ["PROHIBITED_CLAIM_VIOLATION", true],
      ["ENGINE_FACT_MUTATION_DETECTED", false],
    ];
    for (const [violationCode, expected] of pairs) {
      const error = new SemanticViolationError({ violationCode });
      const systemFailure = mapSemantic(error);
      assert.equal(systemFailure.retryable, expected);
      assert.equal(systemFailure.retryable, SYSTEM_FAILURE_RETRYABLE_BY_CLASS[violationCode] === true);
    }
    const incapacity = mapSemantic(new SemanticEvaluatorIncapacityError({
      findings: [finding({ reasonCode: "AUTHORITY_ABSENT" })],
    }));
    assert.equal(incapacity.retryable, SYSTEM_FAILURE_RETRYABLE_BY_CLASS.CONSTRAINT_ENFORCEMENT_FAILURE === true);
  });

  await check("SF14", "misleading local retry hint cannot change canonical retryable", () => {
    const error = new SemanticViolationError({ violationCode: "ENGINE_FACT_MUTATION_DETECTED" });
    error.retryable = true;
    const systemFailure = mapSemantic(error);
    assert.equal(systemFailure.retryable, false);
    const transport = new SemanticJudgeTransportError({ errorCode: JUDGE_TIMEOUT });
    transport.retryable = true;
    assert.equal(mapTransport(transport).retryable, false);
  });

  await check("SF15", "clientDisclosure is SYSTEM_LEVEL_ONLY", () => {
    const systemFailure = mapSemantic(new SemanticProtocolError({ detail: "x" }));
    assert.equal(systemFailure.clientDisclosure, "SYSTEM_LEVEL_ONLY");
    assert.equal(systemFailure.clientDisclosure, SYSTEM_FAILURE_CLIENT_DISCLOSURE);
  });

  await check("SF16", "injected now is copied exactly to occurredAt", () => {
    const systemFailure = mapSemantic(new SemanticProtocolError({ detail: "x" }), request, () => FIXED_NOW);
    assert.equal(systemFailure.occurredAt, FIXED_NOW);
  });

  await check("SF17", "default now produces structurally valid ISO timestamp", () => {
    const systemFailure = mapSemanticValidationErrorToSystemFailure({
      agentInterpretationRequest: request,
      semanticValidationError: new SemanticProtocolError({ detail: "x" }),
    });
    assert.equal(ISO_PATTERN.test(systemFailure.occurredAt), true);
    validateSystemFailureStructure(systemFailure);
  });

  await check("SF18", "validateSystemFailureStructure accepts every returned object", () => {
    const samples = [
      mapSemantic(new SemanticViolationError({ violationCode: "OUTPUT_SCHEMA_VIOLATION" })),
      mapSemantic(new SemanticViolationError({ violationCode: "GROUNDING_VALIDATION_FAILURE" })),
      mapSemantic(new SemanticViolationError({ violationCode: "PROHIBITED_CLAIM_VIOLATION" })),
      mapSemantic(new SemanticViolationError({ violationCode: "ENGINE_FACT_MUTATION_DETECTED" })),
      mapSemantic(new SemanticEvaluatorIncapacityError({ findings: [finding({ reasonCode: "TARGET_AMBIGUOUS" })] })),
      mapSemantic(new SemanticProtocolError({ detail: "x" })),
      mapSemantic(new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE" })),
      ...J2_CODES.map((errorCode) => mapTransport(new SemanticJudgeTransportError({ errorCode, httpStatus: 500 }))),
    ];
    for (const systemFailure of samples) {
      assert.equal(validateSystemFailureStructure(systemFailure), systemFailure);
    }
  });

  await check("SF19", "returned SystemFailure is frozen", () => {
    const systemFailure = mapSemantic(new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-12" })],
    }));
    assertFrozen(systemFailure, "systemFailure");
  });

  await check("SF20", "input Request remains byte/canonical-identical", () => {
    const live = identityRequest();
    const before = canonicalSerialize(live);
    mapSemantic(new SemanticProtocolError({ detail: "x" }), live);
    assert.equal(canonicalSerialize(live), before);
  });

  await check("SF21", "input semantic error remains unchanged", () => {
    const error = new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      detail: "operator path",
      findings: [finding({ ruleId: "V-04" })],
    });
    const before = {
      violationCode: error.violationCode,
      errorKind: error.errorKind,
      detail: error.detail,
      findings: error.findings,
    };
    mapSemantic(error);
    assert.equal(error.violationCode, before.violationCode);
    assert.equal(error.errorKind, before.errorKind);
    assert.equal(error.detail, before.detail);
    assert.equal(error.findings, before.findings);
  });

  await check("SF22", "input transport error remains unchanged", () => {
    const error = new SemanticJudgeTransportError({
      errorCode: JUDGE_HTTP_FAILURE,
      detail: "HTTP 500",
      httpStatus: 500,
    });
    const before = { errorCode: error.errorCode, detail: error.detail, httpStatus: error.httpStatus };
    mapTransport(error);
    assert.equal(error.errorCode, before.errorCode);
    assert.equal(error.detail, before.detail);
    assert.equal(error.httpStatus, before.httpStatus);
  });

  await check("SF23", "misleading GROUNDING message cannot change a different class", () => {
    const error = new SemanticViolationError({
      violationCode: "OUTPUT_SCHEMA_VIOLATION",
      detail: "GROUNDING",
    });
    Object.defineProperty(error, "message", { value: "GROUNDING_VALIDATION_FAILURE" });
    assert.equal(mapSemantic(error).failureClass, "OUTPUT_SCHEMA_VIOLATION");
  });

  await check("SF24", "misleading PROHIBITED_CLAIM_VIOLATION detail cannot change class", () => {
    const error = new SemanticViolationError({
      violationCode: "ENGINE_FACT_MUTATION_DETECTED",
      detail: "PROHIBITED_CLAIM_VIOLATION",
    });
    assert.equal(mapSemantic(error).failureClass, "ENGINE_FACT_MUTATION_DETECTED");
    assert.equal(String(mapSemantic(error).detail).includes("PROHIBITED_CLAIM_VIOLATION"), false);
  });

  await check("SF25", "J2 HTTP 401 vs 429 vs 500 still CONSTRAINT_ENFORCEMENT_FAILURE", () => {
    const statuses = [
      [JUDGE_AUTH_FAILURE, 401],
      [JUDGE_RATE_LIMIT, 429],
      [JUDGE_HTTP_FAILURE, 500],
    ];
    for (const [errorCode, httpStatus] of statuses) {
      const systemFailure = mapTransport(new SemanticJudgeTransportError({ errorCode, httpStatus }));
      assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
      assert.equal(systemFailure.detail, `transportErrorCode=${errorCode}`);
    }
  });

  await check("SF26", "API-key sentinel cannot appear in SystemFailure.detail or JSON", () => {
    const error = new SemanticJudgeTransportError({
      errorCode: JUDGE_AUTH_FAILURE,
      detail: KEY_SENTINEL,
      httpStatus: 401,
    });
    assertNoSentinel(mapTransport(error), KEY_SENTINEL);
  });

  await check("SF27", "raw target-text / error.detail sentinel cannot appear in detail", () => {
    const error = new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      detail: TARGET_SENTINEL,
      findings: [finding({ targetLocator: "claims[0].text" })],
    });
    const systemFailure = mapSemantic(error);
    assertNoSentinel(systemFailure, TARGET_SENTINEL);
    assert.equal(String(systemFailure.detail ?? "").includes("targetLocator="), false);
  });

  await check("SF27A", "provider-authored claimId in targetLocator cannot appear in SystemFailure", () => {
    const locator = `claims.${LOCATOR_CLAIM_SENTINEL}.text`;
    const error = new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({
        ruleId: "V-12",
        semanticSubruleId: "V-12-SEM-HUMAN-REVIEW",
        targetLocator: locator,
      })],
    });
    const systemFailure = mapSemantic(error);
    assert.equal(error.findings[0].targetLocator, locator);
    assertNoSentinel(systemFailure, LOCATOR_CLAIM_SENTINEL);
    assert.equal(String(systemFailure.detail ?? "").includes("targetLocator="), false);
    assert.equal(JSON.stringify(systemFailure).includes(locator), false);
  });

  await check("SF27B", "very long provider-influenced locator is not copied into detail", () => {
    const locator = `claims[${LONG_LOCATOR_SENTINEL}].text`;
    const error = new SemanticViolationError({
      violationCode: "ENGINE_FACT_MUTATION_DETECTED",
      findings: [finding({ targetLocator: locator })],
    });
    const systemFailure = mapSemantic(error);
    assert.equal(error.findings[0].targetLocator, locator);
    assertNoSentinel(systemFailure, LONG_LOCATOR_SENTINEL);
    assert.equal(String(systemFailure.detail ?? "").includes("Q".repeat(32)), false);
  });

  await check("SF27D", "violationCode valid-first accessor is snapshotted once", () => {
    const base = new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-12", semanticSubruleId: "V-12-SEM-HUMAN-REVIEW" })],
    });
    const { proxy, counts } = countingProxy(base, {
      violationCode: ["PROHIBITED_CLAIM_VIOLATION", "ARBITRARY_VIOLATION_SENTINEL"],
    });
    assert.equal(proxy instanceof SemanticViolationError, true);
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "PROHIBITED_CLAIM_VIOLATION");
    assert.equal(systemFailure.detail, "semanticErrorKind=SEMANTIC_VIOLATION violationCode=PROHIBITED_CLAIM_VIOLATION");
    assertNoSentinel(systemFailure, "ARBITRARY_VIOLATION_SENTINEL");
    assert.equal(counts.violationCode, 1);
  });

  await check("SF27E", "violationCode invalid-first accessor is rejected without reread", () => {
    const base = new SemanticViolationError({ violationCode: "PROHIBITED_CLAIM_VIOLATION" });
    const { proxy, counts } = countingProxy(base, {
      violationCode: ["ARBITRARY_VIOLATION_SENTINEL", "PROHIBITED_CLAIM_VIOLATION"],
    });
    assertMappingFailure(() => mapSemantic(proxy));
    assert.equal(counts.violationCode, 1);
  });

  await check("SF27F", "transport errorCode valid-first accessor is snapshotted once", () => {
    const base = new SemanticJudgeTransportError({ errorCode: JUDGE_TIMEOUT });
    const { proxy, counts } = countingProxy(base, {
      errorCode: ["JUDGE_TIMEOUT", "ARBITRARY_TRANSPORT_SENTINEL"],
    });
    assert.equal(proxy instanceof SemanticJudgeTransportError, true);
    const systemFailure = mapTransport(proxy);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.detail, "transportErrorCode=JUDGE_TIMEOUT");
    assertNoSentinel(systemFailure, "ARBITRARY_TRANSPORT_SENTINEL");
    assert.equal(counts.errorCode, 1);
  });

  await check("SF27G", "transport errorCode invalid-first accessor is rejected without reread", () => {
    const base = new SemanticJudgeTransportError({ errorCode: JUDGE_TIMEOUT });
    const { proxy, counts } = countingProxy(base, {
      errorCode: ["ARBITRARY_TRANSPORT_SENTINEL", "JUDGE_TIMEOUT"],
    });
    assertMappingFailure(() => mapTransport(proxy));
    assert.equal(counts.errorCode, 1);
  });

  await check("SF27H", "INPUT_PRECONDITION errorKind valid-first accessor is snapshotted once", () => {
    const base = new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE" });
    const { proxy, counts } = countingProxy(base, {
      errorKind: ["INPUT_PRECONDITION_FAILURE", "ARBITRARY_KIND_SENTINEL"],
    });
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.detail, "semanticErrorKind=INPUT_PRECONDITION_FAILURE");
    assertNoSentinel(systemFailure, "ARBITRARY_KIND_SENTINEL");
    assert.equal(counts.errorKind, 1);
  });

  await check("SF27I", "INPUT_PRECONDITION errorKind invalid-first accessor is rejected without reread", () => {
    const base = new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE" });
    const { proxy, counts } = countingProxy(base, {
      errorKind: ["ARBITRARY_KIND_SENTINEL", "INPUT_PRECONDITION_FAILURE"],
    });
    assertMappingFailure(() => mapSemantic(proxy));
    assert.equal(counts.errorKind, 1);
  });

  await check("SF27J", "httpStatus getter is not read during transport mapping", () => {
    const base = new SemanticJudgeTransportError({ errorCode: JUDGE_RATE_LIMIT, httpStatus: 429 });
    const { proxy, counts } = countingProxy(base, {
      httpStatus: () => {
        throw new Error("HTTP_STATUS_MUST_NOT_BE_READ");
      },
    });
    const systemFailure = mapTransport(proxy);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.detail, "transportErrorCode=JUDGE_RATE_LIMIT");
    assert.equal(String(systemFailure.detail).includes("httpStatus="), false);
    assert.equal(counts.httpStatus, 0);
  });

  await check("SF27K", "findings metadata is not read for SystemFailure.detail", () => {
    const base = new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      findings: [finding({ ruleId: "V-04", semanticSubruleId: "V-04-SEM-GROUNDING" })],
    });
    const { proxy, counts } = countingProxy(base, {
      findings: () => {
        throw new Error("FINDINGS_MUST_NOT_BE_READ");
      },
    });
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "GROUNDING_VALIDATION_FAILURE");
    assert.equal(String(systemFailure.detail ?? "").includes("ruleId="), false);
    assert.equal(String(systemFailure.detail ?? "").includes("semanticSubruleId="), false);
    assert.equal(String(systemFailure.detail ?? "").includes("targetLocator="), false);
    assert.equal(counts.findings, 0);
  });

  await check("SF27L", "SemanticViolationError does not read errorKind; kind is subtype-derived", () => {
    const base = new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-12", semanticSubruleId: "V-12-SEM-HUMAN-REVIEW" })],
    });
    const { proxy, counts } = countingProxy(base, {
      errorKind: ["ARBITRARY_ERROR_KIND_SENTINEL"],
    });
    assert.equal(proxy instanceof SemanticViolationError, true);
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "PROHIBITED_CLAIM_VIOLATION");
    assert.equal(systemFailure.detail, "semanticErrorKind=SEMANTIC_VIOLATION violationCode=PROHIBITED_CLAIM_VIOLATION");
    assertNoSentinel(systemFailure, "ARBITRARY_ERROR_KIND_SENTINEL");
    assert.equal(counts.errorKind, 0);
  });

  await check("SF27M", "SemanticEvaluatorIncapacityError does not read errorKind; kind is subtype-derived", () => {
    const base = new SemanticEvaluatorIncapacityError({
      findings: [finding({ reasonCode: "AUTHORITY_ABSENT" })],
    });
    const { proxy, counts } = countingProxy(base, {
      errorKind: ["ARBITRARY_ERROR_KIND_SENTINEL"],
    });
    assert.equal(proxy instanceof SemanticEvaluatorIncapacityError, true);
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.detail, "semanticErrorKind=EVALUATOR_INCAPACITY");
    assertNoSentinel(systemFailure, "ARBITRARY_ERROR_KIND_SENTINEL");
    assert.equal(counts.errorKind, 0);
  });

  await check("SF27N", "SemanticProtocolError does not read errorKind; kind is subtype-derived", () => {
    const base = new SemanticProtocolError({ detail: "protocol" });
    const { proxy, counts } = countingProxy(base, {
      errorKind: ["ARBITRARY_ERROR_KIND_SENTINEL"],
    });
    assert.equal(proxy instanceof SemanticProtocolError, true);
    const systemFailure = mapSemantic(proxy);
    assert.equal(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal(systemFailure.detail, "semanticErrorKind=PROTOCOL_FAILURE");
    assertNoSentinel(systemFailure, "ARBITRARY_ERROR_KIND_SENTINEL");
    assert.equal(counts.errorKind, 0);
  });

  await check("SF27C", "error.message sentinel cannot appear in SystemFailure", () => {
    const error = new SemanticViolationError({
      violationCode: "OUTPUT_SCHEMA_VIOLATION",
      detail: "operator",
      findings: [finding({ ruleId: "V-05", semanticSubruleId: "V-05-DISCLOSURE-IDENTITY" })],
    });
    Object.defineProperty(error, "message", { value: MESSAGE_SENTINEL });
    const systemFailure = mapSemantic(error);
    assertNoSentinel(systemFailure, MESSAGE_SENTINEL);
  });

  await check("SF28", "packet/prompt sentinel cannot appear in detail", () => {
    const error = new SemanticProtocolError({ detail: PACKET_SENTINEL });
    assertNoSentinel(mapSemantic(error), PACKET_SENTINEL);
  });

  await check("SF29", "unknown ordinary Error does NOT become SystemFailure", () => {
    assertMappingFailure(() => mapSemantic(new Error("GROUNDING")));
    assertMappingFailure(() => mapSemantic(new TypeError("boom")));
  });

  await check("SF30", "unknown transport error code does NOT become SystemFailure", () => {
    const error = new SemanticJudgeTransportError({ errorCode: JUDGE_TIMEOUT });
    error.errorCode = "NOT_A_JUDGE_CODE";
    assertMappingFailure(() => mapTransport(error));
  });

  await check("SF31", "unknown canonicalFailureClass does NOT become SystemFailure", () => {
    const error = new SemanticViolationError({ violationCode: "OUTPUT_SCHEMA_VIOLATION" });
    error.violationCode = "PROVIDER_UNAVAILABLE";
    assertMappingFailure(() => mapSemantic(error));
    error.violationCode = "NOT_A_CLASS";
    assertMappingFailure(() => mapSemantic(error));
  });

  await check("SF32", "no use of Result Assembly private materializer", () => {
    const source = readFileSync(join(ROOT, "src/agent/semanticSystemFailure.js"), "utf8");
    assert.equal(source.includes("materializeSystemFailure"), false);
    assert.equal(source.includes("ResultAssemblyError"), false);
    assert.equal(source.includes("mapProviderExecutionErrorToSystemFailure"), false);
    assert.equal(source.includes("mapResultAssemblyErrorToSystemFailure"), false);
    assert.equal(source.includes("from \"./agentInterpretationResult.js\""), false);
    assert.equal(source.includes("ProviderExecutionError"), false);
  });

  await check("SF33", "no modification of existing SystemFailure schema", () => {
    const source = readFileSync(join(ROOT, "src/agent/semanticSystemFailure.js"), "utf8");
    assert.equal(source.includes("systemFailureSchema"), false);
    assert.equal(source.includes("INPUT_PRECONDITION_FAILURE"), true);
    const constants = readFileSync(join(ROOT, "src/agent/agentContractConstants.js"), "utf8");
    assert.equal(constants.includes("export const FAILURE_SCHEMA_VERSION = \"system-failure-1.0\""), true);
  });

  await check("SF34", "no import/use of fetch/network/provider runtime", () => {
    const source = readFileSync(join(ROOT, "src/agent/semanticSystemFailure.js"), "utf8");
    for (const fragment of ["fetch(", "AbortController", "XAI_API_KEY", "GEMINI_API_KEY", "backoff", "setTimeout"]) {
      assert.equal(source.includes(fragment), false, fragment);
    }
  });

  await check("SF35", "repeated mapping with identical now is byte-identical", () => {
    const error = new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-12" })],
    });
    const first = mapSemantic(error);
    const second = mapSemantic(error);
    assert.equal(canonicalSerialize(first), canonicalSerialize(second));
  });

  await check("SF36", "repeated mapping with different now differs only in occurredAt", () => {
    const error = new SemanticViolationError({ violationCode: "OUTPUT_SCHEMA_VIOLATION" });
    const first = mapSemantic(error, request, () => "2026-08-23T12:00:00.000Z");
    const second = mapSemantic(error, request, () => "2026-08-23T12:00:01.000Z");
    assert.equal(first.failureClass, second.failureClass);
    assert.equal(first.retryable, second.retryable);
    assert.equal(first.detail, second.detail);
    assert.equal(first.interpretationId, second.interpretationId);
    assert.notEqual(first.occurredAt, second.occurredAt);
  });

  await check("SF37", "failure-class identity does not depend on targetLocator text", () => {
    const left = mapSemantic(new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      findings: [finding({ targetLocator: "claims[0].text" })],
    }));
    const right = mapSemantic(new SemanticViolationError({
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      findings: [finding({ targetLocator: "clientNarrative.sections[0].text" })],
    }));
    assert.equal(left.failureClass, right.failureClass);
  });

  await check("SF38", "failure-class identity does not depend on ruleId string parsing", () => {
    const left = mapSemantic(new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-12" })],
    }));
    const right = mapSemantic(new SemanticViolationError({
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      findings: [finding({ ruleId: "V-13" })],
    }));
    assert.equal(left.failureClass, right.failureClass);
  });

  await check("SF39", "J3 does not mutate J1/J2 objects", () => {
    const semantic = new SemanticViolationError({
      violationCode: "OUTPUT_SCHEMA_VIOLATION",
      findings: [finding({ ruleId: "V-05" })],
    });
    const transport = new SemanticJudgeTransportError({ errorCode: JUDGE_REFUSAL, httpStatus: 200 });
    const liveRequest = identityRequest();
    const semanticBefore = canonicalSerialize({
      errorKind: semantic.errorKind,
      violationCode: semantic.violationCode,
      findings: semantic.findings,
    });
    const transportBefore = canonicalSerialize({
      errorCode: transport.errorCode,
      httpStatus: transport.httpStatus,
    });
    const requestBefore = canonicalSerialize(liveRequest);
    mapSemantic(semantic, liveRequest);
    mapTransport(transport, liveRequest);
    assert.equal(canonicalSerialize({
      errorKind: semantic.errorKind,
      violationCode: semantic.violationCode,
      findings: semantic.findings,
    }), semanticBefore);
    assert.equal(canonicalSerialize({
      errorCode: transport.errorCode,
      httpStatus: transport.httpStatus,
    }), transportBefore);
    assert.equal(canonicalSerialize(liveRequest), requestBefore);
  });

  await check("SF40", "exactly one authorized production semantic SystemFailure importer", () => {
    const source = readFileSync(join(ROOT, SEMANTIC_SYSTEM_FAILURE_MODULE_PATH), "utf8");
    for (const fragment of ["validateAgentInterpretationSemantics", "executeXaiSemanticJudge", "assembleAgentInterpretationResult", "render", "workflow"]) {
      assert.equal(source.includes(fragment), false, fragment);
    }

    const ownerSource = readFileSync(join(ROOT, AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER), "utf8");
    const importedSymbols = extractSemanticSystemFailureNamedImports(ownerSource).sort();
    assert.deepEqual(importedSymbols, [...AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_SYMBOLS].sort());
    assert.equal(hasSemanticSystemFailureProductionDependency(ownerSource), true);

    const actualImporters = collectProductionSemanticSystemFailureImporters();
    assert.deepEqual(actualImporters, [AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER]);
    assert.equal(actualImporters.length, 1);
    assert.equal(actualImporters[0], AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER);

    const syntheticSecondRelative = "src/agent/unauthorizedSemanticSystemFailureConsumer.js";
    assert.notEqual(syntheticSecondRelative, AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER);
    const syntheticSource = "import { mapSemanticValidationErrorToSystemFailure } from \"./semanticSystemFailure.js\";\n";
    assert.equal(hasSemanticSystemFailureProductionDependency(syntheticSource), true);
    assert.deepEqual(
      extractSemanticSystemFailureNamedImports(syntheticSource),
      ["mapSemanticValidationErrorToSystemFailure"],
    );
    assert.notDeepEqual(
      [...actualImporters, syntheticSecondRelative].sort(),
      [AUTHORIZED_SEMANTIC_SYSTEM_FAILURE_IMPORTER],
    );
  });

  await check("SF41", "valid admitted semantic FAIL handoff preserves exact violation class", async () => {
    const fixture = assembledFixture({
      moduleId: "acquirerEnvironment",
      candidatePair: "NT/STJ vs NT/STP",
      respondent1: SENIOR,
      respondent2: SENIOR,
      answers1: fill(),
      answers2: fill(),
    });
    const failJudge = createMockSemanticJudge((check) => ({
      verdict: check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW" ? "FAIL" : "PASS",
    }));
    let typedError = null;
    try {
      await validateAgentInterpretationSemantics({
        agentInterpretationRequest: fixture.request,
        agentInterpretationResult: fixture.result,
        semanticJudge: failJudge,
        maxChecksPerBatch: 5,
      });
      assert.fail("expected SemanticViolationError");
    } catch (error) {
      typedError = error;
    }
    assert.ok(typedError instanceof SemanticViolationError);
    assert.equal(typedError.violationCode, "PROHIBITED_CLAIM_VIOLATION");
    const systemFailure = mapSemanticValidationErrorToSystemFailure({
      agentInterpretationRequest: fixture.request,
      semanticValidationError: typedError,
      now,
    });
    assert.equal(systemFailure.failureClass, "PROHIBITED_CLAIM_VIOLATION");
    assert.notEqual(systemFailure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.notEqual(systemFailure.failureClass, "JUDGE_PROTOCOL_FAILURE");
    assert.equal(systemFailure.interpretationId, fixture.request.interpretationId);
    validateSystemFailureStructure(systemFailure);
  });
}

await main();

console.log("Agent Semantic SystemFailure Offline cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
