import {
  CLAIM_IDS,
  ENGINE_STATE_BY_BRANCH,
  PROVIDER_CANDIDATE_SCHEMA_VERSION,
  PROVIDER_PROJECTION_VERSION,
} from "./agentContractConstants.js";

export class ProviderSemanticCandidateValidationError extends Error {
  constructor(detail) {
    super(`ProviderSemanticCandidateValidationError | detail=${detail}`);
    this.name = "ProviderSemanticCandidateValidationError";
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new ProviderSemanticCandidateValidationError(detail);
}

const INTERPRETATION_STATUS_VALUES = Object.freeze([
  "INTERPRETATION_SUPPORTED",
  "INTERPRETATION_QUALIFIED",
  "INTERPRETATION_CONSTRAINED",
  "ABSTAINED_INSUFFICIENT_EVIDENCE",
]);

const ABSTENTION_REASON_VALUES = Object.freeze([
  "NO_SURVIVING_ADMISSIBLE_EVIDENCE",
  "COMPARATOR_DID_NOT_RUN",
  "IDENTITY_UNRESOLVED",
]);

const CLAIM_TYPE_VALUES = Object.freeze([
  "DETERMINISTIC_FACT",
  "DIRECT_EVIDENCE",
  "BOUNDED_INTERPRETATION",
  "ALTERNATIVE_HYPOTHESIS",
  "UNCERTAINTY_DISCLOSURE",
  "WATCHPOINT",
  "SCOPE_LIMITATION_DISCLOSURE",
]);

const SUPPORT_BASIS_VALUES = Object.freeze([
  "PRIMARY_COMPARABLE",
  "MIXED_PRIMARY_CONTEXTUAL",
  "CONTEXTUAL_ONLY",
  "NON_COMPARABLE_DIAGNOSTIC_ONLY",
]);

const CONFLICT_LEVEL_VALUES = Object.freeze([
  "NO_CONFLICTING_COMPARABLE_EVIDENCE",
  "CONFLICTING_COMPARABLE_EVIDENCE_PRESENT",
]);

const HYPOTHESIS_ORDERING_VALUES = Object.freeze(["RANKED", "CO_EQUAL"]);

const AFFECTS_SCALE_VALUES = Object.freeze([
  "STATE_IDENTITY",
  "DIRECTION",
  "SEVERITY",
  "CONFIDENCE",
  "DETAIL",
]);

const WATCHPOINT_HORIZON_VALUES = Object.freeze([
  "30d",
  "6m",
  "18m",
  "unspecified",
]);

const ENGINE_STATE_VALUES = Object.freeze(Object.values(ENGINE_STATE_BY_BRANCH));

const nonEmptyString = Object.freeze({ type: "string", minLength: 1 });
const stringArray = Object.freeze({ type: "array", items: nonEmptyString });

function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

const evidenceBasisDefinition = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["supportBasis", "conflictLevel", "materialUnknownsPresent"],
  properties: Object.freeze({
    supportBasis: Object.freeze({ enum: SUPPORT_BASIS_VALUES }),
    conflictLevel: Object.freeze({ enum: CONFLICT_LEVEL_VALUES }),
    materialUnknownsPresent: Object.freeze({ type: "boolean" }),
  }),
});

