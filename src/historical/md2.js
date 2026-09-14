import { sha256PrefixedDigest } from "../agent/canonicalDigest.js";
import { canonicalSerialize as projectCanonicalSerialize } from "./canonical.js";

const OPERATOR_VERSION = "v0.1.CORR6";

const IDENTITY_DOMAIN = Object.freeze({
  PREVALIDATION: "MD2-PREVAL-CORR6",
  RELATION_LIBRARY: "MD2-RL-CORR6",
  FORMATION_CARRIER: "MD2-FC-CORR6",
  UNIT: "MD2-UNIT-CORR6",
  STRUCTURAL_GROUP: "MD2-STRUCTURAL-GROUP-CORR6",
  DEPENDENCE: "MD2-DEP-CORR6",
  PACKAGE: "MD2-PKG-CORR6",
  SIGMA: "MD2-SIGMA-CORR6",
  REJECTION: "MD2-REJECTION-CORR6",
  OUTPUT: "MD2-OUT-CORR6",
});

const TOP_LEVEL_FIELDS = Object.freeze([
  "operatorVersionRequested",
  "g0Id",
  "sideId",
  "factualSealId",
  "domainId",
  "intervalId",
  "formationCarrier",
  "observationUnits",
  "declaredDependence",
]);

const REQUIRED_TOP_LEVEL_FIELDS = Object.freeze([
  "g0Id",
  "sideId",
  "factualSealId",
  "domainId",
  "intervalId",
  "formationCarrier",
  "observationUnits",
  "declaredDependence",
]);

const FORMATION_CARRIER_FIELDS = Object.freeze([
  "formerId",
  "formerVersion",
  "authorityStatus",
  "forbidsLlmEstablished",
]);

const OBSERVATION_UNIT_FIELDS = Object.freeze([
  "originGroupId",
  "mechanismFamilyId",
  "clusterState",
  "O_flag",
  "P_flag",
  "conflictFlag",
  "atomIds",
  "annotationIds",
]);

const REQUIRED_UNIT_FIELDS_EXCEPT_ACTIVATION = Object.freeze([
  "originGroupId",
  "clusterState",
  "O_flag",
  "P_flag",
  "conflictFlag",
  "atomIds",
  "annotationIds",
]);

const DECLARED_DEPENDENCE_FIELDS = Object.freeze(["groups"]);
const DECLARED_GROUP_FIELDS = Object.freeze([
  "dependenceClusterId",
  "memberUnitIds",
  "originGroupIds",
]);
const REQUIRED_DECLARED_GROUP_FIELDS = Object.freeze([
  "dependenceClusterId",
  "memberUnitIds",
]);

const CLUSTER_STATES = Object.freeze([
  "ESTABLISHED",
  "ABSENT_OBSERVED",
  "UNKNOWN",
  "INAPPLICABLE",
  "CONFLICTED",
]);

const E9 = Object.freeze([
  "NF/NT",
  "NT/STJ",
  "NT/STP",
  "NF/SFJ",
  "NF/SFP",
  "STJ/STP",
  "SFJ/SFP",
  "STP/STJ",
  "SFP/SFJ",
]);

const SHARED_RULE_SEMANTICS = Object.freeze({
  relation: "SUPPORT",
  contraction_authorized: false,
  missingness_behavior: "missing trigger evidence → UNKNOWN; no SUPPORT; no exclusion; established false trigger → INAPPLICABLE",
  contradiction_behavior: "retain positive and adverse; unresolved material same-domain/time contradiction → CONFLICTED; blocks SUPPORT; do not average; unaffected scopes remain separate",
  inapplicable_behavior: "INAPPLICABLE; not exclusion",
  unknown_behavior: "UNKNOWN; not negative",
  conflicted_behavior: "CONFLICT; blocks SUPPORT",
  "O/P activation": "SUPPORT requires O_flag=true and not P-only as the sole evidence; P-only ESTABLISHED → UNKNOWN",
  ATOM_PRESENT: "ESTABLISHED ∧ O → nonempty atomIds else reject unit",
});

const PINNED_RL_CORR6_SEMANTIC_SOURCE = [
  {
    ruleId: "A4-S01",
    ruleVersion: "A4-S01-CORR6",
    mechanismFamilyId: "TECHNOLOGY_RESOURCE_COMPETITION",
    environment: "NT/STJ",
    ...SHARED_RULE_SEMANTICS,
    conjuncts: [
      "FAMILY_MATCH",
      "FULL_CONJUNCTION_ADMITTED (clusterState=ESTABLISHED)",
      "ENACTED_TECH_COMPETITION — enacted competition among identified alternatives for acquisition, development, or deployment of technological resources in the same decision domain and interval (packed into ESTABLISHED by formation; text identity-bound)",
      "O_NOT_P_ONLY",
      "ATOM_PRESENT",
    ],
  },
  {
    ruleId: "A4-S02",
    ruleVersion: "A4-S02-CORR6",
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    environment: "SFJ/SFP",
    ...SHARED_RULE_SEMANTICS,
    conjuncts: [
      "FAMILY_MATCH",
      "FULL_CONJUNCTION_ADMITTED (clusterState=ESTABLISHED)",
      "ENACTED_TIE_PRESERVATION (enacted preservation of already-held resource access or position for established members through social ties, same domain and interval)",
      "O_NOT_P_ONLY",
      "ATOM_PRESENT",
    ],
  },
];

