import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  ACQUIRER_VERIFICATION_RESPONDENT_CONTEXT_REQUIRED,
  RESPONDENT_ROLE_OPTIONS,
  RESPONDENT_SENIORITY_OPTIONS,
  TRANSACTION_DETAIL_SECTIONS,
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  completeAcquirerVerificationInvite,
  firmTenureEvidenceMultiplier,
  isResolvedAcquirerVerificationRespondentContext,
  isAcquirerVerificationComplete,
} from "../src/flow/acquirerTrackFlow.js";
import {
  PRODUCT_SENIORITY_CANONICAL_MAP,
  RespondentContextBridgeConfigurationError,
  resolveCanonicalRespondentContext,
  validateRespondentContextBridgeAlignment,
} from "../src/flow/respondentContextBridge.js";
import {
  isAuthorizedDualModule,
  resolveObservationScope,
} from "../src/flow/observationScopeResolver.js";
import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };

const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const ACQUIRER_FLOW_SOURCE = readFileSync(new URL("../src/flow/acquirerTrackFlow.js", import.meta.url), "utf8");
const BRIDGE_SOURCE = readFileSync(new URL("../src/flow/respondentContextBridge.js", import.meta.url), "utf8");
const PACKAGE_JSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const DUAL = scoringAndTriage.dualRespondentComparison;
const PRODUCT_SENIORITY_VALUES = RESPONDENT_SENIORITY_OPTIONS.map((option) => option.value);
const PRODUCT_ROLE_VALUES = RESPONDENT_ROLE_OPTIONS.map((option) => option.value);
const AEM_QUESTIONS = ACQUIRER_TRACK_DATA.acquirerModule.questions;
const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const SHORT_TENURE = "less_than_18_months";
const MID_TENURE = "18_months_to_3_years";
const LONG_TENURE = "more_than_3_years";
const COMPLETED_AT = "2026-08-26T12:00:00.000Z";
const CANONICAL_SENIORITY_TOKENS = ["c_suite", "vp", "director", "manager", "ic", "external"];
const USE_CLASS_VOCABULARY = ["PRIMARY", "CONTEXTUAL", "INELIGIBLE", "UNRESOLVED"];
const DUAL_PRECEDENCE = ["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"];

const checks = [];
const coverageEvidence = {};
const scopeEvidence = {};
const persistenceEvidence = {};
const tenureEvidence = {};
const p1bEvidence = {};
const admissionEvidence = {};

function check(id, label, fn) {
  checks.push({ id, label, fn });
}

function answersFor(questions, optionIndex = 0) {
  return Object.fromEntries(questions.map((question) => {
    const option = question.options[Math.min(optionIndex, question.options.length - 1)];
    return [question.id, evidenceClassifiedAnswer(option.value)];
  }));
}

function verificationInvite(overrides = {}) {
  return Object.freeze({
    acquirerVerificationSessionId: "c5a-r2",
    assessmentSessionId: "c5a-r1",
    completed: false,
    revoked: false,
    createdAt: "2026-08-26T10:00:00.000Z",
    expiresAt: "2026-08-29T10:00:00.000Z",
    ...overrides,
  });
}

function acquirerSession(firmTenure, answers = answersFor(AEM_QUESTIONS)) {
  const base = Object.freeze({
    sessionId: "c5a-r1",
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze({
        respondentSide: "acquirer",
        respondentAccessLevel: "full_deal_room_leadership_access",
        firmTenure,
      }),
    }),
  });
  return attachAcquirerModuleResult(base, answers, COMPLETED_AT).session;
}

// Mirrors publishAcquirerVerificationCompletion in App.jsx: the exact payload
// envelope the live cross-tab receivers parse and admit.
function completionPayload(invite) {
  return {
    assessmentSessionId: invite.assessmentSessionId,
    acquirerVerificationSessionId: invite.acquirerVerificationSessionId,
    codeHash: invite.codeHash ?? "c5a-code-hash",
    completed: true,
    completedAt: invite.completedAt ?? invite.acquirerVerification?.storedAt ?? COMPLETED_AT,
    acquirerVerification: invite.acquirerVerification,
  };
}

function productionAdmits(invite) {
  const payload = completionPayload(invite);
  return isResolvedAcquirerVerificationRespondentContext(payload);
}

function resolveForProduct(productSeniority, productRole = "integration_lead") {
  const canonical = resolveCanonicalRespondentContext({
    respondentSeniority: productSeniority,
    respondentRole: productRole,
  });
  assert.equal(canonical.status, "resolved", `bridge must resolve ${productSeniority}`);
  return resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: canonical.respondent,
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
  });
}

function functionBlock(source, functionName, nextFunctionName) {
  const start = source.indexOf(`function ${functionName}`);
  const end = source.indexOf(`function ${nextFunctionName}`, start + 1);
  assert.ok(start >= 0 && end > start, `${functionName} block not found`);
  return source.slice(start, end);
}

