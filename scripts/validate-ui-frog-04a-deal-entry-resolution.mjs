import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { resolveRoutePath } from "../src/routes/routeModel.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");
const TEST_UA = "MergeVue-UI-FROG-04A-Test contact@example.test";
const LIVE_APPLE_CIK = "0000320193";

const FIXTURE = {
  fields: ["cik", "name", "ticker", "exchange"],
  data: [
    [320193, "Apple Inc.", "AAPL", "Nasdaq"],
    [320193, "Apple Inc.", "AAPL-W", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOGL", "Nasdaq"],
    [1652044, "Alphabet Inc.", "GOOG", "Nasdaq"],
    [1045810, "NVIDIA CORP", "NVDA", "Nasdaq"],
    [1067984, "BERKSHIRE HATHAWAY INC", "BRK-A", "NYSE"],
    [1067984, "BERKSHIRE HATHAWAY INC", "BRK-B", "NYSE"],
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

async function loadModules(vite) {
  const resolver = await vite.ssrLoadModule("/src/server/_companyResolver.ts");
  const api = await vite.ssrLoadModule("/api/resolve-company.ts");
  return { resolver, api };
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

function testApiPlugin(getApi) {
  return {
    name: "ui-frog-04a-test-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const origin = `http://${request.headers.host ?? "127.0.0.1"}`;
        const url = new URL(request.url ?? "/", origin);
        if (url.pathname !== "/api/resolve-company") {
          next();
          return;
        }
        try {
          const api = await getApi(server);
          const body = request.method === "GET" || request.method === "HEAD"
            ? undefined
            : await readNodeRequestBody(request);
          const apiRequest = new Request(url.toString(), {
            method: request.method,
            headers: headersFromNodeRequest(request),
            body: body?.length ? body : undefined,
          });
          const apiResponse = await api.default(apiRequest);
          await sendFetchResponse(response, apiResponse);
        } catch (error) {
          response.statusCode = 500;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify({
            endpoint: "/api/resolve-company",
            resolutionStatus: "SERVICE_UNAVAILABLE",
            status: "local-api-error",
            error: error instanceof Error ? error.message : "error",
          }));
        }
      });
    },
  };
}

async function startTestServer() {
  const rootPath = fileURLToPath(new URL("..", import.meta.url));
  let lastError = null;
  for (const port of [5184, 5185, 5186, 5187, 5188]) {
    let apiModule = null;
    const vite = await createViteServer({
      root: rootPath,
      server: { host: "127.0.0.1", port, strictPort: true, hmr: false },
      plugins: [testApiPlugin(async (server) => {
        if (!apiModule) apiModule = await server.ssrLoadModule("/api/resolve-company.ts");
        return apiModule;
      })],
    });
    try {
      await vite.listen();
      const modules = await loadModules(vite);
      return { vite, port, ...modules, origin: `http://127.0.0.1:${port}` };
    } catch (error) {
      await vite.close().catch(() => {});
      lastError = error;
      if (error && error.code !== "EADDRINUSE") throw error;
    }
  }
  throw lastError ?? new Error("Unable to bind UI-FROG-04A test server");
}

