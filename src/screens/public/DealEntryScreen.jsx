import React, { useId, useState } from "react";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicHero } from "../../ui/public/PublicHero.jsx";
import { PublicPage } from "../../ui/public/PublicPage.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
import "../../styles/public-deal-entry.css";

export const DIFFERENT_COMPANY_ERROR = "Acquirer and target must be different companies.";
const CAPABILITY_NOTE = "The deal-entry surface is ready, but public company resolution and public-source analysis are not yet connected to this entry.";

function normalizedCompanyName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function DealEntryScreen() {
  const acquirerId = useId();
  const targetId = useId();
  const errorId = useId();
  const noteId = useId();
  const [acquirerName, setAcquirerName] = useState("");
  const [targetName, setTargetName] = useState("");

  const bothFilled = Boolean(acquirerName.trim() && targetName.trim());
  const sameCompany = bothFilled && normalizedCompanyName(acquirerName) === normalizedCompanyName(targetName);
  const locallyValid = bothFilled && !sameCompany;
  const error = sameCompany ? DIFFERENT_COMPANY_ERROR : "";
  const describedBy = error ? errorId : (locallyValid ? noteId : undefined);

  function swapCompanies() {
    setAcquirerName(targetName);
    setTargetName(acquirerName);
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
          <form className="mv-deal-entry-form" onSubmit={(event) => event.preventDefault()}>
            <div className="mv-deal-entry-fields">
              <div className="mv-deal-entry-field">
                <label htmlFor={acquirerId}>Acquirer</label>
                <input
                  aria-describedby={describedBy}
                  aria-invalid={sameCompany || undefined}
                  autoComplete="organization"
                  id={acquirerId}
                  onChange={(event) => setAcquirerName(event.target.value)}
                  placeholder="Company name"
                  type="text"
                  value={acquirerName}
                />
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
                  onChange={(event) => setTargetName(event.target.value)}
                  placeholder="Company name"
                  type="text"
                  value={targetName}
                />
              </div>
            </div>

            {error ? (
              <p className="mv-deal-entry-error" id={errorId} role="alert">{error}</p>
            ) : null}

            {locallyValid ? (
              <p className="mv-deal-entry-capability" id={noteId}>
                {CAPABILITY_NOTE}
              </p>
            ) : null}

            <div className="mv-deal-entry-actions">
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
