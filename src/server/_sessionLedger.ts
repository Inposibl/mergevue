import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { canonicalSerialize, CanonicalSerializeError, sha256Hex } from "../agent/canonicalDigest.js";
import {
  buildTargetObservationSetupRecord,
  canStartTargetObservation,
  hashObservationSetupCode,
  scoreTargetObservation,
} from "../flow/targetObservationFlow.js";
import { hasOversizedTargetObservationSetupRawValue } from "../flow/targetObservationSetupProvenance.js";
import {
  scoreTargetDiagnosticCombined,
  scoreTargetDiagnosticLevel1,
  scoreTargetDiagnosticQuestions,
} from "../flow/targetDiagnosticFlow.js";
import { validateEvidenceClassifiedAnswers } from "../flow/evidenceClassification.js";
import { TARGET_DIAGNOSTIC_DATA } from "../data/targetDiagnosticData.js";

const TARGET_INVITE_TTL_HOURS = 72;
export const TARGET_CODE_MAX_FAILED_ATTEMPTS = 5;
export const TARGET_CODE_LOCKOUT_MS = 15 * 60 * 1000;
const TARGET_OBSERVATION_SESSION_TTL_SECONDS = 259200;
const REDIS_REST_TIMEOUT_MS = 4000;

type TargetObservationSetupBaseRecord = ReturnType<typeof buildTargetObservationSetupRecord>;
type TargetObservationSetupMetadataProvenance = TargetObservationSetupBaseRecord["setupMetadataProvenance"];
type TargetObservationSetupRecord = TargetObservationSetupBaseRecord & {
  rejectedSetupMetadataProvenance?: TargetObservationSetupMetadataProvenance;
};

export type MutationCapabilityRole = "OWNER" | "R2" | "TARGET";
export type MutationCapabilityLifecycle = "unused" | "consumed" | "expired" | "revoked";
export type AuthorizedSaveAction = "SAVE_DEAL_CONTEXT" | "SAVE_R1" | "SAVE_R2" | "SAVE_REPORT_INPUT";

export type MutationCapabilityRecord = {
  role: MutationCapabilityRole;
  verifier: string;
  respondentId: string | null;
  lifecycle: MutationCapabilityLifecycle;
  expiresAt: string;
  consumedAt: string | null;
  acceptedPayloadDigestByAction: Record<string, string>;
};

export type MintedMutationSecrets = {
  owner: string;
  r2: string;
  r2RespondentId: string;
  target: string;
  targetRespondentId: string;
};

type SessionRecord = {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  storageRevision: number;
  projectId: string | null;
  inputRevision: number;
  rawAssessment: RawAssessmentState | null;
  interpretationAuthority: AssessmentAuthorityRecord | null;
  reportAuthority: AssessmentReportAuthority | null;
  targetObservationSetup: TargetObservationSetupRecord | null;
  targetObservation: unknown | null;
  target2B: unknown | null;
  targetInvite?: TargetInviteRecord | null;
  mutationCapabilities: MutationCapabilityRecord[];
};

const MUTATION_CAPABILITY_TOKEN_PATTERN = /^mvc_[0-9a-f]{64}$/;
const OWNER_SAVE_ACTIONS = new Set<AuthorizedSaveAction>(["SAVE_DEAL_CONTEXT", "SAVE_R1"]);
const ROLE_SAVE_ACTIONS: Record<MutationCapabilityRole, Set<AuthorizedSaveAction>> = {
  OWNER: OWNER_SAVE_ACTIONS,
  R2: new Set(["SAVE_R2"]),
  TARGET: new Set(["SAVE_REPORT_INPUT"]),
};

const localSessionWriteChains = new Map<string, Promise<unknown>>();

export type RawAssessmentState = {
  dealContext: Record<string, unknown> | null;
  r1: { answers: Record<string, unknown> } | null;
  r2: {
    completed: boolean;
    answers: Record<string, unknown>;
    respondentContext: Record<string, unknown> | null;
    respondentId: string | null;
  } | null;
  targetSelf: {
    completed: boolean;
    answers: Record<string, unknown>;
    positioning: Record<string, unknown>;
    respondentId: string | null;
  } | null;
};

export type AssessmentAuthorityRecord = {
  authorityId: string;
  sessionId: string;
  inputRevision: number;
  terminalKind: "agent-result" | "system-failure" | "production-interpretation-blocked";
  outcomeSource: string | null;
  engineSnapshotDigest: string | null;
  result: unknown | null;
  failure: unknown | null;
  reportReady: boolean;
  createdAt: string;
};

export type AssessmentReportAuthority = {
  authorityId: string;
  sessionId: string;
  inputRevision: number;
  reportReady: true;
  projection: unknown;
  createdAt: string;
};

type LedgerGlobal = typeof globalThis & {
  __stPublicSessionLedger?: Map<string, SessionRecord>;
};

export class SessionLedgerStorageError extends Error {
  status: string;

  constructor(status: string, message: string) {
    super(message);
    this.name = "SessionLedgerStorageError";
    this.status = status;
  }
}

export function isSessionLedgerStorageError(error: unknown): error is SessionLedgerStorageError {
  return error instanceof SessionLedgerStorageError;
}

type TargetInviteRecord = {
  targetSessionId: string;
  assessmentSessionId: string;
  preliminaryAssessmentId: string;
  reportBinding: unknown;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  completed: boolean;
  revoked: boolean;
  completedAt?: string;
  revokedAt?: string;
  revokedReason?: string;
  targetSelfAssessment?: unknown;
  failedVerifyAttempts?: number;
  lockedUntil?: string | null;
};

function ledger() {
  const root = globalThis as LedgerGlobal;
  if (!root.__stPublicSessionLedger) {
    root.__stPublicSessionLedger = new Map<string, SessionRecord>();
  }
  return root.__stPublicSessionLedger;
}

function cleanEnv(value: unknown) {
  return String(value ?? "").trim();
}

function isLocalDevelopmentRuntime() {
  return process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production";
}

function storageConfig() {
  const url = cleanEnv(process.env.KV_REST_API_URL) || cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = cleanEnv(process.env.KV_REST_API_TOKEN) || cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (url && token) {
    return {
      url: url.replace(/\/$/, ""),
      token,
    };
  }

  if (isLocalDevelopmentRuntime()) return null;

  throw new SessionLedgerStorageError(
    "persistent-storage-not-configured",
    "Target Observation persistent storage is not configured.",
  );
}

function emptySessionRecord(sessionId: string, now = new Date().toISOString()): SessionRecord {
  return {
    sessionId,
    createdAt: now,
    updatedAt: now,
    storageRevision: 0,
    projectId: null,
    inputRevision: 0,
    rawAssessment: null,
    interpretationAuthority: null,
    reportAuthority: null,
    targetObservationSetup: null,
    targetObservation: null,
    target2B: null,
    targetInvite: null,
    mutationCapabilities: [],
  };
}

export function isMutationCapabilityToken(value: unknown): value is string {
  return typeof value === "string" && MUTATION_CAPABILITY_TOKEN_PATTERN.test(value);
}

