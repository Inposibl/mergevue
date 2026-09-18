import React, { useEffect, useId, useRef, useState } from "react";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicHero } from "../../ui/public/PublicHero.jsx";
import { PublicPage } from "../../ui/public/PublicPage.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
import { openPublicResearchResult } from "./PublicResearchResultScreen.jsx";
import "../../styles/public-deal-entry.css";

export const DIFFERENT_COMPANY_ERROR = "Acquirer and target must be different companies.";
export const DEFAULT_ENTRY_EXPLANATION = "Enter the acquirer and target, then confirm the companies. Analyze this deal is not available yet.";
export const RESOLVING_COPY = "Finding the company...";
export const CONFIRMED_COPY = "Company confirmed.";
export const AMBIGUOUS_COPY = "Which company do you mean?";
export const AMBIGUOUS_ACQUIRER_ACCESSIBLE_NAME = "Which company do you mean? (Acquirer)";
export const AMBIGUOUS_TARGET_ACCESSIBLE_NAME = "Which company do you mean? (Target)";
export const NOT_FOUND_COPY = "We couldn't identify that company from the current public identity source. Try the listed or legal company name.";
export const SERVICE_UNAVAILABLE_COPY = "Company lookup is temporarily unavailable. Try again.";
export const RESEARCH_READY_COPY = "Companies confirmed. Public-source research is ready to start.";
export const RESEARCH_SCOPE_COPY = "This step retrieves recent SEC filing metadata only.";
export const RESEARCHING_COPY = "Researching recent SEC filing metadata…";
export const LOCAL_REQUEST_ERROR_COPY = "The public-source research request could not be completed. No research result is shown.";
export const RESEARCH_NOT_ASSESSMENT_COPY = "This is bounded public-source SEC metadata, not a final MergeVue M&A assessment.";
export const RESEARCH_AVAILABLE_COPY = "Recent SEC filing metadata is available for both companies.";
export const RESEARCH_PARTIAL_COPY = "Public-source coverage is partial.";
export const RESEARCH_NO_COVERAGE_COPY = "No recent filing coverage was returned in this bounded SEC acquisition.";
export const RESEARCH_SERVICE_UNAVAILABLE_COPY = "Public-source research is currently unavailable.";
export const VIEW_PUBLIC_RESEARCH_RESULT_COPY = "View public research result";
export const RESOLVE_COMPANY_PATH = "/api/resolve-company";
export const START_PUBLIC_RESEARCH_PATH = "/api/start-public-research";

const EMPTY = "EMPTY";
const EDITING = "EDITING";
const RESOLVING = "RESOLVING";
const CONFIRMED = "CONFIRMED";
const AMBIGUOUS = "AMBIGUOUS";
const NOT_FOUND = "NOT_FOUND";
const SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";

const RESEARCH_IDLE = "IDLE";
const RESEARCH_REQUESTING = "REQUESTING";
const RESEARCH_RESULT = "RESULT";
const RESEARCH_REQUEST_ERROR = "REQUEST_ERROR";

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

function normalizedCompanyName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function comparableCik(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{1,10}$/.test(trimmed)) return null;
  return trimmed.padStart(10, "0");
}

function emptySide() {
  return {
    status: EMPTY,
    identity: null,
    candidates: [],
    selectedCik: "",
  };
}

function emptyResearch() {
  return {
    phase: RESEARCH_IDLE,
    snapshot: null,
    payload: null,
    localError: null,
  };
}

function stateAfterInvalidatedSwap(incomingState, incomingName) {
  if (incomingState.status !== RESOLVING) return incomingState;
  return incomingName.trim() ? { ...emptySide(), status: EDITING } : emptySide();
}

function identityFromPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (typeof payload.cik !== "string" || typeof payload.canonicalName !== "string") return null;
  return {
    canonicalName: payload.canonicalName,
    cik: payload.cik,
    ticker: typeof payload.ticker === "string" ? payload.ticker : "",
    exchange: typeof payload.exchange === "string" ? payload.exchange : "",
  };
}

