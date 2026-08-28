import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  PROVIDER_CANDIDATE_SCHEMA_VERSION,
  PROVIDER_PROMPT_VERSION,
  PROVIDER_PROJECTION_VERSION,
} from "../src/agent/agentContractConstants.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import { buildProviderPrompt } from "../src/agent/providerPrompt.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { buildC5CSelectedSelectorProvenance } from "./fixtures/c5c-selected-session.mjs";
import {
  GEMINI_API_HOST,
  GEMINI_API_VERSION,
  GEMINI_AUTH_HEADER_NAME,
  GEMINI_CREDENTIAL_ENV_NAME,
  GEMINI_EXECUTION_ATTEMPT_NUMBER,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_MODEL_ID,
  GEMINI_RESPONSE_MIME_TYPE,
  GEMINI_TIMEOUT_MS,
  PROVIDER_EXECUTION_CONTRACT,
  PROVIDER_EXECUTION_HTTP_METHOD,
  PROVIDER_ID_GEMINI,
  buildGeminiGenerateContentUrl,
} from "../src/agent/providerExecutionConstants.js";
import {
  PROVIDER_EXECUTION_FAILURE_CLASSES,
  ProviderExecutionError,
} from "../src/agent/providerExecutionError.js";
import {
  assertExecutionPackage,
  buildGeminiGenerateContentBody,
  executeGeminiProvider,
  extractGeminiCandidateText,
  parseProviderSemanticCandidateJson,
  resolveGeminiCredential,
} from "../src/agent/providerExecution.js";

// ---------------------------------------------------------------------------
// Canonical upstream fixtures (same construction as the boundary validator)
// ---------------------------------------------------------------------------

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);

function answer(overrides = {}) {
  return {
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    knowledgeLevel: "first_hand",
    confidence: "high",
    reliabilityFlags: [],
    ...overrides,
  };
}

function fill(template = {}, except = {}) {
  const out = {};
  for (const question of QUESTIONS) {
    out[question] = answer({ ...template, ...(except[question] ?? {}) });
  }
  return out;
}

const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
const SELECTOR = buildC5CSelectedSelectorProvenance();

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput, overrides = {}) {
  return {
    diagnosticId: "diag-a3b1",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
    ...overrides,
  };
}

function assembleUpstream(coreInput) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input),
    coreInput: input,
    selectorProvenance: SELECTOR,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
  });
  return { input, coreOutput, snapshot, uncertainty, pack };
}

function requestFor(coreInput) {
  const upstream = assembleUpstream(coreInput);
  const request = buildAgentInterpretationRequest({
    engineSnapshot: upstream.snapshot,
    structuredUncertainty: upstream.uncertainty,
    interpretationContextPack: upstream.pack,
  });
  return { ...upstream, request };
}

const P5A_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill(),
  answers2: fill(),
};

const P1B_INPUT = {
  moduleId: "acquirerEnvironment",
  candidatePair: "NT/STJ vs NT/STP",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill(),
  answers2: fill({}, {
    Q1: { selectedOption: "E" },
    Q2: { selectedOption: "E" },
    Q3: { selectedOption: "E" },
    Q4: { selectedOption: "E" },
    Q5: { selectedOption: "E" },
    Q7: { selectedOption: "E" },
    Q8: { selectedOption: "E" },
    Q9: { selectedOption: "E" },
  }),
};

// ---------------------------------------------------------------------------
// Lawful candidate fixture (same construction as the boundary validator)
// ---------------------------------------------------------------------------

function projectionRefs(projection) {
  return {
    qrefA: projection.structuredUncertainty.survivingEvidenceRefs[0] ?? null,
    qrefB: projection.structuredUncertainty.survivingEvidenceRefs[1] ?? null,
    factref: projection.structuredUncertainty.known[0]?.factRef ?? null,
    mref: projection.interpretationContextPack.selectedContextItems[0]?.contextRef ?? null,
    uncertaintyId: projection.structuredUncertainty.items[0]?.uncertaintyId ?? null,
  };
}

const PLAIN_EVIDENCE_BASIS = Object.freeze({
  supportBasis: "PRIMARY_COMPARABLE",
  conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE",
  materialUnknownsPresent: false,
});

function hypothesisItem(id, statement, refs, mref, extra = {}) {
  return {
    hypothesisId: id,
    statement,
    evidenceBasis: PLAIN_EVIDENCE_BASIS,
    decisiveEvidenceRefs: [refs.qrefA],
    conflictingEvidenceRefs: [],
    contextRefs: mref === null ? [] : [mref],
    requiresEngineFactNotEstablished: [],
    ...extra,
  };
}

function deepMerge(base, overrides) {
  if (overrides === undefined || overrides === null) return base;
  if (Array.isArray(overrides) || typeof overrides !== "object") return overrides;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    if (value === null || Array.isArray(value) || typeof value !== "object"
      || base?.[key] === null || base?.[key] === undefined
      || Array.isArray(base?.[key]) || typeof base?.[key] !== "object") {
      out[key] = value;
    } else {
      out[key] = deepMerge(base[key], value);
    }
  }
  return out;
}

