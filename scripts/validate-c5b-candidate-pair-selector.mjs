import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { RUNTIME_CORE_COMMIT } from "../src/agent/agentContractConstants.js";
import { buildCorpusIdentity, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { canonicalSerialize, sha256PrefixedDigest } from "../src/agent/canonicalDigest.js";
import {
  RESPONDENT_ROLE_OPTIONS,
  RESPONDENT_SENIORITY_OPTIONS,
  attachAcquirerModuleResult,
} from "../src/flow/acquirerTrackFlow.js";
import {
  PAIR5_CANDIDATE_PAIR,
  REACHABLE_CANDIDATE_PAIRS,
  SELECTOR_ID,
  SELECTOR_QUESTION_UNIVERSE,
  SELECTOR_VERSION,
  SOURCE_MODULE,
  VALID_PAIR_WHITELIST,
  assertSelectorConfiguration,
  selectCandidatePair,
} from "../src/flow/candidatePairSelector.js";
import { buildDualRespondentCorpusConfig } from "../src/flow/dualRespondentComparison.js";
import {
  DualSemanticIntegrityError,
  computeBindingDigest,
  reconstructBindingMaterial,
  resolveDualQuestionSemantic,
} from "../src/flow/dualQuestionSemanticResolver.js";
import { resolveObservationScope } from "../src/flow/observationScopeResolver.js";
import { resolveCanonicalRespondentContext } from "../src/flow/respondentContextBridge.js";
import { evidenceClassifiedAnswer } from "../src/flow/evidenceClassification.js";
import questionnaires from "../src/generated/newlogic/questionnaires.json" with { type: "json" };
import scoringAndTriage from "../src/generated/newlogic/scoringAndTriage.json" with { type: "json" };
import sourceManifest from "../src/generated/newlogic/sourceManifest.json" with { type: "json" };

const SELECTOR_SOURCE = readFileSync(new URL("../src/flow/candidatePairSelector.js", import.meta.url), "utf8");
const PACKAGE_JSON = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const AEM = questionnaires.modules.find((row) => row.id === "acquirerEnvironment");
const CORPUS_CONFIG = buildDualRespondentCorpusConfig(scoringAndTriage.dualRespondentComparison);
const PRODUCTION_PAIRS = CORPUS_CONFIG.productionPairs;
const ENVIRONMENT_CODES = Object.keys(sourceManifest.environmentAliases ?? {});
const CORR2 = Object.freeze({
  "acquirerEnvironment|Q9": "sha256:8f9c36125ab2f6c5d59e0d29c5651aac8c918d213e7455b6dd0e17215a07c833",
  "acquirerEnvironment|Q10": "sha256:13dd709ddb265aa747b48a59ba4d3cba8ac2cb4b4e47ca816c240a2e78a31d46",
});
const FORBIDDEN_RESOURCE_TOKENS = [
  "RESOURCE_PRIORITY_MATRIX",
  "buildResourceConflictProfile",
  "Net Effect",
  "Pair Resource Intelligence",
  "Master Resource Database",
  "Environment FA Model",
];
const AGENT_PROJECTION_KEYS = [
  "freeInterpretationMode",
  "providerProjection",
  "publicAlias",
  "interpretationContextPack",
  "agentInterpretation",
  "semanticJudge",
];
const checks = [];
const evidence = {};

function check(id, label, fn) {
  checks.push({ id, label, fn });
}

function aemQuestion(wid) {
  return (AEM.questions ?? []).find((row) => row.workbookQuestionId === wid);
}

function aemSignals(wid, optionValue) {
  const option = (aemQuestion(wid)?.options ?? []).find((row) => row.value === optionValue);
  return [...new Set(option?.internalEnvironmentSignals ?? [])].sort();
}

function answer(option, overrides = {}) {
  return {
    selectedOption: option,
    directObservationGate: "yes",
    evidenceType: "direct_observation",
    reliabilityFlags: [],
    ...overrides,
  };
}

function fillAnswers(overrides = {}, extra = {}) {
  const out = {};
  for (const wid of SELECTOR_QUESTION_UNIVERSE) {
    out[wid] = answer("E", overrides[wid] ?? {});
  }
  return { ...out, ...extra };
}

function sessionFrom({
  sessionId = "c5b-selector-r1",
  respondentSide = "acquirer",
  respondentSeniority = "c_suite_founder",
  respondentRole = "deal_lead",
  answers = fillAnswers(),
  completed = true,
  extraSession = {},
  extraAcquirer = {},
  extraDeal = {},
} = {}) {
  const dealData = {
    respondentSide,
    ...(respondentSeniority === null ? {} : { respondentSeniority }),
    ...(respondentRole === null ? {} : { respondentRole }),
    ...extraDeal,
  };
  return {
    sessionId,
    dealContext: { completed: true, data: dealData },
    acquirer2A: {
      completed,
      answers,
      ...extraAcquirer,
    },
    ...extraSession,
  };
}

function select(session, extraInput = {}) {
  return selectCandidatePair({ session, ...extraInput });
}

function independentOracle(session) {
  const data = session.dealContext?.data ?? {};
  const canonical = resolveCanonicalRespondentContext({
    respondentSeniority: data.respondentSeniority,
    respondentRole: data.respondentRole,
  });
  const respondent = {
    roleCode: canonical.roleCode ?? data.respondentRole ?? null,
    seniorityLevel: canonical.canonicalSeniorityLevel ?? "",
  };
  const positive = new Set();
  const contributions = [];
  let unresolved = null;
  for (const wid of ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"]) {
    const raw = session.acquirer2A.answers[wid];
    const selectedOption = raw?.selectedOption ?? raw?.option ?? raw?.value ?? raw;
    let signals;
    if (wid === "Q9" || wid === "Q10") {
      const resolved = resolveDualQuestionSemantic({
        moduleId: "acquirerEnvironment",
        workbookQuestionId: wid,
        canonicalQuestionId: raw?.canonicalQuestionId,
        selectedOption,
        respondentSlot: "R1",
      });
      signals = [...resolved.environmentSignals].sort();
    } else {
      signals = aemSignals(wid, selectedOption);
    }
    const scope = resolveObservationScope({
      moduleId: "acquirerEnvironment",
      workbookQuestionId: wid,
      selectedOption,
      respondent,
      directObservationGate: raw?.directObservationGate,
      evidenceType: raw?.evidenceType,
      reliabilityFlags: raw?.reliabilityFlags ?? [],
    });
    const admissible = signals.length > 0
      && scope.useClass === "PRIMARY"
      && scope.comparisonAvailability === "available";
    contributions.push({ wid, selectedOption, signals, admissible, useClass: scope.useClass, comparisonAvailability: scope.comparisonAvailability });
    if (scope.useClass === "UNRESOLVED" && unresolved == null) {
      unresolved = scope.audit?.unresolvedReason ?? null;
    }
    if (admissible && unresolved == null) {
      for (const code of signals) positive.add(code);
    }
  }
  if (unresolved !== undefined && contributions.some((row) => row.useClass === "UNRESOLVED")) {
    return { status: "ADMISSIBILITY_UNRESOLVED", unresolvedReason: unresolved, positive: [], matched: [] };
  }
  const reachable = [
    "NT/STJ vs NT/STP",
    "SFJ/SFP vs SFP/SFJ",
    "STJ/STP vs NT/STJ",
    "NF/SFJ vs NF/NT",
  ];
  const matched = reachable.filter((pair) => {
    const [a, b] = pair.split(/\s+vs\s+/i);
    return positive.has(a) && positive.has(b);
  });
  return {
    status: matched.length === 1 ? "SELECTED" : matched.length === 0 ? "NO_LAWFUL_PAIR" : "PAIR_SELECTION_AMBIGUOUS",
    candidatePair: matched.length === 1 ? matched[0] : null,
    positive: [...positive].sort(),
    matched,
  };
}

function digestOf(value) {
  return sha256PrefixedDigest(canonicalSerialize(value));
}

function extractBalanced(source, openIndex) {
  if (source[openIndex] !== "{") throw new Error("expected {");
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, index + 1);
    }
  }
  throw new Error("unbalanced brace block");
}

