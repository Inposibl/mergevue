import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import narrativesAndFriction from "../src/generated/newlogic/narrativesAndFriction.json" with { type: "json" };
import {
  ALIGNED_SUPPRESSION_ENVIRONMENTS,
  ERI_B25_EXTRACTION_ENVIRONMENTS,
  buildCrossSideStructuralDifferentiation,
} from "../src/flow/crossSideStructuralDifferentiation.js";
import {
  FINAL_ENVIRONMENT_CODES,
  buildPairDeliverable,
  buildStructuralResourceProfile,
  canonicalRiskBand,
  canonicalStructuralEcs,
  compatibilityRange,
} from "../src/flow/finalDeliverableFlow.js";
import { FINAL_DELIVERABLE_DATA } from "../src/data/finalDeliverableData.js";
import { buildMergevuePublicReportModel } from "../src/reporting/mergevuePublicReportModel.js";
import { buildMergevueForecastBriefDesignModel } from "../src/reporting/mergevueForecastBriefDesignRenderer.js";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(APP_ROOT, "NewLogic 03.05.2026");
const DUAL_WORKBOOK = path.join(SOURCE_DIR, "ST_Dual_Respondent_Axis_Comparison_v1.xlsx");
const UI_WORKBOOK = path.join(SOURCE_DIR, "ST_UI_Track_Coder_Agent_Specification_v1.xlsx");
const ECS_WORKBOOK = path.join(SOURCE_DIR, "ST_ECS_v1_canonical.xlsx");
const ECS_DERIVATION_WORKBOOK = path.join(SOURCE_DIR, "ST_ECS_Derivation_Method_v1.xlsx");
const ERI_WORKBOOK = path.join(SOURCE_DIR, "ST_Environment_Resource_Intelligence_updated.xlsx");

const ENV_CODES = Object.freeze([...FINAL_ENVIRONMENT_CODES]);
const CANONICAL_RESOURCES = Object.freeze([
  "Time", "Energy", "Attention", "Money", "Reputation", "Trust", "Influence",
  "Information", "Connections", "Skills", "Knowledge", "Health",
  "Psychological resilience", "Will / discipline", "Creativity", "Decisiveness",
  "Organisation / system",
]);
const WORKBOOK_QUESTION_IDS = Object.freeze(Array.from({ length: 11 }, (_unused, index) => `Q${index + 1}`));
const HOMOGENEOUS_FORBIDDEN = Object.freeze([
  "RHQA",
  "80\u201395",
  "80-95",
  "Protect Health",
  "Protect Trust",
  "primary tension from IGN",
  "healthy amplification",
  "protectable advantage",
]);

const session = Object.freeze({
  sessionId: "rmp3-homogeneous-semantics",
  dealContext: Object.freeze({
    completed: true,
    data: Object.freeze({
      acquirerName: "Acquirer",
      targetName: "Target",
      dealType: "competitor_absorption",
      respondentSide: "acquirer",
    }),
  }),
});

function readZipEntries(filePath) {
  const buffer = fs.readFileSync(filePath);
  let eocd = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 22 - 65536); index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error(`ZIP EOCD not found: ${filePath}`);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(buffer.readUInt32LE(cursor), 0x02014b50, `central directory signature mismatch in ${filePath}`);
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    entries.set(name, method === 8 ? zlib.inflateRawSync(raw) : Buffer.from(raw));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function decodeXmlEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function denamespaceXml(value) {
  return String(value).replace(/<\/?([A-Za-z_][\w.-]*):/g, (match) => (match.startsWith("</") ? "</" : "<"));
}

function sheetXml(entries, sheetName) {
  const workbook = denamespaceXml(decodeXmlEntities(entries.get("xl/workbook.xml").toString("utf8")));
  const rels = denamespaceXml(decodeXmlEntities(entries.get("xl/_rels/workbook.xml.rels").toString("utf8")));
  const relMap = new Map();
  for (const match of rels.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = match[1].match(/Id="([^"]+)"/)?.[1];
    const target = match[1].match(/Target="([^"]+)"/)?.[1];
    if (id && target) relMap.set(id, target);
  }
  for (const match of workbook.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    if (match[1].includes(`name="${sheetName}"`)) {
      const relId = match[1].match(/r:id="([^"]+)"/)?.[1];
      let target = (relMap.get(relId) ?? "").replace(/\\/g, "/");
      if (target.startsWith("/")) target = target.slice(1);
      else if (!target.startsWith("xl/")) target = `xl/${target}`;
      const xml = entries.get(target);
      assert.ok(xml, `sheet ${sheetName} not found at ${target}`);
      return denamespaceXml(decodeXmlEntities(xml.toString("utf8")));
    }
  }
  throw new Error(`sheet not found: ${sheetName}`);
}