function matchingClose(source, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function topLevelArguments(source) {
  const args = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "(" || char === "{" || char === "[") depth += 1;
    else if (char === ")" || char === "}" || char === "]") depth -= 1;
    else if (char === "," && depth === 0) {
      args.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  args.push(source.slice(start).trim());
  return args;
}

function corpusSeniorityTokenTiers() {
  const tokenTiers = new Map();
  for (const row of DUAL.seniorityTierMapping) {
    const tier = String(row.seniorityTier ?? "").trim();
    for (const token of String(row.respondentSenioritylevelValues ?? "").split(",")) {
      const value = token.trim();
      if (value) tokenTiers.set(value, tier);
    }
  }
  return tokenTiers;
}

check("C5A-01", "Complete product seniority coverage through the bridge", () => {
  assert.deepEqual(
    Object.keys(PRODUCT_SENIORITY_CANONICAL_MAP).sort(),
    [...PRODUCT_SENIORITY_VALUES].sort(),
  );
  coverageEvidence.rows = [];
  for (const productValue of PRODUCT_SENIORITY_VALUES) {
    const canonical = resolveCanonicalRespondentContext({
      respondentSeniority: productValue,
      respondentRole: "deal_lead",
    });
    assert.equal(canonical.status, "resolved", productValue);
    assert.ok(CANONICAL_SENIORITY_TOKENS.includes(canonical.canonicalSeniorityLevel), productValue);
    for (const questionRef of QUESTIONS) {
      const scope = resolveObservationScope({
        moduleId: "acquirerEnvironment",
        workbookQuestionId: questionRef,
        canonicalQuestionId: `ACQUIRERENVIRONMENT-${questionRef}`,
        respondent: canonical.respondent,
        selectedOption: "A",
        directObservationGate: "yes",
        evidenceType: "direct_observation",
        reliabilityFlags: [],
      });
      assert.notEqual(scope.audit?.unresolvedReason, "unknown_seniority", `${productValue} ${questionRef}`);
      assert.ok(USE_CLASS_VOCABULARY.includes(scope.useClass), `${productValue} ${questionRef} useClass`);
      if (canonical.canonicalSeniorityTier !== "external") {
        assert.notEqual(scope.useClass, "UNRESOLVED", `${productValue} ${questionRef} tier default`);
      }
    }
    coverageEvidence.rows.push({
      productValue,
      canonicalSeniorityLevel: canonical.canonicalSeniorityLevel,
      canonicalSeniorityTier: canonical.canonicalSeniorityTier,
    });
  }
});

check("C5A-02", "No ambiguous cross-tier product mapping exists and drift fails closed", () => {
  const tokenTiers = corpusSeniorityTokenTiers();
  for (const [productValue, mapping] of Object.entries(PRODUCT_SENIORITY_CANONICAL_MAP)) {
    const tiers = new Set();
    for (const token of mapping.canonicalTokens) {
      const tier = tokenTiers.get(token);
      assert.ok(tier, `${productValue}: token ${token} must exist in the corpus vocabulary`);
      tiers.add(tier);
    }
    assert.equal(tiers.size, 1, `${productValue} represented tokens must span exactly one tier`);
    assert.equal([...tiers][0], mapping.canonicalSeniorityTier, productValue);
  }
  const alignment = validateRespondentContextBridgeAlignment();
  assert.equal(alignment.ok, true);
  assert.deepEqual([...alignment.corpusSeniorityTokens].sort(), [...CANONICAL_SENIORITY_TOKENS].sort());
  const driftedCorpus = structuredClone(scoringAndTriage);
  for (const row of driftedCorpus.dualRespondentComparison.seniorityTierMapping) {
    if (row.seniorityTier === "line_level") {
      row.respondentSenioritylevelValues = "ic";
    }
    if (row.seniorityTier === "senior") {
      row.respondentSenioritylevelValues = "c_suite, vp, director, manager";
    }
  }
  assert.throws(
    () => validateRespondentContextBridgeAlignment(driftedCorpus.dualRespondentComparison),
    (error) => error instanceof RespondentContextBridgeConfigurationError,
  );
});

check("C5A-03", "Unknown or missing seniority fails closed with no silent mapping", () => {
  for (const invalidInput of ["", null, undefined, "ceo-ish", "senior_person", "vp_or_manager", 17, {}]) {
    const result = resolveCanonicalRespondentContext({
      respondentSeniority: invalidInput,
      respondentRole: "deal_lead",
    });
    assert.equal(result.status, "unsupported", JSON.stringify(invalidInput));
    assert.ok(["missing_seniority", "unknown_seniority"].includes(result.reason), JSON.stringify(invalidInput));
    assert.equal(result.respondent, null, JSON.stringify(invalidInput));
    assert.equal(Object.hasOwn(result, "canonicalSeniorityLevel"), false, JSON.stringify(invalidInput));
  }
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: { roleCode: "deal_lead", seniorityLevel: "ceo-ish" },
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
  });
  assert.equal(scope.useClass, "UNRESOLVED");
  assert.equal(scope.audit.unresolvedReason, "unknown_seniority");
});

