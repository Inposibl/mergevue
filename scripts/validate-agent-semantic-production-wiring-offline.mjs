import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import { runAgentInterpretation } from "../src/agent/agentInterpretationRun.js";
import { createXaiSemanticJudge } from "../src/agent/semanticJudgeAdapter.js";
import { getSemanticJudgeSystemInstruction } from "../src/agent/semanticJudgeSystemInstruction.js";
import { buildSemanticJudgePacket } from "../src/agent/semanticJudgePacket.js";
import { buildSemanticCheckSet, partitionChecks } from "../src/agent/semanticCheckEnumerator.js";
import { locallyEvaluateSemanticSubrule } from "../src/agent/semanticLocalEvaluator.js";
import { getSemanticSubrule } from "../src/agent/semanticApplicability.js";
import { XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH, XAI_RESPONSES_ENDPOINT } from "../src/agent/semanticJudgeTransportConstants.js";
import { GEMINI_API_HOST } from "../src/agent/providerExecutionConstants.js";
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
} from "../src/agent/semanticJudgeTransportError.js";
import { buildC5CSelectedSelectorProvenance } from "./fixtures/c5c-selected-session.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const SELECTOR_PROVENANCE = buildC5CSelectedSelectorProvenance();
const J5_PRODUCTION_FILES = Object.freeze([
  "src/agent/agentInterpretationRun.js",
  "src/agent/semanticJudgeAdapter.js",
  "src/agent/semanticJudgeSystemInstruction.js",
]);
const FORBIDDEN_J5_IMPORTS = Object.freeze([
  "src/flow/",
  "src/reporting/",
  "src/components/",
  "src/server/",
  "App.jsx",
  "src/ui/",
  "src/screenRegistry.js",
  "src/styles.css",
]);
const HUMAN_ROUTE_RE = /human analyst|practitioner review|manual review|human escalation|operator judgement|ask an analyst|we cannot tell/i;
const PRIVACY_FORBIDDEN = Object.freeze([
  "targetLocator",
  "ruleId",
  "semanticSubruleId",
  "findings",
  "UNIQUE_TARGET_PROSE_SENTINEL_J5",
  "AUTHORITY_CONTENT_SENTINEL_J5",
  "RAW_HTTP_BODY_SENTINEL_J5",
  "RAW_PROVIDER_OUTPUT_SENTINEL_J5",
  "xai-j5-test-credential",
  "offline-gemini-j5-credential",
]);

function pass(id, label) {
  results.push({ id, label, status: "PASS" });
}

async function check(id, label, fn) {
  await fn();
  pass(id, label);
}

function readSource(relativePath) {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

function repoRelativePath(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function walkFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) walkFiles(full, files);
    else files.push(full);
  }
  return files;
}

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
  for (let i = 1; i <= 11; i += 1) out[`Q${i}`] = answer({ ...template, ...(except[`Q${i}`] ?? {}) });
  return out;
}

const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
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
  candidatePair: "NF/SFP vs NF/SFJ",
  respondent1: SENIOR,
  respondent2: SENIOR,
  answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
  answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
};

function withFlags(coreInput) {
  return { outOfPairEvidence: false, coherenceAmbiguous: false, ...coreInput };
}

function identityFor(coreInput) {
  return {
    diagnosticId: "diag-j5",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
  };
}

function dualBundle(coreInput) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const identityContext = identityFor(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext,
    coreInput: input,
    selectorProvenance: SELECTOR_PROVENANCE,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({ engineSnapshot: snapshot, structuredUncertainty: uncertainty });
  const request = buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    interpretationContextPack: pack,
  });
  return { input, coreOutput, identityContext, snapshot, uncertainty, pack, request };
}

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
    } else out[key] = deepMerge(base[key], value);
  }
  return out;
}

