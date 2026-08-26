import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import {
  scoreAcquirerModule,
  scoreCombinedAcquirerModule,
} from "../src/flow/acquirerTrackFlow.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  FINAL_ENVIRONMENT_CODES,
  combineTargetCanonicalScore,
  mergeTwoScores,
  rehydrateTargetScoresForNormalizedMerge,
} from "../src/flow/finalDeliverableFlow.js";
import {
  DEFAULT_ENVIRONMENT_CODES,
  LAYERED_EVIDENCE_SCORING_VERSION,
  classifyNormalizedSignal,
  normalizedCoPresence,
  scoreLayeredEvidenceQuestionSet,
  scoreLayeredEvidenceQuestionSets,
} from "../src/flow/layeredEvidenceScoring.js";
import {
  scoreTargetDiagnosticCombined,
  scoreTargetDiagnosticLevel1,
  scoreTargetDiagnosticQuestions,
} from "../src/flow/targetDiagnosticFlow.js";
import { scoreTargetObservation } from "../src/flow/targetObservationFlow.js";
import { scoreTargetSelfAssessment } from "../src/flow/targetSelfAssessmentFlow.js";
import { buildTriageReport } from "../src/flow/triageEngine.js";

const PRIMARY_CODE = "NT/STJ";
const SECONDARY_CODE = "NF/NT";
const TERTIARY_CODE = "NT/STP";
const NORMALIZED_FIELDS = Object.freeze([
  "signalCompositionShare",
  "supportStrengthByEnvironment",
  "evidenceYield",
  "effectiveCoverage",
  "compositionGap",
  "primarySupport",
  "primaryEnvironmentCode",
  "secondaryEnvironmentCode",
  "signalStrength",
  "coPresence",
]);
const checks = [];
const evidence = {};

