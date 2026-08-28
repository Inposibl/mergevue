import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  RESPONDENT_ROLE_OPTIONS,
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  completeAcquirerVerificationInvite,
  isAcquirerVerificationComplete,
} from "../src/flow/acquirerTrackFlow.js";
import { resolveCanonicalRespondentContext } from "../src/flow/respondentContextBridge.js";
import {
  buildDualRespondentCorpusConfig,
  compareDualRespondents,
  dualPrecedenceOrder,
} from "../src/flow/dualRespondentComparison.js";
import { resolveObservationScope } from "../src/flow/observationScopeResolver.js";
import {
  C5B_ASSEMBLY_FAILURE_REASONS,
  assembleProductionDualAdjudicationInput,
} from "../src/flow/productionAdjudicationInputAssembler.js";
import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };

const ASSEMBLER_SOURCE = readFileSync(
  new URL("../src/flow/productionAdjudicationInputAssembler.js", import.meta.url),
  "utf8",
);
const COMPARATOR_SOURCE = readFileSync(
  new URL("../src/flow/dualRespondentComparison.js", import.meta.url),
  "utf8",
);
const PACKAGE_JSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const DUAL_CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
const PRODUCTION_PAIRS = DUAL_CORPUS_CONFIG.productionPairs;
const ONE_HIGH_PAIR = DUAL_CORPUS_CONFIG.oneHighPair;
const NON_ONE_HIGH_PAIR = PRODUCTION_PAIRS.find((pair) => pair !== ONE_HIGH_PAIR);
const AEM_QUESTIONS = ACQUIRER_TRACK_DATA.acquirerModule.questions;
const COMPLETED_AT = "2026-08-26T12:00:00.000Z";
const USE_CLASS_VALUES = ["PRIMARY", "CONTEXTUAL", "INELIGIBLE", "UNRESOLVED"];
const DUAL_PRECEDENCE = ["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"];
const ACQUIRER_SIDE_ROLE_VALUES = new Set(
  RESPONDENT_ROLE_OPTIONS.filter((option) => option.sides.includes("acquirer")).map((option) => option.value),
);
const TARGET_ONLY_ROLE = "ceo_founder_md";
const FORBIDDEN_C5C_KEYS = [
  "adjudicationState",
  "canonicalEnvironmentCode",
  "alternateEnvironmentCodes",
  "independenceBasis",
  "confidenceUplift",
];

const checks = [];
const evidence = {};

function check(id, label, fn) {
  checks.push({ id, label, fn });
}

function unknownBasis(optionValue) {
  return evidenceClassifiedAnswer(optionValue, {
    directObservationGate: "no",
    evidenceType: "unknown",
    knowledgeLevel: "not_known",
    confidence: "cannot_determine",
    reliabilityFlags: [],
    reliabilityFlagsAcknowledged: true,
  });
}

function observationGap11() {
  return unknownBasis("F");
}

// modes: "p1b" (Q11 both-F observation gap), "e" (Q11 substantive E),
// "unknownAll" (every answer carries an unavailable unknown evidence basis)
function answersForMode(mode) {
  return Object.fromEntries(AEM_QUESTIONS.map((question) => {
    if (mode === "unknownAll") return [question.id, unknownBasis("A")];
    if (question.id === "Q11") return [question.id, mode === "p1b" ? observationGap11() : evidenceClassifiedAnswer("E")];
    return [question.id, evidenceClassifiedAnswer("A")];
  }));
}

function buildInvite(acquirerVerificationSessionId, assessmentSessionId) {
  return Object.freeze({
    acquirerVerificationSessionId,
    assessmentSessionId,
    surveyLink: "/screen-6-acquirer-verification",
    digitalCode: "123456",
    codeHash: "c5b-code-hash",
    createdAt: "2026-08-26T10:00:00.000Z",
    expiresAt: "2026-08-29T10:00:00.000Z",
    ttlHours: 72,
    codeDigits: 6,
    completed: false,
    revoked: false,
  });
}

