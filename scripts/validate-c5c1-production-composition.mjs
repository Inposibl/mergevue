import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import questionnaires from "../src/generated/newlogic/questionnaires.json" with { type: "json" };
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { assembleEngineSnapshot } from "../src/agent/engineSnapshot.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { assemblePreCoreSelectorSnapshot } from "../src/agent/preCoreSelectorSnapshot.js";
import { assembleSingleR1Snapshot } from "../src/agent/singleR1Snapshot.js";
import { runProductionInterpretation } from "../src/agent/productionInterpretationComposition.js";
import { runAgentInterpretation } from "../src/agent/agentInterpretationRun.js";
import { AgentInterpretationRequestAssemblyError } from "../src/agent/agentInterpretationRequest.js";
import { ContextPackSelectionError } from "../src/agent/interpretationContextPack.js";
import {
  ProviderPromptError,
  buildProviderPrompt,
} from "../src/agent/providerPrompt.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import {
  attachAcquirerModuleResult,
} from "../src/flow/acquirerTrackFlow.js";
import {
  REACHABLE_CANDIDATE_PAIRS,
  selectCandidatePair,
} from "../src/flow/candidatePairSelector.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import { assembleProductionDualAdjudicationInput } from "../src/flow/productionAdjudicationInputAssembler.js";
import {
  buildC5CSelectedSession,
} from "./fixtures/c5c-selected-session.mjs";
import {
  C5C1_DUAL_CORE_SESSION_ID,
  buildC5C1DualCoreSession,
} from "./fixtures/c5c1-dual-core-session.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_RELATIVE = "src/agent/productionInterpretationComposition.js";
const FIXTURE_RELATIVE = "scripts/fixtures/c5c1-dual-core-session.mjs";
const VALIDATOR_RELATIVE = "scripts/validate-c5c1-production-composition.mjs";
const ROOT_SOURCE = readFileSync(join(ROOT, ROOT_RELATIVE), "utf8");
const FIXTURE_SOURCE = readFileSync(join(ROOT, FIXTURE_RELATIVE), "utf8");
const PACKAGE = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const PACKAGE_LOCK_SOURCE = readFileSync(join(ROOT, "package-lock.json"), "utf8");
const AEM = (questionnaires.modules ?? []).find((module) => module.id === "acquirerEnvironment");
const SELECTED_KEYS = Object.freeze([
  "selectorId",
  "selectorVersion",
  "observationScopePolicy",
  "sourceModule",
  "sourceInstrument",
  "sessionId",
  "respondentSlot",
  "respondentVantage",
  "semanticBindings",
  "status",
  "decisionCode",
  "candidatePair",
  "candidatePairNormalized",
]);
const UNRESOLVED_KEYS = Object.freeze([...SELECTED_KEYS, "routing", "unresolvedReason"]);
const PRE_STATUSES = Object.freeze([
  "ADMISSIBILITY_UNRESOLVED",
  "NO_LAWFUL_PAIR",
  "PAIR_SELECTION_AMBIGUOUS",
]);
const EXPECTED_PRE_CODES = Object.freeze({
  ADMISSIBILITY_UNRESOLVED: "S_ADMISSIBILITY_UNRESOLVED",
  NO_LAWFUL_PAIR: "S_NO_LAWFUL_PAIR",
  PAIR_SELECTION_AMBIGUOUS: "S_PAIR_SELECTION_AMBIGUOUS",
});
const EXPECTED_BASELINE_CONSTRAINT_IDS = Object.freeze([
  "C-NO-FACT-MUTATION",
  "C-NO-FABRICATION",
  "C-NO-UNESTABLISHED-STATE",
  "C-NO-NUMERIC-PROBABILITY",
  "C-FACT-VS-INTERPRETATION",
  "C-NO-HUMAN-REVIEW-CLAIM",
  "C-DISCLOSE-MATERIAL-UNCERTAINTY",
  "C-USECLASS-IMMUTABLE",
  "C-CONTEXT-BOUND-INTERPRETATION",
  "C-NO-SHADOW-SCORING",
]);
const NO_PAIR_PRE_STATUSES = Object.freeze([
  "NO_LAWFUL_PAIR",
  "PAIR_SELECTION_AMBIGUOUS",
]);
const NO_PAIR_CONSTRAINT_ID = "C-NO-AGENT-PAIR-SELECTION";
const NO_PAIR_PROVIDER_RULE = "Never choose, infer, name, rank, narrow, or reconstruct a candidate pair. Do not treat matched-pair or selector audit material as pair authority. Describe only the canonical selector-boundary fact supplied in this projection.";
const ADMISSIBILITY_SYSTEM_INSTRUCTION_SHA256 = "bf3acb2be67b7f27a9f182619d9f2b16e0b221a922dba56d690d008518d53bec";
const ADMISSIBILITY_SYSTEM_INSTRUCTION_BYTES = 5867;
const SENTINELS = Object.freeze({
  "src/flow/candidatePairSelector.js": "9aa93625d3a3f19b9fbc002504b97d0acf284d084a9c91f3f0dc119ad3404d43",
  "src/flow/dualRespondentComparison.js": "5b730d53df647ddf12f58a0f4e8bf1bcb294e852b4f080ed5a038103b79ba2e3",
  "scripts/validate-c5b-candidate-pair-selector.mjs": "a7a6d95e829645f396aea3718300c38ecbb64406ed41d4669f7df850a89995a6",
  "scripts/validate-agent-semantic-conformance-offline.mjs": "0ef9425aa310cb5e75ab41e7c9d8bfd8f6c357888545fc2bf3ce520e12d1b1d2",
});
const J5_FORBIDDEN_IMPORT_FRAGMENTS = Object.freeze([
  "src/flow/",
  "src/reporting/",
  "src/components/",
  "src/server/",
  "App.jsx",
  "src/ui/",
  "src/screenRegistry.js",
  "src/styles.css",
]);
const J5_FORBIDDEN_DEPENDENCY_TOKENS = Object.freeze([
  "semanticJudgeTransport.js",
  "semanticSystemFailure.js",
  "mapSemanticJudgeTransportErrorToSystemFailure",
  "mapSemanticValidationErrorToSystemFailure",
]);
const checks = [];

async function check(id, label, fn) {
  await fn();
  checks.push({ id, label });
  console.log("PASS " + id + " " + label);
}

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function assertExactKeys(value, expected) {
  assert.deepEqual(sortedKeys(value), [...expected].sort());
}

function occurrences(source, regex) {
  return source.match(regex)?.length ?? 0;
}

function literalOccurrences(source, literal) {
  return source.split(literal).length - 1;
}

function sha256File(relativePath) {
  return createHash("sha256").update(readFileSync(join(ROOT, relativePath))).digest("hex");
}

function walkFiles(directory, files = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".git") continue;
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) walkFiles(absolute, files);
    else files.push(absolute);
  }
  return files;
}

function importersOf(moduleFileName) {
  const pattern = new RegExp("from\\s+[\"'][^\"']*" + moduleFileName.replace(".", "\\.") + "[\"']");
  return walkFiles(join(ROOT, "src"))
    .filter((absolute) => pattern.test(readFileSync(absolute, "utf8")))
    .map((absolute) => relative(ROOT, absolute).split(sep).join("/"))
    .sort();
}

