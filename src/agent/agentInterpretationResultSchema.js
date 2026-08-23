import {
  BRANCH_CODES,
  FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  FAILURE_SCHEMA_VERSION,
  OUTPUT_SCHEMA_VERSION,
  SYSTEM_FAILURE_CLIENT_DISCLOSURE,
  SYSTEM_FAILURE_CLASSES,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "./agentContractConstants.js";
import { providerSemanticCandidateSchema } from "./providerSemanticCandidateSchema.js";
import { GEMINI_MODEL_ID, PROVIDER_ID_GEMINI } from "./providerExecutionConstants.js";

// Structural, mechanically decidable validation only. This module never
// inspects authored text for meaning; that responsibility belongs to the
// future admission stage.

export class AgentInterpretationResultValidationError extends Error {
  constructor({ failureClass, detail } = {}) {
    const parts = [
      "AgentInterpretationResultValidationError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "AgentInterpretationResultValidationError";
    if (!SYSTEM_FAILURE_CLASSES.includes(failureClass)) {
      throw new Error("AgentInterpretationResultValidationError requires a lawful canonical failure class");
    }
    this.failureClass = failureClass;
    this.detail = detail ?? null;
  }
}

function fail(failureClass, detail) {
  throw new AgentInterpretationResultValidationError({ failureClass, detail });
}

function schemaFail(detail) {
  return fail("OUTPUT_SCHEMA_VIOLATION", detail);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function requirePlainObject(value, label) {
  if (!isPlainObject(value)) schemaFail(`${label} must be a plain object`);
  return value;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

const nonEmptyString = Object.freeze({ type: "string", minLength: 1 });
const stringArray = Object.freeze({ type: "array", items: nonEmptyString });
const ISO_8601_PATTERN = "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?Z$";
const SHA256_DIGEST_PATTERN = "^sha256:[0-9a-f]{64}$";

// Provider-authored subtrees are shared, frozen, by reference with the closed
// candidate schema — one shape, no second copy to drift.
const candidateProperties = providerSemanticCandidateSchema.properties;

export const agentInterpretationResultSchema = deepFreeze({
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: OUTPUT_SCHEMA_VERSION,
  title: "MergeVue agent interpretation result",
  type: "object",
  additionalProperties: false,
  required: Object.freeze([
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
  ]),
  properties: Object.freeze({
    resultSchemaVersion: Object.freeze({ enum: Object.freeze([OUTPUT_SCHEMA_VERSION]) }),
    agentContractVersion: nonEmptyString,
    interpretationId: nonEmptyString,
    engineFactsRef: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["diagnosticId", "engineSnapshotDigest", "branchCode", "stateAsserted"]),
      properties: Object.freeze({
        diagnosticId: nonEmptyString,
        engineSnapshotDigest: Object.freeze({ type: "string", pattern: SHA256_DIGEST_PATTERN }),
        branchCode: Object.freeze({ enum: BRANCH_CODES }),
        stateAsserted: Object.freeze({ type: "string", nullable: true }),
      }),
    }),
    interpretationStatus: candidateProperties.interpretationStatus,
    abstentionReason: candidateProperties.abstentionReason,
    interpretation: candidateProperties.interpretation,
    uncertainty: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["materialUncertaintyPresent", "disclosures", "suppressedDeterministicOutputs"]),
      properties: Object.freeze({
        materialUncertaintyPresent: Object.freeze({ type: "boolean" }),
        disclosures: candidateProperties.uncertainty.properties.disclosures,
        suppressedDeterministicOutputs: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["withheldItem", "withheldBy"]),
            properties: Object.freeze({
              withheldItem: nonEmptyString,
              withheldBy: Object.freeze({ enum: BRANCH_CODES }),
            }),
          }),
        }),
      }),
    }),
    claims: candidateProperties.claims,
    clientNarrative: candidateProperties.clientNarrative,
    provenance: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["providerIdentity", "modelIdentity", "executedAt", "contextRefsUsed"]),
      properties: Object.freeze({
        providerIdentity: nonEmptyString,
        modelIdentity: nonEmptyString,
        executedAt: Object.freeze({ type: "string", pattern: ISO_8601_PATTERN }),
        contextRefsUsed: stringArray,
      }),
    }),
  }),
  definitions: providerSemanticCandidateSchema.definitions,
});

