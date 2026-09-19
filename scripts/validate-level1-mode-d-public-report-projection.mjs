import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");

const TEST_UA = "MergeVue-LEVEL1-PROJECTION-Test contact@example.test";
const FIXED_NOW = Date.parse("2026-09-19T18:00:00.000Z");
const APPLE_CIK = "0000320193";
const ALPHABET_CIK = "0001652044";
const ENDPOINT = "/api/start-public-research";
const SUBMISSIONS_PREFIX = "https://data.sec.gov/submissions/CIK";
const SUBMISSIONS_SUFFIX = ".json";

const CANONICAL_NAMES = [
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
];

const ABSENCE_CLAIM_RE = /\b(the company has no|no such filing exists|not present|negative signal|did not file|was not filed)\b/i;
const INTERNAL_PATH_RE = /docs\/LEVEL1_MODE_D|docs\/reference-data|authorityPath|artifactPath/;
const HASH_RE = /authoritySha256|artifactSha256/;
const ENV_CODE_RE = /\bNT\/STJ\b|\bNT\/STP\b|\bNF\/NT\b|\bNF\/SFJ\b|\bNF\/SFP\b|\bSFJ\/SFP\b|\bSTJ\/STP\b|\bSTP\/STJ\b|\bSFP\/SFJ\b/;

function submissionsUrl(cik) {
  return `${SUBMISSIONS_PREFIX}${cik}${SUBMISSIONS_SUFFIX}`;
}

