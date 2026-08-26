import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  TRANSACTION_DETAIL_SECTIONS,
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  canStartAcquirerModule,
  completeAcquirerVerificationInvite,
  firmTenureEvidenceMultiplier,
  scoreAcquirerModule,
  scoreCombinedAcquirerModule,
} from "../src/flow/acquirerTrackFlow.js";
import { scoreLayeredEvidenceQuestionSet } from "../src/flow/layeredEvidenceScoring.js";
import { resolveObservationScope } from "../src/flow/observationScopeResolver.js";
import {
  scoreTargetDiagnosticLevel1,
  scoreTargetDiagnosticQuestions,
} from "../src/flow/targetDiagnosticFlow.js";
import { scoreTargetObservation } from "../src/flow/targetObservationFlow.js";
import { scoreTargetSelfAssessment } from "../src/flow/targetSelfAssessmentFlow.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SHORT_TENURE = "less_than_18_months";
const MID_TENURE = "18_months_to_3_years";
const LONG_TENURE = "more_than_3_years";
const COMPLETED_AT = "2026-08-26T12:00:00.000Z";
const AEM_QUESTIONS = ACQUIRER_TRACK_DATA.acquirerModule.questions;
const TENURE_SECTION = TRANSACTION_DETAIL_SECTIONS.find((section) => section.id === "firmTenure");
const TENURE_VALUES = TENURE_SECTION.options.map((option) => option.value);
const GENERATED_QUESTIONNAIRES = JSON.parse(
  readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url), "utf8"),
);
const APP_SOURCE = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const ACQUIRER_FLOW_SOURCE = readFileSync(new URL("../src/flow/acquirerTrackFlow.js", import.meta.url), "utf8");
const SCORING_SOURCE = readFileSync(new URL("../src/flow/layeredEvidenceScoring.js", import.meta.url), "utf8");
const PACKAGE_JSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

const checks = [];
const gatingEvidence = {};
const weightingEvidence = {};
const exactWeightEvidence = {};
const compatibilityEvidence = {};
const noDoubleEvidence = {};

function check(id, label, fn) {
  checks.push({ id, label, fn });
}

