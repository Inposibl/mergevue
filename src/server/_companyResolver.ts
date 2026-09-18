export const SEC_ASSOCIATION_URL = "https://www.sec.gov/files/company_tickers_exchange.json";
export const IDENTITY_SOURCE = "SEC_COMPANY_TICKERS_EXCHANGE_JSON";
export const RESOLVE_COMPANY_ENDPOINT = "/api/resolve-company";

/**
 * PROJECT CACHE TTL — NOT AN SEC REQUIREMENT.
 * SEC publishes no caching/refresh SLA for association files.
 * 24 hours is a MergeVue engineering bound to keep request volume
 * far below the official fair-access ceiling.
 */
export const ASSOCIATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const SEC_FETCH_TIMEOUT_MS = 8000;
export const MAX_PUBLIC_CANDIDATES = 5;
export const MAX_QUERY_LENGTH = 200;

export const RESOLUTION_EXACT = "EXACT";
export const RESOLUTION_NORMALIZED_EXACT = "NORMALIZED_EXACT";
export const RESOLUTION_AMBIGUOUS = "AMBIGUOUS";
export const RESOLUTION_NOT_FOUND = "NOT_FOUND";
export const RESOLUTION_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
export const RESOLUTION_CONFIRMED = "CONFIRMED";

const TRAILING_LEGAL_SUFFIXES = Object.freeze([
  "incorporated",
  "corporation",
  "company",
  "limited",
  "corp",
  "inc",
  "llc",
  "ltd",
  "plc",
  "lp",
  "llp",
  "co",
  "nv",
  "sa",
  "ag",
]);

type AssociationRow = {
  cik: string;
  canonicalName: string;
  ticker: string;
  exchange: string;
};

type EntityRecord = {
  cik: string;
  canonicalName: string;
  tickers: Array<{ ticker: string; exchange: string }>;
};

type AssociationIndex = {
  fetchedAt: number;
  entitiesByCik: Map<string, EntityRecord>;
  exactName: Map<string, string[]>;
  exactTicker: Map<string, string[]>;
  normalizedName: Map<string, string[]>;
};

type ResolverHarness = {
  fetch?: typeof fetch;
  userAgent?: string;
  nowMs?: () => number;
  timeoutMs?: number;
};

type ResolveInput = {
  query: unknown;
  confirmCik?: unknown;
};

export type ResolveCompanyBody = {
  endpoint: string;
  resolutionStatus: string;
  inputName: string;
  candidateCount: number;
  identitySource: string;
  resolvedAt: string;
  canonicalName?: string;
  cik?: string;
  ticker?: string;
  exchange?: string;
  candidates?: Array<{
    canonicalName: string;
    cik: string;
    ticker?: string;
    exchange?: string;
  }>;
  status?: string;
};

export type ResolveCompanyResult = {
  statusCode: number;
  body: ResolveCompanyBody;
  outboundRequests: Array<{ url: string; headers: Record<string, string> }>;
};

let cache: AssociationIndex | null = null;
let inflight: Promise<AssociationIndex> | null = null;
let harness: ResolverHarness | null = null;
const outboundRequests: Array<{ url: string; headers: Record<string, string> }> = [];

export function setCompanyResolverTestHarness(next: ResolverHarness | null) {
  harness = next;
}

export function resetCompanyResolverForTests() {
  cache = null;
  inflight = null;
  harness = null;
  outboundRequests.length = 0;
}

export function getCompanyResolverOutboundRequests() {
  return outboundRequests.slice();
}

export function normalizeCik(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits || digits.length > 10) return null;
  return digits.padStart(10, "0");
}

