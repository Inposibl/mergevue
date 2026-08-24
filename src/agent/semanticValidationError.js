import {
  JUDGE_INCAPACITY_REASON_CODES,
  SEMANTIC_VIOLATION_CODES,
} from "./semanticValidatorConstants.js";

// Typed offline semantic errors only. J1 never materializes a canonical
// SystemFailure and never exposes raw judge prose: findings carry mechanical
// identities (rule, subrule, locator, codes, authority ids) and nothing else.

export const SEMANTIC_ERROR_KINDS = Object.freeze([
  "SEMANTIC_VIOLATION",
  "EVALUATOR_INCAPACITY",
  "PROTOCOL_FAILURE",
  "INPUT_PRECONDITION_FAILURE",
]);

export class SemanticValidationError extends Error {
  constructor({ errorKind, detail, findings } = {}) {
    if (!SEMANTIC_ERROR_KINDS.includes(errorKind)) {
      throw new SemanticProtocolError({ detail: "SemanticValidationError requires a lawful semantic error kind" });
    }
    const parts = [
      "SemanticValidationError",
      `errorKind=${errorKind}`,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "SemanticValidationError";
    this.errorKind = errorKind;
    this.detail = typeof detail === "string" && detail.length > 0 ? detail : null;
    this.findings = Object.freeze([...(Array.isArray(findings) ? findings : [])]);
  }
}

// A semantic check was decided FAIL (deterministically or by the judge).
// Findings are ordered by canonical semantic evaluation order
// (rule → semanticSubrule → targetFamily → instance), never by checkId.
export class SemanticViolationError extends SemanticValidationError {
  constructor({ violationCode, detail, findings } = {}) {
    super({ errorKind: "SEMANTIC_VIOLATION", detail, findings });
    this.name = "SemanticViolationError";
    if (!SEMANTIC_VIOLATION_CODES.includes(violationCode)) {
      throw new SemanticProtocolError({ detail: "SemanticViolationError requires a closed semantic violation code" });
    }
    this.violationCode = violationCode;
  }
}

// Evaluator incapacity: an identity-valid verdict of UNABLE_TO_EVALUATE.
// Internal constructor guards throw the typed protocol error, never a
// generic Error, so no invalid judge protocol can escape untyped.
export class SemanticEvaluatorIncapacityError extends SemanticValidationError {
  constructor({ detail, findings } = {}) {
    super({ errorKind: "EVALUATOR_INCAPACITY", detail, findings });
    this.name = "SemanticEvaluatorIncapacityError";
    for (const finding of this.findings) {
      if (!JUDGE_INCAPACITY_REASON_CODES.includes(finding?.reasonCode)) {
        throw new SemanticProtocolError({ detail: "SemanticEvaluatorIncapacityError findings require incapacity reason codes" });
      }
    }
  }
}

// Judge protocol / identity failure: the returned batch is not trustworthy,
// so it always wins over any verdict content.
export class SemanticProtocolError extends SemanticValidationError {
  constructor({ detail } = {}) {
    super({ errorKind: "PROTOCOL_FAILURE", detail });
    this.name = "SemanticProtocolError";
  }
}
