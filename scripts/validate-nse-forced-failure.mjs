import assert from "node:assert/strict";
import finalReportHandler, { sendFinalReportHiddenCopy } from "../api/final-report.ts";
import {
  createReadyAssessment,
  installMockExternalProviders,
} from "./validate-j5-production-authority.mjs";

const PDF_URL = "https://nse-pdf.test/render";
const RESEND_URL = "https://api.resend.com/emails";
const previousEnv = new Map([
  "PDF_RENDER_SERVICE_URL",
  "PDF_RENDER_API_KEY",
  "RESEND_API_KEY",
  "REPORT_FROM_EMAIL",
  "REPORT_HIDDEN_COPY_TO",
].map((key) => [key, process.env[key]]));
const productionProviders = installMockExternalProviders();
const delegatedFetch = globalThis.fetch;
const providerCalls = [];
const pdf = Buffer.concat([
  Buffer.from("%PDF-1.7 NSE forced-failure oracle\n"),
  Buffer.alloc(10_500, 0x20),
  Buffer.from("\n%%EOF"),
]);

function restoreEnv() {
  for (const [key, value] of previousEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function responseCapture() {
  const captured = { statusCode: 200, body: null };
  return {
    captured,
    response: {
      statusCode: 200,
      setHeader() {},
      end(value) {
        captured.statusCode = this.statusCode;
        captured.body = value ? JSON.parse(String(value)) : null;
      },
      status(statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      json(body) {
        captured.statusCode = this.statusCode;
        captured.body = body;
      },
    },
  };
}

async function callProductionHandler(body) {
  const { captured, response } = responseCapture();
  await finalReportHandler({
    method: "POST",
    url: "/api/final-report?action=send-final-report-hidden-copy",
    body,
  }, response);
  return captured;
}

async function callInjectedFailure(body) {
  const { captured, response } = responseCapture();
  await sendFinalReportHiddenCopy({
    method: "POST",
    url: "/api/final-report?action=send-final-report-hidden-copy",
    body,
  }, response, () => {
    throw new Error("TEST_ONLY_THROWING_KERNEL");
  });
  return captured;
}

process.env.PDF_RENDER_SERVICE_URL = PDF_URL;
process.env.PDF_RENDER_API_KEY = "nse-pdf-key";
process.env.RESEND_API_KEY = "nse-resend-key";
process.env.REPORT_FROM_EMAIL = "report@mergevue.test";
process.env.REPORT_HIDDEN_COPY_TO = "audit@mergevue.test";
globalThis.fetch = async (url, options = {}) => {
  const target = String(url);
  if (target === PDF_URL) {
    providerCalls.push({ kind: "PDF", options });
    return new Response(pdf, { status: 200, headers: { "content-type": "application/pdf" } });
  }
  if (target === RESEND_URL) {
    providerCalls.push({ kind: "RESEND", options });
    return new Response(JSON.stringify({ id: "nse-success-message" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return delegatedFetch(url, options);
};

try {
  const ready = await createReadyAssessment();
  assert.equal(ready.executed.body.status, "report-ready", JSON.stringify(ready.executed.body));
  const upstream = {
    sessionId: ready.sessionId,
    authorityId: ready.executed.body.authorityId,
  };

  providerCalls.length = 0;
  const success = await callProductionHandler(upstream);
  assert.equal(success.statusCode, 200, JSON.stringify(success.body));
  assert.equal(success.body.status, "sent");
  assert.deepEqual(providerCalls.map((call) => call.kind), ["PDF", "RESEND"], "success must reach PDF then Resend");
  const successResend = JSON.parse(String(providerCalls[1].options.body));
  const successJson = successResend.attachments.find((attachment) => attachment.filename === "mergevue-hidden-user-answers.json");
  const successSummary = successResend.attachments.find((attachment) => attachment.filename === "mergevue-hidden-user-answers.txt");
  assert.ok(successJson?.content, "success arm must create the owner JSON artifact");
  assert.ok(successSummary?.content, "success arm must create the owner summary artifact");

  providerCalls.length = 0;
  const failure = await callInjectedFailure(upstream);
  assert.equal(failure.statusCode, 400, JSON.stringify(failure.body));
  assert.equal(failure.body.status, "invalid-hidden-audit");
  assert.equal(providerCalls.filter((call) => call.kind === "PDF").length, 0, "kernel failure must block PDF continuation");
  assert.equal(providerCalls.filter((call) => call.kind === "RESEND").length, 0, "kernel failure must physically produce zero Resend invocations");
  assert.equal(JSON.stringify(failure).includes("TEST_ONLY_THROWING_KERNEL"), false, "content-bearing test error must not escape");

  console.log("NSE forced-failure validation passed");
  console.log("success provider calls: PDF=1 Resend=1");
  console.log("failure provider calls: PDF=0 Resend=0");
} finally {
  globalThis.fetch = delegatedFetch;
  productionProviders.restore();
  restoreEnv();
}
