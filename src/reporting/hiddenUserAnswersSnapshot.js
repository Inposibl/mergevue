const MISSING = "\u2014";

const ENVIRONMENT_CODES = Object.freeze([
  "NT/STJ",
  "NT/STP",
  "NF/NT",
  "NF/SFJ",
  "NF/SFP",
  "SFJ/SFP",
  "STJ/STP",
  "STP/STJ",
  "SFP/SFJ",
]);

const MODULES = Object.freeze([
  Object.freeze({
    id: "acquirer2A",
    label: "Acquirer self-observation",
    module: (session) => session?.acquirer2A,
    score: (session) => session?.acquirer2A?.score,
  }),
  Object.freeze({
    id: "targetDiagnostic",
    label: "Target current diagnostic",
    module: (session) => session?.target2B,
    score: (session) => session?.target2B?.finalScore,
  }),
  Object.freeze({
    id: "targetSelfAssessment",
    label: "Target self-description",
    module: (session) => session?.targetSelfAssessment,
    score: (session) => session?.targetSelfAssessment?.score,
  }),
  Object.freeze({
    id: "targetObservation",
    label: "Target observed by acquirer",
    module: (session) => session?.targetObservation,
    score: (session) => session?.targetObservation?.score,
  }),
]);

function valueOrMissing(value) {
  if (value === null || value === undefined || value === "") return MISSING;
  if (Array.isArray(value)) return value.length ? value.join(", ") : MISSING;
  return String(value);
}

function numberOrMissing(value) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : MISSING;
}

function stableJsonValue(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value.toJSON();
  if (seen.has(value)) return "[circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    const array = value.map((item) => stableJsonValue(item, seen));
    seen.delete(value);
    return array;
  }

  const object = Object.fromEntries(
    Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, stableJsonValue(value[key], seen)]),
  );
  seen.delete(value);
  return object;
}

export function serializeHiddenAuditEnvelope(envelope) {
  return JSON.stringify(stableJsonValue(envelope), null, 2);
}

function sourceRows(session) {
  return MODULES.map((definition) => {
    const score = definition.score(session);
    return [
      definition.label,
      valueOrMissing(score?.primaryEnvironmentCode),
      valueOrMissing(score?.signalStrength),
      valueOrMissing(score?.confidence ?? score?.evidenceQuality?.confidence),
    ];
  });
}

function contradictionLines(session) {
  const findings = session?.preliminaryAssessment?.contradictionReport?.findings;
  if (!Array.isArray(findings) || findings.length === 0) return [MISSING];

  return findings.map((finding) => {
    const severity = valueOrMissing(finding?.severity);
    const type = valueOrMissing(finding?.type ?? finding?.findingType);
    const leftLabel = finding?.leftSource;
    const rightLabel = finding?.rightSource;
    const leftCode = finding?.leftSignalCode;
    const rightCode = finding?.rightSignalCode;
    if (leftLabel || rightLabel || leftCode || rightCode) {
      return `[${severity}] ${type}: ${valueOrMissing(leftLabel)} (${valueOrMissing(leftCode)}) vs ${valueOrMissing(rightLabel)} (${valueOrMissing(rightCode)})`;
    }

    const sourceLabel = finding?.affectedSources?.[0] ?? finding?.sourceLabel ?? finding?.title;
    const reason = finding?.explanation ?? finding?.evidenceBasis;
    return `[${severity}] ${type}: ${valueOrMissing(sourceLabel)} \u2014 ${valueOrMissing(reason)}`;
  });
}

