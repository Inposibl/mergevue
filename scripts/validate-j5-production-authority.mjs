import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { handleProductionInterpretationAction } from "../api/production-interpretation.ts";
import { CanonicalSerializeError } from "../src/agent/canonicalDigest.js";
import {
  authorizeAndSaveRawAssessment,
  commitAssessmentAuthority,
  createAssessmentSession,
  currentSemanticMutationDigest,
  readAssessmentSession,
  saveTargetObservationCompletion,
  saveTargetObservationSetup,
} from "../src/server/_sessionLedger.ts";
import {
  DEAL_TYPE_OPTIONS,
  TRANSACTION_DETAIL_SECTIONS,
} from "../src/flow/acquirerTrackFlow.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import { hashObservationSetupCode } from "../src/flow/targetObservationFlow.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { buildC5CSelectedSession } from "./fixtures/c5c-selected-session.mjs";

const checks = [];

async function check(id, label, fn) {
  await fn();
  checks.push(id);
  console.log(`PASS ${id} ${label}`);
}

function fullDealContext() {
  return {
    acquirerName: "Authority Acquirer",
    targetName: "Authority Target",
    dealType: DEAL_TYPE_OPTIONS[0].value,
    respondentSide: "acquirer",
    respondentRole: "deal_lead",
    respondentSeniority: "c_suite_founder",
    respondentFunction: "strategy_corporate_development",
    respondentAccessLevel: "full_deal_room_leadership_access",
    ...Object.fromEntries(TRANSACTION_DETAIL_SECTIONS.map((section) => [section.id, section.options[0].value])),
    enterpriseValueStatus: "not_available",
    compensationStatus: "not_available",
    keyPersonnelAtRisk: "",
  };
}

export function targetSelfInput() {
  const positioning = Object.fromEntries(
    TARGET_SELF_ASSESSMENT_DATA.positioningFields.map((field) => [field.id, field.options[0].value]),
  );
  positioning.p2 = "B";
  positioning.acquisitionAwareness = "yes";
  const answers = Object.fromEntries(
    TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.map((question) => (
      [question.id, evidenceClassifiedAnswer(question.options[0].value)]
    )),
  );
  return { positioning, answers };
}

function projectionFromGeminiRequest(options) {
  const request = JSON.parse(options.body);
  const text = request.contents[0].parts[0].text;
  const prefix = "BEGIN_PROVIDER_PROJECTION_JSON\n";
  const suffix = "\nEND_PROVIDER_PROJECTION_JSON";
  return JSON.parse(text.slice(prefix.length, -suffix.length));
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

function singleCandidate(projection) {
  const refs = projectionRefs(projection);
  const evidenceBasis = { supportBasis: "PRIMARY_COMPARABLE", conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE", materialUnknownsPresent: true };
  const hypothesis = (hypothesisId, statement, qref) => ({
    hypothesisId,
    statement,
    evidenceBasis,
    decisiveEvidenceRefs: [qref],
    conflictingEvidenceRefs: [],
    contextRefs: refs.mref ? [refs.mref] : [],
    requiresEngineFactNotEstablished: [],
  });
  return {
    interpretationStatus: "INTERPRETATION_CONSTRAINED",
    abstentionReason: null,
    interpretation: {
      hypotheses: { ordering: "CO_EQUAL", items: [hypothesis("H1", "One bounded R1 reading of the supplied evidence.", refs.qrefA), hypothesis("H2", "A co-equal alternative R1 reading of the supplied evidence.", refs.qrefB ?? refs.qrefA)] },
      decisiveEvidence: [], conflictingEvidence: [],
      missingEvidence: [{ statement: "Independent R2 comparison evidence is unavailable.", uncertaintyIds: [refs.uncertaintyId] }],
      changeConditions: [], affectedResources: [], watchpoints: [],
    },
    uncertainty: { disclosures: [{ uncertaintyId: refs.uncertaintyId, affects: "DETAIL", clientStatement: "No independent R2 comparison occurred; this interpretation uses sealed R1 facts only.", unresolvedEngineFacts: [] }] },
    claims: [
      { claimId: "CL-1", claimType: "DETERMINISTIC_FACT", text: "The engine retained the sealed R1 outcome boundary.", refs: [refs.factref], contextRefs: [] },
      { claimId: "CL-2", claimType: "DIRECT_EVIDENCE", text: "The R1 respondent supplied this observation.", refs: [refs.qrefA], contextRefs: [] },
      { claimId: "CL-3", claimType: "BOUNDED_INTERPRETATION", text: "A bounded reading of the sealed R1 evidence remains possible.", refs: [refs.qrefA], contextRefs: refs.mref ? [refs.mref] : [] },
      { claimId: "CL-4", claimType: "UNCERTAINTY_DISCLOSURE", text: "No independent R2 comparison occurred.", refs: [`uref://${refs.uncertaintyId}`], contextRefs: [] },
      { claimId: "CL-5", claimType: "SCOPE_LIMITATION_DISCLOSURE", text: "This constrained interpretation does not supply an R1-versus-R2 comparison.", refs: [], contextRefs: [] },
    ],
    clientNarrative: {
      language: "en",
      sections: [
        { sectionId: "headline", text: "A constrained headline rendered from the sealed R1 claims.", derivedFromClaimIds: ["CL-1"] },
        { sectionId: "situation", text: "The sealed R1 facts support bounded co-equal readings, while no independent R2 comparison occurred.", derivedFromClaimIds: ["CL-1", "CL-3"] },
        { sectionId: "implication", text: "This constrained interpretation does not supply an R1-versus-R2 comparison.", derivedFromClaimIds: ["CL-5"] },
      ],
    },
  };
}

function dualCandidate(projection) {
  const refs = projectionRefs(projection);
  const contextRefs = refs.mref ? [refs.mref] : [];
  const uncertainty = refs.uncertaintyId;
  const hypothesis = (id, statement, qref) => ({
    hypothesisId: id,
    statement,
    evidenceBasis: { supportBasis: "PRIMARY_COMPARABLE", conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE", materialUnknownsPresent: Boolean(uncertainty) },
    decisiveEvidenceRefs: [qref], conflictingEvidenceRefs: [], contextRefs, requiresEngineFactNotEstablished: [],
  });
  return {
    interpretationStatus: "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: { ordering: "CO_EQUAL", items: [hypothesis("H1", "One bounded reading of the supplied evidence.", refs.qrefA), hypothesis("H2", "An alternative reading of the supplied evidence.", refs.qrefB ?? refs.qrefA)] },
      decisiveEvidence: [{ statement: "A decisive observation.", evidenceRefs: [refs.qrefA] }],
      conflictingEvidence: [],
      missingEvidence: uncertainty ? [{ statement: "An open uncertainty.", uncertaintyIds: [uncertainty] }] : [],
      changeConditions: uncertainty ? [{ statement: "What would change the reading.", uncertaintyIds: [uncertainty], wouldChange: "STATE_IDENTITY" }] : [],
      affectedResources: contextRefs.length ? [{ label: "Decision authority", contextRefs }] : [],
      watchpoints: contextRefs.length ? [{ statement: "A watchpoint.", horizon: "6m", contextRefs, evidenceRefs: [refs.qrefA] }] : [],
    },
    uncertainty: { disclosures: uncertainty ? [{ uncertaintyId: uncertainty, affects: "STATE_IDENTITY", clientStatement: "A material uncertainty remains open.", unresolvedEngineFacts: ["CLAIM_ENGINE_STATE_IDENTITY"] }] : [] },
    claims: [
      { claimId: "CL-001", claimType: "DETERMINISTIC_FACT", text: "The engine established the recorded branch outcome.", refs: [refs.factref], contextRefs: [] },
      { claimId: "CL-002", claimType: "DIRECT_EVIDENCE", text: "A respondent supplied a directly observed answer.", refs: [refs.qrefA], contextRefs: [] },
      { claimId: "CL-003", claimType: "BOUNDED_INTERPRETATION", text: "A bounded organizational pattern is supported.", refs: [refs.qrefA], contextRefs },
      ...(uncertainty ? [{ claimId: "CL-004", claimType: "UNCERTAINTY_DISCLOSURE", text: "A material uncertainty remains open.", refs: [`uref://${uncertainty}`], contextRefs: [] }] : []),
      ...(contextRefs.length ? [{ claimId: "CL-005", claimType: "WATCHPOINT", text: "A friction-related watchpoint.", refs: [refs.qrefA], contextRefs }] : []),
      { claimId: "CL-006", claimType: "SCOPE_LIMITATION_DISCLOSURE", text: "This interpretation remains bounded by supplied evidence.", refs: [], contextRefs: [] },
    ],
    clientNarrative: {
      language: "en",
      sections: [
        { sectionId: "headline", text: "A bounded headline rendered from the established claims.", derivedFromClaimIds: ["CL-001"] },
        { sectionId: "situation", text: "A cohesive explanation of the observed operating interaction.", derivedFromClaimIds: ["CL-001", "CL-002"] },
        { sectionId: "implication", text: "This interpretation remains bounded by supplied evidence.", derivedFromClaimIds: ["CL-006"] },
      ],
    },
  };
}

function candidateForProjection(projection) {
  return projection.engineSnapshot.outcomeSource === "SINGLE_R1_ONLY"
    ? singleCandidate(projection)
    : dualCandidate(projection);
}

export function installMockExternalProviders() {
  const prior = { fetch: globalThis.fetch, gemini: process.env.GEMINI_API_KEY, xai: process.env.XAI_API_KEY };
  process.env.GEMINI_API_KEY = "j5-test-gemini";
  process.env.XAI_API_KEY = "j5-test-xai";
  let delayedGemini = null;
  let geminiStartedResolve = null;
  const geminiStarted = () => new Promise((resolve) => { geminiStartedResolve = resolve; });
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.includes("generativelanguage.googleapis.com")) {
      geminiStartedResolve?.();
      if (delayedGemini) await delayedGemini.promise;
      const projection = projectionFromGeminiRequest(options);
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(candidateForProjection(projection)) }] }, finishReason: "STOP" }], modelVersion: "mock" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (target.includes("api.x.ai")) {
      const request = JSON.parse(options.body);
      const packet = JSON.parse(request.input[1].content);
      const verdicts = packet.checks.map((item) => ({ checkId: item.checkId, ruleId: item.ruleId, targetLocator: item.targetLocator, verdict: "PASS", violationCode: null, reasonCode: "RULE_SATISFIED", supportingAuthorityIds: item.authorityIds.slice(0, 1) }));
      return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text: JSON.stringify(verdicts) }] }] }), { status: 200, headers: { "content-type": "application/json" } });
    }
    throw new Error(`Unexpected external network target: ${target}`);
  };
  return {
    delayNextGemini() {
      let release;
      delayedGemini = { promise: new Promise((resolve) => { release = resolve; }), release: () => { delayedGemini = null; release(); } };
      return { started: geminiStarted(), release: delayedGemini.release };
    },
    restore() {
      globalThis.fetch = prior.fetch;
      if (prior.gemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prior.gemini;
      if (prior.xai === undefined) delete process.env.XAI_API_KEY; else process.env.XAI_API_KEY = prior.xai;
    },
  };
}

async function action(body, expectedStatus = null) {
  const result = await handleProductionInterpretationAction(body);
  if (expectedStatus !== null) assert.equal(result.statusCode, expectedStatus, JSON.stringify(result.body));
  return result;
}

function assertBrowserAuthorizedProjection(projection) {
  assert.ok(projection && typeof projection === "object", "browser projection is required");
  assert.equal(projection.session, undefined, "browser projection must not expose internal session");
  assert.equal(projection.html, undefined, "browser projection must not expose server html");
  assert.equal(projection.reportEmailCopy, undefined, "browser projection must not expose reportEmailCopy");
  assert.equal(projection.deliverable?.ready, true, "browser projection must carry a ready deliverable");
  assert.ok(projection.report && typeof projection.report === "object", "browser projection must carry the public report");
  assert.ok(projection.boundedSession && typeof projection.boundedSession === "object", "browser projection must carry boundedSession");
  assert.equal(projection.boundedSession.acquirer2A?.completed, true, "boundedSession must retain derived acquirer completion");
  assert.equal(projection.boundedSession.answers, undefined);
  assert.equal(projection.boundedSession.acquirerVerification?.answers, undefined);
  assert.equal(projection.boundedSession.targetSelfAssessment?.answers, undefined);
  assert.equal(projection.boundedSession.targetSelfAssessment?.positioning, undefined);
}

function r2RespondentContext() {
  return { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
}

function mintedCapabilities(createdBody) {
  return Object.freeze({
    owner: createdBody.mutationCapability,
    r2: createdBody.r2MutationCapability,
    r2RespondentId: createdBody.r2RespondentId,
    target: createdBody.targetMutationCapability,
    targetRespondentId: createdBody.targetRespondentId,
  });
}

export function reorderKeys(value) {
  if (Array.isArray(value)) return value.map(reorderKeys);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).reverse().map((key) => [key, reorderKeys(value[key])]));
  }
  return value;
}