function extractFunctionSource(source, functionName) {
  const exportNeedle = `export function ${functionName}(`;
  const localNeedle = `function ${functionName}(`;
  let start = source.indexOf(exportNeedle);
  if (start < 0) start = source.indexOf(localNeedle);
  if (start < 0) throw new Error(`missing function ${functionName}`);
  const paren = source.indexOf("(", start);
  let depth = 0;
  let index = paren;
  for (; index < source.length; index += 1) {
    if (source[index] === "(") depth += 1;
    else if (source[index] === ")") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const brace = source.indexOf("{", index);
  if (brace < 0) throw new Error(`missing body for ${functionName}`);
  return source.slice(start, brace) + extractBalanced(source, brace);
}

function extractQ9Q10IfBlocks(fnSource) {
  const blocks = [];
  const needle = "Q9_Q10.includes";
  let from = 0;
  while (true) {
    const idx = fnSource.indexOf(needle, from);
    if (idx < 0) break;
    const brace = fnSource.indexOf("{", idx);
    if (brace < 0) break;
    blocks.push(extractBalanced(fnSource, brace));
    from = idx + needle.length;
  }
  return blocks;
}

function assertModuleAwareResolverCall(block, label) {
  const calls = [...block.matchAll(/resolveDualQuestionSemantic\(\s*\{([\s\S]*?)\}\s*\)/g)].map((row) => row[1]);
  assert.ok(calls.length > 0, `${label} must call resolveDualQuestionSemantic`);
  for (const args of calls) {
    assert.match(args, /moduleId:\s*(SOURCE_MODULE|"acquirerEnvironment")/, `${label} moduleId`);
    assert.match(args, /respondentSlot:\s*(RESPONDENT_SLOT|"R1")/, `${label} respondentSlot`);
    assert.match(args, /workbookQuestionId/, `${label} workbookQuestionId`);
    assert.match(args, /selectedOption/, `${label} selectedOption`);
    assert.equal(args.includes("primaryEnvironmentSignal"), false, `${label} primaryEnvironmentSignal`);
    assert.equal(args.includes("secondaryEnvironmentSignal"), false, `${label} secondaryEnvironmentSignal`);
  }
  assert.equal(block.includes("lookupQuestionOptionSemantics"), false, `${label} lookupQuestionOptionSemantics bypass`);
  assert.equal(block.includes("internalEnvironmentSignals"), false, `${label} internalEnvironmentSignals bypass`);
  assert.equal(block.includes("optionSignals("), false, `${label} optionSignals bypass`);
  assert.ok(block.includes(".environmentSignals"), `${label} must consume environmentSignals`);
  assert.equal(block.includes(".primaryEnvironmentSignal"), false, `${label} primary field`);
  assert.equal(block.includes(".secondaryEnvironmentSignal"), false, `${label} secondary field`);
}

function resolveAemQ9Q10(workbookQuestionId, selectedOption) {
  return resolveDualQuestionSemantic({
    moduleId: "acquirerEnvironment",
    workbookQuestionId,
    selectedOption,
    respondentSlot: "R1",
  });
}

check("S-01", "reachable set exact 4 + corpus whitelist membership", () => {
  const expected = [
    "NT/STJ vs NT/STP",
    "SFJ/SFP vs SFP/SFJ",
    "STJ/STP vs NT/STJ",
    "NF/SFJ vs NF/NT",
  ];
  assert.deepEqual([...REACHABLE_CANDIDATE_PAIRS], expected);
  assert.equal(REACHABLE_CANDIDATE_PAIRS.length, 4);
  assert.equal(VALID_PAIR_WHITELIST.length, 5);
  assert.ok(VALID_PAIR_WHITELIST.includes(PAIR5_CANDIDATE_PAIR));
  const productionNormalized = PRODUCTION_PAIRS.map((pair) => normalizeCandidatePair(pair));
  for (const pair of expected) {
    assert.ok(
      productionNormalized.includes(normalizeCandidatePair(pair)),
      `${pair} must exist in corpus productionPairs`,
    );
  }
  assert.ok(productionNormalized.includes(normalizeCandidatePair(PAIR5_CANDIDATE_PAIR)));
  assert.equal(new Set(productionNormalized).size, 5);
  evidence.s01 = { reachable: expected, productionPairs: PRODUCTION_PAIRS };
});

check("S-02", "pair #5 unreachable / NF-SFP impossible via Q1-Q10", () => {
  assert.equal(REACHABLE_CANDIDATE_PAIRS.includes(PAIR5_CANDIDATE_PAIR), false);
  const nfSfpFromSelectorUniverse = [];
  for (const wid of ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]) {
    for (const option of aemQuestion(wid).options ?? []) {
      if ((option.internalEnvironmentSignals ?? []).includes("NF/SFP")) {
        nfSfpFromSelectorUniverse.push(`${wid}-${option.value}`);
      }
    }
  }
  for (const wid of ["Q9", "Q10"]) {
    for (const option of aemQuestion(wid).options ?? []) {
      const resolved = resolveAemQ9Q10(wid, option.value);
      if ((resolved.environmentSignals ?? []).includes("NF/SFP")) {
        nfSfpFromSelectorUniverse.push(`${wid}-${option.value}`);
      }
    }
  }
  assert.deepEqual(nfSfpFromSelectorUniverse, []);
  const q11c = aemSignals("Q11", "C");
  assert.deepEqual(q11c, ["NF/SFP"]);
  evidence.s02 = { nfSfpFromSelectorUniverse, q11c };
});

