import questionnaires from "../../src/generated/newlogic/questionnaires.json" with { type: "json" };

import { attachAcquirerModuleResult } from "../../src/flow/acquirerTrackFlow.js";
import {
  REACHABLE_CANDIDATE_PAIRS,
  selectCandidatePair,
} from "../../src/flow/candidatePairSelector.js";
import { evidenceClassifiedAnswer } from "../../src/flow/evidenceClassification.js";

export const C5C_SELECTED_SESSION_ID = "c5c-selected-session";
export const C5C_SELECTED_AT = "2026-08-27T12:00:00.000Z";
export const C5C_DEFAULT_CANDIDATE_PAIR = "NT/STJ vs NT/STP";

const SOURCE_MODULE = "acquirerEnvironment";
const AEM = (questionnaires.modules ?? []).find((module) => module.id === SOURCE_MODULE);

const SELECTED_ANSWER_OVERRIDES_BY_PAIR = Object.freeze({
  "NT/STJ vs NT/STP": Object.freeze({ Q4: "A", Q7: "B" }),
  "SFJ/SFP vs SFP/SFJ": Object.freeze({ Q3: "B" }),
  "STJ/STP vs NT/STJ": Object.freeze({ Q1: "C", Q2: "A" }),
  "NF/SFJ vs NF/NT": Object.freeze({ Q9: "D" }),
});

function requireAem() {
  if (!AEM) throw new Error("C5-C fixture requires the acquirerEnvironment questionnaire module");
  return AEM;
}

function answersFromOverrides(overrides = {}) {
  return Object.fromEntries(
    (requireAem().questions ?? []).map((question) => {
      const workbookQuestionId = question.workbookQuestionId;
      const selectedOption = overrides[workbookQuestionId]
        ?? (workbookQuestionId === "Q11" ? "F" : "E");
      return [workbookQuestionId, evidenceClassifiedAnswer(selectedOption)];
    }),
  );
}

function selectedAnswers(candidatePair) {
  const overrides = SELECTED_ANSWER_OVERRIDES_BY_PAIR[candidatePair];
  if (!overrides || !REACHABLE_CANDIDATE_PAIRS.includes(candidatePair)) {
    throw new Error(`Unsupported C5-C selector fixture pair: ${String(candidatePair)}`);
  }
  return answersFromOverrides(overrides);
}

function buildSession({ sessionId, respondentSeniority, respondentRole, answers }) {
  const dealData = {
    respondentSide: "acquirer",
    ...(respondentSeniority === null ? {} : { respondentSeniority }),
    respondentRole,
  };
  const baseSession = Object.freeze({
    sessionId,
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze(dealData),
    }),
  });
  return attachAcquirerModuleResult(baseSession, answers, C5C_SELECTED_AT).session;
}

export function buildC5CSelectedSession({
  sessionId = C5C_SELECTED_SESSION_ID,
  candidatePair = C5C_DEFAULT_CANDIDATE_PAIR,
  respondentSeniority = "c_suite_founder",
  respondentRole = "deal_lead",
} = {}) {
  const session = buildSession({
    sessionId,
    respondentSeniority,
    respondentRole,
    answers: selectedAnswers(candidatePair),
  });
  const selectorResult = selectCandidatePair({ session });
  if (selectorResult.status !== "SELECTED" || selectorResult.candidatePair !== candidatePair) {
    throw new Error(
      `C5-C selected fixture failed: ${selectorResult.status}/${String(selectorResult.candidatePair)}`,
    );
  }
  return session;
}

export function selectC5CCandidatePair(options = {}) {
  return selectCandidatePair({ session: buildC5CSelectedSession(options) });
}

export function projectC5CSelectorProvenance(selectorResult) {
  const provenance = selectorResult?.provenance;
  if (!provenance || typeof provenance !== "object") {
    throw new TypeError("selectorResult.provenance is required");
  }
  const projected = {
    selectorId: provenance.selectorId,
    selectorVersion: provenance.selectorVersion,
    observationScopePolicy: provenance.observationScopePolicy,
    sourceModule: provenance.sourceModule,
    sourceInstrument: provenance.sourceInstrument,
    sessionId: provenance.sessionId,
    respondentSlot: provenance.respondentSlot,
    respondentVantage: provenance.respondentVantage,
    semanticBindings: provenance.semanticBindings,
    status: selectorResult.status,
    decisionCode: selectorResult.decisionCode,
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  if (selectorResult.status === "ADMISSIBILITY_UNRESOLVED") {
    projected.routing = selectorResult.routing;
    projected.unresolvedReason = selectorResult.unresolvedReason ?? null;
  }
  return Object.freeze(projected);
}

export function buildC5CSelectedSelectorProvenance(options = {}) {
  return projectC5CSelectorProvenance(selectC5CCandidatePair(options));
}

export function selectC5CPreCoreResult(status, { sessionId = `c5c-${String(status).toLowerCase()}` } = {}) {
  const fixture = {
    ADMISSIBILITY_UNRESOLVED: {
      respondentSeniority: null,
      answerOverrides: SELECTED_ANSWER_OVERRIDES_BY_PAIR[C5C_DEFAULT_CANDIDATE_PAIR],
    },
    NO_LAWFUL_PAIR: {
      respondentSeniority: "c_suite_founder",
      answerOverrides: {},
    },
    PAIR_SELECTION_AMBIGUOUS: {
      respondentSeniority: "c_suite_founder",
      answerOverrides: { Q3: "B", Q4: "A", Q7: "B" },
    },
  }[status];
  if (!fixture) throw new Error(`Unsupported C5-C PRE_CORE fixture status: ${String(status)}`);
  const session = buildSession({
    sessionId,
    respondentSeniority: fixture.respondentSeniority,
    respondentRole: "deal_lead",
    answers: answersFromOverrides(fixture.answerOverrides),
  });
  const result = selectCandidatePair({ session });
  if (result.status !== status) {
    throw new Error(`C5-C PRE_CORE fixture failed: expected ${status}, got ${result.status}`);
  }
  return result;
}

export function buildC5CPreCoreSelectorProvenance(status, options = {}) {
  return projectC5CSelectorProvenance(selectC5CPreCoreResult(status, options));
}
