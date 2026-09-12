import {
  AUTHORIZATION_DECISION,
  AUTHORIZATION_VARIANT,
  CANONICAL_SERIALIZATION_VERSION,
  DOMAIN_TAG,
  EVENT_KIND,
  R0_MANDATE_CONSTITUENTS,
  REGION,
  REQUEST_KIND,
  RETRIEVAL_ROLE,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { digestCanonical } from "./canonical.js";
import { assertTypedRetrievalRequest, getOutput } from "./output.js";
import { allocateGovernedEvent, occursBefore } from "./occurrences.js";

function descriptorFromPayload(payload) {
  return {
    retrievalRole: payload.requestKind === REQUEST_KIND.DISCOVERY
      ? RETRIEVAL_ROLE.DISCOVERY
      : RETRIEVAL_ROLE.SOURCE,
    sourceClassRef: payload.sourceClassRef,
    exactLocator: payload.exactLocator ?? null,
    queryFamilyBound: payload.queryFamilyBound ?? payload.queryOrLocator ?? null,
    retrievalMethodRef: payload.retrievalMethodRef,
    expansionRuleRef: payload.expansionRuleRef ?? null,
    expansionBound: payload.expansionBound ?? null,
    temporalLaneRef: payload.temporalLaneRef ?? null,
    temporalBoundaryRef: payload.temporalBoundaryRef ?? null,
    demandSlotRef: payload.demandSlotRef ?? null,
  };
}

export function resolveR0Mandate(runtime, resolutionMandateRef) {
  if (typeof resolutionMandateRef !== "string" || resolutionMandateRef.length === 0) {
    failClosed("R0_GOVERNANCE_REFERENT_MISSING", "resolutionMandateRef");
  }
  const mandate = runtime.resolveGovernanceReferent(resolutionMandateRef);
  for (const constituent of R0_MANDATE_CONSTITUENTS) {
    if (mandate[constituent] == null) {
      failClosed("R0_GOVERNANCE_REFERENT_MISSING", constituent);
    }
  }
  return mandate;
}

export function recoverPolicyInputs(runtime, variant, policyInputReferences) {
  if (variant === AUTHORIZATION_VARIANT.RESOLUTION_AUTHORIZATION) {
    const mandate = resolveR0Mandate(runtime, policyInputReferences.resolutionMandateRef);
    const applicableAuthority = runtime.resolveGovernanceReferent(
      policyInputReferences.applicableAuthorityRef,
    );
    const tuple = {
      authorizationVariant: variant,
      resolutionMandateRef: policyInputReferences.resolutionMandateRef,
      resolutionScopeIdentity: policyInputReferences.resolutionScopeIdentity,
      applicableAuthorityRef: policyInputReferences.applicableAuthorityRef,
      allowedSourceClasses: mandate.allowedSourceClasses,
      allowedRetrievalMethods: mandate.allowedRetrievalMethods,
      temporalBoundaries: mandate.temporalBoundaries,
      allowedTemporalLanes: mandate.temporalBoundaries?.allowedTemporalLanes ?? null,
      applicableAuthority,
    };
    return { tuple, recovered: { mandate, applicableAuthority } };
  }

  if (variant === AUTHORIZATION_VARIANT.STAGE_B_AUTHORIZATION) {
    const mission = runtime.store.get("demandBlueprint", policyInputReferences.governingMissionEnvelopeRef)
      ?? failClosed("STAGE_B_POLICY_UNRESOLVABLE", "governingMissionEnvelopeRef");
    void mission;
    const tuple = {
      authorizationVariant: variant,
      governingMissionEnvelopeRef: policyInputReferences.governingMissionEnvelopeRef,
      governingDemandSlotRef: policyInputReferences.governingDemandSlotRef,
      governingPredeclaredCollectionMethodRef: policyInputReferences.governingPredeclaredCollectionMethodRef,
      governingSourcePermissionSetRef: policyInputReferences.governingSourcePermissionSetRef,
      governingTemporalLaneRef: policyInputReferences.governingTemporalLaneRef,
      applicableAuthorityRef: policyInputReferences.applicableAuthorityRef,
      allowedSourceClasses: policyInputReferences.allowedSourceClasses,
      allowedRetrievalMethods: policyInputReferences.allowedRetrievalMethods,
      temporalLaneRef: policyInputReferences.governingTemporalLaneRef,
      allowedTemporalLanes: policyInputReferences.allowedTemporalLanes ?? null,
    };
    for (const [key, value] of Object.entries(policyInputReferences)) {
      if (value == null && key.startsWith("governing")) {
        failClosed("STAGE_B_POLICY_UNRESOLVABLE", key);
      }
    }
    return { tuple, recovered: { mission } };
  }

  failClosed("AUTHORIZATION_VARIANT_INVALID", variant);
}

export function authorizeRetrieval(runtime, {
  requestOutputRef,
  region,
  policyInputReferences,
  authorizationRuleRef = RULE_REF.AUTH,
  parentDiscoveryOccurrenceRef = null,
  requestDerivationRuleRef = null,
  discoveredLocatorSelector = null,
  derivedDescriptor = null,
  responsibleActorRef,
  actorAssignmentRef,
  occurrenceDomainIdentity,
}) {
  if (region === REGION.R2) failClosed("R2_HLX_INVOCATION_PROHIBITED");
  if (region === REGION.R3) failClosed("R3_HLX_RETRIEVAL_FORBIDDEN");

  const variant = region === REGION.R0
    ? AUTHORIZATION_VARIANT.RESOLUTION_AUTHORIZATION
    : AUTHORIZATION_VARIANT.STAGE_B_AUTHORIZATION;
  if (region === REGION.R0 && variant !== AUTHORIZATION_VARIANT.RESOLUTION_AUTHORIZATION) {
    failClosed("AUTHORIZATION_VARIANT_REGION_MISMATCH");
  }
  if (region === REGION.R1 && variant !== AUTHORIZATION_VARIANT.STAGE_B_AUTHORIZATION) {
    failClosed("AUTHORIZATION_VARIANT_REGION_MISMATCH");
  }

  const request = getOutput(runtime, requestOutputRef);
  const payload = derivedDescriptor ?? assertTypedRetrievalRequest(request);

  runtime.assertActorCoherent({
    responsibleActorRef,
    actorAssignmentRef,
    activityKind: "authorization_decision",
    actScope: occurrenceDomainIdentity,
  });

  const decisionOccurrence = allocateGovernedEvent(runtime, {
    occurrenceDomainIdentity,
    eventKind: EVENT_KIND.AUTHORIZATION_DECISION,
    eventKindBinding: { responsibleActorRef, actorAssignmentRef },
  });

  const { tuple } = recoverPolicyInputs(runtime, variant, policyInputReferences);
  const frozenPolicyInputDigest = computeIdentity(DOMAIN_TAG.POLICY_INPUT, tuple);
  const authRule = runtime.getRule(authorizationRuleRef);
  const decision = authRule(payload, tuple);

  const authorizedRetrievalDescriptor = derivedDescriptor ?? descriptorFromPayload(payload);

  const surface = {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    authorizationVariant: variant,
    requestOutputRef,
    authorizationDecisionOccurrenceRef: decisionOccurrence.governedEventOccurrenceId,
    authorizationRuleRef,
    authorizedRetrievalDescriptor,
    parentDiscoveryOccurrenceRef,
    requestDerivationRuleRef,
    discoveredLocatorSelector,
    policyInputReferences,
    frozenPolicyInputDigest,
    temporalAuthorizationResult: decision.temporalAuthorizationResult,
    sourceMethodAuthorizationResult: decision.sourceMethodAuthorizationResult,
    authorizationDecision: decision.authorizationDecision,
  };

  if (Object.prototype.hasOwnProperty.call(surface, "authorizedRetrievalOccurrenceRef")
    || surface.authorizedRetrievalOccurrenceRef) {
    failClosed("AUTHORIZATION_BACKREF_FORBIDDEN");
  }

  const retrievalAuthorizationRecordId = computeIdentity(DOMAIN_TAG.RETAUTH, surface);
  const record = runtime.store.put("authorization", retrievalAuthorizationRecordId, {
    ...surface,
    retrievalAuthorizationRecordId,
    region,
    refusalReason: decision.refusalReason ?? null,
  });

  runtime.recordTrace("HAD-2", {
    kind: EVENT_KIND.AUTHORIZATION_DECISION,
    authorizationDecisionOccurrenceRef: decisionOccurrence.governedEventOccurrenceId,
    retrievalAuthorizationRecordId,
    responsibleActorRef,
    actorAssignmentRef,
  });

  return { record, decisionOccurrence };
}

export function replayAuthorization(runtime, record) {
  const { tuple } = recoverPolicyInputs(
    runtime,
    record.authorizationVariant,
    record.policyInputReferences,
  );
  const recoveredDigest = computeIdentity(DOMAIN_TAG.POLICY_INPUT, tuple);
  if (recoveredDigest !== record.frozenPolicyInputDigest) {
    failClosed("POLICY_INPUT_DIGEST_MISMATCH");
  }
  const request = getOutput(runtime, record.requestOutputRef);
  const payload = record.discoveredLocatorSelector
    ? record.authorizedRetrievalDescriptor
    : assertTypedRetrievalRequest(request);
  const authRule = runtime.getRule(record.authorizationRuleRef);
  const replayed = authRule(payload, tuple);
  if (replayed.authorizationDecision !== record.authorizationDecision) {
    failClosed("AUTH_RULE_REPLAY_FAILURE", "authorizationDecision");
  }
  if (digestCanonical(replayed.temporalAuthorizationResult)
    !== digestCanonical(record.temporalAuthorizationResult)) {
    failClosed("AUTH_RULE_REPLAY_FAILURE", "temporalAuthorizationResult");
  }
  if (digestCanonical(replayed.sourceMethodAuthorizationResult)
    !== digestCanonical(record.sourceMethodAuthorizationResult)) {
    failClosed("AUTH_RULE_REPLAY_FAILURE", "sourceMethodAuthorizationResult");
  }
  if (record.authorizedRetrievalOccurrenceRef) {
    failClosed("AUTHORIZATION_BACKREF_FORBIDDEN");
  }
  return true;
}

export function authorizationCompleted(runtime, authorizationDecisionOccurrenceRef) {
  const carriers = runtime.store.find(
    "authorization",
    (record) => record.authorizationDecisionOccurrenceRef === authorizationDecisionOccurrenceRef,
  );
  if (carriers.length === 0) return false;
  if (carriers.length > 1) failClosed("OCCURRENCE_MULTIPLY_CARRIED", authorizationDecisionOccurrenceRef);
  replayAuthorization(runtime, carriers[0]);
  return true;
}

export function authorizationGranted(runtime, authorizationDecisionOccurrenceRef) {
  if (!authorizationCompleted(runtime, authorizationDecisionOccurrenceRef)) return false;
  const [carrier] = runtime.store.find(
    "authorization",
    (record) => record.authorizationDecisionOccurrenceRef === authorizationDecisionOccurrenceRef,
  );
  return carrier.authorizationDecision === AUTHORIZATION_DECISION.AUTHORIZED;
}

export { occursBefore };