function collectKeys(value, into = new Set(), seen = new Set()) {
  if (value == null || typeof value !== "object" || seen.has(value)) return into;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    into.add(key);
    collectKeys(child, into, seen);
  }
  return into;
}

function projectSelectorLiteral(selectorResult) {
  const provenance = selectorResult.provenance;
  const projected = {
    selectorId: provenance.selectorId,
    selectorVersion: provenance.selectorVersion,
    observationScopePolicy: provenance.observationScopePolicy,
    sourceModule: provenance.sourceModule,
    sourceInstrument: provenance.sourceInstrument,
    sessionId: provenance.sessionId,
    respondentSlot: provenance.respondentSlot,
    respondentVantage: provenance.respondentVantage,
    semanticBindings: provenance.semanticBindings,
    status: selectorResult.status,
    decisionCode: selectorResult.decisionCode,
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  if (selectorResult.status === "ADMISSIBILITY_UNRESOLVED") {
    projected.routing = selectorResult.routing;
    projected.unresolvedReason = selectorResult.unresolvedReason ?? null;
  }
  return Object.freeze(projected);
}

function expectedDualBundle(session) {
  const selectorResult = selectCandidatePair({ session });
  assert.equal(selectorResult.status, "SELECTED");
  const selectorProvenance = projectSelectorLiteral(selectorResult);
  const assembled = assembleProductionDualAdjudicationInput({
    session,
    moduleId: "acquirer_environment",
    candidatePair: selectorResult.candidatePair,
  });
  assert.equal(assembled.ok, true);
  const coreInput = Object.freeze({
    ...assembled.coreInput,
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
  });
  const coreOutput = compareDualRespondents(coreInput);
  const identityContext = {
    diagnosticId: session.sessionId,
    projectId: null,
    moduleId: "acquirerEnvironment",
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext,
    coreInput,
    selectorProvenance,
  });
  return {
    selectorResult,
    selectorProvenance,
    assembled,
    coreInput,
    coreOutput,
    identityContext,
    snapshot,
  };
}

function expectedSingleBundle(session) {
  const selectorResult = selectCandidatePair({ session });
  assert.equal(selectorResult.status, "SELECTED");
  const selectorProvenance = projectSelectorLiteral(selectorResult);
  const identityContext = {
    diagnosticId: session.sessionId,
    projectId: null,
    moduleId: "acquirerEnvironment",
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  const snapshot = assembleSingleR1Snapshot({
    session,
    identityContext,
    selectorProvenance,
  });
  assert.equal(snapshot.outcomeSource, "SINGLE_R1_ONLY");
  assert.equal(snapshot.engine.outcome.engineOutcomeCode, "SINGLE_R1_ONLY");
  return {
    selectorResult,
    selectorProvenance,
    identityContext,
    snapshot,
  };
}

function expectedPreBundle(session, status) {
  const selectorResult = selectCandidatePair({ session });
  assert.equal(selectorResult.status, status);
  const selectorProvenance = projectSelectorLiteral(selectorResult);
  const identityContext = {
    diagnosticId: session.sessionId,
    projectId: null,
    moduleId: "acquirerEnvironment",
  };
  const snapshot = assemblePreCoreSelectorSnapshot({ identityContext, selectorProvenance });
  assert.equal(snapshot.engine.outcome.engineOutcomeCode, EXPECTED_PRE_CODES[status]);
  const structuredUncertainty = buildStructuredUncertainty(snapshot);
  const interpretationContextPack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty,
  });
  const request = buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty,
    interpretationContextPack,
  });
  const projection = projectProviderProjection(request);
  let prompt = null;
  let promptError = null;
  try {
    prompt = buildProviderPrompt(projection);
  } catch (error) {
    promptError = error;
  }
  return {
    selectorResult,
    selectorProvenance,
    identityContext,
    snapshot,
    structuredUncertainty,
    interpretationContextPack,
    request,
    projection,
    prompt,
    promptError,
  };
}

function answersFromOverrides(overrides = {}) {
  assert.ok(AEM);
  return Object.fromEntries((AEM.questions ?? []).map((question) => {
    const questionId = question.workbookQuestionId;
    const selectedOption = overrides[questionId] ?? (questionId === "Q11" ? "F" : "E");
    return [questionId, evidenceClassifiedAnswer(selectedOption)];
  }));
}

function buildPrimarySession({
  sessionId,
  respondentSeniority = "c_suite_founder",
  answerOverrides = {},
} = {}) {
  const data = {
    respondentSide: "acquirer",
    respondentAccessLevel: "full_deal_room_leadership_access",
    firmTenure: "more_than_3_years",
    respondentRole: "deal_lead",
    ...(respondentSeniority === null ? {} : { respondentSeniority }),
  };
  const base = Object.freeze({
    sessionId,
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze(data),
    }),
  });
  return attachAcquirerModuleResult(
    base,
    answersFromOverrides(answerOverrides),
    "2026-08-28T12:00:00.000Z",
  ).session;
}

function buildPreSession(status) {
  const fixtures = {
    ADMISSIBILITY_UNRESOLVED: {
      respondentSeniority: null,
      answerOverrides: { Q4: "A", Q7: "B" },
    },
    NO_LAWFUL_PAIR: {
      respondentSeniority: "c_suite_founder",
      answerOverrides: {},
    },
    PAIR_SELECTION_AMBIGUOUS: {
      respondentSeniority: "c_suite_founder",
      answerOverrides: { Q3: "B", Q4: "A", Q7: "B" },
    },
  };
  const fixture = fixtures[status];
  return buildPrimarySession({
    sessionId: "c5c1-" + status.toLowerCase(),
    respondentSeniority: fixture.respondentSeniority,
    answerOverrides: fixture.answerOverrides,
  });
}

