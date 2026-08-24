import {
  JUDGE_INCAPACITY_REASON_CODES,
  JUDGE_REASON_CODES,
  JUDGE_VERDICT_FAIL,
  JUDGE_VERDICT_PASS,
  REASON_RULE_SATISFIED,
  REASON_RULE_VIOLATED,
  SEMANTIC_JUDGE_PACKET_VERSION,
  SEMANTIC_VIOLATION_CODES,
} from "./semanticValidatorConstants.js";
import { getSemanticSubrule } from "./semanticApplicability.js";
import { SemanticProtocolError } from "./semanticValidationError.js";

// J1 — Dynamic verdict schema and local verdict admission. The schema enforces
// the structural shape and the exact submitted cardinality; JSON Schema is
// never trusted to prove identity, so exact checkId / echo / authority
// identity is always verified locally afterwards.

const nonEmptyString = Object.freeze({ type: "string", minLength: 1 });

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

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function buildSemanticJudgeVerdictSchema(submittedChecks) {
  if (!Array.isArray(submittedChecks)) {
    throw new SemanticProtocolError({ detail: "submittedChecks must be an array" });
  }
  return deepFreeze({
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: `${SEMANTIC_JUDGE_PACKET_VERSION}/verdicts`,
    title: "MergeVue semantic judge verdict response",
    type: "array",
    minItems: submittedChecks.length,
    maxItems: submittedChecks.length,
    items: Object.freeze({
      type: "object",
      additionalProperties: false,
      required: Object.freeze([
        "checkId",
        "ruleId",
        "targetLocator",
        "verdict",
        "violationCode",
        "reasonCode",
        "supportingAuthorityIds",
      ]),
      properties: Object.freeze({
        checkId: nonEmptyString,
        ruleId: nonEmptyString,
        targetLocator: nonEmptyString,
        verdict: Object.freeze({ enum: Object.freeze(["PASS", "FAIL", "UNABLE_TO_EVALUATE"]) }),
        violationCode: Object.freeze({ enum: Object.freeze([null, ...SEMANTIC_VIOLATION_CODES]) }),
        reasonCode: Object.freeze({ enum: JUDGE_REASON_CODES }),
        supportingAuthorityIds: Object.freeze({ type: "array", items: nonEmptyString }),
      }),
    }),
  });
}

function schemaFail(detail) {
  throw new SemanticProtocolError({ detail });
}

function validateSchemaNode(value, schemaNode, path) {
  if (Object.hasOwn(schemaNode, "enum")) {
    if (!schemaNode.enum.includes(value)) {
      schemaFail(`${path} is not a lawful enum value: ${JSON.stringify(value)}`);
    }
    return;
  }
  const type = schemaNode.type;
  if (type === "object") {
    if (!isPlainObject(value)) schemaFail(`${path} must be an object`);
    if (schemaNode.additionalProperties === false) {
      const allowed = new Set(Object.keys(schemaNode.properties ?? {}));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) schemaFail(`${path} carries unknown key ${JSON.stringify(key)}`);
      }
    }
    for (const key of schemaNode.required ?? []) {
      if (!Object.hasOwn(value, key)) schemaFail(`${path} is missing required key ${JSON.stringify(key)}`);
    }
    for (const [key, childSchema] of Object.entries(schemaNode.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateSchemaNode(value[key], childSchema, `${path}.${key}`);
    }
    return;
  }
  if (type === "array") {
    if (!Array.isArray(value)) schemaFail(`${path} must be an array`);
    if (schemaNode.minItems !== undefined && value.length < schemaNode.minItems) {
      schemaFail(`${path} must carry at least ${schemaNode.minItems} items (observed ${value.length})`);
    }
    if (schemaNode.maxItems !== undefined && value.length > schemaNode.maxItems) {
      schemaFail(`${path} must carry at most ${schemaNode.maxItems} items (observed ${value.length})`);
    }
    if (schemaNode.items !== undefined) {
      value.forEach((item, index) => validateSchemaNode(item, schemaNode.items, `${path}[${index}]`));
    }
    return;
  }
  if (type === "string") {
    if (typeof value !== "string") schemaFail(`${path} must be a string`);
    if (schemaNode.minLength !== undefined && value.length < schemaNode.minLength) {
      schemaFail(`${path} must not be shorter than ${schemaNode.minLength}`);
    }
    return;
  }
  schemaFail(`schema node at ${path} has unsupported type ${JSON.stringify(type)}`);
}