const PINNED_RL_CORR6_TRACEABILITY_SOURCE = {
  sourceStatus: "CANDIDATE_WHEN_AUTHORED_SUBSEQUENTLY_OWNER_ACCEPTED_WITH_ASTRA_A4_IV1",
  authorityBoundary: "SEMANTICALLY_LAWFUL_CONDITIONAL_SUPPORT_ONLY_METHODOLOGICAL_EVIDENCE",
  excludedClaims: [
    "LIKELIHOOD",
    "LR",
    "PROBABILITY_OR_POSTERIOR",
    "EXCLUSION",
    "CONTRACTION",
    "ENVIRONMENT_DETERMINATION",
    "CALIBRATION",
    "PRODUCTION_AUTHORITY",
  ],
  provenanceBoundary: "A2 locators and Workbench paths are provenance only, not votes",
};

const FORBIDDEN_FIELD_CODES = Object.freeze({
  relationLibrary: "REJ_CALLER_RL_SUBSTITUTION",
  relationLibraryId: "REJ_CALLER_RL_SUBSTITUTION",
  relationLibraryRules: "REJ_CALLER_RL_SUBSTITUTION",
  ruleList: "REJ_CALLER_RL_SUBSTITUTION",
  rules: "REJ_CALLER_RL_SUBSTITUTION",
  authorityClass: "REJ_CALLER_RL_SUBSTITUTION",
  EXCLUDES: "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE",
  excludes: "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE",
  certificate: "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE",
  certificates: "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE",
  exclusionCertificate: "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE",
  Prior: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  prior: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  DPT: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  dpt: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  LR: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  lr: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  lrRows: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  likelihoodRatio: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  likelihoodRatios: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  probability: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  posterior: "REJ_FORBIDDEN_PROBABILISTIC_INPUT",
  calibrationMode: "REJ_FORBIDDEN_CALIBRATION_INPUT",
  calibrationActivation: "REJ_FORBIDDEN_CALIBRATION_INPUT",
  calibrationAuthorityId: "REJ_FORBIDDEN_CALIBRATION_INPUT",
});

const CODE_PRIORITY = Object.freeze({
  1: Object.freeze({
    REJ_UNKNOWN_FIELD: 1,
    REJ_CALLER_RL_SUBSTITUTION: 2,
    REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE: 3,
    REJ_FORBIDDEN_PROBABILISTIC_INPUT: 4,
    REJ_FORBIDDEN_CALIBRATION_INPUT: 5,
    REJ_RAW_MODEL_NARRATIVE: 6,
    REJ_REQUIRED_FIELD_MISSING: 7,
    REJ_ENUM_INVALID: 8,
    REJ_COLLECTION_TYPE_INVALID: 9,
    REJ_COMPETING_ACTIVATION_KEYS: 10,
    REJ_MISSING_ACTIVATION_KEY: 11,
    REJ_SCHEMA_INVALID: 12,
  }),
  2: Object.freeze({ REJ_DEPENDENCE_INVALID: 1 }),
  3: Object.freeze({
    REJ_OPERATOR_VERSION: 1,
    REJ_NON_PRE_T0: 2,
    REJ_SCHEMA_INVALID: 3,
  }),
  4: Object.freeze({
    REJ_UNIT_STATE_INCONSISTENT: 1,
    REJ_ESTABLISHED_WITHOUT_ATOM: 2,
  }),
  5: Object.freeze({ REJ_DEPENDENCE_INVALID: 1 }),
});

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function hasOwn(record, field) {
  return Object.hasOwn(record, field);
}

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

function canonicalSerializeIterative(root) {
  const chunks = [];
  const active = new WeakSet();
  const stack = [{ kind: "value", value: root }];

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame.kind === "text") {
      chunks.push(frame.text);
      continue;
    }
    if (frame.kind === "leave") {
      active.delete(frame.value);
      continue;
    }

    const value = frame.value;
    if (value === null) {
      chunks.push("null");
      continue;
    }
    if (typeof value === "string") {
      chunks.push(JSON.stringify(value));
      continue;
    }
    if (typeof value === "boolean") {
      chunks.push(value ? "true" : "false");
      continue;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value) || Object.is(value, -0)) {
        throw new TypeError("unsupported canonical number");
      }
      chunks.push(JSON.stringify(value));
      continue;
    }
    if (typeof value !== "object" || !isPlainObject(value) && !Array.isArray(value)) {
      throw new TypeError("unsupported canonical value");
    }
    if (active.has(value)) throw new TypeError("circular canonical value");

    active.add(value);
    stack.push({ kind: "leave", value });
    if (Array.isArray(value)) {
      chunks.push("[");
      stack.push({ kind: "text", text: "]" });
      for (let index = value.length - 1; index >= 0; index -= 1) {
        if (!hasOwn(value, index)) throw new TypeError("sparse canonical array");
        stack.push({ kind: "value", value: value[index] });
        if (index > 0) stack.push({ kind: "text", text: "," });
      }
      continue;
    }

    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError("symbol canonical key");
    }
    chunks.push("{");
    stack.push({ kind: "text", text: "}" });
    const keys = Object.keys(value).sort();
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      stack.push({ kind: "value", value: value[key] });
      stack.push({ kind: "text", text: `${JSON.stringify(key)}:` });
      if (index > 0) stack.push({ kind: "text", text: "," });
    }
  }

  return chunks.join("");
}

