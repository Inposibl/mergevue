import { ENVIRONMENTS } from "../data/environments.js";
import { CLIENT_NARRATIVE_SECTION_IDS } from "../agent/agentContractConstants.js";
import {
  buildFinalDeliverable,
  canonicalStructuralEcs,
  FINAL_ENVIRONMENT_CODES,
  publicText,
} from "../flow/finalDeliverableFlow.js";
import { buildDealEconomicsReport } from "../flow/finalReportEngine.js";

const BRAND = Object.freeze({
  name: "Mergevue",
  product: "Post-Deal Friction Preview",
  reportType: "Structural Read",
  contactEmail: "report@mergevue.com",
});

export const MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME = "mergevue-forecast-brief.pdf";
export const MERGEVUE_PUBLIC_REPORT_EMAIL_SUBJECT = "Mergevue Forecast Brief: Post-Deal Behavior Forecast";
export const PUBLIC_ANALYTICAL_FIELD_PATHS = Object.freeze({
  model: Object.freeze({
    executiveDecisionSummary: Object.freeze(["headline", "oneParagraphSummary", "decisionImplication", "mainRisk", "recommendedAction"]),
    sealedPrediction: Object.freeze(["predictionClaim", "observableSignal", "verificationMethod", "recommendedAction"]),
    compatibilityScoreAndDealScenario: Object.freeze(["compatibilityExplanation"]),
    collisionThesis: Object.freeze(["collisionHeadline", "coreMismatch", "collisionSummary", "primaryTension", "whyItMatters", "postCloseFailureMode"]),
    resourceConflictMap: Object.freeze(["overwriteRiskExplanation"]),
    timelinePhase: Object.freeze(["expectedFriction", "observableSignal", "recommendedCheck"]),
    recommendedAction: Object.freeze(["actionReason", "actionExpectedEffect"]),
  }),
  design: Object.freeze({
    executive: Object.freeze(["headline", "thesis", "decisionImplication", "mainRisk", "recommendedAction"]),
    prediction: Object.freeze(["statement", "rationale", "evidenceRequired", "decisionFocus"]),
    environment: Object.freeze(["coreMismatch"]),
    collisionThesis: Object.freeze(["headline", "summary", "primaryTension", "whyItMatters", "postCloseFailureMode"]),
    timelinePhase: Object.freeze(["body", "watchFor"]),
  }),
});
export const authorityPhrases = Object.freeze({
  "NT/STJ": "authority earned through measurable results and symmetric accountability",
  "NT/STP": "authority belonging to whoever can demonstrably make the thing work",
  "NF/NT": "authority granted to the strongest argument, regardless of title or tenure",
  "NF/SFJ": "authority held through proximity to the founding mission and collective purpose",
  "NF/SFP": "authority carried by the most genuine creative voice, with little weight on credentials",
  "SFJ/SFP": "authority accumulated through seniority, tenure, and standing within the community",
  "STJ/STP": "authority held by those able to take and defend a position of strength",
  "STP/STJ": "authority derived from a sanctioned position in the hierarchy, accountable upward and contingent on delivery",
  "SFP/SFJ": "authority embedded in the standardised system itself, with compliance secured through engineered incentives",
});
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

const REPORT_VERSION = "mergevue-public-forecast-brief-mvp-1";
const FALLBACK = "Not available";
const APPROVED_DEAL_TYPE = "Competitive consolidation";
const APPROVED_ENTERPRISE_VALUE_BAND = "Valuation risk band: $50M-$500M EV";
const APPROVED_VALUATION_DISCLAIMER = "Illustrative posture, not a valuation.";
const APPROVED_ENGAGEMENT_TIER_REQUIREMENT = "Absolute risk figures require the engagement-tier economic model.";
const APPROVED_OVERWRITE_RISK_EXPLANATION = "The main risk is translation failure: the acquirer may impose its standard integration logic before it understands which target routines preserve loyalty, trust, knowledge flow, execution quality, or deal-critical continuity after close.";
// OD-RR3-1: the only Owner-approved concealed-conflict public copy. Replaces the
// previous concealed-conflict literals, which are no longer controlling authority.
const APPROVED_CONCEALED_CONFLICT_RISK_EXPLANATION = "The main risk is false alignment: a high compatibility score can make the integration path look settled while important differences in authority, routines, and control expectations remain latent. Those differences may become material only when post-close integration decisions begin.";
// RMP-3 authorized factual homogeneous templates (OD-RMP3-5/16/26). The homogeneous
// resource layer is a structural resource profile, never a pairwise contestation score.
const HOMOGENEOUS_STRUCTURAL_RESOURCE_QUALIFIER = "Shared structural state; this is not a pairwise resource-conflict score.";
const HOMOGENEOUS_DOCTRINE_CLASS = "structural_homogeneous";
const PUBLIC_COPY_TEMPLATES = Object.freeze({
  coreMismatch: "The core mismatch is between {acquirer_authority_phrase}, and {target_authority_phrase}. The sharpest contested resource is {top_conflict_resource}: {conflict_direction_phrase}.",
  fp2Rationale: "Treat {resource} as a protected integration resource during {window}: it is {conflict_direction_phrase}{conflict_causal_clause} Separating preservation from simplification gives the integration team time to identify which {target_env}-linked routines protect cohesion, where {acquirer_env} accountability should apply, and which changes should wait until the Day 60 review.",
  conflictSummary: "The sharpest contested resource is {resource}: {conflict_direction_phrase}.",
  resourceExplanation: "Contested resource: {resource} — {conflict_direction_phrase}.",
});
export const PUBLIC_CONFLICT_DIRECTION_COPY = Object.freeze({
  "+|-": Object.freeze({
    class: "direct",
    acquirer: "amplified on the acquirer side",
    target: "suppressed on the target side",
    connector: "and",
  }),
  "~|-": Object.freeze({
    class: "partial",
    acquirer: "treated as background on the acquirer side",
    target: "actively suppressed on the target side",
    connector: "while",
  }),
  "+|~": Object.freeze({
    class: "partial",
    acquirer: "actively amplified on the acquirer side",
    target: "treated as background on the target side",
    connector: "while",
  }),
  "-|+": Object.freeze({
    class: "direct",
    acquirer: "suppressed on the acquirer side",
    target: "amplified on the target side",
    connector: "and",
  }),
  "-|-": Object.freeze({
    class: "convergent",
    acquirer: "suppressed on both sides",
    target: "",
    connector: "",
  }),
  "+|+": Object.freeze({
    class: "convergent",
    acquirer: "actively amplified on both sides",
    target: "",
    connector: "",
  }),
  "~|+": Object.freeze({
    class: "partial",
    acquirer: "treated as background on the acquirer side",
    target: "actively amplified on the target side",
    connector: "while",
  }),
  "~|~": Object.freeze({
    class: "convergent",
    acquirer: "treated as background on both sides",
    target: "",
    connector: "",
  }),
  "-|~": Object.freeze({
    class: "partial",
    acquirer: "actively suppressed on the acquirer side",
    target: "treated as background on the target side",
    connector: "while",
  }),
});

// Public display vocabulary for canonical resource effects and ERI tiers
// (mirrors RESOURCE_EFFECT_LABELS / tier labels already exposed by the resource map).
const PUBLIC_RESOURCE_EFFECT_LABELS = Object.freeze({
  "+": "Amplifies",
  "-": "Suppresses",
  "~": "Neutral",
});
const PUBLIC_RESOURCE_TIER_LABELS = Object.freeze({
  IGN: "Baseline",
  LOW: "Low",
  MID: "Medium",
  TOP: "High",
});

const EVIDENCE_INTEGRITY_NOT_ASSESSED = "NOT ASSESSED";

function publicPairKey(deliverable) {
  return `${deliverable?.acquirerEnvironmentCode ?? ""}->${deliverable?.targetEnvironmentCode ?? ""}`;
}

function isPendingFrictionText(value) {
  return /^[\s\W_]*pending(?:\s+analysis)?\b/iu.test(String(value ?? ""));
}

function hasCanonicalFrictionContent(deliverable) {
  const friction = deliverable?.friction;
  return Boolean(friction)
    && ![friction.fp1, friction.fp2, friction.fp3, friction.earlyWarningSignal, friction.primaryConflictedResources]
      .some(isPendingFrictionText);
}

function renderPublicTemplate(template, tokens) {
  const missing = [...template.matchAll(/\{([a-z_]+)\}/g)]
    .map((match) => match[1])
    .filter((token) => !String(tokens[token] ?? "").trim());
  if (missing.length) {
    throw new Error(`Missing canonical public-copy token(s): ${missing.join(", ")}`);
  }
  return template.replace(/\{([a-z_]+)\}/g, (_match, token) => {
    const value = String(tokens[token]);
    return token === "conflict_causal_clause" ? value.trimEnd() : value.trim();
  });
}

function normalizedConflictSign(value) {
  return value === "\u2212" ? "-" : value;
}

// Friction assertions bind each sign to an explicit environment identity
// ("(+NT/STJ vs ~NF/NT …)"); textual position is never authority. Both labelled
// environments must be present, distinct, and exactly the expected pair.
const FRICTION_ENVIRONMENT_SOURCE = [...FINAL_ENVIRONMENT_CODES]
  .sort((left, right) => right.length - left.length)
  .map((code) => code.replace("/", "\\/"))
  .join("|");
const FRICTION_ASSERTION_PATTERN = new RegExp(
  `\\(([+~\\-\\u2212])\\s*(${FRICTION_ENVIRONMENT_SOURCE})(?![A-Za-z/])[^()]*?`
    + `\\s+vs\\s+([+~\\-\\u2212])\\s*(${FRICTION_ENVIRONMENT_SOURCE})(?![A-Za-z/])[^()]*?\\)`,
  "iu",
);
const FRICTION_ENVIRONMENT_MENTIONS_PATTERN = new RegExp(
  `(?<![A-Za-z/])(${FRICTION_ENVIRONMENT_SOURCE})(?![A-Za-z/])`,
  "giu",
);

function expectedPairFrom(deliverable) {
  return Object.freeze({
    expectedAcquirer: String(deliverable?.acquirerEnvironmentCode ?? "").trim(),
    expectedTarget: String(deliverable?.targetEnvironmentCode ?? "").trim(),
  });
}

function conflictDirectionParts(rawPattern, expectedPair) {
  const value = String(rawPattern ?? "").trim();
  const expectedAcquirer = String(expectedPair?.expectedAcquirer ?? "").trim();
  const expectedTarget = String(expectedPair?.expectedTarget ?? "").trim();
  if (!FINAL_ENVIRONMENT_CODES.includes(expectedAcquirer)
    || !FINAL_ENVIRONMENT_CODES.includes(expectedTarget)
    || expectedAcquirer === expectedTarget) {
    throw new Error(
      `Invalid expected environment pair for public conflict direction: ${expectedAcquirer || "<none>"} -> ${expectedTarget || "<none>"}`,
    );
  }
  const match = value.match(FRICTION_ASSERTION_PATTERN);
  if (!match) throw new Error(`Unknown public conflict direction pattern: ${value || "<empty>"}`);
  const firstEnvironment = match[2].toUpperCase();
  const secondEnvironment = match[4].toUpperCase();
  if (firstEnvironment === secondEnvironment) {
    throw new Error(`Duplicate environment in public conflict direction pattern: ${match[0]}`);
  }
  const mentions = [...match[0].matchAll(FRICTION_ENVIRONMENT_MENTIONS_PATTERN)]
    .map((mention) => mention[1].toUpperCase());
  if (mentions.length !== 2 || mentions[0] !== firstEnvironment || mentions[1] !== secondEnvironment) {
    throw new Error(`Unrelated environment identity in public conflict direction pattern: ${match[0]}`);
  }
  const signByEnvironment = Object.freeze({
    [firstEnvironment]: normalizedConflictSign(match[1]),
    [secondEnvironment]: normalizedConflictSign(match[3]),
  });
  const acquirerSign = signByEnvironment[expectedAcquirer];
  const targetSign = signByEnvironment[expectedTarget];
  if (!acquirerSign || !targetSign) {
    throw new Error(
      `Public conflict direction pattern ${match[0]} does not reference expected pair ${expectedAcquirer} -> ${expectedTarget}`,
    );
  }
  const key = `${acquirerSign}|${targetSign}`;
  const direction = PUBLIC_CONFLICT_DIRECTION_COPY[key];
  if (!direction) throw new Error(`Unknown public conflict direction pattern: ${match[0]}`);
  return Object.freeze({ ...direction, key, acquirerSign, targetSign });
}

