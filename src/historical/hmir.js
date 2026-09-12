import {
  CERTIFICATION_DISPOSITION,
  CERTIFICATION_RESULT,
  CHECK_CLASS,
  COLLECTION_STATUS,
  DECLARED_NOT_INSTANTIATED_REASON,
  DOMAIN_TAG,
  MATH_BLOCK_ID,
  REGISTRY_VERSION,
  RETRIEVAL_QUALIFICATION,
  RETRIEVAL_ROLE,
  SLOT_TYPE_VERSION,
  STOPPING_RULE_AUTHORITY,
} from "./constants.js";
import { failClosed } from "./errors.js";
import { computeIdentity } from "./identity.js";
import { digestCanonical } from "./canonical.js";
import { methodCreditEligible } from "./retrieval.js";
import { assertCarrierMatchesCase, resolveT0DeterminationCarrier } from "./certification.js";

export function mbEnvSlotType() {
  return {
    slotTypeId: "ST-MB-ENV-SEMANTIC",
    slotTypeVersion: SLOT_TYPE_VERSION,
    registryVersion: REGISTRY_VERSION,
    mathBlockId: MATH_BLOCK_ID.MB_ENV,
    operatorIdentity: "UNRESOLVED",
    consumerIdentity: "UNRESOLVED",
    semanticRuleRef: "UNRESOLVED",
    sufficiencyRule: "UNRESOLVED",
    coreConsumable: false,
    obligation: "MANDATORY",
    stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
    permittedMethods: [],
  };
}

export const BLOCK_LANE = Object.freeze({
  PRE_T0: "PRE_T0",
  POST_T0: "POST_T0",
  MODEL_META: "MODEL_META",
});

export const CONSUMER_CLASS = Object.freeze({
  DOCUMENTARY: "DOCUMENTARY",
  OUTCOME_DOCUMENTARY: "OUTCOME_DOCUMENTARY",
  NON_DOCUMENTARY_DERIVED: "NON_DOCUMENTARY_DERIVED",
});

export const GATE_DECISION = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  UNRESOLVED: "UNRESOLVED",
});

const PRE_T0_DOCUMENTARY_FACTUAL_RULE = "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B";

const GATE_B_INSUFFICIENT_ALONE = Object.freeze([
  "PRODUCED_DATE",
  "SOURCE_PRODUCTION_DATE",
  "URL",
  "SNAPSHOT",
  "SOURCE_HASH",
  "RETRIEVAL_DATE",
  "ANALYST_ASSERTION",
  "REVIEW_STATUS",
]);

export function controllingAdmissionContractRef(blockLane, consumerClass, semanticRuleRef) {
  if (blockLane === BLOCK_LANE.PRE_T0 && consumerClass === CONSUMER_CLASS.DOCUMENTARY) {
    return {
      lane: BLOCK_LANE.PRE_T0,
      consumerClass: CONSUMER_CLASS.DOCUMENTARY,
      factualRuleRef: PRE_T0_DOCUMENTARY_FACTUAL_RULE,
      semanticRuleRef: semanticRuleRef ?? "UNRESOLVED",
    };
  }
  if (blockLane === BLOCK_LANE.POST_T0) {
    return {
      lane: BLOCK_LANE.POST_T0,
      consumerClass: consumerClass ?? CONSUMER_CLASS.OUTCOME_DOCUMENTARY,
      factualRuleRef: "UNRESOLVED(POST_T0_OUTCOME_ADMISSION_CONTRACT)",
      semanticRuleRef: semanticRuleRef ?? "UNRESOLVED(POST_T0_OUTCOME_SEMANTIC_CONTRACT)",
    };
  }
  if (blockLane === BLOCK_LANE.MODEL_META) {
    return {
      lane: BLOCK_LANE.MODEL_META,
      consumerClass: consumerClass ?? CONSUMER_CLASS.NON_DOCUMENTARY_DERIVED,
      factualRuleRef: "UNRESOLVED(META_INGRESS_CONTRACT)",
      semanticRuleRef: semanticRuleRef ?? "UNRESOLVED",
    };
  }
  return {
    lane: blockLane ?? null,
    consumerClass: consumerClass ?? null,
    factualRuleRef: "UNRESOLVED_ADMISSION_CONTRACT",
    semanticRuleRef: semanticRuleRef ?? "UNRESOLVED",
  };
}

function exactAdmissionContractRef(contract) {
  if (!contract || typeof contract !== "object") return null;
  return {
    lane: contract.lane,
    consumerClass: contract.consumerClass,
    factualRuleRef: contract.factualRuleRef,
    semanticRuleRef: contract.semanticRuleRef,
  };
}

function admissionContractRefsEqual(left, right) {
  const a = exactAdmissionContractRef(left);
  const b = exactAdmissionContractRef(right);
  if (!a || !b) return false;
  return digestCanonical(a) === digestCanonical(b);
}

function factualRuleUnresolved(ref) {
  if (!substantiveValue(ref)) return true;
  return ref === "UNRESOLVED"
    || ref === "UNRESOLVED_ADMISSION_CONTRACT"
    || ref.startsWith("UNRESOLVED(");
}

export function documentaryFactSlotType({
  slotTypeId = "ST-HISTORICAL-FACT",
  permittedMethods,
  allowedSourceClasses,
  blockLane = BLOCK_LANE.PRE_T0,
  consumerClass = CONSUMER_CLASS.DOCUMENTARY,
  semanticRuleRef,
  admissionContractRef,
} = {}) {
  const frozen = exactAdmissionContractRef(
    admissionContractRef ?? controllingAdmissionContractRef(blockLane, consumerClass, semanticRuleRef),
  );
  return {
    slotTypeId,
    slotTypeVersion: SLOT_TYPE_VERSION,
    registryVersion: REGISTRY_VERSION,
    mathBlockId: MATH_BLOCK_ID.MB_TYPE,
    operatorIdentity: "FACTUAL-CERTIFICATION",
    consumerIdentity: "FACTUAL-BASELINE",
    semanticRuleRef: semanticRuleRef ?? frozen.semanticRuleRef,
    sufficiencyRule: "UNRESOLVED",
    coreConsumable: false,
    obligation: "MANDATORY",
    stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
    permittedMethods,
    allowedSourceClasses,
    blockLane,
    consumerClass,
    admissionContractRef: frozen,
  };
}

function pcdbFreezeTime(runtime) {
  const rows = runtime.allocators.listOccurrences();
  if (!Array.isArray(rows) || rows.length === 0) return null;
  let max = null;
  for (const row of rows) {
    if (typeof row.occurrenceSequence === "number" && Number.isFinite(row.occurrenceSequence)) {
      max = max == null ? row.occurrenceSequence : Math.max(max, row.occurrenceSequence);
    }
  }
  return max;
}