function canonicalSerialize(value) {
  try {
    return projectCanonicalSerialize(value);
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return canonicalSerializeIterative(value);
  }
}

function compareCanonical(left, right) {
  const leftBytes = canonicalSerialize(left);
  const rightBytes = canonicalSerialize(right);
  if (leftBytes < rightBytes) return -1;
  if (leftBytes > rightBytes) return 1;
  return 0;
}

function canonicalValueSet(values) {
  const byCanonical = new Map();
  for (const value of values) byCanonical.set(canonicalSerialize(value), value);
  return [...byCanonical.values()].sort(compareCanonical);
}

function canonicalStringSet(values) {
  return canonicalValueSet(values);
}

function unsupportedValue(kind, detail = "") {
  return { __md2UnsupportedAbstractValue: { kind, detail } };
}

function normalizePreValidation(value, seen) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (Number.isFinite(value) && !Object.is(value, -0)) return value;
    return unsupportedValue("number", String(value));
  }
  if (value === undefined) return unsupportedValue("undefined");
  if (typeof value === "bigint") return unsupportedValue("bigint", String(value));
  if (typeof value === "symbol") return unsupportedValue("symbol", String(value.description ?? ""));
  if (typeof value === "function") return unsupportedValue("function", value.name ?? "");
  if (typeof value !== "object") return unsupportedValue(typeof value);
  if (seen.has(value)) return unsupportedValue("circular");

  seen.add(value);
  if (Array.isArray(value)) {
    const normalized = [];
    for (let index = 0; index < value.length; index += 1) {
      normalized.push(hasOwn(value, index)
        ? normalizePreValidation(value[index], seen)
        : unsupportedValue("sparse-array-member", String(index)));
    }
    seen.delete(value);
    return normalized.sort(compareCanonical);
  }

  if (!isPlainObject(value)) {
    const kind = value?.constructor?.name ?? "non-plain-object";
    seen.delete(value);
    return unsupportedValue(kind);
  }

  const normalized = Object.create(null);
  for (const key of Object.keys(value).sort()) {
    normalized[key] = normalizePreValidation(value[key], seen);
  }
  if (Object.getOwnPropertySymbols(value).length > 0) {
    normalized.__md2UnsupportedSymbolKeys = Object.getOwnPropertySymbols(value)
      .map((key) => String(key.description ?? ""))
      .sort();
  }
  seen.delete(value);
  return normalized;
}

function normalizePreValidationIterative(root) {
  const holder = Object.create(null);
  const active = new WeakSet();
  const stack = [{ kind: "value", value: root, parent: holder, key: "result" }];

  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame.kind === "leave") {
      active.delete(frame.value);
      if (Array.isArray(frame.output)) frame.output.sort(compareCanonical);
      continue;
    }

    const value = frame.value;
    if (value === null || typeof value === "string" || typeof value === "boolean") {
      frame.parent[frame.key] = value;
      continue;
    }
    if (typeof value === "number") {
      frame.parent[frame.key] = Number.isFinite(value) && !Object.is(value, -0)
        ? value
        : unsupportedValue("number", String(value));
      continue;
    }
    if (value === undefined) {
      frame.parent[frame.key] = unsupportedValue("undefined");
      continue;
    }
    if (typeof value === "bigint") {
      frame.parent[frame.key] = unsupportedValue("bigint", String(value));
      continue;
    }
    if (typeof value === "symbol") {
      frame.parent[frame.key] = unsupportedValue("symbol", String(value.description ?? ""));
      continue;
    }
    if (typeof value === "function") {
      frame.parent[frame.key] = unsupportedValue("function", value.name ?? "");
      continue;
    }
    if (typeof value !== "object") {
      frame.parent[frame.key] = unsupportedValue(typeof value);
      continue;
    }
    if (active.has(value)) {
      frame.parent[frame.key] = unsupportedValue("circular");
      continue;
    }
    if (!Array.isArray(value) && !isPlainObject(value)) {
      frame.parent[frame.key] = unsupportedValue(value?.constructor?.name ?? "non-plain-object");
      continue;
    }

    const output = Array.isArray(value) ? new Array(value.length) : Object.create(null);
    frame.parent[frame.key] = output;
    active.add(value);
    stack.push({ kind: "leave", value, output });

    if (Array.isArray(value)) {
      for (let index = value.length - 1; index >= 0; index -= 1) {
        stack.push({
          kind: "value",
          value: hasOwn(value, index) ? value[index] : unsupportedValue("sparse-array-member", String(index)),
          parent: output,
          key: index,
        });
      }
      continue;
    }

    const symbolKeys = Object.getOwnPropertySymbols(value);
    if (symbolKeys.length > 0) {
      output.__md2UnsupportedSymbolKeys = symbolKeys
        .map((key) => String(key.description ?? ""))
        .sort();
    }
    const keys = Object.keys(value).sort();
    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];
      stack.push({ kind: "value", value: value[key], parent: output, key });
    }
  }

  return holder.result;
}