function lawfulCandidate(projection, overrides = {}) {
  const refs = projectionRefs(projection);
  const caseB = projection.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  const originBranch = projection.structuredUncertainty.originBranch;
  const candidate = {
    interpretationStatus: originBranch === "P_1B" || originBranch === "P_5X"
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
      missingEvidence: refs.uncertaintyId ? [{ statement: "An open uncertainty.", uncertaintyIds: [refs.uncertaintyId] }] : [],
      changeConditions: refs.uncertaintyId
        ? [{ statement: "What would change the reading.", uncertaintyIds: [refs.uncertaintyId], wouldChange: "STATE_IDENTITY" }]
        : [],
      affectedResources: caseB ? [{ label: "Decision authority", contextRefs: [refs.mref] }] : [],
      watchpoints: caseB ? [{ statement: "A watchpoint.", horizon: "6m", contextRefs: [refs.mref], evidenceRefs: [refs.qrefA] }] : [],
    },
    uncertainty: {
      disclosures: refs.uncertaintyId ? [{
        uncertaintyId: refs.uncertaintyId,
        affects: "STATE_IDENTITY",
        clientStatement: "The engine did not establish a deterministic state identity.",
        unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"],
      }] : [],
    },
    claims: [
      { claimId: "CL-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
      { claimId: "CL-002", claimType: "DIRECT_EVIDENCE", text: "A respondent supplied a directly observed answer.", refs: [refs.qrefA], contextRefs: [] },
      { claimId: "CL-003", claimType: "BOUNDED_INTERPRETATION", text: "A bounded organizational reading of the supplied evidence.", refs: [refs.qrefA], contextRefs: boundedContextRefs },
      ...(refs.uncertaintyId ? [{ claimId: "CL-004", claimType: "UNCERTAINTY_DISCLOSURE", text: "A material uncertainty remains open.", refs: [`uref://${refs.uncertaintyId}`], contextRefs: [] }] : []),
      ...(caseB ? [{ claimId: "CL-005", claimType: "WATCHPOINT", text: "A friction-related watchpoint.", refs: [refs.qrefA], contextRefs: [refs.mref] }] : []),
      { claimId: "CL-006", claimType: "SCOPE_LIMITATION_DISCLOSURE", text: "A MergeVue-specific reading was not offered where the methodology domain was absent.", refs: [], contextRefs: [] },
    ],
    clientNarrative: {
      language: "en",
      sections: [
        { sectionId: "headline", text: "A bounded headline rendered from the established claims.", derivedFromClaimIds: ["CL-001"] },
        { sectionId: "situation", text: "A cohesive explanation of the observed operating interaction.", derivedFromClaimIds: ["CL-001", "CL-002"] },
        { sectionId: "implication", text: "Why the supported interaction matters for integration decisions.", derivedFromClaimIds: ["CL-006"] },
      ],
    },
  };
  return deepMerge(candidate, overrides);
}

function jsonResponse(status, payload) {
  return {
    status,
    headers: { get: () => null },
    json: async () => payload,
  };
}

function geminiSuccessPayload(candidate) {
  return {
    candidates: [{ content: { parts: [{ text: JSON.stringify(candidate) }] }, finishReason: "STOP" }],
  };
}

function lawfulVerdicts(packet, resolve = () => ({ verdict: "PASS" })) {
  return packet.checks.map((check, index) => {
    const resolved = resolve(check, index) ?? { verdict: "PASS" };
    const verdict = resolved.verdict ?? "PASS";
    const reasonCode = resolved.reasonCode
      ?? (verdict === "PASS" ? "RULE_SATISFIED" : verdict === "FAIL" ? "RULE_VIOLATED" : "AUTHORITY_ABSENT");
    const violationCode = Object.hasOwn(resolved, "violationCode")
      ? resolved.violationCode
      : (verdict === "FAIL" ? (getSemanticSubrule(check.semanticSubruleId)?.failureViolationCode ?? null) : null);
    return {
      checkId: check.checkId,
      ruleId: check.ruleId,
      targetLocator: check.targetLocator,
      verdict,
      violationCode,
      reasonCode,
      supportingAuthorityIds: check.authorityIds.length > 0 ? [check.authorityIds[0]] : [],
    };
  });
}

function completedJudgeResponse(verdicts, extra = {}) {
  return {
    id: "resp_j5",
    object: "response",
    status: "completed",
    error: null,
    output: [{
      type: "message",
      role: "assistant",
      status: "completed",
      refusal: extra.refusal ?? null,
      content: extra.omitText ? [] : [{ type: "output_text", text: JSON.stringify(verdicts) }],
    }],
  };
}

function parseJudgePacketFromInit(init) {
  const body = JSON.parse(init.body);
  return JSON.parse(body.input.find((item) => item.role === "user").content);
}

function recorder(handler) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), init });
    return handler(url, init, calls);
  };
  return { fetchImpl, calls };
}

function isSystemFailure(value) {
  return value !== null && typeof value === "object" && value.failureSchemaVersion === "system-failure-1.0";
}

function isInterpretationResult(value) {
  return value !== null && typeof value === "object" && typeof value.resultSchemaVersion === "string";
}

function assertNoPrivacyLeak(value) {
  const blob = `${JSON.stringify(value)}\n${value?.detail ?? ""}\n${value?.stack ?? ""}`;
  for (const token of PRIVACY_FORBIDDEN) {
    assert.equal(blob.includes(token), false, token);
  }
  assert.equal(/\n\s*at\s+/.test(blob), false);
}

function makeTransportCheck(index) {
  const id = String(index + 1).padStart(3, "0");
  return {
    checkId: `sha256:j5-check-${id}`,
    ruleId: "V-02",
    semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
    targetFamily: "CLAIM_TEXT",
    targetLocator: `claims[${index}].text`,
    expectedInvariant: "invariant",
    allowedSemanticInterpretations: ["allowed"],
    forbiddenSemanticImplications: ["forbidden"],
    authorityIds: [`ENGINE_FACT:fact-${id}`],
    authorities: [{ kind: "ENGINE_FACT", id: `fact-${id}`, value: { index } }],
    target: {
      targetFamily: "CLAIM_TEXT",
      targetLocator: `claims[${index}].text`,
      targetDigest: `sha256:d-${id}`,
      text: `t${id}`,
      metadata: {},
    },
  };
}

