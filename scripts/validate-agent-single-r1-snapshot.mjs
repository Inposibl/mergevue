import assert from "node:assert/strict";

import {
  attachAcquirerVerificationCompletion,
  completeAcquirerVerificationInvite,
  createAcquirerVerificationInvite,
} from "../src/flow/acquirerTrackFlow.js";
import { selectCandidatePair } from "../src/flow/candidatePairSelector.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { assembleProductionDualAdjudicationInput } from "../src/flow/productionAdjudicationInputAssembler.js";
import { buildAgentInterpretationRequest } from "../src/agent/agentInterpretationRequest.js";
import {
  assembleEngineSnapshot,
  normalizeCandidatePair,
} from "../src/agent/engineSnapshot.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { assembleAgentInterpretationResult } from "../src/agent/agentInterpretationResult.js";
import { runProductionInterpretation } from "../src/agent/productionInterpretationComposition.js";
import { projectProviderProjection } from "../src/agent/providerProjection.js";
import {
  ProviderSemanticCandidateValidationError,
  validateProviderSemanticCandidate,
} from "../src/agent/providerSemanticCandidateSchema.js";
import { createMockSemanticJudge } from "../src/agent/semanticJudge.js";
import { validateAgentInterpretationSemantics } from "../src/agent/semanticValidator.js";
import { SemanticViolationError } from "../src/agent/semanticValidationError.js";
import { assembleSingleR1Snapshot } from "../src/agent/singleR1Snapshot.js";
import {
  StructuredUncertaintyDerivationError,
  buildStructuredUncertainty,
} from "../src/agent/structuredUncertainty.js";
import {
  GEMINI_MODEL_ID,
  PROVIDER_ID_GEMINI,
} from "../src/agent/providerExecutionConstants.js";
import {
  buildC5CSelectedSession,
  projectC5CSelectorProvenance,
} from "./fixtures/c5c-selected-session.mjs";
import { buildC5C1DualCoreSession } from "./fixtures/c5c1-dual-core-session.mjs";

const MODULE_ID = "acquirerEnvironment";
const SCORING_MODULE_ID = "acquirer_environment";
const EXPECTED_CONTEXT_RULES = Object.freeze(["SR-01", "SR-05", "SR-06", "SR-07", "SR-08", "SR-09"]);
const EXPECTED_SCORING_FIELDS = Object.freeze([
  "scoringModelVersion",
  "environmentScores",
  "weightedEnvironmentScores",
  "rankedEnvironments",
  "rawRankedEnvironments",
  "signalCompositionShare",
  "supportStrengthByEnvironment",
  "primaryEnvironmentCode",
  "primarySignalEnvironmentCode",
  "primarySignalScore",
  "secondaryEnvironmentCode",
  "secondarySignalEnvironmentCode",
  "secondarySignalScore",
]);

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) value.forEach(deepFreeze);
  else Object.values(value).forEach(deepFreeze);
  return value;
}

function selectorBundle(session) {
  const selectorResult = selectCandidatePair({ session });
  assert.equal(selectorResult.status, "SELECTED");
  const selectorProvenance = projectC5CSelectorProvenance(selectorResult);
  const identityContext = {
    diagnosticId: session.sessionId,
    projectId: null,
    moduleId: MODULE_ID,
    candidatePair: selectorResult.candidatePair,
    candidatePairNormalized: selectorResult.candidatePairNormalized,
  };
  return { selectorResult, selectorProvenance, identityContext };
}

