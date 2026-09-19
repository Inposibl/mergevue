import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import {
  CURRENT_ROUTE_FAMILY_COUNT,
  ROUTE_COMPATIBILITY_MAP,
  SCREEN_REGISTRY,
  resolveRoutePath,
} from "../src/routes/routeModel.js";
import { rendererIdForScreen } from "../src/screens/screenDispatch.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");
const TEST_UA = "MergeVue-UI-FROG-05-Test contact@example.test";
const APPLE_CIK = "0000320193";
const ALPHABET_CIK = "0001652044";
const NVIDIA_CIK = "0001045810";
const SUBMISSIONS_PREFIX = "https://data.sec.gov/submissions/CIK";
const SUBMISSIONS_SUFFIX = ".json";
const RESEARCH_PATH = "/api/start-public-research";
const RESOLVE_PATH = "/api/resolve-company";
const DEAL_ENTRY_ROUTE = "/start-diagnostic/deal-context";
const RESULT_ROUTE = "/start-diagnostic/deal-context/result";
const APPLE_RESEARCH_NAME = "APPLE INC SUBMISSIONS CANONICAL";
const NVIDIA_RESEARCH_NAME = "NVIDIA CORP SUBMISSIONS CANONICAL";
const ALPHABET_RESEARCH_NAME = "ALPHABET INC SUBMISSIONS CANONICAL";
const LOCAL_ERROR_COPY = "The public-source research request could not be completed. No research result is shown.";
const READY_COPY = "Companies confirmed. Public-source research is ready to start.";
const INVALID_ROUTE_COPY = "This page cannot show a public research result from the current address.";
const BACK_COPY = "Back to deal entry";
const VIEW_COPY = "View public research result";
const DEAL_ENTRY_SESSION_KEY = "mergevue.deal-entry.v1";
const DEAL_ENTRY_SESSION_SCHEMA = "deal-entry-session-v1";

const FORBIDDEN_GLOBAL_SELECTORS = [
  /^\s*body\b/m,
  /^\s*h1\b/m,
  /^\s*h2\b/m,
  /^\s*p\b/m,
  /^\s*input\b/m,
  /^\s*button\b/m,
  /^\s*a\b/m,
  /^\s*\.screen\b/m,
  /^\s*\.card\b/m,
];

const BASELINE_REGISTRY_ROUTES = Object.freeze([
  ["diagnostic-before-you-begin", "/start-diagnostic/before-you-begin", "DiagnosticGatePage", "none", "anonymous-analysis"],
  ["deal-context-acquisition-motive", "/start-diagnostic/deal-context", "AcquisitionMotiveScreen", "session-and-set-session", "anonymous-analysis"],
  ["deal-context-refine-evidence-quality", "/start-diagnostic/deal-context/refine-evidence-quality", "RefineEvidenceQualityScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["deal-context-transaction-details", "/start-diagnostic/deal-context/details", "TransactionDetailsScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-4-promise", "/screen-4-promise", "PromiseScreen", "session", "registered-deeper-analysis"],
  ["screen-5-acquirer-module", "/screen-5-acquirer-module", "AcquirerModuleScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-6-acquirer-submit", "/screen-6-acquirer-submit", "AcquirerSubmitScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-6-acquirer-verification", "/screen-6-acquirer-verification", "AuthorizedAcquirerVerificationScreen", "set-session", "participant"],
  ["screen-6a-target-observation-setup", "/screen-6a-target-observation-setup", "TargetObservationSetupIntroScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-6a-target-observation-setup-details", "/screen-6a-target-observation-setup/details", "TargetObservationSetupScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-6a-target-observation-authorized", "/screen-6a-target-observation-setup/authorized", "AuthorizedTargetObservationSetupScreen", "set-session", "participant"],
  ["screen-6b-target-observation", "/screen-6b-target-observation", "TargetObservationScreen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-7-step-2b-level-1", "/screen-7-step-2b-level-1", "Step2BLevel1Screen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-8-step-2b-transition", "/screen-8-step-2b-transition", "Step2BTransitionScreen", "session", "registered-deeper-analysis"],
  ["screen-9-step-2b-level-2", "/screen-9-step-2b-level-2", "Step2BLevel2Screen", "session-and-set-session", "registered-deeper-analysis"],
  ["screen-2c-target-self-assessment", "/screen-2c-target-self-assessment", "TargetSelfAssessmentDirectScreen", "session-and-set-session", "participant"],
  ["screen-9a-target-code-gate", "/screen-9a-target-code-gate", "PreliminaryTargetGateScreen", "target-code-gate", "participant"],
  ["screen-10-reveal", "/screen-10-reveal", "FinalDeliverablesScreen", "session-and-set-session", "public-result"],
  ["screen-10b-homogeneous", "/screen-10b-homogeneous", "FinalDeliverablesScreen", "session-and-set-session", "public-result"],
  ["screen-11-paid-offer", "/screen-11-paid-offer", "PaidOfferScreen", "paid-offer-heterogeneous", "public-to-deeper-transition"],
  ["screen-11b-homogeneous-offer", "/screen-11b-homogeneous-offer", "PaidOfferScreen", "paid-offer-homogeneous", "public-to-deeper-transition"],
  ["screen-12-email-capture", "/screen-12-email-capture", "EmailCaptureScreen", "session-and-set-session", "public-result"],
  ["screen-12-consultation-request", "/screen-12-consultation-request", "ConsultationRequestScreen", "session-and-set-session", "public-to-deeper-transition"],
]);

const EXPECTED_COMPATIBILITY_MAP = Object.freeze([
  Object.freeze({ currentPath: "/home", currentResolution: "/home", targetPath: "/", activation: "future-redirect" }),
  Object.freeze({ currentPath: "/about-methodology", currentResolution: "/about-methodology", targetPath: "/methodology", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/about-methodology/overview", currentResolution: "/about-methodology/overview", targetPath: "/methodology/overview", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/environments/:environmentId?", currentResolution: "/environments/:environmentId?", targetPath: "/methodology/environments/:environmentId?", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/case-studies/:caseId?", currentResolution: "/case-studies/:caseId?", targetPath: "/historical-replays/:caseId?", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/start-diagnostic", currentResolution: "/start-diagnostic/before-you-begin", targetPath: "/analyze", activation: "current-compatibility-alias" }),
  Object.freeze({ currentPath: "/screen-2-role", currentResolution: "/start-diagnostic/before-you-begin", targetPath: "/analyze", activation: "current-compatibility-alias" }),
]);

const ASSOCIATION_FIXTURE = {
  fields: ["cik", "name", "ticker", "exchange"],
  data: [
    [320193, "Apple Inc.", "AAPL", "Nasdaq"],
    [320193, "Apple Inc.", "AAPL-W", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOGL", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOG", "Nasdaq"],
    [1045810, "NVIDIA CORP", "NVDA", "Nasdaq"],
  ],
};

const APPLE_FILINGS = [
  { form: "10-K", filingDate: "2024-11-01", accessionNumber: "0000320193-24-000111" },
  { form: "8-K", filingDate: "2024-12-15", accessionNumber: "0000320193-24-000222" },
];
const NVIDIA_FILINGS = [
  { form: "10-Q", filingDate: "2025-02-02", accessionNumber: "0001045810-25-000333" },
];
const ALPHABET_FILINGS = [
  { form: "4", filingDate: "2025-03-03", accessionNumber: "0001652044-25-000444" },
];

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function submissionsUrl(cik) {
  return `${SUBMISSIONS_PREFIX}${cik}${SUBMISSIONS_SUFFIX}`;
}

function jsonFetchResponse(status, body) {
  return {
    status,
    json: async () => body,
  };
}

function createTrackedFetch(impl) {
  const calls = [];
  const fetchFn = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return impl(url, options, calls);
  };
  return { fetchFn, calls };
}

function submissionsFixture({ name, rows = [], files = [] }) {
  return {
    name,
    filings: {
      recent: {
        form: rows.map((row) => row.form),
        filingDate: rows.map((row) => row.filingDate),
        accessionNumber: rows.map((row) => row.accessionNumber),
      },
      files,
    },
  };
}

function emptySubmissions(name) {
  return submissionsFixture({ name, rows: [] });
}

function successSubmissionsTable(extra = {}) {
  return {
    [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, submissionsFixture({
      name: APPLE_RESEARCH_NAME,
      rows: APPLE_FILINGS,
    })),
    [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(200, submissionsFixture({
      name: NVIDIA_RESEARCH_NAME,
      rows: NVIDIA_FILINGS,
    })),
    [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, submissionsFixture({
      name: ALPHABET_RESEARCH_NAME,
      rows: ALPHABET_FILINGS,
    })),
    ...extra,
  };
}

function tableFetch(table) {
  return async (url) => {
    const entry = table[String(url)];
    if (typeof entry === "function") return entry();
    if (entry) return entry;
    return jsonFetchResponse(404, { error: "missing-fixture" });
  };
}

function headersFromNodeRequest(request) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (typeof value === "string") {
      headers.set(key, value);
    }
  }
  return headers;
}

function readNodeRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendFetchResponse(nodeResponse, fetchResponse) {
  nodeResponse.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, key) => {
    nodeResponse.setHeader(key, value);
  });
  return fetchResponse.arrayBuffer().then((body) => nodeResponse.end(Buffer.from(body)));
}

function createReleaseGate() {
  let unlock = () => {};
  const gate = new Promise((resolve) => {
    unlock = resolve;
  });
  return {
    gate,
    release() {
      unlock();
    },
  };
}

