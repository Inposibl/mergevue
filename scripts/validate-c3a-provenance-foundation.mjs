import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

import { ACQUIRER_TRACK_DATA } from "../src/data/acquirerTrackData.js";
import { TARGET_DIAGNOSTIC_DATA } from "../src/data/targetDiagnosticData.js";
import { TARGET_OBSERVATION_DIAGNOSTIC } from "../src/data/targetObservedEnvironmentDiagnostic.js";
import { TARGET_SELF_ASSESSMENT_DATA } from "../src/data/targetSelfAssessmentData.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import {
  attachAcquirerModuleResult,
  attachAcquirerVerificationCompletion,
  completeAcquirerVerificationInvite,
  createAcquirerVerificationInvite,
  scoreAcquirerModule,
  scoreCombinedAcquirerModule,
} from "../src/flow/acquirerTrackFlow.js";
import {
  attachTargetDiagnosticLevel1,
  scoreTargetDiagnosticLevel1,
  scoreTargetDiagnosticQuestions,
} from "../src/flow/targetDiagnosticFlow.js";
import {
  hashObservationSetupCode,
  scoreTargetObservation,
} from "../src/flow/targetObservationFlow.js";
import {
  buildTargetSelfAssessmentRecord,
  scoreTargetSelfAssessment,
} from "../src/flow/targetSelfAssessmentFlow.js";
import { createHiddenUserAnswersSnapshot } from "../src/reporting/hiddenUserAnswersSnapshot.js";
import {
  createServerTargetSession,
  getSession,
  saveTargetObservationCompletion,
} from "../src/server/_sessionLedger.ts";

let submitTarget2cHandlerPromise;

function loadSubmitTarget2cHandler() {
  if (!submitTarget2cHandlerPromise) {
    register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (typeof specifier === "string" && specifier.includes("/src/server/") && specifier.endsWith(".js")) {
    return nextResolve(specifier.replace(/\\.js$/, ".ts"), context);
  }
  return nextResolve(specifier, context);
}
`)}`);
    submitTarget2cHandlerPromise = import("../api/submit-target-2c.ts").then((module) => module.default);
  }
  return submitTarget2cHandlerPromise;
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const questionnaires = JSON.parse(
  readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url), "utf8"),
);
const scoringSource = readFileSync(new URL("../src/flow/layeredEvidenceScoring.js", import.meta.url), "utf8");
const publicReportSource = readFileSync(
  new URL("../src/reporting/mergevuePublicReportModel.js", import.meta.url),
  "utf8",
);
const publicDesignSource = readFileSync(
  new URL("../src/reporting/mergevueForecastBriefDesignRenderer.js", import.meta.url),
  "utf8",
);
const hiddenAuditSource = readFileSync(
  new URL("../src/reporting/hiddenUserAnswersSnapshot.js", import.meta.url),
  "utf8",
);

const SUBSTANTIVE_MODULE_IDS = Object.freeze([
  "acquirerEnvironment",
  "targetSelfAssessment",
  "environmentLevel1",
  "environmentLevel2",
  "targetObservedEnvironment",
]);
const PROVENANCE_FIELDS = Object.freeze([
  "canonicalQuestionId",
  "workbookQuestionId",
  "questionModuleId",
  "sourceWorkbook",
  "sourceSheet",
  "sourceRow",
  "respondentSlot",
  "respondentIdentityStatus",
]);
const WORKFLOW_IDENTITY_ALIASES = Object.freeze(["primary", "verification"]);

const results = [];

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function generatedModule(id) {
  const module = questionnaires.modules.find((item) => item.id === id);
  assert.ok(module, `generated module missing: ${id}`);
  return module;
}

function generatedLocalId(question) {
  return question.workbookQuestionId ?? question.id;
}

