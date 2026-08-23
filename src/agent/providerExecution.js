import { randomUUID } from "node:crypto";

import {
  PROVIDER_PROMPT_VERSION,
  PROVIDER_PROJECTION_VERSION,
} from "./agentContractConstants.js";
import { canonicalSerialize } from "./canonicalDigest.js";
import { buildProviderPrompt } from "./providerPrompt.js";
import {
  validateProviderSemanticCandidate,
} from "./providerSemanticCandidateSchema.js";
import { ProviderExecutionError } from "./providerExecutionError.js";
import {
  GEMINI_AUTH_HEADER_NAME,
  GEMINI_EXECUTION_ATTEMPT_NUMBER,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_RESPONSE_MIME_TYPE,
  GEMINI_TIMEOUT_MS,
  GEMINI_CREDENTIAL_ENV_NAME,
  PROVIDER_EXECUTION_CONTRACT,
  PROVIDER_EXECUTION_HTTP_METHOD,
  PROVIDER_ID_GEMINI,
  GEMINI_MODEL_ID,
  buildGeminiGenerateContentUrl,
} from "./providerExecutionConstants.js";
import {
  PROVIDER_AUTH_FAILURE,
  PROVIDER_CONFIGURATION_FAILURE,
  PROVIDER_HTTP_FAILURE,
  PROVIDER_RATE_LIMIT,
  PROVIDER_RESPONSE_PARSE_FAILURE,
  PROVIDER_STRUCTURAL_CANDIDATE_FAILURE,
  PROVIDER_TIMEOUT,
  PROVIDER_TRANSPORT_FAILURE,
} from "./providerExecutionError.js";

// Fail-closed allowed-shape admission: a Part is admissible only as a purely
// textual shape (text, thought, thoughtSignature — the latter metadata only).
// Any other payload facet — tool, code, file, media, or an unknown provider
// capability key — makes the response inadmissible, whether or not the Part
// also carries .text or .thought.
const ALLOWED_PART_KEYS = Object.freeze(["text", "thought", "thoughtSignature"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function safeObservedToken(value) {
  return typeof value === "string" ? value : "non-string";
}

function parseFail(detail) {
  return new ProviderExecutionError({
    failureClass: PROVIDER_RESPONSE_PARSE_FAILURE,
    detail,
  });
}

function configFail(detail) {
  return new ProviderExecutionError({
    failureClass: PROVIDER_CONFIGURATION_FAILURE,
    detail,
  });
}

// Standalone helpers mint errors without an attempt context; the orchestrator
// re-attaches its executionAttemptId so every thrown failure stays traceable.
function attachAttemptId(error, executionAttemptId) {
  if (error instanceof ProviderExecutionError && error.executionAttemptId === null) {
    return new ProviderExecutionError({
      failureClass: error.failureClass,
      detail: error.detail,
      retryable: error.retryable,
      executionAttemptId,
    });
  }
  return error;
}

const defaultCredentialReader = () => process.env[GEMINI_CREDENTIAL_ENV_NAME];

// Credential boundary: read at execution time, fail closed on missing/blank/
// whitespace-only values. The value travels only inside the auth header and
// never enters the projection, prompt, candidate, metadata, logs, or URL.
export function resolveGeminiCredential(credentialReader = defaultCredentialReader) {
  const reader = typeof credentialReader === "function"
    ? credentialReader
    : defaultCredentialReader;
  const value = reader();
  if (typeof value !== "string" || value.trim().length === 0) {
    throw configFail(`credential from ${GEMINI_CREDENTIAL_ENV_NAME} is missing, blank, or whitespace-only`);
  }
  return value;
}

// Execution package binding: the supplied prompt may cross HTTP only when it
// canonical-equals the prompt rebuilt from this exact projection through the
// existing closed implementation. No second equivalence algorithm, no repair,
// no substitution of the rebuilt prompt.
export function assertExecutionPackage(providerProjection, prompt) {
  if (!isPlainObject(providerProjection)) {
    throw configFail("providerProjection must be a plain object");
  }
  if (!isPlainObject(prompt)) throw configFail("prompt must be a plain object");
  if (providerProjection.providerProjectionVersion !== PROVIDER_PROJECTION_VERSION) {
    throw configFail(`providerProjectionVersion must be ${PROVIDER_PROJECTION_VERSION}`);
  }
  if (prompt.promptVersion !== PROVIDER_PROMPT_VERSION) {
    throw configFail(`promptVersion must be ${PROVIDER_PROMPT_VERSION}`);
  }
  let expectedBytes;
  let suppliedBytes;
  try {
    const expectedPrompt = buildProviderPrompt(providerProjection);
    expectedBytes = canonicalSerialize(expectedPrompt);
    suppliedBytes = canonicalSerialize(prompt);
  } catch (error) {
    throw configFail(`execution package binding failed: ${error?.message ?? error}`);
  }
  if (suppliedBytes !== expectedBytes) {
    throw configFail("supplied prompt does not canonical-equal the prompt rebuilt from the provider projection");
  }
}

// Exact semantic mapping of the closed two-message prompt onto the stateless
// one-shot Gemini REST body. Nothing beyond these four keys is emitted.
export function buildGeminiGenerateContentBody(prompt) {
  if (!isPlainObject(prompt)) throw configFail("prompt must be a plain object");
  const messages = prompt.messages;
  if (!Array.isArray(messages) || messages.length !== 2) {
    throw configFail("prompt.messages must contain exactly two entries");
  }
  const [systemMessage, userMessage] = messages;
  if (!isPlainObject(systemMessage)
    || systemMessage.role !== "system"
    || typeof systemMessage.content !== "string"
    || systemMessage.content.length === 0) {
    throw configFail("prompt.messages[0] must be the non-empty system message");
  }
  if (!isPlainObject(userMessage)
    || userMessage.role !== "user"
    || typeof userMessage.content !== "string"
    || userMessage.content.length === 0) {
    throw configFail("prompt.messages[1] must be the non-empty user message");
  }
  return deepFreeze({
    systemInstruction: {
      parts: [{ text: systemMessage.content }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage.content }],
      },
    ],
    generationConfig: {
      responseMimeType: GEMINI_RESPONSE_MIME_TYPE,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
    },
    store: false,
  });
}

