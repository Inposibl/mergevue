export const START_PUBLIC_RESEARCH_ENDPOINT = "/api/start-public-research";
export const SEC_SUBMISSIONS_ORIGIN = "https://data.sec.gov";
export const SEC_SUBMISSIONS_PATH_PREFIX = "/submissions/CIK";
export const SEC_SUBMISSIONS_PATH_SUFFIX = ".json";
export const IDENTITY_SOURCE = "SEC_SUBMISSIONS_API";
export const COVERAGE = "RECENT_FILING_HISTORY_ONLY";
export const RECENT_FILINGS_LIMIT = 10;

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

async function retrieveSubmissions(
  side: "acquirer" | "target",
  cik: string,
  recorder: OutboundRecorder,
): Promise<CompanyResearchSide> {
  const retrievedAt = isoNow();
  const url = secSubmissionsUrl(cik);
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
    if (!response || response.status !== 200) {
      return notRetrievableSide(side, cik, retrievedAt);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return notRetrievableSide(side, cik, retrievedAt);
    }
    return parseSubmissionsPayload(side, cik, payload, retrievedAt);
  } catch {
    return notRetrievableSide(side, cik, retrievedAt);
  } finally {
    clearTimeout(timeout);
  }
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

  const [acquirerSide, targetSide] = await Promise.all([
    retrieveSubmissions("acquirer", acquirer.cik, outboundRequests),
    retrieveSubmissions("target", target.cik, outboundRequests),
  ]);

  const pair = composePair(acquirerSide.submissionsStatus, targetSide.submissionsStatus);
  const companies = [acquirerSide, targetSide];
  if (pair.statusCode === 503) {
    return {
      statusCode: 503,
      body: unavailableBody("service-unavailable", requestedAt, companies),
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
    },
    outboundRequests,
  };
}
