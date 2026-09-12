import {
  ANCHOR_KIND,
  CANONICAL_SERIALIZATION_VERSION,
  DOMAIN_TAG,
  OUTPUT_KIND,
  RULE_REF,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { sortUniqueStrings } from "./canonical.js";
import { getCommittedEmim, historicalAnchorSet } from "./emim.js";

function terminalAnchorId(anchor) {
  if (!anchor || typeof anchor !== "object") failClosed("LINEAGE_ANCHOR_INVALID");
  if (typeof anchor.id !== "string" || anchor.id.length === 0) failClosed("LINEAGE_ANCHOR_ID_INVALID");
  return { kind: anchor.kind, id: anchor.id };
}

export function prePcmSourceLineage(runtime, anchor, seen = new Set()) {
  const { kind, id } = terminalAnchorId(anchor);
  const key = `${kind}:${id}`;
  if (seen.has(key)) return [];
  seen.add(key);

  if (kind === ANCHOR_KIND.RESOLUTION_SOURCE || kind === ANCHOR_KIND.RETRIEVAL_QUALIFICATION) {
    return [id];
  }
  if (kind === ANCHOR_KIND.PREPCM_OUTPUT) {
    const output = runtime.store.get("prePcmOutput", id);
    return reconstructLineageFromOutput(runtime, output, seen);
  }
  if (kind === ANCHOR_KIND.SEALED_FACT
    || kind === ANCHOR_KIND.EVIDENCE_BINDING
    || kind === ANCHOR_KIND.PROTECTED_DERIVATIVE) {
    return [id];
  }
  failClosed("LINEAGE_ANCHOR_KIND_INVALID", kind);
}

export function reconstructLineageFromOutput(runtime, output, seen = new Set()) {
  const emim = getCommittedEmim(runtime, output.producingHistoricalExecutionId);
  const anchors = historicalAnchorSet(emim);
  const union = [];
  for (const anchor of anchors) {
    union.push(...prePcmSourceLineage(runtime, anchor, seen));
  }
  return sortUniqueStrings(union);
}

export function lineageDigest(lineageIds) {
  const sorted = sortUniqueStrings(lineageIds);
  return computeIdentity(DOMAIN_TAG.PREPCM_LINEAGE, sorted);
}

export function createPrePcmOutputRecords(runtime, {
  producingHistoricalExecutionId,
  extractedOutputs,
  outputExtractionRuleRef = RULE_REF.OUTPUT_EXTRACTION,
}) {
  if (!Array.isArray(extractedOutputs)) failClosed("OUTPUTS_INVALID");
  const emim = getCommittedEmim(runtime, producingHistoricalExecutionId);
  if (emim.executionCompletionStatus === "COMMITTED" && extractedOutputs.length > 0) {
    failClosed("PARTIAL_OUTPUT_PROMOTION");
  }

  const lineageIds = reconstructLineageFromEmim(runtime, emim);
  const prePcmSourceLineageDigest = lineageDigest(lineageIds);
  const records = [];

  for (let index = 0; index < extractedOutputs.length; index += 1) {
    const item = extractedOutputs[index];
    const outputOrdinal = index + 1;
    if (!Object.values(OUTPUT_KIND).includes(item.outputKind)) {
      failClosed("OUTPUT_KIND_INVALID", item.outputKind);
    }
    if (item.outputKind === OUTPUT_KIND.RETRIEVAL_REQUEST && !item.canonicalStructuredPayload) {
      failClosed("FREE_FORM_REQUEST_NOT_EXECUTABLE");
    }
    const exactOutputRepresentation = item.exactOutputRepresentation;
    if (typeof exactOutputRepresentation !== "string") failClosed("OUTPUT_REPRESENTATION_INVALID");
    const serializationIdentity = item.serializationIdentity ?? "HLX-OUTPUT-SERIAL-v1";
    const representationType = item.representationType ?? "text/canonical+json";
    const outputContentDigest = computeIdentity(DOMAIN_TAG.PREPCM_OUTPUT_CONTENT, {
      serializationIdentity,
      representationType,
      exactOutputRepresentation,
    });
    const identitySurface = {
      producingHistoricalExecutionId,
      outputOrdinal,
      outputKind: item.outputKind,
      outputExtractionRuleRef,
      outputContentDigest,
      prePcmSourceLineageDigest,
    };
    const prePcmOutputRecordId = computeIdentity(DOMAIN_TAG.PREPCM_OUTPUT, identitySurface);
    const record = runtime.store.put("prePcmOutput", prePcmOutputRecordId, {
      ...identitySurface,
      canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
      exactOutputRepresentation,
      canonicalStructuredPayload: item.canonicalStructuredPayload ?? null,
      serializationIdentity,
      representationType,
      prePcmOutputRecordId,
      prePcmSourceLineage: lineageIds,
    });
    records.push(record);
  }
  return records;
}

export function reconstructLineageFromEmim(runtime, emim) {
  const anchors = historicalAnchorSet(emim);
  const union = [];
  const seen = new Set();
  for (const anchor of anchors) {
    union.push(...prePcmSourceLineage(runtime, anchor, seen));
  }
  return sortUniqueStrings(union);
}

export function verifyOutputLineage(runtime, output) {
  const reconstructed = reconstructLineageFromOutput(runtime, output);
  const digest = lineageDigest(reconstructed);
  if (digest !== output.prePcmSourceLineageDigest) {
    failClosed("LINEAGE_DIGEST_MISMATCH", output.prePcmOutputRecordId);
  }
  const contentDigest = computeIdentity(DOMAIN_TAG.PREPCM_OUTPUT_CONTENT, {
    serializationIdentity: output.serializationIdentity,
    representationType: output.representationType,
    exactOutputRepresentation: output.exactOutputRepresentation,
  });
  if (contentDigest !== output.outputContentDigest) {
    failClosed("OUTPUT_CONTENT_REDIGEST_FAILURE", output.prePcmOutputRecordId);
  }
  const identity = computeIdentity(DOMAIN_TAG.PREPCM_OUTPUT, {
    producingHistoricalExecutionId: output.producingHistoricalExecutionId,
    outputOrdinal: output.outputOrdinal,
    outputKind: output.outputKind,
    outputExtractionRuleRef: output.outputExtractionRuleRef,
    outputContentDigest: output.outputContentDigest,
    prePcmSourceLineageDigest: output.prePcmSourceLineageDigest,
  });
  if (identity !== output.prePcmOutputRecordId) {
    failClosed("OUTPUT_IDENTITY_RECOMPUTE_FAILURE");
  }
  return reconstructed;
}

export function getOutput(runtime, prePcmOutputRecordId) {
  return runtime.store.get("prePcmOutput", prePcmOutputRecordId);
}

export function assertTypedRetrievalRequest(output) {
  if (output.outputKind !== OUTPUT_KIND.RETRIEVAL_REQUEST) {
    failClosed("FREE_FORM_REQUEST_NOT_EXECUTABLE", output.outputKind);
  }
  if (!output.canonicalStructuredPayload || typeof output.canonicalStructuredPayload !== "object") {
    failClosed("FREE_FORM_REQUEST_NOT_EXECUTABLE", "missing canonicalStructuredPayload");
  }
  return output.canonicalStructuredPayload;
}
