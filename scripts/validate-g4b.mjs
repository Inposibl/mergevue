import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import { buildFinalDeliverable } from "../src/flow/finalDeliverableFlow.js";
import {
  ACQUISITION_AWARENESS_FIELD,
  ACQUISITION_AWARENESS_VALUES,
  buildTargetSelfAssessmentRecord,
  isTargetSelfAssessmentSourceLoaded,
  scoreTargetSelfAssessment,
  validateTargetSelfPositioning,
} from "../src/flow/targetSelfAssessmentFlow.js";
import {
  attachPreliminaryAssessment,
  canGenerateTargetInvite,
  completeTargetInvite,
  createTargetInvite,
  resetPublicAssessmentSession,
  targetInviteFromLinkParams,
  verifyTargetInvite,
} from "../src/flow/targetInviteFlow.js";
import {
  RELIABILITY_FLAG_OPTIONS,
  evidenceClassifiedAnswer,
  showReliabilityFlagsForGate,
  updateEvidenceAnswer,
  validateEvidenceClassifiedAnswer,
} from "../src/flow/evidenceClassification.js";
import {
  ACQUISITION_FRAMING_CONTAMINATION_FLAG,
  isIllegalReliabilityFlagForSideError,
  scoreLayeredEvidenceQuestionSet,
} from "../src/flow/layeredEvidenceScoring.js";

function completeTrack1Session() {
  return Object.freeze({
    sessionId: "g4b-session",
    dealContext: Object.freeze({
      completed: true,
      data: Object.freeze({
        acquisitionMotive: "management_buyout",
        transactionRole: "partner_md",
        firmTenure: "more_than_3_years",
        integrationTimeline: "standard",
      }),
    }),
    acquirer2A: Object.freeze({
      completed: true,
      score: Object.freeze({ primaryEnvironmentCode: "NT/STJ" }),
    }),
    targetObservation: Object.freeze({
      completed: true,
      score: Object.freeze({ topEnvironmentCode: "NF/NT" }),
      outputContext: Object.freeze({ observationPosition: "Acquirer diligence lead" }),
    }),
    target2B: Object.freeze({
      completed: true,
      finalScore: Object.freeze({
        primaryEnvironmentCode: "NF/NT",
        signalStrength: "confirmed",
      }),
    }),
  });
}

assert.equal(isTargetSelfAssessmentSourceLoaded(), true);
assert.deepEqual(TARGET_SELF_ASSESSMENT_DATA.sources, [
  "ST_Target_Self_Assessment_Module.xlsx",
  "ST_Form_Binding_Prompt.xlsx",
]);
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.worksheet, "3_Screening");
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questionCount, 11);
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.length, 11);
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.every((question) => question.options.length >= 5), true);
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.every((question) => Boolean(question.directObservationGate)), true);
assert.equal(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.every((question) => question.options.some((option) => option.value === "E")), true);

const incompleteSession = Object.freeze({ sessionId: "incomplete" });
const blockedPreliminary = attachPreliminaryAssessment(incompleteSession, "2026-05-01T00:00:00.000Z");
assert.equal(blockedPreliminary.preliminaryAssessment.completed, false);
assert.equal(canGenerateTargetInvite(blockedPreliminary.session), false);

const sessionWithPreliminary = attachPreliminaryAssessment(completeTrack1Session(), "2026-05-01T00:00:00.000Z").session;
assert.equal(sessionWithPreliminary.preliminaryAssessment.completed, true);
assert.equal(canGenerateTargetInvite(sessionWithPreliminary), true);

