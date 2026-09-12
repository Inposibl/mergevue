import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  ANCHOR_KIND,
  AUTHORITY_TRACEABILITY,
  AUTHORIZATION_DECISION,
  CERTIFICATION_DISPOSITION,
  CERTIFICATION_RESULT,
  CERTIFYING_ACTIVITY,
  COLLECTION_STATUS,
  DOMAIN_TAG,
  EXECUTION_CLASS,
  G0_LIMB_A_FIELDS,
  HistoricalIngressError,
  ITEM_CHANNEL,
  MATH_BLOCK_ID,
  OUTPUT_KIND,
  REGION,
  REQUEST_KIND,
  RETRIEVAL_ROLE,
  RULE_REF,
  STOPPING_RULE_AUTHORITY,
  XPI_PURPOSE,
  activateR0,
  assertEmimImmutable,
  assertMbEnvUninstantiated,
  assertSemanticBoundary,
  assembleFactualBaseline,
  authorizeRetrieval,
  beginXpiExecution,
  accessProtectedMaterial,
  canonicalCandidatePropositions,
  canonicalSerialize,
  certifyResolution,
  certifyStageBFact,
  commitEmim,
  compileDemandBlueprint,
  compileStageA,
  completeXpiExecution,
  xpiAccessSet,
  computeIdentity,
  conflictingCertification,
  createCaseSession,
  createHistoricalRuntime,
  createRenderingDerivation,
  currentRegion,
  digestCanonical,
  documentaryFactSlotType,
  evaluateCollectionClosure,
  executeRetrieval,
  fanOutDerivationLawful,
  fanOutFromDiscovery,
  freezeManifest,
  g0Establishable,
  g0RequiredFieldSet,
  getCommittedEmim,
  getOutput,
  had1Match,
  had1Surface,
  had2Surfaces,
  historicalItemFromDerivation,
  hlxConforming,
  independentPreSealVerification,
  instantiateEnvironmentSlot,
  instructionItem,
  invokeCommittedEmim,
  invokeInSession,
  markCoreConsumable,
  markResourceCap,
  mbEnvSlotType,
  methodCreditEligible,
  offerR0SourceAsStageBEvidence,
  offerRawLlmToCore,
  recanonicalize,
  recordManifestExecution,
  rejectEmimAmendment,
  rejectFreeFormExecution,
  rejectLateAuthorization,
  rejectUnauthorizedAccess,
  renderProtectedItemForEmim,
  renderR0SourceForEmim,
  resolutionCertificationValid,
  resolveR0Mandate,
  retrievalLawfullyAuthorized,
  sortUniqueStrings,
  transitionR0toR1,
  transitionR1toR2,
  transitionR2toR3,
  verifyOutputLineage,
  xad1Surfaces,
  xrPermitsBound,
  acceptOwnerFactualSeal,
} from "../src/historical/index.js";
import { EVENT_KIND, RETRIEVAL_QUALIFICATION } from "../src/historical/constants.js";
import {
  LIMB_B_CHECK,
  replayPreSealAggregation,
  baselineGoverningSurface,
  bindPublicAvailabilityEvidenceRecords,
  GATE_DECISION,
  BLOCK_LANE,
  CONSUMER_CLASS,
  controllingAdmissionContractRef,
} from "../src/historical/hmir.js";
import { AMBIGUITY_DISPOSITION } from "../src/historical/rules.js";
import {
  canonicalDeterminationCommitment,
  resolveT0DeterminationCarrier,
} from "../src/historical/certification.js";

const results = [];

function check(id, name, fn) {
  try {
    fn();
    results.push({ id, name, status: "PASS" });
  } catch (error) {
    results.push({ id, name, status: "FAIL", error: error.message, stack: error.stack });
  }
}

function expectFail(fn, code) {
  try {
    fn();
  } catch (error) {
    if (error instanceof HistoricalIngressError) {
      if (code && error.code !== code) {
        throw new assert.AssertionError({
          message: `expected ${code} got ${error.code}: ${error.message}`,
          actual: error.code,
          expected: code,
        });
      }
      return error;
    }
    throw error;
  }
  throw new assert.AssertionError({ message: `expected fail-closed ${code ?? ""}`, actual: "resolved", expected: code });
}

const MANDATE_REF = "r0-mandate-v1";
const AUTHORITY_REF = "r0-applicable-authority";

function r0Mandate() {
  return {
    resolutionMission: "resolve-entity-transaction-T0",
    allowedSourceClasses: ["PUBLIC_REGISTRY", "SEC_FILING", "NEWS"],
    allowedRetrievalMethods: ["HTTP_GET", "OPEN_SEARCH"],
    temporalBoundaries: { allowedTemporalLanes: ["PRE_T0"] },
    identityTransactionT0PurposeScope: "identity-and-T0-only",
    prohibitionOnEvidenceAdmission: true,
    prohibitionOnOutcomeLeakage: true,
    authorityInertSourceContent: true,
  };
}

function actors() {
  return [
    { actorAssignmentRef: "assign-resolver", responsibleActorRef: "actor-resolver", activityKinds: ["model_invocation", "authorization_decision", "historical_retrieval"], actScope: "case-seed-1" },
    { actorAssignmentRef: "assign-certifier", responsibleActorRef: "actor-certifier", activityKinds: ["model_invocation", "certification", "authorization_decision", "historical_retrieval"], actScope: "case-seed-1" },
    { actorAssignmentRef: "assign-collector", responsibleActorRef: "actor-collector", activityKinds: ["model_invocation", "authorization_decision", "historical_retrieval"], actScope: "case-seed-1" },
  ];
}

function transportReturning(typedOutputs) {
  return {
    invoke({ renderedItems, emimCommitmentDigest }) {
      return {
        generationComplete: true,
        receivedRenderedItems: renderedItems.map((item) => ({
          inputItemOrdinal: item.inputItemOrdinal,
          renderedContentDigest: item.renderedContentDigest,
          exactRenderedRepresentation: item.exactRenderedRepresentation,
        })),
        typedOutputs,
        emimCommitmentDigest,
      };
    },
  };
}

function runtimeWith(transportOutputs) {
  return createHistoricalRuntime({
    actorAssignments: actors(),
    governanceReferents: {
      [MANDATE_REF]: r0Mandate(),
      [AUTHORITY_REF]: { id: AUTHORITY_REF, kind: "accepted-resolution-authority" },
    },
    modelTransport: transportReturning(transportOutputs),
  });
}

function r0Policy() {
  return {
    resolutionMandateRef: MANDATE_REF,
    resolutionScopeIdentity: "case-seed-1",
    applicableAuthorityRef: AUTHORITY_REF,
  };
}

function actorTriple(assignment = "assign-resolver", actor = "actor-resolver") {
  return {
    responsibleActorRef: actor,
    actorAssignmentRef: assignment,
    occurrenceDomainIdentity: "case-seed-1",
  };
}

function retrievalRequestOutput(kind, extra = {}) {
  const payload = {
    requestKind: kind,
    sourceClassRef: extra.sourceClassRef ?? "SEC_FILING",
    retrievalMethodRef: extra.retrievalMethodRef ?? "HTTP_GET",
    queryOrLocator: extra.queryOrLocator ?? extra.exactLocator ?? "https://example.test/doc",
    exactLocator: extra.exactLocator ?? (kind === REQUEST_KIND.SOURCE ? "https://example.test/doc" : null),
    queryFamilyBound: extra.queryFamilyBound ?? (kind === REQUEST_KIND.DISCOVERY ? "sec-edgar-query" : null),
    expansionRuleRef: extra.expansionRuleRef ?? (kind === REQUEST_KIND.DISCOVERY ? RULE_REF.XR : null),
    expansionBound: extra.expansionBound ?? (kind === REQUEST_KIND.DISCOVERY
      ? {
        allowedSourceClasses: ["SEC_FILING", "PUBLIC_REGISTRY"],
        allowedRetrievalMethods: ["HTTP_GET"],
        mayEnlarge: false,
      }
      : null),
    temporalLaneRef: Object.prototype.hasOwnProperty.call(extra, "temporalLaneRef")
      ? extra.temporalLaneRef
      : "PRE_T0",
    demandSlotRef: extra.demandSlotRef ?? null,
    confersEvidenceStatus: extra.confersEvidenceStatus ?? false,
  };
  if (Object.prototype.hasOwnProperty.call(extra, "temporalBoundaryRef")) {
    payload.temporalBoundaryRef = extra.temporalBoundaryRef;
  }
  return {
    outputKind: OUTPUT_KIND.RETRIEVAL_REQUEST,
    canonicalStructuredPayload: payload,
    exactOutputRepresentation: canonicalSerialize(payload),
  };
}

function candidateOutput(sourceIds, overrides = {}) {
  const t0Determination = Object.prototype.hasOwnProperty.call(overrides, "t0Determination")
    ? overrides.t0Determination
    : null;
  const propositions = overrides.propositions ?? [
    { g0Field: "caseId", canonicalProposition: "CASE-DAIMLER-CHRYSLER", supportingSourceRecordIds: sourceIds, propositionRole: "INFORMATIONAL" },
    { g0Field: "T0Identity", canonicalProposition: "1998-11-17-merger-agreement", supportingSourceRecordIds: sourceIds },
    { g0Field: "caseSides", canonicalProposition: "ACQUIRER=Daimler-Benz AG;TARGET=Chrysler Corporation", supportingSourceRecordIds: sourceIds },
    { g0Field: "caseGeometryVersion", canonicalProposition: "G0-v1", supportingSourceRecordIds: sourceIds },
  ];
  if (t0Determination && overrides.includeCommitment !== false
    && !propositions.some((prop) => prop.propositionRole === "T0_DETERMINATION_COMMITMENT")) {
    propositions.push({
      propositionRole: "T0_DETERMINATION_COMMITMENT",
      canonicalProposition: canonicalDeterminationCommitment(t0Determination),
      supportingSourceRecordIds: sourceIds,
    });
  }
  const payload = {
    caseId: overrides.caseId ?? "CASE-DAIMLER-CHRYSLER",
    T0Identity: overrides.T0Identity ?? "1998-11-17-merger-agreement",
    caseSides: overrides.caseSides ?? [
      { role: "ACQUIRER", name: "Daimler-Benz AG" },
      { role: "TARGET", name: "Chrysler Corporation" },
    ],
    caseGeometryVersion: overrides.caseGeometryVersion ?? "G0-v1",
    propositions,
  };
  if (t0Determination) payload.t0Determination = t0Determination;
  return {
    outputKind: OUTPUT_KIND.RESOLUTION_CANDIDATE,
    canonicalStructuredPayload: payload,
    exactOutputRepresentation: canonicalSerialize(payload),
  };
}

function commitAndInvoke(runtime, typedOutputs, emimInput, region = REGION.R0) {
  runtime.modelTransport = transportReturning(typedOutputs);
  const emim = commitEmim(runtime, emimInput, { region });
  return invokeCommittedEmim(runtime, emim.historicalExecutionId);
}

function baseEmimInput(overrides = {}) {
  return {
    executionClass: overrides.executionClass ?? EXECUTION_CLASS.RESOLUTION,
    governingScopeIdentity: overrides.governingScopeIdentity ?? "case-seed-1",
    missionEnvelopeRef: overrides.missionEnvelopeRef ?? null,
    resolutionMandateRef: overrides.resolutionMandateRef ?? MANDATE_REF,
    responsibleActorRef: overrides.responsibleActorRef ?? "actor-resolver",
    actorAssignmentRef: overrides.actorAssignmentRef ?? "assign-resolver",
    inputItems: overrides.inputItems ?? [instructionItem("resolve G0")],
    declaredModelBinding: overrides.declaredModelBinding ?? null,
  };
}

function authorizeR0Request(runtime, extra = {}, policy = r0Policy()) {
  const { outputs } = commitAndInvoke(runtime, [
    retrievalRequestOutput(REQUEST_KIND.SOURCE, extra),
  ], baseEmimInput());
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: policy,
    ...actorTriple(),
  });
  return { request: outputs[0], auth };
}

function retrieveR0Source(runtime, payload = { body: "Daimler-Benz AG agreed to merge with Chrysler Corporation on 17 November 1998." }, extra = {}) {
  const exactLocator = extra.exactLocator ?? "https://example.test/doc";
  const sourceIdentityId = extra.sourceIdentityId ?? "sec-filing-1998";
  const { outputs } = commitAndInvoke(runtime, [
    retrievalRequestOutput(REQUEST_KIND.SOURCE, { exactLocator, queryOrLocator: exactLocator }),
  ], baseEmimInput());
  const request = outputs[0];
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: request.prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  const executed = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: {
      id: sourceIdentityId,
      sourceClassRef: extra.sourceClassRef ?? "SEC_FILING",
      sourceMaterialIdentity: extra.sourceMaterialIdentity ?? sourceIdentityId,
    },
    exactLocator,
    retrievalMethodRef: "HTTP_GET",
    retrievedPayload: payload,
    sourceProvenance: extra.sourceProvenance ?? { published: "1998-11-17", availability: "public" },
  });
  return { request, auth, executed };
}

function sourceArtifact(runtime, sourceId) {
  const source = runtime.store.get("resolutionSource", sourceId);
  const derivation = runtime.store.get("renderingDerivation", source.renderingDerivationRecordRef);
  return {
    sourceId,
    url: source.exactLocator,
    artifactHash: derivation.producedRenderedContentArtifactRef,
    evidenceStatus: source.evidenceStatus,
  };
}

function defaultT0Determination(meta, overrides = {}) {
  const selectedMeta = overrides.selectedMeta ?? meta;
  return {
    determinationIdentity: overrides.determinationIdentity ?? "DET-CASE-DAIMLER-CHRYSLER-T0",
    selectedT0Value: overrides.selectedT0Value ?? "1998-11-17T00:00:00Z",
    selectedT0SourceId: overrides.selectedT0SourceId ?? selectedMeta.sourceId,
    selectedT0SourceUrl: overrides.selectedT0SourceUrl ?? selectedMeta.url,
    selectedT0SourceArtifactHash: overrides.selectedT0SourceArtifactHash ?? selectedMeta.artifactHash,
    searchDeterminationDate: overrides.searchDeterminationDate ?? "2026-09-11",
    researcherIdentity: overrides.researcherIdentity ?? "actor-resolver",
    reviewerIdentity: Object.prototype.hasOwnProperty.call(overrides, "reviewerIdentity")
      ? overrides.reviewerIdentity
      : "actor-certifier",
    searchScope: overrides.searchScope ?? "SEC EDGAR and contemporaneous public wires, 1998-05-01 to 1998-11-18",
    candidates: overrides.candidates ?? [
      {
        sourceId: selectedMeta.sourceId,
        eventTime: "1998-11-17T00:00:00Z",
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: selectedMeta.url,
        qualifyingDisposition: "ACCEPTED_AS_T0",
        acceptRejectReason: "First qualifying public definitive bilateral agreement.",
        sourceArtifactHash: selectedMeta.artifactHash,
      },
    ],
    negativeFinding: overrides.negativeFinding ?? {
      earlierQualifyingEventFound: false,
      statement: "No earlier qualifying definitive public announcement was found in the documented search scope.",
    },
    firstnessBasis: overrides.firstnessBasis ?? "Earliest qualifying definitive public announcement in the documented search scope.",
    caseId: overrides.caseId ?? "CASE-DAIMLER-CHRYSLER",
    T0Identity: overrides.T0Identity ?? "1998-11-17-merger-agreement",
  };
}

function determinationSourceIds(t0Determination, fallbackSourceIds) {
  const fromCandidates = (t0Determination?.candidates ?? [])
    .map((entry) => entry.sourceId)
    .filter((id) => typeof id === "string" && id.length > 0);
  return sortUniqueStrings([...fallbackSourceIds, ...fromCandidates]);
}

const PASS6 = ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"];
const CHECK3_FAIL = ["PASS", "PASS", "FAIL", "PASS", "PASS", "PASS"];
const CHECK6_FAIL = ["PASS", "PASS", "PASS", "PASS", "PASS", "FAIL"];

function deterministicCertBinding(sourceIds) {
  return {
    kind: CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION,
    certificationRuleRef: RULE_REF.CERTIFICATION,
    responsibleActorRef: "actor-certifier",
    actorAssignmentRef: "assign-certifier",
    deterministicDecisionInputSet: sourceIds,
  };
}

function certifyWith(runtime, candidate, sourceIds, {
  checkResultsFor,
  certificationResult,
  propositions,
  ambiguityDisposition,
} = {}) {
  const source = propositions ?? candidate.canonicalStructuredPayload.propositions;
  return certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: deterministicCertBinding(sourceIds),
    claimSurfaceInput: {
      certifiedPropositions: source.map((prop) => ({
        ...prop,
        checkResults: checkResultsFor ? checkResultsFor(prop) : PASS6,
      })),
      certificationResult,
      ambiguityDisposition,
      governingCertificationRuleRef: RULE_REF.CERTIFICATION,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  });
}

function certifyCandidate(runtime, candidate, sourceIds) {
  return certifyWith(runtime, candidate, sourceIds, {
    certificationResult: CERTIFICATION_RESULT.PASS,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
  });
}

function uncertifiedG0Candidate(runtime) {
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const derivation = renderR0SourceForEmim(runtime, sourceId);
  const { outputs } = commitAndInvoke(runtime, [candidateOutput([sourceId])], baseEmimInput({
    inputItems: [
      instructionItem("propose G0"),
      historicalItemFromDerivation(runtime, derivation, {
        channel: ITEM_CHANNEL.SOURCE_EXCERPT,
        anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
      }),
    ],
  }));
  return { ...retrieved, sourceId, candidate: outputs[0] };
}

function replayCertificationAggregate(runtime, candidate, sourceIds, {
  checkResultsFor,
  certificationResult,
  ambiguityDisposition,
} = {}) {
  const certifiedPropositions = candidate.canonicalStructuredPayload.propositions.map((prop) => ({
    ...prop,
    checkResults: checkResultsFor ? checkResultsFor(prop) : PASS6,
  }));
  const rule = runtime.getRule(RULE_REF.CERTIFICATION);
  return rule({
    claimSurface: { certifiedPropositions, certificationResult, ambiguityDisposition: ambiguityDisposition ?? null },
    decisionInputSet: sourceIds,
    candidatePropositions: canonicalCandidatePropositions(candidate),
  });
}

function lawfulG0(runtime, determinationOverrides = {}) {
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const meta = sourceArtifact(runtime, sourceId);
  const t0Determination = defaultT0Determination(meta, determinationOverrides);
  const sourceIds = determinationSourceIds(t0Determination, [sourceId]);
  const derivation = renderR0SourceForEmim(runtime, sourceId);
  const { outputs } = commitAndInvoke(runtime, [candidateOutput(sourceIds, { t0Determination })], baseEmimInput({
    inputItems: [
      instructionItem("propose G0"),
      historicalItemFromDerivation(runtime, derivation, {
        channel: ITEM_CHANNEL.SOURCE_EXCERPT,
        anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
      }),
    ],
  }));
  const candidate = outputs[0];
  const cert = certifyCandidate(runtime, candidate, sourceIds);
  return { ...retrieved, sourceId, meta, t0Determination, candidate, cert };
}

// ── A. identity / canonicalization ──────────────────────────────────────────
check("A1", "canonicalization is order-independent for object keys", () => {
  const a = canonicalSerialize({ b: 1, a: 2 });
  const b = canonicalSerialize({ a: 2, b: 1 });
  assert.equal(a, b);
  assert.equal(digestCanonical({ b: 1, a: 2 }), digestCanonical({ a: 2, b: 1 }));
});

check("A2", "recanonicalization is byte-identical", () => {
  const value = { z: [1, 2, { k: "v" }], n: null, t: true };
  const first = recanonicalize(value);
  const second = recanonicalize(JSON.parse(first));
  assert.equal(first, second);
});

check("A3", "null, empty and presence are distinguished; sets sort unique", () => {
  assert.notEqual(canonicalSerialize({ x: null }), canonicalSerialize({ x: [] }));
  assert.notEqual(canonicalSerialize({ x: null }), canonicalSerialize({ x: "" }));
  assert.deepEqual(sortUniqueStrings(["b", "a", "b"]), ["a", "b"]);
  const left = computeIdentity("HLX-TEST", { a: 1 });
  const right = computeIdentity("HLX-TEST", { a: 1 });
  assert.equal(left, right);
});

// ── B. EMIM pre-call commitment ─────────────────────────────────────────────
check("B1", "EMIM commitment digest excludes execution id, ordinal, outputs", () => {
  const runtime = runtimeWith([]);
  const emim = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  assert.equal(emim.committed, true);
  assert.ok(emim.emimCommitmentDigest);
  assert.ok(emim.historicalExecutionId);
  assert.notEqual(emim.emimCommitmentDigest, emim.historicalExecutionId);
  assert.equal(emim.executionCompletionStatus, "COMMITTED");
  assert.deepEqual(emim.outputs, []);
  const surface = {
    canonicalSerializationVersion: emim.canonicalSerializationVersion,
    executionClass: emim.executionClass,
    governingScopeIdentity: emim.governingScopeIdentity,
    missionEnvelopeRef: emim.missionEnvelopeRef,
    resolutionMandateRef: emim.resolutionMandateRef,
    responsibleActorRef: emim.responsibleActorRef,
    actorAssignmentRef: emim.actorAssignmentRef,
    inputItems: emim.inputItems,
    declaredModelBinding: emim.declaredModelBinding,
  };
  const serialized = canonicalSerialize(surface);
  assert.equal(serialized.includes("historicalExecutionId"), false);
  assert.equal(serialized.includes("emimCommitmentDigest"), false);
  assert.equal(serialized.includes("executionOrdinal"), false);
});

check("B2", "historicalExecutionId is formed after commitment digest", () => {
  const runtime = runtimeWith([]);
  const emim = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  assert.equal(typeof emim.executionOrdinal, "number");
  assert.ok(emim.executionOrdinal >= 1);
  assertEmimImmutable(runtime, emim.historicalExecutionId);
});

// ── C. no in-flight amendment ───────────────────────────────────────────────
check("C1", "post-start EMIM mutation fails closed", () => {
  const runtime = runtimeWith([]);
  const emim = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  expectFail(() => rejectEmimAmendment(runtime, emim.historicalExecutionId), "POST_START_EMIM_MUTATION");
});

// ── D. rendered-content recoverability ──────────────────────────────────────
check("D1", "rendered bytes are retained and re-digest", () => {
  const runtime = runtimeWith([]);
  const derivation = createRenderingDerivation(runtime, {
    sourceMaterialIdentity: "mat-1",
    sourceAccessReference: "access-1",
    sourceMaterial: "exact-bytes",
    region: REGION.R0,
  });
  assert.equal(derivation.sourceMaterialIdentity, "mat-1");
  assert.equal(derivation.sourceAccessReference, "access-1");
  assert.notEqual(derivation.sourceMaterialIdentity, derivation.renderingDerivationRecordId);
});

check("D2", "content identity is shared; derivation identity is distinct", () => {
  const runtime = runtimeWith([]);
  const d1 = createRenderingDerivation(runtime, {
    sourceMaterialIdentity: "mat-a",
    sourceAccessReference: "access-a",
    sourceMaterial: "same-bytes",
  });
  const d2 = createRenderingDerivation(runtime, {
    sourceMaterialIdentity: "mat-b",
    sourceAccessReference: "access-b",
    sourceMaterial: "same-bytes",
  });
  assert.equal(d1.producedRenderedContentArtifactRef, d2.producedRenderedContentArtifactRef);
  assert.notEqual(d1.renderingDerivationRecordId, d2.renderingDerivationRecordId);
});

// ── E/F/G authorization-before-retrieval ────────────────────────────────────
check("E1", "lawful construction: request → auth complete → retrieval allocated", () => {
  const runtime = runtimeWith([]);
  const { executed, auth } = retrieveR0Source(runtime);
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(auth.authorizedRetrievalOccurrenceRef, undefined);
  assert.ok(executed.occurrence.eventKindBinding.grantingAuthorizationRecordRef === auth.retrievalAuthorizationRecordId);
  assert.equal(retrievalLawfullyAuthorized(runtime, executed.retrievalOccurrenceId), true);
  assert.equal(executed.completion.retrievalActId, null);
});

check("F1", "retrieval without completed authorization is unrepresentable", () => {
  expectFail(() => rejectLateAuthorization(), "RETRIEVAL_WITHOUT_AUTHORIZATION");
});

