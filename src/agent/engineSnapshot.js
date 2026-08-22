import canonicalSchema from "../generated/newlogic/canonicalSchema.json" with { type: "json" };
import formBindings from "../generated/newlogic/formBindings.json" with { type: "json" };
import narrativesAndFriction from "../generated/newlogic/narrativesAndFriction.json" with { type: "json" };
import questionnaires from "../generated/newlogic/questionnaires.json" with { type: "json" };
import reporting from "../generated/newlogic/reporting.json" with { type: "json" };
import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import sourceManifest from "../generated/newlogic/sourceManifest.json" with { type: "json" };

import {
  buildDualRespondentCorpusConfig,
  compareDualRespondents,
  dualQualityConfig,
} from "../flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../flow/observationScopeResolver.js";

import {
  AUTHORIZED_MODULE_IDS,
  BRANCH_CODES,
  DEC8_ADMISSIBILITY_SCOPE,
  DUAL_COMPARATOR_VERSION,
  ENGINE_ROUTING_BY_BRANCH,
  ENGINE_STATE_BY_BRANCH,
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  FINALITY_BY_BRANCH,
  FREE_INTERPRETATION_MODE_BY_BRANCH,
  P0C_EXTERNAL_FREE_INTERPRETATION_MODE,
  P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON,
  PRIORITY_TO_BRANCH_CODE,
  PROVISIONAL_STATE_CANDIDATE_4B,
  QUESTION_UNIVERSE,
  RESPONDENT_SLOT_R1,
  RESPONDENT_SLOT_R2,
  RUNTIME_CORE_COMMIT,
  SNAPSHOT_SCHEMA_VERSION,
  SUPPRESSION_BY_BRANCH,
  UNMATCHED_CLASSIFICATION_OUTCOME,
  UNMATCHED_OUTCOME_CLASS,
  UNMATCHED_OUTPUT,
  UNRESOLVED_REASON,
} from "./agentContractConstants.js";
import { canonicalSerialize, sha256PrefixedDigest } from "./canonicalDigest.js";

const GENERATED_CORPUS_ARTIFACTS = Object.freeze({
  canonicalSchema,
  formBindings,
  narrativesAndFriction,
  questionnaires,
  reporting,
  scoringAndTriage,
  sourceManifest,
});

const DUAL_CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
const PAIRROWS_ABSENT_BRANCHES = new Set(["P_0A", "P_0B", "P_0C"]);