// Provider-neutral structural schema for the provider-authored candidate.
// Cross-field rules (reference resolution, hypothesis ordering law, blocked
// claims, Case A/Case B scope) are enforced by validateProviderSemanticCandidate
// below; JSON Schema alone cannot express them. The exported graph is
// recursively frozen so no reachable definition, required[], enum[], or
// properties object can be mutated at any depth.
export const providerSemanticCandidateSchema = deepFreeze({
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: PROVIDER_CANDIDATE_SCHEMA_VERSION,
  title: "MergeVue provider semantic candidate",
  type: "object",
  additionalProperties: false,
  required: Object.freeze([
    "interpretationStatus",
    "abstentionReason",
    "interpretation",
    "uncertainty",
    "claims",
    "clientNarrative",
  ]),
  properties: Object.freeze({
    interpretationStatus: Object.freeze({ enum: INTERPRETATION_STATUS_VALUES }),
    abstentionReason: Object.freeze({ enum: Object.freeze([null, ...ABSTENTION_REASON_VALUES]) }),
    interpretation: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze([
        "hypotheses",
        "decisiveEvidence",
        "conflictingEvidence",
        "missingEvidence",
        "changeConditions",
        "affectedResources",
        "watchpoints",
      ]),
      properties: Object.freeze({
        transitionPattern: Object.freeze({
          type: "object",
          additionalProperties: false,
          required: Object.freeze([
            "label",
            "evidenceBasis",
            "evidenceRefs",
            "factRefs",
            "contextRefs",
          ]),
          properties: Object.freeze({
            label: nonEmptyString,
            evidenceBasis: Object.freeze({ $ref: "#/definitions/evidenceBasis" }),
            evidenceRefs: stringArray,
            factRefs: stringArray,
            contextRefs: stringArray,
          }),
        }),
        frictionMechanism: Object.freeze({
          type: "object",
          additionalProperties: false,
          required: Object.freeze([
            "label",
            "evidenceBasis",
            "evidenceRefs",
            "contextRefs",
          ]),
          properties: Object.freeze({
            label: nonEmptyString,
            evidenceBasis: Object.freeze({ $ref: "#/definitions/evidenceBasis" }),
            evidenceRefs: stringArray,
            contextRefs: stringArray,
          }),
        }),
        hypotheses: Object.freeze({
          type: "object",
          additionalProperties: false,
          required: Object.freeze(["ordering", "items"]),
          properties: Object.freeze({
            ordering: Object.freeze({ enum: HYPOTHESIS_ORDERING_VALUES }),
            items: Object.freeze({
              type: "array",
              items: Object.freeze({
                type: "object",
                additionalProperties: false,
                required: Object.freeze([
                  "hypothesisId",
                  "statement",
                  "evidenceBasis",
                  "decisiveEvidenceRefs",
                  "conflictingEvidenceRefs",
                  "contextRefs",
                  "requiresEngineFactNotEstablished",
                ]),
                properties: Object.freeze({
                  hypothesisId: Object.freeze({ type: "string", pattern: "^H[0-9]+$" }),
                  rank: Object.freeze({ type: "integer", minimum: 1 }),
                  statement: nonEmptyString,
                  evidenceBasis: Object.freeze({ $ref: "#/definitions/evidenceBasis" }),
                  decisiveEvidenceRefs: stringArray,
                  conflictingEvidenceRefs: stringArray,
                  contextRefs: stringArray,
                  requiresEngineFactNotEstablished: stringArray,
                }),
              }),
            }),
          }),
        }),
        scenarioInterpretation: Object.freeze({
          type: "object",
          additionalProperties: false,
          required: Object.freeze(["statement", "boundToEngineState", "evidenceBasis"]),
          properties: Object.freeze({
            statement: nonEmptyString,
            boundToEngineState: Object.freeze({ enum: ENGINE_STATE_VALUES }),
            evidenceBasis: Object.freeze({ $ref: "#/definitions/evidenceBasis" }),
          }),
        }),
        decisiveEvidence: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["statement", "evidenceRefs"]),
            properties: Object.freeze({
              statement: nonEmptyString,
              evidenceRefs: stringArray,
            }),
          }),
        }),
        conflictingEvidence: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["statement", "evidenceRefs"]),
            properties: Object.freeze({
              statement: nonEmptyString,
              evidenceRefs: stringArray,
            }),
          }),
        }),
        missingEvidence: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["statement", "uncertaintyIds"]),
            properties: Object.freeze({
              statement: nonEmptyString,
              uncertaintyIds: stringArray,
            }),
          }),
        }),
        changeConditions: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["statement", "uncertaintyIds", "wouldChange"]),
            properties: Object.freeze({
              statement: nonEmptyString,
              uncertaintyIds: stringArray,
              wouldChange: Object.freeze({ enum: AFFECTS_SCALE_VALUES }),
            }),
          }),
        }),
        affectedResources: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["label", "contextRefs"]),
            properties: Object.freeze({
              label: nonEmptyString,
              contextRefs: stringArray,
            }),
          }),
        }),
        watchpoints: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["statement", "horizon", "contextRefs", "evidenceRefs"]),
            properties: Object.freeze({
              statement: nonEmptyString,
              horizon: Object.freeze({ enum: WATCHPOINT_HORIZON_VALUES }),
              contextRefs: stringArray,
              evidenceRefs: stringArray,
            }),
          }),
        }),
      }),
    }),
    uncertainty: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["disclosures"]),
      properties: Object.freeze({
        disclosures: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze([
              "uncertaintyId",
              "affects",
              "clientStatement",
              "unresolvedEngineFacts",
            ]),
            properties: Object.freeze({
              uncertaintyId: nonEmptyString,
              affects: Object.freeze({ enum: AFFECTS_SCALE_VALUES }),
              clientStatement: nonEmptyString,
              unresolvedEngineFacts: stringArray,
            }),
          }),
        }),
      }),
    }),
    claims: Object.freeze({
      type: "array",
      items: Object.freeze({
        type: "object",
        additionalProperties: false,
        required: Object.freeze(["claimId", "claimType", "text", "refs", "contextRefs"]),
        properties: Object.freeze({
          claimId: nonEmptyString,
          claimType: Object.freeze({ enum: CLAIM_TYPE_VALUES }),
          text: nonEmptyString,
          refs: stringArray,
          contextRefs: stringArray,
        }),
      }),
    }),
    clientNarrative: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze(["language", "sections"]),
      properties: Object.freeze({
        language: nonEmptyString,
        sections: Object.freeze({
          type: "array",
          items: Object.freeze({
            type: "object",
            additionalProperties: false,
            required: Object.freeze(["sectionId", "text", "derivedFromClaimIds"]),
            properties: Object.freeze({
              sectionId: nonEmptyString,
              text: nonEmptyString,
              derivedFromClaimIds: stringArray,
            }),
          }),
        }),
      }),
    }),
  }),
  definitions: Object.freeze({
    evidenceBasis: evidenceBasisDefinition,
  }),
});

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function resolveSchemaNode(node, rootSchema) {
  if (node != null && typeof node === "object" && Object.hasOwn(node, "$ref")) {
    const pointer = node.$ref;
    if (typeof pointer !== "string" || !pointer.startsWith("#/definitions/")) {
      fail(`schema carries an unsupported $ref ${JSON.stringify(pointer)}`);
    }
    const name = pointer.slice("#/definitions/".length);
    const definition = rootSchema.definitions?.[name];
    if (definition === undefined) fail(`schema $ref does not resolve: ${pointer}`);
    return definition;
  }
  return node;
}