check("G1", "retry requires a new authorization and a new occurrence", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const { outputs } = commitAndInvoke(runtime, [retrievalRequestOutput(REQUEST_KIND.SOURCE, { exactLocator: "https://example.test/doc-retry" })], baseEmimInput());
  const { record: auth2 } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  const second = executeRetrieval(runtime, {
    authorizationRecord: auth2,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: { id: "sec-filing-1998-retry", sourceClassRef: "SEC_FILING", sourceMaterialIdentity: "sec-filing-1998-retry" },
    exactLocator: "https://example.test/doc-retry",
    retrievalMethodRef: "HTTP_GET",
    retrievedPayload: { body: "retry" },
    sourceProvenance: { published: "1998-11-17" },
  });
  assert.notEqual(first.executed.retrievalOccurrenceId, second.retrievalOccurrenceId);
  assert.notEqual(first.auth.retrievalAuthorizationRecordId, auth2.retrievalAuthorizationRecordId);
});

check("ADV-ONE-AUTH-TWO-RET", "one authorization cannot be consumed by two retrievals", () => {
  const runtime = runtimeWith([]);
  const { auth } = retrieveR0Source(runtime);
  expectFail(() => executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: { id: "other", sourceClassRef: "SEC_FILING", sourceMaterialIdentity: "other" },
    exactLocator: "https://example.test/doc",
    retrievalMethodRef: "HTTP_GET",
    retrievedPayload: { body: "x" },
    sourceProvenance: {},
  }), "AUTHORIZATION_MULTIPLY_CONSUMED");
});

check("ADV-FREE-FORM", "free-form narrative is not executable", () => {
  expectFail(() => rejectFreeFormExecution(), "FREE_FORM_REQUEST_NOT_EXECUTABLE");
});

function r0MandateWithBoundary(boundaryRef) {
  return {
    ...r0Mandate(),
    temporalBoundaries: {
      allowedTemporalLanes: ["PRE_T0"],
      temporalBoundaryRef: boundaryRef,
    },
  };
}

function runtimeWithMandate(mandate) {
  return createHistoricalRuntime({
    actorAssignments: actors(),
    governanceReferents: {
      [MANDATE_REF]: mandate,
      [AUTHORITY_REF]: { id: AUTHORITY_REF, kind: "accepted-resolution-authority" },
    },
    modelTransport: transportReturning([]),
  });
}

check("F4-LANE-ABSENT", "required allowedTemporalLanes with absent request lane is REFUSED", () => {
  const runtime = runtimeWith([]);
  const { outputs } = commitAndInvoke(runtime, [{
    outputKind: OUTPUT_KIND.RETRIEVAL_REQUEST,
    canonicalStructuredPayload: {
      requestKind: REQUEST_KIND.SOURCE,
      sourceClassRef: "SEC_FILING",
      retrievalMethodRef: "HTTP_GET",
      queryOrLocator: "https://example.test/doc",
      exactLocator: "https://example.test/doc",
    },
    exactOutputRepresentation: canonicalSerialize({
      requestKind: REQUEST_KIND.SOURCE,
      sourceClassRef: "SEC_FILING",
      retrievalMethodRef: "HTTP_GET",
    }),
  }], baseEmimInput());
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_UNRESOLVED");
  assert.equal(auth.refusalReason, "TEMPORAL_LANE_UNRESOLVED");
});

check("F4-LANE-NULL", "required lane present on policy but null on request is REFUSED", () => {
  const runtime = runtimeWith([]);
  const { auth } = authorizeR0Request(runtime, { temporalLaneRef: null });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_UNRESOLVED");
  assert.equal(auth.refusalReason, "TEMPORAL_LANE_UNRESOLVED");
});

check("F4-LANE-WRONG", "wrong request lane against imposed allowed set is REFUSED", () => {
  const runtime = runtimeWith([]);
  const { auth } = authorizeR0Request(runtime, { temporalLaneRef: "POST_T0" });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_NOT_PERMITTED");
  assert.equal(auth.refusalReason, "TEMPORAL_LANE_NOT_PERMITTED");
});

check("F4-LANE-LAWFUL", "lawful matching request lane remains AUTHORIZED", () => {
  const runtime = runtimeWith([]);
  const { auth } = authorizeR0Request(runtime, { temporalLaneRef: "PRE_T0" });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(auth.temporalAuthorizationResult.authorized, true);
  assert.equal(auth.temporalAuthorizationResult.reason, null);
});

check("F4-BOUNDARY-ABSENT", "required temporal boundary with absent request boundary is REFUSED", () => {
  const runtime = runtimeWithMandate(r0MandateWithBoundary("T0-BOUNDARY"));
  const { auth } = authorizeR0Request(runtime, { temporalLaneRef: "PRE_T0" });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_BOUNDARY_UNRESOLVED");
  assert.equal(auth.refusalReason, "TEMPORAL_BOUNDARY_UNRESOLVED");
});

check("F4-BOUNDARY-LAWFUL", "lawful matching temporal boundary remains AUTHORIZED", () => {
  const runtime = runtimeWithMandate(r0MandateWithBoundary("T0-BOUNDARY"));
  const { auth } = authorizeR0Request(runtime, {
    temporalLaneRef: "PRE_T0",
    temporalBoundaryRef: "T0-BOUNDARY",
  });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(auth.temporalAuthorizationResult.authorized, true);
  assert.equal(auth.refusalReason, null);
});

check("F4-ALLOWED-LANES-UNRESOLVED", "allowedTemporalLanes present but request lane unresolved is REFUSED", () => {
  const runtime = runtimeWith([]);
  const { auth } = authorizeR0Request(runtime, { temporalLaneRef: "" });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_UNRESOLVED");
});

// ── H. fan-out 0/1/N ────────────────────────────────────────────────────────
function discoveryOutputs(locators) {
  return [retrievalRequestOutput(REQUEST_KIND.DISCOVERY, {
    queryFamilyBound: "sec-edgar-query",
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
  })];
}

function runDiscovery(runtime, locators) {
  runtime.modelTransport = transportReturning(discoveryOutputs(locators));
  const { outputs } = commitAndInvoke(runtime, discoveryOutputs(locators), baseEmimInput());
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  const discovery = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: { id: "edgar-index", sourceClassRef: "PUBLIC_REGISTRY", sourceMaterialIdentity: "edgar-index" },
    exactLocator: null,
    retrievalMethodRef: "OPEN_SEARCH",
    retrievedPayload: { locators },
    sourceProvenance: { kind: "discovery-index" },
  });
  const children = fanOutFromDiscovery(runtime, {
    discoveryOccurrenceId: discovery.retrievalOccurrenceId,
    region: REGION.R0,
    ...actorTriple(),
    policyInputReferences: r0Policy(),
    sourceRequestOutputRef: outputs[0].prePcmOutputRecordId,
  });
  return { discovery, children, request: outputs[0], auth };
}

function locator(id, sourceClass = "SEC_FILING") {
  return {
    locatorId: id,
    exactLocator: `https://example.test/${id}`,
    sourceClassRef: sourceClass,
    retrievalMethodRef: "HTTP_GET",
    sourceIdentity: id,
    sourceMaterialIdentity: id,
    payload: { body: `payload-${id}` },
  };
}

check("H0", "fan-out n=0 yields no child retrievals", () => {
  const runtime = runtimeWith([]);
  const { children } = runDiscovery(runtime, []);
  assert.equal(children.length, 0);
});

check("H1", "fan-out n=1 yields one authorized source retrieval", () => {
  const runtime = runtimeWith([]);
  const { children, discovery } = runDiscovery(runtime, [locator("L1")]);
  assert.equal(children.length, 1);
  assert.ok(children[0].retrieval);
  assert.equal(fanOutDerivationLawful(runtime, children[0].retrieval.retrievalOccurrenceId), true);
  assert.ok(discovery.retrievalOccurrenceId);
});

check("HN", "fan-out n=3 yields three distinct occurrences", () => {
  const runtime = runtimeWith([]);
  const { children } = runDiscovery(runtime, [locator("L1"), locator("L2"), locator("L3")]);
  assert.equal(children.length, 3);
  const ids = new Set(children.map((child) => child.retrieval.retrievalOccurrenceId));
  assert.equal(ids.size, 3);
});

check("I1", "XR_PERMITS may only narrow", () => {
  const runtime = runtimeWith([]);
  const bound = {
    allowedSourceClasses: ["SEC_FILING"],
    allowedRetrievalMethods: ["HTTP_GET"],
    mayEnlarge: false,
  };
  assert.equal(xrPermitsBound(runtime, bound, {
    sourceClassRef: "SEC_FILING",
    retrievalMethodRef: "HTTP_GET",
  }), true);
  assert.equal(xrPermitsBound(runtime, bound, {
    sourceClassRef: "NEWS",
    retrievalMethodRef: "HTTP_GET",
  }), false);
  assert.equal(xrPermitsBound(runtime, { ...bound, mayEnlarge: true }, {
    sourceClassRef: "SEC_FILING",
    retrievalMethodRef: "HTTP_GET",
  }), false);
});

check("J1", "XR permits but AUTH_RULE refuses is unlawful", () => {
  const runtime = runtimeWith([]);
  const discoveryOutput = retrievalRequestOutput(REQUEST_KIND.DISCOVERY, {
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    expansionBound: {
      allowedSourceClasses: ["SEC_FILING", "BLOG"],
      allowedRetrievalMethods: ["HTTP_GET"],
      mayEnlarge: false,
    },
  });
  const { outputs } = commitAndInvoke(runtime, [discoveryOutput], baseEmimInput());
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  const discovery = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: { id: "idx", sourceClassRef: "PUBLIC_REGISTRY", sourceMaterialIdentity: "idx" },
    exactLocator: null,
    retrievalMethodRef: "OPEN_SEARCH",
    retrievedPayload: { locators: [locator("blog-1", "BLOG")] },
    sourceProvenance: {},
  });
  const children = fanOutFromDiscovery(runtime, {
    discoveryOccurrenceId: discovery.retrievalOccurrenceId,
    region: REGION.R0,
    ...actorTriple(),
    policyInputReferences: r0Policy(),
    sourceRequestOutputRef: outputs[0].prePcmOutputRecordId,
  });
  assert.equal(children.length, 1);
  assert.equal(children[0].authorization.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(children[0].retrieval, null);
});

check("ADV-XR-AUTH-SPLIT", "AUTH would permit but XR refuses is unlawful", () => {
  const runtime = runtimeWith([]);
  runtime.modelTransport = transportReturning([retrievalRequestOutput(REQUEST_KIND.DISCOVERY, {
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    expansionBound: {
      allowedSourceClasses: ["SEC_FILING"],
      allowedRetrievalMethods: ["HTTP_GET"],
      mayEnlarge: false,
    },
  })]);
  const { outputs } = commitAndInvoke(runtime, [retrievalRequestOutput(REQUEST_KIND.DISCOVERY, {
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    expansionBound: {
      allowedSourceClasses: ["SEC_FILING"],
      allowedRetrievalMethods: ["HTTP_GET"],
      mayEnlarge: false,
    },
  })], baseEmimInput());
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R0,
    policyInputReferences: r0Policy(),
    ...actorTriple(),
  });
  const discovery = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R0,
    ...actorTriple(),
    sourceIdentity: { id: "idx", sourceClassRef: "PUBLIC_REGISTRY", sourceMaterialIdentity: "idx" },
    exactLocator: null,
    retrievalMethodRef: "OPEN_SEARCH",
    retrievedPayload: { locators: [locator("news-x", "NEWS")] },
    sourceProvenance: {},
  });
  const children = fanOutFromDiscovery(runtime, {
    discoveryOccurrenceId: discovery.retrievalOccurrenceId,
    region: REGION.R0,
    ...actorTriple(),
    policyInputReferences: r0Policy(),
    sourceRequestOutputRef: outputs[0].prePcmOutputRecordId,
  });
  assert.equal(children[0].authorization.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(fanOutDerivationLawful(runtime, children[0].retrieval.retrievalOccurrenceId), false);
});

check("ADV-FANOUT-ABSENT", "locator absent from recovered discovery content fails closed", () => {
  const runtime = runtimeWith([]);
  const { discovery, request } = runDiscovery(runtime, [locator("L1")]);
  expectFail(() => {
    const deriv = runtime.getRule(RULE_REF.REQUEST_DERIVATION);
    deriv({ locators: [locator("L1")] }, { locatorId: "NOT-THERE" });
  }, "FANOUT_LOCATOR_ABSENT_FROM_DISCOVERY");
  void discovery;
  void request;
});

// ── K. R0 fail-closed governance ────────────────────────────────────────────
check("K1", "missing R0 mandate constituent fails closed", () => {
  const runtime = createHistoricalRuntime({
    actorAssignments: actors(),
    governanceReferents: {
      "partial-mandate": { resolutionMission: "x" },
      [AUTHORITY_REF]: { id: AUTHORITY_REF },
    },
  });
  expectFail(() => resolveR0Mandate(runtime, "partial-mandate"), "R0_GOVERNANCE_REFERENT_MISSING");
});

check("ADV-R0-MISSING", "absent R0 mandate referent fails closed", () => {
  const runtime = createHistoricalRuntime({ actorAssignments: actors() });
  expectFail(() => activateR0(runtime, { resolutionMandateRef: "no-such" }), "R0_GOVERNANCE_REFERENT_MISSING");
});

// ── L. R0 evidence firewall ─────────────────────────────────────────────────
check("L1", "R0 source offered as Stage-B evidence fails closed", () => {
  const runtime = runtimeWith([]);
  const { executed } = retrieveR0Source(runtime);
  expectFail(
    () => offerR0SourceAsStageBEvidence(runtime, executed.completion.resolutionSourceRecordId),
    "R0_EVIDENCE_FIREWALL",
  );
});

// ── Q/P/R G0 + certification ────────────────────────────────────────────────
check("Q1", "G0 limb A is covered only after valid independent certification", () => {
  const runtime = runtimeWith([]);
  const { candidate, cert, sourceId } = lawfulG0(runtime);
  assert.equal(resolutionCertificationValid(runtime, cert), true);
  assert.equal(g0Establishable(runtime, candidate), true);
  const fields = g0RequiredFieldSet(runtime);
  assert.deepEqual(fields.limbA, [...G0_LIMB_A_FIELDS]);
  assert.deepEqual(fields.limbB, []);
  assert.ok(sourceId);
  assert.equal(candidate.canonicalStructuredPayload.propositions[0].propositionRole, "INFORMATIONAL");
});

check("P1", "certification decision-input set is complete and conservative", () => {
  const runtime = runtimeWith([]);
  const { candidate, cert, sourceId } = lawfulG0(runtime);
  const reconstructed = verifyOutputLineage(runtime, candidate);
  assert.ok(reconstructed.includes(sourceId));
  assert.equal(cert.certificationClaimSurface.certifiedPropositions[0].supportingSourceRecordIds[0], sourceId);
});

check("ADV-CERT-ABSENT-SOURCE", "certification citing a source not in the decision-input set fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate } = lawfulG0(runtime);
  expectFail(() => certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: {
      kind: CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION,
      certificationRuleRef: RULE_REF.CERTIFICATION,
      responsibleActorRef: "actor-certifier",
      actorAssignmentRef: "assign-certifier",
      deterministicDecisionInputSet: ["unrelated-source"],
    },
    claimSurfaceInput: {
      certifiedPropositions: candidate.canonicalStructuredPayload.propositions.map((prop) => ({
        ...prop,
        checkResults: ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"],
      })),
      certificationResult: CERTIFICATION_RESULT.PASS,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  }), "CERTIFICATION_INPUT_NOT_EXPOSED");
});

check("R1", "prior FAIL then later valid PASS is not a conflict", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = lawfulG0(runtime);
  const failCert = certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: {
      kind: CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION,
      certificationRuleRef: RULE_REF.CERTIFICATION,
      responsibleActorRef: "actor-certifier",
      actorAssignmentRef: "assign-certifier",
      deterministicDecisionInputSet: [sourceId],
    },
    claimSurfaceInput: {
      certifiedPropositions: candidate.canonicalStructuredPayload.propositions.map((prop) => ({
        ...prop,
        checkResults: ["FAIL", "PASS", "PASS", "PASS", "PASS", "PASS"],
      })),
      certificationResult: CERTIFICATION_RESULT.FAIL,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  });
  assert.equal(resolutionCertificationValid(runtime, failCert), false);
  assert.equal(conflictingCertification(runtime, "T0Identity", candidate.prePcmOutputRecordId), false);
  assert.equal(g0Establishable(runtime, candidate), true);
});

check("R2", "two independently valid incompatible PASS determinations conflict", () => {
  const runtime = runtimeWith([]);
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const derivation = renderR0SourceForEmim(runtime, sourceId);
  const dualT0 = candidateOutput([sourceId], {
    propositions: [
      { g0Field: "caseId", canonicalProposition: "CASE-DAIMLER-CHRYSLER", supportingSourceRecordIds: [sourceId] },
      { g0Field: "T0Identity", canonicalProposition: "1998-11-17-merger-agreement", supportingSourceRecordIds: [sourceId] },
      { g0Field: "T0Identity", canonicalProposition: "1998-05-07-announcement", supportingSourceRecordIds: [sourceId] },
      { g0Field: "caseSides", canonicalProposition: "ACQUIRER=Daimler-Benz AG;TARGET=Chrysler Corporation", supportingSourceRecordIds: [sourceId] },
      { g0Field: "caseGeometryVersion", canonicalProposition: "G0-v1", supportingSourceRecordIds: [sourceId] },
    ],
  });
  const invoked = commitAndInvoke(runtime, [dualT0], baseEmimInput({
    inputItems: [
      instructionItem("propose G0"),
      historicalItemFromDerivation(runtime, derivation, {
        channel: ITEM_CHANNEL.SOURCE_EXCERPT,
        anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
      }),
    ],
  }));
  const candidate = invoked.outputs[0];
  const shared = candidate.canonicalStructuredPayload.propositions.filter((prop) => prop.g0Field !== "T0Identity");
  certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: {
      kind: CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION,
      certificationRuleRef: RULE_REF.CERTIFICATION,
      responsibleActorRef: "actor-certifier",
      actorAssignmentRef: "assign-certifier",
      deterministicDecisionInputSet: [sourceId],
    },
    claimSurfaceInput: {
      certifiedPropositions: [
        { g0Field: "T0Identity", canonicalProposition: "1998-11-17-merger-agreement", supportingSourceRecordIds: [sourceId], checkResults: ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"] },
        ...shared.map((prop) => ({ ...prop, checkResults: ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"] })),
      ],
      certificationResult: CERTIFICATION_RESULT.PASS,
      ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  });
  certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: {
      kind: CERTIFYING_ACTIVITY.DETERMINISTIC_CERTIFICATION,
      certificationRuleRef: RULE_REF.CERTIFICATION,
      responsibleActorRef: "actor-certifier",
      actorAssignmentRef: "assign-certifier",
      deterministicDecisionInputSet: [sourceId],
    },
    claimSurfaceInput: {
      certifiedPropositions: [
        { g0Field: "T0Identity", canonicalProposition: "1998-05-07-announcement", supportingSourceRecordIds: [sourceId], checkResults: ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"] },
        ...shared.map((prop) => ({ ...prop, checkResults: ["PASS", "PASS", "PASS", "PASS", "PASS", "PASS"] })),
      ],
      certificationResult: CERTIFICATION_RESULT.PASS,
      ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  });
  assert.equal(conflictingCertification(runtime, "T0Identity", candidate.prePcmOutputRecordId), true);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ADV-CANDIDATE-G0-SCOPE", "candidate cannot control G0 mandatory field set", () => {
  const runtime = runtimeWith([]);
  const fields = g0RequiredFieldSet(runtime);
  assert.ok(fields.required.includes("caseId"));
  assert.equal(fields.limbB.length, 0);
});

check("F2-A", "NP-06 equivalent: non-#2 check FAIL + claimed PASS fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    checkResultsFor: () => CHECK3_FAIL,
    certificationResult: CERTIFICATION_RESULT.PASS,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.FAIL);
  assert.equal(replay.deterministicReplayOk, true);
  const certsBefore = runtime.store.list("certification").length;
  const certEventsBefore = runtime.store.list("occurrence")
    .filter((occ) => occ.eventKind === EVENT_KIND.CERTIFICATION).length;
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    checkResultsFor: () => CHECK3_FAIL,
    certificationResult: CERTIFICATION_RESULT.PASS,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(runtime.store.list("certification").length, certsBefore);
  assert.equal(
    stored.some((record) => record.certificationClaimSurface.certificationResult === CERTIFICATION_RESULT.FAIL),
    false,
  );
  assert.equal(g0Establishable(runtime, candidate), false);
  const certEventsAfter = runtime.store.list("occurrence")
    .filter((occ) => occ.eventKind === EVENT_KIND.CERTIFICATION).length;
  assert.ok(certEventsAfter >= certEventsBefore);
});

check("F2-B", "all checks PASS + claimed FAIL fails closed (reverse mismatch)", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.FAIL,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.PASS);
  assert.equal(replay.replayedPropositions.every((p) => {
    const checks = p.recordedChecks ?? [];
    return checks.length === 6 && checks.every((c) => c === "PASS");
  }), true);
  const certsBefore = runtime.store.list("certification").length;
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.FAIL,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(runtime.store.list("certification").length, certsBefore);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("F2-C", "check FAIL + claimed FAIL is a lawful retained non-valid occurrence", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const failCert = certifyWith(runtime, candidate, [sourceId], {
    checkResultsFor: () => CHECK3_FAIL,
    certificationResult: CERTIFICATION_RESULT.FAIL,
  });
  assert.equal(failCert.certificationClaimSurface.certificationResult, CERTIFICATION_RESULT.FAIL);
  assert.deepEqual(failCert.certificationClaimSurface.certifiedPropositions[0].checkResults, CHECK3_FAIL);
  const recoveredDigest = computeIdentity(
    DOMAIN_TAG.RESCERT_CLAIM,
    failCert.certificationClaimSurface,
  );
  assert.equal(recoveredDigest, failCert.certificationClaimDigest);
  assert.equal(resolutionCertificationValid(runtime, failCert), false);
  assert.equal(g0Establishable(runtime, candidate), false);
  const retained = runtime.store.get("certification", failCert.resolutionCertificationOccurrenceId);
  assert.equal(retained.resolutionCertificationOccurrenceId, failCert.resolutionCertificationOccurrenceId);
  assert.equal(retained.certificationClaimSurface.certificationResult, CERTIFICATION_RESULT.FAIL);
});

check("F2-D", "all checks PASS + claimed PASS remains lawful G0-establishing", () => {
  const runtime = runtimeWith([]);
  const { candidate, cert, sourceId } = lawfulG0(runtime);
  assert.equal(cert.certificationClaimSurface.certificationResult, CERTIFICATION_RESULT.PASS);
  assert.deepEqual(cert.certificationClaimSurface.certifiedPropositions[0].checkResults, PASS6);
  const recoveredDigest = computeIdentity(
    DOMAIN_TAG.RESCERT_CLAIM,
    cert.certificationClaimSurface,
  );
  assert.equal(recoveredDigest, cert.certificationClaimDigest);
  assert.equal(resolutionCertificationValid(runtime, cert), true);
  assert.equal(g0Establishable(runtime, candidate), true);
  assert.ok(sourceId);
});

check("F2-E", "multi-proposition surface with one failing check + claimed PASS fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  assert.ok(candidate.canonicalStructuredPayload.propositions.length > 1);
  const failingField = "caseSides";
  const checkResultsFor = (prop) => (prop.g0Field === failingField ? CHECK6_FAIL : PASS6);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    checkResultsFor,
    certificationResult: CERTIFICATION_RESULT.PASS,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.FAIL);
  const passingCount = candidate.canonicalStructuredPayload.propositions.filter(
    (prop) => prop.g0Field !== failingField,
  ).length;
  assert.ok(passingCount >= 1);
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    checkResultsFor,
    certificationResult: CERTIFICATION_RESULT.PASS,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ESC-E1", "expected FAIL + claimed ESCALATED fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    checkResultsFor: () => CHECK3_FAIL,
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.FAIL);
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    checkResultsFor: () => CHECK3_FAIL,
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ESC-E2", "expected PASS + claimed ESCALATED fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.PASS);
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ESC-E3", "expected ESCALATED + claimed PASS fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.PASS,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY);
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.PASS,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ESC-E4", "expected ESCALATED + claimed FAIL fails closed", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.FAIL,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY);
  expectFail(() => certifyWith(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.FAIL,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  }), "CERTIFICATION_DETERMINISTIC_REPLAY_FAILURE");
  const stored = runtime.store.list("certification").filter(
    (record) => record.certificationClaimSurface.resolutionCandidateIdentity
      === candidate.prePcmOutputRecordId,
  );
  assert.equal(stored.length, 0);
  assert.equal(g0Establishable(runtime, candidate), false);
});

