import {
  CANONICAL_SERIALIZATION_VERSION,
  CERTIFICATION_RESULT,
  CERTIFYING_ACTIVITY,
  CHECK_CLASS,
  DOMAIN_TAG,
  EVENT_KIND,
  G0_LIMB_A_FIELDS,
  OUTPUT_KIND,
  REGION,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { canonicalSerialize, sortUniqueStrings } from "./canonical.js";
import { allocateGovernedEvent, occursBefore } from "./occurrences.js";
import { getCommittedEmim, historicalAnchorSet } from "./emim.js";
import { getOutput, reconstructLineageFromEmim } from "./output.js";
import { completionCarrier } from "./retrieval.js";

export function g0RequiredFieldSet(runtime, { registryVersion, caseGeometryVersion } = {}) {
  void registryVersion;
  void caseGeometryVersion;
  const limbA = [...G0_LIMB_A_FIELDS];
  const limbB = [];
  if (runtime.limbBAuthority) {
    const authority = runtime.limbBAuthority;
    if (!authority.authorityId || !authority.version || !Array.isArray(authority.mandatoryFields)) {
      failClosed("LIMB_B_AUTHORITY_UNRESOLVABLE");
    }
    limbB.push(...authority.mandatoryFields);
  }
  return { limbA, limbB, required: [...limbA, ...limbB] };
}

export function canonicalCandidatePropositions(candidate) {
  const payload = candidate.canonicalStructuredPayload;
  if (!payload || !Array.isArray(payload.propositions)) {
    failClosed("CANDIDATE_PROPOSITIONS_INVALID");
  }
  return payload.propositions.map((prop, index) => ({
    propositionOrdinal: prop.propositionOrdinal ?? index + 1,
    canonicalProposition: prop.canonicalProposition,
    propositionRole: prop.propositionRole ?? null,
    g0Field: prop.g0Field ?? prop.fieldId ?? null,
    supportingSourceRecordIds: sortUniqueStrings(prop.supportingSourceRecordIds ?? []),
  }));
}

export function g0FieldPropositionMap(runtime, candidate, requiredFieldSet) {
  const propositions = canonicalCandidatePropositions(candidate);
  const mapper = runtime.getRule(RULE_REF.G0_FIELD_MAP);
  return mapper(requiredFieldSet, propositions);
}

export function certificationDecisionInputSet(runtime, certifyingActivityBinding) {
  if (certifyingActivityBinding.kind === CERTIFYING_ACTIVITY.LLM_CERTIFICATION) {
    const emim = getCommittedEmim(runtime, certifyingActivityBinding.historicalExecutionId);
    const anchors = historicalAnchorSet(emim);
    const ids = reconstructLineageFromEmim(runtime, emim);
    for (const anchor of anchors) {
      if (anchor.id && !ids.includes(anchor.id)) ids.push(anchor.id);
    }
    return sortUniqueStrings(ids);
  }
  if (certifyingActivityBinding.kind === CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION) {
    if (!Array.isArray(certifyingActivityBinding.deterministicDecisionInputSet)) {
      failClosed("DETERMINISTIC_INPUT_SET_REQUIRED");
    }
    return sortUniqueStrings(certifyingActivityBinding.deterministicDecisionInputSet);
  }
  failClosed("CERTIFYING_ACTIVITY_INVALID");
}

export function requiredPriorOccurrences(runtime, decisionInputSet, certificationEventOccurrenceRef) {
  const priors = [];
  for (const sourceId of decisionInputSet) {
    const source = runtime.store.tryGet("resolutionSource", sourceId);
    if (source?.retrievalOccurrenceRef) priors.push(source.retrievalOccurrenceRef);
    const qual = runtime.store.tryGet("retrievalQualification", sourceId);
    if (qual?.retrievalActId) priors.push(qual.retrievalActId);
  }
  const unique = sortUniqueStrings(priors);
  const event = runtime.store.get("occurrence", certificationEventOccurrenceRef);
  for (const prior of unique) {
    const priorOcc = runtime.store.get("occurrence", prior);
    if (priorOcc.occurrenceDomainIdentity !== event.occurrenceDomainIdentity) {
      failClosed("CERTIFICATION_PRIOR_DOMAIN_MISMATCH", prior);
    }
    if (!occursBefore(runtime, prior, certificationEventOccurrenceRef)) {
      failClosed("CERTIFICATION_PRIOR_ORDER_VIOLATION", prior);
    }
  }
  return unique;
}

function certificationActorRef(runtime, binding) {
  if (binding.kind === CERTIFYING_ACTIVITY.LLM_CERTIFICATION) {
    const emim = getCommittedEmim(runtime, binding.historicalExecutionId);
    return emim.responsibleActorRef;
  }
  return binding.responsibleActorRef;
}

export function actorIndependence(runtime, candidate, binding) {
  const candidateAuthor = getCommittedEmim(runtime, candidate.producingHistoricalExecutionId)
    .responsibleActorRef;
  const certActor = certificationActorRef(runtime, binding);
  return candidateAuthor !== certActor;
}

export function executionContextIndependence(runtime, candidate, binding) {
  if (binding.kind !== CERTIFYING_ACTIVITY.LLM_CERTIFICATION) return true;
  const candidateEmim = getCommittedEmim(runtime, candidate.producingHistoricalExecutionId);
  const certEmim = getCommittedEmim(runtime, binding.historicalExecutionId);
  if (certEmim.historicalExecutionId === candidateEmim.historicalExecutionId) return false;
  const candidateBytes = candidateEmim.frozenCommitmentBytes;
  return certEmim.frozenCommitmentBytes !== candidateBytes;
}

export function certifyResolution(runtime, {
  candidateOutputRef,
  certifyingActivityBinding,
  claimSurfaceInput,
  occurrenceDomainIdentity,
  responsibleActorRef,
  actorAssignmentRef,
}) {
  const candidate = getOutput(runtime, candidateOutputRef);
  if (candidate.outputKind !== OUTPUT_KIND.RESOLUTION_CANDIDATE) {
    failClosed("CERTIFICATION_SUBJECT_NOT_CANDIDATE");
  }
  if (candidate.producingHistoricalExecutionId === certifyingActivityBinding.historicalExecutionId) {
    failClosed("CANDIDATE_CONTROLS_OWN_CERTIFICATION");
  }

  if (certifyingActivityBinding.kind === CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION) {
    runtime.assertActorCoherent({
      responsibleActorRef: certifyingActivityBinding.responsibleActorRef ?? responsibleActorRef,
      actorAssignmentRef: certifyingActivityBinding.actorAssignmentRef ?? actorAssignmentRef,
      activityKind: "certification",
      actScope: occurrenceDomainIdentity,
    });
  } else {
    const emim = getCommittedEmim(runtime, certifyingActivityBinding.historicalExecutionId);
    runtime.assertActorCoherent({
      responsibleActorRef: emim.responsibleActorRef,
      actorAssignmentRef: emim.actorAssignmentRef,
      activityKind: "model_invocation",
      actScope: emim.governingScopeIdentity,
    });
  }

  if (!actorIndependence(runtime, candidate, certifyingActivityBinding)) {
    failClosed("CERTIFICATION_ACTOR_NOT_INDEPENDENT");
  }
  if (!executionContextIndependence(runtime, candidate, certifyingActivityBinding)) {
    failClosed("CERTIFICATION_CONTEXT_NOT_INDEPENDENT");
  }

  const event = allocateGovernedEvent(runtime, {
    occurrenceDomainIdentity,
    eventKind: EVENT_KIND.CERTIFICATION,
    eventKindBinding: { certifyingActivityBinding },
  });
  if (event.eventKindBinding.responsibleActorRef) {
    failClosed("CERTIFICATION_EVENT_ACTOR_FIELD_FORBIDDEN");
  }

  const decisionInputSet = certificationDecisionInputSet(runtime, certifyingActivityBinding);
  const decisionInputSetDigest = computeIdentity(DOMAIN_TAG.CERT_INPUTSET, decisionInputSet);

  const candidateProps = canonicalCandidatePropositions(candidate);
  const certified = claimSurfaceInput.certifiedPropositions ?? [];
  for (const prop of certified) {
    const inCandidate = candidateProps.some(
      (item) => item.canonicalProposition === prop.canonicalProposition,
    );
    if (!inCandidate) failClosed("CERTIFIED_PROPOSITION_NOT_IN_CANDIDATE");
    for (const sourceId of prop.supportingSourceRecordIds ?? []) {
      if (!decisionInputSet.includes(sourceId)) {
        failClosed("CERTIFICATION_INPUT_NOT_EXPOSED", sourceId);
      }
    }
  }
  for (const ref of claimSurfaceInput.rejectedAlternativeBasisRefs ?? []) {
    if (!decisionInputSet.includes(ref)) failClosed("CERTIFICATION_INPUT_NOT_EXPOSED", ref);
  }

  const claimSurface = {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    resolutionCandidateIdentity: candidate.prePcmOutputRecordId,
    certifiedPropositions: certified.map((prop, index) => ({
      propositionOrdinal: prop.propositionOrdinal ?? index + 1,
      canonicalProposition: prop.canonicalProposition,
      supportingSourceRecordIds: sortUniqueStrings(prop.supportingSourceRecordIds ?? []),
      checkResults: prop.checkResults,
    })),
    ambiguityDisposition: claimSurfaceInput.ambiguityDisposition ?? null,
    rejectedCandidates: claimSurfaceInput.rejectedCandidates ?? null,
    rejectedAlternativeBasisRefs: claimSurfaceInput.rejectedAlternativeBasisRefs ?? null,
    governingCertificationRuleRef: claimSurfaceInput.governingCertificationRuleRef ?? RULE_REF.CERTIFICATION,
    certificationResult: claimSurfaceInput.certificationResult,
  };
  const certificationClaimDigest = computeIdentity(DOMAIN_TAG.RESCERT_CLAIM, claimSurface);

  const certRule = runtime.getRule(claimSurface.governingCertificationRuleRef);
  const replay = certRule({
    claimSurface,
    decisionInputSet,
    candidatePropositions: candidateProps,
  });
  const claimedResult = claimSurface.certificationResult;
  const replayedResult = replay.certificationResult;
  if (claimedResult !== replayedResult) {
    failClosed("CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  }
  if (claimSurface.certificationResult === CERTIFICATION_RESULT.PASS && !replay.deterministicReplayOk) {
    failClosed("CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  }
  for (const prop of claimSurface.certifiedPropositions) {
    const checks = prop.checkResults ?? [];
    if (checks.length !== 6) failClosed("CERTIFICATION_CHECKS_INCOMPLETE");
    if (replay.checkClassification[2] === CHECK_CLASS.DETERMINISTIC && checks[1] !== "PASS"
      && claimSurface.certificationResult === CERTIFICATION_RESULT.PASS) {
      failClosed("CERTIFICATION_DETERMINISTIC_CHECK_FAIL");
    }
  }

  const priors = requiredPriorOccurrences(
    runtime,
    decisionInputSet,
    event.governedEventOccurrenceId,
  );

  const identitySurface = {
    certificationClaimDigest,
    certificationEventOccurrenceRef: event.governedEventOccurrenceId,
    certificationDecisionInputSetDigest: decisionInputSetDigest,
    requiredPriorOccurrences: priors,
  };
  const resolutionCertificationOccurrenceId = computeIdentity(DOMAIN_TAG.RESCERT_OCC, identitySurface);

  const record = runtime.store.put("certification", resolutionCertificationOccurrenceId, {
    certificationClaimSurface: claimSurface,
    deterministicDecisionInputSet: certifyingActivityBinding.kind === CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION
      ? decisionInputSet
      : null,
    ...identitySurface,
    resolutionCertificationOccurrenceId,
    certificationTime: null,
    region: REGION.R0,
  });
  runtime.recordTrace("HAD-2", {
    kind: EVENT_KIND.CERTIFICATION,
    resolutionCertificationOccurrenceId,
    certificationEventOccurrenceRef: event.governedEventOccurrenceId,
    derivedActor: certificationActorRef(runtime, certifyingActivityBinding),
  });
  return record;
}

export function resolutionCertificationValid(runtime, occurrenceRecord) {
  const recoveredDigest = computeIdentity(
    DOMAIN_TAG.RESCERT_CLAIM,
    occurrenceRecord.certificationClaimSurface,
  );
  if (recoveredDigest !== occurrenceRecord.certificationClaimDigest) return false;
  const event = runtime.store.get("occurrence", occurrenceRecord.certificationEventOccurrenceRef);
  const binding = event.eventKindBinding.certifyingActivityBinding;
  if (!binding) return false;
  const candidate = getOutput(
    runtime,
    occurrenceRecord.certificationClaimSurface.resolutionCandidateIdentity,
  );
  if (!actorIndependence(runtime, candidate, binding)) return false;
  if (!executionContextIndependence(runtime, candidate, binding)) return false;
  const decisionInputSet = certificationDecisionInputSet(runtime, binding);
  const digest = computeIdentity(DOMAIN_TAG.CERT_INPUTSET, decisionInputSet);
  if (digest !== occurrenceRecord.certificationDecisionInputSetDigest) return false;
  const derivedPriors = requiredPriorOccurrences(
    runtime,
    decisionInputSet,
    occurrenceRecord.certificationEventOccurrenceRef,
  );
  if (runtime.canonicalSerialize(derivedPriors)
    !== runtime.canonicalSerialize(occurrenceRecord.requiredPriorOccurrences)) {
    return false;
  }
  if (occurrenceRecord.certificationClaimSurface.certificationResult !== CERTIFICATION_RESULT.PASS) {
    return false;
  }
  return true;
}

function propositionsIncompatible(left, right) {
  return left.canonicalProposition !== right.canonicalProposition;
}

export function conflictingCertification(runtime, field, candidateId) {
  const valid = runtime.store.list("certification").filter((record) => {
    if (record.certificationClaimSurface.resolutionCandidateIdentity !== candidateId) return false;
    return resolutionCertificationValid(runtime, record);
  });
  for (let i = 0; i < valid.length; i += 1) {
    for (let j = i + 1; j < valid.length; j += 1) {
      const leftProps = valid[i].certificationClaimSurface.certifiedPropositions.filter(
        (prop) => prop.g0Field === field || canonicalCandidatePropositions(
          getOutput(runtime, candidateId),
        ).find((c) => c.canonicalProposition === prop.canonicalProposition)?.g0Field === field,
      );
      const rightProps = valid[j].certificationClaimSurface.certifiedPropositions.filter(
        (prop) => prop.g0Field === field || canonicalCandidatePropositions(
          getOutput(runtime, candidateId),
        ).find((c) => c.canonicalProposition === prop.canonicalProposition)?.g0Field === field,
      );
      for (const lp of leftProps) {
        for (const rp of rightProps) {
          if (propositionsIncompatible(lp, rp)) return true;
        }
      }
    }
  }
  return false;
}

export function g0Establishable(runtime, candidate, { registryVersion, caseGeometryVersion } = {}) {
  const { required } = g0RequiredFieldSet(runtime, { registryVersion, caseGeometryVersion });
  const map = g0FieldPropositionMap(runtime, candidate, required);
  for (const field of required) {
    const mapped = map[field] ?? [];
    if (mapped.length === 0) return false;
    const values = new Set(mapped.map((p) => p.canonicalProposition));
    if (values.size > 1) return false;
    for (const proposition of mapped) {
      const valid = runtime.store.list("certification").some((record) => (
        resolutionCertificationValid(runtime, record)
        && record.certificationClaimSurface.resolutionCandidateIdentity === candidate.prePcmOutputRecordId
        && record.certificationClaimSurface.certifiedPropositions.some(
          (certified) => certified.canonicalProposition === proposition.canonicalProposition,
        )
      ));
      if (!valid) return false;
    }
    if (conflictingCertification(runtime, field, candidate.prePcmOutputRecordId)) return false;
  }
  return true;
}

export function rejectCandidateControlsG0Scope() {
  failClosed("CANDIDATE_CANNOT_CONTROL_G0_SCOPE");
}

const T0_DETERMINATION_COMMITMENT_ROLE = "T0_DETERMINATION_COMMITMENT";
const ACCEPTED_T0_DISPOSITIONS = Object.freeze(["ACCEPTED", "ACCEPTED_AS_T0"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function requiredNonEmptyString(value, field) {
  if (typeof value !== "string" || value.length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", field);
  }
  return value;
}

function requiredPresentValue(value, field) {
  if (value == null) failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", field);
  if (typeof value === "string" && value.length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", field);
  }
  if (Array.isArray(value) && value.length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", field);
  }
  if (isPlainObject(value) && Object.keys(value).length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", field);
  }
  return value;
}

function candidateEventValue(entry) {
  if (typeof entry.eventTime === "string" && entry.eventTime.length > 0) return entry.eventTime;
  if (typeof entry.eventDate === "string" && entry.eventDate.length > 0) return entry.eventDate;
  if (typeof entry.lawfulBound === "string" && entry.lawfulBound.length > 0) return entry.lawfulBound;
  return null;
}

function isAcceptedT0Disposition(disposition) {
  return ACCEPTED_T0_DISPOSITIONS.includes(disposition);
}

export function canonicalDeterminationCommitment(object) {
  if (!isPlainObject(object)) failClosed("T0_DETERMINATION_OBJECT_INVALID");
  return canonicalSerialize(object);
}

function certificationReviewerIdentity(runtime, certRecord) {
  const event = runtime.store.get("occurrence", certRecord.certificationEventOccurrenceRef);
  const binding = event.eventKindBinding?.certifyingActivityBinding;
  if (!binding) return null;
  if (binding.kind === CERTIFYING_ACTIVITY.LLM_CERTIFICATION && binding.historicalExecutionId) {
    const actor = getCommittedEmim(runtime, binding.historicalExecutionId).responsibleActorRef;
    return typeof actor === "string" && actor.length > 0 ? actor : null;
  }
  if (typeof binding.responsibleActorRef === "string" && binding.responsibleActorRef.length > 0) {
    return binding.responsibleActorRef;
  }
  return null;
}

function locateDeterminationCommitmentProposition(candidate) {
  const commitmentProps = canonicalCandidatePropositions(candidate).filter(
    (prop) => prop.propositionRole === T0_DETERMINATION_COMMITMENT_ROLE,
  );
  if (commitmentProps.length === 0) {
    failClosed("T0_DETERMINATION_COMMITMENT_UNCERTIFIED");
  }
  if (commitmentProps.length !== 1) {
    failClosed("T0_DETERMINATION_COMMITMENT_AMBIGUOUS");
  }
  return commitmentProps[0];
}

function locateCertifiedDeterminationCommitment(runtime, candidate, commitmentProposition) {
  const candidateId = candidate.prePcmOutputRecordId;
  if (typeof candidateId !== "string" || candidateId.length === 0) {
    failClosed("T0_DETERMINATION_CANDIDATE_UNRESOLVABLE");
  }
  const exactMatches = [];
  const byteOnlyMatches = [];
  for (const record of runtime.store.list("certification")) {
    if (record.certificationClaimSurface.resolutionCandidateIdentity !== candidateId) continue;
    if (!resolutionCertificationValid(runtime, record)) continue;
    for (const prop of record.certificationClaimSurface.certifiedPropositions) {
      if (prop.canonicalProposition !== commitmentProposition.canonicalProposition) continue;
      byteOnlyMatches.push({ record, prop });
      if (prop.propositionOrdinal === commitmentProposition.propositionOrdinal) {
        exactMatches.push({ record, prop });
      }
    }
  }
  if (exactMatches.length === 0) {
    if (byteOnlyMatches.length > 0) {
      failClosed("T0_DETERMINATION_COMMITMENT_ORDINAL_MISMATCH");
    }
    failClosed("T0_DETERMINATION_COMMITMENT_UNCERTIFIED");
  }
  if (exactMatches.length !== 1) failClosed("T0_DETERMINATION_COMMITMENT_AMBIGUOUS");
  return exactMatches[0];
}

function enforceDeterminationCandidateSet(candidates, selectedT0Value, selectedT0SourceId, selectedT0SourceUrl) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", "candidates");
  }
  let acceptedMatch = null;
  for (const entry of candidates) {
    if (!isPlainObject(entry)) failClosed("T0_DETERMINATION_CANDIDATE_SURFACE_INCOMPLETE");
    requiredNonEmptyString(entry.sourceId, "candidates.sourceId");
    if (candidateEventValue(entry) == null) {
      failClosed("T0_DETERMINATION_CANDIDATE_SURFACE_INCOMPLETE", "eventTime");
    }
    requiredNonEmptyString(entry.eventType, "candidates.eventType");
    requiredNonEmptyString(entry.publicUrl, "candidates.publicUrl");
    requiredNonEmptyString(entry.qualifyingDisposition, "candidates.qualifyingDisposition");
    requiredNonEmptyString(entry.acceptRejectReason, "candidates.acceptRejectReason");
    if (isAcceptedT0Disposition(entry.qualifyingDisposition)
      && candidateEventValue(entry) === selectedT0Value
      && entry.sourceId === selectedT0SourceId
      && entry.publicUrl === selectedT0SourceUrl) {
      acceptedMatch = entry;
    }
  }
  if (!acceptedMatch) failClosed("T0_DETERMINATION_SELECTED_EVENT_NOT_ACCEPTED");
  return candidates;
}

function retainedSourceArtifactHash(runtime, source) {
  const derivation = runtime.store.get("renderingDerivation", source.renderingDerivationRecordRef);
  return derivation.producedRenderedContentArtifactRef;
}

function candidateDeclaredArtifactHash(entry) {
  if (typeof entry.sourceArtifactHash === "string" && entry.sourceArtifactHash.length > 0) {
    return entry.sourceArtifactHash;
  }
  if (typeof entry.artifactHash === "string" && entry.artifactHash.length > 0) {
    return entry.artifactHash;
  }
  if (typeof entry.sourceContentIdentity === "string" && entry.sourceContentIdentity.length > 0) {
    return entry.sourceContentIdentity;
  }
  return null;
}

function crossCheckSelectedSource(runtime, {
  selectedT0SourceId,
  selectedT0SourceUrl,
  selectedT0SourceArtifactHash,
  supportingSourceRecordIds,
}) {
  if (!supportingSourceRecordIds.includes(selectedT0SourceId)) {
    failClosed("T0_DETERMINATION_SOURCE_MISMATCH", "selectedT0SourceId");
  }
  const source = runtime.store.get("resolutionSource", selectedT0SourceId);
  if (source.evidenceStatus !== "NON_EVIDENCE") failClosed("R0_EVIDENCE_FIREWALL");
  if (source.exactLocator !== selectedT0SourceUrl) {
    failClosed("T0_DETERMINATION_SOURCE_MISMATCH", "selectedT0SourceUrl");
  }
  const retainedHash = retainedSourceArtifactHash(runtime, source);
  if (retainedHash !== selectedT0SourceArtifactHash) {
    failClosed("T0_DETERMINATION_SOURCE_MISMATCH", "selectedT0SourceArtifactHash");
  }
  return source;
}

function crossCheckAllCandidateSources(runtime, candidates, supportingSourceRecordIds) {
  for (const entry of candidates) {
    if (!supportingSourceRecordIds.includes(entry.sourceId)) {
      failClosed("T0_DETERMINATION_CANDIDATE_SOURCE_NOT_CERTIFIED", entry.sourceId);
    }
    const source = runtime.store.tryGet("resolutionSource", entry.sourceId);
    if (!source) failClosed("T0_DETERMINATION_CANDIDATE_SOURCE_UNRESOLVABLE", entry.sourceId);
    if (source.evidenceStatus !== "NON_EVIDENCE") failClosed("R0_EVIDENCE_FIREWALL");
    if (source.exactLocator !== entry.publicUrl) {
      failClosed("T0_DETERMINATION_CANDIDATE_SOURCE_MISMATCH", "publicUrl");
    }
    const retainedHash = retainedSourceArtifactHash(runtime, source);
    const declaredHash = candidateDeclaredArtifactHash(entry);
    if (declaredHash != null && declaredHash !== retainedHash) {
      failClosed("T0_DETERMINATION_CANDIDATE_SOURCE_MISMATCH", "sourceArtifactHash");
    }
  }
}

function bindCaseIdentity(payload, determination) {
  const caseId = requiredNonEmptyString(payload.caseId, "caseId");
  const T0Identity = requiredNonEmptyString(payload.T0Identity, "T0Identity");
  if (payload.caseSides == null) failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", "caseSides");
  const caseGeometryVersion = requiredNonEmptyString(payload.caseGeometryVersion, "caseGeometryVersion");
  if (Object.prototype.hasOwnProperty.call(determination, "caseId") && determination.caseId !== caseId) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseId");
  }
  if (Object.prototype.hasOwnProperty.call(determination, "T0Identity")
    && determination.T0Identity !== T0Identity) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "T0Identity");
  }
  if (Object.prototype.hasOwnProperty.call(determination, "caseSides")
    && canonicalSerialize(determination.caseSides) !== canonicalSerialize(payload.caseSides)) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseSides");
  }
  if (Object.prototype.hasOwnProperty.call(determination, "caseGeometryVersion")
    && determination.caseGeometryVersion !== caseGeometryVersion) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseGeometryVersion");
  }
  return {
    caseId,
    T0Identity,
    caseSides: payload.caseSides,
    caseGeometryVersion,
  };
}

