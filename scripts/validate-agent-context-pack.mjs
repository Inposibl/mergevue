import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  AGENT_CONTRACT_VERSION,
  CONTEXT_DOMAINS,
  CONTEXT_ITEM_KINDS,
  CONTEXT_PACK_SCHEMA_VERSION,
  PACK_SCOPE_VERDICTS,
  SELECTION_POLICY_VERSION,
  SELECTION_RULE_IDS,
  SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES,
  SNAPSHOT_SCHEMA_VERSION,
  SR12_MARKER_IDS,
} from "../src/agent/agentContractConstants.js";
import { assembleEngineSnapshot, normalizeCandidatePair } from "../src/agent/engineSnapshot.js";
import { assemblePreCoreSelectorSnapshot } from "../src/agent/preCoreSelectorSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import {
  buildInterpretationContextPack,
  computePackScopeVerdict,
  ContextPackSelectionError,
} from "../src/agent/interpretationContextPack.js";
import {
  CORPUS_ARTIFACTS,
  SUPERSEDED_RAW_PREDICATES,
  XP1,
  buildTbp1bContent,
  classifyContextRef,
  precedenceRawCondition,
  resolveCorpusMref,
  sr12MarkerText,
} from "../src/agent/contextAuthorityRegistry.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";
import {
  buildC5CPreCoreSelectorProvenance,
  buildC5CSelectedSelectorProvenance,
} from "./fixtures/c5c-selected-session.mjs";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const ROOT_KEYS = Object.freeze([
  "contextPackSchemaVersion",
  "contextPackId",
  "contextPackDigest",
  "selectionPolicyVersion",
  "methodologySourcePackageId",
  "methodologyCorpusDigest",
  "selectionKeys",
  "selectedContextItems",
  "permittedInterpretationDomains",
  "prohibitedExtrapolationMarkers",
  "packScopeVerdict",
]);
const SELECTION_KEY_FIELDS = Object.freeze([
  "moduleId",
  "engineOutcomeCode",
  "questionRefs",
  "semanticClasses",
  "candidatePairNormalized",
  "deterministicState",
  "uncertaintyReasonCodes",
  "establishedEnvironmentCodes",
  "crossSideEnvironmentPair",
]);
const FORBIDDEN_A3_IMPORTS = Object.freeze([
  "src/flow/observationScopeResolver.js",
  "src/flow/dualRespondentComparison.js",
]);

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

const SENIOR = { roleCode: "c_suite", seniorityLevel: "c_suite" };
const LINE = { roleCode: "ic", seniorityLevel: "manager" };

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput, overrides = {}) {
  return {
    diagnosticId: "diag-a3",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    candidatePairNormalized: normalizeCandidatePair(coreInput.candidatePair ?? ""),
    ...overrides,
  };
}

const SELECTOR_BY_PAIR = new Map();

function selectorForPair(candidatePair) {
  if (!SELECTOR_BY_PAIR.has(candidatePair)) {
    SELECTOR_BY_PAIR.set(candidatePair, buildC5CSelectedSelectorProvenance({ candidatePair }));
  }
  return SELECTOR_BY_PAIR.get(candidatePair);
}

function assemblePack(coreInput, packInput = {}) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input),
    coreInput: input,
    selectorProvenance: selectorForPair(input.candidatePair),
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
    ...packInput,
  });
  return { snapshot, uncertainty, pack, coreInput: input };
}

function assemblePrePack(status) {
  const snapshot = assemblePreCoreSelectorSnapshot({
    identityContext: {
      diagnosticId: `diag-pack-${status}`,
      projectId: null,
      moduleId: "acquirerEnvironment",
    },
    selectorProvenance: buildC5CPreCoreSelectorProvenance(status),
  });
  const uncertainty = buildStructuredUncertainty(snapshot);
  const pack = buildInterpretationContextPack({
    engineSnapshot: snapshot,
    structuredUncertainty: uncertainty,
  });
  return { snapshot, uncertainty, pack };
}

