import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  compileNativeSafetyEnvelopeV1,
  validateSemanticCapsuleV1,
} from "../src/reporting/nse/envelope.ts";
import { SemanticKernelV1 } from "../src/reporting/nse/kernel.ts";
import { OutputVerifierV1 } from "../src/reporting/nse/result.ts";

const source = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), "utf8");
const kernelSource = source("src/reporting/nse/kernel.ts");
const envelopeSource = source("src/reporting/nse/envelope.ts");
const resultSource = source("src/reporting/nse/result.ts");
const rehydrateSource = source("src/reporting/nse/rehydrate.ts");
const apiSource = source("api/final-report.ts");
const productionSources = [kernelSource, envelopeSource, resultSource, rehydrateSource];

assert.doesNotMatch(kernelSource, /^\s*import\s/m, "SemanticKernelV1 must have zero imports");
for (const [label, pattern] of [
  ["filesystem", /\b(?:node:)?fs\b/],
  ["network", /\b(?:node:)?(?:net|http|https)\b/],
  ["fetch", /\bfetch\s*\(/],
  ["child process", /child_process/],
  ["environment", /process\.env/],
  ["timers", /\b(?:setTimeout|setInterval)\s*\(/],
  ["random", /Math\.random|crypto\.random/],
  ["dynamic import", /\bimport\s*\(/],
  ["eval", /\beval\s*\(/],
  ["Function constructor", /new\s+Function\b/],
  ["provider", /\b(?:Resend|Vercel)\b/],
]) {
  for (const moduleSource of productionSources) {
    assert.doesNotMatch(moduleSource, pattern, `NSE production modules must not use ${label}`);
  }
}

assert.equal(apiSource.includes("scripts/legacy/hiddenAuditSummaryOracle"), false, "production API must not import the legacy oracle");
assert.equal((apiSource.match(/sendFinalReportHiddenCopy\(request, response\)/g) ?? []).length, 1, "production handler must have one hidden-copy NSE route entry");
assert.ok(apiSource.includes("createNativeSafetyEnvelopeArtifact(authorized.projection)"), "production NSE call must omit the kernel override");
const hiddenRouteStart = apiSource.indexOf("export async function sendFinalReportHiddenCopy");
const hiddenRouteEnd = apiSource.indexOf("const TARGET_SELF_COMPLETION_TTL_SECONDS", hiddenRouteStart);
const hiddenRouteSource = apiSource.slice(hiddenRouteStart, hiddenRouteEnd);
assert.ok(hiddenRouteSource.indexOf("resolveCurrentReportAuthority(body, [\"sessionId\", \"authorityId\"])") < hiddenRouteSource.indexOf("createNativeSafetyEnvelopeArtifact(authorized.projection)"), "authority resolution must precede NSE");
assert.ok(hiddenRouteSource.indexOf("createNativeSafetyEnvelopeArtifact(authorized.projection)") < hiddenRouteSource.indexOf("renderAuthorizedPdf(request, authorized.projection)"), "NSE must precede PDF rendering");

const d10Start = apiSource.indexOf("export function evaluateHiddenCopyRequest");
const d10End = apiSource.indexOf("export async function sendFinalReportHiddenCopy", d10Start);
const d10Source = apiSource.slice(d10Start, d10End);
assert.ok(d10Start >= 0 && d10End > d10Start, "D10 source boundary must remain present");
assert.doesNotMatch(d10Source, /createNativeSafetyEnvelopeArtifact|SemanticKernelV1|SemanticResultV1/, "D10 must gain no NSE authority edge");

const capsuleStart = kernelSource.indexOf("export type SemanticCapsuleV1");
const capsuleEnd = kernelSource.indexOf("export type NseOrderedEnvironmentRowV1", capsuleStart);
const capsuleSource = kernelSource.slice(capsuleStart, capsuleEnd);
for (const removedSelector of ["pairShape", "sourceSel", "reasonSel", "typeSel", "resolutionKind", "resolutionLabelSel"]) {
  assert.equal(capsuleSource.includes(removedSelector), false, `${removedSelector} must be absent from SemanticCapsuleV1`);
}
assert.doesNotMatch(envelopeSource, /\.\.\.\s*projection|Object\.entries\s*\(\s*projection|Reflect\.|Record<string,\s*unknown>/, "compiler must not reflect or spread projection fields into semantic admission");

const projection = {
  session: {
    acquirer2A: { completed: true, score: { questionResponses: [], environmentScores: {}, weightedEnvironmentScores: {} } },
    acquirerVerification: { answers: { rawR2: "F001_RAW_R2_MARKER" } },
    targetSelfAssessment: { completed: false, answers: { rawTarget: "F001_RAW_TARGET_SELF_MARKER" } },
  },
  deliverable: {
    acquirerEnvironmentCode: "NT/STJ",
    targetEnvironmentCode: "NF/NT",
    compatibilityScore: 50,
    targetResolutionSource: "",
  },
};
const sourceResponses = projection.session.acquirer2A.score.questionResponses;
assert.equal(Object.isFrozen(sourceResponses), false, "fixture must begin mutable for the input-mutation oracle");
const compiled = compileNativeSafetyEnvelopeV1(projection);
assert.equal(Object.isFrozen(sourceResponses), false, "compiler must not freeze or mutate caller-owned projection arrays");
assert.equal(Object.isFrozen(compiled.capsule), true, "validated capsule must be frozen");
assert.equal(Object.isFrozen(compiled.capsule.modules[0]), true, "capsule freeze must cover nested fact containers");
validateSemanticCapsuleV1(compiled.capsule);
assert.equal(compiled.capsule.resolutionSourceTruthy, false, "empty resolution source must be falsey");
assert.equal(compiled.capsule.resolutionSourceIsString, true, "empty resolution source must remain a string fact");
const result = SemanticKernelV1(compiled.capsule);
OutputVerifierV1(result);
assert.equal(result.resolutionKind, "MISSING", "empty resolution source must select MISSING in the kernel");

const semanticBytes = JSON.stringify({ capsule: compiled.capsule, result });
assert.equal(semanticBytes.includes("F001_RAW_R2_MARKER"), false, "raw R2 evidence must not enter semantic execution");
assert.equal(semanticBytes.includes("F001_RAW_TARGET_SELF_MARKER"), false, "raw Target Self evidence must not enter semantic execution");
assert.ok(JSON.stringify(compiled.ownerAuditPayload).includes("F001_RAW_R2_MARKER"), "owner payload must retain full authorized R2 evidence");
assert.ok(JSON.stringify(compiled.ownerAuditPayload).includes("F001_RAW_TARGET_SELF_MARKER"), "owner payload must retain full authorized Target Self evidence");

const unknownCapsule = structuredClone(compiled.capsule);
unknownCapsule.futureSemanticField = true;
assert.throws(() => validateSemanticCapsuleV1(unknownCapsule), /NSE_CAPSULE_SCHEMA_REJECTED/, "unknown capsule fields must fail closed");
const unknownNestedCapsule = structuredClone(compiled.capsule);
unknownNestedCapsule.modules[0].futureSemanticField = true;
assert.throws(() => validateSemanticCapsuleV1(unknownNestedCapsule), /NSE_CAPSULE_SCHEMA_REJECTED/, "unknown nested capsule fields must fail closed");

const futureProjection = structuredClone(projection);
futureProjection.futureSemanticField = "FUTURE_FIELD_MARKER";
futureProjection.session.futureSemanticField = "FUTURE_SESSION_MARKER";
const futureCompiled = compileNativeSafetyEnvelopeV1(futureProjection);
const futureSemanticBytes = JSON.stringify({
  capsule: futureCompiled.capsule,
  result: SemanticKernelV1(futureCompiled.capsule),
});
assert.equal(futureSemanticBytes.includes("FUTURE_FIELD_MARKER"), false, "new projection fields must not enter semantics");
assert.equal(futureSemanticBytes.includes("FUTURE_SESSION_MARKER"), false, "new session fields must not enter semantics");
assert.ok(JSON.stringify(futureCompiled.ownerAuditPayload).includes("FUTURE_SESSION_MARKER"), "owner payload remains full parity under NSE-08");

for (let index = 0; index < 500; index += 1) {
  const finiteResult = SemanticKernelV1(compiled.capsule);
  OutputVerifierV1(finiteResult);
}

console.log("NSE architecture validation passed");