// Builds a physically lawful production session through the real writers
// (attachAcquirerModuleResult → completeAcquirerVerificationInvite →
// attachAcquirerVerificationCompletion). completionMetadata === false builds
// the legacy 3-arg completion; metadataPatch forges STORED state after the
// lawful write (simulating tampered persistence).
function productionSession(overrides = {}) {
  const {
    r1SessionId = "c5b-r1-session",
    r2SessionId = "c5b-r2-session",
    r1Seniority = "c_suite_founder",
    r1Role = "deal_lead",
    r2Seniority = "c_suite_founder",
    r2Role = "integration_lead",
    r1FirmTenure = "more_than_3_years",
    r2FirmTenure = "more_than_3_years",
    answersMode = "p1b",
    completionMetadata = null,
    metadataPatch = null,
  } = overrides;

  const base = Object.freeze({
    sessionId: r1SessionId,
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze({
        respondentSide: "acquirer",
        respondentAccessLevel: "full_deal_room_leadership_access",
        firmTenure: r1FirmTenure,
        ...(r1Seniority === null ? {} : { respondentSeniority: r1Seniority }),
        ...(r1Role === null ? {} : { respondentRole: r1Role }),
      }),
    }),
  });
  const answers = answersForMode(answersMode);
  const primary = attachAcquirerModuleResult(base, answers, COMPLETED_AT);
  assert.equal(primary.session.acquirer2A.completed, true);

  const invite = buildInvite(r2SessionId, r1SessionId);
  const writerMetadata = completionMetadata === false
    ? null
    : completionMetadata === "tenure-only"
      ? { firmTenure: r2FirmTenure }
      : { firmTenure: r2FirmTenure, respondentSeniority: r2Seniority, respondentRole: r2Role };
  const completion = completeAcquirerVerificationInvite(invite, answers, COMPLETED_AT, writerMetadata);
  assert.equal(completion.ok, true, `R2 writer completion must succeed for fixture ${JSON.stringify(overrides)}`);
  const session = attachAcquirerVerificationCompletion(primary.session, completion.invite);
  assert.equal(session.acquirerVerification.completed, true);

  if (metadataPatch === null) return session;
  return Object.freeze({
    ...session,
    acquirerVerification: Object.freeze({
      ...session.acquirerVerification,
      respondentMetadata: Object.freeze({
        ...session.acquirerVerification.respondentMetadata,
        ...metadataPatch,
      }),
    }),
  });
}

function assemble(session, moduleId = "acquirer_environment", candidatePair = ONE_HIGH_PAIR) {
  return assembleProductionDualAdjudicationInput({ session, moduleId, candidatePair });
}

function collectKeys(value, into = new Set(), seen = new Set()) {
  if (value == null || typeof value !== "object" || seen.has(value)) return into;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    into.add(key);
    collectKeys(child, into, seen);
  }
  return into;
}

function pairRowScopes(coreOutput) {
  const rows = coreOutput.audit?.pairRows ?? [];
  return rows.flatMap((row) => [row.left?.scope, row.right?.scope]).filter(Boolean);
}

// ——— C5B-00 ———

check("C5B-00", "validator registered and failure reasons are a closed enum", () => {
  assert.equal(
    PACKAGE_JSON.scripts["validate:c5b-production-adjudication-input-assembler"],
    "node scripts/validate-c5b-production-adjudication-input-assembler.mjs",
  );
  assert.equal(new Set(C5B_ASSEMBLY_FAILURE_REASONS).size, C5B_ASSEMBLY_FAILURE_REASONS.length);
  for (const reason of ["too_many_respondents", "legacy_r2_non_adjudicable"]) {
    assert.equal(C5B_ASSEMBLY_FAILURE_REASONS.includes(reason), true);
  }
  const lawful = assemble(productionSession());
  assert.equal(lawful.ok, true);
  evidence.baseline = { priority: compareDualRespondents(lawful.coreInput).priority };
});

// ——— C5B-01..24 ———

check("C5B-01", "assembler output matches the exact comparator coreInput shape with no extra or missing fields", () => {
  const result = assemble(productionSession());
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.coreInput).sort(), [
    "answers1",
    "answers2",
    "candidatePair",
    "moduleId",
    "respondent1",
    "respondent2",
  ]);
  assert.deepEqual(Object.keys(result.coreInput.respondent1).sort(), ["roleCode", "seniorityLevel"]);
  assert.deepEqual(Object.keys(result.coreInput.respondent2).sort(), ["roleCode", "seniorityLevel"]);
  assert.equal(result.coreInput.moduleId, "acquirerEnvironment");
  assert.equal(Object.isFrozen(result.coreInput), true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.audit), true);
});

check("C5B-02", "R1 context is built from real production state through the same C5-A adapter and fails closed when absent", () => {
  const session = productionSession();
  const result = assemble(session);
  const fresh = resolveCanonicalRespondentContext({
    respondentSeniority: "c_suite_founder",
    respondentRole: "deal_lead",
  });
  assert.deepEqual(result.coreInput.respondent1, fresh.respondent);
  assert.equal(result.coreInput.respondent1.seniorityLevel, "c_suite");

  const vp = assemble(productionSession({ r1Seniority: "vp_director_senior_leader", r1Role: "finance_lead" }));
  assert.equal(vp.ok, true);
  assert.equal(vp.coreInput.respondent1.seniorityLevel, "vp");

  // No R1 UI requirement change: the production writer still completes R1
  // without seniority, but the assembler fails closed.
  const noSeniority = productionSession({ r1Seniority: null });
  assert.equal(noSeniority.acquirer2A.completed, true);
  const refused = assemble(noSeniority);
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "missing_r1_context");

  const noRole = productionSession({ r1Role: null });
  assert.equal(assemble(noRole).ok, true, "R1 role stays optional product provenance");
  assert.equal(assemble(noRole).coreInput.respondent1.roleCode, null);
});

