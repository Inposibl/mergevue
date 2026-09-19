/**
 * PURE canonical public-report registry.
 *
 * This is the one MergeVue public-report universe: twelve blocks, canonical
 * order, canonical names, and the accepted availability vocabulary.
 *
 * It must remain free of Environment, ECS, finalDeliverable, economics,
 * friction, and other analytical builders. Legacy report construction and
 * the Level-1 Mode-D projection both reference this registry.
 */

export const MERGEVUE_PUBLIC_REPORT_BLOCKS = Object.freeze([
  "Executive Decision Summary",
  "Structural Watchpoints",
  "Compatibility Score & Deal Scenario",
  "Identified Environment Types",
  "Collision Thesis",
  "Resource Conflict Map",
  "Timeline of Expected Friction",
  "Economic Risk Translation",
  "Recommended Actions",
  "Decision Gap",
  "What the Full Engagement Adds",
  "Audit Footer",
]);

export const MERGEVUE_PUBLIC_REPORT_BLOCK_REGISTRY = Object.freeze([
  Object.freeze({
    number: 1,
    blockId: "executive-decision-summary",
    canonicalName: "Executive Decision Summary",
    modelField: "executiveDecisionSummary",
  }),
  Object.freeze({
    number: 2,
    blockId: "structural-watchpoints",
    canonicalName: "Structural Watchpoints",
    modelField: "sealedPredictions",
  }),
  Object.freeze({
    number: 3,
    blockId: "compatibility-score-and-deal-scenario",
    canonicalName: "Compatibility Score & Deal Scenario",
    modelField: "compatibilityScoreAndDealScenario",
  }),
  Object.freeze({
    number: 4,
    blockId: "identified-environment-types",
    canonicalName: "Identified Environment Types",
    modelField: "theTwoEnvironments",
  }),
  Object.freeze({
    number: 5,
    blockId: "collision-thesis",
    canonicalName: "Collision Thesis",
    modelField: "collisionThesis",
  }),
  Object.freeze({
    number: 6,
    blockId: "resource-conflict-map",
    canonicalName: "Resource Conflict Map",
    modelField: "resourceConflictMap",
  }),
  Object.freeze({
    number: 7,
    blockId: "timeline-of-expected-friction",
    canonicalName: "Timeline of Expected Friction",
    modelField: "timelineOfExpectedFriction",
  }),
  Object.freeze({
    number: 8,
    blockId: "economic-risk-translation",
    canonicalName: "Economic Risk Translation",
    modelField: "economicRiskTranslation",
  }),
  Object.freeze({
    number: 9,
    blockId: "recommended-actions",
    canonicalName: "Recommended Actions",
    modelField: "recommendedActions",
  }),
  Object.freeze({
    number: 10,
    blockId: "decision-gap",
    canonicalName: "Decision Gap",
    modelField: "evidenceBasisAndLimits",
  }),
  Object.freeze({
    number: 11,
    blockId: "what-the-full-engagement-adds",
    canonicalName: "What the Full Engagement Adds",
    modelField: "whatTheFullEngagementAdds",
  }),
  Object.freeze({
    number: 12,
    blockId: "audit-footer",
    canonicalName: "Audit Footer",
    modelField: "auditFooter",
  }),
]);

export const MERGEVUE_PUBLIC_REPORT_AVAILABILITY_STATES = Object.freeze([
  "AVAILABLE",
  "LIMITED",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "NOT_APPLICABLE",
]);

export const MERGEVUE_PUBLIC_REPORT_EVIDENCE_CHANNELS = Object.freeze([
  "PUBLIC_REFRESH",
  "INTERNAL_OBSERVATION",
  "PRIVATE_DOCUMENT",
  "DEAL_ECONOMICS",
  "INDIVIDUAL_DATA",
  "HUMAN_REVIEW",
  "NOT_CURRENTLY_RESOLVABLE",
]);

export const MERGEVUE_PUBLIC_REPORT_SOURCE_MODE_LEVEL1_MODE_D_SLICE1 = "LEVEL1_MODE_D_SLICE1";
export const MERGEVUE_CANONICAL_PUBLIC_REPORT_SCHEMA_VERSION = "mergevue-canonical-public-report-v1";
export const MERGEVUE_CANONICAL_PUBLIC_REPORT_VERSION = "mergevue-canonical-public-report-level1-mode-d-slice1-v1";
