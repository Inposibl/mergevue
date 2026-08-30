import { randomUUID } from "node:crypto";
import {
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  attachDealContext,
  completeAcquirerVerificationInvite,
} from "../src/flow/acquirerTrackFlow.js";
import { buildFinalDeliverable } from "../src/flow/finalDeliverableFlow.js";
import { buildTargetSelfAssessmentRecord } from "../src/flow/targetSelfAssessmentFlow.js";
import { runProductionInterpretation } from "../src/agent/productionInterpretationComposition.js";
import {
  buildMergevuePublicReportEmailCopy,
  buildMergevuePublicReportModel,
} from "../src/reporting/mergevuePublicReportModel.js";
import {
  buildMergevueForecastBriefDesignModel,
  renderMergevueForecastBriefHtml,
} from "../src/reporting/mergevueForecastBriefDesignRenderer.js";
import {
  SessionLedgerStorageError,
  commitAssessmentAuthority,
  createAssessmentSession,
  currentAssessmentAuthority,
  isSessionLedgerStorageError,
  readAssessmentSession,
  saveRawAssessmentState,
} from "../src/server/_sessionLedger.ts";
import type {
  AssessmentAuthorityRecord,
  AssessmentReportAuthority,
  RawAssessmentState,
} from "../src/server/_sessionLedger.ts";

type NodeRequest = {
  body?: unknown;
  method?: string;
  on?: (event: "data" | "end" | "error", callback: (chunk?: any) => void) => void;
};

type NodeResponse = {
  statusCode: number;
  json?: (body: unknown) => void;
  status?: (statusCode: number) => NodeResponse;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

const ACTIONS = new Set(["CREATE_SESSION", "SAVE_DEAL_CONTEXT", "SAVE_R1", "SAVE_R2", "SAVE_REPORT_INPUT", "EXECUTE", "STATUS"]);
const FORBIDDEN_AUTHORITY_FIELDS = new Set([
  "candidatePair", "candidatePairNormalized", "comparison", "crossSideEnvironmentPair",
  "deliverable", "engineSnapshotDigest", "engineFactsRef", "environmentScores",
  "establishedEnvironmentCodes", "inputRevision", "interpretationAuthority", "agentResult",
  "reportAuthority", "reportModel", "reportReady", "result", "score", "scores",
]);

function isPlainObject(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(record: Record<string, any>, allowed: string[]) {
  const keys = Object.keys(record);
  return keys.every((key) => allowed.includes(key));
}

function containsForbiddenAuthorityField(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsForbiddenAuthorityField);
  if (!isPlainObject(value)) return false;
  return Object.entries(value).some(([key, child]) => (
    FORBIDDEN_AUTHORITY_FIELDS.has(key) || containsForbiddenAuthorityField(child)
  ));
}

async function parseBody(request: NodeRequest) {
  if (isPlainObject(request.body)) return request.body;
  if (typeof request.body === "string") {
    try { return JSON.parse(request.body); } catch { return null; }
  }
  return new Promise<any>((resolve) => {
    let raw = "";
    if (typeof request.on !== "function") return resolve(null);
    request.on("data", (chunk) => { raw += chunk?.toString() ?? ""; });
    request.on("error", () => resolve(null));
    request.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : null); } catch { resolve(null); }
    });
  });
}

