import {
  DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE,
  hasFreeInadmissibleDocumentCapability,
} from "./evidenceClassification.js";

export const LAYERED_EVIDENCE_SCORING_VERSION = "newlogic-layered-evidence-v2";
export { DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE };

export const SCALE_INVARIANT_SIGNAL_THRESHOLDS = Object.freeze({
  compositionGap: 0.111,
  primarySupport: 0.29,
  effectiveCoverage: 0.35,
});

export const DEFAULT_ENVIRONMENT_CODES = Object.freeze([
  "NT/STJ",
  "NT/STP",
  "NF/NT",
  "NF/SFJ",
  "NF/SFP",
  "SFJ/SFP",
  "STJ/STP",
  "STP/STJ",
  "SFP/SFJ",
]);

const EVIDENCE_WEIGHTS = Object.freeze({
  direct_observation: 1,
  document_supported: 1,
  reported_by_others: 0.55,
  inference: 0.35,
  hypothetical: 0.2,
  unknown: 0,
});

const KNOWLEDGE_WEIGHTS = Object.freeze({
  first_hand: 1,
  second_hand: 0.7,
  document_based: 0.85,
  pattern_based: 0.5,
  speculative: 0.2,
  not_known: 0,
});

const CONFIDENCE_EVIDENCE_COMPATIBILITY = Object.freeze({
  high: Object.freeze(["direct_observation", "document_supported"]),
  medium: Object.freeze(["direct_observation", "document_supported", "reported_by_others", "inference"]),
  low: Object.freeze(["reported_by_others", "inference", "hypothetical"]),
  cannot_determine: Object.freeze(["unknown"]),
});

const NUMERIC_RELIABILITY_MULTIPLIERS = Object.freeze({
  contradicted_by_respondent: 0.5,
  contradicted_by_document: 0.2,
  socially_desirable: 0.7,
  overgeneralized: 0.5,
});

const PROCEDURAL_RELIABILITY_EFFECTS = Object.freeze({
  speaks_for_group_without_access: "evidence_type_cap",
  no_direct_knowledge: "exclude_from_primary_score",
  hypothetical: "exclude_from_primary_score",
  evasive: "treat_as_unknown",
  structurally_unlikely: "analyst_review",
  acquisition_framing_contamination: "exclude_from_primary_score",
});

export const ACQUISITION_FRAMING_CONTAMINATION_FLAG = "acquisition_framing_contamination";
const TARGET_ONLY_RELIABILITY_FLAGS = Object.freeze([ACQUISITION_FRAMING_CONTAMINATION_FLAG]);

const INFERENCE_EVIDENCE_TYPE = "inference";
const HYPOTHETICAL_EVIDENCE_TYPE = "hypothetical";
const UNKNOWN_EVIDENCE_TYPE = "unknown";

const LEGACY_OPTION_ONLY_CLASSIFICATION = Object.freeze({
  directObservationGate: "no",
  evidenceType: "inference",
  knowledgeLevel: "pattern_based",
  confidence: "low",
  reliabilityFlags: Object.freeze(["no_direct_knowledge"]),
  source: "legacy_option_only",
});

function roundScore(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function emptyScoreMap(environmentCodes) {
  return Object.fromEntries(environmentCodes.map((code) => [code, 0]));
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFlags(value) {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(normalizeString).filter(Boolean));
  }
  if (typeof value === "string") {
    return Object.freeze(value.split(",").map(normalizeString).filter(Boolean));
  }
  return Object.freeze([]);
}

