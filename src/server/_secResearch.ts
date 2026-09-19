import {
  LEVEL1_RESPONSE_FIELD,
  SLICE1_BINDING_FAILED,
  additionalSubmissionsFileName,
  additionalSubmissionsUrl,
  assembleLevel1Result,
  bindAcceptedReferenceData,
  evaluateSlice1Side,
  extractExposedAdditionalFiles,
  publishedFilingCount,
  sha256Hex,
  type BindReferenceDataInput,
  type ReferenceDataIdentities,
  type SideCollectionInput,
  type SourcePageInput,
} from "./_level1ModeDSlice1.js";

export const START_PUBLIC_RESEARCH_ENDPOINT = "/api/start-public-research";
export const SEC_SUBMISSIONS_ORIGIN = "https://data.sec.gov";
export const SEC_SUBMISSIONS_PATH_PREFIX = "/submissions/CIK";
export const SEC_SUBMISSIONS_PATH_SUFFIX = ".json";
export const IDENTITY_SOURCE = "SEC_SUBMISSIONS_API";
export const COVERAGE = "RECENT_FILING_HISTORY_ONLY";
export const RECENT_FILINGS_LIMIT = 10;
export const MAX_ADDITIONAL_SUBMISSIONS_FILES = 128;

/**
 * PROJECT FETCH TIMEOUT — NOT AN SEC REQUIREMENT.
 * 8 seconds is a MergeVue engineering bound reused from UI-FROG-04A.
 */
export const SEC_FETCH_TIMEOUT_MS = 8000;

export const SUBMISSIONS_RETRIEVED = "RETRIEVED";
export const SUBMISSIONS_NO_COVERAGE = "NO_COVERAGE";
export const SUBMISSIONS_NOT_RETRIEVABLE = "NOT_RETRIEVABLE";

export const RESEARCH_AVAILABLE = "RESEARCH_AVAILABLE";
export const RESEARCH_NO_COVERAGE = "NO_COVERAGE";
export const RESEARCH_PARTIAL = "PARTIAL";
export const RESEARCH_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";

const CIK_PATTERN = /^\d{1,10}$/;
const FILING_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type ResearchHarness = {
  fetch?: typeof fetch;
  userAgent?: string;
  nowMs?: () => number;
  timeoutMs?: number;
  maxAdditionalFiles?: number;
  referenceDataBytes?: Uint8Array | null;
  referenceDataPath?: string | null;
  expectedReferenceDataSha256?: string;
  expectedReferenceDataIdentities?: ReferenceDataIdentities;
};

export type RecentFiling = {
  form: string;
  filingDate: string;
  accessionNumber: string;
};

export type CompanyResearchSide = {
  side: "acquirer" | "target";
  cik: string;
  canonicalName: string | null;
  submissionsStatus: string;
  filingCount: number | null;
  recentFilings: RecentFiling[] | null;
  recentFilingsLimit: number;
  additionalFilesCount: number | null;
  retrievedAt: string | null;
};

export type StartPublicResearchBody = {
  endpoint: string;
  researchStatus?: string;
  coverage?: string;
  identitySource?: string;
  requestedAt?: string;
  companies?: CompanyResearchSide[];
  status?: string;
  level1?: unknown;
  slice1BindingFailure?: Record<string, unknown>;
};

export type StartPublicResearchResult = {
  statusCode: number;
  body: StartPublicResearchBody;
  outboundRequests: Array<{ url: string; headers: Record<string, string> }>;
};

type OutboundRecorder = Array<{ url: string; headers: Record<string, string> }>;

let harness: ResearchHarness | null = null;
const harnessOutbound: OutboundRecorder = [];

export function setSecResearchTestHarness(next: ResearchHarness | null) {
  harness = next;
}

export function resetSecResearchForTests() {
  harness = null;
  harnessOutbound.length = 0;
}

export function getSecResearchOutboundRequests() {
  return harnessOutbound.slice();
}

export function secSubmissionsUrl(cik: string) {
  return `${SEC_SUBMISSIONS_ORIGIN}${SEC_SUBMISSIONS_PATH_PREFIX}${cik}${SEC_SUBMISSIONS_PATH_SUFFIX}`;
}

export function normalizeResearchCik(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!CIK_PATTERN.test(trimmed)) return null;
  return trimmed.padStart(10, "0");
}

function nowMs() {
  return harness?.nowMs ? harness.nowMs() : Date.now();
}

function isoNow() {
  return new Date(nowMs()).toISOString();
}