function installFixture(resolver, fetchImpl, extra = {}) {
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

function installJsonFixture(resolver, extra = {}) {
  return installFixture(resolver, async () => jsonFetchResponse(200, extra.payload ?? FIXTURE), extra);
}

async function runServerChecks(resolver, api) {
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

  await check("A", "server", "Apple Inc.", "EXACT", async () => {
    const tracked = installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.cik, "0000320193");
    assert.equal(result.body.canonicalName, "Apple Inc.");
    assert.equal(result.body.identitySource, "SEC_COMPANY_TICKERS_EXCHANGE_JSON");
    assert.ok(result.body.resolvedAt);
    return { state: result.body.resolutionStatus, evidence: "resolveCompanyQuery Apple Inc. → 0000320193" };
  });

  await check("B", "server", "AAPL", "EXACT", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "AAPL" });
    assert.equal(result.body.cik, "0000320193");
    assert.equal(result.body.ticker, "AAPL");
    return { state: result.body.resolutionStatus, evidence: "ticker AAPL → 0000320193" };
  });

  await check("C", "server", "apple inc", "NORMALIZED_EXACT", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "apple inc" });
    assert.equal(result.body.cik, "0000320193");
    return { state: result.body.resolutionStatus, evidence: "suffix/case normalization → 0000320193" };
  });

  await check("C2", "server", "NVIDIA", "NORMALIZED_EXACT", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "NVIDIA" });
    assert.equal(result.body.cik, "0001045810");
    return { state: result.body.resolutionStatus, evidence: "trailing CORP suffix strip → NVIDIA CORP" };
  });

  await check("D", "server", "Alphabet Inc. share classes", "EXACT", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Alphabet Inc." });
    assert.equal(result.body.cik, "0001652044");
    assert.notEqual(result.body.resolutionStatus, "AMBIGUOUS");
    return { state: result.body.resolutionStatus, evidence: "GOOGL/GOOG same CIK not AMBIGUOUS" };
  });

  await check("E", "server", "Duplicate Name Inc.", "AMBIGUOUS", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Duplicate Name Inc." });
    assert.equal(result.body.candidateCount, 2);
    assert.equal(result.body.candidates.length, 2);
    return { state: result.body.resolutionStatus, evidence: "two distinct CIKs" };
  });

  await check("F", "server", "Many Name Inc. six CIKs", "AMBIGUOUS", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Many Name Inc." });
    assert.equal(result.body.candidateCount, 6);
    assert.equal(result.body.candidates.length, 5);
    return { state: result.body.resolutionStatus, evidence: "candidate list capped at 5", notes: "candidateCount remains 6" };
  });

  await check("G", "server", "Zzzyxnotacompany999", "NOT_FOUND", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Zzzyxnotacompany999" });
    assert.equal(result.body.candidateCount, 0);
    assert.equal(result.body.cik, undefined);
    return { state: result.body.resolutionStatus, evidence: "zero candidates" };
  });

  await check("H", "server", "confirmCik 0001111111", "CONFIRMED", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({
      query: "Duplicate Name Inc.",
      confirmCik: "0001111111",
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.cik, "0001111111");
    return { state: result.body.resolutionStatus, evidence: "server-verified candidate confirmation" };
  });

  await check("I", "server", "confirmCik not in set", "invalid-confirmation", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({
      query: "Duplicate Name Inc.",
      confirmCik: "0000320193",
    });
    assert.equal(result.statusCode, 400);
    assert.notEqual(result.body.resolutionStatus, "CONFIRMED");
    return { state: result.body.status, evidence: "Apple CIK rejected for Duplicate Name query" };
  });

  await check("J", "server", "empty query", "malformed-request", async () => {
    installJsonFixture(resolver);
    const empty = await resolver.resolveCompanyQuery({ query: "   " });
    const missing = await resolver.resolveCompanyQuery({ query: null });
    assert.equal(empty.statusCode, 400);
    assert.equal(missing.statusCode, 400);
    return { state: empty.body.status, evidence: "empty and non-string queries → 400" };
  });

  await check("K", "server", "upstream 500", "SERVICE_UNAVAILABLE", async () => {
    installFixture(resolver, async () => jsonFetchResponse(500, { error: "no" }));
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 503);
    return { state: result.body.resolutionStatus, evidence: "non-200 fails closed" };
  });

  await check("L", "server", "upstream timeout", "SERVICE_UNAVAILABLE", async () => {
    installFixture(resolver, async (_url, options) => {
      await new Promise((_, reject) => {
        options.signal?.addEventListener("abort", () => {
          const error = new Error("Aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    }, { timeoutMs: 20 });
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 503);
    return { state: result.body.resolutionStatus, evidence: "AbortController timeout fails closed" };
  });

  await check("L2", "server", "thrown fetch", "SERVICE_UNAVAILABLE", async () => {
    installFixture(resolver, async () => {
      throw new Error("network down");
    });
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 503);
    return { state: result.body.resolutionStatus, evidence: "thrown fetch fails closed" };
  });

  await check("M", "server", "malformed JSON object", "SERVICE_UNAVAILABLE", async () => {
    installFixture(resolver, async () => jsonFetchResponse(200, { not: "association-data" }));
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 503);
    return { state: result.body.resolutionStatus, evidence: "malformed payload fails closed" };
  });

  await check("N", "server", "missing MERGEVUE_SEC_USER_AGENT", "SERVICE_UNAVAILABLE", async () => {
    const tracked = installFixture(resolver, async () => jsonFetchResponse(200, FIXTURE), { userAgent: "" });
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(result.statusCode, 503);
    assert.equal(tracked.calls.length, 0);
    return { state: result.body.resolutionStatus, evidence: "no outbound SEC request without UA" };
  });

  await check("O", "server", "parallel cache miss", "single-flight", async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    let fetchCount = 0;
    installFixture(resolver, async () => {
      fetchCount += 1;
      await gate;
      return jsonFetchResponse(200, FIXTURE);
    });
    const first = resolver.resolveCompanyQuery({ query: "Apple Inc." });
    const second = resolver.resolveCompanyQuery({ query: "AAPL" });
    await new Promise((resolve) => setTimeout(resolve, 40));
    assert.equal(fetchCount, 1);
    release();
    const [a, b] = await Promise.all([first, second]);
    assert.equal(a.body.resolutionStatus, "EXACT");
    assert.equal(b.body.resolutionStatus, "EXACT");
    assert.equal(fetchCount, 1);
    return { state: "single-flight", evidence: `fetchCount=${fetchCount}` };
  });

  await check("P", "server", "CIK padding", "0000320193", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "AAPL" });
    assert.equal(result.body.cik, "0000320193");
    assert.equal(result.body.cik.length, 10);
    return { state: result.body.cik, evidence: "padStart(10, 0)" };
  });

  await check("Q", "server", "identitySource", "SEC_COMPANY_TICKERS_EXCHANGE_JSON", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    return { state: result.body.identitySource, evidence: "identitySource present" };
  });

  await check("R", "server", "resolvedAt", "present", async () => {
    installJsonFixture(resolver);
    const result = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    assert.equal(typeof result.body.resolvedAt, "string");
    assert.ok(result.body.resolvedAt.includes("T"));
    return { state: "present", evidence: result.body.resolvedAt };
  });

  await check("UA", "server", "User-Agent header", TEST_UA, async () => {
    const tracked = installJsonFixture(resolver);
    await resolver.resolveCompanyQuery({ query: "Apple Inc." });
    const header = tracked.calls[0]?.options?.headers?.["User-Agent"];
    assert.equal(header, TEST_UA);
    assert.equal(tracked.calls[0].url, "https://www.sec.gov/files/company_tickers_exchange.json");
    return { state: header, evidence: "captured outbound request options.headers.User-Agent" };
  });

  await check("HTTP405", "server", "GET /api/resolve-company", "method-not-allowed", async () => {
    installJsonFixture(resolver);
    const response = await api.default(new Request("http://127.0.0.1/api/resolve-company", { method: "GET" }));
    assert.equal(response.status, 405);
    const body = await response.json();
    return { state: body.status, evidence: "handler uses methodNotAllowed" };
  });

  await check("HTTP200", "handler", "POST Apple Inc.", "EXACT", async () => {
    installJsonFixture(resolver);
    const response = await api.default(new Request("http://127.0.0.1/api/resolve-company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "Apple Inc." }),
    }));
    const body = await response.json();
    assert.equal(response.status, 200);
    return { state: body.resolutionStatus, evidence: "api/resolve-company.ts → resolveCompanyQuery" };
  });

  return results;
}

