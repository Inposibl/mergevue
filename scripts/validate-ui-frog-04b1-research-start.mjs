import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { resolveRoutePath } from "../src/routes/routeModel.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const TEST_UA = "MergeVue-UI-FROG-04B1-Test contact@example.test";
const ENV_UA = "MergeVue-UI-FROG-04B1-Env contact@example.test";
const FIXED_NOW = Date.parse("2026-09-17T12:00:00.000Z");
const FIXED_ISO = "2026-09-17T12:00:00.000Z";
const APPLE_CIK = "0000320193";
const ALPHABET_CIK = "0001652044";
const NVIDIA_CIK = "0001045810";
const SUBMISSIONS_PREFIX = "https://data.sec.gov/submissions/CIK";
const SUBMISSIONS_SUFFIX = ".json";
const ENDPOINT = "/api/start-public-research";

const PROTECTED_PATHS = [
  "src/screens/public/DealEntryScreen.jsx",
  "src/styles/public-deal-entry.css",
  "api/resolve-company.ts",
  "src/server/_companyResolver.ts",
  "src/server/_response.ts",
  "api/resolve-pair.ts",
  "src/routes/routeModel.js",
  "src/App.jsx",
  "vite.config.js",
  "vercel.json",
  "package.json",
  "scripts/validate-ui-frog-04a-deal-entry-resolution.mjs",
];

function submissionsUrl(cik) {
  return `${SUBMISSIONS_PREFIX}${cik}${SUBMISSIONS_SUFFIX}`;
}

function jsonFetchResponse(status, body) {
  return {
    status,
    json: async () => body,
  };
}