check("S-03", "Q11 invariance + score non-dependency", () => {
  const baseAnswers = fillAnswers({
    Q4: answer("A"),
    Q7: answer("B"),
  });
  const base = sessionFrom({ answers: { ...baseAnswers, Q11: answer("A") } });
  const withC = sessionFrom({
    answers: { ...baseAnswers, Q11: answer("C") },
    extraAcquirer: { score: { total: 99, environments: ["NF/SFP"] } },
  });
  const left = select(base);
  const right = select(withC);
  assert.equal(left.status, "SELECTED");
  assert.equal(left.candidatePair, "NT/STJ vs NT/STP");
  assert.equal(right.status, left.status);
  assert.equal(right.candidatePair, left.candidatePair);
  assert.deepEqual(right.audit.positiveEnvironmentSet, left.audit.positiveEnvironmentSet);
  assert.equal(SELECTOR_SOURCE.includes("acquirer2A.score"), false);
  assert.equal(/answers\.Q11|answers\["Q11"\]/.test(SELECTOR_SOURCE), false);
});

check("S-04", "Q9/Q10 module-local resolver + no unnamespaced bypass", () => {
  assert.equal(SELECTOR_SOURCE.includes("assertPreDualSemanticIntegrity"), false);
  assert.equal(SELECTOR_SOURCE.includes("primaryEnvironmentSignal"), false);
  assert.equal(SELECTOR_SOURCE.includes("secondaryEnvironmentSignal"), false);
  assert.equal(/lookupQuestionOptionSemantics\(\s*["']Q9["']/.test(SELECTOR_SOURCE), false);
  assert.equal(/lookupQuestionOptionSemantics\(\s*["']Q10["']/.test(SELECTOR_SOURCE), false);

  const assertFn = extractFunctionSource(SELECTOR_SOURCE, "assertSelectorConfiguration");
  const selectFn = extractFunctionSource(SELECTOR_SOURCE, "selectCandidatePair");
  const assertQ9Blocks = extractQ9Q10IfBlocks(assertFn);
  const selectQ9Blocks = extractQ9Q10IfBlocks(selectFn);
  assert.ok(assertQ9Blocks.length >= 1, "assertSelectorConfiguration must exclusive-branch Q9/Q10");
  assert.ok(selectQ9Blocks.length >= 1, "selectCandidatePair must exclusive-branch Q9/Q10");
  for (const block of assertQ9Blocks) assertModuleAwareResolverCall(block, "assertSelectorConfiguration Q9/Q10");
  for (const block of selectQ9Blocks) assertModuleAwareResolverCall(block, "selectCandidatePair Q9/Q10");

  const lookupInAssert = [...assertFn.matchAll(/lookupQuestionOptionSemantics\s*\(/g)];
  assert.ok(lookupInAssert.length > 0, "Q1-Q8 Dual lookup remains for non-Q9/Q10");
  for (const match of lookupInAssert) {
    const inQ9Block = assertQ9Blocks.some((block) => {
      const start = assertFn.indexOf(block);
      const at = match.index;
      return at >= start && at < start + block.length;
    });
    assert.equal(inQ9Block, false, "lookupQuestionOptionSemantics must not sit in the Q9/Q10 config branch");
  }

  const universeLoop = assertFn.indexOf("SELECTOR_QUESTION_UNIVERSE");
  const firstLookup = assertFn.indexOf("lookupQuestionOptionSemantics");
  const firstQ9Guard = assertFn.indexOf("Q9_Q10.includes");
  assert.ok(universeLoop >= 0 && firstQ9Guard >= 0 && firstLookup >= 0);
  assert.ok(firstQ9Guard < firstLookup, "Q9/Q10 module-aware branch must precede any unnamespaced lookup in config");

  for (const [key, digest] of Object.entries(CORR2)) {
    const [moduleId, workbookQuestionId] = key.split("|");
    const computed = computeBindingDigest(reconstructBindingMaterial(moduleId, workbookQuestionId));
    assert.equal(computed.digest, digest);
  }

  const result = select(sessionFrom({
    answers: fillAnswers({ Q9: answer("D") }),
  }));
  const digests = result.provenance.semanticBindings.map((row) => `${row.workbookQuestionId}:${row.mappingDigest}`);
  assert.ok(digests.includes(`Q9:${CORR2["acquirerEnvironment|Q9"]}`));
  assert.ok(digests.includes(`Q10:${CORR2["acquirerEnvironment|Q10"]}`));
  for (const row of result.provenance.semanticBindings) {
    assert.equal(row.moduleId, "acquirerEnvironment");
    assert.equal(["Q9", "Q10"].includes(row.workbookQuestionId), true);
  }

  const q9 = resolveAemQ9Q10("Q9", "D");
  assert.deepEqual([...q9.environmentSignals].sort(), ["NF/NT", "NF/SFJ"]);
  const q9Contribution = result.audit.contributions.find((row) => row.workbookQuestionId === "Q9");
  assert.deepEqual([...q9Contribution.signals].sort(), [...q9.environmentSignals].sort());

  for (const wid of ["Q9", "Q10"]) {
    for (const option of aemQuestion(wid).options ?? []) {
      const resolved = resolveAemQ9Q10(wid, option.value);
      assert.equal(resolved.excludedFromPrimaryScoring === true, (resolved.environmentSignals ?? []).length === 0);
      if (resolved.semanticClass && resolved.semanticClass !== "SUBSTANTIVE_SIGNAL") {
        assert.equal((resolved.environmentSignals ?? []).length, 0);
      }
    }
  }
});

check("S-05", "SINGLE signal", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A") }) }));
  const q4 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q4");
  assert.deepEqual([...q4.signals], ["NT/STJ"]);
  assert.equal(q4.admissible, true);
  assert.deepEqual(result.audit.positiveEnvironmentSet, ["NT/STJ"]);
  assert.equal(result.status, "NO_LAWFUL_PAIR");
});

check("S-06", "SHARED all-codes contribution", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q9: answer("D") }) }));
  const q9 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q9");
  assert.deepEqual([...q9.signals].sort(), ["NF/NT", "NF/SFJ"]);
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NF/SFJ vs NF/NT");
});

