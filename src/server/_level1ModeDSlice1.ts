import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * LEVEL1-MODE-D-SLICE1-IMPLEMENTATION-1
 *
 * Runtime mapping authority is the accepted reference-data artifact at the
 * exact repository path below, bound by SHA-256 and expected identities.
 * Frozen historical lifecycle strings inside that JSON (CANDIDATE,
 * ownerAccepted=false, independentlyVerified=false) are NOT runtime
 * authority and must not gate execution.
 */

export const LEVEL1_RESPONSE_FIELD = "level1";
export const COLLECTION_BOUND_ID = "SLICE1-BOUND-v0.4";
export const SOURCE_FAMILY = "issuer-filed structured public filing index";
export const CLAIM_LEVEL = "B′";
export const EVIDENCE_LANE = "PUBLIC";
export const DE_CLASS = "UNASSIGNED";
export const MATERIALITY_NOT_AUTHORIZED = "MATERIALITY_NOT_AUTHORIZED";

export const METHODOLOGY_AUTHORITY_PATH =
  "docs/LEVEL1_MODE_D_METHODOLOGY_DELTA_v0.2_CORR1_CANDIDATE.md";
export const METHODOLOGY_AUTHORITY_SHA256 =
  "3dfe86b38628560f81bc566c19d5dc15b43fe0e5977e0c0249928edd0ff84f3c";

export const REFERENCE_DATA_RELATIVE_PATH =
  "docs/reference-data/LEVEL1_MODE_D_REFERENCE_DATA_INSTANCE_v1.0_CORR1_CANDIDATE.json";
export const ACCEPTED_REFERENCE_DATA_SHA256 =
  "36d62683012213e09f57db0de41761082778dbde747a73aa1a469ad9dd380133";

export const EXPECTED_RECORD_CLASS_MAPPING_VERSION = "MD-L1-RCMAP-v1.0-CORR1";
export const EXPECTED_RAW_FORM_VALUE_RESOLUTION_VERSION = "MD-L1-RAWFORM-v1.0-CORR1";
export const EXPECTED_SEMANTIC_TAXONOMY_SNAPSHOT_ID = "MD-L1-SEMTAX-2026-09-19-BOUNDED";

export const COVERAGE_COMPLETE = "COMPLETE_WITHIN_BOUND";
export const COVERAGE_PARTIAL = "PARTIAL";
export const COVERAGE_SOURCE_UNAVAILABLE = "SOURCE_UNAVAILABLE";

export const GAP_ESTABLISHED = "ESTABLISHED_WITHIN_BOUND";
export const GAP_NOT_ESTABLISHED = "NOT_ESTABLISHED_WITHIN_BOUND";
export const DISPOSITION_UNMAPPED = "UNMAPPED";
export const DISPOSITION_OUT_OF_BOUND = "OUT_OF_BOUND";

export const RECORD_CLASSES = Object.freeze(["RC1", "RC2", "RC3", "RC4", "RC5"]);
export const PHYSICAL_RECORD_DEDUPE_KEY = "accessionNumber";

export const SLICE1_BINDING_FAILED = "slice1-reference-data-binding-failed";

const FILING_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const ALLOWED_ADDITIONAL_FILE_NAME = /^CIK\d{10}-submissions-\d+\.json$/;

export type SideName = "acquirer" | "target";

export type ReferenceDataIdentities = {
  recordClassMappingVersion: string;
  rawFormValueResolutionVersion: string;
  semanticTaxonomySnapshotId: string;
};

export type RegistryEntry = {
  rawFormValue: string;
  canonicalFormIdentity: string;
  formDisposition: string;
  recordClasses: string[];
};

export type FormResolution = {
  rawFormValue: string;
  canonicalFormIdentity: string | null;
  formDisposition: string;
  recordClasses: string[];
  unknown: boolean;
};

export type BindReferenceDataInput = {
  bytes?: Uint8Array | null;
  path?: string | null;
  expectedSha256?: string;
  expectedIdentities?: ReferenceDataIdentities;
};

export type BoundReferenceData = {
  ok: true;
  sha256: string;
  identities: ReferenceDataIdentities;
  registry: Map<string, RegistryEntry>;
  artifactPath: string;
};

export type BindingFailure = {
  ok: false;
  status: typeof SLICE1_BINDING_FAILED;
  reason: string;
  details: Record<string, unknown>;
};

export type SourcePageInput = {
  pageId: string;
  url: string;
  retrievedAt: string;
  consultStatus: "CONSULTED" | "UNCONSULTED";
  unconsultedReason?: string;
  httpStatus?: number | null;
  artifactSha256?: string | null;
  contentIdentityMethod?: string;
  payload?: unknown;
  publishedFilingCount?: number | null;
};

