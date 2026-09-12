import {
  ANCHOR_KIND,
  AUTHORITY_CLASS,
  CANONICAL_SERIALIZATION_VERSION,
  DOMAIN_TAG,
  EXECUTION_CLASS,
  ITEM_CHANNEL,
  LAWFUL_CLASSES_BY_REGION,
  REGION,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { recoverRenderedContent, resolveDerivation } from "./rendering.js";

const EXCLUDED_FROM_SURFACE = Object.freeze([
  "governingExecutionRef",
  "emimCommitmentDigest",
  "executionOrdinal",
  "actualExecutionTimestamp",
  "executionCompletionStatus",
  "modelExecutionRecord",
  "outputs",
  "historicalExecutionId",
  "modelOutput",
]);

function authorityClassForChannel(channel) {
  if (channel === ITEM_CHANNEL.NON_HISTORICAL_INSTRUCTION
    || channel === ITEM_CHANNEL.SYSTEM_INSTRUCTION
    || channel === ITEM_CHANNEL.USER_CONTEXT) {
    return AUTHORITY_CLASS.AUTHORITY_BEARING;
  }
  return AUTHORITY_CLASS.AUTHORITY_INERT;
}

function isHistoricalAnchor(anchor) {
  if (!anchor || typeof anchor !== "object") return false;
  return anchor.kind !== ANCHOR_KIND.NON_HISTORICAL_INSTRUCTION;
}

export function buildCommitmentSurface({
  executionClass,
  governingScopeIdentity,
  missionEnvelopeRef = null,
  resolutionMandateRef = null,
  responsibleActorRef,
  actorAssignmentRef,
  inputItems,
  declaredModelBinding = null,
}) {
  if (!Object.values(EXECUTION_CLASS).includes(executionClass)) {
    failClosed("EXECUTION_CLASS_INVALID", executionClass);
  }
  if (typeof governingScopeIdentity !== "string" || governingScopeIdentity.length === 0) {
    failClosed("GOVERNING_SCOPE_INVALID");
  }
  if (!Array.isArray(inputItems)) failClosed("EMIM_INPUT_ITEMS_INVALID");

  const orderedItems = inputItems.map((item, index) => {
    if (!item || typeof item !== "object") failClosed("EMIM_ITEM_INVALID", String(index));
    const ordinal = item.inputItemOrdinal ?? index + 1;
    if (ordinal !== index + 1) failClosed("EMIM_ITEM_ORDINAL_GAP", String(ordinal));
    if (!Object.values(ITEM_CHANNEL).includes(item.itemChannel)) {
      failClosed("EMIM_ITEM_CHANNEL_INVALID", item.itemChannel);
    }
    const assignedClass = authorityClassForChannel(item.itemChannel);
    if (item.itemAuthorityClass && item.itemAuthorityClass !== assignedClass) {
      failClosed("AUTHORITY_CLASS_NOT_BY_CHANNEL", item.itemChannel);
    }
    if (!item.provenanceAnchor || typeof item.provenanceAnchor !== "object") {
      failClosed("PROVENANCE_ANCHOR_UNRESOLVABLE", String(ordinal));
    }
    if (!Object.values(ANCHOR_KIND).includes(item.provenanceAnchor.kind)) {
      failClosed("PROVENANCE_ANCHOR_KIND_INVALID", item.provenanceAnchor.kind);
    }
    if (isHistoricalAnchor(item.provenanceAnchor) && !item.renderingDerivationRecordRef) {
      failClosed("RENDERING_DERIVATION_REQUIRED", String(ordinal));
    }
    return {
      inputItemOrdinal: ordinal,
      itemChannel: item.itemChannel,
      itemAuthorityClass: assignedClass,
      provenanceAnchor: item.provenanceAnchor,
      renderingDerivationRecordRef: item.renderingDerivationRecordRef ?? null,
      renderedContentDigest: item.renderedContentDigest ?? null,
    };
  });

  return {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    executionClass,
    governingScopeIdentity,
    missionEnvelopeRef,
    resolutionMandateRef,
    responsibleActorRef,
    actorAssignmentRef,
    inputItems: orderedItems,
    declaredModelBinding,
  };
}

export function assertSurfaceAcyclic(surface) {
  for (const excluded of EXCLUDED_FROM_SURFACE) {
    if (Object.prototype.hasOwnProperty.call(surface, excluded) && surface[excluded] !== undefined) {
      failClosed("EMIM_SURFACE_CONTAINS_EXCLUDED_FIELD", excluded);
    }
  }
}

export function projectCommitmentSurface(record) {
  return buildCommitmentSurface({
    executionClass: record.executionClass,
    governingScopeIdentity: record.governingScopeIdentity,
    missionEnvelopeRef: record.missionEnvelopeRef ?? null,
    resolutionMandateRef: record.resolutionMandateRef ?? null,
    responsibleActorRef: record.responsibleActorRef,
    actorAssignmentRef: record.actorAssignmentRef,
    inputItems: record.inputItems,
    declaredModelBinding: record.declaredModelBinding ?? null,
  });
}

export function commitEmim(runtime, input, { region, xpiExecutionId = null } = {}) {
  const surface = buildCommitmentSurface(input);
  assertSurfaceAcyclic(surface);

  const lawful = LAWFUL_CLASSES_BY_REGION[region] ?? [];
  if (region === REGION.R2) failClosed("R2_HLX_INVOCATION_PROHIBITED");
  if (!lawful.includes(surface.executionClass)) {
    failClosed("EXECUTION_CLASS_REGION_MISMATCH", `${surface.executionClass} in ${region}`);
  }

  runtime.assertActorCoherent({
    responsibleActorRef: surface.responsibleActorRef,
    actorAssignmentRef: surface.actorAssignmentRef,
    activityKind: "model_invocation",
    actScope: surface.governingScopeIdentity,
  });

  if (region === REGION.R0) {
    if (surface.missionEnvelopeRef != null) failClosed("R0_MISSION_ENVELOPE_FORBIDDEN");
    if (surface.resolutionMandateRef == null) failClosed("R0_RESOLUTION_MANDATE_REQUIRED");
  }
  if (region === REGION.R1) {
    if (surface.resolutionMandateRef != null) failClosed("R1_RESOLUTION_MANDATE_FORBIDDEN");
    if (surface.missionEnvelopeRef == null) failClosed("R1_MISSION_ENVELOPE_REQUIRED");
  }

  for (const item of surface.inputItems) {
    if (item.renderingDerivationRecordRef) {
      const derivation = resolveDerivation(runtime, item.renderingDerivationRecordRef);
      if (item.renderedContentDigest
        && item.renderedContentDigest !== derivation.producedRenderedContentArtifactRef) {
        failClosed("EMIM_ITEM_DIGEST_MISMATCH", String(item.inputItemOrdinal));
      }
      item.renderedContentDigest = derivation.producedRenderedContentArtifactRef;
      recoverRenderedContent(runtime, item.renderedContentDigest);
    } else if (isHistoricalAnchor(item.provenanceAnchor)) {
      failClosed("HISTORICAL_ITEM_UNRENDERED", String(item.inputItemOrdinal));
    }
  }

  const emimCommitmentDigest = computeIdentity(DOMAIN_TAG.EMIM_COMMITMENT, {
    canonicalSerializationVersion: surface.canonicalSerializationVersion,
    surface,
  });

  const isXpiClass = surface.executionClass === EXECUTION_CLASS.SEMANTIC_ADJUDICATION
    || surface.executionClass === EXECUTION_CLASS.DERIVATION;

  let historicalExecutionId;
  let executionOrdinal = null;
  if (isXpiClass) {
    if (typeof xpiExecutionId !== "string" || xpiExecutionId.length === 0) {
      failClosed("XPI_EXECUTION_ID_REQUIRED_FOR_R3");
    }
    historicalExecutionId = xpiExecutionId;
  } else {
    executionOrdinal = runtime.allocators.nextExecutionOrdinal(surface.governingScopeIdentity);
    historicalExecutionId = computeIdentity(DOMAIN_TAG.PREPCM_EXECUTION, {
      executionClass: surface.executionClass,
      governingScopeIdentity: surface.governingScopeIdentity,
      executionOrdinal,
      emimCommitmentDigest,
    });
    runtime.allocators.registerExecutionId(historicalExecutionId);
  }

  const record = {
    ...surface,
    emimCommitmentDigest,
    governingExecutionRef: historicalExecutionId,
    executionOrdinal,
    actualExecutionTimestamp: null,
    executionCompletionStatus: "COMMITTED",
    modelExecutionRecord: null,
    outputs: [],
    historicalExecutionId,
    region,
    committed: true,
    invocationStarted: false,
    frozenCommitmentBytes: runtime.canonicalSerialize(surface),
  };

  const stored = runtime.store.put("emim", historicalExecutionId, record);
  runtime.recordTrace("EMIM_COMMITTED", {
    historicalExecutionId,
    emimCommitmentDigest,
    executionOrdinal,
    region,
    executionClass: surface.executionClass,
  });
  return stored;
}

export function getCommittedEmim(runtime, historicalExecutionId) {
  return runtime.store.get("emim", historicalExecutionId);
}

export function assertEmimImmutable(runtime, historicalExecutionId) {
  const emim = getCommittedEmim(runtime, historicalExecutionId);
  const surface = projectCommitmentSurface(emim);
  const bytes = runtime.canonicalSerialize(surface);
  if (bytes !== emim.frozenCommitmentBytes) {
    failClosed("POST_START_EMIM_MUTATION", historicalExecutionId);
  }
  const digest = computeIdentity(DOMAIN_TAG.EMIM_COMMITMENT, {
    canonicalSerializationVersion: surface.canonicalSerializationVersion,
    surface,
  });
  if (digest !== emim.emimCommitmentDigest) {
    failClosed("POST_START_EMIM_MUTATION", "digest drift");
  }
  return emim;
}

export function rejectEmimAmendment(runtime, historicalExecutionId) {
  assertEmimImmutable(runtime, historicalExecutionId);
  failClosed("POST_START_EMIM_MUTATION", historicalExecutionId);
}

export function historicalAnchorSet(emim) {
  const anchors = [];
  for (const item of emim.inputItems) {
    if (isHistoricalAnchor(item.provenanceAnchor)) {
      anchors.push(item.provenanceAnchor);
    }
  }
  return anchors;
}

export function modelVisibleRenderedItems(runtime, emim) {
  const items = [];
  for (const item of emim.inputItems) {
    if (!item.renderingDerivationRecordRef) continue;
    const derivation = resolveDerivation(runtime, item.renderingDerivationRecordRef);
    const artifact = recoverRenderedContent(runtime, derivation.producedRenderedContentArtifactRef);
    items.push({
      inputItemOrdinal: item.inputItemOrdinal,
      itemChannel: item.itemChannel,
      itemAuthorityClass: item.itemAuthorityClass,
      provenanceAnchor: item.provenanceAnchor,
      renderingDerivationRecordRef: item.renderingDerivationRecordRef,
      renderedContentDigest: artifact.renderedContentArtifactId,
      exactRenderedRepresentation: artifact.exactRenderedRepresentation,
    });
  }
  return items;
}

export function patchEmimAuditMetadata(runtime, historicalExecutionId, patch) {
  const current = assertEmimImmutable(runtime, historicalExecutionId);
  const next = {
    ...current,
    ...patch,
  };
  const surface = projectCommitmentSurface(next);
  const bytes = runtime.canonicalSerialize(surface);
  if (bytes !== current.frozenCommitmentBytes) {
    failClosed("POST_START_EMIM_MUTATION", "audit patch mutated commitment surface");
  }
  return runtime.store.replace("emim", historicalExecutionId, next);
}