async function runWithoutProviders(args) {
  const previousGemini = process.env.GEMINI_API_KEY;
  const previousXai = process.env.XAI_API_KEY;
  const previousFetch = globalThis.fetch;
  delete process.env.GEMINI_API_KEY;
  delete process.env.XAI_API_KEY;
  globalThis.fetch = async () => {
    throw new Error("network must not be reached without credentials");
  };
  try {
    return await runProductionInterpretation(args);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGemini;
    if (previousXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = previousXai;
  }
}

async function runAgentWithoutProviders(args) {
  const previousGemini = process.env.GEMINI_API_KEY;
  const previousXai = process.env.XAI_API_KEY;
  const previousFetch = globalThis.fetch;
  delete process.env.GEMINI_API_KEY;
  delete process.env.XAI_API_KEY;
  globalThis.fetch = async () => {
    throw new Error("network must not be reached without credentials");
  };
  try {
    return await runAgentInterpretation(args);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGemini;
    if (previousXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = previousXai;
  }
}

function runControlFlowHarness() {
  const harness = String.raw`
import assert from "node:assert/strict";
import { mock } from "node:test";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const url = (path) => pathToFileURL(resolve(path)).href;
class CandidatePairSelectorError extends Error {
  constructor(status, decisionCode) {
    super(decisionCode);
    this.status = status;
    this.decisionCode = decisionCode;
  }
}
const calls = { selector: 0, assembler: 0, core: 0, agent: 0 };
let lastAssembler = null;
let lastCore = null;
let lastAgent = null;
const downstream = Object.freeze({ downstream: true });
function reset() {
  calls.selector = 0;
  calls.assembler = 0;
  calls.core = 0;
  calls.agent = 0;
  lastAssembler = null;
  lastCore = null;
  lastAgent = null;
}
function resultFor(session) {
  calls.selector += 1;
  if (session.scenario === "throw_config") {
    throw new CandidatePairSelectorError("CONFIG_INVALID", "SELECTOR_CONFIGURATION_ERROR");
  }
  if (session.scenario === "throw_unexpected") throw new RangeError("unexpected-selector-defect");
  const status = session.scenario;
  const selected = status === "SELECTED";
  const unresolved = status === "ADMISSIBILITY_UNRESOLVED";
  const pair = selected ? "NT/STJ vs NT/STP" : null;
  const result = {
    status,
    decisionCode: status === "INPUT_INVALID" ? "R1_ABSENT" : status,
    candidatePair: pair,
    candidatePairNormalized: pair,
    routing: unresolved ? "practitioner_access_review" : null,
    provenance: {
      selectorId: "literal-selector",
      selectorVersion: "literal-version",
      observationScopePolicy: "literal-policy",
      sourceModule: "acquirerEnvironment",
      sourceInstrument: "literal-instrument",
      sessionId: session.sessionId,
      respondentSlot: "R1",
      respondentVantage: {},
      semanticBindings: [],
    },
  };
  if (unresolved) result.unresolvedReason = "unknown_seniority";
  return result;
}
mock.module(url("src/flow/candidatePairSelector.js"), {
  namedExports: { CandidatePairSelectorError, selectCandidatePair: ({ session }) => resultFor(session) },
});
mock.module(url("src/flow/productionAdjudicationInputAssembler.js"), {
  namedExports: {
    assembleProductionDualAdjudicationInput: (args) => {
      calls.assembler += 1;
      lastAssembler = args;
      if (args.session.incomplete === true) {
        return { ok: false, reason: "missing_r2_context", audit: { stage: "r2_context" } };
      }
      if (args.session.assemblerBlocked === true) {
        return { ok: false, reason: "missing_r2_answers", audit: { stage: "r2_answers" } };
      }
      return {
        ok: true,
        coreInput: {
          moduleId: "acquirerEnvironment",
          candidatePair: args.candidatePair,
          respondent1: {},
          respondent2: {},
          answers1: {},
          answers2: {},
        },
      };
    },
  },
});
mock.module(url("src/flow/dualRespondentComparison.js"), {
  namedExports: {
    // Composition now imports the typed Agent input-assembly error, which
    // transitively loads engineSnapshot.js; these corpus-config exports are
    // only consumed at import/instantiation time and stay inert under mocks.
    buildDualRespondentCorpusConfig: () => ({}),
    dualQualityConfig: () => ({}),
    compareDualRespondents: (input) => {
      calls.core += 1;
      lastCore = input;
      return Object.freeze({ coreMarker: "literal-core-output" });
    },
  },
});
mock.module(url("src/agent/agentInterpretationRun.js"), {
  namedExports: {
    runAgentInterpretation: (args) => {
      calls.agent += 1;
      lastAgent = args;
      return downstream;
    },
  },
});
const imported = await import(url("src/agent/productionInterpretationComposition.js") + "?control-flow-harness");
const run = imported.runProductionInterpretation;
reset();
const selected = await run({
  session: { sessionId: "mock-selected", scenario: "SELECTED" },
  moduleId: "acquirerEnvironment",
  candidatePair: "FORGED vs PAIR",
  selectorResult: { forged: true },
  diagnosticId: "forged-diagnostic",
});
const selectedSummary = {
  counts: { ...calls },
  downstreamIdentity: selected === downstream,
  assemblerPair: lastAssembler.candidatePair,
  assemblerModule: lastAssembler.moduleId,
  identityPair: lastAgent.identityContext.candidatePair,
  identityDiagnostic: lastAgent.identityContext.diagnosticId,
  outcomeSource: lastAgent.outcomeSource,
  flags: {
    outOfPairEvidence: lastCore.outOfPairEvidence,
    coherenceAmbiguous: lastCore.coherenceAmbiguous,
  },
  selectedKeys: Object.keys(lastAgent.selectorProvenance).sort(),
};
const pre = {};
for (const status of ["ADMISSIBILITY_UNRESOLVED", "NO_LAWFUL_PAIR", "PAIR_SELECTION_AMBIGUOUS"]) {
  reset();
  const value = await run({ session: { sessionId: "mock-" + status, scenario: status }, moduleId: "acquirerEnvironment" });
  pre[status] = {
    counts: { ...calls },
    downstreamIdentity: value === downstream,
    outcomeSource: lastAgent.outcomeSource,
    hasCoreInput: Object.hasOwn(lastAgent, "coreInput"),
    hasCoreOutput: Object.hasOwn(lastAgent, "coreOutput"),
    identityHasPair: Object.hasOwn(lastAgent.identityContext, "candidatePair"),
    keys: Object.keys(lastAgent.selectorProvenance).sort(),
  };
}
const injectedPair = Object.freeze({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STP",
});
const injected = {};
for (const [scenarioName, extra] of [
  ["pair", { crossSideEnvironmentPair: injectedPair }],
  ["codes", { establishedEnvironmentCodes: ["NF/NT"] }],
  ["pairAndCodes", { crossSideEnvironmentPair: injectedPair, establishedEnvironmentCodes: ["NF/NT", "NT/STP"] }],
]) {
  reset();
  let threw = null;
  try {
    await run({
      session: { sessionId: "mock-injected-" + scenarioName, scenario: "NO_LAWFUL_PAIR" },
      moduleId: "acquirerEnvironment",
      ...extra,
    });
  } catch (error) {
    threw = {
      name: error.name,
      failureClass: error.failureClass ?? null,
      detail: error.detail ?? null,
    };
  }
  injected[scenarioName] = { threw, counts: { ...calls } };
}
reset();
const incomplete = await run({
  session: { sessionId: "mock-incomplete", scenario: "SELECTED", incomplete: true },
  moduleId: "acquirerEnvironment",
});
const incompleteSummary = {
  counts: { ...calls },
  result: incomplete,
  downstreamIdentity: incomplete === downstream,
  outcomeSource: lastAgent.outcomeSource,
  hasCoreInput: Object.hasOwn(lastAgent, "coreInput"),
  hasCoreOutput: Object.hasOwn(lastAgent, "coreOutput"),
  hasSingleR1Session: Object.hasOwn(lastAgent, "singleR1Session"),
  identityPair: lastAgent.identityContext.candidatePair,
  identityDiagnostic: lastAgent.identityContext.diagnosticId,
};
reset();
const assemblerBlocked = await run({
  session: { sessionId: "mock-assembler-blocked", scenario: "SELECTED", assemblerBlocked: true },
  moduleId: "acquirerEnvironment",
});
const assemblerBlockedSummary = { counts: { ...calls }, result: assemblerBlocked };
const rejected = {};
for (const scenario of ["INPUT_INVALID", "CONFIG_INVALID", "throw_config"]) {
  reset();
  const value = await run({ session: { sessionId: "mock-" + scenario, scenario }, moduleId: "acquirerEnvironment" });
  rejected[scenario] = { counts: { ...calls }, result: value };
}
reset();
let moduleMismatch = false;
try {
  await run({ session: { sessionId: "mock-module", scenario: "SELECTED" }, moduleId: "targetSelfAssessment" });
} catch (error) {
  moduleMismatch = error instanceof TypeError;
}
const mismatchCounts = { ...calls };
reset();
let unexpectedPropagated = false;
try {
  await run({ session: { sessionId: "mock-unexpected", scenario: "throw_unexpected" }, moduleId: "acquirerEnvironment" });
} catch (error) {
  unexpectedPropagated = error instanceof RangeError && error.message === "unexpected-selector-defect";
}
console.log(JSON.stringify({
  selected: selectedSummary,
  pre,
  injected,
  incomplete: incompleteSummary,
  assemblerBlocked: assemblerBlockedSummary,
  rejected,
  moduleMismatch,
  mismatchCounts,
  unexpectedPropagated,
}));
`;
  const child = spawnSync(
    process.execPath,
    ["--experimental-test-module-mocks", "--input-type=module", "-e", harness],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(child.status, 0, child.stderr || child.stdout);
  const line = (child.stdout ?? "").trim().split("\n").at(-1);
  return JSON.parse(line);
}

const control = runControlFlowHarness();
const fullSession = buildC5C1DualCoreSession();
const expectedFull = expectedDualBundle(fullSession);
const fullResult1 = await runWithoutProviders({
  session: fullSession,
  moduleId: "acquirerEnvironment",
});
const fullResult2 = await runWithoutProviders({
  session: fullSession,
  moduleId: "acquirerEnvironment",
});
const extraAuthorityAttempt = await runWithoutProviders({
  session: fullSession,
  moduleId: "acquirerEnvironment",
  candidatePair: "FORGED/PAIR vs NOT/AUTHORITY",
  selectorResult: { status: "SELECTED", candidatePair: "FORGED" },
  selectorProvenance: { forged: true },
  coreInput: { forged: true },
  coreOutput: { forged: true },
  outcomeSource: "PRE_CORE_SELECTOR",
  identityContext: { diagnosticId: "forged" },
  diagnosticId: "forged",
});
const incompleteSession = buildC5CSelectedSession({
  sessionId: C5C1_DUAL_CORE_SESSION_ID,
});
const expectedIncomplete = expectedSingleBundle(incompleteSession);
const incompleteResult = await runWithoutProviders({
  session: incompleteSession,
  moduleId: "acquirerEnvironment",
});
const completedAfterIncomplete = await runWithoutProviders({
  session: buildC5C1DualCoreSession({ sessionId: C5C1_DUAL_CORE_SESSION_ID }),
  moduleId: "acquirerEnvironment",
});
const preBundles = {};
for (const status of PRE_STATUSES) {
  const session = buildPreSession(status);
  const expected = expectedPreBundle(session, status);
  const actual = await runWithoutProviders({ session, moduleId: "acquirerEnvironment" });
  preBundles[status] = { session, expected, actual };
}
const inputInvalidSession = Object.freeze({
  sessionId: "c5c1-input-invalid",
  dealContext: Object.freeze({
    completed: true,
    data: Object.freeze({ respondentSide: "acquirer" }),
  }),
});
const inputInvalidResult = await runWithoutProviders({
  session: inputInvalidSession,
  moduleId: "acquirerEnvironment",
});
const alternateSession = buildC5C1DualCoreSession({
  sessionId: "c5c1-history-alternate",
  verificationSessionId: "c5c1-history-alternate-r2",
  candidatePair: "SFJ/SFP vs SFP/SFJ",
});
await runWithoutProviders({ session: alternateSession, moduleId: "acquirerEnvironment" });
const historyResult = await runWithoutProviders({
  session: fullSession,
  moduleId: "acquirerEnvironment",
});

await check("C5C1-01", "root exports runProductionInterpretation", () => {
  assert.equal(typeof runProductionInterpretation, "function");
});

const signatureStart = ROOT_SOURCE.indexOf("export async function runProductionInterpretation");
const signatureEnd = ROOT_SOURCE.indexOf("} = {}) {", signatureStart);
const publicSignature = ROOT_SOURCE.slice(signatureStart, signatureEnd);
for (const [index, forbidden] of [
  "candidatePair",
  "selectorResult",
  "selectorProvenance",
  "coreInput",
  "coreOutput",
  "outcomeSource",
  "identityContext",
  "diagnosticId",
].entries()) {
  await check(
    "C5C1-" + String(index + 2).padStart(2, "0"),
    "public signature excludes " + forbidden,
    () => assert.equal(publicSignature.includes(forbidden), false),
  );
}

await check("C5C1-10", "selector has exactly one root call site", () => {
  assert.equal(occurrences(ROOT_SOURCE, /\bselectCandidatePair\s*\(/g), 1);
});
await check("C5C1-11", "assembler has exactly one root call site", () => {
  assert.equal(occurrences(ROOT_SOURCE, /\bassembleProductionDualAdjudicationInput\s*\(/g), 1);
});
await check("C5C1-12", "production Core has exactly one root call site", () => {
  assert.equal(occurrences(ROOT_SOURCE, /\bcompareDualRespondents\s*\(/g), 1);
});
await check("C5C1-13", "Agent handoff has exactly one root call site", () => {
  assert.equal(occurrences(ROOT_SOURCE, /\brunAgentInterpretation\s*\(/g), 1);
});
await check("C5C1-14", "mocked SELECTED path calls selector/assembler/Core/Agent once", () => {
  assert.deepEqual(control.selected.counts, { selector: 1, assembler: 1, core: 1, agent: 1 });
});
await check("C5C1-15", "mocked SELECTED path returns downstream identity", () => {
  assert.equal(control.selected.downstreamIdentity, true);
});
await check("C5C1-16", "assembler receives only selector pair", () => {
  assert.equal(control.selected.assemblerPair, "NT/STJ vs NT/STP");
});
await check("C5C1-17", "assembler uses scoring module vocabulary", () => {
  assert.equal(control.selected.assemblerModule, "acquirer_environment");
});
await check("C5C1-18", "DUAL identity pair equals selector pair", () => {
  assert.equal(control.selected.identityPair, "NT/STJ vs NT/STP");
});
await check("C5C1-19", "diagnostic identity is derived from session", () => {
  assert.equal(control.selected.identityDiagnostic, "mock-selected");
});
await check("C5C1-20", "SELECTED handoff uses DUAL_CORE", () => {
  assert.equal(control.selected.outcomeSource, "DUAL_CORE");
});
await check("C5C1-21", "outOfPairEvidence is an explicit false literal at runtime", () => {
  assert.equal(control.selected.flags.outOfPairEvidence, false);
});
await check("C5C1-22", "coherenceAmbiguous is an explicit false literal at runtime", () => {
  assert.equal(control.selected.flags.coherenceAmbiguous, false);
});
await check("C5C1-23", "root source exposes no true producer for either flag", () => {
  assert.equal(/(?:outOfPairEvidence|coherenceAmbiguous)\s*:\s*true/.test(ROOT_SOURCE), false);
});
await check("C5C1-24", "SELECTED provenance has exact fixed keys", () => {
  assert.deepEqual(control.selected.selectedKeys, [...SELECTED_KEYS].sort());
});

for (const status of PRE_STATUSES) {
  const row = control.pre[status];
  await check("C5C1-" + String(checks.length + 1).padStart(2, "0"), status + " bypasses assembler and Core", () => {
    assert.deepEqual(row.counts, { selector: 1, assembler: 0, core: 0, agent: 1 });
  });
  await check("C5C1-" + String(checks.length + 1).padStart(2, "0"), status + " uses PRE_CORE_SELECTOR", () => {
    assert.equal(row.outcomeSource, "PRE_CORE_SELECTOR");
  });
  await check("C5C1-" + String(checks.length + 1).padStart(2, "0"), status + " carries no core inputs or outputs", () => {
    assert.equal(row.hasCoreInput, false);
    assert.equal(row.hasCoreOutput, false);
  });
  await check("C5C1-" + String(checks.length + 1).padStart(2, "0"), status + " identity carries no candidatePair", () => {
    assert.equal(row.identityHasPair, false);
  });
}

await check("C5C1-37", "ADMISSIBILITY provenance has exact conditional keys", () => {
  assert.deepEqual(control.pre.ADMISSIBILITY_UNRESOLVED.keys, [...UNRESOLVED_KEYS].sort());
});
await check("C5C1-38", "routing keys are absent outside ADMISSIBILITY", () => {
  assert.deepEqual(control.pre.NO_LAWFUL_PAIR.keys, [...SELECTED_KEYS].sort());
  assert.deepEqual(control.pre.PAIR_SELECTION_AMBIGUOUS.keys, [...SELECTED_KEYS].sort());
});
await check("C5C1-39", "SELECTED missing_r2_context routes to Agent as SINGLE_R1_ONLY without Core", () => {
  assert.deepEqual(control.incomplete.counts, { selector: 1, assembler: 1, core: 0, agent: 1 });
  assert.equal(control.incomplete.outcomeSource, "SINGLE_R1_ONLY");
  assert.equal(control.incomplete.hasCoreInput, false);
  assert.equal(control.incomplete.hasCoreOutput, false);
  assert.equal(control.incomplete.hasSingleR1Session, true);
  assert.equal(control.incomplete.identityPair, "NT/STJ vs NT/STP");
  assert.equal(control.incomplete.identityDiagnostic, "mock-incomplete");
});
await check("C5C1-40", "mocked missing R2 returns the SINGLE Agent downstream identity", () => {
  assert.equal(control.incomplete.downstreamIdentity, true);
});
await check("C5C1-40A", "other SELECTED assembler failures still stop before Core and Agent", () => {
  assert.deepEqual(control.assemblerBlocked.counts, { selector: 1, assembler: 1, core: 0, agent: 0 });
  assert.deepEqual(control.assemblerBlocked.result, {
    ok: false,
    selectorStatus: "SELECTED",
    reason: "missing_r2_answers",
    stage: "r2_answers",
  });
});
await check("C5C1-41", "INPUT_INVALID produces no assembler/Core/Agent", () => {
  assert.deepEqual(control.rejected.INPUT_INVALID.counts, { selector: 1, assembler: 0, core: 0, agent: 0 });
});
await check("C5C1-42", "CONFIG_INVALID produces no assembler/Core/Agent", () => {
  assert.deepEqual(control.rejected.CONFIG_INVALID.counts, { selector: 1, assembler: 0, core: 0, agent: 0 });
});
await check("C5C1-43", "thrown accepted configuration error is normalized without Agent", () => {
  assert.deepEqual(control.rejected.throw_config.counts, { selector: 1, assembler: 0, core: 0, agent: 0 });
  assert.deepEqual(control.rejected.throw_config.result, {
    ok: false,
    selectorStatus: "CONFIG_INVALID",
    decisionCode: "SELECTOR_CONFIGURATION_ERROR",
  });
});
await check("C5C1-44", "module mismatch fails before selector execution", () => {
  assert.equal(control.moduleMismatch, true);
  assert.deepEqual(control.mismatchCounts, { selector: 0, assembler: 0, core: 0, agent: 0 });
});
await check("C5C1-45", "unexpected selector exception propagates", () => {
  assert.equal(control.unexpectedPropagated, true);
});

await check("C5C1-46", "lawful fixture completes R1 and R2 through session state", () => {
  assert.equal(fullSession.acquirer2A.completed, true);
  assert.equal(fullSession.acquirerVerification.completed, true);
  assert.equal(fullSession.acquirer2A.score.verificationIncluded, true);
});
await check("C5C1-47", "lawful fixture source uses production writers", () => {
  for (const writer of [
    "buildC5CSelectedSession",
    "createAcquirerVerificationInvite",
    "completeAcquirerVerificationInvite",
    "attachAcquirerVerificationCompletion",
  ]) {
    assert.equal(FIXTURE_SOURCE.includes(writer), true, writer);
  }
});
await check("C5C1-48", "fixture does not fabricate downstream coreInput", () => {
  assert.equal(FIXTURE_SOURCE.includes("coreInput"), false);
  assert.equal(FIXTURE_SOURCE.includes("compareDualRespondents"), false);
  assert.equal(FIXTURE_SOURCE.includes("assembleProductionDualAdjudicationInput"), false);
});
await check("C5C1-49", "actual complete R2 path produces selector SELECTED", () => {
  assert.equal(expectedFull.selectorResult.status, "SELECTED");
});
await check("C5C1-50", "actual complete R2 path assembles lawful input", () => {
  assert.equal(expectedFull.assembled.ok, true);
});
await check("C5C1-51", "actual production Core branch is selector-compatible", () => {
  assert.equal(["P_1", "P_3", "P_4", "P_5A", "P_5B", "P_0C", "UNMATCHED"].includes(
    expectedFull.snapshot.engine.outcome.engineOutcomeCode,
  ), true);
});
await check("C5C1-52", "actual Agent stack seals the expected DUAL snapshot", () => {
  assert.equal(fullResult1.engineSnapshotDigest, expectedFull.snapshot.engineSnapshotDigest);
  assert.equal(fullResult1.diagnosticId, C5C1_DUAL_CORE_SESSION_ID);
});
await check("C5C1-53", "actual DUAL result is the downstream provider rejection", () => {
  assert.equal(fullResult1.failureSchemaVersion, "system-failure-1.0");
  assert.equal(fullResult1.failureClass, "PROVIDER_UNAVAILABLE");
});
await check("C5C1-54", "caller-supplied authority fields cannot alter DUAL outcome", () => {
  assert.equal(extraAuthorityAttempt.engineSnapshotDigest, expectedFull.snapshot.engineSnapshotDigest);
  assert.equal(extraAuthorityAttempt.diagnosticId, C5C1_DUAL_CORE_SESSION_ID);
});
await check("C5C1-55", "DUAL identity carries selector pair and normalization", () => {
  assert.equal(expectedFull.snapshot.identity.candidatePair, expectedFull.selectorResult.candidatePair);
  assert.equal(
    expectedFull.snapshot.identity.candidatePairNormalized,
    expectedFull.selectorResult.candidatePairNormalized,
  );
});
await check("C5C1-56", "DUAL core input contains explicit false flags", () => {
  assert.equal(Object.hasOwn(expectedFull.coreInput, "outOfPairEvidence"), true);
  assert.equal(Object.hasOwn(expectedFull.coreInput, "coherenceAmbiguous"), true);
  assert.equal(expectedFull.coreInput.outOfPairEvidence, false);
  assert.equal(expectedFull.coreInput.coherenceAmbiguous, false);
});
await check("C5C1-57", "P_2 and P_5X are not reached by the fixture", () => {
  assert.notEqual(expectedFull.snapshot.engine.outcome.engineOutcomeCode, "P_2");
  assert.notEqual(expectedFull.snapshot.engine.outcome.engineOutcomeCode, "P_5X");
});
await check("C5C1-58", "EngineSnapshot retains independent Core recomputation", () => {
  const forged = structuredClone(expectedFull.coreOutput);
  forged.output = String(forged.output) + " forged";
  assert.throws(() => assembleEngineSnapshot({
    coreOutput: forged,
    identityContext: expectedFull.identityContext,
    coreInput: expectedFull.coreInput,
    selectorProvenance: expectedFull.selectorProvenance,
  }), /coreOutput does not match compareDualRespondents/);
});
await check("C5C1-59", "selector audit and matching internals are absent from DUAL snapshot", () => {
  for (const key of ["audit", "matchedPairs", "positiveEnvironmentSet", "contributions", "corpus", "runtime"]) {
    assert.equal(Object.hasOwn(expectedFull.snapshot.selector, key), false, key);
  }
});
await check("C5C1-60", "assembler audit is absent from DUAL snapshot and result", () => {
  assert.equal(JSON.stringify(expectedFull.snapshot).includes("c5b-production-adjudication-input-assembler"), false);
  assert.equal(JSON.stringify(fullResult1).includes("c5b-production-adjudication-input-assembler"), false);
});
await check("C5C1-61", "root introduces no respondentId", () => {
  assert.equal(ROOT_SOURCE.includes("respondentId"), false);
  assert.equal(collectKeys(expectedFull.snapshot).has("respondentId"), false);
});
await check("C5C1-62", "identical session yields identical EngineSnapshot digest", () => {
  assert.equal(fullResult1.engineSnapshotDigest, fullResult2.engineSnapshotDigest);
});
await check("C5C1-63", "execution is history-independent", () => {
  assert.equal(fullResult1.engineSnapshotDigest, historyResult.engineSnapshotDigest);
});

await check("C5C1-64", "actual incomplete R2 seals SINGLE_R1_ONLY and reaches the Agent provider boundary", () => {
  assert.equal(expectedIncomplete.snapshot.outcomeSource, "SINGLE_R1_ONLY");
  assert.equal(incompleteResult.engineSnapshotDigest, expectedIncomplete.snapshot.engineSnapshotDigest);
  assert.equal(incompleteResult.failureClass, "PROVIDER_UNAVAILABLE");
  assert.equal(incompleteResult.diagnosticId, incompleteSession.sessionId);
});
await check("C5C1-65", "missing R2 does not become PRE_CORE", () => {
  assert.equal(JSON.stringify(incompleteResult).includes("PRE_CORE_SELECTOR"), false);
  assert.equal(JSON.stringify(incompleteResult).includes("S_"), false);
  assert.notEqual(expectedIncomplete.snapshot.engine.outcome.engineOutcomeCode.startsWith("S_"), true);
});
await check("C5C1-66", "missing R2 does not reuse the DUAL snapshot or skip Agent", () => {
  assert.notEqual(incompleteResult.engineSnapshotDigest, expectedFull.snapshot.engineSnapshotDigest);
  assert.equal(expectedFull.snapshot.outcomeSource, "DUAL_CORE");
  assert.equal(incompleteResult.failureSchemaVersion, "system-failure-1.0");
  assert.equal(Object.hasOwn(expectedIncomplete.snapshot.engine, "comparison"), false);
});
await check("C5C1-67", "same session identity can run after lawful R2 completion", () => {
  assert.equal(completedAfterIncomplete.diagnosticId, incompleteSession.sessionId);
  assert.equal(typeof completedAfterIncomplete.engineSnapshotDigest, "string");
});

await check("C5C1-68", "unknown seniority is selector ADMISSIBILITY_UNRESOLVED", () => {
  const row = preBundles.ADMISSIBILITY_UNRESOLVED.expected;
  assert.equal(row.selectorResult.unresolvedReason, "unknown_seniority");
  assert.equal(row.snapshot.engine.outcome.engineOutcomeCode, "S_ADMISSIBILITY_UNRESOLVED");
});
await check("C5C1-69", "unknown seniority reaches the actual PRE_CORE Agent stack", () => {
  const row = preBundles.ADMISSIBILITY_UNRESOLVED;
  assert.equal(row.actual.engineSnapshotDigest, row.expected.snapshot.engineSnapshotDigest);
  assert.equal(JSON.stringify(row.actual).includes("missing_r1_context"), false);
});
await check("C5C1-70", "NO_LAWFUL_PAIR reaches exact PRE_CORE outcome", () => {
  const row = preBundles.NO_LAWFUL_PAIR;
  assert.equal(row.expected.snapshot.engine.outcome.engineOutcomeCode, "S_NO_LAWFUL_PAIR");
  assert.equal(row.actual.engineSnapshotDigest, row.expected.snapshot.engineSnapshotDigest);
});
await check("C5C1-71", "PAIR_SELECTION_AMBIGUOUS reaches exact PRE_CORE outcome", () => {
  const row = preBundles.PAIR_SELECTION_AMBIGUOUS;
  assert.equal(row.expected.snapshot.engine.outcome.engineOutcomeCode, "S_PAIR_SELECTION_AMBIGUOUS");
  assert.equal(row.actual.engineSnapshotDigest, row.expected.snapshot.engineSnapshotDigest);
});
await check("C5C1-72", "PRE_CORE selector provenance strips corpus/runtime/audit internals", () => {
  for (const row of Object.values(preBundles)) {
    for (const key of ["audit", "matchedPairs", "positiveEnvironmentSet", "contributions", "corpus", "runtime"]) {
      assert.equal(Object.hasOwn(row.expected.snapshot.selector, key), false, key);
    }
  }
});
await check("C5C1-72A", "both no-pair PRE_CORE statuses construct provider prompts without ProviderPromptError", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const row = preBundles[status].expected;
    assert.equal(row.promptError instanceof ProviderPromptError, false, status);
    assert.equal(row.promptError, null, status);
    assert.ok(row.prompt, status);
  }
});
await check("C5C1-72B", "both no-pair provider projections preserve PRE_CORE_SELECTOR outcomes", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const row = preBundles[status].expected;
    assert.equal(row.projection.engineSnapshot.outcomeSource, "PRE_CORE_SELECTOR", status);
    assert.equal(row.projection.engineSnapshot.engine.outcome.engineOutcomeCode, EXPECTED_PRE_CODES[status], status);
  }
});
await check("C5C1-72C", "both no-pair requests add exactly one branch constraint beyond the literal baseline", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const rows = preBundles[status].expected.request.activeConstraints;
    assert.deepEqual(
      rows.map((row) => row.constraintId),
      [...EXPECTED_BASELINE_CONSTRAINT_IDS, NO_PAIR_CONSTRAINT_ID],
      status,
    );
    assert.deepEqual(
      rows.filter((row) => row.scope === "BRANCH").map((row) => row.constraintId),
      [NO_PAIR_CONSTRAINT_ID],
      status,
    );
  }
});
await check("C5C1-72D", "the independent no-pair provider rule is rendered exactly once", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const prompt = preBundles[status].expected.prompt;
    const systemInstruction = prompt.messages[0].content;
    const constraintBlock = systemInstruction
      .split("[ACTIVE_CONSTRAINTS]\n")[1]
      .split("\n\n[HYPOTHESES]")[0];
    const exactLine = `- ${NO_PAIR_CONSTRAINT_ID}: ${NO_PAIR_PROVIDER_RULE}`;
    assert.equal(constraintBlock.split("\n").filter((line) => line === exactLine).length, 1, status);
    const promptBytes = JSON.stringify(prompt);
    assert.equal(literalOccurrences(promptBytes, NO_PAIR_PROVIDER_RULE), 1, status);
  }
});
await check("C5C1-72E", "no-pair provider material contains no materialized candidate pair", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const row = preBundles[status].expected;
    assert.equal(row.snapshot.identity.candidatePair, null, status);
    assert.equal(row.snapshot.identity.candidatePairNormalized, null, status);
    assert.equal(row.projection.engineSnapshot.identity.candidatePair, null, status);
    assert.equal(
      Object.hasOwn(row.projection.engineSnapshot.identity, "candidatePairNormalized"),
      false,
      status,
    );
    for (const matchedPair of row.selectorResult.audit?.matchedPairs ?? []) {
      assert.equal(JSON.stringify(row.prompt).includes(matchedPair), false, `${status}: ${matchedPair}`);
    }
  }
});
await check("C5C1-72F", "selector audit and matched-pair internals do not leak into no-pair provider projections", () => {
  for (const status of NO_PAIR_PRE_STATUSES) {
    const row = preBundles[status].expected;
    const keys = collectKeys(row.projection);
    for (const key of ["selector", "audit", "matchedPairs", "positiveEnvironmentSet", "contributions"]) {
      assert.equal(keys.has(key), false, `${status}: ${key}`);
    }
    const promptBytes = JSON.stringify(row.prompt);
    for (const auditValue of [
      ...(row.selectorResult.audit?.matchedPairs ?? []),
      ...(row.selectorResult.audit?.positiveEnvironmentSet ?? []),
    ]) {
      assert.equal(promptBytes.includes(auditValue), false, `${status}: ${auditValue}`);
    }
  }
});
await check("C5C1-72G", "an artificial unknown constraint still fails prompt construction closed", () => {
  const tampered = structuredClone(preBundles.NO_LAWFUL_PAIR.expected.projection);
  tampered.activeConstraints.push({
    constraintId: "C-C5C1-CORR1-UNKNOWN",
    scope: "BRANCH",
    blockedClaimIds: [],
    originBranch: "S_NO_LAWFUL_PAIR",
  });
  assert.throws(() => buildProviderPrompt(tampered), ProviderPromptError);
});
await check("C5C1-72H", "accepted ADMISSIBILITY_UNRESOLVED system-instruction bytes remain unchanged", () => {
  const row = preBundles.ADMISSIBILITY_UNRESOLVED.expected;
  assert.equal(row.promptError, null);
  const systemInstruction = row.prompt.messages[0].content;
  assert.equal(Buffer.byteLength(systemInstruction, "utf8"), ADMISSIBILITY_SYSTEM_INSTRUCTION_BYTES);
  assert.equal(
    createHash("sha256").update(systemInstruction).digest("hex"),
    ADMISSIBILITY_SYSTEM_INSTRUCTION_SHA256,
  );
});
await check("C5C1-73", "actual INPUT_INVALID returns bounded non-Agent result", () => {
  assert.deepEqual(inputInvalidResult, {
    ok: false,
    selectorStatus: "INPUT_INVALID",
    decisionCode: "R1_ABSENT",
  });
  assert.equal(Object.hasOwn(inputInvalidResult, "engineSnapshotDigest"), false);
});

