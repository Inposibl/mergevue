import { randomUUID } from "node:crypto";

import {
  AGENT_CONTRACT_VERSION,
  BASELINE_CONSTRAINT_IDS,
  BLOCKED_CLAIM_IDS_BY_CONSTRAINT,
  BRANCH_CODES,
  CONSTRAINTS_BY_BRANCH,
  CONSTRAINT_SCOPE_BRANCH,
  CONSTRAINT_SCOPE_REQUEST_WIDE,
  CONTEXT_PACK_SCHEMA_VERSION,
  FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  FREE_INTERPRETATION_MODE,
  OUTPUT_SCHEMA_VERSION,
  PACK_SCOPE_VERDICTS,
  REQUEST_SCHEMA_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
  UNCERTAINTY_SCHEMA_VERSION,
} from "./agentContractConstants.js";
import { canonicalSerialize } from "./canonicalDigest.js";
import {
  computeEngineSnapshotDigest,
  deriveFreeInterpretationMode,
  engineSnapshotDigestCoveredContent,
} from "./engineSnapshot.js";
import { buildStructuredUncertainty } from "./structuredUncertainty.js";
import { buildInterpretationContextPack } from "./interpretationContextPack.js";

export class AgentInterpretationRequestAssemblyError extends Error {
  constructor({ failureClass, detail } = {}) {
    const parts = [
      "AgentInterpretationRequestAssemblyError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "AgentInterpretationRequestAssemblyError";
    this.failureClass = failureClass ?? FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE;
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new AgentInterpretationRequestAssemblyError({
    failureClass: FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
    detail,
  });
}

function versionFail(detail) {
  throw new AgentInterpretationRequestAssemblyError({
    failureClass: FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
    detail,
  });
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
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

function requireSha256Digest(value, label) {
  if (typeof value !== "string" || !/^sha256:[0-9a-f]{64}$/.test(value)) {
    fail(`${label} must be a sha256-prefixed digest`);
  }
  return value;
}

function canonicalBytesOrFail(value, label) {
  try {
    return canonicalSerialize(value);
  } catch (error) {
    fail(`${label} canonical serialization failed: ${error?.message ?? error}`);
  }
}

function validateEngineSnapshot(engineSnapshot) {
  const snapshot = requireObject(engineSnapshot, "engineSnapshot");
  if (snapshot.snapshotSchemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    versionFail(`engineSnapshot.snapshotSchemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}`);
  }
  requireSha256Digest(snapshot.engineSnapshotDigest, "engineSnapshot.engineSnapshotDigest");
  const outcome = requireObject(
    requireObject(snapshot.engine, "engineSnapshot.engine").outcome,
    "engineSnapshot.engine.outcome",
  );
  if (!BRANCH_CODES.includes(outcome.branchCode)) {
    fail(`engineSnapshot.engine.outcome.branchCode is not a closed branch: ${JSON.stringify(outcome.branchCode)}`);
  }
  let expectedDigest;
  try {
    const covered = engineSnapshotDigestCoveredContent(snapshot);
    expectedDigest = computeEngineSnapshotDigest(covered.engine, covered.corpus);
  } catch (error) {
    fail(`engineSnapshot digest recomputation failed: ${error?.message ?? error}`);
  }
  if (expectedDigest !== snapshot.engineSnapshotDigest) {
    fail("engineSnapshot.engineSnapshotDigest does not match the recomputed canonical digest");
  }
  return snapshot;
}

function validateStructuredUncertainty(engineSnapshot, structuredUncertainty) {
  const supplied = requireObject(structuredUncertainty, "structuredUncertainty");
  if (supplied.uncertaintySchemaVersion !== UNCERTAINTY_SCHEMA_VERSION) {
    versionFail(`structuredUncertainty.uncertaintySchemaVersion must be ${UNCERTAINTY_SCHEMA_VERSION}`);
  }
  let rederived;
  try {
    rederived = buildStructuredUncertainty(engineSnapshot);
  } catch (error) {
    fail(`structuredUncertainty re-derivation failed: ${error?.message ?? error}`);
  }
  const suppliedBytes = canonicalBytesOrFail(supplied, "structuredUncertainty");
  const rederivedBytes = canonicalBytesOrFail(rederived, "re-derived structuredUncertainty");
  if (suppliedBytes !== rederivedBytes) {
    fail("structuredUncertainty does not equal the canonical re-derivation from engineSnapshot");
  }
  return supplied;
}

function validateInterpretationContextPack(engineSnapshot, structuredUncertainty, interpretationContextPack) {
  const pack = requireObject(interpretationContextPack, "interpretationContextPack");
  if (pack.contextPackSchemaVersion !== CONTEXT_PACK_SCHEMA_VERSION) {
    versionFail(`interpretationContextPack.contextPackSchemaVersion must be ${CONTEXT_PACK_SCHEMA_VERSION}`);
  }
  requireSha256Digest(pack.contextPackId, "interpretationContextPack.contextPackId");
  requireSha256Digest(pack.contextPackDigest, "interpretationContextPack.contextPackDigest");
  const corpus = requireObject(
    requireObject(engineSnapshot.identity, "engineSnapshot.identity").corpus,
    "engineSnapshot.identity.corpus",
  );
  if (pack.methodologyCorpusDigest !== corpus.corpusDigest) {
    fail("interpretationContextPack.methodologyCorpusDigest does not bind to engineSnapshot.identity.corpus.corpusDigest");
  }
  if (pack.methodologySourcePackageId !== corpus.sourcePackageId) {
    fail("interpretationContextPack.methodologySourcePackageId does not bind to the snapshot corpus");
  }
  const keys = requireObject(pack.selectionKeys, "interpretationContextPack.selectionKeys");
  if (!Array.isArray(keys.establishedEnvironmentCodes)) {
    fail("interpretationContextPack.selectionKeys.establishedEnvironmentCodes must be an array");
  }
  const crossSideEnvironmentPair = keys.crossSideEnvironmentPair == null
    ? null
    : requireObject(
      keys.crossSideEnvironmentPair,
      "interpretationContextPack.selectionKeys.crossSideEnvironmentPair",
    );
  let rederived;
  try {
    rederived = buildInterpretationContextPack({
      engineSnapshot,
      structuredUncertainty,
      establishedEnvironmentCodes: keys.establishedEnvironmentCodes,
      crossSideEnvironmentPair,
    });
  } catch (error) {
    fail(`interpretationContextPack re-derivation failed: ${error?.message ?? error}`);
  }
  const suppliedBytes = canonicalBytesOrFail(pack, "interpretationContextPack");
  const rederivedBytes = canonicalBytesOrFail(rederived, "re-derived interpretationContextPack");
  if (suppliedBytes !== rederivedBytes) {
    fail("interpretationContextPack does not equal the canonical re-derivation from the supplied upstream state");
  }
  return pack;
}

function blockedClaimIdsFor(constraintId) {
  const blocked = BLOCKED_CLAIM_IDS_BY_CONSTRAINT[constraintId];
  return Object.freeze(blocked ? [...blocked] : []);
}

function buildActiveConstraints(currentBranch) {
  const rows = [];
  const seen = new Set();
  const emit = (constraintId, scope) => {
    if (seen.has(constraintId)) return;
    seen.add(constraintId);
    rows.push(Object.freeze({
      constraintId,
      scope,
      blockedClaimIds: blockedClaimIdsFor(constraintId),
      originBranch: currentBranch,
    }));
  };
  for (const constraintId of BASELINE_CONSTRAINT_IDS) {
    emit(constraintId, CONSTRAINT_SCOPE_REQUEST_WIDE);
  }
  for (const constraintId of CONSTRAINTS_BY_BRANCH[currentBranch] ?? []) {
    emit(constraintId, CONSTRAINT_SCOPE_BRANCH);
  }
  return Object.freeze(rows);
}

function assertUncertaintyConstraintConsistency(structuredUncertainty, activatedIds, currentBranch) {
  for (const item of structuredUncertainty.items ?? []) {
    for (const constraintId of item.constraintIds ?? []) {
      if (!activatedIds.has(constraintId)) {
        fail(
          `structuredUncertainty item ${item.uncertaintyId ?? "?"} carries constraint ${constraintId} `
          + `which is not canonically activated on ${currentBranch}`,
        );
      }
    }
  }
}

function unresolvedReasonForMode(snapshot, currentBranch) {
  if (currentBranch !== "P_0C") return undefined;
  const auditRaw = requireObject(
    snapshot.engine.outcome.engineAuditRaw,
    "engineSnapshot.engine.outcome.engineAuditRaw",
  );
  return Object.hasOwn(auditRaw, "unresolvedReason") ? auditRaw.unresolvedReason : null;
}

export function buildAgentInterpretationRequest({
  engineSnapshot,
  structuredUncertainty,
  interpretationContextPack,
} = {}) {
  const snapshot = validateEngineSnapshot(engineSnapshot);
  const uncertainty = validateStructuredUncertainty(snapshot, structuredUncertainty);
  const pack = validateInterpretationContextPack(snapshot, uncertainty, interpretationContextPack);

  const currentBranch = snapshot.engine.outcome.branchCode;

  let freeInterpretationMode;
  try {
    freeInterpretationMode = deriveFreeInterpretationMode(currentBranch, {
      unresolvedReason: unresolvedReasonForMode(snapshot, currentBranch),
    });
  } catch (error) {
    fail(`freeInterpretationMode derivation failed: ${error?.message ?? error}`);
  }

  const activeConstraints = buildActiveConstraints(currentBranch);
  assertUncertaintyConstraintConsistency(
    uncertainty,
    new Set(activeConstraints.map((row) => row.constraintId)),
    currentBranch,
  );

  const request = {
    requestSchemaVersion: REQUEST_SCHEMA_VERSION,
    agentContractVersion: AGENT_CONTRACT_VERSION,
    interpretationId: randomUUID(),
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    interpretationContextPack: pack,
    permittedOutputScope: pack.packScopeVerdict,
    permittedInterpretationDomains: pack.permittedInterpretationDomains,
    freeInterpretationMode,
    humanReviewOccurred: false,
    activeConstraints,
    outputSchemaVersion: OUTPUT_SCHEMA_VERSION,
  };
  return deepFreeze(request);
}

const INTEGRITY_ROOT_KEYS = Object.freeze([
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

function assertExactRootKeys(request) {
  const expected = new Set(INTEGRITY_ROOT_KEYS);
  const missing = [...expected].filter((key) => !Object.hasOwn(request, key));
  const unexpected = Object.keys(request).filter((key) => !expected.has(key));
  if (missing.length > 0) fail(`agentInterpretationRequest is missing keys: ${missing.join(", ")}`);
  if (unexpected.length > 0) {
    fail(`agentInterpretationRequest carries unexpected keys: ${unexpected.join(", ")}`);
  }
}

// Immutability is asserted, never repaired: a malformed external input must not
// be frozen into validity by this boundary.
function assertDeepFrozen(value, label) {
  if (value === null || typeof value !== "object") return;
  if (!Object.isFrozen(value)) fail(`${label} must be frozen`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDeepFrozen(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${label}.${key}`);
}

// Fail-closed revalidation of an already-built canonical request at the exported
// JS trust boundary. Reuses the assembly-time validation primitives so builder
// semantics, field order, schema versions, and digests stay untouched.
export function validateAgentInterpretationRequestIntegrity(request) {
  const supplied = requireObject(request, "agentInterpretationRequest");

  assertExactRootKeys(supplied);

  if (supplied.requestSchemaVersion !== REQUEST_SCHEMA_VERSION) {
    versionFail(`requestSchemaVersion must be ${REQUEST_SCHEMA_VERSION}`);
  }
  if (supplied.agentContractVersion !== AGENT_CONTRACT_VERSION) {
    versionFail(`agentContractVersion must be ${AGENT_CONTRACT_VERSION}`);
  }
  if (supplied.outputSchemaVersion !== OUTPUT_SCHEMA_VERSION) {
    versionFail(`outputSchemaVersion must be ${OUTPUT_SCHEMA_VERSION}`);
  }
  if (typeof supplied.interpretationId !== "string" || supplied.interpretationId.length === 0) {
    fail("interpretationId must be a non-empty string");
  }

  assertDeepFrozen(supplied, "agentInterpretationRequest");

  const snapshot = validateEngineSnapshot(supplied.engineSnapshot);
  const uncertainty = validateStructuredUncertainty(snapshot, supplied.structuredUncertainty);
  const pack = validateInterpretationContextPack(snapshot, uncertainty, supplied.interpretationContextPack);

  if (!PACK_SCOPE_VERDICTS.includes(supplied.permittedOutputScope)) {
    fail(`permittedOutputScope is not lawful: ${JSON.stringify(supplied.permittedOutputScope)}`);
  }
  if (supplied.permittedOutputScope !== pack.packScopeVerdict) {
    fail("permittedOutputScope does not mirror interpretationContextPack.packScopeVerdict");
  }
  if (!Array.isArray(supplied.permittedInterpretationDomains)) {
    fail("permittedInterpretationDomains must be an array");
  }
  supplied.permittedInterpretationDomains.forEach((domain, index) => {
    if (typeof domain !== "string") fail(`permittedInterpretationDomains[${index}] must be a string`);
  });
  if (
    canonicalBytesOrFail(supplied.permittedInterpretationDomains, "permittedInterpretationDomains")
    !== canonicalBytesOrFail(pack.permittedInterpretationDomains, "interpretationContextPack.permittedInterpretationDomains")
  ) {
    fail("permittedInterpretationDomains does not ordered-mirror interpretationContextPack.permittedInterpretationDomains");
  }

  const currentBranch = snapshot.engine.outcome.branchCode;
  if (uncertainty.originBranch !== currentBranch) {
    fail("structuredUncertainty.originBranch does not mirror engineSnapshot.engine.outcome.branchCode");
  }

  let expectedMode;
  try {
    expectedMode = deriveFreeInterpretationMode(currentBranch, {
      unresolvedReason: unresolvedReasonForMode(snapshot, currentBranch),
    });
  } catch (error) {
    fail(`freeInterpretationMode derivation failed: ${error?.message ?? error}`);
  }
  if (!Object.values(FREE_INTERPRETATION_MODE).includes(supplied.freeInterpretationMode)) {
    fail(`freeInterpretationMode is not lawful: ${JSON.stringify(supplied.freeInterpretationMode)}`);
  }
  if (supplied.freeInterpretationMode !== expectedMode) {
    fail("freeInterpretationMode does not equal the canonical derivation for the snapshot branch");
  }

  const expectedConstraints = buildActiveConstraints(currentBranch);
  if (
    canonicalBytesOrFail(supplied.activeConstraints, "activeConstraints")
    !== canonicalBytesOrFail(expectedConstraints, "re-derived activeConstraints")
  ) {
    fail("activeConstraints does not equal the canonical ordered activation for the snapshot branch");
  }
  assertUncertaintyConstraintConsistency(
    uncertainty,
    new Set(expectedConstraints.map((row) => row.constraintId)),
    currentBranch,
  );

  if (supplied.humanReviewOccurred !== false) {
    fail("humanReviewOccurred must remain false");
  }

  return supplied;
}
