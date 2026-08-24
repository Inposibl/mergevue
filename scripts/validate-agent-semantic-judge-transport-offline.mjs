import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSemanticJudgePacket } from "../src/agent/semanticJudgePacket.js";
import {
  buildSemanticJudgeVerdictSchema,
  validateSemanticJudgeVerdictResponse,
} from "../src/agent/semanticJudgeVerdictSchema.js";
import { SemanticProtocolError } from "../src/agent/semanticValidationError.js";
import {
  SEMANTIC_JUDGE_AUTH_HEADER_NAME,
  SEMANTIC_JUDGE_CONTENT_TYPE,
  SEMANTIC_JUDGE_CONTENT_TYPE_HEADER_NAME,
  SEMANTIC_JUDGE_HTTP_METHOD,
  SEMANTIC_JUDGE_MAX_OUTPUT_TOKENS,
  SEMANTIC_JUDGE_MODEL,
  SEMANTIC_JUDGE_PROVIDER,
  SEMANTIC_JUDGE_STORE,
  SEMANTIC_JUDGE_STREAM,
  SEMANTIC_JUDGE_STRUCTURED_OUTPUT_NAME,
  SEMANTIC_JUDGE_TEMPERATURE,
  SEMANTIC_JUDGE_TIMEOUT_MS,
  XAI_CREDENTIAL_ENV_NAME,
  XAI_RESPONSES_ENDPOINT,
  XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH,
} from "../src/agent/semanticJudgeTransportConstants.js";
import {
  JUDGE_AUTH_FAILURE,
  JUDGE_CONFIGURATION_FAILURE,
  JUDGE_HTTP_FAILURE,
  JUDGE_PROTOCOL_FAILURE,
  JUDGE_RATE_LIMIT,
  JUDGE_REFUSAL,
  JUDGE_TIMEOUT,
  JUDGE_TRANSPORT_FAILURE,
  SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES,
  SemanticJudgeTransportError,
} from "../src/agent/semanticJudgeTransportError.js";
import {
  buildXaiSemanticJudgeRequestBody,
  executeXaiSemanticJudge,
  extractXaiSemanticJudgeVerdictText,
  resolveXaiSemanticJudgeCredential,
} from "../src/agent/semanticJudgeTransport.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKET_TARGET_SENTINEL = "UNIQUE_PACKET_TARGET_PROSE_SENTINEL_J2";
const TEST_CREDENTIAL = "xai-test-key-SENTINEL-do-not-leak";
const SYSTEM_INSTRUCTION = "CALLER_OWNED_SYSTEM_INSTRUCTION_BYTE_FOR_BYTE_J2";

const FORBIDDEN_REQUEST_KEYS = Object.freeze([
  "tools",
  "tool_choice",
  "search_parameters",
  "web_search_options",
  "previous_response_id",
  "seed",
  "top_p",
  "reasoning",
  "reasoning_effort",
  "background",
  "include",
  "functions",
  "function_call",
  "mcp",
  "file_search",
  "collections",
  "image_generation",
  "max_turns",
  "parallel_tool_calls",
  "prompt_cache_key",
  "n",
]);

const J1_PRODUCTION_FILES = Object.freeze([
  "src/agent/semanticApplicability.js",
  "src/agent/semanticCheckEnumerator.js",
  "src/agent/semanticCompleteness.js",
  "src/agent/semanticJudge.js",
  "src/agent/semanticJudgePacket.js",
  "src/agent/semanticJudgeVerdictSchema.js",
  "src/agent/semanticLocalEvaluator.js",
  "src/agent/semanticValidationError.js",
  "src/agent/semanticValidator.js",
  "src/agent/semanticValidatorConstants.js",
]);

const CLOSED_UPSTREAM_FILES = Object.freeze([
  "src/agent/providerProjection.js",
  "src/agent/providerPrompt.js",
  "src/agent/providerSemanticCandidateSchema.js",
  "src/agent/providerExecution.js",
  "src/agent/providerExecutionConstants.js",
  "src/agent/providerExecutionError.js",
  "src/agent/agentInterpretationResult.js",
  "src/agent/agentInterpretationResultSchema.js",
  "src/agent/agentContractConstants.js",
  "src/agent/canonicalDigest.js",
]);

function makeCheck(index) {
  const id = String(index + 1).padStart(3, "0");
  const authorityKind = "ENGINE_FACT";
  const authorityId = `fact-${id}`;
  const locator = `claims[${index}].text`;
  const authority = { kind: authorityKind, id: authorityId, value: { sealed: true, index } };
  return {
    checkId: `sha256:check-${id}`,
    ruleId: "V-02",
    semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
    targetFamily: "CLAIM_TEXT",
    targetLocator: locator,
    expectedInvariant: "Authored prose must not change Engine state.",
    allowedSemanticInterpretations: ["Restating sealed engine state."],
    forbiddenSemanticImplications: ["Inventing an engine value."],
    authorityIds: [`${authorityKind}:${authorityId}`],
    authorities: [authority],
    target: {
      targetFamily: "CLAIM_TEXT",
      targetLocator: locator,
      targetDigest: `sha256:digest-${id}`,
      text: `${PACKET_TARGET_SENTINEL} #${id}`,
      metadata: {},
    },
  };
}

function makePacket(checkCount = 2) {
  return buildSemanticJudgePacket({
    checks: Array.from({ length: checkCount }, (_, index) => makeCheck(index)),
    batchIndex: 0,
    batchCount: 1,
  });
}