await check("C5C1-74", "selector has one production importer", () => {
  assert.deepEqual(importersOf("candidatePairSelector.js"), [ROOT_RELATIVE]);
});
await check("C5C1-75", "assembler has one production importer", () => {
  assert.deepEqual(importersOf("productionAdjudicationInputAssembler.js"), [ROOT_RELATIVE]);
});
await check("C5C1-76", "Agent run has one production importer", () => {
  assert.deepEqual(importersOf("agentInterpretationRun.js"), [ROOT_RELATIVE]);
});
await check("C5C1-77", "root is physically under src/agent", () => {
  assert.equal(ROOT_RELATIVE.startsWith("src/agent/"), true);
});
await check("C5C1-78", "root avoids W18 forbidden import fragments", () => {
  for (const fragment of J5_FORBIDDEN_IMPORT_FRAGMENTS) {
    assert.equal(ROOT_SOURCE.includes(fragment), false, fragment);
  }
});
await check("C5C1-79", "root avoids closed semantic transport/failure dependency tokens", () => {
  for (const token of J5_FORBIDDEN_DEPENDENCY_TOKENS) {
    assert.equal(ROOT_SOURCE.includes(token), false, token);
  }
});
await check("C5C1-80", "root has no dependency-injection or provider override surface", () => {
  for (const token of ["fetchImpl", "runtimeOptions", "providerFetchImpl", "judgeFetchImpl", "debugOptions"]) {
    assert.equal(publicSignature.includes(token), false, token);
  }
});
await check("C5C1-81", "package registers exactly the dedicated command", () => {
  assert.equal(
    PACKAGE.scripts["validate:c5c1-production-composition"],
    "node scripts/validate-c5c1-production-composition.mjs",
  );
});
await check("C5C1-82", "package-lock has no C5-C.1 registration or dependency delta", () => {
  assert.equal(PACKAGE_LOCK_SOURCE.includes("validate:c5c1-production-composition"), false);
  assert.equal(PACKAGE_LOCK_SOURCE.includes("c5c1-production-composition"), false);
});
await check("C5C1-83", "selector immutable sentinel matches", () => {
  assert.equal(sha256File("src/flow/candidatePairSelector.js"), SENTINELS["src/flow/candidatePairSelector.js"]);
});
await check("C5C1-84", "Dual Core immutable sentinel matches", () => {
  assert.equal(sha256File("src/flow/dualRespondentComparison.js"), SENTINELS["src/flow/dualRespondentComparison.js"]);
});
await check("C5C1-85", "selector validator immutable sentinel matches", () => {
  assert.equal(
    sha256File("scripts/validate-c5b-candidate-pair-selector.mjs"),
    SENTINELS["scripts/validate-c5b-candidate-pair-selector.mjs"],
  );
});
await check("C5C1-86", "semantic conformance immutable sentinel matches", () => {
  assert.equal(
    sha256File("scripts/validate-agent-semantic-conformance-offline.mjs"),
    SENTINELS["scripts/validate-agent-semantic-conformance-offline.mjs"],
  );
});

