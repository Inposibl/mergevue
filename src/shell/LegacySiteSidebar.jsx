import React from "react";
import { handleRouteClick } from "../routes/navigation.js";

export const SIDEBAR_NAV_ITEMS = Object.freeze([
  Object.freeze({ label: "Home", route: "/home", section: "home" }),
  Object.freeze({ label: "About Methodology", route: "/about-methodology", section: "methodology" }),
  Object.freeze({ label: "The 9 Interaction Environments", route: "/environments", section: "environments" }),
  Object.freeze({ label: "Case Studies", route: "/case-studies", section: "case-studies" }),
  Object.freeze({ label: "Start Diagnostic", route: "/start-diagnostic/before-you-begin", section: "diagnostic" }),
]);

export function LegacySiteSidebar({ screen }) {
  const activeSection = screen?.navigationSection ?? "";

  return (
    <aside className="site-sidebar" aria-label="Primary navigation">
      <a className="sidebar-header" href="/home" onClick={handleRouteClick("/home")}>
        <strong>MergeVue</strong>
        <span>Diagnostic</span>
      </a>
      <nav className="sidebar-nav" aria-label="Site sections">
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <a
            aria-current={activeSection === item.section ? "page" : undefined}
            className={activeSection === item.section ? "active" : ""}
            href={item.route}
            key={item.route}
            onClick={handleRouteClick(item.route)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