function validateSchemaNode(value, schemaNode, path, rootSchema) {
  const node = resolveSchemaNode(schemaNode, rootSchema);
  if (node === null || typeof node !== "object") fail(`invalid schema node at ${path}`);

  if (Object.hasOwn(node, "enum")) {
    if (!node.enum.includes(value)) {
      fail(`${path} is not a lawful enum value: ${JSON.stringify(value)}`);
    }
    return;
  }

  const type = node.type;
  if (type === "object") {
    if (!isPlainObject(value)) fail(`${path} must be an object`);
    if (node.additionalProperties === false) {
      const allowed = new Set(Object.keys(node.properties ?? {}));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) fail(`${path} carries unknown key ${JSON.stringify(key)}`);
      }
    }
    for (const key of node.required ?? []) {
      if (!Object.hasOwn(value, key)) fail(`${path} is missing required key ${JSON.stringify(key)}`);
    }
    for (const [key, childSchema] of Object.entries(node.properties ?? {})) {
      if (Object.hasOwn(value, key)) {
        validateSchemaNode(value[key], childSchema, `${path}.${key}`, rootSchema);
      }
    }
    return;
  }
  if (type === "array") {
    if (!Array.isArray(value)) fail(`${path} must be an array`);
    if (node.items !== undefined) {
      value.forEach((item, index) => {
        validateSchemaNode(item, node.items, `${path}[${index}]`, rootSchema);
      });
    }
    return;
  }
  if (type === "string") {
    if (typeof value !== "string") fail(`${path} must be a string`);
    if (node.minLength !== undefined && value.length < node.minLength) {
      fail(`${path} must not be shorter than ${node.minLength}`);
    }
    if (node.pattern !== undefined && !new RegExp(node.pattern).test(value)) {
      fail(`${path} does not match ${node.pattern}`);
    }
    return;
  }
  if (type === "integer") {
    if (typeof value !== "number" || !Number.isInteger(value)) fail(`${path} must be an integer`);
    if (node.minimum !== undefined && value < node.minimum) {
      fail(`${path} must not be below ${node.minimum}`);
    }
    return;
  }
  if (type === "boolean") {
    if (typeof value !== "boolean") fail(`${path} must be a boolean`);
    return;
  }
  if (type === "null") {
    if (value !== null) fail(`${path} must be null`);
    return;
  }
  fail(`schema node at ${path} has unsupported type ${JSON.stringify(type)}`);
}

const UREF_PREFIX = "uref://";
const BANNED_KEY_NAMES = new Set(Object.freeze([
  "probability",
  "likelihood",
  "odds",
  "confidence",
  "percent",
  "percentage",
  "score",
  "scores",
  "weight",
  "weights",
  "ranking",
  "calibration",
  "temperature",
  "topP",
  "top_k",
  "providerIdentity",
  "modelIdentity",
  "executedAt",
  "provenance",
  "contextRefsUsed",
  "resultSchemaVersion",
  "interpretationId",
  "engineFactsRef",
  "materialUncertaintyPresent",
  "suppressedDeterministicOutputs",
]));
const BANNED_STRING_FRAGMENTS = Object.freeze([
  "freetiernarratives",
  "http://",
  "https://",
  "www.",
  "@",
  "most likely",
  "probability",
  "likelihood",
]);
const PERCENT_PATTERN = /[0-9]+(\.[0-9]+)?\s*%/;
const RANK_PATH_PATTERN = /^candidate\.interpretation\.hypotheses\.items\[\d+\]\.rank$/;

