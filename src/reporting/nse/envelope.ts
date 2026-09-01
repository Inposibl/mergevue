import {
  SemanticKernelV1,
  type NseEnvironmentRowFactV1,
  type NseFindingFactV1,
  type NseModuleFactV1,
  type NseResponseFactV1,
  type SemanticCapsuleV1,
  type SemanticKernelProviderV1,
  type SemanticResultV1,
} from "./kernel.ts";
import { OutputVerifierV1 } from "./result.ts";
import {
  SummaryRehydratorV1,
  type NseDealPresentationV1,
  type NseFindingPresentationV1,
  type NseModulePresentationV1,
  type NseResponsePresentationV1,
  type PresentationSidecarV1,
} from "./rehydrate.ts";

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
const MODULE_LABELS = Object.freeze([
  "Acquirer self-observation",
  "Target current diagnostic",
  "Target self-description",
  "Target observed by acquirer",
]);
const CAPSULE_KEYS = Object.freeze([
  "schemaVersion",
  "modules",
  "findingsIsArray",
  "findings",
  "resolutionSourceTruthy",
  "resolutionSourceIsString",
  "resolutionLabelIsNullish",
  "resolutionRuleIsNullish",
  "contributorsIsArray",
  "contributorOrdinals",
  "dealDataIsNullish",
  "dataCompensationValuePrimaryIsNullish",
  "dataCompensationCurrencyPrimaryIsNullish",
  "dataCompensationStatusPrimaryIsNullish",
  "rootCompensationValuePrimaryIsNullish",
  "rootCompensationCurrencyPrimaryIsNullish",
  "rootCompensationStatusPrimaryIsNullish",
  "compatibilityScoreNumber",
  "compatibilityScoreFinite",
]);
const MODULE_FACT_KEYS = Object.freeze([
  "moduleCompletedTruthy",
  "scoreTruthy",
  "scoreConfidenceIsNullish",
  "respondentSideDataIsNullish",
  "responsesIsArray",
  "responses",
  "environmentRows",
  "primarySignalNumber",
  "primarySignalFinite",
  "secondarySignalNumber",
  "secondarySignalFinite",
]);
const RESPONSE_FACT_KEYS = Object.freeze([
  "missingTruthy",
  "excludedFromPrimaryScoringTruthy",
  "signalCodesIsArray",
  "signalCodeOrdinals",
  "questionIdTruthy",
]);
const ENVIRONMENT_ROW_KEYS = Object.freeze(["environmentOrdinal", "raw", "weighted"]);
const FINDING_FACT_KEYS = Object.freeze([
  "leftSourceTruthy",
  "rightSourceTruthy",
  "leftSignalCodeTruthy",
  "rightSignalCodeTruthy",
  "affectedSource0IsNullish",
  "sourceLabelIsNullish",
  "titleIsNullish",
  "explanationIsNullish",
  "evidenceBasisIsNullish",
  "typeIsNullish",
  "findingTypeIsNullish",
]);

export type AuthorizedNseProjectionV1 = Readonly<{
  session: any;
  deliverable: any;
}>;

export type OwnerAuditPayloadV1 = Readonly<{
  session: any;
  deliverable: any;
}>;

export type CompiledNativeSafetyEnvelopeV1 = Readonly<{
  capsule: SemanticCapsuleV1;
  sidecar: PresentationSidecarV1;
  ownerAuditPayload: OwnerAuditPayloadV1;
}>;

export type NativeSafetyEnvelopeArtifactV1 = Readonly<{
  json: string;
  summary: string;
}>;

export type NativeSafetyEnvelopeDependenciesV1 = Readonly<{
  kernelProvider?: SemanticKernelProviderV1;
}>;

export class NativeSafetyEnvelopeError extends Error {
  readonly stage: "COMPILER" | "KERNEL" | "VERIFIER" | "REHYDRATOR";

  constructor(stage: "COMPILER" | "KERNEL" | "VERIFIER" | "REHYDRATOR") {
    super(`NSE_${stage}_FAILED`);
    this.name = "NativeSafetyEnvelopeError";
    this.stage = stage;
  }
}

function isNullish(value: unknown) {
  return value === null || value === undefined;
}

