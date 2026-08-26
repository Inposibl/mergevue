export const EVIDENCE_CALIBRATION_OPTION_SCORES = Object.freeze({
  A: 3,
  B: 2,
  C: 1,
  D: 0,
});

export const EVIDENCE_CALIBRATION_QUESTION_COUNT = 4;
export const EVIDENCE_CALIBRATION_MAXIMUM = 12;
export const EVIDENCE_CALIBRATION_MIN_OPTION_SCORE = 0;
export const EVIDENCE_CALIBRATION_MAX_OPTION_SCORE = 3;

export class EvidenceCalibrationError extends Error {
  constructor(message, { code } = {}) {
    super(message);
    this.name = "EvidenceCalibrationError";
    this.code = code ?? "EVIDENCE_CALIBRATION_ERROR";
  }
}

export function isEvidenceCalibrationQuestion(question) {
  if (!question || typeof question !== "object") return false;
  if (question.questionType === "evidence_calibration") return true;
  const identity = String(question.workbookQuestionId ?? question.id ?? "").trim();
  return identity.startsWith("EVID");
}

export function evidenceCalibrationScoreForOption(option) {
  if (!option || typeof option !== "object") {
    throw new EvidenceCalibrationError("EVID option is missing; calibration score cannot be inferred.", {
      code: "MISSING_CALIBRATION_OPTION",
    });
  }

  if (!Object.hasOwn(option, "evidenceCalibrationScore")) {
    throw new EvidenceCalibrationError("evidenceCalibrationScore is missing; this is not a legitimate 0.", {
      code: "MISSING_CALIBRATION_SCORE",
    });
  }

  const score = option.evidenceCalibrationScore;
  if (
    typeof score !== "number"
    || !Number.isInteger(score)
    || score < EVIDENCE_CALIBRATION_MIN_OPTION_SCORE
    || score > EVIDENCE_CALIBRATION_MAX_OPTION_SCORE
  ) {
    throw new EvidenceCalibrationError("evidenceCalibrationScore is malformed; this is not a legitimate 0.", {
      code: "MALFORMED_CALIBRATION_SCORE",
    });
  }

  return score;
}

export function classifyEvidenceCalibrationBand(score) {
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > EVIDENCE_CALIBRATION_MAXIMUM) {
    throw new EvidenceCalibrationError("evidence calibration total is outside the accepted 0-12 range.", {
      code: "CALIBRATION_TOTAL_OUT_OF_RANGE",
    });
  }

  if (score >= 10) return "High";
  if (score >= 7) return "Moderate";
  if (score >= 4) return "Weak";
  return "Irrecoverable";
}