export function legacyOrderSensitiveDigest(action, payload) {
  return createHash("sha256").update(JSON.stringify({ action, payload }), "utf8").digest("hex");
}

async function cloneStoredCapabilities(sessionId) {
  const record = await readAssessmentSession(sessionId);
  record.mutationCapabilities = record.mutationCapabilities.map((capability) => JSON.parse(JSON.stringify(capability)));
  return record;
}

export async function replaceStoredDigestWithLegacy(sessionId, role, digestAction, acceptedPayload) {
  const record = await cloneStoredCapabilities(sessionId);
  const capability = record.mutationCapabilities.find((item) => item.role === role);
  capability.acceptedPayloadDigestByAction[digestAction] = legacyOrderSensitiveDigest(digestAction, acceptedPayload);
  return record;
}

export async function replaceStoredDigestValue(sessionId, role, digestAction, digestValue) {
  const record = await cloneStoredCapabilities(sessionId);
  const capability = record.mutationCapabilities.find((item) => item.role === role);
  capability.acceptedPayloadDigestByAction[digestAction] = digestValue;
  return record;
}

// ---------------------------------------------------------------------------
// Mocked Redis-compatible store for cross-writer race oracles. Exercises the
// REAL production EVAL scripts (compareAndSwapSession CAS and the authority
// field patch) through the production fetch transport by executing the
// ACTUAL Lua text with a deterministic subset interpreter below, so the
// oracles stay source-linked to production semantics instead of re-modeling
// them by hand. Frozen mode queues commands so the test can deterministically
// interleave stale writers. No production fault hooks.
// ---------------------------------------------------------------------------
const seenLuaScripts = new Set();

function tokenizeLua(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (character === " " || character === "\t" || character === "\n" || character === "\r" || character === ";") { index += 1; continue; }
    if (character === "'") {
      const end = source.indexOf("'", index + 1);
      if (end < 0) throw new Error(`unterminated string in Lua script: ${source.slice(0, 60)}`);
      tokens.push({ type: "string", value: source.slice(index + 1, end) });
      index = end + 1;
      continue;
    }
    if (/[0-9]/.test(character)) {
      const match = /^[0-9]+(\.[0-9]+)?/.exec(source.slice(index));
      tokens.push({ type: "number", value: Number(match[0]) });
      index += match[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(character)) {
      const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index));
      tokens.push({ type: "ident", value: match[0] });
      index += match[0].length;
      continue;
    }
    const two = source.slice(index, index + 2);
    if (two === "==" || two === "~=") { tokens.push({ type: "op", value: two }); index += 2; continue; }
    if ("=+-()[].,".includes(character)) { tokens.push({ type: "op", value: character }); index += 1; continue; }
    throw new Error(`unexpected character ${JSON.stringify(character)} in Lua script: ${source.slice(0, 60)}`);
  }
  return tokens;
}

function evaluateLuaScript(script, keys, argv, store) {
  const tokens = tokenizeLua(script);
  let position = 0;
  const scope = new Map();

  const peek = () => tokens[position] ?? null;
  const next = () => { const token = tokens[position]; position += 1; return token; };
  const expectType = (type) => { const token = next(); if (!token || token.type !== type) throw new Error(`expected ${type} in Lua script`); return token; };
  const expectOp = (value) => { const token = next(); if (!token || token.type !== "op" || token.value !== value) throw new Error(`expected ${JSON.stringify(value)} in Lua script`); return token; };
  const expectIdent = (value) => { const token = next(); if (!token || token.type !== "ident" || token.value !== value) throw new Error(`expected keyword ${value} in Lua script`); return token; };

  const truthy = (value) => value !== null && value !== undefined && value !== false;
  const luaEquals = (a, b) => {
    const aNil = a === null || a === undefined;
    const bNil = b === null || b === undefined;
    if (aNil || bNil) return aNil === bNil;
    if (typeof a !== typeof b) return false;
    return a === b;
  };

  const REDIS = {
    call: (name, ...args) => {
      if (name === "GET") {
        const key = String(args[0]);
        return store.has(key) ? store.get(key) : null;
      }
      if (name === "SET") {
        store.set(String(args[0]), String(args[1]));
        return "OK";
      }
      throw new Error(`unsupported redis.call in Lua script: ${name}`);
    },
  };
  const CJSON = {
    decode: (value) => JSON.parse(String(value)),
    encode: (value) => JSON.stringify(value),
    null: null,
  };
  const GLOBALS = {
    redis: REDIS,
    cjson: CJSON,
    KEYS: keys,
    ARGV: argv,
    tonumber: (value) => (value === null || value === undefined ? null : Number(value)),
    tostring: (value) => (value === null || value === undefined ? "nil" : String(value)),
  };
  const lookup = (name) => (scope.has(name) ? scope.get(name) : GLOBALS[name]);

  function parseCallArgs() {
    expectOp("(");
    const args = [];
    if (!(peek()?.type === "op" && peek().value === ")")) {
      for (;;) {
        args.push(evalExpr());
        if (peek()?.type === "op" && peek().value === ",") { next(); continue; }
        break;
      }
    }
    expectOp(")");
    return args;
  }

  function callFunction(name, args) {
    if (name === "redis") return REDIS.call(args[0], ...args.slice(1));
    if (name === "cjson") {
      if (args[0] === "decode") return CJSON.decode(args[1]);
      if (args[0] === "encode") return CJSON.encode(args[1]);
      throw new Error("unsupported cjson function");
    }
    if (name === "tonumber") return GLOBALS.tonumber(args[0]);
    if (name === "tostring") return GLOBALS.tostring(args[0]);
    throw new Error(`unsupported Lua call target: ${name}`);
  }

  function evalPrimary() {
    const token = peek();
    if (!token) throw new Error("unexpected end of Lua script");
    if (token.type === "number" || token.type === "string") { next(); return token.value; }
    if (token.type === "op" && token.value === "(") { next(); const value = evalExpr(); expectOp(")"); return value; }
    if (token.type === "ident") {
      next();
      if (token.value === "nil") return null;
      if (token.value === "true") return true;
      if (token.value === "false") return false;
      if (peek()?.type === "op" && peek().value === "(") {
        return callFunction(token.value, parseCallArgs());
      }
      return lookup(token.value);
    }
    throw new Error("unexpected token in Lua expression");
  }

  function evalPostfix() {
    let value = evalPrimary();
    for (;;) {
      const token = peek();
      if (token?.type === "op" && token.value === ".") {
        next();
        const field = expectType("ident");
        value = value[field.value];
        if (peek()?.type === "op" && peek().value === "(") {
          value = value(...parseCallArgs());
        }
        continue;
      }
      if (token?.type === "op" && token.value === "[") {
        next();
        const index = evalExpr();
        expectOp("]");
        value = Array.isArray(value) ? value[index - 1] : value[index];
        continue;
      }
      break;
    }
    return value;
  }

  function evalUnary() {
    if (peek()?.type === "ident" && peek().value === "not") { next(); return !truthy(evalUnary()); }
    return evalPostfix();
  }

  function evalAdd() {
    let value = evalUnary();
    while (peek()?.type === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = next().value;
      const right = evalUnary();
      if (value === null || right === null) throw new Error("Lua arithmetic on nil");
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function evalEq() {
    let value = evalAdd();
    while (peek()?.type === "op" && (peek().value === "==" || peek().value === "~=")) {
      const op = next().value;
      const equal = luaEquals(value, evalAdd());
      value = op === "==" ? equal : !equal;
    }
    return value;
  }

  function evalAnd() {
    let value = evalEq();
    while (peek()?.type === "ident" && peek().value === "and") {
      next();
      const right = evalEq();
      value = truthy(value) ? right : value;
    }
    return value;
  }

  function evalOr() {
    let value = evalAnd();
    while (peek()?.type === "ident" && peek().value === "or") {
      next();
      const right = evalAnd();
      value = truthy(value) ? value : right;
    }
    return value;
  }

  const evalExpr = () => evalOr();

  function evalBlock() {
    for (;;) {
      const token = peek();
      if (!token) throw new Error("unterminated Lua block");
      if (token.type === "ident" && (token.value === "end" || token.value === "else")) return null;
      const result = evalStatement();
      if (result && result.kind === "return") return result;
    }
  }

  function skipBlock() {
    let depth = 0;
    for (;;) {
      const token = next();
      if (!token) throw new Error("unterminated Lua block");
      if (token.type === "ident" && token.value === "if") { depth += 1; continue; }
      if (token.type === "ident" && token.value === "end") {
        if (depth === 0) { position -= 1; return; }
        depth -= 1;
        continue;
      }
      if (token.type === "ident" && token.value === "else" && depth === 0) { position -= 1; return; }
    }
  }

  function evalStatement() {
    const token = peek();
    if (!token) return null;
    if (token.type === "ident" && token.value === "local") {
      next();
      const name = expectType("ident");
      expectOp("=");
      scope.set(name.value, evalExpr());
      return null;
    }
    if (token.type === "ident" && token.value === "if") {
      next();
      const condition = evalExpr();
      expectIdent("then");
      const executeThen = truthy(condition);
      const thenResult = executeThen ? evalBlock() : skipBlock();
      if (thenResult) return thenResult;
      if (peek()?.type === "ident" && peek().value === "else") {
        next();
        const elseResult = executeThen ? skipBlock() : evalBlock();
        if (elseResult) return elseResult;
      }
      expectIdent("end");
      return null;
    }
    if (token.type === "ident" && token.value === "return") {
      next();
      const nextToken = peek();
      if (!nextToken || (nextToken.type === "ident" && (nextToken.value === "end" || nextToken.value === "else"))) {
        return { kind: "return", value: null };
      }
      return { kind: "return", value: evalExpr() };
    }
    if (token.type === "ident") {
      next();
      const base = token.value;
      const path = [];
      for (;;) {
        const p = peek();
        if (p?.type === "op" && p.value === ".") {
          next();
          path.push({ kind: "field", value: expectType("ident").value });
          continue;
        }
        if (p?.type === "op" && p.value === "[") {
          next();
          path.push({ kind: "index", value: evalExpr() });
          expectOp("]");
          continue;
        }
        break;
      }
      if (peek()?.type === "op" && peek().value === "=") {
        next();
        const value = evalExpr();
        if (path.length === 0) {
          scope.set(base, value);
        } else {
          let target = lookup(base);
          for (let index = 0; index < path.length - 1; index += 1) {
            const key = path[index].kind === "field" ? path[index].value : (Array.isArray(target) ? path[index].value - 1 : path[index].value);
            target = target[key];
          }
          const last = path[path.length - 1];
          const lastKey = last.kind === "field" ? last.value : (Array.isArray(target) ? last.value - 1 : last.value);
          target[lastKey] = value;
        }
        return null;
      }
      if (base === "redis" && path.length === 1 && path[0].kind === "field" && path[0].value === "call") {
        const args = parseCallArgs();
        REDIS.call(args[0], ...args.slice(1));
        return null;
      }
      throw new Error(`unsupported Lua statement starting with ${base}`);
    }
    throw new Error("unexpected token at Lua statement start");
  }

  while (position < tokens.length) {
    const result = evalStatement();
    if (result && result.kind === "return") return result.value;
  }
  return null;
}

function executeMockRedisCommand(store, command) {
  const [op, ...args] = command;
  if (op === "GET") return store.has(args[0]) ? store.get(args[0]) : null;
  if (op === "SET") {
    const [key, value, mode] = args;
    if (mode === "NX" && store.has(key)) return null;
    store.set(key, value);
    return "OK";
  }
  if (op === "EVAL") {
    const script = args[0];
    seenLuaScripts.add(script);
    const numKeys = Number(args[1]);
    const keys = args.slice(2, 2 + numKeys);
    const argv = args.slice(2 + numKeys);
    return evaluateLuaScript(script, keys, argv, store);
  }
  throw new Error(`unexpected Redis command: ${op}`);
}

function installMockRedisLedgerStore() {
  const store = new Map();
  const deferred = [];
  let frozen = false;
  const priorEnv = {
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
    upUrl: process.env.UPSTASH_REDIS_REST_URL,
    upToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  };
  process.env.KV_REST_API_URL = "https://mock-redis.test";
  process.env.KV_REST_API_TOKEN = "mock-token";
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const priorFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    const command = JSON.parse(String(options.body));
    const run = () => executeMockRedisCommand(store, command);
    if (frozen) {
      return new Promise((resolve, reject) => {
        deferred.push({ run, resolve, reject });
      });
    }
    const result = run();
    return new Response(JSON.stringify({ result }), { status: 200, headers: { "content-type": "application/json" } });
  };

  return {
    store,
    freeze() { frozen = true; },
    releaseOne() {
      if (deferred.length === 0) return;
      const { run, resolve, reject } = deferred.shift();
      try {
        resolve(new Response(JSON.stringify({ result: run() }), { status: 200, headers: { "content-type": "application/json" } }));
      } catch (error) {
        reject(error);
      }
    },
    get pendingCount() { return deferred.length; },
    restore() {
      globalThis.fetch = priorFetch;
      const restoreEnv = (key, value) => { if (value === undefined) delete process.env[key]; else process.env[key] = value; };
      restoreEnv("KV_REST_API_URL", priorEnv.url);
      restoreEnv("KV_REST_API_TOKEN", priorEnv.token);
      restoreEnv("UPSTASH_REDIS_REST_URL", priorEnv.upUrl);
      restoreEnv("UPSTASH_REDIS_REST_TOKEN", priorEnv.upToken);
    },
  };
}

async function pumpMockRedisWriters(controller, promises) {
  for (;;) {
    const settled = await Promise.race([
      Promise.all(promises.map((promise) => promise.then(() => true, () => true))).then(() => true),
      new Promise((resolve) => setTimeout(() => resolve(false), 5)),
    ]);
    if (settled) break;
    if (controller.pendingCount > 0) controller.releaseOne();
  }
  await Promise.all(promises);
}

function storedMockRecord(controller, sessionId) {
  return JSON.parse(controller.store.get(`target-observation-session:${sessionId}`));
}

function setStoredMockRecord(controller, sessionId, record) {
  controller.store.set(`target-observation-session:${sessionId}`, JSON.stringify(record));
}

async function saveThroughLedger(sessionId, capability, action, digestPayload, patch, presentedRespondentId = null) {
  return authorizeAndSaveRawAssessment({
    sessionId,
    action,
    mutationCapability: capability,
    payloadDigest: currentSemanticMutationDigest(action, digestPayload),
    patch,
    ...(presentedRespondentId ? { presentedRespondentId } : {}),
  });
}

function ownerCapabilityOf(record) {
  return record.mutationCapabilities.find((capability) => capability.role === "OWNER");
}

export async function createInputSession() {
  const created = await action({ action: "CREATE_SESSION", projectId: null }, 201);
  const sessionId = created.body.sessionId;
  const fixture = buildC5CSelectedSession({ sessionId });
  const capabilities = mintedCapabilities(created.body);
  await action({ action: "SAVE_DEAL_CONTEXT", sessionId, mutationCapability: capabilities.owner, dealContext: fullDealContext() }, 200);
  await action({ action: "SAVE_R1", sessionId, mutationCapability: capabilities.owner, answers: fixture.acquirer2A.answers }, 200);
  return { sessionId, fixture, capabilities };
}

export async function createReadyAssessment({ includeR2 = false, r2AnswerOverrides = {} } = {}) {
  const base = await createInputSession();
  const { sessionId, fixture, capabilities } = base;
  if (includeR2) {
    const r2Answers = structuredClone(fixture.acquirer2A.answers);
    for (const [questionId, selectedOption] of Object.entries(r2AnswerOverrides)) {
      assert.ok(r2Answers[questionId], `unknown R2 answer override ${questionId}`);
      r2Answers[questionId].selectedOption = selectedOption;
    }
    await action({ action: "SAVE_R2", sessionId, mutationCapability: capabilities.r2, completed: true, answers: r2Answers, respondentContext: r2RespondentContext(), respondentId: capabilities.r2RespondentId }, 200);
  }
  const target = targetSelfInput();
  await action({ action: "SAVE_REPORT_INPUT", sessionId, mutationCapability: capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: capabilities.targetRespondentId }, 200);
  const executed = await action({ action: "EXECUTE", sessionId });
  return { sessionId, executed, fixture, target, capabilities };
}

// ---------------------------------------------------------------------------
// Cross-writer race oracles (SEC-1E.CORR3.CORR1.CORR1.CORR1). Shared fixtures
// and orchestration helpers for the checks below.
// ---------------------------------------------------------------------------
const RACE_FIXED_NOW = "2026-08-30T12:00:00.000Z";
const OBSERVATION_SETUP_FIXTURE = Object.freeze({
  observationPosition: "Acquirer diligence lead",
  targetExposureDuration: "2_to_6_months",
  targetAccessLevel: "site_or_team_sessions",
  observedActorLevel: "senior_leadership",
  observationEvidenceBasis: "repeated_workshops",
  integrationTimeline: "Pre-signing diligence",
});

function observationAnswersFor(questions) {
  return Object.fromEntries(questions.map((question) => [question.id, evidenceClassifiedAnswer("A")]));
}

function authorityRecordFixture(sessionId, revision, marker) {
  return {
    authorityId: `auth-${marker}`,
    sessionId,
    inputRevision: revision,
    terminalKind: "agent-result",
    outcomeSource: "DUAL_CORE",
    engineSnapshotDigest: `sha256:${"ab".repeat(32)}`,
    result: { probe: `authority-${marker}` },
    failure: null,
    reportReady: true,
    createdAt: RACE_FIXED_NOW,
  };
}

function reportAuthorityRecordFixture(sessionId, revision, marker) {
  return {
    authorityId: `auth-${marker}`,
    sessionId,
    inputRevision: revision,
    reportReady: true,
    projection: { probe: `report-${marker}` },
    createdAt: RACE_FIXED_NOW,
  };
}

async function waitForPendingRedis(controller, expected) {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    if (controller.pendingCount === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error(`timed out waiting for pendingCount ${expected}; current ${controller.pendingCount}`);
}

async function settleRedisWriters(controller, promises) {
  let failure = null;
  const settleAll = async () => {
    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      failure = error;
      return true;
    }
  };
  for (let guard = 0; guard < 5000; guard += 1) {
    if (controller.pendingCount > 0) controller.releaseOne();
    const done = await Promise.race([settleAll(), new Promise((resolve) => setTimeout(() => resolve(false), 5))]);
    if (done) {
      if (failure) throw failure;
      return;
    }
  }
  throw new Error("settleRedisWriters timed out with writers still pending");
}

async function seedRacedLedgerSession(controller) {
  const created = await createAssessmentSession();
  const sessionId = created.sessionId;
  const ownerToken = created.mintedMutationSecrets.owner;
  const dealPayload = { acquirerName: "Race Acquirer", targetName: "Race Target" };
  const r1Payload = { answers: { Q1: "A" } };
  await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
  await saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
  const stored = storedMockRecord(controller, sessionId);
  ownerCapabilityOf(stored).acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT = legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", dealPayload);
  setStoredMockRecord(controller, sessionId, stored);
  const initial = storedMockRecord(controller, sessionId);
  return {
    sessionId,
    ownerToken,
    dealPayload,
    initialInputRevision: initial.inputRevision,
    initialStorageRevision: initial.storageRevision,
  };
}

function storedOwnerDigest(controller, sessionId) {
  return ownerCapabilityOf(storedMockRecord(controller, sessionId)).acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT;
}

function completionInputFor(sessionId, observationSessionId, digitalCode = "123456") {
  return {
    assessmentSessionId: sessionId,
    observationSessionId,
    codeHash: hashObservationSetupCode(digitalCode, observationSessionId, sessionId),
    digitalCode,
    setup: { ...OBSERVATION_SETUP_FIXTURE },
    answers: observationAnswersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions),
    targetDiagnostic: {
      level1Answers: observationAnswersFor(TARGET_DIAGNOSTIC_DATA.level1.questions),
      level2Answers: observationAnswersFor(TARGET_DIAGNOSTIC_DATA.level2.questions),
    },
  };
}

