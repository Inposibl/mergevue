// J2 — xAI / Grok semantic-judge transport constants. Provider-specific and
// isolated: none of these values may be copied into J1, and J2 never selects
// a model, alias, endpoint, or capacity at runtime.

export const SEMANTIC_JUDGE_PROVIDER = "xai";
export const SEMANTIC_JUDGE_MODEL = "grok-4.20-0309-non-reasoning";
export const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
export const XAI_CREDENTIAL_ENV_NAME = "XAI_API_KEY";
export const SEMANTIC_JUDGE_TIMEOUT_MS = 20000;
export const SEMANTIC_JUDGE_MAX_OUTPUT_TOKENS = 512;
export const XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH = 256;

export const SEMANTIC_JUDGE_HTTP_METHOD = "POST";
export const SEMANTIC_JUDGE_STORE = false;
export const SEMANTIC_JUDGE_STREAM = false;
export const SEMANTIC_JUDGE_TEMPERATURE = 0;
export const SEMANTIC_JUDGE_STRUCTURED_OUTPUT_NAME = "semantic_judge_verdict_batch";
export const SEMANTIC_JUDGE_AUTH_HEADER_NAME = "Authorization";
export const SEMANTIC_JUDGE_CONTENT_TYPE_HEADER_NAME = "Content-Type";
export const SEMANTIC_JUDGE_CONTENT_TYPE = "application/json";
