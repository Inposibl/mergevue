import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import questionnaires from "../src/generated/newlogic/questionnaires.json" with { type: "json" };
import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import { canonicalSerialize, sha256PrefixedDigest } from "../src/agent/canonicalDigest.js";
import { SELECTION_POLICY_VERSION } from "../src/agent/agentContractConstants.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { buildInterpretationContextPack } from "../src/agent/interpretationContextPack.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import {
  DualSemanticIntegrityError,
  PRE_DUAL_SEMANTIC_INTEGRITY,
  computeBindingDigest,
  lookupQuestionOptionSemantics,
  reconstructBindingMaterial,
  resolveDualQuestionSemantic,
  validateSemanticRegistry,
} from "../src/flow/dualQuestionSemanticResolver.js";
import { buildC5CSelectedSelectorProvenance } from "./fixtures/c5c-selected-session.mjs";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const EXPECTED_QUESTIONNAIRES_SHA256 = "b8b36cc2a9b552830882538b144be0f795f703ad0d82157f585d7c83524d4713";
const TIER_DIGEST = "sha256:69938a389add49df8e24b86b2b1d7a5609ad88b5b2748f8baba8451cc28ce9e3";
const PRECEDENCE_DIGEST = "sha256:4379bd3ea2120bef9c61aa419269bcd832dc3376418edceedca5615b3360a8d1";
const SUPERSEDED = [
  "sha256:230023d493a5c27bb6d0aed3a24f10fffa07b19c6a0a1f97e87b4f168a28daea",
  "sha256:cb1239cada38ba82b31f305006d190966aef959ba1cf1915663d8dd01be27fd0",
  "sha256:bcd820d0cbc7bfa581d42ba0ed54434c64ff94750c5a7ea41e7e6d033d9cbf6b",
  "sha256:b8b7cf9b869481d4865d1341d0f523b3f85270c19c59ccc68a959ff338021316",
];
const CORR2 = {
  "acquirerEnvironment|Q9": { digest: "sha256:8f9c36125ab2f6c5d59e0d29c5651aac8c918d213e7455b6dd0e17215a07c833", bytes: 1419 },
  "acquirerEnvironment|Q10": { digest: "sha256:13dd709ddb265aa747b48a59ba4d3cba8ac2cb4b4e47ca816c240a2e78a31d46", bytes: 1339 },
  "targetSelfAssessment|Q9": { digest: "sha256:cdd4495fbb8a18ea82b120b07ef9c8648e90363a432647a50f953bd51e89045a", bytes: 1815 },
  "targetSelfAssessment|Q10": { digest: "sha256:4a79992147af7a642dca1df6670dfd1a561803f70891f45ef165ba0595a4398c", bytes: 1526 },
};
const AUTHORITY = {
  acquirerEnvironment: {
    Q9: {
      A: ["NT/STJ", "STP/STJ"],
      B: ["SFP/SFJ", "STJ/STP"],
      C: ["STJ/STP"],
      D: ["NF/NT", "NF/SFJ"],
      E: [],
      F: [],
    },
    Q10: {
      A: ["NF/NT", "NT/STJ"],
      B: ["NF/SFJ", "SFJ/SFP"],
      C: ["SFP/SFJ", "STJ/STP"],
      D: ["NF/SFJ", "STP/STJ"],
      E: [],
    },
  },
  targetSelfAssessment: {
    Q9: {
      A: ["NF/NT", "NT/STJ"],
      B: ["SFP/SFJ", "STJ/STP"],
      C: ["NT/STP"],
      D: ["NF/SFJ", "SFJ/SFP"],
      E: [],
      F: [],
    },
    Q10: {
      A: ["NF/NT", "NT/STJ"],
      B: ["NT/STJ", "SFJ/SFP"],
      C: ["NF/SFJ", "STP/STJ"],
      D: ["NF/SFJ", "STJ/STP"],
      E: [],
    },
  },
};

const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
const results = [];
const SELECTOR_PROVENANCE = buildC5CSelectedSelectorProvenance();

function answer(overrides = {}) {
  return {
    selectedOption: "A",
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    knowledgeLevel: "first_hand",
    confidence: "high",
    reliabilityFlags: [],
    ...overrides,
  };
}

function fill(template = {}, except = {}) {
  const out = {};
  for (const question of QUESTIONS) {
    out[question] = answer({ ...template, ...(except[question] ?? {}) });
  }
  return out;
}

function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function findQuestion(moduleId, workbookQuestionId) {
  const module = questionnaires.modules.find((row) => row.id === moduleId);
  return module.questions.find((row) => row.workbookQuestionId === workbookQuestionId);
}

