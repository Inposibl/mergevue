import {
  FAILURE_SCHEMA_VERSION,
  SYSTEM_FAILURE_CLIENT_DISCLOSURE,
  SYSTEM_FAILURE_CLASSES,
  SYSTEM_FAILURE_RETRYABLE_BY_CLASS,
} from "./agentContractConstants.js";
import { validateSystemFailureStructure } from "./agentInterpretationResultSchema.js";
import { SEMANTIC_VIOLATION_CODES } from "./semanticValidatorConstants.js";
import {
  SEMANTIC_ERROR_KINDS,
  SemanticEvaluatorIncapacityError,
  SemanticProtocolError,
  SemanticValidationError,
  SemanticViolationError,
} from "./semanticValidationError.js";
import {
  SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES,
  SemanticJudgeTransportError,
} from "./semanticJudgeTransportError.js";

// J3 — Isolated semantic-stage SystemFailure mapper. Translates already-typed
// J1/J2 errors into the existing system-failure-1.0 envelope. Does not own
// validation, transport, retry, Result mutation, or production wiring.

const CONSTRAINT_ENFORCEMENT_FAILURE = "CONSTRAINT_ENFORCEMENT_FAILURE";

export class SemanticSystemFailureMappingError extends Error {
  constructor(detail) {
    super(`SemanticSystemFailureMappingError | detail=${detail}`);
    this.name = "SemanticSystemFailureMappingError";
    this.detail = typeof detail === "string" && detail.length > 0 ? detail : null;
  }
}

function mappingFail(detail) {
  throw new SemanticSystemFailureMappingError(detail);
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

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    mappingFail(`${label} must be a non-empty string`);
  }
  return value;
}

function extractRequestIdentity(agentInterpretationRequest) {
  if (!isPlainObject(agentInterpretationRequest)) {
    mappingFail("agentInterpretationRequest must be a plain object");
  }
  const snapshot = agentInterpretationRequest.engineSnapshot;
  if (!isPlainObject(snapshot)) {
    mappingFail("agentInterpretationRequest.engineSnapshot must be a plain object");
  }
  const identity = snapshot.identity;
  if (!isPlainObject(identity)) {
    mappingFail("agentInterpretationRequest.engineSnapshot.identity must be a plain object");
  }
  return {
    interpretationId: requireNonEmptyString(
      agentInterpretationRequest.interpretationId,
      "agentInterpretationRequest.interpretationId",
    ),
    diagnosticId: requireNonEmptyString(identity.diagnosticId, "engineSnapshot.identity.diagnosticId"),
    engineSnapshotDigest: requireNonEmptyString(
      snapshot.engineSnapshotDigest,
      "engineSnapshot.engineSnapshotDigest",
    ),
  };
}

function readOccurredAt(now) {
  if (now === undefined) return new Date().toISOString();
  if (typeof now !== "function") mappingFail("now must be a function when provided");
  const value = now();
  if (typeof value !== "string" || value.length === 0) {
    mappingFail("now() must return a non-empty ISO timestamp string");
  }
  return value;
}

function appendToken(parts, key, value) {
  if (typeof value === "string" && value.length > 0) {
    parts.push(`${key}=${value}`);
  }
}

function buildDetailFromSnapshot(snapshot) {
  const parts = [];
  appendToken(parts, "semanticErrorKind", snapshot.semanticErrorKind);
  appendToken(parts, "violationCode", snapshot.violationCode);
  appendToken(parts, "transportErrorCode", snapshot.transportErrorCode);
  return parts.length > 0 ? parts.join(" ") : null;
}

function closedSemanticErrorKind(kind) {
  const closed = SEMANTIC_ERROR_KINDS.find((entry) => entry === kind);
  if (closed === undefined) mappingFail("semanticErrorKind is not an accepted J1 error kind");
  return closed;
}