function roundScore(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function answersFor(questions, optionIndex = 0, overrides = {}) {
  return Object.fromEntries(questions.map((question) => {
    const option = question.options[Math.min(optionIndex, question.options.length - 1)];
    return [question.id, evidenceClassifiedAnswer(option.value, overrides)];
  }));
}

function directAemAnswers() {
  return answersFor(AEM_QUESTIONS);
}

function verificationInvite(overrides = {}) {
  return Object.freeze({
    acquirerVerificationSessionId: "c3d-r2",
    assessmentSessionId: "c3d-r1",
    completed: false,
    revoked: false,
    createdAt: "2026-08-26T10:00:00.000Z",
    expiresAt: "2026-08-29T10:00:00.000Z",
    ...overrides,
  });
}

function acquirerSession(firmTenure, answers = directAemAnswers()) {
  const base = Object.freeze({
    sessionId: "c3d-r1",
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

function entryFor(score, slot, questionId = AEM_QUESTIONS[0].id) {
  return score.questionResponses.find((entry) => (
    entry.respondentSlot === slot && entry.questionId === questionId
  ));
}

function slotWeightSum(score, slot) {
  return roundScore(score.questionResponses
    .filter((entry) => entry.respondentSlot === slot)
    .reduce((sum, entry) => sum + entry.weight, 0));
}

function recomputeWeightedEnvironmentScores(score) {
  const recomputed = Object.fromEntries(Object.keys(score.weightedEnvironmentScores).map((code) => [code, 0]));
  for (const entry of score.questionResponses) {
    for (const code of entry.signalCodes) {
      recomputed[code] += entry.weight / Math.max(1, entry.signalCodes.length);
    }
  }
  return Object.fromEntries(Object.entries(recomputed).map(([code, value]) => [code, roundScore(value)]));
}

function combinedScore(primaryTenure, verificationTenure, answers = directAemAnswers()) {
  return scoreCombinedAcquirerModule(answers, answers, ACQUIRER_TRACK_DATA, {
    primaryEvidenceMultiplier: firmTenureEvidenceMultiplier(primaryTenure),
    verificationEvidenceMultiplier: firmTenureEvidenceMultiplier(verificationTenure),
    primaryRespondentId: "c3d-r1",
    verificationRespondentId: "c3d-r2",
  });
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function questionnaireShapeRuntime() {
  return [
    ["acquirerEnvironment", AEM_QUESTIONS],
    ["targetSelfAssessment", TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions],
    ["environmentLevel1", TARGET_DIAGNOSTIC_DATA.level1.questions],
    ["environmentLevel2", TARGET_DIAGNOSTIC_DATA.level2.questions],
    ["targetObservedEnvironment", TARGET_OBSERVATION_DIAGNOSTIC.questions],
  ].map(([moduleId, questions]) => ({
    moduleId,
    questions: questions.map((question) => ({
      id: question.id,
      prompt: normalizeText(question.text),
      options: question.options.map((option) => ({ value: option.value, text: normalizeText(option.text) })),
    })),
  }));
}

function questionnaireShapeGenerated() {
  return questionnaireShapeRuntime().map(({ moduleId }) => {
    const module = GENERATED_QUESTIONNAIRES.modules.find((item) => item.id === moduleId);
    assert.ok(module, `generated module missing: ${moduleId}`);
    return {
      moduleId,
      questions: module.questions.map((question) => ({
        id: question.workbookQuestionId ?? question.id,
        prompt: normalizeText(question.prompt),
        options: question.options.map((option) => ({ value: option.value, text: normalizeText(option.text) })),
      })),
    };
  });
}

function targetBaselineView(score) {
  return {
    valid: score.valid,
    answeredQuestionCount: score.answeredQuestionCount,
    questionCount: score.questionCount,
    effectiveAnswerCount: score.effectiveAnswerCount,
    excludedAnswerCount: score.excludedAnswerCount,
    totalEvidenceWeight: score.totalEvidenceWeight,
    environmentScores: { ...score.environmentScores },
    weightedEnvironmentScores: { ...score.weightedEnvironmentScores },
    primaryEnvironmentCode: score.primaryEnvironmentCode,
    primarySignalScore: score.primarySignalScore,
    secondaryEnvironmentCode: score.secondaryEnvironmentCode,
    secondarySignalScore: score.secondarySignalScore,
    coPresence: score.coPresence,
    signalStrength: score.signalStrength,
    confidence: score.confidence,
    diagnosticAnswerCount: score.diagnosticAnswerCount,
    evidenceConfidence: score.evidenceConfidence,
    topEnvironmentCode: score.topEnvironmentCode,
  };
}

function filesUnder(relativeDirectory) {
  const root = join(ROOT, relativeDirectory);
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(root);
  return files;
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

const BASELINE_FIXTURE_PROFILES = Object.freeze([
  Object.freeze({ questionIndex: 0, optionIndex: 0, overrides: {} }),
  Object.freeze({ questionIndex: 1, optionIndex: 1, overrides: {} }),
  Object.freeze({ questionIndex: 2, optionIndex: 2, overrides: {} }),
  Object.freeze({ questionIndex: 3, optionIndex: 3, overrides: {} }),
  Object.freeze({ questionIndex: 4, optionIndex: 0, overrides: { reliabilityFlags: ["contradicted_by_respondent"] } }),
  Object.freeze({ questionIndex: 5, optionIndex: 1, overrides: { reliabilityFlags: ["socially_desirable"] } }),
  Object.freeze({ questionIndex: 6, optionIndex: 2, overrides: { reliabilityFlags: ["overgeneralized"] } }),
  Object.freeze({ questionIndex: 7, optionIndex: 3, overrides: { reliabilityFlags: ["structurally_unlikely"] } }),
  Object.freeze({ questionIndex: 8, optionIndex: 0, overrides: { reliabilityFlags: ["contradicted_by_respondent", "socially_desirable"] } }),
  Object.freeze({ questionIndex: 9, optionIndex: 1, overrides: { directObservationGate: "no", evidenceType: "reported_by_others", knowledgeLevel: "second_hand", confidence: "medium" } }),
  Object.freeze({ questionIndex: 10, optionIndex: 2, overrides: { directObservationGate: "no", evidenceType: "inference", knowledgeLevel: "pattern_based", confidence: "low" } }),
  Object.freeze({ questionIndex: 0, optionIndex: 3, overrides: { directObservationGate: "no", evidenceType: "inference", knowledgeLevel: "pattern_based", confidence: "low", reliabilityFlags: ["speaks_for_group_without_access"] } }),
  Object.freeze({ questionIndex: 1, optionIndex: 0, overrides: { directObservationGate: "no", evidenceType: "hypothetical", knowledgeLevel: "speculative", confidence: "low", reliabilityFlags: ["hypothetical"] } }),
  Object.freeze({ questionIndex: 2, optionIndex: 1, overrides: { directObservationGate: "no", evidenceType: "unknown", knowledgeLevel: "not_known", confidence: "cannot_determine", reliabilityFlags: ["no_direct_knowledge"] } }),
  Object.freeze({ questionIndex: 3, optionIndex: 2, overrides: { evidenceType: "document_supported", knowledgeLevel: "document_based", confidence: "high" } }),
  Object.freeze({ questionIndex: 4, optionIndex: 3, overrides: { directObservationGate: "no", evidenceType: "inference", knowledgeLevel: "pattern_based", confidence: "low", reliabilityFlags: ["evasive"] } }),
  Object.freeze({ questionIndex: 5, optionIndex: 0, overrides: { reliabilityFlags: ["contradicted_by_respondent", "overgeneralized"] } }),
  Object.freeze({ missing: true }),
]);

check("C3D-01", "Canonical firm-tenure multiplier is 0.5 only for the short bucket", () => {
  assert.equal(firmTenureEvidenceMultiplier(SHORT_TENURE), 0.5);
  assert.equal(firmTenureEvidenceMultiplier(MID_TENURE), 1);
  assert.equal(firmTenureEvidenceMultiplier(LONG_TENURE), 1);
  for (const value of [undefined, null, "", "legacy_value", 17, {}, []]) {
    assert.equal(firmTenureEvidenceMultiplier(value), 1);
  }
});

check("C3D-02", "18 executable baseline fixtures keep multiplier omission identical to explicit 1.0", () => {
  assert.ok(BASELINE_FIXTURE_PROFILES.length >= 18);
  for (const [index, profile] of BASELINE_FIXTURE_PROFILES.entries()) {
    const answerMap = {};
    if (!profile.missing) {
      const question = AEM_QUESTIONS[profile.questionIndex];
      const option = question.options[Math.min(profile.optionIndex, question.options.length - 1)];
      answerMap[question.id] = evidenceClassifiedAnswer(option.value, profile.overrides);
    }
    const implicit = scoreAcquirerModule(answerMap);
    const explicit = scoreAcquirerModule(answerMap, ACQUIRER_TRACK_DATA, { respondentEvidenceMultiplier: 1 });
    assert.deepEqual(implicit, explicit, `baseline fixture ${index + 1}`);
  }
  compatibilityEvidence.baselineFixtureCount = BASELINE_FIXTURE_PROFILES.length;
});

check("C3D-03", "Malformed low-level multipliers safely default to 1.0", () => {
  const question = AEM_QUESTIONS[0];
  const answerMap = { [question.id]: evidenceClassifiedAnswer(question.options[0].value) };
  const baseline = scoreLayeredEvidenceQuestionSet([question], answerMap, { moduleId: "acquirer_environment" });
  for (const value of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0, -0.5, "0.5"] ) {
    const score = scoreLayeredEvidenceQuestionSet([question], answerMap, {
      moduleId: "acquirer_environment",
      respondentEvidenceMultiplier: value,
    });
    assert.deepEqual(score, baseline, `malformed multiplier ${String(value)}`);
  }
});

check("C3D-04", "R1 short / R2 long downweights only primary entries", () => {
  const score = combinedScore(SHORT_TENURE, LONG_TENURE);
  weightingEvidence.r1ShortR2Long = {
    primary: slotWeightSum(score, "primary"),
    verification: slotWeightSum(score, "verification"),
  };
  assert.deepEqual(weightingEvidence.r1ShortR2Long, { primary: 5.5, verification: 11 });
});

check("C3D-05", "R1 long / R2 short downweights only verification entries", () => {
  const score = combinedScore(LONG_TENURE, SHORT_TENURE);
  weightingEvidence.r1LongR2Short = {
    primary: slotWeightSum(score, "primary"),
    verification: slotWeightSum(score, "verification"),
  };
  assert.deepEqual(weightingEvidence.r1LongR2Short, { primary: 11, verification: 5.5 });
});

check("C3D-06", "Both short respondents are downweighted independently", () => {
  const score = combinedScore(SHORT_TENURE, SHORT_TENURE);
  weightingEvidence.bothShort = {
    primary: slotWeightSum(score, "primary"),
    verification: slotWeightSum(score, "verification"),
  };
  assert.deepEqual(weightingEvidence.bothShort, { primary: 5.5, verification: 5.5 });
});

check("C3D-07", "Both long respondents retain the baseline", () => {
  const score = combinedScore(LONG_TENURE, LONG_TENURE);
  weightingEvidence.bothLong = {
    primary: slotWeightSum(score, "primary"),
    verification: slotWeightSum(score, "verification"),
  };
  assert.deepEqual(weightingEvidence.bothLong, { primary: 11, verification: 11 });
});

check("C3D-08", "R1 individual response weight is exactly halved", () => {
  const baseline = entryFor(combinedScore(LONG_TENURE, LONG_TENURE), "primary");
  const short = entryFor(combinedScore(SHORT_TENURE, LONG_TENURE), "primary");
  exactWeightEvidence.r1 = { baseline: baseline.weight, short: short.weight, ratio: short.weight / baseline.weight };
  assert.deepEqual(exactWeightEvidence.r1, { baseline: 1, short: 0.5, ratio: 0.5 });
});

check("C3D-09", "R2 individual response weight is exactly halved", () => {
  const baseline = entryFor(combinedScore(LONG_TENURE, LONG_TENURE), "verification");
  const short = entryFor(combinedScore(LONG_TENURE, SHORT_TENURE), "verification");
  exactWeightEvidence.r2 = { baseline: baseline.weight, short: short.weight, ratio: short.weight / baseline.weight };
  assert.deepEqual(exactWeightEvidence.r2, { baseline: 1, short: 0.5, ratio: 0.5 });
});

const INVALID_METADATA_CASES = Object.freeze([
  Object.freeze(["missing", {}]),
  Object.freeze(["null", { firmTenure: null }]),
  Object.freeze(["undefined", { firmTenure: undefined }]),
  Object.freeze(["nonString", { firmTenure: 17 }]),
  Object.freeze(["empty", { firmTenure: "" }]),
  Object.freeze(["whitespace", { firmTenure: "   " }]),
  Object.freeze(["unknown", { firmTenure: "fourth_bucket" }]),
]);

for (const [caseName, metadata] of INVALID_METADATA_CASES) {
  check(`C3D-GATE-${caseName}`, `Production R2 metadata rejects ${caseName} tenure`, () => {
    const invite = verificationInvite();
    const result = completeAcquirerVerificationInvite(invite, directAemAnswers(), COMPLETED_AT, metadata);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "acquirer-verification-tenure-required");
    assert.equal(result.invite, invite);
    assert.equal(result.invite.completed, false);
    assert.equal(Object.hasOwn(result.invite, "acquirerVerification"), false);
    gatingEvidence[caseName] = {
      ok: result.ok,
      reason: result.reason,
      completed: result.invite.completed,
      hasAcquirerVerification: Object.hasOwn(result.invite, "acquirerVerification"),
    };
  });
}

check("C3D-17", "Rejected R2 completion cannot mutate combined AEM state", () => {
  const session = acquirerSession(LONG_TENURE);
  const rejected = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    {},
  );
  const attached = attachAcquirerVerificationCompletion(session, rejected.invite);
  assert.equal(attached, session);
  assert.equal(session.acquirerVerification, undefined);
  assert.equal(session.acquirer2A.score.verificationIncluded, undefined);
});

check("C3D-18", "R1 missing tenure keeps the Acquirer module start gate closed", () => {
  const session = Object.freeze({
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze({ respondentSide: "acquirer" }),
    }),
  });
  assert.equal(canStartAcquirerModule(session), false);
  assert.equal(canStartAcquirerModule({
    ...session,
    dealContext: { ...session.dealContext, data: { respondentSide: "acquirer", firmTenure: LONG_TENURE } },
  }), true);
});

check("C3D-19", "Legacy three-argument R2 completion remains baseline-compatible", () => {
  const answers = directAemAnswers();
  const invite = verificationInvite();
  const result = completeAcquirerVerificationInvite(invite, answers, COMPLETED_AT);
  const baseline = scoreAcquirerModule(answers, ACQUIRER_TRACK_DATA, {
    respondentId: invite.acquirerVerificationSessionId,
    respondentSlot: "verification",
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.invite.acquirerVerification.score, baseline);
  assert.equal(Object.hasOwn(result.invite.acquirerVerification, "respondentMetadata"), false);
  compatibilityEvidence.legacyCompletion = {
    ok: result.ok,
    totalEvidenceWeight: result.invite.acquirerVerification.score.totalEvidenceWeight,
    hasRespondentMetadata: Object.hasOwn(result.invite.acquirerVerification, "respondentMetadata"),
  };
});

check("C3D-20", "Direct scoreAcquirerModule call shape remains baseline", () => {
  const answers = directAemAnswers();
  const implicit = scoreAcquirerModule(answers);
  const explicit = scoreAcquirerModule(answers, ACQUIRER_TRACK_DATA, { respondentEvidenceMultiplier: 1 });
  assert.deepEqual(implicit, explicit);
  compatibilityEvidence.directScore = {
    totalEvidenceWeight: implicit.totalEvidenceWeight,
    primarySignalScore: implicit.primarySignalScore,
  };
});

check("C3D-21", "Valid short R2 completion stores metadata and weights standalone entries once", () => {
  const result = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    { firmTenure: SHORT_TENURE },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.invite.acquirerVerification.respondentMetadata, { firmTenure: SHORT_TENURE });
  assert.equal(result.invite.acquirerVerification.score.totalEvidenceWeight, 5.5);
  assert.equal(result.invite.acquirerVerification.score.questionResponses[0].weight, 0.5);
  assert.equal(Object.hasOwn(result.invite.acquirerVerification.answers, "firmTenure"), false);
});

check("C3D-22", "Valid long R2 completion stores metadata and retains standalone baseline", () => {
  const result = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    { firmTenure: LONG_TENURE },
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.invite.acquirerVerification.respondentMetadata, { firmTenure: LONG_TENURE });
  assert.equal(result.invite.acquirerVerification.score.totalEvidenceWeight, 11);
  assert.equal(result.invite.acquirerVerification.score.questionResponses[0].weight, 1);
});

