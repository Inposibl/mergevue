import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  CANONICAL_RECORD_KEYS,
  CANONICAL_CATEGORIES,
  CANONICAL_CASE_IDS,
  EXPECTED_TARGET_FAMILIES,
  EXPECTED_TARGET_FAMILY_MATRIX,
  EXPECTED_SUBRULE_MATRIX,
  EXPECTED_TEXT_AUTHORITY_DIGESTS,
  EXPECTED_APPLICABILITY_MATRIX_DIGEST,
  EXPECTED_TARGET_FAMILIES_DIGEST,
  EXPECTED_APPLICABILITY_SOURCE_SHA256,
  EXPECTED_RECORD_DIGESTS,
  CANONICAL_CORPUS_DIGEST,
  FROZEN_LAWFUL_TEXT,
  FROZEN_ADVERSARIAL_TEXT,
  FROZEN_INVARIANT_TEXT,
  FROZEN_EXECUTION_SPECS,
  FROZEN_EXECUTION_SPECS_DIGEST,
  materializeExpectedRecords,
  loadObservedFixtures,
} from "./fixtures/agent-semantic-conformance-corpus.mjs";

import { createHash } from "node:crypto";
import { canonicalSerialize, sha256PrefixedDigest } from "../src/agent/canonicalDigest.js";
import { SEMANTIC_TARGET_FAMILIES, SEMANTIC_VIOLATION_CODES } from "../src/agent/semanticValidatorConstants.js";
import { SEMANTIC_APPLICABILITY_MATRIX, getSemanticSubrule } from "../src/agent/semanticApplicability.js";
import { locallyEvaluateSemanticSubrule, evaluateDeterministicChecks } from "../src/agent/semanticLocalEvaluator.js";
import { buildSemanticCheckSet, enumerateSemanticTargets, partitionChecks } from "../src/agent/semanticCheckEnumerator.js";
import { createMockSemanticJudge, invokeSemanticJudge } from "../src/agent/semanticJudge.js";
import { validateAgentInterpretationSemantics } from "../src/agent/semanticValidator.js";
import { proveSemanticProtocolIntegrity } from "../src/agent/semanticCompleteness.js";
import { buildSemanticJudgePackets } from "../src/agent/semanticJudgePacket.js";
import {
  SemanticEvaluatorIncapacityError,
  SemanticProtocolError,
  SemanticValidationError,
  SemanticViolationError,
} from "../src/agent/semanticValidationError.js";
import { SYSTEM_FAILURE_CLASSES, SYSTEM_FAILURE_RETRYABLE_BY_CLASS } from "../src/agent/agentContractConstants.js";
import {
  mapSemanticValidationErrorToSystemFailure,
  mapSemanticJudgeTransportErrorToSystemFailure,
  SemanticSystemFailureMappingError,
} from "../src/agent/semanticSystemFailure.js";
import { buildSemanticJudgePacket } from "../src/agent/semanticJudgePacket.js";
import {
  executeXaiSemanticJudge,
  buildXaiSemanticJudgeRequestBody,
} from "../src/agent/semanticJudgeTransport.js";
import {
  SEMANTIC_JUDGE_MODEL,
  XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH,
} from "../src/agent/semanticJudgeTransportConstants.js";
import {
  SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES,
  SemanticJudgeTransportError,
} from "../src/agent/semanticJudgeTransportError.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const ALL_SUBRULES = EXPECTED_SUBRULE_MATRIX.map((row) => row.subruleId);
const SINGLE_ONLY_SUBRULES = Object.freeze(ALL_SUBRULES.slice(22));

function pass(id, label) {
  results.push({ id, label, status: "PASS" });
}

async function check(id, label, fn) {
  await fn();
  pass(id, label);
}

function deepClone(value) {
  return structuredClone(value);
}