export type SideCollectionInput = {
  side: SideName;
  cik: string;
  primaryRetrieved: boolean;
  primary: SourcePageInput | null;
  additionalPages: SourcePageInput[];
  engineeringTruncation?: { truncated: boolean; reason?: string };
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function sha256Hex(bytes: Uint8Array | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function acceptedReferenceDataPath() {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "../..", REFERENCE_DATA_RELATIVE_PATH);
}

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8").decode(bytes);
}

function failBinding(reason: string, details: Record<string, unknown> = {}): BindingFailure {
  return {
    ok: false,
    status: SLICE1_BINDING_FAILED,
    reason,
    details,
  };
}

function readIdentity(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function bindAcceptedReferenceData(
  input: BindReferenceDataInput = {},
): BoundReferenceData | BindingFailure {
  const expectedSha = input.expectedSha256 ?? ACCEPTED_REFERENCE_DATA_SHA256;
  const expectedIdentities = input.expectedIdentities ?? {
    recordClassMappingVersion: EXPECTED_RECORD_CLASS_MAPPING_VERSION,
    rawFormValueResolutionVersion: EXPECTED_RAW_FORM_VALUE_RESOLUTION_VERSION,
    semanticTaxonomySnapshotId: EXPECTED_SEMANTIC_TAXONOMY_SNAPSHOT_ID,
  };
  const artifactPath = input.path ?? acceptedReferenceDataPath();

  let bytes: Uint8Array;
  try {
    bytes = input.bytes ?? readFileSync(artifactPath);
  } catch (error) {
    return failBinding("REFERENCE_DATA_FILE_MISSING", {
      artifactPath,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const sha256 = sha256Hex(bytes);
  if (sha256 !== expectedSha) {
    return failBinding("REFERENCE_DATA_SHA256_MISMATCH", {
      artifactPath,
      expectedSha256: expectedSha,
      actualSha256: sha256,
    });
  }

  let artifact: unknown;
  try {
    artifact = JSON.parse(decodeUtf8(bytes));
  } catch (error) {
    return failBinding("REFERENCE_DATA_JSON_MALFORMED", {
      artifactPath,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  if (!isPlainObject(artifact) || !isPlainObject(artifact.identities)) {
    return failBinding("REFERENCE_DATA_IDENTITIES_ABSENT", { artifactPath });
  }

  const identities: ReferenceDataIdentities = {
    recordClassMappingVersion: readIdentity(artifact.identities.recordClassMappingVersion) ?? "",
    rawFormValueResolutionVersion:
      readIdentity(artifact.identities.rawFormValueResolutionVersion) ?? "",
    semanticTaxonomySnapshotId: readIdentity(artifact.identities.semanticTaxonomySnapshotId) ?? "",
  };

  if (
    identities.recordClassMappingVersion !== expectedIdentities.recordClassMappingVersion
    || identities.rawFormValueResolutionVersion !== expectedIdentities.rawFormValueResolutionVersion
    || identities.semanticTaxonomySnapshotId !== expectedIdentities.semanticTaxonomySnapshotId
  ) {
    return failBinding("REFERENCE_DATA_IDENTITY_MISMATCH", {
      artifactPath,
      expectedIdentities,
      actualIdentities: identities,
    });
  }

  if (!Array.isArray(artifact.entries)) {
    return failBinding("REFERENCE_DATA_ENTRIES_MALFORMED", { artifactPath });
  }

  const registry = new Map<string, RegistryEntry>();
  for (const rawEntry of artifact.entries) {
    if (!isPlainObject(rawEntry)) {
      return failBinding("REFERENCE_DATA_ENTRY_MALFORMED", { artifactPath });
    }
    if (typeof rawEntry.rawFormValue !== "string") {
      return failBinding("REFERENCE_DATA_ENTRY_MALFORMED", { artifactPath });
    }
    if (registry.has(rawEntry.rawFormValue)) {
      return failBinding("REFERENCE_DATA_DUPLICATE_RAW_VALUE", {
        artifactPath,
        rawFormValue: rawEntry.rawFormValue,
      });
    }
    if (typeof rawEntry.canonicalFormIdentity !== "string") {
      return failBinding("REFERENCE_DATA_ENTRY_MALFORMED", { artifactPath });
    }
    if (typeof rawEntry.formDisposition !== "string") {
      return failBinding("REFERENCE_DATA_ENTRY_MALFORMED", { artifactPath });
    }
    if (!Array.isArray(rawEntry.recordClasses) || rawEntry.recordClasses.some((item) => typeof item !== "string")) {
      return failBinding("REFERENCE_DATA_ENTRY_MALFORMED", { artifactPath });
    }
    registry.set(rawEntry.rawFormValue, {
      rawFormValue: rawEntry.rawFormValue,
      canonicalFormIdentity: rawEntry.canonicalFormIdentity,
      formDisposition: rawEntry.formDisposition,
      recordClasses: rawEntry.recordClasses.slice(),
    });
  }

  return {
    ok: true,
    sha256,
    identities,
    registry,
    artifactPath: REFERENCE_DATA_RELATIVE_PATH,
  };
}

/**
 * Exact source-string lookup. No trim, case-fold, prefix, suffix, regex,
 * or normalization. Unknown → UNMAPPED / UNRESOLVED. Never OUT_OF_BOUND
 * by reason of absence from the table.
 */
export function resolveRawFormValue(
  rawFormValue: string,
  registry: Map<string, RegistryEntry>,
): FormResolution {
  const entry = registry.get(rawFormValue);
  if (!entry) {
    return {
      rawFormValue,
      canonicalFormIdentity: null,
      formDisposition: DISPOSITION_UNMAPPED,
      recordClasses: [],
      unknown: true,
    };
  }
  return {
    rawFormValue,
    canonicalFormIdentity: entry.canonicalFormIdentity,
    formDisposition: entry.formDisposition,
    recordClasses: entry.recordClasses.slice(),
    unknown: false,
  };
}

export function additionalSubmissionsFileName(value: unknown) {
  if (!isPlainObject(value)) return null;
  if (typeof value.name !== "string") return null;
  const name = value.name;
  if (name.includes("/") || name.includes("\\") || name.includes("..") || name.includes(":")) {
    return null;
  }
  if (!ALLOWED_ADDITIONAL_FILE_NAME.test(name)) return null;
  return name;
}

export function additionalSubmissionsUrl(origin: string, fileName: string) {
  return `${origin}/submissions/${fileName}`;
}

export function publishedFilingCount(value: unknown) {
  if (!isPlainObject(value)) return null;
  if (typeof value.filingCount !== "number" || !Number.isFinite(value.filingCount)) return null;
  return value.filingCount;
}

type FilingColumns = {
  form: unknown[];
  filingDate: unknown[];
  accessionNumber: unknown[];
  items: unknown[] | null;
  primaryDocument: unknown[] | null;
  shape: string;
};

function requiredColumns(recent: Record<string, unknown>): FilingColumns | null {
  if (
    !Object.prototype.hasOwnProperty.call(recent, "form")
    || !Object.prototype.hasOwnProperty.call(recent, "filingDate")
    || !Object.prototype.hasOwnProperty.call(recent, "accessionNumber")
  ) {
    return null;
  }
  const form = recent.form;
  const filingDate = recent.filingDate;
  const accessionNumber = recent.accessionNumber;
  if (!Array.isArray(form) || !Array.isArray(filingDate) || !Array.isArray(accessionNumber)) {
    return null;
  }
  if (form.length !== filingDate.length || form.length !== accessionNumber.length) {
    return null;
  }
  let items: unknown[] | null = null;
  if (Object.prototype.hasOwnProperty.call(recent, "items")) {
    items = Array.isArray(recent.items) && recent.items.length === form.length
      ? recent.items
      : null;
  }
  let primaryDocument: unknown[] | null = null;
  if (Object.prototype.hasOwnProperty.call(recent, "primaryDocument")) {
    primaryDocument = Array.isArray(recent.primaryDocument)
      && recent.primaryDocument.length === form.length
      ? recent.primaryDocument
      : null;
  }
  return { form, filingDate, accessionNumber, items, primaryDocument, shape: "column-arrays" };
}

export function extractFilingColumns(payload: unknown): {
  columns: FilingColumns | null;
  shape: string;
  deficiency: string | null;
} {
  if (!isPlainObject(payload)) {
    return { columns: null, shape: "not-object", deficiency: "PAYLOAD_NOT_OBJECT" };
  }
  if (isPlainObject(payload.filings) && isPlainObject(payload.filings.recent)) {
    const columns = requiredColumns(payload.filings.recent);
    if (!columns) {
      return {
        columns: null,
        shape: "filings.recent",
        deficiency: "MALFORMED_REQUIRED_PARALLEL_ARRAYS",
      };
    }
    const itemsPresent = Object.prototype.hasOwnProperty.call(payload.filings.recent, "items");
    if (itemsPresent && columns.items === null) {
      return {
        columns: { ...columns },
        shape: "filings.recent",
        deficiency: "ITEMS_PARALLEL_ARRAY_MALFORMED",
      };
    }
    return { columns, shape: "filings.recent", deficiency: null };
  }
  if (Array.isArray(payload.form) || Array.isArray(payload.accessionNumber) || Array.isArray(payload.filingDate)) {
    const columns = requiredColumns(payload);
    if (!columns) {
      return {
        columns: null,
        shape: "top-level",
        deficiency: "MALFORMED_REQUIRED_PARALLEL_ARRAYS",
      };
    }
    const itemsPresent = Object.prototype.hasOwnProperty.call(payload, "items");
    if (itemsPresent && columns.items === null) {
      return {
        columns: { ...columns },
        shape: "top-level",
        deficiency: "ITEMS_PARALLEL_ARRAY_MALFORMED",
      };
    }
    return { columns, shape: "top-level", deficiency: null };
  }
  return { columns: null, shape: "unrecognized", deficiency: "UNRECOGNIZED_INDEX_SHAPE" };
}

export function extractPublishedIdentity(payload: unknown) {
  if (!isPlainObject(payload)) return null;
  if (typeof payload.name !== "string" || payload.name.length === 0) return null;
  return payload.name;
}

export function extractExposedAdditionalFiles(payload: unknown) {
  if (!isPlainObject(payload) || !isPlainObject(payload.filings)) return [];
  return Array.isArray(payload.filings.files) ? payload.filings.files : [];
}

type PhysicalRecord = {
  rawFormValue: string;
  filingDate: string | null;
  accessionNumber: string | null;
  itemsPublished: boolean;
  itemsValue: string | null;
  primaryDocument: string | null;
  sourcePageId: string;
  sourceRowIndex: number;
  sourceUrl: string;
  artifactSha256: string | null;
  retrievedAt: string;
  resolution: FormResolution;
};

function documentLocator(cik: string, accessionNumber: string | null, primaryDocument: string | null) {
  if (!accessionNumber || typeof primaryDocument !== "string" || primaryDocument.length === 0) {
    return null;
  }
  const numericCik = cik.replace(/^0+/, "") || "0";
  const accessionPath = accessionNumber.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${numericCik}/${accessionPath}/${primaryDocument}`;
}

function canEmitPositiveFromRecord(record: PhysicalRecord) {
  return Boolean(
    record.filingDate
    && FILING_DATE_PATTERN.test(record.filingDate)
    && typeof record.accessionNumber === "string"
    && record.accessionNumber.length > 0
    && record.artifactSha256,
  );
}

function identitiesOn(identities: ReferenceDataIdentities) {
  return {
    recordClassMappingVersion: identities.recordClassMappingVersion,
    rawFormValueResolutionVersion: identities.rawFormValueResolutionVersion,
    semanticTaxonomySnapshotId: identities.semanticTaxonomySnapshotId,
    collectionBoundId: COLLECTION_BOUND_ID,
    evidenceLane: EVIDENCE_LANE,
    claimLevel: CLAIM_LEVEL,
    deClass: DE_CLASS,
    interestedSelfDescription: true,
    materiality: MATERIALITY_NOT_AUTHORIZED,
    sourceFamily: SOURCE_FAMILY,
  };
}

function p2Text(rawFormValue: string, filingDate: string, accessionNumber: string) {
  return `Form ${rawFormValue} filed on ${filingDate} under accession ${accessionNumber}.`;
}

function p3Text(recordClass: string) {
  return `${recordClass} was established from qualifying structured public filing-index evidence.`;
}

function p4Text(recordClass: string, sourceUnavailable: boolean) {
  if (sourceUnavailable) {
    return `${recordClass} was not established. The active structured public filing-index source could not be retrieved for this side; no source examination occurred.`;
  }
  return `${recordClass} was not established from the evidence lawfully recognized.`;
}

function p5Text(
  itemsValue: string,
  rawFormValue: string,
  filingDate: string,
  accessionNumber: string,
) {
  return `Structured item-code value ${JSON.stringify(itemsValue)} published for Form ${rawFormValue} filed on ${filingDate} under accession ${accessionNumber}.`;
}

function p1Text(name: string) {
  return `Filer canonical public identity ${JSON.stringify(name)} as published by the structured public filing-index source.`;
}

function sortRc(values: string[]) {
  return RECORD_CLASSES.filter((item) => values.includes(item));
}

export function evaluateSlice1Side(
  collection: SideCollectionInput,
  bound: BoundReferenceData,
  evidenceCutoff: string,
) {
  const shared = identitiesOn(bound.identities);
  const deficiencies: Array<Record<string, unknown>> = [];
  const sourceArtifacts: Array<Record<string, unknown>> = [];
  const unmappedExactRawValues: string[] = [];
  const unmappedSeen = new Set<string>();
  const propositions: Array<Record<string, unknown>> = [];
  const established = new Set<string>();
  let physicalRecordCount = 0;
  let encounteredUnmapped = false;
  let reconciliationFailed = false;
  let unconsultedExposedPage = false;
  let malformedArrays = false;
  let itemsArrayMalformed = false;

  const primaryPage = collection.primary;
  if (
    !collection.primaryRetrieved
    || primaryPage == null
    || primaryPage.consultStatus !== "CONSULTED"
  ) {
    deficiencies.push({
      code: "PRIMARY_SOURCE_UNAVAILABLE",
      pageId: primaryPage?.pageId ?? "primary",
      reason: primaryPage?.unconsultedReason ?? "PRIMARY_NOT_RETRIEVED",
    });
    for (const recordClass of RECORD_CLASSES) {
      propositions.push({
        propositionId: `slice1:${collection.side}:P4:${recordClass}`,
        propositionClass: "P4",
        side: collection.side,
        recordClass,
        gapState: GAP_NOT_ESTABLISHED,
        sourceExamination: "DID_NOT_OCCUR",
        epistemicQualification: COVERAGE_SOURCE_UNAVAILABLE,
        propositionText: p4Text(recordClass, true),
        observedScope: collection.side,
        claimedScope: collection.side,
        evidenceCutoff,
        ...shared,
      });
    }
    return {
      side: collection.side,
      cik: collection.cik,
      coverage: COVERAGE_SOURCE_UNAVAILABLE,
      physicalRecordCount: 0,
      establishedRecordClasses: [],
      recordClassEstablishment: Object.fromEntries(
        RECORD_CLASSES.map((recordClass) => [recordClass, GAP_NOT_ESTABLISHED]),
      ),
      unmappedExactRawValues: [],
      sourceArtifacts: primaryPage
        ? [{
          pageId: primaryPage.pageId,
          url: primaryPage.url,
          retrievedAt: primaryPage.retrievedAt,
          consultStatus: primaryPage.consultStatus,
          artifactSha256: primaryPage.artifactSha256 ?? null,
          unconsultedReason: primaryPage.unconsultedReason ?? null,
        }]
        : [],
      collectionDeficiencies: deficiencies,
      executionComplete: false,
      propositions,
      p1: [],
      p2: [],
      p3: [],
      p4: propositions.filter((row) => row.propositionClass === "P4"),
      p5: [],
    };
  }

  const pages: SourcePageInput[] = [primaryPage, ...collection.additionalPages];
  const physicalRecords: PhysicalRecord[] = [];
  const seenAccessions = new Set<string>();
  let publishedIdentity: string | null = null;

  for (const page of pages) {
    sourceArtifacts.push({
      pageId: page.pageId,
      url: page.url,
      retrievedAt: page.retrievedAt,
      consultStatus: page.consultStatus,
      artifactSha256: page.artifactSha256 ?? null,
      contentIdentityMethod: page.contentIdentityMethod ?? null,
      unconsultedReason: page.unconsultedReason ?? null,
      httpStatus: page.httpStatus ?? null,
      publishedFilingCount: page.publishedFilingCount ?? null,
    });

    if (page.consultStatus !== "CONSULTED") {
      unconsultedExposedPage = true;
      deficiencies.push({
        code: "EXPOSED_PAGE_UNCONSULTED",
        pageId: page.pageId,
        url: page.url,
        reason: page.unconsultedReason ?? "UNCONSULTED",
      });
      continue;
    }

    if (page.pageId === "primary") {
      publishedIdentity = extractPublishedIdentity(page.payload);
    }

    const extracted = extractFilingColumns(page.payload);
    if (extracted.deficiency === "ITEMS_PARALLEL_ARRAY_MALFORMED") {
      itemsArrayMalformed = true;
      deficiencies.push({
        code: "ITEMS_PARALLEL_ARRAY_MALFORMED",
        pageId: page.pageId,
        url: page.url,
      });
    }
    if (!extracted.columns) {
      malformedArrays = true;
      deficiencies.push({
        code: extracted.deficiency ?? "MALFORMED_REQUIRED_PARALLEL_ARRAYS",
        pageId: page.pageId,
        url: page.url,
        shape: extracted.shape,
      });
      continue;
    }

    if (typeof page.publishedFilingCount === "number") {
      if (page.publishedFilingCount !== extracted.columns.form.length) {
        reconciliationFailed = true;
        deficiencies.push({
          code: "COUNT_RECONCILIATION_MISMATCH",
          pageId: page.pageId,
          url: page.url,
          publishedFilingCount: page.publishedFilingCount,
          enumeratedCount: extracted.columns.form.length,
        });
      }
    }

    for (let index = 0; index < extracted.columns.form.length; index += 1) {
      const form = extracted.columns.form[index];
      if (typeof form !== "string") {
        deficiencies.push({
          code: "NON_STRING_FORM_VALUE",
          pageId: page.pageId,
          sourceRowIndex: index,
        });
        continue;
      }
      const filingDateRaw = extracted.columns.filingDate[index];
      const accessionRaw = extracted.columns.accessionNumber[index];
      const filingDate = typeof filingDateRaw === "string" && FILING_DATE_PATTERN.test(filingDateRaw)
        ? filingDateRaw
        : null;
      const accessionNumber = typeof accessionRaw === "string" && accessionRaw.length > 0
        ? accessionRaw
        : null;

      if (accessionNumber && seenAccessions.has(accessionNumber)) {
        continue;
      }
      if (accessionNumber) seenAccessions.add(accessionNumber);

      let itemsPublished = false;
      let itemsValue: string | null = null;
      if (extracted.columns.items) {
        const itemRaw = extracted.columns.items[index];
        if (typeof itemRaw === "string") {
          itemsPublished = true;
          itemsValue = itemRaw;
        }
      }
      const primaryDocument = extracted.columns.primaryDocument
        && typeof extracted.columns.primaryDocument[index] === "string"
        ? extracted.columns.primaryDocument[index] as string
        : null;

      const resolution = resolveRawFormValue(form, bound.registry);
      if (resolution.unknown) {
        encounteredUnmapped = true;
        if (!unmappedSeen.has(form)) {
          unmappedSeen.add(form);
          unmappedExactRawValues.push(form);
        }
      }

      physicalRecords.push({
        rawFormValue: form,
        filingDate,
        accessionNumber,
        itemsPublished,
        itemsValue,
        primaryDocument,
        sourcePageId: page.pageId,
        sourceRowIndex: index,
        sourceUrl: page.url,
        artifactSha256: page.artifactSha256 ?? null,
        retrievedAt: page.retrievedAt,
        resolution,
      });
    }
  }

  physicalRecordCount = physicalRecords.length;

  if (collection.engineeringTruncation?.truncated) {
    deficiencies.push({
      code: "ENGINEERING_GUARD_TRUNCATION",
      reason: collection.engineeringTruncation.reason ?? "TRUNCATED",
    });
  }

  if (publishedIdentity) {
    propositions.push({
      propositionId: `slice1:${collection.side}:P1`,
      propositionClass: "P1",
      side: collection.side,
      sourceIdentity: publishedIdentity,
      gapState: GAP_ESTABLISHED,
      propositionText: p1Text(publishedIdentity),
      excerptOrFieldReference: "name",
      exactLocator: { sourceUrl: primaryPage.url, field: "name" },
      artifactIdentity: primaryPage.artifactSha256
        ? { sha256: primaryPage.artifactSha256, url: primaryPage.url }
        : null,
      retrievedAt: primaryPage.retrievedAt,
      evidenceCutoff,
      observedScope: collection.side,
      claimedScope: collection.side,
      ...shared,
    });
  }

  for (const record of physicalRecords) {
    if (record.resolution.unknown || record.resolution.recordClasses.length === 0) continue;
    if (!canEmitPositiveFromRecord(record)) continue;
    const locator = {
      sourceUrl: record.sourceUrl,
      sourcePageId: record.sourcePageId,
      sourceRowIndex: record.sourceRowIndex,
      accessionNumber: record.accessionNumber,
      primaryDocument: record.primaryDocument,
      documentLocator: documentLocator(
        collection.cik,
        record.accessionNumber,
        record.primaryDocument,
      ),
    };
    for (const recordClass of sortRc(record.resolution.recordClasses)) {
      established.add(recordClass);
      propositions.push({
        propositionId: `slice1:${collection.side}:P2:${record.accessionNumber}:${recordClass}`,
        propositionClass: "P2",
        side: collection.side,
        rawFormValue: record.rawFormValue,
        canonicalFormIdentity: record.resolution.canonicalFormIdentity,
        formDisposition: record.resolution.formDisposition,
        recordClass,
        gapState: GAP_ESTABLISHED,
        propositionText: p2Text(record.rawFormValue, record.filingDate as string, record.accessionNumber as string),
        filedOrPublishedDate: record.filingDate,
        retrievedAt: record.retrievedAt,
        evidenceCutoff,
        artifactIdentity: { sha256: record.artifactSha256, url: record.sourceUrl },
        exactLocator: locator,
        excerptOrFieldReference: "filings.form+filingDate+accessionNumber",
        sourceIdentity: record.accessionNumber,
        observedScope: collection.side,
        claimedScope: collection.side,
        physicalRecordKey: record.accessionNumber,
        ...shared,
      });
    }
  }

  for (const recordClass of RECORD_CLASSES) {
    if (!established.has(recordClass)) continue;
    const supporting = propositions.filter((row) => (
      row.propositionClass === "P2"
      && row.recordClass === recordClass
    ));
    if (supporting.length === 0) continue;
    propositions.push({
      propositionId: `slice1:${collection.side}:P3:${recordClass}`,
      propositionClass: "P3",
      side: collection.side,
      recordClass,
      gapState: GAP_ESTABLISHED,
      propositionText: p3Text(recordClass),
      evidenceCutoff,
      observedScope: collection.side,
      claimedScope: collection.side,
      derivedFromPropositionIds: supporting.map((row) => row.propositionId),
      evidenceBindings: supporting.map((row) => ({
        propositionId: row.propositionId,
        physicalRecordKey: row.physicalRecordKey,
        sourceIdentity: row.sourceIdentity,
        artifactIdentity: row.artifactIdentity,
        exactLocator: row.exactLocator,
        filedOrPublishedDate: row.filedOrPublishedDate,
        retrievedAt: row.retrievedAt,
        recordClass: row.recordClass,
        evidenceCutoff: row.evidenceCutoff,
        recordClassMappingVersion: row.recordClassMappingVersion,
        rawFormValueResolutionVersion: row.rawFormValueResolutionVersion,
        semanticTaxonomySnapshotId: row.semanticTaxonomySnapshotId,
      })),
      ...shared,
    });
  }

  for (const recordClass of RECORD_CLASSES) {
    if (established.has(recordClass)) continue;
    propositions.push({
      propositionId: `slice1:${collection.side}:P4:${recordClass}`,
      propositionClass: "P4",
      side: collection.side,
      recordClass,
      gapState: GAP_NOT_ESTABLISHED,
      sourceExamination: "OCCURRED",
      epistemicQualification: null,
      propositionText: p4Text(recordClass, false),
      evidenceCutoff,
      observedScope: collection.side,
      claimedScope: collection.side,
      ...shared,
    });
  }

  for (const record of physicalRecords) {
    if (!record.resolution.recordClasses.includes("RC2")) continue;
    if (!canEmitPositiveFromRecord(record)) continue;
    if (!record.itemsPublished || record.itemsValue === null) continue;
    propositions.push({
      propositionId: `slice1:${collection.side}:P5:${record.accessionNumber}`,
      propositionClass: "P5",
      side: collection.side,
      recordClass: "RC2",
      rawFormValue: record.rawFormValue,
      canonicalFormIdentity: record.resolution.canonicalFormIdentity,
      formDisposition: record.resolution.formDisposition,
      gapState: GAP_ESTABLISHED,
      propositionText: p5Text(
        record.itemsValue,
        record.rawFormValue,
        record.filingDate as string,
        record.accessionNumber as string,
      ),
      excerptOrFieldReference: "items",
      publishedStructuredFieldValue: record.itemsValue,
      filedOrPublishedDate: record.filingDate,
      retrievedAt: record.retrievedAt,
      evidenceCutoff,
      artifactIdentity: { sha256: record.artifactSha256, url: record.sourceUrl },
      exactLocator: {
        sourceUrl: record.sourceUrl,
        sourcePageId: record.sourcePageId,
        sourceRowIndex: record.sourceRowIndex,
        accessionNumber: record.accessionNumber,
        field: "items",
      },
      sourceIdentity: record.accessionNumber,
      observedScope: collection.side,
      claimedScope: collection.side,
      ...shared,
    });
  }

  const truncated = Boolean(collection.engineeringTruncation?.truncated);
  const coverage = (
    !encounteredUnmapped
    && !unconsultedExposedPage
    && !reconciliationFailed
    && !malformedArrays
    && !itemsArrayMalformed
    && !truncated
  )
    ? COVERAGE_COMPLETE
    : COVERAGE_PARTIAL;
  const executionComplete = Boolean(
    collection.primaryRetrieved
    && !unconsultedExposedPage
    && !reconciliationFailed
    && !malformedArrays
    && !itemsArrayMalformed
    && !truncated,
  );

  const p1 = propositions.filter((row) => row.propositionClass === "P1");
  const p2 = propositions.filter((row) => row.propositionClass === "P2");
  const p3 = propositions.filter((row) => row.propositionClass === "P3");
  const p4 = propositions.filter((row) => row.propositionClass === "P4");
  const p5 = propositions.filter((row) => row.propositionClass === "P5");

  return {
    side: collection.side,
    cik: collection.cik,
    coverage,
    executionComplete,
    physicalRecordCount,
    physicalRecordDedupeKey: PHYSICAL_RECORD_DEDUPE_KEY,
    establishedRecordClasses: RECORD_CLASSES.filter((item) => established.has(item)),
    recordClassEstablishment: Object.fromEntries(
      RECORD_CLASSES.map((recordClass) => [
        recordClass,
        established.has(recordClass) ? GAP_ESTABLISHED : GAP_NOT_ESTABLISHED,
      ]),
    ),
    unmappedExactRawValues,
    sourceArtifacts,
    collectionDeficiencies: deficiencies,
    propositions,
    p1,
    p2,
    p3,
    p4,
    p5,
  };
}

function applyAsymmetricExecution(
  side: ReturnType<typeof evaluateSlice1Side>,
): ReturnType<typeof evaluateSlice1Side> {
  if (side.coverage === COVERAGE_SOURCE_UNAVAILABLE) return side;
  const alreadyRecorded = side.collectionDeficiencies.some((row) => row.code === "ASYMMETRIC_EXECUTION");
  return {
    ...side,
    coverage: side.coverage === COVERAGE_COMPLETE ? COVERAGE_PARTIAL : side.coverage,
    collectionDeficiencies: alreadyRecorded
      ? side.collectionDeficiencies
      : [...side.collectionDeficiencies, { code: "ASYMMETRIC_EXECUTION" }],
  };
}

export function assembleLevel1Result(
  acquirerInput: ReturnType<typeof evaluateSlice1Side>,
  targetInput: ReturnType<typeof evaluateSlice1Side>,
  bound: BoundReferenceData,
  evidenceCutoff: string,
  requestedAt: string,
) {
  const symmetricExecution = Boolean(
    acquirerInput.executionComplete && targetInput.executionComplete,
  );
  const acquirer = symmetricExecution ? acquirerInput : applyAsymmetricExecution(acquirerInput);
  const target = symmetricExecution ? targetInput : applyAsymmetricExecution(targetInput);

  const limitations: string[] = [];
  for (const side of [acquirer, target]) {
    if (side.coverage === COVERAGE_PARTIAL) {
      limitations.push(`${side.side} collection coverage is PARTIAL.`);
    }
    if (side.coverage === COVERAGE_SOURCE_UNAVAILABLE) {
      limitations.push(`${side.side} active source was not retrieved; no source examination occurred.`);
    }
    for (const deficiency of side.collectionDeficiencies) {
      limitations.push(`${side.side}: ${String(deficiency.code)}`);
    }
  }

  return {
    collectionBoundId: COLLECTION_BOUND_ID,
    sourceFamily: SOURCE_FAMILY,
    methodology: {
      authorityPath: METHODOLOGY_AUTHORITY_PATH,
      authoritySha256: METHODOLOGY_AUTHORITY_SHA256,
      collectionBoundId: COLLECTION_BOUND_ID,
    },
    referenceDataIdentities: {
      artifactPath: bound.artifactPath,
      artifactSha256: bound.sha256,
      recordClassMappingVersion: bound.identities.recordClassMappingVersion,
      rawFormValueResolutionVersion: bound.identities.rawFormValueResolutionVersion,
      semanticTaxonomySnapshotId: bound.identities.semanticTaxonomySnapshotId,
      lifecycleMetadataInArtifactIsNotRuntimeAuthority: true,
    },
    requestedAt,
    evidenceCutoff,
    temporalAxis: "NOT_REQUIRED",
    closureDomains: [],
    propositionClasses: ["P1", "P2", "P3", "P4", "P5"],
    recordClasses: [...RECORD_CLASSES],
    physicalRecordDedupeKey: PHYSICAL_RECORD_DEDUPE_KEY,
    sides: {
      acquirer,
      target,
    },
    pair: {
      symmetricExecution,
      coverageBySide: {
        acquirer: acquirer.coverage,
        target: target.coverage,
      },
    },
    declaredLimitations: limitations,
  };
}

export function assertNoForbiddenSlice1Output(result: unknown) {
  const serialized = JSON.stringify(result);
  if (/"propositionClass":"P6"/.test(serialized) || /"P6"\s*:/.test(serialized)) {
    throw new Error("P6 must not appear in Slice-1 output");
  }
  if (/"supportClass"\s*:/.test(serialized)) {
    throw new Error("supportClass must not exist in Slice-1 output");
  }
  if (serialized.includes("MISSING_WITHIN_BOUND")) {
    throw new Error("MISSING_WITHIN_BOUND must not be actively emitted");
  }
}
