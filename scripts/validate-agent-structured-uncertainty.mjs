import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  AGENT_CONTRACT_VERSION,
  BRANCH_CODES,
  CLAIM_IDS,
  CONSTRAINTS_BY_BRANCH,
  MATCHED_ACCESS_RULE_IDS,
  RUNTIME_CORE_COMMIT,
  SNAPSHOT_SCHEMA_VERSION,
  UNCERTAINTY_DOMAINS,
  UNCERTAINTY_REASON_CODES,
  UNCERTAINTY_SCHEMA_VERSION,
  UNRESOLVED_REASON,
} from "../src/agent/agentContractConstants.js";
import { assembleEngineSnapshot } from "../src/agent/engineSnapshot.js";
import { buildStructuredUncertainty } from "../src/agent/structuredUncertainty.js";
import { compareDualRespondents } from "../src/flow/dualRespondentComparison.js";
import { isAuthorizedDualModule } from "../src/flow/observationScopeResolver.js";

const QUESTIONS = Array.from({ length: 11 }, (_, index) => `Q${index + 1}`);
const ROOT_KEYS = Object.freeze([
  "uncertaintySchemaVersion",
  "originBranch",
  "materialUncertaintyPresent",
  "known",
  "unknown",
  "withheldOutputs",
  "survivingEvidenceRefs",
  "unavailableEvidenceRefs",
  "items",
  "claimBoundaries",
]);
const ITEM_KEYS = Object.freeze([
  "uncertaintyId",
  "uncertaintyDomain",
  "reasonCode",
  "originBranch",
  "affectedClaims",
  "claimScope",
  "evidenceRefs",
  "constraintIds",
  "disclosureRequired",
  "derivationSource",
]);
const FORBIDDEN_SOURCE = Object.freeze([
  "src/flow/observationScopeResolver.js",
  "src/flow/dualRespondentComparison.js",
  "src/generated/",
  "questionnaires.json",
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
const EXTERNAL = { roleCode: "key_customer", seniorityLevel: "external" };

function withFlags(coreInput) {
  return {
    outOfPairEvidence: false,
    coherenceAmbiguous: false,
    ...coreInput,
  };
}

function identityFor(coreInput, overrides = {}) {
  return {
    diagnosticId: "diag-a2",
    projectId: null,
    moduleId: isAuthorizedDualModule(coreInput.moduleId) ? coreInput.moduleId : "acquirerEnvironment",
    candidatePair: coreInput.candidatePair ?? "",
    ...overrides,
  };
}

function assembleFrom(coreInput, identityOverrides = {}) {
  const input = withFlags(coreInput);
  const coreOutput = compareDualRespondents(input);
  const snapshot = assembleEngineSnapshot({
    coreOutput,
    identityContext: identityFor(input, identityOverrides),
    coreInput: input,
  });
  return { coreOutput, snapshot, coreInput: input, uncertainty: buildStructuredUncertainty(snapshot) };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
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
    candidatePair: "NF/SFP vs NF/SFJ",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ selectedOption: "A" }, { Q11: { selectedOption: "C" } }),
    answers2: fill({ selectedOption: "B" }, {
      Q1: { selectedOption: "A" },
      Q2: { selectedOption: "A" },
      Q3: { selectedOption: "A" },
      Q11: { selectedOption: "C" },
    }),
  },
};

const results = [];
function check(id, label, fn) {
  fn();
  results.push({ id, label, status: "PASS" });
}

function itemsOf(uncertainty, reasonCode) {
  return uncertainty.items.filter((item) => item.reasonCode === reasonCode);
}

function observationOf(snapshot, questionRef, slot) {
  return snapshot.engine.observations.find((row) => row.questionRef === questionRef && row.respondentSlot === slot);
}

function snapshotQrefs(snapshot) {
  return snapshot.engine.observations.map((row) => row.observationRef);
}