function comparableTime(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function substantiveValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function inspectableEvidence(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

export function resolveFactualAdmissionContract(blockLane, consumerClass, semanticRuleRef) {
  const mapped = controllingAdmissionContractRef(blockLane, consumerClass, semanticRuleRef);
  const unresolved = factualRuleUnresolved(mapped.factualRuleRef);
  return {
    ...mapped,
    resolved: !unresolved,
    reason: unresolved ? mapped.factualRuleRef : null,
  };
}

function paeContentSurface(record) {
  if (!record || typeof record !== "object") return null;
  const { publicAvailabilityEvidenceRecordId, ...content } = record;
  void publicAvailabilityEvidenceRecordId;
  return content;
}

export function publicAvailabilityEvidenceRecordId(record) {
  const content = paeContentSurface(record);
  if (!content) failClosed("AVAILABILITY_EVIDENCE_RECORD_INVALID");
  return digestCanonical(content);
}

export function bindPublicAvailabilityEvidenceRecords(records) {
  if (records == null) return [];
  if (!Array.isArray(records)) failClosed("AVAILABILITY_EVIDENCE_RECORD_INVALID");
  return records.map((row) => {
    if (!row || typeof row !== "object") failClosed("AVAILABILITY_EVIDENCE_RECORD_INVALID");
    const content = paeContentSurface(row);
    const id = digestCanonical(content);
    if (row.publicAvailabilityEvidenceRecordId != null
      && row.publicAvailabilityEvidenceRecordId !== id) {
      failClosed("AVAILABILITY_EVIDENCE_IDENTITY_MISMATCH");
    }
    return { ...content, publicAvailabilityEvidenceRecordId: id };
  });
}

function governingDemandSlot(runtime, demandBlueprintId, qual) {
  const blueprint = runtime.store.get("demandBlueprint", demandBlueprintId);
  const slotId = qual?.governingDemandDeclarationId ?? null;
  if (!Array.isArray(blueprint.demandSlots)) return null;
  return blueprint.demandSlots.find((row) => row.demandSlotId === slotId) ?? null;
}

function redundantFrozenValue(top, nested, equalFn = (left, right) => left === right) {
  const topPresent = top != null;
  const nestedPresent = nested != null;
  if (topPresent && nestedPresent) {
    if (!equalFn(top, nested)) {
      return { ok: false, value: null };
    }
    return { ok: true, value: top };
  }
  if (topPresent) return { ok: true, value: top };
  if (nestedPresent) return { ok: true, value: nested };
  return { ok: true, value: null };
}

function readFrozenAdmissionContract(slot) {
  if (!slot || typeof slot !== "object") {
    return {
      ok: false,
      resolved: false,
      reason: "UNRESOLVED_ADMISSION_AUTHORITY",
      detail: "ADMISSION_CONTRACT_REF_MISSING",
      contract: null,
    };
  }
  const laneCopy = redundantFrozenValue(slot.blockLane ?? null, slot.slotType?.blockLane ?? null);
  const consumerCopy = redundantFrozenValue(
    slot.consumerClass ?? null,
    slot.slotType?.consumerClass ?? null,
  );
  const contractCopy = redundantFrozenValue(
    exactAdmissionContractRef(slot.admissionContractRef),
    exactAdmissionContractRef(slot.slotType?.admissionContractRef ?? null),
    admissionContractRefsEqual,
  );
  if (!laneCopy.ok || !consumerCopy.ok || !contractCopy.ok) {
    return {
      ok: false,
      resolved: false,
      reason: "ADMISSION_CONTRACT_SLOT_MISMATCH",
      contract: contractCopy.value,
    };
  }
  const frozen = contractCopy.value;
  if (!frozen
    || !substantiveValue(frozen.lane)
    || !substantiveValue(frozen.consumerClass)
    || !substantiveValue(frozen.factualRuleRef)
    || frozen.semanticRuleRef == null
    || frozen.semanticRuleRef === "") {
    return {
      ok: false,
      resolved: false,
      reason: "UNRESOLVED_ADMISSION_AUTHORITY",
      detail: "ADMISSION_CONTRACT_REF_MISSING",
      contract: frozen,
    };
  }
  const slotLane = laneCopy.value;
  const slotConsumer = consumerCopy.value;
  const slotSemantic = redundantFrozenValue(
    slot.semanticRuleRef ?? null,
    slot.slotType?.semanticRuleRef ?? null,
  );
  if (!slotSemantic.ok) {
    return {
      ok: false,
      resolved: false,
      reason: "ADMISSION_CONTRACT_SLOT_MISMATCH",
      contract: frozen,
    };
  }
  if (frozen.lane !== slotLane || frozen.consumerClass !== slotConsumer) {
    return {
      ok: false,
      resolved: false,
      reason: "ADMISSION_CONTRACT_SLOT_MISMATCH",
      contract: frozen,
    };
  }
  if (slotSemantic.value != null && frozen.semanticRuleRef !== slotSemantic.value) {
    return {
      ok: false,
      resolved: false,
      reason: "ADMISSION_CONTRACT_SEMANTIC_RULE_MISMATCH",
      contract: frozen,
    };
  }
  const mapped = controllingAdmissionContractRef(
    slotLane,
    slotConsumer,
    slotSemantic.value ?? frozen.semanticRuleRef,
  );
  if (frozen.factualRuleRef !== mapped.factualRuleRef
    || frozen.lane !== mapped.lane
    || frozen.consumerClass !== mapped.consumerClass) {
    return {
      ok: false,
      resolved: false,
      reason: "ADMISSION_CONTRACT_REGISTRY_MISMATCH",
      contract: frozen,
      mapped,
    };
  }
  if (factualRuleUnresolved(frozen.factualRuleRef)) {
    return {
      ok: false,
      resolved: false,
      reason: "UNRESOLVED_ADMISSION_AUTHORITY",
      contract: frozen,
    };
  }
  return {
    ok: true,
    resolved: true,
    reason: null,
    contract: frozen,
  };
}

function sourceIdInLineage(sourceId, fact, qual, artifact) {
  if (!substantiveValue(sourceId)) return false;
  return sourceId === fact?.sourceIdentity
    || sourceId === qual?.sourceIdentity
    || sourceId === artifact?.sourceIdentity;
}

function declaredQueryFamilyIdentity(queryFamily) {
  if (typeof queryFamily === "string" && queryFamily.length > 0) return queryFamily;
  if (queryFamily && typeof queryFamily === "object") {
    const identity = queryFamily.queryFamilyBound
      ?? queryFamily.queryFamilyId
      ?? queryFamily.id
      ?? queryFamily.family
      ?? null;
    if (typeof identity === "string" && identity.length > 0) return identity;
  }
  return null;
}

function declaredQueryFamilyMethod(queryFamily, methods) {
  if (queryFamily && typeof queryFamily === "object") {
    if (typeof queryFamily.retrievalMethodRef === "string" && queryFamily.retrievalMethodRef.length > 0) {
      return queryFamily.retrievalMethodRef;
    }
    if (typeof queryFamily.method === "string" && queryFamily.method.length > 0) {
      return queryFamily.method;
    }
  }
  if (Array.isArray(methods) && methods.length === 1) return methods[0];
  return null;
}

function queryFamilyIdentityFromEvent(runtime, event) {
  if (typeof event.queryFamilyBound === "string" && event.queryFamilyBound.length > 0) {
    return event.queryFamilyBound;
  }
  const auth = runtime.store.tryGet("authorization", event.grantingAuthorizationRecordRef);
  if (auth?.authorizedRetrievalDescriptor?.retrievalRole !== RETRIEVAL_ROLE.DISCOVERY) return null;
  const bound = auth.authorizedRetrievalDescriptor.queryFamilyBound;
  return typeof bound === "string" && bound.length > 0 ? bound : null;
}

function methodElementsExecutable(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return false;
  for (const element of elements) {
    if (element?.kind === "SOURCE") {
      if (element.source == null || element.retrievalMethodRef == null) return false;
    } else if (element?.kind === "QUERY_FAMILY") {
      if (element.queryFamilyBound == null || element.retrievalMethodRef == null) return false;
    } else {
      return false;
    }
  }
  return true;
}

export function demandSlotId(components) {
  return computeIdentity(DOMAIN_TAG.DEMAND_SLOT, {
    baseDefinitionalIdentity: components.baseDefinitionalIdentity,
    registryVersion: components.registryVersion ?? REGISTRY_VERSION,
    slotTypeId: components.slotTypeId,
    slotTypeVersion: components.slotTypeVersion ?? SLOT_TYPE_VERSION,
    consumerIdentity: components.consumerIdentity,
    operatorIdentity: components.operatorIdentity,
    caseId: components.caseId,
    T0Identity: components.T0Identity,
    caseGeometryVersion: components.caseGeometryVersion,
    sideRef: components.sideRef ?? "-",
    domainRef: components.domainRef ?? "-",
    unitRef: components.unitRef ?? "-",
    expansionPath: components.expansionPath ?? "-",
    ordinalIndex: components.ordinalIndex ?? 0,
  });
}

export function compileDemandBlueprint(runtime, {
  caseId,
  T0Identity,
  caseSides,
  caseGeometryVersion,
  frozenCaseMetadata = {},
  priorFactualBaselineSealId = null,
  collectionAuthorizationId,
  registryVersion = REGISTRY_VERSION,
  slotTypes = [],
  quarantinePolicyVersion = "v1",
}) {
  if (!caseId || !T0Identity || !Array.isArray(caseSides) || !caseGeometryVersion) {
    failClosed("STAGE_A_G0_INPUT_MISSING");
  }
  if (priorFactualBaselineSealId != null && typeof priorFactualBaselineSealId !== "string") {
    failClosed("PRIOR_SEAL_INVALID");
  }

  const declaredNotInstantiated = [];
  const demandSlots = [];
  const naSlots = [];
  const deferredDemand = [];

  for (const slotType of slotTypes) {
    if (slotType.mathBlockId === MATH_BLOCK_ID.MB_ENV
      || slotType.operatorIdentity === "UNRESOLVED"
      || slotType.consumerIdentity === "UNRESOLVED") {
      declaredNotInstantiated.push({
        slotTypeId: slotType.slotTypeId,
        mathBlockId: slotType.mathBlockId,
        reason: slotType.operatorIdentity === "UNRESOLVED"
          ? DECLARED_NOT_INSTANTIATED_REASON.OPERATOR_UNRESOLVED
          : DECLARED_NOT_INSTANTIATED_REASON.CONSUMER_UNRESOLVED,
        coreConsumable: false,
      });
      continue;
    }
    const id = demandSlotId({
      baseDefinitionalIdentity: slotType.slotTypeId,
      slotTypeId: slotType.slotTypeId,
      slotTypeVersion: slotType.slotTypeVersion,
      consumerIdentity: slotType.consumerIdentity,
      operatorIdentity: slotType.operatorIdentity,
      caseId,
      T0Identity,
      caseGeometryVersion,
    });
    demandSlots.push({
      demandSlotId: id,
      slotTypeId: slotType.slotTypeId,
      slotType,
      blockLane: slotType.blockLane ?? null,
      consumerClass: slotType.consumerClass ?? null,
      admissionContractRef: exactAdmissionContractRef(slotType.admissionContractRef),
      status: "OPEN",
      missingProposition: slotType.requiredProposition ?? slotType.slotTypeId,
      governingDemandDeclarationTime: pcdbFreezeTime(runtime),
    });
  }

  const compileSurface = {
    registryVersion,
    caseId,
    T0Identity,
    caseSides,
    caseGeometryVersion,
    frozenCaseMetadata,
    priorFactualBaselineSealId,
    collectionAuthorizationId,
    quarantinePolicyVersion,
    demandSlots: demandSlots.map((slot) => slot.demandSlotId),
    declaredNotInstantiated,
    naSlots,
    deferredDemand,
  };
  const demandBlueprintId = computeIdentity(DOMAIN_TAG.DEMAND_BLUEPRINT, compileSurface);
  const record = {
    demandBlueprintId,
    demandBlueprintVersion: "v1",
    ...compileSurface,
    demandSlots,
    compileDigest: demandBlueprintId,
    factualBaselineSealId: null,
  };
  return runtime.store.put("demandBlueprint", demandBlueprintId, record);
}

export function freezeManifest(runtime, {
  demandBlueprintId,
  tasks,
  resourceCap = null,
}) {
  const blueprint = runtime.store.get("demandBlueprint", demandBlueprintId);
  const openSlots = blueprint.demandSlots.filter((slot) => slot.status === "OPEN");
  const declaredIds = new Set(openSlots.map((slot) => slot.demandSlotId));
  for (const task of tasks) {
    if (!declaredIds.has(task.demandSlotId)) failClosed("TASK_WITHOUT_DEMAND_SLOT");
    if (!task.missingProposition) failClosed("BROAD_RESEARCH_TASK_FORBIDDEN");
    if (task.stoppingRule !== "BOUNDED_METHOD_EXHAUSTION") failClosed("STOPPING_RULE_INVALID");
    if (task.stoppingRuleAuthority !== STOPPING_RULE_AUTHORITY) {
      failClosed("STOPPING_RULE_AUTHORITY_INVALID");
    }
  }
  for (const slot of openSlots) {
    if (!tasks.some((task) => task.demandSlotId === slot.demandSlotId)) {
      failClosed("OPEN_SLOT_WITHOUT_TASK", slot.demandSlotId);
    }
  }
  const manifest = {
    demandBlueprintId,
    collectionAuthorizationId: blueprint.collectionAuthorizationId,
    frozen: true,
    tasks: tasks.map((task) => ({
      ...task,
      methodElements: expandMethodElements(task.predeclaredCollectionMethod),
      resourceCapReached: false,
      exhausted: false,
    })),
    resourceCap,
    executionEvents: [],
  };
  const manifestId = digestCanonical(manifest);
  const stored = runtime.store.put("manifest", manifestId, { ...manifest, manifestId });
  return stored;
}

function expandMethodElements(method) {
  const methods = method?.permittedMethods ?? [];
  const sources = method?.declaredSources ?? [];
  const queries = method?.queryFamilies ?? [];
  const elements = [];
  if (sources.length > 0) {
    for (const source of sources) {
      for (const retrievalMethodRef of methods) {
        elements.push({ kind: "SOURCE", source, retrievalMethodRef });
      }
    }
  }
  for (const queryFamily of queries) {
    elements.push({
      kind: "QUERY_FAMILY",
      queryFamily,
      queryFamilyBound: declaredQueryFamilyIdentity(queryFamily),
      retrievalMethodRef: declaredQueryFamilyMethod(queryFamily, methods),
    });
  }
  return elements;
}

export function recordManifestExecution(runtime, manifestId, retrievalActId) {
  const qual = runtime.store.tryGet("retrievalQualification", retrievalActId);
  if (!qual) failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  const manifest = runtime.store.get("manifest", manifestId);
  if (!manifest.frozen) failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  const events = Array.isArray(manifest.executionEvents) ? manifest.executionEvents : [];
  if (!events.includes(retrievalActId)) failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  if (qual.inFrozenManifestExecutionRecord !== true) {
    failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  }
  const slotId = qual.governingDemandDeclarationId;
  if (typeof slotId !== "string" || slotId.length === 0) {
    failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  }
  const ownsTask = (manifest.tasks ?? []).some((task) => task.demandSlotId === slotId);
  if (!ownsTask) failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  const blueprint = runtime.store.get("demandBlueprint", manifest.demandBlueprintId);
  const slotOnBlueprint = (blueprint.demandSlots ?? []).some((slot) => slot.demandSlotId === slotId);
  if (!slotOnBlueprint) failClosed("MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND");
  return manifest;
}

export function freezeQualificationEventFacts(runtime, retrievalActId) {
  const record = runtime.store.get("retrievalQualification", retrievalActId);
  if (!record.retrievalActId || record.retrievalMethodRef == null) {
    failClosed("QUALIFICATION_EVENT_FACTS_INCOMPLETE");
  }
  return record;
}

export function certifyStageBFact(runtime, {
  retrievalActId,
  exactExcerpt,
  atomicProposition,
  disposition,
  reason = null,
  factEventTime = null,
  sourcePublicAvailabilityTime = null,
  sideScope = null,
  contradictionStatus = null,
  gateA = null,
  gateB = null,
  publicAvailabilityEvidenceRecords = null,
}) {
  const record = runtime.store.get("retrievalQualification", retrievalActId);
  if (record.certificationDisposition != null) failClosed("QUALIFICATION_ALREADY_FINAL");
  let retrievalQualification = null;
  if (disposition === CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE) {
    const timeOk = comparableTime(record.governingDemandDeclarationTime)
      && comparableTime(record.retrievalActTime)
      && record.governingDemandDeclarationTime < record.retrievalActTime;
    const methodOk = Array.isArray(record.permittedMethodsAtDeclaration)
      && record.permittedMethodsAtDeclaration.includes(record.retrievalMethodRef);
    const prospective = timeOk
      && methodOk
      && record.inFrozenManifestExecutionRecord === true;
    retrievalQualification = prospective
      ? RETRIEVAL_QUALIFICATION.PROSPECTIVE
      : RETRIEVAL_QUALIFICATION.RETROSPECTIVE;
  }
  const boundAvailability = publicAvailabilityEvidenceRecords == null
    ? null
    : bindPublicAvailabilityEvidenceRecords(publicAvailabilityEvidenceRecords);
  const next = {
    ...record,
    certificationDisposition: disposition,
    retrievalQualification,
    exactExcerpt,
    atomicProposition,
    dispositionReason: reason,
    factEventTime,
    sourcePublicAvailabilityTime,
    sideScope,
    contradictionStatus,
    gateA,
    gateB,
    publicAvailabilityEvidenceRecords: boundAvailability,
  };
  return runtime.store.replace("retrievalQualification", retrievalActId, next);
}

export function assembleFactualBaseline(runtime, {
  demandBlueprintId,
  sealedFactRecords,
  t0DeterminationId,
}) {
  if (typeof t0DeterminationId !== "string" || t0DeterminationId.length === 0) {
    failClosed("T0_DETERMINATION_ID_INVALID");
  }
  const blueprint = runtime.store.get("demandBlueprint", demandBlueprintId);
  const carrier = resolveT0DeterminationCarrier(runtime, t0DeterminationId);
  assertCarrierMatchesCase(runtime, carrier, {
    caseId: blueprint.caseId,
    T0Identity: blueprint.T0Identity,
    caseSides: blueprint.caseSides,
    caseGeometryVersion: blueprint.caseGeometryVersion,
  });
  const admitted = [];
  for (const fact of sealedFactRecords) {
    const qual = runtime.store.get("retrievalQualification", fact.retrievalActId);
    if (qual.certificationDisposition !== CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE) {
      failClosed("FACT_NOT_CERTIFIED", fact.retrievalActId);
    }
    const slot = governingDemandSlot(runtime, demandBlueprintId, qual);
    const frozenRead = readFrozenAdmissionContract(slot);
    if (!frozenRead.ok) {
      failClosed(frozenRead.reason, frozenRead.detail ?? frozenRead.reason);
    }
    const artifact = qual.sourceArtifact ?? null;
    const publicAvailabilityEvidenceRecords = qual.publicAvailabilityEvidenceRecords == null
      ? []
      : bindPublicAvailabilityEvidenceRecords(qual.publicAvailabilityEvidenceRecords);
    admitted.push({
      sealedFactId: computeIdentity(DOMAIN_TAG.FACTUAL_BASELINE, {
        retrievalActId: fact.retrievalActId,
        atomicProposition: qual.atomicProposition,
        exactExcerpt: qual.exactExcerpt,
      }),
      retrievalActId: fact.retrievalActId,
      atomicProposition: qual.atomicProposition,
      exactExcerpt: qual.exactExcerpt,
      sourceIdentity: qual.sourceIdentity,
      exactLocator: qual.exactLocator,
      sourceClassRef: artifact?.sourceClassRef ?? null,
      sourceMaterialIdentity: artifact?.sourceMaterialIdentity ?? null,
      artifactContentDigest: artifact?.artifactContentDigest ?? null,
      artifactVersion: artifact?.artifactVersion ?? null,
      sideScope: qual.sideScope ?? null,
      contradictionStatus: qual.contradictionStatus ?? null,
      admissionContractRef: exactAdmissionContractRef(frozenRead.contract),
      gateA: qual.gateA ?? null,
      gateB: qual.gateB ?? null,
      publicAvailabilityEvidenceRecords,
    });
  }
  admitted.sort((left, right) => (
    left.sealedFactId < right.sealedFactId ? -1 : left.sealedFactId > right.sealedFactId ? 1 : 0
  ));
  const exclusions = runtime.store.list("retrievalQualification")
    .filter((record) => record.certificationDisposition === CERTIFICATION_DISPOSITION.EXCLUDED
      || record.certificationDisposition === CERTIFICATION_DISPOSITION.QUARANTINED)
    .map((record) => ({
      retrievalActId: record.retrievalActId,
      disposition: record.certificationDisposition,
      reason: record.dispositionReason,
    }));
  exclusions.sort((left, right) => (
    left.retrievalActId < right.retrievalActId ? -1 : left.retrievalActId > right.retrievalActId ? 1 : 0
  ));
  const baseline = {
    demandBlueprintId,
    t0DeterminationId,
    admitted,
    exclusions,
  };
  const baselineId = digestCanonical(baseline);
  return runtime.store.put("factualBaseline", baselineId, { ...baseline, baselineId });
}

function eventCreditsTask(event, task) {
  return event?.governingDemandDeclarationId === task.demandSlotId
    && event?.inFrozenManifestExecutionRecord === true;
}

function methodElementSatisfied(runtime, manifest, task, element) {
  const events = manifest.executionEvents
    .map((id) => runtime.store.tryGet("retrievalQualification", id))
    .filter(Boolean);
  if (element.kind === "SOURCE") {
    return events.some((event) => (
      eventCreditsTask(event, task)
      && event.sourceIdentity === element.source
      && event.retrievalMethodRef === element.retrievalMethodRef
      && methodCreditEligible(runtime, event.retrievalActId)
    ));
  }
  if (element.kind === "QUERY_FAMILY") {
    const familyId = element.queryFamilyBound ?? declaredQueryFamilyIdentity(element.queryFamily);
    if (familyId == null || element.retrievalMethodRef == null) return false;
    return events.some((event) => (
      eventCreditsTask(event, task)
      && event.retrievalMethodRef === element.retrievalMethodRef
      && queryFamilyIdentityFromEvent(runtime, event) === familyId
      && methodCreditEligible(runtime, event.retrievalActId)
    ));
  }
  return false;
}

export function evaluateCollectionClosure(runtime, manifestId) {
  const manifest = runtime.store.get("manifest", manifestId);
  if (!manifest.frozen) {
    return { status: COLLECTION_STATUS.FAIL, reason: "MANIFEST_NOT_FROZEN" };
  }
  const blueprint = runtime.store.get("demandBlueprint", manifest.demandBlueprintId);
  if (!blueprint.compileDigest) {
    return { status: COLLECTION_STATUS.FAIL, reason: "PCDB_NOT_FROZEN" };
  }

  let resourceCapBeforeExhaustion = false;
  for (const task of manifest.tasks) {
    if (!methodElementsExecutable(task.methodElements)) {
      return {
        status: COLLECTION_STATUS.FAIL,
        reason: Array.isArray(task.methodElements) && task.methodElements.length === 0
          ? "EXHAUSTION_DOMAIN_EMPTY"
          : "COLLECTION_DECLARATION_UNRESOLVABLE",
      };
    }
    const exhausted = task.methodElements.every((element) => (
      methodElementSatisfied(runtime, manifest, task, element)
    ));
    if (task.resourceCapReached && !exhausted) {
      resourceCapBeforeExhaustion = true;
    }
    if (!exhausted && !task.resourceCapReached) {
      return { status: COLLECTION_STATUS.INCOMPLETE, reason: "METHOD_NOT_EXHAUSTED" };
    }
    if (!exhausted && task.resourceCapReached) {
      resourceCapBeforeExhaustion = true;
    }
  }
  if (resourceCapBeforeExhaustion || manifest.resourceCap?.reached === true) {
    return { status: COLLECTION_STATUS.INCOMPLETE, reason: "RESOURCE_CAP_BEFORE_EXHAUSTION" };
  }

  const quals = runtime.store.list("retrievalQualification")
    .filter((record) => manifest.executionEvents.includes(record.retrievalActId));
  for (const record of quals) {
    if (record.inFrozenManifestExecutionRecord) {
      if (record.certificationDisposition == null) {
        return { status: COLLECTION_STATUS.FAIL, reason: "DISPOSITION_MISSING" };
      }
      if (record.certificationDisposition === CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE
        && record.retrievalQualification == null) {
        return { status: COLLECTION_STATUS.FAIL, reason: "FINAL_QUALIFICATION_MISSING" };
      }
      if (record.certificationDisposition !== CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE
        && record.retrievalQualification != null) {
        return { status: COLLECTION_STATUS.FAIL, reason: "QUALIFICATION_MANUFACTURED" };
      }
    }
  }

  return { status: COLLECTION_STATUS.COLLECTION_CLOSED, reason: null, stoppingRule: "BOUNDED_METHOD_EXHAUSTION" };
}

export function markResourceCap(runtime, manifestId, taskDemandSlotId) {
  const manifest = runtime.store.get("manifest", manifestId);
  const tasks = manifest.tasks.map((task) => (
    task.demandSlotId === taskDemandSlotId ? { ...task, resourceCapReached: true } : task
  ));
  return runtime.store.replace("manifest", manifestId, {
    ...manifest,
    tasks,
    resourceCap: { ...(manifest.resourceCap ?? {}), reached: true },
  });
}

export const LIMB_B_CHECK = Object.freeze({
  SOURCE_IDENTITY: "LIMB_B_01_SOURCE_IDENTITY",
  ARTIFACT_VERSION: "LIMB_B_02_ARTIFACT_VERSION",
  EXACT_LOCATOR: "LIMB_B_03_EXACT_LOCATOR",
  EXACT_EXCERPT: "LIMB_B_04_EXACT_EXCERPT",
  ATOMIC_PROPOSITION: "LIMB_B_05_ATOMIC_PROPOSITION",
  ADMISSION_EXCLUSION: "LIMB_B_06_ADMISSION_EXCLUSION",
  TEMPORAL_ELIGIBILITY: "LIMB_B_07_TEMPORAL_ELIGIBILITY",
  SIDE_SCOPE: "LIMB_B_08_SIDE_SCOPE",
  CONTRADICTION_TREATMENT: "LIMB_B_09_CONTRADICTION_TREATMENT",
  BASELINE_MEMBERSHIP: "LIMB_B_10_BASELINE_MEMBERSHIP",
  BASELINE_DIGEST: "LIMB_B_11_BASELINE_DIGEST",
});

const LIMB_B_PER_FACT_CHECKS = Object.freeze([
  LIMB_B_CHECK.SOURCE_IDENTITY,
  LIMB_B_CHECK.ARTIFACT_VERSION,
  LIMB_B_CHECK.EXACT_LOCATOR,
  LIMB_B_CHECK.EXACT_EXCERPT,
  LIMB_B_CHECK.ATOMIC_PROPOSITION,
  LIMB_B_CHECK.ADMISSION_EXCLUSION,
  LIMB_B_CHECK.TEMPORAL_ELIGIBILITY,
  LIMB_B_CHECK.SIDE_SCOPE,
  LIMB_B_CHECK.CONTRADICTION_TREATMENT,
]);

const CONTRADICTION_BASIS = Object.freeze({
  NONE_APPLICABLE: "NO_MATERIAL_CONTRADICTION_APPLICABLE",
  LAWFULLY_DISPOSED: "CONTRADICTION_LAWFULLY_DISPOSED",
  UNRESOLVED: "UNRESOLVED_MATERIAL_CONTRADICTION",
});

function presentString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function baselineGoverningSurface(baseline) {
  return {
    demandBlueprintId: baseline.demandBlueprintId,
    t0DeterminationId: baseline.t0DeterminationId ?? null,
    admitted: baseline.admitted,
    exclusions: baseline.exclusions,
  };
}

function recoverableArtifactText(payload) {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    if (typeof payload.body === "string") return payload.body;
    if (typeof payload.text === "string") return payload.text;
  }
  return null;
}

function checkResult({
  checkId,
  retrievalActId,
  result,
  classification,
  operandRefs,
  verifierActorRef,
  basis = null,
  reason,
}) {
  return {
    checkId,
    retrievalActId,
    result,
    classification,
    operandRefs,
    verifierActorRef,
    basis,
    reason,
  };
}

function failCheck(fields, reason) {
  return checkResult({ ...fields, result: CERTIFICATION_RESULT.FAIL, reason });
}

function passCheck(fields, reason) {
  return checkResult({ ...fields, result: CERTIFICATION_RESULT.PASS, reason });
}

function bindIndependentJudgment(judgments, {
  retrievalActId,
  checkId,
  baselineId,
  baselineDigest,
  verifierActorRef,
}) {
  if (!Array.isArray(judgments)) return { judgment: null, failReason: "INDEPENDENT_JUDGMENT_MISSING" };
  const matches = judgments.filter((row) => (
    row
    && row.checkId === checkId
    && row.retrievalActId === retrievalActId
    && row.baselineId === baselineId
    && row.baselineDigest === baselineDigest
    && row.verifierActorRef === verifierActorRef
  ));
  if (matches.length === 0) return { judgment: null, failReason: "INDEPENDENT_JUDGMENT_MISSING" };
  if (matches.length !== 1) return { judgment: null, failReason: "INDEPENDENT_JUDGMENT_AMBIGUOUS" };
  const judgment = matches[0];
  if (judgment.disposition !== CERTIFICATION_RESULT.PASS
    && judgment.disposition !== CERTIFICATION_RESULT.FAIL) {
    return { judgment: null, failReason: "INDEPENDENT_JUDGMENT_DISPOSITION_INVALID" };
  }
  if (judgment.disposition === CERTIFICATION_RESULT.PASS && !substantiveValue(judgment.basis)) {
    return { judgment: null, failReason: "INDEPENDENT_JUDGMENT_BASIS_MISSING" };
  }
  return { judgment, failReason: null };
}

function replayExpectedSealedFactId(qual) {
  return computeIdentity(DOMAIN_TAG.FACTUAL_BASELINE, {
    retrievalActId: qual.retrievalActId,
    atomicProposition: qual.atomicProposition,
    exactExcerpt: qual.exactExcerpt,
  });
}

function expectedAdmittedFromQualifications(runtime, manifest) {
  const events = Array.isArray(manifest.executionEvents) ? manifest.executionEvents : [];
  const expected = [];
  for (const retrievalActId of events) {
    const qual = runtime.store.tryGet("retrievalQualification", retrievalActId);
    if (!qual) continue;
    if (qual.certificationDisposition !== CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE) continue;
    expected.push({
      retrievalActId: qual.retrievalActId,
      sealedFactId: replayExpectedSealedFactId(qual),
    });
  }
  expected.sort((left, right) => (
    left.sealedFactId < right.sealedFactId ? -1 : left.sealedFactId > right.sealedFactId ? 1 : 0
  ));
  return expected;
}

function expectedExclusionsFromQualifications(runtime) {
  const expected = runtime.store.list("retrievalQualification")
    .filter((record) => (
      record.certificationDisposition === CERTIFICATION_DISPOSITION.EXCLUDED
      || record.certificationDisposition === CERTIFICATION_DISPOSITION.QUARANTINED
    ))
    .map((record) => ({
      retrievalActId: record.retrievalActId,
      disposition: record.certificationDisposition,
      reason: record.dispositionReason ?? null,
    }));
  expected.sort((left, right) => (
    left.retrievalActId < right.retrievalActId ? -1 : left.retrievalActId > right.retrievalActId ? 1 : 0
  ));
  return expected;
}

function setIdentity(rows, key) {
  return rows.map((row) => row[key]).slice().sort();
}

function evaluateSourceIdentityCheck(fact, qual, artifact, verifierActorRef) {
  const fields = {
    checkId: LIMB_B_CHECK.SOURCE_IDENTITY,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      sourceArtifactSourceIdentity: artifact?.sourceIdentity ?? null,
      qualificationSourceIdentity: qual?.sourceIdentity ?? null,
      baselineSourceIdentity: fact.sourceIdentity ?? null,
    },
    verifierActorRef,
  };
  if (!presentString(artifact?.sourceIdentity)) {
    return failCheck(fields, "SOURCE_IDENTITY_OPERAND_MISSING");
  }
  if (fact.sourceIdentity !== artifact.sourceIdentity) {
    return failCheck(fields, "SOURCE_IDENTITY_MISMATCH_ARTIFACT");
  }
  if (qual?.sourceIdentity !== artifact.sourceIdentity) {
    return failCheck(fields, "SOURCE_IDENTITY_MISMATCH_QUALIFICATION");
  }
  return passCheck(fields, "SOURCE_IDENTITY_BOUND_TO_RETAINED_ARTIFACT");
}

