import { CANONICAL_SERIALIZATION_VERSION } from "./constants.js";
import { canonicalSerialize, digestCanonical } from "./canonical.js";
import { failClosed } from "./errors.js";

export function computeIdentity(domainTag, surface) {
  if (typeof domainTag !== "string" || domainTag.length === 0) {
    failClosed("IDENTITY_DOMAIN_TAG_INVALID");
  }
  if (surface === undefined) failClosed("IDENTITY_SURFACE_UNDEFINED");
  return digestCanonical({
    domainTag,
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    surface,
  });
}

export function computeTaggedDigest(domainTag, material) {
  return computeIdentity(domainTag, material);
}

export function assertIdentityRecomputes(domainTag, surface, expectedId) {
  const actual = computeIdentity(domainTag, surface);
  if (actual !== expectedId) {
    failClosed("IDENTITY_RECOMPUTE_MISMATCH", `${domainTag} expected ${expectedId} got ${actual}`);
  }
  return actual;
}

export function canonicalEnvelopeBytes(domainTag, surface) {
  return canonicalSerialize({
    domainTag,
    canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION,
    surface,
  });
}
