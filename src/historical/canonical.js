import {
  canonicalSerialize as projectCanonicalSerialize,
  sha256PrefixedDigest,
} from "../agent/canonicalDigest.js";
import { CANONICAL_SERIALIZATION_VERSION } from "./constants.js";
import { failClosed } from "./errors.js";

export function canonicalSerialize(value) {
  return projectCanonicalSerialize(value);
}

export function recanonicalize(value) {
  const first = canonicalSerialize(value);
  const parsed = JSON.parse(first);
  const second = canonicalSerialize(parsed);
  if (first !== second) {
    failClosed("CANONICAL_ROUNDTRIP_FAILURE", "recanonicalization is not byte-identical");
  }
  return first;
}

export function digestCanonical(value) {
  return sha256PrefixedDigest(canonicalSerialize(value));
}

export function sortUniqueStrings(values) {
  if (!Array.isArray(values)) failClosed("CANONICAL_LIST_INVALID", "expected array");
  const seen = new Set();
  const unique = [];
  for (const value of values) {
    if (typeof value !== "string") failClosed("CANONICAL_LIST_INVALID", "expected string entries");
    if (seen.has(value)) continue;
    seen.add(value);
    unique.push(value);
  }
  unique.sort();
  return unique;
}

export function assertNoDuplicateFieldKeys(object) {
  if (object === null || typeof object !== "object" || Array.isArray(object)) return;
  const keys = Object.keys(object);
  const seen = new Set();
  for (const key of keys) {
    if (seen.has(key)) failClosed("DUPLICATE_FIELD", key);
    seen.add(key);
  }
}

export function none() {
  return null;
}

export function isNone(value) {
  return value === null;
}

export function bindCanonicalVersion(surface) {
  if (surface === null || typeof surface !== "object" || Array.isArray(surface)) {
    failClosed("CANONICAL_SURFACE_INVALID", "surface must be a plain object");
  }
  if (surface.canonicalSerializationVersion !== CANONICAL_SERIALIZATION_VERSION) {
    failClosed(
      "CANONICAL_VERSION_MISMATCH",
      `expected ${CANONICAL_SERIALIZATION_VERSION}`,
    );
  }
  return surface;
}