function assertCandidatePurity(value, path) {
  if (typeof value === "number") {
    if (!RANK_PATH_PATTERN.test(path)) {
      fail(`${path} carries a numeric value; only hypothesis rank may be numeric`);
    }
    return;
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    for (const fragment of BANNED_STRING_FRAGMENTS) {
      if (lower.includes(fragment)) {
        fail(`${path} contains prohibited content (${JSON.stringify(fragment)})`);
      }
    }
    if (PERCENT_PATTERN.test(value)) fail(`${path} contains a numeric percentage`);
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertCandidatePurity(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (BANNED_KEY_NAMES.has(key)) fail(`${path}.${key} is not authorable by the provider`);
    assertCandidatePurity(child, `${path}.${key}`);
  }
}

function requirePlainObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || !isPlainObject(value)) {
    fail(`${label} must be an object`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value;
}

function resolveProjection(projection) {
  requirePlainObject(projection, "providerProjection");
  if (projection.providerProjectionVersion !== PROVIDER_PROJECTION_VERSION) {
    fail(`providerProjection.providerProjectionVersion must be ${PROVIDER_PROJECTION_VERSION}`);
  }
  const engineSnapshot = requirePlainObject(projection.engineSnapshot, "providerProjection.engineSnapshot");
  const engine = requirePlainObject(engineSnapshot.engine, "providerProjection.engineSnapshot.engine");
  const outcome = requirePlainObject(engine.outcome, "providerProjection.engineSnapshot.engine.outcome");
  const observations = requireArray(engine.observations, "providerProjection.engineSnapshot.engine.observations");
  const uncertainty = requirePlainObject(projection.structuredUncertainty, "providerProjection.structuredUncertainty");
  const pack = requirePlainObject(projection.interpretationContextPack, "providerProjection.interpretationContextPack");

  const qrefs = new Set();
  for (const observation of observations) {
    const ref = requirePlainObject(observation, "observation").observationRef;
    if (typeof ref !== "string" || ref.length === 0) fail("projection observation lacks an observationRef");
    qrefs.add(ref);
  }
  const factrefs = new Set();
  for (const fact of requireArray(uncertainty.known, "structuredUncertainty.known")) {
    const ref = requirePlainObject(fact, "known fact").factRef;
    if (typeof ref !== "string" || ref.length === 0) fail("projection known fact lacks a factRef");
    factrefs.add(ref);
  }
  const mrefDomains = new Map();
  for (const item of requireArray(pack.selectedContextItems, "selectedContextItems")) {
    const ref = requirePlainObject(item, "context item").contextRef;
    if (typeof ref !== "string" || ref.length === 0) fail("projection context item lacks a contextRef");
    const domain = item.contextDomain;
    if (typeof domain !== "string") fail("projection context item lacks a contextDomain");
    if (!mrefDomains.has(ref)) mrefDomains.set(ref, new Set());
    mrefDomains.get(ref).add(domain);
  }
  const uncertaintyIds = new Set();
  for (const item of requireArray(uncertainty.items, "structuredUncertainty.items")) {
    const id = requirePlainObject(item, "uncertainty item").uncertaintyId;
    if (typeof id !== "string" || id.length === 0) fail("projection uncertainty item lacks an uncertaintyId");
    uncertaintyIds.add(id);
  }
  const claimBoundaryIds = new Set();
  for (const boundary of requireArray(uncertainty.claimBoundaries, "structuredUncertainty.claimBoundaries")) {
    const id = requirePlainObject(boundary, "claim boundary").claimId;
    if (typeof id !== "string") fail("projection claim boundary lacks a claimId");
    claimBoundaryIds.add(id);
  }
  const blockedClaimIds = new Set();
  for (const row of requireArray(projection.activeConstraints, "providerProjection.activeConstraints")) {
    for (const claimId of requireArray(
      requirePlainObject(row, "constraint row").blockedClaimIds,
      "constraint row blockedClaimIds",
    )) {
      blockedClaimIds.add(claimId);
    }
  }

  return {
    outcome,
    originBranch: uncertainty.originBranch,
    permittedOutputScope: projection.permittedOutputScope,
    qrefs,
    factrefs,
    mrefDomains,
    uncertaintyIds,
    claimBoundaryIds,
    blockedClaimIds,
    unavailableQrefs: new Set(requireArray(
      uncertainty.unavailableEvidenceRefs,
      "structuredUncertainty.unavailableEvidenceRefs",
    )),
  };
}

function isQref(ref) {
  return typeof ref === "string" && ref.startsWith("qref://");
}

function isFactref(ref) {
  return typeof ref === "string" && ref.startsWith("factref://");
}

function isMref(ref) {
  return typeof ref === "string" && ref.startsWith("mref://");
}

function isUref(ref) {
  return typeof ref === "string" && ref.startsWith(UREF_PREFIX);
}

function assertResolvingQrefs(refs, label, state, { allowUnavailable = false } = {}) {
  for (const ref of refs) {
    if (!isQref(ref)) fail(`${label} entry is not a qref: ${JSON.stringify(ref)}`);
    if (!state.qrefs.has(ref)) fail(`${label} qref does not resolve: ${JSON.stringify(ref)}`);
    if (!allowUnavailable && state.unavailableQrefs.has(ref)) {
      fail(`${label} qref is unavailable evidence and may not support a statement: ${JSON.stringify(ref)}`);
    }
  }
}

function assertResolvingFactrefs(refs, label, state) {
  for (const ref of refs) {
    if (!isFactref(ref)) fail(`${label} entry is not a factref: ${JSON.stringify(ref)}`);
    if (!state.factrefs.has(ref)) fail(`${label} factref does not resolve: ${JSON.stringify(ref)}`);
  }
}

function assertResolvingMrefs(refs, label, state, { requireFrictionDomain = false } = {}) {
  for (const ref of refs) {
    if (!isMref(ref)) fail(`${label} entry is not an mref: ${JSON.stringify(ref)}`);
    const domains = state.mrefDomains.get(ref);
    if (domains === undefined) fail(`${label} mref does not resolve: ${JSON.stringify(ref)}`);
    if (requireFrictionDomain && !domains.has("FRICTION_AND_RESOURCES")) {
      fail(`${label} mref does not resolve inside FRICTION_AND_RESOURCES: ${JSON.stringify(ref)}`);
    }
  }
}

function assertResolvingUref(ref, label, state) {
  if (typeof ref !== "string" || !ref.startsWith(UREF_PREFIX)) {
    fail(`${label} is not a uref reference: ${JSON.stringify(ref)}`);
  }
  const suffix = ref.slice(UREF_PREFIX.length);
  if (!state.uncertaintyIds.has(suffix)) {
    fail(`${label} does not resolve to an existing uncertaintyId: ${JSON.stringify(ref)}`);
  }
}

function assertRawUncertaintyIds(ids, label, state) {
  requireArray(ids, label);
  if (ids.length === 0) fail(`${label} must carry at least one uncertaintyId`);
  for (const id of ids) {
    if (typeof id !== "string" || id.startsWith(UREF_PREFIX)) {
      fail(`${label} must carry raw uncertainty identities, never uref:// values`);
    }
    if (!state.uncertaintyIds.has(id)) {
      fail(`${label} uncertaintyId does not resolve: ${JSON.stringify(id)}`);
    }
  }
}

function assertCaseAScope(contextRefs, label, state) {
  if (state.permittedOutputScope !== "FACTUAL_EXPLANATION_ONLY") return;
  if (contextRefs.length > 0) {
    fail(`${label} carries contextRefs under FACTUAL_EXPLANATION_ONLY`);
  }
}

function assertContextRefs(contextRefs, label, state, { requireFrictionDomain = false } = {}) {
  requireArray(contextRefs, label);
  assertResolvingMrefs(contextRefs, label, state, { requireFrictionDomain });
  assertCaseAScope(contextRefs, label, state);
}

function sameRefSet(left, right) {
  if (left.length !== right.length) return false;
  const set = new Set(left);
  return right.every((ref) => set.has(ref));
}

function validateHypotheses(candidate, state) {
  const interpretation = candidate.interpretation;
  const status = candidate.interpretationStatus;
  const hypotheses = interpretation.hypotheses;
  const items = hypotheses.items;
  if (status !== "ABSTAINED_INSUFFICIENT_EVIDENCE" && items.length < 1) {
    fail("interpretation.hypotheses.items must not be empty outside abstention");
  }
  if (state.originBranch === "P_5X" && items.length < 2) {
    fail("P_5X requires at least two hypotheses");
  }
  if (status === "INTERPRETATION_CONSTRAINED" && items.length < 2) {
    fail("INTERPRETATION_CONSTRAINED requires at least two hypotheses");
  }

  const ordering = hypotheses.ordering;
  if (ordering === "RANKED") {
    if (items.length < 2) fail("RANKED hypotheses require at least two items");
  }
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const label = `interpretation.hypotheses.items[${index}]`;
    const expectedId = `H${index + 1}`;
    if (item.hypothesisId !== expectedId) {
      fail(`${label}.hypothesisId must be ${expectedId} in array order`);
    }
    if (ordering === "RANKED") {
      if (!Object.hasOwn(item, "rank")) fail(`${label} must expose rank under RANKED`);
      if (item.rank !== index + 1) fail(`${label}.rank must be exactly ${index + 1}`);
    } else if (Object.hasOwn(item, "rank")) {
      fail(`${label} must not expose rank under CO_EQUAL`);
    }
    if (item.decisiveEvidenceRefs.length < 1) {
      fail(`${label}.decisiveEvidenceRefs must not be empty`);
    }
    assertResolvingQrefs(item.decisiveEvidenceRefs, `${label}.decisiveEvidenceRefs`, state);
    assertResolvingQrefs(item.conflictingEvidenceRefs, `${label}.conflictingEvidenceRefs`, state);
    assertContextRefs(item.contextRefs, `${label}.contextRefs`, state);
    if (state.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED" && item.contextRefs.length < 1) {
      fail(`${label}.contextRefs must not be empty in a Case B interpretation`);
    }
    for (const claimId of item.requiresEngineFactNotEstablished) {
      if (!state.claimBoundaryIds.has(claimId)) {
        fail(`${label}.requiresEngineFactNotEstablished carries unknown claim ${JSON.stringify(claimId)}`);
      }
      if (state.blockedClaimIds.has(claimId)) {
        fail(`${label}.requiresEngineFactNotEstablished carries blocked claim ${JSON.stringify(claimId)}; a blocked claim may not be reintroduced as a hypothesis`);
      }
    }
    if (index > 0 && ordering === "RANKED") {
      const previous = items[index - 1].decisiveEvidenceRefs;
      if (sameRefSet(previous, item.decisiveEvidenceRefs)) {
        fail(`${label} must expose decisiveEvidenceRefs distinct from the adjacent lower rank`);
      }
    }
    if (ordering === "CO_EQUAL") {
      const lower = item.statement.toLowerCase();
      for (const phrase of ["most likely", "primary hypothesis", "first choice"]) {
        if (lower.includes(phrase)) {
          fail(`${label}.statement carries preference language under CO_EQUAL (${JSON.stringify(phrase)})`);
        }
      }
    }
  }
}

