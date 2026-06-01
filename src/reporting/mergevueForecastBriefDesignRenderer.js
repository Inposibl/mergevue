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

const ARCHIVE_SECTION_NOTES = Object.freeze({
  exec: "Executive Summary",
  predictions: "Display-only prediction preview",
  scenario: "Compatibility and deal grid",
  environments: "Two operating logics",
  collision: "Collision thesis",
  resources: "Resource map",
  timeline: "Derived from sealed prediction windows",
  economics: "Decision posture, not valuation",
  actions: "Before and after close",
  evidence: "Showing the work",
  engagement: "Full engagement adds",
  audit: "Audit trail",
});

const SCORE_BAND_LABEL = Object.freeze({
  high: "High Compatibility",
  mod: "Moderate Compatibility",
  risk: "High Friction Risk",
  pending: "Pending",
});

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\s+-\s+/g, " — ")
    .replace(/\s+/g, " ")
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

export function forecastBriefScoreBand(score) {
  if (!Number.isFinite(score)) return "pending";
  if (score >= 67) return "high";
  if (score >= 34) return "mod";
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

function actionBuckets(actions) {
  const beforeClose = [];
  const afterClose = [];
  for (const action of actions ?? []) {
    const publicAction = Object.freeze({
      actionTitle: cleanText(action.actionTitle),
      actionTiming: cleanText(action.actionTiming),
      actionOwner: cleanText(action.actionOwner),
      actionReason: cleanText(action.actionReason) ? `Rationale: ${cleanText(action.actionReason)}` : "",
      actionExpectedEffect: cleanText(action.actionExpectedEffect),
    });
    const timing = cleanText(action.actionTiming).toLowerCase();
    if (/after|day\s*[3-9]|\b60\b|post/i.test(timing)) {
      afterClose.push(publicAction);
    } else {
      beforeClose.push(publicAction);
    }
  }
  return {
    beforeClose: beforeClose.length ? beforeClose : (actions ?? []).slice(0, 2),
    afterClose: afterClose.length ? afterClose : (actions ?? []).slice(2),
  };
}

function conflictBandFromIntensity(intensity) {
  if (intensity >= 70) return "high";
  if (intensity >= 40) return "moderate";
  return "aligned";
}

function archiveResourceGroups(resources = []) {
  const groups = [
    { band: "high", label: "High-risk · 70–100", rows: [] },
    { band: "moderate", label: "Moderate · 40–69", rows: [] },
    { band: "aligned", label: "Aligned · 0–39", rows: [] },
  ];
  for (const resource of resources) {
    const intensity = Math.max(0, Math.min(100, Number(resource.conflictIntensity) || 0));
    const band = conflictBandFromIntensity(intensity);
    const group = groups.find((item) => item.band === band);
    group.rows.push(Object.freeze({
      label: cleanText(resource.resourceName),
      category: cleanText(resource.resourceCategory),
      direction: cleanText(resource.direction),
      explanation: cleanText(resource.explanation),
      intensity,
      band,
      sourceBand: cleanText(resource.conflictBand),
    }));
  }
  return Object.freeze(groups.map((group) => Object.freeze({
    ...group,
    count: group.rows.length,
    rows: Object.freeze(group.rows),
  })));
}

function predictionCard(prediction, index) {
  const statement = cleanText(prediction.predictionClaim);
  const evidenceRequired = distinctText(prediction.observableSignal, statement);
  const verification = distinctText(prediction.verificationMethod, evidenceRequired || statement);
  return Object.freeze({
    id: `P${index + 1}`,
    index: index + 1,
    oneLine: cleanText(prediction.predictionTitle).replace(/\.$/, ""),
    statement,
    evidenceRequired,
    verifyBy: cleanText(prediction.predictionWindow),
    verifyByDisplay: cleanText(prediction.predictionWindow),
    window: cleanText(prediction.predictionWindow),
    falsificationCondition: verification,
    lockId: `sealed-preview-${index + 1}`,
    sealed: true,
  });
}

function timelinePhase(prediction, index) {
  const oneLine = cleanText(prediction.oneLine).replace(/\.$/, "");
  const body = bodyAfterFirstSentence(prediction.statement);
  return Object.freeze({
    id: `T${index + 1}`,
    heading: oneLine,
    body: distinctText(body, oneLine),
    watchFor: distinctText(prediction.evidenceRequired, body),
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
  const predictions = Object.freeze(sealed.predictions.map(predictionCard));
  const actions = actionBuckets(report.recommendedActions);
  const includeAppendixSections = options.includeAppendixSections !== false;
  const resourceGroups = archiveResourceGroups(resources.resources);
  const issuedAt = cleanText(audit.generatedAt).slice(0, 10);
  const acquirerPattern = publicEnvironmentName(environments.acquirerEnvironmentName, environments.acquirerEnvironmentCode);
  const targetPattern = publicEnvironmentName(environments.targetEnvironmentName, environments.targetEnvironmentCode);

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
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[1],
      statusTitle: sealed.statusTitle,
      statusDescription: sealed.statusDescription,
      previewOneLiners: predictions.map((prediction) => prediction.oneLine),
      trackerStatement: "Display-only preview; not ledger-recorded. Verification outcomes require the engagement workflow before any public record treatment.",
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
      },
      target: {
        name: scenario.targetName,
        environment: targetPattern,
        description: environments.targetEnvironmentDescription,
        behaviorPattern: environments.targetBehaviorPattern,
      },
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
      legend: ["High-risk · 70–100", "Moderate · 40–69", "Aligned · 0–39"],
      scanned: resources.resources.length,
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
      enterpriseValueBand: stripLabel(economics.enterpriseValueBand, "Enterprise value band"),
      valuationDisclaimer: economics.valuationDisclaimer,
      economicRiskPosture: economics.economicRiskPosture,
      engagementTierRequirement: economics.engagementTierRequirement,
      categories: [
        { label: "Operating drift", value: 72 },
        { label: "Knowledge leakage", value: 64 },
        { label: "Decision delay", value: 58 },
      ],
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
      tierLabel: "Public Forecast Brief",
      confidential: false,
    }),
    header: Object.freeze({
      eyebrow: `${report.brand.reportType.toUpperCase()} · ${report.brand.product.toUpperCase()}`,
      title: `${scenario.acquirerName} × ${scenario.targetName}`,
      subtitle: "Display-only forecast preview. This is a specification of expected post-deal behaviour, not a verdict on the deal.",
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
      legend: "Score = structural contestation intensity · 0 aligned → 100 maximal conflict",
      scanned: resources.resources.length,
      groups: resourceGroups,
    }),
    sealedPredictions: predictions,
    trackRecord: Object.freeze({
      statement: "Display-only preview; not ledger-recorded. Engagement verification can convert these claims into a controlled audit workflow.",
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
  :root{ --maxw:880px; --gut:42px; --bg:#f6f7f8; --ink:#161616; --ink-2:#555d66; --ink-3:#8a949e; --surface:#fff; --surface-2:#f3f5f7; --line:#d9dde2; --line-strong:#b9c1ca; --accent:#2e75b6; --accent-soft:#e8f2fb; --sig-high:#2e7d32; --sig-mod:#e8a33d; --sig-risk:#c0392b; --mono:ui-monospace,SFMono-Regular,Consolas,monospace; --hair:1px; --r:8px; --card-border:var(--hair) solid var(--line); --card-shadow:0 10px 28px rgba(23,50,77,.08); --display-weight:650; color-scheme:light; font-family:Inter,Arial,sans-serif; }
  *{ box-sizing:border-box; } body{ margin:0; background:var(--bg); color:var(--ink); } .controls{ position:sticky; top:0; z-index:50; display:flex; align-items:center; gap:12px; padding:12px 20px; border-bottom:var(--hair) solid var(--line); background:color-mix(in oklab,var(--surface) 86%,transparent); backdrop-filter:blur(10px); } .controls .cb-brand{ font-family:var(--mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-2); } .cb-print{ margin-left:auto; border:var(--hair) solid var(--line-strong); border-radius:100px; background:transparent; padding:8px 13px; font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
  .sheet{ max-width:var(--maxw); margin:0 auto; padding:0 var(--gut) 70px; background:var(--bg); } .mono{ font-family:var(--mono); } .tnum{ font-variant-numeric:tabular-nums; } .kicker{ font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-3); }
  .sec{ padding-top:40px; break-inside:avoid; } .sec-head{ display:flex; align-items:baseline; gap:14px; padding-bottom:14px; margin-bottom:22px; border-bottom:var(--hair) solid var(--line-strong); } .sec-num{ font-family:var(--mono); font-size:12px; color:var(--accent); font-weight:500; } .sec-title{ font-size:19px; font-weight:600; } .sec-note{ margin-left:auto; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-3); }
  .mast,.masthead{ padding:44px 0 0; } .mast-row{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px; } .brand{ display:flex; align-items:center; gap:14px; } .mark{ width:38px; height:38px; border-radius:12px; background:linear-gradient(135deg,var(--accent),#17324d); } .brand-name{ font-size:13px; font-weight:650; letter-spacing:.02em; } .brand-sub{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-3); margin-top:3px; } .mast-meta{ text-align:right; font-family:var(--mono); font-size:10.5px; line-height:1.7; color:var(--ink-2); } .mast-meta b{ color:var(--ink); font-weight:500; } .classif{ display:inline-flex; margin-top:6px; padding:3px 9px; border:var(--hair) solid var(--line-strong); border-radius:100px; font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; }
  .doc-title-wrap{ padding:34px 0 30px; border-bottom:var(--hair) solid var(--line-strong); } .doc-type{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--accent); } .doc-title{ font-size:44px; font-weight:var(--display-weight); line-height:1.02; margin:12px 0 0; } .doc-title .x{ color:var(--ink-3); font-weight:300; } .doc-sub{ margin-top:14px; font-size:14px; color:var(--ink-2); max-width:62ch; line-height:1.55; }
  .exec{ margin-top:30px; display:grid; grid-template-columns:300px 1fr; border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); overflow:hidden; } .exec-score{ padding:30px 28px; border-right:var(--card-border); display:flex; flex-direction:column; } .score-num{ font-size:118px; font-weight:var(--display-weight); line-height:.86; letter-spacing:-.04em; } .score-of{ font-family:var(--mono); font-size:12px; color:var(--ink-3); } .band-pill{ align-self:flex-start; margin-top:16px; padding:5px 12px; border-radius:100px; font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; font-weight:500; } .band-high{ background:color-mix(in oklab,var(--sig-high) 16%,var(--surface)); color:var(--sig-high); } .band-mod{ background:color-mix(in oklab,var(--sig-mod) 18%,var(--surface)); color:var(--sig-mod); } .band-risk{ background:color-mix(in oklab,var(--sig-risk) 16%,var(--surface)); color:var(--sig-risk); }
  .score-scale{ margin-top:18px; } .scale-track{ height:5px; border-radius:3px; background:linear-gradient(90deg,var(--sig-risk),var(--sig-mod) 55%,var(--sig-high)); position:relative; } .scale-mark{ position:absolute; top:-4px; width:2px; height:13px; background:var(--ink); border-radius:2px; } .scale-ends{ display:flex; justify-content:space-between; font-family:var(--mono); font-size:9px; color:var(--ink-3); margin-top:6px; } .gate{ margin-top:auto; padding-top:20px; } .gate-row{ display:flex; align-items:center; gap:8px; } .gate-label{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-2); } .pips{ display:flex; gap:4px; } .pip{ width:14px; height:6px; border-radius:2px; background:var(--line-strong); } .pip.on{ background:var(--accent); } .gate-verdict{ font-family:var(--mono); font-size:10.5px; color:var(--ink-2); margin-top:8px; line-height:1.5; }
  .exec-body{ padding:26px 28px; display:flex; flex-direction:column; gap:18px; } .exec-thesis{ font-size:20px; font-weight:500; line-height:1.32; } .exec-deal{ display:flex; flex-wrap:wrap; gap:10px 26px; padding:14px 0; border-top:var(--card-border); border-bottom:var(--card-border); } .deal-cell{ display:flex; flex-direction:column; gap:3px; } .deal-cell .k{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .deal-cell .v{ font-size:13.5px; font-weight:500; } .deal-cell small{ color:var(--ink-2); font-weight:400; } .exec-preds{ display:flex; flex-direction:column; gap:9px; } .exec-preds .epl{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .epred{ display:grid; grid-template-columns:92px 1fr; gap:12px; align-items:baseline; } .epred .when{ font-family:var(--mono); font-size:11px; color:var(--accent); font-weight:500; } .epred .what{ font-size:13px; line-height:1.4; } .exec-action{ display:flex; align-items:center; gap:12px; padding:13px 16px; background:var(--accent-soft); border-radius:var(--r); } .exec-action .lab{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); flex:none; } .exec-action .txt{ font-size:13px; font-weight:500; }
  .preds-wrap{ display:flex; flex-direction:column; gap:16px; } .pred{ border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); overflow:hidden; break-inside:avoid; } .pred-top{ display:flex; align-items:stretch; } .pred-id{ flex:none; width:150px; padding:20px; border-right:var(--card-border); background:var(--surface-2); display:flex; flex-direction:column; gap:8px; } .pred-id .pno{ font-family:var(--mono); font-size:11px; color:var(--ink-3); letter-spacing:.1em; } .pred-id .seal{ display:inline-flex; align-items:center; gap:6px; font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--sig-high); font-weight:500; } .pred-id .seal:before{ content:""; width:7px; height:7px; border-radius:50%; background:var(--sig-high); } .pred-id .lock{ font-family:var(--mono); font-size:9px; color:var(--ink-3); word-break:break-all; line-height:1.4; margin-top:auto; } .pred-main{ flex:1; padding:20px 24px; } .pred-claim{ font-size:16px; font-weight:500; line-height:1.42; } .pred-verify{ flex:none; width:170px; padding:20px; border-left:var(--card-border); text-align:right; display:flex; flex-direction:column; } .pred-verify .vl{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .pred-verify .vd{ font-family:var(--mono); font-size:21px; font-weight:600; margin-top:5px; } .pred-verify .vw{ font-family:var(--mono); font-size:10.5px; color:var(--accent); margin-top:6px; } .pred-meta{ display:grid; grid-template-columns:1fr 1fr; border-top:var(--card-border); } .pred-meta .pm{ padding:13px 24px; } .pred-meta .pm+.pm{ border-left:var(--card-border); } .pred-meta .pml{ font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; } .pred-meta .pmv{ font-size:12.5px; color:var(--ink-2); line-height:1.45; }
  .tracker{ display:flex; align-items:center; gap:22px; padding:20px 24px; border:var(--card-border); border-radius:var(--r); background:var(--accent-soft); margin-top:16px; break-inside:avoid; } .qr,.audit-qr .qr{ width:96px; height:96px; flex:none; display:block; border:8px solid var(--ink); background:repeating-linear-gradient(45deg,#fff 0 4px,var(--ink) 4px 8px); } .tracker h4{ font-size:14px; font-weight:600; margin:0; } .tracker p{ font-size:12.5px; color:var(--ink-2); margin:6px 0 0; max-width:52ch; line-height:1.5; } .tk-url{ font-family:var(--mono); font-size:12px; color:var(--accent); margin-top:9px; font-weight:500; }
  .envs{ display:grid; grid-template-columns:1fr 1fr; gap:16px; } .env,.panel{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:22px; box-shadow:var(--card-shadow); break-inside:avoid; } .env .role{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); } .env .co{ font-size:15px; font-weight:600; margin-top:4px; } .env .arc{ font-size:18px; font-weight:600; margin-top:10px; color:var(--accent); } .env p,.panel p{ font-size:13px; color:var(--ink-2); line-height:1.55; margin:10px 0 0; } .collide{ margin-top:16px; border:var(--card-border); border-radius:var(--r); overflow:hidden; } .collide-row{ display:grid; grid-template-columns:210px 1fr; } .collide-row+.collide-row{ border-top:var(--card-border); } .collide-row .cl{ padding:14px 18px; background:var(--surface-2); font-size:12px; font-weight:600; border-right:var(--card-border); } .collide-row .cr{ padding:14px 18px; font-size:12.5px; color:var(--ink-2); line-height:1.5; background:var(--surface); }
  .legend{ display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; margin-bottom:18px; font-family:var(--mono); font-size:10.5px; color:var(--ink-2); } .legend .lg{ display:flex; align-items:center; gap:7px; } .legend .sw{ width:11px; height:11px; border-radius:2px; } .legend .anchor{ margin-left:auto; color:var(--ink-3); } .zone{ margin-bottom:14px; } .zone-head{ display:flex; align-items:center; gap:10px; margin-bottom:8px; } .zone-dot{ width:9px; height:9px; border-radius:50%; } .zone-name{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; font-weight:500; } .zone-count{ font-family:var(--mono); font-size:10px; color:var(--ink-3); } .rbars{ border:var(--card-border); border-radius:var(--r); overflow:hidden; background:var(--surface); } .rbar{ display:grid; grid-template-columns:160px 1fr 46px; align-items:center; gap:14px; padding:9px 16px; } .rbar+.rbar{ border-top:var(--card-border); } .rn{ font-size:12px; font-weight:500; } .rd{ font-size:11px; color:var(--ink-3); margin-top:2px; } .rt{ height:7px; border-radius:4px; background:var(--surface-2); position:relative; overflow:hidden; } .rf{ position:absolute; left:0; top:0; bottom:0; border-radius:4px; } .rv{ font-family:var(--mono); font-size:11px; text-align:right; color:var(--ink-2); }
  .tl{ display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:var(--card-border); border-radius:var(--r); overflow:hidden; background:var(--surface); break-inside:avoid; } .tl-col+.tl-col{ border-left:var(--card-border); } .tl-progress{ display:flex; height:4px; } .tl-progress span{ flex:1; background:var(--accent); } .tl-when{ padding:14px 18px; background:var(--surface-2); border-bottom:var(--card-border); display:flex; align-items:baseline; justify-content:space-between; } .tl-when .ph{ font-family:var(--mono); font-size:11px; color:var(--accent); font-weight:500; } .tl-when .win{ font-family:var(--mono); font-size:10px; color:var(--ink-3); } .tl-body{ padding:16px 18px; } .tl-body .h{ font-size:13.5px; font-weight:600; line-height:1.3; } .tl-body p{ font-size:12px; color:var(--ink-2); line-height:1.5; margin-top:9px; } .tl-marker{ margin-top:14px; padding-top:12px; border-top:var(--card-border); } .tl-marker .ml{ font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:5px; } .tl-marker .mv{ font-size:11.5px; line-height:1.4; }
  .env-total{ display:flex; align-items:flex-end; justify-content:space-between; gap:24px; padding:22px 24px; border:var(--card-border); border-radius:var(--r); background:var(--surface); box-shadow:var(--card-shadow); margin-bottom:14px; } .et-l .lab{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); } .rng{ font-size:38px; font-weight:var(--display-weight); margin-top:6px; } .et-r{ text-align:right; font-family:var(--mono); font-size:11px; color:var(--ink-2); line-height:1.7; } .cats{ display:flex; flex-direction:column; gap:10px; } .cat{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:14px 18px; break-inside:avoid; } .cat-top{ display:flex; justify-content:space-between; align-items:baseline; gap:16px; } .cn{ font-size:13px; font-weight:600; } .cr{ font-family:var(--mono); font-size:13px; font-weight:500; } .cat p{ font-size:12px; color:var(--ink-2); line-height:1.5; margin-top:6px; } .cat-bar,.bar{ height:6px; border-radius:4px; background:var(--surface-2); margin-top:10px; position:relative; overflow:hidden; } .cat-bar span,.bar i{ position:absolute; top:0; bottom:0; left:0; border-radius:4px; background:var(--accent); }
  .acts,.split2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; } .act{ border:var(--card-border); border-radius:var(--r); background:var(--surface); padding:20px 22px; } .act h4,.panel h4{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin:0 0 14px; } .act-item{ padding:10px 0; border-top:var(--card-border); } .act-item:first-of-type{ border-top:0; } .act-title{ font-size:12.8px; font-weight:600; } .act-meta{ font-family:var(--mono); font-size:10px; color:var(--ink-3); margin-top:5px; } .act-reason{ font-size:12px; color:var(--ink-2); line-height:1.45; margin-top:6px; } .cta{ margin-top:16px; display:flex; align-items:center; gap:20px; padding:22px 26px; border-radius:var(--r); background:var(--ink); color:var(--bg); break-inside:avoid; } .cta .cl{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:#c8d0d8; } .cta .ct{ font-size:17px; font-weight:600; margin-top:6px; line-height:1.3; } .cta .cbtn{ margin-left:auto; padding:11px 20px; border-radius:100px; background:var(--accent); color:white; font-family:var(--mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; white-space:nowrap; }
  .evrow{ display:flex; justify-content:space-between; gap:14px; padding:9px 0; border-bottom:var(--card-border); font-size:12.5px; } .evrow:last-child{ border-bottom:0; } .ek{ color:var(--ink-2); } .ev{ font-weight:500; text-align:right; } .notlist{ display:flex; flex-direction:column; gap:9px; padding-left:0; list-style:none; } .notlist li{ display:grid; grid-template-columns:16px 1fr; gap:10px; font-size:12.5px; color:var(--ink-2); line-height:1.45; } .notlist li:before{ content:"×"; color:var(--sig-risk); font-weight:600; }
  .audit{ margin-top:56px; padding-top:26px; border-top:2px solid var(--ink); } .audit-grid{ display:grid; grid-template-columns:1fr 1fr 120px; gap:30px; align-items:start; } .acl{ font-family:var(--mono); font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); margin-bottom:9px; } .acv{ font-family:var(--mono); font-size:11px; color:var(--ink-2); line-height:1.9; } .acv b{ color:var(--ink); font-weight:500; } .audit-qr{ text-align:center; } .ql{ font-family:var(--mono); font-size:8.5px; letter-spacing:.08em; color:var(--ink-3); margin-top:8px; line-height:1.4; } .audit-foot{ display:flex; justify-content:space-between; margin-top:26px; padding-top:16px; border-top:var(--hair) solid var(--line); font-family:var(--mono); font-size:10px; color:var(--ink-3); }
  @media(max-width:760px){ :root{ --gut:22px; } .exec{ grid-template-columns:1fr; } .exec-score{ border-right:0; border-bottom:var(--card-border); } .envs,.acts,.split2{ grid-template-columns:1fr; } .tl{ grid-template-columns:1fr; } .tl-col+.tl-col{ border-left:0; border-top:var(--card-border); } .pred-top{ flex-direction:column; } .pred-id{ width:auto; flex-direction:row; align-items:center; justify-content:space-between; border-right:0; border-bottom:var(--card-border); } .pred-id .lock{ margin-top:0; } .pred-verify{ width:auto; text-align:left; border-left:0; border-top:var(--card-border); } .audit-grid{ grid-template-columns:1fr; } .epred{ grid-template-columns:1fr; } }
  @media print{ .controls{ display:none!important; } body{ background:#fff; } .sheet{ max-width:none; padding:0; } .sec,.pred,.env,.tl,.panel,.cat,.exec,.tracker,.cta,.audit{ break-inside: avoid; print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body class="${classContract}">
<div class="controls"><div class="cb-brand">Mergevue Forecast Brief</div><button class="cb-print" onclick="window.print()">Download PDF</button></div>
<main class="sheet">
${renderArchiveMasthead(model)}
${renderArchiveExecutive(model)}
${model.sections.filter((section) => section.id !== "exec" && section.id !== "scenario").map((section, index) => renderHtmlSection(section, index + 1)).join("\n")}
</main>
</body>
</html>`;
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
  const titleParts = escapeHtml(model.header.title).split(" × ");
  const title = titleParts.length === 2 ? `${titleParts[0]} <span class="x">×</span> ${titleParts[1]}` : escapeHtml(model.header.title);
  return `<header class="mast">
    <div class="masthead mast-row">
      <div class="brand"><div class="mark" aria-hidden="true"></div><div><div class="brand-name">MERGEVUE</div><div class="brand-sub">View into the merge</div></div></div>
      <div class="mast-meta">Diagnostic <b>${escapeHtml(model.masthead.diagnosticId)}</b><br>Issued <b>${escapeHtml(formatForecastDate(model.masthead.issuedAt))}</b><br>Tier <b>${escapeHtml(model.masthead.tierLabel)}</b><br><div class="classif">Preview</div></div>
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

function renderArchiveExecutive(model) {
  const score = model.compatibility.score;
  const bandClass = `band-${model.compatibility.bandKey}`;
  const epreds = model.forecast.predictionsSummary.map((prediction) => (
    `<div class="epred"><span class="when mono">${escapeHtml(prediction.verifyBy)}</span><span class="what">${escapeHtml(prediction.oneLine)}</span></div>`
  )).join("");
  return `<section class="sec" id="exec" style="padding-top:0" data-screen-label="Executive Summary"><div class="exec">
    <div class="exec-score">
      <div class="kicker">Environment Compatibility Score · ECS</div>
      <div class="score-num tnum">${Number.isFinite(score) ? escapeHtml(score) : "NA"}</div>
      <div class="score-of">of 100</div>
      <div class="band-pill ${bandClass}">${escapeHtml(model.compatibility.bandLabel)}</div>
      <div class="score-scale" aria-label="0–100 scale"><div class="scale-track"><div class="scale-mark" style="left:${Math.max(0, Math.min(100, Number(score) || 0))}%"></div></div><div class="scale-ends"><span>0 · ${escapeHtml(model.compatibility.scaleLow)}</span><span>100 · ${escapeHtml(model.compatibility.scaleHigh)}</span></div></div>
      <div class="gate"><div class="gate-row"><span class="gate-label">Confidence Gate</span><span class="pips">${renderPips(model.compatibility.confidence)}</span></div><div class="gate-verdict">${escapeHtml(model.compatibility.confidence.note)}</div></div>
    </div>
    <div class="exec-body">
      <p class="exec-thesis">${escapeHtml(model.forecast.headline)}</p>
      <div class="exec-deal deal-grid">
        <div class="deal-cell"><span class="k">Acquirer</span><span class="v">${escapeHtml(model.forecast.acquirer.company)} <small>· ${escapeHtml(model.forecast.acquirer.pattern)}</small></span></div>
        <div class="deal-cell"><span class="k">Target</span><span class="v">${escapeHtml(model.forecast.target.company)} <small>· ${escapeHtml(model.forecast.target.pattern)}</small></span></div>
        <div class="deal-cell"><span class="k">Deal type</span><span class="v">${escapeHtml(model.forecast.dealType)}</span></div>
        <div class="deal-cell"><span class="k">Enterprise value</span><span class="v tnum">Enterprise value band: ${escapeHtml(model.forecast.enterpriseValue)}</span></div>
      </div>
      <div class="exec-preds"><div class="epl">Three sealed predictions — verify by date</div>${epreds}</div>
      <div class="exec-action"><span class="lab">Recommended</span><span class="txt">${escapeHtml(model.forecast.recommendedAction)}</span></div>
    </div>
  </div></section>`;
}

function bandColor(band) {
  if (band === "high") return "var(--sig-risk)";
  if (band === "moderate") return "var(--sig-mod)";
  return "var(--sig-high)";
}

function renderPredictionCards(section) {
  return section.predictions.map((prediction) => {
    const no = String(prediction.index).padStart(2, "0");
    return `<article class="pred"><div class="pred-top">
      <div class="pred-id"><span class="pno">PREDICTION ${no}</span><span class="seal">Sealed</span><span class="lock">lock: ${escapeHtml(prediction.lockId)}</span></div>
      <div class="pred-main"><p class="pred-claim">${escapeHtml(prediction.statement)}</p></div>
      <div class="pred-verify"><span class="vl">Verify by</span><span class="vd tnum">${escapeHtml(prediction.verifyByDisplay)}</span><span class="vw">Window · ${escapeHtml(prediction.window)}</span></div>
    </div><div class="pred-meta"><div class="pm"><div class="pml">Evidence required</div><div class="pmv">${escapeHtml(prediction.evidenceRequired)}</div></div><div class="pm"><div class="pml">Falsification condition</div><div class="pmv">${escapeHtml(prediction.falsificationCondition)}</div></div></div></article>`;
  }).join("");
}

function renderResourceZones(section) {
  return section.groups.filter((group) => group.count > 0).map((group) => {
    const rows = group.rows.map((row) => `<div class="rbar"><span><span class="rn">${escapeHtml(row.label)}</span><div class="rd">${escapeHtml(row.category)} · ${escapeHtml(row.direction)}</div></span><span class="rt"><span class="rf" style="width:${row.intensity}%;background:${bandColor(row.band)}"></span></span><span class="rv tnum">${escapeHtml(row.intensity)}</span></div>`).join("");
    return `<div class="zone"><div class="zone-head"><span class="zone-dot" style="background:${bandColor(group.band)}"></span><span class="zone-name" style="color:${bandColor(group.band)}">${escapeHtml(group.label)}</span><span class="zone-count">${group.count} of ${section.scanned}</span></div><div class="rbars">${rows}</div></div>`;
  }).join("");
}

function renderActionPanel(title, actions) {
  return `<div class="act"><h4>${escapeHtml(title)}</h4>${actions.map((action) => `<div class="act-item"><div class="act-title">${escapeHtml(action.actionTitle)}</div><div class="act-meta">${escapeHtml(action.actionTiming)} · ${escapeHtml(action.actionOwner)} · expected effect: ${escapeHtml(action.actionExpectedEffect)}</div><div class="act-reason">${escapeHtml(action.actionReason)}</div></div>`).join("")}</div>`;
}

function renderHtmlSection(section, number) {
  if (section.id === "predictions") {
    return `<section class="sec" id="predictions" data-screen-label="Sealed Predictions">${sectionHead(number, section.title, section.statusDescription)}<div class="panel"><h4>${escapeHtml(section.statusTitle)}</h4><p>${escapeHtml(section.statusDescription)}</p></div><div class="preds-wrap">${renderPredictionCards(section)}</div><div class="tracker"><div class="qr" aria-label="QR preview tracker"></div><div class="tk-body"><h4>Preview verification tracker</h4><p>${escapeHtml(section.trackerStatement)}</p><div class="tk-url">${escapeHtml(section.trackerUrl)}</div></div></div></section>`;
  }
  if (section.id === "environments") {
    return `<section class="sec" id="environments" data-screen-label="The Two Environments">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.environments)}<div class="envs"><article class="env"><div class="role">Acquirer</div><div class="co">${escapeHtml(section.acquirer.name)}</div><div class="arc">${escapeHtml(section.acquirer.environment)}</div><p>${escapeHtml(section.acquirer.description)}</p><p>${escapeHtml(section.acquirer.behaviorPattern)}</p></article><article class="env"><div class="role">Target</div><div class="co">${escapeHtml(section.target.name)}</div><div class="arc">${escapeHtml(section.target.environment)}</div><p>${escapeHtml(section.target.description)}</p><p>${escapeHtml(section.target.behaviorPattern)}</p></article></div></section>`;
  }
  if (section.id === "collision") {
    return `<section class="sec" id="collision" data-screen-label="Collision Thesis">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.collision)}<div class="collide">${["headline", "summary", "primaryTension", "whyItMatters", "postCloseFailureMode"].map((key) => `<div class="collide-row"><div class="cl">${escapeHtml(key)}</div><div class="cr">${escapeHtml(section[key])}</div></div>`).join("")}</div></section>`;
  }
  if (section.id === "resources") {
    return `<section class="sec" id="resources" data-screen-label="Resource Map">${sectionHead(number, section.title, `${section.scanned} resources scanned`)}<p class="thresholds">${escapeHtml(section.explanation)}</p><div class="legend"><span class="lg">Legend</span><span class="lg"><span class="sw" style="background:var(--sig-risk)"></span>High-risk · 70–100</span><span class="lg"><span class="sw" style="background:var(--sig-mod)"></span>Moderate · 40–69</span><span class="lg"><span class="sw" style="background:var(--sig-high)"></span>Aligned · 0–39</span><span class="anchor">Score = structural contestation intensity</span></div>${renderResourceZones(section)}</section>`;
  }
  if (section.id === "timeline") {
    const columns = section.phases.map((phase, index) => `<div class="tl-col"><div class="tl-progress"><span></span></div><div class="tl-when"><span class="ph">FP${index + 1} · ${escapeHtml(phase.verifyBy)}</span><span class="win">${escapeHtml(phase.verifyBy)}</span></div><div class="tl-body"><div class="h">${escapeHtml(phase.heading)}</div><p>${escapeHtml(phase.body)}</p><div class="tl-marker"><div class="ml">Watch for:</div><div class="mv">${escapeHtml(phase.watchFor)}</div></div></div></div>`).join("");
    return `<section class="sec" id="timeline" data-screen-label="Friction Timeline">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.timeline)}<div class="legend"><span>${escapeHtml(section.timingLogic.signalSetup)}</span><span>${escapeHtml(section.timingLogic.observationWindow)}</span><span>${escapeHtml(section.timingLogic.verificationDeadline)}</span></div><div class="tl">${columns}</div></section>`;
  }
  if (section.id === "economics") {
    return `<section class="sec" id="economic" data-screen-label="Economic Translation">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.economics)}<div class="env-total"><div class="et-l"><div class="lab">Enterprise value band</div><div class="rng tnum">${escapeHtml(section.enterpriseValueBand)}</div></div><div class="et-r">${escapeHtml(section.valuationDisclaimer)}<br>${escapeHtml(section.engagementTierRequirement)}</div></div><div class="cats">${section.categories.map((category) => `<div class="cat"><div class="cat-top"><span class="cn">${escapeHtml(category.label)}</span><span class="cr tnum">${category.value} / 100</span></div><p>${escapeHtml(section.economicRiskPosture)}</p><div class="cat-bar"><span style="width:${category.value}%"></span></div></div>`).join("")}</div></section>`;
  }
  if (section.id === "actions") {
    return `<section class="sec" id="actions" data-screen-label="Recommended Actions">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.actions)}<div class="acts">${renderActionPanel("Before close", section.beforeClose)}${renderActionPanel("After close", section.afterClose)}</div><div class="cta"><div><div class="cl">Recommended next action</div><div class="ct">${escapeHtml(section.beforeClose[0]?.actionTitle || section.afterClose[0]?.actionTitle)}</div></div><div class="cbtn">Book practitioner session</div></div></section>`;
  }
  if (section.id === "evidence") {
    return `<section class="sec" id="evidence" data-screen-label="Evidence & Limits">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.evidence)}<div class="split2"><div class="panel"><h4>Evidence basis & confidence gate</h4>${[["Data quality", section.dataQualityLevel], ["Input completeness", section.inputCompleteness], ["What this report can say", section.canSay]].map(([k, v]) => `<div class="evrow"><span class="ek">${escapeHtml(k)}</span><span class="ev">${escapeHtml(v)}</span></div>`).join("")}</div><div class="panel warn"><h4>What this report does not tell you</h4><ul class="notlist"><li>${escapeHtml(section.cannotSay)}</li><li>${escapeHtml(section.knownLimits)}</li><li>${escapeHtml(section.methodLimitations)}</li></ul></div></div></section>`;
  }
  if (section.id === "engagement") {
    return `<section class="sec" id="engagement" data-screen-label="Full Engagement Adds">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.engagement)}<div class="panel">${section.benefits.map((benefit) => `<p>${escapeHtml(benefit)}</p>`).join("")}</div><div class="cta"><div><div class="cl">Engagement contact</div><div class="ct">${escapeHtml(section.cta)}</div></div><div class="cbtn">${escapeHtml(section.contactEmail)}</div></div></section>`;
  }
  if (section.id === "audit") {
    return `<footer class="audit" id="audit">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES.audit)}<div class="audit-grid"><div class="audit-col"><div class="acl">Methodology</div><div class="acv"><b>Mergevue Forecast Method</b><br>${escapeHtml(section.reportVersion)}<br>${escapeHtml(section.contactEmail)}</div></div><div class="audit-col"><div class="acl">Audit trail</div><div class="acv">Report · <b>${escapeHtml(section.reportId)}</b><br>Generated · ${escapeHtml(section.generatedAt)}<br>Scenario · ${escapeHtml(section.scenarioId)}<br>Tracker · ${escapeHtml(section.trackRecordUrl)}</div></div><div class="audit-qr"><div class="qr" aria-label="QR ${escapeHtml(section.qrLabel)}"></div><div class="ql">Preview audit<br>reference</div></div></div><div class="audit-foot"><span>© 2026 Mergevue</span><span>Display-only preview; not ledger-recorded.</span></div></footer>`;
  }
  return `<section class="sec">${sectionHead(number, section.title, ARCHIVE_SECTION_NOTES[section.id] ?? "")}</section>`;
}