function evaluateArtifactVersionCheck(fact, artifact, verifierActorRef) {
  const recomputedDigest = artifact && Object.prototype.hasOwnProperty.call(artifact, "retrievedPayload")
    ? digestCanonical(artifact.retrievedPayload)
    : null;
  const fields = {
    checkId: LIMB_B_CHECK.ARTIFACT_VERSION,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      sourceMaterialIdentity: artifact?.sourceMaterialIdentity ?? null,
      storedArtifactContentDigest: artifact?.artifactContentDigest ?? null,
      baselineArtifactContentDigest: fact.artifactContentDigest ?? null,
      recomputedArtifactContentDigest: recomputedDigest,
      artifactVersion: artifact?.artifactVersion ?? null,
      versionAvailability: presentString(artifact?.artifactVersion) ? "PRESENT" : "UNAVAILABLE",
    },
    verifierActorRef,
  };
  if (recomputedDigest == null || !presentString(artifact?.artifactContentDigest)) {
    return failCheck(fields, "ARTIFACT_IDENTITY_OPERAND_MISSING");
  }
  if (artifact.artifactContentDigest !== recomputedDigest) {
    return failCheck(fields, "ARTIFACT_CONTENT_DIGEST_REPLAY_MISMATCH");
  }
  if (fact.artifactContentDigest !== recomputedDigest) {
    return failCheck(fields, "BASELINE_ARTIFACT_CONTENT_DIGEST_MISMATCH");
  }
  if (presentString(artifact.sourceMaterialIdentity)
    && fact.sourceMaterialIdentity !== artifact.sourceMaterialIdentity) {
    return failCheck(fields, "SOURCE_MATERIAL_IDENTITY_MISMATCH");
  }
  if (presentString(artifact.artifactVersion)
    && fact.artifactVersion !== artifact.artifactVersion) {
    return failCheck(fields, "ARTIFACT_VERSION_MISMATCH");
  }
  return passCheck(fields, presentString(artifact.artifactVersion)
    ? "ARTIFACT_AND_VERSION_IDENTITY_BOUND"
    : "ARTIFACT_CONTENT_IDENTITY_BOUND_VERSION_UNAVAILABLE");
}

