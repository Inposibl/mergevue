import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import {
  evidenceClassifiedAnswer,
  normalizeEvidenceAnswer,
  updateEvidenceAnswer,
} from "../src/flow/evidenceClassification.js";
import { scoreLayeredEvidenceQuestionSet } from "../src/flow/layeredEvidenceScoring.js";
import { resolveObservationScope } from "../src/flow/observationScopeResolver.js";
import {
  applyQuestionnaireSelectedOption,
  selectedOptionPatch,
} from "../src/flow/questionnaireAnswerSemanticState.js";

const questionnaires = JSON.parse(
  readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url), "utf8"),
);
const exporterSource = readFileSync(new URL("./export_newlogic_json.py", import.meta.url), "utf8");
const helperSource = readFileSync(
  new URL("../src/flow/questionnaireAnswerSemanticState.js", import.meta.url),
  "utf8",
);
const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

const PRE_C1_COMMIT = "cef079a200d87c5ef99bcb72ae14cfc187d18d66";
const PRE_ACT_CONTENT_DIGEST = "359c8ffc1835e970c940355a7dcaf3a302ac20c86b3a1a588e25729cd141fff3";
const AUTHORIZED_EXCLUSION_DELTA = Object.freeze([
  Object.freeze({ id: "ACQUIRERENVIRONMENT-Q11", value: "E" }),
  Object.freeze({ id: "TARGETSELFASSESSMENT-Q11", value: "E" }),
]);
const VERIFIER_NON_PRIMARY_RECORDS = Object.freeze([
  Object.freeze({
    id: "ACQUIRERENVIRONMENT-Q6",
    value: "E",
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q6",
    expectedSemanticClass: "EXTERNAL_OR_PERSONAL_CAUSE",
    respondentSide: "acquirer",
  }),
  Object.freeze({
    id: "ACQUIRERENVIRONMENT-Q8",
    value: "F",
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q8",
    expectedSemanticClass: "STRUCTURAL_PRECONDITION_ABSENCE",
    respondentSide: "acquirer",
  }),
  Object.freeze({
    id: "ACQUIRERENVIRONMENT-Q9",
    value: "E",
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q9",
    expectedSemanticClass: "EVENT_ABSENCE",
    respondentSide: "acquirer",
  }),
  Object.freeze({
    id: "ACQUIRERENVIRONMENT-Q9",
    value: "F",
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q9",
    expectedSemanticClass: "OBSERVATION_GAP",
    respondentSide: "acquirer",
  }),
  Object.freeze({
    id: "TARGETSELFASSESSMENT-Q6",
    value: "E",
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q6",
    expectedSemanticClass: "EXTERNAL_OR_PERSONAL_CAUSE",
    respondentSide: "target",
  }),
  Object.freeze({
    id: "TARGETSELFASSESSMENT-Q8",
    value: "F",
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q8",
    expectedSemanticClass: "STRUCTURAL_PRECONDITION_ABSENCE",
    respondentSide: "target",
  }),
  Object.freeze({
    id: "TARGETSELFASSESSMENT-Q9",
    value: "E",
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q9",
    expectedSemanticClass: "EVENT_ABSENCE",
    respondentSide: "target",
  }),
  Object.freeze({
    id: "TARGETSELFASSESSMENT-Q9",
    value: "F",
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q9",
    expectedSemanticClass: "OBSERVATION_GAP",
    respondentSide: "target",
  }),
  Object.freeze({
    id: "ENVIRONMENTLEVEL1-Q3",
    value: "E",
    moduleId: "environmentLevel1",
    workbookQuestionId: "Q3",
    expectedSemanticClass: null,
    respondentSide: "acquirer",
  }),
  Object.freeze({
    id: "ENVIRONMENTLEVEL1-Q11",
    value: "E",
    moduleId: "environmentLevel1",
    workbookQuestionId: "Q11",
    expectedSemanticClass: null,
    respondentSide: "acquirer",
  }),
]);
const SENIOR_RESPONDENT = Object.freeze({ roleCode: "c_suite", seniorityLevel: "c_suite" });
const PRE_ACT_QUESTION_IDS = Object.freeze([
  "ACQUIRERENVIRONMENT-Q1",
  "ACQUIRERENVIRONMENT-Q2",
  "ACQUIRERENVIRONMENT-Q3",
  "ACQUIRERENVIRONMENT-Q4",
  "ACQUIRERENVIRONMENT-Q5",
  "ACQUIRERENVIRONMENT-Q6",
  "ACQUIRERENVIRONMENT-Q7",
  "ACQUIRERENVIRONMENT-Q8",
  "ACQUIRERENVIRONMENT-Q9",
  "ACQUIRERENVIRONMENT-Q10",
  "ACQUIRERENVIRONMENT-Q11",
  "TARGETSELFASSESSMENT-Q1",
  "TARGETSELFASSESSMENT-Q2",
  "TARGETSELFASSESSMENT-Q3",
  "TARGETSELFASSESSMENT-Q4",
  "TARGETSELFASSESSMENT-Q5",
  "TARGETSELFASSESSMENT-Q6",
  "TARGETSELFASSESSMENT-Q7",
  "TARGETSELFASSESSMENT-Q8",
  "TARGETSELFASSESSMENT-Q9",
  "TARGETSELFASSESSMENT-Q10",
  "TARGETSELFASSESSMENT-Q11",
  "ENVIRONMENTLEVEL1-Q1",
  "ENVIRONMENTLEVEL1-Q2",
  "ENVIRONMENTLEVEL1-Q3",
  "ENVIRONMENTLEVEL1-Q4",
  "ENVIRONMENTLEVEL1-Q5",
  "ENVIRONMENTLEVEL1-Q6",
  "ENVIRONMENTLEVEL1-Q7",
  "ENVIRONMENTLEVEL1-Q8",
  "ENVIRONMENTLEVEL1-Q9",
  "ENVIRONMENTLEVEL1-Q10",
  "ENVIRONMENTLEVEL1-Q11",
  "ENVIRONMENTLEVEL1-Q12",
  "ENVIRONMENTLEVEL2-Q13",
  "ENVIRONMENTLEVEL2-Q14",
  "ENVIRONMENTLEVEL2-Q15",
  "ENVIRONMENTLEVEL2-Q16",
  "ENVIRONMENTLEVEL2-Q17",
  "ENVIRONMENTLEVEL2-Q18",
  "ENVIRONMENTLEVEL2-Q19",
  "ENVIRONMENTLEVEL2-Q20",
  "ENVIRONMENTLEVEL2-Q21",
  "ENVIRONMENTLEVEL2-Q22",
  "TGT-OBS-EVID-Q1",
  "TGT-OBS-EVID-Q2",
  "TGT-OBS-EVID-Q3",
  "TGT-OBS-EVID-Q4",
  "TGT-OBS-TED-Q1",
  "TGT-OBS-TED-Q2",
  "TGT-OBS-TED-Q3",
  "TGT-OBS-TED-Q4",
  "TGT-OBS-TED-Q5",
  "TGT-OBS-TED-Q6",
  "TGT-OBS-TED-Q7",
  "TGT-OBS-TED-Q8",
  "TGT-OBS-TED-Q9",
  "TGT-OBS-TED-Q10",
  "TGT-OBS-TED-Q11",
  "TGT-OBS-TED-Q12",
  "TGT-OBS-TED-Q13",
  "TGT-OBS-TED-Q14",
  "TGT-OBS-TED-Q15",
  "TGT-OBS-TED-Q16",
  "TGT-OBS-TED-Q17",
  "TGT-OBS-TED-Q18",
  "TGT-OBS-TED-Q19",
]);
const PRE_ACT_OPTION_ORDER = Object.freeze({
  "ACQUIRERENVIRONMENT-Q1": "ABCDE",
  "ACQUIRERENVIRONMENT-Q2": "ABCDE",
  "ACQUIRERENVIRONMENT-Q3": "ABCDE",
  "ACQUIRERENVIRONMENT-Q4": "ABCDE",
  "ACQUIRERENVIRONMENT-Q5": "ABCDE",
  "ACQUIRERENVIRONMENT-Q6": "ABCDEF",
  "ACQUIRERENVIRONMENT-Q7": "ABCDE",
  "ACQUIRERENVIRONMENT-Q8": "ABCDEF",
  "ACQUIRERENVIRONMENT-Q9": "ABCDEF",
  "ACQUIRERENVIRONMENT-Q10": "ABCDE",
  "ACQUIRERENVIRONMENT-Q11": "ABCDEF",
  "TARGETSELFASSESSMENT-Q1": "ABCDE",
  "TARGETSELFASSESSMENT-Q2": "ABCDE",
  "TARGETSELFASSESSMENT-Q3": "ABCDE",
  "TARGETSELFASSESSMENT-Q4": "ABCDE",
  "TARGETSELFASSESSMENT-Q5": "ABCDE",
  "TARGETSELFASSESSMENT-Q6": "ABCDEF",
  "TARGETSELFASSESSMENT-Q7": "ABCDE",
  "TARGETSELFASSESSMENT-Q8": "ABCDEF",
  "TARGETSELFASSESSMENT-Q9": "ABCDEF",
  "TARGETSELFASSESSMENT-Q10": "ABCDE",
  "TARGETSELFASSESSMENT-Q11": "ABCDEF",
  "ENVIRONMENTLEVEL1-Q1": "ABCDE",
  "ENVIRONMENTLEVEL1-Q2": "ABCDE",
  "ENVIRONMENTLEVEL1-Q3": "ABCDE",
  "ENVIRONMENTLEVEL1-Q4": "ABCDE",
  "ENVIRONMENTLEVEL1-Q5": "ABCDE",
  "ENVIRONMENTLEVEL1-Q6": "ABCDE",
  "ENVIRONMENTLEVEL1-Q7": "ABCDE",
  "ENVIRONMENTLEVEL1-Q8": "ABCDE",
  "ENVIRONMENTLEVEL1-Q9": "ABCDE",
  "ENVIRONMENTLEVEL1-Q10": "ABCDE",
  "ENVIRONMENTLEVEL1-Q11": "ABCDEF",
  "ENVIRONMENTLEVEL1-Q12": "ABCDE",
  "ENVIRONMENTLEVEL2-Q13": "ABCDE",
  "ENVIRONMENTLEVEL2-Q14": "ABCDE",
  "ENVIRONMENTLEVEL2-Q15": "ABCDE",
  "ENVIRONMENTLEVEL2-Q16": "ABCDE",
  "ENVIRONMENTLEVEL2-Q17": "ABCDE",
  "ENVIRONMENTLEVEL2-Q18": "ABCDE",
  "ENVIRONMENTLEVEL2-Q19": "ABCDE",
  "ENVIRONMENTLEVEL2-Q20": "ABCDE",
  "ENVIRONMENTLEVEL2-Q21": "ABCDE",
  "ENVIRONMENTLEVEL2-Q22": "ABCDE",
  "TGT-OBS-EVID-Q1": "ABCD",
  "TGT-OBS-EVID-Q2": "ABCD",
  "TGT-OBS-EVID-Q3": "ABCD",
  "TGT-OBS-EVID-Q4": "ABCD",
  "TGT-OBS-TED-Q1": "ABCDE",
  "TGT-OBS-TED-Q2": "ABCDE",
  "TGT-OBS-TED-Q3": "ABCDE",
  "TGT-OBS-TED-Q4": "ABCDE",
  "TGT-OBS-TED-Q5": "ABCDE",
  "TGT-OBS-TED-Q6": "ABCDE",
  "TGT-OBS-TED-Q7": "ABCDE",
  "TGT-OBS-TED-Q8": "ABCDE",
  "TGT-OBS-TED-Q9": "ABCDE",
  "TGT-OBS-TED-Q10": "ABCDE",
  "TGT-OBS-TED-Q11": "ABCDE",
  "TGT-OBS-TED-Q12": "ABCDE",
  "TGT-OBS-TED-Q13": "ABCDE",
  "TGT-OBS-TED-Q14": "ABCDE",
  "TGT-OBS-TED-Q15": "ABCDE",
  "TGT-OBS-TED-Q16": "ABCDE",
  "TGT-OBS-TED-Q17": "ABCDE",
  "TGT-OBS-TED-Q18": "ABCDE",
  "TGT-OBS-TED-Q19": "ABCDE",
});

