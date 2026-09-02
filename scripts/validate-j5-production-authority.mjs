import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

import { handleProductionInterpretationAction } from "../api/production-interpretation.ts";
import { readAssessmentSession } from "../src/server/_sessionLedger.ts";
import {
  DEAL_TYPE_OPTIONS,
  TRANSACTION_DETAIL_SECTIONS,
} from "../src/flow/acquirerTrackFlow.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
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

function targetSelfInput() {
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

export async function createReadyAssessment({ includeR2 = false, r2AnswerOverrides = {} } = {}) {
  const created = await action({ action: "CREATE_SESSION", projectId: null }, 201);
  const sessionId = created.body.sessionId;
  const fixture = buildC5CSelectedSession({ sessionId });
  await action({ action: "SAVE_DEAL_CONTEXT", sessionId, dealContext: fullDealContext() }, 200);
  await action({ action: "SAVE_R1", sessionId, answers: fixture.acquirer2A.answers }, 200);
  if (includeR2) {
    const r2Answers = structuredClone(fixture.acquirer2A.answers);
    for (const [questionId, selectedOption] of Object.entries(r2AnswerOverrides)) {
      assert.ok(r2Answers[questionId], `unknown R2 answer override ${questionId}`);
      r2Answers[questionId].selectedOption = selectedOption;
    }
    await action({ action: "SAVE_R2", sessionId, completed: true, answers: r2Answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: `r2-${sessionId}` }, 200);
  }
  const target = targetSelfInput();
  await action({ action: "SAVE_REPORT_INPUT", sessionId, completed: true, answers: target.answers, positioning: target.positioning, respondentId: `target-${sessionId}` }, 200);
  const executed = await action({ action: "EXECUTE", sessionId });
  return { sessionId, executed, fixture, target };
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
    ready = await createReadyAssessment();
    await check("PA-03", "raw R1 persistence increments server revision", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.ok(record.inputRevision >= 3);
      assert.ok(record.rawAssessment.r1.answers.Q1);
    });
    await check("PA-04", "raw R2 persistence increments revision", async () => {
      const before = await readAssessmentSession(ready.sessionId);
      const result = await action({ action: "SAVE_R2", sessionId: ready.sessionId, completed: true, answers: ready.fixture.acquirer2A.answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: `r2-${ready.sessionId}` }, 200);
      assert.equal(result.body.inputRevision, before.inputRevision + 1);
    });
    await check("PA-05", "report input mutation increments revision", async () => {
      const before = await readAssessmentSession(ready.sessionId);
      const result = await action({ action: "SAVE_REPORT_INPUT", sessionId: ready.sessionId, completed: true, answers: ready.target.answers, positioning: ready.target.positioning, respondentId: `target-${ready.sessionId}` }, 200);
      assert.equal(result.body.inputRevision, before.inputRevision + 1);
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
      const fixture = buildC5CSelectedSession({ sessionId: id });
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId: id, dealContext: fullDealContext() }, 200);
      await action({ action: "SAVE_R1", sessionId: id, answers: fixture.acquirer2A.answers }, 200);
      await action({ action: "SAVE_R2", sessionId: id, completed: true, answers: fixture.acquirer2A.answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: `r2-${id}` }, 200);
      const target = targetSelfInput();
      await action({ action: "SAVE_REPORT_INPUT", sessionId: id, completed: true, answers: target.answers, positioning: target.positioning, respondentId: `target-${id}` }, 200);
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
      await action({ action: "SAVE_R1", sessionId: stale.sessionId, answers: stale.fixture.acquirer2A.answers }, 200);
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
      await action({ action: "SAVE_R2", sessionId: singleToDual.sessionId, completed: true, answers: singleToDual.fixture.acquirer2A.answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: `r2-${singleToDual.sessionId}` }, 200);
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
      const fixture = buildC5CSelectedSession({ sessionId });
      const r2Answers = structuredClone(fixture.acquirer2A.answers);
      r2Answers.Q7.selectedOption = "A";
      await action({ action: "SAVE_DEAL_CONTEXT", sessionId, dealContext: fullDealContext() }, 200);
      await action({ action: "SAVE_R1", sessionId, answers: fixture.acquirer2A.answers }, 200);
      await action({ action: "SAVE_R2", sessionId, completed: true, answers: r2Answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: `r2-${sessionId}` }, 200);
      const target = targetSelfInput();
      await action({ action: "SAVE_REPORT_INPUT", sessionId, completed: true, answers: target.answers, positioning: target.positioning, respondentId: `target-${sessionId}` }, 200);
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
    console.log(`J5 PRODUCTION AUTHORITY PASS ${checks.length}/${checks.length}`);
  } finally {
    providers.restore();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runValidator();
}