function resolveFactRef(snapshot, factRef) {
  assert.equal(factRef.startsWith("factref://engineSnapshot/"), true, factRef);
  const path = factRef.slice("factref://engineSnapshot/".length).split("/").filter(Boolean);
  let node = snapshot;
  for (const key of path) {
    assert.equal(node == null ? false : Object.hasOwn(node, key) || (Array.isArray(node) && String(Number(key)) === key), true, `missing ${factRef}`);
    node = node[key];
  }
  return node;
}

function assertShape(uncertainty, branch) {
  assert.deepEqual(Object.keys(uncertainty), [...ROOT_KEYS]);
  assert.equal(uncertainty.uncertaintySchemaVersion, UNCERTAINTY_SCHEMA_VERSION);
  assert.equal(uncertainty.originBranch, branch);
  assert.equal(typeof uncertainty.materialUncertaintyPresent, "boolean");
  assert.equal(uncertainty.materialUncertaintyPresent, uncertainty.items.some((item) => item.disclosureRequired === true));
  for (const item of uncertainty.items) {
    assert.deepEqual(Object.keys(item), [...ITEM_KEYS]);
    assert.ok(UNCERTAINTY_DOMAINS.includes(item.uncertaintyDomain), item.uncertaintyDomain);
    if (item.reasonCode != null) assert.ok(UNCERTAINTY_REASON_CODES.includes(item.reasonCode), item.reasonCode);
    assert.equal(item.originBranch, branch);
    for (const claimId of item.affectedClaims) assert.ok(CLAIM_IDS.includes(claimId), claimId);
  }
  for (const boundary of uncertainty.claimBoundaries) {
    assert.ok(CLAIM_IDS.includes(boundary.claimId));
    assert.equal(typeof boundary.permitted, "boolean");
    assert.equal(typeof boundary.permittedForm, "string");
  }
  assert.deepEqual(uncertainty.claimBoundaries.map((row) => row.claimId), [...CLAIM_IDS]);
}

function assertRefs(snapshot, uncertainty) {
  const qrefs = new Set(snapshotQrefs(snapshot));
  for (const ref of [...uncertainty.survivingEvidenceRefs, ...uncertainty.unavailableEvidenceRefs]) {
    assert.ok(qrefs.has(ref), `unknown qref ${ref}`);
    assert.equal(ref.startsWith("qref://"), true);
    assert.equal(ref.includes("mref://"), false);
  }
  const overlap = uncertainty.survivingEvidenceRefs.filter((ref) => uncertainty.unavailableEvidenceRefs.includes(ref));
  assert.deepEqual(overlap, []);
  for (const item of uncertainty.items) {
    for (const ref of item.evidenceRefs) {
      assert.ok(qrefs.has(ref), `item ${item.uncertaintyId} unknown qref ${ref}`);
    }
  }
  for (const fact of uncertainty.known) {
    const resolved = resolveFactRef(snapshot, fact.factRef);
    assert.deepEqual(resolved, fact.value);
  }
  for (const claim of uncertainty.unknown) {
    assert.ok(CLAIM_IDS.includes(claim.claimId), claim.claimId);
  }
}

function assertFrozen(uncertainty) {
  assert.ok(Object.isFrozen(uncertainty));
  assert.ok(Object.isFrozen(uncertainty.known));
  assert.ok(Object.isFrozen(uncertainty.unknown));
  assert.ok(Object.isFrozen(uncertainty.withheldOutputs));
  assert.ok(Object.isFrozen(uncertainty.survivingEvidenceRefs));
  assert.ok(Object.isFrozen(uncertainty.unavailableEvidenceRefs));
  assert.ok(Object.isFrozen(uncertainty.items));
  assert.ok(Object.isFrozen(uncertainty.claimBoundaries));
  for (const item of uncertainty.items) assert.ok(Object.isFrozen(item), item.uncertaintyId);
  const copyKnown = uncertainty.known.length;
  try { uncertainty.known.push({ tamper: true }); } catch { /* frozen */ }
  try { uncertainty.items[0] && (uncertainty.items[0].reasonCode = "TAMPER"); } catch { /* frozen */ }
  try { uncertainty.originBranch = "TAMPER"; } catch { /* frozen */ }
  assert.equal(uncertainty.known.length, copyKnown);
  assert.notEqual(uncertainty.originBranch, "TAMPER");
  if (uncertainty.items[0]) assert.notEqual(uncertainty.items[0].reasonCode, "TAMPER");
}