function environmentOrdinal(value: unknown) {
  switch (value) {
    case "NT/STJ": return 0;
    case "NT/STP": return 1;
    case "NF/NT": return 2;
    case "NF/SFJ": return 3;
    case "NF/SFP": return 4;
    case "SFJ/SFP": return 5;
    case "STJ/STP": return 6;
    case "STP/STJ": return 7;
    case "SFP/SFJ": return 8;
    default: return -1;
  }
}

function contributorOrdinal(value: unknown) {
  switch (value) {
    case "acquirer2A": return 0;
    case "targetDiagnostic": return 1;
    case "targetSelfAssessment": return 2;
    case "targetObservation": return 3;
    default: return -1;
  }
}

function exactKeys(value: any, keys: readonly string[]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  const actual = Object.keys(value);
  if (actual.length !== keys.length) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  }
}

function booleanValue(value: unknown) {
  if (typeof value !== "boolean") throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
}

function integerInRange(value: unknown, minimum: number, maximum: number) {
  if (!Number.isInteger(value) || Number(value) < minimum || Number(value) > maximum) {
    throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  }
}

export function validateSemanticCapsuleV1(value: unknown): asserts value is SemanticCapsuleV1 {
  const capsule: any = value;
  exactKeys(capsule, CAPSULE_KEYS);
  if (capsule.schemaVersion !== "nse-semantic-capsule-v1") throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  for (const key of [
    "findingsIsArray",
    "resolutionSourceTruthy",
    "resolutionSourceIsString",
    "resolutionLabelIsNullish",
    "resolutionRuleIsNullish",
    "contributorsIsArray",
    "dealDataIsNullish",
    "dataCompensationValuePrimaryIsNullish",
    "dataCompensationCurrencyPrimaryIsNullish",
    "dataCompensationStatusPrimaryIsNullish",
    "rootCompensationValuePrimaryIsNullish",
    "rootCompensationCurrencyPrimaryIsNullish",
    "rootCompensationStatusPrimaryIsNullish",
    "compatibilityScoreFinite",
  ]) booleanValue(capsule[key]);
  if (typeof capsule.compatibilityScoreNumber !== "number") throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  if (!Array.isArray(capsule.contributorOrdinals) || capsule.contributorOrdinals.length > 3) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  for (const ordinal of capsule.contributorOrdinals) integerInRange(ordinal, -1, 3);
  if (!Array.isArray(capsule.findings) || capsule.findings.length > 25) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  for (const finding of capsule.findings) {
    exactKeys(finding, FINDING_FACT_KEYS);
    for (const key of FINDING_FACT_KEYS) booleanValue(finding[key]);
  }
  if (!Array.isArray(capsule.modules) || capsule.modules.length !== 4) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
  for (const module of capsule.modules) {
    exactKeys(module, MODULE_FACT_KEYS);
    for (const key of [
      "moduleCompletedTruthy",
      "scoreTruthy",
      "scoreConfidenceIsNullish",
      "respondentSideDataIsNullish",
      "responsesIsArray",
      "primarySignalFinite",
      "secondarySignalFinite",
    ]) booleanValue(module[key]);
    if (typeof module.primarySignalNumber !== "number" || typeof module.secondarySignalNumber !== "number") throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
    if (!Array.isArray(module.responses) || module.responses.length > 23) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
    for (const response of module.responses) {
      exactKeys(response, RESPONSE_FACT_KEYS);
      for (const key of ["missingTruthy", "excludedFromPrimaryScoringTruthy", "signalCodesIsArray", "questionIdTruthy"]) booleanValue(response[key]);
      if (!Array.isArray(response.signalCodeOrdinals) || response.signalCodeOrdinals.length > 2) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
      for (const ordinal of response.signalCodeOrdinals) integerInRange(ordinal, -1, 8);
    }
    if (!Array.isArray(module.environmentRows) || module.environmentRows.length !== 9) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
    const seen = new Set<number>();
    for (const row of module.environmentRows) {
      exactKeys(row, ENVIRONMENT_ROW_KEYS);
      integerInRange(row.environmentOrdinal, 0, 8);
      if (seen.has(row.environmentOrdinal)) throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
      seen.add(row.environmentOrdinal);
      if (typeof row.raw !== "number" || typeof row.weighted !== "number") throw new TypeError("NSE_CAPSULE_SCHEMA_REJECTED");
    }
  }
}