export async function runValidator() {
  const providers = installMockExternalProviders();
  try {
    let ready;
    await check("PA-01", "server mints opaque assessment sessionId", async () => {
      const result = await action({ action: "CREATE_SESSION", projectId: null }, 201);
      assert.match(result.body.sessionId, /^asmt-[0-9a-f-]{36}$/i);
    });
    await check("PA-02", "client cannot set inputRevision or authority fields", async () => {
      const result = await action({ action: "CREATE_SESSION", inputRevision: 99 }, 400);
      assert.equal(result.body.status, "invalid-request");
    });
    await check("PA-02B", "session mint returns opaque role-bound mutation capabilities", async () => {
      const result = await action({ action: "CREATE_SESSION", projectId: null }, 201);
      assert.match(result.body.mutationCapability, /^mvc_[0-9a-f]{64}$/);
      assert.match(result.body.r2MutationCapability, /^mvc_[0-9a-f]{64}$/);
      assert.match(result.body.targetMutationCapability, /^mvc_[0-9a-f]{64}$/);
      assert.notEqual(result.body.mutationCapability, result.body.r2MutationCapability);
      assert.notEqual(result.body.mutationCapability, result.body.targetMutationCapability);
      assert.notEqual(result.body.r2MutationCapability, result.body.targetMutationCapability);
      assert.match(result.body.r2RespondentId, /^acqv-[0-9a-f-]{36}$/i);
      assert.match(result.body.targetRespondentId, /^tgt-[0-9a-f-]{36}$/i);
      assert.equal(result.body.mintedMutationSecrets, undefined, "raw secret bundle must not be a response field");
    });
    ready = await createReadyAssessment();
    await check("PA-03", "raw R1 persistence increments server revision", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.ok(record.inputRevision >= 3);
      assert.ok(record.rawAssessment.r1.answers.Q1);
    });
    await check("PA-04", "raw R2 persistence increments revision", async () => {
      const before = await readAssessmentSession(ready.sessionId);
      const result = await action({ action: "SAVE_R2", sessionId: ready.sessionId, mutationCapability: ready.capabilities.r2, completed: true, answers: ready.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: ready.capabilities.r2RespondentId }, 200);
      assert.equal(result.body.inputRevision, before.inputRevision + 1);
      const record = await readAssessmentSession(ready.sessionId);
      assert.equal(record.rawAssessment.r2.respondentId, ready.capabilities.r2RespondentId, "server must bind stored R2 evidence to the capability respondent");
    });
    await check("PA-05", "report input mutation increments revision", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const target = targetSelfInput();
      const result = await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.targetRespondentId }, 200);
      assert.equal(result.body.inputRevision, before.inputRevision + 1);
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.rawAssessment.targetSelf.respondentId, base.capabilities.targetRespondentId, "server must bind stored Target evidence to the capability respondent");
    });
    await check("PA-06", "every meaning mutation clears prior authority", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.equal(record.interpretationAuthority, null);
      assert.equal(record.reportAuthority, null);
    });
    await check("PA-07", "execute reconstructs canonical session server-side", async () => {
      const result = await action({ action: "EXECUTE", sessionId: ready.sessionId });
      assert.equal(result.body.status, "report-ready", JSON.stringify(result.body));
      assert.equal(result.body.reportReady, true);
      assert.match(result.body.authorityId, /^auth-[0-9a-f-]{36}$/i);
      ready.executed = result;
      assertBrowserAuthorizedProjection(result.body.projection);
      const record = await readAssessmentSession(ready.sessionId);
      assert.equal(record.reportAuthority.projection.session.acquirer2A.completed, true);
      assert.equal(typeof record.reportAuthority.projection.html, "string");
      assert.ok(record.reportAuthority.projection.reportEmailCopy?.subject);
    });
    await check("PA-08", "derived Engine and Agent request fields are rejected", async () => {
      await action({ action: "SAVE_R1", sessionId: ready.sessionId, answers: ready.fixture.acquirer2A.answers, engineSnapshotDigest: "forged" }, 400);
      await action({ action: "EXECUTE", sessionId: ready.sessionId, result: {} }, 400);
    });
    await check("PA-09", "production API physically reaches production composition", async () => {
      assert.equal(ready.executed.body.terminalKind, "agent-result");
    });
    await check("PA-10", "accepted Agent result creates current authority", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.equal(record.interpretationAuthority.terminalKind, "agent-result");
      assert.equal(record.interpretationAuthority.reportReady, true);
    });
    await check("PA-11", "canonical SystemFailure keeps reportReady false", async () => {
      const failureSession = await action({ action: "CREATE_SESSION", projectId: null }, 201);
      const id = failureSession.body.sessionId;
      const failureCaps = mintedCapabilities(failureSession.body);
      const fixture = buildC5CSelectedSession({ sessionId: id });
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId: id, mutationCapability: failureCaps.owner, dealContext: fullDealContext() }, 200);
      await action({ action: "SAVE_R1", sessionId: id, mutationCapability: failureCaps.owner, answers: fixture.acquirer2A.answers }, 200);
      await action({ action: "SAVE_R2", sessionId: id, mutationCapability: failureCaps.r2, completed: true, answers: fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: failureCaps.r2RespondentId }, 200);
      const target = targetSelfInput();
      await action({ action: "SAVE_REPORT_INPUT", sessionId: id, mutationCapability: failureCaps.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: failureCaps.targetRespondentId }, 200);
      const savedKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      const failed = await action({ action: "EXECUTE", sessionId: id }, 409);
      process.env.GEMINI_API_KEY = savedKey;
      assert.equal(failed.body.terminalKind, "system-failure");
      assert.equal(failed.body.reportReady, false);
      const record = await readAssessmentSession(id);
      assert.equal(record.interpretationAuthority.terminalKind, "system-failure");
      assert.equal(record.interpretationAuthority.reportReady, false);
      assert.equal(record.reportAuthority, null);
    });
    await check("PA-12", "non-Agent terminal cannot create report authority", async () => {
      const blocked = await action({ action: "EXECUTE", sessionId: (await action({ action: "CREATE_SESSION", projectId: null }, 201)).body.sessionId }, 409);
      assert.equal(blocked.body.status, "production-interpretation-blocked");
    });
    await check("PA-13", "snapshot digest is stored only from accepted Agent result", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.match(record.interpretationAuthority.engineSnapshotDigest, /^sha256:[a-f0-9]{64}$/i);
      assert.equal(record.interpretationAuthority.engineSnapshotDigest, record.interpretationAuthority.result.engineFactsRef.engineSnapshotDigest);
    });
    await check("PA-14", "authority is bound to current inputRevision", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.equal(record.interpretationAuthority.inputRevision, record.inputRevision);
      assert.equal(record.reportAuthority.inputRevision, record.inputRevision);
    });
    await check("PA-15", "late async result cannot commit over newer revision", async () => {
      const stale = await createReadyAssessment();
      const delayed = providers.delayNextGemini();
      const execution = action({ action: "EXECUTE", sessionId: stale.sessionId });
      await delayed.started;
      const editedAnswers = structuredClone(stale.fixture.acquirer2A.answers);
      editedAnswers.Q1.selectedOption = "A";
      await action({ action: "SAVE_R1", sessionId: stale.sessionId, mutationCapability: stale.capabilities.owner, answers: editedAnswers }, 200);
      delayed.release();
      const result = await execution;
      assert.equal(result.statusCode, 409);
      assert.equal(result.body.status, "stale-authority");
    });
    let singleToDual;
    await check("PA-16", "R2 mutation invalidates old SINGLE authority", async () => {
      singleToDual = await createReadyAssessment();
      assert.equal(singleToDual.executed.body.status, "report-ready", JSON.stringify(singleToDual.executed.body));
      const before = await readAssessmentSession(singleToDual.sessionId);
      assert.equal(before.interpretationAuthority.outcomeSource, "SINGLE_R1_ONLY");
      await action({ action: "SAVE_R2", sessionId: singleToDual.sessionId, mutationCapability: singleToDual.capabilities.r2, completed: true, answers: singleToDual.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: singleToDual.capabilities.r2RespondentId }, 200);
      const current = await readAssessmentSession(singleToDual.sessionId);
      assert.equal(current.interpretationAuthority, null);
      assert.equal(current.reportAuthority, null);
      const staleStatus = await action({ action: "STATUS", sessionId: singleToDual.sessionId, authorityId: singleToDual.executed.body.authorityId }, 409);
      assert.notEqual(staleStatus.body.status, "report-ready");
    });
    await check("PA-17", "fresh DUAL authority replaces invalidated SINGLE", async () => {
      const result = await action({ action: "EXECUTE", sessionId: singleToDual.sessionId });
      assert.equal(result.body.status, "report-ready", JSON.stringify(result.body));
      assert.equal(result.body.terminalKind, "agent-result");
      assert.notEqual(result.body.authorityId, singleToDual.executed.body.authorityId);
      assertBrowserAuthorizedProjection(result.body.projection);
      singleToDual.executed = result;
    });
    await check("PA-18", "server projection exists only on current successful authority", async () => {
      const status = await action({ action: "STATUS", sessionId: singleToDual.sessionId, authorityId: singleToDual.executed.body.authorityId }, 200);
      assert.equal(status.body.reportReady, true);
      assert.equal(status.body.authorityId, singleToDual.executed.body.authorityId);
      assert.equal(status.body.inputRevision, singleToDual.executed.body.inputRevision);
      assertBrowserAuthorizedProjection(status.body.projection);
      const record = await readAssessmentSession(singleToDual.sessionId);
      assert.equal(record.reportAuthority.authorityId, status.body.authorityId);
      assert.equal(typeof record.reportAuthority.projection.html, "string");
      assert.ok(record.reportAuthority.projection.reportEmailCopy?.subject);
    });
    await check("PA-19", "unknown session fails closed", async () => {
      const unknown = await action({ action: "STATUS", sessionId: "asmt-00000000-0000-4000-8000-000000000000" }, 404);
      assert.equal(unknown.body.status, "unknown-session");
    });
    await check("PA-20", "divergent lawful R1/R2 stays DUAL while report Q is unresolved", async () => {
      const created = await action({ action: "CREATE_SESSION", projectId: null }, 201);
      const sessionId = created.body.sessionId;
      const caps = mintedCapabilities(created.body);
      const fixture = buildC5CSelectedSession({ sessionId });
      const r2Answers = structuredClone(fixture.acquirer2A.answers);
      r2Answers.Q7.selectedOption = "A";
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId, mutationCapability: caps.owner, dealContext: fullDealContext() }, 200);
      await action({ action: "SAVE_R1", sessionId, mutationCapability: caps.owner, answers: fixture.acquirer2A.answers }, 200);
      await action({ action: "SAVE_R2", sessionId, mutationCapability: caps.r2, completed: true, answers: r2Answers, respondentContext: r2RespondentContext(), respondentId: caps.r2RespondentId }, 200);
      const target = targetSelfInput();
      await action({ action: "SAVE_REPORT_INPUT", sessionId, mutationCapability: caps.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: caps.targetRespondentId }, 200);
      const executed = await action({ action: "EXECUTE", sessionId }, 200);
      assert.equal(executed.body.terminalKind, "agent-result");
      assertBrowserAuthorizedProjection(executed.body.projection);
      const record = await readAssessmentSession(sessionId);
      assert.equal(record.interpretationAuthority.outcomeSource, "DUAL_CORE");
      const q7 = executed.body.projection.deliverable.withinEnvironmentDifferentiation.rows.find((row) => row.questionId === "Q7");
      assert.equal(q7.acquirerSelectedOption, null);
      assert.equal(q7.comparisonStatus, "not_comparable");
      const agentSemantics = JSON.stringify(record.interpretationAuthority.result);
      assert.match(agentSemantics, /\/R1/);
      assert.match(agentSemantics, /\/R2/);
    });
    await check("PA-21", "sessionId-only SAVE is forbidden and preserves current authority", async () => {
      const before = await readAssessmentSession(ready.sessionId);
      assert.ok(before.reportAuthority, "precondition: ready session holds current report authority");
      const rejected = await action({ action: "SAVE_R1", sessionId: ready.sessionId, answers: ready.fixture.acquirer2A.answers }, 403);
      assert.equal(rejected.body.status, "forbidden-capability");
      const after = await readAssessmentSession(ready.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "rejected write must not bump inputRevision");
      assert.equal(after.reportAuthority.authorityId, before.reportAuthority.authorityId, "rejected write must not invalidate current report authority");
      assert.equal(after.interpretationAuthority.authorityId, before.interpretationAuthority.authorityId, "rejected write must not invalidate current interpretation authority");
      assert.equal(JSON.stringify(after.rawAssessment), JSON.stringify(before.rawAssessment), "rejected write must not modify canonical rawAssessment");
    });
    await check("PA-22", "wrong-role capability cannot perform another role's mutation", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      const wrongDeal = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, dealContext: { acquirerName: "wrong-role-probe" } }, 403);
      assert.equal(wrongDeal.body.status, "forbidden-capability");
      const wrongR1 = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.target, answers: base.fixture.acquirer2A.answers }, 403);
      assert.equal(wrongR1.body.status, "forbidden-capability");
      const wrongR2 = await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: base.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: base.capabilities.targetRespondentId }, 403);
      assert.equal(wrongR2.body.status, "forbidden-capability");
      const wrongReport = await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.r2RespondentId }, 403);
      assert.equal(wrongReport.body.status, "forbidden-capability");
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.inputRevision, 2, "no wrong-role attempt may mutate canonical state");
      assert.equal(record.rawAssessment.r2, null);
      assert.equal(record.rawAssessment.targetSelf, null);
    });
    await check("PA-23", "cross-session and alien respondent substitution is forbidden", async () => {
      const sessionA = await createInputSession();
      const sessionB = await createInputSession();
      const target = targetSelfInput();
      const crossSession = await action({ action: "SAVE_R2", sessionId: sessionB.sessionId, mutationCapability: sessionA.capabilities.r2, completed: true, answers: sessionB.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: sessionA.capabilities.r2RespondentId }, 403);
      assert.equal(crossSession.body.status, "forbidden-capability");
      const ownerCross = await action({ action: "SAVE_R1", sessionId: sessionB.sessionId, mutationCapability: sessionA.capabilities.owner, answers: sessionB.fixture.acquirer2A.answers }, 403);
      assert.equal(ownerCross.body.status, "forbidden-capability");
      const alienR2 = await action({ action: "SAVE_R2", sessionId: sessionA.sessionId, mutationCapability: sessionA.capabilities.r2, completed: true, answers: sessionA.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: "alien-respondent" }, 403);
      assert.equal(alienR2.body.status, "forbidden-capability");
      const alienTarget = await action({ action: "SAVE_REPORT_INPUT", sessionId: sessionA.sessionId, mutationCapability: sessionA.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: "alien-respondent" }, 403);
      assert.equal(alienTarget.body.status, "forbidden-capability");
      const recordA = await readAssessmentSession(sessionA.sessionId);
      const recordB = await readAssessmentSession(sessionB.sessionId);
      assert.equal(recordA.inputRevision, 2);
      assert.equal(recordB.inputRevision, 2);
      assert.equal(recordA.rawAssessment.r2, null);
      assert.equal(recordA.rawAssessment.targetSelf, null);
      assert.equal(recordB.rawAssessment.r2, null);
    });
    await check("PA-24", "missing and client-derived capabilities are forbidden", async () => {
      const base = await createInputSession();
      const missing = await action({ action: "SAVE_R1", sessionId: base.sessionId, answers: base.fixture.acquirer2A.answers }, 403);
      assert.equal(missing.body.status, "forbidden-capability");
      const random = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: `mvc_${"a".repeat(64)}`, answers: base.fixture.acquirer2A.answers }, 403);
      assert.equal(random.body.status, "forbidden-capability");
      const garbage = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: "client-forged-token", answers: base.fixture.acquirer2A.answers }, 403);
      assert.equal(garbage.body.status, "forbidden-capability");
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.inputRevision, 2);
    });
    await check("PA-25", "R2 capability is single-semantic-use with idempotent retry", async () => {
      const base = await createInputSession();
      const r2Payload = (answers) => ({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers, respondentContext: r2RespondentContext(), respondentId: base.capabilities.r2RespondentId });
      const first = await action(r2Payload(base.fixture.acquirer2A.answers), 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3, "first lawful R2 mutation bumps revision exactly once");
      assert.equal(first.body.inputRevision, 3);
      const retry = await action(r2Payload(base.fixture.acquirer2A.answers), 200);
      assert.equal(retry.body.inputRevision, afterFirst.inputRevision, "identical retry is idempotent with no revision bump");
      const altered = structuredClone(base.fixture.acquirer2A.answers);
      altered.Q7.selectedOption = "A";
      const consumed = await action(r2Payload(altered), 410);
      assert.equal(consumed.body.status, "capability-gone");
      const afterReject = await readAssessmentSession(base.sessionId);
      assert.equal(afterReject.inputRevision, afterFirst.inputRevision, "consumed capability cannot bump revision");
      assert.equal(afterReject.rawAssessment.r2.answers.Q7.selectedOption, "B", "rejected different payload must not change canonical R2 evidence");
      assert.equal(afterReject.rawAssessment.r2.respondentId, base.capabilities.r2RespondentId);
    });
    await check("PA-26", "TARGET capability is single-semantic-use with idempotent retry", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      const targetPayload = (positioning) => ({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning, respondentId: base.capabilities.targetRespondentId });
      const first = await action(targetPayload(target.positioning), 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3, "first lawful Target mutation bumps revision exactly once");
      const retry = await action(targetPayload(target.positioning), 200);
      assert.equal(retry.body.inputRevision, afterFirst.inputRevision, "identical retry is idempotent with no revision bump");
      const alteredPositioning = { ...target.positioning, p2: "C" };
      const consumed = await action(targetPayload(alteredPositioning), 410);
      assert.equal(consumed.body.status, "capability-gone");
      const afterReject = await readAssessmentSession(base.sessionId);
      assert.equal(afterReject.inputRevision, afterFirst.inputRevision, "consumed capability cannot bump revision");
      assert.equal(afterReject.rawAssessment.targetSelf.positioning.p2, "B", "rejected different payload must not change canonical Target evidence");
      assert.equal(afterReject.rawAssessment.targetSelf.respondentId, base.capabilities.targetRespondentId);
    });
    await check("PA-27", "OWNER capability remains reusable across lawful edits", async () => {
      const own = await createReadyAssessment();
      const before = await readAssessmentSession(own.sessionId);
      assert.equal(own.executed.body.status, "report-ready");
      const sameDeal = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: fullDealContext() }, 200);
      assert.equal(sameDeal.body.inputRevision, before.inputRevision, "identical OWNER retry is idempotent with no revision bump");
      const afterIdempotent = await readAssessmentSession(own.sessionId);
      assert.equal(afterIdempotent.reportAuthority.authorityId, own.executed.body.authorityId, "idempotent retry must preserve current authority");
      const changedDeal = fullDealContext();
      changedDeal.targetName = "Authority Target Renamed";
      const different = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: changedDeal }, 200);
      assert.equal(different.body.inputRevision, before.inputRevision + 1, "different lawful OWNER mutation bumps revision exactly once");
      const afterDifferent = await readAssessmentSession(own.sessionId);
      assert.equal(afterDifferent.interpretationAuthority, null, "different lawful mutation invalidates stale interpretation authority");
      assert.equal(afterDifferent.reportAuthority, null, "different lawful mutation invalidates stale report authority");
      const staleStatus = await action({ action: "STATUS", sessionId: own.sessionId, authorityId: own.executed.body.authorityId }, 409);
      assert.notEqual(staleStatus.body.status, "report-ready");
      const again = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: changedDeal }, 200);
      assert.equal(again.body.inputRevision, before.inputRevision + 1, "same still-lawful OWNER capability must keep working");
      changedDeal.targetName = "Authority Target Third Name";
      const third = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: changedDeal }, 200);
      assert.equal(third.body.inputRevision, before.inputRevision + 2, "further OWNER edits remain lawful, never consumed");
      const reExecuted = await action({ action: "EXECUTE", sessionId: own.sessionId }, 200);
      assert.equal(reExecuted.body.status, "report-ready");
      assert.notEqual(reExecuted.body.authorityId, own.executed.body.authorityId);
    });
    await check("PA-28", "capability secrets never enter EXECUTE or STATUS projections", async () => {
      const secretKeys = ["mutationCapability", "r2MutationCapability", "targetMutationCapability", "mintedMutationSecrets"];
      for (const key of secretKeys) {
        assert.equal(ready.executed.body[key], undefined, `${key} must not reach EXECUTE response`);
      }
      const status = await action({ action: "STATUS", sessionId: ready.sessionId, authorityId: ready.executed.body.authorityId }, 200);
      assert.equal(status.body.reportReady, true);
      for (const key of secretKeys) {
        assert.equal(status.body[key], undefined, `${key} must not reach STATUS response`);
      }
    });
    await check("PA-29", "OWNER same semantic reordered payload is idempotent and preserves authority", async () => {
      const own = await createReadyAssessment();
      assert.equal(own.executed.body.status, "report-ready");
      const before = await readAssessmentSession(own.sessionId);
      const flatRetry = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: reorderKeys(fullDealContext()) }, 200);
      assert.equal(flatRetry.body.inputRevision, before.inputRevision, "flat reordered deal context must be the same semantic payload");
      const nestedRetry = await action({ action: "SAVE_R1", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, answers: reorderKeys(own.fixture.acquirer2A.answers) }, 200);
      assert.equal(nestedRetry.body.inputRevision, before.inputRevision, "nested reordered R1 answers must be the same semantic payload");
      const afterIdempotent = await readAssessmentSession(own.sessionId);
      assert.equal(afterIdempotent.reportAuthority.authorityId, before.reportAuthority.authorityId, "reordered retries must preserve current report authority");
      assert.equal(afterIdempotent.interpretationAuthority.authorityId, before.interpretationAuthority.authorityId, "reordered retries must preserve current interpretation authority");
      const different = reorderKeys(own.fixture.acquirer2A.answers);
      different.Q1 = { ...different.Q1, selectedOption: "A" };
      const meaningful = await action({ action: "SAVE_R1", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, answers: different }, 200);
      assert.equal(meaningful.body.inputRevision, before.inputRevision + 1, "genuinely different payload bumps revision exactly once");
      const afterMeaningful = await readAssessmentSession(own.sessionId);
      assert.equal(afterMeaningful.interpretationAuthority, null, "genuinely different payload invalidates stale interpretation authority");
      assert.equal(afterMeaningful.reportAuthority, null, "genuinely different payload invalidates stale report authority");
      const sameDifferent = await action({ action: "SAVE_R1", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, answers: different }, 200);
      assert.equal(sameDifferent.body.inputRevision, before.inputRevision + 1, "exact retry of the new payload is idempotent");
    });
    await check("PA-30", "R2 same semantic reordered payload is idempotent", async () => {
      const base = await createInputSession();
      const context = r2RespondentContext();
      const r2Payload = (answers, respondentContext) => ({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers, respondentContext, respondentId: base.capabilities.r2RespondentId });
      const first = await action(r2Payload(base.fixture.acquirer2A.answers, context), 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3);
      const sameRetry = await action(r2Payload(base.fixture.acquirer2A.answers, context), 200);
      assert.equal(sameRetry.body.inputRevision, afterFirst.inputRevision, "exact retry is idempotent");
      const reordered = await action(r2Payload(reorderKeys(base.fixture.acquirer2A.answers), reorderKeys(context)), 200);
      assert.equal(reordered.body.status, "input-saved", "reordered payload must not be rejected as consumed");
      const afterReordered = await readAssessmentSession(base.sessionId);
      assert.equal(afterReordered.inputRevision, afterFirst.inputRevision, "reordered retry must not bump revision");
      assert.equal(afterReordered.rawAssessment.r2.answers.Q7.selectedOption, "B", "canonical R2 payload remains A");
      assert.equal(afterReordered.rawAssessment.r2.respondentId, base.capabilities.r2RespondentId, "respondent binding unchanged");
      const different = reorderKeys(base.fixture.acquirer2A.answers);
      different.Q7 = { ...different.Q7, selectedOption: "A" };
      const gone = await action(r2Payload(different, context), 410);
      assert.equal(gone.body.status, "capability-gone");
      const afterGone = await readAssessmentSession(base.sessionId);
      assert.equal(afterGone.inputRevision, afterFirst.inputRevision, "consumed capability cannot bump revision");
      assert.equal(afterGone.rawAssessment.r2.answers.Q7.selectedOption, "B", "canonical R2 payload remains A after rejected different payload");
    });
    await check("PA-31", "TARGET same semantic reordered payload is idempotent", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      const targetPayload = (answers, positioning) => ({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers, positioning, respondentId: base.capabilities.targetRespondentId });
      const first = await action(targetPayload(target.answers, target.positioning), 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3);
      const sameRetry = await action(targetPayload(target.answers, target.positioning), 200);
      assert.equal(sameRetry.body.inputRevision, afterFirst.inputRevision, "exact retry is idempotent");
      const reordered = await action(targetPayload(reorderKeys(target.answers), reorderKeys(target.positioning)), 200);
      assert.equal(reordered.body.status, "input-saved", "reordered payload must not be rejected as consumed");
      const afterReordered = await readAssessmentSession(base.sessionId);
      assert.equal(afterReordered.inputRevision, afterFirst.inputRevision, "reordered retry must not bump revision");
      assert.equal(afterReordered.rawAssessment.targetSelf.positioning.p2, "B", "canonical Target payload remains A");
      const gone = await action(targetPayload(target.answers, { ...target.positioning, p2: "C" }), 410);
      assert.equal(gone.body.status, "capability-gone");
      const afterGone = await readAssessmentSession(base.sessionId);
      assert.equal(afterGone.inputRevision, afterFirst.inputRevision, "consumed capability cannot bump revision");
      assert.equal(afterGone.rawAssessment.targetSelf.positioning.p2, "B", "canonical Target payload remains A after rejected different payload");
    });
    await check("PA-32", "array element order is semantic while surrounding key order is not", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const withFlags = structuredClone(base.fixture.acquirer2A.answers);
      withFlags.Q1 = { ...withFlags.Q1, directObservationGate: "no", reliabilityFlags: ["contradicted_by_respondent", "socially_desirable"], reliabilityFlagsAcknowledged: true };
      const first = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: withFlags }, 200);
      assert.equal(first.body.inputRevision, before.inputRevision + 1);
      const reorderedSurroundings = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: reorderKeys(withFlags) }, 200);
      assert.equal(reorderedSurroundings.body.inputRevision, before.inputRevision + 1, "same array order with reordered object keys is the same semantic payload");
      const reorderedArray = reorderKeys(withFlags);
      reorderedArray.Q1 = { ...reorderedArray.Q1, reliabilityFlags: ["socially_desirable", "contradicted_by_respondent"] };
      const different = await action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: reorderedArray }, 200);
      assert.equal(different.body.inputRevision, before.inputRevision + 2, "different array element order is a different semantic payload");
    });
    await check("PA-33", "new accepted mutations store the CURRENT versioned digest format", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: base.fixture.acquirer2A.answers, respondentContext: r2RespondentContext(), respondentId: base.capabilities.r2RespondentId }, 200);
      await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.targetRespondentId }, 200);
      const record = await readAssessmentSession(base.sessionId);
      const byRole = Object.fromEntries(record.mutationCapabilities.map((capability) => [capability.role, capability.acceptedPayloadDigestByAction]));
      assert.match(byRole.OWNER.SAVE_DEAL_CONTEXT, /^v2:[a-f0-9]{64}$/i, "OWNER deal-context digest must be CURRENT versioned");
      assert.match(byRole.OWNER.SAVE_R1, /^v2:[a-f0-9]{64}$/i, "OWNER R1 digest must be CURRENT versioned");
      assert.match(byRole.R2.SAVE_R2, /^v2:[a-f0-9]{64}$/i, "R2 digest must be CURRENT versioned");
      assert.match(byRole.TARGET.SAVE_REPORT_INPUT, /^v2:[a-f0-9]{64}$/i, "TARGET digest must be CURRENT versioned");
    });
    await check("PA-34", "legacy OWNER same-semantic deployment retry is idempotent and atomically upgrades the digest", async () => {
      const own = await createReadyAssessment();
      assert.equal(own.executed.body.status, "report-ready");
      const before = await readAssessmentSession(own.sessionId);
      const acceptedDeal = before.rawAssessment.dealContext;
      await replaceStoredDigestWithLegacy(own.sessionId, "OWNER", "SAVE_DEAL_CONTEXT", acceptedDeal);
      assert.equal(
        (await readAssessmentSession(own.sessionId)).mutationCapabilities.find((capability) => capability.role === "OWNER").acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT,
        legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", acceptedDeal),
        "precondition: legacy digest installed from original insertion order",
      );
      const retry = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: reorderKeys(acceptedDeal) }, 200);
      assert.equal(retry.body.inputRevision, before.inputRevision, "legacy same-semantic retry must not bump revision");
      const after = await readAssessmentSession(own.sessionId);
      assert.equal(after.reportAuthority.authorityId, own.executed.body.authorityId, "legacy idempotent retry must preserve current report authority");
      assert.equal(after.interpretationAuthority.authorityId, own.executed.body.authorityId, "legacy idempotent retry must preserve current interpretation authority");
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      const upgraded = ownerCapability.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT;
      assert.match(upgraded, /^v2:[a-f0-9]{64}$/i, "legacy digest must be upgraded to CURRENT format");
      assert.equal(upgraded, currentSemanticMutationDigest("SAVE_DEAL_CONTEXT", after.rawAssessment.dealContext), "upgrade must be the CURRENT digest of server-held accepted state");
      const again = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: reorderKeys(acceptedDeal) }, 200);
      assert.equal(again.body.inputRevision, before.inputRevision, "retry after upgrade must stay idempotent on the CURRENT path");
      const changed = structuredClone(acceptedDeal);
      changed.targetName = "Legacy Transition Renamed";
      const meaningful = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: changed }, 200);
      assert.equal(meaningful.body.inputRevision, before.inputRevision + 1, "genuinely different OWNER payload bumps revision exactly once");
      const afterMeaningful = await readAssessmentSession(own.sessionId);
      assert.equal(afterMeaningful.interpretationAuthority, null, "genuine difference invalidates stale interpretation authority");
      assert.equal(afterMeaningful.reportAuthority, null, "genuine difference invalidates stale report authority");
      const ownerAfter = afterMeaningful.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerAfter.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, currentSemanticMutationDigest("SAVE_DEAL_CONTEXT", afterMeaningful.rawAssessment.dealContext), "new accepted digest is the CURRENT digest of B");
    });
    await check("PA-35", "legacy R2 same-semantic deployment retry is 200 with atomic digest upgrade", async () => {
      const base = await createInputSession();
      const context = r2RespondentContext();
      const answers = base.fixture.acquirer2A.answers;
      await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers, respondentContext: context, respondentId: base.capabilities.r2RespondentId }, 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3);
      await replaceStoredDigestWithLegacy(base.sessionId, "R2", "SAVE_R2", { answers, respondentContext: context, completed: true });
      const retry = await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: reorderKeys(answers), respondentContext: reorderKeys(context), respondentId: base.capabilities.r2RespondentId }, 200);
      assert.equal(retry.body.inputRevision, afterFirst.inputRevision, "legacy same-semantic R2 retry must not bump revision");
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.rawAssessment.r2.answers.Q7.selectedOption, "B", "canonical R2 state remains A");
      assert.equal(after.rawAssessment.r2.respondentId, base.capabilities.r2RespondentId, "respondent binding unchanged");
      const r2Capability = after.mutationCapabilities.find((capability) => capability.role === "R2");
      assert.match(r2Capability.acceptedPayloadDigestByAction.SAVE_R2, /^v2:[a-f0-9]{64}$/i, "legacy R2 digest must be upgraded to CURRENT format");
      assert.equal(r2Capability.lifecycle, "consumed", "upgrade is metadata maintenance, not a new capability life");
      const again = await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers, respondentContext: context, respondentId: base.capabilities.r2RespondentId }, 200);
      assert.equal(again.body.inputRevision, afterFirst.inputRevision, "same A after upgrade remains idempotent");
      const altered = structuredClone(answers);
      altered.Q7.selectedOption = "A";
      const gone = await action({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: altered, respondentContext: context, respondentId: base.capabilities.r2RespondentId }, 410);
      assert.equal(gone.body.status, "capability-gone", "genuinely different B remains 410");
      const afterGone = await readAssessmentSession(base.sessionId);
      assert.equal(afterGone.inputRevision, afterFirst.inputRevision, "rejected B must not bump revision");
      assert.equal(afterGone.rawAssessment.r2.answers.Q7.selectedOption, "B", "rejected B must not change canonical R2 evidence");
    });
    await check("PA-36", "legacy TARGET same-semantic deployment retry is 200 with atomic digest upgrade", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.targetRespondentId }, 200);
      const afterFirst = await readAssessmentSession(base.sessionId);
      assert.equal(afterFirst.inputRevision, 3);
      await replaceStoredDigestWithLegacy(base.sessionId, "TARGET", "SAVE_REPORT_INPUT", { answers: target.answers, positioning: target.positioning, completed: true });
      const retry = await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: reorderKeys(target.answers), positioning: reorderKeys(target.positioning), respondentId: base.capabilities.targetRespondentId }, 200);
      assert.equal(retry.body.inputRevision, afterFirst.inputRevision, "legacy same-semantic TARGET retry must not bump revision");
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.rawAssessment.targetSelf.positioning.p2, "B", "canonical TARGET state remains A");
      assert.equal(after.rawAssessment.targetSelf.respondentId, base.capabilities.targetRespondentId, "respondent binding unchanged");
      const targetCapability = after.mutationCapabilities.find((capability) => capability.role === "TARGET");
      assert.match(targetCapability.acceptedPayloadDigestByAction.SAVE_REPORT_INPUT, /^v2:[a-f0-9]{64}$/i, "legacy TARGET digest must be upgraded to CURRENT format");
      assert.equal(targetCapability.lifecycle, "consumed", "upgrade is metadata maintenance, not a new capability life");
      const again = await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.targetRespondentId }, 200);
      assert.equal(again.body.inputRevision, afterFirst.inputRevision, "same A after upgrade remains idempotent");
      const alteredPositioning = { ...target.positioning, p2: "C" };
      const gone = await action({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: alteredPositioning, respondentId: base.capabilities.targetRespondentId }, 410);
      assert.equal(gone.body.status, "capability-gone", "genuinely different B remains 410");
      const afterGone = await readAssessmentSession(base.sessionId);
      assert.equal(afterGone.inputRevision, afterFirst.inputRevision, "rejected B must not bump revision");
      assert.equal(afterGone.rawAssessment.targetSelf.positioning.p2, "B", "rejected B must not change canonical TARGET evidence");
    });
    await check("PA-37", "legacy compatibility never reconstructs historical insertion order", async () => {
      const base = await createInputSession();
      const orderX = { alpha: "a", beta: "b", gamma: { first: 1, second: 2 } };
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, dealContext: orderX }, 200);
      await replaceStoredDigestWithLegacy(base.sessionId, "OWNER", "SAVE_DEAL_CONTEXT", orderX);
      const orderY = { gamma: { second: 2, first: 1 }, beta: "b", alpha: "a" };
      const before = await readAssessmentSession(base.sessionId);
      const retry = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, dealContext: orderY }, 200);
      assert.equal(retry.body.inputRevision, before.inputRevision, "bridge must succeed without knowing historical order X");
      const after = await readAssessmentSession(base.sessionId);
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerCapability.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, currentSemanticMutationDigest("SAVE_DEAL_CONTEXT", after.rawAssessment.dealContext), "upgrade is derived from server-held state, not from order X");
    });
    await check("PA-38", "unknown explicit digest version fails closed without mutation", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      await replaceStoredDigestValue(base.sessionId, "OWNER", "SAVE_R1", "v9:beef");
      await assert.rejects(
        () => action({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: base.fixture.acquirer2A.answers }),
        (error) => error?.name === "SessionLedgerStorageError" && error.status === "unknown-digest-version",
      );
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "unknown digest version must not allow any mutation");
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerCapability.acceptedPayloadDigestByAction.SAVE_R1, "v9:beef", "unknown digest must not be silently reset");
      const r2base = await createInputSession();
      const context = r2RespondentContext();
      await action({ action: "SAVE_R2", sessionId: r2base.sessionId, mutationCapability: r2base.capabilities.r2, completed: true, answers: r2base.fixture.acquirer2A.answers, respondentContext: context, respondentId: r2base.capabilities.r2RespondentId }, 200);
      await replaceStoredDigestValue(r2base.sessionId, "R2", "SAVE_R2", "v7:deadbeef");
      const r2Before = await readAssessmentSession(r2base.sessionId);
      await assert.rejects(
        () => action({ action: "SAVE_R2", sessionId: r2base.sessionId, mutationCapability: r2base.capabilities.r2, completed: true, answers: r2base.fixture.acquirer2A.answers, respondentContext: context, respondentId: r2base.capabilities.r2RespondentId }),
        (error) => error?.name === "SessionLedgerStorageError" && error.status === "unknown-digest-version",
      );
      const r2After = await readAssessmentSession(r2base.sessionId);
      assert.equal(r2After.inputRevision, r2Before.inputRevision, "unknown R2 digest version fails closed without revision bump");
    });
    await check("PA-39", "JSON -0 and 0 share one semantic mutation identity", async () => {
      const zeroFirst = await createInputSession();
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId: zeroFirst.sessionId, mutationCapability: zeroFirst.capabilities.owner, dealContext: { acquirerName: "Zero", targetName: "First", enterpriseValueStatus: 0 } }, 200);
      const zeroBefore = await readAssessmentSession(zeroFirst.sessionId);
      const negZeroRetry = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: zeroFirst.sessionId, mutationCapability: zeroFirst.capabilities.owner, dealContext: { acquirerName: "Zero", targetName: "First", enterpriseValueStatus: -0 } }, 200);
      assert.equal(negZeroRetry.body.inputRevision, zeroBefore.inputRevision, "-0 retry of accepted 0 must be idempotent");
      const negFirst = await createInputSession();
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId: negFirst.sessionId, mutationCapability: negFirst.capabilities.owner, dealContext: { acquirerName: "Neg", targetName: "First", enterpriseValueStatus: -0 } }, 200);
      const negBefore = await readAssessmentSession(negFirst.sessionId);
      const zeroRetry = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: negFirst.sessionId, mutationCapability: negFirst.capabilities.owner, dealContext: { acquirerName: "Neg", targetName: "First", enterpriseValueStatus: 0 } }, 200);
      assert.equal(zeroRetry.body.inputRevision, negBefore.inputRevision, "0 retry of accepted -0 must be idempotent");
    });
    await check("PA-40", "non-JSON values remain rejected by semantic canonicalization", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const probes = [
        { name: "NaN", value: NaN },
        { name: "Infinity", value: Infinity },
        { name: "-Infinity", value: -Infinity },
        { name: "Date", value: new Date() },
        { name: "Map", value: new Map([["k", "v"]]) },
      ];
      for (const probe of probes) {
        await assert.rejects(
          () => action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, dealContext: { acquirerName: "probe", probeValue: probe.value } }),
          (error) => error?.name === "CanonicalSerializeError",
          `expected ${probe.name} rejection`,
        );
      }
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "rejected non-JSON values must not mutate state");
    });
    await check("PA-41", "legacy digest presence never grants or upgrades authorization", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const acceptedDeal = before.rawAssessment.dealContext;
      await replaceStoredDigestWithLegacy(base.sessionId, "OWNER", "SAVE_DEAL_CONTEXT", acceptedDeal);
      const noCapability = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, dealContext: reorderKeys(acceptedDeal) }, 403);
      assert.equal(noCapability.body.status, "forbidden-capability");
      const wrongRole = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, dealContext: reorderKeys(acceptedDeal) }, 403);
      assert.equal(wrongRole.body.status, "forbidden-capability");
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "rejected attempts must not mutate state");
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerCapability.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", acceptedDeal), "rejected attempts must not upgrade the legacy digest");
    });
    await check("PA-42", "concurrent legacy same-semantic retries produce one coherent upgraded digest", async () => {
      const own = await createReadyAssessment();
      const before = await readAssessmentSession(own.sessionId);
      const acceptedDeal = before.rawAssessment.dealContext;
      await replaceStoredDigestWithLegacy(own.sessionId, "OWNER", "SAVE_DEAL_CONTEXT", acceptedDeal);
      const retryBody = (variant) => ({ action: "SAVE_DEAL_CONTEXT", sessionId: own.sessionId, mutationCapability: own.capabilities.owner, dealContext: variant });
      const [firstRetry, secondRetry] = await Promise.all([
        action(retryBody(reorderKeys(acceptedDeal)), 200),
        action(retryBody(structuredClone(acceptedDeal)), 200),
      ]);
      assert.equal(firstRetry.body.inputRevision, before.inputRevision, "no double revision on concurrent legacy retries");
      assert.equal(secondRetry.body.inputRevision, before.inputRevision, "no double revision on concurrent legacy retries");
      const after = await readAssessmentSession(own.sessionId);
      assert.equal(after.inputRevision, before.inputRevision);
      assert.equal(after.reportAuthority.authorityId, own.executed.body.authorityId, "no authority corruption from concurrent legacy retries");
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      const storedDigest = ownerCapability.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT;
      assert.match(storedDigest, /^v2:[a-f0-9]{64}$/i, "one coherent CURRENT digest");
      assert.equal(storedDigest, currentSemanticMutationDigest("SAVE_DEAL_CONTEXT", after.rawAssessment.dealContext), "stored digest matches server-held state exactly");
    });
    await check("PA-43", "symbol-keyed payloads fail closed at every depth without any state write", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const ownerBefore = before.mutationCapabilities.find((capability) => capability.role === "OWNER");
      const digestBefore = ownerBefore.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT;
      const storageBefore = before.storageRevision;
      const probes = [
        { name: "top-level symbol key", build: () => ({ acquirerName: "Symbol", targetName: "Top", enterpriseValueStatus: "not_available", [Symbol("hidden")]: "secret" }) },
        { name: "nested symbol key", build: () => ({ acquirerName: "Symbol", targetName: "Nested", nested: { visible: 1, [Symbol("hidden")]: 2 } }) },
        { name: "array-nested symbol key", build: () => ({ acquirerName: "Symbol", targetName: "Array", items: [{ visible: 1, [Symbol("hidden")]: 2 }] }) },
        { name: "symbol value", build: () => ({ acquirerName: "Symbol", targetName: "Value", probe: Symbol("value") }) },
      ];
      for (const probe of probes) {
        await assert.rejects(
          () => action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, dealContext: probe.build() }),
          (error) => error?.name === "CanonicalSerializeError",
          `expected ${probe.name} rejection`,
        );
      }
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "rejected symbol payloads must not bump revision");
      assert.equal(after.storageRevision, storageBefore, "rejected symbol payloads must not advance storage generation");
      assert.equal(JSON.stringify(after.rawAssessment), JSON.stringify(before.rawAssessment), "rejected symbol payloads must not change rawAssessment");
      const ownerAfter = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerAfter.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, digestBefore, "rejected symbol payloads must not change digest metadata");
      const visibleOnly = { acquirerName: "Symbol", targetName: "Top", enterpriseValueStatus: "not_available" };
      const saved = await action({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, dealContext: visibleOnly }, 200);
      assert.equal(saved.body.inputRevision, before.inputRevision + 1, "visible-only payload is a lawful mutation only when actually sent");
    });
    await check("PA-44", "cross-action legacy upgrades: stale second writer cannot overwrite the first upgrade", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const created = await createAssessmentSession();
        const sessionId = created.sessionId;
        const ownerToken = created.mintedMutationSecrets.owner;
        const fixture = buildC5CSelectedSession({ sessionId });
        const dealPayload = { acquirerName: "Race Acquirer", targetName: "Race Target", enterpriseValueStatus: "not_available" };
        const r1Payload = { answers: fixture.acquirer2A.answers };
        await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        const stored = storedMockRecord(controller, sessionId);
        const owner = ownerCapabilityOf(stored);
        owner.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT = legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", dealPayload);
        owner.acceptedPayloadDigestByAction.SAVE_R1 = legacyOrderSensitiveDigest("SAVE_R1", r1Payload);
        setStoredMockRecord(controller, sessionId, stored);
        const initial = storedMockRecord(controller, sessionId);

        controller.freeze();
        const writerA = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        const writerB = saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        await pumpMockRedisWriters(controller, [writerA, writerB]);

        assert.equal((await writerA).status, "idempotent", "writer A must succeed");
        assert.equal((await writerB).status, "idempotent", "writer B must succeed only after re-evaluation");
        const finalRecord = storedMockRecord(controller, sessionId);
        const digests = ownerCapabilityOf(finalRecord).acceptedPayloadDigestByAction;
        assert.match(digests.SAVE_DEAL_CONTEXT, /^v2:[a-f0-9]{64}$/i, "DC digest must be v2 after convergence");
        assert.match(digests.SAVE_R1, /^v2:[a-f0-9]{64}$/i, "R1 digest must be v2 after convergence");
        assert.equal(finalRecord.inputRevision, initial.inputRevision, "no business revision bump from upgrades");
        assert.equal(finalRecord.storageRevision, initial.storageRevision + 2, "storage generation advanced exactly once per successful CAS write");
        assert.equal(JSON.stringify(finalRecord.rawAssessment), JSON.stringify(initial.rawAssessment), "rawAssessment unchanged");
        assert.equal(finalRecord.interpretationAuthority, null);
        assert.equal(finalRecord.reportAuthority, null);
      } finally {
        controller.restore();
      }
    });
    await check("PA-45", "reversed writer order (R1 first, DC second) also converges", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const created = await createAssessmentSession();
        const sessionId = created.sessionId;
        const ownerToken = created.mintedMutationSecrets.owner;
        const fixture = buildC5CSelectedSession({ sessionId });
        const dealPayload = { acquirerName: "Reverse Acquirer", targetName: "Reverse Target", enterpriseValueStatus: "not_available" };
        const r1Payload = { answers: fixture.acquirer2A.answers };
        await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        const stored = storedMockRecord(controller, sessionId);
        const owner = ownerCapabilityOf(stored);
        owner.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT = legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", dealPayload);
        owner.acceptedPayloadDigestByAction.SAVE_R1 = legacyOrderSensitiveDigest("SAVE_R1", r1Payload);
        setStoredMockRecord(controller, sessionId, stored);
        const initial = storedMockRecord(controller, sessionId);

        controller.freeze();
        const writerB = saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        const writerA = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await pumpMockRedisWriters(controller, [writerB, writerA]);

        assert.equal((await writerB).status, "idempotent");
        assert.equal((await writerA).status, "idempotent");
        const finalRecord = storedMockRecord(controller, sessionId);
        const digests = ownerCapabilityOf(finalRecord).acceptedPayloadDigestByAction;
        assert.match(digests.SAVE_DEAL_CONTEXT, /^v2:[a-f0-9]{64}$/i, "DC digest must be v2 after reversed-order convergence");
        assert.match(digests.SAVE_R1, /^v2:[a-f0-9]{64}$/i, "R1 digest must be v2 after reversed-order convergence");
        assert.equal(finalRecord.inputRevision, initial.inputRevision);
        assert.equal(finalRecord.storageRevision, initial.storageRevision + 2);
      } finally {
        controller.restore();
      }
    });
    await check("PA-46", "three-action legacy convergence (DC, R1, R2)", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const created = await createAssessmentSession();
        const sessionId = created.sessionId;
        const { owner: ownerToken, r2: r2Token, r2RespondentId } = created.mintedMutationSecrets;
        const fixture = buildC5CSelectedSession({ sessionId });
        const dealPayload = { acquirerName: "Three Acquirer", targetName: "Three Target", enterpriseValueStatus: "not_available" };
        const r1Payload = { answers: fixture.acquirer2A.answers };
        const context = r2RespondentContext();
        const r2DigestPayload = { answers: fixture.acquirer2A.answers, respondentContext: context, completed: true };
        await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        await saveThroughLedger(sessionId, r2Token, "SAVE_R2", r2DigestPayload, { answers: fixture.acquirer2A.answers, respondentContext: context }, r2RespondentId);
        const stored = storedMockRecord(controller, sessionId);
        ownerCapabilityOf(stored).acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT = legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", dealPayload);
        ownerCapabilityOf(stored).acceptedPayloadDigestByAction.SAVE_R1 = legacyOrderSensitiveDigest("SAVE_R1", r1Payload);
        stored.mutationCapabilities.find((capability) => capability.role === "R2").acceptedPayloadDigestByAction.SAVE_R2 = legacyOrderSensitiveDigest("SAVE_R2", r2DigestPayload);
        setStoredMockRecord(controller, sessionId, stored);
        const initial = storedMockRecord(controller, sessionId);

        controller.freeze();
        const wDC = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        const wR1 = saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        const wR2 = saveThroughLedger(sessionId, r2Token, "SAVE_R2", r2DigestPayload, { answers: fixture.acquirer2A.answers, respondentContext: context }, r2RespondentId);
        await pumpMockRedisWriters(controller, [wDC, wR1, wR2]);

        assert.equal((await wDC).status, "idempotent");
        assert.equal((await wR1).status, "idempotent");
        assert.equal((await wR2).status, "idempotent");
        const finalRecord = storedMockRecord(controller, sessionId);
        assert.match(ownerCapabilityOf(finalRecord).acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, /^v2:/i, "DC v2");
        assert.match(ownerCapabilityOf(finalRecord).acceptedPayloadDigestByAction.SAVE_R1, /^v2:/i, "R1 v2");
        assert.match(finalRecord.mutationCapabilities.find((capability) => capability.role === "R2").acceptedPayloadDigestByAction.SAVE_R2, /^v2:/i, "R2 v2");
        assert.equal(finalRecord.inputRevision, initial.inputRevision, "no business revision bump");
        assert.equal(finalRecord.storageRevision, initial.storageRevision + 3, "one generation advance per upgrade");
      } finally {
        controller.restore();
      }
    });
    await check("PA-47", "metadata upgrade racing a genuine meaningful mutation stays serializable", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const created = await createAssessmentSession();
        const sessionId = created.sessionId;
        const ownerToken = created.mintedMutationSecrets.owner;
        const fixture = buildC5CSelectedSession({ sessionId });
        const dealPayload = { acquirerName: "Mixed Acquirer", targetName: "Mixed Target", enterpriseValueStatus: "not_available" };
        const r1Payload = { answers: fixture.acquirer2A.answers };
        await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await saveThroughLedger(sessionId, ownerToken, "SAVE_R1", r1Payload, r1Payload);
        const stored = storedMockRecord(controller, sessionId);
        ownerCapabilityOf(stored).acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT = legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", dealPayload);
        setStoredMockRecord(controller, sessionId, stored);
        const initial = storedMockRecord(controller, sessionId);

        const changedAnswers = structuredClone(fixture.acquirer2A.answers);
        changedAnswers.Q1.selectedOption = "A";
        const changedPayload = { answers: changedAnswers };

        controller.freeze();
        const upgrade = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        const meaningful = saveThroughLedger(sessionId, ownerToken, "SAVE_R1", changedPayload, changedPayload);
        await pumpMockRedisWriters(controller, [upgrade, meaningful]);

        assert.equal((await upgrade).status, "idempotent", "metadata upgrade must remain lawful");
        assert.equal((await meaningful).status, "saved", "meaningful mutation must be saved");
        const finalRecord = storedMockRecord(controller, sessionId);
        const digests = ownerCapabilityOf(finalRecord).acceptedPayloadDigestByAction;
        assert.match(digests.SAVE_DEAL_CONTEXT, /^v2:[a-f0-9]{64}$/i, "metadata upgrade must not be lost");
        assert.equal(digests.SAVE_R1, currentSemanticMutationDigest("SAVE_R1", { answers: finalRecord.rawAssessment.r1.answers }), "R1 digest must match the new accepted state");
        assert.equal(finalRecord.inputRevision, initial.inputRevision + 1, "meaningful mutation bumps revision exactly once");
        assert.equal(finalRecord.storageRevision, initial.storageRevision + 2, "two successful writes = two generation advances");
        assert.equal(finalRecord.rawAssessment.r1.answers.Q1.selectedOption, "A", "meaningful change persisted");
      } finally {
        controller.restore();
      }
    });
    await check("PA-48", "same-millisecond authority write is CAS-visible: stale metadata CAS cannot erase newer authority", async () => {
      const controller = installMockRedisLedgerStore();
      const priorIso = Date.prototype.toISOString;
      Date.prototype.toISOString = () => RACE_FIXED_NOW;
      try {
        const raced = await seedRacedLedgerSession(controller);
        const { sessionId, ownerToken, dealPayload } = raced;
        const N = raced.initialInputRevision;
        const S = raced.initialStorageRevision;

        controller.freeze();
        const metadataWriter = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        await waitForPendingRedis(controller, 1);
        const authorityWriter = commitAssessmentAuthority(sessionId, N, authorityRecordFixture(sessionId, N, "race"), reportAuthorityRecordFixture(sessionId, N, "race"));
        await waitForPendingRedis(controller, 2);
        controller.releaseOne(); // metadata read
        await waitForPendingRedis(controller, 2);
        controller.releaseOne(); // authority commit
        const afterAuthority = storedMockRecord(controller, sessionId);
        assert.equal(afterAuthority.storageRevision, S + 1, "authority commit must atomically advance storage generation");
        assert.equal(afterAuthority.updatedAt, RACE_FIXED_NOW, "same-millisecond updatedAt must be the forced timestamp");
        assert.equal(afterAuthority.interpretationAuthority.authorityId, "auth-race", "authority commit must store new interpretation authority");
        controller.releaseOne(); // stale metadata CAS — must FAIL and re-evaluate
        await settleRedisWriters(controller, [metadataWriter, authorityWriter]);

        const finalRecord = storedMockRecord(controller, sessionId);
        assert.equal((await metadataWriter).status, "idempotent", "metadata writer must succeed only through re-evaluation");
        assert.equal(finalRecord.interpretationAuthority.authorityId, "auth-race", "no authority loss");
        assert.equal(finalRecord.reportAuthority.authorityId, "auth-race", "no report authority loss");
        assert.match(storedOwnerDigest(controller, sessionId), /^v2:[a-f0-9]{64}$/i, "digest upgrade must survive");
        assert.equal(finalRecord.inputRevision, N, "authority commit must not bump business revision");
        assert.equal(finalRecord.storageRevision, S + 2, "one generation advance per successful write");
      } finally {
        Date.prototype.toISOString = priorIso;
        controller.restore();
      }
    });
    await check("PA-49", "reverse authority order: metadata upgrade first, authority commit second, both retained", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const raced = await seedRacedLedgerSession(controller);
        const { sessionId, ownerToken, dealPayload } = raced;
        const N = raced.initialInputRevision;
        const S = raced.initialStorageRevision;
        const upgraded = await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        assert.equal(upgraded.status, "idempotent");
        assert.equal(storedMockRecord(controller, sessionId).storageRevision, S + 1);
        const committed = await commitAssessmentAuthority(sessionId, N, authorityRecordFixture(sessionId, N, "reverse"), reportAuthorityRecordFixture(sessionId, N, "reverse"));
        assert.ok(committed, "authority commit must succeed after a metadata upgrade");
        const finalRecord = storedMockRecord(controller, sessionId);
        assert.equal(finalRecord.interpretationAuthority.authorityId, "auth-reverse", "authority retained");
        assert.equal(finalRecord.reportAuthority.authorityId, "auth-reverse", "report authority retained");
        assert.equal(storedOwnerDigest(controller, sessionId), currentSemanticMutationDigest("SAVE_DEAL_CONTEXT", finalRecord.rawAssessment.dealContext), "authority commit must not roll the digest back");
        assert.equal(finalRecord.inputRevision, N, "no business revision bump");
        assert.equal(finalRecord.storageRevision, S + 2);
      } finally {
        controller.restore();
      }
    });
    for (const direction of ["metadata-first", "setup-first"]) {
      await check(`PA-50-${direction}`, `metadata upgrade and Target Observation setup serialize safely (${direction})`, async () => {
        const controller = installMockRedisLedgerStore();
        try {
          const raced = await seedRacedLedgerSession(controller);
          const { sessionId, ownerToken, dealPayload } = raced;
          const N = raced.initialInputRevision;
          const S = raced.initialStorageRevision;

          controller.freeze();
          const writers = direction === "metadata-first"
            ? [
              saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload),
              saveTargetObservationSetup(sessionId, { ...OBSERVATION_SETUP_FIXTURE }),
            ]
            : [
              saveTargetObservationSetup(sessionId, { ...OBSERVATION_SETUP_FIXTURE }),
              saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload),
            ];
          await waitForPendingRedis(controller, 2);
          controller.releaseOne(); // first-launched reader wins the first read
          await waitForPendingRedis(controller, 2);
          controller.releaseOne(); // second reader
          await settleRedisWriters(controller, writers);

          const finalRecord = storedMockRecord(controller, sessionId);
          assert.match(storedOwnerDigest(controller, sessionId), /^v2:[a-f0-9]{64}$/i, "v2 digest must not be lost");
          assert.equal(finalRecord.targetObservationSetup.completed, true, "setup state must not be lost");
          assert.equal(finalRecord.inputRevision, N + 1, "setup is a meaningful mutation: exactly one business revision bump");
          assert.equal(finalRecord.storageRevision, S + 2, "two successful writes = two generation advances");
          const setupResult = await writers[direction === "metadata-first" ? 1 : 0];
          assert.equal(setupResult.targetObservationSetup.completed, true, "setup writer must succeed");
        } finally {
          controller.restore();
        }
      });
    }
    for (const direction of ["metadata-first", "completion-first"]) {
      await check(`PA-51-${direction}`, `metadata upgrade and Target Observation completion serialize safely (${direction})`, async () => {
        const controller = installMockRedisLedgerStore();
        try {
          const raced = await seedRacedLedgerSession(controller);
          const { sessionId, ownerToken, dealPayload } = raced;
          const N = raced.initialInputRevision;
          const S = raced.initialStorageRevision;

          controller.freeze();
          const writers = direction === "metadata-first"
            ? [
              saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload),
              saveTargetObservationCompletion(completionInputFor(sessionId, `obs-race-${direction}`)),
            ]
            : [
              saveTargetObservationCompletion(completionInputFor(sessionId, `obs-race-${direction}`)),
              saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload),
            ];
          await waitForPendingRedis(controller, 2);
          controller.releaseOne(); // first-launched reader wins the first read
          await waitForPendingRedis(controller, 2);
          controller.releaseOne(); // second reader
          await settleRedisWriters(controller, writers);

          const finalRecord = storedMockRecord(controller, sessionId);
          assert.match(storedOwnerDigest(controller, sessionId), /^v2:[a-f0-9]{64}$/i, "v2 digest must not be lost");
          assert.equal(finalRecord.targetObservation.completed, true, "completion state must not be lost");
          assert.equal(finalRecord.target2B.completed, true, "target diagnostic state must not be lost");
          assert.equal(finalRecord.inputRevision, N + 1, "completion is a meaningful mutation: exactly one business revision bump");
          assert.equal(finalRecord.storageRevision, S + 2, "two successful writes = two generation advances");
          const completionResult = await writers[direction === "metadata-first" ? 1 : 0];
          assert.equal(completionResult.ok, true, "completion writer must succeed");
        } finally {
          controller.restore();
        }
      });
    }
    await check("PA-52", "authority commit and Target Observation setup serialize without erasure", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const raced = await seedRacedLedgerSession(controller);
        const { sessionId } = raced;
        const N = raced.initialInputRevision;
        const S = raced.initialStorageRevision;

        controller.freeze();
        const setupWriter = saveTargetObservationSetup(sessionId, { ...OBSERVATION_SETUP_FIXTURE });
        await waitForPendingRedis(controller, 1);
        const authorityWriter = commitAssessmentAuthority(sessionId, N, authorityRecordFixture(sessionId, N, "vs-setup"), reportAuthorityRecordFixture(sessionId, N, "vs-setup"));
        await waitForPendingRedis(controller, 2);
        controller.releaseOne(); // setup read
        await waitForPendingRedis(controller, 2);
        controller.releaseOne(); // authority commit lands first
        await settleRedisWriters(controller, [setupWriter, authorityWriter]);

        // Legal serialization: authority at N, then setup mutation at N+1
        // invalidates authority through the standard meaningful-mutation path.
        const finalRecord = storedMockRecord(controller, sessionId);
        assert.equal(finalRecord.targetObservationSetup.completed, true, "setup state retained");
        assert.equal(finalRecord.inputRevision, N + 1, "invalidation only through a lawful business revision bump");
        assert.equal(finalRecord.interpretationAuthority, null, "authority invalidated by the lawful later mutation");
        assert.equal(finalRecord.storageRevision, S + 2, "both writes advanced generation");
        assert.ok(await authorityWriter, "authority commit itself must have succeeded");

        // Reverse: setup commits first; authority for the OLD revision is rejected.
        const controllerB = installMockRedisLedgerStore();
        try {
          const racedB = await seedRacedLedgerSession(controllerB);
          const NB = racedB.initialInputRevision;
          const SB = racedB.initialStorageRevision;
          controllerB.freeze();
          const setupWriterB = saveTargetObservationSetup(racedB.sessionId, { ...OBSERVATION_SETUP_FIXTURE });
          await waitForPendingRedis(controllerB, 1);
          controllerB.releaseOne(); // setup read
          await waitForPendingRedis(controllerB, 1); // setup CAS deferred
          const staleAuthorityWriter = commitAssessmentAuthority(racedB.sessionId, NB, authorityRecordFixture(racedB.sessionId, NB, "stale"), reportAuthorityRecordFixture(racedB.sessionId, NB, "stale"));
          await waitForPendingRedis(controllerB, 2);
          controllerB.releaseOne(); // setup CAS commits: inputRevision N+1
          controllerB.releaseOne(); // authority business guard must reject revision N
          await settleRedisWriters(controllerB, [setupWriterB, staleAuthorityWriter]);
          const finalRecordB = storedMockRecord(controllerB, racedB.sessionId);
          assert.equal(await staleAuthorityWriter, null, "authority for a stale business revision must be rejected");
          assert.equal(finalRecordB.inputRevision, NB + 1, "setup mutation retained");
          assert.equal(finalRecordB.storageRevision, SB + 1, "rejected authority must not advance generation");
          assert.equal(finalRecordB.interpretationAuthority, null, "rejected authority must not write authority state");
        } finally {
          controllerB.restore();
        }
      } finally {
        controller.restore();
      }
    });
    await check("PA-53", "three-writer convergence: legacy upgrade + authority + setup", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const raced = await seedRacedLedgerSession(controller);
        const { sessionId, ownerToken, dealPayload } = raced;
        const N = raced.initialInputRevision;
        const S = raced.initialStorageRevision;

        controller.freeze();
        const metadataWriter = saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        const setupWriter = saveTargetObservationSetup(sessionId, { ...OBSERVATION_SETUP_FIXTURE });
        const authorityWriter = commitAssessmentAuthority(sessionId, N, authorityRecordFixture(sessionId, N, "three"), reportAuthorityRecordFixture(sessionId, N, "three"));
        await waitForPendingRedis(controller, 3);
        await settleRedisWriters(controller, [metadataWriter, setupWriter, authorityWriter]);

        const finalRecord = storedMockRecord(controller, sessionId);
        assert.match(storedOwnerDigest(controller, sessionId), /^v2:[a-f0-9]{64}$/i, "v2 digest converged");
        assert.equal(finalRecord.targetObservationSetup.completed, true, "setup converged");
        assert.equal(finalRecord.inputRevision, N + 1, "exactly one business revision bump across all three writers");
        assert.equal(finalRecord.interpretationAuthority, null, "final state matches the legal serialization authority-then-setup");
        assert.equal(finalRecord.storageRevision, S + 3, "three successful writes = three generation advances");
      } finally {
        controller.restore();
      }
    });
    await check("PA-54", "corrected writer paths advance storage generation and preserve create-on-missing", async () => {
      const controller = installMockRedisLedgerStore();
      try {
        const created = await createAssessmentSession();
        const sessionId = created.sessionId;
        const ownerToken = created.mintedMutationSecrets.owner;
        const dealPayload = { acquirerName: "Sequential Acquirer", targetName: "Sequential Target" };
        await saveThroughLedger(sessionId, ownerToken, "SAVE_DEAL_CONTEXT", dealPayload, dealPayload);
        let record = storedMockRecord(controller, sessionId);
        const N = record.inputRevision;
        const S = record.storageRevision;
        const committed = await commitAssessmentAuthority(sessionId, N, authorityRecordFixture(sessionId, N, "seq"), reportAuthorityRecordFixture(sessionId, N, "seq"));
        assert.ok(committed, "authority commit must succeed");
        record = storedMockRecord(controller, sessionId);
        assert.equal(record.storageRevision, S + 1, "authority commit advances generation");
        assert.equal(record.inputRevision, N, "authority commit does not bump business revision");
        const stale = await commitAssessmentAuthority(sessionId, N + 99, authorityRecordFixture(sessionId, N + 99, "stale-seq"), null);
        assert.equal(stale, null, "stale business revision authority is rejected");
        assert.equal(storedMockRecord(controller, sessionId).storageRevision, S + 1, "rejected authority must not advance generation");
        const freshSessionId = `asmt-${"c".repeat(8)}-${"1".repeat(4)}-${"2".repeat(4)}-${"3".repeat(4)}-${"4".repeat(12)}`;
        const setupSession = await saveTargetObservationSetup(freshSessionId, { ...OBSERVATION_SETUP_FIXTURE });
        assert.equal(setupSession.targetObservationSetup.completed, true, "first setup write creates the record");
        assert.equal(setupSession.inputRevision, 1, "created record carries one business revision");
        assert.equal(setupSession.storageRevision, 1, "created record carries one storage generation");
      } finally {
        controller.restore();
      }
    });
    await check("PA-55", "production Lua and writer structure implement the unified generation discipline", async () => {
      const casScript = [...seenLuaScripts].find((script) => script.includes("storageRevision") && script.includes("inputRevision"));
      const authorityScript = [...seenLuaScripts].find((script) => script.includes("interpretationAuthority"));
      assert.ok(casScript, "the CAS EVAL must have been exercised through the production transport");
      assert.ok(authorityScript, "the authority EVAL must have been exercised through the production transport");
      assert.ok(casScript.includes("tonumber(r.storageRevision or 0)~=tonumber(ARGV[3])"), "CAS EVAL must compare storage generation");
      assert.ok(authorityScript.includes("r.storageRevision=(tonumber(r.storageRevision) or 0)+1"), "authority EVAL must atomically advance storage generation");
      assert.ok(authorityScript.includes("if tonumber(r.inputRevision)~=tonumber(ARGV[1]) then return nil end"), "authority EVAL must keep the business inputRevision guard");

      const ledgerSource = await readFile(new URL("../src/server/_sessionLedger.ts", import.meta.url), "utf8");
      const setupSlice = ledgerSource.slice(
        ledgerSource.indexOf("async function persistTargetObservationSetupRecord"),
        ledgerSource.indexOf("export async function saveTargetObservationSetup"),
      );
      assert.ok(setupSlice.includes("compareAndSwapSession("), "setup persistence must route through the generation-aware CAS");
      assert.equal(setupSlice.includes("writeLedgerSession("), false, "setup persistence must not perform an unconditional whole-record SET");
      const completionSlice = ledgerSource.slice(
        ledgerSource.indexOf("async function persistTargetObservationCompletion"),
        ledgerSource.indexOf("export async function saveTargetObservationCompletion"),
      );
      assert.ok(completionSlice.includes("compareAndSwapSession("), "completion persistence must route through the generation-aware CAS");
      assert.equal(completionSlice.includes("writeLedgerSession("), false, "completion persistence must not perform an unconditional whole-record SET");
      assert.ok(ledgerSource.includes("createSessionRecordIfMissing"), "SET NX create-on-missing fallback must exist for first-write semantics");
    });
    await check("PA-56", "no production-reachable unconditional whole-record SET remains", async () => {
      const ledgerSource = await readFile(new URL("../src/server/_sessionLedger.ts", import.meta.url), "utf8");
      const writeCalls = [...ledgerSource.matchAll(/writeLedgerSession\(/g)].length;
      // Allowed: function declaration + local CAS branch inside
      // compareAndSwapSession + local createSessionRecordIfMissing branch +
      // local saveRawAssessmentState branch (UNREACHABLE_DEAD_CODE_ADVISORY).
      assert.equal(writeCalls, 4, "writeLedgerSession may only be reachable through CAS-guarded helpers");
      const authoritySlice = ledgerSource.slice(
        ledgerSource.indexOf("export async function commitAssessmentAuthority"),
        ledgerSource.indexOf("export function currentAssessmentAuthority"),
      );
      assert.equal(authoritySlice.includes("writeLedgerSession("), false, "authority commit must not perform unconditional whole-record writes");
      assert.ok(authoritySlice.includes("compareAndSwapSession("), "local authority commit must use the generation-aware CAS");
    });
    console.log(`J5 PRODUCTION AUTHORITY PASS ${checks.length}/${checks.length}`);
  } finally {
    providers.restore();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runValidator();
}