function issueMutationCapabilityToken() {
  return `mvc_${randomBytes(32).toString("hex")}`;
}

function hashMutationCapability(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function capabilityExpiryIso(nowIso: string) {
  return new Date(new Date(nowIso).getTime() + TARGET_INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();
}

function storedMutationCapability(
  role: MutationCapabilityRole,
  verifier: string,
  respondentId: string | null,
  expiresAt: string,
): MutationCapabilityRecord {
  return {
    role,
    verifier,
    respondentId,
    lifecycle: "unused",
    expiresAt,
    consumedAt: null,
    acceptedPayloadDigestByAction: {},
  };
}

function cloneCapability(capability: MutationCapabilityRecord): MutationCapabilityRecord {
  return {
    ...capability,
    acceptedPayloadDigestByAction: { ...capability.acceptedPayloadDigestByAction },
  };
}

function normalizeMutationCapabilities(value: unknown): MutationCapabilityRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Partial<MutationCapabilityRecord>;
    if (record.role !== "OWNER" && record.role !== "R2" && record.role !== "TARGET") return [];
    if (typeof record.verifier !== "string" || !/^[0-9a-f]{64}$/i.test(record.verifier)) return [];
    const accepted = record.acceptedPayloadDigestByAction && typeof record.acceptedPayloadDigestByAction === "object"
      ? Object.fromEntries(
        Object.entries(record.acceptedPayloadDigestByAction).filter((item): item is [string, string] => typeof item[1] === "string"),
      )
      : {};
    const lifecycle = record.lifecycle === "consumed" || record.lifecycle === "expired" || record.lifecycle === "revoked"
      ? record.lifecycle
      : "unused";
    return [{
      role: record.role,
      verifier: record.verifier.toLowerCase(),
      respondentId: typeof record.respondentId === "string" ? record.respondentId : null,
      lifecycle,
      expiresAt: typeof record.expiresAt === "string" ? record.expiresAt : new Date(0).toISOString(),
      consumedAt: typeof record.consumedAt === "string" ? record.consumedAt : null,
      acceptedPayloadDigestByAction: accepted,
    }];
  });
}

function mintMutationCapabilitySet(nowIso: string): { stored: MutationCapabilityRecord[]; secrets: MintedMutationSecrets } {
  const expiresAt = capabilityExpiryIso(nowIso);
  const owner = issueMutationCapabilityToken();
  const r2 = issueMutationCapabilityToken();
  const target = issueMutationCapabilityToken();
  const r2RespondentId = `acqv-${randomUUID()}`;
  const targetRespondentId = `tgt-${randomUUID()}`;
  return {
    stored: [
      storedMutationCapability("OWNER", hashMutationCapability(owner), null, expiresAt),
      storedMutationCapability("R2", hashMutationCapability(r2), r2RespondentId, expiresAt),
      storedMutationCapability("TARGET", hashMutationCapability(target), targetRespondentId, expiresAt),
    ],
    secrets: { owner, r2, r2RespondentId, target, targetRespondentId },
  };
}

function verifiersMatch(storedVerifier: string, presentedVerifier: string) {
  if (storedVerifier.length !== presentedVerifier.length) return false;
  return timingSafeEqual(Buffer.from(storedVerifier), Buffer.from(presentedVerifier));
}

function findCapabilityIndex(capabilities: MutationCapabilityRecord[], token: string) {
  if (!isMutationCapabilityToken(token)) return -1;
  const presented = hashMutationCapability(token);
  let matched = -1;
  for (let index = 0; index < capabilities.length; index += 1) {
    if (verifiersMatch(capabilities[index].verifier, presented)) matched = index;
  }
  return matched;
}

function emptyRawAssessmentState(): RawAssessmentState {
  return { dealContext: null, r1: null, r2: null, targetSelf: null };
}

function roleAllowsAction(role: MutationCapabilityRole, action: AuthorizedSaveAction) {
  return ROLE_SAVE_ACTIONS[role].has(action);
}

function capabilityIsExpired(capability: MutationCapabilityRecord, nowIso: string) {
  if (capability.lifecycle === "expired") return true;
  return Date.parse(nowIso) > Date.parse(capability.expiresAt);
}

type AuthorizedMutationApplication =
  | { status: "saved" | "idempotent"; session: SessionRecord }
  | { status: "idempotent-upgrade"; session: SessionRecord }
  | { status: "forbidden" }
  | { status: "gone" }
  | { status: "sequencing"; reason: string };

// Semantic mutation digest versioning.
// CURRENT format is "v2:<sha256 hex of canonicalSerialize>"; any bare
// 64-hex sha256 value is a pre-CORR3 LEGACY order-sensitive digest.
// Anything else is an unknown version and fails closed.
const CURRENT_SEMANTIC_DIGEST_PREFIX = "v2:";
const LEGACY_SEMANTIC_DIGEST_PATTERN = /^[a-f0-9]{64}$/i;
const CURRENT_SEMANTIC_DIGEST_PATTERN = /^v2:[a-f0-9]{64}$/i;

// JSON numeric -0 and 0 share one semantic value, matching the prior
// JSON.stringify transport semantics. Every other value is passed through
// untouched so canonicalSerialize keeps rejecting NaN, Infinity, BigInt,
// Date, Map, Set, functions, symbols, class instances, sparse arrays and
// circular graphs. Caller values are never mutated; object graphs (including
// cycles) are preserved so downstream fail-closed detection still applies.
function normalizeNegativeZeroJson(value: unknown, seen = new WeakMap()): unknown {
  if (typeof value === "number" && Object.is(value, -0)) return 0;
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  if (Array.isArray(value)) {
    const copy: unknown[] = [];
    seen.set(value, copy);
    for (let index = 0; index < value.length; index += 1) {
      copy.push(normalizeNegativeZeroJson(value[index], seen));
    }
    return copy;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;
  // Symbol-keyed properties are non-JSON and must stay detectable: copying
  // with Object.keys() would silently erase them and make a symbol payload
  // semantically equal to the same object without the symbol. Fail closed
  // before copying, exactly like the shared canonical serializer does.
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new CanonicalSerializeError("symbol key");
  }
  const copy: Record<string, unknown> = {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    copy[key] = normalizeNegativeZeroJson((value as Record<string, unknown>)[key], seen);
  }
  return copy;
}

export function currentSemanticMutationDigest(action: string, payload: unknown) {
  const canonical = canonicalSerialize(normalizeNegativeZeroJson({ action, payload }));
  return `${CURRENT_SEMANTIC_DIGEST_PREFIX}${sha256Hex(canonical)}`;
}

type StoredSemanticDigestKind = "legacy" | "current" | "unknown";

function classifyStoredSemanticDigest(digest: string): StoredSemanticDigestKind {
  if (CURRENT_SEMANTIC_DIGEST_PATTERN.test(digest)) return "current";
  if (LEGACY_SEMANTIC_DIGEST_PATTERN.test(digest)) return "legacy";
  return "unknown";
}

