import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };

// C5-A respondent context vocabulary bridge.
//
// Maps production respondent metadata onto the corpus-authoritative seniority
// vocabulary consumed by resolveObservationScope. Authority basis:
// dualRespondentComparison.seniorityTierMapping (DR-B2; ST_Canonical_Schema.xlsx
// v1.1 8_Respondent_Record). The bridge never extends the corpus vocabulary,
// never mutates corpus data, and exposes no fallback tier: a product value that
// cannot be mapped lawfully stays unresolved (fail closed).
//
// Respondent role is preserved as real provenance only: roleQuestionOverride is
// empty and no canonical role has an active scoring/scope effect in the corpus,
// so no product-to-canonical role mapping is fabricated here. The only corpus
// roleCode with an active effect is the "unspecified" sentinel, which this
// bridge never produces from a real product role.

export class RespondentContextBridgeConfigurationError extends Error {
  constructor(problems) {
    super(`RespondentContextBridgeConfigurationError | ${problems.join(" ; ")}`);
    this.name = "RespondentContextBridgeConfigurationError";
    this.problems = Object.freeze([...problems]);
  }
}

// canonicalTokens lists every corpus seniority token semantically represented by
// the product label. All of them must resolve to the same canonical tier; a
// cross-tier entry is a configuration error (ambiguous), never a silent choice.
// canonicalSeniorityLevel is the deterministic representative token used for
// observation-scope resolution; within one tier the corpus vantage depends only
// on the tier, so the representative cannot change any resolved outcome.
export const PRODUCT_SENIORITY_CANONICAL_MAP = Object.freeze({
  board_investment_committee: Object.freeze({
    canonicalTokens: Object.freeze(["c_suite"]),
    canonicalSeniorityLevel: "c_suite",
    canonicalSeniorityTier: "senior",
  }),
  c_suite_founder: Object.freeze({
    canonicalTokens: Object.freeze(["c_suite"]),
    canonicalSeniorityLevel: "c_suite",
    canonicalSeniorityTier: "senior",
  }),
  executive_partner_md: Object.freeze({
    canonicalTokens: Object.freeze(["c_suite", "director"]),
    canonicalSeniorityLevel: "c_suite",
    canonicalSeniorityTier: "senior",
  }),
  vp_director_senior_leader: Object.freeze({
    canonicalTokens: Object.freeze(["vp", "director"]),
    canonicalSeniorityLevel: "vp",
    canonicalSeniorityTier: "senior",
  }),
  manager_functional_lead: Object.freeze({
    canonicalTokens: Object.freeze(["manager"]),
    canonicalSeniorityLevel: "manager",
    canonicalSeniorityTier: "line_level",
  }),
  senior_ic_key_person: Object.freeze({
    canonicalTokens: Object.freeze(["ic"]),
    canonicalSeniorityLevel: "ic",
    canonicalSeniorityTier: "line_level",
  }),
  external_advisor: Object.freeze({
    canonicalTokens: Object.freeze(["external"]),
    canonicalSeniorityLevel: "external",
    canonicalSeniorityTier: "external",
  }),
});

function corpusSeniorityTokenTiers(dualSheet) {
  const dual = dualSheet ?? scoringAndTriage.dualRespondentComparison;
  const tokenTiers = new Map();
  for (const row of dual?.seniorityTierMapping ?? []) {
    const tier = String(row.seniorityTier ?? "").trim();
    for (const token of String(row.respondentSenioritylevelValues ?? "").split(",")) {
      const value = token.trim();
      if (value) tokenTiers.set(value, tier);
    }
  }
  return tokenTiers;
}

// Distinguishes configuration-level ambiguity (a product value whose represented
// corpus tokens span more than one tier) from input-level unsupported values.
export function validateRespondentContextBridgeAlignment(dualSheet) {
  const tokenTiers = corpusSeniorityTokenTiers(dualSheet);
  const problems = [];
  if (tokenTiers.size === 0) {
    problems.push("corpus seniorityTierMapping missing or empty");
  }
  for (const [productValue, mapping] of Object.entries(PRODUCT_SENIORITY_CANONICAL_MAP)) {
    const tiers = new Set();
    for (const token of mapping.canonicalTokens) {
      const tier = tokenTiers.get(token);
      if (!tier) {
        problems.push(`${productValue}: canonical token ${JSON.stringify(token)} absent from corpus seniority vocabulary`);
        continue;
      }
      tiers.add(tier);
      if (tier !== mapping.canonicalSeniorityTier) {
        problems.push(`${productValue}: token ${JSON.stringify(token)} resolves to corpus tier ${JSON.stringify(tier)}, bridge declares ${JSON.stringify(mapping.canonicalSeniorityTier)}`);
      }
    }
    if (!tokenTiers.has(mapping.canonicalSeniorityLevel)) {
      problems.push(`${productValue}: representative token ${JSON.stringify(mapping.canonicalSeniorityLevel)} absent from corpus seniority vocabulary`);
    }
    if (tiers.size > 1) {
      problems.push(`${productValue}: represented canonical tokens span multiple corpus tiers ${[...tiers].join("|")} — ambiguous cross-tier map`);
    }
  }
  if (problems.length > 0) {
    throw new RespondentContextBridgeConfigurationError(problems);
  }
  return Object.freeze({
    ok: true,
    productValues: Object.freeze(Object.keys(PRODUCT_SENIORITY_CANONICAL_MAP)),
    corpusSeniorityTokens: Object.freeze([...tokenTiers.keys()]),
  });
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function unsupported(reason, productSeniority, productRole) {
  return Object.freeze({
    status: "unsupported",
    reason,
    productSeniority,
    productRole,
    respondent: null,
  });
}

// Pure deterministic product→canonical respondent-context resolver.
// Inputs are production respondent metadata values; output either carries the
// canonical seniority token/tier for resolveObservationScope (respondent.roleCode
// preserves the real product role as provenance) or fails closed with an
// explicit unsupported reason. Unknown values are never silently normalized and
// no fallback tier exists.
export function resolveCanonicalRespondentContext({ respondentSeniority, respondentRole } = {}) {
  const productSeniority = text(respondentSeniority);
  const productRole = respondentRole == null ? null : text(respondentRole) || null;

  if (!productSeniority) {
    return unsupported("missing_seniority", productSeniority, productRole);
  }
  // Own-property lookup only: prototype-chain keys (constructor, toString,
  // valueOf, hasOwnProperty, __proto__, ...) must never resolve.
  const mapping = Object.hasOwn(PRODUCT_SENIORITY_CANONICAL_MAP, productSeniority)
    ? PRODUCT_SENIORITY_CANONICAL_MAP[productSeniority]
    : undefined;
  if (!mapping) {
    return unsupported("unknown_seniority", productSeniority, productRole);
  }

  return Object.freeze({
    status: "resolved",
    productSeniority,
    productRole,
    canonicalSeniorityLevel: mapping.canonicalSeniorityLevel,
    canonicalSeniorityTier: mapping.canonicalSeniorityTier,
    roleCode: productRole,
    respondent: Object.freeze({
      roleCode: productRole,
      seniorityLevel: mapping.canonicalSeniorityLevel,
    }),
  });
}

validateRespondentContextBridgeAlignment();
