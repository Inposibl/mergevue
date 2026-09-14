import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { executeMd2 } from "../src/historical/index.js";
import { canonicalSerialize } from "../src/historical/canonical.js";
import { _md2Conformance } from "../src/historical/md2.js";

const results = [];

function check(id, name, fn) {
  try {
    fn();
    results.push({ id, name, status: "PASS" });
  } catch (error) {
    results.push({ id, name, status: "FAIL", error: error.message, stack: error.stack });
  }
}

function expectedDigest(...parts) {
  const digest = createHash("sha256").update(parts.join(""), "utf8").digest("hex");
  return `sha256:${digest}`;
}

function canonicalSort(values) {
  return [...values].sort((left, right) => {
    const leftBytes = canonicalSerialize(left);
    const rightBytes = canonicalSerialize(right);
    if (leftBytes < rightBytes) return -1;
    if (leftBytes > rightBytes) return 1;
    return 0;
  });
}

const EXPECTED_E9 = canonicalSort([
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

const EXPECTED_SHARED_RULE_SEMANTICS = {
  relation: "SUPPORT",
  contraction_authorized: false,
  missingness_behavior: "missing trigger evidence → UNKNOWN; no SUPPORT; no exclusion; established false trigger → INAPPLICABLE",
  contradiction_behavior: "retain positive and adverse; unresolved material same-domain/time contradiction → CONFLICTED; blocks SUPPORT; do not average; unaffected scopes remain separate",
  inapplicable_behavior: "INAPPLICABLE; not exclusion",
  unknown_behavior: "UNKNOWN; not negative",
  conflicted_behavior: "CONFLICT; blocks SUPPORT",
  "O/P activation": "SUPPORT requires O_flag=true and not P-only as the sole evidence; P-only ESTABLISHED → UNKNOWN",
  ATOM_PRESENT: "ESTABLISHED ∧ O → nonempty atomIds else reject unit",
};

const EXPECTED_PINNED_RULES = canonicalSort([
  {
    ruleId: "A4-S01",
    ruleVersion: "A4-S01-CORR6",
    mechanismFamilyId: "TECHNOLOGY_RESOURCE_COMPETITION",
    environment: "NT/STJ",
    ...EXPECTED_SHARED_RULE_SEMANTICS,
    conjuncts: canonicalSort([
      "FAMILY_MATCH",
      "FULL_CONJUNCTION_ADMITTED (clusterState=ESTABLISHED)",
      "ENACTED_TECH_COMPETITION — enacted competition among identified alternatives for acquisition, development, or deployment of technological resources in the same decision domain and interval (packed into ESTABLISHED by formation; text identity-bound)",
      "O_NOT_P_ONLY",
      "ATOM_PRESENT",
    ]),
  },
  {
    ruleId: "A4-S02",
    ruleVersion: "A4-S02-CORR6",
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    environment: "SFJ/SFP",
    ...EXPECTED_SHARED_RULE_SEMANTICS,
    conjuncts: canonicalSort([
      "FAMILY_MATCH",
      "FULL_CONJUNCTION_ADMITTED (clusterState=ESTABLISHED)",
      "ENACTED_TIE_PRESERVATION (enacted preservation of already-held resource access or position for established members through social ties, same domain and interval)",
      "O_NOT_P_ONLY",
      "ATOM_PRESENT",
    ]),
  },
]);

const EXPECTED_OUTPUT_KEYS = [
  "C_H",
  "authorityExecutionClass",
  "calibrationAuthorityId",
  "calibrationMode",
  "dependenceStructureId",
  "determinationChecklist",
  "domainId",
  "environmentBinding",
  "factualSealId",
  "formationCarrierId",
  "g0Id",
  "intervalId",
  "md2OutputId",
  "nonPinnedUnitIds",
  "operatorVersion",
  "packageId",
  "relationLibraryId",
  "retainedUnits",
  "sideId",
  "sigma",
  "status",
  "statusReason",
  "strongestAlternativeSet",
  "strongestAlternativeStatus",
  "structuralEvidenceDigest",
  "structuralEvidenceGroups",
].sort();

const EXPECTED_SIGMA_KEYS = [
  "annotationIds",
  "conflictState",
  "environment",
  "evaluationKey",
  "mechanismFamilyId",
  "structuralEvidenceGroupIds",
  "structuralResult",
  "unitIdsEvaluated",
].sort();

const EXPECTED_REJECTION_KEYS = [
  "canonicalPreValidationInputDigest",
  "operatorVersion",
  "primaryFinding",
  "rejectionId",
  "secondaryFindings",
  "validationStage",
].sort();

const EXPECTED_FINDING_KEYS = ["code", "path", "stage"].sort();

const EXPECTED_CHECKLIST = {
  c1: "NOT_ESTABLISHABLE",
  c2: "NOT_ESTABLISHABLE",
  c3: "NOT_ESTABLISHABLE",
  c4: "NOT_ESTABLISHABLE",
  c5: "NOT_ESTABLISHABLE",
  c6: "NOT_ESTABLISHABLE",
  c7: "NOT_ESTABLISHABLE",
};

function baseUnit(overrides = {}) {
  return {
    originGroupId: "origin-1",
    mechanismFamilyId: "TECHNOLOGY_RESOURCE_COMPETITION",
    clusterState: "UNKNOWN",
    O_flag: false,
    P_flag: false,
    conflictFlag: false,
    atomIds: [],
    annotationIds: [],
    ...overrides,
  };
}

function baseCandidate(overrides = {}) {
  return {
    operatorVersionRequested: "v0.1.CORR6",
    g0Id: "g0-1",
    sideId: "ACQUIRER",
    factualSealId: "seal-1",
    domainId: "domain-1",
    intervalId: "PRE-T0",
    formationCarrier: {
      formerId: "former-1",
      formerVersion: "former-v1",
      authorityStatus: "PRODUCTION_ABSENT",
      forbidsLlmEstablished: true,
    },
    observationUnits: [],
    declaredDependence: { groups: [] },
    ...overrides,
  };
}

function valid(candidate) {
  const before = structuredClone(candidate);
  const result = executeMd2(candidate);
  assert.deepEqual(candidate, before, "valid execution mutated caller-owned input");
  assert.equal(result.tag, "VALID_STRUCTURAL_RESULT");
  assert.ok(result.output);
  assert.equal(Object.hasOwn(result, "rejection"), false);
  assert.deepEqual(Object.keys(result.output).sort(), EXPECTED_OUTPUT_KEYS);
  assert.equal(result.output.operatorVersion, "v0.1.CORR6");
  assert.deepEqual(result.output.C_H, EXPECTED_E9);
  assert.equal(result.output.environmentBinding, "NONE");
  assert.equal(result.output.strongestAlternativeStatus, "UNRESOLVED");
  assert.deepEqual(result.output.strongestAlternativeSet, []);
  assert.equal(result.output.calibrationMode, "DORMANT");
  assert.equal(result.output.calibrationAuthorityId, "DORMANT");
  assert.equal(result.output.authorityExecutionClass, "METHODOLOGY_CANDIDATE_EXECUTION");
  assert.deepEqual(result.output.determinationChecklist, EXPECTED_CHECKLIST);
  assert.equal(result.output.sigma.length, 2);
  for (const entry of result.output.sigma) {
    assert.deepEqual(Object.keys(entry).sort(), EXPECTED_SIGMA_KEYS);
    assert.equal(entry.conflictState, entry.structuralResult === "CONFLICT");
  }
  const retainedIds = canonicalSort(result.output.retainedUnits.map((unit) => unit.unitId));
  const groupedIds = canonicalSort(result.output.structuralEvidenceGroups.flatMap((group) => group.memberUnitIds));
  assert.deepEqual(groupedIds, retainedIds, "structural groups must partition every retained unit exactly once");
  assert.equal(new Set(groupedIds).size, groupedIds.length, "a retained unit cannot occupy two structural groups");
  const hasPinnedConflict = result.output.sigma.some((entry) => entry.structuralResult === "CONFLICT");
  assert.equal(result.output.status, hasPinnedConflict ? "CONFLICT" : "NOT_DETERMINABLE");
  assert.equal(
    result.output.statusReason,
    hasPinnedConflict ? "CONFLICT_VALIDATED_UNIT" : "NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY",
  );
  for (const forbidden of ["prior", "probability", "likelihood", "posterior", "ranking", "leader", "md2SemanticOutputEligible", "coreConsumable"]) {
    assert.equal(Object.hasOwn(result.output, forbidden), false);
  }
  return result.output;
}

function rejected(candidate) {
  const before = structuredClone(candidate);
  const result = executeMd2(candidate);
  assert.deepEqual(candidate, before, "rejected execution mutated caller-owned input");
  assert.equal(result.tag, "REJECTED_INPUT");
  assert.deepEqual(Object.keys(result).sort(), ["rejection", "tag"]);
  assert.ok(result.rejection);
  assert.deepEqual(Object.keys(result.rejection).sort(), EXPECTED_REJECTION_KEYS);
  assert.equal(result.rejection.operatorVersion, "v0.1.CORR6");
  assert.deepEqual(Object.keys(result.rejection.primaryFinding).sort(), EXPECTED_FINDING_KEYS);
  for (const finding of result.rejection.secondaryFindings) {
    assert.deepEqual(Object.keys(finding).sort(), EXPECTED_FINDING_KEYS);
  }
  assert.equal(Object.hasOwn(result, "output"), false);
  assert.equal(Object.hasOwn(result.rejection, "md2OutputId"), false);
  assert.equal(Object.hasOwn(result.rejection, "C_H"), false);
  assert.equal(Object.hasOwn(result.rejection, "sigma"), false);
  assert.match(result.rejection.canonicalPreValidationInputDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(result.rejection.rejectionId, /^sha256:[0-9a-f]{64}$/u);
  return result.rejection;
}

function assertRejection(candidate, stage, code, path) {
  const rejection = rejected(candidate);
  assert.equal(rejection.validationStage, stage);
  assert.equal(rejection.primaryFinding.stage, stage);
  assert.equal(rejection.primaryFinding.code, code);
  if (path instanceof RegExp) assert.match(rejection.primaryFinding.path, path);
  else if (path !== undefined) assert.deepEqual(rejection.primaryFinding.path, path);
  for (const finding of rejection.secondaryFindings) assert.equal(finding.stage, stage);
  return rejection;
}

function sigmaEntry(output, evaluationKey) {
  const entry = output.sigma.find((row) => row.evaluationKey === evaluationKey);
  assert.ok(entry, `missing sigma entry ${evaluationKey}`);
  return entry;
}

function unitId(unit) {
  return _md2Conformance.unitIdFor(unit);
}

function declaredGroup(dependenceClusterId, units, extra = {}) {
  return {
    dependenceClusterId,
    memberUnitIds: units.map(unitId),
    ...extra,
  };
}

function contributionUnit(kind, ordinal, mechanismFamilyId = "TECHNOLOGY_RESOURCE_COMPETITION") {
  const common = { originGroupId: `agg-${mechanismFamilyId}-${kind}-${ordinal}`, mechanismFamilyId };
  if (kind === "SUPPORT") {
    return baseUnit({ ...common, clusterState: "ESTABLISHED", O_flag: true, atomIds: [`atom-${ordinal}`] });
  }
  if (kind === "UNKNOWN") return baseUnit({ ...common, clusterState: "UNKNOWN" });
  if (kind === "INAPPLICABLE") return baseUnit({ ...common, clusterState: "INAPPLICABLE" });
  if (kind === "CONFLICT") {
    return baseUnit({ ...common, clusterState: "CONFLICTED", conflictFlag: true });
  }
  throw new Error(`unknown contribution ${kind}`);
}

// A-E: valid execution and the two pinned SUPPORT cells.
check("A", "valid empty-unit candidate yields the frozen non-determination surface", () => {
  const candidate = baseCandidate();
  const before = structuredClone(candidate);
  const output = valid(candidate);
  assert.deepEqual(candidate, before);
  assert.equal(output.operatorVersion, "v0.1.CORR6");
  assert.equal(output.status, "NOT_DETERMINABLE");
  assert.equal(output.statusReason, "NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY");
  assert.equal(output.sigma.length, 2);
  assert.equal(output.retainedUnits.length, 0);
  assert.equal(output.structuralEvidenceGroups.length, 0);
  assert.equal(Object.isFrozen(output), true);
});

check("B", "A4-S01 exact pinned family produces SUPPORT", () => {
  const unit = baseUnit({ clusterState: "ESTABLISHED", O_flag: true, atomIds: ["atom-s01"] });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  const entry = sigmaEntry(output, "A4-S01");
  assert.equal(entry.environment, "NT/STJ");
  assert.equal(entry.structuralResult, "SUPPORT");
  assert.deepEqual(entry.unitIdsEvaluated, [unitId(unit)]);
});

check("C", "A4-S02 exact pinned family produces SUPPORT", () => {
  const unit = baseUnit({
    originGroupId: "origin-s02",
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "ESTABLISHED",
    O_flag: true,
    atomIds: ["atom-s02"],
  });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  const entry = sigmaEntry(output, "A4-S02");
  assert.equal(entry.environment, "SFJ/SFP");
  assert.equal(entry.structuralResult, "SUPPORT");
});

check("D", "P-only ESTABLISHED remains UNKNOWN", () => {
  const unit = baseUnit({ clusterState: "ESTABLISHED", O_flag: false, P_flag: true });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  assert.equal(sigmaEntry(output, "A4-S01").structuralResult, "UNKNOWN");
});

check("E", "lawful ABSENT_OBSERVED contributes INAPPLICABLE", () => {
  const unit = baseUnit({ clusterState: "ABSENT_OBSERVED", O_flag: true });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  assert.equal(sigmaEntry(output, "A4-S01").structuralResult, "INAPPLICABLE");
});

check("E-CONFLICT", "validated pinned-family conflict controls status, reason, and cell flag", () => {
  const unit = baseUnit({ clusterState: "CONFLICTED", conflictFlag: true });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  const entry = sigmaEntry(output, "A4-S01");
  assert.equal(entry.structuralResult, "CONFLICT");
  assert.equal(entry.conflictState, true);
  assert.equal(output.status, "CONFLICT");
  assert.equal(output.statusReason, "CONFLICT_VALIDATED_UNIT");
  assert.equal(output.environmentBinding, "NONE");
});

check("E-OMITTED-VERSION", "omitted operatorVersionRequested lawfully selects CORR6", () => {
  const candidate = baseCandidate();
  delete candidate.operatorVersionRequested;
  const omitted = valid(candidate);
  const explicit = valid(baseCandidate());
  assert.equal(omitted.operatorVersion, "v0.1.CORR6");
  assert.equal(omitted.md2OutputId, explicit.md2OutputId);
});

check("E-TARGET", "TARGET is a lawful sideId on the same non-production surface", () => {
  const output = valid(baseCandidate({ sideId: "TARGET" }));
  assert.equal(output.sideId, "TARGET");
  assert.equal(output.status, "NOT_DETERMINABLE");
});

check("E-S02-P-ONLY", "S02 P-only ESTABLISHED remains UNKNOWN", () => {
  const unit = baseUnit({
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "ESTABLISHED",
    O_flag: false,
    P_flag: true,
  });
  assert.equal(sigmaEntry(valid(baseCandidate({ observationUnits: [unit] })), "A4-S02").structuralResult, "UNKNOWN");
});

check("E-S02-ABSENT", "S02 lawful ABSENT_OBSERVED contributes INAPPLICABLE", () => {
  const unit = baseUnit({
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "ABSENT_OBSERVED",
    O_flag: true,
  });
  assert.equal(sigmaEntry(valid(baseCandidate({ observationUnits: [unit] })), "A4-S02").structuralResult, "INAPPLICABLE");
});

// F: the complete 42-leaf classifyUnit partition, exercised through Phi.
const states = ["ESTABLISHED", "ABSENT_OBSERVED", "UNKNOWN", "INAPPLICABLE", "CONFLICTED"];
for (const clusterState of states) {
  for (const O_flag of [false, true]) {
    for (const P_flag of [false, true]) {
      for (const conflictFlag of [false, true]) {
        const atomVariants = clusterState === "ESTABLISHED" && O_flag && !conflictFlag
          ? [[], ["atom-partition"]]
          : [[]];
        for (const atomIds of atomVariants) {
          const suffix = `${clusterState}-O${Number(O_flag)}-P${Number(P_flag)}-C${Number(conflictFlag)}-A${Number(atomIds.length > 0)}`;
          check(`F-${suffix}`, `unit partition ${suffix}`, () => {
            const unit = baseUnit({ clusterState, O_flag, P_flag, conflictFlag, atomIds });
            if (conflictFlag && clusterState !== "CONFLICTED") {
              assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_UNIT_STATE_INCONSISTENT");
              return;
            }
            if (!conflictFlag && clusterState === "CONFLICTED") {
              assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_UNIT_STATE_INCONSISTENT");
              return;
            }
            if (!conflictFlag && clusterState === "ABSENT_OBSERVED" && !O_flag) {
              assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_UNIT_STATE_INCONSISTENT");
              return;
            }
            if (!conflictFlag && clusterState === "ESTABLISHED" && O_flag && atomIds.length === 0) {
              assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_ESTABLISHED_WITHOUT_ATOM");
              return;
            }
            const output = valid(baseCandidate({ observationUnits: [unit] }));
            const actual = sigmaEntry(output, "A4-S01").structuralResult;
            let expected = "UNKNOWN";
            if (conflictFlag) expected = "CONFLICT";
            else if (clusterState === "INAPPLICABLE" || clusterState === "ABSENT_OBSERVED") expected = "INAPPLICABLE";
            else if (clusterState === "ESTABLISHED" && O_flag && atomIds.length > 0) expected = "SUPPORT";
            assert.equal(actual, expected);
          });
        }
      }
    }
  }
}

// G: full section 16.3 aggregation matrix.
const aggregationMatrix = [
  [["CONFLICT", "SUPPORT"], "CONFLICT"],
  [["CONFLICT", "UNKNOWN"], "CONFLICT"],
  [["CONFLICT", "INAPPLICABLE"], "CONFLICT"],
  [["SUPPORT", "INAPPLICABLE"], "SUPPORT"],
  [["SUPPORT", "UNKNOWN"], "SUPPORT"],
  [["UNKNOWN", "INAPPLICABLE"], "UNKNOWN"],
  [["UNKNOWN", "UNKNOWN"], "UNKNOWN"],
  [["INAPPLICABLE", "INAPPLICABLE"], "INAPPLICABLE"],
  [[], "UNKNOWN"],
];
for (const [mix, expected] of aggregationMatrix) {
  const id = mix.length === 0 ? "EMPTY" : mix.join("+");
  check(`G-${id}`, `aggregation ${id} -> ${expected}`, () => {
    const units = mix.map((kind, index) => contributionUnit(kind, index + 1));
    const output = valid(baseCandidate({ observationUnits: units }));
    assert.equal(sigmaEntry(output, "A4-S01").structuralResult, expected);
  });
}

for (const [mix, expected] of aggregationMatrix) {
  const id = mix.length === 0 ? "EMPTY" : mix.join("+");
  check(`G-S02-${id}`, `S02 aggregation parity ${id} -> ${expected}`, () => {
    const units = mix.map((kind, index) => contributionUnit(
      kind,
      index + 1,
      "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    ));
    const output = valid(baseCandidate({ observationUnits: units }));
    assert.equal(sigmaEntry(output, "A4-S02").structuralResult, expected);
  });
}

// H: every Stage-1 priority class has an executable trigger.
const stageOneCases = [
  ["UNKNOWN", { unexpected: true }, "REJ_UNKNOWN_FIELD"],
  ["RL", { relationLibrary: [] }, "REJ_CALLER_RL_SUBSTITUTION"],
  ["EXCLUDES", { EXCLUDES: [] }, "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE"],
  ["PROB", { Prior: {} }, "REJ_FORBIDDEN_PROBABILISTIC_INPUT"],
  ["CAL", { calibrationMode: "ACTIVE" }, "REJ_FORBIDDEN_CALIBRATION_INPUT"],
];
for (const [id, extra, code] of stageOneCases) {
  check(`H-${id}`, `Stage 1 class ${code}`, () => {
    assertRejection(baseCandidate(extra), 1, code);
  });
}

check("H-RAW", "Stage 1 raw model narrative class", () => {
  assertRejection(baseCandidate({ observationUnits: ["raw model narrative"] }), 1, "REJ_RAW_MODEL_NARRATIVE");
});

check("H-MISSING", "Stage 1 required-field-missing class", () => {
  const candidate = baseCandidate();
  delete candidate.domainId;
  assertRejection(candidate, 1, "REJ_REQUIRED_FIELD_MISSING", "domainId");
});

check("H-ENUM", "Stage 1 enum-invalid class", () => {
  assertRejection(baseCandidate({ sideId: "BUYER" }), 1, "REJ_ENUM_INVALID", "sideId");
});

check("H-COLLECTION", "Stage 1 collection-type-invalid class", () => {
  assertRejection(baseCandidate({ observationUnits: {} }), 1, "REJ_COLLECTION_TYPE_INVALID", "observationUnits");
});

check("H-COMPETING", "Stage 1 competing activation key class", () => {
  const unit = { ...baseUnit(), ruleId: "A4-S01" };
  assertRejection(baseCandidate({ observationUnits: [unit] }), 1, "REJ_COMPETING_ACTIVATION_KEYS");
});

check("H-MISSING-ACTIVATION", "Stage 1 missing activation key class", () => {
  const unit = baseUnit();
  delete unit.mechanismFamilyId;
  assertRejection(baseCandidate({ observationUnits: [unit] }), 1, "REJ_MISSING_ACTIVATION_KEY");
});

check("H-SCHEMA", "Stage 1 schema-invalid totality class", () => {
  assertRejection(baseCandidate({ g0Id: 42 }), 1, "REJ_SCHEMA_INVALID", "g0Id");
});

check("H-DEEP-TOTAL", "finite deeply nested malformed content yields a typed Stage 1 rejection", () => {
  function deepValue(leaf) {
    let value = leaf;
    for (let depth = 0; depth < 10_000; depth += 1) value = { nested: value };
    return value;
  }
  const result = executeMd2(baseCandidate({ g0Id: deepValue("leaf") }));
  const repeated = executeMd2(baseCandidate({ g0Id: deepValue("leaf") }));
  const mutated = executeMd2(baseCandidate({ g0Id: deepValue("changed-leaf") }));
  assert.equal(result.tag, "REJECTED_INPUT");
  assert.equal(result.rejection.validationStage, 1);
  assert.equal(result.rejection.primaryFinding.code, "REJ_SCHEMA_INVALID");
  assert.equal(result.rejection.primaryFinding.path, "g0Id");
  assert.match(result.rejection.canonicalPreValidationInputDigest, /^sha256:[0-9a-f]{64}$/u);
  assert.match(result.rejection.rejectionId, /^sha256:[0-9a-f]{64}$/u);
  assert.equal(result.rejection.canonicalPreValidationInputDigest, repeated.rejection.canonicalPreValidationInputDigest);
  assert.equal(result.rejection.rejectionId, repeated.rejection.rejectionId);
  assert.notEqual(result.rejection.canonicalPreValidationInputDigest, mutated.rejection.canonicalPreValidationInputDigest);
  assert.notEqual(result.rejection.rejectionId, mutated.rejection.rejectionId);
});

check("H-PROTO", "an own __proto__ field survives prevalidation and is rejected as unknown", () => {
  const candidate = baseCandidate();
  Object.defineProperty(candidate, "__proto__", {
    value: { attemptedPrototypePayload: true },
    enumerable: true,
    configurable: true,
    writable: true,
  });
  assert.equal(Object.hasOwn(candidate, "__proto__"), true);
  assertRejection(candidate, 1, "REJ_UNKNOWN_FIELD", "__proto__");
});

check("H-NESTED-UNKNOWN", "forbidden top-level names remain ordinary unknown fields when nested", () => {
  const unit = { ...baseUnit(), Prior: {} };
  assertRejection(baseCandidate({ observationUnits: [unit] }), 1, "REJ_UNKNOWN_FIELD", "observationUnits[0].Prior");
});

for (const field of [
  "g0Id",
  "sideId",
  "factualSealId",
  "domainId",
  "intervalId",
  "formationCarrier",
  "observationUnits",
  "declaredDependence",
]) {
  check(`H-REQ-TOP-${field}`, `missing required top-level field ${field}`, () => {
    const candidate = baseCandidate();
    delete candidate[field];
    assertRejection(candidate, 1, "REJ_REQUIRED_FIELD_MISSING", field);
  });
}

for (const field of ["formerId", "formerVersion", "authorityStatus", "forbidsLlmEstablished"]) {
  check(`H-REQ-CARRIER-${field}`, `missing required carrier field ${field}`, () => {
    const formationCarrier = { ...baseCandidate().formationCarrier };
    delete formationCarrier[field];
    assertRejection(
      baseCandidate({ formationCarrier }),
      1,
      "REJ_REQUIRED_FIELD_MISSING",
      `formationCarrier.${field}`,
    );
  });
}

for (const field of ["originGroupId", "clusterState", "O_flag", "P_flag", "conflictFlag", "atomIds", "annotationIds"]) {
  check(`H-REQ-UNIT-${field}`, `missing required unit field ${field}`, () => {
    const unit = baseUnit();
    delete unit[field];
    assertRejection(
      baseCandidate({ observationUnits: [unit] }),
      1,
      "REJ_REQUIRED_FIELD_MISSING",
      `observationUnits[0].${field}`,
    );
  });
}

check("H-REQ-DEPENDENCE-GROUPS", "missing declaredDependence.groups is rejected", () => {
  assertRejection(baseCandidate({ declaredDependence: {} }), 1, "REJ_REQUIRED_FIELD_MISSING", "declaredDependence.groups");
});

for (const field of ["dependenceClusterId", "memberUnitIds"]) {
  check(`H-REQ-GROUP-${field}`, `missing required declared group field ${field}`, () => {
    const group = { dependenceClusterId: "dep-required", memberUnitIds: [] };
    delete group[field];
    assertRejection(
      baseCandidate({ declaredDependence: { groups: [group] } }),
      1,
      "REJ_REQUIRED_FIELD_MISSING",
      `declaredDependence.groups[0].${field}`,
    );
  });
}

const stageOneShapeCases = [
  ["CARRIER-SHAPE", { formationCarrier: [] }, "REJ_SCHEMA_INVALID", "formationCarrier"],
  ["DEPENDENCE-SHAPE", { declaredDependence: [] }, "REJ_SCHEMA_INVALID", "declaredDependence"],
  ["GROUP-SHAPE", { declaredDependence: { groups: [null] } }, "REJ_SCHEMA_INVALID", "declaredDependence.groups[0]"],
  ["UNIT-SHAPE", { observationUnits: [null] }, "REJ_SCHEMA_INVALID", "observationUnits[0]"],
  ["GROUPS-COLLECTION", { declaredDependence: { groups: {} } }, "REJ_COLLECTION_TYPE_INVALID", "declaredDependence.groups"],
  ["ATOM-COLLECTION", { observationUnits: [baseUnit({ atomIds: {} })] }, "REJ_COLLECTION_TYPE_INVALID", "observationUnits[0].atomIds"],
  ["ANNOTATION-COLLECTION", { observationUnits: [baseUnit({ annotationIds: {} })] }, "REJ_COLLECTION_TYPE_INVALID", "observationUnits[0].annotationIds"],
  ["MEMBER-COLLECTION", { declaredDependence: { groups: [{ dependenceClusterId: "dep", memberUnitIds: {} }] } }, "REJ_COLLECTION_TYPE_INVALID", "declaredDependence.groups[0].memberUnitIds"],
  ["ORIGIN-COLLECTION", { declaredDependence: { groups: [{ dependenceClusterId: "dep", memberUnitIds: [], originGroupIds: {} }] } }, "REJ_COLLECTION_TYPE_INVALID", "declaredDependence.groups[0].originGroupIds"],
  ["CLUSTER-ENUM", { observationUnits: [baseUnit({ clusterState: "MISSING" })] }, "REJ_ENUM_INVALID", "observationUnits[0].clusterState"],
  ["BOOLEAN-ENUM", { observationUnits: [baseUnit({ O_flag: "true" })] }, "REJ_ENUM_INVALID", "observationUnits[0].O_flag"],
  ["VERSION-TYPE", { operatorVersionRequested: 6 }, "REJ_SCHEMA_INVALID", "operatorVersionRequested"],
  ["RAW-KIND", { observationUnits: [{ ...baseUnit(), unitKind: "MODEL_NARRATIVE" }] }, "REJ_RAW_MODEL_NARRATIVE", "observationUnits[0]"],
];
for (const [id, overrides, code, path] of stageOneShapeCases) {
  check(`H-${id}`, `Stage 1 exact trigger ${id}`, () => {
    assertRejection(baseCandidate(overrides), 1, code, path);
  });
}

const nestedUnknownCases = [
  ["CARRIER", { formationCarrier: { ...baseCandidate().formationCarrier, extra: true } }, "formationCarrier.extra"],
  ["UNIT", { observationUnits: [{ ...baseUnit(), extra: true }] }, "observationUnits[0].extra"],
  ["DEPENDENCE", { declaredDependence: { groups: [], extra: true } }, "declaredDependence.extra"],
  ["GROUP", { declaredDependence: { groups: [{ dependenceClusterId: "dep", memberUnitIds: [], extra: true }] } }, "declaredDependence.groups[0].extra"],
];
for (const [id, overrides, path] of nestedUnknownCases) {
  check(`H-UNKNOWN-${id}`, `unknown nested ${id.toLowerCase()} field`, () => {
    assertRejection(baseCandidate(overrides), 1, "REJ_UNKNOWN_FIELD", path);
  });
}

// I-J: earliest stage, code priority, and the known canonical(path) example.
check("I-1", "malformed unit beats wrong requested version", () => {
  assertRejection(baseCandidate({ operatorVersionRequested: "v0.1.CORR5", observationUnits: [null] }), 1, "REJ_SCHEMA_INVALID");
});

check("I-2", "caller RL beats raw narrative inside Stage 1", () => {
  assertRejection(baseCandidate({ relationLibrary: [], observationUnits: ["raw"] }), 1, "REJ_CALLER_RL_SUBSTITUTION");
});

check("J", "canonical path puts factualSealId before g0Id and excludes later stages", () => {
  const candidate = baseCandidate({
    declaredDependence: { groups: [{ dependenceClusterId: "bad", memberUnitIds: [] }] },
  });
  delete candidate.g0Id;
  delete candidate.factualSealId;
  const rejection = assertRejection(candidate, 1, "REJ_REQUIRED_FIELD_MISSING", "factualSealId");
  assert.deepEqual(rejection.secondaryFindings, [
    { stage: 1, code: "REJ_REQUIRED_FIELD_MISSING", path: "g0Id" },
  ]);
});

check("I-4", "missing carrier beats inconsistent unit", () => {
  const candidate = baseCandidate({ observationUnits: [baseUnit({ clusterState: "CONFLICTED" })] });
  delete candidate.formationCarrier;
  assertRejection(candidate, 1, "REJ_REQUIRED_FIELD_MISSING", "formationCarrier");
});

check("I-5", "forbidden Prior beats invalid sideId", () => {
  assertRejection(baseCandidate({ Prior: {}, sideId: "BUYER" }), 1, "REJ_FORBIDDEN_PROBABILISTIC_INPUT");
});

check("I-6", "unknown field beats non-PRE-T0", () => {
  assertRejection(baseCandidate({ unexpected: true, intervalId: "POST-T0" }), 1, "REJ_UNKNOWN_FIELD");
});

const stageOnePriorityCollisions = [
  ["01-02", () => baseCandidate({ unexpected: true, relationLibrary: [] }), "REJ_UNKNOWN_FIELD", "unexpected"],
  ["02-03", () => baseCandidate({ relationLibrary: [], EXCLUDES: [] }), "REJ_CALLER_RL_SUBSTITUTION", "relationLibrary"],
  ["03-04", () => baseCandidate({ EXCLUDES: [], Prior: {} }), "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE", "EXCLUDES"],
  ["04-05", () => baseCandidate({ Prior: {}, calibrationMode: "ACTIVE" }), "REJ_FORBIDDEN_PROBABILISTIC_INPUT", "Prior"],
  ["05-06", () => baseCandidate({ calibrationMode: "ACTIVE", observationUnits: ["raw"] }), "REJ_FORBIDDEN_CALIBRATION_INPUT", "calibrationMode"],
  ["06-07", () => {
    const candidate = baseCandidate({ observationUnits: ["raw"] });
    delete candidate.g0Id;
    return candidate;
  }, "REJ_RAW_MODEL_NARRATIVE", "observationUnits[0]"],
  ["07-08", () => {
    const candidate = baseCandidate({ sideId: "BUYER" });
    delete candidate.g0Id;
    return candidate;
  }, "REJ_REQUIRED_FIELD_MISSING", "g0Id"],
  ["08-09", () => baseCandidate({ sideId: "BUYER", observationUnits: {} }), "REJ_ENUM_INVALID", "sideId"],
  ["09-10", () => baseCandidate({
    observationUnits: [{ ...baseUnit(), ruleId: "A4-S01" }],
    declaredDependence: { groups: {} },
  }), "REJ_COLLECTION_TYPE_INVALID", "declaredDependence.groups"],
  ["10-11", () => {
    const unit = { ...baseUnit(), ruleId: "A4-S01" };
    delete unit.mechanismFamilyId;
    return baseCandidate({ observationUnits: [unit] });
  }, "REJ_COMPETING_ACTIVATION_KEYS", "observationUnits[0]"],
  ["11-12", () => {
    const unit = baseUnit();
    delete unit.mechanismFamilyId;
    return baseCandidate({ g0Id: 42, observationUnits: [unit] });
  }, "REJ_MISSING_ACTIVATION_KEY", "observationUnits[0]"],
];
for (const [id, candidate, code, path] of stageOnePriorityCollisions) {
  check(`I-PRIORITY-${id}`, `Stage 1 code priority ${id}`, () => {
    assertRejection(candidate(), 1, code, path);
  });
}

check("I-STAGE2-BEATS-3", "dangling dependence beats a wrong requested version", () => {
  const unit = baseUnit({ originGroupId: "precedence-stage2" });
  const group = { dependenceClusterId: "precedence-stage2", memberUnitIds: [unitId(unit), "sha256:dangling"] };
  assertRejection(
    baseCandidate({ operatorVersionRequested: "v0.1.CORR5", observationUnits: [unit], declaredDependence: { groups: [group] } }),
    2,
    "REJ_DEPENDENCE_INVALID",
  );
});

check("I-STAGE3-BEATS-4", "wrong requested version beats unit-state inconsistency", () => {
  const unit = baseUnit({ clusterState: "CONFLICTED", conflictFlag: false });
  assertRejection(
    baseCandidate({ operatorVersionRequested: "v0.1.CORR5", observationUnits: [unit] }),
    3,
    "REJ_OPERATOR_VERSION",
    "operatorVersionRequested",
  );
});

check("I-STAGE4-BEATS-5", "unit-state inconsistency beats a one-member declared group", () => {
  const unit = baseUnit({ clusterState: "CONFLICTED", conflictFlag: false });
  const group = declaredGroup("precedence-stage5", [unit]);
  assertRejection(
    baseCandidate({ observationUnits: [unit], declaredDependence: { groups: [group] } }),
    4,
    "REJ_UNIT_STATE_INCONSISTENT",
  );
});

check("I-STAGE3-PRIORITY", "Stage 3 version beats interval and carrier defects", () => {
  const formationCarrier = {
    ...baseCandidate().formationCarrier,
    authorityStatus: "PRODUCTION_PRESENT",
  };
  assertRejection(
    baseCandidate({ operatorVersionRequested: "v0.1.CORR5", intervalId: "POST-T0", formationCarrier }),
    3,
    "REJ_OPERATOR_VERSION",
    "operatorVersionRequested",
  );
});

check("I-STAGE3-SECOND", "Stage 3 interval beats carrier defect", () => {
  const formationCarrier = {
    ...baseCandidate().formationCarrier,
    authorityStatus: "PRODUCTION_PRESENT",
  };
  assertRejection(
    baseCandidate({ intervalId: "POST-T0", formationCarrier }),
    3,
    "REJ_NON_PRE_T0",
    "intervalId",
  );
});

check("I-STAGE4-PRIORITY", "Stage 4 inconsistency beats established-without-atom", () => {
  const inconsistent = baseUnit({ originGroupId: "priority-inconsistent", clusterState: "UNKNOWN", conflictFlag: true });
  const missingAtom = baseUnit({ originGroupId: "priority-atom", clusterState: "ESTABLISHED", O_flag: true });
  assertRejection(
    baseCandidate({ observationUnits: [inconsistent, missingAtom] }),
    4,
    "REJ_UNIT_STATE_INCONSISTENT",
    /^observationUnits\[\d+\]$/u,
  );
});

// K-L: Stage 2 and Stage 3 boundaries.
check("K", "dangling member is Stage 2 dependence invalid", () => {
  const unit = baseUnit();
  const group = { dependenceClusterId: "dep-1", memberUnitIds: [unitId(unit), "!dangling"] };
  assertRejection(
    baseCandidate({ observationUnits: [unit], declaredDependence: { groups: [group] } }),
    2,
    "REJ_DEPENDENCE_INVALID",
    "declaredDependence.groups[0].memberUnitIds[0]",
  );
});

check("L-VERSION", "wrong well-typed operator version is Stage 3", () => {
  assertRejection(baseCandidate({ operatorVersionRequested: "v0.1.CORR5" }), 3, "REJ_OPERATOR_VERSION", "operatorVersionRequested");
});

check("L-INTERVAL", "non-PRE-T0 interval is Stage 3", () => {
  assertRejection(baseCandidate({ intervalId: "POST-T0" }), 3, "REJ_NON_PRE_T0", "intervalId");
});

check("L-CARRIER-AUTH", "wrong carrier authority is Stage 3 schema invalid", () => {
  const carrier = { ...baseCandidate().formationCarrier, authorityStatus: "PRODUCTION_PRESENT" };
  assertRejection(baseCandidate({ formationCarrier: carrier }), 3, "REJ_SCHEMA_INVALID", "formationCarrier.authorityStatus");
});

check("L-CARRIER-LLM", "carrier that permits LLM-established state is Stage 3 schema invalid", () => {
  const carrier = { ...baseCandidate().formationCarrier, forbidsLlmEstablished: false };
  assertRejection(baseCandidate({ formationCarrier: carrier }), 3, "REJ_SCHEMA_INVALID", "formationCarrier.forbidsLlmEstablished");
});

// M: Stage 4 exact state failures.
check("M-INCONSISTENT", "conflict flag on non-CONFLICTED state is Stage 4 inconsistent", () => {
  const unit = baseUnit({ clusterState: "UNKNOWN", conflictFlag: true });
  assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_UNIT_STATE_INCONSISTENT", "observationUnits[0]");
});

check("M-ATOM", "observed ESTABLISHED without atom is Stage 4", () => {
  const unit = baseUnit({ clusterState: "ESTABLISHED", O_flag: true, atomIds: [] });
  assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_ESTABLISHED_WITHOUT_ATOM", "observationUnits[0]");
});

check("M-S02-INCONSISTENT", "S02 family follows the same conflict-state partition", () => {
  const unit = baseUnit({
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "UNKNOWN",
    conflictFlag: true,
  });
  assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_UNIT_STATE_INCONSISTENT");
});

check("M-S02-ATOM", "S02 observed ESTABLISHED without atom is Stage 4", () => {
  const unit = baseUnit({
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "ESTABLISHED",
    O_flag: true,
    atomIds: [],
  });
  assertRejection(baseCandidate({ observationUnits: [unit] }), 4, "REJ_ESTABLISHED_WITHOUT_ATOM");
});

check("M-UNPINNED", "Stage 4 rejects an inconsistent unit before family filtering", () => {
  const unit = baseUnit({
    mechanismFamilyId: "UNPINNED_FAMILY",
    clusterState: "ABSENT_OBSERVED",
    O_flag: false,
  });
  assertRejection(
    baseCandidate({ observationUnits: [unit] }),
    4,
    "REJ_UNIT_STATE_INCONSISTENT",
    "observationUnits[0]",
  );
});

// N-O: all remaining dependence-invalid shape families fail closed at Stage 5.
check("N-EMPTY", "empty declared group is Stage 5", () => {
  const group = { dependenceClusterId: "dep-empty", memberUnitIds: [] };
  assertRejection(
    baseCandidate({ declaredDependence: { groups: [group] } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    "declaredDependence.groups[0].memberUnitIds#declared-group-size",
  );
});

check("N-SINGLE", "single-member declared group is Stage 5", () => {
  const unit = baseUnit();
  const group = declaredGroup("dep-single", [unit]);
  assertRejection(
    baseCandidate({ observationUnits: [unit], declaredDependence: { groups: [group] } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    "declaredDependence.groups[0].memberUnitIds#declared-group-size",
  );
});

check("O-DUP-MEMBER", "duplicate member in one group is Stage 5", () => {
  const a = baseUnit({ originGroupId: "dup-a" });
  const b = baseUnit({ originGroupId: "dup-b" });
  const group = { dependenceClusterId: "dep-dup", memberUnitIds: [unitId(a), unitId(a), unitId(b)] };
  assertRejection(
    baseCandidate({ observationUnits: [a, b], declaredDependence: { groups: [group] } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    /^declaredDependence\.groups\[0\]\.memberUnitIds\[\d+\]#duplicate$/u,
  );
});

check("O-OVERLAP", "member overlap across declared groups is Stage 5", () => {
  const a = baseUnit({ originGroupId: "overlap-a" });
  const b = baseUnit({ originGroupId: "overlap-b" });
  const c = baseUnit({ originGroupId: "overlap-c" });
  const groups = [declaredGroup("dep-ab", [a, b]), declaredGroup("dep-ac", [a, c])];
  assertRejection(
    baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    /^declaredDependence\.groups\[\d+\]\.memberUnitIds\["sha256:[0-9a-f]{64}"\]#overlap$/u,
  );
});

check("O-EQUIV", "equivalent groups with different caller ids are Stage 5", () => {
  const a = baseUnit({ originGroupId: "equiv-a" });
  const b = baseUnit({ originGroupId: "equiv-b" });
  const groups = [declaredGroup("dep-1", [a, b]), declaredGroup("dep-2", [b, a])];
  assertRejection(
    baseCandidate({ observationUnits: [a, b], declaredDependence: { groups } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    /^declaredDependence\.groups\[\d+\]\.memberUnitIds#equivalent-group$/u,
  );
});

check("O-DUP-ID", "duplicate dependenceClusterId is Stage 5", () => {
  const units = [1, 2, 3, 4].map((n) => baseUnit({ originGroupId: `dup-id-${n}` }));
  const groups = [declaredGroup("same-id", units.slice(0, 2)), declaredGroup("same-id", units.slice(2))];
  assertRejection(
    baseCandidate({ observationUnits: units, declaredDependence: { groups } }),
    5,
    "REJ_DEPENDENCE_INVALID",
    /^declaredDependence\.groups\[\d+\]\.dependenceClusterId#duplicate$/u,
  );
});

check("O-ORIGIN", "same origin with different load-bearing payloads is Stage 5", () => {
  const a = baseUnit({ originGroupId: "same-origin", clusterState: "UNKNOWN" });
  const b = baseUnit({ originGroupId: "same-origin", clusterState: "INAPPLICABLE" });
  assertRejection(
    baseCandidate({ observationUnits: [a, b] }),
    5,
    "REJ_DEPENDENCE_INVALID",
    'observationUnits.originGroupId["same-origin"]',
  );
});

// P: G1-G8 structural group and Sigma counterexamples.
check("P-G1", "G1 singleton uses the common membership-bound group-id law", () => {
  const unit = baseUnit();
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  const expected = expectedDigest("MD2-STRUCTURAL-GROUP-CORR6", canonicalSerialize([unitId(unit)]));
  assert.equal(output.structuralEvidenceGroups.length, 1);
  assert.equal(output.structuralEvidenceGroups[0].structuralEvidenceGroupId, expected);
  assert.deepEqual(sigmaEntry(output, "A4-S01").structuralEvidenceGroupIds, [expected]);
});

check("P-G2", "G2 declared pair uses membership only", () => {
  const a = baseUnit({ originGroupId: "g2-a" });
  const b = baseUnit({ originGroupId: "g2-b" });
  const group = declaredGroup("caller-g2", [a, b]);
  const output = valid(baseCandidate({ observationUnits: [a, b], declaredDependence: { groups: [group] } }));
  const expectedMembers = canonicalSort([unitId(a), unitId(b)]);
  const expected = expectedDigest("MD2-STRUCTURAL-GROUP-CORR6", canonicalSerialize(expectedMembers));
  assert.equal(output.structuralEvidenceGroups[0].structuralEvidenceGroupId, expected);
});

check("P-G3", "G3 member and unit order do not change group or output identity", () => {
  const a = baseUnit({ originGroupId: "g3-a", annotationIds: ["ann-2", "ann-1"] });
  const b = baseUnit({ originGroupId: "g3-b" });
  const left = baseCandidate({
    observationUnits: [a, b],
    declaredDependence: { groups: [declaredGroup("g3", [a, b])] },
  });
  const right = baseCandidate({
    observationUnits: [{ ...b }, { ...a, annotationIds: ["ann-1", "ann-2"] }],
    declaredDependence: { groups: [declaredGroup("g3", [b, { ...a, annotationIds: ["ann-1", "ann-2"] }])] },
  });
  const outLeft = valid(left);
  const outRight = valid(right);
  assert.equal(outLeft.structuralEvidenceGroups[0].structuralEvidenceGroupId, outRight.structuralEvidenceGroups[0].structuralEvidenceGroupId);
  assert.equal(outLeft.md2OutputId, outRight.md2OutputId);
});

check("P-G4", "G4 membership mutation changes group and dependence identity", () => {
  const a = baseUnit({ originGroupId: "g4-a" });
  const b = baseUnit({ originGroupId: "g4-b" });
  const c = baseUnit({ originGroupId: "g4-c" });
  const left = valid(baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups: [declaredGroup("g4", [a, b])] } }));
  const right = valid(baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups: [declaredGroup("g4", [a, c])] } }));
  const leftPair = left.structuralEvidenceGroups.find((group) => group.memberUnitIds.length === 2);
  const rightPair = right.structuralEvidenceGroups.find((group) => group.memberUnitIds.length === 2);
  const leftSingleton = left.structuralEvidenceGroups.find((group) => group.memberUnitIds.length === 1);
  const rightSingleton = right.structuralEvidenceGroups.find((group) => group.memberUnitIds.length === 1);
  assert.ok(leftPair);
  assert.ok(rightPair);
  assert.ok(leftSingleton);
  assert.ok(rightSingleton);
  assert.equal(left.structuralEvidenceGroups.length, 2);
  assert.equal(right.structuralEvidenceGroups.length, 2);
  assert.deepEqual(leftSingleton.memberUnitIds, [unitId(c)]);
  assert.deepEqual(rightSingleton.memberUnitIds, [unitId(b)]);
  assert.notEqual(leftPair.structuralEvidenceGroupId, rightPair.structuralEvidenceGroupId);
  assert.notEqual(left.dependenceStructureId, right.dependenceStructureId);
  assert.notDeepEqual(left.structuralEvidenceGroups, right.structuralEvidenceGroups);
});

check("P-G5", "G5 caller group rename cannot author semantic group identity", () => {
  const a = baseUnit({ originGroupId: "g5-a" });
  const b = baseUnit({ originGroupId: "g5-b" });
  const candidate = (id) => baseCandidate({
    observationUnits: [a, b],
    declaredDependence: { groups: [declaredGroup(id, [a, b])] },
  });
  const left = valid(candidate("A"));
  const right = valid(candidate("B"));
  assert.deepEqual(left.structuralEvidenceGroups, right.structuralEvidenceGroups);
  assert.equal(left.dependenceStructureId, right.dependenceStructureId);
  assert.equal(left.md2OutputId, right.md2OutputId);
});

check("P-G5-ORIGIN-INFO", "declared originGroupIds are informational and identity-inert", () => {
  const a = baseUnit({ originGroupId: "g5-origin-a" });
  const b = baseUnit({ originGroupId: "g5-origin-b" });
  const memberUnitIds = [unitId(a), unitId(b)];
  const candidate = (group) => baseCandidate({
    observationUnits: [a, b],
    declaredDependence: { groups: [group] },
  });
  const absent = valid(candidate({ dependenceClusterId: "g5-origin", memberUnitIds }));
  const matching = valid(candidate({
    dependenceClusterId: "g5-origin",
    memberUnitIds,
    originGroupIds: [a.originGroupId, b.originGroupId],
  }));
  const arbitrary = valid(candidate({
    dependenceClusterId: "g5-origin",
    memberUnitIds,
    originGroupIds: ["informational-only"],
  }));
  assert.deepEqual(absent.structuralEvidenceGroups, matching.structuralEvidenceGroups);
  assert.deepEqual(absent.structuralEvidenceGroups, arbitrary.structuralEvidenceGroups);
  assert.equal(absent.dependenceStructureId, matching.dependenceStructureId);
  assert.equal(absent.dependenceStructureId, arbitrary.dependenceStructureId);
  assert.equal(absent.md2OutputId, matching.md2OutputId);
  assert.equal(absent.md2OutputId, arbitrary.md2OutputId);
});

check("P-G6", "G6 one mixed-family group id appears in both Sigma entries", () => {
  const s01 = baseUnit({ originGroupId: "g6-s01" });
  const s02 = baseUnit({ originGroupId: "g6-s02", mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION" });
  const group = declaredGroup("g6-mixed", [s01, s02]);
  const output = valid(baseCandidate({ observationUnits: [s01, s02], declaredDependence: { groups: [group] } }));
  const groupId = output.structuralEvidenceGroups[0].structuralEvidenceGroupId;
  assert.deepEqual(sigmaEntry(output, "A4-S01").structuralEvidenceGroupIds, [groupId]);
  assert.deepEqual(sigmaEntry(output, "A4-S02").structuralEvidenceGroupIds, [groupId]);
});

check("P-G7", "G7 pinned plus unpinned preserves group provenance without evidence leakage", () => {
  const pinned = baseUnit({ originGroupId: "g7-pinned", annotationIds: ["ann-pinned"] });
  const unpinned = baseUnit({
    originGroupId: "g7-unpinned",
    mechanismFamilyId: "UNPINNED_FAMILY",
    annotationIds: ["ann-unpinned"],
  });
  const group = declaredGroup("g7", [pinned, unpinned]);
  const output = valid(baseCandidate({ observationUnits: [pinned, unpinned], declaredDependence: { groups: [group] } }));
  const entry = sigmaEntry(output, "A4-S01");
  assert.deepEqual(entry.unitIdsEvaluated, [unitId(pinned)]);
  assert.deepEqual(entry.annotationIds, ["ann-pinned"]);
  assert.deepEqual(output.nonPinnedUnitIds, [unitId(unpinned)]);
  assert.deepEqual(entry.structuralEvidenceGroupIds, [output.structuralEvidenceGroups[0].structuralEvidenceGroupId]);
});

check("P-G8", "G8 group with no evaluated member is absent for that rule", () => {
  const a = baseUnit({ originGroupId: "g8-a", mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION" });
  const b = baseUnit({ originGroupId: "g8-b", mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION" });
  const group = declaredGroup("g8", [a, b]);
  const output = valid(baseCandidate({ observationUnits: [a, b], declaredDependence: { groups: [group] } }));
  assert.deepEqual(sigmaEntry(output, "A4-S01").structuralEvidenceGroupIds, []);
  assert.equal(sigmaEntry(output, "A4-S02").structuralEvidenceGroupIds.length, 1);
});

// Q-S: explicit mixed-family/unpinned non-regression beyond group membership.
check("Q", "mixed-family group keeps cell evaluation family-local", () => {
  const s01 = baseUnit({ originGroupId: "q-s01", clusterState: "ESTABLISHED", O_flag: true, atomIds: ["q-a"] });
  const s02 = baseUnit({
    originGroupId: "q-s02",
    mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
    clusterState: "INAPPLICABLE",
  });
  const output = valid(baseCandidate({ observationUnits: [s01, s02], declaredDependence: { groups: [declaredGroup("q", [s01, s02])] } }));
  assert.equal(sigmaEntry(output, "A4-S01").structuralResult, "SUPPORT");
  assert.equal(sigmaEntry(output, "A4-S02").structuralResult, "INAPPLICABLE");
});

check("R", "pinned plus unpinned group binds whole membership", () => {
  const pinned = baseUnit({ originGroupId: "r-pin" });
  const unpinned = baseUnit({ originGroupId: "r-unpin", mechanismFamilyId: "OTHER" });
  const output = valid(baseCandidate({ observationUnits: [pinned, unpinned], declaredDependence: { groups: [declaredGroup("r", [pinned, unpinned])] } }));
  const expectedMembers = canonicalSort([unitId(pinned), unitId(unpinned)]);
  assert.deepEqual(output.structuralEvidenceGroups[0].memberUnitIds, expectedMembers);
});

check("S", "non-pinned units make no cell and leak no annotations", () => {
  const unit = baseUnit({ mechanismFamilyId: "OTHER", annotationIds: ["should-not-leak"], clusterState: "CONFLICTED", conflictFlag: true });
  const output = valid(baseCandidate({ observationUnits: [unit] }));
  assert.deepEqual(output.nonPinnedUnitIds, [unitId(unit)]);
  for (const entry of output.sigma) {
    assert.equal(entry.structuralResult, "UNKNOWN");
    assert.deepEqual(entry.unitIdsEvaluated, []);
    assert.deepEqual(entry.annotationIds, []);
    assert.equal(entry.conflictState, false);
  }
  assert.equal(output.status, "NOT_DETERMINABLE");
});

check("T", "Sigma contains exactly the two pinned evaluation keys", () => {
  const output = valid(baseCandidate({ observationUnits: [baseUnit({ mechanismFamilyId: "OTHER" })] }));
  assert.equal(output.sigma.length, 2);
  assert.deepEqual(canonicalSort(output.sigma.map((row) => row.evaluationKey)), ["A4-S01", "A4-S02"]);
});

// U-V: rule-semantic payload is hashed; traceability is inert.
check("U", "rule-semantic mutation changes relationLibraryId", () => {
  const semantic = structuredClone(_md2Conformance.pinnedRelationLibrarySemantic);
  semantic[0].contradiction_behavior = `${semantic[0].contradiction_behavior} MUTATED`;
  const base = _md2Conformance.deriveRelationLibraryArtifacts({
    semantic: _md2Conformance.pinnedRelationLibrarySemantic,
    traceability: _md2Conformance.pinnedRelationLibraryTraceability,
  });
  const changed = _md2Conformance.deriveRelationLibraryArtifacts({
    semantic,
    traceability: _md2Conformance.pinnedRelationLibraryTraceability,
  });
  assert.notEqual(base.relationLibraryId, changed.relationLibraryId);
});

check("V", "traceability-only mutation cannot change relationLibraryId", () => {
  const traceability = structuredClone(_md2Conformance.pinnedRelationLibraryTraceability);
  traceability.ownerStatus = "TRACEABILITY MUTATION ONLY";
  const base = _md2Conformance.deriveRelationLibraryArtifacts({
    semantic: _md2Conformance.pinnedRelationLibrarySemantic,
    traceability: _md2Conformance.pinnedRelationLibraryTraceability,
  });
  const changed = _md2Conformance.deriveRelationLibraryArtifacts({
    semantic: _md2Conformance.pinnedRelationLibrarySemantic,
    traceability,
  });
  assert.equal(base.relationLibraryId, changed.relationLibraryId);
});

// W-X: ordering neutrality and membership sensitivity across identities.
check("W", "set/list ordering is neutral across the complete valid output identity", () => {
  const a = baseUnit({ originGroupId: "w-a", atomIds: ["atom-z", "atom-a"], annotationIds: ["ann-z", "ann-a"] });
  const b = baseUnit({ originGroupId: "w-b", mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION" });
  const c = baseUnit({ originGroupId: "w-c", mechanismFamilyId: "OTHER" });
  const leftGroup = { dependenceClusterId: "w", memberUnitIds: [unitId(a), unitId(b)], originGroupIds: ["w-b", "w-a"] };
  const rightA = { ...a, atomIds: ["atom-a", "atom-z"], annotationIds: ["ann-a", "ann-z"] };
  const rightGroup = { dependenceClusterId: "w", memberUnitIds: [unitId(b), unitId(rightA)], originGroupIds: ["w-a", "w-b"] };
  const left = valid(baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups: [leftGroup] } }));
  const right = valid(baseCandidate({ observationUnits: [c, b, rightA], declaredDependence: { groups: [rightGroup] } }));
  assert.equal(left.md2OutputId, right.md2OutputId);
  assert.equal(left.packageId, right.packageId);
  assert.equal(left.structuralEvidenceDigest, right.structuralEvidenceDigest);
});

check("X", "structural membership mutation changes group, dependence, Sigma, and output identities", () => {
  const a = baseUnit({ originGroupId: "x-a" });
  const b = baseUnit({ originGroupId: "x-b" });
  const c = baseUnit({ originGroupId: "x-c" });
  const left = valid(baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups: [declaredGroup("x", [a, b])] } }));
  const right = valid(baseCandidate({ observationUnits: [a, b, c], declaredDependence: { groups: [declaredGroup("x", [a, c])] } }));
  assert.notEqual(left.dependenceStructureId, right.dependenceStructureId);
  assert.notEqual(left.structuralEvidenceDigest, right.structuralEvidenceDigest);
  assert.notEqual(left.md2OutputId, right.md2OutputId);
});

check("Y", "same invalid input yields the same rejection identity", () => {
  const candidate = baseCandidate({ sideId: "BUYER" });
  assert.equal(rejected(candidate).rejectionId, rejected(structuredClone(candidate)).rejectionId);
});

check("Y-ORDER", "ordering-only invalid input mutation leaves rejection identity unchanged", () => {
  const left = baseCandidate({ observationUnits: ["z narrative", "a narrative"] });
  const right = baseCandidate({ observationUnits: ["a narrative", "z narrative"] });
  assert.equal(rejected(left).rejectionId, rejected(right).rejectionId);
});

check("Y-CONTENT", "canonical invalid-content mutation changes rejection identity", () => {
  const left = rejected(baseCandidate({ sideId: "BUYER" }));
  const right = rejected(baseCandidate({ sideId: "SELLER" }));
  assert.notEqual(left.canonicalPreValidationInputDigest, right.canonicalPreValidationInputDigest);
  assert.notEqual(left.rejectionId, right.rejectionId);
});

check("Z", "same valid canonical input yields the same output identity", () => {
  const candidate = baseCandidate({ observationUnits: [baseUnit()] });
  assert.equal(valid(candidate).md2OutputId, valid(structuredClone(candidate)).md2OutputId);
});

// AA-AK: forbidden surfaces, unreachable states, constants, exact identities, and firewall.
check("AA", "caller Relation Library variants are rejected", () => {
  for (const extra of [{ relationLibrary: [] }, { ruleList: [] }, { authorityClass: "ACCEPTED" }]) {
    assertRejection(baseCandidate(extra), 1, "REJ_CALLER_RL_SUBSTITUTION");
  }
});

check("AB", "caller EXCLUDES and certificate surfaces are rejected", () => {
  for (const extra of [{ EXCLUDES: [] }, { certificate: {} }]) {
    assertRejection(baseCandidate(extra), 1, "REJ_FORBIDDEN_EXCLUDES_OR_CERTIFICATE");
  }
});

check("AC", "Prior, DPT, and LR inputs are rejected", () => {
  for (const extra of [{ Prior: {} }, { DPT: {} }, { LR: [] }]) {
    assertRejection(baseCandidate(extra), 1, "REJ_FORBIDDEN_PROBABILISTIC_INPUT");
  }
});

check("AD", "calibration activation inputs are rejected", () => {
  for (const extra of [{ calibrationMode: "ACTIVE" }, { calibrationActivation: true }]) {
    assertRejection(baseCandidate(extra), 1, "REJ_FORBIDDEN_CALIBRATION_INPUT");
  }
});

check("AE-AF", "DETERMINATE and HYPOTHESIS_WITH_MATERIAL_ALTERNATIVE are unreachable", () => {
  const outputs = [
    valid(baseCandidate()),
    valid(baseCandidate({ observationUnits: [baseUnit({ clusterState: "ESTABLISHED", O_flag: true, atomIds: ["atom"] })] })),
    valid(baseCandidate({ observationUnits: [baseUnit({ clusterState: "CONFLICTED", conflictFlag: true })] })),
  ];
  for (const output of outputs) {
    assert.notEqual(output.status, "DETERMINATE");
    assert.notEqual(output.status, "HYPOTHESIS_WITH_MATERIAL_ALTERNATIVE");
  }
});

check("AG-AJ", "every valid result carries the frozen E9/non-activation constants", () => {
  const output = valid(baseCandidate({ observationUnits: [baseUnit()] }));
  assert.deepEqual(output.C_H, EXPECTED_E9);
  assert.deepEqual(canonicalSort(_md2Conformance.e9), EXPECTED_E9);
  assert.equal(output.C_H.length, 9);
  assert.equal(output.environmentBinding, "NONE");
  assert.equal(output.strongestAlternativeStatus, "UNRESOLVED");
  assert.deepEqual(output.strongestAlternativeSet, []);
  assert.equal(output.calibrationMode, "DORMANT");
  assert.equal(output.calibrationAuthorityId, "DORMANT");
  assert.equal(output.authorityExecutionClass, "METHODOLOGY_CANDIDATE_EXECUTION");
  assert.deepEqual(output.determinationChecklist, EXPECTED_CHECKLIST);
  assert.equal(Object.hasOwn(output, "md2SemanticOutputEligible"), false);
  assert.equal(Object.hasOwn(output, "coreConsumable"), false);
});

check("ID-RL", "relationLibraryId uses exact CORR6 domain-plus-canonical bytes", () => {
  const output = valid(baseCandidate());
  assert.equal(
    canonicalSerialize(_md2Conformance.pinnedRelationLibrarySemantic),
    canonicalSerialize(EXPECTED_PINNED_RULES),
  );
  assert.equal(
    output.relationLibraryId,
    expectedDigest("MD2-RL-CORR6", canonicalSerialize(EXPECTED_PINNED_RULES)),
  );
});

check("ID-CHAIN", "valid identity chain uses every exact CORR6 domain and ordered output component", () => {
  const unit = baseUnit({ annotationIds: ["ann"], clusterState: "ESTABLISHED", O_flag: true, atomIds: ["atom"] });
  const candidate = baseCandidate({ observationUnits: [unit] });
  const output = valid(candidate);
  const expectedFormationCarrierId = expectedDigest(
    "MD2-FC-CORR6",
    canonicalSerialize(candidate.formationCarrier),
  );
  const expectedUnitId = expectedDigest("MD2-UNIT-CORR6", canonicalSerialize(unit));
  const expectedRetainedUnit = { unitId: expectedUnitId, ...unit };
  const expectedGroupMembers = [expectedUnitId];
  const expectedGroupId = expectedDigest(
    "MD2-STRUCTURAL-GROUP-CORR6",
    canonicalSerialize(expectedGroupMembers),
  );
  const expectedGroups = [{
    structuralEvidenceGroupId: expectedGroupId,
    memberUnitIds: expectedGroupMembers,
  }];
  const expectedDependenceStructureId = expectedDigest(
    "MD2-DEP-CORR6",
    canonicalSerialize(expectedGroups),
  );
  const packagePayload = {
    g0Id: candidate.g0Id,
    sideId: candidate.sideId,
    factualSealId: candidate.factualSealId,
    domainId: candidate.domainId,
    intervalId: candidate.intervalId,
    formationCarrierId: expectedFormationCarrierId,
    dependenceStructureId: expectedDependenceStructureId,
    retainedUnits: [expectedRetainedUnit],
  };
  const expectedPackageId = expectedDigest("MD2-PKG-CORR6", canonicalSerialize(packagePayload));
  const expectedSigma = canonicalSort([
    {
      evaluationKey: "A4-S01",
      mechanismFamilyId: "TECHNOLOGY_RESOURCE_COMPETITION",
      environment: "NT/STJ",
      structuralResult: "SUPPORT",
      unitIdsEvaluated: [expectedUnitId],
      structuralEvidenceGroupIds: [expectedGroupId],
      annotationIds: ["ann"],
      conflictState: false,
    },
    {
      evaluationKey: "A4-S02",
      mechanismFamilyId: "RELATION_MEDIATED_RESOURCE_PRESERVATION",
      environment: "SFJ/SFP",
      structuralResult: "UNKNOWN",
      unitIdsEvaluated: [],
      structuralEvidenceGroupIds: [],
      annotationIds: [],
      conflictState: false,
    },
  ]);
  const expectedStructuralEvidenceDigest = expectedDigest(
    "MD2-SIGMA-CORR6",
    canonicalSerialize(expectedSigma),
  );
  const expectedRelationLibraryId = expectedDigest(
    "MD2-RL-CORR6",
    canonicalSerialize(EXPECTED_PINNED_RULES),
  );
  const conflictState = canonicalSort(expectedSigma.map((entry) => ({
    evaluationKey: entry.evaluationKey,
    conflictState: entry.conflictState,
  })));
  const expectedOutputId = expectedDigest(
    "MD2-OUT-CORR6",
    "v0.1.CORR6",
    expectedRelationLibraryId,
    expectedPackageId,
    expectedFormationCarrierId,
    expectedDependenceStructureId,
    expectedStructuralEvidenceDigest,
    canonicalSerialize([]),
    "DORMANT",
    "DORMANT",
    "METHODOLOGY_CANDIDATE_EXECUTION",
    candidate.g0Id,
    candidate.sideId,
    candidate.factualSealId,
    candidate.domainId,
    candidate.intervalId,
    canonicalSerialize(EXPECTED_E9),
    "NOT_DETERMINABLE",
    "NOT_DETERMINABLE_STRUCTURAL_SUPPORT_ONLY",
    canonicalSerialize("NONE"),
    "UNRESOLVED",
    canonicalSerialize([]),
    canonicalSerialize(EXPECTED_CHECKLIST),
    canonicalSerialize(conflictState),
  );

  assert.equal(output.formationCarrierId, expectedFormationCarrierId);
  assert.equal(unitId(unit), expectedUnitId);
  assert.deepEqual(output.retainedUnits, [expectedRetainedUnit]);
  assert.deepEqual(output.structuralEvidenceGroups, expectedGroups);
  assert.equal(output.dependenceStructureId, expectedDependenceStructureId);
  assert.equal(output.packageId, expectedPackageId);
  assert.deepEqual(output.sigma, expectedSigma);
  assert.equal(output.structuralEvidenceDigest, expectedStructuralEvidenceDigest);
  assert.equal(output.md2OutputId, expectedOutputId);
});

check("ID-REJECTION", "rejection identity uses exact CORR6 ordered components", () => {
  const candidate = baseCandidate({ sideId: "BUYER" });
  const rejection = rejected(candidate);
  const expectedPrevalidation = expectedDigest(
    "MD2-PREVAL-CORR6",
    canonicalSerialize(candidate),
  );
  assert.equal(rejection.canonicalPreValidationInputDigest, expectedPrevalidation);
  assert.equal(rejection.rejectionId, expectedDigest(
    "MD2-REJECTION-CORR6",
    "v0.1.CORR6",
    rejection.canonicalPreValidationInputDigest,
    canonicalSerialize(rejection.primaryFinding),
    canonicalSerialize(rejection.secondaryFindings),
  ));
});

check("AK", "MD-2 remains a native export with no MB-ENV/core/product side effects", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const md2Source = readFileSync(`${root}/src/historical/md2.js`, "utf8");
  const indexSource = readFileSync(`${root}/src/historical/index.js`, "utf8");

  function sourceFiles(directory) {
    const files = [];
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) files.push(...sourceFiles(path));
      else if (/\.(?:[cm]?[jt]sx?)$/u.test(entry.name)) files.push(path);
    }
    return files;
  }

  for (const forbidden of [
    "compileSemanticBindings(",
    "markCoreConsumable(",
    "buildFinalDeliverable(",
    "buildMergevuePublicReportModel(",
    "createHistoricalRuntime(",
  ]) {
    assert.equal(md2Source.includes(forbidden), false, `forbidden MD-2 call ${forbidden}`);
  }
  assert.equal(
    indexSource.match(/export \{ executeMd2 \} from "\.\/md2\.js";/gu)?.length,
    1,
    "barrel must contain exactly one native MD-2 re-export",
  );
  assert.equal(indexSource.includes("executeMd2("), false, "barrel must not invoke MD-2");

  for (const productionRoot of [`${root}/src`, `${root}/api`, `${root}/scripts`]) {
    for (const path of sourceFiles(productionRoot)) {
      if (
        path.endsWith("/historical/md2.js")
        || path.endsWith("/historical/index.js")
        || path.endsWith("/scripts/validate-md2-offline.mjs")
      ) continue;
      const source = readFileSync(path, "utf8");
      assert.equal(source.includes("executeMd2"), false, `unauthorized MD-2 consumer/export in ${path}`);
      assert.equal(source.includes('/md2.js'), false, `unauthorized MD-2 module import in ${path}`);
    }
  }

  const importStatements = md2Source.match(/^import .*;$/gmu) ?? [];
  const importSpecifiers = importStatements.map((statement) => statement.match(/ from "([^"]+)";$/u)?.[1]);
  assert.deepEqual(importSpecifiers, ["../agent/canonicalDigest.js", "./canonical.js"]);

  for (const forbidden of [
    "node:fs",
    "node:http",
    "fetch(",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "telemetry",
  ]) {
    assert.equal(md2Source.includes(forbidden), false, `forbidden side-effect surface ${forbidden}`);
  }
});

const failedRows = results.filter((row) => row.status === "FAIL");
for (const row of results) {
  console.log(`${row.status}  ${row.id}  ${row.name}${row.status === "FAIL" ? `  :: ${row.error}` : ""}`);
}

const definition = _md2Conformance.deriveRelationLibraryArtifacts({
  semantic: _md2Conformance.pinnedRelationLibrarySemantic,
  traceability: _md2Conformance.pinnedRelationLibraryTraceability,
});
const summary = {
  total: results.length,
  passed: results.length - failedRows.length,
  failed: failedRows.length,
  operatorVersion: _md2Conformance.operatorVersion,
  relationLibraryId: definition.relationLibraryId,
  status: failedRows.length === 0 ? "PASS" : "FAIL",
};

console.log(`\n${JSON.stringify(summary)}`);
console.log(`${summary.status} ${summary.passed}/${summary.total} MD-2 conformance checks for ${summary.operatorVersion} (${summary.relationLibraryId})`);

if (summary.failed > 0) {
  for (const row of failedRows) console.error(`\n${row.id}\n${row.stack}`);
  process.exit(1);
}