function normalizeAnswer(answer) {
  if (answer && typeof answer === "object") {
    const selectedOption = normalizeString(answer.selectedOption ?? answer.option ?? answer.value);
    return Object.freeze({
      selectedOption,
      directObservationGate: normalizeString(answer.directObservationGate) || LEGACY_OPTION_ONLY_CLASSIFICATION.directObservationGate,
      evidenceType: normalizeString(answer.evidenceType) || LEGACY_OPTION_ONLY_CLASSIFICATION.evidenceType,
      knowledgeLevel: normalizeString(answer.knowledgeLevel) || LEGACY_OPTION_ONLY_CLASSIFICATION.knowledgeLevel,
      confidence: normalizeString(answer.confidence) || LEGACY_OPTION_ONLY_CLASSIFICATION.confidence,
      reliabilityFlags: normalizeFlags(answer.reliabilityFlags),
      source: normalizeString(answer.source) || "structured_answer",
    });
  }

  const selectedOption = normalizeString(answer);
  if (!selectedOption) return null;

  return Object.freeze({
    selectedOption,
    ...LEGACY_OPTION_ONLY_CLASSIFICATION,
  });
}

function optionValue(option) {
  return normalizeString(option?.value ?? option?.option);
}

function selectedOption(question, selectedValue) {
  return question?.options?.find((option) => optionValue(option) === selectedValue) ?? null;
}

function optionSignalCodes(option, environmentCodes) {
  const allowed = new Set(environmentCodes);
  const directSignals = [
    ...(Array.isArray(option?.signals) ? option.signals : []),
    ...(Array.isArray(option?.internalEnvironmentSignals) ? option.internalEnvironmentSignals : []),
    ...(Array.isArray(option?.environmentSignals) ? option.environmentSignals : []),
  ];

  if (normalizeString(option?.environment) && normalizeString(option.environment) !== "N/A") {
    directSignals.push(normalizeString(option.environment));
  }

  return Object.freeze([...new Set(directSignals.map(normalizeString).filter((code) => allowed.has(code)))]);
}

function isExcludedOption(option, signalCodes) {
  if (!option) return true;
  if (option.excludedFromPrimaryScoring === true) return true;
  if (signalCodes.length === 0) return true;

  const text = normalizeString(option.text ?? option.label).toLowerCase();
  return (
    text.includes("cannot answer")
    || text.includes("cannot answer from direct observation")
    || text.includes("no direct observation")
    || text.includes("unknown")
  );
}

function questionHasScoringOpportunity(question, environmentCodes) {
  return Array.isArray(question?.options) && question.options.some((option) => {
    const signalCodes = optionSignalCodes(option, environmentCodes);
    return !isExcludedOption(option, signalCodes);
  });
}

function opportunityMassForQuestionSets(questionSets, environmentCodes) {
  return questionSets.reduce((total, questionSet) => (
    total + (Array.isArray(questionSet?.questions)
      ? questionSet.questions.filter((question) => questionHasScoringOpportunity(question, environmentCodes)).length
      : 0)
  ), 0);
}

function isNoSuchEventOption(question, option) {
  if (!option) return false;
  const scoringNote = normalizeString(option.scoringNote).toLowerCase();
  if (scoringNote.includes("no_such_event_observed") || scoringNote.includes("no_such_period_observed")) {
    return true;
  }

  const source = normalizeString(question?.sourceWorkbook);
  const questionId = normalizeString(question?.workbookQuestionId ?? question?.id);
  const value = optionValue(option);
  return source.includes("ST_Target_Self_Assessment_Module.xlsx")
    && questionId === "Q10"
    && value === "E";
}

function unrecognizedReliabilityFlagError(flag) {
  const error = new Error(`Unrecognized reliability flag: ${flag}`);
  error.name = "UnrecognizedReliabilityFlagError";
  error.flag = flag;
  error.status = "unrecognized_reliability_flag";
  return error;
}

export function isUnrecognizedReliabilityFlagError(error) {
  return Boolean(
    error
    && typeof error === "object"
    && error.name === "UnrecognizedReliabilityFlagError"
    && error.status === "unrecognized_reliability_flag"
    && typeof error.flag === "string"
  );
}

export function unrecognizedReliabilityFlagValidation(error) {
  return Object.freeze({
    status: "unrecognized_reliability_flag",
    name: "UnrecognizedReliabilityFlagError",
    flag: error.flag,
  });
}

