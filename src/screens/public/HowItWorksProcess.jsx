import React from "react";
import { handleRouteClick } from "../../routes/navigation.js";
import { PublicButton } from "../../ui/public/PublicButton.jsx";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
import "../../styles/public-methodology.css";

const PRIMARY_CTA_HREF = "/start-diagnostic/deal-context";
const METHODOLOGY_HREF = "/about-methodology/overview";
const CASES_HREF = "/case-studies";

const STEPS = Object.freeze([
  Object.freeze({
    number: 1,
    title: "Start with a real deal",
    provide: "The acquirer and target.",
    does: "Resolves the companies and begins public-source research.",
    receive: "A public analysis of material organizational questions.",
    trust: "No account required to begin.",
  }),
  Object.freeze({
    number: 2,
    title: "See what the public evidence supports",
    provide: "Only minimal deal context if it is needed to disambiguate the transaction.",
    does: "Separates public facts, evidence, contradictions, and unresolved questions.",
    receive: "A structured view of what deserves further diligence.",
  }),
  Object.freeze({
    number: 3,
    title: "Add internal observations only where they matter",
    provide: "Structured observations or respondent input tied to unresolved questions.",
    does: "Uses the canonical organizational instruments without rewriting or reordering them.",
    receive: "A better-supported organizational reading.",
  }),
  Object.freeze({
    number: 4,
    title: "Use private evidence for deeper analysis",
    paid: true,
    provide: "Relevant private documents and deal context within the paid engagement.",
    does: "Reconciles public and private evidence and preserves contradictions.",
    receive: "A deeper analysis of the material deal assumptions.",
  }),
  Object.freeze({
    number: 5,
    title: "Add individual data only when needed",
    condition: "A specific-leader forecast is requested.",
    trigger: "specific-leader forecast requested → 42Q required",
    provide: "42Q data for that specific leader.",
    does: "Uses the individual channel as an internal input to the behavioral forecast.",
    receive: "A role- and deal-specific behavioral forecast — not a personality label.",
  }),
  Object.freeze({
    number: 6,
    title: "Lock the forecast",
    does: "Issues a time-bound forecast after the required quality gates.",
    receive: "A forecast with observable signs, timing, evidence basis, limitations, and conditions that would weaken or falsify it.",
  }),
  Object.freeze({
    number: 7,
    title: "Verify what happened",
    provide: "Outcome evidence when the forecast window is due.",
    does: "Compares the locked forecast with observed outcomes.",
    receive: "A recorded verification result.",
    verification: Object.freeze([
      "Confirmed",
      "Partially confirmed",
      "Not determinable",
      "Missed",
      "Falsified",
    ]),
  }),
]);

function Field({ label, children }) {
  return (
    <p className="mv-how-field">
      <span className="mv-how-field-label">{label}</span>
      <span className="mv-how-field-value">{children}</span>
    </p>
  );
}

export function HowItWorksProcess() {
  return (
    <PublicSection className="mv-how-process" labelledBy="mv-how-title">
      <header className="mv-how-header">
        <p className="mv-how-eyebrow">How MergeVue works</p>
        <h2 id="mv-how-title">The full MergeVue workflow</h2>
        <p className="mv-how-disclosure">
          This is the full MergeVue workflow.
          The current public entry still begins with the existing diagnostic; public-source research is not yet the live entry.
        </p>
      </header>

      <ol className="mv-how-steps">
        {STEPS.map((step) => (
          <li className="mv-how-step" key={step.number}>
            <PublicCard className="mv-how-step-card">
              <div className="mv-how-step-meta">
                <p className="mv-how-step-number">{step.number}</p>
                {step.paid ? <p className="mv-how-paid">Paid engagement</p> : null}
              </div>
              <h3 className="mv-how-step-title">{step.title}</h3>
              {step.condition ? (
                <p className="mv-how-condition">
                  <span className="mv-how-field-label">When</span>
                  <span className="mv-how-field-value">{step.condition}</span>
                </p>
              ) : null}
              {step.trigger ? <p className="mv-how-trigger">{step.trigger}</p> : null}
              {step.provide ? <Field label="You provide">{step.provide}</Field> : null}
              {step.does ? <Field label="MergeVue does">{step.does}</Field> : null}
              {step.receive ? <Field label="You receive">{step.receive}</Field> : null}
              {step.trust ? <p className="mv-how-trust">{step.trust}</p> : null}
              {step.verification ? (
                <p className="mv-how-verification">
                  <span className="mv-how-field-label">Verification results</span>
                  <span className="mv-how-field-value">{step.verification.join("; ")}.</span>
                </p>
              ) : null}
            </PublicCard>
          </li>
        ))}
      </ol>

      <div className="mv-how-actions">
        <PublicButton href={PRIMARY_CTA_HREF} onClick={handleRouteClick(PRIMARY_CTA_HREF)}>
          Analyze a deal
        </PublicButton>
        <PublicButton
          className="mv-how-secondary"
          href={METHODOLOGY_HREF}
          onClick={handleRouteClick(METHODOLOGY_HREF)}
          variant="secondary"
        >
          Read the methodology
        </PublicButton>
        <a className="mv-how-tertiary" href={CASES_HREF} onClick={handleRouteClick(CASES_HREF)}>
          Historical cases
        </a>
      </div>
    </PublicSection>
  );
}