export class AgentBoundaryAssemblyError extends Error {
  constructor({ failureClass, detail } = {}) {
    const parts = [
      "AgentBoundaryAssemblyError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "AgentBoundaryAssemblyError";
    this.failureClass = failureClass ?? FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE;
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new AgentBoundaryAssemblyError({
    failureClass: FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
    detail,
  });
}

function requireObject(value, label) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

function requireString(value, label) {
  if (typeof value !== "string") fail(`${label} must be a string`);
  return value;
}

function requireNonEmptyString(value, label) {
  const text = requireString(value, label);
  if (!text.trim()) fail(`${label} must be a non-empty string`);
  return text;
}

function copyArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function presentOrNull(record, key) {
  if (!record || typeof record !== "object") return null;
  return Object.hasOwn(record, key) ? record[key] : null;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function normalizeCandidatePair(value) {
  const raw = String(value ?? "").trim();
  const parts = raw.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return raw;
  return [...parts].sort().join(" vs ");
}

export function deriveBranchCode(coreOutput) {
  const output = requireObject(coreOutput, "coreOutput");
  const audit = output.audit == null ? {} : requireObject(output.audit, "coreOutput.audit");
  const priority = output.priority;
  const unmatched = audit.unmatched === true;

  if (priority == null) {
    if (!unmatched) fail("priority is null without audit.unmatched");
    return "UNMATCHED";
  }
  if (typeof priority !== "string" || !Object.hasOwn(PRIORITY_TO_BRANCH_CODE, priority)) {
    fail(`unknown Core priority ${JSON.stringify(priority)}`);
  }
  if (unmatched) fail(`audit.unmatched is true with priority ${JSON.stringify(priority)}`);
  return PRIORITY_TO_BRANCH_CODE[priority];
}

export function deriveFinality(branchCode) {
  if (!Object.hasOwn(FINALITY_BY_BRANCH, branchCode)) {
    fail(`unknown branchCode ${JSON.stringify(branchCode)}`);
  }
  return FINALITY_BY_BRANCH[branchCode];
}

export function deriveSuppression(branchCode) {
  if (!Object.hasOwn(SUPPRESSION_BY_BRANCH, branchCode)) {
    fail(`unknown branchCode ${JSON.stringify(branchCode)}`);
  }
  const suppression = SUPPRESSION_BY_BRANCH[branchCode];
  return {
    comparatorOutputSuppressed: suppression.comparatorOutputSuppressed,
    pairEvaluationSuppressed: suppression.pairEvaluationSuppressed,
    prohibitedFallbackActive: suppression.prohibitedFallbackActive,
    determinationImpossible: suppression.determinationImpossible,
    comparatorDidNotRun: suppression.comparatorDidNotRun,
  };
}

export function deriveFreeInterpretationMode(branchCode, { unresolvedReason } = {}) {
  if (!BRANCH_CODES.includes(branchCode)) {
    fail(`unknown branchCode ${JSON.stringify(branchCode)}`);
  }
  if (branchCode !== "P_0C") {
    return FREE_INTERPRETATION_MODE_BY_BRANCH[branchCode];
  }
  if (unresolvedReason === null) {
    return P0C_EXTERNAL_FREE_INTERPRETATION_MODE;
  }
  if (typeof unresolvedReason !== "string" || !Object.hasOwn(P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON, unresolvedReason)) {
    fail("P_0C freeInterpretationMode requires a transported unresolvedReason token or lawful null");
  }
  return P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON[unresolvedReason];
}

export function computeGeneratedCorpusDigest() {
  return sha256PrefixedDigest(canonicalSerialize(GENERATED_CORPUS_ARTIFACTS));
}

export function buildCorpusIdentity() {
  return {
    sourcePackageId: sourceManifest.sourcePackage.id,
    exportedAt: sourceManifest.sourcePackage.exportedAt,
    canonicalSchemaVersion: canonicalSchema.schemaVersion,
    corpusDigest: computeGeneratedCorpusDigest(),
  };
}

export function engineSnapshotDigestCoveredContent(snapshot) {
  const sealed = requireObject(snapshot, "snapshot");
  return {
    corpus: requireObject(sealed.identity, "snapshot.identity").corpus,
    engine: requireObject(sealed.engine, "snapshot.engine"),
  };
}

export function computeEngineSnapshotDigest(engine, corpus) {
  return sha256PrefixedDigest(canonicalSerialize({ corpus, engine }));
}

function precedenceRowForPriority(priority) {
  return (DUAL_CORPUS_CONFIG.dual.classificationPrecedence ?? []).find((row) => row.priority === priority) ?? null;
}

// Core physically emits scope.rootCauseFamily as a present-but-undefined own key
// when the selected option has no semantics row. Symmetric normalization on both
// the supplied and recomputed sides keeps that physical Core shape lawful while
// every concrete value in the object graph stays bound; an undefined-valued key
// and an absent key seal identically under the ??-null projections below.
function normalizeCoreBindingForm(value, seen) {
  if (value === undefined) fail("coreOutput must not contain undefined values");
  if (value === null || typeof value !== "object") return value;
  if (Object.getOwnPropertySymbols(value).length > 0) {
    fail("coreOutput must not carry symbol-keyed properties");
  }
  if (seen.has(value)) fail("coreOutput must not contain circular references");
  seen.add(value);
  let normalized;
  if (Array.isArray(value)) {
    normalized = value.map((item) => normalizeCoreBindingForm(item, seen));
  } else {
    normalized = {};
    for (const [key, child] of Object.entries(value)) {
      if (child === undefined) continue;
      normalized[key] = normalizeCoreBindingForm(child, seen);
    }
  }
  seen.delete(value);
  return normalized;
}

function bindIdentityToInvocation(identity, coreInput, coreOutput, branchCode) {
  if (identity.candidatePair !== coreInput.candidatePair) {
    fail("identityContext.candidatePair does not match coreInput.candidatePair");
  }

  const invocationModuleId = coreInput.moduleId;
  const identityModuleId = identity.moduleId;
  const invocationAuthorized = isAuthorizedDualModule(invocationModuleId);

  if (invocationAuthorized) {
    if (identityModuleId !== invocationModuleId) {
      fail("identityContext.moduleId does not match coreInput.moduleId");
    }
    return;
  }

  if (!AUTHORIZED_MODULE_IDS.includes(identityModuleId) || !isAuthorizedDualModule(identityModuleId)) {
    fail("P_0C identity-family snapshots still require an authorized identityContext.moduleId");
  }
  if (branchCode !== "P_0C") {
    fail("unauthorized coreInput.moduleId is only bindable to P_0C");
  }
  const unresolvedReason = presentOrNull(coreOutput.audit, "unresolvedReason");
  if (
    unresolvedReason !== UNRESOLVED_REASON.MISSING_MODULE
    && unresolvedReason !== UNRESOLVED_REASON.UNSUPPORTED_MODULE
  ) {
    fail("unauthorized coreInput.moduleId is not bound to a transported identity unresolvedReason");
  }
}

function bindCoreOutputToInvocation(coreInput, coreOutput) {
  const recomputed = compareDualRespondents(coreInput);
  const supplied = canonicalSerialize(normalizeCoreBindingForm(coreOutput, new Set()));
  const expected = canonicalSerialize(normalizeCoreBindingForm(recomputed, new Set()));
  if (supplied !== expected) {
    fail("coreOutput does not match compareDualRespondents(coreInput)");
  }
}

function requireExplicitInvocationFlags(coreInput, branchCode) {
  if (!Object.hasOwn(coreInput, "outOfPairEvidence") || typeof coreInput.outOfPairEvidence !== "boolean") {
    fail("coreInput.outOfPairEvidence must be an explicit boolean");
  }
  if (!Object.hasOwn(coreInput, "coherenceAmbiguous") || typeof coreInput.coherenceAmbiguous !== "boolean") {
    fail("coreInput.coherenceAmbiguous must be an explicit boolean");
  }
  if (branchCode === "P_2" && coreInput.outOfPairEvidence !== true) {
    fail("P_2 requires coreInput.outOfPairEvidence === true");
  }
  if (branchCode === "P_5X" && coreInput.coherenceAmbiguous !== true) {
    fail("P_5X requires coreInput.coherenceAmbiguous === true");
  }
}

function requirePairRowUniverse(pairRows) {
  if (pairRows.length !== QUESTION_UNIVERSE.length) {
    fail(`coreOutput.audit.pairRows length ${pairRows.length} is not the Dual question universe`);
  }
  const seen = new Set();
  for (let index = 0; index < QUESTION_UNIVERSE.length; index += 1) {
    const questionRef = pairRows[index]?.questionRef;
    const expected = QUESTION_UNIVERSE[index];
    if (questionRef !== expected) {
      fail(`pairRows[${index}].questionRef must be ${expected}`);
    }
    if (seen.has(questionRef)) fail(`duplicate pairRows questionRef ${questionRef}`);
    seen.add(questionRef);
  }
}

function requireBranchShape(coreOutput, branchCode) {
  const expectedRouting = ENGINE_ROUTING_BY_BRANCH[branchCode];
  if (coreOutput.routing !== expectedRouting) {
    fail(`coreOutput.routing is incompatible with ${branchCode}`);
  }

  const expectedState = ENGINE_STATE_BY_BRANCH[branchCode] ?? null;
  if ((coreOutput.state ?? null) !== expectedState) {
    fail(`coreOutput.state is incompatible with ${branchCode}`);
  }

  const pairRows = coreOutput.audit?.pairRows;
  const pairRowsPresent = Array.isArray(pairRows);
  if (PAIRROWS_ABSENT_BRANCHES.has(branchCode)) {
    if (pairRowsPresent) fail(`${branchCode} must not carry pairRows`);
  } else if (!pairRowsPresent) {
    fail(`${branchCode} must carry pairRows`);
  }
  if (pairRowsPresent) requirePairRowUniverse(pairRows);

  if (branchCode === "UNMATCHED") {
    if (coreOutput.priority != null) fail("UNMATCHED requires priority null");
    if (coreOutput.outcomeClass !== UNMATCHED_OUTCOME_CLASS) fail("UNMATCHED outcomeClass mismatch");
    if (coreOutput.classificationOutcome !== UNMATCHED_CLASSIFICATION_OUTCOME) fail("UNMATCHED classificationOutcome mismatch");
    if (coreOutput.output !== UNMATCHED_OUTPUT) fail("UNMATCHED output mismatch");
    if (coreOutput.audit?.unmatched !== true) fail("UNMATCHED requires audit.unmatched");
    return;
  }

  const row = precedenceRowForPriority(coreOutput.priority);
  if (!row) fail(`no Dual precedence row for priority ${JSON.stringify(coreOutput.priority)}`);
  if (coreOutput.outcomeClass !== row.outcomeClass) fail(`${branchCode} outcomeClass does not match Dual precedence row`);
  if (coreOutput.classificationOutcome !== row.classificationOutcome) fail(`${branchCode} classificationOutcome does not match Dual precedence row`);
  if (coreOutput.output !== row.output) fail(`${branchCode} output does not match Dual precedence row`);

  if (branchCode === "P_0C") {
    if (!Object.hasOwn(coreOutput.audit ?? {}, "unresolvedReason")) {
      fail("P_0C requires transported audit.unresolvedReason");
    }
  }
  if (branchCode === "P_2" && coreOutput.audit?.final4B !== false) {
    fail("P_2 requires audit.final4B === false");
  }
  if (branchCode === "P_1B" && coreOutput.audit?.exact1bSpecialCondition !== true) {
    fail("P_1B requires audit.exact1bSpecialCondition");
  }

  const candidates = coreOutput.contradictionCandidates ?? [];
  if (branchCode === "P_3") {
    if (candidates.length !== 1 || candidates[0]?.severity !== "high") fail("P_3 contradiction shape mismatch");
  } else if (branchCode === "P_4") {
    if (candidates.length !== 1 || candidates[0]?.severity !== "medium") fail("P_4 contradiction shape mismatch");
  } else if (candidates.length !== 0) {
    fail(`${branchCode} must not carry contradictionCandidates`);
  }
}

function projectEngineAuditRaw(audit) {
  const source = audit == null ? {} : requireObject(audit, "coreOutput.audit");
  const projected = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "pairRows") continue;
    projected[key] = value;
  }
  return projected;
}

function observationRef(diagnosticId, moduleId, questionRef, respondentSlot) {
  return `qref://${diagnosticId}/${moduleId}/${questionRef}/${respondentSlot}`;
}

function projectCausalDisposition(answer) {
  return Object.hasOwn(answer, "causalDisposition") ? answer.causalDisposition : null;
}

function projectObservation(diagnosticId, moduleId, pairRow, answer, respondentSlot) {
  if (!answer || typeof answer !== "object") {
    fail(`pairRow.${respondentSlot} answer is missing`);
  }
  const questionRef = pairRow.questionRef;
  if (!QUESTION_UNIVERSE.includes(questionRef)) {
    fail(`unsupported observation questionRef ${JSON.stringify(questionRef)}`);
  }
  const scope = answer.scope ?? {};
  const audit = scope.audit ?? {};
  return {
    observationRef: observationRef(diagnosticId, moduleId, questionRef, respondentSlot),
    questionRef,
    canonicalQuestionId: scope.canonicalQuestionId ?? null,
    respondentSlot,
    respondentSide: null,
    seniorityTier: scope.seniorityTier ?? null,
    expectedVantage: scope.expectedVantage ?? null,
    selectedOption: answer.selectedOption ?? "",
    semanticClass: scope.semanticClass ?? null,
    semanticClassEffect: presentOrNull(scope, "semanticClassEffect"),
    useClass: scope.useClass ?? null,
    comparisonEligible: scope.comparisonEligible ?? null,
    comparisonAvailability: scope.comparisonAvailability ?? null,
    rootCauseFamily: scope.rootCauseFamily ?? null,
    observationRouting: scope.routing ?? null,
    accessDisposition: {
      directObservationGate: presentOrNull(audit, "directObservationGate"),
      evidenceType: presentOrNull(audit, "evidenceType"),
      retainedReliabilityFlags: copyArray(audit.reliabilityFlags),
      accessAdjudicated: presentOrNull(audit, "accessAdjudicated"),
      optionCode: presentOrNull(audit, "optionCode"),
    },
    causalDisposition: projectCausalDisposition(answer),
    declaredEvidenceFields: {
      evidenceType: answer.evidenceType ?? null,
      knowledgeLevel: answer.knowledgeLevel ?? null,
      confidence: answer.confidence ?? null,
      reliabilityFlags: copyArray(answer.reliabilityFlags),
    },
    unresolvedReason: presentOrNull(audit, "unresolvedReason"),
  };
}

function projectObservations(diagnosticId, moduleId, pairRows) {
  if (!Array.isArray(pairRows)) return [];
  const observations = [];
  for (const pairRow of pairRows) {
    observations.push(projectObservation(diagnosticId, moduleId, pairRow, pairRow.left, RESPONDENT_SLOT_R1));
    observations.push(projectObservation(diagnosticId, moduleId, pairRow, pairRow.right, RESPONDENT_SLOT_R2));
  }
  return observations;
}

function qualityConfigFromCore() {
  const quality = dualQualityConfig();
  return {
    thresholdHigh: quality.thresholdHigh,
    thresholdMedium: quality.thresholdMedium,
    thresholdLow: quality.thresholdLow,
    thresholdExclude: quality.thresholdExclude,
    productNote: quality.productNote,
  };
}

function projectComparison({ coreOutput, coreInput, candidatePair, pairRows }) {
  const audit = coreOutput.audit ?? {};
  const quality = dualQualityConfig();
  const classification = DUAL_CORPUS_CONFIG.classification;
  const governanceQuestions = copyArray(DUAL_CORPUS_CONFIG.governanceQuestions);
  const available = Array.isArray(pairRows);
  const rows = available ? pairRows : [];

  const comparableQuestionRefs = rows.filter((row) => row.comparable === true).map((row) => row.questionRef);
  const unavailableQuestionRefs = rows.filter((row) => row.comparable !== true).map((row) => row.questionRef);
  const agreeQuestionRefs = rows.filter((row) => row.agree === true).map((row) => row.questionRef);
  const divergeQuestionRefs = rows.filter((row) => row.diverge === true).map((row) => row.questionRef);
  const excludedFromAgreementRefs = rows.filter((row) => row.excludedFromAgreementCount === true).map((row) => row.questionRef);

  const highResolverRefs = copyArray(audit.highResolvers);
  const highRows = rows.filter((row) => highResolverRefs.includes(row.questionRef));
  const highAgreeRefs = highRows
    .filter((row) => row.agree === true && row.left?.scope?.useClass === "PRIMARY" && row.right?.scope?.useClass === "PRIMARY")
    .map((row) => row.questionRef);
  const highDivergeRefs = highRows
    .filter((row) => (
      row.diverge === true
      && row.left?.scope?.useClass === "PRIMARY"
      && row.right?.scope?.useClass === "PRIMARY"
      && row.quality >= quality.thresholdMedium
    ))
    .map((row) => row.questionRef);

  const discriminatorQuestionRef = DUAL_CORPUS_CONFIG.oneHighDiscriminatorQuestion;
  const discriminator = rows.find((row) => row.questionRef === discriminatorQuestionRef) ?? null;
  const bothDiscriminatorObservationGap = discriminator
    ? discriminator.left?.scope?.semanticClass === "OBSERVATION_GAP"
      && discriminator.right?.scope?.semanticClass === "OBSERVATION_GAP"
    : null;
  const discriminatorDiverged = discriminator ? discriminator.diverge === true : null;

  const triggerRows = rows.filter((row) => row.trigger === true);
  const dec8TriggerQuality = {};
  for (const row of triggerRows) {
    dec8TriggerQuality[row.questionRef] = row.triggerQuality;
  }
  const nonGovernanceAgreeRefs = rows
    .filter((row) => (
      !governanceQuestions.includes(row.questionRef)
      && row.countableAgree === true
      && row.quality >= quality.thresholdMedium
    ))
    .map((row) => row.questionRef);

  const tierR1 = rows[0]?.left?.scope?.seniorityTier ?? null;
  const tierR2 = rows[0]?.right?.scope?.seniorityTier ?? null;
  const splitTiers = new Set([tierR1, tierR2].filter(Boolean));
  const seniorLineSplitPresent = available
    ? splitTiers.has("senior") && splitTiers.has("line_level") && splitTiers.size === 2
    : null;

  return {
    available,
    coverage: {
      questionCount: QUESTION_UNIVERSE.length,
      comparableQuestionRefs,
      unavailableQuestionRefs,
      insufficientCount: presentOrNull(audit, "insufficientCount"),
      coverageInsufficientMin: classification.coverageInsufficientMin,
      coverageQuestionCount: classification.coverageQuestionCount,
    },
    agreement: {
      rawAgreeCount: presentOrNull(audit, "rawAgreeCount"),
      effectiveAgreeCount: presentOrNull(audit, "agreeCount"),
      agreeQuestionRefs,
      divergeQuestionRefs,
      excludedFromAgreementRefs,
      agreementExclusionKnowledgeLevel: quality.agreementCountExcludeKnowledgeLevel,
      state1AgreeMin: classification.state1AgreeMin,
      state2AgreeMin: classification.state2AgreeMin,
      state2AgreeMax: classification.state2AgreeMax,
      state3NonGovernanceAgreeMin: classification.state3NonGovernanceAgreeMin,
    },
    highResolvers: {
      definedForPair: highResolverRefs,
      agreeRefs: highAgreeRefs,
      divergeRefs: highDivergeRefs,
      allBothLackComparablePrimary: presentOrNull(audit, "highAllBothLackComparablePrimary"),
      anyNotPrimaryBoth: presentOrNull(audit, "highNotPrimaryBoth"),
    },
    discriminator: {
      oneHighPair: DUAL_CORPUS_CONFIG.oneHighPair,
      discriminatorQuestionRef,
      activePairIsOneHigh: candidatePair
        ? normalizeCandidatePair(candidatePair) === DUAL_CORPUS_CONFIG.oneHighPair
        : false,
      bothDiscriminatorObservationGap,
      discriminatorDiverged,
    },
    governance: {
      governanceQuestionRefs: governanceQuestions,
      dec8TriggerRefs: triggerRows.map((row) => row.questionRef),
      dec8TriggerQuality,
      nonGovernanceAgreeRefs,
      dec8AdmissibilityScope: DEC8_ADMISSIBILITY_SCOPE,
    },
    roleSplit: {
      tierR1,
      tierR2,
      seniorLineSplitPresent,
    },
    qualityConfig: qualityConfigFromCore(),
    perQuestionQuality: rows.map((row) => ({
      questionRef: row.questionRef,
      fourFactorProduct: row.quality,
      comparable: row.comparable,
      agree: row.agree,
      diverge: row.diverge,
      countableAgree: row.countableAgree,
      excludedFromAgreementCount: row.excludedFromAgreementCount,
      dec8Trigger: row.trigger,
      triggerQuality: row.triggerQuality ?? null,
    })),
    coherenceAmbiguousInput: coreInput.coherenceAmbiguous,
    outOfPairEvidenceInput: coreInput.outOfPairEvidence,
  };
}

export function assembleEngineSnapshot({ coreOutput, identityContext, coreInput } = {}) {
  const output = requireObject(coreOutput, "coreOutput");
  const identity = requireObject(identityContext, "identityContext");
  const input = requireObject(coreInput, "coreInput");
  const diagnosticId = requireNonEmptyString(identity.diagnosticId, "identityContext.diagnosticId");
  const moduleId = requireNonEmptyString(identity.moduleId, "identityContext.moduleId");
  if (!AUTHORIZED_MODULE_IDS.includes(moduleId)) {
    fail(`identityContext.moduleId is not an authorized Dual module: ${JSON.stringify(moduleId)}`);
  }
  if (!Object.hasOwn(identity, "candidatePair") || typeof identity.candidatePair !== "string") {
    fail("identityContext.candidatePair must be a string");
  }
  if (typeof input.moduleId !== "string") fail("coreInput.moduleId must be a string");
  if (typeof input.candidatePair !== "string") fail("coreInput.candidatePair must be a string");
  if (identity.projectId != null && typeof identity.projectId !== "string") {
    fail("identityContext.projectId must be a string or null");
  }

  if (typeof output.classificationOutcome !== "string") fail("coreOutput.classificationOutcome must be a string");
  if (typeof output.outcomeClass !== "string") fail("coreOutput.outcomeClass must be a string");
  if (typeof output.routing !== "string") fail("coreOutput.routing must be a string");
  if (typeof output.output !== "string") fail("coreOutput.output must be a string");
  if (output.state != null && typeof output.state !== "string") fail("coreOutput.state must be a string or null");
  if (!Array.isArray(output.contradictionCandidates)) fail("coreOutput.contradictionCandidates must be an array");
  if (typeof output.genericContradictionEngineInvoked !== "boolean") {
    fail("coreOutput.genericContradictionEngineInvoked must be a boolean");
  }

  const branchCode = deriveBranchCode(output);
  requireExplicitInvocationFlags(input, branchCode);
  bindIdentityToInvocation(identity, input, output, branchCode);
  bindCoreOutputToInvocation(input, output);
  requireBranchShape(output, branchCode);
  deriveFreeInterpretationMode(branchCode, {
    unresolvedReason: branchCode === "P_0C" ? presentOrNull(output.audit, "unresolvedReason") : undefined,
  });

  const pairRows = output.audit?.pairRows;
  const engine = {
    outcome: {
      priority: output.priority,
      branchCode,
      outcomeClass: output.outcomeClass,
      classificationOutcome: output.classificationOutcome,
      state: output.state ?? null,
      deterministicStateEstablished: output.state != null,
      provisionalState: branchCode === "P_2" ? PROVISIONAL_STATE_CANDIDATE_4B : null,
      engineRoutingMetadata: output.routing,
      engineOutput: output.output,
      contradictionCandidates: copyArray(output.contradictionCandidates),
      genericContradictionEngineInvoked: output.genericContradictionEngineInvoked,
      suppression: deriveSuppression(branchCode),
      finality: deriveFinality(branchCode),
      engineAuditRaw: projectEngineAuditRaw(output.audit),
    },
    observations: projectObservations(diagnosticId, moduleId, pairRows),
    comparison: projectComparison({
      coreOutput: output,
      coreInput: input,
      candidatePair: identity.candidatePair,
      pairRows,
    }),
  };

  const corpus = buildCorpusIdentity();
  const snapshot = {
    snapshotSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
    engineSnapshotDigest: computeEngineSnapshotDigest(engine, corpus),
    identity: {
      diagnosticId,
      projectId: identity.projectId ?? null,
      moduleId,
      instrumentSourceWorkbook: scoringAndTriage.dualRespondentComparison.sourceWorkbook,
      candidatePair: identity.candidatePair,
      candidatePairNormalized: normalizeCandidatePair(identity.candidatePair),
      questionUniverse: [...QUESTION_UNIVERSE],
      corpus,
      runtime: {
        coreCommit: identity.coreCommit ?? RUNTIME_CORE_COMMIT,
        dualComparatorVersion: DUAL_COMPARATOR_VERSION,
        layeredEvidenceScoringVersion: identity.layeredEvidenceScoringVersion ?? null,
      },
    },
    engine,
  };

  return deepFreeze(snapshot);
}