// Derives the previously accepted semantic digest payload for one action from
// the authoritative server-held rawAssessment state. The reconstructed shape
// is exactly the digest payload the API hashes for that action; server-bound
// respondent identity is never part of the digest domain.
function acceptedSemanticDigestPayload(
  action: AuthorizedSaveAction,
  rawAssessment: RawAssessmentState | null,
): unknown | null {
  if (!rawAssessment) return null;
  if (action === "SAVE_DEAL_CONTEXT") return rawAssessment.dealContext;
  if (action === "SAVE_R1") return rawAssessment.r1 ? { answers: rawAssessment.r1.answers } : null;
  if (action === "SAVE_R2") {
    return rawAssessment.r2
      ? { answers: rawAssessment.r2.answers, respondentContext: rawAssessment.r2.respondentContext, completed: true }
      : null;
  }
  return rawAssessment.targetSelf
    ? { answers: rawAssessment.targetSelf.answers, positioning: rawAssessment.targetSelf.positioning, completed: true }
    : null;
}

function applyAuthorizedRawMutation(
  session: SessionRecord,
  input: {
    action: AuthorizedSaveAction;
    mutationCapability: string;
    payloadDigest: string;
    patch: Record<string, unknown>;
    presentedRespondentId?: string | null;
    nowIso: string;
  },
): AuthorizedMutationApplication {
  const capabilities = (session.mutationCapabilities ?? []).map(cloneCapability);
  const index = findCapabilityIndex(capabilities, input.mutationCapability);
  if (index < 0) return { status: "forbidden" };
  const capability = capabilities[index];
  if (!roleAllowsAction(capability.role, input.action)) return { status: "forbidden" };
  if (
    (input.action === "SAVE_R2" || input.action === "SAVE_REPORT_INPUT")
    && typeof input.presentedRespondentId === "string"
    && input.presentedRespondentId.length > 0
    && input.presentedRespondentId !== capability.respondentId
  ) {
    return { status: "forbidden" };
  }
  if (capability.lifecycle === "revoked" || capabilityIsExpired(capability, input.nowIso)) {
    return { status: "gone" };
  }

  const acceptedDigest = capability.acceptedPayloadDigestByAction[input.action];
  if (acceptedDigest) {
    const storedKind = classifyStoredSemanticDigest(acceptedDigest);
    if (storedKind === "unknown") {
      throw new SessionLedgerStorageError(
        "unknown-digest-version",
        "Stored semantic mutation digest uses a digest version current code cannot interpret.",
      );
    }
    if (storedKind === "current") {
      if (acceptedDigest === input.payloadDigest) return { status: "idempotent", session };
    } else {
      const acceptedPayload = acceptedSemanticDigestPayload(input.action, session.rawAssessment);
      if (acceptedPayload === null) {
        throw new SessionLedgerStorageError(
          "legacy-digest-state-missing",
          "Legacy semantic mutation digest has no authoritative accepted state to reconstruct.",
        );
      }
      const currentAcceptedDigest = currentSemanticMutationDigest(input.action, acceptedPayload);
      if (currentAcceptedDigest === input.payloadDigest) {
        capability.acceptedPayloadDigestByAction[input.action] = currentAcceptedDigest;
        capabilities[index] = capability;
        return {
          status: "idempotent-upgrade",
          session: {
            ...session,
            mutationCapabilities: capabilities,
            storageRevision: session.storageRevision + 1,
          },
        };
      }
    }
    if (capability.role !== "OWNER") return { status: "gone" };
  }
  if (capability.lifecycle === "consumed" && capability.role !== "OWNER") return { status: "gone" };

  const raw = session.rawAssessment ?? emptyRawAssessmentState();
  if (input.action === "SAVE_R2" && !raw.r1?.answers) {
    return { status: "sequencing", reason: "r2-before-r1" };
  }

  const nextRaw: RawAssessmentState = { ...raw };
  if (input.action === "SAVE_DEAL_CONTEXT") {
    nextRaw.dealContext = input.patch as Record<string, unknown>;
  } else if (input.action === "SAVE_R1") {
    nextRaw.r1 = { answers: input.patch.answers as Record<string, unknown> };
  } else if (input.action === "SAVE_R2") {
    nextRaw.r2 = {
      completed: true,
      answers: input.patch.answers as Record<string, unknown>,
      respondentContext: (input.patch.respondentContext as Record<string, unknown> | null) ?? null,
      respondentId: capability.respondentId,
    };
  } else {
    nextRaw.targetSelf = {
      completed: true,
      answers: input.patch.answers as Record<string, unknown>,
      positioning: input.patch.positioning as Record<string, unknown>,
      respondentId: capability.respondentId,
    };
  }

  capability.acceptedPayloadDigestByAction[input.action] = input.payloadDigest;
  if (capability.role === "OWNER") {
    capability.lifecycle = "unused";
    capability.consumedAt = null;
  } else {
    capability.lifecycle = "consumed";
    capability.consumedAt = input.nowIso;
  }
  capabilities[index] = capability;

  return {
    status: "saved",
    session: {
      ...nextMeaningfulRevision({ ...session, rawAssessment: nextRaw }, input.nowIso),
      mutationCapabilities: capabilities,
    },
  };
}

async function withLocalSessionWriteChain<T>(sessionId: string, work: () => Promise<T>): Promise<T> {
  const previous = localSessionWriteChains.get(sessionId) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = previous.catch(() => undefined).then(() => gate);
  localSessionWriteChains.set(sessionId, chained);
  await previous.catch(() => undefined);
  try {
    return await work();
  } finally {
    release();
    if (localSessionWriteChains.get(sessionId) === chained) localSessionWriteChains.delete(sessionId);
  }
}

async function compareAndSwapSession(
  sessionId: string,
  expectedRevision: number,
  expectedUpdatedAt: string,
  expectedStorageRevision: number,
  next: SessionRecord,
): Promise<SessionRecord | "CAS_FAIL" | null> {
  const config = storageConfig();
  if (!config) {
    const current = existingLocalSession(sessionId);
    if (!current) return null;
    if (
      current.inputRevision !== expectedRevision
      || current.updatedAt !== expectedUpdatedAt
      || current.storageRevision !== expectedStorageRevision
    ) return "CAS_FAIL";
    return writeLedgerSession(sessionId, next);
  }

  const raw = await redisCommand([
    "EVAL",
    "local v=redis.call('GET',KEYS[1]); if not v then return nil end; local r=cjson.decode(v); if tonumber(r.inputRevision)~=tonumber(ARGV[1]) or tostring(r.updatedAt)~=ARGV[2] or tonumber(r.storageRevision or 0)~=tonumber(ARGV[3]) then return 'CAS_FAIL' end; redis.call('SET',KEYS[1],ARGV[4],'EX',ARGV[5]); return ARGV[4]",
    "1",
    targetObservationSessionKey(sessionId),
    String(expectedRevision),
    expectedUpdatedAt,
    String(expectedStorageRevision),
    JSON.stringify(next),
    String(TARGET_OBSERVATION_SESSION_TTL_SECONDS),
  ], "persistent-storage-write-failed");
  if (raw === null || raw === undefined) return null;
  if (raw === "CAS_FAIL") return "CAS_FAIL";
  const stored = normalizeSessionRecord(sessionId, typeof raw === "string" ? JSON.parse(raw) : raw);
  ledger().set(sessionId, stored);
  return stored;
}

