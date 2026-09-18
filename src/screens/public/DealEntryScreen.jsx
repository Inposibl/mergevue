import React, { useId, useRef, useState } from "react";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicHero } from "../../ui/public/PublicHero.jsx";
import { PublicPage } from "../../ui/public/PublicPage.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
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
export const RESEARCH_NOT_CONNECTED_COPY = "Companies confirmed. Public-source analysis is not connected in this step yet.";
export const RESOLVE_COMPANY_PATH = "/api/resolve-company";

const EMPTY = "EMPTY";
const EDITING = "EDITING";
const RESOLVING = "RESOLVING";
const CONFIRMED = "CONFIRMED";
const AMBIGUOUS = "AMBIGUOUS";
const NOT_FOUND = "NOT_FOUND";
const SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";

function normalizedCompanyName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function emptySide() {
  return {
    status: EMPTY,
    identity: null,
    candidates: [],
    selectedCik: "",
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
  const [acquirerName, setAcquirerName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [acquirer, setAcquirer] = useState(emptySide);
  const [target, setTarget] = useState(emptySide);
  const acquirerAbort = useRef(null);
  const targetAbort = useRef(null);
  const acquirerGeneration = useRef(0);
  const targetGeneration = useRef(0);

  const bothFilled = Boolean(acquirerName.trim() && targetName.trim());
  const sameTypedCompany = bothFilled && normalizedCompanyName(acquirerName) === normalizedCompanyName(targetName);
  const sameResolvedCompany = Boolean(
    acquirer.status === CONFIRMED
    && target.status === CONFIRMED
    && acquirer.identity
    && target.identity
    && acquirer.identity.cik === target.identity.cik,
  );
  const companiesConfirmedForResearch = acquirer.status === CONFIRMED
    && target.status === CONFIRMED
    && Boolean(acquirer.identity && target.identity)
    && acquirer.identity.cik !== target.identity.cik;
  const resolving = acquirer.status === RESOLVING || target.status === RESOLVING;
  const sameCompany = sameResolvedCompany || (sameTypedCompany && acquirer.status !== CONFIRMED && target.status !== CONFIRMED);
  const error = sameCompany ? DIFFERENT_COMPANY_ERROR : "";
  const confirmEnabled = bothFilled && !resolving;

  const pageStatus = resolving
    ? RESOLVING_COPY
    : sameResolvedCompany
      ? DIFFERENT_COMPANY_ERROR
      : companiesConfirmedForResearch
        ? RESEARCH_NOT_CONNECTED_COPY
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

  function invalidateSide(side, nextValue) {
    const trimmed = nextValue.trim();
    if (side === "acquirer") acquirerGeneration.current += 1;
    else targetGeneration.current += 1;
    const abortRef = side === "acquirer" ? acquirerAbort : targetAbort;
    abortRef.current?.abort();
    abortRef.current = null;
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
    void resolveOne("acquirer", acquirerQuery, undefined, acquirerGen);
    void resolveOne("target", targetQuery, undefined, targetGen);
  }

  function confirmCandidate(side, cik) {
    const query = side === "acquirer" ? acquirerName.trim() : targetName.trim();
    if (!query || !cik) return;
    if (side === "acquirer") {
      acquirerGeneration.current += 1;
      void resolveOne("acquirer", query, cik, acquirerGeneration.current);
      return;
    }
    targetGeneration.current += 1;
    void resolveOne("target", query, cik, targetGeneration.current);
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
                className="mv-public-button mv-public-button-primary"
                disabled
                type="button"
              >
                Analyze this deal
              </button>
            </div>
          </form>
        </PublicCard>
      </PublicSection>
    </PublicPage>
  );
}