function evaluateLocatorCheck(fact, qual, artifact, verifierActorRef) {
  const fields = {
    checkId: LIMB_B_CHECK.EXACT_LOCATOR,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      sourceArtifactExactLocator: artifact?.exactLocator ?? null,
      qualificationExactLocator: qual?.exactLocator ?? null,
      baselineExactLocator: fact.exactLocator ?? null,
    },
    verifierActorRef,
  };
  if (!presentString(artifact?.exactLocator)) {
    return failCheck(fields, "EXACT_LOCATOR_OPERAND_MISSING");
  }
  if (fact.exactLocator !== artifact.exactLocator) {
    return failCheck(fields, "EXACT_LOCATOR_MISMATCH_ARTIFACT");
  }
  if (qual?.exactLocator !== artifact.exactLocator) {
    return failCheck(fields, "EXACT_LOCATOR_MISMATCH_QUALIFICATION");
  }
  return passCheck(fields, "EXACT_LOCATOR_BOUND_TO_RETAINED_ARTIFACT");
}

function evaluateExcerptCheck(fact, qual, artifact, judgments, binding, verifierActorRef) {
  const text = recoverableArtifactText(artifact?.retrievedPayload);
  const fields = {
    checkId: LIMB_B_CHECK.EXACT_EXCERPT,
    retrievalActId: fact.retrievalActId,
    classification: text != null ? CHECK_CLASS.DETERMINISTIC : CHECK_CLASS.JUDGMENT_BASED,
    operandRefs: {
      retainedPayloadDigest: artifact?.artifactContentDigest ?? null,
      qualificationExactExcerpt: qual?.exactExcerpt ?? null,
      baselineExactExcerpt: fact.exactExcerpt ?? null,
      recoverableText: text != null,
    },
    verifierActorRef,
  };
  if (!presentString(fact.exactExcerpt) || !presentString(qual?.exactExcerpt)) {
    return failCheck(fields, "EXACT_EXCERPT_OPERAND_MISSING");
  }
  if (fact.exactExcerpt !== qual.exactExcerpt) {
    return failCheck(fields, "EXACT_EXCERPT_COPY_MISMATCH");
  }
  if (text != null) {
    if (!text.includes(fact.exactExcerpt)) {
      return failCheck(fields, "EXACT_EXCERPT_NOT_IN_RETAINED_ARTIFACT");
    }
    return passCheck(fields, "EXACT_EXCERPT_VERBATIM_IN_RETAINED_ARTIFACT");
  }
  const bound = bindIndependentJudgment(judgments, { ...binding, checkId: LIMB_B_CHECK.EXACT_EXCERPT });
  if (!bound.judgment) return failCheck(fields, bound.failReason);
  if (bound.judgment.disposition !== CERTIFICATION_RESULT.PASS) {
    return failCheck({ ...fields, basis: bound.judgment.basis ?? null }, "EXACT_EXCERPT_JUDGMENT_FAIL");
  }
  return passCheck({ ...fields, basis: bound.judgment.basis ?? null }, "EXACT_EXCERPT_JUDGMENT_PASS");
}