function round3(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function approx(actual, expected, tolerance = 0.002, message = "values differ") {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} vs ${expected}`);
}

function check(id, label, run) {
  run();
  checks.push(Object.freeze({ id, label }));
  console.log(`PASS ${id} ${label}`);
}

function optionSignals(option) {
  return [...new Set([
    ...(Array.isArray(option?.signals) ? option.signals : []),
    ...(Array.isArray(option?.internalEnvironmentSignals) ? option.internalEnvironmentSignals : []),
    ...(Array.isArray(option?.environmentSignals) ? option.environmentSignals : []),
    typeof option?.environment === "string" && option.environment !== "N/A" ? option.environment : "",
  ].filter((code) => DEFAULT_ENVIRONMENT_CODES.includes(code)))];
}

function scorableOption(question, preferredCode = null) {
  const candidates = (question?.options ?? []).filter((option) => {
    const text = String(option?.text ?? option?.label ?? "").toLowerCase();
    return option.excludedFromPrimaryScoring !== true
      && optionSignals(option).length > 0
      && !text.includes("cannot answer")
      && !text.includes("no direct observation")
      && !text.includes("unknown");
  });
  return candidates.find((option) => optionSignals(option).includes(preferredCode)) ?? candidates[0] ?? null;
}

function excludedOption(question) {
  return (question?.options ?? []).find((option) => !scorableOption({ options: [option] }))
    ?? question?.options?.at(-1)
    ?? null;
}

function completeAnswers(questions, options = {}) {
  return Object.fromEntries(questions.map((question) => {
    const option = scorableOption(question, options.preferredCode) ?? excludedOption(question);
    assert.ok(option, `fixture question ${question.id} has no option`);
    return [question.id, evidenceClassifiedAnswer(option.value, options.answerOverrides ?? {})];
  }));
}

function syntheticQuestion(id, signals = [PRIMARY_CODE]) {
  return Object.freeze({
    id,
    options: Object.freeze([
      Object.freeze({ value: "A", text: "Observed operating pattern", signals: Object.freeze(signals) }),
      Object.freeze({ value: "X", text: "Unknown", excludedFromPrimaryScoring: true }),
    ]),
  });
}

function syntheticQuestions(count, signals = [PRIMARY_CODE]) {
  return Object.freeze(Array.from({ length: count }, (_, index) => syntheticQuestion(`q${index + 1}`, signals)));
}

function answersForSynthetic(questions, overrides = {}) {
  return Object.fromEntries(questions.map((question) => [question.id, evidenceClassifiedAnswer("A", overrides)]));
}

function normalizedProjection(score) {
  return Object.fromEntries(NORMALIZED_FIELDS.map((field) => [field, score[field]]));
}

function assertFiniteNormalized(value, path = "normalized") {
  if (typeof value === "number") {
    assert.equal(Number.isFinite(value), true, `${path} must be finite`);
    assert.equal(Object.is(value, -0), false, `${path} must not be -0`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertFiniteNormalized(entry, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => assertFiniteNormalized(entry, `${path}.${key}`));
  }
}

function scoreSummary(score) {
  return Object.freeze({
    opportunityMass: score.opportunityMass,
    evidenceYield: score.evidenceYield,
    effectiveCoverage: score.effectiveCoverage,
    compositionGap: score.compositionGap,
    primarySupport: score.primarySupport,
    signalStrength: score.signalStrength,
    coPresence: score.coPresence,
  });
}

function sourceIngredients(confidence, overrides = {}) {
  const defaults = {
    high: { supportedShare: 1, flagRate: 0, legacyCount: 0 },
    medium: { supportedShare: 0.5, flagRate: 0.2, legacyCount: 0 },
    low: { supportedShare: 0.1, flagRate: 0.5, legacyCount: 0 },
    cannot_determine: { supportedShare: 0, flagRate: 0, legacyCount: 0 },
  };
  return { ...defaults[confidence], ...overrides };
}

function syntheticNormalizedSource({
  shares = { [PRIMARY_CODE]: 1 },
  evidenceYield = 1,
  effectiveCoverage = 1,
  confidence = "high",
  ingredients = {},
  questionCount = 10,
  absoluteScale = questionCount,
} = {}) {
  const shareMap = Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [
    code,
    evidenceYield > 0 ? round3(shares[code] ?? 0) : null,
  ])));
  const supportMap = Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [
    code,
    round3((shares[code] ?? 0) * evidenceYield),
  ])));
  const weightedMap = Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [
    code,
    round3((shares[code] ?? 0) * evidenceYield * absoluteScale),
  ])));
  const environmentMap = Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [
    code,
    round3((shares[code] ?? 0) * absoluteScale),
  ])));
  const ranked = Object.freeze(Object.entries(supportMap)
    .map(([code, score]) => Object.freeze({ code, score }))
    .sort((left, right) => right.score - left.score || left.code.localeCompare(right.code)));
  const positive = ranked.filter((entry) => entry.score > 0);
  const primaryEnvironmentCode = positive[0]?.code ?? null;
  const secondaryEnvironmentCode = positive[1]?.code ?? null;
  const secondaryRankCode = ranked[1]?.code ?? null;
  const compositionGap = evidenceYield > 0 && primaryEnvironmentCode
    ? round3(shareMap[primaryEnvironmentCode] - (secondaryRankCode ? shareMap[secondaryRankCode] : 0))
    : null;
  const primarySupport = primaryEnvironmentCode ? supportMap[primaryEnvironmentCode] : 0;
  const quality = sourceIngredients(confidence, ingredients);
  const signalStrength = classifyNormalizedSignal({
    evidenceMass: evidenceYield,
    primaryEnvironmentCode,
    effectiveCoverage,
    confidence,
    compositionGap,
    primarySupport,
  });
  const absoluteRanked = Object.freeze(Object.entries(weightedMap)
    .map(([code, score]) => Object.freeze({ code, score }))
    .sort((left, right) => right.score - left.score || left.code.localeCompare(right.code)));
  return Object.freeze({
    valid: true,
    scoringModelVersion: LAYERED_EVIDENCE_SCORING_VERSION,
    scoringMethod: "validator_normalized_source",
    environmentScores: environmentMap,
    weightedEnvironmentScores: weightedMap,
    rankedEnvironments: absoluteRanked,
    rawRankedEnvironments: absoluteRanked,
    primaryEnvironmentCode,
    primarySignalEnvironmentCode: primaryEnvironmentCode,
    primarySignalScore: absoluteRanked[0]?.score ?? 0,
    secondaryEnvironmentCode,
    secondarySignalEnvironmentCode: secondaryEnvironmentCode,
    secondarySignalScore: absoluteRanked[1]?.score ?? 0,
    totalEvidenceWeight: round3(evidenceYield * absoluteScale),
    questionCount,
    answeredQuestionCount: Math.round(effectiveCoverage * questionCount),
    effectiveAnswerCount: Math.round(effectiveCoverage * questionCount),
    excludedAnswerCount: 0,
    signalCompositionShare: shareMap,
    supportStrengthByEnvironment: supportMap,
    evidenceYield,
    effectiveCoverage,
    compositionGap,
    primarySupport,
    coPresence: normalizedCoPresence({ evidenceMass: evidenceYield, primaryEnvironmentCode, compositionGap }),
    signalStrength,
    confidence,
    evidenceQuality: Object.freeze({
      confidence,
      baseConfidence: confidence,
      evidenceSupportedShare: quality.supportedShare,
      reliabilityFlagRate: quality.flagRate,
      legacyOptionOnlyCount: quality.legacyCount,
    }),
    questionResponses: Object.freeze([]),
  });
}

function withoutV2NormalizedFields(score, overrides = {}) {
  const legacy = { ...score, ...overrides, scoringModelVersion: "newlogic-layered-evidence-v1" };
  for (const field of [
    "opportunityMass",
    "excludedRate",
    "signalCompositionShare",
    "supportStrengthByEnvironment",
    "evidenceYield",
    "effectiveCoverage",
    "compositionGap",
    "primarySupport",
  ]) {
    delete legacy[field];
  }
  return Object.freeze(legacy);
}

function questionnaireHash(questions) {
  return createHash("sha256").update(JSON.stringify(questions)).digest("hex");
}

const aemQuestions = ACQUIRER_TRACK_DATA.acquirerModule.questions;
const tsamQuestions = TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions;
const el1Questions = TARGET_DIAGNOSTIC_DATA.level1.questions;
const el2Questions = TARGET_DIAGNOSTIC_DATA.level2.questions;
const observedQuestions = TARGET_OBSERVATION_DIAGNOSTIC.questions;
const aemAnswers = completeAnswers(aemQuestions, { preferredCode: PRIMARY_CODE });
const tsamAnswers = completeAnswers(tsamQuestions, { preferredCode: PRIMARY_CODE });
const el1Answers = completeAnswers(el1Questions, { preferredCode: PRIMARY_CODE });
const el2Answers = completeAnswers(el2Questions, { preferredCode: PRIMARY_CODE });
const observedAnswers = completeAnswers(observedQuestions, { preferredCode: PRIMARY_CODE });
const aemScore = scoreAcquirerModule(aemAnswers);
const aemCombinedScore = scoreCombinedAcquirerModule(aemAnswers, aemAnswers);
const el1Score = scoreTargetDiagnosticQuestions(el1Questions, el1Answers);
const el2Score = scoreTargetDiagnosticQuestions(el2Questions, el2Answers);
const diagnosticCombinedScore = scoreTargetDiagnosticCombined(el1Answers, el2Answers);
const observedScore = scoreTargetObservation(observedAnswers);
const tsamScore = scoreTargetSelfAssessment(tsamAnswers);

evidence.baseScores = Object.freeze({
  AEM: scoreSummary(aemScore),
  AEMCombined: scoreSummary(aemCombinedScore),
  EL1: scoreSummary(el1Score),
  EL2: scoreSummary(el2Score),
  TargetObserved: scoreSummary(observedScore),
});

check("V-1", "weighted mass identity", () => {
  for (const score of [aemScore, aemCombinedScore, el1Score, el2Score]) {
    approx(Object.values(score.weightedEnvironmentScores).reduce((sum, value) => sum + value, 0), score.totalEvidenceWeight, 0.002);
  }
});

check("V-2", "composition mass and zero map", () => {
  for (const score of [aemScore, aemCombinedScore, el1Score, observedScore]) {
    approx(Object.values(score.signalCompositionShare).reduce((sum, value) => sum + value, 0), 1, 0.003);
  }
  const zero = scoreLayeredEvidenceQuestionSet(syntheticQuestions(3), {});
  assert.equal(Object.values(zero.signalCompositionShare).every((value) => value === null), true);
});

check("V-3", "replication invariance", () => {
  assert.deepEqual(normalizedProjection(aemCombinedScore), normalizedProjection(aemScore));
});

check("V-4", "uniform scaling", () => {
  const questions = syntheticQuestions(6);
  const answers = answersForSynthetic(questions);
  const full = scoreLayeredEvidenceQuestionSet(questions, answers, { respondentEvidenceMultiplier: 1 });
  const half = scoreLayeredEvidenceQuestionSet(questions, answers, { respondentEvidenceMultiplier: 0.5 });
  assert.deepEqual(half.signalCompositionShare, full.signalCompositionShare);
  for (const code of DEFAULT_ENVIRONMENT_CODES) approx(half.supportStrengthByEnvironment[code], full.supportStrengthByEnvironment[code] * 0.5);
  approx(half.evidenceYield, full.evidenceYield * 0.5);
});

check("V-5", "C3-D weighting remains directional and single-application", () => {
  const questions = syntheticQuestions(11);
  const longAnswers = answersForSynthetic(questions);
  const opposedQuestions = Object.freeze(questions.map((question) => Object.freeze({
    ...question,
    options: Object.freeze([
      Object.freeze({ value: "A", text: "Primary", signals: Object.freeze([PRIMARY_CODE]) }),
      Object.freeze({ value: "B", text: "Secondary", signals: Object.freeze([SECONDARY_CODE]) }),
    ]),
  })));
  const shortAnswers = answersForSynthetic(questions);
  const long = scoreLayeredEvidenceQuestionSet(questions, longAnswers, { respondentEvidenceMultiplier: 1 });
  const short = scoreLayeredEvidenceQuestionSet(questions, shortAnswers, { respondentEvidenceMultiplier: 0.5 });
  const mixed = scoreLayeredEvidenceQuestionSets([
    { questions, answers: longAnswers, respondentEvidenceMultiplier: 1 },
    { questions, answers: shortAnswers, respondentEvidenceMultiplier: 0.5 },
  ]);
  const opposed = scoreLayeredEvidenceQuestionSets([
    { questions: opposedQuestions, answers: Object.fromEntries(opposedQuestions.map((question) => [question.id, evidenceClassifiedAnswer("A")])), respondentEvidenceMultiplier: 1 },
    { questions: opposedQuestions, answers: Object.fromEntries(opposedQuestions.map((question) => [question.id, evidenceClassifiedAnswer("B")])), respondentEvidenceMultiplier: 0.5 },
  ]);
  approx(short.evidenceYield / long.evidenceYield, 0.5);
  approx(short.primarySupport / long.primarySupport, 0.5);
  approx(mixed.evidenceYield, 0.75);
  approx(opposed.signalCompositionShare[PRIMARY_CODE], 0.667);
  approx(opposed.signalCompositionShare[SECONDARY_CODE], 0.333);
  evidence.c3d = { long: scoreSummary(long), short: scoreSummary(short), mixed: scoreSummary(mixed), opposed: scoreSummary(opposed), opposedShares: opposed.signalCompositionShare };
});

const frozenQuestions = Object.freeze([
  syntheticQuestion("f1", [PRIMARY_CODE]),
  syntheticQuestion("f2", [TERTIARY_CODE, SECONDARY_CODE]),
]);
const frozenScore = scoreLayeredEvidenceQuestionSet(
  frozenQuestions,
  answersForSynthetic(frozenQuestions),
  { moduleId: "frozen", respondentId: "frozen-r" },
);
const frozenExpected = Object.freeze({
  environmentScores: { "NT/STJ": 1, "NT/STP": 1, "NF/NT": 1, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 0, "STJ/STP": 0, "STP/STJ": 0, "SFP/SFJ": 0 },
  weightedEnvironmentScores: { "NT/STJ": 1, "NT/STP": 0.5, "NF/NT": 0.5, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 0, "STJ/STP": 0, "STP/STJ": 0, "SFP/SFJ": 0 },
  primarySignalScore: 1,
  secondarySignalScore: 0.5,
  totalEvidenceWeight: 2,
  answeredQuestionCount: 2,
  questionCount: 2,
  effectiveAnswerCount: 2,
  excludedAnswerCount: 0,
  rankedEnvironments: [{ code: "NT/STJ", score: 1 }, { code: "NF/NT", score: 0.5 }, { code: "NT/STP", score: 0.5 }, { code: "NF/SFJ", score: 0 }, { code: "NF/SFP", score: 0 }, { code: "SFJ/SFP", score: 0 }, { code: "SFP/SFJ", score: 0 }, { code: "STJ/STP", score: 0 }, { code: "STP/STJ", score: 0 }],
  rawRankedEnvironments: [{ code: "NF/NT", score: 1 }, { code: "NT/STJ", score: 1 }, { code: "NT/STP", score: 1 }, { code: "NF/SFJ", score: 0 }, { code: "NF/SFP", score: 0 }, { code: "SFJ/SFP", score: 0 }, { code: "SFP/SFJ", score: 0 }, { code: "STJ/STP", score: 0 }, { code: "STP/STJ", score: 0 }],
  confidence: "high",
  evidenceQuality: { confidence: "high", baseConfidence: "high", directObservationCount: 2, documentSupportedCount: 0, evidenceSupportedShare: 1, reliabilityFlagCount: 0, reliabilityFlagRate: 0, legacyOptionOnlyCount: 0, confidenceCapReason: "Confidence reflects evidence type, knowledge level, reliability flags, and direct/document-supported answer share." },
  provenance: [{ respondentId: "frozen-r", respondentSlot: null, respondentIdentityStatus: "RESOLVED" }, { respondentId: "frozen-r", respondentSlot: null, respondentIdentityStatus: "RESOLVED" }],
});

function frozenProjection(score) {
  return {
    environmentScores: score.environmentScores,
    weightedEnvironmentScores: score.weightedEnvironmentScores,
    primarySignalScore: score.primarySignalScore,
    secondarySignalScore: score.secondarySignalScore,
    totalEvidenceWeight: score.totalEvidenceWeight,
    answeredQuestionCount: score.answeredQuestionCount,
    questionCount: score.questionCount,
    effectiveAnswerCount: score.effectiveAnswerCount,
    excludedAnswerCount: score.excludedAnswerCount,
    rankedEnvironments: score.rankedEnvironments,
    rawRankedEnvironments: score.rawRankedEnvironments,
    confidence: score.confidence,
    evidenceQuality: score.evidenceQuality,
    provenance: score.questionResponses.map(({ respondentId, respondentSlot, respondentIdentityStatus }) => ({ respondentId, respondentSlot, respondentIdentityStatus })),
  };
}

check("V-6", "base ranking preservation", () => {
  assert.deepEqual(frozenScore.rankedEnvironments, frozenExpected.rankedEnvironments);
  assert.deepEqual(frozenScore.rawRankedEnvironments, frozenExpected.rawRankedEnvironments);
});

const zeroScore = scoreLayeredEvidenceQuestionSet(syntheticQuestions(10), {});
check("V-7", "zero safety", () => {
  assert.equal(zeroScore.signalStrength, "weak");
  assert.equal(zeroScore.coPresence, false);
  assert.equal(zeroScore.compositionGap, null);
  assertFiniteNormalized(normalizedProjection(zeroScore));
});

check("V-8", "multi-signal mass conservation", () => {
  for (const [signalCount, multiplier] of [[1, 0.5], [2, 0.4], [3, 0.3]]) {
    const questions = [syntheticQuestion(`mass-${signalCount}`, DEFAULT_ENVIRONMENT_CODES.slice(0, signalCount))];
    const score = scoreLayeredEvidenceQuestionSet(questions, answersForSynthetic(questions), { respondentEvidenceMultiplier: multiplier });
    assert.equal(Object.values(score.weightedEnvironmentScores).reduce((sum, value) => round3(sum + value), 0), multiplier);
    assert.equal(score.totalEvidenceWeight, multiplier);
  }
});

check("V-9", "module-length fairness", () => {
  const states = [10, 11, 12, 19, 22].map((count) => {
    const questions = syntheticQuestions(count);
    return scoreLayeredEvidenceQuestionSet(questions, answersForSynthetic(questions));
  });
  assert.deepEqual(states.map((score) => score.signalStrength), Array(5).fill("strong"));
  assert.deepEqual(states.map((score) => score.coPresence), Array(5).fill(false));
});

check("V-10", "absolute-field preservation", () => {
  assert.deepEqual(frozenProjection(frozenScore), frozenExpected);
});

check("V-11", "questionnaire-derived opportunity mass", () => {
  assert.deepEqual([
    aemScore.opportunityMass,
    aemCombinedScore.opportunityMass,
    tsamScore.opportunityMass,
    el1Score.opportunityMass,
    el2Score.opportunityMass,
    diagnosticCombinedScore.opportunityMass,
    observedScore.opportunityMass,
  ], [11, 22, 11, 12, 10, 22, 19]);
  const reversedAnswers = Object.fromEntries(Object.entries(aemAnswers).reverse());
  assert.equal(scoreAcquirerModule(reversedAnswers).opportunityMass, 11);
});

const documentQuestions = syntheticQuestions(6);
const documentAnswers = answersForSynthetic(documentQuestions, {
  directObservationGate: "yes",
  evidenceType: "document_supported",
  knowledgeLevel: "document_based",
  confidence: "high",
});
const documentScore = scoreLayeredEvidenceQuestionSet(documentQuestions, documentAnswers);
check("V-12", "FREE document exclusion", () => {
  assert.equal(documentScore.primarySupport, 0);
  assert.equal(documentScore.evidenceYield, 0);
  assert.equal(documentScore.effectiveCoverage, 0);
  assert.equal(documentScore.signalStrength, "weak");
  assert.equal(documentScore.coPresence, false);
  assertFiniteNormalized(normalizedProjection(documentScore));
});

check("V-13", "questionnaire content and order lock", () => {
  assert.deepEqual([aemQuestions.length, tsamQuestions.length, el1Questions.length, el2Questions.length, observedQuestions.length], [11, 11, 12, 10, 23]);
  assert.equal(aemQuestions.length + tsamQuestions.length + el1Questions.length + el2Questions.length + observedQuestions.length, 67);
  assert.deepEqual({
    AEM: questionnaireHash(aemQuestions),
    TSAM: questionnaireHash(tsamQuestions),
    EL1: questionnaireHash(el1Questions),
    EL2: questionnaireHash(el2Questions),
    OBS: questionnaireHash(observedQuestions),
  }, {
    AEM: "7489acf6f241ac5005cd64462b86d08fc1bc9bb435fbc101197518553d4265fb",
    TSAM: "ae874270afc0fb816fc109b17335dba454d2f764b3414460a53b753e076bafe9",
    EL1: "0e73ef7b7fa39fd1aada51c95ec9ac1e58fd839bc4d46179f09f14c179aac529",
    EL2: "4f110848c31e0b5c1c8d8340e8ca00aff09026111a49c30cc6b66ce5719d8621",
    OBS: "c572b702ab58a957be3df5faa8e4defe79020ed60594ba4896a0b3a5645a8008",
  });
});

check("V-14", "normalized identity", () => {
  for (const score of [aemScore, aemCombinedScore, el1Score, el2Score, observedScore]) {
    approx(score.primarySupport, round3(score.signalCompositionShare[score.primaryEnvironmentCode] * score.evidenceYield), 0.002);
  }
});

check("V-15", "threshold boundaries", () => {
  const classify = (compositionGap, primarySupport, effectiveCoverage) => classifyNormalizedSignal({
    evidenceMass: 1,
    primaryEnvironmentCode: PRIMARY_CODE,
    effectiveCoverage,
    confidence: "high",
    compositionGap,
    primarySupport,
  });
  assert.deepEqual([0.110, 0.111, 0.112].map((gap) => classify(gap, 0.291, 0.351)), ["weak", "weak", "strong"]);
  assert.deepEqual([0.289, 0.290, 0.291].map((support) => classify(0.112, support, 0.351)), ["confirmed", "strong", "strong"]);
  assert.deepEqual([0.349, 0.350, 0.351].map((coverage) => classify(0.112, 0.290, coverage)), ["weak", "weak", "strong"]);
  evidence.thresholds = {
    compositionGap: { "0.110": classify(0.110, 0.291, 0.351), "0.111": classify(0.111, 0.291, 0.351), "0.112": classify(0.112, 0.291, 0.351) },
    primarySupport: { "0.289": classify(0.112, 0.289, 0.351), "0.290": classify(0.112, 0.290, 0.351), "0.291": classify(0.112, 0.291, 0.351) },
    coverage: { "0.349": classify(0.112, 0.290, 0.349), "0.350": classify(0.112, 0.290, 0.350), "0.351": classify(0.112, 0.290, 0.351) },
  };
});

check("V-16", "false-strong closure", () => {
  const questions = syntheticQuestions(10);
  const score = scoreLayeredEvidenceQuestionSet(questions, answersForSynthetic(questions, { knowledgeLevel: "speculative" }));
  assert.equal(score.confidence, "high");
  assert.equal(score.primarySupport, 0.2);
  assert.notEqual(score.signalStrength, "strong");
});

check("V-17", "high-quality support remains strong", () => {
  const questions = syntheticQuestions(10);
  const score = scoreLayeredEvidenceQuestionSet(questions, answersForSynthetic(questions));
  assert.ok(score.compositionGap > 0.2);
  assert.ok(score.effectiveCoverage > 0.5);
  assert.ok(score.primarySupport >= 0.29);
  assert.equal(score.signalStrength, "strong");
});

check("V-18", "exclusion monotonicity", () => {
  const questions = syntheticQuestions(8);
  const stages = [0, 1, 2, 3, 4].map((excludedCount) => {
    const answers = answersForSynthetic(questions);
    for (let index = 0; index < excludedCount; index += 1) {
      if (excludedCount === 4) {
        delete answers[questions[index].id];
      } else if (excludedCount === 3) {
        answers[questions[index].id] = evidenceClassifiedAnswer("A", { directObservationGate: "yes", evidenceType: "document_supported", knowledgeLevel: "document_based" });
      } else {
        answers[questions[index].id] = evidenceClassifiedAnswer("X", { directObservationGate: "no", evidenceType: "unknown", knowledgeLevel: "not_known", confidence: "cannot_determine", reliabilityFlags: ["no_direct_knowledge"], reliabilityFlagsAcknowledged: true });
      }
    }
    return scoreLayeredEvidenceQuestionSet(questions, answers);
  });
  for (const field of ["primarySupport", "evidenceYield", "effectiveCoverage"]) {
    for (let index = 1; index < stages.length; index += 1) assert.ok(stages[index][field] <= stages[index - 1][field], `${field} increased`);
  }
});

const sparseObservedAnswers = {};
let sparseObservedUsed = 0;
for (const question of observedQuestions) {
  const scorable = scorableOption(question, PRIMARY_CODE);
  if (scorable && sparseObservedUsed < 4) {
    sparseObservedAnswers[question.id] = evidenceClassifiedAnswer(scorable.value);
    sparseObservedUsed += 1;
  } else {
    const excluded = excludedOption(question);
    assert.ok(excluded, `excluded option missing for ${question.id}`);
    sparseObservedAnswers[question.id] = evidenceClassifiedAnswer(excluded.value);
  }
}
const sparseObservedScore = scoreTargetObservation(sparseObservedAnswers);

check("V-19", "production coverage hole", () => {
  assert.equal(sparseObservedScore.opportunityMass, 19);
  assert.equal(sparseObservedScore.effectiveAnswerCount, 4);
  assert.equal(sparseObservedScore.effectiveCoverage, 0.211);
  assert.equal(sparseObservedScore.signalStrength, "weak");
});

check("V-20", "triage subsumption", () => {
  const questions = syntheticQuestions(10);
  const answers = { [questions[0].id]: evidenceClassifiedAnswer("A") };
  const sparse = scoreLayeredEvidenceQuestionSet(questions, answers);
  assert.equal(sparse.effectiveAnswerCount, 1);
  assert.equal(sparse.totalEvidenceWeight, 1);
  assert.equal(sparse.signalStrength, "weak");
  const triage = buildTriageReport({ acquirer2A: { completed: true, score: sparse } }, { contradictionReport: { findings: [] }, generatedAt: "2026-08-26T00:00:00.000Z" });
  assert.equal(triage.sourceSummaries.find((source) => source.id === "acquirer").weakSignal, true);
});

check("V-21", "zero co-presence closure", () => {
  assert.equal(zeroScore.coPresence, false);
  assert.equal(zeroScore.signalStrength, "weak");
});

check("V-22", "rounding self-consistency", () => {
  for (const score of [aemScore, el1Score, observedScore]) {
    const primaryShare = score.signalCompositionShare[score.primaryEnvironmentCode];
    const secondaryRankCode = score.rankedEnvironments[1].code;
    assert.equal(score.compositionGap, round3(primaryShare - score.signalCompositionShare[secondaryRankCode]));
    assert.equal(score.signalStrength, classifyNormalizedSignal({
      evidenceMass: score.totalEvidenceWeight,
      primaryEnvironmentCode: score.primaryEnvironmentCode,
      effectiveCoverage: score.effectiveCoverage,
      confidence: score.confidence,
      compositionGap: score.compositionGap,
      primarySupport: score.primarySupport,
    }));
  }
});

const observationSource = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.8, [SECONDARY_CODE]: 0.2 }, evidenceYield: 0.8, effectiveCoverage: 1, questionCount: 19 });
const diagnostic12 = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.2, [SECONDARY_CODE]: 0.8 }, evidenceYield: 0.6, effectiveCoverage: 0.8, questionCount: 12 });
const diagnostic22 = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.2, [SECONDARY_CODE]: 0.8 }, evidenceYield: 0.6, effectiveCoverage: 0.8, questionCount: 22 });
const merge19x12 = mergeTwoScores(observationSource, diagnostic12);
const merge19x22 = mergeTwoScores(observationSource, diagnostic22);

check("M-1", "19-by-12 versus 19-by-22 invariance", () => {
  assert.deepEqual(normalizedProjection(merge19x12), normalizedProjection(merge19x22));
  evidence.mergeLengthInvariance = { merge19x12: normalizedProjection(merge19x12), merge19x22: normalizedProjection(merge19x22) };
});

check("M-2", "source replication invariance", () => {
  const replicated = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.2, [SECONDARY_CODE]: 0.8 }, evidenceYield: 0.6, effectiveCoverage: 0.8, questionCount: 44 });
  assert.deepEqual(normalizedProjection(mergeTwoScores(observationSource, replicated)), normalizedProjection(merge19x12));
});

check("M-3", "yield-linear directional authority", () => {
  const left = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, evidenceYield: 1 });
  const rows = [1, 0.7, 0.5, 0.35, 0.175].map((yieldValue) => {
    const right = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: yieldValue });
    const merged = mergeTwoScores(left, right);
    const expected = round3(yieldValue / (1 + yieldValue));
    assert.equal(merged.normalizedDirectionalAuthority.right, expected);
    if (yieldValue !== 1) {
      assert.notEqual(merged.normalizedDirectionalAuthority.right, round3((yieldValue ** 2) / (1 + yieldValue ** 2)));
    }
    return { yield: yieldValue, authority: merged.normalizedDirectionalAuthority.right };
  });
  evidence.yieldLinearity = rows;
});

check("M-4", "explicit 80/20 at equal yield", () => {
  for (const yieldValue of [0.2, 0.7, 1]) {
    const left = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, evidenceYield: yieldValue });
    const right = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: yieldValue });
    const merged = mergeTwoScores(left, right, { leftWeight: 0.8, rightWeight: 0.2 });
    assert.deepEqual(merged.normalizedDirectionalAuthority, { left: 0.8, right: 0.2 });
  }
});

check("M-5", "explicit 80/20 with unequal yield", () => {
  const left = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, evidenceYield: 0.7 });
  const right = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 0.35 });
  const merged = mergeTwoScores(left, right, { leftWeight: 0.8, rightWeight: 0.2 });
  assert.equal(merged.normalizedDirectionalAuthority.left, round3((0.8 * 0.7) / (0.8 * 0.7 + 0.2 * 0.35)));
  evidence.explicit8020 = { equalYield: { left: 0.8, right: 0.2 }, unequalYield: merged.normalizedDirectionalAuthority };
});

const zeroNormalizedSource = syntheticNormalizedSource({ shares: {}, evidenceYield: 0, effectiveCoverage: 0, confidence: "cannot_determine" });
check("M-6", "one-sided yield", () => {
  const directional = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.65, [SECONDARY_CODE]: 0.35 }, evidenceYield: 0.7 });
  for (const weights of [{}, { leftWeight: 0.8, rightWeight: 0.2 }]) {
    assert.deepEqual(mergeTwoScores(directional, zeroNormalizedSource, weights).signalCompositionShare, directional.signalCompositionShare);
    assert.deepEqual(mergeTwoScores(zeroNormalizedSource, directional, weights).signalCompositionShare, directional.signalCompositionShare);
  }
});

const bothZeroMerge = mergeTwoScores(zeroNormalizedSource, zeroNormalizedSource);
check("M-7", "both-zero merge", () => {
  assert.equal(Object.values(bothZeroMerge.signalCompositionShare).every((value) => value === null), true);
  assert.equal(bothZeroMerge.primaryEnvironmentCode, null);
  assert.equal(bothZeroMerge.secondaryEnvironmentCode, null);
  assert.equal(bothZeroMerge.signalStrength, "weak");
  assert.equal(bothZeroMerge.coPresence, false);
  assert.equal(bothZeroMerge.confidence, "cannot_determine");
  assertFiniteNormalized(normalizedProjection(bothZeroMerge));
});

check("M-8", "normalized merged ranking", () => {
  assert.equal(merge19x12.rankedEnvironments[0].code, merge19x22.rankedEnvironments[0].code);
  const supportOrder = merge19x12.rankedEnvironments.filter((entry) => entry.score > 0).map((entry) => entry.code);
  const shareOrder = Object.entries(merge19x12.signalCompositionShare).sort(([leftCode, left], [rightCode, right]) => right - left || leftCode.localeCompare(rightCode)).filter(([, value]) => value > 0).map(([code]) => code);
  assert.deepEqual(supportOrder, shareOrder);
});

check("M-9", "C3-D applies once through merge", () => {
  const long = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, evidenceYield: 1, questionCount: 11 });
  const short = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 0.5, questionCount: 11 });
  const merged = mergeTwoScores(long, short);
  assert.deepEqual(merged.normalizedDirectionalAuthority, { left: 0.667, right: 0.333 });
  assert.notDeepEqual(merged.normalizedDirectionalAuthority, { left: 0.8, right: 0.2 });
});

check("M-10", "legacy v1 deterministic recompute/fail-closed", () => {
  const legacyObservation = withoutV2NormalizedFields(observedScore, { questionCount: 999 });
  const observationSession = {
    targetObservation: { score: legacyObservation, answers: observedAnswers, observationSessionId: "obs-c4" },
  };
  const observationRehydrated = rehydrateTargetScoresForNormalizedMerge(observationSession);
  assert.equal(observationRehydrated.statuses.targetObservation, "legacy_recomputed_v2");
  assert.equal(observationRehydrated.targetObservationScore.scoringModelVersion, LAYERED_EVIDENCE_SCORING_VERSION);
  assert.equal(observationRehydrated.targetObservationScore.questionCount, 23);
  assert.equal(observationRehydrated.targetObservationScore.opportunityMass, 19);

  const legacyDiagnostic = withoutV2NormalizedFields(scoreTargetDiagnosticLevel1(el1Answers));
  const diagnosticRehydrated = rehydrateTargetScoresForNormalizedMerge({
    target2B: { finalScore: legacyDiagnostic, level1: { answers: el1Answers } },
  });
  assert.equal(diagnosticRehydrated.statuses.targetDiagnostic, "legacy_recomputed_v2");
  assert.equal(diagnosticRehydrated.targetDiagnosticScore.opportunityMass, 12);

  const legacySelf = withoutV2NormalizedFields(tsamScore);
  const selfRehydrated = rehydrateTargetScoresForNormalizedMerge({
    targetSelfAssessment: { score: legacySelf, answers: tsamAnswers, positioning: { p2: "C", acquisitionAwareness: "no" } },
  });
  assert.equal(selfRehydrated.statuses.targetSelfAssessment, "legacy_recomputed_v2");
  assert.equal(selfRehydrated.targetSelfScore.opportunityMass, 11);

  const missing = rehydrateTargetScoresForNormalizedMerge({ targetObservation: { score: legacyObservation } });
  assert.equal(missing.statuses.targetObservation, "legacy_ineligible_missing_or_invalid_answers");
  assert.equal(missing.targetObservationScore.valid, false);
  evidence.legacy = {
    observation: observationRehydrated.statuses.targetObservation,
    observationQuestionCount: observationRehydrated.targetObservationScore.questionCount,
    observationOpportunityMass: observationRehydrated.targetObservationScore.opportunityMass,
    diagnostic: diagnosticRehydrated.statuses.targetDiagnostic,
    self: selfRehydrated.statuses.targetSelfAssessment,
    missingAnswers: missing.statuses.targetObservation,
  };
});

check("M-11", "no intermediate merge rounding", () => {
  const tiny = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 0.5, [SECONDARY_CODE]: 0.5 }, evidenceYield: 0.002, questionCount: 500 });
  const merged = mergeTwoScores(tiny, tiny);
  const wrongIntermediateSupport = round3(round3(0.5 * 0.001) + round3(0.5 * 0.001));
  const wrongIntermediateYield = round3(round3(0.5 * 0.002) + round3(0.5 * 0.002));
  const wrongShare = round3(wrongIntermediateSupport / wrongIntermediateYield);
  assert.equal(merged.signalCompositionShare[PRIMARY_CODE], 0.5);
  assert.equal(wrongShare, 1);
});

check("M-12", "normalized merged mass", () => {
  approx(Object.values(merge19x12.signalCompositionShare).reduce((sum, value) => sum + value, 0), 1, 0.003);
  approx(Object.values(merge19x12.supportStrengthByEnvironment).reduce((sum, value) => sum + value, 0), merge19x12.evidenceYield, 0.003);
  for (const field of [merge19x12.signalCompositionShare, merge19x12.supportStrengthByEnvironment]) {
    assert.equal(Object.values(field).every((value) => value >= 0 && value <= 1), true);
  }
});

check("M-13", "absolute merged fields are audit-only", () => {
  const longAbsolute = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, evidenceYield: 1, questionCount: 100, absoluteScale: 100 });
  const shortAbsolute = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 1, questionCount: 1, absoluteScale: 1 });
  const merged = mergeTwoScores(longAbsolute, shortAbsolute);
  const auditPrimary = Object.entries(merged.weightedEnvironmentScores).sort(([leftCode, left], [rightCode, right]) => right - left || leftCode.localeCompare(rightCode))[0][0];
  assert.equal(auditPrimary, PRIMARY_CODE);
  assert.equal(merged.primaryEnvironmentCode, SECONDARY_CODE);
  assert.equal(Object.hasOwn(merged, "opportunityMass"), false);
  assert.equal(Object.hasOwn(merged, "excludedRate"), false);
  const source = readFileSync(new URL("../src/flow/finalDeliverableFlow.js", import.meta.url), "utf8");
  const mergeSource = source.slice(source.indexOf("export function mergeTwoScores"), source.indexOf("export function combineTargetCanonicalScore"));
  assert.match(mergeSource, /rankedFromRawSupport\(mergedSupportRaw\)/);
  assert.match(mergeSource, /classifyNormalizedSignal\(\{/);
  assert.match(mergeSource, /normalizedCoPresence\(\{/);
});

const confidenceHigh = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, confidence: "high", ingredients: { supportedShare: 1, flagRate: 0, legacyCount: 0 } });
const confidenceLow = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, confidence: "low", ingredients: { supportedShare: 0, flagRate: 0.8, legacyCount: 0 } });

check("M-14", "merged confidence is not left-inherited", () => {
  const merged = mergeTwoScores(confidenceHigh, confidenceLow);
  assert.equal(merged.confidence, "low");
  assert.notEqual(merged.confidence, confidenceHigh.confidence);
});

check("M-15", "tiny low-confidence source has no veto", () => {
  const tinyLow = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 0.2, effectiveCoverage: 0.2, confidence: "low", ingredients: { supportedShare: 0, flagRate: 1, legacyCount: 0 } });
  const merged = mergeTwoScores(confidenceHigh, tinyLow, { leftWeight: 0.8, rightWeight: 0.2 });
  assert.ok(merged.mergedConfidenceAuthority.right <= 0.05);
  assert.equal(merged.confidence, "high");
});

check("M-16", "material low-confidence source matters", () => {
  const merged = mergeTwoScores(confidenceHigh, confidenceLow);
  assert.deepEqual(merged.mergedConfidenceAuthority, { left: 0.5, right: 0.5 });
  assert.equal(merged.confidence, "low");
});

check("M-17", "tiny high-confidence source cannot upgrade", () => {
  const dominantLow = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, confidence: "low", ingredients: { supportedShare: 0, flagRate: 0.8, legacyCount: 0 } });
  const tinyHigh = syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 0.2, effectiveCoverage: 0.1, confidence: "high", ingredients: { supportedShare: 1, flagRate: 0, legacyCount: 0 } });
  const merged = mergeTwoScores(dominantLow, tinyHigh, { leftWeight: 0.8, rightWeight: 0.2 });
  assert.ok(merged.mergedConfidenceAuthority.right < 0.05);
  assert.equal(merged.confidence, "low");
});

check("M-18", "one-sided and zero confidence", () => {
  assert.equal(mergeTwoScores(confidenceHigh, zeroNormalizedSource).confidence, "high");
  assert.equal(mergeTwoScores(zeroNormalizedSource, confidenceHigh).confidence, "high");
  assert.equal(bothZeroMerge.confidence, "cannot_determine");
  evidence.mergedConfidence = {
    notLeftInherited: mergeTwoScores(confidenceHigh, confidenceLow).confidence,
    tinyLow: mergeTwoScores(confidenceHigh, syntheticNormalizedSource({ shares: { [SECONDARY_CODE]: 1 }, evidenceYield: 0.2, effectiveCoverage: 0.2, confidence: "low", ingredients: { supportedShare: 0, flagRate: 1 } }), { leftWeight: 0.8, rightWeight: 0.2 }).confidence,
    materialLow: mergeTwoScores(confidenceHigh, confidenceLow).confidence,
    zeroIgnored: mergeTwoScores(confidenceHigh, zeroNormalizedSource).confidence,
    bothZero: bothZeroMerge.confidence,
    ingredients: {
      mergedSupportedShare: mergeTwoScores(confidenceHigh, confidenceLow).mergedSupportedShare,
      mergedFlagRate: mergeTwoScores(confidenceHigh, confidenceLow).mergedFlagRate,
      mergedLegacyCount: mergeTwoScores(confidenceHigh, confidenceLow).mergedLegacyCount,
    },
  };
});

check("M-19", "confidence constants frozen", () => {
  const legacyMedium = syntheticNormalizedSource({ shares: { [PRIMARY_CODE]: 1 }, confidence: "medium", ingredients: { supportedShare: 1, flagRate: 0, legacyCount: 1 } });
  assert.equal(mergeTwoScores(legacyMedium, legacyMedium).confidence, "medium");
  const source = readFileSync(new URL("../src/flow/finalDeliverableFlow.js", import.meta.url), "utf8");
  const confidenceSource = source.slice(source.indexOf("function confidenceFromMergedIngredients"), source.indexOf("function failClosedMergedScore"));
  assert.match(confidenceSource, /mergedLegacyCount === 0 && mergedSupportedShareRaw >= 0\.6 && mergedFlagRateRaw < 0\.2/);
  assert.match(confidenceSource, /mergedSupportedShareRaw >= 0\.35 && mergedFlagRateRaw < 0\.4/);
});

const layeredSource = readFileSync(new URL("../src/flow/layeredEvidenceScoring.js", import.meta.url), "utf8");
const triageSource = readFileSync(new URL("../src/flow/triageEngine.js", import.meta.url), "utf8");
assert.equal(LAYERED_EVIDENCE_SCORING_VERSION, "newlogic-layered-evidence-v2");
assert.doesNotMatch(triageSource, /effectiveAnswerCount[^\n]*<=\s*1/);
assert.doesNotMatch(triageSource, /totalEvidenceWeight[^\n]*<=\s*1/);
assert.match(layeredSource, /arguments\[3\] \?\? 1/);

evidence.zeroCoverage = Object.freeze({
  zero: scoreSummary(zeroScore),
  targetObservedSparse4of19: scoreSummary(sparseObservedScore),
  oneEffectiveAnswer: scoreSummary(scoreLayeredEvidenceQuestionSet(syntheticQuestions(10), { q1: evidenceClassifiedAnswer("A") })),
  freeDocumentInadmissible: scoreSummary(documentScore),
});

console.log(`C4 scale-invariance validator passed: ${checks.length}/${checks.length} contract groups`);
console.log(`EVIDENCE ${JSON.stringify(evidence)}`);
