import React, { useEffect, useId, useRef, useState } from "react";
import { handleRouteClick, navigate } from "../../routes/navigation.js";
import { PublicButton } from "../../ui/public/PublicButton.jsx";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicHero } from "../../ui/public/PublicHero.jsx";
import { PublicPage } from "../../ui/public/PublicPage.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
import "../../styles/public-research-result.css";

export const PUBLIC_RESEARCH_RESULT_ROUTE = "/start-diagnostic/deal-context/result";
export const DEAL_ENTRY_ROUTE = "/start-diagnostic/deal-context";
export const START_PUBLIC_RESEARCH_PATH = "/api/start-public-research";
export const RESULT_NOT_ASSESSMENT_COPY = "This is bounded public-source SEC metadata, not a final MergeVue M&A assessment.";
export const RESEARCH_AVAILABLE_COPY = "Bounded recent SEC filing metadata is available for both companies.";
export const RESEARCH_PARTIAL_COPY = "Public-source coverage is partial. Coverage remains visibly partial and asymmetric.";
export const RESEARCH_NO_COVERAGE_COPY = "No recent filing coverage was returned within this bounded recent SEC filing search.";
export const RESEARCH_SERVICE_UNAVAILABLE_COPY = "Public-source research is currently unavailable.";
export const LOCAL_REQUEST_ERROR_COPY = "The public-source research request could not be completed. No research result is shown.";
export const INVALID_ROUTE_COPY = "This page cannot show a public research result from the current address. A valid ordered Acquirer CIK and Target CIK pair is required.";
export const LOADING_COPY = "Retrieving bounded recent SEC filing metadata…";
export const BACK_TO_DEAL_ENTRY_COPY = "Back to deal entry";

const PHASE_ROUTE_INVALID = "ROUTE_INVALID";
const PHASE_LOADING = "LOADING";
const PHASE_RESULT = "RESULT";
const PHASE_ERROR = "ERROR";

const SERVER_RESEARCH_AVAILABLE = "RESEARCH_AVAILABLE";
const SERVER_PARTIAL = "PARTIAL";
const SERVER_NO_COVERAGE = "NO_COVERAGE";
const SERVER_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
const SERVER_COVERAGE = "RECENT_FILING_HISTORY_ONLY";
const SERVER_IDENTITY_SOURCE = "SEC_SUBMISSIONS_API";
const SUBMISSIONS_RETRIEVED = "RETRIEVED";
const SUBMISSIONS_NO_COVERAGE = "NO_COVERAGE";
const SUBMISSIONS_NOT_RETRIEVABLE = "NOT_RETRIEVABLE";
const MAX_RECENT_FILINGS = 10;
const CANONICAL_CIK = /^\d{10}$/;
const PUBLIC_REPORT_SOURCE_MODE = "LEVEL1_MODE_D_SLICE1";
const PUBLIC_REPORT_AVAILABILITY = new Set([
  "AVAILABLE",
  "LIMITED",
  "INSUFFICIENT_PUBLIC_EVIDENCE",
  "NOT_APPLICABLE",
]);
const CANONICAL_BLOCK_NAMES = Object.freeze([
  "Executive Decision Summary",
  "Structural Watchpoints",
  "Compatibility Score & Deal Scenario",
  "Identified Environment Types",
  "Collision Thesis",
  "Resource Conflict Map",
  "Timeline of Expected Friction",
  "Economic Risk Translation",
  "Recommended Actions",
  "Decision Gap",
  "What the Full Engagement Adds",
  "Audit Footer",
]);
const DISPLAY_METADATA_COPY = "The following SEC filing metadata is display-only. It is not analytical or report authority.";

let publicResearchResultHandoff = null;

function comparableCik(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{1,10}$/.test(trimmed)) return null;
  return trimmed.padStart(10, "0");
}

function parsePublicResearchResultPair(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const acquirerCik = params.get("acquirerCik");
  const targetCik = params.get("targetCik");
  if (!CANONICAL_CIK.test(acquirerCik || "") || !CANONICAL_CIK.test(targetCik || "")) return null;
  if (acquirerCik === targetCik) return null;
  return { acquirerCik, targetCik };
}