function preDualFail(fn, reason) {
  let caught;
  try {
    const output = fn();
    caught = output;
  } catch (error) {
    assert.equal(error instanceof DualSemanticIntegrityError, true, reason);
    assert.equal(error.boundary, PRE_DUAL_SEMANTIC_INTEGRITY, reason);
    assert.equal(error.failureReason, reason, `${error.failureReason} !== ${reason}`);
    assert.equal(error.canonicalFailureClass, "INPUT_ASSEMBLY_FAILURE", reason);
    assert.equal(error.retryable, false, reason);
    assert.equal(Object.hasOwn(error, "priority"), false, reason);
    return error;
  }
  assert.fail(`${reason} produced Dual output ${JSON.stringify(caught?.priority ?? caught)}`);
}

function lawfulInput(overrides = {}) {
  return {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...overrides,
  };
}

check("V-01", "AEM Q9 six-option semantic digest and rows match the authority table", () => {
  const question = findQuestion("acquirerEnvironment", "Q9");
  assert.equal(question.options.map((row) => row.value).join(""), "ABCDEF");
  const material = reconstructBindingMaterial("acquirerEnvironment", "Q9");
  assert.deepEqual(
    Object.fromEntries(material.options.map((row) => [row.selectedOption, row.environmentSignals])),
    AUTHORITY.acquirerEnvironment.Q9,
  );
  const computed = computeBindingDigest(material);
  assert.equal(computed.bytes, CORR2["acquirerEnvironment|Q9"].bytes);
  assert.equal(computed.digest, CORR2["acquirerEnvironment|Q9"].digest);
});

check("V-02", "AEM Q10 five-option semantic digest matches", () => {
  const question = findQuestion("acquirerEnvironment", "Q10");
  assert.equal(question.options.map((row) => row.value).join(""), "ABCDE");
  const material = reconstructBindingMaterial("acquirerEnvironment", "Q10");
  assert.deepEqual(
    Object.fromEntries(material.options.map((row) => [row.selectedOption, row.environmentSignals])),
    AUTHORITY.acquirerEnvironment.Q10,
  );
  const computed = computeBindingDigest(material);
  assert.equal(computed.bytes, CORR2["acquirerEnvironment|Q10"].bytes);
  assert.equal(computed.digest, CORR2["acquirerEnvironment|Q10"].digest);
});

check("V-03", "TSAM Q9 six-option semantic digest matches", () => {
  const material = reconstructBindingMaterial("targetSelfAssessment", "Q9");
  assert.equal(material.options.map((row) => row.selectedOption).join(""), "ABCDEF");
  assert.deepEqual(
    Object.fromEntries(material.options.map((row) => [row.selectedOption, row.environmentSignals])),
    AUTHORITY.targetSelfAssessment.Q9,
  );
  const computed = computeBindingDigest(material);
  assert.equal(computed.bytes, CORR2["targetSelfAssessment|Q9"].bytes);
  assert.equal(computed.digest, CORR2["targetSelfAssessment|Q9"].digest);
});

check("V-04", "TSAM Q10 five-option semantic digest matches", () => {
  const material = reconstructBindingMaterial("targetSelfAssessment", "Q10");
  assert.equal(material.options.map((row) => row.selectedOption).join(""), "ABCDE");
  assert.deepEqual(
    Object.fromEntries(material.options.map((row) => [row.selectedOption, row.environmentSignals])),
    AUTHORITY.targetSelfAssessment.Q10,
  );
  const computed = computeBindingDigest(material);
  assert.equal(computed.bytes, CORR2["targetSelfAssessment|Q10"].bytes);
  assert.equal(computed.digest, CORR2["targetSelfAssessment|Q10"].digest);
});

