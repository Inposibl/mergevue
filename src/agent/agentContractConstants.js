export const AGENT_CONTRACT_VERSION = "D0_R0_CORR2_A2C1_CORR1";
export const SNAPSHOT_SCHEMA_VERSION = "engine-snapshot-1.1";

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

export const UNRESOLVED_REASON = Object.freeze({
  MISSING_MODULE: "missing_module",
  UNSUPPORTED_MODULE: "unsupported_module",
  UNSUPPORTED_OR_MISSING_QUESTION: "unsupported_or_missing_question",
  ROLE_CODE_UNSPECIFIED: "roleCode_unspecified",
  UNKNOWN_SENIORITY: "unknown_seniority",
});

export const P0C_IDENTITY_UNRESOLVED_REASONS = Object.freeze([
  UNRESOLVED_REASON.MISSING_MODULE,
  UNRESOLVED_REASON.UNSUPPORTED_MODULE,
  UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION,
]);

export const P0C_ROLE_SENIORITY_UNRESOLVED_REASONS = Object.freeze([
  UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED,
  UNRESOLVED_REASON.UNKNOWN_SENIORITY,
]);

export const P0C_FREE_INTERPRETATION_MODE_BY_UNRESOLVED_REASON = Object.freeze({
  [UNRESOLVED_REASON.MISSING_MODULE]: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
  [UNRESOLVED_REASON.UNSUPPORTED_MODULE]: FREE_INTERPRETATION_MODE.AUTOMATED_ABSTENTION_CANDIDATE,
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
