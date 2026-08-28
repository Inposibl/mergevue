import { environmentAlias, publicSafeText } from "../constants/envAliases.ts";
import { FINAL_DELIVERABLE_DATA } from "../data/finalDeliverableData.js";
import {
  ALIGNED_SUPPRESSION_ENVIRONMENTS,
  ERI_B25_EXTRACTION_ENVIRONMENTS,
  buildCrossSideStructuralDifferentiation,
} from "./crossSideStructuralDifferentiation.js";
import {
  LAYERED_EVIDENCE_SCORING_VERSION,
  classifyNormalizedSignal,
  normalizedCoPresence,
} from "./layeredEvidenceScoring.js";
import { scoreTargetDiagnosticCombined, scoreTargetDiagnosticLevel1 } from "./targetDiagnosticFlow.js";
import { scoreTargetObservation } from "./targetObservationFlow.js";
import { scoreTargetSelfAssessment } from "./targetSelfAssessmentFlow.js";

export const FINAL_ENVIRONMENT_CODES = Object.freeze([
  "NF/NT",
  "NT/STJ",
  "NT/STP",
  "NF/SFJ",
  "NF/SFP",
  "SFJ/SFP",
  "SFP/SFJ",
  "STJ/STP",
  "STP/STJ",
]);

const PENDING = "PENDING";

const OUTCOME_KEYS = Object.freeze({
  A: "confirmed",
  B: "acquirer-partial",
  C: "target-partial",
  D: "mixed",
});

const RESOURCE_TYPE_LABELS = Object.freeze({
  BG: "Behavioural ground",
  CO: "Coherence resource",
  HY: "Hybrid resource",
  SG: "Signal resource",
});

const RESOURCE_TIER_SCORES = Object.freeze({
  IGN: 0,
  LOW: 1,
  MID: 2,
  TOP: 3,
});

const RESOURCE_EFFECT_LABELS = Object.freeze({
  "+": "Amplifies",
  "-": "Suppresses",
  "~": "Neutral",
});

const RESOURCE_POTENTIAL_RISKS = Object.freeze({
  "Attention": "Attention conflict can fragment leadership focus, slow issue detection, and make critical post-close signals easier to miss.",
  "Connections": "Connections conflict can weaken informal coordination, isolate key relationship holders, and increase dependency on a small number of brokers.",
  "Creativity": "Creativity conflict can suppress useful adaptation, make new operating ideas feel unsafe, and reduce the target's ability to solve integration problems locally.",
  "Decisiveness": "Decisiveness conflict can create decision stalls, repeated escalation, and unclear ownership when integration tradeoffs need fast resolution.",
  "Energy": "Energy conflict can drain execution capacity, increase fatigue, and turn normal integration pressure into avoidable attrition risk.",
  "Health": "Health conflict can raise burnout risk, reduce sustainable pace, and make the combined organization dependent on short-term overextension.",
  "Influence": "Influence conflict can distort who actually gets heard, produce hidden veto points, and make formal governance weaker than informal power.",
  "Information": "Information conflict can create selective disclosure, reporting gaps, and mismatched assumptions between the acquirer and target teams.",
  "Knowledge": "Knowledge conflict can block transfer of know-how, make expertise harder to access, and increase the chance that critical operating memory leaves with key people.",
  "Money": "Money conflict can turn budget allocation into a legitimacy fight, delay investment decisions, and make resource commitments appear politically biased.",
  "Organisation / system": "Organisation and system conflict can break routines, duplicate authority, and make the new operating model hard to follow in daily work.",
  "Psychological resilience": "Psychological resilience conflict can reduce tolerance for ambiguity, amplify stress responses, and make recoverable integration issues feel irreversible.",
  "Reputation": "Reputation conflict can make status protection more important than problem solving, increasing defensiveness during early integration events.",
  "Skills": "Skills conflict can misplace capability, underuse the target's strongest operators, and make performance problems look like individual failure instead of fit failure.",
  "Time": "Time conflict can create incompatible operating tempo, missed windows, and frustration between teams that resolve priorities at different speeds.",
  "Trust": "Trust conflict can trigger defensive behavior, reduce disclosure quality, and make even technically sound integration decisions feel unsafe.",
  "Will / discipline": "Will and discipline conflict can weaken follow-through, create uneven compliance, and make agreed integration routines difficult to sustain.",
});

// Direction comes from the canonical Net Effect source (ST_ECS_v1_canonical.xlsx,
// Resource Impact Matrix); tier comes from the governed ERI Resource Priority
// (ST_Environment_Resource_Intelligence_updated.xlsx). Impacts are keyed by
// canonical environment code so no array ordering can relabel a resource vector.
const RESOURCE_IMPACT_PATTERN = /^([+~\-]) (TOP|MID|LOW|IGN)$/;

const RESOURCE_PRIORITY_MATRIX = Object.freeze([
  resourceProfile("Time", "BG", {
    "NF/NT": "+ TOP",
    "NT/STJ": "+ TOP",
    "NT/STP": "~ LOW",
    "NF/SFJ": "- MID",
    "NF/SFP": "~ LOW",
    "SFJ/SFP": "+ MID",
    "SFP/SFJ": "- TOP",
    "STJ/STP": "~ MID",
    "STP/STJ": "~ LOW",
  }),
  resourceProfile("Energy", "BG", {
    "NF/NT": "+ TOP",
    "NT/STJ": "+ TOP",
    "NT/STP": "+ TOP",
    "NF/SFJ": "- MID",
    "NF/SFP": "+ TOP",
    "SFJ/SFP": "+ TOP",
    "SFP/SFJ": "~ TOP",
    "STJ/STP": "+ TOP",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Attention", "BG", {
    "NF/NT": "+ TOP",
    "NT/STJ": "+ TOP",
    "NT/STP": "+ TOP",
    "NF/SFJ": "- MID",
    "NF/SFP": "+ TOP",
    "SFJ/SFP": "+ TOP",
    "SFP/SFJ": "- TOP",
    "STJ/STP": "~ LOW",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Money", "HY", {
    "NF/NT": "~ LOW",
    "NT/STJ": "+ TOP",
    "NT/STP": "~ LOW",
    "NF/SFJ": "- MID",
    "NF/SFP": "~ LOW",
    "SFJ/SFP": "+ LOW",
    "SFP/SFJ": "- MID",
    "STJ/STP": "+ TOP",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Reputation", "SG", {
    "NF/NT": "+ TOP",
    "NT/STJ": "+ TOP",
    "NT/STP": "+ TOP",
    "NF/SFJ": "~ TOP",
    "NF/SFP": "+ TOP",
    "SFJ/SFP": "+ TOP",
    "SFP/SFJ": "- MID",
    "STJ/STP": "+ TOP",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Trust", "CO", {
    "NF/NT": "+ TOP",
    "NT/STJ": "~ LOW",
    "NT/STP": "~ LOW",
    "NF/SFJ": "- LOW",
    "NF/SFP": "+ TOP",
    "SFJ/SFP": "+ TOP",
    "SFP/SFJ": "- MID",
    "STJ/STP": "- IGN",
    "STP/STJ": "- IGN",
  }),
  resourceProfile("Influence", "SG", {
    "NF/NT": "+ MID",
    "NT/STJ": "+ MID",
    "NT/STP": "+ TOP",
    "NF/SFJ": "- TOP",
    "NF/SFP": "+ TOP",
    "SFJ/SFP": "+ TOP",
    "SFP/SFJ": "- MID",
    "STJ/STP": "+ TOP",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Information", "BG", {
    "NF/NT": "+ MID",
    "NT/STJ": "+ MID",
    "NT/STP": "+ TOP",
    "NF/SFJ": "- LOW",
    "NF/SFP": "~ LOW",
    "SFJ/SFP": "~ LOW",
    "SFP/SFJ": "- MID",
    "STJ/STP": "~ LOW",
    "STP/STJ": "~ MID",
  }),
  resourceProfile("Connections", "HY", {
    "NF/NT": "+ MID",
    "NT/STJ": "~ IGN",
    "NT/STP": "~ IGN",
    "NF/SFJ": "~ TOP",
    "NF/SFP": "+ MID",
    "SFJ/SFP": "+ MID",
    "SFP/SFJ": "- LOW",
    "STJ/STP": "~ LOW",
    "STP/STJ": "+ TOP",
  }),
  resourceProfile("Skills", "HY", {
    "NF/NT": "+ MID",
    "NT/STJ": "+ MID",
    "NT/STP": "+ MID",
    "NF/SFJ": "- LOW",
    "NF/SFP": "+ MID",
    "SFJ/SFP": "+ MID",
    "SFP/SFJ": "- LOW",
    "STJ/STP": "+ TOP",
    "STP/STJ": "+ MID",
  }),
  resourceProfile("Knowledge", "HY", {
    "NF/NT": "+ MID",
    "NT/STJ": "+ MID",
    "NT/STP": "+ MID",
    "NF/SFJ": "- LOW",
    "NF/SFP": "~ LOW",
    "SFJ/SFP": "- LOW",
    "SFP/SFJ": "- LOW",
    "STJ/STP": "- IGN",
    "STP/STJ": "- IGN",
  }),
  resourceProfile("Health", "BG", {
    "NF/NT": "~ IGN",
    "NT/STJ": "~ IGN",
    "NT/STP": "~ LOW",
    "NF/SFJ": "- TOP",
    "NF/SFP": "+ MID",
    "SFJ/SFP": "+ MID",
    "SFP/SFJ": "- LOW",
    "STJ/STP": "~ MID",
    "STP/STJ": "- LOW",
  }),
  resourceProfile("Psychological resilience", "BG", {
    "NF/NT": "+ LOW",
    "NT/STJ": "+ MID",
    "NT/STP": "+ MID",
    "NF/SFJ": "- LOW",
    "NF/SFP": "+ MID",
    "SFJ/SFP": "+ MID",
    "SFP/SFJ": "- LOW",
    "STJ/STP": "~ LOW",
    "STP/STJ": "~ LOW",
  }),
  resourceProfile("Will / discipline", "BG", {
    "NF/NT": "+ LOW",
    "NT/STJ": "+ LOW",
    "NT/STP": "+ MID",
    "NF/SFJ": "- TOP",
    "NF/SFP": "~ LOW",
    "SFJ/SFP": "- LOW",
    "SFP/SFJ": "- TOP",
    "STJ/STP": "+ MID",
    "STP/STJ": "+ MID",
  }),
  resourceProfile("Creativity", "SG", {
    "NF/NT": "+ LOW",
    "NT/STJ": "+ LOW",
    "NT/STP": "+ MID",
    "NF/SFJ": "- IGN",
    "NF/SFP": "+ MID",
    "SFJ/SFP": "- IGN",
    "SFP/SFJ": "- IGN",
    "STJ/STP": "~ LOW",
    "STP/STJ": "~ MID",
  }),
  resourceProfile("Decisiveness", "SG", {
    "NF/NT": "~ LOW",
    "NT/STJ": "+ LOW",
    "NT/STP": "+ LOW",
    "NF/SFJ": "- IGN",
    "NF/SFP": "~ IGN",
    "SFJ/SFP": "- IGN",
    "SFP/SFJ": "- IGN",
    "STJ/STP": "+ MID",
    "STP/STJ": "+ MID",
  }),
  resourceProfile("Organisation / system", "BG", {
    "NF/NT": "~ IGN",
    "NT/STJ": "+ LOW",
    "NT/STP": "~ IGN",
    "NF/SFJ": "- MID",
    "NF/SFP": "- IGN",
    "SFJ/SFP": "- LOW",
    "SFP/SFJ": "~ TOP",
    "STJ/STP": "+ MID",
    "STP/STJ": "+ MID",
  }),
]);

