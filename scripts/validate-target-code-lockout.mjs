import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  TARGET_CODE_LOCKOUT_MS,
  TARGET_CODE_MAX_FAILED_ATTEMPTS,
  evaluateTargetCodeAttempt,
  getSession,
  peekSession,
  verifyServerTargetCode,
} from "../src/server/_sessionLedger.ts";

const LEDGER_PATH = new URL("../src/server/_sessionLedger.ts", import.meta.url);
const API_VERIFY_PATH = new URL("../api/verify-target-code.ts", import.meta.url);
const API_CREATE_PATH = new URL("../api/create-target-session.ts", import.meta.url);
const PACKAGE_PATH = new URL("../package.json", import.meta.url);

const ledgerSource = readFileSync(LEDGER_PATH, "utf8");
const verifyApiSource = readFileSync(API_VERIFY_PATH, "utf8");
const createApiSource = readFileSync(API_CREATE_PATH, "utf8");
const pkg = JSON.parse(readFileSync(PACKAGE_PATH, "utf8"));

const CORRECT_CODE = "123456";
const WRONG_CODE = "000000";
const NOW = "2026-08-28T12:00:00.000Z";

const failures = [];

function check(label, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function uniqueId(label) {
  return `sec1f-v004-${label}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function inviteHash(code, targetSessionId, preliminaryAssessmentId) {
  return createHash("sha256").update(`${targetSessionId}:${preliminaryAssessmentId}:${code}`).digest("hex");
}

function fixtureInvite(overrides = {}) {
  const targetSessionId = overrides.targetSessionId ?? uniqueId("invite");
  const assessmentSessionId = overrides.assessmentSessionId ?? uniqueId("assessment");
  const preliminaryAssessmentId = overrides.preliminaryAssessmentId ?? "pa-sec1f";
  return {
    targetSessionId,
    assessmentSessionId,
    preliminaryAssessmentId,
    reportBinding: null,
    codeHash: overrides.codeHash ?? inviteHash(CORRECT_CODE, targetSessionId, preliminaryAssessmentId),
    createdAt: NOW,
    expiresAt: overrides.expiresAt ?? "2026-08-31T12:00:00.000Z",
    completed: overrides.completed ?? false,
    revoked: overrides.revoked ?? false,
    failedVerifyAttempts: overrides.failedVerifyAttempts,
    lockedUntil: overrides.lockedUntil,
  };
}

function plantInvite(invite) {
  const session = getSession(invite.assessmentSessionId);
  session.targetInvite = invite;
  return invite;
}

check("package.json registers the target-code lockout oracle", () => {
  assert.equal(
    pkg.scripts?.["validate:target-code-lockout"],
    "node scripts/validate-target-code-lockout.mjs",
  );
});

check("source scan: attempt counter and locked status exist", () => {
  assert.ok(ledgerSource.includes("export function evaluateTargetCodeAttempt"));
  assert.ok(ledgerSource.includes("failedVerifyAttempts"));
  assert.ok(ledgerSource.includes('status: "locked"'));
  assert.ok(ledgerSource.includes("TARGET_CODE_MAX_FAILED_ATTEMPTS = 5"));
  assert.ok(ledgerSource.includes("TARGET_CODE_LOCKOUT_MS = 15 * 60 * 1000"));
  assert.ok(ledgerSource.includes("evaluateTargetCodeAttempt(found?.invite ?? null, code, now)"));
  assert.equal(TARGET_CODE_MAX_FAILED_ATTEMPTS, 5);
  assert.equal(TARGET_CODE_LOCKOUT_MS, 15 * 60 * 1000);
  assert.equal(ledgerSource.includes("remaining"), false);
  assert.equal(/console\.(log|info|debug|error)\([^\n]*digitalCode/.test(ledgerSource), false);
  assert.equal(/console\.(log|info|debug|error)\([^\n]*normalizedCode/.test(verifyApiSource + ledgerSource), false);
});

check("V003 remains fail-closed: create-target-session does not forward client flags", () => {
  assert.equal(createApiSource.includes("track1Complete: body?.track1Complete === true"), false);
  assert.equal(createApiSource.includes("preliminaryAssessmentCreated: body?.preliminaryAssessmentCreated === true"), false);
  assert.equal(createApiSource.includes("body?.track1Complete"), false);
  assert.equal(createApiSource.includes("body?.preliminaryAssessmentCreated"), false);
});

check("4 wrong-code attempts stay wrong-code and are not locked", () => {
  let invite = fixtureInvite();
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const result = evaluateTargetCodeAttempt(invite, WRONG_CODE, NOW);
    assert.equal(result.ok, false);
    assert.equal(result.status, "wrong-code", `attempt ${attempt} must be wrong-code`);
    assert.equal(result.nextInvite?.failedVerifyAttempts, attempt);
    assert.equal(result.nextInvite?.lockedUntil ?? null, null);
    invite = result.nextInvite;
  }
});

check("5th wrong-code locks the invite", () => {
  let invite = fixtureInvite({ failedVerifyAttempts: 4 });
  const result = evaluateTargetCodeAttempt(invite, WRONG_CODE, NOW);
  assert.equal(result.ok, false);
  assert.equal(result.status, "locked");
  assert.equal(result.nextInvite?.failedVerifyAttempts, 5);
  assert.ok(result.nextInvite?.lockedUntil);
  const lockedUntilMs = Date.parse(result.nextInvite.lockedUntil);
  const expectedMs = Date.parse(NOW) + TARGET_CODE_LOCKOUT_MS;
  assert.ok(lockedUntilMs <= expectedMs);
  assert.ok(lockedUntilMs <= Date.parse(invite.expiresAt));
});

check("correct code during lockout stays locked and is not verified", () => {
  const lockedUntil = new Date(Date.parse(NOW) + TARGET_CODE_LOCKOUT_MS).toISOString();
  const invite = fixtureInvite({
    failedVerifyAttempts: 5,
    lockedUntil,
  });
  const result = evaluateTargetCodeAttempt(invite, CORRECT_CODE, NOW);
  assert.equal(result.ok, false);
  assert.equal(result.status, "locked");
  assert.equal(result.nextInvite, null);
});

check("after lockedUntil in the past, counter resets and correct code verifies", () => {
  const lockedUntil = new Date(Date.parse(NOW) - 1000).toISOString();
  const invite = fixtureInvite({
    failedVerifyAttempts: 5,
    lockedUntil,
  });
  const result = evaluateTargetCodeAttempt(invite, CORRECT_CODE, NOW);
  assert.equal(result.ok, true);
  assert.equal(result.status, "verified");
  assert.equal(result.nextInvite.failedVerifyAttempts, 0);
  assert.equal(result.nextInvite.lockedUntil, null);
});

check("expired / revoked / completed do not increment lockout", () => {
  const expired = evaluateTargetCodeAttempt(
    fixtureInvite({ expiresAt: "2026-08-28T11:00:00.000Z", failedVerifyAttempts: 2 }),
    WRONG_CODE,
    NOW,
  );
  assert.equal(expired.status, "expired");
  assert.equal(expired.nextInvite, null);

  const revoked = evaluateTargetCodeAttempt(
    fixtureInvite({ revoked: true, failedVerifyAttempts: 2 }),
    WRONG_CODE,
    NOW,
  );
  assert.equal(revoked.status, "revoked");
  assert.equal(revoked.nextInvite, null);

  const completed = evaluateTargetCodeAttempt(
    fixtureInvite({ completed: true, failedVerifyAttempts: 2 }),
    WRONG_CODE,
    NOW,
  );
  assert.equal(completed.status, "completed");
  assert.equal(completed.nextInvite, null);
});

check("not-found does not create an invite record", () => {
  const missingId = uniqueId("missing");
  const evaluation = evaluateTargetCodeAttempt(null, CORRECT_CODE, NOW);
  assert.equal(evaluation.status, "not-found");
  assert.equal(evaluation.nextInvite, null);

  const verified = verifyServerTargetCode(missingId, CORRECT_CODE, NOW);
  assert.equal(verified.ok, false);
  assert.equal(verified.status, "not-found");
  assert.equal(peekSession(missingId), null);
});

check("verifyServerTargetCode persists failed attempts on the in-memory invite", () => {
  const invite = plantInvite(fixtureInvite());
  const first = verifyServerTargetCode(invite.targetSessionId, WRONG_CODE, NOW);
  assert.equal(first.status, "wrong-code");
  const stored = peekSession(invite.assessmentSessionId);
  assert.equal(stored?.targetInvite?.failedVerifyAttempts, 1);
  assert.equal(stored?.targetInvite?.targetSessionId, invite.targetSessionId);
});

check("successful verify persists a reset counter", () => {
  const invite = plantInvite(fixtureInvite({ failedVerifyAttempts: 2 }));
  const result = verifyServerTargetCode(invite.targetSessionId, CORRECT_CODE, NOW);
  assert.equal(result.ok, true);
  assert.equal(result.status, "verified");
  assert.equal("remaining" in result, false);
  const stored = peekSession(invite.assessmentSessionId);
  assert.equal(stored?.targetInvite?.failedVerifyAttempts, 0);
  assert.equal(stored?.targetInvite?.lockedUntil, null);
});

if (failures.length) {
  console.error("validate:target-code-lockout FAILED");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("validate:target-code-lockout passed");
console.log(`threshold: ${TARGET_CODE_MAX_FAILED_ATTEMPTS}`);
console.log(`lockoutMs: ${TARGET_CODE_LOCKOUT_MS}`);