check("C0", "contract identity remains D0_R0_CORR2_A2C1_CORR1 / snapshot 1.1 / uncertainty 1.1", () => {
  assert.equal(AGENT_CONTRACT_VERSION, "D0_R0_CORR2_A2C1_CORR1");
  assert.equal(SNAPSHOT_SCHEMA_VERSION, "engine-snapshot-1.1");
  assert.equal(UNCERTAINTY_SCHEMA_VERSION, "structured-uncertainty-1.1");
  assert.equal(RUNTIME_CORE_COMMIT, "dcbd937e0135e790201ee5c8898c5b5f5a085298");
  assert.equal(UNCERTAINTY_DOMAINS.length, 9);
  assert.equal(CLAIM_IDS.length, 4);
});

check("B1", "all 13 branches assemble through A1.1 and produce StructuredUncertainty", () => {
  const seen = [];
  for (const branch of BRANCH_CODES) {
    const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS[branch]);
    assert.equal(snapshot.engine.outcome.branchCode, branch, branch);
    assert.equal(uncertainty.originBranch, branch, branch);
    assertShape(uncertainty, branch);
    assertRefs(snapshot, uncertainty);
    seen.push(branch);
  }
  assert.deepEqual(seen, [...BRANCH_CODES]);
});

check("P0C-1", "P_0C missing_module uses ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY and does not fabricate questionRef", () => {
  const { snapshot, uncertainty } = assembleFrom({
    moduleId: "",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(snapshot.engine.outcome.engineAuditRaw.unresolvedReason, UNRESOLVED_REASON.MISSING_MODULE);
  assert.equal(Object.hasOwn(snapshot.engine.outcome.engineAuditRaw, "questionRef"), false);
  assert.equal(uncertainty.known.some((row) => row.factRef.endsWith("/questionRef")), false);
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY").length, 1);
  assert.equal(uncertainty.materialUncertaintyPresent, true);
  assert.deepEqual(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY")[0].constraintIds, [...CONSTRAINTS_BY_BRANCH.P_0C]);
});

check("P0C-2", "P_0C unsupported_module uses ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY", () => {
  const { uncertainty } = assembleFrom({
    moduleId: "environmentLevel1",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_MODULE_IDENTITY").length, 1);
});

check("P0C-3", "P_0C unsupported_or_missing_question maps from transported token without fabricating a Dual path", () => {
  const { snapshot } = assembleFrom({
    moduleId: "",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const patched = cloneJson(snapshot);
  patched.engine.outcome.engineAuditRaw.unresolvedReason = UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION;
  const uncertainty = buildStructuredUncertainty(patched);
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY").length, 1);
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY")[0].reasonCode, "ELIGIBILITY_UNRESOLVED_QUESTION_IDENTITY");
  assert.equal(uncertainty.known.some((row) => row.value === UNRESOLVED_REASON.UNSUPPORTED_OR_MISSING_QUESTION), true);
});

check("P0C-4", "P_0C roleCode_unspecified uses ELIGIBILITY_UNRESOLVED_ROLE_UNSPECIFIED", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_0C);
  assert.equal(snapshot.engine.outcome.engineAuditRaw.unresolvedReason, UNRESOLVED_REASON.ROLE_CODE_UNSPECIFIED);
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_ROLE_UNSPECIFIED").length, 1);
  assert.equal(uncertainty.unknown.some((row) => row.claimId === "CLAIM_OBSERVATION_ELIGIBILITY"), true);
});

check("P0C-5", "P_0C unknown_seniority uses ELIGIBILITY_UNRESOLVED_UNKNOWN_SENIORITY", () => {
  const { uncertainty } = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: { roleCode: "c_suite", seniorityLevel: "not_a_mapped_tier" },
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(itemsOf(uncertainty, "ELIGIBILITY_UNRESOLVED_UNKNOWN_SENIORITY").length, 1);
});

check("P0C-6", "P_0C external vantage keeps reasonCode null and does not invent a token", () => {
  const { snapshot, uncertainty } = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: EXTERNAL,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  assert.equal(snapshot.engine.outcome.engineAuditRaw.unresolvedReason, null);
  const eligibility = uncertainty.items.filter((item) => item.uncertaintyDomain === "ELIGIBILITY");
  assert.equal(eligibility.length, 1);
  assert.equal(eligibility[0].reasonCode, null);
  assert.equal(eligibility[0].disclosureRequired, true);
  assert.equal(eligibility[0].claimScope, "STATE_IDENTITY");
  assert.equal(JSON.stringify(uncertainty).includes("external_vantage"), false);
  assert.equal(JSON.stringify(uncertainty).includes("unknown_vantage"), false);
  assert.equal(uncertainty.known.some((row) => row.factRef.endsWith("unresolvedReason") && row.value === null), true);
});

check("AP-1", "ACCESS_GATE_NOT_DIRECT is derived only from provenance rule ID", () => {
  const gated = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ directObservationGate: "no" }),
    answers2: fill(),
  });
  const left = observationOf(gated.snapshot, "Q1", "R1");
  assert.deepEqual(left.observationAdjudicationProvenance.matchedAccessRuleIds, ["DIRECT_OBSERVATION_GATE_NO_SUBSTANTIVE_OPTION"]);
  assert.ok(itemsOf(gated.uncertainty, "ACCESS_GATE_NOT_DIRECT").length > 0);

  const nonSubstantive = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, { Q10: { selectedOption: "E", directObservationGate: "no" } }),
    answers2: fill(),
  });
  const q10 = observationOf(nonSubstantive.snapshot, "Q10", "R1");
  assert.equal(q10.accessDisposition.directObservationGate, "no");
  assert.deepEqual(q10.observationAdjudicationProvenance.matchedAccessRuleIds, []);
  const q10Access = nonSubstantive.uncertainty.items.filter((item) => (
    item.reasonCode === "ACCESS_GATE_NOT_DIRECT" && item.evidenceRefs.includes(q10.observationRef)
  ));
  assert.deepEqual(q10Access, []);
});

