export type NseResolutionKind = "MISSING" | "STRING" | "OBJECT";
export type NseResolutionLabelSelector = "NONE" | "STRING" | "LABEL" | "RULE";
export type NseFindingListState = "NON_ARRAY" | "EMPTY" | "ITEMS";
export type NseFindingShape = "PAIR" | "NON_PAIR";
export type NseFindingSourceSelector = "LEFT_RIGHT" | "AFFECTED_SOURCE_0" | "SOURCE_LABEL" | "TITLE";
export type NseFindingReasonSelector = "EXPLANATION" | "EVIDENCE_BASIS";
export type NseFindingTypeSelector = "TYPE" | "FINDING_TYPE";
export type NseModuleState = "INCLUDED" | "NOT_COMPLETED";
export type NseOptionState = "MISSING" | "VALUE" | "VALUE_EXCLUDED";
export type NseConfidenceSelector = "DIRECT" | "EVIDENCE_QUALITY";
export type NseRespondentSideSelector = "DATA" | "ROOT";
export type NseDealSourceSelector = "DATA" | "ROOT";
export type NseFallbackSelector = "PRIMARY" | "FALLBACK";
export type NseScoreMarginState = "VALUE" | "MISSING";
export type NseOverrideState = "WINNING" | "OVERRIDDEN" | "ABSENT";
export type NseLatticeState = "ON_LATTICE" | "OFF_LATTICE";

export type NseResponseFactV1 = Readonly<{
  missingTruthy: boolean;
  excludedFromPrimaryScoringTruthy: boolean;
  signalCodesIsArray: boolean;
  signalCodeOrdinals: readonly number[];
  questionIdTruthy: boolean;
}>;

export type NseEnvironmentRowFactV1 = Readonly<{
  environmentOrdinal: number;
  raw: number;
  weighted: number;
}>;

export type NseModuleFactV1 = Readonly<{
  moduleCompletedTruthy: boolean;
  scoreTruthy: boolean;
  scoreConfidenceIsNullish: boolean;
  respondentSideDataIsNullish: boolean;
  responsesIsArray: boolean;
  responses: readonly NseResponseFactV1[];
  environmentRows: readonly NseEnvironmentRowFactV1[];
  primarySignalNumber: number;
  primarySignalFinite: boolean;
  secondarySignalNumber: number;
  secondarySignalFinite: boolean;
}>;

export type NseFindingFactV1 = Readonly<{
  leftSourceTruthy: boolean;
  rightSourceTruthy: boolean;
  leftSignalCodeTruthy: boolean;
  rightSignalCodeTruthy: boolean;
  affectedSource0IsNullish: boolean;
  sourceLabelIsNullish: boolean;
  titleIsNullish: boolean;
  explanationIsNullish: boolean;
  evidenceBasisIsNullish: boolean;
  typeIsNullish: boolean;
  findingTypeIsNullish: boolean;
}>;

export type SemanticCapsuleV1 = Readonly<{
  schemaVersion: "nse-semantic-capsule-v1";
  modules: readonly NseModuleFactV1[];
  findingsIsArray: boolean;
  findings: readonly NseFindingFactV1[];
  resolutionSourceTruthy: boolean;
  resolutionSourceIsString: boolean;
  resolutionLabelIsNullish: boolean;
  resolutionRuleIsNullish: boolean;
  contributorsIsArray: boolean;
  contributorOrdinals: readonly number[];
  dealDataIsNullish: boolean;
  dataCompensationValuePrimaryIsNullish: boolean;
  dataCompensationCurrencyPrimaryIsNullish: boolean;
  dataCompensationStatusPrimaryIsNullish: boolean;
  rootCompensationValuePrimaryIsNullish: boolean;
  rootCompensationCurrencyPrimaryIsNullish: boolean;
  rootCompensationStatusPrimaryIsNullish: boolean;
  compatibilityScoreNumber: number;
  compatibilityScoreFinite: boolean;
}>;