function makePacket(n) {
  return buildSemanticJudgePacket({
    checks: Array.from({ length: n }, (_, index) => makeTransportCheck(index)),
    batchIndex: 0,
    batchCount: 1,
  });
}

function geminiCandidateFor(coreInput, overrides = {}) {
  const bundle = dualBundle(coreInput);
  const projection = projectProviderProjection(bundle.request);
  return { bundle, candidate: lawfulCandidate(projection, overrides) };
}

async function runWith(coreInput, {
  candidateOverrides,
  judgeResolve,
  judgeHandler,
  providerHandler,
  xaiCredential = "xai-j5-test-credential",
  geminiCredential = "offline-gemini-j5-credential",
} = {}) {
  const prepared = geminiCandidateFor(coreInput, candidateOverrides);
  const provider = recorder(providerHandler ?? (async () => jsonResponse(200, geminiSuccessPayload(prepared.candidate))));
  const judge = recorder(judgeHandler ?? (async (_url, init) => {
    const packet = parseJudgePacketFromInit(init);
    return jsonResponse(200, completedJudgeResponse(lawfulVerdicts(packet, judgeResolve)));
  }));
  const previousXai = process.env.XAI_API_KEY;
  const previousGemini = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  if (xaiCredential === null) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = xaiCredential;
  if (geminiCredential === null) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = geminiCredential;
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    if (href.startsWith(GEMINI_API_HOST) || href.includes("generativelanguage.googleapis.com")) {
      return provider.fetchImpl(url, init);
    }
    if (href === XAI_RESPONSES_ENDPOINT || href.startsWith("https://api.x.ai/")) {
      return judge.fetchImpl(url, init);
    }
    throw new Error(`unexpected fetch URL: ${href}`);
  };
  try {
    const outcome = await runAgentInterpretation({
      outcomeSource: "DUAL_CORE",
      selectorProvenance: SELECTOR_PROVENANCE,
      coreOutput: prepared.bundle.coreOutput,
      identityContext: prepared.bundle.identityContext,
      coreInput: prepared.bundle.input,
    });
    return { outcome, providerCalls: provider.calls, judgeCalls: judge.calls, prepared };
  } finally {
    globalThis.fetch = previousFetch;
    if (previousXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = previousXai;
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGemini;
  }
}

function hasExecutableSemanticJudgeTransportDependency(source) {
  return source.includes("semanticJudgeTransport.js")
    && /from\s+["'][^"']*semanticJudgeTransport\.js["']/.test(source);
}

function executableTransportImporters() {
  const found = [];
  for (const file of walkFiles(join(ROOT, "src"))) {
    const relativePath = repoRelativePath(file);
    if (relativePath === "src/agent/semanticJudgeTransport.js") continue;
    const source = readFileSync(file, "utf8");
    if (hasExecutableSemanticJudgeTransportDependency(source)) {
      found.push(relativePath);
    }
  }
  found.sort();
  return found;
}

function hasSemanticSystemFailureProductionDependency(source) {
  return /from\s+["'][^"']*semanticSystemFailure\.js["']/.test(source)
    || source.includes("mapSemanticJudgeTransportErrorToSystemFailure")
    || source.includes("mapSemanticValidationErrorToSystemFailure");
}

function collectSemanticSystemFailureImporters() {
  const found = [];
  for (const file of walkFiles(join(ROOT, "src"))) {
    const relativePath = repoRelativePath(file);
    if (relativePath === "src/agent/semanticSystemFailure.js") continue;
    const source = readFileSync(file, "utf8");
    if (hasSemanticSystemFailureProductionDependency(source)) {
      found.push(relativePath);
    }
  }
  found.sort();
  return found;
}

