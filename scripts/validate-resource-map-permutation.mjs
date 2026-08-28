import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import zlib from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FINAL_ENVIRONMENT_CODES,
  buildPairDeliverable,
  parseResourceImpact,
} from "../src/flow/finalDeliverableFlow.js";

// RMP-1 independent validator. Expected truth is derived live from the two
// governed source workbooks (canonical Net Effect + ERI Resource Priority),
// never from the production resource matrix.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NET_EFFECT_WORKBOOK = path.join(ROOT, "NewLogic 03.05.2026", "ST_ECS_v1_canonical.xlsx");
const ERI_WORKBOOK = path.join(ROOT, "NewLogic 03.05.2026", "ST_Environment_Resource_Intelligence_updated.xlsx");
const SOURCE_MANIFEST_PATH = path.join(ROOT, "src", "generated", "newlogic", "sourceManifest.json");
const FINAL_DELIVERABLE_FLOW_PATH = path.join(ROOT, "src", "flow", "finalDeliverableFlow.js");
const CANDIDATE_PAIR_SELECTOR_PATH = path.join(ROOT, "src", "flow", "candidatePairSelector.js");
const AGENT_DIRECTORY = path.join(ROOT, "src", "agent");

const EXPECTED_ENVIRONMENTS = Object.freeze([
  "NF/NT",
  "NT/STJ",
  "NT/STP",
  "NF/SFJ",
  "NF/SFP",
  "SFJ/SFP",
  "SFP/SFJ",
  "STJ/STP",
  "STP/STJ",
]);
const EXPECTED_RESOURCES = Object.freeze([
  "Time",
  "Energy",
  "Attention",
  "Money",
  "Reputation",
  "Trust",
  "Influence",
  "Information",
  "Connections",
  "Skills",
  "Knowledge",
  "Health",
  "Psychological resilience",
  "Will / discipline",
  "Creativity",
  "Decisiveness",
  "Organisation / system",
]);
const DISPLACED_ENVIRONMENTS = Object.freeze([
  "NF/NT",
  "NT/STJ",
  "NT/STP",
  "NF/SFP",
  "SFJ/SFP",
  "SFP/SFJ",
  "STJ/STP",
]);
const POSITIONAL_FIXED_POINTS = Object.freeze(["NF/SFJ", "STP/STJ"]);
const NET_EFFECT_VALUES = Object.freeze(["+", "-", "~"]);
const ERI_TIERS = Object.freeze(["TOP", "MID", "LOW", "IGN"]);
const ERI_GLYPH_TO_EFFECT = Object.freeze({ "\u25b2": "+", "\u2014": "~", "\u25bc": "-" });
const TIER_SCORES = Object.freeze({ IGN: 0, LOW: 1, MID: 2, TOP: 3 });
const EFFECT_LABELS = Object.freeze({ "+": "Amplifies", "-": "Suppresses", "~": "Neutral" });