function canonicalPreValidation(candidate) {
  try {
    return normalizePreValidation(candidate, new WeakSet());
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return normalizePreValidationIterative(candidate);
  }
}

function digestParts(...parts) {
  return sha256PrefixedDigest(parts.join(""));
}

function digestCanonical(domain, value) {
  return digestParts(domain, canonicalSerialize(value));
}

function normalizeUnitPayload(unit) {
  return {
    originGroupId: unit.originGroupId,
    mechanismFamilyId: unit.mechanismFamilyId,
    clusterState: unit.clusterState,
    O_flag: unit.O_flag,
    P_flag: unit.P_flag,
    conflictFlag: unit.conflictFlag,
    atomIds: canonicalStringSet(unit.atomIds),
    annotationIds: canonicalStringSet(unit.annotationIds),
  };
}

function unitIdFor(unit) {
  return digestCanonical(IDENTITY_DOMAIN.UNIT, normalizeUnitPayload(unit));
}

function structuralEvidenceGroupIdFor(memberUnitIds) {
  return digestCanonical(IDENTITY_DOMAIN.STRUCTURAL_GROUP, canonicalStringSet(memberUnitIds));
}

function deriveRelationLibraryArtifacts({ semantic, traceability }) {
  const normalizedSemantic = canonicalValueSet(canonicalPreValidation(semantic));
  const normalizedTraceability = canonicalPreValidation(traceability);
  return deepFreeze({
    semantic: normalizedSemantic,
    traceability: normalizedTraceability,
    relationLibraryId: digestCanonical(IDENTITY_DOMAIN.RELATION_LIBRARY, normalizedSemantic),
  });
}

const DEFAULT_RELATION_LIBRARY = deriveRelationLibraryArtifacts({
  semantic: PINNED_RL_CORR6_SEMANTIC_SOURCE,
  traceability: PINNED_RL_CORR6_TRACEABILITY_SOURCE,
});

const PINNED_RULES = DEFAULT_RELATION_LIBRARY.semantic;
const PINNED_FAMILIES = Object.freeze(PINNED_RULES.map((rule) => rule.mechanismFamilyId));

function finding(stage, code, path) {
  return { stage, code, path };
}

function addFinding(findings, stage, code, path) {
  findings.push(finding(stage, code, path));
}

function joinPath(prefix, field) {
  return prefix ? `${prefix}.${field}` : field;
}

function scanFields(record, allowedFields, prefix, findings, specialFields = new Set()) {
  const allowed = new Set(allowedFields);
  for (const field of Object.keys(record)) {
    if (allowed.has(field) || specialFields.has(field)) continue;
    const forbiddenCode = Object.hasOwn(FORBIDDEN_FIELD_CODES, field)
      ? FORBIDDEN_FIELD_CODES[field]
      : undefined;
    const code = prefix === ""
      ? forbiddenCode ?? "REJ_UNKNOWN_FIELD"
      : "REJ_UNKNOWN_FIELD";
    addFinding(findings, 1, code, joinPath(prefix, field));
  }
}

function requireFields(record, requiredFields, prefix, findings) {
  for (const field of requiredFields) {
    if (!hasOwn(record, field)) {
      addFinding(findings, 1, "REJ_REQUIRED_FIELD_MISSING", joinPath(prefix, field));
    }
  }
}

function validateIdentifier(record, field, prefix, findings) {
  if (!hasOwn(record, field)) return;
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    addFinding(findings, 1, "REJ_SCHEMA_INVALID", joinPath(prefix, field));
  }
}

function validateBoolean(record, field, prefix, findings) {
  if (hasOwn(record, field) && typeof record[field] !== "boolean") {
    addFinding(findings, 1, "REJ_ENUM_INVALID", joinPath(prefix, field));
  }
}

function validateStringCollection(record, field, prefix, findings, optional = false) {
  if (!hasOwn(record, field)) return;
  if (!Array.isArray(record[field])) {
    addFinding(findings, 1, "REJ_COLLECTION_TYPE_INVALID", joinPath(prefix, field));
    return;
  }
  for (let index = 0; index < record[field].length; index += 1) {
    const value = record[field][index];
    if (typeof value !== "string" || value.length === 0) {
      addFinding(findings, 1, "REJ_SCHEMA_INVALID", `${joinPath(prefix, field)}[${index}]`);
    }
  }
  if (optional) return;
}