function evaluatePropositionCheck(fact, qual, artifact, judgments, binding, verifierActorRef) {
  const fields = {
    checkId: LIMB_B_CHECK.ATOMIC_PROPOSITION,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.JUDGMENT_BASED,
    operandRefs: {
      exactExcerpt: fact.exactExcerpt ?? null,
      qualificationAtomicProposition: qual?.atomicProposition ?? null,
      baselineAtomicProposition: fact.atomicProposition ?? null,
      retainedPayloadDigest: artifact?.artifactContentDigest ?? null,
    },
    verifierActorRef,
  };
  if (!presentString(fact.atomicProposition) || !presentString(qual?.atomicProposition)) {
    return failCheck(fields, "ATOMIC_PROPOSITION_OPERAND_MISSING");
  }
  if (fact.atomicProposition !== qual.atomicProposition) {
    return failCheck(fields, "ATOMIC_PROPOSITION_COPY_MISMATCH");
  }
  if (!presentString(fact.exactExcerpt)) {
    return failCheck(fields, "ATOMIC_PROPOSITION_EXCERPT_OPERAND_MISSING");
  }
  const bound = bindIndependentJudgment(judgments, {
    ...binding,
    checkId: LIMB_B_CHECK.ATOMIC_PROPOSITION,
  });
  if (!bound.judgment) return failCheck(fields, bound.failReason);
  if (bound.judgment.disposition !== CERTIFICATION_RESULT.PASS) {
    return failCheck({ ...fields, basis: bound.judgment.basis ?? null }, "ATOMIC_PROPOSITION_JUDGMENT_FAIL");
  }
  return passCheck({ ...fields, basis: bound.judgment.basis ?? null }, "ATOMIC_PROPOSITION_JUDGMENT_PASS");
}

