import {
  ADJUDICATION_PROVENANCE_USE_CLASS_VALUES,
  AGENT_CONTRACT_VERSION,
  AUTHORITY_CLASSES,
  AUTHORIZED_MODULE_IDS,
  BASELINE_CONSTRAINT_IDS,
  BRANCH_CODES,
  CLAIM_IDS,
  CLAIM_SCOPES,
  CONSTRAINT_IDS,
  CONSTRAINT_SCOPES,
  CONTEXT_DOMAINS,
  CONTEXT_ITEM_KINDS,
  CONTEXT_PACK_SCHEMA_VERSION,
  DEC8_ADMISSIBILITY_SCOPE,
  DETERMINATION_IMPOSSIBLE_NF_SFP,
  ENGINE_OUTCOME_CODES,
  ENGINE_OUTCOME_SOURCES,
  FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
  FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
  FINALITY,
  FREE_INTERPRETATION_MODE,
  MATCHED_ACCESS_RULE_IDS,
  OUTPUT_SCHEMA_VERSION,
  PACK_SCOPE_VERDICTS,
  PRE_CORE_CONSTRAINT_IDS,
  PRE_CORE_OUTCOME_CODES,
  PROVIDER_PROJECTION_VERSION,
  QUESTION_UNIVERSE,
  REQUEST_SCHEMA_VERSION,
  RESPONDENT_SLOTS,
  SELECTION_RULE_IDS,
  SINGLE_R1_CONSTRAINT_ID,
  SINGLE_R1_OUTCOME_CODE,
  SINGLE_R1_REASON_CODE,
  SELECTOR_STATUS_TO_PRE_CORE_OUTCOME_CODE,
  SNAPSHOT_SCHEMA_VERSION,
  SR12_MARKER_IDS,
  UNCERTAINTY_DOMAINS,
  UNCERTAINTY_REASON_CODES,
  UNCERTAINTY_SCHEMA_VERSION,
} from "./agentContractConstants.js";
import {
  AgentInterpretationRequestAssemblyError,
  assertPreCoreEmptyContextInvariant,
  assertSingleR1ContextInvariant,
  validateAgentInterpretationRequestIntegrity,
} from "./agentInterpretationRequest.js";

