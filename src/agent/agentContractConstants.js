export const AGENT_CONTRACT_VERSION = "D0_R0_CORR2_A2C1_CORR1_C5C1_PC1_SR1";
export const SNAPSHOT_SCHEMA_VERSION = "engine-snapshot-2.0";

export const RUNTIME_CORE_COMMIT = "dcbd937e0135e790201ee5c8898c5b5f5a085298";
export const DUAL_COMPARATOR_VERSION = "ST_Dual_Respondent_Axis_Comparison_v1.xlsx";

export const ADJUDICATION_PROVENANCE_USE_CLASS_VALUES = Object.freeze([
  "PRIMARY",
  "CONTEXTUAL",
  "INELIGIBLE",
  "UNRESOLVED",
  null,
]);

export const MATCHED_ACCESS_RULE_IDS = Object.freeze([
  "DIRECT_OBSERVATION_GATE_NO_SUBSTANTIVE_OPTION",
  "EVIDENCE_TYPE_HYPOTHETICAL",
  "EVIDENCE_TYPE_UNKNOWN",
]);

export const AUTHORIZED_MODULE_IDS = Object.freeze([
  "acquirerEnvironment",
  "targetSelfAssessment",
]);

export const QUESTION_UNIVERSE = Object.freeze(
  Array.from({ length: 11 }, (_, index) => `Q${index + 1}`),
);

export const RESPONDENT_SLOT_R1 = "R1";
export const RESPONDENT_SLOT_R2 = "R2";
export const RESPONDENT_SLOTS = Object.freeze([RESPONDENT_SLOT_R1, RESPONDENT_SLOT_R2]);

export const BRANCH_CODES = Object.freeze([
  "P_0A",
  "P_0B",
  "P_0C",
  "P_1",
  "P_1B",
  "P_2",
  "P_3A",
  "P_3",
  "P_4",
  "P_5X",
  "P_5A",
  "P_5B",
  "UNMATCHED",
]);

export const ENGINE_OUTCOME_SOURCES = Object.freeze([
  "DUAL_CORE",
  "PRE_CORE_SELECTOR",
  "SINGLE_R1_ONLY",
]);

export const SINGLE_R1_OUTCOME_CODE = "SINGLE_R1_ONLY";
export const SINGLE_R1_REASON_CODE = "NO_INDEPENDENT_R2_COMPARISON";
export const SINGLE_R1_CONSTRAINT_ID = "C-SINGLE-NO-R2-COMPARISON";

export const PRE_CORE_OUTCOME_CODES = Object.freeze([
  "S_ADMISSIBILITY_UNRESOLVED",
  "S_NO_LAWFUL_PAIR",
  "S_PAIR_SELECTION_AMBIGUOUS",
]);

export const ENGINE_OUTCOME_CODES = Object.freeze([
  ...BRANCH_CODES,
  ...PRE_CORE_OUTCOME_CODES,
  SINGLE_R1_OUTCOME_CODE,
]);

export const SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES = Object.freeze([
  "P_5A",
  "P_5B",
  "P_4",
  "P_3",
  "P_2",
  "P_5X",
  "P_1",
  "P_0C",
  "UNMATCHED",
]);

export const SELECTOR_STATUS_TO_PRE_CORE_OUTCOME_CODE = Object.freeze({
  ADMISSIBILITY_UNRESOLVED: "S_ADMISSIBILITY_UNRESOLVED",
  NO_LAWFUL_PAIR: "S_NO_LAWFUL_PAIR",
  PAIR_SELECTION_AMBIGUOUS: "S_PAIR_SELECTION_AMBIGUOUS",
});

export const PRIORITY_TO_BRANCH_CODE = Object.freeze({
  "0a": "P_0A",
  "0b": "P_0B",
  "0c": "P_0C",
  "1": "P_1",
  "1b": "P_1B",
  "2": "P_2",
  "3a": "P_3A",
  "3": "P_3",
  "4": "P_4",
  "5X": "P_5X",
  "5A": "P_5A",
  "5B": "P_5B",
});

