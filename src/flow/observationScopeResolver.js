import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };

const DUAL = scoringAndTriage.dualRespondentComparison;
const AUTHORIZED_DUAL_MODULES = Object.freeze(["acquirerEnvironment", "targetSelfAssessment"]);
const QUESTIONS = Object.freeze(Array.from({ length: 11 }, (_, index) => `Q${index + 1}`));
const USE_CLASSES = Object.freeze(["PRIMARY", "CONTEXTUAL", "INELIGIBLE", "UNRESOLVED"]);
const USE_CLASS_RANK = Object.freeze({
  PRIMARY: 4,
  CONTEXTUAL: 3,
  INELIGIBLE: 2,
  UNRESOLVED: 1,
});

export class ObservationScopeCorpusConfigurationError extends Error {
  constructor({ section, expected, source, detail } = {}) {
    const parts = [
      "ObservationScopeCorpusConfigurationError",
      section ? `section=${section}` : null,
      expected ? `expected=${expected}` : null,
      source ? `source=${source}` : null,
      detail ? `detail=${detail}` : null,
    ].filter(Boolean);
    super(parts.join(" | "));
    this.name = "ObservationScopeCorpusConfigurationError";
    this.section = section ?? null;
    this.expected = expected ?? null;
    this.source = source ?? null;
    this.detail = detail ?? null;
  }
}

function text(value) {
  return String(value ?? "").trim();
}

function configFail({ section, expected, source, detail }) {
  throw new ObservationScopeCorpusConfigurationError({ section, expected, source, detail });
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

function requireNonEmptyArray(value, { section, expected, source }) {
  if (!Array.isArray(value) || value.length === 0) {
    configFail({
      section,
      expected,
      source,
      detail: Array.isArray(value) ? "empty" : "missing",
    });
  }
  return value;
}

function uniqueIndex(rows, keyFn, { section, source }) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key || key.startsWith("|") || key.endsWith("|") || key.includes("||")) {
      configFail({
        section,
        expected: "complete unique mapping key",
        source,
        detail: `invalid key ${JSON.stringify(key)}`,
      });
    }
    if (map.has(key)) {
      configFail({
        section,
        expected: "unique canonical mapping",
        source,
        detail: `duplicate ${key}`,
      });
    }
    map.set(key, row);
  }
  return map;
}

function requireUseClass(value, { section, source }) {
  const useClass = text(value);
  if (!USE_CLASSES.includes(useClass)) {
    configFail({
      section,
      expected: `UseClass in ${USE_CLASSES.join("|")}`,
      source,
      detail: `got ${JSON.stringify(value)}`,
    });
  }
  return useClass;
}

function requireSeniorityMapping(dual) {
  const rows = requireNonEmptyArray(dual.seniorityTierMapping, {
    section: "seniorityTierMapping",
    expected: "non-empty seniorityTierMapping",
    source: "dualRespondentComparison.seniorityTierMapping",
  });
  const byTier = new Map();
  const byValue = new Map();
  for (const row of rows) {
    const tier = text(row.seniorityTier);
    const definition = text(row.definition);
    const values = text(row.respondentSenioritylevelValues)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!tier) {
      configFail({
        section: "seniorityTierMapping",
        expected: "seniorityTier on every row",
        source: "dualRespondentComparison.seniorityTierMapping",
        detail: "missing seniorityTier",
      });
    }
    if (byTier.has(tier)) {
      configFail({
        section: "seniorityTierMapping",
        expected: "unique seniorityTier",
        source: "dualRespondentComparison.seniorityTierMapping",
        detail: `duplicate ${tier}`,
      });
    }
    if (!definition) {
      configFail({
        section: "seniorityTierMapping",
        expected: "non-empty tier definition",
        source: "dualRespondentComparison.seniorityTierMapping",
        detail: `missing definition for ${tier}`,
      });
    }
    if (!values.length) {
      configFail({
        section: "seniorityTierMapping",
        expected: "non-empty respondentSenioritylevelValues",
        source: "dualRespondentComparison.seniorityTierMapping",
        detail: `missing values for ${tier}`,
      });
    }
    byTier.set(tier, { seniorityTier: tier, definition, values: Object.freeze(values), row });
    for (const value of values) {
      if (byValue.has(value)) {
        configFail({
          section: "seniorityTierMapping",
          expected: "unique seniorityLevel token across tiers",
          source: "dualRespondentComparison.seniorityTierMapping",
          detail: `duplicate value ${value}`,
        });
      }
      byValue.set(value, {
        seniorityTier: tier,
        expectedVantage: definition,
      });
    }
  }
  return Object.freeze({
    byTier,
    byValue,
    tiers: Object.freeze([...byTier.keys()]),
  });
}

