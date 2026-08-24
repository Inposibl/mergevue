import { buildSemanticJudgeVerdictSchema, validateSemanticJudgeVerdictResponse } from "./semanticJudgeVerdictSchema.js";
import { SemanticProtocolError } from "./semanticValidationError.js";
import {
  SEMANTIC_JUDGE_AUTH_HEADER_NAME,
  SEMANTIC_JUDGE_CONTENT_TYPE,
  SEMANTIC_JUDGE_CONTENT_TYPE_HEADER_NAME,
  SEMANTIC_JUDGE_HTTP_METHOD,
  SEMANTIC_JUDGE_MAX_OUTPUT_TOKENS,
  SEMANTIC_JUDGE_MODEL,
  SEMANTIC_JUDGE_STORE,
  SEMANTIC_JUDGE_STREAM,
  SEMANTIC_JUDGE_STRUCTURED_OUTPUT_NAME,
  SEMANTIC_JUDGE_TEMPERATURE,
  SEMANTIC_JUDGE_TIMEOUT_MS,
  XAI_CREDENTIAL_ENV_NAME,
  XAI_RESPONSES_ENDPOINT,
  XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH,
} from "./semanticJudgeTransportConstants.js";
import {
  JUDGE_AUTH_FAILURE,
  JUDGE_CONFIGURATION_FAILURE,
  JUDGE_HTTP_FAILURE,
  JUDGE_PROTOCOL_FAILURE,
  JUDGE_RATE_LIMIT,
  JUDGE_REFUSAL,
  JUDGE_TIMEOUT,
  JUDGE_TRANSPORT_FAILURE,
  SemanticJudgeTransportError,
} from "./semanticJudgeTransportError.js";

// J2 — Isolated xAI Responses REST adapter for the provider-neutral J1
// semantic judge. This module owns transport, credential, timeout, structured
// output envelope, and mechanical verdict extraction. It does not own
// applicability, packet construction, check identity, completeness, Result
// mutation, canonical failure materialization, or production orchestration.

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

function configFail(detail) {
  return new SemanticJudgeTransportError({
    errorCode: JUDGE_CONFIGURATION_FAILURE,
    detail,
  });
}

function protocolFail(detail) {
  return new SemanticJudgeTransportError({
    errorCode: JUDGE_PROTOCOL_FAILURE,
    detail,
  });
}

const defaultCredentialReader = () => process.env[XAI_CREDENTIAL_ENV_NAME];

export function resolveXaiSemanticJudgeCredential(credentialReader = defaultCredentialReader) {
  const reader = typeof credentialReader === "function"
    ? credentialReader
    : defaultCredentialReader;
  const value = reader();
  if (typeof value !== "string" || value.trim().length === 0) {
    throw configFail(`credential from ${XAI_CREDENTIAL_ENV_NAME} is missing, blank, or whitespace-only`);
  }
  return value.trim();
}

function resolveSubmittedChecks(judgePacket, submittedChecks) {
  if (!isPlainObject(judgePacket)) {
    throw configFail("judgePacket must be a plain object");
  }
  if (!Array.isArray(judgePacket.checks)) {
    throw configFail("judgePacket.checks must be an array");
  }
  if (submittedChecks === undefined) {
    return judgePacket.checks;
  }
  if (!Array.isArray(submittedChecks)) {
    throw configFail("submittedChecks must be an array");
  }
  if (submittedChecks.length !== judgePacket.checks.length) {
    throw configFail("submittedChecks cardinality does not match judgePacket.checks");
  }
  for (let index = 0; index < submittedChecks.length; index += 1) {
    if (submittedChecks[index]?.checkId !== judgePacket.checks[index]?.checkId) {
      throw configFail("submittedChecks identities do not match judgePacket.checks");
    }
  }
  return submittedChecks;
}

function assertSystemInstruction(systemInstruction) {
  if (typeof systemInstruction !== "string" || systemInstruction.length === 0) {
    throw configFail("systemInstruction must be a non-empty caller-supplied string");
  }
  return systemInstruction;
}

function serializeJudgePacket(judgePacket) {
  try {
    return JSON.stringify(judgePacket);
  } catch {
    throw configFail("judgePacket is not JSON-serializable");
  }
}

