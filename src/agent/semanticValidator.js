import { PRE_CORE_OUTCOME_CODES } from "./agentContractConstants.js";
import { evaluateDeterministicChecks } from "./semanticLocalEvaluator.js";
import { buildSemanticCheckSet } from "./semanticCheckEnumerator.js";
import { buildSemanticJudgePackets } from "./semanticJudgePacket.js";
import { assertSemanticJudgeInterface, invokeSemanticJudge } from "./semanticJudge.js";
import {
  proveSemanticCompleteness,
  proveSemanticProtocolIntegrity,
} from "./semanticCompleteness.js";
import { getSemanticSubrule } from "./semanticApplicability.js";
import {
  SemanticEvaluatorIncapacityError,
  SemanticValidationError,
  SemanticViolationError,
} from "./semanticValidationError.js";

// J1 — Offline Semantic Validator Core.
//
// Consumes a frozen canonical AgentInterpretationRequest and a successful
// frozen AgentInterpretationResult; mutates neither. Runs exactly the
// J1-owned deterministic semantic-stage checks, enumerates every
// provider-authored semantic target, expands the exact applicability matrix
// into the complete C-set, submits it to an injected judge in
// order-preserving batches, proves completeness, and:
//
//   - on PASS: returns the exact same Result object identity;
//   - on evaluator incapacity: throws a typed
//     SemanticEvaluatorIncapacityError;
//   - on semantic FAIL / local deterministic FAIL (only when no incapacity
//     exists): throws a typed SemanticViolationError;
//   - on judge protocol / identity failure: throws a typed
//     SemanticProtocolError (always winning over verdict content).
//
// Terminal precedence for a protocol-valid returned batch: protocol/identity
// failure first, then any UNABLE_TO_EVALUATE (evaluator incapacity — if any
// mandatory semantic check could not be evaluated, the semantic validation
// program is not complete, so incapacity outranks semantic FAIL), then
// semantic FAIL, and all-PASS only after the completeness proof.
//
// No SystemFailure materialization, no transport, no provider identity.

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

// Bounded input preconditions: only the paths J1 itself walks. A successful
// canonical Result structure is an assumed input precondition, not something
// J1 re-validates from scratch.
function assertInputPreconditions(agentInterpretationRequest, agentInterpretationResult) {
  const request = requirePlainObject(agentInterpretationRequest, "agentInterpretationRequest");
  const result = requirePlainObject(agentInterpretationResult, "agentInterpretationResult");

  const snapshot = requirePlainObject(request.engineSnapshot, "engineSnapshot");
  const engine = requirePlainObject(snapshot.engine, "engineSnapshot.engine");
  requirePlainObject(engine.outcome, "engineSnapshot.engine.outcome");
  requireArray(engine.observations, "engineSnapshot.engine.observations");
  const outcomeSource = snapshot.outcomeSource;
  if (outcomeSource === "DUAL_CORE") {
    requirePlainObject(engine.comparison, "engineSnapshot.engine.comparison");
  } else if (outcomeSource === "PRE_CORE_SELECTOR") {
    if (Object.hasOwn(engine, "comparison")) {
      preconditionFail("PRE_CORE_SELECTOR engine.comparison must be physically absent");
    }
    if (engine.observations.length !== 0) {
      preconditionFail("PRE_CORE_SELECTOR observations must be empty");
    }
    if (!PRE_CORE_OUTCOME_CODES.includes(engine.outcome.engineOutcomeCode)) {
      preconditionFail("PRE_CORE_SELECTOR engineOutcomeCode must be a lawful S_* code");
    }
  } else {
    preconditionFail("engineSnapshot.outcomeSource is not a lawful closed source");
  }

  const uncertainty = requirePlainObject(request.structuredUncertainty, "structuredUncertainty");
  for (const key of ["items", "known", "withheldOutputs", "survivingEvidenceRefs", "claimBoundaries"]) {
    requireArray(uncertainty[key], `structuredUncertainty.${key}`);
  }

  const pack = requirePlainObject(request.interpretationContextPack, "interpretationContextPack");
  requireArray(pack.selectedContextItems, "selectedContextItems");
  requireArray(pack.permittedInterpretationDomains, "permittedInterpretationDomains");
  requireArray(pack.prohibitedExtrapolationMarkers ?? [], "prohibitedExtrapolationMarkers");
  if (typeof request.permittedOutputScope !== "string") {
    preconditionFail("permittedOutputScope must be a string");
  }
  requireArray(request.activeConstraints ?? [], "activeConstraints");
  if (typeof request.humanReviewOccurred !== "boolean") {
    preconditionFail("humanReviewOccurred must be a boolean");
  }

  const interpretation = requirePlainObject(result.interpretation, "result.interpretation");
  const hypotheses = requirePlainObject(interpretation.hypotheses, "result.interpretation.hypotheses");
  requireArray(hypotheses.items, "result.interpretation.hypotheses.items");
  for (const key of [
    "decisiveEvidence",
    "conflictingEvidence",
    "missingEvidence",
    "changeConditions",
    "affectedResources",
    "watchpoints",
  ]) {
    requireArray(interpretation[key], `result.interpretation.${key}`);
  }
  requireArray(result.claims, "result.claims");
  requireArray(requirePlainObject(result.clientNarrative, "result.clientNarrative").sections, "result.clientNarrative.sections");
  requireArray(requirePlainObject(result.uncertainty, "result.uncertainty").disclosures, "result.uncertainty.disclosures");
  if (typeof result.interpretationStatus !== "string") {
    preconditionFail("result.interpretationStatus must be a string");
  }
  return { request, result };
}