function evaluateAdmissionCheck(fact, qual, verifierActorRef, runtime, baseline) {
  const slot = runtime && baseline
    ? governingDemandSlot(runtime, baseline.demandBlueprintId, qual)
    : null;
  const frozenRead = readFrozenAdmissionContract(slot);
  const frozen = frozenRead.contract ?? exactAdmissionContractRef(fact?.admissionContractRef) ?? null;
  const reconstructed = resolveFactualAdmissionContract(
    slot?.blockLane ?? slot?.slotType?.blockLane ?? frozen?.lane ?? null,
    slot?.consumerClass ?? slot?.slotType?.consumerClass ?? frozen?.consumerClass ?? null,
    slot?.slotType?.semanticRuleRef ?? frozen?.semanticRuleRef ?? null,
  );
  const gateADecision = fact?.gateA?.decision ?? qual?.gateA?.decision ?? null;
  const gateBDecision = fact?.gateB?.decision ?? qual?.gateB?.decision ?? null;
  const fields = {
    checkId: LIMB_B_CHECK.ADMISSION_EXCLUSION,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      certificationDisposition: qual?.certificationDisposition ?? null,
      dispositionReason: qual?.dispositionReason ?? null,
      sealedFactId: fact.sealedFactId ?? null,
      frozenAdmissionContractRef: frozen,
      baselineAdmissionContractRef: fact?.admissionContractRef ?? null,
      reconstructedAdmissionContractRef: exactAdmissionContractRef(reconstructed),
      gateADecision,
      gateBDecision,
    },
    verifierActorRef,
  };
  if (!qual) return failCheck(fields, "ADMISSION_QUALIFICATION_OPERAND_MISSING");
  if (qual.certificationDisposition !== CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE) {
    return failCheck(fields, "ILLEGAL_BASELINE_ADMISSION");
  }
  if (qual.certificationDisposition === CERTIFICATION_DISPOSITION.EXCLUDED
    || qual.certificationDisposition === CERTIFICATION_DISPOSITION.QUARANTINED) {
    return failCheck(fields, "EXCLUDED_OR_QUARANTINED_ADMITTED");
  }
  if (!frozenRead.ok) {
    return failCheck(fields, frozenRead.reason);
  }
  if (!admissionContractRefsEqual(frozen, fact?.admissionContractRef)) {
    return failCheck(fields, "ADMISSION_CONTRACT_MISMATCH");
  }
  if (reconstructed.resolved && reconstructed.factualRuleRef === PRE_T0_DOCUMENTARY_FACTUAL_RULE
    && frozen.factualRuleRef !== reconstructed.factualRuleRef) {
    return failCheck(fields, "ADMISSION_CONTRACT_REGISTRY_MISMATCH");
  }
  if (frozen.factualRuleRef !== PRE_T0_DOCUMENTARY_FACTUAL_RULE) {
    return failCheck(fields, "UNRESOLVED_ADMISSION_AUTHORITY");
  }
  if (gateADecision !== GATE_DECISION.PASS || gateBDecision !== GATE_DECISION.PASS) {
    return failCheck(fields, "CERTIFIED_DISPOSITION_WITHOUT_GATE_PASS");
  }
  const expectedId = replayExpectedSealedFactId(qual);
  if (fact.sealedFactId !== expectedId) {
    return failCheck(fields, "SEALED_FACT_IDENTITY_MISMATCH");
  }
  return passCheck(fields, "ADMISSION_DISPOSITION_LAWFUL");
}

function evaluateCollectionAdmissionCheck(baseline, expectedAdmitted, expectedExclusions, verifierActorRef) {
  const fields = {
    checkId: LIMB_B_CHECK.ADMISSION_EXCLUSION,
    retrievalActId: null,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      admittedCount: baseline.admitted.length,
      expectedAdmittedCount: expectedAdmitted.length,
      exclusionCount: (baseline.exclusions ?? []).length,
      expectedExclusionCount: expectedExclusions.length,
    },
    verifierActorRef,
  };
  const admittedIds = new Set(baseline.admitted.map((row) => row.retrievalActId));
  for (const exclusion of expectedExclusions) {
    if (admittedIds.has(exclusion.retrievalActId)) {
      return failCheck(fields, "EXCLUDED_MATERIAL_IN_ADMITTED_SET");
    }
    if (exclusion.reason == null || exclusion.reason === "") {
      return failCheck(fields, "EXCLUSION_REASON_MISSING");
    }
  }
  const storedExclusionIds = setIdentity(baseline.exclusions ?? [], "retrievalActId");
  const expectedExclusionIds = setIdentity(expectedExclusions, "retrievalActId");
  if (JSON.stringify(storedExclusionIds) !== JSON.stringify(expectedExclusionIds)) {
    return failCheck(fields, "EXCLUSION_SET_MISMATCH");
  }
  return passCheck(fields, "ADMISSION_AND_EXCLUSION_SET_LAWFUL");
}

function stringList(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}

function availabilityRecordComplete(record) {
  if (!record || typeof record !== "object") return false;
  return substantiveValue(record.sourceId)
    && inspectableEvidence(record.claimedPublicAvailability)
    && substantiveValue(record.evidenceType)
    && substantiveValue(record.evidenceArtifactIdentity)
    && inspectableEvidence(record.availabilityLocator)
    && (
      substantiveValue(record.savedEvidenceArtifactRef)
      || substantiveValue(record.reproduciblePublicRecordRef)
    )
    && substantiveValue(record.reviewStatus)
    && substantiveValue(record.basis);
}

function availabilityEvidenceInsufficientAlone(record) {
  const evidenceType = typeof record?.evidenceType === "string" ? record.evidenceType : "";
  if (GATE_B_INSUFFICIENT_ALONE.includes(evidenceType)) return true;
  const inspectableLocator = inspectableEvidence(record?.availabilityLocator);
  const inspectableArtifact = substantiveValue(record?.evidenceArtifactIdentity);
  const savedOrReproducible = substantiveValue(record?.savedEvidenceArtifactRef)
    || substantiveValue(record?.reproduciblePublicRecordRef);
  if (!inspectableLocator || !inspectableArtifact || !savedOrReproducible) return true;
  return false;
}

function evaluateTemporalCheck(fact, qual, verifierActorRef, runtime, baseline, judgments, binding) {
  const gateA = fact?.gateA ?? qual?.gateA ?? null;
  const gateB = fact?.gateB ?? qual?.gateB ?? null;
  const paeRecords = Array.isArray(fact?.publicAvailabilityEvidenceRecords)
    ? fact.publicAvailabilityEvidenceRecords
    : [];
  const artifact = qual?.sourceArtifact ?? null;
  const fields = {
    checkId: LIMB_B_CHECK.TEMPORAL_ELIGIBILITY,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.JUDGMENT_BASED,
    operandRefs: {
      t0DeterminationId: baseline?.t0DeterminationId ?? null,
      gateA,
      gateB,
      publicAvailabilityEvidenceRecordIds: paeRecords.map((row) => (
        row?.publicAvailabilityEvidenceRecordId ?? null
      )),
      collectionProspectivity: {
        governingDemandDeclarationTime: qual?.governingDemandDeclarationTime ?? null,
        retrievalActTime: qual?.retrievalActTime ?? null,
        permittedMethodsAtDeclaration: qual?.permittedMethodsAtDeclaration ?? null,
        inFrozenManifestExecutionRecord: qual?.inFrozenManifestExecutionRecord ?? null,
        recordedRetrievalQualification: qual?.retrievalQualification ?? null,
      },
    },
    verifierActorRef,
  };
  if (!gateA || !gateB) {
    return failCheck(fields, "TEMPORAL_GATE_CARRIER_MISSING");
  }
  if (![GATE_DECISION.PASS, GATE_DECISION.FAIL, GATE_DECISION.UNRESOLVED].includes(gateA.decision)
    || ![GATE_DECISION.PASS, GATE_DECISION.FAIL, GATE_DECISION.UNRESOLVED].includes(gateB.decision)) {
    return failCheck(fields, "TEMPORAL_GATE_DECISION_INVALID");
  }
  if (!substantiveValue(baseline?.t0DeterminationId)) {
    return failCheck(fields, "T0_DETERMINATION_ID_INVALID");
  }
  let carrier = null;
  try {
    carrier = resolveT0DeterminationCarrier(runtime, baseline.t0DeterminationId);
    const blueprint = runtime.store.get("demandBlueprint", baseline.demandBlueprintId);
    assertCarrierMatchesCase(runtime, carrier, {
      caseId: blueprint.caseId,
      T0Identity: blueprint.T0Identity,
      caseSides: blueprint.caseSides,
      caseGeometryVersion: blueprint.caseGeometryVersion,
    });
  } catch (error) {
    return failCheck(fields, error?.code ?? "T0_DETERMINATION_UNRESOLVABLE");
  }
  void carrier;
  if (gateA.t0DeterminationId !== baseline.t0DeterminationId
    || gateB.t0DeterminationId !== baseline.t0DeterminationId) {
    return failCheck(fields, "T0_DETERMINATION_ID_MISMATCH");
  }
  if (gateA.decision !== GATE_DECISION.PASS) {
    return failCheck(fields, "GATE_A_NOT_PASS");
  }
  if (gateB.decision !== GATE_DECISION.PASS) {
    return failCheck(fields, "GATE_B_NOT_PASS");
  }
  if (!inspectableEvidence(gateA.factTimeEvidence)
    || !stringList(gateA.supportingSourceIds).length
    || !substantiveValue(gateA.basis)) {
    return failCheck(fields, "GATE_A_RECORD_INCOMPLETE");
  }
  if (!stringList(gateB.supportingSourceIds).length
    || !inspectableEvidence(gateB.publicAvailabilityDatesOrBounds)
    || !substantiveValue(gateB.basis)) {
    return failCheck(fields, "GATE_B_RECORD_INCOMPLETE");
  }
  for (const sourceId of stringList(gateA.supportingSourceIds)) {
    if (!sourceIdInLineage(sourceId, fact, qual, artifact)) {
      return failCheck(fields, "GATE_A_SOURCE_NOT_IN_LINEAGE");
    }
  }
  for (const sourceId of stringList(gateB.supportingSourceIds)) {
    if (!sourceIdInLineage(sourceId, fact, qual, artifact)) {
      return failCheck(fields, "GATE_B_SOURCE_NOT_IN_LINEAGE");
    }
  }
  if (stringList(gateB.publicAvailabilityEvidenceRecordIds).length === 0 || paeRecords.length === 0) {
    return failCheck(fields, "GATE_B_AVAILABILITY_EVIDENCE_MISSING");
  }
  const paeById = new Map();
  for (const record of paeRecords) {
    if (!availabilityRecordComplete(record)) {
      return failCheck(fields, "GATE_B_AVAILABILITY_EVIDENCE_INCOMPLETE");
    }
    const recomputed = publicAvailabilityEvidenceRecordId(record);
    if (record.publicAvailabilityEvidenceRecordId !== recomputed) {
      return failCheck(fields, "GATE_B_AVAILABILITY_EVIDENCE_IDENTITY_MISMATCH");
    }
    paeById.set(recomputed, record);
  }
  for (const recordId of stringList(gateB.publicAvailabilityEvidenceRecordIds)) {
    const record = paeById.get(recordId);
    if (!record) return failCheck(fields, "GATE_B_AVAILABILITY_EVIDENCE_MISSING");
    if (!stringList(gateB.supportingSourceIds).includes(record.sourceId)) {
      return failCheck(fields, "GATE_B_AVAILABILITY_SOURCE_MISMATCH");
    }
    if (availabilityEvidenceInsufficientAlone(record)) {
      return failCheck(fields, "GATE_B_AVAILABILITY_EVIDENCE_INSUFFICIENT");
    }
  }
  const bound = bindIndependentJudgment(judgments, {
    ...binding,
    checkId: LIMB_B_CHECK.TEMPORAL_ELIGIBILITY,
  });
  if (!bound.judgment) return failCheck(fields, bound.failReason);
  if (bound.judgment.disposition !== CERTIFICATION_RESULT.PASS) {
    return failCheck({ ...fields, basis: bound.judgment.basis ?? null }, "TEMPORAL_ELIGIBILITY_JUDGMENT_FAIL");
  }
  return passCheck(
    { ...fields, basis: bound.judgment.basis },
    "TEMPORAL_ELIGIBILITY_INDEPENDENTLY_VERIFIED",
  );
}