const BRANCH_INPUTS = {
  P_0A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_0B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/NT vs STJ/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_0C: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "unspecified", seniorityLevel: "c_suite" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_1: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill({}, {
      Q1: { selectedOption: "E" },
      Q2: { selectedOption: "E" },
      Q3: { selectedOption: "E" },
      Q4: { selectedOption: "E" },
      Q5: { selectedOption: "E" },
      Q7: { selectedOption: "E" },
      Q8: { selectedOption: "E" },
      Q9: { selectedOption: "E" },
    }),
  },
  P_1B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
    answers2: fill({ selectedOption: "A" }, { Q11: { selectedOption: "F" } }),
  },
  P_2: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    outOfPairEvidence: true,
    answers1: fill(),
    answers2: fill(),
  },
  P_3A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "C" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "C" }, { Q11: { selectedOption: "D" } }),
  },
  P_3: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q4: { selectedOption: "B" }, Q7: { selectedOption: "B" } }),
  },
  P_4: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: LINE,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, { Q1: { selectedOption: "B" } }),
  },
  P_5X: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    coherenceAmbiguous: true,
    answers1: fill(),
    answers2: fill(),
  },
  P_5A: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  },
  P_5B: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "A" }, {
      Q2: { selectedOption: "B" },
      Q3: { selectedOption: "B" },
      Q5: { selectedOption: "B" },
      Q6: { selectedOption: "B" },
      Q8: { selectedOption: "B" },
    }),
  },
  UNMATCHED: {
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }),
    answers2: fill({ selectedOption: "B" }, { Q4: { selectedOption: "A" } }),
  },
};

const results = [];
function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function packSerialized(pack) {
  return JSON.stringify(pack);
}

function missingFrictionPair() {
  const lookup = CORPUS_ARTIFACTS.narrativesAndFriction.friction.frictionLookup ?? [];
  const matrix = CORPUS_ARTIFACTS.narrativesAndFriction.friction.ecsMatrix ?? [];
  for (const row of matrix) {
    for (const target of Object.keys(row.targetScores ?? {})) {
      const found = lookup.find((item) => (
        item.acquirerEnvironmentCode === row.acquirerEnvironmentCode
        && item.targetEnvironmentCode === target
      ));
      if (!found) {
        return {
          acquirerEnvironmentCode: row.acquirerEnvironmentCode,
          targetEnvironmentCode: target,
        };
      }
    }
  }
  return {
    acquirerEnvironmentCode: "STP/STJ",
    targetEnvironmentCode: "NF/NT",
  };
}

function assertShape(pack, snapshot) {
  assert.deepEqual(Object.keys(pack), [...ROOT_KEYS]);
  assert.equal(pack.contextPackSchemaVersion, CONTEXT_PACK_SCHEMA_VERSION);
  assert.equal(pack.selectionPolicyVersion, SELECTION_POLICY_VERSION);
  assert.equal(pack.methodologyCorpusDigest, snapshot.identity.corpus.corpusDigest);
  assert.equal(pack.methodologySourcePackageId, snapshot.identity.corpus.sourcePackageId);
  assert.match(pack.contextPackDigest, /^sha256:[0-9a-f]{64}$/);
  assert.match(pack.contextPackId, /^sha256:[0-9a-f]{64}$/);
  assert.deepEqual(Object.keys(pack.selectionKeys), [...SELECTION_KEY_FIELDS]);
  assert.ok(PACK_SCOPE_VERDICTS.includes(pack.packScopeVerdict));
  assert.equal(pack.packScopeVerdict, computePackScopeVerdict(pack.selectedContextItems));
  for (const domain of pack.permittedInterpretationDomains) {
    assert.ok(CONTEXT_DOMAINS.includes(domain), domain);
  }
  for (const item of pack.selectedContextItems) {
    assert.ok(CONTEXT_ITEM_KINDS.includes(item.contextItemKind), item.contextItemKind);
    assert.ok(CONTEXT_DOMAINS.includes(item.contextDomain), item.contextDomain);
    assert.ok(SELECTION_RULE_IDS.includes(item.relevance.selectionRuleId), item.relevance.selectionRuleId);
    assert.equal(item.contextRef.startsWith("mref://"), true);
    assert.equal(item.contextRef.includes("mref://formBindings"), false);
  }
}

