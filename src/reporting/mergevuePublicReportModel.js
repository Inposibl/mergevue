import { ENVIRONMENTS } from "../data/environments.js";
import {
  buildFinalDeliverable,
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
const APPROVED_CONCEALED_CONFLICT_RISK_EXPLANATION = "The main risk is false alignment: the shared operating environment can make integration look settled while duplicated authority, routine overwrite, or control expectations become visible only after close.";
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

function conflictDirectionParts(rawPattern) {
  const value = String(rawPattern ?? "").trim();
  const match = value.match(/\(([+~\-\u2212])[^()]{0,100}\s+vs\s+([+~\-\u2212])/iu);
  if (!match) throw new Error(`Unknown public conflict direction pattern: ${value || "<empty>"}`);
  const key = `${normalizedConflictSign(match[1])}|${normalizedConflictSign(match[2])}`;
  const direction = PUBLIC_CONFLICT_DIRECTION_COPY[key];
  if (!direction) throw new Error(`Unknown public conflict direction pattern: ${match[0]}`);
  return Object.freeze({ ...direction, key });
}

function conflictDirectionPhrase(rawPattern, format = "long") {
  const direction = conflictDirectionParts(rawPattern);
  if (!direction.target) return direction.acquirer;
  if (format === "short") return `${direction.acquirer}, ${direction.target}`;
  return `${direction.acquirer} ${direction.connector} ${direction.target}`;
}

function conflictCausalClause(rawPattern) {
  const direction = conflictDirectionParts(rawPattern);
  if (direction.class === "direct" || direction.class === "partial") {
    return ", which makes it the most likely early contestation zone.";
  }
  if (normalizedConflictSign(rawPattern.match(/\(([+~\-\u2212])/u)?.[1]) === "+") {
    return " — both organisations actively rely on it, which makes ownership of it the most likely early contestation point.";
  }
  return " — neither organisation actively manages it, which makes it the most likely blind spot once integration load arrives.";
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
  return canonicalConflictRows(deliverable).flatMap((row) => {
    if (!String(row.sourceSignal ?? "").trim() || isPendingFrictionText(row.sourceSignal)) return [];
    const frictionReading = conflictDirectionParts(row.sourceSignal).key;
    const profileReading = `${normalizedConflictSign(row.acquirerImpact?.effect)}|${normalizedConflictSign(row.targetImpact?.effect)}`;
    if (frictionReading === profileReading) return [];
    return [Object.freeze({
      pair: publicPairKey(deliverable),
      resource: String(row.resource ?? "").trim(),
      frictionReading,
      profileReading,
      frictionSource: "NewLogic 03.05.2026/ST_Friction_Point_Lookup_updated.xlsx",
      profileSource: "src/data/environments.js resource impact matrices",
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
  const commonTokens = {
    resource: conflict.resource,
    top_conflict_resource: conflict.resource,
    conflict_direction_phrase: conflictDirectionPhrase(conflict.sourceSignal),
  };
  return Object.freeze({
    coreMismatch: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.coreMismatch, {
      ...commonTokens,
      acquirer_authority_phrase: acquirerAuthorityPhrase,
      target_authority_phrase: targetAuthorityPhrase,
      conflict_direction_phrase: conflictDirectionPhrase(conflict.sourceSignal, "short"),
    }),
    conflictSummary: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.conflictSummary, commonTokens),
    fp2Rationale: renderPublicTemplate(PUBLIC_COPY_TEMPLATES.fp2Rationale, {
      ...commonTokens,
      conflict_causal_clause: conflictCausalClause(conflict.sourceSignal),
      window: TIMING_LOGIC.observationWindow.replace("-", "\u2013"),
      acquirer_env: environmentTemplateToken(deliverable?.acquirerAlias),
      target_env: environmentTemplateToken(deliverable?.targetAlias),
    }),
  });
}

function branchAwareOverwriteRiskExplanation(doctrineClass, resource) {
  if (doctrineClass === "concealed_conflict") {
    return APPROVED_CONCEALED_CONFLICT_RISK_EXPLANATION;
  }

  return cleanString(resource?.explanation ?? APPROVED_OVERWRITE_RISK_EXPLANATION);
}
const APPROVED_CONCEALED_CONFLICT_POST_CLOSE_FAILURE_MODE =
  "The shared operating environment can make post-close alignment look stronger than it is. The main failure mode is delayed control friction: duplicated authority, routine overwrite, or unclear preservation choices become visible only after integration decisions begin.";

function branchAwarePostCloseFailureMode(doctrineClass, narrative) {
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

function dealTypeLabel(value) {
  if (value === "competitor_absorption" || value === "platform_acquisition" || value === "other_integration_sensitive") {
    return APPROVED_DEAL_TYPE;
  }
  return cleanString(DEAL_TYPE_LABELS[value] ?? value ?? "Deal type not specified");
}

function fallbackPredictionText(deliverable) {
  if (deliverable?.narrative?.prediction) return deliverable.narrative.prediction;
  if (deliverable?.friction?.earlyWarningSignal && !isPendingFrictionText(deliverable.friction.earlyWarningSignal)) return deliverable.friction.earlyWarningSignal;
  if (deliverable?.anchors?.[0]?.text && !isPendingFrictionText(deliverable.anchors[0].text)) return deliverable.anchors[0].text;
  return "Monitor whether the expected integration friction appears during the preview window.";
}

function clientFacingPredictionText(text, index) {
  const value = cleanString(text);
  if (!value) return "";
  const lower = value.toLowerCase();
  const looksTheoretical = lower.includes("ethics-mechanism")
    || lower.includes("degradation path")
    || lower.includes("began as")
    || lower.includes("evolved when")
    || lower.includes("ethical constraints")
    || lower.includes("combined entity may slide");

  if (index === 2 && looksTheoretical) {
    return "Authority norms may harden under integration pressure. The target environment uses fast unilateral control, selective rule enforcement, and visible dominance to keep execution moving. The acquirer environment depends on evidence, accountability, and documented decision logic. By Day 60, the key test is whether integration pressure makes the combined team more disciplined or simply more forceful. If speed, pressure, or enforcement starts replacing documented reasoning, the acquirer is not absorbing the target's operating logic; it is being pulled toward it.";
  }

  return publicFrictionText(value);
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
    [/\bbelief extraction\b/gi, "belief-based retention pressure"],
    [/\bextraction pressure\b/gi, "value-capture pressure"],
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

function buildPredictions(deliverable, doctrineClass) {
  if (!hasCanonicalFrictionContent(deliverable)) return [];
  const anchors = (deliverable?.anchors ?? []).map((anchor) => (
    isPendingFrictionText(anchor?.text) ? null : anchor
  ));
  const actions = recommendedActions(deliverable, doctrineClass);
  const actionCopy = (index, fallback) => {
    const action = actions[index];
    if (!action) return fallback;
    return cleanString(`${action.actionTitle}. ${action.actionExpectedEffect} ${action.actionReason}`);
  };

  return [
    {
      predictionTitle: "Signal setup",
      predictionWindow: TIMING_LOGIC.signalSetup,
      predictionClaim: clientFacingPredictionText("Within Day 0–30: review whether mission-linked communication forums, decision meetings, or governance routines begin using acquirer-side authority signals, or whether acquirer-side management forums adopt target-side mission language. The direction of language adoption indicates which integration mechanism is becoming dominant.", 0),
      observableSignal: clientFacingPredictionText(anchors[0]?.text ?? fallbackPredictionText(deliverable), 0),
      verificationMethod: "Review Day 0–30 communication-forum notes, decision-meeting records, governance routines, management forum language, decision logs, and examples of acquirer-side authority signals or target-side mission language moving across the integration boundary.",
      recommendedAction: actionCopy(0, "Protect the highest-risk operating resource before irreversible integration changes begin."),
    },
    {
      predictionTitle: "Observation window",
      predictionWindow: TIMING_LOGIC.observationWindow,
      predictionClaim: clientFacingPredictionText("During Days 30–60: review whether mission-linked authority loses decision visibility, or whether decision rights move into acquirer-controlled enforcement routines before the target’s trust-preserving routines are understood.", 1),
      observableSignal: clientFacingPredictionText(anchors[1]?.text ?? "Repeated friction in planning, authority, information flow, or resource allocation.", 1),
      verificationMethod: "Review Days 30–60 operating meeting notes, escalation records, handoff documents, decision-rights updates, planning-cycle changes, and examples where trust-preserving routines are bypassed before their value is understood.",
      recommendedAction: actionCopy(2, "Separate preservation from simplification while the repeated friction pattern is tested."),
    },
    {
      predictionTitle: "Early checkpoint",
      predictionWindow: TIMING_LOGIC.verificationDeadline,
      predictionClaim: clientFacingPredictionText("Review Day 60 evidence on retention exposure, delivery confidence, knowledge continuity, operating rhythm, knowledge-transfer logs, early departures or disengagement signals, and whether systematised knowledge is becoming harder to preserve under integration pressure.", 2),
      observableSignal: clientFacingPredictionText("Day 60 is the escalation checkpoint. If retention exposure, delivery confidence, knowledge continuity, or operating rhythm show early stress, the preview should convert into the paid workflow for ECS decomposition, artifact review, and role-level control design.", 2),
      verificationMethod: "Use the Day 60 review to decide whether early retention, delivery-confidence, knowledge-continuity, or operating-rhythm signals require escalation into the paid workflow.",
      recommendedAction: actionCopy(1, "Run the Day 60 early-checkpoint review and decide whether the risk should be escalated into full engagement monitoring, revised, or lowered."),
    },
  ];
}
function resourceRows(deliverable) {
  const profile = deliverable?.resourceConflictProfile;
  const candidateRows = profile?.highProbabilityConflicts?.length ? profile.highProbabilityConflicts : profile?.allResources ?? [];
  const rows = [
    ...candidateRows.filter((row) => String(row.sourceSignal ?? "").trim()),
    ...candidateRows.filter((row) => !String(row.sourceSignal ?? "").trim()),
  ].slice(0, 5);

  const hasCanonicalPairCopy = Boolean(safeApprovedPairCopy(deliverable));
  return rows.map((row) => ({
    resourceName: cleanString(row.resource),
    resourceCategory: cleanString(row.resourceTypeLabel ?? row.resourceType),
    conflictIntensity: Number.isFinite(row.environmentInteractionScore)
      ? Math.max(0, Math.min(100, 100 - Math.round(row.environmentInteractionScore)))
      : null,
    conflictBand: cleanString(row.probability ?? "Monitor"),
    direction: cleanString(`${row.acquirerImpact?.label ?? "Acquirer"} / ${row.targetImpact?.label ?? "Target"}`),
    explanation: hasCanonicalPairCopy && String(row.sourceSignal ?? "").trim() && !isPendingFrictionText(row.sourceSignal)
      ? renderPublicTemplate(PUBLIC_COPY_TEMPLATES.resourceExplanation, {
        resource: cleanString(row.resource),
        conflict_direction_phrase: conflictDirectionPhrase(row.sourceSignal),
      })
      : cleanString((!isPendingFrictionText(row.sourceSignal) && row.sourceSignal) || row.potentialRisk || "Monitor this resource for overwrite or underuse after close."),
  }));
}

function timelinePhases(deliverable) {
  if (!hasCanonicalFrictionContent(deliverable)) return [];
  const anchors = (deliverable?.anchors ?? []).map((anchor) => (
    isPendingFrictionText(anchor?.text) ? null : anchor
  ));
  return [
    {
      phaseName: "Signal setup",
      timeWindow: TIMING_LOGIC.signalSetup,
      expectedFriction: publicFrictionText(anchors[0]?.text ?? fallbackPredictionText(deliverable)),
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
  const resource = resourceRows(deliverable)[0];
  const pairCopy = safeApprovedPairCopy(deliverable);
  const dealInsights = cleanArray(
    deliverable?.protocol?.dealInsights?.map((insight) => `${insight.title}: ${insight.text}`),
    [],
  ).slice(0, 2);

  const firstResource = resource?.resourceName ?? "the highest-risk operating resource";
  const actions = [
    {
      actionTitle: `Protect ${firstResource}`,
      actionTiming: "Before Day 30",
      actionOwner: "Integration lead",
      actionReason: branchAwareOverwriteRiskExplanation(doctrineClass, resource),
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

  return actions.map((action, index) => ({
    ...action,
    actionReason:
      doctrineClass === "concealed_conflict"
        ? publicFrictionText(action.actionReason)
        : publicFrictionText(dealInsights[index] ?? action.actionReason),
    actionExpectedEffect: publicFrictionText(action.actionExpectedEffect),
  }));
}

function firstIntegrationControlMove(deliverable) {
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

export function buildMergevuePublicReportModel(session = {}, options = {}) {
  const deliverable = options.deliverable ?? buildFinalDeliverable(session);
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
  const narrative = deliverable?.narrative ?? {};
  const friction = deliverable?.friction ?? {};
  const resources = resourceRows(deliverable);
  const pairCopy = safeApprovedPairCopy(deliverable);
  const pairSourceClass = deliverable?.screen === "screen-10b" || deliverable?.outcomeKey === "homogeneous" || (deliverable?.acquirerEnvironmentCode && deliverable.acquirerEnvironmentCode === deliverable?.targetEnvironmentCode)
    ? "homogeneous"
    : deliverable?.screen === "screen-10"
      ? "heterogeneous"
      : "incomplete";
  const doctrineClass = pairSourceClass === "homogeneous"
    ? "concealed_conflict"
    : pairSourceClass === "heterogeneous" && Number.isFinite(compatibilityScore)
      ? (compatibilityScore >= 80 ? "concealed_conflict" : "collision")
      : "low_information";
  const copyDoctrineClass = pairSourceClass === "homogeneous"
    ? "concealed_conflict"
    : pairSourceClass === "heterogeneous"
      ? "collision"
      : "low_information";
  const doctrineCopyReview = doctrineClass === "concealed_conflict" && copyDoctrineClass !== doctrineClass
    ? Object.freeze({
      required: true,
      reason: "Owner-approved concealed-conflict copy for heterogeneous high-ECS pairs is pending.",
      surfaces: Object.freeze(["executiveDecisionSummary", "collisionThesis", "sealedPredictions", "economicRiskTranslation"]),
    })
    : Object.freeze({ required: false, reason: "", surfaces: Object.freeze([]) });
  const consistencyLog = Object.freeze(canonicalConsistencyLog(deliverable));
  const frictionContentStatus = hasCanonicalFrictionContent(deliverable)
    ? Object.freeze({ available: true, degradedSurfaces: Object.freeze([]) })
    : Object.freeze({
      available: false,
      degradedSurfaces: Object.freeze(["collisionThesis", "sealedPredictions", "timelineOfExpectedFriction"]),
    });
  const sourceBinding = Object.freeze({
    finalDeliverableScreen: cleanString(deliverable?.screen),
    finalDeliverableRoute: cleanString(deliverable?.route),
    finalDeliverableOutcomeKey: cleanString(deliverable?.outcomeKey),
    acquirerEnvironmentCode: cleanString(deliverable?.acquirerEnvironmentCode),
    targetEnvironmentCode: cleanString(deliverable?.targetEnvironmentCode),
    ecsSource: Number.isFinite(Number(deliverable?.compatibilityScore)) ? Number(deliverable.compatibilityScore) : null,
    riskBandSource: cleanString(deliverable?.riskBand),
    compatibilityRangeSource: cleanString(deliverable?.compatibilityRange),
    narrativeSource: Object.keys(narrative).length ? "deliverable.narrative" : "",
    frictionSource: Object.keys(friction).length ? "deliverable.friction" : "",
    resourceProfileSource: Object.freeze({
      source: "deliverable.resourceConflictProfile",
      resourcesScanned: Number(deliverable?.resourceConflictProfile?.resourcesScanned) || resources.length,
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
  const economicTriageChannels = [
    {
      label: "Talent continuity",
      severity: "High",
      meaning: "Risk that deal-critical people disengage, slow down, or leave before the integration model stabilises.",
      testFirst: "Map critical role categories, role-level dependencies, retention exposure windows, and the first 90-day decision points that depend on them.",
    },
    {
      label: "Earn-out credibility",
      severity: "Medium",
      meaning: "Risk that behavioural friction makes performance milestones harder to deliver, putting contingent value and seller-management incentives under pressure.",
      testFirst: "Compare earn-out milestones with the operating routines and decision rights needed to hit them.",
    },
    {
      label: "Decision delay",
      severity: "Medium",
      meaning: "Risk that approvals, escalation paths, and authority conflicts slow value capture after close.",
      testFirst: "Identify decisions that must not wait for a full integration redesign.",
    },
    {
      label: "Knowledge continuity",
      severity: "Medium",
      meaning: "Risk that informal know-how, customer context, or execution memory stops moving through the combined organisation.",
      testFirst: "Identify critical knowledge-holder categories, handover routines, and early warning signs of information blockage.",
    },
  ];
  const economicTriagePosture = "High";
  const economicTriageReason = "This is High because talent continuity is already the most exposed channel: if critical people slow down, disengage, or leave, speed, knowledge transfer, and earn-out confidence become harder to protect.";

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
      headline: cleanString(narrative.headline ?? deliverable?.headline ?? "Post-close behavior risk preview"),
      oneParagraphSummary: cleanString(narrative.situation ?? deliverable?.body ?? "This brief summarizes the most likely post-close behavior friction visible from the current diagnostic inputs."),
      decisionImplication: publicFrictionText(narrative.implication ?? "Use this brief to decide what must be observed before the integration plan hardens."),
      mainRisk: publicFrictionText(!isPendingFrictionText(friction.fp1) ? friction.fp1 : `${leadResource} may become the first visible post-close friction point.`),
      recommendedAction: firstIntegrationControlMove(deliverable),
    },
    sealedPredictions: {
      statusTitle: "Structural Watchpoints",
      statusDescription: "This public preview is not a scored forecast ledger.",
      predictions: buildPredictions(deliverable, copyDoctrineClass),
    },
    compatibilityScoreAndDealScenario: {
      acquirerName,
      targetName,
      dealType: dealTypeLabel(dealContext.dealType),
      enterpriseValueBand: publicEnterpriseValueLabel,
      dataQuality: scoreQualityLabel(session),
      compatibilityScore,
      compatibilityBand,
      compatibilityExplanation: `${compatibilityBand} compatibility based on the current environment-pair score.`,
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
      collisionHeadline: cleanString(narrative.headline ?? "Operating systems may collide after close"),
      coreMismatch: pairCopy?.coreMismatch ?? "",
      collisionSummary: publicFrictionText(!isPendingFrictionText(friction.fp1) ? (friction.fp1 ?? narrative.situation) : (narrative.situation ?? "The collision thesis is based on the current environment-pair result.")),
      primaryTension: pairCopy?.conflictSummary ?? cleanString(!isPendingFrictionText(friction.primaryConflictedResources) ? (friction.primaryConflictedResources ?? `${leadResource} is the primary tension to monitor.`) : `${leadResource} is the primary tension to monitor.`),
      whyItMatters: publicFrictionText(narrative.implication ?? "The risk matters because early operating assumptions can become permanent integration defaults."), 
      postCloseFailureMode: branchAwarePostCloseFailureMode(copyDoctrineClass, narrative),
    },
    resourceConflictMap: {
      overwriteRiskExplanation: branchAwareOverwriteRiskExplanation(copyDoctrineClass),
      resources,
    },
    timelineOfExpectedFriction: {
      timingLogic: { ...TIMING_LOGIC },
      phases: timelinePhases(deliverable),
    },
    economicRiskTranslation: {
      enterpriseValueBand: publicEnterpriseValueLabel,
      valuationDisclaimer: "Directional triage only. Not a valuation or loss estimate.",
      economicRiskPosture: economicTriagePosture,
      economicTriageJudgement: pairSourceClass === "homogeneous" 
      ? "Directional triage only. The main risk is integration drag. Observe speed, decision quality, and knowledge continuity without asserting target logic compression." 
      : "The main economic risk is not immediate value destruction. It is integration drag: the deal may lose speed, decision quality, or knowledge continuity if the target operating logic is compressed too quickly.",      
      economicTriageRule: "Posture equals the highest assessed channel severity. When no channel is High but two or more channels are Medium, posture is raised one band.",
      economicTriageReason,
      economicTriageChannels,
      evUse: "Deal value is used only to understand materiality. It is not scored in this public preview and does not produce a valuation-impact estimate.",
      whatThisPreviewCanSay: "This preview identifies where economic leakage is most likely to appear and which exposure channels should be tested first.",
      whatThisPreviewCannotSay: "This is not a valuation, loss estimate, impairment opinion, damages calculation, or investment-committee financial model.",
      requiredForQuantifiedModelling: "EV, earn-out terms, retention costs, leadership role map, integration milestones, role criticality, and post-close governance evidence.",
      engagementTierRequirement: "Quantified modelling requires deal-room economics, role-level evidence, integration milestones, and analyst review.",
      economicRiskLines: [],
    },
    recommendedActions: recommendedActions(deliverable, copyDoctrineClass),
    evidenceBasisAndLimits: {
      dataQualityLevel: scoreQualityLabel(session),
      inputCompleteness: inputCompleteness(session, deliverable),
      knownLimits: "Public preview output uses environment-level signals and does not verify person-specific role fit, leadership hierarchy, or documentary evidence depth.",
      methodLimitations: "This brief can identify likely behavior friction and observation windows; it cannot replace engagement-tier diligence or analyst review.",
      whatThisReportCanSay: "It can state the most likely post-close friction thesis, preview watchpoints, review windows, and control implications from the current inputs.",
      whatThisReportCannotSay: "It cannot state a valuation, a quantified loss estimate, a final integration plan, or a verified role-level exposure conclusion.",
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
    line("Conflict intensity", resource.conflictIntensity),
    line("Conflict band", resource.conflictBand),
    line("Direction", resource.direction),
    line("Explanation", resource.explanation),
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
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[5], [
        resourceMap.overwriteRiskExplanation,
        ...resourceMap.resources.flatMap(resourceLines),
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
        economics.economicRiskPosture,
        economics.engagementTierRequirement,
      ]),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[8], report.recommendedActions.flatMap(actionLines)),
      pdfSection(MERGEVUE_PUBLIC_REPORT_BLOCKS[9], [
        line("Data quality level", evidence.dataQualityLevel),
        line("Input completeness", evidence.inputCompleteness),
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
      `Evidence basis: ${evidence.dataQualityLevel}`,
      `Engagement contact: ${engagement.contactEmail}`,
    ]),
  });
}

export default buildMergevuePublicReportModel;