function conflictDirectionPhrase(rawPattern, expectedPair, format = "long") {
  const direction = conflictDirectionParts(rawPattern, expectedPair);
  if (!direction.target) return direction.acquirer;
  if (format === "short") return `${direction.acquirer}, ${direction.target}`;
  return `${direction.acquirer} ${direction.connector} ${direction.target}`;
}

function conflictCausalClause(rawPattern, expectedPair) {
  const direction = conflictDirectionParts(rawPattern, expectedPair);
  if (direction.class === "direct" || direction.class === "partial") {
    return ", which makes it an early priority area for integration control.";
  }
  if (direction.acquirerSign === "+") {
    return " — both organisations actively rely on it, which makes ownership of it an early control point.";
  }
  return " — neither organisation actively manages it, which makes it a monitoring blind spot once integration load arrives.";
}

function canonicalConflictRows(deliverable) {
  const profile = deliverable?.resourceConflictProfile;
  const rows = profile?.highProbabilityConflicts?.length ? profile.highProbabilityConflicts : profile?.allResources ?? [];
  return [
    ...rows.filter((row) => String(row.sourceSignal ?? "").trim()),
    ...rows.filter((row) => !String(row.sourceSignal ?? "").trim()),
  ];
}

function topCanonicalConflict(deliverable) {
  const row = canonicalConflictRows(deliverable)[0];
  if (!row?.resource || !String(row.sourceSignal ?? "").trim()) {
    throw new Error(`Missing canonical conflict source for public pair ${publicPairKey(deliverable)}`);
  }
  return Object.freeze({
    resource: String(row.resource).trim(),
    sourceSignal: String(row.sourceSignal).trim(),
  });
}

function canonicalConsistencyLog(deliverable) {
  const expectedPair = expectedPairFrom(deliverable);
  return canonicalConflictRows(deliverable).flatMap((row) => {
    if (!String(row.sourceSignal ?? "").trim() || isPendingFrictionText(row.sourceSignal)) return [];
    const frictionReading = conflictDirectionParts(row.sourceSignal, expectedPair).key;
    const profileReading = `${normalizedConflictSign(row.acquirerImpact?.effect)}|${normalizedConflictSign(row.targetImpact?.effect)}`;
    if (frictionReading === profileReading) return [];
    return [Object.freeze({
      pair: publicPairKey(deliverable),
      resource: String(row.resource ?? "").trim(),
      frictionReading,
      profileReading,
      frictionSource: "NewLogic 03.05.2026/ST_Friction_Point_Lookup_updated.xlsx",
      profileSource: "src/flow/finalDeliverableFlow.js RESOURCE_PRIORITY_MATRIX",
      resolution: "friction row takes precedence for pair-level public copy",
    })];
  });
}

function environmentTemplateToken(value) {
  return String(value ?? "").trim().replace(/^The\s+/i, "");
}

function safeApprovedPairCopy(deliverable) {
  try {
    return approvedPairCopy(deliverable);
  } catch (error) {
    if (/Missing canonical conflict source/.test(String(error?.message ?? ""))) return null;
    throw error;
  }
}

function approvedPairCopy(deliverable) {
  if (!hasCanonicalFrictionContent(deliverable)) return null;
  const acquirerAuthorityPhrase = authorityPhrases[deliverable?.acquirerEnvironmentCode];
  const targetAuthorityPhrase = authorityPhrases[deliverable?.targetEnvironmentCode];
  if (!acquirerAuthorityPhrase || !targetAuthorityPhrase) {
    throw new Error(`Missing authority phrase for public pair ${publicPairKey(deliverable)}`);
  }
  const conflict = topCanonicalConflict(deliverable);
  const expectedPair = expectedPairFrom(deliverable);
  const commonTokens = {
    resource: conflict.resource,
    top_conflict_resource: conflict.resource,
    conflict_direction_phrase: conflictDirectionPhrase(conflict.sourceSignal, expectedPair),
  };
  return Object.freeze({
    coreMismatch: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.coreMismatch, {
      ...commonTokens,
      acquirer_authority_phrase: acquirerAuthorityPhrase,
      target_authority_phrase: targetAuthorityPhrase,
      conflict_direction_phrase: conflictDirectionPhrase(conflict.sourceSignal, expectedPair, "short"),
    }),
    conflictSummary: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.conflictSummary, commonTokens),
    fp2Rationale: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.fp2Rationale, {
      ...commonTokens,
      conflict_causal_clause: conflictCausalClause(conflict.sourceSignal, expectedPair),
      window: TIMING_LOGIC.observationWindow.replace("-", "\u2013"),
      acquirer_env: environmentTemplateToken(deliverable?.acquirerAlias),
      target_env: environmentTemplateToken(deliverable?.targetAlias),
    }),
  });
}

function branchAwareOverwriteRiskExplanation(doctrineClass, resource, isHomogeneous = false) {
  if (isHomogeneous) {
    return HOMOGENEOUS_STRUCTURAL_RESOURCE_QUALIFIER;
  }
  if (doctrineClass === "concealed_conflict") {
    return APPROVED_CONCEALED_CONFLICT_RISK_EXPLANATION;
  }

  return cleanString(resource?.explanation ?? APPROVED_OVERWRITE_RISK_EXPLANATION);
}
const APPROVED_CONCEALED_CONFLICT_POST_CLOSE_FAILURE_MODE =
  "High structural compatibility can make post-close alignment appear stronger than it is. The main failure mode is delayed control friction: differences in authority, routine preservation, or control expectations may become material as integration decisions are implemented.";

function branchAwarePostCloseFailureMode(doctrineClass, narrative, isHomogeneous = false) {
  if (isHomogeneous) {
    // Governed Screen 10b Block 4 copy (ST_UI_Track_Coder_Agent_Specification_v1.xlsx).
    return publicFrictionText(
      "What this analysis cannot tell you — and what determines whether the integration succeeds at the leadership level — is the depth of the hierarchy on each side and the type-level distribution within that hierarchy."
    );
  }
  if (doctrineClass === "concealed_conflict") {
    return APPROVED_CONCEALED_CONFLICT_POST_CLOSE_FAILURE_MODE;
  }

  return publicFrictionText(
    narrative?.postCloseFailureMode ??
      "The acquirer translates the target operating system too early into its own management language before it understands which routines preserve trust, knowledge flow, informal authority, execution quality, or deal-critical continuity."
  );
}
const TIMING_LOGIC = Object.freeze({
  signalSetup: "before Day 30",
  observationWindow: "Days 30-60",
  verificationDeadline: "Day 60",
});

const UNSAFE_PUBLIC_REPLACEMENTS = Object.freeze([
  [/Academy of Structural Typology/gi, BRAND.name],
  [/Structural Typology/gi, BRAND.name],
  [/structural-typology\.academy/gi, "mergevue.com"],
  [/structural-typology\.com/gi, "mergevue.com"],
  [/info@structural-typology\.academy/gi, BRAND.contactEmail],
  [/Forward-verifiable\s*\|\s*on record/gi, "Display-only preview"],
  [/lodged against public ledger/gi, "available as a display-only preview"],
  [/timestamped against public ledger/gi, "available as a display-only preview"],
  [/USD 50\.0B/gi, APPROVED_ENTERPRISE_VALUE_BAND],
  [/USD 350M to USD 2\.2B/gi, APPROVED_ENTERPRISE_VALUE_BAND],
  [/Indicative Total Risk Envelope/gi, "Economic risk posture"],
  [/Total Risk Envelope/gi, "Economic risk posture"],
  [/hard risk envelope/gi, "engagement-tier economic model"],
  [/absolute loss range/gi, "engagement-tier economic model"],
  [/Kill a Competitor/gi, APPROVED_DEAL_TYPE],
  [/Absorb or neutralize a competitor/gi, APPROVED_DEAL_TYPE],
  [/\bfirst senior hire,\s*promotion,\s*or significant appointment\b/gi, "first senior hire, mandate expansion, or significant appointment"],
  [/\bfirst promotion or appointment\b/gi, "first mandate expansion or appointment"],
  [/\bappointment or promotion\b/gi, "appointment or mandate expansion"],
  [/\bSubstitution of patronage for promotion\b/gi, "Substitution of patronage for mandate expansion"],
  [/\bpromotion\b/gi, "mandate expansion"],
  [/\bMcDonalds\b/g, "McDonald's"],
]);

const DEAL_TYPE_LABELS = Object.freeze({
  team_acquisition: "Acquire or retain a team",
  market_entry: "Enter a new market",
  kpi_driven_ma: "Protect KPI-driven deal value",
  competitor_absorption: APPROVED_DEAL_TYPE,
  platform_acquisition: APPROVED_DEAL_TYPE,
});

function cleanString(value, fallback = FALLBACK) {
  const base = String(value ?? "").trim() || fallback;
  return UNSAFE_PUBLIC_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    publicText(base),
  ).replace(/\s+/g, " ").trim();
}

function cleanCompanyName(value, fallback) {
  return cleanString(value, fallback);
}

function cleanArray(values, fallbackValues = []) {
  const source = Array.isArray(values) && values.length > 0 ? values : fallbackValues;
  return source.map((value) => cleanString(value)).filter(Boolean);
}

function compactId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "public-preview";
}

function environmentByCode(code) {
  return ENVIRONMENTS.find((environment) => environment.code === code) ?? null;
}

function scoreQualityLabel(session) {
  const completedSources = [
    session?.dealContext?.completed ? "deal context" : "",
    session?.acquirer2A?.completed ? "acquirer module" : "",
    session?.target2B?.completed ? "target diagnostic" : "",
    session?.targetSelfAssessment?.completed ? "target self-assessment" : "",
    session?.targetObservation?.completed ? "target observation" : "",
  ].filter(Boolean);

  return completedSources.length >= 3
    ? `Preview quality: ${completedSources.join(", ")} present.`
    : `Preview quality: ${completedSources.join(", ") || "limited inputs"} present.`;
}

function inputCompleteness(session, deliverable) {
  const checks = [
    ["deal context", session?.dealContext?.completed],
    ["acquirer environment", session?.acquirer2A?.score?.primaryEnvironmentCode || deliverable?.acquirerEnvironmentCode],
    ["target environment", session?.targetSelfAssessment?.score?.primaryEnvironmentCode || session?.target2B?.finalScore?.primaryEnvironmentCode || deliverable?.targetEnvironmentCode],
  ];
  const present = checks.filter(([, value]) => Boolean(value)).map(([label]) => label);
  const missing = checks.filter(([, value]) => !value).map(([label]) => label);
  return missing.length === 0
    ? `Complete for public preview: ${present.join(", ")}.`
    : `Incomplete for public preview; missing ${missing.join(", ")}.`;
}