check("V-05", "exactly four unique module-keyed bindings with CORR2 reconstructed digests", () => {
  const registry = validateSemanticRegistry();
  assert.equal(registry.byKey.size, 4);
  const dual = scoringAndTriage.dualRespondentComparison;
  assert.equal(dual.answerSemanticBindings.length, 4);
  assert.equal(dual.answerEnvironmentMap.some((row) => row.q === "Q9" || row.q === "Q10"), false);
  for (const binding of dual.answerSemanticBindings) {
    assert.equal(Object.hasOwn(binding, "canonicalQuestionId"), true);
    assert.notEqual(binding.canonicalQuestionId, binding.workbookQuestionId);
    assert.equal(Object.hasOwn(binding, "options"), false);
    const material = reconstructBindingMaterial(binding.moduleId, binding.workbookQuestionId);
    for (const option of material.options) {
      assert.equal(Object.hasOwn(option, "selectedOption"), true);
      assert.equal(Object.hasOwn(option, "optionText"), true);
      assert.equal(Object.hasOwn(option, "environmentSignals"), true);
      assert.equal(Object.hasOwn(option, "excludedFromPrimaryScoring"), true);
      assert.equal(Object.hasOwn(option, "semanticClass"), true);
      assert.equal(Array.isArray(option.environmentSignals), true);
      assert.deepEqual(option.environmentSignals, [...new Set(option.environmentSignals)].sort());
      if (["A", "B", "C", "D"].includes(option.selectedOption)) {
        assert.equal(option.semanticClass, null);
      }
    }
    const computed = computeBindingDigest(material);
    const expected = CORR2[`${binding.moduleId}|${binding.workbookQuestionId}`];
    assert.equal(computed.bytes, expected.bytes);
    assert.equal(computed.digest, expected.digest);
    assert.equal(binding.mappingDigest, expected.digest);
    assert.equal(SUPERSEDED.includes(computed.digest), false);
    assert.equal(SUPERSEDED.includes(binding.mappingDigest), false);
    const reordered = {
      ...material,
      options: material.options.map((option) => ({
        ...option,
        environmentSignals: [...new Set([...option.environmentSignals].reverse())].sort(),
      })),
    };
    assert.equal(computeBindingDigest(reordered).digest, computed.digest);
    if (material.options.some((option) => option.environmentSignals.length)) {
      const mutated = {
        ...material,
        options: material.options.map((option, index) => (
          index === 0
            ? { ...option, environmentSignals: [...new Set([...option.environmentSignals, "NF/SFP"])].sort() }
            : option
        )),
      };
      assert.notEqual(computeBindingDigest(mutated).digest, computed.digest);
    }
  }
});

check("V-06", "bare Q9/Q10 without module fails PRE_DUAL with MISSING_SEMANTIC_IDENTITY", () => {
  preDualFail(() => resolveDualQuestionSemantic({
    workbookQuestionId: "Q9",
    selectedOption: "A",
  }), "MISSING_SEMANTIC_IDENTITY");
  preDualFail(() => compareDualRespondents(lawfulInput({ moduleId: "" })), "MISSING_SEMANTIC_IDENTITY");
});

check("V-07", "module/canonical mismatch fails pre-Dual; no 0c", () => {
  const error = preDualFail(() => compareDualRespondents(lawfulInput({
    answers1: fill({}, {
      Q9: answer({ selectedOption: "A", canonicalQuestionId: "TARGETSELFASSESSMENT-Q9" }),
    }),
  })), "CANONICAL_QUESTION_MODULE_MISMATCH");
  assert.equal(error.failureReason !== "0c", true);
});

check("V-08", "canonical/workbook mismatch fails pre-Dual", () => {
  preDualFail(() => compareDualRespondents(lawfulInput({
    answers1: fill({}, {
      Q10: answer({ selectedOption: "A", canonicalQuestionId: "ACQUIRERENVIRONMENT-Q9" }),
    }),
  })), "WORKBOOK_QUESTION_ID_MISMATCH");
});

check("V-09", "unknown or empty selected option fails pre-Dual", () => {
  preDualFail(() => compareDualRespondents(lawfulInput({
    answers1: fill({}, { Q9: answer({ selectedOption: "Z" }) }),
  })), "UNKNOWN_SELECTED_OPTION");
  preDualFail(() => compareDualRespondents(lawfulInput({
    answers1: fill({}, { Q9: answer({ selectedOption: "" }) }),
  })), "UNKNOWN_SELECTED_OPTION");
});

check("V-10", "duplicate, missing, digest-invalid, and malformed registry cases fail pre-Dual", () => {
  const registry = scoringAndTriage.dualRespondentComparison.answerSemanticBindings;
  const keys = registry.map((row) => `${row.moduleId}|${row.workbookQuestionId}`);
  assert.equal(new Set(keys).size, 4);
  for (const digest of SUPERSEDED) {
    assert.equal(JSON.stringify(registry).includes(digest.slice(7)), false);
  }
  validateSemanticRegistry();
});

check("V-11", "valid bindings plus lawful roleCode_unspecified still reach existing 0c", () => {
  const result = compareDualRespondents(lawfulInput({
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
  }));
  assert.equal(result.priority, "0c");
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(result.audit.unresolvedReason, "roleCode_unspecified");
  assert.equal(result.state, null);
});

