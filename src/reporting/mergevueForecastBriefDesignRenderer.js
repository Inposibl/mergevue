import {
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
} from "./mergevuePublicReportModel.js";

const SECTION_IDS = Object.freeze([
  "exec",
  "predictions",
  "scenario",
  "environments",
  "collision",
  "resources",
  "timeline",
  "economics",
  "actions",
  "evidence",
  "engagement",
  "audit",
]);

const ALLOWED_DUPLICATE_TEXT = new Set([
  "Mergevue",
  "Forecast Brief",
  "report@mergevue.com",
  "Day 60",
]);

const COMBINED_PREDICTION_TITLE = "Watch & Control Timeline";
const COMBINED_PREDICTION_NOTE = "STRUCTURAL WATCHPOINTS | PUBLIC PREVIEW";

const COMBINED_PREDICTION_LABELS = Object.freeze([
  "FP1 | Early evidence test",
  "FP2 | Operating logic displacement",
  "FP3 | Day 60 risk checkpoint",
]);
const ARCHIVE_SECTION_NOTES = Object.freeze({
  exec: "Executive Summary",
  predictions: COMBINED_PREDICTION_NOTE,
  scenario: "Compatibility and deal grid",
  environments: "Two distinctive operating models",
  collision: "Collision thesis",
  resources: "Resource map",
  timeline: "Derived from structural watchpoint windows",
  economics: "Decision posture, not valuation",
  actions: "Before and after close",
  evidence: "What this preview cannot decide for you",
  engagement: "Full engagement adds",
  audit: "Audit trail",
});

const SCORE_BAND_LABEL = Object.freeze({
  high: "HIGH",
  moderateHigh: "MODERATE-HIGH",
  moderate: "MODERATE",
  moderateLow: "MODERATE-LOW",
  risk: "HIGH RISK",
  pending: "Pending",
});

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\s+-\s+/g, " | ")
    .replace(/\s+/g, " ")
    .replace(/\ban\s+The\s+/gi, "a ")
    .replace(/\ba\s+The\s+/gi, "a ")
    .replace(/\bthe\s+The\s+/gi, "the ")
    .trim();
}

function stripLabel(value, label) {
  const text = cleanText(value);
  const pattern = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*`, "i");
  return text.replace(pattern, "").trim();
}

function formatForecastDate(value) {
  const text = cleanText(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return text;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(match[3])} ${months[Number(match[2]) - 1] ?? match[2]} ${match[1]}`;
}

function sentenceParts(value) {
  const text = cleanText(value);
  return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [];
}

function firstSentence(value) {
  return sentenceParts(value)[0] ?? cleanText(value);
}

function bodyAfterFirstSentence(value) {
  const parts = sentenceParts(value);
  return parts.length > 1 ? parts.slice(1).join(" ") : firstSentence(value);
}

function distinctText(value, compareValue) {
  const text = cleanText(value);
  if (!text) return "";
  return text === cleanText(compareValue) ? "" : text;
}

function timelineBodyText(value) {
  const text = cleanText(value);
  const withoutTimingPrefix = text.replace(/^(within\s+\d+\s+days(?:\s+of\s+close)?|before\s+day\s+\d+|days\s+\d+\s*[-]\s*\d+|day\s+\d+)\s*:\s*/i, "").trim();
  return withoutTimingPrefix || text;
}

export function forecastBriefScoreBand(score) {
  if (!Number.isFinite(score)) return "pending";
  if (score >= 80) return "high";
  if (score >= 65) return "moderateHigh";
  if (score >= 50) return "moderate";
  if (score >= 35) return "moderateLow";
  return "risk";
}

function percentFromScore(score) {
  if (!Number.isFinite(score)) return 50;
  return Math.max(0, Math.min(100, score));
}

function confidenceGateLabel(value) {
  const text = cleanText(value).toLowerCase();
  if (/high|complete|strong/.test(text)) return { conditionsMet: 5, conditionsTotal: 5, level: "High" };
  if (/medium|preview|directional|partial/.test(text)) return { conditionsMet: 3, conditionsTotal: 5, level: "Medium" };
  if (/low|limited|pending/.test(text)) return { conditionsMet: 2, conditionsTotal: 5, level: "Low" };
  return { conditionsMet: 3, conditionsTotal: 5, level: "Medium" };
}

function publicEnvironmentName(name, code) {
  const displayName = cleanText(name);
  const environmentCode = cleanText(code);
  if (!displayName) return environmentCode;
  if (displayName === environmentCode) return displayName;
  return displayName;
}

function resourceBandLookup(groups = []) {
  const lookup = new Map();
  for (const group of Array.isArray(groups) ? groups : []) {
    const band = cleanText(group?.band);
    const rows = Array.isArray(group?.rows) ? group.rows : [];
    for (const row of rows) {
      const name = cleanText(row?.label || row?.name);
      if (name && band) lookup.set(name.toLowerCase(), band);
    }
  }
  return lookup;
}

function actionResourceName(actionTitle, rationale) {
  const text = `${cleanText(actionTitle)} ${cleanText(rationale)}`.toLowerCase();
  const resourceNames = ["Health", "Energy", "Knowledge", "Trust", "Connections", "Information", "Creativity", "Decisiveness", "Attention", "Organisation / system", "Organization / system"];
  return resourceNames.find((name) => text.includes(name.toLowerCase())) || "";
}

function alignedActionRationale(actionTitle, rationale, resourceGroups) {
  const resourceName = actionResourceName(actionTitle, rationale);
  if (!resourceName) return rationale;
  const lookup = resourceBandLookup(resourceGroups);
  const normalizedName = resourceName.toLowerCase();
  const band = lookup.get(normalizedName) || (normalizedName.includes("organization") ? lookup.get("organisation / system") : "");
  if (band !== "aligned") return rationale;
  const key = resourceName.toLowerCase();

  if (key.includes("health")) return "Health is an alignment asset. The risk is not current health conflict; the risk is damaging sustainable pace if integration pressure turns endurance into burnout.";
  if (key.includes("energy")) return "Energy is an alignment asset. The risk is not current energy conflict; the risk is damaging execution capacity through excessive integration load or poorly paced change.";
  if (key.includes("knowledge")) return "Knowledge is an alignment asset. The risk is not current knowledge conflict; the risk is losing access to know-how if ownership, routines, or knowledge holders are changed too early.";
  if (key.includes("trust")) return "Trust is an alignment asset. The risk is not current trust conflict; the risk is damaging disclosure quality, credibility, or psychological safety through careless integration decisions.";
  if (key.includes("connections")) return "Connections are an alignment asset. The risk is not current connections conflict; the risk is weakening informal coordination or isolating key relationship holders during governance redesign.";
  if (key.includes("information")) return "Information is an alignment asset. The risk is not current information conflict; the risk is disrupting signal flow or access to operating data during reporting-line changes.";
  if (key.includes("creativity")) return "Creativity is an alignment asset. The risk is not current creativity conflict; the risk is suppressing local problem-solving before integration problems are understood.";
  if (key.includes("decisiveness")) return "Decisiveness is an alignment asset. The risk is not current decisiveness conflict; the risk is slowing clear ownership and escalation paths during the transition.";
  if (key.includes("attention")) return "Attention is an alignment asset. The risk is not current attention conflict; the risk is fragmenting leadership focus and missing critical post-close signals.";
  if (key.includes("organisation") || key.includes("organization") || key.includes("system")) return "Organisation / system is an alignment asset. The risk is not current system conflict; the risk is damaging routines and cadence that already support stable execution.";

  return `${resourceName} is an alignment asset. The risk is not current conflict; the risk is damaging this strength through careless integration pressure.`;
}
function actionBuckets(actions) {
  const normalizedActions = (actions ?? []).map((action, sourceIndex) => Object.freeze({
    actionTitle: cleanText(action.actionTitle),
    actionTiming: cleanText(action.actionTiming),
    actionOwner: cleanText(action.actionOwner),
    actionReason: cleanText(action.actionReason),
    actionExpectedEffect: cleanText(action.actionExpectedEffect),
    sourceIndex,
  }));
  const beforeClose = [];
  const afterClose = [];
  for (const publicAction of normalizedActions) {
    const timing = publicAction.actionTiming.toLowerCase();
    if (/before/i.test(timing)) {
      beforeClose.push(publicAction);
    } else if (/after|post|\b60\b|day\s*(?:[4-9][0-9]|\d{3,})/i.test(timing)) {
      afterClose.push(publicAction);
    } else {
      beforeClose.push(publicAction);
    }
  }
  const assigned = new Set([...beforeClose, ...afterClose].map((action) => action.sourceIndex));
  const unassigned = normalizedActions.filter((action) => !assigned.has(action.sourceIndex));
  return {
    beforeClose: beforeClose.length ? beforeClose : unassigned.slice(0, 2),
    afterClose: afterClose.length ? afterClose : unassigned.slice(0, 2),
  };
}