function targetObservationSessionKey(sessionId: string) {
  return `target-observation-session:${sessionId}`;
}

function normalizeSessionRecord(sessionId: string, value: unknown): SessionRecord {
  const now = new Date().toISOString();
  const record = typeof value === "object" && value ? value as Partial<SessionRecord> : {};
  return {
    sessionId,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : now,
    storageRevision: Number.isInteger(record.storageRevision) && Number(record.storageRevision) >= 0
      ? Number(record.storageRevision)
      : 0,
    projectId: typeof record.projectId === "string" ? record.projectId : null,
    inputRevision: Number.isInteger(record.inputRevision) && Number(record.inputRevision) >= 0
      ? Number(record.inputRevision)
      : 0,
    rawAssessment: record.rawAssessment && typeof record.rawAssessment === "object"
      ? record.rawAssessment as RawAssessmentState
      : null,
    interpretationAuthority: record.interpretationAuthority && typeof record.interpretationAuthority === "object"
      ? record.interpretationAuthority as AssessmentAuthorityRecord
      : null,
    reportAuthority: record.reportAuthority && typeof record.reportAuthority === "object"
      ? record.reportAuthority as AssessmentReportAuthority
      : null,
    targetObservationSetup: record.targetObservationSetup ?? null,
    targetObservation: record.targetObservation ?? null,
    target2B: record.target2B ?? null,
    targetInvite: record.targetInvite ?? null,
    mutationCapabilities: normalizeMutationCapabilities(record.mutationCapabilities),
  };
}

async function redisCommand(command: unknown[], failureStatus: string) {
  const config = storageConfig();
  if (!config) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIS_REST_TIMEOUT_MS);
  let response: Response;
  let payload: { error?: string; result?: unknown } | null;
  try {
    response = await fetch(config.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(command),
      signal: controller.signal,
    });
    payload = await response.json().catch((error) => {
      if (controller.signal.aborted) throw error;
      return null;
    });
  } catch (error) {
    const aborted = controller.signal.aborted || typeof error === "object"
      && error !== null
      && "name" in error
      && (error as { name?: unknown }).name === "AbortError";
    throw new SessionLedgerStorageError(
      failureStatus,
      aborted
        ? `Target Observation persistent storage request timed out after ${REDIS_REST_TIMEOUT_MS} ms.`
        : error instanceof Error ? error.message : "Target Observation persistent storage request failed.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok || payload?.error) {
    throw new SessionLedgerStorageError(
      failureStatus,
      payload?.error ?? `Target Observation persistent storage returned status ${response.status}.`,
    );
  }

  return payload?.result ?? null;
}

async function readLedgerSession(sessionId: string) {
  const config = storageConfig();
  if (!config) return getSession(sessionId);

  const raw = await redisCommand(["GET", targetObservationSessionKey(sessionId)], "persistent-storage-read-failed");
  if (raw === null || raw === undefined) {
    return emptySessionRecord(sessionId);
  }

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const session = normalizeSessionRecord(sessionId, parsed);
    ledger().set(sessionId, session);
    return session;
  } catch {
    throw new SessionLedgerStorageError(
      "persistent-storage-invalid-record",
      "Target Observation persistent storage returned an invalid session record.",
    );
  }
}

async function writeLedgerSession(sessionId: string, session: SessionRecord) {
  const config = storageConfig();
  ledger().set(sessionId, session);
  if (!config) return session;

  await redisCommand(
    ["SET", targetObservationSessionKey(sessionId), JSON.stringify(session), "EX", String(TARGET_OBSERVATION_SESSION_TTL_SECONDS)],
    "persistent-storage-write-failed",
  );
  return session;
}

function existingLocalSession(sessionId: string) {
  return ledger().get(sessionId) ?? null;
}

async function readExistingLedgerSession(sessionId: string): Promise<SessionRecord | null> {
  const config = storageConfig();
  if (!config) return existingLocalSession(sessionId);

  const raw = await redisCommand(["GET", targetObservationSessionKey(sessionId)], "persistent-storage-read-failed");
  if (raw === null || raw === undefined) return null;
  try {
    const session = normalizeSessionRecord(sessionId, typeof raw === "string" ? JSON.parse(raw) : raw);
    ledger().set(sessionId, session);
    return session;
  } catch {
    throw new SessionLedgerStorageError(
      "persistent-storage-invalid-record",
      "Assessment persistent storage returned an invalid session record.",
    );
  }
}

export async function createAssessmentSession(projectId: string | null = null): Promise<SessionRecord & { mintedMutationSecrets: MintedMutationSecrets }> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const sessionId = `asmt-${randomUUID()}`;
    const now = new Date().toISOString();
    const minted = mintMutationCapabilitySet(now);
    const record: SessionRecord = {
      ...emptySessionRecord(sessionId, now),
      projectId,
      mutationCapabilities: minted.stored,
    };
    const config = storageConfig();
    if (!config) {
      ledger().set(sessionId, record);
      return { ...record, mintedMutationSecrets: minted.secrets };
    }
    const created = await redisCommand(
      ["SET", targetObservationSessionKey(sessionId), JSON.stringify(record), "NX", "EX", String(TARGET_OBSERVATION_SESSION_TTL_SECONDS)],
      "persistent-storage-write-failed",
    );
    if (created === "OK") {
      ledger().set(sessionId, record);
      return { ...record, mintedMutationSecrets: minted.secrets };
    }
  }
  throw new SessionLedgerStorageError("assessment-session-mint-failed", "Assessment session identity could not be minted.");
}

export async function readAssessmentSession(sessionId: string) {
  if (!/^asmt-[0-9a-f-]{36}$/i.test(sessionId)) return null;
  return readExistingLedgerSession(sessionId);
}

function nextMeaningfulRevision(session: SessionRecord, updatedAt: string): SessionRecord {
  return {
    ...session,
    inputRevision: session.inputRevision + 1,
    storageRevision: session.storageRevision + 1,
    updatedAt,
    interpretationAuthority: null,
    reportAuthority: null,
  };
}

export type AuthorizedSaveResult =
  | { status: "saved" | "idempotent"; session: SessionRecord }
  | { status: "forbidden" }
  | { status: "gone" }
  | { status: "sequencing"; reason: string }
  | { status: "missing" };