function illegalReliabilityFlagForSideError(flag, side) {
  const error = new Error(`Reliability flag ${flag} is not legal for respondent side ${side ?? "unspecified"}`);
  error.name = "IllegalReliabilityFlagForSideError";
  error.status = "illegal_reliability_flag_for_side";
  error.flag = flag;
  error.side = side ?? null;
  return error;
}

export function isIllegalReliabilityFlagForSideError(error) {
  return Boolean(
    error
    && typeof error === "object"
    && error.name === "IllegalReliabilityFlagForSideError"
    && error.status === "illegal_reliability_flag_for_side"
    && typeof error.flag === "string"
  );
}

function inferredRespondentSide(options = {}) {
  const explicit = normalizeString(options.respondentSide);
  if (explicit) return explicit;
  const moduleId = normalizeString(options.moduleId);
  if (moduleId === "target_self_assessment") return "target";
  if (moduleId.startsWith("acquirer_")) return "acquirer";
  return null;
}

function assertTargetOnlyFlagsLegal(flags, respondentSide) {
  for (const flag of flags) {
    if (TARGET_ONLY_RELIABILITY_FLAGS.includes(flag) && respondentSide !== "target") {
      throw illegalReliabilityFlagForSideError(flag, respondentSide);
    }
  }
}

function isKnownReliabilityFlag(flag) {
  return Object.hasOwn(NUMERIC_RELIABILITY_MULTIPLIERS, flag)
    || Object.hasOwn(PROCEDURAL_RELIABILITY_EFFECTS, flag);
}

function emptyReliabilityEffects() {
  return Object.freeze({
    evidenceTypeCap: null,
    excludeFromPrimaryScoring: false,
    treatAsUnknown: false,
    analystReviewOnly: false,
    numericMultiplier: 1,
  });
}

function deriveReliabilityEffects(flags, options = {}) {
  for (const flag of flags) {
    if (!isKnownReliabilityFlag(flag)) {
      throw unrecognizedReliabilityFlagError(flag);
    }
  }

  const scoringFlags = Array.isArray(options.effectiveScoringFlags) ? options.effectiveScoringFlags : flags;
  const suppressInferenceCap = options.suppressSpeaksForGroupInferenceCap === true
    || options.observationScopeAdjudicatedAccess === true;

  let numericMultiplier = 1;
  for (const flag of scoringFlags) {
    if (Object.hasOwn(NUMERIC_RELIABILITY_MULTIPLIERS, flag)) {
      numericMultiplier *= NUMERIC_RELIABILITY_MULTIPLIERS[flag];
    }
  }

  return Object.freeze({
    evidenceTypeCap: (!suppressInferenceCap && flags.includes("speaks_for_group_without_access"))
      ? INFERENCE_EVIDENCE_TYPE
      : null,
    excludeFromPrimaryScoring: scoringFlags.includes("no_direct_knowledge")
      || scoringFlags.includes("hypothetical")
      || scoringFlags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG),
    treatAsUnknown: scoringFlags.includes("evasive"),
    analystReviewOnly: scoringFlags.includes("structurally_unlikely"),
    numericMultiplier,
  });
}

const ACCESS_CAUSE_FLAG = "speaks_for_group_without_access";