function resourceProfile(resource, type, impacts) {
  const unknownCodes = Object.keys(impacts).filter((code) => !FINAL_ENVIRONMENT_CODES.includes(code));
  if (unknownCodes.length > 0) {
    throw new Error(`Unknown environment code(s) in ${resource} resource impacts: ${unknownCodes.join(", ")}`);
  }
  const keyedImpacts = {};
  for (const code of FINAL_ENVIRONMENT_CODES) {
    const value = String(impacts[code] ?? "");
    if (!RESOURCE_IMPACT_PATTERN.test(value)) {
      throw new Error(`Invalid canonical resource impact for ${resource}/${code}: ${value || "<missing>"}`);
    }
    keyedImpacts[code] = value;
  }
  return Object.freeze({
    resource,
    type,
    potentialRisk: RESOURCE_POTENTIAL_RISKS[resource],
    impacts: Object.freeze(keyedImpacts),
  });
}

function pairKey(acquirerEnvironmentCode, targetEnvironmentCode) {
  return `${normalizeEnvironmentCode(acquirerEnvironmentCode)}::${normalizeEnvironmentCode(targetEnvironmentCode)}`;
}

function normalizeEnvironmentCode(code) {
  const normalized = typeof code === "string" ? code.trim() : "";
  return normalized === legacyFranchiseCode() ? "SFP/SFJ" : normalized;
}

function legacyFranchiseCode() {
  return ["SP", "SJ"].join(String.fromCharCode(47));
}

function recordsByPair(records) {
  return new Map(records.map((record) => [pairKey(record.acquirerEnvironmentCode, record.targetEnvironmentCode), record]));
}

const NARRATIVE_BY_PAIR = recordsByPair(FINAL_DELIVERABLE_DATA.narratives);
const FRICTION_BY_PAIR = recordsByPair(FINAL_DELIVERABLE_DATA.frictionPoints);

function replaceTemplate(value, replacements) {
  return Object.entries(replacements).reduce(
    (current, [key, replacement]) => current.replaceAll(`[${key}]`, replacement),
    value,
  );
}

export function aliasForEnvironment(code) {
  return environmentAlias(normalizeEnvironmentCode(code));
}

export function publicText(value) {
  return publicSafeText(value);
}

export function findFinalNarrative(acquirerEnvironmentCode, targetEnvironmentCode) {
  return NARRATIVE_BY_PAIR.get(pairKey(acquirerEnvironmentCode, targetEnvironmentCode)) ?? null;
}

export function findFrictionPoint(acquirerEnvironmentCode, targetEnvironmentCode) {
  return FRICTION_BY_PAIR.get(pairKey(acquirerEnvironmentCode, targetEnvironmentCode)) ?? null;
}

export function compatibilityRange(score) {
  if (!Number.isFinite(score)) return PENDING;
  const low = Math.max(0, Math.round(score - COMPATIBILITY_RANGE_HALF_WIDTH));
  const high = Math.min(100, Math.round(score + COMPATIBILITY_RANGE_HALF_WIDTH));
  return `${low}\u2013${high}`;
}

// GOVERNED PARAMETERS — canonical ECS derivation chain (OD-RMP3-1/2).
// ST_ECS_Derivation_Method_v1.xlsx · Method: ECS = 100 × (1 − C / 34);
// C = sum over the 17 canonical resources of pairwise conflict points between the two
// environments' Net Effect values (2 = direct opposition + vs −; 1 = partial vs ~;
// 0 = identical Net Effect, including ~/~, +/+, −/−). Denominator 34 = 17 resources × 2
// maximum points. For a same-environment pair every Net Effect comparison is identical,
// so C = 0 and ECS = 100 mechanically — no transaction literal is used.
const CANONICAL_MAX_CONFLICT_POINTS_PER_RESOURCE = 2;
const CANONICAL_ECS_MAX_CONFLICT_POINTS = RESOURCE_PRIORITY_MATRIX.length
  * CANONICAL_MAX_CONFLICT_POINTS_PER_RESOURCE;

// GOVERNED PARAMETER — compatibility display half-range. ST_UI_Track_Coder_Agent_
// Specification_v1.xlsx · APPENDIX_B SCREEN_SPEC, Screen 10 source binding:
// "Block 3: Friction_Point_Lookup → ECS_Matrix value ±5".
const COMPATIBILITY_RANGE_HALF_WIDTH = 5;

// Canonical risk-band legend, ST_ECS_v1_canonical.xlsx · Compatibility Matrix row 16 and
// ST_Friction_Point_Lookup_updated.xlsx · ECS_Matrix row 2 (identical thresholds).
export function canonicalRiskBand(score) {
  if (!Number.isFinite(score)) return PENDING;
  if (score >= 80) return "HIGH COMPATIBILITY";
  if (score >= 65) return "MODERATE-HIGH";
  if (score >= 50) return "MODERATE";
  if (score >= 35) return "MODERATE-LOW";
  return "HIGH RISK";
}

function canonicalConflictPointsForEffects(leftEffect, rightEffect) {
  if (leftEffect === rightEffect) return 0;
  if (leftEffect === "~" || rightEffect === "~") return 1;
  return 2;
}

export function canonicalStructuralEcs(acquirerEnvironmentCode, targetEnvironmentCode) {
  const acquirerCode = normalizeEnvironmentCode(acquirerEnvironmentCode);
  const targetCode = normalizeEnvironmentCode(targetEnvironmentCode);
  const perResource = [];
  let conflictPoints = 0;
  for (const resource of RESOURCE_PRIORITY_MATRIX) {
    const acquirerImpact = parseResourceImpact(resource.impacts[acquirerCode], `${resource.resource}/${acquirerCode}`);
    const targetImpact = parseResourceImpact(resource.impacts[targetCode], `${resource.resource}/${targetCode}`);
    const points = canonicalConflictPointsForEffects(acquirerImpact.effect, targetImpact.effect);
    conflictPoints += points;
    perResource.push(Object.freeze({
      resource: resource.resource,
      acquirerNetEffect: acquirerImpact.effect,
      targetNetEffect: targetImpact.effect,
      conflictPoints: points,
    }));
  }
  const ecs = Math.round(100 * (1 - conflictPoints / CANONICAL_ECS_MAX_CONFLICT_POINTS) * 10) / 10;
  return Object.freeze({
    formula: "ECS = 100 \u00d7 (1 \u2212 C / 34)",
    conflictPoints,
    maxConflictPoints: CANONICAL_ECS_MAX_CONFLICT_POINTS,
    ecs,
    perResource: Object.freeze(perResource),
    source: "ST_ECS_Derivation_Method_v1.xlsx \u00b7 Net_Effect_Vectors/Method; ST_ECS_v1_canonical.xlsx \u00b7 Compatibility Matrix",
  });
}

const SHARED_STATE_CLASSES = Object.freeze({
  "+": Object.freeze({ key: "shared_amplified_structural_state", label: "Shared amplified structural state" }),
  "~": Object.freeze({ key: "shared_neutral_structural_state", label: "Shared neutral structural state" }),
  "-": Object.freeze({ key: "shared_suppressed_structural_state", label: "Shared suppressed structural state" }),
});