export type NseOrderedEnvironmentRowV1 = Readonly<{
  environmentOrdinal: number;
  raw: number;
  weighted: number;
  contributingResponseRefs: readonly number[];
}>;

export type NseModuleResultV1 = Readonly<{
  moduleIndex: number;
  confidenceSelector: NseConfidenceSelector;
  respondentSideSelector: NseRespondentSideSelector;
  answerSheetState: NseModuleState;
  scoringState: NseModuleState;
  optionStates: readonly NseOptionState[];
  orderedEnvironmentRows: readonly NseOrderedEnvironmentRowV1[];
  margin: number;
  scoreMarginState: NseScoreMarginState;
  scoreMarginValue: number;
  overrideState: NseOverrideState;
}>;

export type NseFindingResultV1 = Readonly<{
  findingIndex: number;
  shape: NseFindingShape;
  sourceSelector: NseFindingSourceSelector;
  reasonSelector: NseFindingReasonSelector;
  typeSelector: NseFindingTypeSelector;
}>;

export type SemanticResultV1 = Readonly<{
  schemaVersion: "nse-semantic-result-v1";
  resolutionKind: NseResolutionKind;
  resolutionLabelSelector: NseResolutionLabelSelector;
  findingListState: NseFindingListState;
  findings: readonly NseFindingResultV1[];
  dealSourceSelector: NseDealSourceSelector;
  compensationValueSelector: NseFallbackSelector;
  compensationCurrencySelector: NseFallbackSelector;
  compensationStatusSelector: NseFallbackSelector;
  modules: readonly NseModuleResultV1[];
  latticeState: NseLatticeState;
  latticeK: number;
}>;

