import { SemanticValidationError } from "./semanticValidationError.js";
import { SEMANTIC_VALIDATOR_VERSION } from "./semanticValidatorConstants.js";

// J1 — Semantic applicability matrix as immutable data sealed under
// SEMANTIC_VALIDATOR_VERSION, plus the deterministic applicability functions
// that interpret it. The rows, their target families, their conditions, their
// failure codes, and their invariant strings are exactly the accepted matrix:
// no additional semantic row, methodology, prohibited meaning, scoring
// language, or example may be added here without a new accepted act.

const ALL_FAMILIES = Object.freeze([
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

function families(...names) {
  const order = new Map(ALL_FAMILIES.map((name, index) => [name, index]));
  return Object.freeze([...names].sort((left, right) => order.get(left) - order.get(right)));
}

// Condition vocabulary (deterministic, data-only):
//   { type: "BRANCH_IS", value }        — engine outcome branchCode equals value
//   { type: "CONSTRAINT_ACTIVE", value } — constraintId is active on the request
//   { type: "SCOPE_IS", value }          — permittedOutputScope equals value
//   { type: "HYPOTHESES_PRESENT" }       — interpretation.hypotheses.items.length >= 1
//   { type: "ORDERING_IS", value }       — hypotheses ordering equals value (implies >= 1 item)
//   { type: "MARKER_PRESENT" }           — a prohibited extrapolation marker is present in the pack
//   { type: "CLAIM_TYPE_IN", value }     — the claim's claimType is in value (CLAIM_TEXT only)
//   { type: "HAS_LINKED_OBSERVATION_USECLASS" }
//                                        — the target has at least one deterministically
//                                          linked Engine observation qref supplying UseClass
//                                          authority, resolved by the injected shared
//                                          linkedObservationQrefs resolver (V-21 only;
//                                          J1 CORR2 no-empty-authority law: with no
//                                          observation link there is no V-21 check and
//                                          unsupported UseClass wording is protected by
//                                          V-04-SEM-GROUNDING instead)
// A target instance always has to exist for any check to be created.
const ALWAYS = Object.freeze([]);

export const SEMANTIC_APPLICABILITY_MATRIX = Object.freeze({
  semanticValidatorVersion: SEMANTIC_VALIDATOR_VERSION,
  rows: Object.freeze([
    Object.freeze({
      ruleId: "V-02",
      semanticSubruleId: "V-02-SEM-STATE-IN-PROSE",
      ordinal: 1,
      targetFamilies: ALL_FAMILIES,
      conditions: ALWAYS,
      failureViolationCode: "ENGINE_FACT_MUTATION_DETECTED",
      expectedInvariant: "Authored prose must not change or assert Engine state beyond canonical Engine truth: result.engineFactsRef.{branchCode, stateAsserted} strict-equal the sealed snapshot, null included (V-02, I1).",
      allowedSemanticInterpretations: Object.freeze([
        "Restating the engine-established state, branch, or suppression value exactly as recorded in the sealed EngineSnapshot.",
        "Stating plainly that the engine did not establish a value it did not establish.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Asserting a deterministic state, priority, branch, or suppression value different from, or absent in, canonical Engine truth.",
        "Reconstructing an engine output that was withheld.",
      ]),
      authorityPlan: "V-02-STATE-IN-PROSE",
    }),
    Object.freeze({
      ruleId: "V-04",
      semanticSubruleId: "V-04-SEM-GROUNDING",
      ordinal: 2,
      targetFamilies: families(
        "CLAIM_TEXT",
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
      ),
      conditions: ALWAYS,
      failureViolationCode: "GROUNDING_VALIDATION_FAILURE",
      expectedInvariant: "Every material statement maps to the engine, uncertainty, or pack references attached to it; general language is permitted for phrasing and prohibited as evidentiary support (V-04, §9.1, §9.4).",
      allowedSemanticInterpretations: Object.freeze([
        "Meaning derivable from the exact resolved references attached to this target.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Meaning with no basis in the attached references.",
        "Unsupported causal assertions (§9.2).",
        "Filling missing organizational observations from general world knowledge, industry priors, or base rates.",
      ]),
      authorityPlan: "V-04-GROUNDING",
    }),
    Object.freeze({
      ruleId: "V-04",
      semanticSubruleId: "V-04-SEM-CAUSAL-OVERREACH",
      ordinal: 3,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "TRANSITION_PATTERN_LABEL",
        "FRICTION_MECHANISM_LABEL",
        "SCENARIO_INTERPRETATION_STATEMENT",
        "WATCHPOINT_STATEMENT",
        "DECISIVE_EVIDENCE_STATEMENT",
        "CONFLICTING_EVIDENCE_STATEMENT",
      ),
      conditions: ALWAYS,
      failureViolationCode: "GROUNDING_VALIDATION_FAILURE",
      expectedInvariant: "Causal assertions are supported only where the link is in the accepted methodology corpus as selected into the pack (§9.2); narrative causal scope is the union of its derived claims' authorities.",
      allowedSemanticInterpretations: Object.freeze([
        "Causal language whose link is present in the attached references.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "\"Because X, Y will happen\" where the link is not in an accepted source.",
        "Causal conclusions unsupported by evidence (§13.3).",
      ]),
      authorityPlan: "V-04-CAUSAL-OVERREACH",
    }),
    Object.freeze({
      ruleId: "V-04",
      semanticSubruleId: "V-04-SEM-CLAIMTYPE-ALIGNMENT",
      ordinal: 4,
      targetFamilies: Object.freeze(["CLAIM_TEXT"]),
      conditions: ALWAYS,
      failureViolationCode: "OUTPUT_SCHEMA_VIOLATION",
      expectedInvariant: "Claim text aligns with its declared claimType and the required linguistic markers (§13.1): interpretation-class claims must not use engine-fact markers, and fact-class claims must not be hedged into ambiguity.",
      allowedSemanticInterpretations: Object.freeze([
        "Text consistent with the declared claimType and its required marker register.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Interpretation claims worded as engine-established fact.",
        "Deterministic facts hedged into ambiguity.",
      ]),
      authorityPlan: "V-04-CLAIMTYPE-ALIGNMENT",
    }),
    Object.freeze({
      ruleId: "V-06",
      semanticSubruleId: "V-06-SEM-DETERMINATION",
      ordinal: 5,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_1B" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_1B the NF/SFP determination is unavailable and may not be manufactured in any form, including as a rank-1 hypothesis or a \"leaning\" (V-06, §7.3, I11).",
      allowedSemanticInterpretations: Object.freeze([
        "Stating plainly that the engine did not determine NF/SFP vs NF/SFJ.",
        "Interpreting implications around the unresolved pair determination while stating exactly what remains unavailable.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Asserting the suppressed NF/SFP determination in any form.",
        "Manufacturing the suppressed pair determination as a hypothesis or a leaning.",
      ]),
      authorityPlan: "V-06-DETERMINATION",
    }),
    Object.freeze({
      ruleId: "V-07",
      semanticSubruleId: "V-07-SEM-FALLBACK",
      ordinal: 6,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_1B" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_1B the prohibited fallback is active and a fallback-derived environment determination may not reappear (V-07, §7.3).",
      allowedSemanticInterpretations: Object.freeze([
        "Describing the suppressed state exactly as the engine recorded it.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Restoring any EDv2-style fallback.",
        "Presenting a fallback-derived environment determination.",
      ]),
      authorityPlan: "V-07-FALLBACK",
    }),
    Object.freeze({
      ruleId: "V-08",
      semanticSubruleId: "V-08-SEM-4A",
      ordinal: 7,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_3A" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_3A stateAsserted is null and no claim may assert ④-A, automatic or otherwise (V-08; C-3A-NOT-4A; I12).",
      allowedSemanticInterpretations: Object.freeze([
        "Presenting the one-HIGH discriminator divergence as a genuine, decision-relevant finding.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Transforming 3a into ④-A.",
        "Asserting a ④-A classification on P_3A.",
      ]),
      authorityPlan: "V-08-4A",
    }),
    Object.freeze({
      ruleId: "V-09",
      semanticSubruleId: "V-09-SEM-FINAL-4B",
      ordinal: 8,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_2" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_2 the result carries provisionalState \"candidate_4B\" and never state; no claim asserts final ④-B or calls the candidate blocked or confirmed (V-09; C-4B-CANDIDATE-ONLY; I13).",
      allowedSemanticInterpretations: Object.freeze([
        "Identifying the candidate pair identification as itself in question, with the out-of-pair concentration as evidence.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Calling the candidate ④-B final, blocked, or confirmed.",
        "Implying confirmation occurred or is pending with a human.",
      ]),
      authorityPlan: "V-09-FINAL-4B",
    }),
    Object.freeze({
      ruleId: "V-10",
      semanticSubruleId: "V-10-SEM-STATE-12",
      ordinal: 9,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_5X" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_5X stateAsserted is null and no claim asserts State① or State②; the ambiguity must not be collapsed by any means (V-10; C-5X-NO-COLLAPSE; I14).",
      allowedSemanticInterpretations: Object.freeze([
        "Presenting the competing readings as ranked or co-equal alternatives with their own evidenceBasis.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Forcing, defaulting to, or \"effectively\" assigning State① or State②.",
        "Describing the ambiguity as resolved.",
        "Auto-classifying as ④-B.",
      ]),
      authorityPlan: "V-10-STATE-12",
    }),
    Object.freeze({
      ruleId: "V-12",
      semanticSubruleId: "V-12-SEM-HUMAN-REVIEW",
      ordinal: 10,
      targetFamilies: ALL_FAMILIES,
      conditions: ALWAYS,
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "No output may assert that a human reviewed the case: humanReviewOccurred is false, routing tokens are never rendered, and their existence is never evidence that a person acted (V-12; C-NO-HUMAN-REVIEW-CLAIM; §8.2).",
      allowedSemanticInterpretations: Object.freeze([
        "Ordinary operational or evidence review language that does not assert a review occurred.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Asserting a practitioner or analyst reviewed this case.",
        "Presenting practitioner_review or any routing token as an action a person took.",
      ]),
      authorityPlan: "V-12-HUMAN-REVIEW",
    }),
    Object.freeze({
      ruleId: "V-13",
      semanticSubruleId: "V-13-SEM-PROBABILITY",
      ordinal: 11,
      targetFamilies: ALL_FAMILIES,
      conditions: ALWAYS,
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "No numeric probability, confidence, likelihood, odds, confidence interval, or numeric-adjacent hedge may appear while no accepted calibration basis exists; the four-factor quality product is not a confidence figure (V-13; C-NO-NUMERIC-PROBABILITY; §6, I10).",
      allowedSemanticInterpretations: Object.freeze([
        "Qualitative wording that is non-normative, carries no contract-defined semantics, and is accompanied by the structured evidenceBasis.",
        "Citing an engine threshold comparison as an engine fact in the corpus's own terms via factref.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Numeric probability or confidence values, percentages, odds, or numeric-adjacent hedges.",
        "Rendering the four-factor quality product as if it were a confidence or likelihood figure.",
        "Restating layeredEvidenceScoring confidence or signalStrength when no Layer-1 result is supplied (§6.4).",
      ]),
      authorityPlan: "V-13-PROBABILITY",
    }),
    Object.freeze({
      ruleId: "V-18",
      semanticSubruleId: "V-18-SEM-DEC8",
      ordinal: 12,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "DISCLOSURE_CLIENT_STATEMENT",
        "DECISIVE_EVIDENCE_STATEMENT",
        "CONFLICTING_EVIDENCE_STATEMENT",
      ),
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_4" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_4 DEC-8 trigger observations are trigger-only admissible and may not be counted as ordinary PRIMARY × PRIMARY agreements or as priority-1 coverage (V-18; C-DEC8-TRIGGER-ONLY; I16).",
      allowedSemanticInterpretations: Object.freeze([
        "Citing dec8TriggerRefs as the deterministic split evidence exactly as the engine recorded them.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Counting DEC-8 trigger observations as ordinary PRIMARY × PRIMARY agreements.",
        "Folding DEC-8 trigger observations into priority-1 coverage.",
        "Recomputing agreement using a different admissibility standard.",
      ]),
      authorityPlan: "V-18-DEC8",
    }),
    Object.freeze({
      ruleId: "V-19",
      semanticSubruleId: "V-19-SEM-DEC7B",
      ordinal: 13,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "SCENARIO_INTERPRETATION_STATEMENT",
        "DISCLOSURE_CLIENT_STATEMENT",
      ),
      conditions: Object.freeze([{ type: "CONSTRAINT_ACTIVE", value: "C-DEC7B-FLOOR" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "No claim may describe a pattern below the corpus 5–6 effective-agreement window as State② or \"effectively State②\", and one-HIGH agreement never substitutes for the floor (V-19; C-DEC7B-FLOOR).",
      allowedSemanticInterpretations: Object.freeze([
        "Describing weaker patterns as weaker patterns.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Describing a below-floor pattern as State② or effectively State②.",
        "Suggesting one-HIGH agreement substitutes for the 5–6 effective-agreement floor.",
      ]),
      authorityPlan: "V-19-DEC7B",
    }),
    Object.freeze({
      ruleId: "V-20",
      semanticSubruleId: "V-20-SEM-BROADENING",
      ordinal: 14,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "BRANCH_IS", value: "P_1B" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "On P_1B the suppression covers exactly the both-discriminator OBSERVATION_GAP condition on the canonical one-HIGH pair and may not be broadened (V-20; C-1B-NO-BROADENING; §0A).",
      allowedSemanticInterpretations: Object.freeze([
        "Describing only the both-OBSERVATION_GAP condition that actually fired.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Describing the suppression as covering unknown, CONTEXTUAL, mixed, generic, or \"equivalent\" unavailability.",
      ]),
      authorityPlan: "V-20-BROADENING",
    }),
    Object.freeze({
      ruleId: "V-21",
      semanticSubruleId: "V-21-SEM-USECLASS",
      ordinal: 15,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "DISCLOSURE_CLIENT_STATEMENT",
        "DECISIVE_EVIDENCE_STATEMENT",
        "CONFLICTING_EVIDENCE_STATEMENT",
        "MISSING_EVIDENCE_STATEMENT",
      ),
      // J1 CORR2: V-21 exists only when the target has at least one
      // deterministically linked Engine observation whose UseClass can be
      // supplied as authority; never unconditionally, never with an empty
      // authority set.
      conditions: Object.freeze([{ type: "HAS_LINKED_OBSERVATION_USECLASS" }]),
      failureViolationCode: "ENGINE_FACT_MUTATION_DETECTED",
      expectedInvariant: "No statement may assign an observation a UseClass different from engine.observations[].useClass (V-21; C-USECLASS-IMMUTABLE; I17).",
      allowedSemanticInterpretations: Object.freeze([
        "Restating the engine-recorded UseClass exactly.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Reclassifying any observation.",
        "Assigning or implying a UseClass different from the one the engine recorded.",
      ]),
      authorityPlan: "V-21-USECLASS",
    }),
    Object.freeze({
      ruleId: "V-22",
      semanticSubruleId: "V-22-SEM-NARRATIVE-SCOPE",
      ordinal: 16,
      targetFamilies: Object.freeze(["NARRATIVE_SECTION_TEXT"]),
      conditions: ALWAYS,
      failureViolationCode: "GROUNDING_VALIDATION_FAILURE",
      expectedInvariant: "A client narrative section is a rendering of the claims it derives from, not an independent source of meaning: it may paraphrase but may not introduce unsupported new meaning (V-22; §5.F).",
      allowedSemanticInterpretations: Object.freeze([
        "Paraphrase of the exact claims referenced in derivedFromClaimIds.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Introducing meaning absent from the referenced claims.",
        "Softening or filling an absence the referenced claims state plainly.",
      ]),
      authorityPlan: "V-22-NARRATIVE-SCOPE",
    }),
    Object.freeze({
      ruleId: "V-23",
      semanticSubruleId: "V-23-SEM-CONTEXT-BOUND",
      ordinal: 17,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "TRANSITION_PATTERN_LABEL",
        "FRICTION_MECHANISM_LABEL",
        "WATCHPOINT_STATEMENT",
        "AFFECTED_RESOURCE_LABEL",
      ),
      conditions: ALWAYS,
      conditionsByFamily: Object.freeze({
        CLAIM_TEXT: Object.freeze([
          { type: "SCOPE_IS", value: "MERGEVUE_INTERPRETATION_PERMITTED" },
          { type: "CLAIM_TYPE_IN", value: Object.freeze([
            "BOUNDED_INTERPRETATION",
            "ALTERNATIVE_HYPOTHESIS",
            "WATCHPOINT",
          ]) },
        ]),
        NARRATIVE_SECTION_TEXT: Object.freeze([{ type: "SCOPE_IS", value: "MERGEVUE_INTERPRETATION_PERMITTED" }]),
        HYPOTHESIS_STATEMENT: Object.freeze([{ type: "SCOPE_IS", value: "MERGEVUE_INTERPRETATION_PERMITTED" }]),
      }),
      failureViolationCode: "GROUNDING_VALIDATION_FAILURE",
      expectedInvariant: "MergeVue-specific organizational meaning requires Context Pack provenance: the target's contextRefs resolve into selectedContextItems and its meaning stays inside permittedInterpretationDomains (V-23; C-CONTEXT-BOUND-INTERPRETATION; I19).",
      allowedSemanticInterpretations: Object.freeze([
        "MergeVue organizational meaning grounded in the attached context items and permitted domains.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "MergeVue-specific meaning asserted without Context Pack provenance.",
        "Organizational meaning outside the pack's permitted interpretation domains.",
        "Pretrained knowledge substituted for pack provenance.",
      ]),
      authorityPlan: "V-23-CONTEXT-BOUND",
    }),
    Object.freeze({
      ruleId: "V-24",
      semanticSubruleId: "V-24-SEM-CASE-A-LEAKAGE",
      ordinal: 18,
      targetFamilies: ALL_FAMILIES,
      conditions: Object.freeze([{ type: "SCOPE_IS", value: "FACTUAL_EXPLANATION_ONLY" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "Under permittedOutputScope = FACTUAL_EXPLANATION_ONLY the deliverable is Case A factual explanation only: what the engine established, what it did not, which evidence conflicts, why uncertainty exists, and which deterministic outputs were suppressed (V-24; §3.5).",
      allowedSemanticInterpretations: Object.freeze([
        "Case A factual explanation with no contextRefs and no methodology licence.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Any claim asserting MergeVue-specific organizational meaning under Case A.",
        "Interpretation licensed by methodology material that the pack does not supply.",
      ]),
      authorityPlan: "V-24-CASE-A-LEAKAGE",
    }),
    Object.freeze({
      ruleId: "V-28",
      semanticSubruleId: "V-28-SEM-SHADOW-SCORING",
      ordinal: 19,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "TRANSITION_PATTERN_LABEL",
        "FRICTION_MECHANISM_LABEL",
        "SCENARIO_INTERPRETATION_STATEMENT",
        "DECISIVE_EVIDENCE_STATEMENT",
        "CONFLICTING_EVIDENCE_STATEMENT",
        "WATCHPOINT_STATEMENT",
        "DISCLOSURE_CLIENT_STATEMENT",
      ),
      conditions: ALWAYS,
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "No qualitative support or confidence label rests on a newly invented threshold, count, or weighting; support language is not a diagnostic score and the withdrawn four-band enum never appears as a support label (V-28; C-NO-SHADOW-SCORING; §6.3, I20).",
      allowedSemanticInterpretations: Object.freeze([
        "Structured evidenceBasis as a direct projection of already-accepted engine facts.",
        "Qualitative wording accompanied by the structured evidenceBasis for the same claim and never presented as a rating.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "A support or confidence label whose stated basis is a count of observations, a cut point, or a weighting not present in an accepted source.",
        "Aggregating engine threshold comparisons into a new label.",
        "The withdrawn STRONG / MODERATE / LIMITED / INSUFFICIENT enum in the evidenceBasis position.",
      ]),
      authorityPlan: "V-28-SHADOW-SCORING",
    }),
    Object.freeze({
      ruleId: "V-29",
      semanticSubruleId: "V-29-SEM-RANK-PROBABILITY",
      ordinal: 20,
      targetFamilies: families(
        "HYPOTHESIS_STATEMENT",
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "DISCLOSURE_CLIENT_STATEMENT",
        "WATCHPOINT_STATEMENT",
        "SCENARIO_INTERPRETATION_STATEMENT",
      ),
      conditions: Object.freeze([{ type: "HYPOTHESES_PRESENT" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "Ranking is interpretive ordering, not an engine score: no probability, likelihood, odds, percentage, or frequency language attaches to any hypothesis or to rank, and no invented numerics or hidden weighting justify an ordering (V-29; §6.6).",
      allowedSemanticInterpretations: Object.freeze([
        "\"The best-supported reading of the available evidence, though support is limited\" where rank-1 evidenceBasis does not support a single well-grounded reading.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Converting rank into most-likely phrasing unsupported by rank-1 evidenceBasis.",
        "Probability, likelihood, odds, percentage, or frequency language attached to a hypothesis or to rank.",
        "Justifying an ordering by a scoring formula, weighted sum, or point tally.",
      ]),
      authorityPlan: "V-29-RANK-PROBABILITY",
    }),
    Object.freeze({
      ruleId: "V-30",
      semanticSubruleId: "V-30-SEM-COEQUAL-PREFERENCE",
      ordinal: 21,
      targetFamilies: families(
        "HYPOTHESIS_STATEMENT",
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
      ),
      conditions: Object.freeze([{ type: "ORDERING_IS", value: "CO_EQUAL" }]),
      failureViolationCode: "OUTPUT_SCHEMA_VIOLATION",
      expectedInvariant: "Where ordering = CO_EQUAL, hypotheses are co-equal first-class alternatives: rank is omitted from every item and preference language is prohibited (V-30; §6.6).",
      allowedSemanticInterpretations: Object.freeze([
        "Presenting co-equal hypotheses as equally available readings.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Preference language such as most likely, primary hypothesis, or first choice under CO_EQUAL.",
        "Forcing rank 1 / rank 2 where the evidence establishes no defensible ordering.",
      ]),
      authorityPlan: "V-30-COEQUAL-PREFERENCE",
    }),
    Object.freeze({
      ruleId: "V-32",
      semanticSubruleId: "V-32-SEM-EXTRAPOLATION",
      ordinal: 22,
      targetFamilies: families(
        "CLAIM_TEXT",
        "NARRATIVE_SECTION_TEXT",
        "HYPOTHESIS_STATEMENT",
        "TRANSITION_PATTERN_LABEL",
        "FRICTION_MECHANISM_LABEL",
        "WATCHPOINT_STATEMENT",
        "AFFECTED_RESOURCE_LABEL",
        "SCENARIO_INTERPRETATION_STATEMENT",
      ),
      conditions: Object.freeze([{ type: "MARKER_PRESENT" }]),
      failureViolationCode: "PROHIBITED_CLAIM_VIOLATION",
      expectedInvariant: "When a prohibited extrapolation marker is present in the canonical Context Pack authority, no claim may assert the content it closes (V-32; §12.4).",
      allowedSemanticInterpretations: Object.freeze([
        "Stating plainly that direct friction context is absent and no substitute exists.",
      ]),
      forbiddenSemanticImplications: Object.freeze([
        "Friction claims derived from reverse-direction logic from adjacent pairs.",
        "Asserting the content a present marker closes.",
      ]),
      authorityPlan: "V-32-EXTRAPOLATION",
    }),
  ]),
});

export function getSemanticSubrule(semanticSubruleId) {
  return SEMANTIC_APPLICABILITY_MATRIX.rows.find((row) => row.semanticSubruleId === semanticSubruleId) ?? null;
}

function preconditionFail(detail) {
  throw new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE", detail });
}

// The linked-observation resolver is injected by the caller that owns the
// shared implementation (semanticCheckEnumerator.js), so that applicability
// and authority construction consume one single deterministic source.
export function resolveSemanticApplicabilityContext(
  agentInterpretationRequest,
  agentInterpretationResult,
  linkedObservationQrefs,
) {
  const request = agentInterpretationRequest;
  const result = agentInterpretationResult;
  if (typeof linkedObservationQrefs !== "function") {
    preconditionFail("linkedObservationQrefs must be an injected function (shared V-21 resolver)");
  }
  const branchCode = request.engineSnapshot.engine.outcome.branchCode;
  const markers = request.interpretationContextPack.prohibitedExtrapolationMarkers ?? [];
  const hypotheses = result.interpretation.hypotheses;
  return Object.freeze({
    branchCode,
    permittedOutputScope: request.permittedOutputScope,
    activeConstraintIds: Object.freeze(
      [...(request.activeConstraints ?? [])]
        .map((row) => row.constraintId)
        .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)),
    ),
    hypothesesOrdering: hypotheses.ordering,
    hypothesesCount: hypotheses.items.length,
    extrapolationMarkerIds: Object.freeze(markers.map((marker) => marker.markerId)),
    extrapolationMarkerPresent: markers.length > 0,
    claimTypeByClaimId: Object.freeze(new Map(result.claims.map((claim) => [claim.claimId, claim.claimType]))),
    linkedObservationQrefs,
  });
}

function conditionHolds(condition, context, target) {
  switch (condition.type) {
    case "BRANCH_IS":
      return context.branchCode === condition.value;
    case "CONSTRAINT_ACTIVE":
      return context.activeConstraintIds.includes(condition.value);
    case "SCOPE_IS":
      return context.permittedOutputScope === condition.value;
    case "HYPOTHESES_PRESENT":
      return context.hypothesesCount >= 1;
    case "ORDERING_IS":
      return context.hypothesesCount >= 1 && context.hypothesesOrdering === condition.value;
    case "MARKER_PRESENT":
      return context.extrapolationMarkerPresent;
    case "CLAIM_TYPE_IN":
      return condition.value.includes(context.claimTypeByClaimId.get(target.metadata.claimId) ?? null);
    case "HAS_LINKED_OBSERVATION_USECLASS":
      return context.linkedObservationQrefs(target).length > 0;
    default:
      return false;
  }
}

// A check exists only for a present target whose row-level and per-family
// conditions all hold. An inactive semantic rule never creates a check.
export function semanticSubruleApplies(row, target, context) {
  if (!row.targetFamilies.includes(target.targetFamily)) return false;
  for (const condition of row.conditions) {
    if (!conditionHolds(condition, context, target)) return false;
  }
  const byFamily = row.conditionsByFamily?.[target.targetFamily];
  if (byFamily !== undefined) {
    for (const condition of byFamily) {
      if (!conditionHolds(condition, context, target)) return false;
    }
  }
  return true;
}