function normalize(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function runtimeModules() {
  return Object.freeze([
    Object.freeze({
      id: "acquirerEnvironment",
      questions: ACQUIRER_TRACK_DATA.acquirerModule.questions,
    }),
    Object.freeze({
      id: "targetSelfAssessment",
      questions: TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions,
    }),
    Object.freeze({
      id: "environmentLevel1",
      questions: TARGET_DIAGNOSTIC_DATA.level1.questions,
    }),
    Object.freeze({
      id: "environmentLevel2",
      questions: TARGET_DIAGNOSTIC_DATA.level2.questions,
    }),
    Object.freeze({
      id: "targetObservedEnvironment",
      questions: TARGET_OBSERVATION_DIAGNOSTIC.questions,
    }),
  ]);
}

function allRuntimeQuestions() {
  return runtimeModules().flatMap((module) => module.questions);
}

function answersFor(questions, value = "A") {
  return Object.fromEntries(questions.map((question) => [question.id, evidenceClassifiedAnswer(value)]));
}

function semanticScoreView(score) {
  return Object.freeze({
    valid: score.valid,
    missingQuestionIds: [...(score.missingQuestionIds ?? [])],
    answeredQuestionCount: score.answeredQuestionCount,
    questionCount: score.questionCount,
    effectiveAnswerCount: score.effectiveAnswerCount,
    excludedAnswerCount: score.excludedAnswerCount,
    totalEvidenceWeight: score.totalEvidenceWeight,
    environmentScores: { ...(score.environmentScores ?? {}) },
    weightedEnvironmentScores: { ...(score.weightedEnvironmentScores ?? {}) },
    rankedEnvironments: (score.rankedEnvironments ?? []).map((row) => ({ code: row.code, score: row.score })),
    primaryEnvironmentCode: score.primaryEnvironmentCode,
    primarySignalScore: score.primarySignalScore,
    secondaryEnvironmentCode: score.secondaryEnvironmentCode,
    secondarySignalScore: score.secondarySignalScore,
    coPresence: score.coPresence,
    signalStrength: score.signalStrength,
    confidence: score.confidence,
    evidenceQuality: Object.freeze({
      confidence: score.evidenceQuality?.confidence,
      directObservationCount: score.evidenceQuality?.directObservationCount,
      documentSupportedCount: score.evidenceQuality?.documentSupportedCount,
      reliabilityFlagCount: score.evidenceQuality?.reliabilityFlagCount,
      legacyOptionOnlyCount: score.evidenceQuality?.legacyOptionOnlyCount,
    }),
    responseWeights: (score.questionResponses ?? []).map((response) => Object.freeze({
      questionId: response.questionId,
      selectedOption: response.selectedOption,
      weight: response.weight,
      excludedFromPrimaryScoring: response.excludedFromPrimaryScoring,
      signalCodes: [...(response.signalCodes ?? [])],
    })),
  });
}

function assertQuestionResponseProvenance(response, question, label) {
  assert.equal(response.questionId, question.id, `${label}: local questionId must remain the runtime alias`);
  assert.equal(response.workbookQuestionId, question.workbookQuestionId, `${label}: workbookQuestionId`);
  assert.equal(response.canonicalQuestionId, question.canonicalQuestionId, `${label}: canonicalQuestionId`);
  assert.equal(response.questionModuleId, question.moduleId, `${label}: questionModuleId must come from the question, not score.moduleId`);
  assert.equal(response.sourceWorkbook, question.sourceWorkbook, `${label}: sourceWorkbook`);
  assert.equal(response.sourceSheet, question.sourceSheet, `${label}: sourceSheet`);
  assert.equal(response.sourceRow, question.sourceRow, `${label}: sourceRow`);
  assert.notEqual(response.canonicalQuestionId, response.questionId, `${label}: canonical identity must not collapse onto the local alias`);
  assert.notEqual(
    response.questionModuleId,
    undefined,
    `${label}: questionModuleId required`,
  );
}

function assertResolvedRespondent(response, expectedId, expectedSlot, label) {
  assert.equal(response.respondentId, expectedId, `${label}: respondentId`);
  assert.equal(response.respondentSlot, expectedSlot, `${label}: respondentSlot`);
  assert.equal(response.respondentIdentityStatus, "RESOLVED", `${label}: status`);
  assert.equal(WORKFLOW_IDENTITY_ALIASES.includes(response.respondentId), false, `${label}: alias is not respondentId`);
}

function assertUnresolvedRespondent(response, label) {
  assert.equal(response.respondentId, null, `${label}: unresolved respondentId must be null`);
  assert.equal(response.respondentIdentityStatus, "UNRESOLVED", `${label}: status`);
  assert.equal(response.respondentId === "primary", false, `${label}: must not fabricate primary`);
  assert.equal(response.respondentId === "verification", false, `${label}: must not fabricate verification`);
  assert.equal(response.respondentId === "respondent-1", false, `${label}: must not fabricate respondent-1`);
}

function npmRun(script) {
  const spawned = spawnSync("npm", ["run", script], { cwd: ROOT, encoding: "utf8" });
  const output = `${spawned.stdout ?? ""}\n${spawned.stderr ?? ""}`;
  assert.equal(spawned.status, 0, `${script} failed:\n${output}`);
  return output;
}

async function checkAsync(id, label, fn) {
  await fn();
  results.push({ id, label, status: "PASS" });
}

const OBSERVER_SETUP = Object.freeze({
  observationPosition: "Acquirer diligence lead",
  targetExposureDuration: "2_to_6_months",
  targetAccessLevel: "site_or_team_sessions",
  observedActorLevel: "senior_leadership",
  observationEvidenceBasis: "repeated_workshops",
  integrationTimeline: "Pre-signing diligence",
});

const TSAM_POSITIONING = Object.freeze({
  p1: "A",
  p2: "C",
  acquisitionAwareness: "no",
});

function assertScoreRespondentIdentity(score, expectedId, label) {
  assert.ok(score && Array.isArray(score.questionResponses) && score.questionResponses.length > 0, `${label}: score.questionResponses missing`);
  for (const response of score.questionResponses) {
    assertResolvedRespondent(response, expectedId, null, `${label} ${response.questionId}`);
  }
}

async function persistAuthorizedObserverCompletion(observationSessionId, assessmentSessionId) {
  const digitalCode = "123456";
  const result = await saveTargetObservationCompletion({
    assessmentSessionId,
    observationSessionId,
    digitalCode,
    codeHash: hashObservationSetupCode(digitalCode, observationSessionId, assessmentSessionId),
    setup: OBSERVER_SETUP,
    answers: answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions),
    targetDiagnostic: {
      level1Answers: answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions),
      level2Answers: answersFor(TARGET_DIAGNOSTIC_DATA.level2.questions),
    },
  });
  assert.equal(result.ok, true, `saveTargetObservationCompletion failed: ${result.status ?? "unknown"}`);
  return result;
}

