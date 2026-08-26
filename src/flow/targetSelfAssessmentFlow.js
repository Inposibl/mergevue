import { TARGET_SELF_ASSESSMENT_DATA } from "../data/targetSelfAssessmentData.js";
import { validateEvidenceClassifiedAnswers } from "./evidenceClassification.js";
import {
  ACQUISITION_FRAMING_CONTAMINATION_FLAG,
  scoreLayeredEvidenceQuestionSet,
} from "./layeredEvidenceScoring.js";

export const ACQUISITION_AWARENESS_VALUES = Object.freeze(["yes", "no", "partial"]);
export const TARGET_SELF_SHORT_TENURE_POSITIONING_VALUE = "A";

export const ACQUISITION_AWARENESS_FIELD = Object.freeze({
  id: "acquisitionAwareness",
  label: "Awareness of the pending acquisition",
  options: Object.freeze([
    Object.freeze({ value: "yes", title: "Yes" }),
    Object.freeze({ value: "no", title: "No" }),
    Object.freeze({ value: "partial", title: "Partial" }),
  ]),
});

export const TARGET_SELF_ENVIRONMENT_CODES = Object.freeze([
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

export function isTargetSelfAssessmentSourceLoaded(data = TARGET_SELF_ASSESSMENT_DATA) {
  return Boolean(
    data?.targetSelfAssessment?.source === "ST_Target_Self_Assessment_Module.xlsx"
      && data?.targetSelfAssessment?.worksheet === "3_Screening"
      && data.targetSelfAssessment.questionCount >= 11
      && data.targetSelfAssessment.questions.length === data.targetSelfAssessment.questionCount
      && data.targetSelfAssessment.questions.every((question) => question.options.length >= 4),
  );
}

export function targetSelfOtherSpecifyFieldId(fieldId) {
  return `${fieldId}OtherSpecify`;
}

export function targetSelfPositioningOptionRequiresSpecify(option) {
  return /other/i.test(String(option?.text ?? "")) && /specify/i.test(String(option?.text ?? ""));
}

function normalizeAcquisitionAwareness(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return ACQUISITION_AWARENESS_VALUES.includes(normalized) ? normalized : "";
}

function acquisitionAwarenessWasProvided(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

function withTenureContaminationBackstop(answers, questions, shortTenure) {
  if (!shortTenure) return answers;
  const next = { ...answers };
  for (const question of questions) {
    const answer = next[question.id];
    if (!answer || typeof answer !== "object") continue;
    const flags = Array.isArray(answer.reliabilityFlags) ? [...answer.reliabilityFlags] : [];
    if (!flags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG)) {
      flags.push(ACQUISITION_FRAMING_CONTAMINATION_FLAG);
    }
    next[question.id] = Object.freeze({
      ...answer,
      reliabilityFlags: Object.freeze(flags),
    });
  }
  return Object.freeze(next);
}

export function validateTargetSelfPositioning(input = {}) {
  const normalized = {};
  const missing = [];
  const invalid = [];

  for (const field of TARGET_SELF_ASSESSMENT_DATA.positioningFields) {
    const value = typeof input[field.id] === "string" ? input[field.id].trim() : "";
    if (!value) {
      missing.push(field.id);
      continue;
    }
    normalized[field.id] = value;

    const selectedOption = field.options.find((option) => option.value === value);
    if (targetSelfPositioningOptionRequiresSpecify(selectedOption)) {
      const specifyFieldId = targetSelfOtherSpecifyFieldId(field.id);
      const specifiedValue = typeof input[specifyFieldId] === "string" ? input[specifyFieldId].trim() : "";
      if (!specifiedValue) {
        missing.push(specifyFieldId);
        continue;
      }
      normalized[specifyFieldId] = specifiedValue;
    }
  }

  if (!acquisitionAwarenessWasProvided(input.acquisitionAwareness)) {
    missing.push(ACQUISITION_AWARENESS_FIELD.id);
  } else {
    const acquisitionAwareness = normalizeAcquisitionAwareness(input.acquisitionAwareness);
    if (!acquisitionAwareness) {
      invalid.push(ACQUISITION_AWARENESS_FIELD.id);
    } else {
      normalized.acquisitionAwareness = acquisitionAwareness;
    }
  }

  return Object.freeze({
    valid: missing.length === 0 && invalid.length === 0,
    missing: Object.freeze(missing),
    invalid: Object.freeze(invalid),
    normalized: Object.freeze(normalized),
  });
}

function physicalTargetRespondentId(options = {}) {
  const value = options.respondentId ?? options.targetSessionId;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text === "primary" || text === "verification") return null;
  return text;
}

export function scoreTargetSelfAssessment(answers = {}, data = TARGET_SELF_ASSESSMENT_DATA, options = {}) {
  const acquisitionAwareness = normalizeAcquisitionAwareness(options.acquisitionAwareness ?? options.positioning?.acquisitionAwareness);
  const shortTenure = options.positioning?.p2 === TARGET_SELF_SHORT_TENURE_POSITIONING_VALUE
    || options.observationTenureMonths < 18;
  const scoringAnswers = withTenureContaminationBackstop(
    answers,
    data.targetSelfAssessment.questions,
    shortTenure,
  );
  const score = scoreLayeredEvidenceQuestionSet(data.targetSelfAssessment.questions, scoringAnswers, {
    environmentCodes: TARGET_SELF_ENVIRONMENT_CODES,
    moduleId: "target_self_assessment",
    respondentSide: "target",
    respondentId: physicalTargetRespondentId(options),
    respondentSlot: options.respondentSlot ?? null,
  });
  return Object.freeze({
    ...score,
    answers: scoringAnswers,
    acquisitionAwareness: acquisitionAwareness || null,
    contaminationIndicator: Object.freeze({
      acquisitionAwareness: acquisitionAwareness || null,
      respondentLevelSignal: acquisitionAwareness === "yes",
      tenureBackstopApplied: shortTenure === true,
    }),
  });
}

export function buildTargetSelfAssessmentRecord(positioningInput, answers, submittedAt = new Date().toISOString(), options = {}) {
  const positioning = validateTargetSelfPositioning(positioningInput);
  const score = scoreTargetSelfAssessment(answers, TARGET_SELF_ASSESSMENT_DATA, {
    positioning: positioning.normalized,
    acquisitionAwareness: positioning.normalized.acquisitionAwareness,
    respondentId: physicalTargetRespondentId(options),
    respondentSlot: options.respondentSlot ?? null,
    targetSessionId: options.targetSessionId,
  });
  const classificationValidation = validateEvidenceClassifiedAnswers(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions, score.answers ?? answers);
  if (!positioning.valid || !score.valid || !classificationValidation.valid) {
    return Object.freeze({
      completed: false,
      missingPositioning: positioning.missing,
      invalidPositioning: positioning.invalid,
      missingQuestionIds: score.missingQuestionIds,
      invalidClassification: classificationValidation.invalid,
      positioning: positioning.valid ? positioning.normalized : null,
      answers: null,
      classificationValidation,
      score,
      contaminationIndicator: score.contaminationIndicator,
    });
  }

  return Object.freeze({
    completed: true,
    submittedAt,
    positioning: positioning.normalized,
    answers: Object.freeze({ ...(score.answers ?? answers) }),
    classificationValidation,
    score,
    contaminationIndicator: score.contaminationIndicator,
  });
}