function freezeTree<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) freezeTree((value as any)[key]);
  return Object.freeze(value);
}

function responsePresentation(response: any): NseResponsePresentationV1 {
  return {
    questionId: response?.questionId,
    selectedOption: response?.selectedOption,
    signalCodes: response?.signalCodes,
    evidenceType: response?.evidenceType,
    knowledgeLevel: response?.knowledgeLevel,
    confidence: response?.confidence,
    weight: response?.weight,
    reliabilityFlags: response?.reliabilityFlags,
    canonicalQuestionId: response?.canonicalQuestionId,
    workbookQuestionId: response?.workbookQuestionId,
    questionModuleId: response?.questionModuleId,
    respondentId: response?.respondentId,
    respondentSlot: response?.respondentSlot,
    respondentIdentityStatus: response?.respondentIdentityStatus,
  };
}

function responseFact(response: any): NseResponseFactV1 {
  const signalCodes = response?.signalCodes;
  const signalCodesIsArray = Array.isArray(signalCodes);
  const signalCodeOrdinals = signalCodesIsArray
    ? signalCodes.map((code: unknown) => environmentOrdinal(code))
    : [];
  return {
    missingTruthy: Boolean(response?.missing),
    excludedFromPrimaryScoringTruthy: Boolean(response?.excludedFromPrimaryScoring),
    signalCodesIsArray,
    signalCodeOrdinals,
    questionIdTruthy: Boolean(response?.questionId),
  };
}

function moduleCompilation(module: any, score: any, label: string) {
  const responseSource = score?.questionResponses;
  const responsesIsArray = Array.isArray(responseSource);
  const responses = responsesIsArray ? responseSource : [];
  const primarySignalNumber = Number(score?.primarySignalScore);
  const secondarySignalNumber = Number(score?.secondarySignalScore);
  const fact: NseModuleFactV1 = {
    moduleCompletedTruthy: Boolean(module?.completed),
    scoreTruthy: Boolean(score),
    scoreConfidenceIsNullish: isNullish(score?.confidence),
    respondentSideDataIsNullish: isNullish(module?.data?.respondentSide),
    responsesIsArray,
    responses: responses.map(responseFact),
    environmentRows: ENVIRONMENT_CODES.map((code, environmentIndex): NseEnvironmentRowFactV1 => ({
      environmentOrdinal: environmentIndex,
      raw: Number(score?.environmentScores?.[code]) || 0,
      weighted: Number(score?.weightedEnvironmentScores?.[code]) || 0,
    })),
    primarySignalNumber,
    primarySignalFinite: Number.isFinite(primarySignalNumber),
    secondarySignalNumber,
    secondarySignalFinite: Number.isFinite(secondarySignalNumber),
  };
  const presentation: NseModulePresentationV1 = {
    label,
    primaryEnvironmentCode: score?.primaryEnvironmentCode,
    signalStrength: score?.signalStrength,
    confidenceDirect: score?.confidence,
    confidenceFallback: score?.evidenceQuality?.confidence,
    respondentSideData: module?.data?.respondentSide,
    respondentSideRoot: module?.respondentSide,
    answeredQuestionCount: score?.answeredQuestionCount,
    questionCount: score?.questionCount,
    primarySignalScore: score?.primarySignalScore,
    secondaryEnvironmentCode: score?.secondaryEnvironmentCode,
    secondarySignalScore: score?.secondarySignalScore,
    responses: responses.map(responsePresentation),
  };
  return { fact, presentation };
}

function findingFact(finding: any): NseFindingFactV1 {
  return {
    leftSourceTruthy: Boolean(finding?.leftSource),
    rightSourceTruthy: Boolean(finding?.rightSource),
    leftSignalCodeTruthy: Boolean(finding?.leftSignalCode),
    rightSignalCodeTruthy: Boolean(finding?.rightSignalCode),
    affectedSource0IsNullish: isNullish(finding?.affectedSources?.[0]),
    sourceLabelIsNullish: isNullish(finding?.sourceLabel),
    titleIsNullish: isNullish(finding?.title),
    explanationIsNullish: isNullish(finding?.explanation),
    evidenceBasisIsNullish: isNullish(finding?.evidenceBasis),
    typeIsNullish: isNullish(finding?.type),
    findingTypeIsNullish: isNullish(finding?.findingType),
  };
}

