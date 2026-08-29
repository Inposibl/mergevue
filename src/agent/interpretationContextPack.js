import {
  AUTHORIZED_MODULE_IDS,
  BRANCH_TO_PRECEDENCE_PRIORITY,
  CONTEXT_DOMAINS,
  CONTEXT_ITEM_KINDS,
  CONTEXT_PACK_SCHEMA_VERSION,
  DERIVATION_METHOD_ALLOWLIST_FIELDS,
  DERIVATION_METHOD_ALLOWLIST_SOURCE_ROWS,
  ENGINE_OUTCOME_CODES,
  PACK_SCOPE_VERDICTS,
  PRE_CORE_OUTCOME_CODES,
  QUESTION_UNIVERSE,
  SELECTION_POLICY_VERSION,
  SNAPSHOT_SCHEMA_VERSION,
  SR12_MARKER_IDS,
  UNCERTAINTY_SCHEMA_VERSION,
} from "./agentContractConstants.js";
import { canonicalSerialize, sha256PrefixedDigest } from "./canonicalDigest.js";
import {
  CORPUS_ARTIFACTS,
  SR04_EDGE_CASE_SOURCE_ROWS,
  SUPERSEDED_RAW_PREDICATES,
  XP1,
  buildTbp1bContent,
  classifyContextRef,
  environmentCodesFromPair,
  findQuestionnaireQuestion,
  isSelectableAuthority,
  resolveCorpusMref,
  sr12MarkerText,
} from "./contextAuthorityRegistry.js";

const DUAL = CORPUS_ARTIFACTS.scoringAndTriage.dualRespondentComparison;
const FRICTION = CORPUS_ARTIFACTS.narrativesAndFriction.friction;
const RULE_RANK = Object.freeze({
  "SR-01": 1,
  "SR-02": 2,
  "SR-03": 3,
  "SR-04": 4,
  "SR-05": 5,
  "SR-06": 6,
  "SR-07": 7,
  "SR-08": 8,
  "SR-09": 9,
  "SR-10": 10,
  "SR-11": 11,
  "SR-12": 12,
});

export class ContextPackSelectionError extends Error {
  constructor(detail) {
    super(`ContextPackSelectionError | detail=${detail}`);
    this.name = "ContextPackSelectionError";
    this.detail = detail ?? null;
  }
}

function fail(detail) {
  throw new ContextPackSelectionError(detail);
}

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function requireObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
  return value;
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

function uniqueSorted(values, rankFn) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (value == null || value === "") continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  if (rankFn) out.sort(rankFn);
  else out.sort((left, right) => String(left).localeCompare(String(right)));
  return out;
}

function questionRank(left, right) {
  return QUESTION_UNIVERSE.indexOf(left) - QUESTION_UNIVERSE.indexOf(right);
}

function contentFromCorpus(value) {
  if (typeof value === "string") return value;
  if (value == null) return null;
  return canonicalSerialize(value);
}

function directedPairText(pair) {
  if (!pair) return "";
  return `${pair.acquirerEnvironmentCode} → ${pair.targetEnvironmentCode}`;
}

function makeItem({
  kind,
  contextRef,
  authorityClass,
  contextDomain,
  selectionRuleId,
  branchRelevance,
  questionRelevance,
  environmentRelevance,
  content,
  conditionalOn = null,
  contextItemId = null,
  sourceRef = null,
  supersededBy = null,
}) {
  if (!CONTEXT_ITEM_KINDS.includes(kind)) fail(`unlawful contextItemKind ${kind}`);
  if (!CONTEXT_DOMAINS.includes(contextDomain)) fail(`unlawful contextDomain ${contextDomain}`);
  if (!isSelectableAuthority(authorityClass)) fail(`authorityClass is not selectable: ${authorityClass}`);
  const classified = classifyContextRef(contextRef);
  if (!isSelectableAuthority(classified) && kind === "CORPUS_VERBATIM") {
    fail(`contextRef is not selectable: ${contextRef}`);
  }
  if (kind === "CORPUS_VERBATIM") {
    const corpusValue = resolveCorpusMref(contextRef);
    if (corpusValue === undefined) fail(`contextRef does not resolve: ${contextRef}`);
    const expected = contentFromCorpus(corpusValue);
    if (content !== expected) fail(`CORPUS_VERBATIM content is not byte-equal for ${contextRef}`);
  }
  if (typeof content !== "string") fail("context item content must be a string");
  const item = {
    contextItemId,
    contextItemKind: kind,
    contextRef,
    authorityClass,
    contextDomain,
    relevance: {
      branchRelevance: [...branchRelevance],
      questionRelevance: [...questionRelevance],
      environmentRelevance: [...environmentRelevance],
      selectionRuleId,
    },
    content,
    conditionalOn,
  };
  if (sourceRef != null) item.sourceRef = sourceRef;
  if (supersededBy != null) item.supersededBy = supersededBy;
  return item;
}

