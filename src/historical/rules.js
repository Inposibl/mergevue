import {
  AUTHORIZATION_DECISION,
  AUTHORIZATION_VARIANT,
  CERTIFICATION_RESULT,
  CHECK_CLASS,
  G0_LIMB_A_FIELDS,
  OUTPUT_KIND,
  RENDERING_RELATION,
  REQUEST_KIND,
  RETRIEVAL_ROLE,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { canonicalSerialize } from "./canonical.js";

function asSet(value) {
  if (Array.isArray(value)) return new Set(value);
  if (value instanceof Set) return value;
  return new Set();
}

function payloadOf(request) {
  return request?.canonicalStructuredPayload ?? request;
}

function temporalRefResolved(value) {
  return typeof value === "string" && value.length > 0;
}

function imposedTemporalBoundaryRef(policyTuple) {
  if (temporalRefResolved(policyTuple?.temporalBoundaryRef)) {
    return policyTuple.temporalBoundaryRef;
  }
  const nested = policyTuple?.temporalBoundaries?.temporalBoundaryRef;
  if (temporalRefResolved(nested)) return nested;
  return null;
}

function imposedAllowedTemporalLanes(policyTuple) {
  if (Array.isArray(policyTuple?.allowedTemporalLanes)) {
    return policyTuple.allowedTemporalLanes;
  }
  const nested = policyTuple?.temporalBoundaries?.allowedTemporalLanes;
  if (Array.isArray(nested)) return nested;
  return null;
}

export function authRuleV1(requestPayload, policyTuple) {
  const payload = payloadOf(requestPayload);
  if (!payload || typeof payload !== "object") {
    return {
      temporalAuthorizationResult: { authorized: false, reason: "REQUEST_PAYLOAD_INVALID" },
      sourceMethodAuthorizationResult: { authorized: false, reason: "REQUEST_PAYLOAD_INVALID" },
      authorizationDecision: AUTHORIZATION_DECISION.REFUSED,
      refusalReason: "REQUEST_PAYLOAD_INVALID",
    };
  }

  const allowedSources = asSet(policyTuple.allowedSourceClasses);
  const allowedMethods = asSet(policyTuple.allowedRetrievalMethods);
  const sourceOk = allowedSources.has(payload.sourceClassRef);
  const methodOk = allowedMethods.has(payload.retrievalMethodRef);

  let temporalOk = true;
  let temporalReason = null;
  if (temporalRefResolved(policyTuple.temporalLaneRef)) {
    if (!temporalRefResolved(payload.temporalLaneRef)) {
      temporalOk = false;
      temporalReason = "TEMPORAL_LANE_UNRESOLVED";
    } else if (payload.temporalLaneRef !== policyTuple.temporalLaneRef) {
      temporalOk = false;
      temporalReason = "TEMPORAL_LANE_MISMATCH";
    }
  }
  const requiredBoundaryRef = imposedTemporalBoundaryRef(policyTuple);
  if (requiredBoundaryRef != null) {
    if (!temporalRefResolved(payload.temporalBoundaryRef)) {
      temporalOk = false;
      temporalReason = temporalReason ?? "TEMPORAL_BOUNDARY_UNRESOLVED";
    } else if (payload.temporalBoundaryRef !== requiredBoundaryRef) {
      temporalOk = false;
      temporalReason = temporalReason ?? "TEMPORAL_BOUNDARY_MISMATCH";
    }
  }
  const allowedLanes = imposedAllowedTemporalLanes(policyTuple);
  if (allowedLanes != null) {
    if (!temporalRefResolved(payload.temporalLaneRef)) {
      temporalOk = false;
      temporalReason = temporalReason ?? "TEMPORAL_LANE_UNRESOLVED";
    } else if (!allowedLanes.includes(payload.temporalLaneRef)) {
      temporalOk = false;
      temporalReason = temporalReason ?? "TEMPORAL_LANE_NOT_PERMITTED";
    }
  }

  if (policyTuple.authorizationVariant === AUTHORIZATION_VARIANT.RESOLUTION_AUTHORIZATION) {
    if (payload.confersEvidenceStatus === true || payload.demandSlotRef != null) {
      return {
        temporalAuthorizationResult: { authorized: temporalOk, reason: temporalReason },
        sourceMethodAuthorizationResult: { authorized: false, reason: "R0_EVIDENCE_FIREWALL" },
        authorizationDecision: AUTHORIZATION_DECISION.REFUSED,
        refusalReason: "R0_EVIDENCE_FIREWALL",
      };
    }
  }

  if (policyTuple.authorizationVariant === AUTHORIZATION_VARIANT.STAGE_B_AUTHORIZATION) {
    if (policyTuple.governingDemandSlotRef && payload.demandSlotRef
      && payload.demandSlotRef !== policyTuple.governingDemandSlotRef) {
      return {
        temporalAuthorizationResult: { authorized: temporalOk, reason: temporalReason },
        sourceMethodAuthorizationResult: { authorized: false, reason: "DEMAND_SLOT_MISMATCH" },
        authorizationDecision: AUTHORIZATION_DECISION.REFUSED,
        refusalReason: "DEMAND_SLOT_MISMATCH",
      };
    }
  }

  const sourceMethodOk = sourceOk && methodOk;
  const authorized = sourceMethodOk && temporalOk;
  return {
    temporalAuthorizationResult: {
      authorized: temporalOk,
      reason: temporalOk ? null : temporalReason,
    },
    sourceMethodAuthorizationResult: {
      authorized: sourceMethodOk,
      reason: sourceMethodOk ? null : (!sourceOk ? "SOURCE_CLASS_NOT_PERMITTED" : "METHOD_NOT_PERMITTED"),
    },
    authorizationDecision: authorized ? AUTHORIZATION_DECISION.AUTHORIZED : AUTHORIZATION_DECISION.REFUSED,
    refusalReason: authorized ? null : (
      !sourceOk ? "SOURCE_CLASS_NOT_PERMITTED"
        : !methodOk ? "METHOD_NOT_PERMITTED"
          : temporalReason
    ),
  };
}

export function xrPermitsV1(expansionBound, descriptor) {
  if (!expansionBound || typeof expansionBound !== "object") return false;
  if (!descriptor || typeof descriptor !== "object") return false;
  const allowedSources = asSet(expansionBound.allowedSourceClasses);
  const allowedMethods = asSet(expansionBound.allowedRetrievalMethods);
  if (!allowedSources.has(descriptor.sourceClassRef)) return false;
  if (!allowedMethods.has(descriptor.retrievalMethodRef)) return false;
  if (expansionBound.allowedTemporalLanes && descriptor.temporalLaneRef != null) {
    if (!expansionBound.allowedTemporalLanes.includes(descriptor.temporalLaneRef)) return false;
  }
  if (expansionBound.queryFamilyBound && descriptor.queryFamilyBound) {
    if (descriptor.queryFamilyBound !== expansionBound.queryFamilyBound) return false;
  }
  if (expansionBound.mayEnlarge === true) return false;
  if (descriptor.evidenceStatus && descriptor.evidenceStatus !== "NON_EVIDENCE"
    && expansionBound.evidenceStatus !== descriptor.evidenceStatus) {
    return false;
  }
  if (descriptor.instructionAuthority === "AUTHORITY_BEARING"
    && expansionBound.instructionAuthority !== "AUTHORITY_BEARING") {
    return false;
  }
  return true;
}

export function requestDerivationV1(discoveryContent, selector) {
  if (!discoveryContent || typeof discoveryContent !== "object") {
    failClosed("DISCOVERY_CONTENT_INVALID");
  }
  if (!selector || typeof selector !== "object") failClosed("LOCATOR_SELECTOR_INVALID");
  const locators = Array.isArray(discoveryContent.locators) ? discoveryContent.locators : [];
  const match = locators.find((entry) => {
    if (selector.locatorId != null) return entry.locatorId === selector.locatorId;
    if (selector.exactLocator != null) return entry.exactLocator === selector.exactLocator;
    return false;
  });
  if (!match) failClosed("FANOUT_LOCATOR_ABSENT_FROM_DISCOVERY");
  return {
    retrievalRole: RETRIEVAL_ROLE.SOURCE,
    sourceClassRef: match.sourceClassRef,
    exactLocator: match.exactLocator,
    retrievalMethodRef: match.retrievalMethodRef,
    expansionRuleRef: null,
    queryFamilyBound: null,
    temporalLaneRef: match.temporalLaneRef ?? discoveryContent.temporalLaneRef ?? null,
    temporalBoundaryRef: match.temporalBoundaryRef ?? discoveryContent.temporalBoundaryRef ?? null,
    demandSlotRef: discoveryContent.demandSlotRef ?? null,
  };
}

export function renderingIdentityV1(sourceMaterial, parameters) {
  if (parameters && Object.keys(parameters).length > 0 && parameters.relation === RENDERING_RELATION.TRANSFORMED) {
    failClosed("RENDERING_RULE_MISMATCH", "identity rule cannot apply transformed parameters");
  }
  if (typeof sourceMaterial === "string") return sourceMaterial;
  return canonicalSerialize(sourceMaterial);
}

export function renderingTransformV1(sourceMaterial, parameters) {
  const raw = typeof sourceMaterial === "string" ? sourceMaterial : canonicalSerialize(sourceMaterial);
  let result = raw;
  if (parameters?.prefix) result = String(parameters.prefix) + result;
  if (parameters?.suffix) result = result + String(parameters.suffix);
  if (typeof parameters?.maxChars === "number") result = result.slice(0, parameters.maxChars);
  if (parameters?.fieldProjection && typeof sourceMaterial === "object" && sourceMaterial !== null) {
    const projected = {};
    for (const field of parameters.fieldProjection) projected[field] = sourceMaterial[field];
    result = canonicalSerialize(projected);
  }
  return result;
}

export function outputExtractionV1(generationResult) {
  if (!generationResult || generationResult.generationComplete !== true) {
    failClosed("GENERATION_NOT_COMPLETE");
  }
  const typed = Array.isArray(generationResult.typedOutputs) ? generationResult.typedOutputs : [];
  return typed.map((item, index) => {
    if (!item || typeof item !== "object") failClosed("OUTPUT_SHAPE_INVALID", String(index));
    if (!Object.values(OUTPUT_KIND).includes(item.outputKind)) {
      failClosed("OUTPUT_KIND_INVALID", item.outputKind);
    }
    if (item.outputKind === OUTPUT_KIND.RETRIEVAL_REQUEST) {
      if (!item.canonicalStructuredPayload || typeof item.canonicalStructuredPayload !== "object") {
        failClosed("FREE_FORM_REQUEST_NOT_EXECUTABLE");
      }
      if (!item.canonicalStructuredPayload.requestKind
        || !Object.values(REQUEST_KIND).includes(item.canonicalStructuredPayload.requestKind)) {
        failClosed("RETRIEVAL_REQUEST_KIND_INVALID");
      }
    }
    return {
      outputKind: item.outputKind,
      exactOutputRepresentation: item.exactOutputRepresentation
        ?? (item.canonicalStructuredPayload
          ? canonicalSerialize(item.canonicalStructuredPayload)
          : (item.text ?? "")),
      canonicalStructuredPayload: item.canonicalStructuredPayload ?? null,
      representationType: item.representationType ?? "text/canonical+json",
      serializationIdentity: item.serializationIdentity ?? "HLX-OUTPUT-SERIAL-v1",
    };
  });
}

export function g0FieldMapV1(requiredFieldSet, propositions) {
  const map = {};
  for (const field of requiredFieldSet) map[field] = [];
  for (const proposition of propositions) {
    const field = proposition.g0Field ?? proposition.fieldId ?? null;
    if (field && Object.prototype.hasOwnProperty.call(map, field)) {
      map[field].push(proposition);
    }
  }
  return map;
}

export const AMBIGUITY_DISPOSITION = Object.freeze({
  NONE_SURVIVING: "NONE_SURVIVING",
  SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY: "SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY",
});

export function certificationRuleV1({ claimSurface, decisionInputSet, candidatePropositions }) {
  const inputIds = new Set(decisionInputSet);
  const checkClassification = {
    1: CHECK_CLASS.JUDGMENT_BASED,
    2: CHECK_CLASS.DETERMINISTIC,
    3: CHECK_CLASS.JUDGMENT_BASED,
    4: CHECK_CLASS.JUDGMENT_BASED,
    5: CHECK_CLASS.JUDGMENT_BASED,
    6: CHECK_CLASS.JUDGMENT_BASED,
    aggregation: CHECK_CLASS.DETERMINISTIC,
  };

  const replayedPropositions = claimSurface.certifiedPropositions.map((prop) => {
    const sourceOk = (prop.supportingSourceRecordIds ?? []).every((id) => inputIds.has(id));
    const inCandidate = candidatePropositions.some(
      (candidate) => candidate.canonicalProposition === prop.canonicalProposition,
    );
    const check2 = sourceOk && inCandidate ? "PASS" : "FAIL";
    return {
      propositionOrdinal: prop.propositionOrdinal,
      check2,
      recordedChecks: prop.checkResults,
    };
  });

  const deterministicReplayOk = replayedPropositions.every((p) => {
    const recorded = p.recordedChecks?.[1];
    return p.check2 === "PASS" && (recorded == null || recorded === "PASS");
  });

  let hasFail = false;
  for (const prop of claimSurface.certifiedPropositions) {
    const checks = prop.checkResults ?? [];
    if (checks.length !== 6) failClosed("CERTIFICATION_CHECKS_INCOMPLETE");
    for (const outcome of checks) {
      if (outcome !== "PASS" && outcome !== "FAIL") {
        failClosed("CERTIFICATION_RESULT_UNRESOLVABLE");
      }
      if (outcome === "FAIL") hasFail = true;
    }
  }

  let result;
  if (hasFail) {
    result = CERTIFICATION_RESULT.FAIL;
  } else {
    const disposition = claimSurface.ambiguityDisposition;
    if (disposition === AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY) {
      result = CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY;
    } else if (disposition === AMBIGUITY_DISPOSITION.NONE_SURVIVING) {
      result = CERTIFICATION_RESULT.PASS;
    } else {
      failClosed("CERTIFICATION_RESULT_UNRESOLVABLE");
    }
  }

  return {
    checkClassification,
    replayedPropositions,
    deterministicReplayOk,
    certificationResult: result,
  };
}

export function registerBuiltinRules(runtime) {
  runtime.registerRule(RULE_REF.AUTH, authRuleV1);
  runtime.registerRule(RULE_REF.XR, xrPermitsV1);
  runtime.registerRule(RULE_REF.REQUEST_DERIVATION, requestDerivationV1);
  runtime.registerRule(RULE_REF.RENDERING_IDENTITY, renderingIdentityV1);
  runtime.registerRule(RULE_REF.RENDERING_TRANSFORM, renderingTransformV1);
  runtime.registerRule(RULE_REF.OUTPUT_EXTRACTION, outputExtractionV1);
  runtime.registerRule(RULE_REF.G0_FIELD_MAP, g0FieldMapV1);
  runtime.registerRule(RULE_REF.CERTIFICATION, certificationRuleV1);
}