function singlePipeline(session = buildC5CSelectedSession()) {
  const selector = selectorBundle(session);
  const snapshot = assembleSingleR1Snapshot({
    session,
    identityContext: selector.identityContext,
    selectorProvenance: selector.selectorProvenance,
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
  const projection = projectProviderProjection(request);
  return { session, ...selector, snapshot, uncertainty, pack, request, projection };
}

function dualSnapshot(session) {
  const selector = selectorBundle(session);
  const assembled = assembleProductionDualAdjudicationInput({
    session,
    moduleId: SCORING_MODULE_ID,
    candidatePair: selector.selectorResult.candidatePair,
  });
  assert.equal(assembled.ok, true);
  const coreInput = Object.freeze({
    ...assembled.coreInput,
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
  });
  const coreOutput = compareDualRespondents(coreInput);
  return assembleEngineSnapshot({
    coreInput,
    coreOutput,
    identityContext: selector.identityContext,
    selectorProvenance: selector.selectorProvenance,
  });
}

function lawfulCandidate(fixture) {
  const qref = fixture.uncertainty.survivingEvidenceRefs[0];
  const factref = fixture.uncertainty.known[0].factRef;
  const mref = fixture.pack.selectedContextItems[0].contextRef;
  const uncertaintyId = fixture.uncertainty.items[0].uncertaintyId;
  const evidenceBasis = {
    supportBasis: "PRIMARY_COMPARABLE",
    conflictLevel: "NO_CONFLICTING_COMPARABLE_EVIDENCE",
    materialUnknownsPresent: true,
  };
  const hypothesis = (hypothesisId, statement) => ({
    hypothesisId,
    statement,
    evidenceBasis,
    decisiveEvidenceRefs: [qref],
    conflictingEvidenceRefs: [],
    contextRefs: [mref],
    requiresEngineFactNotEstablished: [],
  });
  return {
    interpretationStatus: "INTERPRETATION_CONSTRAINED",
    abstentionReason: null,
    interpretation: {
      hypotheses: {
        ordering: "CO_EQUAL",
        items: [
          hypothesis("H1", "One bounded R1 reading of the supplied evidence."),
          hypothesis("H2", "A co-equal alternative R1 reading of the supplied evidence."),
        ],
      },
      decisiveEvidence: [],
      conflictingEvidence: [],
      missingEvidence: [{
        statement: "Independent R2 comparison evidence is unavailable.",
        uncertaintyIds: [uncertaintyId],
      }],
      changeConditions: [],
      affectedResources: [],
      watchpoints: [],
    },
    uncertainty: {
      disclosures: [{
        uncertaintyId,
        affects: "DETAIL",
        clientStatement: "No independent R2 comparison occurred; this interpretation uses sealed R1 facts only.",
        unresolvedEngineFacts: [],
      }],
    },
    claims: [
      {
        claimId: "CL-1",
        claimType: "DETERMINISTIC_FACT",
        text: "The engine retained the sealed R1 outcome boundary.",
        refs: [factref],
        contextRefs: [],
      },
      {
        claimId: "CL-2",
        claimType: "DIRECT_EVIDENCE",
        text: "The R1 respondent supplied this observation.",
        refs: [qref],
        contextRefs: [],
      },
      {
        claimId: "CL-3",
        claimType: "BOUNDED_INTERPRETATION",
        text: "A bounded reading of the sealed R1 evidence remains possible.",
        refs: [qref],
        contextRefs: [mref],
      },
      {
        claimId: "CL-4",
        claimType: "UNCERTAINTY_DISCLOSURE",
        text: "No independent R2 comparison occurred.",
        refs: [`uref://${uncertaintyId}`],
        contextRefs: [],
      },
      {
        claimId: "CL-5",
        claimType: "SCOPE_LIMITATION_DISCLOSURE",
        text: "This constrained interpretation does not supply an R1-versus-R2 comparison.",
        refs: [],
        contextRefs: [],
      },
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

function resultForCandidate(fixture, candidate) {
  const validated = validateProviderSemanticCandidate(candidate, fixture.projection);
  return assembleAgentInterpretationResult({
    agentInterpretationRequest: fixture.request,
    providerExecutionOutput: deepFreeze({
      candidate: validated,
      executionMetadata: {
        provider: PROVIDER_ID_GEMINI,
        model: GEMINI_MODEL_ID,
        executedAt: "2026-08-29T00:00:00.000Z",
      },
    }),
  });
}

function cloneCandidate(candidate) {
  return structuredClone(candidate);
}

function expectProviderReject(candidate, projection) {
  assert.throws(
    () => validateProviderSemanticCandidate(candidate, projection),
    ProviderSemanticCandidateValidationError,
  );
}

async function expectSemanticFailure(fixture, candidate, semanticSubruleId, targetLocator) {
  const result = resultForCandidate(fixture, candidate);
  const judge = createMockSemanticJudge((check) => (
    check.semanticSubruleId === semanticSubruleId && check.targetLocator === targetLocator
      ? { verdict: "FAIL" }
      : { verdict: "PASS" }
  ));
  let caught = null;
  try {
    await validateAgentInterpretationSemantics({
      agentInterpretationRequest: fixture.request,
      agentInterpretationResult: result,
      semanticJudge: judge,
      maxChecksPerBatch: 32,
    });
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof SemanticViolationError, caught?.message ?? "semantic failure was not raised");
  assert.equal(caught.findings.some((row) => (
    row.semanticSubruleId === semanticSubruleId && row.targetLocator === targetLocator
  )), true);
}

async function runWithoutProviders(session, extra = {}) {
  const previousGemini = process.env.GEMINI_API_KEY;
  const previousXai = process.env.XAI_API_KEY;
  const previousFetch = globalThis.fetch;
  delete process.env.GEMINI_API_KEY;
  delete process.env.XAI_API_KEY;
  globalThis.fetch = async () => {
    throw new Error("offline SINGLE validator must not reach network");
  };
  try {
    return await runProductionInterpretation({ session, moduleId: MODULE_ID, ...extra });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousGemini;
    if (previousXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = previousXai;
  }
}

function incompleteInviteSession(base, kind) {
  const created = createAcquirerVerificationInvite(base, {
    createdAt: "2026-08-29T12:00:00.000Z",
    expiresAt: "2026-09-01T12:00:00.000Z",
    digitalCode: "654321",
    assessmentSessionId: base.sessionId,
    acquirerVerificationSessionId: `${base.sessionId}-r2-${kind}`,
  });
  assert.equal(created.ok, true);
  if (kind === "active") return created.session;
  return deepFreeze({
    ...created.session,
    acquirerVerificationInvite: {
      ...created.invite,
      ...(kind === "expired" ? { expiresAt: "2026-08-28T00:00:00.000Z" } : { revoked: true }),
    },
  });
}

function legacyCompletedSession() {
  const primary = buildC5CSelectedSession({ sessionId: "single-r1-legacy-completed" });
  const created = createAcquirerVerificationInvite(primary, {
    createdAt: "2026-08-29T12:00:00.000Z",
    expiresAt: "2026-09-01T12:00:00.000Z",
    digitalCode: "123456",
    assessmentSessionId: primary.sessionId,
    acquirerVerificationSessionId: "single-r1-legacy-r2",
  });
  assert.equal(created.ok, true);
  const completion = completeAcquirerVerificationInvite(
    created.invite,
    primary.acquirer2A.answers,
    "2026-08-29T12:05:00.000Z",
  );
  assert.equal(completion.ok, true);
  return attachAcquirerVerificationCompletion(created.session, completion.invite);
}

const checks = [];
async function check(id, label, fn) {
  await fn();
  checks.push({ id, label });
}

const baseSession = buildC5CSelectedSession({ sessionId: "single-r1-base" });
const base = singlePipeline(baseSession);
const baseCandidate = lawfulCandidate(base);

await check("P1", "SELECTED with no R2 invite routes to SINGLE_R1_ONLY", async () => {
  const result = await runWithoutProviders(baseSession);
  assert.equal(result.engineSnapshotDigest, base.snapshot.engineSnapshotDigest);
  assert.equal(result.failureClass, "PROVIDER_UNAVAILABLE");
});

await check("P2", "SELECTED with an active incomplete invite routes to SINGLE_R1_ONLY", async () => {
  const session = incompleteInviteSession(buildC5CSelectedSession({ sessionId: "single-r1-active" }), "active");
  const expected = singlePipeline(session);
  const result = await runWithoutProviders(session);
  assert.equal(result.engineSnapshotDigest, expected.snapshot.engineSnapshotDigest);
});

await check("P3", "expired and revoked incomplete invites with no R2 remain SINGLE_R1_ONLY", async () => {
  for (const kind of ["expired", "revoked"]) {
    const session = incompleteInviteSession(buildC5CSelectedSession({ sessionId: `single-r1-${kind}` }), kind);
    const expected = singlePipeline(session);
    const result = await runWithoutProviders(session);
    assert.equal(result.engineSnapshotDigest, expected.snapshot.engineSnapshotDigest, kind);
  }
});

await check("P4", "snapshot carries selector authority and the closed sealed R1 scoring projection", () => {
  assert.equal(base.snapshot.outcomeSource, "SINGLE_R1_ONLY");
  assert.equal(base.snapshot.selector.candidatePair, base.selectorResult.candidatePair);
  assert.deepEqual(Object.keys(base.snapshot.engine.r1Scoring), EXPECTED_SCORING_FIELDS);
  assert.equal(base.snapshot.engine.observations.length, 11);
  assert.equal(base.snapshot.engine.observations.every((row) => row.respondentSlot === "R1"), true);
  assert.equal(Object.hasOwn(base.snapshot.engine, "comparison"), false);
});

await check("P5", "selector pair and scorer primary remain separate lawful authorities", () => {
  const fixture = singlePipeline(buildC5CSelectedSession({
    sessionId: "single-r1-pair-primary-mismatch",
    candidatePair: "STJ/STP vs NT/STJ",
  }));
  assert.equal(fixture.snapshot.identity.candidatePair, "STJ/STP vs NT/STJ");
  assert.equal(fixture.snapshot.engine.r1Scoring.primaryEnvironmentCode, "NT/STJ");
  assert.notEqual(
    fixture.snapshot.identity.candidatePair.split(" vs ")[0],
    fixture.snapshot.engine.r1Scoring.primaryEnvironmentCode,
  );
});

await check("P6", "lawful SINGLE traverses the full offline component semantic chain", async () => {
  assert.deepEqual(
    [...new Set(base.pack.selectedContextItems.map((row) => row.relevance.selectionRuleId))],
    EXPECTED_CONTEXT_RULES,
  );
  const result = resultForCandidate(base, baseCandidate);
  const passed = await validateAgentInterpretationSemantics({
    agentInterpretationRequest: base.request,
    agentInterpretationResult: result,
    semanticJudge: createMockSemanticJudge(() => ({ verdict: "PASS" })),
    maxChecksPerBatch: 32,
  });
  assert.equal(passed, result);
});

await check("P7", "completed valid admissible R2 routes to DUAL_CORE", async () => {
  const session = buildC5C1DualCoreSession({ sessionId: "single-r1-p7-dual" });
  const expected = dualSnapshot(session);
  const result = await runWithoutProviders(session);
  assert.equal(expected.outcomeSource, "DUAL_CORE");
  assert.equal(result.engineSnapshotDigest, expected.engineSnapshotDigest);
});

await check("P8", "fresh composition after R2 completion no longer returns the prior SINGLE snapshot", async () => {
  const sessionId = "single-r1-fresh-route";
  const before = buildC5CSelectedSession({ sessionId });
  const singleDigest = singlePipeline(before).snapshot.engineSnapshotDigest;
  const after = buildC5C1DualCoreSession({ sessionId, verificationSessionId: `${sessionId}-r2` });
  const result = await runWithoutProviders(after);
  assert.notEqual(result.engineSnapshotDigest, singleDigest);
  assert.equal(result.engineSnapshotDigest, dualSnapshot(after).engineSnapshotDigest);
});

await check("P9", "CO_EQUAL hypotheses are structurally and semantically accepted", async () => {
  const result = resultForCandidate(base, baseCandidate);
  assert.equal(result.interpretation.hypotheses.ordering, "CO_EQUAL");
  assert.equal(result.interpretation.hypotheses.items.every((row) => !Object.hasOwn(row, "rank")), true);
  assert.equal(await validateAgentInterpretationSemantics({
    agentInterpretationRequest: base.request,
    agentInterpretationResult: result,
    semanticJudge: createMockSemanticJudge(() => ({ verdict: "PASS" })),
    maxChecksPerBatch: 32,
  }), result);
});

await check("N1", "stored R1 score mutation fails the canonical score seal", () => {
  const session = structuredClone(baseSession);
  session.acquirer2A.score.primarySignalScore += 1;
  assert.throws(() => assembleSingleR1Snapshot({
    session,
    identityContext: selectorBundle(session).identityContext,
    selectorProvenance: selectorBundle(session).selectorProvenance,
  }), /stored R1 score does not equal/);
});

await check("N2", "tampered stored primaryEnvironmentCode fails the canonical score seal", () => {
  const session = structuredClone(baseSession);
  session.acquirer2A.score.primaryEnvironmentCode = "NF/NT";
  const selector = selectorBundle(session);
  assert.throws(() => assembleSingleR1Snapshot({ session, ...selector }), /stored R1 score does not equal/);
});

await check("N3", "tampered selector pair fails snapshot binding", () => {
  const provenance = structuredClone(base.selectorProvenance);
  provenance.candidatePair = "NF/SFJ vs NF/NT";
  provenance.candidatePairNormalized = normalizeCandidatePair(provenance.candidatePair);
  assert.throws(() => assembleSingleR1Snapshot({
    session: baseSession,
    identityContext: base.identityContext,
    selectorProvenance: provenance,
  }), /selector candidatePair mismatch/);
});

await check("N4", "SINGLE composition rejects crossSideEnvironmentPair", async () => {
  await assert.rejects(() => runWithoutProviders(baseSession, {
    crossSideEnvironmentPair: { acquirerEnvironmentCode: "NT/STJ", targetEnvironmentCode: "NT/STP" },
  }), /SINGLE_R1_ONLY invocation carries forbidden cross-side context inputs/);
});

await check("N5", "direct SINGLE pack construction rejects crossSideEnvironmentPair", () => {
  assert.throws(() => buildInterpretationContextPack({
    engineSnapshot: base.snapshot,
    structuredUncertainty: base.uncertainty,
    crossSideEnvironmentPair: { acquirerEnvironmentCode: "NT/STJ", targetEnvironmentCode: "NT/STP" },
  }), /SINGLE_R1_ONLY forbids crossSideEnvironmentPair/);
});

await check("N6", "SINGLE composition rejects establishedEnvironmentCodes", async () => {
  await assert.rejects(() => runWithoutProviders(baseSession, {
    establishedEnvironmentCodes: ["NT/STJ"],
  }), /SINGLE_R1_ONLY invocation carries forbidden cross-side context inputs/);
});

await check("N7", "direct SINGLE pack construction rejects establishedEnvironmentCodes", () => {
  assert.throws(() => buildInterpretationContextPack({
    engineSnapshot: base.snapshot,
    structuredUncertainty: base.uncertainty,
    establishedEnvironmentCodes: ["NT/STJ"],
  }), /SINGLE_R1_ONLY forbids establishedEnvironmentCodes/);
});

await check("N8", "completed invalid R2 remains a non-Agent assembler block", async () => {
  const session = structuredClone(buildC5C1DualCoreSession({ sessionId: "single-r1-invalid-r2" }));
  session.acquirerVerification.answers = null;
  const result = await runWithoutProviders(session);
  assert.deepEqual(result, {
    ok: false,
    selectorStatus: "SELECTED",
    reason: "missing_r2_answers",
    stage: "r2_answers",
  });
});

await check("N9", "legacy completed R2 remains a non-Agent block", async () => {
  const session = legacyCompletedSession();
  const result = await runWithoutProviders(session);
  assert.deepEqual(result, {
    ok: false,
    selectorStatus: "SELECTED",
    reason: "legacy_r2_non_adjudicable",
    stage: "r2_context",
  });
});

await check("N10", "comparison injected into a SINGLE snapshot is rejected", () => {
  const snapshot = structuredClone(base.snapshot);
  snapshot.engine.comparison = {};
  assert.throws(() => buildStructuredUncertainty(snapshot), StructuredUncertaintyDerivationError);
});

await check("N11", "R2 observation injected into a SINGLE snapshot is rejected", () => {
  const snapshot = structuredClone(base.snapshot);
  snapshot.engine.observations[0].respondentSlot = "R2";
  snapshot.engine.observations[0].observationRef = snapshot.engine.observations[0].observationRef.replace(/\/R1$/, "/R2");
  assert.throws(() => buildStructuredUncertainty(snapshot), /observations must be R1-only/);
});

await check("N12", "R2 reference provenance is rejected at the provider candidate boundary", () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.claims[1].refs = [`qref://${baseSession.sessionId}/${MODULE_ID}/Q1/R2`];
  expectProviderReject(candidate, base.projection);
});

await check("N13", "wrong SINGLE interpretation status is rejected", () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.interpretationStatus = "INTERPRETATION_SUPPORTED";
  expectProviderReject(candidate, base.projection);
});

await check("N14", "missing mandatory no-R2 disclosure is rejected", () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.uncertainty.disclosures = [];
  expectProviderReject(candidate, base.projection);
});

await check("N14B", "weakened no-independent-R2 disclosure produces targeted S-3 failure", async () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.uncertainty.disclosures[0].clientStatement = "The available respondents independently confirmed one another.";
  await expectSemanticFailure(
    base,
    candidate,
    "V-35-SEM-SINGLE-DISCLOSURE",
    "uncertainty.disclosures[0].clientStatement",
  );
});

await check("N15", "agreement/divergence/corroboration meaning produces targeted S-1 failure", async () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.claims[2].text = "R1 and R2 corroborated one another and agreed on the comparison.";
  await expectSemanticFailure(base, candidate, "V-33-SEM-SINGLE-NO-R2-COMPARISON", "claims.CL-3.text");
});

await check("N16", "shadow scoring and reranking meaning produces targeted S-2 failure", async () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.claims[2].text = "A new weighted tally reranks the R1 environments and replaces the selector pair.";
  await expectSemanticFailure(base, candidate, "V-34-SEM-SINGLE-NO-SHADOW-SCORING", "claims.CL-3.text");
});