function assertProviderCapacity(checkCount) {
  if (checkCount > XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH) {
    throw configFail(
      `submitted batch exceeds xAI structured-output capacity of ${XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH} checks`,
    );
  }
}

export function buildXaiSemanticJudgeRequestBody({
  systemInstruction,
  judgePacket,
  submittedChecks,
} = {}) {
  const instruction = assertSystemInstruction(systemInstruction);
  const checks = resolveSubmittedChecks(judgePacket, submittedChecks);
  assertProviderCapacity(checks.length);
  const packetJson = serializeJudgePacket(judgePacket);
  const schema = buildSemanticJudgeVerdictSchema(checks);
  return deepFreeze({
    model: SEMANTIC_JUDGE_MODEL,
    store: SEMANTIC_JUDGE_STORE,
    stream: SEMANTIC_JUDGE_STREAM,
    temperature: SEMANTIC_JUDGE_TEMPERATURE,
    max_output_tokens: SEMANTIC_JUDGE_MAX_OUTPUT_TOKENS,
    input: Object.freeze([
      Object.freeze({ role: "system", content: instruction }),
      Object.freeze({ role: "user", content: packetJson }),
    ]),
    text: Object.freeze({
      format: Object.freeze({
        type: "json_schema",
        name: SEMANTIC_JUDGE_STRUCTURED_OUTPUT_NAME,
        schema,
        strict: true,
      }),
    }),
  });
}

export function extractXaiSemanticJudgeVerdictText(payload) {
  if (!isPlainObject(payload)) {
    throw protocolFail("provider response body must be a plain object");
  }
  if (payload.error !== undefined && payload.error !== null) {
    throw protocolFail("response.error is non-null");
  }
  if (payload.status !== "completed") {
    throw protocolFail(`response status is not completed (observed ${safeObservedToken(payload.status)})`);
  }
  const output = payload.output;
  if (!Array.isArray(output)) {
    throw protocolFail("response.output must be an array");
  }

  let assistantMessageCount = 0;
  const outputTexts = [];
  let refusalObserved = false;

  for (const item of output) {
    if (!isPlainObject(item)) {
      throw protocolFail("each output item must be a plain object");
    }
    if (item.type === "reasoning") {
      continue;
    }
    if (item.type !== "message") {
      throw protocolFail(`unexpected output item type ${safeObservedToken(item.type)}`);
    }
    if (item.role !== "assistant") {
      throw protocolFail("message output must have role assistant");
    }
    if (item.status !== undefined && item.status !== "completed") {
      throw protocolFail(`message status is not completed (observed ${safeObservedToken(item.status)})`);
    }
    assistantMessageCount += 1;
    if (item.refusal !== undefined && item.refusal !== null && item.refusal !== "") {
      refusalObserved = true;
    }
    if (!Array.isArray(item.content)) {
      throw protocolFail("message.content must be an array");
    }
    for (const part of item.content) {
      if (!isPlainObject(part)) {
        throw protocolFail("each message content part must be a plain object");
      }
      if (part.type === "refusal") {
        refusalObserved = true;
        continue;
      }
      if (part.type === "output_text") {
        if (typeof part.text !== "string") {
          throw protocolFail("output_text.text must be a string");
        }
        outputTexts.push(part.text);
        continue;
      }
      throw protocolFail(`unexpected message content type ${safeObservedToken(part.type)}`);
    }
  }

  if (refusalObserved) {
    throw new SemanticJudgeTransportError({
      errorCode: JUDGE_REFUSAL,
      detail: "provider response replaced the structured verdict with a refusal",
    });
  }
  if (assistantMessageCount === 0) {
    throw protocolFail("no assistant message output");
  }
  if (assistantMessageCount > 1) {
    throw protocolFail("multiple assistant message outputs");
  }
  if (outputTexts.length === 0) {
    throw protocolFail("no output_text");
  }
  if (outputTexts.length > 1) {
    throw protocolFail("multiple competing output_text payloads");
  }
  return outputTexts[0];
}

