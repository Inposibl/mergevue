import { executeXaiSemanticJudge } from "./semanticJudgeTransport.js";
import { getSemanticJudgeSystemInstruction } from "./semanticJudgeSystemInstruction.js";

// J5 — narrow J1 packet → J2 transport adapter. Credential ownership,
// truncation, and batching remain entirely inside J2.

export function createXaiSemanticJudge({ fetchImpl } = {}) {
  const systemInstruction = getSemanticJudgeSystemInstruction();
  return async function semanticJudge(packet) {
    const options = {
      systemInstruction,
      judgePacket: packet,
      submittedChecks: packet.checks,
    };
    if (fetchImpl !== undefined) options.fetchImpl = fetchImpl;
    return executeXaiSemanticJudge(options);
  };
}
