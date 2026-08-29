import { canonicalSerialize, sha256PrefixedDigest } from "./canonicalDigest.js";
import {
  AUTHORITY_KIND_RANK,
  SEMANTIC_JUDGE_PACKET_VERSION,
  SEMANTIC_JUDGE_PROMPT_VERSION,
  SEMANTIC_VALIDATOR_VERSION,
} from "./semanticValidatorConstants.js";
import { SemanticValidationError } from "./semanticValidationError.js";
import {
  SEMANTIC_APPLICABILITY_MATRIX,
  resolveSemanticApplicabilityContext,
  semanticSubruleApplies,
} from "./semanticApplicability.js";
import { locallyEvaluateSemanticSubrule } from "./semanticLocalEvaluator.js";

// J1 — Semantic target registry (T-set), authority resolution, check identity
// (C-set), and order-preserving partitioning. Read-only over the frozen
// Request and Result: no upstream object is mutated, trimmed, normalized, or
// repaired here, and no in-place sort is ever performed on input-owned arrays.

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function preconditionFail(detail) {
  throw new SemanticValidationError({ errorKind: "INPUT_PRECONDITION_FAILURE", detail });
}

function requirePlainObject(value, label) {
  if (!isPlainObject(value)) preconditionFail(`${label} must be a plain object`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) preconditionFail(`${label} must be an array`);
  return value;
}

function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) preconditionFail(`${label} must be a non-empty string`);
  return value;
}

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

