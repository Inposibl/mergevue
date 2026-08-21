import { buildTargetSelfAssessmentRecord } from "../src/flow/targetSelfAssessmentFlow.js";
import { completeServerTargetSession } from "../src/server/_sessionLedger.js";
import { methodNotAllowed, parseJsonBody, jsonResponse, unrecognizedReliabilityFlagResponse, illegalReliabilityFlagForSideResponse } from "../src/server/_response.js";
import { isIllegalReliabilityFlagForSideError, isUnrecognizedReliabilityFlagError } from "../src/flow/layeredEvidenceScoring.js";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(request.method, ["POST"]);
  }

  const body = await parseJsonBody(request);
  const targetSessionId = typeof body?.targetSessionId === "string" ? body.targetSessionId : "";
  const digitalCode = typeof body?.digitalCode === "string" ? body.digitalCode : "";
  const positioning = typeof body?.positioning === "object" && body.positioning ? body.positioning : {};
  const answers = typeof body?.answers === "object" && body.answers ? body.answers : {};
  let targetSelfAssessment;
  try {
    targetSelfAssessment = buildTargetSelfAssessmentRecord(positioning, answers);
  } catch (error) {
    if (isUnrecognizedReliabilityFlagError(error)) {
      return unrecognizedReliabilityFlagResponse("/api/submit-target-2c", error);
    }
    if (isIllegalReliabilityFlagForSideError(error)) {
      return illegalReliabilityFlagForSideResponse("/api/submit-target-2c", error);
    }
    throw error;
  }

  if (!targetSelfAssessment.completed) {
    return jsonResponse(400, {
      endpoint: "/api/submit-target-2c",
      status: "target-self-assessment-incomplete",
      missingPositioning: targetSelfAssessment.missingPositioning,
      invalidPositioning: targetSelfAssessment.invalidPositioning,
      missingQuestionIds: targetSelfAssessment.missingQuestionIds,
    });
  }

  const result = completeServerTargetSession(targetSessionId, digitalCode, targetSelfAssessment);
  return jsonResponse(result.ok ? 200 : 403, {
    endpoint: "/api/submit-target-2c",
    ...result,
    receipt: {
      title: "Your responses have been received.",
      body: "Thank you for the time spent on this survey.",
      close: "You can close this page.",
    },
  });
}