// Response-envelope admission (top-level body, promptFeedback, candidates
// cardinality, candidate shape, finishReason, parts classification). Returns
// the single admitted candidate-text part. Thought parts are ignored only when
// they match the allowed textual shape; any tool/code/file/media/unknown Part
// payload facet, zero or multiple candidate-text parts, and every finishReason
// other than exactly STOP fail closed. Metadata fields (citations, grounding)
// may be observed but are never copied and never admitted as text.
export function extractGeminiCandidateText(rawPayload) {
  if (!isPlainObject(rawPayload)) {
    throw parseFail("provider response body must be a plain object");
  }
  if (isPlainObject(rawPayload.promptFeedback)) {
    const blockReason = rawPayload.promptFeedback.blockReason;
    if (blockReason !== undefined && blockReason !== "BLOCK_REASON_UNSPECIFIED") {
      throw parseFail(`promptFeedback.blockReason=${safeObservedToken(blockReason)}`);
    }
  }
  const candidates = rawPayload.candidates;
  if (!Array.isArray(candidates) || candidates.length !== 1) {
    throw parseFail("candidates must be an array of exactly one entry");
  }
  const candidate = candidates[0];
  if (!isPlainObject(candidate)) throw parseFail("candidate must be a plain object");
  if (!isPlainObject(candidate.content)) {
    throw parseFail("candidate.content must be a plain object");
  }
  if (!Array.isArray(candidate.content.parts)) {
    throw parseFail("candidate.content.parts must be an array");
  }
  if (candidate.finishReason !== "STOP") {
    throw parseFail(`finishReason must be STOP (observed ${safeObservedToken(candidate.finishReason)})`);
  }
  let candidateTextCount = 0;
  let candidateText = null;
  for (const part of candidate.content.parts) {
    if (!isPlainObject(part)) throw parseFail("each part must be a plain object");
    for (const key of Object.keys(part)) {
      if (!ALLOWED_PART_KEYS.includes(key)) {
        throw parseFail(`part carries unsupported key ${key}`);
      }
    }
    if (part.thought === true) continue;
    const text = part.text;
    if (typeof text !== "string" || text.trim().length === 0) {
      throw parseFail("non-thought part carries no admissible text");
    }
    candidateTextCount += 1;
    candidateText = text;
  }
  if (candidateTextCount !== 1) {
    throw parseFail(`exactly one candidate text part is required (observed ${candidateTextCount})`);
  }
  return candidateText;
}