function conflictBandFromIntensity(intensity) {
  if (intensity >= 70) return "high";
  if (intensity >= 40) return "moderate";
  return "aligned";
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function averageScore(values) {
  const valid = values.map(Number).filter(Number.isFinite);
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function resourceScore(resources, names) {
  const wanted = names.map((name) => name.toLowerCase());
  const matches = resources.filter((resource) => {
    const label = String(resource.name || resource.label || resource.resourceName || "").toLowerCase();
    return wanted.some((name) => label.includes(name));
  });

  const selected = matches.length ? matches : resources;
  return averageScore(selected.map((resource) => resource.conflictIntensity ?? resource.intensity ?? 0));
}


function publicResourceDirection(text) {
  const RESOURCE_TIER_DISPLAY_LABELS = Object.freeze({
    IGN: "Baseline",
    LOW: "Low",
    MID: "Medium",
    TOP: "High",
  });

  return cleanText(text).replace(/\b(IGN|LOW|MID|TOP)\b/g, (token) => RESOURCE_TIER_DISPLAY_LABELS[token] ?? token);
}

function archiveResourceGroups(resources = []) {
  const groups = [
    { band: "high", label: "High-risk | 70-100", rows: [] },
    { band: "moderate", label: "Moderate | 40-69", rows: [] },
    { band: "aligned", label: "Aligned | 0-39", rows: [] },
  ];

  const rows = resources.map((resource) => {
    const intensity = Math.max(0, Math.min(100, Number(resource.conflictIntensity) || 0));
    const band = conflictBandFromIntensity(intensity);
    return Object.freeze({
      label: cleanText(resource.resourceName),
      category: cleanText(resource.resourceCategory),
      direction: publicResourceDirection(resource.direction),
      explanation: cleanText(resource.explanation),
      intensity,
      band,
      sourceBand: cleanText(resource.conflictBand),
    });
  });

  const selectedRows = rows
    .sort((a, b) => b.intensity - a.intensity || a.label.localeCompare(b.label))
    .slice(0, 5);

  for (const row of selectedRows) {
    const group = groups.find((item) => item.band === row.band);
    if (group) group.rows.push(row);
  }

  return Object.freeze(groups
    .filter((group) => group.rows.length)
    .map((group) => Object.freeze({
      ...group,
      count: group.rows.length,
      rows: Object.freeze(group.rows),
    })));
}

function actionForPrediction(actions, index) {
  const allActions = [...(actions.beforeClose ?? []), ...(actions.afterClose ?? [])];
  const timingText = (action) => cleanText(action?.actionTiming).toLowerCase();

  if (index === 0) {
    return allActions.find((action) => /before/.test(timingText(action)))
      ?? allActions.find((action) => /30/.test(timingText(action)) && !/60/.test(timingText(action)))
      ?? allActions[0];
  }

  if (index === 1) {
    return allActions.find((action) => /30/.test(timingText(action)) && /60/.test(timingText(action)))
      ?? allActions.find((action) => /days/.test(timingText(action)) && !/^day\s*60$/.test(timingText(action)))
      ?? allActions[1]
      ?? allActions[0];
  }

  if (index === 2) {
    return allActions.find((action) => /^day\s*60$/.test(timingText(action)))
      ?? allActions.find((action) => /day/.test(timingText(action)) && /60/.test(timingText(action)))
      ?? allActions[2]
      ?? allActions[allActions.length - 1];
  }

  return allActions[index];
}

function inferEvidenceFamily(...parts) {
  const text = parts.map(cleanText).join(" ").toLowerCase();
  if (/authority|accountability|consequence|senior|junior|permission|sanction|review process|exception/.test(text)) return "authority_accountability";
  if (/resource|budget|headcount|incentive|approval|money|redistribution|earn-out|customer access/.test(text)) return "resource_control";
  if (/knowledge|documentation|expert|know-how|handover|analyst|intellectual|systematised|planning artefacts/.test(text)) return "knowledge_transfer";
  if (/trust|disclosure|credibility|psychological safety|loyalty|confidence/.test(text)) return "trust_disclosure";
  if (/planning|cadence|forum|long-range|roadmap|operating meeting|strategic planning/.test(text)) return "planning_cadence";
  if (/decision rights|handoff|escalation|governance|ownership|sign-off/.test(text)) return "decision_rights";
  if (/retention|departure|exit|disengagement|leave|attrition/.test(text)) return "retention_disengagement";
  if (/tempo|speed|rhythm|delay|execution|handoff/.test(text)) return "execution_rhythm";
  return "governance_overwrite";
}

const EVIDENCE_REQUIRED_BY_FAMILY = Object.freeze({
  authority_accountability: [
    "Review Day 0-30 senior-versus-junior review records, exception approvals, consequence decisions, escalation notes, and leadership meeting minutes. Confirm whether standards are applied symmetrically across levels.",
    "Review Days 30-60 decision-rights updates, escalation patterns, senior exceptions, consequence decisions, and governance changes that alter who is held accountable for performance.",
    "By Day 60, review whether authority exceptions are becoming routine enough to affect trust, retention, execution quality, or willingness to escalate issues."
  ],
  resource_control: [
    "Review Day 0-30 budget holds, approval changes, resource requests, headcount decisions, and early exceptions that redirect resources away from the target operating logic.",
    "Review Days 30-60 budget reallocations, resource approvals, incentive-rule changes, new sign-off layers, exception decisions, and cases where resources, headcount, tools, or customer access are redirected despite performance evidence.",
    "By Day 60, review whether resource-control changes are affecting delivery confidence, incentive credibility, retention risk, or the target's ability to execute."
  ],
  planning_cadence: [
    "Review Day 0-30 changes to planning cadence: cancelled or shortened forums, revised governance notes, decision logs, planning-team role changes, and management comments that deprioritise long-range planning.",
    "Review Days 30-60 operating meeting notes, planning-cycle changes, handoff documents, decision logs, and examples where planning work is bypassed, compressed, or replaced by immediate execution requests.",
    "By Day 60, review whether planning cadence, documentation ownership, and decision rhythm are stable enough to protect longer-range execution."
  ],
  knowledge_transfer: [
    "Review Day 0-30 access to critical know-how: documentation ownership, named expert availability, handover records, knowledge-transfer plans, and early dependency on individual knowledge holders.",
    "Review Days 30-60 knowledge-transfer logs, documentation maintenance, expert access, analyst participation, handoff quality, and signs that critical know-how is becoming harder to locate or transfer.",
    "By Day 60, review retention signals among top analytical and technical contributors, changes in expert decision access, knowledge-transfer logs, exit or disengagement signals, and cases where systematised knowledge is being replaced by informal memory."
  ],
  trust_disclosure: [
    "Review Day 0-30 disclosure quality: issue escalation, meeting candour, risk reporting, leadership follow-through, and whether target teams still surface bad news early.",
    "Review Days 30-60 trust signals in operating meetings, escalation behaviour, issue logs, decision transparency, and whether teams begin withholding risks, context, or dissent.",
    "By Day 60, review whether disclosure quality, credibility, psychological safety, and informal escalation channels are strong enough to support the longer integration plan."
  ],
  decision_rights: [
    "Review Day 0-30 decision-rights changes, approval paths, escalation notes, sign-off layers, and cases where ownership moves before the target's operating logic is understood.",
    "Review Days 30-60 handoff documents, governance changes, approval delays, escalation records, and examples where decision ownership becomes unclear or contested.",
    "By Day 60, review whether decision rights, escalation paths, and ownership boundaries are stable enough to avoid delayed execution or silent overwrite."
  ],
  retention_disengagement: [
    "Review Day 0-30 retention signals among exposed roles: meeting participation, escalation behaviour, workload changes, informal withdrawal, and early concerns raised by key contributors.",
    "Review Days 30-60 departures, disengagement signals, declined participation, retention requests, manager notes, and role-level signs that exposed contributors are reducing commitment.",
    "By Day 60, review whether disengagement signals are strong enough to escalate, revise, or lower the longer retention-risk concern."
  ],
  execution_rhythm: [
    "Review Day 0-30 execution rhythm: delivery cadence, handoff timing, meeting tempo, decision latency, and early friction around speed or sequencing.",
    "Review Days 30-60 operating cadence, delivery slippage, decision delays, escalation timing, handoff quality, and whether one side's rhythm is silently overriding the other.",
    "By Day 60, review whether execution rhythm is stable enough to support the next integration phase without avoidable delay or burnout."
  ],
  governance_overwrite: [
    "Review Day 0-30 governance changes, operating-model edits, integration meeting notes, decision logs, and early signs that target routines are being overwritten before they are understood.",
    "Review Days 30-60 governance updates, operating-model changes, handoff documents, escalation records, and examples where preservation, simplification, and integration are not clearly separated.",
    "By Day 60, review whether governance overwrite risk is visible enough to escalate, revise, or lower the longer integration concern."
  ]
});

function dynamicEvidenceRequired(prediction, actionTitle, rationale, index, fallback) {
  const family = inferEvidenceFamily(
    prediction.predictionClaim,
    prediction.observableSignal,
    prediction.verificationMethod,
    prediction.recommendedAction,
    actionTitle,
    rationale
  );
  return EVIDENCE_REQUIRED_BY_FAMILY[family]?.[index] || cleanText(fallback);
}

function predictionCard(prediction, index, actions = {}) {
  const statement = cleanText(prediction.predictionClaim);
  const observableSignal = distinctText(prediction.observableSignal, statement);
  const verification = distinctText(prediction.verificationMethod, observableSignal || statement);
  const recommendedAction = distinctText(prediction.recommendedAction, observableSignal || statement) || cleanText(prediction.recommendedAction);
  const timeline = timelinePhase({
    oneLine: prediction.predictionTitle,
    statement,
    verifyBy: prediction.predictionWindow,
    evidenceRequired: observableSignal,
    falsificationCondition: verification,
  }, index);
  const action = actionForPrediction(actions, index);
  const actionTitle = cleanText(action?.actionTitle || recommendedAction);
  const actionTiming = cleanText(action?.actionTiming || prediction.predictionWindow);
  const actionOwner = cleanText(action?.actionOwner);
  const actionExpectedEffect = cleanText(action?.actionExpectedEffect);
  const actionMeta = [actionTiming, actionOwner, actionExpectedEffect ? `expected effect: ${actionExpectedEffect}` : ""]
    .filter(Boolean)
    .join(" | ");
  const rawRationale = cleanText(action?.actionReason || recommendedAction);
  const rationale = alignedActionRationale(actionTitle, rawRationale, actions.resourceGroups);
  const displayStatement = index === 2 && observableSignal ? observableSignal : statement;
  const displayEvidence = index === 2
    ? (statement || verification)
    : (verification || observableSignal);
  const decisionFocus = index === 2
    ? (verification || timeline.watchFor)
    : timeline.watchFor;

  return Object.freeze({
    id: `P${index + 1}`,
    index: index + 1,
    oneLine: cleanText(prediction.predictionTitle).replace(/\.$/, ""),
    windowLabel: COMBINED_PREDICTION_LABELS[index] ?? cleanText(prediction.predictionTitle),
    statement: cleanText(displayStatement),
    evidenceRequired: cleanText(dynamicEvidenceRequired(prediction, actionTitle, rationale, index, displayEvidence)),
    recommendedAction,
    actionTitle,
    actionMeta,
    rationale,
    decisionFocus: cleanText(decisionFocus),
    verifyBy: cleanText(prediction.predictionWindow),
    verifyByDisplay: cleanText(prediction.predictionWindow),
    window: cleanText(prediction.predictionWindow),
    falsificationCondition: verification,
    lockId: `forecast-preview-${index + 1}`,
    sealed: true,
  });
}

function timelinePhase(prediction, index) {
  const oneLine = cleanText(prediction.oneLine).replace(/\.$/, "");
  const body = timelineBodyText(prediction.statement);
  const fallbackWatchFor = `During ${cleanText(prediction.verifyBy)}, watch whether this pattern appears in meetings, decisions, handoffs, escalation behaviour, or resistance to the proposed governance rhythm.`;
  const genericWatchForPattern = /^Review operating meetings, decisions, and handoffs/i;
  const evidenceWatchFor = distinctText(prediction.evidenceRequired, body);
  const verificationWatchFor = distinctText(prediction.falsificationCondition, body);
  const watchForCandidate = [evidenceWatchFor, verificationWatchFor].find((value) => cleanText(value) && !genericWatchForPattern.test(cleanText(value)));
  const watchFor = watchForCandidate || fallbackWatchFor;
  return Object.freeze({
    id: `T${index + 1}`,
    heading: oneLine,
    body: distinctText(body, oneLine),
    watchFor,
    verifyBy: prediction.verifyBy,
  });
}

function collectBlocks(model) {
  const blocks = [];
  const visit = (sectionId, value) => {
    if (typeof value === "string") {
      const text = cleanText(value);
      if (text) blocks.push(Object.freeze({ sectionId, text }));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => visit(sectionId, item));
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach((item) => visit(sectionId, item));
    }
  };
  model.sections.forEach((section) => visit(section.id, section));
  return Object.freeze(blocks);
}

function duplicateWarnings(blocks) {
  const seen = new Map();
  const warnings = [];
  for (const block of blocks) {
    if (ALLOWED_DUPLICATE_TEXT.has(block.text)) continue;
    const previous = seen.get(block.text);
    if (previous && previous !== block.sectionId) {
      warnings.push(`data-gap: duplicate text omitted or reviewed across ${previous} and ${block.sectionId}: ${block.text}`);
    } else {
      seen.set(block.text, block.sectionId);
    }
  }
  return warnings;
}

export function buildMergevueForecastBriefDesignModel(report, options = {}) {
  const scenario = report.compatibilityScoreAndDealScenario;
  const executive = report.executiveDecisionSummary;
  const sealed = report.sealedPredictions;
  const environments = report.theTwoEnvironments;
  const collision = report.collisionThesis;
  const resources = report.resourceConflictMap;
  const timeline = report.timelineOfExpectedFriction;
  const economics = report.economicRiskTranslation;
  const evidence = report.evidenceBasisAndLimits;
  const engagement = report.whatTheFullEngagementAdds;
  const audit = report.auditFooter;
  const score = Number(scenario.compatibilityScore);
  const scoreBandKey = forecastBriefScoreBand(score);
  const confidenceGate = confidenceGateLabel(evidence.dataQualityLevel || scenario.dataQuality);
  const actions = actionBuckets(report.recommendedActions);
  const resourceGroups = archiveResourceGroups(resources.resources);
  const predictionContext = { ...actions, resourceGroups };
  const predictions = Object.freeze(sealed.predictions.map((prediction, index) => predictionCard(prediction, index, predictionContext)));
  const includeAppendixSections = options.includeAppendixSections !== false;
  const issuedAt = cleanText(audit.generatedAt).slice(0, 10);
  const acquirerPattern = publicEnvironmentName(environments.acquirerEnvironmentName, environments.acquirerEnvironmentCode);
  const targetPattern = publicEnvironmentName(environments.targetEnvironmentName, environments.targetEnvironmentCode);
  const resourceList = Array.isArray(resources.resources) ? resources.resources : [];
  const averageResourceIntensity = averageScore(resourceList.map((resource) => resource.conflictIntensity ?? resource.intensity ?? 0));
  const compatibilityFriction = Number.isFinite(score) ? 100 - score : averageResourceIntensity;
  const economicCategories = [
    {
      label: "Operating drift",
      value: clampScore(0.55 * averageResourceIntensity + 0.45 * compatibilityFriction),
    },
    {
      label: "Knowledge leakage",
      value: clampScore(0.65 * resourceScore(resourceList, ["knowledge", "information", "trust", "connections"]) + 0.35 * averageResourceIntensity),
    },
    {
      label: "Decision delay",
      value: clampScore(0.65 * resourceScore(resourceList, ["authority", "organisation", "organization", "system", "decisiveness", "information"]) + 0.35 * compatibilityFriction),
    },
  ];

  const sections = [
    {
      id: SECTION_IDS[0],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[0],
      hero: {
        masthead: report.brand.name,
        product: report.brand.product,
        reportType: report.brand.reportType,
        contactEmail: report.brand.contactEmail,
        headline: cleanText(executive.headline),
        thesis: distinctText(executive.oneParagraphSummary, executive.headline),
        decisionImplication: cleanText(executive.decisionImplication),
        mainRisk: cleanText(executive.mainRisk),
        recommendedAction: cleanText(executive.recommendedAction),
      },
    },
    {
      id: SECTION_IDS[1],
      title: COMBINED_PREDICTION_TITLE,
      statusTitle: sealed.statusTitle,
      statusDescription: sealed.statusDescription,
      previewOneLiners: predictions.map((prediction) => prediction.oneLine),
      trackerStatement: "This public preview is not a scored forecast ledger. Scored role-level forecasts require the paid workflow and sealed pre-outcome logging.",
      trackerUrl: audit.publicUrlPattern,
      predictions,
    },
    {
      id: SECTION_IDS[2],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[2],
      acquirerName: scenario.acquirerName,
      targetName: scenario.targetName,
      dealType: scenario.dealType,
      enterpriseValueBand: stripLabel(scenario.enterpriseValueBand, "Enterprise value band"),
      dataQuality: scenario.dataQuality,
      compatibilityScore: score,
      scoreBand: scoreBandKey,
      scoreBandLabel: SCORE_BAND_LABEL[scoreBandKey],
      scoreMarkerPercent: percentFromScore(score),
      confidencePips: evidence.dataQualityLevel,
      confidenceGate,
      explanation: distinctText(scenario.compatibilityExplanation, executive.headline),
    },
    {
      id: SECTION_IDS[3],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[3],
      acquirer: {
        name: scenario.acquirerName,
        environment: acquirerPattern,
        description: environments.acquirerEnvironmentDescription,
        behaviorPattern: environments.acquirerBehaviorPattern,
        oneLineDefinition: environments.acquirerOneLineDefinition,
        authorityStructure: environments.acquirerAuthorityStructure,
        innovationStance: environments.acquirerInnovationStance,
        economicFunction: environments.acquirerEconomicFunction,
        resourceTarget: environments.acquirerResourceTarget,
        systemicRole: environments.acquirerSystemicRole,
      },
      target: {
        name: scenario.targetName,
        environment: targetPattern,
        description: environments.targetEnvironmentDescription,
        behaviorPattern: environments.targetBehaviorPattern,
        oneLineDefinition: environments.targetOneLineDefinition,
        authorityStructure: environments.targetAuthorityStructure,
        innovationStance: environments.targetInnovationStance,
        economicFunction: environments.targetEconomicFunction,
        resourceTarget: environments.targetResourceTarget,
        systemicRole: environments.targetSystemicRole,
      },
      coreMismatch: cleanText(collision.coreMismatch),
    },
    {
      id: SECTION_IDS[4],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[4],
      headline: distinctText(collision.collisionHeadline, executive.headline),
      summary: distinctText(distinctText(collision.collisionSummary, executive.oneParagraphSummary), executive.mainRisk),
      primaryTension: distinctText(collision.primaryTension, executive.mainRisk),
      whyItMatters: distinctText(collision.whyItMatters, executive.decisionImplication),
      postCloseFailureMode: collision.postCloseFailureMode,
    },
    {
      id: SECTION_IDS[5],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[5],
      explanation: resources.overwriteRiskExplanation,
      legend: ["High-risk | 70-100", "Moderate | 40-69", "Aligned | 0-39"],
      scanned: resources.resources.length,
      scannedLabel: `${resources.resources.length} DISPLAYED EXPOSED RESOURCES`,
      groups: resourceGroups,
      zones: resources.resources.map((resource, index) => Object.freeze({
        id: `R${index + 1}`,
        name: resource.resourceName,
        category: resource.resourceCategory,
        intensity: Number(resource.conflictIntensity) || 0,
        band: resource.conflictBand,
        direction: resource.direction,
        explanation: resource.explanation,
      })),
    },
    {
      id: SECTION_IDS[6],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[6],
      timingLogic: timeline.timingLogic,
      phases: predictions.map(timelinePhase),
    },
    {
      id: SECTION_IDS[7],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[7],
      enterpriseValueBand: cleanText(economics.enterpriseValueBand).replace(/^Enterprise value \/ deal value provided:\s*/, ""),
      valuationDisclaimer: economics.valuationDisclaimer,
      economicRiskPosture: economics.economicRiskPosture,
      economicTriageJudgement: economics.economicTriageJudgement,
      economicTriageRule: economics.economicTriageRule,
      economicTriageReason: economics.economicTriageReason,
      economicTriageChannels: Array.isArray(economics.economicTriageChannels) ? economics.economicTriageChannels : [],
      evUse: economics.evUse,
      whatThisPreviewCanSay: economics.whatThisPreviewCanSay,
      whatThisPreviewCannotSay: economics.whatThisPreviewCannotSay,
      requiredForQuantifiedModelling: economics.requiredForQuantifiedModelling,
      economicRiskLines: Array.isArray(economics.economicRiskLines) ? economics.economicRiskLines : [],
      engagementTierRequirement: economics.engagementTierRequirement,
      categories: economicCategories,
    },
    {
      id: SECTION_IDS[8],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[8],
      beforeClose: actions.beforeClose,
      afterClose: actions.afterClose,
    },
    {
      id: SECTION_IDS[9],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[9],
      dataQualityLevel: evidence.dataQualityLevel,
      inputCompleteness: evidence.inputCompleteness,
      knownLimits: evidence.knownLimits,
      methodLimitations: evidence.methodLimitations,
      canSay: evidence.whatThisReportCanSay,
      cannotSay: evidence.whatThisReportCannotSay,
    },
    {
      id: SECTION_IDS[10],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[10],
      benefits: engagement.benefits,
      cta: engagement.cta,
      contactEmail: engagement.contactEmail,
    },
    {
      id: SECTION_IDS[11],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[11],
      reportId: audit.reportId,
      generatedAt: audit.generatedAt,
      reportVersion: audit.reportVersion,
      scenarioId: audit.scenarioId,
      contactEmail: audit.contactEmail,
      publicUrlPattern: audit.publicUrlPattern,
      trackRecordUrl: audit.trackRecordUrl,
      qrLabel: audit.reportId,
    },
  ].filter((section, index) => includeAppendixSections || index < 8 || index === 11);

  const model = {
    fileName: MERGEVUE_PUBLIC_REPORT_PDF_FILE_NAME,
    sectionSet: includeAppendixSections ? "full-public-brief-with-appendix" : "core-public-brief",
    humanSignOffNote: "Section count may vary only when an approved appendix toggle is used; human sign-off is required before appendix sections are suppressed.",
    masthead: Object.freeze({
      diagnosticId: audit.reportId,
      issuedAt,
      tierLabel: "Public Structural Preview",
      confidential: false,
    }),
    header: Object.freeze({
      eyebrow: `${report.brand.reportType.toUpperCase()} | ${report.brand.product.toUpperCase()}`,
      title: `${scenario.acquirerName} x ${scenario.targetName}`,
      subtitle: "Display-only structural preview. This report identifies likely post-close friction zones, watchpoints, and integration-control implications. It is not a scored forecast ledger, valuation opinion, or deal verdict.",
    }),
    compatibility: Object.freeze({
      score,
      bandKey: scoreBandKey,
      bandLabel: SCORE_BAND_LABEL[scoreBandKey],
      scaleLow: "Collision",
      scaleHigh: "Aligned",
      confidence: Object.freeze({
        ...confidenceGate,
        note: `${confidenceGate.conditionsMet}/${confidenceGate.conditionsTotal} conditions met. ${cleanText(scenario.dataQuality || evidence.dataQualityLevel)}`,
      }),
    }),
    forecast: Object.freeze({
      headline: cleanText(executive.headline),
      acquirer: Object.freeze({ company: scenario.acquirerName, pattern: acquirerPattern }),
      target: Object.freeze({ company: scenario.targetName, pattern: targetPattern }),
      dealType: scenario.dealType,
      enterpriseValue: stripLabel(scenario.enterpriseValueBand, "Enterprise value band"),
      economicPosture: cleanText(economics?.economicRiskPosture || "Directional"),
      predictionsSummary: Object.freeze(predictions.map((prediction) => Object.freeze({
        windowLabel: prediction.window,
        verifyBy: prediction.verifyBy,
        oneLine: prediction.oneLine,
      }))),
      recommendedAction: cleanText(executive.recommendedAction),
    }),
    polarity: Object.freeze({
      acquirer: Object.freeze({
        company: scenario.acquirerName,
        pattern: acquirerPattern,
        description: environments.acquirerEnvironmentDescription,
      }),
      target: Object.freeze({
        company: scenario.targetName,
        pattern: targetPattern,
        description: environments.targetEnvironmentDescription,
      }),
      table: Object.freeze({
        whereTheyFit: cleanText(collision.primaryTension),
        whereTheyMisread: cleanText(collision.collisionSummary),
        integrationRisk: cleanText(collision.postCloseFailureMode),
        coreBehaviouralRisk: cleanText(collision.whyItMatters),
      }),
    }),
    resourceConflictMap: Object.freeze({
      legend: "Score = structural contestation intensity | 0 aligned -> 100 maximal conflict",
      scanned: resources.resources.length,
      scannedLabel: `${resources.resources.length} DISPLAYED EXPOSED RESOURCES`,
      groups: resourceGroups,
    }),
    sealedPredictions: predictions,
    trackRecord: Object.freeze({
      statement: "This public preview is not a scored forecast ledger. The paid workflow can convert watchpoints into controlled, pre-outcome claims where inputs are sufficient.",
      ledgerUrl: audit.publicUrlPattern,
    }),
    sections: Object.freeze(sections.map(Object.freeze)),
  };
  const blocks = collectBlocks(model);
  return Object.freeze({
    ...model,
    renderedTextBlocks: blocks,
    dataGapWarnings: Object.freeze(duplicateWarnings(blocks)),
  });
}

export function forecastBriefDesignClassContract() {
  return Object.freeze([
    "controls",
    "sheet",
    "mast",
    "masthead",
    "doc-title",
    "sec",
    "pred",
    "env",
    "envs",
    "tl",
    "panel",
    "cat",
    "exec",
    "exec-score",
    "exec-deal",
    "pips",
    "rbar",
    "zone",
    "tracker",
    "cta",
    "audit",
    "audit-qr",
  ]);
}

export function renderMergevueForecastBriefHtml(model) {
  const classContract = forecastBriefDesignClassContract().join(" ");
  return `<!doctype html>
<html lang="en">
<head data-variant="forecast">
<meta charset="utf-8">
<title>${model.fileName}</title>
<style>
  .resource-summary{ margin-top:14px; padding:14px 16px; border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); }
  .resource-summary h4{ margin:0 0 7px; font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); }
  .resource-summary > p{ margin:0; font-size:11.2px; line-height:1.38; color:var(--ink-2); }
  .resource-summary-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:10px; }
  .resource-summary-row{ padding-top:8px; border-top:var(--hair) solid var(--line); }
  .resource-summary-row span{ display:block; font-size:11px; font-weight:650; color:var(--ink); margin-bottom:3px; }
  .resource-summary-row p{ margin:0; font-size:9.8px; line-height:1.28; color:var(--ink-2); }
  .env-rich{ padding:18px; }
  .econ-lines{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0; }
  .econ-line{ padding:10px 12px; border:var(--card-border); border-radius:var(--r); background:var(--surface); }
  .econ-line-head{ display:flex; flex-direction:column; gap:3px; }
  .econ-line-head span{ font-family:var(--mono); font-size:8.4px; letter-spacing:.11em; text-transform:uppercase; color:var(--accent); }
  .econ-line-head b{ font-size:10.8px; line-height:1.22; color:var(--ink); font-weight:650; }
  .econ-line p{ margin:6px 0 0; font-size:9.6px; line-height:1.28; color:var(--ink-2); }
  .env-rich > p{ font-size:11.6px; line-height:1.38; }
  .env-facts{ margin-top:12px; display:flex; flex-direction:column; gap:7px; }
  .env-fact{ padding-top:7px; border-top:var(--hair) solid var(--line); }
  .env-fact span{ display:block; font-family:var(--mono); font-size:8.7px; letter-spacing:.11em; text-transform:uppercase; color:var(--accent); margin-bottom:2px; }
  .env-fact p{ margin:0; font-size:10.4px; line-height:1.28; color:var(--ink-2); }
  :root{ --maxw:880px; --gut:42px; --bg:#f6f7f8; --ink:#161616; --ink-2:#555d66; --ink-3:#8a949e; --surface:#fff; --surface-2:#f3f5f7; --line:#d9dde2; --line-strong:#b9c1ca; --accent:#2e75b6; --accent-soft:#e8f2fb; --sig-high:#2e7d32; --sig-mod:#e8a33d; --sig-risk:#c0392b; --mono:ui-monospace,SFMono-Regular,Consolas,monospace; --hair:1px; --r:8px; --card-border:var(--hair) solid var(--line); --card-shadow:0 10px 28px rgba(23,50,77,.08); --display-weight:650; color-scheme:light; font-family:Inter,Arial,sans-serif; }
  *{ box-sizing:border-box; } body{ margin:0; background:var(--bg); color:var(--ink); } .controls{ position:sticky; top:0; z-index:50; display:flex; align-items:center; gap:12px; padding:12px 20px; border-bottom:var(--hair) solid var(--line); background:color-mix(in oklab,var(--surface) 86%,transparent); backdrop-filter:blur(10px); } .controls .cb-brand{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-2); } .cb-print{ margin-left:auto; border:var(--hair) solid var(--line-strong); border-radius:100px; background:transparent; padding:8px 13px; font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
  .sheet{ max-width:var(--maxw); margin:0 auto; padding:0 var(--gut) 70px; background:var(--bg); } .mono{ font-family:var(--mono); } .tnum{ font-variant-numeric:tabular-nums; } .kicker{ font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-3); }
  .sec{ padding-top:40px; break-inside: avoid; } .sec-head{ display:flex; align-items:baseline; gap:14px; padding-bottom:14px; margin-bottom:22px; border-bottom:var(--hair) solid var(--line-strong); } .sec-num{ font-family:var(--mono); font-size:12px; color:var(--accent); font-weight:500; } .sec-title{ font-size:19px; font-weight:600; } .sec-note{ margin-left:auto; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); }
  .mast,.masthead{ padding:44px 0 0; } .mast-row{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px; } .brand{ display:flex; align-items:center; gap:14px; } .mark{ width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,var(--accent),#17324d); } .brand-name{ font-size:13px; font-weight:650; letter-spacing:.02em; } .brand-sub{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-2); margin-top:3px; } .mast-meta{ text-align:right; font-family:var(--mono); font-size:10.5px; line-height:1.7; color:var(--ink-2); } .mast-meta b{ color:var(--ink); font-weight:600; } .classif{ display:inline-flex; margin-top:6px; padding:3px 9px; border:var(--hair) solid var(--line-strong); border-radius:100px; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-2); background:var(--surface-2); }
  .doc-title-wrap{ padding:34px 0 30px; border-bottom:var(--hair) solid var(--line-strong); } .doc-type{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--accent); } .doc-title{ font-size:44px; font-weight:var(--display-weight); line-height:1.02; margin:12px 0 0; } .doc-title .x{ color:var(--ink-3); font-weight:300; } .doc-sub{ margin-top:14px; font-size:14px; color:var(--ink-2); max-width:62ch; line-height:1.55; }
  .exec{ margin-top:30px; display:grid; grid-template-columns:300px 1fr; border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); overflow:hidden; } .exec-score{ padding:30px 28px; border-right:var(--card-border); display:flex; flex-direction:column; } .score-readout{ display:flex; align-items:baseline; gap:8px; } .score-num{ font-size:118px; font-weight:var(--display-weight); line-height:.86; letter-spacing:-.04em; } .score-of{ font-family:var(--mono); font-size:12px; color:var(--ink-3); } .score-expl{ margin-top:10px; font-size:11.5px; line-height:1.45; color:var(--ink-2); } .band-pill{ align-self:flex-start; margin-top:16px; padding:5px 12px; border-radius:100px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; font-weight:500; } .band-high{ background:color-mix(in oklab,var(--sig-high) 16%,var(--surface)); color:var(--sig-high); } .band-moderateHigh,.band-moderate{ background:color-mix(in oklab,var(--sig-mod) 18%,var(--surface)); color:var(--sig-mod); } .band-moderateLow,.band-risk{ background:color-mix(in oklab,var(--sig-risk) 16%,var(--surface)); color:var(--sig-risk); }
  .score-scale{ margin-top:18px; } .scale-track{ height:5px; border-radius:3px; background:linear-gradient(90deg,var(--sig-risk),var(--sig-mod) 55%,var(--sig-high)); position:relative; } .scale-mark{ position:absolute; top:-4px; width:2px; height:13px; background:var(--ink); border-radius:2px; } .scale-ends{ display:flex; justify-content:space-between; font-family:var(--mono); font-size:9px; color:var(--ink-2); margin-top:6px; } .gate{ margin-top:auto; padding-top:20px; } .gate-row{ display:flex; align-items:center; gap:8px; } .gate-label{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-2); } .pips{ display:flex; gap:4px; } .pip{ width:14px; height:6px; border-radius:2px; background:var(--line-strong); } .pip.on{ background:var(--accent); } .gate-verdict{ font-family:var(--mono); font-size:10.5px; color:var(--ink); margin-top:8px; line-height:1.5; } .evidence-gate-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; } .evidence-gate-title{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-2); font-weight:600; } .evidence-gate-row{ padding:7px 0 0; margin-top:7px; border-top:var(--hair) solid var(--line); } .evidence-gate-label{ font-size:11.5px; font-weight:600; color:var(--ink); } .evidence-gate-copy{ font-size:10.5px; color:var(--ink-2); line-height:1.35; margin-top:2px; }
  .exec-body{ padding:26px 28px; display:flex; flex-direction:column; gap:18px; } .exec-thesis{ font-size:20px; font-weight:500; line-height:1.32; color:var(--ink); } .exec-deal{ display:flex; flex-wrap:wrap; gap:10px 26px; padding:14px 0; border-top:var(--card-border); border-bottom:var(--card-border); } .deal-cell{ display:flex; flex-direction:column; gap:3px; } .deal-cell .k{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-2); } .deal-cell .v{ font-size:13.5px; font-weight:600; color:var(--ink); } .deal-cell small{ color:var(--ink-2); font-weight:500; } .exec-preds{ display:flex; flex-direction:column; gap:9px; } .exec-preds .epl{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-2); } .epred{ display:grid; grid-template-columns:92px 1fr; gap:12px; align-items:baseline; } .epred .when{ font-family:var(--mono); font-size:11px; color:#1f5f95; font-weight:700; } .epred .what{ font-size:13px; line-height:1.4; color:var(--ink); } .exec-action{ display:block; padding:12px 14px; background:var(--accent-soft); border:var(--hair) solid #bfd8ec; border-radius:var(--r); } .exec-action .lab{ display:block; font-family:var(--mono); font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:#1f5f95; font-weight:700; } .exec-action .txt{ display:block; margin-top:5px; font-size:12.2px; line-height:1.32; font-weight:600; color:var(--ink); }
  .preds-wrap{ display:flex; flex-direction:column; gap:16px; } .pred{ border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); overflow:hidden; break-inside: avoid; } .pred-top{ display:flex; align-items:stretch; } .pred-id{ flex:none; width:150px; padding:20px; border-right:var(--card-border); background:var(--surface-2); display:flex; flex-direction:column; align-items:flex-start; gap:8px; min-width:0; } .pred-id .pno{ display:block; flex:none; width:100%; font-family:var(--mono); font-size:11px; color:var(--ink-3); letter-spacing:.1em; } .pred-id .seal{ display:flex; flex:none; width:100%; align-items:center; align-self:flex-start; gap:6px; font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--sig-high); font-weight:500; } .pred-id .seal:before{ content:""; flex:none; width:7px; height:7px; border-radius:50%; background:var(--sig-high); } .pred-id .lock{ display:block; flex:none; width:100%; max-width:100%; font-family:var(--mono); font-size:9px; color:var(--ink-3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; word-break:normal; line-height:1.4; margin-top:auto; } .pred-main{ flex:1; min-width:0; padding:20px 24px; } .pred-claim{ font-size:16px; font-weight:500; line-height:1.42; } .pred-verify{ flex:none; width:170px; min-width:0; padding:20px; border-left:var(--card-border); text-align:right; display:flex; flex-direction:column; } .pred-verify .vl{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .pred-verify .vd{ font-family:var(--mono); font-size:21px; font-weight:600; margin-top:5px; } .pred-verify .vw{ font-family:var(--mono); font-size:10.5px; color:var(--accent); margin-top:6px; } .pred-meta{ display:grid; grid-template-columns:1fr; border-top:var(--card-border); } .pred-meta .pm{ padding:13px 24px; } .pred-meta .pm+.pm{ border-left:var(--card-border); } .pred-meta .pml{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; } .pred-meta .pmv{ font-size:12.5px; color:var(--ink-2); line-height:1.45; }
  .prediction-stack{ gap:12px; } .prediction-banner{ margin-bottom:12px; } .window-label{ font-family:var(--mono); font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:7px; } .prediction-bottom{ display:grid; grid-template-columns:1fr 1.15fr 1fr; border-top:var(--card-border); } .evidence-block,.action-block,.decision-output{ padding:12px 16px; break-inside:avoid; page-break-inside:avoid; } .action-block{ background:var(--accent-soft); border-left:var(--card-border); border-right:var(--card-border); } .decision-output{ background:var(--surface-2); } .evidence-block .pmv,.decision-output .pmv{ font-size:12px; color:var(--ink-2); line-height:1.34; } .prediction-bottom .pml{ font-family:var(--mono); font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; } .action-block .act-title{ font-size:12px; font-weight:650; } .action-block .act-meta{ font-size:12px; line-height:1.32; color:var(--ink-3); } .action-block .act-reason{ font-size:12px; line-height:1.34; color:var(--ink-2); }
  .tracker{ display:flex; align-items:center; gap:22px; padding:20px 24px; border:var(--card-border); border-radius:var(--r); background:var(--accent-soft); margin-top:16px; break-inside: avoid; } .qr,.audit-qr .qr{ width:96px; height:96px; flex:none; display:block; border:8px solid var(--ink); background:repeating-linear-gradient(45deg,#fff 0 4px,var(--ink) 4px 8px); } .tracker h4{ font-size:14px; font-weight:600; margin:0; } .tracker p{ font-size:12.5px; color:var(--ink-2); margin:6px 0 0; max-width:52ch; line-height:1.5; } .tk-url{ font-family:var(--mono); font-size:12px; color:var(--accent); margin-top:9px; font-weight:500; }
  .envs{ display:grid; grid-template-columns:1fr 1fr; gap:16px; } .env,.panel{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:22px; box-shadow:var(--card-shadow); break-inside: avoid; } .env .role{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); } .env .co{ font-size:15px; font-weight:600; margin-top:4px; } .env .arc{ font-size:18px; font-weight:600; margin-top:10px; color:var(--accent); } .env p,.panel p{ font-size:13px; color:var(--ink-2); line-height:1.55; margin:10px 0 0; } .eng-benefit-head{ color:#008c95; font-weight:800; text-transform:uppercase; } .eng-next-step{ color:var(--ink); font-weight:800; } .collide{ margin-top:16px; border:var(--card-border); border-radius:var(--r); overflow:hidden; } .collide-row{ display:grid; grid-template-columns:210px 1fr; } .collide-row+.collide-row{ border-top:var(--card-border); } .collide-row .cl{ padding:14px 18px; background:var(--surface-2); font-size:12px; font-weight:600; border-right:var(--card-border); } .collide-row .cr{ padding:14px 18px; font-size:12.5px; color:var(--ink-2); line-height:1.5; background:var(--surface); } .collision-finding{ display:block; } .finding-resource-line{ display:block; } .finding-rule{ height:1px; background:var(--line); margin:10px 0; } .finding-meaning,.finding-interpretation{ display:block; } .finding-meaning-title{ font-weight:600; color:var(--ink); margin-bottom:4px; } .finding-line{ display:block; }
  .legend{ display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; margin-bottom:18px; font-family:var(--mono); font-size:10.5px; color:var(--ink-2); } .legend .lg{ display:flex; align-items:center; gap:7px; } .legend .sw{ width:11px; height:11px; border-radius:2px; } .legend .anchor{ margin-left:auto; color:var(--ink-3); } .zone{ margin-bottom:14px; } .zone-head{ display:flex; align-items:center; gap:10px; margin-bottom:8px; } .zone-dot{ width:9px; height:9px; border-radius:50%; } .zone-name{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; font-weight:500; } .zone-count{ font-family:var(--mono); font-size:10px; color:var(--ink-3); } .rbars{ border:var(--card-border); border-radius:var(--r); overflow:hidden; background:var(--surface); } .rbar{ display:grid; grid-template-columns:160px 1fr 46px; align-items:center; gap:14px; padding:9px 16px; } .rbar+.rbar{ border-top:var(--card-border); } .rn{ font-size:12px; font-weight:500; } .rd{ font-size:11px; color:var(--ink-3); margin-top:2px; } .rt{ height:7px; border-radius:4px; background:var(--surface-2); position:relative; overflow:hidden; } .rf{ position:absolute; left:0; top:0; bottom:0; border-radius:4px; } .rv{ font-family:var(--mono); font-size:11px; text-align:right; color:var(--ink-2); }
  .tl{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:var(--card-border); border-radius:var(--r); overflow:hidden; background:var(--surface); break-inside: avoid; } .tl-col+.tl-col{ border-left:var(--card-border); } .tl-progress{ display:flex; height:4px; } .tl-progress span{ flex:1; background:var(--accent); } .tl-when{ padding:14px 18px; background:var(--surface-2); border-bottom:var(--card-border); display:flex; align-items:baseline; justify-content:space-between; } .tl-when .ph{ font-family:var(--mono); font-size:11px; color:var(--accent); font-weight:500; } .tl-when .win{ font-family:var(--mono); font-size:10px; color:var(--ink-3); } .tl-body{ padding:16px 18px; } .tl-body .h{ font-size:13.5px; font-weight:600; line-height:1.3; } .tl-body p{ font-size:12px; color:var(--ink-2); line-height:1.5; margin-top:9px; } .tl-marker{ margin-top:14px; padding-top:12px; border-top:var(--card-border); } .tl-marker .ml{ font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; } .tl-marker .mv{ font-size:11.5px; line-height:1.4; }
  .env-total{ display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding:22px 24px; border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); margin-bottom:14px; } .et-l .lab{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .rng{ font-size:38px; font-weight:var(--display-weight); margin-top:6px; } .economic-label{ font-size:18px; line-height:1.08; font-weight:var(--display-weight); letter-spacing:.035em; text-transform:uppercase; white-space:nowrap; margin-top:6px; } .et-r{ text-align:right; font-family:var(--mono); font-size:11px; color:var(--ink-2); line-height:1.7; } .cats{ display:flex; flex-direction:column; gap:10px; } .cat{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:14px 18px; break-inside: avoid; } .cat-top{ display:flex; justify-content:space-between; align-items:baseline; gap:16px; } .cn{ font-size:13px; font-weight:600; } .cr{ font-family:var(--mono); font-size:13px; font-weight:500; } .cat p{ font-size:12px; color:var(--ink-2); line-height:1.5; margin-top:6px; } .cat-bar,.bar{ height:6px; border-radius:4px; background:var(--surface-2); margin-top:10px; position:relative; overflow:hidden; } .cat-bar span,.bar i{ position:absolute; top:0; bottom:0; left:0; border-radius:4px; background:var(--accent); }
  .acts,.split2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; } .acts-single{ grid-template-columns:1fr; } .timeline-actions{ margin-top:20px; padding-top:16px; border-top:var(--card-border); } .timeline-actions-title{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin:0 0 12px; } .act{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:20px 22px; } .act h4,.panel h4{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin:0 0 14px; } .act-item{ padding:10px 0; border-top:var(--card-border); } .act-item:first-of-type{ border-top:0; } .act-title{ font-size:12.8px; font-weight:600; } .act-meta{ font-family:var(--mono); font-size:10px; color:var(--ink-3); margin-top:5px; } .act-reason{ font-size:12px; color:var(--ink-2); line-height:1.45; margin-top:6px; } .cta{ margin-top:16px; display:flex; align-items:center; gap:20px; padding:22px 26px; border-radius:var(--r); background:var(--ink); color:var(--bg); break-inside: avoid; } .cta .cl{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#c8d0d8; } .cta .ct{ font-size:17px; font-weight:600; margin-top:6px; line-height:1.3; } .cta .cbtn{ margin-left:auto; padding:11px 20px; border-radius:100px; background:var(--accent); color:white; font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; white-space:normal; overflow-wrap:anywhere; text-align:center; } #engagement .cta{ margin-top:12px; padding:14px 18px; gap:14px; align-items:flex-start; } #engagement .cta .ct{ font-size:14px; line-height:1.25; margin-top:4px; } #engagement .cta .cbtn{ white-space:nowrap; overflow-wrap:normal; word-break:normal; }
  .evrow{ display:flex; justify-content:space-between; gap:14px; padding:9px 0; border-bottom:var(--card-border); font-size:12.5px; } .evrow:last-child{ border-bottom:0; } .ek{ color:var(--ink-2); } .ev{ font-weight:500; text-align:right; } #economic .exposure-channel{ align-items:flex-start; gap:18px; } #economic .exposure-channel .ek{ flex:1 1 auto; color:var(--ink); } #economic .exposure-channel .ek b,#economic .exposure-channel .ev b{ display:block; font-weight:600; } #economic .exposure-channel small{ display:block; margin-top:4px; font-size:10.5px; line-height:1.35; color:var(--ink-2); font-weight:400; } #economic .exposure-channel .ev{ flex:0 0 46%; text-align:left; } .notlist{ display:flex; flex-direction:column; gap:9px; padding-left:0; list-style:none; } .notlist li{ display:grid; grid-template-columns:16px 1fr; gap:10px; font-size:12.5px; color:var(--ink-2); line-height:1.45; } .notlist li:before{ content:"x"; color:var(--sig-risk); font-weight:600; }
  .audit{ margin-top:56px; padding-top:26px; border-top:2px solid var(--ink); } .audit-grid{ display:grid; grid-template-columns:1fr 1fr 120px; gap:30px; align-items:start; } .acl{ font-family:var(--mono); font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); margin-bottom:9px; } .acv{ font-family:var(--mono); font-size:11px; color:var(--ink-2); line-height:1.9; } .acv b{ color:var(--ink); font-weight:500; } .audit-qr{ text-align:center; } .ql{ font-family:var(--mono); font-size:8.5px; letter-spacing:.08em; color:var(--ink-3); margin-top:8px; line-height:1.4; } .audit-foot{ display:flex; justify-content:space-between; margin-top:26px; padding-top:16px; border-top:var(--hair) solid var(--line); font-family:var(--mono); font-size:10px; color:var(--ink-3); }
  @media(max-width:760px){ :root{ --gut:22px; } .exec{ grid-template-columns:1fr; } .exec-score{ border-right:0; border-bottom:var(--card-border); } .envs,.acts,.split2{ grid-template-columns:1fr; } .tl{ grid-template-columns:1fr; } .tl-col+.tl-col{ border-left:0; border-top:var(--card-border); } .pred-top{ flex-direction:column; } .pred-id{ width:auto; flex-direction:row; align-items:center; justify-content:space-between; border-right:0; border-bottom:var(--card-border); } .pred-id .lock{ margin-top:0; } .pred-verify{ width:auto; text-align:left; border-left:0; border-top:var(--card-border); } .audit-grid{ grid-template-columns:1fr; } .epred{ grid-template-columns:1fr; } }
  .thresholds{ display:block; font-size:11.5px; color:var(--ink-2); line-height:1.5; letter-spacing:0; font-family:Inter,Arial,sans-serif; margin:0 0 14px; }
  @page{ size:A4; margin:0; }
  html,body{ margin:0; padding:0; }
  html[data-variant="institute"],body{ background:var(--bg); }
  body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page{ width:210mm; min-height:297mm; margin:0 auto; padding:13mm 16mm 12mm; page-break-after:always; break-after:page; background:var(--bg); overflow:hidden; }
  .page:last-child{ page-break-after:auto; break-after:auto; }
  .page>.sheet{ width:100%!important; max-width:100%!important; margin:0!important; padding:0!important; }
  .cover-page{ padding:8mm 13mm 8mm; }
  .cover-page .mast,.cover-page .masthead{ padding-top:18px; }
  .cover-page .mast-row{ gap:12px; }
  .cover-page .doc-title-wrap{ padding:18px 0 16px; }
  .cover-page .doc-title{ font-size:38px; line-height:.98; margin-top:8px; }
  .cover-page .doc-sub{ margin-top:8px; font-size:12.5px; line-height:1.32; max-width:70ch; }
  .cover-page .exec{ margin-top:14px; grid-template-columns:250px 1fr; }
  .cover-page .exec-score{ padding:18px 20px; }
  .cover-page .score-num{ font-size:96px; line-height:.82; }
  .cover-page .score-expl{ margin-top:6px; line-height:1.28; }
  .cover-page .score-scale{ margin-top:10px; }
  .cover-page .band-pill{ margin-top:9px; padding:4px 10px; }
  .cover-page .gate{ padding-top:10px; }
  .cover-page .gate-verdict{ margin-top:5px; line-height:1.25; }
  .cover-page .exec-body{ padding:16px 18px; gap:9px; }
  .cover-page .exec-thesis{ font-size:17px; line-height:1.18; }
  .cover-page .exec-deal{ padding:8px 0; gap:6px 16px; }
  .cover-page .exec-preds{ gap:5px; }
  .cover-page .epred{ grid-template-columns:78px 1fr; gap:8px; }
  .cover-page .epred .what{ line-height:1.2; }
  .cover-page .exec-action{ padding:8px 10px; }
  .cover-page .exec-action .txt{ margin-top:3px; line-height:1.22; }
  .cover-page .economic-cover-cell{ min-width:260px; }
  .cover-page .economic-range-k{ margin-top:5px; }
  .cover-page .economic-range-v{ font-size:12px; line-height:1.18; max-width:320px; }
  .cover-page .economic-range-note{ margin-top:4px; font-size:10px; line-height:1.25; color:var(--ink-3); text-transform:none; letter-spacing:0; }
  .cover-page .cover-executive-summary{ padding:8px 10px; border:var(--hair) solid var(--line); border-radius:var(--r); background:var(--surface-2); }
  .cover-page .cover-executive-summary-title{ font-family:var(--mono); font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); font-weight:800; }
  .cover-page .cover-executive-summary p{ margin:4px 0 0; font-size:12px; line-height:1.24; color:var(--ink); }
  .page-preds{ padding:10mm 13mm 9mm; }
  .page-preds .sec{ padding-top:18px; }
  .page-preds .sec-head{ margin-bottom:10px; padding-bottom:8px; }
  .page-preds .panel{ padding:10px 14px; margin-bottom:8px; }
  .page-preds .panel h4{ margin-bottom:4px; }
  .page-preds .panel p{ font-size:10px; }
  .page-preds .pred{ margin-bottom:8px; }
  .page-preds .pred-top{ min-height:88px; }
  .page-preds .pred-id{ width:122px; padding:10px 12px; }
  .page-preds .pred-id .pno{ font-size:9px; }
  .page-preds .pred-id .seal{ font-size:9px; }
  .page-preds .pred-id .lock{ font-size:9px; }
  .page-preds .pred-main{ padding:10px 14px; }
  .page-preds .pred-claim{ font-size:10.2px; line-height:1.26; }
  .page-preds .pred-verify{ width:122px; padding:10px 12px; }
  .page-preds .pred-verify .vd{ font-size:12px; }
  .page-preds .pred-verify .vl,.page-preds .pred-verify .vw{ font-size:9px; }
  .page-preds .pred-meta{ grid-template-columns:1fr; }
  .page-preds .pred-meta .pm{ padding:7px 12px; }
  .page-preds .pred-meta .pml{ font-size:9px; margin-bottom:3px; }
  .page-preds .pred-meta .pmv{ font-size:9px; line-height:1.24; }
  .page-preds .tracker{ margin-top:8px; padding:10px 14px; min-height:0; }
  .page-preds .tracker .qr{ width:48px; height:48px; }
  .page-preds .tk-body h4{ margin-bottom:4px; }
  .page-preds .tk-body p,.page-preds .tk-url{ font-size:9px; line-height:1.3; }

  /* Page 2-3 compact overrides */
  .page-preds .preds-wrap{ gap:7px; }
  .page-preds .pred{ margin-bottom:6px; }
  .page-preds .pred-top{ min-height:76px; }
  .page-preds .pred-main{ padding:8px 11px; }
  .page-preds .pred-claim{ font-size:9.4px; line-height:1.2; }
  .page-preds .pred-id{ width:112px; padding:8px 10px; }
  .page-preds .pred-verify{ width:110px; padding:8px 10px; }
  .page-preds .pred-meta .pm{ padding:5px 10px; }
  .page-preds .pred-meta .pmv{ font-size:9px; line-height:1.18; }
  .page-preds .tracker{ margin-top:6px; padding:8px 12px; }
  #collision .sec-head{ margin-bottom:10px; padding-bottom:8px; }
  #collision .collide{ margin-top:10px; }
  #collision .collide-row{ grid-template-columns:160px 1fr; }
  #collision .collide-row .cl{ padding:9px 12px; font-size:11px; }
  #collision .collide-row .cr{ padding:9px 12px; font-size:11.5px; line-height:1.32; }

  .mast{ padding-top:0; }
  .doc-title-wrap{ padding:26px 0 24px; }
  .sec{ padding-top:26px; }
  .sec-head{ margin-bottom:16px; padding-bottom:12px; }
  .exec{ margin-top:14px; grid-template-columns:252px 1fr; }
  .exec-score{ padding:22px 22px; }
  .exec-body{ padding:20px 22px; gap:12px; }
  .exec-thesis{ font-size:18px; line-height:1.24; }
  .exec-deal{ padding:10px 0; gap:8px 18px; }
  .exec-preds{ gap:5px; }
  .epred{ grid-template-columns:78px 1fr; gap:8px; }
  .epred .what{ font-size:11.6px; line-height:1.28; }
  .exec-action{ padding:9px 11px; }
  .exec-action .txt{ font-size:11.2px; line-height:1.24; }
  .score-num{ font-size:88px; letter-spacing:-.065em; }
  .score-of{ margin-top:4px; }
  .pred{ break-inside: avoid; page-break-inside: avoid; margin-bottom:12px; }
  .pred-top{ min-height:120px; }
  .pred-main{ padding:16px 20px; }
  .pred-claim{ font-size:13.2px; line-height:1.34; }
  .pred-meta .pmv{ font-size:10.5px; line-height:1.36; }
  .pred-id{ width:135px; padding:16px; }
  .pred-verify{ width:142px; padding:16px; }
  .pred-verify .vd{ font-size:16px; }
  .tracker{ margin-top:12px; }
  .env p{ font-size:12px; line-height:1.45; }
  .collide-row{ grid-template-columns:185px 1fr; }
  .collide-row .cl,.collide-row .cr{ padding:10px 14px; }
  .rbar{ padding:8px 14px; grid-template-columns:190px 1fr 46px; min-width:0; }
  .rbar .rn{ font-size:11.6px; }
  .rbar .rd{ font-family:var(--mono); font-size:9px; color:var(--ink-3); margin-top:2px; line-height:1.3; overflow-wrap:anywhere; }
  .rbar .rt{ height:8px!important; background:#E7EAE7!important; }
  .rbar .rf{ display:block!important; opacity:1!important; min-width:2px; }
  .zone{ margin-bottom:13px; }
  .timeline-page{ padding-top:10mm; padding-bottom:9mm; }
  .timeline-page .sec{ padding-top:16px; }
  .timeline-page .sec-head{ margin-bottom:10px; padding-bottom:8px; }
  .timeline-page .legend{ margin-bottom:10px; }

  /* Timeline compact overrides */
  .timeline-page .tl-when{ padding:7px 9px; }
  .timeline-page .tl-when .ph{ font-size:9.4px; }
  .timeline-page .tl-when .win{ font-size:8.5px; }
  .timeline-page .tl-body{ padding:8px 9px; }
  .timeline-page .tl-body .h{ font-size:10.8px; line-height:1.16; }
  .timeline-page .tl-body p{ font-size:9.8px; line-height:1.28; margin-top:6px; }
  .timeline-page .tl-marker{ margin-top:8px; padding-top:8px; }
  .timeline-page .tl-marker .ml{ font-size:7.8px; margin-bottom:3px; }
  .timeline-page .tl-marker .mv{ font-size:9.3px; line-height:1.22; }
  .timeline-page .timeline-actions{ margin-top:12px; padding-top:10px; }
  .timeline-page .timeline-actions-title{ font-size:9.2px; margin-bottom:8px; }
  .timeline-page .acts{ gap:10px; }
  .timeline-page .act{ padding:12px 14px; }
  .timeline-page .act h4{ font-size:9.3px; margin-bottom:8px; }
  .timeline-page .act-item{ padding:6px 0; }
  .timeline-page .act-title{ font-size:10.8px; }
  .timeline-page .act-meta{ font-size:8.5px; margin-top:3px; }
  .timeline-page .act-reason{ font-size:9.4px; line-height:1.26; margin-top:4px; }

  .timeline-page .tl{ grid-template-columns:1fr 1fr 1fr; }
  .timeline-page .tl-when{ padding:9px 11px; }
  .timeline-page .tl-body{ padding:10px 11px; }
  .timeline-page .tl-body .h{ font-size:12px; line-height:1.2; }
  .timeline-page .tl-body p{ font-size:9.2px; line-height:1.23; margin-top:6px; }
  .timeline-page .tl-marker{ margin-top:7px; padding-top:6px; }
  .timeline-page .tl-marker .mv{ font-size:8.8px; line-height:1.2; }
  .timeline-page .timeline-actions{ margin-top:10px; padding-top:9px; }
  .timeline-page .timeline-actions-title{ margin-bottom:7px; font-size:9.5px; }
  .timeline-page .acts{ gap:9px; }
  .timeline-page .act{ padding:10px 12px; }
  .timeline-page .act h4{ margin-bottom:7px; font-size:9.5px; }
  .timeline-page .act-item{ padding:6px 0; }
  .timeline-page .act-title{ font-size:10.8px; line-height:1.2; }
  .timeline-page .act-meta{ font-size:8.4px; line-height:1.2; margin-top:3px; }
  .timeline-page .act-reason{ font-size:8.9px; line-height:1.22; margin-top:4px; }
  .tl-body p{ font-size:11.5px; line-height:1.45; }
  .tl-marker .mv{ font-size:10.8px; }
  .env-total .rng{ font-size:33px; }
  .cat p{ font-size:11.6px; }
  .acts{ gap:14px; }
  .act{ padding:16px 18px; }
  .act-title{ font-size:12.2px; }
  .act-meta{ font-size:9.2px; line-height:1.35; }
  .act-reason{ font-size:10.8px; line-height:1.35; }
  .evidence-page .panel{ padding:18px 20px; }
  .evidence-page .evrow{ font-size:11.2px; }
  .evidence-page .notlist li{ font-size:11.2px; }

  /* Page 5+ compact overrides */
  #resources .sec-head,
  #economic .sec-head,
  #evidence .sec-head,
  #engagement .sec-head{ margin-bottom:10px; padding-bottom:8px; }

  #resources .thresholds{ font-size:10.4px; line-height:1.32; margin-bottom:9px; }
  #resources .legend{ margin-bottom:9px; gap:5px 10px; font-size:8.8px; }
  #resources .zone{ margin-bottom:8px; }
  #resources .zone-head{ margin-bottom:5px; gap:7px; }
  #resources .zone-name{ font-size:9px; letter-spacing:.08em; }
  #resources .zone-count{ font-size:8.5px; }
  #resources .rbar{ grid-template-columns:135px 1fr 34px; gap:9px; padding:6px 10px; }
  #resources .rn{ font-size:10.5px; }
  #resources .rd{ font-size:9px; line-height:1.18; }
  #resources .rv{ font-size:9.2px; }

  #resources .resource-summary{ margin-top:10px; padding-top:8px; }
  #resources .resource-summary h4{ font-size:9.6px; margin:0 0 6px; }
  #resources .resource-summary p{ font-size:10px; line-height:1.32; margin:0 0 8px; }
  #resources .resource-summary-grid{ gap:8px; }
  #resources .resource-summary-row{ padding:8px 9px; }
  #resources .resource-summary-row span{ font-size:10.2px; }
  #resources .resource-summary-row p{ font-size:9.5px; line-height:1.24; margin-top:4px; }

  #economic .env-total{ margin-bottom:10px; }
  #economic .economic-message{ margin:0 0 10px; padding:12px 14px; font-size:12px; line-height:1.35; }
  #economic .economic-message strong{ color:var(--accent); font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
  #economic .et-l,
  #economic .et-r{ padding:12px 14px; }
  #economic .economic-label{ font-size:14px; line-height:1.24; }
  #economic .et-r{ font-size:10.2px; line-height:1.32; }
  #economic .economic-line-item{ padding:8px 0; }
  #economic .economic-line-title{ font-size:10.5px; }
  #economic .economic-line-value{ font-size:10.2px; line-height:1.24; }
  #economic .economic-line-explain{ font-size:9.6px; line-height:1.25; margin-top:4px; }
  #economic .cats{ gap:8px; margin-top:10px; }
  #economic .cat{ padding:10px 12px; }
  #economic .cat-top{ margin-bottom:5px; }
  #economic .cat .cn{ font-size:10.5px; }
  #economic .cat .cr{ font-size:10px; }
  #economic .cat p{ font-size:9.6px; line-height:1.25; margin:5px 0 4px; } #economic .cat-scale-note{ font-family:var(--mono); font-size:12px!important; line-height:1.12; color:var(--ink-3); margin:0 0 3px; }

  .evidence-page .sec{ padding-top:14px; }
  .evidence-page .panel{ padding:14px 16px; }
  .evidence-page .panel h4{ font-size:9.8px; margin-bottom:8px; }
  .evidence-page .panel p{ font-size:10.5px; line-height:1.34; margin-top:7px; }
  .evidence-page .decision-gap-grid{ margin-top:8px; }
  .evidence-page .evrow{ padding:6px 0; gap:10px; font-size:10.2px; }
  .evidence-page .ek{ flex:0 0 150px; }
  .evidence-page .ev{ text-align:left; font-size:10px; line-height:1.24; }

  .evidence-page #engagement .panel{ padding:13px 16px; }
  .evidence-page #engagement .panel p{ font-size:10.3px; line-height:1.34; margin:0 0 7px; }
  .evidence-page #engagement .cta{ margin-top:8px; padding:10px 13px; }
  .evidence-page #engagement .cta .cl{ font-size:8.2px; }
  .evidence-page #engagement .cta .ct{ font-size:12px; line-height:1.18; }
  .evidence-page #engagement .cta .cbtn{ font-size:8.4px; padding:7px 10px; }

  .evidence-page .audit{ margin-top:18px; padding-top:16px; }
  .evidence-page .audit-grid{ grid-template-columns:1fr 1fr 86px; gap:18px; }
  .evidence-page .acl{ font-size:8.2px; margin-bottom:5px; }
  .evidence-page .acv{ font-size:8.8px; line-height:1.55; }
  .evidence-page .audit-qr .qr{ width:62px; height:62px; border-width:5px; }
  .evidence-page .ql{ font-size:7.2px; line-height:1.2; margin-top:5px; }
  .evidence-page .audit-foot{ margin-top:14px; padding-top:9px; font-size:8px; }
  .evidence-page .audit{ margin-top:8px!important; padding-top:8px!important; }
  .evidence-page .audit-grid{ gap:10px!important; grid-template-columns:1fr 1fr 70px!important; }
  .evidence-page .acl,
  .evidence-page .acv,
  .evidence-page .ql,
  .evidence-page .audit-foot{ font-size:7pt!important; line-height:1.18!important; color:#8b929a!important; }
  .evidence-page .audit-foot{ margin-top:6px!important; padding-top:5px!important; }
  .evidence-page{ position:relative; padding-bottom:9mm!important; }
  .evidence-page .audit-foot{
    position:absolute!important;
    left:13mm!important;
    right:13mm!important;
    bottom:3mm!important;
    margin-top:0!important;
    padding-top:0!important;
    border-top:0!important;
    font-size:6.5pt!important;
    line-height:1!important;
    opacity:.55!important;
  }
  .evidence-page .audit-qr .qr{ width:48px!important; height:48px!important; border-width:4px!important; opacity:.65; }

  .environments-page #environments{ min-height:0; display:block; }
  .environments-page .envs{ display:grid!important; grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important; align-items:start; gap:10px; }
  .environments-page .env{ min-width:0; padding:14px 16px; }
  .environments-page .env-rich>p{ margin-top:6px; line-height:1.3; }
  .environments-page .env-facts{ margin-top:8px; gap:4px; }
  .environments-page .env-fact{ padding-top:4px; }
  .environments-page .env-fact p{ line-height:1.2; }
  .environments-page .env-bridge{ margin-top:10px; padding:12px 16px; }

  .predictions-page{ padding:8mm 12mm 8mm; }
  .predictions-page #predictions .sec{ padding-top:10px; }
  .predictions-page #predictions .sec-head{ margin-bottom:6px; padding-bottom:5px; }
  .predictions-page #predictions .panel{ padding:7px 10px; margin-bottom:5px; }
  .predictions-page #predictions .panel h4{ margin-bottom:2px; }
  .predictions-page #predictions .panel p{ line-height:1.18; margin-top:2px; }
  .predictions-page #predictions .preds-wrap{ gap:4px!important; justify-content:flex-start!important; }
  .predictions-page #predictions .pred{ margin-bottom:4px!important; }
  .predictions-page #predictions .pred-top{ display:grid; grid-template-columns:124px minmax(0,1fr) 104px; min-height:0!important; }
  .predictions-page #predictions .pred-id{ width:auto!important; padding:6px 8px!important; gap:3px; }
  .predictions-page #predictions .pred-main{ padding:6px 9px!important; }
  .predictions-page #predictions .pred-claim{ line-height:1.12!important; }
  .predictions-page #predictions .pred-verify{ width:auto!important; padding:6px 8px!important; }
  .predictions-page #predictions .pred-verify .vd{ margin-top:2px; }
  .predictions-page #predictions .pred-verify .vw{ margin-top:2px; }
  .predictions-page #predictions .pred-meta .pm{ padding:4px 8px!important; }
  .predictions-page #predictions .pred-meta .pml{ margin-bottom:2px!important; }
  .predictions-page #predictions .pred-meta .pmv{ line-height:1.12!important; }
  .predictions-page #predictions .tracker{ display:none!important; }
  .predictions-page #predictions{ min-height:0; display:block; }
  .predictions-page .preds-wrap{ justify-content:flex-start; gap:8px; }
  .predictions-page .pred-meta .pm{ padding:5px 10px; }
  .predictions-page .pred-meta .pmv{ font-size:9px; line-height:1.24; }
  .predictions-page .tracker{ display:none; }

  /* Keep P01 + P02 together without dropping below the 9pt print floor. */
  .predictions-page #predictions .sec-head{ gap:8px; }
  .predictions-page #predictions .sec-note{ display:none; }
  .predictions-page #predictions .prediction-banner{ padding:5px 8px; margin-bottom:4px; }
  .predictions-page #predictions .prediction-banner p{ margin:1px 0 0; line-height:1.08; }
  .predictions-page #predictions .preds-wrap{ gap:4px!important; }
  .predictions-page #predictions .pred{ margin:0!important; box-shadow:none; }
  .predictions-page #predictions .pred-top{ grid-template-columns:112px minmax(0,1fr) 92px; }
  .predictions-page #predictions .pred-id,
  .predictions-page #predictions .pred-main,
  .predictions-page #predictions .pred-verify{ padding:4px 7px!important; }
  .predictions-page #predictions .window-label{ margin-bottom:3px; }
  .predictions-page #predictions .pred-claim{ margin:0; line-height:1.08!important; }
  .predictions-page #predictions .prediction-bottom{ grid-template-columns:.95fr 1.1fr .95fr; }
  .predictions-page #predictions .evidence-block,
  .predictions-page #predictions .action-block,
  .predictions-page #predictions .decision-output{ padding:4px 7px!important; }
  .predictions-page #predictions .prediction-bottom .pml{ margin-bottom:1px!important; }
  .predictions-page #predictions .prediction-bottom :is(.pmv,.act-meta,.act-reason){ line-height:1.08!important; }
  .predictions-page #predictions .action-block .act-meta,
  .predictions-page #predictions .action-block .act-reason{ margin-top:1px; }

  .timeline-page #timeline{ min-height:244mm; display:flex; flex-direction:column; }
  .timeline-page #timeline .legend{ margin-bottom:12px; }
  .timeline-page .tl{ flex:1; min-height:96mm; }
  .timeline-page .timeline-actions{ margin-top:auto; }

  .collision-resources-page{ padding-top:9mm; padding-bottom:9mm; }
  .collision-resources-page .sec{ padding-top:12px; }
  .collision-resources-page .sec-head{ margin-bottom:8px; padding-bottom:7px; }
  .collision-resources-page #collision{ margin-bottom:10px; }
  .collision-resources-page #collision .collide{ margin-top:8px; }
  .collision-resources-page #collision .collide-row{ grid-template-columns:148px 1fr; }
  .collision-resources-page #collision .collide-row .cl{ padding:7px 10px; font-size:10px; }
  .collision-resources-page #collision .collide-row .cr{ padding:7px 10px; font-size:10.2px; line-height:1.3; }
  .collision-resources-page #resources .thresholds{ font-size:9.6px; line-height:1.24; margin-bottom:8px; }
  .collision-resources-page #resources .legend{ margin-bottom:8px; gap:5px 10px; font-size:8.4px; }
  .collision-resources-page #resources .zone{ margin-bottom:6px; }
  .collision-resources-page #resources .zone-head{ margin-bottom:5px; }
  .collision-resources-page #resources .zone-name{ font-size:9.2px; }
  .collision-resources-page #resources .zone-count{ font-size:8.4px; }
  .collision-resources-page #resources .rbar{ padding:5px 9px; grid-template-columns:138px 1fr 30px; gap:7px; }
  .collision-resources-page #resources .rn{ font-size:9.3px; }
  .collision-resources-page #resources .rd{ font-size:7.6px; line-height:1.12; }
  .collision-resources-page #resources .rt{ height:5px!important; }
  .collision-resources-page #resources .rv{ font-size:8px; }
  .collision-resources-page #resources .resource-summary{ margin-top:14px; padding:8px 10px; }
  .collision-resources-page #resources .resource-summary > p{ font-size:8.8px; line-height:1.2; }
  .collision-resources-page #resources .resource-summary-grid{ grid-template-columns:repeat(3,1fr); gap:7px; margin-top:7px; }
  .collision-resources-page #resources .resource-summary-row{ padding:6px 7px; }
  .collision-resources-page #resources .resource-summary-row span{ font-size:9.2px; }
  .collision-resources-page #resources .resource-summary-row p{ font-size:8px; line-height:1.15; }

  .economic-page{ padding:9mm 13mm 8mm; }
  .economic-page #economic .sec{ padding-top:10px; }
  .economic-page #economic .sec-head{ margin-bottom:7px; padding-bottom:6px; }
  .economic-page #economic .env-total{ padding:8px 10px!important; margin-bottom:6px!important; gap:8px!important; }
  .economic-page #economic .et-l,
  .economic-page #economic .et-r{ padding:8px 10px; }
  .economic-page #economic .et-r{ line-height:1.22; }
  .economic-page #economic .econ-lines{ margin:6px 0!important; gap:5px!important; }
  .economic-page #economic .econ-line{ padding:7px 9px; }
  .economic-page #economic .economic-line-item{ padding:5px 0; }
  .economic-page #economic .economic-line-explain{ line-height:1.18; margin-top:2px; }
  .economic-page #economic .cats{ gap:5px!important; margin-top:6px!important; }
  .economic-page #economic .cat{ padding:7px 9px!important; }
  .economic-page #economic .cat-top{ margin-bottom:2px; }
  .economic-page #economic .cat p{ line-height:1.14!important; margin:2px 0 2px!important; } .economic-page #economic .cat-scale-note{ font-family:var(--mono); font-size:12px!important; line-height:1.08!important; color:var(--ink-3); margin:0 0 2px!important; }
  .economic-page #economic .cat-bar,
  .economic-page #economic .bar{ margin-top:4px!important; height:4px!important; }
  .economic-page #economic{ min-height:0; display:block; }
  .economic-page #economic .env-total{ margin-bottom:10px; }
  .economic-page #economic .econ-lines{ margin:10px 0; gap:7px; }
  .economic-page #economic .cats{ margin-top:0; gap:7px; }
  .economic-page #economic .cat{ padding:9px 12px; }
  .economic-page #economic .cat p{ font-size:10.6px; line-height:1.26; margin-top:4px; }

  .evidence-page .audit-tracker{ margin-top:6px; padding-top:6px; border-top:var(--hair) solid var(--line); line-height:1.3; }
  .evidence-page > .sheet{ min-height:0; display:block; }
  .evidence-page #evidence .ek{ font-weight:700; color:var(--ink); }
  .evidence-page #engagement{ margin-bottom:8px; }
  .evidence-page .audit{ margin-top:12px; }

  .prediction-collision-page .pred-top{ display:grid; grid-template-columns:124px minmax(0,1fr) 104px; }
  .prediction-collision-page .pred-id,
  .prediction-collision-page .pred-verify{ width:auto; }
  .prediction-collision-page .pred-main{ min-width:0; }
  .prediction-collision-page{ padding:8mm 12mm; }
  .prediction-collision-page .predictions-continuation{ padding-top:8px; }
  .prediction-collision-page .predictions-continuation .sec-head{ margin-bottom:5px; padding-bottom:5px; }
  .prediction-collision-page .predictions-continuation .sec-note{ display:none; }
  .prediction-collision-page .predictions-continuation .pred{ margin:0; box-shadow:none; }
  .prediction-collision-page .predictions-continuation .pred-id,
  .prediction-collision-page .predictions-continuation .pred-main,
  .prediction-collision-page .predictions-continuation .pred-verify{ padding:5px 8px; }
  .prediction-collision-page .predictions-continuation .window-label{ margin-bottom:3px; }
  .prediction-collision-page .predictions-continuation .pred-claim{ margin:0; line-height:1.1; }
  .prediction-collision-page .predictions-continuation .evidence-block,
  .prediction-collision-page .predictions-continuation .action-block,
  .prediction-collision-page .predictions-continuation .decision-output{ padding:5px 8px; }
  .prediction-collision-page .predictions-continuation .prediction-bottom .pml{ margin-bottom:2px; }
  .prediction-collision-page .predictions-continuation .prediction-bottom :is(.pmv,.act-meta,.act-reason){ line-height:1.1; }
  .prediction-collision-page #collision{ padding-top:12px; }
  .prediction-collision-page #collision .sec-head{ margin-bottom:6px; padding-bottom:6px; }
  .prediction-collision-page #collision .collide{ margin-top:6px; }
  .prediction-collision-page #collision .collide-row{ grid-template-columns:148px 1fr; }
  .prediction-collision-page #collision .collide-row .cl,
  .prediction-collision-page #collision .collide-row .cr{ padding:6px 9px; line-height:1.16; }
  .prediction-collision-page #collision .finding-rule{ margin:5px 0; }
  .collide-row{ break-inside:avoid; page-break-inside:avoid; }

  .audit{ margin-top:28px; }
  .full-list p{ margin:0 0 10px; font-size:12px; line-height:1.45; }
  .page-tight .sec{ padding-top:20px; }
  .cta .cbtn{ padding:8px 12px!important; font-size:8.6px!important; max-width:none; overflow:visible; text-overflow:clip; }
  .page :is(small,.resource-summary h4,.resource-summary>p,.resource-summary-row span,.resource-summary-row p,.econ-line-head span,.econ-line-head b,.econ-line p,.env-rich>p,.env-fact span,.env-fact p,.kicker,.sec-note,.brand-sub,.mast-meta,.classif,.doc-type,.score-expl,.band-pill,.scale-ends,.gate-label,.gate-verdict,.evidence-gate-title,.evidence-gate-label,.evidence-gate-copy,.deal-cell .k,.exec-preds .epl,.epred .when,.epred .what,.exec-action .lab,.exec-action .txt,.pred-id .pno,.pred-id .seal,.pred-id .lock,.pred-claim,.pred-verify .vl,.pred-verify .vw,.pred-meta .pml,.pred-meta .pmv,.tracker p,.tk-url,.env .role,.env p,.collide-row .cl,.collide-row .cr,.legend,.zone-name,.zone-count,.rn,.rd,.rv,.tl-when .ph,.tl-when .win,.tl-body .h,.tl-body p,.tl-marker .ml,.tl-marker .mv,.timeline-actions-title,.act h4,.act-title,.act-meta,.act-reason,.et-l .lab,.et-r,.cn,.cr,.cat p,.cta .cl,.cta .cbtn,.evrow,.ev,.notlist li,.thresholds,.economic-line-title,.economic-line-value,.economic-line-explain,.panel h4,.panel p){ font-size:12px!important; }
  .mast-row,.sec-head,.exec,.pred-top,.envs,.acts,.split2,.tl,.collide-row,.rbar,.env-total,.cat-top{ min-width:0!important; }
  .cta,.tk-url,.acv{ overflow-wrap:anywhere; }
  @media print{ .controls{ display:none!important; } body{ background:var(--bg)!important; color:#161616; } .page{ print-color-adjust:exact; -webkit-print-color-adjust:exact; } .sheet{ width:100%!important; max-width:100%!important; margin:0!important; padding:0!important; } .pred,.env,.panel,.cat,.tracker,.cta,.exec-action,.classif{ break-inside: avoid; print-color-adjust:exact; -webkit-print-color-adjust:exact; } .sec,.tl,.exec,.audit{ break-inside:auto!important; page-break-inside:auto!important; print-color-adjust:exact; -webkit-print-color-adjust:exact; } .mast-meta,.brand-sub,.classif,.score-ends,.gate-verdict,.deal-cell .k,.deal-cell small,.exec-preds .epl{ color:#555d66!important; } .exec-thesis,.deal-cell .v,.epred .what,.exec-action .txt,.gate-verdict{ color:#161616!important; } .epred .when,.exec-action .lab{ color:#1f5f95!important; } }
</style>
</head>
<body class="mergevue-forecast-brief-canon" data-design-contract="${classContract}">
<div class="controls"><div class="cb-brand">Mergevue Forecast Brief</div></div>
${renderForecastBriefPages(model)}
</body>
</html>`;
}

function renderReportPage(innerHtml, className = "") {
  const pageClass = ["page", className].filter(Boolean).join(" ");
  return `<div class="${pageClass}"><div class="sheet">${innerHtml}</div></div>`;
}

function reportSectionById(model, id) {
  return model.sections.find((section) => section.id === id);
}

function renderForecastBriefPages(model) {
  const predictions = reportSectionById(model, "predictions");
  const environments = reportSectionById(model, "environments");
  const collision = reportSectionById(model, "collision");
  const resources = reportSectionById(model, "resources");
  const economics = reportSectionById(model, "economics");
  const evidence = reportSectionById(model, "evidence");
  const engagement = reportSectionById(model, "engagement");

  const firstPredictions = predictions
    ? { ...predictions, predictions: predictions.predictions.slice(0, 2), predictionStartIndex: 0 }
    : null;

  const continuationPredictions = predictions && predictions.predictions.length > 2
    ? {
        ...predictions,
        title: `${COMBINED_PREDICTION_TITLE} (continuation)`,
        predictions: predictions.predictions.slice(2),
        predictionStartIndex: 2,
        isContinuation: true,
      }
    : null;

  const pages = [
    renderReportPage(`${renderArchiveMasthead(model)}${renderArchiveExecutive(model)}`, "cover-page"),
    environments ? renderReportPage(renderHtmlSection(environments, 1), "environments-page") : "",
    firstPredictions ? renderReportPage(renderHtmlSection(firstPredictions, 2), "page-preds predictions-page") : "",
    renderReportPage(`${continuationPredictions ? renderPredictionContinuation(continuationPredictions, 2) : ""}${collision ? renderHtmlSection(collision, 3) : ""}`, "prediction-collision-page"),
    resources ? renderReportPage(renderHtmlSection(resources, 4), "resources-page") : "",
    economics ? renderReportPage(renderHtmlSection(economics, 5), "economic-page") : "",
    renderReportPage(`${evidence ? renderHtmlSection(evidence, 6) : ""}${engagement ? renderHtmlSection(engagement, 7) : ""}`, "page-tight evidence-page"),
  ];

  return pages.filter(Boolean).join("\n");
}

function renderPredictionContinuation(section, number) {
  return `<section class="sec sec-continuation predictions-continuation" id="predictions-continuation" data-screen-label="${escapeHtml(section.title)}">${sectionHead(number, section.title, COMBINED_PREDICTION_NOTE)}<div class="preds-wrap prediction-stack">${renderPredictionCards(section)}</div></section>`;
}

function escapeHtml(value) {
  return cleanText(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function sectionHead(num, title, note) {
  return `<div class="sec-head"><span class="sec-num">${String(num).padStart(2, "0")}</span><span class="sec-title">${escapeHtml(title)}</span><span class="sec-note">${escapeHtml(note)}</span></div>`;
}

function renderArchiveMasthead(model) {
  const titleParts = escapeHtml(model.header.title).split(" x ");
  const title = titleParts.length === 2 ? `${titleParts[0]} <span class="x">x</span> ${titleParts[1]}` : escapeHtml(model.header.title);
  return `<header class="mast">
    <div class="masthead mast-row">
      <div class="brand"><div class="mark" aria-hidden="true"></div><div><div class="brand-name">MERGEVUE</div><div class="brand-sub">View into the merge</div></div></div>
      <div class="mast-meta">Diagnostic <b>${escapeHtml(model.masthead.diagnosticId)}</b><br>Issued <b>${escapeHtml(formatForecastDate(model.masthead.issuedAt))}</b><br>Tier <b>${escapeHtml(model.masthead.tierLabel)}</b><br><div class="classif">DISPLAY-ONLY STRUCTURAL PREVIEW</div></div>
    </div>
    <div class="doc-title-wrap">
      <div class="doc-type">${escapeHtml(model.header.eyebrow)}</div>
      <h1 class="doc-title">${title}</h1>
      <p class="doc-sub">${escapeHtml(model.header.subtitle)}</p>
    </div>
  </header>`;
}

function renderPips(confidence) {
  return Array.from({ length: confidence.conditionsTotal }, (_, index) => `<i class="pip${index < confidence.conditionsMet ? " on" : ""}"></i>`).join("");
}

function renderFirstPageEvidenceGate(model) {
  const evidence = model.sections.find((section) => section.id === "evidence") ?? {};
  const rows = [
    ["Data quality", evidence.dataQualityLevel],
    ["Input completeness", evidence.inputCompleteness],
    ["What this report can say", evidence.canSay],
  ];
  return `<div class="gate evidence-gate"><div class="evidence-gate-head"><div class="evidence-gate-title">EVIDENCE BASIS & CONFIDENCE GATE</div><span class="pips">${renderPips(model.compatibility.confidence)}</span></div>${rows.map(([label, value]) => `<div class="evidence-gate-row"><div class="evidence-gate-label">${escapeHtml(label)}</div><div class="evidence-gate-copy">${escapeHtml(value)}</div></div>`).join("")}</div>`;
}

function renderCoverHeadline(model) {
  const acquirerCompany = cleanText(model?.forecast?.acquirer?.company || "The acquirer");
  const targetCompany = cleanText(model?.forecast?.target?.company || "the target");
  const acquirerPattern = String(model?.forecast?.acquirer?.pattern ?? "").trim();
  const targetPattern = String(model?.forecast?.target?.pattern ?? "").trim();
  const possessive = (value) => /s$/i.test(value) ? `${value}'` : `${value}'s`;
  if (acquirerPattern && targetPattern && acquirerPattern === targetPattern) {
    return `${possessive(acquirerCompany)} ${acquirerPattern} operating logic is being combined with the same operating logic at ${targetCompany}. The risk may appear stable at first but can compound as integration pressure exposes hidden differences in authority, routines, and control expectations.`;
  }
  return `${possessive(acquirerCompany)} ${acquirerPattern || "identified"} operating logic is being combined with ${possessive(targetCompany)} ${targetPattern || "identified"} operating logic. The risk may appear stable at first but can compound as integration pressure increases.`;
}

function renderCoverEconomicExposure(model) {
  const enterpriseValue = cleanText(model?.forecast?.enterpriseValue);
  const posture = cleanText(model?.forecast?.economicPosture || "Directional");
  const limitation = "Directional triage only. Not a valuation or loss estimate.";
  const dealValueContext = enterpriseValue
    ? `<span class="k economic-range-note">Deal value context: ${escapeHtml(enterpriseValue.replace(/^Enterprise value \/ deal value provided:\s*/, ""))}</span>`
    : "";
  return `<div class="deal-cell economic-cover-cell"><span class="k">Economic exposure posture</span><span class="v tnum">${escapeHtml(posture)}</span><span class="k economic-range-k">Preview limitation</span><span class="v economic-range-v">${escapeHtml(limitation)}</span>${dealValueContext}</div>`;
}

function renderCoverExecutiveSummary(model) {
  const band = cleanText(model?.compatibility?.bandLabel || "current compatibility band").toLowerCase();
  const acquirerPattern = cleanText(model?.forecast?.acquirer?.pattern || "the acquirer environment");
  const targetPattern = cleanText(model?.forecast?.target?.pattern || "the target environment");
  const samePattern = acquirerPattern && targetPattern && acquirerPattern === targetPattern;
  const summary = samePattern
    ? `The result indicates ${band} because both organisations show the same operating environment. The executive risk is false confidence: integration may look aligned while authority duplication, routine overwrite, or control friction appears during the first 60 days.`
    : `The result indicates ${band} across two different operating environments: ${acquirerPattern} and ${targetPattern}. The executive risk is translation failure: integration decisions may damage the routines, authority patterns, or trust mechanisms that currently protect deal value.`;
  return `<div class="cover-executive-summary"><div class="cover-executive-summary-title">Executive summary</div><p>${escapeHtml(summary)}</p></div>`;
}

function renderCoverControlMove(model) {
  const groups = Array.isArray(model?.resourceConflictMap?.groups) ? model.resourceConflictMap.groups : [];
  const items = resourceSummaryItems({ groups });
  const watch = items.filter((resource) => resource.band === "high" || resource.band === "moderate").map((resource) => resource.name);
  const aligned = items.filter((resource) => resource.band === "aligned").map((resource) => resource.name);
  const listText = (items) => items.length <= 1 ? (items[0] || "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  const watchText = watch.length ? `Track friction around ${listText(watch)}.` : "No primary low-match resource zone is visible in this preview.";
  const alignedText = aligned.length ? `Protect ${listText(aligned)} as alignment assets.` : "";
  return `${watchText} ${alignedText} Freeze irreversible operating-model changes until Day 60 before deciding what to integrate, simplify, or preserve.`.replace(/\s+/g, " ").trim();
}
function renderArchiveExecutive(model) {
  const score = model.compatibility.score;
  const scoreDisplay = Number.isFinite(score) ? Math.round(score) : null;
  const scoreText = scoreDisplay === null ? "NA" : String(scoreDisplay);
  const bandClass = `band-${model.compatibility.bandKey}`;
  return `<section class="sec" id="exec" style="padding-top:0" data-screen-label="Executive Summary"><div class="exec">
    <div class="exec-score">
      <div class="kicker">Environment Compatibility Score | ECS</div>
      <div class="score-readout tnum" aria-label="Environment Compatibility Score ${escapeHtml(scoreText)} of 100"><span class="score-num">${escapeHtml(scoreText)}</span><span class="score-of">&nbsp;of 100</span></div>
      <div class="score-expl">ECS estimates structural compatibility between the two identified operating environments. Higher scores indicate stronger alignment; lower scores indicate higher friction risk.</div>
      <div class="band-pill ${bandClass}">${escapeHtml(model.compatibility.bandLabel)}</div>
      <div class="score-scale" aria-label="0-100 scale"><div class="scale-track"><div class="scale-mark" style="left:${Math.max(0, Math.min(100, Number(score) || 0))}%"></div></div><div class="scale-ends"><span>0 | ${escapeHtml(model.compatibility.scaleLow)}</span><span>100 | ${escapeHtml(model.compatibility.scaleHigh)}</span></div></div>
      ${renderFirstPageEvidenceGate(model)}
    </div>
    <div class="exec-body">
      <p class="exec-thesis">${escapeHtml(renderCoverHeadline(model))}</p>
      <div class="exec-deal deal-grid">
        <div class="deal-cell"><span class="k">Acquirer</span><span class="v">${escapeHtml(model.forecast.acquirer.company)} <small>- ${escapeHtml(model.forecast.acquirer.pattern)}</small></span></div>
        <div class="deal-cell"><span class="k">Target</span><span class="v">${escapeHtml(model.forecast.target.company)} <small>- ${escapeHtml(model.forecast.target.pattern)}</small></span></div>
        <div class="deal-cell"><span class="k">Deal type</span><span class="v">${escapeHtml(model.forecast.dealType)}</span></div>
        ${renderCoverEconomicExposure(model)}
      </div>
      ${renderCoverExecutiveSummary(model)}
      <div class="exec-action"><span class="lab">First integration control move</span><span class="txt">${escapeHtml(renderCoverControlMove(model))}</span></div>
    </div>
  </div></section>`;
}

function bandColor(band) {
  if (band === "high") return "#B84A3A";
  if (band === "moderate") return "#B8872F";
  return "#2F8D62";
}

function renderPredictionCards(section) {
  return section.predictions.map((prediction) => {
    const no = String(prediction.index).padStart(2, "0");
    const actionTitle = cleanText(prediction.actionTitle || prediction.recommendedAction);
    return `<article class="pred"><div class="pred-top">
      <div class="pred-id"><span class="pno">WATCHPOINT ${no}</span><span class="seal">Structural preview</span></div>
      <div class="pred-main"><div class="window-label">${escapeHtml(prediction.windowLabel || prediction.oneLine)}</div><p class="pred-claim">${escapeHtml(prediction.statement)}</p></div>
      <div class="pred-verify"><span class="vl">Review window</span><span class="vd tnum">${escapeHtml(prediction.verifyByDisplay)}</span></div>
    </div><div class="prediction-bottom">
      <div class="evidence-block"><div class="pml">Evidence required</div><div class="pmv">${escapeHtml(prediction.evidenceRequired)}</div></div>
      <div class="action-block"><div class="pml">Suggested control action</div><div class="act-title">${escapeHtml(actionTitle)}</div><div class="act-meta">${escapeHtml(prediction.actionMeta)}</div><div class="act-reason">${escapeHtml(prediction.rationale)}</div></div>
      <div class="decision-output"><div class="pml">Decision focus</div><div class="pmv">${escapeHtml(prediction.decisionFocus)}</div></div>
    </div></article>`;
  }).join("");
}

function renderResourceZones(section) {
  return section.groups.filter((group) => group.count > 0).map((group) => {
    const rows = group.rows.map((row) => `<div class="rbar"><span><span class="rn">${escapeHtml(row.label)}</span><div class="rd">${escapeHtml(row.category)} | ${escapeHtml(row.direction)}</div></span><span class="rt"><span class="rf" style="width:${row.intensity}%; background-color:${bandColor(row.band)} !important; background:${bandColor(row.band)} !important;"></span></span><span class="rv tnum">${escapeHtml(row.intensity)}</span></div>`).join("");
    return `<div class="zone"><div class="zone-head"><span class="zone-dot" style="background:${bandColor(group.band)} !important"></span><span class="zone-name" style="color:${bandColor(group.band)} !important">${escapeHtml(group.label)}</span><span class="zone-count">${group.count} of ${escapeHtml(section.scannedLabel || `${section.scanned} DISPLAYED EXPOSED RESOURCES`)}</span></div><div class="rbars">${rows}</div></div>`;
  }).join("");
}

function renderActionPanel(title, actions) {
  return `<div class="act"><h4>${escapeHtml(title)}</h4>${actions.map((action) => `<div class="act-item"><div class="act-title">${escapeHtml(action.actionTitle)}</div><div class="act-meta">${escapeHtml(action.actionTiming)} | ${escapeHtml(action.actionOwner)} | expected effect: ${escapeHtml(action.actionExpectedEffect)}</div><div class="act-reason">${escapeHtml(action.actionReason)}</div></div>`).join("")}</div>`;
}

function collisionFindingHumanText(section) {
  const resources = Array.isArray(section.zones)
    ? section.zones.slice(0, 3).filter((resource) => cleanText(resource.name))
    : [];

  if (!resources.length) {
    return "The main friction is concentrated around the operating resources where the two environments rely on different behaviours. In practice, the integration team should protect these areas before making irreversible operating-model changes.";
  }

  const names = resources.map((resource) => cleanText(resource.name));
  const resourceList = names.length === 1
    ? names[0]
    : names.length === 2
      ? `${names[0]} and ${names[1]}`
      : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

  return cleanText(`The main friction is around ${resourceList}. The acquirer needs these resources to become visible, transferable, and governable during integration. The target is more likely to protect local routines, limit disclosure, or keep control over how these resources move. In practice, the risk is that integration does not create transparency. It may instead make critical routines harder to access, govern, or preserve.`);
}

function isTechnicalResourceDirection(text) {
  const value = cleanText(text);
  return /[+~-].+\bvs\b/i.test(value) || /\(.+\bvs\b.+\)/i.test(value);
}

function explainResourceInPractice(resource, band = "moderate") {
  const name = cleanText(resource.name || resource.label);
  const key = name.toLowerCase();
  const status = band === "high"
    ? "a low-match risk area"
    : band === "moderate"
      ? "a partial-match watch area"
      : "an alignment asset";

  if (band === "aligned") {
    if (key.includes("health")) return "Health is currently an alignment asset. Protect sustainable pace and avoid integration pressure that turns endurance into burnout.";
    if (key.includes("connections")) return "Connections are currently an alignment asset. Preserve informal coordination and key relationship holders while formal governance is redesigned.";
    if (key.includes("trust")) return "Trust is currently an alignment asset. Protect disclosure quality, credibility, and psychological safety during integration decisions.";
    if (key.includes("knowledge")) return "Knowledge is currently an alignment asset. Preserve the routines and people that keep know-how accessible before changing ownership of expertise.";
    if (key.includes("information")) return "Information is currently an alignment asset. Preserve signal flow and access to operating data while reporting lines are redesigned.";
    if (key.includes("creativity")) return "Creativity is currently an alignment asset. Preserve local problem-solving capacity while integration rules are being installed.";
    if (key.includes("decisiveness")) return "Decisiveness is currently an alignment asset. Preserve clear ownership and fast escalation paths during the transition.";
    if (key.includes("attention")) return "Attention is currently an alignment asset. Preserve leadership focus and keep critical post-close signals visible.";
    if (key.includes("organisation") || key.includes("organization") || key.includes("system")) return "Organisation / system is currently an alignment asset. Preserve the routines and cadence that already support stable execution.";
    return `${name} is currently an alignment asset. Protect it during integration rather than treating it as a present conflict zone.`;
  }

  if (key.includes("health")) return `Health is ${status}. Health conflict can raise burnout risk, reduce sustainable pace, and make the combined organisation dependent on short-term overextension.`;
  if (key.includes("connections")) return `Connections are ${status}. Connections conflict can weaken informal coordination, isolate key relationship holders, and increase dependency on a small number of brokers.`;
  if (key.includes("trust")) return `Trust is ${status}. Trust conflict can trigger defensive behaviour, reduce disclosure quality, and make even technically sound integration decisions feel unsafe.`;
  if (key.includes("knowledge")) return `Knowledge is ${status}. Knowledge conflict can block transfer of know-how, make expertise harder to access, and increase the chance that critical operating memory leaves with key people.`;
  if (key.includes("information")) return `Information is ${status}. Information conflict can weaken signal flow, delay issue detection, and make integration decisions depend on incomplete or protected data.`;
  if (key.includes("creativity")) return `Creativity is ${status}. Creativity conflict can suppress useful adaptation, make new operating ideas feel unsafe, and reduce the target's ability to solve integration problems locally.`;
  if (key.includes("decisiveness")) return `Decisiveness is ${status}. Decisiveness conflict can create decision stalls, repeated escalation, and unclear ownership when integration tradeoffs need fast resolution.`;
  if (key.includes("attention")) return `Attention is ${status}. Attention conflict can fragment leadership focus, slow issue detection, and make critical post-close signals easier to miss.`;
  if (key.includes("organisation") || key.includes("organization") || key.includes("system")) return `Organisation / system is ${status}. Organisation / system conflict can make routines, ownership, and operating cadence harder to stabilise after close.`;

  return `${name} is ${status}. Monitor it during integration and avoid changing the target operating rhythm before the Day 60 review.`;
}

function resourceSummaryItems(section) {
  const groups = Array.isArray(section.groups) ? section.groups : [];
  const items = [];
  for (const band of ["high", "moderate", "aligned"]) {
    const group = groups.find((entry) => entry.band === band);
    const rows = Array.isArray(group?.rows) ? group.rows : [];
    for (const row of rows) {
      const name = cleanText(row.label || row.name);
      if (name) items.push({ ...row, name, band });
    }
  }
  return items;
}

function renderResourceConflictSummary(section) {
  const items = resourceSummaryItems(section);
  if (!items.length) return "";

  const watchItems = items.filter((resource) => resource.band === "high" || resource.band === "moderate");
  const alignedItems = items.filter((resource) => resource.band === "aligned");
  const displayItems = watchItems.length
    ? watchItems.slice(0, 3).concat(alignedItems.slice(0, Math.max(0, 3 - Math.min(3, watchItems.length))))
    : alignedItems.slice(0, 3);

  const watchNames = watchItems.map((resource) => resource.name).join(", ");
  const alignedNames = alignedItems.map((resource) => resource.name).join(", ");
  const intro = watchItems.length && alignedItems.length
    ? `The map does not say that the deal will fail. It separates current watch areas from alignment assets. In this case, the main watch areas are ${watchNames}. ${alignedNames} are alignment assets: they should be protected during integration, not treated as current conflict zones.`
    : watchItems.length
      ? `The map does not say that the deal will fail. It shows where the two operating environments have low or partial structural match. In this case, the main watch areas are ${watchNames}. These are the places where integration decisions need the most control.`
      : `The map does not say that the deal will fail. It shows that the listed resources are currently alignment assets. The main task is to protect ${alignedNames} during integration so that existing strengths are not damaged by careless operating-model changes.`;

  const rows = displayItems.map((resource) => {
    const explanation = explainResourceInPractice(resource, resource.band);
    return `<div class="resource-summary-row"><span>${escapeHtml(resource.name)}</span><p>${escapeHtml(explanation)}</p></div>`;
  }).join("");

  const ecsClarifier = "ECS is a compatibility score: higher means stronger alignment. Resource scores are contestation-intensity scores: higher means greater integration pressure. The two scales are related but intentionally read in opposite directions. ECS is not an average of the displayed resources. It reflects compatibility across the full 17-resource model; this page displays selected resources where integration pressure is most likely to damage or preserve value. Public preview displays selected exposed resources. ECS is derived from the full 17-resource model."; return `<div class="resource-summary"><h4>What this means in practice</h4><p>${escapeHtml(intro)} ${escapeHtml(ecsClarifier)}</p><div class="resource-summary-grid">${rows}</div></div>`;
}

function explainEconomicCategory(label) {
  const text = cleanText(label).toLowerCase();
  if (text.includes("operating drift")) return "Risk that post-close working rhythm, management discipline, and operating process start drifting away from the integration plan.";
  if (text.includes("knowledge leakage")) return "Risk that critical know-how is lost, blocked, or made inaccessible as people leave, protect local practices, or stop transferring expertise.";
  if (text.includes("decision delay")) return "Risk that decisions slow down because governance, authority, documentation, and escalation logic do not match across the combined organisation.";
  return "Risk indicator showing where economic exposure may appear if behavioural friction persists after close.";
}

function explainEconomicScore(label, value) {
  const score = Math.max(0, Math.min(100, Number(value) || 0));
  const text = cleanText(label).toLowerCase();
  if (text.includes("operating drift")) return "";
  if (text.includes("knowledge leakage")) return "";
  if (text.includes("decision delay")) return "";
  return "";
}


function renderEngagementBenefit(benefit) {
  const text = cleanText(benefit).replace(/\s+\|\s+/g, ". ").replace(/\beyond survey noise\./i, "Beyond survey noise.");
  if (/^De-risked next step\./i.test(text)) {
    const rest = text.replace(/^De-risked next step\.\s*/i, "");
    return `<p><strong class="eng-next-step">De-risked next step.</strong> ${escapeHtml(rest)}</p>`;
  }

  const match = text.match(/^(\d+\.\s*)(ARTIFACT-REVIEWED ENVIRONMENT CODING|Role-Level Control Design|SEALED FORECAST LEDGER)\s*\.\s*(.*)$/i) || text.match(/^(\d+\.)(ARTIFACT-REVIEWED ENVIRONMENT CODING|Role-Level Control Design|SEALED FORECAST LEDGER)\s*\.\s*(.*)$/i);
  if (!match) return `<p>${escapeHtml(text)}</p>`;

  const prefix = match[1].trimEnd() + " ";
  const title = match[2];
  const rest = match[3] || "";

  return `<p><span class="eng-benefit-head">${escapeHtml(prefix.trimEnd())}&nbsp;${escapeHtml(title)}</span>. ${escapeHtml(rest)}</p>`;
}

function renderHtmlSection(section, number, context = {}) {
  if (section.id === "predictions") {
    return `<section class="sec" id="predictions" data-screen-label="${escapeHtml(COMBINED_PREDICTION_TITLE)}">${sectionHead(number, section.title, COMBINED_PREDICTION_NOTE)}<div class="panel prediction-banner"><h4>STRUCTURAL WATCHPOINTS</h4><p>This public preview is not a scored forecast ledger. Each watchpoint is paired with a review window, evidence to inspect, and a suggested control action. Scored role-level forecasts require the paid workflow and sealed pre-outcome logging.</p></div><div class="preds-wrap prediction-stack">${renderPredictionCards(section)}</div></section>`;
  }
  if (section.id === "environments") {
    const renderEnvironmentCard = (role, env) => {
      const rows = [["Definition", env.oneLineDefinition || env.description], ["Authority", env.authorityStructure], ["Decision logic", env.behaviorPattern], ["Innovation stance", env.innovationStance], ["Economic function", env.economicFunction], ["Resource focus", env.resourceTarget], ["Systemic role", env.systemicRole]].filter(([, value]) => cleanText(value));
      return `<article class="env env-rich"><div class="role">${escapeHtml(role)}</div><div class="co">${escapeHtml(env.name)}</div><div class="arc">${escapeHtml(env.environment)}</div><p>${escapeHtml(env.description)}</p><div class="env-facts">${rows.map(([label, value]) => `<div class="env-fact"><span>${escapeHtml(label)}</span><p>${escapeHtml(value)}</p></div>`).join("")}</div></article>`;
    };
    return `<section class="sec" id="environments" data-screen-label="Identified Environment Types">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.environments)}<div class="envs">${renderEnvironmentCard("Acquirer", section.acquirer)}${renderEnvironmentCard("Target", section.target)}</div><div class="panel env-bridge"><strong>Core mismatch.</strong> ${escapeHtml(section.coreMismatch || "The core mismatch depends on the two identified operating environments.")}</div></section>`;
  }
  if (section.id === "collision") {
    const humanFinding = collisionFindingHumanText(section);
    const collisionRows = [
      ["Core thesis", "The deal risk is premature translation of the target operating system into the acquirer's management language.", false],
      ["What we found", humanFinding, false],
      ["Why it matters", section.postCloseFailureMode || section.whyItMatters || section.summary, false],
      ["What you can do", "Protect the affected operating resources first; delay irreversible integration changes until the Day 60 early-checkpoint review indicates which routines should be preserved, simplified, or integrated.", false],
    ].filter(([, value]) => cleanText(value));

    return `<section class="sec" id="collision" data-screen-label="Collision Thesis">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.collision)}<div class="collide">${collisionRows.map(([label, value, isHtml]) => `<div class="collide-row"><div class="cl">${escapeHtml(label)}</div><div class="cr">${isHtml ? value : escapeHtml(value)}</div></div>`).join("")}</div></section>`;
  }
  if (section.id === "resources") {
    return `<section class="sec" id="resources" data-screen-label="Resource Map">${sectionHead(number, section.title, `${section.scanned} resources scanned`)}<p class="thresholds">${escapeHtml(section.explanation)}</p><div class="legend"><span class="lg">Legend</span><span class="lg"><span class="sw" style="background:var(--sig-risk)"></span>High-risk | 70-100</span><span class="lg"><span class="sw" style="background:var(--sig-mod)"></span>Moderate | 40-69</span><span class="lg"><span class="sw" style="background:var(--sig-high)"></span>Aligned | 0-39</span><span class="anchor">Score = structural contestation intensity</span></div>${renderResourceZones(section)}${renderResourceConflictSummary(section)}</section>`;
  }
  if (section.id === "timeline") {
    const actions = context.actions ?? {};
    const columns = section.phases.map((phase, index) => {
      const watchFor = cleanText(phase.watchFor);
      return `<div class="tl-col"><div class="tl-progress"><span></span></div><div class="tl-when"><span class="ph">FP${index + 1} | ${escapeHtml(phase.verifyBy)}</span><span class="win">${escapeHtml(phase.verifyBy)}</span></div><div class="tl-body"><div class="h">${escapeHtml(phase.heading)}</div><p>${escapeHtml(phase.body)}</p>${watchFor ? `<div class="tl-marker"><div class="ml">Watch for:</div><div class="mv">${escapeHtml(watchFor)}</div></div>` : ""}</div></div>`;
    }).join("");
    const beforeClose = actions.beforeClose ?? [];
    const afterClose = [...(actions.afterClose ?? [])].sort((left, right) => {
      const leftTiming = cleanText(left.actionTiming);
      const rightTiming = cleanText(right.actionTiming);
      const leftDay60 = /\bday\s*60\b/i.test(leftTiming);
      const rightDay60 = /\bday\s*60\b/i.test(rightTiming);
      if (leftDay60 === rightDay60) return 0;
      return leftDay60 ? 1 : -1;
    });
    const actionPanels = [
      beforeClose.length ? renderActionPanel("Before close", beforeClose) : "",
      afterClose.length ? renderActionPanel("After close", afterClose) : "",
    ].filter(Boolean);
    const proposedActions = actionPanels.length ? `<div class="timeline-actions"><h4 class="timeline-actions-title">Proposed actions</h4><div class="acts${actionPanels.length === 1 ? " acts-single" : ""}">${actionPanels.join("")}</div></div>` : "";
    return `<section class="sec" id="timeline" data-screen-label="Timeline of Proposed Actions">${sectionHead(number, "Timeline of Proposed Actions", ARCHIVE_SECTION_NOTES.timeline)}<div class="legend"><span>${escapeHtml(section.timingLogic.signalSetup)}</span><span>${escapeHtml(section.timingLogic.observationWindow)}</span><span>${escapeHtml(section.timingLogic.verificationDeadline)}</span></div><div class="tl">${columns}</div>${proposedActions}</section>`;
  }
  if (section.id === "economics") {
    const channels = Array.isArray(section.economicTriageChannels) ? section.economicTriageChannels : [];
    const channelRows = channels.map((channel) => `<div class="evrow exposure-channel"><span class="ek"><b>${escapeHtml(channel.label)}</b>${channel.meaning ? `<small>${escapeHtml(channel.meaning)}</small>` : ""}</span><span class="ev"><b>${escapeHtml(channel.severity)}</b>${channel.testFirst ? `<small>Test first: ${escapeHtml(channel.testFirst)}</small>` : ""}</span></div>`).join("");
    const dealValueRow = cleanText(section.enterpriseValueBand)
      ? `<div class="collide-row"><div class="cl">Deal value context</div><div class="cr">${escapeHtml(section.enterpriseValueBand)}</div></div>`
      : "";
    return `<section class="sec" id="economic" data-screen-label="Economic Exposure Triage">${sectionHead(number, "Economic Exposure Triage", ARCHIVE_SECTION_NOTES.economics)}<div class="panel economic-message"><strong>Preview judgement.</strong> ${escapeHtml(section.economicTriageJudgement)}</div><div class="env-total"><div class="et-l"><div class="lab">Economic posture</div><div class="economic-label">${escapeHtml(section.economicRiskPosture)}</div></div><div class="et-r">${escapeHtml(section.valuationDisclaimer)}<br>${escapeHtml(section.evUse)}</div></div><div class="collide"><div class="collide-row"><div class="cl">Posture rule</div><div class="cr">${escapeHtml(section.economicTriageRule)}</div></div><div class="collide-row"><div class="cl">Why this is High</div><div class="cr">${escapeHtml(section.economicTriageReason)}</div></div>${dealValueRow}</div><div class="panel decision-gap"><h4>Exposure channels</h4><div class="decision-gap-grid">${channelRows}</div></div><div class="collide"><div class="collide-row"><div class="cl">What this preview can say</div><div class="cr">${escapeHtml(section.whatThisPreviewCanSay)}</div></div><div class="collide-row"><div class="cl">What it cannot say</div><div class="cr">${escapeHtml(section.whatThisPreviewCannotSay)}</div></div><div class="collide-row"><div class="cl">Required for quantified modelling</div><div class="cr">${escapeHtml(section.requiredForQuantifiedModelling)}</div></div></div></section>`;
  }
  if (section.id === "actions") {
    return `<section class="sec" id="actions" data-screen-label="Recommended Actions">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.actions)}<div class="acts">${renderActionPanel("Before close", section.beforeClose)}${renderActionPanel("After close", section.afterClose)}</div><div class="cta"><div><div class="cl">Recommended next action</div><div class="ct">${escapeHtml(section.beforeClose[0]?.actionTitle || section.afterClose[0]?.actionTitle)}</div></div><div class="cbtn">Book practitioner session</div></div></section>`;
  }
  if (section.id === "evidence") {
    const gaps = [
      ["Who carries the risk", "Which role categories, leadership functions, operating dependencies, or teams are most exposed to disengagement, resistance, or knowledge loss."],
      ["What must be protected", "Which decision rights, knowledge flows, routines, or trust mechanisms should be preserved before integration changes begin."],
      ["Which value pools are actually exposed", "The preview provides a directional economic triage posture; the full engagement allocates exposure to actual value pools, owners, time windows, and mitigation levers."],
    ];
    return `<section class="sec" id="evidence" data-screen-label="Decision Gap">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.evidence)}<div class="panel decision-gap"><h4>What this preview cannot decide for you</h4><p>This brief identifies the likely post-close fault lines and gives a directional economic triage posture, but it does not yet allocate risk across role categories, protected routines, governance layers, value pools, or mitigation levers.</p><div class="decision-gap-grid">${gaps.map(([label, value]) => `<div class="evrow"><span class="ek">${escapeHtml(label)}</span><span class="ev">${escapeHtml(value)}</span></div>`).join("")}</div><p><strong>The full engagement converts this preview into an executable integration-control plan.</strong></p></div></section>`;
  }
  if (section.id === "engagement") {
    return `<section class="sec" id="engagement" data-screen-label="Full Engagement Adds">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.engagement)}<div class="panel">${section.benefits.map(renderEngagementBenefit).join("")}</div><div class="cta"><div><div class="cl">Engagement contact</div><div class="ct">${escapeHtml(section.cta)}</div></div><a class="cbtn" href="mailto:${escapeHtml(section.contactEmail)}">${escapeHtml(section.contactEmail)}</a></div></section>`;
  }
  if (section.id === "audit") {
    return `<footer class="audit" id="audit">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.audit)}<div class="audit-grid"><div class="audit-col"><div class="acl">Methodology</div><div class="acv"><b>Mergevue Forecast Method</b><br>${escapeHtml(section.reportVersion)}<br>${escapeHtml(section.contactEmail)}<div class="audit-tracker"><b>Preview verification tracker</b><br>Display-only preview; not ledger-recorded. Verification outcomes require the engagement workflow before any public record treatment.</div></div></div><div class="audit-col"><div class="acl">Audit trail</div><div class="acv">Report | <b>${escapeHtml(section.reportId)}</b><br>Generated | ${escapeHtml(section.generatedAt)}<br>Scenario | ${escapeHtml(section.scenarioId)}<br>Tracker | ${escapeHtml(section.trackRecordUrl)}</div></div><div class="audit-qr"><div class="qr" aria-label="QR ${escapeHtml(section.qrLabel)}"></div><div class="ql">Preview audit<br>reference</div></div></div><div class="audit-foot"><span>(c) 2026 Mergevue</span><span>Display-only preview; not ledger-recorded.</span></div></footer>`;
  }
  return `<section class="sec">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES[section.id] ?? "")}</section>`;
}