check("C3D-23", "Short R2 has the same base×0.5 weight standalone and combined", () => {
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    { firmTenure: SHORT_TENURE },
  );
  const standalone = completion.invite.acquirerVerification.score.questionResponses[0].weight;
  const combined = attachAcquirerVerificationCompletion(
    acquirerSession(LONG_TENURE),
    completion.invite,
  );
  const combinedWeight = entryFor(combined.acquirer2A.score, "verification").weight;
  noDoubleEvidence.shortR2 = { base: 1, standalone, combined: combinedWeight };
  assert.deepEqual(noDoubleEvidence.shortR2, { base: 1, standalone: 0.5, combined: 0.5 });
});

check("C3D-24", "Combined weightedEnvironmentScores recompute from raw questionResponses", () => {
  const score = combinedScore(LONG_TENURE, SHORT_TENURE);
  assert.deepEqual(recomputeWeightedEnvironmentScores(score), score.weightedEnvironmentScores);
});

check("C3D-25", "Combined scorer uses raw R2 answers rather than the standalone weighted score", () => {
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    { firmTenure: SHORT_TENURE },
  );
  const baseline = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), completion.invite);
  const poisonedInvite = {
    ...completion.invite,
    acquirerVerification: {
      ...completion.invite.acquirerVerification,
      score: Object.freeze({ poisoned: true, totalEvidenceWeight: -999 }),
    },
  };
  const poisoned = attachAcquirerVerificationCompletion(acquirerSession(LONG_TENURE), poisonedInvite);
  assert.deepEqual(poisoned.acquirer2A.score, baseline.acquirer2A.score);
});