export async function authorizeAndSaveRawAssessment(input: {
  sessionId: string;
  action: AuthorizedSaveAction;
  mutationCapability: string;
  payloadDigest: string;
  patch: Record<string, unknown>;
  presentedRespondentId?: string | null;
}): Promise<AuthorizedSaveResult> {
  const run = async (): Promise<AuthorizedSaveResult> => {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const current = await readAssessmentSession(input.sessionId);
      if (!current) return { status: "missing" };
      const applied = applyAuthorizedRawMutation(current, {
        action: input.action,
        mutationCapability: input.mutationCapability,
        payloadDigest: input.payloadDigest,
        patch: input.patch,
        presentedRespondentId: input.presentedRespondentId,
        nowIso: new Date().toISOString(),
      });
      if (applied.status !== "saved" && applied.status !== "idempotent-upgrade") return applied;
      const swapped = await compareAndSwapSession(
        input.sessionId,
        current.inputRevision,
        current.updatedAt,
        current.storageRevision,
        applied.session,
      );
      if (swapped === null) return { status: "missing" };
      if (swapped === "CAS_FAIL") continue;
      return applied.status === "idempotent-upgrade"
        ? { status: "idempotent", session: swapped }
        : { status: "saved", session: swapped };
    }
    throw new SessionLedgerStorageError(
      "persistent-storage-write-failed",
      "Authorized assessment mutation could not be committed atomically.",
    );
  };

  if (storageConfig()) return run();
  return withLocalSessionWriteChain(input.sessionId, run);
}

export async function mintInviteMutationCapability(input: {
  sessionId: string;
  ownerMutationCapability: string;
  role: "R2" | "TARGET";
}): Promise<
  | { status: "minted"; respondentId: string; mutationCapability: string; session: SessionRecord }
  | { status: "forbidden" }
  | { status: "gone" }
  | { status: "missing" }
  | { status: "already-consumed" }
> {
  const run = async () => {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const current = await readAssessmentSession(input.sessionId);
      if (!current) return { status: "missing" as const };
      const nowIso = new Date().toISOString();
      const capabilities = (current.mutationCapabilities ?? []).map(cloneCapability);
      const ownerIndex = findCapabilityIndex(capabilities, input.ownerMutationCapability);
      if (ownerIndex < 0) return { status: "forbidden" as const };
      const owner = capabilities[ownerIndex];
      if (owner.role !== "OWNER") return { status: "forbidden" as const };
      if (owner.lifecycle === "revoked" || capabilityIsExpired(owner, nowIso)) return { status: "gone" as const };

      const existingIndex = capabilities.findIndex((capability) => capability.role === input.role && capability.lifecycle !== "revoked");
      if (existingIndex >= 0) {
        const existing = capabilities[existingIndex];
        if (existing.lifecycle === "consumed" || existing.acceptedPayloadDigestByAction[input.role === "R2" ? "SAVE_R2" : "SAVE_REPORT_INPUT"]) {
          return { status: "already-consumed" as const };
        }
        existing.lifecycle = "revoked";
        capabilities[existingIndex] = existing;
      }

      const token = issueMutationCapabilityToken();
      const respondentId = input.role === "R2" ? `acqv-${randomUUID()}` : `tgt-${randomUUID()}`;
      capabilities.push(storedMutationCapability(
        input.role,
        hashMutationCapability(token),
        respondentId,
        capabilityExpiryIso(nowIso),
      ));
      const next: SessionRecord = {
        ...current,
        updatedAt: nowIso,
        storageRevision: current.storageRevision + 1,
        mutationCapabilities: capabilities,
      };
      const swapped = await compareAndSwapSession(input.sessionId, current.inputRevision, current.updatedAt, current.storageRevision, next);
      if (swapped === null) return { status: "missing" as const };
      if (swapped === "CAS_FAIL") continue;
      return {
        status: "minted" as const,
        respondentId,
        mutationCapability: token,
        session: swapped,
      };
    }
    throw new SessionLedgerStorageError(
      "persistent-storage-write-failed",
      "Invite mutation capability could not be minted atomically.",
    );
  };

  if (storageConfig()) return run();
  return withLocalSessionWriteChain(input.sessionId, run);
}

export async function saveRawAssessmentState(sessionId: string, rawAssessment: RawAssessmentState) {
  const config = storageConfig();
  if (config) {
    const updatedAt = new Date().toISOString();
    const raw = await redisCommand([
      "EVAL",
      "local v=redis.call('GET',KEYS[1]); if not v then return nil end; local r=cjson.decode(v); r.rawAssessment=cjson.decode(ARGV[1]); r.inputRevision=(tonumber(r.inputRevision) or 0)+1; r.interpretationAuthority=cjson.null; r.reportAuthority=cjson.null; r.updatedAt=ARGV[2]; local out=cjson.encode(r); redis.call('SET',KEYS[1],out,'EX',ARGV[3]); return out",
      "1",
      targetObservationSessionKey(sessionId),
      JSON.stringify(rawAssessment),
      updatedAt,
      String(TARGET_OBSERVATION_SESSION_TTL_SECONDS),
    ], "persistent-storage-write-failed");
    if (raw === null || raw === undefined) return null;
    const next = normalizeSessionRecord(sessionId, typeof raw === "string" ? JSON.parse(raw) : raw);
    ledger().set(sessionId, next);
    return next;
  }
  const current = await readAssessmentSession(sessionId);
  if (!current) return null;
  const updatedAt = new Date().toISOString();
  const next = nextMeaningfulRevision({ ...current, rawAssessment }, updatedAt);
  return writeLedgerSession(sessionId, next);
}

// A narrow field-patch authority write: the EVAL reads the CURRENT record at
// script time, checks the business inputRevision guard, patches only the
// authority fields plus updatedAt, and atomically advances storageRevision so
// any stale whole-record CAS created before this commit cannot pass. One
// script execution = one authoritative SET: there is no patch-then-increment
// window. updatedAt is refreshed but never carries correctness; a stale
// writer is rejected because the storage generation changed, even when the
// timestamp lands on the same millisecond.
export async function commitAssessmentAuthority(
  sessionId: string,
  revisionAtStart: number,
  interpretationAuthority: AssessmentAuthorityRecord,
  reportAuthority: AssessmentReportAuthority | null,
) {
  const config = storageConfig();
  if (config) {
    const updatedAt = new Date().toISOString();
    const raw = await redisCommand([
      "EVAL",
      "local v=redis.call('GET',KEYS[1]); if not v then return nil end; local r=cjson.decode(v); if tonumber(r.inputRevision)~=tonumber(ARGV[1]) then return nil end; r.interpretationAuthority=cjson.decode(ARGV[2]); r.reportAuthority=ARGV[3]=='null' and cjson.null or cjson.decode(ARGV[3]); r.updatedAt=ARGV[4]; r.storageRevision=(tonumber(r.storageRevision) or 0)+1; local out=cjson.encode(r); redis.call('SET',KEYS[1],out,'EX',ARGV[5]); return out",
      "1",
      targetObservationSessionKey(sessionId),
      String(revisionAtStart),
      JSON.stringify(interpretationAuthority),
      reportAuthority ? JSON.stringify(reportAuthority) : "null",
      updatedAt,
      String(TARGET_OBSERVATION_SESSION_TTL_SECONDS),
    ], "persistent-storage-write-failed");
    if (raw === null || raw === undefined) return null;
    const next = normalizeSessionRecord(sessionId, typeof raw === "string" ? JSON.parse(raw) : raw);
    ledger().set(sessionId, next);
    return next;
  }

  const run = async () => {
    for (let attempt = 0; attempt < 16; attempt += 1) {
      const current = await readAssessmentSession(sessionId);
      if (!current || current.inputRevision !== revisionAtStart) return null;
      const next: SessionRecord = {
        ...current,
        updatedAt: new Date().toISOString(),
        interpretationAuthority,
        reportAuthority,
        storageRevision: current.storageRevision + 1,
      };
      const swapped = await compareAndSwapSession(
        sessionId,
        current.inputRevision,
        current.updatedAt,
        current.storageRevision,
        next,
      );
      if (swapped === null) return null;
      if (swapped === "CAS_FAIL") continue;
      return swapped;
    }
    throw new SessionLedgerStorageError(
      "persistent-storage-write-failed",
      "Assessment authority could not be committed atomically.",
    );
  };

  return withLocalSessionWriteChain(sessionId, run);
}

