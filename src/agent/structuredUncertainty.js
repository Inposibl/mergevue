import {
  ACCESS_RULE_ID_TO_REASON_CODE,
  BRANCH_CODES,
  BRANCH_LEVEL_REASON_ORDER,
  CLAIM_IDS,
  CONSTRAINTS_BY_BRANCH,
  ENGINE_OUTCOME_CODES,
  ENGINE_OUTCOME_SOURCES,
  MATCHED_ACCESS_RULE_IDS,
  OBSERVATION_REASON_ORDER,
  QUESTION_REASON_ORDER,
  QUESTION_UNIVERSE,
  PRE_CORE_CONSTRAINTS_BY_OUTCOME_CODE,
  PRE_CORE_OUTCOME_CODES,
  RESPONDENT_SLOT_R1,
  SENIORITY_TIER_EXTERNAL,
  RESPONDENT_SLOT_R2,
  SEMANTIC_CLASS_TO_COVERAGE_REASON,
  SNAPSHOT_SCHEMA_VERSION,
  SINGLE_R1_CONSTRAINT_ID,
  SINGLE_R1_OUTCOME_CODE,
  SINGLE_R1_REASON_CODE,
  SURVIVING_DIAGNOSTIC_SEMANTIC_CLASSES,
  UNCERTAINTY_DOMAINS,
  UNCERTAINTY_REASON_CODES,
  UNCERTAINTY_SCHEMA_VERSION,
  UNRESOLVED_REASON,
} from "./agentContractConstants.js";

const FACTREF_PREFIX = "factref://engineSnapshot/";
const DIAGNOSTIC_SEMANTIC = new Set(SURVIVING_DIAGNOSTIC_SEMANTIC_CLASSES);
const ACCESS_REASON_SET = new Set(Object.values(ACCESS_RULE_ID_TO_REASON_CODE));