function evaluateSideScopeCheck(fact, qual, judgments, binding, verifierActorRef) {
  const recorded = qual?.sideScope ?? fact.sideScope ?? null;
  const fields = {
    checkId: LIMB_B_CHECK.SIDE_SCOPE,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.JUDGMENT_BASED,
    operandRefs: {
      recordedSideScope: recorded,
      qualificationSideScope: qual?.sideScope ?? null,
      baselineSideScope: fact.sideScope ?? null,
    },
    verifierActorRef,
  };
  if (recorded == null || typeof recorded !== "object") {
    return failCheck(fields, "SIDE_SCOPE_OPERAND_MISSING");
  }
  if (!presentString(recorded.side) || !presentString(recorded.organizationalScope)) {
    return failCheck(fields, "SIDE_SCOPE_OPERAND_MISSING");
  }
  const bound = bindIndependentJudgment(judgments, { ...binding, checkId: LIMB_B_CHECK.SIDE_SCOPE });
  if (!bound.judgment) return failCheck(fields, bound.failReason);
  if (bound.judgment.disposition !== CERTIFICATION_RESULT.PASS) {
    return failCheck({ ...fields, basis: bound.judgment.basis ?? null }, "SIDE_SCOPE_JUDGMENT_FAIL");
  }
  return passCheck({ ...fields, basis: bound.judgment.basis ?? null }, "SIDE_SCOPE_JUDGMENT_PASS");
}

function evaluateContradictionCheck(fact, qual, judgments, binding, verifierActorRef) {
  const recorded = qual?.contradictionStatus ?? fact.contradictionStatus ?? null;
  const fields = {
    checkId: LIMB_B_CHECK.CONTRADICTION_TREATMENT,
    retrievalActId: fact.retrievalActId,
    classification: CHECK_CLASS.JUDGMENT_BASED,
    operandRefs: {
      recordedContradictionStatus: recorded,
      qualificationContradictionStatus: qual?.contradictionStatus ?? null,
      baselineContradictionStatus: fact.contradictionStatus ?? null,
    },
    verifierActorRef,
  };
  const bound = bindIndependentJudgment(judgments, {
    ...binding,
    checkId: LIMB_B_CHECK.CONTRADICTION_TREATMENT,
  });
  if (!bound.judgment) return failCheck(fields, bound.failReason);
  const basis = bound.judgment.basis ?? null;
  if (basis !== CONTRADICTION_BASIS.NONE_APPLICABLE
    && basis !== CONTRADICTION_BASIS.LAWFULLY_DISPOSED
    && basis !== CONTRADICTION_BASIS.UNRESOLVED) {
    return failCheck({ ...fields, basis }, "CONTRADICTION_BASIS_INVALID");
  }
  if (basis === CONTRADICTION_BASIS.UNRESOLVED
    || recorded === CONTRADICTION_BASIS.UNRESOLVED
    || bound.judgment.disposition !== CERTIFICATION_RESULT.PASS) {
    return failCheck({ ...fields, basis }, "UNRESOLVED_MATERIAL_CONTRADICTION");
  }
  if (recorded != null && recorded !== basis) {
    return failCheck({ ...fields, basis }, "CONTRADICTION_STATUS_MISMATCH");
  }
  return passCheck({ ...fields, basis }, "CONTRADICTION_TREATMENT_LAWFUL");
}

function evaluateMembershipCheck(baseline, expectedAdmitted, verifierActorRef) {
  const fields = {
    checkId: LIMB_B_CHECK.BASELINE_MEMBERSHIP,
    retrievalActId: null,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      admittedRetrievalActIds: setIdentity(baseline.admitted, "retrievalActId"),
      expectedRetrievalActIds: setIdentity(expectedAdmitted, "retrievalActId"),
      admittedSealedFactIds: setIdentity(baseline.admitted, "sealedFactId"),
      expectedSealedFactIds: setIdentity(expectedAdmitted, "sealedFactId"),
    },
    verifierActorRef,
  };
  if (JSON.stringify(fields.operandRefs.admittedRetrievalActIds)
    !== JSON.stringify(fields.operandRefs.expectedRetrievalActIds)) {
    return failCheck(fields, "BASELINE_MEMBERSHIP_RETRIEVAL_SET_MISMATCH");
  }
  if (JSON.stringify(fields.operandRefs.admittedSealedFactIds)
    !== JSON.stringify(fields.operandRefs.expectedSealedFactIds)) {
    return failCheck(fields, "BASELINE_MEMBERSHIP_FACT_SET_MISMATCH");
  }
  return passCheck(fields, "BASELINE_MEMBERSHIP_SET_IDENTITY_MATCH");
}

function evaluateDigestCheck(baseline, baselineId, verifierActorRef) {
  const surface = baselineGoverningSurface(baseline);
  const recomputed = digestCanonical(surface);
  const fields = {
    checkId: LIMB_B_CHECK.BASELINE_DIGEST,
    retrievalActId: null,
    classification: CHECK_CLASS.DETERMINISTIC,
    operandRefs: {
      storedBaselineId: baseline.baselineId ?? null,
      claimedBaselineId: baselineId,
      recomputedBaselineDigest: recomputed,
    },
    verifierActorRef,
  };
  if (!presentString(baseline.baselineId) || !presentString(baselineId)) {
    return failCheck(fields, "BASELINE_DIGEST_OPERAND_MISSING");
  }
  if (baseline.baselineId !== baselineId) {
    return failCheck(fields, "BASELINE_ID_ARGUMENT_MISMATCH");
  }
  if (recomputed !== baseline.baselineId) {
    return failCheck(fields, "BASELINE_DIGEST_REPLAY_MISMATCH");
  }
  return passCheck(fields, "BASELINE_DIGEST_REPLAY_MATCH");
}

function requiredLimbBSlots(baseline) {
  const slots = [];
  for (const fact of baseline.admitted) {
    for (const checkId of LIMB_B_PER_FACT_CHECKS) {
      slots.push({ checkId, retrievalActId: fact.retrievalActId });
    }
  }
  slots.push({ checkId: LIMB_B_CHECK.ADMISSION_EXCLUSION, retrievalActId: null });
  slots.push({ checkId: LIMB_B_CHECK.BASELINE_MEMBERSHIP, retrievalActId: null });
  slots.push({ checkId: LIMB_B_CHECK.BASELINE_DIGEST, retrievalActId: null });
  return slots;
}

function findCheck(checkResults, checkId, retrievalActId) {
  return (checkResults ?? []).find((row) => (
    row.checkId === checkId && row.retrievalActId === retrievalActId
  )) ?? null;
}

function preSealVerificationContentSurface(verification) {
  if (!verification || typeof verification !== "object") return null;
  const { verificationId, ...content } = verification;
  void verificationId;
  return content;
}

function snapshotAdmittedIdentity(admitted) {
  const rows = (admitted ?? []).map((row) => ({
    retrievalActId: row.retrievalActId ?? null,
    sealedFactId: row.sealedFactId ?? null,
  }));
  rows.sort((left, right) => (
    left.sealedFactId < right.sealedFactId ? -1 : left.sealedFactId > right.sealedFactId ? 1 : 0
  ));
  return rows;
}

function snapshotExclusionIdentity(exclusions) {
  const rows = (exclusions ?? []).map((row) => ({
    retrievalActId: row.retrievalActId ?? null,
    disposition: row.disposition ?? null,
    reason: row.reason ?? null,
  }));
  rows.sort((left, right) => (
    left.retrievalActId < right.retrievalActId ? -1 : left.retrievalActId > right.retrievalActId ? 1 : 0
  ));
  return rows;
}

export function replayPreSealAggregation(verification) {
  if (!verification || verification.limbA !== true) return "FAIL";
  const baseline = verification.baselineSnapshot ?? null;
  const slots = baseline ? requiredLimbBSlots(baseline) : [];
  if (slots.length === 0) return "FAIL";
  for (const slot of slots) {
    const row = findCheck(verification.checkResults, slot.checkId, slot.retrievalActId);
    if (!row) return "FAIL";
    if (row.result !== CERTIFICATION_RESULT.PASS) return "FAIL";
  }
  return "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS";
}