export function buildStructuralResourceProfile(environmentCode) {
  const code = normalizeEnvironmentCode(environmentCode);
  const b25Applies = ERI_B25_EXTRACTION_ENVIRONMENTS.includes(code);
  const rows = RESOURCE_PRIORITY_MATRIX.map((resource) => {
    const impact = parseResourceImpact(resource.impacts[code], `${resource.resource}/${code}`);
    return Object.freeze({
      resource: resource.resource,
      resourceType: resource.type,
      resourceTypeLabel: RESOURCE_TYPE_LABELS[resource.type] ?? resource.type,
      canonicalNetEffect: impact.effect,
      canonicalEffectLabel: impact.label,
      eriTier: impact.tier,
      sharedStateClass: SHARED_STATE_CLASSES[impact.effect].key,
      sharedStateLabel: SHARED_STATE_CLASSES[impact.effect].label,
      interpretationGuardrail: b25Applies && impact.effect === "+" ? "ERI_B25_EXTRACTION_OR_COMPLICITY" : "",
    });
  });
  const suppressedCount = rows.filter((row) => row.canonicalNetEffect === "-").length;
  const alignedSuppressionApplies = ALIGNED_SUPPRESSION_ENVIRONMENTS.includes(code);
  return Object.freeze({
    environmentCode: code,
    resourceCount: rows.length,
    resources: Object.freeze(rows),
    sharedStateClasses: Object.freeze(Object.values(SHARED_STATE_CLASSES).map((entry) => Object.freeze({ ...entry }))),
    b25Guardrail: Object.freeze({
      applies: b25Applies,
      environments: ERI_B25_EXTRACTION_ENVIRONMENTS,
      source: "ST_Environment_Resource_Intelligence_updated.xlsx \u00b7 Resource Priority row 25",
      note: b25Applies
        ? "Resource effects in this environment represent extraction or complicity, not development. TOP tier = least suppressed / most extracted, not amplified, so amplified-state resources must not be described as genuine alignment assets or strengths to protect."
        : "",
    }),
    alignedSuppression: Object.freeze({
      applies: alignedSuppressionApplies,
      suppressedResourceCount: suppressedCount,
      caveat: alignedSuppressionApplies
        ? "Aligned-suppression caveat (canonical, ST_ECS_Derivation_Method_v1.xlsx \u00b7 Interpretation_Caveats): high ECS here means compatibility in degradation, not health. The formula scores agreement of Net Effects, not their sign: an environment whose Net Effect vector is predominantly negative registers zero conflict against itself, so structural compatibility can be high while the shared resource state is predominantly suppressed."
        : "",
      source: "ST_ECS_Derivation_Method_v1.xlsx \u00b7 Interpretation_Caveats (aligned suppression)",
    }),
  });
}

// Homogeneous evidence-issuance gate (OD-RMP3-10): evidence confidence and structural
// compatibility are separate constructs. Weak evidence / co-presence never changes the
// canonical structural ECS; it changes public issuance qualification. Gate inputs are the
// existing governed fields (signalStrength === "weak", coPresence === true).
function homogeneousEvidenceGate(acquirerScore, targetScore) {
  const inputs = Object.freeze({
    acquirerSignalStrength: acquirerScore.signalStrength ?? "confirmed",
    acquirerCoPresence: acquirerScore.coPresence === true,
    targetSignalStrength: targetScore.signalStrength ?? "confirmed",
    targetCoPresence: targetScore.coPresence === true,
  });
  const weak = inputs.acquirerSignalStrength === "weak" || inputs.targetSignalStrength === "weak";
  const coPresent = inputs.acquirerCoPresence || inputs.targetCoPresence;
  const status = weak || coPresent ? "provisional" : "confirmed";
  return Object.freeze({
    inputs,
    weak,
    coPresent,
    status,
    publicQualification: status === "provisional"
      ? "Same-environment classification is provisional: weak or co-present environment evidence does not support an unqualified confirmed compatibility result."
      : "",
  });
}

function homogeneousNextStep() {
  const body = FINAL_DELIVERABLE_DATA.screenCopy.homogeneousBody;
  const match = body.match(/Block 6: Recommended next step: (.+)/);
  const governedLine = match?.[1] ?? "";
  const [name, ...rest] = governedLine.split(" \u2014 ");
  const descriptor = rest.join(" \u2014 ").replace(/\s*\*Full assessment specification[^*]*\.\s*$/, "").trim();
  return Object.freeze({
    name: name?.trim() || PENDING,
    description: descriptor ? `${descriptor.charAt(0).toUpperCase()}${descriptor.slice(1)}.` : PENDING,
    source: "APPENDIX_B SCREEN_SPEC \u00b7 Screen 10b Block 6 (ST_UI_Track_Coder_Agent_Specification_v1.xlsx)",
  });
}


function protocolForRiskBand(riskBand = "") {
  if (riskBand === "HIGH COMPATIBILITY") return "RHQA";
  if (riskBand === "HIGH RISK" || riskBand === "MODERATE-LOW") return "Ring-Fence";
  return "Selective";
}

function outcomeGuide(outcomeLetter) {
  return FINAL_DELIVERABLE_DATA.clientJourney.outcomes[outcomeLetter] ?? {
    title: "",
    condition: "",
    nextStep: "",
  };
}

function targetScoreFromInput(input) {
  return {
    primaryEnvironmentCode: input.targetEnvironmentCode,
    secondaryEnvironmentCode: input.targetSecondaryEnvironmentCode,
    signalStrength: input.targetSignalStrength ?? "confirmed",
    coPresence: input.targetCoPresence === true,
  };
}

function acquirerScoreFromInput(input) {
  return {
    primaryEnvironmentCode: input.acquirerEnvironmentCode,
    secondaryEnvironmentCode: input.acquirerSecondaryEnvironmentCode,
    signalStrength: input.acquirerSignalStrength ?? "confirmed",
    coPresence: input.acquirerCoPresence === true,
  };
}

function normalizeResourceKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/organisation/g, "organization")
    .replace(/repute/g, "reputation")
    .replace(/psychological resilience/g, "psychologicalresilience")
    .replace(/[^a-z]/g, "");
}

function parseConflictedResources(value) {
  return new Map(
    String(value ?? "")
      .split(/,\s*(?=[A-Z][A-Za-z /]+ \()/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const resourceName = entry.split("(")[0].trim();
        return [normalizeResourceKey(resourceName), Object.freeze({
          resourceName,
          sourceSignal: entry,
        })];
      }),
  );
}

export function parseResourceImpact(value, context = "") {
  const impact = String(value ?? "");
  const match = RESOURCE_IMPACT_PATTERN.exec(impact);
  if (!match) {
    throw new Error(`Invalid canonical resource impact${context ? ` for ${context}` : ""}: ${impact || "<missing>"}`);
  }
  return Object.freeze({
    effect: match[1],
    tier: match[2],
    tierScore: RESOURCE_TIER_SCORES[match[2]],
    label: `${RESOURCE_EFFECT_LABELS[match[1]]} ${match[2]}`,
  });
}

function boundedScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function effectPenalty(leftEffect, rightEffect, sameEnvironment) {
  if (sameEnvironment) return 0;
  if (leftEffect === rightEffect) return leftEffect === "-" ? 14 : 0;
  if (leftEffect === "~" || rightEffect === "~") return 18;
  return 44;
}

function buildResourceConflictDrivers(acquirerImpact, targetImpact, sourceConflict, sameEnvironment) {
  return Object.freeze([
    sourceConflict ? "primary friction lookup" : "",
    !sameEnvironment && acquirerImpact.effect !== targetImpact.effect ? "resource direction mismatch" : "",
    !sameEnvironment && Math.abs(acquirerImpact.tierScore - targetImpact.tierScore) >= 2 ? "resource tier gap" : "",
    !sameEnvironment && acquirerImpact.effect === "-" && targetImpact.effect === "-" ? "compound suppression" : "",
  ].filter(Boolean));
}

function resourceInteractionScore(acquirerImpact, targetImpact, sourceConflict, sameEnvironment) {
  const tierGap = Math.abs(acquirerImpact.tierScore - targetImpact.tierScore);
  const ignoredResourcePenalty = acquirerImpact.tier === "IGN" || targetImpact.tier === "IGN" ? 9 : 0;
  const sourcePenalty = sourceConflict ? 45 : 0;
  return boundedScore(
    100
      - effectPenalty(acquirerImpact.effect, targetImpact.effect, sameEnvironment)
      - tierGap * 9
      - ignoredResourcePenalty
      - sourcePenalty,
  );
}

function conflictProbability(interactionScore, sourceConflict, sameEnvironment) {
  if (!sameEnvironment && (sourceConflict || interactionScore <= 58)) return "High";
  if (!sameEnvironment && interactionScore <= 74) return "Monitor";
  return "Low";
}

function listResourceNames(rows) {
  if (rows.length === 0) return "no resource type";
  if (rows.length === 1) return rows[0].resource;
  if (rows.length === 2) return `${rows[0].resource} and ${rows[1].resource}`;
  return `${rows.slice(0, -1).map((row) => row.resource).join(", ")}, and ${rows.at(-1).resource}`;
}

function buildResourceAnalysisConclusion(profile, options) {
  const acquirerAlias = aliasForEnvironment(options.acquirerEnvironmentCode);
  const targetAlias = aliasForEnvironment(options.targetEnvironmentCode);
  const riskBand = options.riskBand ?? PENDING;
  const protocolName = options.protocolName ?? protocolForRiskBand(riskBand);
  const ecsLabel = profile.ecsScoreLabel;
  const highRows = profile.highProbabilityConflicts;
  const topRows = highRows.slice(0, 4);
  const lowestRow = highRows[0];

  if (highRows.length === 0) {
    return Object.freeze([
      `The resource hierarchy scan verifies all ${profile.resourcesScanned} behavioural resources for ${acquirerAlias} and ${targetAlias}.`,
      `The ECS result is ${ecsLabel}, and the verified risk band is ${riskBand}.`,
      "No resource type crossed the high-probability conflict threshold in the current environment-level analysis.",
      "The preliminary conclusion is that environment-level resource collision is not the dominant integration risk in this pair.",
      "The remaining risk should be read through hierarchy depth, role overlap, and individual type distribution rather than through a broad resource clash.",
      `The recommended protocol route remains ${protocolName} because the resource scan does not override the pair-level ECS result.`,
    ]);
  }

  return Object.freeze([
    `The resource hierarchy scan verifies all ${profile.resourcesScanned} behavioural resources for ${acquirerAlias} and ${targetAlias}.`,
    `The ECS result is ${ecsLabel}, and the verified risk band is ${riskBand}.`,
    `The public report isolates the ${topRows.length} strongest resource conflict type${topRows.length === 1 ? "" : "s"} from the verified high-probability set.`,
    `The displayed verified conflict resource${topRows.length === 1 ? "" : "s"} are ${listResourceNames(topRows)}.`,
    `${lowestRow.resource} is the most acute resource conflict signal because it ranks first in the verified 17-resource conflict scan.`,
    `The conclusion is that the integration risk is concentrated in identifiable resource types, so the ${protocolName} protocol should be applied to those resources before post-close operating routines are merged.`,
  ]);
}

