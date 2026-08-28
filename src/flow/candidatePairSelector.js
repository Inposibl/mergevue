import questionnaires from "../generated/newlogic/questionnaires.json" with { type: "json" };
import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import sourceManifest from "../generated/newlogic/sourceManifest.json" with { type: "json" };

import { RUNTIME_CORE_COMMIT } from "../agent/agentContractConstants.js";
import { buildCorpusIdentity, normalizeCandidatePair } from "../agent/engineSnapshot.js";
import {
  RESPONDENT_ROLE_OPTIONS,
  RESPONDENT_SENIORITY_OPTIONS,
  isAcquirerSideRespondent,
} from "./acquirerTrackFlow.js";
import { buildDualRespondentCorpusConfig } from "./dualRespondentComparison.js";
import {
  CONFIGURATION_INTEGRITY_FAILURE,
  DualSemanticIntegrityError,
  findQuestionnaireQuestion,
  lookupQuestionOptionSemantics,
  resolveDualQuestionSemantic,
} from "./dualQuestionSemanticResolver.js";
import {
  ObservationScopeCorpusConfigurationError,
  resolveObservationScope,
} from "./observationScopeResolver.js";
import { resolveCanonicalRespondentContext } from "./respondentContextBridge.js";

export const SELECTOR_ID = "c5b-r1-candidate-pair-selector";
export const SELECTOR_VERSION = "selector-1.0";
export const OBSERVATION_SCOPE_POLICY = "PRIMARY_AVAILABLE_ONLY@A1B";
export const SOURCE_MODULE = "acquirerEnvironment";
export const RESPONDENT_SLOT = "R1";

export const SELECTOR_QUESTION_UNIVERSE = Object.freeze([
  "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10",
]);

export const REACHABLE_CANDIDATE_PAIRS = Object.freeze([
  "NT/STJ vs NT/STP",
  "SFJ/SFP vs SFP/SFJ",
  "STJ/STP vs NT/STJ",
  "NF/SFJ vs NF/NT",
]);

export const PAIR5_CANDIDATE_PAIR = "NF/SFP vs NF/SFJ";

export const VALID_PAIR_WHITELIST = Object.freeze([
  "NT/STJ vs NT/STP",
  "SFJ/SFP vs SFP/SFJ",
  "STJ/STP vs NT/STJ",
  "NF/SFJ vs NF/NT",
  "NF/SFP vs NF/SFJ",
]);

const Q9_Q10 = Object.freeze(["Q9", "Q10"]);
const SLOT_IDENTITY_TOKENS = Object.freeze(["primary", "verification", "R1", "R2"]);
const RESPONDENT_SENIORITY_VALUES = new Set(RESPONDENT_SENIORITY_OPTIONS.map((option) => option.value));
const RESPONDENT_ROLE_VALUES = new Set(RESPONDENT_ROLE_OPTIONS.map((option) => option.value));
const CANONICAL_ENVIRONMENT_CODES = Object.freeze(Object.keys(sourceManifest.environmentAliases ?? {}));
const CANONICAL_ENVIRONMENT_CODE_SET = new Set(CANONICAL_ENVIRONMENT_CODES);
const DUAL_CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
const PRODUCTION_PAIRS = DUAL_CORPUS_CONFIG.productionPairs;
const AEM_MODULE = (questionnaires.modules ?? []).find((row) => row.id === SOURCE_MODULE) ?? null;
export const SOURCE_INSTRUMENT = AEM_MODULE?.sourceWorkbook ?? null;