check("S-07", "duplicate signal no-op", () => {
  const once = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }) }));
  const twice = select(sessionFrom({ answers: fillAnswers({ Q2: answer("A"), Q4: answer("A"), Q7: answer("B") }) }));
  assert.deepEqual(once.audit.positiveEnvironmentSet, twice.audit.positiveEnvironmentSet);
  assert.equal(once.status, "SELECTED");
  assert.equal(twice.status, "SELECTED");
  assert.equal(once.candidatePair, twice.candidatePair);
});

check("S-08", "all four unique pair cases", () => {
  const cases = [
    ["A", fillAnswers({ Q4: answer("A"), Q7: answer("B") }), "NT/STJ vs NT/STP"],
    ["B", fillAnswers({ Q3: answer("B") }), "SFJ/SFP vs SFP/SFJ"],
    ["C", fillAnswers({ Q1: answer("C"), Q2: answer("A") }), "STJ/STP vs NT/STJ"],
    ["D", fillAnswers({ Q9: answer("D") }), "NF/SFJ vs NF/NT"],
  ];
  for (const [id, answers, pair] of cases) {
    const result = select(sessionFrom({ answers }));
    assert.equal(result.status, "SELECTED", id);
    assert.equal(result.candidatePair, pair, id);
    assert.equal(result.candidatePairNormalized, normalizeCandidatePair(pair), id);
    const oracle = independentOracle(sessionFrom({ answers }));
    assert.equal(oracle.status, "SELECTED", id);
    assert.equal(oracle.candidatePair, pair, id);
  }
});

check("S-09", "zero match", () => {
  const result = select(sessionFrom({ answers: fillAnswers() }));
  assert.equal(result.status, "NO_LAWFUL_PAIR");
  assert.equal(result.candidatePair, null);
  assert.equal(result.candidatePairNormalized, null);
  assert.deepEqual(result.audit.matchedPairs, []);
});

check("S-10", "multi-match ambiguity", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({ Q3: answer("B"), Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "PAIR_SELECTION_AMBIGUOUS");
  assert.equal(result.candidatePair, null);
  assert.ok(result.audit.matchedPairs.length > 1);
  assert.ok(result.audit.matchedPairs.includes("NT/STJ vs NT/STP"));
  assert.ok(result.audit.matchedPairs.includes("SFJ/SFP vs SFP/SFJ"));
});

check("S-11", "exact A1B three-condition gate", () => {
  assert.ok(SELECTOR_SOURCE.includes('useClass === "PRIMARY"'));
  assert.ok(SELECTOR_SOURCE.includes('comparisonAvailability === "available"'));
  assert.ok(SELECTOR_SOURCE.includes("signals.length > 0"));
  const result = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }) }));
  for (const row of result.audit.contributions) {
    const expected = row.signals.length > 0 && row.useClass === "PRIMARY" && row.comparisonAvailability === "available";
    assert.equal(row.admissible, expected, row.workbookQuestionId);
  }
});

check("S-12", "CONTEXTUAL excluded / no stop", () => {
  const result = select(sessionFrom({
    respondentSeniority: "manager_functional_lead",
    answers: fillAnswers({ Q1: answer("A"), Q4: answer("A"), Q7: answer("B") }),
  }));
  const q1 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q1");
  assert.equal(q1.useClass, "CONTEXTUAL");
  assert.equal(q1.admissible, false);
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
  assert.equal(result.audit.positiveEnvironmentSet.includes("NF/NT"), false);
});

check("S-13", "INELIGIBLE excluded / no stop", () => {
  const result = select(sessionFrom({
    respondentSeniority: "manager_functional_lead",
    answers: fillAnswers({ Q2: answer("A"), Q4: answer("A"), Q7: answer("B") }),
  }));
  const q2 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q2");
  assert.equal(q2.useClass, "INELIGIBLE");
  assert.equal(q2.admissible, false);
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
});