const PRE_CORE_LAWFUL_CLAIM_TYPES = Object.freeze([
  "DETERMINISTIC_FACT",
  "UNCERTAINTY_DISCLOSURE",
  "SCOPE_LIMITATION_DISCLOSURE",
]);

function collectQrefs(value, into = []) {
  if (typeof value === "string") {
    if (value.startsWith("qref://")) into.push(value);
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectQrefs(item, into);
    return into;
  }
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) collectQrefs(child, into);
  }
  return into;
}

function preCoreStructuralFail(detail) {
  throw new SemanticViolationError({
    violationCode: "OUTPUT_SCHEMA_VIOLATION",
    detail,
    findings: Object.freeze([]),
  });
}

function assertPreCoreStructuralLaw(request, result) {
  if (request.engineSnapshot.outcomeSource !== "PRE_CORE_SELECTOR") return;

  if (result.interpretationStatus !== "SELECTOR_BOUNDARY_EXPLANATION") {
    preCoreStructuralFail("PRE_CORE_SELECTOR requires interpretationStatus SELECTOR_BOUNDARY_EXPLANATION");
  }
  if (result.abstentionReason !== null) {
    preCoreStructuralFail("PRE_CORE_SELECTOR requires abstentionReason null");
  }

  const interpretation = result.interpretation;
  const hypotheses = interpretation.hypotheses;
  if (hypotheses.ordering !== "CO_EQUAL") {
    preCoreStructuralFail("PRE_CORE_SELECTOR requires hypotheses.ordering CO_EQUAL");
  }
  if (hypotheses.items.length !== 0) {
    preCoreStructuralFail("PRE_CORE_SELECTOR requires hypotheses.items to be empty");
  }
  for (const key of [
    "decisiveEvidence",
    "conflictingEvidence",
    "missingEvidence",
    "changeConditions",
    "affectedResources",
    "watchpoints",
  ]) {
    if (interpretation[key].length !== 0) {
      preCoreStructuralFail(`PRE_CORE_SELECTOR requires interpretation.${key} to be empty`);
    }
  }
  for (const key of ["transitionPattern", "frictionMechanism", "scenarioInterpretation"]) {
    if (Object.hasOwn(interpretation, key)) {
      preCoreStructuralFail(`PRE_CORE_SELECTOR prohibits interpretation.${key}`);
    }
  }

  const seenTypes = new Set();
  for (const [index, claim] of result.claims.entries()) {
    if (!PRE_CORE_LAWFUL_CLAIM_TYPES.includes(claim.claimType)) {
      preCoreStructuralFail(
        `PRE_CORE_SELECTOR forbids claimType ${JSON.stringify(claim.claimType)} at claims[${index}]`,
      );
    }
    seenTypes.add(claim.claimType);
    if (Array.isArray(claim.contextRefs) && claim.contextRefs.length !== 0) {
      preCoreStructuralFail(`PRE_CORE_SELECTOR requires claims[${index}].contextRefs to be empty`);
    }
  }
  for (const requiredType of PRE_CORE_LAWFUL_CLAIM_TYPES) {
    if (!seenTypes.has(requiredType)) {
      preCoreStructuralFail(`PRE_CORE_SELECTOR requires at least one ${requiredType} claim`);
    }
  }

  const qrefs = collectQrefs(result);
  if (qrefs.length > 0) {
    preCoreStructuralFail("PRE_CORE_SELECTOR forbids qref grounding");
  }

  const requiredIds = request.structuredUncertainty.items
    .filter((item) => item.disclosureRequired === true)
    .map((item) => item.uncertaintyId);
  const disclosedIds = result.uncertainty.disclosures.map((row) => row.uncertaintyId);
  if (disclosedIds.length !== requiredIds.length || new Set(disclosedIds).size !== disclosedIds.length) {
    preCoreStructuralFail("PRE_CORE_SELECTOR requires a 1:1 disclosure for each disclosureRequired uncertainty item");
  }
  const disclosedSet = new Set(disclosedIds);
  for (const id of requiredIds) {
    if (!disclosedSet.has(id)) {
      preCoreStructuralFail("PRE_CORE_SELECTOR requires a 1:1 disclosure for each disclosureRequired uncertainty item");
    }
  }
}