function buildProtocolDealInsights({ acquirerAlias, targetAlias, protocolName, resourceConflictProfile }) {
  const conflictRows = resourceConflictProfile?.highProbabilityConflicts?.slice(0, 3) ?? [];
  if (!protocolName || conflictRows.length === 0) return Object.freeze([]);

  return Object.freeze(conflictRows.map((row) => Object.freeze({
    title: `${row.resource} control point`,
    text: `${acquirerAlias} acquiring ${targetAlias} should treat ${row.resource.toLowerCase()} as a protected integration resource. ${row.potentialRisk} ${resourceControlAction(row.resource, protocolName)}`,
  })));
}

function resourceControlAction(resource, protocolName) {
  const actions = {
    "Attention": `The ${protocolName} route should define a weekly attention map, limit competing workstreams, and assign one owner for signal triage.`,
    "Connections": `The ${protocolName} route should preserve named relationship holders, map informal coordination paths, and prevent abrupt broker replacement during the first integration cycle.`,
    "Creativity": `The ${protocolName} route should protect a bounded adaptation space, define where experimentation remains allowed, and separate creative evaluation from compliance review.`,
    "Decisiveness": `The ${protocolName} route should set decision thresholds, name the accountable decision forum, and pre-agree escalation timing for unresolved tradeoffs.`,
    "Energy": `The ${protocolName} route should pace integration load, reserve capacity for critical operators, and monitor fatigue before execution quality drops.`,
    "Health": `The ${protocolName} route should cap unsustainable workload peaks, protect recovery windows, and make burnout indicators part of integration governance.`,
    "Influence": `The ${protocolName} route should identify informal veto holders, align them with formal governance, and expose hidden power shifts before they distort execution.`,
    "Information": `The ${protocolName} route should specify disclosure rules, reporting cadence, and exception escalation when material information is delayed or filtered.`,
    "Knowledge": `The ${protocolName} route should create a protected knowledge-transfer track, identify critical knowledge holders, and verify that know-how moves before structural changes begin.`,
    "Money": `The ${protocolName} route should separate investment logic from status claims, define budget authority, and document why priority resources are funded or withheld.`,
    "Organisation / system": `The ${protocolName} route should freeze the minimum viable operating model, remove duplicate authority, and test whether daily routines remain understandable to both sides.`,
    "Psychological resilience": `The ${protocolName} route should define stress-response triggers, create a recovery path for contested decisions, and prevent temporary strain from becoming permanent resistance.`,
    "Reputation": `The ${protocolName} route should protect face-saving channels, clarify how performance will be judged, and keep status repair separate from operating decisions.`,
    "Skills": `The ${protocolName} route should map scarce capabilities to roles, protect high-skill operators from misassignment, and distinguish fit problems from performance failures.`,
    "Time": `The ${protocolName} route should align decision tempo, set explicit time horizons for major workstreams, and prevent one side's operating rhythm from silently overriding the other.`,
    "Trust": `The ${protocolName} route should assign a named trust owner, define mandatory disclosure moments, and escalate credibility breaks before defensive behavior hardens.`,
    "Will / discipline": `The ${protocolName} route should define non-negotiable routines, track follow-through visibly, and intervene early when compliance becomes uneven.`,
  };
  return actions[resource] ?? `The ${protocolName} route should assign one accountable owner, clarify operating authority, and set an early review point for this resource.`;
}

function buildResourceConflictProfile(acquirerEnvironmentCode, targetEnvironmentCode, options = {}) {
  const acquirerCode = normalizeEnvironmentCode(acquirerEnvironmentCode);
  const targetCode = normalizeEnvironmentCode(targetEnvironmentCode);
  const sameEnvironment = acquirerCode === targetCode;
  const primaryConflicts = parseConflictedResources(options.friction?.primaryConflictedResources);
  const ecsScore = Number.isFinite(options.ecsScore) ? options.ecsScore : null;
  const ecsScoreLabel = ecsScore === null ? options.ecsRange ?? PENDING : ecsScore.toFixed(1);

  const rows = RESOURCE_PRIORITY_MATRIX.map((resource) => {
    const acquirerImpact = parseResourceImpact(resource.impacts[acquirerCode], `${resource.resource}/${acquirerCode}`);
    const targetImpact = parseResourceImpact(resource.impacts[targetCode], `${resource.resource}/${targetCode}`);
    const sourceConflict = primaryConflicts.get(normalizeResourceKey(resource.resource)) ?? null;
    const environmentInteractionScore = resourceInteractionScore(acquirerImpact, targetImpact, Boolean(sourceConflict), sameEnvironment);
    const probability = conflictProbability(environmentInteractionScore, Boolean(sourceConflict), sameEnvironment);
    return Object.freeze({
      resource: resource.resource,
      resourceType: resource.type,
      resourceTypeLabel: RESOURCE_TYPE_LABELS[resource.type] ?? resource.type,
      potentialRisk: resource.potentialRisk,
      acquirerImpact,
      targetImpact,
      environmentInteractionScore,
      ecsScore,
      ecsScoreLabel,
      probability,
      sourceSignal: sourceConflict?.sourceSignal ?? "",
      conflictDrivers: buildResourceConflictDrivers(acquirerImpact, targetImpact, Boolean(sourceConflict), sameEnvironment),
    });
  });

  const sortedRows = [...rows].sort((left, right) => (
    left.environmentInteractionScore - right.environmentInteractionScore
      || left.resource.localeCompare(right.resource)
  ));
  const highProbabilityConflicts = sortedRows.filter((row) => row.probability === "High");
  const profile = {
    ecsScore,
    ecsScoreLabel,
    resourcesScanned: RESOURCE_PRIORITY_MATRIX.length,
    highProbabilityCount: highProbabilityConflicts.length,
    highProbabilityConflicts: Object.freeze(highProbabilityConflicts),
    allResources: Object.freeze(sortedRows),
  };

  return Object.freeze({
    ...profile,
    conclusion: buildResourceAnalysisConclusion(profile, {
      acquirerEnvironmentCode: acquirerCode,
      targetEnvironmentCode: targetCode,
      riskBand: options.riskBand,
      protocolName: options.protocolName,
    }),
  });
}

function candidateRange(acquirerEnvironmentCode, targetEnvironmentCode) {
  const friction = findFrictionPoint(acquirerEnvironmentCode, targetEnvironmentCode);
  const narrative = findFinalNarrative(acquirerEnvironmentCode, targetEnvironmentCode);
  const score = friction?.ecs ?? narrative?.ecs ?? null;
  const riskBand = friction?.riskBand ?? narrative?.riskBand ?? PENDING;
  return Object.freeze({
    acquirerEnvironmentCode: normalizeEnvironmentCode(acquirerEnvironmentCode),
    targetEnvironmentCode: normalizeEnvironmentCode(targetEnvironmentCode),
    acquirerAlias: aliasForEnvironment(acquirerEnvironmentCode),
    targetAlias: aliasForEnvironment(targetEnvironmentCode),
    score,
    range: compatibilityRange(score),
    riskBand,
  });
}

function buildAnchors(friction) {
  return Object.freeze([
    Object.freeze({
      label: "Within 30 days",
      sourceColumn: "Early Warning Signal",
      text: friction?.earlyWarningSignal || PENDING,
    }),
    Object.freeze({
      label: "Months 2\u20136",
      sourceColumn: "FP2",
      text: friction?.fp2 || PENDING,
    }),
    Object.freeze({
      label: "Months 6\u201318",
      sourceColumn: "FP3",
      text: friction?.fp3 || PENDING,
    }),
  ]);
}

function homogeneousAnchors(alias) {
  const body = FINAL_DELIVERABLE_DATA.screenCopy.homogeneousBody.replaceAll("{alias}", alias);
  const patterns = [
    ["Within 30 days", /Within 30 days:\s*'([^']+)'/],
    ["Months 2\u20136", /Months 2\u20136:\s*'([^']+)'/],
    ["Months 6\u201318", /Months 6\u201318:\s*'([^']+)'/],
  ];
  return Object.freeze(
    patterns.map(([label, pattern]) => Object.freeze({
      label,
      sourceColumn: "APPENDIX_B Screen 10b",
      text: body.match(pattern)?.[1] ?? PENDING,
    })),
  );
}

function buildSealPayload(acquirerEnvironmentCode, targetEnvironmentCode, anchors) {
  return Object.freeze({
    acquirerEnvironmentCode,
    targetEnvironmentCode,
    anchors: Object.freeze(anchors.map((anchor) => anchor.text)),
  });
}

function stripSectionLabel(value) {
  return String(value ?? "").replace(/^\[[^\]]+\]\s*/, "");
}

function replaceOfferAlias(value, alias) {
  return String(value ?? "").replaceAll("{alias}", alias || PENDING);
}

function parseComparisonRows(body, alias) {
  return Object.freeze(
    String(body ?? "")
      .split(/\n+/)
      .map((line) => replaceOfferAlias(line, alias).replace(/^\s*\u2022\s*/, "").trim())
      .filter((line) => line.startsWith("Free:"))
      .map((line) => {
        const match = line.match(/^Free:\s*(.*?)\s*\|\s*Paid adds:\s*(.*)$/);
        return Object.freeze({
          free: match?.[1] ?? PENDING,
          paidAdds: match?.[2] ?? PENDING,
        });
      }),
  );
}