async function runLiveSecSmoke(resolver) {
  const ua = typeof process.env.MERGEVUE_SEC_USER_AGENT === "string"
    ? process.env.MERGEVUE_SEC_USER_AGENT.trim()
    : "";
  if (!ua) {
    return {
      status: "NOT_RUN_MISSING_AUTHORIZED_USER_AGENT",
      evidence: "MERGEVUE_SEC_USER_AGENT absent",
    };
  }
  resolver.resetCompanyResolverForTests();
  const apple = await resolver.resolveCompanyQuery({ query: "Apple Inc." });
  assert.equal(apple.statusCode, 200);
  assert.equal(apple.body.cik, LIVE_APPLE_CIK);
  const miss = await resolver.resolveCompanyQuery({ query: "Zzzyxnotacompany999-ui-frog-04a" });
  assert.equal(miss.body.resolutionStatus, "NOT_FOUND");
  return {
    status: "PASS",
    evidence: `live Apple Inc. → ${apple.body.cik}; nonsense → NOT_FOUND`,
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

function installGatedJsonFixture(resolver, gate) {
  return installFixture(resolver, async (_url, options) => {
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
    return jsonFetchResponse(200, FIXTURE);
  });
}

async function labeledInputValue(page, labelText) {
  return page.evaluate((labelName) => {
    const label = [...document.querySelectorAll("label")].find((node) => node.textContent.trim() === labelName);
    return document.getElementById(label.htmlFor)?.value ?? "";
  }, labelText);
}

async function resolvingCopyVisible(page) {
  return page.evaluate(() => document.body.innerText.includes("Finding the company..."));
}

async function waitForConfirmEnabled(page) {
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent.trim() === "Confirm companies");
    return Boolean(button && !button.disabled);
  });
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