function t0CarrierIdentitySurface(record) {
  return {
    canonicalSerializationVersion: record.canonicalSerializationVersion,
    caseId: record.caseId,
    T0Identity: record.T0Identity,
    caseSides: record.caseSides,
    caseGeometryVersion: record.caseGeometryVersion,
    determinationIdentity: record.determinationIdentity,
    selectedT0Value: record.selectedT0Value,
    selectedT0SourceId: record.selectedT0SourceId,
    selectedT0SourceUrl: record.selectedT0SourceUrl,
    selectedT0SourceArtifactHash: record.selectedT0SourceArtifactHash,
    searchDeterminationDate: record.searchDeterminationDate,
    researcherIdentity: record.researcherIdentity,
    reviewerIdentity: record.reviewerIdentity,
    searchScope: record.searchScope,
    candidates: record.candidates,
    negativeFinding: record.negativeFinding,
    firstnessBasis: record.firstnessBasis,
    determinationCommitment: record.determinationCommitment,
    certificationBinding: record.certificationBinding,
  };
}

export function assertCarrierMatchesCase(runtime, carrier, expected = {}) {
  void runtime;
  if (!isPlainObject(carrier)) failClosed("T0_DETERMINATION_OBJECT_INVALID");
  if (expected.caseId != null && carrier.caseId !== expected.caseId) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseId");
  }
  if (expected.T0Identity != null && carrier.T0Identity !== expected.T0Identity) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "T0Identity");
  }
  if (Object.prototype.hasOwnProperty.call(expected, "caseSides") && expected.caseSides != null
    && canonicalSerialize(carrier.caseSides) !== canonicalSerialize(expected.caseSides)) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseSides");
  }
  if (expected.caseGeometryVersion != null
    && carrier.caseGeometryVersion !== expected.caseGeometryVersion) {
    failClosed("T0_CARRIER_CASE_MISMATCH", "caseGeometryVersion");
  }
  return true;
}

