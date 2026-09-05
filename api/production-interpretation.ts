import { randomUUID } from "node:crypto";
import {
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  attachDealContext,
  completeAcquirerVerificationInvite,
  isResolvedAcquirerVerificationRespondentContext,
} from "../src/flow/acquirerTrackFlow.js";
import { buildFinalDeliverable } from "../src/flow/finalDeliverableFlow.js";
import { buildTargetSelfAssessmentRecord } from "../src/flow/targetSelfAssessmentFlow.js";
import { canCreatePreliminaryAssessment } from "../src/flow/targetDiagnosticFlow.js";
import { buildContradictionReport } from "../src/flow/contradictionEngine.js";
import { selectCandidatePair } from "../src/flow/candidatePairSelector.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { assembleProductionDualAdjudicationInput } from "../src/flow/productionAdjudicationInputAssembler.js";
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
  authorizeAndSaveRawAssessment,
  commitAssessmentAuthority,
  createAssessmentSession,
  currentAssessmentAuthority,
  currentSemanticMutationDigest,
  isMutationCapabilityToken,
  isSessionLedgerStorageError,
  mintInviteMutationCapability,
  readAssessmentSession,
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

const ACTIONS = new Set(["CREATE_SESSION", "MINT_INVITE_CAPABILITY", "SAVE_DEAL_CONTEXT", "SAVE_R1", "SAVE_R2", "SAVE_REPORT_INPUT", "EXECUTE", "STATUS"]);
const CAPABILITY_SECRET_KEYS = new Set([
  "mutationCapability",
  "r2MutationCapability",
  "targetMutationCapability",
  "mintedMutationSecrets",
]);
const SAVE_ACTIONS = new Set(["SAVE_DEAL_CONTEXT", "SAVE_R1", "SAVE_R2", "SAVE_REPORT_INPUT"]);
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