function workbookSheetNames(entries) {
  const workbook = denamespaceXml(decodeXmlEntities(entries.get("xl/workbook.xml").toString("utf8")));
  return [...workbook.matchAll(/<sheet\b([^>]*)\/?>/g)].map((match) => match[1].match(/name="([^"]+)"/)?.[1]).filter(Boolean);
}

function columnNumber(cellRef) {
  const letters = /^([A-Z]+)/.exec(cellRef ?? "")?.[1] ?? "";
  let number = 0;
  for (const letter of letters) number = number * 26 + letter.charCodeAt(0) - 64;
  return number;
}

function readSheetRows(entries, sheetName) {
  const sharedStrings = [];
  if (entries.has("xl/sharedStrings.xml")) {
    const shared = denamespaceXml(decodeXmlEntities(entries.get("xl/sharedStrings.xml").toString("utf8")));
    for (const match of shared.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
      sharedStrings.push([...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(""));
    }
  }
  const rows = [];
  const sheet = sheetXml(entries, sheetName);
  for (const rowMatch of sheet.matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const rowNumber = Number(/(?:^|\s)r="(\d+)"/.exec(rowMatch[1])?.[1] ?? 0);
    const values = new Map();
    for (const cellMatch of rowMatch[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cellMatch[1] + (cellMatch[2] === undefined ? "" : "");
      const ref = /r="([A-Z]+\d+)"/.exec(attributes)?.[1];
      const type = /t="([^"]+)"/.exec(attributes)?.[1];
      const body = cellMatch[2] ?? "";
      let value = "";
      if (type === "inlineStr") {
        value = [...body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("");
      } else {
        const raw = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1];
        if (raw !== undefined) value = type === "s" ? (sharedStrings[Number(raw)] ?? "") : raw;
      }
      value = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      if (value !== "" && ref) values.set(columnNumber(ref), value);
    }
    if (values.size > 0) rows.push({ row: rowNumber, values });
  }
  return rows;
}

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

function conflictPointsForEffects(leftEffect, rightEffect) {
  if (leftEffect === rightEffect) return 0;
  if (leftEffect === "~" || rightEffect === "~") return 1;
  return 2;
}

function roundOne(value) {
  return Math.round(Number(value) * 10) / 10;
}

function responses(letterByQuestion = {}) {
  return WORKBOOK_QUESTION_IDS.map((questionId) => {
    if (Object.prototype.hasOwnProperty.call(letterByQuestion, questionId) && letterByQuestion[questionId] == null) {
      return { workbookQuestionId: questionId, missing: true, selectedOption: null };
    }
    return {
      workbookQuestionId: questionId,
      selectedOption: letterByQuestion[questionId] ?? "A",
    };
  });
}

function publicSurfaces(code, overrides = {}) {
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: code,
    targetEnvironmentCode: code,
    acquirerSignalStrength: overrides.acquirerSignalStrength,
    acquirerCoPresence: overrides.acquirerCoPresence,
    targetSignalStrength: overrides.targetSignalStrength,
    targetCoPresence: overrides.targetCoPresence,
    acquirerQuestionResponses: overrides.acquirerQuestionResponses,
    targetSelfQuestionResponses: overrides.targetSelfQuestionResponses,
  });
  const model = buildMergevuePublicReportModel(session, {
    deliverable,
    generatedAt: "2026-08-28T00:00:00.000Z",
  });
  const design = buildMergevueForecastBriefDesignModel(model);
  return { deliverable, model, design };
}