function freezePlainObject(value) {
  return value && typeof value === "object" ? Object.freeze({ ...value }) : null;
}

function buildEvidenceCalibration(session, deliverable) {
  const triageReport = session?.preliminaryAssessment?.triageReport ?? null;
  const contradictionReport = session?.preliminaryAssessment?.contradictionReport ?? null;
  const routing = triageReport?.routing ?? null;
  const candidateRanges = Array.isArray(deliverable?.candidateRanges) ? deliverable.candidateRanges : [];
  const currentRange = candidateRanges.find((row) =>
    row?.acquirerEnvironmentCode === deliverable?.acquirerEnvironmentCode
    && row?.targetEnvironmentCode === deliverable?.targetEnvironmentCode
  ) ?? null;
  const alternativeRanges = candidateRanges.filter((row) => row !== currentRange);
  const triggered = Boolean(
    deliverable?.outcomeKey === "target-partial"
    || routing?.gate === "paid_output_conditional"
    || contradictionReport?.summary?.analystReviewRequired === true
  );

  if (!triggered && candidateRanges.length === 0) return null;

  return Object.freeze({
    triggered,
    outcomeKey: deliverable?.outcomeKey ?? "",
    routing: freezePlainObject(routing),
    reliabilitySummary: freezePlainObject(triageReport?.reliabilitySummary),
    contradictionSummary: freezePlainObject(triageReport?.contradictionSummary ?? contradictionReport?.summary),
    currentRange: freezePlainObject(currentRange),
    alternativeRanges: Object.freeze(alternativeRanges.map((row) => freezePlainObject(row)).filter(Boolean)),
    sourceSummaries: Object.freeze((triageReport?.sourceSummaries ?? []).map((row) => freezePlainObject(row)).filter(Boolean)),
  });
}

function countLabel(count, singular, plural = null) {
  const pluralLabel = plural ?? singular + "s";
  return String(count) + " " + (count === 1 ? singular : pluralLabel);
}

function notAssessedEvidenceIntegrity(source) {
  return Object.freeze({
    status: "not-assessed",
    value: EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source,
  });
}

// RR3-F02: governed R1/R2 (primary vs verification acquirer respondent)
// agreement/divergence aggregate. The governed comparison itself runs inside the
// server production-authority path (api/production-interpretation.ts), which computes
// a bounded public-safe summary through the existing dual-respondent comparator and
// injects it here; the report model stays browser-safe. The cross-side contradiction
// engine is never used as a substitute. Missing or absent summary fails closed to
// NOT ASSESSED.
function buildR1R2AgreementSummary(session, precomputed) {
  const verificationIncluded = session?.acquirer2A?.score?.verificationIncluded;
  if (verificationIncluded !== true) {
    return notAssessedEvidenceIntegrity("governed R1/R2 comparison (no verification respondent)");
  }
  if (precomputed && typeof precomputed.value === "string" && precomputed.value.trim()) {
    return Object.freeze({
      status: String(precomputed.status ?? "assessed"),
      value: cleanString(precomputed.value),
      source: String(precomputed.source ?? "server-authoritative governed R1/R2 comparison (aggregate only)"),
    });
  }
  return notAssessedEvidenceIntegrity("governed R1/R2 comparison (production-authority summary absent)");
}

// RR3-F08: one authoritative provisional/evidence-limited qualification for the
// whole report. Only already-governed states qualify: acquirer-partial,
// target-partial, the governed homogeneous evidence gate, and the existing
// calibration trigger set. No new evidence threshold is introduced.
function provisionalQualification(deliverable, calibration) {
  const isHomogeneous = isHomogeneousDeliverable(deliverable);
  const outcomeKey = deliverable?.outcomeKey ?? "";
  const partialOutcome = outcomeKey === "acquirer-partial" || outcomeKey === "target-partial";
  const homogeneousProvisional = isHomogeneous
    && deliverable?.structuralCompatibility?.evidenceGate?.status === "provisional";
  const calibrated = calibration?.triggered === true;
  if (!partialOutcome && !homogeneousProvisional && !calibrated) {
    return Object.freeze({ status: "none", basis: "", reliance: "" });
  }
  const condition = cleanString(deliverable?.outcomeGuide?.condition ?? "");
  const homogeneousQualification = cleanString(deliverable?.structuralCompatibility?.evidenceGate?.publicQualification ?? "");
  const basis = homogeneousProvisional
    ? (homogeneousQualification || "Weak or co-present same-environment evidence (governed homogeneous evidence gate).")
    : (condition || "Governed evidence qualification applies.");
  return Object.freeze({
    status: "provisional",
    basis,
    // Existing governed reliance vocabulary (EstimationAccuracyNotice): the
    // report remains usable but is qualified, never fully confirmed.
    reliance: "The final report can still be used, but compatibility, resource-risk emphasis, and integration-control priorities should be treated as preliminary rather than high-confidence until additional evidence is available.",
  });
}

function governedValue(value) {
  const text = cleanString(value, "");
  return text || EVIDENCE_INTEGRITY_NOT_ASSESSED;
}

function coveragePairText(score) {
  if (!score) return null;
  const effective = Number(score.effectiveAnswerCount);
  const eligible = Number(score.questionCount ?? score.answeredQuestionCount);
  if (!Number.isFinite(effective) || !Number.isFinite(eligible)) return null;
  return `${effective} of ${eligible}`;
}

function supportedShareText(score) {
  const share = Number(score?.evidenceQuality?.evidenceSupportedShare);
  if (!Number.isFinite(share)) return null;
  return `${Math.round(share * 100)}%`;
}

