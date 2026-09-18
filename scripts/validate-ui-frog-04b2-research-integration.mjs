import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { resolveRoutePath } from "../src/routes/routeModel.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");
const TEST_UA = "MergeVue-UI-FROG-04B2-Test contact@example.test";
const APPLE_CIK = "0000320193";
const ALPHABET_CIK = "0001652044";
const NVIDIA_CIK = "0001045810";
const DUPLICATE_A_CIK = "0001111111";
const SUBMISSIONS_PREFIX = "https://data.sec.gov/submissions/CIK";
const SUBMISSIONS_SUFFIX = ".json";
const RESEARCH_PATH = "/api/start-public-research";
const RESOLVE_PATH = "/api/resolve-company";
const DEAL_ENTRY_ROUTE = "/start-diagnostic/deal-context";
const APPLE_RESEARCH_NAME = "APPLE INC SUBMISSIONS CANONICAL";
const NVIDIA_RESEARCH_NAME = "NVIDIA CORP SUBMISSIONS CANONICAL";
const ALPHABET_RESEARCH_NAME = "ALPHABET INC SUBMISSIONS CANONICAL";
const LOCAL_ERROR_COPY = "The public-source research request could not be completed. No research result is shown.";
const READY_COPY = "Companies confirmed. Public-source research is ready to start.";
const RESEARCHING_COPY = "Researching recent SEC filing metadata…";

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