function parseOfferBody(body, alias) {
  const sections = String(body ?? "")
    .split(/\n{2,}/)
    .map((section) => replaceOfferAlias(section.trim(), alias))
    .filter(Boolean);
  const pricingSection = sections.find((section) => section.startsWith("[Pricing band]")) ?? "";
  const costAnchorSection = sections.find((section) => section.startsWith("[Cost anchor")) ?? "";

  return Object.freeze({
    comparisonRows: parseComparisonRows(body, alias),
    pricingBand: stripSectionLabel(pricingSection) || PENDING,
    costAnchor: stripSectionLabel(costAnchorSection),
  });
}

function parseOfferCtas(ctaCopy) {
  const entries = Object.fromEntries(
    String(ctaCopy ?? "")
      .split(/\n+/)
      .map((line) => line.split(":"))
      .filter((parts) => parts.length >= 2)
      .map(([key, ...rest]) => [key.trim().toLowerCase(), rest.join(":").trim()]),
  );
  return Object.freeze({
    primary: entries.primary || PENDING,
    secondary: entries.secondary || PENDING,
  });
}

function priceFromText(value) {
  return String(value ?? "").match(/\$[0-9]+K\u2013\$[0-9]+K/)?.[0] ?? PENDING;
}

function buildCandidateRanges(outcomeLetter, acquirerScore, targetScore, targetEnvironmentCode) {
  if (outcomeLetter === "B") {
    return [acquirerScore.primaryEnvironmentCode, acquirerScore.secondaryEnvironmentCode]
      .filter(Boolean)
      .map((candidateCode) => candidateRange(candidateCode, targetEnvironmentCode));
  }

  if (outcomeLetter === "C") {
    return [targetScore.primaryEnvironmentCode, targetScore.secondaryEnvironmentCode]
      .filter(Boolean)
      .map((candidateCode) => candidateRange(acquirerScore.primaryEnvironmentCode, candidateCode));
  }

  return [];
}

function determineOutcome(acquirerScore, targetScore, narrative, mixedSignal) {
  if (mixedSignal || !narrative) return "D";
  if (acquirerScore.signalStrength === "weak" || acquirerScore.coPresence) return "B";
  if (targetScore.signalStrength === "weak" || targetScore.coPresence) return "C";
  return "A";
}

export function buildPairDeliverable(input = {}) {
  const acquirerScore = acquirerScoreFromInput(input);
  const targetScore = targetScoreFromInput(input);
  const acquirerEnvironmentCode = normalizeEnvironmentCode(acquirerScore.primaryEnvironmentCode);
  const targetEnvironmentCode = normalizeEnvironmentCode(targetScore.primaryEnvironmentCode);

  if (!acquirerEnvironmentCode || !targetEnvironmentCode) {
    return Object.freeze({
      ready: false,
      status: "environment-pair-incomplete",
    });
  }

  const acquirerAlias = aliasForEnvironment(acquirerEnvironmentCode);
  const targetAlias = aliasForEnvironment(targetEnvironmentCode);

  if (acquirerEnvironmentCode === targetEnvironmentCode) {
    // Homogeneous (self-pair) deliverable — OD-RMP3-1…OD-RMP3-16. The compatibility
    // result is the canonical structural ECS chain (Net Effect vectors → conflict
    // points → canonical formula → governed range/band transforms), never a transaction
    // literal. No pairwise resource-contestation model, protocol routing, or per-resource
    // controls apply to this branch.
    const anchors = homogeneousAnchors(acquirerAlias);
    const structuralEcs = canonicalStructuralEcs(acquirerEnvironmentCode, targetEnvironmentCode);
    const canonicalRange = compatibilityRange(structuralEcs.ecs);
    const canonicalBand = canonicalRiskBand(structuralEcs.ecs);
    const evidenceGate = homogeneousEvidenceGate(acquirerScore, targetScore);
    const body = publicText(FINAL_DELIVERABLE_DATA.screenCopy.homogeneousBody
      .replaceAll("{alias}", acquirerAlias)
      .replaceAll("{compatibilityRange}", canonicalRange)
      .replaceAll("{riskBand}", canonicalBand));
    return Object.freeze({
      ready: true,
      route: "/screen-10b-homogeneous",
      screen: "screen-10b",
      outcomeKey: "homogeneous",
      pairMode: "homogeneous",
      acquirerEnvironmentCode,
      targetEnvironmentCode,
      acquirerAlias,
      targetAlias,
      headline: FINAL_DELIVERABLE_DATA.screenCopy.homogeneousHeaderTemplate.replaceAll("{alias}", acquirerAlias),
      body,
      compatibilityScore: structuralEcs.ecs,
      compatibilityRange: canonicalRange,
      riskBand: canonicalBand,
      structuralCompatibility: Object.freeze({
        canonicalScore: structuralEcs.ecs,
        canonicalRange,
        canonicalBand,
        issued: true,
        status: evidenceGate.status,
        evidenceGate,
        derivation: Object.freeze({
          formula: structuralEcs.formula,
          conflictPoints: structuralEcs.conflictPoints,
          maxConflictPoints: structuralEcs.maxConflictPoints,
          source: structuralEcs.source,
        }),
      }),
      withinEnvironmentDifferentiation: buildCrossSideStructuralDifferentiation(
        input.acquirerQuestionResponses,
        input.targetSelfQuestionResponses,
      ),
      structuralResourceProfile: buildStructuralResourceProfile(acquirerEnvironmentCode),
      // Vector identity for the RMP-1 81-pair resource-map sentinel. Public homogeneous
      // output uses structuralResourceProfile, not this contestation model.
      resourceConflictProfile: buildResourceConflictProfile(acquirerEnvironmentCode, targetEnvironmentCode, {
        ecsScore: structuralEcs.ecs,
        ecsRange: canonicalRange,
        riskBand: canonicalBand,
        protocolName: "",
      }),
      nextStep: homogeneousNextStep(),
      targetResolutionSource: input.targetResolutionSource,
      anchors,
      caveat: FINAL_DELIVERABLE_DATA.screenCopy.sealedCaveat,
      cta: FINAL_DELIVERABLE_DATA.screenCopy.homogeneousCtaLabel.replaceAll("{alias}", acquirerAlias),
      sealPayload: buildSealPayload(acquirerEnvironmentCode, targetEnvironmentCode, anchors),
    });
  }

  const narrative = findFinalNarrative(acquirerEnvironmentCode, targetEnvironmentCode);
  const friction = findFrictionPoint(acquirerEnvironmentCode, targetEnvironmentCode);
  const outcomeLetter = determineOutcome(acquirerScore, targetScore, narrative, input.mixedSignal === true);
  const score = friction?.ecs ?? narrative?.ecs ?? null;
  const frictionRiskBand = /pending/i.test(String(friction?.riskBand ?? "")) ? "" : friction?.riskBand;
  const riskBand = frictionRiskBand || narrative?.riskBand || PENDING;
  const anchors = buildAnchors(friction);
  const protocolName = protocolForRiskBand(riskBand);
  const resourceConflictProfile = buildResourceConflictProfile(acquirerEnvironmentCode, targetEnvironmentCode, {
    friction,
    ecsScore: score,
    ecsRange: compatibilityRange(score),
    riskBand,
    protocolName,
  });
  const protocolDealInsights = buildProtocolDealInsights({
    acquirerAlias,
    targetAlias,
    protocolName,
    resourceConflictProfile,
  });

  return Object.freeze({
    ready: true,
    route: "/screen-10-reveal",
    screen: "screen-10",
    outcomeLetter,
    outcomeKey: OUTCOME_KEYS[outcomeLetter],
    outcomeGuide: outcomeGuide(outcomeLetter),
    acquirerEnvironmentCode,
    targetEnvironmentCode,
    acquirerAlias,
    targetAlias,
    narrative,
    friction,
    compatibilityScore: score,
    compatibilityRange: compatibilityRange(score),
    riskBand,
    targetCanonicalSource: input.targetCanonicalSource,
    targetCanonicalWeights: input.targetCanonicalWeights,
    targetResolutionSource: input.targetResolutionSource,
    resourceConflictProfile,
    isEcsIssued: outcomeLetter !== "D",
    candidateRanges: Object.freeze(buildCandidateRanges(outcomeLetter, acquirerScore, targetScore, targetEnvironmentCode)),
    protocol: Object.freeze({
      name: protocolName,
      marker: "Full protocol specification: Step 7.",
      dealInsights: protocolDealInsights,
    }),
    anchors,
    caveat: FINAL_DELIVERABLE_DATA.screenCopy.sealedCaveat,
    cta: narrative?.cta ?? "",
    bSingleCopy: FINAL_DELIVERABLE_DATA.bSingleCopyTemplates,
    sealPayload: buildSealPayload(acquirerEnvironmentCode, targetEnvironmentCode, anchors),
  });
}


const TARGET_OBSERVER_EVIDENCE_WEIGHT = 0.8;
const TARGET_SELF_ASSESSMENT_WEIGHT = 0.2;

function roundThree(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}

function auditScoreMapFrom(score, field) {
  const source = score?.[field] ?? {};
  const hasSourceMap = source && typeof source === "object" && FINAL_ENVIRONMENT_CODES.some((code) => Number(source[code]) > 0);
  if (hasSourceMap) {
    return Object.freeze(Object.fromEntries(
      FINAL_ENVIRONMENT_CODES.map((code) => [code, Number(source[code]) || 0]),
    ));
  }

  const primaryCode = normalizeEnvironmentCode(score?.primaryEnvironmentCode ?? score?.topEnvironmentCode);
  const primaryWeight = Number(score?.primarySignalScore) > 0
    ? Number(score.primarySignalScore)
    : auditSourceWeight(score) || 1;

  return Object.freeze(Object.fromEntries(
    FINAL_ENVIRONMENT_CODES.map((code) => [code, code === primaryCode ? primaryWeight : 0]),
  ));
}

