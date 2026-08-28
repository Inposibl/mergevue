import questionnaires from "../generated/newlogic/questionnaires.json" with { type: "json" };
import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import { canonicalSerialize, sha256PrefixedDigest } from "../agent/canonicalDigest.js";

export const PRE_DUAL_SEMANTIC_INTEGRITY = "PRE_DUAL_SEMANTIC_INTEGRITY";
export const INPUT_INTEGRITY_FAILURE = "INPUT_INTEGRITY_FAILURE";
export const CONFIGURATION_INTEGRITY_FAILURE = "CONFIGURATION_INTEGRITY_FAILURE";
export const CANONICAL_FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE = "INPUT_ASSEMBLY_FAILURE";

export const DUAL_SEMANTIC_FAILURE_REASONS = Object.freeze([
  "MISSING_SEMANTIC_IDENTITY",
  "UNSUPPORTED_SEMANTIC_MODULE",
  "CANONICAL_QUESTION_MODULE_MISMATCH",
  "WORKBOOK_QUESTION_ID_MISMATCH",
  "UNKNOWN_SELECTED_OPTION",
  "UNSUPPORTED_CANONICAL_BINDING",
  "SAME_MODULE_INVARIANT_VIOLATION",
  "DUPLICATE_SEMANTIC_BINDING",
  "AMBIGUOUS_CANONICAL_BINDING",
  "MISSING_SEMANTIC_BINDING",
  "SEMANTIC_BINDING_DIGEST_MISMATCH",
  "SEMANTIC_REGISTRY_CONFIGURATION_ERROR",
]);

const AUTHORIZED_MODULE_IDS = Object.freeze(["acquirerEnvironment", "targetSelfAssessment"]);
const Q9_Q10 = Object.freeze(["Q9", "Q10"]);
const RESPONDENT_SLOTS = Object.freeze(["R1", "R2"]);
const SUPERSEDED_DIGESTS = Object.freeze([
  "sha256:230023d493a5c27bb6d0aed3a24f10fffa07b19c6a0a1f97e87b4f168a28daea",
  "sha256:cb1239cada38ba82b31f305006d190966aef959ba1cf1915663d8dd01be27fd0",
  "sha256:bcd820d0cbc7bfa581d42ba0ed54434c64ff94750c5a7ea41e7e6d033d9cbf6b",
  "sha256:b8b7cf9b869481d4865d1341d0f523b3f85270c19c59ccc68a959ff338021316",
]);
const EXPECTED_DIGESTS = Object.freeze({
  "acquirerEnvironment|Q9": Object.freeze({
    digest: "sha256:8f9c36125ab2f6c5d59e0d29c5651aac8c918d213e7455b6dd0e17215a07c833",
    bytes: 1419,
  }),
  "acquirerEnvironment|Q10": Object.freeze({
    digest: "sha256:13dd709ddb265aa747b48a59ba4d3cba8ac2cb4b4e47ca816c240a2e78a31d46",
    bytes: 1339,
  }),
  "targetSelfAssessment|Q9": Object.freeze({
    digest: "sha256:cdd4495fbb8a18ea82b120b07ef9c8648e90363a432647a50f953bd51e89045a",
    bytes: 1815,
  }),
  "targetSelfAssessment|Q10": Object.freeze({
    digest: "sha256:4a79992147af7a642dca1df6670dfd1a561803f70891f45ef165ba0595a4398c",
    bytes: 1526,
  }),
});
const AUTHORIZED_BINDING_KEYS = Object.freeze([
  Object.freeze({ moduleId: "acquirerEnvironment", canonicalQuestionId: "ACQUIRERENVIRONMENT-Q9", workbookQuestionId: "Q9" }),
  Object.freeze({ moduleId: "acquirerEnvironment", canonicalQuestionId: "ACQUIRERENVIRONMENT-Q10", workbookQuestionId: "Q10" }),
  Object.freeze({ moduleId: "targetSelfAssessment", canonicalQuestionId: "TARGETSELFASSESSMENT-Q9", workbookQuestionId: "Q9" }),
  Object.freeze({ moduleId: "targetSelfAssessment", canonicalQuestionId: "TARGETSELFASSESSMENT-Q10", workbookQuestionId: "Q10" }),
]);