function jsonFetchResponse(status, body) {
  const text = JSON.stringify(body);
  const bytes = Buffer.from(text, "utf8");
  return {
    status,
    arrayBuffer: async () => {
      const copy = new Uint8Array(bytes);
      return copy.buffer;
    },
    json: async () => JSON.parse(text),
    text: async () => text,
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

function tableFetch(table) {
  return async (url) => {
    const entry = table[String(url)];
    if (typeof entry === "function") return entry();
    if (entry) return entry;
    return jsonFetchResponse(404, { error: "missing-fixture" });
  };
}

function recentFromRows(rows) {
  const recent = {
    form: rows.map((row) => row.form),
    filingDate: rows.map((row) => row.filingDate),
    accessionNumber: rows.map((row) => row.accessionNumber),
  };
  if (rows.some((row) => Object.prototype.hasOwnProperty.call(row, "items"))) {
    recent.items = rows.map((row) => (typeof row.items === "string" ? row.items : ""));
  }
  if (rows.some((row) => Object.prototype.hasOwnProperty.call(row, "primaryDocument"))) {
    recent.primaryDocument = rows.map((row) => row.primaryDocument ?? "d.htm");
  }
  return recent;
}

function payloadFor(cik, name, rows, files = []) {
  return {
    name,
    cik,
    filings: {
      recent: recentFromRows(rows),
      files,
    },
  };
}

function filingRow({ form, filingDate, accessionNumber, items, primaryDocument }) {
  return { form, filingDate, accessionNumber, items, primaryDocument };
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
  const projection = await vite.ssrLoadModule("/src/server/_level1ModeDPublicReportProjection.ts");
  const registry = await vite.ssrLoadModule("/src/reporting/mergevueCanonicalPublicReportRegistry.js");
  const model = await vite.ssrLoadModule("/src/reporting/mergevuePublicReportModel.js");
  return { vite, research, api, projection, registry, model };
}

function installHarness(research, fetchImpl, extra = {}) {
  research.resetSecResearchForTests();
  const tracked = createTrackedFetch(fetchImpl);
  const harness = {
    fetch: tracked.fetchFn,
    nowMs: extra.nowMs ?? (() => FIXED_NOW),
    userAgent: Object.prototype.hasOwnProperty.call(extra, "userAgent") ? extra.userAgent : TEST_UA,
  };
  research.setSecResearchTestHarness(harness);
  return tracked;
}

function pairTable({ acquirerRows, targetRows, extra = {} }) {
  return {
    [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, payloadFor(APPLE_CIK, "APPLE INC", acquirerRows)),
    [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, payloadFor(ALPHABET_CIK, "ALPHABET INC", targetRows)),
    ...extra,
  };
}

function mappedRows() {
  return [
    filingRow({ form: "10-K", filingDate: "2025-11-01", accessionNumber: "0000320193-25-000111" }),
    filingRow({ form: "8-K", filingDate: "2025-12-01", accessionNumber: "0000320193-25-000222", items: "2.02" }),
  ];
}

function targetMappedRows() {
  return [
    filingRow({ form: "10-Q", filingDate: "2026-03-01", accessionNumber: "0001652044-26-000010" }),
  ];
}

async function postHandler(api, body) {
  return api.default(new Request(`http://127.0.0.1${ENDPOINT}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

function requestBody(extra = {}) {
  return {
    acquirer: { cik: APPLE_CIK },
    target: { cik: ALPHABET_CIK },
    ...extra,
  };
}

function blockByNumber(publicReport, number) {
  return publicReport.blocks.find((row) => row.number === number);
}

function assertCanonicalReport(publicReport, pair = { acquirerCik: APPLE_CIK, targetCik: ALPHABET_CIK }) {
  assert.equal(publicReport.schemaVersion, "mergevue-canonical-public-report-v1");
  assert.equal(publicReport.sourceMode, "LEVEL1_MODE_D_SLICE1");
  assert.equal(publicReport.blocks.length, 12);
  assert.equal(publicReport.metadata.pair.acquirerCik, pair.acquirerCik);
  assert.equal(publicReport.metadata.pair.targetCik, pair.targetCik);
  for (let index = 0; index < 12; index += 1) {
    const row = publicReport.blocks[index];
    assert.equal(row.number, index + 1);
    assert.equal(row.canonicalName, CANONICAL_NAMES[index]);
  }
  assert.equal(blockByNumber(publicReport, 1).availabilityState, "LIMITED");
  for (const number of [2, 3, 4, 5, 6, 7, 8]) {
    assert.equal(blockByNumber(publicReport, number).availabilityState, "INSUFFICIENT_PUBLIC_EVIDENCE");
    assert.equal(blockByNumber(publicReport, number).content, null);
  }
  const block9 = blockByNumber(publicReport, 9);
  assert.equal(["LIMITED", "NOT_APPLICABLE"].includes(block9.availabilityState), true);
  assert.equal(blockByNumber(publicReport, 10).availabilityState, "LIMITED");
  assert.equal(blockByNumber(publicReport, 11).availabilityState, "AVAILABLE");
  assert.equal(blockByNumber(publicReport, 12).availabilityState, "AVAILABLE");
  const serialized = JSON.stringify(publicReport);
  assert.equal(INTERNAL_PATH_RE.test(serialized), false);
  assert.equal(HASH_RE.test(serialized), false);
  assert.equal(ENV_CODE_RE.test(serialized), false);
  assert.equal(ABSENCE_CLAIM_RE.test(serialized), false);
  assert.doesNotMatch(serialized, /https:\/\/mergevue\.com\/reports/);
  assert.doesNotMatch(serialized, /https:\/\/mergevue\.com\/track-record/);
}

async function run() {
  const { vite, research, api, projection, registry, model } = await loadModules();
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
    });
  }

  try {
    await check("REG-SHARED", "architecture", "one canonical block registry", "shared", async () => {
      assert.deepEqual([...registry.MERGEVUE_PUBLIC_REPORT_BLOCKS], CANONICAL_NAMES);
      assert.deepEqual([...model.MERGEVUE_PUBLIC_REPORT_BLOCKS], CANONICAL_NAMES);
      const modelSource = await read("src/reporting/mergevuePublicReportModel.js");
      const projectionSource = await read("src/server/_level1ModeDPublicReportProjection.ts");
      const researchSource = await read("src/server/_secResearch.ts");
      assert.match(modelSource, /mergevueCanonicalPublicReportRegistry/);
      assert.match(projectionSource, /mergevueCanonicalPublicReportRegistry/);
      assert.doesNotMatch(projectionSource, /mergevuePublicReportModel/);
      assert.doesNotMatch(projectionSource, /finalDeliverableFlow/);
      assert.doesNotMatch(projectionSource, /environments\.js/);
      assert.match(researchSource, /projectLevel1ToPublicReport/);
      assert.match(researchSource, /assembleLevel1Result/);
      return { state: "shared", evidence: "legacy model and Level-1 projection share the pure registry" };
    });

    await check("UI-NO-REPORTING", "architecture", "result UI does not import reporting", "bounded", async () => {
      const resultSource = await read("src/screens/public/PublicResearchResultScreen.jsx");
      const importLines = resultSource.split("\n").filter((line) => line.startsWith("import ")).join("\n");
      assert.doesNotMatch(importLines, /src\/reporting/);
      assert.doesNotMatch(importLines, /mergevuePublicReportModel/);
      assert.doesNotMatch(importLines, /_level1ModeD/);
      assert.match(resultSource, /payload\.publicReport/);
      assert.match(resultSource, /validateServerLevel1\(payload\.level1/);
      assert.match(resultSource, /renderCanonicalReport\(payload\.publicReport\)/);
      assert.doesNotMatch(resultSource, /payload\.level1\.(sides|propositions|p3|p4)/);
      assert.doesNotMatch(resultSource, /sessionStorage/);
      assert.doesNotMatch(resultSource, /localStorage/);
      return { state: "bounded", evidence: "result screen validates server level1 identity and renders only publicReport" };
    });

    await check("O4-SESSION", "architecture", "Deal Entry uses sessionStorage convenience state", "session-only", async () => {
      const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
      assert.match(entrySource, /sessionStorage/);
      assert.doesNotMatch(entrySource, /localStorage/);
      assert.match(entrySource, /mergevue\.deal-entry\.v1/);
      assert.doesNotMatch(entrySource, /body\.level1/);
      assert.doesNotMatch(entrySource, /publicReport/);
      return { state: "session-only", evidence: "Deal Entry persists typed/confirmed identity only" };
    });

    installHarness(research, tableFetch(pairTable({
      acquirerRows: mappedRows(),
      targetRows: targetMappedRows(),
    })));
    const complete = await research.startPublicResearch(requestBody());
    await check("C1-COMPLETE", "contract", "valid complete mapped pair", "projected", async () => {
      assert.equal(complete.statusCode, 200);
      assert.ok(complete.body.level1);
      assertCanonicalReport(complete.body.publicReport);
      const block1 = blockByNumber(complete.body.publicReport, 1);
      assert.equal(block1.content.establishedRecordClasses.length > 0, true);
      const block9 = blockByNumber(complete.body.publicReport, 9);
      assert.equal(block9.availabilityState, "NOT_APPLICABLE");
      assert.deepEqual(block9.content.actions, []);
      const statements = JSON.stringify(block1.content.establishedRecordClasses.map((row) => row.statement));
      assert.doesNotMatch(statements, /\bRC1\b/);
      assert.doesNotMatch(statements, /\bRC3\b/);
      return { state: "projected", evidence: "200 with level1 + 12-block publicReport; Block 9 NOT_APPLICABLE" };
    });

    installHarness(research, tableFetch(pairTable({
      acquirerRows: [
        ...mappedRows(),
        filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-01-15", accessionNumber: "0000320193-26-000999" }),
      ],
      targetRows: targetMappedRows(),
    })));
    const unmapped = await research.startPublicResearch(requestBody());
    await check("C2-UNMAPPED", "contract", "lawful PARTIAL from UNMAPPED", "partial-not-asymmetric", async () => {
      assert.equal(unmapped.statusCode, 200);
      assertCanonicalReport(unmapped.body.publicReport);
      assert.equal(unmapped.body.level1.pair.coverageBySide.acquirer, "PARTIAL");
      assert.equal(unmapped.body.publicReport.metadata.coverageBySide.acquirer, "PARTIAL");
      assert.equal(unmapped.body.level1.pair.symmetricExecution, true);
      assert.equal(unmapped.body.publicReport.metadata.symmetricExecution, true);
      const gap = JSON.stringify(blockByNumber(unmapped.body.publicReport, 10).content);
      assert.match(gap, /FUTURE-UNKNOWN-XYZ/);
      assert.match(gap, /UNMAPPED/);
      return { state: "partial-not-asymmetric", evidence: "unmapped forces PARTIAL without asymmetric execution" };
    });

    installHarness(research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, payloadFor(APPLE_CIK, "APPLE INC", mappedRows())),
      [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(404, { error: "no" }),
    }));
    const unavailable = await research.startPublicResearch(requestBody());
    await check("C3-SOURCE-UNAVAILABLE", "contract", "one side SOURCE_UNAVAILABLE", "qualified", async () => {
      assert.equal(unavailable.statusCode, 200);
      assertCanonicalReport(unavailable.body.publicReport);
      assert.equal(unavailable.body.level1.pair.coverageBySide.target, "SOURCE_UNAVAILABLE");
      const block10 = JSON.stringify(blockByNumber(unavailable.body.publicReport, 10).content);
      assert.match(block10, /could not be retrieved/);
      assert.doesNotMatch(block10, /the company has no/);
      assert.equal(unavailable.body.level1.pair.symmetricExecution, false);
      return { state: "qualified", evidence: "source-unavailable copy does not imply a completed search or absence" };
    });

    await check("C4-ASYMMETRY", "contract", "asymmetric execution remains distinct", "distinct", async () => {
      assert.equal(unavailable.body.publicReport.metadata.symmetricExecution, false);
      const notes = blockByNumber(unavailable.body.publicReport, 10).content.collectionLimitations;
      assert.equal(notes.some((row) => row.kind === "ASYMMETRIC_EXECUTION"), true);
      assert.equal(notes.some((row) => row.kind === "SOURCE_UNAVAILABLE"), true);
      return { state: "distinct", evidence: "asymmetric execution is adjacent metadata, not proposition retraction" };
    });

    await check("C5-P3-PROVENANCE", "contract", "P3 has inspectable P2 provenance", "bound", async () => {
      const facts = blockByNumber(complete.body.publicReport, 1).content.establishedRecordClasses;
      assert.equal(facts.length > 0, true);
      for (const fact of facts) {
        assert.equal(Array.isArray(fact.derivedFromPropositionIds) && fact.derivedFromPropositionIds.length > 0, true);
        assert.equal(Array.isArray(fact.evidenceBindings) && fact.evidenceBindings.length > 0, true);
        for (const binding of fact.evidenceBindings) {
          assert.equal(Boolean(binding.filedOrPublishedDate || binding.exactLocator), true);
          assert.equal(Object.prototype.hasOwnProperty.call(binding, "sha256"), false);
        }
      }
      return { state: "bound", evidence: "P3 facts carry P2 locator/date provenance without hashes" };
    });

    await check("C6-P4-NOT-ABSENCE", "contract", "P4 is not rendered as absence", "not-absence", async () => {
      const text = JSON.stringify(blockByNumber(complete.body.publicReport, 10));
      assert.match(text, /Not established from the public evidence/);
      assert.match(text, /does not establish that no such record exists/);
      assert.equal(ABSENCE_CLAIM_RE.test(text), false);
      return { state: "not-absence", evidence: "P4 uses lawful not-established copy" };
    });

    await check("C7-NO-ENVIRONMENT", "contract", "no Environment output", "absent", async () => {
      const serialized = JSON.stringify(complete.body.publicReport);
      assert.doesNotMatch(serialized, /Identified Environment Types[\s\S]{0,200}NT\//);
      assert.equal(blockByNumber(complete.body.publicReport, 4).content, null);
      return { state: "absent", evidence: "Block 4 remains INSUFFICIENT_PUBLIC_EVIDENCE" };
    });

    await check("C8-NO-ECS", "contract", "no ECS output in Level-1 blocks", "absent", async () => {
      for (const number of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) {
        const serialized = JSON.stringify(blockByNumber(complete.body.publicReport, number));
        assert.doesNotMatch(serialized, /\bECS\b/);
      }
      assert.equal(blockByNumber(complete.body.publicReport, 3).content, null);
      return { state: "absent", evidence: "Blocks 1-10 and 12 contain no ECS; Block 3 is unavailable" };
    });

    await check("C9-NO-FRICTION", "contract", "no friction forecast", "absent", async () => {
      assert.equal(blockByNumber(complete.body.publicReport, 7).content, null);
      assert.match(blockByNumber(complete.body.publicReport, 7).availabilityReason, /does not support/);
      return { state: "absent", evidence: "Block 7 remains unavailable" };
    });

    await check("C10-NO-ECONOMICS", "contract", "no economic prediction", "absent", async () => {
      assert.equal(blockByNumber(complete.body.publicReport, 8).content, null);
      return { state: "absent", evidence: "Block 8 remains unavailable" };
    });

    await check("C11-NO-LEGACY-FALLBACK", "architecture", "no questionnaire builder on Level-1 path", "blocked", async () => {
      const projectionSource = await read("src/server/_level1ModeDPublicReportProjection.ts");
      const researchSource = await read("src/server/_secResearch.ts");
      assert.doesNotMatch(projectionSource, /buildFinalDeliverable/);
      assert.doesNotMatch(projectionSource, /buildPublicReport/);
      assert.doesNotMatch(researchSource, /mergevuePublicReportModel/);
      assert.doesNotMatch(researchSource, /finalDeliverableFlow/);
      return { state: "blocked", evidence: "Level-1 server path does not import legacy analytical builders" };
    });

    const displayCapped = complete.body.companies.find((row) => row.side === "acquirer").recentFilings;
    await check("C12-DISPLAY-CAP", "contract", "recentFilings cap cannot change projection", "independent", async () => {
      assert.equal(displayCapped.length <= 10, true);
      const fromEngine = projection.projectLevel1ToPublicReport(complete.body.level1);
      assert.equal(fromEngine.ok, true);
      assert.deepEqual(fromEngine.publicReport.blocks.map((row) => row.availabilityState), complete.body.publicReport.blocks.map((row) => row.availabilityState));
      assert.equal(JSON.stringify(fromEngine.publicReport).includes("recentFilings"), false);
      return { state: "independent", evidence: "projection input is level1, not the display filing list" };
    });

    await check("C13-MALFORMED-LEVEL1", "failure", "malformed level1 fails closed", "failed", async () => {
      const result = projection.projectLevel1ToPublicReport({ sides: { acquirer: {} } });
      assert.equal(result.ok, false);
      assert.equal(Object.prototype.hasOwnProperty.call(result, "publicReport"), false);
      return { state: "failed", evidence: result.reason };
    });

    await check("C14-MISSING-LEVEL1", "failure", "missing level1 fails closed", "failed", async () => {
      const result = projection.projectLevel1ToPublicReport(null);
      assert.equal(result.ok, false);
      return { state: "failed", evidence: result.reason };
    });

    installHarness(research, tableFetch(pairTable({
      acquirerRows: mappedRows(),
      targetRows: targetMappedRows(),
    })));
    const forged = await research.startPublicResearch({
      acquirer: { cik: APPLE_CIK, environment: "NT/STJ", ecs: 88 },
      target: { cik: ALPHABET_CIK },
      publicReport: { forged: true },
      level1: { forged: true },
    });
    await check("C15-FORGED-CLIENT", "bypass", "forged client analytical fields cannot substitute", "ignored", async () => {
      assert.equal(forged.statusCode, 200);
      assert.notEqual(forged.body.publicReport.forged, true);
      assertCanonicalReport(forged.body.publicReport);
      assert.equal(blockByNumber(forged.body.publicReport, 4).content, null);
      const handler = await postHandler(api, {
        acquirer: { cik: APPLE_CIK },
        target: { cik: ALPHABET_CIK },
        publicReport: { schemaVersion: "forged" },
      });
      const body = await handler.json();
      assert.notEqual(body.publicReport?.schemaVersion, "forged");
      return { state: "ignored", evidence: "request analytical fields do not become response authority" };
    });

    await check("C16-HANDOFF-RULE", "source", "result screen requires valid server publicReport to reuse handoff", "gated", async () => {
      const resultSource = await read("src/screens/public/PublicResearchResultScreen.jsx");
      assert.match(resultSource, /validateCanonicalPublicReport/);
      assert.match(resultSource, /validateServerLevel1/);
      assert.match(resultSource, /matchingHandoffPayload/);
      assert.match(resultSource, /publicResearchResultHandoff = null/);
      return { state: "gated", evidence: "CASE A requires valid level1 and publicReport; malformed handoff is discarded" };
    });

    await check("BOTH-UNAVAILABLE", "contract", "both sides source-unavailable still project", "limited-report", async () => {
      installHarness(research, tableFetch({
        [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(404, { error: "no" }),
        [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(404, { error: "no" }),
      }));
      const result = await research.startPublicResearch(requestBody());
      assert.equal(result.statusCode, 503);
      assert.ok(result.body.publicReport);
      assertCanonicalReport(result.body.publicReport);
      assert.equal(result.body.publicReport.metadata.coverageBySide.acquirer, "SOURCE_UNAVAILABLE");
      assert.equal(result.body.publicReport.metadata.coverageBySide.target, "SOURCE_UNAVAILABLE");
      return { state: "limited-report", evidence: "source-unavailable pair remains renderable as a limited canonical report" };
    });

    await check("ENTRY-NO-NAVIGATE", "scope", "DealEntry still has no navigate token", "protected", async () => {
      const entrySource = await read("src/screens/public/DealEntryScreen.jsx");
      assert.doesNotMatch(entrySource, /navigate\(/);
      assert.match(entrySource, /openPublicResearchResult/);
      return { state: "protected", evidence: "DealEntry continues to import result-module handoff" };
    });
  } finally {
    research.resetSecResearchForTests();
    await vite.close();
  }

  const failed = results.filter((row) => row.result !== "PASS");
  console.log(JSON.stringify({
    act: "LEVEL1-MODE-D-PUBLIC-REPORT-PROJECTION-IMPLEMENTATION-1",
    checks: results.length,
    failed: failed.length,
    results,
  }, null, 2));
  if (failed.length > 0) process.exit(1);
}

await run();