export class CandidatePairSelectorError extends Error {
  constructor({ status, decisionCode, detail } = {}) {
    const parts = [
      "CandidatePairSelectorError",
      status ? `status=${status}` : null,
      decisionCode ? `decisionCode=${decisionCode}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "CandidatePairSelectorError";
    this.status = status ?? "CONFIG_INVALID";
    this.decisionCode = decisionCode ?? "SELECTOR_CONFIGURATION_ERROR";
    this.detail = detail ?? null;
  }
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isPlainObject(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function configFail(decisionCode, detail) {
  throw new CandidatePairSelectorError({
    status: "CONFIG_INVALID",
    decisionCode,
    detail,
  });
}

function uniqueSorted(values) {
  return Object.freeze([...new Set(values)].sort());
}

function pairSides(pair) {
  return String(pair ?? "").split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
}

function optionSignals(option) {
  return uniqueSorted(option?.internalEnvironmentSignals ?? []);
}

function aemQuestion(workbookQuestionId) {
  return findQuestionnaireQuestion(SOURCE_MODULE, workbookQuestionId);
}

function aemOption(workbookQuestionId, selectedOption) {
  const question = aemQuestion(workbookQuestionId);
  if (!question) return null;
  return (question.options ?? []).find((option) => option.value === selectedOption) ?? null;
}

function assertOptionEligibilityContract(workbookQuestionId, selectedOption, signals, excluded, semanticClass) {
  if (excluded !== (signals.length === 0)) {
    configFail(
      "OPTION_ELIGIBILITY_CONTRACT_VIOLATION",
      `${workbookQuestionId}-${selectedOption}: excludedFromPrimaryScoring=${excluded} signals=${signals.length}`,
    );
  }
  if (semanticClass && semanticClass !== "SUBSTANTIVE_SIGNAL" && signals.length > 0) {
    configFail(
      "OPTION_ELIGIBILITY_CONTRACT_VIOLATION",
      `${workbookQuestionId}-${selectedOption}: non-SUBSTANTIVE class ${semanticClass} has signals`,
    );
  }
  for (const code of signals) {
    if (!CANONICAL_ENVIRONMENT_CODE_SET.has(code)) {
      configFail("UNSUPPORTED_ENVIRONMENT_CODE", `${workbookQuestionId}-${selectedOption}:${code}`);
    }
  }
}

export function assertSelectorConfiguration() {
  if (!SOURCE_INSTRUMENT) {
    configFail("SELECTOR_CONFIGURATION_ERROR", "acquirerEnvironment sourceWorkbook missing");
  }
  if (SELECTOR_QUESTION_UNIVERSE.length !== 10 || SELECTOR_QUESTION_UNIVERSE.some((id) => id === "Q11")) {
    throw new CandidatePairSelectorError({
      status: "INPUT_INVALID",
      decisionCode: "Q11_LEAKAGE",
      detail: "selector universe is not closed Q1-Q10",
    });
  }
  if (REACHABLE_CANDIDATE_PAIRS.length !== 4) {
    configFail("SELECTOR_CONTRACT_MISMATCH", `reachable set size ${REACHABLE_CANDIDATE_PAIRS.length}`);
  }
  if (REACHABLE_CANDIDATE_PAIRS.includes(PAIR5_CANDIDATE_PAIR)) {
    configFail("PAIR5_IN_REACHABLE_SET", PAIR5_CANDIDATE_PAIR);
  }
  if (VALID_PAIR_WHITELIST.length !== 5 || !VALID_PAIR_WHITELIST.includes(PAIR5_CANDIDATE_PAIR)) {
    configFail("SELECTOR_CONTRACT_MISMATCH", "VALID_PAIR_WHITELIST must remain five and include pair #5");
  }

  const productionNormalized = new Set((PRODUCTION_PAIRS ?? []).map((pair) => normalizeCandidatePair(pair)));
  for (const pair of VALID_PAIR_WHITELIST) {
    if (!productionNormalized.has(normalizeCandidatePair(pair))) {
      configFail("REACHABLE_PAIR_NOT_IN_WHITELIST", `whitelist pair absent from productionPairs: ${pair}`);
    }
  }
  for (const pair of REACHABLE_CANDIDATE_PAIRS) {
    if (!productionNormalized.has(normalizeCandidatePair(pair))) {
      configFail("REACHABLE_PAIR_NOT_IN_WHITELIST", pair);
    }
    const sides = pairSides(pair);
    if (sides.length !== 2) configFail("SELECTOR_CONTRACT_MISMATCH", `malformed reachable pair ${pair}`);
    for (const code of sides) {
      if (!CANONICAL_ENVIRONMENT_CODE_SET.has(code)) {
        configFail("UNSUPPORTED_ENVIRONMENT_CODE", code);
      }
    }
  }

  for (const workbookQuestionId of SELECTOR_QUESTION_UNIVERSE) {
    const question = aemQuestion(workbookQuestionId);
    if (!question) {
      configFail("SELECTOR_CONFIGURATION_ERROR", `missing AEM question ${workbookQuestionId}`);
    }
    if (Q9_Q10.includes(workbookQuestionId)) {
      for (const option of question.options ?? []) {
        const resolved = resolveDualQuestionSemantic({
          moduleId: SOURCE_MODULE,
          workbookQuestionId,
          selectedOption: option.value,
          respondentSlot: RESPONDENT_SLOT,
        });
        const signals = uniqueSorted(resolved.environmentSignals ?? []);
        assertOptionEligibilityContract(
          workbookQuestionId,
          option.value,
          signals,
          resolved.excludedFromPrimaryScoring === true,
          resolved.semanticClass,
        );
      }
      continue;
    }
    for (const option of question.options ?? []) {
      const signals = optionSignals(option);
      assertOptionEligibilityContract(
        workbookQuestionId,
        option.value,
        signals,
        option.excludedFromPrimaryScoring === true,
        lookupQuestionOptionSemantics(workbookQuestionId, option.value),
      );
    }
  }
  return Object.freeze({ ok: true });
}

function ownValue(record, key) {
  if (!record || typeof record !== "object") return undefined;
  if (Object.hasOwn(record, key)) return record[key];
  const lower = String(key).toLowerCase();
  if (lower !== key && Object.hasOwn(record, lower)) return record[lower];
  return undefined;
}

function physicalSessionIdentity(value) {
  const identity = text(value);
  if (!identity || SLOT_IDENTITY_TOKENS.includes(identity)) return null;
  return identity;
}

function readSelectedOption(answer) {
  if (typeof answer === "string") return text(answer);
  if (!isPlainObject(answer)) return "";
  return text(answer.selectedOption ?? answer.option ?? answer.value);
}

function readAnswerSurface(answers, workbookQuestionId) {
  if (!Object.hasOwn(answers, workbookQuestionId) && !Object.hasOwn(answers, workbookQuestionId.toLowerCase())) {
    return { status: "missing" };
  }
  const raw = ownValue(answers, workbookQuestionId);
  if (typeof raw === "string") {
    const selectedOption = text(raw);
    if (!selectedOption) return { status: "unknown_option", selectedOption: "" };
    return {
      status: "ok",
      selectedOption,
      canonicalQuestionId: "",
      directObservationGate: "",
      evidenceType: "",
      reliabilityFlags: Object.freeze([]),
    };
  }
  if (!isPlainObject(raw)) return { status: "malformed" };
  const selectedOption = readSelectedOption(raw);
  if (!selectedOption) return { status: "unknown_option", selectedOption: "" };
  const flags = Array.isArray(raw.reliabilityFlags)
    ? Object.freeze(raw.reliabilityFlags.map((flag) => text(flag)).filter(Boolean))
    : Object.freeze([]);
  return {
    status: "ok",
    selectedOption,
    canonicalQuestionId: text(raw.canonicalQuestionId),
    directObservationGate: text(raw.directObservationGate),
    evidenceType: text(raw.evidenceType),
    reliabilityFlags: flags,
  };
}

function respondentVantageFromCanonical(canonical, productSeniority, productRole) {
  if (canonical?.status === "resolved") {
    return Object.freeze({
      productSeniority: canonical.productSeniority ?? "",
      canonicalSeniorityLevel: canonical.canonicalSeniorityLevel ?? null,
      canonicalSeniorityTier: canonical.canonicalSeniorityTier ?? null,
      roleCode: canonical.roleCode ?? null,
    });
  }
  return Object.freeze({
    productSeniority: productSeniority ?? "",
    canonicalSeniorityLevel: null,
    canonicalSeniorityTier: null,
    roleCode: productRole ?? null,
  });
}

function buildProvenance({
  sessionId,
  decisionCode,
  candidatePair,
  candidatePairNormalized,
  respondentVantage,
  semanticBindings,
}) {
  return Object.freeze({
    selectorId: SELECTOR_ID,
    selectorVersion: SELECTOR_VERSION,
    observationScopePolicy: OBSERVATION_SCOPE_POLICY,
    sourceModule: SOURCE_MODULE,
    sourceInstrument: SOURCE_INSTRUMENT,
    corpus: Object.freeze(buildCorpusIdentity()),
    semanticBindings: Object.freeze([...(semanticBindings ?? [])].map((row) => Object.freeze({ ...row }))),
    sessionId: sessionId ?? null,
    respondentSlot: RESPONDENT_SLOT,
    respondentVantage: respondentVantage ?? null,
    runtime: Object.freeze({ coreCommit: RUNTIME_CORE_COMMIT }),
    decisionCode,
    candidatePair,
    candidatePairNormalized,
  });
}

function finalize(fields) {
  const candidatePair = Object.hasOwn(fields, "candidatePair") ? fields.candidatePair : null;
  const candidatePairNormalized = candidatePair == null ? null : normalizeCandidatePair(candidatePair);
  const provenance = buildProvenance({
    sessionId: fields.sessionId ?? null,
    decisionCode: fields.decisionCode,
    candidatePair,
    candidatePairNormalized,
    respondentVantage: fields.respondentVantage ?? null,
    semanticBindings: fields.semanticBindings ?? [],
  });
  const result = {
    status: fields.status,
    candidatePair,
    candidatePairNormalized,
    decisionCode: fields.decisionCode,
    routing: fields.routing ?? null,
    provenance,
    audit: deepFreeze(fields.audit ?? Object.freeze({ contributions: Object.freeze([]) })),
  };
  if (fields.status === "ADMISSIBILITY_UNRESOLVED") {
    result.unresolvedReason = fields.unresolvedReason ?? null;
  }
  return deepFreeze(result);
}

function resolveQ1Q8Signals(workbookQuestionId, selectedOption) {
  const option = aemOption(workbookQuestionId, selectedOption);
  if (!option) return { status: "unknown_option" };
  const signals = optionSignals(option);
  for (const code of signals) {
    if (!CANONICAL_ENVIRONMENT_CODE_SET.has(code)) {
      configFail("UNSUPPORTED_ENVIRONMENT_CODE", `${workbookQuestionId}-${selectedOption}:${code}`);
    }
  }
  return { status: "ok", signals };
}

function bindingRecord(resolved) {
  return Object.freeze({
    moduleId: resolved.moduleId,
    workbookQuestionId: resolved.workbookQuestionId,
    canonicalQuestionId: resolved.canonicalQuestionId,
    mappingDigest: resolved.mappingDigest,
    mappingOwner: resolved.mappingOwner,
    derivationType: resolved.derivationType,
  });
}

function isAdmissible(signals, scope) {
  return signals.length > 0
    && scope.useClass === "PRIMARY"
    && scope.comparisonAvailability === "available";
}

function contributionRecord({ workbookQuestionId, selectedOption, signals, admissible, scope }) {
  return Object.freeze({
    workbookQuestionId,
    selectedOption,
    signals: Object.freeze([...signals]),
    admissible,
    useClass: scope.useClass ?? null,
    comparisonAvailability: scope.comparisonAvailability ?? null,
    tierDefaultUseClass: scope.audit?.adjudicationProvenance?.tierDefaultUseClass ?? null,
    matchedAccessRuleIds: Object.freeze([...(scope.audit?.adjudicationProvenance?.matchedAccessRuleIds ?? [])]),
  });
}

function mapIntegrityError(error) {
  const config = error.integrityDomain === CONFIGURATION_INTEGRITY_FAILURE;
  return {
    status: config ? "CONFIG_INVALID" : "INPUT_INVALID",
    decisionCode: error.failureReason,
    detail: error.detail ?? null,
  };
}

export function selectCandidatePair(input = {}) {
  assertSelectorConfiguration();

  const session = input?.session;
  const emptyAudit = { contributions: [] };

  if (!isPlainObject(session)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "R1_ABSENT",
      audit: emptyAudit,
    });
  }

  const acquirer2A = session.acquirer2A;
  if (!isPlainObject(acquirer2A)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "R1_ABSENT",
      sessionId: physicalSessionIdentity(session.sessionId),
      audit: emptyAudit,
    });
  }
  if (acquirer2A.completed !== true) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "R1_INCOMPLETE",
      sessionId: physicalSessionIdentity(session.sessionId),
      audit: emptyAudit,
    });
  }
  if (!isPlainObject(acquirer2A.answers)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "R1_ANSWERS_MALFORMED",
      sessionId: physicalSessionIdentity(session.sessionId),
      audit: emptyAudit,
    });
  }

  const sessionId = physicalSessionIdentity(session.sessionId);
  if (!sessionId) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "MALFORMED_SESSION_IDENTITY",
      audit: emptyAudit,
    });
  }

  const dealData = isPlainObject(session.dealContext) && isPlainObject(session.dealContext.data)
    ? session.dealContext.data
    : null;
  const respondentSide = text(dealData?.respondentSide);
  if (!respondentSide || !isAcquirerSideRespondent(respondentSide)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "UNSUPPORTED_MODULE",
      sessionId,
      audit: emptyAudit,
    });
  }

  const productSeniorityRaw = dealData?.respondentSeniority;
  const productRoleRaw = dealData?.respondentRole;
  const productSeniority = text(productSeniorityRaw);
  const productRole = productRoleRaw == null ? null : text(productRoleRaw) || null;

  if (productSeniority && !RESPONDENT_SENIORITY_VALUES.has(productSeniority)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "INVALID_RESPONDENT_SENIORITY",
      sessionId,
      respondentVantage: respondentVantageFromCanonical(null, productSeniority, productRole),
      audit: emptyAudit,
    });
  }
  if (productRole && !RESPONDENT_ROLE_VALUES.has(productRole)) {
    return finalize({
      status: "INPUT_INVALID",
      decisionCode: "INVALID_RESPONDENT_ROLE",
      sessionId,
      respondentVantage: respondentVantageFromCanonical(null, productSeniority, productRole),
      audit: emptyAudit,
    });
  }

  const canonical = resolveCanonicalRespondentContext({
    respondentSeniority: productSeniority,
    respondentRole: productRole ?? undefined,
  });
  const respondentVantage = respondentVantageFromCanonical(canonical, productSeniority, productRole);
  const scopeRespondent = Object.freeze({
    roleCode: canonical.roleCode ?? productRole,
    seniorityLevel: canonical.canonicalSeniorityLevel ?? "",
  });

  const contributions = [];
  const semanticBindings = [];
  const positiveCodes = new Set();
  let unresolvedHit = null;

  try {
    for (const workbookQuestionId of SELECTOR_QUESTION_UNIVERSE) {
      const answer = readAnswerSurface(acquirer2A.answers, workbookQuestionId);
      if (answer.status === "missing") {
        return finalize({
          status: "INPUT_INVALID",
          decisionCode: "R1_INCOMPLETE",
          sessionId,
          respondentVantage,
          semanticBindings,
          audit: { contributions },
        });
      }
      if (answer.status === "malformed") {
        return finalize({
          status: "INPUT_INVALID",
          decisionCode: "R1_ANSWERS_MALFORMED",
          sessionId,
          respondentVantage,
          semanticBindings,
          audit: { contributions },
        });
      }
      if (answer.status === "unknown_option") {
        return finalize({
          status: "INPUT_INVALID",
          decisionCode: "UNKNOWN_SELECTED_OPTION",
          sessionId,
          respondentVantage,
          semanticBindings,
          audit: { contributions },
        });
      }

      let signals;
      if (Q9_Q10.includes(workbookQuestionId)) {
        const resolved = resolveDualQuestionSemantic({
          moduleId: SOURCE_MODULE,
          workbookQuestionId,
          canonicalQuestionId: answer.canonicalQuestionId || undefined,
          selectedOption: answer.selectedOption,
          respondentSlot: RESPONDENT_SLOT,
        });
        signals = uniqueSorted(resolved.environmentSignals ?? []);
        semanticBindings.push(bindingRecord(resolved));
        for (const code of signals) {
          if (!CANONICAL_ENVIRONMENT_CODE_SET.has(code)) {
            configFail("UNSUPPORTED_ENVIRONMENT_CODE", `${workbookQuestionId}-${answer.selectedOption}:${code}`);
          }
        }
      } else {
        const resolved = resolveQ1Q8Signals(workbookQuestionId, answer.selectedOption);
        if (resolved.status === "unknown_option") {
          return finalize({
            status: "INPUT_INVALID",
            decisionCode: "UNKNOWN_SELECTED_OPTION",
            sessionId,
            respondentVantage,
            semanticBindings,
            audit: { contributions },
          });
        }
        signals = resolved.signals;
      }

      const scope = resolveObservationScope({
        moduleId: SOURCE_MODULE,
        workbookQuestionId,
        selectedOption: answer.selectedOption,
        respondent: scopeRespondent,
        directObservationGate: answer.directObservationGate,
        evidenceType: answer.evidenceType,
        reliabilityFlags: answer.reliabilityFlags,
      });

      const admissible = isAdmissible(signals, scope);
      contributions.push(contributionRecord({
        workbookQuestionId,
        selectedOption: answer.selectedOption,
        signals,
        admissible,
        scope,
      }));

      if (scope.useClass === "UNRESOLVED" && unresolvedHit == null) {
        unresolvedHit = {
          unresolvedReason: scope.audit?.unresolvedReason ?? null,
          routing: scope.routing ?? "practitioner_access_review",
        };
      }
      if (admissible && unresolvedHit == null) {
        for (const code of signals) positiveCodes.add(code);
      }
    }
  } catch (error) {
    if (error instanceof DualSemanticIntegrityError) {
      const mapped = mapIntegrityError(error);
      return finalize({
        status: mapped.status,
        decisionCode: mapped.decisionCode,
        sessionId,
        respondentVantage,
        semanticBindings,
        audit: { contributions, detail: mapped.detail },
      });
    }
    if (error instanceof ObservationScopeCorpusConfigurationError) {
      return finalize({
        status: "CONFIG_INVALID",
        decisionCode: "SELECTOR_CONFIGURATION_ERROR",
        sessionId,
        respondentVantage,
        semanticBindings,
        audit: { contributions, detail: error.message },
      });
    }
    if (error instanceof CandidatePairSelectorError) {
      return finalize({
        status: error.status,
        decisionCode: error.decisionCode,
        sessionId,
        respondentVantage,
        semanticBindings,
        audit: { contributions, detail: error.detail },
      });
    }
    throw error;
  }

  if (unresolvedHit) {
    return finalize({
      status: "ADMISSIBILITY_UNRESOLVED",
      decisionCode: "ADMISSIBILITY_UNRESOLVED",
      candidatePair: null,
      unresolvedReason: unresolvedHit.unresolvedReason,
      routing: unresolvedHit.routing ?? "practitioner_access_review",
      sessionId,
      respondentVantage,
      semanticBindings,
      audit: { contributions },
    });
  }

  const positiveEnvironmentSet = uniqueSorted([...positiveCodes]);
  const matchedPairs = REACHABLE_CANDIDATE_PAIRS.filter((pair) => {
    const sides = pairSides(pair);
    return sides.length === 2
      && positiveCodes.has(sides[0])
      && positiveCodes.has(sides[1]);
  });

  const matchAudit = {
    contributions,
    positiveEnvironmentSet,
    matchedPairs: Object.freeze([...matchedPairs]),
  };

  if (matchedPairs.length === 0) {
    return finalize({
      status: "NO_LAWFUL_PAIR",
      decisionCode: "NO_LAWFUL_PAIR",
      candidatePair: null,
      sessionId,
      respondentVantage,
      semanticBindings,
      audit: matchAudit,
    });
  }
  if (matchedPairs.length > 1) {
    return finalize({
      status: "PAIR_SELECTION_AMBIGUOUS",
      decisionCode: "PAIR_SELECTION_AMBIGUOUS",
      candidatePair: null,
      sessionId,
      respondentVantage,
      semanticBindings,
      audit: matchAudit,
    });
  }

  const candidatePair = matchedPairs[0];
  return finalize({
    status: "SELECTED",
    decisionCode: "SELECTED",
    candidatePair,
    sessionId,
    respondentVantage,
    semanticBindings,
    audit: matchAudit,
  });
}

assertSelectorConfiguration();