function semanticKernelV1(capsule: SemanticCapsuleV1): SemanticResultV1 {
  const environmentLexicalRanks = [3, 4, 0, 1, 2, 5, 7, 8, 6];
  let resolutionKind: NseResolutionKind;
  let resolutionLabelSelector: NseResolutionLabelSelector;
  if (!capsule.resolutionSourceTruthy) {
    resolutionKind = "MISSING";
    resolutionLabelSelector = "NONE";
  } else if (capsule.resolutionSourceIsString) {
    resolutionKind = "STRING";
    resolutionLabelSelector = "STRING";
  } else {
    resolutionKind = "OBJECT";
    resolutionLabelSelector = capsule.resolutionLabelIsNullish ? "RULE" : "LABEL";
  }

  const findingListState: NseFindingListState = !capsule.findingsIsArray
    ? "NON_ARRAY"
    : capsule.findings.length === 0
      ? "EMPTY"
      : "ITEMS";

  const findings = capsule.findings.map((finding, findingIndex): NseFindingResultV1 => {
    const pair = finding.leftSourceTruthy
      || finding.rightSourceTruthy
      || finding.leftSignalCodeTruthy
      || finding.rightSignalCodeTruthy;
    let sourceSelector: NseFindingSourceSelector;
    if (pair) {
      sourceSelector = "LEFT_RIGHT";
    } else if (!finding.affectedSource0IsNullish) {
      sourceSelector = "AFFECTED_SOURCE_0";
    } else if (!finding.sourceLabelIsNullish) {
      sourceSelector = "SOURCE_LABEL";
    } else {
      sourceSelector = "TITLE";
    }
    return {
      findingIndex,
      shape: pair ? "PAIR" : "NON_PAIR",
      sourceSelector,
      reasonSelector: finding.explanationIsNullish ? "EVIDENCE_BASIS" : "EXPLANATION",
      typeSelector: finding.typeIsNullish ? "FINDING_TYPE" : "TYPE",
    };
  });

  const modules = capsule.modules.map((module, moduleIndex): NseModuleResultV1 => {
    const included = module.moduleCompletedTruthy && module.scoreTruthy;
    const optionStates = module.responses.map((response): NseOptionState => {
      if (response.missingTruthy) return "MISSING";
      return response.excludedFromPrimaryScoringTruthy ? "VALUE_EXCLUDED" : "VALUE";
    });
    const orderedEnvironmentRows = module.environmentRows
      .map((row) => ({
        environmentOrdinal: row.environmentOrdinal,
        raw: row.raw,
        weighted: row.weighted,
        contributingResponseRefs: module.responses
          .map((response, responseIndex) => ({ response, responseIndex }))
          .filter(({ response }) => !response.missingTruthy
            && response.signalCodesIsArray
            && response.signalCodeOrdinals.includes(row.environmentOrdinal)
            && response.questionIdTruthy)
          .map(({ responseIndex }) => responseIndex),
      }))
      .sort((left, right) => right.weighted - left.weighted
        || environmentLexicalRanks[left.environmentOrdinal] - environmentLexicalRanks[right.environmentOrdinal]);
    const margin = (module.primarySignalNumber || 0) - (module.secondarySignalNumber || 0);
    const hasScoreMargin = module.primarySignalFinite && module.secondarySignalFinite;
    let overrideState: NseOverrideState = "WINNING";
    if (moduleIndex > 0) {
      overrideState = !module.scoreTruthy
        ? "ABSENT"
        : capsule.contributorOrdinals.includes(moduleIndex)
          ? "WINNING"
          : "OVERRIDDEN";
    }
    return {
      moduleIndex,
      confidenceSelector: module.scoreConfidenceIsNullish ? "EVIDENCE_QUALITY" : "DIRECT",
      respondentSideSelector: module.respondentSideDataIsNullish ? "ROOT" : "DATA",
      answerSheetState: included ? "INCLUDED" : "NOT_COMPLETED",
      scoringState: included ? "INCLUDED" : "NOT_COMPLETED",
      optionStates,
      orderedEnvironmentRows,
      margin,
      scoreMarginState: hasScoreMargin ? "VALUE" : "MISSING",
      scoreMarginValue: hasScoreMargin
        ? module.primarySignalNumber - module.secondarySignalNumber
        : 0,
      overrideState,
    };
  });

  const latticeValue = 34 * (1 - capsule.compatibilityScoreNumber / 100);
  const onLattice = capsule.compatibilityScoreFinite
    && Number.isFinite(latticeValue)
    && Math.abs(latticeValue - Math.round(latticeValue)) < 0.01;

  const dealSourceSelector: NseDealSourceSelector = capsule.dealDataIsNullish ? "ROOT" : "DATA";
  const compensationValuePrimaryIsNullish = dealSourceSelector === "DATA"
    ? capsule.dataCompensationValuePrimaryIsNullish
    : capsule.rootCompensationValuePrimaryIsNullish;
  const compensationCurrencyPrimaryIsNullish = dealSourceSelector === "DATA"
    ? capsule.dataCompensationCurrencyPrimaryIsNullish
    : capsule.rootCompensationCurrencyPrimaryIsNullish;
  const compensationStatusPrimaryIsNullish = dealSourceSelector === "DATA"
    ? capsule.dataCompensationStatusPrimaryIsNullish
    : capsule.rootCompensationStatusPrimaryIsNullish;

  return {
    schemaVersion: "nse-semantic-result-v1",
    resolutionKind,
    resolutionLabelSelector,
    findingListState,
    findings,
    dealSourceSelector,
    compensationValueSelector: compensationValuePrimaryIsNullish ? "FALLBACK" : "PRIMARY",
    compensationCurrencySelector: compensationCurrencyPrimaryIsNullish ? "FALLBACK" : "PRIMARY",
    compensationStatusSelector: compensationStatusPrimaryIsNullish ? "FALLBACK" : "PRIMARY",
    modules,
    latticeState: onLattice ? "ON_LATTICE" : "OFF_LATTICE",
    latticeK: onLattice ? Math.round(latticeValue) : 0,
  };
}

export const SemanticKernelV1 = semanticKernelV1;
export type SemanticKernelProviderV1 = (capsule: SemanticCapsuleV1) => SemanticResultV1;