check("C5B-03", "R2 consumes Owner-accepted C5-A resolved metadata; legacy-only R2 is non-adjudicable", () => {
  const session = productionSession();
  const result = assemble(session);
  const stored = session.acquirerVerification.respondentMetadata.canonicalRespondentContext;
  const fresh = resolveCanonicalRespondentContext({
    respondentSeniority: "c_suite_founder",
    respondentRole: "integration_lead",
  });
  assert.deepEqual(result.coreInput.respondent2, stored.respondent);
  assert.deepEqual(result.coreInput.respondent2, fresh.respondent);

  const legacyThreeArg = productionSession({ completionMetadata: false });
  assert.equal(legacyThreeArg.acquirerVerification.completed, true);
  assert.equal(isAcquirerVerificationComplete(legacyThreeArg), true, "legacy helper path stays attach-compatible");
  assert.equal(Object.hasOwn(legacyThreeArg.acquirerVerification, "respondentMetadata"), false);
  assert.equal(assemble(legacyThreeArg).reason, "legacy_r2_non_adjudicable");

  const legacyTenureOnly = productionSession({ r2FirmTenure: "less_than_18_months", completionMetadata: "tenure-only" });
  assert.equal(assemble(legacyTenureOnly).reason, "legacy_r2_non_adjudicable");
});

check("C5B-04", "raw product membership rejects forged values before any scope resolution", () => {
  const forgedSeniorityCanonical = (seniority) => ({
    status: "resolved",
    productSeniority: seniority,
    productRole: "integration_lead",
    canonicalSeniorityLevel: "c_suite",
    canonicalSeniorityTier: "senior",
    roleCode: "integration_lead",
    respondent: Object.freeze({ roleCode: "integration_lead", seniorityLevel: "c_suite" }),
  });
  const forgedRoleCanonical = (role) => ({
    status: "resolved",
    productSeniority: "c_suite_founder",
    productRole: role,
    canonicalSeniorityLevel: "c_suite",
    canonicalSeniorityTier: "senior",
    roleCode: role,
    respondent: Object.freeze({ roleCode: role, seniorityLevel: "c_suite" }),
  });

  const rejections = [
    ["unknown seniority", { respondentSeniority: "chief_of_staff", canonicalRespondentContext: forgedSeniorityCanonical("chief_of_staff") }, "invalid_r2_context"],
    ["target-only role on acquirer R2", { respondentRole: TARGET_ONLY_ROLE, canonicalRespondentContext: forgedRoleCanonical(TARGET_ONLY_ROLE) }, "invalid_r2_context"],
    ["forged unspecified role", { respondentRole: "unspecified", canonicalRespondentContext: forgedRoleCanonical("unspecified") }, "invalid_r2_context"],
    ["prototype-chain seniority key", { respondentSeniority: "constructor", canonicalRespondentContext: forgedSeniorityCanonical("constructor") }, "invalid_r2_context"],
    ["non-string role", { respondentRole: 42 }, "legacy_r2_non_adjudicable"],
    ["empty seniority", { respondentSeniority: "" }, "legacy_r2_non_adjudicable"],
  ];
  for (const [label, patch, expectedReason] of rejections) {
    const result = assemble(productionSession({ metadataPatch: patch }));
    assert.equal(result.ok, false, label);
    assert.equal(result.reason, expectedReason, label);
    assert.equal(Object.hasOwn(result.audit, "canonicalSeniorityLevel"), false, `${label}: rejected before canonical/scope consumption`);
  }

  const r1Rejections = [
    ["R1 prototype seniority", { r1Seniority: "constructor" }, "invalid_r1_context"],
    ["R1 unspecified role", { r1Role: "unspecified" }, "invalid_r1_context"],
    ["R1 unknown role", { r1Role: "not_a_product_role" }, "invalid_r1_context"],
  ];
  for (const [label, overrides, expectedReason] of r1Rejections) {
    const result = assemble(productionSession(overrides));
    assert.equal(result.ok, false, label);
    assert.equal(result.reason, expectedReason, label);
  }

  assert.doesNotMatch(ASSEMBLER_SOURCE, /resolveObservationScope/, "assembler never resolves observation scope itself");
});