function verbatim({
  contextRef,
  contextDomain,
  selectionRuleId,
  branchRelevance,
  questionRelevance = [],
  environmentRelevance = [],
  authorityClass = classifyContextRef(contextRef),
  conditionalOn = null,
}) {
  if (!isSelectableAuthority(authorityClass)) return null;
  const corpusValue = resolveCorpusMref(contextRef);
  if (corpusValue === undefined || corpusValue === null) return null;
  const content = contentFromCorpus(corpusValue);
  if (typeof content !== "string" || content.length === 0) return null;
  return makeItem({
    kind: "CORPUS_VERBATIM",
    contextRef,
    authorityClass,
    contextDomain,
    selectionRuleId,
    branchRelevance,
    questionRelevance,
    environmentRelevance,
    content,
    conditionalOn,
  });
}

function collectSelectionKeys(snapshot, uncertainty, establishedEnvironmentCodes, crossSideEnvironmentPair) {
  const observations = Array.isArray(snapshot.engine.observations) ? snapshot.engine.observations : [];
  const questionRefs = uniqueSorted(
    observations.map((row) => row.questionRef).filter((value) => QUESTION_UNIVERSE.includes(value)),
    questionRank,
  );
  const semanticClasses = uniqueSorted(observations.map((row) => row.semanticClass).filter(Boolean));
  const reasonCodes = uniqueSorted(
    (uncertainty.items ?? []).map((item) => item.reasonCode).filter((value) => value != null),
    (left, right) => String(left).localeCompare(String(right)),
  );
  const established = uniqueSorted(establishedEnvironmentCodes);
  return {
    moduleId: snapshot.identity.moduleId,
    engineOutcomeCode: snapshot.engine.outcome.engineOutcomeCode,
    questionRefs,
    semanticClasses,
    candidatePairNormalized: snapshot.identity.candidatePairNormalized ?? "",
    deterministicState: snapshot.engine.outcome.deterministicStateEstablished === true
      ? snapshot.engine.outcome.state
      : null,
    uncertaintyReasonCodes: reasonCodes,
    establishedEnvironmentCodes: established,
    crossSideEnvironmentPair: crossSideEnvironmentPair == null
      ? null
      : {
        acquirerEnvironmentCode: String(crossSideEnvironmentPair.acquirerEnvironmentCode),
        targetEnvironmentCode: String(crossSideEnvironmentPair.targetEnvironmentCode),
      },
  };
}

function selectSr01(keys) {
  const items = [];
  const disclaimer = verbatim({
    contextRef: "mref://narrativesAndFriction/narratives/implementationGuideRows/sourceRow=3/cells/2",
    contextDomain: "PRODUCT_SAFETY",
    selectionRuleId: "SR-01",
    branchRelevance: [keys.engineOutcomeCode],
    authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
  });
  if (disclaimer) items.push(disclaimer);
  const codes = environmentCodesFromPair(keys.candidatePairNormalized);
  for (const code of codes) {
    const encoded = encodeURIComponent(code);
    const alias = verbatim({
      contextRef: `mref://sourceManifest/environmentAliases/${encoded}`,
      contextDomain: "ENVIRONMENT_IDENTITY",
      selectionRuleId: "SR-01",
      branchRelevance: [keys.engineOutcomeCode],
      environmentRelevance: [code],
      authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
    });
    if (alias) items.push(alias);
    const buyer = (CORPUS_ARTIFACTS.reporting.reportTemplate.buyerFacingAliases ?? [])
      .find((row) => row.environmentPair === code);
    if (buyer) {
      const item = verbatim({
        contextRef: `mref://reporting/reportTemplate/buyerFacingAliases/environmentPair=${encoded}/buyerFacingAlias`,
        contextDomain: "ENVIRONMENT_IDENTITY",
        selectionRuleId: "SR-01",
        branchRelevance: [keys.engineOutcomeCode],
        environmentRelevance: [code],
        authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
      });
      if (item) items.push(item);
    }
  }
  return items;
}