function requireQuestionTierVantage(dual, seniority) {
  const rows = requireNonEmptyArray(dual.questionTierVantage, {
    section: "questionTierVantage",
    expected: "non-empty questionTierVantage",
    source: "dualRespondentComparison.questionTierVantage",
  });
  const byKey = uniqueIndex(
    rows,
    (row) => `${text(row.questionref)}|${text(row.senioritytier)}`,
    {
      section: "questionTierVantage",
      source: "dualRespondentComparison.questionTierVantage",
    },
  );
  const vantageByTier = new Map();
  for (const row of rows) {
    const questionRef = text(row.questionref);
    const tier = text(row.senioritytier);
    const expectedVantage = text(row.expectedvantage);
    if (!/^Q(?:1[01]|[1-9])$/.test(questionRef)) {
      configFail({
        section: "questionTierVantage",
        expected: "questionref Q1–Q11",
        source: "dualRespondentComparison.questionTierVantage",
        detail: `got ${JSON.stringify(row.questionref)}`,
      });
    }
    const tierRow = seniority.byTier.get(tier);
    if (!tierRow) {
      configFail({
        section: "questionTierVantage",
        expected: "senioritytier present in seniorityTierMapping",
        source: "dualRespondentComparison.questionTierVantage",
        detail: `unknown tier ${JSON.stringify(row.senioritytier)}`,
      });
    }
    if (!expectedVantage) {
      configFail({
        section: "questionTierVantage",
        expected: "non-empty expectedvantage",
        source: "dualRespondentComparison.questionTierVantage",
        detail: `empty expectedvantage for ${questionRef}|${tier}`,
      });
    }
    const vantageForTier = vantageByTier.get(tier);
    if (vantageForTier && vantageForTier !== expectedVantage) {
      configFail({
        section: "questionTierVantage",
        expected: "one expectedvantage vocabulary per senioritytier",
        source: "dualRespondentComparison.questionTierVantage",
        detail: `${tier} has ${JSON.stringify(vantageForTier)} and ${JSON.stringify(expectedVantage)}`,
      });
    }
    vantageByTier.set(tier, expectedVantage);
    requireUseClass(row.defaultuseclass, {
      section: "questionTierVantage.defaultuseclass",
      source: "dualRespondentComparison.questionTierVantage",
    });
  }
  for (const questionRef of QUESTIONS) {
    for (const tier of seniority.tiers) {
      const key = `${questionRef}|${tier}`;
      if (!byKey.has(key)) {
        configFail({
          section: "questionTierVantage",
          expected: "vantage mapping for every Dual question × seniority tier",
          source: "dualRespondentComparison.questionTierVantage",
          detail: `missing ${key}`,
        });
      }
    }
  }
  return byKey;
}

function requireOptionSemantics(dual) {
  const rows = requireNonEmptyArray(dual.questionOptionSemantics, {
    section: "questionOptionSemantics",
    expected: "non-empty questionOptionSemantics",
    source: "dualRespondentComparison.questionOptionSemantics",
  });
  const byKey = uniqueIndex(
    rows,
    (row) => `${text(row.questionref)}|${text(row.optioncode)}`,
    {
      section: "questionOptionSemantics",
      source: "dualRespondentComparison.questionOptionSemantics",
    },
  );
  for (const row of rows) {
    if (!/^Q(?:1[01]|[1-9])$/.test(text(row.questionref))) {
      configFail({
        section: "questionOptionSemantics",
        expected: "questionref Q1–Q11",
        source: "dualRespondentComparison.questionOptionSemantics",
        detail: `got ${JSON.stringify(row.questionref)}`,
      });
    }
    if (!text(row.optioncode)) {
      configFail({
        section: "questionOptionSemantics",
        expected: "non-empty optioncode",
        source: "dualRespondentComparison.questionOptionSemantics",
        detail: "missing optioncode",
      });
    }
    if (!text(row.semanticclass)) {
      configFail({
        section: "questionOptionSemantics",
        expected: "non-empty semanticclass",
        source: "dualRespondentComparison.questionOptionSemantics",
        detail: `${row.questionref}|${row.optioncode}`,
      });
    }
  }
  return byKey;
}

