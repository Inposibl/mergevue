import { EXECUTION_CLASS, REGION, RULE_REF } from "./constants.js";
import { failClosed } from "./errors.js";
import {
  assertEmimImmutable,
  getCommittedEmim,
  modelVisibleRenderedItems,
  patchEmimAuditMetadata,
} from "./emim.js";
import { createPrePcmOutputRecords } from "./output.js";
import { HistoricalIngressError } from "./errors.js";

function defaultTransport() {
  return {
    invoke({ renderedItems }) {
      return {
        generationComplete: true,
        receivedRenderedItems: renderedItems.map((item) => ({
          inputItemOrdinal: item.inputItemOrdinal,
          renderedContentDigest: item.renderedContentDigest,
          exactRenderedRepresentation: item.exactRenderedRepresentation,
        })),
        typedOutputs: [],
      };
    },
  };
}

const ATTEMPT_OUTCOME = Object.freeze({
  SUCCESSFUL_COMPLETE: "SUCCESSFUL_COMPLETE",
  TRANSPORT_FAILURE: "TRANSPORT_FAILURE",
  GENERATION_INCOMPLETE: "GENERATION_INCOMPLETE",
  MODEL_VISIBLE_INPUT_MISMATCH: "MODEL_VISIBLE_INPUT_MISMATCH",
  POST_EXPOSURE_FAILURE: "POST_EXPOSURE_FAILURE",
});

function compareReceivedItems(committedItems, received) {
  if (!Array.isArray(received)) {
    return { match: false, reason: "received items not an array" };
  }
  if (received.length !== committedItems.length) {
    return { match: false, reason: "count" };
  }
  for (let i = 0; i < committedItems.length; i += 1) {
    const expected = committedItems[i];
    const actual = received[i];
    if (!actual
      || actual.renderedContentDigest !== expected.renderedContentDigest
      || actual.exactRenderedRepresentation !== expected.exactRenderedRepresentation) {
      return { match: false, reason: String(expected.inputItemOrdinal) };
    }
  }
  return { match: true, reason: null };
}

function putHad1Attempt(runtime, emim, committedItems, fields) {
  if (runtime.store.has("had1", emim.historicalExecutionId)) return;
  const received = Object.prototype.hasOwnProperty.call(fields, "receivedRenderedItems")
    ? fields.receivedRenderedItems
    : null;
  const receivedAvailable = Array.isArray(received);
  runtime.store.put("had1", emim.historicalExecutionId, {
    historicalExecutionId: emim.historicalExecutionId,
    executionOrdinal: emim.executionOrdinal,
    emimCommitmentDigest: emim.emimCommitmentDigest,
    committedRenderedItems: committedItems,
    receivedRenderedItems: receivedAvailable ? received : null,
    committedRenderedDigests: committedItems.map((item) => item.renderedContentDigest),
    receivedRenderedDigests: receivedAvailable
      ? received.map((item) => item?.renderedContentDigest ?? null)
      : null,
    match: fields.match,
    attemptOutcome: fields.attemptOutcome,
    generationComplete: fields.generationComplete === true,
    executionClass: emim.executionClass,
  });
}