function stageOneFindings(candidate) {
  const findings = [];
  if (!isPlainObject(candidate)) {
    addFinding(findings, 1, "REJ_SCHEMA_INVALID", "");
    return findings;
  }

  scanFields(candidate, TOP_LEVEL_FIELDS, "", findings);
  requireFields(candidate, REQUIRED_TOP_LEVEL_FIELDS, "", findings);

  if (hasOwn(candidate, "operatorVersionRequested") && typeof candidate.operatorVersionRequested !== "string") {
    addFinding(findings, 1, "REJ_SCHEMA_INVALID", "operatorVersionRequested");
  }
  for (const field of ["g0Id", "factualSealId", "domainId", "intervalId"]) {
    validateIdentifier(candidate, field, "", findings);
  }
  if (hasOwn(candidate, "sideId")) {
    if (typeof candidate.sideId !== "string" || !["ACQUIRER", "TARGET"].includes(candidate.sideId)) {
      addFinding(findings, 1, "REJ_ENUM_INVALID", "sideId");
    }
  }

  if (hasOwn(candidate, "formationCarrier")) {
    const carrier = candidate.formationCarrier;
    if (!isPlainObject(carrier)) {
      addFinding(findings, 1, "REJ_SCHEMA_INVALID", "formationCarrier");
    } else {
      scanFields(carrier, FORMATION_CARRIER_FIELDS, "formationCarrier", findings);
      requireFields(carrier, FORMATION_CARRIER_FIELDS, "formationCarrier", findings);
      validateIdentifier(carrier, "formerId", "formationCarrier", findings);
      validateIdentifier(carrier, "formerVersion", "formationCarrier", findings);
      if (hasOwn(carrier, "authorityStatus") && typeof carrier.authorityStatus !== "string") {
        addFinding(findings, 1, "REJ_SCHEMA_INVALID", "formationCarrier.authorityStatus");
      }
      validateBoolean(carrier, "forbidsLlmEstablished", "formationCarrier", findings);
    }
  }

  if (hasOwn(candidate, "observationUnits")) {
    if (!Array.isArray(candidate.observationUnits)) {
      addFinding(findings, 1, "REJ_COLLECTION_TYPE_INVALID", "observationUnits");
    } else {
      for (let index = 0; index < candidate.observationUnits.length; index += 1) {
        const unit = candidate.observationUnits[index];
        const prefix = `observationUnits[${index}]`;
        if (typeof unit === "string") {
          addFinding(findings, 1, "REJ_RAW_MODEL_NARRATIVE", prefix);
          continue;
        }
        if (!isPlainObject(unit)) {
          addFinding(findings, 1, "REJ_SCHEMA_INVALID", prefix);
          continue;
        }

        const specials = new Set(["ruleId", "unitKind"]);
        scanFields(unit, OBSERVATION_UNIT_FIELDS, prefix, findings, specials);
        if (hasOwn(unit, "unitKind")) {
          if (unit.unitKind === "MODEL_NARRATIVE") {
            addFinding(findings, 1, "REJ_RAW_MODEL_NARRATIVE", prefix);
          } else {
            addFinding(findings, 1, "REJ_UNKNOWN_FIELD", `${prefix}.unitKind`);
          }
        }
        requireFields(unit, REQUIRED_UNIT_FIELDS_EXCEPT_ACTIVATION, prefix, findings);
        if (hasOwn(unit, "ruleId")) {
          addFinding(findings, 1, "REJ_COMPETING_ACTIVATION_KEYS", prefix);
        }
        if (!hasOwn(unit, "mechanismFamilyId")) {
          addFinding(findings, 1, "REJ_MISSING_ACTIVATION_KEY", prefix);
        }
        validateIdentifier(unit, "originGroupId", prefix, findings);
        validateIdentifier(unit, "mechanismFamilyId", prefix, findings);
        if (hasOwn(unit, "clusterState")) {
          if (typeof unit.clusterState !== "string" || !CLUSTER_STATES.includes(unit.clusterState)) {
            addFinding(findings, 1, "REJ_ENUM_INVALID", `${prefix}.clusterState`);
          }
        }
        for (const field of ["O_flag", "P_flag", "conflictFlag"]) {
          validateBoolean(unit, field, prefix, findings);
        }
        validateStringCollection(unit, "atomIds", prefix, findings);
        validateStringCollection(unit, "annotationIds", prefix, findings);
      }
    }
  }

  if (hasOwn(candidate, "declaredDependence")) {
    const dependence = candidate.declaredDependence;
    if (!isPlainObject(dependence)) {
      addFinding(findings, 1, "REJ_SCHEMA_INVALID", "declaredDependence");
    } else {
      scanFields(dependence, DECLARED_DEPENDENCE_FIELDS, "declaredDependence", findings);
      requireFields(dependence, DECLARED_DEPENDENCE_FIELDS, "declaredDependence", findings);
      if (hasOwn(dependence, "groups")) {
        if (!Array.isArray(dependence.groups)) {
          addFinding(findings, 1, "REJ_COLLECTION_TYPE_INVALID", "declaredDependence.groups");
        } else {
          for (let index = 0; index < dependence.groups.length; index += 1) {
            const group = dependence.groups[index];
            const prefix = `declaredDependence.groups[${index}]`;
            if (!isPlainObject(group)) {
              addFinding(findings, 1, "REJ_SCHEMA_INVALID", prefix);
              continue;
            }
            scanFields(group, DECLARED_GROUP_FIELDS, prefix, findings);
            requireFields(group, REQUIRED_DECLARED_GROUP_FIELDS, prefix, findings);
            validateIdentifier(group, "dependenceClusterId", prefix, findings);
            validateStringCollection(group, "memberUnitIds", prefix, findings);
            validateStringCollection(group, "originGroupIds", prefix, findings, true);
          }
        }
      }
    }
  }

  return findings;
}

function prepareUnits(candidate) {
  const unitsById = new Map();
  for (let index = 0; index < candidate.observationUnits.length; index += 1) {
    const payload = normalizeUnitPayload(candidate.observationUnits[index]);
    const unitId = digestCanonical(IDENTITY_DOMAIN.UNIT, payload);
    if (!unitsById.has(unitId)) {
      unitsById.set(unitId, { record: { unitId, ...payload }, path: `observationUnits[${index}]` });
    }
  }
  return [...unitsById.values()].sort((left, right) => compareCanonical(left.record, right.record));
}

