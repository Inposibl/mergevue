import {
  AUTHORIZATION_DECISION,
  CANONICAL_SERIALIZATION_VERSION,
  DOMAIN_TAG,
  EVENT_KIND,
  REGION,
  RETRIEVAL_ROLE,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { digestCanonical } from "./canonical.js";
import {
  authorizationCompleted,
  authorizeRetrieval,
  replayAuthorization,
} from "./authorization.js";
import { allocateGovernedEvent, assertOccursBefore, getOccurrence, occursBefore } from "./occurrences.js";
import { createRenderingDerivation } from "./rendering.js";
import { hlxConforming } from "./invocation.js";
import { getOutput } from "./output.js";

export function xrPermits(runtime, expansionRuleRef, descriptor) {
  if (!expansionRuleRef) return false;
  const rule = runtime.getRule(expansionRuleRef);
  return rule === runtime.getRule(RULE_REF.XR)
    ? runtime.getRule(expansionRuleRef)(
      descriptor.expansionBound ?? expansionRuleRef,
      descriptor,
    )
    : runtime.getRule(expansionRuleRef)(descriptor.expansionBound, descriptor);
}

export function xrPermitsBound(runtime, expansionBound, descriptor, expansionRuleRef = RULE_REF.XR) {
  const rule = runtime.getRule(expansionRuleRef);
  if (expansionBound?.mayEnlarge === true) return false;
  return rule(expansionBound, descriptor) === true;
}

function descriptorsEqual(left, right) {
  return digestCanonical({
    retrievalRole: left.retrievalRole,
    sourceClassRef: left.sourceClassRef,
    exactLocator: left.exactLocator ?? null,
    queryFamilyBound: left.queryFamilyBound ?? null,
    retrievalMethodRef: left.retrievalMethodRef,
  }) === digestCanonical({
    retrievalRole: right.retrievalRole,
    sourceClassRef: right.sourceClassRef,
    exactLocator: right.exactLocator ?? null,
    queryFamilyBound: right.queryFamilyBound ?? null,
    retrievalMethodRef: right.retrievalMethodRef,
  });
}

function temporalRefResolved(value) {
  return typeof value === "string" && value.length > 0;
}

function inheritTemporalAuthority(derived, parentDescriptor) {
  const next = { ...derived };
  if (!temporalRefResolved(next.temporalLaneRef) && temporalRefResolved(parentDescriptor?.temporalLaneRef)) {
    next.temporalLaneRef = parentDescriptor.temporalLaneRef;
  }
  if (!temporalRefResolved(next.temporalBoundaryRef)
    && temporalRefResolved(parentDescriptor?.temporalBoundaryRef)) {
    next.temporalBoundaryRef = parentDescriptor.temporalBoundaryRef;
  }
  return next;
}

function recoverFrozenDemandSlot(runtime, authorizationRecord) {
  const refs = authorizationRecord?.policyInputReferences ?? {};
  const blueprintId = refs.governingMissionEnvelopeRef;
  const slotId = refs.governingDemandSlotRef;
  if (typeof blueprintId !== "string" || typeof slotId !== "string") return null;
  const blueprint = runtime.store.tryGet("demandBlueprint", blueprintId);
  if (!blueprint || !Array.isArray(blueprint.demandSlots)) return null;
  return blueprint.demandSlots.find((slot) => slot.demandSlotId === slotId) ?? null;
}

function recoverGoverningManifest(runtime, authorizationRecord) {
  const refs = authorizationRecord?.policyInputReferences ?? {};
  const blueprintId = refs.governingMissionEnvelopeRef;
  if (typeof blueprintId !== "string") return null;
  const blueprint = runtime.store.tryGet("demandBlueprint", blueprintId);
  if (!blueprint) return null;
  const collectionAuthorizationId = blueprint.collectionAuthorizationId;
  if (typeof collectionAuthorizationId !== "string" || collectionAuthorizationId.length === 0) {
    return null;
  }
  const matches = [];
  for (const manifest of runtime.store.list("manifest")) {
    if (manifest?.frozen !== true) continue;
    if (typeof manifest.manifestId !== "string") continue;
    if (manifest.demandBlueprintId !== blueprintId) continue;
    if (manifest.collectionAuthorizationId !== collectionAuthorizationId) continue;
    matches.push(manifest);
  }
  if (matches.length !== 1) return null;
  return matches[0];
}

function recoverGoverningDemandDeclarationTime(frozenSlot) {
  const value = frozenSlot?.governingDemandDeclarationTime;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function presentString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function freezeSourceArtifact({ sourceIdentity, exactLocator, retrievedPayload, sourceProvenance }) {
  const identityObject = sourceIdentity && typeof sourceIdentity === "object" ? sourceIdentity : null;
  const sourceId = presentString(identityObject?.id) ?? presentString(sourceIdentity);
  const sourceClassRef = presentString(identityObject?.sourceClassRef);
  const sourceMaterialIdentity = presentString(identityObject?.sourceMaterialIdentity) ?? sourceId;
  const provenance = sourceProvenance && typeof sourceProvenance === "object" && !Array.isArray(sourceProvenance)
    ? sourceProvenance
    : {};
  const artifactVersion = presentString(provenance.artifactVersion)
    ?? presentString(provenance.version)
    ?? presentString(provenance.sourceVersion);
  return {
    sourceIdentity: sourceId,
    sourceClassRef,
    sourceMaterialIdentity,
    exactLocator: presentString(exactLocator),
    retrievedPayload,
    sourceProvenance: provenance,
    artifactVersion,
    artifactContentDigest: digestCanonical(retrievedPayload),
  };
}

function recoverPermittedMethodsAtDeclaration(runtime, authorizationRecord, frozenSlot) {
  if (Array.isArray(frozenSlot?.slotType?.permittedMethods)) {
    return frozenSlot.slotType.permittedMethods;
  }
  const slotId = frozenSlot?.demandSlotId;
  if (typeof slotId !== "string") return null;
  const manifest = recoverGoverningManifest(runtime, authorizationRecord);
  if (!manifest) return null;
  const task = (manifest.tasks ?? []).find((row) => row.demandSlotId === slotId);
  const methods = task?.predeclaredCollectionMethod?.permittedMethods;
  return Array.isArray(methods) ? methods : null;
}

function deriveInFrozenManifestExecutionRecord(runtime, authorizationRecord, demandSlotId, retrievalActId) {
  if (typeof demandSlotId !== "string" || typeof retrievalActId !== "string") return false;
  const manifest = recoverGoverningManifest(runtime, authorizationRecord);
  if (!manifest || typeof manifest.manifestId !== "string") return false;
  const ownsSlot = (manifest.tasks ?? []).some((task) => task.demandSlotId === demandSlotId);
  if (!ownsSlot) return false;
  const events = Array.isArray(manifest.executionEvents) ? manifest.executionEvents : [];
  if (!events.includes(retrievalActId)) {
    runtime.store.replace("manifest", manifest.manifestId, {
      ...manifest,
      executionEvents: [...events, retrievalActId],
    });
  }
  return true;
}

export function fanOutDerivationLawful(runtime, retrievalOccurrenceId) {
  const occurrence = getOccurrence(runtime, retrievalOccurrenceId);
  if (occurrence.eventKind !== EVENT_KIND.HISTORICAL_RETRIEVAL) return false;
  const authorizationRecordId = occurrence.eventKindBinding.grantingAuthorizationRecordRef;
  const A = runtime.store.get("authorization", authorizationRecordId);

  if (A.parentDiscoveryOccurrenceRef == null) return true;

  const D = getOccurrence(runtime, A.parentDiscoveryOccurrenceRef);
  if (!D.allocated) return false;
  if (D.eventKind !== EVENT_KIND.HISTORICAL_RETRIEVAL) return false;
  if (D.eventKindBinding.retrievalRole !== RETRIEVAL_ROLE.DISCOVERY) return false;
  if (!retrievalCompleted(runtime, D.governedEventOccurrenceId)) return false;

  if (!(occursBefore(runtime, D.governedEventOccurrenceId, A.authorizationDecisionOccurrenceRef)
    && occursBefore(runtime, A.authorizationDecisionOccurrenceRef, retrievalOccurrenceId))) {
    return false;
  }

  const P = runtime.store.get(
    "authorization",
    D.eventKindBinding.grantingAuthorizationRecordRef,
  );
  if (P.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED) return false;
  const XR = P.authorizedRetrievalDescriptor.expansionRuleRef;
  if (XR == null) return false;

  if (A.requestDerivationRuleRef == null || A.discoveredLocatorSelector == null) return false;

  const parentCompletion = completionCarrier(runtime, D.governedEventOccurrenceId);
  const recoveredContent = recoverDiscoveryContent(runtime, parentCompletion);
  const derivRule = runtime.getRule(A.requestDerivationRuleRef);
  let replayed;
  try {
    replayed = derivRule(recoveredContent, A.discoveredLocatorSelector);
  } catch {
    return false;
  }
  if (!descriptorsEqual(replayed, A.authorizedRetrievalDescriptor)) return false;

  const locators = Array.isArray(recoveredContent.locators) ? recoveredContent.locators : [];
  const selector = A.discoveredLocatorSelector;
  const present = locators.some((entry) => (
    (selector.locatorId != null && entry.locatorId === selector.locatorId)
    || (selector.exactLocator != null && entry.exactLocator === selector.exactLocator)
  ));
  if (!present) return false;

  const expansionBound = P.authorizedRetrievalDescriptor.expansionBound
    ?? recoveredContent.expansionBound
    ?? {
      allowedSourceClasses: [A.authorizedRetrievalDescriptor.sourceClassRef],
      allowedRetrievalMethods: [A.authorizedRetrievalDescriptor.retrievalMethodRef],
      mayEnlarge: false,
    };
  if (!xrPermitsBound(runtime, expansionBound, A.authorizedRetrievalDescriptor, XR)) return false;

  try {
    replayAuthorization(runtime, A);
  } catch {
    return false;
  }
  if (A.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED) return false;
  return true;
}

export function retrievalLawfullyAuthorized(runtime, retrievalOccurrenceId) {
  const occurrence = runtime.allocators.tryGetOccurrence(retrievalOccurrenceId);
  if (!occurrence) return false;
  if (occurrence.eventKind !== EVENT_KIND.HISTORICAL_RETRIEVAL) return false;
  const authorizationRecordId = occurrence.eventKindBinding?.grantingAuthorizationRecordRef;
  if (!authorizationRecordId) return false;
  const A = runtime.store.tryGet("authorization", authorizationRecordId);
  if (!A) return false;
  if (!authorizationCompleted(runtime, A.authorizationDecisionOccurrenceRef)) return false;
  if (A.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED) return false;
  if (!occursBefore(runtime, A.authorizationDecisionOccurrenceRef, retrievalOccurrenceId)) return false;
  const consumer = runtime.getAuthorizationConsumer(authorizationRecordId);
  if (consumer && consumer !== retrievalOccurrenceId) return false;
  if (!fanOutDerivationLawful(runtime, retrievalOccurrenceId)) return false;
  return true;
}

export function allocateRetrievalOccurrence(runtime, {
  authorizationRecord,
  responsibleActorRef,
  actorAssignmentRef,
  occurrenceDomainIdentity,
  retrievalRole,
}) {
  if (authorizationRecord.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED) {
    failClosed("RETRIEVAL_WITHOUT_AUTHORIZATION");
  }
  replayAuthorization(runtime, authorizationRecord);
  runtime.assertActorCoherent({
    responsibleActorRef,
    actorAssignmentRef,
    activityKind: "historical_retrieval",
    actScope: occurrenceDomainIdentity,
  });
  const existingConsumer = runtime.getAuthorizationConsumer(
    authorizationRecord.retrievalAuthorizationRecordId,
  );
  if (existingConsumer) failClosed("AUTHORIZATION_MULTIPLY_CONSUMED");

  const occurrence = allocateGovernedEvent(runtime, {
    occurrenceDomainIdentity,
    eventKind: EVENT_KIND.HISTORICAL_RETRIEVAL,
    eventKindBinding: {
      retrievalRole,
      grantingAuthorizationRecordRef: authorizationRecord.retrievalAuthorizationRecordId,
      responsibleActorRef,
      actorAssignmentRef,
    },
  });
  if (occurrence.eventKindBinding.grantingAuthorizationRecordRef
    !== authorizationRecord.retrievalAuthorizationRecordId) {
    failClosed("RETRIEVAL_WITHOUT_AUTHORIZATION");
  }
  assertOccursBefore(
    runtime,
    authorizationRecord.authorizationDecisionOccurrenceRef,
    occurrence.governedEventOccurrenceId,
  );
  runtime.noteAuthorizationConsumer(
    authorizationRecord.retrievalAuthorizationRecordId,
    occurrence.governedEventOccurrenceId,
  );
  return occurrence;
}

export function executeRetrieval(runtime, {
  authorizationRecord,
  region,
  responsibleActorRef,
  actorAssignmentRef,
  occurrenceDomainIdentity,
  sourceIdentity,
  exactLocator,
  retrievalMethodRef,
  retrievedPayload,
  sourceProvenance = {},
}) {
  if (region === REGION.R2) failClosed("R2_HLX_INVOCATION_PROHIBITED");
  const descriptor = authorizationRecord.authorizedRetrievalDescriptor;
  const retrievalRole = descriptor.retrievalRole;
  if (descriptor.exactLocator && exactLocator !== descriptor.exactLocator) {
    failClosed("AUTHORIZED_RETRIEVAL_MISMATCH", "exactLocator");
  }
  if (descriptor.retrievalMethodRef !== retrievalMethodRef) {
    failClosed("AUTHORIZED_RETRIEVAL_MISMATCH", "retrievalMethodRef");
  }
  if (descriptor.sourceClassRef && sourceIdentity.sourceClassRef
    && descriptor.sourceClassRef !== sourceIdentity.sourceClassRef) {
    failClosed("AUTHORIZED_RETRIEVAL_MISMATCH", "sourceClassRef");
  }

  const occurrence = allocateRetrievalOccurrence(runtime, {
    authorizationRecord,
    responsibleActorRef,
    actorAssignmentRef,
    occurrenceDomainIdentity,
    retrievalRole,
  });
  const retrievalOccurrenceId = occurrence.governedEventOccurrenceId;

  if (region === REGION.R0) {
    const sourceMaterialIdentity = sourceIdentity.sourceMaterialIdentity ?? sourceIdentity.id;
    const derivation = createRenderingDerivation(runtime, {
      sourceMaterialIdentity,
      sourceAccessReference: retrievalOccurrenceId,
      sourceMaterial: retrievedPayload,
      region,
    });
    const identitySurface = {
      canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
      resolutionScopeIdentity: occurrenceDomainIdentity,
      sourceIdentity: sourceIdentity.id,
      exactLocator,
      retrievalOccurrenceRef: retrievalOccurrenceId,
      retrievalMethodRef,
      sourceProvenance,
      renderingDerivationRecordRef: derivation.renderingDerivationRecordId,
    };
    const finalId = computeIdentity(DOMAIN_TAG.RESSRC, identitySurface);
    const record = runtime.store.put("resolutionSource", finalId, {
      ...identitySurface,
      resolutionSourceRecordId: finalId,
      retrievedPayload,
      region,
      evidenceStatus: "NON_EVIDENCE",
      retrievalActId: null,
      sourceMaterialIdentity,
    });
    runtime.recordTrace("HAD-2", {
      kind: EVENT_KIND.HISTORICAL_RETRIEVAL,
      retrievalOccurrenceId,
      region,
      retrievalActId: null,
    });
    return { occurrence, completion: record, retrievalOccurrenceId };
  }

  if (region === REGION.R1) {
    const retrievalActId = retrievalOccurrenceId;
    const frozenSlot = recoverFrozenDemandSlot(runtime, authorizationRecord);
    const inFrozenManifestExecutionRecord = deriveInFrozenManifestExecutionRecord(
      runtime,
      authorizationRecord,
      frozenSlot?.demandSlotId ?? null,
      retrievalActId,
    );
    const sourceArtifact = freezeSourceArtifact({
      sourceIdentity,
      exactLocator,
      retrievedPayload,
      sourceProvenance,
    });
    const qualification = runtime.store.put("retrievalQualification", retrievalActId, {
      retrievalQualificationId: retrievalActId,
      retrievalActId,
      retrievalActTime: occurrence.occurrenceSequence,
      retrievalMethodRef,
      sourceIdentity: sourceIdentity.id,
      exactLocator,
      queryFamilyBound: descriptor.retrievalRole === RETRIEVAL_ROLE.DISCOVERY
        ? (descriptor.queryFamilyBound ?? null)
        : null,
      governingDemandDeclarationId: frozenSlot?.demandSlotId ?? null,
      governingDemandDeclarationTime: recoverGoverningDemandDeclarationTime(frozenSlot),
      permittedMethodsAtDeclaration: recoverPermittedMethodsAtDeclaration(
        runtime,
        authorizationRecord,
        frozenSlot,
      ),
      inFrozenManifestExecutionRecord,
      certificationDisposition: null,
      retrievalQualification: null,
      retrievedPayload,
      sourceArtifact,
      region,
      grantingAuthorizationRecordRef: authorizationRecord.retrievalAuthorizationRecordId,
    });
    runtime.recordTrace("HAD-2", {
      kind: EVENT_KIND.HISTORICAL_RETRIEVAL,
      retrievalOccurrenceId,
      region,
      retrievalActId,
    });
    return { occurrence, completion: qualification, retrievalOccurrenceId, retrievalActId };
  }

  failClosed("RETRIEVAL_REGION_INVALID", region);
}

function recoverDiscoveryContent(runtime, completion) {
  if (completion.retrievedPayload && typeof completion.retrievedPayload === "object") {
    return completion.retrievedPayload;
  }
  failClosed("DISCOVERY_CONTENT_UNRECOVERABLE");
}

export function completionCarrier(runtime, retrievalOccurrenceId) {
  const occurrence = getOccurrence(runtime, retrievalOccurrenceId);
  if (occurrence.eventKind !== EVENT_KIND.HISTORICAL_RETRIEVAL) {
    failClosed("COMPLETION_KIND_MISMATCH");
  }
  const r0 = runtime.store.find(
    "resolutionSource",
    (record) => record.retrievalOccurrenceRef === retrievalOccurrenceId,
  );
  const r1 = runtime.store.find(
    "retrievalQualification",
    (record) => record.retrievalActId === retrievalOccurrenceId,
  );
  const carriers = [...r0, ...r1];
  if (carriers.length > 1) failClosed("OCCURRENCE_MULTIPLY_CARRIED", retrievalOccurrenceId);
  if (carriers.length === 0) return null;
  return carriers[0];
}

export function retrievalCompleted(runtime, retrievalOccurrenceId) {
  return completionCarrier(runtime, retrievalOccurrenceId) != null;
}

export function methodCreditEligible(runtime, retrievalOccurrenceId) {
  const occurrence = runtime.allocators.tryGetOccurrence(retrievalOccurrenceId);
  if (!occurrence || occurrence.eventKind !== EVENT_KIND.HISTORICAL_RETRIEVAL) return false;
  if (!retrievalLawfullyAuthorized(runtime, retrievalOccurrenceId)) return false;
  if (!retrievalCompleted(runtime, retrievalOccurrenceId)) return false;
  const A = runtime.store.get(
    "authorization",
    occurrence.eventKindBinding.grantingAuthorizationRecordRef,
  );
  const Q = getOutput(runtime, A.requestOutputRef);
  if (!hlxConforming(runtime, Q.producingHistoricalExecutionId)) return false;
  if (runtime.isContaminated(Q.producingHistoricalExecutionId)) return false;
  if (A.parentDiscoveryOccurrenceRef) {
    if (!retrievalCompleted(runtime, A.parentDiscoveryOccurrenceRef)) return false;
    if (!fanOutDerivationLawful(runtime, retrievalOccurrenceId)) return false;
  }
  const completion = completionCarrier(runtime, retrievalOccurrenceId);
  if (completion?.region === REGION.R1) {
    if (completion.retrievalActId !== retrievalOccurrenceId) return false;
    if (!completion.inFrozenManifestExecutionRecord) return false;
  }
  if (completion?.region === REGION.R0 && completion.retrievalActId != null) return false;
  return true;
}

export function fanOutFromDiscovery(runtime, {
  discoveryOccurrenceId,
  region,
  responsibleActorRef,
  actorAssignmentRef,
  occurrenceDomainIdentity,
  policyInputReferences,
  requestDerivationRuleRef = RULE_REF.REQUEST_DERIVATION,
  sourceRequestOutputRef,
}) {
  if (!retrievalCompleted(runtime, discoveryOccurrenceId)) {
    failClosed("DISCOVERY_NOT_COMPLETED");
  }
  const completion = completionCarrier(runtime, discoveryOccurrenceId);
  const content = recoverDiscoveryContent(runtime, completion);
  const locators = Array.isArray(content.locators) ? content.locators : [];
  const parentOccurrence = getOccurrence(runtime, discoveryOccurrenceId);
  const parentAuth = runtime.store.tryGet(
    "authorization",
    parentOccurrence.eventKindBinding?.grantingAuthorizationRecordRef,
  );
  const parentDescriptor = parentAuth?.authorizedRetrievalDescriptor ?? {};
  const results = [];
  for (const locator of locators) {
    const selector = { locatorId: locator.locatorId, exactLocator: locator.exactLocator };
    const derivRule = runtime.getRule(requestDerivationRuleRef);
    const derivedDescriptor = inheritTemporalAuthority(derivRule(content, selector), parentDescriptor);
    const { record: childAuth } = authorizeRetrieval(runtime, {
      requestOutputRef: sourceRequestOutputRef,
      region,
      policyInputReferences,
      parentDiscoveryOccurrenceRef: discoveryOccurrenceId,
      requestDerivationRuleRef,
      discoveredLocatorSelector: selector,
      derivedDescriptor,
      responsibleActorRef,
      actorAssignmentRef,
      occurrenceDomainIdentity,
    });
    if (childAuth.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED) {
      results.push({ locator, authorization: childAuth, retrieval: null });
      continue;
    }
    const retrieval = executeRetrieval(runtime, {
      authorizationRecord: childAuth,
      region,
      responsibleActorRef,
      actorAssignmentRef,
      occurrenceDomainIdentity,
      sourceIdentity: {
        id: locator.sourceIdentity ?? locator.exactLocator,
        sourceClassRef: locator.sourceClassRef,
        sourceMaterialIdentity: locator.sourceMaterialIdentity ?? locator.exactLocator,
      },
      exactLocator: locator.exactLocator,
      retrievalMethodRef: locator.retrievalMethodRef,
      retrievedPayload: locator.payload ?? { locator: locator.exactLocator, body: locator.body ?? "" },
      sourceProvenance: locator.sourceProvenance ?? {},
    });
    results.push({ locator, authorization: childAuth, retrieval });
  }
  return results;
}

export function rejectLateAuthorization() {
  failClosed("RETRIEVAL_WITHOUT_AUTHORIZATION", "late authorization is unrepresentable");
}

export function rejectFreeFormExecution() {
  failClosed("FREE_FORM_REQUEST_NOT_EXECUTABLE");
}
