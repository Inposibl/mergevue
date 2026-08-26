import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import {
  DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE,
  EVIDENCE_TYPE_OPTIONS,
  KNOWLEDGE_LEVEL_OPTIONS,
  RELIABILITY_FLAG_OPTIONS,
  evidenceTypeOptionsForGate,
  evidenceTypeOptionsForQuestion,
  hasFreeInadmissibleDocumentCapability,
  knowledgeLevelOptionsForGate,
  reliabilityFlagOptionsForFree,
  updateEvidenceAnswer,
  validateEvidenceClassifiedAnswer,
  evidenceClassifiedAnswer,
} from "../src/flow/evidenceClassification.js";
import { scoreLayeredEvidenceQuestionSet } from "../src/flow/layeredEvidenceScoring.js";

const classificationSource = readFileSync(
  new URL("../src/flow/evidenceClassification.js", import.meta.url),
  "utf8",
);
const scoringSource = readFileSync(
  new URL("../src/flow/layeredEvidenceScoring.js", import.meta.url),
  "utf8",
);
const ROOT = fileURLToPath(new URL("..", import.meta.url));
void ROOT;

const results = [];

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function optionValues(options) {
  return (options ?? []).map((option) => option.value);
}

function aemQuestions() {
  return ACQUIRER_TRACK_DATA.acquirerModule.questions;
}

function documentSupportedAnswer(selectedOption = "A") {
  return updateEvidenceAnswer(evidenceClassifiedAnswer(selectedOption), {
    evidenceType: "document_supported",
    knowledgeLevel: "first_hand",
    confidence: "high",
    directObservationGate: "yes",
  });
}

function documentBasedAnswer(selectedOption = "A") {
  return updateEvidenceAnswer(evidenceClassifiedAnswer(selectedOption), {
    evidenceType: "direct_observation",
    knowledgeLevel: "document_based",
    confidence: "high",
    directObservationGate: "yes",
  });
}

function contradictedByDocumentAnswer(selectedOption = "A") {
  return updateEvidenceAnswer(evidenceClassifiedAnswer(selectedOption), {
    directObservationGate: "no",
    evidenceType: "inference",
    knowledgeLevel: "pattern_based",
    confidence: "low",
    reliabilityFlags: ["contradicted_by_document"],
    reliabilityFlagsAcknowledged: true,
  });
}

function combinedDocumentAnswer(selectedOption = "A") {
  return Object.freeze({
    selectedOption,
    directObservationGate: "yes",
    evidenceType: "document_supported",
    knowledgeLevel: "document_based",
    confidence: "high",
    reliabilityFlags: Object.freeze(["contradicted_by_document"]),
    reliabilityFlagsAcknowledged: true,
    source: "structured_answer",
  });
}

function mixedSessionAnswers() {
  const questions = aemQuestions();
  const answers = {};
  questions.forEach((question, index) => {
    if (index < 6) {
      answers[question.id] = evidenceClassifiedAnswer("A");
      return;
    }
    if (index === 6 || index === 7) {
      answers[question.id] = documentSupportedAnswer("A");
      return;
    }
    if (index === 8 || index === 9) {
      answers[question.id] = documentBasedAnswer("A");
      return;
    }
    answers[question.id] = contradictedByDocumentAnswer("A");
  });
  return answers;
}

function scoreAem(answers) {
  return scoreLayeredEvidenceQuestionSet(aemQuestions(), answers, {
    moduleId: "acquirer_environment",
    respondentSide: "acquirer",
  });
}

function assertDocumentExclusion(response, rawField, rawValue, label) {
  assert.equal(response[rawField], rawValue, `${label}: raw ${rawField} must be preserved`);
  assert.equal(response.excludedFromPrimaryScoring, true, `${label}: excludedFromPrimaryScoring`);
  assert.equal(response.weight, 0, `${label}: weight`);
  const reasonCount = (response.primaryExclusionReasons ?? []).filter(
    (reason) => reason === DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE,
  ).length;
  assert.equal(reasonCount, 1, `${label}: exclusion reason must appear once`);
}

check("FB-01", "FREE evidence-type options do not contain document_supported", () => {
  for (const gate of ["", "yes", "no"]) {
    assert.equal(
      optionValues(evidenceTypeOptionsForGate(gate)).includes("document_supported"),
      false,
      `evidenceTypeOptionsForGate(${JSON.stringify(gate)}) must not include document_supported`,
    );
  }
  assert.equal(
    optionValues(evidenceTypeOptionsForQuestion({ allowsUnknown: true }, "yes")).includes("document_supported"),
    false,
  );
});

check("FB-02", "FREE knowledge-level options do not contain document_based", () => {
  for (const gate of ["", "yes", "no"]) {
    assert.equal(
      optionValues(knowledgeLevelOptionsForGate(gate)).includes("document_based"),
      false,
      `knowledgeLevelOptionsForGate(${JSON.stringify(gate)}) must not include document_based`,
    );
  }
});