const inviteResult = createTargetInvite(sessionWithPreliminary, {
  createdAt: "2026-05-01T00:00:00.000Z",
  digitalCode: "123456",
  targetSessionId: "tgt-g4b",
});
assert.equal(inviteResult.ok, true);
assert.equal(inviteResult.invite.digitalCode, "123456");
assert.equal(inviteResult.invite.codeDigits, 6);
assert.equal(inviteResult.invite.ttlHours, 72);
assert.equal(inviteResult.invite.expiresAt, "2026-05-04T00:00:00.000Z");
assert.match(inviteResult.invite.surveyLink, /targetSessionId=tgt-g4b/);
assert.match(inviteResult.invite.surveyLink, /assessmentId=/);
assert.match(inviteResult.invite.surveyLink, /codeHash=/);
assert.match(inviteResult.invite.surveyLink, /expiresAt=/);

const parsedInvite = targetInviteFromLinkParams(new URL(`https://example.com${inviteResult.invite.surveyLink}`).searchParams);
assert.equal(parsedInvite.targetSessionId, "tgt-g4b");
assert.equal(parsedInvite.assessmentId, inviteResult.invite.assessmentId);
assert.equal(verifyTargetInvite(parsedInvite, "123456", "2026-05-01T01:00:00.000Z").status, "verified");
assert.equal(targetInviteFromLinkParams(new URLSearchParams("targetSessionId=tgt-missing")), null);

assert.equal(verifyTargetInvite(inviteResult.invite, "000000", "2026-05-01T01:00:00.000Z").status, "wrong-code");
assert.equal(verifyTargetInvite(inviteResult.invite, "123456", "2026-05-04T00:00:01.000Z").status, "expired");
assert.equal(verifyTargetInvite(inviteResult.invite, "123456", "2026-05-01T01:00:00.000Z").status, "verified");

assert.equal(ACQUISITION_AWARENESS_FIELD.id, "acquisitionAwareness");
assert.equal(ACQUISITION_AWARENESS_FIELD.label, "Awareness of the pending acquisition");
assert.deepEqual(ACQUISITION_AWARENESS_FIELD.options.map((option) => option.value), ["yes", "no", "partial"]);
assert.deepEqual(ACQUISITION_AWARENESS_VALUES, ["yes", "no", "partial"]);

const positioning = { p1: "A", p2: "C", acquisitionAwareness: "no" };
const answers = Object.fromEntries(
  TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.map((question) => [question.id, evidenceClassifiedAnswer("A")]),
);
const targetScore = scoreTargetSelfAssessment(answers);
assert.equal(targetScore.valid, true);
assert.equal(targetScore.answeredQuestionCount, 11);
assert.equal(targetScore.scoringModelVersion, "newlogic-layered-evidence-v1");
assert.equal(targetScore.outputKind, "weighted_signal_pattern");
assert.equal(targetScore.requiresAnalystReview, true);
assert.equal(targetScore.legacyAdditiveScoring, false);
assert.equal(targetScore.confidence, "high");
assert.equal(targetScore.evidenceQuality.legacyOptionOnlyCount, 0);
assert.equal(targetScore.evidenceQuality.directObservationCount, 11);

const targetSelfAssessment = buildTargetSelfAssessmentRecord(positioning, answers, "2026-05-01T01:30:00.000Z");
assert.equal(targetSelfAssessment.completed, true);
assert.equal(targetSelfAssessment.classificationValidation.valid, true);
assert.equal(targetSelfAssessment.positioning.acquisitionAwareness, "no");
assert.equal(targetSelfAssessment.contaminationIndicator.acquisitionAwareness, "no");
assert.equal(targetSelfAssessment.contaminationIndicator.respondentLevelSignal, false);
const completedInvite = completeTargetInvite(inviteResult.invite, targetSelfAssessment, "2026-05-01T01:31:00.000Z").invite;
assert.equal(completedInvite.completed, true);
assert.equal(verifyTargetInvite(completedInvite, "123456", "2026-05-01T01:32:00.000Z").status, "completed");

const directFinalDeliverable = buildFinalDeliverable(Object.freeze({
  ...sessionWithPreliminary,
  targetSelfAssessment,
  targetSelfDirect: Object.freeze({
    completed: true,
    route: "step-2c-direct",
    completedAt: targetSelfAssessment.submittedAt,
  }),
}));
assert.equal(directFinalDeliverable.ready, true);