// Physical Dual workbook: exactly one new governed cross-side sheet.
const dualEntries = readZipEntries(DUAL_WORKBOOK);
const dualSheets = workbookSheetNames(dualEntries);
assert.equal(dualSheets.filter((name) => name === "13_Cross_Side_Structural_Diff").length, 1);
assert.equal(dualSheets.at(-1), "13_Cross_Side_Structural_Diff");
const dualDiffRows = readSheetRows(dualEntries, "13_Cross_Side_Structural_Diff");
assert.equal(dualDiffRows.length, 16, "governed cross-side sheet must have header plus 15 rule rows (16 populated rows)");
const dualNonClaims = dualDiffRows.find((row) => row.values.get(1) === "Explicit non-claims")?.values.get(2) ?? "";
for (const claim of ["NOT ECS", "NOT FRICTION", "NOT SEVERITY", "NOT RESOURCE PRESSURE"]) {
  assert.ok(dualNonClaims.toUpperCase().includes(claim), `governed non-claim missing: ${claim}`);
}

const exportedDiff = scoringAndTriage.dualRespondentComparison?.crossSideStructuralDifferentiation;
assert.ok(Array.isArray(exportedDiff) && exportedDiff.length === 13, "exported cross-side section must mirror workbook Field rows");

const uiEntries = readZipEntries(UI_WORKBOOK);
const screenSpec = readSheetRows(uiEntries, "APPENDIX_B SCREEN_SPEC");
const screen10b = screenSpec.find((row) => /^Screen 10b\b/.test(String(row.values.get(1) ?? "")));
assert.ok(screen10b, "Screen 10b row must exist");
const screen10bBody = [...screen10b.values.values()].join("\n");
assert.ok(screen10bBody.includes("{compatibilityRange}"), "Screen 10b must bind calculated compatibilityRange");
assert.ok(screen10bBody.includes("{riskBand}"), "Screen 10b must bind calculated riskBand");
assert.equal(screen10bBody.includes("80\u201395") || screen10bBody.includes("80-95"), false);
assert.equal(/Compatibility:\s*95\u2013100/.test(screen10bBody), false, "Screen 10b must not hardcode 95-100");

const derivationEntries = readZipEntries(ECS_DERIVATION_WORKBOOK);
const caveatRows = readSheetRows(derivationEntries, "Interpretation_Caveats");
const alignedCaveat = caveatRows.find((row) => String(row.values.get(1) ?? "").includes("Aligned suppression"))?.values.get(2) ?? "";
assert.ok(alignedCaveat.includes("NF/SFJ"), "aligned-suppression source must name NF/SFJ");
assert.ok(alignedCaveat.includes("SFP/SFJ"), "aligned-suppression source must name SFP/SFJ");
assert.ok(alignedCaveat.includes("15 of 17"), "aligned-suppression source must state 15 of 17 suppression");
assert.deepEqual([...ALIGNED_SUPPRESSION_ENVIRONMENTS], ["NF/SFJ", "SFP/SFJ"]);

const eriEntries = readZipEntries(ERI_WORKBOOK);
const eriRows = readSheetRows(eriEntries, "Resource Priority");
const b25 = eriRows.find((row) => row.row === 25)?.values.get(2) ?? "";
assert.ok(b25.includes("NF/SFJ") && b25.includes("SFP/SFJ") && b25.includes("STP/STJ"));
assert.deepEqual([...ERI_B25_EXTRACTION_ENVIRONMENTS], ["NF/SFJ", "SFP/SFJ", "STP/STJ"]);

const ecsEntries = readZipEntries(ECS_WORKBOOK);
const rimRows = readSheetRows(ecsEntries, "Resource Impact Matrix");
const rimHeader = rimRows.find((row) => row.values.get(2) === "Resource" && ENV_CODES.includes(row.values.get(3)));
assert.ok(rimHeader, "Resource Impact Matrix header row not found");
const rimEnvColumns = new Map();
for (const [column, code] of rimHeader.values) {
  if (column > 2 && ENV_CODES.includes(code)) rimEnvColumns.set(column, code);
}
assert.equal(rimEnvColumns.size, 9);
const netEffect = new Map();
for (const row of rimRows) {
  const resource = row.values.get(2);
  if (!CANONICAL_RESOURCES.includes(resource)) continue;
  const perCode = new Map();
  for (const [column, code] of rimEnvColumns) {
    const sign = row.values.get(column);
    assert.ok(["+", "-", "~"].includes(sign), `Malformed Net Effect for ${resource}/${code}: ${sign}`);
    perCode.set(code, sign);
  }
  netEffect.set(resource, perCode);
}
assert.equal(netEffect.size, 17, "canonical Net Effect source must contain 17 resources");