function selectSr02(keys) {
  if (keys.deterministicState == null) return [];
  const encoded = encodeURIComponent(keys.deterministicState);
  const item = verbatim({
    contextRef: `mref://scoringAndTriage/dualRespondentComparison/divergenceClassification/state=${encoded}`,
    contextDomain: "STATE_SEMANTICS",
    selectionRuleId: "SR-02",
    branchRelevance: [keys.engineOutcomeCode],
  });
  return item ? [item] : [];
}

function selectSr03(keys, snapshot) {
  const items = [];
  const priority = BRANCH_TO_PRECEDENCE_PRIORITY[keys.engineOutcomeCode];
  if (!priority) return items;
  const source = verbatim({
    contextRef: `mref://scoringAndTriage/dualRespondentComparison/classificationPrecedence/priority=${priority}/source`,
    contextDomain: "BRANCH_SEMANTICS",
    selectionRuleId: "SR-03",
    branchRelevance: [keys.engineOutcomeCode],
  });
  if (source) items.push(source);
  const superseded = SUPERSEDED_RAW_PREDICATES.find((row) => row.priority === priority);
  if (superseded) {
    const discriminator = snapshot.engine.comparison?.discriminator ?? {};
    const content = buildTbp1bContent({
      oneHighPair: discriminator.oneHighPair,
      oneHighDiscriminatorQuestion: discriminator.discriminatorQuestionRef,
    });
    items.push(makeItem({
      kind: "BOUNDARY_CANONICAL",
      contextRef: superseded.sourceRef,
      authorityClass: "ACCEPTED_METHODOLOGY_CONTEXT",
      contextDomain: "BRANCH_SEMANTICS",
      selectionRuleId: "SR-03",
      branchRelevance: [keys.engineOutcomeCode],
      questionRelevance: discriminator.discriminatorQuestionRef ? [discriminator.discriminatorQuestionRef] : [],
      environmentRelevance: [],
      content,
      contextItemId: superseded.contextItemId,
      sourceRef: superseded.sourceRef,
      supersededBy: superseded.supersededBy,
    }));
    return items;
  }
  const condition = verbatim({
    contextRef: `mref://scoringAndTriage/dualRespondentComparison/classificationPrecedence/priority=${priority}/condition`,
    contextDomain: "BRANCH_SEMANTICS",
    selectionRuleId: "SR-03",
    branchRelevance: [keys.engineOutcomeCode],
  });
  if (condition) items.push(condition);
  return items;
}

function selectSr04(keys) {
  const rows = SR04_EDGE_CASE_SOURCE_ROWS[keys.engineOutcomeCode] ?? [];
  const items = [];
  for (const sourceRow of rows) {
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/edgeCases/sourceRow=${sourceRow}`,
      contextDomain: "BRANCH_SEMANTICS",
      selectionRuleId: "SR-04",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  }
  return items;
}

function selectSr05(keys) {
  const items = [];
  const moduleIndex = (CORPUS_ARTIFACTS.questionnaires.modules ?? []).findIndex((row) => row.id === keys.moduleId);
  for (const questionRef of keys.questionRefs) {
    const comparison = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/comparisonEngine/q=${questionRef}`,
      contextDomain: "QUESTION_SEMANTICS",
      selectionRuleId: "SR-05",
      branchRelevance: [keys.engineOutcomeCode],
      questionRelevance: [questionRef],
    });
    if (comparison) items.push(comparison);
    if (moduleIndex === -1) continue;
    const question = findQuestionnaireQuestion(keys.moduleId, questionRef);
    if (!question) continue;
    for (const field of ["group", "prompt"]) {
      const item = verbatim({
        contextRef: `mref://questionnaires/modules/${moduleIndex}/questions/workbookQuestionId=${questionRef}/${field}`,
        contextDomain: "QUESTION_SEMANTICS",
        selectionRuleId: "SR-05",
        branchRelevance: [keys.engineOutcomeCode],
        questionRelevance: [questionRef],
        authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
      });
      if (item) items.push(item);
    }
    (question.methodologyNotes ?? []).forEach((note, noteIndex) => {
      if (!note?.text) return;
      const item = verbatim({
        contextRef: `mref://questionnaires/modules/${moduleIndex}/questions/workbookQuestionId=${questionRef}/methodologyNotes/${noteIndex}/text`,
        contextDomain: "QUESTION_SEMANTICS",
        selectionRuleId: "SR-05",
        branchRelevance: [keys.engineOutcomeCode],
        questionRelevance: [questionRef],
        authorityClass: "ACCEPTED_METHODOLOGY_CONTEXT",
      });
      if (item) items.push(item);
    });
  }
  return items;
}