export const FINALITY = Object.freeze({
  FINAL_STATE: "FINAL_STATE",
  NON_FINAL_ROUTED: "NON_FINAL_ROUTED",
  SUPPRESSED: "SUPPRESSED",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
});

export const FINALITY_BY_BRANCH = Object.freeze({
  P_5A: FINALITY.FINAL_STATE,
  P_5B: FINALITY.FINAL_STATE,
  P_3: FINALITY.FINAL_STATE,
  P_4: FINALITY.FINAL_STATE,
  P_1: FINALITY.SUPPRESSED,
  P_1B: FINALITY.SUPPRESSED,
  P_0A: FINALITY.PRECONDITION_FAILED,
  P_0B: FINALITY.PRECONDITION_FAILED,
  P_0C: FINALITY.NON_FINAL_ROUTED,
  P_2: FINALITY.NON_FINAL_ROUTED,
  P_3A: FINALITY.NON_FINAL_ROUTED,
  P_5X: FINALITY.NON_FINAL_ROUTED,
  UNMATCHED: FINALITY.NON_FINAL_ROUTED,
});

export const DETERMINATION_IMPOSSIBLE_NF_SFP = "NF/SFP";

export const SUPPRESSION_BY_BRANCH = Object.freeze({
  P_0A: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: true,
  }),
  P_0B: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: true,
  }),
  P_0C: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_1: Object.freeze({
    comparatorOutputSuppressed: true,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_1B: Object.freeze({
    comparatorOutputSuppressed: true,
    pairEvaluationSuppressed: true,
    prohibitedFallbackActive: true,
    determinationImpossible: DETERMINATION_IMPOSSIBLE_NF_SFP,
    comparatorDidNotRun: false,
  }),
  P_2: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_3A: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_3: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_4: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_5X: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_5A: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  P_5B: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
  UNMATCHED: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: false,
  }),
});

export const FREE_INTERPRETATION_MODE = Object.freeze({
  AUTOMATED_STANDARD_INTERPRETATION: "AUTOMATED_STANDARD_INTERPRETATION",
  AUTOMATED_UNCERTAINTY_INTERPRETATION: "AUTOMATED_UNCERTAINTY_INTERPRETATION",
  AUTOMATED_CONSTRAINED_INTERPRETATION: "AUTOMATED_CONSTRAINED_INTERPRETATION",
  AUTOMATED_ABSTENTION_CANDIDATE: "AUTOMATED_ABSTENTION_CANDIDATE",
});

export const FREE_INTERPRETATION_MODE_BY_BRANCH = Object.freeze({
  P_5A: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_5B: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_3: FREE_INTERPRETATION_MODE.AUTOMATED_STANDARD_INTERPRETATION,
  P_4: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  P_1: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_1B: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_2: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_3A: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_5X: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  UNMATCHED: FREE_INTERPRETATION_MODE.AUTOMATED_CONSTRAINED_INTERPRETATION,
  P_0B: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  P_0A: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
});

export const PRE_CORE_ROUTING_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: "practitioner_access_review",
  S_NO_LAWFUL_PAIR: "selector_no_lawful_candidate_pair",
  S_PAIR_SELECTION_AMBIGUOUS: "selector_candidate_pair_ambiguous",
});

export const PRE_CORE_OUTCOME_CLASS_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: "routing_outcome",
  S_NO_LAWFUL_PAIR: "routing_outcome",
  S_PAIR_SELECTION_AMBIGUOUS: "routing_outcome",
});

export const PRE_CORE_CLASSIFICATION_OUTCOME_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: "Practitioner access review",
  S_NO_LAWFUL_PAIR: "CANDIDATE PAIR NOT ESTABLISHED — no lawful candidate pair",
  S_PAIR_SELECTION_AMBIGUOUS: "CANDIDATE PAIR NOT ESTABLISHED — more than one lawful candidate pair",
});