check("S-14", "UNRESOLVED early outcome distinct from NO_LAWFUL_PAIR", () => {
  const unresolved = select(sessionFrom({
    respondentSeniority: "external_advisor",
    answers: fillAnswers(),
  }));
  const zero = select(sessionFrom({ answers: fillAnswers() }));
  assert.equal(unresolved.status, "ADMISSIBILITY_UNRESOLVED");
  assert.equal(unresolved.candidatePair, null);
  assert.equal(unresolved.candidatePairNormalized, null);
  assert.equal(unresolved.routing, "practitioner_access_review");
  assert.equal(Object.hasOwn(unresolved, "unresolvedReason"), true);
  assert.equal(Object.hasOwn(unresolved.audit, "matchedPairs"), false);
  assert.equal(zero.status, "NO_LAWFUL_PAIR");
  assert.equal(zero.routing, null);
  assert.equal(Object.hasOwn(zero, "unresolvedReason"), false);
  assert.notEqual(unresolved.status, zero.status);
});

check("S-15", "PRIMARY + unavailable excluded", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { evidenceType: "unknown" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "PRIMARY");
  assert.equal(q7.comparisonAvailability, "unavailable");
  assert.equal(q7.admissible, false);
  assert.equal(result.status, "NO_LAWFUL_PAIR");
});

check("S-16", "inference alone does not demote", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { evidenceType: "inference" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "PRIMARY");
  assert.equal(q7.comparisonAvailability, "available");
  assert.equal(q7.admissible, true);
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
});

check("S-17", "no weighting / score / C4 / resource dependency", () => {
  for (const token of FORBIDDEN_RESOURCE_TOKENS) {
    assert.equal(SELECTOR_SOURCE.includes(token), false, token);
  }
  assert.equal(SELECTOR_SOURCE.includes("layeredEvidenceScoring"), false);
  assert.equal(SELECTOR_SOURCE.includes("firmTenure"), false);
  assert.equal(SELECTOR_SOURCE.includes("weight"), false);
  assert.equal(SELECTOR_SOURCE.includes("validate-c4"), false);
  assert.ok(!/from ["'].*resource/i.test(SELECTOR_SOURCE));
});

check("S-18", "same option + different vantage changes admissibility, not semantic meaning", () => {
  const answers = fillAnswers({ Q2: answer("A") });
  const senior = select(sessionFrom({ respondentSeniority: "c_suite_founder", answers }));
  const line = select(sessionFrom({ respondentSeniority: "manager_functional_lead", answers }));
  const q2s = senior.audit.contributions.find((row) => row.workbookQuestionId === "Q2");
  const q2l = line.audit.contributions.find((row) => row.workbookQuestionId === "Q2");
  assert.deepEqual([...q2s.signals], [...q2l.signals]);
  assert.deepEqual([...q2s.signals], ["NT/STJ"]);
  assert.equal(q2s.useClass, "PRIMARY");
  assert.equal(q2s.admissible, true);
  assert.equal(q2l.useClass, "INELIGIBLE");
  assert.equal(q2l.admissible, false);
});

check("S-19", "R2/target/Agent/report independence", () => {
  const answers = fillAnswers({ Q4: answer("A"), Q7: answer("B") });
  const clean = select(sessionFrom({ answers }));
  const noisy = select(sessionFrom({
    answers,
    extraSession: {
      acquirerVerification: { completed: true, answers: fillAnswers({ Q4: answer("B"), Q7: answer("A") }) },
      target2C: { completed: true },
      agent: { verdict: "NF/SFP vs NF/SFJ" },
      report: { candidatePair: "NF/SFP vs NF/SFJ" },
    },
    extraAcquirer: { score: { total: 12 } },
    extraDeal: { respondentAccessLevel: "external_advisor_access", firmTenure: "less_than_18_months" },
  }));
  assert.equal(clean.status, noisy.status);
  assert.equal(clean.candidatePair, noisy.candidatePair);
  assert.deepEqual(clean.audit.positiveEnvironmentSet, noisy.audit.positiveEnvironmentSet);
  assert.equal(SELECTOR_SOURCE.includes("respondentAccessLevel"), false);
});

check("S-20", "key/property permutation + history independence", () => {
  const answers = {};
  for (const wid of [...SELECTOR_QUESTION_UNIVERSE].reverse()) {
    answers[wid] = wid === "Q4" ? answer("A") : wid === "Q7" ? answer("B") : answer("E");
  }
  const left = select(sessionFrom({ answers }));
  const right = select(sessionFrom({
    answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }),
    extraSession: { history: [{ candidatePair: PAIR5_CANDIDATE_PAIR }], previousCandidatePair: PAIR5_CANDIDATE_PAIR },
  }));
  assert.equal(left.status, right.status);
  assert.equal(left.candidatePair, right.candidatePair);
  assert.deepEqual(left.audit.positiveEnvironmentSet, right.audit.positiveEnvironmentSet);
});

check("S-21", "malformed Q9/Q10 identity fail-close", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q9: answer("D", { canonicalQuestionId: "TARGETSELFASSESSMENT-Q9" }),
    }),
  }));
  assert.equal(result.status, "INPUT_INVALID");
  assert.equal(result.decisionCode, "CANONICAL_QUESTION_MODULE_MISMATCH");
  assert.equal(result.candidatePair, null);
  assert.notEqual(result.status, "NO_LAWFUL_PAIR");
});