function throwingJsonResponse(status) {
  return {
    status,
    json: async () => {
      throw new SyntaxError("Unexpected token < in JSON");
    },
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

function filingRow(index, form = "10-K") {
  const year = 2024 - Math.floor(index / 4);
  const month = String((index % 12) + 1).padStart(2, "0");
  return {
    form,
    filingDate: `${year}-${month}-15`,
    accessionNumber: `0000320193-24-${String(index + 1).padStart(6, "0")}`,
    primaryDocument: `doc-${index}.htm`,
  };
}

function submissionsFixture({ name, rows = [filingRow(0)], files = [] }) {
  return {
    name,
    entityType: "operating",
    tickers: ["FAKE"],
    formerNames: [{ name: "Old Name Ltd.", from: "2000-01-01", to: "2001-01-01" }],
    filings: {
      recent: {
        form: rows.map((row) => row.form),
        filingDate: rows.map((row) => row.filingDate),
        accessionNumber: rows.map((row) => row.accessionNumber),
        primaryDocument: rows.map((row) => row.primaryDocument),
        items: rows.map(() => "Item 1.01"),
      },
      files,
    },
  };
}

const APPLE_ROWS = [
  filingRow(0, "10-K"),
  filingRow(1, "8-K"),
  filingRow(2, "4"),
];
const ALPHABET_ROWS = [
  filingRow(0, "10-Q"),
  filingRow(1, "8-K"),
];
const TWELVE_ROWS = Array.from({ length: 12 }, (_, index) => filingRow(index, index % 2 ? "8-K" : "10-K"));
const EXTRA_FILES = [
  { name: "CIK0000320193-submissions-001.json", filingCount: 100, filingFrom: "1994-01-01", filingTo: "2010-01-01" },
  { name: "CIK0000320193-submissions-002.json", filingCount: 80, filingFrom: "2010-01-02", filingTo: "2016-01-01" },
];

function applePayload(overrides = {}) {
  return submissionsFixture({
    name: "Apple Inc.",
    rows: APPLE_ROWS,
    files: EXTRA_FILES,
    ...overrides,
  });
}

function alphabetPayload(overrides = {}) {
  return submissionsFixture({
    name: "Alphabet Inc.",
    rows: ALPHABET_ROWS,
    files: [],
    ...overrides,
  });
}

function emptyPayload(name) {
  return submissionsFixture({ name, rows: [], files: [] });
}

function namedRecentPayload(name, recent, files = []) {
  return {
    name,
    filings: {
      recent,
      files,
    },
  };
}

const STRUCT_A_RECENT = {};
const STRUCT_B_RECENT = { form: ["10-K", "8-K", "DEF 14A"] };
const STRUCT_C_RECENT = { form: ["10-K"], filingDate: ["2026-01-01"] };
const STRUCT_D_RECENT = { accessionNumber: ["0000000000-26-000001"] };
const STRUCT_E_RECENT = {
  form: ["10-K"],
  filingDate: "2026-01-01",
  accessionNumber: ["0000000000-26-000001"],
};
const STRUCT_F_RECENT = {
  form: ["10-K", "8-K", "10-Q", "4", "DEF 14A"],
  filingDate: ["2026-01-01", "2026-02-01", "2026-03-01", "2026-04-01", "2026-05-01"],
  accessionNumber: ["0000000000-26-000001"],
};
const STRUCT_G_RECENT = { form: [], filingDate: [], accessionNumber: [] };

function assertSideNotRetrievable(side) {
  assert.equal(side.submissionsStatus, "NOT_RETRIEVABLE");
  assert.notEqual(side.submissionsStatus, "RETRIEVED");
  assert.notEqual(side.submissionsStatus, "NO_COVERAGE");
  assert.equal(side.canonicalName, null);
  assert.equal(side.filingCount, null);
  assert.equal(side.recentFilings, null);
}

function tableFetch(table) {
  return async (url) => {
    const entry = table[String(url)];
    if (typeof entry === "function") return entry();
    if (entry) return entry;
    return jsonFetchResponse(404, { error: "missing-fixture" });
  };
}

function successTable(extra = {}) {
  return {
    [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, applePayload()),
    [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
    [submissionsUrl(NVIDIA_CIK)]: jsonFetchResponse(200, submissionsFixture({
      name: "NVIDIA CORP",
      rows: [filingRow(0, "10-K")],
    })),
    ...extra,
  };
}

async function loadModules() {
  const rootPath = fileURLToPath(root);
  const vite = await createViteServer({
    root: rootPath,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "error",
  });
  const research = await vite.ssrLoadModule("/src/server/_secResearch.ts");
  const api = await vite.ssrLoadModule("/api/start-public-research.ts");
  return { vite, research, api };
}

function installHarness(research, fetchImpl, extra = {}) {
  research.resetSecResearchForTests();
  const tracked = createTrackedFetch(fetchImpl);
  const harness = {
    fetch: tracked.fetchFn,
    nowMs: extra.nowMs ?? (() => FIXED_NOW),
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

function requestBody(overrides = {}) {
  return {
    acquirer: { cik: APPLE_CIK },
    target: { cik: ALPHABET_CIK },
    ...overrides,
  };
}

async function postHandler(api, body, method = "POST") {
  const init = { method };
  if (method !== "GET" && method !== "HEAD") {
    init.headers = { "content-type": "application/json" };
    if (body !== undefined) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
    }
  }
  return api.default(new Request(`http://127.0.0.1${ENDPOINT}`, init));
}

async function postResearch(research, body) {
  return research.startPublicResearch(body);
}

function company(body, side) {
  return (body.companies ?? []).find((item) => item.side === side);
}

function assertNoClientAuthority(body) {
  const serialized = JSON.stringify(body);
  assert.doesNotMatch(serialized, /CLIENT_FORGED/);
  assert.doesNotMatch(serialized, /HACKED_NAME/);
  assert.equal(body.identitySource, "SEC_SUBMISSIONS_API");
}

function gitShow(path) {
  return execFileSync("git", ["show", `HEAD:${path}`], {
    encoding: "utf8",
    cwd: fileURLToPath(root),
  });
}

async function runChecks(research, api) {
  const results = [];
  const previousUa = process.env.MERGEVUE_SEC_USER_AGENT;
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
    await check("V21-01", "request", "malformed JSON body", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const response = await postHandler(api, "{not-json", "POST");
      const body = await response.json();
      assert.equal(response.status, 400);
      assert.equal(body.status, "malformed-request");
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "parseJsonBody null → startPublicResearch 400; fetch unused" };
    });

    await check("V21-02A", "request", "missing acquirer", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, { target: { cik: ALPHABET_CIK } });
      assert.equal(result.statusCode, 400);
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "acquirer absent" };
    });

    await check("V21-02B", "request", "missing target", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, { acquirer: { cik: APPLE_CIK } });
      assert.equal(result.statusCode, 400);
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "target absent" };
    });

    await check("V21-03A", "request", "non-string CIK", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, {
        acquirer: { cik: 320193 },
        target: { cik: ALPHABET_CIK },
      });
      assert.equal(result.statusCode, 400);
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "numeric CIK rejected by bounded normalizer" };
    });

    await check("V21-03B", "request", "CIK with non-CIK semantics", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, {
        acquirer: { cik: "CIK0000320193" },
        target: { cik: ALPHABET_CIK },
      });
      assert.equal(result.statusCode, 400);
      assert.equal(result.body.status, "malformed-request");
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "letters rejected; digits are not stripped out of mixed tokens" };
    });

    await check("V21-03C", "request", "11-digit CIK", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, {
        acquirer: { cik: "00000320193" },
        target: { cik: ALPHABET_CIK },
      });
      assert.equal(result.statusCode, 400);
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "cannot normalize to 10-digit CIK" };
    });

    await check("V21-04", "request", "same CIK pair after padding", "400-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, {
        acquirer: { cik: "320193" },
        target: { cik: "0000320193" },
      });
      assert.equal(result.statusCode, 400);
      assert.equal(result.body.status, "same-cik-pair");
      assert.equal(tracked.calls.length, 0);
      return { state: "400-zero-outbound", evidence: "320193 and 0000320193 normalize to the same CIK" };
    });

    await check("V21-05", "ua", "missing MERGEVUE_SEC_USER_AGENT", "503-zero-outbound", async () => {
      delete process.env.MERGEVUE_SEC_USER_AGENT;
      const tracked = installHarness(research, tableFetch(successTable()), { userAgent: undefined });
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.researchStatus, "SERVICE_UNAVAILABLE");
      assert.equal(result.body.status, "missing-user-agent");
      assert.equal(tracked.calls.length, 0);
      assert.equal(research.getSecResearchOutboundRequests().length, 0);
      return { state: "503-zero-outbound", evidence: "configuredUserAgent empty before any fetch" };
    });

    await check("V21-06", "ua", "blank MERGEVUE_SEC_USER_AGENT", "503-zero-outbound", async () => {
      const tracked = installHarness(research, tableFetch(successTable()), { userAgent: "   " });
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.researchStatus, "SERVICE_UNAVAILABLE");
      assert.equal(tracked.calls.length, 0);
      return { state: "503-zero-outbound", evidence: "whitespace-only UA trims to empty; zero outbound" };
    });

    await check("V21-07", "outbound", "valid distinct pair", "pair-plus-exposed-index-pages", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const response = await postHandler(api, requestBody());
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.researchStatus, "RESEARCH_AVAILABLE");
      const urls = tracked.calls.map((call) => call.url);
      assert.equal(urls.includes(submissionsUrl(APPLE_CIK)), true);
      assert.equal(urls.includes(submissionsUrl(ALPHABET_CIK)), true);
      assert.equal(urls.includes("https://data.sec.gov/submissions/CIK0000320193-submissions-001.json"), true);
      assert.equal(urls.includes("https://data.sec.gov/submissions/CIK0000320193-submissions-002.json"), true);
      assert.equal(tracked.calls.every((call) => call.options.method === "GET"), true);
      assert.equal(urls.every((url) => url.startsWith("https://data.sec.gov/submissions/CIK")), true);
      return { state: "pair-plus-exposed-index-pages", evidence: urls.join(" | ") };
    });

    await check("V21-08", "outbound", "zero-padded CIK URLs", "canonical-10-digit", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, {
        acquirer: { cik: "320193" },
        target: { cik: "1652044" },
      });
      const urls = tracked.calls.map((call) => call.url);
      assert.equal(urls.includes(submissionsUrl(APPLE_CIK)), true);
      assert.equal(urls.includes(submissionsUrl(ALPHABET_CIK)), true);
      assert.equal(urls.every((url) => /\/submissions\/CIK\d{10}(?:-submissions-\d+)?\.json$/.test(url)), true);
      return { state: "canonical-10-digit", evidence: urls.join(" | ") };
    });

    await check("V21-09", "identity", "client name cannot replace canonicalName", "sec-derived-name", async () => {
      installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, {
        acquirer: { cik: APPLE_CIK, name: "HACKED_NAME ACQUIRER", canonicalName: "CLIENT_FORGED" },
        target: { cik: ALPHABET_CIK, name: "HACKED_NAME TARGET" },
        canonicalName: "CLIENT_FORGED",
        companies: [{ canonicalName: "CLIENT_FORGED" }],
      });
      assert.equal(result.statusCode, 200);
      assert.equal(company(result.body, "acquirer").canonicalName, "Apple Inc.");
      assert.equal(company(result.body, "target").canonicalName, "Alphabet Inc.");
      assertNoClientAuthority(result.body);
      return { state: "sec-derived-name", evidence: "Apple Inc. / Alphabet Inc. from fixture name field" };
    });

    await check("V21-10", "inventory", "RETRIEVED rows from SEC fixture", "fixture-rows", async () => {
      installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, requestBody());
      const acquirer = company(result.body, "acquirer");
      assert.equal(acquirer.submissionsStatus, "RETRIEVED");
      assert.equal(acquirer.filingCount, APPLE_ROWS.length);
      assert.deepEqual(
        acquirer.recentFilings,
        APPLE_ROWS.map(({ form, filingDate, accessionNumber }) => ({ form, filingDate, accessionNumber })),
      );
      assert.equal(acquirer.recentFilings.some((row) => "primaryDocument" in row), false);
      return { state: "fixture-rows", evidence: "form/filingDate/accessionNumber only; SEC order preserved" };
    });

    await check("V21-11", "states", "NO_COVERAGE from HTTP 200 empty recent", "NO_COVERAGE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, emptyPayload("Apple Inc.")),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, emptyPayload("Alphabet Inc.")),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(result.body.researchStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "target").submissionsStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "acquirer").filingCount, 0);
      assert.deepEqual(company(result.body, "acquirer").recentFilings, []);
      return { state: "NO_COVERAGE", evidence: "lawful 200 + valid structure + zero valid rows" };
    });

    await check("V21-12", "failure", "upstream non-200 cannot mint RETRIEVED", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(404, { error: "No such CIK" }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.equal(company(result.body, "acquirer").canonicalName, null);
      assert.equal(company(result.body, "acquirer").recentFilings, null);
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "RETRIEVED");
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      assert.equal(result.body.researchStatus, "PARTIAL");
      return { state: "NOT_RETRIEVABLE", evidence: "404 mapped to NOT_RETRIEVABLE; other side retained" };
    });

    await check("V21-13", "failure", "timeout cannot mint RETRIEVED", "NOT_RETRIEVABLE", async () => {
      installHarness(research, async (url, options) => {
        if (String(url).includes(APPLE_CIK)) {
          await new Promise((_, reject) => {
            options.signal?.addEventListener("abort", () => {
              const error = new Error("Aborted");
              error.name = "AbortError";
              reject(error);
            });
          });
        }
        return jsonFetchResponse(200, alphabetPayload());
      }, { timeoutMs: 20 });
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "RETRIEVED");
      assert.equal(company(result.body, "target").submissionsStatus, "RETRIEVED");
      assert.equal(result.body.researchStatus, "PARTIAL");
      return { state: "NOT_RETRIEVABLE", evidence: "AbortController timeout → NOT_RETRIEVABLE" };
    });

    await check("V21-14", "failure", "thrown fetch cannot mint RETRIEVED", "NOT_RETRIEVABLE", async () => {
      installHarness(research, async (url) => {
        if (String(url).includes(APPLE_CIK)) throw new Error("network down");
        return jsonFetchResponse(200, alphabetPayload());
      });
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "RETRIEVED");
      return { state: "NOT_RETRIEVABLE", evidence: "network throw → NOT_RETRIEVABLE" };
    });

    await check("V21-15", "failure", "malformed JSON cannot mint RETRIEVED", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: throwingJsonResponse(200),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "RETRIEVED");
      return { state: "NOT_RETRIEVABLE", evidence: "response.json throw → NOT_RETRIEVABLE" };
    });

    await check("V21-16", "failure", "malformed structure cannot mint RETRIEVED", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, { not: "submissions" }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, { name: "Alphabet Inc." }),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.equal(company(result.body, "target").submissionsStatus, "NOT_RETRIEVABLE");
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.researchStatus, "SERVICE_UNAVAILABLE");
      return { state: "NOT_RETRIEVABLE", evidence: "missing name/filings.recent is malformed, not empty coverage" };
    });

    await check("V21-17A", "composition", "RETRIEVED + RETRIEVED", "RESEARCH_AVAILABLE", async () => {
      installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      return { state: result.body.researchStatus, evidence: "both sides RETRIEVED → HTTP 200 RESEARCH_AVAILABLE" };
    });

    await check("V21-17B", "composition", "NO_COVERAGE + NO_COVERAGE", "NO_COVERAGE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, emptyPayload("Apple Inc.")),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, emptyPayload("Alphabet Inc.")),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      return { state: result.body.researchStatus, evidence: "pair-level honest empty; not an error" };
    });

    await check("V21-17C", "composition", "RETRIEVED + NO_COVERAGE", "PARTIAL", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, applePayload()),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, emptyPayload("Alphabet Inc.")),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(company(result.body, "acquirer").submissionsStatus, "RETRIEVED");
      assert.equal(company(result.body, "target").submissionsStatus, "NO_COVERAGE");
      return { state: result.body.researchStatus, evidence: "asymmetry retained; pair success not minted" };
    });

    await check("V21-17D", "composition", "RETRIEVED + NOT_RETRIEVABLE", "PARTIAL", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, applePayload()),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(500, { error: "upstream" }),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(company(result.body, "target").submissionsStatus, "NOT_RETRIEVABLE");
      return { state: result.body.researchStatus, evidence: "one lawful 200-derived state keeps HTTP 200 PARTIAL" };
    });

    await check("V21-17E", "composition", "NO_COVERAGE + NOT_RETRIEVABLE", "PARTIAL", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, emptyPayload("Apple Inc.")),
        [submissionsUrl(ALPHABET_CIK)]: async () => {
          throw new Error("network down");
        },
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "target").submissionsStatus, "NOT_RETRIEVABLE");
      return { state: result.body.researchStatus, evidence: "composition is symmetric; mix stays PARTIAL" };
    });

    await check("V21-17F", "composition", "NOT_RETRIEVABLE + NOT_RETRIEVABLE", "SERVICE_UNAVAILABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(503, { error: "no" }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(403, { error: "no" }),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.companies.length, 2);
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.equal(company(result.body, "target").submissionsStatus, "NOT_RETRIEVABLE");
      assert.doesNotMatch(JSON.stringify(result.body), /upstream/);
      return { state: result.body.researchStatus, evidence: "both NOT_RETRIEVABLE → 503; per-side states retained; no raw SEC text" };
    });

    await check("V21-17G", "composition", "missing UA pair status", "SERVICE_UNAVAILABLE", async () => {
      const tracked = installHarness(research, tableFetch(successTable()), { userAgent: "" });
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(tracked.calls.length, 0);
      return { state: result.body.researchStatus, evidence: "missing/blank UA is pair-level SERVICE_UNAVAILABLE before retrieval" };
    });

    await check("V21-18", "inventory", "at most ten filing rows per side", "capped-10", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, submissionsFixture({
          name: "Apple Inc.",
          rows: TWELVE_ROWS,
        })),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      const acquirer = company(result.body, "acquirer");
      assert.equal(acquirer.recentFilings.length, 10);
      assert.equal(acquirer.recentFilingsLimit, 10);
      assert.deepEqual(acquirer.recentFilings[0], {
        form: TWELVE_ROWS[0].form,
        filingDate: TWELVE_ROWS[0].filingDate,
        accessionNumber: TWELVE_ROWS[0].accessionNumber,
      });
      return { state: "capped-10", evidence: "recentFilings length 10; SEC order starts at index 0" };
    });

    await check("V21-19", "inventory", "filingCount may exceed 10", "count-12-cap-10", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, submissionsFixture({
          name: "Apple Inc.",
          rows: TWELVE_ROWS,
        })),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      const acquirer = company(result.body, "acquirer");
      assert.equal(acquirer.filingCount, 12);
      assert.equal(acquirer.recentFilings.length, 10);
      return { state: "count-12-cap-10", evidence: "filingCount is pre-cap valid-row count" };
    });

    await check("V21-20", "files", "files[] counted and fetched for Slice-1 enumeration", "count-and-fetch-for-slice1", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").additionalFilesCount, EXTRA_FILES.length);
      assert.equal(company(result.body, "target").additionalFilesCount, 0);
      assert.equal(tracked.calls.some((call) => call.url.includes("-submissions-001.json")), true);
      assert.equal(tracked.calls.some((call) => call.url.includes("-submissions-002.json")), true);
      return { state: "count-and-fetch-for-slice1", evidence: "additionalFilesCount=2; exposed submissions index pages fetched for analytical enumeration" };
    });

    await check("V21-21", "outbound", "no automatic external retry", "no-retry", async () => {
      let appleCalls = 0;
      const tracked = installHarness(research, async (url) => {
        if (String(url).includes(APPLE_CIK)) {
          appleCalls += 1;
          return jsonFetchResponse(500, { error: "no" });
        }
        return jsonFetchResponse(200, alphabetPayload());
      });
      await postResearch(research, requestBody());
      assert.equal(appleCalls, 1);
      assert.equal(tracked.calls.length, 2);
      return { state: "no-retry", evidence: "failed side fetched once; total outbound 2" };
    });

    await check("V21-22", "bypass", "no /api/resolve-pair", "not-used", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postHandler(api, requestBody());
      assert.equal(tracked.calls.some((call) => call.url.includes("resolve-pair")), false);
      const apiSource = await read("api/start-public-research.ts");
      const researchSource = await read("src/server/_secResearch.ts");
      assert.doesNotMatch(apiSource, /resolve-pair/);
      assert.doesNotMatch(apiSource, /buildPairDeliverable/);
      assert.doesNotMatch(researchSource, /resolve-pair/);
      assert.doesNotMatch(researchSource, /buildPairDeliverable/);
      return { state: "not-used", evidence: "outbound URLs and 04B1 sources omit resolve-pair" };
    });

    await check("V21-23", "source", "no filing-document/index URL", "submissions-only", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, requestBody());
      assert.equal(tracked.calls.every((call) => call.url.startsWith("https://data.sec.gov/submissions/CIK")), true);
      assert.equal(tracked.calls.some((call) => call.url.includes("/Archives/")), false);
      const researchSource = await read("src/server/_secResearch.ts");
      assert.doesNotMatch(researchSource, /Archives\/edgar/);
      assert.doesNotMatch(researchSource, /index\.html/);
      assert.doesNotMatch(researchSource, /primaryDocument/);
      return { state: "submissions-only", evidence: "only data.sec.gov/submissions/CIK##########.json" };
    });

    await check("V21-24", "source", "no XBRL/companyfacts endpoint", "absent", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, requestBody());
      const urls = tracked.calls.map((call) => call.url).join(" ");
      assert.doesNotMatch(urls, /companyfacts/);
      assert.doesNotMatch(urls, /companyconcept/);
      assert.doesNotMatch(urls, /frames/);
      assert.doesNotMatch(urls, /xbrl/i);
      const researchSource = await read("src/server/_secResearch.ts");
      assert.doesNotMatch(researchSource, /companyfacts/);
      assert.doesNotMatch(researchSource, /companyconcept/);
      return { state: "absent", evidence: "runtime URLs and source omit XBRL APIs" };
    });

    await check("V21-25", "ui", "this act does not mutate DealEntryScreen", "head-identical", async () => {
      const entry = await read("src/screens/public/DealEntryScreen.jsx");
      assert.equal(sha256(entry), sha256(gitShow("src/screens/public/DealEntryScreen.jsx")));
      const viteSource = await read("vite.config.js");
      assert.doesNotMatch(viteSource, /start-public-research/);
      const appSource = await read("src/App.jsx");
      assert.doesNotMatch(appSource, /start-public-research/);
      const routeSource = await read("src/routes/routeModel.js");
      assert.doesNotMatch(routeSource, /start-public-research/);
      assert.equal(resolveRoutePath("/analyze").isFallback, true);
      return { state: "head-identical", evidence: "04B1 UI-unwired pin superseded by 04B2; this act leaves DealEntryScreen at HEAD" };
    });

    await check("V21-26", "ui", "DealEntryScreen byte-identical to HEAD", "byte-identical", async () => {
      const current = await read("src/screens/public/DealEntryScreen.jsx");
      const baseline = gitShow("src/screens/public/DealEntryScreen.jsx");
      assert.equal(sha256(current), sha256(baseline));
      return { state: "byte-identical", evidence: sha256(current) };
    });

    await check("V21-27", "ui", "this act does not mutate public-deal-entry CSS", "head-identical", async () => {
      const css = await read("src/styles/public-deal-entry.css");
      assert.equal(sha256(css), sha256(gitShow("src/styles/public-deal-entry.css")));
      return { state: "head-identical", evidence: "04B1 no-public-render pin superseded by 04B2; CSS unchanged vs HEAD" };
    });

    await check("S-URL", "contract", "authorized submissions base URL", "data.sec.gov/submissions", async () => {
      assert.equal(research.secSubmissionsUrl(APPLE_CIK), submissionsUrl(APPLE_CIK));
      assert.equal(research.SEC_SUBMISSIONS_ORIGIN, "https://data.sec.gov");
      const researchSource = await read("src/server/_secResearch.ts");
      assert.match(researchSource, /https:\/\/data\.sec\.gov/);
      assert.doesNotMatch(researchSource, /www\.sec\.gov\/files\/company_tickers/);
      return { state: "data.sec.gov/submissions", evidence: research.secSubmissionsUrl(APPLE_CIK) };
    });

    await check("S-UA-HEADER", "contract", "MERGEVUE_SEC_USER_AGENT controls User-Agent", TEST_UA, async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, requestBody());
      assert.ok(tracked.calls.length >= 2);
      assert.equal(tracked.calls.every((call) => call.options.headers["User-Agent"] === TEST_UA), true);
      return { state: TEST_UA, evidence: "all outbound GETs use harness/server UA" };
    });

    await check("S-UA-ENV", "contract", "process.env MERGEVUE_SEC_USER_AGENT", ENV_UA, async () => {
      process.env.MERGEVUE_SEC_USER_AGENT = ENV_UA;
      const tracked = createTrackedFetch(tableFetch(successTable()));
      research.resetSecResearchForTests();
      research.setSecResearchTestHarness({
        fetch: tracked.fetchFn,
        nowMs: () => FIXED_NOW,
      });
      await postResearch(research, requestBody());
      assert.equal(tracked.calls[0].options.headers["User-Agent"], ENV_UA);
      return { state: ENV_UA, evidence: "when harness omits userAgent, env value is sent" };
    });

    await check("S-ACCEPT-ENCODING", "contract", "Accept-Encoding gzip, deflate", "gzip, deflate", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, requestBody());
      assert.equal(tracked.calls[0].options.headers["Accept-Encoding"], "gzip, deflate");
      assert.equal(tracked.calls[1].options.headers["Accept-Encoding"], "gzip, deflate");
      return { state: "gzip, deflate", evidence: "SEC access convention header present on both GETs" };
    });

    await check("S-NO-BROWSER-SEC", "bypass", "no browser-specific direct SEC design", "server-only", async () => {
      const entry = await read("src/screens/public/DealEntryScreen.jsx");
      const app = await read("src/App.jsx");
      assert.doesNotMatch(entry, /sec\.gov/);
      assert.doesNotMatch(app, /sec\.gov/);
      const researchSource = await read("src/server/_secResearch.ts");
      assert.match(researchSource, /MERGEVUE_SEC_USER_AGENT/);
      return { state: "server-only", evidence: "public UI sources have no sec.gov fetch" };
    });

    await check("S-NO-CACHE", "contract", "no cross-request cache", "fresh-each-call", async () => {
      const tracked = installHarness(research, tableFetch(successTable()));
      await postResearch(research, requestBody());
      const first = tracked.calls.length;
      await postResearch(research, requestBody());
      assert.ok(first >= 2);
      assert.equal(tracked.calls.length, first * 2);
      const researchSource = await read("src/server/_secResearch.ts");
      assert.doesNotMatch(researchSource, /let cache/);
      assert.doesNotMatch(researchSource, /inflight/);
      assert.doesNotMatch(researchSource, /CACHE_TTL/);
      return { state: "fresh-each-call", evidence: "second lawful POST repeats the same submissions GETs with no cache" };
    });

    await check("S-CLOCK", "harness", "injected clock is response oracle", FIXED_ISO, async () => {
      installHarness(research, tableFetch(successTable()));
      const result = await postResearch(research, requestBody());
      assert.equal(result.body.requestedAt, FIXED_ISO);
      assert.equal(company(result.body, "acquirer").retrievedAt, FIXED_ISO);
      assert.equal(company(result.body, "target").retrievedAt, FIXED_ISO);
      const serialized = JSON.stringify(result.body);
      assert.doesNotMatch(serialized, /nowMs/);
      assert.doesNotMatch(serialized, /timeoutMs/);
      assert.doesNotMatch(serialized, /setSecResearchTestHarness/);
      return { state: FIXED_ISO, evidence: "timestamps equal injected clock; harness not in HTTP body" };
    });

    await check("S-CLIENT-HARNESS", "bypass", "HTTP client cannot inject harness", "ignored", async () => {
      const tracked = installHarness(research, tableFetch(successTable()), { timeoutMs: 8000 });
      const response = await postHandler(api, {
        acquirer: { cik: APPLE_CIK },
        target: { cik: ALPHABET_CIK },
        userAgent: "client-forged-ua",
        timeoutMs: 1,
        fetch: "client-fetch",
        researchStatus: "RESEARCH_AVAILABLE",
        submissionsStatus: "RETRIEVED",
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(tracked.calls[0].options.headers["User-Agent"], TEST_UA);
      assert.notEqual(tracked.calls[0].options.headers["User-Agent"], "client-forged-ua");
      assert.equal(body.researchStatus, "RESEARCH_AVAILABLE");
      assert.equal("fetch" in body, false);
      assert.equal("timeoutMs" in body, false);
      return { state: "ignored", evidence: "client UA/timeout/fetch fields do not control retrieval" };
    });

    await check("S-MISSING-NAME", "failure", "missing SEC entity name", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, {
          filings: {
            recent: { form: ["10-K"], filingDate: ["2024-01-15"], accessionNumber: ["0001"] },
            files: [],
          },
        }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      return { state: "NOT_RETRIEVABLE", evidence: "HTTP 200 without name is not RETRIEVED" };
    });

    await check("S-404-NOT-EMPTY", "failure", "non-200 is not NO_COVERAGE", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(404, { name: "Apple Inc.", filings: { recent: { form: [] } } }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, emptyPayload("Alphabet Inc.")),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NOT_RETRIEVABLE");
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      assert.equal(result.body.researchStatus, "PARTIAL");
      return { state: "NOT_RETRIEVABLE", evidence: "404 cannot mint NO_COVERAGE even with empty-looking body" };
    });

    await check("S-HANDLER-200", "handler", "POST handler uses real module", "RESEARCH_AVAILABLE", async () => {
      installHarness(research, tableFetch(successTable()));
      const response = await postHandler(api, {
        acquirer: { cik: "320193" },
        target: { cik: "0001652044" },
      });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.endpoint, ENDPOINT);
      assert.equal(body.coverage, "RECENT_FILING_HISTORY_ONLY");
      assert.equal(company(body, "acquirer").cik, APPLE_CIK);
      assert.equal(company(body, "target").cik, ALPHABET_CIK);
      return { state: body.researchStatus, evidence: "api/start-public-research.ts → startPublicResearch" };
    });

    await check("S-HTTP-405", "handler", "GET /api/start-public-research", "method-not-allowed", async () => {
      installHarness(research, tableFetch(successTable()));
      const response = await postHandler(api, requestBody(), "GET");
      assert.equal(response.status, 405);
      const body = await response.json();
      assert.equal(research.getSecResearchOutboundRequests().length, 0);
      return { state: body.status, evidence: "handler uses methodNotAllowed; zero outbound" };
    });

    await check("S-PROTECTED", "scope", "protected baseline files unchanged", "byte-identical", async () => {
      const hashes = {};
      for (const path of PROTECTED_PATHS) {
        const current = await read(path);
        const baseline = gitShow(path);
        const currentHash = sha256(current);
        assert.equal(currentHash, sha256(baseline), path);
        hashes[path] = currentHash;
      }
      return { state: "byte-identical", evidence: Object.keys(hashes).join(",") };
    });

    await check("S-NORMALIZE", "request", "padStart 10 digit CIK export", APPLE_CIK, async () => {
      assert.equal(research.normalizeResearchCik("320193"), APPLE_CIK);
      assert.equal(research.normalizeResearchCik("0000320193"), APPLE_CIK);
      assert.equal(research.normalizeResearchCik(" 0000320193 "), APPLE_CIK);
      assert.equal(research.normalizeResearchCik("CIK320193"), null);
      assert.equal(research.normalizeResearchCik("320193A"), null);
      assert.equal(research.normalizeResearchCik(320193), null);
      return { state: APPLE_CIK, evidence: "bounded normalizer accepts digit strings only" };
    });

    await check("STRUCT-A", "structure", "recent = {}", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_A_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assertSideNotRetrievable(company(result.body, "acquirer"));
      assert.notEqual(result.body.researchStatus, "NO_COVERAGE");
      assert.notEqual(result.body.researchStatus, "RESEARCH_AVAILABLE");
      return { state: "NOT_RETRIEVABLE", evidence: "empty recent object is malformed, not empty coverage" };
    });

    await check("STRUCT-B", "structure", "only form column present", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_B_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assertSideNotRetrievable(company(result.body, "acquirer"));
      assert.notEqual(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      return { state: "NOT_RETRIEVABLE", evidence: "missing filingDate and accessionNumber cannot mint NO_COVERAGE" };
    });

    await check("STRUCT-C", "structure", "form + filingDate, accessionNumber missing", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_C_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assertSideNotRetrievable(company(result.body, "acquirer"));
      return { state: "NOT_RETRIEVABLE", evidence: "two of three required columns is malformed" };
    });

    await check("STRUCT-D", "structure", "only accessionNumber present", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_D_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assertSideNotRetrievable(company(result.body, "acquirer"));
      return { state: "NOT_RETRIEVABLE", evidence: "single required column is malformed" };
    });

    await check("STRUCT-E", "structure", "required column is not Array", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_E_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assertSideNotRetrievable(company(result.body, "acquirer"));
      return { state: "NOT_RETRIEVABLE", evidence: "filingDate string is not an array" };
    });

    await check("STRUCT-F", "structure", "unequal required-column lengths 5/5/1", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_F_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      const acquirer = company(result.body, "acquirer");
      assertSideNotRetrievable(acquirer);
      assert.notEqual(result.body.researchStatus, "RESEARCH_AVAILABLE");
      assert.notEqual(acquirer.filingCount, 1);
      assert.notEqual(acquirer.filingCount, 5);
      return { state: "NOT_RETRIEVABLE", evidence: "unequal lengths cannot zip into RETRIEVED or untruthful filingCount" };
    });

    await check("STRUCT-G", "structure", "all three required columns empty arrays", "NO_COVERAGE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_G_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, namedRecentPayload("Alphabet Inc.", STRUCT_G_RECENT)),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(company(result.body, "acquirer").submissionsStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "target").submissionsStatus, "NO_COVERAGE");
      assert.equal(company(result.body, "acquirer").filingCount, 0);
      assert.deepEqual(company(result.body, "acquirer").recentFilings, []);
      return { state: "NO_COVERAGE", evidence: "lawful empty equal-length columns remain NO_COVERAGE" };
    });

    await check("PAIR-STRUCT-A", "composition", "both STRUCT-A malformed", "SERVICE_UNAVAILABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_A_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, namedRecentPayload("Alphabet Inc.", STRUCT_A_RECENT)),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.researchStatus, "SERVICE_UNAVAILABLE");
      assertSideNotRetrievable(company(result.body, "acquirer"));
      assertSideNotRetrievable(company(result.body, "target"));
      return { state: "SERVICE_UNAVAILABLE", evidence: "both empty-object recent → 503 both NOT_RETRIEVABLE" };
    });

    await check("PAIR-STRUCT-B", "composition", "STRUCT-B + RETRIEVED", "PARTIAL", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_B_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, alphabetPayload()),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(result.body.researchStatus, "PARTIAL");
      assertSideNotRetrievable(company(result.body, "acquirer"));
      assert.equal(company(result.body, "target").submissionsStatus, "RETRIEVED");
      return { state: "PARTIAL", evidence: "one malformed recent + one RETRIEVED stays HTTP 200 PARTIAL" };
    });

    await check("PAIR-STRUCT-C", "composition", "both STRUCT-F malformed", "SERVICE_UNAVAILABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_F_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, namedRecentPayload("Alphabet Inc.", STRUCT_F_RECENT)),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 503);
      assert.equal(result.body.researchStatus, "SERVICE_UNAVAILABLE");
      assertSideNotRetrievable(company(result.body, "acquirer"));
      assertSideNotRetrievable(company(result.body, "target"));
      return { state: "SERVICE_UNAVAILABLE", evidence: "unequal-length recent on both sides → 503" };
    });

    await check("PAIR-STRUCT-D", "composition", "both STRUCT-G valid-empty", "NO_COVERAGE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_G_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, namedRecentPayload("Alphabet Inc.", STRUCT_G_RECENT)),
      }));
      const result = await postResearch(research, requestBody());
      assert.equal(result.statusCode, 200);
      assert.equal(result.body.researchStatus, "NO_COVERAGE");
      return { state: "NO_COVERAGE", evidence: "lawful empty structure remains pair-level NO_COVERAGE / 200" };
    });

    await check("PAIR-STRUCT-E", "composition", "STRUCT-F never mints success inventory", "NOT_RETRIEVABLE", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, namedRecentPayload("Apple Inc.", STRUCT_F_RECENT)),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, namedRecentPayload("Alphabet Inc.", STRUCT_F_RECENT)),
      }));
      const result = await postResearch(research, requestBody());
      assert.notEqual(result.body.researchStatus, "RESEARCH_AVAILABLE");
      assert.notEqual(result.body.researchStatus, "NO_COVERAGE");
      assert.notEqual(result.body.researchStatus, "PARTIAL");
      for (const side of ["acquirer", "target"]) {
        const item = company(result.body, side);
        assert.notEqual(item.submissionsStatus, "RETRIEVED");
        assert.equal(item.filingCount, null);
        assert.notEqual(item.filingCount, 1);
        assert.notEqual(item.filingCount, 5);
      }
      return { state: "NOT_RETRIEVABLE", evidence: "unequal columns never yield RETRIEVED, RESEARCH_AVAILABLE, or non-zero filingCount" };
    });
  } finally {
    if (previousUa === undefined) delete process.env.MERGEVUE_SEC_USER_AGENT;
    else process.env.MERGEVUE_SEC_USER_AGENT = previousUa;
  }

  return results;
}