await check("C5C1-87", "all reachable selector pairs keep false-only branch flags", () => {
  for (const [index, candidatePair] of REACHABLE_CANDIDATE_PAIRS.entries()) {
    const session = buildC5C1DualCoreSession({
      sessionId: "c5c1-reachable-" + index,
      verificationSessionId: "c5c1-reachable-r2-" + index,
      candidatePair,
    });
    const bundle = expectedDualBundle(session);
    assert.equal(bundle.coreInput.outOfPairEvidence, false, candidatePair);
    assert.equal(bundle.coreInput.coherenceAmbiguous, false, candidatePair);
    assert.notEqual(bundle.snapshot.engine.outcome.engineOutcomeCode, "P_2", candidatePair);
    assert.notEqual(bundle.snapshot.engine.outcome.engineOutcomeCode, "P_5X", candidatePair);
  }
});
await check("C5C1-88", "validator uses literal status and outcome oracles", () => {
  assert.deepEqual(PRE_STATUSES, [
    "ADMISSIBILITY_UNRESOLVED",
    "NO_LAWFUL_PAIR",
    "PAIR_SELECTION_AMBIGUOUS",
  ]);
  assert.deepEqual(EXPECTED_PRE_CODES, {
    ADMISSIBILITY_UNRESOLVED: "S_ADMISSIBILITY_UNRESOLVED",
    NO_LAWFUL_PAIR: "S_NO_LAWFUL_PAIR",
    PAIR_SELECTION_AMBIGUOUS: "S_PAIR_SELECTION_AMBIGUOUS",
  });
});
await check("C5C1-89", "authorized artifacts exist at exact paths", () => {
  for (const relativePath of [ROOT_RELATIVE, FIXTURE_RELATIVE, VALIDATOR_RELATIVE]) {
    assert.equal(statSync(join(ROOT, relativePath)).isFile(), true, relativePath);
  }
});