export const PRE_CORE_OUTPUT_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: "No five-state classification; no Contradiction record from this comparator",
  S_NO_LAWFUL_PAIR: "No comparator output; no Contradiction record",
  S_PAIR_SELECTION_AMBIGUOUS: "No comparator output; no Contradiction record",
});

export const PRE_CORE_FINALITY_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: FINALITY.NON_FINAL_ROUTED,
  S_NO_LAWFUL_PAIR: FINALITY.NON_FINAL_ROUTED,
  S_PAIR_SELECTION_AMBIGUOUS: FINALITY.NON_FINAL_ROUTED,
});

export const PRE_CORE_SUPPRESSION_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: true,
  }),
  S_NO_LAWFUL_PAIR: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: true,
  }),
  S_PAIR_SELECTION_AMBIGUOUS: Object.freeze({
    comparatorOutputSuppressed: false,
    pairEvaluationSuppressed: false,
    prohibitedFallbackActive: false,
    determinationImpossible: null,
    comparatorDidNotRun: true,
  }),
});

export const PRE_CORE_CONSTRAINTS_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: Object.freeze([
    "C-ELIGIBILITY-UNRESOLVED",
    "C-NO-AGENT-PAIR-SELECTION",
  ]),
  S_NO_LAWFUL_PAIR: Object.freeze(["C-NO-AGENT-PAIR-SELECTION"]),
  S_PAIR_SELECTION_AMBIGUOUS: Object.freeze(["C-NO-AGENT-PAIR-SELECTION"]),
});

export const PRE_CORE_CONSTRAINT_IDS = Object.freeze([
  "C-NO-AGENT-PAIR-SELECTION",
]);

export const PRE_CORE_FREE_INTERPRETATION_MODE_BY_OUTCOME_CODE = Object.freeze({
  S_ADMISSIBILITY_UNRESOLVED: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  S_NO_LAWFUL_PAIR: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  S_PAIR_SELECTION_AMBIGUOUS: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
});

export const UNRESOLVED_REASON = Object.freeze({
  MISSING_MODULE: "missing_module",
  UNSUPPORTED_MODULE: "unsupported_module",
  UNSUPPORTED_OR_MISSING_QUESTION: "unsupported_or_missing_question",
  ROLE_CODE_UNSPECIFIED: "roleCode_unspecified",
  UNKNOWN_SENIORITY: "unknown_seniority",
});

export const P0C_IDENTITY_UNRESOLVED_REASONS = Object.freeze([
  UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION,
]);

export const P0C_ROLE_SENIORITY_UNRESOLVED_REASONS = Object.freeze([
  UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED,
  UNRESOLVED_REASON.UNKNOWN_SENIORITY,
]);

export const P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON = Object.freeze({
  [UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION]: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  [UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED]: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
  [UNRESOLVED_REASON.UNKNOWN_SENIORITY]: FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION,
});

export const P0C_EXTERNAL_VANTAGE_UNRESOLVED_REASON = null;
export const P0C_EXTERNAL_FREE_INTERPRETATION_MODE = FREE_INTERPRETATION_MODE.AUTOMATED_UNCERTAINTY_INTERPRETATION;

export const ENGINE_STATE_BY_BRANCH = Object.freeze({
  P_5A: "① CONVERGENT",
  P_5B: "② PARTIAL CONVERGENCE",
  P_3: "④-A IRRESOLVABLE — within-pair divergence",
  P_4: "③ ROLE-LEVEL SPLIT",
});

export const ENGINE_ROUTING_BY_BRANCH = Object.freeze({
  P_5A: "① CONVERGENT",
  P_5B: "② PARTIAL CONVERGENCE",
  P_3: "blocked",
  P_4: "standard_analyst_review_queue",
  P_0C: "practitioner_access_review",
  P_1: "coverage_insufficient",
  P_1B: "practitioner_review",
  P_2: "candidate_4b_practitioner_confirmation_required",
  P_3A: "practitioner_review",
  P_5X: "analyst_practitioner_review",
  UNMATCHED: "analyst_practitioner_review",
  P_0B: "practitioner_pair_diagnosis",
  P_0A: "comparator_does_not_run",
});