export function deriveObservationScopeCausalDisposition({
  reliabilityFlags = [],
  observationScopeAdjudicatedAccess = false,
} = {}) {
  const retainedAuditFlags = Object.freeze([...(reliabilityFlags ?? [])]);
  const independentlySupportedFlags = Object.freeze(
    retainedAuditFlags.filter((flag) => flag !== ACCESS_CAUSE_FLAG),
  );
  const suppressAccessCause = observationScopeAdjudicatedAccess && retainedAuditFlags.includes(ACCESS_CAUSE_FLAG);
  const suppressedScoringFlags = Object.freeze(suppressAccessCause ? [ACCESS_CAUSE_FLAG] : []);
  const effectiveScoringFlags = Object.freeze(
    retainedAuditFlags.filter((flag) => !suppressedScoringFlags.includes(flag)),
  );
  const reliabilityEffects = deriveReliabilityEffects(retainedAuditFlags, {
    effectiveScoringFlags,
    suppressSpeaksForGroupInferenceCap: true,
    observationScopeAdjudicatedAccess,
  });

  return Object.freeze({
    retainedAuditFlags,
    effectiveScoringFlags,
    suppressedScoringFlags,
    effectiveTriageFlags: effectiveScoringFlags,
    suppressedTriageFlags: suppressedScoringFlags,
    independentlySupportedFlags,
    reliabilityEffects,
    forcedInference: false,
  });
}

function evidenceTypeAuthority(evidenceType) {
  if (Object.hasOwn(EVIDENCE_WEIGHTS, evidenceType)) return EVIDENCE_WEIGHTS[evidenceType];
  return EVIDENCE_WEIGHTS[INFERENCE_EVIDENCE_TYPE];
}

function cappedEvidenceType(originalEvidenceType, capType) {
  if (!capType) return originalEvidenceType;
  return evidenceTypeAuthority(originalEvidenceType) > evidenceTypeAuthority(capType)
    ? capType
    : originalEvidenceType;
}

function scoringEvidenceType(originalEvidenceType, effects) {
  if (effects.treatAsUnknown) return UNKNOWN_EVIDENCE_TYPE;
  return cappedEvidenceType(originalEvidenceType, effects.evidenceTypeCap);
}

function isNonPrimaryEvidenceType(evidenceType) {
  return evidenceType === HYPOTHETICAL_EVIDENCE_TYPE || evidenceType === UNKNOWN_EVIDENCE_TYPE;
}

function derivePrimaryExclusionReasons({
  optionExcluded,
  noSuchEvent,
  flags,
  originalEvidenceType,
  effectiveEvidenceType,
  documentCapabilityExcluded,
}) {
  const reasons = [];
  if (optionExcluded) reasons.push("option_excluded");
  if (noSuchEvent) reasons.push("no_such_event");
  if (flags.includes("no_direct_knowledge")) reasons.push("no_direct_knowledge");
  if (flags.includes("hypothetical")) reasons.push("reliability_flag_hypothetical");
  if (flags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG)) reasons.push("contamination_flagged");
  if (originalEvidenceType === HYPOTHETICAL_EVIDENCE_TYPE || effectiveEvidenceType === HYPOTHETICAL_EVIDENCE_TYPE) {
    reasons.push("evidence_type_hypothetical");
  }
  if (originalEvidenceType === UNKNOWN_EVIDENCE_TYPE || effectiveEvidenceType === UNKNOWN_EVIDENCE_TYPE) {
    reasons.push("evidence_type_unknown");
  }
  if (documentCapabilityExcluded) reasons.push(DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE);
  return Object.freeze(reasons);
}

function emptyConfidenceEvidenceConsistency() {
  return Object.freeze({
    status: "not_applicable",
    confidence: null,
    evidenceType: null,
  });
}

function deriveConfidenceEvidenceConsistency(confidence, evidenceType) {
  const allowed = CONFIDENCE_EVIDENCE_COMPATIBILITY[confidence];
  if (!allowed) {
    return Object.freeze({
      status: "incompatible",
      confidence,
      evidenceType,
    });
  }

  return Object.freeze({
    status: allowed.includes(evidenceType) ? "compatible" : "incompatible",
    confidence,
    evidenceType,
  });
}

