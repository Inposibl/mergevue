import {
  MERGEVUE_CANONICAL_PUBLIC_REPORT_SCHEMA_VERSION,
  MERGEVUE_CANONICAL_PUBLIC_REPORT_VERSION,
  MERGEVUE_PUBLIC_REPORT_AVAILABILITY_STATES,
  MERGEVUE_PUBLIC_REPORT_BLOCK_REGISTRY,
  MERGEVUE_PUBLIC_REPORT_BLOCKS,
  MERGEVUE_PUBLIC_REPORT_EVIDENCE_CHANNELS,
  MERGEVUE_PUBLIC_REPORT_SOURCE_MODE_LEVEL1_MODE_D_SLICE1,
} from "../reporting/mergevueCanonicalPublicReportRegistry.js";

export const PUBLIC_REPORT_RESPONSE_FIELD = "publicReport";
export const PROJECTION_FAILED = "level1-public-report-projection-failed";

const COVERAGE_COMPLETE = "COMPLETE_WITHIN_BOUND";
const COVERAGE_PARTIAL = "PARTIAL";
const COVERAGE_SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE";
const GAP_ESTABLISHED = "ESTABLISHED_WITHIN_BOUND";
const GAP_NOT_ESTABLISHED = "NOT_ESTABLISHED_WITHIN_BOUND";
const RECORD_CLASSES = Object.freeze(["RC1", "RC2", "RC3", "RC4", "RC5"]);
const SIDES = Object.freeze(["acquirer", "target"] as const);

const PUBLIC_RECORD_CLASS_LABELS: Record<string, string> = Object.freeze({
  RC1: "business-combination registration/solicitation records",
  RC2: "current event-disclosure records with structured item codes",
  RC3: "annual periodic records",
  RC4: "quarterly periodic records",
  RC5: "proxy/solicitation records",
});

const INSUFFICIENT_REASON =
  "Level-1 Mode-D public evidence does not support this canonical block. The block remains present in canonical order and is not populated from filing metadata, questionnaire logic, or legacy analytical outputs.";

const BLOCK9_NOT_APPLICABLE_REASON =
  "The accepted Mode-D evidence-channel mapping does not authorize an evidence-acquisition step for the current Level-1 conditions.";

const FULL_ENGAGEMENT_SEPARATOR =
  "This Level-1 public result did not calculate Environment types, compatibility scores, friction forecasts, economic predictions, or role-level outputs.";

const FULL_ENGAGEMENT_BENEFITS = Object.freeze([
  "The paid workflow is designed to reduce guesswork by decomposing ECS drivers, reviewing environment coding against available artifacts, and converting watchpoints into role-level integration controls.",
  "1. ARTIFACT-REVIEWED ENVIRONMENT CODING. The paid workflow reviews operating-environment coding against available artifacts, structure charts, governance notes, and documentary evidence where inputs are sufficient.",
  "2. Role-Level Control Design. What the paid workflow is designed to produce, where inputs are sufficient: engagement-tier planning ranges for value protection, earn-out exposure, and talent-continuity envelopes, paired with Day 30/60/90 governance controls.",
  "This is decision-support output. It does not make employment, retention, advancement, dismissal, disciplinary, compensation, or workforce decisions. Role-level findings require analyst review, client evidence, internal governance, and counsel review before action.",
  "3. SEALED FORECAST LEDGER. The paid workflow is designed to log role-level, pre-outcome forecast claims before post-close events are known. These claims are reviewed at defined windows such as Day 30, Day 90, Day 180, and Day 365. The track record strengthens as sealed predictions mature across transactions.",
]);

const FULL_ENGAGEMENT_CTA =
  "Next step: scope a single-deal pilot to decompose ECS drivers, review the operating-environment coding against available artifacts, and convert watchpoints into role-level integration controls.";