function assertFrozen(pack) {
  assert.ok(Object.isFrozen(pack));
  assert.ok(Object.isFrozen(pack.selectionKeys));
  assert.ok(Object.isFrozen(pack.selectedContextItems));
  assert.ok(Object.isFrozen(pack.permittedInterpretationDomains));
  assert.ok(Object.isFrozen(pack.prohibitedExtrapolationMarkers));
  if (pack.selectedContextItems[0]) {
    assert.ok(Object.isFrozen(pack.selectedContextItems[0]));
    assert.ok(Object.isFrozen(pack.selectedContextItems[0].relevance));
  }
  const before = pack.selectedContextItems.length;
  try { pack.selectedContextItems.push({ tamper: true }); } catch { /* frozen */ }
  try { pack.selectionKeys.engineOutcomeCode = "TAMPER"; } catch { /* frozen */ }
  try { pack.permittedInterpretationDomains.push("TAMPER"); } catch { /* frozen */ }
  if (pack.selectedContextItems[0]) {
    try { pack.selectedContextItems[0].relevance.questionRelevance.push("QX"); } catch { /* frozen */ }
  }
  assert.equal(pack.selectedContextItems.length, before);
  assert.notEqual(pack.selectionKeys.engineOutcomeCode, "TAMPER");
}

check("C0", "schema identities are context-pack-1.1 / context-selection-1.3", () => {
  assert.equal(CONTEXT_PACK_SCHEMA_VERSION, "context-pack-1.1");
  assert.equal(SELECTION_POLICY_VERSION, "context-selection-1.3");
  assert.equal(SNAPSHOT_SCHEMA_VERSION, "engine-snapshot-2.0");
  assert.equal(AGENT_CONTRACT_VERSION, "D0_R0_CORR2_A2C1_CORR1_C5C1_PC1_SR1_CN1A_CN1B");
  assert.equal(SELECTION_RULE_IDS.includes("SR-13"), false);
  assert.equal(SUPERSEDED_RAW_PREDICATES.length, 1);
  assert.equal(SUPERSEDED_RAW_PREDICATES[0].id, "SP-1");
});

check("B1", "materially different branches produce lawful packs through A1.1 + A2", () => {
  const required = [...SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES];
  for (const branch of required) {
    const { snapshot, pack, uncertainty } = assemblePack(BRANCH_INPUTS[branch]);
    assert.equal(snapshot.engine.outcome.branchCode, branch, branch);
    assert.equal(uncertainty.originBranch, branch, branch);
    assertShape(pack, snapshot);
    assert.equal(pack.selectionKeys.engineOutcomeCode, branch, branch);
    assert.deepEqual(pack.selectionKeys.establishedEnvironmentCodes, []);
    assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null, branch);
    assert.equal(pack.selectedContextItems.some((item) => item.contextDomain === "FRICTION_AND_RESOURCES"), false, branch);
  }
  assert.deepEqual(required, [...SELECTOR_COMPATIBLE_DUAL_BRANCH_CODES]);
});

check("B2", "all PRE_CORE_SELECTOR outcomes produce engineOutcomeCode-keyed packs", () => {
  for (const [status, outcomeCode] of [
    ["ADMISSIBILITY_UNRESOLVED", "S_ADMISSIBILITY_UNRESOLVED"],
    ["NO_LAWFUL_PAIR", "S_NO_LAWFUL_PAIR"],
    ["PAIR_SELECTION_AMBIGUOUS", "S_PAIR_SELECTION_AMBIGUOUS"],
  ]) {
    const { snapshot, uncertainty, pack } = assemblePrePack(status);
    assert.equal(snapshot.engine.outcome.engineOutcomeCode, outcomeCode);
    assert.equal(uncertainty.originBranch, outcomeCode);
    assert.equal(pack.selectionKeys.engineOutcomeCode, outcomeCode);
    assertShape(pack, snapshot);
  }
});

check("D1", "repeated identical input is byte-identical for keys, items, id, and digest", () => {
  const first = assemblePack(BRANCH_INPUTS.P_5A);
  const second = assemblePack(BRANCH_INPUTS.P_5A);
  assert.deepEqual(second.pack.selectionKeys, first.pack.selectionKeys);
  assert.deepEqual(second.pack.selectedContextItems, first.pack.selectedContextItems);
  assert.equal(second.pack.contextPackId, first.pack.contextPackId);
  assert.equal(second.pack.contextPackDigest, first.pack.contextPackDigest);
  const again = buildInterpretationContextPack({
    engineSnapshot: first.snapshot,
    structuredUncertainty: first.uncertainty,
  });
  assert.deepEqual(again, first.pack);
});