check("C5B-05", "canonical consistency: forged internally-consistent canonical blocks are rejected", () => {
  const tierForged = assemble(productionSession({ metadataPatch: {
    canonicalRespondentContext: {
      status: "resolved",
      productSeniority: "c_suite_founder",
      productRole: "integration_lead",
      canonicalSeniorityLevel: "manager",
      canonicalSeniorityTier: "line_level",
      roleCode: "integration_lead",
      respondent: Object.freeze({ roleCode: "integration_lead", seniorityLevel: "manager" }),
    },
  } }));
  assert.equal(tierForged.ok, false);
  assert.equal(tierForged.reason, "invalid_r2_context");

  const roleCodeForged = assemble(productionSession({ metadataPatch: {
    canonicalRespondentContext: {
      status: "resolved",
      productSeniority: "c_suite_founder",
      productRole: "integration_lead",
      canonicalSeniorityLevel: "c_suite",
      canonicalSeniorityTier: "senior",
      roleCode: "finance_lead",
      respondent: Object.freeze({ roleCode: "finance_lead", seniorityLevel: "c_suite" }),
    },
  } }));
  assert.equal(roleCodeForged.ok, false);
  assert.equal(roleCodeForged.reason, "invalid_r2_context");

  const lawful = assemble(productionSession());
  assert.equal(lawful.ok, true);
  assert.equal(lawful.coreInput.respondent2.seniorityLevel, "c_suite");
});

check("C5B-06", "slot tokens are never accepted as physical identity", () => {
  for (const token of ["primary", "verification", "R1", "R2"]) {
    const r1 = assemble(productionSession({ r1SessionId: token }));
    assert.equal(r1.ok, false, `R1 sessionId ${token}`);
    assert.equal(r1.reason, "missing_r1_identity");
    const r2 = assemble(productionSession({ r2SessionId: token }));
    assert.equal(r2.ok, false, `R2 verification session id ${token}`);
    assert.equal(r2.reason, "missing_r2_identity");
  }
  const lawful = assemble(productionSession());
  assert.equal(lawful.audit.respondents.r1.respondentId, "c5b-r1-session");
  assert.equal(lawful.audit.respondents.r2.respondentId, "c5b-r2-session");
});

check("C5B-07", "duplicate physical identity is preserved explicitly and never rewritten", () => {
  const session = productionSession({ r1SessionId: "c5b-same-person", r2SessionId: "c5b-same-person" });
  const result = assemble(session);
  assert.equal(result.ok, true);
  assert.equal(result.audit.respondents.samePhysicalRespondent, true);
  assert.equal(result.audit.respondents.r1.respondentId, "c5b-same-person");
  assert.equal(result.audit.respondents.r2.respondentId, "c5b-same-person");
  const keys = collectKeys(result);
  for (const forbidden of FORBIDDEN_C5C_KEYS) {
    assert.equal(keys.has(forbidden), false, forbidden);
  }
  const coreOutput = compareDualRespondents(result.coreInput);
  assert.equal(typeof coreOutput.priority, "string");
});

check("C5B-08", "module translation uses only the explicit authorized map; unknown or transformed ids fail closed", () => {
  const lawful = assemble(productionSession(), "acquirer_environment");
  assert.equal(lawful.ok, true);
  assert.equal(lawful.coreInput.moduleId, "acquirerEnvironment");
  assert.equal(lawful.audit.module.productionPath, "acquirer_environment");

  for (const moduleId of [
    "target_self_assessment",
    "acquirer_environment_combined",
    "ACQUIRER_ENVIRONMENT",
    "acquirerenvironment",
    "acquirer-environment",
    "constructor",
    "",
    null,
    42,
  ]) {
    const result = assembleProductionDualAdjudicationInput({
      session: productionSession(),
      moduleId,
      candidatePair: ONE_HIGH_PAIR,
    });
    assert.equal(result.ok, false, JSON.stringify(moduleId));
    assert.equal(result.reason, "unsupported_module", JSON.stringify(moduleId));
  }
  assert.doesNotMatch(ASSEMBLER_SOURCE, /toLowerCase|toUpperCase|toCamel|snakeToCamel/, "no casing transform exists");
});

