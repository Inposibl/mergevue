import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const TEST_UA = "MergeVue-LEVEL1-SLICE1-Test contact@example.test";
const FIXED_NOW = Date.parse("2026-09-19T18:00:00.000Z");
const FIXED_ISO = "2026-09-19T18:00:00.000Z";
const APPLE_CIK = "0000320193";
const ALPHABET_CIK = "0001652044";
const ENDPOINT = "/api/start-public-research";
const SUBMISSIONS_PREFIX = "https://data.sec.gov/submissions/CIK";
const SUBMISSIONS_SUFFIX = ".json";

const METHODOLOGY_PATH = "docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.2_CORR1_CANDIDATE.md";
const METHODOLOGY_SHA = "3dfe86b38628560f81bc566c19d5dc15b43fe0e5977e0c0249928edd0ff84f3c";
const REFDATA_PATH = "docs/reference-data/LEVEL1_MODE_D_REFERENCE_DATA_INSTANCE_v1.0_CORR1_CANDIDATE.json";
const REFDATA_SHA = "36d62683012213e09f57db0de41761082778dbde747a73aa1a469ad9dd380133";

const ABSENCE_RE = /\b(absent|absence|missing|not filed|does not exist|none exists|no such record|zero filings)\b/i;
const SEARCH_RE = /\b(examined|searched|reviewed|found nothing)\b/i;
const FORBIDDEN_FETCH_RE = /Archives\/edgar|companyfacts|companyconcept|\/frames\/|xbrl|news\.|press/i;
const ALLOWED_URL_RE = /^https:\/\/data\.sec\.gov\/submissions\/CIK\d{10}(?:-submissions-\d+)?\.json$/;

function submissionsUrl(cik) {
  return `${SUBMISSIONS_PREFIX}${cik}${SUBMISSIONS_SUFFIX}`;
}

function submissionsFileUrl(name) {
  return `https://data.sec.gov/submissions/${name}`;
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

function filingRow({ form, filingDate, accessionNumber, items, primaryDocument }) {
  return { form, filingDate, accessionNumber, items, primaryDocument };
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

function primaryPayload({ name, rows, files = [] }) {
  return {
    name,
    cik: APPLE_CIK,
    filings: {
      recent: recentFromRows(rows),
      files,
    },
  };
}

function additionalPayload(rows) {
  return recentFromRows(rows);
}

function gitShow(path) {
  return execFileSync("git", ["show", `HEAD:${path}`], {
    encoding: "utf8",
    cwd: fileURLToPath(root),
  });
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
  const slice1 = await vite.ssrLoadModule("/src/server/_level1ModeDSlice1.ts");
  return { vite, research, api, slice1 };
}

function installHarness(research, fetchImpl, extra = {}) {
  research.resetSecResearchForTests();
  const tracked = createTrackedFetch(fetchImpl);
  const harness = {
    fetch: tracked.fetchFn,
    nowMs: extra.nowMs ?? (() => FIXED_NOW),
    userAgent: Object.prototype.hasOwnProperty.call(extra, "userAgent") ? extra.userAgent : TEST_UA,
  };
  if (Object.prototype.hasOwnProperty.call(extra, "timeoutMs")) harness.timeoutMs = extra.timeoutMs;
  if (Object.prototype.hasOwnProperty.call(extra, "maxAdditionalFiles")) {
    harness.maxAdditionalFiles = extra.maxAdditionalFiles;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "referenceDataBytes")) {
    harness.referenceDataBytes = extra.referenceDataBytes;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "expectedReferenceDataSha256")) {
    harness.expectedReferenceDataSha256 = extra.expectedReferenceDataSha256;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "expectedReferenceDataIdentities")) {
    harness.expectedReferenceDataIdentities = extra.expectedReferenceDataIdentities;
  }
  research.setSecResearchTestHarness(harness);
  return tracked;
}

function requestBody() {
  return { acquirer: { cik: APPLE_CIK }, target: { cik: ALPHABET_CIK } };
}

function company(body, side) {
  return (body.companies ?? []).find((item) => item.side === side);
}

function l1(body) {
  return body.level1;
}

function sideL1(body, side) {
  return body.level1?.sides?.[side];
}

function pClass(sideResult, propositionClass) {
  return (sideResult?.propositions ?? []).filter((row) => row.propositionClass === propositionClass);
}

function p3For(sideResult, recordClass) {
  return pClass(sideResult, "P3").filter((row) => row.recordClass === recordClass);
}

function p4For(sideResult, recordClass) {
  return pClass(sideResult, "P4").filter((row) => row.recordClass === recordClass);
}

function p2For(sideResult, recordClass) {
  return pClass(sideResult, "P2").filter((row) => row.recordClass === recordClass);
}

function p5For(sideResult) {
  return pClass(sideResult, "P5");
}

function assertNoP6(value) {
  const serialized = JSON.stringify(value);
  assert.equal(/"propositionClass":"P6"/.test(serialized), false);
  assert.equal(Object.prototype.hasOwnProperty.call(value?.level1 ?? {}, "p6"), false);
  assert.equal((value?.level1?.propositionClasses ?? []).includes("P6"), false);
}

function assertNoSupportClass(value) {
  assert.equal(/"supportClass"\s*:/.test(JSON.stringify(value)), false);
}

function assertNoMissingWithinBound(value) {
  assert.equal(JSON.stringify(value).includes("MISSING_WITHIN_BOUND"), false);
}

function assertAllowlistedOutbound(calls) {
  for (const call of calls) {
    assert.equal(ALLOWED_URL_RE.test(call.url), true, call.url);
    assert.equal(FORBIDDEN_FETCH_RE.test(call.url), false, call.url);
    assert.equal(call.options.method, "GET");
  }
}

function cleanTargetRows() {
  return [
    filingRow({
      form: "10-Q",
      filingDate: "2026-03-01",
      accessionNumber: "0001652044-26-000010",
    }),
  ];
}