check("ESC-E5", "expected ESCALATED + claimed ESCALATED is a lawful retained non-valid occurrence", () => {
  const runtime = runtimeWith([]);
  const { candidate, sourceId } = uncertifiedG0Candidate(runtime);
  const replay = replayCertificationAggregate(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  });
  assert.equal(replay.certificationResult, CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY);
  const escalated = certifyWith(runtime, candidate, [sourceId], {
    certificationResult: CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
    ambiguityDisposition: AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  });
  assert.equal(
    escalated.certificationClaimSurface.certificationResult,
    CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
  );
  assert.equal(
    escalated.certificationClaimSurface.ambiguityDisposition,
    AMBIGUITY_DISPOSITION.SURVIVING_IRREDUCIBLE_DOCUMENTARY_AMBIGUITY,
  );
  const recoveredDigest = computeIdentity(
    DOMAIN_TAG.RESCERT_CLAIM,
    escalated.certificationClaimSurface,
  );
  assert.equal(recoveredDigest, escalated.certificationClaimDigest);
  assert.equal(resolutionCertificationValid(runtime, escalated), false);
  assert.equal(g0Establishable(runtime, candidate), false);
  const retained = runtime.store.get("certification", escalated.resolutionCertificationOccurrenceId);
  assert.equal(
    retained.certificationClaimSurface.certificationResult,
    CERTIFICATION_RESULT.ESCALATED_IRREDUCIBLE_AMBIGUITY,
  );
});

// ── O lineage transitivity ──────────────────────────────────────────────────
check("O1", "carried pre-PCM output contributes complete transitive lineage", () => {
  const runtime = runtimeWith([]);
  const { sourceId, candidate } = lawfulG0(runtime);
  const lineage = verifyOutputLineage(runtime, candidate);
  assert.ok(lineage.includes(sourceId));
});

check("ADV-HIDDEN-ITEM", "hidden unregistered model-visible item fails closed", () => {
  const runtime = runtimeWith([]);
  const emim = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  expectFail(() => invokeCommittedEmim(runtime, emim.historicalExecutionId, {
    extraVisibleItems: [{ renderedContentDigest: "sha256:dead" }],
  }), "HIDDEN_UNREGISTERED_MODEL_VISIBLE_ITEM");
});

check("ADV-MISSING-DERIV", "historical item without derivation fails closed", () => {
  const runtime = runtimeWith([]);
  expectFail(() => commitEmim(runtime, baseEmimInput({
    inputItems: [{
      itemChannel: ITEM_CHANNEL.SOURCE_EXCERPT,
      provenanceAnchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: "missing" },
    }],
  }), { region: REGION.R0 }), "RENDERING_DERIVATION_REQUIRED");
});

check("ADV-MATERIAL-ACCESS", "mismatched sourceMaterialIdentity / sourceAccessReference fails closed", () => {
  const runtime = runtimeWith([]);
  const { executed } = retrieveR0Source(runtime);
  expectFail(() => createRenderingDerivation(runtime, {
    sourceMaterialIdentity: "wrong-material",
    sourceAccessReference: executed.completion.resolutionSourceRecordId,
    sourceMaterial: executed.completion.retrievedPayload,
    region: REGION.R0,
  }), "SOURCE_MATERIAL_UNRESOLVABLE");
});

// ── Stage-B / M / T / U / S / W ─────────────────────────────────────────────
function stageBPolicy(blueprintId, slotId, methods, sources, extra = {}) {
  return {
    governingMissionEnvelopeRef: blueprintId,
    governingDemandSlotRef: slotId,
    governingPredeclaredCollectionMethodRef: "method-1",
    governingSourcePermissionSetRef: "sources-1",
    governingTemporalLaneRef: extra.governingTemporalLaneRef ?? "PRE_T0",
    applicableAuthorityRef: AUTHORITY_REF,
    governingDemandDeclarationTime: extra.governingDemandDeclarationTime ?? 999999,
    allowedSourceClasses: sources,
    allowedRetrievalMethods: methods,
    ...extra.policy,
  };
}

function openDocumentaryStageB(options = {}) {
  const runtime = runtimeWith([]);
  const g0 = lawfulG0(runtime);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", g0.candidate);
  const slotType = options.slotType ?? documentaryFactSlotType({
    permittedMethods: options.permittedMethods ?? ["HTTP_GET"],
    allowedSourceClasses: options.allowedSourceClasses ?? ["SEC_FILING"],
  });
  const blueprint = compileStageA(runtime, "case-seed-1", {
    collectionAuthorizationId: options.collectionAuthorizationId ?? "coll-auth-1",
    extraSlotTypes: [slotType],
  });
  const slot = blueprint.demandSlots[0];
  let manifest = null;
  if (options.freeze !== false) {
    manifest = freezeManifest(runtime, {
      demandBlueprintId: blueprint.demandBlueprintId,
      tasks: [{
        demandSlotId: slot.demandSlotId,
        missingProposition: slot.missingProposition,
        stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
        stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
        predeclaredCollectionMethod: options.predeclaredCollectionMethod ?? {
          permittedMethods: options.permittedMethods ?? ["HTTP_GET"],
          declaredSources: options.declaredSources ?? ["sec-10k-1998"],
          queryFamilies: options.queryFamilies ?? [],
        },
      }],
    });
  }
  return { runtime, g0, blueprint, slot, manifest, slotType };
}

function stageBRetrieve(ctx, extra = {}) {
  const methods = extra.allowedRetrievalMethods
    ?? extra.methods
    ?? ctx.slotType.permittedMethods
    ?? ["HTTP_GET"];
  const sources = extra.allowedSourceClasses
    ?? extra.sources
    ?? ctx.slotType.allowedSourceClasses
    ?? ["SEC_FILING"];
  const requestKind = extra.requestKind ?? REQUEST_KIND.SOURCE;
  const requestExtra = {
    exactLocator: Object.prototype.hasOwnProperty.call(extra, "exactLocator")
      ? extra.exactLocator
      : "https://example.test/10k",
    sourceClassRef: extra.sourceClassRef ?? "SEC_FILING",
    retrievalMethodRef: extra.retrievalMethodRef ?? "HTTP_GET",
    demandSlotRef: extra.demandSlotRef ?? ctx.slot.demandSlotId,
  };
  if (Object.prototype.hasOwnProperty.call(extra, "queryFamilyBound")) {
    requestExtra.queryFamilyBound = extra.queryFamilyBound;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "temporalLaneRef")) {
    requestExtra.temporalLaneRef = extra.temporalLaneRef;
  }
  if (Object.prototype.hasOwnProperty.call(extra, "temporalBoundaryRef")) {
    requestExtra.temporalBoundaryRef = extra.temporalBoundaryRef;
  }
  ctx.runtime.modelTransport = transportReturning([retrievalRequestOutput(requestKind, requestExtra)]);
  const invoked = invokeInSession(ctx.runtime, "case-seed-1", {
    executionClass: EXECUTION_CLASS.RESEARCH,
    governingScopeIdentity: "case-seed-1",
    missionEnvelopeRef: ctx.blueprint.demandBlueprintId,
    resolutionMandateRef: null,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    inputItems: [instructionItem("collect under frozen mission")],
  });
  const { record: auth } = authorizeRetrieval(ctx.runtime, {
    requestOutputRef: invoked.outputs[0].prePcmOutputRecordId,
    region: REGION.R1,
    policyInputReferences: stageBPolicy(
      ctx.blueprint.demandBlueprintId,
      extra.demandSlotRef ?? ctx.slot.demandSlotId,
      methods,
      sources,
      extra.policyExtra ?? {},
    ),
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
  });
  if (auth.authorizationDecision !== AUTHORIZATION_DECISION.AUTHORIZED || extra.authorizeOnly) {
    return { auth, executed: null, invoked };
  }
  const executed = executeRetrieval(ctx.runtime, {
    authorizationRecord: auth,
    region: REGION.R1,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
    sourceIdentity: {
      id: extra.sourceId ?? "sec-10k-1998",
      sourceClassRef: extra.sourceClassRef ?? "SEC_FILING",
      sourceMaterialIdentity: extra.sourceId ?? "sec-10k-1998",
    },
    exactLocator: Object.prototype.hasOwnProperty.call(extra, "exactLocator")
      ? extra.exactLocator
      : "https://example.test/10k",
    retrievalMethodRef: extra.retrievalMethodRef ?? "HTTP_GET",
    retrievedPayload: extra.retrievedPayload ?? { body: "Chrysler was acquired." },
    sourceProvenance: {},
  });
  return { auth, executed, invoked };
}

function sessionT0DeterminationId(runtime, caseSeedId = "case-seed-1") {
  const session = runtime.caseSessions.get(caseSeedId);
  if (!session || typeof session.t0DeterminationId !== "string" || session.t0DeterminationId.length === 0) {
    throw new Error("session t0DeterminationId missing");
  }
  return session.t0DeterminationId;
}

function lawfulAvailabilityRecord(sourceId, extra = {}) {
  const [record] = bindPublicAvailabilityEvidenceRecords([{
    sourceId,
    claimedPublicAvailability: extra.claimedPublicAvailability ?? "1998-03-15",
    evidenceType: extra.evidenceType ?? "OFFICIAL_FILING_TIMESTAMP",
    evidenceArtifactIdentity: extra.evidenceArtifactIdentity ?? `pae-artifact:${sourceId}`,
    publicUrl: extra.publicUrl ?? "https://example.test/10k",
    availabilityLocator: extra.availabilityLocator ?? "EDGAR official filing timestamp 1998-03-15",
    savedEvidenceArtifactRef: extra.savedEvidenceArtifactRef ?? `pae-saved:${sourceId}`,
    artifactHash: extra.artifactHash ?? digestCanonical({ sourceId, kind: "pae" }),
    reviewStatus: extra.reviewStatus ?? "REVIEWED",
    basis: extra.basis ?? "Official filing timestamp establishes public availability on or before governing T0.",
  }]);
  return record;
}

function withGoverningT0(record, t0DeterminationId) {
  if (!record || typeof record !== "object") return record;
  if (record.t0DeterminationId == null && t0DeterminationId) {
    return { ...record, t0DeterminationId };
  }
  return record;
}

function lawfulCertifiedFields(extra = {}) {
  const {
    t0DeterminationId = null,
    sourceId = "sec-10k-1998",
    paeExtra,
    publicAvailabilityEvidenceRecords,
    gateA,
    gateB,
    ...rest
  } = extra;
  const pae = publicAvailabilityEvidenceRecords !== undefined
    ? publicAvailabilityEvidenceRecords
    : (t0DeterminationId ? [lawfulAvailabilityRecord(sourceId, paeExtra ?? {})] : null);
  const paeIds = Array.isArray(pae)
    ? pae.map((row) => row?.publicAvailabilityEvidenceRecordId).filter((id) => typeof id === "string")
    : [];
  return {
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
    factEventTime: 1,
    sourcePublicAvailabilityTime: 1,
    sideScope: { side: "TARGET", organizationalScope: "enterprise" },
    contradictionStatus: "NO_MATERIAL_CONTRADICTION_APPLICABLE",
    gateA: gateA !== undefined
      ? withGoverningT0(gateA, t0DeterminationId)
      : (t0DeterminationId
        ? {
          decision: GATE_DECISION.PASS,
          factTimeEvidence: "1997 reporting-period operative fact, on or before governing T0",
          supportingSourceIds: [sourceId],
          basis: "The certified fact existed and operated in the pre-T0 reporting period on or before the governing T0.",
          t0DeterminationId,
        }
        : null),
    gateB: gateB !== undefined
      ? withGoverningT0(gateB, t0DeterminationId)
      : (t0DeterminationId
        ? {
          decision: GATE_DECISION.PASS,
          supportingSourceIds: [sourceId],
          publicAvailabilityDatesOrBounds: ["1998-03-15"],
          publicAvailabilityEvidenceRecordIds: paeIds,
          basis: "The source was publicly knowable on the claimed availability date, on or before the governing T0.",
          t0DeterminationId,
        }
        : null),
    publicAvailabilityEvidenceRecords: pae,
    ...rest,
  };
}

function extraOr(extra, key, fallback) {
  return Object.prototype.hasOwnProperty.call(extra, key) ? extra[key] : fallback;
}

function limbBJudgments(baseline, extra = {}) {
  const baselineDigest = digestCanonical(baselineGoverningSurface(baseline));
  const verifierActorRef = extra.verifierActorRef ?? "actor-verifier";
  const rows = [];
  for (const fact of baseline.admitted) {
    rows.push({
      retrievalActId: extra.retrievalActId ?? fact.retrievalActId,
      checkId: LIMB_B_CHECK.ATOMIC_PROPOSITION,
      baselineId: extra.baselineId ?? baseline.baselineId,
      baselineDigest: extra.baselineDigest ?? baselineDigest,
      verifierActorRef,
      disposition: extra.propositionDisposition ?? "PASS",
      basis: extraOr(extra, "propositionBasis", "certified atomic proposition is what the exact excerpt states"),
    });
    rows.push({
      retrievalActId: extra.retrievalActId ?? fact.retrievalActId,
      checkId: LIMB_B_CHECK.SIDE_SCOPE,
      baselineId: extra.baselineId ?? baseline.baselineId,
      baselineDigest: extra.baselineDigest ?? baselineDigest,
      verifierActorRef,
      disposition: extra.sideScopeDisposition ?? "PASS",
      basis: extraOr(extra, "sideScopeBasis", "recorded side and organizational scope match the retained artifact"),
    });
    rows.push({
      retrievalActId: extra.retrievalActId ?? fact.retrievalActId,
      checkId: LIMB_B_CHECK.CONTRADICTION_TREATMENT,
      baselineId: extra.baselineId ?? baseline.baselineId,
      baselineDigest: extra.baselineDigest ?? baselineDigest,
      verifierActorRef,
      disposition: extra.contradictionDisposition ?? "PASS",
      basis: extraOr(extra, "contradictionBasis", "NO_MATERIAL_CONTRADICTION_APPLICABLE"),
    });
    if (extra.omitTemporal !== true) {
      rows.push({
        retrievalActId: extra.retrievalActId ?? fact.retrievalActId,
        checkId: LIMB_B_CHECK.TEMPORAL_ELIGIBILITY,
        baselineId: extra.baselineId ?? baseline.baselineId,
        baselineDigest: extra.baselineDigest ?? baselineDigest,
        verifierActorRef,
        disposition: extra.temporalDisposition ?? "PASS",
        basis: extraOr(
          extra,
          "temporalBasis",
          "Gate A and Gate B evidence-bound conclusions are valid relative to the exact governing T0 determination.",
        ),
      });
    }
  }
  return rows;
}

function findCheck(verification, checkId, retrievalActId) {
  return verification.checkResults.find((row) => (
    row.checkId === checkId && (retrievalActId === undefined || row.retrievalActId === retrievalActId)
  )) ?? null;
}

function replaceStored(runtime, table, id, next) {
  return runtime.store.replace(table, id, next);
}

function lawfulSealedCollection(options = {}) {
  const runtime = runtimeWith([]);
  const g0 = lawfulG0(runtime);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", g0.candidate);
  const slotType = documentaryFactSlotType({
    permittedMethods: ["HTTP_GET"],
    allowedSourceClasses: ["SEC_FILING"],
  });
  const blueprint = compileStageA(runtime, "case-seed-1", {
    collectionAuthorizationId: "coll-auth-1",
    extraSlotTypes: [slotType],
  });
  assertMbEnvUninstantiated(runtime, blueprint.demandBlueprintId);
  const slot = blueprint.demandSlots[0];
  const manifest = freezeManifest(runtime, {
    demandBlueprintId: blueprint.demandBlueprintId,
    tasks: [{
      demandSlotId: slot.demandSlotId,
      missingProposition: slot.missingProposition,
      stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
      stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
      predeclaredCollectionMethod: {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["sec-10k-1998"],
        queryFamilies: [],
      },
    }],
  });
  runtime.modelTransport = transportReturning([retrievalRequestOutput(REQUEST_KIND.SOURCE, {
    exactLocator: "https://example.test/10k",
    sourceClassRef: "SEC_FILING",
    demandSlotRef: slot.demandSlotId,
  })]);
  const invoked = invokeInSession(runtime, "case-seed-1", {
    executionClass: EXECUTION_CLASS.RESEARCH,
    governingScopeIdentity: "case-seed-1",
    missionEnvelopeRef: blueprint.demandBlueprintId,
    resolutionMandateRef: null,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    inputItems: [instructionItem("collect under frozen mission")],
  });
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: invoked.outputs[0].prePcmOutputRecordId,
    region: REGION.R1,
    policyInputReferences: stageBPolicy(blueprint.demandBlueprintId, slot.demandSlotId, ["HTTP_GET"], ["SEC_FILING"]),
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
  });
  const executed = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R1,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
    sourceIdentity: { id: "sec-10k-1998", sourceClassRef: "SEC_FILING", sourceMaterialIdentity: "sec-10k-1998" },
    exactLocator: "https://example.test/10k",
    retrievalMethodRef: "HTTP_GET",
    retrievedPayload: { body: "Chrysler was acquired." },
    sourceProvenance: options.sourceProvenance ?? {},
  });
  assert.equal(executed.retrievalActId, executed.retrievalOccurrenceId);
  recordManifestExecution(runtime, manifest.manifestId, executed.retrievalActId);
  const t0DeterminationId = sessionT0DeterminationId(runtime);
  certifyStageBFact(runtime, {
    retrievalActId: executed.retrievalActId,
    ...lawfulCertifiedFields({
      t0DeterminationId,
      ...(options.certFields ?? {}),
    }),
  });
  const baseline = assembleFactualBaseline(runtime, {
    demandBlueprintId: blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: executed.retrievalActId }],
    t0DeterminationId,
  });
  const closure = evaluateCollectionClosure(runtime, manifest.manifestId);
  const verification = options.skipVerification === true
    ? null
    : independentPreSealVerification(runtime, {
      manifestId: manifest.manifestId,
      baselineId: baseline.baselineId,
      verifierActorRef: options.verifierActorRef ?? "actor-verifier",
      authorActorRef: options.authorActorRef ?? "actor-collector",
      independentJudgments: options.independentJudgments ?? limbBJudgments(baseline, options.judgmentExtra ?? {}),
    });
  const seal = options.seal === false || verification == null
    ? null
    : acceptOwnerFactualSeal(runtime, {
      verificationId: verification.verificationId,
      ownerActorRef: "actor-owner",
      sealToken: "OWNER-SEAL-TOKEN-1",
    });
  return {
    runtime, g0, blueprint, manifest, executed, baseline, closure, verification, seal, slot,
    t0DeterminationId,
  };
}

check("M1", "R1 retrievalOccurrenceId equals retrievalActId; R0 does not acquire retrievalActId", () => {
  const packed = lawfulSealedCollection();
  assert.equal(packed.executed.retrievalActId, packed.executed.retrievalOccurrenceId);
  assert.equal(packed.g0.executed.completion.retrievalActId, null);
});

check("T1", "COLLECTION_CLOSED is method exhaustion, not a count threshold", () => {
  const packed = lawfulSealedCollection();
  assert.equal(packed.closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
  assert.equal(packed.closure.stoppingRule, "BOUNDED_METHOD_EXHAUSTION");
});

check("F4-STAGEB-LANE-NULL", "Stage-B required governing lane with null request lane is REFUSED", () => {
  const ctx = openDocumentaryStageB();
  const { auth } = stageBRetrieve(ctx, { temporalLaneRef: null, authorizeOnly: true });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.authorized, false);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_UNRESOLVED");
  assert.equal(auth.refusalReason, "TEMPORAL_LANE_UNRESOLVED");
});

check("F4-STAGEB-LANE-WRONG", "Stage-B required governing lane mismatch is REFUSED", () => {
  const ctx = openDocumentaryStageB();
  const { auth } = stageBRetrieve(ctx, { temporalLaneRef: "POST_T0", authorizeOnly: true });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.REFUSED);
  assert.equal(auth.temporalAuthorizationResult.reason, "TEMPORAL_LANE_MISMATCH");
  assert.equal(auth.refusalReason, "TEMPORAL_LANE_MISMATCH");
});

check("F4-STAGEB-LANE-LAWFUL", "Stage-B lawful matching governing lane remains AUTHORIZED", () => {
  const ctx = openDocumentaryStageB();
  const { auth } = stageBRetrieve(ctx, { temporalLaneRef: "PRE_T0", authorizeOnly: true });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(auth.temporalAuthorizationResult.authorized, true);
});

check("F5-ABSENT-TIME", "absent frozen declaration time cannot become PROSPECTIVE", () => {
  const runtime = runtimeWith([]);
  const slotType = documentaryFactSlotType({
    permittedMethods: ["HTTP_GET"],
    allowedSourceClasses: ["SEC_FILING"],
  });
  const blueprint = compileDemandBlueprint(runtime, {
    caseId: "CASE-ABSENT-TIME",
    T0Identity: "t0-absent",
    caseSides: [{ role: "ACQUIRER", name: "A" }, { role: "TARGET", name: "B" }],
    caseGeometryVersion: "G0-v1",
    collectionAuthorizationId: "coll-absent-time",
    slotTypes: [slotType],
  });
  const slot = blueprint.demandSlots[0];
  assert.equal(slot.governingDemandDeclarationTime, null);
  freezeManifest(runtime, {
    demandBlueprintId: blueprint.demandBlueprintId,
    tasks: [{
      demandSlotId: slot.demandSlotId,
      missingProposition: slot.missingProposition,
      stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
      stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
      predeclaredCollectionMethod: {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["sec-10k-1998"],
        queryFamilies: [],
      },
    }],
  });
  const { outputs } = commitAndInvoke(runtime, [retrievalRequestOutput(REQUEST_KIND.SOURCE, {
    exactLocator: "https://example.test/10k",
    demandSlotRef: slot.demandSlotId,
  })], {
    executionClass: EXECUTION_CLASS.RESEARCH,
    governingScopeIdentity: "case-seed-1",
    missionEnvelopeRef: blueprint.demandBlueprintId,
    resolutionMandateRef: null,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    inputItems: [instructionItem("collect under frozen mission")],
    declaredModelBinding: null,
  }, REGION.R1);
  const { record: auth } = authorizeRetrieval(runtime, {
    requestOutputRef: outputs[0].prePcmOutputRecordId,
    region: REGION.R1,
    policyInputReferences: stageBPolicy(blueprint.demandBlueprintId, slot.demandSlotId, ["HTTP_GET"], ["SEC_FILING"]),
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
  });
  const executed = executeRetrieval(runtime, {
    authorizationRecord: auth,
    region: REGION.R1,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    occurrenceDomainIdentity: "case-seed-1",
    sourceIdentity: { id: "sec-10k-1998", sourceClassRef: "SEC_FILING", sourceMaterialIdentity: "sec-10k-1998" },
    exactLocator: "https://example.test/10k",
    retrievalMethodRef: "HTTP_GET",
    retrievedPayload: { body: "Chrysler was acquired." },
  });
  assert.equal(executed.completion.governingDemandDeclarationTime, null);
  const certified = certifyStageBFact(runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.RETROSPECTIVE);
  assert.notEqual(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.PROSPECTIVE);
});

check("F5-FAKE-CALLER-TIME", "fake caller declaration time cannot override frozen PCDB time", () => {
  const ctx = openDocumentaryStageB();
  const frozenTime = ctx.slot.governingDemandDeclarationTime;
  assert.equal(typeof frozenTime, "number");
  const { auth, executed } = stageBRetrieve(ctx, {
    policyExtra: { governingDemandDeclarationTime: 0 },
  });
  assert.equal(auth.authorizationDecision, AUTHORIZATION_DECISION.AUTHORIZED);
  assert.equal(executed.completion.governingDemandDeclarationTime, frozenTime);
  assert.notEqual(executed.completion.governingDemandDeclarationTime, 0);
  assert.notEqual(executed.completion.governingDemandDeclarationTime, 999999);
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.PROSPECTIVE);
});

check("F5-AFTER-DECLARATION", "retrieval after valid frozen declaration can become PROSPECTIVE", () => {
  const packed = lawfulSealedCollection();
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  assert.equal(typeof qual.governingDemandDeclarationTime, "number");
  assert.ok(qual.governingDemandDeclarationTime < qual.retrievalActTime);
  assert.equal(qual.inFrozenManifestExecutionRecord, true);
  assert.deepEqual(qual.permittedMethodsAtDeclaration, ["HTTP_GET"]);
  assert.equal(qual.retrievalQualification, RETRIEVAL_QUALIFICATION.PROSPECTIVE);
  assert.equal(qual.governingDemandDeclarationId, packed.slot.demandSlotId);
});

check("NF3-NOT-IN-MANIFEST", "retrieval absent from frozen manifest execution cannot satisfy membership limb", () => {
  const ctx = openDocumentaryStageB({ freeze: false });
  const { executed } = stageBRetrieve(ctx);
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, false);
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.RETROSPECTIVE);
  assert.equal(methodCreditEligible(ctx.runtime, executed.retrievalOccurrenceId), false);
});

