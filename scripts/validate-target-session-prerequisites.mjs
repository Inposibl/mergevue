import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  createServerTargetSession,
  evaluateCreateTargetSessionPrerequisites,
  peekSession,
} from "../src/server/_sessionLedger.ts";

const API_PATH = new URL("../api/create-target-session.ts", import.meta.url);
const LEDGER_PATH = new URL("../src/server/_sessionLedger.ts", import.meta.url);
const PACKAGE_PATH = new URL("../package.json", import.meta.url);

const apiSource = readFileSync(API_PATH, "utf8");
const ledgerSource = readFileSync(LEDGER_PATH, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

const failures = [];

function check(label, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function uniqueSessionId(label) {
  return `sec1e-v003-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createFnSource() {
  const start = ledgerSource.indexOf("export function createServerTargetSession");
  const end = ledgerSource.indexOf("export function verifyServerTargetCode");
  assert.ok(start !== -1 && end !== -1 && start < end, "createServerTargetSession must be locatable");
  return ledgerSource.slice(start, end);
}

check("package.json registers the target-session prerequisites oracle", () => {
  assert.equal(
    pkg.scripts?.["validate:target-session-prerequisites"],
    "node scripts/validate-target-session-prerequisites.mjs",
  );
});

check("source scan: API does not pass body track1/preliminary flags as authority", () => {
  assert.equal(apiSource.includes("track1Complete: body?.track1Complete === true"), false);
  assert.equal(apiSource.includes("preliminaryAssessmentCreated: body?.preliminaryAssessmentCreated === true"), false);
  assert.equal(apiSource.includes("body?.track1Complete"), false);
  assert.equal(apiSource.includes("body?.preliminaryAssessmentCreated"), false);
  assert.ok(apiSource.includes("createServerTargetSession({"));
});

check("source scan: ledger gate ignores client booleans and peeks without insert", () => {
  const createFn = createFnSource();
  assert.ok(createFn.includes("evaluateCreateTargetSessionPrerequisites(session, input)"));
  assert.ok(createFn.includes("peekSession(input.assessmentSessionId)"));
  assert.equal(/\bgetSession\s*\(/.test(createFn), false, "deny/create path must not insert via getSession");
  assert.equal(createFn.includes("input.track1Complete"), false);
  assert.equal(createFn.includes("input.preliminaryAssessmentCreated"), false);
  const gateIdx = createFn.indexOf("evaluateCreateTargetSessionPrerequisites");
  const denyIdx = createFn.indexOf("track-1-or-preliminary-incomplete");
  const codeIdx = createFn.indexOf("sixDigitCode()");
  const inviteWriteIdx = createFn.indexOf("targetInvite: invite");
  assert.ok(gateIdx !== -1 && denyIdx !== -1);
  assert.ok(gateIdx < denyIdx, "prerequisite evaluation must precede deny");
  assert.ok(denyIdx < codeIdx, "digitalCode must not be generated before deny");
  assert.ok(denyIdx < inviteWriteIdx, "invite write must not run before deny");
});

check("evaluator denies missing session regardless of client flags", () => {
  const withFlags = evaluateCreateTargetSessionPrerequisites(null, {
    track1Complete: true,
    preliminaryAssessmentCreated: true,
  });
  const withoutFlags = evaluateCreateTargetSessionPrerequisites(null, {});
  const falseFlags = evaluateCreateTargetSessionPrerequisites(null, {
    track1Complete: false,
    preliminaryAssessmentCreated: false,
  });
  for (const result of [withFlags, withoutFlags, falseFlags]) {
    assert.equal(result.ok, false);
    assert.equal(result.status, "track-1-or-preliminary-incomplete");
  }
});

check("body flags true + missing server session → deny, no invite, no digitalCode, no insert", () => {
  const assessmentSessionId = uniqueSessionId("flags-true-missing");
  const result = createServerTargetSession({
    assessmentSessionId,
    preliminaryAssessmentId: "pa-sec1e",
    track1Complete: true,
    preliminaryAssessmentCreated: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.status, "track-1-or-preliminary-incomplete");
  assert.equal(Object.prototype.hasOwnProperty.call(result, "digitalCode"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "targetSessionId"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "surveyLink"), false);
  assert.equal(peekSession(assessmentSessionId), null);
});

check("body flags false/absent + missing server session → deny", () => {
  const absentId = uniqueSessionId("flags-absent");
  const absent = createServerTargetSession({
    assessmentSessionId: absentId,
    preliminaryAssessmentId: "pa-sec1e",
  });
  assert.equal(absent.ok, false);
  assert.equal(absent.status, "track-1-or-preliminary-incomplete");
  assert.equal(peekSession(absentId), null);

  const falseId = uniqueSessionId("flags-false");
  const falsy = createServerTargetSession({
    assessmentSessionId: falseId,
    preliminaryAssessmentId: "pa-sec1e",
    track1Complete: false,
    preliminaryAssessmentCreated: false,
  });
  assert.equal(falsy.ok, false);
  assert.equal(falsy.status, "track-1-or-preliminary-incomplete");
  assert.equal(peekSession(falseId), null);
});

check("body flags true do not create invite on empty ledger", () => {
  const assessmentSessionId = uniqueSessionId("empty-ledger");
  const result = createServerTargetSession({
    assessmentSessionId,
    preliminaryAssessmentId: "pa-sec1e",
    track1Complete: true,
    preliminaryAssessmentCreated: true,
    reportBinding: { forged: true },
  });
  assert.equal(result.ok, false);
  assert.equal(peekSession(assessmentSessionId), null);
  assert.equal(result.digitalCode, undefined);
  assert.equal(result.targetSessionId, undefined);
});

check("allow is unreachable through client flags; stored Track 1 / preliminary proof is NONE", () => {
  const cases = [
    { track1Complete: true, preliminaryAssessmentCreated: true },
    { track1Complete: true, preliminaryAssessmentCreated: false },
    { track1Complete: false, preliminaryAssessmentCreated: true },
    {},
  ];
  for (const flags of cases) {
    const assessmentSessionId = uniqueSessionId(`allow-unreachable-${JSON.stringify(flags)}`);
    const result = createServerTargetSession({
      assessmentSessionId,
      preliminaryAssessmentId: "pa-sec1e",
      ...flags,
    });
    assert.equal(result.ok, false, `client flags ${JSON.stringify(flags)} must not allow`);
    assert.equal(result.status, "track-1-or-preliminary-incomplete");
    assert.equal(peekSession(assessmentSessionId), null);
  }

  const emptyRecord = {
    sessionId: uniqueSessionId("empty-record"),
    createdAt: "2026-08-28T00:00:00.000Z",
    updatedAt: "2026-08-28T00:00:00.000Z",
    targetObservationSetup: null,
    targetObservation: null,
    target2B: null,
    targetInvite: null,
  };
  const fromEmptyRecord = evaluateCreateTargetSessionPrerequisites(emptyRecord, {
    track1Complete: true,
    preliminaryAssessmentCreated: true,
  });
  assert.equal(fromEmptyRecord.ok, false);
});

if (failures.length) {
  console.error("validate:target-session-prerequisites FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("validate:target-session-prerequisites passed");
console.log("stored Track 1 / preliminary proof: NONE");
console.log("allow via client flags: unreachable");
