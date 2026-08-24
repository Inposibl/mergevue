import {
  REASON_AUTHORITY_ABSENT,
  REASON_RULE_SATISFIED,
  REASON_RULE_VIOLATED,
} from "./semanticValidatorConstants.js";
import { getSemanticSubrule } from "./semanticApplicability.js";
import { SemanticValidationError } from "./semanticValidationError.js";
import { validateSemanticJudgeVerdictResponse } from "./semanticJudgeVerdictSchema.js";

// J1 — Provider-neutral semantic judge boundary. The judge is always injected:
// a function from one canonical judge packet to one verdict response. This
// module owns no transport, no endpoint, no credential, no repeat-attempt
// logic, and no capacity constant. The future transport adapter supplies the
// live judge; offline validation injects the deterministic mock below.

export function assertSemanticJudgeInterface(semanticJudge) {
  if (typeof semanticJudge !== "function") {
    throw new SemanticValidationError({
      errorKind: "INPUT_PRECONDITION_FAILURE",
      detail: "semanticJudge must be an injected function accepting one judge packet",
    });
  }
  return semanticJudge;
}

// One judge invocation: call, then admit the response structurally and by
// exact submitted identity. A protocol failure here always wins over any
// verdict content because an untrusted batch is not evidence of anything.
export async function invokeSemanticJudge(semanticJudge, packet) {
  assertSemanticJudgeInterface(semanticJudge);
  const response = await semanticJudge(packet);
  return validateSemanticJudgeVerdictResponse({ submittedChecks: packet.checks, response });
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

// Deterministic offline mock judge. resolveVerdict(check, index, packet)
// returns { verdict, violationCode?, reasonCode?, supportingAuthorityIds? };
// the mock echoes exact identities for every submitted check. Misbehaviour
// options let offline validation exercise protocol-failure paths — they never
// involve any transport and never appear in production wiring.
export function createMockSemanticJudge(resolveVerdict, options = {}) {
  if (typeof resolveVerdict !== "function") {
    throw new SemanticValidationError({
      errorKind: "INPUT_PRECONDITION_FAILURE",
      detail: "createMockSemanticJudge requires a deterministic resolveVerdict function",
    });
  }
  const judge = async function mockSemanticJudge(packet) {
    if (options.recordCalls) {
      judge.calls.push(deepFreeze({
        batchIndex: packet.batchIndex,
        batchCount: packet.batchCount,
        checkCount: packet.checks.length,
      }));
    }
    const verdicts = packet.checks.map((check, index) => {
      const resolved = resolveVerdict(check, index, packet) ?? {};
      const verdict = resolved.verdict ?? "PASS";
      const reasonCode = resolved.reasonCode
        ?? (verdict === "PASS" ? REASON_RULE_SATISFIED
          : verdict === "FAIL" ? REASON_RULE_VIOLATED
            : REASON_AUTHORITY_ABSENT);
      const violationCode = Object.hasOwn(resolved, "violationCode")
        ? resolved.violationCode
        : (verdict === "FAIL" ? (getSemanticSubrule(check.semanticSubruleId)?.failureViolationCode ?? null) : null);
      let supportingAuthorityIds = resolved.supportingAuthorityIds ?? (check.authorityIds.length > 0 ? [check.authorityIds[0]] : []);
      if (options.foreignAuthorityId === true) {
        supportingAuthorityIds = [...supportingAuthorityIds, "ENGINE_FACT:not-in-this-check"];
      }
      const item = {
        checkId: check.checkId,
        ruleId: options.echoMismatch === true && index === 0 ? "V-00" : check.ruleId,
        targetLocator: options.echoMismatch === true && index === 0 ? "tampered.locator" : check.targetLocator,
        verdict: options.corruptVerdictEnum === true && index === 0 ? "MAYBE" : verdict,
        violationCode,
        reasonCode,
        supportingAuthorityIds,
      };
      return item;
    });
    if (options.dropItems === 1 || options.dropItems === true) verdicts.pop();
    else if (Number.isInteger(options.dropItems) && options.dropItems > 0) {
      verdicts.length = Math.max(0, verdicts.length - options.dropItems);
    }
    if (options.duplicateItem === true && verdicts.length > 0) {
      verdicts.push({ ...verdicts[0] });
    }
    if (options.extraItem === true) {
      verdicts.push({
        checkId: "sha256:unexpected-extra-verdict",
        ruleId: "V-99",
        targetLocator: "unexpected.locator",
        verdict: "PASS",
        violationCode: null,
        reasonCode: REASON_RULE_SATISFIED,
        supportingAuthorityIds: [],
      });
    }
    if (options.unknownCheckId === true && verdicts.length > 0) {
      verdicts[0] = { ...verdicts[0], checkId: "sha256:unknown-check-identity" };
    }
    return verdicts;
  };
  judge.calls = [];
  return judge;
}