const EXPLICIT_EVIDENCE = Object.freeze({
  directObservationGate: "yes",
  evidenceType: "direct_observation",
  knowledgeLevel: "first_hand",
  confidence: "high",
});

const HEURISTIC_QUESTION = Object.freeze({
  id: "ASI-HEURISTIC",
  options: Object.freeze([
    Object.freeze({ value: "A", text: "Ordinary substantive answer", excludedFromPrimaryScoring: false }),
    Object.freeze({
      value: "E",
      text: "Letter E with substantive environment meaning",
      excludedFromPrimaryScoring: false,
      internalEnvironmentSignals: Object.freeze(["STJ/STP", "SFP/SFJ"]),
    }),
    Object.freeze({
      value: "F",
      text: "I cannot answer from direct observation.",
      excludedFromPrimaryScoring: true,
    }),
    Object.freeze({
      value: "X",
      text: "cannot answer / no direct observation / unknown",
      excludedFromPrimaryScoring: true,
    }),
  ]),
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

function sourceDerivedExclusion(option) {
  return String(option?.scoringNote ?? "").toLowerCase().includes("excluded from primary scoring");
}

function findGeneratedQuestion(id) {
  const question = generatedQuestions().find((item) => item.id === id);
  assert.ok(question, `generated question missing: ${id}`);
  return question;
}

function findOption(question, value) {
  const option = (question.options ?? []).find((item) => item.value === value);
  assert.ok(option, `${question.id} missing option ${value}`);
  return option;
}

function optionRelevantFields(option) {
  return {
    value: option.value,
    text: option.text,
    internalEnvironmentSignals: [...(option.internalEnvironmentSignals ?? [])],
    publicEnvironmentSignals: [...(option.publicEnvironmentSignals ?? [])],
    scoringNote: option.scoringNote,
    excludedFromPrimaryScoring: option.excludedFromPrimaryScoring,
  };
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

function assertPatchIsOptionOnly(patch, label) {
  assert.equal(Object.keys(patch).join(","), "selectedOption", `${label}: patch keys`);
  assert.equal(Object.hasOwn(patch, "evidenceType"), false, `${label}: evidenceType must be absent from option patch`);
  assert.equal(Object.hasOwn(patch, "directObservationGate"), false, `${label}: gate must be absent from option patch`);
  assert.equal(Object.hasOwn(patch, "knowledgeLevel"), false, `${label}: knowledgeLevel must be absent from option patch`);
  assert.equal(Object.hasOwn(patch, "confidence"), false, `${label}: confidence must be absent from option patch`);
  assert.equal(Object.hasOwn(patch, "reliabilityFlags"), false, `${label}: reliabilityFlags must be absent from option patch`);
}

function seededExplicitAnswer() {
  return updateEvidenceAnswer({}, EXPLICIT_EVIDENCE);
}

function selectPath(question, values, seed = seededExplicitAnswer()) {
  return values.reduce(
    (answer, value) => applyQuestionnaireSelectedOption(answer, question, value),
    seed,
  );
}

function exclusionKey(questionId, value) {
  return `${questionId}|${value}`;
}

function generatedExclusionMap(artifact) {
  const map = new Map();
  for (const module of artifact.modules ?? []) {
    for (const question of module.questions ?? []) {
      for (const option of question.options ?? []) {
        map.set(exclusionKey(question.id, option.value), option.excludedFromPrimaryScoring === true);
      }
    }
  }
  return map;
}

function loadCommittedPreC1Questionnaires() {
  const raw = execFileSync(
    "git",
    ["show", `${PRE_C1_COMMIT}:src/generated/newlogic/questionnaires.json`],
    { encoding: "utf8", cwd: fileURLToPath(new URL("..", import.meta.url)) },
  );
  return JSON.parse(raw);
}

function runtimeQuestion(moduleId, workbookQuestionId) {
  const questions = {
    acquirerEnvironment: ACQUIRER_TRACK_DATA.acquirerModule.questions,
    targetSelfAssessment: TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions,
    environmentLevel1: TARGET_DIAGNOSTIC_DATA.level1.questions,
  }[moduleId];
  const question = questions?.find((item) => item.id === workbookQuestionId);
  assert.ok(question, `runtime question missing: ${moduleId} ${workbookQuestionId}`);
  return question;
}

function scoredResponse(moduleId, workbookQuestionId, optionValue, respondentSide) {
  const question = runtimeQuestion(moduleId, workbookQuestionId);
  const score = scoreLayeredEvidenceQuestionSet(
    [question],
    { [question.id]: evidenceClassifiedAnswer(optionValue) },
    { respondentSide, moduleId },
  );
  const response = score.questionResponses[0];
  assert.ok(response, `missing scored response for ${moduleId} ${workbookQuestionId}-${optionValue}`);
  return response;
}

function dualSemanticClass(moduleId, canonicalQuestionId, workbookQuestionId, optionValue) {
  return resolveObservationScope({
    moduleId,
    canonicalQuestionId,
    workbookQuestionId,
    respondent: SENIOR_RESPONDENT,
    selectedOption: optionValue,
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
  }).semanticClass;
}

check("ASI-01", "Question selection itself does not set Layer-B evidenceType=unknown", () => {
  const patch = selectedOptionPatch(HEURISTIC_QUESTION, "A");
  assertPatchIsOptionOnly(patch, "ASI-01 A");
  assert.equal(patch.selectedOption, "A");
  const applied = applyQuestionnaireSelectedOption({}, HEURISTIC_QUESTION, "A");
  const state = layerBState(applied);
  assert.equal(state.selectedOption, "A");
  assert.notEqual(state.evidenceType, "unknown");
  assert.equal(state.evidenceType, "");
  assert.equal(state.directObservationGate, "");
});

check("ASI-02", "E/F letters themselves are not evidence provenance", () => {
  for (const value of ["E", "F"]) {
    const patch = selectedOptionPatch(HEURISTIC_QUESTION, value);
    assertPatchIsOptionOnly(patch, `ASI-02 ${value}`);
    assert.equal(patch.selectedOption, value);
    const applied = applyQuestionnaireSelectedOption({}, HEURISTIC_QUESTION, value);
    const state = layerBState(applied);
    assert.equal(state.selectedOption, value);
    assert.notEqual(state.evidenceType, "unknown");
    assert.equal(state.evidenceType, "");
    assert.equal(state.directObservationGate, "");
  }
  assert.doesNotMatch(
    exporterSource,
    /excludedFromPrimaryScoring": value in \("E", "F"\)/,
  );
  assert.match(
    exporterSource,
    /len\(signals\) == 0 or explicit_source_primary_exclusion\(signal_text\)/,
  );
  assert.equal(helperSource.includes("evidenceType"), false);
  assert.equal(appSource.includes("cannotAnswer"), false);
});

check("ASI-03", "excludedFromPrimaryScoring itself is not evidenceType=unknown", () => {
  const excludedOptionQuestion = Object.freeze({
    id: "ASI-EXCLUDED-FLAG",
    options: Object.freeze([
      Object.freeze({
        value: "A",
        text: "Ordinary substantive answer with an exclusion flag only",
        excludedFromPrimaryScoring: true,
      }),
    ]),
  });
  const patch = selectedOptionPatch(excludedOptionQuestion, "A");
  assertPatchIsOptionOnly(patch, "ASI-03");
  const applied = applyQuestionnaireSelectedOption({}, excludedOptionQuestion, "A");
  const state = layerBState(applied);
  assert.equal(state.selectedOption, "A");
  assert.notEqual(state.evidenceType, "unknown");
  assert.equal(state.evidenceType, "");
});

check("ASI-04", "Display text regex does not determine evidence state", () => {
  const patch = selectedOptionPatch(HEURISTIC_QUESTION, "X");
  assertPatchIsOptionOnly(patch, "ASI-04");
  const applied = applyQuestionnaireSelectedOption({}, HEURISTIC_QUESTION, "X");
  const state = layerBState(applied);
  assert.equal(state.selectedOption, "X");
  assert.notEqual(state.evidenceType, "unknown");
  assert.equal(state.evidenceType, "");
  assert.equal(state.directObservationGate, "");
});

check("ASI-05", "Q11-E AEM+TSAM keep substantive signals and generated exclusion=false", () => {
  for (const id of ["ACQUIRERENVIRONMENT-Q11", "TARGETSELFASSESSMENT-Q11"]) {
    const question = findGeneratedQuestion(id);
    const optionE = findOption(question, "E");
    assert.deepEqual([...optionE.internalEnvironmentSignals], ["SFP/SFJ", "STJ/STP"]);
    assert.deepEqual([...optionE.publicEnvironmentSignals], ["The Franchise Machine", "The Power Racket"]);
    assert.equal(optionE.scoringNote, "STJ/STP · SFP/SFJ");
    assert.equal(optionE.excludedFromPrimaryScoring, false);
    assert.equal(sourceDerivedExclusion(optionE), false);
    const moduleId = question.moduleId;
    const semanticClass = dualSemanticClass(moduleId, question.id, "Q11", "E");
    assert.equal(semanticClass, "SUBSTANTIVE_SIGNAL", `${id}-E semanticClass`);
    const scored = scoredResponse(moduleId, "Q11", "E", moduleId === "acquirerEnvironment" ? "acquirer" : "target");
    assert.equal(scored.excludedFromPrimaryScoring, false, `${id}-E runtime exclusion`);
    assert.ok(scored.weight > 0, `${id}-E runtime weight must be primary-eligible`);
    console.log(`${id}-E generated fields`, JSON.stringify(optionRelevantFields(optionE), null, 2));
    console.log(`${id}-E runtime`, JSON.stringify({
      weight: scored.weight,
      excludedFromPrimaryScoring: scored.excludedFromPrimaryScoring,
      signalCodes: scored.signalCodes,
      semanticClass,
    }, null, 2));
  }
});

check("ASI-06", "Q11-F AEM+TSAM keep OBSERVATION_GAP and generated exclusion=true", () => {
  for (const id of ["ACQUIRERENVIRONMENT-Q11", "TARGETSELFASSESSMENT-Q11"]) {
    const question = findGeneratedQuestion(id);
    const optionF = findOption(question, "F");
    assert.deepEqual([...(optionF.internalEnvironmentSignals ?? [])], []);
    assert.equal(sourceDerivedExclusion(optionF), true);
    assert.equal(optionF.excludedFromPrimaryScoring, true);
    assert.match(String(optionF.scoringNote), /excluded from primary scoring/i);
    assert.match(String(optionF.text), /cannot answer from direct observation/i);
    const moduleId = question.moduleId;
    const semanticClass = dualSemanticClass(moduleId, question.id, "Q11", "F");
    assert.equal(semanticClass, "OBSERVATION_GAP", `${id}-F semanticClass`);
    const scored = scoredResponse(moduleId, "Q11", "F", moduleId === "acquirerEnvironment" ? "acquirer" : "target");
    assert.equal(scored.weight, 0, `${id}-F runtime weight`);
    assert.equal(scored.excludedFromPrimaryScoring, true, `${id}-F runtime exclusion`);
    console.log(`${id}-F generated fields`, JSON.stringify(optionRelevantFields(optionF), null, 2));
    console.log(`${id}-F runtime`, JSON.stringify({
      weight: scored.weight,
      excludedFromPrimaryScoring: scored.excludedFromPrimaryScoring,
      semanticClass,
    }, null, 2));
  }
});

check("ASI-07", "fresh→A and fresh→E→A yield identical normalized answer state", () => {
  const question = findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11");
  const pathA = selectPath(question, ["A"]);
  const pathEA = selectPath(question, ["E", "A"]);
  const stateA = layerBState(pathA);
  const stateEA = layerBState(pathEA);
  console.log("COUNTERFACTUAL fresh→A", JSON.stringify(stateA, null, 2));
  console.log("COUNTERFACTUAL fresh→E→A", JSON.stringify(stateEA, null, 2));
  assert.deepEqual(stateEA, stateA);
  assert.equal(stateA.selectedOption, "A");
  assert.equal(stateA.directObservationGate, "yes");
  assert.equal(stateA.evidenceType, "direct_observation");
  assert.equal(stateA.knowledgeLevel, "first_hand");
  assert.equal(stateA.confidence, "high");
});

check("ASI-08", "fresh→A and fresh→F→A yield identical normalized answer state", () => {
  const question = findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11");
  const pathA = selectPath(question, ["A"]);
  const pathFA = selectPath(question, ["F", "A"]);
  const stateA = layerBState(pathA);
  const stateFA = layerBState(pathFA);
  console.log("COUNTERFACTUAL fresh→F→A", JSON.stringify(stateFA, null, 2));
  assert.deepEqual(stateFA, stateA);
  assert.equal(stateA.selectedOption, "A");
  assert.equal(stateA.directObservationGate, "yes");
  assert.equal(stateA.evidenceType, "direct_observation");
  assert.equal(stateA.knowledgeLevel, "first_hand");
  assert.equal(stateA.confidence, "high");
});

check("ASI-07-DEFAULT", "default-state fresh→A and fresh→E→A are identical", () => {
  const question = findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11");
  const stateA = layerBState(selectPath(question, ["A"], {}));
  const stateEA = layerBState(selectPath(question, ["E", "A"], {}));
  console.log("DEFAULT COUNTERFACTUAL fresh→A", JSON.stringify(stateA, null, 2));
  console.log("DEFAULT COUNTERFACTUAL fresh→E→A", JSON.stringify(stateEA, null, 2));
  assert.deepEqual(stateEA, stateA);
  assert.equal(stateA.selectedOption, "A");
  assert.equal(stateA.directObservationGate, "");
  assert.equal(stateA.evidenceType, "");
  assert.equal(stateA.knowledgeLevel, "");
  assert.equal(stateA.confidence, "");
  assert.deepEqual(stateA.reliabilityFlags, []);
});

check("ASI-08-DEFAULT", "default-state fresh→A and fresh→F→A are identical", () => {
  const question = findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11");
  const stateA = layerBState(selectPath(question, ["A"], {}));
  const stateFA = layerBState(selectPath(question, ["F", "A"], {}));
  console.log("DEFAULT COUNTERFACTUAL fresh→F→A", JSON.stringify(stateFA, null, 2));
  assert.deepEqual(stateFA, stateA);
  assert.equal(stateA.selectedOption, "A");
  assert.equal(stateA.evidenceType, "");
});

check("ASI-09", "67 substantive questions are preserved", () => {
  const questions = generatedQuestions();
  assert.equal(questions.length, 67);
  assert.deepEqual(questions.map((question) => question.id), [...PRE_ACT_QUESTION_IDS]);
});

check("ASI-10", "prompt / option text / option order remain identical to pre-act baseline", () => {
  const questions = generatedQuestions();
  for (const question of questions) {
    const optionOrder = (question.options ?? []).map((option) => option.value).join("");
    assert.equal(
      optionOrder,
      PRE_ACT_OPTION_ORDER[question.id],
      `${question.id}: option order drift`,
    );
  }
  const currentDigest = sha256Hex(JSON.stringify(questionnaireContentRows(questionnaires)));
  assert.equal(currentDigest, PRE_ACT_CONTENT_DIGEST);
});

check("ASI-EXCL-BASELINE", "generated exclusion set differs from committed pre-C1 only on the two authorized Q11-E records", () => {
  const preC1 = generatedExclusionMap(loadCommittedPreC1Questionnaires());
  const current = generatedExclusionMap(questionnaires);
  assert.deepEqual([...current.keys()].sort(), [...preC1.keys()].sort(), "option membership drift vs pre-C1");
  const authorized = new Set(AUTHORIZED_EXCLUSION_DELTA.map((item) => exclusionKey(item.id, item.value)));
  const diffs = [];
  for (const key of current.keys()) {
    if (preC1.get(key) !== current.get(key)) diffs.push(key);
  }
  assert.deepEqual(diffs.sort(), [...authorized].sort());
  for (const key of authorized) {
    assert.equal(preC1.get(key), true, `${key} pre-C1 exclusion`);
    assert.equal(current.get(key), false, `${key} current exclusion`);
  }
  console.log("EXCLUSION DELTA vs pre-C1", diffs);
});

check("ASI-TEN", "verifier-identified non-primary records have generated exclusion=true and scorer weight 0", () => {
  const matrix = [];
  for (const record of VERIFIER_NON_PRIMARY_RECORDS) {
    const generated = findOption(findGeneratedQuestion(record.id), record.value);
    assert.equal(generated.excludedFromPrimaryScoring, true, `${record.id}-${record.value} generated exclusion`);
    assert.deepEqual([...(generated.internalEnvironmentSignals ?? [])], []);
    const scored = scoredResponse(record.moduleId, record.workbookQuestionId, record.value, record.respondentSide);
    assert.equal(scored.weight, 0, `${record.id}-${record.value} scorer weight`);
    assert.equal(scored.excludedFromPrimaryScoring, true, `${record.id}-${record.value} runtime exclusion`);
    let semanticClass = record.expectedSemanticClass;
    if (record.expectedSemanticClass) {
      semanticClass = dualSemanticClass(record.moduleId, record.id, record.workbookQuestionId, record.value);
      assert.equal(semanticClass, record.expectedSemanticClass, `${record.id}-${record.value} semanticClass`);
    }
    matrix.push({
      id: record.id,
      value: record.value,
      generatedExclusion: generated.excludedFromPrimaryScoring,
      weight: scored.weight,
      runtimeExclusion: scored.excludedFromPrimaryScoring,
      semanticClass,
    });
  }
  console.log("TEN-RECORD RESTORED MATRIX", JSON.stringify(matrix, null, 2));
});

check("ASI-SEM-INDEP", "canonical semantic class is not derived from excludedFromPrimaryScoring", () => {
  const q11e = dualSemanticClass("acquirerEnvironment", "ACQUIRERENVIRONMENT-Q11", "Q11", "E");
  const q11f = dualSemanticClass("acquirerEnvironment", "ACQUIRERENVIRONMENT-Q11", "Q11", "F");
  const q6e = dualSemanticClass("acquirerEnvironment", "ACQUIRERENVIRONMENT-Q6", "Q6", "E");
  const q8f = dualSemanticClass("acquirerEnvironment", "ACQUIRERENVIRONMENT-Q8", "Q8", "F");
  const q9e = dualSemanticClass("acquirerEnvironment", "ACQUIRERENVIRONMENT-Q9", "Q9", "E");
  assert.equal(q11e, "SUBSTANTIVE_SIGNAL");
  assert.equal(q11f, "OBSERVATION_GAP");
  assert.equal(q6e, "EXTERNAL_OR_PERSONAL_CAUSE");
  assert.equal(q8f, "STRUCTURAL_PRECONDITION_ABSENCE");
  assert.equal(q9e, "EVENT_ABSENCE");
  assert.equal(findOption(findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11"), "E").excludedFromPrimaryScoring, false);
  assert.equal(findOption(findGeneratedQuestion("ACQUIRERENVIRONMENT-Q11"), "F").excludedFromPrimaryScoring, true);
  assert.equal(findOption(findGeneratedQuestion("ACQUIRERENVIRONMENT-Q6"), "E").excludedFromPrimaryScoring, true);
  assert.equal(findOption(findGeneratedQuestion("ACQUIRERENVIRONMENT-Q8"), "F").excludedFromPrimaryScoring, true);
  assert.equal(findOption(findGeneratedQuestion("ACQUIRERENVIRONMENT-Q9"), "E").excludedFromPrimaryScoring, true);
  const classesForExcludedTrue = new Set([q11f, q6e, q8f, q9e]);
  assert.equal(classesForExcludedTrue.size, 4);
  assert.notEqual(q11e, q11f);
});

console.log("Answer semantic integrity cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