function lexicographic(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function copySorted(values) {
  return [...values].sort(lexicographic);
}

// ---------------------------------------------------------------------------
// T-set — complete physical walk of all present target instances from the
// 13-family registry, in fixed family order, frozen array order inside each
// family. No hash sorting, no id sorting.
// ---------------------------------------------------------------------------

function targetFor(family, locator, text, metadata) {
  return deepFreeze({
    targetFamily: family,
    targetLocator: locator,
    text,
    targetDigest: sha256PrefixedDigest(canonicalSerialize(text)),
    metadata: deepFreeze(metadata),
  });
}

export function enumerateSemanticTargets(agentInterpretationRequest, agentInterpretationResult) {
  const result = requirePlainObject(agentInterpretationResult, "agentInterpretationResult");
  const interpretation = requirePlainObject(result.interpretation, "result.interpretation");
  const hypotheses = requirePlainObject(interpretation.hypotheses, "result.interpretation.hypotheses");
  requireArray(hypotheses.items, "result.interpretation.hypotheses.items");
  const claims = requireArray(result.claims, "result.claims");
  const narrative = requirePlainObject(result.clientNarrative, "result.clientNarrative");
  const sections = requireArray(narrative.sections, "result.clientNarrative.sections");
  const uncertainty = requirePlainObject(result.uncertainty, "result.uncertainty");
  const disclosures = requireArray(uncertainty.disclosures, "result.uncertainty.disclosures");

  const targets = [];

  for (const [index, claim] of claims.entries()) {
    requirePlainObject(claim, `result.claims[${index}]`);
    targets.push(targetFor(
      "CLAIM_TEXT",
      `claims.${requireNonEmptyString(claim.claimId, `claims[${index}].claimId`)}.text`,
      requireNonEmptyString(claim.text, `claims[${index}].text`),
      {
        claimId: claim.claimId,
        claimType: claim.claimType,
        refs: [...requireArray(claim.refs, `claims[${index}].refs`)],
        contextRefs: [...requireArray(claim.contextRefs, `claims[${index}].contextRefs`)],
      },
    ));
  }

  for (const [index, section] of sections.entries()) {
    requirePlainObject(section, `clientNarrative.sections[${index}]`);
    targets.push(targetFor(
      "NARRATIVE_SECTION_TEXT",
      `clientNarrative.sections[${index}].text`,
      requireNonEmptyString(section.text, `clientNarrative.sections[${index}].text`),
      {
        sectionId: section.sectionId,
        derivedFromClaimIds: [...requireArray(section.derivedFromClaimIds, `clientNarrative.sections[${index}].derivedFromClaimIds`)],
      },
    ));
  }

  const ordering = hypotheses.ordering;
  for (const [index, item] of hypotheses.items.entries()) {
    requirePlainObject(item, `interpretation.hypotheses.items[${index}]`);
    const hypothesisId = requireNonEmptyString(item.hypothesisId, `hypotheses.items[${index}].hypothesisId`);
    targets.push(targetFor(
      "HYPOTHESIS_STATEMENT",
      `interpretation.hypotheses.items.${hypothesisId}.statement`,
      requireNonEmptyString(item.statement, `hypotheses.items[${index}].statement`),
      {
        hypothesisId,
        ordering,
        rank: Object.hasOwn(item, "rank") ? item.rank : null,
        evidenceBasis: item.evidenceBasis,
        decisiveEvidenceRefs: [...requireArray(item.decisiveEvidenceRefs, "hypotheses.items.decisiveEvidenceRefs")],
        conflictingEvidenceRefs: [...requireArray(item.conflictingEvidenceRefs, "hypotheses.items.conflictingEvidenceRefs")],
        contextRefs: [...requireArray(item.contextRefs, "hypotheses.items.contextRefs")],
        requiresEngineFactNotEstablished: [...requireArray(item.requiresEngineFactNotEstablished, "hypotheses.items.requiresEngineFactNotEstablished")],
      },
    ));
  }

  if (Object.hasOwn(interpretation, "transitionPattern")) {
    const section = requirePlainObject(interpretation.transitionPattern, "interpretation.transitionPattern");
    targets.push(targetFor(
      "TRANSITION_PATTERN_LABEL",
      "interpretation.transitionPattern.label",
      requireNonEmptyString(section.label, "transitionPattern.label"),
      {
        evidenceBasis: section.evidenceBasis,
        evidenceRefs: [...requireArray(section.evidenceRefs, "transitionPattern.evidenceRefs")],
        factRefs: [...requireArray(section.factRefs, "transitionPattern.factRefs")],
        contextRefs: [...requireArray(section.contextRefs, "transitionPattern.contextRefs")],
      },
    ));
  }

  if (Object.hasOwn(interpretation, "frictionMechanism")) {
    const section = requirePlainObject(interpretation.frictionMechanism, "interpretation.frictionMechanism");
    targets.push(targetFor(
      "FRICTION_MECHANISM_LABEL",
      "interpretation.frictionMechanism.label",
      requireNonEmptyString(section.label, "frictionMechanism.label"),
      {
        evidenceBasis: section.evidenceBasis,
        evidenceRefs: [...requireArray(section.evidenceRefs, "frictionMechanism.evidenceRefs")],
        contextRefs: [...requireArray(section.contextRefs, "frictionMechanism.contextRefs")],
      },
    ));
  }

  if (Object.hasOwn(interpretation, "scenarioInterpretation")) {
    const section = requirePlainObject(interpretation.scenarioInterpretation, "interpretation.scenarioInterpretation");
    targets.push(targetFor(
      "SCENARIO_INTERPRETATION_STATEMENT",
      "interpretation.scenarioInterpretation.statement",
      requireNonEmptyString(section.statement, "scenarioInterpretation.statement"),
      {
        boundToEngineState: section.boundToEngineState,
        evidenceBasis: section.evidenceBasis,
      },
    ));
  }

  const rowFamily = (family, locatorPrefix, textField) => (row, index) => {
    requirePlainObject(row, `${locatorPrefix}[${index}]`);
    targets.push(targetFor(
      family,
      `${locatorPrefix}[${index}].${textField}`,
      requireNonEmptyString(row[textField], `${locatorPrefix}[${index}].${textField}`),
      rowMetadataFor(family, row),
    ));
  };

  function rowMetadataFor(family, row) {
    switch (family) {
      case "DECISIVE_EVIDENCE_STATEMENT":
      case "CONFLICTING_EVIDENCE_STATEMENT":
        return { evidenceRefs: [...requireArray(row.evidenceRefs, "evidenceRefs")] };
      case "MISSING_EVIDENCE_STATEMENT":
        return { uncertaintyIds: [...requireArray(row.uncertaintyIds, "uncertaintyIds")] };
      case "CHANGE_CONDITION_STATEMENT":
        return {
          uncertaintyIds: [...requireArray(row.uncertaintyIds, "uncertaintyIds")],
          wouldChange: row.wouldChange,
        };
      case "AFFECTED_RESOURCE_LABEL":
        return { contextRefs: [...requireArray(row.contextRefs, "contextRefs")] };
      case "WATCHPOINT_STATEMENT":
        return {
          contextRefs: [...requireArray(row.contextRefs, "contextRefs")],
          evidenceRefs: [...requireArray(row.evidenceRefs, "evidenceRefs")],
          horizon: row.horizon,
        };
      case "DISCLOSURE_CLIENT_STATEMENT":
        return {
          uncertaintyId: row.uncertaintyId,
          affects: row.affects,
          unresolvedEngineFacts: [...requireArray(row.unresolvedEngineFacts, "unresolvedEngineFacts")],
        };
      default:
        return {};
    }
  }

  requireArray(interpretation.decisiveEvidence, "interpretation.decisiveEvidence")
    .forEach(rowFamily("DECISIVE_EVIDENCE_STATEMENT", "interpretation.decisiveEvidence", "statement"));
  requireArray(interpretation.conflictingEvidence, "interpretation.conflictingEvidence")
    .forEach(rowFamily("CONFLICTING_EVIDENCE_STATEMENT", "interpretation.conflictingEvidence", "statement"));
  requireArray(interpretation.missingEvidence, "interpretation.missingEvidence")
    .forEach(rowFamily("MISSING_EVIDENCE_STATEMENT", "interpretation.missingEvidence", "statement"));
  requireArray(interpretation.changeConditions, "interpretation.changeConditions")
    .forEach(rowFamily("CHANGE_CONDITION_STATEMENT", "interpretation.changeConditions", "statement"));
  requireArray(interpretation.affectedResources, "interpretation.affectedResources")
    .forEach(rowFamily("AFFECTED_RESOURCE_LABEL", "interpretation.affectedResources", "label"));
  requireArray(interpretation.watchpoints, "interpretation.watchpoints")
    .forEach(rowFamily("WATCHPOINT_STATEMENT", "interpretation.watchpoints", "statement"));
  disclosures.forEach(rowFamily("DISCLOSURE_CLIENT_STATEMENT", "uncertainty.disclosures", "clientStatement"));

  return Object.freeze(targets);
}

// ---------------------------------------------------------------------------
// Authority resolution. Each authority is { kind, id, value } where value is
// the exact relevant canonical authority subtree/value — never the id alone.
// ---------------------------------------------------------------------------

export function authorityKeyId(authority) {
  return `${authority.kind}:${authority.id}`;
}

const AUTHORITY_KINDS_FALLBACK = Number.MAX_SAFE_INTEGER;

function compareAuthorities(left, right) {
  const kindDelta = (AUTHORITY_KIND_RANK.get(left.kind) ?? AUTHORITY_KINDS_FALLBACK)
    - (AUTHORITY_KIND_RANK.get(right.kind) ?? AUTHORITY_KINDS_FALLBACK);
  if (kindDelta !== 0) return kindDelta;
  return lexicographic(left.id, right.id);
}

export function computeAuthoritySetDigest(authorities) {
  const ordered = [...authorities].sort(compareAuthorities);
  return sha256PrefixedDigest(canonicalSerialize(ordered));
}

class AuthoritySet {
  constructor() {
    this.map = new Map();
  }

  add(kind, id, value) {
    const authority = { kind, id, value };
    const key = authorityKeyId(authority);
    const existing = this.map.get(key);
    if (existing !== undefined) {
      if (canonicalSerialize(existing) !== canonicalSerialize(authority)) {
        preconditionFail(`authority ${key} carries conflicting canonical values`);
      }
      return;
    }
    this.map.set(key, authority);
  }

  ordered() {
    return [...this.map.values()].sort(compareAuthorities);
  }
}

function outcomeOf(request) {
  return requirePlainObject(
    requirePlainObject(request.engineSnapshot, "engineSnapshot").engine,
    "engineSnapshot.engine",
  ).outcome;
}

function resolveObservation(request, qref) {
  const observations = requireArray(request.engineSnapshot.engine.observations, "engine.observations");
  const matches = observations.filter((row) => row.observationRef === qref);
  if (matches.length !== 1) {
    preconditionFail(`observation ref does not resolve uniquely: ${qref}`);
  }
  return matches[0];
}

function resolveKnownFact(request, factref) {
  const known = requireArray(request.structuredUncertainty.known, "structuredUncertainty.known");
  const matches = known.filter((row) => row.factRef === factref);
  if (matches.length !== 1) {
    preconditionFail(`known fact ref does not resolve uniquely: ${factref}`);
  }
  return matches[0];
}

function resolveContextItem(request, mref) {
  const items = requireArray(
    request.interpretationContextPack.selectedContextItems,
    "selectedContextItems",
  );
  const matches = items.filter((item) => item.contextRef === mref);
  if (matches.length !== 1) {
    preconditionFail(`context ref does not resolve uniquely into the pack: ${mref}`);
  }
  return matches[0];
}

function resolveUncertaintyItem(request, uncertaintyId) {
  const items = requireArray(request.structuredUncertainty.items, "structuredUncertainty.items");
  const matches = items.filter((row) => row.uncertaintyId === uncertaintyId);
  if (matches.length !== 1) {
    preconditionFail(`uncertaintyId does not resolve uniquely: ${uncertaintyId}`);
  }
  return matches[0];
}

function resolveClaimBoundary(request, claimId) {
  const boundaries = requireArray(
    request.structuredUncertainty.claimBoundaries,
    "structuredUncertainty.claimBoundaries",
  );
  const matches = boundaries.filter((row) => row.claimId === claimId);
  if (matches.length !== 1) {
    preconditionFail(`claim boundary does not resolve uniquely: ${claimId}`);
  }
  return matches[0];
}

function resolveClaimById(result, claimId) {
  const matches = requireArray(result.claims, "result.claims").filter((claim) => claim.claimId === claimId);
  if (matches.length !== 1) {
    preconditionFail(`derivedFromClaimIds does not resolve uniquely: ${claimId}`);
  }
  return matches[0];
}

function constraintRow(request, constraintId) {
  const rows = requireArray(request.activeConstraints ?? [], "activeConstraints")
    .filter((row) => row.constraintId === constraintId);
  if (rows.length !== 1) {
    preconditionFail(`active constraint does not resolve uniquely: ${constraintId}`);
  }
  return rows[0];
}

function addWithheldAuthorities(set, request) {
  const withheld = requireArray(request.structuredUncertainty.withheldOutputs, "withheldOutputs");
  for (const row of withheld) {
    set.add("SUPPRESSION_FACT", `withheldOutputs:${row.withheldItem}`, row);
  }
}

function addBlockedClaimAuthorities(set, request) {
  const blocked = new Set();
  for (const row of requireArray(request.activeConstraints ?? [], "activeConstraints")) {
    for (const claimId of row.blockedClaimIds ?? []) blocked.add(claimId);
  }
  for (const claimId of [...blocked].sort(lexicographic)) {
    set.add("BLOCKED_CLAIM", claimId, resolveClaimBoundary(request, claimId));
  }
}

function addRefAuthorities(set, request, ref, { allowUref = true } = {}) {
  if (ref.startsWith("qref://")) {
    set.add("ENGINE_FACT", ref, resolveObservation(request, ref));
    return;
  }
  if (ref.startsWith("factref://")) {
    set.add("ENGINE_FACT", ref, resolveKnownFact(request, ref));
    return;
  }
  if (allowUref && ref.startsWith("uref://")) {
    const uncertaintyId = ref.slice("uref://".length);
    set.add("UNCERTAINTY_ITEM", uncertaintyId, resolveUncertaintyItem(request, uncertaintyId));
    return;
  }
  preconditionFail(`reference is outside the authority namespaces: ${ref}`);
}

function addMrefAuthorities(set, request, mref) {
  const item = resolveContextItem(request, mref);
  set.add("CONTEXT_ITEM", item.contextItemId, item);
}

// Grounding authorities for one target, per the matrix's per-family authority
// specification.
function groundingAuthoritiesForTarget(request, result, target) {
  const set = new AuthoritySet();
  const metadata = target.metadata;
  switch (target.targetFamily) {
    case "CLAIM_TEXT":
      for (const ref of metadata.refs) addRefAuthorities(set, request, ref);
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      break;
    case "HYPOTHESIS_STATEMENT":
      for (const ref of [...metadata.decisiveEvidenceRefs, ...metadata.conflictingEvidenceRefs]) {
        addRefAuthorities(set, request, ref, { allowUref: false });
      }
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, metadata.evidenceBasis);
      break;
    case "TRANSITION_PATTERN_LABEL":
      for (const ref of metadata.evidenceRefs) addRefAuthorities(set, request, ref, { allowUref: false });
      for (const ref of metadata.factRefs) addRefAuthorities(set, request, ref, { allowUref: false });
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, metadata.evidenceBasis);
      break;
    case "FRICTION_MECHANISM_LABEL":
      for (const ref of metadata.evidenceRefs) addRefAuthorities(set, request, ref, { allowUref: false });
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, metadata.evidenceBasis);
      break;
    case "SCENARIO_INTERPRETATION_STATEMENT":
      set.add("ENGINE_FACT", "engine.outcome.state", outcomeOf(request).state);
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, metadata.evidenceBasis);
      break;
    case "DECISIVE_EVIDENCE_STATEMENT":
    case "CONFLICTING_EVIDENCE_STATEMENT":
      for (const ref of metadata.evidenceRefs) addRefAuthorities(set, request, ref, { allowUref: false });
      break;
    case "MISSING_EVIDENCE_STATEMENT":
      for (const uncertaintyId of metadata.uncertaintyIds) {
        set.add("UNCERTAINTY_ITEM", uncertaintyId, resolveUncertaintyItem(request, uncertaintyId));
      }
      break;
    case "CHANGE_CONDITION_STATEMENT":
      for (const uncertaintyId of metadata.uncertaintyIds) {
        set.add("UNCERTAINTY_ITEM", uncertaintyId, resolveUncertaintyItem(request, uncertaintyId));
      }
      set.add("WOULD_CHANGE", `${target.targetLocator}.wouldChange`, metadata.wouldChange);
      break;
    case "AFFECTED_RESOURCE_LABEL":
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      break;
    case "WATCHPOINT_STATEMENT":
      for (const mref of metadata.contextRefs) addMrefAuthorities(set, request, mref);
      for (const ref of metadata.evidenceRefs) addRefAuthorities(set, request, ref, { allowUref: false });
      set.add("HORIZON", `${target.targetLocator}.horizon`, metadata.horizon);
      break;
    case "DISCLOSURE_CLIENT_STATEMENT": {
      set.add("UNCERTAINTY_ITEM", metadata.uncertaintyId, resolveUncertaintyItem(request, metadata.uncertaintyId));
      set.add("AFFECTS", `${target.targetLocator}.affects`, metadata.affects);
      for (const claimId of metadata.unresolvedEngineFacts) {
        set.add("BLOCKED_CLAIM", claimId, resolveClaimBoundary(request, claimId));
      }
      break;
    }
    default:
      preconditionFail(`no grounding authority plan for family ${target.targetFamily}`);
  }
  return set;
}