export const UNMATCHED_OUTCOME_CLASS = "routing_outcome";
export const UNMATCHED_CLASSIFICATION_OUTCOME = "ANALYST / PRACTITIONER REVIEW — no automatic state";
export const UNMATCHED_OUTPUT = "Held pending review";
export const SENIORITY_TIER_EXTERNAL = "external";

export const PROVISIONAL_STATE_CANDIDATE_4B = "candidate_4B";
export const DEC8_ADMISSIBILITY_SCOPE = "trigger_only";
export const DIGEST_PREFIX = "sha256:";
export const FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE = "INPUT_ASSEMBLY_FAILURE";
export const FAILURE_CLASS_CONTRACT_VERSION_MISMATCH = "CONTRACT_VERSION_MISMATCH";

export const UNCERTAINTY_SCHEMA_VERSION = "structured-uncertainty-1.4";

export const UNCERTAINTY_DOMAINS = Object.freeze([
  "ELIGIBILITY",
  "ACCESS",
  "COVERAGE",
  "EVIDENCE_QUALITY",
  "CONTRADICTION",
  "ROLE_TIER",
  "PAIR_SCOPE",
  "COHERENCE",
  "PROVISIONALITY",
]);

export const CLAIM_IDS = Object.freeze([
  "CLAIM_ENGINE_STATE_IDENTITY",
  "CLAIM_NF_SFP_DETERMINATION",
  "CLAIM_FINAL_4B_DETERMINATION",
  "CLAIM_OBSERVATION_ELIGIBILITY",
]);

export const CLAIM_SCOPES = Object.freeze([
  "STATE_IDENTITY",
  "DIRECTION",
  "SEVERITY",
  "CONFIDENCE_ONLY",
  "DETAIL_ONLY",
]);

export const UNCERTAINTY_REASON_CODES = Object.freeze([
  SINGLE_R1_REASON_CODE,
  "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY",
  "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY",
  "ELIGIBILITY_UNRESOLVED_ROLE_UNSPECIFIED",
  "ELIGIBILITY_UNRESOLVED_UNKNOWN_SENIORITY",
  "ELIGIBILITY_UNRESOLVED_RESPONDENT_VANTAGE_NOT_ESTABLISHED",
  "ELIGIBILITY_UNRESOLVED_EXTERNAL_VANTAGE",
  "SELECTOR_NO_LAWFUL_CANDIDATE_PAIR",
  "SELECTOR_CANDIDATE_PAIR_AMBIGUOUS",
  "ACCESS_GATE_NOT_DIRECT",
  "ACCESS_EVIDENCE_HYPOTHETICAL",
  "ACCESS_EVIDENCE_UNKNOWN",
  "COVERAGE_COMPARABLE_PAIRS_BELOW_MINIMUM",
  "COVERAGE_HIGH_RESOLVER_UNAVAILABLE",
  "COVERAGE_HIGH_RESOLVER_NOT_PRIMARY",
  "COVERAGE_SEMANTIC_OBSERVATION_GAP",
  "COVERAGE_SEMANTIC_EVENT_ABSENCE",
  "COVERAGE_SEMANTIC_STRUCTURAL_PRECONDITION_ABSENCE",
  "COVERAGE_SEMANTIC_AMBIGUOUS_COLLAPSE",
  "QUALITY_BELOW_LOW_THRESHOLD",
  "QUALITY_BELOW_MEDIUM_THRESHOLD",
  "AGREEMENT_EXCLUDED_KNOWLEDGE_LEVEL",
  "RELIABILITY_FLAGS_PRESENT_INDEPENDENT",
  "HIGH_RESOLVER_DIVERGENCE_ALL",
  "ONE_HIGH_DISCRIMINATOR_DIVERGENCE",
  "ROLE_LEVEL_SPLIT_SENIOR_LINE",
  "TIER_VANTAGE_MISMATCH",
  "PAIR_ABSENT",
  "PAIR_NOT_IN_PRODUCTION_SET",
  "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH",
  "AGREEMENT_ENVIRONMENT_COHERENCE_AMBIGUOUS",
  "CANDIDATE_PAIR_IDENTIFICATION_FAILURE",
  "NO_PRECEDENCE_MATCH",
]);