// ── PRE_CORE cross-side context containment (OD-PC-1A / OD-PC-2 CORR1) ─────

const PRE_CORE_PAIR = Object.freeze({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STP",
});

await check("C5C1-90", "lawful PRE_CORE passes containment and yields the accepted empty pack (CASE 1)", () => {
  for (const status of PRE_STATUSES) {
    const row = preBundles[status];
    const pack = row.expected.interpretationContextPack;
    assert.deepEqual(pack.selectedContextItems, [], status);
    assert.deepEqual(pack.permittedInterpretationDomains, [], status);
    assert.deepEqual(pack.prohibitedExtrapolationMarkers, [], status);
    assert.equal(pack.packScopeVerdict, "FACTUAL_EXPLANATION_ONLY", status);
    assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null, status);
    assert.deepEqual(pack.selectionKeys.establishedEnvironmentCodes, [], status);
    assert.equal(row.expected.request.permittedOutputScope, "FACTUAL_EXPLANATION_ONLY", status);
    assert.deepEqual(row.expected.request.permittedInterpretationDomains, [], status);
    assert.equal(row.actual.engineSnapshotDigest, row.expected.snapshot.engineSnapshotDigest, status);
    assert.equal(row.actual.failureClass, "PROVIDER_UNAVAILABLE", status);
  }
});