check("AP-2", "ACCESS_EVIDENCE_HYPOTHETICAL and ACCESS_EVIDENCE_UNKNOWN follow provenance only", () => {
  const hypo = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ evidenceType: "hypothetical" }),
    answers2: fill(),
  });
  assert.ok(observationOf(hypo.snapshot, "Q1", "R1").observationAdjudicationProvenance.matchedAccessRuleIds.includes("EVIDENCE_TYPE_HYPOTHETICAL"));
  assert.ok(itemsOf(hypo.uncertainty, "ACCESS_EVIDENCE_HYPOTHETICAL").length > 0);
  assert.equal(itemsOf(hypo.uncertainty, "ACCESS_EVIDENCE_UNKNOWN").length, 0);

  const unknown = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ evidenceType: "unknown" }),
    answers2: fill(),
  });
  assert.ok(observationOf(unknown.snapshot, "Q1", "R1").observationAdjudicationProvenance.matchedAccessRuleIds.includes("EVIDENCE_TYPE_UNKNOWN"));
  assert.ok(itemsOf(unknown.uncertainty, "ACCESS_EVIDENCE_UNKNOWN").length > 0);
});

check("AP-3", "TIER_VANTAGE_MISMATCH uses tierDefaultUseClass CONTEXTUAL, not final useClass", () => {
  const line = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: LINE,
    respondent2: SENIOR,
    answers1: fill(),
    answers2: fill(),
  });
  const lineQ1 = observationOf(line.snapshot, "Q1", "R1");
  assert.equal(lineQ1.observationAdjudicationProvenance.tierDefaultUseClass, "CONTEXTUAL");
  assert.ok(itemsOf(line.uncertainty, "TIER_VANTAGE_MISMATCH").some((item) => item.evidenceRefs.includes(lineQ1.observationRef)));

  const gatedSenior = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({ directObservationGate: "no" }),
    answers2: fill(),
  });
  const seniorQ1 = observationOf(gatedSenior.snapshot, "Q1", "R1");
  assert.equal(seniorQ1.useClass, "CONTEXTUAL");
  assert.equal(seniorQ1.observationAdjudicationProvenance.tierDefaultUseClass, "PRIMARY");
  const mismatchOnQ1 = gatedSenior.uncertainty.items.filter((item) => (
    item.reasonCode === "TIER_VANTAGE_MISMATCH" && item.evidenceRefs.includes(seniorQ1.observationRef)
  ));
  assert.deepEqual(mismatchOnQ1, []);
});