function findingPresentation(finding: any): NseFindingPresentationV1 {
  return {
    severity: finding?.severity,
    type: finding?.type,
    findingType: finding?.findingType,
    leftSource: finding?.leftSource,
    rightSource: finding?.rightSource,
    leftSignalCode: finding?.leftSignalCode,
    rightSignalCode: finding?.rightSignalCode,
    affectedSource0: finding?.affectedSources?.[0],
    sourceLabel: finding?.sourceLabel,
    title: finding?.title,
    explanation: finding?.explanation,
    evidenceBasis: finding?.evidenceBasis,
  };
}

function dealPresentation(deal: any): NseDealPresentationV1["data"] {
  return {
    acquirerName: deal?.acquirerName,
    targetName: deal?.targetName,
    dealType: deal?.dealType,
    enterpriseValue: deal?.enterpriseValue,
    enterpriseValueCurrency: deal?.enterpriseValueCurrency,
    enterpriseValueStatus: deal?.enterpriseValueStatus,
    averageAnnualCompensationPerKeyPerson: deal?.averageAnnualCompensationPerKeyPerson,
    averageAnnualCompensation: deal?.averageAnnualCompensation,
    averageAnnualCompensationCurrency: deal?.averageAnnualCompensationCurrency,
    compensationCurrency: deal?.compensationCurrency,
    averageAnnualCompensationStatus: deal?.averageAnnualCompensationStatus,
    compensationStatus: deal?.compensationStatus,
    keyPersonnelAtRisk: deal?.keyPersonnelAtRisk,
    respondentSide: deal?.respondentSide,
    respondentAccessLevel: deal?.respondentAccessLevel,
    transactionRole: deal?.transactionRole,
    integrationTimeline: deal?.integrationTimeline,
  };
}

export function compileNativeSafetyEnvelopeV1(projection: AuthorizedNseProjectionV1): CompiledNativeSafetyEnvelopeV1 {
  const session = projection?.session;
  const deliverable = projection?.deliverable;
  if (!session || typeof session !== "object" || Array.isArray(session) || Object.keys(session).length === 0) {
    throw new TypeError("NSE_COMPILER_INPUT_REJECTED");
  }
  if (!deliverable || typeof deliverable !== "object" || Array.isArray(deliverable) || Object.keys(deliverable).length === 0) {
    throw new TypeError("NSE_COMPILER_INPUT_REJECTED");
  }

  const moduleSources = [
    moduleCompilation(session?.acquirer2A, session?.acquirer2A?.score, MODULE_LABELS[0]),
    moduleCompilation(session?.target2B, session?.target2B?.finalScore, MODULE_LABELS[1]),
    moduleCompilation(session?.targetSelfAssessment, session?.targetSelfAssessment?.score, MODULE_LABELS[2]),
    moduleCompilation(session?.targetObservation, session?.targetObservation?.score, MODULE_LABELS[3]),
  ];
  const findingsSource = session?.preliminaryAssessment?.contradictionReport?.findings;
  const findingsIsArray = Array.isArray(findingsSource);
  const findings = findingsIsArray ? findingsSource : [];
  const resolutionSource = deliverable?.targetResolutionSource;
  const contributorsSource = resolutionSource?.contributors;
  const contributorsIsArray = Array.isArray(contributorsSource);
  const contributors = contributorsIsArray ? contributorsSource : [];
  const dealData = session?.dealContext?.data;
  const dealRoot = session?.dealContext;
  const compatibilityScoreNumber = Number(deliverable?.compatibilityScore);

  const capsule: SemanticCapsuleV1 = {
    schemaVersion: "nse-semantic-capsule-v1",
    modules: moduleSources.map((source) => source.fact),
    findingsIsArray,
    findings: findings.map(findingFact),
    resolutionSourceTruthy: Boolean(resolutionSource),
    resolutionSourceIsString: typeof resolutionSource === "string",
    resolutionLabelIsNullish: isNullish(resolutionSource?.label),
    resolutionRuleIsNullish: isNullish(resolutionSource?.rule),
    contributorsIsArray,
    contributorOrdinals: contributors.map((contributor: unknown) => contributorOrdinal(contributor)),
    dealDataIsNullish: isNullish(dealData),
    dataCompensationValuePrimaryIsNullish: isNullish(dealData?.averageAnnualCompensationPerKeyPerson),
    dataCompensationCurrencyPrimaryIsNullish: isNullish(dealData?.averageAnnualCompensationCurrency),
    dataCompensationStatusPrimaryIsNullish: isNullish(dealData?.averageAnnualCompensationStatus),
    rootCompensationValuePrimaryIsNullish: isNullish(dealRoot?.averageAnnualCompensationPerKeyPerson),
    rootCompensationCurrencyPrimaryIsNullish: isNullish(dealRoot?.averageAnnualCompensationCurrency),
    rootCompensationStatusPrimaryIsNullish: isNullish(dealRoot?.averageAnnualCompensationStatus),
    compatibilityScoreNumber,
    compatibilityScoreFinite: Number.isFinite(compatibilityScoreNumber),
  };
  validateSemanticCapsuleV1(capsule);

  const sidecar: PresentationSidecarV1 = {
    schemaVersion: "nse-presentation-sidecar-v1",
    triageEffectiveTier: session?.preliminaryAssessment?.triageReport?.effectiveTier,
    triageGate: session?.preliminaryAssessment?.triageReport?.routing?.gate,
    triageRouteLabel: session?.preliminaryAssessment?.triageReport?.routing?.label,
    triageTriggerCount: session?.preliminaryAssessment?.triageReport?.triggerCount,
    modules: moduleSources.map((source) => source.presentation),
    findings: findings.map(findingPresentation),
    deal: {
      data: dealPresentation(dealData),
      root: dealPresentation(dealRoot),
    },
    acquirerEnvironmentCode: deliverable?.acquirerEnvironmentCode,
    targetEnvironmentCode: deliverable?.targetEnvironmentCode,
    compatibilityScore: deliverable?.compatibilityScore,
    riskBand: deliverable?.riskBand,
    resolutionString: resolutionSource,
    resolutionLabel: resolutionSource?.label,
    resolutionRule: resolutionSource?.rule,
    resolutionContributors: resolutionSource?.contributors,
  };
  const ownerAuditPayload: OwnerAuditPayloadV1 = { session, deliverable };
  return Object.freeze({
    capsule: freezeTree(capsule),
    sidecar,
    ownerAuditPayload,
  });
}