function independentEcs(acquirer, target) {
  let conflictPoints = 0;
  for (const resource of CANONICAL_RESOURCES) {
    conflictPoints += conflictPointsForEffects(netEffect.get(resource).get(acquirer), netEffect.get(resource).get(target));
  }
  return {
    conflictPoints,
    ecs: roundOne(100 * (1 - conflictPoints / 34)),
  };
}

const ecsMatrix = new Map(
  (narrativesAndFriction.friction?.ecsMatrix ?? []).map((row) => [row.acquirerEnvironmentCode, row.targetScores]),
);

// A-G. 9/9 self-pairs, independently rederived ECS, diagonal parity, no 88, no 80-95.
for (const code of ENV_CODES) {
  const independent = independentEcs(code, code);
  assert.equal(independent.conflictPoints, 0, `${code} self-pair canonical C must be 0`);
  assert.equal(independent.ecs, 100, `${code} self-pair independently rederived ECS must be 100`);
  assert.equal(ecsMatrix.get(code)?.[code], 100, `${code} physical diagonal must be 100`);

  const derived = canonicalStructuralEcs(code, code);
  assert.equal(derived.conflictPoints, 0);
  assert.equal(derived.ecs, 100);
  assert.equal(derived.formula.includes("C / 34"), true);
  assert.notEqual(derived.ecs, 88);

  const { deliverable, model, design } = publicSurfaces(code);
  assert.equal(deliverable.screen, "screen-10b");
  assert.equal(deliverable.pairMode, "homogeneous");
  assert.equal(deliverable.compatibilityScore, 100);
  assert.equal(deliverable.compatibilityScore === 88, false);
  assert.equal(deliverable.compatibilityRange, compatibilityRange(100));
  assert.equal(deliverable.compatibilityRange, "95\u2013100");
  assert.equal(deliverable.riskBand, canonicalRiskBand(100));
  assert.equal(deliverable.riskBand, "HIGH COMPATIBILITY");
  assert.equal(deliverable.structuralCompatibility.derivation.conflictPoints, 0);
  assert.equal(String(deliverable.body).includes("80\u201395"), false);
  assert.ok(String(deliverable.body).includes("95\u2013100"));
  assert.equal(deliverable.protocol?.name === "RHQA", false);
  assert.equal(model.metadata.pairSourceClass, "homogeneous");
  assert.equal(model.metadata.sourceBinding.pairMode, "homogeneous");
  assert.equal(design.pairMode, "homogeneous");
  assert.equal(model.resourceConflictMap.resources.length, 17);
  for (const resource of model.resourceConflictMap.resources) {
    assert.equal(resource.conflictIntensity, null, `${code} public resource row must not carry contestation intensity`);
    assert.equal(resource.conflictBand, "");
    assert.ok(resource.sharedStateClass);
    assert.ok(resource.eriTier);
  }
  const serialized = JSON.stringify({ deliverable: {
    body: deliverable.body,
    nextStep: deliverable.nextStep,
    structuralCompatibility: deliverable.structuralCompatibility,
  }, model, design });
  for (const forbidden of HOMOGENEOUS_FORBIDDEN) {
    assert.equal(serialized.includes(forbidden), false, `${code} homogeneous public output leaked ${forbidden}`);
  }
  assert.equal(/Protect [A-Z]/.test(serialized), false, `${code} homogeneous output must not emit unsourced Protect-X`);
}

// H. Evidence issuance gate: ECS unchanged; qualification changes.
const gateCases = [
  { name: "strong non-co-present", overrides: {}, status: "confirmed" },
  { name: "weak", overrides: { acquirerSignalStrength: "weak" }, status: "provisional" },
  { name: "co-present", overrides: { targetCoPresence: true }, status: "provisional" },
  { name: "weak + co-present", overrides: { acquirerSignalStrength: "weak", targetCoPresence: true }, status: "provisional" },
];
for (const testCase of gateCases) {
  const { deliverable, model } = publicSurfaces("NF/NT", testCase.overrides);
  assert.equal(deliverable.compatibilityScore, 100, `${testCase.name}: structural ECS must stay 100`);
  assert.equal(deliverable.structuralCompatibility.canonicalScore, 100);
  assert.equal(deliverable.structuralCompatibility.status, testCase.status, `${testCase.name}: status`);
  const explanation = model.compatibilityScoreAndDealScenario.compatibilityExplanation;
  if (testCase.status === "provisional") {
    assert.ok(explanation.includes("provisional"), `${testCase.name}: public qualification must change`);
  } else {
    assert.equal(explanation.includes("provisional"), false, `${testCase.name}: confirmed issuance must not be marked provisional`);
  }
}