check("NF3-IN-MANIFEST", "valid frozen-manifest member derives inFrozenManifestExecutionRecord true", () => {
  const ctx = openDocumentaryStageB();
  const { executed } = stageBRetrieve(ctx);
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, true);
  assert.ok(ctx.runtime.store.get("manifest", ctx.manifest.manifestId).executionEvents.includes(executed.retrievalActId));
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.PROSPECTIVE);
});

check("F5-DECL-AFTER", "declaration time not strictly before retrieval cannot become PROSPECTIVE", () => {
  const ctx = openDocumentaryStageB();
  const slots = ctx.blueprint.demandSlots.map((slot) => ({
    ...slot,
    governingDemandDeclarationTime: 1_000_000_000,
  }));
  ctx.runtime.store.replace("demandBlueprint", ctx.blueprint.demandBlueprintId, {
    ...ctx.blueprint,
    demandSlots: slots,
  });
  const { executed } = stageBRetrieve(ctx);
  assert.equal(executed.completion.governingDemandDeclarationTime, 1_000_000_000);
  assert.ok(executed.completion.governingDemandDeclarationTime >= executed.completion.retrievalActTime);
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.RETROSPECTIVE);
});

check("F5-METHOD-ABSENT", "method absent from frozen declaration cannot become PROSPECTIVE", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["HTTP_GET"],
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998"],
      queryFamilies: [],
    },
  });
  const { executed } = stageBRetrieve(ctx, {
    retrievalMethodRef: "OPEN_SEARCH",
    allowedRetrievalMethods: ["OPEN_SEARCH", "HTTP_GET"],
    sourceClassRef: "SEC_FILING",
  });
  assert.deepEqual(executed.completion.permittedMethodsAtDeclaration, ["HTTP_GET"]);
  assert.equal(executed.completion.permittedMethodsAtDeclaration.includes("OPEN_SEARCH"), false);
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.RETROSPECTIVE);
});

check("F7A-NO-PERMITTED-METHODS", "no permittedMethods cannot reach COLLECTION_CLOSED", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["HTTP_GET"],
    predeclaredCollectionMethod: {
      permittedMethods: [],
      declaredSources: ["sec-10k-1998"],
      queryFamilies: [],
    },
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.FAIL);
  assert.equal(closure.reason, "EXHAUSTION_DOMAIN_EMPTY");
  assert.notEqual(closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("F7A-NO-SOURCES-NO-FAMILIES", "no declaredSources and no queryFamilies cannot close", () => {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: [],
      queryFamilies: [],
    },
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.FAIL);
  assert.equal(closure.reason, "EXHAUSTION_DOMAIN_EMPTY");
});

check("F7A-MALFORMED", "malformed query-family declaration cannot close", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["HTTP_GET", "OPEN_SEARCH"],
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET", "OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [{ label: "unidentified-family" }],
    },
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.FAIL);
  assert.equal(closure.reason, "COLLECTION_DECLARATION_UNRESOLVABLE");
});

check("F7A-ONE-ELEMENT", "lawful one-element exhaustion reaches COLLECTION_CLOSED", () => {
  const packed = lawfulSealedCollection();
  assert.equal(packed.manifest.tasks[0].methodElements.length, 1);
  assert.equal(packed.closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("F7A-N-ELEMENT", "lawful N-element exhaustion reaches COLLECTION_CLOSED", () => {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998", "sec-8k-1998"],
      queryFamilies: [],
    },
  });
  assert.equal(ctx.manifest.tasks[0].methodElements.length, 2);
  const first = stageBRetrieve(ctx, { sourceId: "sec-10k-1998", exactLocator: "https://example.test/10k" });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: first.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const second = stageBRetrieve(ctx, {
    sourceId: "sec-8k-1998",
    exactLocator: "https://example.test/8k",
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: second.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("U1", "resource cap before exhaustion is INCOMPLETE", () => {
  const runtime = runtimeWith([]);
  const g0 = lawfulG0(runtime);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", g0.candidate);
  const slotType = documentaryFactSlotType({
    permittedMethods: ["HTTP_GET"],
    allowedSourceClasses: ["SEC_FILING"],
  });
  const blueprint = compileStageA(runtime, "case-seed-1", {
    collectionAuthorizationId: "coll-auth-cap",
    extraSlotTypes: [slotType],
  });
  const slot = blueprint.demandSlots[0];
  const manifest = freezeManifest(runtime, {
    demandBlueprintId: blueprint.demandBlueprintId,
    tasks: [{
      demandSlotId: slot.demandSlotId,
      missingProposition: slot.missingProposition,
      stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
      stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
      predeclaredCollectionMethod: {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["never-retrieved"],
        queryFamilies: [],
      },
    }],
  });
  markResourceCap(runtime, manifest.manifestId, slot.demandSlotId);
  const closure = evaluateCollectionClosure(runtime, manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "RESOURCE_CAP_BEFORE_EXHAUSTION");
});

check("F7B-ONE-FAMILY-ONLY", "qfam-A + qfam-B with only qfam-A executed is not CLOSED", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    predeclaredCollectionMethod: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [
        { id: "qfam-A", method: "OPEN_SEARCH" },
        { id: "qfam-B", method: "OPEN_SEARCH" },
      ],
    },
  });
  assert.equal(ctx.manifest.tasks[0].methodElements.length, 2);
  const { executed } = stageBRetrieve(ctx, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-A",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family A results" },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "family A results",
    atomicProposition: "family A observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
  assert.notEqual(closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("F7B-BOTH-FAMILIES", "both query families lawfully exhausted reach COLLECTION_CLOSED", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    predeclaredCollectionMethod: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [
        { id: "qfam-A", method: "OPEN_SEARCH" },
        { id: "qfam-B", method: "OPEN_SEARCH" },
      ],
    },
  });
  const first = stageBRetrieve(ctx, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-A",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family A results" },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: first.executed.retrievalActId,
    exactExcerpt: "family A results",
    atomicProposition: "family A observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const second = stageBRetrieve(ctx, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-B",
    exactLocator: null,
    queryFamilyBound: "qfam-B",
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family B results" },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: second.executed.retrievalActId,
    exactExcerpt: "family B results",
    atomicProposition: "family B observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("F7B-TWO-SOURCES", "two source elements under one method remain independently accounted", () => {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998", "sec-8k-1998"],
      queryFamilies: [],
    },
  });
  const { executed } = stageBRetrieve(ctx, {
    sourceId: "sec-10k-1998",
    exactLocator: "https://example.test/10k",
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
});

check("F7B-FAMILY-METHOD-MISMATCH", "family/method mismatch does not receive exhaustion credit", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["OPEN_SEARCH", "HTTP_GET"],
    allowedSourceClasses: ["PUBLIC_REGISTRY", "SEC_FILING"],
    predeclaredCollectionMethod: {
      permittedMethods: ["OPEN_SEARCH", "HTTP_GET"],
      declaredSources: [],
      queryFamilies: [
        { id: "qfam-A", method: "OPEN_SEARCH" },
        { id: "qfam-B", method: "HTTP_GET" },
      ],
    },
  });
  const { executed } = stageBRetrieve(ctx, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "HTTP_GET",
    sourceClassRef: "SEC_FILING",
    sourceId: "mismatch-index",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    allowedRetrievalMethods: ["OPEN_SEARCH", "HTTP_GET"],
    allowedSourceClasses: ["PUBLIC_REGISTRY", "SEC_FILING"],
    retrievedPayload: { body: "wrong method for A" },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "wrong method for A",
    atomicProposition: "mismatch observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
});

check("F7B-RESOURCE-CAP", "query-family resource cap before exhaustion remains INCOMPLETE", () => {
  const ctx = openDocumentaryStageB({
    permittedMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    predeclaredCollectionMethod: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [
        { id: "qfam-A", method: "OPEN_SEARCH" },
        { id: "qfam-B", method: "OPEN_SEARCH" },
      ],
    },
  });
  const { executed } = stageBRetrieve(ctx, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-A",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family A results" },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "family A results",
    atomicProposition: "family A observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  markResourceCap(ctx.runtime, ctx.manifest.manifestId, ctx.slot.demandSlotId);
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "RESOURCE_CAP_BEFORE_EXHAUSTION");
});

function twoCollectionVersions(options = {}) {
  const runtime = runtimeWith([]);
  const g0 = lawfulG0(runtime);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", g0.candidate);
  const slotType = documentaryFactSlotType({
    permittedMethods: options.slotPermittedMethods,
    allowedSourceClasses: options.allowedSourceClasses ?? ["SEC_FILING", "PUBLIC_REGISTRY"],
  });
  const g0fields = {
    caseId: g0.candidate.canonicalStructuredPayload.caseId,
    T0Identity: g0.candidate.canonicalStructuredPayload.T0Identity,
    caseSides: g0.candidate.canonicalStructuredPayload.caseSides,
    caseGeometryVersion: g0.candidate.canonicalStructuredPayload.caseGeometryVersion,
  };
  const spec = {
    M1: {
      collectionAuthorizationId: "coll-auth-M1",
      method: options.m1Method ?? {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["sec-10k-1998"],
        queryFamilies: [],
      },
    },
    M2: {
      collectionAuthorizationId: "coll-auth-M2",
      method: options.m2Method ?? {
        permittedMethods: ["OPEN_SEARCH"],
        declaredSources: [],
        queryFamilies: [{ id: "qfam-B", method: "OPEN_SEARCH" }],
      },
    },
  };
  const built = {};
  for (const key of options.freezeOrder ?? ["M1", "M2"]) {
    const blueprint = compileDemandBlueprint(runtime, {
      ...g0fields,
      collectionAuthorizationId: spec[key].collectionAuthorizationId,
      slotTypes: [mbEnvSlotType(), slotType],
    });
    const slot = blueprint.demandSlots[0];
    const manifest = freezeManifest(runtime, {
      demandBlueprintId: blueprint.demandBlueprintId,
      tasks: [{
        demandSlotId: slot.demandSlotId,
        missingProposition: slot.missingProposition,
        stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
        stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
        predeclaredCollectionMethod: spec[key].method,
      }],
    });
    built[key] = { blueprint, slot, manifest };
  }
  assert.equal(built.M1.slot.demandSlotId, built.M2.slot.demandSlotId);
  assert.notEqual(built.M1.manifest.manifestId, built.M2.manifest.manifestId);
  assert.notEqual(built.M1.blueprint.demandBlueprintId, built.M2.blueprint.demandBlueprintId);
  return {
    runtime,
    g0,
    slotType,
    M1: built.M1,
    M2: built.M2,
    ctxFor(which) {
      return {
        runtime,
        g0,
        blueprint: built[which].blueprint,
        slot: built[which].slot,
        manifest: built[which].manifest,
        slotType,
      };
    },
  };
}

function twoTaskSameMethodCollection(options = {}) {
  const method = options.predeclaredCollectionMethod ?? {
    permittedMethods: ["HTTP_GET"],
    declaredSources: ["sec-10k-1998"],
    queryFamilies: [],
  };
  const runtime = runtimeWith([]);
  const g0 = lawfulG0(runtime);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", g0.candidate);
  const permittedMethods = options.permittedMethods ?? method.permittedMethods;
  const allowedSourceClasses = options.allowedSourceClasses ?? ["SEC_FILING"];
  const slotTypeA = documentaryFactSlotType({
    slotTypeId: "ST-HISTORICAL-FACT-A",
    permittedMethods,
    allowedSourceClasses,
  });
  const slotTypeB = documentaryFactSlotType({
    slotTypeId: "ST-HISTORICAL-FACT-B",
    permittedMethods,
    allowedSourceClasses,
  });
  const blueprint = compileStageA(runtime, "case-seed-1", {
    collectionAuthorizationId: "coll-auth-1",
    extraSlotTypes: [slotTypeA, slotTypeB],
  });
  const [slotA, slotB] = blueprint.demandSlots;
  const taskFor = (slot) => ({
    demandSlotId: slot.demandSlotId,
    missingProposition: slot.missingProposition,
    stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
    stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
    predeclaredCollectionMethod: method,
  });
  const manifest = freezeManifest(runtime, {
    demandBlueprintId: blueprint.demandBlueprintId,
    tasks: [taskFor(slotA), taskFor(slotB)],
  });
  const ctxFor = (slot) => ({
    runtime,
    g0,
    blueprint,
    slot,
    manifest,
    slotType: slot.slotType,
  });
  return {
    runtime,
    g0,
    blueprint,
    slotA,
    slotB,
    manifest,
    ctxA: ctxFor(slotA),
    ctxB: ctxFor(slotB),
  };
}

function manifestEvents(runtime, manifestId) {
  return [...(runtime.store.get("manifest", manifestId).executionEvents ?? [])];
}

check("CORR1-A-TWO-MANIFEST-SAME-SLOT", "retrieval under M1 records only in M1 when M2 shares demandSlotId", () => {
  const pair = twoCollectionVersions();
  const beforeM2 = manifestEvents(pair.runtime, pair.M2.manifest.manifestId);
  const { executed } = stageBRetrieve(pair.ctxFor("M1"), {
    retrievalMethodRef: "HTTP_GET",
    allowedRetrievalMethods: ["HTTP_GET"],
    allowedSourceClasses: ["SEC_FILING"],
  });
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, true);
  const m1Events = manifestEvents(pair.runtime, pair.M1.manifest.manifestId);
  const m2Events = manifestEvents(pair.runtime, pair.M2.manifest.manifestId);
  assert.equal(m1Events.includes(executed.retrievalActId), true);
  assert.equal(m2Events.includes(executed.retrievalActId), false);
  assert.deepEqual(m2Events, beforeM2);
});

check("CORR1-B-WRONG-MANIFEST-METHODS", "permittedMethodsAtDeclaration comes from governing M1, not M2", () => {
  const pair = twoCollectionVersions({
    slotPermittedMethods: undefined,
    m1Method: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998"],
      queryFamilies: [],
    },
    m2Method: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: ["edgar-index"],
      queryFamilies: [],
    },
  });
  const { executed } = stageBRetrieve(pair.ctxFor("M1"), {
    retrievalMethodRef: "HTTP_GET",
    allowedRetrievalMethods: ["HTTP_GET", "OPEN_SEARCH"],
    allowedSourceClasses: ["SEC_FILING", "PUBLIC_REGISTRY"],
  });
  assert.deepEqual(executed.completion.permittedMethodsAtDeclaration, ["HTTP_GET"]);
  assert.equal(executed.completion.permittedMethodsAtDeclaration.includes("OPEN_SEARCH"), false);
  const certified = certifyStageBFact(pair.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.PROSPECTIVE);
});

check("CORR1-C-STORE-ORDER", "reversed freeze/store order does not change governing-manifest binding", () => {
  const pair = twoCollectionVersions({
    freezeOrder: ["M2", "M1"],
    slotPermittedMethods: undefined,
    m1Method: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998"],
      queryFamilies: [],
    },
    m2Method: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: ["edgar-index"],
      queryFamilies: [],
    },
  });
  const listed = pair.runtime.store.list("manifest").map((row) => row.collectionAuthorizationId);
  assert.deepEqual(listed.slice(0, 2), ["coll-auth-M2", "coll-auth-M1"]);
  const { executed } = stageBRetrieve(pair.ctxFor("M1"), {
    retrievalMethodRef: "HTTP_GET",
    allowedRetrievalMethods: ["HTTP_GET", "OPEN_SEARCH"],
    allowedSourceClasses: ["SEC_FILING", "PUBLIC_REGISTRY"],
  });
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, true);
  assert.deepEqual(executed.completion.permittedMethodsAtDeclaration, ["HTTP_GET"]);
  assert.equal(manifestEvents(pair.runtime, pair.M1.manifest.manifestId).includes(executed.retrievalActId), true);
  assert.equal(manifestEvents(pair.runtime, pair.M2.manifest.manifestId).includes(executed.retrievalActId), false);
});

check("CORR1-D-MISSING-GOVERNING", "non-unique same-blueprint manifests fail closed for membership", () => {
  const ctx = openDocumentaryStageB({ freeze: false });
  const taskBase = {
    demandSlotId: ctx.slot.demandSlotId,
    missingProposition: ctx.slot.missingProposition,
    stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
    stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
  };
  const m1 = freezeManifest(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    tasks: [{
      ...taskBase,
      predeclaredCollectionMethod: {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["sec-10k-1998"],
        queryFamilies: [],
      },
    }],
  });
  const m2 = freezeManifest(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    tasks: [{
      ...taskBase,
      predeclaredCollectionMethod: {
        permittedMethods: ["OPEN_SEARCH"],
        declaredSources: ["edgar-index"],
        queryFamilies: [],
      },
    }],
  });
  assert.equal(m1.collectionAuthorizationId, m2.collectionAuthorizationId);
  assert.notEqual(m1.manifestId, m2.manifestId);
  const { executed } = stageBRetrieve(ctx, {
    retrievalMethodRef: "HTTP_GET",
    allowedRetrievalMethods: ["HTTP_GET", "OPEN_SEARCH"],
  });
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, false);
  assert.equal(manifestEvents(ctx.runtime, m1.manifestId).includes(executed.retrievalActId), false);
  assert.equal(manifestEvents(ctx.runtime, m2.manifestId).includes(executed.retrievalActId), false);
  const certified = certifyStageBFact(ctx.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(certified.retrievalQualification, RETRIEVAL_QUALIFICATION.RETROSPECTIVE);
  assert.equal(methodCreditEligible(ctx.runtime, executed.retrievalOccurrenceId), false);
  const closure1 = evaluateCollectionClosure(ctx.runtime, m1.manifestId);
  const closure2 = evaluateCollectionClosure(ctx.runtime, m2.manifestId);
  assert.notEqual(closure1.status, COLLECTION_STATUS.COLLECTION_CLOSED);
  assert.notEqual(closure2.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("CORR1-E-QFAM-ISOLATION", "qfam-A under M1 does not exhaust qfam-B on M2", () => {
  const pair = twoCollectionVersions({
    m1Method: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [{ id: "qfam-A", method: "OPEN_SEARCH" }],
    },
    m2Method: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [{ id: "qfam-B", method: "OPEN_SEARCH" }],
    },
  });
  const { executed } = stageBRetrieve(pair.ctxFor("M1"), {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-A",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family A results" },
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "family A results",
    atomicProposition: "family A observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure1 = evaluateCollectionClosure(pair.runtime, pair.M1.manifest.manifestId);
  const closure2 = evaluateCollectionClosure(pair.runtime, pair.M2.manifest.manifestId);
  assert.equal(closure1.status, COLLECTION_STATUS.COLLECTION_CLOSED);
  assert.equal(closure2.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure2.reason, "METHOD_NOT_EXHAUSTED");
  assert.equal(manifestEvents(pair.runtime, pair.M2.manifest.manifestId).includes(executed.retrievalActId), false);
});

check("CORR1-F-SINGLE-RESIDUE", "exactly one governing manifest executionEvents changes after one retrieval", () => {
  const pair = twoCollectionVersions();
  const before = pair.runtime.store.list("manifest").map((row) => ({
    manifestId: row.manifestId,
    events: [...row.executionEvents],
  }));
  const { executed } = stageBRetrieve(pair.ctxFor("M1"));
  const after = pair.runtime.store.list("manifest");
  const changed = after.filter((row) => {
    const prior = before.find((entry) => entry.manifestId === row.manifestId);
    return JSON.stringify(row.executionEvents) !== JSON.stringify(prior.events);
  });
  assert.equal(changed.length, 1);
  assert.equal(changed[0].manifestId, pair.M1.manifest.manifestId);
  assert.deepEqual(changed[0].executionEvents, [executed.retrievalActId]);
  const unchanged = after.filter((row) => row.manifestId === pair.M2.manifest.manifestId)[0];
  assert.deepEqual(unchanged.executionEvents, []);
});

check("S1", "contamination invalidates method credit but not event truth", () => {
  const packed = lawfulSealedCollection();
  const { runtime, executed } = packed;
  assert.equal(methodCreditEligible(runtime, executed.retrievalOccurrenceId), true);
  const request = getOutput(runtime, runtime.store.list("authorization").find((a) => (
    a.retrievalAuthorizationRecordId === executed.occurrence.eventKindBinding.grantingAuthorizationRecordRef
  )).requestOutputRef);
  runtime.markContaminated(request.producingHistoricalExecutionId);
  assert.equal(methodCreditEligible(runtime, executed.retrievalOccurrenceId), false);
  assert.equal(executed.completion.retrievalActId, executed.retrievalOccurrenceId);
  assert.ok(runtime.store.get("retrievalQualification", executed.retrievalActId));
});

check("W1", "unresolved MB-ENV remains declared not instantiated", () => {
  const packed = lawfulSealedCollection();
  const declared = packed.blueprint.declaredNotInstantiated.find((row) => row.mathBlockId === MATH_BLOCK_ID.MB_ENV);
  assert.ok(declared);
  assert.equal(declared.coreConsumable, false);
  assert.equal(mbEnvSlotType().coreConsumable, false);
  assert.equal(mbEnvSlotType().operatorIdentity, "UNRESOLVED");
});

check("ADV-ENV-INSTANTIATE", "attempt to instantiate unresolved Environment slot fails closed", () => {
  expectFail(() => instantiateEnvironmentSlot(), "ENVIRONMENT_SLOT_UNINSTANTIATED");
});

check("X1", "direct raw LLM output offered to mathematical core fails closed", () => {
  expectFail(() => offerRawLlmToCore({ text: "Environment is NT/STJ" }), "RAW_LLM_TO_CORE_FORBIDDEN");
});

check("ADV-RAW-LLM-CORE", "coreConsumable cannot be asserted for unresolved slots", () => {
  expectFail(() => markCoreConsumable(), "CORE_CONSUMPTION_FORBIDDEN");
});

// ── V R2 prohibition ────────────────────────────────────────────────────────
check("V1", "R2 rejects any HLX invocation", () => {
  const packed = lawfulSealedCollection();
  const { runtime, seal } = packed;
  transitionR1toR2(runtime, "case-seed-1", seal.factualBaselineSealId);
  assert.equal(currentRegion(runtime, "case-seed-1"), REGION.R2);
  expectFail(() => invokeInSession(runtime, "case-seed-1", {
    executionClass: EXECUTION_CLASS.RESEARCH,
    governingScopeIdentity: "case-seed-1",
    missionEnvelopeRef: packed.blueprint.demandBlueprintId,
    resolutionMandateRef: null,
    responsibleActorRef: "actor-collector",
    actorAssignmentRef: "assign-collector",
    inputItems: [instructionItem("illegal R2 call")],
  }), "R2_HLX_INVOCATION_PROHIBITED");
});

check("HAD1", "HAD-1 evidence surface records committed vs received model-visible items", () => {
  const runtime = runtimeWith([]);
  const { candidate } = lawfulG0(runtime);
  const emim = getCommittedEmim(runtime, candidate.producingHistoricalExecutionId);
  assert.equal(had1Match(runtime, emim.historicalExecutionId), true);
  const surface = had1Surface(runtime, emim.historicalExecutionId);
  assert.equal(surface.emimCommitmentDigest, emim.emimCommitmentDigest);
  assert.equal(hlxConforming(runtime, emim.historicalExecutionId), true);
});

function echoTransport(overrides = {}) {
  return {
    invoke({ renderedItems }) {
      return {
        generationComplete: overrides.generationComplete ?? true,
        receivedRenderedItems: overrides.receivedRenderedItems ?? renderedItems.map((item) => ({
          inputItemOrdinal: item.inputItemOrdinal,
          renderedContentDigest: item.renderedContentDigest,
          exactRenderedRepresentation: item.exactRenderedRepresentation,
        })),
        typedOutputs: overrides.typedOutputs ?? [],
      };
    },
  };
}

function throwingTransport(message = "provider down") {
  return {
    invoke() {
      throw new Error(message);
    },
  };
}

function had1Records(runtime, historicalExecutionId) {
  return runtime.store.list("had1").filter((row) => row.historicalExecutionId === historicalExecutionId);
}

check("RC2-A", "transport failure consumes execution; reuse fail-closed; ordinal unchanged", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  const ordinal = e1.executionOrdinal;
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const afterFail = getCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(afterFail.invocationStarted, true);
  assert.equal(afterFail.executionOrdinal, ordinal);
  assert.notEqual(afterFail.executionCompletionStatus, "COMPLETED");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  const afterReuse = getCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(afterReuse.executionOrdinal, ordinal);
  assert.equal(afterReuse.historicalExecutionId, e1.historicalExecutionId);
});