await check("N17", "mutation of R1 pair/environment/score meaning produces targeted S-4 failure", async () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.claims[0].text = "The sealed R1 primary Environment and score were different from the recorded facts.";
  await expectSemanticFailure(base, candidate, "V-36-SEM-SINGLE-R1-FACTS", "claims.CL-1.text");
});

function rankedCandidate(statement) {
  const candidate = cloneCandidate(baseCandidate);
  candidate.interpretation.hypotheses.ordering = "RANKED";
  candidate.interpretation.hypotheses.items[0].rank = 1;
  candidate.interpretation.hypotheses.items[1].rank = 2;
  candidate.interpretation.hypotheses.items[1].decisiveEvidenceRefs = [base.uncertainty.survivingEvidenceRefs[1]];
  candidate.interpretation.hypotheses.items[0].statement = statement;
  return candidate;
}

await check("N18", "automatic hypothesis rank based only on Engine score order is rejected", async () => {
  const candidate = rankedCandidate("This is rank one solely because the Engine primary score is higher.");
  await expectSemanticFailure(base, candidate, "V-34-SEM-SINGLE-NO-SHADOW-SCORING", "interpretation.hypotheses.items.H1.statement");
});

await check("N19", "RANKED without a defensible evidence differential is rejected while CO_EQUAL passed", () => {
  const candidate = cloneCandidate(baseCandidate);
  candidate.interpretation.hypotheses.ordering = "RANKED";
  candidate.interpretation.hypotheses.items[0].rank = 1;
  candidate.interpretation.hypotheses.items[1].rank = 2;
  expectProviderReject(candidate, base.projection);
});

await check("N20", "late completed valid R2 takes the fresh DUAL route and never reuses SINGLE", async () => {
  const sessionId = "single-r1-late-r2";
  const before = buildC5CSelectedSession({ sessionId });
  const singleDigest = singlePipeline(before).snapshot.engineSnapshotDigest;
  const after = buildC5C1DualCoreSession({ sessionId, verificationSessionId: `${sessionId}-r2` });
  const dual = dualSnapshot(after);
  const result = await runWithoutProviders(after);
  assert.equal(dual.outcomeSource, "DUAL_CORE");
  assert.equal(result.engineSnapshotDigest, dual.engineSnapshotDigest);
  assert.notEqual(result.engineSnapshotDigest, singleDigest);
});

console.log("Agent SINGLE R1 Snapshot cases passed:");
for (const row of checks) console.log(`  ${row.id}. ${row.label}: PASS`);
console.log(`PASS ${checks.length}/${checks.length}`);