check("I1", "returned pack is deeply immutable", () => {
  const { pack } = assemblePack(BRANCH_INPUTS.P_1);
  assertFrozen(pack);
});

check("CP2", "methodologyCorpusDigest equals snapshot corpus digest", () => {
  const { snapshot, pack } = assemblePack(BRANCH_INPUTS.P_3);
  assert.equal(pack.methodologyCorpusDigest, snapshot.identity.corpus.corpusDigest);
});

check("CP4", "empty selectedContextItems is lawful FACTUAL_EXPLANATION_ONLY and injects no fallback", () => {
  assert.equal(computePackScopeVerdict([]), "FACTUAL_EXPLANATION_ONLY");
  const { pack } = assemblePrePack("NO_LAWFUL_PAIR");
  if (pack.selectedContextItems.length === 0) {
    assert.equal(pack.packScopeVerdict, "FACTUAL_EXPLANATION_ONLY");
  }
  assert.equal(packSerialized(pack).includes("freeTierNarratives"), false);
  assert.equal(pack.selectedContextItems.some((item) => item.contextRef.includes("freeTierNarratives")), false);
});

check("G1", "CORPUS_VERBATIM items resolve to generated corpus with exact content", () => {
  const { pack } = assemblePack(BRANCH_INPUTS.P_5A);
  const verbatim = pack.selectedContextItems.filter((item) => item.contextItemKind === "CORPUS_VERBATIM");
  assert.ok(verbatim.length > 0);
  for (const item of verbatim) {
    const value = resolveCorpusMref(item.contextRef);
    assert.notEqual(value, undefined, item.contextRef);
    const expected = typeof value === "string" ? value : JSON.stringify(value) && item.content;
    assert.equal(typeof item.content, "string");
    if (typeof value === "string") assert.equal(item.content, value, item.contextRef);
  }
});

check("P1B-1", "T-BP-1B canonical replacement remains frozen while P_1B stays outside selector snapshots", () => {
  const expected = buildTbp1bContent({
    oneHighPair: "NF/SFJ vs NF/SFP",
    oneHighDiscriminatorQuestion: "Q11",
  });
  assert.equal(typeof expected, "string");
  assert.equal(SUPERSEDED_RAW_PREDICATES[0].contextItemId, "CI-BOUNDARY-PRED-P_1B");
  const raw = precedenceRawCondition("1b");
  assert.ok(raw);
  assert.equal(expected.includes(raw), false);
  assert.equal(expected.includes("equivalent UseClass unavailability"), false);
});

check("P1B-2", "non-P_1B branches do not emit BOUNDARY_CANONICAL", () => {
  for (const branch of ["P_5A", "P_1", "P_3", "UNMATCHED"]) {
    const { pack } = assemblePack(BRANCH_INPUTS[branch]);
    assert.equal(pack.selectedContextItems.filter((item) => item.contextItemKind === "BOUNDARY_CANONICAL").length, 0, branch);
  }
});

check("FTN", "freeTierNarratives cannot enter the pack", () => {
  for (const branch of ["P_5A", "P_1", "P_4", "P_0C"]) {
    const { pack } = assemblePack(BRANCH_INPUTS[branch]);
    assert.equal(pack.selectedContextItems.some((item) => item.contextRef.includes("freeTierNarratives")), false, branch);
    assert.equal(classifyContextRef("mref://narrativesAndFriction/narratives/freeTierNarratives/0"), "PRESENTATION_ONLY_NOT_AUTHORITY");
  }
});

check("XP1", "sourceRow 9 positive instruction never enters; derivationMethod allowlist is enforced", () => {
  const xp1 = resolveCorpusMref(XP1.mref);
  assert.equal(typeof xp1, "string");
  assert.match(xp1, /reverse-direction/i);
  const { pack } = assemblePack(BRANCH_INPUTS.P_5A);
  assert.equal(packSerialized(pack).includes(xp1), false);
  assert.equal(pack.selectedContextItems.some((item) => /derivationMethod\/sourceRow=9/.test(item.contextRef)), false);
  const dualFriction = assemblePack(BRANCH_INPUTS.P_5A);
  assert.equal(dualFriction.pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === "SR-11"), false);
});

