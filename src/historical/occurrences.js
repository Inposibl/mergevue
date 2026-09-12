import { DOMAIN_TAG, EVENT_KIND } from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";

export function allocateGovernedEvent(runtime, {
  occurrenceDomainIdentity,
  eventKind,
  eventKindBinding,
}) {
  if (!Object.values(EVENT_KIND).includes(eventKind)) failClosed("EVENT_KIND_INVALID", eventKind);
  if (!eventKindBinding || typeof eventKindBinding !== "object") {
    failClosed("EVENT_KIND_BINDING_INVALID");
  }
  const occurrenceSequence = runtime.allocators.nextOccurrenceSequence(occurrenceDomainIdentity);
  const identitySurface = {
    occurrenceDomainIdentity,
    occurrenceSequence,
    eventKind,
    eventKindBinding,
  };
  const governedEventOccurrenceId = computeIdentity(DOMAIN_TAG.EVENT_OCCURRENCE, identitySurface);
  const record = {
    ...identitySurface,
    governedEventOccurrenceId,
    allocated: true,
  };
  runtime.allocators.registerOccurrence(governedEventOccurrenceId, record);
  runtime.store.put("occurrence", governedEventOccurrenceId, record);
  runtime.recordTrace("HAD-2", {
    kind: "occurrence_allocation",
    governedEventOccurrenceId,
    eventKind,
    occurrenceDomainIdentity,
    occurrenceSequence,
  });
  return record;
}

export function getOccurrence(runtime, governedEventOccurrenceId) {
  return runtime.store.get("occurrence", governedEventOccurrenceId);
}

export function occursBefore(runtime, leftId, rightId) {
  const left = getOccurrence(runtime, leftId);
  const right = getOccurrence(runtime, rightId);
  if (left.occurrenceDomainIdentity !== right.occurrenceDomainIdentity) {
    failClosed("CROSS_DOMAIN_ORDERING_FORBIDDEN");
  }
  return left.occurrenceSequence < right.occurrenceSequence;
}

export function assertOccursBefore(runtime, leftId, rightId) {
  if (!occursBefore(runtime, leftId, rightId)) {
    failClosed("AUTHORIZATION_ORDER_VIOLATION", `${leftId} !< ${rightId}`);
  }
}
