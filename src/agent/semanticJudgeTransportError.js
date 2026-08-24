// J2 — Typed semantic-judge transport error boundary. Evaluator/transport
// failures only. This module never materializes a canonical product failure
// object, never reuses generator-execution or result-assembly error types,
// and never treats a transport failure as a semantic verdict.

export const JUDGE_CONFIGURATION_FAILURE = "JUDGE_CONFIGURATION_FAILURE";
export const JUDGE_TRANSPORT_FAILURE = "JUDGE_TRANSPORT_FAILURE";
export const JUDGE_TIMEOUT = "JUDGE_TIMEOUT";
export const JUDGE_AUTH_FAILURE = "JUDGE_AUTH_FAILURE";
export const JUDGE_RATE_LIMIT = "JUDGE_RATE_LIMIT";
export const JUDGE_HTTP_FAILURE = "JUDGE_HTTP_FAILURE";
export const JUDGE_PROTOCOL_FAILURE = "JUDGE_PROTOCOL_FAILURE";
export const JUDGE_REFUSAL = "JUDGE_REFUSAL";

export const SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES = Object.freeze([
  JUDGE_CONFIGURATION_FAILURE,
  JUDGE_TRANSPORT_FAILURE,
  JUDGE_TIMEOUT,
  JUDGE_AUTH_FAILURE,
  JUDGE_RATE_LIMIT,
  JUDGE_HTTP_FAILURE,
  JUDGE_PROTOCOL_FAILURE,
  JUDGE_REFUSAL,
]);

export class SemanticJudgeTransportError extends Error {
  constructor({ errorCode, detail, httpStatus, cause } = {}) {
    if (!SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES.includes(errorCode)) {
      throw new Error("SemanticJudgeTransportError requires a lawful J2 errorCode");
    }
    const parts = [
      "SemanticJudgeTransportError",
      `errorCode=${errorCode}`,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "), cause !== undefined ? { cause } : undefined);
    this.name = "SemanticJudgeTransportError";
    this.errorCode = errorCode;
    this.detail = typeof detail === "string" && detail.length > 0 ? detail : null;
    this.httpStatus = Number.isInteger(httpStatus) ? httpStatus : null;
  }

  toJSON() {
    return {
      name: this.name,
      errorCode: this.errorCode,
      detail: this.detail,
      httpStatus: this.httpStatus,
    };
  }
}