const FORBIDDEN_INTERNAL_PATH_RE = /docs\/LEVEL1_MODE_D|docs\/reference-data|authorityPath|artifactPath/;
const FORBIDDEN_HASH_CLAIM_RE = /authoritySha256|artifactSha256/;
const FORBIDDEN_ENV_CODE_RE = /\bNT\/STJ\b|\bNT\/STP\b|\bNF\/NT\b|\bNF\/SFJ\b|\bNF\/SFP\b|\bSFJ\/SFP\b|\bSTJ\/STP\b|\bSTP\/STJ\b|\bSFP\/SFJ\b/;
const FORBIDDEN_ABSENCE_CLAIM_RE =
  /\b(the company has no|no such filing exists|not present|negative signal|did not file|was not filed|zero records of this class)\b/i;

type SideName = "acquirer" | "target";

type ProjectionFailure = { ok: false; reason: string };
type ProjectionSuccess = { ok: true; publicReport: Record<string, unknown> };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

function isCanonicalCik(value: unknown): value is string {
  return typeof value === "string" && /^\d{10}$/.test(value);
}

function coverageOk(value: unknown): value is string {
  return value === COVERAGE_COMPLETE || value === COVERAGE_PARTIAL || value === COVERAGE_SOURCE_UNAVAILABLE;
}

function fail(reason: string): ProjectionFailure {
  return { ok: false, reason };
}

function publicClassLabel(recordClass: unknown): string | null {
  if (typeof recordClass !== "string") return null;
  return PUBLIC_RECORD_CLASS_LABELS[recordClass] ?? null;
}

