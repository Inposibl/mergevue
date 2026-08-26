import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import {
  classifyEvidenceCalibrationBand,
  evidenceCalibrationScoreForOption,
  EvidenceCalibrationError,
  isEvidenceCalibrationQuestion,
} from "../src/flow/evidenceCalibration.js";
import {
  evidenceClassifiedAnswer,
  evidenceTypeOptionsForQuestion,
  updateEvidenceAnswer,
  validateEvidenceClassifiedAnswer,
  validateEvidenceClassifiedAnswerForQuestion,
} from "../src/flow/evidenceClassification.js";
import { applyQuestionnaireSelectedOption } from "../src/flow/questionnaireAnswerSemanticState.js";
import { scoreTargetObservation } from "../src/flow/targetObservationFlow.js";
import { resolveObservationScope } from "../src/flow/observationScopeResolver.js";
import { scoreLayeredEvidenceQuestionSet } from "../src/flow/layeredEvidenceScoring.js";
import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import { normalizeEvidenceAnswer } from "../src/flow/evidenceClassification.js";

const questionnaires = JSON.parse(
  readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url), "utf8"),
);
const observationFlowSource = readFileSync(new URL("../src/flow/targetObservationFlow.js", import.meta.url), "utf8");
const exporterSource = readFileSync(new URL("./export_newlogic_json.py", import.meta.url), "utf8");

const PRE_ACT_CONTENT_DIGEST = "359c8ffc1835e970c940355a7dcaf3a302ac20c86b3a1a588e25729cd141fff3";
const INDEPENDENT_OPTION_SCORES = Object.freeze({ A: 3, B: 2, C: 1, D: 0 });
const INDEPENDENT_BANDS = Object.freeze({
  10: "High",
  12: "High",
  7: "Moderate",
  9: "Moderate",
  4: "Weak",
  6: "Weak",
  0: "Irrecoverable",
  3: "Irrecoverable",
});

const results = [];

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function sha256Hex(value) {
  return createHash("sha256").update(String(value ?? ""), "utf8").digest("hex");
}

function generatedQuestions() {
  const questions = [];
  for (const module of questionnaires.modules) {
    for (const question of module.questions ?? []) {
      questions.push({ moduleId: module.id, ...question });
    }
  }
  return questions;
}

function generatedEvidQuestions() {
  return generatedQuestions().filter((question) => question.questionType === "evidence_calibration");
}

function questionnaireContentRows(artifact) {
  const rows = [];
  for (const module of artifact.modules) {
    for (const question of module.questions ?? []) {
      rows.push({
        moduleId: module.id,
        id: question.id,
        workbookQuestionId: question.workbookQuestionId ?? "",
        promptSha256: sha256Hex(question.prompt ?? ""),
        options: (question.options ?? []).map((option) => ({
          value: option.value,
          textSha256: sha256Hex(option.text ?? ""),
        })),
      });
    }
  }
  return rows;
}

function runtimeEvidQuestions() {
  return TARGET_OBSERVATION_DIAGNOSTIC.questions.filter((question) => isEvidenceCalibrationQuestion(question));
}

function fillTargetObservation(evidByWorkbookId, tedOption = "A") {
  const answers = {};
  for (const question of TARGET_OBSERVATION_DIAGNOSTIC.questions) {
    if (isEvidenceCalibrationQuestion(question)) {
      answers[question.id] = evidenceClassifiedAnswer(evidByWorkbookId[question.workbookQuestionId]);
    } else {
      answers[question.id] = evidenceClassifiedAnswer(tedOption);
    }
  }
  return answers;
}

function layerBState(answer) {
  const normalized = normalizeEvidenceAnswer(answer);
  return {
    selectedOption: normalized.selectedOption,
    directObservationGate: normalized.directObservationGate,
    evidenceType: normalized.evidenceType,
    knowledgeLevel: normalized.knowledgeLevel,
    confidence: normalized.confidence,
    reliabilityFlags: [...normalized.reliabilityFlags],
    reliabilityFlagsAcknowledged: normalized.reliabilityFlagsAcknowledged,
  };
}

