import questionnaires from "../generated/newlogic/questionnaires.json" with { type: "json" };

import {
  firmTenureEvidenceMultiplier,
  scoreAcquirerModule,
} from "../flow/acquirerTrackFlow.js";
import { deriveObservationScopeCausalDisposition } from "../flow/layeredEvidenceScoring.js";
import { resolveObservationScope } from "../flow/observationScopeResolver.js";
import {
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  QUESTION_UNIVERSE,
  RESPONDENT_SLOT_R1,
  RUNTIME_CORE_COMMIT,
  SINGLE_R1_CONSTRAINT_ID,
  SINGLE_R1_OUTCOME_CODE,
  SINGLE_R1_REASON_CODE,
  SNAPSHOT_SCHEMA_VERSION,
} from "./agentContractConstants.js";
import { canonicalSerialize } from "./canonicalDigest.js";
import {
  AgentBoundaryAssemblyError,
  buildCorpusIdentity,
  computeEngineSnapshotDigest,
  normalizeCandidatePair,
  projectEngineObservation,
  projectSelectorProvenance,
} from "./engineSnapshot.js";

const MODULE_ID = "acquirerEnvironment";
const SCORING_FIELDS = Object.freeze([
  "scoringModelVersion",
  "environmentScores",
  "weightedEnvironmentScores",
  "rankedEnvironments",
  "rawRankedEnvironments",
  "signalCompositionShare",
  "supportStrengthByEnvironment",
  "primaryEnvironmentCode",
  "primarySignalEnvironmentCode",
  "primarySignalScore",
  "secondaryEnvironmentCode",
  "secondarySignalEnvironmentCode",
  "secondarySignalScore",
]);
const PHYSICAL_IDENTITY_EXCLUSIONS = new Set(["primary", "verification", "R1", "R2"]);
const AEM = (questionnaires.modules ?? []).find((row) => row.id === MODULE_ID) ?? null;

function fail(detail) {
  throw new AgentBoundaryAssemblyError({ failureClass: FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE, detail });
}