const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
const apiSource = await read("api/start-public-research.ts");
const researchSource = await read("src/server/_secResearch.ts");
const resolvePairSource = await read("api/resolve-pair.ts");

assert.match(apiSource, /startPublicResearch/);
assert.match(apiSource, /methodNotAllowed/);
assert.match(apiSource, /parseJsonBody/);
assert.doesNotMatch(apiSource, /setSecResearchTestHarness/);
assert.match(researchSource, /MERGEVUE_SEC_USER_AGENT/);
assert.match(researchSource, /AbortController/);
assert.match(researchSource, /PROJECT FETCH TIMEOUT — NOT AN SEC REQUIREMENT/);
assert.match(researchSource, /Accept-Encoding": "gzip, deflate"/);
assert.doesNotMatch(researchSource, /for\s*\(.*attempt/);
assert.doesNotMatch(researchSource, /MAX_RETRIES/);
assert.doesNotMatch(researchSource, /function columnValues/);
assert.doesNotMatch(researchSource, /Math\.max\(forms\.length, dates\.length, accessions\.length\)/);
assert.doesNotMatch(researchSource, /if \(!Object\.prototype\.hasOwnProperty\.call\(recent, key\)\) return \[\]/);
assert.match(researchSource, /function requiredRecentColumns/);
assert.equal(sha256(entrySource), sha256(gitShow("src/screens/public/DealEntryScreen.jsx")));
assert.match(resolvePairSource, /buildPairDeliverable/);
assert.doesNotMatch(resolvePairSource, /startPublicResearch/);
assert.equal(resolveRoutePath("/analyze").isFallback, true);
assert.equal(resolveRoutePath("/start-diagnostic/deal-context").id, "deal-context-acquisition-motive");

const loaded = await loadModules();
let checks = [];
try {
  checks = await runChecks(loaded.research, loaded.api);
} finally {
  loaded.research.resetSecResearchForTests();
  await loaded.vite.close();
}

const failed = checks.filter((row) => row.result !== "PASS");
assert.equal(failed.length, 0, failed.map((row) => row.check_id).join(","));

console.log(JSON.stringify({
  act: "UI-FROG-04B1.CORR1",
  liveSecSmoke: "NOT_REQUIRED_FOR_UI_FROG_04B1_CORR1",
  checks: checks.length,
  failed: failed.length,
  endpoint: ENDPOINT,
}, null, 2));
console.log("UI-FROG-04B1.CORR1 structural-validity validation: handler + module fixture PASS");