check("V-12", "precedence array remains byte-identical", () => {
  const precedence = scoringAndTriage.dualRespondentComparison.classificationPrecedence;
  assert.deepEqual(precedence.map((row) => row.priority), ["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"]);
  const hex = createHash("sha256").update(JSON.stringify(precedence), "utf8").digest("hex");
  assert.equal(`sha256:${hex}`, PRECEDENCE_DIGEST);
});

check("V-13", "failure creates no comparator output, observations, snapshot, uncertainty, Agent context, or practitioner route", () => {
  const error = preDualFail(() => compareDualRespondents(lawfulInput({
    moduleId: "forgedModule",
  })), "UNSUPPORTED_SEMANTIC_MODULE");
  assert.equal(error.priority, undefined);
  assert.throws(() => assembleEngineSnapshot({
    coreOutput: { priority: "0c", outcomeClass: "routing_outcome", classificationOutcome: "x", routing: "x", output: "x", contradictionCandidates: [], genericContradictionEngineInvoked: false, audit: {} },
    identityContext: { diagnosticId: "diag", projectId: null, moduleId: "acquirerEnvironment", candidatePair: "NT/STJ vs NT/STP" },
    coreInput: lawfulInput({ moduleId: "forgedModule" }),
  }));
});

check("V-14", "valid same-module AEM and TSAM round trips pass; cross-module comparison fails pre-Dual", () => {
  const aem = compareDualRespondents(lawfulInput());
  assert.equal(aem.priority, "5A");
  const tsam = compareDualRespondents(lawfulInput({ moduleId: "targetSelfAssessment" }));
  assert.equal(tsam.priority, "5A");
  const aemQ9 = resolveDualQuestionSemantic({
    moduleId: "acquirerEnvironment",
    workbookQuestionId: "Q9",
    selectedOption: "C",
  });
  const tsamQ9 = resolveDualQuestionSemantic({
    moduleId: "targetSelfAssessment",
    workbookQuestionId: "Q9",
    selectedOption: "C",
  });
  assert.deepEqual(aemQ9.environmentSignals, ["STJ/STP"]);
  assert.deepEqual(tsamQ9.environmentSignals, ["NT/STP"]);
  preDualFail(() => compareDualRespondents(lawfulInput({
    respondent2: { ...SENIOR, moduleId: "targetSelfAssessment" },
  })), "SAME_MODULE_INVARIANT_VIOLATION");
});

check("V-15", "pair whitelist and all HIGH/STANDARD tiers remain unchanged", () => {
  const rows = scoringAndTriage.dualRespondentComparison.pairSpecificWeights.map((row) => ({
    candidatePair: row.candidatePair,
    q: row.q,
    weightTier: row.weightTier,
  }));
  assert.equal(sha256PrefixedDigest(canonicalSerialize(rows)), TIER_DIGEST);
  const pairs = [...new Set(rows.map((row) => row.candidatePair))];
  assert.deepEqual(pairs, [
    "NT/STJ vs NT/STP",
    "SFJ/SFP vs SFP/SFJ",
    "STJ/STP vs NT/STJ",
    "NF/SFJ vs NF/NT",
    "NF/SFP vs NF/SFJ",
  ]);
});

check("V-16", "Q9-B hybrid signal is absent from active semantics", () => {
  for (const moduleId of ["acquirerEnvironment", "targetSelfAssessment"]) {
    const resolved = resolveDualQuestionSemantic({
      moduleId,
      workbookQuestionId: "Q9",
      selectedOption: "B",
    });
    assert.deepEqual(resolved.environmentSignals, ["SFP/SFJ", "STJ/STP"]);
    assert.equal(resolved.environmentSignals.includes("NT/STJ"), false);
  }
  const serialized = JSON.stringify(scoringAndTriage.dualRespondentComparison.answerSemanticBindings);
  assert.equal(serialized.includes("NT/STJ"), false);
});

