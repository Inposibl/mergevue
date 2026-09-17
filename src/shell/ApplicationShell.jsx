import React from "react";
import { LegacySiteSidebar } from "./LegacySiteSidebar.jsx";
import { ROUTE_SHELL_IDS } from "./routeShell.js";

export function ApplicationShell({ shellId, screen, children }) {
  if (shellId === ROUTE_SHELL_IDS.STANDALONE) return children;

  return (
    <>
      <LegacySiteSidebar screen={screen} />
      {children}
    </>
  );
}