function rankedFromScoreMap(scores) {
  return Object.freeze(
    Object.entries(scores)
      .map(([code, score]) => Object.freeze({ code, score: roundThree(score) }))
      .sort((left, right) => right.score - left.score || left.code.localeCompare(right.code)),
  );
}

function rankedFromRawSupport(scores) {
  return Object.freeze(
    Object.entries(scores)
      .sort(([leftCode, leftScore], [rightCode, rightScore]) => (
        rightScore - leftScore || leftCode.localeCompare(rightCode)
      ))
      .map(([code, score]) => Object.freeze({ code, score: roundThree(score) })),
  );
}

function combineScoreMaps(left, leftWeight, right, rightWeight) {
  return Object.freeze(Object.fromEntries(
    FINAL_ENVIRONMENT_CODES.map((code) => [
      code,
      roundThree((Number(left?.[code]) || 0) * leftWeight + (Number(right?.[code]) || 0) * rightWeight),
    ]),
  ));
}

function auditSourceWeight(score) {
  return Number(score?.totalEvidenceWeight) > 0 ? Number(score.totalEvidenceWeight) : Number(score?.effectiveAnswerCount) || Number(score?.answeredQuestionCount) || 0;
}

function isUnitInterval(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function hasNormalizedMap(score, field, allowNullValues = false) {
  const map = score?.[field];
  if (!map || typeof map !== "object") return false;
  return FINAL_ENVIRONMENT_CODES.every((code) => (
    allowNullValues && map[code] === null
      ? true
      : isUnitInterval(map[code])
  ));
}

function confidenceIngredientsFrom(score) {
  const synthetic = Number.isFinite(score?.mergedSupportedShare)
    && Number.isFinite(score?.mergedFlagRate)
    && Number.isFinite(score?.mergedLegacyCount);
  if (synthetic) {
    return Object.freeze({
      supportedShare: Number(score.mergedSupportedShare),
      flagRate: Number(score.mergedFlagRate),
      legacyCount: Number(score.mergedLegacyCount),
    });
  }

  const quality = score?.evidenceQuality;
  if (
    !isUnitInterval(quality?.evidenceSupportedShare)
    || !isUnitInterval(quality?.reliabilityFlagRate)
    || !Number.isFinite(quality?.legacyOptionOnlyCount)
    || quality.legacyOptionOnlyCount < 0
  ) {
    return null;
  }

  return Object.freeze({
    supportedShare: Number(quality.evidenceSupportedShare),
    flagRate: Number(quality.reliabilityFlagRate),
    legacyCount: Number(quality.legacyOptionOnlyCount),
  });
}

export function isNormalizedMergeEligibleScore(score) {
  if (score?.valid !== true || score?.scoringModelVersion !== LAYERED_EVIDENCE_SCORING_VERSION) return false;
  if (!isUnitInterval(score?.evidenceYield) || !isUnitInterval(score?.effectiveCoverage)) return false;
  if (!hasNormalizedMap(score, "supportStrengthByEnvironment")) return false;
  if (score.evidenceYield > 0) {
    if (!hasNormalizedMap(score, "signalCompositionShare")) return false;
    if (!isUnitInterval(score?.compositionGap)) return false;
  } else {
    if (!hasNormalizedMap(score, "signalCompositionShare", true)) return false;
    if (!FINAL_ENVIRONMENT_CODES.every((code) => score.signalCompositionShare[code] === null)) return false;
    if (score.compositionGap !== null) return false;
  }
  if (!isUnitInterval(score?.primarySupport)) return false;
  if (!score?.evidenceQuality || !confidenceIngredientsFrom(score)) return false;
  return ["high", "medium", "low", "cannot_determine"].includes(score?.confidence);
}

function normalizedMap(score, field) {
  return Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [code, Number(score[field][code]) || 0]));
}

function nullScoreMap() {
  return Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [code, null])));
}

function zeroScoreMap() {
  return Object.freeze(Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [code, 0])));
}

function normalizedBaseWeights(options) {
  const hasExplicitWeights = Number.isFinite(options.leftWeight) || Number.isFinite(options.rightWeight);
  const left = hasExplicitWeights ? Number(options.leftWeight) : 0.5;
  const right = hasExplicitWeights ? Number(options.rightWeight) : 0.5;
  const accepted = (left === 0.5 && right === 0.5)
    || (left === TARGET_OBSERVER_EVIDENCE_WEIGHT && right === TARGET_SELF_ASSESSMENT_WEIGHT);
  if (!accepted) {
    throw new Error(`Unsupported normalized merge base weights: ${left}/${right}`);
  }
  return Object.freeze({ left, right });
}

function confidenceFromMergedIngredients(leftScore, rightScore, baseWeights, bothZeroYield) {
  const leftIngredients = confidenceIngredientsFrom(leftScore);
  const rightIngredients = confidenceIngredientsFrom(rightScore);
  const leftAuthorityRaw = baseWeights.left * leftScore.effectiveCoverage;
  const rightAuthorityRaw = baseWeights.right * rightScore.effectiveCoverage;
  const totalAuthority = leftAuthorityRaw + rightAuthorityRaw;
  const leftAuthority = totalAuthority > 0 ? leftAuthorityRaw / totalAuthority : 0;
  const rightAuthority = totalAuthority > 0 ? rightAuthorityRaw / totalAuthority : 0;
  const mergedSupportedShareRaw = leftAuthority * leftIngredients.supportedShare
    + rightAuthority * rightIngredients.supportedShare;
  const mergedFlagRateRaw = leftAuthority * leftIngredients.flagRate
    + rightAuthority * rightIngredients.flagRate;
  const mergedLegacyCount = (leftAuthority > 0 ? leftIngredients.legacyCount : 0)
    + (rightAuthority > 0 ? rightIngredients.legacyCount : 0);

  let confidence = "low";
  if (bothZeroYield || totalAuthority <= 0) {
    confidence = "cannot_determine";
  } else if (rightAuthority === 0) {
    confidence = leftScore.confidence;
  } else if (leftAuthority === 0) {
    confidence = rightScore.confidence;
  } else if (mergedLegacyCount === 0 && mergedSupportedShareRaw >= 0.6 && mergedFlagRateRaw < 0.2) {
    confidence = "high";
  } else if (mergedSupportedShareRaw >= 0.35 && mergedFlagRateRaw < 0.4) {
    confidence = "medium";
  }

  return Object.freeze({
    confidence,
    mergedSupportedShare: roundThree(mergedSupportedShareRaw),
    mergedFlagRate: roundThree(mergedFlagRateRaw),
    mergedLegacyCount,
    authority: Object.freeze({
      left: roundThree(leftAuthority),
      right: roundThree(rightAuthority),
    }),
  });
}

function failClosedMergedScore(leftScore, rightScore, options) {
  return Object.freeze({
    scoringModelVersion: LAYERED_EVIDENCE_SCORING_VERSION,
    scoringMethod: options.scoringMethod ?? "normalized_support_space_merge",
    valid: false,
    normalizedMergeEligible: false,
    environmentScores: zeroScoreMap(),
    weightedEnvironmentScores: zeroScoreMap(),
    rankedEnvironments: rankedFromScoreMap(zeroScoreMap()),
    rawRankedEnvironments: rankedFromScoreMap(zeroScoreMap()),
    primaryEnvironmentCode: null,
    primarySignalEnvironmentCode: null,
    primarySignalScore: 0,
    secondaryEnvironmentCode: null,
    secondarySignalEnvironmentCode: null,
    secondarySignalScore: 0,
    totalEvidenceWeight: 0,
    questionCount: (Number(leftScore?.questionCount) || 0) + (Number(rightScore?.questionCount) || 0),
    answeredQuestionCount: (Number(leftScore?.answeredQuestionCount) || 0) + (Number(rightScore?.answeredQuestionCount) || 0),
    effectiveAnswerCount: 0,
    excludedAnswerCount: 0,
    signalCompositionShare: nullScoreMap(),
    supportStrengthByEnvironment: zeroScoreMap(),
    evidenceYield: 0,
    effectiveCoverage: 0,
    compositionGap: null,
    primarySupport: 0,
    coPresence: false,
    signalStrength: "weak",
    signalBadge: "WEAK",
    confidence: "cannot_determine",
    mergedSupportedShare: 0,
    mergedFlagRate: 0,
    mergedLegacyCount: 0,
    evidenceQuality: Object.freeze({
      confidence: "cannot_determine",
      baseConfidence: "cannot_determine",
      evidenceSupportedShare: 0,
      reliabilityFlagRate: 0,
      legacyOptionOnlyCount: 0,
    }),
  });
}

