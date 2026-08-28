import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { buildMergevuePublicReportModel } from "../src/reporting/mergevuePublicReportModel.js";
import { buildPairDeliverable } from "../src/flow/finalDeliverableFlow.js";
import { FINAL_DELIVERABLE_DATA } from "../src/data/finalDeliverableData.js";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = path.join(APP_ROOT, "NewLogic 03.05.2026");
const FRICTION_WORKBOOK = path.join(SOURCE_DIR, "ST_Friction_Point_Lookup_updated.xlsx");
const ECS_WORKBOOK = path.join(SOURCE_DIR, "ST_ECS_v1_canonical.xlsx");
const ERI_WORKBOOK = path.join(SOURCE_DIR, "ST_Environment_Resource_Intelligence_updated.xlsx");

const ENV_CODES = Object.freeze([
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
const ENV_SOURCE = [...ENV_CODES].sort((left, right) => right.length - left.length).join("|");
const CANONICAL_RESOURCES = Object.freeze([
  "Time", "Energy", "Attention", "Money", "Reputation", "Trust", "Influence",
  "Information", "Connections", "Skills", "Knowledge", "Health",
  "Psychological resilience", "Will / discipline", "Creativity", "Decisiveness",
  "Organisation / system",
]);

// Canonical truth is read from the physical NewLogic workbooks; production
// report output is never an oracle in this validator.
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

function sheetXml(entries, sheetName) {
  const workbook = decodeXmlEntities(entries.get("xl/workbook.xml").toString("utf8"));
  const rels = decodeXmlEntities(entries.get("xl/_rels/workbook.xml.rels").toString("utf8"));
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
      return decodeXmlEntities(xml.toString("utf8"));
    }
  }
  throw new Error(`sheet not found: ${sheetName}`);
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
    const shared = decodeXmlEntities(entries.get("xl/sharedStrings.xml").toString("utf8"));
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
      value = String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/[ \t]+/g, " ").trim();
      if (value !== "" && ref) values.set(columnNumber(ref), value);
    }
    if (values.size > 0) rows.push({ row: rowNumber, values });
  }
  return rows;
}

const ASSERTION_PATTERN = new RegExp(
  `\\(\\s*([+~\\-\\u2212])\\s*(${ENV_SOURCE})(?![A-Za-z/])[^()]*?`
    + `\\s+vs\\s+([+~\\-\\u2212])\\s*(${ENV_SOURCE})(?![A-Za-z/])[^()]*?\\)`,
  "iu",
);
const ENV_MENTION_PATTERN = new RegExp(`(?<![A-Za-z/])(${ENV_SOURCE})(?![A-Za-z/])`, "giu");
const ASSERTION_SPLIT_PATTERN = /,\s*(?=[A-Z][A-Za-z /]+ \()/;

function normalizeSign(sign) {
  return sign === "\u2212" ? "-" : sign;
}

function normalizeResourceKey(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/organisation/g, "organization")
    .replace(/repute/g, "reputation")
    .replace(/psychological resilience/g, "psychologicalresilience")
    .replace(/[^a-z]/g, "");
}

// ── Independent canonical oracle A: Net Effect from the ECS workbook ──
const ecsEntries = readZipEntries(ECS_WORKBOOK);
const rimRows = readSheetRows(ecsEntries, "Resource Impact Matrix");
const rimHeader = rimRows.find((row) => row.values.get(2) === "Resource" && row.values.get(3) === "NF/NT");
assert.ok(rimHeader, "Resource Impact Matrix header row not found");
const rimEnvColumns = new Map();
for (const [column, code] of rimHeader.values) {
  if (column > 2 && ENV_CODES.includes(code)) rimEnvColumns.set(column, code);
}
assert.equal(rimEnvColumns.size, 9, "Resource Impact Matrix must cover exactly 9 environments");
const netEffect = new Map();
for (const row of rimRows) {
  const resource = row.values.get(2);
  if (!CANONICAL_RESOURCES.includes(resource)) continue;
  for (const [column, code] of rimEnvColumns) {
    const sign = row.values.get(column);
    assert.ok(["+", "-", "~"].includes(sign), `Malformed Net Effect sign for ${resource}/${code}: ${sign}`);
    netEffect.set(`${normalizeResourceKey(resource)}::${code}`, sign);
  }
}
assert.equal(netEffect.size, 153, "Canonical Net Effect matrix must contain exactly 153 resource/environment entries");