check("C5B-09", "observation scope resolution stays lawful for senior, line-level and external respondents", () => {
  const senior = assemble(productionSession());
  assert.equal(senior.ok, true);
  const seniorScope = (questionRef, answer) => resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: questionRef,
    respondent: senior.coreInput.respondent1,
    selectedOption: answer.selectedOption,
    directObservationGate: answer.directObservationGate,
    evidenceType: answer.evidenceType,
    reliabilityFlags: answer.reliabilityFlags,
  });
  const q1 = seniorScope("Q1", senior.coreInput.answers1.Q1);
  assert.equal(q1.useClass, "PRIMARY");
  assert.equal(q1.comparisonAvailability, "available");
  assert.equal(q1.seniorityTier, "senior");

  const line = assemble(productionSession({ r1Seniority: "manager_functional_lead" }));
  assert.equal(line.ok, true);
  const lineQ1 = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: line.coreInput.respondent1,
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
  });
  const lineQ2 = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q2",
    respondent: line.coreInput.respondent1,
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
  });
  assert.equal(lineQ1.useClass, "CONTEXTUAL");
  assert.equal(lineQ2.useClass, "INELIGIBLE");

  const external = assemble(productionSession({ r1Seniority: "external_advisor" }));
  assert.equal(external.ok, true, "external respondent context is assembly-lawful");
  const externalQ1 = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: external.coreInput.respondent1,
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
  });
  assert.equal(externalQ1.useClass, "UNRESOLVED");
  assert.equal(externalQ1.routing, "practitioner_access_review");
  const externalOutcome = compareDualRespondents(external.coreInput);
  assert.equal(externalOutcome.priority, "0c");
  assert.equal(externalOutcome.routing, "practitioner_access_review");

  for (const token of ["c_suite", "vp", "manager", "ic", "external"]) {
    const outcome = resolveObservationScope({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: "Q1",
      respondent: { roleCode: "deal_lead", seniorityLevel: token },
      selectedOption: "A",
    });
    assert.notEqual(outcome.audit.unresolvedReason, "unknown_seniority", token);
  }
});

check("C5B-10", "UseClass vocabulary stays exactly PRIMARY/CONTEXTUAL/INELIGIBLE/UNRESOLVED", () => {
  for (const overrides of [{}, { r1Seniority: "manager_functional_lead" }, { r1Seniority: "external_advisor" }]) {
    const result = assemble(productionSession(overrides));
    assert.equal(result.ok, true);
    for (const scope of pairRowScopes(compareDualRespondents(result.coreInput))) {
      assert.equal(USE_CLASS_VALUES.includes(scope.useClass), true, scope.useClass);
    }
  }
  assert.doesNotMatch(ASSEMBLER_SOURCE, /PRIMARY|CONTEXTUAL|INELIGIBLE|UNRESOLVED/, "assembler defines no UseClass vocabulary");
});

check("C5B-11", "P_1B exactness: Q11 observation-gap discriminator reaches 1b; substantive E and generic unavailability do not", () => {
  const oneHigh = assemble(productionSession({ answersMode: "p1b" }), "acquirer_environment", ONE_HIGH_PAIR);
  assert.equal(oneHigh.ok, true);
  const oneHighOutcome = compareDualRespondents(oneHigh.coreInput);
  assert.equal(oneHighOutcome.priority, "1b");
  assert.equal(oneHighOutcome.audit.exact1bSpecialCondition, true);
  assert.equal(oneHighOutcome.routing, "practitioner_review");

  const substantive = assemble(productionSession({ answersMode: "e" }), "acquirer_environment", ONE_HIGH_PAIR);
  const substantiveOutcome = compareDualRespondents(substantive.coreInput);
  assert.equal(substantiveOutcome.audit.exact1bSpecialCondition, false);
  assert.notEqual(substantiveOutcome.priority, "1b");
  assert.equal(substantiveOutcome.priority, "5A");

  const generic = assemble(productionSession({ answersMode: "unknownAll" }), "acquirer_environment", NON_ONE_HIGH_PAIR);
  assert.equal(generic.ok, true);
  const genericOutcome = compareDualRespondents(generic.coreInput);
  assert.equal(genericOutcome.audit.exact1bSpecialCondition, false);
  assert.equal(genericOutcome.priority, "1");
  assert.equal(genericOutcome.routing, "coverage_insufficient");

  evidence.p1b = {
    oneHighPair: ONE_HIGH_PAIR,
    gapPriority: oneHighOutcome.priority,
    substantivePriority: substantiveOutcome.priority,
    genericPriority: genericOutcome.priority,
  };
});