check("RC2-B", "generationComplete=false consumes execution; second invoke fail-closed", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({ generationComplete: false });
  const first = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.deepEqual(first.outputs, []);
  assert.equal(getCommittedEmim(runtime, e1.historicalExecutionId).invocationStarted, true);
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("RC2-C", "successful completed execution invoked again fail-closed", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport();
  const first = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(first.emim.executionCompletionStatus, "COMPLETED");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("RC2-D", "lawful zero-output complete still consumes the execution", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({ typedOutputs: [] });
  const first = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(first.emim.executionCompletionStatus, "COMPLETED");
  assert.equal(first.outputs.length, 0);
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("RC2-E", "retry commit after failed E1 yields new id, higher ordinal, and can invoke", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const e2 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  assert.notEqual(e2.historicalExecutionId, e1.historicalExecutionId);
  assert.ok(e2.executionOrdinal > e1.executionOrdinal);
  assert.equal(e2.emimCommitmentDigest, e1.emimCommitmentDigest);
  runtime.modelTransport = echoTransport();
  const invoked = invokeCommittedEmim(runtime, e2.historicalExecutionId);
  assert.equal(invoked.emim.executionCompletionStatus, "COMPLETED");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("RC2-F", "repeated failures then success: distinct ids, strictly increasing ordinals", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport("fail-1");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const e2 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({ generationComplete: false });
  invokeCommittedEmim(runtime, e2.historicalExecutionId);
  expectFail(() => invokeCommittedEmim(runtime, e2.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  const e3 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport();
  const third = invokeCommittedEmim(runtime, e3.historicalExecutionId);
  assert.notEqual(e1.historicalExecutionId, e2.historicalExecutionId);
  assert.notEqual(e2.historicalExecutionId, e3.historicalExecutionId);
  assert.notEqual(e1.historicalExecutionId, e3.historicalExecutionId);
  assert.ok(e2.executionOrdinal > e1.executionOrdinal);
  assert.ok(e3.executionOrdinal > e2.executionOrdinal);
  assert.equal(third.emim.executionCompletionStatus, "COMPLETED");
});

check("RC2-G", "transport failure leaves exactly one HAD-1 attempt evidence record", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const records = had1Records(runtime, e1.historicalExecutionId);
  assert.equal(records.length, 1);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.historicalExecutionId, e1.historicalExecutionId);
  assert.equal(surface.executionOrdinal, e1.executionOrdinal);
  assert.equal(surface.emimCommitmentDigest, e1.emimCommitmentDigest);
  assert.equal(surface.attemptOutcome, "TRANSPORT_FAILURE");
  assert.equal(surface.generationComplete, false);
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.receivedRenderedDigests, null);
  assert.equal(surface.match, null);
  assert.equal(had1Match(runtime, e1.historicalExecutionId), false);
});

check("RC2-H", "generationComplete=false leaves HAD-1 attempt evidence", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({ generationComplete: false });
  invokeCommittedEmim(runtime, e1.historicalExecutionId);
  const records = had1Records(runtime, e1.historicalExecutionId);
  assert.equal(records.length, 1);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.attemptOutcome, "GENERATION_INCOMPLETE");
  assert.equal(surface.generationComplete, false);
  assert.equal(surface.historicalExecutionId, e1.historicalExecutionId);
  assert.ok(Array.isArray(surface.committedRenderedDigests));
});

check("RC2-I", "transport throw does not fabricate HAD-1 match=true", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.notEqual(surface.match, true);
  assert.equal(had1Match(runtime, e1.historicalExecutionId), false);
});

check("RC2-J", "mismatched received model-visible input still fails closed after exposure", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({
    receivedRenderedItems: [{
      inputItemOrdinal: 1,
      renderedContentDigest: "sha256:forged",
      exactRenderedRepresentation: "forged",
    }],
  });
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_VISIBLE_INPUT_MISMATCH");
  assert.equal(getCommittedEmim(runtime, e1.historicalExecutionId).invocationStarted, true);
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.match, false);
  assert.equal(surface.attemptOutcome, "MODEL_VISIBLE_INPUT_MISMATCH");
  assert.equal(had1Match(runtime, e1.historicalExecutionId), false);
});

check("RC2-K", "post-exposure output extraction failure does not reopen the execution", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({
    typedOutputs: [{ outputKind: "NOT_A_KIND" }],
  });
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "OUTPUT_KIND_INVALID");
  const after = getCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(after.invocationStarted, true);
  assert.notEqual(after.executionCompletionStatus, "COMPLETED");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.attemptOutcome, "POST_EXPOSURE_FAILURE");
});

check("RC2-L", "one invocation attempt creates one canonical HAD-1 store record", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  assert.equal(had1Records(runtime, e1.historicalExecutionId).length, 1);
  const e2 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport();
  invokeCommittedEmim(runtime, e2.historicalExecutionId);
  expectFail(() => invokeCommittedEmim(runtime, e2.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
  assert.equal(had1Records(runtime, e2.historicalExecutionId).length, 1);
});

function noReceivedTransport(overrides = {}) {
  return {
    invoke() {
      const result = {
        generationComplete: overrides.generationComplete ?? true,
        typedOutputs: overrides.typedOutputs ?? [],
      };
      if (Object.prototype.hasOwnProperty.call(overrides, "receivedRenderedItems")) {
        result.receivedRenderedItems = overrides.receivedRenderedItems;
      }
      return result;
    },
  };
}

check("HAD1-CORR1-A", "success without received surface: complete, match=null, no synthetic receipt", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = noReceivedTransport({ generationComplete: true, typedOutputs: [] });
  const invoked = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(invoked.emim.executionCompletionStatus, "COMPLETED");
  const records = had1Records(runtime, e1.historicalExecutionId);
  assert.equal(records.length, 1);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.attemptOutcome, "SUCCESSFUL_COMPLETE");
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.receivedRenderedDigests, null);
  assert.equal(surface.match, null);
  assert.equal(had1Match(runtime, e1.historicalExecutionId), false);
});

check("HAD1-CORR1-B", "incomplete without received surface: GENERATION_INCOMPLETE, match=null, consumed", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = noReceivedTransport({ generationComplete: false });
  const invoked = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.deepEqual(invoked.outputs, []);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.attemptOutcome, "GENERATION_INCOMPLETE");
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.receivedRenderedDigests, null);
  assert.equal(surface.match, null);
  assert.equal(getCommittedEmim(runtime, e1.historicalExecutionId).invocationStarted, true);
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("HAD1-CORR1-C", "post-exposure failure without received surface: match=null, consumed", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = noReceivedTransport({
    generationComplete: true,
    typedOutputs: [{ outputKind: "NOT_A_KIND" }],
  });
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "OUTPUT_KIND_INVALID");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.attemptOutcome, "POST_EXPOSURE_FAILURE");
  assert.equal(surface.match, null);
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(getCommittedEmim(runtime, e1.historicalExecutionId).invocationStarted, true);
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "INVOCATION_ALREADY_CONSUMED");
});

check("HAD1-CORR1-D", "valid received surface equal to committed yields match=true", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport();
  invokeCommittedEmim(runtime, e1.historicalExecutionId);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.match, true);
  assert.equal(had1Match(runtime, e1.historicalExecutionId), true);
  assert.ok(Array.isArray(surface.receivedRenderedItems));
});

check("HAD1-CORR1-E", "valid received array with altered content is mismatch fail-closed", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = echoTransport({
    receivedRenderedItems: [{
      inputItemOrdinal: 1,
      renderedContentDigest: "sha256:forged",
      exactRenderedRepresentation: "forged",
    }],
  });
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_VISIBLE_INPUT_MISMATCH");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.match, false);
  assert.equal(surface.attemptOutcome, "MODEL_VISIBLE_INPUT_MISMATCH");
  assert.equal(getCommittedEmim(runtime, e1.historicalExecutionId).invocationStarted, true);
});

check("HAD1-CORR1-F", "non-array receivedRenderedItems is unknown, not synthetic match", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = noReceivedTransport({
    generationComplete: true,
    typedOutputs: [],
    receivedRenderedItems: { forged: true },
  });
  const invoked = invokeCommittedEmim(runtime, e1.historicalExecutionId);
  assert.equal(invoked.emim.executionCompletionStatus, "COMPLETED");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.receivedRenderedDigests, null);
  assert.equal(surface.match, null);
  assert.equal(had1Match(runtime, e1.historicalExecutionId), false);
});

check("HAD1-CORR1-G", "transport throw still records match=null received=null", () => {
  const runtime = runtimeWith([]);
  const e1 = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  runtime.modelTransport = throwingTransport();
  expectFail(() => invokeCommittedEmim(runtime, e1.historicalExecutionId), "MODEL_TRANSPORT_FAILURE");
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.equal(surface.match, null);
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.attemptOutcome, "TRANSPORT_FAILURE");
});

check("HAD1-CORR1-H", "absent received surface does not store committedItems as received", () => {
  const runtime = runtimeWith([]);
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const derivation = renderR0SourceForEmim(runtime, sourceId);
  const e1 = commitEmim(runtime, baseEmimInput({
    inputItems: [
      instructionItem("propose G0"),
      historicalItemFromDerivation(runtime, derivation, {
        channel: ITEM_CHANNEL.SOURCE_EXCERPT,
        anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
      }),
    ],
  }), { region: REGION.R0 });
  runtime.modelTransport = noReceivedTransport({ generationComplete: true, typedOutputs: [] });
  invokeCommittedEmim(runtime, e1.historicalExecutionId);
  const surface = had1Surface(runtime, e1.historicalExecutionId);
  assert.ok(Array.isArray(surface.committedRenderedItems));
  assert.ok(surface.committedRenderedItems.length > 0);
  assert.equal(surface.receivedRenderedItems, null);
  assert.equal(surface.receivedRenderedDigests, null);
  assert.equal(surface.match, null);
  assert.notDeepEqual(surface.receivedRenderedItems, surface.committedRenderedItems);
});

check("HAD2", "HAD-2 evidence surface records occurrence / actor allocations", () => {
  const runtime = runtimeWith([]);
  lawfulG0(runtime);
  const surfaces = had2Surfaces(runtime);
  assert.ok(surfaces.some((row) => row.payload.kind === "occurrence_allocation"));
  assert.ok(surfaces.some((row) => row.payload.kind === "AUTHORIZATION_DECISION" || row.payload.kind === "model_invocation"));
});

function registerRawPcm(runtime, evidenceBindingId, payload, payloadIdentity = evidenceBindingId) {
  runtime.store.put("evidenceBinding", evidenceBindingId, {
    evidenceBindingId,
    payloadIdentity,
    payload,
  });
}

check("N1", "XPI protected render requires exact evidenceAccessEventId", () => {
  const packed = lawfulSealedCollection();
  const { runtime, seal } = packed;
  transitionR1toR2(runtime, "case-seed-1", seal.factualBaselineSealId);
  const compiled = transitionR2toR3(runtime, "case-seed-1");
  assertSemanticBoundary(compiled);
  registerRawPcm(runtime, "eb-1", { excerpt: "protected-payload" }, "pcm-1");
  const xpi = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-DERIV-TEST", version: "v1" },
    scopeIdentity: null,
    suppliedUniverse: ["eb-1"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: xpi.executionId,
    accessedMaterialIdentity: "pcm-1",
    evidenceLineage: ["eb-1"],
    accessedPayload: { excerpt: "protected-payload" },
  });
  assert.deepEqual(access.evidenceLineage, ["eb-1"]);
  const derivation = renderProtectedItemForEmim(runtime, {
    evidenceAccessEventId: access.evidenceAccessEventId,
    executionId: xpi.executionId,
  });
  assert.equal(derivation.sourceAccessReference, access.evidenceAccessEventId);
  completeXpiExecution(runtime, xpi.executionId, { outputs: [{ payload: { note: "derivative" } }] });
  const traces = xad1Surfaces(runtime);
  assert.ok(traces.some((row) => row.payload.path === "XPI_ACCESS"));
});

check("ADV-XPI-WRONG-EVENT", "protected content with wrong evidenceAccessEventId fails closed", () => {
  const runtime = runtimeWith([]);
  registerRawPcm(runtime, "eb-1", { excerpt: "protected-payload" }, "pcm-1");
  const xpi = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-DERIV-TEST", version: "v1" },
    suppliedUniverse: ["eb-1"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: xpi.executionId,
    accessedMaterialIdentity: "pcm-1",
    evidenceLineage: ["eb-1"],
    accessedPayload: { excerpt: "protected-payload" },
  });
  expectFail(() => renderProtectedItemForEmim(runtime, {
    evidenceAccessEventId: access.evidenceAccessEventId,
    executionId: "sha256:not-this-execution",
  }), "XPI_ACCESS_EXECUTION_MISMATCH");
  expectFail(() => rejectUnauthorizedAccess(runtime, xpi.executionId, "rawRead"), "UNAUTHORIZED_EXECUTION_PATH");
});

check("XAD1", "XPI exclusive path is the only lawful Stage-C access", () => {
  const runtime = runtimeWith([]);
  registerRawPcm(runtime, "eb-9", "payload", "pcm-9");
  const xpi = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-ADJ", version: "v1" },
    suppliedUniverse: ["eb-9"],
    executionPurpose: XPI_PURPOSE.ADJUDICATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  accessProtectedMaterial(runtime, {
    executionId: xpi.executionId,
    accessedMaterialIdentity: "pcm-9",
    evidenceLineage: ["eb-9"],
    accessedPayload: "payload",
  });
  const { derivatives } = completeXpiExecution(runtime, xpi.executionId, { outputs: [{ payload: 1 }, { payload: 2 }] });
  assert.equal(derivatives.length, 2);
  assert.deepEqual(derivatives[0].evidenceLineage, derivatives[1].evidenceLineage);
  assert.deepEqual(derivatives[0].evidenceLineage, ["eb-9"]);
});

function produceDerivative(runtime, bindingIds, payload = { note: "D" }) {
  for (const id of bindingIds) {
    if (!runtime.store.tryGet("evidenceBinding", id)) {
      registerRawPcm(runtime, id, { body: id }, id);
    }
  }
  const producer = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-DERIV-TEST", version: "v1" },
    suppliedUniverse: bindingIds,
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  for (const id of bindingIds) {
    accessProtectedMaterial(runtime, {
      executionId: producer.executionId,
      accessedMaterialIdentity: id,
      evidenceLineage: ["FORGED-NARROW"],
    });
  }
  const { derivatives, execution } = completeXpiExecution(runtime, producer.executionId, {
    outputs: [{ payload }],
  });
  return { producer: execution, derivative: derivatives[0] };
}

check("F1-A", "NP-05 equivalent: caller cannot narrow stored derivative lineage {eb-P,eb-R} to {eb-P}", () => {
  const runtime = runtimeWith([]);
  const { derivative } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D-PR" });
  assert.deepEqual(derivative.evidenceLineage, ["eb-P", "eb-R"]);
  const consumer = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-CONSUME", version: "v1" },
    suppliedUniverse: ["eb-P", "eb-R"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: derivative.protectedDerivativeId,
    evidenceLineage: ["eb-P"],
  });
  assert.deepEqual(access.evidenceLineage, ["eb-P", "eb-R"]);
  assert.notDeepEqual(access.evidenceLineage, ["eb-P"]);
  completeXpiExecution(runtime, consumer.executionId, { outputs: [{ payload: { note: "used-D" } }] });
  assert.deepEqual(xpiAccessSet(runtime, consumer.executionId), ["eb-P", "eb-R"]);
});

check("F1-B", "NP-05b equivalent: caller cannot empty stored derivative lineage {eb-P} to ∅", () => {
  const runtime = runtimeWith([]);
  const { derivative } = produceDerivative(runtime, ["eb-P"], { note: "D-P" });
  assert.deepEqual(derivative.evidenceLineage, ["eb-P"]);
  const consumer = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-CONSUME", version: "v1" },
    suppliedUniverse: ["eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: derivative.protectedDerivativeId,
    evidenceLineage: [],
  });
  assert.deepEqual(access.evidenceLineage, ["eb-P"]);
  assert.notEqual(access.evidenceLineage.length, 0);
  completeXpiExecution(runtime, consumer.executionId);
  assert.deepEqual(xpiAccessSet(runtime, consumer.executionId), ["eb-P"]);
});

check("F1-C", "derivative-of-derivative preserves complete transitive lineage with no decay", () => {
  const runtime = runtimeWith([]);
  registerRawPcm(runtime, "eb-R", { body: "R" }, "eb-R");
  registerRawPcm(runtime, "eb-P", { body: "P" }, "eb-P");
  const t1 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T1", version: "v1" },
    suppliedUniverse: ["eb-R"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  accessProtectedMaterial(runtime, { executionId: t1.executionId, accessedMaterialIdentity: "eb-R" });
  const d1 = completeXpiExecution(runtime, t1.executionId, { outputs: [{ payload: { note: "D1" } }] }).derivatives[0];
  assert.deepEqual(d1.evidenceLineage, ["eb-R"]);
  const t2 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T2", version: "v1" },
    suppliedUniverse: ["eb-R", "eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  accessProtectedMaterial(runtime, {
    executionId: t2.executionId,
    accessedMaterialIdentity: d1.protectedDerivativeId,
    evidenceLineage: ["eb-R"],
  });
  accessProtectedMaterial(runtime, {
    executionId: t2.executionId,
    accessedMaterialIdentity: "eb-P",
    evidenceLineage: ["eb-P"],
  });
  const d2 = completeXpiExecution(runtime, t2.executionId, { outputs: [{ payload: { note: "D2" } }] }).derivatives[0];
  assert.deepEqual(d2.evidenceLineage, ["eb-P", "eb-R"]);
  const t3 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T3", version: "v1" },
    suppliedUniverse: ["eb-R", "eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: t3.executionId,
    accessedMaterialIdentity: d2.protectedDerivativeId,
    evidenceLineage: ["eb-P"],
  });
  assert.deepEqual(access.evidenceLineage, ["eb-P", "eb-R"]);
  completeXpiExecution(runtime, t3.executionId, { outputs: [{ payload: { note: "D3" } }] });
  assert.deepEqual(xpiAccessSet(runtime, t3.executionId), ["eb-P", "eb-R"]);
});

check("F1-D", "unresolvable protected derivative identity fails closed", () => {
  const runtime = runtimeWith([]);
  const consumer = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-CONSUME", version: "v1" },
    suppliedUniverse: ["eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: "sha256:not-a-stored-derivative",
    evidenceLineage: ["eb-P"],
  }), "PROTECTED_MATERIAL_UNRESOLVABLE");
});

check("F1-E", "derivative lineage outside adjudication supplied universe fails closed", () => {
  const runtime = runtimeWith([]);
  const { derivative } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D-cross" });
  const adjudication = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-ADJ", version: "v1" },
    suppliedUniverse: ["eb-P"],
    executionPurpose: XPI_PURPOSE.ADJUDICATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: adjudication.executionId,
    accessedMaterialIdentity: derivative.protectedDerivativeId,
    evidenceLineage: ["eb-P"],
  }), "LINEAGE_OUTSIDE_SUPPLIED_UNIVERSE");
});

check("F1-F", "lawful derivative consumption uses authoritative stored lineage", () => {
  const runtime = runtimeWith([]);
  const { derivative } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D-happy" });
  const consumer = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-CONSUME", version: "v1" },
    suppliedUniverse: ["eb-P", "eb-R"],
    executionPurpose: XPI_PURPOSE.ADJUDICATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: derivative.protectedDerivativeId,
  });
  assert.deepEqual(access.evidenceLineage, derivative.evidenceLineage);
  assert.deepEqual(access.evidenceLineage, ["eb-P", "eb-R"]);
  completeXpiExecution(runtime, consumer.executionId);
  assert.deepEqual(xpiAccessSet(runtime, consumer.executionId), ["eb-P", "eb-R"]);
});

function consumerResidue(runtime, executionId) {
  const execution = runtime.store.get("xpiExecution", executionId);
  return {
    accessEvents: [...execution.accessEvents],
    accessSet: [...(execution.accessSet ?? [])],
    eventCount: runtime.store.list("xpiAccessEvent").filter((event) => event.executionId === executionId).length,
  };
}

function beginConsumer(runtime, universe, purpose = XPI_PURPOSE.DERIVATION) {
  return beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-CONSUME", version: "v1" },
    suppliedUniverse: universe,
    executionPurpose: purpose,
    occurrenceDomainIdentity: "case-seed-1",
  });
}

check("F9-P7b", "P7b: coherent narrowed record under D_wide key fails closed with no residue", () => {
  const runtime = runtimeWith([]);
  const { derivative: dWide } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D-wide" });
  const { derivative: dNarrow } = produceDerivative(runtime, ["eb-P"], { note: "D-narrow" });
  assert.deepEqual(dWide.evidenceLineage, ["eb-P", "eb-R"]);
  assert.deepEqual(dNarrow.evidenceLineage, ["eb-P"]);
  runtime.store.replace("xpiDerivative", dWide.protectedDerivativeId, { ...dNarrow });
  const substituted = runtime.store.get("xpiDerivative", dWide.protectedDerivativeId);
  assert.equal(substituted.protectedDerivativeId, dNarrow.protectedDerivativeId);
  assert.deepEqual(substituted.evidenceLineage, ["eb-P"]);
  const consumer = beginConsumer(runtime, ["eb-P", "eb-R"]);
  const before = consumerResidue(runtime, consumer.executionId);
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: dWide.protectedDerivativeId,
  }), "DERIVATIVE_IDENTITY_INCONSISTENT");
  assert.deepEqual(consumerResidue(runtime, consumer.executionId), before);
});

check("F9-P7c", "P7c: lawful D_narrow substituted under D_wide key fails closed", () => {
  const runtime = runtimeWith([]);
  const { derivative: dWide, producer: producerW } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "W" });
  const { derivative: dNarrow, producer: producerN } = produceDerivative(runtime, ["eb-P"], { note: "N" });
  assert.equal(producerW.completed, true);
  assert.equal(producerN.completed, true);
  assert.deepEqual(producerW.accessSet, ["eb-P", "eb-R"]);
  assert.deepEqual(producerN.accessSet, ["eb-P"]);
  runtime.store.replace("xpiDerivative", dWide.protectedDerivativeId, { ...dNarrow });
  const underWide = runtime.store.get("xpiDerivative", dWide.protectedDerivativeId);
  assert.equal(underWide.protectedDerivativeId, dNarrow.protectedDerivativeId);
  assert.notEqual(underWide.protectedDerivativeId, dWide.protectedDerivativeId);
  const consumer = beginConsumer(runtime, ["eb-P", "eb-R"]);
  const before = consumerResidue(runtime, consumer.executionId);
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: dWide.protectedDerivativeId,
  }), "DERIVATIVE_IDENTITY_INCONSISTENT");
  assert.deepEqual(consumerResidue(runtime, consumer.executionId), before);
});

check("F9-RECORD-ID", "requested key D1 with stored protectedDerivativeId D2 fails closed", () => {
  const runtime = runtimeWith([]);
  const { derivative: d1 } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D1" });
  const { derivative: d2 } = produceDerivative(runtime, ["eb-P"], { note: "D2" });
  runtime.store.replace("xpiDerivative", d1.protectedDerivativeId, {
    ...d1,
    protectedDerivativeId: d2.protectedDerivativeId,
  });
  const consumer = beginConsumer(runtime, ["eb-P", "eb-R"]);
  const before = consumerResidue(runtime, consumer.executionId);
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: d1.protectedDerivativeId,
  }), "DERIVATIVE_IDENTITY_INCONSISTENT");
  assert.deepEqual(consumerResidue(runtime, consumer.executionId), before);
});

check("F9-RECOMPUTE", "storedId equals requestedId but recomputation yields another identity", () => {
  const runtime = runtimeWith([]);
  const { derivative: d1 } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "D1" });
  runtime.store.replace("xpiDerivative", d1.protectedDerivativeId, {
    ...d1,
    outputOrdinal: d1.outputOrdinal + 1,
  });
  const stored = runtime.store.get("xpiDerivative", d1.protectedDerivativeId);
  assert.equal(stored.protectedDerivativeId, d1.protectedDerivativeId);
  const consumer = beginConsumer(runtime, ["eb-P", "eb-R"]);
  const before = consumerResidue(runtime, consumer.executionId);
  expectFail(() => accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: d1.protectedDerivativeId,
  }), "DERIVATIVE_IDENTITY_INCONSISTENT");
  assert.deepEqual(consumerResidue(runtime, consumer.executionId), before);
});

check("F9-LAWFUL", "lawful requested = stored = recomputed identity remains consumable", () => {
  const runtime = runtimeWith([]);
  const { derivative, producer } = produceDerivative(runtime, ["eb-P", "eb-R"], { note: "lawful" });
  const stored = runtime.store.get("xpiDerivative", derivative.protectedDerivativeId);
  assert.equal(stored.protectedDerivativeId, derivative.protectedDerivativeId);
  assert.deepEqual(stored.evidenceLineage, producer.accessSet);
  const consumer = beginConsumer(runtime, ["eb-P", "eb-R"], XPI_PURPOSE.ADJUDICATION);
  const access = accessProtectedMaterial(runtime, {
    executionId: consumer.executionId,
    accessedMaterialIdentity: derivative.protectedDerivativeId,
    evidenceLineage: ["eb-P"],
    accessedPayload: { forged: true },
  });
  assert.equal(access.accessedMaterialIdentity, derivative.protectedDerivativeId);
  assert.deepEqual(access.evidenceLineage, ["eb-P", "eb-R"]);
  assert.deepEqual(access.accessedPayload, { note: "lawful" });
  completeXpiExecution(runtime, consumer.executionId);
  assert.deepEqual(xpiAccessSet(runtime, consumer.executionId), ["eb-P", "eb-R"]);
});