// Narrative authorities: union of the authorities belonging to
// derivedFromClaimIds.
function narrativeClaimAuthorities(request, result, target) {
  const set = new AuthoritySet();
  for (const claimId of target.metadata.derivedFromClaimIds) {
    const claim = resolveClaimById(result, claimId);
    for (const ref of claim.refs) addRefAuthorities(set, request, ref);
    for (const mref of claim.contextRefs) addMrefAuthorities(set, request, mref);
  }
  return set;
}

function narrativeContextItems(request, result, target) {
  const set = new AuthoritySet();
  for (const claimId of target.metadata.derivedFromClaimIds) {
    const claim = resolveClaimById(result, claimId);
    for (const mref of claim.contextRefs) addMrefAuthorities(set, request, mref);
  }
  return set;
}

// Minimum-authority resolution for V-13/V-28: exactly the authorities
// deterministically linked to this one target through its own canonical
// reference fields (direct claim refs, hypothesis evidence/fact refs,
// row-specific evidence refs, narrative derived-claim refs, target-specific
// evidenceBasis/horizon). The global structuredUncertainty.known pool is
// never attached: a number in prose is judged from the actual supplied
// authority boundary, and authority is never broadened to find a convenient
// supporting number.
function targetLinkedAuthorities(request, result, target) {
  if (target.targetFamily === "NARRATIVE_SECTION_TEXT") {
    return narrativeClaimAuthorities(request, result, target);
  }
  return groundingAuthoritiesForTarget(request, result, target);
}