check("C5B-12", "precedence order stays byte-identical and the comparator is not reimplemented", () => {
  assert.deepEqual(dualPrecedenceOrder(), DUAL_PRECEDENCE);
  assert.match(COMPARATOR_SOURCE, /Object\.freeze\(\["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"\]\)/);
  assert.doesNotMatch(ASSEMBLER_SOURCE, /compareDualRespondents\(/, "assembler never invokes the comparator");
  assert.doesNotMatch(ASSEMBLER_SOURCE, /classificationPrecedence|precedenceRow/, "assembler carries no precedence logic");
});

check("C5B-13", "candidatePair comes only from the invocation parameter validated against corpus production pairs", () => {
  for (const pair of PRODUCTION_PAIRS) {
    const result = assemble(productionSession({ answersMode: "e" }), "acquirer_environment", pair);
    assert.equal(result.ok, true, pair);
    assert.equal(result.coreInput.candidatePair, pair);
    assert.equal(result.audit.candidatePair.source, "invocation_parameter");
  }

  const reversed = ONE_HIGH_PAIR.split(" vs ").reverse().join(" vs ");
  const loose = ONE_HIGH_PAIR.split(" vs ").join("   vs   ");
  for (const variant of [reversed, loose]) {
    const result = assemble(productionSession({ answersMode: "e" }), "acquirer_environment", variant);
    assert.equal(result.ok, true, variant);
    assert.equal(result.coreInput.candidatePair, variant, "exact byte-for-byte carriage");
    const outcome = compareDualRespondents(result.coreInput);
    assert.notEqual(outcome.routing, "practitioner_pair_diagnosis", `comparator accepts the same normalization for ${variant}`);
  }

  for (const [pair, reason] of [
    ["NT/STJ vs NF/SFP", "unsupported_candidate_pair"],
    ["garbage", "unsupported_candidate_pair"],
    ["", "missing_candidate_pair"],
    [null, "missing_candidate_pair"],
    [42, "missing_candidate_pair"],
  ]) {
    const result = assembleProductionDualAdjudicationInput({
      session: productionSession(),
      moduleId: "acquirer_environment",
      candidatePair: pair,
    });
    assert.equal(result.ok, false, JSON.stringify(pair));
    assert.equal(result.reason, reason, JSON.stringify(pair));
  }

  assert.doesNotMatch(
    ASSEMBLER_SOURCE,
    /signalStrength|supportStrength|coPresence|primaryEnvironmentCode|compositionGap|evidenceYield|primarySupport/,
    "candidatePair is never derived from score maps",
  );
});

check("C5B-14", "outOfPairEvidence has no production source: absent from coreInput and never inferred", () => {
  const result = assemble(productionSession());
  assert.equal(Object.hasOwn(result.coreInput, "outOfPairEvidence"), false);
  assert.deepEqual(result.audit.outOfPairEvidence, { carried: false, source: "none" });
  const outcome = compareDualRespondents(result.coreInput);
  assert.notEqual(outcome.priority, "2");
  assert.notEqual(outcome.routing, "candidate_4b_practitioner_confirmation_required");
  assert.doesNotMatch(ASSEMBLER_SOURCE, /outOfPairEvidence\s*[:=]\s*true/, "no threshold inference exists");
});

check("C5B-15", "coherenceAmbiguous has no production source: absent from coreInput and never inferred", () => {
  const result = assemble(productionSession());
  assert.equal(Object.hasOwn(result.coreInput, "coherenceAmbiguous"), false);
  assert.deepEqual(result.audit.coherenceAmbiguous, { carried: false, source: "none" });
  const outcome = compareDualRespondents(result.coreInput);
  assert.notEqual(outcome.priority, "5X");
  assert.doesNotMatch(ASSEMBLER_SOURCE, /coherenceAmbiguous\s*[:=]\s*true/, "no coherence heuristic exists");
});

check("C5B-16", "pairwise only: exactly two adjudicable contributions, no majority or top-two selection", () => {
  const result = assemble(productionSession());
  assert.equal(result.audit.contributions.count, 2);
  assert.deepEqual(result.audit.contributions.slots, ["primary", "verification"]);
  assert.equal(C5B_ASSEMBLY_FAILURE_REASONS.includes("too_many_respondents"), true);

  const withUnknownExtraStore = Object.freeze({
    ...productionSession(),
    acquirerVerification2: Object.freeze({ completed: true, answers: {} }),
  });
  const bounded = assemble(withUnknownExtraStore);
  assert.equal(bounded.ok, true, "unknown extra stores are not adjudicable contributions");
  assert.equal(bounded.audit.contributions.count, 2);

  assert.match(
    ASSEMBLER_SOURCE,
    /export function assembleProductionDualAdjudicationInput\(\{ session, moduleId, candidatePair \} = \{\}\)/,
    "the assembler exposes no respondent-enumeration input",
  );
  assert.doesNotMatch(ASSEMBLER_SOURCE, /majority|topTwo|top_two/, "no majority/top-two logic exists");
});

check("C5B-17", "tenure stays scoring-only: identical assembled input and scope outcomes across tenure values", () => {
  const shortTenure = productionSession({
    r1FirmTenure: "less_than_18_months",
    r2FirmTenure: "less_than_18_months",
  });
  const longTenure = productionSession({});
  assert.notEqual(shortTenure.acquirer2A.score.totalEvidenceWeight, longTenure.acquirer2A.score.totalEvidenceWeight);

  const short = assemble(shortTenure);
  const long = assemble(longTenure);
  assert.equal(short.ok, true);
  assert.equal(long.ok, true);
  assert.deepEqual(short.coreInput.respondent1, long.coreInput.respondent1);
  assert.deepEqual(short.coreInput.respondent2, long.coreInput.respondent2);
  assert.deepEqual(short.coreInput.answers1, long.coreInput.answers1);
  assert.notDeepEqual(short.audit.tenureProvenance, long.audit.tenureProvenance, "tenure is carried as provenance only");

  const shortOutcome = compareDualRespondents(short.coreInput);
  const longOutcome = compareDualRespondents(long.coreInput);
  assert.equal(shortOutcome.priority, longOutcome.priority);
  assert.equal(shortOutcome.state, longOutcome.state);
  for (const scope of [...pairRowScopes(shortOutcome), ...pairRowScopes(longOutcome)]) {
    assert.equal(USE_CLASS_VALUES.includes(scope.useClass), true);
    assert.equal(["available", "unavailable"].includes(scope.comparisonAvailability), true);
  }
  const tenureKeys = collectKeys(short.coreInput);
  assert.equal(tenureKeys.has("firmTenure"), false, "coreInput carries no tenure field");
});

check("C5B-18", "C4 non-regression: assembler leaves individual respondent scores untouched", () => {
  const session = productionSession();
  const before = structuredClone(session);
  const result = assemble(session);
  assert.equal(result.ok, true);
  assert.deepEqual(session, before);
  assert.equal(Object.is(result.coreInput.answers1, session.acquirer2A.answers), true);
  compareDualRespondents(result.coreInput);
  assert.deepEqual(session, before, "comparator execution does not mutate session state either");
  assert.doesNotMatch(
    ASSEMBLER_SOURCE,
    /layeredEvidenceScoring|scoreAcquirerModule|scoreCombinedAcquirerModule/,
    "assembler never invokes scoring",
  );
});

check("C5B-19", "no canonical state mutation: session, scores, answers and deliverables are unchanged", () => {
  const session = productionSession();
  const before = structuredClone(session);
  const result = assemble(session);
  assert.equal(result.ok, true);
  assert.deepEqual(session, before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.coreInput), true);
  assert.equal(Object.isFrozen(result.audit), true);
  assert.equal(Object.isFrozen(result.audit.respondents), true);
  assert.doesNotMatch(
    ASSEMBLER_SOURCE,
    /finalDeliverable|determineOutcome|mergeTwoScores|buildPairDeliverable|triageEngine|contradictionEngine/,
    "assembler touches no deliverable or outcome surface",
  );
});