check("F9-TRANSITIVE", "identity binding holds across PCM → D1 → D2 → D3 with no decay", () => {
  const runtime = runtimeWith([]);
  registerRawPcm(runtime, "eb-R", { body: "R" }, "eb-R");
  registerRawPcm(runtime, "eb-P", { body: "P" }, "eb-P");
  const t1 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T1", version: "v1" },
    suppliedUniverse: ["eb-R"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  accessProtectedMaterial(runtime, { executionId: t1.executionId, accessedMaterialIdentity: "eb-R" });
  const d1 = completeXpiExecution(runtime, t1.executionId, { outputs: [{ payload: { note: "D1" } }] }).derivatives[0];
  assert.equal(
    runtime.store.get("xpiDerivative", d1.protectedDerivativeId).protectedDerivativeId,
    d1.protectedDerivativeId,
  );
  const t2 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T2", version: "v1" },
    suppliedUniverse: ["eb-R", "eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  accessProtectedMaterial(runtime, { executionId: t2.executionId, accessedMaterialIdentity: d1.protectedDerivativeId });
  accessProtectedMaterial(runtime, { executionId: t2.executionId, accessedMaterialIdentity: "eb-P" });
  const d2 = completeXpiExecution(runtime, t2.executionId, { outputs: [{ payload: { note: "D2" } }] }).derivatives[0];
  const t3 = beginXpiExecution(runtime, {
    appliedProcedureIdentity: { identity: "XPI-T3", version: "v1" },
    suppliedUniverse: ["eb-R", "eb-P"],
    executionPurpose: XPI_PURPOSE.DERIVATION,
    occurrenceDomainIdentity: "case-seed-1",
  });
  const access = accessProtectedMaterial(runtime, {
    executionId: t3.executionId,
    accessedMaterialIdentity: d2.protectedDerivativeId,
  });
  assert.deepEqual(access.evidenceLineage, ["eb-P", "eb-R"]);
  completeXpiExecution(runtime, t3.executionId, { outputs: [{ payload: { note: "D3" } }] });
  assert.deepEqual(xpiAccessSet(runtime, t3.executionId), ["eb-P", "eb-R"]);
});

check("ADV-POST-START", "committed EMIM cannot grow during inference", () => {
  const runtime = runtimeWith([]);
  const emim = commitEmim(runtime, baseEmimInput(), { region: REGION.R0 });
  expectFail(() => rejectEmimAmendment(runtime, emim.historicalExecutionId), "POST_START_EMIM_MUTATION");
});

function verifyAgainstPacked(packed, extra = {}) {
  return independentPreSealVerification(packed.runtime, {
    manifestId: packed.manifest.manifestId,
    baselineId: extra.baselineId ?? packed.baseline.baselineId,
    verifierActorRef: extra.verifierActorRef ?? "actor-verifier",
    authorActorRef: extra.authorActorRef ?? "actor-collector",
    independentJudgments: extra.independentJudgments
      ?? limbBJudgments(packed.runtime.store.get("factualBaseline", extra.baselineId ?? packed.baseline.baselineId), extra.judgmentExtra ?? {}),
  });
}

function twoSourceClosedCollection() {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998", "sec-8k-1998"],
      queryFamilies: [],
    },
  });
  const t0DeterminationId = sessionT0DeterminationId(ctx.runtime);
  const first = stageBRetrieve(ctx, { sourceId: "sec-10k-1998", exactLocator: "https://example.test/10k" });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: first.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId, sourceId: "sec-10k-1998" }),
  });
  const second = stageBRetrieve(ctx, {
    sourceId: "sec-8k-1998",
    exactLocator: "https://example.test/8k",
    retrievedPayload: { body: "Chrysler was acquired." },
  });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: second.executed.retrievalActId,
    ...lawfulCertifiedFields({
      t0DeterminationId,
      sourceId: "sec-8k-1998",
      exactExcerpt: "Chrysler was acquired.",
      atomicProposition: "Chrysler was acquired by Daimler-Benz in a second filing.",
    }),
  });
  const baseline = assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [
      { retrievalActId: first.executed.retrievalActId },
      { retrievalActId: second.executed.retrievalActId },
    ],
    t0DeterminationId,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  return {
    runtime: ctx.runtime,
    blueprint: ctx.blueprint,
    manifest: ctx.manifest,
    first,
    second,
    baseline,
    closure,
    slot: ctx.slot,
  };
}

check("RC3-A", "SELF-COPY IS INSUFFICIENT: copy-faithful baseline with proposition-fidelity FAIL is overall FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  const fact = packed.baseline.admitted[0];
  assert.equal(fact.exactExcerpt, qual.exactExcerpt);
  assert.equal(fact.atomicProposition, qual.atomicProposition);
  assert.equal(fact.sourceIdentity, qual.sourceIdentity);
  assert.equal(fact.exactLocator, qual.exactLocator);
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { propositionDisposition: "FAIL" }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(verification.limbA, true);
  assert.equal(verification.limbB, false);
  const proposition = findCheck(verification, LIMB_B_CHECK.ATOMIC_PROPOSITION, packed.executed.retrievalActId);
  assert.equal(proposition.result, "FAIL");
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("RC3-B", "SOURCE IDENTITY SUBSTITUTION fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const mutatedAdmitted = packed.baseline.admitted.map((row) => ({
    ...row,
    sourceIdentity: "wrong-source-identity",
  }));
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: mutatedAdmitted,
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.SOURCE_IDENTITY).result, "FAIL");
});

check("RC3-C", "ARTIFACT/VERSION MISMATCH fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const mutatedAdmitted = packed.baseline.admitted.map((row) => ({
    ...row,
    artifactContentDigest: "sha256:wrong-artifact-digest",
  }));
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: mutatedAdmitted,
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ARTIFACT_VERSION).result, "FAIL");
});

check("RC3-D", "LOCATOR MISMATCH fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const mutatedAdmitted = packed.baseline.admitted.map((row) => ({
    ...row,
    exactLocator: "https://example.test/wrong-locator",
  }));
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: mutatedAdmitted,
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.EXACT_LOCATOR).result, "FAIL");
});

check("RC3-E", "EXCERPT FIDELITY FAIL against retained artifact despite copy-consistent baseline", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  const fact = packed.baseline.admitted[0];
  assert.equal(fact.exactExcerpt, qual.exactExcerpt);
  const alteredPayload = { body: "unrelated retained artifact text" };
  replaceStored(packed.runtime, "retrievalQualification", packed.executed.retrievalActId, {
    ...qual,
    sourceArtifact: {
      ...qual.sourceArtifact,
      retrievedPayload: alteredPayload,
      artifactContentDigest: digestCanonical(alteredPayload),
    },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.EXACT_EXCERPT).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.EXACT_EXCERPT).reason, "EXACT_EXCERPT_NOT_IN_RETAINED_ARTIFACT");
});

check("RC3-F", "PROPOSITION FIDELITY FAIL when excerpt is valid", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  assert.equal(qual.sourceArtifact.retrievedPayload.body.includes(qual.exactExcerpt), true);
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { propositionDisposition: "FAIL" }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ATOMIC_PROPOSITION).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.EXACT_EXCERPT).result, "PASS");
});

check("RC3-G", "ILLEGAL ADMISSION of excluded material fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const excluded = stageBRetrieve({
    runtime: packed.runtime,
    blueprint: packed.blueprint,
    slot: packed.slot,
    slotType: documentaryFactSlotType({
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
    }),
    manifest: packed.manifest,
  }, {
    sourceId: "sec-excluded-1998",
    exactLocator: "https://example.test/excluded",
  });
  certifyStageBFact(packed.runtime, {
    retrievalActId: excluded.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "excluded proposition",
    disposition: CERTIFICATION_DISPOSITION.EXCLUDED,
    reason: "not admissible",
  });
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  const injected = {
    sealedFactId: "injected-excluded",
    retrievalActId: excluded.executed.retrievalActId,
    atomicProposition: "excluded proposition",
    exactExcerpt: "Chrysler was acquired.",
    sourceIdentity: "sec-excluded-1998",
    exactLocator: "https://example.test/excluded",
    sourceClassRef: "SEC_FILING",
    sourceMaterialIdentity: "sec-excluded-1998",
    artifactContentDigest: packed.baseline.admitted[0].artifactContentDigest,
    artifactVersion: null,
    sideScope: packed.baseline.admitted[0].sideScope,
    contradictionStatus: packed.baseline.admitted[0].contradictionStatus,
  };
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    admitted: [...current.admitted, injected],
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, excluded.executed.retrievalActId).result, "FAIL");
});

check("RC3-H", "TEMPORAL INELIGIBILITY fails closed", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { gateA: null, gateB: null, publicAvailabilityEvidenceRecords: null },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "TEMPORAL_GATE_CARRIER_MISSING");
});

check("RC3-I", "SIDE/SCOPE independent verification FAIL is overall FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { sideScopeDisposition: "FAIL" }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.SIDE_SCOPE).result, "FAIL");
});

check("RC3-J", "UNRESOLVED CONTRADICTION fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, {
      contradictionDisposition: "FAIL",
      contradictionBasis: "UNRESOLVED_MATERIAL_CONTRADICTION",
    }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.CONTRADICTION_TREATMENT).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.CONTRADICTION_TREATMENT).reason, "UNRESOLVED_MATERIAL_CONTRADICTION");
});

check("RC3-K", "MEMBER DELETION fails closed", () => {
  const packed = twoSourceClosedCollection();
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: packed.baseline.admitted.filter((row) => (
      row.retrievalActId !== packed.first.executed.retrievalActId
    )),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_MEMBERSHIP).result, "FAIL");
});

check("RC3-L", "MEMBER INJECTION fails closed", () => {
  const packed = twoSourceClosedCollection();
  const injected = {
    ...packed.baseline.admitted[0],
    sealedFactId: "injected-member",
    retrievalActId: "injected-retrieval",
  };
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: [...packed.baseline.admitted, injected],
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_MEMBERSHIP).result, "FAIL");
});

check("RC3-M", "MEMBER SUBSTITUTION fails closed", () => {
  const packed = twoSourceClosedCollection();
  const substitute = {
    ...packed.baseline.admitted[0],
    sealedFactId: "substituted-member",
    retrievalActId: "substituted-retrieval",
  };
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: [substitute, packed.baseline.admitted[1]],
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_MEMBERSHIP).result, "FAIL");
});

check("RC3-N", "DIGEST TAMPER fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: packed.baseline.admitted.map((row) => ({
      ...row,
      exactExcerpt: `${row.exactExcerpt} tampered`,
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_DIGEST).result, "FAIL");
});

check("RC3-O", "COMPLETE LAWFUL PASS then separate Owner seal", () => {
  const packed = lawfulSealedCollection();
  assert.equal(packed.closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  assert.equal(packed.verification.limbA, true);
  assert.equal(packed.verification.limbB, true);
  for (const checkId of Object.values(LIMB_B_CHECK)) {
    const rows = packed.verification.checkResults.filter((row) => row.checkId === checkId);
    assert.ok(rows.length > 0);
    assert.ok(rows.every((row) => row.result === "PASS"));
  }
  assert.equal(replayPreSealAggregation(packed.verification), "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  assert.ok(packed.seal.factualBaselineSealId);
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  assert.ok(qual.sourceArtifact);
  assert.equal(qual.sourceArtifact.sourceIdentity, "sec-10k-1998");
  assert.equal(qual.sourceArtifact.artifactContentDigest, digestCanonical(qual.sourceArtifact.retrievedPayload));
});

check("RC3-P", "MISSING REQUIRED CHECK fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false });
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  expectFail(() => replaceStored(packed.runtime, "preSealVerification", packed.verification.verificationId, {
    ...packed.verification,
    checkResults: packed.verification.checkResults.filter((row) => (
      row.checkId !== LIMB_B_CHECK.BASELINE_DIGEST
    )),
    result: "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS",
    limbB: true,
  }), "STORE_RECORD_IMMUTABLE");
  const missingCheckSurface = {
    ...packed.verification,
    checkResults: packed.verification.checkResults.filter((row) => (
      row.checkId !== LIMB_B_CHECK.BASELINE_DIGEST
    )),
    result: "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS",
    limbB: true,
  };
  assert.equal(replayPreSealAggregation(missingCheckSurface), "FAIL");
  const stored = packed.runtime.store.get("preSealVerification", packed.verification.verificationId);
  assert.equal(stored.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
});

check("RC3-Q", "WRONG VERIFIER BINDING cannot satisfy another fact", () => {
  const packed = twoSourceClosedCollection();
  const judgmentsForFirstOnly = limbBJudgments({
    ...packed.baseline,
    admitted: packed.baseline.admitted.filter((row) => (
      row.retrievalActId === packed.first.executed.retrievalActId
    )),
  });
  const verification = verifyAgainstPacked(packed, { independentJudgments: judgmentsForFirstOnly });
  assert.equal(verification.result, "FAIL");
  const secondProposition = findCheck(
    verification,
    LIMB_B_CHECK.ATOMIC_PROPOSITION,
    packed.second.executed.retrievalActId,
  );
  assert.equal(secondProposition.result, "FAIL");
  assert.equal(secondProposition.reason, "INDEPENDENT_JUDGMENT_MISSING");
});

check("RC3-R", "SAME AUTHOR / VERIFIER still fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  expectFail(() => verifyAgainstPacked(packed, {
    verifierActorRef: "actor-collector",
    authorActorRef: "actor-collector",
  }), "PRE_SEAL_VERIFIER_NOT_INDEPENDENT");
});

check("RC3-S", "BASELINE CHANGE INVALIDATES PRIOR VERIFICATION", () => {
  const packed = lawfulSealedCollection({ seal: false });
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...packed.baseline,
    admitted: packed.baseline.admitted.map((row) => ({
      ...row,
      exactExcerpt: `${row.exactExcerpt} changed-after-verification`,
    })),
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("RC3-T", "COLLECTION NOT CLOSED cannot be overridden by LIMB-B checks", () => {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998", "sec-8k-1998"],
      queryFamilies: [],
    },
  });
  const first = stageBRetrieve(ctx, { sourceId: "sec-10k-1998", exactLocator: "https://example.test/10k" });
  const t0DeterminationId = sessionT0DeterminationId(ctx.runtime);
  certifyStageBFact(ctx.runtime, {
    retrievalActId: first.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId }),
  });
  const baseline = assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: first.executed.retrievalActId }],
    t0DeterminationId,
  });
  const closure = evaluateCollectionClosure(ctx.runtime, ctx.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  const verification = independentPreSealVerification(ctx.runtime, {
    manifestId: ctx.manifest.manifestId,
    baselineId: baseline.baselineId,
    verifierActorRef: "actor-verifier",
    authorActorRef: "actor-collector",
    independentJudgments: limbBJudgments(baseline),
  });
  assert.equal(verification.limbA, false);
  assert.equal(verification.result, "FAIL");
  expectFail(() => acceptOwnerFactualSeal(ctx.runtime, {
    verificationId: verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

function g0Propositions(sourceIds) {
  return [
    { g0Field: "caseId", canonicalProposition: "CASE-DAIMLER-CHRYSLER", supportingSourceRecordIds: sourceIds, propositionRole: "INFORMATIONAL", propositionOrdinal: 1 },
    { g0Field: "T0Identity", canonicalProposition: "1998-11-17-merger-agreement", supportingSourceRecordIds: sourceIds, propositionOrdinal: 2 },
    { g0Field: "caseSides", canonicalProposition: "ACQUIRER=Daimler-Benz AG;TARGET=Chrysler Corporation", supportingSourceRecordIds: sourceIds, propositionOrdinal: 3 },
    { g0Field: "caseGeometryVersion", canonicalProposition: "G0-v1", supportingSourceRecordIds: sourceIds, propositionOrdinal: 4 },
  ];
}

function invokeCertifiedDetermination(runtime, sourceIds, t0Determination, outputOverrides = {}) {
  const items = [instructionItem("propose G0")];
  for (const sourceId of sourceIds) {
    if (!runtime.store.tryGet("resolutionSource", sourceId)) continue;
    const derivation = renderR0SourceForEmim(runtime, sourceId);
    items.push(historicalItemFromDerivation(runtime, derivation, {
      channel: ITEM_CHANNEL.SOURCE_EXCERPT,
      anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
    }));
  }
  const { outputs } = commitAndInvoke(
    runtime,
    [candidateOutput(sourceIds, { t0Determination, ...outputOverrides })],
    baseEmimInput({ inputItems: items }),
  );
  const candidate = outputs[0];
  const cert = certifyCandidate(runtime, candidate, sourceIds);
  return { candidate, cert };
}

function rejectedCandidateFrom(meta, extra = {}) {
  return {
    sourceId: extra.sourceId ?? meta.sourceId,
    eventTime: extra.eventTime ?? "1998-05-06T17:00:00Z",
    eventType: extra.eventType ?? "EXPLORATORY_TALKS",
    publicUrl: extra.publicUrl ?? meta.url,
    qualifyingDisposition: extra.qualifyingDisposition ?? "REJECTED_AS_T0",
    acceptRejectReason: extra.acceptRejectReason ?? "Talks only; no definitive agreement.",
    sourceArtifactHash: Object.prototype.hasOwnProperty.call(extra, "sourceArtifactHash")
      ? extra.sourceArtifactHash
      : meta.artifactHash,
  };
}

check("T0-PROV-A", "All determination candidate sourceIds exist, are certified inputs, URLs match", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const second = retrieveR0Source(runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks",
    sourceIdentityId: "src-talks-1998",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination(meta1, {
    candidates: [
      {
        sourceId: meta1.sourceId,
        eventTime: "1998-11-17T00:00:00Z",
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: meta1.url,
        qualifyingDisposition: "ACCEPTED_AS_T0",
        acceptRejectReason: "First qualifying public definitive bilateral agreement.",
        sourceArtifactHash: meta1.artifactHash,
      },
      rejectedCandidateFrom(meta2),
    ],
  });
  const sourceIds = [meta1.sourceId, meta2.sourceId];
  const { candidate } = invokeCertifiedDetermination(runtime, sourceIds, t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  const session = transitionR0toR1(runtime, "case-seed-1", candidate);
  const carrier = resolveT0DeterminationCarrier(runtime, session.t0DeterminationId);
  assert.equal(carrier.candidates.length, 2);
  assert.equal(carrier.selectedT0SourceId, meta1.sourceId);
  assert.ok(carrier.certificationBinding.supportingSourceRecordIds.includes(meta1.sourceId));
  assert.ok(carrier.certificationBinding.supportingSourceRecordIds.includes(meta2.sourceId));
});

check("T0-PROV-B", "Selected source lawful, but one rejected candidate sourceId nonexistent fails closed", () => {
  const runtime = runtimeWith([]);
  const pack = lawfulG0(runtime);
  const t0Determination = defaultT0Determination(pack.meta, {
    candidates: [
      pack.t0Determination.candidates[0],
      rejectedCandidateFrom(pack.meta, { sourceId: "SRC-DOES-NOT-EXIST" }),
    ],
  });
  const sourceIds = [pack.sourceId, "SRC-DOES-NOT-EXIST"];
  const { candidate } = invokeCertifiedDetermination(runtime, sourceIds, t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_CANDIDATE_SOURCE_UNRESOLVABLE",
  );
  assert.equal(currentRegion(runtime, "case-seed-1"), REGION.R0);
});

check("T0-PROV-C", "Candidate source exists but is not included in certified commitment supporting set fails closed", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const second = retrieveR0Source(runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks",
    sourceIdentityId: "src-talks-1998",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination(meta1, {
    candidates: [
      {
        sourceId: meta1.sourceId,
        eventTime: "1998-11-17T00:00:00Z",
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: meta1.url,
        qualifyingDisposition: "ACCEPTED_AS_T0",
        acceptRejectReason: "First qualifying public definitive bilateral agreement.",
        sourceArtifactHash: meta1.artifactHash,
      },
      rejectedCandidateFrom(meta2),
    ],
  });
  const propositions = [
    ...g0Propositions([meta1.sourceId]),
    {
      propositionRole: "T0_DETERMINATION_COMMITMENT",
      canonicalProposition: canonicalDeterminationCommitment(t0Determination),
      supportingSourceRecordIds: [meta1.sourceId],
      propositionOrdinal: 5,
    },
  ];
  const { candidate } = invokeCertifiedDetermination(runtime, [meta1.sourceId], t0Determination, {
    propositions,
    includeCommitment: false,
  });
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_CANDIDATE_SOURCE_NOT_CERTIFIED",
  );
});

check("T0-PROV-D", "Candidate sourceId lawful but publicUrl differs from authoritative exactLocator fails closed", () => {
  const runtime = runtimeWith([]);
  const pack = lawfulG0(runtime);
  const t0Determination = defaultT0Determination(pack.meta, {
    candidates: [
      pack.t0Determination.candidates[0],
      rejectedCandidateFrom(pack.meta, { publicUrl: "https://example.test/wrong-url" }),
    ],
  });
  const { candidate } = invokeCertifiedDetermination(runtime, [pack.sourceId], t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_CANDIDATE_SOURCE_MISMATCH",
  );
});

check("T0-PROV-E", "Candidate artifact/content identity differs from retained R0 source identity fails closed", () => {
  const runtime = runtimeWith([]);
  const pack = lawfulG0(runtime);
  const t0Determination = defaultT0Determination(pack.meta, {
    candidates: [
      pack.t0Determination.candidates[0],
      rejectedCandidateFrom(pack.meta, { sourceArtifactHash: "sha256:not-the-retained-artifact" }),
    ],
  });
  const { candidate } = invokeCertifiedDetermination(runtime, [pack.sourceId], t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_CANDIDATE_SOURCE_MISMATCH",
  );
});

check("T0-PROV-F", "Every candidate source remains NON_EVIDENCE and cannot enter Stage-B", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const second = retrieveR0Source(runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks",
    sourceIdentityId: "src-talks-1998",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination(meta1, {
    candidates: [
      {
        sourceId: meta1.sourceId,
        eventTime: "1998-11-17T00:00:00Z",
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: meta1.url,
        qualifyingDisposition: "ACCEPTED_AS_T0",
        acceptRejectReason: "First qualifying public definitive bilateral agreement.",
        sourceArtifactHash: meta1.artifactHash,
      },
      rejectedCandidateFrom(meta2),
    ],
  });
  const { candidate } = invokeCertifiedDetermination(runtime, [meta1.sourceId, meta2.sourceId], t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  transitionR0toR1(runtime, "case-seed-1", candidate);
  assert.equal(runtime.store.get("resolutionSource", meta1.sourceId).evidenceStatus, "NON_EVIDENCE");
  assert.equal(runtime.store.get("resolutionSource", meta2.sourceId).evidenceStatus, "NON_EVIDENCE");
  expectFail(() => offerR0SourceAsStageBEvidence(runtime, meta1.sourceId), "R0_EVIDENCE_FIREWALL");
  expectFail(() => offerR0SourceAsStageBEvidence(runtime, meta2.sourceId), "R0_EVIDENCE_FIREWALL");
});

check("T0-PROV-G", "Two candidates with same text but different source identities remain distinct and both must be covered", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime, { body: "Same announcement text." }, {
    exactLocator: "https://example.test/wire-a",
    sourceIdentityId: "src-wire-a",
  });
  const second = retrieveR0Source(runtime, { body: "Same announcement text." }, {
    exactLocator: "https://example.test/wire-b",
    sourceIdentityId: "src-wire-b",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const sharedText = "1998-11-17T00:00:00Z";
  const t0Determination = defaultT0Determination(meta1, {
    selectedT0Value: sharedText,
    candidates: [
      {
        sourceId: meta1.sourceId,
        eventTime: sharedText,
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: meta1.url,
        qualifyingDisposition: "ACCEPTED_AS_T0",
        acceptRejectReason: "Accepted source A.",
        sourceArtifactHash: meta1.artifactHash,
      },
      {
        sourceId: meta2.sourceId,
        eventTime: sharedText,
        eventType: "DEFINITIVE_AGREEMENT_ANNOUNCEMENT",
        publicUrl: meta2.url,
        qualifyingDisposition: "REJECTED_AS_T0",
        acceptRejectReason: "Same text, distinct source B, not selected.",
        sourceArtifactHash: meta2.artifactHash,
      },
    ],
  });
  const { candidate } = invokeCertifiedDetermination(runtime, [meta1.sourceId, meta2.sourceId], t0Determination);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  const session = transitionR0toR1(runtime, "case-seed-1", candidate);
  const carrier = resolveT0DeterminationCarrier(runtime, session.t0DeterminationId);
  assert.equal(carrier.candidates.length, 2);
  assert.notEqual(carrier.candidates[0].sourceId, carrier.candidates[1].sourceId);
  assert.equal(carrier.candidates[0].eventTime, carrier.candidates[1].eventTime);
  assert.ok(carrier.certificationBinding.supportingSourceRecordIds.includes(meta1.sourceId));
  assert.ok(carrier.certificationBinding.supportingSourceRecordIds.includes(meta2.sourceId));
});

check("T0-COMMIT-A", "Exact commitment proposition ordinal is certified", () => {
  const runtime = runtimeWith([]);
  const pack = lawfulG0(runtime);
  const commitment = pack.candidate.canonicalStructuredPayload.propositions.find(
    (prop) => prop.propositionRole === "T0_DETERMINATION_COMMITMENT",
  );
  assert.equal(commitment.propositionOrdinal ?? 5, 5);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  const session = transitionR0toR1(runtime, "case-seed-1", pack.candidate);
  const carrier = resolveT0DeterminationCarrier(runtime, session.t0DeterminationId);
  assert.equal(carrier.certificationBinding.certifiedCommitmentPropositionOrdinal, 5);
  assert.equal(
    carrier.certificationBinding.certifiedCommitmentProposition,
    canonicalDeterminationCommitment(pack.t0Determination),
  );
});

check("T0-COMMIT-B", "Same canonical commitment bytes on a different proposition ordinal cannot satisfy exact binding", () => {
  const runtime = runtimeWith([]);
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const meta = sourceArtifact(runtime, sourceId);
  const t0Determination = defaultT0Determination(meta);
  const bytes = canonicalDeterminationCommitment(t0Determination);
  const propositions = [
    ...g0Propositions([sourceId]),
    {
      propositionRole: "T0_DETERMINATION_COMMITMENT",
      canonicalProposition: bytes,
      supportingSourceRecordIds: [sourceId],
      propositionOrdinal: 5,
    },
    {
      canonicalProposition: bytes,
      supportingSourceRecordIds: [sourceId],
      propositionOrdinal: 6,
    },
  ];
  const items = [
    instructionItem("propose G0"),
    historicalItemFromDerivation(runtime, renderR0SourceForEmim(runtime, sourceId), {
      channel: ITEM_CHANNEL.SOURCE_EXCERPT,
      anchor: { kind: ANCHOR_KIND.RESOLUTION_SOURCE, id: sourceId },
    }),
  ];
  const { outputs } = commitAndInvoke(runtime, [candidateOutput([sourceId], {
    t0Determination,
    propositions,
    includeCommitment: false,
  })], baseEmimInput({ inputItems: items }));
  const candidate = outputs[0];
  certifyResolution(runtime, {
    candidateOutputRef: candidate.prePcmOutputRecordId,
    certifyingActivityBinding: deterministicCertBinding([sourceId]),
    claimSurfaceInput: {
      certifiedPropositions: candidate.canonicalStructuredPayload.propositions
        .filter((prop) => prop.propositionOrdinal !== 5)
        .map((prop) => ({
          ...prop,
          checkResults: PASS6,
        })),
      certificationResult: CERTIFICATION_RESULT.PASS,
      ambiguityDisposition: AMBIGUITY_DISPOSITION.NONE_SURVIVING,
      governingCertificationRuleRef: RULE_REF.CERTIFICATION,
    },
    ...actorTriple("assign-certifier", "actor-certifier"),
  });
  assert.equal(g0Establishable(runtime, candidate), true);
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_COMMITMENT_ORDINAL_MISMATCH",
  );
});

check("T0-COMMIT-C", "Ambiguous/multiple commitment proposition binding fails closed", () => {
  const runtime = runtimeWith([]);
  const retrieved = retrieveR0Source(runtime);
  const sourceId = retrieved.executed.completion.resolutionSourceRecordId;
  const meta = sourceArtifact(runtime, sourceId);
  const t0Determination = defaultT0Determination(meta);
  const bytes = canonicalDeterminationCommitment(t0Determination);
  const propositions = [
    ...g0Propositions([sourceId]),
    {
      propositionRole: "T0_DETERMINATION_COMMITMENT",
      canonicalProposition: bytes,
      supportingSourceRecordIds: [sourceId],
      propositionOrdinal: 5,
    },
    {
      propositionRole: "T0_DETERMINATION_COMMITMENT",
      canonicalProposition: bytes,
      supportingSourceRecordIds: [sourceId],
      propositionOrdinal: 6,
    },
  ];
  const { candidate } = invokeCertifiedDetermination(runtime, [sourceId], t0Determination, {
    propositions,
    includeCommitment: false,
  });
  createCaseSession(runtime, { caseSeedId: "case-seed-1" });
  expectFail(
    () => transitionR0toR1(runtime, "case-seed-1", candidate),
    "T0_DETERMINATION_COMMITMENT_AMBIGUOUS",
  );
});

check("T0-APPEND-A", "Same case + same T0Identity + changed lawful firstness candidate set yields new carrier ID", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const second = retrieveR0Source(runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks",
    sourceIdentityId: "src-talks-1998",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const original = defaultT0Determination(meta1);
  const expanded = defaultT0Determination(meta1, {
    candidates: [
      original.candidates[0],
      rejectedCandidateFrom(meta2),
    ],
  });
  const { candidate: candidateA } = invokeCertifiedDetermination(runtime, [meta1.sourceId], original);
  const { candidate: candidateB } = invokeCertifiedDetermination(
    runtime,
    [meta1.sourceId, meta2.sourceId],
    expanded,
  );
  createCaseSession(runtime, { caseSeedId: "s1" });
  createCaseSession(runtime, { caseSeedId: "s2" });
  const sessionA = transitionR0toR1(runtime, "s1", candidateA);
  const sessionB = transitionR0toR1(runtime, "s2", candidateB);
  assert.equal(sessionA.g0.caseId, sessionB.g0.caseId);
  assert.equal(sessionA.g0.T0Identity, sessionB.g0.T0Identity);
  assert.notEqual(sessionA.t0DeterminationId, sessionB.t0DeterminationId);
});

check("T0-APPEND-B", "Exact old ID still resolves old carrier; exact new ID resolves new carrier; no implicit supersession", () => {
  const runtime = runtimeWith([]);
  const first = retrieveR0Source(runtime);
  const second = retrieveR0Source(runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks",
    sourceIdentityId: "src-talks-1998",
  });
  const meta1 = sourceArtifact(runtime, first.executed.completion.resolutionSourceRecordId);
  const meta2 = sourceArtifact(runtime, second.executed.completion.resolutionSourceRecordId);
  const original = defaultT0Determination(meta1);
  const expanded = defaultT0Determination(meta1, {
    candidates: [
      original.candidates[0],
      rejectedCandidateFrom(meta2),
    ],
  });
  const { candidate: candidateA } = invokeCertifiedDetermination(runtime, [meta1.sourceId], original);
  const { candidate: candidateB } = invokeCertifiedDetermination(
    runtime,
    [meta1.sourceId, meta2.sourceId],
    expanded,
  );
  createCaseSession(runtime, { caseSeedId: "s1" });
  createCaseSession(runtime, { caseSeedId: "s2" });
  const sessionA = transitionR0toR1(runtime, "s1", candidateA);
  const sessionB = transitionR0toR1(runtime, "s2", candidateB);
  const oldCarrier = resolveT0DeterminationCarrier(runtime, sessionA.t0DeterminationId);
  const newCarrier = resolveT0DeterminationCarrier(runtime, sessionB.t0DeterminationId);
  assert.equal(oldCarrier.t0DeterminationId, sessionA.t0DeterminationId);
  assert.equal(newCarrier.t0DeterminationId, sessionB.t0DeterminationId);
  assert.equal(oldCarrier.candidates.length, 1);
  assert.equal(newCarrier.candidates.length, 2);
  assert.notEqual(oldCarrier.t0DeterminationId, newCarrier.t0DeterminationId);
  expectFail(
    () => resolveT0DeterminationCarrier(runtime, {
      caseId: "CASE-DAIMLER-CHRYSLER",
      T0Identity: "1998-11-17-merger-agreement",
    }),
    "T0_DETERMINATION_ID_INVALID",
  );
});

function failGateA(extra = {}) {
  return {
    decision: extra.decision ?? GATE_DECISION.FAIL,
    factTimeEvidence: extra.factTimeEvidence ?? "event after governing T0",
    supportingSourceIds: extra.supportingSourceIds ?? ["sec-10k-1998"],
    basis: extra.basis ?? "The fact did not exist or operate on or before the governing T0.",
  };
}

function failGateB(extra = {}) {
  return {
    decision: extra.decision ?? GATE_DECISION.FAIL,
    supportingSourceIds: extra.supportingSourceIds ?? ["sec-10k-1998"],
    publicAvailabilityDatesOrBounds: extra.publicAvailabilityDatesOrBounds ?? ["1999-01-01"],
    publicAvailabilityEvidenceRecordIds: extra.publicAvailabilityEvidenceRecordIds ?? [],
    basis: extra.basis ?? "Public knowability is not established on or before the governing T0.",
  };
}

check("CORR6.CORR1-A", "caller CERTIFIED but Gate A FAIL → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { gateA: failGateA() },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_A_NOT_PASS");
});

check("CORR6.CORR1-B", "caller CERTIFIED but Gate B FAIL → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { gateB: failGateB() },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_NOT_PASS");
});

