import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import questionnairesArtifact from "../generated/newlogic/questionnaires.json" with { type: "json" };

// Governed source: ST_Dual_Respondent_Axis_Comparison_v1.xlsx · sheet
// "13_Cross_Side_Structural_Diff" (Cross_Side_Structural_Differentiation), added under
// Owner decisions OD-RMP3-3…OD-RMP3-16 (RMP-3). Letter-level AEM ↔ TSAM comparison only.
// This layer is NOT ECS, NOT friction, NOT severity, NOT resource pressure, and never a
// resource-conflict score; it must never modify ECS, ECS range, risk band, tiers, or Net Effect.
const DUAL = scoringAndTriage.dualRespondentComparison;

const MODE = "within_environment_structural_differentiation";
const STATUS_AVAILABLE = "available";
const STATUS_INSUFFICIENT = "insufficient_comparable_cross_side_evidence";
const INSUFFICIENT_SUMMARY
  = "Within-environment structural differentiation is unavailable: insufficient comparable AEM/TSAM evidence.";
const COMPARABLE = "comparable";
const NOT_COMPARABLE = "not_comparable";
const ALIGNED = "aligned";
const DIVERGENT = "divergent";
// Sheet 11_Role_Question_Scope Block C2: only classes whose UseClass effect preserves
// ordinary comparison / divergence-map semantics keep an E/F option comparable cross-side.
const COMPARABLE_SEMANTIC_CLASSES = new Set(["EXTERNAL_OR_PERSONAL_CAUSE", "SUBSTANTIVE_SIGNAL"]);
const SUBSTANTIVE_OPTION_PATTERN = /^[A-D]$/;
const WORKBOOK_QUESTION_ID_PATTERN = /^Q([1-9]|1[01])$/;
const WORKBOOK_QUESTION_IDS = Object.freeze(
  Array.from({ length: 11 }, (_unused, index) => `Q${index + 1}`),
);

export class CrossSideStructuralDifferentiationConfigError extends Error {
  constructor(detail) {
    super(`CrossSideStructuralDifferentiationConfigError | source=ST_Dual_Respondent_Axis_Comparison_v1.xlsx | ${detail}`);
    this.name = "CrossSideStructuralDifferentiationConfigError";
  }
}

function text(value) {
  return String(value ?? "").trim();
}

function requireGovernedSheet() {
  const rows = DUAL?.crossSideStructuralDifferentiation;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new CrossSideStructuralDifferentiationConfigError(
      "governed sheet 13_Cross_Side_Structural_Diff missing from exported corpus",
    );
  }
  const fields = new Set(rows.map((row) => text(row?.field)));
  const required = ["Purpose", "Scope", "Comparison rule", "Count definitions", "Explicit non-claims"];
  const missing = required.filter((field) => !fields.has(field));
  if (missing.length > 0) {
    throw new CrossSideStructuralDifferentiationConfigError(
      `governed sheet fields missing: ${missing.join(", ")}`,
    );
  }
  const nonClaims = text(rows.find((row) => text(row?.field) === "Explicit non-claims")?.governedRule).toUpperCase();
  for (const claim of ["NOT ECS", "NOT FRICTION", "NOT SEVERITY", "NOT RESOURCE PRESSURE"]) {
    if (!nonClaims.includes(claim)) {
      throw new CrossSideStructuralDifferentiationConfigError(`governed non-claim absent: ${claim}`);
    }
  }
  return rows;
}

const GOVERNED_SHEET_ROWS = requireGovernedSheet();

const GOVERNED_SHEET_PROVENANCE = Object.freeze({
  sourceWorkbook: "ST_Dual_Respondent_Axis_Comparison_v1.xlsx",
  sheet: "13_Cross_Side_Structural_Diff (Cross_Side_Structural_Differentiation)",
  exportedSection: "scoringAndTriage.dualRespondentComparison.crossSideStructuralDifferentiation",
});

// ERI B25: ST_Environment_Resource_Intelligence_updated.xlsx · Resource Priority row 25.
export const ERI_B25_EXTRACTION_ENVIRONMENTS = Object.freeze(["NF/SFJ", "SFP/SFJ", "STP/STJ"]);

// Interpretation_Caveats B3 names these as the environments that suppress 15 of 17
// resources and requires the aligned-suppression caveat when both Net Effect vectors
// are predominantly negative. Homogeneous self-pairs use the same named set.
export const ALIGNED_SUPPRESSION_ENVIRONMENTS = Object.freeze(["NF/SFJ", "SFP/SFJ"]);

function axisLabelByQuestion() {
  const labels = new Map();
  for (const row of DUAL?.comparisonEngine ?? []) {
    const questionRef = text(row?.q);
    const label = text(row?.axisPair);
    if (WORKBOOK_QUESTION_ID_PATTERN.test(questionRef) && label) {
      labels.set(questionRef, label);
    }
  }
  for (const questionRef of WORKBOOK_QUESTION_IDS) {
    if (!labels.has(questionRef)) {
      throw new CrossSideStructuralDifferentiationConfigError(
        `axis label missing for shared question ${questionRef}`,
      );
    }
  }
  return labels;
}

const AXIS_LABELS = axisLabelByQuestion();

