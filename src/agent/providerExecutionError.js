export const PROVIDER_CONFIGURATION_FAILURE = "PROVIDER_CONFIGURATION_FAILURE";
export const PROVIDER_AUTH_FAILURE = "PROVIDER_AUTH_FAILURE";
export const PROVIDER_TIMEOUT = "PROVIDER_TIMEOUT";
export const PROVIDER_RATE_LIMIT = "PROVIDER_RATE_LIMIT";
export const PROVIDER_TRANSPORT_FAILURE = "PROVIDER_TRANSPORT_FAILURE";
export const PROVIDER_HTTP_FAILURE = "PROVIDER_HTTP_FAILURE";
export const PROVIDER_RESPONSE_PARSE_FAILURE = "PROVIDER_RESPONSE_PARSE_FAILURE";
export const PROVIDER_STRUCTURAL_CANDIDATE_FAILURE = "PROVIDER_STRUCTURAL_CANDIDATE_FAILURE";

// Execution-local bounded taxonomy. This boundary never emits SystemFailure
// and never authors user-facing text; detail strings are operator-facing
// mechanical diagnostics only.
export const PROVIDER_EXECUTION_FAILURE_CLASSES = Object.freeze([
  PROVIDER_CONFIGURATION_FAILURE,
  PROVIDER_AUTH_FAILURE,
  PROVIDER_TIMEOUT,
  PROVIDER_RATE_LIMIT,
  PROVIDER_TRANSPORT_FAILURE,
  PROVIDER_HTTP_FAILURE,
  PROVIDER_RESPONSE_PARSE_FAILURE,
  PROVIDER_STRUCTURAL_CANDIDATE_FAILURE,
]);

export class ProviderExecutionError extends Error {
  constructor({ failureClass, detail, retryable, executionAttemptId } = {}) {
    const parts = [
      "ProviderExecutionError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "ProviderExecutionError";
    if (!PROVIDER_EXECUTION_FAILURE_CLASSES.includes(failureClass)) {
      throw new Error("ProviderExecutionError requires a lawful execution failureClass");
    }
    this.failureClass = failureClass;
    this.detail = detail ?? null;
    this.retryable = retryable === true;
    this.executionAttemptId = typeof executionAttemptId === "string" ? executionAttemptId : null;
  }
}
