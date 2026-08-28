import {
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  SYSTEM_FAILURE_CLASSES,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "./agentContractConstants.js";
import { ProviderProjectionError, projectProviderProjection } from "./providerProjection.js";
import {
  ProviderSemanticCandidateValidationError,
  validateProviderSemanticCandidate,
} from "./providerSemanticCandidateSchema.js";
import { ProviderExecutionError } from "./providerExecutionError.js";
import { GEMINI_MODEL_ID, PROVIDER_ID_GEMINI } from "./providerExecutionConstants.js";
import {
  AgentInterpretationResultValidationError,
  agentInterpretationResultSchema,
  resolveContextRefsUsed,
  validateAgentInterpretationResultStructure,
  validateSystemFailureStructure,
} from "./agentInterpretationResultSchema.js";

// Result Assembly owns mechanical behavior only: canonical shapes, identity
// restoration, deterministic copying, structural reference resolution, and
// deep immutability. Authored-text meaning is never inspected here.

const RESULT_ASSEMBLY_FAILURE_CLASSES = Object.freeze([
  "OUTPUT_SCHEMA_VIOLATION",
  "UNRESOLVABLE_REFERENCE",
  "GROUNDING_VALIDATION_FAILURE",
  "PROHIBITED_CLAIM_VIOLATION",
  "ENGINE_FACT_MUTATION_DETECTED",
  "CONTRACT_VERSION_MISMATCH",
  "INPUT_ASSEMBLY_FAILURE",
  "CONSTRAINT_ENFORCEMENT_FAILURE",
]);

// Canonical aggregate mapping from the closed execution-local taxonomy to the
// accepted provider-agnostic classes. The class comes from this table only,
// never from error detail text.
const EXECUTION_FAILURE_TO_SYSTEM_FAILURE = Object.freeze({
  PROVIDER_CONFIGURATION_FAILURE: "PROVIDER_UNAVAILABLE",
  PROVIDER_AUTH_FAILURE: "PROVIDER_UNAVAILABLE",
  PROVIDER_RATE_LIMIT: "PROVIDER_UNAVAILABLE",
  PROVIDER_TRANSPORT_FAILURE: "PROVIDER_UNAVAILABLE",
  PROVIDER_HTTP_FAILURE: "PROVIDER_UNAVAILABLE",
  PROVIDER_TIMEOUT: "PROVIDER_TIMEOUT",
  PROVIDER_RESPONSE_PARSE_FAILURE: "RESPONSE_MALFORMED",
  PROVIDER_STRUCTURAL_CANDIDATE_FAILURE: "OUTPUT_SCHEMA_VIOLATION",
});

export class ResultAssemblyError extends Error {
  constructor({ failureClass, detail } = {}) {
    const parts = [
      "ResultAssemblyError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "ResultAssemblyError";
    if (!RESULT_ASSEMBLY_FAILURE_CLASSES.includes(failureClass)) {
      throw new Error("ResultAssemblyError requires a lawful mechanical failure class");
    }
    this.failureClass = failureClass;
    this.detail = detail ?? null;
  }
}

function assemblyFail(failureClass, detail) {
  throw new ResultAssemblyError({ failureClass, detail });
}

function inputFail(detail) {
  return assemblyFail("INPUT_ASSEMBLY_FAILURE", detail);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
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

function requirePlainObject(value, label) {
  if (!isPlainObject(value)) inputFail(`${label} must be a plain object`);
  return value;
}

function resolveSchemaNode(node, rootSchema) {
  if (node != null && typeof node === "object" && Object.hasOwn(node, "$ref")) {
    const pointer = node.$ref;
    if (typeof pointer !== "string" || !pointer.startsWith("#/definitions/")) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `schema carries an unsupported $ref ${JSON.stringify(pointer)}`);
    }
    const definition = rootSchema.definitions?.[pointer.slice("#/definitions/".length)];
    if (definition === undefined) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `schema $ref does not resolve: ${pointer}`);
    }
    return definition;
  }
  return node;
}