function findMatchingClose(source, openIndex, openChar = "(", closeChar = ")") {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\" && quote !== "`") {
        index += 1;
        continue;
      }
      if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === "\"" || character === "`") {
      quote = character;
      continue;
    }
    if (character === openChar) depth += 1;
    else if (character === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function productionTsamClientCall() {
  const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const callee = "buildTargetSelfAssessmentRecord(";
  const start = appSource.indexOf(callee);
  assert.notEqual(start, -1, "App.jsx must call buildTargetSelfAssessmentRecord");
  assert.equal(appSource.indexOf(callee, start + callee.length), -1, "App.jsx must have exactly one production TSAM builder call");
  const open = start + callee.length - 1;
  const close = findMatchingClose(appSource, open);
  assert.notEqual(close, -1, "App.jsx TSAM builder call is unclosed");
  return appSource.slice(start, close + 1);
}

check("C3A-01", "Runtime questionnaire records carry globally unique canonical identity", () => {
  const generatedCanonicalIds = [];
  const runtimeCanonicalIds = [];

  for (const moduleId of SUBSTANTIVE_MODULE_IDS) {
    const generated = generatedModule(moduleId);
    const runtime = runtimeModules().find((module) => module.id === moduleId);
    assert.ok(runtime, `runtime module missing: ${moduleId}`);
    assert.equal(runtime.questions.length, generated.questions.length, `${moduleId}: question count`);

    for (const generatedQuestion of generated.questions) {
      const localId = generatedLocalId(generatedQuestion);
      const runtimeQuestion = runtime.questions.find((question) => question.id === localId);
      assert.ok(runtimeQuestion, `${moduleId} ${localId}: runtime question missing`);
      assert.equal(runtimeQuestion.canonicalQuestionId, generatedQuestion.id, `${moduleId} ${localId}: canonicalQuestionId must come from generated Question.id`);
      assert.equal(runtimeQuestion.workbookQuestionId, generatedQuestion.workbookQuestionId ?? generatedQuestion.id, `${moduleId} ${localId}: workbookQuestionId`);
      assert.equal(runtimeQuestion.moduleId, moduleId, `${moduleId} ${localId}: module identity`);
      assert.ok(runtimeQuestion.canonicalQuestionId, `${moduleId} ${localId}: canonicalQuestionId required`);
      assert.ok(runtimeQuestion.workbookQuestionId, `${moduleId} ${localId}: workbookQuestionId required`);
      generatedCanonicalIds.push(generatedQuestion.id);
      runtimeCanonicalIds.push(runtimeQuestion.canonicalQuestionId);
    }
  }

  assert.equal(new Set(generatedCanonicalIds).size, generatedCanonicalIds.length, "generated canonical IDs must be unique globally");
  assert.equal(new Set(runtimeCanonicalIds).size, runtimeCanonicalIds.length, "runtime canonical IDs must be unique globally");
});

check("C3A-02", "67 substantive questionnaire membership, prompt text, and option text/order are unchanged", () => {
  const generatedQuestions = SUBSTANTIVE_MODULE_IDS.flatMap((moduleId) => generatedModule(moduleId).questions);
  const runtimeQuestions = allRuntimeQuestions();
  assert.equal(generatedQuestions.length, 67, "generated substantive membership must remain 67");
  assert.equal(runtimeQuestions.length, 67, "runtime substantive membership must remain 67");

  for (const moduleId of SUBSTANTIVE_MODULE_IDS) {
    const generated = generatedModule(moduleId).questions;
    const runtime = runtimeModules().find((module) => module.id === moduleId).questions;
    assert.equal(runtime.length, generated.length, `${moduleId}: membership`);
    generated.forEach((generatedQuestion, index) => {
      const runtimeQuestion = runtime[index];
      assert.equal(runtimeQuestion.id, generatedLocalId(generatedQuestion), `${moduleId}[${index}]: local id/order`);
      assert.equal(normalize(runtimeQuestion.text), normalize(generatedQuestion.prompt), `${moduleId} ${runtimeQuestion.id}: prompt`);
      assert.equal(runtimeQuestion.options.length, generatedQuestion.options.length, `${moduleId} ${runtimeQuestion.id}: option count`);
      generatedQuestion.options.forEach((generatedOption, optionIndex) => {
        const runtimeOption = runtimeQuestion.options[optionIndex];
        assert.equal(runtimeOption.value, generatedOption.value, `${moduleId} ${runtimeQuestion.id}: option order ${generatedOption.value}`);
        assert.equal(normalize(runtimeOption.text), normalize(generatedOption.text), `${moduleId} ${runtimeQuestion.id}-${generatedOption.value}: option text`);
      });
    });
  }
});

check("C3A-03", "Legacy answer-map keys / local question IDs remain unchanged", () => {
  const aemQ1 = ACQUIRER_TRACK_DATA.acquirerModule.questions.find((question) => question.id === "Q1");
  const tsamQ1 = TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions.find((question) => question.id === "Q1");
  const el1Q1 = TARGET_DIAGNOSTIC_DATA.level1.questions.find((question) => question.id === "Q1");
  assert.ok(aemQ1 && tsamQ1 && el1Q1, "local Q1 aliases must remain");
  assert.equal(aemQ1.id, "Q1");
  assert.equal(tsamQ1.id, "Q1");
  assert.equal(el1Q1.id, "Q1");
  assert.notEqual(aemQ1.canonicalQuestionId, tsamQ1.canonicalQuestionId);
  assert.notEqual(aemQ1.canonicalQuestionId, el1Q1.canonicalQuestionId);
  assert.notEqual(tsamQ1.canonicalQuestionId, el1Q1.canonicalQuestionId);
  assert.equal(aemQ1.canonicalQuestionId, generatedModule("acquirerEnvironment").questions.find((question) => generatedLocalId(question) === "Q1").id);
  assert.equal(tsamQ1.canonicalQuestionId, generatedModule("targetSelfAssessment").questions.find((question) => generatedLocalId(question) === "Q1").id);
  assert.equal(el1Q1.canonicalQuestionId, generatedModule("environmentLevel1").questions.find((question) => generatedLocalId(question) === "Q1").id);

  const answers = { Q1: evidenceClassifiedAnswer("A") };
  const aemScore = scoreAcquirerModule(answers);
  assert.equal(aemScore.questionResponses[0].questionId, "Q1");
  assert.ok(Object.hasOwn(answers, "Q1"), "answer-map key Q1 must remain");
  assert.equal(Object.hasOwn(answers, aemQ1.canonicalQuestionId), false, "answers must not be re-keyed to canonical IDs");
});

check("C3A-04", "Every produced questionResponse carries question identity provenance", () => {
  const aem = scoreAcquirerModule(answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions));
  const tsam = scoreTargetSelfAssessment(answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions));
  const el1 = scoreTargetDiagnosticLevel1(answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions));
  const el2 = scoreTargetDiagnosticQuestions(TARGET_DIAGNOSTIC_DATA.level2.questions, answersFor(TARGET_DIAGNOSTIC_DATA.level2.questions));
  const tod = scoreTargetObservation(answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions));
  const pairs = [
    [aem, ACQUIRER_TRACK_DATA.acquirerModule.questions, "AEM"],
    [tsam, TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions, "TSAM"],
    [el1, TARGET_DIAGNOSTIC_DATA.level1.questions, "EL1"],
    [el2, TARGET_DIAGNOSTIC_DATA.level2.questions, "EL2"],
    [tod, TARGET_OBSERVATION_DIAGNOSTIC.questions, "TED"],
  ];
  for (const [score, questions, label] of pairs) {
    assert.equal(score.questionResponses.length, questions.length, `${label}: response count`);
    score.questionResponses.forEach((response, index) => {
      assertQuestionResponseProvenance(response, questions[index], `${label} ${questions[index].id}`);
    });
  }
});

