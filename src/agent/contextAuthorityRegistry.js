import canonicalSchema from "../generated/newlogic/canonicalSchema.json" with { type: "json" };
import narrativesAndFriction from "../generated/newlogic/narrativesAndFriction.json" with { type: "json" };
import questionnaires from "../generated/newlogic/questionnaires.json" with { type: "json" };
import reporting from "../generated/newlogic/reporting.json" with { type: "json" };
import scoringAndTriage from "../generated/newlogic/scoringAndTriage.json" with { type: "json" };
import sourceManifest from "../generated/newlogic/sourceManifest.json" with { type: "json" };

import {
  AUTHORITY_CLASSES,
  AUTHORITY_EXCLUSION_CLASSES,
} from "./agentContractConstants.js";

export const CORPUS_ARTIFACTS = Object.freeze({
  canonicalSchema,
  narrativesAndFriction,
  questionnaires,
  reporting,
  scoringAndTriage,
  sourceManifest,
});

export const SUPERSEDED_RAW_PREDICATES = Object.freeze([
  Object.freeze({
    id: "SP-1",
    branchCode: "P_1B",
    priority: "1b",
    corpusPath: "scoringAndTriage.dualRespondentComparison.classificationPrecedence[priority=1b].condition",
    contextItemId: "CI-BOUNDARY-PRED-P_1B",
    templateId: "T-BP-1B",
    sourceRef: "mref://scoringAndTriage/dualRespondentComparison/classificationPrecedence/priority=1b",
    supersededBy: "Owner-controlled exact 1b predicate decision + CORR2 §2",
  }),
]);

export const XP1 = Object.freeze({
  id: "XP-1",
  corpusPath: "narrativesAndFriction.friction.derivationMethod[sourceRow=9].cells.3",
  mref: "mref://narrativesAndFriction/friction/derivationMethod/sourceRow=9/cells/3",
});

export const SR04_EDGE_CASE_SOURCE_ROWS = Object.freeze({
  P_5X: Object.freeze([5]),
  P_1: Object.freeze([10, 14]),
  P_1B: Object.freeze([12]),
  P_2: Object.freeze([9]),
  P_3A: Object.freeze([7]),
  UNMATCHED: Object.freeze([5]),
});