check("S1", "semantic classes emit coverage items; EVENT_ABSENCE and STRUCTURAL_PRECONDITION_ABSENCE are non-material", () => {
  const { snapshot, uncertainty } = assembleFrom({
    moduleId: "acquirerEnvironment",
    candidatePair: "NT/STJ vs NT/STP",
    respondent1: SENIOR,
    respondent2: SENIOR,
    answers1: fill({}, {
      Q1: { selectedOption: "E" },
      Q8: { selectedOption: "F" },
      Q9: { selectedOption: "E" },
      Q10: { selectedOption: "E" },
    }),
    answers2: fill(),
  });
  assert.equal(observationOf(snapshot, "Q1", "R1").semanticClass, "OBSERVATION_GAP");
  assert.equal(observationOf(snapshot, "Q8", "R1").semanticClass, "STRUCTURAL_PRECONDITION_ABSENCE");
  assert.equal(observationOf(snapshot, "Q9", "R1").semanticClass, "EVENT_ABSENCE");
  assert.equal(observationOf(snapshot, "Q10", "R1").semanticClass, "AMBIGUOUS_COLLAPSE");
  const event = itemsOf(uncertainty, "COVERAGE_SEMANTIC_EVENT_ABSENCE");
  const structural = itemsOf(uncertainty, "COVERAGE_SEMANTIC_STRUCTURAL_PRECONDITION_ABSENCE");
  const gap = itemsOf(uncertainty, "COVERAGE_SEMANTIC_OBSERVATION_GAP");
  const ambiguous = itemsOf(uncertainty, "COVERAGE_SEMANTIC_AMBIGUOUS_COLLAPSE");
  assert.ok(event.length > 0 && structural.length > 0 && gap.length > 0 && ambiguous.length > 0);
  assert.ok(event.every((item) => item.disclosureRequired === false && item.claimScope === "DETAIL_ONLY"));
  assert.ok(structural.every((item) => item.disclosureRequired === false && item.claimScope === "DETAIL_ONLY"));
  const eventRef = observationOf(snapshot, "Q9", "R1").observationRef;
  const structuralRef = observationOf(snapshot, "Q8", "R1").observationRef;
  assert.ok(uncertainty.survivingEvidenceRefs.includes(eventRef));
  assert.ok(uncertainty.survivingEvidenceRefs.includes(structuralRef));
  assert.equal(uncertainty.unavailableEvidenceRefs.includes(eventRef), false);
  assert.equal(uncertainty.unavailableEvidenceRefs.includes(structuralRef), false);
});