check("C5A-04", "Corpus seniority vocabulary remains unchanged and production tokens never enter it", () => {
  const tokenTiers = corpusSeniorityTokenTiers();
  assert.deepEqual([...tokenTiers.keys()].sort(), [...CANONICAL_SENIORITY_TOKENS].sort());
  for (const productValue of PRODUCT_SENIORITY_VALUES) {
    assert.equal(tokenTiers.has(productValue), false, `corpus must not absorb ${productValue}`);
  }
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    respondent: { roleCode: "deal_lead", seniorityLevel: "board_investment_committee" },
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
  });
  assert.equal(scope.useClass, "UNRESOLVED");
  assert.equal(scope.audit.unresolvedReason, "unknown_seniority");
  coverageEvidence.corpusTokens = [...tokenTiers.keys()].sort();
});

check("C5A-05", "Exactly one respondent-context mapping implementation exists and the bridge is slot-agnostic", () => {
  // Claim scope (CORR1-corrected): this proves a single mapping implementation,
  // no duplicated mapping tables, and no slot-specific inference in the bridge.
  // It does NOT claim R1 runtime currently executes the bridge — R1 assembly
  // is deferred to C5-B by Owner decision.
  assert.doesNotMatch(APP_SOURCE, /["'`]c_suite["'`]/);
  assert.doesNotMatch(ACQUIRER_FLOW_SOURCE, /["'`]c_suite["'`]/);
  assert.doesNotMatch(APP_SOURCE, /canonicalSeniority|canonicalTokens|seniorityTier/);
  assert.doesNotMatch(ACQUIRER_FLOW_SOURCE, /canonicalTokens|seniorityTierMapping/);
  assert.doesNotMatch(BRIDGE_SOURCE, /respondentSlot|"primary"|"verification"|physicalRespondentId/);
  for (const productValue of PRODUCT_SENIORITY_VALUES) {
    const asPrimary = resolveCanonicalRespondentContext({
      respondentSeniority: productValue,
      respondentRole: "integration_lead",
      respondentSlot: "primary",
    });
    const asVerification = resolveCanonicalRespondentContext({
      respondentSeniority: productValue,
      respondentRole: "integration_lead",
      respondentSlot: "verification",
    });
    assert.deepEqual(asPrimary, asVerification, productValue);
  }
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    {
      firmTenure: MID_TENURE,
      respondentSeniority: "vp_director_senior_leader",
      respondentRole: "integration_lead",
    },
  );
  assert.equal(completion.ok, true);
  const stored = completion.invite.acquirerVerification.respondentMetadata.canonicalRespondentContext;
  const direct = resolveCanonicalRespondentContext({
    respondentSeniority: "vp_director_senior_leader",
    respondentRole: "integration_lead",
  });
  assert.deepEqual(stored, direct);
});

check("C5A-06", "R2 form/flow contract collects real respondent context; production receivers enforce one admission predicate", () => {
  // CORR1-corrected scope: these are the form/flow-level contract facts. The
  // behavioral admission boundary (cross-tab and same-tab) is proven by
  // V-CORR1-01..05 and V-CORR1-09 below through the real production predicate.
  const invalidCases = [
    { firmTenure: SHORT_TENURE, respondentSeniority: "ceo-ish", respondentRole: "deal_lead" },
    { firmTenure: SHORT_TENURE, respondentSeniority: "senior_person", respondentRole: "deal_lead" },
    { firmTenure: SHORT_TENURE, respondentSeniority: "vp_director_senior_leader", respondentRole: "senior_person" },
    { firmTenure: SHORT_TENURE, respondentSeniority: "vp_or_manager", respondentRole: "deal_lead" },
    { firmTenure: SHORT_TENURE, respondentSeniority: null, respondentRole: "deal_lead" },
    { firmTenure: SHORT_TENURE, respondentSeniority: "vp_director_senior_leader", respondentRole: 17 },
  ];
  persistenceEvidence.invalidCases = [];
  for (const metadata of invalidCases) {
    const invite = verificationInvite();
    const result = completeAcquirerVerificationInvite(invite, answersFor(AEM_QUESTIONS), COMPLETED_AT, metadata);
    assert.equal(result.ok, false, JSON.stringify(metadata));
    assert.equal(result.reason, ACQUIRER_VERIFICATION_RESPONDENT_CONTEXT_REQUIRED, JSON.stringify(metadata));
    assert.equal(result.invite, invite);
    assert.equal(result.invite.completed, false);
    persistenceEvidence.invalidCases.push({
      seniority: metadata.respondentSeniority,
      role: metadata.respondentRole,
      ok: result.ok,
      reason: result.reason,
    });
  }
  const tenureGate = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    { respondentSeniority: "vp_director_senior_leader", respondentRole: "deal_lead" },
  );
  assert.equal(tenureGate.ok, false);
  assert.equal(tenureGate.reason, "acquirer-verification-tenure-required");

  const block = functionBlock(APP_SOURCE, "AuthorizedAcquirerVerificationScreen", "fieldLabel");
  const codeGate = block.indexOf("if (!verified)");
  const contextGate = block.indexOf("if (!tenureConfirmed)");
  const questionnaire = block.indexOf("<AcquirerVerificationQuestionnaire");
  assert.ok(codeGate >= 0 && contextGate > codeGate && questionnaire > contextGate);
  assert.match(block, /label=\{firmTenureSection\.label\}/);
  assert.match(block, /options=\{RESPONDENT_SENIORITY_OPTIONS\}/);
  assert.match(block, /options=\{roleOptionsForSide\("acquirer"\)\}/);
  assert.match(block, /!firmTenure \|\| !respondentSeniority \|\| !respondentRole/);

  const callMatches = [...APP_SOURCE.matchAll(/completeAcquirerVerificationInvite\s*\(/g)];
  assert.equal(callMatches.length, 1);
  const open = APP_SOURCE.indexOf("(", callMatches[0].index);
  const close = matchingClose(APP_SOURCE, open);
  const args = topLevelArguments(APP_SOURCE.slice(open + 1, close));
  assert.equal(args.length, 4);
  for (const field of ["firmTenure", "respondentSeniority", "respondentRole"]) {
    assert.match(args[3], new RegExp(field));
  }
  assert.doesNotMatch(args[1], /respondentSeniority|firmTenure/);

  // One semantic predicate guards every live admission path: the shared
  // cross-tab parser and the same-tab attach.
  const parserBlock = functionBlock(APP_SOURCE, "parseAcquirerVerificationCompletion", "publishAcquirerVerificationCompletion");
  assert.match(parserBlock, /isResolvedAcquirerVerificationRespondentContext\(payload\)/);
  const receiverWiring = [...APP_SOURCE.matchAll(/applyCompletion\(parseAcquirerVerificationCompletion\(event\.(?:detail|data)\)\)/g)];
  assert.equal(receiverWiring.length, 4, "both cross-tab receivers (CustomEvent + BroadcastChannel each) route through the hardened parser");
  assert.match(
    APP_SOURCE,
    /!completion\.ok \|\| !isResolvedAcquirerVerificationRespondentContext\(completion\.invite\)/,
    "same-tab completion reuses the same predicate before attach",
  );
});

check("C5A-07", "Completed R2 retains product context, canonical context, and provenance", () => {
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    {
      firmTenure: MID_TENURE,
      respondentSeniority: "board_investment_committee",
      respondentRole: "board_sponsor",
    },
  );
  assert.equal(completion.ok, true);
  const expectedCanonical = resolveCanonicalRespondentContext({
    respondentSeniority: "board_investment_committee",
    respondentRole: "board_sponsor",
  });
  assert.deepEqual(completion.invite.acquirerVerification.respondentMetadata, {
    firmTenure: MID_TENURE,
    respondentSeniority: "board_investment_committee",
    respondentRole: "board_sponsor",
    canonicalRespondentContext: expectedCanonical,
  });
  assert.equal(expectedCanonical.canonicalSeniorityLevel, "c_suite");
  assert.equal(expectedCanonical.canonicalSeniorityTier, "senior");
  assert.equal(completion.invite.completed, true);
  assert.equal(completion.invite.completedAt, COMPLETED_AT);
  assert.equal(completion.invite.acquirerVerificationSessionId, "c5a-r2");
  assert.equal(completion.invite.assessmentSessionId, "c5a-r1");
  const roundTrip = JSON.parse(JSON.stringify(completion.invite.acquirerVerification.respondentMetadata));
  assert.equal(roundTrip.canonicalRespondentContext.canonicalSeniorityLevel, "c_suite");
  const session = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), completion.invite);
  assert.deepEqual(
    session.acquirerVerification.respondentMetadata,
    completion.invite.acquirerVerification.respondentMetadata,
  );
  persistenceEvidence.fullMetadata = {
    firmTenure: roundTrip.firmTenure,
    respondentSeniority: roundTrip.respondentSeniority,
    respondentRole: roundTrip.respondentRole,
    canonicalSeniorityLevel: roundTrip.canonicalRespondentContext.canonicalSeniorityLevel,
    canonicalSeniorityTier: roundTrip.canonicalRespondentContext.canonicalSeniorityTier,
  };
});