export class ProviderProjectionError extends Error {
  constructor({ failureClass, detail } = {}) {
    const parts = [
      "ProviderProjectionError",
      failureClass ? `failureClass=${failureClass}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "ProviderProjectionError";
    this.failureClass = failureClass ?? FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE;
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new ProviderProjectionError({
    failureClass: FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE,
    detail,
  });
}

function versionFail(detail) {
  throw new ProviderProjectionError({
    failureClass: FAILURE_CLASS_CONTRACT_VERSION_MISMATCH,
    detail,
  });
}

const REQUEST_ROOT_KEYS = Object.freeze([
  "requestSchemaVersion",
  "agentContractVersion",
  "interpretationId",
  "engineSnapshot",
  "structuredUncertainty",
  "interpretationContextPack",
  "permittedOutputScope",
  "permittedInterpretationDomains",
  "freeInterpretationMode",
  "humanReviewOccurred",
  "activeConstraints",
  "outputSchemaVersion",
]);

const SNAPSHOT_KEYS = Object.freeze([
  "snapshotSchemaVersion",
  "engineSnapshotDigest",
  "outcomeSource",
  "identity",
  "selector",
  "engine",
]);

const SNAPSHOT_PROJECTED_KEYS = Object.freeze([
  "outcomeSource",
  "identity",
  "engine",
]);

const SNAPSHOT_IDENTITY_KEYS = Object.freeze([
  "diagnosticId",
  "projectId",
  "moduleId",
  "instrumentSourceWorkbook",
  "candidatePair",
  "candidatePairNormalized",
  "questionUniverse",
  "corpus",
  "runtime",
]);

const SNAPSHOT_IDENTITY_PROJECTED_KEYS = Object.freeze([
  "moduleId",
  "candidatePair",
  "candidatePairNormalized",
  "questionUniverse",
]);

const PRE_CORE_IDENTITY_PROJECTED_KEYS = Object.freeze([
  "candidatePair",
]);

const DUAL_ENGINE_KEYS = Object.freeze(["outcome", "observations", "comparison"]);
const PRE_CORE_ENGINE_KEYS = Object.freeze(["outcome", "observations"]);
const SINGLE_R1_ENGINE_KEYS = Object.freeze(["outcome", "observations", "r1Scoring"]);

const DUAL_OUTCOME_KEYS = Object.freeze([
  "priority",
  "branchCode",
  "engineOutcomeCode",
  "outcomeClass",
  "classificationOutcome",
  "state",
  "deterministicStateEstablished",
  "provisionalState",
  "engineRoutingMetadata",
  "engineOutput",
  "contradictionCandidates",
  "genericContradictionEngineInvoked",
  "suppression",
  "finality",
  "engineAuditRaw",
]);

const PRE_CORE_OUTCOME_KEYS = Object.freeze([
  "engineOutcomeCode",
  "outcomeClass",
  "classificationOutcome",
  "state",
  "deterministicStateEstablished",
  "provisionalState",
  "engineRoutingMetadata",
  "engineOutput",
  "contradictionCandidates",
  "genericContradictionEngineInvoked",
  "suppression",
  "finality",
]);

const SINGLE_R1_OUTCOME_KEYS = Object.freeze([
  "engineOutcomeCode",
  "outcomeClass",
  "classificationOutcome",
  "reason",
  "constraintId",
  "state",
  "deterministicStateEstablished",
  "provisionalState",
  "engineOutput",
  "contradictionCandidates",
  "genericContradictionEngineInvoked",
  "suppression",
  "finality",
]);

const DUAL_OUTCOME_PROJECTED_KEYS = Object.freeze([
  "priority",
  "branchCode",
  "engineOutcomeCode",
  "outcomeClass",
  "classificationOutcome",
  "state",
  "deterministicStateEstablished",
  "provisionalState",
  "engineOutput",
  "contradictionCandidates",
  "genericContradictionEngineInvoked",
  "suppression",
  "finality",
]);

const PRE_CORE_OUTCOME_PROJECTED_KEYS = Object.freeze([
  "engineOutcomeCode",
  "state",
  "deterministicStateEstablished",
  "suppression",
]);

const SINGLE_R1_OUTCOME_PROJECTED_KEYS = Object.freeze([
  "engineOutcomeCode",
  "reason",
  "constraintId",
  "state",
  "deterministicStateEstablished",
  "engineOutput",
  "contradictionCandidates",
  "genericContradictionEngineInvoked",
  "suppression",
  "finality",
]);

const R1_SCORING_KEYS = Object.freeze([
  "scoringModelVersion",
  "environmentScores",
  "weightedEnvironmentScores",
  "rankedEnvironments",
  "rawRankedEnvironments",
  "signalCompositionShare",
  "supportStrengthByEnvironment",
  "primaryEnvironmentCode",
  "primarySignalEnvironmentCode",
  "primarySignalScore",
  "secondaryEnvironmentCode",
  "secondarySignalEnvironmentCode",
  "secondarySignalScore",
]);

const SELECTOR_FIXED_KEYS = Object.freeze([
  "selectorId",
  "selectorVersion",
  "observationScopePolicy",
  "sourceModule",
  "sourceInstrument",
  "sessionId",
  "respondentSlot",
  "respondentVantage",
  "semanticBindings",
  "status",
  "decisionCode",
  "candidatePair",
  "candidatePairNormalized",
]);

const SELECTOR_UNRESOLVED_KEYS = Object.freeze([
  ...SELECTOR_FIXED_KEYS,
  "routing",
  "unresolvedReason",
]);

const OBSERVATION_KEYS = Object.freeze([
  "observationRef",
  "questionRef",
  "canonicalQuestionId",
  "respondentSlot",
  "respondentSide",
  "seniorityTier",
  "expectedVantage",
  "selectedOption",
  "semanticClass",
  "semanticClassEffect",
  "useClass",
  "comparisonEligible",
  "comparisonAvailability",
  "rootCauseFamily",
  "observationRouting",
  "accessDisposition",
  "observationAdjudicationProvenance",
  "causalDisposition",
  "declaredEvidenceFields",
  "unresolvedReason",
]);

const OBSERVATION_PROJECTED_KEYS = Object.freeze([
  "observationRef",
  "questionRef",
  "canonicalQuestionId",
  "respondentSlot",
  "respondentSide",
  "seniorityTier",
  "expectedVantage",
  "selectedOption",
  "semanticClass",
  "semanticClassEffect",
  "useClass",
  "comparisonEligible",
  "comparisonAvailability",
  "rootCauseFamily",
  "accessDisposition",
  "observationAdjudicationProvenance",
  "causalDisposition",
  "declaredEvidenceFields",
  "unresolvedReason",
]);

const COMPARISON_KEYS = Object.freeze([
  "available",
  "coverage",
  "agreement",
  "highResolvers",
  "discriminator",
  "governance",
  "roleSplit",
  "qualityConfig",
  "perQuestionQuality",
  "coherenceAmbiguousInput",
  "outOfPairEvidenceInput",
]);

const UNCERTAINTY_KEYS = Object.freeze([
  "uncertaintySchemaVersion",
  "originBranch",
  "materialUncertaintyPresent",
  "known",
  "unknown",
  "withheldOutputs",
  "survivingEvidenceRefs",
  "unavailableEvidenceRefs",
  "items",
  "claimBoundaries",
]);

const PACK_KEYS = Object.freeze([
  "contextPackSchemaVersion",
  "contextPackId",
  "contextPackDigest",
  "selectionPolicyVersion",
  "methodologySourcePackageId",
  "methodologyCorpusDigest",
  "selectionKeys",
  "selectedContextItems",
  "permittedInterpretationDomains",
  "prohibitedExtrapolationMarkers",
  "packScopeVerdict",
]);

const PACK_PROJECTED_KEYS = Object.freeze([
  "contextPackSchemaVersion",
  "selectedContextItems",
  "permittedInterpretationDomains",
  "prohibitedExtrapolationMarkers",
  "packScopeVerdict",
]);

const CONTEXT_ITEM_BASE_KEYS = Object.freeze([
  "contextItemId",
  "contextItemKind",
  "contextRef",
  "authorityClass",
  "contextDomain",
  "relevance",
  "content",
  "conditionalOn",
]);

const CONTEXT_ITEM_OPTIONAL_KEYS = Object.freeze(["sourceRef", "supersededBy"]);

const CONTEXT_ITEM_RELEVANCE_KEYS = Object.freeze([
  "branchRelevance",
  "questionRelevance",
  "environmentRelevance",
  "selectionRuleId",
]);

const CONSTRAINT_ROW_KEYS = Object.freeze([
  "constraintId",
  "scope",
  "blockedClaimIds",
  "originBranch",
]);

// Closed nested source shapes (F-01 policy: reject unexpected fixed keys at
// every fixed object level). Every set below mirrors the exact literal shape
// the runtime Core/sealing layers emit; no generic deep copy is used for these
// families. comparison.governance.dec8TriggerQuality is the single accepted
// dynamic-key map (questionRef keys).
const SUPPRESSION_KEYS = Object.freeze([
  "comparatorOutputSuppressed",
  "pairEvaluationSuppressed",
  "prohibitedFallbackActive",
  "determinationImpossible",
  "comparatorDidNotRun",
]);

const CONTRADICTION_ROW_KEYS = Object.freeze([
  "contradictionType",
  "severity",
  "source",
]);

const SEMANTIC_CLASS_EFFECT_KEYS = Object.freeze([
  "useClassEffect",
  "signalEffect",
  "coverageEffect",
  "rootCauseFamily",
]);

const ACCESS_DISPOSITION_KEYS = Object.freeze([
  "directObservationGate",
  "evidenceType",
  "retainedReliabilityFlags",
  "accessAdjudicated",
  "optionCode",
]);

const ADJUDICATION_PROVENANCE_KEYS = Object.freeze([
  "tierDefaultUseClass",
  "roleQuestionOverrideCap",
  "matchedAccessRuleIds",
]);

const CAUSAL_DISPOSITION_KEYS = Object.freeze([
  "retainedAuditFlags",
  "effectiveScoringFlags",
  "suppressedScoringFlags",
  "effectiveTriageFlags",
  "suppressedTriageFlags",
  "independentlySupportedFlags",
  "reliabilityEffects",
  "forcedInference",
]);

const RELIABILITY_EFFECTS_KEYS = Object.freeze([
  "evidenceTypeCap",
  "excludeFromPrimaryScoring",
  "treatAsUnknown",
  "analystReviewOnly",
  "numericMultiplier",
]);

const DECLARED_EVIDENCE_FIELDS_KEYS = Object.freeze([
  "evidenceType",
  "knowledgeLevel",
  "confidence",
  "reliabilityFlags",
]);

const COMPARISON_COVERAGE_KEYS = Object.freeze([
  "questionCount",
  "comparableQuestionRefs",
  "unavailableQuestionRefs",
  "insufficientCount",
  "coverageInsufficientMin",
  "coverageQuestionCount",
]);

const COMPARISON_AGREEMENT_KEYS = Object.freeze([
  "rawAgreeCount",
  "effectiveAgreeCount",
  "agreeQuestionRefs",
  "divergeQuestionRefs",
  "excludedFromAgreementRefs",
  "agreementExclusionKnowledgeLevel",
  "state1AgreeMin",
  "state2AgreeMin",
  "state2AgreeMax",
  "state3NonGovernanceAgreeMin",
]);

const COMPARISON_HIGH_RESOLVERS_KEYS = Object.freeze([
  "definedForPair",
  "agreeRefs",
  "divergeRefs",
  "allBothLackComparablePrimary",
  "anyNotPrimaryBoth",
]);

const COMPARISON_DISCRIMINATOR_KEYS = Object.freeze([
  "oneHighPair",
  "discriminatorQuestionRef",
  "activePairIsOneHigh",
  "bothDiscriminatorObservationGap",
  "discriminatorDiverged",
]);

const COMPARISON_GOVERNANCE_KEYS = Object.freeze([
  "governanceQuestionRefs",
  "dec8TriggerRefs",
  "dec8TriggerQuality",
  "nonGovernanceAgreeRefs",
  "dec8AdmissibilityScope",
]);

const COMPARISON_ROLE_SPLIT_KEYS = Object.freeze([
  "tierR1",
  "tierR2",
  "seniorLineSplitPresent",
]);

const COMPARISON_QUALITY_CONFIG_KEYS = Object.freeze([
  "thresholdHigh",
  "thresholdMedium",
  "thresholdLow",
  "thresholdExclude",
  "productNote",
]);

const PER_QUESTION_QUALITY_ROW_KEYS = Object.freeze([
  "questionRef",
  "fourFactorProduct",
  "comparable",
  "agree",
  "diverge",
  "countableAgree",
  "excludedFromAgreementCount",
  "dec8Trigger",
  "triggerQuality",
]);

const KNOWN_FACT_ROW_KEYS = Object.freeze(["factRef", "statement", "value"]);

const UNKNOWN_FACT_ROW_KEYS = Object.freeze(["claimId", "statement", "whyUnknown"]);

const WITHHELD_OUTPUT_ROW_KEYS = Object.freeze([
  "withheldItem",
  "withheldBy",
  "engineOutputText",
  "reconstructionProhibited",
]);

const UNCERTAINTY_ITEM_ROW_KEYS = Object.freeze([
  "uncertaintyId",
  "uncertaintyDomain",
  "reasonCode",
  "originBranch",
  "affectedClaims",
  "claimScope",
  "evidenceRefs",
  "constraintIds",
  "disclosureRequired",
  "derivationSource",
]);

const CLAIM_BOUNDARY_ROW_KEYS = Object.freeze(["claimId", "permitted", "permittedForm"]);

const EXTRAPOLATION_MARKER_ROW_KEYS = Object.freeze(["markerId", "text"]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function requirePlainObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be a plain object`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value;
}

function assertExactKeySet(source, keys, label) {
  const actual = Object.keys(source);
  const expected = new Set(keys);
  const missing = [...expected].filter((key) => !Object.hasOwn(source, key));
  const unexpected = actual.filter((key) => !expected.has(key));
  if (missing.length > 0) fail(`${label} is missing keys: ${missing.join(", ")}`);
  if (unexpected.length > 0) fail(`${label} carries unexpected keys: ${unexpected.join(", ")}`);
}

// Deep identity projection: order-preserving copy of the existing JSON-shaped
// graph. Preserves null, "", [] and optional-key physical absence; rejects
// undefined and any non-JSON value so no normalization can occur.
function copyValue(value, label) {
  if (value === null) return null;
  const type = typeof value;
  if (type === "string" || type === "boolean") return value;
  if (type === "number") {
    if (!Number.isFinite(value)) fail(`${label} is a non-finite number`);
    return value;
  }
  if (type === "undefined") fail(`${label} is undefined`);
  if (type !== "object") fail(`${label} has unsupported type ${type}`);
  if (value instanceof Date || value instanceof Map || value instanceof Set) {
    fail(`${label} is a non-JSON object`);
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => copyValue(item, `${label}[${index}]`));
  }
  if (!isPlainObject(value)) fail(`${label} is not a plain object`);
  if (Object.getOwnPropertySymbols(value).length > 0) fail(`${label} carries symbol keys`);
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (child === undefined) fail(`${label}.${key} is undefined`);
    // Prototype-safe write (F-01-PROTOTYPE-OWN-KEY): defineProperty never
    // invokes the inherited __proto__ setter, so an own "__proto__" key (or
    // any setter-sensitive name) is copied as JSON data, never silently
    // dropped and never repurposed as prototype control. Ordinary objects
    // serialize to identical canonical bytes.
    Object.defineProperty(out, key, {
      value: copyValue(child, `${label}.${key}`),
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return out;
}

function pickExact(source, keys, label) {
  requirePlainObject(source, label);
  assertExactKeySet(source, keys, label);
  const out = {};
  for (const key of keys) {
    if (!Object.hasOwn(source, key)) fail(`${label}.${key} is missing`);
    const child = source[key];
    if (child === undefined) fail(`${label}.${key} is undefined`);
    out[key] = copyValue(child, `${label}.${key}`);
  }
  return out;
}

function requireString(value, label) {
  if (typeof value !== "string") fail(`${label} must be a string`);
  return value;
}

// ---------------------------------------------------------------------------
// Value-shape checkers (F-01 closure): every projected leaf must match the
// already accepted CORR1 projection contract exactly. No coercion, no
// normalization, no fallback. copyValue() only transports values that one of
// these checkers (or the narrow canonical-JSON-value exception) already
// accepted.
// ---------------------------------------------------------------------------

function vString(value, label) {
  if (typeof value !== "string") fail(`${label} must be a string`);
}

function vBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be a boolean`);
}

function vFiniteNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${label} must be a finite number`);
  }
}