check("M1", "P_1 STATE_IDENTITY materiality comes only from branch-level coverage reasons", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_1);
  assert.equal(uncertainty.originBranch, "P_1");
  const material = uncertainty.items.filter((item) => item.disclosureRequired === true);
  assert.ok(material.length >= 1);
  for (const item of material) {
    assert.ok([
      "COVERAGE_COMPARABLE_PAIRS_BELOW_MINIMUM",
      "COVERAGE_HIGH_RESOLVER_UNAVAILABLE",
      "COVERAGE_HIGH_RESOLVER_NOT_PRIMARY",
    ].includes(item.reasonCode), item.reasonCode);
    assert.equal(item.claimScope, "STATE_IDENTITY");
    assert.ok(item.affectedClaims.includes("CLAIM_ENGINE_STATE_IDENTITY"));
  }
  const observationMaterial = uncertainty.items.filter((item) => (
    item.disclosureRequired === true
    && (item.reasonCode.startsWith("ACCESS_")
      || item.reasonCode.startsWith("COVERAGE_SEMANTIC_")
      || item.reasonCode === "TIER_VANTAGE_MISMATCH"
      || item.reasonCode.startsWith("QUALITY_")
    )
  ));
  assert.deepEqual(observationMaterial, []);
  assert.equal(uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY").permitted, false);
  assert.equal(uncertainty.withheldOutputs[0].withheldItem, "comparator output");
  assert.equal(uncertainty.withheldOutputs[0].reconstructionProhibited, true);
  assert.equal(snapshot.engine.outcome.suppression.comparatorOutputSuppressed, true);
});

check("M2", "P_3 clean ④-A can remain non-material despite HIGH_RESOLVER_DIVERGENCE_ALL", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_3);
  assert.equal(snapshot.engine.outcome.state, "④-A IRRESOLVABLE — within-pair divergence");
  const divergence = itemsOf(uncertainty, "HIGH_RESOLVER_DIVERGENCE_ALL");
  assert.equal(divergence.length, 1);
  assert.equal(divergence[0].claimScope, "DETAIL_ONLY");
  assert.deepEqual(divergence[0].affectedClaims, []);
  assert.equal(divergence[0].disclosureRequired, false);
  assert.equal(uncertainty.materialUncertaintyPresent, false);
  assert.equal(uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY").permitted, true);
});

check("M3", "P_4 clean State③ can remain non-material even with AUTOMATED_UNCERTAINTY_INTERPRETATION posture elsewhere", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_4);
  assert.equal(snapshot.engine.outcome.state, "③ ROLE-LEVEL SPLIT");
  const split = itemsOf(uncertainty, "ROLE_LEVEL_SPLIT_SENIOR_LINE");
  assert.equal(split.length, 1);
  assert.equal(split[0].claimScope, "DETAIL_ONLY");
  assert.deepEqual(split[0].affectedClaims, []);
  assert.equal(split[0].disclosureRequired, false);
  assert.deepEqual(split[0].constraintIds, [...CONSTRAINTS_BY_BRANCH.P_4]);
  assert.equal(uncertainty.materialUncertaintyPresent, false);
});