check("C5A-08", "C3-D tenure semantics are unchanged and applied exactly once", () => {
  assert.equal(firmTenureEvidenceMultiplier(SHORT_TENURE), 0.5);
  assert.equal(firmTenureEvidenceMultiplier(MID_TENURE), 1);
  assert.equal(firmTenureEvidenceMultiplier(LONG_TENURE), 1);
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    {
      firmTenure: SHORT_TENURE,
      respondentSeniority: "manager_functional_lead",
      respondentRole: "finance_lead",
    },
  );
  assert.equal(completion.ok, true);
  assert.equal(completion.invite.acquirerVerification.score.totalEvidenceWeight, 5.5);
  assert.equal(completion.invite.acquirerVerification.score.questionResponses[0].weight, 0.5);
  const session = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), completion.invite);
  const verificationEntry = session.acquirer2A.score.questionResponses.find(
    (entry) => entry.respondentSlot === "verification",
  );
  const primaryEntry = session.acquirer2A.score.questionResponses.find(
    (entry) => entry.respondentSlot === "primary",
  );
  assert.equal(verificationEntry.weight, 0.5);
  assert.equal(primaryEntry.weight, 1);
  tenureEvidence.shortR2WithSeniority = {
    standaloneTotal: completion.invite.acquirerVerification.score.totalEvidenceWeight,
    combinedVerificationWeight: verificationEntry.weight,
    combinedPrimaryWeight: primaryEntry.weight,
  };
});

