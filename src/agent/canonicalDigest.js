import { createHash } from "node:crypto";
import { DIGEST_PREFIX } from "./agentContractConstants.js";

export class CanonicalSerializeError extends Error {
  constructor(detail) {
    super(`CanonicalSerializeError | detail=${detail}`);
    this.name = "CanonicalSerializeError";
    this.detail = detail;
  }
}

function fail(detail) {
  throw new CanonicalSerializeError(detail);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function serialize(value, seen) {
  if (value === null) return "null";
  if (value === undefined) fail("undefined");

  const valueType = typeof value;
  if (valueType === "string") return JSON.stringify(value);
  if (valueType === "boolean") return value ? "true" : "false";
  if (valueType === "number") {
    if (!Number.isFinite(value)) fail("non-finite number");
    if (Object.is(value, -0)) fail("negative zero");
    return JSON.stringify(value);
  }
  if (valueType === "bigint") fail("bigint");
  if (valueType === "function") fail("function");
  if (valueType === "symbol") fail("symbol");
  if (valueType !== "object") fail(`unsupported type ${valueType}`);

  if (value instanceof Date) fail("Date");
  if (value instanceof Map || value instanceof Set || value instanceof WeakMap || value instanceof WeakSet) {
    fail("collection object");
  }
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) fail("binary object");
  if (value instanceof RegExp) fail("RegExp");

  if (seen.has(value)) fail("circular reference");

  if (Array.isArray(value)) {
    seen.add(value);
    const parts = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) fail("sparse array");
      parts.push(serialize(value[index], seen));
    }
    seen.delete(value);
    return `[${parts.join(",")}]`;
  }

  if (!isPlainObject(value)) fail("non-plain object");
  if (Object.getOwnPropertySymbols(value).length > 0) fail("symbol key");

  seen.add(value);
  const keys = Object.keys(value).sort();
  const parts = [];
  for (const key of keys) {
    const child = value[key];
    if (child === undefined) fail(`undefined at key ${JSON.stringify(key)}`);
    parts.push(`${JSON.stringify(key)}:${serialize(child, seen)}`);
  }
  seen.delete(value);
  return `{${parts.join(",")}}`;
}

export function canonicalSerialize(value) {
  return serialize(value, new WeakSet());
}

export function sha256Hex(canonicalBytes) {
  if (typeof canonicalBytes !== "string") fail("digest input must be a string");
  return createHash("sha256").update(canonicalBytes, "utf8").digest("hex");
}

export function sha256PrefixedDigest(canonicalBytes) {
  return `${DIGEST_PREFIX}${sha256Hex(canonicalBytes)}`;
}