function validateInterpretation(candidate, state) {
  const interpretation = candidate.interpretation;
  const caseB = state.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED";

  if (interpretation.transitionPattern !== undefined) {
    const section = interpretation.transitionPattern;
    assertResolvingQrefs(section.evidenceRefs, "interpretation.transitionPattern.evidenceRefs", state);
    assertResolvingFactrefs(section.factRefs, "interpretation.transitionPattern.factRefs", state);
    assertContextRefs(section.contextRefs, "interpretation.transitionPattern.contextRefs", state);
    if (section.evidenceRefs.length + section.factRefs.length < 1) {
      fail("interpretation.transitionPattern requires at least one evidenceRef or factRef");
    }
    if (caseB && section.contextRefs.length < 1) {
      fail("interpretation.transitionPattern requires at least one contextRef in a Case B interpretation");
    }
  }

  if (interpretation.frictionMechanism !== undefined) {
    const section = interpretation.frictionMechanism;
    assertResolvingQrefs(section.evidenceRefs, "interpretation.frictionMechanism.evidenceRefs", state);
    if (section.evidenceRefs.length < 1) {
      fail("interpretation.frictionMechanism requires at least one evidenceRef");
    }
    if (section.contextRefs.length < 1) {
      fail("interpretation.frictionMechanism requires at least one contextRef");
    }
    assertContextRefs(section.contextRefs, "interpretation.frictionMechanism.contextRefs", state, { requireFrictionDomain: true });
  }

  if (interpretation.scenarioInterpretation !== undefined) {
    if (state.outcome.deterministicStateEstablished !== true) {
      fail("interpretation.scenarioInterpretation requires an established engine state");
    }
    if (interpretation.scenarioInterpretation.boundToEngineState !== state.outcome.state) {
      fail("interpretation.scenarioInterpretation.boundToEngineState must equal the engine-established state");
    }
  }

  interpretation.decisiveEvidence.forEach((item, index) => {
    const label = `interpretation.decisiveEvidence[${index}]`;
    if (item.evidenceRefs.length < 1) fail(`${label}.evidenceRefs must not be empty`);
    assertResolvingQrefs(item.evidenceRefs, `${label}.evidenceRefs`, state);
  });
  interpretation.conflictingEvidence.forEach((item, index) => {
    const label = `interpretation.conflictingEvidence[${index}]`;
    if (item.evidenceRefs.length < 1) fail(`${label}.evidenceRefs must not be empty`);
    assertResolvingQrefs(item.evidenceRefs, `${label}.evidenceRefs`, state);
  });
  interpretation.missingEvidence.forEach((item, index) => {
    assertRawUncertaintyIds(
      item.uncertaintyIds,
      `interpretation.missingEvidence[${index}].uncertaintyIds`,
      state,
    );
  });
  interpretation.changeConditions.forEach((item, index) => {
    assertRawUncertaintyIds(
      item.uncertaintyIds,
      `interpretation.changeConditions[${index}].uncertaintyIds`,
      state,
    );
  });
  interpretation.affectedResources.forEach((item, index) => {
    const label = `interpretation.affectedResources[${index}].contextRefs`;
    if (item.contextRefs.length < 1) fail(`${label} must not be empty`);
    assertContextRefs(item.contextRefs, label, state);
  });
  interpretation.watchpoints.forEach((item, index) => {
    const label = `interpretation.watchpoints[${index}]`;
    if (item.contextRefs.length < 1) fail(`${label}.contextRefs must not be empty`);
    assertContextRefs(item.contextRefs, `${label}.contextRefs`, state);
    if (item.evidenceRefs.length < 1) fail(`${label}.evidenceRefs must not be empty`);
    for (const ref of item.evidenceRefs) {
      if (isQref(ref)) {
        if (!state.qrefs.has(ref)) fail(`${label}.evidenceRefs qref does not resolve: ${JSON.stringify(ref)}`);
        if (state.unavailableQrefs.has(ref)) {
          fail(`${label}.evidenceRefs qref is unavailable evidence: ${JSON.stringify(ref)}`);
        }
      } else if (isFactref(ref)) {
        if (!state.factrefs.has(ref)) fail(`${label}.evidenceRefs factref does not resolve: ${JSON.stringify(ref)}`);
      } else {
        fail(`${label}.evidenceRefs entry is neither qref nor factref: ${JSON.stringify(ref)}`);
      }
    }
  });

  validateHypotheses(candidate, state);
}