// OD-RR2-5 aggregate public evidence-integrity surface. Reads only authoritative
// score/evidence fields. Raw answers, question IDs, per-question evidence, respondent
// attribution, and internal weights are never exposed. A missing source renders
// "NOT ASSESSED" — never a fallback zero.
function buildEvidenceIntegrity(session, deliverable, calibration, r1r2Agreement, crossSideEvidence) {
  const acquirerScore = session?.acquirer2A?.score ?? null;
  const observationScore = session?.targetObservation?.score ?? null;
  const diagnosticScore = session?.target2B?.finalScore ?? null;
  const selfScore = session?.targetSelfAssessment?.score ?? null;
  const rows = [];

  rows.push(Object.freeze({
    label: "Acquirer evidence confidence",
    value: governedValue(acquirerScore?.confidence),
    source: "acquirer2A.score.confidence",
  }));

  const targetConfidenceParts = [
    observationScore?.confidence ? `Observation: ${cleanString(observationScore.confidence)}` : "",
    diagnosticScore?.confidence ? `Diagnostic: ${cleanString(diagnosticScore.confidence)}` : "",
    selfScore?.confidence ? `Self-assessment: ${cleanString(selfScore.confidence)}` : "",
  ].filter(Boolean);
  rows.push(Object.freeze({
    label: "Target evidence confidence",
    value: targetConfidenceParts.length ? targetConfidenceParts.join(" · ") : EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source: "targetObservation.score / target2B.finalScore / targetSelfAssessment.score confidence",
  }));

  const coverageParts = [
    acquirerScore ? `Acquirer: ${coveragePairText(acquirerScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
    observationScore ? `Target observation: ${coveragePairText(observationScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
    diagnosticScore ? `Target diagnostic: ${coveragePairText(diagnosticScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
    selfScore ? `Target self-assessment: ${coveragePairText(selfScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
  ].filter(Boolean);
  rows.push(Object.freeze({
    label: "Effective answers vs eligible questions",
    value: coverageParts.length ? coverageParts.join(" · ") : EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source: "score.effectiveAnswerCount / score.questionCount",
  }));

  const supportParts = [
    acquirerScore ? `Acquirer: ${supportedShareText(acquirerScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
    diagnosticScore ? `Target diagnostic: ${supportedShareText(diagnosticScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
    selfScore ? `Target self-assessment: ${supportedShareText(selfScore) ?? EVIDENCE_INTEGRITY_NOT_ASSESSED}` : "",
  ].filter(Boolean);
  rows.push(Object.freeze({
    label: "Evidence-supported answer share",
    value: supportParts.length ? supportParts.join(" · ") : EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source: "score.evidenceQuality.evidenceSupportedShare",
  }));

  const flagSources = [acquirerScore, diagnosticScore, selfScore]
    .filter((score) => score?.evidenceQuality && Number.isFinite(Number(score.evidenceQuality.reliabilityFlagCount)));
  const flagCount = flagSources.reduce((sum, score) => sum + Number(score.evidenceQuality.reliabilityFlagCount), 0);
  rows.push(Object.freeze({
    label: "Reliability flags (aggregate)",
    value: flagSources.length ? String(flagCount) : EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source: "score.evidenceQuality.reliabilityFlagCount",
  }));

  // RR3-F06 absence semantics: a missing participation source is NOT ASSESSED;
  // an authoritative false is "not included"; a missing respondentCount is
  // never invented as a number.
  const verificationIncluded = acquirerScore?.verificationIncluded;
  const respondentCount = Number(acquirerScore?.respondentCount);
  const acquirerVerificationText = verificationIncluded === true
    ? `included${Number.isFinite(respondentCount) ? ` (${respondentCount} respondents)` : " (respondent count not assessed)"}`
    : verificationIncluded === false
      ? "not included"
      : EVIDENCE_INTEGRITY_NOT_ASSESSED;
  const targetObserverText = session?.targetObservation
    ? (session.targetObservation.completed === true ? "completed" : "not completed")
    : EVIDENCE_INTEGRITY_NOT_ASSESSED;
  const targetSelfText = session?.targetSelfAssessment
    ? (session.targetSelfAssessment.completed === true ? "completed" : "not completed")
    : EVIDENCE_INTEGRITY_NOT_ASSESSED;
  rows.push(Object.freeze({
    label: "Verification participation",
    value: [
      `Acquirer verification: ${acquirerVerificationText}`,
      `Target observer session: ${targetObserverText}`,
      `Target self-assessment: ${targetSelfText}`,
    ].join(" · "),
    source: "acquirer2A.score.verificationIncluded / respondentCount; targetObservation.completed; targetSelfAssessment.completed",
  }));

  // RR3-F02: governed R1/R2 (primary vs verification acquirer respondent)
  // agreement/divergence — aggregate only, never the cross-side contradiction
  // engine as a substitute.
  const r1r2Summary = buildR1R2AgreementSummary(session, r1r2Agreement);
  rows.push(Object.freeze({
    label: "R1/R2 verification agreement",
    value: r1r2Summary.value,
    source: r1r2Summary.source,
  }));

  // RR3-CORR1-IV-01 (CORR2): the server-computed cross-side aggregate takes
  // precedence. An assessed zero is an explicit zero; a missing or non-assessed
  // source stays NOT ASSESSED — never conflated.
  const calibratedContradictionCount = Number(calibration?.contradictionSummary?.contradictionCount);
  const crossSideCount = crossSideEvidence?.assessed === true ? Number(crossSideEvidence.contradictionCount) : NaN;
  const authoritativeContradictionCount = Number.isFinite(crossSideCount)
    ? crossSideCount
    : (Number.isFinite(calibratedContradictionCount) ? calibratedContradictionCount : null);
  rows.push(Object.freeze({
    label: "Cross-side material agreement / divergence",
    value: authoritativeContradictionCount === null
      ? EVIDENCE_INTEGRITY_NOT_ASSESSED
      : `${authoritativeContradictionCount} contradiction${authoritativeContradictionCount === 1 ? "" : "s"} recorded across evidence sources (aggregate)`,
    source: "buildContradictionReport (governed deterministic contradiction engine) / preliminaryAssessment.triageReport.contradictionSummary",
  }));

  const resolution = deliverable?.targetResolutionSource;
  if (resolution) {
    const contributors = Array.isArray(resolution.contributors)
      ? resolution.contributors.map((contributor) => cleanString(contributor)).filter(Boolean).join(", ")
      : "";
    rows.push(Object.freeze({
      label: "Environment resolution",
      value: `The reported target environment is an adjudicated outcome of the governed target-side merge${contributors ? ` (contributors: ${contributors})` : ""}.`,
      source: "deliverable.targetResolutionSource",
    }));
  }

  const excludedSources = [acquirerScore, diagnosticScore, selfScore]
    .filter((score) => Number.isFinite(Number(score?.excludedAnswerCount)));
  const excludedCount = excludedSources.reduce((sum, score) => sum + Number(score.excludedAnswerCount), 0);
  rows.push(Object.freeze({
    label: "Observation gaps (aggregate)",
    value: excludedSources.length
      ? `${excludedCount} answer${excludedCount === 1 ? "" : "s"} excluded from primary scoring across scored modules (direct-observation-gap and comparable exclusions, aggregate only)`
      : EVIDENCE_INTEGRITY_NOT_ASSESSED,
    source: "score.excludedAnswerCount",
  }));

  const qualification = provisionalQualification(deliverable, calibration);
  rows.push(Object.freeze({
    label: "Provisional state",
    value: qualification.status === "provisional" ? `Provisional — ${qualification.basis}` : "None",
    source: "deliverable.outcomeKey / deliverable.structuralCompatibility.evidenceGate.status / existing calibration trigger set",
  }));

  return Object.freeze({
    rows: Object.freeze(rows),
    qualification: Object.freeze({
      status: qualification.status,
      basis: qualification.basis,
      reliance: qualification.reliance,
    }),
  });
}

function calibratedDataQualityLabel(session, calibration) {
  const base = scoreQualityLabel(session);
  const contradictions = Number(calibration?.contradictionSummary?.contradictionCount) || 0;
  const flags = Number(calibration?.reliabilitySummary?.flagCount) || 0;
  if (!calibration?.triggered) return base;
  return `${base.replace("Preview quality:", "Preview quality:").replace(" present.", " present;")} signal agreement unresolved (${countLabel(contradictions, "contradiction")}, ${countLabel(flags, "reliability flag")}).`;
}

function calibratedInputCompletenessLabel(session, deliverable, calibration) {
  const base = inputCompleteness(session, deliverable);
  const targetSources = (calibration?.sourceSummaries ?? []).filter((row) => String(row?.id ?? "").startsWith("target"));
  const weakTargets = targetSources.filter((row) => row?.signalStrength === "weak" || row?.confidence === "low");
  if (!calibration?.triggered || weakTargets.length === 0) return base;
  return `${base.replace("Complete for public preview: deal context, acquirer environment, target environment.", "Complete for public preview;")} target-side confidence limited across ${countLabel(weakTargets.length, "weak/low-confidence target source")}.`;
}

// Alternative-read hardening (RR-3 item 11): a candidate range is rendered only when it
// is fully lawful and resolvable. PENDING or empty range/band suppresses the alternative
// cleanly instead of leaking a placeholder into client-visible text.
function lawfulCandidateRange(row) {
  if (!row) return false;
  const range = cleanString(row.range);
  const riskBand = cleanString(row.riskBand);
  const score = Number(row.score);
  return Number.isFinite(score)
    && Boolean(range) && !/pending/i.test(range)
    && Boolean(riskBand) && !/pending/i.test(riskBand);
}

function calibratedCanSayLabel(calibration, deliverable) {
  // RR3-F08: one authoritative provisional qualification drives the reliance
  // language; a provisional report never sounds fully confirmed.
  const qualification = provisionalQualification(deliverable, calibration);
  const current = calibration?.currentRange;
  const alternative = calibration?.alternativeRanges?.[0];
  if (qualification.status !== "provisional") {
    return "It can state the post-close friction thesis for the identified environment pair, preview watchpoints, review windows, and control implications from the current inputs.";
  }
  if (calibration?.triggered && lawfulCandidateRange(current)) {
    const routeLabel = cleanString(calibration?.routing?.label, "Analyst review required").replace(/\s+required$/i, " required");
    const alternativeText = lawfulCandidateRange(alternative)
      ? ` Alternative read: ${cleanString(alternative.targetAlias, alternative.targetEnvironmentCode)} ${alternative.score} (${alternative.range}, ${alternative.riskBand}).`
      : "";
    return `ECS is provisional: ${cleanString(current.targetAlias, current.targetEnvironmentCode)} ${current.score} (${current.range}, ${current.riskBand}). ${routeLabel} before treating as settled.${alternativeText} ${qualification.reliance}`;
  }
  return `This report is provisional: ${qualification.basis} ${qualification.reliance}`;
}
function dealTypeLabel(value) {
  if (value === "competitor_absorption" || value === "platform_acquisition" || value === "other_integration_sensitive") {
    return APPROVED_DEAL_TYPE;
  }
  return cleanString(DEAL_TYPE_LABELS[value] ?? value ?? "Deal type not specified");
}

function fallbackPredictionText(deliverable, narrative = {}) {
  if (deliverable?.friction?.earlyWarningSignal && !isPendingFrictionText(deliverable.friction.earlyWarningSignal)) return deliverable.friction.earlyWarningSignal;
  if (deliverable?.anchors?.[0]?.text && !isPendingFrictionText(deliverable.anchors[0].text)) return deliverable.anchors[0].text;
  return "Monitor whether the expected integration friction appears during the preview window.";
}

function publicFrictionText(text) {
  let value = cleanString(text);
  if (!value) return "";

  const replacements = [
    [/\bdoctrinal compliance\b/gi, "mission-alignment requirements"],
    [/\bheresy mechanism\b/gi, "mission-protection response"],
    [/\bcoercive redistribution\b/gi, "force-based resource control"],
    [/\bcoercive logic\b/gi, "force-based operating logic"],
    [/\bnaked coercion\b/gi, "visible pressure-based control"],
    [/\bforce-based compliance\b/gi, "pressure-based compliance"],
    [/\bcomplete authority mechanism collapse\b/gi, "authority legitimacy breakdown"],
    [/\bmoral collapse cascade\b/gi, "mission-trust breakdown"],
    [/\btalent exodus\b/gi, "high-value talent departure"],
    [/\btalent flight\b/gi, "high-value talent departure"],
    [/\bextraction mechanism\b/gi, "value-capture mechanism"],
    [/\bextraction mechanisms\b/gi, "value-capture mechanisms"],
    [/\bextraction system\b/gi, "value-capture system"],
    [/\bextraction environments\b/gi, "value-capture environments"],
    [/\bextraction environment\b/gi, "value-capture environment"],
    [/\bextraction positions\b/gi, "value-capture positions"],
    [/\bbelief extraction\b/gi, "belief-based retention pressure"],
    [/\bextraction pressure\b/gi, "value-capture pressure"],
    [/\bextraction\b/gi, "value-capture"],
    [/\bcomplicity\b/gi, "participation"],
    [/\bprotection premium\b/gi, "protection pricing"],
    [/\bcoercion\b/gi, "pressure-based control"],
    [/\bdesire engineering\b/gi, "preference shaping"],
    // RR3-CORR1: priority semantics, not probability semantics, for the resource map.
    [/\bhigh-probability\b/gi, "high-priority"],
    [/\bhigh probability\b/gi, "high priority"],
    [/\blow probability\b/gi, "lower priority"],
    [/\bpsychological safety has already been eliminated\b/gi, "psychological safety has materially weakened"],
    [/\bdestroying\b/gi, "weakening"],
    [/\bdestroys\b/gi, "weakens"],
    [/\bcollapse\b/gi, "breakdown"],
    [/\beliminated\b/gi, "removed"],
    [/\beliminates\b/gi, "removes"],
    [/\btarget[’']s narrative leaders\b/gi, "mission-linked leadership roles"],
    [/\bnamed trust owner\b/gi, "designated trust owner"],
    [/\bnamed leaders\b/gi, "leadership functions"],
    [/\bnamed critical roles\b/gi, "critical role categories"],
    [/\bname the knowledge holders\b/gi, "identify critical knowledge-holder categories"],
    [/\bnames who carries the risk\b/gi, "identifies where risk is carried across roles, routines, governance layers, and value pools"],
    [/\bnamed experts\b/gi, "critical knowledge-holder categories"],
    [/\bnamed preview signals\b/gi, "preview signals"],
  ];

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  return cleanString(value);
}

function hasUsableAnchors(deliverable) {
  const anchors = deliverable?.anchors ?? [];
  return anchors.length >= 3 && anchors.slice(0, 3).every((a) => a?.text && !isPendingFrictionText(a.text));
}
// One homogeneity identity (OD-RMP3-23): the renderer/report layer never re-detects
// homogeneous status from alias text, display patterns, or code equality; it trusts the
// explicit semantic mode propagated by the deliverable.
function isHomogeneousDeliverable(deliverable) {
  return deliverable?.pairMode === "homogeneous" || deliverable?.outcomeKey === "homogeneous";
}

function homogeneousCompatibilityExplanation(deliverable, compatibilityBand) {
  const structural = deliverable?.structuralCompatibility;
  const qualification = String(structural?.evidenceGate?.publicQualification ?? "").trim();
  const base = `Structural compatibility is canonically derived for the shared environment: C = 0 because the Net Effect of every one of the 17 canonical resources is identical on both sides, so ECS = 100 × (1 − C / 34) = 100 mechanically. Result: ${compatibilityBand} (${structural?.canonicalScore}, ${structural?.canonicalRange} · ${structural?.canonicalBand}). An ECS of 100 does not imply zero integration risk: the operating logic is shared, and the remaining risk shifts to internal hierarchy depth and type distribution.`;
  return qualification ? `${base} ${qualification}` : base;
}

function heterogeneousCompatibilityExplanation(deliverable, compatibilityBand) {
  const derivation = canonicalStructuralEcs(
    deliverable?.acquirerEnvironmentCode,
    deliverable?.targetEnvironmentCode,
  );
  const contributing = (derivation?.perResource ?? []).filter((entry) => entry.conflictPoints > 0);
  const identities = contributing.map((entry) => (
    `${entry.resource} (${PUBLIC_RESOURCE_EFFECT_LABELS[entry.acquirerNetEffect] ?? "Neutral"} on the acquirer side, ${PUBLIC_RESOURCE_EFFECT_LABELS[entry.targetNetEffect] ?? "Neutral"} on the target side)`
  ));
  const identityList = identities.length === 1
    ? identities[0]
    : identities.length === 2
      ? `${identities[0]} and ${identities[1]}`
      : identities.length > 2
        ? `${identities.slice(0, -1).join(", ")}, and ${identities[identities.length - 1]}`
        : "";
  const score = Number(deliverable?.compatibilityScore);
  const scoreText = Number.isFinite(score) ? String(score) : "";
  const range = cleanString(deliverable?.compatibilityRange);
  const governedRange = range && range !== "PENDING" && range !== "Not available" ? `, governed range ${range}` : "";
  return `ECS is ${scoreText} (${compatibilityBand}${governedRange}). Derivation: ${derivation.formula}, where C = ${derivation.conflictPoints} conflict points across ${contributing.length} of the 17 canonical resources (denominator 34 = 17 resources × 2 maximum points). Contributing resources: ${identityList || "none"}. This derivation is separate from the resource priority map: the priority map orders integration attention and is not a decomposition of the ECS calculation.`;
}

function homogeneousDifferentiationSummary(deliverable) {
  const differentiation = deliverable?.withinEnvironmentDifferentiation;
  if (!differentiation) return null;
  return Object.freeze({
    mode: differentiation.mode,
    status: differentiation.status,
    summary: cleanString(differentiation.summary),
    totalSharedDimensions: differentiation.totalSharedDimensions,
    comparableCount: differentiation.comparableCount,
    agreeCount: differentiation.agreeCount,
    divergeCount: differentiation.divergeCount,
  });
}
function homogeneousClaim(anchor, window) {
  return windowedPairClaim(anchor, window);
}

function windowedPairClaim(anchor, window) {
  const text = cleanString(anchor?.text);
  if (!text) return "";
  const firstSentence = text.split(/(?<=\.)\s/)[0] || text;
  const clause = firstSentence.replace(/\.$/, "");
  const phase = window === TIMING_LOGIC.signalSetup ? "In the first 30 days"
    : window === TIMING_LOGIC.observationWindow ? "During Days 30-60"
    : "By Day 60";
  return `${phase}: ${clause}.`;
}

function buildPredictions(deliverable, doctrineClass, narrative) {
  if (!hasCanonicalFrictionContent(deliverable) && !hasUsableAnchors(deliverable)) return [];
  const isHomogeneous = isHomogeneousDeliverable(deliverable);
  const anchors = (deliverable?.anchors ?? []).map((anchor) => (
    isPendingFrictionText(anchor?.text) ? null : anchor
  ));
  const actions = recommendedActions(deliverable, doctrineClass);
  // Referential integrity (RR-3 item 8): each watchpoint binds to the single action
  // whose governed timing window matches the watchpoint window. The action title,
  // reason, and expected effect below come from that same action object — never from
  // a positional index.
  const actionBinding = (index) => {
    const pattern = isHomogeneous
      ? (index === 2 ? /\bday\s*60\b/i : /next step/i)
      : (index === 0 ? /before day 30/i
        : index === 1 ? /days 30/i
        : /\bday\s*60\b/i);
    const action = actions.find((candidate) => pattern.test(String(candidate?.actionTiming ?? "")));
    if (!action) return null;
    return Object.freeze({
      actionTitle: cleanString(action.actionTitle),
      actionTiming: cleanString(action.actionTiming),
      actionOwner: cleanString(action.actionOwner),
      actionReason: cleanString(action.actionReason),
      actionExpectedEffect: cleanString(action.actionExpectedEffect),
      recommendedAction: cleanString(`${action.actionTitle}. ${action.actionExpectedEffect} ${action.actionReason}`),
    });
  };

  const pairClaim = (index, window) => {
    const claim = windowedPairClaim(anchors[index], window);
    if (claim) return publicFrictionText(claim);
    if (index === 1) {
      // Existing generic fixed-cadence copy for pairs whose governed FP2 source row is absent.
      return "During Days 30-60: review whether the friction described above repeats across planning, authority, information flow, or resource allocation.";
    }
    if (index === 2) {
      // Existing generic fixed-cadence checkpoint copy for pairs whose governed FP3 source row is absent.
      return "By Day 60: review retention exposure, delivery confidence, knowledge continuity, operating rhythm, knowledge-transfer logs, early departures or disengagement signals, and whether systematised knowledge is becoming harder to preserve under integration pressure.";
    }
    return publicFrictionText(fallbackPredictionText(deliverable, narrative));
  };
  const pairSignal = (index, fallback) => {
    const signal = publicFrictionText(anchors[index]?.text ?? "");
    return signal || cleanString(fallback);
  };

  return [
    {
      predictionTitle: "Signal setup",
      predictionWindow: TIMING_LOGIC.signalSetup,
      predictionClaim: pairClaim(0, TIMING_LOGIC.signalSetup),
      observableSignal: pairSignal(0, fallbackPredictionText(deliverable, narrative)),
      verificationMethod: isHomogeneous
        ? "Review Day 0–30 communication-forum notes, decision-meeting records, governance routines, and decision logs for early signs that the two same-environment leadership groups are competing for the same decision authority."
        : "Review Day 0–30 communication-forum notes, decision-meeting records, governance routines, management forum language, decision logs, and examples of acquirer-side authority signals moving across the integration boundary.",
      ...(actionBinding(0) ?? { recommendedAction: "Protect the highest-risk operating resource before irreversible integration changes begin." }),
    },
    {
      predictionTitle: "Observation window",
      predictionWindow: TIMING_LOGIC.observationWindow,
      predictionClaim: pairClaim(1, TIMING_LOGIC.observationWindow),
      observableSignal: pairSignal(1, "Repeated friction in planning, authority, information flow, or resource allocation."),
      verificationMethod: "Review Days 30–60 operating meeting notes, escalation records, handoff documents, decision-rights updates, planning-cycle changes, and examples where trust-preserving routines are bypassed before their value is understood.",
      ...(actionBinding(1) ?? { recommendedAction: "Separate preservation from simplification while the repeated friction pattern is tested." }),
    },
    {
      predictionTitle: "Early checkpoint",
      predictionWindow: TIMING_LOGIC.verificationDeadline,
      predictionClaim: pairClaim(2, TIMING_LOGIC.verificationDeadline),
      observableSignal: pairSignal(2, "Day 60 is the escalation checkpoint. If retention exposure, delivery confidence, knowledge continuity, or operating rhythm show early stress, the preview should convert into the paid workflow for ECS decomposition, artifact review, and role-level control design."),
      verificationMethod: "Use the Day 60 review to decide whether early retention, delivery-confidence, knowledge-continuity, or operating-rhythm signals require escalation into the paid workflow.",
      ...(actionBinding(2) ?? { recommendedAction: "Run the Day 60 early-checkpoint review and decide whether the risk should be escalated into full engagement monitoring, revised, or lowered." }),
    },
  ];
}
function resourceRows(deliverable) {
  if (isHomogeneousDeliverable(deliverable)) {
    // Structural resource profile (OD-RMP3-7/16): canonical Net Effect × ERI tier for all
    // 17 resources in canonical order. No contestation score, no probability, no IGN
    // penalty, no numeric tier weight, no top-5 selection.
    const structuralRows = deliverable?.structuralResourceProfile?.resources ?? [];
    return structuralRows.map((row) => ({
      resourceName: cleanString(row.resource),
      resourceCategory: cleanString(row.resourceTypeLabel ?? row.resourceType),
      // RMP-3 governed invariant: homogeneous rows carry no contestation intensity;
      // explicit null is the canonical absence representation (never a numeral).
      conflictIntensity: null,
      conflictBand: "",
      direction: cleanString(row.canonicalEffectLabel),
      sharedStateClass: cleanString(row.sharedStateClass),
      sharedStateLabel: cleanString(row.sharedStateLabel),
      eriTier: cleanString(row.eriTier),
      explanation: HOMOGENEOUS_STRUCTURAL_RESOURCE_QUALIFIER,
    }));
  }

  const profile = deliverable?.resourceConflictProfile;
  const candidateRows = profile?.highProbabilityConflicts?.length ? profile.highProbabilityConflicts : profile?.allResources ?? [];
  const rows = [
    ...candidateRows.filter((row) => String(row.sourceSignal ?? "").trim()),
    ...candidateRows.filter((row) => !String(row.sourceSignal ?? "").trim()),
  ].slice(0, 5);

  const hasCanonicalPairCopy = Boolean(safeApprovedPairCopy(deliverable));
  const expectedPair = expectedPairFrom(deliverable);
  return rows.map((row, index) => ({
    resourceName: cleanString(row.resource),
    resourceCategory: cleanString(row.resourceTypeLabel ?? row.resourceType),
    // OD-RR2-2: no ungoverned contestation numeral. Priority is the ordered position
    // of the governed resource-conflict scan; the band is categorical.
    priorityOrder: index + 1,
    conflictBand: cleanString(row.probability ?? "Monitor"),
    direction: cleanString(`${row.acquirerImpact?.label ?? "Acquirer"} / ${row.targetImpact?.label ?? "Target"}`),
    acquirerNetEffect: PUBLIC_RESOURCE_EFFECT_LABELS[row.acquirerImpact?.effect] ?? "",
    targetNetEffect: PUBLIC_RESOURCE_EFFECT_LABELS[row.targetImpact?.effect] ?? "",
    acquirerEriTier: PUBLIC_RESOURCE_TIER_LABELS[row.acquirerImpact?.tier] ?? "",
    targetEriTier: PUBLIC_RESOURCE_TIER_LABELS[row.targetImpact?.tier] ?? "",
    conflictDrivers: Object.freeze((row.conflictDrivers ?? []).map((driver) => cleanString(driver)).filter(Boolean)),
    whyItMatters: cleanString(row.potentialRisk),
    // CORR4: explanation carries only content with independent meaning — the
    // canonical direction phrase or the raw friction assertion. It never falls
    // back to row.potentialRisk, which whyItMatters already carries; that
    // fallback produced byte-identical duplicate public sentences in one row.
    explanation: hasCanonicalPairCopy && String(row.sourceSignal ?? "").trim() && !isPendingFrictionText(row.sourceSignal)
      ? renderPublicTemplate(PUBLIC_COPY_TEMPLATES.resourceExplanation, {
        resource: cleanString(row.resource),
        conflict_direction_phrase: conflictDirectionPhrase(row.sourceSignal, expectedPair),
      })
      : (String(row.sourceSignal ?? "").trim() && !isPendingFrictionText(row.sourceSignal)
        ? cleanString(row.sourceSignal)
        : ""),
  }));
}

function timelinePhases(deliverable, narrative) {
  if (!hasCanonicalFrictionContent(deliverable)) return [];
  const anchors = (deliverable?.anchors ?? []).map((anchor) => (
    isPendingFrictionText(anchor?.text) ? null : anchor
  ));
  return [
    {
      phaseName: "Signal setup",
      timeWindow: TIMING_LOGIC.signalSetup,
      expectedFriction: publicFrictionText(anchors[0]?.text ?? fallbackPredictionText(deliverable, narrative)),
      observableSignal: publicFrictionText(anchors[0]?.text ?? "First visible mismatch in operating assumptions."),
      recommendedCheck: "Confirm whether the first signal appears before Day 30.",
    },
    {
      phaseName: "Observation window",
      timeWindow: TIMING_LOGIC.observationWindow,
      expectedFriction: publicFrictionText(anchors[1]?.text ?? "The same friction pattern repeats across planning, authority, information flow, or resource allocation."),
      observableSignal: publicFrictionText(anchors[1]?.text ?? "Repeated behavior across more than one operating forum."),
      recommendedCheck: "Review whether the friction repeats during Days 30-60.",
    },
    {
      phaseName: "Early checkpoint",
      timeWindow: TIMING_LOGIC.verificationDeadline,
      expectedFriction: cleanString("The Day 60 preview checkpoint should decide whether the concern is escalated into full engagement monitoring, revised, or lowered."),
      observableSignal: publicFrictionText(anchors[2]?.text ?? "A clear enough signal to decide whether deeper engagement is needed."),
      recommendedCheck: "Run a Day 60 early-checkpoint review against the structural watchpoint.",
    },
  ];
}

function recommendedActions(deliverable, doctrineClass) {
  if (isHomogeneousDeliverable(deliverable)) {
    // Homogeneous next step is the governed Screen 10b Block 6 basis (OD-RMP3-11/21):
    // Hierarchy Depth & Type Distribution Assessment. No unsourced per-resource
    // Protect-X controls are generated for homogeneous reports.
    const nextStep = deliverable?.nextStep;
    const alias = cleanString(deliverable?.acquirerAlias);
    const actions = [
      {
        actionTitle: `Run the ${nextStep?.name || "Hierarchy Depth & Type Distribution Assessment"}`,
        actionTiming: "Next step",
        actionOwner: "Deal sponsor",
        actionReason: publicFrictionText(
          `Two ${alias} organisations may share an operating logic and still produce a leadership clash if their internal type distributions differ markedly.`
        ),
        actionExpectedEffect: cleanString(nextStep?.description),
      },
      {
        actionTitle: "Run the Day 60 early-checkpoint review",
        actionTiming: TIMING_LOGIC.verificationDeadline,
        actionOwner: "Deal sponsor",
        actionReason: "The preview claim should not drift into an untested integration assumption.",
        actionExpectedEffect: "Creates a clear decision point for escalation, revision, or closure.",
      },
    ];
    return actions.map((action) => ({
      ...action,
      actionReason: publicFrictionText(action.actionReason),
      actionExpectedEffect: publicFrictionText(action.actionExpectedEffect),
    }));
  }

  const resource = resourceRows(deliverable)[0];
  const pairCopy = safeApprovedPairCopy(deliverable);
  const dealInsights = cleanArray(
    deliverable?.protocol?.dealInsights?.map((insight) => `${insight.title}: ${insight.text}`),
    [],
  );

  const firstResource = resource?.resourceName ?? "the highest-risk operating resource";
  // Referential integrity (RR-3 item 8): a control insight is attached only when it
  // names the same causal resource as the action title — never by list position.
  const insightFor = (resourceName) => dealInsights.find((insight) => {
    const name = cleanString(resourceName);
    return Boolean(name) && insight.toLowerCase().startsWith(name.toLowerCase());
  }) ?? "";
  const protectReason = (() => {
    const insight = insightFor(resource?.resourceName);
    if (insight) return publicFrictionText(insight);
    return branchAwareOverwriteRiskExplanation(doctrineClass, resource);
  })();

  const actions = [
    {
      actionTitle: `Protect ${firstResource}`,
      actionTiming: "Before Day 30",
      actionOwner: "Integration lead",
      actionReason: protectReason,
      actionExpectedEffect: "Preserves the target operating capability while the preview signal is tested.",
    },
    {
      actionTitle: "Run the Day 60 early-checkpoint review",
      actionTiming: TIMING_LOGIC.verificationDeadline,
      actionOwner: "Deal sponsor",
      actionReason: "The preview claim should not drift into an untested integration assumption.",
      actionExpectedEffect: "Creates a clear decision point for escalation, revision, or closure.",
    },
    {
      actionTitle: "Separate preservation from simplification",
      actionTiming: TIMING_LOGIC.observationWindow,
      actionOwner: "Operating integration owner",
      actionReason: pairCopy?.fp2Rationale ?? branchAwareOverwriteRiskExplanation(doctrineClass, resource),
      actionExpectedEffect: "Reduces overwrite risk while preserving deal-control options.",
    },
  ];

  return actions.map((action) => ({
    ...action,
    actionReason: publicFrictionText(action.actionReason),
    actionExpectedEffect: publicFrictionText(action.actionExpectedEffect),
  }));
}

function firstIntegrationControlMove(deliverable) {
  if (isHomogeneousDeliverable(deliverable)) {
    const nextStep = deliverable?.nextStep;
    return cleanString(`Next step: ${nextStep?.name || "Hierarchy Depth & Type Distribution Assessment"} — ${nextStep?.description || ""}`);
  }

  const resources = resourceRows(deliverable)
    .map((row) => row.resourceName)
    .filter(Boolean)
    .slice(0, 3);

  const signalText = resources.length
    ? `Track friction around ${resources.join(", ")} before deciding what to integrate, simplify, or preserve.`
    : "Track the preview signals before deciding what to integrate, simplify, or preserve.";

  return cleanString(`Freeze irreversible operating-model changes until Day 60. The immediate priority is to identify which target routines preserve value and which ones create governance risk. ${signalText}`);
}

function buildScenarioId(session, dealContext) {
  return compactId(session?.scenarioId ?? dealContext?.scenarioId ?? session?.sessionId);
}

function generatedAtValue(session, options) {
  return options.generatedAt
    ?? session?.reportMetadata?.generatedAt
    ?? session?.generatedAt
    ?? new Date().toISOString();
}

export function publicCompatibilityBand(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return "Preview band not available";
  if (value >= 80) return "HIGH";
  if (value >= 65) return "MODERATE-HIGH";
  if (value >= 50) return "MODERATE";
  if (value >= 35) return "MODERATE-LOW";
  return "HIGH RISK";
}

function verifiedNarrativeBySection(clientNarrative) {
  if (!clientNarrative || typeof clientNarrative !== "object" || Array.isArray(clientNarrative)) return null;
  const sections = clientNarrative.sections;
  if (!Array.isArray(sections) || sections.length !== CLIENT_NARRATIVE_SECTION_IDS.length) return null;
  const narrative = {};
  for (const [index, expectedSectionId] of CLIENT_NARRATIVE_SECTION_IDS.entries()) {
    const section = sections[index];
    if (!section || typeof section !== "object" || Array.isArray(section)) return null;
    if (section.sectionId !== expectedSectionId || typeof section.text !== "string" || !section.text.trim()) return null;
    narrative[expectedSectionId] = section.text;
  }
  return Object.freeze(narrative);
}

// LLM-NARRATIVE-1B (Owner Decision 3): narrative applicability is read only from the
// canonical accepted-result interpretationStatus. SELECTOR_BOUNDARY_EXPLANATION and
// ABSTAINED_INSUFFICIENT_EVIDENCE are the two lawful narrative-not-applicable states;
// any other (or absent) status is treated as narrative-applicable and fails closed on
// narrative absence.
const NARRATIVE_NOT_APPLICABLE_STATUSES = Object.freeze([
  "SELECTOR_BOUNDARY_EXPLANATION",
  "ABSTAINED_INSUFFICIENT_EVIDENCE",
]);

function narrativeApplicable(interpretationStatus) {
  return !NARRATIVE_NOT_APPLICABLE_STATUSES.includes(interpretationStatus);
}

const NARRATIVE_FALLBACK = Object.freeze({
  headline: "Post-close behavior risk preview",
  situation: "This brief summarizes the post-close behavior friction visible from the current diagnostic inputs.",
  implication: "Use this brief to decide what must be observed before the integration plan hardens.",
});

export function buildMergevuePublicReportModel(session = {}, options = {}) {
  const deliverable = options.deliverable ?? buildFinalDeliverable(session);
  const r1r2Agreement = options.r1r2Agreement ?? null;
  const crossSideEvidence = options.crossSideEvidence ?? null;
  const dealContext = session?.dealContext?.data ?? {};
  const scenarioId = buildScenarioId(session, dealContext);
  const generatedAt = generatedAtValue(session, options);
  const reportIdPrefix = scenarioId.startsWith("mergevue-") ? "" : "mergevue-";
  const reportId = compactId(`${reportIdPrefix}${scenarioId}-${generatedAt.slice(0, 10)}`);
  const acquirerEnvironment = environmentByCode(deliverable?.acquirerEnvironmentCode);
  const targetEnvironment = environmentByCode(deliverable?.targetEnvironmentCode);
  const acquirerName = cleanCompanyName(dealContext.acquirerName, "Acquirer");
  const targetName = cleanCompanyName(dealContext.targetName, "Target");
  const compatibilityScore = Number.isFinite(deliverable?.compatibilityScore)
    ? Number(deliverable.compatibilityScore)
    : null;
  const compatibilityBand = publicCompatibilityBand(compatibilityScore);
  const isHomogeneous = isHomogeneousDeliverable(deliverable);
  const narrativeRequired = narrativeApplicable(options.interpretationStatus);
  const narrative = verifiedNarrativeBySection(options.clientNarrative);
  // LLM-NARRATIVE-1B (Owner Decisions 1 and 3): the verified client narrative binds
  // homogeneous and heterogeneous reports alike; the homogeneous static screenCopy
  // prose and the legacy FINAL_DELIVERABLE_DATA.narratives are never narrative
  // authority for covered slots. Narrative-applicable states fail closed on
  // narrative absence; the two lawful narrative-not-applicable statuses keep the
  // existing deterministic report and receive no narrative fallback of any kind.
  if (narrativeRequired && narrative === null) return null;
  const friction = deliverable?.friction ?? {};
  const resources = resourceRows(deliverable);
  const pairCopy = safeApprovedPairCopy(deliverable);
  // One homogeneity identity (OD-RMP3-23): explicit upstream semantic mode only.
  const pairSourceClass = isHomogeneous
    ? "homogeneous"
    : deliverable?.screen === "screen-10"
      ? "heterogeneous"
      : "incomplete";
  const doctrineClass = pairSourceClass === "homogeneous"
    ? HOMOGENEOUS_DOCTRINE_CLASS
    : pairSourceClass === "heterogeneous" && Number.isFinite(compatibilityScore)
      ? (compatibilityScore >= 80 ? "concealed_conflict" : "collision")
      : "low_information";
  // OD-RR2-3: high-ECS heterogeneous pairs are routed through concealed-conflict copy.
  // The only physically approved concealed-conflict authority in the repository is the
  // two APPROVED_CONCEALED_CONFLICT_* constants in this file; no new concealed-conflict
  // copy is invented. Existing governed friction and the verified client narrative
  // carry every other analytical surface.
  const doctrineCopyReview = doctrineClass === "concealed_conflict"
    ? Object.freeze({
      required: false,
      reason: "Owner-approved concealed-conflict copy applied (OD-RR2-3): APPROVED_CONCEALED_CONFLICT_RISK_EXPLANATION and APPROVED_CONCEALED_CONFLICT_POST_CLOSE_FAILURE_MODE.",
      surfaces: Object.freeze(["resourceConflictMap", "collisionThesis", "recommendedActions"]),
    })
    : Object.freeze({ required: false, reason: "", surfaces: Object.freeze([]) });
  const consistencyLog = Object.freeze(canonicalConsistencyLog(deliverable));
  const frictionContentStatus = hasCanonicalFrictionContent(deliverable)
    ? Object.freeze({ available: true, degradedSurfaces: Object.freeze([]) })
    : Object.freeze({
      available: false,
      degradedSurfaces: Object.freeze(["collisionThesis", "sealedPredictions", "timelineOfExpectedFriction"]),
    });
  const evidenceCalibration = buildEvidenceCalibration(session, deliverable);
  const sourceBinding = Object.freeze({
    finalDeliverableScreen: cleanString(deliverable?.screen),
    finalDeliverableRoute: cleanString(deliverable?.route),
    finalDeliverableOutcomeKey: cleanString(deliverable?.outcomeKey),
    ...(isHomogeneous ? { pairMode: cleanString(deliverable?.pairMode) } : {}),
    acquirerEnvironmentCode: cleanString(deliverable?.acquirerEnvironmentCode),
    targetEnvironmentCode: cleanString(deliverable?.targetEnvironmentCode),
    ecsSource: Number.isFinite(Number(deliverable?.compatibilityScore)) ? Number(deliverable.compatibilityScore) : null,
    riskBandSource: cleanString(deliverable?.riskBand),
    compatibilityRangeSource: cleanString(deliverable?.compatibilityRange),
    narrativeSource: narrativeRequired ? "AgentInterpretationResult.clientNarrative" : "",
    frictionSource: Object.keys(friction).length ? "deliverable.friction" : "",
    resourceProfileSource: Object.freeze({
      source: isHomogeneous ? "deliverable.structuralResourceProfile" : "deliverable.resourceConflictProfile",
      resourcesScanned: isHomogeneous
        ? Number(deliverable?.structuralResourceProfile?.resourceCount) || resources.length
        : Number(deliverable?.resourceConflictProfile?.resourcesScanned) || resources.length,
    }),
    consistencyLog,
  });
  const leadResource = resources[0]?.resourceName ?? "operating system";
  const dealEconomicsReport = buildDealEconomicsReport(session, {
    baseEcsScore: compatibilityScore,
  });
  const hasDealEconomicsInputs = Boolean(dealEconomicsReport?.available);
  const publicEconomicLines = Array.isArray(dealEconomicsReport?.lines)
    ? dealEconomicsReport.lines
      .filter(Boolean)
      .filter((line) => !line.startsWith("Enterprise value / deal value provided:"))
      .map((line) => line.replace(/Total Risk Envelope/g, "Economic risk posture"))
    : [];
  const publicEnterpriseValueLabel = hasDealEconomicsInputs
    ? (dealEconomicsReport?.enterpriseValue?.line || "")
    : "";
  // OD-RR2-1: Economic Exposure triage is generic directional framing only. This public
  // preview produces no static per-deal severities, no posture value, no unexecuted
  // posture aggregation rule, and no fabricated deal-specific reason. Governed economic
  // methodology is deferred to the engagement tier.
  const economicTriageChannels = [
    {
      label: "Talent continuity",
      meaning: "Risk that deal-critical people disengage, slow down, or leave before the integration model stabilises.",
      testFirst: "Map critical role categories, role-level dependencies, retention exposure windows, and the first 90-day decision points that depend on them.",
    },
    {
      label: "Earn-out credibility",
      meaning: "Risk that behavioural friction makes performance milestones harder to deliver, putting contingent value and seller-management incentives under pressure.",
      testFirst: "Compare earn-out milestones with the operating routines and decision rights needed to hit them.",
    },
    {
      label: "Decision delay",
      meaning: "Risk that approvals, escalation paths, and authority conflicts slow value capture after close.",
      testFirst: "Identify decisions that must not wait for a full integration redesign.",
    },
    {
      label: "Knowledge continuity",
      meaning: "Risk that informal know-how, customer context, or execution memory stops moving through the combined organisation.",
      testFirst: "Identify critical knowledge-holder categories, handover routines, and early warning signs of information blockage.",
    },
  ];
  const economicChannelNote = "Exposure channels are generic integration-risk categories. This public preview assigns no per-deal severity, posture, or score to any channel; governed economic methodology is deferred to the engagement tier.";

  return {
    brand: { ...BRAND },
    metadata: {
      reportId,
      generatedAt,
      reportVersion: REPORT_VERSION,
      scenarioId,
      pairSourceClass,
      doctrineClass,
      doctrineCopyReview,
      frictionContentStatus,
      sourceBinding,
      source: {
        dealContext: "session.dealContext.data",
        finalDeliverable: "buildFinalDeliverable(session)",
        environments: "ENVIRONMENTS",
        publicCopy: "static Mergevue public adapter copy",
        adapterLogic: "derived safe public mapping",
      },
    },
    executiveDecisionSummary: {
      headline: cleanString(narrative?.headline ?? NARRATIVE_FALLBACK.headline),
      oneParagraphSummary: cleanString(narrative?.situation ?? NARRATIVE_FALLBACK.situation),
      decisionImplication: publicFrictionText(narrative?.implication ?? NARRATIVE_FALLBACK.implication),
      mainRisk: isHomogeneous
        ? publicFrictionText(fallbackPredictionText(deliverable, narrative))
        : publicFrictionText(!isPendingFrictionText(friction.fp1) ? friction.fp1 : `${leadResource} may become the first visible post-close friction point.`),
      recommendedAction: firstIntegrationControlMove(deliverable),
    },
    sealedPredictions: {
      statusTitle: "Structural Watchpoints",
      statusDescription: "This public preview is not a scored forecast ledger.",
      predictions: buildPredictions(deliverable, doctrineClass, narrative),
    },
    compatibilityScoreAndDealScenario: {
      acquirerName,
      targetName,
      dealType: dealTypeLabel(dealContext.dealType),
      enterpriseValueBand: publicEnterpriseValueLabel,
      dataQuality: scoreQualityLabel(session),
      compatibilityScore,
      compatibilityBand,
      compatibilityExplanation: isHomogeneous
        ? homogeneousCompatibilityExplanation(deliverable, compatibilityBand)
        : heterogeneousCompatibilityExplanation(deliverable, compatibilityBand),
      ...(isHomogeneous
        ? { withinEnvironmentDifferentiation: homogeneousDifferentiationSummary(deliverable) }
        : {}),
    },
    theTwoEnvironments: {
      acquirerEnvironmentName: cleanString(deliverable?.acquirerAlias ?? acquirerEnvironment?.alias),
      targetEnvironmentName: cleanString(deliverable?.targetAlias ?? targetEnvironment?.alias),
      acquirerEnvironmentCode: cleanString(deliverable?.acquirerEnvironmentCode),
      targetEnvironmentCode: cleanString(deliverable?.targetEnvironmentCode),
      acquirerEnvironmentDescription: cleanString(acquirerEnvironment?.shortDescription ?? acquirerEnvironment?.oneLineDefinition),
      targetEnvironmentDescription: cleanString(targetEnvironment?.shortDescription ?? targetEnvironment?.oneLineDefinition),
      acquirerBehaviorPattern: cleanString(acquirerEnvironment?.decisionMechanism ?? acquirerEnvironment?.authorityStructure),
      targetBehaviorPattern: cleanString(targetEnvironment?.decisionMechanism ?? targetEnvironment?.authorityStructure),
      acquirerOneLineDefinition: cleanString(acquirerEnvironment?.oneLineDefinition),
      targetOneLineDefinition: cleanString(targetEnvironment?.oneLineDefinition),
      acquirerAuthorityStructure: cleanString(acquirerEnvironment?.authorityStructure),
      targetAuthorityStructure: cleanString(targetEnvironment?.authorityStructure),
      acquirerInnovationStance: cleanString(acquirerEnvironment?.innovationStance),
      targetInnovationStance: cleanString(targetEnvironment?.innovationStance),
      acquirerEconomicFunction: cleanString(acquirerEnvironment?.economicFunction),
      targetEconomicFunction: cleanString(targetEnvironment?.economicFunction),
      acquirerResourceTarget: cleanString(acquirerEnvironment?.resourceTarget),
      targetResourceTarget: cleanString(targetEnvironment?.resourceTarget),
      acquirerSystemicRole: cleanString(acquirerEnvironment?.systemicRole),
      targetSystemicRole: cleanString(targetEnvironment?.systemicRole),
    },
    collisionThesis: {
      collisionHeadline: cleanString(narrative?.headline ?? "Operating systems may collide after close"),
      coreMismatch: pairCopy?.coreMismatch ?? "",
      collisionSummary: isHomogeneous
        ? publicFrictionText(narrative?.situation ?? "The collision thesis is based on the current environment-pair result.")
        : publicFrictionText(!isPendingFrictionText(friction.fp1) ? (friction.fp1 ?? narrative?.situation) : (narrative?.situation ?? "The collision thesis is based on the current environment-pair result.")),
      primaryTension: isHomogeneous
        ? cleanString(homogeneousDifferentiationSummary(deliverable)?.summary ?? HOMOGENEOUS_STRUCTURAL_RESOURCE_QUALIFIER)
        : pairCopy?.conflictSummary ?? cleanString(!isPendingFrictionText(friction.primaryConflictedResources) ? (friction.primaryConflictedResources ?? `${leadResource} is the primary tension to monitor.`) : `${leadResource} is the primary tension to monitor.`),
      whyItMatters: publicFrictionText(narrative?.implication ?? "The risk matters because early operating assumptions can become permanent integration defaults."),
      postCloseFailureMode: branchAwarePostCloseFailureMode(doctrineClass, narrative, isHomogeneous),
    },
    resourceConflictMap: {
      overwriteRiskExplanation: branchAwareOverwriteRiskExplanation(doctrineClass, undefined, isHomogeneous),
      resources,
      // Existing governed resource-analysis conclusion copy from the deliverable
      // (restored RR-3 item 1): the verified 17-resource scan summary and the
      // categorical priority statement. Never re-authored in the renderer.
      priorityConclusion: isHomogeneous
        ? Object.freeze([])
        // publicFrictionText (not cleanString) so the governed conclusion copy also
        // receives the RR3-CORR1 priority-vocabulary mapping.
        : Object.freeze((deliverable?.resourceConflictProfile?.conclusion ?? []).map((line) => publicFrictionText(line)).filter(Boolean)),
      ...(isHomogeneous
        ? {
          structuralCaveats: Object.freeze([
            ...(deliverable?.structuralResourceProfile?.alignedSuppression?.applies
              ? [cleanString(deliverable.structuralResourceProfile.alignedSuppression.caveat)]
              : []),
            ...(deliverable?.structuralResourceProfile?.b25Guardrail?.applies
              ? [cleanString(deliverable.structuralResourceProfile.b25Guardrail.note)]
              : []),
          ]),
          guardrails: Object.freeze({
            b25: freezePlainObject(deliverable?.structuralResourceProfile?.b25Guardrail),
            alignedSuppression: freezePlainObject(deliverable?.structuralResourceProfile?.alignedSuppression),
          }),
        }
        : {}),
    },
    timelineOfExpectedFriction: {
      timingLogic: { ...TIMING_LOGIC },
      phases: timelinePhases(deliverable, narrative),
    },
    economicRiskTranslation: {
      enterpriseValueBand: publicEnterpriseValueLabel,
      valuationDisclaimer: "Directional triage only. Not a valuation or loss estimate.",
      economicTriageJudgement: pairSourceClass === "homogeneous"
      ? "Directional triage only. The main risk is integration drag. Observe speed, decision quality, and knowledge continuity without asserting target logic compression."
      : "Directional triage only. The main economic risk is not immediate value destruction. It is integration drag: the deal may lose speed, decision quality, or knowledge continuity if the target operating logic is compressed too quickly.",
      economicChannelNote,
      economicTriageChannels,
      evUse: "Deal value is used only to understand materiality. It is not scored in this public preview and does not produce a valuation-impact estimate.",
      // RR3-F07: no deal-specific likelihood model exists. Generic monitoring framing only.
      whatThisPreviewCanSay: "These channels provide a generic management framework for where integration-related economic effects may be monitored; the current report does not assign deal-specific likelihood or severity.",
      whatThisPreviewCannotSay: "This is not a valuation, loss estimate, impairment opinion, damages calculation, or investment-committee financial model.",
      requiredForQuantifiedModelling: "EV, earn-out terms, retention costs, leadership role map, integration milestones, role criticality, and post-close governance evidence.",
      engagementTierRequirement: "Quantified modelling requires deal-room economics, role-level evidence, integration milestones, and analyst review.",
      economicRiskLines: [],
    },
    recommendedActions: recommendedActions(deliverable, doctrineClass),
    evidenceBasisAndLimits: {
      dataQualityLevel: calibratedDataQualityLabel(session, evidenceCalibration),
      inputCompleteness: calibratedInputCompletenessLabel(session, deliverable, evidenceCalibration),
      knownLimits: "Public preview output uses environment-level signals and does not verify person-specific role fit, leadership hierarchy, or documentary evidence depth.",
      methodLimitations: "This brief can identify likely behavior friction and observation windows; it cannot replace engagement-tier diligence or analyst review.",
      whatThisReportCanSay: calibratedCanSayLabel(evidenceCalibration, deliverable),
      whatThisReportCannotSay: "It cannot state a valuation, a quantified loss estimate, a final integration plan, or a verified role-level exposure conclusion.",
      integrity: buildEvidenceIntegrity(session, deliverable, evidenceCalibration, r1r2Agreement, crossSideEvidence),
      calibration: evidenceCalibration,
    },
whatTheFullEngagementAdds: {
  benefits: [
    "The paid workflow is designed to reduce guesswork by decomposing ECS drivers, reviewing environment coding against available artifacts, and converting watchpoints into role-level integration controls.",
    "1. ARTIFACT-REVIEWED ENVIRONMENT CODING. The paid workflow reviews operating-environment coding against available artifacts, structure charts, governance notes, and documentary evidence where inputs are sufficient.",
    "2. Role-Level Control Design. What the paid workflow is designed to produce, where inputs are sufficient: engagement-tier planning ranges for value protection, earn-out exposure, and talent-continuity envelopes, paired with Day 30/60/90 governance controls.",
    "This is decision-support output. It does not make employment, retention, advancement, dismissal, disciplinary, compensation, or workforce decisions. Role-level findings require analyst review, client evidence, internal governance, and counsel review before action.",
    "3. SEALED FORECAST LEDGER. The paid workflow is designed to log role-level, pre-outcome forecast claims before post-close events are known. These claims are reviewed at defined windows such as Day 30, Day 90, Day 180, and Day 365. The track record strengthens as sealed predictions mature across transactions.",
  ],
  cta: "Next step: scope a single-deal pilot to decompose ECS drivers, review the operating-environment coding against available artifacts, and convert watchpoints into role-level integration controls.",
  contactEmail: BRAND.contactEmail,
},
    auditFooter: {
      reportId,
      generatedAt,
      reportVersion: REPORT_VERSION,
      scenarioId,
      brand: BRAND.name,
      contactEmail: BRAND.contactEmail,
      publicUrlPattern: "https://mergevue.com/reports/:reportId",
      trackRecordUrl: "https://mergevue.com/track-record",
    },
  };
}

function textValue(value) {
  if (value === null || value === undefined) return "Not available";
  return String(value);
}

function line(label, value) {
  return `${label}: ${textValue(value)}`;
}

function predictionLines(prediction, index) {
  return [
    `Prediction ${index + 1}: ${prediction.predictionTitle}`,
    line("Window", prediction.predictionWindow),
    line("Claim", prediction.predictionClaim),
    line("Observable signal", prediction.observableSignal),
    line("Verification method", prediction.verificationMethod),
  ];
}

function resourceLines(resource, index) {
  return [
    `Resource ${index + 1}: ${resource.resourceName}`,
    line("Category", resource.resourceCategory),
    line("Priority (categorical order)", resource.priorityOrder),
    line("Conflict band (categorical)", resource.conflictBand),
    line("Acquirer Net Effect", resource.acquirerNetEffect),
    line("Target Net Effect", resource.targetNetEffect),
    line("Acquirer ERI tier", resource.acquirerEriTier),
    line("Target ERI tier", resource.targetEriTier),
    line("Conflict drivers", (resource.conflictDrivers ?? []).join(", ")),
    ...(String(resource.explanation ?? "").trim()
      ? [line("Explanation", resource.explanation)]
      : []),
    line("Why it matters", resource.whyItMatters),
  ];
}

// Homogeneous reports render structural resource state, never contestation intensity.
function structuralResourceLines(resource, index) {
  return [
    `Resource ${index + 1}: ${resource.resourceName}`,
    line("Category", resource.resourceCategory),
    line("Shared structural state", resource.sharedStateLabel),
    line("Canonical direction", resource.direction),
    line("ERI tier", resource.eriTier),
  ];
}

function phaseLines(phase, index) {
  return [
    `Phase ${index + 1}: ${phase.phaseName}`,
    line("Time window", phase.timeWindow),
    line("Expected friction", phase.expectedFriction),
    line("Observable signal", phase.observableSignal),
    line("Recommended check", phase.recommendedCheck),
  ];
}

function actionLines(action, index) {
  return [
    `Action ${index + 1}: ${action.actionTitle}`,
    line("Timing", action.actionTiming),
    line("Owner", action.actionOwner),
    line("Reason", action.actionReason),
    line("Expected effect", action.actionExpectedEffect),
  ];
}

function pdfSection(title, lines) {
  return Object.freeze({
    title,
    lines: Object.freeze(lines.map(textValue).filter(Boolean)),
  });
}

export function buildMergevuePublicReportPdfTextModel(report) {
  const executive = report.executiveDecisionSummary;
  const sealed = report.sealedPredictions;
  const scenario = report.compatibilityScoreAndDealScenario;
  const environments = report.theTwoEnvironments;
  const collision = report.collisionThesis;
  const resourceMap = report.resourceConflictMap;
  const timeline = report.timelineOfExpectedFriction;
  const economics = report.economicRiskTranslation;
  const evidence = report.evidenceBasisAndLimits;
  const engagement = report.whatTheFullEngagementAdds;
  const footer = report.auditFooter;
  const isHomogeneous = report.metadata?.pairSourceClass === "homogeneous";

  return Object.freeze({
    fileName: MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
    cover: Object.freeze([
      report.brand.name,
      `${report.brand.product} / ${report.brand.reportType}`,
      report.brand.contactEmail,
      `${scenario.acquirerName} acquiring ${scenario.targetName}`,
      executive.headline,
      executive.decisionImplication,
    ]),
    sections: Object.freeze([
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[0], [
        line("Headline", executive.headline),
        line("Summary", executive.oneParagraphSummary),
        line("Decision implication", executive.decisionImplication),
        line("Main risk", executive.mainRisk),
        line("Recommended action", executive.recommendedAction),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[1], [
        line("Status title", sealed.statusTitle),
        line("Status description", sealed.statusDescription),
        ...sealed.predictions.flatMap(predictionLines),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[2], [
        line("Acquirer", scenario.acquirerName),
        line("Target", scenario.targetName),
        line("Deal type", scenario.dealType),
        line("Enterprise value band", scenario.enterpriseValueBand),
        line("Data quality", scenario.dataQuality),
        line("Compatibility score", scenario.compatibilityScore),
        line("Compatibility band", scenario.compatibilityBand),
        line("Compatibility explanation", scenario.compatibilityExplanation),
        ...(scenario.withinEnvironmentDifferentiation
          ? [line("Within-environment structural differentiation", scenario.withinEnvironmentDifferentiation.summary)]
          : []),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[3], [
        line("Acquirer environment", environments.acquirerEnvironmentName),
        line("Acquirer environment code", environments.acquirerEnvironmentCode),
        line("Acquirer environment description", environments.acquirerEnvironmentDescription),
        line("Acquirer behavior pattern", environments.acquirerBehaviorPattern),
        line("Target environment", environments.targetEnvironmentName),
        line("Target environment code", environments.targetEnvironmentCode),
        line("Target environment description", environments.targetEnvironmentDescription),
        line("Target behavior pattern", environments.targetBehaviorPattern),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[4], [
        line("Collision headline", collision.collisionHeadline),
        line("Collision summary", collision.collisionSummary),
        line("Primary tension", collision.primaryTension),
        line("Why it matters", collision.whyItMatters),
        line("Post-close failure mode", collision.postCloseFailureMode),
      ]),
      pdfSection(isHomogeneous ? "Structural Resource Profile" : MERGEVUE_PUBLIC_REPORT_BLOCKS[5], [
        resourceMap.overwriteRiskExplanation,
        ...(isHomogeneous ? (resourceMap.structuralCaveats ?? []) : []),
        ...(isHomogeneous ? [] : (resourceMap.priorityConclusion ?? [])),
        ...resourceMap.resources.flatMap(isHomogeneous ? structuralResourceLines : resourceLines),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[6], [
        line("Signal setup", timeline.timingLogic.signalSetup),
        line("Observation window", timeline.timingLogic.observationWindow),
        line("Early checkpoint", timeline.timingLogic.verificationDeadline),
        ...timeline.phases.flatMap(phaseLines),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[7], [
        economics.enterpriseValueBand,
        economics.valuationDisclaimer,
        economics.economicChannelNote,
        economics.engagementTierRequirement,
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[8], report.recommendedActions.flatMap(actionLines)),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[9], [
        line("Data quality level", evidence.dataQualityLevel),
        line("Input completeness", evidence.inputCompleteness),
        ...(evidence.integrity?.rows ?? []).map((row) => line(row.label, row.value)),
        line("Known limits", evidence.knownLimits),
        line("Method limitations", evidence.methodLimitations),
        line("What this report can say", evidence.whatThisReportCanSay),
        line("What this report cannot say", evidence.whatThisReportCannotSay),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[10], [
        ...engagement.benefits.map((benefit, index) => `Benefit ${index + 1}: ${benefit}`),
        line("CTA", engagement.cta),
        line("Contact email", engagement.contactEmail),
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[11], [
        line("Report ID", footer.reportId),
        line("Generated at", footer.generatedAt),
        line("Report version", footer.reportVersion),
        line("Scenario ID", footer.scenarioId),
        line("Brand", footer.brand),
        line("Contact email", footer.contactEmail),
        line("Public URL pattern", footer.publicUrlPattern),
        line("Track record URL", footer.trackRecordUrl),
      ]),
    ]),
  });
}

export function buildMergevuePublicReportEmailCopy(report) {
  const brand = report.brand;
  const scenario = report.compatibilityScoreAndDealScenario;
  const sealed = report.sealedPredictions;
  const economics = report.economicRiskTranslation;
  const evidence = report.evidenceBasisAndLimits;
  const engagement = report.whatTheFullEngagementAdds;

  // RR3-CORR1-IV-03 (CORR2): compact evidence-integrity summary from the same
  // authoritative integrity source as screen/PDF. Aggregate-only, no raw
  // evidence; NOT ASSESSED is carried verbatim (never invented certainty).
  const integrityRows = Array.isArray(evidence.integrity?.rows) ? evidence.integrity.rows : [];
  const integrityLine = (label) => {
    const row = integrityRows.find((entry) => entry.label === label);
    return row && row.value ? `${label}: ${row.value}` : "";
  };
  const qualification = evidence.integrity?.qualification;
  const integrityLines = [
    integrityLine("Verification participation"),
    integrityLine("R1/R2 verification agreement"),
    integrityLine("Cross-side material agreement / divergence"),
    qualification?.status === "provisional" ? `Provisional state: Provisional — ${qualification.basis}` : "",
  ].filter(Boolean);

  return Object.freeze({
    subject: MERGEVUE_PUBLIC_REPORT_EMAIL_SUBJECT,
    attachmentFileName: MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
    previewText: `${brand.name} ${brand.reportType}: ${brand.product}`,
    textLines: Object.freeze([
      `${brand.name} ${brand.reportType}`,
      brand.product,
      `Contact: ${brand.contactEmail}`,
      "",
      `Scenario: ${scenario.acquirerName} acquiring ${scenario.targetName}`,
      `Deal type: ${scenario.dealType}`,
      `Compatibility: ${textValue(scenario.compatibilityScore)} / ${scenario.compatibilityBand}`,
      "",
      `${sealed.statusTitle}: ${sealed.statusDescription}`,
      economics.enterpriseValueBand,
      economics.valuationDisclaimer,
      economics.engagementTierRequirement,
      "",
      ...(integrityLines.length ? ["Evidence integrity:", ...integrityLines] : []),
      `Evidence basis: ${evidence.dataQualityLevel}`,
      `Engagement contact: ${engagement.contactEmail}`,
    ]),
  });
}

export default buildMergevuePublicReportModel;
