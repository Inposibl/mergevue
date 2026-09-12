import { EVENT_KIND, RULE_REF } from "./constants.js";
import { failClosed } from "./errors.js";
import { canonicalSerialize } from "./canonical.js";
import { computeIdentity } from "./identity.js";
import { registerBuiltinRules } from "./rules.js";

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  if (!Object.isFrozen(value)) Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function deepClone(value) {
  return structuredClone(value);
}

export function freezeRecord(value) {
  return deepFreeze(deepClone(value));
}

function ruleKey(ref) {
  if (!ref || typeof ref.identity !== "string" || typeof ref.version !== "string") {
    failClosed("RULE_REF_INVALID");
  }
  return `${ref.identity}@${ref.version}`;
}

function createStore() {
  const tables = {
    renderedContent: new Map(),
    renderingDerivation: new Map(),
    emim: new Map(),
    prePcmOutput: new Map(),
    authorization: new Map(),
    resolutionSource: new Map(),
    certification: new Map(),
    occurrence: new Map(),
    demandBlueprint: new Map(),
    manifest: new Map(),
    retrievalQualification: new Map(),
    factualBaseline: new Map(),
    factualSeal: new Map(),
    preSealVerification: new Map(),
    semanticBinding: new Map(),
    evidenceBinding: new Map(),
    xpiExecution: new Map(),
    xpiAccessEvent: new Map(),
    xpiDerivative: new Map(),
    had1: new Map(),
    had2: new Map(),
    xad1: new Map(),
    t0Determination: new Map(),
  };

  const putOnceTables = new Set(["t0Determination", "preSealVerification"]);

  return {
    put(table, id, record) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      if (typeof id !== "string" || id.length === 0) failClosed("STORE_ID_INVALID", table);
      if (tables[table].has(id)) failClosed("STORE_IDENTITY_COLLISION", `${table}:${id}`);
      const frozen = freezeRecord(record);
      tables[table].set(id, frozen);
      return frozen;
    },
    replace(table, id, record) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      if (putOnceTables.has(table)) failClosed("STORE_RECORD_IMMUTABLE", table);
      if (!tables[table].has(id)) failClosed("STORE_UNRESOLVABLE", `${table}:${id}`);
      const frozen = freezeRecord(record);
      tables[table].set(id, frozen);
      return frozen;
    },
    get(table, id) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      const record = tables[table].get(id);
      if (!record) failClosed("STORE_UNRESOLVABLE", `${table}:${id}`);
      return record;
    },
    tryGet(table, id) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      return tables[table].get(id) ?? null;
    },
    has(table, id) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      return tables[table].has(id);
    },
    list(table) {
      if (!tables[table]) failClosed("STORE_TABLE_UNKNOWN", table);
      return Array.from(tables[table].values());
    },
    find(table, predicate) {
      return this.list(table).filter(predicate);
    },
  };
}

function createAllocators() {
  const executionOrdinals = new Map();
  const occurrenceSequences = new Map();
  const issuedOccurrences = new Map();
  const issuedExecutionIds = new Set();

  return {
    nextExecutionOrdinal(governingScopeIdentity) {
      if (typeof governingScopeIdentity !== "string" || governingScopeIdentity.length === 0) {
        failClosed("GOVERNING_SCOPE_INVALID");
      }
      const next = (executionOrdinals.get(governingScopeIdentity) ?? 0) + 1;
      executionOrdinals.set(governingScopeIdentity, next);
      return next;
    },
    nextOccurrenceSequence(occurrenceDomainIdentity) {
      if (typeof occurrenceDomainIdentity !== "string" || occurrenceDomainIdentity.length === 0) {
        failClosed("OCCURRENCE_DOMAIN_INVALID");
      }
      const next = (occurrenceSequences.get(occurrenceDomainIdentity) ?? 0) + 1;
      occurrenceSequences.set(occurrenceDomainIdentity, next);
      return next;
    },
    registerOccurrence(id, record) {
      if (issuedOccurrences.has(id)) failClosed("OCCURRENCE_IDENTITY_REUSED", id);
      issuedOccurrences.set(id, record);
    },
    registerExecutionId(id) {
      if (issuedExecutionIds.has(id)) failClosed("EXECUTION_IDENTITY_REUSED", id);
      issuedExecutionIds.add(id);
    },
    hasOccurrence(id) {
      return issuedOccurrences.has(id);
    },
    getOccurrence(id) {
      const record = issuedOccurrences.get(id);
      if (!record) failClosed("OCCURRENCE_UNRESOLVABLE", id);
      return record;
    },
    tryGetOccurrence(id) {
      return issuedOccurrences.get(id) ?? null;
    },
    listOccurrences() {
      return Array.from(issuedOccurrences.values());
    },
  };
}