check("S-22", "corpus/config integrity fail-close", () => {
  const config = assertSelectorConfiguration();
  assert.equal(config.ok, true);
  for (const wid of ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]) {
    for (const option of aemQuestion(wid).options ?? []) {
      const signals = option.internalEnvironmentSignals ?? [];
      assert.equal(option.excludedFromPrimaryScoring === true, signals.length === 0, `${wid}-${option.value}`);
      const semantic = (scoringAndTriage.dualRespondentComparison.questionOptionSemantics ?? [])
        .find((row) => row.questionref === wid && row.optioncode === option.value)?.semanticclass;
      if (semantic && semantic !== "SUBSTANTIVE_SIGNAL") {
        assert.equal(signals.length, 0, `${wid}-${option.value} ${semantic}`);
      }
      for (const code of signals) {
        assert.ok(ENVIRONMENT_CODES.includes(code), code);
      }
    }
  }
  for (const wid of ["Q9", "Q10"]) {
    for (const option of aemQuestion(wid).options ?? []) {
      const resolved = resolveAemQ9Q10(wid, option.value);
      const signals = [...(resolved.environmentSignals ?? [])];
      assert.equal(resolved.excludedFromPrimaryScoring === true, signals.length === 0, `${wid}-${option.value}`);
      if (resolved.semanticClass && resolved.semanticClass !== "SUBSTANTIVE_SIGNAL") {
        assert.equal(signals.length, 0, `${wid}-${option.value} ${resolved.semanticClass}`);
      }
      for (const code of signals) {
        assert.ok(ENVIRONMENT_CODES.includes(code), code);
      }
    }
  }
  assert.ok(SELECTOR_SOURCE.includes("OPTION_ELIGIBILITY_CONTRACT_VIOLATION"));
  assert.ok(SELECTOR_SOURCE.includes("UNSUPPORTED_ENVIRONMENT_CODE"));
  assert.ok(SELECTOR_SOURCE.includes("REACHABLE_PAIR_NOT_IN_WHITELIST"));
});

check("S-23", "caller cannot override candidatePair", () => {
  const result = select(
    sessionFrom({ answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }) }),
    { candidatePair: PAIR5_CANDIDATE_PAIR, moduleId: "targetSelfAssessment" },
  );
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
  assert.notEqual(result.candidatePair, PAIR5_CANDIDATE_PAIR);
});

check("S-24", "provenance complete; respondentId absent; selectedAt outside digest", () => {
  const result = select(sessionFrom({
    sessionId: "prov-session-1",
    answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }),
  }));
  const p = result.provenance;
  assert.equal(p.selectorId, SELECTOR_ID);
  assert.equal(p.selectorVersion, SELECTOR_VERSION);
  assert.equal(p.observationScopePolicy, "PRIMARY_AVAILABLE_ONLY@A1B");
  assert.equal(p.sourceModule, SOURCE_MODULE);
  assert.equal(p.sourceInstrument, "ST_Acquirer_Environment_Module.xlsx");
  assert.deepEqual(p.corpus, buildCorpusIdentity());
  assert.equal(p.sessionId, "prov-session-1");
  assert.equal(p.respondentSlot, "R1");
  assert.equal(p.runtime.coreCommit, RUNTIME_CORE_COMMIT);
  assert.equal(p.decisionCode, "SELECTED");
  assert.equal(p.candidatePair, result.candidatePair);
  assert.equal(p.candidatePairNormalized, result.candidatePairNormalized);
  assert.equal(p.respondentVantage.productSeniority, "c_suite_founder");
  assert.equal(p.respondentVantage.canonicalSeniorityLevel, "c_suite");
  assert.equal(p.respondentVantage.canonicalSeniorityTier, "senior");
  assert.equal(p.respondentVantage.roleCode, "deal_lead");
  assert.equal(Object.hasOwn(p, "respondentId"), false);
  assert.equal(Object.hasOwn(result, "respondentId"), false);
  assert.equal(Object.hasOwn(p, "selectedAt"), false);
  const withClock = { ...p, selectedAt: "2026-08-27T00:00:00.000Z" };
  assert.notEqual(digestOf(p), digestOf(withClock));
  const again = select(sessionFrom({
    sessionId: "prov-session-1",
    answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(digestOf(result.provenance), digestOf(again.provenance));
});

check("S-25", "Engine audit does not cross Agent projection boundary", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }) }));
  const blob = JSON.stringify(result);
  for (const key of AGENT_PROJECTION_KEYS) {
    assert.equal(blob.includes(key), false, key);
    assert.equal(Object.hasOwn(result, key), false, key);
    assert.equal(Object.hasOwn(result.audit, key), false, key);
  }
  for (const row of result.audit.contributions) {
    assert.ok(Object.hasOwn(row, "workbookQuestionId"));
    assert.ok(Object.hasOwn(row, "selectedOption"));
    assert.ok(Object.hasOwn(row, "signals"));
    assert.ok(Object.hasOwn(row, "admissible"));
    assert.ok(Object.hasOwn(row, "useClass"));
    assert.ok(Object.hasOwn(row, "comparisonAvailability"));
    assert.ok(Object.hasOwn(row, "tierDefaultUseClass"));
    assert.ok(Object.hasOwn(row, "matchedAccessRuleIds"));
  }
  assert.equal(Object.hasOwn(result, "positiveEnvironmentSet"), false);
  assert.equal(Object.hasOwn(result, "matchedPairs"), false);
});

check("S-26", "deterministic recomputation", () => {
  const session = sessionFrom({ answers: fillAnswers({ Q3: answer("B") }) });
  const a = select(session);
  const b = select(session);
  assert.equal(digestOf({
    status: a.status,
    candidatePair: a.candidatePair,
    provenance: a.provenance,
    audit: a.audit,
  }), digestOf({
    status: b.status,
    candidatePair: b.candidatePair,
    provenance: b.provenance,
    audit: b.audit,
  }));
});