function selectSr06(keys, snapshot) {
  const items = [];
  const moduleIndex = (CORPUS_ARTIFACTS.questionnaires.modules ?? []).findIndex((row) => row.id === keys.moduleId);
  const seen = new Set();
  for (const observation of snapshot.engine.observations ?? []) {
    const questionRef = observation.questionRef;
    const option = observation.selectedOption;
    if (!questionRef || !option) continue;
    const key = `${questionRef}|${option}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const moduleLocalQuestion = questionRef === "Q9" || questionRef === "Q10";
    if (!moduleLocalQuestion) {
      const mapRow = (DUAL.answerEnvironmentMap ?? []).find((row) => row.q === questionRef && row.option === option);
      if (mapRow) {
        const item = verbatim({
          contextRef: `mref://scoringAndTriage/dualRespondentComparison/answerEnvironmentMap/q=${questionRef}/option=${option}`,
          contextDomain: "QUESTION_SEMANTICS",
          selectionRuleId: "SR-06",
          branchRelevance: [keys.engineOutcomeCode],
          questionRelevance: [questionRef],
        });
        if (item) items.push(item);
      }
    } else if (keys.moduleId) {
      const binding = verbatim({
        contextRef: `mref://scoringAndTriage/dualRespondentComparison/answerSemanticBindings/moduleId=${keys.moduleId}/workbookQuestionId=${questionRef}`,
        contextDomain: "QUESTION_SEMANTICS",
        selectionRuleId: "SR-06",
        branchRelevance: [keys.engineOutcomeCode],
        questionRelevance: [questionRef],
      });
      if (binding) items.push(binding);
    }
    if (moduleIndex === -1) continue;
    const question = findQuestionnaireQuestion(keys.moduleId, questionRef);
    const optionIndex = (question?.options ?? []).findIndex((row) => row.value === option);
    if (optionIndex === -1) continue;
    const optionText = verbatim({
      contextRef: `mref://questionnaires/modules/${moduleIndex}/questions/workbookQuestionId=${questionRef}/options/${optionIndex}/text`,
      contextDomain: "QUESTION_SEMANTICS",
      selectionRuleId: "SR-06",
      branchRelevance: [keys.engineOutcomeCode],
      questionRelevance: [questionRef],
      authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
    });
    if (optionText) items.push(optionText);
    if (moduleLocalQuestion) {
      const signals = verbatim({
        contextRef: `mref://questionnaires/modules/${moduleIndex}/questions/workbookQuestionId=${questionRef}/options/${optionIndex}/internalEnvironmentSignals`,
        contextDomain: "QUESTION_SEMANTICS",
        selectionRuleId: "SR-06",
        branchRelevance: [keys.engineOutcomeCode],
        questionRelevance: [questionRef],
        authorityClass: "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT",
      });
      if (signals) items.push(signals);
    }
  }
  return items;
}