function sendJson(response: NodeResponse, statusCode: number, body: unknown) {
  if (typeof response.status === "function" && typeof response.json === "function") {
    response.status(statusCode).json?.(body);
    return;
  }
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function publicFailure(status: string, error: string) {
  return { status, error };
}

function emptyRawAssessment(): RawAssessmentState {
  return { dealContext: null, r1: null, r2: null, targetSelf: null };
}

function validateSessionId(value: unknown) {
  return typeof value === "string" && /^asmt-[0-9a-f-]{36}$/i.test(value) ? value : null;
}

function acceptedAgentResult(value: any) {
  return isPlainObject(value)
    && typeof value.resultSchemaVersion === "string"
    && isPlainObject(value.engineFactsRef)
    && /^sha256:[a-f0-9]{64}$/i.test(String(value.engineFactsRef.engineSnapshotDigest ?? ""));
}

function canonicalSystemFailure(value: any) {
  return isPlainObject(value)
    && typeof value.failureSchemaVersion === "string"
    && typeof value.failureClass === "string"
    && /^sha256:[a-f0-9]{64}$/i.test(String(value.engineSnapshotDigest ?? ""));
}

export function reconstructAssessmentSession(record: any) {
  const raw = record?.rawAssessment as RawAssessmentState | null;
  if (!raw?.dealContext || !raw.r1?.answers) {
    return { ok: false as const, status: "production-interpretation-blocked", reason: "r1-or-deal-context-incomplete" };
  }

  const deal = attachDealContext({ sessionId: record.sessionId }, raw.dealContext, record.updatedAt);
  if (!deal.validation.valid) {
    return { ok: false as const, status: "production-interpretation-blocked", reason: "deal-context-invalid" };
  }
  const r1 = attachAcquirerModuleResult(deal.session, raw.r1.answers, record.updatedAt);
  if (!r1.session.acquirer2A?.completed) {
    return { ok: false as const, status: "production-interpretation-blocked", reason: "r1-invalid" };
  }

  let session: any = r1.session;
  if (raw.r2?.completed) {
    const respondentId = raw.r2.respondentId || `acqv-${record.sessionId}`;
    const invite = {
      assessmentSessionId: record.sessionId,
      acquirerVerificationSessionId: respondentId,
      completed: false,
      revoked: false,
    };
    const completed = completeAcquirerVerificationInvite(
      invite,
      raw.r2.answers,
      record.updatedAt,
      raw.r2.respondentContext,
    );
    if (!completed.ok) {
      return { ok: false as const, status: "production-interpretation-blocked", reason: "r2-invalid" };
    }
    session = attachAcquirerVerificationCompletion(session, completed.invite);
    if (!session.acquirerVerification?.completed) {
      return { ok: false as const, status: "production-interpretation-blocked", reason: "r2-attachment-invalid" };
    }
  }

  if (record.targetObservation) session = { ...session, targetObservation: record.targetObservation };
  if (record.targetObservationSetup) session = { ...session, targetObservationSetup: record.targetObservationSetup };
  if (record.target2B) session = { ...session, target2B: record.target2B };

  if (raw.targetSelf?.completed) {
    const targetSessionId = raw.targetSelf.respondentId || `target-${record.sessionId}`;
    const targetSelfAssessment = buildTargetSelfAssessmentRecord(
      raw.targetSelf.positioning,
      raw.targetSelf.answers,
      record.updatedAt,
      { targetSessionId },
    );
    if (!targetSelfAssessment.completed) {
      return { ok: false as const, status: "production-interpretation-blocked", reason: "target-self-invalid" };
    }
    session = {
      ...session,
      targetSelfAssessment,
      targetInvite: { completed: true, targetSessionId },
    };
  }

  return { ok: true as const, session: Object.freeze(session) };
}

function serverDerivedInterpretationContext(session: any, hasCompletedR2: boolean) {
  if (!hasCompletedR2) return { establishedEnvironmentCodes: [], crossSideEnvironmentPair: null };
  const deliverable = buildFinalDeliverable(session);
  if (!deliverable.ready) return { establishedEnvironmentCodes: [], crossSideEnvironmentPair: null };
  const acquirerEnvironmentCode = deliverable.acquirerEnvironmentCode;
  const targetEnvironmentCode = deliverable.targetEnvironmentCode;
  return {
    establishedEnvironmentCodes: [acquirerEnvironmentCode, targetEnvironmentCode].filter(Boolean),
    crossSideEnvironmentPair: acquirerEnvironmentCode && targetEnvironmentCode
      ? { acquirerEnvironmentCode, targetEnvironmentCode }
      : null,
  };
}

function buildServerReportProjection(session: any) {
  const deliverable = buildFinalDeliverable(session);
  if (!deliverable.ready) return null;
  const report = buildMergevuePublicReportModel(session, { deliverable });
  const designModel = buildMergevueForecastBriefDesignModel(report);
  const html = renderMergevueForecastBriefHtml(designModel);
  if (typeof html !== "string" || !html.trim()) return null;
  return Object.freeze({
    session,
    deliverable,
    report,
    reportEmailCopy: buildMergevuePublicReportEmailCopy(report),
    html,
  });
}

export async function executeCurrentAssessment(sessionId: string) {
  const record = await readAssessmentSession(sessionId);
  if (!record) return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  const revisionAtStart = record.inputRevision;
  const reconstructed = reconstructAssessmentSession(record);
  if (!reconstructed.ok) {
    return { statusCode: 409, body: publicFailure(reconstructed.status, "Current assessment evidence is not report-eligible.") };
  }

  const interpretationContext = serverDerivedInterpretationContext(reconstructed.session, record.rawAssessment?.r2?.completed === true);
  let result: any;
  try {
    result = await runProductionInterpretation({
      session: reconstructed.session,
      moduleId: "acquirerEnvironment",
      projectId: record.projectId,
      establishedEnvironmentCodes: interpretationContext.establishedEnvironmentCodes,
      crossSideEnvironmentPair: interpretationContext.crossSideEnvironmentPair,
    });
  } catch {
    result = { blocked: true };
  }

  const createdAt = new Date().toISOString();
  const authorityId = `auth-${randomUUID()}`;
  let terminalKind: AssessmentAuthorityRecord["terminalKind"] = "production-interpretation-blocked";
  let digest: string | null = null;
  let acceptedResult: unknown | null = null;
  let failure: unknown | null = null;
  let projection: any = null;
  if (acceptedAgentResult(result)) {
    terminalKind = "agent-result";
    digest = result.engineFactsRef.engineSnapshotDigest;
    acceptedResult = result;
    projection = buildServerReportProjection(reconstructed.session);
  } else if (canonicalSystemFailure(result)) {
    terminalKind = "system-failure";
    digest = result.engineSnapshotDigest;
    failure = result;
  }

  const reportReady = terminalKind === "agent-result" && projection !== null;
  const interpretationAuthority: AssessmentAuthorityRecord = {
    authorityId,
    sessionId,
    inputRevision: revisionAtStart,
    terminalKind,
    outcomeSource: record.rawAssessment?.r2?.completed ? "DUAL_CORE" : "SINGLE_R1_ONLY",
    engineSnapshotDigest: digest,
    result: acceptedResult,
    failure,
    reportReady,
    createdAt,
  };
  const reportAuthority: AssessmentReportAuthority | null = reportReady
    ? { authorityId, sessionId, inputRevision: revisionAtStart, reportReady: true, projection, createdAt }
    : null;
  const committed = await commitAssessmentAuthority(sessionId, revisionAtStart, interpretationAuthority, reportAuthority);
  if (!committed) {
    return { statusCode: 409, body: publicFailure("stale-authority", "Assessment inputs changed while authority was being resolved.") };
  }
  return {
    statusCode: reportReady ? 200 : 409,
    body: {
      status: reportReady ? "report-ready" : terminalKind,
      sessionId,
      inputRevision: revisionAtStart,
      authorityId,
      reportReady,
      terminalKind,
      ...(reportReady ? { projection } : {}),
    },
  };
}

async function saveMutation(action: string, body: Record<string, any>) {
  const sessionId = validateSessionId(body.sessionId);
  if (!sessionId) return { statusCode: 400, body: publicFailure("invalid-request", "A server-issued sessionId is required.") };
  const current = await readAssessmentSession(sessionId);
  if (!current) return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  const raw = current.rawAssessment ?? emptyRawAssessment();
  let next: RawAssessmentState;
  if (action === "SAVE_DEAL_CONTEXT") {
    if (!hasOnlyKeys(body, ["action", "sessionId", "dealContext"]) || !isPlainObject(body.dealContext)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Raw dealContext is required.") };
    }
    next = { ...raw, dealContext: body.dealContext };
  } else if (action === "SAVE_R1") {
    if (!hasOnlyKeys(body, ["action", "sessionId", "answers"]) || !isPlainObject(body.answers)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Raw R1 answers are required.") };
    }
    next = { ...raw, r1: { answers: body.answers } };
  } else if (action === "SAVE_R2") {
    if (!hasOnlyKeys(body, ["action", "sessionId", "completed", "answers", "respondentContext", "respondentId"])
      || body.completed !== true || !isPlainObject(body.answers)
      || (body.respondentContext !== null && !isPlainObject(body.respondentContext))) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw R2 evidence and context are required.") };
    }
    next = { ...raw, r2: { completed: true, answers: body.answers, respondentContext: body.respondentContext, respondentId: typeof body.respondentId === "string" ? body.respondentId : null } };
  } else {
    if (!hasOnlyKeys(body, ["action", "sessionId", "completed", "answers", "positioning", "respondentId"])
      || body.completed !== true || !isPlainObject(body.answers) || !isPlainObject(body.positioning)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw Target Self-Assessment input is required.") };
    }
    next = { ...raw, targetSelf: { completed: true, answers: body.answers, positioning: body.positioning, respondentId: typeof body.respondentId === "string" ? body.respondentId : null } };
  }
  const saved = await saveRawAssessmentState(sessionId, next);
  if (!saved) return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  return { statusCode: 200, body: { status: "input-saved", sessionId, inputRevision: saved.inputRevision, reportReady: false } };
}

