export const LAYERED_EVIDENCE_SCORING_VERSION = "newlogic-layered-evidence-v1";

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

function deriveReliabilityEffects(flags) {
  for (const flag of flags) {
    if (!isKnownReliabilityFlag(flag)) {
      throw unrecognizedReliabilityFlagError(flag);
    }
  }

  let numericMultiplier = 1;
  for (const flag of flags) {
    if (Object.hasOwn(NUMERIC_RELIABILITY_MULTIPLIERS, flag)) {
      numericMultiplier *= NUMERIC_RELIABILITY_MULTIPLIERS[flag];
    }
  }

  return Object.freeze({
    evidenceTypeCap: flags.includes("speaks_for_group_without_access") ? INFERENCE_EVIDENCE_TYPE : null,
    excludeFromPrimaryScoring: flags.includes("no_direct_knowledge")
      || flags.includes("hypothetical")
      || flags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG),
    treatAsUnknown: flags.includes("evasive"),
    analystReviewOnly: flags.includes("structurally_unlikely"),
    numericMultiplier,
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
  const evidenceWeight = evidenceTypeAuthority(scoringEvidenceType(answer.evidenceType, effects));
  const knowledgeWeight = KNOWLEDGE_WEIGHTS[answer.knowledgeLevel] ?? KNOWLEDGE_WEIGHTS.pattern_based;
  return roundScore(evidenceWeight * knowledgeWeight * effects.numericMultiplier);
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

function signalStrength({ confidence, primaryScore, gapToSecond, totalWeight }) {
  if (totalWeight <= 0 || confidence === "cannot_determine") return "weak";
  if (confidence === "low") return "weak";
  if (gapToSecond <= 1.5) return "weak";
  if (confidence === "high" && primaryScore >= 4) return "strong";
  return "confirmed";
}

function signalBadge(strength) {
  if (strength === "strong") return "*** strong signal pattern";
  if (strength === "confirmed") return "** confirmed signal pattern";
  return "* weak signal pattern";
}

function responseSetEntries(questionSet, environmentCodes, respondentSide) {
  const questions = Array.isArray(questionSet.questions) ? questionSet.questions : [];
  const answers = questionSet.answers ?? {};
  const setId = normalizeString(questionSet.respondentId ?? questionSet.id);

  return questions.map((question) => {
    const answer = normalizeAnswer(answers[question.id]);
    if (!answer) {
      return Object.freeze({
        questionId: question.id,
        respondentId: setId || null,
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
    const excludedFromPrimaryScoring = optionExcluded
      || noSuchEvent
      || reliabilityEffects.excludeFromPrimaryScoring
      || evidenceTypeExcludedFromPrimary;
    const primaryExclusionReasons = derivePrimaryExclusionReasons({
      optionExcluded,
      noSuchEvent,
      flags: answer.reliabilityFlags,
      originalEvidenceType: answer.evidenceType,
      effectiveEvidenceType: effectiveType,
    });
    const weight = answerWeight(answer, excludedFromPrimaryScoring, reliabilityEffects);
    const confidenceEvidenceConsistency = deriveConfidenceEvidenceConsistency(
      answer.confidence,
      answer.evidenceType,
    );

    return Object.freeze({
      questionId: question.id,
      respondentId: setId || null,
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
  const rawScores = emptyScoreMap(environmentCodes);
  const weightedScores = emptyScoreMap(environmentCodes);
  const missingQuestionIds = [];
  const questionResponses = [];

  for (const questionSet of questionSets) {
    const setEntries = responseSetEntries(questionSet, environmentCodes, respondentSide);
    for (const entry of setEntries) {
      questionResponses.push(entry);
      if (entry.missing) {
        missingQuestionIds.push(entry.respondentId ? `${entry.respondentId}:${entry.questionId}` : entry.questionId);
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
  const directCount = answeredResponses.filter((entry) => entry.evidenceType === "direct_observation").length;
  const documentCount = answeredResponses.filter((entry) => entry.evidenceType === "document_supported").length;
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
  const gapToSecond = roundScore((primary.score ?? 0) - (secondary.score ?? 0));
  const strength = signalStrength({
    confidence,
    primaryScore: primary.score ?? 0,
    gapToSecond,
    totalWeight,
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
    effectiveAnswerCount: weightedResponses.length,
    excludedAnswerCount,
    totalEvidenceWeight: totalWeight,
    environmentScores: Object.freeze(rawScores),
    weightedEnvironmentScores: Object.freeze(weightedScores),
    rankedEnvironments,
    rawRankedEnvironments,
    primaryEnvironmentCode: primary.score > 0 ? primary.code : null,
    primarySignalEnvironmentCode: primary.score > 0 ? primary.code : null,
    primarySignalScore: roundScore(primary.score ?? 0),
    secondaryEnvironmentCode: secondary.score > 0 ? secondary.code : null,
    secondarySignalEnvironmentCode: secondary.score > 0 ? secondary.code : null,
    secondarySignalScore: roundScore(secondary.score ?? 0),
    coPresence: gapToSecond <= 1.5,
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
        questions,
        answers,
      },
    ],
    options,
  );
}