export const ACCESS_RULE_ID_TO_REASON_CODE = Object.freeze({
  DIRECT_OBSERVATION_GATE_NO_SUBSTANTIVE_OPTION: "ACCESS_GATE_NOT_DIRECT",
  EVIDENCE_TYPE_HYPOTHETICAL: "ACCESS_EVIDENCE_HYPOTHETICAL",
  EVIDENCE_TYPE_UNKNOWN: "ACCESS_EVIDENCE_UNKNOWN",
});

export const SEMANTIC_CLASS_TO_COVERAGE_REASON = Object.freeze({
  OBSERVATION_GAP: "COVERAGE_SEMANTIC_OBSERVATION_GAP",
  EVENT_ABSENCE: "COVERAGE_SEMANTIC_EVENT_ABSENCE",
  STRUCTURAL_PRECONDITION_ABSENCE: "COVERAGE_SEMANTIC_STRUCTURAL_PRECONDITION_ABSENCE",
  AMBIGUOUS_COLLAPSE: "COVERAGE_SEMANTIC_AMBIGUOUS_COLLAPSE",
});

export const SURVIVING_DIAGNOSTIC_SEMANTIC_CLASSES = Object.freeze([
  "EVENT_ABSENCE",
  "STRUCTURAL_PRECONDITION_ABSENCE",
]);

export const CONSTRAINT_IDS = Object.freeze([
  SINGLE_R1_CONSTRAINT_ID,
  "C-ELIGIBILITY-UNRESOLVED",
  "C-COVERAGE-SUPPRESSED",
  "C-1B-SUPPRESSION",
  "C-1B-NO-BROADENING",
  "C-PROHIBITED-FALLBACK",
  "C-4B-CANDIDATE-ONLY",
  "C-3A-NOT-4A",
  "C-DEC7B-FLOOR",
  "C-DEC8-TRIGGER-ONLY",
  "C-5X-NO-COLLAPSE",
]);

export const CONSTRAINTS_BY_BRANCH = Object.freeze({
  P_0C: Object.freeze(["C-ELIGIBILITY-UNRESOLVED"]),
  P_1: Object.freeze(["C-COVERAGE-SUPPRESSED"]),
  P_1B: Object.freeze([
    "C-COVERAGE-SUPPRESSED",
    "C-1B-SUPPRESSION",
    "C-1B-NO-BROADENING",
    "C-PROHIBITED-FALLBACK",
  ]),
  P_2: Object.freeze(["C-4B-CANDIDATE-ONLY"]),
  P_3A: Object.freeze(["C-3A-NOT-4A", "C-DEC7B-FLOOR"]),
  P_3: Object.freeze([]),
  P_4: Object.freeze(["C-DEC8-TRIGGER-ONLY"]),
  P_5X: Object.freeze(["C-5X-NO-COLLAPSE"]),
  P_5B: Object.freeze(["C-DEC7B-FLOOR"]),
});