export const systemFailureSchema = deepFreeze({
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: FAILURE_SCHEMA_VERSION,
  title: "MergeVue system failure",
  type: "object",
  additionalProperties: false,
  required: Object.freeze([
    "failureSchemaVersion",
    "interpretationId",
    "diagnosticId",
    "engineSnapshotDigest",
    "failureClass",
    "retryable",
    "detail",
    "occurredAt",
    "clientDisclosure",
  ]),
  properties: Object.freeze({
    failureSchemaVersion: Object.freeze({ enum: Object.freeze([FAILURE_SCHEMA_VERSION]) }),
    interpretationId: nonEmptyString,
    diagnosticId: nonEmptyString,
    engineSnapshotDigest: Object.freeze({ type: "string", pattern: SHA256_DIGEST_PATTERN }),
    failureClass: Object.freeze({ enum: SYSTEM_FAILURE_CLASSES }),
    retryable: Object.freeze({ type: "boolean" }),
    detail: Object.freeze({ type: "string", nullable: true }),
    occurredAt: Object.freeze({ type: "string", pattern: ISO_8601_PATTERN }),
    clientDisclosure: Object.freeze({ enum: Object.freeze([SYSTEM_FAILURE_CLIENT_DISCLOSURE]) }),
  }),
});

function resolveSchemaNode(node, rootSchema) {
  if (node != null && typeof node === "object" && Object.hasOwn(node, "$ref")) {
    const pointer = node.$ref;
    if (typeof pointer !== "string" || !pointer.startsWith("#/definitions/")) {
      schemaFail(`schema carries an unsupported $ref ${JSON.stringify(pointer)}`);
    }
    const name = pointer.slice("#/definitions/".length);
    const definition = rootSchema.definitions?.[name];
    if (definition === undefined) schemaFail(`schema $ref does not resolve: ${pointer}`);
    return definition;
  }
  return node;
}

function validateSchemaNode(value, schemaNode, path, rootSchema) {
  const node = resolveSchemaNode(schemaNode, rootSchema);
  if (node === null || typeof node !== "object") schemaFail(`invalid schema node at ${path}`);

  if (Object.hasOwn(node, "enum")) {
    if (!node.enum.includes(value)) {
      schemaFail(`${path} is not a lawful enum value: ${JSON.stringify(value)}`);
    }
    return;
  }

  const type = node.type;
  if (type === "object") {
    if (!isPlainObject(value)) schemaFail(`${path} must be an object`);
    if (node.additionalProperties === false) {
      const allowed = new Set(Object.keys(node.properties ?? {}));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) schemaFail(`${path} carries unknown key ${JSON.stringify(key)}`);
      }
    }
    for (const key of node.required ?? []) {
      if (!Object.hasOwn(value, key)) schemaFail(`${path} is missing required key ${JSON.stringify(key)}`);
    }
    for (const [key, childSchema] of Object.entries(node.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateSchemaNode(value[key], childSchema, `${path}.${key}`, rootSchema);
      }
    }
    return;
  }
  if (type === "array") {
    if (!Array.isArray(value)) schemaFail(`${path} must be an array`);
    if (node.items !== undefined) {
      value.forEach((item, index) => {
        validateSchemaNode(item, node.items, `${path}[${index}]`, rootSchema);
      });
    }
    return;
  }
  if (type === "string") {
    if (value === null && node.nullable === true) return;
    if (typeof value !== "string") schemaFail(`${path} must be a string`);
    if (node.minLength !== undefined && value.length < node.minLength) {
      schemaFail(`${path} must not be shorter than ${node.minLength}`);
    }
    if (node.pattern !== undefined && !new RegExp(node.pattern).test(value)) {
      schemaFail(`${path} does not match ${node.pattern}`);
    }
    return;
  }
  if (type === "integer") {
    if (typeof value !== "number" || !Number.isInteger(value)) schemaFail(`${path} must be an integer`);
    if (node.minimum !== undefined && value < node.minimum) {
      schemaFail(`${path} must not be below ${node.minimum}`);
    }
    return;
  }
  if (type === "boolean") {
    if (typeof value !== "boolean") schemaFail(`${path} must be a boolean`);
    return;
  }
  schemaFail(`schema node at ${path} has unsupported type ${JSON.stringify(type)}`);
}