check("SR12", "SR-12 markers appear exactly when the directed pair is absent from frictionLookup", () => {
  const pair = missingFrictionPair();
  const { pack } = assemblePack(BRANCH_INPUTS.P_5A, { crossSideEnvironmentPair: pair });
  assert.equal(pack.selectionKeys.crossSideEnvironmentPair.acquirerEnvironmentCode, pair.acquirerEnvironmentCode);
  const lookupItem = pack.selectedContextItems.find((item) => item.contextRef.includes("/frictionLookup/"));
  assert.equal(lookupItem, undefined);
  assert.equal(pack.prohibitedExtrapolationMarkers.length, 2);
  assert.deepEqual(pack.prohibitedExtrapolationMarkers.map((row) => row.markerId), [...SR12_MARKER_IDS]);
  const directed = `${pair.acquirerEnvironmentCode} → ${pair.targetEnvironmentCode}`;
  assert.equal(pack.prohibitedExtrapolationMarkers[0].text, sr12MarkerText("DIRECT_FRICTION_CONTEXT_UNAVAILABLE", directed));
  assert.equal(pack.prohibitedExtrapolationMarkers[1].text, sr12MarkerText("REVERSE_DIRECTION_EXTRAPOLATION_PROHIBITED", directed));
  const xp1 = resolveCorpusMref(XP1.mref);
  assert.equal(JSON.stringify(pack.prohibitedExtrapolationMarkers).includes(xp1), false);
});

check("FR1", "Dual candidate pair / State① does not unlock cross-side friction", () => {
  const { pack } = assemblePack(BRANCH_INPUTS.P_5A);
  assert.equal(pack.selectionKeys.deterministicState != null, true);
  assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null);
  assert.equal(pack.selectionKeys.establishedEnvironmentCodes.length, 0);
  assert.equal(pack.selectedContextItems.some((item) => item.contextDomain === "FRICTION_AND_RESOURCES"), false);
  assert.equal(pack.prohibitedExtrapolationMarkers.length, 0);
});

check("SR11", "supplied independent cross-side pair can select friction context without Dual inference", () => {
  const pair = {
    acquirerEnvironmentCode: "NF/NT",
    targetEnvironmentCode: "NT/STP",
  };
  const { pack } = assemblePack(BRANCH_INPUTS.P_5A, { crossSideEnvironmentPair: pair });
  assert.ok(pack.selectedContextItems.some((item) => item.contextDomain === "FRICTION_AND_RESOURCES"));
  assert.ok(pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === "SR-11"));
  assert.equal(pack.selectedContextItems.some((item) => /derivationMethod\/sourceRow=9/.test(item.contextRef)), false);
  assert.ok(pack.selectedContextItems.some((item) => /derivationMethod\/sourceRow=5\/cells\/2/.test(item.contextRef)));
});

check("TIER", "TIER_VANTAGE / Dual pair is not treated as established environment identity", () => {
  const { pack } = assemblePack(BRANCH_INPUTS.P_4);
  assert.equal(pack.selectionKeys.establishedEnvironmentCodes.length, 0);
  assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null);
});

check("H1", "excluded corpus paths cannot be selected", () => {
  const excluded = [
    "mref://scoringAndTriage/triage/decisionTree",
    "mref://predictionLedger/agentReadInstructions",
    "mref://reporting/step3Screens",
    "mref://formBindings",
    "mref://narrativesAndFriction/friction/derivationMethod/sourceRow=9/cells/3",
  ];
  for (const ref of excluded) {
    assert.equal(["PRESENTATION_ONLY_NOT_AUTHORITY", "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING", "EXTRAPOLATION_LICENCE_EXCLUDED"].includes(classifyContextRef(ref)), true, ref);
  }
  const { pack } = assemblePack(BRANCH_INPUTS.P_3);
  assert.equal(pack.selectedContextItems.some((item) => item.contextRef.endsWith("/routing")), false);
});

check("SB1", "A3 production modules do not import Runtime Core flow", () => {
  for (const relative of ["../src/agent/interpretationContextPack.js", "../src/agent/contextAuthorityRegistry.js"]) {
    const source = readFileSync(new URL(relative, import.meta.url), "utf8");
    for (const forbidden of FORBIDDEN_A3_IMPORTS) {
      assert.equal(source.includes(forbidden), false, `${relative} ${forbidden}`);
    }
    assert.equal(source.includes("compareDualRespondents"), false, relative);
    assert.equal(source.includes("resolveObservationScope"), false, relative);
  }
});