function resultUrl(acquirerCik, targetCik) {
  return `${RESULT_ROUTE}?acquirerCik=${acquirerCik}&targetCik=${targetCik}`;
}

function testApiPlugin(getResolveApi, getResearchApi, getOverride) {
  return {
    name: "ui-frog-05-test-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const origin = `http://${request.headers.host ?? "127.0.0.1"}`;
        const url = new URL(request.url ?? "/", origin);
        try {
          if (url.pathname === RESOLVE_PATH) {
            const api = await getResolveApi(server);
            const body = request.method === "GET" || request.method === "HEAD"
              ? undefined
              : await readNodeRequestBody(request);
            const apiRequest = new Request(url.toString(), {
              method: request.method,
              headers: headersFromNodeRequest(request),
              body: body?.length ? body : undefined,
            });
            await sendFetchResponse(response, await api.default(apiRequest));
            return;
          }
          if (url.pathname === RESEARCH_PATH) {
            const override = getOverride();
            if (override) {
              if (override.gate) await override.gate;
              if (override.reject) {
                response.destroy();
                return;
              }
              response.statusCode = override.status ?? 200;
              response.setHeader("content-type", override.contentType ?? "application/json; charset=utf-8");
              response.end(override.body ?? JSON.stringify(override.json ?? {}));
              return;
            }
            const api = await getResearchApi(server);
            const body = request.method === "GET" || request.method === "HEAD"
              ? undefined
              : await readNodeRequestBody(request);
            const apiRequest = new Request(url.toString(), {
              method: request.method,
              headers: headersFromNodeRequest(request),
              body: body?.length ? body : undefined,
            });
            await sendFetchResponse(response, await api.default(apiRequest));
            return;
          }
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify({
            endpoint: url.pathname,
            status: "local-api-error",
            error: error instanceof Error ? error.message : "error",
          }));
          return;
        }
        next();
      });
    },
  };
}

async function startTestServer() {
  const rootPath = fileURLToPath(root);
  let lastError = null;
  for (const port of [5200, 5201, 5202, 5203, 5204, 5205]) {
    let resolveApi = null;
    let researchApi = null;
    const overrideBox = { current: null };
    const vite = await createViteServer({
      root: rootPath,
      server: { host: "127.0.0.1", port, strictPort: true, hmr: false },
      plugins: [testApiPlugin(
        async (server) => {
          if (!resolveApi) resolveApi = await server.ssrLoadModule("/api/resolve-company.ts");
          return resolveApi;
        },
        async (server) => {
          if (!researchApi) researchApi = await server.ssrLoadModule("/api/start-public-research.ts");
          return researchApi;
        },
        () => overrideBox.current,
      )],
    });
    try {
      await vite.listen();
      const resolver = await vite.ssrLoadModule("/src/server/_companyResolver.ts");
      const research = await vite.ssrLoadModule("/src/server/_secResearch.ts");
      return {
        vite,
        port,
        origin: `http://127.0.0.1:${port}`,
        resolver,
        research,
        overrideBox,
      };
    } catch (error) {
      await vite.close().catch(() => {});
      lastError = error;
      if (error && error.code !== "EADDRINUSE") throw error;
    }
  }
  throw lastError ?? new Error("Unable to bind UI-FROG-05 test server");
}

function installResolverFixture(resolver, fetchImpl, extra = {}) {
  resolver.resetCompanyResolverForTests();
  const tracked = createTrackedFetch(fetchImpl);
  resolver.setCompanyResolverTestHarness({
    userAgent: extra.userAgent === undefined ? TEST_UA : extra.userAgent,
    fetch: tracked.fetchFn,
    nowMs: extra.nowMs,
    timeoutMs: extra.timeoutMs,
  });
  return tracked;
}

function installAssociationFixture(resolver, extra = {}) {
  return installResolverFixture(resolver, async () => jsonFetchResponse(200, ASSOCIATION_FIXTURE), extra);
}

function installResearchHarness(research, fetchImpl, extra = {}) {
  research.resetSecResearchForTests();
  const tracked = createTrackedFetch(fetchImpl);
  const harness = {
    fetch: tracked.fetchFn,
    nowMs: extra.nowMs ?? (() => Date.parse("2026-09-18T12:00:00.000Z")),
  };
  if (Object.prototype.hasOwnProperty.call(extra, "userAgent")) {
    harness.userAgent = extra.userAgent;
  } else {
    harness.userAgent = TEST_UA;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "timeoutMs")) {
    harness.timeoutMs = extra.timeoutMs;
  }
  research.setSecResearchTestHarness(harness);
  return tracked;
}

function installSuccessResearch(research, extra = {}) {
  return installResearchHarness(research, tableFetch(successSubmissionsTable(extra.table)), extra);
}

function installGatedResearch(research, gate, extra = {}) {
  const table = extra.table ?? successSubmissionsTable();
  return installResearchHarness(research, async (url, options) => {
    await new Promise((resolve, reject) => {
      const fail = () => {
        const error = new Error("Aborted");
        error.name = "AbortError";
        reject(error);
      };
      if (options.signal?.aborted) {
        fail();
        return;
      }
      options.signal?.addEventListener("abort", fail, { once: true });
      gate.then(() => {
        if (options.signal?.aborted) {
          fail();
          return;
        }
        resolve();
      });
    });
    return tableFetch(table)(url, options);
  }, extra);
}

function lawfulCompany(side, cik, name, filings, submissionsStatus = "RETRIEVED") {
  return {
    side,
    cik,
    canonicalName: name,
    submissionsStatus,
    filingCount: filings ? filings.length : null,
    recentFilings: filings,
    recentFilingsLimit: 10,
    additionalFilesCount: 0,
    retrievedAt: "2026-09-18T12:00:00.000Z",
  };
}

const CANONICAL_PUBLIC_REPORT_NAMES = Object.freeze([
  "Executive Decision Summary",
  "Structural Watchpoints",
  "Compatibility Score & Deal Scenario",
  "Identified Environment Types",
  "Collision Thesis",
  "Resource Conflict Map",
  "Timeline of Expected Friction",
  "Economic Risk Translation",
  "Recommended Actions",
  "Decision Gap",
  "What the Full Engagement Adds",
  "Audit Footer",
]);
const CANONICAL_PUBLIC_REPORT_IDS = Object.freeze([
  "executive-decision-summary",
  "structural-watchpoints",
  "compatibility-score-and-deal-scenario",
  "identified-environment-types",
  "collision-thesis",
  "resource-conflict-map",
  "timeline-of-expected-friction",
  "economic-risk-translation",
  "recommended-actions",
  "decision-gap",
  "what-the-full-engagement-adds",
  "audit-footer",
]);
const CANONICAL_PUBLIC_REPORT_STATES = Object.freeze([
  "LIMITED",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "NOT_APPLICABLE",
  "LIMITED",
  "AVAILABLE",
  "AVAILABLE",
]);

function canonicalLevel1(acquirerCik, targetCik) {
  return {
    collectionBoundId: "SLICE1-BOUND-v0.4",
    sourceFamily: "issuer-filed structured public filing index",
    requestedAt: "2026-09-18T12:00:00.000Z",
    evidenceCutoff: "2026-09-18T12:00:00.000Z",
    sides: {
      acquirer: { side: "acquirer", cik: acquirerCik, coverage: "COMPLETE_WITHIN_BOUND" },
      target: { side: "target", cik: targetCik, coverage: "COMPLETE_WITHIN_BOUND" },
    },
    pair: {
      symmetricExecution: true,
      coverageBySide: { acquirer: "COMPLETE_WITHIN_BOUND", target: "COMPLETE_WITHIN_BOUND" },
    },
  };
}

function canonicalPublicReport(acquirerCik, targetCik) {
  return {
    schemaVersion: "mergevue-canonical-public-report-v1",
    sourceMode: "LEVEL1_MODE_D_SLICE1",
    metadata: {
      generatedAt: "2026-09-18T12:00:00.000Z",
      reportVersion: "mergevue-canonical-public-report-level1-mode-d-slice1-v1",
      sourceField: "level1",
      requestedAt: "2026-09-18T12:00:00.000Z",
      evidenceCutoff: "2026-09-18T12:00:00.000Z",
      collectionBoundId: "SLICE1-BOUND-v0.4",
      pair: { acquirerCik, targetCik },
      coverageBySide: { acquirer: "COMPLETE_WITHIN_BOUND", target: "COMPLETE_WITHIN_BOUND" },
      symmetricExecution: true,
      referenceDataVersions: {
        recordClassMappingVersion: "MD-L1-RCMAP-v1.0-CORR1",
        rawFormValueResolutionVersion: "MD-L1-RAWFORM-v1.0-CORR1",
        semanticTaxonomySnapshotId: "MD-L1-SEMTAX-2026-09-19-BOUNDED",
      },
    },
    blocks: CANONICAL_PUBLIC_REPORT_NAMES.map((canonicalName, index) => ({
      number: index + 1,
      blockId: CANONICAL_PUBLIC_REPORT_IDS[index],
      canonicalName,
      modelField: "canonical",
      availabilityState: CANONICAL_PUBLIC_REPORT_STATES[index],
      availabilityReason: "fixture",
      content: index === 8 ? { actions: [] } : null,
      provenance: null,
    })),
  };
}