// Candidate JSON admission: trim surrounding whitespace only, require a {…}
// envelope, parse exactly one JSON object. No fence stripping, no prose
// tolerance, no wrapper arrays.
export function parseProviderSemanticCandidateJson(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw parseFail("candidate text must be a non-empty string");
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    throw parseFail("candidate text must begin with { and end with } after whitespace trim");
  }
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw parseFail("candidate text is not parseable JSON");
  }
  if (!isPlainObject(parsed)) {
    throw parseFail("candidate JSON must be exactly one object");
  }
  return parsed;
}

function readObservedRequestId(response) {
  try {
    const headers = response?.headers;
    if (headers !== null && typeof headers === "object" && typeof headers.get === "function") {
      const value = headers.get("x-request-id");
      if (typeof value === "string" && value.length > 0) return value;
    }
  } catch {
    return null;
  }
  return null;
}

export async function executeGeminiProvider(
  { providerProjection, prompt } = {},
  runtimeOptions = {},
) {
  const executionAttemptId = randomUUID();
  const fail = (detail) => attachAttemptId(configFail(detail), executionAttemptId);

  const options = isPlainObject(runtimeOptions) ? runtimeOptions : {};
  let fetchImpl;
  if (options.fetchImpl !== undefined) {
    if (typeof options.fetchImpl !== "function") {
      throw fail("runtimeOptions.fetchImpl must be a function");
    }
    fetchImpl = options.fetchImpl;
  } else {
    const globalFetch = globalThis.fetch;
    if (typeof globalFetch !== "function") {
      throw fail("no fetch implementation available");
    }
    fetchImpl = globalFetch;
  }

  let credentialReader = defaultCredentialReader;
  if (options.credentialReader !== undefined) {
    if (typeof options.credentialReader !== "function") {
      throw fail("runtimeOptions.credentialReader must be a function");
    }
    credentialReader = options.credentialReader;
  }

  try {
    assertExecutionPackage(providerProjection, prompt);
  } catch (error) {
    throw attachAttemptId(error, executionAttemptId);
  }

  let credential;
  try {
    credential = resolveGeminiCredential(credentialReader);
  } catch (error) {
    throw attachAttemptId(error, executionAttemptId);
  }

  const url = buildGeminiGenerateContentUrl();
  const body = buildGeminiGenerateContentBody(prompt);
  const headers = {
    "content-type": "application/json",
    [GEMINI_AUTH_HEADER_NAME]: credential,
  };

  const startedAtMs = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  let response;
  let payload;
  try {
    response = await fetchImpl(url, {
      method: PROVIDER_EXECUTION_HTTP_METHOD,
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const status = typeof response?.status === "number" ? response.status : 0;
    if (status === 401 || status === 403) {
      throw new ProviderExecutionError({
        failureClass: PROVIDER_AUTH_FAILURE,
        retryable: false,
        executionAttemptId,
        detail: `HTTP ${status}`,
      });
    }
    if (status === 429) {
      throw new ProviderExecutionError({
        failureClass: PROVIDER_RATE_LIMIT,
        retryable: true,
        executionAttemptId,
        detail: "HTTP 429",
      });
    }
    if (!(status >= 200 && status < 300)) {
      throw new ProviderExecutionError({
        failureClass: PROVIDER_HTTP_FAILURE,
        retryable: status >= 500,
        executionAttemptId,
        detail: `HTTP ${status}`,
      });
    }
    try {
      payload = await response.json();
    } catch (error) {
      // The body read runs under the same execution deadline: an abort during
      // response.json() is a timeout, never a parse failure.
      if (error?.name === "AbortError" || controller.signal.aborted) {
        throw new ProviderExecutionError({
          failureClass: PROVIDER_TIMEOUT,
          retryable: true,
          executionAttemptId,
          detail: `provider body read exceeded ${GEMINI_TIMEOUT_MS} ms`,
        });
      }
      throw new ProviderExecutionError({
        failureClass: PROVIDER_RESPONSE_PARSE_FAILURE,
        executionAttemptId,
        detail: "HTTP response body is not parseable JSON",
      });
    }
  } catch (error) {
    if (error instanceof ProviderExecutionError) throw error;
    if (error?.name === "AbortError") {
      throw new ProviderExecutionError({
        // Retryability is an orchestration hint only: this layer never
        // retries; the attempt stays consumed and attemptNumber stays 1.
        failureClass: PROVIDER_TIMEOUT,
        retryable: true,
        executionAttemptId,
        detail: `provider call exceeded ${GEMINI_TIMEOUT_MS} ms`,
      });
    }
    throw new ProviderExecutionError({
      failureClass: PROVIDER_TRANSPORT_FAILURE,
      retryable: true,
      executionAttemptId,
      detail: `fetch transport failure: ${error?.name ?? "unknown"}`,
    });
  } finally {
    clearTimeout(timer);
  }

  let validatedCandidate;
  try {
    const candidateText = extractGeminiCandidateText(payload);
    const parsedCandidate = parseProviderSemanticCandidateJson(candidateText);
    validatedCandidate = validateProviderSemanticCandidate(parsedCandidate, providerProjection);
  } catch (error) {
    if (error instanceof ProviderExecutionError) {
      throw attachAttemptId(error, executionAttemptId);
    }
    throw new ProviderExecutionError({
      failureClass: PROVIDER_STRUCTURAL_CANDIDATE_FAILURE,
      executionAttemptId,
      detail: `candidate structural validation failed: ${error?.detail ?? error?.message ?? error}`,
    });
  }

  const observedProvider = {};
  const observedRequestId = readObservedRequestId(response);
  if (observedRequestId !== null) observedProvider.requestId = observedRequestId;
  if (typeof payload.modelVersion === "string" && payload.modelVersion.length > 0) {
    observedProvider.modelVersion = payload.modelVersion;
  }
  const observedFinishReason = payload.candidates?.[0]?.finishReason;
  if (typeof observedFinishReason === "string" && observedFinishReason.length > 0) {
    observedProvider.finishReason = observedFinishReason;
  }

  const executionMetadata = deepFreeze({
    provider: PROVIDER_ID_GEMINI,
    model: GEMINI_MODEL_ID,
    executedAt: new Date(startedAtMs).toISOString(),
    executionAttemptId,
    attemptNumber: GEMINI_EXECUTION_ATTEMPT_NUMBER,
    transportStatus: "OK",
    durationMs: Date.now() - startedAtMs,
    promptVersion: PROVIDER_EXECUTION_CONTRACT.promptVersion,
    providerProjectionVersion: PROVIDER_EXECUTION_CONTRACT.providerProjectionVersion,
    providerCandidateSchemaVersion: PROVIDER_EXECUTION_CONTRACT.providerCandidateSchemaVersion,
    ...(Object.keys(observedProvider).length > 0
      ? { observedProvider: deepFreeze(observedProvider) }
      : {}),
  });

  // The candidate remains UNTRUSTED SEMANTICALLY; this layer only asserts
  // structural admission and returns wrapper-owned trusted-local metadata.
  return deepFreeze({
    candidate: validatedCandidate,
    executionMetadata,
  });
}