const invitedFinalDeliverable = buildFinalDeliverable(Object.freeze({
  ...inviteResult.session,
  targetInvite: completedInvite,
  targetSelfAssessment,
}));
assert.equal(invitedFinalDeliverable.ready, true);

const missingTargetSelfFinalDeliverable = buildFinalDeliverable(sessionWithPreliminary);
assert.equal(missingTargetSelfFinalDeliverable.ready, false);
assert.equal(missingTargetSelfFinalDeliverable.status, "target-self-assessment-required");

const incompleteTargetSelfFinalDeliverable = buildFinalDeliverable(Object.freeze({
  ...sessionWithPreliminary,
  targetInvite: Object.freeze({ completed: true }),
  targetSelfAssessment: Object.freeze({ completed: false }),
}));
assert.equal(incompleteTargetSelfFinalDeliverable.ready, false);
assert.equal(incompleteTargetSelfFinalDeliverable.status, "target-self-assessment-required");

const directMarkerOnlyFinalDeliverable = buildFinalDeliverable(Object.freeze({
  ...sessionWithPreliminary,
  targetSelfDirect: Object.freeze({ completed: true }),
}));
assert.equal(directMarkerOnlyFinalDeliverable.ready, false);
assert.equal(directMarkerOnlyFinalDeliverable.status, "target-self-assessment-required");

const inviteMarkerOnlyFinalDeliverable = buildFinalDeliverable(Object.freeze({
  ...sessionWithPreliminary,
  targetInvite: Object.freeze({ completed: true }),
}));
assert.equal(inviteMarkerOnlyFinalDeliverable.ready, false);
assert.equal(inviteMarkerOnlyFinalDeliverable.status, "target-self-assessment-required");

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
assert.match(appSource, /function TargetReceiptScreen\(\{ invited = false, session = null \}\)[\s\S]*const finalDeliverable = buildFinalDeliverable\(session\);[\s\S]*Go to final report page[\s\S]*navigate\(finalDeliverable\.route\)/);
assert.match(appSource, /function TargetSelfAssessmentSurvey\(\{ session, setSession, invite = null \}\)[\s\S]*setSession\(nextSession\);[\s\S]*const finalDeliverable = buildFinalDeliverable\(nextSession\);[\s\S]*if \(finalDeliverable\.ready\) \{[\s\S]*navigate\(finalDeliverable\.route\);[\s\S]*return;[\s\S]*\}[\s\S]*setReceipt\(true\);/);
assert.match(appSource, /ACQUISITION_AWARENESS_FIELD/);
assert.match(appSource, /label=\{ACQUISITION_AWARENESS_FIELD\.label\}/);
assert.match(appSource, /options=\{ACQUISITION_AWARENESS_FIELD\.options\}/);
assert.doesNotMatch(appSource, /acquisitionAwareness:\s*"(yes|no|partial)"/);
assert.match(appSource, /function applyTargetContaminationSelfDeclaration\(answer, enabled\)/);
assert.match(appSource, /function TargetContaminationSelfDeclarationControl\(\{ answer, onChange \}\)/);
assert.match(appSource, /The pending acquisition may be influencing this answer\./);
assert.match(appSource, /Use this if you think the deal context may be colouring your perception\./);
assert.equal([...appSource.matchAll(/<TargetContaminationSelfDeclarationControl/g)].length, 1);
assert.match(
  appSource,
  /function TargetSelfAssessmentSurvey[\s\S]*<TargetContaminationSelfDeclarationControl[\s\S]*function TargetSelfAssessmentDirectScreen/,
);
assert.match(appSource, /const showReliabilityFlags = showReliabilityFlagsForGate\(normalized\.directObservationGate\)/);
assert.equal(showReliabilityFlagsForGate("yes"), false);
assert.equal(showReliabilityFlagsForGate("no"), true);