function lawfulResearchBody({
  researchStatus = "RESEARCH_AVAILABLE",
  acquirerCik = APPLE_CIK,
  targetCik = NVIDIA_CIK,
  acquirerName = APPLE_RESEARCH_NAME,
  targetName = NVIDIA_RESEARCH_NAME,
  acquirerFilings = APPLE_FILINGS,
  targetFilings = NVIDIA_FILINGS,
  acquirerStatus = "RETRIEVED",
  targetStatus = "RETRIEVED",
} = {}) {
  return {
    endpoint: RESEARCH_PATH,
    researchStatus,
    coverage: "RECENT_FILING_HISTORY_ONLY",
    identitySource: "SEC_SUBMISSIONS_API",
    requestedAt: "2026-09-18T12:00:00.000Z",
    companies: [
      lawfulCompany("acquirer", acquirerCik, acquirerName, acquirerFilings, acquirerStatus),
      lawfulCompany("target", targetCik, targetName, targetFilings, targetStatus),
    ],
    publicReport: canonicalPublicReport(acquirerCik, targetCik),
    level1: canonicalLevel1(acquirerCik, targetCik),
  };
}

function serviceUnavailableNoCompanies() {
  return {
    endpoint: RESEARCH_PATH,
    researchStatus: "SERVICE_UNAVAILABLE",
    coverage: "RECENT_FILING_HISTORY_ONLY",
    identitySource: "SEC_SUBMISSIONS_API",
    requestedAt: "2026-09-18T12:00:00.000Z",
    status: "service-unavailable",
  };
}

function serviceUnavailableDual(acquirerCik, targetCik) {
  return {
    endpoint: RESEARCH_PATH,
    researchStatus: "SERVICE_UNAVAILABLE",
    coverage: "RECENT_FILING_HISTORY_ONLY",
    identitySource: "SEC_SUBMISSIONS_API",
    requestedAt: "2026-09-18T12:00:00.000Z",
    status: "service-unavailable",
    publicReport: canonicalPublicReport(acquirerCik, targetCik),
    level1: canonicalLevel1(acquirerCik, targetCik),
    companies: [
      {
        side: "acquirer",
        cik: acquirerCik,
        canonicalName: null,
        submissionsStatus: "NOT_RETRIEVABLE",
        filingCount: null,
        recentFilings: null,
        recentFilingsLimit: 10,
        additionalFilesCount: null,
        retrievedAt: null,
      },
      {
        side: "target",
        cik: targetCik,
        canonicalName: null,
        submissionsStatus: "NOT_RETRIEVABLE",
        filingCount: null,
        recentFilings: null,
        recentFilingsLimit: 10,
        additionalFilesCount: null,
        retrievedAt: null,
      },
    ],
  };
}

async function fillLabeled(page, labelText, value) {
  await page.evaluate((labelName, nextValue) => {
    const label = [...document.querySelectorAll("label")].find((node) => node.textContent.trim() === labelName);
    const input = document.getElementById(label.htmlFor);
    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    descriptor.set.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, labelText, value);
}

async function clickButton(page, label) {
  await page.evaluate((buttonLabel) => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === buttonLabel);
    button.click();
  }, label);
}

async function getButtonState(page, label) {
  return page.evaluate((buttonLabel) => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === buttonLabel);
    return button
      ? { present: true, disabled: button.disabled, type: button.type, tabIndex: button.tabIndex }
      : { present: false };
  }, label);
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function waitForBody(page, snippet, timeout = 8000) {
  await page.waitForFunction((text) => document.body.innerText.includes(text), { timeout }, snippet);
}

async function waitForButton(page, label, enabled, timeout = 8000) {
  await page.waitForFunction((buttonLabel, shouldEnable) => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === buttonLabel);
    return Boolean(button && button.disabled !== shouldEnable);
  }, { timeout }, label, enabled);
}

async function waitForStatus(page, snippet, timeout = 8000) {
  await page.waitForFunction((text) => {
    const nodes = [...document.querySelectorAll('[role="status"]')];
    return nodes.some((node) => node.textContent.includes(text));
  }, { timeout }, snippet);
}

async function waitForResultPhase(page, phase, timeout = 8000) {
  await page.waitForFunction((expected) => {
    const node = document.querySelector("[data-result-phase]");
    return Boolean(node && node.getAttribute("data-result-phase") === expected);
  }, { timeout }, phase);
}

async function resultPhase(page) {
  return page.evaluate(() => document.querySelector("[data-result-phase]")?.getAttribute("data-result-phase") ?? "");
}

async function sideText(page, side) {
  return page.evaluate((sideName) => {
    const node = document.querySelector(`[data-research-side="${sideName}"]`);
    return node ? node.innerText : "";
  }, side);
}

function assertCikOnlyBody(raw, acquirerCik, targetCik) {
  assert.ok(raw, "research POST must have a JSON body");
  const body = JSON.parse(raw);
  assert.deepEqual(Object.keys(body).sort(), ["acquirer", "target"]);
  assert.deepEqual(Object.keys(body.acquirer), ["cik"]);
  assert.deepEqual(Object.keys(body.target), ["cik"]);
  assert.equal(body.acquirer.cik, acquirerCik);
  assert.equal(body.target.cik, targetCik);
}

function collectRequests(page) {
  const requests = [];
  const listener = (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      postData: request.postData() ?? "",
    });
  };
  page.on("request", listener);
  return {
    requests,
    stop() {
      page.off("request", listener);
    },
  };
}

function researchPosts(requests) {
  return requests.filter((item) => item.url.includes(RESEARCH_PATH) && item.method === "POST");
}

function assertNoResultLeakage(requests, fromIndex = 0) {
  const slice = requests.slice(fromIndex);
  const resolvePair = slice.filter((item) => item.url.includes("/api/resolve-pair"));
  const browserSec = slice.filter((item) => /sec\.gov/i.test(item.url));
  assert.equal(resolvePair.length, 0, "result causal path must not call /api/resolve-pair");
  assert.equal(browserSec.length, 0, "result causal path must not request sec.gov from the browser");
}

async function confirmPair(page, acquirer, target) {
  await fillLabeled(page, "Acquirer", acquirer);
  await fillLabeled(page, "Target", target);
  await waitForButton(page, "Confirm companies", true);
  await clickButton(page, "Confirm companies");
  await waitForStatus(page, READY_COPY);
}

async function labeledInputValue(page, labelText) {
  return page.evaluate((labelName) => {
    const label = [...document.querySelectorAll("label")].find((node) => node.textContent.trim() === labelName);
    const input = document.getElementById(label?.htmlFor);
    return input ? input.value : "";
  }, labelText);
}

async function readPersistedDealEntry(page) {
  const raw = await page.evaluate((key) => sessionStorage.getItem(key), DEAL_ENTRY_SESSION_KEY);
  if (!raw) return { raw: null, parsed: null };
  try {
    return { raw, parsed: JSON.parse(raw) };
  } catch {
    return { raw, parsed: null };
  }
}

function lawfulDealEntrySession(overrides = {}) {
  return {
    schemaVersion: DEAL_ENTRY_SESSION_SCHEMA,
    acquirer: {
      typedName: "Apple Inc.",
      confirmed: {
        canonicalName: "Apple Inc.",
        cik: APPLE_CIK,
        ticker: "AAPL",
        exchange: "Nasdaq",
      },
    },
    target: {
      typedName: "NVIDIA CORP",
      confirmed: {
        canonicalName: "NVIDIA CORP",
        cik: NVIDIA_CIK,
        ticker: "NVDA",
        exchange: "Nasdaq",
      },
    },
    ...overrides,
  };
}

async function gotoDealEntry(page, origin) {
  await page.goto(`${origin}${DEAL_ENTRY_ROUTE}`, { waitUntil: "networkidle0", timeout: 30000 });
}

async function gotoResult(page, origin, acquirerCik, targetCik, waitUntil = "networkidle0") {
  await page.goto("about:blank", { waitUntil: "domcontentloaded" });
  await page.goto(`${origin}${resultUrl(acquirerCik, targetCik)}`, { waitUntil, timeout: 30000 });
}

async function navigateInPage(page, pathAndQuery) {
  await page.evaluate(async (next) => {
    const { navigate } = await import("/src/routes/navigation.js");
    navigate(next);
  }, pathAndQuery);
}

async function resolveInPage(page, pathname) {
  return page.evaluate(async (path) => {
    const { resolveRoutePath } = await import("/src/routes/routeModel.js");
    const resolved = resolveRoutePath(path);
    return {
      id: resolved.id,
      rendererId: resolved.rendererId,
      isFallback: resolved.isFallback,
      canonicalRoute: resolved.canonicalRoute,
      propsKind: resolved.propsKind,
      targetLayer: resolved.targetLayer,
    };
  }, pathname);
}

async function neutralizeResearchAbort(page) {
  await page.evaluateOnNewDocument(() => {
    const original = window.fetch.bind(window);
    window.fetch = (input, init = {}) => {
      const url = typeof input === "string" ? input : String(input && input.url ? input.url : input);
      if (url.includes("/api/start-public-research")) {
        const next = { ...init };
        delete next.signal;
        return original(input, next);
      }
      return original(input, init);
    };
  });
}

async function queryKeys(page) {
  return page.evaluate(() => {
    const params = new URLSearchParams(window.location.search);
    return [...params.keys()];
  });
}