function stableJsonValue(value: any, seen = new WeakSet<object>()): any {
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

function serializeOwnerAuditPayload(payload: OwnerAuditPayloadV1) {
  return JSON.stringify(stableJsonValue(payload), null, 2);
}

function cleanHiddenAuditArtifact(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.replace(/\u0000/g, "");
}

function stageFailure(stage: "COMPILER" | "KERNEL" | "VERIFIER" | "REHYDRATOR"): never {
  throw new NativeSafetyEnvelopeError(stage);
}

export function createNativeSafetyEnvelopeArtifact(
  projection: AuthorizedNseProjectionV1,
  dependencies: NativeSafetyEnvelopeDependenciesV1 = {},
): NativeSafetyEnvelopeArtifactV1 {
  let compiled: CompiledNativeSafetyEnvelopeV1;
  try {
    compiled = compileNativeSafetyEnvelopeV1(projection);
  } catch {
    return stageFailure("COMPILER");
  }

  let semanticResult: SemanticResultV1;
  try {
    const kernelProvider = dependencies.kernelProvider ?? SemanticKernelV1;
    semanticResult = freezeTree(kernelProvider(compiled.capsule));
  } catch {
    return stageFailure("KERNEL");
  }

  try {
    OutputVerifierV1(semanticResult);
  } catch {
    return stageFailure("VERIFIER");
  }

  try {
    const json = cleanHiddenAuditArtifact(serializeOwnerAuditPayload(compiled.ownerAuditPayload));
    const summary = cleanHiddenAuditArtifact(SummaryRehydratorV1(semanticResult, compiled.sidecar));
    if (!json || !summary) return stageFailure("REHYDRATOR");
    return Object.freeze({ json, summary });
  } catch (error) {
    if (error instanceof NativeSafetyEnvelopeError) throw error;
    return stageFailure("REHYDRATOR");
  }
}

export const EnvelopeCompilerV1 = compileNativeSafetyEnvelopeV1;