await check("C5C1-91", "PRE_CORE pack carries no SR-01/SR-11/SR-12 or pair-derived context (CASE 9)", () => {
  for (const status of PRE_STATUSES) {
    const pack = preBundles[status].expected.interpretationContextPack;
    const serialized = JSON.stringify(pack);
    for (const ruleId of ["SR-01", "SR-11", "SR-12"]) {
      assert.equal(
        pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === ruleId),
        false,
        `${status}: ${ruleId}`,
      );
      assert.equal(serialized.includes(ruleId), false, `${status}: ${ruleId}`);
    }
    for (const domain of ["ENVIRONMENT_IDENTITY", "FRICTION_AND_RESOURCES", "TEMPORAL_HORIZON", "PAIR_SEMANTICS"]) {
      assert.equal(pack.permittedInterpretationDomains.includes(domain), false, `${status}: ${domain}`);
    }
    assert.equal(serialized.includes("frictionLookup"), false, status);
    assert.equal(serialized.includes("ecsMatrix"), false, status);
  }
});

for (const [scenarioName, label] of [
  ["pair", "injected valid cross-side pair (CASE 2)"],
  ["codes", "injected established environment codes (CASE 3)"],
  ["pairAndCodes", "injected pair + codes, same terminal class (CASE 4)"],
]) {
  await check("C5C1-" + String(checks.length + 1).padStart(2, "0"), "composition containment rejects PRE_CORE + " + label, () => {
    const row = control.injected[scenarioName];
    assert.ok(row.threw, scenarioName);
    assert.equal(row.threw.name, "AgentInterpretationRequestAssemblyError", scenarioName);
    assert.equal(row.threw.failureClass, "INPUT_ASSEMBLY_FAILURE", scenarioName);
    assert.match(String(row.threw.detail), /PRE_CORE_SELECTOR invocation carries forbidden cross-side context inputs/, scenarioName);
    assert.deepEqual(row.counts, { selector: 1, assembler: 0, core: 0, agent: 0 }, scenarioName);
  });
}