// ── Independent canonical oracle B: friction universe from the workbook ──
const frictionEntries = readZipEntries(FRICTION_WORKBOOK);
const lookupRows = readSheetRows(frictionEntries, "Friction_Lookup");
const frictionRows = [];
for (const row of lookupRows) {
  const acquirer = row.values.get(1) === "SP/SJ" ? "SFP/SFJ" : row.values.get(1);
  const target = row.values.get(2) === "SP/SJ" ? "SFP/SFJ" : row.values.get(2);
  if (!ENV_CODES.includes(acquirer) || !ENV_CODES.includes(target) || acquirer === target) continue;
  frictionRows.push({ row: row.row, acquirer, target, resources: row.values.get(9) ?? "" });
}

assert.equal(frictionRows.length, 72, `Expected 72 ordered heterogeneous friction rows, found ${frictionRows.length}`);

const unorderedPairs = new Map();
for (const row of frictionRows) {
  const key = [row.acquirer, row.target].sort().join("::");
  if (!unorderedPairs.has(key)) unorderedPairs.set(key, new Set());
  unorderedPairs.get(key).add(`${row.acquirer}->${row.target}`);
}
assert.equal(unorderedPairs.size, 36, `Expected 36 unordered heterogeneous pairs, found ${unorderedPairs.size}`);
for (const [key, directions] of unorderedPairs) {
  assert.equal(directions.size, 2, `Unordered pair ${key} must have both directions, found ${[...directions].join(", ")}`);
}

let resourceAssertionCount = 0;
let environmentSignCount = 0;
let canonicalParityCount = 0;
let reverseLabelOrderCount = 0;
let mirrorContradictionCount = 0;
const mirrorSigns = new Map();
for (const row of frictionRows) {
  const entries = String(row.resources).split(ASSERTION_SPLIT_PATTERN).map((entry) => entry.trim()).filter(Boolean);
  for (const entry of entries) {
    const match = ASSERTION_PATTERN.exec(entry);
    assert.ok(match, `Unparseable friction assertion (workbook row ${row.row}, ${row.acquirer}->${row.target}): ${entry}`);
    const firstEnvironment = match[2].toUpperCase();
    const secondEnvironment = match[4].toUpperCase();
    assert.notEqual(firstEnvironment, secondEnvironment, `Duplicate environment (workbook row ${row.row}): ${entry}`);
    const mentions = [...match[0].matchAll(ENV_MENTION_PATTERN)].map((mention) => mention[1].toUpperCase());
    assert.equal(
      mentions.length === 2 && mentions[0] === firstEnvironment && mentions[1] === secondEnvironment,
      true,
      `Unexpected environment identities (workbook row ${row.row}, ${row.acquirer}->${row.target}): ${entry}`,
    );
    resourceAssertionCount += 1;
    environmentSignCount += 2;
    assert.equal(
      new Set(mentions).size === 2
        && (firstEnvironment === row.acquirer || firstEnvironment === row.target)
        && (secondEnvironment === row.acquirer || secondEnvironment === row.target),
      true,
      `Assertion labels must be exactly the expected pair ${row.acquirer}->${row.target}: ${entry}`,
    );
    if (firstEnvironment !== row.acquirer) {
      reverseLabelOrderCount += 1;
      console.error(`Reverse-label-order assertion remains (workbook row ${row.row}, ${row.acquirer}->${row.target}): ${entry}`);
    }
    const resourceKey = normalizeResourceKey(entry.split("(")[0].trim());
    for (const [sign, environment] of [[match[1], firstEnvironment], [match[3], secondEnvironment]]) {
      const canonicalSign = netEffect.get(`${resourceKey}::${environment}`);
      assert.ok(canonicalSign, `Unresolved resource alias (workbook row ${row.row}): ${entry}`);
      if (canonicalSign === normalizeSign(sign)) canonicalParityCount += 1;
    }
    if (!mirrorSigns.has(resourceKey)) mirrorSigns.set(resourceKey, new Map());
    const pairSigns = mirrorSigns.get(resourceKey);
    const pairKey = `${row.acquirer}->${row.target}`;
    if (!pairSigns.has(pairKey)) pairSigns.set(pairKey, new Map());
    pairSigns.get(pairKey).set(firstEnvironment, normalizeSign(match[1]));
    pairSigns.get(pairKey).set(secondEnvironment, normalizeSign(match[3]));
  }
}