function lawfulVerdicts(packet) {
  return packet.checks.map((check) => ({
    checkId: check.checkId,
    ruleId: check.ruleId,
    targetLocator: check.targetLocator,
    verdict: "PASS",
    violationCode: null,
    reasonCode: "RULE_SATISFIED",
    supportingAuthorityIds: [...check.authorityIds],
  }));
}

function completedResponse(verdicts, extraOutputItems = []) {
  return {
    id: "resp_test_must_not_surface",
    object: "response",
    status: "completed",
    error: null,
    model: SEMANTIC_JUDGE_MODEL,
    usage: { input_tokens: 11, output_tokens: 7, total_tokens: 18 },
    output: [
      ...extraOutputItems,
      {
        id: "msg_test_must_not_surface",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [
          {
            type: "output_text",
            text: JSON.stringify(verdicts),
            logprobs: null,
            annotations: [{ type: "url_citation", url: "https://example.invalid" }],
          },
        ],
      },
    ],
  };
}

function makeAbortError() {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

function jsonResponse(status, body) {
  return {
    status,
    json: async () => {
      if (typeof body === "string") throw new SyntaxError("Unexpected token");
      return body;
    },
  };
}

function capturingFetch(responder) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({
      url,
      method: init.method,
      headers: init.headers,
      bodyText: init.body,
      body: JSON.parse(init.body),
      signal: init.signal,
    });
    return responder(url, init, calls);
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

async function executeWith(packet, responder, extras = {}) {
  const fetchImpl = capturingFetch(responder);
  const args = {
    systemInstruction: extras.systemInstruction ?? SYSTEM_INSTRUCTION,
    judgePacket: packet,
    submittedChecks: extras.submittedChecks ?? packet.checks,
    fetchImpl,
    credentialReader: extras.credentialReader ?? (() => TEST_CREDENTIAL),
  };
  try {
    const result = await executeXaiSemanticJudge(args);
    return { result, calls: fetchImpl.calls, error: null };
  } catch (error) {
    return { result: null, calls: fetchImpl.calls, error };
  }
}

function assertTransportError(error, errorCode) {
  assert.ok(error instanceof SemanticJudgeTransportError, `expected SemanticJudgeTransportError, got ${error?.name}: ${error?.message}`);
  assert.equal(error.errorCode, errorCode, error.message);
}

function assertNoLeakage(error) {
  const serialized = JSON.stringify(error);
  const message = String(error?.message ?? "");
  const detail = String(error?.detail ?? "");
  const stack = String(error?.stack ?? "");
  for (const haystack of [serialized, message, detail, stack]) {
    assert.equal(haystack.includes(TEST_CREDENTIAL), false, "credential must not leak");
    assert.equal(haystack.includes(PACKET_TARGET_SENTINEL), false, "raw packet target text must not leak");
  }
}

function collectKeys(value, keys = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys);
    return keys;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      keys.add(key);
      collectKeys(child, keys);
    }
  }
  return keys;
}

function walkFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(directory, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) walkFiles(full, files);
    else files.push(full);
  }
  return files;
}

const EXECUTABLE_TRANSPORT_MODULE = "semanticJudgeTransport.js";
const ERROR_CONTRACT_MODULE = "semanticJudgeTransportError.js";
const EXECUTABLE_TRANSPORT_MODULE_PATH = "src/agent/semanticJudgeTransport.js";
const AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTER = "src/agent/semanticJudgeAdapter.js";
const AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTERS = Object.freeze([
  AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTER,
]);