function stageTwoFindings(candidate, preparedUnits) {
  const findings = [];
  const retainedIds = new Set(preparedUnits.map(({ record }) => record.unitId));
  for (let groupIndex = 0; groupIndex < candidate.declaredDependence.groups.length; groupIndex += 1) {
    const group = candidate.declaredDependence.groups[groupIndex];
    for (let memberIndex = 0; memberIndex < group.memberUnitIds.length; memberIndex += 1) {
      const member = group.memberUnitIds[memberIndex];
      if (!retainedIds.has(member)) {
        addFinding(
          findings,
          2,
          "REJ_DEPENDENCE_INVALID",
          `declaredDependence.groups[${groupIndex}].memberUnitIds[${memberIndex}]`,
        );
      }
    }
  }
  return findings;
}

function stageThreeFindings(candidate) {
  const findings = [];
  if (hasOwn(candidate, "operatorVersionRequested") && candidate.operatorVersionRequested !== OPERATOR_VERSION) {
    addFinding(findings, 3, "REJ_OPERATOR_VERSION", "operatorVersionRequested");
  }
  if (candidate.intervalId !== "PRE-T0") {
    addFinding(findings, 3, "REJ_NON_PRE_T0", "intervalId");
  }
  if (candidate.formationCarrier.authorityStatus !== "PRODUCTION_ABSENT") {
    addFinding(findings, 3, "REJ_SCHEMA_INVALID", "formationCarrier.authorityStatus");
  }
  if (candidate.formationCarrier.forbidsLlmEstablished !== true) {
    addFinding(findings, 3, "REJ_SCHEMA_INVALID", "formationCarrier.forbidsLlmEstablished");
  }
  return findings;
}

function classifyUnit(unit) {
  if (unit.conflictFlag) {
    return unit.clusterState === "CONFLICTED"
      ? { valid: true, contribution: "CONFLICT" }
      : { valid: false, code: "REJ_UNIT_STATE_INCONSISTENT" };
  }
  if (unit.clusterState === "CONFLICTED") {
    return { valid: false, code: "REJ_UNIT_STATE_INCONSISTENT" };
  }
  if (unit.clusterState === "UNKNOWN") return { valid: true, contribution: "UNKNOWN" };
  if (unit.clusterState === "INAPPLICABLE") return { valid: true, contribution: "INAPPLICABLE" };
  if (unit.clusterState === "ESTABLISHED") {
    if (unit.O_flag && unit.atomIds.length === 0) {
      return { valid: false, code: "REJ_ESTABLISHED_WITHOUT_ATOM" };
    }
    if (unit.O_flag && unit.atomIds.length > 0 && PINNED_FAMILIES.includes(unit.mechanismFamilyId)) {
      return { valid: true, contribution: "SUPPORT" };
    }
    return { valid: true, contribution: "UNKNOWN" };
  }
  if (unit.clusterState === "ABSENT_OBSERVED") {
    return unit.O_flag
      ? { valid: true, contribution: "INAPPLICABLE" }
      : { valid: false, code: "REJ_UNIT_STATE_INCONSISTENT" };
  }
  return { valid: false, code: "REJ_UNIT_STATE_INCONSISTENT" };
}

function stageFourFindings(preparedUnits) {
  const findings = [];
  for (const { record, path } of preparedUnits) {
    const classification = classifyUnit(record);
    if (!classification.valid) addFinding(findings, 4, classification.code, path);
  }
  return findings;
}

function stageFiveFindings(candidate, preparedUnits) {
  const findings = [];
  const byOrigin = new Map();
  for (const { record } of preparedUnits) {
    const ids = byOrigin.get(record.originGroupId) ?? [];
    ids.push(record.unitId);
    byOrigin.set(record.originGroupId, ids);
  }
  for (const [originGroupId, ids] of byOrigin) {
    if (ids.length > 1) {
      addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `observationUnits.originGroupId[${canonicalSerialize(originGroupId)}]`);
    }
  }

  const clusterIdToGroup = new Map();
  const membershipToGroup = new Map();
  const memberToGroup = new Map();
  for (let groupIndex = 0; groupIndex < candidate.declaredDependence.groups.length; groupIndex += 1) {
    const group = candidate.declaredDependence.groups[groupIndex];
    const prefix = `declaredDependence.groups[${groupIndex}]`;
    const seenMembers = new Set();
    for (let memberIndex = 0; memberIndex < group.memberUnitIds.length; memberIndex += 1) {
      const member = group.memberUnitIds[memberIndex];
      if (seenMembers.has(member)) {
        addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `${prefix}.memberUnitIds[${memberIndex}]#duplicate`);
      }
      seenMembers.add(member);
    }
    const members = canonicalStringSet(group.memberUnitIds);
    if (members.length < 2) {
      addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `${prefix}.memberUnitIds#declared-group-size`);
    }
    if (clusterIdToGroup.has(group.dependenceClusterId)) {
      addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `${prefix}.dependenceClusterId#duplicate`);
    } else {
      clusterIdToGroup.set(group.dependenceClusterId, groupIndex);
    }
    const membershipKey = canonicalSerialize(members);
    if (membershipToGroup.has(membershipKey)) {
      addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `${prefix}.memberUnitIds#equivalent-group`);
    } else {
      membershipToGroup.set(membershipKey, groupIndex);
    }
    for (const member of members) {
      if (memberToGroup.has(member)) {
        addFinding(findings, 5, "REJ_DEPENDENCE_INVALID", `${prefix}.memberUnitIds[${canonicalSerialize(member)}]#overlap`);
      } else {
        memberToGroup.set(member, groupIndex);
      }
    }
  }
  return findings;
}