function moduleQuestions(moduleId, sourceWorkbook) {
  const module = (questionnairesArtifact.modules ?? []).find((entry) => entry?.id === moduleId);
  if (!module) {
    throw new CrossSideStructuralDifferentiationConfigError(
      `questionnaire module missing: ${moduleId} (${sourceWorkbook})`,
    );
  }
  const byWorkbookQuestionId = new Map();
  for (const question of module.questions ?? []) {
    const questionRef = text(question?.workbookQuestionId);
    if (WORKBOOK_QUESTION_ID_PATTERN.test(questionRef)) {
      byWorkbookQuestionId.set(questionRef, question);
    }
  }
  for (const questionRef of WORKBOOK_QUESTION_IDS) {
    if (!byWorkbookQuestionId.has(questionRef)) {
      throw new CrossSideStructuralDifferentiationConfigError(
        `shared question ${questionRef} missing from ${moduleId}`,
      );
    }
  }
  return byWorkbookQuestionId;
}

const AEM_QUESTIONS = moduleQuestions("acquirerEnvironment", "ST_Acquirer_Environment_Module.xlsx");
const TSAM_QUESTIONS = moduleQuestions("targetSelfAssessment", "ST_Target_Self_Assessment_Module.xlsx");

// Sheet 11_Role_Question_Scope Block C1: questionRef + optionCode → semanticClass.
function semanticClassByOption() {
  const lookup = new Map();
  for (const row of DUAL?.questionOptionSemantics ?? []) {
    const questionRef = text(row?.questionref);
    const optionCode = text(row?.optioncode);
    if (!questionRef || !optionCode) continue;
    lookup.set(`${questionRef}:${optionCode}`, text(row?.semanticclass));
  }
  return lookup;
}

const SEMANTIC_CLASS_BY_OPTION = semanticClassByOption();

// Options A–D are ordinary substantive options (sheet 3_Comparison_Engine letter logic).
// E/F options are comparable only when their governed semantic class preserves ordinary
// comparison semantics; classes defined as "comparable answer unavailable" are excluded.
function optionComparable(questionRef, selectedOption) {
  const letter = text(selectedOption).toUpperCase();
  if (SUBSTANTIVE_OPTION_PATTERN.test(letter)) return true;
  if (!/^[EF]$/.test(letter)) return false;
  const semanticClass = SEMANTIC_CLASS_BY_OPTION.get(`${questionRef}:${letter}`);
  if (!semanticClass) return false;
  return COMPARABLE_SEMANTIC_CLASSES.has(semanticClass);
}

function selectedLetterByQuestion(responses, questions, sideLabel) {
  const selected = new Map();
  for (const response of Array.isArray(responses) ? responses : []) {
    const questionRef = text(response?.workbookQuestionId ?? response?.questionId);
    if (!WORKBOOK_QUESTION_ID_PATTERN.test(questionRef)) continue;
    if (selected.has(questionRef)) {
      throw new CrossSideStructuralDifferentiationConfigError(
        `duplicate ${sideLabel} response for ${questionRef}`,
      );
    }
    selected.set(questionRef, response?.missing === true || response == null ? null : text(response.selectedOption).toUpperCase() || null);
  }
  void questions;
  return selected;
}

function comparisonStatus(acquirerLetter, targetLetter, questionRef) {
  if (acquirerLetter === null || targetLetter === null) return NOT_COMPARABLE;
  if (!optionComparable(questionRef, acquirerLetter) || !optionComparable(questionRef, targetLetter)) {
    return NOT_COMPARABLE;
  }
  return acquirerLetter === targetLetter ? ALIGNED : DIVERGENT;
}

export function buildCrossSideStructuralDifferentiation(acquirerResponses, targetResponses) {
  const acquirerLetters = selectedLetterByQuestion(acquirerResponses, AEM_QUESTIONS, "AEM");
  const targetLetters = selectedLetterByQuestion(targetResponses, TSAM_QUESTIONS, "TSAM");

  const rows = [];
  let agreeCount = 0;
  let divergeCount = 0;
  for (const questionRef of WORKBOOK_QUESTION_IDS) {
    const acquirerLetter = acquirerLetters.get(questionRef) ?? null;
    const targetLetter = targetLetters.get(questionRef) ?? null;
    const status = comparisonStatus(acquirerLetter, targetLetter, questionRef);
    if (status === ALIGNED) agreeCount += 1;
    if (status === DIVERGENT) divergeCount += 1;
    rows.push(Object.freeze({
      questionId: questionRef,
      axisLabel: AXIS_LABELS.get(questionRef),
      acquirerCanonicalQuestionId: AEM_QUESTIONS.get(questionRef)?.id ?? "",
      targetCanonicalQuestionId: TSAM_QUESTIONS.get(questionRef)?.id ?? "",
      acquirerSelectedOption: acquirerLetter,
      targetSelectedOption: targetLetter,
      comparisonStatus: status,
    }));
  }

  const comparableCount = agreeCount + divergeCount;
  const status = comparableCount > 0 ? STATUS_AVAILABLE : STATUS_INSUFFICIENT;
  return Object.freeze({
    mode: MODE,
    status,
    summary: status === STATUS_AVAILABLE
      ? `${divergeCount} of ${comparableCount} comparable structural dimensions differ`
      : INSUFFICIENT_SUMMARY,
    totalSharedDimensions: WORKBOOK_QUESTION_IDS.length,
    comparableCount,
    agreeCount,
    divergeCount,
    rows: Object.freeze(rows),
    source: GOVERNED_SHEET_PROVENANCE,
  });
}

export function crossSideStructuralDifferentiationGovernance() {
  return Object.freeze({
    provenance: GOVERNED_SHEET_PROVENANCE,
    rows: Object.freeze(GOVERNED_SHEET_ROWS.map((row) => Object.freeze({ ...row }))),
    sharedQuestionIds: WORKBOOK_QUESTION_IDS,
    comparableSemanticClasses: Object.freeze([...COMPARABLE_SEMANTIC_CLASSES].sort()),
  });
}
