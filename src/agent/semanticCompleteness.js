import { canonicalSerialize } from "./canonicalDigest.js";
import {
  buildSemanticCheckSet,
  enumerateSemanticTargets,
} from "./semanticCheckEnumerator.js";
import { SemanticProtocolError } from "./semanticValidationError.js";

// J1 — Completeness proof. PASS can occur only when every condition below
// holds; any violation is a protocol failure because the batch pipeline, not
// the authored text, is untrustworthy.
//
//   1  all J1-owned D checks ran and none FAIL;
//   2  T-set equals the physical Result walk;
//   3  C-set equals the exact applicability-matrix expansion over T-set;
//   4  S-set sequence equals C-set sequence;
//   5  partitions are disjoint and complete;
//   6  every partition required on the PASS path was processed;
//   7  each processed partition returns exact cardinality;
//   8  verdict checkIds are unique;
//   9  every echoed ruleId/targetLocator matches its submitted check;
//   10 no unexpected verdict exists;
//   11 every supportingAuthorityId belongs to that submitted check;
//   12 no verdict is FAIL;
//   13 no verdict is UNABLE_TO_EVALUATE.
//
// Conditions 1–11 (protocol integrity) hold on every terminal path; 12–13 are
// additionally required on the PASS path only, because FAIL and UNABLE are
// lawful terminal outcomes with their own typed errors.

function proofFail(detail) {
  throw new SemanticProtocolError({ detail });
}

function targetFingerprint(targets) {
  return canonicalSerialize(targets.map((target) => ({
    targetFamily: target.targetFamily,
    targetLocator: target.targetLocator,
    targetDigest: target.targetDigest,
  })));
}