async function waitForStatus(page, snippet, timeout = 8000) {
  await page.waitForFunction((text) => {
    const node = document.querySelector('[role="status"]');
    return Boolean(node && node.textContent.includes(text));
  }, { timeout }, snippet);
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}

async function runBrowserChecks(origin, resolver) {
  const puppeteer = await import("puppeteer-core");
  const executablePath = chromePath();
  assert.ok(executablePath, "Chrome is required for UI-FROG-04A browser checks");
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
  });
  const results = [];
  const page = await browser.newPage();
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));

  try {
    installJsonFixture(resolver);
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0", timeout: 30000 });

    const initialStatus = await statusText(page);
    assert.match(initialStatus, /Analyze this deal is not available yet/);
    results.push({
      check_id: "FE-DEFAULT",
      area: "frontend",
      input_or_scenario: "empty deal entry",
      expected_state: "default explanation visible",
      observed_state: initialStatus,
      result: "PASS",
      evidence: "role=status present before both companies filled",
      notes: "",
    });

    const confirmIdle = await getButtonState(page, "Confirm companies");
    const analyzeIdle = await getButtonState(page, "Analyze this deal");
    assert.equal(confirmIdle.present, true);
    assert.equal(confirmIdle.disabled, true);
    assert.equal(analyzeIdle.disabled, true);
    assert.equal(analyzeIdle.type, "button");
    assert.ok(analyzeIdle.tabIndex <= 0);

    await fillLabeled(page, "Acquirer", "Apple Inc.");
    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    const confirmReady = await getButtonState(page, "Confirm companies");
    assert.equal(confirmReady.disabled, false);

    await clickButton(page, "Confirm companies");
    await waitForStatus(page, "Companies confirmed. Public-source analysis is not connected in this step yet.");
    const confirmedAnalyze = await getButtonState(page, "Analyze this deal");
    assert.equal(confirmedAnalyze.disabled, true);
    const urlAfterConfirm = page.url();
    await clickButton(page, "Analyze this deal");
    assert.equal(page.url(), urlAfterConfirm);
    assert.equal(requested.some((url) => url.includes("/api/resolve-company")), true);
    assert.equal(requested.some((url) => url.includes("/api/resolve-pair")), false);
    assert.equal(requested.some((url) => url.includes("sec.gov")), false);
    results.push({
      check_id: "FE-CONFIRM",
      area: "frontend",
      input_or_scenario: "Confirm companies Apple + NVIDIA",
      expected_state: "both confirmed, Analyze unavailable, no research",
      observed_state: await statusText(page),
      result: "PASS",
      evidence: "POST /api/resolve-company only; Analyze remains disabled; no navigation",
      notes: "",
    });

    await fillLabeled(page, "Acquirer", "Apple Inc. x");
    const afterEdit = await page.evaluate(() => document.body.innerText);
    assert.equal(afterEdit.includes("Companies confirmed. Public-source analysis is not connected in this step yet."), false);
    results.push({
      check_id: "FE-EDIT",
      area: "frontend",
      input_or_scenario: "edit after confirmation",
      expected_state: "prior identity invalidated",
      observed_state: "pair confirmation cleared",
      result: "PASS",
      evidence: "editing Acquirer removes companiesConfirmedForResearch copy",
      notes: "",
    });

    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Duplicate Name Inc.");
    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await page.waitForSelector("select", { timeout: 8000 });
    const selectCount = await page.$$eval("select", (nodes) => nodes.length);
    assert.ok(selectCount >= 1);
    await page.focus("select");
    await page.keyboard.press("ArrowDown");
    const selectedCik = await page.$eval("select", (node) => {
      node.selectedIndex = 1;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return node.value;
    });
    assert.ok(selectedCik);
    await waitForStatus(page, "Companies confirmed. Public-source analysis is not connected in this step yet.");
    results.push({
      check_id: "FE-AMBIGUOUS",
      area: "frontend",
      input_or_scenario: "Duplicate Name Inc. candidate select",
      expected_state: "AMBIGUOUS then server-confirmed",
      observed_state: await statusText(page),
      result: "PASS",
      evidence: `native select value ${selectedCik}; keyboard-focusable`,
      notes: "",
    });

    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Zzzyxnotacompany999");
    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await waitForStatus(page, "We couldn't identify that company from the current public identity source.");
    results.push({
      check_id: "FE-NOTFOUND",
      area: "frontend",
      input_or_scenario: "nonexistent acquirer",
      expected_state: "NOT_FOUND copy",
      observed_state: await statusText(page),
      result: "PASS",
      evidence: "truthful not-found copy; does not say company does not exist",
      notes: "",
    });

    installFixture(resolver, async () => jsonFetchResponse(500, { error: "no" }));
    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Apple Inc.");
    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await waitForStatus(page, "Company lookup is temporarily unavailable. Try again.");
    results.push({
      check_id: "FE-UNAVAILABLE",
      area: "frontend",
      input_or_scenario: "upstream 500 during confirm",
      expected_state: "SERVICE_UNAVAILABLE copy",
      observed_state: await statusText(page),
      result: "PASS",
      evidence: "truthful unavailable copy from request lifecycle",
      notes: "",
    });

    installJsonFixture(resolver);
    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Apple Inc.");
    await fillLabeled(page, "Target", "AAPL");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await page.waitForFunction(() => {
      const alert = document.querySelector('[role="alert"]');
      return Boolean(alert && alert.textContent.includes("Acquirer and target must be different companies."));
    }, { timeout: 8000 });
    results.push({
      check_id: "FE-SAME-CIK",
      area: "frontend",
      input_or_scenario: "Apple Inc. + AAPL",
      expected_state: "same-CIK pair error",
      observed_state: "Acquirer and target must be different companies.",
      result: "PASS",
      evidence: "canonical CIK comparison after resolution",
      notes: "",
    });

    const resolvePosts = [];
    const resolveFailed = [];
    const onResolveRequest = (request) => {
      if (request.url().includes("/api/resolve-company") && request.method() === "POST") {
        resolvePosts.push(request.url());
      }
    };
    const onResolveFailed = (request) => {
      if (request.url().includes("/api/resolve-company") && request.method() === "POST") {
        resolveFailed.push(request.failure()?.errorText ?? "failed");
      }
    };
    page.on("request", onResolveRequest);
    page.on("requestfailed", onResolveFailed);
    const gate = createReleaseGate();
    installGatedJsonFixture(resolver, gate.gate);
    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Apple Inc.");
    await fillLabeled(page, "Target", "NVIDIA CORP");
    await waitForConfirmEnabled(page);
    const postsBeforeConfirm = resolvePosts.length;
    await clickButton(page, "Confirm companies");
    await waitForStatus(page, "Finding the company...");
    assert.equal(await resolvingCopyVisible(page), true);
    assert.ok(resolvePosts.length > postsBeforeConfirm, "Confirm companies must issue in-flight resolve requests");
    const postsWhileResolving = resolvePosts.length;
    const confirmWhileResolving = await getButtonState(page, "Confirm companies");
    assert.equal(confirmWhileResolving.disabled, true);
    await clickButton(page, "Swap");
    await page.waitForFunction(() => !document.body.innerText.includes("Finding the company..."), { timeout: 8000 });
    assert.equal(await resolvingCopyVisible(page), false);
    assert.equal(await labeledInputValue(page, "Acquirer"), "NVIDIA CORP");
    assert.equal(await labeledInputValue(page, "Target"), "Apple Inc.");
    await waitForConfirmEnabled(page);
    const confirmAfterSwap = await getButtonState(page, "Confirm companies");
    assert.equal(confirmAfterSwap.disabled, false);
    await new Promise((resolve) => setTimeout(resolve, 250));
    assert.equal(resolvePosts.length, postsWhileResolving, "Swap must not auto-restart resolution");
    gate.release();
    await new Promise((resolve) => setTimeout(resolve, 400));
    const afterStale = await statusText(page);
    assert.equal(afterStale.includes("Company confirmed."), false);
    assert.equal(afterStale.includes("Public-source analysis is not connected"), false);
    assert.equal(await resolvingCopyVisible(page), false);
    assert.equal(resolvePosts.length, postsWhileResolving, "stale in-flight responses must not spawn new resolve POSTs");
    page.off("request", onResolveRequest);
    page.off("requestfailed", onResolveFailed);
    results.push({
      check_id: "FE-SWAP-RESOLVING",
      area: "frontend",
      input_or_scenario: "Swap while both sides RESOLVING",
      expected_state: "EDITING, Confirm usable, no auto-resolve, no stale CONFIRMED",
      observed_state: afterStale,
      result: "PASS",
      evidence: `in-flight POSTs=${postsWhileResolving - postsBeforeConfirm}; failed=${resolveFailed.length}; names swapped; Confirm re-enabled`,
      notes: "IV1-04A-MAJOR-01",
    });

    installJsonFixture(resolver);
    await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
    await fillLabeled(page, "Acquirer", "Duplicate Name Inc.");
    await fillLabeled(page, "Target", "Many Name Inc.");
    await waitForConfirmEnabled(page);
    await clickButton(page, "Confirm companies");
    await page.waitForFunction(() => document.querySelectorAll("select").length === 2, { timeout: 8000 });
    const ambiguousSides = await page.evaluate(() => [...document.querySelectorAll(".mv-deal-entry-field")].map((field) => {
      const sideLabel = field.querySelector(":scope > label")?.textContent.trim() ?? "";
      const visible = field.querySelector(".mv-deal-entry-ambiguous label")?.textContent.trim() ?? "";
      const select = field.querySelector("select");
      return {
        sideLabel,
        visible,
        accessibleName: select?.getAttribute("aria-label") ?? "",
        tag: select?.tagName ?? "",
      };
    }));
    const acquirerAmbiguous = ambiguousSides.find((row) => row.sideLabel === "Acquirer");
    const targetAmbiguous = ambiguousSides.find((row) => row.sideLabel === "Target");
    assert.equal(acquirerAmbiguous?.tag, "SELECT");
    assert.equal(targetAmbiguous?.tag, "SELECT");
    assert.equal(acquirerAmbiguous.visible, "Which company do you mean?");
    assert.equal(targetAmbiguous.visible, "Which company do you mean?");
    assert.notEqual(acquirerAmbiguous.accessibleName, targetAmbiguous.accessibleName);
    assert.match(acquirerAmbiguous.accessibleName, /Acquirer/);
    assert.match(targetAmbiguous.accessibleName, /Target/);
    assert.match(acquirerAmbiguous.accessibleName, /Which company do you mean\?/);
    assert.match(targetAmbiguous.accessibleName, /Which company do you mean\?/);
    await page.focus("select");
    await page.keyboard.press("ArrowDown");
    results.push({
      check_id: "FE-AMBIGUOUS-NAMES",
      area: "frontend",
      input_or_scenario: "simultaneous Acquirer and Target AMBIGUOUS",
      expected_state: "two native selects with distinct accessible names",
      observed_state: JSON.stringify({
        acquirer: acquirerAmbiguous.accessibleName,
        target: targetAmbiguous.accessibleName,
      }),
      result: "PASS",
      evidence: "visible copy preserved; aria-label identifies side; native select remains keyboard-focusable",
      notes: "IV1-04A-MINOR-01",
    });

    const overflow = {};
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 900 });
      await page.goto(`${origin}/start-diagnostic/deal-context`, { waitUntil: "networkidle0" });
      overflow[width] = await noHorizontalOverflow(page);
      assert.equal(overflow[width], true, `horizontal overflow at ${width}`);
      const explanation = await statusText(page);
      assert.match(explanation, /Analyze this deal is not available yet/);
    }
    results.push({
      check_id: "FE-RESPONSIVE",
      area: "frontend",
      input_or_scenario: "1440/768/390/320",
      expected_state: "no horizontal overflow",
      observed_state: JSON.stringify(overflow),
      result: "PASS",
      evidence: "viewport matrix on /start-diagnostic/deal-context",
      notes: "",
    });

    const nonTarget = [
      "/",
      "/about-methodology",
      "/start-diagnostic/before-you-begin",
      "/start-diagnostic/deal-context/details",
    ];
    for (const route of nonTarget) {
      await page.goto(`${origin}${route}`, { waitUntil: "networkidle0" });
      const hasConfirm = await page.evaluate(() => [...document.querySelectorAll("button")].some((node) => node.textContent.trim() === "Confirm companies"));
      assert.equal(hasConfirm, false, `${route} must not render deal-entry confirmation`);
    }
    results.push({
      check_id: "FE-NON-TARGET",
      area: "frontend",
      input_or_scenario: "non-target public routes",
      expected_state: "no Confirm companies",
      observed_state: "NONE",
      result: "PASS",
      evidence: "/, /about-methodology, /before-you-begin, /deal-context/details",
      notes: "",
    });
  } finally {
    await browser.close();
  }

  return results;
}