function nowMs() {
  return harness?.nowMs ? harness.nowMs() : Date.now();
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

function isoNow() {
  return new Date(nowMs()).toISOString();
}

function unavailableBody(inputName: string, status?: string): ResolveCompanyBody {
  return {
    endpoint: RESOLVE_COMPANY_ENDPOINT,
    resolutionStatus: RESOLUTION_SERVICE_UNAVAILABLE,
    inputName,
    candidateCount: 0,
    identitySource: IDENTITY_SOURCE,
    resolvedAt: isoNow(),
    ...(status ? { status } : {}),
  };
}

function malformedBody(inputName: string, status: string): ResolveCompanyBody {
  return {
    endpoint: RESOLVE_COMPANY_ENDPOINT,
    resolutionStatus: RESOLUTION_NOT_FOUND,
    inputName,
    candidateCount: 0,
    identitySource: IDENTITY_SOURCE,
    resolvedAt: isoNow(),
    status,
  };
}

export function normalizeCompanyName(value: string) {
  const unicode = value.normalize("NFC").toLocaleLowerCase("en-US");
  const withoutDelaware = unicode.replace(/\/\s*de\s*\//g, " ");
  const withoutPunctuation = withoutDelaware.replace(/[^\p{L}\p{N}]+/gu, " ");
  const tokens = withoutPunctuation.trim().split(/\s+/).filter(Boolean);
  while (tokens.length > 1 && TRAILING_LEGAL_SUFFIXES.includes(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  return tokens.join(" ");
}

function exactNameKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function exactTickerKey(value: string) {
  return value.trim().toLocaleUpperCase("en-US");
}

function pushUnique(map: Map<string, string[]>, key: string, cik: string) {
  if (!key) return;
  const existing = map.get(key);
  if (!existing) {
    map.set(key, [cik]);
    return;
  }
  if (!existing.includes(cik)) existing.push(cik);
}

function parseAssociationPayload(payload: unknown): AssociationIndex {
  if (!payload || typeof payload !== "object") {
    throw new Error("malformed-association-data");
  }
  const record = payload as { fields?: unknown; data?: unknown };
  if (!Array.isArray(record.fields) || !Array.isArray(record.data)) {
    throw new Error("malformed-association-data");
  }
  const fields = record.fields.map((field) => String(field));
  const cikIdx = fields.indexOf("cik");
  const nameIdx = fields.indexOf("name");
  const tickerIdx = fields.indexOf("ticker");
  const exchangeIdx = fields.indexOf("exchange");
  if (cikIdx < 0 || nameIdx < 0) {
    throw new Error("malformed-association-data");
  }

  const entitiesByCik = new Map<string, EntityRecord>();
  const exactName = new Map<string, string[]>();
  const exactTicker = new Map<string, string[]>();
  const normalizedName = new Map<string, string[]>();

  for (const rawRow of record.data) {
    if (!Array.isArray(rawRow)) continue;
    const cik = normalizeCik(rawRow[cikIdx]);
    const canonicalName = typeof rawRow[nameIdx] === "string" ? rawRow[nameIdx].trim() : "";
    if (!cik || !canonicalName) continue;
    const ticker = tickerIdx >= 0 && typeof rawRow[tickerIdx] === "string" ? rawRow[tickerIdx].trim() : "";
    const exchange = exchangeIdx >= 0 && typeof rawRow[exchangeIdx] === "string" ? rawRow[exchangeIdx].trim() : "";

    let entity = entitiesByCik.get(cik);
    if (!entity) {
      entity = { cik, canonicalName, tickers: [] };
      entitiesByCik.set(cik, entity);
    }
    if (ticker && !entity.tickers.some((item) => item.ticker === ticker)) {
      entity.tickers.push({ ticker, exchange });
    }
    pushUnique(exactName, exactNameKey(canonicalName), cik);
    pushUnique(exactTicker, exactTickerKey(ticker), cik);
    pushUnique(normalizedName, normalizeCompanyName(canonicalName), cik);
  }

  return {
    fetchedAt: nowMs(),
    entitiesByCik,
    exactName,
    exactTicker,
    normalizedName,
  };
}

async function loadAssociationData(): Promise<AssociationIndex> {
  const userAgent = configuredUserAgent();
  if (!userAgent) {
    throw Object.assign(new Error("missing-user-agent"), { code: "missing-user-agent" });
  }

  const controller = new AbortController();
  const timeoutMs = harness?.timeoutMs ?? SEC_FETCH_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": userAgent,
    "Accept-Encoding": "gzip, deflate",
    Accept: "application/json",
  };
  outboundRequests.push({ url: SEC_ASSOCIATION_URL, headers: { ...headers } });

  try {
    const response = await getFetch()(SEC_ASSOCIATION_URL, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    if (!response || response.status !== 200) {
      throw Object.assign(new Error("upstream-non-200"), { code: "upstream-non-200" });
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw Object.assign(new Error("malformed-association-data"), { code: "malformed-association-data" });
    }
    return parseAssociationPayload(payload);
  } catch (error) {
    const aborted = controller.signal.aborted
      || (typeof error === "object" && error !== null && "name" in error && (error as { name?: unknown }).name === "AbortError");
    if (aborted) {
      throw Object.assign(new Error("upstream-timeout"), { code: "upstream-timeout" });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAssociationIndex(): Promise<AssociationIndex> {
  const current = nowMs();
  if (cache && current - cache.fetchedAt < ASSOCIATION_CACHE_TTL_MS) {
    return cache;
  }
  if (inflight) return inflight;
  inflight = loadAssociationData()
    .then((index) => {
      cache = index;
      return index;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function uniqueCiks(groups: Array<string[] | undefined>) {
  const seen: string[] = [];
  for (const group of groups) {
    if (!group) continue;
    for (const cik of group) {
      if (!seen.includes(cik)) seen.push(cik);
    }
  }
  return seen;
}

function identityCue(entity: EntityRecord, matchedTicker?: string) {
  const tickerRow = matchedTicker
    ? entity.tickers.find((item) => exactTickerKey(item.ticker) === exactTickerKey(matchedTicker))
    : entity.tickers[0];
  return {
    canonicalName: entity.canonicalName,
    cik: entity.cik,
    ...(tickerRow?.ticker ? { ticker: tickerRow.ticker } : {}),
    ...(tickerRow?.exchange ? { exchange: tickerRow.exchange } : {}),
  };
}

function candidateList(index: AssociationIndex, ciks: string[], matchedTicker?: string) {
  return ciks.slice(0, MAX_PUBLIC_CANDIDATES).flatMap((cik) => {
    const entity = index.entitiesByCik.get(cik);
    return entity ? [identityCue(entity, matchedTicker)] : [];
  });
}

function resolvedBody(
  status: string,
  inputName: string,
  entity: EntityRecord,
  candidateCount: number,
  matchedTicker?: string,
): ResolveCompanyBody {
  const cue = identityCue(entity, matchedTicker);
  return {
    endpoint: RESOLVE_COMPANY_ENDPOINT,
    resolutionStatus: status,
    inputName,
    candidateCount,
    identitySource: IDENTITY_SOURCE,
    resolvedAt: isoNow(),
    canonicalName: cue.canonicalName,
    cik: cue.cik,
    ...(cue.ticker ? { ticker: cue.ticker } : {}),
    ...(cue.exchange ? { exchange: cue.exchange } : {}),
  };
}

function matchQuery(index: AssociationIndex, query: string) {
  const exactNameCiks = index.exactName.get(exactNameKey(query)) ?? [];
  const tickerKey = exactTickerKey(query);
  const exactTickerCiks = index.exactTicker.get(tickerKey) ?? [];
  const exactCiks = uniqueCiks([exactNameCiks, exactTickerCiks]);
  const matchedTicker = exactTickerCiks.length ? tickerKey : undefined;

  if (exactCiks.length === 1) {
    return { kind: RESOLUTION_EXACT as const, ciks: exactCiks, matchedTicker };
  }
  if (exactCiks.length > 1) {
    return { kind: RESOLUTION_AMBIGUOUS as const, ciks: exactCiks, matchedTicker };
  }

  const normalized = normalizeCompanyName(query);
  const normalizedCiks = normalized ? (index.normalizedName.get(normalized) ?? []) : [];
  if (normalizedCiks.length === 1) {
    return { kind: RESOLUTION_NORMALIZED_EXACT as const, ciks: normalizedCiks, matchedTicker: undefined };
  }
  if (normalizedCiks.length > 1) {
    return { kind: RESOLUTION_AMBIGUOUS as const, ciks: normalizedCiks, matchedTicker: undefined };
  }

  return { kind: RESOLUTION_NOT_FOUND as const, ciks: [], matchedTicker: undefined };
}

export async function resolveCompanyQuery(input: ResolveInput): Promise<ResolveCompanyResult> {
  const capturedBefore = outboundRequests.length;
  const rawQuery = typeof input.query === "string" ? input.query : null;
  if (rawQuery === null) {
    return {
      statusCode: 400,
      body: malformedBody("", "malformed-request"),
      outboundRequests: [],
    };
  }
  if (rawQuery.length > MAX_QUERY_LENGTH) {
    return {
      statusCode: 400,
      body: malformedBody(rawQuery.slice(0, MAX_QUERY_LENGTH), "malformed-request"),
      outboundRequests: [],
    };
  }
  const query = rawQuery.trim();
  if (!query) {
    return {
      statusCode: 400,
      body: malformedBody(rawQuery, "malformed-request"),
      outboundRequests: [],
    };
  }
  if (input.confirmCik !== undefined && typeof input.confirmCik !== "string") {
    return {
      statusCode: 400,
      body: malformedBody(query, "malformed-request"),
      outboundRequests: [],
    };
  }

  const userAgent = configuredUserAgent();
  if (!userAgent) {
    return {
      statusCode: 503,
      body: unavailableBody(query, "missing-user-agent"),
      outboundRequests: [],
    };
  }

  let index: AssociationIndex;
  try {
    index = await getAssociationIndex();
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
    const status = code || "service-unavailable";
    return {
      statusCode: 503,
      body: unavailableBody(query, status),
      outboundRequests: outboundRequests.slice(capturedBefore),
    };
  }

  const match = matchQuery(index, query);
  const confirmCik = input.confirmCik === undefined ? null : normalizeCik(input.confirmCik);

  if (input.confirmCik !== undefined) {
    if (!confirmCik || !match.ciks.includes(confirmCik)) {
      return {
        statusCode: 400,
        body: {
          ...malformedBody(query, "invalid-confirmation"),
          resolutionStatus: RESOLUTION_NOT_FOUND,
        },
        outboundRequests: outboundRequests.slice(capturedBefore),
      };
    }
    const entity = index.entitiesByCik.get(confirmCik);
    if (!entity) {
      return {
        statusCode: 400,
        body: {
          ...malformedBody(query, "invalid-confirmation"),
          resolutionStatus: RESOLUTION_NOT_FOUND,
        },
        outboundRequests: outboundRequests.slice(capturedBefore),
      };
    }
    return {
      statusCode: 200,
      body: resolvedBody(RESOLUTION_CONFIRMED, query, entity, 1, match.matchedTicker),
      outboundRequests: outboundRequests.slice(capturedBefore),
    };
  }

  if (match.kind === RESOLUTION_EXACT || match.kind === RESOLUTION_NORMALIZED_EXACT) {
    const entity = index.entitiesByCik.get(match.ciks[0]);
    if (!entity) {
      return {
        statusCode: 200,
        body: {
          endpoint: RESOLVE_COMPANY_ENDPOINT,
          resolutionStatus: RESOLUTION_NOT_FOUND,
          inputName: query,
          candidateCount: 0,
          identitySource: IDENTITY_SOURCE,
          resolvedAt: isoNow(),
        },
        outboundRequests: outboundRequests.slice(capturedBefore),
      };
    }
    return {
      statusCode: 200,
      body: resolvedBody(match.kind, query, entity, 1, match.matchedTicker),
      outboundRequests: outboundRequests.slice(capturedBefore),
    };
  }

  if (match.kind === RESOLUTION_AMBIGUOUS) {
    const candidates = candidateList(index, match.ciks, match.matchedTicker);
    return {
      statusCode: 200,
      body: {
        endpoint: RESOLVE_COMPANY_ENDPOINT,
        resolutionStatus: RESOLUTION_AMBIGUOUS,
        inputName: query,
        candidateCount: match.ciks.length,
        identitySource: IDENTITY_SOURCE,
        resolvedAt: isoNow(),
        candidates,
      },
      outboundRequests: outboundRequests.slice(capturedBefore),
    };
  }

  return {
    statusCode: 200,
    body: {
      endpoint: RESOLVE_COMPANY_ENDPOINT,
      resolutionStatus: RESOLUTION_NOT_FOUND,
      inputName: query,
      candidateCount: 0,
      identitySource: IDENTITY_SOURCE,
      resolvedAt: isoNow(),
    },
    outboundRequests: outboundRequests.slice(capturedBefore),
  };
}