check("C3A-05", "AEM primary response preserves the physical session identity, not literal primary", () => {
  const session = Object.freeze({ sessionId: "aem-session-r1" });
  const attached = attachAcquirerModuleResult(session, answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions));
  const response = attached.score.questionResponses.find((item) => item.questionId === "Q1");
  assert.ok(response, "AEM Q1 response missing");
  assertResolvedRespondent(response, "aem-session-r1", "primary", "AEM R1");
  assert.equal(response.canonicalQuestionId, "ACQUIRERENVIRONMENT-Q1");
  assert.equal(response.questionModuleId, "acquirerEnvironment");
  assert.notEqual(attached.score.moduleId, response.questionModuleId);
});

check("C3A-06", "AEM verification response preserves acquirerVerificationSessionId, not literal verification", () => {
  const weakAnswers = Object.fromEntries(
    ACQUIRER_TRACK_DATA.acquirerModule.questions.map((question) => [
      question.id,
      evidenceClassifiedAnswer("A", {
        directObservationGate: "no",
        evidenceType: "inference",
        knowledgeLevel: "pattern_based",
        confidence: "low",
        reliabilityFlags: ["no_direct_knowledge"],
        reliabilityFlagsAcknowledged: true,
      }),
    ]),
  );
  const weakPrimary = attachAcquirerModuleResult({ sessionId: "aem-session-r1" }, weakAnswers).session;
  const inviteResult = createAcquirerVerificationInvite(weakPrimary, {
    createdAt: "2026-05-01T00:00:00.000Z",
    digitalCode: "123456",
    acquirerVerificationSessionId: "acqv-physical-r2",
    assessmentSessionId: "aem-session-r1",
  });
  assert.equal(inviteResult.ok, true, "verification invite must be creatable from a weak primary");
  const completion = completeAcquirerVerificationInvite(
    inviteResult.invite,
    answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions),
    "2026-05-01T01:00:00.000Z",
  );
  assert.equal(completion.ok, true, "verification completion must succeed");
  const verificationResponse = completion.invite.acquirerVerification.score.questionResponses.find((item) => item.questionId === "Q1");
  assertResolvedRespondent(verificationResponse, "acqv-physical-r2", "verification", "AEM R2 standalone");

  const combinedSession = attachAcquirerVerificationCompletion(weakPrimary, completion.invite);
  const primaryCombined = combinedSession.acquirer2A.score.questionResponses.find((item) => item.questionId === "Q1" && item.respondentSlot === "primary");
  const verificationCombined = combinedSession.acquirer2A.score.questionResponses.find((item) => item.questionId === "Q1" && item.respondentSlot === "verification");
  assertResolvedRespondent(primaryCombined, "aem-session-r1", "primary", "AEM combined R1");
  assertResolvedRespondent(verificationCombined, "acqv-physical-r2", "verification", "AEM combined R2");
});