function selectSr07(keys) {
  const items = [];
  for (const semanticClass of keys.semanticClasses) {
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/semanticClassEffects/semanticclass=${semanticClass}`,
      contextDomain: "SEMANTIC_CLASS_SEMANTICS",
      selectionRuleId: "SR-07",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  }
  return items;
}

function selectSr08(keys, snapshot) {
  const items = [];
  const pair = keys.candidatePairNormalized;
  (DUAL.pairSpecificWeights ?? []).forEach((row, index) => {
    const normalized = normalizePair(row.candidatePair);
    if (normalized !== pair || !pair) return;
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/pairSpecificWeights/${index}`,
      contextDomain: "PAIR_SEMANTICS",
      selectionRuleId: "SR-08",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  });
  const tiers = uniqueSorted([
    snapshot.engine.comparison?.roleSplit?.tierR1,
    snapshot.engine.comparison?.roleSplit?.tierR2,
    ...(snapshot.engine.observations ?? []).map((row) => row.seniorityTier),
  ]);
  for (const tier of tiers) {
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/seniorityTierMapping/seniorityTier=${tier}/definition`,
      contextDomain: "PAIR_SEMANTICS",
      selectionRuleId: "SR-08",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  }
  const vantageSeen = new Set();
  for (const observation of snapshot.engine.observations ?? []) {
    const questionRef = observation.questionRef;
    const tier = observation.seniorityTier;
    if (!questionRef || !tier) continue;
    const key = `${questionRef}|${tier}`;
    if (vantageSeen.has(key)) continue;
    vantageSeen.add(key);
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/questionTierVantage/questionref=${questionRef}/senioritytier=${tier}`,
      contextDomain: "PAIR_SEMANTICS",
      selectionRuleId: "SR-08",
      branchRelevance: [keys.engineOutcomeCode],
      questionRelevance: [questionRef],
    });
    if (item) items.push(item);
  }
  return items;
}