const tsamSurveySource = appSource.slice(
  appSource.indexOf("function TargetSelfAssessmentSurvey"),
  appSource.indexOf("function TargetSelfAssessmentDirectScreen"),
);
assert.match(tsamSurveySource, /<TargetContaminationSelfDeclarationControl/);
assert.match(tsamSurveySource, /excludeReliabilityFlags=\{\[TARGET_CONTAMINATION_SELF_DECLARATION_FLAG\]\}/);
assert.match(
  appSource.slice(
    appSource.indexOf("function TargetContaminationSelfDeclarationControl"),
    appSource.indexOf("function EvidenceClassificationPanel"),
  ),
  /TARGET_CONTAMINATION_SELF_DECLARATION_LABEL/,
);

const acquirerSurveySource = appSource.slice(
  appSource.indexOf("function AcquirerModuleScreen"),
  appSource.indexOf("function AcquirerSubmitScreen"),
);
assert.doesNotMatch(acquirerSurveySource, /TargetContaminationSelfDeclarationControl/);
assert.doesNotMatch(acquirerSurveySource, /The pending acquisition may be influencing this answer\./);

assert.ok(RELIABILITY_FLAG_OPTIONS.some((option) => option.value === ACQUISITION_FRAMING_CONTAMINATION_FLAG));
assert.match(
  appSource,
  /const NON_TARGET_EXCLUDED_RELIABILITY_FLAGS = Object\.freeze\(\[TARGET_CONTAMINATION_SELF_DECLARATION_FLAG\]\)/,
);
assert.match(
  appSource,
  /excludeReliabilityFlags = NON_TARGET_EXCLUDED_RELIABILITY_FLAGS/,
);

function appFunctionSource(startName, endName) {
  const start = appSource.indexOf(`function ${startName}`);
  const end = appSource.indexOf(`function ${endName}`);
  assert.ok(start >= 0, `missing function ${startName}`);
  assert.ok(end > start, `missing or unordered function ${endName} after ${startName}`);
  return appSource.slice(start, end);
}

function assertNonTargetSurfaceExcludesContamination(label, source) {
  assert.match(source, /<EvidenceClassificationPanel/, `${label} must use EvidenceClassificationPanel`);
  assert.doesNotMatch(source, /TargetContaminationSelfDeclarationControl/, `${label} must not render the Target contamination control`);
  assert.doesNotMatch(source, /The pending acquisition may be influencing this answer\./, `${label} must not expose Target contamination copy`);
  assert.doesNotMatch(source, /excludeReliabilityFlags=\{\[\]\}/, `${label} must not override the non-target exclusion`);
}

assertNonTargetSurfaceExcludesContamination("AcquirerModuleScreen", acquirerSurveySource);
assertNonTargetSurfaceExcludesContamination(
  "AcquirerVerificationQuestionnaire",
  appFunctionSource("AcquirerVerificationQuestionnaire", "AuthorizedAcquirerVerificationScreen"),
);
assertNonTargetSurfaceExcludesContamination(
  "TargetObservationQuestionnaire",
  appFunctionSource("TargetObservationQuestionnaire", "ReadOnlyTargetObservationReview"),
);
assertNonTargetSurfaceExcludesContamination(
  "TargetObserverDiagnosticSurvey",
  appFunctionSource("TargetObserverDiagnosticSurvey", "AuthorizedTargetObservationSetupScreen"),
);
assertNonTargetSurfaceExcludesContamination(
  "Step2BLevel1Screen",
  appFunctionSource("Step2BLevel1Screen", "Step2BTransitionScreen"),
);
assertNonTargetSurfaceExcludesContamination(
  "Step2BLevel2Screen",
  appFunctionSource("Step2BLevel2Screen", "targetSelfFieldLabel"),
);