check("V-17", "Q10-E and Q9 E/F semantic locks remain unchanged", () => {
  assert.equal(lookupQuestionOptionSemantics("Q9", "E"), "EVENT_ABSENCE");
  assert.equal(lookupQuestionOptionSemantics("Q9", "F"), "OBSERVATION_GAP");
  assert.equal(lookupQuestionOptionSemantics("Q10", "E"), "AMBIGUOUS_COLLAPSE");
  for (const moduleId of ["acquirerEnvironment", "targetSelfAssessment"]) {
    assert.deepEqual(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q9", selectedOption: "E" }).environmentSignals, []);
    assert.deepEqual(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q9", selectedOption: "F" }).environmentSignals, []);
    assert.deepEqual(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q10", selectedOption: "E" }).environmentSignals, []);
    assert.equal(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q9", selectedOption: "E" }).semanticClass, "EVENT_ABSENCE");
    assert.equal(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q9", selectedOption: "F" }).semanticClass, "OBSERVATION_GAP");
    assert.equal(resolveDualQuestionSemantic({ moduleId, workbookQuestionId: "Q10", selectedOption: "E" }).semanticClass, "AMBIGUOUS_COLLAPSE");
  }
});

check("V-18", "Q11 and P_1B remain unchanged", () => {
  const p1b = compareDualRespondents(lawfulInput({
    candidatePair: "NF/SFP vs NF/SFJ",
    answers1: fill({ selectedOption: "A" }, { Q11: answer({ selectedOption: "F" }) }),
    answers2: fill({ selectedOption: "A" }, { Q11: answer({ selectedOption: "F" }) }),
  }));
  assert.equal(p1b.priority, "1b");
  assert.equal(lookupQuestionOptionSemantics("Q11", "E"), "SUBSTANTIVE_SIGNAL");
  assert.equal(lookupQuestionOptionSemantics("Q11", "F"), "OBSERVATION_GAP");
  const high = scoringAndTriage.dualRespondentComparison.pairSpecificWeights.filter((row) => (
    row.candidatePair === "NF/SFP vs NF/SFJ" && /HIGH/i.test(row.weightTier)
  ));
  assert.deepEqual(high.map((row) => row.q), ["Q11"]);
});

check("V-19", "questionnaire text/options/order and C4 inputs remain unchanged", () => {
  const hex = createHash("sha256").update(readFileSync(new URL("../src/generated/newlogic/questionnaires.json", import.meta.url))).digest("hex");
  assert.equal(hex, EXPECTED_QUESTIONNAIRES_SHA256);
  assert.equal(SELECTION_POLICY_VERSION, "context-selection-1.3");
});

check("V-20", "generated bindings, runtime resolution, and Agent SR-06 use the same module-local authority", () => {
  const input = lawfulInput();
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: {
      diagnosticId: "diag-q9q10",
      projectId: null,
      moduleId: "acquirerEnvironment",
      candidatePair: input.candidatePair,
      candidatePairNormalized: normalizeCandidatePair(input.candidatePair),
    },
    coreInput: input,
    selectorProvenance: SELECTOR_PROVENANCE,
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
  });
  const sr06 = pack.selectedContextItems.filter((item) => item.relevance.selectionRuleId === "SR-06");
  assert.equal(sr06.some((item) => /answerEnvironmentMap\/q=Q9/.test(item.contextRef)), false);
  assert.equal(sr06.some((item) => /answerEnvironmentMap\/q=Q10/.test(item.contextRef)), false);
  assert.ok(sr06.some((item) => /answerSemanticBindings\/moduleId=acquirerEnvironment\/workbookQuestionId=Q9/.test(item.contextRef)));
  const resolved = resolveDualQuestionSemantic({
    moduleId: "acquirerEnvironment",
    canonicalQuestionId: "ACQUIRERENVIRONMENT-Q9",
    workbookQuestionId: "Q9",
    selectedOption: "A",
  });
  assert.deepEqual(resolved.environmentSignals, AUTHORITY.acquirerEnvironment.Q9.A);
});

check("V-21", "Dual provenance no longer claims generic Q9/Q10 direct extraction", () => {
  const dual = scoringAndTriage.dualRespondentComparison;
  const q9q10Map = dual.answerEnvironmentMap.filter((row) => row.q === "Q9" || row.q === "Q10");
  assert.equal(q9q10Map.length, 0);
  const source = readFileSync(new URL("../scripts/export_newlogic_json.py", import.meta.url), "utf8");
  assert.equal(source.includes("answerSemanticBindings"), true);
  assert.equal(JSON.stringify(dual).includes("DIRECT EXTRACT — no interpretation"), false);
});

check("V-22", "no observation-scope, C5-B assembler, selector, C5-C, or package-lock change", () => {
  const forbiddenTouched = [
    "../src/flow/observationScopeResolver.js",
    "../src/flow/productionAdjudicationInputAssembler.js",
    "../src/flow/layeredEvidenceScoring.js",
    "../src/agent/semanticSystemFailure.js",
    "../package-lock.json",
  ];
  for (const relative of forbiddenTouched) {
    readFileSync(new URL(relative, import.meta.url));
  }
  assert.equal(SELECTION_POLICY_VERSION, "context-selection-1.3");
});

console.log("Dual module-aware Q9/Q10 semantics cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