assert.equal(resourceAssertionCount, 212, `Expected 212 resource assertions, found ${resourceAssertionCount}`);
assert.equal(environmentSignCount, 424, `Expected 424 environment-sign assertions, found ${environmentSignCount}`);
assert.equal(reverseLabelOrderCount, 0, `Expected 0 reverse-label-order assertions, found ${reverseLabelOrderCount}`);
assert.equal(canonicalParityCount, 424, `Expected 424/424 canonical Net Effect parity, found ${canonicalParityCount}/424`);

for (const [resourceKey, pairs] of mirrorSigns) {
  const pairEntries = [...pairs.entries()];
  for (let left = 0; left < pairEntries.length; left += 1) {
    for (let right = left + 1; right < pairEntries.length; right += 1) {
      const [leftPair, leftSigns] = pairEntries[left];
      const [rightPair, rightSigns] = pairEntries[right];
      const leftSet = new Set(leftPair.split("->"));
      const rightSet = new Set(rightPair.split("->"));
      if (leftSet.size !== rightSet.size || ![...leftSet].every((code) => rightSet.has(code))) continue;
      for (const environment of leftSigns.keys()) {
        if (rightSigns.has(environment) && rightSigns.get(environment) !== leftSigns.get(environment)) {
          mirrorContradictionCount += 1;
          console.error(`Mirror contradiction for ${resourceKey} ${environment}: ${leftPair}=${leftSigns.get(environment)} vs ${rightPair}=${rightSigns.get(environment)}`);
        }
      }
    }
  }
}
assert.equal(mirrorContradictionCount, 0, `Expected 0 mirror-overlap sign contradictions, found ${mirrorContradictionCount}`);

// ── Regenerated runtime artifacts must mirror the canonical workbook ──
function publicTextOf(value) {
  return String(value ?? "").replace("project corpus", "project record").replace("SP/SJ", "SFP/SFJ");
}
assert.equal(FINAL_DELIVERABLE_DATA.frictionPoints.length, 72, "finalDeliverableData.js must expose 72 friction rows");
for (const frictionPoint of FINAL_DELIVERABLE_DATA.frictionPoints) {
  const workbookRow = frictionRows.find((row) => row.acquirer === frictionPoint.acquirerEnvironmentCode
    && row.target === frictionPoint.targetEnvironmentCode);
  assert.ok(workbookRow, `finalDeliverableData.js friction row has no canonical counterpart: ${frictionPoint.acquirerEnvironmentCode}->${frictionPoint.targetEnvironmentCode}`);
  assert.equal(
    frictionPoint.primaryConflictedResources,
    publicTextOf(workbookRow.resources),
    `finalDeliverableData.js friction content must equal the canonical workbook for ${frictionPoint.acquirerEnvironmentCode}->${frictionPoint.targetEnvironmentCode}`,
  );
}
const narrativesAndFriction = JSON.parse(fs.readFileSync(path.join(APP_ROOT, "src/generated/newlogic/narrativesAndFriction.json"), "utf8"));
assert.equal(narrativesAndFriction.friction.frictionLookup.length, 72, "narrativesAndFriction.json must expose 72 friction rows");
for (const lookup of narrativesAndFriction.friction.frictionLookup) {
  const workbookRow = frictionRows.find((row) => row.acquirer === lookup.acquirerEnvironmentCode
    && row.target === lookup.targetEnvironmentCode);
  assert.ok(workbookRow, `narrativesAndFriction.json row has no canonical counterpart: ${lookup.acquirerEnvironmentCode}->${lookup.targetEnvironmentCode}`);
  assert.equal(
    String(lookup.primaryConflictedResources).replace(/\s+/g, " ").trim(),
    workbookRow.resources.replace(/\s+/g, " ").trim(),
    `narrativesAndFriction.json friction content must equal the canonical workbook for ${lookup.acquirerEnvironmentCode}->${lookup.targetEnvironmentCode}`,
  );
}