export const BRANCH_LEVEL_REASON_ORDER = Object.freeze([
  "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY",
  "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY",
  "ELIGIBILITY_UNRESOLVED_ROLE_UNSPECIFIED",
  "ELIGIBILITY_UNRESOLVED_UNKNOWN_SENIORITY",
  "ELIGIBILITY_UNRESOLVED_RESPONDENT_VANTAGE_NOT_ESTABLISHED",
  "ELIGIBILITY_UNRESOLVED_EXTERNAL_VANTAGE",
  "SELECTOR_NO_LAWFUL_CANDIDATE_PAIR",
  "SELECTOR_CANDIDATE_PAIR_AMBIGUOUS",
  null,
  "COVERAGE_COMPARABLE_PAIRS_BELOW_MINIMUM",
  "COVERAGE_HIGH_RESOLVER_UNAVAILABLE",
  "COVERAGE_HIGH_RESOLVER_NOT_PRIMARY",
  "HIGH_RESOLVER_DIVERGENCE_ALL",
  "ONE_HIGH_DISCRIMINATOR_DIVERGENCE",
  "ROLE_LEVEL_SPLIT_SENIOR_LINE",
  "PAIR_ABSENT",
  "PAIR_NOT_IN_PRODUCTION_SET",
  "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH",
  "AGREEMENT_ENVIRONMENT_COHERENCE_AMBIGUOUS",
  "CANDIDATE_PAIR_IDENTIFICATION_FAILURE",
  "NO_PRECEDENCE_MATCH",
]);

export const OBSERVATION_REASON_ORDER = Object.freeze([
  "ACCESS_GATE_NOT_DIRECT",
  "ACCESS_EVIDENCE_HYPOTHETICAL",
  "ACCESS_EVIDENCE_UNKNOWN",
  "COVERAGE_SEMANTIC_OBSERVATION_GAP",
  "COVERAGE_SEMANTIC_EVENT_ABSENCE",
  "COVERAGE_SEMANTIC_STRUCTURAL_PRECONDITION_ABSENCE",
  "COVERAGE_SEMANTIC_AMBIGUOUS_COLLAPSE",
  "RELIABILITY_FLAGS_PRESENT_INDEPENDENT",
  "TIER_VANTAGE_MISMATCH",
]);

export const QUESTION_REASON_ORDER = Object.freeze([
  "QUALITY_BELOW_LOW_THRESHOLD",
  "QUALITY_BELOW_MEDIUM_THRESHOLD",
  "AGREEMENT_EXCLUDED_KNOWLEDGE_LEVEL",
]);

export const CONTEXT_PACK_SCHEMA_VERSION = "context-pack-1.1";
export const SELECTION_POLICY_VERSION = "context-selection-1.3";

export const CONTEXT_ITEM_KINDS = Object.freeze([
  "CORPUS_VERBATIM",
  "BOUNDARY_CANONICAL",
]);

export const CONTEXT_DOMAINS = Object.freeze([
  "STATE_SEMANTICS",
  "QUESTION_SEMANTICS",
  "SEMANTIC_CLASS_SEMANTICS",
  "ENVIRONMENT_IDENTITY",
  "PAIR_SEMANTICS",
  "BRANCH_SEMANTICS",
  "FRICTION_AND_RESOURCES",
  "TEMPORAL_HORIZON",
  "PRODUCT_SAFETY",
]);

export const AUTHORITY_CLASSES = Object.freeze([
  "ACCEPTED_METHODOLOGY_CONTEXT",
  "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
  "CONDITIONAL_CONTEXT",
]);

export const AUTHORITY_EXCLUSION_CLASSES = Object.freeze([
  "PRESENTATION_ONLY_NOT_AUTHORITY",
  "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING",
  "NOT_SELECTED",
  "EXTRAPOLATION_LICENCE_EXCLUDED",
]);

export const PACK_SCOPE_VERDICTS = Object.freeze([
  "FACTUAL_EXPLANATION_ONLY",
  "MERGEVUE_INTERPRETATION_PERMITTED",
]);

export const SELECTION_RULE_IDS = Object.freeze([
  "SR-01",
  "SR-02",
  "SR-03",
  "SR-04",
  "SR-05",
  "SR-06",
  "SR-07",
  "SR-08",
  "SR-09",
  "SR-10",
  "SR-11",
  "SR-12",
]);

export const BRANCH_TO_PRECEDENCE_PRIORITY = Object.freeze({
  P_0A: "0a",
  P_0B: "0b",
  P_0C: "0c",
  P_1: "1",
  P_1B: "1b",
  P_2: "2",
  P_3A: "3a",
  P_3: "3",
  P_4: "4",
  P_5X: "5X",
  P_5A: "5A",
  P_5B: "5B",
});