check("C5B-20", "no C5-C output: no adjudicationState, environment projection, independence basis or confidence uplift", () => {
  const results = [
    assemble(productionSession()),
    assemble(productionSession({ answersMode: "e" })),
    assemble(productionSession({ r1Seniority: "external_advisor" })),
    assemble(productionSession({ r1SessionId: "c5b-same-person", r2SessionId: "c5b-same-person" })),
  ];
  for (const result of results) {
    assert.equal(result.ok, true);
    const keys = collectKeys(result);
    for (const forbidden of FORBIDDEN_C5C_KEYS) {
      assert.equal(keys.has(forbidden), false, forbidden);
    }
  }
  assert.deepEqual(
    Object.keys(assemble(productionSession()).coreInput).sort(),
    ["answers1", "answers2", "candidatePair", "moduleId", "respondent1", "respondent2"],
  );
});

check("C5B-21", "comparator round-trip: lawful assembled coreInput executes deterministically without shape failure", () => {
  const fixtures = [
    ["p1b", productionSession({ answersMode: "p1b" }), ONE_HIGH_PAIR],
    ["convergent", productionSession({ answersMode: "e" }), ONE_HIGH_PAIR],
    ["generic", productionSession({ answersMode: "unknownAll" }), NON_ONE_HIGH_PAIR],
  ];
  for (const [label, session, pair] of fixtures) {
    const result = assemble(session, "acquirer_environment", pair);
    assert.equal(result.ok, true, label);
    const first = compareDualRespondents(result.coreInput);
    const second = compareDualRespondents(result.coreInput);
    assert.equal(typeof first.priority, "string", label);
    assert.equal(Object.isFrozen(first), true, label);
    assert.equal(
      JSON.stringify(first),
      JSON.stringify(second),
      `${label}: re-derivation is deterministic (engineSnapshot binding equality mechanism)`,
    );
    if (first.audit?.pairRows) {
      assert.equal(first.audit.pairRows.length, 11, label);
    }
    evidence[label] = { priority: first.priority, routing: first.routing };
  }
});