function configuredUserAgent() {
  if (harness && Object.prototype.hasOwnProperty.call(harness, "userAgent")) {
    return typeof harness.userAgent === "string" ? harness.userAgent.trim() : "";
  }
  const value = process.env.MERGEVUE_SEC_USER_AGENT;
  return typeof value === "string" ? value.trim() : "";
}

function getFetch() {
  if (harness?.fetch) return harness.fetch;
  return globalThis.fetch.bind(globalThis);
}

function recordOutbound(recorder: OutboundRecorder, entry: { url: string; headers: Record<string, string> }) {
  recorder.push(entry);
  if (harness) harnessOutbound.push(entry);
}

function maxAdditionalFiles() {
  if (typeof harness?.maxAdditionalFiles === "number") return harness.maxAdditionalFiles;
  return MAX_ADDITIONAL_SUBMISSIONS_FILES;
}

function referenceDataBindInput(): BindReferenceDataInput {
  const input: BindReferenceDataInput = {};
  if (harness && Object.prototype.hasOwnProperty.call(harness, "referenceDataBytes")) {
    input.bytes = harness.referenceDataBytes ?? undefined;
  }
  if (harness && Object.prototype.hasOwnProperty.call(harness, "referenceDataPath")) {
    input.path = harness.referenceDataPath ?? undefined;
  }
  if (harness?.expectedReferenceDataSha256) {
    input.expectedSha256 = harness.expectedReferenceDataSha256;
  }
  if (harness?.expectedReferenceDataIdentities) {
    input.expectedIdentities = harness.expectedReferenceDataIdentities;
  }
  return input;
}

async function readResponsePayload(response: { arrayBuffer?: () => Promise<ArrayBuffer>; json?: () => Promise<unknown> }) {
  if (response && typeof response.arrayBuffer === "function") {
    try {
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const payload = JSON.parse(new TextDecoder("utf-8").decode(bytes));
      return { bytes, payload, contentIdentityMethod: "SHA256_EXACT_RESPONSE_BYTES" as const };
    } catch {
      return null;
    }
  }
  if (response && typeof response.json === "function") {
    try {
      const payload = await response.json();
      return {
        bytes: null as Uint8Array | null,
        payload,
        contentIdentityMethod: "SERIALIZED_JSON_FALLBACK" as const,
      };
    } catch {
      return null;
    }
  }
  return null;
}

function artifactSha256(bytes: Uint8Array | null, payload: unknown) {
  if (bytes) return sha256Hex(bytes);
  return sha256Hex(new TextEncoder().encode(JSON.stringify(payload)));
}