function vEnum(acceptedValues) {
  return function enumChecker(value, label) {
    if (!acceptedValues.includes(value)) {
      fail(`${label} is not a lawful enum value: ${JSON.stringify(value)}`);
    }
  };
}

function vNullable(checker) {
  return function nullableChecker(value, label) {
    if (value === null) return;
    checker(value, label);
  };
}

function vArrayOf(checker) {
  return function arrayChecker(value, label) {
    if (!Array.isArray(value)) fail(`${label} must be an array`);
    value.forEach((item, index) => checker(item, `${label}[${index}]`));
  };
}

// identity.questionUniverse is the canonical question universe copied verbatim
// by the snapshot builder; exact equality keeps it a sealed reference universe.
function vQuestionUniverse(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  if (
    value.length !== QUESTION_UNIVERSE.length
    || value.some((questionRef, index) => questionRef !== QUESTION_UNIVERSE[index])
  ) {
    fail(`${label} must equal the canonical question universe`);
  }
}

// Narrow explicit exception: fields whose accepted contract is an arbitrary
// canonical JSON value (e.g. structuredUncertainty.known[].value). JSON
// scalars/objects/arrays remain lawful; undefined, functions, symbols, bigints
// and non-finite numbers stay forbidden. This is not a generic escape hatch.
function vCanonicalJsonValue(value, label) {
  if (value === null) return;
  const type = typeof value;
  if (type === "string" || type === "boolean") return;
  if (type === "number") {
    if (!Number.isFinite(value)) fail(`${label} is a non-finite number`);
    return;
  }
  if (type === "undefined" || type === "function" || type === "symbol" || type === "bigint") {
    fail(`${label} is not a canonical JSON value`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => vCanonicalJsonValue(item, `${label}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) fail(`${label} is not a plain object`);
  if (Object.getOwnPropertySymbols(value).length > 0) fail(`${label} carries symbol keys`);
  for (const [key, child] of Object.entries(value)) {
    if (child === undefined) fail(`${label}.${key} is undefined`);
    vCanonicalJsonValue(child, `${label}.${key}`);
  }
}

function assertShaped(source, spec, label) {
  requirePlainObject(source, label);
  for (const [key, checker] of Object.entries(spec)) {
    if (!Object.hasOwn(source, key)) fail(`${label}.${key} is missing`);
    const child = source[key];
    if (child === undefined) fail(`${label}.${key} is undefined`);
    checker(child, `${label}.${key}`);
  }
}

function vFixedObject(spec) {
  return function fixedObjectChecker(value, label) {
    assertShaped(value, spec, label);
  };
}

function vNullableFixedObject(spec) {
  return function nullableFixedObjectChecker(value, label) {
    if (value === null) return;
    assertShaped(value, spec, label);
  };
}

const USE_CLASS = vEnum(ADJUDICATION_PROVENANCE_USE_CLASS_VALUES);
const COMPARISON_AVAILABILITY = vEnum(["available", "unavailable"]);
const ENGINE_CONSTRAINT_IDS = Object.freeze([...CONSTRAINT_IDS, ...PRE_CORE_CONSTRAINT_IDS]);
const ALL_CONSTRAINT_IDS = Object.freeze([
  ...BASELINE_CONSTRAINT_IDS,
  ...CONSTRAINT_IDS,
  ...PRE_CORE_CONSTRAINT_IDS,
]);

const IDENTITY_VALUE_SHAPES = Object.freeze({
  moduleId: vEnum(AUTHORIZED_MODULE_IDS),
  candidatePair: vNullable(vString),
  candidatePairNormalized: vNullable(vString),
  questionUniverse: vQuestionUniverse,
});

const SHARED_OUTCOME_VALUE_SHAPES = Object.freeze({
  engineOutcomeCode: vEnum(ENGINE_OUTCOME_CODES),
  outcomeClass: vString,
  classificationOutcome: vString,
  state: vNullable(vString),
  deterministicStateEstablished: vBoolean,
  provisionalState: vNullable(vString),
  engineOutput: vString,
  genericContradictionEngineInvoked: vBoolean,
  finality: vEnum(Object.values(FINALITY)),
});

const DUAL_OUTCOME_VALUE_SHAPES = Object.freeze({
  ...SHARED_OUTCOME_VALUE_SHAPES,
  priority: vNullable(vString),
  branchCode: vEnum(BRANCH_CODES),
});

const PRE_CORE_OUTCOME_VALUE_SHAPES = Object.freeze({
  ...SHARED_OUTCOME_VALUE_SHAPES,
  engineOutcomeCode: vEnum(PRE_CORE_OUTCOME_CODES),
});

const SINGLE_R1_OUTCOME_VALUE_SHAPES = Object.freeze({
  ...SHARED_OUTCOME_VALUE_SHAPES,
  engineOutcomeCode: vEnum([SINGLE_R1_OUTCOME_CODE]),
  reason: vEnum([SINGLE_R1_REASON_CODE]),
  constraintId: vEnum([SINGLE_R1_CONSTRAINT_ID]),
});

const SUPPRESSION_VALUE_SHAPES = Object.freeze({
  comparatorOutputSuppressed: vBoolean,
  pairEvaluationSuppressed: vBoolean,
  prohibitedFallbackActive: vBoolean,
  determinationImpossible: vNullable(vEnum([DETERMINATION_IMPOSSIBLE_NF_SFP])),
  comparatorDidNotRun: vBoolean,
});

const CONTRADICTION_ROW_VALUE_SHAPES = Object.freeze({
  contradictionType: vString,
  severity: vString,
  source: vString,
});

const SEMANTIC_CLASS_EFFECT_VALUE_SHAPES = Object.freeze({
  useClassEffect: vNullable(vString),
  signalEffect: vNullable(vString),
  coverageEffect: vNullable(vString),
  rootCauseFamily: vNullable(vString),
});

const ACCESS_DISPOSITION_VALUE_SHAPES = Object.freeze({
  directObservationGate: vNullable(vString),
  evidenceType: vNullable(vString),
  retainedReliabilityFlags: vArrayOf(vString),
  accessAdjudicated: vNullable(vBoolean),
  optionCode: vNullable(vString),
});

const ADJUDICATION_PROVENANCE_VALUE_SHAPES = Object.freeze({
  tierDefaultUseClass: USE_CLASS,
  roleQuestionOverrideCap: USE_CLASS,
  matchedAccessRuleIds: vArrayOf(vEnum(MATCHED_ACCESS_RULE_IDS)),
});

const RELIABILITY_EFFECTS_VALUE_SHAPES = Object.freeze({
  evidenceTypeCap: vNullable(vString),
  excludeFromPrimaryScoring: vBoolean,
  treatAsUnknown: vBoolean,
  analystReviewOnly: vBoolean,
  numericMultiplier: vFiniteNumber,
});

const CAUSAL_DISPOSITION_VALUE_SHAPES = Object.freeze({
  retainedAuditFlags: vArrayOf(vString),
  effectiveScoringFlags: vArrayOf(vString),
  suppressedScoringFlags: vArrayOf(vString),
  effectiveTriageFlags: vArrayOf(vString),
  suppressedTriageFlags: vArrayOf(vString),
  independentlySupportedFlags: vArrayOf(vString),
  reliabilityEffects: vFixedObject(RELIABILITY_EFFECTS_VALUE_SHAPES),
  forcedInference: vBoolean,
});

const DECLARED_EVIDENCE_FIELDS_VALUE_SHAPES = Object.freeze({
  evidenceType: vNullable(vString),
  knowledgeLevel: vNullable(vString),
  confidence: vNullable(vString),
  reliabilityFlags: vArrayOf(vString),
});

const OBSERVATION_VALUE_SHAPES = Object.freeze({
  observationRef: vString,
  questionRef: vEnum(QUESTION_UNIVERSE),
  canonicalQuestionId: vNullable(vString),
  respondentSlot: vEnum(RESPONDENT_SLOTS),
  respondentSide: (value, label) => {
    if (value !== null) fail(`${label} must be null`);
  },
  seniorityTier: vNullable(vString),
  expectedVantage: vNullable(vString),
  selectedOption: vString,
  semanticClass: vNullable(vString),
  semanticClassEffect: vNullableFixedObject(SEMANTIC_CLASS_EFFECT_VALUE_SHAPES),
  useClass: vNullable(USE_CLASS),
  comparisonEligible: vNullable(vBoolean),
  comparisonAvailability: vNullable(COMPARISON_AVAILABILITY),
  rootCauseFamily: vNullable(vString),
  accessDisposition: vFixedObject(ACCESS_DISPOSITION_VALUE_SHAPES),
  observationAdjudicationProvenance: vFixedObject(ADJUDICATION_PROVENANCE_VALUE_SHAPES),
  causalDisposition: vNullableFixedObject(CAUSAL_DISPOSITION_VALUE_SHAPES),
  declaredEvidenceFields: vFixedObject(DECLARED_EVIDENCE_FIELDS_VALUE_SHAPES),
  unresolvedReason: vNullable(vString),
});

const COVERAGE_VALUE_SHAPES = Object.freeze({
  questionCount: vFiniteNumber,
  comparableQuestionRefs: vArrayOf(vString),
  unavailableQuestionRefs: vArrayOf(vString),
  insufficientCount: vNullable(vFiniteNumber),
  coverageInsufficientMin: vFiniteNumber,
  coverageQuestionCount: vFiniteNumber,
});

const AGREEMENT_VALUE_SHAPES = Object.freeze({
  rawAgreeCount: vNullable(vFiniteNumber),
  effectiveAgreeCount: vNullable(vFiniteNumber),
  agreeQuestionRefs: vArrayOf(vString),
  divergeQuestionRefs: vArrayOf(vString),
  excludedFromAgreementRefs: vArrayOf(vString),
  agreementExclusionKnowledgeLevel: vString,
  state1AgreeMin: vFiniteNumber,
  state2AgreeMin: vFiniteNumber,
  state2AgreeMax: vFiniteNumber,
  state3NonGovernanceAgreeMin: vFiniteNumber,
});

const HIGH_RESOLVERS_VALUE_SHAPES = Object.freeze({
  definedForPair: vArrayOf(vString),
  agreeRefs: vArrayOf(vString),
  divergeRefs: vArrayOf(vString),
  allBothLackComparablePrimary: vNullable(vBoolean),
  anyNotPrimaryBoth: vNullable(vBoolean),
});

const DISCRIMINATOR_VALUE_SHAPES = Object.freeze({
  oneHighPair: vString,
  discriminatorQuestionRef: vEnum(QUESTION_UNIVERSE),
  activePairIsOneHigh: vBoolean,
  bothDiscriminatorObservationGap: vNullable(vBoolean),
  discriminatorDiverged: vNullable(vBoolean),
});

const GOVERNANCE_VALUE_SHAPES = Object.freeze({
  governanceQuestionRefs: vArrayOf(vString),
  dec8TriggerRefs: vArrayOf(vString),
  dec8TriggerQuality: (value, label) => {
    // Only accepted dynamic-key map: keys must be canonical questionRefs from
    // identity.questionUniverse; values must be finite numbers.
    requirePlainObject(value, label);
    for (const questionRef of Object.keys(value)) {
      if (!QUESTION_UNIVERSE.includes(questionRef)) {
        fail(`${label} carries a non-canonical questionRef key: ${JSON.stringify(questionRef)}`);
      }
    }
    for (const [questionRef, quality] of Object.entries(value)) {
      vFiniteNumber(quality, `${label}[${questionRef}]`);
    }
  },
  nonGovernanceAgreeRefs: vArrayOf(vString),
  dec8AdmissibilityScope: vEnum([DEC8_ADMISSIBILITY_SCOPE]),
});

const ROLE_SPLIT_VALUE_SHAPES = Object.freeze({
  tierR1: vNullable(vString),
  tierR2: vNullable(vString),
  seniorLineSplitPresent: vNullable(vBoolean),
});

const QUALITY_CONFIG_VALUE_SHAPES = Object.freeze({
  thresholdHigh: vFiniteNumber,
  thresholdMedium: vFiniteNumber,
  thresholdLow: vFiniteNumber,
  thresholdExclude: vFiniteNumber,
  productNote: vString,
});

const PER_QUESTION_QUALITY_ROW_VALUE_SHAPES = Object.freeze({
  questionRef: vEnum(QUESTION_UNIVERSE),
  fourFactorProduct: vFiniteNumber,
  comparable: vBoolean,
  agree: vBoolean,
  diverge: vBoolean,
  countableAgree: vBoolean,
  excludedFromAgreementCount: vBoolean,
  dec8Trigger: vBoolean,
  triggerQuality: vNullable(vFiniteNumber),
});

const COMPARISON_VALUE_SHAPES = Object.freeze({
  available: vBoolean,
  coverage: vFixedObject(COVERAGE_VALUE_SHAPES),
  agreement: vFixedObject(AGREEMENT_VALUE_SHAPES),
  highResolvers: vFixedObject(HIGH_RESOLVERS_VALUE_SHAPES),
  discriminator: vFixedObject(DISCRIMINATOR_VALUE_SHAPES),
  governance: vFixedObject(GOVERNANCE_VALUE_SHAPES),
  roleSplit: vFixedObject(ROLE_SPLIT_VALUE_SHAPES),
  qualityConfig: vFixedObject(QUALITY_CONFIG_VALUE_SHAPES),
  perQuestionQuality: (value, label) => {
    if (!Array.isArray(value)) fail(`${label} must be an array`);
    value.forEach((row, index) => {
      assertShaped(row, PER_QUESTION_QUALITY_ROW_VALUE_SHAPES, `${label}[${index}]`);
    });
  },
  coherenceAmbiguousInput: vBoolean,
  outOfPairEvidenceInput: vBoolean,
});

const UNCERTAINTY_ROOT_VALUE_SHAPES = Object.freeze({
  uncertaintySchemaVersion: vString,
  originBranch: vEnum(ENGINE_OUTCOME_CODES),
  materialUncertaintyPresent: vBoolean,
  survivingEvidenceRefs: vArrayOf(vString),
  unavailableEvidenceRefs: vArrayOf(vString),
});

const KNOWN_ROW_VALUE_SHAPES = Object.freeze({
  factRef: vString,
  statement: vString,
  value: vCanonicalJsonValue,
});

const UNKNOWN_ROW_VALUE_SHAPES = Object.freeze({
  claimId: vEnum(CLAIM_IDS),
  statement: vString,
  whyUnknown: vNullable(vString),
});

const WITHHELD_ROW_VALUE_SHAPES = Object.freeze({
  withheldItem: vString,
  withheldBy: vEnum(ENGINE_OUTCOME_CODES),
  engineOutputText: vString,
  reconstructionProhibited: vBoolean,
});

const UNCERTAINTY_ITEM_ROW_VALUE_SHAPES = Object.freeze({
  uncertaintyId: vString,
  uncertaintyDomain: vEnum(UNCERTAINTY_DOMAINS),
  reasonCode: vNullable(vEnum(UNCERTAINTY_REASON_CODES)),
  originBranch: vEnum(ENGINE_OUTCOME_CODES),
  affectedClaims: vArrayOf(vEnum(CLAIM_IDS)),
  claimScope: vEnum(CLAIM_SCOPES),
  evidenceRefs: vArrayOf(vString),
  constraintIds: vArrayOf(vEnum(ENGINE_CONSTRAINT_IDS)),
  disclosureRequired: vBoolean,
  derivationSource: vString,
});

const CLAIM_BOUNDARY_ROW_VALUE_SHAPES = Object.freeze({
  claimId: vEnum(CLAIM_IDS),
  permitted: vBoolean,
  permittedForm: vString,
});

const CONTEXT_ITEM_VALUE_SHAPES = Object.freeze({
  contextItemId: vString,
  contextItemKind: vEnum(CONTEXT_ITEM_KINDS),
  contextRef: vString,
  authorityClass: vEnum(AUTHORITY_CLASSES),
  contextDomain: vEnum(CONTEXT_DOMAINS),
  relevance: vFixedObject(Object.freeze({
    branchRelevance: vArrayOf(vEnum(ENGINE_OUTCOME_CODES)),
    questionRelevance: vArrayOf(vEnum(QUESTION_UNIVERSE)),
    environmentRelevance: vArrayOf(vString),
    selectionRuleId: vEnum(SELECTION_RULE_IDS),
  })),
  content: vString,
  conditionalOn: vNullable(vString),
});

const CONTEXT_ITEM_OPTIONAL_VALUE_SHAPES = Object.freeze({
  sourceRef: vString,
  supersededBy: vString,
});

const MARKER_ROW_VALUE_SHAPES = Object.freeze({
  markerId: vEnum(SR12_MARKER_IDS),
  text: vString,
});

const CONSTRAINT_ROW_VALUE_SHAPES = Object.freeze({
  constraintId: vEnum(ALL_CONSTRAINT_IDS),
  scope: vEnum(CONSTRAINT_SCOPES),
  blockedClaimIds: vArrayOf(vEnum(CLAIM_IDS)),
  originBranch: vEnum(ENGINE_OUTCOME_CODES),
});

function closedRows(rows, keys, label) {
  return requireArray(rows, label).map((row, index) => pickExact(
    requirePlainObject(row, `${label}[${index}]`),
    keys,
    `${label}[${index}]`,
  ));
}

function closedNullableObject(value, keys, label) {
  if (value === null) return null;
  return pickExact(requirePlainObject(value, label), keys, label);
}

function closedCausalDisposition(value, label) {
  if (value === null) return null;
  const picked = pickExact(requirePlainObject(value, label), CAUSAL_DISPOSITION_KEYS, label);
  return {
    ...picked,
    reliabilityEffects: pickExact(
      requirePlainObject(picked.reliabilityEffects, `${label}.reliabilityEffects`),
      RELIABILITY_EFFECTS_KEYS,
      `${label}.reliabilityEffects`,
    ),
  };
}

function closedGovernance(value, label) {
  const picked = pickExact(requirePlainObject(value, label), COMPARISON_GOVERNANCE_KEYS, label);
  // dec8TriggerQuality is the single accepted dynamic-key map: keys must be
  // canonical questionRefs from identity.questionUniverse and values must be
  // finite numbers. Own enumerable keys only; no manual key sorting.
  const triggerQuality = requirePlainObject(picked.dec8TriggerQuality, `${label}.dec8TriggerQuality`);
  const dec8TriggerQuality = {};
  for (const questionRef of Object.keys(triggerQuality)) {
    if (!QUESTION_UNIVERSE.includes(questionRef)) {
      fail(`${label}.dec8TriggerQuality carries a non-canonical questionRef key: ${JSON.stringify(questionRef)}`);
    }
  }
  for (const [questionRef, quality] of Object.entries(triggerQuality)) {
    vFiniteNumber(quality, `${label}.dec8TriggerQuality[${questionRef}]`);
    dec8TriggerQuality[questionRef] = quality;
  }
  return { ...picked, dec8TriggerQuality };
}

function closedComparison(comparison) {
  const label = "engineSnapshot.engine.comparison";
  const picked = pickExact(
    requirePlainObject(comparison, label),
    COMPARISON_KEYS,
    label,
  );
  return {
    ...picked,
    coverage: pickExact(
      requirePlainObject(picked.coverage, `${label}.coverage`),
      COMPARISON_COVERAGE_KEYS,
      `${label}.coverage`,
    ),
    agreement: pickExact(
      requirePlainObject(picked.agreement, `${label}.agreement`),
      COMPARISON_AGREEMENT_KEYS,
      `${label}.agreement`,
    ),
    highResolvers: pickExact(
      requirePlainObject(picked.highResolvers, `${label}.highResolvers`),
      COMPARISON_HIGH_RESOLVERS_KEYS,
      `${label}.highResolvers`,
    ),
    discriminator: pickExact(
      requirePlainObject(picked.discriminator, `${label}.discriminator`),
      COMPARISON_DISCRIMINATOR_KEYS,
      `${label}.discriminator`,
    ),
    governance: closedGovernance(picked.governance, `${label}.governance`),
    roleSplit: pickExact(
      requirePlainObject(picked.roleSplit, `${label}.roleSplit`),
      COMPARISON_ROLE_SPLIT_KEYS,
      `${label}.roleSplit`,
    ),
    qualityConfig: pickExact(
      requirePlainObject(picked.qualityConfig, `${label}.qualityConfig`),
      COMPARISON_QUALITY_CONFIG_KEYS,
      `${label}.qualityConfig`,
    ),
    perQuestionQuality: closedRows(
      picked.perQuestionQuality,
      PER_QUESTION_QUALITY_ROW_KEYS,
      `${label}.perQuestionQuality`,
    ),
  };
}

function validateSelectorNode(selector, outcomeSource, identity, engineOutcomeCode) {
  const label = "engineSnapshot.selector";
  requirePlainObject(selector, label);
  const expectedKeys = selector.status === "ADMISSIBILITY_UNRESOLVED"
    ? SELECTOR_UNRESOLVED_KEYS
    : SELECTOR_FIXED_KEYS;
  assertExactKeySet(selector, expectedKeys, label);
  for (const key of [
    "selectorId",
    "selectorVersion",
    "observationScopePolicy",
    "sourceModule",
    "sourceInstrument",
    "sessionId",
    "respondentSlot",
    "status",
    "decisionCode",
  ]) {
    vString(selector[key], `${label}.${key}`);
  }
  requirePlainObject(selector.respondentVantage, `${label}.respondentVantage`);
  requireArray(selector.semanticBindings, `${label}.semanticBindings`);
  if (selector.decisionCode !== selector.status) fail(`${label}.decisionCode must equal status`);
  if (outcomeSource === "DUAL_CORE" || outcomeSource === SINGLE_R1_OUTCOME_CODE) {
    if (selector.status !== "SELECTED") fail("DUAL_CORE requires a SELECTED selector node");
    if (selector.candidatePair !== identity.candidatePair) fail("selector candidatePair mismatch");
    if (selector.candidatePairNormalized !== identity.candidatePairNormalized) {
      fail("selector candidatePairNormalized mismatch");
    }
    if (engineOutcomeCode === undefined) fail("selected selector engineOutcomeCode is required");
    return;
  }
  if (selector.candidatePair !== null || selector.candidatePairNormalized !== null) {
    fail("PRE_CORE_SELECTOR selector candidate pair fields must be null");
  }
  if (SELECTOR_STATUS_TO_PRE_CORE_OUTCOME_CODE[selector.status] !== engineOutcomeCode) {
    fail("PRE_CORE_SELECTOR selector status does not match engineOutcomeCode");
  }
  if (selector.status === "ADMISSIBILITY_UNRESOLVED") {
    if (selector.routing !== "practitioner_access_review") fail("selector routing mismatch");
    if (selector.unresolvedReason !== null && typeof selector.unresolvedReason !== "string") {
      fail("selector unresolvedReason must be a string or null");
    }
  }
}

function projectEngineSnapshot(snapshot) {
  requirePlainObject(snapshot, "engineSnapshot");
  assertExactKeySet(snapshot, SNAPSHOT_KEYS, "engineSnapshot");
  if (snapshot.snapshotSchemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    versionFail(`engineSnapshot.snapshotSchemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}`);
  }
  if (!ENGINE_OUTCOME_SOURCES.includes(snapshot.outcomeSource)) {
    fail(`engineSnapshot.outcomeSource is not lawful: ${JSON.stringify(snapshot.outcomeSource)}`);
  }

  const identity = pickExact(
    requirePlainObject(snapshot.identity, "engineSnapshot.identity"),
    SNAPSHOT_IDENTITY_KEYS,
    "engineSnapshot.identity",
  );
  assertShaped(identity, IDENTITY_VALUE_SHAPES, "engineSnapshot.identity");

  const engine = requirePlainObject(snapshot.engine, "engineSnapshot.engine");
  const engineKeys = snapshot.outcomeSource === "DUAL_CORE"
    ? DUAL_ENGINE_KEYS
    : snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE
      ? SINGLE_R1_ENGINE_KEYS
      : PRE_CORE_ENGINE_KEYS;
  assertExactKeySet(engine, engineKeys, "engineSnapshot.engine");

  const outcomeLabel = "engineSnapshot.engine.outcome";
  const outcomeKeys = snapshot.outcomeSource === "DUAL_CORE"
    ? DUAL_OUTCOME_KEYS
    : snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE
      ? SINGLE_R1_OUTCOME_KEYS
      : PRE_CORE_OUTCOME_KEYS;
  const pickedOutcome = pickExact(
    requirePlainObject(engine.outcome, outcomeLabel),
    outcomeKeys,
    outcomeLabel,
  );
  if (!ENGINE_OUTCOME_CODES.includes(pickedOutcome.engineOutcomeCode)) {
    fail(`engineSnapshot.engine.outcome.engineOutcomeCode is not closed: ${JSON.stringify(pickedOutcome.engineOutcomeCode)}`);
  }
  if (
    snapshot.outcomeSource === "DUAL_CORE"
    && (
      !BRANCH_CODES.includes(pickedOutcome.branchCode)
      || pickedOutcome.branchCode !== pickedOutcome.engineOutcomeCode
    )
  ) {
    fail("DUAL_CORE branchCode must equal engineOutcomeCode");
  }
  validateSelectorNode(snapshot.selector, snapshot.outcomeSource, identity, pickedOutcome.engineOutcomeCode);
  const suppression = pickExact(
    requirePlainObject(pickedOutcome.suppression, `${outcomeLabel}.suppression`),
    SUPPRESSION_KEYS,
    `${outcomeLabel}.suppression`,
  );
  assertShaped(suppression, SUPPRESSION_VALUE_SHAPES, `${outcomeLabel}.suppression`);
  const contradictionCandidates = closedRows(
    pickedOutcome.contradictionCandidates,
    CONTRADICTION_ROW_KEYS,
    `${outcomeLabel}.contradictionCandidates`,
  );
  contradictionCandidates.forEach((row, index) => {
    assertShaped(row, CONTRADICTION_ROW_VALUE_SHAPES, `${outcomeLabel}.contradictionCandidates[${index}]`);
  });
  const outcome = {
    ...pickedOutcome,
    suppression,
    contradictionCandidates,
  };
  assertShaped(
    outcome,
    snapshot.outcomeSource === "DUAL_CORE"
      ? DUAL_OUTCOME_VALUE_SHAPES
      : snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE
        ? SINGLE_R1_OUTCOME_VALUE_SHAPES
        : PRE_CORE_OUTCOME_VALUE_SHAPES,
    outcomeLabel,
  );

  const observations = requireArray(
    engine.observations,
    "engineSnapshot.engine.observations",
  ).map((observation, index) => {
    const label = `engineSnapshot.engine.observations[${index}]`;
    const picked = pickExact(requirePlainObject(observation, label), OBSERVATION_KEYS, label);
    const closed = {
      ...picked,
      semanticClassEffect: closedNullableObject(
        picked.semanticClassEffect,
        SEMANTIC_CLASS_EFFECT_KEYS,
        `${label}.semanticClassEffect`,
      ),
      accessDisposition: pickExact(
        requirePlainObject(picked.accessDisposition, `${label}.accessDisposition`),
        ACCESS_DISPOSITION_KEYS,
        `${label}.accessDisposition`,
      ),
      observationAdjudicationProvenance: pickExact(
        requirePlainObject(picked.observationAdjudicationProvenance, `${label}.observationAdjudicationProvenance`),
        ADJUDICATION_PROVENANCE_KEYS,
        `${label}.observationAdjudicationProvenance`,
      ),
      causalDisposition: closedCausalDisposition(picked.causalDisposition, `${label}.causalDisposition`),
      declaredEvidenceFields: pickExact(
        requirePlainObject(picked.declaredEvidenceFields, `${label}.declaredEvidenceFields`),
        DECLARED_EVIDENCE_FIELDS_KEYS,
        `${label}.declaredEvidenceFields`,
      ),
    };
    assertShaped(closed, OBSERVATION_VALUE_SHAPES, label);
    return closed;
  });

  if (snapshot.outcomeSource === "PRE_CORE_SELECTOR" && observations.length !== 0) {
    fail("PRE_CORE_SELECTOR observations must be empty");
  }
  const comparison = snapshot.outcomeSource === "DUAL_CORE"
    ? closedComparison(engine.comparison)
    : null;
  if (comparison) {
    assertShaped(comparison, COMPARISON_VALUE_SHAPES, "engineSnapshot.engine.comparison");
  }

  const projectedIdentity = {};
  const projectedIdentityKeys = snapshot.outcomeSource === "DUAL_CORE"
    ? SNAPSHOT_IDENTITY_PROJECTED_KEYS
    : snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE
      ? SNAPSHOT_IDENTITY_PROJECTED_KEYS
      : PRE_CORE_IDENTITY_PROJECTED_KEYS;
  for (const key of projectedIdentityKeys) {
    projectedIdentity[key] = identity[key];
  }
  const projectedOutcome = {};
  const projectedOutcomeKeys = snapshot.outcomeSource === "DUAL_CORE"
    ? DUAL_OUTCOME_PROJECTED_KEYS
    : snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE
      ? SINGLE_R1_OUTCOME_PROJECTED_KEYS
      : PRE_CORE_OUTCOME_PROJECTED_KEYS;
  for (const key of projectedOutcomeKeys) {
    projectedOutcome[key] = outcome[key];
  }
  const projectedObservations = observations.map((observation) => {
    const projected = {};
    for (const key of OBSERVATION_PROJECTED_KEYS) {
      projected[key] = observation[key];
    }
    return projected;
  });

  const projected = {
    outcomeSource: snapshot.outcomeSource,
    identity: projectedIdentity,
    engine: {
      outcome: projectedOutcome,
      observations: projectedObservations,
    },
  };
  if (comparison) projected.engine.comparison = comparison;
  if (snapshot.outcomeSource === SINGLE_R1_OUTCOME_CODE) {
    projected.engine.r1Scoring = pickExact(
      requirePlainObject(engine.r1Scoring, "engineSnapshot.engine.r1Scoring"),
      R1_SCORING_KEYS,
      "engineSnapshot.engine.r1Scoring",
    );
  }
  assertExactKeySet(projected, SNAPSHOT_PROJECTED_KEYS, "providerProjection.engineSnapshot");
  return projected;
}

function projectStructuredUncertainty(uncertainty) {
  requirePlainObject(uncertainty, "structuredUncertainty");
  assertExactKeySet(uncertainty, UNCERTAINTY_KEYS, "structuredUncertainty");
  if (uncertainty.uncertaintySchemaVersion !== UNCERTAINTY_SCHEMA_VERSION) {
    versionFail(`structuredUncertainty.uncertaintySchemaVersion must be ${UNCERTAINTY_SCHEMA_VERSION}`);
  }
  if (!ENGINE_OUTCOME_CODES.includes(uncertainty.originBranch)) {
    fail(`structuredUncertainty.originBranch is not a closed outcome: ${JSON.stringify(uncertainty.originBranch)}`);
  }
  const picked = pickExact(uncertainty, UNCERTAINTY_KEYS, "structuredUncertainty");
  const shaped = {
    ...picked,
    known: closedRows(picked.known, KNOWN_FACT_ROW_KEYS, "structuredUncertainty.known"),
    unknown: closedRows(picked.unknown, UNKNOWN_FACT_ROW_KEYS, "structuredUncertainty.unknown"),
    withheldOutputs: closedRows(
      picked.withheldOutputs,
      WITHHELD_OUTPUT_ROW_KEYS,
      "structuredUncertainty.withheldOutputs",
    ),
    items: closedRows(picked.items, UNCERTAINTY_ITEM_ROW_KEYS, "structuredUncertainty.items"),
    claimBoundaries: closedRows(
      picked.claimBoundaries,
      CLAIM_BOUNDARY_ROW_KEYS,
      "structuredUncertainty.claimBoundaries",
    ),
  };
  assertShaped(shaped, UNCERTAINTY_ROOT_VALUE_SHAPES, "structuredUncertainty");
  shaped.known.forEach((row, index) => {
    assertShaped(row, KNOWN_ROW_VALUE_SHAPES, `structuredUncertainty.known[${index}]`);
  });
  shaped.unknown.forEach((row, index) => {
    assertShaped(row, UNKNOWN_ROW_VALUE_SHAPES, `structuredUncertainty.unknown[${index}]`);
  });
  shaped.withheldOutputs.forEach((row, index) => {
    assertShaped(row, WITHHELD_ROW_VALUE_SHAPES, `structuredUncertainty.withheldOutputs[${index}]`);
  });
  shaped.items.forEach((row, index) => {
    assertShaped(row, UNCERTAINTY_ITEM_ROW_VALUE_SHAPES, `structuredUncertainty.items[${index}]`);
  });
  shaped.claimBoundaries.forEach((row, index) => {
    assertShaped(row, CLAIM_BOUNDARY_ROW_VALUE_SHAPES, `structuredUncertainty.claimBoundaries[${index}]`);
  });
  return shaped;
}

function projectContextItem(item, index) {
  const label = `interpretationContextPack.selectedContextItems[${index}]`;
  requirePlainObject(item, label);
  const allowed = new Set([...CONTEXT_ITEM_BASE_KEYS, ...CONTEXT_ITEM_OPTIONAL_KEYS]);
  const unexpected = Object.keys(item).filter((key) => !allowed.has(key));
  if (unexpected.length > 0) fail(`${label} carries unexpected keys: ${unexpected.join(", ")}`);
  for (const key of CONTEXT_ITEM_BASE_KEYS) {
    if (!Object.hasOwn(item, key)) fail(`${label}.${key} is missing`);
  }
  const relevance = pickExact(
    requirePlainObject(item.relevance, `${label}.relevance`),
    CONTEXT_ITEM_RELEVANCE_KEYS,
    `${label}.relevance`,
  );
  const projected = {};
  for (const key of CONTEXT_ITEM_BASE_KEYS) {
    projected[key] = key === "relevance" ? relevance : copyValue(item[key], `${label}.${key}`);
  }
  // Physical-presence preservation: sourceRef/supersededBy travel only when
  // physically present upstream; absence stays absence.
  for (const key of CONTEXT_ITEM_OPTIONAL_KEYS) {
    if (Object.hasOwn(item, key)) {
      const child = item[key];
      if (child === undefined) fail(`${label}.${key} is undefined`);
      projected[key] = copyValue(child, `${label}.${key}`);
    }
  }
  assertShaped(projected, CONTEXT_ITEM_VALUE_SHAPES, label);
  for (const key of Object.keys(CONTEXT_ITEM_OPTIONAL_VALUE_SHAPES)) {
    if (Object.hasOwn(projected, key)) {
      CONTEXT_ITEM_OPTIONAL_VALUE_SHAPES[key](projected[key], `${label}.${key}`);
    }
  }
  return projected;
}

function projectInterpretationContextPack(pack) {
  requirePlainObject(pack, "interpretationContextPack");
  assertExactKeySet(pack, PACK_KEYS, "interpretationContextPack");
  if (pack.contextPackSchemaVersion !== CONTEXT_PACK_SCHEMA_VERSION) {
    versionFail(`interpretationContextPack.contextPackSchemaVersion must be ${CONTEXT_PACK_SCHEMA_VERSION}`);
  }
  if (!PACK_SCOPE_VERDICTS.includes(pack.packScopeVerdict)) {
    fail(`interpretationContextPack.packScopeVerdict is not lawful: ${JSON.stringify(pack.packScopeVerdict)}`);
  }
  const selectedContextItems = requireArray(
    pack.selectedContextItems,
    "interpretationContextPack.selectedContextItems",
  ).map((item, index) => projectContextItem(item, index));
  const domainChecker = vEnum(CONTEXT_DOMAINS);
  const permittedInterpretationDomains = requireArray(
    pack.permittedInterpretationDomains,
    "interpretationContextPack.permittedInterpretationDomains",
  );
  permittedInterpretationDomains.forEach((domain, index) => {
    domainChecker(domain, `interpretationContextPack.permittedInterpretationDomains[${index}]`);
  });
  const prohibitedExtrapolationMarkers = closedRows(
    pack.prohibitedExtrapolationMarkers,
    EXTRAPOLATION_MARKER_ROW_KEYS,
    "interpretationContextPack.prohibitedExtrapolationMarkers",
  );
  prohibitedExtrapolationMarkers.forEach((row, index) => {
    assertShaped(
      row,
      MARKER_ROW_VALUE_SHAPES,
      `interpretationContextPack.prohibitedExtrapolationMarkers[${index}]`,
    );
  });
  return {
    contextPackSchemaVersion: requireString(pack.contextPackSchemaVersion, "interpretationContextPack.contextPackSchemaVersion"),
    selectedContextItems,
    permittedInterpretationDomains,
    prohibitedExtrapolationMarkers,
    packScopeVerdict: requireString(pack.packScopeVerdict, "interpretationContextPack.packScopeVerdict"),
  };
}

function projectActiveConstraints(rows) {
  return requireArray(rows, "activeConstraints").map((row, index) => {
    const label = `activeConstraints[${index}]`;
    requirePlainObject(row, label);
    assertExactKeySet(row, CONSTRAINT_ROW_KEYS, label);
    const picked = pickExact(row, CONSTRAINT_ROW_KEYS, label);
    assertShaped(picked, CONSTRAINT_ROW_VALUE_SHAPES, label);
    return picked;
  });
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function projectProviderProjection(agentInterpretationRequest) {
  // Fail-closed integrity revalidation before any projected object is created.
  // Freezing alone and caller assertions about the builder are not trusted.
  try {
    validateAgentInterpretationRequestIntegrity(agentInterpretationRequest);
  } catch (error) {
    if (error instanceof AgentInterpretationRequestAssemblyError) {
      throw new ProviderProjectionError({
        failureClass: error.failureClass,
        detail: `agentInterpretationRequest integrity validation failed: ${error.detail ?? error.message}`,
      });
    }
    throw error;
  }

  const request = requirePlainObject(agentInterpretationRequest, "agentInterpretationRequest");

  // Defense-in-depth for direct projection calls: the shared integrity
  // revalidation above already enforces the PRE_CORE empty-context invariant;
  // this explicit check keeps the projection boundary provably fail-closed
  // even if that shared path were to change. No sanitising, no filtering.
  try {
    assertPreCoreEmptyContextInvariant(request.engineSnapshot, request.interpretationContextPack);
    assertSingleR1ContextInvariant(request.engineSnapshot, request.interpretationContextPack);
  } catch (error) {
    if (error instanceof AgentInterpretationRequestAssemblyError) {
      throw new ProviderProjectionError({
        failureClass: error.failureClass,
        detail: `PRE_CORE empty-context invariant violated: ${error.detail ?? error.message}`,
      });
    }
    throw error;
  }

  assertExactKeySet(request, REQUEST_ROOT_KEYS, "agentInterpretationRequest");
  if (request.requestSchemaVersion !== REQUEST_SCHEMA_VERSION) {
    versionFail(`requestSchemaVersion must be ${REQUEST_SCHEMA_VERSION}`);
  }
  if (request.agentContractVersion !== AGENT_CONTRACT_VERSION) {
    versionFail(`agentContractVersion must be ${AGENT_CONTRACT_VERSION}`);
  }
  if (request.outputSchemaVersion !== OUTPUT_SCHEMA_VERSION) {
    versionFail(`outputSchemaVersion must be ${OUTPUT_SCHEMA_VERSION}`);
  }
  if (request.humanReviewOccurred !== false) {
    fail("humanReviewOccurred must remain false");
  }
  if (!PACK_SCOPE_VERDICTS.includes(request.permittedOutputScope)) {
    fail(`permittedOutputScope is not lawful: ${JSON.stringify(request.permittedOutputScope)}`);
  }
  if (!Object.values(FREE_INTERPRETATION_MODE).includes(request.freeInterpretationMode)) {
    fail(`freeInterpretationMode is not lawful: ${JSON.stringify(request.freeInterpretationMode)}`);
  }
  const requestDomainChecker = vEnum(CONTEXT_DOMAINS);
  const permittedInterpretationDomains = requireArray(
    request.permittedInterpretationDomains,
    "permittedInterpretationDomains",
  );
  permittedInterpretationDomains.forEach((domain, index) => {
    requestDomainChecker(domain, `permittedInterpretationDomains[${index}]`);
  });

  const projection = {
    providerProjectionVersion: PROVIDER_PROJECTION_VERSION,
    agentContractVersion: request.agentContractVersion,
    outputSchemaVersion: request.outputSchemaVersion,
    engineSnapshot: projectEngineSnapshot(request.engineSnapshot),
    structuredUncertainty: projectStructuredUncertainty(request.structuredUncertainty),
    interpretationContextPack: projectInterpretationContextPack(request.interpretationContextPack),
    permittedOutputScope: request.permittedOutputScope,
    permittedInterpretationDomains,
    freeInterpretationMode: request.freeInterpretationMode,
    humanReviewOccurred: false,
    activeConstraints: projectActiveConstraints(request.activeConstraints),
  };
  return deepFreeze(projection);
}