// ---------------------------------------------------------------------------
// Structural reference resolution — the single mref→contextItemId law shared
// by assembly and result validation. Only claim-level contextRefs participate.
// ---------------------------------------------------------------------------

const MREF_PREFIX = "mref://";

export function resolveContextRefsUsed(claims, selectedContextItems) {
  if (!Array.isArray(claims)) {
    fail("GROUNDING_VALIDATION_FAILURE", "claims array is absent");
  }
  if (!Array.isArray(selectedContextItems)) {
    fail("GROUNDING_VALIDATION_FAILURE", "selectedContextItems array is absent");
  }
  const used = [];
  const seen = new Set();
  for (const claim of claims) {
    if (!isPlainObject(claim)) {
      fail("GROUNDING_VALIDATION_FAILURE", "claim row is not an object");
    }
    if (!Array.isArray(claim.contextRefs)) {
      fail("GROUNDING_VALIDATION_FAILURE", "claim contextRefs array is absent");
    }
    for (const ref of claim.contextRefs) {
      if (typeof ref !== "string" || !ref.startsWith(MREF_PREFIX) || ref.length === MREF_PREFIX.length) {
        fail("GROUNDING_VALIDATION_FAILURE", "claim contextRef is not an mref reference");
      }
      const matches = selectedContextItems
        .filter((item) => isPlainObject(item) && item.contextRef === ref);
      if (matches.length !== 1) {
        fail(
          "UNRESOLVABLE_REFERENCE",
          `claim contextRef resolves to ${matches.length} selected context items`,
        );
      }
      const contextItemId = matches[0].contextItemId;
      if (typeof contextItemId !== "string" || contextItemId.length === 0) {
        fail("UNRESOLVABLE_REFERENCE", "matched context item lacks a contextItemId");
      }
      if (!seen.has(contextItemId)) {
        seen.add(contextItemId);
        used.push(contextItemId);
      }
    }
  }
  return used;
}

function requireString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    fail(FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, `${label} must be a non-empty string`);
  }
  return value;
}

function extractRequestIdentity(agentInterpretationRequest) {
  const request = requirePlainObject(agentInterpretationRequest, "agentInterpretationRequest");
  const snapshot = requirePlainObject(request.engineSnapshot, "agentInterpretationRequest.engineSnapshot");
  const identity = requirePlainObject(snapshot.identity, "agentInterpretationRequest.engineSnapshot.identity");
  const engine = requirePlainObject(snapshot.engine, "agentInterpretationRequest.engineSnapshot.engine");
  const outcome = requirePlainObject(engine.outcome, "agentInterpretationRequest.engineSnapshot.engine.outcome");
  const uncertainty = requirePlainObject(
    request.structuredUncertainty,
    "agentInterpretationRequest.structuredUncertainty",
  );
  const pack = requirePlainObject(
    request.interpretationContextPack,
    "agentInterpretationRequest.interpretationContextPack",
  );
  if (typeof uncertainty.materialUncertaintyPresent !== "boolean") {
    fail(FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, "structuredUncertainty.materialUncertaintyPresent must be a boolean");
  }
  if (!Array.isArray(uncertainty.withheldOutputs)) {
    fail(FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, "structuredUncertainty.withheldOutputs must be an array");
  }
  if (!Array.isArray(pack.selectedContextItems)) {
    fail(FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, "interpretationContextPack.selectedContextItems must be an array");
  }
  if (!Array.isArray(request.activeConstraints ?? [])) {
    fail(FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, "activeConstraints must be an array when present");
  }
  return {
    request,
    interpretationId: requireString(request.interpretationId, "agentInterpretationRequest.interpretationId"),
    outputSchemaVersion: requireString(request.outputSchemaVersion, "agentInterpretationRequest.outputSchemaVersion"),
    agentContractVersion: requireString(request.agentContractVersion, "agentInterpretationRequest.agentContractVersion"),
    diagnosticId: requireString(identity.diagnosticId, "engineSnapshot.identity.diagnosticId"),
    engineSnapshotDigest: requireString(snapshot.engineSnapshotDigest, "engineSnapshot.engineSnapshotDigest"),
    branchCode: requireString(outcome.branchCode, "engineSnapshot.engine.outcome.branchCode"),
    state: outcome.state,
    materialUncertaintyPresent: uncertainty.materialUncertaintyPresent,
    withheldOutputs: uncertainty.withheldOutputs,
    selectedContextItems: pack.selectedContextItems,
    permittedOutputScope: request.permittedOutputScope,
    activeConstraints: request.activeConstraints ?? [],
  };
}