function lawfulCandidate(projection, overrides = {}) {
  const refs = projectionRefs(projection);
  const caseB = projection.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  const candidate = {
    interpretationStatus: projection.structuredUncertainty.originBranch === "P_1B"
      ? "INTERPRETATION_CONSTRAINED"
      : "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          hypothesisItem("H1", "One bounded reading of the supplied evidence.", refs, hypothesisMref),
          hypothesisItem("H2", "An alternative reading of the supplied evidence.", refs, hypothesisMref, {
            decisiveEvidenceRefs: refs.qrefB && refs.qrefB !== refs.qrefA ? [refs.qrefB] : [refs.qrefA],
          }),
        ],
      },
      decisiveEvidence: [{ statement: "A decisive observation.", evidenceRefs: [refs.qrefA] }],
      conflictingEvidence: [],
      missingEvidence: refs.uncertaintyId
        ? [{ statement: "An open uncertainty.", uncertaintyIds: [refs.uncertaintyId] }]
        : [],
      changeConditions: refs.uncertaintyId
        ? [{ statement: "What would change the reading.", uncertaintyIds: [refs.uncertaintyId], wouldChange: "STATE_IDENTITY" }]
        : [],
      affectedResources: caseB
        ? [{ label: "Decision authority", contextRefs: [refs.mref] }]
        : [],
      watchpoints: caseB
        ? [{ statement: "A watchpoint.", horizon: "6m", contextRefs: [refs.mref], evidenceRefs: [refs.qrefA] }]
        : [],
    },
    uncertainty: {
      disclosures: refs.uncertaintyId
        ? [{
            uncertaintyId: refs.uncertaintyId,
            affects: "STATE_IDENTITY",
            clientStatement: "The engine did not establish a deterministic state identity.",
            unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
          }]
        : [],
    },
    claims: [
      {
        claimId: "CL-001",
        claimType: "DETERMINISTIC_FACT",
        text: "The engine established the recorded branch outcome.",
        refs: [refs.factref],
        contextRefs: [],
      },
      {
        claimId: "CL-002",
        claimType: "DIRECT_EVIDENCE",
        text: "A respondent supplied a directly observed answer.",
        refs: [refs.qrefA],
        contextRefs: [],
      },
      {
        claimId: "CL-003",
        claimType: "BOUNDED_INTERPRETATION",
        text: "A bounded organizational reading of the supplied evidence.",
        refs: [refs.qrefA],
        contextRefs: boundedContextRefs,
      },
      ...(refs.uncertaintyId
        ? [{
            claimId: "CL-004",
            claimType: "UNCERTAINTY_DISCLOSURE",
            text: "A material uncertainty remains open.",
            refs: [`uref://${refs.uncertaintyId}`],
            contextRefs: [],
          }]
        : []),
      ...(caseB
        ? [{
            claimId: "CL-005",
            claimType: "WATCHPOINT",
            text: "A friction-related watchpoint.",
            refs: [refs.qrefA],
            contextRefs: [refs.mref],
          }]
        : []),
      {
        claimId: "CL-006",
        claimType: "SCOPE_LIMITATION_DISCLOSURE",
        text: "A MergeVue-specific reading was not offered where the methodology domain was absent.",
        refs: [],
        contextRefs: [],
      },
    ],
    clientNarrative: {
      language: "en",
      sections: [],
    },
  };
  return deepMerge(candidate, overrides);
}

// ---------------------------------------------------------------------------
// Offline transport mocks — injected fetch only, no network, no env secret
// ---------------------------------------------------------------------------

const TEST_CREDENTIAL = "offline-test-credential";

function makeAbortError() {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

function jsonResponse(payload, { status = 200, requestId = null } = {}) {
  return {
    status,
    headers: {
      get: (name) => (String(name).toLowerCase() === "x-request-id" ? requestId : null),
    },
    json: async () => payload,
  };
}

function successPayload(text, extra = {}) {
  return {
    candidates: [{
      content: { parts: [{ text }] },
      finishReason: "STOP",
    }],
    ...extra,
  };
}

function recordingTransport(responder) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({
      url,
      method: init.method,
      headers: init.headers,
      bodyText: init.body,
      body: JSON.parse(init.body),
      signal: init.signal,
    });
    const outcomeValue = typeof responder === "function" ? responder(calls.length) : responder;
    if (outcomeValue instanceof Error) throw outcomeValue;
    return outcomeValue;
  };
  return { impl, calls };
}

async function executeRecorded({ projection, prompt, responder, credential = TEST_CREDENTIAL }) {
  const { impl, calls } = recordingTransport(responder);
  const result = await executeGeminiProvider(
    { providerProjection: projection, prompt },
    { fetchImpl: impl, credentialReader: () => credential },
  );
  return { result, calls };
}

async function executeRejected(
  { projection, prompt, responder, credential = TEST_CREDENTIAL, credentialReader = null },
  expectedFailureClass,
) {
  const { impl, calls } = recordingTransport(responder);
  let caught = null;
  try {
    await executeGeminiProvider(
      { providerProjection: projection, prompt },
      { fetchImpl: impl, credentialReader: credentialReader ?? (() => credential) },
    );
  } catch (error) {
    caught = error;
  }
  assert.ok(
    caught instanceof ProviderExecutionError,
    `expected ProviderExecutionError (${expectedFailureClass}), got ${caught?.constructor?.name ?? "no error"}: ${caught?.message ?? ""}`,
  );
  assert.equal(caught.failureClass, expectedFailureClass, caught.message);
  return { error: caught, calls };
}

function captureSyncRejection(fn) {
  let caught = null;
  try {
    fn();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof ProviderExecutionError, `expected ProviderExecutionError, got ${caught?.constructor?.name ?? "none"}`);
  return caught;
}

function allKeysAnywhere(value, into = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) allKeysAnywhere(item, into);
    return into;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      into.add(key);
      allKeysAnywhere(child, into);
    }
  }
  return into;
}