export function proveSemanticProtocolIntegrity({
  agentInterpretationRequest,
  agentInterpretationResult,
  dSet,
  tSet,
  cSet,
  partitions,
  processedPartitions,
}) {
  // 1 — deterministic checks all ran and none FAIL.
  if (!Array.isArray(dSet) || dSet.length === 0) {
    proofFail("the D-set of J1-owned deterministic checks is absent");
  }
  for (const dCheck of dSet) {
    if (dCheck.outcome === "FAIL") {
      proofFail(`deterministic check ${dCheck.dCheckId} failed`);
    }
    if (dCheck.outcome !== "PASS") {
      proofFail(`deterministic check ${dCheck.dCheckId} did not reach a decision`);
    }
  }

  // 2 — T-set equals the physical Result walk.
  const physicalWalk = enumerateSemanticTargets(agentInterpretationRequest, agentInterpretationResult);
  if (targetFingerprint(tSet) !== targetFingerprint(physicalWalk)) {
    proofFail("T-set does not equal the physical Result walk");
  }

  // 3 — C-set equals the exact applicability-matrix expansion over T-set.
  const rebuilt = buildSemanticCheckSet(agentInterpretationRequest, agentInterpretationResult);
  if (canonicalSerialize(cSet.map((check) => check.checkId))
    !== canonicalSerialize(rebuilt.cSet.map((check) => check.checkId))) {
    proofFail("C-set does not equal the applicability-matrix expansion over the T-set");
  }
  if (canonicalSerialize(cSet.map((check) => check.authoritySetDigest))
    !== canonicalSerialize(rebuilt.cSet.map((check) => check.authoritySetDigest))) {
    proofFail("C-set authority digests do not equal the canonical expansion");
  }

  // C-set identity uniqueness (J1's own check invariant).
  const cSetIds = new Set();
  for (const check of cSet) {
    if (cSetIds.has(check.checkId)) proofFail(`C-set carries a duplicate checkId: ${check.checkId}`);
    cSetIds.add(check.checkId);
  }

  // 5 — partitions disjoint and complete over the C-set.
  const partitionMembership = new Map();
  partitions.forEach((partition, partitionIndex) => {
    for (const check of partition) {
      if (partitionMembership.has(check.checkId)) {
        proofFail(`check belongs to more than one partition: ${check.checkId}`);
      }
      partitionMembership.set(check.checkId, partitionIndex);
    }
  });
  if (partitionMembership.size !== cSet.length) {
    proofFail("partitions do not cover the complete C-set");
  }
  for (const check of cSet) {
    if (!partitionMembership.has(check.checkId)) {
      proofFail(`C-set check is absent from every partition: ${check.checkId}`);
    }
  }

  // 6 — every partition required on the PASS path was processed.
  if (!Array.isArray(processedPartitions) || processedPartitions.length !== partitions.length) {
    proofFail("not every required partition was processed");
  }

  // 4 + 7 + 8 + 9 + 10 + 11 — submission sequence, cardinality, identity.
  const submittedSequence = [];
  const verdictCheckIds = new Set();
  processedPartitions.forEach((processed, index) => {
    const partition = partitions[index];
    const packet = processed.packet;
    if (packet.batchIndex !== index || packet.batchCount !== partitions.length) {
      proofFail(`processed partition ${index} carries an unlawful batch position`);
    }
    if (canonicalSerialize(packet.checks.map((check) => check.checkId))
      !== canonicalSerialize(partition.map((check) => check.checkId))) {
      proofFail(`partition ${index} was not submitted exactly as partitioned`);
    }
    if (!Array.isArray(processed.verdicts) || processed.verdicts.length !== partition.length) {
      proofFail(`partition ${index} did not return exact cardinality`);
    }
    for (const check of partition) submittedSequence.push(check);
    for (const verdict of processed.verdicts) {
      if (verdictCheckIds.has(verdict.checkId)) {
        proofFail(`verdict checkId is duplicated: ${verdict.checkId}`);
      }
      verdictCheckIds.add(verdict.checkId);
    }
  });
  if (canonicalSerialize(submittedSequence.map((check) => check.checkId))
    !== canonicalSerialize(cSet.map((check) => check.checkId))) {
    proofFail("S-set sequence does not equal the C-set sequence");
  }
  const byCheckId = new Map(cSet.map((check) => [check.checkId, check]));
  for (const verdict of processedPartitions.flatMap((processed) => processed.verdicts)) {
    const submitted = byCheckId.get(verdict.checkId);
    if (submitted === undefined) {
      proofFail(`an unexpected verdict exists: ${verdict.checkId}`);
    }
    if (verdict.ruleId !== submitted.ruleId || verdict.targetLocator !== submitted.targetLocator) {
      proofFail(`verdict echo does not match its submitted check: ${verdict.checkId}`);
    }
    const lawfulAuthorityIds = new Set(submitted.authorityIds);
    for (const authorityId of verdict.supportingAuthorityIds) {
      if (!lawfulAuthorityIds.has(authorityId)) {
        proofFail(`verdict cites an authority absent from its submitted check: ${authorityId}`);
      }
    }
  }

  return Object.freeze({ ok: true });
}

export function proveSemanticCompleteness({
  agentInterpretationRequest,
  agentInterpretationResult,
  dSet,
  tSet,
  cSet,
  localFails = [],
  partitions,
  processedPartitions,
}) {
  if (Array.isArray(localFails) && localFails.length > 0) {
    proofFail("local deterministic semantic FAILs exist; completeness cannot authorize PASS");
  }

  proveSemanticProtocolIntegrity({
    agentInterpretationRequest,
    agentInterpretationResult,
    dSet,
    tSet,
    cSet,
    partitions,
    processedPartitions,
  });

  const verdicts = processedPartitions.flatMap((processed) => processed.verdicts);
  if (verdicts.length !== cSet.length) {
    proofFail(`verdict cardinality ${verdicts.length} does not equal the C-set cardinality ${cSet.length}`);
  }

  // 12 — no verdict is FAIL.
  for (const verdict of verdicts) {
    if (verdict.verdict === "FAIL") {
      proofFail(`a FAIL verdict exists on the PASS path: ${verdict.checkId}`);
    }
  }
  // 13 — no verdict is UNABLE_TO_EVALUATE.
  for (const verdict of verdicts) {
    if (verdict.verdict === "UNABLE_TO_EVALUATE") {
      proofFail(`an UNABLE_TO_EVALUATE verdict exists on the PASS path: ${verdict.checkId}`);
    }
  }

  return Object.freeze({ ok: true });
}