// ── RMP-1 invariant: runtime resource matrix directions still match canonical Net Effect ──
const flowSource = fs.readFileSync(path.join(APP_ROOT, "src/flow/finalDeliverableFlow.js"), "utf8");
const runtimeMatrixEntries = new Map();
for (const profileMatch of flowSource.matchAll(/resourceProfile\("([^"]+)",\s*"[A-Z]{2}",\s*\{([\s\S]*?)\}\)/g)) {
  const resourceKey = normalizeResourceKey(profileMatch[1]);
  assert.ok(netEffect.has(`${resourceKey}::NF/NT`), `Runtime resource matrix references unknown canonical resource: ${profileMatch[1]}`);
  let entryCount = 0;
  for (const entryMatch of profileMatch[2].matchAll(/"([A-Z]{2,3}\/[A-Z]{2,3})":\s*"([+~\-]) (TOP|MID|LOW|IGN)"/g)) {
    runtimeMatrixEntries.set(`${resourceKey}::${entryMatch[1]}`, `${entryMatch[2]} ${entryMatch[3]}`);
    entryCount += 1;
  }
  assert.equal(entryCount, 9, `Runtime resource profile ${profileMatch[1]} must cover all 9 environments`);
}
assert.equal(runtimeMatrixEntries.size, 153, `Runtime resource matrix must contain 153 entries, found ${runtimeMatrixEntries.size}`);
for (const [key, impact] of runtimeMatrixEntries) {
  const runtimeDirection = impact.split(" ")[0];
  assert.equal(runtimeDirection, netEffect.get(key), `RMP-1 drift: runtime direction for ${key} is ${runtimeDirection}, canonical is ${netEffect.get(key)}`);
}
const sourceManifest = JSON.parse(fs.readFileSync(path.join(APP_ROOT, "src/generated/newlogic/sourceManifest.json"), "utf8"));
const governedEri = sourceManifest.workbooks.find((workbook) => workbook.file === "ST_Environment_Resource_Intelligence_updated.xlsx");
assert.ok(governedEri?.sha256, "Governed ERI workbook must carry a sha256 provenance digest in sourceManifest.json");
assert.equal(
  crypto.createHash("sha256").update(fs.readFileSync(ERI_WORKBOOK)).digest("hex"),
  governedEri.sha256.replace(/^sha256:/, ""),
  "Governed ERI tier-authority workbook must match its sourceManifest digest",
);

// ── Production parser behaviour: identity binding, no positional fallback ──
const SESSION_STUB = Object.freeze({});
const GENERATED_AT = "2026-08-28T00:00:00.000Z";