function requireSemanticEffects(dual, optionSemantics) {
  const rows = requireNonEmptyArray(dual.semanticClassEffects, {
    section: "semanticClassEffects",
    expected: "non-empty semanticClassEffects",
    source: "dualRespondentComparison.semanticClassEffects",
  });
  const byClass = uniqueIndex(
    rows,
    (row) => text(row.semanticclass),
    {
      section: "semanticClassEffects",
      source: "dualRespondentComparison.semanticClassEffects",
    },
  );
  for (const row of optionSemantics.values()) {
    const semanticClass = text(row.semanticclass);
    if (!byClass.has(semanticClass)) {
      configFail({
        section: "semanticClassEffects",
        expected: "effect row for every option semanticclass",
        source: "dualRespondentComparison.semanticClassEffects",
        detail: `missing ${semanticClass}`,
      });
    }
  }
  return byClass;
}

function requireAccessCeilings(dual) {
  const rows = requireNonEmptyArray(dual.actualAccessCeiling, {
    section: "actualAccessCeiling",
    expected: "non-empty actualAccessCeiling",
    source: "dualRespondentComparison.actualAccessCeiling",
  });
  uniqueIndex(
    rows,
    (row) => `${text(row.signal)}|${text(row.value)}`,
    {
      section: "actualAccessCeiling",
      source: "dualRespondentComparison.actualAccessCeiling",
    },
  );
  for (const row of rows) {
    if (!text(row.signal) || !text(row.value)) {
      configFail({
        section: "actualAccessCeiling",
        expected: "signal and value on every ceiling rule",
        source: "dualRespondentComparison.actualAccessCeiling",
        detail: "missing signal or value",
      });
    }
    const ceiling = text(row.useclassceiling);
    if (!ceiling.startsWith("n/a") && !USE_CLASSES.includes(ceiling)) {
      configFail({
        section: "actualAccessCeiling",
        expected: "useclassceiling UseClass or n/a",
        source: "dualRespondentComparison.actualAccessCeiling",
        detail: `got ${JSON.stringify(row.useclassceiling)}`,
      });
    }
  }
  return Object.freeze([...rows]);
}

function requireOverrides(dual) {
  const rows = dual.roleQuestionOverride;
  if (rows == null) return new Map();
  if (!Array.isArray(rows)) {
    configFail({
      section: "roleQuestionOverride",
      expected: "array of override rows",
      source: "dualRespondentComparison.roleQuestionOverride",
      detail: "malformed",
    });
  }
  const byKey = uniqueIndex(
    rows,
    (row) => `${text(row.roleCode)}|${text(row.questionRef ?? row.questionref)}`,
    {
      section: "roleQuestionOverride",
      source: "dualRespondentComparison.roleQuestionOverride",
    },
  );
  for (const row of rows) {
    const cap = row.useClassCap || row.useclasscap;
    if (cap) {
      requireUseClass(cap, {
        section: "roleQuestionOverride",
        source: "dualRespondentComparison.roleQuestionOverride",
      });
    }
  }
  return byKey;
}

export function buildObservationScopeCorpusConfig(dualSheet) {
  const dual = requireSheet(dualSheet);
  const seniority = requireSeniorityMapping(dual);
  const vantageByKey = requireQuestionTierVantage(dual, seniority);
  const optionSemantics = requireOptionSemantics(dual);
  const semanticEffects = requireSemanticEffects(dual, optionSemantics);
  const actualAccessCeiling = requireAccessCeilings(dual);
  const overrideByKey = requireOverrides(dual);
  return Object.freeze({
    dual,
    seniority,
    vantageByKey,
    optionSemantics,
    semanticEffects,
    actualAccessCeiling,
    overrideByKey,
  });
}

function semanticClassEffectFromRow(effect) {
  if (!effect) return null;
  return Object.freeze({
    useClassEffect: effect.useclasseffect ?? null,
    signalEffect: effect.signaleffect ?? null,
    coverageEffect: effect.coverageeffect ?? null,
    rootCauseFamily: effect.rootcausefamily ?? null,
  });
}