check("C3A-07", "Target Observer questionResponses preserve observationSessionId", () => {
  const score = scoreTargetObservation(
    answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions),
    TARGET_OBSERVATION_DIAGNOSTIC,
    { observationSessionId: "obs-physical-observer" },
  );
  const response = score.questionResponses.find((item) => item.questionId === TARGET_OBSERVATION_DIAGNOSTIC.questions[0].id);
  assertResolvedRespondent(response, "obs-physical-observer", null, "Target Observer");
});

check("C3A-08", "Target Diagnostic under observer preserves observer identity only when the workflow supplies it", () => {
  const observerSession = Object.freeze({
    sessionId: "assessment-session",
    targetObservation: Object.freeze({
      completed: true,
      observationSessionId: "obs-physical-observer",
    }),
  });
  const linked = attachTargetDiagnosticLevel1(
    observerSession,
    answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions),
  );
  const linkedResponse = linked.score.questionResponses.find((item) => item.questionId === "Q1");
  assertResolvedRespondent(linkedResponse, "obs-physical-observer", null, "Target Diagnostic under observer");
  assert.equal(linkedResponse.canonicalQuestionId, "ENVIRONMENTLEVEL1-Q1");
});

check("C3A-09", "TSAM responses preserve targetSessionId", () => {
  const positioning = { p1: "A", p2: "C", acquisitionAwareness: "no" };
  const record = buildTargetSelfAssessmentRecord(
    positioning,
    answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions),
    "2026-05-01T01:30:00.000Z",
    { targetSessionId: "tgt-physical-tsam" },
  );
  assert.equal(record.completed, true);
  const response = record.score.questionResponses.find((item) => item.questionId === "Q1");
  assertResolvedRespondent(response, "tgt-physical-tsam", null, "TSAM");
  assert.equal(response.canonicalQuestionId, "TARGETSELFASSESSMENT-Q1");
});