check("ECI-01", "exactly four EVID calibration questions exist", () => {
  const generated = generatedEvidQuestions();
  const runtime = runtimeEvidQuestions();
  assert.equal(generated.length, 4);
  assert.equal(runtime.length, 4);
  assert.deepEqual(generated.map((question) => question.workbookQuestionId), ["EVID Q1", "EVID Q2", "EVID Q3", "EVID Q4"]);
  assert.deepEqual(runtime.map((question) => question.workbookQuestionId), ["EVID Q1", "EVID Q2", "EVID Q3", "EVID Q4"]);
});

check("ECI-02", "each EVID option has independent explicit 3/2/1/0 mapping", () => {
  for (const question of generatedEvidQuestions()) {
    assert.deepEqual(question.options.map((option) => option.value), ["A", "B", "C", "D"]);
    for (const option of question.options) {
      assert.equal(
        option.evidenceCalibrationScore,
        INDEPENDENT_OPTION_SCORES[option.value],
        `${question.workbookQuestionId}-${option.value}`,
      );
    }
  }
});

check("ECI-03", "calibration scoring no longer parses confidenceImpact / +N", () => {
  assert.equal(observationFlowSource.includes("confidenceImpact"), false);
  assert.equal(observationFlowSource.includes("confidenceValue"), false);
  assert.doesNotMatch(observationFlowSource, /\\\+\(\\d\+\)/);
  assert.match(observationFlowSource, /evidenceCalibrationScoreForOption/);
  assert.match(exporterSource, /evidenceCalibrationScore/);
  assert.doesNotMatch(exporterSource, /confidenceImpact.*evidenceCalibrationScore/);
});

check("ECI-04", "all-A EVID score = 12", () => {
  const score = scoreTargetObservation(fillTargetObservation({
    "EVID Q1": "A",
    "EVID Q2": "A",
    "EVID Q3": "A",
    "EVID Q4": "A",
  }));
  assert.equal(score.evidenceConfidence, 12);
  assert.equal(score.valid, true);
  console.log("COUNTERFACTUAL A+A+A+A", {
    evidenceConfidence: score.evidenceConfidence,
    band: classifyEvidenceCalibrationBand(score.evidenceConfidence),
  });
});

check("ECI-05", "all-D EVID score = 0", () => {
  const score = scoreTargetObservation(fillTargetObservation({
    "EVID Q1": "D",
    "EVID Q2": "D",
    "EVID Q3": "D",
    "EVID Q4": "D",
  }));
  assert.equal(score.evidenceConfidence, 0);
  assert.equal(score.valid, true);
  console.log("COUNTERFACTUAL D+D+D+D", {
    evidenceConfidence: score.evidenceConfidence,
    band: classifyEvidenceCalibrationBand(score.evidenceConfidence),
  });
});

check("ECI-06", "Q4 A contributes 3, not 0", () => {
  const score = scoreTargetObservation(fillTargetObservation({
    "EVID Q1": "D",
    "EVID Q2": "D",
    "EVID Q3": "D",
    "EVID Q4": "A",
  }));
  assert.equal(score.evidenceConfidence, 3);
  const q4 = runtimeEvidQuestions().find((question) => question.workbookQuestionId === "EVID Q4");
  const optionA = q4.options.find((option) => option.value === "A");
  assert.equal(optionA.evidenceCalibrationScore, 3);
  assert.equal(evidenceCalibrationScoreForOption(optionA), 3);
  console.log("COUNTERFACTUAL EVID Q4=A", {
    evidenceCalibrationScore: optionA.evidenceCalibrationScore,
    total: score.evidenceConfidence,
  });
});