function assertMaxChecksPerBatch(maxChecksPerBatch) {
  if (!Number.isInteger(maxChecksPerBatch) || maxChecksPerBatch < 1) {
    preconditionFail("maxChecksPerBatch must be an injected positive integer");
  }
  return maxChecksPerBatch;
}

function dFinding(dCheck) {
  return Object.freeze({
    ruleId: dCheck.ruleId,
    semanticSubruleId: null,
    targetFamily: null,
    targetLocator: null,
    violationCode: dCheck.violationCode,
    reasonCode: "RULE_VIOLATED",
    supportingAuthorityIds: [],
  });
}

function localFinding(finding) {
  return Object.freeze({
    ruleId: finding.ruleId,
    semanticSubruleId: finding.semanticSubruleId,
    targetFamily: finding.targetFamily,
    targetLocator: finding.targetLocator,
    violationCode: finding.violationCode,
    reasonCode: finding.reasonCode,
    supportingAuthorityIds: Object.freeze([...(finding.supportingAuthorityIds ?? [])]),
  });
}

export function assertNoLocalSemanticReject(dFailures = [], localFails = []) {
  const deterministic = Array.isArray(dFailures) ? dFailures : [];
  const local = Array.isArray(localFails) ? localFails : [];

  if (deterministic.length > 0) {
    throw new SemanticViolationError({
      violationCode: deterministic[0].violationCode,
      detail: deterministic[0].detail,
      findings: deterministic.map(dFinding),
    });
  }

  if (local.length > 0) {
    throw new SemanticViolationError({
      violationCode: local[0].violationCode,
      detail: local[0].detail,
      findings: local.map(localFinding),
    });
  }
}

// Findings are ordered by canonical semantic evaluation order
// (rule → semanticSubrule → targetFamily → instance), realized as the
// C-set index of the underlying check. checkId lexical order is never used.
function orderedVerdictChecks(verdicts, checksByCheckId) {
  return verdicts
    .map((verdict) => ({ verdict, check: checksByCheckId.get(verdict.checkId) }))
    .sort((left, right) => left.check.cIndex - right.check.cIndex);
}

function violationFindings(verdicts, checksByCheckId) {
  return orderedVerdictChecks(verdicts, checksByCheckId)
    .map(({ verdict, check }) => Object.freeze({
      ruleId: check.ruleId,
      semanticSubruleId: check.semanticSubruleId,
      targetFamily: check.targetFamily,
      targetLocator: check.targetLocator,
      violationCode: getSemanticSubrule(check.semanticSubruleId)?.failureViolationCode ?? null,
      reasonCode: verdict.reasonCode,
      supportingAuthorityIds: Object.freeze([...verdict.supportingAuthorityIds]),
    }));
}