export function currentAssessmentAuthority(session: SessionRecord | null) {
  if (!session?.interpretationAuthority) return null;
  const authority = session.interpretationAuthority;
  if (authority.sessionId !== session.sessionId || authority.inputRevision !== session.inputRevision) return null;
  if (session.reportAuthority && (
    session.reportAuthority.authorityId !== authority.authorityId
    || session.reportAuthority.inputRevision !== session.inputRevision
  )) return null;
  return authority;
}

export function getSession(sessionId: string) {
  const store = ledger();
  const existing = store.get(sessionId);
  if (existing) return existing;

  const session = emptySessionRecord(sessionId);
  store.set(sessionId, session);
  return session;
}

export function peekSession(sessionId: string): SessionRecord | null {
  if (!sessionId) return null;
  return ledger().get(sessionId) ?? null;
}

function hasStoredTrack1AndPreliminaryProof(sessionRecord: SessionRecord | null | undefined): boolean {
  if (!sessionRecord || typeof sessionRecord !== "object") {
    return false;
  }

  // SessionRecord persists observation setup/answers, target 2B, and invites only.
  // Track 1 (score-2a) and preliminary assessment are not stored on this ledger.
  // Those existing fields are not Track 1 / preliminary admission proof.
  return false;
}

export function evaluateCreateTargetSessionPrerequisites(
  sessionRecord: SessionRecord | null | undefined,
  requestBody: unknown = null,
): { ok: true } | { ok: false; status: "track-1-or-preliminary-incomplete" } {
  void requestBody;

  if (!hasStoredTrack1AndPreliminaryProof(sessionRecord)) {
    return {
      ok: false,
      status: "track-1-or-preliminary-incomplete",
    };
  }

  return { ok: true };
}

export function mergeTargetObservationSetupRecords(
  stored: TargetObservationSetupRecord | null | undefined,
  incoming: TargetObservationSetupBaseRecord,
): TargetObservationSetupRecord {
  if (incoming.completed || !stored || stored.completed !== true) return incoming;

  return Object.freeze({
    ...stored,
    rejectedSetupMetadataProvenance: incoming.setupMetadataProvenance,
  });
}

// Creation path for writers that historically created a session record on
// first write (readLedgerSession yields an empty record for a missing key).
// SET NX preserves that create-on-missing contract without ever overwriting
// an existing record; a lost NX race returns null so the caller re-reads and
// retries through the generation-aware CAS.
async function createSessionRecordIfMissing(sessionId: string, record: SessionRecord): Promise<SessionRecord | null> {
  const config = storageConfig();
  if (!config) return writeLedgerSession(sessionId, record);
  const created = await redisCommand(
    ["SET", targetObservationSessionKey(sessionId), JSON.stringify(record), "NX", "EX", String(TARGET_OBSERVATION_SESSION_TTL_SECONDS)],
    "persistent-storage-write-failed",
  );
  if (created !== "OK") return null;
  ledger().set(sessionId, record);
  return record;
}

// Unified Target Observation setup persistence: generation-aware CAS loop.
// A stale setup write can no longer perform an unconditional whole-record
// SET; it re-reads, re-merges against the CURRENT record, and retries, so a
// concurrent digest upgrade or authority commit is never clobbered.
async function persistTargetObservationSetupRecord(
  sessionId: string,
  setup: TargetObservationSetupBaseRecord,
) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const session = await readLedgerSession(sessionId);
    const nextSession = nextMeaningfulRevision({
      ...session,
      targetObservationSetup: mergeTargetObservationSetupRecords(session.targetObservationSetup, setup),
    }, new Date().toISOString());
    const swapped = await compareAndSwapSession(
      sessionId,
      session.inputRevision,
      session.updatedAt,
      session.storageRevision,
      nextSession,
    );
    if (swapped === "CAS_FAIL") continue;
    if (swapped === null) {
      const created = await createSessionRecordIfMissing(sessionId, nextSession);
      if (created === null) continue;
      return created;
    }
    return swapped;
  }
  throw new SessionLedgerStorageError(
    "persistent-storage-write-failed",
    "Target Observation setup could not be committed atomically.",
  );
}

export async function saveTargetObservationSetup(sessionId: string, setupInput: Record<string, unknown>) {
  const setup = buildTargetObservationSetupRecord(setupInput);
  return persistTargetObservationSetupRecord(sessionId, setup);
}

export async function persistRejectedTargetObservationSetup(
  sessionId: string,
  setupInput: Record<string, unknown>,
) {
  if (hasOversizedTargetObservationSetupRawValue(setupInput)) return null;

  const setup = buildTargetObservationSetupRecord(setupInput);
  if (setup.completed) return null;

  try {
    return await persistTargetObservationSetupRecord(sessionId, setup);
  } catch (error) {
    if (isSessionLedgerStorageError(error)) return null;
    throw error;
  }
}

export async function targetObservationState(sessionId: string) {
  const session = await readLedgerSession(sessionId);
  return {
    sessionId,
    targetObservationSetup: session.targetObservationSetup,
    targetObservation: session.targetObservation,
    target2B: session.target2B,
    canStartTargetObservation: canStartTargetObservation(session),
    authorizedTargetObservationComplete: Boolean((session.targetObservation as { completed?: boolean } | null)?.completed),
    authorizedTargetObserverComplete: Boolean(
      (session.targetObservation as { completed?: boolean } | null)?.completed
      && (session.target2B as { completed?: boolean } | null)?.completed,
    ),
  };
}

function physicalObserverRespondentId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text === "primary" || text === "verification") return null;
  return text;
}