function assertDeepFrozen(value, label) {
  if (value === null || typeof value !== "object") return;
  if (!Object.isFrozen(value)) schemaFail(`${label} must be frozen`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDeepFrozen(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${label}.${key}`);
}

function sameStringArray(left, right) {
  return Array.isArray(left) && Array.isArray(right)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

// Provider-neutral mechanical gate. Every rule here is decidable from
// structure alone; none reads authored wording.
export function validateAgentInterpretationResultStructure(agentInterpretationRequest, result) {
  const ctx = extractRequestIdentity(agentInterpretationRequest);
  requirePlainObject(result, "result");
  validateSchemaNode(result, agentInterpretationResultSchema, "result", agentInterpretationResultSchema);

  if (result.resultSchemaVersion !== ctx.outputSchemaVersion) {
    fail(FAILURE_CLASS_CONTRACT_VERSION_MISMATCH, "resultSchemaVersion does not mirror request.outputSchemaVersion");
  }
  if (result.agentContractVersion !== ctx.agentContractVersion) {
    fail(FAILURE_CLASS_CONTRACT_VERSION_MISMATCH, "agentContractVersion does not mirror the request");
  }
  if (result.interpretationId !== ctx.interpretationId) {
    schemaFail("interpretationId does not mirror the request");
  }

  const engineFactsRef = result.engineFactsRef;
  if (engineFactsRef.diagnosticId !== ctx.diagnosticId) {
    fail("ENGINE_FACT_MUTATION_DETECTED", "engineFactsRef.diagnosticId does not mirror the snapshot identity");
  }
  if (engineFactsRef.engineSnapshotDigest !== ctx.engineSnapshotDigest) {
    fail("ENGINE_FACT_MUTATION_DETECTED", "engineFactsRef.engineSnapshotDigest does not mirror the sealed digest");
  }
  if (engineFactsRef.branchCode !== ctx.branchCode) {
    fail("ENGINE_FACT_MUTATION_DETECTED", "engineFactsRef.branchCode does not mirror the engine outcome");
  }
  if (engineFactsRef.stateAsserted !== ctx.state) {
    fail("ENGINE_FACT_MUTATION_DETECTED", "engineFactsRef.stateAsserted does not equal engine.outcome.state");
  }
  if (result.uncertainty.materialUncertaintyPresent !== ctx.materialUncertaintyPresent) {
    fail("ENGINE_FACT_MUTATION_DETECTED", "uncertainty.materialUncertaintyPresent does not mirror the request");
  }

  const expectedWithheld = ctx.withheldOutputs.map((row) => ({
    withheldItem: row?.withheldItem,
    withheldBy: row?.withheldBy,
  }));
  const actualWithheld = result.uncertainty.suppressedDeterministicOutputs.map((row) => ({
    withheldItem: row.withheldItem,
    withheldBy: row.withheldBy,
  }));
  if (actualWithheld.length !== expectedWithheld.length
    || actualWithheld.some((row, index) => row.withheldItem !== expectedWithheld[index].withheldItem
      || row.withheldBy !== expectedWithheld[index].withheldBy)) {
    schemaFail("suppressedDeterministicOutputs is not the exact 1:1 withheld-output projection in input order");
  }

  if (result.provenance.providerIdentity !== PROVIDER_ID_GEMINI
    || result.provenance.modelIdentity !== GEMINI_MODEL_ID) {
    schemaFail("provenance identity is not the trusted closed execution identity");
  }

  for (const [index, claim] of result.claims.entries()) {
    claim.refs.forEach((ref, refIndex) => {
      const lawful = typeof ref === "string"
        && (ref.startsWith("qref://") || ref.startsWith("factref://") || ref.startsWith("uref://"));
      if (!lawful) {
        fail(
          "GROUNDING_VALIDATION_FAILURE",
          `claims[${index}].refs[${refIndex}] is outside the structural reference namespaces`,
        );
      }
    });
  }

  const expectedContextRefsUsed = resolveContextRefsUsed(result.claims, ctx.selectedContextItems);
  if (!sameStringArray(result.provenance.contextRefsUsed, expectedContextRefsUsed)) {
    fail("GROUNDING_VALIDATION_FAILURE", "provenance.contextRefsUsed is not the deterministic claim-level resolution");
  }

  const hypotheses = result.interpretation.hypotheses;
  for (const [index, item] of hypotheses.items.entries()) {
    if (hypotheses.ordering === "RANKED" && !Object.hasOwn(item, "rank")) {
      schemaFail(`interpretation.hypotheses.items[${index}] must expose rank under RANKED`);
    }
    if (hypotheses.ordering !== "RANKED" && Object.hasOwn(item, "rank")) {
      schemaFail(`interpretation.hypotheses.items[${index}] must not expose rank outside RANKED`);
    }
  }

  if (ctx.permittedOutputScope === "FACTUAL_EXPLANATION_ONLY") {
    if (Object.hasOwn(result.interpretation, "transitionPattern")) {
      fail("PROHIBITED_CLAIM_VIOLATION", "transitionPattern is a forbidden Case B route under FACTUAL_EXPLANATION_ONLY");
    }
    if (Object.hasOwn(result.interpretation, "frictionMechanism")) {
      fail("PROHIBITED_CLAIM_VIOLATION", "frictionMechanism is a forbidden Case B route under FACTUAL_EXPLANATION_ONLY");
    }
    if (result.interpretation.affectedResources.length > 0) {
      fail("PROHIBITED_CLAIM_VIOLATION", "affectedResources must stay empty under FACTUAL_EXPLANATION_ONLY");
    }
    if (result.interpretation.watchpoints.length > 0) {
      fail("PROHIBITED_CLAIM_VIOLATION", "watchpoints must stay empty under FACTUAL_EXPLANATION_ONLY");
    }
    for (const [index, claim] of result.claims.entries()) {
      if (claim.claimType === "WATCHPOINT") {
        fail("PROHIBITED_CLAIM_VIOLATION", `claims[${index}] WATCHPOINT is a forbidden Case B route`);
      }
      if (claim.contextRefs.length > 0) {
        fail(
          "PROHIBITED_CLAIM_VIOLATION",
          `claims[${index}].contextRefs must stay empty under FACTUAL_EXPLANATION_ONLY`,
        );
      }
    }
    if (result.provenance.contextRefsUsed.length > 0) {
      fail("PROHIBITED_CLAIM_VIOLATION", "contextRefsUsed must stay empty under FACTUAL_EXPLANATION_ONLY");
    }
  }

  const blockedClaimIds = new Set();
  for (const row of ctx.activeConstraints) {
    for (const claimId of row?.blockedClaimIds ?? []) blockedClaimIds.add(claimId);
  }
  if (blockedClaimIds.size > 0) {
    for (const [index, item] of hypotheses.items.entries()) {
      for (const claimId of item.requiresEngineFactNotEstablished) {
        if (blockedClaimIds.has(claimId)) {
          fail(
            "PROHIBITED_CLAIM_VIOLATION",
            `hypotheses.items[${index}] reintroduces blocked claim ${JSON.stringify(claimId)}`,
          );
        }
      }
    }
  }

  assertDeepFrozen(result, "result");
  return result;
}

export function validateSystemFailureStructure(systemFailure) {
  requirePlainObject(systemFailure, "systemFailure");
  validateSchemaNode(systemFailure, systemFailureSchema, "systemFailure", systemFailureSchema);
  if (systemFailure.retryable !== (SYSTEM_FAILURE_RETRYABLE_BY_CLASS[systemFailure.failureClass] === true)) {
    schemaFail("systemFailure.retryable does not match the canonical retryability table");
  }
  assertDeepFrozen(systemFailure, "systemFailure");
  return systemFailure;
}