check("C5A-09", "Observation scope resolves for every product value across AEM Q1–Q11", () => {
  scopeEvidence.before = {
    productValue: "board_investment_committee",
    useClass: "UNRESOLVED",
    unresolvedReason: "unknown_seniority",
  };
  scopeEvidence.representative = [];
  for (const productValue of ["c_suite_founder", "manager_functional_lead", "external_advisor"]) {
    for (const questionRef of ["Q1", "Q3", "Q11"]) {
      const canonical = resolveCanonicalRespondentContext({
        respondentSeniority: productValue,
        respondentRole: "deal_lead",
      });
      const scope = resolveObservationScope({
        moduleId: "acquirerEnvironment",
        workbookQuestionId: questionRef,
        canonicalQuestionId: `ACQUIRERENVIRONMENT-${questionRef}`,
        respondent: canonical.respondent,
        selectedOption: "A",
        directObservationGate: "yes",
        evidenceType: "direct_observation",
        reliabilityFlags: [],
      });
      assert.notEqual(scope.audit?.unresolvedReason, "unknown_seniority");
      assert.equal(scope.seniorityTier, canonical.canonicalSeniorityTier);
      scopeEvidence.representative.push({
        productValue,
        questionRef,
        seniorityTier: scope.seniorityTier,
        useClass: scope.useClass,
        comparisonAvailability: scope.comparisonAvailability,
        semanticClass: scope.semanticClass,
        routing: scope.routing,
      });
    }
  }
  const senior = scopeEvidence.representative.find((row) => row.productValue === "c_suite_founder" && row.questionRef === "Q1");
  assert.equal(senior.useClass, "PRIMARY");
  assert.equal(senior.comparisonAvailability, "available");
  const lineLevel = scopeEvidence.representative.find((row) => row.productValue === "manager_functional_lead" && row.questionRef === "Q1");
  assert.equal(lineLevel.useClass, "CONTEXTUAL");
  const external = scopeEvidence.representative.find((row) => row.productValue === "external_advisor" && row.questionRef === "Q1");
  assert.equal(external.useClass, "UNRESOLVED");
  assert.equal(external.routing, "practitioner_access_review");
});

check("C5A-10", "UseClass vocabulary remains exactly PRIMARY, CONTEXTUAL, INELIGIBLE, UNRESOLVED", () => {
  const corpusClasses = new Set(
    DUAL.questionTierVantage.map((row) => String(row.defaultuseclass).trim()),
  );
  assert.deepEqual([...corpusClasses].sort(), [...USE_CLASS_VOCABULARY].sort());
  const observed = new Set();
  for (const productValue of PRODUCT_SENIORITY_VALUES) {
    const canonical = resolveCanonicalRespondentContext({ respondentSeniority: productValue, respondentRole: "deal_lead" });
    for (const questionRef of QUESTIONS) {
      const scope = resolveObservationScope({
        moduleId: "acquirerEnvironment",
        workbookQuestionId: questionRef,
        canonicalQuestionId: `ACQUIRERENVIRONMENT-${questionRef}`,
        respondent: canonical.respondent,
        selectedOption: "A",
        directObservationGate: "yes",
        evidenceType: "direct_observation",
        reliabilityFlags: [],
      });
      observed.add(scope.useClass);
    }
  }
  for (const useClass of observed) {
    assert.ok(USE_CLASS_VOCABULARY.includes(useClass), `unexpected UseClass ${useClass}`);
  }
  scopeEvidence.observedUseClasses = [...observed].sort();
});

check("C5A-11", "Dual classification precedence 0a–5B is unchanged", () => {
  const priorities = DUAL.classificationPrecedence.map((row) => String(row.priority).trim());
  assert.deepEqual(priorities, DUAL_PRECEDENCE);
});