function buildTargetDiagnosticRecord(input: {
  level1Answers?: Record<string, unknown>;
  level2Answers?: Record<string, unknown>;
}, respondentOptions: { respondentId?: string | null } = {}) {
  const identity = Object.freeze({
    respondentId: physicalObserverRespondentId(respondentOptions.respondentId),
    respondentSlot: null,
  });
  const level1Answers = typeof input.level1Answers === "object" && input.level1Answers ? input.level1Answers : {};
  const level2Answers = typeof input.level2Answers === "object" && input.level2Answers ? input.level2Answers : {};
  const level1Questions = [...TARGET_DIAGNOSTIC_DATA.level1.questions];
  const level2Questions = [...TARGET_DIAGNOSTIC_DATA.level2.questions];
  const level1Score = scoreTargetDiagnosticLevel1(level1Answers, TARGET_DIAGNOSTIC_DATA, identity);
  const level1ClassificationValidation = validateEvidenceClassifiedAnswers(level1Questions, level1Answers);

  if (!level1Score.valid) {
    return {
      ok: false,
      status: "target-diagnostic-level-1-incomplete",
      missingQuestionIds: level1Score.missingQuestionIds,
    };
  }
  if (!level1ClassificationValidation.valid) {
    return {
      ok: false,
      status: "target-diagnostic-level-1-classification-incomplete",
      invalidClassification: level1ClassificationValidation.invalid,
    };
  }

  const now = new Date().toISOString();
  if (!level1Score.requiresLevel2) {
    return {
      ok: true,
      target2B: Object.freeze({
        level1: Object.freeze({
          completed: true,
          storedAt: now,
          answers: Object.freeze({ ...level1Answers }),
          classificationValidation: level1ClassificationValidation,
          score: level1Score,
        }),
        requiresLevel2: false,
        completed: true,
        finalScore: level1Score,
      }),
    };
  }

  const level2Score = scoreTargetDiagnosticQuestions(level2Questions, level2Answers, identity);
  const level2ClassificationValidation = validateEvidenceClassifiedAnswers(level2Questions, level2Answers);
  const finalClassificationValidation = validateEvidenceClassifiedAnswers(
    [...level1Questions, ...level2Questions],
    { ...level1Answers, ...level2Answers },
  );
  if (!level2Score.valid) {
    return {
      ok: false,
      status: "target-diagnostic-level-2-incomplete",
      requiresLevel2: true,
      level1Score,
      missingQuestionIds: level2Score.missingQuestionIds,
    };
  }
  if (!level2ClassificationValidation.valid || !finalClassificationValidation.valid) {
    return {
      ok: false,
      status: "target-diagnostic-level-2-classification-incomplete",
      requiresLevel2: true,
      invalidClassification: finalClassificationValidation.invalid,
    };
  }

  return {
    ok: true,
    target2B: Object.freeze({
      level1: Object.freeze({
        completed: true,
        storedAt: now,
        answers: Object.freeze({ ...level1Answers }),
        classificationValidation: level1ClassificationValidation,
        score: level1Score,
      }),
      level2: Object.freeze({
        completed: true,
        storedAt: now,
        answers: Object.freeze({ ...level2Answers }),
        classificationValidation: level2ClassificationValidation,
        score: level2Score,
      }),
      requiresLevel2: true,
      completed: true,
      classificationValidation: finalClassificationValidation,
      finalScore: scoreTargetDiagnosticCombined(level1Answers, level2Answers, TARGET_DIAGNOSTIC_DATA, identity),
    }),
  };
}

// Unified Target Observation completion persistence: same generation-aware
// CAS discipline as setup. The completion payload is constant per call; each
// retry re-reads the CURRENT SessionRecord so no stale snapshot can replay
// unrelated fields.
async function persistTargetObservationCompletion(
  sessionId: string,
  setupRecord: TargetObservationSetupBaseRecord,
  targetObservation: unknown,
  target2B: unknown,
  nowIso: string,
) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const session = await readLedgerSession(sessionId);
    const nextSession = nextMeaningfulRevision({
      ...session,
      targetObservationSetup: setupRecord,
      targetObservation,
      target2B,
    }, nowIso);
    const swapped = await compareAndSwapSession(
      sessionId,
      session.inputRevision,
      session.updatedAt,
      session.storageRevision,
      nextSession,
    );
    if (swapped === "CAS_FAIL") continue;
    if (swapped === null) {
      const created = await createSessionRecordIfMissing(sessionId, nextSession);
      if (created === null) continue;
      return created;
    }
    return swapped;
  }
  throw new SessionLedgerStorageError(
    "persistent-storage-write-failed",
    "Target Observation completion could not be committed atomically.",
  );
}

export async function saveTargetObservationCompletion(input: {
  assessmentSessionId: string;
  observationSessionId: string;
  codeHash: string;
  digitalCode: string;
  setup: Record<string, unknown>;
  answers: Record<string, unknown>;
  targetDiagnostic?: {
    level1Answers?: Record<string, unknown>;
    level2Answers?: Record<string, unknown>;
  };
}) {
  const expectedHash = hashObservationSetupCode(input.digitalCode, input.observationSessionId, input.assessmentSessionId);
  if (!/^\d{6}$/.test(input.digitalCode) || expectedHash !== input.codeHash) {
    return {
      ok: false,
      status: "wrong-code",
    };
  }

  const setupRecord = buildTargetObservationSetupRecord(input.setup);
  if (!setupRecord.completed) {
    await persistRejectedTargetObservationSetup(input.assessmentSessionId, input.setup);
    return {
      ok: false,
      status: "setup-incomplete",
      missing: setupRecord.missing,
    };
  }

  const observerIdentity = {
    respondentId: physicalObserverRespondentId(input.observationSessionId),
    observationSessionId: input.observationSessionId,
  };
  const score = scoreTargetObservation(input.answers, undefined, observerIdentity);
  if (!score.valid) {
    if (score.invalidClassification?.length) {
      return {
        ok: false,
        status: "target-observation-classification-incomplete",
        invalidClassification: score.invalidClassification,
      };
    }
    return {
      ok: false,
      status: "target-observation-incomplete",
      missingQuestionIds: score.missingQuestionIds,
    };
  }

  const targetDiagnostic = buildTargetDiagnosticRecord(
    input.targetDiagnostic ?? {},
    { respondentId: physicalObserverRespondentId(input.observationSessionId) },
  );
  if (!targetDiagnostic.ok) {
    return targetDiagnostic;
  }

  const now = new Date().toISOString();
  const setupData = setupRecord.data as Record<string, unknown>;
  const targetObservation = Object.freeze({
    completed: true,
    storedAt: now,
    observationSessionId: input.observationSessionId,
    answers: Object.freeze({ ...input.answers }),
    classificationValidation: score.classificationValidation,
    score,
    outputContext: Object.freeze({
      observationPosition: setupData.observationPosition,
      respondentContext: setupData.respondentContext,
      respondentContextProfile: setupData.respondentContextProfile ?? null,
      integrationTimeline: setupData.integrationTimeline,
      observedTargetEnvironment: score.topEnvironmentCode,
      evidenceConfidence: score.evidenceConfidence,
    }),
  });

  await persistTargetObservationCompletion(
    input.assessmentSessionId,
    setupRecord,
    targetObservation,
    targetDiagnostic.target2B,
    now,
  );

  return {
    ok: true,
    status: "target-observation-received",
    sessionId: input.assessmentSessionId,
    targetObservationSetup: setupRecord,
    targetObservation,
    target2B: targetDiagnostic.target2B,
  };
}

function codeHash(code: string, targetSessionId: string, preliminaryAssessmentId: string) {
  return createHash("sha256").update(`${targetSessionId}:${preliminaryAssessmentId}:${code}`).digest("hex");
}

function sixDigitCode() {
  return String(randomInt(100000, 1000000));
}