check("C3D-26", "Reliability and tenure multipliers compose multiplicatively", () => {
  const question = AEM_QUESTIONS[0];
  const answerMap = {
    [question.id]: Object.freeze({
      ...evidenceClassifiedAnswer(question.options[0].value),
      reliabilityFlags: Object.freeze(["contradicted_by_respondent"]),
      reliabilityFlagsAcknowledged: true,
    }),
  };
  const baseline = scoreLayeredEvidenceQuestionSet([question], answerMap, {
    moduleId: "acquirer_environment",
    respondentEvidenceMultiplier: 1,
  });
  const short = scoreLayeredEvidenceQuestionSet([question], answerMap, {
    moduleId: "acquirer_environment",
    respondentEvidenceMultiplier: 0.5,
  });
  assert.equal(baseline.questionResponses[0].weight, 0.5);
  assert.equal(short.questionResponses[0].weight, 0.25);
});

check("C3D-27", "Hard exclusions remain exact zero for both tenure values", () => {
  const question = AEM_QUESTIONS[0];
  const answerMap = {
    [question.id]: evidenceClassifiedAnswer(question.options[0].value, {
      directObservationGate: "no",
      evidenceType: "inference",
      knowledgeLevel: "pattern_based",
      confidence: "low",
      reliabilityFlags: ["no_direct_knowledge"],
    }),
  };
  for (const multiplier of [1, 0.5]) {
    const score = scoreLayeredEvidenceQuestionSet([question], answerMap, {
      moduleId: "acquirer_environment",
      respondentEvidenceMultiplier: multiplier,
    });
    assert.equal(score.questionResponses[0].excludedFromPrimaryScoring, true);
    assert.equal(score.questionResponses[0].weight, 0);
  }
});

