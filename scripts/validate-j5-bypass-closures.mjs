import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import finalReportHandler from "../api/final-report.ts";
import { handleProductionInterpretationAction } from "../api/production-interpretation.ts";
import {
  buildCrossSideStructuralDifferentiation,
  CrossSideStructuralDifferentiationConfigError,
} from "../src/flow/crossSideStructuralDifferentiation.js";
import { readAssessmentSession } from "../src/server/_sessionLedger.ts";
import {
  createInputSession,
  createReadyAssessment,
  installMockExternalProviders,
  legacyOrderSensitiveDigest,
  reorderKeys,
  replaceStoredDigestValue,
  replaceStoredDigestWithLegacy,
  targetSelfInput,
} from "./validate-j5-production-authority.mjs";

const checks = [];

async function check(id, label, fn) {
  await fn();
  checks.push(id);
  console.log(`PASS ${id} ${label}`);
}

async function productionAction(body, expectedStatus = null) {
  const result = await handleProductionInterpretationAction(body);
  if (expectedStatus !== null) assert.equal(result.statusCode, expectedStatus, JSON.stringify(result.body));
  return result;
}

async function invokeFinalReport(action, body) {
  const headers = new Map();
  let ended;
  const response = {
    statusCode: 200,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); },
    end(value) { ended = value; },
  };
  await finalReportHandler({
    method: "POST",
    url: `https://mergevue.test/api/final-report?action=${action}`,
    body,
  }, response);
  const contentType = headers.get("content-type") ?? "";
  return {
    statusCode: response.statusCode,
    headers,
    rawBody: ended,
    body: contentType.includes("application/json") ? JSON.parse(String(ended)) : ended,
  };
}

function observation(questionId, selectedOption, overrides = {}) {
  return {
    workbookQuestionId: questionId,
    respondentSlot: "R1",
    respondentId: "respondent-1",
    selectedOption,
    missing: false,
    excludedFromPrimaryScoring: false,
    primaryExclusionReasons: [],
    ...overrides,
  };
}

function rowAt(result, questionId) {
  return result.rows.find((row) => row.questionId === questionId);
}

function projection(acquirer, target, questionId = "Q1") {
  return rowAt(buildCrossSideStructuralDifferentiation(acquirer, target), questionId);
}

