import React from "react";

export function PublicCard({ children, className = "" }) {
  return <div className={["mv-public-card", className].filter(Boolean).join(" ")}>{children}</div>;
}