// J1 CORR2 — Shared V-21 linked-observation resolver: the single
// deterministic source consumed by BOTH V-21 applicability
// (HAS_LINKED_OBSERVATION_USECLASS) and V-21 authority construction. It
// returns only the qrefs of the target's own canonical structural linkage,
// deduplicated in first-occurrence order — never all observations[], never
// survivingEvidenceRefs/unavailableEvidenceRefs, never another claim's qrefs,
// never a semantic inference about observation identity. An empty result is
// the lawful "no deterministic observation link" outcome (V-21 inapplicable);
// a structurally admitted identity that fails to resolve fails through the
// J1 input-integrity mechanism instead of degrading into inapplicability.
function uniqueInOrder(values) {
  return [...new Set(values)];
}

function observationQrefs(refs) {
  return requireArray(refs, "evidenceRefs").filter((ref) => ref.startsWith("qref://"));
}

function uncertaintyItemQrefs(request, uncertaintyId) {
  return observationQrefs(resolveUncertaintyItem(request, uncertaintyId).evidenceRefs);
}

export function linkedObservationQrefs(request, result, target) {
  const metadata = target.metadata;
  switch (target.targetFamily) {
    case "CLAIM_TEXT":
      return uniqueInOrder(metadata.refs.filter((ref) => ref.startsWith("qref://")));
    case "NARRATIVE_SECTION_TEXT": {
      const qrefs = [];
      for (const claimId of metadata.derivedFromClaimIds) {
        for (const ref of resolveClaimById(result, claimId).refs) {
          if (ref.startsWith("qref://")) qrefs.push(ref);
        }
      }
      return uniqueInOrder(qrefs);
    }
    case "HYPOTHESIS_STATEMENT":
      return uniqueInOrder(
        [...metadata.decisiveEvidenceRefs, ...metadata.conflictingEvidenceRefs]
          .filter((ref) => ref.startsWith("qref://")),
      );
    case "DISCLOSURE_CLIENT_STATEMENT":
      return uniqueInOrder(uncertaintyItemQrefs(request, metadata.uncertaintyId));
    case "DECISIVE_EVIDENCE_STATEMENT":
    case "CONFLICTING_EVIDENCE_STATEMENT":
      return uniqueInOrder(metadata.evidenceRefs.filter((ref) => ref.startsWith("qref://")));
    case "MISSING_EVIDENCE_STATEMENT": {
      const qrefs = [];
      for (const uncertaintyId of metadata.uncertaintyIds) {
        qrefs.push(...uncertaintyItemQrefs(request, uncertaintyId));
      }
      return uniqueInOrder(qrefs);
    }
    default:
      return [];
  }
}

