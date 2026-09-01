import type { SemanticResultV1 } from "./kernel.ts";

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

export type NseResponsePresentationV1 = Readonly<{
  questionId: unknown;
  selectedOption: unknown;
  signalCodes: unknown;
  evidenceType: unknown;
  knowledgeLevel: unknown;
  confidence: unknown;
  weight: unknown;
  reliabilityFlags: unknown;
  canonicalQuestionId: unknown;
  workbookQuestionId: unknown;
  questionModuleId: unknown;
  respondentId: unknown;
  respondentSlot: unknown;
  respondentIdentityStatus: unknown;
}>;

export type NseModulePresentationV1 = Readonly<{
  label: string;
  primaryEnvironmentCode: unknown;
  signalStrength: unknown;
  confidenceDirect: unknown;
  confidenceFallback: unknown;
  respondentSideData: unknown;
  respondentSideRoot: unknown;
  answeredQuestionCount: unknown;
  questionCount: unknown;
  primarySignalScore: unknown;
  secondaryEnvironmentCode: unknown;
  secondarySignalScore: unknown;
  responses: readonly NseResponsePresentationV1[];
}>;

export type NseFindingPresentationV1 = Readonly<{
  severity: unknown;
  type: unknown;
  findingType: unknown;
  leftSource: unknown;
  rightSource: unknown;
  leftSignalCode: unknown;
  rightSignalCode: unknown;
  affectedSource0: unknown;
  sourceLabel: unknown;
  title: unknown;
  explanation: unknown;
  evidenceBasis: unknown;
}>;

export type NseDealPresentationV1 = Readonly<{
  data: Readonly<{
    acquirerName: unknown;
    targetName: unknown;
    dealType: unknown;
    enterpriseValue: unknown;
    enterpriseValueCurrency: unknown;
    enterpriseValueStatus: unknown;
    averageAnnualCompensationPerKeyPerson: unknown;
    averageAnnualCompensation: unknown;
    averageAnnualCompensationCurrency: unknown;
    compensationCurrency: unknown;
    averageAnnualCompensationStatus: unknown;
    compensationStatus: unknown;
    keyPersonnelAtRisk: unknown;
    respondentSide: unknown;
    respondentAccessLevel: unknown;
    transactionRole: unknown;
    integrationTimeline: unknown;
  }>;
  root: Readonly<{
    acquirerName: unknown;
    targetName: unknown;
    dealType: unknown;
    enterpriseValue: unknown;
    enterpriseValueCurrency: unknown;
    enterpriseValueStatus: unknown;
    averageAnnualCompensationPerKeyPerson: unknown;
    averageAnnualCompensation: unknown;
    averageAnnualCompensationCurrency: unknown;
    compensationCurrency: unknown;
    averageAnnualCompensationStatus: unknown;
    compensationStatus: unknown;
    keyPersonnelAtRisk: unknown;
    respondentSide: unknown;
    respondentAccessLevel: unknown;
    transactionRole: unknown;
    integrationTimeline: unknown;
  }>;
}>;

export type PresentationSidecarV1 = Readonly<{
  schemaVersion: "nse-presentation-sidecar-v1";
  triageEffectiveTier: unknown;
  triageGate: unknown;
  triageRouteLabel: unknown;
  triageTriggerCount: unknown;
  modules: readonly NseModulePresentationV1[];
  findings: readonly NseFindingPresentationV1[];
  deal: NseDealPresentationV1;
  acquirerEnvironmentCode: unknown;
  targetEnvironmentCode: unknown;
  compatibilityScore: unknown;
  riskBand: unknown;
  resolutionString: unknown;
  resolutionLabel: unknown;
  resolutionRule: unknown;
  resolutionContributors: unknown;
}>;

function valueOrMissing(value: unknown) {
  if (value === null || value === undefined || value === "") return MISSING;
  if (Array.isArray(value)) return value.length ? value.join(", ") : MISSING;
  return String(value);
}

function numberOrMissing(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : MISSING;
}

function targetResolutionLabel(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  if (result.resolutionKind === "MISSING") return MISSING;
  if (result.resolutionLabelSelector === "STRING") return sidecar.resolutionString;
  const selectedLabel = result.resolutionLabelSelector === "LABEL"
    ? sidecar.resolutionLabel
    : sidecar.resolutionRule;
  return `${valueOrMissing(selectedLabel)} [${valueOrMissing(sidecar.resolutionContributors)}]`;
}

