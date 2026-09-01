import type { SemanticResultV1 } from "./kernel.ts";

const RESULT_KEYS = Object.freeze([
  "schemaVersion",
  "resolutionKind",
  "resolutionLabelSelector",
  "findingListState",
  "findings",
  "dealSourceSelector",
  "compensationValueSelector",
  "compensationCurrencySelector",
  "compensationStatusSelector",
  "modules",
  "latticeState",
  "latticeK",
]);
const FINDING_KEYS = Object.freeze([
  "findingIndex",
  "shape",
  "sourceSelector",
  "reasonSelector",
  "typeSelector",
]);
const MODULE_KEYS = Object.freeze([
  "moduleIndex",
  "confidenceSelector",
  "respondentSideSelector",
  "answerSheetState",
  "scoringState",
  "optionStates",
  "orderedEnvironmentRows",
  "margin",
  "scoreMarginState",
  "scoreMarginValue",
  "overrideState",
]);
const ROW_KEYS = Object.freeze([
  "environmentOrdinal",
  "raw",
  "weighted",
  "contributingResponseRefs",
]);

function fail(): never {
  throw new TypeError("NSE_RESULT_SCHEMA_REJECTED");
}

function objectValue(value: unknown): any {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail();
  return value;
}

function exactKeys(value: any, keys: readonly string[]) {
  const actual = Object.keys(value);
  if (actual.length !== keys.length) fail();
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) fail();
  }
}

function enumValue(value: unknown, allowed: readonly string[]) {
  if (typeof value !== "string" || !allowed.includes(value)) fail();
}

function integerInRange(value: unknown, minimum: number, maximum: number) {
  if (!Number.isInteger(value) || Number(value) < minimum || Number(value) > maximum) fail();
}

function scalarCount(value: unknown): number {
  if (Array.isArray(value)) {
    let total = 0;
    for (const item of value) total += scalarCount(item);
    return total;
  }
  if (value && typeof value === "object") {
    let total = 0;
    for (const key of Object.keys(value)) total += scalarCount((value as any)[key]);
    return total;
  }
  return 1;
}

export function verifySemanticResultV1(value: unknown): asserts value is SemanticResultV1 {
  const result = objectValue(value);
  exactKeys(result, RESULT_KEYS);
  if (result.schemaVersion !== "nse-semantic-result-v1") fail();
  enumValue(result.resolutionKind, ["MISSING", "STRING", "OBJECT"]);
  enumValue(result.resolutionLabelSelector, ["NONE", "STRING", "LABEL", "RULE"]);
  enumValue(result.findingListState, ["NON_ARRAY", "EMPTY", "ITEMS"]);
  enumValue(result.dealSourceSelector, ["DATA", "ROOT"]);
  enumValue(result.compensationValueSelector, ["PRIMARY", "FALLBACK"]);
  enumValue(result.compensationCurrencySelector, ["PRIMARY", "FALLBACK"]);
  enumValue(result.compensationStatusSelector, ["PRIMARY", "FALLBACK"]);
  enumValue(result.latticeState, ["ON_LATTICE", "OFF_LATTICE"]);
  if (result.latticeState === "ON_LATTICE") {
    integerInRange(result.latticeK, 0, 34);
  } else if (result.latticeK !== 0) {
    fail();
  }

  if (!Array.isArray(result.findings) || result.findings.length > 25) fail();
  if (result.findingListState === "ITEMS" && result.findings.length === 0) fail();
  if (result.findingListState !== "ITEMS" && result.findings.length !== 0) fail();
  result.findings.forEach((candidate: unknown, index: number) => {
    const finding = objectValue(candidate);
    exactKeys(finding, FINDING_KEYS);
    if (finding.findingIndex !== index) fail();
    enumValue(finding.shape, ["PAIR", "NON_PAIR"]);
    enumValue(finding.sourceSelector, ["LEFT_RIGHT", "AFFECTED_SOURCE_0", "SOURCE_LABEL", "TITLE"]);
    enumValue(finding.reasonSelector, ["EXPLANATION", "EVIDENCE_BASIS"]);
    enumValue(finding.typeSelector, ["TYPE", "FINDING_TYPE"]);
  });

  if (!Array.isArray(result.modules) || result.modules.length !== 4) fail();
  result.modules.forEach((candidate: unknown, moduleIndex: number) => {
    const module = objectValue(candidate);
    exactKeys(module, MODULE_KEYS);
    if (module.moduleIndex !== moduleIndex) fail();
    enumValue(module.confidenceSelector, ["DIRECT", "EVIDENCE_QUALITY"]);
    enumValue(module.respondentSideSelector, ["DATA", "ROOT"]);
    enumValue(module.answerSheetState, ["INCLUDED", "NOT_COMPLETED"]);
    enumValue(module.scoringState, ["INCLUDED", "NOT_COMPLETED"]);
    enumValue(module.scoreMarginState, ["VALUE", "MISSING"]);
    enumValue(module.overrideState, ["WINNING", "OVERRIDDEN", "ABSENT"]);
    if (typeof module.margin !== "number" || typeof module.scoreMarginValue !== "number") fail();
    if (module.scoreMarginState === "MISSING" && module.scoreMarginValue !== 0) fail();
    if (!Array.isArray(module.optionStates) || module.optionStates.length > 23) fail();
    for (const optionState of module.optionStates) {
      enumValue(optionState, ["MISSING", "VALUE", "VALUE_EXCLUDED"]);
    }
    if (!Array.isArray(module.orderedEnvironmentRows) || module.orderedEnvironmentRows.length !== 9) fail();
    const ordinals = new Set<number>();
    for (const candidateRow of module.orderedEnvironmentRows) {
      const row = objectValue(candidateRow);
      exactKeys(row, ROW_KEYS);
      integerInRange(row.environmentOrdinal, 0, 8);
      if (ordinals.has(row.environmentOrdinal)) fail();
      ordinals.add(row.environmentOrdinal);
      if (typeof row.raw !== "number" || typeof row.weighted !== "number") fail();
      if (!Array.isArray(row.contributingResponseRefs) || row.contributingResponseRefs.length > 23) fail();
      const responseRefs = new Set<number>();
      for (const reference of row.contributingResponseRefs) {
        integerInRange(reference, 0, module.optionStates.length - 1);
        if (responseRefs.has(reference)) fail();
        responseRefs.add(reference);
      }
    }
  });

  if (scalarCount(result) > 1208) fail();
}

export const OutputVerifierV1: (value: unknown) => asserts value is SemanticResultV1 = verifySemanticResultV1;