function answerWeight(answer, excludedFromPrimaryScoring, effects) {
  if (excludedFromPrimaryScoring) return 0;
  const respondentEvidenceMultiplier = arguments[3] ?? 1;
  const evidenceWeight = evidenceTypeAuthority(scoringEvidenceType(answer.evidenceType, effects));
  const knowledgeWeight = KNOWLEDGE_WEIGHTS[answer.knowledgeLevel] ?? KNOWLEDGE_WEIGHTS.pattern_based;
  return roundScore(
    evidenceWeight * knowledgeWeight * effects.numericMultiplier * respondentEvidenceMultiplier,
  );
}

function freezeRanked(scores) {
  return Object.freeze(
    Object.entries(scores)
      .map(([code, score]) => Object.freeze({ code, score: roundScore(score) }))
      .sort((left, right) => right.score - left.score || left.code.localeCompare(right.code)),
  );
}

function confidenceBand({ answeredCount, directCount, documentCount, flaggedCount, legacyCount, totalWeight }) {
  if (!answeredCount || totalWeight <= 0) return "cannot_determine";

  const evidenceSupportedShare = (directCount + documentCount) / answeredCount;
  const reliabilityFlagRate = flaggedCount / answeredCount;

  if (legacyCount === 0 && evidenceSupportedShare >= 0.6 && reliabilityFlagRate < 0.2) return "high";
  if (evidenceSupportedShare >= 0.35 && reliabilityFlagRate < 0.4) return "medium";
  return "low";
}

export function classifyNormalizedSignal({
  evidenceMass,
  primaryEnvironmentCode,
  effectiveCoverage,
  confidence,
  compositionGap,
  primarySupport,
}) {
  if (evidenceMass <= 0 || primaryEnvironmentCode == null) return "weak";
  if (!Number.isFinite(effectiveCoverage) || effectiveCoverage <= SCALE_INVARIANT_SIGNAL_THRESHOLDS.effectiveCoverage) return "weak";
  if (confidence === "low" || confidence === "cannot_determine") return "weak";
  if (!Number.isFinite(compositionGap) || compositionGap <= SCALE_INVARIANT_SIGNAL_THRESHOLDS.compositionGap) return "weak";
  if (confidence === "high" && primarySupport >= SCALE_INVARIANT_SIGNAL_THRESHOLDS.primarySupport) return "strong";
  return "confirmed";
}

export function normalizedCoPresence({ evidenceMass, primaryEnvironmentCode, compositionGap }) {
  return evidenceMass > 0
    && primaryEnvironmentCode != null
    && Number.isFinite(compositionGap)
    && compositionGap <= SCALE_INVARIANT_SIGNAL_THRESHOLDS.compositionGap;
}

function signalBadge(strength) {
  if (strength === "strong") return "*** strong signal pattern";
  if (strength === "confirmed") return "** confirmed signal pattern";
  return "* weak signal pattern";
}

const WORKFLOW_IDENTITY_ALIASES = Object.freeze(["primary", "verification"]);

function questionProvenance(question) {
  const questionId = question?.id;
  const workbookQuestionId = normalizeString(question?.workbookQuestionId) || normalizeString(questionId) || null;
  const canonicalQuestionId = normalizeString(question?.canonicalQuestionId) || null;
  const questionModuleId = normalizeString(question?.moduleId) || null;
  const sourceRow = question?.sourceRow;

  return Object.freeze({
    questionId,
    canonicalQuestionId: canonicalQuestionId || null,
    workbookQuestionId,
    questionModuleId: questionModuleId || null,
    sourceWorkbook: normalizeString(question?.sourceWorkbook) || null,
    sourceSheet: normalizeString(question?.sourceSheet) || null,
    sourceRow: sourceRow == null || sourceRow === "" ? null : sourceRow,
  });
}

