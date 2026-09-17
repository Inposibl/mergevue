import React from "react";
import { LegacySiteSidebar } from "./LegacySiteSidebar.jsx";
import { ROUTE_SHELL_IDS } from "./routeShell.js";

export function ApplicationShell({ shellId, screen, children, skipNavigation = null }) {
  if (shellId === ROUTE_SHELL_IDS.STANDALONE) return children;

  return (
    <>
      {skipNavigation}
      <LegacySiteSidebar screen={screen} />
      {children}
    </>
  );
}