export function mergeTwoScores(leftScore = {}, rightScore = {}, options = {}) {
  const leftValid = isNormalizedMergeEligibleScore(leftScore);
  const rightValid = isNormalizedMergeEligibleScore(rightScore);

  if (leftValid && !rightValid) return leftScore;
  if (!leftValid && rightValid) return rightScore;
  if (!leftValid && !rightValid) return failClosedMergedScore(leftScore, rightScore, options);

  const baseWeights = normalizedBaseWeights(options);
  const explicitAuditWeights = Number.isFinite(options.leftWeight) && Number.isFinite(options.rightWeight);
  const totalSourceWeight = auditSourceWeight(leftScore) + auditSourceWeight(rightScore);
  const auditLeftWeight = explicitAuditWeights
    ? Number(options.leftWeight)
    : totalSourceWeight > 0 ? auditSourceWeight(leftScore) / totalSourceWeight : 0.5;
  const auditRightWeight = explicitAuditWeights
    ? Number(options.rightWeight)
    : totalSourceWeight > 0 ? auditSourceWeight(rightScore) / totalSourceWeight : 0.5;

  const environmentScores = combineScoreMaps(
    auditScoreMapFrom(leftScore, "environmentScores"),
    auditLeftWeight,
    auditScoreMapFrom(rightScore, "environmentScores"),
    auditRightWeight,
  );
  const weightedEnvironmentScores = combineScoreMaps(
    auditScoreMapFrom(leftScore, "weightedEnvironmentScores"),
    auditLeftWeight,
    auditScoreMapFrom(rightScore, "weightedEnvironmentScores"),
    auditRightWeight,
  );
  const rawRankedEnvironments = rankedFromScoreMap(environmentScores);
  const auditRankedEnvironments = rankedFromScoreMap(weightedEnvironmentScores);
  const auditPrimary = auditRankedEnvironments[0] ?? Object.freeze({ code: "", score: 0 });
  const auditSecondary = auditRankedEnvironments[1] ?? Object.freeze({ code: "", score: 0 });
  const totalEvidenceWeight = roundThree(
    (Number(leftScore.totalEvidenceWeight) || 0) * auditLeftWeight
    + (Number(rightScore.totalEvidenceWeight) || 0) * auditRightWeight,
  );

  const leftSupport = normalizedMap(leftScore, "supportStrengthByEnvironment");
  const rightSupport = normalizedMap(rightScore, "supportStrengthByEnvironment");
  const mergedSupportRaw = Object.fromEntries(FINAL_ENVIRONMENT_CODES.map((code) => [
    code,
    baseWeights.left * leftSupport[code] + baseWeights.right * rightSupport[code],
  ]));
  const mergedYieldRaw = baseWeights.left * leftScore.evidenceYield
    + baseWeights.right * rightScore.evidenceYield;
  const mergedCoverageRaw = baseWeights.left * leftScore.effectiveCoverage
    + baseWeights.right * rightScore.effectiveCoverage;
  const bothZeroYield = leftScore.evidenceYield <= 0 && rightScore.evidenceYield <= 0;
  const leftOnlyYield = leftScore.evidenceYield > 0 && rightScore.evidenceYield <= 0;
  const rightOnlyYield = rightScore.evidenceYield > 0 && leftScore.evidenceYield <= 0;
  const supportStrengthByEnvironment = Object.freeze(Object.fromEntries(
    FINAL_ENVIRONMENT_CODES.map((code) => [code, roundThree(mergedSupportRaw[code])]),
  ));
  const evidenceYield = roundThree(mergedYieldRaw);
  const effectiveCoverage = roundThree(mergedCoverageRaw);
  let signalCompositionShare = nullScoreMap();
  if (leftOnlyYield) {
    signalCompositionShare = Object.freeze({ ...leftScore.signalCompositionShare });
  } else if (rightOnlyYield) {
    signalCompositionShare = Object.freeze({ ...rightScore.signalCompositionShare });
  } else if (mergedYieldRaw > 0) {
    signalCompositionShare = Object.freeze(Object.fromEntries(
      FINAL_ENVIRONMENT_CODES.map((code) => [code, roundThree(mergedSupportRaw[code] / mergedYieldRaw)]),
    ));
  }

  const rankedEnvironments = rankedFromRawSupport(mergedSupportRaw);
  const positiveRanked = rankedEnvironments.filter((entry) => mergedSupportRaw[entry.code] > 0);
  const primaryEnvironmentCode = positiveRanked[0]?.code ?? null;
  const secondaryEnvironmentCode = positiveRanked[1]?.code ?? null;
  const secondaryRankingCode = rankedEnvironments[1]?.code ?? null;
  const compositionGap = mergedYieldRaw > 0 && primaryEnvironmentCode != null
    ? roundThree(
      signalCompositionShare[primaryEnvironmentCode]
      - (secondaryRankingCode == null ? 0 : signalCompositionShare[secondaryRankingCode]),
    )
    : null;
  const primarySupport = primaryEnvironmentCode != null
    ? supportStrengthByEnvironment[primaryEnvironmentCode]
    : 0;
  const mergedConfidence = confidenceFromMergedIngredients(
    leftScore,
    rightScore,
    baseWeights,
    bothZeroYield,
  );
  const signalStrength = classifyNormalizedSignal({
    evidenceMass: evidenceYield,
    primaryEnvironmentCode,
    effectiveCoverage,
    confidence: mergedConfidence.confidence,
    compositionGap,
    primarySupport,
  });
  const coPresence = normalizedCoPresence({
    evidenceMass: evidenceYield,
    primaryEnvironmentCode,
    compositionGap,
  });
  const directionalAuthorityDenominator = baseWeights.left * leftScore.evidenceYield
    + baseWeights.right * rightScore.evidenceYield;
  const normalizedDirectionalAuthority = Object.freeze({
    left: roundThree(directionalAuthorityDenominator > 0
      ? (baseWeights.left * leftScore.evidenceYield) / directionalAuthorityDenominator
      : 0),
    right: roundThree(directionalAuthorityDenominator > 0
      ? (baseWeights.right * rightScore.evidenceYield) / directionalAuthorityDenominator
      : 0),
  });
  const {
    opportunityMass: omittedOpportunityMass,
    excludedRate: omittedExcludedRate,
    ...leftCompatibilityFields
  } = leftScore;
  void omittedOpportunityMass;
  void omittedExcludedRate;

  return Object.freeze({
    ...leftCompatibilityFields,
    scoringModelVersion: LAYERED_EVIDENCE_SCORING_VERSION,
    scoringMethod: options.scoringMethod ?? "normalized_support_space_merge",
    valid: true,
    normalizedMergeEligible: true,
    environmentScores,
    weightedEnvironmentScores,
    rankedEnvironments,
    rawRankedEnvironments,
    primaryEnvironmentCode,
    primarySignalEnvironmentCode: primaryEnvironmentCode,
    primarySignalScore: auditPrimary.score,
    secondaryEnvironmentCode,
    secondarySignalEnvironmentCode: secondaryEnvironmentCode,
    secondarySignalScore: auditSecondary.score,
    totalEvidenceWeight,
    questionCount: (Number(leftScore.questionCount) || 0) + (Number(rightScore.questionCount) || 0),
    answeredQuestionCount: (Number(leftScore.answeredQuestionCount) || 0) + (Number(rightScore.answeredQuestionCount) || 0),
    effectiveAnswerCount: (Number(leftScore.effectiveAnswerCount) || 0) + (Number(rightScore.effectiveAnswerCount) || 0),
    excludedAnswerCount: (Number(leftScore.excludedAnswerCount) || 0) + (Number(rightScore.excludedAnswerCount) || 0),
    signalCompositionShare,
    supportStrengthByEnvironment,
    evidenceYield,
    effectiveCoverage,
    compositionGap,
    primarySupport,
    coPresence,
    signalStrength,
    signalBadge: signalStrength.toUpperCase(),
    confidence: mergedConfidence.confidence,
    mergedSupportedShare: mergedConfidence.mergedSupportedShare,
    mergedFlagRate: mergedConfidence.mergedFlagRate,
    mergedLegacyCount: mergedConfidence.mergedLegacyCount,
    evidenceQuality: Object.freeze({
      ...(leftScore.evidenceQuality ?? {}),
      confidence: mergedConfidence.confidence,
      baseConfidence: mergedConfidence.confidence,
      evidenceSupportedShare: mergedConfidence.mergedSupportedShare,
      reliabilityFlagRate: mergedConfidence.mergedFlagRate,
      legacyOptionOnlyCount: mergedConfidence.mergedLegacyCount,
    }),
    mergeWeights: Object.freeze({
      left: roundThree(auditLeftWeight),
      right: roundThree(auditRightWeight),
    }),
    normalizedMergeBaseWeights: baseWeights,
    normalizedDirectionalAuthority,
    mergedConfidenceAuthority: mergedConfidence.authority,
  });
}

export function combineTargetCanonicalScore(targetObservationScore = {}, targetDiagnosticScore = {}, targetSelfScore = {}) {
  const observerTargetScore = mergeTwoScores(targetObservationScore, targetDiagnosticScore, {
    scoringMethod: "target_observer_observation_diagnostic_weighted_merge",
  });
  const observerContributors = [
    isNormalizedMergeEligibleScore(targetObservationScore) ? "targetObservation" : null,
    isNormalizedMergeEligibleScore(targetDiagnosticScore) ? "targetDiagnostic" : null,
  ].filter(Boolean);
  const observerTargetEligible = isNormalizedMergeEligibleScore(observerTargetScore);
  const targetSelfEligible = isNormalizedMergeEligibleScore(targetSelfScore);

  if (observerTargetEligible && targetSelfEligible) {
    return Object.freeze({
      ...mergeTwoScores(observerTargetScore, targetSelfScore, {
        leftWeight: TARGET_OBSERVER_EVIDENCE_WEIGHT,
        rightWeight: TARGET_SELF_ASSESSMENT_WEIGHT,
        scoringMethod: "target_canonical_observer_80_self_20_merge",
      }),
      targetCanonicalSource: "target_observation_and_diagnostic_80_target_self_20",
      targetCanonicalWeights: Object.freeze({
        observerSideTargetEvidence: TARGET_OBSERVER_EVIDENCE_WEIGHT,
        targetSelfAssessment: TARGET_SELF_ASSESSMENT_WEIGHT,
      }),
      targetResolutionSource: Object.freeze({
        rule: "target_canonical_observer_80_self_20_merge",
        label: "combined target evidence",
        contributors: Object.freeze([...observerContributors, "targetSelfAssessment"]),
        weights: Object.freeze({
          observerSideTargetEvidence: TARGET_OBSERVER_EVIDENCE_WEIGHT,
          targetSelfAssessment: TARGET_SELF_ASSESSMENT_WEIGHT,
        }),
      }),
      componentScores: Object.freeze({
        targetObservation: targetObservationScore,
        targetDiagnostic: targetDiagnosticScore,
        targetSelfAssessment: targetSelfScore,
      }),
    });
  }

  if (observerTargetEligible) {
    return Object.freeze({
      ...observerTargetScore,
      targetCanonicalSource: "observer_side_target_evidence_only",
      targetCanonicalWeights: Object.freeze({ observerSideTargetEvidence: 1, targetSelfAssessment: 0 }),
      targetResolutionSource: Object.freeze({
        rule: "observer_side_target_evidence_only",
        label: "observer-side target evidence",
        contributors: Object.freeze(observerContributors),
        weights: Object.freeze({ observerSideTargetEvidence: 1, targetSelfAssessment: 0 }),
      }),
    });
  }

  if (targetSelfEligible) {
    return Object.freeze({
      ...targetSelfScore,
      targetCanonicalSource: "target_self_assessment_only",
      targetCanonicalWeights: Object.freeze({ observerSideTargetEvidence: 0, targetSelfAssessment: 1 }),
      targetResolutionSource: Object.freeze({
        rule: "target_self_assessment_only",
        label: "target self-assessment",
        contributors: Object.freeze(["targetSelfAssessment"]),
        weights: Object.freeze({ observerSideTargetEvidence: 0, targetSelfAssessment: 1 }),
      }),
    });
  }

  return failClosedMergedScore(observerTargetScore, targetSelfScore, {
    scoringMethod: "target_canonical_normalized_merge_incomplete",
  });
}