// Deterministic candidate copy: builds a new independent object graph from the
// closed allowlisted shape. Primitives and strings travel exactly as authored;
// array order, empty arrays, lawful null, and physical key absence are
// preserved; unexpected keys are rejected; nothing is trimmed or reworded.
function copyBySchema(value, schemaNode, rootSchema, label) {
  const node = resolveSchemaNode(schemaNode, rootSchema);
  if (Object.hasOwn(node, "enum")) {
    if (!node.enum.includes(value)) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} is not a lawful enum value`);
    }
    return value;
  }
  const type = node.type;
  if (type === "object") {
    requirePlainObject(value, label);
    const allowed = new Set(Object.keys(node.properties ?? {}));
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) {
        assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} carries unexpected key ${JSON.stringify(key)}`);
      }
    }
    for (const key of node.required ?? []) {
      if (!Object.hasOwn(value, key)) {
        assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} is missing required key ${JSON.stringify(key)}`);
      }
    }
    const out = {};
    for (const [key, childSchema] of Object.entries(node.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        out[key] = copyBySchema(value[key], childSchema, rootSchema, `${label}.${key}`);
      }
    }
    return out;
  }
  if (type === "array") {
    if (!Array.isArray(value)) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must be an array`);
    }
    return value.map((item, index) => copyBySchema(item, node.items, rootSchema, `${label}[${index}]`));
  }
  if (type === "string") {
    if (value === null && node.nullable === true) return null;
    if (typeof value !== "string") {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must be a string`);
    }
    if (node.minLength !== undefined && value.length < node.minLength) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must not be shorter than ${node.minLength}`);
    }
    return value;
  }
  if (type === "integer") {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must be an integer`);
    }
    if (node.minimum !== undefined && value < node.minimum) {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must not be below ${node.minimum}`);
    }
    return value;
  }
  if (type === "boolean") {
    if (typeof value !== "boolean") {
      assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} must be a boolean`);
    }
    return value;
  }
  assemblyFail("OUTPUT_SCHEMA_VIOLATION", `${label} has unsupported schema type ${JSON.stringify(type)}`);
}

function extractExecutionIdentity(providerExecutionOutput) {
  const output = requirePlainObject(providerExecutionOutput, "providerExecutionOutput");
  const keys = Object.keys(output).sort();
  const expected = ["candidate", "executionMetadata"];
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    inputFail("providerExecutionOutput must carry exactly { candidate, executionMetadata }");
  }
  const candidate = requirePlainObject(output.candidate, "providerExecutionOutput.candidate");
  const executionMetadata = requirePlainObject(
    output.executionMetadata,
    "providerExecutionOutput.executionMetadata",
  );
  if (executionMetadata.provider !== PROVIDER_ID_GEMINI
    || executionMetadata.model !== GEMINI_MODEL_ID) {
    inputFail("executionMetadata identity is not the trusted closed execution identity");
  }
  if (typeof executionMetadata.executedAt !== "string" || executionMetadata.executedAt.length === 0) {
    inputFail("executionMetadata.executedAt must be a non-empty string");
  }
  return { candidate, executionMetadata };
}

function assembleResult(agentInterpretationRequest, providerExecutionOutput) {
  const request = requirePlainObject(agentInterpretationRequest, "agentInterpretationRequest");
  const { candidate, executionMetadata } = extractExecutionIdentity(providerExecutionOutput);

  const pack = requirePlainObject(
    request.interpretationContextPack,
    "agentInterpretationRequest.interpretationContextPack",
  );
  if (!Array.isArray(pack.selectedContextItems)) {
    inputFail("interpretationContextPack.selectedContextItems must be an array");
  }
  const structuredUncertainty = requirePlainObject(
    request.structuredUncertainty,
    "agentInterpretationRequest.structuredUncertainty",
  );
  if (!Array.isArray(structuredUncertainty.withheldOutputs)) {
    inputFail("structuredUncertainty.withheldOutputs must be an array");
  }

  // Deterministic claim-level provenance before any revalidation so reference
  // resolution failures carry their own canonical class.
  const contextRefsUsed = resolveContextRefsUsed(candidate.claims, pack.selectedContextItems);

  let projection;
  try {
    projection = projectProviderProjection(request);
  } catch (error) {
    if (error instanceof ProviderProjectionError
      && (error.failureClass === "CONTRACT_VERSION_MISMATCH"
        || error.failureClass === "INPUT_ASSEMBLY_FAILURE")) {
      throw new ResultAssemblyError({
        failureClass: error.failureClass,
        detail: `agentInterpretationRequest rejected by the closed projection boundary: ${error.detail ?? error.message}`,
      });
    }
    throw error;
  }

  let validatedCandidate;
  try {
    validatedCandidate = validateProviderSemanticCandidate(candidate, projection);
  } catch (error) {
    if (error instanceof ProviderSemanticCandidateValidationError) {
      throw new ResultAssemblyError({
        failureClass: "OUTPUT_SCHEMA_VIOLATION",
        detail: `provider candidate failed the closed structural gate: ${error.detail ?? error.message}`,
      });
    }
    throw error;
  }

  const resultProperties = agentInterpretationResultSchema.properties;
  const result = deepFreeze({
    resultSchemaVersion: request.outputSchemaVersion,
    agentContractVersion: request.agentContractVersion,
    interpretationId: request.interpretationId,
    engineFactsRef: {
      diagnosticId: request.engineSnapshot.identity.diagnosticId,
      engineSnapshotDigest: request.engineSnapshot.engineSnapshotDigest,
      engineOutcomeCode: request.engineSnapshot.engine.outcome.engineOutcomeCode,
      branchCode: request.engineSnapshot.engine.outcome.branchCode ?? null,
      stateAsserted: request.engineSnapshot.engine.outcome.state,
    },
    interpretationStatus: validatedCandidate.interpretationStatus,
    abstentionReason: validatedCandidate.abstentionReason,
    interpretation: copyBySchema(
      validatedCandidate.interpretation,
      resultProperties.interpretation,
      agentInterpretationResultSchema,
      "result.interpretation",
    ),
    uncertainty: {
      materialUncertaintyPresent: structuredUncertainty.materialUncertaintyPresent,
      disclosures: copyBySchema(
        validatedCandidate.uncertainty.disclosures,
        resultProperties.uncertainty.properties.disclosures,
        agentInterpretationResultSchema,
        "result.uncertainty.disclosures",
      ),
      suppressedDeterministicOutputs: structuredUncertainty.withheldOutputs.map((row) => ({
        withheldItem: row.withheldItem,
        withheldBy: row.withheldBy,
      })),
    },
    claims: copyBySchema(
      validatedCandidate.claims,
      resultProperties.claims,
      agentInterpretationResultSchema,
      "result.claims",
    ),
    clientNarrative: copyBySchema(
      validatedCandidate.clientNarrative,
      resultProperties.clientNarrative,
      agentInterpretationResultSchema,
      "result.clientNarrative",
    ),
    provenance: {
      providerIdentity: executionMetadata.provider,
      modelIdentity: executionMetadata.model,
      executedAt: executionMetadata.executedAt,
      contextRefsUsed: [...contextRefsUsed],
    },
  });

  validateAgentInterpretationResultStructure(request, result);
  return result;
}

// Success assembly is fully deterministic: same frozen request, candidate, and
// trusted execution metadata always yield the same canonical result.
export function assembleAgentInterpretationResult({
  agentInterpretationRequest,
  providerExecutionOutput,
} = {}) {
  try {
    return assembleResult(agentInterpretationRequest, providerExecutionOutput);
  } catch (error) {
    if (error instanceof ResultAssemblyError) throw error;
    if (error instanceof AgentInterpretationResultValidationError) {
      throw new ResultAssemblyError({ failureClass: error.failureClass, detail: error.detail });
    }
    // Unexpected internal errors stay non-canonical runtime/operator defects:
    // rethrow the original error. No canonical failure class may be invented
    // for a condition this boundary cannot mechanically classify.
    throw error;
  }
}

function materializeSystemFailure(agentInterpretationRequest, failureClass, detail) {
  if (!SYSTEM_FAILURE_CLASSES.includes(failureClass)) {
    inputFail("a lawful canonical failure class is required to materialize a SystemFailure");
  }
  const request = requirePlainObject(agentInterpretationRequest, "agentInterpretationRequest");
  const snapshot = requirePlainObject(request.engineSnapshot, "agentInterpretationRequest.engineSnapshot");
  const identity = requirePlainObject(snapshot.identity, "agentInterpretationRequest.engineSnapshot.identity");
  if (typeof request.interpretationId !== "string" || request.interpretationId.length === 0) {
    inputFail("agentInterpretationRequest.interpretationId must be a non-empty string");
  }
  if (typeof identity.diagnosticId !== "string" || identity.diagnosticId.length === 0) {
    inputFail("engineSnapshot.identity.diagnosticId must be a non-empty string");
  }
  if (typeof snapshot.engineSnapshotDigest !== "string" || snapshot.engineSnapshotDigest.length === 0) {
    inputFail("engineSnapshot.engineSnapshotDigest must be a non-empty string");
  }
  const systemFailure = deepFreeze({
    failureSchemaVersion: "system-failure-1.0",
    interpretationId: request.interpretationId,
    diagnosticId: identity.diagnosticId,
    engineSnapshotDigest: snapshot.engineSnapshotDigest,
    failureClass,
    retryable: SYSTEM_FAILURE_RETRYABLE_BY_CLASS[failureClass] === true,
    detail: typeof detail === "string" && detail.length > 0 ? detail : null,
    occurredAt: new Date().toISOString(),
    clientDisclosure: "SYSTEM_LEVEL_ONLY",
  });
  validateSystemFailureStructure(systemFailure);
  return systemFailure;
}

// Aggregate execution-local mapping. The canonical class is selected by the
// execution failureClass through the frozen table; execution-local retryable
// hints never control canonical retryability.
export function mapProviderExecutionErrorToSystemFailure({
  agentInterpretationRequest,
  providerExecutionError,
} = {}) {
  if (!(providerExecutionError instanceof ProviderExecutionError)) {
    inputFail("mapProviderExecutionErrorToSystemFailure requires a ProviderExecutionError");
  }
  const canonicalClass = EXECUTION_FAILURE_TO_SYSTEM_FAILURE[providerExecutionError.failureClass];
  if (canonicalClass === undefined) {
    inputFail(`execution failure class ${providerExecutionError.failureClass} has no accepted canonical mapping`);
  }
  return materializeSystemFailure(
    agentInterpretationRequest,
    canonicalClass,
    providerExecutionError.detail,
  );
}

export function mapResultAssemblyErrorToSystemFailure({
  agentInterpretationRequest,
  resultAssemblyError,
} = {}) {
  if (!(resultAssemblyError instanceof ResultAssemblyError)) {
    inputFail("mapResultAssemblyErrorToSystemFailure requires a ResultAssemblyError");
  }
  return materializeSystemFailure(
    agentInterpretationRequest,
    resultAssemblyError.failureClass,
    resultAssemblyError.detail,
  );
}