function incapacityFindings(verdicts, checksByCheckId) {
  return orderedVerdictChecks(verdicts, checksByCheckId)
    .map(({ verdict, check }) => Object.freeze({
      ruleId: check.ruleId,
      semanticSubruleId: check.semanticSubruleId,
      targetFamily: check.targetFamily,
      targetLocator: check.targetLocator,
      reasonCode: verdict.reasonCode,
      checkId: check.checkId,
    }));
}

export async function validateAgentInterpretationSemantics({
  agentInterpretationRequest,
  agentInterpretationResult,
  semanticJudge,
  maxChecksPerBatch,
} = {}) {
  const { request, result } = assertInputPreconditions(agentInterpretationRequest, agentInterpretationResult);
  assertSemanticJudgeInterface(semanticJudge);
  assertMaxChecksPerBatch(maxChecksPerBatch);
  assertPreCoreStructuralLaw(request, result);

  // D-set: J1-owned deterministic checks run first, in fixed order.
  const dSet = evaluateDeterministicChecks(request, result);
  const dFailures = dSet.filter((dCheck) => dCheck.outcome === "FAIL");
  assertNoLocalSemanticReject(dFailures, []);

  // T-set + C-set: complete matrix expansion with local three-way evaluation.
  const { tSet, cSet, localFails } = buildSemanticCheckSet(request, result);
  assertNoLocalSemanticReject(dFailures, localFails);

  // Zero-check case: no judge invocation is lawful and the same Result
  // identity returns immediately after the completeness proof.
  if (cSet.length === 0) {
    proveSemanticCompleteness({
      agentInterpretationRequest: request,
      agentInterpretationResult: result,
      dSet,
      tSet,
      cSet,
      localFails,
      partitions: [],
      processedPartitions: [],
    });
    assertNoLocalSemanticReject(dFailures, localFails);
    return agentInterpretationResult;
  }

  // P-set + packets + S-set: order-preserving submission to the injected judge.
  const { partitions, packets } = buildSemanticJudgePackets({ cSet, maxChecksPerBatch });
  const processedPartitions = [];
  for (const [index, packet] of packets.entries()) {
    const verdicts = await invokeSemanticJudge(semanticJudge, packet);
    processedPartitions.push(Object.freeze({ packet, verdicts }));
  }

  // Protocol integrity always precedes verdict interpretation: an
  // untrustworthy batch can never justify PASS, FAIL, or incapacity.
  proveSemanticProtocolIntegrity({
    agentInterpretationRequest: request,
    agentInterpretationResult: result,
    dSet,
    tSet,
    cSet,
    partitions,
    processedPartitions,
  });

  const checksByCheckId = new Map(cSet.map((check, cIndex) => [check.checkId, { ...check, cIndex }]));
  const verdicts = processedPartitions.flatMap((processed) => processed.verdicts);

  // UNABLE_TO_EVALUATE outranks semantic FAIL: with any un-evaluated mandatory
  // check the semantic validation program is incomplete, so the terminal
  // classification is evaluator incapacity. Observed FAIL references are not
  // exposed on this path.
  const unableFindings = incapacityFindings(
    verdicts.filter((verdict) => verdict.verdict === "UNABLE_TO_EVALUATE"),
    checksByCheckId,
  );
  if (unableFindings.length > 0) {
    throw new SemanticEvaluatorIncapacityError({
      detail: `${unableFindings.length} semantic check(s) could not be evaluated in canonical order`,
      findings: unableFindings,
    });
  }

  const failedFindings = violationFindings(
    verdicts.filter((verdict) => verdict.verdict === "FAIL"),
    checksByCheckId,
  );
  if (failedFindings.length > 0) {
    throw new SemanticViolationError({
      violationCode: failedFindings[0].violationCode,
      detail: `${failedFindings.length} semantic check(s) decided FAIL in canonical order`,
      findings: failedFindings,
    });
  }

  proveSemanticCompleteness({
    agentInterpretationRequest: request,
    agentInterpretationResult: result,
    dSet,
    tSet,
    cSet,
    localFails,
    partitions,
    processedPartitions,
  });

  // PASS: the exact same Result object identity, unchanged, and only when
  // local/deterministic evaluation did not already reject.
  assertNoLocalSemanticReject(dFailures, localFails);
  return agentInterpretationResult;
}