function evidenceBearingFamilies(target) {
  return ["HYPOTHESIS_STATEMENT", "TRANSITION_PATTERN_LABEL", "FRICTION_MECHANISM_LABEL", "SCENARIO_INTERPRETATION_STATEMENT"]
    .includes(target.targetFamily);
}

const AUTHORITY_PLANS = Object.freeze({
  "V-02-STATE-IN-PROSE"(request, result, target) {
    const outcome = outcomeOf(request);
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.outcome.state", outcome.state);
    set.add("ENGINE_FACT", "engine.outcome.deterministicStateEstablished", outcome.deterministicStateEstablished);
    set.add("BRANCH", "engine.outcome.engineOutcomeCode", outcome.engineOutcomeCode);
    if (request.engineSnapshot.outcomeSource === "DUAL_CORE") {
      set.add("ENGINE_FACT", "engine.outcome.priority", outcome.priority);
      set.add("BRANCH", "engine.outcome.branchCode", outcome.branchCode);
    }
    set.add("SUPPRESSION_FACT", "engine.outcome.suppression", outcome.suppression);
    addWithheldAuthorities(set, request);
    addBlockedClaimAuthorities(set, request);
    return set;
  },
  "V-04-GROUNDING"(request, result, target) {
    return groundingAuthoritiesForTarget(request, result, target);
  },
  "V-04-CAUSAL-OVERREACH"(request, result, target) {
    if (target.targetFamily === "NARRATIVE_SECTION_TEXT") {
      return narrativeClaimAuthorities(request, result, target);
    }
    return groundingAuthoritiesForTarget(request, result, target);
  },
  "V-04-CLAIMTYPE-ALIGNMENT"(request, result, target) {
    const set = new AuthoritySet();
    set.add("CLAIM_TYPE", target.targetLocator, target.metadata.claimType);
    for (const authority of groundingAuthoritiesForTarget(request, result, target).ordered()) {
      set.add(authority.kind, authority.id, authority.value);
    }
    return set;
  },
  "V-06-DETERMINATION"(request, result, target) {
    const set = new AuthoritySet();
    const items = requireArray(
      request.interpretationContextPack.selectedContextItems,
      "selectedContextItems",
    );
    for (const item of items) {
      if (item.contextItemId === "CI-BOUNDARY-PRED-P_1B") {
        set.add("CONTEXT_ITEM", item.contextItemId, item);
      }
    }
    set.add("BLOCKED_CLAIM", "CLAIM_NF_SFP_DETERMINATION", resolveClaimBoundary(request, "CLAIM_NF_SFP_DETERMINATION"));
    set.add("SUPPRESSION_FACT", "engine.outcome.suppression", outcomeOf(request).suppression);
    return set;
  },
  "V-07-FALLBACK"(request, result, target) {
    const set = new AuthoritySet();
    set.add("SUPPRESSION_FACT", "engine.outcome.suppression.prohibitedFallbackActive", outcomeOf(request).suppression?.prohibitedFallbackActive);
    set.add("CONSTRAINT", "C-PROHIBITED-FALLBACK", constraintRow(request, "C-PROHIBITED-FALLBACK"));
    return set;
  },
  "V-08-4A"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.outcome.state", outcomeOf(request).state);
    set.add("CONSTRAINT", "C-3A-NOT-4A", constraintRow(request, "C-3A-NOT-4A"));
    return set;
  },
  "V-09-FINAL-4B"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.outcome.provisionalState", outcomeOf(request).provisionalState);
    set.add("ENGINE_FACT", "engine.outcome.state", outcomeOf(request).state);
    set.add("CONSTRAINT", "C-4B-CANDIDATE-ONLY", constraintRow(request, "C-4B-CANDIDATE-ONLY"));
    return set;
  },
  "V-10-STATE-12"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.outcome.state", outcomeOf(request).state);
    set.add("HYPOTHESIS_ORDERING", "hypotheses.ordering", result.interpretation.hypotheses.ordering);
    set.add("CONSTRAINT", "C-5X-NO-COLLAPSE", constraintRow(request, "C-5X-NO-COLLAPSE"));
    return set;
  },
  "V-12-HUMAN-REVIEW"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "agentInterpretationRequest.humanReviewOccurred", request.humanReviewOccurred);
    if (Object.hasOwn(outcomeOf(request), "engineRoutingMetadata")) {
      set.add("ENGINE_FACT", "engine.outcome.engineRoutingMetadata", outcomeOf(request).engineRoutingMetadata);
    }
    set.add("CONSTRAINT", "C-NO-HUMAN-REVIEW-CLAIM", constraintRow(request, "C-NO-HUMAN-REVIEW-CLAIM"));
    return set;
  },
  "V-13-PROBABILITY"(request, result, target) {
    const set = new AuthoritySet();
    set.add("CONSTRAINT", "C-NO-NUMERIC-PROBABILITY", constraintRow(request, "C-NO-NUMERIC-PROBABILITY"));
    for (const authority of targetLinkedAuthorities(request, result, target).ordered()) {
      set.add(authority.kind, authority.id, authority.value);
    }
    if (target.targetFamily === "WATCHPOINT_STATEMENT") {
      set.add("HORIZON", `${target.targetLocator}.horizon`, target.metadata.horizon);
    }
    return set;
  },
  "V-18-DEC8"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.comparison.governance.dec8TriggerRefs", request.engineSnapshot.engine.comparison?.governance?.dec8TriggerRefs ?? []);
    set.add("CONSTRAINT", "C-DEC8-TRIGGER-ONLY", constraintRow(request, "C-DEC8-TRIGGER-ONLY"));
    return set;
  },
  "V-19-DEC7B"(request, result, target) {
    const set = new AuthoritySet();
    set.add("CONSTRAINT", "C-DEC7B-FLOOR", constraintRow(request, "C-DEC7B-FLOOR"));
    set.add("ENGINE_FACT", "engine.comparison.agreement", request.engineSnapshot.engine.comparison?.agreement ?? null);
    return set;
  },
  "V-20-BROADENING"(request, result, target) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "engine.comparison.discriminator", request.engineSnapshot.engine.comparison?.discriminator ?? null);
    set.add("CONSTRAINT", "C-1B-NO-BROADENING", constraintRow(request, "C-1B-NO-BROADENING"));
    return set;
  },
  "V-21-USECLASS"(request, result, target) {
    // Shared-resolver law (J1 CORR2): applicability and authority construction
    // consume the same linkedObservationQrefs set, so a check exists only when
    // its authority set is non-empty, and the authority set carries exactly
    // those linked observations' recorded UseClass values.
    const set = new AuthoritySet();
    for (const qref of linkedObservationQrefs(request, result, target)) {
      set.add("ENGINE_FACT", qref, resolveObservation(request, qref).useClass);
    }
    return set;
  },
  "V-22-NARRATIVE-SCOPE"(request, result, target) {
    const set = new AuthoritySet();
    for (const claimId of target.metadata.derivedFromClaimIds) {
      const claim = resolveClaimById(result, claimId);
      set.add("CLAIM_TYPE", `claims.${claim.claimId}.claimType`, claim.claimType);
      for (const ref of claim.refs) addRefAuthorities(set, request, ref);
      for (const mref of claim.contextRefs) addMrefAuthorities(set, request, mref);
    }
    return set;
  },
  "V-23-CONTEXT-BOUND"(request, result, target) {
    const set = new AuthoritySet();
    if (target.targetFamily === "NARRATIVE_SECTION_TEXT") {
      for (const authority of narrativeContextItems(request, result, target).ordered()) {
        set.add(authority.kind, authority.id, authority.value);
      }
    } else {
      const contextRefs = target.metadata.contextRefs ?? [];
      for (const mref of contextRefs) addMrefAuthorities(set, request, mref);
    }
    set.add("PACK_SCOPE", "permittedOutputScope", request.permittedOutputScope);
    set.add("PACK_SCOPE", "permittedInterpretationDomains", request.interpretationContextPack.permittedInterpretationDomains);
    return set;
  },
  "V-24-CASE-A-LEAKAGE"(request, result, target) {
    const set = new AuthoritySet();
    set.add("PACK_SCOPE", "permittedOutputScope", request.permittedOutputScope);
    set.add("CONSTRAINT", "C-CONTEXT-BOUND-INTERPRETATION", constraintRow(request, "C-CONTEXT-BOUND-INTERPRETATION"));
    return set;
  },
  "V-28-SHADOW-SCORING"(request, result, target) {
    const set = new AuthoritySet();
    if (evidenceBearingFamilies(target)) {
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, target.metadata.evidenceBasis);
    }
    for (const authority of targetLinkedAuthorities(request, result, target).ordered()) {
      set.add(authority.kind, authority.id, authority.value);
    }
    set.add("CONSTRAINT", "C-NO-SHADOW-SCORING", constraintRow(request, "C-NO-SHADOW-SCORING"));
    return set;
  },
  "V-29-RANK-PROBABILITY"(request, result, target) {
    const set = new AuthoritySet();
    set.add("HYPOTHESIS_ORDERING", "hypotheses.ordering", result.interpretation.hypotheses.ordering);
    if (target.targetFamily === "HYPOTHESIS_STATEMENT") {
      if (target.metadata.rank !== null && target.metadata.rank !== undefined) {
        set.add("HYPOTHESIS_ORDERING", `${target.targetLocator}.rank`, target.metadata.rank);
      }
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, target.metadata.evidenceBasis);
    }
    if (target.targetFamily === "SCENARIO_INTERPRETATION_STATEMENT") {
      set.add("EVIDENCE_BASIS", `${target.targetLocator}.evidenceBasis`, target.metadata.evidenceBasis);
    }
    set.add("CONSTRAINT", "C-NO-NUMERIC-PROBABILITY", constraintRow(request, "C-NO-NUMERIC-PROBABILITY"));
    return set;
  },
  "V-30-COEQUAL-PREFERENCE"(request, result, target) {
    const set = new AuthoritySet();
    set.add("HYPOTHESIS_ORDERING", "hypotheses.ordering", result.interpretation.hypotheses.ordering);
    set.add("HYPOTHESIS_ORDERING", "hypotheses.items.hypothesisIds", result.interpretation.hypotheses.items.map((item) => item.hypothesisId));
    return set;
  },
  "V-32-EXTRAPOLATION"(request, result, target) {
    const set = new AuthoritySet();
    for (const marker of request.interpretationContextPack.prohibitedExtrapolationMarkers ?? []) {
      set.add("EXTRAPOLATION_MARKER", marker.markerId, marker.text);
    }
    return set;
  },
  "V-33-SINGLE-NO-R2-COMPARISON"(request) {
    const set = new AuthoritySet();
    set.add("SUPPRESSION_FACT", "engine.outcome.suppression.comparatorDidNotRun", outcomeOf(request).suppression?.comparatorDidNotRun);
    set.add("CONSTRAINT", "C-SINGLE-NO-R2-COMPARISON", constraintRow(request, "C-SINGLE-NO-R2-COMPARISON"));
    addWithheldAuthorities(set, request);
    return set;
  },
  "V-34-SINGLE-NO-SHADOW-SCORING"(request) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "identity.candidatePair", request.engineSnapshot.identity.candidatePair);
    set.add("ENGINE_FACT", "engine.r1Scoring", request.engineSnapshot.engine.r1Scoring);
    set.add("CONSTRAINT", "C-NO-SHADOW-SCORING", constraintRow(request, "C-NO-SHADOW-SCORING"));
    set.add("CONSTRAINT", "C-SINGLE-NO-R2-COMPARISON", constraintRow(request, "C-SINGLE-NO-R2-COMPARISON"));
    return set;
  },
  "V-35-SINGLE-DISCLOSURE"(request, result, target) {
    const set = new AuthoritySet();
    set.add("UNCERTAINTY_ITEM", target.metadata.uncertaintyId, resolveUncertaintyItem(request, target.metadata.uncertaintyId));
    set.add("CONSTRAINT", "C-SINGLE-NO-R2-COMPARISON", constraintRow(request, "C-SINGLE-NO-R2-COMPARISON"));
    return set;
  },
  "V-36-SINGLE-R1-FACTS"(request) {
    const set = new AuthoritySet();
    set.add("ENGINE_FACT", "identity.candidatePair", request.engineSnapshot.identity.candidatePair);
    set.add("ENGINE_FACT", "engine.r1Scoring", request.engineSnapshot.engine.r1Scoring);
    for (const observation of request.engineSnapshot.engine.observations) {
      set.add("ENGINE_FACT", observation.observationRef, observation);
    }
    return set;
  },
});