const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
const cssSource = await read("src/styles/public-deal-entry.css");
const resolverSource = await read("src/server/_companyResolver.ts");
const apiSource = await read("api/resolve-company.ts");
const resolvePairSource = await read("api/resolve-pair.ts");
const deliverableSource = await read("src/flow/finalDeliverableFlow.js");
const frog03Source = await read("scripts/validate-ui-frog-03-deal-entry.mjs");

assert.match(apiSource, /resolveCompanyQuery/);
assert.match(apiSource, /methodNotAllowed/);
assert.doesNotMatch(apiSource, /buildPairDeliverable/);
assert.match(resolverSource, /SEC_ASSOCIATION_URL = "https:\/\/www\.sec\.gov\/files\/company_tickers_exchange\.json"/);
assert.match(resolverSource, /PROJECT CACHE TTL — NOT AN SEC REQUIREMENT/);
assert.match(resolverSource, /MERGEVUE_SEC_USER_AGENT/);
assert.match(resolverSource, /AbortController/);
assert.match(entrySource, /RESOLVE_COMPANY_PATH = "\/api\/resolve-company"/);
assert.match(entrySource, /fetch\(RESOLVE_COMPANY_PATH/);
assert.doesNotMatch(entrySource, /sec\.gov/);
assert.doesNotMatch(entrySource, /resolve-pair/);
assert.doesNotMatch(entrySource, /attachDealContext/);
assert.doesNotMatch(entrySource, /attachAcquisitionMotive/);
assert.doesNotMatch(entrySource, /Researching/);
assert.doesNotMatch(entrySource, /Result ready/);
assert.match(entrySource, /role="status"/);
assert.match(entrySource, /aria-live="polite"/);
assert.match(entrySource, /Confirm companies/);
assert.match(entrySource, /<select/);
assert.match(entrySource, /confirmCik/);
assert.match(entrySource, /stateAfterInvalidatedSwap/);
assert.match(entrySource, /Which company do you mean\? \(Acquirer\)/);
assert.match(entrySource, /Which company do you mean\? \(Target\)/);
assert.match(entrySource, /aria-label=\{side === "acquirer"/);
assert.match(entrySource, /Analyze this deal/);
assert.match(entrySource, /disabled/);
assert.match(cssSource, /\.mv-deal-entry-status/);
assert.match(cssSource, /:focus-visible/);
for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
  assert.doesNotMatch(cssSource, pattern);
}
assert.match(frog03Source, /SUPERSEDED/);
assert.match(resolvePairSource, /buildPairDeliverable/);
assert.doesNotMatch(resolvePairSource, /resolveCompanyQuery/);
assert.match(deliverableSource, /export function buildPairDeliverable/);
assert.equal(resolveRoutePath("/analyze").isFallback, true);
assert.equal(resolveRoutePath("/start-diagnostic/deal-context").id, "deal-context-acquisition-motive");

const server = await startTestServer();
let liveSecSmoke = { status: "NOT_RUN_MISSING_AUTHORIZED_USER_AGENT", evidence: "" };
let serverResults = [];
let browserResults = [];
try {
  serverResults = await runServerChecks(server.resolver, server.api);
  liveSecSmoke = await runLiveSecSmoke(server.resolver);
  browserResults = await runBrowserChecks(server.origin, server.resolver);
} finally {
  await server.vite.close();
}

const all = [...serverResults, ...browserResults];
const failed = all.filter((row) => row.result !== "PASS");
assert.equal(failed.length, 0, failed.map((row) => row.check_id).join(","));

console.log(JSON.stringify({
  act: "UI-FROG-04A",
  serverOrigin: server.origin,
  liveSecSmoke: liveSecSmoke.status,
  liveSecEvidence: liveSecSmoke.evidence,
  checks: all.length,
  failed: failed.length,
}, null, 2));
console.log("UI-FROG-04A deal-entry resolution validation: server fixture + browser causal chain PASS");