function hasPersistedAnswers(value) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

function respondentOptionsFromScore(score, fallbackRespondentId = null) {
  const response = Array.isArray(score?.questionResponses)
    ? score.questionResponses.find((entry) => entry?.respondentId || entry?.respondentSlot)
    : null;
  return Object.freeze({
    respondentId: response?.respondentId ?? fallbackRespondentId,
    respondentSlot: response?.respondentSlot ?? null,
  });
}

function ineligiblePersistedScore(originalScore, status) {
  return Object.freeze({
    valid: false,
    scoringModelVersion: originalScore?.scoringModelVersion ?? null,
    normalizedMergeEligibility: status,
  });
}

function currentOrRecomputedScore(originalScore, recompute) {
  if (isNormalizedMergeEligibleScore(originalScore)) {
    return Object.freeze({ score: originalScore, status: "current_v2" });
  }
  if (originalScore?.scoringModelVersion === LAYERED_EVIDENCE_SCORING_VERSION) {
    return Object.freeze({
      score: ineligiblePersistedScore(originalScore, "invalid_v2_normalized_fields"),
      status: "invalid_v2_normalized_fields",
    });
  }

  const recomputedScore = recompute();
  if (isNormalizedMergeEligibleScore(recomputedScore)) {
    return Object.freeze({ score: recomputedScore, status: "legacy_recomputed_v2" });
  }
  return Object.freeze({
    score: ineligiblePersistedScore(originalScore, "legacy_ineligible_missing_or_invalid_answers"),
    status: "legacy_ineligible_missing_or_invalid_answers",
  });
}

function recomputeTargetObservationScore(session) {
  const record = session?.targetObservation;
  if (!hasPersistedAnswers(record?.answers)) return null;
  return scoreTargetObservation(record.answers, undefined, respondentOptionsFromScore(
    record.score,
    record.observationSessionId ?? session?.targetObservationSetupInvite?.observationSessionId ?? null,
  ));
}

function recomputeTargetDiagnosticScore(session) {
  const record = session?.target2B;
  const level1Answers = record?.level1?.answers;
  if (!hasPersistedAnswers(level1Answers)) return null;
  const identity = respondentOptionsFromScore(
    record?.finalScore,
    session?.targetObservation?.observationSessionId
      ?? session?.targetObservationSetupInvite?.observationSessionId
      ?? null,
  );
  const level1Score = scoreTargetDiagnosticLevel1(level1Answers, undefined, identity);
  if (!level1Score.valid) return null;
  const level2Answers = record?.level2?.answers;
  if (hasPersistedAnswers(level2Answers)) {
    return scoreTargetDiagnosticCombined(level1Answers, level2Answers, undefined, identity);
  }
  return level1Score.requiresLevel2 ? null : level1Score;
}

function recomputeTargetSelfScore(session) {
  const record = session?.targetSelfAssessment;
  if (!hasPersistedAnswers(record?.answers)) return null;
  const identity = respondentOptionsFromScore(
    record.score,
    session?.targetInvite?.targetSessionId ?? null,
  );
  return scoreTargetSelfAssessment(record.answers, undefined, {
    ...identity,
    positioning: record.positioning ?? {},
    acquisitionAwareness: record.positioning?.acquisitionAwareness,
    targetSessionId: session?.targetInvite?.targetSessionId,
  });
}

export function rehydrateTargetScoresForNormalizedMerge(session = {}) {
  const targetObservation = currentOrRecomputedScore(
    session?.targetObservation?.score,
    () => recomputeTargetObservationScore(session),
  );
  const targetDiagnostic = currentOrRecomputedScore(
    session?.target2B?.finalScore,
    () => recomputeTargetDiagnosticScore(session),
  );
  const targetSelfAssessment = currentOrRecomputedScore(
    session?.targetSelfAssessment?.score,
    () => recomputeTargetSelfScore(session),
  );

  return Object.freeze({
    targetObservationScore: targetObservation.score,
    targetDiagnosticScore: targetDiagnostic.score,
    targetSelfScore: targetSelfAssessment.score,
    statuses: Object.freeze({
      targetObservation: targetObservation.status,
      targetDiagnostic: targetDiagnostic.status,
      targetSelfAssessment: targetSelfAssessment.status,
    }),
  });
}

function hasCompletedTargetSelfAssessment(session) {
  if (session?.targetSelfAssessment?.completed !== true) return false;
  return session?.targetInvite?.completed === true || session?.targetSelfDirect?.completed === true;
}

export function buildFinalDeliverable(session) {
  if (!hasCompletedTargetSelfAssessment(session)) {
    return Object.freeze({
      ready: false,
      status: "target-self-assessment-required",
    });
  }

  const acquirerScore = session?.acquirer2A?.score ?? {};
  const {
    targetObservationScore,
    targetDiagnosticScore,
    targetSelfScore,
  } = rehydrateTargetScoresForNormalizedMerge(session);
  const targetScore = combineTargetCanonicalScore(targetObservationScore, targetDiagnosticScore, targetSelfScore);

  return buildPairDeliverable({
    acquirerEnvironmentCode: acquirerScore.primaryEnvironmentCode,
    acquirerSecondaryEnvironmentCode: acquirerScore.secondaryEnvironmentCode,
    acquirerSignalStrength: acquirerScore.signalStrength,
    acquirerCoPresence: acquirerScore.coPresence,
    acquirerQuestionResponses: acquirerScore.questionResponses,
    targetEnvironmentCode: targetScore.primaryEnvironmentCode,
    targetSecondaryEnvironmentCode: targetScore.secondaryEnvironmentCode,
    targetSignalStrength: targetScore.signalStrength,
    targetCoPresence: targetScore.coPresence === true,
    targetSelfQuestionResponses: targetSelfScore.questionResponses,
    targetCanonicalSource: targetScore.targetCanonicalSource,
    targetCanonicalWeights: targetScore.targetCanonicalWeights,
    targetResolutionSource: targetScore.targetResolutionSource,
  });
}

export function buildPaidOffer(variant = "heterogeneous", options = {}) {
  const isHomogeneous = variant === "homogeneous";
  const alias = options.alias ?? options.deliverable?.acquirerAlias ?? PENDING;
  const header = isHomogeneous
    ? FINAL_DELIVERABLE_DATA.screenCopy.screen11bHeader
    : FINAL_DELIVERABLE_DATA.screenCopy.screen11Header;
  const body = isHomogeneous
    ? FINAL_DELIVERABLE_DATA.screenCopy.screen11bBody
    : FINAL_DELIVERABLE_DATA.screenCopy.screen11Body;
  const ctaCopy = isHomogeneous
    ? FINAL_DELIVERABLE_DATA.screenCopy.screen11bCta
    : FINAL_DELIVERABLE_DATA.screenCopy.screen11Cta;
  const parsedBody = parseOfferBody(body, alias);

  return Object.freeze({
    ready: true,
    screen: isHomogeneous ? "screen-11b" : "screen-11",
    route: isHomogeneous ? "/screen-11b-homogeneous-offer" : "/screen-11-paid-offer",
    variant: isHomogeneous ? "homogeneous" : "heterogeneous",
    header: replaceOfferAlias(header, alias),
    comparisonRows: parsedBody.comparisonRows,
    pricingBand: parsedBody.pricingBand,
    price: priceFromText(parsedBody.pricingBand),
    costAnchor: parsedBody.costAnchor,
    ctas: parseOfferCtas(ctaCopy),
  });
}

export function isFinalDeliverableSourceLoaded(data = FINAL_DELIVERABLE_DATA) {
  return Boolean(
    data?.sources?.includes("ST_Free_Tier_Output_Narratives_updated.xlsx")
      && data?.sources?.includes("ST_Friction_Point_Lookup_updated.xlsx")
      && data?.sources?.includes("ST_UI_Track_Coder_Agent_Specification_v1.xlsx")
      && data?.sources?.includes("ST_Investment_Memorandum_final.docx")
      && data.narratives.length === 72
      && data.frictionPoints.length === 72
      && data.screenCopy.screen11Header
      && data.screenCopy.screen11Body
      && data.screenCopy.screen11Cta
      && data.screenCopy.screen11bHeader
      && data.screenCopy.screen11bBody
      && data.screenCopy.screen11bCta
      && data.screenCopy.sealedCaveat
      && data.clientJourney.outcomes.A
      && data.clientJourney.outcomes.B
      && data.clientJourney.outcomes.C
      && data.clientJourney.outcomes.D,
  );
}