check("C5A-12", "P_1B Q11 semantics cannot be broadened by the bridge", () => {
  const q11Semantics = Object.fromEntries(
    DUAL.questionOptionSemantics
      .filter((row) => row.questionref === "Q11")
      .map((row) => [String(row.optioncode).trim(), String(row.semanticclass).trim()]),
  );
  assert.equal(q11Semantics.E, "SUBSTANTIVE_SIGNAL");
  assert.equal(q11Semantics.F, "OBSERVATION_GAP");
  const precedence1b = DUAL.classificationPrecedence.find((row) => String(row.priority).trim() === "1b");
  assert.match(precedence1b.condition, /NF\/SFP/);
  assert.match(precedence1b.condition, /Q11/);

  const bridged = resolveCanonicalRespondentContext({
    respondentSeniority: "c_suite_founder",
    respondentRole: "deal_lead",
  });
  for (const optionCode of ["E", "F"]) {
    const viaBridge = resolveObservationScope({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: "Q11",
      canonicalQuestionId: "ACQUIRERENVIRONMENT-Q11",
      respondent: bridged.respondent,
      selectedOption: optionCode,
      directObservationGate: "yes",
      evidenceType: "direct_observation",
      reliabilityFlags: [],
    });
    const direct = resolveObservationScope({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: "Q11",
      canonicalQuestionId: "ACQUIRERENVIRONMENT-Q11",
      respondent: { roleCode: "deal_lead", seniorityLevel: "c_suite" },
      selectedOption: optionCode,
      directObservationGate: "yes",
      evidenceType: "direct_observation",
      reliabilityFlags: [],
    });
    assert.deepEqual(viaBridge, direct, `Q11 ${optionCode}`);
    if (optionCode === "E") {
      assert.equal(viaBridge.semanticClass, "SUBSTANTIVE_SIGNAL");
      assert.equal(viaBridge.comparisonAvailability, "available");
      assert.equal(viaBridge.comparisonEligible, true);
    } else {
      assert.equal(viaBridge.semanticClass, "OBSERVATION_GAP");
      assert.equal(viaBridge.comparisonAvailability, "unavailable");
      assert.equal(viaBridge.comparisonEligible, false);
    }
  }
  p1bEvidence.q11 = { E: q11Semantics.E, F: q11Semantics.F };
});

check("C5A-13", "No Dual comparator production wiring was introduced", () => {
  for (const source of [APP_SOURCE, ACQUIRER_FLOW_SOURCE, BRIDGE_SOURCE]) {
    assert.doesNotMatch(source, /compareDualRespondents/);
    assert.doesNotMatch(source, /coreInput/);
  }
});

check("C5A-14", "Slot never becomes identity in the bridge or R2 flow", () => {
  assert.doesNotMatch(BRIDGE_SOURCE, /respondentId|physicalRespondentId/);
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    {
      firmTenure: LONG_TENURE,
      respondentSeniority: "senior_ic_key_person",
      respondentRole: "senior_ic_key_person",
    },
  );
  assert.equal(completion.ok, true);
  const entry = completion.invite.acquirerVerification.score.questionResponses[0];
  assert.equal(entry.respondentId, "c5a-r2");
  assert.equal(entry.respondentSlot, "verification");
  const session = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), completion.invite);
  const primary = session.acquirer2A.score.questionResponses.find((item) => item.respondentSlot === "primary");
  assert.equal(primary.respondentId, "c5a-r1");
});

check("C5A-15", "Module vocabularies stay explicit and uncollapsed", () => {
  assert.equal(isAuthorizedDualModule("acquirerEnvironment"), true);
  assert.equal(isAuthorizedDualModule("targetSelfAssessment"), true);
  assert.equal(isAuthorizedDualModule("acquirer_environment"), false);
  assert.match(ACQUIRER_FLOW_SOURCE, /moduleId:\s*"acquirer_environment"/);
  assert.doesNotMatch(BRIDGE_SOURCE, /acquirer_environment|acquirerEnvironment|targetSelfAssessment/);
  assert.equal(
    PACKAGE_JSON.scripts["validate:c5a-respondent-context-bridge"],
    "node scripts/validate-c5a-respondent-context-bridge.mjs",
  );
});

function fullContextCompletion(metadataOverrides = {}) {
  return completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    {
      firmTenure: LONG_TENURE,
      respondentSeniority: "vp_director_senior_leader",
      respondentRole: "deal_lead",
      ...metadataOverrides,
    },
  );
}

check("V-CORR1-01", "Cross-tab payload without respondentMetadata is not production-admissible", () => {
  const legacy = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
  );
  assert.equal(legacy.ok, true, "low-level 3-arg completion remains a valid compatibility surface");
  assert.equal(Object.hasOwn(legacy.invite.acquirerVerification, "respondentMetadata"), false);
  const admitted = productionAdmits(legacy.invite);
  assert.equal(admitted, false, "no-metadata payload must not materialize production R2 state");
  admissionEvidence.noMetadata = { lowLevelOk: legacy.ok, productionAdmissible: admitted };
});