check("ECI-07", "High boundary: 10 and 12 → High", () => {
  assert.equal(INDEPENDENT_BANDS[10], "High");
  assert.equal(INDEPENDENT_BANDS[12], "High");
  assert.equal(classifyEvidenceCalibrationBand(10), "High");
  assert.equal(classifyEvidenceCalibrationBand(12), "High");
  const ten = scoreTargetObservation(fillTargetObservation({
    "EVID Q1": "A",
    "EVID Q2": "A",
    "EVID Q3": "A",
    "EVID Q4": "C",
  }));
  assert.equal(ten.evidenceConfidence, 10);
  assert.equal(classifyEvidenceCalibrationBand(ten.evidenceConfidence), "High");
  console.log("COUNTERFACTUAL 10 → High", { evidenceConfidence: ten.evidenceConfidence, band: "High" });
});

check("ECI-08", "Moderate boundary: 7 and 9 → Moderate", () => {
  assert.equal(INDEPENDENT_BANDS[7], "Moderate");
  assert.equal(INDEPENDENT_BANDS[9], "Moderate");
  assert.equal(classifyEvidenceCalibrationBand(7), "Moderate");
  assert.equal(classifyEvidenceCalibrationBand(9), "Moderate");
  const seven = scoreTargetObservation(fillTargetObservation({
    "EVID Q1": "A",
    "EVID Q2": "A",
    "EVID Q3": "C",
    "EVID Q4": "D",
  }));
  assert.equal(seven.evidenceConfidence, 7);
  assert.equal(classifyEvidenceCalibrationBand(seven.evidenceConfidence), "Moderate");
  console.log("COUNTERFACTUAL 7 → Moderate", { evidenceConfidence: seven.evidenceConfidence, band: "Moderate" });
});

check("ECI-09", "Weak boundary: 4 and 6 → Weak", () => {
  assert.equal(INDEPENDENT_BANDS[4], "Weak");
  assert.equal(INDEPENDENT_BANDS[6], "Weak");
  assert.equal(classifyEvidenceCalibrationBand(4), "Weak");
  assert.equal(classifyEvidenceCalibrationBand(6), "Weak");
});

check("ECI-10", "Irrecoverable boundary: 0 and 3 → Irrecoverable", () => {
  assert.equal(INDEPENDENT_BANDS[0], "Irrecoverable");
  assert.equal(INDEPENDENT_BANDS[3], "Irrecoverable");
  assert.equal(classifyEvidenceCalibrationBand(0), "Irrecoverable");
  assert.equal(classifyEvidenceCalibrationBand(3), "Irrecoverable");
});

check("ECI-11", "−1 and 13 fail closed", () => {
  assert.throws(() => classifyEvidenceCalibrationBand(-1), EvidenceCalibrationError);
  assert.throws(() => classifyEvidenceCalibrationBand(13), EvidenceCalibrationError);
});

check("ECI-12", "missing/malformed calibration field fails closed and is not a legitimate 0", () => {
  assert.equal(evidenceCalibrationScoreForOption({ evidenceCalibrationScore: 0 }), 0);
  let missingCode = null;
  try {
    evidenceCalibrationScoreForOption({});
  } catch (error) {
    assert.equal(error instanceof EvidenceCalibrationError, true);
    missingCode = error.code;
  }
  assert.equal(missingCode, "MISSING_CALIBRATION_SCORE");
  assert.throws(() => evidenceCalibrationScoreForOption({ evidenceCalibrationScore: "0" }), EvidenceCalibrationError);
  assert.throws(() => evidenceCalibrationScoreForOption({ evidenceCalibrationScore: 4 }), EvidenceCalibrationError);
  assert.throws(() => evidenceCalibrationScoreForOption({ evidenceCalibrationScore: 1.5 }), EvidenceCalibrationError);
});

check("ECI-13", "EVID questions have allowsUnknown=false", () => {
  for (const question of generatedEvidQuestions()) {
    assert.equal(question.allowsUnknown, false, `${question.id} generated`);
  }
  for (const question of runtimeEvidQuestions()) {
    assert.equal(question.allowsUnknown, false, `${question.id} runtime`);
  }
});

