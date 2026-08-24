// J1 — Offline Semantic Validator Core: owned version identities and closed
// vocabularies. Provider-neutral by construction: no provider, model,
// transport, capacity, attempt, or deadline constant may ever be added here.

export const SEMANTIC_VALIDATOR_VERSION = "semantic-validator-1.0";
export const SEMANTIC_JUDGE_PROMPT_VERSION = "semantic-judge-prompt-1.0";
export const SEMANTIC_JUDGE_PACKET_VERSION = "semantic-judge-packet-1.0";

// Local three-valued evaluation outcomes. PASS requires the complete relevant
// invariant to be positively established by canonical structured data; FAIL
// requires a conclusive violation; everything else is semantic-judge work.
export const LOCAL_OUTCOME_PASS = "PASS";
export const LOCAL_OUTCOME_FAIL = "FAIL";
export const LOCAL_OUTCOME_REQUIRES_SEMANTIC_JUDGMENT = "REQUIRES_SEMANTIC_JUDGMENT";
export const LOCAL_OUTCOMES = Object.freeze([
  LOCAL_OUTCOME_PASS,
  LOCAL_OUTCOME_FAIL,
  LOCAL_OUTCOME_REQUIRES_SEMANTIC_JUDGMENT,
]);

// Semantic judge verdicts.
export const JUDGE_VERDICT_PASS = "PASS";
export const JUDGE_VERDICT_FAIL = "FAIL";
export const JUDGE_VERDICT_UNABLE_TO_EVALUATE = "UNABLE_TO_EVALUATE";
export const JUDGE_VERDICTS = Object.freeze([
  JUDGE_VERDICT_PASS,
  JUDGE_VERDICT_FAIL,
  JUDGE_VERDICT_UNABLE_TO_EVALUATE,
]);

// Semantic judge reason codes. RULE_SATISFIED and RULE_VIOLATED accompany
// decided verdicts; the remaining four express evaluator incapacity only.
export const REASON_RULE_SATISFIED = "RULE_SATISFIED";
export const REASON_RULE_VIOLATED = "RULE_VIOLATED";
export const REASON_AUTHORITY_ABSENT = "AUTHORITY_ABSENT";
export const REASON_TARGET_AMBIGUOUS = "TARGET_AMBIGUOUS";
export const REASON_PACKET_INSUFFICIENT = "PACKET_INSUFFICIENT";
export const REASON_JUDGE_REFUSAL = "JUDGE_REFUSAL";
export const JUDGE_REASON_CODES = Object.freeze([
  REASON_RULE_SATISFIED,
  REASON_RULE_VIOLATED,
  REASON_AUTHORITY_ABSENT,
  REASON_TARGET_AMBIGUOUS,
  REASON_PACKET_INSUFFICIENT,
  REASON_JUDGE_REFUSAL,
]);
export const JUDGE_INCAPACITY_REASON_CODES = Object.freeze([
  REASON_AUTHORITY_ABSENT,
  REASON_TARGET_AMBIGUOUS,
  REASON_PACKET_INSUFFICIENT,
  REASON_JUDGE_REFUSAL,
]);

// Closed J1 semantic violation vocabulary. These are the canonical classes the
// semantic stage may establish; canonical SystemFailure materialization itself
// belongs to a later act and never happens inside J1.
export const SEMANTIC_VIOLATION_OUTPUT_SCHEMA = "OUTPUT_SCHEMA_VIOLATION";
export const SEMANTIC_VIOLATION_GROUNDING = "GROUNDING_VALIDATION_FAILURE";
export const SEMANTIC_VIOLATION_PROHIBITED_CLAIM = "PROHIBITED_CLAIM_VIOLATION";
export const SEMANTIC_VIOLATION_ENGINE_FACT_MUTATION = "ENGINE_FACT_MUTATION_DETECTED";
export const SEMANTIC_VIOLATION_CODES = Object.freeze([
  SEMANTIC_VIOLATION_OUTPUT_SCHEMA,
  SEMANTIC_VIOLATION_GROUNDING,
  SEMANTIC_VIOLATION_PROHIBITED_CLAIM,
  SEMANTIC_VIOLATION_ENGINE_FACT_MUTATION,
]);

// Canonical provider-authored semantic target registry: exactly 13 families,
// in this fixed family order. Instance order inside each family is the frozen
// Result array order; singletons occupy their family slot when present.
export const SEMANTIC_TARGET_FAMILIES = Object.freeze([
  "CLAIM_TEXT",
  "NARRATIVE_SECTION_TEXT",
  "HYPOTHESIS_STATEMENT",
  "TRANSITION_PATTERN_LABEL",
  "FRICTION_MECHANISM_LABEL",
  "SCENARIO_INTERPRETATION_STATEMENT",
  "DECISIVE_EVIDENCE_STATEMENT",
  "CONFLICTING_EVIDENCE_STATEMENT",
  "MISSING_EVIDENCE_STATEMENT",
  "CHANGE_CONDITION_STATEMENT",
  "AFFECTED_RESOURCE_LABEL",
  "WATCHPOINT_STATEMENT",
  "DISCLOSURE_CLIENT_STATEMENT",
]);

// Canonical authority kind order. Within one kind, authorities are ordered by
// id lexicographically.
export const AUTHORITY_KINDS = Object.freeze([
  "ENGINE_FACT",
  "UNCERTAINTY_ITEM",
  "CONTEXT_ITEM",
  "SUPPRESSION_FACT",
  "BLOCKED_CLAIM",
  "CONSTRAINT",
  "PACK_SCOPE",
  "BRANCH",
  "INTERPRETATION_STATUS",
  "HYPOTHESIS_ORDERING",
  "CLAIM_TYPE",
  "EVIDENCE_BASIS",
  "HORIZON",
  "WOULD_CHANGE",
  "AFFECTS",
  "EXTRAPOLATION_MARKER",
]);

export const AUTHORITY_KIND_RANK = Object.freeze(
  new Map(AUTHORITY_KINDS.map((kind, index) => [kind, index + 1])),
);