check("S-27", "current-corpus partial-UNRESOLVED invariant", () => {
  const rows = (scoringAndTriage.dualRespondentComparison.questionTierVantage ?? [])
    .filter((row) => SELECTOR_QUESTION_UNIVERSE.includes(row.questionref));
  const byTier = new Map();
  for (const row of rows) {
    const list = byTier.get(row.senioritytier) ?? [];
    list.push(row);
    byTier.set(row.senioritytier, list);
  }
  for (const [tier, list] of byTier) {
    const unresolved = list.filter((row) => row.defaultuseclass === "UNRESOLVED");
    const mixed = unresolved.length > 0 && unresolved.length !== list.length;
    assert.equal(mixed, false, `partial UNRESOLVED at tier ${tier}`);
    if (tier === "external") {
      assert.equal(unresolved.length, list.length);
    } else {
      assert.equal(unresolved.length, 0, tier);
    }
  }
  const lawfulSeniorities = RESPONDENT_SENIORITY_OPTIONS
    .map((option) => option.value)
    .filter((value) => value !== "external_advisor");
  for (const seniority of lawfulSeniorities) {
    const result = select(sessionFrom({
      respondentSeniority: seniority,
      answers: fillAnswers({ Q4: answer("A") }),
    }));
    assert.notEqual(result.status, "ADMISSIBILITY_UNRESOLVED", seniority);
    const unresolved = result.audit.contributions.filter((row) => row.useClass === "UNRESOLVED");
    assert.equal(unresolved.length, 0, seniority);
  }
});

check("VEC-A", "Pair1 unique", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }) }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
});

check("VEC-B", "Pair2 unique", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q3: answer("B") }) }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "SFJ/SFP vs SFP/SFJ");
});

check("VEC-C", "Pair3 unique", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q1: answer("C"), Q2: answer("A") }) }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "STJ/STP vs NT/STJ");
});

check("VEC-D", "Pair4 unique", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q9: answer("D") }) }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NF/SFJ vs NF/NT");
});

check("VEC-E", "line_level INELIGIBLE Q2 removes pair", () => {
  const answers = fillAnswers({ Q2: answer("A"), Q4: answer("B") });
  const senior = select(sessionFrom({ answers }));
  const line = select(sessionFrom({ respondentSeniority: "manager_functional_lead", answers }));
  assert.equal(senior.status, "SELECTED");
  assert.equal(senior.candidatePair, "NT/STJ vs NT/STP");
  assert.equal(line.status, "NO_LAWFUL_PAIR");
  const q2 = line.audit.contributions.find((row) => row.workbookQuestionId === "Q2");
  assert.equal(q2.useClass, "INELIGIBLE");
});