check("ECI-14", "question-aware validator rejects EVID evidenceType=unknown", () => {
  const question = runtimeEvidQuestions()[0];
  const answer = updateEvidenceAnswer({ selectedOption: "A" }, { evidenceType: "unknown" });
  const generic = validateEvidenceClassifiedAnswer(answer);
  const questionAware = validateEvidenceClassifiedAnswerForQuestion(question, answer);
  assert.equal(generic.valid, true);
  assert.equal(questionAware.valid, false);
  assert.ok(questionAware.consistencyIssues.some((issue) => /unknown/i.test(issue)));
  assert.equal(questionAware.normalized.selectedOption, "A");
});

check("ECI-15", "unknown remains available where a question permits it", () => {
  const permitted = { id: "Q1", allowsUnknown: true };
  const answer = updateEvidenceAnswer({ selectedOption: "E" }, { evidenceType: "unknown" });
  assert.equal(validateEvidenceClassifiedAnswerForQuestion(permitted, answer).valid, true);
  assert.equal(validateEvidenceClassifiedAnswerForQuestion({ id: "Q1" }, answer).valid, true);
  const permittedOptions = evidenceTypeOptionsForQuestion(permitted, "");
  assert.equal(permittedOptions.some((option) => option.value === "unknown"), true);
});

check("ECI-16", "EVID selected A with invalid unknown classification contributes no calibration points", () => {
  const answers = fillTargetObservation({
    "EVID Q1": "A",
    "EVID Q2": "A",
    "EVID Q3": "A",
    "EVID Q4": "A",
  });
  const evidQ1 = runtimeEvidQuestions().find((question) => question.workbookQuestionId === "EVID Q1");
  answers[evidQ1.id] = updateEvidenceAnswer({ selectedOption: "A" }, { evidenceType: "unknown" });
  const score = scoreTargetObservation(answers);
  assert.equal(normalizeEvidenceAnswer(answers[evidQ1.id]).selectedOption, "A");
  assert.equal(score.missingQuestionIds.includes(evidQ1.id), false);
  assert.equal(score.classificationValidation.valid, false);
  assert.equal(score.valid, false);
  assert.equal(score.evidenceConfidence, 9);
  console.log("INVALID-EVIDENCE NON-SCORING", {
    selectedOption: "A",
    evidenceType: "unknown",
    allowsUnknown: evidQ1.allowsUnknown,
    classificationValid: false,
    calibrationContribution: 0,
    remainingValidA: 9,
  });
});

check("ECI-17", "UI-facing option helper excludes Unknown only when allowsUnknown=false", () => {
  const excluded = evidenceTypeOptionsForQuestion({ allowsUnknown: false }, "");
  const permitted = evidenceTypeOptionsForQuestion({ allowsUnknown: true }, "");
  assert.equal(excluded.some((option) => option.value === "unknown"), false);
  assert.equal(permitted.some((option) => option.value === "unknown"), true);
  assert.equal(evidenceTypeOptionsForQuestion({ allowsUnknown: false }, "no").some((option) => option.value === "unknown"), false);
  assert.equal(evidenceTypeOptionsForQuestion({ allowsUnknown: true }, "no").some((option) => option.value === "unknown"), true);
});

check("ECI-18", "questionnaire substantive profile remains identical", () => {
  const questions = generatedQuestions();
  assert.equal(questions.length, 67);
  const currentDigest = sha256Hex(JSON.stringify(questionnaireContentRows(questionnaires)));
  assert.equal(currentDigest, PRE_ACT_CONTENT_DIGEST);
  for (const question of questions) {
    if (question.questionType === "evidence_calibration") continue;
    for (const option of question.options ?? []) {
      assert.equal(Object.hasOwn(option, "evidenceCalibrationScore"), false, `${question.id}-${option.value}`);
    }
  }
});