function assertDeepFrozen(value, label) {
  if (value === null || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true, `${label} must be frozen`);
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertDeepFrozen(item, `${label}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) assertDeepFrozen(child, `${label}.${key}`);
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

// ---------------------------------------------------------------------------
// Check runner
// ---------------------------------------------------------------------------

const results = [];
async function check(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

async function main() {
  const p5a = requestFor(P5A_INPUT);
  const p5aProjection = projectProviderProjection(p5a.request);
  const p5aPrompt = buildProviderPrompt(p5aProjection);
  const p5aCandidateJson = JSON.stringify(lawfulCandidate(p5aProjection), null, 2);

  const p1b = requestFor(P1B_INPUT);
  const p1bProjection = projectProviderProjection(p1b.request);
  const p1bPrompt = buildProviderPrompt(p1bProjection);
  const p1bCandidateJson = JSON.stringify(lawfulCandidate(p1bProjection), null, 2);

  // -------------------------------------------------------------------------
  // Frozen execution constants and closed version identities
  // -------------------------------------------------------------------------

  await check("EX0", "exact wrapper-owned constants; closed versions imported, never duplicated", () => {
    assert.equal(PROVIDER_ID_GEMINI, "gemini");
    assert.equal(GEMINI_MODEL_ID, "gemini-3.7-flash");
    assert.equal(GEMINI_MODEL_ID.includes("latest"), false);
    assert.equal(GEMINI_API_HOST, "https://generativelanguage.googleapis.com");
    assert.equal(GEMINI_API_VERSION, "v1beta");
    assert.equal(GEMINI_TIMEOUT_MS, 20000);
    assert.equal(GEMINI_MAX_OUTPUT_TOKENS, 8192);
    assert.equal(GEMINI_RESPONSE_MIME_TYPE, "application/json");
    assert.equal(GEMINI_CREDENTIAL_ENV_NAME, "GEMINI_API_KEY");
    assert.equal(GEMINI_AUTH_HEADER_NAME, "x-goog-api-key");
    assert.equal(GEMINI_EXECUTION_ATTEMPT_NUMBER, 1);
    assert.equal(PROVIDER_EXECUTION_HTTP_METHOD, "POST");
    assert.equal(Object.isFrozen(PROVIDER_EXECUTION_CONTRACT), true);
    assert.deepEqual(PROVIDER_EXECUTION_CONTRACT, {
      providerProjectionVersion: PROVIDER_PROJECTION_VERSION,
      promptVersion: PROVIDER_PROMPT_VERSION,
      providerCandidateSchemaVersion: PROVIDER_CANDIDATE_SCHEMA_VERSION,
    });
    assert.deepEqual([...PROVIDER_EXECUTION_FAILURE_CLASSES], [
      "PROVIDER_CONFIGURATION_FAILURE",
      "PROVIDER_AUTH_FAILURE",
      "PROVIDER_TIMEOUT",
      "PROVIDER_RATE_LIMIT",
      "PROVIDER_TRANSPORT_FAILURE",
      "PROVIDER_HTTP_FAILURE",
      "PROVIDER_RESPONSE_PARSE_FAILURE",
      "PROVIDER_STRUCTURAL_CANDIDATE_FAILURE",
    ]);
    assert.equal(Object.isFrozen(PROVIDER_EXECUTION_FAILURE_CLASSES), true);

    const constantsSource = readFileSync(
      new URL("../src/agent/providerExecutionConstants.js", import.meta.url),
      "utf8",
    );
    assert.ok(
      /GEMINI_MODEL_ID\s*=\s*"gemini-3\.7-flash"/.test(constantsSource),
      "model constant pinned exactly in source",
    );
    for (const versionLiteral of [
      "provider-projection-1.1",
      "provider-prompt-1.0",
      "provider-semantic-candidate-1.0",
    ]) {
      assert.equal(
        constantsSource.includes(versionLiteral),
        false,
        `version literal ${versionLiteral} must not be duplicated in the execution constants`,
      );
    }
    assert.equal(constantsSource.includes("./agentContractConstants.js"), true);
  });

  // -------------------------------------------------------------------------
  // URL / method
  // -------------------------------------------------------------------------

  await check("EX1", "exact provider URL/path; POST method reaches the transport", async () => {
    assert.equal(
      buildGeminiGenerateContentUrl(),
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
    );
    const { result: _result, calls } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse(successPayload(p5aCandidateJson)),
    });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
    );
    assert.equal(calls[0].method, "POST");
  });

  // -------------------------------------------------------------------------
  // package.json boundary
  // -------------------------------------------------------------------------

  await check("EX2", "no Google SDK dependency; exactly the one new validation script", () => {
    const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];
    for (const name of dependencyNames) {
      const lower = name.toLowerCase();
      assert.equal(lower.includes("google"), false, `SDK-like dependency: ${name}`);
      assert.equal(lower.includes("gemini"), false, `SDK-like dependency: ${name}`);
      assert.equal(lower.includes("generative"), false, `SDK-like dependency: ${name}`);
    }
    assert.equal(
      packageJson.scripts["validate:agent-provider-execution-offline"],
      "node scripts/validate-agent-provider-execution-offline.mjs",
    );
  });

  // -------------------------------------------------------------------------
  // Closed Offline Provider modules stay offline
  // -------------------------------------------------------------------------

  await check("EX3", "closed Offline Provider modules remain env/SDK/network free", () => {
    const modules = [
      "../src/agent/providerProjection.js",
      "../src/agent/providerPrompt.js",
      "../src/agent/providerSemanticCandidateSchema.js",
    ];
    const forbidden = [
      "process" + ".env",
      "node:fs",
      "node:net",
      "node:ht" + "tp",
      "child_" + "process",
      "fet" + "ch(",
      "@goo" + "gle",
      "sdk",
      "gemini",
      "openai",
      "anthropic",
    ];
    for (const path of modules) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      const lower = source.toLowerCase();
      for (const fragment of forbidden) {
        assert.equal(lower.includes(fragment.toLowerCase()), false, `${path}: ${fragment}`);
      }
      for (const importPath of source.matchAll(/from\s+"([^"]+)"/g)) {
        assert.ok(
          importPath[1] === "./agentContractConstants.js"
            || importPath[1] === "./canonicalDigest.js"
            || (path.endsWith("providerProjection.js")
              && importPath[1] === "./agentInterpretationRequest.js"),
          `${path}: unexpected import ${importPath[1]}`,
        );
      }
    }
  });

  // -------------------------------------------------------------------------
  // Execution package binding
  // -------------------------------------------------------------------------

  await check("EX4", "package/projection version mismatch fails configuration before HTTP", async () => {
    const tamperedProjection = structuredClone(p5aProjection);
    tamperedProjection.providerProjectionVersion = "provider-projection-1.0";
    const first = await executeRejected(
      { projection: tamperedProjection, prompt: p5aPrompt, responder: jsonResponse(successPayload(p5aCandidateJson)) },
      "PROVIDER_CONFIGURATION_FAILURE",
    );
    assert.equal(first.calls.length, 0, "no HTTP call may occur on version mismatch");

    const tamperedPrompt = structuredClone(p5aPrompt);
    tamperedPrompt.promptVersion = "provider-prompt-1.1";
    const second = await executeRejected(
      { projection: p5aProjection, prompt: tamperedPrompt, responder: jsonResponse(successPayload(p5aCandidateJson)) },
      "PROVIDER_CONFIGURATION_FAILURE",
    );
    assert.equal(second.calls.length, 0);

    const third = await executeRejected(
      { projection: {}, prompt: p5aPrompt, responder: jsonResponse(successPayload(p5aCandidateJson)) },
      "PROVIDER_CONFIGURATION_FAILURE",
    );
    assert.equal(third.calls.length, 0);

    captureSyncRejection(() => assertExecutionPackage(null, p5aPrompt));
  });

  await check("EX5", "prompt mismatch against rebuilt canonical prompt fails before HTTP", async () => {
    const tamperedContent = structuredClone(p5aPrompt);
    tamperedContent.messages[1].content = `${tamperedContent.messages[1].content} `;
    const first = await executeRejected(
      { projection: p5aProjection, prompt: tamperedContent, responder: jsonResponse(successPayload(p5aCandidateJson)) },
      "PROVIDER_CONFIGURATION_FAILURE",
    );
    assert.equal(first.calls.length, 0, "no HTTP call may occur on prompt mismatch");

    // A prompt built from a different projection is not this projection's prompt.
    const second = await executeRejected(
      { projection: p5aProjection, prompt: p1bPrompt, responder: jsonResponse(successPayload(p5aCandidateJson)) },
      "PROVIDER_CONFIGURATION_FAILURE",
    );
    assert.equal(second.calls.length, 0);

    captureSyncRejection(() => assertExecutionPackage(p5aProjection, tamperedContent));
    assert.doesNotThrow(() => assertExecutionPackage(p5aProjection, p5aPrompt));
  });

  // -------------------------------------------------------------------------
  // Credential boundary
  // -------------------------------------------------------------------------

  await check("EX6", "missing/blank credential fails configuration before HTTP", async () => {
    for (const value of [undefined, "", "   "]) {
      const rejected = await executeRejected(
        {
          projection: p5aProjection,
          prompt: p5aPrompt,
          responder: jsonResponse(successPayload(p5aCandidateJson)),
          credentialReader: () => value,
        },
        "PROVIDER_CONFIGURATION_FAILURE",
      );
      assert.equal(rejected.calls.length, 0, `no HTTP call for credential ${JSON.stringify(value)}`);
    }
    assert.equal(resolveGeminiCredential(() => TEST_CREDENTIAL), TEST_CREDENTIAL);
    captureSyncRejection(() => resolveGeminiCredential(() => ""));
  });

  await check("EX7", "header-based auth; credential absent from URL and body", async () => {
    const { result: _result, calls } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse(successPayload(p5aCandidateJson)),
    });
    const { url, headers, bodyText } = calls[0];
    assert.equal(headers[GEMINI_AUTH_HEADER_NAME], TEST_CREDENTIAL);
    assert.equal(headers["content-type"], "application/json");
    assert.equal(Object.hasOwn(headers, "Authorization"), false);
    assert.equal(url.includes(TEST_CREDENTIAL), false, "credential must never enter the URL");
    assert.equal(url.includes("key="), false, "no query-string key auth");
    assert.equal(bodyText.includes(TEST_CREDENTIAL), false, "credential must never enter the body");
  });

  // -------------------------------------------------------------------------
  // Gemini REST body contract
  // -------------------------------------------------------------------------

  await check("EX8", "exactly one system instruction and one user content, byte-preserved", async () => {
    const { result: _result, calls } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse(successPayload(p5aCandidateJson)),
    });
    const body = calls[0].body;
    const rebuiltPrompt = buildProviderPrompt(p5aProjection);
    assert.deepEqual(Object.keys(body).sort(), ["contents", "generationConfig", "store", "systemInstruction"]);
    assert.equal(body.systemInstruction.parts.length, 1);
    assert.equal(body.contents.length, 1);
    assert.equal(body.contents[0].role, "user");
    assert.equal(body.contents[0].parts.length, 1);
    assert.equal(body.systemInstruction.parts[0].text, p5aPrompt.messages[0].content);
    assert.equal(body.contents[0].parts[0].text, p5aPrompt.messages[1].content);
    assert.equal(body.systemInstruction.parts[0].text, rebuiltPrompt.messages[0].content);
    assert.equal(body.contents[0].parts[0].text, rebuiltPrompt.messages[1].content);

    const standalone = buildGeminiGenerateContentBody(p5aPrompt);
    assert.equal(standalone.systemInstruction.parts[0].text, p5aPrompt.messages[0].content);
    captureSyncRejection(() => buildGeminiGenerateContentBody({ messages: [] }));
  });

  await check("EX9", "no tools/search/sampling/schema keys; generationConfig exact; store false", async () => {
    const { result: _result, calls } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse(successPayload(p5aCandidateJson)),
    });
    const body = calls[0].body;
    const forbiddenKeys = [
      "tools",
      "toolConfig",
      "cachedContent",
      "safetySettings",
      "fileData",
      "inlineData",
      "functionDeclarations",
      "codeExecution",
      "grounding",
      "search",
      "temperature",
      "topP",
      "topK",
      "candidateCount",
      "seed",
      "thinkingConfig",
      "responseSchema",
    ];
    const keys = allKeysAnywhere(body);
    for (const key of forbiddenKeys) {
      assert.equal(keys.has(key), false, `request body carries forbidden key ${key}`);
    }
    assert.deepEqual(body.generationConfig, {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    });
    assert.deepEqual(Object.keys(body.generationConfig).sort(), ["maxOutputTokens", "responseMimeType"]);
    assert.equal(body.store, false);
  });

  await check("EX10", "interpretationId and attempt identity never cross the HTTP boundary", async () => {
    const { result, calls } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse(successPayload(p5aCandidateJson)),
    });
    const interpretationId = p5a.request.interpretationId;
    const executionAttemptId = result.executionMetadata.executionAttemptId;
    assert.equal(UUID_PATTERN.test(interpretationId), true);
    assert.equal(UUID_PATTERN.test(executionAttemptId), true);
    assert.notEqual(executionAttemptId, interpretationId);
    assert.equal(calls[0].bodyText.includes(interpretationId), false);
    assert.equal(calls[0].bodyText.includes(executionAttemptId), false);
    const resultKeys = allKeysAnywhere(result);
    assert.equal(resultKeys.has("interpretationId"), false);
    const candidateBytes = JSON.stringify(result.candidate);
    assert.equal(candidateBytes.includes(executionAttemptId), false);
    assert.equal(candidateBytes.includes(interpretationId), false);
  });

  // -------------------------------------------------------------------------
  // Timeout
  // -------------------------------------------------------------------------

  await check("EX11", "fetch-phase timeout: PROVIDER_TIMEOUT with retryable=true hint, exactly one fetch", async () => {
    // Mapping path: an abort-shaped rejection from the transport. Both sides
    // of the contract hold simultaneously — the retryable hint is true while
    // the transport was invoked exactly once (no automatic retry).
    const immediate = await executeRejected(
      {
        projection: p5aProjection,
        prompt: p5aPrompt,
        responder: () => Promise.reject(makeAbortError()),
      },
      "PROVIDER_TIMEOUT",
    );
    assert.equal(immediate.error.retryable, true, "timeout retryable hint must be true");
    assert.equal(immediate.calls.length, 1, "timeout must consume exactly one attempt");

    // Wiring path: the real timer drives controller.abort() through the fetch
    // signal. The 20000 ms arm delay is compressed to 5 ms so the offline
    // validator observes the genuine abort wiring without waiting.
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
    let hangingTransportInvocations = 0;
    const hangingTransport = (_url, init) => {
      hangingTransportInvocations += 1;
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(makeAbortError()));
      });
    };
    try {
      let caught = null;
      try {
        await executeGeminiProvider(
          { providerProjection: p5aProjection, prompt: p5aPrompt },
          { fetchImpl: hangingTransport, credentialReader: () => TEST_CREDENTIAL },
        );
      } catch (executionError) {
        caught = executionError;
      }
      assert.ok(caught instanceof ProviderExecutionError, "timeout error expected");
      assert.equal(caught.failureClass, "PROVIDER_TIMEOUT");
      assert.equal(caught.retryable, true, "timeout retryable hint must be true");
      assert.equal(hangingTransportInvocations, 1, "abort wiring must issue exactly one transport invocation");
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    }
    assert.equal(capturedDelay, 20000, "AbortController timer must be armed at GEMINI_TIMEOUT_MS");
    assert.equal(clearCount, 1, "timer must be cleared exactly once in finally");
  });

  await check("EX11b", "body-read timeout: PROVIDER_TIMEOUT retryable=true, one fetch, timer cleanup; malformed body stays parse failure", async () => {
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

    const runBodyReadCase = async (makeBodyRejection) => {
      let fetchCalls = 0;
      const slowBodyTransport = async (_url, init) => {
        fetchCalls += 1;
        return {
          status: 200,
          headers: { get: () => null },
          json: () => new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () => reject(makeBodyRejection()));
          }),
        };
      };
      let caught = null;
      try {
        await executeGeminiProvider(
          { providerProjection: p5aProjection, prompt: p5aPrompt },
          { fetchImpl: slowBodyTransport, credentialReader: () => TEST_CREDENTIAL },
        );
      } catch (executionError) {
        caught = executionError;
      }
      return { caught, fetchCalls };
    };

    try {
      // T2a — abort-shaped rejection while the body reader is pending.
      const abortShaped = await runBodyReadCase(() => makeAbortError());
      assert.ok(abortShaped.caught instanceof ProviderExecutionError, "body-read timeout error expected");
      assert.equal(abortShaped.caught.failureClass, "PROVIDER_TIMEOUT", abortShaped.caught.message);
      assert.equal(abortShaped.caught.retryable, true, "body-read timeout retryable hint must be true");
      assert.equal(abortShaped.fetchCalls, 1, "body-read timeout must consume exactly one fetch");
      assert.equal(UUID_PATTERN.test(abortShaped.caught.executionAttemptId), true, "single attempt identity carried");
      const clearsAfterFirst = clearCount;

      // T2b — generic rejection raised only after the execution deadline
      // aborted the signal (controller.signal.aborted detection path).
      const genericAfterAbort = await runBodyReadCase(() => new Error("body read aborted"));
      assert.ok(genericAfterAbort.caught instanceof ProviderExecutionError, "body-read timeout error expected");
      assert.equal(genericAfterAbort.caught.failureClass, "PROVIDER_TIMEOUT", genericAfterAbort.caught.message);
      assert.equal(genericAfterAbort.caught.retryable, true, "body-read timeout retryable hint must be true");
      assert.equal(genericAfterAbort.fetchCalls, 1, "no second fetch after body-read timeout");
      assert.equal(clearCount, clearsAfterFirst + 1, "timer cleanup still occurs per attempt");
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
    }
    assert.equal(capturedDelay, 20000, "body-read cases must arm the same 20000 ms execution deadline");
    assert.equal(clearCount, 2, "both body-read attempts cleared their timers");

    // Negative control — a completed but malformed 2xx body is a parse
    // failure, never a timeout.
    const malformedBodyTransport = async () => ({
      status: 200,
      headers: { get: () => null },
      json: async () => {
        throw new SyntaxError("Unexpected token in JSON");
      },
    });
    let malformedCalls = 0;
    const malformedTransport = async (url, init) => {
      malformedCalls += 1;
      void url;
      void init;
      return malformedBodyTransport();
    };
    let malformedCaught = null;
    try {
      await executeGeminiProvider(
        { providerProjection: p5aProjection, prompt: p5aPrompt },
        { fetchImpl: malformedTransport, credentialReader: () => TEST_CREDENTIAL },
      );
    } catch (executionError) {
      malformedCaught = executionError;
    }
    assert.ok(malformedCaught instanceof ProviderExecutionError, "malformed body error expected");
    assert.equal(malformedCaught.failureClass, "PROVIDER_RESPONSE_PARSE_FAILURE", malformedCaught.message);
    assert.equal(malformedCalls, 1);
  });

  // -------------------------------------------------------------------------
  // HTTP status mapping
  // -------------------------------------------------------------------------

  await check("EX12", "401/403 map to PROVIDER_AUTH_FAILURE, retryable false", async () => {
    for (const status of [401, 403]) {
      const { error, calls } = await executeRejected(
        { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse({}, { status }) },
        "PROVIDER_AUTH_FAILURE",
      );
      assert.equal(error.retryable, false);
      assert.equal(calls.length, 1);
      assert.ok(error.detail.includes(String(status)));
    }
  });

  await check("EX13", "429 maps to PROVIDER_RATE_LIMIT, retryable true", async () => {
    const { error, calls } = await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse({}, { status: 429 }) },
      "PROVIDER_RATE_LIMIT",
    );
    assert.equal(error.retryable, true);
    assert.equal(calls.length, 1);
  });

  await check("EX14", "5xx maps to PROVIDER_HTTP_FAILURE retryable true; other non-2xx conservative", async () => {
    const serverError = await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse({}, { status: 500 }) },
      "PROVIDER_HTTP_FAILURE",
    );
    assert.equal(serverError.error.retryable, true);
    assert.equal(serverError.calls.length, 1);

    const clientError = await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse({}, { status: 400 }) },
      "PROVIDER_HTTP_FAILURE",
    );
    assert.equal(clientError.error.retryable, false);
    assert.equal(clientError.calls.length, 1);
  });

  await check("EX15", "network throw maps to PROVIDER_TRANSPORT_FAILURE, retryable true", async () => {
    const networkError = new TypeError("fetch failed");
    const { error, calls } = await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: () => networkError },
      "PROVIDER_TRANSPORT_FAILURE",
    );
    assert.equal(error.retryable, true);
    assert.equal(calls.length, 1);
  });

  // -------------------------------------------------------------------------
  // Response-envelope admission
  // -------------------------------------------------------------------------

  const rejectedPayloadCase = async (payload, expectedClass = "PROVIDER_RESPONSE_PARSE_FAILURE") =>
    executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse(payload) },
      expectedClass,
    );

  await check("EX16", "blocked prompt maps to PROVIDER_RESPONSE_PARSE_FAILURE", async () => {
    const rejected = await rejectedPayloadCase({
      promptFeedback: { blockReason: "SAFETY" },
      candidates: [],
    });
    assert.equal(rejected.calls.length, 1);
  });

  await check("EX17", "candidates cardinality 0, 2, and non-array map to parse failure", async () => {
    await rejectedPayloadCase(successPayload(p5aCandidateJson, { candidates: [] }));
    await rejectedPayloadCase({
      candidates: [
        { content: { parts: [{ text: p5aCandidateJson }] }, finishReason: "STOP" },
        { content: { parts: [{ text: p5aCandidateJson }] }, finishReason: "STOP" },
      ],
    });
    await rejectedPayloadCase({ candidates: "one" });
  });

  await check("EX18", "absent and unknown finishReason map to parse failure", async () => {
    const absent = structuredClone(successPayload(p5aCandidateJson));
    delete absent.candidates[0].finishReason;
    await rejectedPayloadCase(absent);
    await rejectedPayloadCase(successPayload(p5aCandidateJson, {
      candidates: [{ content: { parts: [{ text: p5aCandidateJson }] }, finishReason: "SAFETY" }],
    }));
  });

  await check("EX19", "MAX_TOKENS maps to parse failure even with parseable-looking text", async () => {
    const rejected = await rejectedPayloadCase({
      candidates: [{ content: { parts: [{ text: p5aCandidateJson }] }, finishReason: "MAX_TOKENS" }],
    });
    assert.equal(rejected.calls.length, 1);
  });

  await check("EX20", "fail-closed allowed-shape parts: tool/code/file/media/unknown payloads and thought bypass all fail", async () => {
    const compositeParts = [
      ["functionCall + text", { text: p5aCandidateJson, functionCall: { name: "x" } }],
      ["functionResponse + text", { text: p5aCandidateJson, functionResponse: { name: "x" } }],
      ["executableCode + text", { text: p5aCandidateJson, executableCode: { code: "1" } }],
      ["codeExecutionResult + text", { text: p5aCandidateJson, codeExecutionResult: { output: "1" } }],
      ["inlineData + text", { text: p5aCandidateJson, inlineData: { mimeType: "image/png" } }],
      ["fileData + text", { text: p5aCandidateJson, fileData: { fileUri: "offline" } }],
      ["videoMetadata + text", { text: p5aCandidateJson, videoMetadata: { fps: 30 } }],
      ["unknown extra Part payload key + text", { text: p5aCandidateJson, customCapability: {} }],
    ];
    for (const [label, part] of compositeParts) {
      const rejected = await rejectedPayloadCase({
        candidates: [{ content: { parts: [part] }, finishReason: "STOP" }],
      });
      assert.equal(rejected.calls.length, 1, label);
    }

    // thought:true must not bypass Part-shape validation: an unsupported
    // payload inside a thought part fails even when a valid candidate text
    // part follows it.
    const thoughtBypassParts = [
      ["thought:true + functionCall then candidate text", { thought: true, text: "reasoning", functionCall: { name: "x" } }],
      ["thought:true + functionResponse then candidate text", { thought: true, functionResponse: { name: "x" } }],
      ["thought:true + videoMetadata then candidate text", { thought: true, videoMetadata: { fps: 30 } }],
    ];
    for (const [label, part] of thoughtBypassParts) {
      const rejected = await rejectedPayloadCase({
        candidates: [{
          content: { parts: [part, { text: p5aCandidateJson }] },
          finishReason: "STOP",
        }],
      });
      assert.equal(rejected.calls.length, 1, label);
    }

    // Thought-only response remains inadmissible: zero candidate text parts.
    await rejectedPayloadCase({
      candidates: [{
        content: { parts: [{ text: "internal reasoning", thought: true }] },
        finishReason: "STOP",
      }],
    });
  });

  await check("EX21", "allowed-shape positives: thought parts (with signature) ignored; textual shapes succeed", async () => {
    const { result } = await executeRecorded({
      projection: p5aProjection,
      prompt: p5aPrompt,
      responder: jsonResponse({
        candidates: [{
          content: {
            parts: [
              { text: "internal reasoning that must be ignored", thought: true, thoughtSignature: "sig-1" },
              { text: "further reasoning ignored as well", thought: true },
              { text: p5aCandidateJson, thoughtSignature: "sig-2" },
            ],
          },
          finishReason: "STOP",
        }],
      }),
    });
    assert.deepEqual(JSON.parse(JSON.stringify(result.candidate)), JSON.parse(p5aCandidateJson));
  });

  await check("EX22", "two non-thought text parts fail; empty text part fails", async () => {
    await rejectedPayloadCase({
      candidates: [{
        content: { parts: [{ text: p5aCandidateJson }, { text: p1bCandidateJson }] },
        finishReason: "STOP",
      }],
    });
    await rejectedPayloadCase({
      candidates: [{
        content: { parts: [{ text: "   " }] },
        finishReason: "STOP",
      }],
    });
  });

  await check("EX23", "fenced, prose-wrapped, invalid, and non-object JSON all fail", async () => {
    await rejectedPayloadCase(successPayload("```json\n" + p5aCandidateJson + "\n```"));
    await rejectedPayloadCase(successPayload("Here is the result you asked for:\n" + p5aCandidateJson + "\nHope this helps."));
    await rejectedPayloadCase(successPayload("{not valid json"));
    await rejectedPayloadCase(successPayload("[1,2,3]"));
    await rejectedPayloadCase(successPayload("null"));
    captureSyncRejection(() => parseProviderSemanticCandidateJson("```json\n{}\n```"));
    captureSyncRejection(() => parseProviderSemanticCandidateJson("{"));
  });

  // -------------------------------------------------------------------------
  // Structural candidate gate
  // -------------------------------------------------------------------------

  await check("EX24", "structurally invalid candidate maps to PROVIDER_STRUCTURAL_CANDIDATE_FAILURE", async () => {
    const missingClaims = lawfulCandidate(p5aProjection);
    delete missingClaims.claims;
    const rejected = await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse(successPayload(JSON.stringify(missingClaims))) },
      "PROVIDER_STRUCTURAL_CANDIDATE_FAILURE",
    );
    assert.equal(rejected.calls.length, 1);
    assert.equal(rejected.error.retryable, false);

    const unknownKey = lawfulCandidate(p5aProjection);
    unknownKey.providerIdentity = "gemini";
    await executeRejected(
      { projection: p5aProjection, prompt: p5aPrompt, responder: jsonResponse(successPayload(JSON.stringify(unknownKey))) },
      "PROVIDER_STRUCTURAL_CANDIDATE_FAILURE",
    );
  });

  // -------------------------------------------------------------------------
  // Success contract
  // -------------------------------------------------------------------------

  const successRun = await executeRecorded({
    projection: p5aProjection,
    prompt: p5aPrompt,
    responder: jsonResponse(
      successPayload(p5aCandidateJson, { modelVersion: "models/gemini-3.7-flash" }),
      { requestId: "req-123-offline" },
    ),
  });

  await check("EX25", "structurally valid fixture succeeds with the exact metadata contract", async () => {
    const { result, calls } = successRun;
    assert.equal(calls.length, 1);
    assert.deepEqual(Object.keys(result).sort(), ["candidate", "executionMetadata"]);
    assert.deepEqual(JSON.parse(JSON.stringify(result.candidate)), JSON.parse(p5aCandidateJson));

    const metadata = result.executionMetadata;
    assert.deepEqual(Object.keys(metadata).sort(), [
      "attemptNumber",
      "durationMs",
      "executedAt",
      "executionAttemptId",
      "model",
      "observedProvider",
      "promptVersion",
      "provider",
      "providerCandidateSchemaVersion",
      "providerProjectionVersion",
      "transportStatus",
    ]);
    assert.equal(metadata.provider, "gemini");
    assert.equal(metadata.model, "gemini-3.7-flash");
    assert.equal(metadata.attemptNumber, 1);
    assert.equal(metadata.transportStatus, "OK");
    assert.equal(typeof metadata.durationMs, "number");
    assert.ok(metadata.durationMs >= 0);
    assert.equal(ISO_PATTERN.test(metadata.executedAt), true);
    assert.equal(metadata.promptVersion, "provider-prompt-1.0");
    assert.equal(metadata.providerProjectionVersion, "provider-projection-1.1");
    assert.equal(metadata.providerCandidateSchemaVersion, "provider-semantic-candidate-1.0");
    assert.deepEqual(metadata.observedProvider, {
      requestId: "req-123-offline",
      modelVersion: "models/gemini-3.7-flash",
      finishReason: "STOP",
    });

    // Cross-branch success: a second lawful fixture also executes cleanly.
    const second = await executeRecorded({
      projection: p1bProjection,
      prompt: p1bPrompt,
      responder: jsonResponse(successPayload(p1bCandidateJson)),
    });
    assert.deepEqual(JSON.parse(JSON.stringify(second.result.candidate)), JSON.parse(p1bCandidateJson));
  });

  await check("EX26", "candidate carries no provider-authored identity/provenance keys", () => {
    const candidateKeys = allKeysAnywhere(successRun.result.candidate);
    for (const forbidden of [
      "providerIdentity",
      "modelIdentity",
      "executedAt",
      "interpretationId",
      "provenance",
      "validation",
      "validationState",
      "resultSchemaVersion",
    ]) {
      assert.equal(candidateKeys.has(forbidden), false, forbidden);
    }
  });

  await check("EX27", "success returns deeply frozen candidate and execution metadata", () => {
    assertDeepFrozen(successRun.result.candidate, "candidate");
    assertDeepFrozen(successRun.result.executionMetadata, "executionMetadata");
    assert.equal(Object.isFrozen(successRun.result), true);
  });

  await check("EX28", "success path constructs no AgentInterpretationResult and no SystemFailure", async () => {
    const { result } = successRun;
    assert.deepEqual(Object.keys(result).sort(), ["candidate", "executionMetadata"]);
    const resultKeys = allKeysAnywhere(result);
    assert.equal(resultKeys.has("systemFailure"), false);
    assert.equal(resultKeys.has("SystemFailure"), false);

    const executionSource = readFileSync(
      new URL("../src/agent/providerExecution.js", import.meta.url),
      "utf8",
    );
    for (const fragment of ["AgentInterpretationResult", "SystemFailure", "systemFailure"]) {
      assert.equal(executionSource.includes(fragment), false, fragment);
    }
    assert.equal(executionSource.includes("AbortController"), true);
    assert.equal(executionSource.includes("clearTimeout"), true);
    const allowedImports = new Set([
      "node:crypto",
      "./agentContractConstants.js",
      "./canonicalDigest.js",
      "./providerPrompt.js",
      "./providerSemanticCandidateSchema.js",
      "./providerExecutionError.js",
      "./providerExecutionConstants.js",
    ]);
    for (const importPath of executionSource.matchAll(/from\s+"([^"]+)"/g)) {
      assert.ok(allowedImports.has(importPath[1]), `unexpected import ${importPath[1]}`);
    }
    const lower = executionSource.toLowerCase();
    for (const fragment of ["@goo" + "gle", "sdk", "generativeai"]) {
      assert.equal(lower.includes(fragment), false, fragment);
    }
  });

  await check("EX29", "no retry occurs after any failure", async () => {
    const scenarios = [
      jsonResponse({}, { status: 401 }),
      jsonResponse({}, { status: 429 }),
      jsonResponse({}, { status: 500 }),
      () => new TypeError("network reset"),
      jsonResponse(successPayload("{not valid json")),
      jsonResponse(successPayload(JSON.stringify((() => {
        const broken = lawfulCandidate(p5aProjection);
        delete broken.clientNarrative;
        return broken;
      })()))),
    ];
    for (const responder of scenarios) {
      let caught = null;
      const { impl, calls } = recordingTransport(responder);
      try {
        await executeGeminiProvider(
          { providerProjection: p5aProjection, prompt: p5aPrompt },
          { fetchImpl: impl, credentialReader: () => TEST_CREDENTIAL },
        );
      } catch (error) {
        caught = error;
      }
      assert.ok(caught instanceof ProviderExecutionError, "each scenario must fail");
      assert.equal(calls.length, 1, `exactly one attempt, no retry (${caught.failureClass})`);
    }
  });

  await check("EX30", "this validator performs no network, environment-secret, or SDK initialization", () => {
    const self = readFileSync(new URL(import.meta.url), "utf8");
    const forbidden = [
      "fet" + "ch(",
      "XML" + "HttpRequest",
      "node:ht" + "tps",
      "child_" + "process",
      "process" + ".env",
      "@goo" + "gle",
    ];
    for (const fragment of forbidden) {
      assert.equal(self.includes(fragment), false, fragment);
    }
  });
}

await main();

console.log("Agent Provider Execution Offline cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