check("M4", "P_5A/P_5B non-material observation items do not constrain deterministic states", () => {
  const fiveA = assembleFrom(BRANCH_INPUTS.P_5A);
  assert.equal(fiveA.uncertainty.materialUncertaintyPresent, false);
  assert.equal(fiveA.uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY").permitted, true);
  const fiveB = assembleFrom(BRANCH_INPUTS.P_5B);
  assert.equal(fiveB.snapshot.engine.outcome.branchCode, "P_5B");
  assert.equal(fiveB.uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY").permitted, true);
  const gated = assembleFrom({
    ...BRANCH_INPUTS.P_5A,
    answers1: fill({}, { Q6: { directObservationGate: "no" } }),
  });
  assert.equal(gated.snapshot.engine.outcome.branchCode, "P_5A");
  assert.ok(itemsOf(gated.uncertainty, "ACCESS_GATE_NOT_DIRECT").length > 0);
  assert.ok(itemsOf(gated.uncertainty, "ACCESS_GATE_NOT_DIRECT").every((item) => item.disclosureRequired === false));
  assert.equal(gated.uncertainty.materialUncertaintyPresent, false);
  assert.equal(gated.uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY").permitted, true);
});

check("P1B-1", "exact P_1B emits PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH and withholds NF/SFP reconstruction", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_1B);
  assert.equal(snapshot.engine.comparison.discriminator.bothDiscriminatorObservationGap, true);
  const item = itemsOf(uncertainty, "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH");
  assert.equal(item.length, 1);
  assert.equal(item[0].disclosureRequired, true);
  assert.deepEqual(item[0].affectedClaims, ["CLAIM_NF_SFP_DETERMINATION"]);
  assert.deepEqual(item[0].constraintIds, [...CONSTRAINTS_BY_BRANCH.P_1B]);
  assert.equal(uncertainty.unknown.some((row) => row.claimId === "CLAIM_NF_SFP_DETERMINATION"), true);
  assert.equal(uncertainty.withheldOutputs[0].withheldItem, "NF/SFP determination");
  assert.equal(uncertainty.withheldOutputs[0].reconstructionProhibited, true);
  assert.equal(uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_NF_SFP_DETERMINATION").permitted, false);
});

check("P1B-2", "unknown, CONTEXTUAL, direct ceiling, hypothetical, generic unavailable, mixed unavailable, and Q11-E do not substitute for P_1B", () => {
  const cases = [
    ["unknown", {
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({ evidenceType: "unknown" }, { Q11: { selectedOption: "A", evidenceType: "unknown" } }),
      answers2: fill({ evidenceType: "unknown" }, { Q11: { selectedOption: "A", evidenceType: "unknown" } }),
    }],
    ["contextual line", {
      candidatePair: "NF/SFP vs NF/SFJ",
      respondent1: LINE,
      respondent2: LINE,
      answers1: fill(),
      answers2: fill(),
    }],
    ["direct ceiling", {
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({ directObservationGate: "no" }),
      answers2: fill({ directObservationGate: "no" }),
    }],
    ["hypothetical", {
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({ evidenceType: "hypothetical" }),
      answers2: fill({ evidenceType: "hypothetical" }),
    }],
    ["mixed unavailable", {
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({}, { Q11: { selectedOption: "F" } }),
      answers2: fill({ evidenceType: "unknown" }, { Q11: { selectedOption: "A", evidenceType: "unknown" } }),
    }],
    ["Q11-E SUBSTANTIVE_SIGNAL", {
      candidatePair: "NF/SFP vs NF/SFJ",
      answers1: fill({}, { Q11: { selectedOption: "E" } }),
      answers2: fill({}, { Q11: { selectedOption: "E" } }),
    }],
  ];
  for (const [label, overrides] of cases) {
    const { snapshot, uncertainty } = assembleFrom({
      moduleId: "acquirerEnvironment",
      respondent1: SENIOR,
      respondent2: SENIOR,
      answers1: fill(),
      answers2: fill(),
      ...overrides,
    });
    assert.notEqual(snapshot.engine.outcome.branchCode, "P_1B", label);
    assert.equal(itemsOf(uncertainty, "PAIR_DISCRIMINATOR_OBSERVATION_GAP_BOTH").length, 0, label);
  }
});

check("P2", "P_2 preserves candidate_4B and withholds final ④-B", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_2);
  assert.equal(snapshot.engine.outcome.branchCode, "P_2");
  assert.equal(snapshot.engine.outcome.provisionalState, "candidate_4B");
  assert.equal(snapshot.engine.comparison.outOfPairEvidenceInput, true);
  const item = itemsOf(uncertainty, "CANDIDATE_PAIR_IDENTIFICATION_FAILURE");
  assert.equal(item.length, 1);
  assert.equal(item[0].disclosureRequired, true);
  assert.deepEqual(item[0].affectedClaims, ["CLAIM_FINAL_4B_DETERMINATION"]);
  assert.equal(uncertainty.unknown.some((row) => row.claimId === "CLAIM_FINAL_4B_DETERMINATION"), true);
  assert.equal(uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_FINAL_4B_DETERMINATION").permitted, false);
});

check("P5X", "P_5X is material and must not claim State① or State②", () => {
  const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS.P_5X);
  assert.equal(snapshot.engine.comparison.coherenceAmbiguousInput, true);
  const item = itemsOf(uncertainty, "AGREEMENT_ENVIRONMENT_COHERENCE_AMBIGUOUS");
  assert.equal(item.length, 1);
  assert.equal(item[0].disclosureRequired, true);
  assert.deepEqual(item[0].constraintIds, [...CONSTRAINTS_BY_BRANCH.P_5X]);
  const stateClaim = uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY");
  assert.equal(stateClaim.permitted, false);
  assert.match(stateClaim.permittedForm, /State①|State②/);
});