function buildServerReportProjection(session: any, acceptedResult: any) {
  const deliverable = buildFinalDeliverable(session);
  if (!deliverable.ready) return null;
  const report = buildMergevuePublicReportModel(session, {
    deliverable,
    clientNarrative: acceptedResult.clientNarrative,
    interpretationStatus: acceptedResult.interpretationStatus,
    r1r2Agreement: buildServerR1R2AgreementSummary(session),
    crossSideEvidence: buildServerCrossSideEvidenceSummary(session),
  });
  if (!report) return null;
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

// RR3-CORR1-IV-01 (CORR2) / CORR3-A: bounded public-safe projection of the existing
// deterministic cross-side contradiction aggregate (acquirer-side vs target-side
// evidence — NOT the R1/R2 comparison). Readiness is aligned to the EXISTING governed
// preliminary contradiction authority (canCreatePreliminaryAssessment: deal context +
// Acquirer 2A + Target Observation + Target 2B). Target Self Assessment is consumed by
// the engine when completed, but its completion is not a computability precondition —
// contradiction computability and Final Deliverable readiness are distinct concerns.
// The engine is invoked only when the governed precondition holds; otherwise the
// projection is null and the report renders NOT ASSESSED (missing is never zero).
export function buildServerCrossSideEvidenceSummary(session: any): {
  assessed: boolean;
  contradictionCount: number;
} | null {
  if (!canCreatePreliminaryAssessment(session)) {
    return null;
  }
  try {
    const contradictionReport = buildContradictionReport(session);
    const count = Number(contradictionReport?.summary?.contradictionCount);
    return Object.freeze({
      assessed: true,
      contradictionCount: Number.isFinite(count) ? count : 0,
    });
  } catch {
    return null;
  }
}

// RR3-F02/RR3-F03: governed R1/R2 (primary vs verification acquirer respondent)
// agreement/divergence summary, computed in the server production-authority path
// through the existing dual-respondent comparator (pre-core selector -> C5-B input
// assembler -> comparator). Only a bounded public-safe aggregate leaves this function;
// raw answers, question IDs, and respondent-specific content never reach the report.
// The cross-side contradiction engine is not used as an R1/R2 substitute. Any
// non-adjudicable state fails closed to null (the report renders NOT ASSESSED).
export function buildServerR1R2AgreementSummary(session: any): {
  status: string;
  value: string;
  source: string;
} | null {
  if (session?.acquirer2A?.score?.verificationIncluded !== true) return null;
  let selector: any = null;
  try {
    selector = selectCandidatePair({ session });
  } catch {
    return null;
  }
  if (selector?.status !== "SELECTED" || !selector.candidatePair) return null;
  let assembled: any = null;
  try {
    assembled = assembleProductionDualAdjudicationInput({
      session,
      moduleId: "acquirer_environment",
      candidatePair: String(selector.candidatePair),
    });
  } catch {
    return null;
  }
  if (assembled?.ok !== true || !assembled.coreInput) return null;
  let comparison: any = null;
  try {
    comparison = compareDualRespondents({
      ...assembled.coreInput,
      outOfPairEvidence: false,
      coherenceAmbiguous: false,
    });
  } catch {
    return null;
  }
  const audit = comparison?.audit ?? null;
  const pairRows = Array.isArray(audit?.pairRows) ? audit.pairRows : [];
  const comparableRows = pairRows.filter((row: any) => row.comparable === true);
  const comparableCount = comparableRows.length;
  if (comparableCount === 0) return null;
  const rawAgreeCount = Number(audit.rawAgreeCount);
  const countableAgreeCount = Number(audit.agreeCount);
  const divergeCount = comparableRows.filter((row: any) => row.diverge === true).length;
  const unanimous = divergeCount === 0 && Number.isFinite(rawAgreeCount) && rawAgreeCount === comparableCount;
  const agreeDetail = Number.isFinite(countableAgreeCount)
    ? `${countableAgreeCount} of ${comparableCount} comparable answers count as agreement`
    : `${comparableCount} comparable answers reviewed`;
  const status = unanimous ? "unanimous" : divergeCount > 0 ? "non-unanimous" : "agreement-with-exclusions";
  const value = unanimous
    ? `Unanimous — ${agreeDetail}.`
    : divergeCount > 0
      ? `Non-unanimous — divergence present (${divergeCount} of ${comparableCount} comparable answers diverge; ${agreeDetail}).`
      : `Agreement with exclusions — no divergence present; ${agreeDetail}.`;
  return Object.freeze({
    status,
    value,
    source: "compareDualRespondents via assembleProductionDualAdjudicationInput (governed R1/R2 comparison, aggregate only)",
  });
}

function stripCapabilitySecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCapabilitySecrets);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !CAPABILITY_SECRET_KEYS.has(key))
      .map(([key, child]) => [key, stripCapabilitySecrets(child)]),
  );
}

function publicScoreView(score: any) {
  if (!isPlainObject(score)) return null;
  return Object.freeze({
    verificationIncluded: score.verificationIncluded === true,
    signalStrength: typeof score.signalStrength === "string" ? score.signalStrength : null,
    coPresence: score.coPresence === true,
    primaryEnvironmentCode: typeof score.primaryEnvironmentCode === "string" ? score.primaryEnvironmentCode : null,
    secondaryEnvironmentCode: typeof score.secondaryEnvironmentCode === "string" ? score.secondaryEnvironmentCode : null,
  });
}