function dealInputLines(session) {
  const deal = session?.dealContext?.data ?? session?.dealContext ?? {};
  const enterpriseValue = `${valueOrMissing(deal.enterpriseValue)} ${valueOrMissing(deal.enterpriseValueCurrency)} (${valueOrMissing(deal.enterpriseValueStatus)})`;
  const compensationValue = deal.averageAnnualCompensationPerKeyPerson ?? deal.averageAnnualCompensation;
  const compensationCurrency = deal.averageAnnualCompensationCurrency ?? deal.compensationCurrency;
  const compensationStatus = deal.averageAnnualCompensationStatus ?? deal.compensationStatus;
  const compensation = `${valueOrMissing(compensationValue)} ${valueOrMissing(compensationCurrency)} (${valueOrMissing(compensationStatus)})`;

  return [
    `Acquirer: ${valueOrMissing(deal.acquirerName)}`,
    `Target: ${valueOrMissing(deal.targetName)}`,
    `Deal type: ${valueOrMissing(deal.dealType)}`,
    `Enterprise value: ${enterpriseValue}`,
    `Compensation: ${compensation}`,
    `Key personnel at risk: ${valueOrMissing(deal.keyPersonnelAtRisk)}`,
    `Respondent side: ${valueOrMissing(deal.respondentSide)}`,
    `Respondent access level: ${valueOrMissing(deal.respondentAccessLevel)}`,
    `Transaction role: ${valueOrMissing(deal.transactionRole)}`,
    `Integration timeline: ${valueOrMissing(deal.integrationTimeline)}`,
  ];
}

function answerSheetLines(session) {
  const lines = [];
  for (const definition of MODULES) {
    const module = definition.module(session);
    const score = definition.score(session);
    const responses = Array.isArray(score?.questionResponses) ? score.questionResponses : [];
    if (!module?.completed || !score) {
      lines.push(`MODULE: ${definition.label} \u2014 not completed`);
      continue;
    }

    const respondentSide = module?.data?.respondentSide
      ?? module?.respondentSide;
    lines.push(`MODULE: ${definition.label} | respondent side: ${valueOrMissing(respondentSide)} | answered: ${numberOrMissing(score.answeredQuestionCount)}/${numberOrMissing(score.questionCount)}`);
    lines.push("Q# | OPT | SIGNALS | EVIDENCE | KNOW | CONF | WEIGHT | FLAGS");
    for (const response of responses) {
      const option = response?.missing
        ? MISSING
        : `${valueOrMissing(response?.selectedOption)}${response?.excludedFromPrimaryScoring ? " [excl]" : ""}`;
      lines.push([
        valueOrMissing(response?.questionId),
        option,
        valueOrMissing(response?.signalCodes),
        valueOrMissing(response?.evidenceType),
        valueOrMissing(response?.knowledgeLevel),
        valueOrMissing(response?.confidence),
        numberOrMissing(response?.weight),
        valueOrMissing(response?.reliabilityFlags),
      ].join(" | "));
    }
  }
  return lines;
}

function contributingQuestions(score, environmentCode) {
  const responses = Array.isArray(score?.questionResponses) ? score.questionResponses : [];
  return responses
    .filter((response) => !response?.missing && Array.isArray(response?.signalCodes) && response.signalCodes.includes(environmentCode))
    .map((response) => response.questionId)
    .filter(Boolean)
    .join(" ") || MISSING;
}

function scoringReconciliationLines(session) {
  const lines = [];
  for (const definition of MODULES) {
    const module = definition.module(session);
    const score = definition.score(session);
    if (!module?.completed || !score) continue;

    lines.push(`MODULE: ${definition.label} \u2014 environment tally`);
    lines.push("ENV | RAW | WEIGHTED | CONTRIBUTING QUESTIONS");
    const rows = ENVIRONMENT_CODES
      .map((code) => ({
        code,
        raw: Number(score?.environmentScores?.[code]) || 0,
        weighted: Number(score?.weightedEnvironmentScores?.[code]) || 0,
      }))
      .sort((left, right) => right.weighted - left.weighted || left.code.localeCompare(right.code));
    for (const row of rows) {
      lines.push(`${row.code} | ${row.raw} | ${row.weighted} | ${contributingQuestions(score, row.code)}`);
    }
    const margin = (Number(score?.primarySignalScore) || 0) - (Number(score?.secondarySignalScore) || 0);
    lines.push(`WINNER: ${valueOrMissing(score?.primaryEnvironmentCode)} (${numberOrMissing(score?.primarySignalScore)}) | runner-up: ${valueOrMissing(score?.secondaryEnvironmentCode)} (${numberOrMissing(score?.secondarySignalScore)}) | margin: ${margin} | strength: ${valueOrMissing(score?.signalStrength)}`);
  }
  return lines.length ? lines : [MISSING];
}

