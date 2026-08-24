import {
  SEMANTIC_JUDGE_PACKET_VERSION,
  SEMANTIC_JUDGE_PROMPT_VERSION,
} from "./semanticValidatorConstants.js";
import { authorityKeyId, partitionChecks } from "./semanticCheckEnumerator.js";

// J1 — Provider-neutral semantic judge packets. A packet carries the exact
// targets, the batch-factored authorities, and the checks of one partition.
// Full authority values appear once per packet; each check references them by
// authority id, so no authority text is duplicated per check.

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

export function buildSemanticJudgePacket({ checks, batchIndex, batchCount }) {
  const targets = [];
  const targetsSeen = new Set();
  const authorities = [];
  const authoritiesSeen = new Set();
  const packetChecks = [];

  for (const check of checks) {
    const target = check.target;
    if (!targetsSeen.has(target.targetLocator)) {
      targetsSeen.add(target.targetLocator);
      targets.push(deepFreeze({
        targetFamily: target.targetFamily,
        targetLocator: target.targetLocator,
        targetDigest: target.targetDigest,
        text: target.text,
        metadata: target.metadata,
      }));
    }
    for (const authority of check.authorities) {
      const key = authorityKeyId(authority);
      if (!authoritiesSeen.has(key)) {
        authoritiesSeen.add(key);
        authorities.push(deepFreeze({
          kind: authority.kind,
          id: authority.id,
          value: authority.value,
        }));
      }
    }
    packetChecks.push(deepFreeze({
      checkId: check.checkId,
      ruleId: check.ruleId,
      semanticSubruleId: check.semanticSubruleId,
      targetFamily: check.targetFamily,
      targetLocator: check.targetLocator,
      expectedInvariant: check.expectedInvariant,
      allowedSemanticInterpretations: [...check.allowedSemanticInterpretations],
      forbiddenSemanticImplications: [...check.forbiddenSemanticImplications],
      authorityIds: [...check.authorityIds],
    }));
  }

  return deepFreeze({
    semanticJudgePacketVersion: SEMANTIC_JUDGE_PACKET_VERSION,
    semanticJudgePromptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
    batchIndex,
    batchCount,
    targets: Object.freeze(targets),
    authorities: Object.freeze(authorities),
    checks: Object.freeze(packetChecks),
  });
}

export function buildSemanticJudgePackets({ cSet, maxChecksPerBatch }) {
  const partitions = partitionChecks(cSet, maxChecksPerBatch);
  const packets = partitions.map((checks, batchIndex) => buildSemanticJudgePacket({
    checks,
    batchIndex,
    batchCount: partitions.length,
  }));
  return Object.freeze({ partitions, packets: Object.freeze(packets) });
}