check("C3D-28", "Tenure changes no raw scores, counts, confidence, evidence quality, or provenance", () => {
  const long = combinedScore(LONG_TENURE, LONG_TENURE);
  const mixed = combinedScore(SHORT_TENURE, LONG_TENURE);
  assert.deepEqual(mixed.environmentScores, long.environmentScores);
  assert.equal(mixed.effectiveAnswerCount, long.effectiveAnswerCount);
  assert.equal(mixed.excludedAnswerCount, long.excludedAnswerCount);
  assert.equal(mixed.confidence, long.confidence);
  assert.deepEqual(mixed.evidenceQuality, long.evidenceQuality);
  for (const slot of ["primary", "verification"]) {
    const before = entryFor(long, slot);
    const after = entryFor(mixed, slot);
    assert.equal(after.respondentId, before.respondentId);
    assert.equal(after.respondentSlot, before.respondentSlot);
    assert.equal(after.respondentIdentityStatus, before.respondentIdentityStatus);
  }
});

check("C3D-29", "No global post-aggregation multiplier is present", () => {
  const mixed = combinedScore(SHORT_TENURE, LONG_TENURE);
  const long = combinedScore(LONG_TENURE, LONG_TENURE);
  assert.equal(slotWeightSum(mixed, "verification"), slotWeightSum(long, "verification"));
  assert.notDeepEqual(mixed.weightedEnvironmentScores, long.weightedEnvironmentScores);
  assert.match(SCORING_SOURCE, /answerWeight\([\s\S]*respondentEvidenceMultiplier/);
  assert.doesNotMatch(ACQUIRER_FLOW_SOURCE, /weightedEnvironmentScores\s*[*/]=/);
  assert.doesNotMatch(ACQUIRER_FLOW_SOURCE, /environmentScores\s*[*/]=/);
});

const TARGET_BASELINES = Object.freeze({
  tsam: Object.freeze({
    valid: true,
    answeredQuestionCount: 11,
    questionCount: 11,
    effectiveAnswerCount: 11,
    excludedAnswerCount: 0,
    totalEvidenceWeight: 11,
    environmentScores: { "NT/STJ": 10, "NT/STP": 0, "NF/NT": 5, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 1, "STJ/STP": 0, "STP/STJ": 0, "SFP/SFJ": 0 },
    weightedEnvironmentScores: { "NT/STJ": 7.5, "NT/STP": 0, "NF/NT": 2.5, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 1, "STJ/STP": 0, "STP/STJ": 0, "SFP/SFJ": 0 },
    primaryEnvironmentCode: "NT/STJ",
    primarySignalScore: 7.5,
    secondaryEnvironmentCode: "NF/NT",
    secondarySignalScore: 2.5,
    coPresence: false,
    signalStrength: "strong",
    confidence: "high",
    diagnosticAnswerCount: undefined,
    evidenceConfidence: undefined,
    topEnvironmentCode: undefined,
  }),
  observation: Object.freeze({
    valid: true,
    answeredQuestionCount: 23,
    questionCount: 23,
    effectiveAnswerCount: 19,
    excludedAnswerCount: 4,
    totalEvidenceWeight: 19,
    environmentScores: { "NT/STJ": 7, "NT/STP": 4, "NF/NT": 5, "NF/SFJ": 1, "NF/SFP": 0, "SFJ/SFP": 1, "STJ/STP": 1, "STP/STJ": 0, "SFP/SFJ": 0 },
    weightedEnvironmentScores: { "NT/STJ": 7, "NT/STP": 4, "NF/NT": 5, "NF/SFJ": 1, "NF/SFP": 0, "SFJ/SFP": 1, "STJ/STP": 1, "STP/STJ": 0, "SFP/SFJ": 0 },
    primaryEnvironmentCode: "NT/STJ",
    primarySignalScore: 7,
    secondaryEnvironmentCode: "NF/NT",
    secondarySignalScore: 5,
    coPresence: true,
    signalStrength: "weak",
    confidence: "high",
    diagnosticAnswerCount: 19,
    evidenceConfidence: 12,
    topEnvironmentCode: "NT/STJ",
  }),
  level1: Object.freeze({
    valid: true,
    answeredQuestionCount: 12,
    questionCount: 12,
    effectiveAnswerCount: 12,
    excludedAnswerCount: 0,
    totalEvidenceWeight: 12,
    environmentScores: { "NT/STJ": 5, "NT/STP": 4, "NF/NT": 2, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 2, "STJ/STP": 1, "STP/STJ": 0, "SFP/SFJ": 2 },
    weightedEnvironmentScores: { "NT/STJ": 3.5, "NT/STP": 3, "NF/NT": 1.5, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 2, "STJ/STP": 0.5, "STP/STJ": 0, "SFP/SFJ": 1.5 },
    primaryEnvironmentCode: "NT/STJ",
    primarySignalScore: 3.5,
    secondaryEnvironmentCode: "NT/STP",
    secondarySignalScore: 3,
    coPresence: true,
    signalStrength: "weak",
    confidence: "high",
    diagnosticAnswerCount: undefined,
    evidenceConfidence: undefined,
    topEnvironmentCode: undefined,
  }),
  level2: Object.freeze({
    valid: true,
    answeredQuestionCount: 10,
    questionCount: 10,
    effectiveAnswerCount: 10,
    excludedAnswerCount: 0,
    totalEvidenceWeight: 10,
    environmentScores: { "NT/STJ": 1, "NT/STP": 2, "NF/NT": 2, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 2, "STJ/STP": 3, "STP/STJ": 0, "SFP/SFJ": 0 },
    weightedEnvironmentScores: { "NT/STJ": 1, "NT/STP": 2, "NF/NT": 2, "NF/SFJ": 0, "NF/SFP": 0, "SFJ/SFP": 2, "STJ/STP": 3, "STP/STJ": 0, "SFP/SFJ": 0 },
    primaryEnvironmentCode: "STJ/STP",
    primarySignalScore: 3,
    secondaryEnvironmentCode: "NF/NT",
    secondarySignalScore: 2,
    coPresence: true,
    signalStrength: "weak",
    confidence: "high",
    diagnosticAnswerCount: undefined,
    evidenceConfidence: undefined,
    topEnvironmentCode: undefined,
  }),
});

check("C3D-30", "TSAM remains deep-equal to the pre-C3-D baseline view", () => {
  const score = scoreTargetSelfAssessment(answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions));
  assert.deepEqual(targetBaselineView(score), TARGET_BASELINES.tsam);
});