// I-P. Differentiation arithmetic, symmetry, Q9/Q10 letters, missing/non-comparable, TOD/EDv2 isolation.
const identical = buildCrossSideStructuralDifferentiation(responses(), responses());
assert.equal(identical.mode, "within_environment_structural_differentiation");
assert.equal(identical.status, "available");
assert.equal(identical.agreeCount + identical.divergeCount, identical.comparableCount);
assert.equal(identical.divergeCount, 0);
assert.equal(identical.agreeCount, identical.comparableCount);

const oneChanged = buildCrossSideStructuralDifferentiation(responses(), responses({ Q1: "B" }));
assert.equal(oneChanged.divergeCount, 1);
assert.equal(oneChanged.agreeCount, oneChanged.comparableCount - 1);
assert.equal(oneChanged.summary, `1 of ${oneChanged.comparableCount} comparable structural dimensions differ`);

const twoChanged = buildCrossSideStructuralDifferentiation(responses(), responses({ Q1: "B", Q2: "C" }));
assert.equal(twoChanged.divergeCount, 2);

const swapped = buildCrossSideStructuralDifferentiation(responses({ Q1: "B" }), responses());
assert.equal(swapped.comparableCount, oneChanged.comparableCount);
assert.equal(swapped.agreeCount, oneChanged.agreeCount);
assert.equal(swapped.divergeCount, oneChanged.divergeCount);

const q9q10 = buildCrossSideStructuralDifferentiation(
  responses({ Q9: "A", Q10: "B" }),
  responses({ Q9: "A", Q10: "C" }),
);
assert.equal(q9q10.rows.find((row) => row.questionId === "Q9").comparisonStatus, "aligned");
assert.equal(q9q10.rows.find((row) => row.questionId === "Q10").comparisonStatus, "divergent");
assert.equal(q9q10.divergeCount, 1);

const missing = buildCrossSideStructuralDifferentiation(responses({ Q3: null }), responses());
assert.equal(missing.rows.find((row) => row.questionId === "Q3").comparisonStatus, "not_comparable");
assert.equal(missing.comparableCount, identical.comparableCount - 1);
assert.equal(missing.agreeCount + missing.divergeCount, missing.comparableCount);

const observationGap = buildCrossSideStructuralDifferentiation(responses({ Q1: "E" }), responses({ Q1: "A" }));
assert.equal(observationGap.rows.find((row) => row.questionId === "Q1").comparisonStatus, "not_comparable");

const q6eComparable = buildCrossSideStructuralDifferentiation(responses({ Q6: "E" }), responses({ Q6: "A" }));
assert.equal(q6eComparable.rows.find((row) => row.questionId === "Q6").comparisonStatus, "divergent");

const q11eComparable = buildCrossSideStructuralDifferentiation(responses({ Q11: "E" }), responses({ Q11: "A" }));
assert.equal(q11eComparable.rows.find((row) => row.questionId === "Q11").comparisonStatus, "divergent");

const empty = buildCrossSideStructuralDifferentiation([], []);
assert.equal(empty.status, "insufficient_comparable_cross_side_evidence");
assert.equal(empty.comparableCount, 0);

const todOnly = buildCrossSideStructuralDifferentiation(
  [{ questionId: "TOD-Q1", selectedOption: "A" }],
  [{ questionId: "EDv2-Q1", selectedOption: "B" }],
);
assert.equal(todOnly.status, "insufficient_comparable_cross_side_evidence");
assert.equal(todOnly.comparableCount, 0);