check("C5B-22", "legacy R2 completions stay helper-compatible but never assemble lawful coreInput", () => {
  const threeArgSession = productionSession({ completionMetadata: false });
  assert.equal(threeArgSession.acquirer2A.score.verificationIncluded, true);
  const threeArg = assemble(threeArgSession);
  assert.equal(threeArg.ok, false);
  assert.equal(threeArg.reason, "legacy_r2_non_adjudicable");

  const tenureOnly = completeAcquirerVerificationInvite(
    buildInvite("c5b-r2-legacy", "c5b-r1-session"),
    answersForMode("e"),
    COMPLETED_AT,
    { firmTenure: "less_than_18_months" },
  );
  assert.equal(tenureOnly.ok, true);
  assert.deepEqual(
    tenureOnly.invite.acquirerVerification.respondentMetadata,
    { firmTenure: "less_than_18_months" },
  );

  const seniorityOnly = completeAcquirerVerificationInvite(
    buildInvite("c5b-r2-legacy", "c5b-r1-session"),
    answersForMode("e"),
    COMPLETED_AT,
    { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder" },
  );
  assert.equal(seniorityOnly.ok, true, "writer keeps seniority-only completions helper-compatible");
  const seniorityAttached = attachAcquirerVerificationCompletion(
    productionSession({ answersMode: "e", r2SessionId: "c5b-r2-legacy" }),
    seniorityOnly.invite,
  );
  assert.equal(seniorityAttached.acquirerVerification.completed, true);
  const refused = assemble(seniorityAttached);
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "legacy_r2_non_adjudicable");
});

check("C5B-23", "forged 'unspecified' role fails product membership before scope resolution", () => {
  const forged = assemble(productionSession({ metadataPatch: {
    respondentRole: "unspecified",
    canonicalRespondentContext: {
      status: "resolved",
      productSeniority: "c_suite_founder",
      productRole: "unspecified",
      canonicalSeniorityLevel: "c_suite",
      canonicalSeniorityTier: "senior",
      roleCode: "unspecified",
      respondent: Object.freeze({ roleCode: "unspecified", seniorityLevel: "c_suite" }),
    },
  } }));
  assert.equal(forged.ok, false);
  assert.equal(forged.reason, "invalid_r2_context");
  assert.equal(Object.hasOwn(forged.audit, "canonicalSeniorityLevel"), false);
  assert.equal(ACQUIRER_SIDE_ROLE_VALUES.has("unspecified"), false);

  const r1Forged = assemble(productionSession({ r1Role: "unspecified" }));
  assert.equal(r1Forged.reason, "invalid_r1_context");
});

check("C5B-24", "R1 and R2 resolve through the same C5-A adapter implementation", () => {
  const session = productionSession({ r1Seniority: "vp_director_senior_leader", r1Role: "board_sponsor" });
  const result = assemble(session);
  assert.equal(result.ok, true);
  const r1Fresh = resolveCanonicalRespondentContext({
    respondentSeniority: "vp_director_senior_leader",
    respondentRole: "board_sponsor",
  });
  const r2Fresh = resolveCanonicalRespondentContext({
    respondentSeniority: session.acquirerVerification.respondentMetadata.respondentSeniority,
    respondentRole: session.acquirerVerification.respondentMetadata.respondentRole,
  });
  assert.deepEqual(result.coreInput.respondent1, r1Fresh.respondent);
  assert.deepEqual(result.coreInput.respondent2, r2Fresh.respondent);
  assert.deepEqual(
    session.acquirerVerification.respondentMetadata.canonicalRespondentContext,
    r2Fresh,
    "stored R2 canonical equals a fresh same-adapter derivation",
  );
  assert.match(ASSEMBLER_SOURCE, /from "\.\/respondentContextBridge\.js"/);
  assert.doesNotMatch(ASSEMBLER_SOURCE, /PRODUCT_SENIORITY_CANONICAL_MAP\s*=/, "no duplicated seniority map exists");
  assert.doesNotMatch(ASSEMBLER_SOURCE, /canonicalSeniorityTier:\s*"/, "no local tier literals exist");
});

// ——— runner ———

const failures = [];
for (const { id, label, fn } of checks) {
  try {
    fn();
    console.log(`PASS ${id} ${label}`);
  } catch (error) {
    failures.push({ id, label, error });
    console.error(`FAIL ${id} ${label}`);
    console.error(`  ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error(`C5-B production adjudication input assembler validation failed: ${failures.length}/${checks.length} check(s) failed.`);
  process.exit(1);
}

console.log(`C5-B production adjudication input assembler validation passed: ${checks.length}/${checks.length}`);
console.log(`EVIDENCE baseline ${JSON.stringify(evidence.baseline)}`);
console.log(`EVIDENCE p1b ${JSON.stringify(evidence.p1b)}`);
console.log(`EVIDENCE roundtrip ${JSON.stringify({ convergent: evidence.convergent, generic: evidence.generic })}`);