// Frozen historical runtime state extracted from commit f17e777
// (src/flow/finalDeliverableFlow.js RESOURCE_PRIORITY_MATRIX as of HEAD
// before the RMP-1 repair). Used only as the "before" side of the
// permutation differential; it is never an expectation oracle.
const HEAD_F17E777_RESOURCE_BASELINE = Object.freeze({
  "Time": { "NF/NT": "+ MID", "NT/STJ": "~ MID", "NT/STP": "- TOP", "NF/SFJ": "- MID", "NF/SFP": "~ LOW", "SFJ/SFP": "~ LOW", "SFP/SFJ": "+ TOP", "STJ/STP": "+ TOP", "STP/STJ": "~ LOW" },
  "Energy": { "NF/NT": "+ TOP", "NT/STJ": "+ TOP", "NT/STP": "~ TOP", "NF/SFJ": "- MID", "NF/SFP": "+ TOP", "SFJ/SFP": "+ TOP", "SFP/SFJ": "+ TOP", "STJ/STP": "+ TOP", "STP/STJ": "+ TOP" },
  "Attention": { "NF/NT": "+ TOP", "NT/STJ": "~ LOW", "NT/STP": "- TOP", "NF/SFJ": "- MID", "NF/SFP": "+ TOP", "SFJ/SFP": "+ TOP", "SFP/SFJ": "+ TOP", "STJ/STP": "+ TOP", "STP/STJ": "+ TOP" },
  "Money": { "NF/NT": "+ LOW", "NT/STJ": "+ TOP", "NT/STP": "- MID", "NF/SFJ": "- MID", "NF/SFP": "~ LOW", "SFJ/SFP": "~ LOW", "SFP/SFJ": "+ TOP", "STJ/STP": "~ LOW", "STP/STJ": "+ TOP" },
  "Reputation": { "NF/NT": "+ TOP", "NT/STJ": "+ TOP", "NT/STP": "- MID", "NF/SFJ": "~ TOP", "NF/SFP": "+ TOP", "SFJ/SFP": "+ TOP", "SFP/SFJ": "+ TOP", "STJ/STP": "+ TOP", "STP/STJ": "+ TOP" },
  "Trust": { "NF/NT": "+ TOP", "NT/STJ": "- IGN", "NT/STP": "- MID", "NF/SFJ": "- LOW", "NF/SFP": "~ LOW", "SFJ/SFP": "+ TOP", "SFP/SFJ": "~ LOW", "STJ/STP": "+ TOP", "STP/STJ": "- IGN" },
  "Influence": { "NF/NT": "+ TOP", "NT/STJ": "+ TOP", "NT/STP": "- MID", "NF/SFJ": "- TOP", "NF/SFP": "+ TOP", "SFJ/SFP": "+ TOP", "SFP/SFJ": "+ MID", "STJ/STP": "+ MID", "STP/STJ": "+ TOP" },
  "Information": { "NF/NT": "~ LOW", "NT/STJ": "~ LOW", "NT/STP": "- MID", "NF/SFJ": "- LOW", "NF/SFP": "+ TOP", "SFJ/SFP": "~ LOW", "SFP/SFJ": "+ MID", "STJ/STP": "+ MID", "STP/STJ": "~ MID" },
  "Connections": { "NF/NT": "+ MID", "NT/STJ": "~ LOW", "NT/STP": "- LOW", "NF/SFJ": "~ TOP", "NF/SFP": "~ IGN", "SFJ/SFP": "+ MID", "SFP/SFJ": "~ IGN", "STJ/STP": "+ MID", "STP/STJ": "+ TOP" },
  "Skills": { "NF/NT": "+ MID", "NT/STJ": "+ TOP", "NT/STP": "- LOW", "NF/SFJ": "- LOW", "NF/SFP": "+ MID", "SFJ/SFP": "+ MID", "SFP/SFJ": "+ MID", "STJ/STP": "+ MID", "STP/STJ": "+ MID" },
  "Knowledge": { "NF/NT": "- LOW", "NT/STJ": "- IGN", "NT/STP": "- LOW", "NF/SFJ": "- LOW", "NF/SFP": "+ MID", "SFJ/SFP": "~ LOW", "SFP/SFJ": "+ MID", "STJ/STP": "+ MID", "STP/STJ": "- IGN" },
  "Health": { "NF/NT": "+ MID", "NT/STJ": "+ MID", "NT/STP": "- LOW", "NF/SFJ": "- TOP", "NF/SFP": "~ LOW", "SFJ/SFP": "+ MID", "SFP/SFJ": "~ IGN", "STJ/STP": "~ IGN", "STP/STJ": "- LOW" },
  "Psychological resilience": { "NF/NT": "+ MID", "NT/STJ": "~ LOW", "NT/STP": "- LOW", "NF/SFJ": "- LOW", "NF/SFP": "+ MID", "SFJ/SFP": "+ MID", "SFP/SFJ": "+ MID", "STJ/STP": "+ LOW", "STP/STJ": "~ LOW" },
  "Will / discipline": { "NF/NT": "- LOW", "NT/STJ": "+ MID", "NT/STP": "- TOP", "NF/SFJ": "- TOP", "NF/SFP": "+ MID", "SFJ/SFP": "~ LOW", "SFP/SFJ": "+ LOW", "STJ/STP": "+ LOW", "STP/STJ": "+ MID" },
  "Creativity": { "NF/NT": "- IGN", "NT/STJ": "~ LOW", "NT/STP": "- IGN", "NF/SFJ": "- IGN", "NF/SFP": "+ MID", "SFJ/SFP": "+ MID", "SFP/SFJ": "+ LOW", "STJ/STP": "+ LOW", "STP/STJ": "~ MID" },
  "Decisiveness": { "NF/NT": "- IGN", "NT/STJ": "+ MID", "NT/STP": "- IGN", "NF/SFJ": "- IGN", "NF/SFP": "+ LOW", "SFJ/SFP": "~ IGN", "SFP/SFJ": "+ LOW", "STJ/STP": "~ LOW", "STP/STJ": "+ MID" },
  "Organisation / system": { "NF/NT": "- LOW", "NT/STJ": "+ MID", "NT/STP": "~ TOP", "NF/SFJ": "- MID", "NF/SFP": "~ IGN", "SFJ/SFP": "- IGN", "SFP/SFJ": "+ LOW", "STJ/STP": "~ IGN", "STP/STJ": "+ MID" },
});