function respondentProvenance(questionSet) {
  const rawId = normalizeString(questionSet?.respondentId);
  const aliasId = WORKFLOW_IDENTITY_ALIASES.includes(rawId);
  const physicalId = aliasId ? "" : rawId;
  const explicitSlot = questionSet?.respondentSlot;
  let respondentSlot = null;
  if (explicitSlot === null) {
    respondentSlot = null;
  } else if (explicitSlot !== undefined) {
    respondentSlot = normalizeString(explicitSlot) || null;
  } else if (aliasId) {
    respondentSlot = rawId;
  }

  const respondentId = physicalId || null;
  return Object.freeze({
    respondentId,
    respondentSlot,
    respondentIdentityStatus: respondentId ? "RESOLVED" : "UNRESOLVED",
  });
}

function missingQuestionIdKey(questionSet, questionId) {
  if (Object.hasOwn(questionSet ?? {}, "missingQuestionIdPrefix")) {
    const prefix = normalizeString(questionSet.missingQuestionIdPrefix);
    return prefix ? `${prefix}:${questionId}` : questionId;
  }

  const prefix = normalizeString(questionSet?.respondentId ?? questionSet?.id);
  return prefix ? `${prefix}:${questionId}` : questionId;
}

function responseSetEntries(questionSet, environmentCodes, respondentSide) {
  const questions = Array.isArray(questionSet.questions) ? questionSet.questions : [];
  const answers = questionSet.answers ?? {};
  const identity = respondentProvenance(questionSet);
  const respondentEvidenceMultiplier = Number.isFinite(questionSet.respondentEvidenceMultiplier)
    && questionSet.respondentEvidenceMultiplier > 0
    ? questionSet.respondentEvidenceMultiplier
    : 1;

  return questions.map((question) => {
    const provenance = questionProvenance(question);
    const answer = normalizeAnswer(answers[question.id]);
    if (!answer) {
      return Object.freeze({
        ...provenance,
        ...identity,
        selectedOption: null,
        missing: true,
        excludedFromPrimaryScoring: true,
        signalCodes: Object.freeze([]),
        weight: 0,
        reliabilityFlags: Object.freeze([]),
        effectiveEvidenceType: null,
        reliabilityEffects: emptyReliabilityEffects(),
        confidenceEvidenceConsistency: emptyConfidenceEvidenceConsistency(),
        primaryExclusionReasons: Object.freeze([]),
      });
    }

    const option = selectedOption(question, answer.selectedOption);
    const signalCodes = optionSignalCodes(option, environmentCodes);
    const optionExcluded = isExcludedOption(option, signalCodes);
    const noSuchEvent = isNoSuchEventOption(question, option);
    assertTargetOnlyFlagsLegal(answer.reliabilityFlags, respondentSide);
    const reliabilityEffects = deriveReliabilityEffects(answer.reliabilityFlags);
    const effectiveType = scoringEvidenceType(answer.evidenceType, reliabilityEffects);
    const evidenceTypeExcludedFromPrimary = isNonPrimaryEvidenceType(answer.evidenceType)
      || isNonPrimaryEvidenceType(effectiveType);
    const documentCapabilityExcluded = hasFreeInadmissibleDocumentCapability(answer);
    const excludedFromPrimaryScoring = optionExcluded
      || noSuchEvent
      || reliabilityEffects.excludeFromPrimaryScoring
      || evidenceTypeExcludedFromPrimary
      || documentCapabilityExcluded;
    const primaryExclusionReasons = derivePrimaryExclusionReasons({
      optionExcluded,
      noSuchEvent,
      flags: answer.reliabilityFlags,
      originalEvidenceType: answer.evidenceType,
      effectiveEvidenceType: effectiveType,
      documentCapabilityExcluded,
    });
    const weight = answerWeight(
      answer,
      excludedFromPrimaryScoring,
      reliabilityEffects,
      respondentEvidenceMultiplier,
    );
    const confidenceEvidenceConsistency = deriveConfidenceEvidenceConsistency(
      answer.confidence,
      answer.evidenceType,
    );

    return Object.freeze({
      ...provenance,
      ...identity,
      selectedOption: answer.selectedOption,
      evidenceType: answer.evidenceType,
      effectiveEvidenceType: effectiveType,
      knowledgeLevel: answer.knowledgeLevel,
      confidence: answer.confidence,
      confidenceEvidenceConsistency,
      directObservationGate: answer.directObservationGate,
      reliabilityFlags: answer.reliabilityFlags,
      reliabilityEffects,
      classificationSource: answer.source,
      missing: false,
      excludedFromPrimaryScoring,
      primaryExclusionReasons,
      signalCodes,
      weight,
    });
  });
}

