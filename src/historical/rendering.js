import {
  CANONICAL_SERIALIZATION_VERSION,
  DOMAIN_TAG,
  REGION,
  RENDERING_RELATION,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { freezeRecord } from "./runtime.js";

function resolveAccessedMaterial(runtime, sourceAccessReference) {
  const source = runtime.store.tryGet("resolutionSource", sourceAccessReference);
  if (source) {
    return { sourceMaterialIdentity: source.sourceMaterialIdentity ?? source.sourceIdentity };
  }
  const qual = runtime.store.tryGet("retrievalQualification", sourceAccessReference);
  if (qual) {
    return { sourceMaterialIdentity: qual.sourceIdentity };
  }
  const access = runtime.store.tryGet("xpiAccessEvent", sourceAccessReference);
  if (access) {
    return { sourceMaterialIdentity: access.accessedMaterialIdentity };
  }
  return null;
}

export function createRenderedContentArtifact(runtime, {
  exactRenderedRepresentation,
  serializationIdentity = "HLX-RENDER-SERIAL-v1",
  representationType = "text/plain",
}) {
  if (typeof exactRenderedRepresentation !== "string") {
    failClosed("RENDERED_REPRESENTATION_INVALID");
  }
  if (typeof serializationIdentity !== "string" || typeof representationType !== "string") {
    failClosed("RENDERED_ARTIFACT_FIELDS_INVALID");
  }
  const renderedContentDigest = computeIdentity(DOMAIN_TAG.RENDERED_CONTENT, {
    serializationIdentity,
    representationType,
    exactRenderedRepresentation,
  });
  const existing = runtime.store.tryGet("renderedContent", renderedContentDigest);
  if (existing) return existing;
  return runtime.store.put("renderedContent", renderedContentDigest, {
    exactRenderedRepresentation,
    serializationIdentity,
    representationType,
    renderedContentArtifactId: renderedContentDigest,
  });
}

export function recoverRenderedContent(runtime, renderedContentArtifactId) {
  const artifact = runtime.store.get("renderedContent", renderedContentArtifactId);
  const recomputed = computeIdentity(DOMAIN_TAG.RENDERED_CONTENT, {
    serializationIdentity: artifact.serializationIdentity,
    representationType: artifact.representationType,
    exactRenderedRepresentation: artifact.exactRenderedRepresentation,
  });
  if (recomputed !== artifact.renderedContentArtifactId) {
    failClosed("RENDERED_CONTENT_REDIGEST_FAILURE", renderedContentArtifactId);
  }
  return artifact;
}

export function renderedContentRecoverable(runtime, item) {
  if (!item?.renderedContentDigest) return false;
  try {
    const artifact = recoverRenderedContent(runtime, item.renderedContentDigest);
    return artifact.renderedContentArtifactId === item.renderedContentDigest;
  } catch {
    return false;
  }
}

function applyRenderingRule(runtime, renderingRuleRef, sourceMaterial, renderingParameters) {
  const rule = runtime.getRule(renderingRuleRef);
  return rule(sourceMaterial, renderingParameters ?? {});
}

export function createRenderingDerivation(runtime, {
  sourceMaterialIdentity,
  sourceAccessReference,
  sourceMaterial,
  renderingRuleRef = RULE_REF.RENDERING_IDENTITY,
  renderingParameters = {},
  renderingRelation = RENDERING_RELATION.IDENTITY,
  region,
}) {
  if (typeof sourceMaterialIdentity !== "string" || sourceMaterialIdentity.length === 0) {
    failClosed("SOURCE_MATERIAL_IDENTITY_INVALID");
  }
  if (typeof sourceAccessReference !== "string" || sourceAccessReference.length === 0) {
    failClosed("SOURCE_ACCESS_REFERENCE_INVALID");
  }
  if (sourceMaterialIdentity === sourceAccessReference && region === REGION.R3) {
    failClosed("SOURCE_MATERIAL_ACCESS_COLLAPSED", "R3 requires distinct material vs access identities");
  }
  if (sourceMaterial == null) failClosed("SOURCE_MATERIAL_UNRESOLVABLE");
  const accessed = resolveAccessedMaterial(runtime, sourceAccessReference);
  if (accessed && accessed.sourceMaterialIdentity !== sourceMaterialIdentity) {
    failClosed(
      "SOURCE_MATERIAL_UNRESOLVABLE",
      "sourceMaterialIdentity does not agree with the material supplied by sourceAccessReference",
    );
  }

  const renderingParametersDigest = computeIdentity(DOMAIN_TAG.RENDER_PARAMS, {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    renderingParameters,
  });
  const exactRenderedRepresentation = applyRenderingRule(
    runtime,
    renderingRuleRef,
    sourceMaterial,
    renderingParameters,
  );
  if (renderingRelation === RENDERING_RELATION.IDENTITY) {
    const identityBytes = typeof sourceMaterial === "string"
      ? sourceMaterial
      : runtime.canonicalSerialize(sourceMaterial);
    if (exactRenderedRepresentation !== identityBytes) {
      failClosed("RENDERING_IDENTITY_MISMATCH");
    }
  }
  const artifact = createRenderedContentArtifact(runtime, {
    exactRenderedRepresentation,
    serializationIdentity: renderingParameters.serializationIdentity ?? "HLX-RENDER-SERIAL-v1",
    representationType: renderingParameters.representationType ?? "text/plain",
  });

  const identitySurface = {
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    sourceMaterialIdentity,
    sourceAccessReference,
    renderingRuleRef,
    renderingParametersDigest,
    producedRenderedContentArtifactRef: artifact.renderedContentArtifactId,
    renderingRelation,
  };
  const renderingDerivationRecordId = computeIdentity(DOMAIN_TAG.RENDER_DERIV, identitySurface);
  const existing = runtime.store.tryGet("renderingDerivation", renderingDerivationRecordId);
  if (existing) return existing;

  const record = {
    ...identitySurface,
    renderingParameters,
    renderingDerivationRecordId,
    region: region ?? null,
  };
  return runtime.store.put("renderingDerivation", renderingDerivationRecordId, record);
}

export function resolveDerivation(runtime, renderingDerivationRecordId) {
  const derivation = runtime.store.get("renderingDerivation", renderingDerivationRecordId);
  const recomputed = computeIdentity(DOMAIN_TAG.RENDER_DERIV, {
    canonicalSerializationVersion: derivation.canonicalSerializationVersion,
    sourceMaterialIdentity: derivation.sourceMaterialIdentity,
    sourceAccessReference: derivation.sourceAccessReference,
    renderingRuleRef: derivation.renderingRuleRef,
    renderingParametersDigest: derivation.renderingParametersDigest,
    producedRenderedContentArtifactRef: derivation.producedRenderedContentArtifactRef,
    renderingRelation: derivation.renderingRelation,
  });
  if (recomputed !== derivation.renderingDerivationRecordId) {
    failClosed("RENDERING_DERIVATION_RECOMPUTE_FAILURE");
  }
  recoverRenderedContent(runtime, derivation.producedRenderedContentArtifactRef);
  return derivation;
}

export function assertSourceMaterialAgreesWithAccess(runtime, derivation, expectedMaterialIdentity) {
  if (derivation.sourceMaterialIdentity !== expectedMaterialIdentity) {
    failClosed(
      "SOURCE_MATERIAL_UNRESOLVABLE",
      "sourceMaterialIdentity does not agree with the material supplied by sourceAccessReference",
    );
  }
}

export function replayRendering(runtime, derivation, sourceMaterial) {
  const produced = applyRenderingRule(
    runtime,
    derivation.renderingRuleRef,
    sourceMaterial,
    derivation.renderingParameters,
  );
  const artifact = recoverRenderedContent(runtime, derivation.producedRenderedContentArtifactRef);
  if (produced !== artifact.exactRenderedRepresentation) {
    failClosed("RENDERING_REPLAY_FAILURE", derivation.renderingDerivationRecordId);
  }
  return artifact;
}