// --- minimal dependency-free XLSX reader (zip + sharedStrings + sheet rows) ---

function zipEntries(buffer) {
  let eocdOffset = -1;
  for (let index = buffer.length - 22; index >= 0 && index >= buffer.length - 22 - 65535; index -= 1) {
    if (buffer[index] === 0x50 && buffer[index + 1] === 0x4b && buffer[index + 2] === 0x05 && buffer[index + 3] === 0x06) {
      eocdOffset = index;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error("ZIP end-of-central-directory not found");
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = new Map();
  let cursor = centralOffset;
  for (let entry = 0; entry < entryCount; entry += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) throw new Error("ZIP central directory entry signature mismatch");
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const rawData = buffer.subarray(dataStart, dataStart + compressedSize);
    entries.set(name, method === 8 ? zlib.inflateRawSync(rawData) : Buffer.from(rawData));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function decodeXmlEntities(value) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function attributeValue(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeXmlEntities(match[1]) : null;
}

function xlsxSheetRows(workbookBuffer, wantedSheet) {
  const entries = zipEntries(workbookBuffer);
  const sharedStrings = [];
  const sharedXml = entries.get("xl/sharedStrings.xml");
  if (sharedXml) {
    const text = sharedXml.toString("utf8");
    for (const si of text.matchAll(/<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g)) {
      sharedStrings.push([...si[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((t) => decodeXmlEntities(t[1])).join(""));
    }
  }
  const workbookXml = entries.get("xl/workbook.xml").toString("utf8");
  const relsXml = entries.get("xl/_rels/workbook.xml.rels").toString("utf8");
  const relTargets = new Map();
  for (const rel of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
    relTargets.set(attributeValue(rel[0], "Id"), attributeValue(rel[0], "Target"));
  }
  let sheetTarget = null;
  for (const sheet of workbookXml.matchAll(/<sheet\b[^>]*>/g)) {
    if (decodeXmlEntities(attributeValue(sheet[0], "name") ?? "") === wantedSheet) {
      sheetTarget = relTargets.get(attributeValue(sheet[0], "r:id"));
    }
  }
  if (!sheetTarget) throw new Error(`Sheet not found in workbook: ${wantedSheet}`);
  let normalizedTarget = sheetTarget.replace(/\\/g, "/");
  if (normalizedTarget.startsWith("/")) normalizedTarget = normalizedTarget.slice(1);
  else if (!normalizedTarget.startsWith("xl/")) normalizedTarget = `xl/${normalizedTarget}`;
  const sheetXml = entries.get(normalizedTarget);
  if (!sheetXml) throw new Error(`Sheet part missing from workbook: ${normalizedTarget}`);
  const rows = [];
  for (const row of sheetXml.toString("utf8").matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const cells = new Map();
    for (const cell of row[2].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const cellAttributes = cell[1];
      const reference = attributeValue(cellAttributes, "r") ?? "";
      const columnMatch = reference.match(/^([A-Z]+)/);
      if (!columnMatch) continue;
      let columnNumber = 0;
      for (const char of columnMatch[1]) columnNumber = columnNumber * 26 + (char.charCodeAt(0) - 64);
      const cellType = attributeValue(cellAttributes, "t");
      let value = "";
      if (cellType === "inlineStr") {
        value = [...cell[2].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((t) => decodeXmlEntities(t[1])).join("");
      } else {
        const valueMatch = cell[2].match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/);
        if (valueMatch) {
          const raw = decodeXmlEntities(valueMatch[1]);
          value = cellType === "s" ? (sharedStrings[Number(raw)] ?? "") : raw;
        }
      }
      if (value !== "") cells.set(columnNumber, value);
    }
    if (cells.size > 0) rows.push({ rowNumber: Number(attributeValue(row[1], "r") ?? 0), cells });
  }
  return rows;
}

function columnValues(cells, startColumn, count) {
  const values = [];
  for (let column = startColumn; column < startColumn + count; column += 1) values.push(cells.get(column) ?? "");
  return values;
}

// --- RMP-01..RMP-07: independent source-derived truth ---

const netEffectRows = xlsxSheetRows(fs.readFileSync(NET_EFFECT_WORKBOOK), "Resource Impact Matrix");
const netEffectHeader = netEffectRows.find((row) => row.cells.get(2) === "Resource");
assert.ok(netEffectHeader, "RMP-03: canonical Net Effect header row ('Resource') must exist");
const netEffectEnvironments = columnValues(netEffectHeader.cells, 3, 9).map((code) => code.trim());
const netEffect = new Map();
for (const row of netEffectRows) {
  const resource = row.cells.get(2);
  if (!resource || !EXPECTED_RESOURCES.includes(resource) || row === netEffectHeader) continue;
  assert.ok(!netEffect.has(resource), `RMP-05: duplicate canonical resource row: ${resource}`);
  netEffect.set(resource, new Map(netEffectEnvironments.map((code, index) => [code, columnValues(row.cells, 3, 9)[index].trim()])));
}

const eriRows = xlsxSheetRows(fs.readFileSync(ERI_WORKBOOK), "Resource Priority");
const eriHeader = eriRows.find((row) => row.cells.get(2) === "Resource");
assert.ok(eriHeader, "RMP-04: ERI Resource Priority header row ('Resource') must exist");
const eriEnvironments = columnValues(eriHeader.cells, 4, 9).map((code) => code.trim().replace("\u26a0", "").trim());
const eriTier = new Map();
const eriGlyph = new Map();
for (const row of eriRows) {
  const resource = row.cells.get(2);
  if (!resource || !EXPECTED_RESOURCES.includes(resource) || row === eriHeader) continue;
  assert.ok(!eriTier.has(resource), `RMP-05: duplicate ERI resource row: ${resource}`);
  const tiers = new Map();
  const glyphs = new Map();
  eriEnvironments.forEach((code, index) => {
    const cell = columnValues(row.cells, 4, 9)[index].trim();
    const match = cell.match(/^([\u25b2\u2014\u25bc])\s+(TOP|MID|LOW|IGN)$/);
    assert.ok(match, `RMP-07: invalid ERI Resource Priority cell for ${resource} x ${code}: ${cell}`);
    tiers.set(code, match[2]);
    glyphs.set(code, ERI_GLYPH_TO_EFFECT[match[1]]);
  });
  eriTier.set(resource, tiers);
  eriGlyph.set(resource, glyphs);
}

assert.deepEqual([...netEffectEnvironments].sort(), [...EXPECTED_ENVIRONMENTS].sort(), "RMP-01: canonical environment set must be exactly the 9 expected codes");
assert.deepEqual([...eriEnvironments].sort(), [...EXPECTED_ENVIRONMENTS].sort(), "RMP-01: ERI environment columns must be exactly the 9 expected codes");
assert.deepEqual(FINAL_ENVIRONMENT_CODES, EXPECTED_ENVIRONMENTS, "RMP-01: runtime FINAL_ENVIRONMENT_CODES must equal the canonical environment set");
assert.deepEqual([...netEffect.keys()].sort(), [...EXPECTED_RESOURCES].sort(), "RMP-02: canonical resource set must be exactly the 17 expected resources");
assert.deepEqual([...eriTier.keys()].sort(), [...EXPECTED_RESOURCES].sort(), "RMP-02: ERI resource rows must be exactly the 17 expected resources");

for (const resource of EXPECTED_RESOURCES) {
  for (const code of EXPECTED_ENVIRONMENTS) {
    assert.ok(NET_EFFECT_VALUES.includes(netEffect.get(resource).get(code)), `RMP-06: invalid Net Effect for ${resource} x ${code}: ${netEffect.get(resource).get(code)}`);
  }
}
assert.equal(netEffect.size * 9, 153, "RMP-03: canonical Net Effect source must be complete (153/153)");
assert.equal(eriTier.size * 9, 153, "RMP-04: governed ERI tier source must be complete (153/153)");

const composedTruth = new Map();
for (const resource of EXPECTED_RESOURCES) {
  const perEnvironment = new Map();
  for (const code of EXPECTED_ENVIRONMENTS) {
    perEnvironment.set(code, `${netEffect.get(resource).get(code)} ${eriTier.get(resource).get(code)}`);
  }
  composedTruth.set(resource, perEnvironment);
}

// --- production runtime resource vectors, read through behavior only ---

function productionVectors() {
  const vectors = new Map();
  for (const code of EXPECTED_ENVIRONMENTS) {
    const deliverable = buildPairDeliverable({ acquirerEnvironmentCode: code, targetEnvironmentCode: code });
    assert.equal(deliverable.screen, "screen-10b", `homogeneous deliverable expected for ${code}`);
    const rows = deliverable.resourceConflictProfile.allResources;
    assert.equal(rows.length, 17, `RMP-14: ${code} self-pair must expose all 17 resources`);
    vectors.set(code, new Map(rows.map((row) => [row.resource, `${row.acquirerImpact.effect} ${row.acquirerImpact.tier}`])));
  }
  return vectors;
}

const production = productionVectors();
let parityMatches = 0;
const parityMismatches = [];
for (const resource of EXPECTED_RESOURCES) {
  for (const code of EXPECTED_ENVIRONMENTS) {
    const produced = production.get(code).get(resource);
    const expected = composedTruth.get(resource).get(code);
    if (produced === expected) parityMatches += 1;
    else parityMismatches.push(`${resource} x ${code}: produced=${produced} expected=${expected}`);
  }
}
assert.deepEqual(parityMismatches, [], `RMP-08: production resource matrix must match composed canonical truth for all 153 cells (${parityMatches}/153 matched)`);
assert.equal(parityMatches, 153, "RMP-08: exact 153/153 parity required");

// RMP-09 + Phase 11 sentinels
assert.equal(production.get("STJ/STP").get("Health"), "~ MID", "RMP-09: STJ/STP x Health must be '~ MID'");
assert.notEqual(HEAD_F17E777_RESOURCE_BASELINE.Health["STJ/STP"], "~ MID", "RMP-09 sentinel: HEAD f17e777 must carry the historical STJ/STP x Health defect value");

// --- Phase 10: permutation differential HEAD f17e777 vs composed truth ---

let differentialTotal = 0;
let differentialDirection = 0;
let differentialBoth = 0;
let differentialDirectionOnly = 0;
let differentialTierOnly = 0;
const changedCellsByEnvironment = new Map(EXPECTED_ENVIRONMENTS.map((code) => [code, 0]));
for (const resource of EXPECTED_RESOURCES) {
  for (const code of EXPECTED_ENVIRONMENTS) {
    const [oldDirection, oldTier] = HEAD_F17E777_RESOURCE_BASELINE[resource][code].split(" ");
    const [newDirection, newTier] = composedTruth.get(resource).get(code).split(" ");
    const directionChanged = oldDirection !== newDirection;
    const tierChanged = oldTier !== newTier;
    if (directionChanged) differentialDirection += 1;
    if (directionChanged && tierChanged) differentialBoth += 1;
    else if (directionChanged) differentialDirectionOnly += 1;
    else if (tierChanged) differentialTierOnly += 1;
    if (directionChanged || tierChanged) {
      differentialTotal += 1;
      changedCellsByEnvironment.set(code, changedCellsByEnvironment.get(code) + 1);
    }
  }
}
assert.equal(differentialTotal, 89, `Phase 10: total changed cells must be 89/153 (derived: ${differentialTotal})`);
assert.equal(differentialDirection, 74, `Phase 10: wrong-direction cells repaired must be 74/153 (derived: ${differentialDirection})`);
assert.equal(differentialBoth, 56, `Phase 10: direction+tier changed cells must be 56 (derived: ${differentialBoth})`);
assert.equal(differentialDirectionOnly, 18, `Phase 10: direction-only changed cells must be 18 (derived: ${differentialDirectionOnly})`);
assert.equal(differentialTierOnly, 15, `Phase 10: tier-only changed cells must be 15 (derived: ${differentialTierOnly})`);

// --- Phase 11: historical defect sentinels ---

for (const code of DISPLACED_ENVIRONMENTS) {
  assert.ok(changedCellsByEnvironment.get(code) > 0, `RMP-10: displaced environment ${code} must now receive its own (changed) vector`);
}
for (const code of POSITIONAL_FIXED_POINTS) {
  for (const resource of EXPECTED_RESOURCES) {
    assert.equal(
      HEAD_F17E777_RESOURCE_BASELINE[resource][code],
      composedTruth.get(resource).get(code),
      `RMP-11: historical fixed point ${code} x ${resource} must remain correct after repair`,
    );
  }
}
const knowledgePair = buildPairDeliverable({ acquirerEnvironmentCode: "NF/NT", targetEnvironmentCode: "NT/STJ" });
const knowledgeRow = knowledgePair.resourceConflictProfile.allResources.find((row) => row.resource === "Knowledge");
assert.equal(knowledgeRow.acquirerImpact.label, "Amplifies MID", "Phase 11: NF/NT->NT/STJ Knowledge acquirer reading must be Amplifies MID");
assert.equal(knowledgeRow.targetImpact.label, "Amplifies MID", "Phase 11: NF/NT->NT/STJ Knowledge target reading must be Amplifies MID");

// --- RMP-12: keyed identity is structural, not positional ---

const flowSource = fs.readFileSync(FINAL_DELIVERABLE_FLOW_PATH, "utf8");
const profileBlocks = [...flowSource.matchAll(/resourceProfile\("([^"]+)",\s*"[A-Z]{2}",\s*\{([\s\S]*?)\}/g)];
assert.equal(profileBlocks.length, 17, "RMP-12: 17 keyed resourceProfile rows expected in production source");
for (const block of profileBlocks) {
  for (const code of EXPECTED_ENVIRONMENTS) {
    assert.ok(new RegExp(`"${code}":`).test(block[2]), `RMP-12: resource ${block[1]} must key an impact explicitly by ${code}`);
  }
}
assert.equal(flowSource.includes("values[index]"), false, "RMP-12: production must not attach impacts by array position");
assert.equal(flowSource.includes("Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code, index)"), false, "RMP-12: positional environment zipping must not be reintroduced");

// RMP-11: no environment special-casing — each code may appear only in the
// FINAL_ENVIRONMENT_CODES declaration and once per keyed resource row
// (SFP/SFJ additionally in the legacy SP/SJ normalization).
const expectedOccurrences = Object.freeze({ "SFP/SFJ": 19 });
for (const code of EXPECTED_ENVIRONMENTS) {
  const occurrences = flowSource.split(`"${code}"`).length - 1;
  assert.equal(occurrences, expectedOccurrences[code] ?? 18, `RMP-11: environment code ${code} must not appear in special-case logic`);
}

// --- RMP-13 / RMP-14: full ordered pair universe ---

let materializedRows = 0;
const vectorByResource = (deliverable) => new Map(deliverable.resourceConflictProfile.allResources.map((row) => [row.resource, row]));
for (const acquirer of EXPECTED_ENVIRONMENTS) {
  for (const target of EXPECTED_ENVIRONMENTS) {
    const forward = buildPairDeliverable({ acquirerEnvironmentCode: acquirer, targetEnvironmentCode: target });
    const forwardRows = vectorByResource(forward);
    assert.equal(forwardRows.size, 17, `RMP-14: ${acquirer}->${target} must materialize 17 resource rows`);
    for (const [resource, row] of forwardRows) {
      for (const impact of [row.acquirerImpact, row.targetImpact]) {
        assert.ok(NET_EFFECT_VALUES.includes(impact.effect), `RMP-14: invalid effect for ${resource} in ${acquirer}->${target}`);
        assert.ok(ERI_TIERS.includes(impact.tier), `RMP-14: invalid tier for ${resource} in ${acquirer}->${target}`);
        assert.equal(impact.tierScore, TIER_SCORES[impact.tier], `RMP-14: tier score must follow the tier for ${resource} in ${acquirer}->${target}`);
        assert.equal(impact.label, `${EFFECT_LABELS[impact.effect]} ${impact.tier}`, `RMP-14: impact label must follow effect and tier for ${resource} in ${acquirer}->${target}`);
      }
      materializedRows += 1;
    }
    if (acquirer === target) continue;
    const reverse = buildPairDeliverable({ acquirerEnvironmentCode: target, targetEnvironmentCode: acquirer });
    const reverseRows = vectorByResource(reverse);
    for (const [resource, row] of forwardRows) {
      const mirrored = reverseRows.get(resource);
      assert.equal(row.acquirerImpact.effect, mirrored.targetImpact.effect, `RMP-13: ${resource} acquirer effect must swap cleanly for ${acquirer}->${target}`);
      assert.equal(row.acquirerImpact.tier, mirrored.targetImpact.tier, `RMP-13: ${resource} acquirer tier must swap cleanly for ${acquirer}->${target}`);
      assert.equal(row.targetImpact.effect, mirrored.acquirerImpact.effect, `RMP-13: ${resource} target effect must swap cleanly for ${acquirer}->${target}`);
      assert.equal(row.targetImpact.tier, mirrored.acquirerImpact.tier, `RMP-13: ${resource} target tier must swap cleanly for ${acquirer}->${target}`);
    }
  }
}
assert.equal(materializedRows, 1377, "RMP-14: 81 ordered pairs x 17 resources = 1377 rows must materialize");

// --- RMP-15 / RMP-16: fail-closed behavior ---

assert.throws(() => buildPairDeliverable({ acquirerEnvironmentCode: "XX/YY", targetEnvironmentCode: "NF/NT" }), /Invalid canonical resource impact/, "RMP-15: unknown acquirer environment must fail closed");
assert.throws(() => buildPairDeliverable({ acquirerEnvironmentCode: "NF/NT", targetEnvironmentCode: "XX/YY" }), /Invalid canonical resource impact/, "RMP-15: unknown target environment must fail closed");
for (const invalid of [undefined, null, "", "garbage", "+LOW", "~ low", "~ LOW ", "+ MID extra"]) {
  assert.throws(() => parseResourceImpact(invalid), /Invalid canonical resource impact/, `RMP-16: malformed/missing impact must fail closed: ${JSON.stringify(invalid)}`);
}
assert.deepEqual(parseResourceImpact("~ LOW"), { effect: "~", tier: "LOW", tierScore: 1, label: "Neutral LOW" }, "RMP-16: lawful '~ LOW' must still parse");

// --- RMP-17 / RMP-18: governed provenance ---

const manifest = JSON.parse(fs.readFileSync(SOURCE_MANIFEST_PATH, "utf8"));
const manifestEntry = manifest.workbooks.find((entry) => entry.file === "ST_Environment_Resource_Intelligence_updated.xlsx");
assert.ok(manifestEntry, "RMP-17: governed ERI workbook must be present in sourceManifest");
assert.equal(
  manifestEntry.sha256,
  createHash("sha256").update(fs.readFileSync(ERI_WORKBOOK)).digest("hex"),
  "RMP-17: sourceManifest ERI digest must match the physical governed workbook",
);
assert.match(manifestEntry.governedRole ?? "", /Resource Priority tier/i, "RMP-17: manifest entry must declare the Resource Priority tier role");
assert.match(manifestEntry.governedRole ?? "", /not canonical for Net Effect/i, "RMP-17: manifest entry must not declare ERI direction glyphs canonical for Net Effect");
const admissionSource = process.env.RMP1_ERI_ADMISSION_SOURCE;
if (admissionSource) {
  assert.equal(
    createHash("sha256").update(fs.readFileSync(admissionSource)).digest("hex"),
    manifestEntry.sha256,
    "RMP-18: admission source workbook must be byte-identical to the governed copy",
  );
} else {
  console.log("RMP-18 note: external admission source not provided; governed digest is the permanent provenance anchor.");
}

// --- RMP-19 / RMP-20: forbidden runtime dependencies ---

assert.equal(flowSource.includes("caseStudies"), false, "RMP-19: resource layer must not depend on the case-study vocabulary");
assert.equal(flowSource.includes("data/environments"), false, "RMP-19: resource layer must not depend on environments.js resourceTarget prose");
const caseStudiesSource = fs.readFileSync(path.join(ROOT, "src", "data", "caseStudies.js"), "utf8");
const caseStudyLabelsBlock = caseStudiesSource.match(/const RESOURCE_LABELS = Object\.freeze\(\[([\s\S]*?)\]\)/);
assert.ok(caseStudyLabelsBlock, "RMP-19: legacy case-study RESOURCE_LABELS vocabulary must remain a distinct list");
const caseStudyLabels = [...caseStudyLabelsBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(caseStudyLabels).size, 17, "RMP-19: legacy case-study vocabulary must keep its own 17 distinct labels");
assert.notDeepEqual([...new Set(caseStudyLabels)].sort(), [...EXPECTED_RESOURCES].sort(), "RMP-19: canonical and case-study vocabularies must not be merged");

const selectorSource = fs.readFileSync(CANDIDATE_PAIR_SELECTOR_PATH, "utf8");
assert.equal(selectorSource.includes("RESOURCE_PRIORITY_MATRIX"), false, "RMP-20: candidate pair selector must stay resource-independent");
assert.equal(selectorSource.includes("resourceConflictProfile"), false, "RMP-20: candidate pair selector must stay resource-independent");
assert.equal(selectorSource.includes("finalDeliverableFlow"), false, "RMP-20: candidate pair selector must stay resource-independent");
const agentFiles = fs.existsSync(AGENT_DIRECTORY) ? fs.readdirSync(AGENT_DIRECTORY, { recursive: true }).filter((file) => /\.m?js$/.test(file)) : [];
for (const file of agentFiles) {
  const agentSource = fs.readFileSync(path.join(AGENT_DIRECTORY, file), "utf8");
  assert.equal(agentSource.includes("RESOURCE_PRIORITY_MATRIX"), false, `RMP-20: agent layer file must stay resource-independent: ${file}`);
}

console.log(`RMP-1 resource map permutation validation passed: 153/153 composed parity, ${materializedRows} pair rows, differential ${differentialTotal} changed / ${differentialDirection} direction-repaired.`);