const ASSOCIATION_FIXTURE = {
  fields: ["cik", "name", "ticker", "exchange"],
  data: [
    [320193, "Apple Inc.", "AAPL", "Nasdaq"],
    [320193, "Apple Inc.", "AAPL-W", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOGL", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOG", "Nasdaq"],
    [1045810, "NVIDIA CORP", "NVDA", "Nasdaq"],
    [1067984, "BERKSHIRE HATHAWAY INC", "BRK-A", "NYSE"],
    [1404123, "Apple Hospitality REIT, Inc.", "APLE", "NYSE"],
    [1111111, "Duplicate Name Inc.", "AAA", "NYSE"],
    [2222222, "Duplicate Name Inc.", "BBB", "Nasdaq"],
    [3000001, "Many Name Inc.", "M1", "NYSE"],
    [3000002, "Many Name Inc.", "M2", "NYSE"],
    [3000003, "Many Name Inc.", "M3", "NYSE"],
    [3000004, "Many Name Inc.", "M4", "NYSE"],
    [3000005, "Many Name Inc.", "M5", "NYSE"],
    [3000006, "Many Name Inc.", "M6", "NYSE"],
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
    [submissionsUrl(DUPLICATE_A_CIK)]: jsonFetchResponse(200, submissionsFixture({
      name: "DUPLICATE NAME SEC CANONICAL",
      rows: [APPLE_FILINGS[0]],
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

function testApiPlugin(getResolveApi, getResearchApi, getOverride) {
  return {
    name: "ui-frog-04b2-test-api",
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
  for (const port of [5190, 5191, 5192, 5193, 5194, 5195]) {
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
      const resolveHandler = await vite.ssrLoadModule("/api/resolve-company.ts");
      const researchHandler = await vite.ssrLoadModule("/api/start-public-research.ts");
      return {
        vite,
        port,
        origin: `http://127.0.0.1:${port}`,
        resolver,
        research,
        resolveHandler,
        researchHandler,
        overrideBox,
      };
    } catch (error) {
      await vite.close().catch(() => {});
      lastError = error;
      if (error && error.code !== "EADDRINUSE") throw error;
    }
  }
  throw lastError ?? new Error("Unable to bind UI-FROG-04B2 test server");
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

async function statusText(page) {
  return page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim() ?? "");
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText);
}

async function waitForStatus(page, snippet, timeout = 8000) {
  await page.waitForFunction((text) => {
    const node = document.querySelector('[role="status"]');
    return Boolean(node && node.textContent.includes(text));
  }, { timeout }, snippet);
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

async function waitForConfirmEnabled(page) {
  await waitForButton(page, "Confirm companies", true);
}

async function researchPhase(page) {
  return page.evaluate(() => document.querySelector("[data-research-phase]")?.getAttribute("data-research-phase") ?? "");
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
  assert.equal("canonicalName" in body.acquirer, false);
  assert.equal("name" in body.acquirer, false);
  assert.equal("ticker" in body.acquirer, false);
  assert.equal("query" in body, false);
  assert.equal("userAgent" in body, false);
}

async function analyzeContrast(page) {
  return page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === "Analyze this deal");
    function parse(color) {
      const match = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
      if (!match) return null;
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] == null ? 1 : Number(match[4]),
      };
    }
    function lin(channel) {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    }
    function lum(color) {
      return 0.2126 * lin(color.r) + 0.7152 * lin(color.g) + 0.0722 * lin(color.b);
    }
    function opaqueBackground(node) {
      let current = node;
      while (current) {
        const parsed = parse(getComputedStyle(current).backgroundColor);
        if (parsed && parsed.a >= 1) return parsed;
        current = current.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    const style = getComputedStyle(button);
    const fg = parse(style.color);
    const bg = opaqueBackground(button);
    const first = lum(fg);
    const second = lum(bg);
    const high = Math.max(first, second);
    const low = Math.min(first, second);
    return {
      disabled: button.disabled,
      color: style.color,
      backgroundColor: style.backgroundColor,
      ratio: (high + 0.05) / (low + 0.05),
    };
  });
}

async function neutralizeResearchAbort(page) {
  await page.evaluate(() => {
    if (window.__mv04b2AbortNeutralized) return;
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
    window.__mv04b2AbortNeutralized = true;
  });
}

async function gotoDealEntry(page, origin) {
  await page.goto(`${origin}${DEAL_ENTRY_ROUTE}`, { waitUntil: "networkidle0", timeout: 30000 });
}

async function confirmPair(page, acquirer, target) {
  await fillLabeled(page, "Acquirer", acquirer);
  await fillLabeled(page, "Target", target);
  await waitForConfirmEnabled(page);
  await clickButton(page, "Confirm companies");
  await waitForStatus(page, READY_COPY);
}

function collectResearchPosts(page) {
  const posts = [];
  const listener = (request) => {
    if (request.url().includes(RESEARCH_PATH) && request.method() === "POST") {
      posts.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData() ?? "",
      });
    }
  };
  page.on("request", listener);
  return {
    posts,
    stop() {
      page.off("request", listener);
    },
  };
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
  const cssSource = await read("src/styles/public-deal-entry.css");
  const viteSource = await read("vite.config.js");
  const appSource = await read("src/App.jsx");
  const routeSource = await read("src/routes/routeModel.js");
  const resolvePairSource = await read("api/resolve-pair.ts");
  const packageSource = await read("package.json");

  await check("S-ENTRYPOINT", "source", "DealEntryScreen uses 04B1 endpoint", RESEARCH_PATH, async () => {
    assert.match(entrySource, /START_PUBLIC_RESEARCH_PATH = "\/api\/start-public-research"/);
    assert.match(entrySource, /fetch\(START_PUBLIC_RESEARCH_PATH/);
    assert.match(entrySource, /acquirer: \{ cik: snapshot\.acquirerCik \}/);
    assert.match(entrySource, /target: \{ cik: snapshot\.targetCik \}/);
    return { state: RESEARCH_PATH, evidence: "CIK-only POST /api/start-public-research from Analyze click" };
  });

  await check("S-NO-BROWSER-SEC", "bypass", "no browser→SEC", "absent", async () => {
    assert.doesNotMatch(entrySource, /sec\.gov/);
    assert.doesNotMatch(entrySource, /data\.sec\.gov/);
    assert.doesNotMatch(appSource, /start-public-research/);
    return { state: "absent", evidence: "DealEntryScreen has no sec.gov fetch" };
  });

  await check("S-NO-RESOLVE-PAIR", "bypass", "no /api/resolve-pair", "absent", async () => {
    assert.doesNotMatch(entrySource, /resolve-pair/);
    assert.match(resolvePairSource, /buildPairDeliverable/);
    return { state: "absent", evidence: "research UI does not reuse resolve-pair" };
  });

  await check("S-NO-ROUTE", "source", "explicit result handoff only", "explicit-result-handoff", async () => {
    const resultSource = await read("src/screens/public/PublicResearchResultScreen.jsx");
    assert.match(entrySource, /View public research result/);
    assert.match(entrySource, /openPublicResearchResult/);
    assert.match(entrySource, /from "\.\/PublicResearchResultScreen\.jsx"/);
    assert.doesNotMatch(entrySource, /navigate\(/);
    assert.doesNotMatch(entrySource, /useEffect\([\s\S]{0,500}openPublicResearchResult/);
    assert.doesNotMatch(entrySource, /setTimeout/);
    assert.doesNotMatch(entrySource, /\/analyze/);
    assert.doesNotMatch(entrySource, /\/screen-10/);
    assert.doesNotMatch(entrySource, /\/screen-11/);
    assert.doesNotMatch(entrySource, /\/screen-12/);
    assert.match(resultSource, /navigate\(/);
    assert.match(resultSource, /PUBLIC_RESEARCH_RESULT_ROUTE = "\/start-diagnostic\/deal-context\/result"/);
    assert.match(resultSource, /\$\{PUBLIC_RESEARCH_RESULT_ROUTE\}\?acquirerCik=\$\{pair\.acquirerCik\}&targetCik=\$\{pair\.targetCik\}/);
    assert.doesNotMatch(resultSource, /analysisRequestId/);
    assert.doesNotMatch(viteSource, /start-public-research/);
    assert.equal(resolveRoutePath("/analyze").isFallback, true);
    assert.equal(resolveRoutePath("/analyze/context").isFallback, true);
    assert.equal(resolveRoutePath(DEAL_ENTRY_ROUTE).id, "deal-context-acquisition-motive");
    assert.equal(resolveRoutePath("/start-diagnostic/deal-context/result").id, "deal-context-public-result");
    assert.equal(resolveRoutePath("/start-diagnostic/deal-context/result").isFallback, false);
    assert.equal(resolveRoutePath("/start-diagnostic/deal-context/result").rendererId, "PublicResearchResultScreen");
    assert.doesNotMatch(routeSource, /start-public-research/);
    return {
      state: "explicit-result-handoff",
      evidence: "research completion does not navigate; View public research result required; CIK-only result route; /analyze inactive",
    };
  });

  await check("S-NO-FAKE-STATUS", "source", "local phase is not server researchStatus", "separated", async () => {
    assert.match(entrySource, /RESEARCH_REQUESTING = "REQUESTING"/);
    assert.doesNotMatch(entrySource, /researchStatus:\s*["']RESEARCHING["']/);
    assert.doesNotMatch(entrySource, /researchStatus\s*=\s*["']RESEARCHING["']/);
    assert.match(entrySource, /researchGeneration/);
    assert.match(entrySource, /AbortController/);
    assert.doesNotMatch(entrySource, /setTimeout/);
    return { state: "separated", evidence: "REQUESTING is a local UI phase; generation + abort present" };
  });

  await check("S-CSS-SCOPE", "source", "deal-entry CSS remains scoped", "scoped", async () => {
    assert.match(cssSource, /\.mv-deal-entry-analyze:not\(:disabled\)/);
    assert.match(cssSource, /\.mv-deal-entry-research/);
    for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
      assert.doesNotMatch(cssSource, pattern);
    }
    return { state: "scoped", evidence: "enabled Analyze + research surface styles; no global selectors" };
  });

  await check("S-PACKAGE", "source", "package.json not used as sixth path", "unchanged-script-surface", async () => {
    assert.doesNotMatch(packageSource, /validate-ui-frog-04b2/);
    return { state: "unchanged-script-surface", evidence: "04B2 validator is an explicit node command" };
  });

  return results;
}

async function runBrowserChecks(server) {
  const puppeteer = await import("puppeteer-core");
  const executablePath = chromePath();
  assert.ok(executablePath, "Chrome is required for UI-FROG-04B2 browser checks");
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });
  const results = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const tracker = collectResearchPosts(page);

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
    await check("B-A", "frontend", "no confirmed pair", "analyze-disabled", async () => {
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.present, true);
      assert.equal(analyze.disabled, true);
      assert.equal(analyze.type, "button");
      assert.equal(tracker.posts.length, 0);
      return { state: "analyze-disabled", evidence: "empty deal entry keeps Analyze disabled" };
    });

    await fillLabeled(page, "Acquirer", "Apple Inc.");
    await fillLabeled(page, "Target", "Duplicate Name Inc.");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await page.waitForSelector("select", { timeout: 8000 });
    await check("B-B", "frontend", "only one confirmed side", "analyze-disabled", async () => {
      await waitForStatus(page, "Which company do you mean?");
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, true);
      assert.equal(tracker.posts.length, 0);
      const text = await bodyText(page);
      assert.match(text, /Company confirmed/);
      return { state: "analyze-disabled", evidence: "Apple CONFIRMED + Duplicate Name AMBIGUOUS does not enable Analyze" };
    });

    const postsBeforeAmbiguitySelect = tracker.posts.length;
    await page.$eval("select", (node) => {
      node.selectedIndex = 1;
      node.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await waitForStatus(page, READY_COPY);
    await check("B-C-AMBIGUOUS", "frontend", "ambiguity confirmation does not auto-research", "analyze-enabled-zero-posts", async () => {
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, false);
      assert.equal(tracker.posts.length, postsBeforeAmbiguitySelect);
      return { state: "analyze-enabled-zero-posts", evidence: "candidate confirmation enables Analyze and does not POST research" };
    });

    await gotoDealEntry(page, server.origin);
    const postsBeforeConfirm = tracker.posts.length;
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await check("B-C-D", "frontend", "two distinct confirmed identities", "enabled-zero-auto-posts", async () => {
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, false);
      assert.equal(tracker.posts.length, postsBeforeConfirm);
      const view = await getButtonState(page, "View public research result");
      assert.equal(view.present, false);
      const status = await statusText(page);
      assert.match(status, /Public-source research is ready to start/);
      const text = await bodyText(page);
      assert.match(text, /This step retrieves recent SEC filing metadata only/);
      assert.doesNotMatch(text, /Public-source analysis is not connected/);
      return { state: "enabled-zero-auto-posts", evidence: "confirmation enables Analyze and issues zero research POSTs" };
    });

    const contrast = await analyzeContrast(page);
    await check("B-CONTRAST", "a11y", "enabled Analyze contrast", ">=4.5", async () => {
      assert.equal(contrast.disabled, false);
      assert.ok(contrast.ratio >= 4.5, `contrast ${contrast.ratio} < 4.5`);
      return {
        state: ">=4.5",
        evidence: `computed ${contrast.ratio.toFixed(2)}:1 from ${contrast.color} on ${contrast.backgroundColor}`,
      };
    });

    const urlBeforeAnalyze = page.url();
    const pendingGate = createReleaseGate();
    installGatedResearch(server.research, pendingGate.gate);
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, RESEARCHING_COPY);
    await check("B-G", "causal", "pending state before settlement", "requesting", async () => {
      assert.equal(tracker.posts.length, postsBeforeConfirm + 1);
      assertCikOnlyBody(tracker.posts.at(-1).postData, APPLE_CIK, NVIDIA_CIK);
      const analyzePending = await getButtonState(page, "Analyze this deal");
      assert.equal(analyzePending.disabled, true);
      const viewPending = await getButtonState(page, "View public research result");
      assert.equal(viewPending.present, false);
      const text = await bodyText(page);
      assert.match(text, /Researching recent SEC filing metadata/);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      assert.equal(await researchPhase(page), "REQUESTING");
      assert.equal(page.url(), urlBeforeAnalyze);
      return { state: "requesting", evidence: "in-flight copy visible; Analyze disabled; still on deal-entry route" };
    });
    pendingGate.release();
    await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
    await waitForBody(page, "RESEARCH_AVAILABLE");
    await check("B-E-K", "causal", "explicit Analyze click", "one-cik-only-post-available", async () => {
      assert.equal(tracker.posts.length, postsBeforeConfirm + 1);
      assertCikOnlyBody(tracker.posts.at(-1).postData, APPLE_CIK, NVIDIA_CIK);
      const analyzeSettled = await getButtonState(page, "Analyze this deal");
      assert.equal(analyzeSettled.disabled, false);
      const viewSettled = await getButtonState(page, "View public research result");
      assert.equal(viewSettled.present, true);
      const text = await bodyText(page);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(text, /RESEARCH_AVAILABLE/);
      assert.match(text, /Recent SEC filing metadata is available for both companies/);
      assert.match(acquirerSide, /Canonical name: APPLE INC SUBMISSIONS CANONICAL/);
      assert.match(targetSide, /Canonical name: NVIDIA CORP SUBMISSIONS CANONICAL/);
      assert.doesNotMatch(acquirerSide, /Canonical name: Apple Inc/);
      assert.doesNotMatch(targetSide, /Canonical name: NVIDIA CORP$/m);
      assert.match(text, /0000320193-24-000111/);
      assert.match(text, /0001045810-25-000333/);
      const appleIndex = text.indexOf("0000320193-24-000111");
      const secondApple = text.indexOf("0000320193-24-000222");
      assert.ok(appleIndex >= 0 && secondApple > appleIndex, "server filing order preserved");
      assert.doesNotMatch(text, /sec\.gov\/Archives/);
      assert.doesNotMatch(text, /http:\/\/www\.sec\.gov/);
      assert.doesNotMatch(text, /https:\/\/www\.sec\.gov/);
      assert.equal(page.url(), urlBeforeAnalyze);
      assert.equal(page.url().includes(DEAL_ENTRY_ROUTE), true);
      assert.match(acquirerSide, /RETRIEVED/);
      assert.match(targetSide, /RETRIEVED/);
      return { state: "one-cik-only-post-available", evidence: "one CIK-only POST; server canonical names and filing rows rendered; no navigation" };
    });

    await check("M-AVAILABLE", "status", "RESEARCH_AVAILABLE visible", "RESEARCH_AVAILABLE", async () => {
      const status = await statusText(page);
      assert.match(status, /Recent SEC filing metadata is available for both companies/);
      const text = await bodyText(page);
      assert.match(text, /RECENT_FILING_HISTORY_ONLY/);
      assert.match(text, /SEC_SUBMISSIONS_API/);
      assert.match(text, /not a final MergeVue M&A assessment/);
      return { state: "RESEARCH_AVAILABLE", evidence: "headline + tokens + disclaimer visible" };
    });

    await gotoDealEntry(page, server.origin);
    installResearchHarness(server.research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, submissionsFixture({
        name: APPLE_RESEARCH_NAME,
        rows: APPLE_FILINGS,
      })),
      [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(404, { error: "no" }),
    }));
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    const postsBeforePartial = tracker.posts.length;
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Public-source coverage is partial.");
    await waitForBody(page, "PARTIAL");
    await check("M-PARTIAL", "status", "asymmetric PARTIAL", "PARTIAL-asymmetric", async () => {
      assert.equal(tracker.posts.length, postsBeforePartial + 1);
      const text = await bodyText(page);
      assert.match(text, /Public-source coverage is partial/);
      assert.match(text, /PARTIAL/);
      assert.doesNotMatch(text, /Recent SEC filing metadata is available for both companies/);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /RETRIEVED/);
      assert.match(acquirerSide, new RegExp(APPLE_RESEARCH_NAME));
      assert.match(targetSide, /NOT_RETRIEVABLE/);
      assert.match(targetSide, /Canonical name was not returned by the server/);
      assert.doesNotMatch(targetSide, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      return { state: "PARTIAL-asymmetric", evidence: "Acquirer RETRIEVED + Target NOT_RETRIEVABLE remain visible" };
    });

    await gotoDealEntry(page, server.origin);
    installResearchHarness(server.research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, emptySubmissions(APPLE_RESEARCH_NAME)),
      [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(200, emptySubmissions(NVIDIA_RESEARCH_NAME)),
    }));
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "No recent filing coverage was returned in this bounded SEC acquisition.");
    await waitForBody(page, "NO_COVERAGE");
    await check("M-NO-COVERAGE", "status", "pair-level NO_COVERAGE", "NO_COVERAGE", async () => {
      const text = await bodyText(page);
      assert.match(text, /No recent filing coverage was returned in this bounded SEC acquisition/);
      assert.doesNotMatch(text, /low risk/i);
      assert.doesNotMatch(text, /successful integration/i);
      assert.doesNotMatch(text, /completed analysis/i);
      assert.doesNotMatch(text, /Recent SEC filing metadata is available for both companies/);
      const acquirerSide = await sideText(page, "acquirer");
      assert.match(acquirerSide, /NO_COVERAGE/);
      assert.match(acquirerSide, new RegExp(APPLE_RESEARCH_NAME));
      return { state: "NO_COVERAGE", evidence: "honest empty coverage; no success/low-risk language" };
    });

    await gotoDealEntry(page, server.origin);
    installResearchHarness(server.research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(500, { error: "no" }),
      [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(500, { error: "no" }),
    }));
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Public-source research is currently unavailable.");
    await waitForBody(page, "SERVICE_UNAVAILABLE");
    await check("M-UNAVAILABLE-DUAL", "status", "dual NOT_RETRIEVABLE", "SERVICE_UNAVAILABLE", async () => {
      const text = await bodyText(page);
      assert.match(text, /Public-source research is currently unavailable/);
      assert.doesNotMatch(text, /Recent SEC filing metadata is available for both companies/);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /NOT_RETRIEVABLE/);
      assert.match(targetSide, /NOT_RETRIEVABLE/);
      return { state: "SERVICE_UNAVAILABLE", evidence: "503 dual NOT_RETRIEVABLE rendered as unavailable, not success" };
    });

    await gotoDealEntry(page, server.origin);
    installSuccessResearch(server.research, { userAgent: "" });
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Public-source research is currently unavailable.");
    await waitForBody(page, "SERVICE_UNAVAILABLE");
    await check("M-UNAVAILABLE-UA", "status", "missing-UA shape without companies", "SERVICE_UNAVAILABLE", async () => {
      const text = await bodyText(page);
      assert.match(text, /Public-source research is currently unavailable/);
      assert.equal(await sideText(page, "acquirer"), "");
      assert.equal(await sideText(page, "target"), "");
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      return { state: "SERVICE_UNAVAILABLE", evidence: "missing-UA 503 has no companies[] and is not success" };
    });

    const postsAfterUnavailable = tracker.posts.length;
    const retryAnalyze = await getButtonState(page, "Analyze this deal");
    assert.equal(retryAnalyze.disabled, false);
    installSuccessResearch(server.research);
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
    await waitForBody(page, "RESEARCH_AVAILABLE");
    await check("B-RETRY", "frontend", "explicit retry after SERVICE_UNAVAILABLE", "second-explicit-post", async () => {
      assert.equal(tracker.posts.length, postsAfterUnavailable + 1);
      const text = await bodyText(page);
      assert.match(text, /RESEARCH_AVAILABLE/);
      return { state: "second-explicit-post", evidence: "Analyze re-enabled after settlement; second click required; no auto-retry" };
    });

    async function protocolCase(id, label, override, assertion) {
      await gotoDealEntry(page, server.origin);
      installSuccessResearch(server.research);
      server.overrideBox.current = override;
      await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
      const before = tracker.posts.length;
      await clickButton(page, "Analyze this deal");
      await waitForStatus(page, LOCAL_ERROR_COPY);
      await assertion(before);
      server.overrideBox.current = null;
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, false);
      results.push({
        check_id: id,
        area: "protocol",
        input_or_scenario: label,
        expected_state: "local-request-error",
        observed_state: "local-request-error",
        result: "PASS",
        evidence: "no valid research result; confirmed pair preserved; Analyze retryable",
        notes: "",
      });
    }

    await protocolCase("T-MALFORMED-JSON", "malformed JSON", {
      status: 200,
      body: "{not-json",
    }, async (before) => {
      assert.equal(tracker.posts.length, before + 1);
      const text = await bodyText(page);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      assert.doesNotMatch(text, /SERVICE_UNAVAILABLE/);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
    });

    await protocolCase("T-UNKNOWN-STATUS", "unknown researchStatus", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        researchStatus: "COMPLETELY_UNKNOWN",
      },
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /COMPLETELY_UNKNOWN/);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
    });

    await protocolCase("T-WRONG-COVERAGE", "wrong coverage token", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        coverage: "COMPLETE_HISTORY",
      },
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
    });

    await protocolCase("T-WRONG-IDENTITY", "wrong identitySource token", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        identitySource: "CLIENT_TYPED_NAME",
      },
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
    });

    await protocolCase("T-WRONG-CIK", "response companies belong to a different CIK pair", {
      status: 200,
      json: lawfulResearchBody({
        acquirerCik: ALPHABET_CIK,
        targetCik: NVIDIA_CIK,
        acquirerName: ALPHABET_RESEARCH_NAME,
      }),
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /ALPHABET INC SUBMISSIONS CANONICAL/);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
    });

    await protocolCase("T-REVERSED-SIDE", "mislabelled side identity", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          lawfulCompany("acquirer", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
          lawfulCompany("target", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS),
        ],
      },
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
    });

    await protocolCase("T-DUPLICATE-SIDE", "duplicate side entry", {
      status: 200,
      json: {
        ...lawfulResearchBody(),
        companies: [
          lawfulCompany("acquirer", APPLE_CIK, APPLE_RESEARCH_NAME, APPLE_FILINGS),
          lawfulCompany("acquirer", NVIDIA_CIK, NVIDIA_RESEARCH_NAME, NVIDIA_FILINGS),
        ],
      },
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
    });

    const eleven = Array.from({ length: 11 }, (_, index) => ({
      form: "8-K",
      filingDate: `2024-01-${String(index + 1).padStart(2, "0")}`,
      accessionNumber: `0000320193-24-${String(index + 1).padStart(6, "0")}`,
    }));
    await protocolCase("T-ELEVEN-ROWS", ">10 recentFilings rows", {
      status: 200,
      json: lawfulResearchBody({
        acquirerFilings: eleven,
      }),
    }, async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /0000320193-24-000011/);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
    });

    await gotoDealEntry(page, server.origin);
    installSuccessResearch(server.research);
    server.overrideBox.current = { reject: true };
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    const postsBeforeNetwork = tracker.posts.length;
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, LOCAL_ERROR_COPY);
    await check("T-NETWORK", "protocol", "network/fetch rejection", "local-request-error", async () => {
      assert.ok(tracker.posts.length >= postsBeforeNetwork + 1);
      const text = await bodyText(page);
      assert.match(text, new RegExp(LOCAL_ERROR_COPY));
      assert.doesNotMatch(text, /Public-source research is currently unavailable/);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, false);
      return { state: "local-request-error", evidence: "transport failure stays local; not fabricated SERVICE_UNAVAILABLE" };
    });
    server.overrideBox.current = null;

    await gotoDealEntry(page, server.origin);
    installSuccessResearch(server.research);
    await neutralizeResearchAbort(page);
    const staleGate = createReleaseGate();
    installGatedResearch(server.research, staleGate.gate);
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    const postsBeforeStale = tracker.posts.length;
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, RESEARCHING_COPY);
    await clickButton(page, "Swap");
    await waitForStatus(page, READY_COPY);
    const postsAfterSwap = tracker.posts.length;
    staleGate.release();
    await new Promise((resolve) => setTimeout(resolve, 700));
    await check("STALE-SUCCESS", "stale", "late A→B success after Swap", "discarded-no-auto-post", async () => {
      assert.equal(postsAfterSwap, postsBeforeStale + 1);
      assert.equal(tracker.posts.length, postsBeforeStale + 1);
      const text = await bodyText(page);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.doesNotMatch(text, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      assert.match(text, /Public-source research is ready to start/);
      const analyze = await getButtonState(page, "Analyze this deal");
      assert.equal(analyze.disabled, false);
      assert.equal(await labeledInputValue(page, "Acquirer"), "NVIDIA CORP");
      assert.equal(await labeledInputValue(page, "Target"), "Apple Inc.");
      return { state: "discarded-no-auto-post", evidence: "abort neutralized; swapped pair discarded A→B success; no B→A auto POST" };
    });

    installSuccessResearch(server.research);
    const postsBeforeSwapClick = tracker.posts.length;
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
    await waitForBody(page, "RESEARCH_AVAILABLE");
    await check("SWAP-POST", "causal", "explicit Analyze after Swap posts reversed CIKs", "reversed-cik-order", async () => {
      assert.equal(tracker.posts.length, postsBeforeSwapClick + 1);
      assertCikOnlyBody(tracker.posts.at(-1).postData, NVIDIA_CIK, APPLE_CIK);
      const acquirerSide = await sideText(page, "acquirer");
      const targetSide = await sideText(page, "target");
      assert.match(acquirerSide, /NVIDIA CORP SUBMISSIONS CANONICAL/);
      assert.match(targetSide, /APPLE INC SUBMISSIONS CANONICAL/);
      return { state: "reversed-cik-order", evidence: "POST acquirer=NVIDIA target=Apple after explicit click only" };
    });

    await gotoDealEntry(page, server.origin);
    await neutralizeResearchAbort(page);
    const failGate = createReleaseGate();
    server.overrideBox.current = {
      gate: failGate.gate,
      status: 503,
      json: {
        endpoint: RESEARCH_PATH,
        researchStatus: "SERVICE_UNAVAILABLE",
        coverage: "RECENT_FILING_HISTORY_ONLY",
        identitySource: "SEC_SUBMISSIONS_API",
        requestedAt: "2026-09-18T12:00:00.000Z",
        status: "service-unavailable",
        companies: [
          {
            side: "acquirer",
            cik: APPLE_CIK,
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
            cik: NVIDIA_CIK,
            canonicalName: null,
            submissionsStatus: "NOT_RETRIEVABLE",
            filingCount: null,
            recentFilings: null,
            recentFilingsLimit: 10,
            additionalFilesCount: null,
            retrievedAt: null,
          },
        ],
      },
    };
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    const postsBeforeFail = tracker.posts.length;
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, RESEARCHING_COPY);
    await fillLabeled(page, "Acquirer", "Apple Inc. edited");
    const analyzeAfterEdit = await getButtonState(page, "Analyze this deal");
    assert.equal(analyzeAfterEdit.disabled, true);
    failGate.release();
    await new Promise((resolve) => setTimeout(resolve, 700));
    await check("STALE-FAILURE", "stale", "late failure after edit", "discarded", async () => {
      assert.equal(tracker.posts.length, postsBeforeFail + 1);
      const text = await bodyText(page);
      assert.doesNotMatch(text, /Public-source research is currently unavailable/);
      assert.doesNotMatch(text, /SERVICE_UNAVAILABLE/);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.equal((await getButtonState(page, "Analyze this deal")).disabled, true);
      return { state: "discarded", evidence: "late 503 did not restore unavailable research after edit invalidation" };
    });
    server.overrideBox.current = null;

    await gotoDealEntry(page, server.origin);
    installSuccessResearch(server.research);
    await confirmPair(page, "Apple Inc.", "NVIDIA CORP");
    await clickButton(page, "Analyze this deal");
    await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
    await waitForBody(page, "RESEARCH_AVAILABLE");
    const postsBeforeEdit = tracker.posts.length;
    await fillLabeled(page, "Target", "NVIDIA CORP x");
    await check("EDIT-INVALIDATION", "frontend", "edit after visible result", "cleared-disabled", async () => {
      const text = await bodyText(page);
      assert.doesNotMatch(text, /RESEARCH_AVAILABLE/);
      assert.doesNotMatch(text, /APPLE INC SUBMISSIONS CANONICAL/);
      assert.equal((await getButtonState(page, "Analyze this deal")).disabled, true);
      assert.equal(tracker.posts.length, postsBeforeEdit);
      return { state: "cleared-disabled", evidence: "edit clears research result, disables Analyze, no auto POST" };
    });

    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await waitForStatus(page, READY_COPY);
    await check("NO-AUTO-RECONFIRM", "frontend", "re-confirm after edit", "zero-new-posts", async () => {
      assert.equal(tracker.posts.length, postsBeforeEdit);
      assert.equal((await getButtonState(page, "Analyze this deal")).disabled, false);
      return { state: "zero-new-posts", evidence: "re-confirmation does not auto-start research" };
    });

    await check("COLOR-NOT-ONLY", "a11y", "research state uses text not color alone", "text-status", async () => {
      await clickButton(page, "Analyze this deal");
      await waitForStatus(page, "Recent SEC filing metadata is available for both companies.");
      const text = await bodyText(page);
      assert.match(text, /Research status: RESEARCH_AVAILABLE/);
      assert.match(text, /Submissions status: Retrieved \(RETRIEVED\)/);
      return { state: "text-status", evidence: "server tokens are visible as text in the research region" };
    });
  } finally {
    tracker.stop();
    await browser.close();
  }

  return results;
}

async function labeledInputValue(page, labelText) {
  return page.evaluate((labelName) => {
    const label = [...document.querySelectorAll("label")].find((node) => node.textContent.trim() === labelName);
    return document.getElementById(label.htmlFor)?.value ?? "";
  }, labelText);
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
  act: "UI-FROG-04B2",
  serverOrigin: server.origin,
  liveSecSmoke: "NOT_REQUIRED_FOR_UI_FROG_04B2_AUTHOR_CANDIDATE",
  checks: all.length,
  failed: failed.length,
}, null, 2));
console.log("UI-FROG-04B2 research integration validation: real DealEntryScreen + 04A/04B1 handlers + browser causal chain PASS");
