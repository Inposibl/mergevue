import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createHiddenUserAnswersSnapshot } from "../src/reporting/hiddenUserAnswersSnapshot.js";
import {
  evaluateHiddenCopyRequest,
  resolveAuthoritativeHiddenAudit,
} from "../api/final-report.ts";

const API_PATH = new URL("../api/final-report.ts", import.meta.url);
const APP_PATH = new URL("../src/App.jsx", import.meta.url);
const PACKAGE_PATH = new URL("../package.json", import.meta.url);

const apiSource = readFileSync(API_PATH, "utf8");
const appSource = readFileSync(APP_PATH, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

const FORGED_JSON = "FORGED_AUDIT_PAYLOAD";
const FORGED_SUMMARY = "FORGED_AUDIT_SUMMARY";

const sufficientSession = Object.freeze({
  sessionId: "sec1d-v002-session",
  acquirer2A: Object.freeze({
    completed: true,
    score: Object.freeze({
      primaryEnvironmentCode: "NT/STJ",
      signalStrength: "confirmed",
      confidence: "high",
    }),
  }),
});

const sufficientDeliverable = Object.freeze({
  ready: true,
  acquirerEnvironmentCode: "NT/STJ",
  targetEnvironmentCode: "NF/SFJ",
  compatibilityScore: 61,
  riskBand: "moderate",
});

const failures = [];

function check(label, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function hiddenCopyFunctionSource() {
  const start = apiSource.indexOf("async function sendFinalReportHiddenCopy");
  const end = apiSource.indexOf("const TARGET_SELF_COMPLETION_TTL_SECONDS");
  assert.ok(start !== -1 && end !== -1 && start < end, "sendFinalReportHiddenCopy must be locatable");
  return apiSource.slice(start, end);
}

function evaluateHiddenCopySource() {
  const start = apiSource.indexOf("export function evaluateHiddenCopyRequest");
  const end = apiSource.indexOf("async function sendFinalReportHiddenCopy");
  assert.ok(start !== -1 && end !== -1 && start < end, "evaluateHiddenCopyRequest must precede the send handler");
  return apiSource.slice(start, end);
}

const VALID_PDF_BASE64 = Buffer.from("%PDF-1.4", "utf8").toString("base64");
const RESEND_UNSET = Object.freeze({
  RESEND_API_KEY: "",
  REPORT_FROM_EMAIL: "",
  REPORT_COPY_FROM: "",
  AUTHORIZED_LINK_FROM_EMAIL: "",
  AUTHORIZED_LINK_FROM: "",
  REPORT_HIDDEN_COPY_TO: "",
});
const RESEND_SET = Object.freeze({
  RESEND_API_KEY: "oracle-local-key",
  REPORT_FROM_EMAIL: "report@mergevue.com",
});

function hiddenCopyBody(overrides = {}) {
  return {
    reportId: "sec1d-corr-1-report",
    pdfBase64: VALID_PDF_BASE64,
    ...overrides,
  };
}

check("package.json registers the hidden-audit provenance oracle", () => {
  assert.equal(
    pkg.scripts?.["validate:hidden-audit-provenance"],
    "node scripts/validate-hidden-audit-provenance.mjs",
  );
});

check("source scan: reconstruction uses createHiddenUserAnswersSnapshot", () => {
  assert.ok(apiSource.includes('from "../src/reporting/hiddenUserAnswersSnapshot.js"'));
  assert.ok(apiSource.includes("createHiddenUserAnswersSnapshot(session, deliverable)"));
  assert.ok(apiSource.includes("export function resolveAuthoritativeHiddenAudit"));
});

check("source scan: hidden-copy attachments are not client hiddenAudit* fields", () => {
  const hiddenFn = hiddenCopyFunctionSource();
  const evalFn = evaluateHiddenCopySource();
  assert.equal(hiddenFn.includes("body?.hiddenAuditJson"), false);
  assert.equal(hiddenFn.includes("body.hiddenAuditJson"), false);
  assert.equal(hiddenFn.includes("body?.hiddenAuditSummary"), false);
  assert.equal(hiddenFn.includes("body.hiddenAuditSummary"), false);
  assert.equal(evalFn.includes("body?.hiddenAuditJson"), false);
  assert.equal(evalFn.includes("hiddenAuditJson"), false);
  assert.equal(evalFn.includes("hiddenAuditSummary"), false);
  assert.ok(hiddenFn.includes("evaluateHiddenCopyRequest(body)"));
  assert.ok(hiddenFn.includes("Buffer.from(decision.audit.json, \"utf8\")") || hiddenFn.includes("Buffer.from(decision.audit.json, 'utf8')"));
  assert.ok(hiddenFn.includes("Buffer.from(decision.audit.summary, \"utf8\")") || hiddenFn.includes("Buffer.from(decision.audit.summary, 'utf8')"));
  assert.ok(hiddenFn.includes("mergevue-hidden-user-answers.json"));
  assert.ok(hiddenFn.includes("mergevue-hidden-user-answers.txt"));
});

check("source scan: reconstruction precedes Resend env and fetch", () => {
  const evalFn = evaluateHiddenCopySource();
  const hiddenFn = hiddenCopyFunctionSource();
  const reconIdx = evalFn.indexOf("resolveAuthoritativeHiddenAudit(body)");
  const denyIdx = evalFn.indexOf("if (!audit.ok)");
  const env503Idx = evalFn.indexOf("email-service-not-configured");
  const handlerDenyIdx = hiddenFn.indexOf("if (!decision.ready)");
  const handlerDenyReturnIdx = hiddenFn.indexOf("return;", handlerDenyIdx);
  const resendIdx = hiddenFn.indexOf('fetch("https://api.resend.com/emails"');

  assert.ok(reconIdx !== -1, "evaluateHiddenCopyRequest must call resolveAuthoritativeHiddenAudit");
  assert.ok(denyIdx !== -1, "reconstruction deny must exist before env checks");
  assert.ok(env503Idx !== -1, "503 env check must exist");
  assert.ok(reconIdx < denyIdx, "reconstruction must precede deny");
  assert.ok(denyIdx < env503Idx, "invalid-hidden-audit must precede email-service-not-configured");
  assert.ok(handlerDenyIdx !== -1 && handlerDenyReturnIdx !== -1, "handler must return before fetch when not ready");
  assert.ok(resendIdx !== -1, "allow path must still call Resend");
  assert.ok(handlerDenyReturnIdx < resendIdx, "Resend must not run on deny");
});

check("source scan: production send path calls the exported resolver", () => {
  const hiddenFn = hiddenCopyFunctionSource();
  const evalFn = evaluateHiddenCopySource();
  assert.ok(hiddenFn.includes("evaluateHiddenCopyRequest(body)"));
  assert.ok(evalFn.includes("resolveAuthoritativeHiddenAudit(body)"));
  assert.equal(hiddenFn.includes("createHiddenUserAnswersSnapshot("), false, "handler must not duplicate reconstruction");
  assert.equal(evalFn.includes("createHiddenUserAnswersSnapshot("), false, "evaluateHiddenCopyRequest must not duplicate reconstruction");
  assert.ok(apiSource.includes("export function resolveAuthoritativeHiddenAudit"));
  assert.ok(apiSource.includes("export function evaluateHiddenCopyRequest"));
});

check("client wiring sends session and deliverable", () => {
  const start = appSource.indexOf("async function sendHiddenFinalDeliverablesReportCopy");
  const end = appSource.indexOf("function PaidOfferScreen");
  assert.ok(start !== -1 && end !== -1 && start < end);
  const fn = appSource.slice(start, end);
  assert.ok(fn.includes("action=send-final-report-hidden-copy"));
  assert.match(
    fn,
    /JSON\.stringify\(\{[\s\S]*\bsession,[\s\S]*\bdeliverable,[\s\S]*\}\)/,
  );
});

const expectedSnapshot = createHiddenUserAnswersSnapshot(sufficientSession, sufficientDeliverable);

check("forged artifacts without session/deliverable are denied", () => {
  const result = resolveAuthoritativeHiddenAudit({
    hiddenAuditJson: FORGED_JSON,
    hiddenAuditSummary: FORGED_SUMMARY,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.code, "invalid-hidden-audit");
  assert.equal(result.error, "Authoritative hidden audit could not be reconstructed");
  assert.equal(Object.prototype.hasOwnProperty.call(result, "json"), false);
});

check("forged artifacts plus session/deliverable reconstruct server snapshot only", () => {
  const result = resolveAuthoritativeHiddenAudit({
    hiddenAuditJson: FORGED_JSON,
    hiddenAuditSummary: FORGED_SUMMARY,
    session: sufficientSession,
    deliverable: sufficientDeliverable,
  });
  assert.equal(result.ok, true);
  assert.equal(result.json, expectedSnapshot.json);
  assert.equal(result.summary, expectedSnapshot.summary);
  assert.equal(result.json.includes(FORGED_JSON), false);
  assert.equal(result.summary.includes(FORGED_JSON), false);
  assert.equal(result.json.includes(FORGED_SUMMARY), false);
  assert.equal(result.summary.includes(FORGED_SUMMARY), false);
  assert.ok(result.json.includes("sec1d-v002-session"));
  assert.ok(result.summary.includes("NT/STJ"));
});

check("sufficient session/deliverable without client artifacts reconstructs snapshot", () => {
  const result = resolveAuthoritativeHiddenAudit({
    session: sufficientSession,
    deliverable: sufficientDeliverable,
  });
  assert.equal(result.ok, true);
  assert.equal(result.json, expectedSnapshot.json);
  assert.equal(result.summary, expectedSnapshot.summary);
});

check("empty session is denied", () => {
  const result = resolveAuthoritativeHiddenAudit({
    session: {},
    deliverable: sufficientDeliverable,
    hiddenAuditJson: FORGED_JSON,
    hiddenAuditSummary: FORGED_SUMMARY,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.code, "invalid-hidden-audit");
});

check("missing deliverable is denied", () => {
  const result = resolveAuthoritativeHiddenAudit({
    session: sufficientSession,
    hiddenAuditJson: FORGED_JSON,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.code, "invalid-hidden-audit");
});

check("FORGED_AUDIT_PAYLOAD is never returned as authoritative json", () => {
  const cases = [
    { hiddenAuditJson: FORGED_JSON, hiddenAuditSummary: FORGED_SUMMARY },
    { hiddenAuditJson: FORGED_JSON, session: sufficientSession, deliverable: sufficientDeliverable },
    { session: { note: FORGED_JSON }, deliverable: sufficientDeliverable },
  ];

  for (const body of cases) {
    const result = resolveAuthoritativeHiddenAudit(body);
    if (result.ok) {
      assert.equal(result.json, createHiddenUserAnswersSnapshot(body.session, body.deliverable).json);
      if (body.session?.note === FORGED_JSON) {
        continue;
      }
      assert.equal(result.json.includes(FORGED_JSON), false);
    } else {
      assert.equal(Object.prototype.hasOwnProperty.call(result, "json"), false);
    }
  }

  const forgedOnly = resolveAuthoritativeHiddenAudit({ hiddenAuditJson: FORGED_JSON });
  assert.equal(forgedOnly.ok, false);
  assert.equal(JSON.stringify(forgedOnly).includes(FORGED_JSON), false);
});

check("HTTP order: forged artifacts + no session + Resend unset → 400, not 503", () => {
  const decision = evaluateHiddenCopyRequest(
    hiddenCopyBody({
      hiddenAuditJson: FORGED_JSON,
      hiddenAuditSummary: FORGED_SUMMARY,
    }),
    RESEND_UNSET,
  );
  assert.equal(decision.ready, false);
  assert.equal(decision.status, 400);
  assert.equal(decision.body.status, "invalid-hidden-audit");
  assert.equal(decision.body.error, "Authoritative hidden audit could not be reconstructed");
  assert.notEqual(decision.body.status, "email-service-not-configured");
  assert.equal(Object.prototype.hasOwnProperty.call(decision, "audit"), false);
});

check("HTTP order: sufficient reconstruction + Resend unset → 503", () => {
  const decision = evaluateHiddenCopyRequest(
    hiddenCopyBody({
      session: sufficientSession,
      deliverable: sufficientDeliverable,
    }),
    RESEND_UNSET,
  );
  assert.equal(decision.ready, false);
  assert.equal(decision.status, 503);
  assert.equal(decision.body.status, "email-service-not-configured");
});

check("HTTP order: sufficient reconstruction + Resend set does not false-400; attachments are reconstructed", () => {
  const decision = evaluateHiddenCopyRequest(
    hiddenCopyBody({
      hiddenAuditJson: FORGED_JSON,
      hiddenAuditSummary: FORGED_SUMMARY,
      session: sufficientSession,
      deliverable: sufficientDeliverable,
    }),
    RESEND_SET,
  );
  assert.equal(decision.ready, true);
  assert.notEqual(decision.status, 400);
  assert.equal(decision.audit.json, expectedSnapshot.json);
  assert.equal(decision.audit.summary, expectedSnapshot.summary);
  assert.equal(decision.audit.json.includes(FORGED_JSON), false);
  assert.equal(decision.audit.summary.includes(FORGED_JSON), false);
  assert.equal(decision.audit.json.includes(FORGED_SUMMARY), false);
  assert.equal(decision.audit.summary.includes(FORGED_SUMMARY), false);
});

check("FORGED_AUDIT_PAYLOAD is not an attachment source at handler evaluation", () => {
  const denied = evaluateHiddenCopyRequest(
    hiddenCopyBody({ hiddenAuditJson: FORGED_JSON, hiddenAuditSummary: FORGED_SUMMARY }),
    RESEND_SET,
  );
  assert.equal(denied.ready, false);
  assert.equal(denied.status, 400);
  assert.equal(JSON.stringify(denied).includes(FORGED_JSON), false);

  const allowed = evaluateHiddenCopyRequest(
    hiddenCopyBody({
      hiddenAuditJson: FORGED_JSON,
      hiddenAuditSummary: FORGED_SUMMARY,
      session: sufficientSession,
      deliverable: sufficientDeliverable,
    }),
    RESEND_SET,
  );
  assert.equal(allowed.ready, true);
  const jsonAttachment = Buffer.from(allowed.audit.json, "utf8").toString("base64");
  const summaryAttachment = Buffer.from(allowed.audit.summary, "utf8").toString("base64");
  assert.equal(Buffer.from(jsonAttachment, "base64").toString("utf8").includes(FORGED_JSON), false);
  assert.equal(Buffer.from(summaryAttachment, "base64").toString("utf8").includes(FORGED_JSON), false);
  assert.equal(jsonAttachment, Buffer.from(expectedSnapshot.json, "utf8").toString("base64"));
});

if (failures.length) {
  console.error("validate:hidden-audit-provenance FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("validate:hidden-audit-provenance passed");
console.log("auth reconstruction cases: 6");
console.log("http precedence cases: 4");
