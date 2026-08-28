import {
  AUTHORIZED_MODULE_IDS,
  DUAL_COMPARATOR_VERSION,
  PRE_CORE_CLASSIFICATION_OUTCOME_BY_OUTCOME_CODE,
  PRE_CORE_FINALITY_BY_OUTCOME_CODE,
  PRE_CORE_OUTCOME_CLASS_BY_OUTCOME_CODE,
  PRE_CORE_OUTPUT_BY_OUTCOME_CODE,
  PRE_CORE_ROUTING_BY_OUTCOME_CODE,
  PRE_CORE_SUPPRESSION_BY_OUTCOME_CODE,
  QUESTION_UNIVERSE,
  RUNTIME_CORE_COMMIT,
  SELECTOR_STATUS_TO_PRE_CORE_OUTCOME_CODE,
  SNAPSHOT_SCHEMA_VERSION,
} from "./agentContractConstants.js";
import {
  AgentBoundaryAssemblyError,
  buildCorpusIdentity,
  computeEngineSnapshotDigest,
  projectSelectorProvenance,
} from "./engineSnapshot.js";

function fail(detail) {
  throw new AgentBoundaryAssemblyError({ detail });
}

function isPlainObject(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function requireObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be a plain object`);
  return value;
}

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`);
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

export function assemblePreCoreSelectorSnapshot({ identityContext, selectorProvenance } = {}) {
  const identity = requireObject(identityContext, "identityContext");
  const selector = projectSelectorProvenance(selectorProvenance);
  const engineOutcomeCode = SELECTOR_STATUS_TO_PRE_CORE_OUTCOME_CODE[selector.status];
  if (!engineOutcomeCode) {
    fail(`selectorProvenance.status cannot produce a PRE_CORE_SELECTOR snapshot: ${selector.status}`);
  }
  if (selector.candidatePair !== null || selector.candidatePairNormalized !== null) {
    fail("PRE_CORE_SELECTOR selector provenance cannot contain a candidate pair");
  }
  if (Object.hasOwn(identity, "candidatePair") && identity.candidatePair !== null) {
    fail("PRE_CORE_SELECTOR identityContext.candidatePair must be absent or null");
  }
  if (Object.hasOwn(identity, "candidatePairNormalized") && identity.candidatePairNormalized !== null) {
    fail("PRE_CORE_SELECTOR identityContext.candidatePairNormalized must be absent or null");
  }

  const diagnosticId = requireNonEmptyString(identity.diagnosticId, "identityContext.diagnosticId");
  const moduleId = requireNonEmptyString(identity.moduleId, "identityContext.moduleId");
  if (!AUTHORIZED_MODULE_IDS.includes(moduleId)) {
    fail(`identityContext.moduleId is not authorized: ${JSON.stringify(moduleId)}`);
  }
  if (moduleId !== selector.sourceModule) {
    fail("identityContext.moduleId must match selectorProvenance.sourceModule");
  }
  if (identity.projectId != null && typeof identity.projectId !== "string") {
    fail("identityContext.projectId must be a string or null");
  }

  const outcome = {
    engineOutcomeCode,
    outcomeClass: PRE_CORE_OUTCOME_CLASS_BY_OUTCOME_CODE[engineOutcomeCode],
    classificationOutcome: PRE_CORE_CLASSIFICATION_OUTCOME_BY_OUTCOME_CODE[engineOutcomeCode],
    state: null,
    deterministicStateEstablished: false,
    provisionalState: null,
    engineRoutingMetadata: PRE_CORE_ROUTING_BY_OUTCOME_CODE[engineOutcomeCode],
    engineOutput: PRE_CORE_OUTPUT_BY_OUTCOME_CODE[engineOutcomeCode],
    contradictionCandidates: [],
    genericContradictionEngineInvoked: false,
    suppression: { ...PRE_CORE_SUPPRESSION_BY_OUTCOME_CODE[engineOutcomeCode] },
    finality: PRE_CORE_FINALITY_BY_OUTCOME_CODE[engineOutcomeCode],
  };
  const engine = {
    outcome,
    observations: [],
  };
  const snapshotIdentity = {
    diagnosticId,
    projectId: identity.projectId ?? null,
    moduleId,
    instrumentSourceWorkbook: selector.sourceInstrument,
    candidatePair: null,
    candidatePairNormalized: null,
    questionUniverse: [...QUESTION_UNIVERSE],
    corpus: buildCorpusIdentity(),
    runtime: {
      coreCommit: identity.coreCommit ?? RUNTIME_CORE_COMMIT,
      dualComparatorVersion: DUAL_COMPARATOR_VERSION,
      layeredEvidenceScoringVersion: identity.layeredEvidenceScoringVersion ?? null,
    },
  };
  const coveredContent = {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    outcomeSource: "PRE_CORE_SELECTOR",
    identity: snapshotIdentity,
    selector,
    engine,
  };
  const snapshot = {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    engineSnapshotDigest: computeEngineSnapshotDigest(coveredContent),
    outcomeSource: "PRE_CORE_SELECTOR",
    identity: snapshotIdentity,
    selector,
    engine,
  };
  return deepFreeze(snapshot);
}