const EXCLUDED_PREFIXES = Object.freeze([
  Object.freeze({ prefix: "mref://narrativesAndFriction/narratives/freeTierNarratives", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
  Object.freeze({ prefix: "mref://narratives/freeTierNarratives", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
  Object.freeze({ prefix: "mref://scoringAndTriage/triage/practitionerEscalation", cls: "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING" }),
  Object.freeze({ prefix: "mref://scoringAndTriage/triage/decisionTree", cls: "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING" }),
  Object.freeze({ prefix: "mref://scoringAndTriage/triage/contradictionTiers", cls: "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING" }),
  Object.freeze({ prefix: "mref://predictionLedger", cls: "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING" }),
  Object.freeze({ prefix: "mref://reporting/reportTemplate/sectionSheets", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
  Object.freeze({ prefix: "mref://reporting/step3Screens", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
  Object.freeze({ prefix: "mref://reporting/clientJourney", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
  Object.freeze({ prefix: "mref://formBindings", cls: "PRESENTATION_ONLY_NOT_AUTHORITY" }),
]);

export function classifyContextRef(contextRef) {
  const ref = String(contextRef ?? "");
  for (const row of EXCLUDED_PREFIXES) {
    if (ref.startsWith(row.prefix)) return row.cls;
  }
  if (ref.includes("/contradictionOutput/") && /\/routing$/.test(ref)) {
    return "NOT_ADMISSIBLE_FOR_AGENT_GROUNDING";
  }
  if (ref.includes("/friction/derivationMethod/") && /sourceRow=9/.test(ref)) {
    return "EXTRAPOLATION_LICENCE_EXCLUDED";
  }
  if (ref.includes("/friction/derivationMethod/") && /sourceRow=[1-4](\/|$)/.test(ref)) {
    return "NOT_SELECTED";
  }
  if (ref.startsWith("mref://sourceManifest/environmentAliases")) return "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT";
  if (ref.startsWith("mref://reporting/reportTemplate/buyerFacingAliases")) return "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT";
  if (ref.startsWith("mref://narrativesAndFriction/narratives/implementationGuideRows")) return "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT";
  if (ref.startsWith("mref://questionnaires/")) return "ACCEPTED_PRODUCT_INTERPRETATION_CONTEXT";
  if (ref.startsWith("mref://narrativesAndFriction/friction/frictionLookup")) return "CONDITIONAL_CONTEXT";
  if (ref.startsWith("mref://narrativesAndFriction/friction/ecsMatrix")) return "CONDITIONAL_CONTEXT";
  if (ref.startsWith("mref://scoringAndTriage/") || ref.startsWith("mref://canonicalSchema/") || ref.startsWith("mref://narrativesAndFriction/friction/")) {
    return "ACCEPTED_METHODOLOGY_CONTEXT";
  }
  return "NOT_SELECTED";
}

export function isSelectableAuthority(authorityClass) {
  return AUTHORITY_CLASSES.includes(authorityClass) && !AUTHORITY_EXCLUSION_CLASSES.includes(authorityClass);
}

export function precedenceRawCondition(priority) {
  const row = (scoringAndTriage.dualRespondentComparison.classificationPrecedence ?? [])
    .find((item) => String(item.priority) === String(priority));
  return row?.condition ?? null;
}

export function buildTbp1bContent({ oneHighPair, oneHighDiscriminatorQuestion }) {
  const pair = String(oneHighPair ?? "").trim();
  const question = String(oneHighDiscriminatorQuestion ?? "").trim();
  return [
    `The canonical one-HIGH pair for this instrument is ${pair} (corpus-derived, normalized).`,
    `The discriminator question is ${question} (corpus-derived).`,
    "1b fires only if both discriminator observations have semanticClass = OBSERVATION_GAP (answer option F).",
    "Established result: \"NF/SFP determination impossible\".",
    "Pair evaluation is suppressed; no comparable pair result is emitted.",
    "Prohibited fallback is active: no automatic EDv2 fallback.",
    `${question} E is SUBSTANTIVE_SIGNAL, not an abstention.`,
  ].join("\n");
}

export function sr12MarkerText(markerId, directedPair) {
  if (markerId === "DIRECT_FRICTION_CONTEXT_UNAVAILABLE") {
    return `Direct friction-point context for pair ${directedPair} is absent from the accepted friction lookup table. Friction-description context is not supplied, and no substitute exists.`;
  }
  if (markerId === "REVERSE_DIRECTION_EXTRAPOLATION_PROHIBITED") {
    return "Deriving friction behavior for this pair by reverse-direction logic from adjacent pairs is prohibited. No friction claim derived from such extrapolation may be made.";
  }
  return null;
}

function parseSegment(segment) {
  const eq = segment.indexOf("=");
  if (eq === -1) return { kind: "key", key: segment };
  return { kind: "find", field: segment.slice(0, eq), value: segment.slice(eq + 1) };
}

export function resolveCorpusMref(contextRef) {
  if (typeof contextRef !== "string" || !contextRef.startsWith("mref://")) return undefined;
  const parts = contextRef.slice("mref://".length).split("/").filter(Boolean);
  if (parts.length === 0) return undefined;
  let node = CORPUS_ARTIFACTS[parts[0]];
  for (let index = 1; index < parts.length; index += 1) {
    if (node == null) return undefined;
    const segment = parseSegment(decodeURIComponent(parts[index]));
    if (segment.kind === "find") {
      if (!Array.isArray(node)) return undefined;
      const filters = [segment];
      while (index + 1 < parts.length) {
        const next = parseSegment(decodeURIComponent(parts[index + 1]));
        if (next.kind !== "find") break;
        filters.push(next);
        index += 1;
      }
      node = node.find((row) => (
        row != null
        && filters.every((filter) => String(row[filter.field]) === filter.value)
      ));
      continue;
    }
    if (Array.isArray(node)) {
      const asNumber = Number(segment.key);
      if (Number.isInteger(asNumber) && String(asNumber) === segment.key) {
        node = node[asNumber];
        continue;
      }
      return undefined;
    }
    if (node != null && typeof node === "object" && Object.hasOwn(node, segment.key)) {
      node = node[segment.key];
      continue;
    }
    return undefined;
  }
  return node;
}

export function findQuestionnaireQuestion(moduleId, questionRef) {
  const module = (questionnaires.modules ?? []).find((row) => row.id === moduleId);
  if (!module) return null;
  return (module.questions ?? []).find((row) => row.workbookQuestionId === questionRef) ?? null;
}

export function environmentCodesFromPair(normalizedPair) {
  const parts = String(normalizedPair ?? "").split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean);
  return parts.length === 2 ? parts : [];
}