check("C3A-10", "Workflows without a physical respondent ID stay UNRESOLVED and do not fabricate identity", () => {
  const standalone = attachTargetDiagnosticLevel1(
    {
      sessionId: "advisor-session",
      dealContext: Object.freeze({
        completed: true,
        data: Object.freeze({ respondentSide: "advisor" }),
      }),
    },
    answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions),
  );
  const standaloneResponse = standalone.score.questionResponses.find((item) => item.questionId === "Q1");
  assertUnresolvedRespondent(standaloneResponse, "standalone Target Diagnostic");
  assert.equal(standaloneResponse.respondentSlot, null);

  const anonymousTsam = scoreTargetSelfAssessment(answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions));
  assertUnresolvedRespondent(anonymousTsam.questionResponses[0], "standalone TSAM scoring");

  const anonymousObserver = scoreTargetObservation(answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions));
  assertUnresolvedRespondent(anonymousObserver.questionResponses[0], "observer scoring without session id");
});

check("C3A-11", "Canonical provenance survives JSON serialization round trip", () => {
  const attached = attachAcquirerModuleResult(
    { sessionId: "aem-session-r1" },
    answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions),
  );
  const roundTrip = JSON.parse(JSON.stringify(attached.score));
  const response = roundTrip.questionResponses.find((item) => item.questionId === "Q1");
  assert.equal(response.canonicalQuestionId, "ACQUIRERENVIRONMENT-Q1");
  assert.equal(response.workbookQuestionId, "Q1");
  assert.equal(response.questionModuleId, "acquirerEnvironment");
  assert.equal(response.respondentId, "aem-session-r1");
  assert.equal(response.respondentSlot, "primary");
  assert.equal(response.respondentIdentityStatus, "RESOLVED");

  const observerRoundTrip = JSON.parse(JSON.stringify(scoreTargetObservation(
    answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions),
    TARGET_OBSERVATION_DIAGNOSTIC,
    { observationSessionId: "obs-physical-observer" },
  )));
  assert.equal(observerRoundTrip.questionResponses[0].respondentId, "obs-physical-observer");
  assert.equal(observerRoundTrip.questionResponses[0].canonicalQuestionId, TARGET_OBSERVATION_DIAGNOSTIC.questions[0].canonicalQuestionId);
});

check("C3A-12", "Hidden audit carries internal provenance and public report source does not leak it", () => {
  const attached = attachAcquirerModuleResult(
    { sessionId: "aem-session-r1" },
    answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions),
  );
  const snapshot = createHiddenUserAnswersSnapshot({
    acquirer2A: attached.session.acquirer2A,
  }, {});
  const q1 = attached.score.questionResponses.find((item) => item.questionId === "Q1");
  assert.ok(snapshot.summary.includes("CANONICAL | WORKBOOK | MODULE | RESPONDENT | SLOT | ID-STATUS"));
  assert.ok(snapshot.summary.includes(q1.canonicalQuestionId));
  assert.ok(snapshot.summary.includes("aem-session-r1"));
  assert.ok(snapshot.summary.includes(`${q1.questionId} | ${q1.selectedOption}`));
  assert.ok(snapshot.json.includes("canonicalQuestionId"));
  assert.ok(snapshot.json.includes("questionModuleId"));
  assert.ok(snapshot.json.includes("respondentIdentityStatus"));
  assert.match(hiddenAuditSource, /canonicalQuestionId/);
  assert.match(hiddenAuditSource, /questionModuleId/);
  assert.match(hiddenAuditSource, /respondentIdentityStatus/);
  assert.doesNotMatch(publicReportSource, /canonicalQuestionId/);
  assert.doesNotMatch(publicReportSource, /questionModuleId/);
  assert.doesNotMatch(publicReportSource, /respondentIdentityStatus/);
  assert.doesNotMatch(publicDesignSource, /canonicalQuestionId/);
  assert.doesNotMatch(publicDesignSource, /questionModuleId/);
  assert.doesNotMatch(publicDesignSource, /respondentIdentityStatus/);
});

