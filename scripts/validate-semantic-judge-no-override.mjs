import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import { assembleAgentInterpretationResult } from "../src/agent/agentInterpretationResult.js";
import { GEMINI_MODEL_ID, PROVIDER_ID_GEMINI } from "../src/agent/providerExecutionConstants.js";
import { createMockSemanticJudge } from "../src/agent/semanticJudge.js";
import {
  assertNoLocalSemanticReject,
  validateAgentInterpretationSemantics,
} from "../src/agent/semanticValidator.js";
import { evaluateDeterministicChecks } from "../src/agent/semanticLocalEvaluator.js";
import { SemanticViolationError } from "../src/agent/semanticValidationError.js";
import { FROZEN_ADVERSARIAL_TEXT } from "./fixtures/agent-semantic-conformance-corpus.mjs";
import { buildC5CSelectedSelectorProvenance } from "./fixtures/c5c-selected-session.mjs";

const VALIDATOR_PATH = new URL("../src/agent/semanticValidator.js", import.meta.url);
const COMPLETENESS_PATH = new URL("../src/agent/semanticCompleteness.js", import.meta.url);
const PACKAGE_PATH = new URL("../package.json", import.meta.url);
const RENDER_PDF_PATH = new URL("../api/render-pdf.js", import.meta.url);
const FINAL_REPORT_PATH = new URL("../api/final-report.ts", import.meta.url);
const CREATE_SESSION_PATH = new URL("../api/create-target-session.ts", import.meta.url);
const VERIFY_CODE_PATH = new URL("../api/verify-target-code.ts", import.meta.url);

const validatorSource = readFileSync(VALIDATOR_PATH, "utf8");
const completenessSource = readFileSync(COMPLETENESS_PATH, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

const HOSTILE_PROSE = FROZEN_ADVERSARIAL_TEXT["V-02-SEM-STATE-IN-PROSE"];
const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const SELECTOR = buildC5CSelectedSelectorProvenance();
const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };

const failures = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      throw new Error(`${label}: async check must be awaited`);
    }
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkAsync(label, fn) {
  try {
    await fn();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function answer() {
  return {
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    knowledgeLevel: "first_hand",
    confidence: "high",
    reliabilityFlags: [],
  };
}

function fill() {
  const out = {};
  for (const question of QUESTIONS) out[question] = answer();
  return out;
}

function deepFreezeValue(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreezeValue(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreezeValue(child);
  return value;
}

function requestFor(coreInput) {
  const input = { outOfPairEvidence: false, coherenceAmbiguous: false, ...coreInput };
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: {
      diagnosticId: "diag-sec1g",
      projectId: null,
      moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
      candidatePair: coreInput.candidatePair ?? "",
      candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
    },
    coreInput: input,
    selectorProvenance: SELECTOR,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
  });
  const request = buildAgentInterpretationRequest({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    interpretationContextPack: pack,
  });
  return { request };
}

function projectionRefs(request) {
  return {
    qrefA: request.structuredUncertainty.survivingEvidenceRefs[0] ?? null,
    qrefB: request.structuredUncertainty.survivingEvidenceRefs[1] ?? null,
    factref: request.structuredUncertainty.known[0]?.factRef ?? null,
    mref: request.interpretationContextPack.selectedContextItems[0]?.contextRef ?? null,
    uncertaintyId: request.structuredUncertainty.items[0]?.uncertaintyId ?? null,
  };
}

function lawfulCandidate(request, hypothesisStatement) {
  const refs = projectionRefs(request);
  const evidenceBasis = {
    supportBasis: "PRIMARY_COMPARABLE",
    conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE",
    materialUnknownsPresent: false,
  };
  const caseB = request.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";
  const hypothesisMref = caseB ? refs.mref : null;
  const boundedContextRefs = caseB ? [refs.mref] : [];
  return {
    interpretationStatus: "INTERPRETATION_SUPPORTED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          {
            hypothesisId: "H1",
            statement: hypothesisStatement,
            evidenceBasis,
            decisiveEvidenceRefs: [refs.qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: hypothesisMref === null ? [] : [hypothesisMref],
            requiresEngineFactNotEstablished: [],
          },
          {
            hypothesisId: "H2",
            statement: "An alternative reading of the supplied evidence.",
            evidenceBasis,
            decisiveEvidenceRefs: refs.qrefB && refs.qrefB !== refs.qrefA ? [refs.qrefB] : [refs.qrefA],
            conflictingEvidenceRefs: [],
            contextRefs: hypothesisMref === null ? [] : [hypothesisMref],
            requiresEngineFactNotEstablished: [],
          },
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
      sections: [
        {
          sectionId: "S-001",
          text: "The assessment established the recorded outcome; a bounded reading follows.",
          derivedFromClaimIds: ["CL-001", "CL-003"],
        },
      ],
    },
  };
}

