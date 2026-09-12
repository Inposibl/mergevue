import {
  DOMAIN_TAG,
  LINEAGE_STATE,
  REGION,
  XPI_PURPOSE,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { canonicalSerialize, sortUniqueStrings } from "./canonical.js";
import { createRenderingDerivation } from "./rendering.js";

function accessSetDigest(accessSet) {
  return computeIdentity(DOMAIN_TAG.XPI_ACCESS_SET, sortUniqueStrings(accessSet));
}

export function beginXpiExecution(runtime, {
  appliedProcedureIdentity,
  scopeIdentity = null,
  suppliedUniverse,
  executionPurpose,
  occurrenceDomainIdentity,
}) {
  if (!Object.values(XPI_PURPOSE).includes(executionPurpose)) {
    failClosed("XPI_PURPOSE_INVALID", executionPurpose);
  }
  const suppliedUniverseDigest = computeIdentity(
    DOMAIN_TAG.XPI_SUPPLIED_UNIVERSE,
    sortUniqueStrings(suppliedUniverse ?? []),
  );
  const executionOrdinal = runtime.allocators.nextExecutionOrdinal(
    occurrenceDomainIdentity ?? scopeIdentity ?? "xpi",
  );
  const executionId = computeIdentity(DOMAIN_TAG.XPI_EXECUTION, {
    appliedProcedureIdentity,
    scopeIdentity,
    suppliedUniverseDigest,
    executionPurpose,
    executionOrdinal,
  });
  const record = {
    executionId,
    appliedProcedureIdentity,
    scopeIdentity,
    suppliedUniverseDigest,
    suppliedUniverse: suppliedUniverse ?? [],
    executionPurpose,
    executionOrdinal,
    completed: false,
    accessEvents: [],
    accessSet: [],
    lineageState: LINEAGE_STATE.LINEAGE_NOT_ESTABLISHED,
    unauthorizedAttempt: false,
  };
  runtime.store.put("xpiExecution", executionId, record);
  runtime.recordTrace("XAD-1", { executionId, path: "XPI_BEGIN", executionPurpose });
  return record;
}

function sameLineage(left, right) {
  return canonicalSerialize(sortUniqueStrings(left ?? []))
    === canonicalSerialize(sortUniqueStrings(right ?? []));
}

function verifyStoredDerivative(runtime, derivative, requestedId) {
  if (!derivative || typeof derivative.protectedDerivativeId !== "string") {
    failClosed("PROTECTED_MATERIAL_UNRESOLVABLE");
  }
  if (derivative.protectedDerivativeId !== requestedId) {
    failClosed("DERIVATIVE_IDENTITY_INCONSISTENT");
  }
  if (derivative.lineageState !== LINEAGE_STATE.LINEAGE_ESTABLISHED) {
    failClosed("LINEAGE_NOT_ESTABLISHED");
  }
  const producer = runtime.store.tryGet("xpiExecution", derivative.executionId);
  if (!producer || producer.completed !== true) {
    failClosed("LINEAGE_NOT_ESTABLISHED", "producer execution not complete");
  }
  if (!sameLineage(derivative.evidenceLineage, producer.accessSet)) {
    failClosed("DERIVATIVE_LINEAGE_INCONSISTENT");
  }
  const recomputed = computeIdentity(DOMAIN_TAG.XPI_DERIVATIVE, {
    executionId: derivative.executionId,
    outputOrdinal: derivative.outputOrdinal,
    accessSetDigest: accessSetDigest(producer.accessSet),
  });
  if (recomputed !== requestedId) {
    failClosed("DERIVATIVE_IDENTITY_INCONSISTENT");
  }
}

function resolveProtectedMaterial(runtime, accessedMaterialIdentity) {
  if (typeof accessedMaterialIdentity !== "string" || accessedMaterialIdentity.length === 0) {
    failClosed("PROTECTED_MATERIAL_UNRESOLVABLE");
  }
  const derivative = runtime.store.tryGet("xpiDerivative", accessedMaterialIdentity);
  if (derivative) {
    verifyStoredDerivative(runtime, derivative, accessedMaterialIdentity);
    return {
      kind: "PCM-2",
      evidenceLineage: sortUniqueStrings(derivative.evidenceLineage),
      payload: derivative.payload,
      record: derivative,
    };
  }
  const byBindingId = runtime.store.tryGet("evidenceBinding", accessedMaterialIdentity);
  const payloadMatches = runtime.store.list("evidenceBinding").filter((binding) => (
    binding.payloadIdentity === accessedMaterialIdentity
    || binding.accessedMaterialIdentity === accessedMaterialIdentity
  ));
  let binding = byBindingId;
  if (!binding && payloadMatches.length > 1) failClosed("PROTECTED_MATERIAL_AMBIGUOUS");
  if (!binding && payloadMatches.length === 1) binding = payloadMatches[0];
  if (!binding || typeof binding.evidenceBindingId !== "string") {
    failClosed("PROTECTED_MATERIAL_UNRESOLVABLE");
  }
  return {
    kind: "PCM-1",
    evidenceLineage: sortUniqueStrings([binding.evidenceBindingId]),
    payload: binding.payload ?? binding.accessedPayload,
    record: binding,
  };
}

function assertLineageInsideSuppliedUniverse(execution, evidenceLineage) {
  if (execution.executionPurpose !== XPI_PURPOSE.ADJUDICATION) return;
  const universe = new Set(execution.suppliedUniverse ?? []);
  for (const bindingId of evidenceLineage) {
    if (!universe.has(bindingId)) {
      failClosed("LINEAGE_OUTSIDE_SUPPLIED_UNIVERSE", bindingId);
    }
  }
}

export function accessProtectedMaterial(runtime, {
  executionId,
  accessedMaterialIdentity,
}) {
  const execution = runtime.store.get("xpiExecution", executionId);
  if (execution.completed) failClosed("XPI_EXECUTION_ALREADY_COMPLETED");
  const resolved = resolveProtectedMaterial(runtime, accessedMaterialIdentity);
  const evidenceLineage = resolved.evidenceLineage;
  assertLineageInsideSuppliedUniverse(execution, evidenceLineage);
  const accessOrdinal = execution.accessEvents.length + 1;
  const evidenceAccessEventId = computeIdentity(DOMAIN_TAG.XPI_ACCESS_EVENT, {
    executionId,
    accessedMaterialIdentity,
    accessOrdinal,
  });
  const event = {
    evidenceAccessEventId,
    executionId,
    accessedMaterialIdentity,
    evidenceLineage,
    accessOrdinal,
    accessedPayload: resolved.payload,
    materialKind: resolved.kind,
  };
  runtime.store.put("xpiAccessEvent", evidenceAccessEventId, event);
  const accessSet = sortUniqueStrings([
    ...execution.accessSet,
    ...event.evidenceLineage,
  ]);
  const next = {
    ...execution,
    accessEvents: [...execution.accessEvents, evidenceAccessEventId],
    accessSet,
  };
  runtime.store.replace("xpiExecution", executionId, next);
  runtime.recordTrace("XAD-1", {
    executionId,
    evidenceAccessEventId,
    accessedMaterialIdentity,
    path: "XPI_ACCESS",
    evidenceLineage,
  });
  return event;
}

export function rejectUnauthorizedAccess(runtime, executionId, detail) {
  const execution = runtime.store.get("xpiExecution", executionId);
  runtime.store.replace("xpiExecution", executionId, {
    ...execution,
    unauthorizedAttempt: true,
  });
  runtime.recordTrace("XAD-1", {
    executionId,
    path: "UNAUTHORIZED_EXECUTION_PATH",
    blocked: true,
    detail,
  });
  failClosed("UNAUTHORIZED_EXECUTION_PATH", detail);
}

export function completeXpiExecution(runtime, executionId, { outputs = [] } = {}) {
  const execution = runtime.store.get("xpiExecution", executionId);
  if (execution.unauthorizedAttempt) failClosed("UNAUTHORIZED_EXECUTION_PATH");
  const accessSet = sortUniqueStrings(execution.accessSet);
  const digest = accessSetDigest(accessSet);
  const derivatives = outputs.map((output, index) => {
    const outputOrdinal = index + 1;
    const protectedDerivativeId = computeIdentity(DOMAIN_TAG.XPI_DERIVATIVE, {
      executionId,
      outputOrdinal,
      accessSetDigest: digest,
    });
    const derivative = {
      protectedDerivativeId,
      executionId,
      outputOrdinal,
      evidenceLineage: accessSet,
      lineageState: LINEAGE_STATE.LINEAGE_ESTABLISHED,
      payload: output.payload,
    };
    runtime.store.put("xpiDerivative", protectedDerivativeId, derivative);
    return derivative;
  });
  const completed = {
    ...execution,
    completed: true,
    accessSet,
    accessSetDigest: digest,
    lineageState: LINEAGE_STATE.LINEAGE_ESTABLISHED,
    derivativeIds: derivatives.map((item) => item.protectedDerivativeId),
  };
  runtime.store.replace("xpiExecution", executionId, completed);
  runtime.recordTrace("XAD-1", { executionId, path: "XPI_COMPLETE", accessSet });
  return { execution: completed, derivatives };
}

export function xpiAccessSet(runtime, executionId) {
  const execution = runtime.store.get("xpiExecution", executionId);
  const events = execution.accessEvents.map((id) => runtime.store.get("xpiAccessEvent", id));
  const derived = sortUniqueStrings(events.flatMap((event) => event.evidenceLineage));
  if (runtime.canonicalSerialize(derived) !== runtime.canonicalSerialize(execution.accessSet)
    && execution.completed) {
    failClosed("XPI_ACCESS_SET_DRIFT");
  }
  return derived;
}

export function renderProtectedItemForEmim(runtime, {
  evidenceAccessEventId,
  executionId,
  renderingParameters = {},
}) {
  const event = runtime.store.get("xpiAccessEvent", evidenceAccessEventId);
  if (event.executionId !== executionId) {
    failClosed("XPI_ACCESS_EXECUTION_MISMATCH");
  }
  const derivation = createRenderingDerivation(runtime, {
    sourceMaterialIdentity: event.accessedMaterialIdentity,
    sourceAccessReference: evidenceAccessEventId,
    sourceMaterial: event.accessedPayload,
    renderingParameters,
    region: REGION.R3,
  });
  if (derivation.sourceAccessReference !== evidenceAccessEventId) {
    failClosed("XPI_SOURCE_ACCESS_REFERENCE_MISMATCH");
  }
  return derivation;
}

export function assertExactXpiAccessReference(derivation, evidenceAccessEventId) {
  if (derivation.sourceAccessReference !== evidenceAccessEventId) {
    failClosed("XPI_SOURCE_ACCESS_REFERENCE_MISMATCH");
  }
}

export function assertNoXpiBypass() {
  failClosed("UNAUTHORIZED_EXECUTION_PATH", "no rawRead / same-material shortcut");
}