function applyTargetContaminationSelfDeclaration(answer, enabled) {
  const currentFlags = Array.isArray(answer?.reliabilityFlags) ? answer.reliabilityFlags : [];
  const nextFlags = currentFlags.filter((flag) => flag !== ACQUISITION_FRAMING_CONTAMINATION_FLAG);
  if (enabled) nextFlags.push(ACQUISITION_FRAMING_CONTAMINATION_FLAG);
  return updateEvidenceAnswer(answer, {
    reliabilityFlags: nextFlags,
    reliabilityFlagsAcknowledged: nextFlags.length > 0 ? true : answer.reliabilityFlagsAcknowledged,
  });
}

const firstQuestion = TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions[0];
const gateYesClean = evidenceClassifiedAnswer("A");
assert.equal(validateEvidenceClassifiedAnswer(gateYesClean).valid, true);
assert.deepEqual([...gateYesClean.reliabilityFlags], []);
const gateYesDeclared = applyTargetContaminationSelfDeclaration(gateYesClean, true);
assert.equal(validateEvidenceClassifiedAnswer(gateYesDeclared).valid, true);
assert.deepEqual([...gateYesDeclared.reliabilityFlags], [ACQUISITION_FRAMING_CONTAMINATION_FLAG]);
const gateYesCleared = applyTargetContaminationSelfDeclaration(gateYesDeclared, false);
assert.equal(validateEvidenceClassifiedAnswer(gateYesCleared).valid, true);
assert.deepEqual([...gateYesCleared.reliabilityFlags], []);

const withUnrelated = updateEvidenceAnswer(evidenceClassifiedAnswer("A", { directObservationGate: "no", evidenceType: "inference", knowledgeLevel: "pattern_based", confidence: "medium" }), {
  reliabilityFlags: ["socially_desirable"],
  reliabilityFlagsAcknowledged: true,
});
const withUnrelatedAndContamination = applyTargetContaminationSelfDeclaration(withUnrelated, true);
assert.deepEqual([...withUnrelatedAndContamination.reliabilityFlags].sort(), [ACQUISITION_FRAMING_CONTAMINATION_FLAG, "socially_desirable"].sort());
const unrelatedPreserved = applyTargetContaminationSelfDeclaration(withUnrelatedAndContamination, false);
assert.deepEqual([...unrelatedPreserved.reliabilityFlags], ["socially_desirable"]);

const gateCycled = updateEvidenceAnswer(
  updateEvidenceAnswer(applyTargetContaminationSelfDeclaration(evidenceClassifiedAnswer("A"), true), { directObservationGate: "no" }),
  { directObservationGate: "yes" },
);
assert.deepEqual([...gateCycled.reliabilityFlags], [ACQUISITION_FRAMING_CONTAMINATION_FLAG]);

const declaredAnswers = Object.fromEntries(
  TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.map((question) => [question.id, evidenceClassifiedAnswer("A")]),
);
declaredAnswers[firstQuestion.id] = applyTargetContaminationSelfDeclaration(declaredAnswers[firstQuestion.id], true);
const declaredRecord = buildTargetSelfAssessmentRecord(
  { p1: "A", p2: "C", acquisitionAwareness: "no" },
  declaredAnswers,
  "2026-05-01T01:33:00.000Z",
);
assert.equal(declaredRecord.completed, true);
assert.equal(declaredRecord.classificationValidation.valid, true);
const declaredResponses = declaredRecord.score.questionResponses.filter((entry) => !entry.missing);
const contaminatedResponses = declaredResponses.filter((entry) => entry.reliabilityFlags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG));
assert.equal(contaminatedResponses.length, 1);
assert.equal(contaminatedResponses[0].questionId, firstQuestion.id);
assert.equal(contaminatedResponses[0].excludedFromPrimaryScoring, true);
assert.equal(contaminatedResponses[0].weight, 0);
assert.ok(contaminatedResponses[0].primaryExclusionReasons.includes("contamination_flagged"));