check("C3D-31", "Target Observation remains deep-equal to the pre-C3-D baseline view", () => {
  const score = scoreTargetObservation(answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions));
  assert.deepEqual(targetBaselineView(score), TARGET_BASELINES.observation);
});

check("C3D-32", "Target Diagnostic / Step 2-B remains deep-equal to baseline views", () => {
  const level1 = scoreTargetDiagnosticLevel1(answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions));
  const level2 = scoreTargetDiagnosticQuestions(
    TARGET_DIAGNOSTIC_DATA.level2.questions,
    answersFor(TARGET_DIAGNOSTIC_DATA.level2.questions),
  );
  assert.deepEqual(targetBaselineView(level1), TARGET_BASELINES.level1);
  assert.deepEqual(targetBaselineView(level2), TARGET_BASELINES.level2);
});

check("C3D-33", "Observation Scope output is unchanged", () => {
  const scope = resolveObservationScope({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q1",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q1",
    respondent: { roleCode: "c_suite", seniorityLevel: "c_suite" },
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
  });
  assert.equal(scope.useClass, "PRIMARY");
  assert.equal(scope.comparisonEligible, true);
  assert.equal(scope.comparisonAvailability, "available");
  assert.equal(scope.routing, null);
  assert.equal(scope.audit.accessAdjudicated, false);
});