export function scoreLayeredEvidenceQuestionSets(questionSets = [], options = {}) {
  const environmentCodes = Object.freeze(options.environmentCodes ?? DEFAULT_ENVIRONMENT_CODES);
  const respondentSide = inferredRespondentSide(options);
  const opportunityMass = opportunityMassForQuestionSets(questionSets, environmentCodes);
  const rawScores = emptyScoreMap(environmentCodes);
  const weightedScores = emptyScoreMap(environmentCodes);
  const missingQuestionIds = [];
  const questionResponses = [];

  for (const questionSet of questionSets) {
    const setEntries = responseSetEntries(questionSet, environmentCodes, respondentSide);
    for (const entry of setEntries) {
      questionResponses.push(entry);
      if (entry.missing) {
        missingQuestionIds.push(missingQuestionIdKey(questionSet, entry.questionId));
        continue;
      }

      for (const code of entry.signalCodes) {
        rawScores[code] = (rawScores[code] ?? 0) + 1;
        weightedScores[code] = (weightedScores[code] ?? 0) + (entry.weight / Math.max(1, entry.signalCodes.length));
      }
    }
  }

  for (const code of environmentCodes) {
    rawScores[code] = roundScore(rawScores[code]);
    weightedScores[code] = roundScore(weightedScores[code]);
  }

  const answeredResponses = questionResponses.filter((entry) => !entry.missing);
  const weightedResponses = answeredResponses.filter((entry) => entry.weight > 0);
  const evidenceSupportResponses = answeredResponses.filter((entry) => (
    !Array.isArray(entry.primaryExclusionReasons)
    || !entry.primaryExclusionReasons.includes(DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE)
  ));
  const directCount = evidenceSupportResponses.filter((entry) => entry.evidenceType === "direct_observation").length;
  const documentCount = evidenceSupportResponses.filter((entry) => entry.evidenceType === "document_supported").length;
  const flaggedCount = answeredResponses.filter((entry) => entry.reliabilityFlags?.length > 0).length;
  const legacyCount = answeredResponses.filter((entry) => entry.classificationSource === "legacy_option_only").length;
  const excludedAnswerCount = answeredResponses.filter((entry) => entry.excludedFromPrimaryScoring).length;
  const totalWeight = roundScore(weightedResponses.reduce((sum, entry) => sum + entry.weight, 0));
  const baseConfidence = confidenceBand({
    answeredCount: answeredResponses.length,
    directCount,
    documentCount,
    flaggedCount,
    legacyCount,
    totalWeight,
  });
  const confidence = baseConfidence;
  const rankedEnvironments = freezeRanked(weightedScores);
  const rawRankedEnvironments = freezeRanked(rawScores);
  const primary = rankedEnvironments[0] ?? { code: null, score: 0 };
  const secondary = rankedEnvironments[1] ?? { code: null, score: 0 };
  const primaryEnvironmentCode = primary.score > 0 ? primary.code : null;
  const signalCompositionShare = Object.freeze(Object.fromEntries(
    environmentCodes.map((code) => [code, totalWeight > 0 ? roundScore(weightedScores[code] / totalWeight) : null]),
  ));
  const supportStrengthByEnvironment = Object.freeze(Object.fromEntries(
    environmentCodes.map((code) => [code, opportunityMass > 0 ? roundScore(weightedScores[code] / opportunityMass) : null]),
  ));
  const evidenceYield = opportunityMass > 0 ? roundScore(totalWeight / opportunityMass) : null;
  const effectiveCoverage = opportunityMass > 0 ? roundScore(weightedResponses.length / opportunityMass) : null;
  const excludedRate = opportunityMass > 0 ? roundScore(excludedAnswerCount / opportunityMass) : null;
  const compositionGap = totalWeight > 0
    ? roundScore(signalCompositionShare[primary.code] - signalCompositionShare[secondary.code])
    : null;
  const primarySupport = primaryEnvironmentCode != null
    ? supportStrengthByEnvironment[primaryEnvironmentCode]
    : 0;
  const strength = classifyNormalizedSignal({
    evidenceMass: totalWeight,
    primaryEnvironmentCode,
    effectiveCoverage,
    confidence,
    compositionGap,
    primarySupport,
  });
  const coPresence = normalizedCoPresence({
    evidenceMass: totalWeight,
    primaryEnvironmentCode,
    compositionGap,
  });

  return Object.freeze({
    scoringModelVersion: LAYERED_EVIDENCE_SCORING_VERSION,
    scoringMethod: "Layered evidence-weighted signal pattern. Raw answers are treated as respondent evidence, not factual truth.",
    outputKind: "weighted_signal_pattern",
    finalEnvironmentLabel: null,
    requiresAnalystReview: true,
    legacyAdditiveScoring: false,
    moduleId: options.moduleId ?? null,
    valid: missingQuestionIds.length === 0,
    missingQuestionIds: Object.freeze(missingQuestionIds),
    answeredQuestionCount: answeredResponses.length,
    questionCount: questionResponses.length,
    opportunityMass,
    effectiveAnswerCount: weightedResponses.length,
    excludedAnswerCount,
    excludedRate,
    totalEvidenceWeight: totalWeight,
    environmentScores: Object.freeze(rawScores),
    weightedEnvironmentScores: Object.freeze(weightedScores),
    signalCompositionShare,
    supportStrengthByEnvironment,
    evidenceYield,
    effectiveCoverage,
    compositionGap,
    primarySupport,
    rankedEnvironments,
    rawRankedEnvironments,
    primaryEnvironmentCode,
    primarySignalEnvironmentCode: primaryEnvironmentCode,
    primarySignalScore: roundScore(primary.score ?? 0),
    secondaryEnvironmentCode: secondary.score > 0 ? secondary.code : null,
    secondarySignalEnvironmentCode: secondary.score > 0 ? secondary.code : null,
    secondarySignalScore: roundScore(secondary.score ?? 0),
    coPresence,
    signalStrength: strength,
    signalBadge: signalBadge(strength),
    confidence,
    evidenceQuality: Object.freeze({
      confidence,
      baseConfidence,
      directObservationCount: directCount,
      documentSupportedCount: documentCount,
      evidenceSupportedShare: answeredResponses.length ? roundScore((directCount + documentCount) / answeredResponses.length) : 0,
      reliabilityFlagCount: flaggedCount,
      reliabilityFlagRate: answeredResponses.length ? roundScore(flaggedCount / answeredResponses.length) : 0,
      legacyOptionOnlyCount: legacyCount,
      confidenceCapReason: legacyCount > 0
        ? "Legacy option-only answers do not include evidence classification; confidence is capped low until the respondent questionnaire captures evidence fields."
        : "Confidence reflects evidence type, knowledge level, reliability flags, and direct/document-supported answer share.",
    }),
    questionResponses: Object.freeze(questionResponses),
  });
}

export function scoreLayeredEvidenceQuestionSet(questions = [], answers = {}, options = {}) {
  return scoreLayeredEvidenceQuestionSets(
    [
      {
        id: options.respondentId ?? "respondent-1",
        respondentId: options.respondentId ?? "",
        respondentSlot: options.respondentSlot ?? null,
        missingQuestionIdPrefix: "",
        questions,
        answers,
        respondentEvidenceMultiplier: options.respondentEvidenceMultiplier,
      },
    ],
    options,
  );
}