function validateUncertaintyDisclosures(candidate, state) {
  for (const [index, disclosure] of candidate.uncertainty.disclosures.entries()) {
    const label = `uncertainty.disclosures[${index}]`;
    const id = disclosure.uncertaintyId;
    if (typeof id !== "string" || id.startsWith(UREF_PREFIX)) {
      fail(`${label}.uncertaintyId must be a raw uncertainty identity, never a uref:// value`);
    }
    if (!state.uncertaintyIds.has(id)) {
      fail(`${label}.uncertaintyId does not resolve: ${JSON.stringify(id)}`);
    }
    for (const claimId of disclosure.unresolvedEngineFacts) {
      if (!state.claimBoundaryIds.has(claimId)) {
        fail(`${label}.unresolvedEngineFacts carries unknown claim ${JSON.stringify(claimId)}`);
      }
    }
  }
}

function validateClaims(candidate, state) {
  const claimIds = new Set();
  for (const [index, claim] of candidate.claims.entries()) {
    const label = `claims[${index}]`;
    if (CLAIM_IDS.includes(claim.claimId)) {
      fail(`${label}.claimId must not spoof an Engine claim identity: ${JSON.stringify(claim.claimId)}`);
    }
    if (claimIds.has(claim.claimId)) {
      fail(`${label}.claimId is duplicated: ${JSON.stringify(claim.claimId)}`);
    }
    claimIds.add(claim.claimId);

    let sawResolvingQref = false;
    let sawResolvingFactref = false;
    let sawResolvingUref = false;
    let sawUnavailableQref = false;
    for (const [refIndex, ref] of claim.refs.entries()) {
      const refLabel = `${label}.refs[${refIndex}]`;
      if (isQref(ref)) {
        if (!state.qrefs.has(ref)) fail(`${refLabel} qref does not resolve: ${JSON.stringify(ref)}`);
        sawResolvingQref = true;
        if (state.unavailableQrefs.has(ref)) sawUnavailableQref = true;
      } else if (isFactref(ref)) {
        if (!state.factrefs.has(ref)) fail(`${refLabel} factref does not resolve: ${JSON.stringify(ref)}`);
        sawResolvingFactref = true;
      } else if (isUref(ref)) {
        assertResolvingUref(ref, refLabel, state);
        sawResolvingUref = true;
      } else {
        fail(`${refLabel} is not a supplied reference identity: ${JSON.stringify(ref)}`);
      }
    }
    if (sawUnavailableQref && claim.claimType !== "UNCERTAINTY_DISCLOSURE") {
      fail(`${label} cites unavailable evidence; unavailable qrefs may appear only in uncertainty disclosures`);
    }
    assertContextRefs(claim.contextRefs, `${label}.contextRefs`, state);

    switch (claim.claimType) {
      case "DETERMINISTIC_FACT":
        if (!sawResolvingFactref) fail(`${label} requires at least one resolving factref`);
        break;
      case "DIRECT_EVIDENCE":
        if (!sawResolvingQref) fail(`${label} requires at least one resolving qref`);
        break;
      case "BOUNDED_INTERPRETATION":
      case "ALTERNATIVE_HYPOTHESIS":
        if (!sawResolvingQref && !sawResolvingFactref) {
          fail(`${label} requires at least one resolving qref or factref`);
        }
        if (state.permittedOutputScope === "MERGEVUE_INTERPRETATION_PERMITTED"
          && claim.contextRefs.length < 1) {
          fail(`${label} requires at least one resolving mref in a Case B interpretation`);
        }
        break;
      case "UNCERTAINTY_DISCLOSURE":
        if (!sawResolvingUref) fail(`${label} requires at least one resolving uref:// reference`);
        break;
      case "WATCHPOINT":
        if (!sawResolvingQref && !sawResolvingFactref) {
          fail(`${label} requires at least one resolving qref or factref`);
        }
        if (claim.contextRefs.length < 1) fail(`${label} requires at least one resolving mref`);
        break;
      case "SCOPE_LIMITATION_DISCLOSURE":
        if (claim.refs.length > 0) fail(`${label} must carry refs = []`);
        if (claim.contextRefs.length > 0) fail(`${label} must carry contextRefs = []`);
        break;
      default:
        fail(`${label}.claimType is not lawful: ${JSON.stringify(claim.claimType)}`);
    }
  }
  return claimIds;
}