function expiresAt(createdAt: string) {
  return new Date(new Date(createdAt).getTime() + TARGET_INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();
}

function findInvite(targetSessionId: string) {
  for (const session of ledger().values()) {
    if (session.targetInvite?.targetSessionId === targetSessionId) {
      return { session, invite: session.targetInvite };
    }
  }
  return null;
}

export function createServerTargetSession(input: {
  assessmentSessionId: string;
  preliminaryAssessmentId: string;
  reportBinding?: unknown;
  baseUrl?: string;
  track1Complete?: boolean;
  preliminaryAssessmentCreated?: boolean;
}) {
  const session = peekSession(input.assessmentSessionId);
  const prerequisites = evaluateCreateTargetSessionPrerequisites(session, input);
  if (!prerequisites.ok || !session) {
    return {
      ok: false,
      status: "track-1-or-preliminary-incomplete",
    };
  }

  const now = new Date().toISOString();
  const digitalCode = sixDigitCode();
  const targetSessionId = `tgt-${randomUUID()}`;
  const invite: TargetInviteRecord = {
    targetSessionId,
    assessmentSessionId: input.assessmentSessionId,
    preliminaryAssessmentId: input.preliminaryAssessmentId,
    reportBinding: input.reportBinding ?? null,
    codeHash: codeHash(digitalCode, targetSessionId, input.preliminaryAssessmentId),
    createdAt: now,
    expiresAt: expiresAt(now),
    completed: false,
    revoked: false,
  };

  const priorInvite = session.targetInvite && !session.targetInvite.completed
    ? {
        ...session.targetInvite,
        revoked: true,
        revokedAt: now,
        revokedReason: "superseded",
      }
    : session.targetInvite;

  const nextSession: SessionRecord = {
    ...session,
    updatedAt: now,
    targetInvite: invite,
  };
  ledger().set(input.assessmentSessionId, nextSession);

  const baseUrl = input.baseUrl?.replace(/\/$/, "") ?? "";
  return {
    ok: true,
    status: "target-session-created",
    priorInvite,
    targetSessionId,
    surveyLink: `${baseUrl}/screen-9a-target-code-gate?targetSessionId=${encodeURIComponent(targetSessionId)}`,
    digitalCode,
    expiresAt: invite.expiresAt,
    ttlHours: TARGET_INVITE_TTL_HOURS,
    codeDigits: 6,
  };
}

type TargetCodeAttemptResult =
  | {
    ok: false;
    status: "not-found" | "revoked" | "completed" | "expired" | "invalid-format" | "wrong-code" | "locked";
    nextInvite: TargetInviteRecord | null;
  }
  | {
    ok: true;
    status: "verified";
    nextInvite: TargetInviteRecord;
  };

function failedAttemptCount(invite: TargetInviteRecord) {
  const count = Number(invite.failedVerifyAttempts);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function lockoutExpiryIso(invite: TargetInviteRecord, nowIso: string) {
  const nowMs = Date.parse(nowIso);
  const lockMs = nowMs + TARGET_CODE_LOCKOUT_MS;
  const expiresMs = Date.parse(invite.expiresAt);
  const lockedUntilMs = Number.isFinite(expiresMs) ? Math.min(lockMs, expiresMs) : lockMs;
  return new Date(lockedUntilMs).toISOString();
}

function registerFailedTargetCodeAttempt(
  invite: TargetInviteRecord,
  status: "invalid-format" | "wrong-code",
  nowIso: string,
): TargetCodeAttemptResult {
  const failedVerifyAttempts = failedAttemptCount(invite) + 1;
  if (failedVerifyAttempts >= TARGET_CODE_MAX_FAILED_ATTEMPTS) {
    return {
      ok: false,
      status: "locked",
      nextInvite: {
        ...invite,
        failedVerifyAttempts,
        lockedUntil: lockoutExpiryIso(invite, nowIso),
      },
    };
  }

  return {
    ok: false,
    status,
    nextInvite: {
      ...invite,
      failedVerifyAttempts,
      lockedUntil: null,
    },
  };
}

export function evaluateTargetCodeAttempt(
  invite: TargetInviteRecord | null | undefined,
  code: string,
  now = new Date().toISOString(),
): TargetCodeAttemptResult {
  if (!invite) {
    return { ok: false, status: "not-found", nextInvite: null };
  }

  if (invite.revoked) {
    return { ok: false, status: "revoked", nextInvite: null };
  }

  if (invite.completed) {
    return { ok: false, status: "completed", nextInvite: null };
  }

  const nowMs = Date.parse(now);
  if (nowMs > Date.parse(invite.expiresAt)) {
    return { ok: false, status: "expired", nextInvite: null };
  }

  const lockedUntilMs = invite.lockedUntil ? Date.parse(invite.lockedUntil) : NaN;
  if (Number.isFinite(lockedUntilMs) && nowMs < lockedUntilMs) {
    return { ok: false, status: "locked", nextInvite: null };
  }

  const currentInvite = Number.isFinite(lockedUntilMs) && nowMs >= lockedUntilMs
    ? { ...invite, failedVerifyAttempts: 0, lockedUntil: null }
    : invite;

  const normalizedCode = typeof code === "string" ? code.trim() : "";
  if (!/^\d{6}$/.test(normalizedCode)) {
    return registerFailedTargetCodeAttempt(currentInvite, "invalid-format", now);
  }

  if (codeHash(normalizedCode, invite.targetSessionId, invite.preliminaryAssessmentId) !== invite.codeHash) {
    return registerFailedTargetCodeAttempt(currentInvite, "wrong-code", now);
  }

  return {
    ok: true,
    status: "verified",
    nextInvite: {
      ...currentInvite,
      failedVerifyAttempts: 0,
      lockedUntil: null,
    },
  };
}

export function verifyServerTargetCode(targetSessionId: string, code: string, now = new Date().toISOString()) {
  const found = findInvite(targetSessionId);
  const evaluation = evaluateTargetCodeAttempt(found?.invite ?? null, code, now);

  if (found && evaluation.nextInvite) {
    ledger().set(found.session.sessionId, {
      ...found.session,
      updatedAt: now,
      targetInvite: evaluation.nextInvite,
    });
  }

  if (!evaluation.ok) {
    return {
      ok: false,
      status: evaluation.status,
    };
  }

  return {
    ok: true,
    status: "verified",
    targetSessionId,
    verificationToken: createHash("sha256").update(`${targetSessionId}:${evaluation.nextInvite.codeHash}:verified`).digest("hex"),
  };
}

export function completeServerTargetSession(targetSessionId: string, code: string, targetSelfAssessment: unknown) {
  const verification = verifyServerTargetCode(targetSessionId, code);
  if (!verification.ok) return verification;

  const found = findInvite(targetSessionId);
  if (!found) return { ok: false, status: "not-found" };
  const now = new Date().toISOString();
  const invite: TargetInviteRecord = {
    ...found.invite,
    completed: true,
    completedAt: now,
    targetSelfAssessment,
  };
  const session: SessionRecord = {
    ...found.session,
    updatedAt: now,
    targetInvite: invite,
  };
  ledger().set(found.session.sessionId, session);
  return {
    ok: true,
    status: "target-self-assessment-received",
    targetSessionId,
    completedAt: now,
  };
}