check("VEC-F", "CONTEXTUAL removed but remaining PRIMARY selects Pair1", () => {
  const result = select(sessionFrom({
    respondentSeniority: "manager_functional_lead",
    answers: fillAnswers({ Q1: answer("A"), Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
  const q1 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q1");
  assert.equal(q1.useClass, "CONTEXTUAL");
  assert.equal(q1.admissible, false);
});

check("VEC-G", "external → ADMISSIBILITY_UNRESOLVED / reason null", () => {
  const result = select(sessionFrom({
    respondentSeniority: "external_advisor",
    answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "ADMISSIBILITY_UNRESOLVED");
  assert.equal(result.unresolvedReason, null);
  assert.equal(result.routing, "practitioner_access_review");
  assert.equal(Object.hasOwn(result.audit, "matchedPairs"), false);
});

check("VEC-H", "missing seniority → ADMISSIBILITY_UNRESOLVED / unknown_seniority", () => {
  const result = select(sessionFrom({
    respondentSeniority: null,
    answers: fillAnswers({ Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "ADMISSIBILITY_UNRESOLVED");
  assert.equal(result.unresolvedReason, "unknown_seniority");
  assert.equal(result.routing, "practitioner_access_review");
  assert.notEqual(result.status, "NO_LAWFUL_PAIR");
  assert.notEqual(result.status, "INPUT_INVALID");
});

check("VEC-I", "hypothetical → CONTEXTUAL → excluded", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { evidenceType: "hypothetical" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "CONTEXTUAL");
  assert.equal(q7.admissible, false);
  assert.equal(result.status, "NO_LAWFUL_PAIR");
});

check("VEC-J", "inference stays PRIMARY", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { evidenceType: "inference" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "PRIMARY");
  assert.equal(q7.admissible, true);
  assert.equal(result.status, "SELECTED");
});

check("VEC-K", "PRIMARY + unavailable → excluded", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { evidenceType: "unknown" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "PRIMARY");
  assert.equal(q7.comparisonAvailability, "unavailable");
  assert.equal(q7.admissible, false);
  assert.equal(result.status, "NO_LAWFUL_PAIR");
});

check("VEC-L", "PRIMARY pair survives alongside INELIGIBLE", () => {
  const result = select(sessionFrom({
    respondentSeniority: "manager_functional_lead",
    answers: fillAnswers({ Q2: answer("A"), Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
  const q2 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q2");
  assert.equal(q2.useClass, "INELIGIBLE");
});

check("VEC-M", "gate=no makes signal CONTEXTUAL and excludes it", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q4: answer("A"),
      Q7: answer("B", { directObservationGate: "no" }),
    }),
  }));
  const q7 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q7");
  assert.equal(q7.useClass, "CONTEXTUAL");
  assert.ok(q7.matchedAccessRuleIds.includes("DIRECT_OBSERVATION_GATE_NO_SUBSTANTIVE_OPTION"));
  assert.equal(q7.admissible, false);
  assert.equal(result.status, "NO_LAWFUL_PAIR");
});

check("VEC-N", "partial UNRESOLVED current-corpus unreachable", () => {
  const vantage = scoringAndTriage.dualRespondentComparison.questionTierVantage
    .filter((row) => ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"].includes(row.questionref));
  const seniorUnresolved = vantage.filter((row) => row.senioritytier === "senior" && row.defaultuseclass === "UNRESOLVED");
  const lineUnresolved = vantage.filter((row) => row.senioritytier === "line_level" && row.defaultuseclass === "UNRESOLVED");
  assert.deepEqual(seniorUnresolved, []);
  assert.deepEqual(lineUnresolved, []);
});

check("VEC-O", "zero pair", () => {
  const result = select(sessionFrom({ answers: fillAnswers({ Q4: answer("A") }) }));
  assert.equal(result.status, "NO_LAWFUL_PAIR");
  assert.equal(result.candidatePair, null);
});

check("VEC-P", "multi-pair ambiguity", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({ Q3: answer("B"), Q4: answer("A"), Q7: answer("B") }),
  }));
  assert.equal(result.status, "PAIR_SELECTION_AMBIGUOUS");
  assert.equal(result.candidatePair, null);
});

check("VEC-Q", "module-local Q9 SHARED alone selects Pair4", () => {
  const dualQ9D = (scoringAndTriage.dualRespondentComparison.answerEnvironmentMap ?? [])
    .find((row) => row.q === "Q9" && (row.option === "D" || row.optioncode === "D"));
  const result = select(sessionFrom({ answers: fillAnswers({ Q9: answer("D") }) }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NF/SFJ vs NF/NT");
  const q9 = result.audit.contributions.find((row) => row.workbookQuestionId === "Q9");
  assert.deepEqual([...q9.signals].sort(), ["NF/NT", "NF/SFJ"]);
  if (dualQ9D) {
    const dualSignals = String(dualQ9D.env ?? dualQ9D.environment ?? "")
      .split(/[·,]/)
      .map((part) => part.trim())
      .filter(Boolean);
    assert.equal(dualSignals.includes("NF/NT") && dualSignals.includes("NF/SFJ"), false);
  }
});

check("VEC-R", "Q11-C alone cannot produce pair5", () => {
  const none = select(sessionFrom({ answers: { ...fillAnswers(), Q11: answer("C") } }));
  assert.equal(none.status, "NO_LAWFUL_PAIR");
  assert.equal((none.audit.positiveEnvironmentSet ?? []).includes("NF/SFP"), false);
  const withSfj = select(sessionFrom({ answers: { ...fillAnswers({ Q8: answer("D") }), Q11: answer("C") } }));
  assert.notEqual(withSfj.candidatePair, PAIR5_CANDIDATE_PAIR);
  assert.equal((withSfj.audit.positiveEnvironmentSet ?? []).includes("NF/SFP"), false);
  assert.equal(withSfj.status, "NO_LAWFUL_PAIR");
});

check("VEC-S", "wrong Q9 canonical module → fail-close", () => {
  const result = select(sessionFrom({
    answers: fillAnswers({
      Q9: answer("D", { canonicalQuestionId: "TARGETSELFASSESSMENT-Q9" }),
    }),
  }));
  assert.equal(result.status, "INPUT_INVALID");
  assert.equal(result.decisionCode, "CANONICAL_QUESTION_MODULE_MISMATCH");
  assert.ok(result instanceof Object);
  assert.doesNotThrow(() => DualSemanticIntegrityError);
});

check("INPUT-B", "fail-close input family does not degrade to NO_LAWFUL_PAIR", () => {
  const cases = [
    [selectCandidatePair({}), "R1_ABSENT"],
    [select(sessionFrom({ completed: false })), "R1_INCOMPLETE"],
    [select(sessionFrom({ extraAcquirer: { answers: ["A"] }, answers: undefined })), "R1_ANSWERS_MALFORMED"],
    [select(sessionFrom({ sessionId: "R1" })), "MALFORMED_SESSION_IDENTITY"],
    [select(sessionFrom({ respondentSide: "target" })), "UNSUPPORTED_MODULE"],
    [select(sessionFrom({ respondentSeniority: "c_suite" })), "INVALID_RESPONDENT_SENIORITY"],
    [select(sessionFrom({ respondentRole: "not_a_role" })), "INVALID_RESPONDENT_ROLE"],
    [select(sessionFrom({ answers: fillAnswers({ Q4: answer("Z") }) })), "UNKNOWN_SELECTED_OPTION"],
  ];
  const malformedAnswers = sessionFrom();
  malformedAnswers.acquirer2A.answers = ["A"];
  cases[2] = [select(malformedAnswers), "R1_ANSWERS_MALFORMED"];
  for (const [result, code] of cases) {
    assert.equal(result.status, "INPUT_INVALID", code);
    assert.equal(result.decisionCode, code);
    assert.notEqual(result.status, "NO_LAWFUL_PAIR", code);
  }
});

check("PKG", "package.json exposes validate:c5b-candidate-pair-selector", () => {
  assert.equal(
    PACKAGE_JSON.scripts["validate:c5b-candidate-pair-selector"],
    "node scripts/validate-c5b-candidate-pair-selector.mjs",
  );
});

check("PROD-SHAPE", "production writer session is readable", () => {
  const answers = Object.fromEntries(
    (AEM.questions ?? []).map((question) => {
      const option = question.workbookQuestionId === "Q4" ? "A"
        : question.workbookQuestionId === "Q7" ? "B"
          : question.workbookQuestionId === "Q11" ? "F"
            : "E";
      return [question.workbookQuestionId, evidenceClassifiedAnswer(option)];
    }),
  );
  const written = attachAcquirerModuleResult({
    sessionId: "writer-session",
    dealContext: {
      completed: true,
      data: {
        respondentSide: "acquirer",
        respondentSeniority: "c_suite_founder",
        respondentRole: "deal_lead",
      },
    },
  }, answers, "2026-08-27T12:00:00.000Z");
  const result = select(written.session);
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
});

check("ALIAS", "option/value aliases are accepted production shape", () => {
  const answers = fillAnswers();
  answers.Q4 = { option: "A", directObservationGate: "yes", evidenceType: "direct_observation", reliabilityFlags: [] };
  answers.Q7 = { value: "B", directObservationGate: "yes", evidenceType: "direct_observation", reliabilityFlags: [] };
  const result = select(sessionFrom({ answers }));
  assert.equal(result.status, "SELECTED");
  assert.equal(result.candidatePair, "NT/STJ vs NT/STP");
});

const failed = [];
for (const item of checks) {
  try {
    item.fn();
    console.log(`PASS ${item.id} ${item.label}`);
  } catch (error) {
    failed.push({ id: item.id, label: item.label, error });
    console.log(`FAIL ${item.id} ${item.label}`);
    console.log(String(error?.stack ?? error));
  }
}

console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) {
  process.exitCode = 1;
}
