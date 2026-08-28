import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import {
  RESPONDENT_ROLE_OPTIONS,
  RESPONDENT_SENIORITY_OPTIONS,
  isResolvedAcquirerVerificationRespondentContext,
} from "./acquirerTrackFlow.js";
import { resolveCanonicalRespondentContext } from "./respondentContextBridge.js";
import { buildDualRespondentCorpusConfig } from "./dualRespondentComparison.js";

// C5-B production adjudication input assembler.
//
// Assembles the exact coreInput contract of the existing Dual comparator
// (src/flow/dualRespondentComparison.js) from physically existing production
// session state. The only live multi-respondent production path is the AEM
// primary respondent (R1) + AEM verification respondent (R2) pair, so this
// module assembles that path only. The assembler is pure and fail-closed: it
// never derives methodology values (candidatePair, outOfPairEvidence,
// coherenceAmbiguous are caller/corpus authority, never score heuristics),
// never mutates session state, and never invokes the comparator. Production
// outcome wiring of the comparator belongs to later acts (C5-C/C5-D).

export const C5B_ASSEMBLY_FAILURE_REASONS = Object.freeze([
  "missing_required_input",
  "unsupported_module",
  "missing_candidate_pair",
  "unsupported_candidate_pair",
  "missing_r1_identity",
  "missing_r1_context",
  "invalid_r1_context",
  "missing_r1_answers",
  "missing_r2_context",
  "legacy_r2_non_adjudicable",
  "missing_r2_identity",
  "missing_r2_answers",
  "invalid_r2_context",
  "too_many_respondents",
]);

// One explicit authorized translation between the two deliberate module
// vocabularies (scoring module id -> scope/corpus module id). No generic
// casing transform exists; unknown ids fail closed.
const SCORING_TO_SCOPE_MODULE_MAP = Object.freeze({
  acquirer_environment: "acquirerEnvironment",
  target_self_assessment: "targetSelfAssessment",
});

// C5-B assembles the physically existing live production path only:
// AEM R1 (primary slot) + AEM R2 (verification slot).
const ASSEMBLED_PRODUCTION_PATH_MODULE = "acquirer_environment";

const RESPONDENT_SENIORITY_VALUES = new Set(RESPONDENT_SENIORITY_OPTIONS.map((option) => option.value));
const RESPONDENT_ROLE_VALUES = new Set(RESPONDENT_ROLE_OPTIONS.map((option) => option.value));
// The verification respondent role picker is acquirer-side filtered (C5-A),
// so a lawful R2 role must belong to the acquirer-side production vocabulary;
// target-only roles and the "unspecified" corpus sentinel are not product values.
const ACQUIRER_SIDE_ROLE_VALUES = new Set(
  RESPONDENT_ROLE_OPTIONS
    .filter((option) => option.sides.includes("acquirer"))
    .map((option) => option.value),
);

// Workflow slots are not physical identity (C3-A); these tokens can never
// serve as respondentId.
const SLOT_IDENTITY_TOKENS = new Set(["primary", "verification", "R1", "R2"]);