// ── PRE_CORE cross-side context containment (OD-PC-1A / OD-PC-2 CORR1) ─────

const PRE_CORE_PAIR = Object.freeze({
  acquirerEnvironmentCode: "NF/NT",
  targetEnvironmentCode: "NT/STP",
});

check("PC-B1", "lawful PRE_CORE baseline passes containment and produces the accepted empty pack (CASE 1)", () => {
  for (const status of ["ADMISSIBILITY_UNRESOLVED", "NO_LAWFUL_PAIR", "PAIR_SELECTION_AMBIGUOUS"]) {
    const { pack } = assemblePrePack(status);
    assert.deepEqual(pack.selectedContextItems, [], status);
    assert.deepEqual(pack.permittedInterpretationDomains, [], status);
    assert.deepEqual(pack.prohibitedExtrapolationMarkers, [], status);
    assert.equal(pack.packScopeVerdict, "FACTUAL_EXPLANATION_ONLY", status);
    assert.equal(pack.selectionKeys.crossSideEnvironmentPair, null, status);
    assert.deepEqual(pack.selectionKeys.establishedEnvironmentCodes, [], status);
    for (const ruleId of ["SR-01", "SR-11", "SR-12"]) {
      assert.equal(pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === ruleId), false, `${status}: ${ruleId}`);
    }
    assert.equal(packSerialized(pack).includes("frictionLookup"), false, status);
    assert.equal(packSerialized(pack).includes("ecsMatrix"), false, status);
  }
});

check("PC-B2", "SR-01-only is not a lawful PRE_CORE exception; no replacement context exists (CASE 9)", () => {
  for (const status of ["ADMISSIBILITY_UNRESOLVED", "NO_LAWFUL_PAIR", "PAIR_SELECTION_AMBIGUOUS"]) {
    const { pack } = assemblePrePack(status);
    for (const domain of ["PRODUCT_SAFETY", "ENVIRONMENT_IDENTITY", "FRICTION_AND_RESOURCES", "TEMPORAL_HORIZON", "PAIR_SEMANTICS"]) {
      assert.equal(pack.selectedContextItems.some((item) => item.contextDomain === domain), false, `${status}: ${domain}`);
    }
    assert.deepEqual(pack.permittedInterpretationDomains, [], status);
  }
});

check("PC-B3", "injected pair / codes / both fail closed at the pack boundary before any selection rule (CASE 3/4/5)", () => {
  const { snapshot, uncertainty } = assemblePrePack("NO_LAWFUL_PAIR");
  const variants = [
    { crossSideEnvironmentPair: PRE_CORE_PAIR },
    { establishedEnvironmentCodes: ["NF/NT"] },
    { establishedEnvironmentCodes: ["NF/NT"], crossSideEnvironmentPair: PRE_CORE_PAIR },
  ];
  for (const packInput of variants) {
    assert.throws(
      () => buildInterpretationContextPack({ engineSnapshot: snapshot, structuredUncertainty: uncertainty, ...packInput }),
      (error) => error instanceof ContextPackSelectionError
        && /PRE_CORE_SELECTOR forbids/.test(String(error.message)),
      "containment must fire before collectSelectionKeys/SR-11",
    );
  }
});

check("PC-B4", "DUAL_CORE paths are not blocked by the PRE_CORE-only containment (CASE 10 regression)", () => {
  const dualPair = assemblePack(BRANCH_INPUTS.P_5A, { crossSideEnvironmentPair: PRE_CORE_PAIR });
  assert.ok(dualPair.pack.selectedContextItems.some((item) => item.relevance.selectionRuleId === "SR-11"));
  assert.equal(dualPair.pack.selectionKeys.crossSideEnvironmentPair.acquirerEnvironmentCode, "NF/NT");
  const dualCodes = assemblePack(BRANCH_INPUTS.P_5A, { establishedEnvironmentCodes: ["NF/NT"] });
  assert.deepEqual(dualCodes.pack.selectionKeys.establishedEnvironmentCodes, ["NF/NT"]);
});

console.log("Agent Interpretation Context Pack A3-A cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log("LEGACY REGRESSION MARKER PASS 17/17");
console.log(`PASS ${results.length}/${results.length}`);