export function createHistoricalRuntime(options = {}) {
  if (options !== null && !isPlainObject(options)) {
    failClosed("RUNTIME_OPTIONS_INVALID");
  }
  const store = createStore();
  const allocators = createAllocators();
  const rules = new Map();
  const actorAssignments = new Map();
  const governanceReferents = new Map();
  const limbBAuthority = options.limbBAuthority ?? null;
  const contaminatedExecutions = new Set();
  const authorizationConsumers = new Map();
  const caseSessions = new Map();
  const traces = [];

  const runtime = {
    store,
    allocators,
    contaminatedExecutions,
    authorizationConsumers,
    caseSessions,
    traces,
    limbBAuthority,
    modelTransport: options.modelTransport ?? null,

    registerRule(ref, fn) {
      if (typeof fn !== "function") failClosed("RULE_FN_INVALID");
      rules.set(ruleKey(ref), fn);
    },
    getRule(ref) {
      const fn = rules.get(ruleKey(ref));
      if (!fn) failClosed("RULE_UNRESOLVABLE", ruleKey(ref));
      return fn;
    },

    registerActorAssignment(assignment) {
      if (!assignment || typeof assignment.actorAssignmentRef !== "string") {
        failClosed("ACTOR_ASSIGNMENT_INVALID");
      }
      if (typeof assignment.responsibleActorRef !== "string") {
        failClosed("ACTOR_ASSIGNMENT_ACTOR_INVALID");
      }
      if (!Array.isArray(assignment.activityKinds) || assignment.activityKinds.length === 0) {
        failClosed("ACTOR_ASSIGNMENT_KINDS_INVALID");
      }
      actorAssignments.set(assignment.actorAssignmentRef, freezeRecord(assignment));
    },
    resolveActorAssignment(actorAssignmentRef) {
      const assignment = actorAssignments.get(actorAssignmentRef);
      if (!assignment) failClosed("ACTOR_ASSIGNMENT_UNRESOLVABLE", actorAssignmentRef);
      return assignment;
    },
    actorAssignmentCoherent({ responsibleActorRef, actorAssignmentRef, activityKind, actScope }) {
      const assignment = this.resolveActorAssignment(actorAssignmentRef);
      if (typeof responsibleActorRef !== "string" || responsibleActorRef.length === 0) {
        return false;
      }
      if (assignment.responsibleActorRef !== responsibleActorRef) return false;
      if (!assignment.activityKinds.includes(activityKind)) return false;
      if (assignment.actScope != null && actScope != null && assignment.actScope !== actScope) {
        return false;
      }
      return true;
    },
    assertActorCoherent(binding) {
      if (!this.actorAssignmentCoherent(binding)) {
        failClosed("ACTOR_ASSIGNMENT_INCOHERENT", binding.activityKind);
      }
    },

    registerGovernanceReferent(name, value) {
      if (typeof name !== "string" || name.length === 0) failClosed("GOVERNANCE_NAME_INVALID");
      if (value == null) failClosed("GOVERNANCE_VALUE_ABSENT", name);
      governanceReferents.set(name, freezeRecord(value));
    },
    resolveGovernanceReferent(name) {
      if (!governanceReferents.has(name)) {
        failClosed("R0_GOVERNANCE_REFERENT_MISSING", name);
      }
      return governanceReferents.get(name);
    },
    tryResolveGovernanceReferent(name) {
      return governanceReferents.get(name) ?? null;
    },

    markContaminated(historicalExecutionId) {
      contaminatedExecutions.add(historicalExecutionId);
    },
    isContaminated(historicalExecutionId) {
      return contaminatedExecutions.has(historicalExecutionId);
    },

    noteAuthorizationConsumer(authorizationRecordId, retrievalOccurrenceId) {
      const existing = authorizationConsumers.get(authorizationRecordId);
      if (existing && existing !== retrievalOccurrenceId) {
        failClosed("AUTHORIZATION_MULTIPLY_CONSUMED", authorizationRecordId);
      }
      authorizationConsumers.set(authorizationRecordId, retrievalOccurrenceId);
    },
    getAuthorizationConsumer(authorizationRecordId) {
      return authorizationConsumers.get(authorizationRecordId) ?? null;
    },

    recordTrace(kind, payload) {
      traces.push(freezeRecord({ kind, at: traces.length + 1, payload }));
    },

    computeIdentity,
    canonicalSerialize,
    EVENT_KIND,
  };

  registerBuiltinRules(runtime);
  if (Array.isArray(options.actorAssignments)) {
    for (const assignment of options.actorAssignments) runtime.registerActorAssignment(assignment);
  }
  if (options.governanceReferents && typeof options.governanceReferents === "object") {
    for (const [name, value] of Object.entries(options.governanceReferents)) {
      runtime.registerGovernanceReferent(name, value);
    }
  }
  return runtime;
}

export function ruleRefEquals(a, b) {
  return a?.identity === b?.identity && a?.version === b?.version;
}

export { RULE_REF };