function pairTable({ acquirer, target, extra = {} }) {
  return {
    [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(200, acquirer),
    [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, target),
    ...extra,
  };
}

async function postHandler(api, body) {
  return api.default(new Request(`http://127.0.0.1${ENDPOINT}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function runChecks(research, api, slice1) {
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

  const methodologySource = await read(METHODOLOGY_PATH);
  const refdataSource = await read(REFDATA_PATH);
  const researchSource = await read("src/server/_secResearch.ts");
  const handlerSource = await read("api/start-public-research.ts");
  const slice1Source = await read("src/server/_level1ModeDSlice1.ts");
  const resultScreen = await read("src/screens/public/PublicResearchResultScreen.jsx");

  await check("AUTH-METH", "authority", "methodology SHA-256", METHODOLOGY_SHA, async () => {
    assert.equal(sha256(methodologySource), METHODOLOGY_SHA);
    assert.equal(sha256(gitShow(METHODOLOGY_PATH)), METHODOLOGY_SHA);
    return { state: METHODOLOGY_SHA, evidence: "exact accepted methodology bytes" };
  });

  await check("AUTH-REF", "authority", "reference-data SHA-256", REFDATA_SHA, async () => {
    assert.equal(sha256(refdataSource), REFDATA_SHA);
    assert.equal(sha256(gitShow(REFDATA_PATH)), REFDATA_SHA);
    const parsed = JSON.parse(refdataSource);
    assert.equal(parsed.identities.recordClassMappingVersion, "MD-L1-RCMAP-v1.0-CORR1");
    assert.equal(parsed.identities.rawFormValueResolutionVersion, "MD-L1-RAWFORM-v1.0-CORR1");
    assert.equal(parsed.identities.semanticTaxonomySnapshotId, "MD-L1-SEMTAX-2026-09-19-BOUNDED");
    assert.equal(parsed.entries.length, 32);
    assert.equal(parsed.entries.filter((row) => row.formDisposition === "OUT_OF_BOUND").length, 0);
    assert.equal(parsed.authorityBoundary.ownerAccepted, false);
    return { state: REFDATA_SHA, evidence: "exact accepted artifact; frozen lifecycle metadata ignored" };
  });

  await check("AUTH-WIRE", "causality", "production path wires Slice-1", "wired", async () => {
    assert.match(handlerSource, /startPublicResearch/);
    assert.match(researchSource, /evaluateSlice1Side/);
    assert.match(researchSource, /assembleLevel1Result/);
    assert.match(researchSource, /bindAcceptedReferenceData/);
    assert.match(researchSource, /LEVEL1_RESPONSE_FIELD/);
    assert.match(slice1Source, /resolveRawFormValue/);
    assert.doesNotMatch(handlerSource, /PublicResearchResultScreen/);
    return { state: "wired", evidence: "handler → startPublicResearch → bind/collect/evaluate/assemble" };
  });

  await check("AUTH-NO-TRIM", "exact-match", "resolver does not trim", "exact", async () => {
    const fn = slice1Source.slice(
      slice1Source.indexOf("export function resolveRawFormValue"),
      slice1Source.indexOf("export function additionalSubmissionsFileName"),
    );
    assert.doesNotMatch(fn, /\.trim\(/);
    assert.doesNotMatch(fn, /toLowerCase|toUpperCase|replace\(|RegExp|match\(/);
    assert.match(fn, /registry\.get\(rawFormValue\)/);
    return { state: "exact", evidence: "Map.get exact source string; no normalization" };
  });

  await check("AUTH-NO-OOB-INVENTION", "unknown", "no not-in-table OOB path", "unmapped-default", async () => {
    assert.match(slice1Source, /DISPOSITION_UNMAPPED/);
    assert.match(slice1Source, /Never OUT_OF_BOUND/);
    assert.doesNotMatch(slice1Source, /if \(!entry\)[\s\S]{0,200}OUT_OF_BOUND/);
    return { state: "unmapped-default", evidence: "unknown defaults to UNMAPPED, not OOB" };
  });

  const cleanTarget = primaryPayload({
    name: "Alphabet Inc.",
    rows: cleanTargetRows(),
    files: [],
  });

  await check("T1", "P2/P3", "exact 10-K", "RC3-established", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const response = await postHandler(api, requestBody());
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.ok(body.level1);
    const acquirer = sideL1(body, "acquirer");
    assert.equal(acquirer.coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(p2For(acquirer, "RC3").length, 1);
    assert.equal(p2For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    assert.equal(p3For(acquirer, "RC3").length, 1);
    assert.equal(p3For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    assertAllowlistedOutbound(tracked.calls);
    assertNoP6(body);
    return { state: "RC3-established", evidence: "handler POST → level1 P2/P3 RC3" };
  });

  await check("T2", "unknown", "FUTURE-UNKNOWN-XYZ", "unmapped-partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000002" })],
      }),
      target: cleanTarget,
    })));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["FUTURE-UNKNOWN-XYZ"]);
    assert.equal(p2For(acquirer, "RC3").length, 0);
    assert.equal(p3For(acquirer, "RC3").length, 0);
    assert.equal(acquirer.propositions.some((row) => row.formDisposition === "OUT_OF_BOUND"), false);
    assert.equal(p4For(acquirer, "RC3")[0].gapState, "NOT_ESTABLISHED_WITHIN_BOUND");
    assert.doesNotMatch(p4For(acquirer, "RC3")[0].propositionText, ABSENCE_RE);
    return { state: "unmapped-partial", evidence: "unknown is UNMAPPED; no RC; no OOB; no absence" };
  });

  await check("T3", "monotonicity", "10-K then unknown", "rc3-preserved-partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-03-01", accessionNumber: "0000320193-26-000099" }),
        ],
      }),
      target: cleanTarget,
    })));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(p3For(acquirer, "RC3").length, 1);
    assert.equal(p3For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    assert.equal(p3For(acquirer, "RC3")[0].gapState === false, false);
    return { state: "rc3-preserved-partial", evidence: "unknown degrades coverage only" };
  });

  await check("T4", "corr1-removal", "20-F", "unmapped-no-rc3", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "20-F", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000020" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["20-F"]);
    assert.equal(p3For(acquirer, "RC3").length, 0);
    assert.equal(p2For(acquirer, "RC3").length, 0);
    return { state: "unmapped-no-rc3", evidence: "20-F removed in CORR1 remains UNMAPPED" };
  });

  await check("T5", "corr1-removal", "40-F/A", "unmapped-no-rc3", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "40-F/A", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000040" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["40-F/A"]);
    assert.equal(p3For(acquirer, "RC3").length, 0);
    return { state: "unmapped-no-rc3", evidence: "40-F/A remains UNMAPPED" };
  });

  await check("T6", "near-miss", "10-k", "unmapped", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-k", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000003" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["10-k"]);
    return { state: "unmapped", evidence: "case-sensitive exact match" };
  });

  await check("T7", "near-miss", "10-K trailing space", "unmapped", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K ", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000004" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["10-K "]);
    return { state: "unmapped", evidence: "whitespace-sensitive exact match" };
  });

  await check("T8", "multi-rc", "DEFM14A", "rc1-and-rc5-one-physical", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "DEFM14A", filingDate: "2026-04-01", accessionNumber: "0000320193-26-000014" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.physicalRecordCount, 1);
    assert.equal(p2For(acquirer, "RC1").length, 1);
    assert.equal(p2For(acquirer, "RC5").length, 1);
    assert.equal(p2For(acquirer, "RC1")[0].physicalRecordKey, p2For(acquirer, "RC5")[0].physicalRecordKey);
    assert.equal(p3For(acquirer, "RC1").length, 1);
    assert.equal(p3For(acquirer, "RC5").length, 1);
    return { state: "rc1-and-rc5-one-physical", evidence: "one accession; two class projections" };
  });

  await check("T9", "P5", "8-K items 2.01,9.01", "p5-exact", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({
          form: "8-K",
          filingDate: "2026-05-01",
          accessionNumber: "0000320193-26-000008",
          items: "2.01,9.01",
        })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(p3For(acquirer, "RC2").length, 1);
    assert.equal(p5For(acquirer).length, 1);
    assert.equal(p5For(acquirer)[0].publishedStructuredFieldValue, "2.01,9.01");
    assert.equal(p5For(acquirer)[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    return { state: "p5-exact", evidence: "exact published items preserved" };
  });

  await check("T10", "P5", "8-K empty items", "p5-empty-established", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({
          form: "8-K",
          filingDate: "2026-05-02",
          accessionNumber: "0000320193-26-000009",
          items: "",
        })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(p5For(acquirer).length, 1);
    assert.equal(p5For(acquirer)[0].publishedStructuredFieldValue, "");
    assert.equal(p5For(acquirer)[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    assert.notEqual(p5For(acquirer)[0].gapState, "NOT_ESTABLISHED_WITHIN_BOUND");
    return { state: "p5-empty-established", evidence: "empty published items is established" };
  });

  await check("T11", "P5-firewall", "10-K with items field", "no-rc2-no-p5", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({
          form: "10-K",
          filingDate: "2026-02-15",
          accessionNumber: "0000320193-26-000001",
          items: "2.01,9.01",
        })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(p3For(acquirer, "RC2").length, 0);
    assert.equal(p5For(acquirer).length, 0);
    assert.equal(p3For(acquirer, "RC3").length, 1);
    return { state: "no-rc2-no-p5", evidence: "items population does not infer RC2/P5" };
  });

  await check("T12", "P4", "no RC4 mapped record", "p4-not-established", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    const p4 = p4For(acquirer, "RC4")[0];
    assert.equal(p4.gapState, "NOT_ESTABLISHED_WITHIN_BOUND");
    assert.equal(p4.rawFormValue, undefined);
    assert.doesNotMatch(p4.propositionText, ABSENCE_RE);
    assert.notEqual(p4.gapState, false);
    return { state: "p4-not-established", evidence: "P4 explicit non-negative state; no fabricated filing fields" };
  });

  await check("T13", "P4", "COMPLETE + P4", "complete-not-absence", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(p4For(acquirer, "RC1")[0].gapState, "NOT_ESTABLISHED_WITHIN_BOUND");
    assert.doesNotMatch(JSON.stringify(p4For(acquirer, "RC1")[0]), ABSENCE_RE);
    return { state: "complete-not-absence", evidence: "COMPLETE does not authorize absence" };
  });

  await check("T14", "monotonicity", "PARTIAL preserves positives", "positives-preserved", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "20-F", filingDate: "2026-02-16", accessionNumber: "0000320193-26-000020" }),
        ],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(p3For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    return { state: "positives-preserved", evidence: "20-F unknown does not retract RC3" };
  });

  await check("T15", "source-unavailable", "primary 500", "source-unavailable", async () => {
    const tracked = installHarness(research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(500, { error: "no" }),
      [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, cleanTarget),
    }));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(acquirer.coverage, "SOURCE_UNAVAILABLE");
    assert.equal(pClass(acquirer, "P1").length, 0);
    assert.equal(pClass(acquirer, "P2").length, 0);
    assert.equal(pClass(acquirer, "P3").length, 0);
    assert.equal(pClass(acquirer, "P5").length, 0);
    assert.equal(p4For(acquirer, "RC3")[0].epistemicQualification, "SOURCE_UNAVAILABLE");
    assert.equal(p4For(acquirer, "RC3")[0].sourceExamination, "DID_NOT_OCCUR");
    assert.doesNotMatch(p4For(acquirer, "RC3")[0].propositionText, SEARCH_RE);
    assert.doesNotMatch(p4For(acquirer, "RC3")[0].propositionText, ABSENCE_RE);
    assert.equal(tracked.calls.some((call) => call.url.includes("-F-")), false);
    return { state: "source-unavailable", evidence: "no positives; P3 silent; P4 qualified no-examination" };
  });

  const extraName = "CIK0000320193-submissions-001.json";
  const extraNameTwo = "CIK0000320193-submissions-002.json";
  const microsoftExtraName = "CIK0000789019-submissions-002.json";
  await check("T16", "aux-page", "auxiliary 404 after primary", "partial-positives-kept", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 1, filingFrom: "1994-01-01", filingTo: "2010-01-01" }],
      }),
      target: cleanTarget,
    })));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(p3For(acquirer, "RC3").length, 1);
    assert.equal(tracked.calls.some((call) => call.url === submissionsFileUrl(extraName)), true);
    assert.equal(
      acquirer.collectionDeficiencies.some((row) => row.code === "EXPOSED_PAGE_UNCONSULTED"),
      true,
    );
    return { state: "partial-positives-kept", evidence: "unconsulted auxiliary page → PARTIAL; RC3 stands" };
  });

  await check("T17", "enumeration", "auxiliary page records participate", "aux-records-counted", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 1, filingFrom: "1994-01-01", filingTo: "2010-01-01" }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "S-4", filingDate: "2005-06-01", accessionNumber: "0000320193-05-000100" }),
        ])),
      },
    })));
    const result = await research.startPublicResearch(requestBody());
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(p3For(acquirer, "RC1").length, 1);
    assert.equal(p2For(acquirer, "RC1")[0].filedOrPublishedDate, "2005-06-01");
    assert.equal(tracked.calls.some((call) => call.url === submissionsFileUrl(extraName)), true);
    assertAllowlistedOutbound(tracked.calls);
    return { state: "aux-records-counted", evidence: "S-4 on additional page establishes RC1" };
  });

  await check("T18", "legacy-display", "recentFilings cap vs analytical enum", "display-10-analytics-complete", async () => {
    const twelve = Array.from({ length: 12 }, (_, index) => filingRow({
      form: "10-K",
      filingDate: `2024-${String((index % 12) + 1).padStart(2, "0")}-15`,
      accessionNumber: `0000320193-24-${String(index + 1).padStart(6, "0")}`,
    }));
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: twelve,
        files: [{ name: extraName, filingCount: 1 }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-Q", filingDate: "2001-01-01", accessionNumber: "0000320193-01-000001" }),
        ])),
      },
    })));
    const result = await research.startPublicResearch(requestBody());
    const display = company(result.body, "acquirer");
    const acquirer = sideL1(result.body, "acquirer");
    assert.equal(display.recentFilings.length, 10);
    assert.equal(display.recentFilingsLimit, 10);
    assert.equal(display.filingCount, 12);
    assert.equal(acquirer.physicalRecordCount, 13);
    assert.equal(p3For(acquirer, "RC4").length, 1);
    assert.equal(tracked.calls.some((call) => call.url === submissionsFileUrl(extraName)), true);
    return { state: "display-10-analytics-complete", evidence: "legacy cap 10; analytical 13 including auxiliary 10-Q" };
  });

  await check("T19", "fail-closed", "SHA mismatch", "binding-failed", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })), {
      expectedReferenceDataSha256: "0".repeat(64),
    });
    const result = await research.startPublicResearch(requestBody());
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.status, "slice1-reference-data-binding-failed");
    assert.equal(result.body.slice1BindingFailure.reason, "REFERENCE_DATA_SHA256_MISMATCH");
    assert.equal(tracked.calls.length, 0);
    assert.equal(result.body.level1, undefined);
    return { state: "binding-failed", evidence: "SHA mismatch fail-closed before outbound" };
  });

  await check("T20", "fail-closed", "identity mismatch", "binding-failed", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })), {
      expectedReferenceDataIdentities: {
        recordClassMappingVersion: "MD-L1-RCMAP-WRONG",
        rawFormValueResolutionVersion: "MD-L1-RAWFORM-v1.0-CORR1",
        semanticTaxonomySnapshotId: "MD-L1-SEMTAX-2026-09-19-BOUNDED",
      },
    });
    const result = await research.startPublicResearch(requestBody());
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.slice1BindingFailure.reason, "REFERENCE_DATA_IDENTITY_MISMATCH");
    assert.equal(tracked.calls.length, 0);
    return { state: "binding-failed", evidence: "identity mismatch fail-closed before outbound" };
  });

  await check("T21", "oob", "runtime cannot invent OOB", "zero-oob", async () => {
    const bound = slice1.bindAcceptedReferenceData();
    assert.equal(bound.ok, true);
    let oob = 0;
    for (const entry of bound.registry.values()) {
      if (entry.formDisposition === "OUT_OF_BOUND") oob += 1;
    }
    assert.equal(oob, 0);
    const unknown = slice1.resolveRawFormValue("NOT-IN-REGISTRY", bound.registry);
    assert.equal(unknown.formDisposition, "UNMAPPED");
    assert.equal(unknown.unknown, true);
    assert.notEqual(unknown.formDisposition, "OUT_OF_BOUND");
    return { state: "zero-oob", evidence: "registry has 0 OOB; unknown is UNMAPPED" };
  });

  await check("T22", "dedupe", "same accession twice", "one-physical", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 1 }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
        ])),
      },
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.physicalRecordCount, 1);
    assert.equal(p2For(acquirer, "RC3").length, 1);
    assert.equal(acquirer.physicalRecordDedupeKey, "accessionNumber");
    return { state: "one-physical", evidence: "accessionNumber dedupe; no double count" };
  });

  await check("T23-T25", "schema", "P6/supportClass/MISSING absent", "absent", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const result = await research.startPublicResearch(requestBody());
    assertNoP6(result.body);
    assertNoSupportClass(result.body);
    assertNoMissingWithinBound(result.body);
    slice1.assertNoForbiddenSlice1Output(result.body.level1);
    return { state: "absent", evidence: "no P6, no supportClass, no MISSING_WITHIN_BOUND" };
  });

  await check("FF-A", "forced-failure", "mutated SHA", "fail-closed", async () => {
    const bytes = Buffer.from(`${refdataSource} `, "utf8");
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({ name: "Apple Inc.", rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })] }),
      target: cleanTarget,
    })), { referenceDataBytes: bytes });
    const result = await research.startPublicResearch(requestBody());
    assert.equal(result.statusCode, 503);
    assert.equal(result.body.slice1BindingFailure.reason, "REFERENCE_DATA_SHA256_MISMATCH");
    assert.equal(tracked.calls.length, 0);
    return { state: "fail-closed", evidence: "mutated bytes fail closed" };
  });

  await check("FF-B", "forced-failure", "mutated identity", "fail-closed", async () => {
    const result = await (async () => {
      installHarness(research, tableFetch(pairTable({
        acquirer: primaryPayload({ name: "Apple Inc.", rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })] }),
        target: cleanTarget,
      })), {
        expectedReferenceDataIdentities: {
          recordClassMappingVersion: "MD-L1-RCMAP-v1.0-CORR1",
          rawFormValueResolutionVersion: "MD-L1-RAWFORM-WRONG",
          semanticTaxonomySnapshotId: "MD-L1-SEMTAX-2026-09-19-BOUNDED",
        },
      });
      return research.startPublicResearch(requestBody());
    })();
    assert.equal(result.body.slice1BindingFailure.reason, "REFERENCE_DATA_IDENTITY_MISMATCH");
    return { state: "fail-closed", evidence: "raw-form identity mismatch fail-closed" };
  });

  await check("FF-C", "forced-failure", "unknown never silent COMPLETE", "partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "s-4", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000111" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.notEqual(acquirer.coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(acquirer.coverage, "PARTIAL");
    return { state: "partial", evidence: "near-miss s-4 cannot be silent COMPLETE" };
  });

  await check("FF-D", "forced-failure", "unconsulted exposed page", "partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 1 }],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    return { state: "partial", evidence: "unconsulted exposed page forces PARTIAL" };
  });

  await check("FF-E", "forced-failure", "count reconciliation mismatch", "partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 99 }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-Q", filingDate: "2001-01-01", accessionNumber: "0000320193-01-000001" }),
        ])),
      },
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(
      acquirer.collectionDeficiencies.some((row) => row.code === "COUNT_RECONCILIATION_MISMATCH"),
      true,
    );
    assert.equal(p3For(acquirer, "RC4").length, 1);
    return { state: "partial", evidence: "published filingCount 99 vs 1 enumerated" };
  });

  await check("FF-F", "forced-failure", "engineering truncation", "partial", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [
          { name: extraName, filingCount: 1 },
          { name: extraNameTwo, filingCount: 1 },
        ],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-Q", filingDate: "2001-01-01", accessionNumber: "0000320193-01-000001" }),
        ])),
        [submissionsFileUrl(extraNameTwo)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "S-4", filingDate: "2002-01-01", accessionNumber: "0000320193-02-000001" }),
        ])),
      },
    })), { maxAdditionalFiles: 1 });
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(
      acquirer.collectionDeficiencies.some((row) => row.code === "ENGINEERING_GUARD_TRUNCATION"),
      true,
    );
    assert.equal(tracked.calls.some((call) => call.url.endsWith(extraNameTwo)), false);
    assert.equal(p3For(acquirer, "RC4").length, 1);
    return { state: "partial", evidence: "cap 1 additional page; F-2 unconsulted; positives from consulted pages kept" };
  });

  await check("FF-G", "forced-failure", "unknown must not be OOB", "unmapped", async () => {
    const unknown = slice1.resolveRawFormValue("NOT-IN-REGISTRY", slice1.bindAcceptedReferenceData().registry);
    assert.notEqual(unknown.formDisposition, "OUT_OF_BOUND");
    assert.equal(unknown.formDisposition, "UNMAPPED");
    return { state: "unmapped", evidence: "not-in-registry ↛ OUT_OF_BOUND" };
  });

  await check("FF-H", "forced-failure", "P3 is not boolean false", "positive-only", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(pClass(acquirer, "P3").some((row) => row.gapState === false || row.established === false), false);
    assert.equal(p3For(acquirer, "RC1").length, 0);
    assert.equal(p4For(acquirer, "RC1")[0].gapState, "NOT_ESTABLISHED_WITHIN_BOUND");
    return { state: "positive-only", evidence: "no P3=false; P4 carries non-establishment" };
  });

  await check("FF-I", "forced-failure", "P5 never NOT_ESTABLISHED", "no-p5-nonest", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(p5For(acquirer).some((row) => row.gapState === "NOT_ESTABLISHED_WITHIN_BOUND"), false);
    return { state: "no-p5-nonest", evidence: "P5 either established or omitted" };
  });

  await check("FF-J", "forced-failure", "coverage cannot downgrade P3", "p3-stands", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-03-01", accessionNumber: "0000320193-26-000099" }),
        ],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(p3For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    return { state: "p3-stands", evidence: "PARTIAL does not retract established P3" };
  });

  await check("FF-K", "forced-failure", "no document-body fetch", "submissions-only", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({
          form: "10-K",
          filingDate: "2026-02-15",
          accessionNumber: "0000320193-26-000001",
          primaryDocument: "a10-k.htm",
        })],
        files: [{ name: extraName, filingCount: 1 }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-Q", filingDate: "2001-01-01", accessionNumber: "0000320193-01-000001", primaryDocument: "q.htm" }),
        ])),
      },
    })));
    const result = await research.startPublicResearch(requestBody());
    assertAllowlistedOutbound(tracked.calls);
    assert.equal(tracked.calls.some((call) => /Archives/.test(call.url)), false);
    assert.equal(tracked.calls.some((call) => /a10-k\.htm/.test(call.url)), false);
    const p2 = p2For(sideL1(result.body, "acquirer"), "RC3")[0];
    assert.match(p2.exactLocator.documentLocator, /Archives\/edgar/);
    return { state: "submissions-only", evidence: "locator recorded; document body not fetched" };
  });

  await check("NEAR-MISS-EXTRA", "exact-match", "DEF14A / DEF  14A / leading space", "all-unmapped", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "DEF14A", filingDate: "2026-01-01", accessionNumber: "0000320193-26-000201" }),
          filingRow({ form: "DEF  14A", filingDate: "2026-01-02", accessionNumber: "0000320193-26-000202" }),
          filingRow({ form: " 10-K", filingDate: "2026-01-03", accessionNumber: "0000320193-26-000203" }),
        ],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.deepEqual(acquirer.unmappedExactRawValues, ["DEF14A", "DEF  14A", " 10-K"]);
    assert.equal(p3For(acquirer, "RC5").length, 0);
    return { state: "all-unmapped", evidence: "registered value is DEF 14A with one space; near misses stay unknown" };
  });

  await check("P1", "P1", "published identity", "established", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(pClass(acquirer, "P1").length, 1);
    assert.equal(pClass(acquirer, "P1")[0].sourceIdentity, "Apple Inc.");
    assert.equal(pClass(acquirer, "P1")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    return { state: "established", evidence: "P1 from retrieved source name field" };
  });

  await check("BINDING-IDS", "C1", "result binds accepted identities", "bound", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    const ids = body.level1.referenceDataIdentities;
    assert.equal(ids.artifactSha256, REFDATA_SHA);
    assert.equal(ids.recordClassMappingVersion, "MD-L1-RCMAP-v1.0-CORR1");
    assert.equal(ids.rawFormValueResolutionVersion, "MD-L1-RAWFORM-v1.0-CORR1");
    assert.equal(ids.semanticTaxonomySnapshotId, "MD-L1-SEMTAX-2026-09-19-BOUNDED");
    assert.equal(ids.lifecycleMetadataInArtifactIsNotRuntimeAuthority, true);
    assert.equal(body.level1.collectionBoundId, "SLICE1-BOUND-v0.4");
    assert.equal(body.level1.evidenceCutoff, FIXED_ISO);
    return { state: "bound", evidence: "C1 identities + artifact SHA on result" };
  });

  await check("UI-UNTOUCHED", "scope", "public result UI unmodified", "byte-identical", async () => {
    assert.equal(sha256(resultScreen), sha256(gitShow("src/screens/public/PublicResearchResultScreen.jsx")));
    return { state: "byte-identical", evidence: "PublicResearchResultScreen.jsx matches HEAD" };
  });

  await check("LEGACY-FIELDS", "non-regression", "legacy metadata fields remain", "preserved", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    assert.equal(body.coverage, "RECENT_FILING_HISTORY_ONLY");
    assert.equal(body.identitySource, "SEC_SUBMISSIONS_API");
    assert.equal(company(body, "acquirer").recentFilingsLimit, 10);
    assert.equal(Array.isArray(company(body, "acquirer").recentFilings), true);
    assert.equal("additionalFilesCount" in company(body, "acquirer"), true);
    assert.equal("level1" in body, true);
    return { state: "preserved", evidence: "additive level1; legacy coverage/recentFilings retained" };
  });

  function fileNameOf(name) {
    return slice1.additionalSubmissionsFileName({ name });
  }

  await check("F1-1", "filename", "Apple continuation name accepted", "accepted", async () => {
    assert.equal(fileNameOf(extraName), extraName);
    assert.equal(slice1.ALLOWED_ADDITIONAL_FILE_NAME.test(extraName), true);
    return { state: "accepted", evidence: extraName };
  });

  await check("F1-2", "filename", "Microsoft continuation name accepted", "accepted", async () => {
    assert.equal(fileNameOf(microsoftExtraName), microsoftExtraName);
    return { state: "accepted", evidence: microsoftExtraName };
  });

  await check("F1-3", "filename", "fake -F-1.json rejected", "rejected", async () => {
    assert.equal(fileNameOf("CIK0000320193-F-1.json"), null);
    return { state: "rejected", evidence: "fixture grammar is not production grammar" };
  });

  await check("F1-4", "filename", "path traversal and near-miss rejected", "rejected", async () => {
    const rejected = [
      "../x.json",
      "CIK0000320193-submissions-001.json/evil",
      "CIK0000320193-submissions-001.json?x=1",
      "https://evil.example/x.json",
      "CIK0000320193\\submissions-001.json",
      "CIK0000320193-submissions-001.json:evil",
      "CIK320193-submissions-001.json",
      "CIK0000320193-submission-001.json",
      "CIK0000320193-submissions-.json",
      "CIK0000320193-submissions-ABC.json",
      "CIK0000320193-F-1.json",
    ];
    for (const name of rejected) {
      assert.equal(fileNameOf(name), null, name);
    }
    return { state: "rejected", evidence: `rejected ${rejected.length} unsafe or near-miss names` };
  });

  await check("F1-5", "causality", "real continuation row participates", "p2-p3-from-continuation", async () => {
    const tracked = installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [{ name: extraName, filingCount: 1 }],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "S-4", filingDate: "2005-06-01", accessionNumber: "0000320193-05-000100" }),
        ])),
      },
    })));
    const response = await postHandler(api, requestBody());
    const body = await response.json();
    assert.equal(response.status, 200);
    const acquirer = sideL1(body, "acquirer");
    assert.equal(tracked.calls.some((call) => call.url === submissionsFileUrl(extraName)), true);
    assert.equal(slice1.additionalSubmissionsUrl(research.SEC_SUBMISSIONS_ORIGIN, extraName), submissionsFileUrl(extraName));
    assert.equal(p3For(acquirer, "RC1").length, 1);
    assert.equal(p2For(acquirer, "RC1")[0].filedOrPublishedDate, "2005-06-01");
    assertAllowlistedOutbound(tracked.calls);
    return { state: "p2-p3-from-continuation", evidence: "handler POST fetched official continuation name and established RC1" };
  });

  await check("F2-1", "symmetry", "unavailable vs complete", "asymmetric-no-complete", async () => {
    installHarness(research, tableFetch({
      [submissionsUrl(APPLE_CIK)]: jsonFetchResponse(500, { error: "no" }),
      [submissionsUrl(ALPHABET_CIK)]: jsonFetchResponse(200, cleanTarget),
    }));
    const body = (await research.startPublicResearch(requestBody())).body;
    assert.equal(body.level1.pair.symmetricExecution, false);
    assert.equal(sideL1(body, "acquirer").coverage, "SOURCE_UNAVAILABLE");
    assert.equal(sideL1(body, "target").coverage, "PARTIAL");
    assert.equal(
      sideL1(body, "target").collectionDeficiencies.some((row) => row.code === "ASYMMETRIC_EXECUTION"),
      true,
    );
    assert.notEqual(sideL1(body, "target").coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(p3For(sideL1(body, "target"), "RC4").length, 1);
    return { state: "asymmetric-no-complete", evidence: "target downgraded COMPLETE→PARTIAL; RC4 P3 preserved" };
  });

  await check("F2-2", "symmetry", "aux failure vs complete", "asymmetric-both-partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: primaryPayload({
        name: "Alphabet Inc.",
        rows: cleanTargetRows(),
        files: [{ name: extraName, filingCount: 1 }],
      }),
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    assert.equal(body.level1.pair.symmetricExecution, false);
    assert.equal(sideL1(body, "acquirer").coverage, "PARTIAL");
    assert.equal(sideL1(body, "target").coverage, "PARTIAL");
    assert.equal(
      sideL1(body, "acquirer").collectionDeficiencies.some((row) => row.code === "ASYMMETRIC_EXECUTION"),
      true,
    );
    assert.equal(p3For(sideL1(body, "acquirer"), "RC3").length, 1);
    return { state: "asymmetric-both-partial", evidence: "unconsulted continuation prevents any COMPLETE survivor" };
  });

  await check("F2-3", "symmetry", "truncation vs complete", "asymmetric-both-partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
        files: [
          { name: extraName, filingCount: 1 },
          { name: extraNameTwo, filingCount: 1 },
        ],
      }),
      target: cleanTarget,
      extra: {
        [submissionsFileUrl(extraName)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "10-Q", filingDate: "2001-01-01", accessionNumber: "0000320193-01-000001" }),
        ])),
        [submissionsFileUrl(extraNameTwo)]: jsonFetchResponse(200, additionalPayload([
          filingRow({ form: "S-4", filingDate: "2002-01-01", accessionNumber: "0000320193-02-000001" }),
        ])),
      },
    })), { maxAdditionalFiles: 1 });
    const body = (await research.startPublicResearch(requestBody())).body;
    assert.equal(body.level1.pair.symmetricExecution, false);
    assert.notEqual(sideL1(body, "acquirer").coverage, "COMPLETE_WITHIN_BOUND");
    assert.notEqual(sideL1(body, "target").coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(sideL1(body, "target").coverage, "PARTIAL");
    return { state: "asymmetric-both-partial", evidence: "engineering truncation makes pair asymmetric" };
  });

  await check("F2-4", "symmetry", "both execution-complete mapped", "symmetric-complete", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    assert.equal(body.level1.pair.symmetricExecution, true);
    assert.equal(sideL1(body, "acquirer").coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(sideL1(body, "target").coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(sideL1(body, "acquirer").executionComplete, true);
    assert.equal(sideL1(body, "target").executionComplete, true);
    assert.doesNotMatch(slice1Source, /symmetricExecution:\s*true/);
    return { state: "symmetric-complete", evidence: "derived true; both COMPLETE; no hardcoded pair.symmetricExecution" };
  });

  await check("F2-5", "symmetry", "one-side UNMAPPED is not execution asymmetry", "symmetric-unknown-partial", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-03-01", accessionNumber: "0000320193-26-000099" }),
        ],
      }),
      target: cleanTarget,
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    const acquirer = sideL1(body, "acquirer");
    const target = sideL1(body, "target");
    assert.equal(body.level1.pair.symmetricExecution, true);
    assert.equal(acquirer.executionComplete, true);
    assert.equal(target.executionComplete, true);
    assert.equal(acquirer.coverage, "PARTIAL");
    assert.equal(target.coverage, "COMPLETE_WITHIN_BOUND");
    assert.equal(p3For(acquirer, "RC3")[0].gapState, "ESTABLISHED_WITHIN_BOUND");
    assert.equal(
      acquirer.collectionDeficiencies.some((row) => row.code === "ASYMMETRIC_EXECUTION"),
      false,
    );
    return { state: "symmetric-unknown-partial", evidence: "UNMAPPED degrades coverage only; execution remains symmetric" };
  });

  function assertP3Provenance(p3, p2Rows) {
    assert.ok(Array.isArray(p3.derivedFromPropositionIds) && p3.derivedFromPropositionIds.length > 0);
    assert.ok(Array.isArray(p3.evidenceBindings) && p3.evidenceBindings.length > 0);
    assert.equal(p3.derivedFromPropositionIds.length, p2Rows.length);
    assert.equal(p3.evidenceBindings.length, p2Rows.length);
    assert.deepEqual(p3.derivedFromPropositionIds, p2Rows.map((row) => row.propositionId));
    for (let index = 0; index < p2Rows.length; index += 1) {
      const binding = p3.evidenceBindings[index];
      const p2 = p2Rows[index];
      assert.equal(binding.propositionId, p2.propositionId);
      assert.equal(binding.physicalRecordKey, p2.physicalRecordKey);
      assert.equal(binding.sourceIdentity, p2.sourceIdentity);
      assert.deepEqual(binding.artifactIdentity, p2.artifactIdentity);
      assert.deepEqual(binding.exactLocator, p2.exactLocator);
      assert.equal(binding.filedOrPublishedDate, p2.filedOrPublishedDate);
      assert.equal(binding.retrievedAt, p2.retrievedAt);
      assert.equal(binding.recordClass, p3.recordClass);
      assert.equal(p2.side, p3.side);
      assert.equal(p2.recordClass, p3.recordClass);
    }
  }

  await check("F3-1", "P3-provenance", "single 10-K binding", "one-binding", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    const p3 = p3For(acquirer, "RC3")[0];
    const p2 = p2For(acquirer, "RC3");
    assert.equal(p2.length, 1);
    assertP3Provenance(p3, p2);
    return { state: "one-binding", evidence: "P3 RC3 binds the single P2 artifact/locator/date" };
  });

  await check("F3-2", "P3-provenance", "two 10-K bindings", "two-bindings", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "10-K", filingDate: "2025-02-15", accessionNumber: "0000320193-25-000001" }),
        ],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    const p3 = p3For(acquirer, "RC3")[0];
    const p2 = p2For(acquirer, "RC3");
    assert.equal(p2.length, 2);
    assert.equal(p3For(acquirer, "RC3").length, 1);
    assertP3Provenance(p3, p2);
    return { state: "two-bindings", evidence: "one RC3 P3 binds both qualifying P2s deterministically" };
  });

  await check("F3-3", "P3-provenance", "DEFM14A MULTI-RC provenance", "split-by-class", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "DEFM14A", filingDate: "2026-04-01", accessionNumber: "0000320193-26-000014" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    const p3Rc1 = p3For(acquirer, "RC1")[0];
    const p3Rc5 = p3For(acquirer, "RC5")[0];
    assertP3Provenance(p3Rc1, p2For(acquirer, "RC1"));
    assertP3Provenance(p3Rc5, p2For(acquirer, "RC5"));
    assert.equal(p3Rc1.evidenceBindings[0].physicalRecordKey, p3Rc5.evidenceBindings[0].physicalRecordKey);
    assert.notEqual(p3Rc1.derivedFromPropositionIds[0], p3Rc5.derivedFromPropositionIds[0]);
    return { state: "split-by-class", evidence: "same physical record; class-specific P2 provenance" };
  });

  await check("F3-4", "P3-provenance", "provenance survives PARTIAL unknown", "intact", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "FUTURE-UNKNOWN-XYZ", filingDate: "2026-03-01", accessionNumber: "0000320193-26-000099" }),
        ],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(acquirer.coverage, "PARTIAL");
    assertP3Provenance(p3For(acquirer, "RC3")[0], p2For(acquirer, "RC3"));
    return { state: "intact", evidence: "unknown does not strip P3 provenance" };
  });

  await check("F3-5", "P3-provenance", "no RC4 P3 when none established", "p4-only", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" })],
      }),
      target: cleanTarget,
    })));
    const acquirer = sideL1((await research.startPublicResearch(requestBody())).body, "acquirer");
    assert.equal(p3For(acquirer, "RC4").length, 0);
    assert.equal(p4For(acquirer, "RC4").length, 1);
    return { state: "p4-only", evidence: "no empty-binding P3" };
  });

  await check("F3-6", "P3-provenance", "every P3 has non-empty bindings", "non-empty", async () => {
    installHarness(research, tableFetch(pairTable({
      acquirer: primaryPayload({
        name: "Apple Inc.",
        rows: [
          filingRow({ form: "10-K", filingDate: "2026-02-15", accessionNumber: "0000320193-26-000001" }),
          filingRow({ form: "DEFM14A", filingDate: "2026-04-01", accessionNumber: "0000320193-26-000014" }),
        ],
      }),
      target: cleanTarget,
    })));
    const body = (await research.startPublicResearch(requestBody())).body;
    for (const sideName of ["acquirer", "target"]) {
      for (const p3 of pClass(sideL1(body, sideName), "P3")) {
        assert.ok(p3.derivedFromPropositionIds.length > 0);
        assert.ok(p3.evidenceBindings.length > 0);
        assert.equal("supportClass" in p3, false);
      }
    }
    return { state: "non-empty", evidence: "all emitted P3 rows have inspectable P2 bindings" };
  });

  await check("F4-1", "typescript", "nullable primary page narrowed", "narrowed", async () => {
    assert.match(slice1Source, /const primaryPage = collection\.primary;/);
    assert.doesNotMatch(slice1Source, /const pages: SourcePageInput\[\] = \[collection\.primary,/);
    assert.match(slice1Source, /const pages: SourcePageInput\[\] = \[primaryPage, \.\.\.collection\.additionalPages\];/);
    return { state: "narrowed", evidence: "pages array uses narrowed primaryPage after source-unavailable guard" };
  });

  return results;
}

const { vite, research, api, slice1 } = await loadModules();
try {
  const results = await runChecks(research, api, slice1);
  const failed = results.filter((row) => row.result !== "PASS");
  console.log(JSON.stringify({
    validator: "validate-level1-mode-d-slice1-implementation.mjs",
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  }, null, 2));
  if (failed.length) process.exit(1);
} finally {
  research.resetSecResearchForTests();
  await vite.close();
}