export function buildT0DeterminationCarrier(runtime, session, candidate) {
  if (!session || session.region !== REGION.R0) {
    failClosed("REGION_TRANSITION_INVALID", session?.region);
  }
  if (!candidate || candidate.outputKind !== OUTPUT_KIND.RESOLUTION_CANDIDATE) {
    failClosed("CERTIFICATION_SUBJECT_NOT_CANDIDATE");
  }
  const payload = candidate.canonicalStructuredPayload;
  if (!isPlainObject(payload)) failClosed("T0_DETERMINATION_OBJECT_INVALID");
  const determination = payload.t0Determination;
  if (!isPlainObject(determination)) failClosed("T0_DETERMINATION_MISSING");

  const commitmentProposition = locateDeterminationCommitmentProposition(candidate);
  const recomputedCommitment = canonicalDeterminationCommitment(determination);
  if (commitmentProposition.canonicalProposition !== recomputedCommitment) {
    failClosed("T0_DETERMINATION_COMMITMENT_MISMATCH");
  }
  const certified = locateCertifiedDeterminationCommitment(runtime, candidate, commitmentProposition);

  const determinationIdentity = requiredNonEmptyString(
    determination.determinationIdentity,
    "determinationIdentity",
  );
  const selectedT0Value = requiredNonEmptyString(determination.selectedT0Value, "selectedT0Value");
  const selectedT0SourceId = requiredNonEmptyString(
    determination.selectedT0SourceId,
    "selectedT0SourceId",
  );
  const selectedT0SourceUrl = requiredNonEmptyString(
    determination.selectedT0SourceUrl,
    "selectedT0SourceUrl",
  );
  const selectedT0SourceArtifactHash = requiredNonEmptyString(
    determination.selectedT0SourceArtifactHash,
    "selectedT0SourceArtifactHash",
  );
  const searchDeterminationDate = requiredNonEmptyString(
    determination.searchDeterminationDate,
    "searchDeterminationDate",
  );
  const researcherIdentity = requiredNonEmptyString(
    determination.researcherIdentity,
    "researcherIdentity",
  );
  const searchScope = requiredPresentValue(determination.searchScope, "searchScope");
  const firstnessBasis = requiredPresentValue(determination.firstnessBasis, "firstnessBasis");
  const negativeFinding = requiredPresentValue(determination.negativeFinding, "negativeFinding");
  const candidates = enforceDeterminationCandidateSet(
    determination.candidates,
    selectedT0Value,
    selectedT0SourceId,
    selectedT0SourceUrl,
  );

  const certReviewer = certificationReviewerIdentity(runtime, certified.record);
  let reviewerIdentity = determination.reviewerIdentity ?? null;
  if (typeof reviewerIdentity === "string" && reviewerIdentity.length === 0) reviewerIdentity = null;
  if (reviewerIdentity == null) reviewerIdentity = certReviewer;
  if (typeof reviewerIdentity !== "string" || reviewerIdentity.length === 0) {
    failClosed("T0_DETERMINATION_SURFACE_INCOMPLETE", "reviewerIdentity");
  }
  if (certReviewer && reviewerIdentity !== certReviewer) {
    failClosed("T0_DETERMINATION_REVIEWER_MISMATCH");
  }

  const supportingSourceRecordIds = sortUniqueStrings(
    certified.prop.supportingSourceRecordIds ?? [],
  );
  crossCheckSelectedSource(runtime, {
    selectedT0SourceId,
    selectedT0SourceUrl,
    selectedT0SourceArtifactHash,
    supportingSourceRecordIds,
  });
  crossCheckAllCandidateSources(runtime, candidates, supportingSourceRecordIds);

  const caseBinding = bindCaseIdentity(payload, determination);
  assertCarrierMatchesCase(runtime, {
    ...caseBinding,
  }, {
    caseId: session.g0?.caseId ?? caseBinding.caseId,
    T0Identity: session.g0?.T0Identity ?? caseBinding.T0Identity,
    caseSides: session.g0?.caseSides ?? caseBinding.caseSides,
    caseGeometryVersion: session.g0?.caseGeometryVersion ?? caseBinding.caseGeometryVersion,
  });

  const identitySurface = {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    ...caseBinding,
    determinationIdentity,
    selectedT0Value,
    selectedT0SourceId,
    selectedT0SourceUrl,
    selectedT0SourceArtifactHash,
    searchDeterminationDate,
    researcherIdentity,
    reviewerIdentity,
    searchScope,
    candidates,
    negativeFinding,
    firstnessBasis,
    determinationCommitment: recomputedCommitment,
    certificationBinding: {
      resolutionCandidateIdentity: candidate.prePcmOutputRecordId,
      resolutionCertificationOccurrenceId: certified.record.resolutionCertificationOccurrenceId,
      certificationClaimDigest: certified.record.certificationClaimDigest,
      certifiedCommitmentProposition: recomputedCommitment,
      certifiedCommitmentPropositionOrdinal: commitmentProposition.propositionOrdinal,
      supportingSourceRecordIds,
    },
  };
  const t0DeterminationId = computeIdentity(DOMAIN_TAG.T0_DETERMINATION, identitySurface);
  const record = {
    ...identitySurface,
    t0DeterminationId,
  };
  runtime.store.put("t0Determination", t0DeterminationId, record);
  return t0DeterminationId;
}

export function resolveT0DeterminationCarrier(runtime, t0DeterminationId) {
  if (typeof t0DeterminationId !== "string" || t0DeterminationId.length === 0) {
    failClosed("T0_DETERMINATION_ID_INVALID");
  }
  const record = runtime.store.get("t0Determination", t0DeterminationId);
  const recomputed = computeIdentity(DOMAIN_TAG.T0_DETERMINATION, t0CarrierIdentitySurface(record));
  if (recomputed !== t0DeterminationId || recomputed !== record.t0DeterminationId) {
    failClosed("T0_DETERMINATION_IDENTITY_MISMATCH");
  }
  return record;
}

export { completionCarrier };