function repoRelativePath(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function specifierBasename(specifier) {
  const trimmed = String(specifier).split("?")[0].split("#")[0].replaceAll("\\", "/");
  return basename(trimmed);
}

function isExecutableTransportSpecifier(specifier) {
  return specifierBasename(specifier) === EXECUTABLE_TRANSPORT_MODULE;
}

function isErrorContractSpecifier(specifier) {
  return specifierBasename(specifier) === ERROR_CONTRACT_MODULE;
}

function isIdentStart(ch) {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentCont(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function tokenizeJs(source) {
  const tokens = [];
  let index = 0;
  const length = source.length;

  function peek(offset = 0) {
    return source[index + offset];
  }

  function skipLineComment() {
    index += 2;
    while (index < length && source[index] !== "\n") index += 1;
  }

  function skipBlockComment() {
    index += 2;
    while (index < length && !(source[index] === "*" && peek(1) === "/")) index += 1;
    if (index < length) index += 2;
  }

  function readQuotedString(quote) {
    index += 1;
    let value = "";
    while (index < length) {
      const ch = source[index];
      if (ch === "\\") {
        value += peek(1) ?? "";
        index += 2;
        continue;
      }
      if (ch === quote) {
        index += 1;
        return value;
      }
      value += ch;
      index += 1;
    }
    return value;
  }

  function readTemplate() {
    index += 1;
    let value = "";
    let substituted = false;
    while (index < length) {
      const ch = source[index];
      if (ch === "\\") {
        value += peek(1) ?? "";
        index += 2;
        continue;
      }
      if (ch === "`") {
        index += 1;
        if (substituted) tokens.push({ type: "template_sub" });
        else tokens.push({ type: "string", value });
        return;
      }
      if (ch === "$" && peek(1) === "{") {
        substituted = true;
        index += 2;
        readTemplateExpression();
        continue;
      }
      value += ch;
      index += 1;
    }
    if (substituted) tokens.push({ type: "template_sub" });
    else tokens.push({ type: "string", value });
  }

  function readTemplateExpression() {
    let depth = 1;
    while (index < length && depth > 0) {
      const ch = source[index];
      const next = peek(1);
      if (ch === "/" && next === "/") {
        skipLineComment();
        continue;
      }
      if (ch === "/" && next === "*") {
        skipBlockComment();
        continue;
      }
      if (ch === "'" || ch === "\"") {
        tokens.push({ type: "string", value: readQuotedString(ch) });
        continue;
      }
      if (ch === "`") {
        readTemplate();
        continue;
      }
      if (ch === "{") {
        depth += 1;
        index += 1;
        continue;
      }
      if (ch === "}") {
        depth -= 1;
        index += 1;
        continue;
      }
      if (/\s/.test(ch)) {
        index += 1;
        continue;
      }
      if (isIdentStart(ch)) {
        let ident = "";
        while (index < length && isIdentCont(source[index])) {
          ident += source[index];
          index += 1;
        }
        tokens.push({ type: "ident", value: ident });
        continue;
      }
      tokens.push({ type: "punct", value: ch });
      index += 1;
    }
  }

  while (index < length) {
    const ch = source[index];
    const next = peek(1);
    if (/\s/.test(ch)) {
      index += 1;
      continue;
    }
    if (ch === "/" && next === "/") {
      skipLineComment();
      continue;
    }
    if (ch === "/" && next === "*") {
      skipBlockComment();
      continue;
    }
    if (ch === "'" || ch === "\"") {
      tokens.push({ type: "string", value: readQuotedString(ch) });
      continue;
    }
    if (ch === "`") {
      readTemplate();
      continue;
    }
    if (isIdentStart(ch)) {
      let ident = "";
      while (index < length && isIdentCont(source[index])) {
        ident += source[index];
        index += 1;
      }
      tokens.push({ type: "ident", value: ident });
      continue;
    }
    tokens.push({ type: "punct", value: ch });
    index += 1;
  }
  return tokens;
}

function analyzeExecutableTransportDependency(source) {
  const tokens = tokenizeJs(source);
  const specifiers = [];
  const computedDynamicImports = [];
  let invokesExecute = false;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const next = tokens[index + 1];
    if (token.type === "ident" && token.value === "executeXaiSemanticJudge") {
      if (next && next.type === "punct" && next.value === "(") invokesExecute = true;
    }
    if (token.type === "ident" && token.value === "import") {
      if (next && next.type === "punct" && next.value === "(") {
        const firstArg = tokens[index + 2];
        if (firstArg && firstArg.type === "string") specifiers.push(firstArg.value);
        else computedDynamicImports.push({ firstArgumentKind: "COMPUTED" });
        continue;
      }
      if (next && next.type === "string") {
        specifiers.push(next.value);
        continue;
      }
      for (let cursor = index + 1; cursor < tokens.length; cursor += 1) {
        const current = tokens[cursor];
        if (current.type === "punct" && current.value === ";") break;
        if (current.type === "ident" && current.value === "import") break;
        if (current.type === "ident" && current.value === "from") {
          const spec = tokens[cursor + 1];
          if (spec && spec.type === "string") specifiers.push(spec.value);
          break;
        }
      }
      continue;
    }
    if (token.type === "ident" && token.value === "export") {
      for (let cursor = index + 1; cursor < tokens.length; cursor += 1) {
        const current = tokens[cursor];
        if (current.type === "punct" && current.value === ";") break;
        if (current.type === "ident" && (current.value === "import" || current.value === "export")) break;
        if (current.type === "ident" && current.value === "from") {
          const spec = tokens[cursor + 1];
          if (spec && spec.type === "string") specifiers.push(spec.value);
          break;
        }
      }
    }
  }

  const executableImports = specifiers.filter((specifier) => isExecutableTransportSpecifier(specifier));
  const errorContractImports = specifiers.filter((specifier) => isErrorContractSpecifier(specifier));
  return {
    specifiers,
    executableImports,
    errorContractImports,
    invokesExecute,
    computedDynamicImports,
    hasExecutableDependency: executableImports.length > 0 || invokesExecute,
  };
}

function collectProductionExecutableTransportImporters() {
  const importers = [];
  for (const file of walkFiles(join(ROOT, "src"))) {
    const relativePath = repoRelativePath(file);
    if (relativePath === EXECUTABLE_TRANSPORT_MODULE_PATH) continue;
    const analysis = analyzeExecutableTransportDependency(readFileSync(file, "utf8"));
    if (analysis.hasExecutableDependency) importers.push(relativePath);
  }
  importers.sort();
  return importers;
}

const results = [];
async function check(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

async function main() {
  const packet = makePacket(2);
  const verdicts = lawfulVerdicts(packet);
  const successResponder = () => jsonResponse(200, completedResponse(verdicts));

  await check("JT01", "exact Responses endpoint", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "https://api.x.ai/v1/responses");
    assert.equal(calls[0].url, XAI_RESPONSES_ENDPOINT);
  });

  await check("JT02", "HTTP method POST", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].method, SEMANTIC_JUDGE_HTTP_METHOD);
  });

  await check("JT03", "Content-Type application/json", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].headers[SEMANTIC_JUDGE_CONTENT_TYPE_HEADER_NAME], SEMANTIC_JUDGE_CONTENT_TYPE);
    assert.equal(calls[0].headers["Content-Type"], "application/json");
  });

  await check("JT04", "Authorization Bearer fake key", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].headers[SEMANTIC_JUDGE_AUTH_HEADER_NAME], `Bearer ${TEST_CREDENTIAL}`);
    assert.equal(calls[0].headers.Authorization, `Bearer ${TEST_CREDENTIAL}`);
  });

  await check("JT05", "exact date-pinned model", async () => {
    assert.equal(SEMANTIC_JUDGE_MODEL, "grok-4.20-0309-non-reasoning");
    assert.equal(SEMANTIC_JUDGE_PROVIDER, "xai");
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.model, "grok-4.20-0309-non-reasoning");
  });

  await check("JT06", "store === false", async () => {
    assert.equal(SEMANTIC_JUDGE_STORE, false);
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.store, false);
  });

  await check("JT07", "temperature === 0", async () => {
    assert.equal(SEMANTIC_JUDGE_TEMPERATURE, 0);
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.temperature, 0);
  });

  await check("JT08", "max_output_tokens === 512", async () => {
    assert.equal(SEMANTIC_JUDGE_MAX_OUTPUT_TOKENS, 512);
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.max_output_tokens, 512);
  });

  await check("JT09", "no seed", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(Object.hasOwn(calls[0].body, "seed"), false);
  });

  await check("JT10", "no top_p", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(Object.hasOwn(calls[0].body, "top_p"), false);
  });

  await check("JT11", "no previous_response_id", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(Object.hasOwn(calls[0].body, "previous_response_id"), false);
  });

  await check("JT12", "no tool/search/retrieval fields", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    const keys = collectKeys(calls[0].body);
    for (const forbidden of FORBIDDEN_REQUEST_KEYS) {
      assert.equal(keys.has(forbidden), false, forbidden);
      assert.equal(Object.hasOwn(calls[0].body, forbidden), false, forbidden);
    }
    assert.equal(SEMANTIC_JUDGE_STREAM, false);
    assert.equal(calls[0].body.stream, false);
  });

  await check("JT13", "no SDK import/dependency", async () => {
    const transportFiles = [
      join(ROOT, "src/agent/semanticJudgeTransport.js"),
      join(ROOT, "src/agent/semanticJudgeTransportConstants.js"),
      join(ROOT, "src/agent/semanticJudgeTransportError.js"),
    ];
    for (const file of transportFiles) {
      const source = readFileSync(file, "utf8");
      assert.equal(source.includes("openai"), false, file);
      assert.equal(source.includes("@ai-sdk"), false, file);
      assert.equal(source.includes("xai-sdk"), false, file);
      assert.equal(source.includes("from \"ai\""), false, file);
      assert.equal(source.includes("from 'ai'"), false, file);
    }
    const packageJson = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    const depNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];
    for (const name of depNames) {
      assert.equal(name.includes("openai"), false, name);
      assert.equal(name.includes("ai-sdk"), false, name);
      assert.equal(name.includes("xai-sdk"), false, name);
    }
  });

  await check("JT14", "system instruction preserved byte-for-byte", async () => {
    const instruction = `${SYSTEM_INSTRUCTION}\nexact-bytes://preserve`;
    const { calls, error } = await executeWith(packet, successResponder, { systemInstruction: instruction });
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.input[0].role, "system");
    assert.equal(calls[0].body.input[0].content, instruction);
    assert.equal(calls[0].body.input[0].content.includes(PACKET_TARGET_SENTINEL), false);
  });

  await check("JT15", "J1 packet semantic content preserved", async () => {
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    assert.equal(calls[0].body.input[1].role, "user");
    const sent = JSON.parse(calls[0].body.input[1].content);
    assert.deepEqual(sent, JSON.parse(JSON.stringify(packet)));
    assert.equal(sent.checks.length, packet.checks.length);
    for (let index = 0; index < packet.checks.length; index += 1) {
      assert.equal(sent.checks[index].checkId, packet.checks[index].checkId);
      assert.equal(sent.checks[index].ruleId, packet.checks[index].ruleId);
      assert.equal(sent.checks[index].targetLocator, packet.checks[index].targetLocator);
      assert.equal(sent.checks[index].expectedInvariant, packet.checks[index].expectedInvariant);
      assert.deepEqual(sent.checks[index].allowedSemanticInterpretations, packet.checks[index].allowedSemanticInterpretations);
      assert.deepEqual(sent.checks[index].forbiddenSemanticImplications, packet.checks[index].forbiddenSemanticImplications);
    }
    assert.equal(sent.targets[0].text, packet.targets[0].text);
    assert.equal(Object.hasOwn(calls[0].body, "instructions"), false);
  });

  await check("JT16", "dynamic J1 verdict schema in Responses text.format", async () => {
    const expectedSchema = buildSemanticJudgeVerdictSchema(packet.checks);
    const { calls, error } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    const format = calls[0].body.text.format;
    assert.equal(format.type, "json_schema");
    assert.equal(format.name, "semantic_judge_verdict_batch");
    assert.equal(format.name, SEMANTIC_JUDGE_STRUCTURED_OUTPUT_NAME);
    assert.equal(format.strict, true);
    assert.deepEqual(JSON.parse(JSON.stringify(format.schema)), JSON.parse(JSON.stringify(expectedSchema)));
    assert.equal(format.schema.minItems, packet.checks.length);
    assert.equal(format.schema.maxItems, packet.checks.length);
  });

  await check("JT17", "valid completed response parsed and J1-admitted", async () => {
    const { result, error, calls } = await executeWith(packet, successResponder);
    assert.equal(error, null, error?.message);
    const admitted = validateSemanticJudgeVerdictResponse({
      submittedChecks: packet.checks,
      response: verdicts,
    });
    assert.deepEqual(result, admitted);
    assert.equal(Array.isArray(result), true);
    assert.equal(result.length, packet.checks.length);
    const resultKeys = collectKeys(result);
    assert.equal(resultKeys.has("id"), false);
    assert.equal(resultKeys.has("usage"), false);
    assert.equal(resultKeys.has("output_text"), false);
    assert.equal(JSON.stringify(result).includes("resp_test_must_not_surface"), false);
    assert.equal(JSON.stringify(result).includes("url_citation"), false);
    assert.equal(calls.length, 1);
  });

  await check("JT18", "missing credential: JUDGE_CONFIGURATION_FAILURE, fetch=0", async () => {
    for (const reader of [() => undefined, () => "", () => "   "]) {
      const { error, calls } = await executeWith(packet, successResponder, { credentialReader: reader });
      assertTransportError(error, JUDGE_CONFIGURATION_FAILURE);
      assert.equal(calls.length, 0);
      assertNoLeakage(error);
    }
    assert.equal(XAI_CREDENTIAL_ENV_NAME, "XAI_API_KEY");
    assert.throws(
      () => resolveXaiSemanticJudgeCredential(() => null),
      (error) => error instanceof SemanticJudgeTransportError && error.errorCode === JUDGE_CONFIGURATION_FAILURE,
    );
  });

  await check("JT19", "network rejection: JUDGE_TRANSPORT_FAILURE", async () => {
    const networkError = new TypeError("fetch failed");
    const { error, calls } = await executeWith(packet, () => Promise.reject(networkError));
    assertTransportError(error, JUDGE_TRANSPORT_FAILURE);
    assert.equal(calls.length, 1);
    assert.equal(error.detail.includes("TypeError"), true);
    assertNoLeakage(error);
  });

  await check("JT20", "timeout: JUDGE_TIMEOUT, AbortController armed at 20000ms", async () => {
    const immediate = await executeWith(packet, () => Promise.reject(makeAbortError()));
    assertTransportError(immediate.error, JUDGE_TIMEOUT);
    assert.equal(immediate.calls.length, 1);
    assertNoLeakage(immediate.error);

    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;
    let capturedDelay = null;
    let clearCount = 0;
    globalThis.setTimeout = (fn, delay, ...rest) => {
      capturedDelay = delay;
      return originalSetTimeout(fn, 5, ...rest);
    };
    globalThis.clearTimeout = (id, ...rest) => {
      clearCount += 1;
      return originalClearTimeout(id, ...rest);
    };
    let hangingInvocations = 0;
    const hangingTransport = (_url, init) => {
      hangingInvocations += 1;
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(makeAbortError()));
      });
    };
    try {
      const { error } = await executeWith(packet, hangingTransport);
      assertTransportError(error, JUDGE_TIMEOUT);
      assert.equal(hangingInvocations, 1);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    }
    assert.equal(SEMANTIC_JUDGE_TIMEOUT_MS, 20000);
    assert.equal(capturedDelay, 20000);
    assert.equal(clearCount, 1);
  });

  await check("JT21", "HTTP 401: JUDGE_AUTH_FAILURE", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(401, { error: "no" }));
    assertTransportError(error, JUDGE_AUTH_FAILURE);
    assert.equal(error.httpStatus, 401);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT22", "HTTP 403: JUDGE_AUTH_FAILURE", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(403, { error: "no" }));
    assertTransportError(error, JUDGE_AUTH_FAILURE);
    assert.equal(error.httpStatus, 403);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT23", "HTTP 429: JUDGE_RATE_LIMIT", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(429, { error: "rate" }));
    assertTransportError(error, JUDGE_RATE_LIMIT);
    assert.equal(error.httpStatus, 429);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT24", "other 4xx: JUDGE_HTTP_FAILURE", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(400, { error: "bad" }));
    assertTransportError(error, JUDGE_HTTP_FAILURE);
    assert.equal(error.httpStatus, 400);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT25", "5xx: JUDGE_HTTP_FAILURE", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(503, { error: "down" }));
    assertTransportError(error, JUDGE_HTTP_FAILURE);
    assert.equal(error.httpStatus, 503);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT26", "200 non-JSON: JUDGE_PROTOCOL_FAILURE", async () => {
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, "not-json"));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT27", "status incomplete: JUDGE_PROTOCOL_FAILURE", async () => {
    const body = completedResponse(verdicts);
    body.status = "incomplete";
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT28", "response.error non-null: JUDGE_PROTOCOL_FAILURE", async () => {
    const body = completedResponse(verdicts);
    body.error = { message: "provider error" };
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assert.equal(String(error.detail).includes("provider error"), false);
    assertNoLeakage(error);
  });

  await check("JT29", "no message output: JUDGE_PROTOCOL_FAILURE", async () => {
    const body = completedResponse(verdicts);
    body.output = [{ type: "reasoning", status: "completed", summary: [] }];
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT30", "no output_text: JUDGE_PROTOCOL_FAILURE", async () => {
    const body = completedResponse(verdicts);
    body.output[0].content = [];
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT31", "ambiguous multiple output_text: JUDGE_PROTOCOL_FAILURE", async () => {
    const body = completedResponse(verdicts);
    body.output[0].content.push({
      type: "output_text",
      text: JSON.stringify(verdicts),
    });
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT32", "refusal: JUDGE_REFUSAL", async () => {
    const body = completedResponse(verdicts);
    body.output[0].content = [{ type: "refusal", refusal: "safety" }];
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, body));
    assertTransportError(error, JUDGE_REFUSAL);
    assert.equal(calls.length, 1);
    assertNoLeakage(error);
  });

  await check("JT33", "wrong checkId: J1 admission rejects", async () => {
    const attack = lawfulVerdicts(packet);
    attack[0] = { ...attack[0], checkId: "sha256:unknown-check-identity" };
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, completedResponse(attack)));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.ok(error.cause instanceof SemanticProtocolError);
    assert.equal(calls.length, 1);
    assert.throws(
      () => validateSemanticJudgeVerdictResponse({ submittedChecks: packet.checks, response: attack }),
      (admissionError) => admissionError instanceof SemanticProtocolError,
    );
    assertNoLeakage(error);
  });

  await check("JT34", "wrong canonical violationCode: J1 admission rejects", async () => {
    const attack = lawfulVerdicts(packet);
    attack[0] = {
      ...attack[0],
      verdict: "FAIL",
      violationCode: "GROUNDING_VALIDATION_FAILURE",
      reasonCode: "RULE_VIOLATED",
    };
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, completedResponse(attack)));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.ok(error.cause instanceof SemanticProtocolError);
    assert.equal(calls.length, 1);
    assert.throws(
      () => validateSemanticJudgeVerdictResponse({ submittedChecks: packet.checks, response: attack }),
      (admissionError) => admissionError instanceof SemanticProtocolError,
    );
    assertNoLeakage(error);
  });

  await check("JT35", "invalid UNABLE reason: J1 admission rejects", async () => {
    const attack = lawfulVerdicts(packet);
    attack[0] = {
      ...attack[0],
      verdict: "UNABLE_TO_EVALUATE",
      violationCode: null,
      reasonCode: "RULE_SATISFIED",
    };
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, completedResponse(attack)));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.ok(error.cause instanceof SemanticProtocolError);
    assert.equal(calls.length, 1);
    assert.throws(
      () => validateSemanticJudgeVerdictResponse({ submittedChecks: packet.checks, response: attack }),
      (admissionError) => admissionError instanceof SemanticProtocolError,
    );
    assertNoLeakage(error);
  });

  await check("JT36", "supportingAuthorityIds outside submitted check: J1 admission rejects", async () => {
    const attack = lawfulVerdicts(packet);
    attack[0] = {
      ...attack[0],
      supportingAuthorityIds: [...attack[0].supportingAuthorityIds, "ENGINE_FACT:not-in-this-check"],
    };
    const { error, calls } = await executeWith(packet, () => jsonResponse(200, completedResponse(attack)));
    assertTransportError(error, JUDGE_PROTOCOL_FAILURE);
    assert.ok(error.cause instanceof SemanticProtocolError);
    assert.equal(calls.length, 1);
    assert.throws(
      () => validateSemanticJudgeVerdictResponse({ submittedChecks: packet.checks, response: attack }),
      (admissionError) => admissionError instanceof SemanticProtocolError,
    );
    assertNoLeakage(error);
  });

  await check("JT37", "no automatic retry: fetch count remains 1 on provider failures", async () => {
    const cases = [
      [() => Promise.reject(new TypeError("fetch failed")), JUDGE_TRANSPORT_FAILURE],
      [() => Promise.reject(makeAbortError()), JUDGE_TIMEOUT],
      [() => jsonResponse(401, {}), JUDGE_AUTH_FAILURE],
      [() => jsonResponse(403, {}), JUDGE_AUTH_FAILURE],
      [() => jsonResponse(429, {}), JUDGE_RATE_LIMIT],
      [() => jsonResponse(400, {}), JUDGE_HTTP_FAILURE],
      [() => jsonResponse(500, {}), JUDGE_HTTP_FAILURE],
      [() => jsonResponse(200, "nope"), JUDGE_PROTOCOL_FAILURE],
      [() => {
        const body = completedResponse(verdicts);
        body.output[0].content = [{ type: "refusal", refusal: "no" }];
        return jsonResponse(200, body);
      }, JUDGE_REFUSAL],
    ];
    for (const [responder, code] of cases) {
      const { error, calls } = await executeWith(packet, responder);
      assertTransportError(error, code);
      assert.equal(calls.length, 1, code);
    }
  });

  await check("JT38", "key absent from thrown error serialization/message/detail", async () => {
    const { error } = await executeWith(packet, () => jsonResponse(401, { error: TEST_CREDENTIAL }));
    assertTransportError(error, JUDGE_AUTH_FAILURE);
    assertNoLeakage(error);
    assert.equal(JSON.stringify(error.toJSON()).includes(TEST_CREDENTIAL), false);
  });

  await check("JT39", "raw packet/target text absent from transport error detail", async () => {
    const { error } = await executeWith(packet, () => Promise.reject(new TypeError(PACKET_TARGET_SENTINEL)));
    assertTransportError(error, JUDGE_TRANSPORT_FAILURE);
    assertNoLeakage(error);
  });

  await check("JT40", "256 capability exported at J2 only", async () => {
    assert.equal(XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH, 256);
    const j1Constants = readFileSync(join(ROOT, "src/agent/semanticValidatorConstants.js"), "utf8");
    assert.equal(j1Constants.includes("XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH"), false);
    assert.equal(j1Constants.includes("256"), false);
    const j1Judge = readFileSync(join(ROOT, "src/agent/semanticJudge.js"), "utf8");
    assert.equal(j1Judge.includes("XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH"), false);
  });

  await check("JT41", "batch > 256 fails before network and is never truncated", async () => {
    const oversized = makePacket(257);
    assert.equal(oversized.checks.length, 257);
    const { error, calls } = await executeWith(oversized, successResponder);
    assertTransportError(error, JUDGE_CONFIGURATION_FAILURE);
    assert.equal(calls.length, 0);
    assert.equal(oversized.checks.length, 257);
    assert.throws(
      () => buildXaiSemanticJudgeRequestBody({
        systemInstruction: SYSTEM_INSTRUCTION,
        judgePacket: oversized,
        submittedChecks: oversized.checks,
      }),
      (buildError) => buildError instanceof SemanticJudgeTransportError
        && buildError.errorCode === JUDGE_CONFIGURATION_FAILURE,
    );
    const atCapacity = makePacket(256);
    const { error: okError, calls: okCalls } = await executeWith(
      atCapacity,
      () => jsonResponse(200, completedResponse(lawfulVerdicts(atCapacity))),
    );
    assert.equal(okError, null, okError?.message);
    assert.equal(okCalls.length, 1);
    assert.equal(okCalls[0].body.text.format.schema.minItems, 256);
    assert.equal(okCalls[0].body.text.format.schema.maxItems, 256);
  });

  await check("JT42", "reasoning/tool/citation metadata is not surfaced as semantic output", async () => {
    const reasoningItem = {
      id: "rs_hidden",
      type: "reasoning",
      status: "completed",
      summary: [{ type: "summary_text", text: "chain-of-thought must not leak" }],
    };
    const { result, error } = await executeWith(
      packet,
      () => jsonResponse(200, completedResponse(verdicts, [reasoningItem])),
    );
    assert.equal(error, null, error?.message);
    const dumped = JSON.stringify(result);
    assert.equal(dumped.includes("chain-of-thought must not leak"), false);
    assert.equal(dumped.includes("rs_hidden"), false);
    assert.equal(dumped.includes("url_citation"), false);
    assert.equal(dumped.includes("resp_test_must_not_surface"), false);
    assert.equal(Object.hasOwn(result, "usage"), false);

    const toolBody = completedResponse(verdicts);
    toolBody.output.unshift({ type: "function_call", name: "web_search", arguments: "{}" });
    const toolCase = await executeWith(packet, () => jsonResponse(200, toolBody));
    assertTransportError(toolCase.error, JUDGE_PROTOCOL_FAILURE);
    assert.equal(toolCase.calls.length, 1);
  });

  await check("JT43", "closed error taxonomy and no SystemFailure", async () => {
    assert.deepEqual([...SEMANTIC_JUDGE_TRANSPORT_ERROR_CODES], [
      JUDGE_CONFIGURATION_FAILURE,
      JUDGE_TRANSPORT_FAILURE,
      JUDGE_TIMEOUT,
      JUDGE_AUTH_FAILURE,
      JUDGE_RATE_LIMIT,
      JUDGE_HTTP_FAILURE,
      JUDGE_PROTOCOL_FAILURE,
      JUDGE_REFUSAL,
    ]);
    const transportSource = readFileSync(join(ROOT, "src/agent/semanticJudgeTransport.js"), "utf8")
      + readFileSync(join(ROOT, "src/agent/semanticJudgeTransportError.js"), "utf8");
    assert.equal(transportSource.includes("SystemFailure"), false);
    assert.equal(transportSource.includes("ProviderExecutionError"), false);
    assert.equal(transportSource.includes("ResultAssemblyError"), false);
    assert.equal(transportSource.includes("SemanticViolationError"), false);
    assert.equal(transportSource.includes("PROVIDER_"), false);
  });

  await check("JT44", "exactly one authorized production executable transport importer", async () => {
    const adapterSource = readFileSync(join(ROOT, AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTER), "utf8");
    const adapter = analyzeExecutableTransportDependency(adapterSource);
    assert.equal(adapter.executableImports.length > 0, true);
    assert.equal(adapter.invokesExecute, true);
    assert.equal(adapter.hasExecutableDependency, true);
    assert.equal(
      adapter.executableImports.every((specifier) => isExecutableTransportSpecifier(specifier)),
      true,
    );

    const actualImporters = collectProductionExecutableTransportImporters();
    assert.deepEqual(actualImporters, [...AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTERS]);
    assert.equal(actualImporters.length, 1);
    assert.equal(actualImporters[0], AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTER);

    const syntheticSecondRelative = "src/agent/unauthorizedSemanticJudgeTransportConsumer.js";
    assert.notEqual(syntheticSecondRelative, AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTER);
    const syntheticSource = "import { executeXaiSemanticJudge } from \"./semanticJudgeTransport.js\";\nexecuteXaiSemanticJudge({});\n";
    const synthetic = analyzeExecutableTransportDependency(syntheticSource);
    assert.equal(synthetic.hasExecutableDependency, true);
    assert.equal(synthetic.executableImports.length > 0, true);
    assert.equal(synthetic.invokesExecute, true);
    const withSyntheticSecond = [...actualImporters, syntheticSecondRelative].sort();
    assert.notDeepEqual(withSyntheticSecond, [...AUTHORIZED_EXECUTABLE_TRANSPORT_IMPORTERS]);

    const j3Source = readFileSync(join(ROOT, "src/agent/semanticSystemFailure.js"), "utf8");
    const j3 = analyzeExecutableTransportDependency(j3Source);
    assert.equal(j3.errorContractImports.length > 0, true);
    assert.equal(j3.executableImports.length, 0);
    assert.equal(j3.invokesExecute, false);
    assert.equal(j3.hasExecutableDependency, false);
    assert.equal(j3Source.includes("from \"./semanticJudgeTransportError.js\""), true);
    for (const fragment of ["fetch(", "api.x.ai", "XAI_API_KEY", "AbortController", "executeXaiSemanticJudge"]) {
      assert.equal(j3Source.includes(fragment), false, fragment);
    }

    for (const relativePath of [...J1_PRODUCTION_FILES, ...CLOSED_UPSTREAM_FILES]) {
      const source = readFileSync(join(ROOT, relativePath), "utf8");
      const analysis = analyzeExecutableTransportDependency(source);
      assert.equal(analysis.hasExecutableDependency, false, relativePath);
    }
  });

  await check("JT44A", "legal error-contract import is not production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import { SemanticJudgeTransportError } from \"./semanticJudgeTransportError.js\";\n",
    );
    assert.equal(analysis.errorContractImports.length, 1);
    assert.equal(analysis.executableImports.length, 0);
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44B", "named executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import { executeXaiSemanticJudge } from \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44C", "aliased executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import { executeXaiSemanticJudge as runJudge } from \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44D", "namespace executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import * as transport from \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44E", "default executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import transport from \"../agent/semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44F", "side-effect executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency("import \"./semanticJudgeTransport.js\";\n");
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44G", "multiline executable import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import {\n  executeXaiSemanticJudge\n} from \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44H", "re-export of executable module is production wiring", () => {
    const named = analyzeExecutableTransportDependency(
      "export { executeXaiSemanticJudge } from \"./semanticJudgeTransport.js\";\n",
    );
    const star = analyzeExecutableTransportDependency(
      "export * from \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(named.hasExecutableDependency, true);
    assert.equal(star.hasExecutableDependency, true);
  });

  await check("JT44I", "dynamic string import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const mod = import(\"./semanticJudgeTransport.js\");\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44J", "dynamic import with options argument is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import(\"./semanticJudgeTransport.js\", {});\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44K", "multiline dynamic import with options is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import(\n  \"./semanticJudgeTransport.js\",\n  {}\n);\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44L", "no-substitution template-literal dynamic import is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "import(`./semanticJudgeTransport.js`);\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44M", "actual executeXaiSemanticJudge call is production wiring", () => {
    const analysis = analyzeExecutableTransportDependency("executeXaiSemanticJudge({});\n");
    assert.equal(analysis.hasExecutableDependency, true);
    assert.equal(analysis.invokesExecute, true);
  });

  await check("JT44N", "ordinary single-quoted import-looking string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const snippet = 'import \"./semanticJudgeTransport.js\";';\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44O", "ordinary double-quoted import-looking string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const snippet = \"import(\\\"./semanticJudgeTransport.js\\\")\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44P", "ordinary template text containing import-looking example is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const snippet = `example: import(\"./semanticJudgeTransport.js\")`;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44Q", "line-comment import is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "// import \"./semanticJudgeTransport.js\"\nconst ok = true;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44R", "block-comment import is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "/*\n import(\"./semanticJudgeTransport.js\")\n*/\nconst ok = true;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44S", "SemanticJudgeTransportError name only is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const ErrorType = SemanticJudgeTransportError;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44T", "computed import(otherModule) plus unrelated string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(otherModule);\nconst note = \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44U", "computed import plus unrelated template specifier is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(otherModule);\nconst note = `./semanticJudgeTransport.js`;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44V", "computed import plus unrelated import-looking string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(otherModule);\nconst note = 'import(\"./semanticJudgeTransport.js\")';\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44W", "computed import(getModule()) plus unrelated string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(getModule());\nconst note = \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44X", "computed import(prefix + suffix) plus unrelated string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(prefix + suffix);\nconst note = \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44Y", "computed template import(`${name}`) plus unrelated string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(`./${name}.js`);\nconst note = \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44Z", "template text with computed import plus unrelated string is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = `example ${import(otherModule)}`;\nconst note = \"./semanticJudgeTransport.js\";\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT44AA", "literal import inside template expression is wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = `example ${import(\"./semanticJudgeTransport.js\")}`;\n",
    );
    assert.equal(analysis.hasExecutableDependency, true);
  });

  await check("JT44AB", "ordinary template example text plus computed import is not wiring", () => {
    const analysis = analyzeExecutableTransportDependency(
      "const x = import(otherModule);\nconst note = `example ./semanticJudgeTransport.js`;\n",
    );
    assert.equal(analysis.hasExecutableDependency, false);
  });

  await check("JT45", "J1 packet/schema machinery is reused, not duplicated", async () => {
    const transport = readFileSync(join(ROOT, "src/agent/semanticJudgeTransport.js"), "utf8");
    assert.equal(transport.includes("from \"./semanticJudgeVerdictSchema.js\""), true);
    assert.equal(transport.includes("buildSemanticJudgeVerdictSchema"), true);
    assert.equal(transport.includes("validateSemanticJudgeVerdictResponse"), true);
    assert.equal(transport.includes("minItems: submittedChecks.length"), false);
    assert.equal(transport.includes("expectedInvariant"), false);
    const body = buildXaiSemanticJudgeRequestBody({
      systemInstruction: SYSTEM_INSTRUCTION,
      judgePacket: packet,
      submittedChecks: packet.checks,
    });
    assert.equal(body.input[0].content, SYSTEM_INSTRUCTION);
    extractXaiSemanticJudgeVerdictText(completedResponse(verdicts));
  });
}

await main();

console.log("Agent Semantic Judge Transport Offline cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