function validateClientNarrative(candidate, claimIds) {
  for (const [index, section] of candidate.clientNarrative.sections.entries()) {
    const label = `clientNarrative.sections[${index}]`;
    if (section.derivedFromClaimIds.length < 1) {
      fail(`${label}.derivedFromClaimIds must not be empty`);
    }
    for (const claimId of section.derivedFromClaimIds) {
      if (!claimIds.has(claimId)) {
        fail(`${label}.derivedFromClaimIds does not resolve to a candidate claim: ${JSON.stringify(claimId)}`);
      }
    }
  }
}

// Case A structural gate: no explicit context-dependent structured section may
// survive under FACTUAL_EXPLANATION_ONLY. Arbitrary free-text semantics are NOT
// enforced here — they belong to the future Semantic Validator (V-23/V-24).
function assertCaseAStructuralGate(candidate, state) {
  if (state.permittedOutputScope !== "FACTUAL_EXPLANATION_ONLY") return;
  const interpretation = candidate.interpretation;
  if (Object.hasOwn(interpretation, "transitionPattern")) {
    fail("interpretation.transitionPattern is prohibited under FACTUAL_EXPLANATION_ONLY");
  }
  if (Object.hasOwn(interpretation, "frictionMechanism")) {
    fail("interpretation.frictionMechanism is prohibited under FACTUAL_EXPLANATION_ONLY");
  }
  if (interpretation.affectedResources.length > 0) {
    fail("interpretation.affectedResources must be empty under FACTUAL_EXPLANATION_ONLY");
  }
  if (interpretation.watchpoints.length > 0) {
    fail("interpretation.watchpoints must be empty under FACTUAL_EXPLANATION_ONLY");
  }
  candidate.claims.forEach((claim, index) => {
    if (claim.claimType === "WATCHPOINT") {
      fail(`claims[${index}].claimType WATCHPOINT is prohibited under FACTUAL_EXPLANATION_ONLY`);
    }
  });
}