check("ECI-19", "C1 Q11-E/Q11-F generated/runtime invariants remain unchanged", () => {
  for (const id of ["ACQUIRERENVIRONMENT-Q11", "TARGETSELFASSESSMENT-Q11"]) {
    const question = generatedQuestions().find((item) => item.id === id);
    const optionE = question.options.find((option) => option.value === "E");
    const optionF = question.options.find((option) => option.value === "F");
    assert.deepEqual([...optionE.internalEnvironmentSignals], ["SFP/SFJ", "STJ/STP"]);
    assert.equal(optionE.excludedFromPrimaryScoring, false);
    assert.equal(optionF.excludedFromPrimaryScoring, true);
    const moduleId = id.startsWith("ACQUIRER") ? "acquirerEnvironment" : "targetSelfAssessment";
    const semanticE = resolveObservationScope({
      moduleId,
      canonicalQuestionId: id,
      workbookQuestionId: "Q11",
      respondent: { roleCode: "c_suite", seniorityLevel: "c_suite" },
      selectedOption: "E",
      directObservationGate: "yes",
      evidenceType: "direct_observation",
      reliabilityFlags: [],
    }).semanticClass;
    const semanticF = resolveObservationScope({
      moduleId,
      canonicalQuestionId: id,
      workbookQuestionId: "Q11",
      respondent: { roleCode: "c_suite", seniorityLevel: "c_suite" },
      selectedOption: "F",
      directObservationGate: "yes",
      evidenceType: "direct_observation",
      reliabilityFlags: [],
    }).semanticClass;
    assert.equal(semanticE, "SUBSTANTIVE_SIGNAL");
    assert.equal(semanticF, "OBSERVATION_GAP");
    const runtimeQuestions = moduleId === "acquirerEnvironment"
      ? ACQUIRER_TRACK_DATA.acquirerModule.questions
      : TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions;
    const runtimeQ11 = runtimeQuestions.find((item) => item.id === "Q11");
    const scoredE = scoreLayeredEvidenceQuestionSet(
      [runtimeQ11],
      { Q11: evidenceClassifiedAnswer("E") },
      { respondentSide: moduleId === "acquirerEnvironment" ? "acquirer" : "target", moduleId },
    ).questionResponses[0];
    assert.ok(scoredE.weight > 0);
    assert.equal(scoredE.excludedFromPrimaryScoring, false);
  }
});

check("ECI-20", "C1 explicit + default history-independence remains unchanged", () => {
  const question = generatedQuestions().find((item) => item.id === "ACQUIRERENVIRONMENT-Q11");
  const explicit = {
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    knowledgeLevel: "first_hand",
    confidence: "high",
  };
  const seed = updateEvidenceAnswer({}, explicit);
  const pathA = layerBState(applyQuestionnaireSelectedOption(seed, question, "A"));
  const pathEA = layerBState(applyQuestionnaireSelectedOption(
    applyQuestionnaireSelectedOption(seed, question, "E"),
    question,
    "A",
  ));
  const pathFA = layerBState(applyQuestionnaireSelectedOption(
    applyQuestionnaireSelectedOption(seed, question, "F"),
    question,
    "A",
  ));
  assert.deepEqual(pathEA, pathA);
  assert.deepEqual(pathFA, pathA);
  const defaultA = layerBState(applyQuestionnaireSelectedOption({}, question, "A"));
  const defaultEA = layerBState(applyQuestionnaireSelectedOption(
    applyQuestionnaireSelectedOption({}, question, "E"),
    question,
    "A",
  ));
  const defaultFA = layerBState(applyQuestionnaireSelectedOption(
    applyQuestionnaireSelectedOption({}, question, "F"),
    question,
    "A",
  ));
  assert.deepEqual(defaultEA, defaultA);
  assert.deepEqual(defaultFA, defaultA);
  assert.equal(defaultA.evidenceType, "");
});

console.log("EVID calibration integrity cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