function sideLabel(side: SideName): string {
  return side === "acquirer" ? "Acquirer" : "Target";
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function publicLocator(exactLocator: unknown): Record<string, unknown> | null {
  if (!isPlainObject(exactLocator)) return null;
  const locator: Record<string, unknown> = {};
  if (isNonEmptyString(exactLocator.sourceUrl)) locator.sourceUrl = exactLocator.sourceUrl.trim();
  if (isNonEmptyString(exactLocator.accessionNumber)) locator.accessionNumber = exactLocator.accessionNumber.trim();
  if (isNonEmptyString(exactLocator.documentLocator)) locator.documentLocator = exactLocator.documentLocator.trim();
  if (isNonEmptyString(exactLocator.field)) locator.field = exactLocator.field.trim();
  if (typeof exactLocator.sourceRowIndex === "number") locator.sourceRowIndex = exactLocator.sourceRowIndex;
  return Object.keys(locator).length > 0 ? locator : null;
}

function publicBinding(binding: unknown): Record<string, unknown> | null {
  if (!isPlainObject(binding)) return null;
  const locator = publicLocator(binding.exactLocator);
  const row: Record<string, unknown> = {};
  if (isNonEmptyString(binding.propositionId)) row.propositionId = binding.propositionId.trim();
  if (isNonEmptyString(binding.physicalRecordKey)) row.physicalRecordKey = binding.physicalRecordKey.trim();
  if (isNonEmptyString(binding.sourceIdentity)) row.sourceIdentity = binding.sourceIdentity.trim();
  if (isNonEmptyString(binding.filedOrPublishedDate)) row.filedOrPublishedDate = binding.filedOrPublishedDate.trim();
  if (isNonEmptyString(binding.retrievedAt)) row.retrievedAt = binding.retrievedAt.trim();
  if (locator) row.exactLocator = locator;
  const artifact = isPlainObject(binding.artifactIdentity) ? binding.artifactIdentity : null;
  if (artifact && isNonEmptyString(artifact.url)) {
    row.sourceUrl = artifact.url.trim();
  }
  return Object.keys(row).length > 0 ? row : null;
}

function readSide(level1: Record<string, unknown>, side: SideName): Record<string, unknown> | null {
  const sides = isPlainObject(level1.sides) ? level1.sides : null;
  if (!sides) return null;
  const row = sides[side];
  if (!isPlainObject(row)) return null;
  if (row.side !== side) return null;
  if (!isCanonicalCik(row.cik)) return null;
  if (!coverageOk(row.coverage)) return null;
  if (typeof row.executionComplete !== "boolean") return null;
  return row;
}

function propositionsOf(side: Record<string, unknown>, propositionClass: string): Record<string, unknown>[] {
  const fromNamed = asArray(side[propositionClass.toLowerCase()]);
  const named = fromNamed.filter((row): row is Record<string, unknown> => (
    isPlainObject(row) && row.propositionClass === propositionClass
  ));
  if (named.length > 0) return named;
  return asArray(side.propositions).filter((row): row is Record<string, unknown> => (
    isPlainObject(row) && row.propositionClass === propositionClass
  ));
}

function establishedP3(side: Record<string, unknown>): Record<string, unknown>[] {
  return propositionsOf(side, "P3").filter((row) => row.gapState === GAP_ESTABLISHED);
}

function notEstablishedP4(side: Record<string, unknown>): Record<string, unknown>[] {
  return propositionsOf(side, "P4").filter((row) => row.gapState === GAP_NOT_ESTABLISHED);
}

function establishedP1(side: Record<string, unknown>): Record<string, unknown>[] {
  return propositionsOf(side, "P1").filter((row) => row.gapState === GAP_ESTABLISHED);
}

function establishedP5(side: Record<string, unknown>): Record<string, unknown>[] {
  return propositionsOf(side, "P5").filter((row) => row.gapState === GAP_ESTABLISHED);
}

function p3Fact(side: SideName, row: Record<string, unknown>, evidenceCutoff: string): Record<string, unknown> | null {
  const label = publicClassLabel(row.recordClass);
  if (!label) return null;
  const derived = asArray(row.derivedFromPropositionIds).filter((id) => isNonEmptyString(id));
  const bindings = asArray(row.evidenceBindings).map(publicBinding).filter(Boolean);
  if (derived.length === 0 || bindings.length === 0) return null;
  return {
    side,
    publicRecordClass: label,
    statement: `Established from public filing index evidence as of ${evidenceCutoff}: ${label}.`,
    derivedFromPropositionIds: derived,
    evidenceBindings: bindings,
  };
}

function p4Gap(side: SideName, row: Record<string, unknown>, evidenceCutoff: string, coverage: string): Record<string, unknown> | null {
  const label = publicClassLabel(row.recordClass);
  if (!label) return null;
  const sourceUnavailable = coverage === COVERAGE_SOURCE_UNAVAILABLE
    || row.sourceExamination === "DID_NOT_OCCUR"
    || row.epistemicQualification === COVERAGE_SOURCE_UNAVAILABLE;
  if (sourceUnavailable) {
    return {
      side,
      publicRecordClass: label,
      sourceExamination: "DID_NOT_OCCUR",
      coverageQualification: COVERAGE_SOURCE_UNAVAILABLE,
      statement: `The public filing source could not be retrieved for this analysis. This analysis therefore did not establish ${label} for the ${sideLabel(side)}, and did not examine public filings for that side.`,
    };
  }
  return {
    side,
    publicRecordClass: label,
    sourceExamination: "OCCURRED",
    statement: `Not established from the public evidence this analysis examined as of ${evidenceCutoff}. This analysis did not establish ${label}. It does not establish that no such record exists.`,
  };
}

function p1Fact(side: SideName, row: Record<string, unknown>): Record<string, unknown> | null {
  if (!isNonEmptyString(row.sourceIdentity)) return null;
  return {
    side,
    statement: `Filer canonical public identity ${JSON.stringify(row.sourceIdentity)} as published by the structured public filing-index source.`,
    sourceIdentity: row.sourceIdentity,
    retrievedAt: isNonEmptyString(row.retrievedAt) ? row.retrievedAt : null,
    exactLocator: publicLocator(row.exactLocator),
  };
}

function p5Fact(side: SideName, row: Record<string, unknown>): Record<string, unknown> | null {
  return {
    side,
    publicRecordClass: PUBLIC_RECORD_CLASS_LABELS.RC2,
    statement: isNonEmptyString(row.propositionText)
      ? row.propositionText.replace(/\bRC2\b/g, PUBLIC_RECORD_CLASS_LABELS.RC2)
      : `A published structured item-code value was established for ${PUBLIC_RECORD_CLASS_LABELS.RC2}.`,
    filedOrPublishedDate: isNonEmptyString(row.filedOrPublishedDate) ? row.filedOrPublishedDate : null,
    retrievedAt: isNonEmptyString(row.retrievedAt) ? row.retrievedAt : null,
    exactLocator: publicLocator(row.exactLocator),
  };
}

function unmappedValues(side: Record<string, unknown>): string[] {
  return asArray(side.unmappedExactRawValues).filter((value): value is string => isNonEmptyString(value));
}

function deficiencyCodes(side: Record<string, unknown>): string[] {
  return asArray(side.collectionDeficiencies)
    .filter(isPlainObject)
    .map((row) => (isNonEmptyString(row.code) ? row.code : ""))
    .filter(Boolean);
}

function block(
  number: number,
  availabilityState: string,
  availabilityReason: string,
  content: unknown,
  provenance: unknown = null,
) {
  const registry = MERGEVUE_PUBLIC_REPORT_BLOCK_REGISTRY[number - 1];
  return {
    number: registry.number,
    blockId: registry.blockId,
    canonicalName: registry.canonicalName,
    modelField: registry.modelField,
    availabilityState,
    availabilityReason,
    content,
    provenance,
  };
}

function insufficientBlock(number: number) {
  const name = MERGEVUE_PUBLIC_REPORT_BLOCKS[number - 1];
  return block(
    number,
    "INSUFFICIENT_PUBLIC_EVIDENCE",
    `${INSUFFICIENT_REASON} Unsupported block: ${name}.`,
    null,
    {
      kind: "block-unavailable",
      reasonCode: "LEVEL1_CLAIM_CEILING",
    },
  );
}

function validateLevel1(level1: unknown): ProjectionFailure | { ok: true; value: Record<string, unknown> } {
  if (!isPlainObject(level1)) return fail("level1-not-object");
  if (!isNonEmptyString(level1.collectionBoundId)) return fail("missing-collectionBoundId");
  if (!isNonEmptyString(level1.sourceFamily)) return fail("missing-sourceFamily");
  if (!isNonEmptyString(level1.requestedAt)) return fail("missing-requestedAt");
  if (!isNonEmptyString(level1.evidenceCutoff)) return fail("missing-evidenceCutoff");
  const pair = isPlainObject(level1.pair) ? level1.pair : null;
  if (!pair) return fail("missing-pair");
  if (typeof pair.symmetricExecution !== "boolean") return fail("missing-symmetricExecution");
  const coverageBySide = isPlainObject(pair.coverageBySide) ? pair.coverageBySide : null;
  if (!coverageBySide) return fail("missing-coverageBySide");
  if (!coverageOk(coverageBySide.acquirer) || !coverageOk(coverageBySide.target)) {
    return fail("invalid-coverageBySide");
  }
  const identities = isPlainObject(level1.referenceDataIdentities) ? level1.referenceDataIdentities : null;
  if (!identities) return fail("missing-referenceDataIdentities");
  if (!isNonEmptyString(identities.recordClassMappingVersion)) return fail("missing-recordClassMappingVersion");
  if (!isNonEmptyString(identities.rawFormValueResolutionVersion)) return fail("missing-rawFormValueResolutionVersion");
  if (!isNonEmptyString(identities.semanticTaxonomySnapshotId)) return fail("missing-semanticTaxonomySnapshotId");
  for (const side of SIDES) {
    if (!readSide(level1, side)) return fail(`invalid-${side}-side`);
  }
  if (asArray(level1.closureDomains).length !== 0) return fail("closureDomains-must-be-empty");
  const classes = asArray(level1.propositionClasses);
  if (classes.includes("P6")) return fail("p6-must-remain-inactive");
  return { ok: true, value: level1 };
}

function collectFacts(acquirer: Record<string, unknown>, target: Record<string, unknown>, evidenceCutoff: string) {
  const p1: Record<string, unknown>[] = [];
  const p3: Record<string, unknown>[] = [];
  const p5: Record<string, unknown>[] = [];
  const p4: Record<string, unknown>[] = [];
  for (const side of SIDES) {
    const row = side === "acquirer" ? acquirer : target;
    for (const item of establishedP1(row)) {
      const fact = p1Fact(side, item);
      if (fact) p1.push(fact);
    }
    for (const item of establishedP3(row)) {
      const fact = p3Fact(side, item, evidenceCutoff);
      if (!fact) return fail("malformed-p3-lineage");
      p3.push(fact);
    }
    for (const item of establishedP5(row)) {
      const fact = p5Fact(side, item);
      if (fact) p5.push(fact);
    }
    for (const item of notEstablishedP4(row)) {
      const gap = p4Gap(side, item, evidenceCutoff, String(row.coverage));
      if (gap) p4.push(gap);
    }
  }
  return { ok: true as const, p1, p3, p5, p4 };
}

function collectionNotes(acquirer: Record<string, unknown>, target: Record<string, unknown>, pair: Record<string, unknown>) {
  const notes: Record<string, unknown>[] = [];
  for (const side of SIDES) {
    const row = side === "acquirer" ? acquirer : target;
    if (row.coverage === COVERAGE_PARTIAL) {
      notes.push({
        kind: "PARTIAL_COLLECTION",
        side,
        statement: `${sideLabel(side)} collection coverage is PARTIAL. This is collection metadata, not a finding about what exists.`,
      });
    }
    if (row.coverage === COVERAGE_SOURCE_UNAVAILABLE) {
      notes.push({
        kind: "SOURCE_UNAVAILABLE",
        side,
        statement: `No public filing evidence was obtained for the ${sideLabel(side)}. Nothing below is established for that side, and nothing below establishes what does or does not exist.`,
      });
    }
    const unmapped = unmappedValues(row);
    if (unmapped.length > 0) {
      notes.push({
        kind: "UNMAPPED_UNRESOLVED",
        side,
        exactRawValues: unmapped,
        statement: `${sideLabel(side)} collection encountered unmapped or unresolved raw form values. Those values are disclosed exactly. They force PARTIAL coverage and do not retract established facts.`,
      });
    }
    if (deficiencyCodes(row).includes("ASYMMETRIC_EXECUTION")) {
      notes.push({
        kind: "ASYMMETRIC_EXECUTION",
        side,
        statement: `${sideLabel(side)} coverage is qualified by asymmetric execution. Execution symmetry is a separate axis from proposition truth.`,
      });
    }
  }
  if (pair.symmetricExecution === false) {
    notes.push({
      kind: "ASYMMETRIC_EXECUTION",
      side: "pair",
      statement: "Ordered-pair execution was not symmetric. This does not convert unmapped values into execution failure by itself, and it is not a negative finding.",
    });
  }
  return notes;
}

function assertSafePublicReport(publicReport: Record<string, unknown>): ProjectionFailure | { ok: true } {
  const serialized = JSON.stringify(publicReport);
  if (FORBIDDEN_INTERNAL_PATH_RE.test(serialized)) return fail("internal-path-leaked");
  if (FORBIDDEN_HASH_CLAIM_RE.test(serialized)) return fail("internal-hash-leaked");
  if (FORBIDDEN_ENV_CODE_RE.test(serialized)) return fail("environment-code-leaked");
  if (/\bECS\b/.test(serialized) && !serialized.includes("decomposing ECS drivers")) {
    return fail("ecs-leaked");
  }
  const blocks = asArray(publicReport.blocks);
  for (const row of blocks) {
    if (!isPlainObject(row)) continue;
    if (row.number === 11) continue;
    const local = JSON.stringify(row);
    if (FORBIDDEN_ABSENCE_CLAIM_RE.test(local)) return fail("absence-claim-leaked");
    if (row.number !== 11 && /\bECS\b/.test(local)) return fail("ecs-in-level1-block");
  }
  if (blocks.length !== 12) return fail("block-count");
  for (let index = 0; index < 12; index += 1) {
    const row = blocks[index];
    const expected = MERGEVUE_PUBLIC_REPORT_BLOCK_REGISTRY[index];
    if (!isPlainObject(row)) return fail("block-not-object");
    if (row.number !== expected.number) return fail("block-order");
    if (row.blockId !== expected.blockId) return fail("block-id");
    if (row.canonicalName !== expected.canonicalName) return fail("block-name");
    if (typeof row.availabilityState !== "string"
      || !MERGEVUE_PUBLIC_REPORT_AVAILABILITY_STATES.includes(row.availabilityState)) {
      return fail("availability-state");
    }
  }
  void MERGEVUE_PUBLIC_REPORT_EVIDENCE_CHANNELS;
  return { ok: true };
}

export function projectLevel1ToPublicReport(level1Input: unknown): ProjectionSuccess | ProjectionFailure {
  const validated = validateLevel1(level1Input);
  if (!validated.ok) return validated;
  const level1 = validated.value;
  const acquirer = readSide(level1, "acquirer");
  const target = readSide(level1, "target");
  if (!acquirer || !target) return fail("sides-unreadable");
  if (acquirer.cik === target.cik) return fail("same-cik-pair");

  const pair = level1.pair as Record<string, unknown>;
  const identities = level1.referenceDataIdentities as Record<string, unknown>;
  const evidenceCutoff = String(level1.evidenceCutoff);
  const requestedAt = String(level1.requestedAt);
  const facts = collectFacts(acquirer, target, evidenceCutoff);
  if (!facts.ok) return facts;

  const collection = {
    sourceFamily: String(level1.sourceFamily),
    collectionBoundId: String(level1.collectionBoundId),
    evidenceCutoff,
    requestedAt,
    coverageBySide: {
      acquirer: acquirer.coverage,
      target: target.coverage,
    },
    symmetricExecution: pair.symmetricExecution === true,
    establishedRecordClassCounts: {
      acquirer: asArray(acquirer.establishedRecordClasses).length,
      target: asArray(target.establishedRecordClasses).length,
    },
  };

  const pairIdentity = {
    acquirer: {
      cik: acquirer.cik,
      sourceIdentity: facts.p1.find((row) => row.side === "acquirer")?.sourceIdentity ?? null,
    },
    target: {
      cik: target.cik,
      sourceIdentity: facts.p1.find((row) => row.side === "target")?.sourceIdentity ?? null,
    },
  };

  const decisionGapNotes = collectionNotes(acquirer, target, pair);

  const blocks = [
    block(
      1,
      "LIMITED",
      "Level-1 may state ordered-pair identity, collection state, and positively established public filing-index facts only. It does not support a deal verdict, compatibility judgment, or recommended transaction action.",
      {
        pair: pairIdentity,
        collection,
        establishedIdentities: facts.p1,
        establishedRecordClasses: facts.p3,
        establishedStructuredItemCodes: facts.p5,
      },
      { kind: "level1-positive-facts", sourceField: "level1" },
    ),
    insufficientBlock(2),
    insufficientBlock(3),
    insufficientBlock(4),
    insufficientBlock(5),
    insufficientBlock(6),
    insufficientBlock(7),
    insufficientBlock(8),
    block(
      9,
      "NOT_APPLICABLE",
      BLOCK9_NOT_APPLICABLE_REASON,
      {
        actions: [],
        authorizedChannels: [],
      },
      { kind: "no-authorized-acquisition-step" },
    ),
    block(
      10,
      "LIMITED",
      "Level-1 Decision Gap is a non-material evidence-gap surface. It distinguishes established facts, NOT_ESTABLISHED_WITHIN_BOUND, collection limitations, unmapped values, source unavailability, and asymmetric execution. It does not authorize absence, importance, urgency, or ranking.",
      {
        established: facts.p3,
        notEstablishedWithinBound: facts.p4,
        collectionLimitations: decisionGapNotes,
        unmappedOrUnresolved: SIDES.flatMap((side) => {
          const row = side === "acquirer" ? acquirer : target;
          const values = unmappedValues(row);
          return values.length
            ? [{ side, exactRawValues: values }]
            : [];
        }),
        sourceUnavailableSides: SIDES.filter((side) => (
          (side === "acquirer" ? acquirer : target).coverage === COVERAGE_SOURCE_UNAVAILABLE
        )),
        asymmetricExecution: pair.symmetricExecution === false,
        evidenceAcquisitionChannel: null,
      },
      { kind: "level1-evidence-gap" },
    ),
    block(
      11,
      "AVAILABLE",
      "Static product-expansion description only. Separate from Level-1 findings.",
      {
        separator: FULL_ENGAGEMENT_SEPARATOR,
        benefits: [...FULL_ENGAGEMENT_BENEFITS],
        cta: FULL_ENGAGEMENT_CTA,
      },
      { kind: "static-contract-copy" },
    ),
    block(
      12,
      "AVAILABLE",
      "Public-safe audit identifiers for this request. This is not a stored report URL or persistence claim.",
      {
        schemaVersion: MERGEVUE_CANONICAL_PUBLIC_REPORT_SCHEMA_VERSION,
        reportVersion: MERGEVUE_CANONICAL_PUBLIC_REPORT_VERSION,
        sourceMode: MERGEVUE_PUBLIC_REPORT_SOURCE_MODE_LEVEL1_MODE_D_SLICE1,
        requestedAt,
        generatedAt: evidenceCutoff,
        evidenceCutoff,
        orderedPair: {
          acquirerCik: acquirer.cik,
          targetCik: target.cik,
        },
        sourceFamily: String(level1.sourceFamily),
        collectionBoundId: String(level1.collectionBoundId),
        coverageBySide: collection.coverageBySide,
        symmetricExecution: collection.symmetricExecution,
        referenceDataVersions: {
          recordClassMappingVersion: identities.recordClassMappingVersion,
          rawFormValueResolutionVersion: identities.rawFormValueResolutionVersion,
          semanticTaxonomySnapshotId: identities.semanticTaxonomySnapshotId,
        },
      },
      { kind: "public-audit-footer" },
    ),
  ];

  const publicReport = {
    schemaVersion: MERGEVUE_CANONICAL_PUBLIC_REPORT_SCHEMA_VERSION,
    sourceMode: MERGEVUE_PUBLIC_REPORT_SOURCE_MODE_LEVEL1_MODE_D_SLICE1,
    metadata: {
      generatedAt: evidenceCutoff,
      reportVersion: MERGEVUE_CANONICAL_PUBLIC_REPORT_VERSION,
      sourceField: "level1",
      requestedAt,
      evidenceCutoff,
      collectionBoundId: String(level1.collectionBoundId),
      pair: {
        acquirerCik: acquirer.cik,
        targetCik: target.cik,
      },
      coverageBySide: collection.coverageBySide,
      symmetricExecution: collection.symmetricExecution,
      referenceDataVersions: {
        recordClassMappingVersion: identities.recordClassMappingVersion,
        rawFormValueResolutionVersion: identities.rawFormValueResolutionVersion,
        semanticTaxonomySnapshotId: identities.semanticTaxonomySnapshotId,
      },
    },
    blocks,
  };

  const safety = assertSafePublicReport(publicReport);
  if (!safety.ok) return safety;
  return { ok: true, publicReport };
}

export function publicReportMatchesPair(
  publicReport: unknown,
  pair: { acquirerCik: string; targetCik: string },
): boolean {
  if (!isPlainObject(publicReport)) return false;
  const metadata = isPlainObject(publicReport.metadata) ? publicReport.metadata : null;
  if (!metadata || !isPlainObject(metadata.pair)) return false;
  return metadata.pair.acquirerCik === pair.acquirerCik && metadata.pair.targetCik === pair.targetCik;
}