check("C3A-13", "New provenance fields do not participate in answerWeight or scoring calculation", () => {
  assert.match(scoringSource, /function answerWeight\(answer, excludedFromPrimaryScoring, effects\)/);
  const answerWeightStart = scoringSource.indexOf("function answerWeight(");
  const answerWeightBlock = scoringSource.slice(answerWeightStart, scoringSource.indexOf("function freezeRanked", answerWeightStart));
  for (const field of PROVENANCE_FIELDS) {
    assert.equal(answerWeightBlock.includes(field), false, `answerWeight must not read ${field}`);
  }
  assert.equal(answerWeightBlock.includes("respondentId"), false, "answerWeight must not read respondentId");
  assert.equal(answerWeightBlock.includes("canonicalQuestionId"), false);

  const questions = ACQUIRER_TRACK_DATA.acquirerModule.questions;
  const answers = answersFor(questions);
  const unlabeled = scoreAcquirerModule(answers);
  const labeled = scoreAcquirerModule(answers, ACQUIRER_TRACK_DATA, {
    respondentId: "aem-session-r1",
    respondentSlot: "primary",
  });
  assert.deepEqual(semanticScoreView(labeled), semanticScoreView(unlabeled));
  assert.notEqual(labeled.questionResponses[0].respondentId, unlabeled.questionResponses[0].respondentId);
});

check("C3A-14", "Representative AEM/TED/EL1/EL2/TSAM score outputs stay semantically identical except additive provenance", () => {
  const aemAnswers = answersFor(ACQUIRER_TRACK_DATA.acquirerModule.questions);
  const tsamAnswers = answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions);
  const el1Answers = answersFor(TARGET_DIAGNOSTIC_DATA.level1.questions);
  const el2Answers = answersFor(TARGET_DIAGNOSTIC_DATA.level2.questions);
  const todAnswers = answersFor(TARGET_OBSERVATION_DIAGNOSTIC.questions);

  const aemUnlabeled = scoreAcquirerModule(aemAnswers);
  const aemLabeled = scoreAcquirerModule(aemAnswers, ACQUIRER_TRACK_DATA, { respondentId: "aem-session-r1", respondentSlot: "primary" });
  const combinedUnlabeled = scoreCombinedAcquirerModule(aemAnswers, aemAnswers);
  const combinedLabeled = scoreCombinedAcquirerModule(aemAnswers, aemAnswers, ACQUIRER_TRACK_DATA, {
    primaryRespondentId: "aem-session-r1",
    verificationRespondentId: "acqv-physical-r2",
  });
  const todUnlabeled = scoreTargetObservation(todAnswers);
  const todLabeled = scoreTargetObservation(todAnswers, TARGET_OBSERVATION_DIAGNOSTIC, { observationSessionId: "obs-physical-observer" });
  const el1Unlabeled = scoreTargetDiagnosticLevel1(el1Answers);
  const el1Labeled = scoreTargetDiagnosticLevel1(el1Answers, TARGET_DIAGNOSTIC_DATA, { respondentId: "obs-physical-observer" });
  const el2Unlabeled = scoreTargetDiagnosticQuestions(TARGET_DIAGNOSTIC_DATA.level2.questions, el2Answers);
  const el2Labeled = scoreTargetDiagnosticQuestions(
    TARGET_DIAGNOSTIC_DATA.level2.questions,
    el2Answers,
    { respondentId: "obs-physical-observer" },
  );
  const tsamUnlabeled = scoreTargetSelfAssessment(tsamAnswers);
  const tsamLabeled = scoreTargetSelfAssessment(tsamAnswers, TARGET_SELF_ASSESSMENT_DATA, { targetSessionId: "tgt-physical-tsam" });

  assert.deepEqual(semanticScoreView(aemLabeled), semanticScoreView(aemUnlabeled));
  assert.deepEqual(semanticScoreView(combinedLabeled), semanticScoreView(combinedUnlabeled));
  assert.deepEqual(semanticScoreView(todLabeled), semanticScoreView(todUnlabeled));
  assert.deepEqual(semanticScoreView(el1Labeled), semanticScoreView(el1Unlabeled));
  assert.deepEqual(semanticScoreView(el2Labeled), semanticScoreView(el2Unlabeled));
  assert.deepEqual(semanticScoreView(tsamLabeled), semanticScoreView(tsamUnlabeled));
  assert.ok(aemLabeled.totalEvidenceWeight > 0);
  assert.ok(todLabeled.primaryEnvironmentCode);
  assert.ok(el1Labeled.confidence);
  assert.ok(el2Labeled.questionResponses.length === TARGET_DIAGNOSTIC_DATA.level2.questions.length);
});

check("C3A-15", "C1 contract remains PASS 15/15", () => {
  const output = npmRun("validate:answer-semantic-integrity");
  assert.match(output, /PASS 15\/15/);
});

check("C3A-16", "C2 contract remains PASS 20/20", () => {
  const output = npmRun("validate:evid-calibration-integrity");
  assert.match(output, /PASS 20\/20/);
});