export function invokeCommittedEmim(runtime, historicalExecutionId, {
  extraVisibleItems = null,
} = {}) {
  const emim = assertEmimImmutable(runtime, historicalExecutionId);
  if (emim.region === REGION.R2) failClosed("R2_HLX_INVOCATION_PROHIBITED");
  if (emim.invocationStarted) {
    failClosed("INVOCATION_ALREADY_CONSUMED", historicalExecutionId);
  }

  const committedItems = modelVisibleRenderedItems(runtime, emim);
  if (extraVisibleItems && extraVisibleItems.length > 0) {
    failClosed("HIDDEN_UNREGISTERED_MODEL_VISIBLE_ITEM");
  }

  patchEmimAuditMetadata(runtime, historicalExecutionId, {
    invocationStarted: true,
    executionCompletionStatus: "STARTED",
  });
  assertEmimImmutable(runtime, historicalExecutionId);

  const transport = runtime.modelTransport ?? defaultTransport();
  const transportInput = {
    historicalExecutionId,
    emimCommitmentDigest: emim.emimCommitmentDigest,
    executionClass: emim.executionClass,
    governingScopeIdentity: emim.governingScopeIdentity,
    renderedItems: committedItems,
  };

  let generationResult = null;
  try {
    generationResult = transport.invoke(transportInput);
  } catch (error) {
    putHad1Attempt(runtime, emim, committedItems, {
      receivedRenderedItems: null,
      match: null,
      attemptOutcome: ATTEMPT_OUTCOME.TRANSPORT_FAILURE,
      generationComplete: false,
    });
    if (error instanceof HistoricalIngressError) throw error;
    failClosed("MODEL_TRANSPORT_FAILURE", error?.message ?? "transport failed");
  }

  const receivedProvided = Array.isArray(generationResult?.receivedRenderedItems);
  let received = null;
  let match = null;
  if (receivedProvided) {
    const compared = compareReceivedItems(committedItems, generationResult.receivedRenderedItems);
    if (!compared.match) {
      putHad1Attempt(runtime, emim, committedItems, {
        receivedRenderedItems: generationResult.receivedRenderedItems,
        match: false,
        attemptOutcome: ATTEMPT_OUTCOME.MODEL_VISIBLE_INPUT_MISMATCH,
        generationComplete: generationResult?.generationComplete === true,
      });
      failClosed("MODEL_VISIBLE_INPUT_MISMATCH", compared.reason);
    }
    received = generationResult.receivedRenderedItems;
    match = true;
  }

  if (generationResult?.generationComplete !== true) {
    putHad1Attempt(runtime, emim, committedItems, {
      receivedRenderedItems: received,
      match,
      attemptOutcome: ATTEMPT_OUTCOME.GENERATION_INCOMPLETE,
      generationComplete: false,
    });
    runtime.recordTrace("HAD-1", {
      historicalExecutionId,
      emimCommitmentDigest: emim.emimCommitmentDigest,
      committedRenderedDigests: committedItems.map((item) => item.renderedContentDigest),
      receivedRenderedDigests: Array.isArray(received)
        ? received.map((item) => item.renderedContentDigest)
        : null,
      match,
      generationComplete: false,
      attemptOutcome: ATTEMPT_OUTCOME.GENERATION_INCOMPLETE,
    });
    return { emim: getCommittedEmim(runtime, historicalExecutionId), outputs: [] };
  }

  try {
    const extractor = runtime.getRule(RULE_REF.OUTPUT_EXTRACTION);
    const extracted = extractor(generationResult);
    const outputs = createPrePcmOutputRecords(runtime, {
      producingHistoricalExecutionId: historicalExecutionId,
      extractedOutputs: extracted,
    });
    const outputIds = outputs.map((record) => record.prePcmOutputRecordId);

    const completed = patchEmimAuditMetadata(runtime, historicalExecutionId, {
      invocationStarted: true,
      executionCompletionStatus: "COMPLETED",
      outputs: outputIds,
      modelExecutionRecord: {
        providerObserved: generationResult.providerObserved ?? null,
        declaredModelBinding: emim.declaredModelBinding,
      },
    });

    putHad1Attempt(runtime, emim, committedItems, {
      receivedRenderedItems: received,
      match,
      attemptOutcome: ATTEMPT_OUTCOME.SUCCESSFUL_COMPLETE,
      generationComplete: true,
    });
    runtime.recordTrace("HAD-1", {
      historicalExecutionId,
      emimCommitmentDigest: emim.emimCommitmentDigest,
      match,
      attemptOutcome: ATTEMPT_OUTCOME.SUCCESSFUL_COMPLETE,
    });
    runtime.recordTrace("HAD-2", {
      kind: "model_invocation",
      historicalExecutionId,
      responsibleActorRef: emim.responsibleActorRef,
      actorAssignmentRef: emim.actorAssignmentRef,
      executionOrdinal: emim.executionOrdinal,
      allocatedBeforeCall: emim.executionOrdinal != null || emim.executionClass === EXECUTION_CLASS.SEMANTIC_ADJUDICATION || emim.executionClass === EXECUTION_CLASS.DERIVATION,
    });

    return { emim: completed, outputs };
  } catch (error) {
    putHad1Attempt(runtime, emim, committedItems, {
      receivedRenderedItems: received,
      match,
      attemptOutcome: ATTEMPT_OUTCOME.POST_EXPOSURE_FAILURE,
      generationComplete: true,
    });
    if (error instanceof HistoricalIngressError) throw error;
    failClosed("POST_EXPOSURE_INVOCATION_FAILURE", error?.message ?? "post-exposure failure");
  }
}

export function hlxConforming(runtime, historicalExecutionId) {
  try {
    const emim = assertEmimImmutable(runtime, historicalExecutionId);
    if (emim.region === REGION.R2) return false;
    if (!emim.committed) return false;
    if (runtime.isContaminated(historicalExecutionId)) return false;
    const outputs = emim.outputs ?? [];
    if (outputs.length === 0) return false;
    for (const outputId of outputs) {
      runtime.store.get("prePcmOutput", outputId);
    }
    return true;
  } catch {
    return false;
  }
}