const DUAL_CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
const PRODUCTION_PAIRS = DUAL_CORPUS_CONFIG.productionPairs;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Byte-identical to dualRespondentComparison.normalizePair (not exported
// there and this file must not modify it). The C5-B validator proves
// acceptance equivalence against the comparator for every production pair.
function normalizePairValue(value) {
  const raw = text(value);
  const parts = raw.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return raw;
  return [...parts].sort().join(" vs ");
}

function physicalRespondentIdentity(value) {
  const identity = text(value);
  if (!identity || SLOT_IDENTITY_TOKENS.has(identity)) return null;
  return identity;
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function failure(reason, audit) {
  return Object.freeze({ ok: false, reason, audit: Object.freeze(audit) });
}

// Stored canonical context must match a fresh derivation through the same
// C5-A adapter field-for-field; an internally consistent but forged stored
// canonical block never passes.
function canonicalRespondentContextEquals(stored, expected) {
  if (!isPlainObject(stored)) return false;
  return stored.status === expected.status
    && stored.productSeniority === expected.productSeniority
    && stored.productRole === expected.productRole
    && stored.canonicalSeniorityLevel === expected.canonicalSeniorityLevel
    && stored.canonicalSeniorityTier === expected.canonicalSeniorityTier
    && stored.roleCode === expected.roleCode
    && stored.respondent?.roleCode === expected.respondent.roleCode
    && stored.respondent?.seniorityLevel === expected.respondent.seniorityLevel;
}

// R1 respondent context comes from existing deal/session metadata. Seniority
// is required to resolve observation scope; role stays optional product
// provenance (validated for membership when present). No R1 UI requirement
// changes here: sessions without adjudicable metadata simply fail closed.
function assembleR1Context(session) {
  const data = session?.dealContext?.data;
  if (!isPlainObject(data)) return { status: "missing_r1_context" };
  const seniority = text(data.respondentSeniority);
  const role = text(data.respondentRole) || null;
  if (!seniority) return { status: "missing_r1_context" };
  if (!RESPONDENT_SENIORITY_VALUES.has(seniority)) return { status: "invalid_r1_context" };
  if (role !== null && !RESPONDENT_ROLE_VALUES.has(role)) return { status: "invalid_r1_context" };
  const canonical = resolveCanonicalRespondentContext({
    respondentSeniority: seniority,
    respondentRole: role ?? undefined,
  });
  if (canonical.status !== "resolved") return { status: "invalid_r1_context" };
  return { status: "ok", seniority, role, canonical, firmTenure: text(data.firmTenure) || null };
}

// R2 consumes the Owner-accepted C5-A resolved metadata stored by the
// completion writer. Raw product membership (including the acquirer-side role
// vocabulary) and canonical consistency are re-verified against stored state
// before any scope resolution; legacy incomplete completions stay
// LEGACY_INTERNAL_ONLY and are non-adjudicable.
function assembleR2Context(verification) {
  const metadata = verification?.respondentMetadata;
  const seniority = text(metadata?.respondentSeniority);
  const role = text(metadata?.respondentRole);
  if (!RESPONDENT_SENIORITY_VALUES.has(seniority) || !ACQUIRER_SIDE_ROLE_VALUES.has(role)) {
    return { status: "invalid_r2_context" };
  }
  const canonical = resolveCanonicalRespondentContext({
    respondentSeniority: seniority,
    respondentRole: role,
  });
  if (canonical.status !== "resolved") return { status: "invalid_r2_context" };
  if (!canonicalRespondentContextEquals(metadata?.canonicalRespondentContext, canonical)) {
    return { status: "invalid_r2_context" };
  }
  return { status: "ok", seniority, role, canonical, firmTenure: text(metadata?.firmTenure) || null };
}

export function assembleProductionDualAdjudicationInput({ session, moduleId, candidatePair } = {}) {
  const baseAudit = { assembler: "c5b-production-adjudication-input-assembler" };

  if (!isPlainObject(session)) {
    return failure("missing_required_input", { ...baseAudit, stage: "session" });
  }

  const scoringModuleId = text(moduleId);
  if (
    !Object.hasOwn(SCORING_TO_SCOPE_MODULE_MAP, scoringModuleId)
    || scoringModuleId !== ASSEMBLED_PRODUCTION_PATH_MODULE
  ) {
    return failure("unsupported_module", { ...baseAudit, stage: "module", moduleId: scoringModuleId || null });
  }

  if (typeof candidatePair !== "string" || !text(candidatePair)) {
    return failure("missing_candidate_pair", { ...baseAudit, stage: "candidate_pair" });
  }
  const normalizedPair = normalizePairValue(candidatePair);
  if (!PRODUCTION_PAIRS.includes(normalizedPair)) {
    return failure("unsupported_candidate_pair", {
      ...baseAudit,
      stage: "candidate_pair",
      candidatePairNormalized: normalizedPair,
    });
  }

  // Pairwise scope only: the physically existing same-module contribution
  // stores are exactly the primary and verification slots. The count guard
  // fails closed if any future state shape ever yields more adjudicable
  // contributions; contributions are never ranked, selected, or reduced.
  const contributionSlots = [];
  if (session.acquirer2A?.completed === true) contributionSlots.push("primary");
  if (session.acquirerVerification?.completed === true) contributionSlots.push("verification");
  if (contributionSlots.length > 2) {
    return failure("too_many_respondents", {
      ...baseAudit,
      stage: "contributions",
      contributionSlots: Object.freeze([...contributionSlots]),
    });
  }

  const r1Identity = physicalRespondentIdentity(session.sessionId);
  if (!r1Identity) {
    return failure("missing_r1_identity", { ...baseAudit, stage: "r1_identity" });
  }
  const r1 = assembleR1Context(session);
  if (r1.status !== "ok") {
    return failure(r1.status, { ...baseAudit, stage: "r1_context" });
  }
  if (session.acquirer2A?.completed !== true) {
    return failure("missing_r1_answers", { ...baseAudit, stage: "r1_answers" });
  }
  const r1Answers = session.acquirer2A.answers;
  if (!isPlainObject(r1Answers)) {
    return failure("missing_r1_answers", { ...baseAudit, stage: "r1_answers" });
  }

  const verification = session.acquirerVerification;
  if (!isPlainObject(verification) || verification.completed !== true) {
    return failure("missing_r2_context", { ...baseAudit, stage: "r2_context" });
  }
  if (!isResolvedAcquirerVerificationRespondentContext({ acquirerVerification: verification })) {
    return failure("legacy_r2_non_adjudicable", { ...baseAudit, stage: "r2_context" });
  }
  const r2Identity = physicalRespondentIdentity(session.acquirerVerificationInvite?.acquirerVerificationSessionId);
  if (!r2Identity) {
    return failure("missing_r2_identity", { ...baseAudit, stage: "r2_identity" });
  }
  const r2Answers = verification.answers;
  if (!isPlainObject(r2Answers)) {
    return failure("missing_r2_answers", { ...baseAudit, stage: "r2_answers" });
  }
  const r2 = assembleR2Context(verification);
  if (r2.status !== "ok") {
    return failure(r2.status, { ...baseAudit, stage: "r2_context" });
  }

  const coreInput = Object.freeze({
    moduleId: SCORING_TO_SCOPE_MODULE_MAP[scoringModuleId],
    candidatePair,
    respondent1: r1.canonical.respondent,
    respondent2: r2.canonical.respondent,
    answers1: r1Answers,
    answers2: r2Answers,
  });

  const audit = Object.freeze({
    ...baseAudit,
    module: Object.freeze({
      scoringModuleId,
      scopeModuleId: coreInput.moduleId,
      productionPath: ASSEMBLED_PRODUCTION_PATH_MODULE,
    }),
    candidatePair: Object.freeze({
      value: candidatePair,
      normalized: normalizedPair,
      source: "invocation_parameter",
    }),
    contributions: Object.freeze({
      slots: Object.freeze(contributionSlots),
      count: 2,
    }),
    respondents: Object.freeze({
      count: 2,
      r1: Object.freeze({
        slot: "primary",
        respondentId: r1Identity,
        idSource: "session.sessionId",
        seniority: r1.seniority,
        role: r1.role,
        canonicalSeniorityLevel: r1.canonical.canonicalSeniorityLevel,
        canonicalSeniorityTier: r1.canonical.canonicalSeniorityTier,
        roleCode: r1.canonical.roleCode,
      }),
      r2: Object.freeze({
        slot: "verification",
        respondentId: r2Identity,
        idSource: "session.acquirerVerificationInvite.acquirerVerificationSessionId",
        seniority: r2.seniority,
        role: r2.role,
        canonicalSeniorityLevel: r2.canonical.canonicalSeniorityLevel,
        canonicalSeniorityTier: r2.canonical.canonicalSeniorityTier,
        roleCode: r2.canonical.roleCode,
      }),
      // Duplicate physical identity is preserved explicitly for later
      // independence logic (C5-C); the assembler neither rewrites ids nor
      // claims independence and applies no confidence effect.
      samePhysicalRespondent: r1Identity === r2Identity,
    }),
    answers: Object.freeze({
      answers1Source: "session.acquirer2A.answers",
      answers2Source: "session.acquirerVerification.answers",
    }),
    // No lawful production source exists for either invocation flag; absence
    // is the comparator's contract-safe representation (both only activate on
    // strict true) and is never inferred here.
    outOfPairEvidence: Object.freeze({ carried: false, source: "none" }),
    coherenceAmbiguous: Object.freeze({ carried: false, source: "none" }),
    // C3-D provenance only: tenure keeps its existing scoring-only effect and
    // never influences scope, eligibility, or adjudication.
    tenureProvenance: Object.freeze({
      r1FirmTenure: r1.firmTenure,
      r2FirmTenure: r2.firmTenure,
    }),
  });

  return Object.freeze({ ok: true, coreInput, audit });
}