function sortFindings(findings) {
  const unique = new Map();
  for (const item of findings) unique.set(canonicalSerialize(item), item);
  return [...unique.values()].sort((left, right) => {
    const priorityDelta = CODE_PRIORITY[left.stage][left.code] - CODE_PRIORITY[right.stage][right.code];
    if (priorityDelta !== 0) return priorityDelta;
    return compareCanonical(left.path, right.path);
  });
}

function makeRejection(candidate, findings) {
  const ordered = sortFindings(findings);
  const primaryFinding = ordered[0];
  const secondaryFindings = ordered.slice(1);
  const canonicalPreValidationInputDigest = digestCanonical(IDENTITY_DOMAIN.PREVALIDATION, candidate);
  const rejectionId = digestParts(
    IDENTITY_DOMAIN.REJECTION,
    OPERATOR_VERSION,
    canonicalPreValidationInputDigest,
    canonicalSerialize(primaryFinding),
    canonicalSerialize(secondaryFindings),
  );
  return deepFreeze({
    tag: "REJECTED_INPUT",
    rejection: {
      operatorVersion: OPERATOR_VERSION,
      validationStage: primaryFinding.stage,
      primaryFinding,
      secondaryFindings,
      canonicalPreValidationInputDigest,
      rejectionId,
    },
  });
}

function buildStructuralEvidenceGroups(candidate, retainedUnits) {
  const groups = [];
  const assigned = new Set();
  for (const declared of candidate.declaredDependence.groups) {
    const memberUnitIds = canonicalStringSet(declared.memberUnitIds);
    for (const member of memberUnitIds) assigned.add(member);
    groups.push({
      structuralEvidenceGroupId: structuralEvidenceGroupIdFor(memberUnitIds),
      memberUnitIds,
    });
  }
  for (const unit of retainedUnits) {
    if (assigned.has(unit.unitId)) continue;
    const memberUnitIds = [unit.unitId];
    groups.push({
      structuralEvidenceGroupId: structuralEvidenceGroupIdFor(memberUnitIds),
      memberUnitIds,
    });
  }
  return canonicalValueSet(groups);
}

function aggregateContributions(contributions) {
  if (contributions.includes("CONFLICT")) return "CONFLICT";
  if (contributions.includes("SUPPORT")) return "SUPPORT";
  if (contributions.length > 0 && contributions.every((value) => value === "INAPPLICABLE")) {
    return "INAPPLICABLE";
  }
  return "UNKNOWN";
}

function buildSigma(retainedUnits, structuralEvidenceGroups, contributionsByUnitId) {
  const entries = PINNED_RULES.map((rule) => {
    const candidateUnits = retainedUnits.filter((unit) => unit.mechanismFamilyId === rule.mechanismFamilyId);
    const unitIdsEvaluated = canonicalStringSet(candidateUnits.map((unit) => unit.unitId));
    const evaluatedSet = new Set(unitIdsEvaluated);
    const structuralEvidenceGroupIds = canonicalStringSet(
      structuralEvidenceGroups
        .filter((group) => group.memberUnitIds.some((member) => evaluatedSet.has(member)))
        .map((group) => group.structuralEvidenceGroupId),
    );
    const annotationIds = canonicalStringSet(candidateUnits.flatMap((unit) => unit.annotationIds));
    const structuralResult = aggregateContributions(
      candidateUnits.map((unit) => contributionsByUnitId.get(unit.unitId)),
    );
    return {
      evaluationKey: rule.ruleId,
      mechanismFamilyId: rule.mechanismFamilyId,
      environment: rule.environment,
      structuralResult,
      unitIdsEvaluated,
      structuralEvidenceGroupIds,
      annotationIds,
      conflictState: structuralResult === "CONFLICT",
    };
  });
  return canonicalValueSet(entries);
}