function assembledFixture(hypothesisStatement = "One bounded reading of the supplied evidence.") {
  const { request } = requestFor({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const candidate = lawfulCandidate(request, hypothesisStatement);
  const output = deepFreezeValue({
    candidate: deepFreezeValue(structuredClone(candidate)),
    executionMetadata: deepFreezeValue({
      provider: PROVIDER_ID_GEMINI,
      model: GEMINI_MODEL_ID,
      executedAt: "2026-08-23T00:00:00.000Z",
    }),
  });
  const result = assembleAgentInterpretationResult({
    agentInterpretationRequest: request,
    providerExecutionOutput: output,
  });
  return { request, result };
}

function hostileLocalFailFixture() {
  const fixture = assembledFixture(HOSTILE_PROSE);
  const result = structuredClone(fixture.result);
  result.interpretation.hypotheses.items[0].statement = HOSTILE_PROSE;
  result.interpretationStatus = "ABSTAINED_INSUFFICIENT_EVIDENCE";
  result.abstentionReason = "NO_SURVIVING_ADMISSIBLE_EVIDENCE";
  return {
    request: fixture.request,
    result: deepFreezeValue(result),
  };
}

function passJudge() {
  return createMockSemanticJudge(() => ({ verdict: "PASS" }), { recordCalls: true });
}

function failJudge() {
  return createMockSemanticJudge(() => ({ verdict: "FAIL" }), { recordCalls: true });
}

async function expectViolation(fn) {
  try {
    const value = await fn();
    assert.fail(`expected SemanticViolationError, got return ${typeof value}`);
  } catch (error) {
    assert.equal(error instanceof SemanticViolationError, true, `expected SemanticViolationError, got ${error?.constructor?.name}: ${error?.message}`);
    return error;
  }
}

check("package.json registers the semantic-judge-no-override oracle", () => {
  assert.equal(
    pkg.scripts?.["validate:semantic-judge-no-override"],
    "node scripts/validate-semantic-judge-no-override.mjs",
  );
});

check("source scan: original interpretation is not returned without a local-fail guard", () => {
  let idx = 0;
  let returns = 0;
  while (true) {
    const pos = validatorSource.indexOf("return agentInterpretationResult", idx);
    if (pos === -1) break;
    returns += 1;
    const window = validatorSource.slice(Math.max(0, pos - 500), pos);
    assert.ok(
      window.includes("assertNoLocalSemanticReject"),
      "return agentInterpretationResult must follow assertNoLocalSemanticReject",
    );
    idx = pos + 1;
  }
  assert.ok(returns >= 1, "validator must return AgentInterpretationResult on the allow path");
  assert.ok(validatorSource.includes("export function assertNoLocalSemanticReject"));
  assert.ok(completenessSource.includes("local deterministic semantic FAILs exist"));
  assert.equal(validatorSource.includes("createXaiSemanticJudge"), false);
  assert.equal(validatorSource.includes("executeXaiSemanticJudge"), false);
});

check("conjunction helper rejects local FAIL even if a caller would treat judge as PASS", () => {
  assert.throws(
    () => assertNoLocalSemanticReject([], [{
      ruleId: "V-02",
      semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
      targetFamily: "HYPOTHESIS_STATEMENT",
      targetLocator: "interpretation.hypotheses.items[0].statement",
      violationCode: "PROHIBITED_CLAIM_VIOLATION",
      reasonCode: "RULE_VIOLATED",
      supportingAuthorityIds: [],
      detail: "hostile prose rejected locally",
    }]),
    SemanticViolationError,
  );
  assert.doesNotThrow(() => assertNoLocalSemanticReject([], []));
});

check("V001-V004 production files were not modified by this act", () => {
  const render = readFileSync(RENDER_PDF_PATH, "utf8");
  const finalReport = readFileSync(FINAL_REPORT_PATH, "utf8");
  const createSession = readFileSync(CREATE_SESSION_PATH, "utf8");
  const verifyCode = readFileSync(VERIFY_CODE_PATH, "utf8");
  assert.ok(render.includes("evaluatePdfRenderAuthorization"));
  assert.ok(finalReport.includes("evaluateHiddenCopyRequest"));
  assert.equal(createSession.includes("body?.track1Complete"), false);
  assert.ok(verifyCode.includes("verifyServerTargetCode"));
});

await checkAsync("hostile prose + local FAIL + mock judge FAIL → fail closed", async () => {
  const fixture = hostileLocalFailFixture();
  const dSet = evaluateDeterministicChecks(fixture.request, fixture.result);
  assert.ok(dSet.some((row) => row.outcome === "FAIL"), "hostile fixture must carry a deterministic/local FAIL");
  const judge = failJudge();
  const error = await expectViolation(() => validateAgentInterpretationSemantics({
    agentInterpretationRequest: fixture.request,
    agentInterpretationResult: fixture.result,
    semanticJudge: judge,
    maxChecksPerBatch: 100,
  }));
  assert.equal(error.name, "SemanticViolationError");
  assert.equal(judge.calls.length, 0, "judge must not run after local FAIL");
});

await checkAsync("hostile prose + local FAIL + mock judge PASS + completeness would pass → still fail closed", async () => {
  const fixture = hostileLocalFailFixture();
  const judge = passJudge();
  const error = await expectViolation(() => validateAgentInterpretationSemantics({
    agentInterpretationRequest: fixture.request,
    agentInterpretationResult: fixture.result,
    semanticJudge: judge,
    maxChecksPerBatch: 100,
  }));
  assert.equal(error instanceof SemanticViolationError, true);
  assert.equal(judge.calls.length, 0, "mock judge PASS must not be consulted after local FAIL");
  assert.notEqual(error, fixture.result);
  assert.equal("interpretationId" in error, false, "original AgentInterpretationResult must not be returned");
});

await checkAsync("clean input + local PASS + mock judge PASS + completeness PASS → allow path lives", async () => {
  const fixture = assembledFixture();
  const dSet = evaluateDeterministicChecks(fixture.request, fixture.result);
  assert.equal(dSet.every((row) => row.outcome === "PASS"), true);
  const judge = passJudge();
  const validated = await validateAgentInterpretationSemantics({
    agentInterpretationRequest: fixture.request,
    agentInterpretationResult: fixture.result,
    semanticJudge: judge,
    maxChecksPerBatch: 100,
  });
  assert.equal(validated, fixture.result);
});

if (failures.length) {
  console.error("validate:semantic-judge-no-override FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("validate:semantic-judge-no-override passed");
console.log("judge: mocked; live LLM not called");