await checkAsync("C3A-17", "Production ledger transports observationSessionId into persisted Target Observation scores", async () => {
  const observationSessionId = "obs-c3a-corr1-a";
  const assessmentSessionId = "assess-c3a-corr1-a";
  const persisted = await persistAuthorizedObserverCompletion(observationSessionId, assessmentSessionId);
  assert.equal(persisted.targetObservation?.observationSessionId, observationSessionId);
  assertScoreRespondentIdentity(
    persisted.targetObservation?.score,
    observationSessionId,
    "ledger Target Observation",
  );
  const stored = getSession(assessmentSessionId);
  assertScoreRespondentIdentity(
    stored.targetObservation?.score,
    observationSessionId,
    "stored Target Observation",
  );
});

await checkAsync("C3A-18", "Production ledger transports observer identity into persisted Target Diagnostic scores", async () => {
  const observationSessionId = "obs-c3a-corr1-b";
  const assessmentSessionId = "assess-c3a-corr1-b";
  const persisted = await persistAuthorizedObserverCompletion(observationSessionId, assessmentSessionId);
  assert.equal(persisted.target2B?.completed, true, "observer-linked Target Diagnostic must complete");
  assertScoreRespondentIdentity(
    persisted.target2B?.level1?.score,
    observationSessionId,
    "ledger Target Diagnostic level1",
  );
  assertScoreRespondentIdentity(
    persisted.target2B?.finalScore,
    observationSessionId,
    "ledger Target Diagnostic finalScore",
  );
  if (persisted.target2B?.level2?.score) {
    assertScoreRespondentIdentity(
      persisted.target2B.level2.score,
      observationSessionId,
      "ledger Target Diagnostic level2",
    );
  }
  const stored = getSession(assessmentSessionId);
  assertScoreRespondentIdentity(
    stored.target2B?.finalScore,
    observationSessionId,
    "stored Target Diagnostic finalScore",
  );
});

await checkAsync("C3A-19", "Production TSAM API transports targetSessionId into the completed record", async () => {
  const created = createServerTargetSession({
    assessmentSessionId: "assess-c3a-corr1-c",
    preliminaryAssessmentId: "pa-c3a-corr1-c",
    track1Complete: true,
    preliminaryAssessmentCreated: true,
  });
  assert.equal(created.ok, true, `createServerTargetSession failed: ${created.status ?? "unknown"}`);
  const submitTarget2cHandler = await loadSubmitTarget2cHandler();
  const request = new Request("http://127.0.0.1/api/submit-target-2c", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      targetSessionId: created.targetSessionId,
      digitalCode: created.digitalCode,
      positioning: TSAM_POSITIONING,
      answers: answersFor(TARGET_SELF_ASSESSMENT_DATA.targetSelfAssessment.questions),
    }),
  });
  const response = await submitTarget2cHandler(request);
  const payload = await response.json();
  assert.equal(response.status, 200, `submit-target-2c status ${response.status}: ${JSON.stringify(payload)}`);
  assert.equal(payload.ok, true, `submit-target-2c not ok: ${payload.status ?? "unknown"}`);
  assert.equal(payload.targetSessionId, created.targetSessionId);

  const stored = getSession("assess-c3a-corr1-c");
  const completed = stored.targetInvite?.targetSelfAssessment;
  assert.equal(completed?.completed, true, "API path must persist a completed TSAM record");
  const responseRow = completed.score.questionResponses.find((item) => item.questionId === "Q1");
  assert.ok(responseRow, "persisted TSAM Q1 response missing");
  assertResolvedRespondent(responseRow, created.targetSessionId, null, "TSAM API persisted Q1");
  assertScoreRespondentIdentity(completed.score, created.targetSessionId, "TSAM API persisted");
});

await checkAsync("C3A-20", "App.jsx production TSAM call passes invite.targetSessionId into the builder", () => {
  const call = productionTsamClientCall();
  assert.match(call, /^buildTargetSelfAssessmentRecord\(/);
  const open = call.indexOf("(");
  const close = findMatchingClose(call, open);
  const inside = call.slice(open + 1, close);
  assert.match(inside, /positioning\s*,/);
  assert.match(inside, /completedAnswers\s*,/);
  assert.match(inside, /targetSessionId\s*:/);
  assert.match(inside, /invite\s*\?\.\s*targetSessionId|invite\.targetSessionId/);
  assert.doesNotMatch(inside, /targetSessionId\s*:\s*["']primary["']/);
  assert.doesNotMatch(inside, /targetSessionId\s*:\s*["']verification["']/);
});

console.log("C3-A provenance foundation cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