function parseVerdictJson(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw protocolFail("output_text must be a non-empty JSON document");
  }
  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw protocolFail("output_text is not parseable JSON");
  }
  return parsed;
}

function admitVerdict(submittedChecks, parsed) {
  try {
    return validateSemanticJudgeVerdictResponse({
      submittedChecks,
      response: parsed,
    });
  } catch (error) {
    if (error instanceof SemanticProtocolError) {
      throw new SemanticJudgeTransportError({
        errorCode: JUDGE_PROTOCOL_FAILURE,
        detail: "J1 verdict admission rejected the provider response",
        cause: error,
      });
    }
    throw error;
  }
}

export async function executeXaiSemanticJudge({
  systemInstruction,
  judgePacket,
  submittedChecks,
  fetchImpl,
  credentialReader,
} = {}) {
  const instruction = assertSystemInstruction(systemInstruction);
  const checks = resolveSubmittedChecks(judgePacket, submittedChecks);
  assertProviderCapacity(checks.length);

  let resolvedFetch = fetchImpl;
  if (resolvedFetch === undefined) {
    resolvedFetch = globalThis.fetch;
  }
  if (typeof resolvedFetch !== "function") {
    throw configFail("fetchImpl must be a function");
  }

  let resolvedCredentialReader = credentialReader;
  if (resolvedCredentialReader === undefined) {
    resolvedCredentialReader = defaultCredentialReader;
  }
  if (typeof resolvedCredentialReader !== "function") {
    throw configFail("credentialReader must be a function");
  }

  const credential = resolveXaiSemanticJudgeCredential(resolvedCredentialReader);
  const requestBody = buildXaiSemanticJudgeRequestBody({
    systemInstruction: instruction,
    judgePacket,
    submittedChecks: checks,
  });
  const headers = {
    [SEMANTIC_JUDGE_CONTENT_TYPE_HEADER_NAME]: SEMANTIC_JUDGE_CONTENT_TYPE,
    [SEMANTIC_JUDGE_AUTH_HEADER_NAME]: `Bearer ${credential}`,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEMANTIC_JUDGE_TIMEOUT_MS);
  let response;
  let payload;
  try {
    response = await resolvedFetch(XAI_RESPONSES_ENDPOINT, {
      method: SEMANTIC_JUDGE_HTTP_METHOD,
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    const status = typeof response?.status === "number" ? response.status : 0;
    if (status === 401 || status === 403) {
      throw new SemanticJudgeTransportError({
        errorCode: JUDGE_AUTH_FAILURE,
        httpStatus: status,
        detail: `HTTP ${status}`,
      });
    }
    if (status === 429) {
      throw new SemanticJudgeTransportError({
        errorCode: JUDGE_RATE_LIMIT,
        httpStatus: status,
        detail: "HTTP 429",
      });
    }
    if (!(status >= 200 && status < 300)) {
      throw new SemanticJudgeTransportError({
        errorCode: JUDGE_HTTP_FAILURE,
        httpStatus: status,
        detail: `HTTP ${status}`,
      });
    }
    try {
      payload = await response.json();
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) {
        throw new SemanticJudgeTransportError({
          errorCode: JUDGE_TIMEOUT,
          detail: `semantic judge body read exceeded ${SEMANTIC_JUDGE_TIMEOUT_MS} ms`,
        });
      }
      throw protocolFail("HTTP response body is not parseable JSON");
    }
  } catch (error) {
    if (error instanceof SemanticJudgeTransportError) throw error;
    if (error?.name === "AbortError") {
      throw new SemanticJudgeTransportError({
        errorCode: JUDGE_TIMEOUT,
        detail: `semantic judge call exceeded ${SEMANTIC_JUDGE_TIMEOUT_MS} ms`,
      });
    }
    throw new SemanticJudgeTransportError({
      errorCode: JUDGE_TRANSPORT_FAILURE,
      detail: `fetch transport failure: ${error?.name ?? "unknown"}`,
    });
  } finally {
    clearTimeout(timer);
  }

  const outputText = extractXaiSemanticJudgeVerdictText(payload);
  const parsed = parseVerdictJson(outputText);
  return admitVerdict(checks, parsed);
}