function scoreMargin(score) {
  const primary = Number(score?.primarySignalScore);
  const secondary = Number(score?.secondarySignalScore);
  return Number.isFinite(primary) && Number.isFinite(secondary) ? primary - secondary : MISSING;
}

function targetResolutionLabel(deliverable) {
  const source = deliverable?.targetResolutionSource;
  if (!source) return MISSING;
  if (typeof source === "string") return source;
  const contributors = valueOrMissing(source.contributors);
  return `${valueOrMissing(source.label ?? source.rule)} [${contributors}]`;
}

function resolutionAuditLines(session, deliverable) {
  const acquirerScore = session?.acquirer2A?.score;
  const resolution = deliverable?.targetResolutionSource;
  const winningContributors = new Set(Array.isArray(resolution?.contributors) ? resolution.contributors : []);
  const targetSources = MODULES.filter((definition) => definition.id !== "acquirer2A");
  const score = Number(deliverable?.compatibilityScore);
  const latticeValue = 34 * (1 - score / 100);
  const lattice = Number.isFinite(latticeValue) && Math.abs(latticeValue - Math.round(latticeValue)) < 0.01
    ? `k=${Math.round(latticeValue)}`
    : "OFF-LATTICE";
  const lines = [
    `Acquirer resolved: ${valueOrMissing(deliverable?.acquirerEnvironmentCode)} from acquirer2A | margin over runner-up: ${valueOrMissing(scoreMargin(acquirerScore))}`,
    `Target resolved: ${valueOrMissing(deliverable?.targetEnvironmentCode)} from ${targetResolutionLabel(deliverable)}`,
  ];

  for (const definition of targetSources) {
    const targetScore = definition.score(session);
    if (!targetScore || winningContributors.has(definition.id)) continue;
    lines.push(`Overridden target read: ${definition.label}: ${valueOrMissing(targetScore.primaryEnvironmentCode)} (${valueOrMissing(targetScore.signalStrength)})`);
  }
  lines.push(`ECS lookup: ${valueOrMissing(deliverable?.acquirerEnvironmentCode)} x ${valueOrMissing(deliverable?.targetEnvironmentCode)} -> ${numberOrMissing(deliverable?.compatibilityScore)} (${valueOrMissing(deliverable?.riskBand)}) | lattice: ${lattice}`);
  return lines;
}

export function renderHiddenAuditSummary(envelope) {
  const session = envelope?.session ?? {};
  const deliverable = envelope?.deliverable ?? {};
  const triage = session?.preliminaryAssessment?.triageReport ?? {};
  const sources = sourceRows(session);

  return [
    "MERGEVUE INTERNAL USER-ANSWERS AUDIT",
    "",
    "1. TRIAGE VERDICT",
    `TRIAGE: ${valueOrMissing(triage.effectiveTier)} | gate: ${valueOrMissing(triage.routing?.gate)} | route: ${valueOrMissing(triage.routing?.label)} | triggers: ${numberOrMissing(triage.triggerCount)}`,
    "",
    "2. SOURCES",
    "SOURCE | ENV | SIGNAL | CONFIDENCE",
    ...sources.map((row) => row.join(" | ")),
    "",
    "3. RESOLVED PAIR",
    `PAIR: ${valueOrMissing(deliverable.acquirerEnvironmentCode)} -> ${valueOrMissing(deliverable.targetEnvironmentCode)} | target label source: ${targetResolutionLabel(deliverable)} | ECS: ${numberOrMissing(deliverable.compatibilityScore)} | band: ${valueOrMissing(deliverable.riskBand)}`,
    "",
    "4. CONTRADICTIONS",
    ...contradictionLines(session),
    "",
    "5. DEAL INPUTS",
    ...dealInputLines(session),
    "",
    "6. ANSWER SHEETS",
    ...answerSheetLines(session),
    "",
    "7. SCORING RECONCILIATION",
    ...scoringReconciliationLines(session),
    "",
    "8. RESOLUTION AUDIT",
    ...resolutionAuditLines(session, deliverable),
  ].join("\n");
}

export function createHiddenUserAnswersSnapshot(session, deliverable) {
  const envelope = { session, deliverable };
  return Object.freeze({
    json: serializeHiddenAuditEnvelope(envelope),
    summary: renderHiddenAuditSummary(envelope),
  });
}