async function main() {
  const runSource = readSource("src/agent/agentInterpretationRun.js");
  const adapterSource = readSource("src/agent/semanticJudgeAdapter.js");
  const instruction = getSemanticJudgeSystemInstruction();

  await check("W01", "semantic validator invoked exactly once", async () => {
    const callSites = runSource.split("validateAgentInterpretationSemantics(").length - 1;
    assert.equal(callSites, 1);
    const ran = await runWith(P5A_INPUT);
    assert.equal(isInterpretationResult(ran.outcome), true);
    assert.equal(ran.judgeCalls.length, 1);
  });

  await check("W02", "C-set fixture judge calls equal packet count", async () => {
    const ran = await runWith(P5A_INPUT);
    assert.equal(isInterpretationResult(ran.outcome), true);
    const { cSet } = buildSemanticCheckSet(ran.prepared.bundle.request, ran.outcome);
    assert.equal(cSet.length > 0, true);
    const partitions = partitionChecks(cSet, XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH);
    assert.equal(ran.judgeCalls.length, partitions.length);
  });

  await check("W03", "D-set-only fixture performs zero judge calls", async () => {
    const ran = await runWith(P5A_INPUT, {
      candidateOverrides: {
        interpretationStatus: "ABSTAINED_INSUFFICIENT_EVIDENCE",
        abstentionReason: "NO_SURVIVING_ADMISSIBLE_EVIDENCE",
        interpretation: {
          hypotheses: { ordering: "CO_EQUAL", items: [] },
          decisiveEvidence: [],
          conflictingEvidence: [],
          missingEvidence: [],
          changeConditions: [],
          affectedResources: [],
          watchpoints: [],
        },
        claims: [],
        clientNarrative: { language: "en", sections: [] },
      },
    });
    assert.equal(ran.judgeCalls.length, 0);
    assert.equal(isSystemFailure(ran.outcome), true);
  });

  await check("W04", "no semantic bypass on success", async () => {
    assert.equal(runSource.includes("validateAgentInterpretationSemantics({"), true);
    const iAssemble = runSource.indexOf("const assembledResult = assembleAgentInterpretationResult");
    const iValidate = runSource.indexOf("const validatedResult = await validateAgentInterpretationSemantics");
    const iIdentity = runSource.indexOf("if (validatedResult !== assembledResult)");
    const iReturn = runSource.indexOf("return assembledResult;");
    assert.equal(iAssemble >= 0, true);
    assert.equal(iValidate > iAssemble, true);
    assert.equal(iIdentity > iValidate, true);
    assert.equal(iReturn > iIdentity, true);
    const ran = await runWith(P5A_INPUT);
    assert.equal(isInterpretationResult(ran.outcome), true);
  });

  await check("W05", "semantic failure produces no successful Result; no pre-PASS observer", async () => {
    assert.equal(runSource.includes("observeInterpretation"), false);
    assert.equal(runSource.includes("runtimeOptions"), false);
    assert.equal(runSource.includes("EventEmitter"), false);
    assert.equal(/\.emit\s*\(/.test(runSource), false);
    assert.equal(/dispatchEvent\s*\(/.test(runSource), false);
    assert.equal(runSource.includes("addEventListener"), false);
    const observeLike = runSource.match(/\bobserve[A-Z][A-Za-z0-9_]*/g) ?? [];
    assert.deepEqual(observeLike, []);
    const assembledAssignments = runSource.split("assembledResult");
    assert.equal(assembledAssignments.length >= 5, true);
    assert.equal(runSource.includes("agentInterpretationResult: assembledResult"), true);
    assert.equal(runSource.includes("observeInterpretation({ request: agentInterpretationRequest, assembledResult })"), false);
    const ran = await runWith(P5A_INPUT, {
      judgeResolve: (check) => (check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "FAIL" } : { verdict: "PASS" }),
    });
    assert.equal(isSystemFailure(ran.outcome), true);
    assert.equal(isInterpretationResult(ran.outcome), false);
  });

  await check("W06", "adapter forwards packet identities and no credentialReader", async () => {
    assert.equal(adapterSource.includes("judgePacket: packet"), true);
    assert.equal(adapterSource.includes("submittedChecks: packet.checks"), true);
    assert.equal(adapterSource.includes("credentialReader"), false);
    assert.equal(adapterSource.includes("XAI_API_KEY"), false);
    const packet = makePacket(2);
    Object.freeze(packet);
    Object.freeze(packet.checks);
    let seenPacket = null;
    const judge = recorder(async (_url, init) => {
      const parsed = parseJudgePacketFromInit(init);
      seenPacket = parsed;
      return jsonResponse(200, completedJudgeResponse(lawfulVerdicts(parsed)));
    });
    const previousXai = process.env.XAI_API_KEY;
    process.env.XAI_API_KEY = "xai-j5-test-credential";
    try {
      const adapted = createXaiSemanticJudge({ fetchImpl: judge.fetchImpl });
      const verdicts = await adapted(packet);
      assert.equal(verdicts.length, packet.checks.length);
      assert.equal(seenPacket.checks[0].checkId, packet.checks[0].checkId);
      assert.equal(Object.isFrozen(packet), true);
    } finally {
      if (previousXai === undefined) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = previousXai;
    }
  });

  await check("W07", "no retry; single transport failure is one fetch", async () => {
    for (const file of J5_PRODUCTION_FILES) {
      const source = readSource(file);
      assert.equal(/\bretry\s*\(|\.retry\b|\bbackoff\b/i.test(source), false, file);
    }
    assert.equal(runSource.split("runAgentInterpretation(").length - 1, 1);
    const ran = await runWith(P5A_INPUT, {
      judgeHandler: async () => jsonResponse(401, { error: { message: "unauthorized" } }),
    });
    assert.equal(ran.judgeCalls.length, 1);
    assert.equal(isSystemFailure(ran.outcome), true);
  });

  await check("W08", "256 admitted and 257 rejected pre-network", async () => {
    const previousXai = process.env.XAI_API_KEY;
    process.env.XAI_API_KEY = "xai-j5-test-credential";
    try {
      const admitted = recorder(async (_url, init) => {
        const packet = parseJudgePacketFromInit(init);
        assert.equal(packet.checks.length, 256);
        return jsonResponse(200, completedJudgeResponse(lawfulVerdicts(packet)));
      });
      const ok = createXaiSemanticJudge({ fetchImpl: admitted.fetchImpl });
      const verdicts = await ok(makePacket(256));
      assert.equal(verdicts.length, 256);
      assert.equal(admitted.calls.length, 1);
      const blocked = recorder(async () => {
        throw new Error("network must not run");
      });
      const over = createXaiSemanticJudge({ fetchImpl: blocked.fetchImpl });
      await assert.rejects(() => over(makePacket(257)), (error) => {
        assert.equal(error instanceof SemanticJudgeTransportError, true);
        assert.equal(error.errorCode, JUDGE_CONFIGURATION_FAILURE);
        return true;
      });
      assert.equal(blocked.calls.length, 0);
      assert.equal(XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH, 256);
    } finally {
      if (previousXai === undefined) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = previousXai;
    }
  });

  await check("W09", "V-13 and V-29 remain judge-only", () => {
    const v13 = locallyEvaluateSemanticSubrule({ semanticSubruleId: "V-13-SEM-PROBABILITY" });
    const v29 = locallyEvaluateSemanticSubrule({ semanticSubruleId: "V-29-SEM-RANK-PROBABILITY" });
    assert.equal(v13.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    assert.equal(v13.violationCode, null);
    assert.equal(v29.outcome, "REQUIRES_SEMANTIC_JUDGMENT");
    assert.equal(v29.violationCode, null);
  });

  await check("W10", "all-PASS returns exact assembled Result identity without pre-PASS observation", async () => {
    const iAssemble = runSource.indexOf("const assembledResult = assembleAgentInterpretationResult");
    const iValidate = runSource.indexOf("const validatedResult = await validateAgentInterpretationSemantics");
    const iIdentity = runSource.indexOf("if (validatedResult !== assembledResult)");
    const iThrow = runSource.indexOf("throw new TypeError(", iIdentity);
    const iReturn = runSource.indexOf("return assembledResult;");
    assert.equal(iAssemble >= 0, true);
    assert.equal(runSource.includes("agentInterpretationResult: assembledResult"), true);
    assert.equal(iValidate > iAssemble, true);
    assert.equal(iIdentity > iValidate, true);
    assert.equal(iThrow > iIdentity, true);
    assert.equal(iReturn > iThrow, true);
    assert.equal(runSource.includes("observeInterpretation"), false);
    const j1 = readSource("scripts/validate-agent-semantic-validator-core-offline.mjs");
    assert.equal(j1.includes("assert.equal(Object.is(returned, p5a.result), true)"), true);
    assert.equal(j1.includes("assert.equal(Object.is(pass, p5a.result), true)"), true);
    const ran = await runWith(P5A_INPUT);
    assert.equal(isInterpretationResult(ran.outcome), true);
  });

  await check("W11", "judge FAIL maps to canonical semantic SystemFailure", async () => {
    const ran = await runWith(P5A_INPUT, {
      judgeResolve: (check) => (check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "FAIL" } : { verdict: "PASS" }),
    });
    assert.equal(isSystemFailure(ran.outcome), true);
    assert.equal(ran.outcome.failureClass, "PROHIBITED_CLAIM_VIOLATION");
    assert.equal(ran.outcome.retryable, true);
    assert.equal((ran.outcome.detail ?? "").includes("violationCode=PROHIBITED_CLAIM_VIOLATION"), true);
    assertNoPrivacyLeak(ran.outcome);
  });

  await check("W12", "UNABLE maps to CONSTRAINT_ENFORCEMENT_FAILURE and outranks FAIL", async () => {
    const ran = await runWith(P5A_INPUT, {
      judgeResolve: (check, index) => {
        if (index === 0) {
          return { verdict: "UNABLE_TO_EVALUATE", reasonCode: "AUTHORITY_ABSENT", supportingAuthorityIds: [] };
        }
        return check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "FAIL" } : { verdict: "PASS" };
      },
    });
    assert.equal(isSystemFailure(ran.outcome), true);
    assert.equal(ran.outcome.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE");
    assert.equal((ran.outcome.detail ?? "").includes("semanticErrorKind=EVALUATOR_INCAPACITY"), true);
    assertNoPrivacyLeak(ran.outcome);
  });

  await check("W13", "all eight J2 transport failures map to CONSTRAINT_ENFORCEMENT_FAILURE", async () => {
    const cases = [
      [JUDGE_CONFIGURATION_FAILURE, async () => runWith(P5A_INPUT, { xaiCredential: null })],
      [JUDGE_TRANSPORT_FAILURE, async () => runWith(P5A_INPUT, { judgeHandler: async () => { throw new Error("network"); } })],
      [JUDGE_TIMEOUT, async () => runWith(P5A_INPUT, {
        judgeHandler: async () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          throw error;
        },
      })],
      [JUDGE_AUTH_FAILURE, async () => runWith(P5A_INPUT, { judgeHandler: async () => jsonResponse(401, {}) })],
      [JUDGE_RATE_LIMIT, async () => runWith(P5A_INPUT, { judgeHandler: async () => jsonResponse(429, {}) })],
      [JUDGE_HTTP_FAILURE, async () => runWith(P5A_INPUT, { judgeHandler: async () => jsonResponse(500, {}) })],
      [JUDGE_PROTOCOL_FAILURE, async () => runWith(P5A_INPUT, { judgeHandler: async () => jsonResponse(200, { status: "incomplete", output: [] }) })],
      [JUDGE_REFUSAL, async () => runWith(P5A_INPUT, {
        judgeHandler: async (_url, init) => {
          const packet = parseJudgePacketFromInit(init);
          return jsonResponse(200, completedJudgeResponse(lawfulVerdicts(packet), { refusal: "refused" }));
        },
      })],
    ];
    for (const [code, runCase] of cases) {
      const ran = await runCase();
      assert.equal(isSystemFailure(ran.outcome), true, code);
      assert.equal(ran.outcome.failureClass, "CONSTRAINT_ENFORCEMENT_FAILURE", code);
      assert.equal(ran.outcome.retryable, false, code);
      assert.equal((ran.outcome.detail ?? "").includes(`transportErrorCode=${code}`), true, code);
      assertNoPrivacyLeak(ran.outcome);
    }
  });

  await check("W14", "unknown TypeError propagates and is not canonicalized", async () => {
    const throwing = new Proxy({}, {
      get(_target, prop) {
        if (prop === Symbol.toStringTag) return "Object";
        throw new TypeError("injected programmer defect");
      },
    });
    await assert.rejects(
      () => runAgentInterpretation({
        outcomeSource: "DUAL_CORE",
        selectorProvenance: SELECTOR_PROVENANCE,
        coreOutput: throwing,
        identityContext: identityFor(P5A_INPUT),
        coreInput: withFlags(P5A_INPUT),
      }),
      (error) => {
        assert.equal(error instanceof TypeError, true);
        assert.equal(isSystemFailure(error), false);
        return true;
      },
    );
  });

  await check("W15", "privacy: forbidden tokens absent from serialized SystemFailure", async () => {
    const failures = [];
    failures.push((await runWith(P5A_INPUT, {
      judgeResolve: (check) => (check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "FAIL" } : { verdict: "PASS" }),
    })).outcome);
    failures.push((await runWith(P5A_INPUT, { judgeHandler: async () => jsonResponse(401, { RAW_HTTP_BODY_SENTINEL_J5: true }) })).outcome);
    failures.push((await runWith(P5A_INPUT, { xaiCredential: null })).outcome);
    for (const failure of failures) {
      assert.equal(isSystemFailure(failure), true);
      assertNoPrivacyLeak(failure);
      assert.equal(JSON.stringify(failure).includes("UNIQUE_TARGET_PROSE_SENTINEL_J5"), false);
    }
  });

  await check("W16", "FREE no-human-runtime", async () => {
    for (const file of J5_PRODUCTION_FILES) {
      const source = readSource(file);
      assert.equal(HUMAN_ROUTE_RE.test(source), false, file);
      assert.equal(source.includes("humanReviewOccurred: true"), false, file);
    }
    const ran = await runWith(P5A_INPUT);
    assert.equal(ran.prepared.bundle.request.humanReviewOccurred, false);
    assert.equal(isInterpretationResult(ran.outcome), true);
  });

  await check("W17", "P_1B Core semantics remain intact but have no selector-authoritative Agent reach", async () => {
    const input = withFlags(P1B_INPUT);
    const coreOutput = compareDualRespondents(input);
    assert.equal(coreOutput.priority, "1b");
    assert.equal(coreOutput.audit.exact1bSpecialCondition, true);
    await assert.rejects(
      () => runAgentInterpretation({
        outcomeSource: "DUAL_CORE",
        selectorProvenance: SELECTOR_PROVENANCE,
        coreOutput,
        identityContext: identityFor(input),
        coreInput: input,
      }),
      (error) => {
        assert.equal(error?.name, "AgentBoundaryAssemblyError");
        assert.match(error?.message ?? "", /P_1B is not selector-compatible/);
        return true;
      },
    );
  });

  await check("W18", "Renderer/UI isolation", () => {
    for (const file of J5_PRODUCTION_FILES) {
      const source = readSource(file);
      for (const fragment of FORBIDDEN_J5_IMPORTS) {
        assert.equal(source.includes(fragment), false, `${file} ${fragment}`);
      }
    }
    const consumerHits = [];
    for (const file of walkFiles(join(ROOT, "src"))) {
      const relativePath = repoRelativePath(file);
      if (J5_PRODUCTION_FILES.includes(relativePath)) continue;
      if (relativePath.startsWith("src/agent/")) continue;
      const source = readFileSync(file, "utf8");
      if (source.includes("agentInterpretationRun.js") || source.includes("semanticJudgeAdapter.js")) {
        consumerHits.push(relativePath);
      }
    }
    assert.deepEqual(consumerHits, []);
    assert.deepEqual(executableTransportImporters(), ["src/agent/semanticJudgeAdapter.js"]);
  });

  await check("C01", "runAgentInterpretation has no observeInterpretation or equivalent pre-PASS observer", () => {
    const signatureStart = runSource.indexOf("export async function runAgentInterpretation");
    const signature = runSource.slice(
      signatureStart,
      runSource.indexOf("let agentInterpretationRequest", signatureStart),
    );
    assert.equal(signature.includes("observeInterpretation"), false);
    assert.equal(runSource.includes("observeInterpretation"), false);
    assert.equal(/\bobserver\b/.test(runSource), false);
    assert.equal(/\bonAssembled|\bonResult|\bbeforeValidate|\bdebugResult/.test(runSource), false);
    for (const file of J5_PRODUCTION_FILES) {
      const source = readSource(file);
      assert.equal(source.includes("observeInterpretation"), false, file);
    }
  });

  await check("C02", "no source path emits/calls/publishes assembledResult before semantic PASS", () => {
    for (const file of J5_PRODUCTION_FILES) {
      const source = readSource(file);
      assert.equal(/\.emit\s*\(/.test(source), false, file);
      assert.equal(source.includes("dispatchEvent"), false, file);
      assert.equal(source.includes("EventEmitter"), false, file);
      assert.equal(source.includes("addEventListener"), false, file);
    }
    const beforeValidate = runSource.slice(0, runSource.indexOf("const validatedResult = await validateAgentInterpretationSemantics"));
    assert.equal(beforeValidate.includes("assembledResult"), true);
    assert.equal(/assembledResult\s*\)/.test(beforeValidate.replace("assembleAgentInterpretationResult({", "")), false);
    assert.equal(beforeValidate.includes("observeInterpretation"), false);
    assert.equal(runSource.includes("agentInterpretationResult: assembledResult"), true);
  });

  await check("C03", "semantic failure causes zero successful Result handoff", async () => {
    assert.equal(runSource.includes("return assembledResult;"), true);
    assert.equal(runSource.indexOf("return assembledResult;") > runSource.indexOf("if (validatedResult !== assembledResult)"), true);
    const ran = await runWith(P5A_INPUT, {
      judgeResolve: (check) => (check.semanticSubruleId === "V-13-SEM-PROBABILITY" ? { verdict: "FAIL" } : { verdict: "PASS" }),
    });
    assert.equal(isSystemFailure(ran.outcome), true);
    assert.equal(isInterpretationResult(ran.outcome), false);
    assert.equal(Object.hasOwn(ran.outcome, "resultSchemaVersion"), false);
  });

  await check("C04", "successful semantic flow returns assembledResult only after identity assertion", async () => {
    const iValidate = runSource.indexOf("const validatedResult = await validateAgentInterpretationSemantics");
    const iIdentity = runSource.indexOf("if (validatedResult !== assembledResult)");
    const iReturn = runSource.indexOf("return assembledResult;");
    assert.equal(iValidate >= 0 && iIdentity > iValidate && iReturn > iIdentity, true);
    const ran = await runWith(P5A_INPUT);
    assert.equal(isInterpretationResult(ran.outcome), true);
    assert.equal(isSystemFailure(ran.outcome), false);
  });

  await check("C05", "identity violation is an unknown programmer defect, not SystemFailure", () => {
    assert.equal(runSource.includes("if (validatedResult !== assembledResult)"), true);
    assert.equal(runSource.includes("throw new TypeError("), true);
    assert.equal(/if \(error instanceof TypeError\)/.test(runSource), false);
    assert.equal(runSource.includes("mapKnownFailure(error, agentInterpretationRequest)"), true);
    const mapperBlock = runSource.slice(
      runSource.indexOf("function mapKnownFailure"),
      runSource.indexOf("export async function runAgentInterpretation"),
    );
    assert.equal(mapperBlock.includes("ProviderExecutionError"), true);
    assert.equal(mapperBlock.includes("ResultAssemblyError"), true);
    assert.equal(mapperBlock.includes("SemanticJudgeTransportError"), true);
    assert.equal(mapperBlock.includes("SemanticValidationError"), true);
    assert.equal(mapperBlock.includes("TypeError"), false);
    assert.equal(mapperBlock.includes("return null;"), true);
  });

  await check("C06", "JT44 sees exactly one executable production importer: semanticJudgeAdapter.js", () => {
    const importers = executableTransportImporters();
    assert.deepEqual(importers, ["src/agent/semanticJudgeAdapter.js"]);
    assert.equal(importers.length, 1);
    assert.equal(importers[0], "src/agent/semanticJudgeAdapter.js");
    assert.equal(adapterSource.includes("from \"./semanticJudgeTransport.js\""), true);
    assert.equal(adapterSource.includes("executeXaiSemanticJudge"), true);
    assert.equal(runSource.includes("semanticJudgeTransport.js"), false);
  });

  await check("C07", "JT44 would fail on a synthetic second executable importer", () => {
    const authorized = ["src/agent/semanticJudgeAdapter.js"];
    const actual = executableTransportImporters();
    assert.deepEqual(actual, authorized);
    const syntheticSecondRelative = "src/agent/unauthorizedSemanticJudgeTransportConsumer.js";
    const syntheticSource = [
      "import { executeXaiSemanticJudge } from \"./semanticJudgeTransport.js\";",
      "",
      "export async function unauthorized(packet) {",
      "  return executeXaiSemanticJudge({",
      "    systemInstruction: \"synthetic\",",
      "    judgePacket: packet,",
      "    submittedChecks: packet.checks,",
      "  });",
      "}",
      "",
    ].join("\n");
    assert.equal(hasExecutableSemanticJudgeTransportDependency(syntheticSource), true);
    const syntheticDetectedImporters = [...actual];
    if (hasExecutableSemanticJudgeTransportDependency(syntheticSource)) {
      syntheticDetectedImporters.push(syntheticSecondRelative);
    }
    syntheticDetectedImporters.sort();
    assert.equal(syntheticDetectedImporters.includes(syntheticSecondRelative), true);
    assert.notDeepEqual(syntheticDetectedImporters, authorized);
  });

  await check("C08", "SF40 sees exactly one production importer of J3 semantic mappers: agentInterpretationRun.js", () => {
    const importers = collectSemanticSystemFailureImporters();
    assert.deepEqual(importers, ["src/agent/agentInterpretationRun.js"]);
    assert.equal(runSource.includes("from \"./semanticSystemFailure.js\""), true);
    assert.equal(runSource.includes("mapSemanticJudgeTransportErrorToSystemFailure"), true);
    assert.equal(runSource.includes("mapSemanticValidationErrorToSystemFailure"), true);
    assert.equal(adapterSource.includes("semanticSystemFailure"), false);
  });

  await check("C09", "SF40 would fail on a synthetic second production importer", () => {
    const authorized = ["src/agent/agentInterpretationRun.js"];
    const actual = collectSemanticSystemFailureImporters();
    assert.deepEqual(actual, authorized);
    const syntheticSecondRelative = "src/agent/unauthorizedSemanticSystemFailureConsumer.js";
    const syntheticSource = [
      "import {",
      "  mapSemanticJudgeTransportErrorToSystemFailure,",
      "  mapSemanticValidationErrorToSystemFailure,",
      "} from \"./semanticSystemFailure.js\";",
      "",
      "export function unauthorized(error, request) {",
      "  return mapSemanticValidationErrorToSystemFailure({",
      "    agentInterpretationRequest: request,",
      "    semanticValidationError: error,",
      "  });",
      "}",
      "",
    ].join("\n");
    assert.equal(hasSemanticSystemFailureProductionDependency(syntheticSource), true);
    const syntheticDetectedImporters = [...actual];
    if (hasSemanticSystemFailureProductionDependency(syntheticSource)) {
      syntheticDetectedImporters.push(syntheticSecondRelative);
    }
    syntheticDetectedImporters.sort();
    assert.equal(syntheticDetectedImporters.includes(syntheticSecondRelative), true);
    assert.notDeepEqual(syntheticDetectedImporters, authorized);
  });

  await check("C10", "runAgentInterpretation exposes no caller-controlled fetchImpl or generic runtimeOptions bag", () => {
    const signatureStart = runSource.indexOf("export async function runAgentInterpretation");
    const signature = runSource.slice(
      signatureStart,
      runSource.indexOf("let agentInterpretationRequest", signatureStart),
    );
    assert.equal(signature.includes("runtimeOptions"), false);
    assert.equal(signature.includes("fetchImpl"), false);
    assert.equal(signature.includes("judgeFetchImpl"), false);
    assert.equal(signature.includes("providerFetchImpl"), false);
    assert.equal(runSource.includes("runtimeOptions"), false);
    assert.equal(runSource.includes("judgeFetchImpl"), false);
    assert.equal(runSource.includes("providerFetchImpl"), false);
    assert.equal(runSource.includes("createXaiSemanticJudge()"), true);
    assert.equal(runSource.includes("createXaiSemanticJudge({"), false);
    assert.equal(adapterSource.includes("function createXaiSemanticJudge({ fetchImpl } = {})"), true);
  });

  const gates = [
    ["validate:agent-semantic-validator-core-offline", "PASS 24/24"],
    ["validate:agent-semantic-judge-transport-offline", "PASS 73/73"],
    ["validate:agent-semantic-system-failure-offline", "PASS 57/57"],
    ["validate:agent-semantic-conformance-offline", "PASS 313/313"],
  ];
  await check("W19", "accepted semantic regressions remain unchanged", () => {
    for (const [script, expected] of gates) {
      const spawned = spawnSync("npm", ["run", script], { cwd: ROOT, encoding: "utf8" });
      assert.equal(spawned.status, 0, spawned.stderr || spawned.stdout);
      assert.equal((spawned.stdout ?? "").includes(expected), true, script);
    }
  });

  assert.equal(typeof instruction, "string");
  assert.equal(instruction.length > 0, true);
  assert.equal(instruction.includes("XAI_API_KEY"), false);
  assert.equal(instruction.includes("api.x.ai"), false);
  assert.equal(XAI_RESPONSES_ENDPOINT.startsWith("https://api.x.ai/"), true);

  console.log("Agent Semantic Production Wiring Offline cases passed:");
  for (const row of results) console.log(`  ${row.id}. ${row.label}: ${row.status}`);
  console.log(`PASS ${results.length}/${results.length}`);
}

await main();