export function independentPreSealVerification(runtime, {
  manifestId,
  baselineId,
  verifierActorRef,
  authorActorRef,
  independentJudgments = [],
}) {
  if (verifierActorRef === authorActorRef) failClosed("PRE_SEAL_VERIFIER_NOT_INDEPENDENT");
  const closure = evaluateCollectionClosure(runtime, manifestId);
  const limbA = closure.status === COLLECTION_STATUS.COLLECTION_CLOSED;
  const baseline = runtime.store.get("factualBaseline", baselineId);
  const manifest = runtime.store.get("manifest", manifestId);
  const baselineDigest = digestCanonical(baselineGoverningSurface(baseline));
  const expectedAdmitted = expectedAdmittedFromQualifications(runtime, manifest);
  const expectedExclusions = expectedExclusionsFromQualifications(runtime);
  const checkResults = [];
  for (const fact of baseline.admitted) {
    const qual = runtime.store.tryGet("retrievalQualification", fact.retrievalActId);
    const artifact = qual?.sourceArtifact ?? null;
    const binding = {
      retrievalActId: fact.retrievalActId,
      baselineId,
      baselineDigest,
      verifierActorRef,
    };
    checkResults.push(evaluateSourceIdentityCheck(fact, qual, artifact, verifierActorRef));
    checkResults.push(evaluateArtifactVersionCheck(fact, artifact, verifierActorRef));
    checkResults.push(evaluateLocatorCheck(fact, qual, artifact, verifierActorRef));
    checkResults.push(evaluateExcerptCheck(
      fact,
      qual,
      artifact,
      independentJudgments,
      binding,
      verifierActorRef,
    ));
    checkResults.push(evaluatePropositionCheck(
      fact,
      qual,
      artifact,
      independentJudgments,
      binding,
      verifierActorRef,
    ));
    checkResults.push(evaluateAdmissionCheck(fact, qual, verifierActorRef, runtime, baseline));
    checkResults.push(evaluateTemporalCheck(
      fact,
      qual,
      verifierActorRef,
      runtime,
      baseline,
      independentJudgments,
      binding,
    ));
    checkResults.push(evaluateSideScopeCheck(
      fact,
      qual,
      independentJudgments,
      binding,
      verifierActorRef,
    ));
    checkResults.push(evaluateContradictionCheck(
      fact,
      qual,
      independentJudgments,
      binding,
      verifierActorRef,
    ));
  }
  checkResults.push(evaluateCollectionAdmissionCheck(
    baseline,
    expectedAdmitted,
    expectedExclusions,
    verifierActorRef,
  ));
  checkResults.push(evaluateMembershipCheck(baseline, expectedAdmitted, verifierActorRef));
  checkResults.push(evaluateDigestCheck(baseline, baselineId, verifierActorRef));

  const limbB = checkResults.every((row) => row.result === CERTIFICATION_RESULT.PASS)
    && requiredLimbBSlots(baseline).every((slot) => (
      findCheck(checkResults, slot.checkId, slot.retrievalActId)?.result === CERTIFICATION_RESULT.PASS
    ));
  const record = {
    manifestId,
    baselineId,
    baselineDigest,
    verifierActorRef,
    authorActorRef,
    limbA,
    limbB,
    checkResults,
    baselineSnapshot: {
      demandBlueprintId: baseline.demandBlueprintId,
      t0DeterminationId: baseline.t0DeterminationId ?? null,
      admitted: baseline.admitted,
      exclusions: baseline.exclusions,
    },
    closure,
  };
  const aggregated = (limbA && limbB)
    ? "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS"
    : "FAIL";
  record.result = aggregated;
  if (replayPreSealAggregation({ ...record, result: aggregated }) !== aggregated
    && aggregated === "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS") {
    record.result = "FAIL";
    record.limbB = false;
  }
  const id = digestCanonical(record);
  return runtime.store.put("preSealVerification", id, { ...record, verificationId: id });
}

export function acceptOwnerFactualSeal(runtime, {
  verificationId,
  ownerActorRef,
  sealToken,
}) {
  const verification = runtime.store.get("preSealVerification", verificationId);
  if (verification.verificationId !== verificationId) {
    failClosed("PRE_SEAL_VERIFICATION_IDENTITY_MISMATCH");
  }
  const recomputedVerificationId = digestCanonical(preSealVerificationContentSurface(verification));
  if (recomputedVerificationId !== verification.verificationId) {
    failClosed("PRE_SEAL_VERIFICATION_IDENTITY_MISMATCH");
  }
  if (verification.result !== "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS") {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  if (replayPreSealAggregation(verification) !== "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS") {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  const currentClosure = evaluateCollectionClosure(runtime, verification.manifestId);
  if (currentClosure.status !== COLLECTION_STATUS.COLLECTION_CLOSED) {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  const currentManifest = runtime.store.get("manifest", verification.manifestId);
  const currentExpectedAdmitted = expectedAdmittedFromQualifications(runtime, currentManifest);
  const currentExpectedExclusions = expectedExclusionsFromQualifications(runtime);
  const snapshot = verification.baselineSnapshot ?? {};
  if (digestCanonical(snapshotAdmittedIdentity(currentExpectedAdmitted))
    !== digestCanonical(snapshotAdmittedIdentity(snapshot.admitted))) {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  if (digestCanonical(snapshotExclusionIdentity(currentExpectedExclusions))
    !== digestCanonical(snapshotExclusionIdentity(snapshot.exclusions))) {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  const baseline = runtime.store.get("factualBaseline", verification.baselineId);
  const currentDigest = digestCanonical(baselineGoverningSurface(baseline));
  if (currentDigest !== verification.baselineDigest
    || currentDigest !== baseline.baselineId
    || verification.baselineDigest !== verification.baselineId) {
    failClosed("SEAL_WITHOUT_VERIFICATION_PASS");
  }
  if (typeof baseline.t0DeterminationId !== "string" || baseline.t0DeterminationId.length === 0) {
    failClosed("T0_DETERMINATION_ID_INVALID");
  }
  const carrier = resolveT0DeterminationCarrier(runtime, baseline.t0DeterminationId);
  const blueprint = runtime.store.get("demandBlueprint", baseline.demandBlueprintId);
  assertCarrierMatchesCase(runtime, carrier, {
    caseId: blueprint.caseId,
    T0Identity: blueprint.T0Identity,
    caseSides: blueprint.caseSides,
    caseGeometryVersion: blueprint.caseGeometryVersion,
  });
  if (typeof sealToken !== "string" || sealToken.length === 0) failClosed("OWNER_SEAL_TOKEN_REQUIRED");
  if (typeof ownerActorRef !== "string") failClosed("OWNER_ACTOR_REQUIRED");
  const sealSurface = {
    verificationId,
    baselineId: verification.baselineId,
    manifestId: verification.manifestId,
    ownerActorRef,
    sealToken,
  };
  const factualBaselineSealId = computeIdentity(DOMAIN_TAG.FACTUAL_SEAL, sealSurface);
  return runtime.store.put("factualSeal", factualBaselineSealId, {
    ...sealSurface,
    factualBaselineSealId,
  });
}

export function compileSemanticBindings(runtime, {
  demandBlueprintId,
  factualBaselineSealId,
}) {
  runtime.store.get("factualSeal", factualBaselineSealId);
  const blueprint = runtime.store.get("demandBlueprint", demandBlueprintId);
  const semanticSlotBindings = [];
  const unbindable = [];
  for (const declared of blueprint.declaredNotInstantiated) {
    unbindable.push({
      slotTypeId: declared.slotTypeId,
      mathBlockId: declared.mathBlockId,
      reason: "RULE_UNRESOLVED",
      declaredNotInstantiated: true,
      coreConsumable: false,
    });
  }
  for (const slot of blueprint.demandSlots) {
    if (slot.slotType.semanticRuleRef === "UNRESOLVED") {
      unbindable.push({
        demandSlotId: slot.demandSlotId,
        reason: "RULE_UNRESOLVED",
        coreConsumable: false,
      });
      continue;
    }
    const semanticBindingId = computeIdentity(DOMAIN_TAG.SEMANTIC_BINDING, {
      demandSlotId: slot.demandSlotId,
      factualBaselineSealId,
      resolvedSemanticRuleRef: slot.slotType.semanticRuleRef,
      semanticBindingVersion: "v1",
    });
    semanticSlotBindings.push({
      semanticBindingId,
      demandSlotId: slot.demandSlotId,
      factualBaselineSealId,
      coreConsumable: false,
    });
  }
  return { semanticSlotBindings, unbindable };
}

export function assertMbEnvUninstantiated(runtime, demandBlueprintId) {
  const blueprint = runtime.store.get("demandBlueprint", demandBlueprintId);
  const envDeclared = blueprint.declaredNotInstantiated.some(
    (row) => row.mathBlockId === MATH_BLOCK_ID.MB_ENV,
  );
  if (!envDeclared) failClosed("MB_ENV_NOT_DECLARED");
  const envTask = runtime.store.list("manifest").some((manifest) => (
    manifest.demandBlueprintId === demandBlueprintId
    && manifest.tasks.some((task) => task.mathBlockId === MATH_BLOCK_ID.MB_ENV)
  ));
  if (envTask) failClosed("MB_ENV_INSTANTIATED");
  return true;
}

export function rejectEnvironmentInstantiation() {
  failClosed("ENVIRONMENT_SLOT_UNINSTANTIATED");
}

export function rejectCoreConsumption() {
  failClosed("CORE_CONSUMPTION_FORBIDDEN");
}

export function rejectRawLlmToCore() {
  failClosed("RAW_LLM_TO_CORE_FORBIDDEN");
}
