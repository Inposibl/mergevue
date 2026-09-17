import React from "react";
import { handleRouteClick } from "../../routes/navigation.js";
import { PublicButton } from "../../ui/public/PublicButton.jsx";
import { PublicCard } from "../../ui/public/PublicCard.jsx";
import { PublicHero } from "../../ui/public/PublicHero.jsx";
import { PublicPage } from "../../ui/public/PublicPage.jsx";
import { PublicSection } from "../../ui/public/PublicSection.jsx";
import { PublicTrustItem } from "../../ui/public/PublicTrustItem.jsx";
import "../../styles/public-home.css";

const PRIMARY_CTA_HREF = "/start-diagnostic/deal-context";

const SECONDARY_LINKS = Object.freeze([
  Object.freeze({
    label: "Read methodology",
    href: "/about-methodology",
    note: "How MergeVue reads organizational interaction.",
  }),
  Object.freeze({
    label: "View historical cases",
    href: "/case-studies",
    note: "Retrospective reconstructions of completed transactions.",
  }),
  Object.freeze({
    label: "View interaction environments",
    href: "/environments",
    note: "The nine public operating-environment descriptions.",
  }),
]);

export function HomeScreen() {
  return (
    <PublicPage className="mv-home-page" mainId="mv-home-main">
      <PublicHero
        eyebrow="M&A Organizational Risk Intelligence"
        title="Test the organizational assumptions behind the deal."
        lead="Financial and legal diligence can validate the transaction. MergeVue tests whether the organizations can actually operate in the way the deal thesis requires."
      >
        <p>
          After close, the operating environments of the acquirer and target are forced to work together.
          MergeVue examines how those organizations make decisions, allocate authority, protect resources, and handle conflict.
        </p>
        <p>
          It turns evidence-supported risk mechanisms into time-checkable forecasts.
          It is not a culture-fit tool, a personality test, or a predictor of deal success.
        </p>
        <p className="mv-home-closing">No account. No card.</p>
      </PublicHero>

      <PublicSection className="mv-home-start" labelledBy="mv-home-start-title">
        <PublicCard className="mv-home-start-card">
          <div className="mv-home-start-copy">
            <p className="mv-public-eyebrow">Current public start</p>
            <h2 id="mv-home-start-title">Start with a real deal</h2>
            <p>
              Begin with the existing public diagnostic sequence for the deal you are examining.
              Public-source research is not the live entry.
            </p>
          </div>
          <div className="mv-home-start-actions">
            <PublicButton href={PRIMARY_CTA_HREF} onClick={handleRouteClick(PRIMARY_CTA_HREF)}>
              Analyze a deal
            </PublicButton>
            <p className="mv-home-start-note">No account required.</p>
          </div>
          <ul className="mv-home-trust-list" aria-label="Existing public surfaces">
            {SECONDARY_LINKS.map((item) => (
              <PublicTrustItem
                href={item.href}
                key={item.href}
                label={item.label}
                onClick={handleRouteClick(item.href)}
              >
                {item.note}
              </PublicTrustItem>
            ))}
          </ul>
        </PublicCard>
      </PublicSection>
    </PublicPage>
  );
}
