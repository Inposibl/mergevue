import {
  ANCHOR_KIND,
  EXECUTION_CLASS,
  ITEM_CHANNEL,
  MATH_BLOCK_ID,
  REGION,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { resolveR0Mandate } from "./authorization.js";
import { buildT0DeterminationCarrier, g0Establishable } from "./certification.js";
import { commitEmim } from "./emim.js";
import { invokeCommittedEmim } from "./invocation.js";
import {
  assertMbEnvUninstantiated,
  compileDemandBlueprint,
  compileSemanticBindings,
  mbEnvSlotType,
  rejectCoreConsumption,
  rejectEnvironmentInstantiation,
  rejectRawLlmToCore,
} from "./hmir.js";
import { createRenderingDerivation } from "./rendering.js";
import { assertExactXpiAccessReference } from "./xpi.js";

export function createCaseSession(runtime, {
  caseSeedId,
  occurrenceDomainIdentity,
  governingScopeIdentity,
}) {
  const session = {
    caseSeedId,
    occurrenceDomainIdentity: occurrenceDomainIdentity ?? caseSeedId,
    governingScopeIdentity: governingScopeIdentity ?? caseSeedId,
    region: REGION.R0,
    g0: null,
    demandBlueprintId: null,
    manifestId: null,
    baselineId: null,
    factualBaselineSealId: null,
    semanticBindings: null,
    t0DeterminationId: null,
  };
  runtime.caseSessions.set(caseSeedId, session);
  return session;
}

export function getCaseSession(runtime, caseSeedId) {
  const session = runtime.caseSessions.get(caseSeedId);
  if (!session) failClosed("CASE_SESSION_UNRESOLVABLE", caseSeedId);
  return session;
}

export function currentRegion(runtime, caseSeedId) {
  return getCaseSession(runtime, caseSeedId).region;
}

export function assertRegionAllowsClass(region, executionClass) {
  if (region === REGION.R2) failClosed("R2_HLX_INVOCATION_PROHIBITED");
  if (region === REGION.R0 && executionClass !== EXECUTION_CLASS.RESOLUTION) {
    failClosed("EXECUTION_CLASS_REGION_MISMATCH");
  }
  if (region === REGION.R1 && executionClass !== EXECUTION_CLASS.RESEARCH
    && executionClass !== EXECUTION_CLASS.EXTRACTION) {
    failClosed("EXECUTION_CLASS_REGION_MISMATCH");
  }
  if (region === REGION.R3 && executionClass !== EXECUTION_CLASS.SEMANTIC_ADJUDICATION
    && executionClass !== EXECUTION_CLASS.DERIVATION) {
    failClosed("EXECUTION_CLASS_REGION_MISMATCH");
  }
}

export function activateR0(runtime, { resolutionMandateRef }) {
  resolveR0Mandate(runtime, resolutionMandateRef);
  return true;
}

export function transitionR0toR1(runtime, caseSeedId, candidate) {
  const session = getCaseSession(runtime, caseSeedId);
  if (session.region !== REGION.R0) failClosed("REGION_TRANSITION_INVALID", session.region);
  if (!g0Establishable(runtime, candidate)) failClosed("G0_NOT_ESTABLISHABLE");
  const t0DeterminationId = buildT0DeterminationCarrier(runtime, session, candidate);
  session.g0 = {
    caseId: candidate.canonicalStructuredPayload.caseId,
    T0Identity: candidate.canonicalStructuredPayload.T0Identity,
    caseSides: candidate.canonicalStructuredPayload.caseSides,
    caseGeometryVersion: candidate.canonicalStructuredPayload.caseGeometryVersion,
  };
  session.t0DeterminationId = t0DeterminationId;
  session.region = REGION.R1;
  return session;
}

export function compileStageA(runtime, caseSeedId, {
  collectionAuthorizationId,
  extraSlotTypes = [],
}) {
  const session = getCaseSession(runtime, caseSeedId);
  if (session.region !== REGION.R1) failClosed("STAGE_A_REQUIRES_R1");
  if (!session.g0) failClosed("G0_REQUIRED_FOR_STAGE_A");
  const blueprint = compileDemandBlueprint(runtime, {
    ...session.g0,
    collectionAuthorizationId,
    slotTypes: [mbEnvSlotType(), ...extraSlotTypes],
  });
  session.demandBlueprintId = blueprint.demandBlueprintId;
  assertMbEnvUninstantiated(runtime, blueprint.demandBlueprintId);
  return blueprint;
}

export function transitionR1toR2(runtime, caseSeedId, factualBaselineSealId) {
  const session = getCaseSession(runtime, caseSeedId);
  if (session.region !== REGION.R1) failClosed("REGION_TRANSITION_INVALID", session.region);
  runtime.store.get("factualSeal", factualBaselineSealId);
  session.factualBaselineSealId = factualBaselineSealId;
  session.region = REGION.R2;
  return session;
}

export function transitionR2toR3(runtime, caseSeedId) {
  const session = getCaseSession(runtime, caseSeedId);
  if (session.region !== REGION.R2) failClosed("REGION_TRANSITION_INVALID", session.region);
  if (!session.factualBaselineSealId) failClosed("SEAL_REQUIRED_FOR_R3");
  const compiled = compileSemanticBindings(runtime, {
    demandBlueprintId: session.demandBlueprintId,
    factualBaselineSealId: session.factualBaselineSealId,
  });
  session.semanticBindings = compiled;
  session.region = REGION.R3;
  return compiled;
}

export function invokeInSession(runtime, caseSeedId, emimInput, extra = {}) {
  const session = getCaseSession(runtime, caseSeedId);
  assertRegionAllowsClass(session.region, emimInput.executionClass);
  const emim = commitEmim(runtime, emimInput, {
    region: session.region,
    xpiExecutionId: extra.xpiExecutionId ?? null,
  });
  return invokeCommittedEmim(runtime, emim.historicalExecutionId, extra);
}

export function renderR0SourceForEmim(runtime, resolutionSourceRecordId) {
  const source = runtime.store.get("resolutionSource", resolutionSourceRecordId);
  if (source.evidenceStatus !== "NON_EVIDENCE") failClosed("R0_EVIDENCE_FIREWALL");
  return createRenderingDerivation(runtime, {
    sourceMaterialIdentity: source.sourceMaterialIdentity ?? source.sourceIdentity,
    sourceAccessReference: resolutionSourceRecordId,
    sourceMaterial: source.retrievedPayload,
    region: REGION.R0,
  });
}

export function renderR1QualificationForEmim(runtime, retrievalQualificationId) {
  const qual = runtime.store.get("retrievalQualification", retrievalQualificationId);
  return createRenderingDerivation(runtime, {
    sourceMaterialIdentity: qual.sourceIdentity,
    sourceAccessReference: retrievalQualificationId,
    sourceMaterial: qual.retrievedPayload,
    region: REGION.R1,
  });
}

export function instructionItem(text, ref = "instruction") {
  return {
    itemChannel: ITEM_CHANNEL.NON_HISTORICAL_INSTRUCTION,
    provenanceAnchor: { kind: ANCHOR_KIND.NON_HISTORICAL_INSTRUCTION, id: ref },
    renderingDerivationRecordRef: null,
    renderedContentDigest: null,
    instructionText: text,
  };
}

export function historicalItemFromDerivation(runtime, derivation, {
  channel = ITEM_CHANNEL.SOURCE_EXCERPT,
  anchor,
}) {
  return {
    itemChannel: channel,
    provenanceAnchor: anchor,
    renderingDerivationRecordRef: derivation.renderingDerivationRecordId,
    renderedContentDigest: derivation.producedRenderedContentArtifactRef,
  };
}

export function offerR0SourceAsStageBEvidence(runtime, resolutionSourceRecordId) {
  const source = runtime.store.get("resolutionSource", resolutionSourceRecordId);
  if (source.retrievalActId != null) failClosed("R0_EVIDENCE_FIREWALL");
  failClosed("R0_EVIDENCE_FIREWALL", "R0 source is non-evidence and cannot become Stage-B evidence");
}

export function offerRawLlmToCore(output) {
  void output;
  rejectRawLlmToCore();
}

export function instantiateEnvironmentSlot() {
  rejectEnvironmentInstantiation();
}

export function markCoreConsumable() {
  rejectCoreConsumption();
}

export function assertSemanticBoundary(compiledBindings) {
  for (const row of compiledBindings.unbindable ?? []) {
    if (row.mathBlockId === MATH_BLOCK_ID.MB_ENV && row.coreConsumable === true) {
      failClosed("CORE_CONSUMPTION_FORBIDDEN");
    }
  }
  for (const binding of compiledBindings.semanticSlotBindings ?? []) {
    if (binding.coreConsumable === true) failClosed("CORE_CONSUMPTION_FORBIDDEN");
  }
  return true;
}

export function assertR3XpiAccess(derivation, evidenceAccessEventId) {
  assertExactXpiAccessReference(derivation, evidenceAccessEventId);
}