// P_1B structural guarantees: constrained status, no scenarioInterpretation,
// and the constrained-status hypothesis minimum (enforced in validateHypotheses).
// Arbitrary natural-language P_1B paraphrase is NOT blocked here — that belongs
// to the future Semantic Validator.
function assertP1BStructuralGate(candidate, state) {
  if (state.originBranch !== "P_1B") return;
  if (candidate.interpretationStatus !== "INTERPRETATION_CONSTRAINED") {
    fail("P_1B requires interpretationStatus INTERPRETATION_CONSTRAINED");
  }
  if (Object.hasOwn(candidate.interpretation, "scenarioInterpretation")) {
    fail("P_1B prohibits interpretation.scenarioInterpretation");
  }
}

export function validateProviderSemanticCandidate(candidate, providerProjection) {
  requirePlainObject(candidate, "candidate");
  const state = resolveProjection(providerProjection);
  validateSchemaNode(candidate, providerSemanticCandidateSchema, "candidate", providerSemanticCandidateSchema);
  assertCandidatePurity(candidate, "candidate");

  const abstained = candidate.interpretationStatus === "ABSTAINED_INSUFFICIENT_EVIDENCE";
  if (abstained) {
    if (candidate.abstentionReason === null) {
      fail("abstentionReason must be non-null under ABSTAINED_INSUFFICIENT_EVIDENCE");
    }
  } else if (candidate.abstentionReason !== null) {
    fail("abstentionReason must be null outside ABSTAINED_INSUFFICIENT_EVIDENCE");
  }

  assertCaseAStructuralGate(candidate, state);
  assertP1BStructuralGate(candidate, state);

  validateInterpretation(candidate, state);
  validateUncertaintyDisclosures(candidate, state);
  const claimIds = validateClaims(candidate, state);
  validateClientNarrative(candidate, claimIds);
  return deepFreeze(structuredClone(candidate));
}