async function fetchSubmissionsJson(
  url: string,
  recorder: OutboundRecorder,
): Promise<{
  httpStatus: number | null;
  retrievedAt: string;
  bytes: Uint8Array | null;
  payload: unknown;
  contentIdentityMethod: string;
  artifactSha256: string | null;
  error: string | null;
}> {
  const retrievedAt = isoNow();
  const userAgent = configuredUserAgent();
  const controller = new AbortController();
  const timeoutMs = harness?.timeoutMs ?? SEC_FETCH_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": userAgent,
    "Accept-Encoding": "gzip, deflate",
    Accept: "application/json",
  };
  recordOutbound(recorder, { url, headers: { ...headers } });

  try {
    const response = await getFetch()(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    if (!response) {
      return {
        httpStatus: null,
        retrievedAt,
        bytes: null,
        payload: null,
        contentIdentityMethod: "NONE",
        artifactSha256: null,
        error: "EMPTY_RESPONSE",
      };
    }
    if (response.status !== 200) {
      return {
        httpStatus: response.status,
        retrievedAt,
        bytes: null,
        payload: null,
        contentIdentityMethod: "NONE",
        artifactSha256: null,
        error: `HTTP_${response.status}`,
      };
    }
    const read = await readResponsePayload(response);
    if (!read) {
      return {
        httpStatus: response.status,
        retrievedAt,
        bytes: null,
        payload: null,
        contentIdentityMethod: "NONE",
        artifactSha256: null,
        error: "JSON_PARSE_FAILED",
      };
    }
    return {
      httpStatus: response.status,
      retrievedAt,
      bytes: read.bytes,
      payload: read.payload,
      contentIdentityMethod: read.contentIdentityMethod,
      artifactSha256: artifactSha256(read.bytes, read.payload),
      error: null,
    };
  } catch {
    return {
      httpStatus: null,
      retrievedAt,
      bytes: null,
      payload: null,
      contentIdentityMethod: "NONE",
      artifactSha256: null,
      error: "FETCH_FAILED",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function malformedBody(status: string): StartPublicResearchBody {
  return {
    endpoint: START_PUBLIC_RESEARCH_ENDPOINT,
    status,
  };
}

function unavailableBody(
  status: string,
  requestedAt: string,
  companies?: CompanyResearchSide[],
): StartPublicResearchBody {
  return {
    endpoint: START_PUBLIC_RESEARCH_ENDPOINT,
    researchStatus: RESEARCH_SERVICE_UNAVAILABLE,
    coverage: COVERAGE,
    identitySource: IDENTITY_SOURCE,
    requestedAt,
    status,
    ...(companies ? { companies } : {}),
  };
}

function notRetrievableSide(
  side: "acquirer" | "target",
  cik: string,
  retrievedAt: string | null,
): CompanyResearchSide {
  return {
    side,
    cik,
    canonicalName: null,
    submissionsStatus: SUBMISSIONS_NOT_RETRIEVABLE,
    filingCount: null,
    recentFilings: null,
    recentFilingsLimit: RECENT_FILINGS_LIMIT,
    additionalFilesCount: null,
    retrievedAt,
  };
}

function readSideInput(value: unknown) {
  if (value == null) return { error: "malformed-request" as const };
  if (typeof value !== "object" || Array.isArray(value)) {
    return { error: "malformed-request" as const };
  }
  if (!Object.prototype.hasOwnProperty.call(value, "cik")) {
    return { error: "malformed-request" as const };
  }
  const cik = normalizeResearchCik((value as { cik?: unknown }).cik);
  if (!cik) return { error: "malformed-request" as const };
  return { cik };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * filings.recent is structurally valid only when form, filingDate, and
 * accessionNumber are own-property arrays of equal length.
 * A missing required column is malformed, not empty coverage.
 * Unequal column lengths are malformed, not a partial zip.
 */
function requiredRecentColumns(recent: Record<string, unknown>) {
  if (
    !Object.prototype.hasOwnProperty.call(recent, "form")
    || !Object.prototype.hasOwnProperty.call(recent, "filingDate")
    || !Object.prototype.hasOwnProperty.call(recent, "accessionNumber")
  ) {
    return null;
  }
  const form = recent.form;
  const filingDate = recent.filingDate;
  const accessionNumber = recent.accessionNumber;
  if (!Array.isArray(form) || !Array.isArray(filingDate) || !Array.isArray(accessionNumber)) {
    return null;
  }
  if (form.length !== filingDate.length || form.length !== accessionNumber.length) {
    return null;
  }
  return { form, filingDate, accessionNumber };
}

function parseValidFilings(recent: Record<string, unknown>) {
  const columns = requiredRecentColumns(recent);
  if (!columns) return null;

  const valid: RecentFiling[] = [];
  for (let index = 0; index < columns.form.length; index += 1) {
    const form = columns.form[index];
    const filingDate = columns.filingDate[index];
    const accessionNumber = columns.accessionNumber[index];
    if (typeof form !== "string" || !form.trim()) continue;
    if (typeof filingDate !== "string" || !FILING_DATE_PATTERN.test(filingDate.trim())) continue;
    if (typeof accessionNumber !== "string" || !accessionNumber.trim()) continue;
    valid.push({
      form: form.trim(),
      filingDate: filingDate.trim(),
      accessionNumber: accessionNumber.trim(),
    });
  }
  return valid;
}

function parseSubmissionsPayload(
  side: "acquirer" | "target",
  cik: string,
  payload: unknown,
  retrievedAt: string,
): CompanyResearchSide {
  if (!isPlainObject(payload)) return notRetrievableSide(side, cik, retrievedAt);
  const name = payload.name;
  if (typeof name !== "string" || !name.trim()) {
    return notRetrievableSide(side, cik, retrievedAt);
  }
  if (!isPlainObject(payload.filings)) {
    return notRetrievableSide(side, cik, retrievedAt);
  }
  if (!isPlainObject(payload.filings.recent)) {
    return notRetrievableSide(side, cik, retrievedAt);
  }

  const validFilings = parseValidFilings(payload.filings.recent);
  if (validFilings === null) return notRetrievableSide(side, cik, retrievedAt);

  const files = payload.filings.files;
  const additionalFilesCount = Array.isArray(files) ? files.length : 0;
  const submissionsStatus = validFilings.length > 0
    ? SUBMISSIONS_RETRIEVED
    : SUBMISSIONS_NO_COVERAGE;

  return {
    side,
    cik,
    canonicalName: name.trim(),
    submissionsStatus,
    filingCount: validFilings.length,
    recentFilings: validFilings.slice(0, RECENT_FILINGS_LIMIT),
    recentFilingsLimit: RECENT_FILINGS_LIMIT,
    additionalFilesCount,
    retrievedAt,
  };
}

async function retrieveAdditionalPages(
  payload: unknown,
  recorder: OutboundRecorder,
): Promise<{
  additionalPages: SourcePageInput[];
  engineeringTruncation: { truncated: boolean; reason?: string };
}> {
  const files = extractExposedAdditionalFiles(payload);
  const additionalPages: SourcePageInput[] = [];
  const cap = maxAdditionalFiles();
  let truncated = false;
  let truncationReason: string | undefined;

  for (let index = 0; index < files.length; index += 1) {
    const entry = files[index];
    const fileName = additionalSubmissionsFileName(entry);
    const publishedCount = publishedFilingCount(entry);
    if (!fileName) {
      additionalPages.push({
        pageId: `additional:${index}`,
        url: "",
        retrievedAt: isoNow(),
        consultStatus: "UNCONSULTED",
        unconsultedReason: "INVALID_ADDITIONAL_FILE_NAME",
        httpStatus: null,
        artifactSha256: null,
        publishedFilingCount: publishedCount,
      });
      continue;
    }
    if (additionalPages.filter((page) => page.consultStatus === "CONSULTED").length >= cap) {
      truncated = true;
      truncationReason = "MAX_ADDITIONAL_FILES";
      additionalPages.push({
        pageId: `additional:${index}:${fileName}`,
        url: additionalSubmissionsUrl(SEC_SUBMISSIONS_ORIGIN, fileName),
        retrievedAt: isoNow(),
        consultStatus: "UNCONSULTED",
        unconsultedReason: "ENGINEERING_GUARD_TRUNCATION",
        httpStatus: null,
        artifactSha256: null,
        publishedFilingCount: publishedCount,
      });
      continue;
    }
    const url = additionalSubmissionsUrl(SEC_SUBMISSIONS_ORIGIN, fileName);
    const fetched = await fetchSubmissionsJson(url, recorder);
    if (fetched.error) {
      additionalPages.push({
        pageId: `additional:${index}:${fileName}`,
        url,
        retrievedAt: fetched.retrievedAt,
        consultStatus: "UNCONSULTED",
        unconsultedReason: fetched.error,
        httpStatus: fetched.httpStatus,
        artifactSha256: null,
        publishedFilingCount: publishedCount,
      });
      continue;
    }
    additionalPages.push({
      pageId: `additional:${index}:${fileName}`,
      url,
      retrievedAt: fetched.retrievedAt,
      consultStatus: "CONSULTED",
      httpStatus: fetched.httpStatus,
      artifactSha256: fetched.artifactSha256,
      contentIdentityMethod: fetched.contentIdentityMethod,
      payload: fetched.payload,
      publishedFilingCount: publishedCount,
    });
  }

  return {
    additionalPages,
    engineeringTruncation: truncated
      ? { truncated: true, reason: truncationReason }
      : { truncated: false },
  };
}

async function retrieveSubmissions(
  side: "acquirer" | "target",
  cik: string,
  recorder: OutboundRecorder,
): Promise<{ displaySide: CompanyResearchSide; collection: SideCollectionInput }> {
  const url = secSubmissionsUrl(cik);
  const fetched = await fetchSubmissionsJson(url, recorder);
  if (fetched.error || fetched.payload == null) {
    return {
      displaySide: notRetrievableSide(side, cik, fetched.retrievedAt),
      collection: {
        side,
        cik,
        primaryRetrieved: false,
        primary: {
          pageId: "primary",
          url,
          retrievedAt: fetched.retrievedAt,
          consultStatus: "UNCONSULTED",
          unconsultedReason: fetched.error ?? "PRIMARY_NOT_RETRIEVED",
          httpStatus: fetched.httpStatus,
          artifactSha256: null,
        },
        additionalPages: [],
      },
    };
  }

  const displaySide = parseSubmissionsPayload(side, cik, fetched.payload, fetched.retrievedAt);
  const extra = await retrieveAdditionalPages(fetched.payload, recorder);
  return {
    displaySide,
    collection: {
      side,
      cik,
      primaryRetrieved: true,
      primary: {
        pageId: "primary",
        url,
        retrievedAt: fetched.retrievedAt,
        consultStatus: "CONSULTED",
        httpStatus: fetched.httpStatus,
        artifactSha256: fetched.artifactSha256,
        contentIdentityMethod: fetched.contentIdentityMethod,
        payload: fetched.payload,
      },
      additionalPages: extra.additionalPages,
      engineeringTruncation: extra.engineeringTruncation,
    },
  };
}

function composePair(acquirerStatus: string, targetStatus: string) {
  if (acquirerStatus === SUBMISSIONS_RETRIEVED && targetStatus === SUBMISSIONS_RETRIEVED) {
    return { researchStatus: RESEARCH_AVAILABLE, statusCode: 200 };
  }
  if (acquirerStatus === SUBMISSIONS_NO_COVERAGE && targetStatus === SUBMISSIONS_NO_COVERAGE) {
    return { researchStatus: RESEARCH_NO_COVERAGE, statusCode: 200 };
  }
  if (acquirerStatus === SUBMISSIONS_NOT_RETRIEVABLE && targetStatus === SUBMISSIONS_NOT_RETRIEVABLE) {
    return { researchStatus: RESEARCH_SERVICE_UNAVAILABLE, statusCode: 503 };
  }
  return { researchStatus: RESEARCH_PARTIAL, statusCode: 200 };
}

export async function startPublicResearch(body: unknown): Promise<StartPublicResearchResult> {
  const outboundRequests: OutboundRecorder = [];

  if (!isPlainObject(body)) {
    return {
      statusCode: 400,
      body: malformedBody("malformed-request"),
      outboundRequests,
    };
  }

  const acquirer = readSideInput(body.acquirer);
  if ("error" in acquirer) {
    return {
      statusCode: 400,
      body: malformedBody(acquirer.error),
      outboundRequests,
    };
  }
  const target = readSideInput(body.target);
  if ("error" in target) {
    return {
      statusCode: 400,
      body: malformedBody(target.error),
      outboundRequests,
    };
  }
  if (acquirer.cik === target.cik) {
    return {
      statusCode: 400,
      body: malformedBody("same-cik-pair"),
      outboundRequests,
    };
  }

  const requestedAt = isoNow();
  const userAgent = configuredUserAgent();
  if (!userAgent) {
    return {
      statusCode: 503,
      body: unavailableBody("missing-user-agent", requestedAt),
      outboundRequests,
    };
  }

  const binding = bindAcceptedReferenceData(referenceDataBindInput());
  if (!binding.ok) {
    return {
      statusCode: 503,
      body: {
        endpoint: START_PUBLIC_RESEARCH_ENDPOINT,
        researchStatus: RESEARCH_SERVICE_UNAVAILABLE,
        coverage: COVERAGE,
        identitySource: IDENTITY_SOURCE,
        requestedAt,
        status: SLICE1_BINDING_FAILED,
        slice1BindingFailure: {
          reason: binding.reason,
          ...binding.details,
        },
      },
      outboundRequests,
    };
  }

  const [acquirerRetrieved, targetRetrieved] = await Promise.all([
    retrieveSubmissions("acquirer", acquirer.cik, outboundRequests),
    retrieveSubmissions("target", target.cik, outboundRequests),
  ]);

  const acquirerSide = acquirerRetrieved.displaySide;
  const targetSide = targetRetrieved.displaySide;
  const evidenceCutoff = isoNow();
  const level1 = assembleLevel1Result(
    evaluateSlice1Side(acquirerRetrieved.collection, binding, evidenceCutoff),
    evaluateSlice1Side(targetRetrieved.collection, binding, evidenceCutoff),
    binding,
    evidenceCutoff,
    requestedAt,
  );

  const pair = composePair(acquirerSide.submissionsStatus, targetSide.submissionsStatus);
  const companies = [acquirerSide, targetSide];
  if (pair.statusCode === 503) {
    return {
      statusCode: 503,
      body: {
        ...unavailableBody("service-unavailable", requestedAt, companies),
        [LEVEL1_RESPONSE_FIELD]: level1,
      },
      outboundRequests,
    };
  }

  return {
    statusCode: 200,
    body: {
      endpoint: START_PUBLIC_RESEARCH_ENDPOINT,
      researchStatus: pair.researchStatus,
      coverage: COVERAGE,
      identitySource: IDENTITY_SOURCE,
      requestedAt,
      companies,
      [LEVEL1_RESPONSE_FIELD]: level1,
    },
    outboundRequests,
  };
}