check("C3D-34", "Agent sources remain isolated from tenure weighting", () => {
  const agentSources = filesUnder("src/agent").map((path) => readFileSync(path, "utf8"));
  assert.ok(agentSources.length > 0);
  for (const source of agentSources) {
    assert.doesNotMatch(source, /firmTenureEvidenceMultiplier|respondentEvidenceMultiplier|acquirer-verification-tenure-required/);
  }
});

check("C3D-35", "AEM and total substantive questionnaire counts remain 11 and 67", () => {
  const runtime = questionnaireShapeRuntime();
  assert.equal(AEM_QUESTIONS.length, 11);
  assert.equal(runtime.reduce((sum, module) => sum + module.questions.length, 0), 67);
});

check("C3D-36", "Questionnaire content and order match the canonical generated structure", () => {
  const runtime = questionnaireShapeRuntime();
  const generated = questionnaireShapeGenerated();
  assert.deepEqual(runtime, generated);
  compatibilityEvidence.questionnaireHash = sha256(JSON.stringify(runtime));
});

check("C3D-37", "App production R2 flow is code gate → tenure gate → questionnaire", () => {
  const block = functionBlock(
    APP_SOURCE,
    "AuthorizedAcquirerVerificationScreen",
    "fieldLabel",
  );
  const codeGate = block.indexOf("if (!verified)");
  const tenureGate = block.indexOf("if (!tenureConfirmed)");
  const questionnaire = block.indexOf("<AcquirerVerificationQuestionnaire");
  assert.ok(codeGate >= 0 && tenureGate > codeGate && questionnaire > tenureGate);
  assert.match(block, /label=\{firmTenureSection\.label\}/);
  assert.match(block, /options=\{firmTenureSection\.options\}/);
  for (const value of TENURE_VALUES) {
    assert.equal(block.includes(`"${value}"`), false, `App must not duplicate ${value}`);
  }
});

