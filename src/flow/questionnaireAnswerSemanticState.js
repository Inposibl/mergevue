import { updateEvidenceAnswer } from "./evidenceClassification.js";

export function selectedOptionPatch(question, value) {
  return { selectedOption: value };
}

export function applyQuestionnaireSelectedOption(answer, question, value) {
  return updateEvidenceAnswer(answer, selectedOptionPatch(question, value));
}