function unresolved(base, reason) {
  return Object.freeze({
    ...base,
    seniorityTier: base.seniorityTier ?? null,
    expectedVantage: base.expectedVantage ?? null,
    useClass: "UNRESOLVED",
    semanticClass: base.semanticClass ?? null,
    semanticClassEffect: base.semanticClassEffect ?? null,
    comparisonEligible: false,
    comparisonAvailability: "unavailable",
    rootCauseFamily: base.rootCauseFamily ?? "practitioner access review",
    routing: "practitioner_access_review",
    audit: Object.freeze({
      ...(base.audit ?? {}),
      unresolvedReason: reason,
    }),
    causalDisposition: base.causalDisposition ?? null,
  });
}

function applyCeiling(current, ceiling) {
  if (!ceiling || ceiling.startsWith("n/a")) return current;
  const currentRank = USE_CLASS_RANK[current] ?? USE_CLASS_RANK.PRIMARY;
  const ceilingRank = USE_CLASS_RANK[ceiling];
  if (!ceilingRank) return current;
  return ceilingRank < currentRank ? ceiling : current;
}

function isSubstantiveOption(optionCode, semanticClass) {
  if (!optionCode) return false;
  if (semanticClass === "SUBSTANTIVE_SIGNAL") return true;
  if (["OBSERVATION_GAP", "EVENT_ABSENCE", "STRUCTURAL_PRECONDITION_ABSENCE", "AMBIGUOUS_COLLAPSE"].includes(semanticClass)) {
    return false;
  }
  return /^[A-D]$/.test(optionCode);
}

function comparisonFromSemanticClass(semanticClass, semanticEffects) {
  const effect = semanticEffects.get(text(semanticClass));
  if (!effect) return { comparisonAvailability: "available", comparisonEligible: true, semanticClassEffect: null };
  const unavailable = String(effect.useclasseffect ?? "").includes("unavailable")
    || String(effect.coverageeffect ?? "").includes("excluded")
    || semanticClass === "OBSERVATION_GAP"
    || semanticClass === "EVENT_ABSENCE"
    || semanticClass === "STRUCTURAL_PRECONDITION_ABSENCE"
    || semanticClass === "AMBIGUOUS_COLLAPSE";
  return {
    comparisonAvailability: unavailable ? "unavailable" : "available",
    comparisonEligible: !unavailable,
    rootCauseFamily: effect.rootcausefamily || null,
    semanticClassEffect: semanticClassEffectFromRow(effect),
  };
}