check("P3A", "P_3A is material and must not claim final ④-A", () => {
  const { uncertainty } = assembleFrom(BRANCH_INPUTS.P_3A);
  const item = itemsOf(uncertainty, "ONE_HIGH_DISCRIMINATOR_DIVERGENCE");
  assert.equal(item.length, 1);
  assert.equal(item[0].disclosureRequired, true);
  assert.deepEqual(item[0].constraintIds, [...CONSTRAINTS_BY_BRANCH.P_3A]);
  const stateClaim = uncertainty.claimBoundaries.find((row) => row.claimId === "CLAIM_ENGINE_STATE_IDENTITY");
  assert.equal(stateClaim.permitted, false);
  assert.match(stateClaim.permittedForm, /④-A/);
});

check("D1", "identical EngineSnapshot input yields byte-equivalent StructuredUncertainty including IDs", () => {
  const first = assembleFrom(BRANCH_INPUTS.P_1B);
  const second = assembleFrom(BRANCH_INPUTS.P_1B);
  assert.deepEqual(second.uncertainty, first.uncertainty);
  const again = buildStructuredUncertainty(first.snapshot);
  assert.deepEqual(again, first.uncertainty);
  assert.deepEqual(again.items.map((item) => item.uncertaintyId), first.uncertainty.items.map((item) => item.uncertaintyId));
});

check("D2", "uncertaintyIds are stable U-001 sequence after canonical ordering", () => {
  const { uncertainty } = assembleFrom(BRANCH_INPUTS.P_1);
  uncertainty.items.forEach((item, index) => {
    assert.equal(item.uncertaintyId, `U-${String(index + 1).padStart(3, "0")}`);
  });
});

check("I1", "root and nested collections are immutable", () => {
  const { uncertainty } = assembleFrom(BRANCH_INPUTS.P_5A);
  assertFrozen(uncertainty);
  const material = assembleFrom(BRANCH_INPUTS.P_1B);
  assertFrozen(material.uncertainty);
});

check("R1", "every evidenceRef and factRef resolves into the supplied EngineSnapshot", () => {
  for (const branch of BRANCH_CODES) {
    const { snapshot, uncertainty } = assembleFrom(BRANCH_INPUTS[branch]);
    assertRefs(snapshot, uncertainty);
  }
});

check("H1", "StructuredUncertainty does not contain human-runtime or SystemFailure codes", () => {
  const { uncertainty } = assembleFrom(BRANCH_INPUTS.P_4);
  const serialized = JSON.stringify(uncertainty);
  assert.equal(serialized.includes("analyst review required"), false);
  assert.equal(serialized.includes("practitioner will decide"), false);
  assert.equal(serialized.includes("PROVIDER_UNAVAILABLE"), false);
  assert.equal(serialized.includes("INPUT_ASSEMBLY_FAILURE"), false);
  assert.equal(serialized.includes("CONTRACT_VERSION_MISMATCH"), false);
});

check("SB1", "production A2 source does not import Core, generated corpus, or questionnaires", () => {
  const source = readFileSync(new URL("../src/agent/structuredUncertainty.js", import.meta.url), "utf8");
  for (const forbidden of FORBIDDEN_SOURCE) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.match(source, /from "\.\/agentContractConstants\.js"/);
  assert.equal(source.includes("compareDualRespondents"), false);
  assert.equal(source.includes("resolveObservationScope"), false);
});

console.log("Agent StructuredUncertainty A2 D0_R0 cases passed:");
for (const row of results) {
  console.log(`  ${row.id}. ${row.label}: ${row.status}`);
}
console.log(`PASS ${results.length}/${results.length}`);
