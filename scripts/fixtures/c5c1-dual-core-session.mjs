import {
  attachAcquirerVerificationCompletion,
  completeAcquirerVerificationInvite,
  createAcquirerVerificationInvite,
} from "../../src/flow/acquirerTrackFlow.js";
import {
  C5C_DEFAULT_CANDIDATE_PAIR,
  buildC5CSelectedSession,
} from "./c5c-selected-session.mjs";

export const C5C1_DUAL_CORE_SESSION_ID = "c5c1-dual-core-session";
export const C5C1_DUAL_CORE_R2_SESSION_ID = "c5c1-dual-core-r2-session";
export const C5C1_INVITE_CREATED_AT = "2026-08-28T12:00:00.000Z";
export const C5C1_INVITE_EXPIRES_AT = "2026-08-31T12:00:00.000Z";
export const C5C1_COMPLETED_AT = "2026-08-28T12:05:00.000Z";

export function buildC5C1DualCoreSession({
  sessionId = C5C1_DUAL_CORE_SESSION_ID,
  verificationSessionId = C5C1_DUAL_CORE_R2_SESSION_ID,
  candidatePair = C5C_DEFAULT_CANDIDATE_PAIR,
} = {}) {
  const primarySession = buildC5CSelectedSession({
    sessionId,
    candidatePair,
    respondentSeniority: "c_suite_founder",
    respondentRole: "deal_lead",
  });
  const inviteResult = createAcquirerVerificationInvite(primarySession, {
    createdAt: C5C1_INVITE_CREATED_AT,
    expiresAt: C5C1_INVITE_EXPIRES_AT,
    digitalCode: "123456",
    assessmentSessionId: sessionId,
    acquirerVerificationSessionId: verificationSessionId,
  });
  if (inviteResult.ok !== true) {
    throw new Error(`C5-C.1 fixture invite failed: ${String(inviteResult.reason)}`);
  }

  const completionResult = completeAcquirerVerificationInvite(
    inviteResult.invite,
    primarySession.acquirer2A.answers,
    C5C1_COMPLETED_AT,
    {
      firmTenure: "more_than_3_years",
      respondentSeniority: "c_suite_founder",
      respondentRole: "integration_lead",
    },
  );
  if (completionResult.ok !== true) {
    throw new Error(`C5-C.1 fixture completion failed: ${String(completionResult.reason)}`);
  }

  const completedSession = attachAcquirerVerificationCompletion(
    inviteResult.session,
    completionResult.invite,
  );
  if (
    completedSession.acquirer2A?.completed !== true
    || completedSession.acquirerVerification?.completed !== true
    || completedSession.acquirer2A?.score?.verificationIncluded !== true
  ) {
    throw new Error("C5-C.1 fixture did not reach lawful dual completion");
  }
  return completedSession;
}