check("V-CORR1-02", "firmTenure-only cross-tab payload is not production-admissible", () => {
  const firmOnly = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    { firmTenure: "more_than_3_years" },
  );
  assert.equal(firmOnly.ok, true, "low-level firmTenure-only completion remains a valid compatibility surface");
  assert.deepEqual(firmOnly.invite.acquirerVerification.respondentMetadata, { firmTenure: "more_than_3_years" });
  const admitted = productionAdmits(firmOnly.invite);
  assert.equal(admitted, false, "firmTenure-only payload must not materialize production R2 state");
  admissionEvidence.firmTenureOnly = { lowLevelOk: firmOnly.ok, productionAdmissible: admitted };
});

check("V-CORR1-03", "Partial respondent context (seniority-only / role-only) is not production-admissible", () => {
  const seniorityOnly = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    { firmTenure: LONG_TENURE, respondentSeniority: "vp_director_senior_leader" },
  );
  assert.equal(seniorityOnly.ok, true);
  const roleOnly = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    { firmTenure: LONG_TENURE, respondentRole: "deal_lead" },
  );
  assert.equal(roleOnly.ok, true);
  assert.equal(productionAdmits(seniorityOnly.invite), false, "missing respondentRole must be rejected");
  assert.equal(productionAdmits(roleOnly.invite), false, "missing respondentSeniority must be rejected");
  admissionEvidence.partial = {
    seniorityOnlyAdmissible: productionAdmits(seniorityOnly.invite),
    roleOnlyAdmissible: productionAdmits(roleOnly.invite),
  };
});

check("V-CORR1-04", "Unresolved or inconsistent canonical context is not production-admissible", () => {
  const full = fullContextCompletion();
  assert.equal(full.ok, true);
  const basePayload = completionPayload(full.invite);
  for (const tamper of [
    (payload) => { payload.acquirerVerification.respondentMetadata.canonicalRespondentContext.status = "unsupported"; },
    (payload) => { payload.acquirerVerification.respondentMetadata.canonicalRespondentContext.status = "unresolved"; },
    (payload) => { delete payload.acquirerVerification.respondentMetadata.canonicalRespondentContext; },
    (payload) => {
      payload.acquirerVerification.respondentMetadata.canonicalRespondentContext.productSeniority = "c_suite_founder";
    },
    (payload) => {
      payload.acquirerVerification.respondentMetadata.canonicalRespondentContext.productRole = "board_sponsor";
    },
    (payload) => { payload.acquirerVerification.respondentMetadata.firmTenure = "fourth_bucket"; },
    (payload) => { delete payload.acquirerVerification.respondentMetadata.respondentRole; },
  ]) {
    const payload = structuredClone(basePayload);
    tamper(payload);
    assert.equal(
      isResolvedAcquirerVerificationRespondentContext(payload),
      false,
      `tampered payload must be rejected: ${tamper.toString()}`,
    );
  }
  admissionEvidence.tamperCasesRejected = 7;
});

check("V-CORR1-05", "Fully resolved payload is admitted by the same-tab path and both cross-tab receivers", () => {
  const full = fullContextCompletion();
  assert.equal(full.ok, true);
  const payload = completionPayload(full.invite);
  assert.equal(isResolvedAcquirerVerificationRespondentContext(payload), true, "cross-tab admission predicate");
  assert.equal(isResolvedAcquirerVerificationRespondentContext(full.invite), true, "same-tab completion shape");
  const session = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), full.invite);
  assert.equal(session.acquirer2A.score.verificationIncluded, true);
  assert.equal(session.acquirer2A.score.respondentCount, 2);
  assert.equal(isAcquirerVerificationComplete(session), true);
  admissionEvidence.fullPayload = {
    predicate: true,
    verificationIncluded: session.acquirer2A.score.verificationIncluded,
    respondentCount: session.acquirer2A.score.respondentCount,
  };
});

check("V-CORR1-06", "Prototype-chain seniority keys fail closed in the bridge", () => {
  const forbiddenKeys = [
    "constructor",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "__proto__",
    "prototype",
    "__defineGetter__",
    "__defineSetter__",
  ];
  admissionEvidence.prototypeKeys = [];
  for (const key of forbiddenKeys) {
    const result = resolveCanonicalRespondentContext({ respondentSeniority: key, respondentRole: "deal_lead" });
    assert.notEqual(result.status, "resolved", key);
    assert.equal(result.respondent, null, key);
    assert.equal(Object.hasOwn(result, "canonicalSeniorityLevel"), false, key);
    admissionEvidence.prototypeKeys.push({ key, status: result.status });
  }
});