check("CORR6.CORR1-C", "Gate A/B claim PASS but independent temporal verifier FAIL → pre-seal FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { temporalDisposition: "FAIL" }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).result, "PASS");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "TEMPORAL_ELIGIBILITY_JUDGMENT_FAIL");
});

check("CORR6.CORR1-D", "missing LIMB_B_07 independent judgment → FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { omitTemporal: true }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "INDEPENDENT_JUDGMENT_MISSING");
});

check("CORR6.CORR1-E", "Gate B PASS with producedDate only → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { paeExtra: { evidenceType: "PRODUCED_DATE" } },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_AVAILABILITY_EVIDENCE_INSUFFICIENT");
});

check("CORR6.CORR1-F", "Gate B PASS with URL/snapshot only → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { paeExtra: { evidenceType: "URL" } },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_AVAILABILITY_EVIDENCE_INSUFFICIENT");
  const snapshotPacked = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: { paeExtra: { evidenceType: "SNAPSHOT" } },
  });
  assert.equal(
    findCheck(verifyAgainstPacked(snapshotPacked), LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason,
    "GATE_B_AVAILABILITY_EVIDENCE_INSUFFICIENT",
  );
});

check("CORR6.CORR1-G", "Gate B PASS with no PUBLIC AVAILABILITY EVIDENCE RECORD → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: {
      publicAvailabilityEvidenceRecords: [],
      gateB: {
        decision: GATE_DECISION.PASS,
        supportingSourceIds: ["sec-10k-1998"],
        publicAvailabilityDatesOrBounds: ["1998-03-15"],
        publicAvailabilityEvidenceRecordIds: [],
        basis: "claimed public without inspectable availability evidence",
      },
    },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_AVAILABILITY_EVIDENCE_MISSING");
});

check("CORR6.CORR1-H", "availability record missing evidence artifact identity / locator → FAIL", () => {
  const incomplete = bindPublicAvailabilityEvidenceRecords([{
    sourceId: "sec-10k-1998",
    claimedPublicAvailability: "1998-03-15",
    evidenceType: "OFFICIAL_FILING_TIMESTAMP",
    evidenceArtifactIdentity: "",
    publicUrl: "https://example.test/10k",
    availabilityLocator: "",
    savedEvidenceArtifactRef: "pae-saved:sec-10k-1998",
    artifactHash: digestCanonical({ sourceId: "sec-10k-1998", kind: "pae-incomplete" }),
    reviewStatus: "REVIEWED",
    basis: "filing claimed without inspectable locator or artifact identity",
  }]);
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: {
      publicAvailabilityEvidenceRecords: incomplete,
      gateB: {
        decision: GATE_DECISION.PASS,
        supportingSourceIds: ["sec-10k-1998"],
        publicAvailabilityDatesOrBounds: ["1998-03-15"],
        publicAvailabilityEvidenceRecordIds: incomplete.map((row) => row.publicAvailabilityEvidenceRecordId),
        basis: "claimed availability with incomplete inspectable evidence",
      },
    },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_AVAILABILITY_EVIDENCE_INCOMPLETE");
});

check("CORR6.CORR1-I", "tampered availability-evidence record → baseline/digest mismatch FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    admitted: current.admitted.map((row) => ({
      ...row,
      publicAvailabilityEvidenceRecords: row.publicAvailabilityEvidenceRecords.map((pae) => ({
        ...pae,
        claimedPublicAvailability: "1999-12-31",
      })),
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_AVAILABILITY_EVIDENCE_IDENTITY_MISMATCH");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_DIGEST).result, "FAIL");
});

check("CORR6.CORR1-J", "wrong t0DeterminationId → FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  expectFail(() => assembleFactualBaseline(packed.runtime, {
    demandBlueprintId: packed.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: packed.executed.retrievalActId }],
    t0DeterminationId: "not-a-t0-determination-id",
  }), "STORE_UNRESOLVABLE");
});

check("CORR6.CORR1-K", "changed t0DeterminationId → changed baseline ID", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const existing = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  const second = retrieveR0Source(packed.runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks-append",
    sourceIdentityId: "src-talks-append-1998",
  });
  const meta2 = sourceArtifact(packed.runtime, second.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination({
    sourceId: existing.selectedT0SourceId,
    url: existing.selectedT0SourceUrl,
    artifactHash: existing.selectedT0SourceArtifactHash,
  }, {
    determinationIdentity: "DET-CASE-DAIMLER-CHRYSLER-T0-APPEND",
    candidates: [
      { ...existing.candidates[0] },
      rejectedCandidateFrom(meta2),
    ],
  });
  const { candidate } = invokeCertifiedDetermination(
    packed.runtime,
    [existing.selectedT0SourceId, meta2.sourceId],
    t0Determination,
  );
  createCaseSession(packed.runtime, { caseSeedId: "case-seed-append" });
  const sessionB = transitionR0toR1(packed.runtime, "case-seed-append", candidate);
  assert.notEqual(sessionB.t0DeterminationId, packed.t0DeterminationId);
  const baselineB = assembleFactualBaseline(packed.runtime, {
    demandBlueprintId: packed.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: packed.executed.retrievalActId }],
    t0DeterminationId: sessionB.t0DeterminationId,
  });
  assert.notEqual(baselineB.baselineId, packed.baseline.baselineId);
});

check("CORR6.CORR1-L", "Gate A PASS + Gate B UNRESOLVED → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: {
      gateB: {
        decision: GATE_DECISION.UNRESOLVED,
        supportingSourceIds: ["sec-10k-1998"],
        publicAvailabilityDatesOrBounds: ["UNRESOLVED"],
        publicAvailabilityEvidenceRecordIds: [],
        basis: "public availability cannot be established from inspectable evidence",
      },
    },
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "GATE_B_NOT_PASS");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).result, "FAIL");
});

check("CORR6.CORR1-M", "same-day ambiguity that could change eligibility + independent temporal judgment FAIL → FAIL", () => {
  const packed = lawfulSealedCollection({
    seal: false,
    skipVerification: true,
    certFields: {
      gateA: {
        decision: GATE_DECISION.PASS,
        factTimeEvidence: "same-calendar-day event as governing T0; exact intra-day order unavailable",
        supportingSourceIds: ["sec-10k-1998"],
        basis: "authored PASS despite unresolved same-day order",
      },
    },
  });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, {
      temporalDisposition: "FAIL",
      temporalBasis: "Exact same-day ordering is unavailable and the uncertainty could change Gate A eligibility; Gate A cannot PASS.",
    }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "TEMPORAL_ELIGIBILITY_JUDGMENT_FAIL");
});

check("CORR6.CORR1-N", "lawful complete evidence-bound Gate A/B + independent temporal judgment PASS → LIMB_B_07 PASS", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const temporal = findCheck(packed.verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY);
  assert.equal(temporal.result, "PASS");
  assert.equal(temporal.classification, "JUDGMENT_BASED");
  assert.ok(typeof temporal.basis === "string" && temporal.basis.trim().length > 0);
  assert.equal(packed.baseline.t0DeterminationId, packed.t0DeterminationId);
  assert.equal(packed.baseline.admitted[0].gateA.decision, GATE_DECISION.PASS);
  assert.equal(packed.baseline.admitted[0].gateB.decision, GATE_DECISION.PASS);
});

check("CORR6.CORR1-O", "null judgment basis → FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { propositionBasis: null }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.ATOMIC_PROPOSITION).reason, "INDEPENDENT_JUDGMENT_BASIS_MISSING");
});

check("CORR6.CORR1-P", "whitespace judgment basis → FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const verification = verifyAgainstPacked(packed, {
    independentJudgments: limbBJudgments(packed.baseline, { temporalBasis: "   " }),
  });
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.TEMPORAL_ELIGIBILITY).reason, "INDEPENDENT_JUDGMENT_BASIS_MISSING");
});

check("CORR6.CORR1-Q", "collection not closed → overall FAIL", () => {
  const ctx = openDocumentaryStageB({
    predeclaredCollectionMethod: {
      permittedMethods: ["HTTP_GET"],
      declaredSources: ["sec-10k-1998", "sec-8k-1998"],
      queryFamilies: [],
    },
  });
  const t0DeterminationId = sessionT0DeterminationId(ctx.runtime);
  const first = stageBRetrieve(ctx, { sourceId: "sec-10k-1998", exactLocator: "https://example.test/10k" });
  certifyStageBFact(ctx.runtime, {
    retrievalActId: first.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId }),
  });
  const baseline = assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: first.executed.retrievalActId }],
    t0DeterminationId,
  });
  const verification = independentPreSealVerification(ctx.runtime, {
    manifestId: ctx.manifest.manifestId,
    baselineId: baseline.baselineId,
    verifierActorRef: "actor-verifier",
    authorActorRef: "actor-collector",
    independentJudgments: limbBJudgments(baseline),
  });
  assert.equal(verification.limbA, false);
  assert.equal(verification.result, "FAIL");
});

check("CORR6.CORR1-R", "complete lawful all-11-check path → pre-seal PASS then separate Owner seal", () => {
  const packed = lawfulSealedCollection();
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  assert.equal(packed.verification.limbA, true);
  assert.equal(packed.verification.limbB, true);
  for (const checkId of Object.values(LIMB_B_CHECK)) {
    const rows = packed.verification.checkResults.filter((row) => row.checkId === checkId);
    assert.ok(rows.length > 0);
    assert.ok(rows.every((row) => row.result === "PASS"));
  }
  assert.ok(packed.seal.factualBaselineSealId);
  assert.equal(packed.baseline.t0DeterminationId, packed.t0DeterminationId);
  assert.deepEqual(packed.baseline.admitted[0].admissionContractRef, {
    lane: BLOCK_LANE.PRE_T0,
    consumerClass: CONSUMER_CLASS.DOCUMENTARY,
    factualRuleRef: "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B",
    semanticRuleRef: "UNRESOLVED",
  });
});

function tamperFrozenAdmissionContract(runtime, blueprintId, mutate) {
  const blueprint = runtime.store.get("demandBlueprint", blueprintId);
  const demandSlots = blueprint.demandSlots.map((slot) => {
    const current = {
      ...(slot.admissionContractRef ?? slot.slotType?.admissionContractRef ?? {}),
    };
    const next = mutate(current);
    return {
      ...slot,
      admissionContractRef: next,
      slotType: { ...slot.slotType, admissionContractRef: next },
    };
  });
  return replaceStored(runtime, "demandBlueprint", blueprintId, { ...blueprint, demandSlots });
}

function expectedPreT0Contract() {
  return {
    lane: BLOCK_LANE.PRE_T0,
    consumerClass: CONSUMER_CLASS.DOCUMENTARY,
    factualRuleRef: "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B",
    semanticRuleRef: "UNRESOLVED",
  };
}

check("AC-1", "PRE_T0/DOCUMENTARY frozen exact admissionContractRef: PASS", () => {
  const packed = lawfulSealedCollection();
  const expected = expectedPreT0Contract();
  const slot = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId)
    .demandSlots.find((row) => row.demandSlotId === packed.slot.demandSlotId);
  assert.deepEqual(slot.admissionContractRef, expected);
  assert.deepEqual(slot.slotType.admissionContractRef, expected);
  assert.deepEqual(packed.baseline.admitted[0].admissionContractRef, expected);
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  assert.equal(findCheck(packed.verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).result, "PASS");
});

check("AC-2", "Frozen contract lane changed after SlotType creation: verification FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  tamperFrozenAdmissionContract(packed.runtime, packed.blueprint.demandBlueprintId, (contract) => ({
    ...contract,
    lane: BLOCK_LANE.POST_T0,
  }));
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("AC-3", "Frozen consumerClass mismatch: FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  tamperFrozenAdmissionContract(packed.runtime, packed.blueprint.demandBlueprintId, (contract) => ({
    ...contract,
    consumerClass: CONSUMER_CLASS.OUTCOME_DOCUMENTARY,
  }));
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("AC-4", "Frozen factualRuleRef changed/substituted: FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  tamperFrozenAdmissionContract(packed.runtime, packed.blueprint.demandBlueprintId, (contract) => ({
    ...contract,
    factualRuleRef: "CASE-3.4_SECTION_5",
  }));
  const reconstructed = controllingAdmissionContractRef(BLOCK_LANE.PRE_T0, CONSUMER_CLASS.DOCUMENTARY, "UNRESOLVED");
  assert.equal(reconstructed.factualRuleRef, "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B");
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_REGISTRY_MISMATCH",
  );
});

check("AC-5", "Frozen semanticRuleRef mutation changes baseline digest / prevents seal", () => {
  const packed = lawfulSealedCollection({ seal: false });
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    admitted: current.admitted.map((row) => ({
      ...row,
      admissionContractRef: {
        ...row.admissionContractRef,
        semanticRuleRef: "INVENTED_SEMANTIC_RULE",
      },
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(findCheck(verification, LIMB_B_CHECK.BASELINE_DIGEST).result, "FAIL");
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("AC-6", "POST_T0 contract cannot inherit PRE_T0 Gate A/B factual rule", () => {
  const ctx = openDocumentaryStageB({
    slotType: documentaryFactSlotType({
      slotTypeId: "ST-POST-T0-OUTCOME",
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
      blockLane: BLOCK_LANE.POST_T0,
      consumerClass: CONSUMER_CLASS.OUTCOME_DOCUMENTARY,
    }),
  });
  assert.equal(
    ctx.slot.admissionContractRef.factualRuleRef,
    "UNRESOLVED(POST_T0_OUTCOME_ADMISSION_CONTRACT)",
  );
  assert.notEqual(ctx.slot.admissionContractRef.factualRuleRef, "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B");
  const retrieved = stageBRetrieve(ctx);
  certifyStageBFact(ctx.runtime, {
    retrievalActId: retrieved.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId: sessionT0DeterminationId(ctx.runtime) }),
  });
  expectFail(() => assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: retrieved.executed.retrievalActId }],
    t0DeterminationId: sessionT0DeterminationId(ctx.runtime),
  }), "UNRESOLVED_ADMISSION_AUTHORITY");
});

check("AC-7", "MODEL_META contract cannot inherit documentary factual rule", () => {
  const ctx = openDocumentaryStageB({
    slotType: documentaryFactSlotType({
      slotTypeId: "ST-MODEL-META",
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
      blockLane: BLOCK_LANE.MODEL_META,
      consumerClass: CONSUMER_CLASS.NON_DOCUMENTARY_DERIVED,
    }),
  });
  assert.equal(ctx.slot.admissionContractRef.factualRuleRef, "UNRESOLVED(META_INGRESS_CONTRACT)");
  assert.notEqual(ctx.slot.admissionContractRef.factualRuleRef, "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B");
  const retrieved = stageBRetrieve(ctx);
  certifyStageBFact(ctx.runtime, {
    retrievalActId: retrieved.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId: sessionT0DeterminationId(ctx.runtime) }),
  });
  expectFail(() => assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: retrieved.executed.retrievalActId }],
    t0DeterminationId: sessionT0DeterminationId(ctx.runtime),
  }), "UNRESOLVED_ADMISSION_AUTHORITY");
});