check("C3D-38", "App has exactly one production completion call with fourth-argument metadata", () => {
  const callMatches = [...APP_SOURCE.matchAll(/completeAcquirerVerificationInvite\s*\(/g)];
  assert.equal(callMatches.length, 1);
  const open = APP_SOURCE.indexOf("(", callMatches[0].index);
  const close = matchingClose(APP_SOURCE, open);
  assert.ok(close > open);
  const args = topLevelArguments(APP_SOURCE.slice(open + 1, close));
  assert.equal(args.length, 4);
  assert.match(args[3], /firmTenure/);
  assert.doesNotMatch(args[1], /firmTenure/);
});

check("C3D-39", "R2 tenure vocabulary exactly matches the existing transaction-detail section", () => {
  assert.equal(TENURE_SECTION.label, "YOUR TENURE AT THE FIRM");
  assert.deepEqual(TENURE_VALUES, [SHORT_TENURE, MID_TENURE, LONG_TENURE]);
  assert.equal(new Set(TENURE_VALUES).size, 3);
});

check("C3D-40", "Completion payload transports respondentMetadata as an additive nested field", () => {
  const completion = completeAcquirerVerificationInvite(
    verificationInvite(),
    directAemAnswers(),
    COMPLETED_AT,
    { firmTenure: MID_TENURE },
  );
  const roundTrip = JSON.parse(JSON.stringify({
    assessmentSessionId: completion.invite.assessmentSessionId,
    acquirerVerificationSessionId: completion.invite.acquirerVerificationSessionId,
    completed: true,
    acquirerVerification: completion.invite.acquirerVerification,
  }));
  assert.equal(roundTrip.acquirerVerification.respondentMetadata.firmTenure, MID_TENURE);
  assert.match(APP_SOURCE, /acquirerVerification:\s*completedInvite\?\.acquirerVerification/);
});

check("C3D-41", "Package registers exactly the required C3-D validation command", () => {
  assert.equal(
    PACKAGE_JSON.scripts["validate:c3d-aem-tenure-weighting"],
    "node scripts/validate-c3d-aem-tenure-weighting.mjs",
  );
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
  console.error(`C3-D AEM tenure weighting validation failed: ${failures.length}/${checks.length} check(s) failed.`);
  process.exit(1);
}

console.log(`C3-D AEM tenure weighting validation passed: ${checks.length}/${checks.length}`);
console.log(`EVIDENCE gating ${JSON.stringify(gatingEvidence)}`);
console.log(`EVIDENCE weighting ${JSON.stringify(weightingEvidence)}`);
console.log(`EVIDENCE exact-half ${JSON.stringify(exactWeightEvidence)}`);
console.log(`EVIDENCE no-double ${JSON.stringify(noDoubleEvidence)}`);
console.log(`EVIDENCE compatibility ${JSON.stringify(compatibilityEvidence)}`);