// Exact cross-field verdict law, checked against the submitted check's own
// applicability row. Under FAIL the violationCode must equal the canonical
// failure classification of that submitted check's subrule — never an
// arbitrary non-null string. Under UNABLE_TO_EVALUATE the reasonCode must be
// exactly one of the four incapacity reasons. Every other combination is a
// typed protocol failure at this admission boundary.
function assertCrossFieldRequirements(verdictItem, index, submitted) {
  const label = `verdicts[${index}]`;
  if (verdictItem.verdict === JUDGE_VERDICT_PASS) {
    if (verdictItem.violationCode !== null) schemaFail(`${label}.violationCode must be null under PASS`);
    if (verdictItem.reasonCode !== REASON_RULE_SATISFIED) schemaFail(`${label}.reasonCode must be RULE_SATISFIED under PASS`);
    return;
  }
  if (verdictItem.verdict === JUDGE_VERDICT_FAIL) {
    const expectedClass = getSemanticSubrule(submitted.semanticSubruleId)?.failureViolationCode ?? null;
    if (expectedClass === null) {
      schemaFail(`${label} references a subrule without a canonical failure class: ${submitted.semanticSubruleId}`);
    }
    if (verdictItem.violationCode !== expectedClass) {
      schemaFail(
        `${label}.violationCode must equal the canonical failure class ${expectedClass} of ${submitted.semanticSubruleId} (observed ${JSON.stringify(verdictItem.violationCode)})`,
      );
    }
    if (verdictItem.reasonCode !== REASON_RULE_VIOLATED) schemaFail(`${label}.reasonCode must be RULE_VIOLATED under FAIL`);
    return;
  }
  if (verdictItem.violationCode !== null) schemaFail(`${label}.violationCode must be null under UNABLE_TO_EVALUATE`);
  if (!JUDGE_INCAPACITY_REASON_CODES.includes(verdictItem.reasonCode)) {
    schemaFail(`${label}.reasonCode must be exactly one incapacity reason under UNABLE_TO_EVALUATE`);
  }
}

// Full batch admission: schema walk (exact cardinality), cross-field law, and
// local identity verification against the submitted checks.
export function validateSemanticJudgeVerdictResponse({ submittedChecks, response }) {
  const schema = buildSemanticJudgeVerdictSchema(submittedChecks);
  validateSchemaNode(response, schema, "verdicts");
  const byCheckId = new Map(submittedChecks.map((check) => [check.checkId, check]));
  const seen = new Set();
  response.forEach((verdictItem, index) => {
    const submitted = byCheckId.get(verdictItem.checkId);
    if (submitted === undefined) {
      schemaFail(`verdicts[${index}].checkId is not a submitted check identity: ${verdictItem.checkId}`);
    }
    if (seen.has(verdictItem.checkId)) {
      schemaFail(`verdicts[${index}].checkId is duplicated: ${verdictItem.checkId}`);
    }
    seen.add(verdictItem.checkId);
    if (verdictItem.ruleId !== submitted.ruleId) {
      schemaFail(`verdicts[${index}].ruleId does not echo the submitted check`);
    }
    if (verdictItem.targetLocator !== submitted.targetLocator) {
      schemaFail(`verdicts[${index}].targetLocator does not echo the submitted check`);
    }
    assertCrossFieldRequirements(verdictItem, index, submitted);
    const lawfulAuthorityIds = new Set(submitted.authorityIds);
    for (const authorityId of verdictItem.supportingAuthorityIds) {
      if (!lawfulAuthorityIds.has(authorityId)) {
        schemaFail(`verdicts[${index}].supportingAuthorityIds carries an id absent from the submitted check: ${authorityId}`);
      }
    }
  });
  return deepFreeze(response.map((verdictItem) => deepFreeze({ ...verdictItem })));
}