function isPlainObject(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be a plain object`);
  return value;
}

function requirePhysicalIdentity(value, label) {
  const identity = typeof value === "string" ? value.trim() : "";
  if (!identity || PHYSICAL_IDENTITY_EXCLUSIONS.has(identity)) fail(`${label} must be a physical identity`);
  return identity;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) value.forEach(deepFreeze);
  else Object.values(value).forEach(deepFreeze);
  return value;
}

function answerOf(answers, questionRef) {
  return answers?.[questionRef] ?? answers?.[questionRef.toLowerCase()] ?? null;
}

function resolvedObservationAnswer(moduleId, respondent, questionRef, rawAnswer) {
  const answer = requireObject(rawAnswer, `session.acquirer2A.answers.${questionRef}`);
  const selectedOption = String(answer.selectedOption ?? answer.option ?? "").trim();
  if (!selectedOption) fail(`session.acquirer2A.answers.${questionRef}.selectedOption is required`);
  const scope = resolveObservationScope({
    moduleId,
    workbookQuestionId: questionRef,
    canonicalQuestionId: answer.canonicalQuestionId,
    respondent,
    selectedOption,
    directObservationGate: answer.directObservationGate,
    evidenceType: answer.evidenceType,
    reliabilityFlags: answer.reliabilityFlags,
  });
  const accessAdjudicated = scope.useClass !== "PRIMARY" || scope.comparisonAvailability === "unavailable";
  return {
    selectedOption,
    evidenceType: String(answer.evidenceType ?? "").trim(),
    knowledgeLevel: String(answer.knowledgeLevel ?? "").trim(),
    confidence: String(answer.confidence ?? "").trim(),
    reliabilityFlags: Array.isArray(answer.reliabilityFlags) ? [...answer.reliabilityFlags] : [],
    scope,
    causalDisposition: deriveObservationScopeCausalDisposition({
      reliabilityFlags: answer.reliabilityFlags ?? [],
      observationScopeAdjudicatedAccess: accessAdjudicated,
    }),
  };
}

function projectR1Scoring(score) {
  const projected = {};
  for (const key of SCORING_FIELDS) {
    if (!Object.hasOwn(score, key)) fail(`re-derived R1 score is missing ${key}`);
    projected[key] = structuredClone(score[key]);
  }
  return projected;
}

function canonicalScoreSeal(session, diagnosticId) {
  const stored = requireObject(session.acquirer2A?.score, "session.acquirer2A.score");
  const answers = requireObject(session.acquirer2A?.answers, "session.acquirer2A.answers");
  const dealData = requireObject(session.dealContext?.data, "session.dealContext.data");
  const derived = scoreAcquirerModule(answers, undefined, {
    respondentAccessLevel: dealData.respondentAccessLevel,
    respondentEvidenceMultiplier: firmTenureEvidenceMultiplier(dealData.firmTenure),
    respondentId: diagnosticId,
    respondentSlot: "primary",
  });
  if (canonicalSerialize(stored) !== canonicalSerialize(derived)) {
    fail("stored R1 score does not equal canonical writer-parameter re-derivation");
  }
  return { answers, derived };
}

export function assembleSingleR1Snapshot({ session, identityContext, selectorProvenance } = {}) {
  const sourceSession = requireObject(session, "session");
  const identity = requireObject(identityContext, "identityContext");
  const diagnosticId = requirePhysicalIdentity(sourceSession.sessionId, "session.sessionId");
  if (identity.diagnosticId !== diagnosticId) fail("identityContext.diagnosticId must equal session.sessionId");
  if (identity.moduleId !== MODULE_ID) fail(`identityContext.moduleId must be ${MODULE_ID}`);
  if (identity.projectId != null && typeof identity.projectId !== "string") fail("identityContext.projectId must be a string or null");
  if (sourceSession.acquirer2A?.completed !== true) fail("SINGLE_R1_ONLY requires a completed R1 module");

  const selector = projectSelectorProvenance(selectorProvenance);
  if (selector.status !== "SELECTED") fail("SINGLE_R1_ONLY requires selectorProvenance.status SELECTED");
  if (selector.sessionId !== diagnosticId) fail("selectorProvenance.sessionId must equal session.sessionId");
  if (selector.sourceModule !== MODULE_ID) fail("selectorProvenance.sourceModule mismatch");
  if (selector.candidatePair !== identity.candidatePair) fail("selector candidatePair mismatch");
  if (selector.candidatePairNormalized !== identity.candidatePairNormalized) fail("selector normalized pair mismatch");
  if (normalizeCandidatePair(identity.candidatePair) !== identity.candidatePairNormalized) {
    fail("identityContext.candidatePairNormalized must be canonical");
  }

  const { answers, derived } = canonicalScoreSeal(sourceSession, diagnosticId);
  const vantage = requireObject(selector.respondentVantage, "selectorProvenance.respondentVantage");
  const respondent = {
    roleCode: vantage.roleCode,
    seniorityLevel: vantage.canonicalSeniorityLevel,
  };
  if (typeof respondent.seniorityLevel !== "string" || !respondent.seniorityLevel) {
    fail("selector respondent vantage must establish canonicalSeniorityLevel");
  }
  const observations = QUESTION_UNIVERSE.map((questionRef) => projectEngineObservation(
    diagnosticId,
    MODULE_ID,
    { questionRef },
    resolvedObservationAnswer(MODULE_ID, respondent, questionRef, answerOf(answers, questionRef)),
    RESPONDENT_SLOT_R1,
  ));
  const snapshotIdentity = {
    diagnosticId,
    projectId: identity.projectId ?? null,
    moduleId: MODULE_ID,
    instrumentSourceWorkbook: AEM?.sourceWorkbook ?? selector.sourceInstrument,
    candidatePair: selector.candidatePair,
    candidatePairNormalized: selector.candidatePairNormalized,
    questionUniverse: [...QUESTION_UNIVERSE],
    corpus: buildCorpusIdentity(),
    runtime: {
      coreCommit: identity.coreCommit ?? RUNTIME_CORE_COMMIT,
      layeredEvidenceScoringVersion: derived.scoringModelVersion,
    },
  };
  const engine = {
    outcome: {
      engineOutcomeCode: SINGLE_R1_OUTCOME_CODE,
      outcomeClass: "constrained_interpretation_outcome",
      classificationOutcome: "R1-only interpretation; no independent R2 comparison",
      reason: SINGLE_R1_REASON_CODE,
      constraintId: SINGLE_R1_CONSTRAINT_ID,
      state: null,
      deterministicStateEstablished: false,
      provisionalState: null,
      engineOutput: "R1-established facts retained; independent R2 comparison did not run",
      contradictionCandidates: [],
      genericContradictionEngineInvoked: false,
      suppression: {
        comparatorOutputSuppressed: false,
        pairEvaluationSuppressed: false,
        prohibitedFallbackActive: false,
        determinationImpossible: null,
        comparatorDidNotRun: true,
      },
      finality: "NON_FINAL_ROUTED",
    },
    observations,
    r1Scoring: projectR1Scoring(derived),
  };
  const covered = {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    outcomeSource: SINGLE_R1_OUTCOME_CODE,
    identity: snapshotIdentity,
    selector,
    engine,
  };
  return deepFreeze({
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    engineSnapshotDigest: computeEngineSnapshotDigest(covered),
    outcomeSource: SINGLE_R1_OUTCOME_CODE,
    identity: snapshotIdentity,
    selector,
    engine,
  });
}