function snapshotSemanticValidationError(semanticValidationError) {
  if (!(semanticValidationError instanceof SemanticValidationError)) {
    mappingFail("mapSemanticValidationErrorToSystemFailure requires a SemanticValidationError");
  }
  if (semanticValidationError instanceof SemanticViolationError) {
    const violationCode = semanticValidationError.violationCode;
    if (!SEMANTIC_VIOLATION_CODES.includes(violationCode) || !SYSTEM_FAILURE_CLASSES.includes(violationCode)) {
      mappingFail("SemanticViolationError.violationCode is not an accepted canonical failureClass");
    }
    return deepFreeze({
      sourceKind: "violation",
      semanticErrorKind: closedSemanticErrorKind("SEMANTIC_VIOLATION"),
      violationCode,
      transportErrorCode: null,
      failureClass: violationCode,
    });
  }
  if (semanticValidationError instanceof SemanticEvaluatorIncapacityError) {
    return deepFreeze({
      sourceKind: "incapacity",
      semanticErrorKind: closedSemanticErrorKind("EVALUATOR_INCAPACITY"),
      violationCode: null,
      transportErrorCode: null,
      failureClass: CONSTRAINT_ENFORCEMENT_FAILURE,
    });
  }
  if (semanticValidationError instanceof SemanticProtocolError) {
    return deepFreeze({
      sourceKind: "protocol",
      semanticErrorKind: closedSemanticErrorKind("PROTOCOL_FAILURE"),
      violationCode: null,
      transportErrorCode: null,
      failureClass: CONSTRAINT_ENFORCEMENT_FAILURE,
    });
  }
  const errorKind = semanticValidationError.errorKind;
  if (errorKind === "INPUT_PRECONDITION_FAILURE") {
    return deepFreeze({
      sourceKind: "precondition",
      semanticErrorKind: closedSemanticErrorKind(errorKind),
      violationCode: null,
      transportErrorCode: null,
      failureClass: CONSTRAINT_ENFORCEMENT_FAILURE,
    });
  }
  mappingFail("semanticValidationError is not an accepted typed semantic-stage error");
}

function snapshotSemanticJudgeTransportError(semanticJudgeTransportError) {
  if (!(semanticJudgeTransportError instanceof SemanticJudgeTransportError)) {
    mappingFail("mapSemanticJudgeTransportErrorToSystemFailure requires a SemanticJudgeTransportError");
  }
  const transportErrorCode = semanticJudgeTransportError.errorCode;
  if (!SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES.includes(transportErrorCode)) {
    mappingFail("SemanticJudgeTransportError.errorCode is not an accepted J2 transport code");
  }
  return deepFreeze({
    sourceKind: "transport",
    semanticErrorKind: null,
    violationCode: null,
    transportErrorCode,
    failureClass: CONSTRAINT_ENFORCEMENT_FAILURE,
  });
}

function resolveCanonicalRetryable(failureClass) {
  if (!Object.hasOwn(SYSTEM_FAILURE_RETRYABLE_BY_CLASS, failureClass)) {
    mappingFail("failureClass has no canonical retryability entry");
  }
  return SYSTEM_FAILURE_RETRYABLE_BY_CLASS[failureClass] === true;
}

function materializeCanonicalSystemFailure({
  agentInterpretationRequest,
  failureClass,
  detail,
  now,
}) {
  if (!SYSTEM_FAILURE_CLASSES.includes(failureClass)) {
    mappingFail("unknown canonical failureClass");
  }
  const identity = extractRequestIdentity(agentInterpretationRequest);
  const systemFailure = deepFreeze({
    failureSchemaVersion: FAILURE_SCHEMA_VERSION,
    interpretationId: identity.interpretationId,
    diagnosticId: identity.diagnosticId,
    engineSnapshotDigest: identity.engineSnapshotDigest,
    failureClass,
    retryable: resolveCanonicalRetryable(failureClass),
    detail,
    occurredAt: readOccurredAt(now),
    clientDisclosure: SYSTEM_FAILURE_CLIENT_DISCLOSURE,
  });
  return validateSystemFailureStructure(systemFailure);
}

export function mapSemanticValidationErrorToSystemFailure({
  agentInterpretationRequest,
  semanticValidationError,
  now,
} = {}) {
  const snapshot = snapshotSemanticValidationError(semanticValidationError);
  return materializeCanonicalSystemFailure({
    agentInterpretationRequest,
    failureClass: snapshot.failureClass,
    detail: buildDetailFromSnapshot(snapshot),
    now,
  });
}

export function mapSemanticJudgeTransportErrorToSystemFailure({
  agentInterpretationRequest,
  semanticJudgeTransportError,
  now,
} = {}) {
  const snapshot = snapshotSemanticJudgeTransportError(semanticJudgeTransportError);
  return materializeCanonicalSystemFailure({
    agentInterpretationRequest,
    failureClass: snapshot.failureClass,
    detail: buildDetailFromSnapshot(snapshot),
    now,
  });
}