export async function handleProductionInterpretationAction(body: unknown) {
  if (!isPlainObject(body) || typeof body.action !== "string" || !ACTIONS.has(body.action)) {
    return { statusCode: 400, body: publicFailure("invalid-request", "A known action is required.") };
  }
  if (containsForbiddenAuthorityField(body)) {
    return { statusCode: 400, body: publicFailure("invalid-request", "Server-derived authority fields are forbidden.") };
  }
  if (body.action === "CREATE_SESSION") {
    if (!hasOnlyKeys(body, ["action", "projectId"]) || (body.projectId != null && typeof body.projectId !== "string")) {
      return { statusCode: 400, body: publicFailure("invalid-request", "CREATE_SESSION payload is invalid.") };
    }
    const created = await createAssessmentSession(body.projectId ?? null);
    return { statusCode: 201, body: { status: "session-created", sessionId: created.sessionId, inputRevision: created.inputRevision, reportReady: false } };
  }
  if (["SAVE_DEAL_CONTEXT", "SAVE_R1", "SAVE_R2", "SAVE_REPORT_INPUT"].includes(body.action)) {
    return saveMutation(body.action, body);
  }
  const sessionId = validateSessionId(body.sessionId);
  if (!sessionId || !hasOnlyKeys(body, body.action === "STATUS" ? ["action", "sessionId", "authorityId"] : ["action", "sessionId"])) {
    return { statusCode: 400, body: publicFailure("invalid-request", "Action payload is invalid.") };
  }
  if (body.action === "EXECUTE") return executeCurrentAssessment(sessionId);
  const record = await readAssessmentSession(sessionId);
  if (!record) return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  const authority = currentAssessmentAuthority(record);
  if (!authority || !record.reportAuthority || authority.reportReady !== true) {
    return { statusCode: 409, body: { status: "not-report-ready", sessionId, inputRevision: record.inputRevision, reportReady: false } };
  }
  if (body.authorityId && body.authorityId !== authority.authorityId) {
    return { statusCode: 409, body: publicFailure("stale-authority", "Authority no longer matches the current assessment revision.") };
  }
  return { statusCode: 200, body: { status: "report-ready", sessionId, inputRevision: record.inputRevision, authorityId: authority.authorityId, reportReady: true, projection: record.reportAuthority.projection } };
}

export default async function handler(request: NodeRequest, response: NodeResponse) {
  if (request.method !== "POST") {
    sendJson(response, 405, publicFailure("method-not-allowed", "POST is required."));
    return;
  }
  const body = await parseBody(request);
  if (!body) {
    sendJson(response, 400, publicFailure("invalid-request", "A valid JSON object is required."));
    return;
  }
  try {
    const result = await handleProductionInterpretationAction(body);
    sendJson(response, result.statusCode, result.body);
  } catch (error) {
    const storage = isSessionLedgerStorageError(error) ? error as SessionLedgerStorageError : null;
    sendJson(response, 503, publicFailure(storage?.status ?? "system-failure", "Production interpretation authority is unavailable."));
  }
}
