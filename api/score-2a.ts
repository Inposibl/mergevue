import { scoreAcquirerModule } from "../src/flow/acquirerTrackFlow.js";
import { methodNotAllowed, parseJsonBody, jsonResponse, unrecognizedReliabilityFlagResponse, illegalReliabilityFlagForSideResponse } from "../src/server/_response.js";
import { isIllegalReliabilityFlagForSideError, isUnrecognizedReliabilityFlagError } from "../src/flow/layeredEvidenceScoring.js";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(request.method, ["POST"]);
  }

  const body = await parseJsonBody(request);
  const answers = typeof body?.answers === "object" && body.answers ? body.answers : {};
  let score;
  try {
    score = scoreAcquirerModule(answers);
  } catch (error) {
    if (isUnrecognizedReliabilityFlagError(error)) {
      return unrecognizedReliabilityFlagResponse("/api/score-2a", error);
    }
    if (isIllegalReliabilityFlagForSideError(error)) {
      return illegalReliabilityFlagForSideResponse("/api/score-2a", error);
    }
    throw error;
  }

  if (!score.valid) {
    return jsonResponse(400, {
      endpoint: "/api/score-2a",
      status: "answers-incomplete",
      missingQuestionIds: score.missingQuestionIds,
    });
  }

  return jsonResponse(200, {
    endpoint: "/api/score-2a",
    status: "scored",
    score,
  });
}