// Q-S. 153-row structural resource profile, Net Effect parity, ERI tier parity.
let profileRows = 0;
for (const code of ENV_CODES) {
  const profile = buildStructuralResourceProfile(code);
  assert.equal(profile.resourceCount, 17);
  assert.equal(profile.resources.length, 17);
  for (const row of profile.resources) {
    profileRows += 1;
    assert.equal(row.canonicalNetEffect, netEffect.get(row.resource).get(code), `${code} ${row.resource} Net Effect parity`);
    assert.ok(["+", "~", "-"].includes(row.canonicalNetEffect));
    assert.ok(["TOP", "MID", "LOW", "IGN"].includes(row.eriTier));
    assert.equal(
      row.sharedStateClass,
      row.canonicalNetEffect === "+"
        ? "shared_amplified_structural_state"
        : row.canonicalNetEffect === "~"
          ? "shared_neutral_structural_state"
          : "shared_suppressed_structural_state",
    );
  }
  const suppressed = profile.resources.filter((row) => row.canonicalNetEffect === "-").length;
  assert.equal(profile.alignedSuppression.applies, ALIGNED_SUPPRESSION_ENVIRONMENTS.includes(code));
  if (ALIGNED_SUPPRESSION_ENVIRONMENTS.includes(code)) {
    assert.equal(suppressed, 15, `${code} source-named predominantly-negative profile must suppress 15 of 17`);
  }
}
assert.equal(profileRows, 153);

// T-V. Public homogeneous resources are categorical, not numeric contestation.
for (const code of ENV_CODES) {
  const { model } = publicSurfaces(code);
  assert.equal(model.resourceConflictMap.resources.every((row) => row.conflictIntensity == null), true);
  assert.equal(JSON.stringify(model.resourceConflictMap).includes("IGN penalty"), false);
}

// W-X. Aligned suppression and B25 public caveats.
for (const code of ALIGNED_SUPPRESSION_ENVIRONMENTS) {
  const { model } = publicSurfaces(code);
  assert.ok((model.resourceConflictMap.structuralCaveats ?? []).some((text) => text.includes("Aligned-suppression")));
}
for (const code of ENV_CODES.filter((item) => !ALIGNED_SUPPRESSION_ENVIRONMENTS.includes(item))) {
  const { model } = publicSurfaces(code);
  assert.equal((model.resourceConflictMap.structuralCaveats ?? []).some((text) => text.includes("Aligned-suppression")), false);
}
for (const code of ERI_B25_EXTRACTION_ENVIRONMENTS) {
  const { deliverable, model } = publicSurfaces(code);
  assert.equal(deliverable.structuralResourceProfile.b25Guardrail.applies, true);
  assert.ok((model.resourceConflictMap.structuralCaveats ?? []).some((text) => text.includes("extraction or complicity")));
  const plusTop = deliverable.structuralResourceProfile.resources.filter((row) => row.canonicalNetEffect === "+" && row.eriTier === "TOP");
  for (const row of plusTop) {
    assert.equal(row.interpretationGuardrail, "ERI_B25_EXTRACTION_OR_COMPLICITY");
  }
}

// Y-AB. No RHQA / Protect-X / unsupported causal fallback; explicit identity.
const homogeneousBody = FINAL_DELIVERABLE_DATA.screenCopy.homogeneousBody;
assert.equal(homogeneousBody.includes("RHQA"), false);
assert.ok(homogeneousBody.includes("{compatibilityRange}"));
assert.ok(homogeneousBody.includes("{riskBand}"));
assert.equal(homogeneousBody.includes("80\u201395"), false);

// AE. 72/72 heterogeneous semantic non-regression: no RMP-3 fields on hetero objects;
// physical ECS/resource-conflict authority remains.
let heteroCount = 0;
for (const acquirer of ENV_CODES) {
  for (const target of ENV_CODES) {
    if (acquirer === target) continue;
    heteroCount += 1;
    const deliverable = buildPairDeliverable({
      acquirerEnvironmentCode: acquirer,
      targetEnvironmentCode: target,
    });
    const model = buildMergevuePublicReportModel(session, {
      deliverable,
      generatedAt: "2026-08-28T00:00:00.000Z",
    });
    const design = buildMergevueForecastBriefDesignModel(model);
    assert.equal(deliverable.screen, "screen-10");
    assert.equal(Object.hasOwn(deliverable, "pairMode"), false, `${acquirer}->${target} must not carry homogeneous pairMode`);
    assert.equal(Object.hasOwn(deliverable, "structuralResourceProfile"), false);
    assert.equal(Object.hasOwn(deliverable, "withinEnvironmentDifferentiation"), false);
    assert.ok(deliverable.resourceConflictProfile?.allResources?.length === 17);
    assert.equal(Object.hasOwn(model.compatibilityScoreAndDealScenario, "withinEnvironmentDifferentiation"), false);
    assert.equal(Object.hasOwn(model.metadata.sourceBinding, "pairMode"), false);
    assert.equal(Object.hasOwn(design, "pairMode"), false);
    const collision = design.sections.find((section) => section.id === "collision");
    const resources = design.sections.find((section) => section.id === "resources");
    assert.equal(Object.hasOwn(collision ?? {}, "differentiation"), false);
    assert.equal(Object.hasOwn(collision ?? {}, "nextStep"), false);
    assert.equal(Object.hasOwn(resources ?? {}, "caveats"), false);
    assert.equal(Object.hasOwn(resources ?? {}, "differentiation"), false);
    const expectedScore = ecsMatrix.get(acquirer)?.[target];
    if (Number.isFinite(Number(expectedScore)) && Number.isFinite(Number(deliverable.compatibilityScore))) {
      assert.equal(Number(deliverable.compatibilityScore), Number(expectedScore), `${acquirer}->${target} ECS must match physical matrix`);
    }
  }
}
assert.equal(heteroCount, 72);