for (const row of frictionRows) {
  const deliverable = buildPairDeliverable({
    acquirerEnvironmentCode: row.acquirer,
    targetEnvironmentCode: row.target,
  });
  const report = buildMergevuePublicReportModel(SESSION_STUB, { deliverable, generatedAt: GENERATED_AT });
  assert.deepEqual(
    report.metadata.sourceBinding.consistencyLog,
    [],
    `Friction/profile directional mismatch remains for ${row.acquirer}->${row.target}`,
  );
}

function withSyntheticSourceSignals(deliverable, signal) {
  const override = (rows) => rows.map((row) => (String(row.sourceSignal ?? "").trim()
    ? { ...row, sourceSignal: `Synthetic resource (${signal})` }
    : row));
  const profile = deliverable.resourceConflictProfile;
  return {
    ...deliverable,
    resourceConflictProfile: {
      ...profile,
      allResources: override(profile.allResources),
      highProbabilityConflicts: override(profile.highProbabilityConflicts),
    },
  };
}

function syntheticFrictionReadings(pair, signals) {
  return signals.map((signal) => {
    const deliverable = buildPairDeliverable(pair);
    const report = buildMergevuePublicReportModel(SESSION_STUB, {
      deliverable: withSyntheticSourceSignals(deliverable, signal),
      generatedAt: GENERATED_AT,
    });
    const readings = report.metadata.sourceBinding.consistencyLog.map((entry) => entry.frictionReading);
    assert.ok(readings.length > 0, `Synthetic signal must be parsed and logged: ${signal}`);
    return new Set(readings);
  });
}

// Reversed textual order must resolve by label for expected pair NT/STJ -> NF/NT.
const reversedReadings = syntheticFrictionReadings(
  { acquirerEnvironmentCode: "NT/STJ", targetEnvironmentCode: "NF/NT" },
  ["+NT/STJ vs ~NF/NT", "~NF/NT vs +NT/STJ"],
);
assert.equal(reversedReadings[0].size, 1, "Canonical-order synthetic must produce one friction reading");
assert.deepEqual([...reversedReadings[0]], [...reversedReadings[1]], "Textual order must not change the label-bound Acquirer/Target reading");
assert.deepEqual([...reversedReadings[0]], ["+|~"], `Label-bound reading for NT/STJ -> NF/NT must be +|~, got ${[...reversedReadings[0]]}`);

const reversedDeliverable = buildPairDeliverable({ acquirerEnvironmentCode: "NT/STJ", targetEnvironmentCode: "NF/NT" });
const reversedCandidateRows = reversedDeliverable.resourceConflictProfile.highProbabilityConflicts.length
  ? reversedDeliverable.resourceConflictProfile.highProbabilityConflicts
  : reversedDeliverable.resourceConflictProfile.allResources;
const reversedApplicableResources = reversedCandidateRows
  .filter((row) => String(row.sourceSignal ?? "").trim())
  .map((row) => String(row.resource).trim());
assert.deepEqual(
  reversedApplicableResources,
  ["Trust", "Creativity", "Knowledge"],
  "NT/STJ -> NF/NT synthetic-signal-bearing resources must be exactly Trust, Creativity, Knowledge",
);
const reversedReport = buildMergevuePublicReportModel(SESSION_STUB, {
  deliverable: withSyntheticSourceSignals(reversedDeliverable, "~NF/NT vs +NT/STJ"),
  generatedAt: GENERATED_AT,
});
const reversedLabelBoundCopy = "actively amplified on the acquirer side while treated as background on the target side";
const reversedPublicResources = new Map(
  reversedReport.resourceConflictMap.resources.map((resource) => [resource.resourceName, resource]),
);
for (const resourceName of reversedApplicableResources) {
  const resource = reversedPublicResources.get(resourceName);
  assert.ok(resource, `Missing public resource row for synthetic-signal-bearing ${resourceName}`);
  assert.equal(
    String(resource.explanation ?? "").includes(reversedLabelBoundCopy),
    true,
    `Reversed textual order must render the label-bound +|~ direction copy for ${resourceName}`,
  );
}