function selectSr09(keys, snapshot) {
  const items = [];
  const evidenceTypes = new Set();
  const knowledgeLevels = new Set();
  const confidenceLevels = new Set();
  const reliabilityFlags = new Set();
  for (const observation of snapshot.engine.observations ?? []) {
    const declared = observation.declaredEvidenceFields ?? {};
    if (declared.evidenceType) evidenceTypes.add(declared.evidenceType);
    if (declared.knowledgeLevel) knowledgeLevels.add(declared.knowledgeLevel);
    if (declared.confidence) confidenceLevels.add(declared.confidence);
    for (const flag of declared.reliabilityFlags ?? []) reliabilityFlags.add(flag);
  }
  const pushDef = (collection, code, field = "definition") => {
    const item = verbatim({
      contextRef: `mref://canonicalSchema/${collection}/code=${encodeURIComponent(code)}/${field}`,
      contextDomain: "QUESTION_SEMANTICS",
      selectionRuleId: "SR-09",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  };
  for (const code of uniqueSorted([...evidenceTypes])) pushDef("evidenceTypes", code);
  for (const code of uniqueSorted([...knowledgeLevels])) pushDef("knowledgeLevels", code);
  for (const code of uniqueSorted([...confidenceLevels])) pushDef("confidenceLevels", code);
  for (const code of uniqueSorted([...reliabilityFlags])) pushDef("reliabilityFlags", code, "triggerCondition");
  return items;
}

function selectSr10(keys, snapshot) {
  const candidates = snapshot.engine.outcome.contradictionCandidates ?? [];
  if (!Array.isArray(candidates) || candidates.length === 0) return [];
  const state = snapshot.engine.outcome.state;
  if (!state) return [];
  const items = [];
  for (const field of ["divergenceState", "contradictiontype", "defaultSeverity", "recordsIssued"]) {
    const item = verbatim({
      contextRef: `mref://scoringAndTriage/dualRespondentComparison/contradictionOutput/divergenceState=${encodeURIComponent(state)}/${field}`,
      contextDomain: "STATE_SEMANTICS",
      selectionRuleId: "SR-10",
      branchRelevance: [keys.engineOutcomeCode],
    });
    if (item) items.push(item);
  }
  return items;
}

function frictionLookupRow(pair) {
  return (FRICTION.frictionLookup ?? []).find((row) => (
    row.acquirerEnvironmentCode === pair.acquirerEnvironmentCode
    && row.targetEnvironmentCode === pair.targetEnvironmentCode
  )) ?? null;
}

function selectSr11(keys) {
  const pair = keys.crossSideEnvironmentPair;
  if (pair == null) return { items: [], lookupMissing: false };
  const items = [];
  const lookup = frictionLookupRow(pair);
  let lookupMissing = false;
  if (lookup) {
    const item = verbatim({
      contextRef: `mref://narrativesAndFriction/friction/frictionLookup/acquirerEnvironmentCode=${encodeURIComponent(pair.acquirerEnvironmentCode)}/targetEnvironmentCode=${encodeURIComponent(pair.targetEnvironmentCode)}`,
      contextDomain: "FRICTION_AND_RESOURCES",
      selectionRuleId: "SR-11",
      branchRelevance: [keys.engineOutcomeCode],
      environmentRelevance: [pair.acquirerEnvironmentCode, pair.targetEnvironmentCode],
      authorityClass: "CONDITIONAL_CONTEXT",
      conditionalOn: "crossSideEnvironmentPair",
    });
    if (item) items.push(item);
    const categories = uniqueSorted([
      lookup.primaryRiskCategory,
      lookup.secondaryRiskCategory,
      lookup.tertiaryRiskCategory,
    ]);
    for (const category of categories) {
      const sourceRow = riskTagSourceRow(category);
      if (sourceRow == null) continue;
      const tag = verbatim({
        contextRef: `mref://narrativesAndFriction/friction/riskCategoryTagging/sourceRow=${sourceRow}`,
        contextDomain: "FRICTION_AND_RESOURCES",
        selectionRuleId: "SR-11",
        branchRelevance: [keys.engineOutcomeCode],
        environmentRelevance: [pair.acquirerEnvironmentCode, pair.targetEnvironmentCode],
      });
      if (tag) items.push(tag);
    }
  } else {
    lookupMissing = true;
  }
  const ecs = verbatim({
    contextRef: `mref://narrativesAndFriction/friction/ecsMatrix/acquirerEnvironmentCode=${encodeURIComponent(pair.acquirerEnvironmentCode)}/targetScores/${encodeURIComponent(pair.targetEnvironmentCode)}`,
    contextDomain: "FRICTION_AND_RESOURCES",
    selectionRuleId: "SR-11",
    branchRelevance: [keys.engineOutcomeCode],
    environmentRelevance: [pair.acquirerEnvironmentCode, pair.targetEnvironmentCode],
    authorityClass: "CONDITIONAL_CONTEXT",
    conditionalOn: "crossSideEnvironmentPair",
  });
  if (ecs) items.push(ecs);
  for (const sourceRow of DERIVATION_METHOD_ALLOWLIST_SOURCE_ROWS) {
    for (const field of DERIVATION_METHOD_ALLOWLIST_FIELDS) {
      const domain = field === "2" || String(sourceRow) === "8" ? "TEMPORAL_HORIZON" : "TEMPORAL_HORIZON";
      const item = verbatim({
        contextRef: `mref://narrativesAndFriction/friction/derivationMethod/sourceRow=${sourceRow}/cells/${field}`,
        contextDomain: domain,
        selectionRuleId: "SR-11",
        branchRelevance: [keys.engineOutcomeCode],
        environmentRelevance: [pair.acquirerEnvironmentCode, pair.targetEnvironmentCode],
      });
      if (item) items.push(item);
    }
  }
  return { items, lookupMissing };
}

function riskTagSourceRow(category) {
  const row = (FRICTION.riskCategoryTagging ?? []).find((item) => item?.cells?.["1"] === category);
  return row?.sourceRow ?? null;
}

function selectSr12(keys, lookupMissing) {
  if (keys.crossSideEnvironmentPair == null || lookupMissing !== true) return [];
  return [];
}

function buildMarkers(keys, lookupMissing) {
  if (keys.crossSideEnvironmentPair == null || lookupMissing !== true) return [];
  const directed = directedPairText(keys.crossSideEnvironmentPair);
  return SR12_MARKER_IDS.map((markerId) => ({
    markerId,
    text: sr12MarkerText(markerId, directed),
  }));
}

function normalizePair(value) {
  const raw = String(value ?? "").trim();
  const parts = raw.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return raw;
  return [...parts].sort().join(" vs ");
}

function assignIds(items) {
  let next = 1;
  return items.map((item) => {
    if (item.contextItemId) return item;
    const assigned = { ...item, contextItemId: `CI-${String(next).padStart(3, "0")}` };
    next += 1;
    return assigned;
  });
}

function sortItems(items) {
  return [...items].sort((left, right) => {
    const rule = (RULE_RANK[left.relevance.selectionRuleId] ?? 99) - (RULE_RANK[right.relevance.selectionRuleId] ?? 99);
    if (rule !== 0) return rule;
    const ref = String(left.contextRef).localeCompare(String(right.contextRef));
    if (ref !== 0) return ref;
    return String(left.content).localeCompare(String(right.content));
  });
}

export function computePackScopeVerdict(selectedContextItems) {
  if (!Array.isArray(selectedContextItems) || selectedContextItems.length === 0) {
    return "FACTUAL_EXPLANATION_ONLY";
  }
  return "MERGEVUE_INTERPRETATION_PERMITTED";
}

function permittedDomains(items) {
  const present = new Set(items.map((item) => item.contextDomain));
  return CONTEXT_DOMAINS.filter((domain) => present.has(domain));
}

function assertNoForbiddenContent(pack) {
  const serialized = canonicalSerialize(pack);
  const raw1b = DUAL.classificationPrecedence.find((row) => row.priority === "1b")?.condition ?? "";
  if (raw1b && serialized.includes(raw1b)) fail("SP-1 raw 1b predicate entered the pack");
  const xp1 = resolveCorpusMref(XP1.mref);
  if (typeof xp1 === "string" && serialized.includes(xp1)) fail("XP-1 reverse-direction instruction entered the pack");
  if (serialized.includes("freeTierNarratives")) fail("freeTierNarratives entered the pack");
}

function validateInputs(engineSnapshot, structuredUncertainty) {
  const snapshot = requireObject(engineSnapshot, "engineSnapshot");
  const uncertainty = requireObject(structuredUncertainty, "structuredUncertainty");
  if (snapshot.snapshotSchemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    fail(`engineSnapshot.snapshotSchemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}`);
  }
  if (uncertainty.uncertaintySchemaVersion !== UNCERTAINTY_SCHEMA_VERSION) {
    fail(`structuredUncertainty.uncertaintySchemaVersion must be ${UNCERTAINTY_SCHEMA_VERSION}`);
  }
  const branch = snapshot.engine?.outcome?.engineOutcomeCode;
  if (!ENGINE_OUTCOME_CODES.includes(branch)) fail(`unknown engineOutcomeCode ${JSON.stringify(branch)}`);
  if (uncertainty.originBranch !== branch) fail("structuredUncertainty.originBranch does not match snapshot engineOutcomeCode");
  const snapshotDigest = snapshot.identity?.corpus?.corpusDigest;
  if (typeof snapshotDigest !== "string" || !snapshotDigest.startsWith("sha256:")) {
    fail("engineSnapshot.identity.corpus.corpusDigest is required");
  }
  return { snapshot, uncertainty, branch, snapshotDigest };
}

// PRE_CORE containment boundary (OD-PC-2 CORR1): caller-supplied cross-side
// inputs are not authority on the PRE_CORE_SELECTOR branch and must fail
// closed before any selection rule — including SR-01/SR-11/SR-12 — can run.
function assertPreCoreInputsAbsent(establishedEnvironmentCodes, crossSideEnvironmentPair) {
  if (crossSideEnvironmentPair != null) {
    fail("PRE_CORE_SELECTOR forbids crossSideEnvironmentPair at the context-pack boundary");
  }
  if (!Array.isArray(establishedEnvironmentCodes) || establishedEnvironmentCodes.length !== 0) {
    fail("PRE_CORE_SELECTOR forbids establishedEnvironmentCodes at the context-pack boundary");
  }
}

function assertSingleR1InputsAbsent(establishedEnvironmentCodes, crossSideEnvironmentPair) {
  if (crossSideEnvironmentPair != null) {
    fail("SINGLE_R1_ONLY forbids crossSideEnvironmentPair at the context-pack boundary");
  }
  if (!Array.isArray(establishedEnvironmentCodes) || establishedEnvironmentCodes.length !== 0) {
    fail("SINGLE_R1_ONLY forbids establishedEnvironmentCodes at the context-pack boundary");
  }
}

export function buildInterpretationContextPack({
  engineSnapshot,
  structuredUncertainty,
  establishedEnvironmentCodes = [],
  crossSideEnvironmentPair = null,
} = {}) {
  const { snapshot, uncertainty, snapshotDigest } = validateInputs(engineSnapshot, structuredUncertainty);
  if (!AUTHORIZED_MODULE_IDS.includes(snapshot.identity.moduleId)) {
    fail("identity.moduleId is not an authorized Dual module");
  }
  if (establishedEnvironmentCodes.length > 0 && !Array.isArray(establishedEnvironmentCodes)) {
    fail("establishedEnvironmentCodes must be an array");
  }
  if (crossSideEnvironmentPair != null) {
    requireObject(crossSideEnvironmentPair, "crossSideEnvironmentPair");
    if (!crossSideEnvironmentPair.acquirerEnvironmentCode || !crossSideEnvironmentPair.targetEnvironmentCode) {
      fail("crossSideEnvironmentPair requires acquirerEnvironmentCode and targetEnvironmentCode");
    }
  }

  const preCore = snapshot.outcomeSource === "PRE_CORE_SELECTOR";
  const singleR1 = snapshot.outcomeSource === "SINGLE_R1_ONLY";
  if (preCore) {
    if (!PRE_CORE_OUTCOME_CODES.includes(snapshot.engine.outcome.engineOutcomeCode)) {
      fail("PRE_CORE_SELECTOR snapshot carries a non-PRE_CORE engineOutcomeCode");
    }
    assertPreCoreInputsAbsent(establishedEnvironmentCodes, crossSideEnvironmentPair);
  }
  if (singleR1) assertSingleR1InputsAbsent(establishedEnvironmentCodes, crossSideEnvironmentPair);

  const selectionKeys = collectSelectionKeys(
    snapshot,
    uncertainty,
    establishedEnvironmentCodes,
    crossSideEnvironmentPair,
  );

  // OD-PC-1A / OD-PC-2 CORR1 empty PRE_CORE pack invariant: no selection rule
  // contributes context on the PRE_CORE branch, so the pack is empty by
  // construction and SR-01 is excluded there without affecting DUAL_CORE paths.
  const branchItems = preCore ? [] : singleR1 ? [
    ...selectSr01(selectionKeys),
    ...selectSr05(selectionKeys),
    ...selectSr06(selectionKeys, snapshot),
    ...selectSr07(selectionKeys),
    ...selectSr08(selectionKeys, snapshot),
    ...selectSr09(selectionKeys, snapshot),
  ] : [
    ...selectSr01(selectionKeys),
    ...selectSr02(selectionKeys),
    ...selectSr03(selectionKeys, snapshot),
    ...selectSr04(selectionKeys),
    ...selectSr05(selectionKeys),
    ...selectSr06(selectionKeys, snapshot),
    ...selectSr07(selectionKeys),
    ...selectSr08(selectionKeys, snapshot),
    ...selectSr09(selectionKeys, snapshot),
    ...selectSr10(selectionKeys, snapshot),
  ];
  const sr11 = preCore || singleR1 ? { items: [], lookupMissing: false } : selectSr11(selectionKeys);
  const sr12Items = preCore || singleR1 ? [] : selectSr12(selectionKeys, sr11.lookupMissing);
  const collected = [...branchItems, ...sr11.items, ...sr12Items].filter(Boolean);

  const selectedContextItems = assignIds(sortItems(collected));
  const permittedInterpretationDomains = permittedDomains(selectedContextItems);
  const prohibitedExtrapolationMarkers = buildMarkers(selectionKeys, sr11.lookupMissing);
  const packScopeVerdict = computePackScopeVerdict(selectedContextItems);
  if (!PACK_SCOPE_VERDICTS.includes(packScopeVerdict)) fail("unlawful packScopeVerdict");

  const methodologySourcePackageId = snapshot.identity.corpus.sourcePackageId;
  const methodologyCorpusDigest = snapshotDigest;
  const contextPackId = sha256PrefixedDigest(canonicalSerialize({
    selectionPolicyVersion: SELECTION_POLICY_VERSION,
    methodologyCorpusDigest,
    selectionKeys,
  }));
  const contextPackDigest = sha256PrefixedDigest(canonicalSerialize({
    selectedContextItems,
    permittedInterpretationDomains,
    prohibitedExtrapolationMarkers,
  }));

  const pack = {
    contextPackSchemaVersion: CONTEXT_PACK_SCHEMA_VERSION,
    contextPackId,
    contextPackDigest,
    selectionPolicyVersion: SELECTION_POLICY_VERSION,
    methodologySourcePackageId,
    methodologyCorpusDigest,
    selectionKeys,
    selectedContextItems,
    permittedInterpretationDomains,
    prohibitedExtrapolationMarkers,
    packScopeVerdict,
  };
  assertNoForbiddenContent(pack);
  if (pack.methodologyCorpusDigest !== snapshot.identity.corpus.corpusDigest) {
    fail("methodologyCorpusDigest does not equal engineSnapshot.identity.corpus.corpusDigest");
  }
  return deepFreeze(pack);
}

export function resolveContextPackMref(contextRef) {
  return resolveCorpusMref(contextRef);
}