// AC/AD/AF path sentinels: RMP-1/RMP-2/C5 files are not this act's write surface.
const flowSource = fs.readFileSync(path.join(APP_ROOT, "src/flow/finalDeliverableFlow.js"), "utf8");
assert.equal(flowSource.includes("values[index]"), false, "RMP-1 sentinel: positional impact attachment must stay absent");
const rmp2 = fs.readFileSync(path.join(APP_ROOT, "scripts/validate-friction-direction-integrity.mjs"), "utf8");
assert.ok(rmp2.includes("Friction_Lookup"), "RMP-2 sentinel: friction-direction validator remains present");
assert.equal(fs.existsSync(path.join(APP_ROOT, "scripts/validate-c5b-candidate-pair-selector.mjs")), true);
assert.equal(fs.existsSync(path.join(APP_ROOT, "scripts/validate-c5c1-production-composition.mjs")), true);

const appSource = fs.readFileSync(path.join(APP_ROOT, "src/App.jsx"), "utf8");
const screen9aStart = appSource.indexOf("/* RMP3_SCREEN_9A_MODEL_START */");
const screen9aEnd = appSource.indexOf("/* RMP3_SCREEN_9A_MODEL_END */");
assert.ok(screen9aStart >= 0 && screen9aEnd > screen9aStart, "Screen 9a resource view-model markers must exist in App.jsx");
const screen9aModelSource = appSource.slice(screen9aStart, screen9aEnd);
assert.ok(screen9aModelSource.includes("function buildScreen9aResourcePanelModel(deliverable)"));
assert.equal(
  appSource.includes("function PreliminaryAssessmentReport") && appSource.includes("buildScreen9aResourcePanelModel(deliverable)"),
  true,
  "Live Screen 9a must consume the extracted resource view-model",
);
const prelimStart = appSource.indexOf("function PreliminaryAssessmentReport");
const prelimEnd = appSource.indexOf("function AnalystWorksheetPanel");
const prelimSource = appSource.slice(prelimStart, prelimEnd);
assert.equal(prelimSource.includes("deliverable.resourceConflictProfile"), false, "Live Screen 9a must not read resourceConflictProfile directly");
assert.ok(prelimSource.includes("resourcePanel.mode === \"homogeneous\""));
assert.ok(prelimSource.includes("structural resource profile") || prelimSource.includes("Structural Resource Profile"));

const buildScreen9aResourcePanelModel = (0, eval)(`(${screen9aModelSource.slice(screen9aModelSource.indexOf("function buildScreen9aResourcePanelModel"))})`);
assert.equal(typeof buildScreen9aResourcePanelModel, "function");

const SCREEN_9A_HOMOGENEOUS_FORBIDDEN = Object.freeze([
  "High-probability resource conflict",
  "high-probability conflict threshold",
  "17-resource scan",
  "recommended protocol route remains",
  "RHQA",
  "conflict probability",
  "IGN penalty",
  "primary tension",
]);

function screen9aSerialized(panel) {
  return JSON.stringify(panel);
}