function contradictionLines(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  if (result.findingListState !== "ITEMS") return [MISSING];
  return result.findings.map((findingResult) => {
    const finding = sidecar.findings[findingResult.findingIndex];
    const severity = valueOrMissing(finding.severity);
    const type = valueOrMissing(findingResult.typeSelector === "TYPE" ? finding.type : finding.findingType);
    if (findingResult.shape === "PAIR") {
      return `[${severity}] ${type}: ${valueOrMissing(finding.leftSource)} (${valueOrMissing(finding.leftSignalCode)}) vs ${valueOrMissing(finding.rightSource)} (${valueOrMissing(finding.rightSignalCode)})`;
    }
    const source = findingResult.sourceSelector === "AFFECTED_SOURCE_0"
      ? finding.affectedSource0
      : findingResult.sourceSelector === "SOURCE_LABEL"
        ? finding.sourceLabel
        : finding.title;
    const reason = findingResult.reasonSelector === "EXPLANATION"
      ? finding.explanation
      : finding.evidenceBasis;
    return `[${severity}] ${type}: ${valueOrMissing(source)} \u2014 ${valueOrMissing(reason)}`;
  });
}

function dealInputLines(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  const deal = result.dealSourceSelector === "DATA" ? sidecar.deal.data : sidecar.deal.root;
  const enterpriseValue = `${valueOrMissing(deal.enterpriseValue)} ${valueOrMissing(deal.enterpriseValueCurrency)} (${valueOrMissing(deal.enterpriseValueStatus)})`;
  const compensationValue = result.compensationValueSelector === "PRIMARY"
    ? deal.averageAnnualCompensationPerKeyPerson
    : deal.averageAnnualCompensation;
  const compensationCurrency = result.compensationCurrencySelector === "PRIMARY"
    ? deal.averageAnnualCompensationCurrency
    : deal.compensationCurrency;
  const compensationStatus = result.compensationStatusSelector === "PRIMARY"
    ? deal.averageAnnualCompensationStatus
    : deal.compensationStatus;
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

function answerSheetLines(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  const lines: string[] = [];
  for (const moduleResult of result.modules) {
    const module = sidecar.modules[moduleResult.moduleIndex];
    if (moduleResult.answerSheetState === "NOT_COMPLETED") {
      lines.push(`MODULE: ${module.label} \u2014 not completed`);
      continue;
    }
    const respondentSide = moduleResult.respondentSideSelector === "DATA"
      ? module.respondentSideData
      : module.respondentSideRoot;
    lines.push(`MODULE: ${module.label} | respondent side: ${valueOrMissing(respondentSide)} | answered: ${numberOrMissing(module.answeredQuestionCount)}/${numberOrMissing(module.questionCount)}`);
    lines.push("Q# | OPT | SIGNALS | EVIDENCE | KNOW | CONF | WEIGHT | FLAGS | CANONICAL | WORKBOOK | MODULE | RESPONDENT | SLOT | ID-STATUS");
    module.responses.forEach((response, responseIndex) => {
      const optionState = moduleResult.optionStates[responseIndex];
      const option = optionState === "MISSING"
        ? MISSING
        : `${valueOrMissing(response.selectedOption)}${optionState === "VALUE_EXCLUDED" ? " [excl]" : ""}`;
      lines.push([
        valueOrMissing(response.questionId),
        option,
        valueOrMissing(response.signalCodes),
        valueOrMissing(response.evidenceType),
        valueOrMissing(response.knowledgeLevel),
        valueOrMissing(response.confidence),
        numberOrMissing(response.weight),
        valueOrMissing(response.reliabilityFlags),
        valueOrMissing(response.canonicalQuestionId),
        valueOrMissing(response.workbookQuestionId),
        valueOrMissing(response.questionModuleId),
        valueOrMissing(response.respondentId),
        valueOrMissing(response.respondentSlot),
        valueOrMissing(response.respondentIdentityStatus),
      ].join(" | "));
    });
  }
  return lines;
}

function scoringReconciliationLines(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  const lines: string[] = [];
  for (const moduleResult of result.modules) {
    if (moduleResult.scoringState === "NOT_COMPLETED") continue;
    const module = sidecar.modules[moduleResult.moduleIndex];
    lines.push(`MODULE: ${module.label} \u2014 environment tally`);
    lines.push("ENV | RAW | WEIGHTED | CONTRIBUTING QUESTIONS");
    for (const row of moduleResult.orderedEnvironmentRows) {
      const questions = row.contributingResponseRefs
        .map((reference) => String(module.responses[reference].questionId))
        .join(" ") || MISSING;
      lines.push(`${ENVIRONMENT_CODES[row.environmentOrdinal]} | ${row.raw} | ${row.weighted} | ${questions}`);
    }
    lines.push(`WINNER: ${valueOrMissing(module.primaryEnvironmentCode)} (${numberOrMissing(module.primarySignalScore)}) | runner-up: ${valueOrMissing(module.secondaryEnvironmentCode)} (${numberOrMissing(module.secondarySignalScore)}) | margin: ${moduleResult.margin} | strength: ${valueOrMissing(module.signalStrength)}`);
  }
  return lines.length ? lines : [MISSING];
}

function resolutionAuditLines(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  const acquirer = result.modules[0];
  const scoreMargin = acquirer.scoreMarginState === "VALUE" ? acquirer.scoreMarginValue : MISSING;
  const lines = [
    `Acquirer resolved: ${valueOrMissing(sidecar.acquirerEnvironmentCode)} from acquirer2A | margin over runner-up: ${valueOrMissing(scoreMargin)}`,
    `Target resolved: ${valueOrMissing(sidecar.targetEnvironmentCode)} from ${targetResolutionLabel(result, sidecar)}`,
  ];
  for (const moduleResult of result.modules.slice(1)) {
    if (moduleResult.overrideState !== "OVERRIDDEN") continue;
    const module = sidecar.modules[moduleResult.moduleIndex];
    lines.push(`Overridden target read: ${module.label}: ${valueOrMissing(module.primaryEnvironmentCode)} (${valueOrMissing(module.signalStrength)})`);
  }
  const lattice = result.latticeState === "ON_LATTICE" ? `k=${result.latticeK}` : "OFF-LATTICE";
  lines.push(`ECS lookup: ${valueOrMissing(sidecar.acquirerEnvironmentCode)} x ${valueOrMissing(sidecar.targetEnvironmentCode)} -> ${numberOrMissing(sidecar.compatibilityScore)} (${valueOrMissing(sidecar.riskBand)}) | lattice: ${lattice}`);
  return lines;
}

export function rehydrateHiddenAuditSummaryV1(result: SemanticResultV1, sidecar: PresentationSidecarV1) {
  const sources = result.modules.map((moduleResult) => {
    const module = sidecar.modules[moduleResult.moduleIndex];
    const confidence = moduleResult.confidenceSelector === "DIRECT"
      ? module.confidenceDirect
      : module.confidenceFallback;
    return [module.label, valueOrMissing(module.primaryEnvironmentCode), valueOrMissing(module.signalStrength), valueOrMissing(confidence)];
  });
  return [
    "MERGEVUE INTERNAL USER-ANSWERS AUDIT",
    "",
    "1. TRIAGE VERDICT",
    `TRIAGE: ${valueOrMissing(sidecar.triageEffectiveTier)} | gate: ${valueOrMissing(sidecar.triageGate)} | route: ${valueOrMissing(sidecar.triageRouteLabel)} | triggers: ${numberOrMissing(sidecar.triageTriggerCount)}`,
    "",
    "2. SOURCES",
    "SOURCE | ENV | SIGNAL | CONFIDENCE",
    ...sources.map((row) => row.join(" | ")),
    "",
    "3. RESOLVED PAIR",
    `PAIR: ${valueOrMissing(sidecar.acquirerEnvironmentCode)} -> ${valueOrMissing(sidecar.targetEnvironmentCode)} | target label source: ${targetResolutionLabel(result, sidecar)} | ECS: ${numberOrMissing(sidecar.compatibilityScore)} | band: ${valueOrMissing(sidecar.riskBand)}`,
    "",
    "4. CONTRADICTIONS",
    ...contradictionLines(result, sidecar),
    "",
    "5. DEAL INPUTS",
    ...dealInputLines(result, sidecar),
    "",
    "6. ANSWER SHEETS",
    ...answerSheetLines(result, sidecar),
    "",
    "7. SCORING RECONCILIATION",
    ...scoringReconciliationLines(result, sidecar),
    "",
    "8. RESOLUTION AUDIT",
    ...resolutionAuditLines(result, sidecar),
  ].join("\n");
}

export const SummaryRehydratorV1 = rehydrateHiddenAuditSummaryV1;