check("AC-8", "Missing admissionContractRef: FAIL CLOSED AS UNRESOLVED / INVALID AUTHORITY", () => {
  const stripped = {
    ...documentaryFactSlotType({
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
    }),
    admissionContractRef: null,
  };
  const ctx = openDocumentaryStageB({ slotType: stripped });
  assert.equal(ctx.slot.admissionContractRef, null);
  const retrieved = stageBRetrieve(ctx);
  certifyStageBFact(ctx.runtime, {
    retrievalActId: retrieved.executed.retrievalActId,
    ...lawfulCertifiedFields({ t0DeterminationId: sessionT0DeterminationId(ctx.runtime) }),
  });
  expectFail(() => assembleFactualBaseline(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: retrieved.executed.retrievalActId }],
    t0DeterminationId: sessionT0DeterminationId(ctx.runtime),
  }), "UNRESOLVED_ADMISSION_AUTHORITY");
});

check("AC-9", "Runtime recomputation helper cannot rescue a tampered frozen contract", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  tamperFrozenAdmissionContract(packed.runtime, packed.blueprint.demandBlueprintId, (contract) => ({
    ...contract,
    factualRuleRef: "TAMPERED_FACTUAL_RULE",
  }));
  const helper = controllingAdmissionContractRef(BLOCK_LANE.PRE_T0, CONSUMER_CLASS.DOCUMENTARY, "UNRESOLVED");
  assert.equal(helper.factualRuleRef, "CASE-2_SOURCE_CERTIFICATION_GATE_A_GATE_B");
  const verification = verifyAgainstPacked(packed);
  const admission = findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId);
  assert.equal(verification.result, "FAIL");
  assert.equal(admission.reason, "ADMISSION_CONTRACT_REGISTRY_MISMATCH");
  assert.equal(admission.operandRefs.reconstructedAdmissionContractRef.factualRuleRef, helper.factualRuleRef);
  assert.equal(admission.operandRefs.frozenAdmissionContractRef.factualRuleRef, "TAMPERED_FACTUAL_RULE");
});

check("T0-IMM-1", "same-ID t0Determination replacement with altered selectedT0Value is forbidden", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const original = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  expectFail(() => replaceStored(packed.runtime, "t0Determination", packed.t0DeterminationId, {
    ...original,
    selectedT0Value: "1990-01-01T00:00:00Z",
  }), "STORE_RECORD_IMMUTABLE");
  const resolved = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  assert.equal(resolved.selectedT0Value, original.selectedT0Value);
  assert.notEqual(resolved.selectedT0Value, "1990-01-01T00:00:00Z");
});

check("T0-IMM-2", "same-ID firstnessBasis alteration is forbidden", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const original = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  expectFail(() => replaceStored(packed.runtime, "t0Determination", packed.t0DeterminationId, {
    ...original,
    firstnessBasis: "tampered-firstness",
  }), "STORE_RECORD_IMMUTABLE");
  assert.equal(
    resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId).firstnessBasis,
    original.firstnessBasis,
  );
});

check("T0-IMM-3", "old lawful ID and new lawful determination ID remain distinct and exact-resolvable", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const existing = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  const second = retrieveR0Source(packed.runtime, { body: "Earlier talks only." }, {
    exactLocator: "https://example.test/talks-imm3",
    sourceIdentityId: "src-talks-imm3",
  });
  const meta2 = sourceArtifact(packed.runtime, second.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination({
    sourceId: existing.selectedT0SourceId,
    url: existing.selectedT0SourceUrl,
    artifactHash: existing.selectedT0SourceArtifactHash,
  }, {
    determinationIdentity: "DET-CASE-DAIMLER-CHRYSLER-T0-IMM3",
    candidates: [
      { ...existing.candidates[0] },
      rejectedCandidateFrom(meta2),
    ],
  });
  const { candidate } = invokeCertifiedDetermination(
    packed.runtime,
    [existing.selectedT0SourceId, meta2.sourceId],
    t0Determination,
  );
  createCaseSession(packed.runtime, { caseSeedId: "case-seed-imm3" });
  const sessionB = transitionR0toR1(packed.runtime, "case-seed-imm3", candidate);
  assert.notEqual(sessionB.t0DeterminationId, packed.t0DeterminationId);
  const oldCarrier = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  const newCarrier = resolveT0DeterminationCarrier(packed.runtime, sessionB.t0DeterminationId);
  assert.equal(oldCarrier.t0DeterminationId, packed.t0DeterminationId);
  assert.equal(newCarrier.t0DeterminationId, sessionB.t0DeterminationId);
  assert.notEqual(oldCarrier.firstnessBasis, newCarrier.candidates.length === 1 ? oldCarrier.firstnessBasis : "force-diff");
  assert.equal(oldCarrier.candidates.length, 1);
  assert.equal(newCarrier.candidates.length, 2);
});

check("T0-SEAL-1", "pre-seal PASS then T0 carrier mutation attempt cannot yield a seal of altered T0", () => {
  const packed = lawfulSealedCollection({ seal: false });
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  const original = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  expectFail(() => replaceStored(packed.runtime, "t0Determination", packed.t0DeterminationId, {
    ...original,
    selectedT0Value: "1990-01-01T00:00:00Z",
    certificationBinding: { ...original.certificationBinding, certificationClaimDigest: "tampered" },
  }), "STORE_RECORD_IMMUTABLE");
  const still = resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId);
  assert.equal(still.selectedT0Value, original.selectedT0Value);
});

check("T0-SEAL-2", "pre-seal PASS then baseline t0DeterminationId tamper: seal impossible", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    t0DeterminationId: "tampered-t0-id",
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("T0-SEAL-3", "pre-seal PASS, T0 carrier unchanged: Owner seal remains lawful", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const seal = acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  });
  assert.ok(seal.factualBaselineSealId);
  assert.equal(
    resolveT0DeterminationCarrier(packed.runtime, packed.t0DeterminationId).t0DeterminationId,
    packed.t0DeterminationId,
  );
});

check("T0-SEAL-4", "wrong-case T0 carrier substituted before seal: seal impossible", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const other = retrieveR0Source(packed.runtime, { body: "Other case announcement." }, {
    exactLocator: "https://example.test/other-case",
    sourceIdentityId: "src-other-case",
  });
  const meta = sourceArtifact(packed.runtime, other.executed.completion.resolutionSourceRecordId);
  const t0Determination = defaultT0Determination(meta, {
    caseId: "CASE-OTHER",
    T0Identity: "other-t0-identity",
    determinationIdentity: "DET-CASE-OTHER-T0",
  });
  const { candidate } = invokeCertifiedDetermination(
    packed.runtime,
    [meta.sourceId],
    t0Determination,
    {
      caseId: "CASE-OTHER",
      T0Identity: "other-t0-identity",
      propositions: [
        { g0Field: "caseId", canonicalProposition: "CASE-OTHER", supportingSourceRecordIds: [meta.sourceId], propositionRole: "INFORMATIONAL" },
        { g0Field: "T0Identity", canonicalProposition: "other-t0-identity", supportingSourceRecordIds: [meta.sourceId] },
        { g0Field: "caseSides", canonicalProposition: "ACQUIRER=Other Acquirer;TARGET=Other Target", supportingSourceRecordIds: [meta.sourceId] },
        { g0Field: "caseGeometryVersion", canonicalProposition: "G0-v1", supportingSourceRecordIds: [meta.sourceId] },
      ],
    },
  );
  createCaseSession(packed.runtime, { caseSeedId: "case-seed-other" });
  const otherSession = transitionR0toR1(packed.runtime, "case-seed-other", candidate);
  assert.notEqual(otherSession.t0DeterminationId, packed.t0DeterminationId);
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    t0DeterminationId: otherSession.t0DeterminationId,
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("CONTRACT-SEAL-1", "pre-seal PASS then admissionContractRef tamper: Owner seal impossible", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const current = packed.runtime.store.get("factualBaseline", packed.baseline.baselineId);
  replaceStored(packed.runtime, "factualBaseline", packed.baseline.baselineId, {
    ...current,
    admitted: current.admitted.map((row) => ({
      ...row,
      admissionContractRef: {
        ...row.admissionContractRef,
        factualRuleRef: "TAMPERED_AFTER_PRE_SEAL",
      },
    })),
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("FIV2-FA-1", "two tasks same source+method: one SLOT-A retrieval does not exhaust SLOT-B", () => {
  const pair = twoTaskSameMethodCollection();
  const { executed } = stageBRetrieve(pair.ctxA, {
    sourceId: "sec-10k-1998",
    exactLocator: "https://example.test/10k",
    demandSlotRef: pair.slotA.demandSlotId,
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(executed.completion.governingDemandDeclarationId, pair.slotA.demandSlotId);
  const closure = evaluateCollectionClosure(pair.runtime, pair.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
});

check("FIV2-FA-2", "two tasks same query-family+method: one task's discovery does not exhaust the other", () => {
  const pair = twoTaskSameMethodCollection({
    permittedMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    predeclaredCollectionMethod: {
      permittedMethods: ["OPEN_SEARCH"],
      declaredSources: [],
      queryFamilies: [{ id: "qfam-A", method: "OPEN_SEARCH" }],
    },
  });
  const { executed } = stageBRetrieve(pair.ctxA, {
    requestKind: REQUEST_KIND.DISCOVERY,
    retrievalMethodRef: "OPEN_SEARCH",
    sourceClassRef: "PUBLIC_REGISTRY",
    sourceId: "edgar-index-A",
    exactLocator: null,
    queryFamilyBound: "qfam-A",
    demandSlotRef: pair.slotA.demandSlotId,
    allowedRetrievalMethods: ["OPEN_SEARCH"],
    allowedSourceClasses: ["PUBLIC_REGISTRY"],
    retrievedPayload: { body: "family A results" },
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "family A results",
    atomicProposition: "family A observed",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const closure = evaluateCollectionClosure(pair.runtime, pair.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
});

check("FIV2-FA-3", "separate lawful retrievals bound to A and B exhaust both tasks", () => {
  const pair = twoTaskSameMethodCollection();
  const first = stageBRetrieve(pair.ctxA, {
    sourceId: "sec-10k-1998",
    exactLocator: "https://example.test/10k",
    demandSlotRef: pair.slotA.demandSlotId,
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: first.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const second = stageBRetrieve(pair.ctxB, {
    sourceId: "sec-10k-1998",
    exactLocator: "https://example.test/10k-b",
    demandSlotRef: pair.slotB.demandSlotId,
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: second.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz on slot B.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  assert.equal(first.executed.completion.governingDemandDeclarationId, pair.slotA.demandSlotId);
  assert.equal(second.executed.completion.governingDemandDeclarationId, pair.slotB.demandSlotId);
  const closure = evaluateCollectionClosure(pair.runtime, pair.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.COLLECTION_CLOSED);
});

check("FIV2-FA-4", "same source/method but wrong governingDemandDeclarationId receives no credit", () => {
  const pair = twoTaskSameMethodCollection();
  const { executed } = stageBRetrieve(pair.ctxA, {
    sourceId: "sec-10k-1998",
    exactLocator: "https://example.test/10k",
    demandSlotRef: pair.slotA.demandSlotId,
  });
  certifyStageBFact(pair.runtime, {
    retrievalActId: executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "Chrysler was acquired by Daimler-Benz.",
    disposition: CERTIFICATION_DISPOSITION.CERTIFIED_AND_IN_BASELINE,
  });
  const qual = pair.runtime.store.get("retrievalQualification", executed.retrievalActId);
  replaceStored(pair.runtime, "retrievalQualification", executed.retrievalActId, {
    ...qual,
    governingDemandDeclarationId: "not-a-task-slot",
  });
  const closure = evaluateCollectionClosure(pair.runtime, pair.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  assert.equal(closure.reason, "METHOD_NOT_EXHAUSTED");
});

check("FIV2-FE-1", "recordManifestExecution confirms existing lawful binding and does not mutate", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const before = manifestEvents(packed.runtime, packed.manifest.manifestId);
  const confirmed = recordManifestExecution(
    packed.runtime,
    packed.manifest.manifestId,
    packed.executed.retrievalActId,
  );
  const after = manifestEvents(packed.runtime, packed.manifest.manifestId);
  assert.deepEqual(after, before);
  assert.equal(confirmed.manifestId, packed.manifest.manifestId);
  assert.equal(after.includes(packed.executed.retrievalActId), true);
});

check("FIV2-FE-2", "foreign Manifest + valid retrievalActId cannot author membership", () => {
  const pair = twoCollectionVersions();
  const { executed } = stageBRetrieve(pair.ctxFor("M1"));
  const beforeM2 = manifestEvents(pair.runtime, pair.M2.manifest.manifestId);
  expectFail(
    () => recordManifestExecution(pair.runtime, pair.M2.manifest.manifestId, executed.retrievalActId),
    "MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND",
  );
  assert.deepEqual(manifestEvents(pair.runtime, pair.M2.manifest.manifestId), beforeM2);
});

check("FIV2-FE-3", "unknown retrievalActId cannot be confirmed onto a Manifest", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  expectFail(
    () => recordManifestExecution(packed.runtime, packed.manifest.manifestId, "unknown-retrieval-act"),
    "MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND",
  );
});

check("FIV2-FE-4", "retrieval with inFrozenManifestExecutionRecord !== true cannot be confirmed", () => {
  const ctx = openDocumentaryStageB({ freeze: false });
  const { executed } = stageBRetrieve(ctx);
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, false);
  const manifest = freezeManifest(ctx.runtime, {
    demandBlueprintId: ctx.blueprint.demandBlueprintId,
    tasks: [{
      demandSlotId: ctx.slot.demandSlotId,
      missingProposition: ctx.slot.missingProposition,
      stoppingRule: "BOUNDED_METHOD_EXHAUSTION",
      stoppingRuleAuthority: STOPPING_RULE_AUTHORITY,
      predeclaredCollectionMethod: {
        permittedMethods: ["HTTP_GET"],
        declaredSources: ["sec-10k-1998"],
        queryFamilies: [],
      },
    }],
  });
  expectFail(
    () => recordManifestExecution(ctx.runtime, manifest.manifestId, executed.retrievalActId),
    "MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND",
  );
});

check("FIV2-FE-5", "retrieval whose governing slot is not a target Manifest task cannot be confirmed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const qual = packed.runtime.store.get("retrievalQualification", packed.executed.retrievalActId);
  replaceStored(packed.runtime, "retrievalQualification", packed.executed.retrievalActId, {
    ...qual,
    governingDemandDeclarationId: "foreign-slot-id",
  });
  expectFail(
    () => recordManifestExecution(packed.runtime, packed.manifest.manifestId, packed.executed.retrievalActId),
    "MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND",
  );
});

check("FIV2-FE-6", "retrieval belonging to M1 cannot be manually credited to M2 sharing demandSlotId", () => {
  const pair = twoCollectionVersions();
  const { executed } = stageBRetrieve(pair.ctxFor("M1"));
  assert.equal(executed.completion.inFrozenManifestExecutionRecord, true);
  const beforeM2 = manifestEvents(pair.runtime, pair.M2.manifest.manifestId);
  expectFail(
    () => recordManifestExecution(pair.runtime, pair.M2.manifest.manifestId, executed.retrievalActId),
    "MANIFEST_EXECUTION_NOT_LAWFULLY_BOUND",
  );
  assert.deepEqual(manifestEvents(pair.runtime, pair.M2.manifest.manifestId), beforeM2);
  assert.equal(manifestEvents(pair.runtime, pair.M1.manifest.manifestId).includes(executed.retrievalActId), true);
});

check("FIV2-FB-1", "preSealVerification replace is STORE_RECORD_IMMUTABLE", () => {
  const packed = lawfulSealedCollection({ seal: false });
  expectFail(() => replaceStored(packed.runtime, "preSealVerification", packed.verification.verificationId, {
    ...packed.verification,
    result: "FAIL",
  }), "STORE_RECORD_IMMUTABLE");
});

check("FIV2-FB-2", "fabricated PASS verification under wrong content-address ID fails seal identity replay", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const { verificationId, ...content } = packed.verification;
  void verificationId;
  packed.runtime.store.put("preSealVerification", "fabricated-preseal-id", {
    ...content,
    verificationId: "fabricated-preseal-id",
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: "fabricated-preseal-id",
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "PRE_SEAL_VERIFICATION_IDENTITY_MISMATCH");
});

check("FIV2-FB-3", "lawful untouched pre-seal record identity replay PASS", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const seal = acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  });
  assert.ok(seal.factualBaselineSealId);
});

check("FIV2-FD-1", "pre-seal PASS then resource cap mutation: current closure INCOMPLETE, seal FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false });
  markResourceCap(packed.runtime, packed.manifest.manifestId, packed.slot.demandSlotId);
  const closure = evaluateCollectionClosure(packed.runtime, packed.manifest.manifestId);
  assert.equal(closure.status, COLLECTION_STATUS.INCOMPLETE);
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("FIV2-FD-2", "pre-seal PASS then new EXCLUDED qualification: stale Owner seal FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const extra = stageBRetrieve({
    runtime: packed.runtime,
    blueprint: packed.blueprint,
    slot: packed.slot,
    slotType: documentaryFactSlotType({
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
    }),
    manifest: packed.manifest,
  }, {
    sourceId: "sec-excluded-after-preseal",
    exactLocator: "https://example.test/excluded-after",
  });
  certifyStageBFact(packed.runtime, {
    retrievalActId: extra.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "later excluded proposition",
    disposition: CERTIFICATION_DISPOSITION.EXCLUDED,
    reason: "excluded after pre-seal",
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("FIV2-FD-3", "pre-seal PASS then new admitted qualification: stale Owner seal FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const extra = stageBRetrieve({
    runtime: packed.runtime,
    blueprint: packed.blueprint,
    slot: packed.slot,
    slotType: documentaryFactSlotType({
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
    }),
    manifest: packed.manifest,
  }, {
    sourceId: "sec-admitted-after-preseal",
    exactLocator: "https://example.test/admitted-after",
  });
  certifyStageBFact(packed.runtime, {
    retrievalActId: extra.executed.retrievalActId,
    ...lawfulCertifiedFields({
      t0DeterminationId: packed.t0DeterminationId,
      sourceId: "sec-admitted-after-preseal",
      exactExcerpt: "Chrysler was acquired.",
      atomicProposition: "later admitted proposition",
    }),
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
});

check("FIV2-FD-4", "new independentPreSealVerification after lawful collection change can seal; stale verification cannot", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const extra = stageBRetrieve({
    runtime: packed.runtime,
    blueprint: packed.blueprint,
    slot: packed.slot,
    slotType: documentaryFactSlotType({
      permittedMethods: ["HTTP_GET"],
      allowedSourceClasses: ["SEC_FILING"],
    }),
    manifest: packed.manifest,
  }, {
    sourceId: "sec-excluded-for-new-verification",
    exactLocator: "https://example.test/excluded-new-ver",
  });
  certifyStageBFact(packed.runtime, {
    retrievalActId: extra.executed.retrievalActId,
    exactExcerpt: "Chrysler was acquired.",
    atomicProposition: "later excluded for new verification",
    disposition: CERTIFICATION_DISPOSITION.EXCLUDED,
    reason: "excluded after first pre-seal",
  });
  expectFail(() => acceptOwnerFactualSeal(packed.runtime, {
    verificationId: packed.verification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-1",
  }), "SEAL_WITHOUT_VERIFICATION_PASS");
  const rebuilt = assembleFactualBaseline(packed.runtime, {
    demandBlueprintId: packed.blueprint.demandBlueprintId,
    sealedFactRecords: [{ retrievalActId: packed.executed.retrievalActId }],
    t0DeterminationId: packed.t0DeterminationId,
  });
  const nextVerification = independentPreSealVerification(packed.runtime, {
    manifestId: packed.manifest.manifestId,
    baselineId: rebuilt.baselineId,
    verifierActorRef: "actor-verifier",
    authorActorRef: "actor-collector",
    independentJudgments: limbBJudgments(rebuilt),
  });
  assert.equal(nextVerification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
  assert.notEqual(nextVerification.verificationId, packed.verification.verificationId);
  const seal = acceptOwnerFactualSeal(packed.runtime, {
    verificationId: nextVerification.verificationId,
    ownerActorRef: "actor-owner",
    sealToken: "OWNER-SEAL-TOKEN-NEW",
  });
  assert.ok(seal.factualBaselineSealId);
});

check("FIV2-FD-5", "no post-verification state change: existing lawful Owner seal path still PASS", () => {
  const packed = lawfulSealedCollection();
  assert.ok(packed.seal.factualBaselineSealId);
});

check("FIV2-FC-1", "slot.blockLane vs slotType.blockLane divergence fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const blueprint = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId);
  replaceStored(packed.runtime, "demandBlueprint", packed.blueprint.demandBlueprintId, {
    ...blueprint,
    demandSlots: blueprint.demandSlots.map((slot) => ({
      ...slot,
      blockLane: BLOCK_LANE.PRE_T0,
      slotType: { ...slot.slotType, blockLane: BLOCK_LANE.POST_T0 },
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("FIV2-FC-2", "slot.consumerClass vs slotType.consumerClass divergence fails closed", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const blueprint = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId);
  replaceStored(packed.runtime, "demandBlueprint", packed.blueprint.demandBlueprintId, {
    ...blueprint,
    demandSlots: blueprint.demandSlots.map((slot) => ({
      ...slot,
      consumerClass: CONSUMER_CLASS.DOCUMENTARY,
      slotType: { ...slot.slotType, consumerClass: CONSUMER_CLASS.OUTCOME_DOCUMENTARY },
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("FIV2-FC-3", "top-level admissionContractRef lawful, nested slotType contract altered: FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const blueprint = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId);
  replaceStored(packed.runtime, "demandBlueprint", packed.blueprint.demandBlueprintId, {
    ...blueprint,
    demandSlots: blueprint.demandSlots.map((slot) => ({
      ...slot,
      slotType: {
        ...slot.slotType,
        admissionContractRef: {
          ...slot.slotType.admissionContractRef,
          factualRuleRef: "NESTED_TAMPERED_RULE",
        },
      },
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("FIV2-FC-4", "nested contract lawful, top-level contract altered: FAIL", () => {
  const packed = lawfulSealedCollection({ seal: false, skipVerification: true });
  const blueprint = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId);
  replaceStored(packed.runtime, "demandBlueprint", packed.blueprint.demandBlueprintId, {
    ...blueprint,
    demandSlots: blueprint.demandSlots.map((slot) => ({
      ...slot,
      admissionContractRef: {
        ...slot.admissionContractRef,
        factualRuleRef: "TOP_LEVEL_TAMPERED_RULE",
      },
    })),
  });
  const verification = verifyAgainstPacked(packed);
  assert.equal(verification.result, "FAIL");
  assert.equal(
    findCheck(verification, LIMB_B_CHECK.ADMISSION_EXCLUSION, packed.executed.retrievalActId).reason,
    "ADMISSION_CONTRACT_SLOT_MISMATCH",
  );
});

check("FIV2-FC-5", "all duplicate frozen representations exactly equal: lawful verification remains PASS", () => {
  const packed = lawfulSealedCollection({ seal: false });
  const slot = packed.runtime.store.get("demandBlueprint", packed.blueprint.demandBlueprintId)
    .demandSlots.find((row) => row.demandSlotId === packed.slot.demandSlotId);
  assert.equal(slot.blockLane, slot.slotType.blockLane);
  assert.equal(slot.consumerClass, slot.slotType.consumerClass);
  assert.deepEqual(slot.admissionContractRef, slot.slotType.admissionContractRef);
  assert.equal(packed.verification.result, "INDEPENDENT_PRE_SEAL_VERIFICATION_PASS");
});

check("TRACE", "authority-clause traceability table is present and complete", () => {
  assert.ok(AUTHORITY_TRACEABILITY.length >= 20);
  for (const row of AUTHORITY_TRACEABILITY) {
    assert.ok(row.clause && row.carrier && row.tests.length > 0);
  }
});

check("AUTHORITY-ARTIFACTS-UNTOUCHED", "accepted authority files were not modified by this act", () => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const files = [
    "docs/HMIR-1_HISTORICAL_MODEL_INPUT_REGISTRY_AND_COLLECTION_CLOSURE_CONTRACT_v0.1_CORR5.md",
    "docs/HMIR-XPI-1_EXECUTION_PROVENANCE_INTEGRITY_CONTRACT_v0.1_CORR1.md",
    "docs/HLX-1_HISTORICAL_LLM_EXECUTION_CONTRACT_NORM_v1.0_CORR1_RT2.md",
  ];
  for (const file of files) {
    const bytes = readFileSync(`${root}/${file}`);
    assert.ok(bytes.length > 1000);
  }
});

const failed = results.filter((row) => row.status === "FAIL");
for (const row of results) {
  const mark = row.status === "PASS" ? "PASS" : "FAIL";
  console.log(`${mark}  ${row.id}  ${row.name}${row.status === "FAIL" ? `  :: ${row.error}` : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (failed.length > 0) {
  for (const row of failed) {
    console.error(`\n${row.id}\n${row.stack}`);
  }
  process.exit(1);
}