for (const code of ENV_CODES) {
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: code,
    targetEnvironmentCode: code,
  });
  const panel = buildScreen9aResourcePanelModel(deliverable);
  assert.equal(panel.mode, "homogeneous", `${code} Screen 9a must use explicit homogeneous identity`);
  assert.equal(panel.title, "Structural Resource Profile");
  assert.equal(panel.resources.length, 17, `${code} Screen 9a must display 17 structural resources`);
  assert.equal(panel.scoreLabel, deliverable.structuralCompatibility.canonicalRange);
  assert.equal(panel.bandLabel, deliverable.structuralCompatibility.canonicalBand);
  assert.equal(panel.nextStepName.includes("Hierarchy Depth"), true, `${code} Screen 9a must use governed homogeneous next step`);
  assert.equal(Object.hasOwn(panel, "highConflictRows"), false, `${code} Screen 9a homogeneous model must not carry highConflictRows`);
  assert.equal(Object.hasOwn(panel, "conclusion"), false, `${code} Screen 9a homogeneous model must not carry legacy conclusion`);
  for (const row of panel.resources) {
    assert.equal(Object.hasOwn(row, "environmentInteractionScore"), false);
    assert.equal(Object.hasOwn(row, "probability"), false);
    assert.equal(Object.hasOwn(row, "conflictIntensity"), false);
    assert.ok(row.sharedStateLabel);
    assert.ok(row.eriTier);
  }
  const serialized = screen9aSerialized(panel);
  for (const forbidden of SCREEN_9A_HOMOGENEOUS_FORBIDDEN) {
    assert.equal(serialized.includes(forbidden), false, `${code} Screen 9a leaked ${forbidden}`);
  }
  assert.equal(serialized.includes("91"), false, `${code} Screen 9a must not display legacy 91 pseudo-score`);
  if (ALIGNED_SUPPRESSION_ENVIRONMENTS.includes(code)) {
    assert.ok(panel.caveats.some((text) => text.includes("Aligned-suppression")));
  }
  if (ERI_B25_EXTRACTION_ENVIRONMENTS.includes(code)) {
    assert.ok(panel.caveats.some((text) => text.includes("extraction or complicity")));
  }
}

const nfntLegacy = buildPairDeliverable({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NF/NT",
});
const nfntPanel = buildScreen9aResourcePanelModel(nfntLegacy);
assert.equal(nfntPanel.mode, "homogeneous");
assert.equal((nfntLegacy.resourceConflictProfile?.allResources ?? []).some((row) => row.environmentInteractionScore === 91), true, "internal 91 carrier may remain");
assert.equal(JSON.stringify(nfntPanel).includes("91"), false, "Screen 9a must not surface the internal 91 carrier");
assert.equal((nfntLegacy.resourceConflictProfile?.conclusion ?? []).some((sentence) => sentence.includes("protocol route remains")), true);
assert.equal(JSON.stringify(nfntPanel).includes("protocol route remains"), false);

const staleHomogeneousConsumer = (deliverable) => Object.freeze({
  mode: "homogeneous",
  title: "Resource Hierarchy Output",
  highConflictRows: deliverable.resourceConflictProfile?.highProbabilityConflicts ?? [],
  conclusion: deliverable.resourceConflictProfile?.conclusion ?? [],
  interactionScores: (deliverable.resourceConflictProfile?.allResources ?? []).map((row) => row.environmentInteractionScore),
});
const stalePanel = staleHomogeneousConsumer(nfntLegacy);
assert.equal(stalePanel.conclusion.some((sentence) => sentence.includes("protocol route remains")), true);
assert.equal(stalePanel.interactionScores.includes(91), true);

let screen9aHetero = 0;
for (const acquirer of ENV_CODES) {
  for (const target of ENV_CODES) {
    if (acquirer === target) continue;
    screen9aHetero += 1;
    const deliverable = buildPairDeliverable({
      acquirerEnvironmentCode: acquirer,
      targetEnvironmentCode: target,
    });
    const panel = buildScreen9aResourcePanelModel(deliverable);
    const profile = deliverable.resourceConflictProfile;
    assert.equal(panel.mode, "heterogeneous", `${acquirer}->${target} Screen 9a must remain heterogeneous`);
    assert.equal(panel.hasProfile, Boolean(profile));
    assert.deepEqual(
      (panel.highConflictRows ?? []).map((row) => row.resource),
      (profile?.highProbabilityConflicts ?? []).slice(0, 4).map((row) => row.resource),
    );
    assert.deepEqual(panel.conclusion, [...(profile?.conclusion ?? [])]);
    assert.equal(panel.scoreLabel, deliverable.compatibilityScore ?? deliverable.compatibilityRange);
  }
}
assert.equal(screen9aHetero, 72);

console.log("RMP-3 homogeneous semantics validation passed");