// Unicode minus stays lawful and label-bound for expected pair STJ/STP -> SFJ/SFP.
const unicodeMinusReadings = syntheticFrictionReadings(
  { acquirerEnvironmentCode: "STJ/STP", targetEnvironmentCode: "SFJ/SFP" },
  ["\u2212STJ/STP vs +SFJ/SFP", "+SFJ/SFP vs \u2212STJ/STP"],
);
assert.deepEqual([...unicodeMinusReadings[0]], ["-|+"], `Unicode-minus label-bound reading for STJ/STP -> SFJ/SFP must be -|+, got ${[...unicodeMinusReadings[0]]}`);
assert.deepEqual([...unicodeMinusReadings[0]], [...unicodeMinusReadings[1]], "Unicode-minus textual order must not change the label-bound reading");

const FAIL_CLOSED_SIGNALS = Object.freeze([
  ["unknown environment labels", "(+BOGUS vs -WTF)"],
  ["sign-only expression", "(+ vs -)"],
  ["missing second side", "(+NT/STJ)"],
  ["duplicate environment", "(+NT/STJ vs -NT/STJ)"],
  ["unrelated pair member", "(+NT/STJ vs -STJ/STP)"],
  ["malformed sign", "(?NT/STJ vs +NF/NT)"],
  ["third/unrelated environment", "(+NT/STJ and +NF/SFJ vs ~NF/NT)"],
  ["missing second label", "(+NT/STJ vs +)"],
  ["label-free syntax", "(conflicting directions observed)"],
]);
for (const [label, signal] of FAIL_CLOSED_SIGNALS) {
  const deliverable = buildPairDeliverable({ acquirerEnvironmentCode: "NT/STJ", targetEnvironmentCode: "NF/NT" });
  assert.throws(
    () => buildMergevuePublicReportModel(SESSION_STUB, {
      deliverable: withSyntheticSourceSignals(deliverable, signal),
      generatedAt: GENERATED_AT,
    }),
    Error,
    `Parser must fail closed on ${label}: ${signal}`,
  );
}

// ── Architecture separation invariants ──
const selectorSource = fs.readFileSync(path.join(APP_ROOT, "src/flow/candidatePairSelector.js"), "utf8");
for (const forbidden of ["narrativesAndFriction", "finalDeliverableData", "finalDeliverableFlow", "mergevuePublicReportModel", "primaryConflictedResources", "frictionLookup"]) {
  assert.equal(selectorSource.includes(forbidden), false, `Candidate Pair Selector must remain friction/resource independent (found reference: ${forbidden})`);
}
const agentDir = path.join(APP_ROOT, "src/agent");
for (const agentFile of fs.readdirSync(agentDir)) {
  if (!agentFile.endsWith(".js")) continue;
  const source = fs.readFileSync(path.join(agentDir, agentFile), "utf8");
  for (const forbidden of ["mergevuePublicReportModel", "finalDeliverableFlow", "finalDeliverableData"]) {
    assert.equal(source.includes(forbidden), false, `Agent layer must stay independent of the public friction-direction layer (${agentFile} references ${forbidden})`);
  }
}

console.log("Friction direction integrity validation passed:");
console.log("  72 ordered heterogeneous rows; 36/36 unordered pairs with both directions");
console.log("  212 resource assertions; 424 environment-sign assertions; 424/424 canonical Net Effect parity");
console.log("  0 reverse-label-order assertions; 0 mirror-overlap contradictions; 0 unresolved resource aliases");
console.log("  runtime artifacts mirror the canonical workbook (72/72 rows each)");
console.log("  RMP-1 resource matrix: 153/153 runtime directions match canonical Net Effect; governed ERI digest intact");
console.log("  parser binds by environment identity (order-invariant), Unicode minus lawful, 9 fail-closed cases rejected");
console.log("  72/72 public pairs report zero friction/profile directional mismatches");
console.log("  Candidate Pair Selector and Agent layer remain friction-direction independent");