function candidateLabel(candidate) {
  const ticker = candidate.ticker ? candidate.ticker : "";
  const exchange = candidate.exchange ? candidate.exchange : "";
  if (ticker && exchange) return `${candidate.canonicalName} (${ticker} · ${exchange})`;
  if (ticker) return `${candidate.canonicalName} (${ticker})`;
  return candidate.canonicalName;
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

export function validatePublicResearchPayload(payload, snapshot) {
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
    if (!hasCompanies) return { ok: true, payload };
    const pair = validateCompaniesPair(payload.companies, snapshot);
    if (!pair.ok) return { ok: false };
    if (pair.acquirer.submissionsStatus !== SUBMISSIONS_NOT_RETRIEVABLE) return { ok: false };
    if (pair.target.submissionsStatus !== SUBMISSIONS_NOT_RETRIEVABLE) return { ok: false };
    return { ok: true, payload };
  }

  if (!hasCompanies) return { ok: false };
  const pair = validateCompaniesPair(payload.companies, snapshot);
  if (!pair.ok) return { ok: false };
  return { ok: true, payload };
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

async function requestCompanyResolution(query, confirmCik, signal) {
  const body = confirmCik ? { query, confirmCik } : { query };
  const response = await fetch(RESOLVE_COMPANY_PATH, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal,
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { ok: response.ok, status: response.status, payload };
}

async function requestPublicResearch(snapshot, signal) {
  const response = await fetch(START_PUBLIC_RESEARCH_PATH, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      acquirer: { cik: snapshot.acquirerCik },
      target: { cik: snapshot.targetCik },
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

function applyResolutionPayload(payload) {
  const status = payload && typeof payload.resolutionStatus === "string"
    ? payload.resolutionStatus
    : "";
  if (status === "EXACT" || status === "NORMALIZED_EXACT" || status === "CONFIRMED") {
    const identity = identityFromPayload(payload);
    if (!identity) {
      return { status: SERVICE_UNAVAILABLE, identity: null, candidates: [], selectedCik: "" };
    }
    return { status: CONFIRMED, identity, candidates: [], selectedCik: identity.cik };
  }
  if (status === "AMBIGUOUS") {
    const candidates = Array.isArray(payload.candidates) ? payload.candidates.slice(0, 5) : [];
    return { status: AMBIGUOUS, identity: null, candidates, selectedCik: "" };
  }
  if (status === "NOT_FOUND") {
    return { status: NOT_FOUND, identity: null, candidates: [], selectedCik: "" };
  }
  return { status: SERVICE_UNAVAILABLE, identity: null, candidates: [], selectedCik: "" };
}

export function DealEntryScreen() {
  const acquirerId = useId();
  const targetId = useId();
  const errorId = useId();
  const statusId = useId();
  const acquirerAmbiguousId = useId();
  const targetAmbiguousId = useId();
  const researchHeadingId = useId();
  const [acquirerName, setAcquirerName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [acquirer, setAcquirer] = useState(emptySide);
  const [target, setTarget] = useState(emptySide);
  const [research, setResearch] = useState(emptyResearch);
  const acquirerAbort = useRef(null);
  const targetAbort = useRef(null);
  const acquirerGeneration = useRef(0);
  const targetGeneration = useRef(0);
  const researchAbort = useRef(null);
  const researchGeneration = useRef(0);
  const researchLock = useRef(false);
  const acquirerRef = useRef(acquirer);
  const targetRef = useRef(target);
  acquirerRef.current = acquirer;
  targetRef.current = target;

  const bothFilled = Boolean(acquirerName.trim() && targetName.trim());
  const sameTypedCompany = bothFilled && normalizedCompanyName(acquirerName) === normalizedCompanyName(targetName);
  const sameResolvedCompany = Boolean(
    acquirer.status === CONFIRMED
    && target.status === CONFIRMED
    && acquirer.identity
    && target.identity
    && acquirer.identity.cik === target.identity.cik,
  );
  const acquirerConfirmedCik = acquirer.status === CONFIRMED ? comparableCik(acquirer.identity?.cik) : null;
  const targetConfirmedCik = target.status === CONFIRMED ? comparableCik(target.identity?.cik) : null;
  const companiesConfirmedForResearch = Boolean(
    acquirerConfirmedCik
    && targetConfirmedCik
    && acquirerConfirmedCik !== targetConfirmedCik,
  );
  const resolving = acquirer.status === RESOLVING || target.status === RESOLVING;
  const sameCompany = sameResolvedCompany || (sameTypedCompany && acquirer.status !== CONFIRMED && target.status !== CONFIRMED);
  const error = sameCompany ? DIFFERENT_COMPANY_ERROR : "";
  const confirmEnabled = bothFilled && !resolving;
  const analyzeEnabled = companiesConfirmedForResearch && research.phase !== RESEARCH_REQUESTING;
  const currentResearchSnapshot = companiesConfirmedForResearch
    ? { acquirerCik: acquirerConfirmedCik, targetCik: targetConfirmedCik }
    : null;
  const canViewPublicResearchResult = Boolean(
    research.phase === RESEARCH_RESULT
    && research.payload
    && research.snapshot
    && currentResearchSnapshot
    && snapshotEquals(research.snapshot, currentResearchSnapshot)
    && validatePublicResearchPayload(research.payload, currentResearchSnapshot).ok,
  );

  const pageStatus = research.phase === RESEARCH_REQUESTING
    ? RESEARCHING_COPY
    : research.phase === RESEARCH_REQUEST_ERROR
      ? LOCAL_REQUEST_ERROR_COPY
      : research.phase === RESEARCH_RESULT && research.payload
        ? researchHeadline(research.payload.researchStatus)
        : resolving
          ? RESOLVING_COPY
          : sameResolvedCompany
            ? DIFFERENT_COMPANY_ERROR
            : companiesConfirmedForResearch
              ? RESEARCH_READY_COPY
              : acquirer.status === SERVICE_UNAVAILABLE || target.status === SERVICE_UNAVAILABLE
                ? SERVICE_UNAVAILABLE_COPY
                : acquirer.status === NOT_FOUND || target.status === NOT_FOUND
                  ? NOT_FOUND_COPY
                  : acquirer.status === AMBIGUOUS || target.status === AMBIGUOUS
                    ? AMBIGUOUS_COPY
                    : acquirer.status === CONFIRMED || target.status === CONFIRMED
                      ? CONFIRMED_COPY
                      : DEFAULT_ENTRY_EXPLANATION;

  const describedBy = [statusId, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  function currentConfirmedSnapshot() {
    const currentAcquirer = acquirerRef.current;
    const currentTarget = targetRef.current;
    if (currentAcquirer.status !== CONFIRMED || currentTarget.status !== CONFIRMED) return null;
    const nextAcquirerCik = comparableCik(currentAcquirer.identity?.cik);
    const nextTargetCik = comparableCik(currentTarget.identity?.cik);
    if (!nextAcquirerCik || !nextTargetCik || nextAcquirerCik === nextTargetCik) return null;
    return { acquirerCik: nextAcquirerCik, targetCik: nextTargetCik };
  }

  function abortResearchRequest() {
    researchGeneration.current += 1;
    researchAbort.current?.abort();
    researchAbort.current = null;
    researchLock.current = false;
  }

  function clearResearchState() {
    abortResearchRequest();
    setResearch(emptyResearch());
  }

  useEffect(() => {
    return () => {
      researchGeneration.current += 1;
      researchAbort.current?.abort();
      researchAbort.current = null;
      researchLock.current = false;
    };
  }, []);

  function invalidateSide(side, nextValue) {
    const trimmed = nextValue.trim();
    if (side === "acquirer") acquirerGeneration.current += 1;
    else targetGeneration.current += 1;
    const abortRef = side === "acquirer" ? acquirerAbort : targetAbort;
    abortRef.current?.abort();
    abortRef.current = null;
    clearResearchState();
    const nextState = trimmed ? { ...emptySide(), status: EDITING } : emptySide();
    if (side === "acquirer") setAcquirer(nextState);
    else setTarget(nextState);
  }

  function swapCompanies() {
    acquirerGeneration.current += 1;
    targetGeneration.current += 1;
    acquirerAbort.current?.abort();
    targetAbort.current?.abort();
    acquirerAbort.current = null;
    targetAbort.current = null;
    clearResearchState();
    const nextAcquirerName = targetName;
    const nextTargetName = acquirerName;
    setAcquirerName(nextAcquirerName);
    setTargetName(nextTargetName);
    setAcquirer(stateAfterInvalidatedSwap(target, nextAcquirerName));
    setTarget(stateAfterInvalidatedSwap(acquirer, nextTargetName));
  }

  async function resolveOne(side, query, confirmCik, generation) {
    const abortRef = side === "acquirer" ? acquirerAbort : targetAbort;
    const generationRef = side === "acquirer" ? acquirerGeneration : targetGeneration;
    const setSide = side === "acquirer" ? setAcquirer : setTarget;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSide({ status: RESOLVING, identity: null, candidates: [], selectedCik: "" });
    try {
      const result = await requestCompanyResolution(query, confirmCik, controller.signal);
      if (generationRef.current !== generation) return;
      if (!result.ok && result.status !== 400) {
        setSide({ status: SERVICE_UNAVAILABLE, identity: null, candidates: [], selectedCik: "" });
        return;
      }
      if (!result.payload || typeof result.payload !== "object") {
        setSide({ status: SERVICE_UNAVAILABLE, identity: null, candidates: [], selectedCik: "" });
        return;
      }
      setSide(applyResolutionPayload(result.payload));
    } catch (error) {
      if (error && typeof error === "object" && error.name === "AbortError") return;
      if (generationRef.current !== generation) return;
      setSide({ status: SERVICE_UNAVAILABLE, identity: null, candidates: [], selectedCik: "" });
    }
  }

  function confirmCompanies(event) {
    event.preventDefault();
    if (!confirmEnabled) return;
    const acquirerQuery = acquirerName.trim();
    const targetQuery = targetName.trim();
    acquirerGeneration.current += 1;
    targetGeneration.current += 1;
    const acquirerGen = acquirerGeneration.current;
    const targetGen = targetGeneration.current;
    clearResearchState();
    void resolveOne("acquirer", acquirerQuery, undefined, acquirerGen);
    void resolveOne("target", targetQuery, undefined, targetGen);
  }

  function confirmCandidate(side, cik) {
    const query = side === "acquirer" ? acquirerName.trim() : targetName.trim();
    if (!query || !cik) return;
    clearResearchState();
    if (side === "acquirer") {
      acquirerGeneration.current += 1;
      void resolveOne("acquirer", query, cik, acquirerGeneration.current);
      return;
    }
    targetGeneration.current += 1;
    void resolveOne("target", query, cik, targetGeneration.current);
  }

  async function startPublicResearch(event) {
    event.preventDefault();
    if (researchLock.current) return;
    if (research.phase === RESEARCH_REQUESTING) return;
    const snapshot = {
      acquirerCik: acquirerConfirmedCik,
      targetCik: targetConfirmedCik,
    };
    if (!snapshot.acquirerCik || !snapshot.targetCik || snapshot.acquirerCik === snapshot.targetCik) return;

    researchLock.current = true;
    researchGeneration.current += 1;
    const generation = researchGeneration.current;
    researchAbort.current?.abort();
    const controller = new AbortController();
    researchAbort.current = controller;
    setResearch({
      phase: RESEARCH_REQUESTING,
      snapshot,
      payload: null,
      localError: null,
    });

    try {
      const result = await requestPublicResearch(snapshot, controller.signal);
      if (researchGeneration.current !== generation) return;
      const currentSnapshot = currentConfirmedSnapshot();
      if (!snapshotEquals(currentSnapshot, snapshot)) return;
      const accepted = validatePublicResearchPayload(result.payload, snapshot);
      if (!accepted.ok) {
        researchLock.current = false;
        setResearch({
          phase: RESEARCH_REQUEST_ERROR,
          snapshot,
          payload: null,
          localError: LOCAL_REQUEST_ERROR_COPY,
        });
        return;
      }
      researchLock.current = false;
      setResearch({
        phase: RESEARCH_RESULT,
        snapshot,
        payload: accepted.payload,
        localError: null,
      });
    } catch (error) {
      if (error && typeof error === "object" && error.name === "AbortError") return;
      if (researchGeneration.current !== generation) return;
      const currentSnapshot = currentConfirmedSnapshot();
      if (!snapshotEquals(currentSnapshot, snapshot)) return;
      researchLock.current = false;
      setResearch({
        phase: RESEARCH_REQUEST_ERROR,
        snapshot,
        payload: null,
        localError: LOCAL_REQUEST_ERROR_COPY,
      });
    }
  }

  function viewPublicResearchResult(event) {
    event.preventDefault();
    const current = currentConfirmedSnapshot();
    if (!current) return;
    if (research.phase !== RESEARCH_RESULT || !research.payload || !research.snapshot) return;
    if (!snapshotEquals(research.snapshot, current)) return;
    const accepted = validatePublicResearchPayload(research.payload, current);
    if (!accepted.ok) return;
    openPublicResearchResult(current, accepted.payload);
  }

  function renderSideResolution(side, state, selectId) {
    if (state.status === RESOLVING) {
      return <p className="mv-deal-entry-side-status">{RESOLVING_COPY}</p>;
    }
    if (state.status === CONFIRMED && state.identity) {
      return (
        <p className="mv-deal-entry-identity">
          {CONFIRMED_COPY} {candidateLabel(state.identity)}
        </p>
      );
    }
    if (state.status === AMBIGUOUS) {
      return (
        <div className="mv-deal-entry-ambiguous">
          <label htmlFor={selectId}>{AMBIGUOUS_COPY}</label>
          <select
            aria-label={side === "acquirer" ? AMBIGUOUS_ACQUIRER_ACCESSIBLE_NAME : AMBIGUOUS_TARGET_ACCESSIBLE_NAME}
            id={selectId}
            onChange={(event) => confirmCandidate(side, event.target.value)}
            value={state.selectedCik}
          >
            <option value="">Select a company</option>
            {state.candidates.map((candidate) => (
              <option key={candidate.cik} value={candidate.cik}>
                {candidateLabel(candidate)}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (state.status === NOT_FOUND) {
      return <p className="mv-deal-entry-side-status">{NOT_FOUND_COPY}</p>;
    }
    if (state.status === SERVICE_UNAVAILABLE) {
      return <p className="mv-deal-entry-side-status">{SERVICE_UNAVAILABLE_COPY}</p>;
    }
    return null;
  }

  function renderResearchFilings(sideLabel, recentFilings) {
    if (!Array.isArray(recentFilings) || recentFilings.length === 0) return null;
    return (
      <table className="mv-deal-entry-filings">
        <caption className="mv-deal-entry-filings-caption">
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
    );
  }

  function renderResearchSide(side, label) {
    const companies = Array.isArray(research.payload?.companies) ? research.payload.companies : null;
    if (!companies) return null;
    const entry = companies.find((item) => item.side === side);
    if (!entry) return null;
    const canonicalName = usableCanonicalName(entry.canonicalName) ? entry.canonicalName.trim() : null;
    return (
      <section className="mv-deal-entry-research-side" data-research-side={side}>
        <h4 className="mv-deal-entry-research-side-title">{label}</h4>
        <p className="mv-deal-entry-research-meta">
          Submissions status: {submissionsStatusCopy(entry.submissionsStatus)} ({entry.submissionsStatus})
        </p>
        {canonicalName ? (
          <p className="mv-deal-entry-research-name">Canonical name: {canonicalName}</p>
        ) : (
          <p className="mv-deal-entry-research-name">Canonical name was not returned by the server.</p>
        )}
        {entry.filingCount == null ? (
          <p className="mv-deal-entry-research-meta">Filing count was not returned by the server.</p>
        ) : (
          <p className="mv-deal-entry-research-meta">Bounded filing count: {entry.filingCount}</p>
        )}
        {renderResearchFilings(label, entry.recentFilings)}
      </section>
    );
  }

  const showResearchRegion = research.phase === RESEARCH_REQUESTING
    || research.phase === RESEARCH_REQUEST_ERROR
    || research.phase === RESEARCH_RESULT
    || (companiesConfirmedForResearch && research.phase === RESEARCH_IDLE);

  return (
    <PublicPage className="mv-deal-entry-page" mainId="mv-deal-entry-main">
      <PublicHero
        eyebrow="Analyze a deal"
        title="Start with the two companies."
        lead="MergeVue begins with the acquirer and target before asking for deeper deal context."
      />

      <PublicSection className="mv-deal-entry" labelledBy="mv-deal-entry-form-title">
        <PublicCard className="mv-deal-entry-card">
          <h2 id="mv-deal-entry-form-title" className="mv-deal-entry-form-title">Deal companies</h2>
          <form className="mv-deal-entry-form" onSubmit={confirmCompanies}>
            <div
              className="mv-deal-entry-status"
              id={statusId}
              role="status"
              aria-live="polite"
            >
              {pageStatus}
            </div>

            <div className="mv-deal-entry-fields">
              <div className="mv-deal-entry-field">
                <label htmlFor={acquirerId}>Acquirer</label>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={sameCompany || undefined}
                  autoComplete="organization"
                  id={acquirerId}
                  onChange={(event) => {
                    setAcquirerName(event.target.value);
                    invalidateSide("acquirer", event.target.value);
                  }}
                  placeholder="Company name"
                  type="text"
                  value={acquirerName}
                />
                {renderSideResolution("acquirer", acquirer, acquirerAmbiguousId)}
              </div>

              <button
                aria-label="Swap acquirer and target"
                className="mv-deal-entry-swap"
                onClick={swapCompanies}
                type="button"
              >
                Swap
              </button>

              <div className="mv-deal-entry-field">
                <label htmlFor={targetId}>Target</label>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={sameCompany || undefined}
                  autoComplete="organization"
                  id={targetId}
                  onChange={(event) => {
                    setTargetName(event.target.value);
                    invalidateSide("target", event.target.value);
                  }}
                  placeholder="Company name"
                  type="text"
                  value={targetName}
                />
                {renderSideResolution("target", target, targetAmbiguousId)}
              </div>
            </div>

            {error ? (
              <p className="mv-deal-entry-error" id={errorId} role="alert">{error}</p>
            ) : null}

            {showResearchRegion ? (
              <section
                aria-busy={research.phase === RESEARCH_REQUESTING}
                aria-labelledby={researchHeadingId}
                className="mv-deal-entry-research"
                data-research-phase={research.phase}
              >
                <h3 className="mv-deal-entry-research-title" id={researchHeadingId}>
                  Public-source SEC research
                </h3>
                {research.phase === RESEARCH_IDLE ? (
                  <>
                    <p className="mv-deal-entry-research-copy">{RESEARCH_SCOPE_COPY}</p>
                    <p className="mv-deal-entry-research-copy">{RESEARCH_NOT_ASSESSMENT_COPY}</p>
                  </>
                ) : null}
                {research.phase === RESEARCH_REQUESTING ? (
                  <p className="mv-deal-entry-research-copy">{RESEARCHING_COPY}</p>
                ) : null}
                {research.phase === RESEARCH_REQUEST_ERROR ? (
                  <p className="mv-deal-entry-research-copy">{research.localError || LOCAL_REQUEST_ERROR_COPY}</p>
                ) : null}
                {research.phase === RESEARCH_RESULT && research.payload ? (
                  <>
                    <p className="mv-deal-entry-research-copy">
                      {researchHeadline(research.payload.researchStatus)}
                    </p>
                    <p className="mv-deal-entry-research-meta">
                      Research status: {research.payload.researchStatus}
                    </p>
                    <p className="mv-deal-entry-research-meta">
                      Coverage: recent filing history only ({research.payload.coverage})
                    </p>
                    <p className="mv-deal-entry-research-meta">
                      Identity source: SEC submissions API ({research.payload.identitySource})
                    </p>
                    <p className="mv-deal-entry-research-copy">{RESEARCH_NOT_ASSESSMENT_COPY}</p>
                    <div className="mv-deal-entry-research-sides">
                      {renderResearchSide("acquirer", "Acquirer")}
                      {renderResearchSide("target", "Target")}
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}

            <div className="mv-deal-entry-actions">
              <button
                className="mv-public-button mv-public-button-primary"
                disabled={!confirmEnabled}
                type="submit"
              >
                Confirm companies
              </button>
              <button
                aria-describedby={describedBy}
                className="mv-public-button mv-public-button-primary mv-deal-entry-analyze"
                disabled={!analyzeEnabled}
                onClick={startPublicResearch}
                type="button"
              >
                Analyze this deal
              </button>
              {canViewPublicResearchResult ? (
                <button
                  className="mv-public-button mv-public-button-primary"
                  onClick={viewPublicResearchResult}
                  type="button"
                >
                  {VIEW_PUBLIC_RESEARCH_RESULT_COPY}
                </button>
              ) : null}
            </div>
          </form>
        </PublicCard>
      </PublicSection>
    </PublicPage>
  );
}