export const SR12_MARKER_IDS = Object.freeze([
  "DIRECT_FRICTION_CONTEXT_UNAVAILABLE",
  "REVERSE_DIRECTION_EXTRAPOLATION_PROHIBITED",
]);

export const DERIVATION_METHOD_ALLOWLIST_SOURCE_ROWS = Object.freeze([5, 6, 7, 8]);
export const DERIVATION_METHOD_ALLOWLIST_FIELDS = Object.freeze(["2", "3"]);
export const XP1_SOURCE_ROW = 9;

export const REQUEST_SCHEMA_VERSION = "agent-request-1.2";
export const OUTPUT_SCHEMA_VERSION = "agent-result-1.4";

export const PROVIDER_PROJECTION_VERSION = "provider-projection-1.3";
export const PROVIDER_PROMPT_VERSION = "provider-prompt-1.2";
export const PROVIDER_CANDIDATE_SCHEMA_VERSION = "provider-semantic-candidate-1.2";

export const CONSTRAINT_SCOPE_REQUEST_WIDE = "REQUEST_WIDE";
export const CONSTRAINT_SCOPE_BRANCH = "BRANCH";

export const CONSTRAINT_SCOPES = Object.freeze([
  CONSTRAINT_SCOPE_REQUEST_WIDE,
  CONSTRAINT_SCOPE_BRANCH,
]);

export const BASELINE_CONSTRAINT_IDS = Object.freeze([
  "C-NO-FACT-MUTATION",
  "C-NO-FABRICATION",
  "C-NO-UNESTABLISHED-STATE",
  "C-NO-NUMERIC-PROBABILITY",
  "C-FACT-VS-INTERPRETATION",
  "C-NO-HUMAN-REVIEW-CLAIM",
  "C-DISCLOSE-MATERIAL-UNCERTAINTY",
  "C-USECLASS-IMMUTABLE",
  "C-CONTEXT-BOUND-INTERPRETATION",
  "C-NO-SHADOW-SCORING",
]);

export const BLOCKED_CLAIM_IDS_BY_CONSTRAINT = Object.freeze({
  "C-1B-SUPPRESSION": Object.freeze(["CLAIM_NF_SFP_DETERMINATION"]),
});

// Canonical SystemFailure boundary (system-failure-1.0). Result Assembly owns
// materialization; classes are provider-agnostic and retryability is canonical
// per the accepted error model — never derived from execution-local hints.
export const FAILURE_SCHEMA_VERSION = "system-failure-1.0";

export const SYSTEM_FAILURE_CLASSES = Object.freeze([
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_TIMEOUT",
  "RESPONSE_MALFORMED",
  "OUTPUT_SCHEMA_VIOLATION",
  "UNRESOLVABLE_REFERENCE",
  "GROUNDING_VALIDATION_FAILURE",
  "PROHIBITED_CLAIM_VIOLATION",
  "ENGINE_FACT_MUTATION_DETECTED",
  FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  "CONSTRAINT_ENFORCEMENT_FAILURE",
]);

export const SYSTEM_FAILURE_RETRYABLE_BY_CLASS = Object.freeze({
  PROVIDER_UNAVAILABLE: true,
  PROVIDER_TIMEOUT: true,
  RESPONSE_MALFORMED: true,
  OUTPUT_SCHEMA_VIOLATION: true,
  UNRESOLVABLE_REFERENCE: true,
  GROUNDING_VALIDATION_FAILURE: true,
  PROHIBITED_CLAIM_VIOLATION: true,
  ENGINE_FACT_MUTATION_DETECTED: false,
  [FAILURE_CLASS_CONTRACT_VERSION_MISMATCH]: false,
  [FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE]: false,
  CONSTRAINT_ENFORCEMENT_FAILURE: false,
});

export const SYSTEM_FAILURE_CLIENT_DISCLOSURE = "SYSTEM_LEVEL_ONLY";