check("FB-03", "FREE reliability-flag options do not contain contradicted_by_document", () => {
  assert.equal(
    optionValues(reliabilityFlagOptionsForFree()).includes("contradicted_by_document"),
    false,
  );
});

check("FB-04", "Shared/domain PAID document capability remains physically present", () => {
  assert.equal(optionValues(EVIDENCE_TYPE_OPTIONS).includes("document_supported"), true);
  assert.equal(optionValues(KNOWLEDGE_LEVEL_OPTIONS).includes("document_based"), true);
  assert.equal(optionValues(RELIABILITY_FLAG_OPTIONS).includes("contradicted_by_document"), true);
  assert.match(scoringSource, /document_supported:\s*1/);
  assert.match(scoringSource, /document_based:\s*0\.85/);
  assert.match(scoringSource, /contradicted_by_document:\s*0\.2/);
  assert.match(classificationSource, /value:\s*"document_supported"/);
  assert.match(classificationSource, /value:\s*"document_based"/);
  assert.match(classificationSource, /value:\s*"contradicted_by_document"/);
});

check("FB-05", "Legacy document_supported is preserved raw and excluded from FREE scoring", () => {
  const question = aemQuestions()[0];
  const answer = documentSupportedAnswer("A");
  assert.equal(answer.evidenceType, "document_supported");
  const validation = validateEvidenceClassifiedAnswer(answer);
  assert.equal(validation.valid, false);
  assert.equal(validation.normalized.evidenceType, "document_supported");
  assert.ok(validation.consistencyIssues.some((issue) => /not admissible in FREE/i.test(issue)));
  assert.equal(/human review|analyst/i.test(validation.consistencyIssues.join(" ")), false);
  const score = scoreAem({ [question.id]: answer });
  const response = score.questionResponses.find((item) => item.questionId === question.id);
  assertDocumentExclusion(response, "evidenceType", "document_supported", "FB-05");
});

check("FB-06", "Legacy document_based is preserved raw and excluded from FREE scoring", () => {
  const question = aemQuestions()[0];
  const answer = documentBasedAnswer("A");
  assert.equal(answer.knowledgeLevel, "document_based");
  const validation = validateEvidenceClassifiedAnswer(answer);
  assert.equal(validation.valid, false);
  assert.equal(validation.normalized.knowledgeLevel, "document_based");
  const response = scoreAem({ [question.id]: answer }).questionResponses[0];
  assertDocumentExclusion(response, "knowledgeLevel", "document_based", "FB-06");
});

check("FB-07", "Legacy contradicted_by_document is preserved raw and excluded from FREE scoring", () => {
  const answer = contradictedByDocumentAnswer("A");
  assert.deepEqual([...answer.reliabilityFlags], ["contradicted_by_document"]);
  const validation = validateEvidenceClassifiedAnswer(answer);
  assert.equal(validation.valid, false);
  assert.deepEqual([...validation.normalized.reliabilityFlags], ["contradicted_by_document"]);
  const response = scoreAem({ [aemQuestions()[0].id]: answer }).questionResponses[0];
  assert.deepEqual([...response.reliabilityFlags], ["contradicted_by_document"]);
  assertDocumentExclusion(response, "evidenceType", "inference", "FB-07");
});

check("FB-08", "Combined document capabilities emit the exclusion reason once", () => {
  const answer = combinedDocumentAnswer("A");
  assert.equal(hasFreeInadmissibleDocumentCapability(answer), true);
  const response = scoreAem({ [aemQuestions()[0].id]: answer }).questionResponses[0];
  assert.equal(response.evidenceType, "document_supported");
  assert.equal(response.knowledgeLevel, "document_based");
  assert.equal(response.reliabilityFlags.includes("contradicted_by_document"), true);
  const reasonCount = response.primaryExclusionReasons.filter(
    (reason) => reason === DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE,
  ).length;
  assert.equal(reasonCount, 1);
  assert.equal(response.weight, 0);
});

check("FB-09", "Forbidden rows do not increase documentSupportedCount", () => {
  const questions = aemQuestions();
  const answers = Object.fromEntries(questions.map((question) => [question.id, documentSupportedAnswer("A")]));
  const score = scoreAem(answers);
  assert.equal(score.evidenceQuality.documentSupportedCount, 0);
  assert.equal(score.questionResponses.every((response) => response.evidenceType === "document_supported"), true);
});

check("FB-10", "Forbidden rows do not count in the evidence-supported numerator", () => {
  const questions = aemQuestions();
  const answers = {
    [questions[0].id]: evidenceClassifiedAnswer("A"),
    [questions[1].id]: documentSupportedAnswer("A"),
  };
  const score = scoreAem(answers);
  const answered = score.questionResponses.filter((response) => !response.missing).length;
  assert.equal(score.evidenceQuality.directObservationCount, 1);
  assert.equal(score.evidenceQuality.documentSupportedCount, 0);
  assert.equal(score.evidenceQuality.evidenceSupportedShare, Math.round((1 / answered) * 1000) / 1000);
});

