import {
  P0C_IDENTITY_UNRESOLVED_REASONS,
  SURVIVING_DIAGNOSTIC_SEMANTIC_CLASSES,
} from "./agentContractConstants.js";
import {
  LOCAL_OUTCOME_FAIL,
  LOCAL_OUTCOME_PASS,
  LOCAL_OUTCOME_REQUIRES_SEMANTIC_JUDGMENT,
} from "./semanticValidatorConstants.js";
import { SemanticValidationError } from "./semanticValidationError.js";

// J1 — Local deterministic evaluation.
//
// Three-valued law:
//   PASS                              only when the complete relevant invariant
//                                     is positively and completely established
//                                     by canonical structured data;
//   FAIL                              only when a violation is conclusively
//                                     established by canonical data or an exact
//                                     contract-authorized deterministic rule;
//   REQUIRES_SEMANTIC_JUDGMENT        every remaining arbitrary-language case.
//
// No lexical miss can ever prove PASS: the absence of a pattern is never
// evidence. V-13 and V-29 probability/confidence meaning is not locally
// proven from wording: those applicable checks always require semantic
// judgment. A local FAIL exists only for contract-authorized structured
// deterministic rules (the D-set).

export const DETERMINISTIC_CHECK_IDS = Object.freeze([
  "V-05-DISCLOSURE-IDENTITY",
  "V-17-ABSTENTION-PRECONDITIONS",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function preconditionFail(detail) {
  throw new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE", detail });
}

function requireArray(value, label) {
  if (!Array.isArray(value)) preconditionFail(`${label} must be an array`);
  return value;
}

// ---------------------------------------------------------------------------
// J1-owned deterministic checks (D-set). This is not a duplicate Result
// Assembly validator: it contains exactly the deterministic semantic-stage
// checks the stage owns (V-05, V-17) and nothing else.
// ---------------------------------------------------------------------------

function checkV05DisclosureIdentity(request, result) {
  const items = requireArray(
    request.structuredUncertainty?.items,
    "structuredUncertainty.items",
  );
  const disclosures = requireArray(
    result.uncertainty?.disclosures,
    "result.uncertainty.disclosures",
  );
  const disclosedIds = new Set(
    disclosures.map((row) => {
      if (!isPlainObject(row) || typeof row.uncertaintyId !== "string") {
        preconditionFail("result.uncertainty.disclosures row lacks uncertaintyId");
      }
      return row.uncertaintyId;
    }),
  );
  const missing = [];
  for (const item of items) {
    if (!isPlainObject(item) || typeof item.uncertaintyId !== "string") {
      preconditionFail("structuredUncertainty.items row lacks uncertaintyId");
    }
    if (item.disclosureRequired === true && !disclosedIds.has(item.uncertaintyId)) {
      missing.push(item.uncertaintyId);
    }
  }
  return {
    dCheckId: "V-05-DISCLOSURE-IDENTITY",
    ruleId: "V-05",
    outcome: missing.length === 0 ? LOCAL_OUTCOME_PASS : LOCAL_OUTCOME_FAIL,
    violationCode: missing.length === 0 ? null : "OUTPUT_SCHEMA_VIOLATION",
    detail: missing.length === 0
      ? null
      : `disclosureRequired items without a matching disclosure identity: ${missing.join(", ")}`,
  };
}

// §5.A.1 — the only preconditions under which ABSTAINED_INSUFFICIENT_EVIDENCE
// is a lawful interpretation status.
function abstentionPreconditionHolds(request) {
  const snapshot = request.engineSnapshot;
  const uncertainty = request.structuredUncertainty;
  if (snapshot.outcomeSource === "PRE_CORE_SELECTOR") return false;
  const branchCode = snapshot.engine.outcome.branchCode;

  if (branchCode === "P_0A") return true;

  if (branchCode === "P_0C") {
    const unresolvedReason = snapshot.engine.outcome.engineAuditRaw?.unresolvedReason ?? null;
    return P0C_IDENTITY_UNRESOLVED_REASONS.includes(unresolvedReason);
  }

  const surviving = requireArray(
    uncertainty.survivingEvidenceRefs,
    "structuredUncertainty.survivingEvidenceRefs",
  );
  if (surviving.length === 0) return true;

  const observationsByRef = new Map(
    requireArray(snapshot.engine.observations, "engine.observations")
      .map((observation) => {
        if (!isPlainObject(observation) || typeof observation.observationRef !== "string") {
          preconditionFail("engine.observations row lacks observationRef");
        }
        return [observation.observationRef, observation];
      }),
  );
  let everySurvivingUnavailable = true;
  for (const ref of surviving) {
    const observation = observationsByRef.get(ref);
    if (observation === undefined) {
      preconditionFail(`surviving evidence ref does not resolve: ${ref}`);
    }
    if (observation.comparisonAvailability !== "unavailable") {
      everySurvivingUnavailable = false;
    }
    // EVENT_ABSENCE / STRUCTURAL_PRECONDITION_ABSENCE are corpus-declared
    // diagnostic findings and always count as surviving evidence (§5.A.1).
    if (SURVIVING_DIAGNOSTIC_SEMANTIC_CLASSES.includes(observation.semanticClass)) {
      return false;
    }
  }
  return everySurvivingUnavailable;
}

function checkV17AbstentionPreconditions(request, result) {
  if (result.interpretationStatus !== "ABSTAINED_INSUFFICIENT_EVIDENCE") {
    return {
      dCheckId: "V-17-ABSTENTION-PRECONDITIONS",
      ruleId: "V-17",
      outcome: LOCAL_OUTCOME_PASS,
      violationCode: null,
      detail: null,
    };
  }
  const lawful = abstentionPreconditionHolds(request);
  return {
    dCheckId: "V-17-ABSTENTION-PRECONDITIONS",
    ruleId: "V-17",
    outcome: lawful ? LOCAL_OUTCOME_PASS : LOCAL_OUTCOME_FAIL,
    violationCode: lawful ? null : "OUTPUT_SCHEMA_VIOLATION",
    detail: lawful
      ? null
      : "ABSTAINED_INSUFFICIENT_EVIDENCE does not satisfy any §5.A.1 precondition",
  };
}

export function evaluateDeterministicChecks(agentInterpretationRequest, agentInterpretationResult) {
  return Object.freeze([
    Object.freeze(checkV05DisclosureIdentity(agentInterpretationRequest, agentInterpretationResult)),
    Object.freeze(checkV17AbstentionPreconditions(agentInterpretationRequest, agentInterpretationResult)),
  ]);
}

// ---------------------------------------------------------------------------
// Three-valued local evaluation for semantic sub-rules.
// ---------------------------------------------------------------------------

export function locallyEvaluateSemanticSubrule(row, target) {
  void row;
  void target;
  // Authored arbitrary-language prose can never be locally proven compliant
  // or violative. V-13 and V-29 probability/confidence/likelihood/odds/
  // chance wording is judge-only: the local layer never FAILs and never
  // PASSes those (or any other) semantic subrules from lexical form.
  return { outcome: LOCAL_OUTCOME_REQUIRES_SEMANTIC_JUDGMENT, violationCode: null, detail: null };
}