function assertDeepFrozen(value, path = "root") {
  if (value === null || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true, path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDeepFrozen(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${path}.${key}`);
}

function lawfulVerdictItem(check, resolved = {}) {
  const verdict = resolved.verdict ?? "PASS";
  const reasonCode = resolved.reasonCode
    ?? (verdict === "PASS" ? "RULE_SATISFIED" : verdict === "FAIL" ? "RULE_VIOLATED" : "AUTHORITY_ABSENT");
  const violationCode = Object.hasOwn(resolved, "violationCode")
    ? resolved.violationCode
    : (verdict === "FAIL" ? (getSemanticSubrule(check.semanticSubruleId)?.failureViolationCode ?? null) : null);
  const supportingAuthorityIds = resolved.supportingAuthorityIds
    ?? (check.authorityIds.length > 0 ? [check.authorityIds[0]] : []);
  return {
    checkId: check.checkId,
    ruleId: resolved.ruleId ?? check.ruleId,
    targetLocator: resolved.targetLocator ?? check.targetLocator,
    verdict,
    violationCode,
    reasonCode,
    supportingAuthorityIds,
  };
}

function protocolJudge(packetHandler) {
  return async function discriminatingProtocolJudge(packet) {
    return packetHandler(packet);
  };
}

function setLocator(root, locator, text) {
  const token = locator.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cursor = root;
  for (let i = 0; i < token.length - 1; i += 1) {
    const key = token[i];
    if (Array.isArray(cursor)) {
      const asIndex = Number(key);
      if (Number.isInteger(asIndex) && String(asIndex) === key) {
        cursor = cursor[asIndex];
        continue;
      }
      cursor = cursor.find((row) => row?.claimId === key || row?.hypothesisId === key || row?.sectionId === key) ?? cursor;
      continue;
    }
    if (cursor[key] === undefined && Array.isArray(cursor.items)) {
      cursor = cursor.items.find((row) => row.hypothesisId === key) ?? cursor[key];
      continue;
    }
    cursor = cursor[key];
  }
  const last = token[token.length - 1];
  cursor[last] = text;
}

function applyOverride(result, override) {
  if (!override) return result;
  const clone = deepClone(result);
  for (const [locator, text] of Object.entries(override)) setLocator(clone, locator, text);
  return clone;
}

function applyStructural(fixture, spec) {
  const request = deepClone(fixture.request);
  const result = deepClone(fixture.result);
  if (spec?.fixtureStructuralOverride === "CLEAR_DISCLOSURES") result.uncertainty.disclosures = [];
  if (spec?.fixtureStructuralOverride === "UNLAWFUL_ABSTENTION") {
    result.interpretationStatus = "ABSTAINED_INSUFFICIENT_EVIDENCE";
    result.abstentionReason = "NO_SURVIVING_ADMISSIBLE_EVIDENCE";
  }
  return { request, result };
}

function applicableSet(cSet, family, locator) {
  return [...new Set(cSet.filter((row) => row.targetFamily === family && row.targetLocator === locator).map((row) => row.semanticSubruleId))];
}

function allPassJudge() {
  return createMockSemanticJudge(() => ({ verdict: "PASS" }));
}

function targetedFailJudge(subruleId, locator) {
  return createMockSemanticJudge((check) => (
    check.semanticSubruleId === subruleId && (!locator || check.targetLocator === locator)
      ? { verdict: "FAIL" }
      : { verdict: "PASS" }
  ));
}

async function runSemantics(request, result, judge, maxChecksPerBatch = 100) {
  return validateAgentInterpretationSemantics({
    agentInterpretationRequest: request,
    agentInterpretationResult: result,
    semanticJudge: judge,
    maxChecksPerBatch,
  });
}

async function expectClass(fn, Class) {
  try {
    await fn();
  } catch (error) {
    assert.equal(error instanceof Class, true, `expected ${Class.name}, got ${error?.constructor?.name}: ${error?.message}`);
    return error;
  }
  assert.fail(`expected ${Class.name}`);
}

function makeTransportCheck(index) {
  const id = String(index + 1).padStart(3, "0");
  return {
    checkId: `sha256:check-${id}`,
    ruleId: "V-02",
    semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
    targetFamily: "CLAIM_TEXT",
    targetLocator: `claims[${index}].text`,
    expectedInvariant: "invariant",
    allowedSemanticInterpretations: ["allowed"],
    forbiddenSemanticImplications: ["forbidden"],
    authorityIds: [`ENGINE_FACT:fact-${id}`],
    authorities: [{ kind: "ENGINE_FACT", id: `fact-${id}`, value: { index } }],
    target: { targetFamily: "CLAIM_TEXT", targetLocator: `claims[${index}].text`, targetDigest: `sha256:d-${id}`, text: `t${id}`, metadata: {} },
  };
}

function makePacket(n) {
  return buildSemanticJudgePacket({
    checks: Array.from({ length: n }, (_, index) => makeTransportCheck(index)),
    batchIndex: 0,
    batchCount: 1,
  });
}

function lawfulVerdicts(packet) {
  return packet.checks.map((check) => ({
    checkId: check.checkId,
    ruleId: check.ruleId,
    targetLocator: check.targetLocator,
    verdict: "PASS",
    violationCode: null,
    reasonCode: "RULE_SATISFIED",
    supportingAuthorityIds: [...check.authorityIds],
  }));
}

function completedResponse(verdicts, extra = []) {
  return {
    id: "resp_j4",
    object: "response",
    status: "completed",
    error: null,
    model: SEMANTIC_JUDGE_MODEL,
    output: [
      ...extra,
      { type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text: JSON.stringify(verdicts) }] },
    ],
  };
}

function capturingFetch(responder) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return responder(url, init, calls);
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

async function execTransport(packet, responder, extras = {}) {
  const fetchImpl = capturingFetch(responder);
  const args = {
    systemInstruction: extras.systemInstruction ?? "J4-SYSTEM",
    judgePacket: packet,
    fetchImpl,
    credentialReader: extras.credentialReader ?? (() => "xai-test-key-J4"),
  };
  if (!Object.hasOwn(extras, "omitSubmitted") || extras.omitSubmitted !== true) {
    args.submittedChecks = extras.submittedChecks ?? packet.checks;
  }
  try {
    return { result: await executeXaiSemanticJudge(args), calls: fetchImpl.calls, error: null };
  } catch (error) {
    return { result: null, calls: fetchImpl.calls, error };
  }
}

function jsonResponse(status, body) {
  return {
    status,
    json: async () => {
      if (typeof body === "string") throw new SyntaxError("bad");
      return body;
    },
  };
}

function constructMappedError(spec, request) {
  if (spec === "SM-01" || spec === "IN-01" || spec === "IN-08") {
    return new SemanticViolationError({ violationCode: "OUTPUT_SCHEMA_VIOLATION", detail: "x", findings: [{ ruleId: "V-30", semanticSubruleId: "V-30-SEM-COEQUAL-PREFERENCE", targetLocator: "claims.CL-001.text", violationCode: "OUTPUT_SCHEMA_VIOLATION", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }] });
  }
  if (spec === "SM-02" || spec === "IN-02") {
    return new SemanticViolationError({ violationCode: "GROUNDING_VALIDATION_FAILURE", detail: "x", findings: [{ ruleId: "V-04", semanticSubruleId: "V-04-SEM-GROUNDING", targetLocator: "claims.CL-001.text", violationCode: "GROUNDING_VALIDATION_FAILURE", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }] });
  }
  if (spec === "SM-03" || spec === "SM-16" || spec === "IN-03") {
    return new SemanticViolationError({ violationCode: "PROHIBITED_CLAIM_VIOLATION", detail: "x", findings: [{ ruleId: "V-13", semanticSubruleId: "V-13-SEM-PROBABILITY", targetLocator: "claims.CL-001.text", violationCode: "PROHIBITED_CLAIM_VIOLATION", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }] });
  }
  if (spec === "SM-04" || spec === "IN-04") {
    return new SemanticViolationError({ violationCode: "ENGINE_FACT_MUTATION_DETECTED", detail: "x", findings: [{ ruleId: "V-02", semanticSubruleId: "V-02-SEM-STATE-IN-PROSE", targetLocator: "claims.CL-001.text", violationCode: "ENGINE_FACT_MUTATION_DETECTED", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }] });
  }
  if (spec === "SM-05" || spec === "SM-17" || spec === "IN-05") {
    return new SemanticEvaluatorIncapacityError({ detail: "unable", findings: [{ ruleId: "V-13", semanticSubruleId: "V-13-SEM-PROBABILITY", targetLocator: "claims.CL-001.text", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }] });
  }
  if (spec === "SM-06" || spec === "IN-06") return new SemanticProtocolError({ detail: "protocol" });
  if (spec === "SM-07") return new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE", detail: "pre" });
  const transport = {
    "SM-08": "JUDGE_CONFIGURATION_FAILURE", "SM-09": "JUDGE_TRANSPORT_FAILURE", "SM-10": "JUDGE_TIMEOUT",
    "SM-11": "JUDGE_AUTH_FAILURE", "SM-12": "JUDGE_RATE_LIMIT", "SM-13": "JUDGE_HTTP_FAILURE",
    "SM-14": "JUDGE_PROTOCOL_FAILURE", "SM-15": "JUDGE_REFUSAL",
  };
  if (transport[spec]) return new SemanticJudgeTransportError({ errorCode: transport[spec], detail: spec });
  if (spec === "SM-26") return new Error("ordinary");
  if (spec === "SM-27") {
    const err = new SemanticJudgeTransportError({ errorCode: "JUDGE_TIMEOUT", detail: "x" });
    err.errorCode = "NOT_A_CODE";
    return err;
  }
  return new SemanticViolationError({ violationCode: "OUTPUT_SCHEMA_VIOLATION", detail: spec ?? "env", findings: [{ ruleId: "V-04", semanticSubruleId: "V-04-SEM-CLAIMTYPE-ALIGNMENT", targetLocator: "claims.CL-001.text", violationCode: "OUTPUT_SCHEMA_VIOLATION", reasonCode: "RULE_VIOLATED", supportingAuthorityIds: [] }] });
}

async function mapJ3(error, request) {
  if (error instanceof SemanticJudgeTransportError || error?.name === "SemanticJudgeTransportError") {
    return mapSemanticJudgeTransportErrorToSystemFailure({ agentInterpretationRequest: request, semanticJudgeTransportError: error, now: () => "2026-08-24T00:00:00.000Z" });
  }
  return mapSemanticValidationErrorToSystemFailure({ agentInterpretationRequest: request, semanticValidationError: error, now: () => "2026-08-24T00:00:00.000Z" });
}

async function stageG1() {
  const records = materializeExpectedRecords();
  await check("CS-01", "exactly 28 canonical keys", () => {
    for (const record of records) {
      assert.deepEqual(Object.keys(record).sort(), [...CANONICAL_RECORD_KEYS].sort());
    }
  });
  await check("CS-02", "caseId unique", () => {
    assert.equal(new Set(records.map((row) => row.caseId)).size, records.length);
  });
  await check("CS-03", "records deeply frozen", () => {
    assert.equal(Object.isFrozen(records), true);
    assert.equal(Object.isFrozen(records[0]), true);
  });
  await check("CS-04", "category closed enum", () => {
    for (const record of records) assert.equal(CANONICAL_CATEGORIES.includes(record.category), true);
  });
  await check("CS-05", "assertedTargetFamily domain", () => {
    for (const record of records) {
      if (record.assertedTargetFamily !== null) assert.equal(EXPECTED_TARGET_FAMILIES.includes(record.assertedTargetFamily), true);
    }
  });
  await check("CS-06", "assertedSubruleId domain", () => {
    for (const record of records) {
      if (record.assertedSubruleId !== null) assert.equal(ALL_SUBRULES.includes(record.assertedSubruleId), true);
    }
  });
  await check("CS-07", "expectedViolationCode domain", () => {
    for (const record of records) {
      if (record.expectedViolationCode !== null) assert.equal(SEMANTIC_VIOLATION_CODES.includes(record.expectedViolationCode), true);
    }
  });
  await check("CS-08", "expectedJ3FailureClass domain", () => {
    for (const record of records) {
      if (record.expectedJ3FailureClass !== null) assert.equal(SYSTEM_FAILURE_CLASSES.includes(record.expectedJ3FailureClass), true);
    }
  });
  await check("CS-09", "judgeRequired false implies null verdict/reason", () => {
    for (const record of records) {
      if (record.judgeRequired === false) {
        assert.equal(record.expectedJudgeVerdict, null);
        assert.equal(record.expectedJudgeReasonCode, null);
      }
    }
  });
  await check("CS-10", "local FAIL implies D-check", () => {
    for (const record of records) {
      if (record.expectedLocalOutcome === "FAIL") assert.equal(typeof record.assertedDCheckId, "string");
    }
  });
  await check("CS-11", "falsePositiveControl implies SAME_RESULT_IDENTITY", () => {
    for (const record of records) {
      if (record.falsePositiveControl === true) assert.equal(record.expectedTerminalStatus, "SAME_RESULT_IDENTITY");
    }
  });
  await check("CS-12", "frozen locators exist on fixture T-sets", async () => {
    const fixtures = await loadObservedFixtures();
    for (const record of records) {
      if (!record.assertedTargetLocator || !record.fixtureId || record.fixtureId === "F14") continue;
      const fixture = fixtures[record.fixtureId];
      if (!fixture?.result) continue;
      const tSet = enumerateSemanticTargets(fixture.request, fixture.result);
      assert.equal(tSet.some((row) => row.targetLocator === record.assertedTargetLocator), true, record.caseId);
    }
  });
  await check("CS-13", "TARGET_FAMILY covers 13 families once each per suffix role", () => {
    const familyRecords = records.filter((row) => row.category === "TARGET_FAMILY");
    assert.equal(familyRecords.length, 52);
    const families = new Set(familyRecords.map((row) => row.assertedTargetFamily));
    assert.equal(families.size, 13);
  });
  await check("CS-14", "SUBRULE covers 26 semantic subrules", () => {
    const sub = records.filter((row) => row.category === "SUBRULE" && row.assertedSubruleId);
    assert.equal(new Set(sub.map((row) => row.assertedSubruleId)).size, 26);
  });
  await check("CS-15", "declared total equals physical count", () => {
    assert.equal(records.length, 264);
    assert.equal(CANONICAL_CASE_IDS.length, 264);
  });
  await check("CS-16", "category subtotals sum to total", () => {
    const counts = Object.fromEntries(CANONICAL_CATEGORIES.map((key) => [key, 0]));
    for (const record of records) counts[record.category] += 1;
    assert.deepEqual(counts, {
      TARGET_FAMILY: 52, SUBRULE: 57, JUDGE_LAW: 30, PRODUCT_LOCK: 15, MECHANICS: 7,
      PROTOCOL: 21, TRANSPORT: 28, MAPPING: 27, INTEGRATION: 10, PRIVACY: 17,
    });
  });
  await check("CS-17", "expectedJ2Status domain", () => {
    for (const record of records) assert.equal(["NOT_EXERCISED", "ADMITTED", "ERROR"].includes(record.expectedJ2Status), true);
  });
  await check("CS-18", "NOT_EXERCISED/ADMITTED imply null errorCode", () => {
    for (const record of records) {
      if (record.expectedJ2Status === "NOT_EXERCISED" || record.expectedJ2Status === "ADMITTED") {
        assert.equal(record.expectedJ2ErrorCode, null);
      }
    }
  });
  await check("CS-19", "ERROR implies canonical J2 code", () => {
    for (const record of records) {
      if (record.expectedJ2Status === "ERROR") {
        assert.equal(SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES.includes(record.expectedJ2ErrorCode), true);
      }
    }
  });
  await check("CS-20", "providerSpecific iff J2Status not NOT_EXERCISED", () => {
    for (const record of records) {
      assert.equal(record.providerSpecific, record.expectedJ2Status !== "NOT_EXERCISED", record.caseId);
    }
  });
  await check("CS-21", "providerSpecific implies TRANSPORT/INTEGRATION/PRIVACY", () => {
    for (const record of records) {
      if (record.providerSpecific) assert.equal(["TRANSPORT", "INTEGRATION", "PRIVACY"].includes(record.category), true);
    }
  });
  await check("CS-22", "materialized ids equal frozen CANONICAL_CASE_IDS", () => {
    assert.deepEqual([...records.map((row) => row.caseId)].sort(), [...CANONICAL_CASE_IDS].sort());
  });
  await check("CS-23", "provider partition 228/36", () => {
    assert.equal(records.filter((row) => row.providerSpecific).length, 36);
    assert.equal(records.filter((row) => !row.providerSpecific).length, 228);
  });
  await check("CS-24", "J2-state partition 228/4/32", () => {
    assert.equal(records.filter((row) => row.expectedJ2Status === "NOT_EXERCISED").length, 228);
    assert.equal(records.filter((row) => row.expectedJ2Status === "ADMITTED").length, 4);
    assert.equal(records.filter((row) => row.expectedJ2Status === "ERROR").length, 32);
  });
  await check("CS-25", "exactly one category per record", () => {
    for (const record of records) assert.equal(typeof record.category, "string");
  });
  await check("CS-26", "production target-family order and digest", () => {
    assert.deepEqual([...SEMANTIC_TARGET_FAMILIES], [...EXPECTED_TARGET_FAMILIES]);
    assert.equal(sha256PrefixedDigest(canonicalSerialize([...SEMANTIC_TARGET_FAMILIES])), EXPECTED_TARGET_FAMILIES_DIGEST);
  });
  await check("CS-27", "production matrix row order", () => {
    assert.equal(SEMANTIC_APPLICABILITY_MATRIX.rows.length, 26);
    SEMANTIC_APPLICABILITY_MATRIX.rows.forEach((row, index) => {
      const expected = EXPECTED_SUBRULE_MATRIX[index];
      assert.equal(row.ordinal, expected.ordinal);
      assert.equal(row.semanticSubruleId, expected.subruleId);
      assert.equal(row.ruleId, expected.ruleId);
    });
    assert.equal(sha256PrefixedDigest(canonicalSerialize(SEMANTIC_APPLICABILITY_MATRIX)), EXPECTED_APPLICABILITY_MATRIX_DIGEST);
  });
  await check("CS-28", "frozen conditions deep-equal production", () => {
    for (const expected of EXPECTED_SUBRULE_MATRIX) {
      const row = getSemanticSubrule(expected.subruleId);
      assert.deepEqual([...row.conditions], expected.conditions);
      if (expected.conditionsByFamily === null) assert.equal(row.conditionsByFamily, undefined);
      else {
        assert.deepEqual(row.conditionsByFamily.CLAIM_TEXT.map((item) => item.type), expected.conditionsByFamily.CLAIM_TEXT.map((item) => item.type));
      }
    }
  });
  await check("CS-29", "frozen failure classes", () => {
    for (const expected of EXPECTED_SUBRULE_MATRIX) {
      assert.equal(getSemanticSubrule(expected.subruleId).failureViolationCode, expected.failureViolationCode);
    }
  });
  await check("CS-30", "observed applicable sets equal frozen", async () => {
    const fixtures = await loadObservedFixtures();
    for (const row of EXPECTED_TARGET_FAMILY_MATRIX) {
      const fixture = fixtures[row.fixtureId];
      const { cSet } = buildSemanticCheckSet(fixture.request, fixture.result);
      const actual = applicableSet(cSet, row.family, row.locator).sort();
      assert.deepEqual(actual, [...row.applicable].sort(), row.family);
    }
  });
  await check("CS-31", "observed NA sets partition all 26 subrules", async () => {
    const fixtures = await loadObservedFixtures();
    for (const row of EXPECTED_TARGET_FAMILY_MATRIX) {
      const fixture = fixtures[row.fixtureId];
      const { cSet } = buildSemanticCheckSet(fixture.request, fixture.result);
      const actualApp = new Set(applicableSet(cSet, row.family, row.locator));
      const actualNa = ALL_SUBRULES.filter((id) => !actualApp.has(id));
      const expectedNa = [...row.nonApplicable, ...SINGLE_ONLY_SUBRULES];
      assert.deepEqual(actualNa.sort(), expectedNa.sort(), row.family);
      assert.equal(new Set([...row.applicable, ...expectedNa]).size, 26);
      assert.equal([...row.applicable].filter((id) => row.nonApplicable.includes(id)).length, 0);
    }
  });
  await check("CS-32", "frozen locator family matches observed T-set", async () => {
    const fixtures = await loadObservedFixtures();
    for (const row of EXPECTED_TARGET_FAMILY_MATRIX) {
      const tSet = enumerateSemanticTargets(fixtures[row.fixtureId].request, fixtures[row.fixtureId].result);
      const hit = tSet.find((item) => item.targetLocator === row.locator);
      assert.ok(hit, row.family);
      assert.equal(hit.targetFamily, row.family);
    }
  });
  await check("CS-33", "authority text digests and frozen lawful/adversarial texts", () => {
    assert.equal(createHash("sha256").update(readFileSync(join(ROOT, "src/agent/semanticApplicability.js"))).digest("hex"), EXPECTED_APPLICABILITY_SOURCE_SHA256);
    for (const expected of EXPECTED_SUBRULE_MATRIX) {
      const row = getSemanticSubrule(expected.subruleId);
      const d = EXPECTED_TEXT_AUTHORITY_DIGESTS[expected.subruleId];
      assert.equal(sha256PrefixedDigest(canonicalSerialize(row.allowedSemanticInterpretations[0])), d.allowed0);
      assert.equal(sha256PrefixedDigest(canonicalSerialize(row.forbiddenSemanticImplications[0])), d.forbidden0);
      assert.equal(sha256PrefixedDigest(canonicalSerialize(row.expectedInvariant)), d.expectedInvariant);
      assert.equal(sha256PrefixedDigest(canonicalSerialize(FROZEN_LAWFUL_TEXT[expected.subruleId])), d.allowed0);
      assert.equal(sha256PrefixedDigest(canonicalSerialize(FROZEN_ADVERSARIAL_TEXT[expected.subruleId])), d.forbidden0);
      assert.equal(FROZEN_INVARIANT_TEXT[expected.subruleId], row.expectedInvariant);
    }
  });
  await check("CS-34", "per-record and whole-corpus seals", () => {
    for (const record of records) {
      assert.equal(sha256PrefixedDigest(canonicalSerialize(record)), EXPECTED_RECORD_DIGESTS[record.caseId], record.caseId);
    }
    const sorted = [...records].sort((left, right) => (left.caseId < right.caseId ? -1 : 1));
    assert.equal(sha256PrefixedDigest(canonicalSerialize(sorted)), CANONICAL_CORPUS_DIGEST);
    assertDeepFrozen(FROZEN_EXECUTION_SPECS);
    assert.equal(Object.keys(FROZEN_EXECUTION_SPECS).length > 0, true);
    assert.equal(sha256PrefixedDigest(canonicalSerialize(FROZEN_EXECUTION_SPECS)), FROZEN_EXECUTION_SPECS_DIGEST);
  });
  await check("CS-35", "FAIL witness in applicable set with matching class", () => {
    for (const row of EXPECTED_TARGET_FAMILY_MATRIX) {
      assert.equal(row.applicable.includes(row.witness), true, row.family);
      const sub = EXPECTED_SUBRULE_MATRIX.find((item) => item.subruleId === row.witness);
      assert.equal(sub.failureViolationCode, row.witnessClass);
    }
  });
  await check("CS-36", "J3 execution law and 50/214 partition", () => {
    let nonNull = 0;
    for (const record of records) {
      if (record.expectedJ3FailureClass !== null) {
        nonNull += 1;
        assert.equal(["MAPPING", "INTEGRATION", "PRIVACY"].includes(record.category), true, record.caseId);
        assert.equal(record.expectedTerminalStatus, "SYSTEM_FAILURE", record.caseId);
      }
      if (record.expectedTerminalStatus === "SYSTEM_FAILURE") assert.notEqual(record.expectedJ3FailureClass, null, record.caseId);
    }
    assert.equal(nonNull, 50);
    assert.equal(records.length - nonNull, 214);
  });
  await check("CS-37", "expected materialization is production-independent", () => {
    const source = readFileSync(join(ROOT, "scripts/fixtures/agent-semantic-conformance-corpus.mjs"), "utf8");
    const sectionA = source.slice(0, source.indexOf("Section B"));
    assert.equal(/from ["']\.\.\/\.\.\/src\/agent\//.test(sectionA), false);
    const first = canonicalSerialize(materializeExpectedRecords());
    const second = canonicalSerialize(materializeExpectedRecords());
    assert.equal(first, second);
    materializeExpectedRecords();
    assert.equal(sha256PrefixedDigest(canonicalSerialize(FROZEN_EXECUTION_SPECS)), FROZEN_EXECUTION_SPECS_DIGEST);
    assert.equal(canonicalSerialize(FROZEN_EXECUTION_SPECS).includes("src/agent"), false);
  });
}

async function executeSemanticCase(record, fixtures) {
  const spec = FROZEN_EXECUTION_SPECS[record.caseId] ?? {};
  const fixture = fixtures[record.fixtureId];
  if (record.category === "TARGET_FAMILY" || record.category === "SUBRULE" || record.category === "JUDGE_LAW" || record.category === "PRODUCT_LOCK") {
    if (record.caseId.startsWith("DCK-") || record.caseId.startsWith("VJ-I") || record.caseId.startsWith("JS-")) return;
    const prepared = applyStructural(fixture, spec);
    const result = applyOverride(prepared.result, record.fixtureTextOverride);
    const { cSet, localFails, tSet } = buildSemanticCheckSet(prepared.request, result);
    if (record.caseId.endsWith("-ENUM") || record.caseId.endsWith("-NA") || record.caseId.endsWith("-A")) {
      if (record.assertedTargetLocator) {
        assert.equal(tSet.some((row) => row.targetLocator === record.assertedTargetLocator && row.targetFamily === record.assertedTargetFamily), true, record.caseId);
      }
      if (record.expectedApplicableSubruleIds) {
        const actual = applicableSet(cSet, record.assertedTargetFamily, record.assertedTargetLocator).sort();
        assert.deepEqual(actual, [...record.expectedApplicableSubruleIds].sort(), record.caseId);
      }
      if (record.assertedSubruleId && record.caseId.endsWith("-A")) {
        assert.equal(cSet.some((row) => row.semanticSubruleId === record.assertedSubruleId && row.targetLocator === record.assertedTargetLocator), true, record.caseId);
      }
      if (record.assertedSubruleId) {
        const local = locallyEvaluateSemanticSubrule(getSemanticSubrule(record.assertedSubruleId), { text: "x" });
        assert.equal(local.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
        assert.equal(local.violationCode, null);
      }
      assert.equal(localFails.length, 0);
      return;
    }
    if (record.expectedTerminalStatus === "SAME_RESULT_IDENTITY") {
      const returned = await runSemantics(prepared.request, result, allPassJudge());
      assert.equal(Object.is(returned, result), true, record.caseId);
      return;
    }
    if (record.expectedTerminalStatus === "VIOLATION") {
      const error = await expectClass(
        () => runSemantics(prepared.request, result, targetedFailJudge(record.assertedSubruleId, record.assertedTargetLocator)),
        SemanticViolationError,
      );
      assert.equal(error.violationCode, record.expectedViolationCode, record.caseId);
      return;
    }
    if (record.expectedTerminalStatus === "INCAPACITY") {
      const judge = createMockSemanticJudge((check) => (
        check.semanticSubruleId === record.assertedSubruleId
          ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: record.expectedJudgeReasonCode, supportingAuthorityIds: [] }
          : { verdict: "PASS" }
      ));
      await expectClass(() => runSemantics(prepared.request, result, judge), SemanticEvaluatorIncapacityError);
    }
  }
}

async function executeDckAndInvariants(record, fixtures) {
  const spec = FROZEN_EXECUTION_SPECS[record.caseId] ?? {};
  if (record.caseId === "VJ-I01") {
    for (const row of EXPECTED_SUBRULE_MATRIX) {
      const local = locallyEvaluateSemanticSubrule(getSemanticSubrule(row.subruleId), { text: "72% probability" });
      assert.equal(local.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
      assert.equal(local.violationCode, null);
    }
    return;
  }
  if (record.caseId === "VJ-I02" || record.caseId === "VJ-I03") {
    const id = record.caseId === "VJ-I02" ? "V-13-SEM-PROBABILITY" : "V-29-SEM-RANK-PROBABILITY";
    const row = getSemanticSubrule(id);
    assert.deepEqual(locallyEvaluateSemanticSubrule(row, { text: "72% probability" }), locallyEvaluateSemanticSubrule(row, { text: "60% of respondents provided direct observations" }));
    return;
  }
  if (record.caseId === "VJ-I04") {
    for (const id of ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F15"]) {
      const fixture = fixtures[id];
      assert.equal(buildSemanticCheckSet(fixture.request, fixture.result).localFails.length, 0, id);
    }
    return;
  }
  if (!record.caseId.startsWith("DCK-")) return;
  const prepared = applyStructural(fixtures[record.fixtureId], spec);
  const dSet = evaluateDeterministicChecks(prepared.request, prepared.result);
  if (record.expectedLocalOutcome === "PASS") {
    const row = dSet.find((item) => item.dCheckId === record.assertedDCheckId);
    assert.equal(row.outcome, "PASS");
    if (record.caseId === "DCK-01" || record.caseId === "DCK-03") {
      const returned = await runSemantics(prepared.request, prepared.result, allPassJudge());
      assert.equal(Object.is(returned, prepared.result), true);
    }
    return;
  }
  const error = await expectClass(() => runSemantics(prepared.request, prepared.result, allPassJudge()), SemanticViolationError);
  assert.equal(error.violationCode, record.expectedViolationCode);
  if (record.caseId === "DCK-05") {
    let calls = 0;
    await expectClass(() => runSemantics(prepared.request, prepared.result, () => { calls += 1; return { verdicts: [] }; }), SemanticViolationError);
    assert.equal(calls, 0);
  }
}

async function executeMechanics(record, fixtures) {
  const fixture = fixtures[record.fixtureId];
  if (record.caseId === "JS-01") {
    const returned = await runSemantics(fixture.request, fixture.result, () => { throw new Error("judge"); });
    assert.equal(Object.is(returned, fixture.result), true);
    return;
  }
  if (record.caseId === "JS-02") {
    const { cSet } = buildSemanticCheckSet(fixture.request, fixture.result);
    const parts = partitionChecks(cSet, 7);
    assert.equal(parts.flat().length, cSet.length);
    return;
  }
  if (record.caseId === "JS-03") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, allPassJudge(), 0), SemanticValidationError);
    return;
  }
  if (record.caseId === "JS-04") {
    const { cSet } = buildSemanticCheckSet(fixture.request, fixture.result);
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "FAIL" }))), SemanticViolationError);
    assert.equal(error.findings.length, cSet.length);
    return;
  }
  if (record.caseId === "JS-05") {
    const returned = await runSemantics(fixture.request, fixture.result, allPassJudge());
    assert.equal(Object.is(returned, fixture.result), true);
    return;
  }
  if (record.caseId === "JS-06") {
    const before = canonicalSerialize(fixture.request) + canonicalSerialize(fixture.result);
    await runSemantics(fixture.request, fixture.result, allPassJudge());
    assert.equal(canonicalSerialize(fixture.request) + canonicalSerialize(fixture.result), before);
    return;
  }
  if (record.caseId === "JS-07") {
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "PASS" }), { dropItems: 1 })), SemanticProtocolError);
    assert.equal(error instanceof SemanticProtocolError, true);
  }
}

async function executeProtocol(record, fixtures) {
  const fixture = fixtures.F07;
  const spec = FROZEN_EXECUTION_SPECS[record.caseId] ?? {};
  const law = spec.protocolLaw;
  assert.equal(typeof law, "string", `${record.caseId} missing frozen protocolLaw`);
  const { cSet } = buildSemanticCheckSet(fixture.request, fixture.result);
  const classOf = (check) => getSemanticSubrule(check.semanticSubruleId)?.failureViolationCode ?? null;

  const failV12 = (check) => (check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW" ? { verdict: "FAIL" } : { verdict: "PASS" });
  const unableV13 = (check) => (
    check.semanticSubruleId === "V-13-SEM-PROBABILITY"
      ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }
      : { verdict: "PASS" }
  );

  if (law === "PROTOCOL_OUTRANKS_FAIL") {
    const error = await expectClass(
      () => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(failV12, { unknownCheckId: true })),
      SemanticProtocolError,
    );
    assert.equal(error instanceof SemanticViolationError, false);
    return;
  }
  if (law === "PROTOCOL_OUTRANKS_UNABLE") {
    const error = await expectClass(
      () => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(unableV13, { unknownCheckId: true })),
      SemanticProtocolError,
    );
    assert.equal(error instanceof SemanticEvaluatorIncapacityError, false);
    return;
  }
  if (law === "UNABLE_OUTRANKS_FAIL") {
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge((check) => (
      check.semanticSubruleId === "V-12-SEM-HUMAN-REVIEW" ? { verdict: "FAIL" }
        : check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }
          : { verdict: "PASS" }
    ))), SemanticEvaluatorIncapacityError);
    assert.equal(error instanceof SemanticViolationError, false);
    return;
  }
  if (law === "MULTI_FAIL_CSET_ORDER") {
    const error = await expectClass(
      () => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "FAIL" }))),
      SemanticViolationError,
    );
    assert.equal(error.violationCode, record.expectedViolationCode);
    assert.equal(error.violationCode, classOf(cSet[0]));
    assert.equal(error.findings.length, cSet.length);
    assert.equal(error.findings[0].semanticSubruleId, cSet[0].semanticSubruleId);
    assert.equal(error.findings[0].targetLocator, cSet[0].targetLocator);
    for (let index = 0; index < cSet.length; index += 1) {
      assert.equal(error.findings[index].semanticSubruleId, cSet[index].semanticSubruleId);
      assert.equal(error.findings[index].targetLocator, cSet[index].targetLocator);
      assert.equal(error.findings[index].violationCode, classOf(cSet[index]));
    }
    assert.equal(new Set(error.findings.map((row) => row.violationCode)).size > 1, true);
    return;
  }
  if (law === "NO_CHECKID_LEXICAL_PRIORITY") {
    const rows = cSet.map((check, cIndex) => ({ check, cIndex, checkId: check.checkId, cls: classOf(check) }));
    let pair = null;
    for (const left of rows.filter((row) => row.cls === record.expectedViolationCode)) {
      const right = rows.find((row) => row.cIndex > left.cIndex && row.checkId < left.checkId && row.cls !== left.cls);
      if (right) {
        pair = { left, right };
        break;
      }
    }
    assert.ok(pair, `${record.caseId} could not construct cIndex vs checkId conflict pair`);
    const failIds = new Set([pair.left.checkId, pair.right.checkId]);
    const error = await expectClass(
      () => runSemantics(fixture.request, fixture.result, createMockSemanticJudge((check) => (
        failIds.has(check.checkId) ? { verdict: "FAIL" } : { verdict: "PASS" }
      ))),
      SemanticViolationError,
    );
    assert.equal(error.violationCode, record.expectedViolationCode);
    assert.equal(error.findings[0].semanticSubruleId, pair.left.check.semanticSubruleId);
    assert.equal(error.findings[0].targetLocator, pair.left.check.targetLocator);
    const lexicalFirst = [pair.left, pair.right].sort((a, b) => (a.checkId < b.checkId ? -1 : 1))[0];
    assert.equal(lexicalFirst.checkId, pair.right.checkId);
    assert.notEqual(error.findings[0].targetLocator, pair.right.check.targetLocator);
    assert.notEqual(error.violationCode, pair.right.cls);
    return;
  }
  if (law === "NO_PROVIDER_VERDICT_ORDER") {
    const emit = (reverse) => protocolJudge((packet) => {
      const items = packet.checks.map((check) => lawfulVerdictItem(check, { verdict: "FAIL" }));
      return reverse ? items.reverse() : items;
    });
    const forward = await expectClass(() => runSemantics(fixture.request, fixture.result, emit(false)), SemanticViolationError);
    const reversed = await expectClass(() => runSemantics(fixture.request, fixture.result, emit(true)), SemanticViolationError);
    assert.equal(forward.violationCode, record.expectedViolationCode);
    assert.equal(reversed.violationCode, record.expectedViolationCode);
    assert.equal(forward.violationCode, reversed.violationCode);
    assert.equal(canonicalSerialize(forward.findings), canonicalSerialize(reversed.findings));
    assert.equal(forward.findings[0].semanticSubruleId, cSet[0].semanticSubruleId);
    assert.equal(reversed.findings[0].semanticSubruleId, cSet[0].semanticSubruleId);
    return;
  }
  if (law === "MALFORMED_FAIL_NOT_VIOLATION") {
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, protocolJudge((packet) => (
      packet.checks.map((check, index) => {
        const item = lawfulVerdictItem(check, { verdict: "FAIL" });
        if (index === 0) item.malformedExtra = "not-a-semantic-finding";
        return item;
      })
    ))), SemanticProtocolError);
    assert.equal(error instanceof SemanticViolationError, false);
    return;
  }
  if (law === "DROPPED_ITEM" || law === "DUPLICATE_CHECK_ID" || law === "EXTRA_ITEM" || law === "UNKNOWN_CHECK_ID" || law === "CORRUPT_VERDICT_ENUM" || law === "FOREIGN_AUTHORITY_ID") {
    await expectClass(
      () => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "PASS" }), spec.mockOptions)),
      SemanticProtocolError,
    );
    return;
  }
  if (law === "RULEID_ECHO_MISMATCH") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, protocolJudge((packet) => (
      packet.checks.map((check, index) => lawfulVerdictItem(check, {
        verdict: "PASS",
        ruleId: index === 0 ? `${check.ruleId}-ECHO-TAMPER` : check.ruleId,
      }))
    ))), SemanticProtocolError);
    return;
  }
  if (law === "TARGETLOCATOR_ECHO_MISMATCH") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, protocolJudge((packet) => (
      packet.checks.map((check, index) => lawfulVerdictItem(check, {
        verdict: "PASS",
        targetLocator: index === 0 ? `${check.targetLocator}.echo-tamper` : check.targetLocator,
      }))
    ))), SemanticProtocolError);
    return;
  }
  if (law === "FAIL_WRONG_VIOLATION_CLASS") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge((check) => (
      check.semanticSubruleId === "V-13-SEM-PROBABILITY"
        ? { verdict: "FAIL", violationCode: "OUTPUT_SCHEMA_VIOLATION" }
        : { verdict: "PASS" }
    ))), SemanticProtocolError);
    return;
  }
  if (law === "PASS_NONNULL_VIOLATION_CODE") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({
      verdict: "PASS",
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
    }))), SemanticProtocolError);
    return;
  }
  if (law === "PASS_WRONG_REASON_CODE") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({
      verdict: "PASS",
      reasonCode: "RULE_VIOLATED",
    }))), SemanticProtocolError);
    return;
  }
  if (law === "UNABLE_NON_INCAPACITY_REASON") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge((check, index) => (
      index === 0 ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "RULE_SATISFIED", supportingAuthorityIds: [] } : { verdict: "PASS" }
    ))), SemanticProtocolError);
    return;
  }
  if (law === "UNABLE_NONNULL_VIOLATION_CODE") {
    await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge((check, index) => (
      index === 0
        ? { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", violationCode: "PROHIBITED_CLAIM_VIOLATION", supportingAuthorityIds: [] }
        : { verdict: "PASS" }
    ))), SemanticProtocolError);
    return;
  }
  if (law === "UNLAWFUL_BATCH_POSITION") {
    const dSet = evaluateDeterministicChecks(fixture.request, fixture.result);
    const tSet = enumerateSemanticTargets(fixture.request, fixture.result);
    const { partitions, packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch: 40 });
    assert.equal(packets.length > 1, true);
    const processed = [];
    const passJudge = allPassJudge();
    for (const packet of packets) {
      const verdicts = await invokeSemanticJudge(passJudge, packet);
      processed.push(Object.freeze({
        packet: { ...packet, batchIndex: packet.batchIndex + 1 },
        verdicts,
      }));
    }
    const error = await expectClass(() => Promise.resolve().then(() => proveSemanticProtocolIntegrity({
      agentInterpretationRequest: fixture.request,
      agentInterpretationResult: fixture.result,
      dSet,
      tSet,
      cSet,
      partitions,
      processedPartitions: processed,
    })), SemanticProtocolError);
    assert.match(error.detail ?? error.message ?? "", /unlawful batch position/);
    return;
  }
  assert.fail(`${record.caseId} unhandled protocolLaw ${law}`);
}

async function executeTransport(record) {
  const spec = FROZEN_EXECUTION_SPECS[record.caseId] ?? {};
  const size = spec.packetSize ?? 2;
  const packet = makePacket(size);
  const cred = spec.credentialScript === "BLANK" ? () => "   " : () => "xai-test-key-J4";
  const id = record.caseId;
  const ok = async () => execTransport(packet, () => jsonResponse(200, completedResponse(lawfulVerdicts(packet))), { credentialReader: cred, omitSubmitted: id === "TR-26" });
  if (id === "TR-01" || id === "TR-05" || id === "TR-26") {
    const { result, error, calls } = await ok();
    assert.equal(error, null, id);
    assert.ok(result);
    if (id === "TR-01") assert.equal(XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH, 256);
    if (id === "TR-05") assert.equal(calls.length, 1);
    return;
  }
  if (id === "TR-02" || id === "TR-03" || id === "TR-04") {
    const { error, calls } = await execTransport(packet, () => jsonResponse(200, completedResponse(lawfulVerdicts(packet))));
    assert.equal(error?.errorCode, "JUDGE_CONFIGURATION_FAILURE");
    if (id === "TR-03") assert.equal(calls.length, 0);
    return;
  }
  const scripts = {
    "TR-06": async () => execTransport(makePacket(2), async (url, init) => {
      init.signal.throwIfAborted?.();
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    }),
    "TR-07": async () => execTransport(makePacket(2), async () => { throw Object.assign(new Error("aborted"), { name: "AbortError" }); }),
    "TR-08": async () => execTransport(makePacket(2), () => jsonResponse(401, { error: { message: "no" } })),
    "TR-09": async () => execTransport(makePacket(2), () => jsonResponse(403, { error: { message: "no" } })),
    "TR-10": async () => execTransport(makePacket(2), () => jsonResponse(429, { error: { message: "no" } })),
    "TR-11": async () => execTransport(makePacket(2), () => jsonResponse(400, { error: { message: "no" } })),
    "TR-12": async () => execTransport(makePacket(2), () => jsonResponse(500, { error: { message: "no" } })),
    "TR-13": async () => execTransport(makePacket(2), async () => { throw new Error("network"); }),
    "TR-14": async () => execTransport(makePacket(2), () => jsonResponse(200, "nope")),
    "TR-15": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "incomplete", error: null, output: [] })),
    "TR-16": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: { message: "x" }, output: [] })),
    "TR-17": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [] })),
    "TR-18": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "[]" }] }, { type: "message", role: "assistant", content: [{ type: "output_text", text: "[]" }] }] })),
    "TR-19": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", content: [] }] })),
    "TR-20": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "[]" }, { type: "output_text", text: "[]" }] }] })),
    "TR-21": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "tool", content: [] }] })),
    "TR-22": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", refusal: "safety", content: [{ type: "output_text", text: "[]" }] }] })),
    "TR-23": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", content: [{ type: "refusal", refusal: "no" }] }] })),
    "TR-24": async () => execTransport(makePacket(2), () => jsonResponse(200, { status: "completed", error: null, output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "not-json" }] }] })),
    "TR-25": async () => execTransport(makePacket(2), async () => { throw new Error("network"); }),
    "TR-27": async () => execTransport(makePacket(2), () => jsonResponse(200, completedResponse(lawfulVerdicts(makePacket(2)))), { submittedChecks: makePacket(2).checks.slice(0, 1) }),
    "TR-28": async () => execTransport(makePacket(2), () => jsonResponse(200, completedResponse(lawfulVerdicts(makePacket(2)))), { credentialReader: cred }),
  };
  const run = scripts[id];
  const { error, calls } = await run();
  assert.equal(error instanceof SemanticJudgeTransportError, true, id);
  assert.equal(error.errorCode, record.expectedJ2ErrorCode, id);
  if (id === "TR-25") assert.equal(calls.length, 1);
  if (id === "TR-28") assert.equal(calls.length, 0);
}

async function executeMapping(record, fixtures) {
  const request = fixtures.F07.request;
  const spec = FROZEN_EXECUTION_SPECS[record.caseId]?.errorConstructorSpec ?? record.caseId;
  const error = constructMappedError(spec, request);
  error.j4CaseId = record.caseId;
  if (record.caseId === "SM-26" || record.caseId === "SM-27") {
    await expectClass(() => mapJ3(error, request), SemanticSystemFailureMappingError);
    return;
  }
  let failure;
  try {
    failure = await mapJ3(error, request);
  } catch (caught) {
    caught.message = `${record.caseId}: ${caught.message}; constructed=${error?.constructor?.name}`;
    throw caught;
  }
  assert.equal(failure.failureClass, record.expectedJ3FailureClass, record.caseId);
  if (record.caseId === "SM-16") assert.equal(failure.retryable, SYSTEM_FAILURE_RETRYABLE_BY_CLASS.PROHIBITED_CLAIM_VIOLATION);
  if (record.caseId === "SM-17") assert.equal(failure.retryable, false);
  if (record.caseId === "SM-18") assert.equal(failure.interpretationId, request.interpretationId);
  if (record.caseId === "SM-19") assert.equal(failure.diagnosticId, request.engineSnapshot.identity.diagnosticId);
  if (record.caseId === "SM-20") assert.equal(failure.engineSnapshotDigest, request.engineSnapshot.engineSnapshotDigest);
  if (record.caseId === "SM-21") assert.equal(failure.failureSchemaVersion, "system-failure-1.0");
  if (record.caseId === "SM-22") assert.equal(failure.clientDisclosure, "SYSTEM_LEVEL_ONLY");
  if (record.caseId === "SM-23") assert.equal(failure.occurredAt, "2026-08-24T00:00:00.000Z");
  if (record.caseId === "SM-24") assert.equal(Object.isFrozen(failure), true);
}

async function executeIntegration(record, fixtures) {
  const fixture = fixtures[record.fixtureId] ?? fixtures.F07;
  if (record.caseId === "IN-09") {
    const returned = await runSemantics(fixture.request, fixture.result, allPassJudge());
    assert.equal(Object.is(returned, fixture.result), true);
    return;
  }
  if (record.caseId === "IN-08") {
    const prepared = applyStructural(fixture, { fixtureStructuralOverride: "CLEAR_DISCLOSURES" });
    const error = await expectClass(() => runSemantics(prepared.request, prepared.result, allPassJudge()), SemanticViolationError);
    const failure = await mapJ3(error, prepared.request);
    assert.equal(failure.failureClass, "OUTPUT_SCHEMA_VIOLATION");
    return;
  }
  if (record.caseId === "IN-07") {
    const { error } = await execTransport(makePacket(2), async () => { throw new Error("network"); });
    const failure = await mapJ3(error, fixtures.F07.request);
    assert.equal(failure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    return;
  }
  if (record.caseId === "IN-10") {
    const packet = makePacket(2);
    const { error, result } = await execTransport(packet, () => jsonResponse(200, completedResponse(lawfulVerdicts(packet))), { omitSubmitted: true });
    assert.equal(error, null);
    assert.ok(result);
    return;
  }
  if (record.caseId === "IN-05") {
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] }))), SemanticEvaluatorIncapacityError);
    const failure = await mapJ3(error, fixture.request);
    assert.equal(failure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    return;
  }
  if (record.caseId === "IN-06") {
    const error = await expectClass(() => runSemantics(fixture.request, fixture.result, createMockSemanticJudge(() => ({ verdict: "PASS" }), { unknownCheckId: true })), SemanticProtocolError);
    const failure = await mapJ3(error, fixture.request);
    assert.equal(failure.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    return;
  }
  const classBy = {
    "IN-01": ["V-30-SEM-COEQUAL-PREFERENCE", "OUTPUT_SCHEMA_VIOLATION"],
    "IN-02": ["V-04-SEM-GROUNDING", "GROUNDING_VALIDATION_FAILURE"],
    "IN-03": ["V-13-SEM-PROBABILITY", "PROHIBITED_CLAIM_VIOLATION"],
    "IN-04": ["V-02-SEM-STATE-IN-PROSE", "ENGINE_FACT_MUTATION_DETECTED"],
  };
  const [sub, code] = classBy[record.caseId];
  let error;
  try {
    error = await expectClass(() => runSemantics(fixture.request, fixture.result, targetedFailJudge(sub)), SemanticViolationError);
  } catch (caught) {
    caught.message = `${record.caseId}: ${caught.message}`;
    throw caught;
  }
  assert.equal(error.violationCode, code);
  const failure = await mapJ3(error, fixture.request);
  assert.equal(failure.failureClass, code);
}

async function executePrivacy(record, fixtures) {
  const fixture = fixtures.F07;
  const spec = FROZEN_EXECUTION_SPECS[record.caseId] ?? {};
  if (record.caseId.startsWith("PV-0") && Number(record.caseId.slice(3)) <= 5) {
    const result = applyOverride(fixture.result, record.fixtureTextOverride);
    const error = await expectClass(() => runSemantics(fixture.request, result, targetedFailJudge("V-13-SEM-PROBABILITY", "claims.CL-001.text")), SemanticViolationError);
    const failure = await mapJ3(error, fixture.request);
    const blob = JSON.stringify(failure);
    for (const token of record.privacySentinels) assert.equal(blob.includes(token), false, record.caseId);
    assert.equal(failure.failureClass, record.expectedJ3FailureClass);
    return;
  }
  if (record.providerSpecific) {
    const { error } = await execTransport(makePacket(2), () => {
      if (record.caseId === "PV-11") return jsonResponse(200, completedResponse(lawfulVerdicts(makePacket(2))));
      if (record.caseId === "PV-15") return jsonResponse(500, { error: { message: spec.sentinelToken } });
      throw new Error(spec.sentinelToken ?? "network");
    }, {
      systemInstruction: record.caseId === "PV-09" ? spec.sentinelToken : "J4-SYSTEM",
      credentialReader: record.caseId === "PV-10" ? () => spec.sentinelToken : () => "xai-test-key-J4",
    });
    if (error) {
      const failure = await mapJ3(error, fixture.request).catch(() => ({ detail: "" }));
      const blob = `${JSON.stringify(failure)}${error.message}${error.detail ?? ""}`;
      assert.equal(blob.includes(spec.sentinelToken), false, record.caseId);
    }
    return;
  }
  const error = await expectClass(() => runSemantics(fixture.request, fixture.result, targetedFailJudge("V-13-SEM-PROBABILITY")), SemanticViolationError);
  const failure = await mapJ3(error, fixture.request);
  assert.equal(failure.failureClass, "PROHIBITED_CLAIM_VIOLATION");
  if (record.caseId === "PV-16") {
    assert.match(failure.detail ?? "", /semanticErrorKind=/);
  }
}

async function executeRecord(record, fixtures) {
  switch (record.category) {
    case "TARGET_FAMILY":
    case "SUBRULE":
    case "JUDGE_LAW":
    case "PRODUCT_LOCK":
      await executeDckAndInvariants(record, fixtures);
      await executeSemanticCase(record, fixtures);
      return;
    case "MECHANICS":
      await executeMechanics(record, fixtures);
      return;
    case "PROTOCOL":
      await executeProtocol(record, fixtures);
      return;
    case "TRANSPORT":
      await executeTransport(record);
      return;
    case "MAPPING":
      await executeMapping(record, fixtures);
      return;
    case "INTEGRATION":
      await executeIntegration(record, fixtures);
      return;
    case "PRIVACY":
      await executePrivacy(record, fixtures);
      return;
    default:
      assert.fail(record.category);
  }
}

function runGate(script, expected) {
  const spawned = spawnSync("npm", ["run", script], { cwd: ROOT, encoding: "utf8" });
  assert.equal(spawned.status, 0, spawned.stderr || spawned.stdout);
  if (expected) assert.equal((spawned.stdout ?? "").includes(expected), true, script);
}

async function main() {
  const records = materializeExpectedRecords();
  await stageG1();
  const fixtures = await loadObservedFixtures();
  const byCategory = (name) => records.filter((row) => row.category === name);
  for (const record of [...byCategory("TARGET_FAMILY"), ...byCategory("SUBRULE"), ...byCategory("JUDGE_LAW"), ...byCategory("PRODUCT_LOCK")]) {
    await check(record.caseId, record.category, () => executeRecord(record, fixtures));
  }
  for (const record of byCategory("MECHANICS")) await check(record.caseId, "MECHANICS", () => executeRecord(record, fixtures));
  for (const record of byCategory("PROTOCOL")) await check(record.caseId, "PROTOCOL", () => executeRecord(record, fixtures));
  for (const record of byCategory("TRANSPORT")) await check(record.caseId, "TRANSPORT", () => executeRecord(record, fixtures));
  for (const record of byCategory("MAPPING")) await check(record.caseId, "MAPPING", () => executeRecord(record, fixtures));
  for (const record of byCategory("INTEGRATION")) await check(record.caseId, "INTEGRATION", () => executeRecord(record, fixtures));
  for (const record of byCategory("PRIVACY")) await check(record.caseId, "PRIVACY", () => executeRecord(record, fixtures));
  const gates = [
    ["RG-01", "validate:agent-semantic-validator-core-offline", "PASS 24/24"],
    ["RG-02", "validate:agent-semantic-judge-transport-offline", "PASS 73/73"],
    ["RG-03", "validate:agent-semantic-system-failure-offline", "PASS 57/57"],
    ["RG-04", "validate:agent-interpretation-result-offline", "PASS 16/16"],
    ["RG-05", "validate:agent-provider-execution-offline", "PASS 32/32"],
    ["RG-06", "validate:agent-provider-boundary-offline", "PASS 60/60"],
    ["RG-07", "validate:agent-interpretation-request", "PASS 28/28"],
    ["RG-08", "validate:agent-context-pack", "PASS 22/22"],
    ["RG-09", "validate:agent-structured-uncertainty", "PASS 31/31"],
    ["RG-10", "validate:agent-engine-snapshot", "PASS 42/42"],
    ["RG-11", "validate:observation-scope-runtime", "PASS 131/131"],
    ["RG-12", "validate:questionnaire-bindings", null],
  ];
  for (const [id, script, expected] of gates) {
    await check(id, script, () => runGate(script, expected));
  }
  console.log("Agent Semantic Conformance Offline cases passed:");
  for (const row of results) console.log(`  ${row.id}. ${row.label}: ${row.status}`);
  console.log(`PASS ${results.length}/${results.length}`);
}

await main();