function buildValidResult(candidate, preparedUnits) {
  const retainedUnits = canonicalValueSet(preparedUnits.map(({ record }) => record));
  const contributionsByUnitId = new Map(
    retainedUnits.map((unit) => [unit.unitId, classifyUnit(unit).contribution]),
  );
  const formationCarrierId = digestCanonical(IDENTITY_DOMAIN.FORMATION_CARRIER, candidate.formationCarrier);
  const structuralEvidenceGroups = buildStructuralEvidenceGroups(candidate, retainedUnits);
  const dependenceStructureId = digestCanonical(IDENTITY_DOMAIN.DEPENDENCE, structuralEvidenceGroups);
  const packagePayload = {
    g0Id: candidate.g0Id,
    sideId: candidate.sideId,
    factualSealId: candidate.factualSealId,
    domainId: candidate.domainId,
    intervalId: candidate.intervalId,
    formationCarrierId,
    dependenceStructureId,
    retainedUnits,
  };
  const packageId = digestCanonical(IDENTITY_DOMAIN.PACKAGE, packagePayload);
  const sigma = buildSigma(retainedUnits, structuralEvidenceGroups, contributionsByUnitId);
  const structuralEvidenceDigest = digestCanonical(IDENTITY_DOMAIN.SIGMA, sigma);
  const pinnedUnitIds = new Set(sigma.flatMap((entry) => entry.unitIdsEvaluated));
  const nonPinnedUnitIds = canonicalStringSet(
    retainedUnits.filter((unit) => !pinnedUnitIds.has(unit.unitId)).map((unit) => unit.unitId),
  );
  const C_H = canonicalStringSet(E9);
  const environmentBinding = "NONE";
  const strongestAlternativeStatus = "UNRESOLVED";
  const strongestAlternativeSet = [];
  const calibrationMode = "DORMANT";
  const calibrationAuthorityId = "DORMANT";
  const authorityExecutionClass = "METHODOLOGY_CANDIDATE_EXECUTION";
  const determinationChecklist = {
    c1: "NOT_ESTABLISHABLE",
    c2: "NOT_ESTABLISHABLE",
    c3: "NOT_ESTABLISHABLE",
    c4: "NOT_ESTABLISHABLE",
    c5: "NOT_ESTABLISHABLE",
    c6: "NOT_ESTABLISHABLE",
    c7: "NOT_ESTABLISHABLE",
  };
  const validStructuralConflict = sigma.some((entry) => entry.structuralResult === "CONFLICT");
  const status = validStructuralConflict ? "CONFLICT" : "NOT_DETERMINABLE";
  const statusReason = validStructuralConflict
    ? "CONFLICT_VALIDATED_UNIT"
    : "NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY";
  const canonicalOutputConflictState = canonicalValueSet(
    sigma.map((entry) => ({ evaluationKey: entry.evaluationKey, conflictState: entry.conflictState })),
  );
  const md2OutputId = digestParts(
    IDENTITY_DOMAIN.OUTPUT,
    OPERATOR_VERSION,
    DEFAULT_RELATION_LIBRARY.relationLibraryId,
    packageId,
    formationCarrierId,
    dependenceStructureId,
    structuralEvidenceDigest,
    canonicalSerialize(nonPinnedUnitIds),
    calibrationMode,
    calibrationAuthorityId,
    authorityExecutionClass,
    candidate.g0Id,
    candidate.sideId,
    candidate.factualSealId,
    candidate.domainId,
    candidate.intervalId,
    canonicalSerialize(C_H),
    status,
    statusReason,
    canonicalSerialize(environmentBinding),
    strongestAlternativeStatus,
    canonicalSerialize(strongestAlternativeSet),
    canonicalSerialize(determinationChecklist),
    canonicalSerialize(canonicalOutputConflictState),
  );

  return deepFreeze({
    tag: "VALID_STRUCTURAL_RESULT",
    output: {
      operatorVersion: OPERATOR_VERSION,
      relationLibraryId: DEFAULT_RELATION_LIBRARY.relationLibraryId,
      packageId,
      formationCarrierId,
      dependenceStructureId,
      structuralEvidenceDigest,
      g0Id: candidate.g0Id,
      sideId: candidate.sideId,
      factualSealId: candidate.factualSealId,
      domainId: candidate.domainId,
      intervalId: candidate.intervalId,
      retainedUnits,
      structuralEvidenceGroups,
      sigma,
      nonPinnedUnitIds,
      C_H,
      environmentBinding,
      strongestAlternativeStatus,
      strongestAlternativeSet,
      calibrationMode,
      calibrationAuthorityId,
      authorityExecutionClass,
      determinationChecklist,
      status,
      statusReason,
      md2OutputId,
    },
  });
}

export function executeMd2(candidateInput) {
  const candidate = canonicalPreValidation(candidateInput);
  const stageOne = stageOneFindings(candidate);
  if (stageOne.length > 0) return makeRejection(candidate, stageOne);

  const preparedUnits = prepareUnits(candidate);
  const stageTwo = stageTwoFindings(candidate, preparedUnits);
  if (stageTwo.length > 0) return makeRejection(candidate, stageTwo);

  const stageThree = stageThreeFindings(candidate);
  if (stageThree.length > 0) return makeRejection(candidate, stageThree);

  const stageFour = stageFourFindings(preparedUnits);
  if (stageFour.length > 0) return makeRejection(candidate, stageFour);

  const stageFive = stageFiveFindings(candidate, preparedUnits);
  if (stageFive.length > 0) return makeRejection(candidate, stageFive);

  return buildValidResult(candidate, preparedUnits);
}

export const _md2Conformance = deepFreeze({
  operatorVersion: OPERATOR_VERSION,
  identityDomains: IDENTITY_DOMAIN,
  e9: [...E9],
  pinnedRelationLibrarySemantic: DEFAULT_RELATION_LIBRARY.semantic,
  pinnedRelationLibraryTraceability: DEFAULT_RELATION_LIBRARY.traceability,
  deriveRelationLibraryArtifacts,
  canonicalPreValidation,
  unitIdFor,
  structuralEvidenceGroupIdFor,
});
