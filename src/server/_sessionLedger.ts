import { createHash, randomInt, randomUUID } from "node:crypto";
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

type SessionRecord = {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  targetObservationSetup: TargetObservationSetupRecord | null;
  targetObservation: unknown | null;
  target2B: unknown | null;
  targetInvite?: TargetInviteRecord | null;
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
    targetObservationSetup: null,
    targetObservation: null,
    target2B: null,
    targetInvite: null,
  };
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
    targetObservationSetup: record.targetObservationSetup ?? null,
    targetObservation: record.targetObservation ?? null,
    target2B: record.target2B ?? null,
    targetInvite: record.targetInvite ?? null,
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

async function persistTargetObservationSetupRecord(
  sessionId: string,
  setup: TargetObservationSetupBaseRecord,
) {
  const session = await readLedgerSession(sessionId);
  const nextSession: SessionRecord = {
    ...session,
    updatedAt: new Date().toISOString(),
    targetObservationSetup: mergeTargetObservationSetupRecords(session.targetObservationSetup, setup),
  };
  return writeLedgerSession(sessionId, nextSession);
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

  const session = await readLedgerSession(input.assessmentSessionId);
  const nextSession: SessionRecord = {
    ...session,
    updatedAt: now,
    targetObservationSetup: setupRecord,
    targetObservation,
    target2B: targetDiagnostic.target2B,
  };
  await writeLedgerSession(input.assessmentSessionId, nextSession);

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
