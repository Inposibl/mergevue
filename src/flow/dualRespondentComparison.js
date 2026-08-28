import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import { deriveObservationScopeCausalDisposition } from "./layeredEvidenceScoring.js";
import { resolveObservationScope } from "./observationScopeResolver.js";
import { assertPreDualSemanticIntegrity } from "./dualQuestionSemanticResolver.js";

const DUAL = scoringAndTriage.dualRespondentComparison;
const QUESTIONS = Object.freeze(Array.from({ length: 11 }, (_, index) => `Q${index + 1}`));
const REQUIRED_PRECEDENCE = Object.freeze(["0a", "0b", "0c", "1", "1b", "2", "3a", "3", "4", "5X", "5A", "5B"]);

export class DualRespondentCorpusConfigurationError extends Error {
  constructor({ section, expected, source, detail } = {}) {
    const parts = [
      "DualRespondentCorpusConfigurationError",
      section ? `section=${section}` : null,
      expected ? `expected=${expected}` : null,
      source ? `source=${source}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "DualRespondentCorpusConfigurationError";
    this.section = section ?? null;
    this.expected = expected ?? null;
    this.source = source ?? null;
    this.detail = detail ?? null;
  }
}

function text(value) {
  return String(value ?? "").trim();
}

function numbers(value) {
  return [...String(value ?? "").matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
}

function questionRefs(value) {
  return [...new Set([...String(value ?? "").matchAll(/\bQ(?:[1-9]|1[01])\b/g)].map((match) => match[0]))];
}

function normalizePair(value) {
  const raw = text(value);
  const parts = raw.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length !== 2) return raw;
  return [...parts].sort().join(" vs ");
}

function configFail({ section, expected, source, detail }) {
  throw new DualRespondentCorpusConfigurationError({ section, expected, source, detail });
}

function requireSheet(dualSheet) {
  if (!dualSheet || typeof dualSheet !== "object") {
    configFail({
      section: "dualRespondentComparison",
      expected: "dualRespondentComparison object",
      source: "scoringAndTriage.dualRespondentComparison",
      detail: "missing or invalid",
    });
  }
  return dualSheet;
}

function requireQualityRow(layer, sourceRow, section) {
  const row = layer.find((item) => item?.sourceRow === sourceRow);
  if (!row || typeof row !== "object") {
    configFail({
      section,
      expected: `evidenceQualityLayer sourceRow ${sourceRow}`,
      source: "dualRespondentComparison.evidenceQualityLayer",
      detail: "row absent",
    });
  }
  return row;
}

function requireFirstNumber(value, { section, expected, source }) {
  const found = numbers(value);
  if (!Number.isFinite(found[0])) {
    configFail({
      section,
      expected,
      source,
      detail: `unparsable number from ${JSON.stringify(String(value ?? ""))}`,
    });
  }
  return found[0];
}

function requireSecondDistinctNumber(value, { section, expected, source }) {
  const distinct = [...new Set(numbers(value))];
  if (!Number.isFinite(distinct[1])) {
    configFail({
      section,
      expected,
      source,
      detail: `need two distinct numbers, found ${JSON.stringify(distinct)}`,
    });
  }
  return distinct[1];
}

function uniqueCanonicalMatch(value, regex, { section, expected, source }) {
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const matches = [...String(value ?? "").matchAll(new RegExp(regex.source, flags))];
  if (matches.length !== 1) {
    configFail({
      section,
      expected: `${expected} (exactly 1 canonical occurrence)`,
      source,
      detail: matches.length === 0
        ? "0 canonical occurrences"
        : `${matches.length} canonical occurrences: ${matches.map((match) => JSON.stringify(match[0])).join("; ")}`,
    });
  }
  return matches[0];
}

function requireThresholdSet(value, source) {
  const match = uniqueCanonicalMatch(value, /Thresholds\s+([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)\s*\/\s*([\d.]+)/i, {
    section: "evidenceQualityLayer.product.thresholds",
    expected: "labeled Thresholds high/medium/low/exclude set of 4 numbers",
    source,
  });
  const thresholds = Object.freeze({
    thresholdHigh: Number(match[1]),
    thresholdMedium: Number(match[2]),
    thresholdLow: Number(match[3]),
    thresholdExclude: Number(match[4]),
  });
  if (Object.values(thresholds).some((item) => !Number.isFinite(item))) {
    configFail({
      section: "evidenceQualityLayer.product.thresholds",
      expected: "four finite threshold numbers",
      source,
      detail: "non-finite threshold",
    });
  }
  return thresholds;
}

function requireAgreementExcludeToken(action, source) {
  const match = uniqueCanonicalMatch(action, /excluded from agreement count if both (\w+)/i, {
    section: "evidenceQualityLayer.dim2.agreementCountExclusion",
    expected: "token from 'excluded from agreement count if both <knowledgeLevel>'",
    source,
  });
  return text(match[1]).toLowerCase();
}

function refsEqual(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((item, index) => item === b[index]);
}

function requireGovernanceQuestions(dual) {
  const state3 = (dual.divergenceClassification ?? []).find((row) => String(row.state ?? "").includes("③"));
  const row4 = (dual.classificationPrecedence ?? []).find((row) => text(row.priority) === "4");
  if (!state3) {
    configFail({
      section: "governanceTriggerQuestions",
      expected: "State③ triggerCondition with governance Q refs",
      source: "dualRespondentComparison.divergenceClassification",
      detail: "required source missing",
    });
  }
  if (!row4) {
    configFail({
      section: "governanceTriggerQuestions",
      expected: "priority 4 condition with governance Q refs",
      source: "dualRespondentComparison.classificationPrecedence",
      detail: "required source missing",
    });
  }
  const fromState = questionRefs(state3.triggerCondition);
  const fromPriority = questionRefs(row4.condition);
  if (!fromState.length) {
    configFail({
      section: "governanceTriggerQuestions",
      expected: "State③ triggerCondition with governance Q refs",
      source: "divergenceClassification[③].triggerCondition",
      detail: "required source unparsable",
    });
  }
  if (!fromPriority.length) {
    configFail({
      section: "governanceTriggerQuestions",
      expected: "priority 4 condition with governance Q refs",
      source: "classificationPrecedence[priority=4].condition",
      detail: "required source unparsable",
    });
  }
  if (!refsEqual(fromState, fromPriority)) {
    configFail({
      section: "governanceTriggerQuestions",
      expected: "identical Q refs from State③ triggerCondition and priority 4 condition",
      source: "dualRespondentComparison.divergenceClassification | classificationPrecedence",
      detail: `state3=${fromState.join(",")} priority4=${fromPriority.join(",")}`,
    });
  }
  return Object.freeze(fromState);
}

function precedenceByPriority(dual, priority) {
  return (dual.classificationPrecedence ?? []).find((row) => text(row.priority) === priority);
}

function stateByMark(dual, mark) {
  return (dual.divergenceClassification ?? []).find((row) => String(row.state ?? "").includes(mark));
}

function requireMatchingNumber(sources, regex, { section, expected }) {
  if (!Array.isArray(sources) || sources.length < 2) {
    configFail({
      section,
      expected: "at least two required corpus restatement locations",
      source: "dualRespondentComparison",
      detail: "insufficient sources",
    });
  }
  const parsed = sources.map((item) => {
    if (item.value == null || String(item.value).trim() === "") {
      configFail({
        section,
        expected,
        source: item.source,
        detail: "required source missing or empty",
      });
    }
    const match = uniqueCanonicalMatch(item.value, regex, { section, expected, source: item.source });
    const value = Number(match[1]);
    if (!Number.isFinite(value)) {
      configFail({
        section,
        expected,
        source: item.source,
        detail: `non-finite ${JSON.stringify(match[1])}`,
      });
    }
    return { value, match, source: item.source };
  });
  const first = parsed[0].value;
  const conflict = parsed.find((item) => item.value !== first);
  if (conflict) {
    configFail({
      section,
      expected: "duplicate corpus locations must agree",
      source: parsed.map((item) => item.source).join(" | "),
      detail: parsed.map((item) => `${item.source}=${item.value}`).join("; "),
    });
  }
  return parsed[0];
}

function requireMatchingWindow(sources, regex, { section, expected }) {
  if (!Array.isArray(sources) || sources.length < 2) {
    configFail({
      section,
      expected: "at least two required corpus restatement locations",
      source: "dualRespondentComparison",
      detail: "insufficient sources",
    });
  }
  const parsed = sources.map((item) => {
    if (item.value == null || String(item.value).trim() === "") {
      configFail({
        section,
        expected,
        source: item.source,
        detail: "required source missing or empty",
      });
    }
    const match = uniqueCanonicalMatch(item.value, regex, { section, expected, source: item.source });
    const min = Number(match[1]);
    const max = Number(match[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
      configFail({
        section,
        expected,
        source: item.source,
        detail: `invalid window ${JSON.stringify(match[0])}`,
      });
    }
    return { min, max, source: item.source };
  });
  const first = parsed[0];
  const conflict = parsed.find((item) => item.min !== first.min || item.max !== first.max);
  if (conflict) {
    configFail({
      section,
      expected: "duplicate corpus locations must agree",
      source: parsed.map((item) => item.source).join(" | "),
      detail: parsed.map((item) => `${item.source}=${item.min}-${item.max}`).join("; "),
    });
  }
  return Object.freeze({ min: first.min, max: first.max });
}

function requireClassificationThresholds(dual) {
  const row1 = precedenceByPriority(dual, "1");
  const coverageEdge = (dual.edgeCases ?? []).find((row) => row.sourceRow === 14);
  const coverageParsed = requireMatchingNumber(
    [
      { value: row1?.condition, source: "classificationPrecedence[priority=1].condition" },
      { value: coverageEdge?.trigger, source: "edgeCases[sourceRow=14].trigger" },
    ],
    /≥\s*(\d+)\s+of\s+(\d+)/,
    {
      section: "coverageInsufficientMin",
      expected: "labeled ≥ N of M coverage threshold",
    },
  );
  const coverageQuestionCount = Number(coverageParsed.match[2]);
  const coverageDenomB = Number(
    uniqueCanonicalMatch(coverageEdge.trigger, /≥\s*(\d+)\s+of\s+(\d+)/, {
      section: "coverageQuestionCount",
      expected: "labeled ≥ N of M coverage denominator",
      source: "edgeCases[sourceRow=14].trigger",
    })[2],
  );
  if (!Number.isFinite(coverageQuestionCount) || coverageQuestionCount !== coverageDenomB) {
    configFail({
      section: "coverageQuestionCount",
      expected: "duplicate coverage denominators must agree",
      source: "classificationPrecedence[priority=1].condition | edgeCases[sourceRow=14].trigger",
      detail: `${coverageQuestionCount} vs ${coverageDenomB}`,
    });
  }
  if (coverageQuestionCount !== QUESTIONS.length) {
    configFail({
      section: "coverageQuestionCount",
      expected: `denominator ${QUESTIONS.length} matching instrument Q1–Q11`,
      source: "classificationPrecedence[priority=1].condition",
      detail: `got ${coverageQuestionCount}`,
    });
  }

  const row5a = precedenceByPriority(dual, "5A");
  const state1 = stateByMark(dual, "①");
  const state1Parsed = requireMatchingNumber(
    [
      { value: row5a?.condition, source: "classificationPrecedence[priority=5A].condition" },
      { value: state1?.triggerCondition, source: "divergenceClassification[①].triggerCondition" },
    ],
    /Effective AGREE\s*≥\s*(\d+)/,
    {
      section: "state1AgreeMin",
      expected: "labeled Effective AGREE ≥ N",
    },
  );

  const row5b = precedenceByPriority(dual, "5B");
  const state2 = stateByMark(dual, "②");
  const state2Window = requireMatchingWindow(
    [
      { value: row5b?.condition, source: "classificationPrecedence[priority=5B].condition" },
      { value: state2?.triggerCondition, source: "divergenceClassification[②].triggerCondition" },
    ],
    /Effective AGREE\s*(\d+)\s*[–-]\s*(\d+)/,
    {
      section: "state2AgreeWindow",
      expected: "labeled Effective AGREE L–U window",
    },
  );

  const row4 = precedenceByPriority(dual, "4");
  const state3 = stateByMark(dual, "③");
  const state3Parsed = requireMatchingNumber(
    [
      { value: row4?.condition, source: "classificationPrecedence[priority=4].condition" },
      { value: state3?.triggerCondition, source: "divergenceClassification[③].triggerCondition" },
    ],
    /≥\s*(\d+)\s+non-governance/,
    {
      section: "state3NonGovernanceAgreeMin",
      expected: "labeled ≥ N non-governance PRIMARY × PRIMARY AGREE",
    },
  );

  return Object.freeze({
    coverageInsufficientMin: coverageParsed.value,
    coverageQuestionCount,
    state1AgreeMin: state1Parsed.value,
    state2AgreeMin: state2Window.min,
    state2AgreeMax: state2Window.max,
    state3NonGovernanceAgreeMin: state3Parsed.value,
  });
}

function requireOneHighSpecial(dual) {
  const row3a = precedenceByPriority(dual, "3a");
  const row1b = precedenceByPriority(dual, "1b");
  if (!row3a?.condition) {
    configFail({
      section: "oneHighSpecialPair",
      expected: "priority 3a condition",
      source: "classificationPrecedence[priority=3a].condition",
      detail: "required source missing",
    });
  }
  if (!row1b?.condition) {
    configFail({
      section: "oneHighSpecialPair",
      expected: "priority 1b condition",
      source: "classificationPrecedence[priority=1b].condition",
      detail: "required source missing",
    });
  }
  const pairMatch = uniqueCanonicalMatch(
    row3a.condition,
    /Active pair\s*=\s*([A-Z]{2,3}\/[A-Z]{2,3}\s+vs\s+[A-Z]{2,3}\/[A-Z]{2,3})/i,
    {
      section: "oneHighSpecialPair",
      expected: "labeled Active pair = ENV vs ENV in priority 3a",
      source: "classificationPrecedence[priority=3a].condition",
    },
  );
  const highMatch = uniqueCanonicalMatch(row3a.condition, /sole HIGH\s*=\s*(Q(?:1[01]|[1-9]))\b/i, {
    section: "oneHighDiscriminatorQuestion",
    expected: "labeled sole HIGH = Qn in priority 3a",
    source: "classificationPrecedence[priority=3a].condition",
  });
  const pair1b = uniqueCanonicalMatch(
    row1b.condition,
    /([A-Z]{2,3}\/[A-Z]{2,3}\s+vs\s+[A-Z]{2,3}\/[A-Z]{2,3})/i,
    {
      section: "oneHighSpecialPair",
      expected: "canonical 1b pair identity ENV vs ENV",
      source: "classificationPrecedence[priority=1b].condition",
    },
  );
  const q1b = uniqueCanonicalMatch(row1b.condition, /Both respondents (Q(?:1[01]|[1-9]))\b\s*=/i, {
    section: "oneHighDiscriminatorQuestion",
    expected: "canonical 1b discriminator Both respondents Qn =",
    source: "classificationPrecedence[priority=1b].condition",
  });
  const pair = normalizePair(pairMatch[1]);
  const discriminator = highMatch[1];
  if (normalizePair(pair1b[1]) !== pair) {
    configFail({
      section: "oneHighSpecialPair",
      expected: "priority 1b pair identity equals priority 3a Active pair",
      source: "classificationPrecedence[priority=1b|3a].condition",
      detail: `3a=${pair} 1b=${normalizePair(pair1b[1])}`,
    });
  }
  if (q1b[1] !== discriminator) {
    configFail({
      section: "oneHighDiscriminatorQuestion",
      expected: "priority 1b Q identity equals priority 3a sole HIGH",
      source: "classificationPrecedence[priority=1b|3a].condition",
      detail: `3a=${discriminator} 1b=${q1b[1]}`,
    });
  }
  return Object.freeze({
    oneHighPair: pair,
    oneHighDiscriminatorQuestion: discriminator,
  });
}

function satisfiesState12AgreementCount(agreeCount, classification) {
  const inState2 = agreeCount >= classification.state2AgreeMin && agreeCount <= classification.state2AgreeMax;
  const inState1 = agreeCount >= classification.state1AgreeMin;
  return inState2 || inState1;
}

function requirePrecedence(dual) {
  const rows = dual.classificationPrecedence;
  if (!Array.isArray(rows) || rows.length === 0) {
    configFail({
      section: "classificationPrecedence",
      expected: "non-empty classificationPrecedence",
      source: "dualRespondentComparison.classificationPrecedence",
      detail: "missing",
    });
  }
  const precedence = Object.freeze(rows.map((row) => text(row.priority)));
  if (precedence.some((item) => !item)) {
    configFail({
      section: "classificationPrecedence",
      expected: "priority on every row",
      source: "dualRespondentComparison.classificationPrecedence",
      detail: JSON.stringify(precedence),
    });
  }
  if (
    precedence.length !== REQUIRED_PRECEDENCE.length
    || REQUIRED_PRECEDENCE.some((item, index) => item !== precedence[index])
  ) {
    configFail({
      section: "classificationPrecedence",
      expected: REQUIRED_PRECEDENCE.join(","),
      source: "dualRespondentComparison.classificationPrecedence",
      detail: `got ${precedence.join(",")}`,
    });
  }
  return precedence;
}

export function buildDualRespondentCorpusConfig(dualSheet) {
  const dual = requireSheet(dualSheet);
  const layer = dual.evidenceQualityLayer;
  if (!Array.isArray(layer) || layer.length === 0) {
    configFail({
      section: "evidenceQualityLayer",
      expected: "non-empty evidenceQualityLayer",
      source: "dualRespondentComparison.evidenceQualityLayer",
      detail: Array.isArray(layer) ? "empty" : "absent",
    });
  }

  const dim1 = requireQualityRow(layer, 6, "evidenceQualityLayer.dim1");
  const dim2 = requireQualityRow(layer, 7, "evidenceQualityLayer.dim2");
  const dim3 = requireQualityRow(layer, 8, "evidenceQualityLayer.dim3");
  const dim4 = requireQualityRow(layer, 9, "evidenceQualityLayer.dim4");
  const product = requireQualityRow(layer, 11, "evidenceQualityLayer.product");
  const thresholds = requireThresholdSet(
    product.lowQualityCondition,
    "dualRespondentComparison.evidenceQualityLayer[sourceRow=11].lowQualityCondition",
  );

  const quality = Object.freeze({
    evidenceHigh: requireFirstNumber(dim1.multiplier, {
      section: "dim1.high",
      expected: "dim1 high factor",
      source: "evidenceQualityLayer[sourceRow=6].multiplier",
    }),
    evidenceLow: requireFirstNumber(dim1.action, {
      section: "dim1.degraded",
      expected: "dim1 degraded factor",
      source: "evidenceQualityLayer[sourceRow=6].action",
    }),
    knowledgeHigh: requireFirstNumber(dim2.multiplier, {
      section: "dim2.high",
      expected: "dim2 high factor",
      source: "evidenceQualityLayer[sourceRow=7].multiplier",
    }),
    knowledgeLow: requireFirstNumber(dim2.action, {
      section: "dim2.degraded",
      expected: "dim2 degraded factor",
      source: "evidenceQualityLayer[sourceRow=7].action",
    }),
    confidenceHigh: requireFirstNumber(dim3.multiplier, {
      section: "dim3.high",
      expected: "dim3 high factor",
      source: "evidenceQualityLayer[sourceRow=8].multiplier",
    }),
    confidenceLow: requireFirstNumber(dim3.action, {
      section: "dim3.degraded",
      expected: "dim3 degraded factor",
      source: "evidenceQualityLayer[sourceRow=8].action",
    }),
    reliabilityHigh: requireFirstNumber(dim4.multiplier, {
      section: "dim4.high",
      expected: "dim4 high factor",
      source: "evidenceQualityLayer[sourceRow=9].multiplier",
    }),
    reliabilityPerFlag: requireFirstNumber(dim4.action, {
      section: "dim4.perFlag",
      expected: "dim4 per-flag factor",
      source: "evidenceQualityLayer[sourceRow=9].action",
    }),
    reliabilityFloor: requireSecondDistinctNumber(dim4.action, {
      section: "dim4.floor",
      expected: "dim4 minimum floor",
      source: "evidenceQualityLayer[sourceRow=9].action",
    }),
    ...thresholds,
    productNote: text(product.highQualityCondition),
    agreementCountExcludeKnowledgeLevel: requireAgreementExcludeToken(
      dim2.action,
      "evidenceQualityLayer[sourceRow=7].action",
    ),
  });

  const pairRows = dual.pairSpecificWeights;
  if (!Array.isArray(pairRows) || pairRows.length === 0) {
    configFail({
      section: "pairSpecificWeights",
      expected: "non-empty pairSpecificWeights",
      source: "dualRespondentComparison.pairSpecificWeights",
      detail: "missing",
    });
  }
  const productionPairs = Object.freeze([
    ...new Set(pairRows.map((row) => normalizePair(row.candidatePair)).filter(Boolean)),
  ]);
  if (!productionPairs.length) {
    configFail({
      section: "pairSpecificWeights.candidatePair",
      expected: "production pair identities",
      source: "dualRespondentComparison.pairSpecificWeights",
      detail: "none extracted",
    });
  }

  const classification = requireClassificationThresholds(dual);
  const oneHigh = requireOneHighSpecial(dual);

  return Object.freeze({
    dual,
    quality,
    governanceQuestions: requireGovernanceQuestions(dual),
    precedence: requirePrecedence(dual),
    productionPairs,
    classification,
    oneHighPair: oneHigh.oneHighPair,
    oneHighDiscriminatorQuestion: oneHigh.oneHighDiscriminatorQuestion,
  });
}

function highResolvers(dual, pair) {
  const wanted = normalizePair(pair);
  return Object.freeze(
    (dual.pairSpecificWeights ?? [])
      .filter((row) => normalizePair(row.candidatePair) === wanted && /HIGH/i.test(text(row.weightTier)))
      .map((row) => text(row.q)),
  );
}

function isOneHighPair(pair, oneHighPair) {
  return normalizePair(pair) === oneHighPair;
}

function answerOf(answers, questionRef) {
  return answers?.[questionRef] ?? answers?.[questionRef.toLowerCase()] ?? null;
}

function resolveAnswer(moduleId, respondent, questionRef, rawAnswer) {
  const selectedOption = text(rawAnswer?.selectedOption ?? rawAnswer?.option);
  const scope = resolveObservationScope({
    moduleId,
    workbookQuestionId: questionRef,
    canonicalQuestionId: rawAnswer?.canonicalQuestionId,
    respondent,
    selectedOption,
    directObservationGate: rawAnswer?.directObservationGate,
    evidenceType: rawAnswer?.evidenceType,
    reliabilityFlags: rawAnswer?.reliabilityFlags,
  });
  const accessAdjudicated = scope.useClass !== "PRIMARY" || scope.comparisonAvailability === "unavailable";
  const causalDisposition = deriveObservationScopeCausalDisposition({
    reliabilityFlags: rawAnswer?.reliabilityFlags ?? [],
    observationScopeAdjudicatedAccess: accessAdjudicated,
  });
  return Object.freeze({
    questionRef,
    selectedOption,
    evidenceType: text(rawAnswer?.evidenceType),
    knowledgeLevel: text(rawAnswer?.knowledgeLevel),
    confidence: text(rawAnswer?.confidence),
    reliabilityFlags: Object.freeze([...(rawAnswer?.reliabilityFlags ?? [])]),
    scope,
    causalDisposition,
  });
}

function dimEvidence(left, right, quality) {
  const low = ["inference", "hypothetical", "unknown"];
  if (left === "direct_observation" && right === "direct_observation") return quality.evidenceHigh;
  if (low.includes(left) || low.includes(right)) return quality.evidenceLow;
  return quality.evidenceHigh;
}

function dimKnowledge(left, right, quality) {
  const high = ["first_hand", "document_based"];
  const low = ["speculative", "not_known"];
  if (high.includes(left) && high.includes(right)) return quality.knowledgeHigh;
  if (low.includes(left) || low.includes(right)) return quality.knowledgeLow;
  return quality.knowledgeHigh;
}

function dimConfidence(left, right, quality) {
  if (left === "high" && right === "high") return quality.confidenceHigh;
  if (left === "low" || right === "low" || left === "cannot_determine" || right === "cannot_determine") {
    return quality.confidenceLow;
  }
  return quality.confidenceHigh;
}

function dimReliability(leftFlags, rightFlags, quality) {
  const count = [...leftFlags, ...rightFlags].length;
  if (count === 0) return quality.reliabilityHigh;
  const product = quality.reliabilityPerFlag ** count;
  return Math.max(quality.reliabilityFloor, product);
}

function fourFactor(left, right, quality) {
  const evidence = dimEvidence(left.evidenceType, right.evidenceType, quality);
  const knowledge = dimKnowledge(left.knowledgeLevel, right.knowledgeLevel, quality);
  const confidence = dimConfidence(left.confidence, right.confidence, quality);
  const reliability = dimReliability(
    left.causalDisposition?.effectiveScoringFlags ?? left.reliabilityFlags,
    right.causalDisposition?.effectiveScoringFlags ?? right.reliabilityFlags,
    quality,
  );
  return Number((evidence * knowledge * confidence * reliability).toFixed(6));
}

function hasComparablePrimary(answer) {
  return answer.scope.useClass === "PRIMARY"
    && answer.scope.comparisonAvailability === "available"
    && Boolean(answer.selectedOption);
}

function pairComparable(left, right) {
  return hasComparablePrimary(left) && hasComparablePrimary(right);
}

function bothLackComparablePrimary(left, right) {
  return !hasComparablePrimary(left) && !hasComparablePrimary(right);
}

function excludedFromAgreementCount(left, right, quality) {
  const token = quality.agreementCountExcludeKnowledgeLevel;
  return left.knowledgeLevel === token && right.knowledgeLevel === token;
}

function stateThreeTrigger(left, right, questionRef, governanceQuestions) {
  if (!governanceQuestions.includes(questionRef)) return false;
  const classes = [left.scope.useClass, right.scope.useClass].sort().join("|");
  if (classes !== "CONTEXTUAL|PRIMARY") return false;
  if (left.scope.comparisonAvailability === "unavailable" || right.scope.comparisonAvailability === "unavailable") {
    return false;
  }
  return Boolean(left.selectedOption && right.selectedOption && left.selectedOption !== right.selectedOption);
}

function outcome(priorityRow, extra = {}) {
  return Object.freeze({
    priority: text(priorityRow.priority),
    outcomeClass: text(priorityRow.outcomeClass),
    classificationOutcome: text(priorityRow.classificationOutcome),
    state: extra.state ?? null,
    routing: extra.routing ?? (text(priorityRow.humanGate) || text(priorityRow.classificationOutcome)),
    output: text(priorityRow.output),
    contradictionCandidates: Object.freeze(extra.contradictionCandidates ?? []),
    audit: Object.freeze(extra.audit ?? {}),
    genericContradictionEngineInvoked: false,
  });
}

function precedenceRow(dual, priority) {
  return (dual.classificationPrecedence ?? []).find((row) => text(row.priority) === priority);
}

function compareDualRespondentsWithConfig(input, corpusConfig) {
  const quality = corpusConfig.quality;
  const governanceQuestions = corpusConfig.governanceQuestions;
  const precedence = corpusConfig.precedence;
  const productionPairs = corpusConfig.productionPairs;
  const classification = corpusConfig.classification;
  const oneHighPair = corpusConfig.oneHighPair;
  const oneHighDiscriminatorQuestion = corpusConfig.oneHighDiscriminatorQuestion;
  const dual = corpusConfig.dual;

  assertPreDualSemanticIntegrity(input);

  const moduleId = text(input.moduleId);
  const candidatePair = text(input.candidatePair);
  const respondent1 = input.respondent1 ?? {};
  const respondent2 = input.respondent2 ?? {};
  const answers1 = input.answers1 ?? {};
  const answers2 = input.answers2 ?? {};

  const row0a = precedenceRow(dual, "0a");
  const row0b = precedenceRow(dual, "0b");
  const row0c = precedenceRow(dual, "0c");

  if (!candidatePair) {
    return outcome(row0a, { routing: "comparator_does_not_run" });
  }

  if (!productionPairs.includes(normalizePair(candidatePair))) {
    return outcome(row0b, { routing: "practitioner_pair_diagnosis" });
  }

  const resolved = QUESTIONS.map((questionRef) => Object.freeze({
    questionRef,
    left: resolveAnswer(moduleId, respondent1, questionRef, answerOf(answers1, questionRef)),
    right: resolveAnswer(moduleId, respondent2, questionRef, answerOf(answers2, questionRef)),
  }));

  const unresolved = resolved.find((row) => row.left.scope.useClass === "UNRESOLVED" || row.right.scope.useClass === "UNRESOLVED");
  if (unresolved) {
    const unresolvedSide = unresolved.left.scope.useClass === "UNRESOLVED" ? unresolved.left : unresolved.right;
    const unresolvedAudit = unresolvedSide.scope.audit ?? {};
    return outcome(row0c, {
      routing: "practitioner_access_review",
      audit: {
        questionRef: unresolved.questionRef,
        unresolvedReason: Object.hasOwn(unresolvedAudit, "unresolvedReason")
          ? unresolvedAudit.unresolvedReason
          : null,
      },
    });
  }

  const pairRows = resolved.map((row) => {
    const pairQuality = fourFactor(row.left, row.right, quality);
    const comparable = pairComparable(row.left, row.right);
    const agree = comparable && row.left.selectedOption === row.right.selectedOption;
    const diverge = comparable && row.left.selectedOption !== row.right.selectedOption;
    const excluded = excludedFromAgreementCount(row.left, row.right, quality);
    const countableAgree = agree && !excluded;
    const trigger = stateThreeTrigger(row.left, row.right, row.questionRef, governanceQuestions);
    const triggerQuality = trigger ? fourFactor(row.left, row.right, quality) : null;
    return Object.freeze({
      ...row,
      quality: pairQuality,
      comparable,
      agree,
      diverge,
      countableAgree,
      excludedFromAgreementCount: excluded,
      trigger,
      triggerQuality,
    });
  });

  const insufficient = pairRows.filter((row) => {
    if (row.trigger) return false;
    return !row.comparable || row.quality < quality.thresholdLow;
  }).length;

  const highs = highResolvers(dual, candidatePair);
  const highRows = pairRows.filter((row) => highs.includes(row.questionRef));
  const highAllBothLackComparablePrimary = highRows.length > 0
    && highRows.every((row) => bothLackComparablePrimary(row.left, row.right));
  const highNotPrimaryBoth = highRows.some((row) => row.left.scope.useClass !== "PRIMARY" || row.right.scope.useClass !== "PRIMARY");

  const discriminator = pairRows.find((row) => row.questionRef === oneHighDiscriminatorQuestion);
  const discriminatorBothGap = discriminator
    && discriminator.left.scope.semanticClass === "OBSERVATION_GAP"
    && discriminator.right.scope.semanticClass === "OBSERVATION_GAP";
  const exact1bSpecialCondition = isOneHighPair(candidatePair, oneHighPair) && discriminatorBothGap;
  const genericPriority1 = insufficient >= classification.coverageInsufficientMin
    || highAllBothLackComparablePrimary
    || highNotPrimaryBoth;

  const rawAgreeCount = pairRows.filter((row) => row.agree).length;
  const agreeCount = pairRows.filter((row) => row.countableAgree).length;
  const agreePrimary = pairRows.filter((row) => row.countableAgree && row.quality >= quality.thresholdMedium);
  const agreeHighQuality = pairRows.filter((row) => row.countableAgree && row.quality >= quality.thresholdHigh);
  const nonGovernanceAgree = pairRows.filter((row) => (
    !governanceQuestions.includes(row.questionRef)
    && row.countableAgree
    && row.quality >= quality.thresholdMedium
  ));

  const highAgree = highRows.filter((row) => row.agree && row.left.scope.useClass === "PRIMARY" && row.right.scope.useClass === "PRIMARY");
  const highDiverge = highRows.filter((row) => row.diverge && row.left.scope.useClass === "PRIMARY" && row.right.scope.useClass === "PRIMARY" && row.quality >= quality.thresholdMedium);

  const seniority = {
    left: pairRows[0]?.left.scope.seniorityTier,
    right: pairRows[0]?.right.scope.seniorityTier,
  };

  const audit = {
    precedenceOrder: precedence,
    qualitySource: "dualRespondentComparison.evidenceQualityLayer",
    fourFactorProduct: quality.productNote,
    insufficientCount: insufficient,
    rawAgreeCount,
    agreeCount,
    highAllBothLackComparablePrimary,
    highNotPrimaryBoth,
    genericPriority1,
    exact1bSpecialCondition,
    highResolvers: highs,
    genericContradictionEngineInvoked: false,
    pairRows,
  };

  for (const priority of precedence) {
    const row = precedenceRow(dual, priority);
    if (priority === "0a" || priority === "0b" || priority === "0c") continue;

    if (priority === "1") {
      if (genericPriority1 && !exact1bSpecialCondition) {
        return outcome(row, {
          routing: "coverage_insufficient",
          audit,
        });
      }
    }

    if (priority === "1b") {
      if (exact1bSpecialCondition) {
        return outcome(row, {
          routing: "practitioner_review",
          audit,
        });
      }
    }

    if (priority === "2") {
      if (input.outOfPairEvidence === true) {
        return outcome(row, {
          state: null,
          routing: "candidate_4b_practitioner_confirmation_required",
          audit: { ...audit, final4B: false },
        });
      }
    }

    if (priority === "3a") {
      if (
        isOneHighPair(candidatePair, oneHighPair)
        && discriminator?.diverge
        && discriminator.comparable
        && discriminator.quality >= quality.thresholdMedium
      ) {
        return outcome(row, {
          routing: "practitioner_review",
          audit,
        });
      }
    }

    if (priority === "3") {
      if (!isOneHighPair(candidatePair, oneHighPair) && highs.length > 0 && highDiverge.length === highs.length) {
        return outcome(row, {
          state: "④-A IRRESOLVABLE — within-pair divergence",
          routing: "blocked",
          contradictionCandidates: Object.freeze([{
            contradictionType: "cross_respondent_same_side",
            severity: "high",
            source: "dual_core_only",
          }]),
          audit,
        });
      }
    }

    if (priority === "4") {
      const splitTiers = new Set([seniority.left, seniority.right]);
      const triggers = pairRows.filter((item) => item.trigger && item.triggerQuality >= quality.thresholdMedium);
      if (
        splitTiers.has("senior")
        && splitTiers.has("line_level")
        && splitTiers.size === 2
        && triggers.length > 0
        && nonGovernanceAgree.length >= classification.state3NonGovernanceAgreeMin
      ) {
        return outcome(row, {
          state: "③ ROLE-LEVEL SPLIT",
          routing: "standard_analyst_review_queue",
          contradictionCandidates: Object.freeze([{
            contradictionType: "cross_respondent_same_side",
            severity: "medium",
            source: "dual_core_only",
          }]),
          audit,
        });
      }
    }

    if (priority === "5X") {
      if (input.coherenceAmbiguous === true && satisfiesState12AgreementCount(agreeCount, classification)) {
        return outcome(row, {
          routing: "analyst_practitioner_review",
          audit,
        });
      }
    }

    if (priority === "5A") {
      if (
        agreeCount >= classification.state1AgreeMin
        && highs.length > 0
        && highAgree.length === highs.length
        && agreeHighQuality.length >= classification.state1AgreeMin
      ) {
        return outcome(row, {
          state: "① CONVERGENT",
          routing: null,
          audit,
        });
      }
    }

    if (priority === "5B") {
      if (
        agreeCount >= classification.state2AgreeMin
        && agreeCount <= classification.state2AgreeMax
        && highAgree.length >= 1
        && agreePrimary.length >= classification.state2AgreeMin
      ) {
        return outcome(row, {
          state: "② PARTIAL CONVERGENCE",
          routing: null,
          audit,
        });
      }
    }
  }

  return Object.freeze({
    priority: null,
    outcomeClass: "routing_outcome",
    classificationOutcome: "ANALYST / PRACTITIONER REVIEW — no automatic state",
    state: null,
    routing: "analyst_practitioner_review",
    output: "Held pending review",
    contradictionCandidates: Object.freeze([]),
    audit: Object.freeze({ ...audit, unmatched: true }),
    genericContradictionEngineInvoked: false,
  });
}

export function createDualRespondentComparator(dualSheet) {
  const corpusConfig = buildDualRespondentCorpusConfig(dualSheet);
  const compare = (input = {}) => compareDualRespondentsWithConfig(input, corpusConfig);
  compare.corpusConfig = corpusConfig;
  return compare;
}

const DEFAULT_COMPARATOR = createDualRespondentComparator(DUAL);

export function compareDualRespondents(input = {}) {
  return DEFAULT_COMPARATOR(input);
}

export function dualQualityConfig() {
  return DEFAULT_COMPARATOR.corpusConfig.quality;
}

export function dualPrecedenceOrder() {
  return DEFAULT_COMPARATOR.corpusConfig.precedence;
}