check("V-CORR1-07", "All seven accepted seniority mappings are unchanged by CORR1", () => {
  const accepted = {
    board_investment_committee: { canonicalSeniorityLevel: "c_suite", canonicalSeniorityTier: "senior" },
    c_suite_founder: { canonicalSeniorityLevel: "c_suite", canonicalSeniorityTier: "senior" },
    executive_partner_md: { canonicalSeniorityLevel: "c_suite", canonicalSeniorityTier: "senior" },
    vp_director_senior_leader: { canonicalSeniorityLevel: "vp", canonicalSeniorityTier: "senior" },
    manager_functional_lead: { canonicalSeniorityLevel: "manager", canonicalSeniorityTier: "line_level" },
    senior_ic_key_person: { canonicalSeniorityLevel: "ic", canonicalSeniorityTier: "line_level" },
    external_advisor: { canonicalSeniorityLevel: "external", canonicalSeniorityTier: "external" },
  };
  for (const [productValue, expected] of Object.entries(accepted)) {
    const resolved = resolveCanonicalRespondentContext({ respondentSeniority: productValue, respondentRole: "deal_lead" });
    assert.equal(resolved.status, "resolved", productValue);
    assert.equal(resolved.canonicalSeniorityLevel, expected.canonicalSeniorityLevel, productValue);
    assert.equal(resolved.canonicalSeniorityTier, expected.canonicalSeniorityTier, productValue);
  }
});

check("V-CORR1-08", "R2 role options equal the existing acquirer-side role set with no second vocabulary", () => {
  const acquirerSideRoles = RESPONDENT_ROLE_OPTIONS
    .filter((option) => option.sides.includes("acquirer"))
    .map((option) => option.value);
  assert.ok(acquirerSideRoles.length > 0);
  assert.ok(acquirerSideRoles.length < RESPONDENT_ROLE_OPTIONS.length, "acquirer-side set is a strict subset");
  assert.equal(acquirerSideRoles.includes("ceo_founder_md"), false, "known target-only role must be absent");
  assert.equal(acquirerSideRoles.includes("commercial_leader"), false, "known target-only role must be absent");
  assert.match(
    APP_SOURCE,
    /options=\{roleOptionsForSide\("acquirer"\)\}/,
    "R2 reuses the existing production side filter",
  );
  admissionEvidence.acquirerSideRoleCount = acquirerSideRoles.length;
});

check("V-CORR1-09", "Legacy low-level completions stay ok:true but are LEGACY_INTERNAL_ONLY for production admission", () => {
  const threeArg = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
  );
  assert.equal(threeArg.ok, true);
  assert.equal(Object.hasOwn(threeArg.invite.acquirerVerification, "respondentMetadata"), false);
  assert.equal(productionAdmits(threeArg.invite), false);

  const firmTenureOnly = completeAcquirerVerificationInvite(
    verificationInvite(),
    answersFor(AEM_QUESTIONS),
    COMPLETED_AT,
    { firmTenure: SHORT_TENURE },
  );
  assert.equal(firmTenureOnly.ok, true);
  assert.deepEqual(firmTenureOnly.invite.acquirerVerification.respondentMetadata, { firmTenure: SHORT_TENURE });
  assert.equal(firmTenureOnly.invite.acquirerVerification.score.totalEvidenceWeight, 5.5);
  assert.equal(productionAdmits(firmTenureOnly.invite), false);

  const attachedLegacy = attachAcquirerVerificationCompletion(
    acquirerSession(LONG_TENURE),
    firmTenureOnly.invite,
  );
  assert.equal(attachedLegacy.acquirer2A.score.verificationIncluded, true, "attach legacy test behavior unchanged (closed C3-D contract)");
  admissionEvidence.legacySplit = {
    threeArg: { ok: threeArg.ok, productionAdmissible: productionAdmits(threeArg.invite) },
    firmTenureOnly: { ok: firmTenureOnly.ok, productionAdmissible: productionAdmits(firmTenureOnly.invite) },
  };
});

check("V-CORR1-10", "No new adjudication/C5 eligibility field was introduced", () => {
  for (const source of [APP_SOURCE, ACQUIRER_FLOW_SOURCE, BRIDGE_SOURCE]) {
    assert.doesNotMatch(source, /dualAdjudicationEligible|adjudicationEligible|c5Eligible/);
  }
});

const failures = [];
for (const { id, label, fn } of checks) {
  try {
    await fn();
    console.log(`PASS ${id} ${label}`);
  } catch (error) {
    failures.push({ id, label, error });
    console.error(`FAIL ${id} ${label}`);
    console.error(`  ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error(`C5-A respondent context bridge validation failed: ${failures.length}/${checks.length} check(s) failed.`);
  process.exit(1);
}

console.log(`C5-A respondent context bridge validation passed: ${checks.length}/${checks.length}`);
console.log(`EVIDENCE coverage ${JSON.stringify(coverageEvidence)}`);
console.log(`EVIDENCE scope ${JSON.stringify(scopeEvidence)}`);
console.log(`EVIDENCE persistence ${JSON.stringify(persistenceEvidence)}`);
console.log(`EVIDENCE tenure ${JSON.stringify(tenureEvidence)}`);
console.log(`EVIDENCE p1b ${JSON.stringify(p1bEvidence)}`);
console.log(`EVIDENCE admission ${JSON.stringify(admissionEvidence)}`);