function currentWindowSearch() {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

function currentRoutePair() {
  return parsePublicResearchResultPair(currentWindowSearch());
}

function pairKeyFor(pair, search) {
  return pair ? `ok:${pair.acquirerCik}:${pair.targetCik}` : `bad:${search}`;
}

function snapshotEquals(left, right) {
  return Boolean(
    left
    && right
    && left.acquirerCik === right.acquirerCik
    && left.targetCik === right.targetCik,
  );
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function usableCanonicalName(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function isNonNegativeInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isUsableFilingRow(row) {
  return Boolean(
    isPlainObject(row)
    && typeof row.form === "string"
    && row.form.trim()
    && typeof row.filingDate === "string"
    && row.filingDate.trim()
    && typeof row.accessionNumber === "string"
    && row.accessionNumber.trim(),
  );
}

function validateFilingList(recentFilings) {
  if (!Array.isArray(recentFilings)) return { ok: false };
  if (recentFilings.length > MAX_RECENT_FILINGS) return { ok: false };
  if (!recentFilings.every(isUsableFilingRow)) return { ok: false };
  return { ok: true };
}

function validateCompanyEntry(entry, expectedSide, expectedCik) {
  if (!isPlainObject(entry)) return { ok: false };
  if (entry.side !== expectedSide) return { ok: false };
  if (entry.side !== "acquirer" && entry.side !== "target") return { ok: false };
  if (comparableCik(entry.cik) !== expectedCik) return { ok: false };

  const submissionsStatus = entry.submissionsStatus;
  if (
    submissionsStatus !== SUBMISSIONS_RETRIEVED
    && submissionsStatus !== SUBMISSIONS_NO_COVERAGE
    && submissionsStatus !== SUBMISSIONS_NOT_RETRIEVABLE
  ) {
    return { ok: false };
  }

  if (submissionsStatus === SUBMISSIONS_RETRIEVED) {
    if (!usableCanonicalName(entry.canonicalName)) return { ok: false };
    if (!isNonNegativeInteger(entry.filingCount)) return { ok: false };
    const filings = validateFilingList(entry.recentFilings);
    if (!filings.ok) return { ok: false };
    if (entry.recentFilings.length < 1) return { ok: false };
    return { ok: true };
  }

  if (submissionsStatus === SUBMISSIONS_NO_COVERAGE) {
    if (!usableCanonicalName(entry.canonicalName)) return { ok: false };
    if (entry.filingCount !== 0) return { ok: false };
    if (!Array.isArray(entry.recentFilings) || entry.recentFilings.length !== 0) return { ok: false };
    return { ok: true };
  }

  if (entry.canonicalName != null && !usableCanonicalName(entry.canonicalName)) return { ok: false };
  if (entry.filingCount != null && !isNonNegativeInteger(entry.filingCount)) return { ok: false };
  if (entry.recentFilings != null) {
    const filings = validateFilingList(entry.recentFilings);
    if (!filings.ok) return { ok: false };
  }
  return { ok: true };
}

function validateCompaniesPair(companies, snapshot) {
  if (!Array.isArray(companies) || companies.length !== 2) return { ok: false };
  const sides = companies.map((entry) => entry && entry.side);
  if (sides.includes("acquirer") === false || sides.includes("target") === false) return { ok: false };
  if (sides.filter((side) => side === "acquirer").length !== 1) return { ok: false };
  if (sides.filter((side) => side === "target").length !== 1) return { ok: false };
  if (sides.some((side) => side !== "acquirer" && side !== "target")) return { ok: false };
  const acquirer = companies.find((entry) => entry.side === "acquirer");
  const target = companies.find((entry) => entry.side === "target");
  const acquirerCheck = validateCompanyEntry(acquirer, "acquirer", snapshot.acquirerCik);
  const targetCheck = validateCompanyEntry(target, "target", snapshot.targetCik);
  if (!acquirerCheck.ok || !targetCheck.ok) return { ok: false };
  return { ok: true, acquirer, target };
}

function availabilityCopy(state) {
  if (state === "AVAILABLE") return "Available";
  if (state === "LIMITED") return "Limited";
  if (state === "INSUFFICIENT_PUBLIC_EVIDENCE") return "Insufficient public evidence";
  if (state === "NOT_APPLICABLE") return "Not applicable";
  return state;
}

function validateServerLevel1(level1, snapshot) {
  if (!isPlainObject(level1) || !snapshot) return { ok: false };
  const sides = isPlainObject(level1.sides) ? level1.sides : null;
  if (!sides) return { ok: false };
  const acquirer = isPlainObject(sides.acquirer) ? sides.acquirer : null;
  const target = isPlainObject(sides.target) ? sides.target : null;
  if (!acquirer || !target) return { ok: false };
  if (comparableCik(acquirer.cik) !== snapshot.acquirerCik) return { ok: false };
  if (comparableCik(target.cik) !== snapshot.targetCik) return { ok: false };
  return { ok: true };
}

function validateCanonicalPublicReport(publicReport, snapshot) {
  if (!isPlainObject(publicReport) || !snapshot) return { ok: false };
  if (publicReport.sourceMode !== PUBLIC_REPORT_SOURCE_MODE) return { ok: false };
  if (typeof publicReport.schemaVersion !== "string" || !publicReport.schemaVersion.trim()) return { ok: false };
  const metadata = publicReport.metadata;
  if (!isPlainObject(metadata) || !isPlainObject(metadata.pair)) return { ok: false };
  if (metadata.pair.acquirerCik !== snapshot.acquirerCik) return { ok: false };
  if (metadata.pair.targetCik !== snapshot.targetCik) return { ok: false };
  if (!Array.isArray(publicReport.blocks) || publicReport.blocks.length !== 12) return { ok: false };
  for (let index = 0; index < 12; index += 1) {
    const row = publicReport.blocks[index];
    if (!isPlainObject(row)) return { ok: false };
    if (row.number !== index + 1) return { ok: false };
    if (row.canonicalName !== CANONICAL_BLOCK_NAMES[index]) return { ok: false };
    if (!PUBLIC_REPORT_AVAILABILITY.has(row.availabilityState)) return { ok: false };
    if (typeof row.blockId !== "string" || !row.blockId.trim()) return { ok: false };
  }
  return { ok: true, publicReport };
}

function validatePublicResearchResultPayload(payload, snapshot) {
  if (!isPlainObject(payload) || !snapshot) return { ok: false };
  const researchStatus = payload.researchStatus;
  if (
    researchStatus !== SERVER_RESEARCH_AVAILABLE
    && researchStatus !== SERVER_PARTIAL
    && researchStatus !== SERVER_NO_COVERAGE
    && researchStatus !== SERVER_SERVICE_UNAVAILABLE
  ) {
    return { ok: false };
  }
  if (payload.coverage !== SERVER_COVERAGE) return { ok: false };
  if (payload.identitySource !== SERVER_IDENTITY_SOURCE) return { ok: false };

  const hasCompanies = Object.prototype.hasOwnProperty.call(payload, "companies");

  if (researchStatus === SERVER_SERVICE_UNAVAILABLE) {
    if (hasCompanies) {
      const pair = validateCompaniesPair(payload.companies, snapshot);
      if (!pair.ok) return { ok: false };
      if (pair.acquirer.submissionsStatus !== SUBMISSIONS_NOT_RETRIEVABLE) return { ok: false };
      if (pair.target.submissionsStatus !== SUBMISSIONS_NOT_RETRIEVABLE) return { ok: false };
    }
    const report = validateCanonicalPublicReport(payload.publicReport, snapshot);
    if (!report.ok) return { ok: false };
    const level1 = validateServerLevel1(payload.level1, snapshot);
    if (!level1.ok) return { ok: false };
    return { ok: true, payload };
  }

  if (!hasCompanies) return { ok: false };
  const pair = validateCompaniesPair(payload.companies, snapshot);
  if (!pair.ok) return { ok: false };
  const report = validateCanonicalPublicReport(payload.publicReport, snapshot);
  if (!report.ok) return { ok: false };
  const level1 = validateServerLevel1(payload.level1, snapshot);
  if (!level1.ok) return { ok: false };
  return { ok: true, payload };
}

function buildPublicResearchResultUrl(pair) {
  return `${PUBLIC_RESEARCH_RESULT_ROUTE}?acquirerCik=${pair.acquirerCik}&targetCik=${pair.targetCik}`;
}

function matchingHandoffPayload(pair) {
  const stored = publicResearchResultHandoff;
  if (!stored || !pair) return null;
  if (!snapshotEquals(stored, pair)) return null;
  const accepted = validatePublicResearchResultPayload(stored.payload, pair);
  if (!accepted.ok) return null;
  return accepted.payload;
}

export function storePublicResearchResultHandoff(record) {
  if (!isPlainObject(record)) {
    publicResearchResultHandoff = null;
    return;
  }
  publicResearchResultHandoff = {
    acquirerCik: record.acquirerCik,
    targetCik: record.targetCik,
    payload: record.payload,
  };
}

export function readPublicResearchResultHandoff() {
  return publicResearchResultHandoff;
}

export function openPublicResearchResult(pair, payload) {
  if (!pair || !payload) return false;
  if (!CANONICAL_CIK.test(pair.acquirerCik || "") || !CANONICAL_CIK.test(pair.targetCik || "")) return false;
  if (pair.acquirerCik === pair.targetCik) return false;
  const companiesAccepted = isPlainObject(payload)
    && payload.coverage === SERVER_COVERAGE
    && payload.identitySource === SERVER_IDENTITY_SOURCE;
  if (!companiesAccepted) return false;
  const accepted = validatePublicResearchResultPayload(payload, pair);
  if (accepted.ok) {
    storePublicResearchResultHandoff({
      acquirerCik: pair.acquirerCik,
      targetCik: pair.targetCik,
      payload: accepted.payload,
    });
  } else {
    publicResearchResultHandoff = null;
  }
  navigate(buildPublicResearchResultUrl(pair));
  return true;
}

function researchHeadline(researchStatus) {
  if (researchStatus === SERVER_RESEARCH_AVAILABLE) return RESEARCH_AVAILABLE_COPY;
  if (researchStatus === SERVER_PARTIAL) return RESEARCH_PARTIAL_COPY;
  if (researchStatus === SERVER_NO_COVERAGE) return RESEARCH_NO_COVERAGE_COPY;
  if (researchStatus === SERVER_SERVICE_UNAVAILABLE) return RESEARCH_SERVICE_UNAVAILABLE_COPY;
  return LOCAL_REQUEST_ERROR_COPY;
}

function submissionsStatusCopy(status) {
  if (status === SUBMISSIONS_RETRIEVED) return "Retrieved";
  if (status === SUBMISSIONS_NO_COVERAGE) return "No recent filing coverage";
  if (status === SUBMISSIONS_NOT_RETRIEVABLE) return "Not retrievable";
  return status;
}

async function requestPublicResearch(pair, signal) {
  const response = await fetch(START_PUBLIC_RESEARCH_PATH, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      acquirer: { cik: pair.acquirerCik },
      target: { cik: pair.targetCik },
    }),
    signal,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { status: response.status, payload };
}

function BackToDealEntry() {
  return (
    <PublicButton
      className="mv-research-result-back"
      href={DEAL_ENTRY_ROUTE}
      onClick={handleRouteClick(DEAL_ENTRY_ROUTE)}
      variant="secondary"
    >
      {BACK_TO_DEAL_ENTRY_COPY}
    </PublicButton>
  );
}

function renderFilings(sideLabel, recentFilings) {
  if (!Array.isArray(recentFilings) || recentFilings.length === 0) return null;
  return (
    <div className="mv-research-result-table-wrap">
      <table className="mv-research-result-filings">
        <caption className="mv-research-result-filings-caption">
          Recent SEC filing metadata for {sideLabel}
        </caption>
        <thead>
          <tr>
            <th scope="col">Form</th>
            <th scope="col">Filing date</th>
            <th scope="col">Accession number</th>
          </tr>
        </thead>
        <tbody>
          {recentFilings.map((row, index) => (
            <tr key={`${row.accessionNumber}-${index}`}>
              <td>{row.form}</td>
              <td>{row.filingDate}</td>
              <td>{row.accessionNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderFactList(items, emptyCopy) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="mv-research-result-copy">{emptyCopy}</p>;
  }
  return (
    <ul className="mv-research-result-fact-list">
      {items.map((item, index) => (
        <li key={`${item.side || "item"}-${item.publicRecordClass || item.statement || index}`}>
          {item.side ? `${item.side === "acquirer" ? "Acquirer" : item.side === "target" ? "Target" : item.side}: ` : ""}
          {item.statement || item.publicRecordClass}
          {Array.isArray(item.exactRawValues) && item.exactRawValues.length > 0 ? (
            <span> Exact raw values: {item.exactRawValues.join(", ")}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function renderProvenance(bindings) {
  if (!Array.isArray(bindings) || bindings.length === 0) return null;
  return (
    <ul className="mv-research-result-provenance">
      {bindings.map((binding, index) => {
        const locator = isPlainObject(binding.exactLocator) ? binding.exactLocator : {};
        return (
          <li key={`${binding.propositionId || binding.physicalRecordKey || index}`}>
            {binding.filedOrPublishedDate ? `Filed ${binding.filedOrPublishedDate}. ` : ""}
            {locator.accessionNumber ? `Accession ${locator.accessionNumber}. ` : ""}
            {binding.retrievedAt ? `Retrieved ${binding.retrievedAt}.` : ""}
          </li>
        );
      })}
    </ul>
  );
}

function renderBlockContent(block) {
  const content = isPlainObject(block.content) ? block.content : null;
  if (block.availabilityState === "INSUFFICIENT_PUBLIC_EVIDENCE" || block.availabilityState === "NOT_APPLICABLE") {
    return <p className="mv-research-result-copy">{block.availabilityReason}</p>;
  }
  if (!content) return <p className="mv-research-result-copy">{block.availabilityReason}</p>;

  if (block.number === 1) {
    const pair = isPlainObject(content.pair) ? content.pair : {};
    const collection = isPlainObject(content.collection) ? content.collection : {};
    const coverage = isPlainObject(collection.coverageBySide) ? collection.coverageBySide : {};
    return (
      <div className="mv-research-result-block-body">
        <p className="mv-research-result-copy">{block.availabilityReason}</p>
        <p className="mv-research-result-meta">
          Ordered pair: Acquirer {pair.acquirer?.cik || "unknown"} → Target {pair.target?.cik || "unknown"}
        </p>
        {pair.acquirer?.sourceIdentity ? (
          <p className="mv-research-result-meta">Acquirer published identity: {String(pair.acquirer.sourceIdentity)}</p>
        ) : null}
        {pair.target?.sourceIdentity ? (
          <p className="mv-research-result-meta">Target published identity: {String(pair.target.sourceIdentity)}</p>
        ) : null}
        <p className="mv-research-result-meta">
          Collection coverage: Acquirer {coverage.acquirer || "unknown"}; Target {coverage.target || "unknown"}
        </p>
        <p className="mv-research-result-meta">
          Symmetric execution: {collection.symmetricExecution === true ? "true" : "false"}
        </p>
        {collection.evidenceCutoff ? (
          <p className="mv-research-result-meta">Evidence cutoff: {collection.evidenceCutoff}</p>
        ) : null}
        {collection.sourceFamily ? (
          <p className="mv-research-result-meta">Source family: {collection.sourceFamily}</p>
        ) : null}
        <h4 className="mv-research-result-block-subtitle">Established identities</h4>
        {renderFactList(content.establishedIdentities, "No filer identity was established in this bound.")}
        <h4 className="mv-research-result-block-subtitle">Established record classes</h4>
        {Array.isArray(content.establishedRecordClasses) && content.establishedRecordClasses.length > 0 ? (
          <ul className="mv-research-result-fact-list">
            {content.establishedRecordClasses.map((item) => (
              <li key={`${item.side}-${item.publicRecordClass}`}>
                {item.side === "acquirer" ? "Acquirer" : "Target"}: {item.statement}
                {renderProvenance(item.evidenceBindings)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mv-research-result-copy">No record class was positively established in this bound.</p>
        )}
        <h4 className="mv-research-result-block-subtitle">Established structured item codes</h4>
        {renderFactList(content.establishedStructuredItemCodes, "No structured item-code value was established in this bound.")}
      </div>
    );
  }

  if (block.number === 10) {
    return (
      <div className="mv-research-result-block-body">
        <p className="mv-research-result-copy">{block.availabilityReason}</p>
        <h4 className="mv-research-result-block-subtitle">Established evidence</h4>
        {renderFactList(content.established, "No record class was positively established in this bound.")}
        <h4 className="mv-research-result-block-subtitle">Not established within bound</h4>
        {renderFactList(content.notEstablishedWithinBound, "No NOT_ESTABLISHED_WITHIN_BOUND evidence gap is listed.")}
        <h4 className="mv-research-result-block-subtitle">Collection limitations</h4>
        {renderFactList(content.collectionLimitations, "No collection limitation is listed.")}
        <h4 className="mv-research-result-block-subtitle">Unmapped or unresolved raw values</h4>
        {renderFactList(content.unmappedOrUnresolved, "No unmapped or unresolved raw value is listed.")}
        <p className="mv-research-result-meta">
          Asymmetric execution: {content.asymmetricExecution === true ? "true" : "false"}
        </p>
        <p className="mv-research-result-meta">
          Lawful evidence-acquisition channel: not authorized for the current Level-1 conditions.
        </p>
      </div>
    );
  }

  if (block.number === 11) {
    return (
      <div className="mv-research-result-block-body">
        <p className="mv-research-result-copy">{content.separator}</p>
        {Array.isArray(content.benefits) ? content.benefits.map((line) => (
          <p className="mv-research-result-copy" key={line}>{line}</p>
        )) : null}
        {content.cta ? <p className="mv-research-result-copy">{content.cta}</p> : null}
      </div>
    );
  }

  if (block.number === 12) {
    const pair = isPlainObject(content.orderedPair) ? content.orderedPair : {};
    const coverage = isPlainObject(content.coverageBySide) ? content.coverageBySide : {};
    const versions = isPlainObject(content.referenceDataVersions) ? content.referenceDataVersions : {};
    return (
      <div className="mv-research-result-block-body">
        <p className="mv-research-result-meta">Report version: {content.reportVersion}</p>
        <p className="mv-research-result-meta">Schema version: {content.schemaVersion}</p>
        <p className="mv-research-result-meta">Requested at: {content.requestedAt}</p>
        <p className="mv-research-result-meta">Generated at: {content.generatedAt}</p>
        <p className="mv-research-result-meta">Evidence cutoff: {content.evidenceCutoff}</p>
        <p className="mv-research-result-meta">
          Ordered pair: Acquirer {pair.acquirerCik} → Target {pair.targetCik}
        </p>
        <p className="mv-research-result-meta">Source family: {content.sourceFamily}</p>
        <p className="mv-research-result-meta">Collection bound: {content.collectionBoundId}</p>
        <p className="mv-research-result-meta">
          Coverage: Acquirer {coverage.acquirer}; Target {coverage.target}
        </p>
        <p className="mv-research-result-meta">
          Symmetric execution: {content.symmetricExecution === true ? "true" : "false"}
        </p>
        <p className="mv-research-result-meta">
          Reference-data versions: {versions.recordClassMappingVersion}; {versions.rawFormValueResolutionVersion}; {versions.semanticTaxonomySnapshotId}
        </p>
      </div>
    );
  }

  return <p className="mv-research-result-copy">{block.availabilityReason}</p>;
}

function renderCanonicalReport(publicReport) {
  if (!isPlainObject(publicReport) || !Array.isArray(publicReport.blocks)) return null;
  return (
    <ol className="mv-research-result-report" data-public-report="canonical">
      {publicReport.blocks.map((block) => (
        <li
          className="mv-research-result-block"
          data-availability={block.availabilityState}
          data-block-id={block.blockId}
          key={block.blockId}
        >
          <h3 className="mv-research-result-block-title">
            {block.number}. {block.canonicalName}
          </h3>
          <p className="mv-research-result-availability">
            {availabilityCopy(block.availabilityState)}
          </p>
          {renderBlockContent(block)}
        </li>
      ))}
    </ol>
  );
}

function renderSide(payload, side, label) {
  const companies = Array.isArray(payload?.companies) ? payload.companies : null;
  if (!companies) return null;
  const entry = companies.find((item) => item.side === side);
  if (!entry) return null;
  const canonicalName = usableCanonicalName(entry.canonicalName) ? entry.canonicalName.trim() : null;
  return (
    <section className="mv-research-result-side" data-research-side={side}>
      <h3 className="mv-research-result-side-title">{label}</h3>
      <p className="mv-research-result-meta">CIK: {entry.cik}</p>
      <p className="mv-research-result-meta">
        Submissions status: {submissionsStatusCopy(entry.submissionsStatus)} ({entry.submissionsStatus})
      </p>
      {canonicalName ? (
        <p className="mv-research-result-name">Canonical name: {canonicalName}</p>
      ) : (
        <p className="mv-research-result-name">Canonical name was not returned by the server.</p>
      )}
      {entry.filingCount == null ? (
        <p className="mv-research-result-meta">Filing count was not returned by the server.</p>
      ) : (
        <p className="mv-research-result-meta">Bounded filing count: {entry.filingCount}</p>
      )}
      {renderFilings(label, entry.recentFilings)}
    </section>
  );
}

export function PublicResearchResultScreen() {
  const statusId = useId();
  const headingId = useId();
  const search = currentWindowSearch();
  const routePair = parsePublicResearchResultPair(search);
  const pairKey = pairKeyFor(routePair, search);
  const reusedHandoff = matchingHandoffPayload(routePair);
  const [phase, setPhase] = useState(() => {
    if (!routePair) return PHASE_ROUTE_INVALID;
    if (reusedHandoff) return PHASE_RESULT;
    return PHASE_LOADING;
  });
  const [payload, setPayload] = useState(() => reusedHandoff);
  const [localError, setLocalError] = useState(null);
  const generationRef = useRef(0);
  const abortRef = useRef(null);
  const requestLockRef = useRef(false);

  useEffect(() => {
    const pair = currentRoutePair();
    generationRef.current += 1;
    const generation = generationRef.current;
    abortRef.current?.abort();
    abortRef.current = null;
    requestLockRef.current = false;

    if (!pair) {
      setPhase(PHASE_ROUTE_INVALID);
      setPayload(null);
      setLocalError(null);
      return () => {
        generationRef.current += 1;
        abortRef.current?.abort();
        abortRef.current = null;
        requestLockRef.current = false;
      };
    }

    const reused = matchingHandoffPayload(pair);
    if (reused) {
      setPhase(PHASE_RESULT);
      setPayload(reused);
      setLocalError(null);
      return () => {
        generationRef.current += 1;
        abortRef.current?.abort();
        abortRef.current = null;
        requestLockRef.current = false;
      };
    }

    requestLockRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase(PHASE_LOADING);
    setPayload(null);
    setLocalError(null);

    void (async () => {
      try {
        const result = await requestPublicResearch(pair, controller.signal);
        if (generationRef.current !== generation) return;
        const currentPair = currentRoutePair();
        if (!snapshotEquals(currentPair, pair)) return;
        const accepted = validatePublicResearchResultPayload(result.payload, pair);
        if (!accepted.ok) {
          requestLockRef.current = false;
          setPhase(PHASE_ERROR);
          setPayload(null);
          setLocalError(LOCAL_REQUEST_ERROR_COPY);
          return;
        }
        requestLockRef.current = false;
        setPhase(PHASE_RESULT);
        setPayload(accepted.payload);
        setLocalError(null);
      } catch (error) {
        if (error && typeof error === "object" && error.name === "AbortError") return;
        if (generationRef.current !== generation) return;
        const currentPair = currentRoutePair();
        if (!snapshotEquals(currentPair, pair)) return;
        requestLockRef.current = false;
        setPhase(PHASE_ERROR);
        setPayload(null);
        setLocalError(LOCAL_REQUEST_ERROR_COPY);
      }
    })();

    return () => {
      generationRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      requestLockRef.current = false;
    };
  }, [pairKey]);

  const statusText = phase === PHASE_ROUTE_INVALID
    ? INVALID_ROUTE_COPY
    : phase === PHASE_LOADING
      ? LOADING_COPY
      : phase === PHASE_ERROR
        ? (localError || LOCAL_REQUEST_ERROR_COPY)
        : phase === PHASE_RESULT && payload
          ? researchHeadline(payload.researchStatus)
          : INVALID_ROUTE_COPY;

  const requestedAt = typeof payload?.requestedAt === "string" && payload.requestedAt.trim()
    ? payload.requestedAt.trim()
    : null;

  return (
    <PublicPage className="mv-research-result-page" mainId="mv-research-result-main">
      <PublicHero
        eyebrow="Public research result"
        title="Public research result"
        lead={RESULT_NOT_ASSESSMENT_COPY}
      />

      <PublicSection className="mv-research-result" labelledBy={headingId}>
        <PublicCard className="mv-research-result-card">
          <h2 className="mv-research-result-title" id={headingId}>Bounded SEC research</h2>
          <div
            aria-busy={phase === PHASE_LOADING || undefined}
            aria-live="polite"
            className="mv-research-result-status"
            data-renderer="PublicResearchResultScreen"
            data-result-phase={phase}
            data-research-status={phase === PHASE_RESULT && payload ? payload.researchStatus : ""}
            id={statusId}
            role="status"
          >
            {statusText}
          </div>

          {phase === PHASE_ROUTE_INVALID ? (
            <div className="mv-research-result-empty">
              <p className="mv-research-result-copy">{INVALID_ROUTE_COPY}</p>
              <p className="mv-research-result-copy">{RESULT_NOT_ASSESSMENT_COPY}</p>
              <BackToDealEntry />
            </div>
          ) : null}

          {phase === PHASE_LOADING ? (
            <p className="mv-research-result-copy">{LOADING_COPY}</p>
          ) : null}

          {phase === PHASE_ERROR ? (
            <div className="mv-research-result-empty">
              <p className="mv-research-result-copy">{localError || LOCAL_REQUEST_ERROR_COPY}</p>
              <p className="mv-research-result-copy">{RESULT_NOT_ASSESSMENT_COPY}</p>
              <BackToDealEntry />
            </div>
          ) : null}

          {phase === PHASE_RESULT && payload ? (
            <div className="mv-research-result-body">
              <p className="mv-research-result-copy">{researchHeadline(payload.researchStatus)}</p>
              <p className="mv-research-result-meta">Research status: {payload.researchStatus}</p>
              <p className="mv-research-result-meta">
                Coverage: recent filing history only ({payload.coverage})
              </p>
              <p className="mv-research-result-meta">
                Identity source: SEC submissions API ({payload.identitySource})
              </p>
              {requestedAt ? (
                <p className="mv-research-result-meta">Requested at: {requestedAt}</p>
              ) : (
                <p className="mv-research-result-meta">Requested time was not returned by the server.</p>
              )}
              {routePair ? (
                <p className="mv-research-result-meta">
                  Ordered pair: Acquirer {routePair.acquirerCik} → Target {routePair.targetCik}
                </p>
              ) : null}
              <p className="mv-research-result-copy">{RESULT_NOT_ASSESSMENT_COPY}</p>
              <p className="mv-research-result-limitations">
                Limitations: the canonical public result is the server-created twelve-block
                projection below. Display-only SEC filing metadata is not report authority.
                This is not a forecast, deal verdict, risk score, integration score, culture score,
                synergy score, questionnaire result, or final MergeVue M&A assessment.
              </p>
              {renderCanonicalReport(payload.publicReport)}
              <p className="mv-research-result-copy">{DISPLAY_METADATA_COPY}</p>
              <div className="mv-research-result-sides">
                {renderSide(payload, "acquirer", "Acquirer")}
                {renderSide(payload, "target", "Target")}
              </div>
              <BackToDealEntry />
            </div>
          ) : null}
        </PublicCard>
      </PublicSection>
    </PublicPage>
  );
}
