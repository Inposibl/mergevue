import {
  PROVIDER_CANDIDATE_SCHEMA_VERSION,
  PROVIDER_PROMPT_VERSION,
  PROVIDER_PROJECTION_VERSION,
} from "./agentContractConstants.js";

export const PROVIDER_ID_GEMINI = "gemini";

// Owner-pinned model identity. Never a runtime option, environment variable,
// alias, or fallback; provider-returned identities are observed metadata only.
export const GEMINI_MODEL_ID = "gemini-3.7-flash";

export const GEMINI_API_HOST = "https://generativelanguage.googleapis.com";
export const GEMINI_API_VERSION = "v1beta";
export const GEMINI_TIMEOUT_MS = 20000;
export const GEMINI_MAX_OUTPUT_TOKENS = 8192;
export const GEMINI_RESPONSE_MIME_TYPE = "application/json";
export const GEMINI_CREDENTIAL_ENV_NAME = "GEMINI_API_KEY";
export const GEMINI_AUTH_HEADER_NAME = "x-goog-api-key";
export const PROVIDER_EXECUTION_HTTP_METHOD = "POST";

// Stateless one-shot execution: exactly one attempt, never retried here.
export const GEMINI_EXECUTION_ATTEMPT_NUMBER = 1;

// Wrapper-owned slice of the closed contract identities. The version literals
// live in agentContractConstants.js only; this bundle references them without
// duplicating their values.
export const PROVIDER_EXECUTION_CONTRACT = Object.freeze({
  providerProjectionVersion: PROVIDER_PROJECTION_VERSION,
  promptVersion: PROVIDER_PROMPT_VERSION,
  providerCandidateSchemaVersion: PROVIDER_CANDIDATE_SCHEMA_VERSION,
});

export function buildGeminiGenerateContentUrl() {
  return `${GEMINI_API_HOST}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL_ID}:generateContent`;
}
