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

function predictionCard(prediction, index) {
  const statement = cleanText(prediction.predictionClaim);
  const evidenceRequired = distinctText(prediction.observableSignal, statement);
  const verification = distinctText(prediction.verificationMethod, evidenceRequired || statement);
  return Object.freeze({
    id: `P${index + 1}`,
    oneLine: cleanText(prediction.predictionTitle).replace(/\.$/, ""),
    statement,
    evidenceRequired,
    verifyBy: cleanText(prediction.predictionWindow),
    window: cleanText(prediction.predictionWindow),
    falsificationCondition: verification,
    lockId: `sealed-preview-${index + 1}`,
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
  const predictions = Object.freeze(sealed.predictions.map(predictionCard));
  const actions = actionBuckets(report.recommendedActions);
  const includeAppendixSections = options.includeAppendixSections !== false;

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
      scoreBand: forecastBriefScoreBand(score),
      scoreMarkerPercent: percentFromScore(score),
      confidencePips: evidence.dataQualityLevel,
      explanation: distinctText(scenario.compatibilityExplanation, executive.headline),
    },
    {
      id: SECTION_IDS[3],
      title: MERGEVUE_PUBLIC_REPORT_BLOCKS[3],
      acquirer: {
        name: scenario.acquirerName,
        environment: publicEnvironmentName(environments.acquirerEnvironmentName, environments.acquirerEnvironmentCode),
        description: environments.acquirerEnvironmentDescription,
        behaviorPattern: environments.acquirerBehaviorPattern,
      },
      target: {
        name: scenario.targetName,
        environment: publicEnvironmentName(environments.targetEnvironmentName, environments.targetEnvironmentCode),
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
      legend: ["Low", "Medium", "High"],
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
    "sec",
    "pred",
    "env",
    "tl",
    "panel",
    "cat",
    "exec",
    "tracker",
    "cta",
  ]);
}

export function renderMergevueForecastBriefHtml(model) {
  const sectionClassContract = forecastBriefDesignClassContract().join(" ");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${model.fileName}</title>
<style>
  :root { color-scheme: light; font-family: Inter, Arial, sans-serif; --navy: #17324d; --blue: #2e75b6; --line: #d9e2ec; --ink: #17202a; --muted: #627084; --soft: #f5f8fb; --good: #2e7d32; --warn: #e8a33d; --risk: #c0392b; }
  body { margin: 0; background: #eef3f7; color: var(--ink); }
  .controls { padding: 16px 24px; background: #fff; border-bottom: 1px solid var(--line); }
  .page { width: 210mm; min-height: 297mm; margin: 18px auto; padding: 18mm; background: #fff; box-shadow: 0 10px 32px rgba(23, 50, 77, 0.12); box-sizing: border-box; }
  .masthead { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid var(--navy); padding-bottom: 12px; }
  .masthead strong { display: block; color: var(--navy); font-size: 22px; }
  .masthead span { display: block; color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
  .sec { break-inside: avoid; margin-top: 18px; }
  .sec h2 { color: var(--navy); font-size: 15px; margin: 0 0 10px; border-top: 1px solid var(--line); padding-top: 12px; }
  .exec { background: var(--navy); color: #fff; padding: 18px; border-radius: 8px; }
  .exec h1 { margin: 0 0 8px; font-size: 24px; line-height: 1.16; }
  .exec p { margin: 6px 0; }
  .tracker { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: center; background: var(--soft); border: 1px solid var(--line); border-radius: 8px; padding: 14px; }
  .score { position: relative; height: 10px; background: linear-gradient(90deg, var(--risk), var(--warn), var(--good)); border-radius: 999px; }
  .score i { position: absolute; top: -6px; width: 3px; height: 22px; background: var(--navy); border-radius: 2px; }
  .pips span { display: inline-block; width: 9px; height: 9px; margin-right: 4px; border-radius: 50%; background: var(--blue); }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .deal-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .panel, .pred, .env, .tl, .cat, .cta { border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: #fff; }
  .panel b, .pred b, .env b, .tl b, .cat b { color: var(--navy); }
  .pred { border-left: 5px solid var(--blue); }
  .tl { min-height: 92px; }
  .bar { height: 8px; background: var(--soft); border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .bar i { display: block; height: 100%; background: var(--blue); }
  .legend { display: flex; gap: 10px; color: var(--muted); font-size: 11px; }
  .qr { width: 70px; height: 70px; border: 8px solid var(--navy); box-sizing: border-box; background: repeating-linear-gradient(45deg, #fff 0 4px, var(--navy) 4px 8px); }
  @media print { body { background: #fff; } .controls { display: none; } .page { margin: 0; box-shadow: none; width: auto; min-height: auto; } .sec, .pred, .env, .tl, .panel, .cat, .exec, .tracker, .cta { break-inside: avoid; print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body class="${sectionClassContract}">
<div class="controls"><button onclick="window.print()">Download PDF</button></div>
<main class="page">
${model.sections.map((section, index) => renderHtmlSection(section, index + 1)).join("\n")}
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

function renderHtmlSection(section, number) {
  if (section.id === "exec") {
    const hero = section.hero;
    return `<section class="sec exec"><div class="masthead"><div><span>${escapeHtml(hero.product)}</span><strong>${escapeHtml(hero.masthead)}</strong></div><div>${escapeHtml(hero.reportType)}<br>${escapeHtml(hero.contactEmail)}</div></div><h1>${escapeHtml(hero.headline)}</h1><p>${escapeHtml(hero.thesis)}</p><p>${escapeHtml(hero.decisionImplication)}</p><p><b>Recommended action</b> ${escapeHtml(hero.recommendedAction)}</p></section>`;
  }
  if (section.id === "predictions") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="panel"><b>${escapeHtml(section.statusTitle)}</b><p>${escapeHtml(section.statusDescription)}</p></div><div class="grid">${section.predictions.map((prediction) => `<article class="pred"><b>${escapeHtml(prediction.oneLine)}</b><p>${escapeHtml(prediction.statement)}</p><small>Lock ${escapeHtml(prediction.lockId)} · Verify ${escapeHtml(prediction.verifyBy)}</small><p>Evidence required: ${escapeHtml(prediction.evidenceRequired)}</p><p>Falsification condition: ${escapeHtml(prediction.falsificationCondition)}</p></article>`).join("")}</div></section>`;
  }
  if (section.id === "scenario") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="tracker"><div><b>ECS ${escapeHtml(section.compatibilityScore)}</b><div class="score"><i style="left:${section.scoreMarkerPercent}%"></i></div><small>0–100 scale · ${escapeHtml(section.scoreBand)}</small></div><div class="pips"><span></span><span></span><span></span></div></div><div class="deal-grid"><div class="panel">${escapeHtml(section.acquirerName)}</div><div class="panel">${escapeHtml(section.targetName)}</div><div class="panel">${escapeHtml(section.dealType)}</div><div class="panel">Enterprise value band: ${escapeHtml(section.enterpriseValueBand)}</div></div></section>`;
  }
  if (section.id === "environments") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="grid"><article class="env"><b>${escapeHtml(section.acquirer.name)}</b><p>${escapeHtml(section.acquirer.environment)}</p><p>${escapeHtml(section.acquirer.behaviorPattern)}</p></article><article class="env"><b>${escapeHtml(section.target.name)}</b><p>${escapeHtml(section.target.environment)}</p><p>${escapeHtml(section.target.behaviorPattern)}</p></article></div></section>`;
  }
  if (section.id === "resources") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><p>${escapeHtml(section.explanation)}</p><div class="legend">Legend: ${section.legend.map(escapeHtml).join(" / ")}</div>${section.zones.map((zone) => `<article class="cat"><b>${escapeHtml(zone.name)}</b><p>${escapeHtml(zone.direction)}</p><div class="bar"><i style="width:${Math.max(8, Math.min(100, zone.intensity))}%"></i></div><small>${escapeHtml(zone.band)}</small></article>`).join("")}</section>`;
  }
  if (section.id === "timeline") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="deal-grid"><div class="panel">${escapeHtml(section.timingLogic.signalSetup)}</div><div class="panel">${escapeHtml(section.timingLogic.observationWindow)}</div><div class="panel">${escapeHtml(section.timingLogic.verificationDeadline)}</div></div><div class="grid">${section.phases.map((phase) => `<article class="tl"><b>${escapeHtml(phase.heading)}</b><p>${escapeHtml(phase.body)}</p><small>Watch for: ${escapeHtml(phase.watchFor)}</small></article>`).join("")}</div></section>`;
  }
  if (section.id === "economics") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="panel">Enterprise value band: ${escapeHtml(section.enterpriseValueBand)}<p>${escapeHtml(section.valuationDisclaimer)}</p><p>${escapeHtml(section.engagementTierRequirement)}</p></div>${section.categories.map((category) => `<div class="cat"><b>${escapeHtml(category.label)}</b><div class="bar"><i style="width:${category.value}%"></i></div></div>`).join("")}</section>`;
  }
  if (section.id === "actions") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="grid"><div class="cta"><b>Before close</b>${section.beforeClose.map((action) => `<p>${escapeHtml(action.actionTitle)}</p>`).join("")}</div><div class="cta"><b>After close</b>${section.afterClose.map((action) => `<p>${escapeHtml(action.actionTitle)}</p>`).join("")}</div></div></section>`;
  }
  if (section.id === "evidence") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="grid"><div class="panel"><b>Evidence basis</b><p>${escapeHtml(section.canSay)}</p></div><div class="panel"><b>Limits</b><p>${escapeHtml(section.cannotSay)}</p></div></div></section>`;
  }
  if (section.id === "engagement") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="cta">${section.benefits.map((benefit) => `<p>${escapeHtml(benefit)}</p>`).join("")}<b>${escapeHtml(section.contactEmail)}</b></div></section>`;
  }
  if (section.id === "audit") {
    return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2><div class="grid"><div class="panel"><p>${escapeHtml(section.reportId)}</p><p>${escapeHtml(section.generatedAt)}</p><p>${escapeHtml(section.reportVersion)}</p></div><div class="qr" aria-label="QR ${escapeHtml(section.qrLabel)}"></div></div></section>`;
  }
  return `<section class="sec"><h2>${number}. ${escapeHtml(section.title)}</h2></section>`;
}