const tenureAnswers = Object.fromEntries(
  TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.map((question) => [
    question.id,
    applyTargetContaminationSelfDeclaration(evidenceClassifiedAnswer("A"), true),
  ]),
);
const tenureRecord = buildTargetSelfAssessmentRecord(
  { p1: "A", p2: "A", acquisitionAwareness: "no" },
  tenureAnswers,
  "2026-05-01T01:34:00.000Z",
);
assert.equal(tenureRecord.completed, true);
for (const entry of tenureRecord.score.questionResponses.filter((item) => !item.missing)) {
  assert.equal(entry.reliabilityFlags.filter((flag) => flag === ACQUISITION_FRAMING_CONTAMINATION_FLAG).length, 1);
}

const injectedContamination = applyTargetContaminationSelfDeclaration(evidenceClassifiedAnswer("A"), true);
const targetAcceptedScore = scoreLayeredEvidenceQuestionSet([firstQuestion], {
  [firstQuestion.id]: injectedContamination,
}, { respondentSide: "target", moduleId: "target_self_assessment" });
assert.equal(targetAcceptedScore.questionResponses[0].reliabilityFlags.includes(ACQUISITION_FRAMING_CONTAMINATION_FLAG), true);
assert.equal(targetAcceptedScore.questionResponses[0].excludedFromPrimaryScoring, true);

let acquirerInjectedError = null;
try {
  scoreLayeredEvidenceQuestionSet([firstQuestion], {
    [firstQuestion.id]: injectedContamination,
  }, { respondentSide: "acquirer", moduleId: "acquirer_environment" });
} catch (error) {
  acquirerInjectedError = error;
}
assert.equal(isIllegalReliabilityFlagForSideError(acquirerInjectedError), true);
assert.equal(acquirerInjectedError.side, "acquirer");

let observerInjectedError = null;
try {
  scoreLayeredEvidenceQuestionSet([firstQuestion], {
    [firstQuestion.id]: injectedContamination,
  }, { respondentSide: "", moduleId: "target_observed_environment" });
} catch (error) {
  observerInjectedError = error;
}
assert.equal(isIllegalReliabilityFlagForSideError(observerInjectedError), true);

const otherPositioningMissingText = validateTargetSelfPositioning({ p1: "D", p2: "C", acquisitionAwareness: "no" });
assert.equal(otherPositioningMissingText.valid, false);
assert.deepEqual(otherPositioningMissingText.missing, ["p1OtherSpecify"]);
const otherPositioning = validateTargetSelfPositioning({ p1: "D", p1OtherSpecify: "Operating partner", p2: "C", acquisitionAwareness: "no" });
assert.equal(otherPositioning.valid, true);
assert.equal(otherPositioning.normalized.p1OtherSpecify, "Operating partner");
assert.equal(otherPositioning.normalized.acquisitionAwareness, "no");

const omittedAwareness = validateTargetSelfPositioning({ p1: "A", p2: "C" });
assert.equal(omittedAwareness.valid, false);
assert.deepEqual(omittedAwareness.missing, ["acquisitionAwareness"]);
assert.deepEqual(omittedAwareness.invalid, []);

const invalidAwareness = validateTargetSelfPositioning({ p1: "A", p2: "C", acquisitionAwareness: "maybe" });
assert.equal(invalidAwareness.valid, false);
assert.deepEqual(invalidAwareness.missing, []);
assert.deepEqual(invalidAwareness.invalid, ["acquisitionAwareness"]);
assert.equal(Object.hasOwn(invalidAwareness.normalized, "acquisitionAwareness"), false);

const resetSession = resetPublicAssessmentSession(inviteResult.session, "2026-05-01T02:00:00.000Z");
assert.equal(resetSession.invalidatedInvite.revoked, true);
assert.equal(verifyTargetInvite(resetSession.invalidatedInvite, "123456", "2026-05-01T02:01:00.000Z").status, "revoked");
assert.notEqual(resetSession.sessionId, inviteResult.session.sessionId);

console.log("G-4b target link/code isolation smoke test passed");