// ---------------------------------------------------------------------------
// Check identity. The specification carries exactly these keys, always
// present; unused arrays are [] and unused strings are "". Transport fields
// (provider, model, request id, deadline, batch index, clock) never enter.
// ---------------------------------------------------------------------------

export function computeSemanticCheckId(semanticCheckSpecification) {
  return sha256PrefixedDigest(canonicalSerialize(semanticCheckSpecification));
}

function specificationFor(row, target, activeConstraintIds, authoritySetDigest) {
  return {
    semanticValidatorVersion: SEMANTIC_VALIDATOR_VERSION,
    semanticJudgePromptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
    semanticJudgePacketVersion: SEMANTIC_JUDGE_PACKET_VERSION,
    ruleId: row.ruleId,
    semanticSubruleId: row.semanticSubruleId,
    activeConstraintIds,
    targetFamily: target.targetFamily,
    targetLocator: target.targetLocator,
    targetDigest: target.targetDigest,
    authoritySetDigest,
    expectedInvariant: row.expectedInvariant,
    allowedSemanticInterpretations: [...row.allowedSemanticInterpretations],
    forbiddenSemanticImplications: [...row.forbiddenSemanticImplications],
  };
}

// C-set expansion: exact applicability matrix over the T-set, iterated in
// canonical precedence order (rule order, semantic sub-rule order, target
// family order, instance order). Only REQUIRES_SEMANTIC_JUDGMENT outcomes
// produce checks; deterministic FAILs are collected separately; deterministic
// PASSes are decided without a judge.
export function buildSemanticCheckSet(agentInterpretationRequest, agentInterpretationResult) {
  const request = agentInterpretationRequest;
  const result = agentInterpretationResult;
  const context = resolveSemanticApplicabilityContext(
    request,
    result,
    (target) => linkedObservationQrefs(request, result, target),
  );
  const tSet = enumerateSemanticTargets(request, result);
  const targetsByFamily = new Map();
  for (const target of tSet) {
    if (!targetsByFamily.has(target.targetFamily)) targetsByFamily.set(target.targetFamily, []);
    targetsByFamily.get(target.targetFamily).push(target);
  }

  const cSet = [];
  const localFails = [];
  for (const row of SEMANTIC_APPLICABILITY_MATRIX.rows) {
    for (const family of row.targetFamilies) {
      for (const target of targetsByFamily.get(family) ?? []) {
        if (!semanticSubruleApplies(row, target, context)) continue;
        const local = locallyEvaluateSemanticSubrule(row, target);
        if (local.outcome === "FAIL") {
          localFails.push(Object.freeze({
            ruleId: row.ruleId,
            semanticSubruleId: row.semanticSubruleId,
            targetFamily: target.targetFamily,
            targetLocator: target.targetLocator,
            violationCode: local.violationCode,
            reasonCode: "RULE_VIOLATED",
            supportingAuthorityIds: [],
            detail: local.detail,
          }));
          continue;
        }
        if (local.outcome !== "REQUIRES_SEMANTIC_JUDGMENT") continue;
        const authorityPlan = AUTHORITY_PLANS[row.authorityPlan];
        if (typeof authorityPlan !== "function") {
          preconditionFail(`unknown semantic authority plan ${JSON.stringify(row.authorityPlan)}`);
        }
        const authorities = authorityPlan(request, result, target);
        const orderedAuthorities = Object.freeze(authorities.ordered());
        const authoritySetDigest = computeAuthoritySetDigest(orderedAuthorities);
        const specification = specificationFor(row, target, [...context.activeConstraintIds], authoritySetDigest);
        const checkId = computeSemanticCheckId(specification);
        cSet.push(deepFreeze({
          ...specification,
          checkId,
          ordinal: row.ordinal,
          authoritySetDigest,
          authorities: orderedAuthorities,
          authorityIds: Object.freeze(orderedAuthorities.map((authority) => authorityKeyId(authority))),
          target,
        }));
      }
    }
  }

  return Object.freeze({
    applicabilityContext: context,
    tSet,
    cSet: Object.freeze(cSet),
    localFails: Object.freeze(localFails),
  });
}

// ---------------------------------------------------------------------------
// Partitioning — provider-neutral. maxChecksPerBatch is an injected positive
// integer; partitions are order-preserving, disjoint, never drop a tail, and
// concatenate back to the exact ordered C-set.
// ---------------------------------------------------------------------------

export function partitionChecks(cSet, maxChecksPerBatch) {
  if (!Number.isInteger(maxChecksPerBatch) || maxChecksPerBatch < 1) {
    throw new SemanticValidationError({
      errorKind: "INPUT_PRECONDITION_FAILURE",
      detail: "maxChecksPerBatch must be an injected positive integer",
    });
  }
  const partitions = [];
  for (let start = 0; start < cSet.length; start += maxChecksPerBatch) {
    partitions.push(Object.freeze([...cSet.slice(start, start + maxChecksPerBatch)]));
  }
  return Object.freeze(partitions);
}