check("FB-11", "Mixed 6 admissible + 5 forbidden does not produce evidenceSupportedShare = 1.0", () => {
  const score = scoreAem(mixedSessionAnswers());
  assert.equal(score.answeredQuestionCount, 11);
  assert.equal(score.questionResponses.filter((response) => response.excludedFromPrimaryScoring).length, 5);
  assert.equal(score.questionResponses.filter((response) => response.weight > 0).length, 6);
  assert.equal(score.evidenceQuality.documentSupportedCount, 0);
  assert.equal(score.evidenceQuality.directObservationCount, 6);
  assert.equal(score.evidenceQuality.evidenceSupportedShare, Math.round((6 / 11) * 1000) / 1000);
  assert.notEqual(score.evidenceQuality.evidenceSupportedShare, 1);
});

check("FB-12", "Mixed case does not retain the old artificially elevated confidence", () => {
  const score = scoreAem(mixedSessionAnswers());
  assert.notEqual(score.confidence, "high");
  assert.notEqual(score.evidenceQuality.confidence, "high");
  assert.equal(score.confidence, "medium");
});

check("FB-13", "Pure legitimate FREE direct_observation + first_hand scoring is unchanged", () => {
  const answers = Object.fromEntries(aemQuestions().map((question) => [question.id, evidenceClassifiedAnswer("A")]));
  const score = scoreAem(answers);
  assert.equal(score.valid, true);
  assert.equal(score.answeredQuestionCount, 11);
  assert.equal(score.excludedAnswerCount, 0);
  assert.equal(score.evidenceQuality.documentSupportedCount, 0);
  assert.equal(score.evidenceQuality.directObservationCount, 11);
  assert.equal(score.evidenceQuality.evidenceSupportedShare, 1);
  assert.equal(score.confidence, "high");
  assert.ok(score.totalEvidenceWeight > 0);
  assert.ok(score.primaryEnvironmentCode);
  assert.equal(score.questionResponses.every((response) => response.weight > 0), true);
  assert.equal(
    score.questionResponses.every((response) => !response.primaryExclusionReasons.includes(DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE)),
    true,
  );
});

check("FB-14", "Other non-document FREE evidence semantics remain unchanged", () => {
  const answer = updateEvidenceAnswer(evidenceClassifiedAnswer("A"), {
    directObservationGate: "no",
    evidenceType: "inference",
    knowledgeLevel: "pattern_based",
    confidence: "low",
    reliabilityFlags: ["no_direct_knowledge"],
    reliabilityFlagsAcknowledged: true,
  });
  const score = scoreAem({ [aemQuestions()[0].id]: answer });
  const response = score.questionResponses[0];
  assert.equal(response.evidenceType, "inference");
  assert.equal(response.knowledgeLevel, "pattern_based");
  assert.equal(response.primaryExclusionReasons.includes("no_direct_knowledge"), true);
  assert.equal(response.primaryExclusionReasons.includes(DOCUMENT_CAPABILITY_NOT_ADMISSIBLE_IN_FREE), false);
});

check("FB-15", "Raw legacy values survive JSON round-trip and questionResponses provenance", () => {
  const answers = {
    [aemQuestions()[0].id]: documentSupportedAnswer("A"),
    [aemQuestions()[1].id]: documentBasedAnswer("A"),
    [aemQuestions()[2].id]: contradictedByDocumentAnswer("A"),
  };
  const roundTrip = JSON.parse(JSON.stringify(scoreAem(answers)));
  const [documentSupported, documentBased, contradicted] = aemQuestions().slice(0, 3).map((question) => (
    roundTrip.questionResponses.find((item) => item.questionId === question.id)
  ));
  assert.equal(documentSupported.evidenceType, "document_supported");
  assert.equal(documentBased.knowledgeLevel, "document_based");
  assert.equal(contradicted.reliabilityFlags.includes("contradicted_by_document"), true);
  assert.equal(documentSupported.canonicalQuestionId, aemQuestions()[0].canonicalQuestionId);
  assert.equal(documentSupported.workbookQuestionId, "Q1");
});

check("FB-16", "No human/analyst fallback introduced", () => {
  const exclusionStart = scoringSource.indexOf("const documentCapabilityExcluded");
  const exclusionBlock = scoringSource.slice(
    exclusionStart,
    scoringSource.indexOf("const weight = answerWeight", exclusionStart),
  );
  assert.ok(exclusionBlock.includes("hasFreeInadmissibleDocumentCapability"), "FREE document exclusion must exist");
  assert.equal(exclusionBlock.includes("treatAsUnknown"), false);
  assert.equal(exclusionBlock.includes("cappedEvidenceType"), false);
  assert.equal(exclusionBlock.includes("evidenceTypeCap"), false);
  assert.equal(classificationSource.includes("Document-backed evidence is not admissible in FREE"), true);
  const validation = validateEvidenceClassifiedAnswer(documentSupportedAnswer("A"));
  assert.equal(/human review|analyst review/i.test(validation.consistencyIssues.join(" ")), false);
});

console.log("FREE evidence semantic boundary cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