function resolveWithConfig(input, config) {
  const moduleId = text(input.moduleId);
  const workbookQuestionId = text(input.workbookQuestionId);
  const canonicalQuestionId = text(input.canonicalQuestionId);
  const selectedOption = text(input.selectedOption);
  const roleCode = text(input.respondent?.roleCode ?? input.roleCode);
  const seniorityLevel = text(input.respondent?.seniorityLevel ?? input.seniorityLevel);
  const directObservationGate = text(input.directObservationGate);
  const evidenceType = text(input.evidenceType);
  const reliabilityFlags = Object.freeze([...(input.reliabilityFlags ?? [])]);

  const base = {
    moduleId: moduleId || null,
    canonicalQuestionId: canonicalQuestionId || null,
    workbookQuestionId: workbookQuestionId || null,
    questionRef: null,
    seniorityTier: null,
    expectedVantage: null,
    useClass: "PRIMARY",
    semanticClass: null,
    semanticClassEffect: null,
    comparisonEligible: true,
    comparisonAvailability: "available",
    rootCauseFamily: null,
    routing: null,
    audit: Object.freeze({
      evidenceType: evidenceType || null,
      directObservationGate: directObservationGate || null,
      reliabilityFlags,
    }),
    causalDisposition: null,
  };

  if (!moduleId || !AUTHORIZED_DUAL_MODULES.includes(moduleId)) {
    return unresolved(base, moduleId ? "unsupported_module" : "missing_module");
  }

  const questionRef = workbookQuestionId || (canonicalQuestionId.includes("-")
    ? canonicalQuestionId.slice(canonicalQuestionId.lastIndexOf("-") + 1)
    : "");
  if (!/^Q([1-9]|1[01])$/.test(questionRef)) {
    return unresolved({ ...base, questionRef: questionRef || null }, "unsupported_or_missing_question");
  }

  const resolved = {
    ...base,
    questionRef,
    workbookQuestionId: questionRef,
  };

  if (roleCode === "unspecified") {
    return unresolved({
      ...resolved,
      rootCauseFamily: "practitioner access review",
    }, "roleCode_unspecified");
  }

  const seniority = config.seniority.byValue.get(seniorityLevel);
  if (!seniority) {
    return unresolved(resolved, "unknown_seniority");
  }

  const vantage = config.vantageByKey.get(`${questionRef}|${seniority.seniorityTier}`);
  if (!vantage) {
    configFail({
      section: "questionTierVantage",
      expected: `vantage mapping for ${questionRef}|${seniority.seniorityTier}`,
      source: "dualRespondentComparison.questionTierVantage",
      detail: "required mapping missing at resolve",
    });
  }

  let useClass = requireUseClass(vantage.defaultuseclass, {
    section: "questionTierVantage.defaultuseclass",
    source: "dualRespondentComparison.questionTierVantage",
  });
  const expectedVantage = text(vantage.expectedvantage);
  const override = config.overrideByKey.get(`${roleCode}|${questionRef}`);
  if (override?.useClassCap || override?.useclasscap) {
    useClass = applyCeiling(useClass, text(override.useClassCap || override.useclasscap));
  }

  const optionRow = config.optionSemantics.get(`${questionRef}|${selectedOption}`);
  const semanticClass = optionRow ? text(optionRow.semanticclass) : null;
  const semantic = comparisonFromSemanticClass(semanticClass, config.semanticEffects);
  if (semanticClass === "SUBSTANTIVE_SIGNAL") {
    // keep vantage UseClass
  }

  let comparisonAvailability = semantic.comparisonAvailability;
  let comparisonEligible = semantic.comparisonEligible;
  let rootCauseFamily = semantic.rootCauseFamily;
  let routing = useClass === "UNRESOLVED" ? "practitioner_access_review" : null;

  for (const rule of config.actualAccessCeiling) {
    const signal = text(rule.signal);
    const value = text(rule.value);
    const ceiling = text(rule.useclassceiling);
    if (signal === "directObservationGate" && value.startsWith("no") && directObservationGate === "no"
      && isSubstantiveOption(selectedOption, semanticClass)) {
      useClass = applyCeiling(useClass, ceiling);
      rootCauseFamily = rule.rootcausefamily || rootCauseFamily;
    }
    if (signal === "evidenceType" && value === "hypothetical" && evidenceType === "hypothetical") {
      useClass = applyCeiling(useClass, ceiling);
      rootCauseFamily = rule.rootcausefamily || rootCauseFamily;
    }
    if (signal === "evidenceType" && value === "unknown" && evidenceType === "unknown") {
      comparisonAvailability = "unavailable";
      comparisonEligible = false;
      rootCauseFamily = rule.rootcausefamily || rootCauseFamily;
    }
    if (signal === "roleCode" && value === "unspecified" && roleCode === "unspecified") {
      useClass = "UNRESOLVED";
      routing = "practitioner_access_review";
      rootCauseFamily = rule.rootcausefamily || rootCauseFamily;
    }
  }

  if (useClass === "UNRESOLVED") {
    routing = "practitioner_access_review";
    comparisonEligible = false;
    comparisonAvailability = "unavailable";
  }

  const accessAdjudicated = useClass !== "PRIMARY"
    || comparisonAvailability === "unavailable";

  return Object.freeze({
    moduleId,
    canonicalQuestionId: canonicalQuestionId || null,
    workbookQuestionId: questionRef,
    questionRef,
    seniorityTier: seniority.seniorityTier,
    expectedVantage,
    useClass,
    semanticClass,
    semanticClassEffect: semantic.semanticClassEffect ?? null,
    comparisonEligible,
    comparisonAvailability,
    rootCauseFamily,
    routing,
    audit: Object.freeze({
      evidenceType: evidenceType || null,
      directObservationGate: directObservationGate || null,
      reliabilityFlags,
      optionCode: selectedOption || null,
      accessAdjudicated,
    }),
    causalDisposition: null,
  });
}

export function createObservationScopeResolver(dualSheet) {
  const corpusConfig = buildObservationScopeCorpusConfig(dualSheet);
  const resolve = (input = {}) => resolveWithConfig(input, corpusConfig);
  resolve.corpusConfig = corpusConfig;
  return resolve;
}

const DEFAULT_RESOLVER = createObservationScopeResolver(DUAL);

export function resolveObservationScope(input = {}) {
  return DEFAULT_RESOLVER(input);
}

export function isAuthorizedDualModule(moduleId) {
  return AUTHORIZED_DUAL_MODULES.includes(text(moduleId));
}