async function runMultiRespondentCases() {
  const targetB = [observation("Q1", "B")];

  await check("MR-01", "R1 B plus R2 B projects canonical AEM B", async () => {
    const row = projection([observation("Q1", "B"), observation("Q1", "B", { respondentSlot: "R2" })], targetB);
    assert.equal(row.acquirerSelectedOption, "B");
    assert.equal(row.comparisonStatus, "aligned");
  });
  await check("MR-02", "lawful divergent B plus C is unresolved", async () => {
    const row = projection([observation("Q1", "B"), observation("Q1", "C", { respondentSlot: "R2" })], targetB);
    assert.equal(row.acquirerSelectedOption, null);
    assert.equal(row.comparisonStatus, "not_comparable");
  });
  await check("MR-03", "excluded R2 cannot displace lawful R1", async () => {
    const row = projection([observation("Q1", "B"), observation("Q1", "C", { respondentSlot: "R2", excludedFromPrimaryScoring: true })], targetB);
    assert.equal(row.acquirerSelectedOption, "B");
  });
  await check("MR-04", "excluded R1 leaves lawful R2 canonical", async () => {
    const row = projection([observation("Q1", "B", { excludedFromPrimaryScoring: true }), observation("Q1", "C", { respondentSlot: "R2" })], targetB);
    assert.equal(row.acquirerSelectedOption, "C");
  });
  await check("MR-05", "two excluded observations are unresolved", async () => {
    const row = projection([observation("Q1", "B", { excludedFromPrimaryScoring: true }), observation("Q1", "C", { respondentSlot: "R2", excludedFromPrimaryScoring: true })], targetB);
    assert.equal(row.acquirerSelectedOption, null);
    assert.equal(row.comparisonStatus, "not_comparable");
  });
  await check("MR-06", "missing plus lawful projects the lawful value", async () => {
    const row = projection([observation("Q1", "B", { missing: true }), observation("Q1", "C", { respondentSlot: "R2" })], targetB);
    assert.equal(row.acquirerSelectedOption, "C");
  });
  await check("MR-07", "two missing observations are unresolved", async () => {
    const row = projection([observation("Q1", "B", { missing: true }), observation("Q1", "C", { respondentSlot: "R2", missing: true })], targetB);
    assert.equal(row.acquirerSelectedOption, null);
  });
  await check("MR-08", "E or F is lawful only through existing option semantics", async () => {
    const q6e = projection([observation("Q6", "E")], [observation("Q6", "A")], "Q6");
    const q6f = projection([observation("Q6", "F")], [observation("Q6", "A")], "Q6");
    assert.equal(q6e.acquirerSelectedOption, "E");
    assert.equal(q6e.comparisonStatus, "divergent");
    assert.equal(q6f.acquirerSelectedOption, null);
  });
  await check("MR-09", "non-comparable E or F never becomes canonical", async () => {
    assert.equal(projection([observation("Q1", "E")], targetB).acquirerSelectedOption, null);
    assert.equal(projection([observation("Q1", "F")], targetB).acquirerSelectedOption, null);
  });
  await check("MR-10", "duplicate identical lawful values are not an error", async () => {
    assert.doesNotThrow(() => projection([observation("Q1", "B"), observation("Q1", "B")], targetB));
  });
  await check("MR-11", "duplicate divergent lawful values choose neither respondent", async () => {
    assert.equal(projection([observation("Q1", "B"), observation("Q1", "C")], targetB).acquirerSelectedOption, null);
  });
  await check("MR-12", "duplicate TSAM response still fails closed", async () => {
    assert.throws(
      () => buildCrossSideStructuralDifferentiation([observation("Q1", "B")], [observation("Q1", "B"), observation("Q1", "B")]),
      CrossSideStructuralDifferentiationConfigError,
    );
  });
  await check("MR-13", "historical single-respondent AEM remains unchanged", async () => {
    const row = projection([observation("Q1", "B")], targetB);
    assert.equal(row.acquirerSelectedOption, "B");
    assert.equal(row.comparisonStatus, "aligned");
  });
  await check("MR-14", "unresolved AEM dimensions are excluded from summary counts", async () => {
    const acquirer = [];
    const target = [];
    for (let index = 1; index <= 11; index += 1) {
      const questionId = `Q${index}`;
      acquirer.push(observation(questionId, "A"));
      target.push(observation(questionId, "A"));
    }
    acquirer.push(observation("Q1", "B", { respondentSlot: "R2" }));
    const result = buildCrossSideStructuralDifferentiation(acquirer, target);
    assert.equal(result.comparableCount, 10);
    assert.equal(result.agreeCount, 10);
    assert.equal(result.divergeCount, 0);
    assert.equal(result.agreeCount + result.divergeCount, result.comparableCount);
  });
}