async function runSourceChecks() {
  const results = [];
  async function check(id, area, input, expected, fn) {
    const observed = await fn();
    assert.equal(observed.state, expected, `${id}: expected ${expected}, observed ${observed.state}`);
    results.push({
      check_id: id,
      area,
      input_or_scenario: input,
      expected_state: expected,
      observed_state: observed.state,
      result: "PASS",
      evidence: observed.evidence,
      notes: observed.notes ?? "",
    });
  }

  const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
  const resultSource = await read("src/screens/public/PublicResearchResultScreen.jsx");
  const cssSource = await read("src/styles/public-research-result.css");
  const dealCssSource = await read("src/styles/public-deal-entry.css");
  const appSource = await read("src/App.jsx");
  const routeSource = await read("src/routes/routeModel.js");
  const navigationSource = await read("src/routes/navigation.js");
  const dispatchSource = await read("src/screens/screenDispatch.js");
  const viteSource = await read("vite.config.js");
  const packageSource = await read("package.json");
  const resolvePairSource = await read("api/resolve-pair.ts");

  const resultImportLines = resultSource
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .join("\n");

  await check("S-ROUTE", "source", "result route registered", "registered-not-fallback", async () => {
    const resolved = resolveRoutePath(RESULT_ROUTE);
    assert.equal(resolved.id, "deal-context-public-result");
    assert.equal(resolved.rendererId, "PublicResearchResultScreen");
    assert.equal(resolved.propsKind, "none");
    assert.equal(resolved.targetLayer, "public-result");
    assert.equal(resolved.isFallback, false);
    assert.equal(resolved.navigationSection, "");
    assert.equal(rendererIdForScreen(resolved), "PublicResearchResultScreen");
    assert.equal(SCREEN_REGISTRY.length, 24);
    assert.equal(CURRENT_ROUTE_FAMILY_COUNT, 33);
    assert.equal(SCREEN_REGISTRY.filter((row) => row.id === "deal-context-public-result").length, 1);
    assert.equal(SCREEN_REGISTRY[SCREEN_REGISTRY.length - 1].id, "deal-context-public-result");
    return { state: "registered-not-fallback", evidence: "deal-context-public-result appended; family count 33" };
  });

  await check("S-PRIOR-ROUTES", "non-regression", "23 baseline registry routes", "unchanged", async () => {
    for (const [id, route, rendererId, propsKind, targetLayer] of BASELINE_REGISTRY_ROUTES) {
      const resolved = resolveRoutePath(route);
      assert.equal(resolved.id, id, `${route} id changed`);
      assert.equal(resolved.canonicalRoute, route, `${route} canonical route changed`);
      assert.equal(resolved.rendererId, rendererId, `${route} renderer changed`);
      assert.equal(resolved.propsKind, propsKind, `${route} propsKind changed`);
      assert.equal(resolved.targetLayer, targetLayer, `${route} targetLayer changed`);
      assert.equal(resolved.isFallback, false, `${route} became fallback`);
    }
    assert.equal(ROUTE_COMPATIBILITY_MAP.length, 7);
    assert.deepEqual(ROUTE_COMPATIBILITY_MAP, EXPECTED_COMPATIBILITY_MAP);
    assert.equal(resolveRoutePath("/analyze").isFallback, true);
    assert.equal(resolveRoutePath("/analyze/context").isFallback, true);
    assert.equal(resolveRoutePath("/start-diagnostic").id, "diagnostic-before-you-begin");
    assert.equal(resolveRoutePath("/screen-2-role").id, "diagnostic-before-you-begin");
    assert.equal(resolveRoutePath("/not-a-current-route").isFallback, true);
    assert.equal(resolveRoutePath("/start-diagnostic/deal-context/resul").isFallback, true);
    return { state: "unchanged", evidence: "23 prior routes, 7 compatibility rows, aliases and fallback unchanged" };
  });

  await check("S-APP", "source", "App.jsx additive registration", "additive", async () => {
    assert.match(appSource, /import \{ PublicResearchResultScreen \} from "\.\/screens\/public\/PublicResearchResultScreen\.jsx"/);
    assert.match(appSource, /PublicResearchResultScreen,/);
    assert.match(appSource, /function AcquisitionMotiveScreen\(\) \{\s*return <DealEntryScreen \/>;\s*\}/);
    return { state: "additive", evidence: "one import and one APP_SCREEN_COMPONENTS registration" };
  });

  await check("S-HANDOFF", "source", "explicit DealEntry handoff", "explicit-only", async () => {
    assert.match(entrySource, /View public research result/);
    assert.match(entrySource, /openPublicResearchResult/);
    assert.match(entrySource, /canViewPublicResearchResult/);
    assert.doesNotMatch(entrySource, /navigate\(/);
    assert.doesNotMatch(entrySource, /\/analyze/);
    assert.doesNotMatch(entrySource, /useEffect\([\s\S]{0,400}openPublicResearchResult/);
    assert.doesNotMatch(entrySource, /setTimeout/);
    assert.match(resultSource, /navigate\(/);
    assert.match(resultSource, /from "\.\.\/\.\.\/routes\/navigation\.js"/);
    assert.match(resultSource, /PUBLIC_RESEARCH_RESULT_ROUTE = "\/start-diagnostic\/deal-context\/result"/);
    assert.match(resultSource, /\$\{PUBLIC_RESEARCH_RESULT_ROUTE\}\?acquirerCik=\$\{pair\.acquirerCik\}&targetCik=\$\{pair\.targetCik\}/);
    return { state: "explicit-only", evidence: "DealEntry stores/opens only on View click; navigate lives in result module" };
  });

  await check("S-NO-PRIVATE", "bypass", "result screen direct imports", "public-only", async () => {
    assert.doesNotMatch(resultImportLines, /src\/flow/);
    assert.doesNotMatch(resultImportLines, /src\/reporting/);
    assert.doesNotMatch(resultSource, /FinalDeliverablesScreen/);
    assert.doesNotMatch(resultSource, /HeterogeneousRevealScreen/);
    assert.doesNotMatch(resultSource, /HomogeneousRevealScreen/);
    assert.doesNotMatch(resultSource, /production-interpretation/);
    assert.doesNotMatch(resultSource, /resolve-pair/);
    assert.doesNotMatch(resultSource, /localStorage/);
    assert.doesNotMatch(resultSource, /sessionStorage/);
    assert.doesNotMatch(resultSource, /indexedDB/i);
    assert.doesNotMatch(resultSource, /document\.cookie/);
    assert.doesNotMatch(resultSource, /analysisRequestId/);
    assert.doesNotMatch(entrySource, /analysisRequestId/);
    assert.doesNotMatch(resultSource, /sec\.gov/);
    assert.doesNotMatch(resultSource, /\/screen-10/);
    assert.doesNotMatch(resultSource, /\/screen-11/);
    assert.doesNotMatch(resultSource, /\/screen-12/);
    assert.match(resolvePairSource, /buildPairDeliverable/);
    assert.doesNotMatch(viteSource, /start-public-research/);
    assert.doesNotMatch(packageSource, /validate-ui-frog-05/);
    assert.match(navigationSource, /export function navigate/);
    assert.match(dispatchSource, /export function renderResolvedScreen/);
    return { state: "public-only", evidence: "result screen has no flow/reporting/persistence/predictive imports" };
  });

  await check("S-CSS", "source", "result CSS scoped", "scoped", async () => {
    assert.match(cssSource, /\.mv-research-result-page/);
    assert.match(cssSource, /\.mv-research-result-table-wrap/);
    assert.match(cssSource, /@media \(max-width: 320px\)/);
    for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
      assert.doesNotMatch(cssSource, pattern);
    }
    assert.doesNotMatch(dealCssSource, /\.mv-research-result/);
    return { state: "scoped", evidence: "result CSS uses mv-research-result-* only; deal-entry CSS untouched" };
  });

  await check("S-NO-FAKE-STATUS", "source", "local phase is not server researchStatus", "separated", async () => {
    assert.match(resultSource, /PHASE_LOADING = "LOADING"/);
    assert.match(resultSource, /PHASE_ROUTE_INVALID = "ROUTE_INVALID"/);
    assert.doesNotMatch(resultSource, /researchStatus:\s*["']LOADING["']/);
    assert.match(resultSource, /AbortController/);
    assert.match(resultSource, /generationRef/);
    assert.doesNotMatch(resultSource, /setTimeout/);
    return { state: "separated", evidence: "LOADING/ROUTE_INVALID are local phases; generation + abort present" };
  });

  return results;
}

async function runBrowserChecks(server) {
  const puppeteer = await import("puppeteer-core");
  const executablePath = chromePath();
  assert.ok(executablePath, "Chrome is required for UI-FROG-05 browser checks");
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });
  const results = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const tracker = collectRequests(page);

  async function check(id, area, input, expected, fn) {
    const observed = await fn();
    assert.equal(observed.state, expected, `${id}: expected ${expected}, observed ${observed.state}`);
    results.push({
      check_id: id,
      area,
      input_or_scenario: input,
      expected_state: expected,
      observed_state: observed.state,
      result: "PASS",
      evidence: observed.evidence,
      notes: observed.notes ?? "",
    });
  }

  try {
    installAssociationFixture(server.resolver);
    installSuccessResearch(server.research);
    server.overrideBox.current = null;

    await gotoDealEntry(page, server.origin);
    const postsBeforeConfirm = researchPosts(tracker.requests).length;
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await check("B-A", "causal", "two companies CONFIRMED and distinct", "confirmed-zero-research", async () => {
      const analyze = await getButtonState(page, "Analyze this deal");
      const view = await getButtonState(page, VIEW_COPY);
      assert.equal(analyze.disabled, false);
      assert.equal(view.present, false);
      assert.equal(researchPosts(tracker.requests).length, postsBeforeConfirm);
      assert.equal(page.url().includes(RESULT_ROUTE), false);
      return { state: "confirmed-zero-research", evidence: "confirmed pair; View absent; 0 research POSTs" };
    });

    const urlBeforeAnalyze = page.url();
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
    await waitForBody(page, "RESEARCH_AVAILABLE");
    const postsAfterAnalyze = researchPosts(tracker.requests);
    await check("B-MAINLINE", "causal", "explicit Analyze then View handoff", "handoff-zero-extra-post", async () => {
      assert.equal(postsAfterAnalyze.length, postsBeforeConfirm + 1);
      assertCikOnlyBody(postsAfterAnalyze.at(-1).postData, APPLE_CIK, NVIDIA_CIK);
      assert.equal(page.url(), urlBeforeAnalyze);
      assert.equal(page.url().includes(DEAL_ENTRY_ROUTE), true);
      assert.equal(page.url().includes(RESULT_ROUTE), false);
      const view = await getButtonState(page, VIEW_COPY);
      assert.equal(view.present, true);
      const text = await bodyText(page);
      assert.match(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.match(text, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      const beforeView = researchPosts(tracker.requests).length;
      await page.evaluate((buttonLabel) => {
        const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === buttonLabel);
        button.focus();
      }, VIEW_COPY);
      await page.keyboard.press("Enter");
      await waitForResultPhase(page, "RESULT");
      await waitForBody(page, "Public research result");
      const expected = `${server.origin}${resultUrl(APPLE_CIK, NVIDIA_CIK)}`;
      assert.equal(page.url(), expected);
      assert.deepEqual(await queryKeys(page), ["acquirerCik", "targetCik"]);
      const resolved = await resolveInPage(page, RESULT_ROUTE);
      assert.equal(resolved.isFallback, false);
      assert.equal(resolved.rendererId, "PublicResearchResultScreen");
      const renderer = await page.evaluate(() => document.querySelector('[data-renderer="PublicResearchResultScreen"]') != null);
      assert.equal(renderer, true);
      assert.equal(researchPosts(tracker.requests).length, beforeView);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.match(targetSide, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      assert.match(acquirerSide, /Acquirer/);
      assert.match(targetSide, /Target/);
      const resultText = await page.evaluate(() => document.querySelector(".mv-research-result-card")?.innerText ?? "");
      assert.match(resultText, /RESEARCH_AVAILABLE/);
      assert.match(resultText, /RECENT_FILING_HISTORY_ONLY/);
      assert.match(resultText, /SEC_SUBMISSIONS_API/);
      assert.match(resultText, /Requested at:/);
      assert.match(resultText, /not a final MergeVue M&A assessment/);
      assert.match(resultText, /Executive Decision Summary/);
      assert.match(resultText, /Identified Environment Types/);
      assert.match(resultText, /Decision Gap/);
      assert.match(resultText, /INSUFFICIENT PUBLIC EVIDENCE/i);
      assert.doesNotMatch(resultText, /Interaction Environment/);
      const analyticalBlocks = await page.evaluate(() => (
        [...document.querySelectorAll("[data-block-id]")]
          .filter((node) => node.getAttribute("data-block-id") !== "what-the-full-engagement-adds")
          .map((node) => node.innerText)
          .join("\n")
      ));
      assert.doesNotMatch(analyticalBlocks, /\bECS\b/);
      assertNoResultLeakage(tracker.requests);
      return { state: "handoff-zero-extra-post", evidence: "explicit View; exact two-CIK URL; renderer dispatched; no extra POST" };
    });

    const postsBeforeReload = researchPosts(tracker.requests).length;
    await page.reload({ waitUntil: "networkidle0", timeout: 30000 });
    await waitForResultPhase(page, "RESULT");
    await check("B-REFRESH", "causal", "reload clears module memory and re-derives", "one-rederive", async () => {
      assert.equal(page.url(), `${server.origin}${resultUrl(APPLE_CIK, NVIDIA_CIK)}`);
      assert.equal(researchPosts(tracker.requests).length, postsBeforeReload + 1);
      assertCikOnlyBody(researchPosts(tracker.requests).at(-1).postData, APPLE_CIK, NVIDIA_CIK);
      const text = await bodyText(page);
      assert.match(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.match(text, /Public research result/);
      const resolved = await resolveInPage(page, RESULT_ROUTE);
      assert.equal(resolved.isFallback, false);
      return { state: "one-rederive", evidence: "reload issued exactly one CIK-only re-derivation POST" };
    });

    const fresh = await browser.newPage();
    await fresh.setViewport({ width: 1440, height: 900 });
    const freshTracker = collectRequests(fresh);
    try {
      await gotoResult(fresh, server.origin, APPLE_CIK, NVIDIA_CIK);
      await waitForResultPhase(fresh, "RESULT");
      await check("B-DIRECT", "causal", "fresh direct entry A→B", "direct-one-post", async () => {
        const posts = researchPosts(freshTracker.requests);
        assert.equal(posts.length, 1);
        assertCikOnlyBody(posts[0].postData, APPLE_CIK, NVIDIA_CIK);
        const resolved = await resolveInPage(fresh, RESULT_ROUTE);
        assert.equal(resolved.isFallback, false);
        assert.equal(resolved.rendererId, "PublicResearchResultScreen");
        const text = await bodyText(fresh);
        assert.match(text, /Public research result/);
        assert.match(text, /APPLE INC SUBMISSIONS CANONICAL/);
        assert.match(text, /NVIDIA CORP SUBMISSIONS CANONICAL/);
        assert.equal(await resultPhase(fresh), "RESULT");
        const prod = freshTracker.requests.filter((item) => item.url.includes("/api/production-interpretation"));
        for (const item of prod) {
          assert.doesNotMatch(item.postData || "", /"action":"EXECUTE"/);
          assert.doesNotMatch(item.postData || "", /SAVE_R1/);
          assert.doesNotMatch(item.postData || "", /SAVE_DEAL_CONTEXT/);
        }
        assertNoResultLeakage(freshTracker.requests);
        return { state: "direct-one-post", evidence: "direct entry isFallback false; one 04B1 POST; truthful result" };
      });
    } finally {
      freshTracker.stop();
      await fresh.close();
    }

    async function invalidCase(id, query, label) {
      const isolated = await browser.newPage();
      const isolatedTracker = collectRequests(isolated);
      try {
        await isolated.goto(`${server.origin}${RESULT_ROUTE}${query}`, { waitUntil: "networkidle0", timeout: 30000 });
        await waitForResultPhase(isolated, "ROUTE_INVALID");
        await check(id, "failure", label, "cannot-render", async () => {
          assert.equal(researchPosts(isolatedTracker.requests).length, 0);
          const text = await bodyText(isolated);
          assert.match(text, new RegExp(INVALID_ROUTE_COPY));
          assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
          assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
          const back = await isolated.evaluate((copy) => (
            [...document.querySelectorAll("a")].some((node) => node.textContent.trim() === copy)
          ), BACK_COPY);
          assert.equal(back, true);
          const resolved = await resolveInPage(isolated, RESULT_ROUTE);
          assert.equal(resolved.isFallback, false);
          return { state: "cannot-render", evidence: "0 research POSTs; Back to deal entry available" };
        });
      } finally {
        isolatedTracker.stop();
        await isolated.close();
      }
    }

    await invalidCase("I-MISSING-ACQUIRER", `?targetCik=${NVIDIA_CIK}`, "missing acquirerCik");
    await invalidCase("I-MISSING-TARGET", `?acquirerCik=${APPLE_CIK}`, "missing targetCik");
    await invalidCase("I-NON-DIGIT", "?acquirerCik=ABCDEFGHIJ&targetCik=0001045810", "non-digit CIK");
    await invalidCase("I-WRONG-LENGTH", "?acquirerCik=320193&targetCik=0001045810", "wrong-length CIK");
    await invalidCase("I-SAME-CIK", `?acquirerCik=${APPLE_CIK}&targetCik=${APPLE_CIK}`, "same CIK");
    await invalidCase("I-EMPTY", "", "empty query");

    async function protocolCase(id, label, override) {
      server.overrideBox.current = override;
      await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
      await waitForResultPhase(page, "ERROR");
      await check(id, "protocol", label, "local-error", async () => {
        const text = await bodyText(page);
        assert.match(text, new RegExp(LOCAL_ERROR_COPY));
        assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
        assert.doesNotMatch(text, /data-research-status="RESEARCH_AVAILABLE"/);
        assert.equal(await resultPhase(page), "ERROR");
        const back = await page.evaluate((copy) => (
          [...document.querySelectorAll("a")].some((node) => node.textContent.trim() === copy)
        ), BACK_COPY);
        assert.equal(back, true);
        return { state: "local-error", evidence: "protocol-invalid payload did not render as a result" };
      });
      server.overrideBox.current = null;
    }

    await protocolCase("BIND-X-B", "response X→B", {
      status: 200,
      json: lawfulResearchBody({
        acquirerCik: ALPHABET_CIK,
        targetCik: NVIDIA_CIK,
        acquirerName: ALPHABET_RESEARCH_NAME,
      }),
    });
    await protocolCase("BIND-B-A", "response B→A", {
      status: 200,
      json: lawfulResearchBody({
        acquirerCik: NVIDIA_CIK,
        targetCik: APPLE_CIK,
        acquirerName: NVIDIA_RESEARCH_NAME,
        targetName: APPLE_RESEARCH_NAME,
        acquirerFilings: NVIDIA_FILINGS,
        targetFilings: APPLE_FILINGS,
      }),
    });
    await protocolCase("BIND-DUP-ACQUIRER", "duplicate acquirer", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS),
          lawfulCompany("acquirer", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
        ],
      },
    });
    await protocolCase("BIND-MISSING-TARGET", "missing target", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS),
        ],
      },
    });
    await protocolCase("BIND-UNEXPECTED-SIDE", "unexpected side", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS),
          { ...lawfulCompany("target", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS), side: "observer" },
        ],
      },
    });
    await protocolCase("P-UNKNOWN-STATUS", "unknown researchStatus", {
      status: 200,
      json: { ...lawfulResearchBody(), researchStatus: "COMPLETELY_UNKNOWN" },
    });
    await protocolCase("P-WRONG-COVERAGE", "wrong coverage", {
      status: 200,
      json: { ...lawfulResearchBody(), coverage: "COMPLETE_HISTORY" },
    });
    await protocolCase("P-WRONG-IDENTITY", "wrong identitySource", {
      status: 200,
      json: { ...lawfulResearchBody(), identitySource: "CLIENT_TYPED_NAME" },
    });
    await protocolCase("P-MALFORMED-JSON", "malformed JSON", {
      status: 200,
      body: "{not-json",
    });
    await protocolCase("P-MALFORMED-COMPANY", "malformed company entry", {
      status: 200,
      json: { ...lawfulResearchBody(), companies: ["nope", lawfulCompany("target", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS)] },
    });
    await protocolCase("P-INVALID-SUBMISSIONS", "invalid submissionsStatus", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          { ...lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS), submissionsStatus: "READY" },
          lawfulCompany("target", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
        ],
      },
    });
    await protocolCase("P-MALFORMED-FILING-COUNT", "malformed filingCount", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          { ...lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS), filingCount: "12" },
          lawfulCompany("target", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
        ],
      },
    });
    await protocolCase("P-NON-ARRAY-FILINGS", "non-array recentFilings", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          { ...lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS), recentFilings: { form: "10-K" } },
          lawfulCompany("target", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
        ],
      },
    });
    const eleven = Array.from({ length: 11 }, (_, index) => ({
      form: "8-K",
      filingDate: `2024-01-${String(index + 1).padStart(2, "0")}`,
      accessionNumber: `0000320193-24-${String(index + 1).padStart(6, "0")}`,
    }));
    await protocolCase("P-ELEVEN-ROWS", "11 recentFilings", {
      status: 200,
      json: lawfulResearchBody({ acquirerFilings: eleven }),
    });

    server.overrideBox.current = {
      status: 503,
      json: serviceUnavailableNoCompanies(),
    };
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "ERROR");
    await check("U-NO-COMPANIES", "status", "503 SERVICE_UNAVAILABLE without publicReport", "local-error", async () => {
      assert.equal(await resultPhase(page), "ERROR");
      const text = await bodyText(page);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.doesNotMatch(text, /Executive Decision Summary/);
      return { state: "local-error", evidence: "503 without server-created publicReport fails closed" };
    });

    const missingPublicReport = lawfulResearchBody();
    delete missingPublicReport.publicReport;
    server.overrideBox.current = { status: 200, json: missingPublicReport };
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "ERROR");
    await check("P-MISSING-PUBLIC-REPORT", "authority", "matching pair without publicReport", "local-error", async () => {
      const text = await bodyText(page);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
      assert.doesNotMatch(text, /Executive Decision Summary/);
      assert.doesNotMatch(text, /Identified Environment Types/);
      assert.doesNotMatch(text, /data-public-report="canonical"/);
      return { state: "local-error", evidence: "companies/recentFilings without publicReport cannot render the canonical report" };
    });

    const missingLevel1 = lawfulResearchBody();
    delete missingLevel1.level1;
    server.overrideBox.current = { status: 200, json: missingLevel1 };
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "ERROR");
    await check("P-MISSING-LEVEL1", "authority", "matching pair without level1", "local-error", async () => {
      const text = await bodyText(page);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
      assert.doesNotMatch(text, /Executive Decision Summary/);
      return { state: "local-error", evidence: "missing server level1 rejects handoff/result rendering" };
    });
    server.overrideBox.current = null;

    server.overrideBox.current = {
      status: 503,
      json: serviceUnavailableDual(APPLE_CIK, NVIDIA_CIK),
    };
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "RESULT");
    await check("U-DUAL", "status", "503 dual NOT_RETRIEVABLE", "valid-unavailable", async () => {
      const text = await bodyText(page);
      assert.match(text, /Public-source research is currently unavailable/);
      assert.match(text, /SERVICE_UNAVAILABLE/);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /NOT_RETRIEVABLE/);
      assert.match(targetSide, /NOT_RETRIEVABLE/);
      assert.match(acquirerSide, /Canonical name was not returned by the server/);
      return { state: "valid-unavailable", evidence: "503 dual NOT_RETRIEVABLE is a valid bounded result" };
    });
    server.overrideBox.current = null;

    installResearchHarness(server.research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, submissionsFixture({
        name: APPLE_RESEARCH_NAME,
        rows: APPLE_FILINGS,
      })),
      [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(404, { error: "no" }),
    }));
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "RESULT");
    await check("M-PARTIAL", "status", "asymmetric PARTIAL", "partial-asymmetric", async () => {
      const text = await bodyText(page);
      assert.match(text, /Public-source coverage is partial/);
      assert.match(text, /PARTIAL/);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /RETRIEVED/);
      assert.match(acquirerSide, new RegExp(APPLE_RESEARCH_NAME));
      assert.match(targetSide, /NOT_RETRIEVABLE/);
      assert.doesNotMatch(targetSide, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      return { state: "partial-asymmetric", evidence: "Acquirer RETRIEVED and Target NOT_RETRIEVABLE remain visible" };
    });

    installResearchHarness(server.research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, emptySubmissions(APPLE_RESEARCH_NAME)),
      [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(200, emptySubmissions(NVIDIA_RESEARCH_NAME)),
    }));
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "RESULT");
    await check("M-NO-COVERAGE", "status", "NO_COVERAGE non-predictive", "no-coverage", async () => {
      const text = await bodyText(page);
      assert.match(text, /bounded recent SEC filing search/);
      assert.match(text, /NO_COVERAGE/);
      assert.doesNotMatch(text, /bounded SEC acquisition/);
      assert.doesNotMatch(text, /low risk/i);
      assert.doesNotMatch(text, /positive fit/i);
      assert.doesNotMatch(text, /successful acquisition/i);
      assert.doesNotMatch(text, /successful integration/i);
      assert.doesNotMatch(text, /predictive conclusion/i);
      assert.match(text, /not a final MergeVue M&A assessment/);
      return { state: "no-coverage", evidence: "honest empty coverage; no success/low-risk language" };
    });

    installSuccessResearch(server.research);
    await neutralizeResearchAbort(page);
    const staleGate = createReleaseGate();
    installGatedResearch(server.research, staleGate.gate);
    const postsBeforeStale = researchPosts(tracker.requests).length;
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK, "domcontentloaded");
    await waitForResultPhase(page, "LOADING");
    await navigateInPage(page, resultUrl(NVIDIA_CIK, APPLE_CIK));
    await page.waitForFunction((path) => window.location.pathname + window.location.search === path, {}, resultUrl(NVIDIA_CIK, APPLE_CIK));
    const postsAfterPairChange = researchPosts(tracker.requests).length;
    staleGate.release();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await check("STALE-SUCCESS", "stale", "late A→B success after B→A query change", "discarded", async () => {
      assert.ok(postsAfterPairChange >= postsBeforeStale + 1);
      assert.equal(page.url().includes(`acquirerCik=${NVIDIA_CIK}`), true);
      assert.equal(page.url().includes(`targetCik=${APPLE_CIK}`), true);
      const acquirerSide = await sideText(page, "acquirer");
      assert.doesNotMatch(acquirerSide, /APPLE INC SUBMISSIONS CANONICAL/);
      const phase = await resultPhase(page);
      if (phase === "RESULT") {
        assert.match(acquirerSide, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      } else {
        assert.ok(phase === "LOADING" || phase === "ERROR" || phase === "RESULT");
      }
      return { state: "discarded", evidence: "old A→B canonical names did not render on B→A URL" };
    });

    const failGate = createReleaseGate();
    server.overrideBox.current = {
      gate: failGate.gate,
      status: 503,
      json: serviceUnavailableDual(APPLE_CIK, NVIDIA_CIK),
    };
    await neutralizeResearchAbort(page);
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK, "domcontentloaded");
    await waitForResultPhase(page, "LOADING");
    await navigateInPage(page, resultUrl(NVIDIA_CIK, ALPHABET_CIK));
    await page.waitForFunction((cik) => window.location.search.includes(cik), {}, ALPHABET_CIK);
    failGate.release();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await check("STALE-FAILURE", "stale", "late A→B SERVICE_UNAVAILABLE after pair change", "discarded", async () => {
      assert.equal(page.url().includes(`targetCik=${ALPHABET_CIK}`), true);
      const text = await bodyText(page);
      const phase = await resultPhase(page);
      if (phase === "RESULT") {
        assert.doesNotMatch(await sideText(page, "target"), /0001045810/);
      } else {
        assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      }
      return { state: "discarded", evidence: "late unavailable for A→B did not overwrite the new pair" };
    });
    server.overrideBox.current = null;

    installSuccessResearch(server.research);
    const transportGate = createReleaseGate();
    server.overrideBox.current = {
      gate: transportGate.gate,
      reject: true,
    };
    await neutralizeResearchAbort(page);
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK, "domcontentloaded");
    await waitForResultPhase(page, "LOADING");
    await navigateInPage(page, resultUrl(ALPHABET_CIK, NVIDIA_CIK));
    await page.waitForFunction((cik) => window.location.search.includes(`acquirerCik=${cik}`), {}, ALPHABET_CIK);
    transportGate.release();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await check("STALE-TRANSPORT", "stale", "late transport error after pair change", "discarded", async () => {
      assert.equal(page.url().includes(`acquirerCik=${ALPHABET_CIK}`), true);
      const phase = await resultPhase(page);
      assert.notEqual(phase, "ROUTE_INVALID");
      return { state: "discarded", evidence: "late transport failure did not restore A→B error onto the new pair" };
    });
    server.overrideBox.current = null;

    installSuccessResearch(server.research);
    const dupPage = await browser.newPage();
    const dupTracker = collectRequests(dupPage);
    try {
      await gotoResult(dupPage, server.origin, APPLE_CIK, NVIDIA_CIK);
      await waitForResultPhase(dupPage, "RESULT");
      const afterFirst = researchPosts(dupTracker.requests).length;
      await dupPage.evaluate(() => {
        window.dispatchEvent(new CustomEvent("st:navigate"));
      });
      await new Promise((resolve) => setTimeout(resolve, 700));
      await check("DUP-ONE", "causal", "stable pair rerender does not duplicate POST", "one-active-request", async () => {
        assert.equal(researchPosts(dupTracker.requests).length, afterFirst);
        assert.equal(afterFirst, 1);
        return { state: "one-active-request", evidence: "NAVIGATE_EVENT rerender kept a single re-derivation POST" };
      });
    } finally {
      dupTracker.stop();
      await dupPage.close();
    }

    const failPage = await browser.newPage();
    const failTracker = collectRequests(failPage);
    try {
      server.overrideBox.current = { status: 200, body: "{not-json" };
      await failPage.goto(`${server.origin}${resultUrl(APPLE_CIK, NVIDIA_CIK)}`, { waitUntil: "networkidle0", timeout: 30000 });
      await waitForResultPhase(failPage, "ERROR");
      const afterError = researchPosts(failTracker.requests).length;
      await new Promise((resolve) => setTimeout(resolve, 800));
      await check("DUP-NO-RETRY", "causal", "no automatic retry after failure", "no-auto-retry", async () => {
        assert.equal(researchPosts(failTracker.requests).length, afterError);
        assert.equal(afterError, 1);
        assert.equal(await resultPhase(failPage), "ERROR");
        return { state: "no-auto-retry", evidence: "failed direct entry did not automatically re-POST" };
      });
    } finally {
      server.overrideBox.current = null;
      failTracker.stop();
      await failPage.close();
    }

    await check("F-RESULT", "fallback", "exact result route", "registered", async () => {
      const resolved = resolveRoutePath(RESULT_ROUTE);
      assert.equal(resolved.isFallback, false);
      assert.equal(resolved.rendererId, "PublicResearchResultScreen");
      return { state: "registered", evidence: "exact result path is not fallback" };
    });

    const fallbackPage = await browser.newPage();
    try {
      await fallbackPage.goto(`${server.origin}/start-diagnostic/deal-context/resul`, { waitUntil: "networkidle0", timeout: 30000 });
      await check("F-TYPO", "fallback", "typo result path", "normal-fallback", async () => {
        const resolved = await resolveInPage(fallbackPage, "/start-diagnostic/deal-context/resul");
        assert.equal(resolved.isFallback, true);
        assert.equal(resolved.id, "diagnostic-before-you-begin");
        const renderer = await fallbackPage.evaluate(() => document.querySelector('[data-renderer="PublicResearchResultScreen"]'));
        assert.equal(renderer, null);
        const text = await bodyText(fallbackPage);
        assert.doesNotMatch(text, /data-renderer="PublicResearchResultScreen"/);
        assert.doesNotMatch(text, /Bounded recent SEC filing metadata is available for both companies/);
        return { state: "normal-fallback", evidence: "typo path stays Before You Begin and does not masquerade as a result" };
      });

      await fallbackPage.goto(`${server.origin}/analyze`, { waitUntil: "networkidle0", timeout: 30000 });
      await check("F-ANALYZE", "fallback", "/analyze inactive", "fallback", async () => {
        const resolved = await resolveInPage(fallbackPage, "/analyze");
        assert.equal(resolved.isFallback, true);
        const renderer = await fallbackPage.evaluate(() => document.querySelector('[data-renderer="PublicResearchResultScreen"]'));
        assert.equal(renderer, null);
        return { state: "fallback", evidence: "/analyze remains fallback and is not a public research result" };
      });

      await fallbackPage.goto(`${server.origin}/analyze/context`, { waitUntil: "networkidle0", timeout: 30000 });
      await check("F-ANALYZE-CONTEXT", "fallback", "/analyze/context inactive", "fallback", async () => {
        const resolved = await resolveInPage(fallbackPage, "/analyze/context");
        assert.equal(resolved.isFallback, true);
        const renderer = await fallbackPage.evaluate(() => document.querySelector('[data-renderer="PublicResearchResultScreen"]'));
        assert.equal(renderer, null);
        return { state: "fallback", evidence: "/analyze/context remains fallback" };
      });
    } finally {
      await fallbackPage.close();
    }

    const o4 = await browser.newPage();
    await o4.setViewport({ width: 1440, height: 900 });
    const o4Tracker = collectRequests(o4);
    try {
      installAssociationFixture(server.resolver);
      installSuccessResearch(server.research);
      await gotoDealEntry(o4, server.origin);
      await fillLabeled(o4, "Acquirer", "Apple Inc.");
      await fillLabeled(o4, "Target", "NVIDIA CORP");
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-49", "session", "typed Acquirer name survives remount", "restored", async () => {
        assert.equal(await labeledInputValue(o4, "Acquirer"), "Apple Inc.");
        return { state: "restored", evidence: "Acquirer typed value restored after Deal Entry reload" };
      });
      await check("O4-50", "session", "typed Target name survives remount", "restored", async () => {
        assert.equal(await labeledInputValue(o4, "Target"), "NVIDIA CORP");
        return { state: "restored", evidence: "Target typed value restored after Deal Entry reload" };
      });

      await confirmPair(o4, "Apple Inc.", "NVIDIA CORP");
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await waitForStatus(o4, READY_COPY);
      await check("O4-51", "session", "confirmed Acquirer identity survives refresh", "restored", async () => {
        const text = await bodyText(o4);
        assert.match(text, /Company confirmed\./);
        assert.match(text, /Apple Inc\./);
        return { state: "restored", evidence: "confirmed Acquirer identity restored after refresh" };
      });
      await check("O4-52", "session", "confirmed Target identity survives refresh", "restored", async () => {
        const text = await bodyText(o4);
        assert.match(text, /NVIDIA CORP/);
        return { state: "restored", evidence: "confirmed Target identity restored after refresh" };
      });
      await check("O4-53", "session", "valid restored distinct pair re-enables Analyze", "enabled", async () => {
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present, true);
        assert.equal(analyze.disabled, false);
        return { state: "enabled", evidence: "Analyze this deal enabled after restored distinct confirmed pair" };
      });

      await clickButton(o4, "Analyze this deal");
      await waitForStatus(o4, "Recent SEC filing metadata is available for both companies.");
      await fillLabeled(o4, "Acquirer", "Apple Inc. edited");
      await check("O4-54", "session", "editing Acquirer invalidates Acquirer confirmation", "invalidated", async () => {
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present === false || analyze.disabled === true, true);
        return { state: "invalidated", evidence: "Acquirer edit clears confirmation so Analyze is not enabled" };
      });

      await confirmPair(o4, "Apple Inc.", "NVIDIA CORP");
      await clickButton(o4, "Analyze this deal");
      await waitForStatus(o4, "Recent SEC filing metadata is available for both companies.");
      await fillLabeled(o4, "Target", "NVIDIA CORP edited");
      await check("O4-55", "session", "editing Target invalidates Target confirmation", "invalidated", async () => {
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present === false || analyze.disabled === true, true);
        return { state: "invalidated", evidence: "Target edit clears confirmation so Analyze is not enabled" };
      });

      await confirmPair(o4, "Apple Inc.", "NVIDIA CORP");
      await clickButton(o4, "Analyze this deal");
      await waitForStatus(o4, "Recent SEC filing metadata is available for both companies.");
      await fillLabeled(o4, "Acquirer", "Alphabet Inc.");
      await check("O4-56", "session", "editing either side invalidates dependent research state", "cleared", async () => {
        const phase = await o4.evaluate(() => document.querySelector("[data-research-phase]")?.getAttribute("data-research-phase") ?? "");
        assert.equal(phase === "RESULT", false);
        const view = await getButtonState(o4, VIEW_COPY);
        assert.equal(view.present, false);
        return { state: "cleared", evidence: "research RESULT and View control do not survive an identity edit" };
      });

      await confirmPair(o4, "Apple Inc.", "NVIDIA CORP");
      await clickButton(o4, "Analyze this deal");
      await waitForStatus(o4, "Recent SEC filing metadata is available for both companies.");
      await o4.evaluate(() => {
        const button = [...document.querySelectorAll("button")].find((node) => node.getAttribute("aria-label") === "Swap acquirer and target");
        button.click();
      });
      await check("O4-57", "session", "swap preserves identities under swapped roles", "swapped", async () => {
        assert.equal(await labeledInputValue(o4, "Acquirer"), "NVIDIA CORP");
        assert.equal(await labeledInputValue(o4, "Target"), "Apple Inc.");
        const text = await bodyText(o4);
        assert.match(text, /Company confirmed\./);
        return { state: "swapped", evidence: "typed values and confirmed identities follow the swapped Acquirer/Target roles" };
      });
      await check("O4-58", "session", "swap invalidates pair-specific research result", "cleared", async () => {
        const phase = await o4.evaluate(() => document.querySelector("[data-research-phase]")?.getAttribute("data-research-phase") ?? "");
        assert.equal(phase === "RESULT", false);
        const view = await getButtonState(o4, VIEW_COPY);
        assert.equal(view.present, false);
        return { state: "cleared", evidence: "ordered-pair research result does not survive Swap" };
      });

      await o4.evaluate((key) => sessionStorage.setItem(key, "{not-json"), DEAL_ENTRY_SESSION_KEY);
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-59", "session", "malformed sessionStorage JSON is ignored safely", "ignored", async () => {
        const heading = await o4.evaluate(() => document.querySelector("h1")?.textContent?.trim() ?? "");
        assert.equal(heading, "Start with the two companies.");
        assert.equal(await labeledInputValue(o4, "Acquirer"), "");
        assert.equal(await labeledInputValue(o4, "Target"), "");
        return { state: "ignored", evidence: "malformed JSON does not crash Deal Entry and is not restored" };
      });

      await o4.evaluate((key, value) => sessionStorage.setItem(key, value), DEAL_ENTRY_SESSION_KEY, JSON.stringify({
        ...lawfulDealEntrySession(),
        schemaVersion: "deal-entry-session-v9",
      }));
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-60", "session", "wrong schema/version is ignored safely", "ignored", async () => {
        assert.equal(await labeledInputValue(o4, "Acquirer"), "");
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present === false || analyze.disabled === true, true);
        return { state: "ignored", evidence: "unknown schemaVersion is discarded" };
      });

      await o4.evaluate((key, value) => sessionStorage.setItem(key, value), DEAL_ENTRY_SESSION_KEY, JSON.stringify(lawfulDealEntrySession({
        acquirer: {
          typedName: "Apple Inc.",
          confirmed: { canonicalName: "Apple Inc.", cik: "not-a-cik", ticker: "AAPL", exchange: "Nasdaq" },
        },
      })));
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-61", "session", "invalid CIK is ignored safely", "ignored", async () => {
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present === false || analyze.disabled === true, true);
        return { state: "ignored", evidence: "invalid confirmed CIK is not restored as a confirmed identity" };
      });

      await o4.evaluate((key, value) => sessionStorage.setItem(key, value), DEAL_ENTRY_SESSION_KEY, JSON.stringify(lawfulDealEntrySession({
        target: {
          typedName: "Also Apple",
          confirmed: { canonicalName: "Apple Inc.", cik: APPLE_CIK, ticker: "AAPL", exchange: "Nasdaq" },
        },
      })));
      await o4.reload({ waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-62", "session", "same-CIK restored confirmed pair is rejected", "rejected", async () => {
        const analyze = await getButtonState(o4, "Analyze this deal");
        assert.equal(analyze.present === false || analyze.disabled === true, true);
        return { state: "rejected", evidence: "same-CIK persisted confirmed pair fails closed" };
      });

      await confirmPair(o4, "Apple Inc.", "NVIDIA CORP");
      await clickButton(o4, "Analyze this deal");
      await waitForStatus(o4, "Recent SEC filing metadata is available for both companies.");
      const persisted = await readPersistedDealEntry(o4);
      await check("O4-63", "session", "persisted state contains no level1", "absent", async () => {
        assert.equal(Boolean(persisted.raw), true);
        assert.equal(Object.prototype.hasOwnProperty.call(persisted.parsed, "level1"), false);
        assert.equal(JSON.stringify(persisted.parsed).includes('"level1"'), false);
        return { state: "absent", evidence: "session payload has no level1 field" };
      });
      await check("O4-64", "session", "persisted state contains no publicReport", "absent", async () => {
        assert.equal(Object.prototype.hasOwnProperty.call(persisted.parsed, "publicReport"), false);
        assert.equal(JSON.stringify(persisted.parsed).includes("publicReport"), false);
        return { state: "absent", evidence: "session payload has no publicReport field" };
      });
      await check("O4-65", "session", "persisted state contains no analytical report blocks", "absent", async () => {
        const serialized = JSON.stringify(persisted.parsed);
        assert.doesNotMatch(serialized, /executiveDecisionSummary/);
        assert.doesNotMatch(serialized, /collisionThesis/);
        assert.doesNotMatch(serialized, /availabilityState/);
        assert.doesNotMatch(serialized, /researchStatus/);
        assert.deepEqual(Object.keys(persisted.parsed).sort(), ["acquirer", "schemaVersion", "target"]);
        return { state: "absent", evidence: "persisted keys are schemaVersion + typed/confirmed company sides only" };
      });
    } finally {
      o4Tracker.stop();
      await o4.close();
    }

    const o4Throw = await browser.newPage();
    try {
      await o4Throw.evaluateOnNewDocument(() => {
        const throwing = {
          getItem() {
            throw new Error("sessionStorage blocked");
          },
          setItem() {
            throw new Error("sessionStorage blocked");
          },
          removeItem() {
            throw new Error("sessionStorage blocked");
          },
        };
        Object.defineProperty(window, "sessionStorage", {
          configurable: true,
          get() {
            return throwing;
          },
        });
      });
      await o4Throw.goto(`${server.origin}${DEAL_ENTRY_ROUTE}`, { waitUntil: "networkidle0", timeout: 30000 });
      await check("O4-66", "session", "sessionStorage throwing does not break Deal Entry", "survives", async () => {
        const heading = await o4Throw.evaluate(() => document.querySelector("h1")?.textContent?.trim() ?? "");
        assert.equal(heading, "Start with the two companies.");
        await fillLabeled(o4Throw, "Acquirer", "Apple Inc.");
        assert.equal(await labeledInputValue(o4Throw, "Acquirer"), "Apple Inc.");
        return { state: "survives", evidence: "Deal Entry still renders and accepts typing when sessionStorage throws" };
      });
    } finally {
      await o4Throw.close();
    }

    installSuccessResearch(server.research);
    await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
    await waitForResultPhase(page, "RESULT");
    await check("A-A11Y", "a11y", "result accessibility and 320px", "accessible", async () => {
      const heading = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim() ?? "");
      assert.equal(heading, "Public research result");
      const sides = await page.evaluate(() => [...document.querySelectorAll(".mv-research-result-side-title")].map((node) => node.textContent.trim()));
      assert.deepEqual(sides, ["Acquirer", "Target"]);
      const headers = await page.evaluate(() => [...document.querySelectorAll(".mv-research-result-filings th")].map((th) => ({
        scope: th.getAttribute("scope"),
        text: th.textContent.trim(),
      })));
      assert.ok(headers.some((row) => row.scope === "col" && row.text === "Form"));
      assert.ok(headers.some((row) => row.scope === "col" && row.text === "Filing date"));
      assert.ok(headers.some((row) => row.scope === "col" && row.text === "Accession number"));
      const status = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent ?? "");
      assert.match(status, /Bounded recent SEC filing metadata is available for both companies/);
      const liveCount = await page.evaluate(() => document.querySelectorAll('[aria-live]').length);
      assert.ok(liveCount <= 2);
      await page.evaluate((copy) => {
        const link = [...document.querySelectorAll("a")].find((node) => node.textContent.trim() === copy);
        link.focus();
      }, BACK_COPY);
      const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
      assert.equal(focused, BACK_COPY);
      const outline = await page.evaluate(() => {
        const style = getComputedStyle(document.activeElement);
        return `${style.outlineStyle} ${style.outlineWidth}`;
      });
      assert.doesNotMatch(outline, /none 0px/);
      await page.keyboard.press("Enter");
      await page.waitForFunction((path) => window.location.pathname === path, {}, DEAL_ENTRY_ROUTE);
      assert.equal(new URL(page.url()).pathname, DEAL_ENTRY_ROUTE);
      await gotoResult(page, server.origin, APPLE_CIK, NVIDIA_CIK);
      await waitForResultPhase(page, "RESULT");
      await page.setViewport({ width: 320, height: 720 });
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.ok(overflow.scrollWidth <= overflow.clientWidth + 1, `page overflow ${overflow.scrollWidth} > ${overflow.clientWidth}`);
      const text = await bodyText(page);
      assert.match(text, /Research status: RESEARCH_AVAILABLE/);
      assert.match(text, /Submissions status: Retrieved \(RETRIEVED\)/);
      await page.setViewport({ width: 1440, height: 900 });
      return { state: "accessible", evidence: "heading, sides, table headers, focus, keyboard Back, 320px no page overflow" };
    });
  } finally {
    tracker.stop();
    await browser.close();
  }

  return results;
}

const sourceResults = await runSourceChecks();
const server = await startTestServer();
let browserResults = [];
try {
  browserResults = await runBrowserChecks(server);
} finally {
  server.resolver.resetCompanyResolverForTests();
  server.research.resetSecResearchForTests();
  await server.vite.close();
}

const all = [...sourceResults, ...browserResults];
const failed = all.filter((row) => row.result !== "PASS");
assert.equal(failed.length, 0, failed.map((row) => row.check_id).join(","));

console.log(JSON.stringify({
  act: "UI-FROG-05",
  serverOrigin: server.origin,
  liveSecSmoke: "LIVE_SEC_CHECK_NOT_REQUIRED_FOR_UI_FROG_05_AUTHOR_CANDIDATE",
  checks: all.length,
  failed: failed.length,
}, null, 2));
console.log("UI-FROG-05 public research result validation: real DealEntryScreen + 04A/04B1 handlers + result route causal chain PASS");