await check("C5C1-96", "real composition path fails closed on injected pair and codes (CASE 2/3 full stack)", async () => {
  const session = buildPreSession("NO_LAWFUL_PAIR");
  for (const extra of [
    { crossSideEnvironmentPair: PRE_CORE_PAIR },
    { establishedEnvironmentCodes: ["NF/NT"] },
    { crossSideEnvironmentPair: PRE_CORE_PAIR, establishedEnvironmentCodes: ["NF/NT", "NT/STP"] },
  ]) {
    let threw = null;
    try {
      await runWithoutProviders({ session, moduleId: "acquirerEnvironment", ...extra });
    } catch (error) {
      threw = error;
    }
    assert.ok(threw instanceof AgentInterpretationRequestAssemblyError);
    assert.equal(threw.failureClass, "INPUT_ASSEMBLY_FAILURE");
    assert.match(String(threw.detail), /PRE_CORE_SELECTOR invocation carries forbidden cross-side context inputs/);
  }
});

await check("C5C1-97", "direct runAgentInterpretation bypass is contained at the pack boundary (CASE 6)", async () => {
  const base = preBundles.NO_LAWFUL_PAIR.expected;
  for (const [name, extra] of [
    ["pair", { crossSideEnvironmentPair: PRE_CORE_PAIR }],
    ["codes", { establishedEnvironmentCodes: ["NF/NT"] }],
  ]) {
    let threw = null;
    let returned = null;
    try {
      returned = await runAgentWithoutProviders({
        outcomeSource: "PRE_CORE_SELECTOR",
        selectorProvenance: base.selectorProvenance,
        identityContext: base.identityContext,
        ...extra,
      });
    } catch (error) {
      threw = error;
    }
    assert.equal(returned, null, name);
    assert.ok(threw instanceof ContextPackSelectionError, `${name}: ${threw?.constructor?.name}`);
    assert.match(String(threw.message), /PRE_CORE_SELECTOR forbids/, name);
  }
});

await check("C5C1-98", "lawful direct runAgentInterpretation passes containment and reaches the provider boundary", async () => {
  const base = preBundles.NO_LAWFUL_PAIR.expected;
  const value = await runAgentWithoutProviders({
    outcomeSource: "PRE_CORE_SELECTOR",
    selectorProvenance: base.selectorProvenance,
    identityContext: base.identityContext,
  });
  assert.equal(value.failureSchemaVersion, "system-failure-1.0");
  assert.equal(value.failureClass, "PROVIDER_UNAVAILABLE");
});

console.log("C5-C.1 Production Composition cases passed:");
console.log("PASS " + checks.length + "/" + checks.length);
