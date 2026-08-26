export const TARGET_OBSERVATION_SETUP_RAW_VALUE_MAX_LENGTH = 512;

export const TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS = Object.freeze([
  Object.freeze({
    fieldId: "observationPosition",
    canonicalVocabulary: "target_observation_setup.observationPosition@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/TARGET_OBSERVATION_SETUP_FIELDS/observationPosition@v1",
  }),
  Object.freeze({
    fieldId: "targetExposureDuration",
    canonicalVocabulary: "target_observation_setup.targetExposureDuration@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/targetExposureDuration@v1",
  }),
  Object.freeze({
    fieldId: "targetAccessLevel",
    canonicalVocabulary: "target_observation_setup.targetAccessLevel@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/targetAccessLevel@v1",
  }),
  Object.freeze({
    fieldId: "observedActorLevel",
    canonicalVocabulary: "target_observation_setup.observedActorLevel@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/observedActorLevel@v1",
  }),
  Object.freeze({
    fieldId: "observationEvidenceBasis",
    canonicalVocabulary: "target_observation_setup.observationEvidenceBasis@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/RESPONDENT_CONTEXT_SECTIONS/observationEvidenceBasis@v1",
  }),
  Object.freeze({
    fieldId: "integrationTimeline",
    canonicalVocabulary: "target_observation_setup.integrationTimeline@v1",
    mappingProvenance: "runtime_whitelist:targetObservationSetup/TARGET_OBSERVATION_SETUP_FIELDS/integrationTimeline@v1",
  }),
]);

const RESPONDENT_CONTEXT_PROFILE_FIELD_IDS = Object.freeze(new Set([
  "targetExposureDuration",
  "targetAccessLevel",
  "observedActorLevel",
  "observationEvidenceBasis",
]));

function sourceValue(input, fieldId) {
  const source = typeof input === "object" && input ? input : {};
  const directValue = source[fieldId];
  if (directValue !== null && directValue !== undefined) return directValue;
  if (!RESPONDENT_CONTEXT_PROFILE_FIELD_IDS.has(fieldId)) return directValue;

  const profile = typeof source.respondentContextProfile === "object" && source.respondentContextProfile
    ? source.respondentContextProfile
    : {};
  return profile[fieldId];
}

function isAllowedCanonicalValue(allowedValues, value) {
  if (allowedValues instanceof Set) return allowedValues.has(value);
  return Array.isArray(allowedValues) && allowedValues.includes(value);
}

export function hasOversizedTargetObservationSetupRawValue(input) {
  return TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.some(({ fieldId }) => {
    const value = sourceValue(input, fieldId);
    return typeof value === "string" && value.length > TARGET_OBSERVATION_SETUP_RAW_VALUE_MAX_LENGTH;
  });
}

export function buildTargetObservationSetupMetadataProvenance(input, allowedValuesByField = {}) {
  return Object.freeze(TARGET_OBSERVATION_SETUP_METADATA_DESCRIPTORS.map((descriptor) => {
    const source = sourceValue(input, descriptor.fieldId);
    const rawValue = typeof source === "string" ? source : null;
    const normalizedValue = rawValue === null ? null : rawValue.trim();
    const canonicalValue = normalizedValue !== null
      && isAllowedCanonicalValue(allowedValuesByField[descriptor.fieldId], normalizedValue)
      ? normalizedValue
      : null;

    return Object.freeze({
      fieldId: descriptor.fieldId,
      rawValue,
      canonicalValue,
      canonicalVocabulary: descriptor.canonicalVocabulary,
      mappingProvenance: descriptor.mappingProvenance,
      resolutionStatus: canonicalValue === null ? "UNRESOLVED" : "RESOLVED",
    });
  }));
}