export class StructuredUncertaintyDerivationError extends Error {
  constructor(detail) {
    super(`StructuredUncertaintyDerivationError | detail=${detail}`);
    this.name = "StructuredUncertaintyDerivationError";
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new StructuredUncertaintyDerivationError(detail);
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
  return value;
}

function hasOwn(value, key) {
  return isPlainObject(value) && Object.hasOwn(value, key);
}

function copyArray(value) {
  return Array.isArray(value) ? [...value] : [];
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

function factRef(path) {
  return `${FACTREF_PREFIX}${path}`;
}

function statementFor(path, value) {
  if (value === null) return `${path} is null.`;
  if (typeof value === "boolean") return `${path} is ${value}.`;
  if (typeof value === "number") return `${path} is ${value}.`;
  return `${path} is ${JSON.stringify(value)}.`;
}

function knownFact(path, value) {
  return {
    factRef: factRef(path),
    statement: statementFor(path, value),
    value,
  };
}

function reasonRank(order, reasonCode) {
  const index = order.indexOf(reasonCode);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function domainForReason(reasonCode) {
  if (reasonCode === SINGLE_R1_REASON_CODE) return "PAIR_SCOPE";
  if (reasonCode == null) return "ELIGIBILITY";
  if (reasonCode.startsWith("ELIGIBILITY_")) return "ELIGIBILITY";
  if (ACCESS_REASON_SET.has(reasonCode)) return "ACCESS";
  if (reasonCode.startsWith("COVERAGE_")) return "COVERAGE";
  if (
    reasonCode === "QUALITY_BELOW_LOW_THRESHOLD"
    || reasonCode === "QUALITY_BELOW_MEDIUM_THRESHOLD"
    || reasonCode === "AGREEMENT_EXCLUDED_KNOWLEDGE_LEVEL"
    || reasonCode === "RELIABILITY_FLAGS_PRESENT_INDEPENDENT"
  ) {
    return "EVIDENCE_QUALITY";
  }
  if (reasonCode === "HIGH_RESOLVER_DIVERGENCE_ALL" || reasonCode === "ONE_HIGH_DISCRIMINATOR_DIVERGENCE") {
    return "CONTRADICTION";
  }
  if (reasonCode === "ROLE_LEVEL_SPLIT_SENIOR_LINE" || reasonCode === "TIER_VANTAGE_MISMATCH") {
    return "ROLE_TIER";
  }
  if (
    reasonCode === "PAIR_ABSENT"
    || reasonCode === "PAIR_NOT_IN_PRODUCTION_SET"
    || reasonCode === "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH"
    || reasonCode === "SELECTOR_NO_LAWFUL_CANDIDATE_PAIR"
    || reasonCode === "SELECTOR_CANDIDATE_PAIR_AMBIGUOUS"
  ) {
    return "PAIR_SCOPE";
  }
  if (reasonCode === "AGREEMENT_ENVIRONMENT_COHERENCE_AMBIGUOUS") return "COHERENCE";
  if (reasonCode === "CANDIDATE_PAIR_IDENTIFICATION_FAILURE" || reasonCode === "NO_PRECEDENCE_MATCH") {
    return "PROVISIONALITY";
  }
  fail(`unknown uncertainty reasonCode ${JSON.stringify(reasonCode)}`);
}

function itemShape({
  reasonCode,
  originBranch,
  affectedClaims,
  claimScope,
  evidenceRefs,
  constraintIds,
  disclosureRequired,
  derivationSource,
}) {
  if (reasonCode != null && !UNCERTAINTY_REASON_CODES.includes(reasonCode)) {
    fail(`reasonCode is not in the closed taxonomy: ${JSON.stringify(reasonCode)}`);
  }
  const domain = domainForReason(reasonCode);
  if (!UNCERTAINTY_DOMAINS.includes(domain)) fail(`unknown uncertaintyDomain ${domain}`);
  return {
    uncertaintyId: null,
    uncertaintyDomain: domain,
    reasonCode,
    originBranch,
    affectedClaims: [...affectedClaims],
    claimScope,
    evidenceRefs: [...evidenceRefs],
    constraintIds: [...constraintIds],
    disclosureRequired,
    derivationSource,
  };
}

function constraintsFor(engineOutcomeCode) {
  if (engineOutcomeCode === SINGLE_R1_OUTCOME_CODE) return [SINGLE_R1_CONSTRAINT_ID];
  if (PRE_CORE_OUTCOME_CODES.includes(engineOutcomeCode)) {
    return copyArray(PRE_CORE_CONSTRAINTS_BY_OUTCOME_CODE[engineOutcomeCode]);
  }
  return copyArray(CONSTRAINTS_BY_BRANCH[engineOutcomeCode]);
}

function qrefsForQuestion(observations, questionRef) {
  return observations
    .filter((row) => row.questionRef === questionRef)
    .map((row) => row.observationRef)
    .filter(Boolean);
}

function eligibilityReason(unresolvedReason) {
  if (unresolvedReason === UNRESOLVED_REASON.MISSING_MODULE || unresolvedReason === UNRESOLVED_REASON.UNSUPPORTED_MODULE) {
    return "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY";
  }
  if (unresolvedReason === UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION) {
    return "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY";
  }
  if (unresolvedReason === UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED) {
    return "ELIGIBILITY_UNRESOLVED_ROLE_UNSPECIFIED";
  }
  if (unresolvedReason === UNRESOLVED_REASON.UNKNOWN_SENIORITY) {
    return "ELIGIBILITY_UNRESOLVED_UNKNOWN_SENIORITY";
  }
  if (unresolvedReason === null) return null;
  fail(`unresolvedReason is not a transported eligibility token: ${JSON.stringify(unresolvedReason)}`);
}

function isExternalVantage(vantage) {
  if (!isPlainObject(vantage)) return false;
  return vantage.canonicalSeniorityTier === SENIORITY_TIER_EXTERNAL
    || vantage.canonicalSeniorityLevel === SENIORITY_TIER_EXTERNAL;
}

// PRE_CORE S_ADMISSIBILITY_UNRESOLVED maps only the two Owner-accepted
// semantic reason classes. Raw resolver tokens are never Agent-facing.
function preCoreAdmissibilityReason(snapshot) {
  const unresolvedReason = snapshot.selector?.unresolvedReason;
  if (unresolvedReason === UNRESOLVED_REASON.UNKNOWN_SENIORITY) {
    return "ELIGIBILITY_UNRESOLVED_RESPONDENT_VANTAGE_NOT_ESTABLISHED";
  }
  if (unresolvedReason === null && isExternalVantage(snapshot.selector?.respondentVantage)) {
    return "ELIGIBILITY_UNRESOLVED_EXTERNAL_VANTAGE";
  }
  fail(
    `unexpected PRE_CORE eligibility token: ${JSON.stringify(unresolvedReason)}`,
  );
}

function branchItems(snapshot) {
  const outcome = snapshot.engine.outcome;
  const branch = outcome.engineOutcomeCode;
  const comparison = snapshot.engine.comparison ?? {};
  const coverage = comparison.coverage ?? {};
  const high = comparison.highResolvers ?? {};
  const discriminator = comparison.discriminator ?? {};
  const observations = copyArray(snapshot.engine.observations);
  const items = [];

  if (branch === SINGLE_R1_OUTCOME_CODE) {
    items.push(itemShape({
      reasonCode: SINGLE_R1_REASON_CODE,
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs: [],
      constraintIds: constraintsFor(branch),
      disclosureRequired: true,
      derivationSource: "engine.outcome.reason",
    }));
  }

  if (branch === "S_ADMISSIBILITY_UNRESOLVED") {
    items.push(itemShape({
      reasonCode: preCoreAdmissibilityReason(snapshot),
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY", "CLAIM_OBSERVATION_ELIGIBILITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor(branch),
      disclosureRequired: true,
      derivationSource: "selector.unresolvedReason",
    }));
  }

  if (branch === "S_NO_LAWFUL_PAIR") {
    items.push(itemShape({
      reasonCode: "SELECTOR_NO_LAWFUL_CANDIDATE_PAIR",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor(branch),
      disclosureRequired: true,
      derivationSource: "selector.status",
    }));
  }

  if (branch === "S_PAIR_SELECTION_AMBIGUOUS") {
    items.push(itemShape({
      reasonCode: "SELECTOR_CANDIDATE_PAIR_AMBIGUOUS",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor(branch),
      disclosureRequired: true,
      derivationSource: "selector.status",
    }));
  }

  if (branch === "P_0C") {
    const audit = outcome.engineAuditRaw ?? {};
    if (!hasOwn(audit, "unresolvedReason")) {
      fail("P_0C requires a transported engineAuditRaw.unresolvedReason own-key");
    }
    items.push(itemShape({
      reasonCode: eligibilityReason(audit.unresolvedReason),
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY", "CLAIM_OBSERVATION_ELIGIBILITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("P_0C"),
      disclosureRequired: true,
      derivationSource: "engine.outcome.engineAuditRaw.unresolvedReason",
    }));
  }

  if (branch === "P_1") {
    const insufficientCount = coverage.insufficientCount;
    const coverageInsufficientMin = coverage.coverageInsufficientMin;
    if (typeof insufficientCount === "number" && typeof coverageInsufficientMin === "number"
      && insufficientCount >= coverageInsufficientMin) {
      items.push(itemShape({
        reasonCode: "COVERAGE_COMPARABLE_PAIRS_BELOW_MINIMUM",
        originBranch: branch,
        affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
        claimScope: "STATE_IDENTITY",
        evidenceRefs: [],
        constraintIds: constraintsFor("P_1"),
        disclosureRequired: true,
        derivationSource: "engine.comparison.coverage.insufficientCount",
      }));
    }
    if (high.allBothLackComparablePrimary === true) {
      items.push(itemShape({
        reasonCode: "COVERAGE_HIGH_RESOLVER_UNAVAILABLE",
        originBranch: branch,
        affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
        claimScope: "STATE_IDENTITY",
        evidenceRefs: [],
        constraintIds: constraintsFor("P_1"),
        disclosureRequired: true,
        derivationSource: "engine.comparison.highResolvers.allBothLackComparablePrimary",
      }));
    }
    if (high.anyNotPrimaryBoth === true) {
      items.push(itemShape({
        reasonCode: "COVERAGE_HIGH_RESOLVER_NOT_PRIMARY",
        originBranch: branch,
        affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
        claimScope: "STATE_IDENTITY",
        evidenceRefs: [],
        constraintIds: constraintsFor("P_1"),
        disclosureRequired: true,
        derivationSource: "engine.comparison.highResolvers.anyNotPrimaryBoth",
      }));
    }
  }

  if (branch === "P_3") {
    items.push(itemShape({
      reasonCode: "HIGH_RESOLVER_DIVERGENCE_ALL",
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs: qrefsForQuestionList(observations, copyArray(high.divergeRefs)),
      constraintIds: constraintsFor("P_3"),
      disclosureRequired: false,
      derivationSource: "engine.outcome.branchCode",
    }));
  }

  if (branch === "P_3A") {
    items.push(itemShape({
      reasonCode: "ONE_HIGH_DISCRIMINATOR_DIVERGENCE",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: qrefsForQuestion(observations, discriminator.discriminatorQuestionRef),
      constraintIds: constraintsFor("P_3A"),
      disclosureRequired: true,
      derivationSource: "engine.comparison.discriminator.discriminatorDiverged",
    }));
  }

  if (branch === "P_4") {
    items.push(itemShape({
      reasonCode: "ROLE_LEVEL_SPLIT_SENIOR_LINE",
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs: qrefsForQuestionList(observations, copyArray(comparison.governance?.dec8TriggerRefs)),
      constraintIds: constraintsFor("P_4"),
      disclosureRequired: false,
      derivationSource: "engine.outcome.branchCode",
    }));
  }

  if (branch === "P_0A") {
    items.push(itemShape({
      reasonCode: "PAIR_ABSENT",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("P_0A"),
      disclosureRequired: true,
      derivationSource: "engine.outcome.branchCode",
    }));
  }

  if (branch === "P_0B") {
    items.push(itemShape({
      reasonCode: "PAIR_NOT_IN_PRODUCTION_SET",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("P_0B"),
      disclosureRequired: true,
      derivationSource: "engine.outcome.branchCode",
    }));
  }

  if (branch === "P_1B") {
    items.push(itemShape({
      reasonCode: "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH",
      originBranch: branch,
      affectedClaims: ["CLAIM_NF_SFP_DETERMINATION"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: qrefsForQuestion(observations, discriminator.discriminatorQuestionRef),
      constraintIds: constraintsFor("P_1B"),
      disclosureRequired: true,
      derivationSource: "engine.comparison.discriminator.bothDiscriminatorObservationGap",
    }));
  }

  if (branch === "P_5X") {
    items.push(itemShape({
      reasonCode: "AGREEMENT_ENVIRONMENT_COHERENCE_AMBIGUOUS",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("P_5X"),
      disclosureRequired: true,
      derivationSource: "engine.comparison.coherenceAmbiguousInput",
    }));
  }

  if (branch === "P_2") {
    items.push(itemShape({
      reasonCode: "CANDIDATE_PAIR_IDENTIFICATION_FAILURE",
      originBranch: branch,
      affectedClaims: ["CLAIM_FINAL_4B_DETERMINATION"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("P_2"),
      disclosureRequired: true,
      derivationSource: "engine.outcome.provisionalState",
    }));
  }

  if (branch === "UNMATCHED") {
    items.push(itemShape({
      reasonCode: "NO_PRECEDENCE_MATCH",
      originBranch: branch,
      affectedClaims: ["CLAIM_ENGINE_STATE_IDENTITY"],
      claimScope: "STATE_IDENTITY",
      evidenceRefs: [],
      constraintIds: constraintsFor("UNMATCHED"),
      disclosureRequired: true,
      derivationSource: "engine.outcome.branchCode",
    }));
  }

  items.sort((left, right) => reasonRank(BRANCH_LEVEL_REASON_ORDER, left.reasonCode) - reasonRank(BRANCH_LEVEL_REASON_ORDER, right.reasonCode));
  return items;
}

function qrefsForQuestionList(observations, questionRefs) {
  const refs = [];
  for (const questionRef of questionRefs) {
    for (const ref of qrefsForQuestion(observations, questionRef)) refs.push(ref);
  }
  return refs;
}

function observationItemsFor(observation, branch) {
  if (!observation) return [];
  const local = [];
  const provenance = observation.observationAdjudicationProvenance ?? {};
  const matchedIds = copyArray(provenance.matchedAccessRuleIds);
  for (const ruleId of MATCHED_ACCESS_RULE_IDS) {
    if (!matchedIds.includes(ruleId)) continue;
    local.push(observationItem(
      branch,
      ACCESS_RULE_ID_TO_REASON_CODE[ruleId],
      observation,
      "engine.observations.observationAdjudicationProvenance.matchedAccessRuleIds",
    ));
  }
  const semanticReason = SEMANTIC_CLASS_TO_COVERAGE_REASON[observation.semanticClass];
  if (semanticReason) {
    local.push(observationItem(branch, semanticReason, observation, "engine.observations.semanticClass"));
  }
  const independentFlags = observation.causalDisposition?.independentlySupportedFlags;
  if (Array.isArray(independentFlags) && independentFlags.length > 0) {
    local.push(observationItem(
      branch,
      "RELIABILITY_FLAGS_PRESENT_INDEPENDENT",
      observation,
      "engine.observations.causalDisposition.independentlySupportedFlags",
    ));
  }
  if (provenance.tierDefaultUseClass === "CONTEXTUAL") {
    local.push(observationItem(
      branch,
      "TIER_VANTAGE_MISMATCH",
      observation,
      "engine.observations.observationAdjudicationProvenance.tierDefaultUseClass",
    ));
  }
  local.sort((left, right) => reasonRank(OBSERVATION_REASON_ORDER, left.reasonCode) - reasonRank(OBSERVATION_REASON_ORDER, right.reasonCode));
  return local;
}

function observationItem(originBranch, reasonCode, observation, derivationSource) {
  return itemShape({
    reasonCode,
    originBranch,
    affectedClaims: [],
    claimScope: "DETAIL_ONLY",
    evidenceRefs: observation.observationRef ? [observation.observationRef] : [],
    constraintIds: [],
    disclosureRequired: false,
    derivationSource,
  });
}

function questionQualityItems(snapshot, questionRef) {
  const branch = snapshot.engine.outcome.engineOutcomeCode;
  if (snapshot.outcomeSource === "PRE_CORE_SELECTOR") return [];
  const comparison = snapshot.engine.comparison ?? {};
  if (comparison.available !== true) return [];
  const row = copyArray(comparison.perQuestionQuality).find((item) => item.questionRef === questionRef);
  if (!row) return [];
  const evidenceRefs = qrefsForQuestion(copyArray(snapshot.engine.observations), questionRef);
  const qualityConfig = comparison.qualityConfig ?? {};
  const thresholdLow = qualityConfig.thresholdLow;
  const thresholdMedium = qualityConfig.thresholdMedium;
  const quality = row.fourFactorProduct;
  const local = [];
  if (typeof quality === "number" && typeof thresholdLow === "number" && quality < thresholdLow) {
    local.push(itemShape({
      reasonCode: "QUALITY_BELOW_LOW_THRESHOLD",
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs,
      constraintIds: [],
      disclosureRequired: false,
      derivationSource: "engine.comparison.perQuestionQuality.fourFactorProduct",
    }));
  } else if (
    typeof quality === "number"
    && typeof thresholdLow === "number"
    && typeof thresholdMedium === "number"
    && quality >= thresholdLow
    && quality < thresholdMedium
  ) {
    local.push(itemShape({
      reasonCode: "QUALITY_BELOW_MEDIUM_THRESHOLD",
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs,
      constraintIds: [],
      disclosureRequired: false,
      derivationSource: "engine.comparison.perQuestionQuality.fourFactorProduct",
    }));
  }
  if (row.excludedFromAgreementCount === true) {
    local.push(itemShape({
      reasonCode: "AGREEMENT_EXCLUDED_KNOWLEDGE_LEVEL",
      originBranch: branch,
      affectedClaims: [],
      claimScope: "DETAIL_ONLY",
      evidenceRefs,
      constraintIds: [],
      disclosureRequired: false,
      derivationSource: "engine.comparison.perQuestionQuality.excludedFromAgreementCount",
    }));
  }
  local.sort((left, right) => reasonRank(QUESTION_REASON_ORDER, left.reasonCode) - reasonRank(QUESTION_REASON_ORDER, right.reasonCode));
  return local;
}

function perQuestionItems(snapshot) {
  if (snapshot.outcomeSource === "PRE_CORE_SELECTOR") return [];
  const branch = snapshot.engine.outcome.engineOutcomeCode;
  const observations = copyArray(snapshot.engine.observations);
  const byQuestion = new Map();
  for (const questionRef of QUESTION_UNIVERSE) byQuestion.set(questionRef, { R1: null, R2: null });
  for (const observation of observations) {
    if (!QUESTION_UNIVERSE.includes(observation.questionRef)) continue;
    const slot = observation.respondentSlot === RESPONDENT_SLOT_R2 ? RESPONDENT_SLOT_R2 : RESPONDENT_SLOT_R1;
    byQuestion.get(observation.questionRef)[slot] = observation;
  }
  const items = [];
  for (const questionRef of QUESTION_UNIVERSE) {
    const pair = byQuestion.get(questionRef);
    items.push(...observationItemsFor(pair[RESPONDENT_SLOT_R1], branch));
    items.push(...observationItemsFor(pair[RESPONDENT_SLOT_R2], branch));
    items.push(...questionQualityItems(snapshot, questionRef));
  }
  return items;
}

function assignIds(items) {
  return items.map((item, index) => ({
    ...item,
    uncertaintyId: `U-${String(index + 1).padStart(3, "0")}`,
  }));
}

function buildKnown(snapshot) {
  const outcome = snapshot.engine.outcome;
  const known = [
    knownFact("engine/outcome/engineOutcomeCode", outcome.engineOutcomeCode),
    knownFact("engine/outcome/state", outcome.state),
    knownFact("engine/outcome/deterministicStateEstablished", outcome.deterministicStateEstablished),
  ];
  if (snapshot.outcomeSource === "DUAL_CORE") {
    known.push(knownFact("engine/outcome/branchCode", outcome.branchCode));
  }
  if (snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE) {
    known.push(knownFact("identity/candidatePair", snapshot.identity.candidatePair));
    known.push(knownFact("engine/r1Scoring/primaryEnvironmentCode", snapshot.engine.r1Scoring.primaryEnvironmentCode));
    known.push(knownFact("engine/r1Scoring/secondaryEnvironmentCode", snapshot.engine.r1Scoring.secondaryEnvironmentCode));
    known.push(knownFact("engine/outcome/suppression/comparatorDidNotRun", true));
  }
  const branch = outcome.engineOutcomeCode;
  if (PRE_CORE_OUTCOME_CODES.includes(branch)) {
    known.push(knownFact("identity/candidatePair", snapshot.identity.candidatePair));
    known.push(knownFact(
      "engine/outcome/suppression/comparatorDidNotRun",
      outcome.suppression?.comparatorDidNotRun,
    ));
  }
  const audit = outcome.engineAuditRaw ?? {};
  const comparison = snapshot.engine.comparison ?? {};

  if (branch === "P_0C") {
    if (hasOwn(audit, "unresolvedReason")) {
      known.push(knownFact("engine/outcome/engineAuditRaw/unresolvedReason", audit.unresolvedReason));
    }
    if (hasOwn(audit, "questionRef")) {
      known.push(knownFact("engine/outcome/engineAuditRaw/questionRef", audit.questionRef));
    }
  }
  if (branch === "P_2") {
    known.push(knownFact("engine/outcome/provisionalState", outcome.provisionalState));
    if (hasOwn(comparison, "outOfPairEvidenceInput")) {
      known.push(knownFact("engine/comparison/outOfPairEvidenceInput", comparison.outOfPairEvidenceInput));
    }
  }
  if (branch === "P_1B") {
    known.push(knownFact("engine/outcome/suppression/pairEvaluationSuppressed", outcome.suppression?.pairEvaluationSuppressed));
    known.push(knownFact("engine/outcome/suppression/prohibitedFallbackActive", outcome.suppression?.prohibitedFallbackActive));
    if (hasOwn(comparison.discriminator ?? {}, "bothDiscriminatorObservationGap")) {
      known.push(knownFact(
        "engine/comparison/discriminator/bothDiscriminatorObservationGap",
        comparison.discriminator.bothDiscriminatorObservationGap,
      ));
    }
  }
  if (branch === "P_1") {
    if (hasOwn(comparison.coverage ?? {}, "insufficientCount")) {
      known.push(knownFact("engine/comparison/coverage/insufficientCount", comparison.coverage.insufficientCount));
    }
    if (hasOwn(comparison.highResolvers ?? {}, "allBothLackComparablePrimary")) {
      known.push(knownFact("engine/comparison/highResolvers/allBothLackComparablePrimary", comparison.highResolvers.allBothLackComparablePrimary));
    }
    if (hasOwn(comparison.highResolvers ?? {}, "anyNotPrimaryBoth")) {
      known.push(knownFact("engine/comparison/highResolvers/anyNotPrimaryBoth", comparison.highResolvers.anyNotPrimaryBoth));
    }
  }
  if (branch === "P_5X" && hasOwn(comparison, "coherenceAmbiguousInput")) {
    known.push(knownFact("engine/comparison/coherenceAmbiguousInput", comparison.coherenceAmbiguousInput));
  }
  if (branch === "P_3A" && hasOwn(comparison.discriminator ?? {}, "discriminatorDiverged")) {
    known.push(knownFact("engine/comparison/discriminator/discriminatorDiverged", comparison.discriminator.discriminatorDiverged));
  }
  if ((branch === "P_4") && hasOwn(comparison.roleSplit ?? {}, "seniorLineSplitPresent")) {
    known.push(knownFact("engine/comparison/roleSplit/seniorLineSplitPresent", comparison.roleSplit.seniorLineSplitPresent));
  }
  return known;
}

function buildUnknown(snapshot, items) {
  const outcome = snapshot.engine.outcome;
  const branch = outcome.engineOutcomeCode;
  const unknown = [];
  if (outcome.deterministicStateEstablished !== true) {
    unknown.push({
      claimId: "CLAIM_ENGINE_STATE_IDENTITY",
      statement: "The engine did not establish a deterministic state identity.",
      whyUnknown: items.find((item) => item.affectedClaims.includes("CLAIM_ENGINE_STATE_IDENTITY"))?.reasonCode
        ?? (branch === "P_1B" ? "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH" : branch),
    });
  }
  if (branch === "P_1B") {
    unknown.push({
      claimId: "CLAIM_NF_SFP_DETERMINATION",
      statement: "The engine did not establish an NF/SFP determination.",
      whyUnknown: "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH",
    });
  }
  if (branch === "P_2") {
    unknown.push({
      claimId: "CLAIM_FINAL_4B_DETERMINATION",
      statement: "The engine did not establish a final ④-B determination.",
      whyUnknown: "CANDIDATE_PAIR_IDENTIFICATION_FAILURE",
    });
  }
  if (branch === "P_0C" || branch === "S_ADMISSIBILITY_UNRESOLVED") {
    unknown.push({
      claimId: "CLAIM_OBSERVATION_ELIGIBILITY",
      statement: "The engine did not establish observation eligibility.",
      whyUnknown: items.find((item) => item.uncertaintyDomain === "ELIGIBILITY")?.reasonCode ?? null,
    });
  }
  return unknown;
}

function withheldEntry(withheldItem, withheldBy, engineOutputText, reconstructionProhibited) {
  return {
    withheldItem,
    withheldBy,
    engineOutputText,
    reconstructionProhibited,
  };
}

function buildWithheld(snapshot) {
  const outcome = snapshot.engine.outcome;
  const branch = outcome.engineOutcomeCode;
  const engineOutputText = outcome.engineOutput;
  if (branch === SINGLE_R1_OUTCOME_CODE) {
    return [withheldEntry("independent R2 comparison", SINGLE_R1_OUTCOME_CODE, engineOutputText, true)];
  }
  if (branch === "P_0A") {
    return [withheldEntry("comparator output", "P_0A", engineOutputText, true)];
  }
  if (branch === "P_0B") {
    return [withheldEntry("comparator output", "P_0B", engineOutputText, true)];
  }
  if (branch === "P_0C") {
    return [withheldEntry("five-state classification", "P_0C", engineOutputText, true)];
  }
  if (branch === "P_1") {
    return [withheldEntry("comparator output", "P_1", engineOutputText, true)];
  }
  if (branch === "P_1B") {
    return [withheldEntry("NF/SFP determination", "P_1B", engineOutputText, true)];
  }
  if (branch === "P_2") {
    return [withheldEntry("final ④-B determination", "P_2", engineOutputText, true)];
  }
  if (branch === "P_3A") {
    return [withheldEntry("final ④-A determination", "P_3A", engineOutputText, true)];
  }
  if (branch === "P_5X") {
    return [withheldEntry("State① or State② assignment", "P_5X", engineOutputText, true)];
  }
  if (branch === "UNMATCHED") {
    return [withheldEntry("deterministic state identity", "UNMATCHED", engineOutputText, true)];
  }
  if (branch === "S_ADMISSIBILITY_UNRESOLVED") {
    return [withheldEntry("five-state classification", branch, engineOutputText, true)];
  }
  if (branch === "S_NO_LAWFUL_PAIR" || branch === "S_PAIR_SELECTION_AMBIGUOUS") {
    return [withheldEntry("comparator output", branch, engineOutputText, true)];
  }
  return [];
}

function partitionEvidence(snapshot) {
  const surviving = [];
  const unavailable = [];
  for (const observation of copyArray(snapshot.engine.observations)) {
    const ref = observation.observationRef;
    if (typeof ref !== "string" || ref.length === 0) {
      fail("engine.observations contains an observation without a qref");
    }
    if (DIAGNOSTIC_SEMANTIC.has(observation.semanticClass)) {
      surviving.push(ref);
      continue;
    }
    if (observation.comparisonAvailability === "unavailable") {
      unavailable.push(ref);
      continue;
    }
    surviving.push(ref);
  }
  return { survivingEvidenceRefs: surviving, unavailableEvidenceRefs: unavailable };
}

function permittedFormFor(claimId, snapshot) {
  const branch = snapshot.engine.outcome.engineOutcomeCode;
  const state = snapshot.engine.outcome.state;
  if (claimId === "CLAIM_ENGINE_STATE_IDENTITY") {
    if (branch === "P_3A") return "The engine did not establish final ④-A.";
    if (branch === "P_5X") return "The engine did not establish State① or State② as deterministic.";
    if (snapshot.engine.outcome.deterministicStateEstablished === true) {
      if (branch === "P_5B") {
        return `The engine established state ${JSON.stringify(state)}. Weaker patterns must not be treated as State②.`;
      }
      return `The engine established state ${JSON.stringify(state)}.`;
    }
    return "The engine did not establish a deterministic state identity.";
  }
  if (claimId === "CLAIM_NF_SFP_DETERMINATION") {
    if (branch === "P_1B") return "The engine did not establish whether the pair resolves to NF/SFP or NF/SFJ.";
    return "The engine did not produce an NF/SFP determination on this branch.";
  }
  if (claimId === "CLAIM_FINAL_4B_DETERMINATION") {
    if (branch === "P_2") return "The engine established only provisionalState candidate_4B, not a final ④-B determination.";
    return "The engine did not establish a final ④-B determination.";
  }
  if (claimId === "CLAIM_OBSERVATION_ELIGIBILITY") {
    if (
      branch === "P_0C"
      || branch === "P_0A"
      || branch === "P_0B"
      || PRE_CORE_OUTCOME_CODES.includes(branch)
    ) {
      return "The engine did not establish observation eligibility.";
    }
    return "Observation eligibility is limited to sealed EngineSnapshot useClass and comparison fields.";
  }
  fail(`unknown claimId ${claimId}`);
}

function claimPermitted(claimId, snapshot) {
  const branch = snapshot.engine.outcome.engineOutcomeCode;
  if (claimId === "CLAIM_ENGINE_STATE_IDENTITY") {
    return snapshot.engine.outcome.deterministicStateEstablished === true;
  }
  if (claimId === "CLAIM_NF_SFP_DETERMINATION") return false;
  if (claimId === "CLAIM_FINAL_4B_DETERMINATION") return false;
  if (claimId === "CLAIM_OBSERVATION_ELIGIBILITY") {
    return branch !== "P_0C"
      && branch !== "P_0A"
      && branch !== "P_0B"
      && !PRE_CORE_OUTCOME_CODES.includes(branch);
  }
  return false;
}

function claimIdsFor(snapshot) {
  const branch = snapshot.engine.outcome.engineOutcomeCode;
  if (!PRE_CORE_OUTCOME_CODES.includes(branch)) return CLAIM_IDS;
  if (branch === "S_ADMISSIBILITY_UNRESOLVED") {
    return Object.freeze(["CLAIM_ENGINE_STATE_IDENTITY", "CLAIM_OBSERVATION_ELIGIBILITY"]);
  }
  return Object.freeze(["CLAIM_ENGINE_STATE_IDENTITY"]);
}

function buildClaimBoundaries(snapshot) {
  return claimIdsFor(snapshot).map((claimId) => ({
    claimId,
    permitted: claimPermitted(claimId, snapshot),
    permittedForm: permittedFormFor(claimId, snapshot),
  }));
}

function validateSnapshot(engineSnapshot) {
  const snapshot = requireObject(engineSnapshot, "engineSnapshot");
  if (snapshot.snapshotSchemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    fail(`engineSnapshot.snapshotSchemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}`);
  }
  const engine = requireObject(snapshot.engine, "engineSnapshot.engine");
  const outcome = requireObject(engine.outcome, "engineSnapshot.engine.outcome");
  if (!ENGINE_OUTCOME_SOURCES.includes(snapshot.outcomeSource)) {
    fail(`engineSnapshot.outcomeSource is not closed: ${JSON.stringify(snapshot.outcomeSource)}`);
  }
  if (!ENGINE_OUTCOME_CODES.includes(outcome.engineOutcomeCode)) {
    fail(`engine.outcome.engineOutcomeCode is not closed: ${JSON.stringify(outcome.engineOutcomeCode)}`);
  }
  if (!Array.isArray(engine.observations)) fail("engine.observations must be an array");
  if (snapshot.outcomeSource === "DUAL_CORE") {
    if (!BRANCH_CODES.includes(outcome.branchCode) || outcome.branchCode !== outcome.engineOutcomeCode) {
      fail("DUAL_CORE requires branchCode equal to engineOutcomeCode");
    }
    requireObject(engine.comparison, "engineSnapshot.engine.comparison");
  } else if (snapshot.outcomeSource === "PRE_CORE_SELECTOR") {
    if (!PRE_CORE_OUTCOME_CODES.includes(outcome.engineOutcomeCode)) {
      fail("PRE_CORE_SELECTOR requires an S_* engineOutcomeCode");
    }
    if (Object.hasOwn(outcome, "branchCode")) fail("PRE_CORE_SELECTOR outcome cannot contain branchCode");
    if (Object.hasOwn(engine, "comparison")) fail("PRE_CORE_SELECTOR engine cannot contain comparison");
    if (engine.observations.length !== 0) fail("PRE_CORE_SELECTOR observations must be empty");
  } else {
    if (outcome.engineOutcomeCode !== SINGLE_R1_OUTCOME_CODE) {
      fail("SINGLE_R1_ONLY requires matching engineOutcomeCode");
    }
    if (Object.hasOwn(outcome, "branchCode")) fail("SINGLE_R1_ONLY outcome cannot contain branchCode");
    if (Object.hasOwn(engine, "comparison")) fail("SINGLE_R1_ONLY engine cannot contain comparison");
    requireObject(engine.r1Scoring, "engineSnapshot.engine.r1Scoring");
    if (outcome.reason !== SINGLE_R1_REASON_CODE || outcome.constraintId !== SINGLE_R1_CONSTRAINT_ID) {
      fail("SINGLE_R1_ONLY reason/constraint identity mismatch");
    }
    if (outcome.suppression?.comparatorDidNotRun !== true) {
      fail("SINGLE_R1_ONLY requires comparatorDidNotRun true");
    }
    const expectedQuestions = new Set(QUESTION_UNIVERSE);
    if (engine.observations.length !== QUESTION_UNIVERSE.length) {
      fail("SINGLE_R1_ONLY requires the exact R1 question universe");
    }
    for (const observation of engine.observations) {
      if (observation?.respondentSlot !== RESPONDENT_SLOT_R1) {
        fail("SINGLE_R1_ONLY observations must be R1-only");
      }
      if (!expectedQuestions.delete(observation.questionRef)) {
        fail("SINGLE_R1_ONLY observations contain a duplicate or unknown questionRef");
      }
      const expectedRef = `qref://${snapshot.identity?.diagnosticId}/${snapshot.identity?.moduleId}/${observation.questionRef}/${RESPONDENT_SLOT_R1}`;
      if (observation.observationRef !== expectedRef) {
        fail("SINGLE_R1_ONLY observationRef must carry canonical R1 provenance");
      }
    }
    if (expectedQuestions.size !== 0) fail("SINGLE_R1_ONLY observations omit an R1 questionRef");
  }
  return snapshot;
}

function assertNoHumanRuntime(value, path) {
  const forbidden = [
    "analyst review required",
    "practitioner will decide",
    "awaiting human review",
    "escalation to analyst",
  ];
  const walk = (node, here) => {
    if (typeof node === "string") {
      const lower = node.toLowerCase();
      for (const phrase of forbidden) {
        if (lower.includes(phrase)) fail(`${here} contains human-runtime semantics`);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${here}[${index}]`));
      return;
    }
    if (isPlainObject(node)) {
      for (const [key, child] of Object.entries(node)) walk(child, `${here}.${key}`);
    }
  };
  walk(value, path);
}

export function buildStructuredUncertainty(engineSnapshot) {
  const snapshot = validateSnapshot(engineSnapshot);
  const originBranch = snapshot.engine.outcome.engineOutcomeCode;
  const collected = [
    ...branchItems(snapshot),
    ...perQuestionItems(snapshot),
  ];
  const items = assignIds(collected);
  const known = buildKnown(snapshot);
  const unknown = buildUnknown(snapshot, items);
  const withheldOutputs = buildWithheld(snapshot);
  const { survivingEvidenceRefs, unavailableEvidenceRefs } = partitionEvidence(snapshot);
  const claimBoundaries = buildClaimBoundaries(snapshot);
  const materialUncertaintyPresent = items.some((item) => item.disclosureRequired === true);

  const overlap = survivingEvidenceRefs.filter((ref) => unavailableEvidenceRefs.includes(ref));
  if (overlap.length) fail("survivingEvidenceRefs and unavailableEvidenceRefs must be disjoint");

  const result = {
    uncertaintySchemaVersion: UNCERTAINTY_SCHEMA_VERSION,
    originBranch,
    materialUncertaintyPresent,
    known,
    unknown,
    withheldOutputs,
    survivingEvidenceRefs,
    unavailableEvidenceRefs,
    items,
    claimBoundaries,
  };
  assertNoHumanRuntime(result, "structuredUncertainty");
  return deepFreeze(result);
}