export class DualSemanticIntegrityError extends Error {
  constructor({
    failureReason,
    integrityDomain,
    semanticIdentity = {},
    detail = null,
  } = {}) {
    const reason = DUAL_SEMANTIC_FAILURE_REASONS.includes(failureReason)
      ? failureReason
      : "SEMANTIC_REGISTRY_CONFIGURATION_ERROR";
    const domain = integrityDomain === CONFIGURATION_INTEGRITY_FAILURE
      ? CONFIGURATION_INTEGRITY_FAILURE
      : INPUT_INTEGRITY_FAILURE;
    const parts = [
      "DualSemanticIntegrityError",
      `boundary=${PRE_DUAL_SEMANTIC_INTEGRITY}`,
      `integrityDomain=${domain}`,
      `failureReason=${reason}`,
      `canonicalFailureClass=${CANONICAL_FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE}`,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "DualSemanticIntegrityError";
    this.boundary = PRE_DUAL_SEMANTIC_INTEGRITY;
    this.integrityDomain = domain;
    this.failureReason = reason;
    this.canonicalFailureClass = CANONICAL_FAILURE_CLASS_INPUT_ASSEMBLY_FAILURE;
    this.retryable = false;
    this.semanticIdentity = Object.freeze({
      respondentSlot: semanticIdentity.respondentSlot ?? null,
      moduleId: semanticIdentity.moduleId ?? null,
      canonicalQuestionId: semanticIdentity.canonicalQuestionId ?? null,
      workbookQuestionId: semanticIdentity.workbookQuestionId ?? null,
      selectedOption: semanticIdentity.selectedOption ?? null,
    });
    this.detail = detail ?? null;
  }
}

function text(value) {
  return String(value ?? "").trim();
}

function fail(failureReason, integrityDomain, semanticIdentity, detail) {
  throw new DualSemanticIntegrityError({
    failureReason,
    integrityDomain,
    semanticIdentity,
    detail,
  });
}

function configFail(failureReason, detail, semanticIdentity = {}) {
  fail(failureReason, CONFIGURATION_INTEGRITY_FAILURE, semanticIdentity, detail);
}

function inputFail(failureReason, semanticIdentity, detail) {
  fail(failureReason, INPUT_INTEGRITY_FAILURE, semanticIdentity, detail);
}

export function findQuestionnaireQuestion(moduleId, workbookQuestionId) {
  const module = (questionnaires.modules ?? []).find((row) => row.id === moduleId);
  if (!module) return null;
  return (module.questions ?? []).find((row) => row.workbookQuestionId === workbookQuestionId) ?? null;
}

export function lookupQuestionOptionSemantics(workbookQuestionId, optionValue) {
  const row = (scoringAndTriage.dualRespondentComparison?.questionOptionSemantics ?? []).find(
    (item) => item.questionref === workbookQuestionId && item.optioncode === optionValue,
  );
  return row?.semanticclass ?? null;
}

export function reconstructBindingMaterial(moduleId, workbookQuestionId) {
  const question = findQuestionnaireQuestion(moduleId, workbookQuestionId);
  if (!question) return null;
  return {
    moduleId,
    canonicalQuestionId: question.id,
    workbookQuestionId,
    options: (question.options ?? []).map((option) => ({
      selectedOption: option.value,
      optionText: option.text,
      environmentSignals: [...new Set(option.internalEnvironmentSignals ?? [])].sort(),
      excludedFromPrimaryScoring: option.excludedFromPrimaryScoring === true,
      semanticClass: lookupQuestionOptionSemantics(workbookQuestionId, option.value) ?? null,
    })),
  };
}

export function computeBindingDigest(material) {
  const canonical = canonicalSerialize(material);
  return {
    canonical,
    bytes: Buffer.byteLength(canonical, "utf8"),
    digest: sha256PrefixedDigest(canonical),
  };
}

function moduleFamilyFromCanonical(canonicalQuestionId) {
  const id = text(canonicalQuestionId);
  if (id.startsWith("ACQUIRERENVIRONMENT-")) return "acquirerEnvironment";
  if (id.startsWith("TARGETSELFASSESSMENT-")) return "targetSelfAssessment";
  return null;
}

function answerRecord(answers, workbookQuestionId) {
  if (!answers || typeof answers !== "object") return {};
  return answers[workbookQuestionId] ?? answers[workbookQuestionId.toLowerCase()] ?? {};
}

export function validateSemanticRegistry() {
  const bindings = scoringAndTriage.dualRespondentComparison?.answerSemanticBindings;
  if (!Array.isArray(bindings) || bindings.length !== 4) {
    configFail("MISSING_SEMANTIC_BINDING", `expected 4 answerSemanticBindings, got ${Array.isArray(bindings) ? bindings.length : "absent"}`);
  }

  const byKey = new Map();
  const byCanonical = new Map();
  for (const binding of bindings) {
    if (!binding || typeof binding !== "object") {
      configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", "binding is not an object");
    }
    const moduleId = text(binding.moduleId);
    const canonicalQuestionId = text(binding.canonicalQuestionId);
    const workbookQuestionId = text(binding.workbookQuestionId);
    if (!AUTHORIZED_MODULE_IDS.includes(moduleId) || !Q9_Q10.includes(workbookQuestionId) || !canonicalQuestionId) {
      configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", `invalid binding identity ${moduleId} ${canonicalQuestionId} ${workbookQuestionId}`);
    }
    if (binding.mappingOwner !== "QUESTIONNAIRE_MODULE" || binding.derivationType !== "MODULE_LOCAL_REFERENCE") {
      configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", `invalid owner/derivation for ${moduleId} ${workbookQuestionId}`);
    }
    if (Object.hasOwn(binding, "options") || Object.hasOwn(binding, "environmentSignals") || Object.hasOwn(binding, "primaryEnvSignal")) {
      configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", `binding copied option semantics for ${moduleId} ${workbookQuestionId}`);
    }
    const key = `${moduleId}|${workbookQuestionId}`;
    if (byKey.has(key)) configFail("DUPLICATE_SEMANTIC_BINDING", `duplicate ${key}`);
    const previousCanonical = byCanonical.get(canonicalQuestionId);
    if (previousCanonical && previousCanonical !== key) {
      configFail("AMBIGUOUS_CANONICAL_BINDING", `canonical ${canonicalQuestionId} maps to ${previousCanonical} and ${key}`);
    }
    const family = moduleFamilyFromCanonical(canonicalQuestionId);
    if (family !== moduleId) {
      configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", `canonical family mismatch ${moduleId} ${canonicalQuestionId}`);
    }
    const expectedIdentity = AUTHORIZED_BINDING_KEYS.find(
      (row) => row.moduleId === moduleId && row.workbookQuestionId === workbookQuestionId,
    );
    if (!expectedIdentity || expectedIdentity.canonicalQuestionId !== canonicalQuestionId) {
      configFail("UNSUPPORTED_CANONICAL_BINDING", `${moduleId} ${canonicalQuestionId} ${workbookQuestionId}`);
    }
    const material = reconstructBindingMaterial(moduleId, workbookQuestionId);
    if (!material) configFail("MISSING_SEMANTIC_BINDING", `questionnaire missing ${key}`);
    const computed = computeBindingDigest(material);
    const expected = EXPECTED_DIGESTS[key];
    if (SUPERSEDED_DIGESTS.includes(computed.digest) || SUPERSEDED_DIGESTS.includes(text(binding.mappingDigest))) {
      configFail("SEMANTIC_BINDING_DIGEST_MISMATCH", `superseded digest for ${key}`);
    }
    if (!expected || computed.digest !== expected.digest || computed.bytes !== expected.bytes) {
      configFail("SEMANTIC_BINDING_DIGEST_MISMATCH", `recomputed ${computed.digest} bytes=${computed.bytes} for ${key}`);
    }
    if (text(binding.mappingDigest) !== computed.digest) {
      configFail("SEMANTIC_BINDING_DIGEST_MISMATCH", `stored ${binding.mappingDigest} !== ${computed.digest} for ${key}`);
    }
    byKey.set(key, Object.freeze({ ...binding, material, digest: computed }));
    byCanonical.set(canonicalQuestionId, key);
  }

  for (const identity of AUTHORIZED_BINDING_KEYS) {
    const key = `${identity.moduleId}|${identity.workbookQuestionId}`;
    if (!byKey.has(key)) configFail("MISSING_SEMANTIC_BINDING", `missing ${key}`);
  }

  const answerMap = scoringAndTriage.dualRespondentComparison?.answerEnvironmentMap ?? [];
  if (answerMap.some((row) => Q9_Q10.includes(text(row.q)))) {
    configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", "active generic Dual Q9/Q10 answerEnvironmentMap rows remain");
  }

  return Object.freeze({
    byKey,
    byCanonical,
  });
}

function registry() {
  return validateSemanticRegistry();
}

export function resolveDualQuestionSemantic({
  moduleId,
  canonicalQuestionId,
  workbookQuestionId,
  selectedOption,
  respondentSlot = null,
} = {}) {
  const identity = {
    respondentSlot,
    moduleId,
    canonicalQuestionId,
    workbookQuestionId,
    selectedOption,
  };
  const localModule = text(moduleId);
  const localWorkbook = text(workbookQuestionId);
  const localCanonical = text(canonicalQuestionId);
  const localOption = text(selectedOption);

  if (!localModule && !localCanonical) {
    inputFail("MISSING_SEMANTIC_IDENTITY", identity, "bare Q9/Q10 is not a global semantic identity");
  }
  if (!localModule) {
    inputFail("MISSING_SEMANTIC_IDENTITY", identity, "moduleId is required");
  }
  if (!AUTHORIZED_MODULE_IDS.includes(localModule)) {
    inputFail("UNSUPPORTED_SEMANTIC_MODULE", identity, localModule);
  }
  if (!Q9_Q10.includes(localWorkbook)) {
    inputFail("MISSING_SEMANTIC_IDENTITY", identity, "workbookQuestionId must be Q9 or Q10");
  }

  const validated = registry();
  const key = `${localModule}|${localWorkbook}`;
  const binding = validated.byKey.get(key);
  if (!binding) inputFail("MISSING_SEMANTIC_BINDING", identity, key);

  const derivedCanonical = binding.material.canonicalQuestionId;
  if (localCanonical) {
    const suppliedFamily = moduleFamilyFromCanonical(localCanonical);
    if (!validated.byCanonical.has(localCanonical) && suppliedFamily == null) {
      inputFail("UNSUPPORTED_CANONICAL_BINDING", identity, localCanonical);
    }
    if (suppliedFamily && suppliedFamily !== localModule) {
      inputFail("CANONICAL_QUESTION_MODULE_MISMATCH", identity, `${localModule} vs ${localCanonical}`);
    }
    if (localCanonical !== derivedCanonical) {
      if (suppliedFamily === localModule) {
        inputFail("WORKBOOK_QUESTION_ID_MISMATCH", identity, `${localCanonical} vs ${localWorkbook}`);
      }
      inputFail("CANONICAL_QUESTION_MODULE_MISMATCH", identity, `${localModule} vs ${localCanonical}`);
    }
  }

  const option = binding.material.options.find((row) => row.selectedOption === localOption);
  if (!option) {
    inputFail("UNKNOWN_SELECTED_OPTION", identity, localOption || "<empty>");
  }

  const q9B = localWorkbook === "Q9" && localOption === "B";
  if (q9B && option.environmentSignals.includes("NT/STJ")) {
    configFail("SEMANTIC_REGISTRY_CONFIGURATION_ERROR", "active Q9-B contains unsupported NT/STJ", identity);
  }

  return Object.freeze({
    status: "PASS",
    moduleId: localModule,
    canonicalQuestionId: derivedCanonical,
    workbookQuestionId: localWorkbook,
    selectedOption: localOption,
    optionText: option.optionText,
    environmentSignals: Object.freeze([...option.environmentSignals]),
    primaryEnvironmentSignal: option.environmentSignals[0] ?? null,
    secondaryEnvironmentSignal: option.environmentSignals[1] ?? null,
    excludedFromPrimaryScoring: option.excludedFromPrimaryScoring,
    semanticClass: option.semanticClass,
    mappingOwner: binding.mappingOwner,
    derivationType: binding.derivationType,
    mappingDigest: binding.digest.digest,
    sourceWorkbook: binding.sourceWorkbook ?? null,
    sourceSheet: binding.sourceSheet ?? null,
    sourceRows: binding.sourceRows ?? null,
    sourceVersion: binding.sourceVersion ?? null,
  });
}

function explicitModuleFamily(value) {
  const moduleId = text(value);
  return AUTHORIZED_MODULE_IDS.includes(moduleId) ? moduleId : "";
}

export function assertPreDualSemanticIntegrity(input = {}) {
  const validated = registry();
  const invocationModule = text(input.moduleId);
  const identity = {
    respondentSlot: null,
    moduleId: input.moduleId,
    canonicalQuestionId: null,
    workbookQuestionId: null,
    selectedOption: null,
  };

  if (!invocationModule) {
    inputFail("MISSING_SEMANTIC_IDENTITY", identity, "invocation moduleId is required");
  }
  if (!AUTHORIZED_MODULE_IDS.includes(invocationModule)) {
    inputFail("UNSUPPORTED_SEMANTIC_MODULE", identity, invocationModule);
  }

  const r1Family = explicitModuleFamily(input.respondent1?.moduleId);
  const r2Family = explicitModuleFamily(input.respondent2?.moduleId);
  if (r1Family && r2Family && r1Family !== r2Family) {
    inputFail("SAME_MODULE_INVARIANT_VIOLATION", {
      ...identity,
      moduleId: `${r1Family}|${r2Family}`,
    }, "R1 and R2 resolve to different module families");
  }
  for (const [slot, family] of [["R1", r1Family], ["R2", r2Family]]) {
    if (family && family !== invocationModule) {
      inputFail("SAME_MODULE_INVARIANT_VIOLATION", {
        respondentSlot: slot,
        moduleId: family,
        canonicalQuestionId: null,
        workbookQuestionId: null,
        selectedOption: null,
      }, `${slot} module family ${family} !== ${invocationModule}`);
    }
  }

  const resolvedModules = [];
  for (const slot of RESPONDENT_SLOTS) {
    const answers = slot === "R1" ? input.answers1 : input.answers2;
    const respondent = slot === "R1" ? input.respondent1 : input.respondent2;
    for (const workbookQuestionId of Q9_Q10) {
      const raw = answerRecord(answers, workbookQuestionId);
      const tupleModule = explicitModuleFamily(raw.moduleId) || explicitModuleFamily(respondent?.moduleId) || invocationModule;
      const resolved = resolveDualQuestionSemantic({
        moduleId: tupleModule,
        canonicalQuestionId: raw.canonicalQuestionId,
        workbookQuestionId,
        selectedOption: raw.selectedOption ?? raw.option,
        respondentSlot: slot,
      });
      resolvedModules.push(resolved.moduleId);
    }
  }

  const unique = [...new Set(resolvedModules)];
  if (unique.length !== 1 || unique[0] !== invocationModule) {
    inputFail("SAME_MODULE_INVARIANT_VIOLATION", identity, `resolved ${unique.join("|")}`);
  }

  return Object.freeze({
    status: "PASS",
    boundary: PRE_DUAL_SEMANTIC_INTEGRITY,
    moduleId: invocationModule,
    registry: validated,
  });
}