export async function runValidator() {
  const providers = installMockExternalProviders();
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const originalFetch = globalThis.fetch;
  const priorEnv = {
    pdfUrl: process.env.PDF_RENDER_SERVICE_URL,
    pdfKey: process.env.PDF_RENDER_API_KEY,
    resendKey: process.env.RESEND_API_KEY,
    reportFrom: process.env.REPORT_FROM_EMAIL,
    hiddenTo: process.env.REPORT_HIDDEN_COPY_TO,
  };
  const providerCalls = { pdf: [], email: [] };
  const pdf = Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(10_500, 0x20), Buffer.from("\n%%EOF")]);

  process.env.PDF_RENDER_SERVICE_URL = "https://pdf.test/render";
  process.env.PDF_RENDER_API_KEY = "j5-pdf-key";
  process.env.RESEND_API_KEY = "j5-resend-key";
  process.env.REPORT_FROM_EMAIL = "report@mergevue.test";
  process.env.REPORT_HIDDEN_COPY_TO = "audit@mergevue.test";
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target === "https://pdf.test/render") {
      providerCalls.pdf.push(JSON.parse(String(options.body)));
      return new Response(pdf, { status: 200, headers: { "content-type": "application/pdf" } });
    }
    if (target === "https://api.resend.com/emails") {
      providerCalls.email.push(JSON.parse(String(options.body)));
      return new Response(JSON.stringify({ id: `email-${providerCalls.email.length}` }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return originalFetch(url, options);
  };

  try {
    await runMultiRespondentCases();
    const ready = await createReadyAssessment();
    assert.equal(ready.executed.body.status, "report-ready", JSON.stringify(ready.executed.body));
    const authorityId = ready.executed.body.authorityId;

    await check("BC-01", "direct result route cannot rely on local ready state", async () => {
      const start = appSource.indexOf("function FinalDeliverablesScreen");
      const end = appSource.indexOf("function App", start);
      const finalScreen = appSource.slice(start, end);
      assert.ok(start >= 0 && end > start);
      assert.ok(finalScreen.includes('action: "STATUS"'));
      assert.ok(finalScreen.includes('authorityState.status !== "report-ready"'));
      assert.equal(finalScreen.includes("buildFinalDeliverable("), false);
    });
    await check("BC-02", "no current authority cannot produce a successful report", async () => {
      const created = await productionAction({ action: "CREATE_SESSION", projectId: null }, 201);
      const status = await productionAction({ action: "STATUS", sessionId: created.body.sessionId }, 409);
      assert.equal(status.body.reportReady, false);
    });
    await check("BC-03", "stale authority is blocked", async () => {
      const stale = await productionAction({ action: "STATUS", sessionId: ready.sessionId, authorityId: "auth-00000000-0000-4000-8000-000000000000" }, 409);
      assert.equal(stale.body.status, "stale-authority");
    });
    await check("BC-04", "forged reportReady input is rejected", async () => {
      const result = await productionAction({ action: "EXECUTE", sessionId: ready.sessionId, reportReady: true }, 400);
      assert.equal(result.body.status, "invalid-request");
    });
    await check("BC-05", "forged snapshot digest is rejected", async () => {
      const result = await productionAction({ action: "EXECUTE", sessionId: ready.sessionId, engineSnapshotDigest: `sha256:${"a".repeat(64)}` }, 400);
      assert.equal(result.body.status, "invalid-request");
    });
    await check("BC-06", "forged Agent result is rejected", async () => {
      const result = await productionAction({ action: "EXECUTE", sessionId: ready.sessionId, result: { interpretationStatus: "INTERPRETATION_SUPPORTED" } }, 400);
      assert.equal(result.body.status, "invalid-request");
    });
    await check("BC-07", "client PDF artifact is rejected", async () => {
      const result = await invokeFinalReport("download-final-report", { sessionId: ready.sessionId, authorityId, pdfBase64: "JVBERi0x" });
      assert.equal(result.statusCode, 400);
      assert.equal(result.body.status, "invalid-request");
    });
    await check("BC-08", "final report without current authority is rejected", async () => {
      const created = await productionAction({ action: "CREATE_SESSION", projectId: null }, 201);
      const result = await invokeFinalReport("download-final-report", { sessionId: created.body.sessionId, authorityId: "auth-00000000-0000-4000-8000-000000000000" });
      assert.equal(result.statusCode, 409);
      assert.equal(result.body.status, "stale-authority");
    });
    await check("BC-09", "final report rejects stale authority", async () => {
      const result = await invokeFinalReport("download-final-report", { sessionId: ready.sessionId, authorityId: "auth-00000000-0000-4000-8000-000000000000" });
      assert.equal(result.statusCode, 409);
      assert.equal(result.body.status, "stale-authority");
    });
    await check("BC-10", "old SINGLE authority is rejected immediately after R2 mutation", async () => {
      const transition = await createReadyAssessment();
      const oldAuthorityId = transition.executed.body.authorityId;
      await productionAction({ action: "SAVE_R2", sessionId: transition.sessionId, mutationCapability: transition.capabilities.r2, completed: true, answers: transition.fixture.acquirer2A.answers, respondentContext: { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" }, respondentId: transition.capabilities.r2RespondentId }, 200);
      const status = await productionAction({ action: "STATUS", sessionId: transition.sessionId, authorityId: oldAuthorityId }, 409);
      const report = await invokeFinalReport("download-final-report", { sessionId: transition.sessionId, authorityId: oldAuthorityId });
      assert.equal(status.body.reportReady, false);
      assert.equal(report.statusCode, 409);
    });
    await check("BC-11", "API failure has no local report fallback", async () => {
      assert.match(appSource, /\.catch\(\(error\) => \{[\s\S]*?serverReportProjection: null,[\s\S]*?\}\);/);
      assert.ok(appSource.includes('if (authorityState.status !== "report-ready" || !authorityState.projection)'));
    });
    await check("BC-12", "unknown session cannot unlock report", async () => {
      const sessionId = "asmt-00000000-0000-4000-8000-000000000000";
      const status = await productionAction({ action: "STATUS", sessionId }, 404);
      const report = await invokeFinalReport("download-final-report", { sessionId, authorityId: "auth-00000000-0000-4000-8000-000000000000" });
      assert.equal(status.body.status, "unknown-session");
      assert.equal(report.statusCode, 404);
    });
    await check("BC-13", "hidden audit is reconstructed from server projection", async () => {
      const forged = await invokeFinalReport("send-final-report-hidden-copy", { sessionId: ready.sessionId, authorityId, session: { acquirerName: "forged-client" } });
      assert.equal(forged.statusCode, 400);
      const sent = await invokeFinalReport("send-final-report-hidden-copy", { sessionId: ready.sessionId, authorityId });
      assert.equal(sent.statusCode, 200, JSON.stringify(sent.body));
      const outbound = providerCalls.email.at(-1);
      const auditAttachment = outbound.attachments.find((item) => item.filename === "mergevue-hidden-user-answers.json");
      assert.ok(auditAttachment);
      const auditJson = Buffer.from(auditAttachment.content, "base64").toString("utf8");
      assert.ok(auditJson.includes(ready.sessionId));
      assert.equal(auditJson.includes("forged-client"), false);
    });
    await check("BC-14", "PDF and e-mail consume the server authority record", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      const rejected = await invokeFinalReport("send-final-report", { sessionId: ready.sessionId, authorityId, recipientEmail: "owner@example.com", firstName: "Owner", html: "forged" });
      assert.equal(rejected.statusCode, 400);
      const sent = await invokeFinalReport("send-final-report", { sessionId: ready.sessionId, authorityId, recipientEmail: "owner@example.com", firstName: "Owner" });
      assert.equal(sent.statusCode, 200, JSON.stringify(sent.body));
      assert.equal(providerCalls.pdf.at(-1).html, record.reportAuthority.projection.html);
      const outbound = providerCalls.email.at(-1);
      assert.equal(outbound.attachments[0].content, pdf.toString("base64"));
      assert.ok(outbound.text.includes(authorityId));
    });
    await check("BC-15", "current authority and matching revision allow intended flow", async () => {
      const status = await productionAction({ action: "STATUS", sessionId: ready.sessionId, authorityId }, 200);
      const download = await invokeFinalReport("download-final-report", { sessionId: ready.sessionId, authorityId });
      assert.equal(status.body.reportReady, true);
      assert.equal(status.body.mutationCapability, undefined, "STATUS must not expose mutation capabilities");
      assert.equal(status.body.r2MutationCapability, undefined, "STATUS must not expose R2 mutation capabilities");
      assert.equal(status.body.targetMutationCapability, undefined, "STATUS must not expose Target mutation capabilities");
      assert.equal(download.statusCode, 200);
      assert.equal(download.headers.get("content-type"), "application/pdf");
      assert.deepEqual(download.body, pdf);
    });

    await check("BC-16", "sessionId-only SAVE is a bypass attempt and changes nothing", async () => {
      const before = await readAssessmentSession(ready.sessionId);
      const rejected = await productionAction({ action: "SAVE_R1", sessionId: ready.sessionId, answers: ready.fixture.acquirer2A.answers }, 403);
      assert.equal(rejected.body.status, "forbidden-capability");
      const after = await readAssessmentSession(ready.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "rejected write must not bump inputRevision");
      assert.equal(after.reportAuthority.authorityId, before.reportAuthority.authorityId, "rejected write must not invalidate current report authority");
      const status = await productionAction({ action: "STATUS", sessionId: ready.sessionId, authorityId }, 200);
      assert.equal(status.body.reportReady, true);
    });
    await check("BC-17", "missing or client-derived capability fails closed", async () => {
      const base = await createInputSession();
      const forged = `mvc_${"f".repeat(64)}`;
      const r1Payload = (capability) => ({ action: "SAVE_R1", sessionId: base.sessionId, ...(capability === undefined ? {} : { mutationCapability: capability }), answers: base.fixture.acquirer2A.answers });
      const missing = await productionAction(r1Payload(undefined), 403);
      assert.equal(missing.body.status, "forbidden-capability");
      const random = await productionAction(r1Payload(forged), 403);
      assert.equal(random.body.status, "forbidden-capability");
      const garbage = await productionAction(r1Payload("client-forged"), 403);
      assert.equal(garbage.body.status, "forbidden-capability");
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.inputRevision, 2, "no forged capability may mutate canonical state");
    });
    await check("BC-18", "wrong-role capability fails closed", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      const wrongDeal = await productionAction({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, dealContext: { acquirerName: "wrong-role-probe" } }, 403);
      assert.equal(wrongDeal.body.status, "forbidden-capability");
      const wrongR1 = await productionAction({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.target, answers: base.fixture.acquirer2A.answers }, 403);
      assert.equal(wrongR1.body.status, "forbidden-capability");
      const wrongR2 = await productionAction({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: base.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: base.capabilities.targetRespondentId }, 403);
      assert.equal(wrongR2.body.status, "forbidden-capability");
      const wrongReport = await productionAction({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: target.answers, positioning: target.positioning, respondentId: base.capabilities.r2RespondentId }, 403);
      assert.equal(wrongReport.body.status, "forbidden-capability");
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.inputRevision, 2);
      assert.equal(record.rawAssessment.r2, null);
      assert.equal(record.rawAssessment.targetSelf, null);
    });
    await check("BC-19", "cross-session capability substitution fails closed", async () => {
      const sessionA = await createInputSession();
      const sessionB = await createInputSession();
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      const crossR2 = await productionAction({ action: "SAVE_R2", sessionId: sessionB.sessionId, mutationCapability: sessionA.capabilities.r2, completed: true, answers: sessionB.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: sessionA.capabilities.r2RespondentId }, 403);
      assert.equal(crossR2.body.status, "forbidden-capability");
      const crossOwner = await productionAction({ action: "SAVE_R1", sessionId: sessionB.sessionId, mutationCapability: sessionA.capabilities.owner, answers: sessionB.fixture.acquirer2A.answers }, 403);
      assert.equal(crossOwner.body.status, "forbidden-capability");
      const recordB = await readAssessmentSession(sessionB.sessionId);
      assert.equal(recordB.inputRevision, 2);
      assert.equal(recordB.rawAssessment.r2, null);
    });
    await check("BC-20", "alien respondent identity fails closed", async () => {
      const base = await createInputSession();
      const target = targetSelfInput();
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      const alienR2 = await productionAction({ action: "SAVE_R2", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, completed: true, answers: base.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: "alien-respondent" }, 403);
      assert.equal(alienR2.body.status, "forbidden-capability");
      const alienTarget = await productionAction({ action: "SAVE_REPORT_INPUT", sessionId: base.sessionId, mutationCapability: base.capabilities.target, completed: true, answers: target.answers, positioning: target.positioning, respondentId: "alien-respondent" }, 403);
      assert.equal(alienTarget.body.status, "forbidden-capability");
      const record = await readAssessmentSession(base.sessionId);
      assert.equal(record.inputRevision, 2);
      assert.equal(record.rawAssessment.r2, null);
      assert.equal(record.rawAssessment.targetSelf, null);
    });
    await check("BC-21", "consumed capability cannot mutate again and cannot corrupt authority", async () => {
      const session = await createReadyAssessment();
      const oldAuthorityId = session.executed.body.authorityId;
      const before = await readAssessmentSession(session.sessionId);
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      const r2Body = (answers) => ({ action: "SAVE_R2", sessionId: session.sessionId, mutationCapability: session.capabilities.r2, completed: true, answers, respondentContext: r2Context, respondentId: session.capabilities.r2RespondentId });
      await productionAction(r2Body(session.fixture.acquirer2A.answers), 200);
      const afterFirst = await readAssessmentSession(session.sessionId);
      assert.equal(afterFirst.inputRevision, before.inputRevision + 1);
      const altered = structuredClone(session.fixture.acquirer2A.answers);
      altered.Q7.selectedOption = "A";
      const consumed = await productionAction(r2Body(altered), 410);
      assert.equal(consumed.body.status, "capability-gone");
      const afterReject = await readAssessmentSession(session.sessionId);
      assert.equal(afterReject.inputRevision, afterFirst.inputRevision, "consumed capability cannot bump revision");
      assert.equal(afterReject.rawAssessment.r2.answers.Q7.selectedOption, "B", "rejected payload must not change canonical R2 evidence");
      const status = await productionAction({ action: "STATUS", sessionId: session.sessionId, authorityId: oldAuthorityId }, 409);
      assert.notEqual(status.body.status, "report-ready");
    });
    await check("BC-22", "alternate request shapes do not bypass capability enforcement", async () => {
      const base = await createInputSession();
      await productionAction({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: base.fixture.acquirer2A.answers, result: {} }, 400);
      await productionAction({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: { token: base.capabilities.owner }, answers: base.fixture.acquirer2A.answers }, 400);
      await productionAction({ action: "EXECUTE", sessionId: base.sessionId, mutationCapability: base.capabilities.owner }, 400);
      const mintMissing = await productionAction({ action: "MINT_INVITE_CAPABILITY", sessionId: base.sessionId, role: "R2" }, 403);
      assert.equal(mintMissing.body.status, "forbidden-capability");
      const mintWrongRole = await productionAction({ action: "MINT_INVITE_CAPABILITY", sessionId: base.sessionId, mutationCapability: base.capabilities.r2, role: "R2" }, 403);
      assert.equal(mintWrongRole.body.status, "forbidden-capability");
      const mintRandom = await productionAction({ action: "MINT_INVITE_CAPABILITY", sessionId: base.sessionId, mutationCapability: `mvc_${"e".repeat(64)}`, role: "R2" }, 403);
      assert.equal(mintRandom.body.status, "forbidden-capability");
    });
    await check("BC-23", "lawful OWNER re-mint revokes the prior unused capability", async () => {
      const session = await createReadyAssessment();
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      const minted = await productionAction({ action: "MINT_INVITE_CAPABILITY", sessionId: session.sessionId, mutationCapability: session.capabilities.owner, role: "R2" }, 201);
      assert.equal(minted.body.status, "invite-capability-minted");
      assert.match(minted.body.mutationCapability, /^mvc_[0-9a-f]{64}$/);
      assert.notEqual(minted.body.respondentId, session.capabilities.r2RespondentId);
      const revokedUse = await productionAction({ action: "SAVE_R2", sessionId: session.sessionId, mutationCapability: session.capabilities.r2, completed: true, answers: session.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: session.capabilities.r2RespondentId }, 410);
      assert.equal(revokedUse.body.status, "capability-gone");
      const before = await readAssessmentSession(session.sessionId);
      const saved = await productionAction({ action: "SAVE_R2", sessionId: session.sessionId, mutationCapability: minted.body.mutationCapability, completed: true, answers: session.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: minted.body.respondentId }, 200);
      assert.equal(saved.body.inputRevision, before.inputRevision + 1);
      const targetReMint = await productionAction({ action: "MINT_INVITE_CAPABILITY", sessionId: session.sessionId, mutationCapability: session.capabilities.owner, role: "TARGET" }, 410);
      assert.equal(targetReMint.body.status, "capability-gone");
    });
    await check("BC-24", "raw mutation capabilities never reach report delivery surfaces", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      const surfaces = [
        JSON.stringify(ready.executed.body),
        JSON.stringify(record.reportAuthority.projection),
        JSON.stringify(providerCalls),
      ];
      for (const surface of surfaces) {
        assert.equal(/mvc_[0-9a-f]{64}/.test(surface), false, "raw capability token found in a protected surface");
      }
      const auditJsons = providerCalls.email.flatMap((email) => (email.attachments ?? []))
        .filter((item) => item.filename === "mergevue-hidden-user-answers.json")
        .map((item) => Buffer.from(item.content, "base64").toString("utf8"));
      assert.ok(auditJsons.length > 0, "hidden audit delivery must have occurred");
      for (const auditJson of auditJsons) {
        assert.equal(/mvc_[0-9a-f]{64}/.test(auditJson), false, "hidden audit must not carry raw mutation capabilities");
      }
    });
    await check("BC-25", "order-sensitive mutation serialization would be detected", async () => {
      const session = await createReadyAssessment();
      const before = await readAssessmentSession(session.sessionId);
      const reordered = await productionAction({ action: "SAVE_R1", sessionId: session.sessionId, mutationCapability: session.capabilities.owner, answers: reorderKeys(session.fixture.acquirer2A.answers) }, 200);
      assert.equal(reordered.body.inputRevision, before.inputRevision, "nested reordered R1 answers must be the same semantic payload");
      const after = await readAssessmentSession(session.sessionId);
      assert.equal(after.reportAuthority.authorityId, before.reportAuthority.authorityId, "reordered retry must preserve current authority");
      const r2base = await createInputSession();
      const r2Context = { firmTenure: "more_than_3_years", respondentSeniority: "c_suite_founder", respondentRole: "deal_lead" };
      await productionAction({ action: "SAVE_R2", sessionId: r2base.sessionId, mutationCapability: r2base.capabilities.r2, completed: true, answers: r2base.fixture.acquirer2A.answers, respondentContext: r2Context, respondentId: r2base.capabilities.r2RespondentId }, 200);
      const r2Reordered = await productionAction({ action: "SAVE_R2", sessionId: r2base.sessionId, mutationCapability: r2base.capabilities.r2, completed: true, answers: reorderKeys(r2base.fixture.acquirer2A.answers), respondentContext: reorderKeys(r2Context), respondentId: r2base.capabilities.r2RespondentId }, 200);
      assert.equal(r2Reordered.body.status, "input-saved", "reordered R2 payload must remain the accepted semantic payload");
    });

    await check("BC-MR-01", "browser cannot choose a favorable letter from divergent R1 and R2", async () => {
      const row = projection([observation("Q1", "B"), observation("Q1", "C", { respondentSlot: "R2" })], targetB());
      assert.equal(row.acquirerSelectedOption, null);
    });
    await check("BC-MR-02", "respondent order cannot change unresolved projection", async () => {
      const r1 = observation("Q1", "B", { respondentSlot: "R1" });
      const r2 = observation("Q1", "C", { respondentSlot: "R2" });
      assert.deepEqual(projection([r1, r2], targetB()), projection([r2, r1], targetB()));
    });
    await check("BC-MR-03", "respondentSlot labels create no priority", async () => {
      const first = projection([observation("Q1", "B", { respondentSlot: "R9" }), observation("Q1", "C", { respondentSlot: "R0" })], targetB());
      assert.equal(first.acquirerSelectedOption, null);
    });
    await check("BC-MR-04", "excluded observation cannot override sole lawful observation", async () => {
      const row = projection([observation("Q1", "B"), observation("Q1", "C", { excludedFromPrimaryScoring: true })], targetB());
      assert.equal(row.acquirerSelectedOption, "B");
    });
    await check("BC-MR-05", "DUAL projection succeeds without erasing Agent divergence semantics", async () => {
      const dual = await createReadyAssessment({ includeR2: true, r2AnswerOverrides: { Q7: "A" } });
      assert.equal(dual.executed.body.status, "report-ready", JSON.stringify(dual.executed.body));
      const record = await readAssessmentSession(dual.sessionId);
      assert.equal(record.interpretationAuthority.outcomeSource, "DUAL_CORE");
      assert.equal(record.rawAssessment.r1.answers.Q7.selectedOption, "B");
      assert.equal(record.rawAssessment.r2.answers.Q7.selectedOption, "A");
      const q7 = rowAt(dual.executed.body.projection.deliverable.withinEnvironmentDifferentiation, "Q7");
      assert.equal(q7.acquirerSelectedOption, null);
      assert.equal(q7.comparisonStatus, "not_comparable");
      const agentSemantics = JSON.stringify(record.interpretationAuthority.result);
      assert.match(agentSemantics, /\/R1/);
      assert.match(agentSemantics, /\/R2/);
    });

    await check("BC-26", "legacy digest compatibility never reopens capability bypasses", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      const acceptedDeal = before.rawAssessment.dealContext;
      await replaceStoredDigestWithLegacy(base.sessionId, "OWNER", "SAVE_DEAL_CONTEXT", acceptedDeal);
      const retry = (extra) => productionAction({ action: "SAVE_DEAL_CONTEXT", sessionId: base.sessionId, dealContext: reorderKeys(acceptedDeal), ...extra }, 403);
      const missing = await retry({});
      assert.equal(missing.body.status, "forbidden-capability");
      const forged = await retry({ mutationCapability: `mvc_${"b".repeat(64)}` });
      assert.equal(forged.body.status, "forbidden-capability");
      const wrongRole = await retry({ mutationCapability: base.capabilities.r2 });
      assert.equal(wrongRole.body.status, "forbidden-capability");
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "no bypass attempt may mutate state");
      const ownerCapability = after.mutationCapabilities.find((capability) => capability.role === "OWNER");
      assert.equal(ownerCapability.acceptedPayloadDigestByAction.SAVE_DEAL_CONTEXT, legacyOrderSensitiveDigest("SAVE_DEAL_CONTEXT", acceptedDeal), "rejected bypass attempts must not upgrade the legacy digest");
    });
    await check("BC-27", "unknown digest version fails closed and never becomes a new baseline", async () => {
      const base = await createInputSession();
      const before = await readAssessmentSession(base.sessionId);
      await replaceStoredDigestValue(base.sessionId, "OWNER", "SAVE_R1", "v8:abcdef");
      const altered = structuredClone(base.fixture.acquirer2A.answers);
      altered.Q1.selectedOption = "A";
      await assert.rejects(
        () => productionAction({ action: "SAVE_R1", sessionId: base.sessionId, mutationCapability: base.capabilities.owner, answers: altered }),
        (error) => error?.name === "SessionLedgerStorageError" && error.status === "unknown-digest-version",
      );
      const after = await readAssessmentSession(base.sessionId);
      assert.equal(after.inputRevision, before.inputRevision, "unknown digest version must not accept a new baseline");
      assert.equal(after.rawAssessment.r1.answers.Q1.selectedOption, before.rawAssessment.r1.answers.Q1.selectedOption, "canonical state unchanged");
    });
    await check("BC-28", "digest internals never enter client projections", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      const ownerCapability = record.mutationCapabilities.find((capability) => capability.role === "OWNER");
      const storedDigest = ownerCapability.acceptedPayloadDigestByAction.SAVE_R1;
      assert.match(storedDigest, /^v2:[a-f0-9]{64}$/i, "precondition: CURRENT versioned digest stored server-side");
      const status = await productionAction({ action: "STATUS", sessionId: ready.sessionId, authorityId }, 200);
      for (const surface of [JSON.stringify(ready.executed.body), JSON.stringify(status.body)]) {
        assert.equal(surface.includes(storedDigest), false, "stored digest must not reach client surfaces");
        assert.equal(surface.includes(storedDigest.slice(3)), false, "stored digest hash must not reach client surfaces");
      }
    });

    await check("BC-29", "storage CAS generation token never enters client surfaces", async () => {
      const record = await readAssessmentSession(ready.sessionId);
      assert.ok(Number.isInteger(record.storageRevision) && record.storageRevision >= 0, "server record must carry storage generation");
      const created = await productionAction({ action: "CREATE_SESSION", projectId: null }, 201);
      const status = await productionAction({ action: "STATUS", sessionId: ready.sessionId, authorityId }, 200);
      const surfaces = [
        JSON.stringify(created.body),
        JSON.stringify(ready.executed.body),
        JSON.stringify(status.body),
        JSON.stringify(providerCalls),
      ];
      for (const surface of surfaces) {
        assert.equal(surface.includes("storageRevision"), false, "storage generation token must stay server-internal");
      }
    });

    await check("BC-30", "unified SessionRecord write discipline is source-enforced with no token leakage", async () => {
      const ledgerSource = await readFile(new URL("../src/server/_sessionLedger.ts", import.meta.url), "utf8");
      const authoritySlice = ledgerSource.slice(
        ledgerSource.indexOf("export async function commitAssessmentAuthority"),
        ledgerSource.indexOf("export function currentAssessmentAuthority"),
      );
      assert.ok(authoritySlice.includes("r.storageRevision=(tonumber(r.storageRevision) or 0)+1"), "authority EVAL must atomically advance storage generation");
      assert.ok(authoritySlice.includes("if tonumber(r.inputRevision)~=tonumber(ARGV[1]) then return nil end"), "authority EVAL must keep the business inputRevision guard");
      assert.ok(authoritySlice.includes("compareAndSwapSession("), "local authority commit must use the generation-aware CAS");
      assert.equal(authoritySlice.includes("writeLedgerSession("), false, "authority commit must not perform unconditional whole-record writes");
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
      for (const apiFile of ["production-interpretation.ts", "save-target-observation-setup.ts", "submit-target-observation.ts", "target-observation-state.ts"]) {
        const source = await readFile(new URL(`../api/${apiFile}`, import.meta.url), "utf8");
        assert.equal(source.includes("storageRevision"), false, `${apiFile} must not surface the storage generation token`);
      }
    });

    console.log(`J5 BYPASS CLOSURES PASS ${checks.length}/${checks.length}`);
  } finally {
    globalThis.fetch = originalFetch;
    providers.restore();
    const restore = (key, value) => { if (value === undefined) delete process.env[key]; else process.env[key] = value; };
    restore("PDF_RENDER_SERVICE_URL", priorEnv.pdfUrl);
    restore("PDF_RENDER_API_KEY", priorEnv.pdfKey);
    restore("RESEND_API_KEY", priorEnv.resendKey);
    restore("REPORT_FROM_EMAIL", priorEnv.reportFrom);
    restore("REPORT_HIDDEN_COPY_TO", priorEnv.hiddenTo);
  }
}

function targetB() {
  return [observation("Q1", "B")];
}

await runValidator();