function toBrowserAuthorizedProjection(internal: any) {
  if (!isPlainObject(internal) || !isPlainObject(internal.deliverable) || !isPlainObject(internal.report)) return null;
  const session = isPlainObject(internal.session) ? internal.session : {};
  const acquirerScore = publicScoreView(session.acquirer2A?.score);
  const targetSelfScore = publicScoreView(session.targetSelfAssessment?.score);
  const target2bScore = publicScoreView(session.target2B?.finalScore);
  return Object.freeze({
    deliverable: internal.deliverable,
    report: internal.report,
    boundedSession: Object.freeze({
      sessionId: typeof session.sessionId === "string" ? session.sessionId : null,
      acquirer2A: Object.freeze({
        completed: session.acquirer2A?.completed === true,
        ...(acquirerScore ? { score: acquirerScore } : {}),
      }),
      acquirerVerification: Object.freeze({
        completed: session.acquirerVerification?.completed === true,
      }),
      target2B: target2bScore ? Object.freeze({ finalScore: target2bScore }) : null,
      targetSelfAssessment: session.targetSelfAssessment?.completed === true
        ? Object.freeze({
          completed: true,
          ...(targetSelfScore ? { score: targetSelfScore } : {}),
        })
        : null,
    }),
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
    projection = buildServerReportProjection(reconstructed.session, result);
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
    body: stripCapabilitySecrets({
      status: reportReady ? "report-ready" : terminalKind,
      sessionId,
      inputRevision: revisionAtStart,
      authorityId,
      reportReady,
      terminalKind,
      ...(reportReady ? { projection: toBrowserAuthorizedProjection(projection) } : {}),
    }),
  };
}

function capabilityFailure(kind: "missing" | "invalid") {
  return {
    statusCode: 403,
    body: publicFailure(
      "forbidden-capability",
      kind === "missing"
        ? "A mutation capability is required."
        : "The mutation capability is not valid for this action.",
    ),
  };
}

async function mintInviteCapability(body: Record<string, any>) {
  const sessionId = validateSessionId(body.sessionId);
  if (!sessionId
    || !hasOnlyKeys(body, ["action", "sessionId", "mutationCapability", "role"])
    || (body.role !== "R2" && body.role !== "TARGET")) {
    return { statusCode: 400, body: publicFailure("invalid-request", "MINT_INVITE_CAPABILITY payload is invalid.") };
  }
  if (body.mutationCapability == null || body.mutationCapability === "") return capabilityFailure("missing");
  if (typeof body.mutationCapability !== "string") {
    return { statusCode: 400, body: publicFailure("invalid-request", "MINT_INVITE_CAPABILITY payload is invalid.") };
  }
  if (!isMutationCapabilityToken(body.mutationCapability)) return capabilityFailure("invalid");
  const minted = await mintInviteMutationCapability({
    sessionId,
    ownerMutationCapability: body.mutationCapability,
    role: body.role,
  });
  if (minted.status === "missing") return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  if (minted.status === "forbidden") return capabilityFailure("invalid");
  if (minted.status === "gone") {
    return { statusCode: 410, body: publicFailure("capability-gone", "Mutation capability is expired, revoked, or consumed.") };
  }
  if (minted.status === "already-consumed") {
    return { statusCode: 410, body: publicFailure("capability-gone", "Mutation capability is expired, revoked, or consumed.") };
  }
  return {
    statusCode: 201,
    body: {
      status: "invite-capability-minted",
      sessionId,
      role: body.role,
      respondentId: minted.respondentId,
      mutationCapability: minted.mutationCapability,
    },
  };
}

async function saveMutation(action: string, body: Record<string, any>) {
  const sessionId = validateSessionId(body.sessionId);
  if (!sessionId) return { statusCode: 400, body: publicFailure("invalid-request", "A server-issued sessionId is required.") };
  const current = await readAssessmentSession(sessionId);
  if (!current) return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };

  const allowedKeys = action === "SAVE_DEAL_CONTEXT"
    ? ["action", "sessionId", "mutationCapability", "dealContext"]
    : action === "SAVE_R1"
      ? ["action", "sessionId", "mutationCapability", "answers"]
      : action === "SAVE_R2"
        ? ["action", "sessionId", "mutationCapability", "completed", "answers", "respondentContext", "respondentId"]
        : ["action", "sessionId", "mutationCapability", "completed", "answers", "positioning", "respondentId"];
  if (!hasOnlyKeys(body, allowedKeys)) {
    return { statusCode: 400, body: publicFailure("invalid-request", "Action payload is invalid.") };
  }
  if (body.mutationCapability == null || body.mutationCapability === "") return capabilityFailure("missing");
  if (typeof body.mutationCapability !== "string") {
    return { statusCode: 400, body: publicFailure("invalid-request", "Action payload is invalid.") };
  }
  if (!isMutationCapabilityToken(body.mutationCapability)) return capabilityFailure("invalid");

  let patch: Record<string, unknown>;
  let digestPayload: unknown;
  if (action === "SAVE_DEAL_CONTEXT") {
    if (!isPlainObject(body.dealContext)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Raw dealContext is required.") };
    }
    patch = body.dealContext;
    digestPayload = body.dealContext;
  } else if (action === "SAVE_R1") {
    if (!isPlainObject(body.answers)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Raw R1 answers are required.") };
    }
    patch = { answers: body.answers };
    digestPayload = { answers: body.answers };
  } else if (action === "SAVE_R2") {
    if (body.completed !== true || !isPlainObject(body.answers)
      || (body.respondentContext !== null && !isPlainObject(body.respondentContext))) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw R2 evidence and context are required.") };
    }
    const invite = {
      assessmentSessionId: sessionId,
      acquirerVerificationSessionId: current.mutationCapabilities.find((capability) => capability.role === "R2" && capability.lifecycle !== "revoked")?.respondentId
        || `acqv-${sessionId}`,
      completed: false,
      revoked: false,
    };
    const completed = completeAcquirerVerificationInvite(invite, body.answers, current.updatedAt, body.respondentContext);
    if (!completed.ok || !isResolvedAcquirerVerificationRespondentContext(completed.invite)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw R2 evidence and context are required.") };
    }
    patch = { answers: body.answers, respondentContext: body.respondentContext };
    digestPayload = { answers: body.answers, respondentContext: body.respondentContext, completed: true };
  } else {
    if (body.completed !== true || !isPlainObject(body.answers) || !isPlainObject(body.positioning)) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw Target Self-Assessment input is required.") };
    }
    const boundTargetId = current.mutationCapabilities.find((capability) => capability.role === "TARGET" && capability.lifecycle !== "revoked")?.respondentId ?? null;
    const targetSelfAssessment = buildTargetSelfAssessmentRecord(
      body.positioning,
      body.answers,
      current.updatedAt,
      { targetSessionId: boundTargetId },
    );
    if (!targetSelfAssessment.completed) {
      return { statusCode: 400, body: publicFailure("invalid-request", "Completed raw Target Self-Assessment input is required.") };
    }
    patch = { answers: body.answers, positioning: body.positioning };
    digestPayload = { answers: body.answers, positioning: body.positioning, completed: true };
  }

  const authorized = await authorizeAndSaveRawAssessment({
    sessionId,
    action: action as "SAVE_DEAL_CONTEXT" | "SAVE_R1" | "SAVE_R2" | "SAVE_REPORT_INPUT",
    mutationCapability: body.mutationCapability,
    payloadDigest: currentSemanticMutationDigest(action, digestPayload),
    patch,
    presentedRespondentId: typeof body.respondentId === "string" ? body.respondentId : null,
  });
  if (authorized.status === "missing") return { statusCode: 404, body: publicFailure("unknown-session", "Assessment session was not found.") };
  if (authorized.status === "forbidden") return capabilityFailure("invalid");
  if (authorized.status === "gone") {
    return { statusCode: 410, body: publicFailure("capability-gone", "Mutation capability is expired, revoked, or consumed.") };
  }
  if (authorized.status === "sequencing") {
    return { statusCode: 409, body: publicFailure(authorized.reason, "R2 cannot be stored until server-side R1 exists.") };
  }
  return {
    statusCode: 200,
    body: {
      status: "input-saved",
      sessionId,
      inputRevision: authorized.session.inputRevision,
      reportReady: false,
    },
  };
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
    return {
      statusCode: 201,
      body: {
        status: "session-created",
        sessionId: created.sessionId,
        inputRevision: created.inputRevision,
        reportReady: false,
        mutationCapability: created.mintedMutationSecrets.owner,
        r2MutationCapability: created.mintedMutationSecrets.r2,
        r2RespondentId: created.mintedMutationSecrets.r2RespondentId,
        targetMutationCapability: created.mintedMutationSecrets.target,
        targetRespondentId: created.mintedMutationSecrets.targetRespondentId,
      },
    };
  }
  if (body.action === "MINT_INVITE_CAPABILITY") {
    return mintInviteCapability(body);
  }
  if (SAVE_ACTIONS.has(body.action)) {
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
    return { statusCode: 409, body: stripCapabilitySecrets({ status: "not-report-ready", sessionId, inputRevision: record.inputRevision, reportReady: false }) };
  }
  if (body.authorityId && body.authorityId !== authority.authorityId) {
    return { statusCode: 409, body: publicFailure("stale-authority", "Authority no longer matches the current assessment revision.") };
  }
  return {
    statusCode: 200,
    body: stripCapabilitySecrets({
      status: "report-ready",
      sessionId,
      inputRevision: record.inputRevision,
      authorityId: authority.authorityId,
      reportReady: true,
      projection: toBrowserAuthorizedProjection(record.reportAuthority.projection),
    }),
  };
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
