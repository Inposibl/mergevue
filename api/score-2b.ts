import {
  scoreTargetDiagnosticCombined,
  scoreTargetDiagnosticLevel1,
  scoreTargetDiagnosticQuestions,
} from "../src/flow/targetDiagnosticFlow.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { methodNotAllowed, parseJsonBody, jsonResponse, unrecognizedReliabilityFlagResponse, illegalReliabilityFlagForSideResponse } from "../src/server/_response.js";
import { isIllegalReliabilityFlagForSideError, isUnrecognizedReliabilityFlagError } from "../src/flow/layeredEvidenceScoring.js";

function scoringValidationResponse(error: unknown) {
  if (isUnrecognizedReliabilityFlagError(error)) {
    return unrecognizedReliabilityFlagResponse("/api/score-2b", error);
  }
  if (isIllegalReliabilityFlagForSideError(error)) {
    return illegalReliabilityFlagForSideResponse("/api/score-2b", error);
  }
  return null;
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(request.method, ["POST"]);
  }

  const body = await parseJsonBody(request);
  const level1Answers = typeof body?.level1Answers === "object" && body.level1Answers ? body.level1Answers : {};
  const level2Answers = typeof body?.level2Answers === "object" && body.level2Answers ? body.level2Answers : {};
  let level1Score;
  try {
    level1Score = scoreTargetDiagnosticLevel1(level1Answers);
  } catch (error) {
    const invalid = scoringValidationResponse(error);
    if (invalid) return invalid;
    throw error;
  }

  if (!level1Score.valid) {
    return jsonResponse(400, {
      endpoint: "/api/score-2b",
      status: "level-1-incomplete",
      missingQuestionIds: level1Score.missingQuestionIds,
    });
  }

  if (!level1Score.requiresLevel2) {
    return jsonResponse(200, {
      endpoint: "/api/score-2b",
      status: "level-1-final",
      requiresLevel2: false,
      finalScore: level1Score,
    });
  }

  let level2Score;
  try {
    level2Score = scoreTargetDiagnosticQuestions([...TARGET_DIAGNOSTIC_DATA.level2.questions], level2Answers);
  } catch (error) {
    const invalid = scoringValidationResponse(error);
    if (invalid) return invalid;
    throw error;
  }
  if (!level2Score.valid) {
    return jsonResponse(400, {
      endpoint: "/api/score-2b",
      status: "level-2-required",
      requiresLevel2: true,
      level1Score,
      missingQuestionIds: level2Score.missingQuestionIds,
    });
  }

  let finalScore;
  try {
    finalScore = scoreTargetDiagnosticCombined(level1Answers, level2Answers);
  } catch (error) {
    const invalid = scoringValidationResponse(error);
    if (invalid) return invalid;
    throw error;
  }

  return jsonResponse(200, {
    endpoint: "/api/score-2b",
    status: "combined-final",
    requiresLevel2: true,
    level1Score,
    level2Score,
    finalScore,
  });
}

